import { NextRequest, NextResponse } from 'next/server';
import { postToAllPlatforms, generateCharacterPost } from '@/lib/seo/social-posting';
import { queueSocialPost } from '@/lib/seo/queue-system';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { characterId, text, url, imageUrl, useQueue = false } = await request.json();

    let postText = text;
    let postUrl = url;

    // If characterId provided, generate post content
    if (characterId && !text) {
      const character = await db.personaTemplate.findUnique({
        where: { id: characterId },
        select: {
          id: true,
          name: true,
          tagline: true,
          description: true,
        },
      });

      if (character) {
        postText = generateCharacterPost(character);
        postUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://agentwood.xyz'}/character/${characterId}`;
      }
    }

    if (!postText || !postUrl) {
      return NextResponse.json(
        { error: 'text and url (or characterId) are required' },
        { status: 400 }
      );
    }

    if (useQueue) {
      // Add to queue
      const jobId = await queueSocialPost(postText, postUrl, imageUrl, 3);
      return NextResponse.json({
        success: true,
        queued: true,
        jobId,
      });
    } else {
      // Post immediately
      const results = await postToAllPlatforms(postText, postUrl, imageUrl);
      return NextResponse.json({
        success: true,
        queued: false,
        results,
      });
    }
  } catch (error: any) {
    console.error('Error posting to social media:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to post to social media' },
      { status: 500 }
    );
  }
}


