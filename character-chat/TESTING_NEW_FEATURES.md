# Testing New Features Guide

This guide helps you test the newly implemented features.

## 🚀 Quick Start

### 1. Start the Development Server

```bash
cd character-chat
npm run dev
```

The server should start on `http://localhost:3000`

### 2. Run Automated Tests

```bash
# Test context-aware filtering, voice matching, and character mapping
npm run test-features

# Map characters to source characters (anime/celebrities)
npm run map-characters

# Enhance all character profiles (mapping + voice matching)
npm run enhance-profiles
```

---

## 🧪 Manual Testing Guide

### 1. Test Context-Aware Content Filtering

**Goal**: Verify that fight-related words are allowed for fight announcer characters but blocked for others.

#### Steps:
1. Navigate to a fight announcer or sports commentator character chat
2. Try sending: **"When is the next big fight?"**
   - ✅ Should be **ALLOWED** for fight announcer/sports characters
   - ❌ Should be **BLOCKED** for regular characters

3. Try with other characters:
   - Regular teacher/professional → Should block
   - Fantasy warrior → Should allow (in context)

#### Expected Results:
- Fight announcer: ✅ Message goes through
- Regular character: ❌ Shows error: "Violent or aggressive content is not allowed."

---

### 2. Test Double Talking Fix

**Goal**: Verify that only one voice plays at a time, no overlapping audio.

#### Steps:
1. Open a character chat that has a greeting
2. Let the greeting auto-play
3. Immediately send a message (before greeting finishes)
4. Observe audio playback

#### Expected Results:
- ✅ Previous audio stops when new audio starts
- ✅ No overlapping voices
- ✅ Smooth transition between audio clips
- ✅ No double-talking at speech start

---

### 3. Test Voice-Character Matching

**Goal**: Verify that characters get voices matched with 80%+ accuracy.

#### Steps:
1. Run the test script:
   ```bash
   npm run test-features
   ```

2. Check the output - it should show:
   - Current voice for each character
   - Recommended voice based on matching
   - Match score (should be ≥80%)

3. Or test manually:
   - Navigate to different character chats
   - Check if voices match character personality/age/gender

#### Expected Results:
- ✅ Voices match character characteristics
- ✅ Young characters get young voices
- ✅ Male characters get male voices
- ✅ Match scores are ≥80%

---

### 4. Test Dialogue-Only Reading

**Goal**: Verify that only dialogue (text in quotes) is read, not action descriptions.

#### Steps:
1. Send a message that gets a response with both dialogue and actions:
   ```
   "Hello there!" *smiles warmly* "How are you doing today?"
   ```

2. Click the play button or let it auto-play

#### Expected Results:
- ✅ Only "Hello there! How are you doing today?" is spoken
- ❌ "*smiles warmly*" is NOT spoken
- ✅ Console shows: `[TTS] Extracted dialogue: Hello there! How are you doing today?`

---

### 5. Test Character Mapping

**Goal**: Verify that characters are mapped to real people/anime characters.

#### Steps:
1. Run the mapping script:
   ```bash
   npm run map-characters
   ```

2. Or map a specific character:
   ```bash
   npm run map-characters <character-id>
   ```

3. Check the database or script output for:
   - `sourceCharacterName`: Name of mapped character
   - `sourceCharacterUrl`: URL to source (Wikipedia/Fandom)
   - `sourceType`: "anime", "celebrity", or "real_person"
   - `mappingConfidence`: 0.0-1.0 confidence score

#### Expected Results:
- ✅ Fantasy characters mapped to anime characters
- ✅ Professional characters mapped to celebrities in that field
- ✅ Confidence scores stored
- ✅ Source URLs saved for reference

---

## 🔍 Verification Checklist

### Context-Aware Filtering
- [ ] Fight words allowed for fight announcer
- [ ] Fight words blocked for regular characters
- [ ] Fantasy characters allow fight words in context

### Double Talking Fix
- [ ] Only one voice plays at a time
- [ ] No overlapping audio
- [ ] Smooth transitions between clips
- [ ] No double-talking at speech start

### Voice Matching
- [ ] Voices match character gender
- [ ] Voices match character age
- [ ] Voices match character personality
- [ ] Match scores ≥80%
- [ ] Characters without good matches are flagged

### Dialogue Extraction
- [ ] Only quoted text is read
- [ ] Action descriptions are skipped
- [ ] Multiple dialogue parts are joined correctly
- [ ] Console logs show extracted dialogue

### Character Mapping
- [ ] Characters mapped to source characters
- [ ] Source URLs saved
- [ ] Confidence scores stored
- [ ] Keywords extracted and stored

---

## 🐛 Troubleshooting

### Context Filter Not Working
- Check that character metadata is being passed to filter
- Verify category/archetype values in database
- Check browser console for errors

### Double Talking Still Happening
- Check browser console for audio manager logs
- Verify audioManager.stop() is being called
- Check cooldown timing (200ms)

### Voice Matching Not Working
- Run `npm run test-features` to see detailed output
- Check if character keywords are extracted correctly
- Verify voice metadata has keywords

### Dialogue Not Extracted
- Check message format (must use single quotes: `'text'`)
- Check browser console for extraction logs
- Verify extractDialogueForTTS function is called

---

## 📊 Test Results Template

After testing, document results:

```
Date: [Date]
Tester: [Name]

Context-Aware Filtering:
- Fight announcer test: ✅/❌
- Regular character test: ✅/❌
- Notes: [Any issues]

Double Talking Fix:
- Greeting + message test: ✅/❌
- Rapid message test: ✅/❌
- Notes: [Any issues]

Voice Matching:
- Characters tested: [Number]
- Average match score: [Score]
- Issues found: [List]

Dialogue Extraction:
- Test messages: [Number]
- All working: ✅/❌
- Notes: [Any issues]

Character Mapping:
- Characters mapped: [Number]
- Success rate: [Percentage]
- Notes: [Any issues]
```


