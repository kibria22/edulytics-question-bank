import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const levelId = url.searchParams.get('levelId');
    const subjectId = url.searchParams.get('subjectId');

    if (!process.env.MONGODB_URI) {
      const { seedData } = await import('@/lib/db/seed');
      
      let questions = seedData.questions;
      if (levelId) {
        questions = questions.filter(q => 
          q.levelIds?.some(lid => lid.toString() === levelId)
        );
      }
      if (subjectId) {
        questions = questions.filter(q => q.subjectId?.toString() === subjectId);
      }

      const totalQuestions = questions.length;
      const questionIds = new Set(questions.map(q => q._id.toString()));
      const solutionsCount = seedData.solutions.filter(s => 
        questionIds.has(s.questionId.toString())
      ).length;
      const solutionCoverage = totalQuestions > 0 ? (solutionsCount / totalQuestions * 100).toFixed(1) : '0';
      
      const sourceTypes = new Map<string, number>();
      questions.forEach(q => {
        q.sources?.forEach(s => {
          sourceTypes.set(s.type, (sourceTypes.get(s.type) || 0) + 1);
        });
      });

      const typeDistribution = questions.reduce((acc, q) => {
        acc[q.type] = (acc[q.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mcqKindDistribution = questions
        .filter(q => q.type === 'mcq' && q.mcqKind)
        .reduce((acc, q) => {
          acc[q.mcqKind!] = (acc[q.mcqKind!] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      const chapterDistribution = questions.reduce((acc, q) => {
        const chapterId = q.chapterId?.toString();
        if (chapterId) {
          if (!acc[chapterId]) {
            const chapter = seedData.curriculumNodes.find(n => n._id.toString() === chapterId);
            acc[chapterId] = { name: chapter?.name.en || 'Unknown', count: 0 };
          }
          acc[chapterId].count++;
        }
        return acc;
      }, {} as Record<string, { name: string; count: number }>);

      const topicsWithQuestions = new Set(
        questions.flatMap(q => q.topicIds?.map(t => t.toString()) || [])
      ).size;

      const totalTopics = seedData.curriculumNodes.filter(n => n.type === 'topic').length;
      const topicCoverage = totalTopics > 0 ? (topicsWithQuestions / totalTopics * 100).toFixed(1) : '0';

      return NextResponse.json({
        kpis: {
          totalQuestions,
          solutionCoverage: parseFloat(solutionCoverage),
          totalSources: seedData.sources.length,
          topicCoverage: parseFloat(topicCoverage),
        },
        typeDistribution,
        mcqKindDistribution,
        chapterDistribution: Object.entries(chapterDistribution)
          .map(([id, data]) => ({ id, ...data }))
          .slice(0, 10),
        topicStats: {
          covered: topicsWithQuestions,
          total: totalTopics,
          coverage: parseFloat(topicCoverage),
        },
        solutionStats: {
          withSolution: solutionsCount,
          withoutSolution: totalQuestions - solutionsCount,
          withMedia: 0,
        },
        sourceTypeDistribution: Array.from(sourceTypes.entries()).map(([type, count]) => ({
          type,
          count,
        })),
        curriculumCounts: {
          classes: seedData.curriculumNodes.filter(n => n.type === 'level').length,
          subjects: seedData.curriculumNodes.filter(n => n.type === 'subject').length,
          chapters: seedData.curriculumNodes.filter(n => n.type === 'chapter').length,
          topics: totalTopics,
        },
        recentQuestions: questions.slice(0, 5).map(q => ({
          _id: q._id,
          type: q.type,
          stem: q.stem,
          difficulty: q.difficulty,
          createdAt: q.createdAt,
        })),
      });
    }

    const db = await getDb();
    const questionsCollection = db.collection('questions');
    const solutionsCollection = db.collection('question_solutions');
    const sourcesCollection = db.collection('question_sources');
    const curriculumCollection = db.collection('curriculum_nodes');

    const filter: Record<string, unknown> = { isActive: true };
    if (levelId) {
      filter.levelIds = new ObjectId(levelId);
    }
    if (subjectId) {
      filter.subjectId = new ObjectId(subjectId);
    }

    const [
      totalQuestions,
      questionsWithSolutions,
      totalSources,
      typeDistribution,
      mcqKindDistribution,
      chapterDistribution,
      topicStats,
      solutionStats,
      sourceTypeDistribution,
      curriculumCounts,
      recentQuestions,
      questionsWithMedia,
    ]: [
      number,
      number,
      number,
      any[],
      any[],
      any[],
      { covered: number; total: number; coverage: string },
      { withSolution: number; withoutSolution: number },
      any[],
      { classes: number; subjects: number; chapters: number; topics: number },
      any[],
      number,
    ] = await Promise.all([
      questionsCollection.countDocuments(filter),
      questionsCollection.countDocuments({ ...filter, 'sources.0': { $exists: true } }),
      sourcesCollection.countDocuments({ isActive: true }),
      questionsCollection.aggregate([
        { $match: filter },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]).toArray(),
      questionsCollection.aggregate([
        { $match: { ...filter, type: 'mcq' } },
        { $group: { _id: '$mcqKind', count: { $sum: 1 } } },
      ]).toArray(),
      questionsCollection.aggregate([
        { $match: filter },
        { $group: { _id: '$chapterId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $lookup: {
          from: 'curriculum_nodes',
          localField: '_id',
          foreignField: '_id',
          as: 'chapter',
        }},
      ]).toArray(),
      (async () => {
        const allTopics = await curriculumCollection.countDocuments({ type: 'topic', isActive: true });
        const topicsWithQuestions = await questionsCollection.distinct('primaryTopicId', filter);
        return {
          covered: topicsWithQuestions.length,
          total: allTopics,
          coverage: allTopics > 0 ? (topicsWithQuestions.length / allTopics * 100).toFixed(1) : '0',
        };
      })(),
      (async (): Promise<{ withSolution: number; withoutSolution: number }> => {
        const withSolution = await solutionsCollection.countDocuments({});
        const total = await questionsCollection.countDocuments(filter);
        return {
          withSolution,
          withoutSolution: total - withSolution,
        };
      })(),
      questionsCollection.aggregate([
        { $match: filter },
        { $unwind: '$sources' },
        { $group: { _id: '$sources.type', count: { $sum: 1 } } },
      ]).toArray(),
      (async () => {
        const [classes, subjects, chapters, topics] = await Promise.all([
          curriculumCollection.countDocuments({ type: 'level', isActive: true }),
          curriculumCollection.countDocuments({ type: 'subject', isActive: true }),
          curriculumCollection.countDocuments({ type: 'chapter', isActive: true }),
          curriculumCollection.countDocuments({ type: 'topic', isActive: true }),
        ]);
        return { classes, subjects, chapters, topics };
      })(),
      questionsCollection.find(filter).sort({ createdAt: -1 }).limit(5).toArray(),
      questionsCollection.countDocuments({ ...filter, 'media.0': { $exists: true } }),
    ]);

    const solutionCoverage = totalQuestions > 0 
      ? (questionsWithSolutions / totalQuestions * 100).toFixed(1)
      : '0';

    return NextResponse.json({
      kpis: {
        totalQuestions,
        solutionCoverage: parseFloat(solutionCoverage),
        totalSources,
        topicCoverage: parseFloat(topicStats.coverage),
      },
      typeDistribution: typeDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
      mcqKindDistribution: mcqKindDistribution.reduce((acc, item) => {
        acc[item._id || 'single'] = item.count;
        return acc;
      }, {} as Record<string, number>),
      chapterDistribution: chapterDistribution.map(item => ({
        id: item._id?.toString() || '',
        name: item.chapter[0]?.name?.en || 'Unknown',
        count: item.count,
      })),
      topicStats,
      solutionStats: {
        ...solutionStats,
        withMedia: questionsWithMedia,
      },
      sourceTypeDistribution: sourceTypeDistribution.map(item => ({
        type: item._id,
        count: item.count,
      })),
      curriculumCounts,
      recentQuestions: recentQuestions.map(q => ({
        _id: q._id,
        type: q.type,
        stem: q.stem,
        difficulty: q.difficulty,
        createdAt: q.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
