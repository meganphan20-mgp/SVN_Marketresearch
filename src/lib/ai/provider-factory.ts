import { AIProvider } from './providers/base';
import { OpenAIProvider } from './providers/openai';
import { GeminiProvider } from './providers/gemini';
import { AnthropicProvider } from './providers/anthropic';
import { SimulatorAIProvider } from './providers/simulator';

export type AIProviderType = 'openai' | 'gemini' | 'anthropic' | 'simulator';

export function getActiveAiProvider(): AIProvider {
  const chosen = (process.env.AI_PROVIDER || 'openai').toLowerCase().trim() as AIProviderType;

  switch (chosen) {
    case 'gemini':
      return new GeminiProvider();
    case 'anthropic':
      return new AnthropicProvider();
    case 'simulator':
      return new SimulatorAIProvider();
    case 'openai':
    default:
      return new OpenAIProvider();
  }
}
