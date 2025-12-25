-- ============================================
-- SIMPLE POST INSERTION - WRITING FOCUSED
-- ============================================
-- Run this in Supabase SQL Editor
-- This will insert 5 writing-focused blog posts
-- ============================================

-- Insert first post
INSERT INTO blog_posts (
    title, slug, excerpt, content, author, category, tags, read_time, published_at, status, seo_title, seo_description, seo_keywords
) VALUES (
    'How to Write Better Dialogue: 7 Techniques That Bring Characters to Life',
    'how-to-write-better-dialogue',
    'Master the art of writing dialogue that feels natural and reveals character. Learn techniques for subtext, voice, and pacing that make your conversations memorable.',
    '# How to Write Better Dialogue

Dialogue is one of the most powerful tools in a writer''s arsenal. Great dialogue doesn''t just convey information—it reveals character, advances plot, and creates emotional resonance.

## 1. Use Subtext Instead of Exposition

Characters rarely say exactly what they mean. Instead of having characters explain their feelings directly, let their words hint at deeper emotions.

**Bad**: "I''m angry because you forgot our anniversary."

**Better**: "You know, I made reservations three weeks ago."

## 2. Give Each Character a Distinct Voice

Every character should sound unique. Consider their background, education, age, and personality when crafting their speech patterns.

## 3. Break Up Dialogue with Action

Intersperse dialogue with physical actions to show what characters are doing while they speak. This adds visual interest and reveals character.

## Conclusion

Great dialogue is a balance of authenticity and purpose. Every line should either reveal character, advance plot, or create tension.',
    'AgentWrite Team',
    'Writing Tips',
    ARRAY['dialogue', 'character development', 'writing craft', 'fiction writing'],
    8,
    NOW(),
    'published',
    'How to Write Better Dialogue: 7 Techniques That Bring Characters to Life',
    'Master the art of writing dialogue that feels natural and reveals character.',
    'dialogue writing, character development, writing tips, fiction writing'
)
ON CONFLICT (slug) DO NOTHING;

-- Insert second post
INSERT INTO blog_posts (
    title, slug, excerpt, content, author, category, tags, read_time, published_at, status, seo_title, seo_description, seo_keywords
) VALUES (
    'The Three-Act Structure: A Writer''s Guide to Story Architecture',
    'three-act-structure-writers-guide',
    'Understand the fundamental structure that underpins most successful stories. Learn how to apply the three-act structure to novels, short stories, and screenplays.',
    '# The Three-Act Structure

The three-act structure is one of the oldest and most reliable frameworks for storytelling. Understanding it can help you craft narratives that engage readers from beginning to end.

## Act I: Setup (25% of your story)

This is where you establish your world, introduce your protagonist, and present the inciting incident that sets the story in motion.

## Act II: Confrontation (50% of your story)

The longest act, where your protagonist faces obstacles, learns new skills, and moves toward their goal.

## Act III: Resolution (25% of your story)

The climax and resolution where conflicts are resolved and the character arc completes.

## Conclusion

The three-act structure provides a solid foundation for storytelling. Use it as a framework, but don''t be afraid to experiment.',
    'AgentWrite Team',
    'Creative Writing',
    ARRAY['story structure', 'plot', 'narrative', 'writing craft'],
    10,
    NOW() - INTERVAL '1 day',
    'published',
    'The Three-Act Structure: A Writer''s Guide to Story Architecture',
    'Understand the fundamental structure that underpins most successful stories.',
    'story structure, plot, narrative structure, writing craft'
)
ON CONFLICT (slug) DO NOTHING;

-- Insert third post
INSERT INTO blog_posts (
    title, slug, excerpt, content, author, category, tags, read_time, published_at, status, seo_title, seo_description, seo_keywords
) VALUES (
    'Character Development: Creating Memorable Protagonists and Antagonists',
    'character-development-memorable-characters',
    'Learn how to create complex, believable characters that readers will remember. Explore techniques for developing protagonists, antagonists, and supporting characters.',
    '# Character Development

Great stories are built on great characters. Whether you''re writing a novel, short story, or screenplay, compelling characters are essential.

## Understanding Character Types

### The Protagonist
Your main character should be relatable, active, flawed, and growing.

### The Antagonist
A strong antagonist has clear motivations, presents real obstacles, is complex, and challenges the protagonist.

## Character Development Techniques

1. Create Detailed Backstories
2. Define Core Values
3. Give Them Contradictions
4. Show, Don''t Tell
5. Create Character Arcs

## Conclusion

Memorable characters are the heart of great storytelling. Take time to develop them fully, and your stories will resonate with readers.',
    'AgentWrite Team',
    'Story Writing',
    ARRAY['character development', 'protagonist', 'antagonist', 'writing craft'],
    9,
    NOW() - INTERVAL '2 days',
    'published',
    'Character Development: Creating Memorable Protagonists and Antagonists',
    'Learn how to create complex, believable characters that readers will remember.',
    'character development, protagonist, antagonist, writing craft'
)
ON CONFLICT (slug) DO NOTHING;

