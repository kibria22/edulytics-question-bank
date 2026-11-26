import crypto from 'crypto';
import { ObjectId } from 'mongodb';
import {
  Question,
  QuestionOption,
  QuestionStatement,
  QuestionPart,
  CurriculumNode,
} from '@/lib/types';

export function normalizeText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

export function computeContentHash(question: Partial<Question>): string {
  const parts: string[] = [
    question.language || '',
    question.type || '',
    question.mcqKind || '',
  ];

  if (question.stimulus) {
    parts.push(normalizeText(question.stimulus));
  }

  parts.push(normalizeText(question.stem || ''));

  if (question.statements) {
    question.statements.forEach((stmt: QuestionStatement) => {
      parts.push(`${stmt.key}:${normalizeText(stmt.text)}`);
    });
  }

  if (question.options) {
    question.options.forEach((opt: QuestionOption) => {
      parts.push(`${opt.key}:${normalizeText(opt.text)}`);
    });
  }

  if (question.parts) {
    question.parts.forEach((part: QuestionPart) => {
      parts.push(normalizeText(part.prompt));
    });
  }

  const content = parts.join('|');
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

export function computeScope(
  institutionId?: ObjectId | string,
  campusId?: ObjectId | string
): string {
  if (campusId) {
    return `campus:${campusId.toString()}`;
  }
  if (institutionId) {
    return `inst:${institutionId.toString()}`;
  }
  return 'global';
}

export async function computeCurriculumNodeIds(
  topicIds: ObjectId[],
  levelIds: ObjectId[],
  curriculumNodesCollection: any
): Promise<ObjectId[]> {
  const nodeIds = new Set<string>();

  for (const topicId of topicIds) {
    const topic = await curriculumNodesCollection.findOne({ _id: topicId });
    if (topic) {
      nodeIds.add(topicId.toString());
      topic.ancestors?.forEach((ancestorId: ObjectId) => {
        nodeIds.add(ancestorId.toString());
      });
    }
  }

  for (const levelId of levelIds) {
    const level = await curriculumNodesCollection.findOne({ _id: levelId });
    if (level) {
      nodeIds.add(levelId.toString());
      level.ancestors?.forEach((ancestorId: ObjectId) => {
        nodeIds.add(ancestorId.toString());
      });
    }
  }

  return Array.from(nodeIds).map((id) => new ObjectId(id));
}

export function getBanglaOptionKey(index: number): string {
  const keys = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ'];
  return keys[index] || String.fromCharCode(2453 + index);
}

export function getEnglishOptionKey(index: number): string {
  return String.fromCharCode(97 + index);
}

export function getOptionKey(index: number, language: string): string {
  if (language === 'bn') {
    return getBanglaOptionKey(index);
  }
  return getEnglishOptionKey(index);
}
