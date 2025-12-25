# Supabase Connection Troubleshooting

## 🔴 Error: "Failed to fetch (api.supabase.com)"

This error means your app can't connect to Supabase. Here's how to fix it:

## ✅ Quick Fixes

### 1. Check Environment Variables

**Problem**: Missing or incorrect Supabase credentials

**Solution**:
1. Create/check `.env` file in project root:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. **Get your credentials** from Supabase:
   - Go to: [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to: **Settings** → **API**
   - Copy:
     - **Project URL** → `VITE_SUPABASE_URL`
     - **anon public** key → `VITE_SUPABASE_ANON_KEY`

3. **Restart your dev server** after adding env vars:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

### 2. Verify Supabase Project Status

**Problem**: Project might be paused or deleted

**Solution**:
1. Go to Supabase dashboard
2. Check if project is **Active** (not paused)
3. If paused, click **"Resume"** or **"Restore"**

### 3. Check Network/CORS Issues

**Problem**: CORS or network blocking the connection

**Solution**:
1. **Check browser console** for CORS errors
2. **Verify Supabase URL** is correct (should be `https://xxx.supabase.co`)
3. **Check if you're behind a firewall/proxy**
4. **Try accessing Supabase dashboard** to verify it's accessible

### 4. Verify Supabase Client Initialization

**Problem**: Client not properly initialized

**Solution**:
Check `services/supabaseClient.ts`:
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Should both be defined
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? 'Set' : 'Missing');
```

## 🔍 Step-by-Step Diagnosis

### Step 1: Check Environment Variables

**In your terminal**:
```bash
# Check if .env file exists
ls -la .env

# View .env contents (be careful with keys!)
cat .env | grep SUPABASE
```

**Expected output**:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**If missing**:
- Create `.env` file
- Add the variables above
- Restart dev server

### Step 2: Verify Supabase Project

1. **Go to**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Check project status**:
   - ✅ Green = Active
   - ⚠️ Yellow = Paused
   - ❌ Red = Deleted/Error

3. **If paused**:
   - Click "Resume" button
   - Wait 1-2 minutes
   - Try again

### Step 3: Test Connection

**Add this to your code temporarily** (e.g., in `App.tsx` or a test page):

```typescript
import { supabase } from './services/supabaseClient';

// Test connection
async function testConnection() {
  if (!supabase) {
    console.error('❌ Supabase client not initialized');
    return;
  }

  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Connection error:', error);
    } else {
      console.log('✅ Connection successful!');
    }
  } catch (err) {
    console.error('❌ Fetch error:', err);
  }
}

// Call it
testConnection();
```

### Step 4: Check Browser Console

**Open browser DevTools** (F12):
1. Go to **Console** tab
2. Look for errors:
   - `Failed to fetch`
   - `CORS error`
   - `Network error`
   - `401 Unauthorized`
   - `404 Not Found`

**Common errors**:
- **CORS error**: Supabase URL might be wrong
- **401 Unauthorized**: Anon key is wrong
- **404 Not Found**: Project doesn't exist or URL is wrong
- **Network error**: Connection issue

## 🛠️ Common Solutions

### Solution 1: Missing .env File

**Create `.env` file**:
```bash
# In project root
touch .env
```

**Add content**:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Restart dev server**:
```bash
npm run dev
```

### Solution 2: Wrong Environment Variable Names

**Vite requires `VITE_` prefix**:
```env
# ✅ Correct
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# ❌ Wrong (won't work)
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

### Solution 3: Project Not Created

**If you haven't created a Supabase project**:
1. Go to [https://supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in details
4. Wait for project to be created (2-3 minutes)
5. Get credentials from Settings → API

### Solution 4: Database Not Migrated

**If tables don't exist**:
1. Run migration: `database/complete_migration.sql`
2. See: `SUPABASE_MIGRATION_STEPS.md`

### Solution 5: Network/Firewall Issues

**If behind corporate firewall**:
1. Check if `api.supabase.com` is accessible
2. Try from different network
3. Check firewall rules

**Test connection**:
```bash
curl https://your-project-id.supabase.co/rest/v1/
```

Should return JSON (might be an error, but connection works).

## 🔧 Advanced Troubleshooting

### Check Supabase Client Code

**File**: `services/supabaseClient.ts`

**Should look like**:
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
```

**If `supabase` is `null`**:
- Environment variables are missing
- Check `.env` file
- Restart dev server

### Add Debug Logging

**Temporarily add to `supabaseClient.ts`**:
```typescript
console.log('[Supabase Config] URL Present:', !!supabaseUrl);
console.log('[Supabase Config] Key Present:', !!supabaseAnonKey);
console.log('[Supabase Config] URL:', supabaseUrl?.substring(0, 30) + '...');
```

**Check browser console** for these logs.

### Test with curl

**Test Supabase API directly**:
```bash
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     https://YOUR_PROJECT_ID.supabase.co/rest/v1/blog_posts
```

**Expected**: JSON response (even if empty array)

## ✅ Verification Checklist

After fixing, verify:

- [ ] `.env` file exists in project root
- [ ] `VITE_SUPABASE_URL` is set (starts with `https://`)
- [ ] `VITE_SUPABASE_ANON_KEY` is set (starts with `eyJ`)
- [ ] Dev server restarted after adding env vars
- [ ] Supabase project is active (not paused)
- [ ] Migration has been run (tables exist)
- [ ] Browser console shows no errors
- [ ] Network tab shows successful requests to Supabase

## 🎯 Quick Test

**Create a test file**: `test-supabase.html`

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>
<body>
  <script>
    const supabaseUrl = 'YOUR_SUPABASE_URL';
    const supabaseKey = 'YOUR_ANON_KEY';
    
    const supabase = supabase.createClient(supabaseUrl, supabaseKey);
    
    supabase.from('blog_posts').select('*').limit(1)
      .then(({ data, error }) => {
        if (error) {
          console.error('❌ Error:', error);
        } else {
          console.log('✅ Success!', data);
        }
      });
  </script>
</body>
</html>
```

**Open in browser** and check console.

## 🆘 Still Not Working?

1. **Check Supabase Status**: [https://status.supabase.com](https://status.supabase.com)
2. **Verify Project Settings**: Settings → API → Check URL and keys
3. **Check Supabase Logs**: Dashboard → Logs → Postgres Logs
4. **Try Different Browser**: Rule out browser-specific issues
5. **Check Network Tab**: DevTools → Network → Look for failed requests

## 📝 Common Mistakes

1. ❌ **Forgot `VITE_` prefix** in env var names
2. ❌ **Didn't restart dev server** after adding env vars
3. ❌ **Using wrong URL** (should be `https://xxx.supabase.co`)
4. ❌ **Using service role key** instead of anon key
5. ❌ **Project is paused** or deleted
6. ❌ **Migration not run** (tables don't exist)
7. ❌ **Typo in env var names** (check spelling!)

## ✅ Expected Behavior

**When working correctly**:
- ✅ No "Failed to fetch" errors
- ✅ Blog Admin page loads
- ✅ Can create blog posts
- ✅ Can view blog posts
- ✅ No console errors

**If you see this, you're good!** 🎉




