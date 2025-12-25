# Next Steps Implementation Guide

This guide explains how to implement and use the new features: Authentication, Ads, Quota Management, and Error UX.

---

## 1. Authentication System

### Overview
A simple session-based authentication system using localStorage. In production, replace with proper JWT/cookie-based auth.

### Files Created:
- `lib/auth.ts` - Core authentication utilities

### Usage:

```typescript
import { getUserId, getSession, getAuthHeaders } from '@/lib/auth';

// Get current user ID
const userId = getUserId(); // Returns: "anon_1234567890_abc123" or null

// Get current session
const session = getSession(); // Returns: { id: string, planId: 'free' | 'starter' | 'pro' }

// Get headers for API requests
const headers = getAuthHeaders(); // Returns: { 'x-user-id': '...' }
```

### Integration:
All API routes already check for `x-user-id` header. Client components should include this header:

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...getAuthHeaders(), // Adds x-user-id header
  },
  body: JSON.stringify(data),
});
```

### Next Steps (Production):
1. Replace localStorage with secure cookies
2. Add JWT token generation/validation
3. Implement proper login/signup flows
4. Add password hashing and user management

---

## 2. Ad Display System

### Overview
Displays promotional banners to free users, encouraging upgrades. Hidden for premium users.

### Files Created:
- `app/components/AdBanner.tsx` - Ad banner component

### Variants:
- `banner` - Full-width banner at top of page
- `sidebar` - Compact sidebar ad
- `inline` - Small inline ad

### Usage:

```tsx
import AdBanner from '@/app/components/AdBanner';

// In your page/component
<AdBanner variant="banner" className="sticky top-0 z-10" />
<AdBanner variant="sidebar" />
<AdBanner variant="inline" />
```

### Current Implementation:
- ✅ Added to ChatWindow (banner variant)
- ✅ Added to Discover page (banner variant)
- ⚠️ Can be added to other pages as needed

### Customization:
Edit `AdBanner.tsx` to:
- Replace mock content with actual ad service (Google AdSense, etc.)
- Customize styling
- Add tracking/analytics

---

## 3. Quota Management

### Overview
Tracks and enforces daily usage limits for free users. Automatically resets daily.

### Files Created:
- `app/api/quota/reset/route.ts` - Quota reset endpoint
- `app/components/QuotaProgressBar.tsx` - Progress bar component
- `app/components/QuotaExceededModal.tsx` - Error modal component

### API Endpoints:

#### GET `/api/quota/reset`
Get current quota status for user.

**Headers:**
```
x-user-id: <user-id>
```

**Response:**
```json
{
  "quota": {
    "textReplies": 45,
    "ttsSeconds": 280,
    "callMinutes": 0,
    "lastResetDate": "2025-01-XXT00:00:00.000Z"
  }
}
```

#### POST `/api/quota/reset`
Reset all user quotas (admin only).

**Headers:**
```
x-admin-secret: <admin-secret-key>
```

**Response:**
```json
{
  "success": true,
  "resetCount": 150,
  "resetDate": "2025-01-XXT00:00:00.000Z"
}
```

### Daily Reset Setup:

#### Option 1: Cron Job (Recommended)
Set up a cron job to call the reset endpoint daily:

```bash
# Add to crontab (runs at midnight UTC)
0 0 * * * curl -X POST https://your-domain.com/api/quota/reset \
  -H "x-admin-secret: YOUR_ADMIN_SECRET"
```

#### Option 2: Vercel Cron (If using Vercel)
Create `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/quota/reset",
    "schedule": "0 0 * * *"
  }]
}
```

#### Option 3: Manual Reset
Call the endpoint manually when needed.

### Usage in Components:

```tsx
import QuotaProgressBar from '@/app/components/QuotaProgressBar';
import QuotaExceededModal from '@/app/components/QuotaExceededModal';

// Progress bar
<QuotaProgressBar type="messages" />
<QuotaProgressBar type="tts" />
<QuotaProgressBar type="calls" />

// Error modal
<QuotaExceededModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  type="messages"
  currentUsage={45}
  limit={50}
