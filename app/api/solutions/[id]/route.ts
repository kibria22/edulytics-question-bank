import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { questionId, partKey, answer, hints, steps, explanation, answerSource } = body;

    if (!questionId || !partKey) {
      return NextResponse.json(
        { error: 'questionId and partKey are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection('solutions');

    const solution = {
      questionId: new ObjectId(questionId),
      partKey,
      answer,
      hints,
      steps,
      explanation,
      answerSource,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(solution);

    return NextResponse.json({ solution: { ...solution, _id: result.insertedId } });
  } catch (error) {
    console.error('Error creating solution:', error);
    return NextResponse.json({ error: 'Failed to create solution' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const db = await getDb();
    const collection = db.collection('solutions');

    const updateData: any = {
      ...body,
      updatedAt: new Date(),
    };

    delete updateData._id;
    if (updateData.questionId) updateData.questionId = new ObjectId(updateData.questionId);

    await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    const updated = await collection.findOne({ _id: new ObjectId(id) });

    return NextResponse.json({ solution: updated });
  } catch (error) {
    console.error('Error updating solution:', error);
    return NextResponse.json({ error: 'Failed to update solution' }, { status: 500 });
  }
}
