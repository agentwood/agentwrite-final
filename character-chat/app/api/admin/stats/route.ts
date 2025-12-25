import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
    }

    // Get total users
    const totalUsers = await db.user.count();

    // Get total conversations
    const totalConversations = await db.conversation.count({
      where: range !== 'all' ? {
        createdAt: { gte: startDate }
      } : undefined
    });

    // Get total messages
    const totalMessages = await db.message.count({
      where: range !== 'all' ? {
        createdAt: { gte: startDate }
      } : undefined
    });

    // Get active users (users who had conversations in the date range)
    const activeUsersToday = await db.conversation.count({
      where: {
        createdAt: {
          gte: new Date(now.setHours(0, 0, 0, 0))
        }
      },
      distinct: ['userId']
    });

    const activeUsersThisWeek = await db.conversation.count({
      where: {
        createdAt: {
          gte: new Date(now.setDate(now.getDate() - 7))
        }
      },
      distinct: ['userId']
    });

    // Get character views
    const totalCharacterViews = await db.personaView.count({
      where: range !== 'all' ? {
        viewedAt: { gte: startDate }
      } : undefined
    });

    // Get character saves
    const totalCharacterSaves = await db.characterSave.count({
      where: range !== 'all' ? {
        createdAt: { gte: startDate }
      } : undefined
    });

    // Calculate average session duration (simplified - based on conversation length)
    const conversations = await db.conversation.findMany({
      where: range !== 'all' ? {
        createdAt: { gte: startDate }
      } : undefined,
      include: {
        messages: true
      }
    });

    const totalDuration = conversations.reduce((acc, conv) => {
      if (conv.messages.length > 0) {
        const firstMessage = conv.messages[0];
        const lastMessage = conv.messages[conv.messages.length - 1];
        const duration = lastMessage.createdAt.getTime() - firstMessage.createdAt.getTime();
        return acc + duration;
      }
      return acc;
    }, 0);

    const averageSessionDuration = conversations.length > 0 
      ? totalDuration / conversations.length 
      : 0;

    // Get top characters
    const topCharacters = await db.personaTemplate.findMany({
      orderBy: { retentionScore: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        viewCount: true,
        chatCount: true,
        interactionCount: true,
        retentionScore: true,
      }
    });

    // Get category distribution
    const allPersonas = await db.personaTemplate.findMany({
      select: { category: true }
    });

    const categoryMap = new Map<string, number>();
    allPersonas.forEach(persona => {
      categoryMap.set(persona.category, (categoryMap.get(persona.category) || 0) + 1);
    });

    const categoryDistribution = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count
    })).sort((a, b) => b.count - a.count);

    // Get user growth data (last 30 days)
    const userGrowth = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await db.user.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      });

      userGrowth.push({
        date: date.toISOString(),
        count: count
      });
    }

    return NextResponse.json({
      totalUsers,
      totalConversations,
      totalMessages,
      activeUsersToday,
      activeUsersThisWeek,
      totalCharacterViews,
      totalCharacterSaves,
      averageSessionDuration,
      topCharacters,
      userGrowth,
      categoryDistribution
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}




