import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserId } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { dateOfBirth } = await request.json();

    // Get userId from request headers (sent by client)
    let userId = request.headers.get('x-user-id');

    // If no userId in headers, generate an anonymous one
    if (!userId) {
      userId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    if (!dateOfBirth) {
      return NextResponse.json(
        { error: 'Date of birth is required' },
        { status: 400 }
      );
    }

    // Calculate age
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    if (age < 18) {
      return NextResponse.json(
        { error: 'You must be 18 years or older', age },
        { status: 403 }
      );
    }

    // Update or create user with age verification
    await db.user.upsert({
      where: { id: userId },
      update: {
        dateOfBirth: dob,
        ageVerified: true,
        ageVerifiedAt: new Date(),
      },
      create: {
        id: userId,
        dateOfBirth: dob,
        ageVerified: true,
        ageVerifiedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      age,
      message: 'Age verified successfully'
    });
  } catch (error: any) {
    console.error('Error verifying age:', error);
    return NextResponse.json(
      { error: 'Failed to verify age', details: error.message },
      { status: 500 }
    );
  }
}




