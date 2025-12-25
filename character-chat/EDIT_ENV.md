# How to Edit Your .env File

## Answer to the Prompt

When you see:
```
⚠️  .env file already exists
Do you want to overwrite it? (y/N)
```

**Answer: `N` (No)** - This will keep your existing .env file so you don't lose any settings you already have.

## Where is the .env File?

The `.env` file is located at:

```
/Users/akeemojuko/Agentwood-Final/agentwrite-final/character-chat/.env
```

## How to Edit the .env File

### Option 1: Using VS Code (Recommended)
```bash
cd /Users/akeemojuko/Agentwood-Final/agentwrite-final/character-chat
code .env
```

### Option 2: Using Terminal Editor (nano)
```bash
cd /Users/akeemojuko/Agentwood-Final/agentwrite-final/character-chat
nano .env
```
- Press `Ctrl + X` to exit
- Press `Y` to save
- Press `Enter` to confirm

### Option 3: Using Finder (macOS)
1. Open Finder
2. Press `Cmd + Shift + G` (Go to Folder)
3. Paste: `/Users/akeemojuko/Agentwood-Final/agentwrite-final/character-chat`
4. Press Enter
5. Press `Cmd + Shift + .` (Show hidden files)
6. Find `.env` file
7. Right-click → Open With → TextEdit (or your preferred editor)

### Option 4: Using Any Text Editor
1. Navigate to: `/Users/akeemojuko/Agentwood-Final/agentwrite-final/character-chat/`
2. Show hidden files (`.env` starts with a dot, so it's hidden)
3. Open `.env` in any text editor

## What to Add to .env File

Your `.env` file should contain:

```env
# Required: Gemini API Key
# Get it from: https://aistudio.google.com/apikey
GEMINI_API_KEY=your_actual_api_key_here

# Required: Database URL (already set)
DATABASE_URL="file:./dev.db"

# Optional: Admin Secret Key
# Generate with: openssl rand -hex 32
ADMIN_SECRET_KEY=your_secret_here
```

## Quick Edit Commands

### Add Gemini API Key
```bash
cd /Users/akeemojuko/Agentwood-Final/agentwrite-final/character-chat
echo 'GEMINI_API_KEY=your_key_here' >> .env
```

### Add Admin Secret
```bash
cd /Users/akeemojuko/Agentwood-Final/agentwrite-final/character-chat
echo "ADMIN_SECRET_KEY=$(openssl rand -hex 32)" >> .env
```

### View Current .env
```bash
cd /Users/akeemojuko/Agentwood-Final/agentwrite-final/character-chat
cat .env
```

## Important Notes

1. **Don't commit .env to git** - It contains secrets
2. **No spaces around `=`** - Use `KEY=value` not `KEY = value`
3. **Use quotes for values with spaces** - `DATABASE_URL="file:./dev.db"`
4. **Restart dev server** after editing `.env`

## Verify Your Changes

After editing, verify:
```bash
cd /Users/akeemojuko/Agentwood-Final/agentwrite-final/character-chat
cat .env | grep GEMINI_API_KEY
```

You should see your API key (or `your_key_here` if not set yet).




