import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject, generateText } from 'ai';

export type AIProvider = 'openai' | 'anthropic' | 'google';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
}

export function getAIConfig(): AIConfig | null {
  const provider = (process.env.AI_PROVIDER || 'openai') as AIProvider;

  let apiKey: string | undefined;
  switch (provider) {
    case 'openai':
      apiKey = process.env.OPENAI_API_KEY;
      break;
    case 'anthropic':
      apiKey = process.env.ANTHROPIC_API_KEY;
      break;
    case 'google':
      apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      break;
  }

  if (!apiKey) {
    return null;
  }

  return { provider, apiKey };
}

export function getAIModel() {
  const config = getAIConfig();
  if (!config) {
    return null;
  }

  switch (config.provider) {
    case 'openai':
      const openai = createOpenAI({ apiKey: config.apiKey });
      return openai('gpt-4o');
    case 'anthropic':
      const anthropic = createAnthropic({ apiKey: config.apiKey });
      return anthropic('claude-3-5-sonnet-20241022');
    case 'google':
      const google = createGoogleGenerativeAI({ apiKey: config.apiKey });
      return google('gemini-1.5-pro');
    default:
      return null;
  }
}

export async function generateAIText(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const model = getAIModel();
  if (!model) {
    throw new Error('AI provider not configured');
  }

  const { text } = await generateText({
    model,
    prompt,
    system: systemPrompt,
  });

  return text;
}

export async function generateAIObject<T>(
  prompt: string,
  schema: any,
  systemPrompt?: string
): Promise<T> {
  const model = getAIModel();
  if (!model) {
    throw new Error('AI provider not configured');
  }

  const { object } = await generateObject({
    model,
    prompt,
    schema,
    system: systemPrompt,
  });

  return object as T;
}

export function isAIConfigured(): boolean {
  return getAIConfig() !== null;
}
