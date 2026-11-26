import { createGateway } from '@ai-sdk/gateway';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';

export function getAIModel() {
  // Default to DeepSeek v4.1 Flash via Vercel AI Gateway
  const modelId = process.env.AI_MODEL || 'deepseek/deepseek-v4.1-flash';
  
  // On Vercel, OIDC is used automatically
  // Locally, use AI_GATEWAY_API_KEY
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  
  const gateway = createGateway({
    apiKey,
  });
  
  return gateway(modelId);
}

export async function generateAIText(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const model = getAIModel();

  const { text } = await generateText({
    model,
    prompt,
    system: systemPrompt,
  });

  return text;
}

export async function generateAIObject<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  systemPrompt?: string
): Promise<T> {
  const model = getAIModel();

  try {
    // Try structured output with generateObject
    const { object } = await generateObject({
      model,
      prompt,
      schema,
      system: systemPrompt,
      mode: 'json',
    });

    return object;
  } catch (error) {
    // Fallback: use JSON-mode prompting + manual parse
    console.warn('Structured output failed, falling back to JSON prompting', error);
    
    const jsonPrompt = `${prompt}\n\nReturn ONLY valid JSON matching this structure. Do not include any explanations or markdown formatting.`;
    
    const { text } = await generateText({
      model,
      prompt: jsonPrompt,
      system: systemPrompt,
    });

    // Parse and validate with retry
    try {
      const json = JSON.parse(text);
      return schema.parse(json);
    } catch (parseError) {
      // Retry once with cleaner extraction
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const json = JSON.parse(jsonMatch[0]);
        return schema.parse(json);
      }
      throw parseError;
    }
  }
}

export function isAIConfigured(): boolean {
  // On Vercel, OIDC is automatic, so always configured
  // Locally, check for API key
  if (process.env.VERCEL) {
    return true;
  }
  return !!process.env.AI_GATEWAY_API_KEY;
}
