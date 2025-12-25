# Admin Secret Key Guide

## What is the Admin Secret Key?

The **Admin Secret Key** is a random secret string used to secure admin-only API endpoints like:
- `/api/admin/import` - CSV import for persona templates
- `/api/admin/rank` - Weekly persona ranking pipeline

**You don't "find" it - you generate it!** It's a random string that you create.

## How to Generate an Admin Secret Key

### Method 1: Using OpenSSL (Recommended)

```bash
openssl rand -hex 32
```

This generates a 64-character hexadecimal string (32 bytes = 64 hex characters).

**Example output:**
```
d9ecba2c4e57545301d49f7f700e9ac676ac4b91a84f5777b45f9133c163b209
```
⚠️ **Note:** This is just an example - you must generate your own unique key!

### Method 2: Using Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Method 3: Using Online Generator

Visit: https://randomkeygen.com/ (use "CodeIgniter Encryption Keys" - 64 characters)

## How to Add It to Your .env File

1. **Generate the key** (using Method 1 above):
   ```bash
   openssl rand -hex 32
   ```

2. **Copy the generated key**

3. **Add it to your .env file**:
   ```bash
   cd /Users/akeemojuko/Agentwood-Final/agentwrite-final/character-chat
   echo "ADMIN_SECRET_KEY=your_generated_key_here" >> .env
   ```
   
   Or manually edit `.env` and add:
   ```env
   ADMIN_SECRET_KEY=d9ecba2c4e57545301d49f7f700e9ac676ac4b91a84f5777b45f9133c163b209
   ```

4. **Verify it was added**:
   ```bash
   cat .env | grep ADMIN_SECRET_KEY
   ```

## Complete .env File Example

Your `.env` file should look like this:

```env
# Gemini API Key (Required for AI features)
GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Database URL (Required)
DATABASE_URL="file:./dev.db"

# Admin Secret Key (Required for admin endpoints)
ADMIN_SECRET_KEY=d9ecba2c4e57545301d49f7f700e9ac676ac4b91a84f5777b45f9133c163b209
```

## How It's Used (Future Implementation)

Currently, the admin endpoints have TODO comments for authentication. When implemented, they will:

1. Check for `ADMIN_SECRET_KEY` in request headers:
   ```typescript
   const adminKey = request.headers.get('x-admin-secret');
   if (adminKey !== process.env.ADMIN_SECRET_KEY) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }
   ```

2. Require the key in API calls:
   ```bash
   curl -X POST http://localhost:3000/api/admin/rank \
     -H "x-admin-secret: your_secret_key_here"
   ```

## Security Best Practices

1. **Never commit `.env` to git** - It contains secrets
2. **Use different keys for dev/prod** - Generate separate keys
3. **Keep it secret** - Don't share it publicly
4. **Rotate periodically** - Change it every few months
5. **Use strong keys** - Always use `openssl rand -hex 32` (64 characters)

## Quick Setup Command

Run this to generate and add the key automatically:

```bash
cd /Users/akeemojuko/Agentwood-Final/agentwrite-final/character-chat
echo "ADMIN_SECRET_KEY=$(openssl rand -hex 32)" >> .env
```

Then verify:
```bash
cat .env | grep ADMIN_SECRET_KEY
```

## Troubleshooting

**Q: Do I need this for development?**
A: Not immediately, but it's good to set it up now. The admin endpoints will require it once authentication is implemented.

**Q: Can I use any random string?**
A: Yes, but using `openssl rand -hex 32` ensures it's cryptographically secure and the right length.

**Q: What if I lose the key?**
A: Just generate a new one and update your `.env` file. The old key will stop working.




