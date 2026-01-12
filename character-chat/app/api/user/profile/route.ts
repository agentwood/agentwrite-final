import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { username, displayName, avatarUrl, bio } = body;

        // Validation
        if (!username || username.length < 3) {
            return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
        }

        // Handle Avatar Upload (Base64)
        let finalAvatarUrl = avatarUrl;
        if (avatarUrl && avatarUrl.startsWith('data:image')) {
            try {
                // Remove header
                const base64Data = avatarUrl.replace(/^data:image\/\w+;base64,/, "");
                const buffer = Buffer.from(base64Data, 'base64');

                // Ensure directory exists - use /avatars/users/
                const uploadDir = path.join(process.cwd(), 'public', 'avatars', 'users');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                const fileName = `${userId}-${Date.now()}.png`;
                const filePath = path.join(uploadDir, fileName);

                fs.writeFileSync(filePath, buffer);
                finalAvatarUrl = `/avatars/users/${fileName}`;
            } catch (err) {
                console.error("Error saving avatar:", err);
                // Fallback: keep partial base64 or fail? 
                // Let's just log error and keep previous avatar if possible, or fail.
                // For now, fail safe - ignore update of avatar if write fails
            }
        }

        // Update User
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                username,
                displayName,
                avatarUrl: finalAvatarUrl,
                bio,
            }
        });

        return NextResponse.json({
            success: true,
            user: {
                username: updatedUser.username,
                displayName: updatedUser.displayName,
                avatarUrl: updatedUser.avatarUrl,
                bio: updatedUser.bio,
            }
        });

    } catch (error: any) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                username: true,
                displayName: true,
                avatarUrl: true,
                email: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);

    } catch (error: any) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
