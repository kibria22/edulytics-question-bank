import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateAIObject, isAIConfigured } from '@/lib/ai/provider';
import { getOptionKey } from '@/lib/utils/question.utils';

export const dynamic = 'force-dynamic';

const questionSchema = z.object({
  stem: z.string(),
  options: z
    .array(
      z.object({
        key: z.string(),
        text: z.string(),
      })
    )
    .optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  marks: z.number().optional(),
});

const questionsArraySchema = z.object({
  questions: z.array(questionSchema),
});

export async function POST(request: Request) {
  try {
    if (!isAIConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI provider not configured',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { type, count, difficulty, language } = body;

    const prompt = `Generate ${count} ${difficulty} ${type} questions in ${language === 'bn' ? 'Bengali' : 'English'} language about mathematics (real numbers topic).
    
${type === 'mcq' ? `Each MCQ should have 4 options with keys ${language === 'bn' ? 'ক, খ, গ, ঘ' : 'a, b, c, d'}.` : ''}

Return a JSON object with a "questions" array. Each question should have:
- stem (string): the question text
${type === 'mcq' ? '- options (array): 4 options with key and text fields' : ''}
- difficulty (string): "${difficulty}"
- marks (number): appropriate marks for the question type

Use LaTeX math syntax with $ delimiters for mathematical expressions.`;

    try {
      const result = await generateAIObject<z.infer<typeof questionsArraySchema>>(
        prompt,
        questionsArraySchema
      );

      return NextResponse.json({
        success: true,
        questions: result.questions,
      });
    } catch (aiError) {
      console.error('AI generation error:', aiError);
      
      // Fallback: return mock data if AI fails
      const mockQuestions = Array.from({ length: Math.min(count, 3) }, (_, i) => ({
        stem:
          language === 'bn'
            ? `নমুনা প্রশ্ন ${i + 1}: কোনটি মূলদ সংখ্যা?`
            : `Sample Question ${i + 1}: Which is a rational number?`,
        options:
          type === 'mcq'
            ? Array.from({ length: 4 }, (_, j) => ({
                key: getOptionKey(j, language),
                text:
                  language === 'bn'
                    ? `বিকল্প ${getOptionKey(j, language)}`
                    : `Option ${getOptionKey(j, language)}`,
              }))
            : undefined,
        difficulty,
        marks: type === 'mcq' ? 1 : 5,
      }));

      return NextResponse.json({
        success: true,
        questions: mockQuestions,
        warning: 'Using sample data due to AI generation issue',
      });
    }
  } catch (error) {
    console.error('Error in AI generate endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate questions',
      },
      { status: 500 }
    );
  }
}
