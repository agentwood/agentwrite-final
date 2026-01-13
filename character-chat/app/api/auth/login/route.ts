import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        if (!password) {
            return NextResponse.json(
                { error: 'Password is required' },
                { status: 400 }
            );
        }

        // Find existing user
        const user = await db.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: email } // Allow login with username too
                ]
            }
        });

        // User must exist to login
        if (!user) {
            return NextResponse.json(
                { error: 'No account found with this email. Please sign up first.' },
                { status: 401 }
            );
        }

        // Note: In a real app, you'd verify the password here
        // For now, we'll accept any password for existing users (demo mode)

        return NextResponse.json({
            id: user.id,
            email: user.email,
            displayName: user.displayName || user.username,
            planId: user.subscriptionTier || 'free',
        });

    } catch (error: any) {
        console.error('Error logging in:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to login' },
            { status: 500 }
        );
    }
}

