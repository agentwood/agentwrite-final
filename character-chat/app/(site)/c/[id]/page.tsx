import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import ChatWindow from '@/app/components/ChatWindow';
import ChatPageClient from '@/app/components/ChatPageClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: PageProps) {
  try {
    // #region agent log
    const paramsData = await params;
    const { id } = paramsData;
    if (typeof process !== 'undefined' && process.env) {
      const fs = require('fs');
      const logPath = '/Users/akeemojuko/Agentwood-Final/agentwrite-final/.cursor/debug.log';
      fs.appendFileSync(logPath, JSON.stringify({location:'app/(site)/c/[id]/page.tsx:10',message:'ChatPage entry',data:{id,hasId:!!id,idType:typeof id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})+'\n');
    }
    // #endregion
    
    // #region agent log
    let persona;
    try {
      if (typeof process !== 'undefined' && process.env) {
        const fs = require('fs');
        const logPath = '/Users/akeemojuko/Agentwood-Final/agentwrite-final/.cursor/debug.log';
        fs.appendFileSync(logPath, JSON.stringify({location:'app/(site)/c/[id]/page.tsx:15',message:'Before db query',data:{id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n');
      }
    } catch(e){}
    // #endregion
    
    persona = await db.personaTemplate.findUnique({
      where: { id },
    });

    // #region agent log
    if (typeof process !== 'undefined' && process.env) {
      const fs = require('fs');
      const logPath = '/Users/akeemojuko/Agentwood-Final/agentwrite-final/.cursor/debug.log';
      fs.appendFileSync(logPath, JSON.stringify({location:'app/(site)/c/[id]/page.tsx:20',message:'After db query - VOICE DEBUG',data:{id,found:!!persona,personaId:persona?.id,personaName:persona?.name,voiceNameFromDB:persona?.voiceName,voiceNameType:typeof persona?.voiceName,hasVoiceName:!!persona?.voiceName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n');
    }
    // #endregion

    if (!persona) {
      // #region agent log
      if (typeof process !== 'undefined' && process.env) {
        const fs = require('fs');
        const logPath = '/Users/akeemojuko/Agentwood-Final/agentwrite-final/.cursor/debug.log';
        fs.appendFileSync(logPath, JSON.stringify({location:'app/(site)/c/[id]/page.tsx:25',message:'Persona not found, calling notFound()',data:{id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n');
      }
      // #endregion
      notFound();
    }

  // Create or get conversation (simplified - in production, use user auth)
  // #region agent log
  let conversation;
  try {
    if (typeof process !== 'undefined' && process.env) {
      const fs = require('fs');
      const logPath = '/Users/akeemojuko/Agentwood-Final/agentwrite-final/.cursor/debug.log';
      fs.appendFileSync(logPath, JSON.stringify({location:'app/(site)/c/[id]/page.tsx:30',message:'Before conversation query',data:{personaId:id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n');
    }
  } catch(e){}
  // #endregion
  
  conversation = await db.conversation.findFirst({
    where: { personaId: id },
    orderBy: { createdAt: 'desc' },
  });

  // #region agent log
  if (typeof process !== 'undefined' && process.env) {
    const fs = require('fs');
    const logPath = '/Users/akeemojuko/Agentwood-Final/agentwrite-final/.cursor/debug.log';
    fs.appendFileSync(logPath, JSON.stringify({location:'app/(site)/c/[id]/page.tsx:35',message:'After conversation query',data:{found:!!conversation,conversationId:conversation?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n');
  }
  // #endregion

  if (!conversation) {
    // #region agent log
    if (typeof process !== 'undefined' && process.env) {
      const fs = require('fs');
      const logPath = '/Users/akeemojuko/Agentwood-Final/agentwrite-final/.cursor/debug.log';
      fs.appendFileSync(logPath, JSON.stringify({location:'app/(site)/c/[id]/page.tsx:40',message:'Creating new conversation',data:{personaId:id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n');
    }
    // #endregion
    conversation = await db.conversation.create({
      data: {
        personaId: id,
        userId: null, // In production, use actual user ID
      },
    });
    // #region agent log
    if (typeof process !== 'undefined' && process.env) {
      const fs = require('fs');
      const logPath = '/Users/akeemojuko/Agentwood-Final/agentwrite-final/.cursor/debug.log';
      fs.appendFileSync(logPath, JSON.stringify({location:'app/(site)/c/[id]/page.tsx:48',message:'Conversation created',data:{conversationId:conversation.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n');
    }
    // #endregion
  }

  // Record view
  await db.personaView.create({
    data: {
      personaId: id,
      userId: undefined, // In production, use actual user ID
    },
  });

  // Increment view count
  await db.personaTemplate.update({
    where: { id },
    data: { 
      viewCount: { increment: 1 },
      interactionCount: { increment: 1 },
    },
  });

  // #region agent log
  if (typeof process !== 'undefined' && process.env) {
    const fs = require('fs');
    const logPath = '/Users/akeemojuko/Agentwood-Final/agentwrite-final/.cursor/debug.log';
    fs.appendFileSync(logPath, JSON.stringify({location:'app/(site)/c/[id]/page.tsx:55',message:'Before ChatWindow render - VOICE DEBUG',data:{personaId:persona.id,conversationId:conversation.id,hasGreeting:!!persona.greeting,hasVoiceName:!!persona.voiceName,voiceNamePassing:persona.voiceName,voiceNameValue:persona.voiceName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n');
  }
  // #endregion

      return (
        <ChatPageClient
          persona={{
            id: persona.id,
            name: persona.name,
            avatarUrl: persona.avatarUrl,
            greeting: persona.greeting,
            voiceName: persona.voiceName,
            styleHint: persona.styleHint, // Pass styleHint for accent locking
            tagline: persona.tagline,
            description: persona.description,
            category: persona.category,
            archetype: persona.archetype, // Pass archetype for better voice config
            followerCount: persona.followerCount,
            viewCount: persona.viewCount,
            interactionCount: persona.interactionCount,
            saveCount: (persona as any).saveCount || 0,
            commentCount: (persona as any).commentCount || 0,
          }}
          conversationId={conversation.id}
        />
      );
  } catch (error: any) {
    // #region agent log
    if (typeof process !== 'undefined' && process.env) {
      const fs = require('fs');
      const logPath = '/Users/akeemojuko/Agentwood-Final/agentwrite-final/.cursor/debug.log';
      fs.appendFileSync(logPath, JSON.stringify({location:'app/(site)/c/[id]/page.tsx:70',message:'Error in ChatPage',data:{error:error?.message,errorStack:error?.stack,errorName:error?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n');
    }
    // #endregion
    throw error;
  }
}

