import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      const { seedData } = await import('@/lib/db/seed');
      
      const counts = seedData.curriculumNodes.reduce((acc, node) => {
        acc[node.type] = (acc[node.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return NextResponse.json({
        countries: counts.country || 0,
        boards: counts.board || 0,
        versions: counts.version || 0,
        classes: counts.level || 0,
        groups: counts.group || 0,
        subjects: counts.subject || 0,
        chapters: counts.chapter || 0,
        topics: counts.topic || 0,
      });
    }

    const db = await getDb();
    const curriculumCollection = db.collection('curriculum_nodes');

    const typeCounts = await curriculumCollection.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]).toArray();

    const counts: Record<string, number> = {};
    typeCounts.forEach(item => {
      counts[item._id] = item.count;
    });

    return NextResponse.json({
      countries: counts.country || 0,
      boards: counts.board || 0,
      versions: counts.version || 0,
      classes: counts.level || 0,
      groups: counts.group || 0,
      subjects: counts.subject || 0,
      chapters: counts.chapter || 0,
      topics: counts.topic || 0,
    });
  } catch (error) {
    console.error('Error fetching curriculum structure:', error);
    return NextResponse.json(
      { error: 'Failed to fetch curriculum structure' },
      { status: 500 }
    );
  }
}
