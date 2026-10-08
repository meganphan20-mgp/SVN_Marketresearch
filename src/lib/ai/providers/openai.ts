import { AIProvider, AnalyzeClusterInput, AnalyzedStoryOutput, SynthesizeWeeklyInput } from './base';
import { WeeklyReport } from '@/types/report';
import { buildStoryAnalysisSystemPrompt, buildStoryAnalysisUserPrompt } from '../prompts/story-analysis';
import { buildWeeklySynthesisSystemPrompt, buildWeeklySynthesisUserPrompt } from '../prompts/weekly-synthesis';
import { SimulatorAIProvider } from './simulator';

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI';
  model = 'gpt-4o';
  private apiKey: string | null;
  private fallback: SimulatorAIProvider;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || null;
    this.fallback = new SimulatorAIProvider();
  }

  async analyzeStory(input: AnalyzeClusterInput): Promise<AnalyzedStoryOutput> {
    if (!this.apiKey) {
      console.warn('[OpenAIProvider] OPENAI_API_KEY not set. Using simulator fallback.');
      return this.fallback.analyzeStory(input);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          response_format: { type: 'json_object' },
          temperature: 0.2,
          messages: [
            { role: 'system', content: buildStoryAnalysisSystemPrompt() },
            { role: 'user', content: buildStoryAnalysisUserPrompt(input) },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API returned ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      return JSON.parse(content) as AnalyzedStoryOutput;
    } catch (err) {
      console.error('[OpenAIProvider] Story analysis failed, falling back to simulator:', err);
      return this.fallback.analyzeStory(input);
    }
  }

  async synthesizeWeeklyReport(input: SynthesizeWeeklyInput): Promise<WeeklyReport> {
    if (!this.apiKey) {
      return this.fallback.synthesizeWeeklyReport(input);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          response_format: { type: 'json_object' },
          temperature: 0.3,
          messages: [
            { role: 'system', content: buildWeeklySynthesisSystemPrompt() },
            { role: 'user', content: buildWeeklySynthesisUserPrompt(input) },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API returned ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      const parsed = JSON.parse(content);
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
      console.error('[OpenAIProvider] Weekly synthesis failed, falling back to simulator:', err);
      return this.fallback.synthesizeWeeklyReport(input);
    }
  }
}
