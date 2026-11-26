import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDb();
    const collection = db.collection('curriculum_nodes');

    // Find NCTB board
    const nctbBoard = await collection.findOne({
      type: 'board',
      $or: [
        { 'name.en': { $regex: /^NCTB$/i } },
        { 'name.bn': { $regex: /জাতীয়/ } }
      ],
      isActive: true
    });

    if (!nctbBoard) {
      return NextResponse.json({ error: 'NCTB board not found' }, { status: 404 });
    }

    // Find version under NCTB
    const version = await collection.findOne({
      type: 'version',
      parentId: nctbBoard._id,
      isActive: true
    });

    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    // Find Class 9 level (or Class 9-10)
    const class9 = await collection.findOne({
      type: 'level',
      parentId: version._id,
      $or: [
        { 'name.en': { $regex: /^(Class |)9(-10)?$/i } },
        { 'name.bn': { $regex: /নবম/ } }
      ],
      isActive: true
    });

    if (!class9) {
      return NextResponse.json({ error: 'Class 9 not found' }, { status: 404 });
    }

    // Find General group under Class 9
    const generalGroup = await collection.findOne({
      type: 'group',
      parentId: class9._id,
      $or: [
        { 'name.en': { $regex: /General/i } },
        { 'name.bn': { $regex: /সাধারণ/ } }
      ],
      isActive: true
    });

    if (!generalGroup) {
      return NextResponse.json({ error: 'General group not found' }, { status: 404 });
    }

    // Find General Math subject
    const generalMath = await collection.findOne({
      type: 'subject',
      parentId: generalGroup._id,
      $or: [
        { 'name.en': { $regex: /(General Mathematics|General Math|গণিত)/i } },
        { 'name.bn': { $regex: /গণিত/ } }
      ],
      isActive: true
    });

    if (!generalMath) {
      return NextResponse.json({ error: 'General Math subject not found' }, { status: 404 });
    }

    return NextResponse.json({
      boardId: nctbBoard._id.toString(),
      versionId: version._id.toString(),
      levelId: class9._id.toString(),
      groupId: generalGroup._id.toString(),
      subjectId: generalMath._id.toString(),
      names: {
        board: nctbBoard.name,
        version: version.name,
        level: class9.name,
        group: generalGroup.name,
        subject: generalMath.name
      }
    });
  } catch (error) {
    console.error('Error resolving default curriculum:', error);
    return NextResponse.json({ error: 'Failed to resolve defaults' }, { status: 500 });
  }
}
