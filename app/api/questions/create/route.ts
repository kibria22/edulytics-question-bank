import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db/mongodb';
import { computeContentHash, computeScope, computeCurriculumNodeIds } from '@/lib/utils/question.utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const db = await getDb();
    const collection = db.collection('questions');
    const curriculumCollection = db.collection('curriculum_nodes');

    // Compute server-side fields
    const contentHash = computeContentHash(body);
    const scope = computeScope(body.institutionId, body.campusId);

    // Compute curriculumNodeIds from topicIds and levelIds
    const topicIds = (body.topicIds || []).map((id: string) => new ObjectId(id));
    const levelIds = (body.levelIds || []).map((id: string) => new ObjectId(id));
    const curriculumNodeIds = await computeCurriculumNodeIds(
      topicIds,
      levelIds,
      curriculumCollection
    );

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

    // Build the question document with server-computed fields
    // Note: NO status field is added (as per schema requirements)
    const question = {
      ...body,
      contentHash,
      scope,
      curriculumNodeIds,
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
