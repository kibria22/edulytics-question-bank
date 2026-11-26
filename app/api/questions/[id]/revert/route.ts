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
    const { revisionId } = await request.json();

    if (!revisionId) {
      return NextResponse.json({ error: 'revisionId is required' }, { status: 400 });
    }

    const db = await getDb();
    const questionsCollection = db.collection('questions');
    const revisionsCollection = db.collection('question_revisions');

    // Get the revision
    const revision = await revisionsCollection.findOne({ _id: new ObjectId(revisionId) });
    if (!revision) {
      return NextResponse.json({ error: 'Revision not found' }, { status: 404 });
    }

    // Get current state for new revision entry
    const current = await questionsCollection.findOne({ _id: new ObjectId(id) });
    if (!current) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Restore from revision.before
    const restoreData = { ...revision.before };
    delete restoreData._id;
    restoreData.updatedAt = new Date();

    // Create new revision entry for the revert
    await revisionsCollection.insertOne({
      questionId: new ObjectId(id),
      before: current,
      after: restoreData,
      editedAt: new Date(),
      editedBy: 'app',
      revertedFrom: new ObjectId(revisionId),
    });

    // Update the question
    await questionsCollection.replaceOne(
      { _id: new ObjectId(id) },
      { ...restoreData, _id: new ObjectId(id) }
    );

    const updated = await questionsCollection.findOne({ _id: new ObjectId(id) });

    return NextResponse.json({ question: updated });
  } catch (error) {
    console.error('Error reverting question:', error);
    return NextResponse.json({ error: 'Failed to revert question' }, { status: 500 });
  }
}
