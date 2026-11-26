import { NextResponse } from 'next/server';
import { checkConnection } from '@/lib/db/mongodb';

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        connected: false,
        error: 'MONGODB_URI not configured',
      });
    }

    const connected = await checkConnection();

    return NextResponse.json({
      connected,
      message: connected ? 'Database connected' : 'Database connection failed',
    });
  } catch (error) {
    console.error('DB check error:', error);
    return NextResponse.json({
      connected: false,
      error: 'Database connection error',
    });
  }
}
