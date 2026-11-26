import { ObjectId } from 'mongodb';
import { getDb } from './mongodb';
import {
  CurriculumNode,
  Question,
  QuestionSolution,
  QuestionSourceDoc,
} from '@/lib/types';

export const seedData = {
  curriculumNodes: [
    {
      _id: new ObjectId('673000000000000000000001'),
      type: 'country',
      code: 'BD',
      name: { bn: 'বাংলাদেশ', en: 'Bangladesh' },
      order: 1,
      ancestors: [],
      isActive: true,
    },
    {
      _id: new ObjectId('673000000000000000000002'),
      type: 'board',
      parentId: new ObjectId('673000000000000000000001'),
      ancestors: [new ObjectId('673000000000000000000001')],
      code: 'NCTB',
      name: { bn: 'জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড', en: 'National Curriculum and Textbook Board' },
      order: 1,
      isActive: true,
    },
    {
      _id: new ObjectId('673000000000000000000003'),
      type: 'version',
      parentId: new ObjectId('673000000000000000000002'),
      ancestors: [
        new ObjectId('673000000000000000000001'),
        new ObjectId('673000000000000000000002'),
      ],
      code: 'bn',
      name: { bn: 'বাংলা মাধ্যম', en: 'Bangla Medium' },
      order: 1,
      isActive: true,
    },
    {
      _id: new ObjectId('673000000000000000000004'),
      type: 'level',
      parentId: new ObjectId('673000000000000000000003'),
      ancestors: [
        new ObjectId('673000000000000000000001'),
        new ObjectId('673000000000000000000002'),
        new ObjectId('673000000000000000000003'),
      ],
      code: '9',
      name: { bn: 'নবম শ্রেণি', en: 'Class 9' },
      order: 9,
      isActive: true,
    },
    {
      _id: new ObjectId('673000000000000000000005'),
      type: 'group',
      parentId: new ObjectId('673000000000000000000004'),
      ancestors: [
        new ObjectId('673000000000000000000001'),
        new ObjectId('673000000000000000000002'),
        new ObjectId('673000000000000000000003'),
        new ObjectId('673000000000000000000004'),
      ],
      code: 'science',
      name: { bn: 'বিজ্ঞান', en: 'Science' },
      order: 1,
      isActive: true,
    },
    {
      _id: new ObjectId('673000000000000000000006'),
      type: 'subject',
      parentId: new ObjectId('673000000000000000000005'),
      ancestors: [
        new ObjectId('673000000000000000000001'),
        new ObjectId('673000000000000000000002'),
        new ObjectId('673000000000000000000003'),
        new ObjectId('673000000000000000000004'),
        new ObjectId('673000000000000000000005'),
      ],
      code: 'math',
      name: { bn: 'গণিত', en: 'Mathematics' },
      order: 1,
      summary: {
        bn: 'গণিত একটি মৌলিক বিষয় যা সংখ্যা, আকার এবং নিদর্শন নিয়ে কাজ করে।',
        en: 'Mathematics is a fundamental subject dealing with numbers, shapes, and patterns.',
      },
      isActive: true,
    },
    {
      _id: new ObjectId('673000000000000000000007'),
      type: 'chapter',
      parentId: new ObjectId('673000000000000000000006'),
      ancestors: [
        new ObjectId('673000000000000000000001'),
        new ObjectId('673000000000000000000002'),
        new ObjectId('673000000000000000000003'),
        new ObjectId('673000000000000000000004'),
        new ObjectId('673000000000000000000005'),
        new ObjectId('673000000000000000000006'),
      ],
      code: '1',
      name: { bn: 'বাস্তব সংখ্যা', en: 'Real Numbers' },
      order: 1,
      summary: {
        bn: 'বাস্তব সংখ্যা অধ্যায়ে মূলদ ও অমূলদ সংখ্যা নিয়ে আলোচনা করা হয়েছে।',
        en: 'The Real Numbers chapter discusses rational and irrational numbers.',
      },
      learningOutcomes: {
        bn: [
          'মূলদ ও অমূলদ সংখ্যার ধারণা বুঝতে পারবে',
          'বাস্তব সংখ্যার বৈশিষ্ট্য জানতে পারবে',
          'সংখ্যা রেখায় বাস্তব সংখ্যা স্থাপন করতে পারবে',
        ],
        en: [
          'Understand the concept of rational and irrational numbers',
          'Know the properties of real numbers',
          'Place real numbers on a number line',
        ],
      },
      isActive: true,
    },
    {
      _id: new ObjectId('673000000000000000000008'),
      type: 'topic',
      parentId: new ObjectId('673000000000000000000007'),
      ancestors: [
        new ObjectId('673000000000000000000001'),
        new ObjectId('673000000000000000000002'),
        new ObjectId('673000000000000000000003'),
        new ObjectId('673000000000000000000004'),
        new ObjectId('673000000000000000000005'),
        new ObjectId('673000000000000000000006'),
        new ObjectId('673000000000000000000007'),
      ],
      code: '1.1',
      name: { bn: 'মূলদ সংখ্যা', en: 'Rational Numbers' },
      order: 1,
      summary: {
        bn: 'যে সংখ্যাকে p/q আকারে প্রকাশ করা যায়, যেখানে p ও q পূর্ণসংখ্যা এবং q ≠ 0',
        en: 'Numbers that can be expressed as p/q where p and q are integers and q ≠ 0',
      },
      learningOutcomes: {
        bn: ['মূলদ সংখ্যা চিহ্নিত করতে পারবে', 'মূলদ সংখ্যার ধর্ম প্রয়োগ করতে পারবে'],
        en: ['Identify rational numbers', 'Apply properties of rational numbers'],
      },
      meta: {
        importKey: 'BD/NCTB/bn/9/science/math/topic:1.1',
      },
      isActive: true,
    },
  ] as CurriculumNode[],

  questions: [
    {
      _id: new ObjectId('674000000000000000000001'),
      contentHash: 'abc123def456',
      type: 'mcq',
      language: 'bn',
      mcqKind: 'single',
      stem: 'নিচের কোনটি মূলদ সংখ্যা?',
      options: [
        { key: 'ক', text: '$\\sqrt{2}$' },
        { key: 'খ', text: '$\\pi$' },
        { key: 'গ', text: '$\\frac{3}{4}$' },
        { key: 'ঘ', text: '$\\sqrt{3}$' },
      ],
      marks: 1,
      difficulty: 'easy',
      countryId: new ObjectId('673000000000000000000001'),
      boardId: new ObjectId('673000000000000000000002'),
      versionId: new ObjectId('673000000000000000000003'),
      levelId: new ObjectId('673000000000000000000004'),
      levelIds: [new ObjectId('673000000000000000000004')],
      subjectId: new ObjectId('673000000000000000000006'),
      chapterId: new ObjectId('673000000000000000000007'),
      topicIds: [new ObjectId('673000000000000000000008')],
      primaryTopicId: new ObjectId('673000000000000000000008'),
      curriculumNodeIds: [
        new ObjectId('673000000000000000000001'),
        new ObjectId('673000000000000000000002'),
        new ObjectId('673000000000000000000003'),
        new ObjectId('673000000000000000000004'),
        new ObjectId('673000000000000000000005'),
        new ObjectId('673000000000000000000006'),
        new ObjectId('673000000000000000000007'),
        new ObjectId('673000000000000000000008'),
      ],
      scope: 'global',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      _id: new ObjectId('674000000000000000000002'),
      contentHash: 'xyz789ghi012',
      type: 'cq',
      language: 'bn',
      stem: 'মূলদ ও অমূলদ সংখ্যা সম্পর্কে নিচের প্রশ্নগুলোর উত্তর দাও।',
      parts: [
        { key: 'ক', prompt: 'মূলদ সংখ্যা কাকে বলে?', marks: 2 },
        { key: 'খ', prompt: '$\\sqrt{5}$ অমূলদ সংখ্যা কেন? ব্যাখ্যা কর।', marks: 3 },
        { key: 'গ', prompt: 'দেখাও যে, $\\frac{1}{\\sqrt{2}}$ একটি অমূলদ সংখ্যা।', marks: 5 },
      ],
      marks: 10,
      difficulty: 'medium',
      countryId: new ObjectId('673000000000000000000001'),
      boardId: new ObjectId('673000000000000000000002'),
      versionId: new ObjectId('673000000000000000000003'),
      levelId: new ObjectId('673000000000000000000004'),
      levelIds: [new ObjectId('673000000000000000000004')],
      subjectId: new ObjectId('673000000000000000000006'),
      chapterId: new ObjectId('673000000000000000000007'),
      topicIds: [new ObjectId('673000000000000000000008')],
      primaryTopicId: new ObjectId('673000000000000000000008'),
      curriculumNodeIds: [
        new ObjectId('673000000000000000000001'),
        new ObjectId('673000000000000000000002'),
        new ObjectId('673000000000000000000003'),
        new ObjectId('673000000000000000000004'),
        new ObjectId('673000000000000000000005'),
        new ObjectId('673000000000000000000006'),
        new ObjectId('673000000000000000000007'),
        new ObjectId('673000000000000000000008'),
      ],
      scope: 'global',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ] as Question[],

  solutions: [
    {
      _id: new ObjectId('675000000000000000000001'),
      questionId: new ObjectId('674000000000000000000001'),
      partKey: '',
      answer: {
        correctOptionKeys: ['গ'],
      },
      explanation:
        'মূলদ সংখ্যা হলো সেই সংখ্যা যা $\\frac{p}{q}$ আকারে লেখা যায় যেখানে $p$ ও $q$ পূর্ণসংখ্যা এবং $q \\neq 0$। এখানে $\\frac{3}{4}$ মূলদ সংখ্যা।',
      hints: [
        'মূলদ সংখ্যার সংজ্ঞা মনে করো',
        'কোনটি ভগ্নাংশ আকারে আছে?',
        '$\\sqrt{2}$, $\\pi$, এবং $\\sqrt{3}$ অমূলদ সংখ্যা',
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      _id: new ObjectId('675000000000000000000002'),
      questionId: new ObjectId('674000000000000000000002'),
      partKey: 'ক',
      answer:
        'যে সংখ্যাকে $\\frac{p}{q}$ আকারে প্রকাশ করা যায়, যেখানে $p$ ও $q$ পূর্ণসংখ্যা এবং $q \\neq 0$, তাকে মূলদ সংখ্যা বলে।',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ] as QuestionSolution[],

  sources: [
    {
      _id: new ObjectId('676000000000000000000001'),
      type: 'textbook',
      sourceKey: 'NCTB-9-MATH-2024',
      name: { bn: 'গণিত - নবম শ্রেণি (২০২৪)', en: 'Mathematics - Class 9 (2024)' },
      country: 'BD',
      boardNodeId: new ObjectId('673000000000000000000002'),
      year: 2024,
      subjectNodeId: new ObjectId('673000000000000000000006'),
      levelNodeIds: [new ObjectId('673000000000000000000004')],
      publisher: 'NCTB',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      _id: new ObjectId('676000000000000000000002'),
      type: 'ai_generated',
      sourceKey: 'AI-GEN-2024',
      name: { bn: 'এআই জেনারেটেড প্রশ্ন', en: 'AI Generated Questions' },
      country: 'BD',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ] as QuestionSourceDoc[],
};

export async function seedDatabase() {
  try {
    const db = await getDb();

    console.log('Seeding curriculum_nodes...');
    const curriculumCollection = db.collection('curriculum_nodes');
    await curriculumCollection.deleteMany({
      _id: { $in: seedData.curriculumNodes.map((n) => n._id) },
    });
    await curriculumCollection.insertMany(seedData.curriculumNodes);

    console.log('Seeding questions...');
    const questionsCollection = db.collection('questions');
    await questionsCollection.deleteMany({
      _id: { $in: seedData.questions.map((q) => q._id) },
    });
    await questionsCollection.insertMany(seedData.questions);

    console.log('Seeding question_solutions...');
    const solutionsCollection = db.collection('question_solutions');
    await solutionsCollection.deleteMany({
      _id: { $in: seedData.solutions.map((s) => s._id) },
    });
    await solutionsCollection.insertMany(seedData.solutions);

    console.log('Seeding question_sources...');
    const sourcesCollection = db.collection('question_sources');
    await sourcesCollection.deleteMany({
      _id: { $in: seedData.sources.map((s) => s._id) },
    });
    await sourcesCollection.insertMany(seedData.sources);

    console.log('Seed completed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
}
