import { ObjectId } from 'mongodb';

export type Language = 'bn' | 'en' | 'ar';

export type CurriculumNodeType =
  | 'country'
  | 'board'
  | 'version'
  | 'level'
  | 'group'
  | 'subject'
  | 'chapter'
  | 'subchapter'
  | 'topic';

export interface LocalizedText {
  bn: string;
  en: string;
  ar?: string;
}

export interface BookHeading {
  number?: string;
  title?: string;
  raw?: string;
}

export interface CurriculumNode {
  _id: ObjectId;
  type: CurriculumNodeType;
  parentId?: ObjectId;
  ancestors: ObjectId[];
  code: string;
  name: LocalizedText;
  order: number;
  summary?: {
    bn?: string;
    en?: string;
  };
  summarySource?: string;
  learningOutcomes?: {
    bn?: string[];
    en?: string[];
    source?: string;
  };
  bookHeading?: BookHeading;
  meta?: {
    importKey?: string;
    sourcePage?: string;
    [key: string]: any;
  };
  isActive: boolean;
}

export type QuestionType =
  | 'mcq'
  | 'cq'
  | 'sq'
  | 'tf'
  | 'fill'
  | 'short'
  | 'long'
  | 'practical'
  | 'other';

export type MCQKind = 'single' | 'multi_statement' | 'situation_based';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuestionOption {
  key: string;
  text: string;
}

export interface QuestionStatement {
  key: string;
  text: string;
}

export interface QuestionPart {
  key: string;
  prompt: string;
  marks?: number;
}

export interface QuestionMedia {
  kind: 'image' | 'table' | 'svg';
  key: string;
  alt?: string;
  page?: string;
  width?: number;
  height?: number;
}

export interface QuestionSource {
  sourceId: ObjectId;
  type: 'copied';
  board?: string;
  year?: number;
  page?: string;
  ref?: string;
}

export interface Question {
  _id: ObjectId;
  contentHash: string;
  type: QuestionType;
  language: Language;
  stem: string;
  stimulus?: string;
  options?: QuestionOption[];
  statements?: QuestionStatement[];
  mcqKind?: MCQKind;
  groupId?: string;
  groupOrder?: number;
  parts?: QuestionPart[];
  marks?: number;
  difficulty?: Difficulty;
  countryId?: ObjectId;
  boardId?: ObjectId;
  versionId?: ObjectId;
  levelId?: ObjectId;
  levelIds?: ObjectId[];
  subjectId?: ObjectId;
  chapterId?: ObjectId;
  subchapterId?: ObjectId;
  topicIds?: ObjectId[];
  primaryTopicId?: ObjectId;
  curriculumNodeIds?: ObjectId[];
  translationOf?: ObjectId;
  derivedFrom?: ObjectId;
  institutionId?: ObjectId;
  campusId?: ObjectId;
  scope: string;
  createdBy?: ObjectId;
  media?: QuestionMedia[];
  sources?: QuestionSource[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MCQAnswer {
  correctOptionKeys: string[];
  trueStatementKeys?: string[];
}

export interface QuestionSolution {
  _id: ObjectId;
  questionId: ObjectId;
  partKey: string;
  answer?: MCQAnswer | string;
  hints?: string[];
  steps?: string[];
  explanation?: string;
  rubric?: string;
  keyPoints?: string[];
  answerSource?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SourceType =
  | 'textbook'
  | 'board_exam'
  | 'school_exam'
  | 'admission'
  | 'competitive'
  | 'past_paper'
  | 'guide_book'
  | 'website'
  | 'teacher'
  | 'ai_generated';

export interface QuestionSourceDoc {
  _id: ObjectId;
  type: SourceType;
  sourceKey: string;
  name: LocalizedText;
  country?: string;
  boardNodeId?: ObjectId;
  examBoard?: string;
  exam?: string;
  year?: number;
  subject?: string;
  subjectNodeId?: ObjectId;
  levelNodeIds?: ObjectId[];
  paper?: string;
  variant?: string;
  session?: string;
  syllabusCode?: string;
  institutionName?: string;
  institutionId?: ObjectId;
  campusId?: ObjectId;
  publisher?: string;
  edition?: string;
  url?: string;
  fileKey?: string;
  licenseNote?: string;
  organizer?: string;
  round?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaperSection {
  title: string;
  type: QuestionType;
  count: number;
  marks: number;
  mcqKind?: MCQKind;
  difficulty?: Difficulty[];
  chapterIds?: ObjectId[];
  topicIds?: ObjectId[];
}

export interface PaperBlueprint {
  title: string;
  language: Language;
  sections: PaperSection[];
  totalMarks: number;
  duration?: number;
}
