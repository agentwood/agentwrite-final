# Auto-Publishing Setup Guide

## ✅ Implementation Complete

The daily auto-publishing system is now set up to publish blog posts at 9 AM every day!

## 🎯 What's Been Created

### 1. **Serverless Functions** (Recommended)
- ✅ **Vercel Function**: `api/daily-publish.ts` + `vercel.json`
- ✅ **Netlify Function**: `netlify/functions/daily-publish.ts` + `netlify.toml`
- ✅ Runs automatically at 9 AM daily

### 2. **Cron Scripts** (Alternative)
- ✅ **Node.js Script**: `scripts/daily-publish-node.js`
- ✅ **Shell Script**: `scripts/daily-publish-cron.sh`
- ✅ Can be run via system cron

### 3. **Test Post Script**
- ✅ **Test Post Creator**: `scripts/create-test-post.js`
- ✅ Creates a test post to verify the system

## 🚀 Setup Options

### Option 1: Vercel (Recommended - Easiest)

1. **Deploy to Vercel**:
   ```bash
   vercel deploy
   ```

2. **Configure Cron**:
   - The `vercel.json` file is already configured
   - Cron runs at 9 AM daily: `0 9 * * *`

3. **Set Environment Variables**:
   - In Vercel dashboard: Settings → Environment Variables
   - Add: `VITE_SUPABASE_URL`
   - Add: `VITE_SUPABASE_ANON_KEY`
   - Optional: `CRON_SECRET` (for security)

4. **Done!** Posts will auto-publish at 9 AM daily

### Option 2: Netlify

1. **Deploy to Netlify**:
   ```bash
   netlify deploy --prod
   ```

2. **Configure Scheduled Functions**:
   - The `netlify.toml` is already configured
   - Install plugin: `npm install @netlify/plugin-scheduled-functions`

3. **Set Environment Variables**:
   - In Netlify dashboard: Site settings → Environment variables
   - Add: `VITE_SUPABASE_URL`
   - Add: `VITE_SUPABASE_ANON_KEY`

4. **Done!** Posts will auto-publish at 9 AM daily

### Option 3: System Cron (Self-Hosted)

1. **Make Script Executable**:
   ```bash
   chmod +x scripts/daily-publish-cron.sh
   ```

2. **Add to Crontab**:
   ```bash
   crontab -e
   ```
   
   Add this line:
   ```
   0 9 * * * /path/to/agentwrite-final/scripts/daily-publish-cron.sh >> /var/log/daily-publish.log 2>&1
   ```

3. **Or Use Node.js Script**:
   ```bash
   0 9 * * * cd /path/to/agentwrite-final && node scripts/daily-publish-node.js >> /var/log/daily-publish.log 2>&1
   ```

4. **Done!** Posts will auto-publish at 9 AM daily

## 🧪 Create Test Post

### Quick Test (Node.js):
```bash
node scripts/create-test-post.js
```

This will:
- ✅ Create a test blog post
- ✅ Publish it immediately
- ✅ Show you the post URL
- ✅ Verify the system works

### What the Test Post Includes:
- Title: "Test Post: Daily Publishing System Works!"
- Full content with markdown
- Auto-generated tags
- SEO metadata
- Published status

## 📋 How It Works

### Daily Publishing Flow:

1. **9 AM Daily**: Cron job/serverless function triggers
2. **Check Schedule**: Looks for posts scheduled for today
3. **Find Drafts**: Finds draft posts that should be published
4. **Publish**: Changes status from 'draft' to 'published'
5. **Log Results**: Records what was published

### What Gets Published:

- Posts with `status = 'draft'`
- Posts scheduled for today (if date logic is added)
- Posts created from the 30-day content plan

## 🔧 Configuration

### Change Publish Time:

**Vercel** (`vercel.json`):
```json
{
  "crons": [{
    "path": "/api/daily-publish",
    "schedule": "0 9 * * *"  // Change to desired time
  }]
}
```

