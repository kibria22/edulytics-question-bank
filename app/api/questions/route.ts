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
