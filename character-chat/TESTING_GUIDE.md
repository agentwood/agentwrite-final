# Local Testing Guide

## 🚀 Starting the Server

The dev server should be running on: **http://localhost:3000**

If not running, start it with:
```bash
cd character-chat
npm run dev
```

---

## ✅ Testing Checklist

### 1. Age Verification Testing

#### Test Age Gate Modal:
1. **Clear localStorage** (to simulate new user):
   ```javascript
   // Open browser console (F12)
   localStorage.clear()
   // Refresh page
   ```

2. **Expected Behavior:**
   - Age Gate modal should appear immediately
   - Cannot dismiss without verification
   - Must enter birth date

3. **Test Cases:**
   - ✅ **Under 13**: Enter birth date < 13 years ago → Should show error "You must be at least 13 years old"
   - ✅ **Exactly 13**: Enter birth date exactly 13 years ago → Should verify and allow access
   - ✅ **Over 13**: Enter birth date > 13 years ago → Should verify and allow access
   - ✅ **Invalid date**: Leave empty → Should show error "Birth date is required"

#### Test Signup Page:
1. Navigate to: **http://localhost:3000/signup**

2. **Test Cases:**
   - ✅ Try signing up with age < 13 → Should block signup
   - ✅ Try signing up with age ≥ 13 → Should allow signup
   - ✅ Check email validation → Should validate email format
   - ✅ Check password match → Should validate passwords match
   - ✅ Submit valid form → Should create account and redirect

#### Test Login Page:
1. Navigate to: **http://localhost:3000/login**

2. **Test Cases:**
   - ✅ Login without age verification → Should show error
   - ✅ Login after age verification → Should allow login

---

### 2. Content Filtering Testing

#### Test Profanity Filter:
1. Navigate to any character chat: **http://localhost:3000/c/[character-id]**

2. **Test Messages:**
   - Try: "What the f***?" → Should be blocked
   - Try: "That's sh***y" → Should be blocked
   - Try: "You're a b***h" → Should be blocked
   - Try: "Hello, how are you?" → Should be allowed

3. **Expected Behavior:**
   - Blocked messages show error: "Profanity is not allowed."
   - Message doesn't appear in chat
   - Error message displayed to user

#### Test Sexual Content Filter:
1. **Test Messages:**
   - Try: "Tell me about sex" → Should be blocked
   - Try: "What is pornography?" → Should be blocked
   - Try: "I like romantic stories" → Should be allowed (context matters)

2. **Expected Behavior:**
   - Blocked messages show error: "Sexual content is not allowed."
   - Message doesn't appear in chat

#### Test Violence Filter:
1. **Test Messages:**
   - Try: "I want to kill someone" → Should be blocked
   - Try: "Let's fight" → Should be blocked
   - Try: "The knight fought the dragon" → Should be allowed (fantasy context)

2. **Expected Behavior:**
   - User violent messages blocked
   - Character responses in fantasy context allowed

#### Test Weapons Filter:
1. **Test Messages:**
   - Try: "I have a gun" → Should be blocked
   - Try: "Let's use a knife" → Should be blocked
   - Try: "The wizard's magic sword" → Should be allowed (fantasy)
   - Try: "In the game, I use a sword" → Should be allowed (gaming context)

2. **Expected Behavior:**
   - Real weapons blocked
   - Fantasy weapons allowed
   - Gaming context allowed

#### Test AI Response Filtering:
1. Send a message that might trigger inappropriate response
2. **Expected Behavior:**
   - If AI tries to respond with inappropriate content
   - Response is replaced with: "I'm sorry, I can't discuss that topic. Is there something else you'd like to talk about?"

---

### 3. Navigation Testing

#### Test All Routes:
- ✅ `/` - Homepage (should show age gate if not verified)
- ✅ `/signup` - Signup page
- ✅ `/login` - Login page
- ✅ `/discover` - Character gallery
- ✅ `/c/[id]` - Character chat
- ✅ `/create` - Character creation (premium gated)
- ✅ `/voice-studio` - Voice studio (premium gated)
- ✅ `/video` - AvatarFX (premium gated)
- ✅ `/settings` - Settings
- ✅ `/pricing` - Pricing

#### Test Sidebar Navigation:
- ✅ All links should work correctly
- ✅ Library → `/library`
- ✅ Voice Studio → `/voice-studio`
- ✅ Discover → `/discover`

---

### 4. Authentication Testing

#### Test Session Management:
1. **Check localStorage:**
   ```javascript
   // In browser console
   localStorage.getItem('agentwood_user_session')
   localStorage.getItem('agentwood_age_verified')
   localStorage.getItem('agentwood_birth_date')
   localStorage.getItem('agentwood_age')
   ```

2. **Expected Values:**
   - `agentwood_age_verified`: "true"
   - `agentwood_birth_date`: Your birth date
   - `agentwood_age`: Your age as number string
   - `agentwood_user_session`: User session object

#### Test API Headers:
1. Open Network tab in DevTools
2. Send a chat message
3. Check request headers:
   - Should include: `x-user-id: <user-id>`

---

### 5. Quick Test Script

Run this in browser console to test age verification:

```javascript
// Clear age verification
localStorage.removeItem('agentwood_age_verified')
localStorage.removeItem('agentwood_birth_date')
localStorage.removeItem('agentwood_age')

// Refresh page - should show age gate
location.reload()

// Verify age (replace with valid date)
localStorage.setItem('agentwood_age_verified', 'true')
localStorage.setItem('agentwood_birth_date', '2000-01-01')
localStorage.setItem('agentwood_age', '24')

// Refresh - should allow access
location.reload()
```

---

## 🐛 Common Issues & Fixes

### Issue: Age Gate not showing
**Fix:** Clear localStorage and refresh:
```javascript
localStorage.clear()
location.reload()
```

### Issue: Content filter not working
**Fix:** Check browser console for errors, verify API is running

### Issue: Signup not working
**Fix:** Check form validation, ensure all fields filled correctly

### Issue: Navigation links broken
**Fix:** Verify routes exist in `app/(site)/` directory

---

## 📊 Test Results Template

```
Age Verification:
- [ ] Age gate appears for new users
- [ ] Under 13 blocked
- [ ] 13+ allowed
- [ ] Signup requires age
- [ ] Login checks age verification

Content Filtering:
- [ ] Profanity blocked
- [ ] Sexual content blocked
- [ ] Violence blocked (user)
- [ ] Real weapons blocked
- [ ] Fantasy weapons allowed
- [ ] AI responses filtered

Navigation:
- [ ] All routes accessible
- [ ] Sidebar links work
- [ ] Header links work
- [ ] Back navigation works
```

---

## 🎯 Next Steps After Testing

1. **If all tests pass:** Ready for production
2. **If issues found:** Check console logs, verify API responses
3. **Report bugs:** Note any edge cases or unexpected behavior

---

## 📝 Notes

- Age verification is stored in localStorage (development)
- In production, should be stored in database
- Content filter patterns can be adjusted in `lib/contentFilter.ts`
- Age requirement can be changed in signup/login pages




