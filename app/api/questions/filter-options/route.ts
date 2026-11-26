import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      const { seedData } = await import('@/lib/db/seed');
      
      const types = new Set(seedData.questions.map(q => q.type));
      const mcqKinds = new Set(
        seedData.questions
          .filter(q => q.type === 'mcq' && q.mcqKind)
          .map(q => q.mcqKind!)
      );
      const difficulties = new Set(
        seedData.questions
          .filter(q => q.difficulty)
          .map(q => q.difficulty!)
      );
      const sourceTypes = new Set(seedData.sources.map(s => s.type));

      return NextResponse.json({
        types: Array.from(types),
        mcqKinds: Array.from(mcqKinds),
        difficulties: Array.from(difficulties),
        sourceTypes: Array.from(sourceTypes),
        hasSolutions: true,
        hasMedia: false,
      });
    }

    const db = await getDb();
    const questionsCollection = db.collection('questions');
    const sourcesCollection = db.collection('question_sources');

    const [types, mcqKinds, difficulties, sourceTypes, solutionsCount, mediaCount] = await Promise.all([
      questionsCollection.distinct('type', { isActive: true }),
      questionsCollection.distinct('mcqKind', { type: 'mcq', isActive: true }),
      questionsCollection.distinct('difficulty', { isActive: true }),
      sourcesCollection.distinct('type', { isActive: true }),
      questionsCollection.countDocuments({ isActive: true, 'sources.0': { $exists: true } }),
      questionsCollection.countDocuments({ isActive: true, 'media.0': { $exists: true } }),
    ]);

    return NextResponse.json({
      types: types.filter(Boolean),
      mcqKinds: mcqKinds.filter(Boolean),
      difficulties: difficulties.filter(Boolean),
      sourceTypes: sourceTypes.filter(Boolean),
      hasSolutions: solutionsCount > 0,
      hasMedia: mediaCount > 0,
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    );
  }
}
