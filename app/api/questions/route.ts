import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const type = url.searchParams.get('type');
    const difficulty = url.searchParams.get('difficulty');
    const search = url.searchParams.get('search');

    // Demo mode: return fixture data if MongoDB is not configured
    if (!process.env.MONGODB_URI) {
      const { seedData } = await import('@/lib/db/seed');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let questions: any[] = seedData.questions.filter((q: any) => q.isActive);

      if (type) {
        questions = questions.filter((q: any) => q.type === type);
      }

      if (difficulty) {
        questions = questions.filter((q: any) => q.difficulty === difficulty);
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

    const filter: Record<string, unknown> = { isActive: true };

    if (type) {
      filter.type = type;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
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
