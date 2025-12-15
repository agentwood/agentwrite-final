# Character Chat - Character.ai Clone

A Next.js application for chatting with AI characters powered by Google Gemini.

## Features

- **50 Curated Characters**: Pre-built characters with unique personalities
- **Text Chat (Mode A)**: Standard text-based conversations
- **Text + Voice (Mode C)**: Text chat with optional voice playback
- **Audio-Only Calls (Mode B)**: Real-time audio conversations using Live API
- **Cost Controls**: Built-in quota system to manage API usage

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `GEMINI_API_KEY`: Your Google Gemini API key
- `DATABASE_URL`: Your Supabase Postgres connection string

### 3. Database Setup

Generate Prisma client:

```bash
npm run db:generate
```

Push schema to database:

```bash
npm run db:push
```

Seed characters:

```bash
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app
  /api              # API routes
  /(site)           # Pages (gallery, chat, call)
  /components       # React components
/lib
  /audio            # Audio utilities (PCM, resampling)
  db.ts             # Prisma client
  geminiClient.ts   # Gemini API client
  prompts.ts        # System instruction builder
/prisma
  schema.prisma     # Database schema
  seed.ts           # Seed script
/data
  characters.seed.json  # Character data
```

## API Routes

- `GET /api/characters` - List all characters
- `POST /api/conversations` - Create a new conversation
- `POST /api/chat` - Send a message and get response
- `POST /api/tts` - Generate text-to-speech audio
- `POST /api/live-token` - Get ephemeral token for Live API

## Pages

- `/` - Character gallery
- `/c/[id]` - Chat with a character
- `/call/[id]` - Audio-only call with a character

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Prisma + Supabase Postgres
- **AI**: Google Gemini API
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Development

### Adding More Characters

Edit `data/characters.seed.json` and run:

```bash
npm run db:seed
```

### Database Migrations

After changing the schema:

```bash
npm run db:push
npm run db:generate
```

## Deployment

This app can be deployed to:
- Vercel (recommended for Next.js)
- Netlify (with Next.js plugin)
- Railway/Render

Make sure to set environment variables in your deployment platform.
