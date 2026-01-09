import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const subscribeSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    source: z.string().optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = subscribeSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.errors[0].message },
                { status: 400 }
            );
        }

        const { email, source } = result.data;

        const subscriber = await db.newsletterSubscriber.upsert({
            where: { email },
            update: {
                isActive: true,
                source: source || 'landing_page', // Update source if re-subscribing
            },
            create: {
                email,
                source: source || 'landing_page',
            },
        });

        return NextResponse.json(
            { message: 'Successfully subscribed to the newsletter', subscriber },
            { status: 200 }
        );
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