/>
```

### Current Implementation:
- ✅ Quota checks in `/api/chat` route
- ✅ Quota checks in `/api/tts` route
- ✅ Quota checks in `/api/live-token` route
- ✅ Error modal in ChatWindow
- ⚠️ Progress bars can be added to settings page

---

## 4. Error UX Improvements

### Overview
Better user experience when quotas are exceeded or errors occur.

### Files Created:
- `app/components/QuotaExceededModal.tsx` - Modal for quota errors
- `app/components/QuotaProgressBar.tsx` - Visual quota usage indicator

### Error Handling Flow:

1. **API Returns Error**:
```typescript
// In API route
if (quotaExceeded) {
  return NextResponse.json({
    error: 'Daily limit reached',
    quotaExceeded: true,
    currentUsage: 50,
    limit: 50,
    upgradeUrl: '/pricing',
  }, { status: 429 });
}
```

2. **Client Handles Error**:
```typescript
// In component
if (!response.ok) {
  const errorData = await response.json();
  if (errorData.quotaExceeded) {
    setQuotaModal({
      isOpen: true,
      type: 'messages',
      currentUsage: errorData.currentUsage,
      limit: errorData.limit,
    });
    return;
  }
}
```

3. **Modal Displays**:
The `QuotaExceededModal` shows:
- Clear error message
- Usage progress bar
- Upgrade benefits list
- Upgrade CTA button

### Current Implementation:
- ✅ Quota modal integrated in ChatWindow
- ✅ Progress bars available (can be added to settings)
- ⚠️ Can be added to other error scenarios

---

## 5. Navigation Fixes

### Issues Fixed:
- ✅ Sidebar "Library" link now points to `/library`
- ✅ Sidebar "Voice Studio" link now points to `/voice-studio`
- ✅ Removed duplicate "Explore" link

### Current Navigation Structure:

**Homepage (`/`)**:
- Sidebar navigation
- Character cards → `/c/[id]`
- Create button → `/create`

**Discover (`/discover`)**:
- Sidebar + Header navigation
- Character gallery with filters

**Chat (`/c/[id]`)**:
- Back button → `/`
- Sidebar with chat options

**All Routes Verified**:
- `/` - Landing page ✅
- `/discover` - Gallery ✅
- `/c/[id]` - Chat ✅
- `/call/[id]` - Audio call ✅
- `/create` - Character creation ✅
- `/library` - User library ✅
- `/voice-studio` - Voice testing ✅
- `/video` - AvatarFX ✅
- `/settings` - Settings ✅
- `/pricing` - Pricing ✅

---

## 6. Integration Checklist

### Authentication:
- [x] Create auth utilities (`lib/auth.ts`)
- [x] Add `getAuthHeaders()` to API requests
- [ ] Add auth context/provider (optional)
- [ ] Implement login/signup pages (future)

### Ads:
- [x] Create AdBanner component
- [x] Add to ChatWindow
- [x] Add to Discover page
- [ ] Add to other pages as needed
- [ ] Integrate with ad service (Google AdSense, etc.)

### Quota Management:
- [x] Create quota reset API
- [x] Add quota checks to chat API
- [x] Add quota checks to TTS API
- [x] Add quota checks to live-token API
- [ ] Set up daily cron job
- [ ] Add progress bars to settings page

### Error UX:
- [x] Create QuotaExceededModal
- [x] Create QuotaProgressBar
- [x] Integrate modal in ChatWindow
- [ ] Add progress bars to settings
- [ ] Add error handling to other components

### Navigation:
- [x] Fix sidebar links
- [x] Verify all routes work
- [ ] Add breadcrumbs (optional)
- [ ] Improve mobile navigation (optional)

---

## 7. Testing

### Test Authentication:
1. Open browser console
2. Check localStorage: `localStorage.getItem('agentwood_user_id')`
3. Should see anonymous user ID created

### Test Ads:
1. Set user plan to 'free' in localStorage
2. Visit pages - should see ad banners
3. Set plan to 'starter' - ads should disappear

### Test Quotas:
1. Send 50+ messages as free user
2. Should see quota exceeded modal
3. Check quota API: `GET /api/quota/reset` with `x-user-id` header

### Test Navigation:
1. Click all sidebar links
2. Verify correct pages load
3. Test back navigation

---

## 8. Production Considerations

### Security:
- Replace localStorage auth with secure cookies
- Add CSRF protection
- Rate limit API endpoints
- Validate all user inputs

### Performance:
- Cache quota data client-side
- Debounce quota checks
- Optimize ad loading

### Monitoring:
- Track quota usage metrics
- Monitor ad impressions
- Log authentication events
- Alert on quota reset failures

---

## 9. Next Steps

1. **Set up cron job** for daily quota reset
2. **Integrate ad service** (Google AdSense, etc.)
3. **Add progress bars** to settings page
4. **Implement login/signup** pages
5. **Add analytics** tracking
6. **Test thoroughly** before production

---

## Support

For questions or issues:
1. Check API route logs
2. Verify localStorage session
3. Check browser console for errors
4. Review quota reset cron job logs




