# How to Use Your Personal Access Token

## ❌ Common Mistake

**Don't use the literal text "YOUR_TOKEN"!**

```bash
# ❌ WRONG - This won't work
git push https://agentwood:YOUR_TOKEN@github.com/agentwood/agentwrite-final.git main
```

## ✅ Correct Way

**Replace `YOUR_TOKEN` with your actual token:**

```bash
# ✅ CORRECT - Replace YOUR_TOKEN with your actual token
git push https://agentwood:ghp_YOUR_ACTUAL_TOKEN@github.com/agentwood/agentwrite-final.git main
```

## Step-by-Step

### 1. Get Your Token

1. Go to: https://github.com/settings/tokens
2. Find your token (or create a new one)
3. **Copy the ENTIRE token**
   - Should start with `ghp_`
   - Should be about 40+ characters long
   - Example: `ghp_abc123xyz789def456ghi012jkl345mno678pqr901`

### 2. Build the Command

Take this template:
```bash
git push https://agentwood:YOUR_TOKEN@github.com/agentwood/agentwrite-final.git main
```

Replace `YOUR_TOKEN` with your actual token:
```bash
git push https://agentwood:ghp_abc123xyz789def456ghi012jkl345mno678pqr901@github.com/agentwood/agentwrite-final.git main
```

### 3. Run the Command

Paste the complete command (with your actual token) into your terminal and press Enter.

## Example

If your token is `ghp_abc123xyz789def456ghi012jkl345mno678pqr901`, your command would be:

```bash
git push https://agentwood:ghp_abc123xyz789def456ghi012jkl345mno678pqr901@github.com/agentwood/agentwrite-final.git main
```

## Important Notes

- ⚠️ **Don't share your token** - it's like a password
- ✅ The token goes **between** `agentwood:` and `@github.com`
- ✅ Use the **entire token** - don't shorten it
- ✅ Make sure the token has `repo` scope enabled

## Troubleshooting

### "Invalid username or token"
- Make sure you replaced `YOUR_TOKEN` with your actual token
- Verify the token hasn't expired
- Check the token has `repo` scope

### "Permission denied"
- Verify you have access to the `agentwood/agentwrite-final` repository
- Make sure the token is for the correct GitHub account

---

**Remember: Replace YOUR_TOKEN with your actual token value!**

