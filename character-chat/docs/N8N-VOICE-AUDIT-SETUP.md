# N8N Voice Audit System - Setup Guide

## Overview

This system automatically validates character voices through a 5-agent AI pipeline before releasing them to production.

## Architecture

```
Character Created/Updated
        ↓
   Webhook Trigger (n8n)
        ↓
   5 Parallel Agents:
   1. Gender Match
   2. Age Match
   3. Accent Match
   4. Overall Fit
   5. Consistency
        ↓
   Score Aggregation (weighted 20% each)
        ↓
   Pass/Fail Decision (threshold: 70/100)
        ↓
   ┌─────────────────┴─────────────────┐
   ↓                                   ↓
APPROVED (>=70)                  FAILED (<70)
   ↓                                   ↓
Release to Production           Queue for Manual Review
   ↓                                   ↓
Email Notification              Email Notification
```

## Setup Instructions

### 1. Import n8n Workflow

1. Open your n8n instance
2. Go to Workflows → Import from File
3. Upload `n8n/workflows/voice-audit-pipeline.json`
4. Activate the workflow

### 2. Configure Environment Variables

Add to your `.env.local`:

```bash
# n8n Configuration
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook
ADMIN_EMAIL=admin@yourdomain.com

# Existing
GEMINI_API_KEY=your_gemini_key
APP_URL=http://localhost:3000
```

### 3. Update Database Schema

Add the voice audit tables to your database:

```bash
cd character-chat

# Copy schema extension to main schema
cat prisma/schema-voice-audit.prisma >> prisma/schema.prisma

# Run migration
npx prisma migrate dev --name add-voice-audit-system

# Generate Prisma client
npx prisma generate
```

### 4. Test the System

Trigger a test audit:

```bash
curl -X POST http://your-n8n-instance.com/webhook/voice-audit-trigger \
  -H "Content-Type: application/json" \
  -d '{
    "characterId": "test-id-123",
    "characterName": "Test Character",
    "description": "A young female warrior from Japan",
    "voiceName": "aoede",
    "category": "Fiction & Media",
    "archetype": "hero"
  }'
```

## API Endpoints

All endpoints are now live at:

- `POST /api/voice-audit/validate` - Agent 1: Gender Match
- `POST /api/voice-audit/validate-age` - Agent 2: Age Match
- `POST /api/voice-audit/validate-accent` - Agent 3: Accent Match
- `POST /api/voice-audit/validate-overall` - Agent 4: Overall Fit
- `POST /api/voice-audit/validate-consistency` - Agent 5: Consistency
- `POST /api/voice-audit/approve` - Approve and release voice
- `POST /api/voice-audit/queue-review` - Queue for manual review

## Integration with Character Creation

Add to your character creation flow:

```typescript
// After creating character
const auditResponse = await fetch(process.env.N8N_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    characterId: character.id,
    characterName: character.name,
    description: character.description,
    voiceName: character.voiceName,
    category: character.category,
    archetype: character.archetype,
  }),
});

const result = await auditResponse.json();
console.log('Voice audit initiated:', result);
```

## Monitoring & Review

### View Audit Logs

```typescript
// Get recent audits
const audits = await prisma.voiceAuditLog.findMany({
  take: 20,
  orderBy: { createdAt: 'desc' },
  include: { character: true },
});
```

### View Review Queue

```typescript
// Get pending reviews
const reviews = await prisma.voiceReviewQueue.findMany({
  where: { status: 'pending' },
  orderBy: { priority: 'desc', createdAt: 'desc' },
  include: { character: true },
});
```

## Scoring Criteria

Each agent scores 0-100:
- **100-90**: Excellent match
- **89-70**: Good match (passes approval)
- **69-50**: Fair match (manual review)
- **49-0**: Poor match (manual review)

**Final Score** = Average of all 5 agents (weighted equally at 20% each)

**Approval Threshold** = 70/100

## Notification Templates

Approval notification includes:
- Character name
- Voice name
- Final score
- Individual agent scores

Failure notification includes:
- All above plus:
- Specific failures
- Recommendations
- Link to review queue

## Troubleshooting

**Workflow not triggering:**
- Check n8n webhook URL is correct
- Verify webhook is activated
- Check n8n logs for errors

**Agents timing out:**
- Increase Gemini API timeout
- Check API key quota
- Verify network connectivity

**Database errors:**
- Ensure migrations ran successfully
- Check Prisma client is generated
- Verify database connection

## Production Recommendations

1. **Rate Limiting**: Add rate limits to prevent API abuse
2. **Queue Processing**: Set up cron job to process review queue
3. **Monitoring**: Add Sentry/logging for failures
4. **Caching**: Cache agent responses for similar characters
5. **Webhooks**: Set up Slack/Discord webhooks for real-time alerts

## Support

For issues, check:
- n8n logs: `/var/log/n8n/`
- Application logs: Check Next.js console
- Database logs: Check Prisma query logs
