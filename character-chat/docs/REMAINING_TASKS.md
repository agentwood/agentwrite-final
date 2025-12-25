# Remaining Tasks Summary

## ✅ Completed

1. **Character Consistency** - Strengthened prompts to prevent breaking character
2. **Style Selector Removed** - Removed from ChatSidebar (only in character creation)
3. **Database Schema** - Added `saveCount`, `commentCount`, `CharacterSave`, `CharacterComment` models
4. **API Endpoints** - Created `/api/personas/[id]/save` and `/api/personas/[id]/comments`

## 🔄 In Progress / Remaining

### 1. Update Pricing Page
- Replace current pricing with new structure:
  - Free: $0/forever
  - Pro: $7.99/month (Most Popular)
  - Lifetime: $79 one-time
- Update `/api/pricing/route.ts` to return new structure
- Update pricing page UI to match new layout

### 2. Real Counters in UI
- Update `ChatSidebar` to fetch and display real `saveCount`, `commentCount`, `viewCount`
- Update character cards to show real counters
- Implement save/favorite button functionality
- Add comment section to character pages

### 3. Avatar Images Fix
- Download images from waifu.pics for fantasy characters
- Store in `/public/avatars/` directory
- Update `avatarUrl` in database to point to local files
- Create script to download and organize avatars

### 4. Database Migration
- Run `npx prisma db push` to apply schema changes
- Migrate existing data if needed

## Next Steps

1. Update pricing API and page
2. Add UI components for save/comment
3. Create avatar download script
4. Test all functionality
5. Deploy changes



