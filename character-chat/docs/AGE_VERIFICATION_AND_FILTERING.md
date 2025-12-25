# Age Verification & Content Filtering Guide

## Overview

Agentwood implements strict age verification (13+) and comprehensive content filtering to ensure a safe environment for all users.

---

## 1. Age Verification System

### Requirements
- **Minimum Age**: 13 years old (COPPA compliance)
- **Verification**: Required on signup and checked on app access
- **Storage**: Birth date stored securely in localStorage (production: database)

### Implementation

#### Signup Page (`/signup`)
- Requires birth date input
- Validates age is 13+ before allowing account creation
- Shows clear error messages for underage users
- Stores age verification flag in localStorage

#### Age Gate Component (`AgeGate.tsx`)
- Wraps entire app in `layout.tsx`
- Shows modal if age not verified
- Blocks access until age is verified
- Cannot be dismissed without verification

#### Auth System (`lib/auth.ts`)
- `isAgeVerified()` - Checks if user has verified age
- `getUserAge()` - Returns user's age
- `getSession()` - Requires age verification before creating session

### Usage:

```typescript
import { isAgeVerified, getUserAge } from '@/lib/auth';

// Check if age is verified
if (!isAgeVerified()) {
  // Redirect to signup or show age gate
}

// Get user age
const age = getUserAge(); // Returns: 18 or null
```

---

## 2. Content Filtering System

### Filter Categories

#### 1. Profanity Filter
**Patterns Detected:**
- Explicit profanity (f***, s***, etc.)
- Racial slurs
- Offensive language

**Action:** Blocks message, returns error

#### 2. Sexual Content Filter
**Patterns Detected:**
- Sexual terms and explicit content
- Sexual violence terms
- Inappropriate sexual references
- Adult content indicators

**Action:** Blocks message, returns error

#### 3. Aggression/Violence Filter
**Patterns Detected:**
- Threats of violence
- Self-harm references
- Aggressive language
- Violent actions

**Action:** Blocks user input, allows character responses in context (e.g., detective stories)

#### 4. Real-World Weapons Filter
**Patterns Detected:**
- Firearms (guns, pistols, rifles)
- Knives and blades
- Explosives
- Poisons

**Exceptions:**
- Fantasy weapons (swords, magic)
- Gaming context
- Story/fiction context

**Action:** Blocks message, suggests fantasy alternatives

### Enhanced Patterns

The filter has been enhanced with additional patterns:

**Profanity:**
- Extended variations (f***ing, sh***y, etc.)
- Additional offensive terms
- More comprehensive coverage

**Sexual Content:**
- More explicit terms
- Additional inappropriate references
- Adult content indicators (hentai, xxx, nsfw)

### API Integration

#### Chat API (`/api/chat`)
1. **User Input Filtering:**
   - Filters user messages before processing
   - Returns 400 error with reason if blocked

2. **AI Response Filtering:**
   - Filters AI responses before saving
   - Replaces blocked content with safe alternative
   - Marks response as filtered

#### Example Error Response:
```json
{
  "error": "Content not allowed",
  "reason": "Profanity is not allowed.",
  "filtered": true
}
```

### Usage:

```typescript
import { filterContent, shouldBlockResponse } from '@/lib/contentFilter';

// Filter user input
const result = filterContent(userText, true);
if (!result.allowed) {
  // Show error: result.reason
}

// Check AI response
const check = shouldBlockResponse(aiResponse);
if (check.blocked) {
  // Use alternative: check.alternative
}
```

---

## 3. User Flow

### New User Flow:
1. User visits site → Age Gate modal appears
2. User enters birth date → Validates 13+
3. If valid → Stores verification, allows access
4. If invalid → Shows error, blocks access

### Signup Flow:
1. User clicks "Sign Up"
2. Fills form including birth date
3. Age validated (must be 13+)
4. If valid → Account created, session started
5. If invalid → Error shown, signup blocked

### Existing User Flow:
1. User logs in
2. Age verification checked from localStorage
3. If verified → Access granted
4. If not verified → Redirected to signup

---

## 4. Security Considerations

### Current Implementation (Development):
- Age stored in localStorage
- Verification flag in localStorage
- Client-side validation

### Production Recommendations:
1. **Server-Side Validation:**
   - Store birth date in database (encrypted)
   - Validate age on server
   - Don't trust client-side only

2. **Additional Verification:**
   - Consider ID verification for sensitive features
   - Implement rate limiting on age checks
   - Log age verification attempts

3. **Privacy:**
   - Encrypt birth dates
   - Don't store full birth dates if not needed
   - Comply with GDPR/COPPA

---

## 5. Testing

### Age Verification Tests:
- [ ] Under 13 → Blocked
- [ ] Exactly 13 → Allowed
- [ ] Over 13 → Allowed
- [ ] Invalid date → Error shown
- [ ] No date → Error shown

### Content Filter Tests:
- [ ] Profanity → Blocked
- [ ] Sexual content → Blocked
- [ ] Violence (user) → Blocked
- [ ] Violence (character) → Allowed in context
- [ ] Real weapons → Blocked
- [ ] Fantasy weapons → Allowed
- [ ] Safe content → Allowed

---

## 6. Files Modified/Created

### Created:
- `app/(site)/signup/page.tsx` - Signup with age verification
- `app/(site)/login/page.tsx` - Login page
- `app/components/AgeGate.tsx` - Age verification modal
- `docs/AGE_VERIFICATION_AND_FILTERING.md` - This guide

### Modified:
- `lib/contentFilter.ts` - Enhanced filtering patterns
- `lib/auth.ts` - Added age verification checks
- `app/layout.tsx` - Wrapped with AgeGate
- `app/api/chat/route.ts` - Enhanced filtering

---

## 7. Compliance

### COPPA Compliance:
- ✅ Requires 13+ age
- ✅ Blocks underage users
- ✅ Stores age verification
- ✅ Clear age requirement notice

### Next Steps:
- [ ] Add server-side age validation
- [ ] Implement database storage for birth dates
- [ ] Add parental consent flow (if needed)
- [ ] Add age verification logging
- [ ] Review with legal team

---

## 8. Error Messages

### Age Verification Errors:
- "You must be at least 13 years old to use this service."
- "Please enter a valid birth date."
- "Birth date is required."

### Content Filter Errors:
- "Profanity is not allowed."
- "Sexual content is not allowed."
- "Violent or aggressive content is not allowed."
- "Discussion of real-world weapons is not allowed. Fantasy weapons are okay."

---

## Support

For questions or issues:
1. Check age verification in localStorage
2. Review content filter logs
3. Test with various input scenarios
4. Verify COPPA compliance requirements




