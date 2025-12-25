import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');

    if (!username || username.length < 3) {
      return NextResponse.json(
        { available: false, error: 'Username too short' },
        { status: 400 }
      );
    }

    // Check if username exists in database
    // For now, we'll check against a simple pattern
    // In production, you'd check against User table
    const existingUser = await db.user.findFirst({
      where: {
        displayName: username,
      },
    });

    return NextResponse.json({
      available: !existingUser,
    });
  } catch (error: any) {
    console.error('Error checking username:', error);
    return NextResponse.json(
      { available: false, error: error.message },
      { status: 500 }
    );
  }
}




