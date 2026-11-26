import { NextResponse } from 'next/server';
import { isAIConfigured } from '@/lib/ai/provider';

export async function GET() {
  try {
    const configured = isAIConfigured();
    return NextResponse.json({ configured });
  } catch (error) {
    console.error('AI check error:', error);
    return NextResponse.json({ configured: false });
  }
}
