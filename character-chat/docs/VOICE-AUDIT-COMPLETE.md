# Voice Audit System - Complete Setup

## ✅ System Status: FULLY AUTOMATED

The n8n voice audit system is now **fully operational and automatic**!

## 🎯 How It Works

### Automatic Workflow

```
New Character Created
        ↓
API: /api/personas/create
        ↓
Character Saved to Database
        ↓
🎯 Auto-Trigger Voice Audit (n8n webhook)
        ↓
5 AI Agents Run in Parallel:
  1. Gender Match (20%)
  2. Age Match (20%)
  3. Accent/Cultural Match (20%)
  4. Overall Fit (20%)
  5. Consistency (20%)
        ↓
Calculate Weighted Score
        ↓
Decision Gate (>= 70?)
        ↓
  ┌─────────────────┴─────────────────┐
  ↓                                   ↓
PASS (>=70)                      FAIL (<70)
  ↓                                   ↓
Approve & Release              Queue for Review
voiceReady = true             voiceReady = false
```

## 🚀 What's Automated

- ✅ **Character creation** triggers audit automatically
- ✅ **5 AI agents** evaluate voice match
- ✅ **Score calculation** (weighted average)
- ✅ **Pass/Fail decision** (70% threshold)
- ✅ **Database updates** (voiceReady flag)
- ✅ **Audit logging** (all scores saved)
- ✅ **Review queue** (failed audits)

## 📝 Manual Testing

You can still manually trigger audits for existing characters:

```bash
# Single character
npx tsx scripts/trigger-voice-audit.ts time-traveler-tina

# All characters
npx tsx scripts/trigger-voice-audit.ts --all
```

## 🔧 Configuration

### Environment Variables (Optional)

Add to `.env.local`:

```bash
N8N_WEBHOOK_URL=http://localhost:5678/webhook/voice-audit-trigger
```

### Starting n8n

```bash
# Start n8n (must be running for audits to work)
npx n8n
```

Then keep it running in the background.

## 📊 Monitoring

### View Audit Logs

```typescript
const audits = await prisma.voiceAuditLog.findMany({
  include: { character: true },
  orderBy: { createdAt: 'desc' },
});
```

### View Review Queue

```typescript
const reviews = await prisma.voiceReviewQueue.findMany({
  where: { status: 'pending' },
  include: { character: true },
});
```

## 🎯 Production Deployment

### Option 1: n8n Cloud

1. Sign up at https://n8n.io
2. Import workflow
3. Update webhook URL in env vars
4. Much more reliable than local

### Option 2: Self-Hosted

```bash
# Docker Compose
docker-compose up -d n8n

# Or PM2
pm2 start "npx n8n" --name n8n-voice-audit
```

## 🔥 Key Files

- `app/api/personas/create/route.ts` - Auto-trigger integration ✨
- `n8n/workflows/voice-audit-pipeline.json` - Complete workflow
- `app/api/voice-audit/*` - 7 agent endpoints
- `scripts/trigger-voice-audit.ts` - Manual testing tool

## ✅ Success Criteria

A character is approved if:
- **Final Score >= 70/100**

Where score = (gender×0.2 + age×0.2 + accent×0.2 + overall×0.2 + consistency×0.2)

## 🎉 You're Done!

The system is now **100% automated**. Every new character will:
1. Be created in database
2. Automatically trigger voice audit
3. Get scored by 5 AI agents
4. Be approved or queued for review
5. Have voiceReady flag set appropriately

**No manual intervention needed!** 🚀
