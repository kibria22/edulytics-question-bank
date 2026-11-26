import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';

function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;
    return message
      .replace(/mongodb\+srv:\/\/[^@]+@/gi, 'mongodb+srv://***@')
      .replace(/mongodb:\/\/[^@]+@/gi, 'mongodb://***@')
      .replace(/password[=:]\s*[^\s&]+/gi, 'password=***');
  }
  return 'Unknown error occurred';
}

export async function GET() {
  const hasMongoUri = !!process.env.MONGODB_URI;
  const hasAppPassword = !!process.env.APP_PASSWORD;

  let dbConnected = false;
  let dbHasData = false;
  let connectionError: string | null = null;

  if (hasMongoUri) {
    try {
      const db = await getDb();
      await db.admin().ping();
      dbConnected = true;

      const questionsCollection = db.collection('questions');
      const curriculumCollection = db.collection('curriculum_nodes');

      const [questionsCount, curriculumCount] = await Promise.all([
        questionsCollection.countDocuments({}, { limit: 1 }),
        curriculumCollection.countDocuments({}, { limit: 1 }),
      ]);

      dbHasData = questionsCount > 0 || curriculumCount > 0;
    } catch (error) {
      dbConnected = false;
      connectionError = sanitizeError(error);
      console.error('MongoDB connection/check error:', error);
    }
  }

  return NextResponse.json({
    hasMongoUri,
    hasAppPassword,
    dbConnected,
    dbHasData,
    connectionError,
  });
}
