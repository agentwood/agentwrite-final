-- CreateTable
CREATE TABLE "voice_identities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voiceId" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "ageBand" TEXT NOT NULL,
    "originRegion" TEXT NOT NULL,
    "accent" TEXT NOT NULL,
    "ethnicityAnchor" TEXT,
    "authorityLevel" TEXT,
    "pitchMin" INTEGER NOT NULL DEFAULT 100,
    "pitchMax" INTEGER NOT NULL DEFAULT 200,
    "speakingRateMin" INTEGER NOT NULL DEFAULT 90,
    "speakingRateMax" INTEGER NOT NULL DEFAULT 110,
    "energyBaseline" INTEGER NOT NULL DEFAULT 50,
    "aggressionBaseline" INTEGER NOT NULL DEFAULT 0,
    "articulationPrecision" INTEGER NOT NULL DEFAULT 50,
    "rhythmVariability" INTEGER NOT NULL DEFAULT 50,
    "warmth" INTEGER NOT NULL DEFAULT 50,
    "roughness" INTEGER NOT NULL DEFAULT 10,
    "accentId" INTEGER NOT NULL DEFAULT 0,
    "genderLock" INTEGER NOT NULL DEFAULT 0,
    "ageLock" INTEGER NOT NULL DEFAULT 1,
    "voiceProhibitions" TEXT NOT NULL DEFAULT '{}',
    "language" TEXT NOT NULL DEFAULT 'en',
    "socialRegister" TEXT,
    "timbre" TEXT,
    "energyLevel" TEXT,
    "aggressionLevel" TEXT,
    "speakingRate" REAL NOT NULL DEFAULT 1.0,
    "pitchBaselineHz" INTEGER NOT NULL DEFAULT 150,
    "pitchVariance" TEXT,
    "cadenceStyle" TEXT,
    "expressivenessLevel" TEXT NOT NULL DEFAULT 'controlled',
    "emotionalLeakage" TEXT NOT NULL DEFAULT 'none',
    "articulationStyle" TEXT NOT NULL DEFAULT 'precise',
    "confidenceStability" TEXT NOT NULL DEFAULT 'steady',
    "breathiness" TEXT NOT NULL DEFAULT 'none',
    "quirkTag" TEXT,
    "villainCapable" BOOLEAN NOT NULL DEFAULT false,
    "referenceAudioPath" TEXT NOT NULL,
    "referenceText" TEXT,
    "displayName" TEXT,
    "description" TEXT,
    "voiceDescription" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ReferralPurchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referrerId" TEXT NOT NULL,
    "purchaseAmount" REAL NOT NULL,
    "commissionRate" REAL NOT NULL DEFAULT 0.30,
    "commission" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "holdUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" DATETIME,
    CONSTRAINT "ReferralPurchase_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "period" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" DATETIME,
    CONSTRAINT "Payout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserRewardProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "claimedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserRewardProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserCharacterEngagement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "messagesSent" INTEGER NOT NULL DEFAULT 0,
    "lastChatAt" DATETIME,
    "totalChatTime" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserCharacterEngagement_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "PersonaTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserCharacterEngagement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserLoginStreak" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastLoginDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserLoginStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "subscribedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'landing_page',
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PersonaTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seedId" TEXT,
    "name" TEXT NOT NULL,
    "handle" TEXT,
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
    "age" INTEGER,
    "gender" TEXT,
    "heritage" TEXT,
    "accentProfile" TEXT,
    "ttsVoiceSpec" TEXT,
    "faceDescription" TEXT,
    "prompts" TEXT,
    "totalChats" TEXT,
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
    "voiceReady" BOOLEAN NOT NULL DEFAULT false,
    "lastRankedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "creationError" TEXT,
    "creationMessage" TEXT,
    "creationProgress" INTEGER DEFAULT 0,
    "creationStatus" TEXT,
    "behaviorAgreeable" REAL DEFAULT 50,
    "behaviorEmpathy" REAL DEFAULT 50,
    "knowledgeBaseUrl" TEXT,
    "styleFormality" REAL DEFAULT 50,
    "styleVerbosity" REAL DEFAULT 50,
    "trainingConstraints" TEXT,
    "trainingStatus" TEXT DEFAULT 'untrained',
    "behaviorChaos" REAL DEFAULT 50,
    "behaviorPessimism" REAL DEFAULT 50,
    "personalityTags" TEXT,
    "voiceIdentityId" TEXT,
    CONSTRAINT "PersonaTemplate_voiceIdentityId_fkey" FOREIGN KEY ("voiceIdentityId") REFERENCES "voice_identities" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PersonaTemplate" ("archetype", "avatarUrl", "category", "characterKeywords", "chatCount", "commentCount", "createdAt", "description", "featured", "followerCount", "greeting", "id", "interactionCount", "lastRankedAt", "mappingConfidence", "name", "openVoiceVoiceId", "referenceAudioBase64", "referenceAudioUrl", "retentionScore", "saveCount", "scenarioSkin", "seedId", "sourceCharacterName", "sourceCharacterUrl", "sourceDescription", "sourceType", "styleHint", "systemPrompt", "tagline", "tonePack", "trending", "updatedAt", "viewCount", "voiceName", "voicePitch", "voiceSpeed") SELECT "archetype", "avatarUrl", "category", "characterKeywords", "chatCount", "commentCount", "createdAt", "description", "featured", "followerCount", "greeting", "id", "interactionCount", "lastRankedAt", "mappingConfidence", "name", "openVoiceVoiceId", "referenceAudioBase64", "referenceAudioUrl", "retentionScore", "saveCount", "scenarioSkin", "seedId", "sourceCharacterName", "sourceCharacterUrl", "sourceDescription", "sourceType", "styleHint", "systemPrompt", "tagline", "tonePack", "trending", "updatedAt", "viewCount", "voiceName", "voicePitch", "voiceSpeed" FROM "PersonaTemplate";
