import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { note } = await request.json();

    const db = await getDb();
    const collection = db.collection('questions');

    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          'meta.flagged': {
            note: note || 'Error reported',
            at: new Date(),
          },
          updatedAt: new Date(),
        },
      }
    );

    const updated = await collection.findOne({ _id: new ObjectId(id) });

    return NextResponse.json({ question: updated });
  } catch (error) {
    console.error('Error flagging question:', error);
    return NextResponse.json({ error: 'Failed to flag question' }, { status: 500 });
  }
}
