-- CreateTable
CREATE TABLE "PersonaTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seedId" TEXT,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "greeting" TEXT,
    "category" TEXT NOT NULL,
    "avatarUrl" TEXT NOT NULL,
    "voiceName" TEXT NOT NULL,
    "styleHint" TEXT,
    "voiceSpeed" REAL,
    "voicePitch" REAL,
    "systemPrompt" TEXT NOT NULL,
    "referenceAudioUrl" TEXT,
    "referenceAudioBase64" TEXT,
    "openVoiceVoiceId" TEXT,
    "archetype" TEXT NOT NULL,
    "tonePack" TEXT,
    "scenarioSkin" TEXT,
    "sourceCharacterName" TEXT,
    "sourceCharacterUrl" TEXT,
    "sourceType" TEXT,
    "sourceDescription" TEXT,
    "characterKeywords" TEXT,
    "mappingConfidence" REAL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "chatCount" INTEGER NOT NULL DEFAULT 0,
    "followerCount" INTEGER NOT NULL DEFAULT 0,
    "interactionCount" INTEGER NOT NULL DEFAULT 0,
    "saveCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "retentionScore" REAL NOT NULL DEFAULT 0.0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "trending" BOOLEAN NOT NULL DEFAULT false,
    "lastRankedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personaId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Conversation_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "PersonaTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "audioUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MessageFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT NOT NULL,
    "userId" TEXT,
    "rating" INTEGER,
    "thumbsUp" BOOLEAN,
    "thumbsDown" BOOLEAN,
    "feedbackText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MessageFeedback_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MessageFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CharacterMemory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL DEFAULT '',
    "facts" TEXT NOT NULL DEFAULT '{}',
    "preferences" TEXT NOT NULL DEFAULT '{}',
    "patterns" TEXT NOT NULL DEFAULT '{}',
    "emotionalState" TEXT,
    "interactionCount" INTEGER NOT NULL DEFAULT 0,
    "confidenceScore" REAL NOT NULL DEFAULT 0.5,
    "lastInteraction" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CharacterMemory_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "PersonaTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConversationPattern" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personaId" TEXT NOT NULL,
    "patternType" TEXT NOT NULL,
    "patternKey" TEXT NOT NULL,
    "patternValue" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "confidence" REAL NOT NULL DEFAULT 0.5,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConversationPattern_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "PersonaTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CharacterEvolution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personaId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "improvements" TEXT NOT NULL,
    "performanceMetrics" TEXT NOT NULL,
    "totalInteractions" INTEGER NOT NULL DEFAULT 0,
    "averageRating" REAL NOT NULL DEFAULT 0.0,
    "responseQuality" REAL NOT NULL DEFAULT 0.5,
    "lastEvolved" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CharacterEvolution_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "PersonaTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserQuota" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "textRepliesToday" INTEGER NOT NULL DEFAULT 0,
    "ttsSecondsToday" INTEGER NOT NULL DEFAULT 0,
    "callMinutesToday" INTEGER NOT NULL DEFAULT 0,
    "lastResetDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodEnd" DATETIME,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "username" TEXT,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "dateOfBirth" DATETIME,
    "ageVerified" BOOLEAN NOT NULL DEFAULT false,
    "ageVerifiedAt" DATETIME,
    "subscriptionTier" TEXT NOT NULL DEFAULT 'free',
    "stripeCustomerId" TEXT,
    "subscriptionId" TEXT,
    "subscriptionStatus" TEXT,
    "creditsBalance" INTEGER NOT NULL DEFAULT 100,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserFollow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserFollow_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "PersonaTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PersonaView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personaId" TEXT NOT NULL,
    "userId" TEXT,
    "viewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PersonaView_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "PersonaTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PersonaView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PinnedMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pinnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PinnedMessage_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PinnedMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VoicePerformance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personaId" TEXT NOT NULL,
    "voiceName" TEXT NOT NULL,
    "userId" TEXT,
    "rating" REAL NOT NULL DEFAULT 3.0,
    "engagementScore" REAL NOT NULL DEFAULT 0.5,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VoicePerformance_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "PersonaTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VoiceParameters" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personaId" TEXT NOT NULL,
    "voiceName" TEXT NOT NULL,
    "speed" REAL NOT NULL DEFAULT 1.0,
    "pitch" REAL NOT NULL DEFAULT 1.0,
    "styleHint" TEXT,
    "confidence" REAL NOT NULL DEFAULT 0.5,
    "performanceScore" REAL NOT NULL DEFAULT 0.0,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastOptimized" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VoiceParameters_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "PersonaTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VoiceFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "voiceName" TEXT NOT NULL,
    "userId" TEXT,
    "voiceRating" INTEGER,
    "speedRating" INTEGER,
    "pitchRating" INTEGER,
    "naturalnessRating" INTEGER,
    "feedbackText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VoiceFeedback_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VoiceFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CharacterSave" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CharacterSave_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "PersonaTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CharacterSave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CharacterComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CharacterComment_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "PersonaTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CharacterComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TTSCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "textHash" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "voiceId" TEXT NOT NULL,
    "engine" TEXT NOT NULL,
    "audioBase64" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sampleRate" INTEGER NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CreditPack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "priceUsd" REAL NOT NULL,
    "stripePriceId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CreditPurchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "creditPackId" TEXT,
    "creditsAdded" INTEGER NOT NULL,
    "amountPaid" REAL NOT NULL,
    "stripeSessionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreditPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CreditPurchase_creditPackId_fkey" FOREIGN KEY ("creditPackId") REFERENCES "CreditPack" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "actionType" TEXT NOT NULL,
    "description" TEXT,
    "balanceAfter" INTEGER NOT NULL,
    "metadata" TEXT DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PersonaTemplate_seedId_key" ON "PersonaTemplate"("seedId");