-- Insert fourth post
INSERT INTO blog_posts (
    title, slug, excerpt, content, author, category, tags, read_time, published_at, status, seo_title, seo_description, seo_keywords
) VALUES (
    'World Building for Fiction Writers: Creating Immersive Settings',
    'world-building-fiction-writers',
    'Master the art of world building for fantasy, sci-fi, and contemporary fiction. Learn how to create settings that feel real and enhance your story.',
    '# World Building for Fiction Writers

Whether you''re writing fantasy, science fiction, or contemporary fiction, world building is crucial. A well-crafted world can become a character in itself.

## The Fundamentals of World Building

### Physical Geography
- Climate and weather patterns
- Terrain and natural resources
- Cities, towns, and settlements

### Social Structure
- Government and politics
- Economic systems
- Social classes and hierarchies

### Culture and History
- Languages and dialects
- Religions and belief systems
- Traditions and festivals

## World Building Techniques

1. Start Small, Expand Gradually
2. Show Through Character Experience
3. Maintain Internal Consistency
4. Use Details Sparingly
5. Consider Cause and Effect

## Conclusion

Great world building enhances your story without overwhelming it. Focus on what matters to your narrative.',
    'AgentWrite Team',
    'Creative Writing',
    ARRAY['world building', 'fantasy writing', 'setting', 'writing craft'],
    12,
    NOW() - INTERVAL '3 days',
    'published',
    'World Building for Fiction Writers: Creating Immersive Settings',
    'Master the art of world building for fantasy, sci-fi, and contemporary fiction.',
    'world building, fantasy writing, setting, writing craft'
)
ON CONFLICT (slug) DO NOTHING;

-- Insert fifth post
INSERT INTO blog_posts (
    title, slug, excerpt, content, author, category, tags, read_time, published_at, status, seo_title, seo_description, seo_keywords
) VALUES (
    'Overcoming Writer''s Block: 10 Strategies That Actually Work',
    'overcoming-writers-block-strategies',
    'Struggling with writer''s block? Discover proven strategies to get your creative juices flowing again and maintain consistent writing habits.',
    '# Overcoming Writer''s Block

Writer''s block affects every writer at some point. The good news? It''s not a permanent condition.

## 10 Strategies That Work

1. Change Your Environment
2. Write Something Terrible
3. Switch Projects
4. Set a Timer
5. Read Something Inspiring
6. Free Write
7. Talk It Out
8. Exercise
9. Lower Your Standards
10. Create a Routine

## When to Seek Help

If writer''s block persists for weeks and significantly impacts your life, consider talking to a writing coach or joining a writing group.

## Conclusion

Writer''s block is temporary. Try different strategies, be patient with yourself, and remember: the most important thing is to keep writing.',
    'AgentWrite Team',
    'Writing Tips',
    ARRAY['writers block', 'writing habits', 'creativity', 'productivity'],
    7,
    NOW() - INTERVAL '4 days',
    'published',
    'Overcoming Writer''s Block: 10 Strategies That Actually Work',
    'Struggling with writer''s block? Discover proven strategies to get your creative juices flowing again.',
    'writers block, writing habits, creativity, productivity'
)
ON CONFLICT (slug) DO NOTHING;

-- Verify posts were inserted
SELECT 
    COUNT(*) as total_posts,
    COUNT(*) FILTER (WHERE status = 'published') as published_posts
FROM blog_posts;

-- List the inserted posts
SELECT 
    title,
    slug,
    status,
    category,
    published_at
FROM blog_posts
WHERE status = 'published'
ORDER BY published_at DESC;




