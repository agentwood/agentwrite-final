import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { username, provider } = await request.json();

    if (!username || username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: 'Invalid username' },
        { status: 400 }
      );
    }

    // Validate username format
    if (!/^[a-z0-9_-]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Username can only contain lowercase letters, numbers, hyphens, and underscores' },
        { status: 400 }
      );
    }

    // Check if username is available
    const existingUser = await db.user.findFirst({
      where: { displayName: username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 409 }
      );
    }

    // Create user account
    const user = await db.user.create({
      data: {
        displayName: username,
        username: username, // Also set username field
        email: provider === 'email' ? `${username}@agentwood.local` : null,
      },
    });

    return NextResponse.json({
      userId: user.id,
      username: user.displayName || user.username,
    });
  } catch (error: any) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}

