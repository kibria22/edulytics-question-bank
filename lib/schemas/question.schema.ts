import { z } from 'zod';

export const questionTypeSchema = z.enum([
  'mcq',
  'cq',
  'sq',
  'tf',
  'fill',
  'short',
  'long',
  'practical',
  'other',
]);

export const mcqKindSchema = z.enum(['single', 'multi_statement', 'situation_based']);

export const difficultySchema = z.enum(['easy', 'medium', 'hard']);

export const languageSchema = z.enum(['bn', 'en', 'ar']);

export const questionOptionSchema = z.object({
  key: z.string().min(1),
  text: z.string().min(1),
});

export const questionStatementSchema = z.object({
  key: z.string().min(1),
  text: z.string().min(1),
});

export const questionPartSchema = z.object({
  key: z.string().min(1),
  prompt: z.string().min(1),
  marks: z.number().optional(),
});

export const questionMediaSchema = z.object({
  kind: z.enum(['image', 'table', 'svg']),
  key: z.string().min(1),
  alt: z.string().optional(),
  page: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const questionSourceSchema = z.object({
  sourceId: z.string().min(1),
  type: z.literal('copied'),
  board: z.string().optional(),
  year: z.number().optional(),
  page: z.string().optional(),
  ref: z.string().optional(),
});

export const questionFormSchema = z
  .object({
    type: questionTypeSchema,
    language: languageSchema,
    stem: z.string().min(1, 'Question stem is required'),
    stimulus: z.string().optional(),
    options: z.array(questionOptionSchema).optional(),
    statements: z.array(questionStatementSchema).optional(),
    mcqKind: mcqKindSchema.optional(),
    groupId: z.string().optional(),
    groupOrder: z.number().optional(),
    parts: z.array(questionPartSchema).optional(),
    marks: z.number().optional(),
    difficulty: difficultySchema.optional(),
    countryId: z.string().optional(),
    boardId: z.string().optional(),
    versionId: z.string().optional(),
    levelId: z.string().optional(),
    levelIds: z.array(z.string()).optional(),
    subjectId: z.string().optional(),
    chapterId: z.string().optional(),
    subchapterId: z.string().optional(),
    topicIds: z.array(z.string()).max(5).optional(),
    primaryTopicId: z.string().optional(),
    translationOf: z.string().optional(),
    derivedFrom: z.string().optional(),
    institutionId: z.string().optional(),
    campusId: z.string().optional(),
    media: z.array(questionMediaSchema).optional(),
    sources: z.array(questionSourceSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'mcq') {
        return !!data.mcqKind;
      }
      return true;
    },
    {
      message: 'mcqKind is required for MCQ questions',
      path: ['mcqKind'],
    }
  )
  .refine(
    (data) => {
      if (data.mcqKind === 'multi_statement') {
        return data.statements && data.statements.length > 0;
      }
      return true;
    },
    {
      message: 'statements are required for multi_statement MCQs',
      path: ['statements'],
    }
  )
  .refine(
    (data) => {
      if (data.primaryTopicId) {
        return data.topicIds && data.topicIds.includes(data.primaryTopicId);
      }
      return true;
    },
    {
      message: 'primaryTopicId must be in topicIds',
      path: ['primaryTopicId'],
    }
  )
  .refine(
    (data) => {
      if (data.campusId) {
        return !!data.institutionId;
      }
      return true;
    },
    {
      message: 'institutionId is required when campusId is set',
      path: ['campusId'],
    }
  );

export type QuestionFormValues = z.infer<typeof questionFormSchema>;
