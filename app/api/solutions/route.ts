import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const questionId = url.searchParams.get('questionId');

    if (!questionId) {
      return NextResponse.json({ error: 'questionId is required' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('solutions');

    const solutions = await collection
      .find({ questionId: new ObjectId(questionId) })
      .sort({ partKey: 1 })
      .toArray();

    return NextResponse.json({ solutions });
  } catch (error) {
    console.error('Error fetching solutions:', error);
    return NextResponse.json({ solutions: [] }, { status: 500 });
  }
}
