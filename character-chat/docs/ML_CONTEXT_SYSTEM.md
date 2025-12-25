# ML Context System Documentation

## Overview

The ML Context System enables characters to learn, remember, and evolve over time, creating unique chatbot experiences that improve with each interaction.

## Key Features

### 1. **Character Memory**
- **User-specific memory**: Characters remember facts, preferences, and patterns for each user
- **Global memory**: Characters also learn general patterns across all users
- **Confidence scoring**: Tracks how well a character "knows" a user

### 2. **Pattern Recognition**
- **Topic preferences**: Learns what topics users are interested in
- **Communication style**: Adapts to user's preferred communication style (brief, detailed, casual, etc.)
- **Response preferences**: Learns preferred response length and tone

### 3. **Character Evolution**
- **Version tracking**: Characters evolve through versions
- **Performance metrics**: Tracks response quality, user satisfaction, engagement
- **Automatic improvements**: Characters improve based on feedback and patterns

### 4. **Feedback Learning**
- **Rating system**: 1-5 star ratings
- **Quick feedback**: Thumbs up/down
- **Text feedback**: Optional detailed feedback
- **Pattern learning**: Extracts patterns from feedback

## Database Schema

### CharacterMemory
Stores user-specific and global character memory:
- `facts`: Key facts about the user
- `preferences`: User preferences and likes/dislikes
- `patterns`: Communication patterns
- `emotionalState`: Current emotional context
- `confidenceScore`: How well character knows user (0-1)

### ConversationPattern
Stores learned patterns:
- `patternType`: "topic", "style", "emotion", "preference"
- `patternKey`: Pattern identifier
- `patternValue`: Pattern data (JSON)
- `frequency`: How often pattern appears
- `confidence`: Confidence in pattern (0-1)

### CharacterEvolution
Tracks character evolution:
- `version`: Evolution version number
- `improvements`: List of improvements made
- `performanceMetrics`: Response quality metrics
- `totalInteractions`: Total conversation count
- `averageRating`: Average user rating
- `responseQuality`: Overall response quality score

### MessageFeedback
Stores user feedback:
- `rating`: 1-5 star rating
- `thumbsUp`/`thumbsDown`: Quick feedback
- `feedbackText`: Optional text feedback
- `learnedPattern`: Pattern extracted from feedback

## API Endpoints

### POST /api/chat
Enhanced with ML context:
- Automatically extracts patterns from conversations
- Uses learned memory to enhance system prompts
- Updates character memory with new information

### POST /api/feedback
Record user feedback:
```json
{
  "messageId": "msg_123",
  "rating": 5,
  "thumbsUp": true,
  "feedbackText": "Great response!"
}
```

## Usage Examples

### Getting Character Memory
```typescript
import { getCharacterMemory } from '@/lib/ml/contextSystem';

const memory = await getCharacterMemory(personaId, userId);
console.log(memory.facts); // { userName: "John", ... }
console.log(memory.preferences); // { responseLength: "short", ... }
```

### Updating Memory
```typescript
import { updateCharacterMemory } from '@/lib/ml/contextSystem';

await updateCharacterMemory(personaId, userId, {
  facts: { favoriteColor: "blue" },
  preferences: { responseLength: "short" },
});
```

### Building Enhanced Prompts
```typescript
import { buildEnhancedSystemPrompt } from '@/lib/ml/contextSystem';

const enhancedPrompt = await buildEnhancedSystemPrompt(
  personaId,
  basePrompt,
  userId
);
// Includes memory, preferences, and learned patterns
```

### Recording Feedback
```typescript
import { recordFeedback } from '@/lib/ml/contextSystem';

await recordFeedback(messageId, userId, {
  rating: 5,
  thumbsUp: true,
});
```

## Evolution System

Characters automatically evolve based on:
- User feedback scores
- Conversation patterns
- Response quality metrics
- Engagement levels

Evolution happens:
- After significant interactions (10+ conversations)
- Based on feedback patterns
- When performance metrics change

## Future Enhancements

1. **NLP-based pattern extraction**: Use AI to extract more sophisticated patterns
2. **Emotional state tracking**: Track and adapt to user emotional states
3. **Multi-modal learning**: Learn from images, audio, and text
4. **Cross-character learning**: Share patterns between similar characters
5. **Predictive responses**: Predict user needs based on patterns

## Performance Considerations

- Memory is cached per conversation
- Patterns are aggregated to reduce database load
- Evolution runs asynchronously (via cron jobs)
- Feedback processing is non-blocking

## Monitoring

Track these metrics:
- Average confidence scores
- Pattern recognition accuracy
- User satisfaction trends
- Evolution frequency
- Response quality improvements



