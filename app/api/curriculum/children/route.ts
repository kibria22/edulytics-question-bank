import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parentId = url.searchParams.get('parentId');

    if (!parentId) {
      return NextResponse.json({ nodes: [] }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('curriculum_nodes');

    const nodes = await collection
      .find({
        parentId: new ObjectId(parentId),
        isActive: true,
      })
      .sort({ order: 1 })
      .toArray();

    return NextResponse.json({ nodes });
  } catch (error) {
    console.error('Error fetching children nodes:', error);
    return NextResponse.json({ nodes: [] }, { status: 500 });
  }
}