**Netlify** (`netlify.toml`):
```toml
[[schedules]]
  cron = "0 9 * * *"  // Change to desired time
  function = "daily-publish"
```

**System Cron**:
```
0 9 * * *  // Change to desired time (24-hour format)
```

### Cron Schedule Format:
```
* * * * *
│ │ │ │ │
│ │ │ │ └── Day of week (0-7, 0 or 7 = Sunday)
│ │ │ └──── Month (1-12)
│ │ └────── Day of month (1-31)
│ └──────── Hour (0-23)
└────────── Minute (0-59)
```

Examples:
- `0 9 * * *` = 9 AM daily
- `0 9 * * 1-5` = 9 AM weekdays only
- `0 */6 * * *` = Every 6 hours

## 🧪 Testing

### Test Locally:

1. **Run Test Post Script**:
   ```bash
   node scripts/create-test-post.js
   ```

2. **Check Results**:
   - Visit `/blog` to see the test post
   - Verify it's published
   - Check SEO metadata

3. **Test Publishing Function**:
   ```bash
   # Create a draft post via Blog Admin
   # Then manually trigger the publish function
   node scripts/daily-publish-node.js
   ```

### Test Serverless Function:

**Vercel**:
```bash
vercel dev
# Then visit: http://localhost:3000/api/daily-publish
```

**Netlify**:
```bash
netlify dev
# Function will be available at: http://localhost:8888/.netlify/functions/daily-publish
```

## 📊 Monitoring

### Check Logs:

**Vercel**:
- Dashboard → Functions → daily-publish → Logs

**Netlify**:
- Dashboard → Functions → daily-publish → Logs

**System Cron**:
```bash
tail -f /var/log/daily-publish.log
```

### Expected Output:
```
[2024-01-15T09:00:00.000Z] Starting daily publishing check...
📝 Found 1 draft post(s)
✅ Published: AI Blog Post Writer: Complete Guide
📊 Results:
   Published: 1
   Skipped: 0
   Errors: 0
```

## 🐛 Troubleshooting

### Posts Not Publishing:

1. **Check Supabase Connection**:
   - Verify environment variables are set
   - Test connection in Blog Admin

2. **Check RLS Policies**:
   - Ensure authenticated users can UPDATE posts
   - Run migration: `database/complete_migration.sql`

3. **Check Cron/Function**:
   - Verify cron is running (check logs)
   - Test function manually

4. **Check Post Status**:
   - Posts must be `status = 'draft'` to be published
   - Check in Blog Admin

### Function Errors:

1. **Timeout Issues**:
   - Increase function timeout in `vercel.json` or `netlify.toml`
   - Current: 60 seconds

2. **Memory Issues**:
   - Increase function memory if needed
   - Check function logs for errors

## ✅ Verification Checklist

- [ ] Test post created successfully
- [ ] Test post appears on `/blog`
- [ ] Cron/function is scheduled
- [ ] Environment variables are set
- [ ] Function logs show successful runs
- [ ] Draft posts are being published

## 🎯 Next Steps

1. **Create Test Post**:
   ```bash
   node scripts/create-test-post.js
   ```

2. **Deploy to Vercel/Netlify** (or set up cron)

3. **Wait for 9 AM** (or test manually)

4. **Verify Posts Published**:
   - Check `/blog` page
   - Check function logs

5. **Start Creating Content**:
   - Use Blog Admin to create posts
   - They'll auto-publish at 9 AM daily!

## 📝 Notes

- **Time Zone**: Cron uses server timezone (UTC for Vercel/Netlify)
- **Manual Override**: You can always publish manually via Blog Admin
- **Multiple Posts**: If multiple drafts exist, all will be published
- **Error Handling**: Failed posts are logged but don't stop others

## 🚀 You're Ready!

The auto-publishing system is fully set up. Just:
1. Deploy to Vercel/Netlify (or set up cron)
2. Create a test post
3. Wait for 9 AM (or test manually)
4. Start creating content daily!

**Posts will now auto-publish at 9 AM every day!** 🎉





