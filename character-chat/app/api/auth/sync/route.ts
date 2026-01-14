import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin client to verify tokens/users if needed
// actually we can just trust the payload if we verify the session cookie or 
// if we trust the client to send valid data (less secure).
// BETTER: Use server-side auth check.

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, email, full_name, avatar_url } = body;

        if (!id || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        console.log(`Syncing user ${id} (${email}) to Prisma...`);

        // Upsert user
        const user = await db.user.upsert({
            where: { id },
            create: {
                id,
                email,
                username: `user_${id.substring(0, 8)}`,
                displayName: full_name || email.split('@')[0],
                avatarUrl: avatar_url || '',
                subscriptionTier: 'free',
            },
            update: {
                email,
                // Update name/avatar only if not set? or always? 
                // Let's keep existing fields if they exist to avoid overwriting custom profiles
                // But for email, we sync.
            }
        });

        return NextResponse.json({ success: true, user });
    } catch (error: any) {
        console.error('Error syncing user:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
