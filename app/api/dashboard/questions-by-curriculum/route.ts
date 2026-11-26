import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const groupBy = url.searchParams.get('groupBy') || 'board';
    const stacked = url.searchParams.get('stacked') === 'true';

    if (!process.env.MONGODB_URI) {
      const { seedData } = await import('@/lib/db/seed');
      
      // For demo mode, return sample data
      if (groupBy === 'type') {
        const typeCounts = seedData.questions.reduce((acc, q) => {
          acc[q.type] = (acc[q.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        return NextResponse.json({
          data: Object.entries(typeCounts).map(([name, count]) => ({
            name: name.toUpperCase(),
            count,
          })),
        });
      }

      if (groupBy === 'language') {
        const langCounts = seedData.questions.reduce((acc, q) => {
          const lang = q.language === 'bn' ? 'Bangla' : q.language === 'en' ? 'English' : q.language;
          acc[lang] = (acc[lang] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        return NextResponse.json({
          data: Object.entries(langCounts).map(([name, count]) => ({
            name,
            count,
          })),
        });
      }

      // Demo data with variety
      if (groupBy === 'board') {
        return NextResponse.json({
          data: [
            { name: 'NCTB', count: 8, MCQ: 5, CQ: 2, SQ: 1 },
            { name: 'Madrasa', count: 1, MCQ: 1, CQ: 0, SQ: 0 },
          ],
        });
      }
      
      return NextResponse.json({
        data: [
          { name: 'NCTB', count: seedData.questions.length, MCQ: 5, CQ: 1, SQ: 0 },
          { name: 'Madrasa', count: 0, MCQ: 0, CQ: 0, SQ: 0 },
        ],
      });
    }

    const db = await getDb();
    const questionsCollection = db.collection('questions');
    const curriculumCollection = db.collection('curriculum_nodes');

    if (groupBy === 'type') {
      const typeCounts = await questionsCollection.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]).toArray();

      const typeLabels: Record<string, string> = {
        mcq: 'MCQ',
        cq: 'CQ / সৃজনশীল',
        sq: 'Short Question',
        long: 'Long Question',
        practical: 'Practical',
        tf: 'True/False',
      };

      return NextResponse.json({
        data: typeCounts.map(item => ({
          name: typeLabels[item._id] || item._id.toUpperCase(),
          count: item.count,
        })),
      });
    }

    if (groupBy === 'language') {
      const langCounts = await questionsCollection.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$language', count: { $sum: 1 } } },
      ]).toArray();

      const langLabels: Record<string, string> = {
        bn: 'Bangla',
        en: 'English',
        ar: 'Arabic',
      };

      return NextResponse.json({
        data: langCounts.map(item => ({
          name: langLabels[item._id] || item._id,
          count: item.count,
        })),
      });
    }

    // Get all nodes of the requested type
    const nodes = await curriculumCollection.find({
      type: groupBy,
      isActive: true,
    }).sort({ order: 1 }).toArray();

    if (stacked) {
      // Stacked view: group by curriculum level, stack by question type
      const data = await Promise.all(
        nodes.map(async (node) => {
          const questions = await questionsCollection.find({
            isActive: true,
            curriculumNodeIds: node._id,
          }).toArray();

          const typeCounts = questions.reduce((acc, q) => {
            const typeLabel = q.type === 'cq' ? 'CQ' : 
                            q.type === 'mcq' ? 'MCQ' : 
                            q.type === 'sq' ? 'SQ' : 
                            q.type.toUpperCase();
            acc[typeLabel] = (acc[typeLabel] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          return {
            name: node.name.en,
            nameBn: node.name.bn,
            total: questions.length,
            ...typeCounts,
          };
        })
      );

      return NextResponse.json({ data });
    }

    // Simple count view
    const data = await Promise.all(
      nodes.map(async (node) => {
        const count = await questionsCollection.countDocuments({
          isActive: true,
          curriculumNodeIds: node._id,
        });

        return {
          name: node.name.en,
          nameBn: node.name.bn,
          count,
        };
      })
    );

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching questions by curriculum:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions by curriculum' },
      { status: 500 }
    );
  }
}
