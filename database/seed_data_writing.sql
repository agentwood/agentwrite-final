-- ============================================
-- SEED DATA FOR AGENTWRITE - WRITING FOCUSED
-- ============================================
-- Run this AFTER complete_migration.sql
-- This populates initial data with writing/creation focused content
-- ============================================

-- ============================================
-- SAMPLE BLOG POSTS - WRITING & CREATION FOCUSED
-- ============================================

-- Delete old marketing-focused posts
DELETE FROM blog_posts WHERE slug IN (
    'ultimate-guide-ai-video-marketing-2024',
    '100-video-ideas-brands-ai-generated',
    'content-marketing-automation-ai-tools-guide',
    'video-script-generator-ai-content-creation'
);

INSERT INTO blog_posts (
    title,
    slug,
    excerpt,
    content,
    author,
    category,
    tags,
    read_time,
    published_at,
    status,
    seo_title,
    seo_description,
    seo_keywords
) VALUES
(
    'How to Write Better Dialogue: 7 Techniques That Bring Characters to Life',
    'how-to-write-better-dialogue',
    'Master the art of writing dialogue that feels natural and reveals character. Learn techniques for subtext, voice, and pacing that make your conversations memorable.',
    '# How to Write Better Dialogue: 7 Techniques That Bring Characters to Life

Dialogue is one of the most powerful tools in a writer''s arsenal. Great dialogue doesn''t just convey information—it reveals character, advances plot, and creates emotional resonance. Here are seven techniques to elevate your dialogue writing.

## 1. Use Subtext Instead of Exposition

Characters rarely say exactly what they mean. Instead of having characters explain their feelings directly, let their words hint at deeper emotions.

**Bad**: "I''m angry because you forgot our anniversary."

**Better**: "You know, I made reservations three weeks ago."

## 2. Give Each Character a Distinct Voice

Every character should sound unique. Consider their background, education, age, and personality when crafting their speech patterns.

## 3. Break Up Dialogue with Action

Intersperse dialogue with physical actions to show what characters are doing while they speak. This adds visual interest and reveals character.

## 4. Use Dialogue to Create Conflict

Even in friendly conversations, characters can have different goals or perspectives. This creates natural tension.

## 5. Let Characters Interrupt Each Other

Real conversations are messy. Characters interrupt, talk over each other, and change subjects. This makes dialogue feel authentic.

## 6. Show, Don''t Tell Through Dialogue

Instead of narrating a character''s emotions, let their words and how they say them reveal their inner state.

## 7. Read Your Dialogue Aloud

If it sounds awkward when spoken, it needs revision. Reading aloud helps you catch unnatural phrasing and rhythm issues.

## Conclusion

Great dialogue is a balance of authenticity and purpose. Every line should either reveal character, advance plot, or create tension. Practice these techniques, and your dialogue will come alive.',
    'AgentWrite Team',
    'Writing Tips',
    ARRAY['dialogue', 'character development', 'writing craft', 'fiction writing'],
    8,
    NOW(),
    'published',
    'How to Write Better Dialogue: 7 Techniques That Bring Characters to Life',
    'Master the art of writing dialogue that feels natural and reveals character. Learn techniques for subtext, voice, and pacing.',
    'dialogue writing, character development, writing tips, fiction writing'
),
(
    'The Three-Act Structure: A Writer''s Guide to Story Architecture',
    'three-act-structure-writers-guide',
    'Understand the fundamental structure that underpins most successful stories. Learn how to apply the three-act structure to novels, short stories, and screenplays.',
    '# The Three-Act Structure: A Writer''s Guide to Story Architecture

The three-act structure is one of the oldest and most reliable frameworks for storytelling. Understanding it can help you craft narratives that engage readers from beginning to end.

## Act I: Setup (25% of your story)

This is where you establish your world, introduce your protagonist, and present the inciting incident that sets the story in motion.

### Key Elements:
- **Ordinary World**: Show your character''s life before everything changes
- **Inciting Incident**: The event that disrupts the status quo
- **Plot Point 1**: The moment your character commits to the journey

## Act II: Confrontation (50% of your story)

The longest act, where your protagonist faces obstacles, learns new skills, and moves toward their goal.

### Key Elements:
- **Rising Action**: Obstacles increase in difficulty
- **Midpoint**: A major revelation or reversal
- **Plot Point 2**: The lowest point, where all seems lost

## Act III: Resolution (25% of your story)

The climax and resolution where conflicts are resolved and the character arc completes.

### Key Elements:
- **Climax**: The final confrontation
- **Falling Action**: Consequences of the climax
- **Resolution**: The new normal

## Adapting the Structure

While the three-act structure is a guide, not a rule, understanding it helps you:
- Maintain narrative momentum
- Create satisfying character arcs
- Build toward meaningful climaxes
- Balance pacing throughout your story

## Conclusion

The three-act structure provides a solid foundation for storytelling. Use it as a framework, but don''t be afraid to experiment and adapt it to your unique story.',
    'AgentWrite Team',
    'Creative Writing',
    ARRAY['story structure', 'plot', 'narrative', 'writing craft'],
    10,
    NOW() - INTERVAL '1 day',
    'published',
    'The Three-Act Structure: A Writer''s Guide to Story Architecture',
    'Understand the fundamental structure that underpins most successful stories. Learn how to apply the three-act structure.',
    'story structure, plot, narrative structure, writing craft'
),
(
    'Character Development: Creating Memorable Protagonists and Antagonists',
    'character-development-memorable-characters',
    'Learn how to create complex, believable characters that readers will remember. Explore techniques for developing protagonists, antagonists, and supporting characters.',
    '# Character Development: Creating Memorable Protagonists and Antagonists

Great stories are built on great characters. Whether you''re writing a novel, short story, or screenplay, compelling characters are essential. Here''s how to create characters that feel real and memorable.

## Understanding Character Types

### The Protagonist
Your main character should be:
- **Relatable**: Readers need to connect with their struggles
- **Active**: They drive the story forward through their choices
- **Flawed**: Perfect characters are boring
- **Growing**: They should change over the course of the story

### The Antagonist
A strong antagonist:
- **Has clear motivations**: They believe they''re right
- **Presents real obstacles**: They''re a genuine threat
- **Is complex**: Not just evil for evil''s sake
- **Challenges the protagonist**: Forces growth and change

## Character Development Techniques

### 1. Create Detailed Backstories
Know your character''s history, even if it never appears in the story. This informs their behavior and motivations.

### 2. Define Core Values
What does your character believe? What would they die for? These values drive their decisions.

### 3. Give Them Contradictions
Real people are contradictory. A character who''s brave in battle but terrified of spiders is more interesting than one who''s simply brave.

### 4. Show, Don''t Tell
Reveal character through actions, dialogue, and choices rather than exposition.

### 5. Create Character Arcs
Characters should change over the course of the story. What do they learn? How do they grow?

## Writing Exercises

- Write a scene from your character''s childhood
- Create a list of 20 things your character loves and hates
- Write dialogue between your character and someone they disagree with
- Describe your character through the eyes of someone who dislikes them

## Conclusion

Memorable characters are the heart of great storytelling. Take time to develop them fully, and your stories will resonate with readers long after they finish reading.',
    'AgentWrite Team',
    'Story Writing',
    ARRAY['character development', 'protagonist', 'antagonist', 'writing craft'],
    9,
    NOW() - INTERVAL '2 days',
    'published',
    'Character Development: Creating Memorable Protagonists and Antagonists',
    'Learn how to create complex, believable characters that readers will remember. Explore techniques for character development.',
    'character development, protagonist, antagonist, writing craft'
),
(
    'World Building for Fiction Writers: Creating Immersive Settings',
    'world-building-fiction-writers',
    'Master the art of world building for fantasy, sci-fi, and contemporary fiction. Learn how to create settings that feel real and enhance your story.',
    '# World Building for Fiction Writers: Creating Immersive Settings

Whether you''re writing fantasy, science fiction, or contemporary fiction, world building is crucial. A well-crafted world can become a character in itself, enhancing your story and immersing readers.

## The Fundamentals of World Building

### Physical Geography
- Climate and weather patterns
- Terrain and natural resources
- Cities, towns, and settlements
- Transportation and communication

### Social Structure
- Government and politics
- Economic systems
- Social classes and hierarchies
- Laws and customs

### Culture and History
- Languages and dialects
- Religions and belief systems
- Traditions and festivals
- Historical events that shaped the world

## World Building Techniques

### 1. Start Small, Expand Gradually
Begin with what''s immediately relevant to your story, then add details as needed.

### 2. Show Through Character Experience
Let readers discover your world through your characters'' eyes rather than exposition dumps.

### 3. Maintain Internal Consistency
Create rules for your world and stick to them. Inconsistencies break immersion.

### 4. Use Details Sparingly
Not every detail needs to be explained. Leave some mystery for readers to imagine.

### 5. Consider Cause and Effect
How do the elements of your world interact? A change in one area should affect others.

## World Building Checklist

- [ ] Physical geography and climate
- [ ] Political systems and government
- [ ] Economic structures
- [ ] Social hierarchies
- [ ] Cultural practices and traditions
- [ ] Historical events and timeline
- [ ] Technology level (if applicable)
- [ ] Magic systems or special rules (if applicable)
- [ ] Languages and communication
- [ ] Daily life and customs

## Common Pitfalls to Avoid

- **Over-explaining**: Trust readers to fill in gaps
- **Inconsistency**: Keep track of your world''s rules
- **Generic settings**: Make your world unique
- **Ignoring consequences**: Consider how world elements affect each other

## Conclusion

Great world building enhances your story without overwhelming it. Focus on what matters to your narrative, maintain consistency, and let readers discover your world naturally.',
    'AgentWrite Team',
    'Creative Writing',
    ARRAY['world building', 'fantasy writing', 'setting', 'writing craft'],
    12,
    NOW() - INTERVAL '3 days',
    'published',
    'World Building for Fiction Writers: Creating Immersive Settings',
    'Master the art of world building for fantasy, sci-fi, and contemporary fiction. Learn how to create immersive settings.',
    'world building, fantasy writing, setting, writing craft'
),
(
    'Overcoming Writer''s Block: 10 Strategies That Actually Work',
    'overcoming-writers-block-strategies',
    'Struggling with writer''s block? Discover proven strategies to get your creative juices flowing again and maintain consistent writing habits.',
    '# Overcoming Writer''s Block: 10 Strategies That Actually Work

Writer''s block affects every writer at some point. The good news? It''s not a permanent condition. Here are ten strategies that can help you break through and get back to writing.

## 1. Change Your Environment

Sometimes a change of scenery is all you need. Try writing in a coffee shop, library, or park. New surroundings can spark creativity.

## 2. Write Something Terrible

Give yourself permission to write badly. Often, the pressure to write perfectly prevents us from writing at all. Write a "vomit draft" and fix it later.

## 3. Switch Projects

If you''re stuck on one project, work on something else for a while. Short stories, journaling, or even writing exercises can get your creative muscles moving.

## 4. Set a Timer

Commit to writing for just 15 minutes. Often, once you start, you''ll want to continue. The timer removes the pressure of a long writing session.

## 5. Read Something Inspiring

Read work by authors you admire. Sometimes seeing great writing reminds you why you love the craft and sparks new ideas.

## 6. Free Write

Set a timer for 10 minutes and write without stopping. Don''t edit, don''t think—just write. This can unlock ideas you didn''t know you had.

## 7. Talk It Out

Discuss your story with someone else. Explaining your plot, characters, or ideas can help you see solutions you hadn''t considered.

## 8. Exercise

Physical activity increases blood flow to the brain and can help with creative thinking. Take a walk, go for a run, or do some yoga.

## 9. Lower Your Standards

Perfectionism is a common cause of writer''s block. Remember: first drafts are supposed to be messy. You can always revise later.

## 10. Create a Routine

Consistency beats inspiration. Write at the same time every day, even if it''s just for 15 minutes. Habits are more reliable than motivation.

## When to Seek Help

If writer''s block persists for weeks and significantly impacts your life, consider:
- Talking to a writing coach or mentor
- Joining a writing group
- Seeking professional help if it''s affecting your mental health

## Conclusion

Writer''s block is temporary. Try different strategies, be patient with yourself, and remember: the most important thing is to keep writing, even when it''s hard.',
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
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    content = EXCLUDED.content,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    updated_at = NOW();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check blog posts were inserted
SELECT COUNT(*) as blog_posts_count FROM blog_posts WHERE status = 'published';

-- List all published posts
SELECT title, category, published_at FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC;