DROP TABLE "PersonaTemplate";
ALTER TABLE "new_PersonaTemplate" RENAME TO "PersonaTemplate";
CREATE UNIQUE INDEX "PersonaTemplate_seedId_key" ON "PersonaTemplate"("seedId");
CREATE INDEX "PersonaTemplate_category_idx" ON "PersonaTemplate"("category");
CREATE INDEX "PersonaTemplate_seedId_idx" ON "PersonaTemplate"("seedId");
CREATE INDEX "PersonaTemplate_archetype_idx" ON "PersonaTemplate"("archetype");
CREATE INDEX "PersonaTemplate_retentionScore_idx" ON "PersonaTemplate"("retentionScore");
CREATE INDEX "PersonaTemplate_featured_idx" ON "PersonaTemplate"("featured");
CREATE INDEX "PersonaTemplate_trending_idx" ON "PersonaTemplate"("trending");
CREATE INDEX "PersonaTemplate_voiceIdentityId_idx" ON "PersonaTemplate"("voiceIdentityId");
CREATE TABLE "new_User" (
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
    "referralCode" TEXT,
    "referredBy" TEXT,
    "referralCount" INTEGER NOT NULL DEFAULT 0,
    "referralClicks" INTEGER NOT NULL DEFAULT 0,
    "affiliateEarnings" REAL NOT NULL DEFAULT 0,
    "unpaidEarnings" REAL NOT NULL DEFAULT 0,
    "stripeConnectId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("ageVerified", "ageVerifiedAt", "avatarUrl", "createdAt", "creditsBalance", "dateOfBirth", "displayName", "email", "id", "stripeCustomerId", "subscriptionId", "subscriptionStatus", "subscriptionTier", "updatedAt", "username") SELECT "ageVerified", "ageVerifiedAt", "avatarUrl", "createdAt", "creditsBalance", "dateOfBirth", "displayName", "email", "id", "stripeCustomerId", "subscriptionId", "subscriptionStatus", "subscriptionTier", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
CREATE UNIQUE INDEX "User_subscriptionId_key" ON "User"("subscriptionId");
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
CREATE INDEX "User_username_idx" ON "User"("username");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_subscriptionTier_idx" ON "User"("subscriptionTier");
CREATE INDEX "User_stripeCustomerId_idx" ON "User"("stripeCustomerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "voice_identities_voiceId_key" ON "voice_identities"("voiceId");

-- CreateIndex
CREATE INDEX "voice_identities_gender_idx" ON "voice_identities"("gender");

-- CreateIndex
CREATE INDEX "voice_identities_accent_idx" ON "voice_identities"("accent");

-- CreateIndex
CREATE INDEX "ReferralPurchase_referrerId_idx" ON "ReferralPurchase"("referrerId");

-- CreateIndex
CREATE INDEX "ReferralPurchase_status_idx" ON "ReferralPurchase"("status");

-- CreateIndex
CREATE INDEX "ReferralPurchase_createdAt_idx" ON "ReferralPurchase"("createdAt");

-- CreateIndex
CREATE INDEX "Payout_userId_idx" ON "Payout"("userId");

-- CreateIndex
CREATE INDEX "Payout_status_idx" ON "Payout"("status");

-- CreateIndex
CREATE INDEX "Payout_createdAt_idx" ON "Payout"("createdAt");

-- CreateIndex
CREATE INDEX "UserRewardProgress_userId_idx" ON "UserRewardProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRewardProgress_userId_rewardId_key" ON "UserRewardProgress"("userId", "rewardId");

-- CreateIndex
CREATE INDEX "UserCharacterEngagement_userId_idx" ON "UserCharacterEngagement"("userId");

-- CreateIndex
CREATE INDEX "UserCharacterEngagement_personaId_idx" ON "UserCharacterEngagement"("personaId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCharacterEngagement_userId_personaId_key" ON "UserCharacterEngagement"("userId", "personaId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLoginStreak_userId_key" ON "UserLoginStreak"("userId");

-- CreateIndex
CREATE INDEX "UserLoginStreak_userId_idx" ON "UserLoginStreak"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_email_idx" ON "NewsletterSubscriber"("email");
