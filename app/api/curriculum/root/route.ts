import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';

export async function GET() {
  try {
    const db = await getDb();
    const collection = db.collection('curriculum_nodes');

    const nodes = await collection
      .find({ type: 'country', isActive: true })
      .sort({ order: 1 })
      .toArray();

    return NextResponse.json({ nodes });
  } catch (error) {
    console.error('Error fetching root nodes:', error);
    return NextResponse.json({ nodes: [] }, { status: 500 });
  }
}
