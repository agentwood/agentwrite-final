# Character Chat - Setup Guide

## Prerequisites

1. Node.js 18+ installed
2. Gemini API key
3. (Optional) PostgreSQL database for production

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
```bash
cp .env.example .env
# Edit .env and add:
# - GEMINI_API_KEY=your_key_here
# - DATABASE_URL="file:./dev.db" (for SQLite)
# - ADMIN_SECRET_KEY=your_secret_here
```

### 3. Setup Database
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with 50 personas
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the character gallery.

## Audio Features

### Mode C: TTS Playback
- Click "Voice Replies" toggle in chat
- Click speaker icon next to assistant messages
- Audio is generated on-demand via `/api/tts`

### Mode B: Live Audio Calls
- Click phone icon in chat header
- Click "Connect Call" on call page
- Speak into microphone
- Real-time audio conversation via Live API

## Troubleshooting

### Build Errors
- **Prisma error**: Make sure `DATABASE_URL` is set in `.env`
- **Missing dependencies**: Run `npm install`
- **Type errors**: Run `npm run db:generate`

### Audio Issues
- **TTS not working**: Check `GEMINI_API_KEY` is set
- **Live API not connecting**: Verify token creation works
- **No audio playback**: Check browser permissions for audio

## Project Structure

```
character-chat/
├── app/
│   ├── (site)/          # Public pages
│   │   ├── page.tsx     # Gallery
│   │   ├── c/[id]/      # Chat page
│   │   └── call/[id]/   # Call page
│   ├── api/             # API routes
│   │   ├── chat/        # Text chat
│   │   ├── tts/         # TTS generation
│   │   └── live-token/  # Live API tokens
│   └── components/      # React components
├── lib/
│   ├── audio/           # Audio utilities
│   ├── contentFilter.ts  # Content filtering
│   └── db.ts            # Database client
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed script
└── data/
    └── persona-templates.seed.json  # 50 personas
```

## Environment Variables

```env
# Required
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL="file:./dev.db"  # or PostgreSQL URL

# Optional
ADMIN_SECRET_KEY=your_admin_secret  # For admin endpoints
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with personas
