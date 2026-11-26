import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { seedDatabase } from '@/lib/db/seed';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        success: false,
        error: 'MONGODB_URI not configured',
      }, { status: 400 });
    }

    const db = await getDb();
    const questionsCollection = db.collection('questions');
    const curriculumCollection = db.collection('curriculum_nodes');

    const [questionsCount, curriculumCount] = await Promise.all([
      questionsCollection.countDocuments({}, { limit: 1 }),
      curriculumCollection.countDocuments({}, { limit: 1 }),
    ]);

    if (questionsCount > 0 || curriculumCount > 0) {
      return NextResponse.json({
        success: false,
        error: 'Database already contains data. Seeding is only allowed on empty databases.',
      }, { status: 400 });
    }

    await seedDatabase();

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to seed database',
    }, { status: 500 });
  }
}
