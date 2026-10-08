import { AIProvider, AnalyzeClusterInput, AnalyzedStoryOutput, SynthesizeWeeklyInput } from './base';
import { WeeklyReport } from '@/types/report';
import { buildStoryAnalysisSystemPrompt, buildStoryAnalysisUserPrompt } from '../prompts/story-analysis';
import { buildWeeklySynthesisSystemPrompt, buildWeeklySynthesisUserPrompt } from '../prompts/weekly-synthesis';
import { SimulatorAIProvider } from './simulator';

export class AnthropicProvider implements AIProvider {
  name = 'Anthropic Claude';
  model = 'claude-3-5-sonnet-20241022';
  private apiKey: string | null;
  private fallback: SimulatorAIProvider;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || null;
    this.fallback = new SimulatorAIProvider();
  }

  async analyzeStory(input: AnalyzeClusterInput): Promise<AnalyzedStoryOutput> {
    if (!this.apiKey) {
      console.warn('[AnthropicProvider] ANTHROPIC_API_KEY not set. Using simulator fallback.');
      return this.fallback.analyzeStory(input);
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 3000,
          system: buildStoryAnalysisSystemPrompt(),
          messages: [
            {
              role: 'user',
              content: buildStoryAnalysisUserPrompt(input) + '\n\nRespond with ONLY valid raw JSON without markdown code fences.',
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API returned ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const rawText = data.content?.[0]?.text;
      const cleanJson = rawText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
      return JSON.parse(cleanJson) as AnalyzedStoryOutput;
    } catch (err) {
      console.error('[AnthropicProvider] Story analysis failed, falling back to simulator:', err);
      return this.fallback.analyzeStory(input);
    }
  }

  async synthesizeWeeklyReport(input: SynthesizeWeeklyInput): Promise<WeeklyReport> {
    if (!this.apiKey) {
      return this.fallback.synthesizeWeeklyReport(input);
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 4096,
          system: buildWeeklySynthesisSystemPrompt(),
          messages: [
            {
              role: 'user',
              content: buildWeeklySynthesisUserPrompt(input) + '\n\nRespond with ONLY valid raw JSON without markdown code fences.',
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API returned ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const rawText = data.content?.[0]?.text;
      const cleanJson = rawText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
      const parsed = JSON.parse(cleanJson);
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
      console.error('[AnthropicProvider] Weekly synthesis failed, falling back to simulator:', err);
      return this.fallback.synthesizeWeeklyReport(input);
    }
  }
}
