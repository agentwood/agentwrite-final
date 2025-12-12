# Common Errors & Quick Fixes

## 🔴 Common Errors You Might See

### 1. "Cannot find module" or "Module not found"
**Error**: `Error: Cannot find module 'xyz'` or `Failed to resolve import`

**Fix**:
```bash
npm install
```

### 2. "Port already in use"
**Error**: `Port 5173 is already in use`

**Fix**:
```bash
# Kill the process using the port
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

### 3. "TypeScript errors"
**Error**: Type errors in the console

**Fix**: Usually safe to ignore in dev, or check `tsconfig.json`

### 4. "Supabase not configured"
**Error**: `Supabase not configured` or `supabase is null`

**Fix**: Add to `.env`:
```env
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
```

### 5. "API_KEY not found"
**Error**: `API_KEY is not defined`

**Fix**: Add to `.env`:
```env
API_KEY=your-gemini-api-key
```

### 6. "CORS error"
**Error**: `CORS policy` or `Access-Control-Allow-Origin`

**Fix**: Check Supabase URL is correct

### 7. "Table does not exist"
**Error**: `relation "blog_posts" does not exist`

**Fix**: Run Supabase migration (`database/complete_migration.sql`)

## 📋 How to Get the Exact Error

### Browser Console:
1. Press **F12** (or right-click → Inspect)
2. Go to **Console** tab
3. Look for red error messages
4. Copy the full error text

### Terminal:
1. Look at the terminal where `npm run dev` is running
2. Copy any error messages shown

### Network Tab:
1. Press **F12**
2. Go to **Network** tab
3. Look for failed requests (red)
4. Click on them to see error details

## 🆘 Still Need Help?

Share:
1. **Exact error message** (copy/paste)
2. **Where it appears** (browser console, terminal, page)
3. **What page/action** triggers it
4. **Screenshot** if possible

