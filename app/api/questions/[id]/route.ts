import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db/mongodb';
import { questionFormSchema } from '@/lib/schemas/question.schema';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    const collection = db.collection('questions');

    const question = await collection.findOne({ _id: new ObjectId(id) });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ question });
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate the request body
    const validation = questionFormSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const db = await getDb();
    const questionsCollection = db.collection('questions');
    const revisionsCollection = db.collection('question_revisions');

    // Get the original question
    const original = await questionsCollection.findOne({ _id: new ObjectId(id) });
    if (!original) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Prepare the update
    const updateData: any = {
      ...validation.data,
      updatedAt: new Date(),
      'meta.manuallyEdited': true,
    };

    // Convert string IDs to ObjectId where needed
    if (updateData.countryId) updateData.countryId = new ObjectId(updateData.countryId);
    if (updateData.boardId) updateData.boardId = new ObjectId(updateData.boardId);
    if (updateData.versionId) updateData.versionId = new ObjectId(updateData.versionId);
    if (updateData.levelId) updateData.levelId = new ObjectId(updateData.levelId);
    if (updateData.levelIds) updateData.levelIds = updateData.levelIds.map((id: string) => new ObjectId(id));
    if (updateData.subjectId) updateData.subjectId = new ObjectId(updateData.subjectId);
    if (updateData.chapterId) updateData.chapterId = new ObjectId(updateData.chapterId);
    if (updateData.subchapterId) updateData.subchapterId = new ObjectId(updateData.subchapterId);
    if (updateData.topicIds) updateData.topicIds = updateData.topicIds.map((id: string) => new ObjectId(id));
    if (updateData.primaryTopicId) updateData.primaryTopicId = new ObjectId(updateData.primaryTopicId);
    if (updateData.translationOf) updateData.translationOf = new ObjectId(updateData.translationOf);
    if (updateData.derivedFrom) updateData.derivedFrom = new ObjectId(updateData.derivedFrom);
    if (updateData.institutionId) updateData.institutionId = new ObjectId(updateData.institutionId);
    if (updateData.campusId) updateData.campusId = new ObjectId(updateData.campusId);
    if (updateData.sources) {
      updateData.sources = updateData.sources.map((s: any) => ({
        ...s,
        sourceId: new ObjectId(s.sourceId),
      }));
    }

    // DO NOT change contentHash - it stays the same
    delete updateData.contentHash;

    // Create revision entry
    await revisionsCollection.insertOne({
      questionId: new ObjectId(id),
      before: original,
      after: { ...original, ...updateData },
      editedAt: new Date(),
      editedBy: 'app',
    });

    // Update the question
    await questionsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updated = await questionsCollection.findOne({ _id: new ObjectId(id) });

    return NextResponse.json({ question: updated });
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}
