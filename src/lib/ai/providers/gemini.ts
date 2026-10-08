import { AIProvider, AnalyzeClusterInput, AnalyzedStoryOutput, SynthesizeWeeklyInput } from './base';
import { WeeklyReport } from '@/types/report';
import { buildStoryAnalysisSystemPrompt, buildStoryAnalysisUserPrompt } from '../prompts/story-analysis';
import { buildWeeklySynthesisSystemPrompt, buildWeeklySynthesisUserPrompt } from '../prompts/weekly-synthesis';
import { SimulatorAIProvider } from './simulator';

export class GeminiProvider implements AIProvider {
  name = 'Google Gemini';
  model = 'gemini-1.5-pro';
  private apiKey: string | null;
  private fallback: SimulatorAIProvider;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || null;
    this.fallback = new SimulatorAIProvider();
  }

  async analyzeStory(input: AnalyzeClusterInput): Promise<AnalyzedStoryOutput> {
    if (!this.apiKey) {
      console.warn('[GeminiProvider] GEMINI_API_KEY not set. Using simulator fallback.');
      return this.fallback.analyzeStory(input);
    }

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${this.apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: buildStoryAnalysisSystemPrompt() }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: buildStoryAnalysisUserPrompt(input) }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API returned ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return JSON.parse(rawText) as AnalyzedStoryOutput;
    } catch (err) {
      console.error('[GeminiProvider] Story analysis failed, falling back to simulator:', err);
      return this.fallback.analyzeStory(input);
    }
  }

  async synthesizeWeeklyReport(input: SynthesizeWeeklyInput): Promise<WeeklyReport> {
    if (!this.apiKey) {
      return this.fallback.synthesizeWeeklyReport(input);
    }

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${this.apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: buildWeeklySynthesisSystemPrompt() }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: buildWeeklySynthesisUserPrompt(input) }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API returned ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(rawText);
      const fallbackReport = await this.fallback.synthesizeWeeklyReport(input);
      return {
        ...fallbackReport,
        ...parsed,
        id: `rep-${input.year}-${input.weekNumber}`,
        year: input.year,
        weekNumber: input.weekNumber,
        startDate: input.startDate,
        endDate: input.endDate,
        curatedStories: input.stories,
        curatedStoryCount: input.stories.length,
        isPublished: true,
        publishedAt: new Date().toISOString(),
        generatedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.error('[GeminiProvider] Weekly synthesis failed, falling back to simulator:', err);
      return this.fallback.synthesizeWeeklyReport(input);
    }
  }
}
