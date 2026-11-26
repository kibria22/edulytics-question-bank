import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const type = url.searchParams.get('type');
    const mcqKind = url.searchParams.get('mcqKind');
    const difficulty = url.searchParams.get('difficulty');
    const language = url.searchParams.get('language');
    const search = url.searchParams.get('search');
    const levelId = url.searchParams.get('levelId');
    const subjectId = url.searchParams.get('subjectId');
    const chapterId = url.searchParams.get('chapterId');
    const topicId = url.searchParams.get('topicId');
    const sourceType = url.searchParams.get('sourceType');
    const sourceId = url.searchParams.get('sourceId');
    const minMarks = url.searchParams.get('minMarks');
    const maxMarks = url.searchParams.get('maxMarks');
    const hasSolution = url.searchParams.get('hasSolution');
    const hasMedia = url.searchParams.get('hasMedia');

    // Demo mode: return fixture data if MongoDB is not configured
    if (!process.env.MONGODB_URI) {
      const { seedData } = await import('@/lib/db/seed');
      const { ObjectId } = await import('mongodb');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let questions: any[] = seedData.questions.filter((q: any) => q.isActive);

      if (type) {
        questions = questions.filter((q: any) => q.type === type);
      }

      if (mcqKind) {
        questions = questions.filter((q: any) => q.mcqKind === mcqKind);
      }

      if (difficulty) {
        questions = questions.filter((q: any) => q.difficulty === difficulty);
      }

      if (language) {
        questions = questions.filter((q: any) => q.language === language);
      }

      if (levelId) {
        questions = questions.filter((q: any) =>
          q.levelIds?.some((lid: any) => lid.toString() === levelId)
        );
      }

      if (subjectId) {
        questions = questions.filter((q: any) => q.subjectId?.toString() === subjectId);
      }

      if (chapterId) {
        questions = questions.filter((q: any) => q.chapterId?.toString() === chapterId);
      }

      if (topicId) {
        questions = questions.filter((q: any) =>
          q.topicIds?.some((tid: any) => tid.toString() === topicId)
        );
      }

      if (sourceType) {
        questions = questions.filter((q: any) =>
          q.sources?.some((s: any) => s.type === sourceType)
        );
      }

      if (sourceId) {
        questions = questions.filter((q: any) =>
          q.sources?.some((s: any) => s.sourceId?.toString() === sourceId)
        );
      }

      if (minMarks) {
        questions = questions.filter((q: any) => (q.marks || 0) >= parseInt(minMarks));
      }

      if (maxMarks) {
        questions = questions.filter((q: any) => (q.marks || 0) <= parseInt(maxMarks));
      }

      if (hasSolution === 'true') {
        const solutionQids = new Set(seedData.solutions.map((s: any) => s.questionId.toString()));
        questions = questions.filter((q: any) => solutionQids.has(q._id.toString()));
      }

      if (hasMedia === 'true') {
        questions = questions.filter((q: any) => q.media && q.media.length > 0);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        questions = questions.filter(
          (q: any) =>
            q.stem?.toLowerCase().includes(searchLower) ||
            q.stimulus?.toLowerCase().includes(searchLower)
        );
      }

      const total = questions.length;
      const start = (page - 1) * limit;
      const paginatedQuestions = questions.slice(start, start + limit);

      return NextResponse.json({
        questions: paginatedQuestions,
        total,
        page,
        limit,
      });
    }

    const db = await getDb();
    const collection = db.collection('questions');
    const { ObjectId } = await import('mongodb');

    const filter: Record<string, unknown> = { isActive: true };

    if (type) {
      filter.type = type;
    }

    if (mcqKind) {
      filter.mcqKind = mcqKind;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (language) {
      filter.language = language;
    }

    if (levelId) {
      filter.levelIds = new ObjectId(levelId);
    }

    if (subjectId) {
      filter.subjectId = new ObjectId(subjectId);
    }

    if (chapterId) {
      filter.chapterId = new ObjectId(chapterId);
    }

    if (topicId) {
      filter.topicIds = new ObjectId(topicId);
    }

    if (sourceType) {
      filter['sources.type'] = sourceType;
    }

    if (sourceId) {
      filter['sources.sourceId'] = new ObjectId(sourceId);
    }

    if (minMarks || maxMarks) {
      filter.marks = {};
      if (minMarks) {
        (filter.marks as Record<string, unknown>).$gte = parseInt(minMarks);
      }
      if (maxMarks) {
        (filter.marks as Record<string, unknown>).$lte = parseInt(maxMarks);
      }
    }

    if (hasSolution === 'true') {
      filter['sources.0'] = { $exists: true };
    }

    if (hasMedia === 'true') {
      filter['media.0'] = { $exists: true };
    }

    if (search) {
      filter.$or = [
        { stem: { $regex: search, $options: 'i' } },
        { stimulus: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await collection.countDocuments(filter);
    const questions = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({ questions, total, page, limit });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ questions: [], total: 0 }, { status: 500 });
  }
}
