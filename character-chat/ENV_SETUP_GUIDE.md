# Environment Variables Setup Guide

## Step-by-Step Instructions

### Step 1: Locate the .env File

Navigate to the character-chat directory:
```bash
cd character-chat
```

### Step 2: Create or Edit .env File

**Option A: Copy from example (if exists)**
```bash
cp .env.example .env
```

**Option B: Create new .env file**
```bash
touch .env
```

### Step 3: Add Required Environment Variables

Open the `.env` file in your editor and add the following:

```env
# ============================================
# GEMINI API CONFIGURATION
# ============================================
# Get your API key from: https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# ============================================
# DATABASE CONFIGURATION
# ============================================
# For local development (SQLite)
DATABASE_URL="file:./dev.db"

# For production (PostgreSQL - optional)
# DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# ============================================
# ADMIN CONFIGURATION (Optional)
# ============================================
# Secret key for admin endpoints (/api/admin/*)
# Generate a random string for security
ADMIN_SECRET_KEY=your_random_secret_key_here
```

### Step 4: Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key
5. Paste it in your `.env` file replacing `your_gemini_api_key_here`

**Example:**
```env
GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 5: Generate Admin Secret Key (Optional)

You can generate a random secret key using:

**On macOS/Linux:**
```bash
openssl rand -hex 32
```

**Or use Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example output:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### Step 6: Verify Your .env File

Your final `.env` file should look like this:

```env
GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DATABASE_URL="file:./dev.db"
ADMIN_SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### Step 7: Test the Configuration

Verify your environment variables are loaded:

```bash
# Check if .env file exists
ls -la .env

# Verify DATABASE_URL is set (for Prisma)
npm run db:push

# Start the dev server (will show errors if GEMINI_API_KEY is missing)
npm run dev
```

## Environment Variables Reference

### Required Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | `AIzaSyB...` | ✅ Yes |
| `DATABASE_URL` | Database connection string | `"file:./dev.db"` | ✅ Yes |

### Optional Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `ADMIN_SECRET_KEY` | Secret for admin endpoints | Random hex string | ⚠️ For admin features |

## Common Issues

### Issue 1: "GEMINI_API_KEY not set"
**Solution:** Make sure your `.env` file is in the `character-chat` directory and contains `GEMINI_API_KEY=your_key`

### Issue 2: "DATABASE_URL is not set"
**Solution:** Add `DATABASE_URL="file:./dev.db"` to your `.env` file

### Issue 3: Environment variables not loading
**Solution:** 
- Make sure `.env` is in the project root (character-chat/)
- Restart your dev server after changing `.env`
- Check for typos in variable names

### Issue 4: API key not working
**Solution:**
- Verify the key is correct (no extra spaces)
- Check if the key has proper permissions
- Ensure you're using a valid Gemini API key

## Security Best Practices

1. **Never commit .env to git**
   - `.env` should be in `.gitignore`
   - Use `.env.example` for documentation

2. **Use different keys for dev/prod**
   - Development: Local `.env` file
   - Production: Environment variables in hosting platform

3. **Rotate keys regularly**
   - Change API keys periodically
   - Revoke old keys when creating new ones

4. **Keep secrets secret**
   - Don't share `.env` files
   - Don't paste keys in chat/email
   - Use secure password managers

## Production Setup

For production deployment, set environment variables in your hosting platform:

### Vercel
```bash
vercel env add GEMINI_API_KEY
vercel env add DATABASE_URL
```

### Railway
- Go to project settings → Variables
- Add each variable

### Heroku
```bash
heroku config:set GEMINI_API_KEY=your_key
heroku config:set DATABASE_URL=your_postgres_url
```

## Quick Setup Script

You can use this one-liner to create a basic `.env` file:

```bash
cat > .env << 'EOF'
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL="file:./dev.db"
ADMIN_SECRET_KEY=$(openssl rand -hex 32)
EOF
```

Then edit `.env` and replace `your_gemini_api_key_here` with your actual key.

## Next Steps

After setting up `.env`:

1. ✅ Verify database connection: `npm run db:push`
2. ✅ Seed database: `npm run db:seed`
3. ✅ Start dev server: `npm run dev`
4. ✅ Test the application: Visit `http://localhost:3000`

## Need Help?

- Check [Gemini API Documentation](https://ai.google.dev/docs)
- Review [Prisma Environment Variables](https://www.prisma.io/docs/concepts/components/prisma-config/environment-variables)
- See project README.md for more details





