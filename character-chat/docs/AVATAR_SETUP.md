# Avatar Setup Guide

## Current Avatar System

### Fantasy Characters (44 characters)
- **Service**: waifu.pics
- **Format**: `https://i.waifu.pics/{seed}.jpg`
- **Issue**: waifu.pics doesn't support seeded URLs directly
- **Solution**: Manual download required

### Realistic Human Characters (18 characters)
- **Service**: Dicebear Personas
- **Format**: `https://api.dicebear.com/7.x/personas/svg?seed={seed}&...`
- **Status**: Working (generates human-like faces)

### Generic/Miscellaneous Characters (28 characters)
- **Service**: Dicebear Avataaars (minimalist cartoon style)
- **Format**: `https://api.dicebear.com/7.x/avataaars/svg?seed={seed}&...`
- **Status**: Working (matches the provided minimalist cartoon design)

## Manual Download Instructions

### For Fantasy Characters (Waifu Images)

1. **Visit**: https://waifu.pics or https://thiswaifudoesnotexist.net
2. **Generate** waifu anime images for each fantasy character
3. **Save** with these exact file names:

```
waifu-swordsman.jpg
ancient-dragon-sage.jpg
elven-archer.jpg
dark-mage.jpg
paladin-knight.jpg
forest-guardian.jpg
demon-lord.jpg
... (see full list in scripts/generate-avatar-list.js)
```

4. **Place** in: `public/avatars/fantasy/`
5. **Update** seed file to use local paths: `/avatars/fantasy/{filename}.jpg`

### For Realistic Human Characters

Currently using Dicebear Personas which generates human-like faces. If you want more realistic faces:

1. **Visit**: https://thispersondoesnotexist.net or similar
2. **Generate** realistic human faces
3. **Save** with character IDs as filenames
4. **Place** in: `public/avatars/realistic/`
5. **Update** seed file to use local paths

## Quick Fix Script

Run this to see which characters need manual downloads:

```bash
node scripts/generate-avatar-list.js
```

This generates `docs/AVATAR_DOWNLOAD_LIST.md` with all file names.

## Alternative: Use Different Services

### For Fantasy (Waifu):
- **Option 1**: Use waifu.pics API (random, not seeded) - requires caching
- **Option 2**: Use thiswaifudoesnotexist.net (download manually)
- **Option 3**: Use a different anime image API that supports seeding

### For Realistic Humans:
- **Option 1**: Keep Dicebear Personas (working, but less realistic)
- **Option 2**: Use Generated Photos API (requires API key)
- **Option 3**: Use thispersondoesnotexist.net (download manually)

## Current Status

✅ **Generic characters**: Using Dicebear Avataaars (minimalist cartoon) - **WORKING**
✅ **Realistic characters**: Using Dicebear Personas (human-like) - **WORKING**
⚠️ **Fantasy characters**: Using waifu.pics format - **NEEDS MANUAL DOWNLOAD**

## Next Steps

1. Download waifu images manually for fantasy characters
2. Or implement waifu.pics API caching system
3. Or switch to a different anime image service