-- CreateIndex
CREATE INDEX "PersonaTemplate_category_idx" ON "PersonaTemplate"("category");

-- CreateIndex
CREATE INDEX "PersonaTemplate_seedId_idx" ON "PersonaTemplate"("seedId");

-- CreateIndex
CREATE INDEX "PersonaTemplate_archetype_idx" ON "PersonaTemplate"("archetype");

-- CreateIndex
CREATE INDEX "PersonaTemplate_retentionScore_idx" ON "PersonaTemplate"("retentionScore");

-- CreateIndex
CREATE INDEX "PersonaTemplate_featured_idx" ON "PersonaTemplate"("featured");

-- CreateIndex
CREATE INDEX "PersonaTemplate_trending_idx" ON "PersonaTemplate"("trending");

-- CreateIndex
CREATE INDEX "Conversation_personaId_idx" ON "Conversation"("personaId");

-- CreateIndex
CREATE INDEX "Conversation_userId_idx" ON "Conversation"("userId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageFeedback_messageId_key" ON "MessageFeedback"("messageId");

-- CreateIndex
CREATE INDEX "MessageFeedback_userId_idx" ON "MessageFeedback"("userId");

-- CreateIndex
CREATE INDEX "CharacterMemory_personaId_idx" ON "CharacterMemory"("personaId");

-- CreateIndex
CREATE INDEX "CharacterMemory_userId_idx" ON "CharacterMemory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterMemory_personaId_userId_key" ON "CharacterMemory"("personaId", "userId");

-- CreateIndex
CREATE INDEX "ConversationPattern_personaId_idx" ON "ConversationPattern"("personaId");

-- CreateIndex
CREATE INDEX "ConversationPattern_confidence_idx" ON "ConversationPattern"("confidence");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationPattern_personaId_patternType_patternKey_key" ON "ConversationPattern"("personaId", "patternType", "patternKey");

-- CreateIndex
CREATE INDEX "CharacterEvolution_personaId_idx" ON "CharacterEvolution"("personaId");

-- CreateIndex
CREATE INDEX "CharacterEvolution_version_idx" ON "CharacterEvolution"("version");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterEvolution_personaId_version_key" ON "CharacterEvolution"("personaId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "UserQuota_userId_key" ON "UserQuota"("userId");

-- CreateIndex
CREATE INDEX "UserQuota_userId_idx" ON "UserQuota"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_subscriptionId_key" ON "User"("subscriptionId");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_subscriptionTier_idx" ON "User"("subscriptionTier");

-- CreateIndex
CREATE INDEX "User_stripeCustomerId_idx" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "UserFollow_personaId_idx" ON "UserFollow"("personaId");

-- CreateIndex
CREATE INDEX "UserFollow_userId_idx" ON "UserFollow"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserFollow_userId_personaId_key" ON "UserFollow"("userId", "personaId");

-- CreateIndex
CREATE INDEX "PersonaView_personaId_idx" ON "PersonaView"("personaId");

-- CreateIndex
CREATE INDEX "PersonaView_userId_idx" ON "PersonaView"("userId");

-- CreateIndex
CREATE INDEX "PersonaView_viewedAt_idx" ON "PersonaView"("viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PinnedMessage_messageId_key" ON "PinnedMessage"("messageId");

-- CreateIndex
CREATE INDEX "PinnedMessage_userId_idx" ON "PinnedMessage"("userId");

-- CreateIndex
CREATE INDEX "VoicePerformance_personaId_idx" ON "VoicePerformance"("personaId");

-- CreateIndex
CREATE INDEX "VoicePerformance_rating_idx" ON "VoicePerformance"("rating");

-- CreateIndex
CREATE INDEX "VoicePerformance_engagementScore_idx" ON "VoicePerformance"("engagementScore");

-- CreateIndex
CREATE UNIQUE INDEX "VoicePerformance_personaId_voiceName_userId_key" ON "VoicePerformance"("personaId", "voiceName", "userId");

-- CreateIndex
CREATE INDEX "VoiceParameters_personaId_idx" ON "VoiceParameters"("personaId");

-- CreateIndex
CREATE INDEX "VoiceParameters_performanceScore_idx" ON "VoiceParameters"("performanceScore");

-- CreateIndex
CREATE UNIQUE INDEX "VoiceParameters_personaId_voiceName_key" ON "VoiceParameters"("personaId", "voiceName");

-- CreateIndex
CREATE UNIQUE INDEX "VoiceFeedback_messageId_key" ON "VoiceFeedback"("messageId");

-- CreateIndex
CREATE INDEX "VoiceFeedback_personaId_idx" ON "VoiceFeedback"("personaId");

-- CreateIndex
CREATE INDEX "VoiceFeedback_voiceName_idx" ON "VoiceFeedback"("voiceName");

-- CreateIndex
CREATE INDEX "VoiceFeedback_userId_idx" ON "VoiceFeedback"("userId");

-- CreateIndex
CREATE INDEX "CharacterSave_personaId_idx" ON "CharacterSave"("personaId");

-- CreateIndex
CREATE INDEX "CharacterSave_userId_idx" ON "CharacterSave"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSave_userId_personaId_key" ON "CharacterSave"("userId", "personaId");

-- CreateIndex
CREATE INDEX "CharacterComment_personaId_idx" ON "CharacterComment"("personaId");

-- CreateIndex
CREATE INDEX "CharacterComment_userId_idx" ON "CharacterComment"("userId");

-- CreateIndex
CREATE INDEX "CharacterComment_createdAt_idx" ON "CharacterComment"("createdAt");

-- CreateIndex
CREATE INDEX "TTSCache_engine_idx" ON "TTSCache"("engine");

-- CreateIndex
CREATE INDEX "TTSCache_hitCount_idx" ON "TTSCache"("hitCount");

-- CreateIndex
CREATE INDEX "TTSCache_lastUsed_idx" ON "TTSCache"("lastUsed");

-- CreateIndex
CREATE UNIQUE INDEX "TTSCache_textHash_key" ON "TTSCache"("textHash");

-- CreateIndex
CREATE UNIQUE INDEX "CreditPack_stripePriceId_key" ON "CreditPack"("stripePriceId");

-- CreateIndex
CREATE INDEX "CreditPack_isActive_idx" ON "CreditPack"("isActive");

-- CreateIndex
CREATE INDEX "CreditPack_displayOrder_idx" ON "CreditPack"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CreditPurchase_stripeSessionId_key" ON "CreditPurchase"("stripeSessionId");

-- CreateIndex
CREATE INDEX "CreditPurchase_userId_idx" ON "CreditPurchase"("userId");

-- CreateIndex
CREATE INDEX "CreditPurchase_status_idx" ON "CreditPurchase"("status");

-- CreateIndex
CREATE INDEX "CreditPurchase_createdAt_idx" ON "CreditPurchase"("createdAt");

-- CreateIndex
CREATE INDEX "CreditTransaction_userId_idx" ON "CreditTransaction"("userId");

-- CreateIndex
CREATE INDEX "CreditTransaction_actionType_idx" ON "CreditTransaction"("actionType");

-- CreateIndex
CREATE INDEX "CreditTransaction_createdAt_idx" ON "CreditTransaction"("createdAt");
