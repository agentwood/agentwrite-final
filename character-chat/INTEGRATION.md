# Integration Guide

This document explains how to integrate the Character Chat Next.js app with your existing AgentWrite React + Vite application.

## Architecture

The Character Chat app is built as a separate Next.js application in the `/character-chat` directory. This allows for:
- Independent development and deployment
- Clean separation of concerns
- Easy maintenance

## Integration Options

### Option 1: Separate Deployment (Recommended)

Deploy the Next.js app separately and proxy the `/create` route:

1. **Deploy Next.js app** to Vercel/Netlify
2. **Update main app routing** to redirect `/create` to the Next.js app URL
3. **Or use iframe** (not recommended for production)

### Option 2: Monorepo Integration

Keep both apps in the same repo but deploy separately:

- Main app: React + Vite → Netlify
- Character Chat: Next.js → Vercel

### Option 3: Full Migration (Future)

Migrate the entire app to Next.js for unified framework.

## Setup Steps

### 1. Database Setup

The Character Chat app uses the same Supabase database. You'll need to:

1. Run Prisma migrations:
   ```bash
   cd character-chat
   npm run db:push
   ```

2. Seed characters:
   ```bash
   npm run db:seed
   ```

### 2. Environment Variables

Create `.env` in the `character-chat` directory:

```env
GEMINI_API_KEY=your_key_here
DATABASE_URL=your_supabase_connection_string
```

### 3. Development

Run both apps simultaneously:

**Terminal 1** (Main app):
```bash
cd /path/to/agentwrite-final
npm run dev
```

**Terminal 2** (Character Chat):
```bash
cd /path/to/agentwrite-final/character-chat
npm run dev
```

### 4. Update Main App Navigation

Update `components/Navigation.tsx` to link to the Character Chat app:

```tsx
// Option A: External link
<a href="http://localhost:3000" target="_blank">AI Create</a>

// Option B: If deployed, use production URL
<a href="https://character-chat.vercel.app">AI Create</a>
```

## Deployment

### Vercel (Recommended for Next.js)

1. Connect your GitHub repo
2. Set root directory to `character-chat`
3. Add environment variables
4. Deploy

### Netlify

1. Build command: `cd character-chat && npm run build`
2. Publish directory: `character-chat/.next`
3. Add environment variables

## Database Schema

The Character Chat app adds these tables to your Supabase database:

- `Character` - Character definitions
- `Conversation` - Chat sessions
- `Message` - Individual messages
- `UserQuota` - Usage quotas (for future auth)

These tables are separate from your existing tables and won't conflict.

## API Routes

All API routes are under `/api`:

- `/api/characters` - GET all characters
- `/api/conversations` - POST create conversation
- `/api/chat` - POST send message
- `/api/tts` - POST generate TTS
- `/api/live-token` - POST get Live API token

## Adding More Characters

Edit `data/characters.seed.json` and run:

```bash
npm run db:seed
```

The seed script uses `upsert`, so it's safe to run multiple times.

## Cost Controls

Quota system is implemented but not fully enforced yet. To enable:

1. Add user authentication
2. Implement quota checks in API routes
3. Add quota reset cron job

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check Supabase connection settings
- Ensure Prisma client is generated: `npm run db:generate`

### Gemini API Errors

- Verify `GEMINI_API_KEY` is set
- Check API key permissions
- Ensure you have access to:
  - `gemini-2.5-flash`
  - `gemini-2.5-flash-preview-tts`
  - `gemini-2.5-flash-native-audio-preview-12-2025`

### Image Loading Issues

- Check `next.config.ts` for image domain allowlist
- Verify image URLs are accessible
- Use Next.js Image component for optimization

## Next Steps

1. Expand character seed to 50 characters
2. Add user authentication
3. Implement full quota system
4. Add conversation history UI
5. Improve error handling
6. Add loading states
7. Optimize audio playback
8. Add mobile responsiveness improvements




