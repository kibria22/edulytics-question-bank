import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { computeContentHash, computeScope } from '@/lib/utils/question.utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const db = await getDb();
    const collection = db.collection('questions');

    const contentHash = computeContentHash(body);
    const scope = computeScope(body.institutionId, body.campusId);

    const existing = await collection.findOne({
      contentHash,
      scope,
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'A question with similar content already exists',
          duplicateId: existing._id,
        },
        { status: 400 }
      );
    }

    const question = {
      ...body,
      contentHash,
      scope,
      curriculumNodeIds: body.curriculumNodeIds || [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(question);

    return NextResponse.json({
      success: true,
      questionId: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create question',
      },
      { status: 500 }
    );
  }
}
