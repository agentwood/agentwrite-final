<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AgentWriteAI

The gamified creative writing partner. Beat writer's block and level up your storytelling.

View your app in AI Studio: https://ai.studio/apps/drive/1INcU4Odrqqh-VsG5OhWwrQjwb3qBW6N5

## Setup & Configuration

### 1. Google Gemini API (Required)
To use the AI features (Brainstorming, Story Engine, Video/Audio generation), you need a Google Gemini API key.

1. Get a key from [Google AI Studio](https://aistudio.google.com/).
2. Set the `API_KEY` environment variable.

### 2. Supabase Auth (Optional)
By default, the app runs in **Simulation Mode** (Demo User) if Supabase is not configured. To enable real email/Google authentication:

1. Create a project at [Supabase.com](https://supabase.com).
2. **Find your Keys:**
   - Go to **Project Settings** (Gear Icon at bottom left).
   - Click **API**.
   - Copy **Project URL** -> Set as `VITE_SUPABASE_URL`.
   - Copy **anon / public** key (starts with `eyJ...`) -> Set as `VITE_SUPABASE_ANON_KEY`.
3. **Enable Google Auth (Optional):**
   - Go to **Authentication** -> **Providers** -> **Google**.
   - Enable it. (You may need to set up a Google Cloud Project if using a custom domain).

## Netlify Deployment Variables
When deploying to Netlify, add these in **Site Settings > Environment Variables**:

| Key | Value Description |
|-----|-------------------|
| `API_KEY` | Your Google Gemini API Key |
| `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase `anon` / `public` Key |

## Run Locally

1. Install dependencies:
   `npm install`
2. Create a `.env` file in the root directory:
   ```bash
   API_KEY=your_gemini_key_here
   # Optional:
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Run the app:
   `npm run dev`