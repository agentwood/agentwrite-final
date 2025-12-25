# Get Your Token and Push - Step by Step

## ⚠️ You Need Your ACTUAL Token

**Don't use placeholder text like:**
- ❌ `YOUR_TOKEN`
- ❌ `PASTE_YOUR_TOKEN_HERE`
- ❌ Any text that's not your real token

## Step 1: Get Your Personal Access Token

### Option A: If You Already Have a Token

1. Go to: **https://github.com/settings/tokens**
2. Find your token in the list
3. If you can't see it (tokens are hidden after creation), create a new one

### Option B: Create a New Token

1. Go to: **https://github.com/settings/tokens**
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. **Name it**: `AgentWrite Push` (or any name)
4. **Select expiration**: Your choice (90 days, 1 year, or no expiration)
5. **Select scope**: Check **`repo`** (full control of private repositories)
6. Click **"Generate token"** at the bottom
7. **⚠️ COPY THE TOKEN IMMEDIATELY** - You won't see it again!
   - It will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - It's about 40+ characters long
   - Starts with `ghp_`

## Step 2: Build Your Push Command

### The Template:
```bash
git push https://agentwood:YOUR_ACTUAL_TOKEN@github.com/agentwood/agentwrite-final.git main
```

### Replace `YOUR_ACTUAL_TOKEN` with what you copied

### Example:
If your token is: `ghp_abc123xyz789def456ghi012jkl345mno678pqr901`

Then your command is:
```bash
git push https://agentwood:ghp_abc123xyz789def456ghi012jkl345mno678pqr901@github.com/agentwood/agentwrite-final.git main
```

## Step 3: Run the Command

1. **Copy your actual token** from GitHub
2. **Paste it** into the command (replacing `YOUR_ACTUAL_TOKEN`)
3. **Run the complete command** in your terminal
4. Press Enter

## Visual Guide

```
1. GitHub Token Page:
   ┌─────────────────────────────────────┐
   │ ghp_abc123xyz789def456ghi012jkl... │ ← COPY THIS
   └─────────────────────────────────────┘

2. Your Command:
   git push https://agentwood:ghp_abc123xyz789def456ghi012jkl...@github.com/...
                              ↑
                         PASTE YOUR TOKEN HERE
```

## Common Mistakes

### ❌ Wrong:
```bash
git push https://agentwood:YOUR_TOKEN@github.com/...
git push https://agentwood:PASTE_YOUR_TOKEN_HERE@github.com/...
git push https://agentwood:ghp_@github.com/...  (incomplete token)
```

### ✅ Correct:
```bash
git push https://agentwood:ghp_abc123xyz789def456ghi012jkl345mno678pqr901@github.com/agentwood/agentwrite-final.git main
```

## Troubleshooting

### "Invalid username or token"
- ✅ Make sure you copied the ENTIRE token
- ✅ Make sure you replaced the placeholder text
- ✅ Verify the token hasn't expired
- ✅ Check the token has `repo` scope

### "Permission denied"
- ✅ Verify you have access to `agentwood/agentwrite-final`
- ✅ Make sure the token is for the correct GitHub account

## Quick Checklist

- [ ] Opened https://github.com/settings/tokens
- [ ] Created/copied a token (starts with `ghp_`)
- [ ] Token has `repo` scope enabled
- [ ] Copied the ENTIRE token
- [ ] Replaced placeholder text in command with actual token
- [ ] Ran the complete command

---

**Remember: You need your REAL token from GitHub, not placeholder text!**





