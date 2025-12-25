-- ============================================
-- SEED DATA FOR AGENTWRITE
-- ============================================
-- Run this AFTER complete_migration.sql
-- This populates initial data for testing
-- ============================================

-- ============================================
-- SAMPLE BLOG POSTS
-- ============================================

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
    'Ultimate Guide to AI Video Marketing: Boost Your Brand in 2024',
    'ultimate-guide-ai-video-marketing-2024',
    'Discover how AI video marketing tools are transforming content creation. Learn strategies, tools, and best practices for generating video ideas and automating your marketing workflow.',
    '# Ultimate Guide to AI Video Marketing: Boost Your Brand in 2024

Video marketing has become the cornerstone of modern digital marketing strategies. With AI-powered tools revolutionizing content creation, brands can now produce high-quality video content at scale. This comprehensive guide will walk you through everything you need to know about AI video marketing.

## What is AI Video Marketing?

AI video marketing leverages artificial intelligence to automate and enhance video content creation, from ideation to production. These tools can generate video scripts, create video concepts, and even produce complete video content.

## Key Benefits of AI Video Marketing

1. **Scalability**: Create unlimited video content without proportional increases in time and resources
2. **Cost-Effectiveness**: Reduce production costs by automating script writing and ideation
3. **Consistency**: Maintain brand voice and messaging across all video content
4. **Speed**: Generate video ideas and scripts in minutes instead of hours

## Top AI Video Marketing Tools

### 1. Video Idea Generators
AI-powered tools that generate creative video concepts based on your brand, industry, and marketing goals.

### 2. Video Script Generators
Automated script writing tools that create engaging video scripts tailored to your audience.

### 3. Content Automation Platforms
Comprehensive solutions that handle everything from ideation to content distribution.

## Best Practices for AI Video Marketing

- **Define Your Brand Voice**: Ensure AI tools understand your brand''s tone and style
- **Focus on Value**: Create content that provides genuine value to your audience
- **Test and Iterate**: Use analytics to refine your video marketing strategy
- **Combine AI with Human Creativity**: Use AI for ideation and automation, but add human touch for final polish

## Conclusion

AI video marketing is transforming how brands create and distribute video content. By leveraging these tools effectively, you can scale your video marketing efforts while maintaining quality and brand consistency.',
    'AgentWrite Team',
    'Video Marketing',
    ARRAY['AI video marketing', 'video ideas', 'content marketing', 'marketing automation'],
    8,
    NOW(),
    'published',
    'Ultimate Guide to AI Video Marketing: Boost Your Brand in 2024',
    'Discover how AI video marketing tools are transforming content creation. Learn strategies, tools, and best practices.',
    'AI video marketing, video ideas, content marketing, marketing automation'
),
(
    '100 Video Ideas for Brands: AI-Generated Concepts That Convert',
    '100-video-ideas-brands-ai-generated',
    'Never run out of video content ideas. Our AI-powered generator creates unlimited creative video concepts tailored to your brand, industry, and marketing goals.',
    '# 100 Video Ideas for Brands: AI-Generated Concepts That Convert

Running out of video content ideas? You''re not alone. Content creators and marketers constantly struggle with ideation. This is where AI-powered video idea generators come in.

## Why Video Ideas Matter

Great video content starts with great ideas. Without compelling concepts, even the best production quality won''t save your video from being ignored.

## Categories of Video Ideas

### Product Demos
Showcase your product''s features and benefits through engaging demonstrations.

### Behind-the-Scenes
Give your audience a glimpse into your company culture and processes.

### Customer Testimonials
Let satisfied customers tell your brand''s story.

### Educational Content
Teach your audience something valuable related to your industry.

### Entertainment
Create fun, shareable content that builds brand awareness.

## How AI Generates Video Ideas

AI video idea generators analyze:
- Your industry and target audience
- Current marketing trends
- Successful video formats
- Your brand''s unique value proposition

## Top 10 Video Ideas for 2024

1. **Day in the Life**: Show a typical day using your product
2. **Problem-Solution**: Address common customer pain points
3. **Expert Interviews**: Feature industry thought leaders
4. **Tutorial Series**: Step-by-step guides
5. **Product Launches**: Exciting reveal videos
6. **Customer Success Stories**: Real results from real customers
7. **Company Culture**: Show what makes your team unique
8. **Industry Insights**: Share your expertise
9. **Trending Topics**: Capitalize on current events
10. **Interactive Content**: Polls, Q&As, and live sessions

## Conclusion

With AI-powered video idea generators, you''ll never run out of creative concepts. Start generating ideas today and watch your video marketing performance soar.',
    'AgentWrite Team',
    'Video Ideas',
    ARRAY['video ideas', 'brand content', 'social media', 'content ideas'],
    6,
    NOW() - INTERVAL '1 day',
    'published',
    '100 Video Ideas for Brands: AI-Generated Concepts That Convert',
    'Never run out of video content ideas. Our AI-powered generator creates unlimited creative video concepts.',
    'video ideas, brand content, social media, content ideas'
),
(
    'Content Marketing Automation: Complete Guide to AI Tools',
    'content-marketing-automation-ai-tools-guide',
    'Streamline your content creation process with AI-powered automation. Learn how to generate blog posts, social media content, and marketing copy at scale.',
    '# Content Marketing Automation: Complete Guide to AI Tools

Streamline your content creation process with AI-powered automation. Learn how to generate blog posts, social media content, and marketing copy at scale.

## What is Content Marketing Automation?

Content marketing automation uses AI and technology to streamline the content creation process, from ideation to distribution.

## Benefits of Automation

1. **Save Time**: Generate content in minutes instead of hours
2. **Scale Production**: Create unlimited content without proportional resource increases
3. **Maintain Consistency**: Ensure brand voice across all content
4. **Reduce Costs**: Eliminate need for large content teams

## Top AI Tools for Content Marketing

### 1. AgentWrite
Complete content marketing suite with video ideas, scripts, and content generation.

### 2. Jasper
Popular AI writing tool for blog posts and marketing copy.

### 3. Copy.ai
AI-powered copywriting for ads, emails, and social media.

### 4. Writesonic
Content generation platform for blogs, ads, and product descriptions.

## Best Practices

- Start with clear content strategy
- Define your brand voice
- Use AI for ideation and first drafts
- Always review and edit AI-generated content
- Track performance and iterate

## Conclusion

Content marketing automation is essential for scaling your content strategy. Choose the right tools and processes to maximize efficiency while maintaining quality.',
    'AgentWrite Team',
    'Content Marketing',
    ARRAY['content automation', 'AI tools', 'marketing', 'content creation'],
    10,
    NOW() - INTERVAL '2 days',
    'published',
    'Content Marketing Automation: Complete Guide to AI Tools',
    'Streamline your content creation process with AI-powered automation. Learn how to generate content at scale.',
    'content automation, AI tools, marketing, content creation'
),
(
    'Video Script Generator: How AI Transforms Content Creation',
    'video-script-generator-ai-content-creation',
    'Create compelling video scripts in minutes, not hours. Learn how AI script generators work and how to use them effectively for your marketing campaigns.',
    '# Video Script Generator: How AI Transforms Content Creation

Create compelling video scripts in minutes, not hours. Learn how AI script generators work and how to use them effectively for your marketing campaigns.

## What is a Video Script Generator?

A video script generator uses AI to automatically create video scripts based on your topic, format, and target audience.

## How It Works

1. Input your topic and video type
2. AI analyzes successful scripts in that format
3. Generates a complete script with scene descriptions
4. You review and customize as needed

## Benefits

- Save hours of writing time
- Ensure proper video structure
- Maintain consistent quality
- Generate multiple variations quickly

## Best Practices

- Provide clear, specific prompts
- Review and edit AI-generated scripts
- Add your brand voice and personality
- Include visual cues and timing
- Test different script variations

## Conclusion

AI video script generators are revolutionizing content creation. Use them to scale your video production while maintaining quality.',
    'AgentWrite Team',
    'Video Marketing',
    ARRAY['video scripts', 'AI writing', 'content creation', 'video production'],
    7,
    NOW() - INTERVAL '3 days',
    'published',
    'Video Script Generator: How AI Transforms Content Creation',
    'Create compelling video scripts in minutes with AI. Learn how to use video script generators effectively.',
    'video scripts, AI writing, content creation, video production'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SAMPLE CHANGELOG ENTRIES
-- ============================================

INSERT INTO changelog_entries (
    title,
    description,
    date,
    category,
    tags,
    version,
    published
) VALUES
(
    'Video Script Generator - New AI Tool',
    'Introducing our new AI-powered video script generator. Create professional scripts for YouTube, social media, and marketing videos in minutes. Supports multiple formats including product demos, tutorials, testimonials, and brand stories.',
    CURRENT_DATE,
    'feature',
    ARRAY['video', 'script', 'AI', 'new feature'],
    '2.1.0',
    true
),
(
    'Blog System Launch',
    'We''ve launched our new blog system with full database integration. Publish SEO-optimized articles daily to improve keyword rankings and drive organic traffic. Includes category filtering, search functionality, and related posts.',
    CURRENT_DATE,
    'feature',
    ARRAY['blog', 'SEO', 'content'],
    '2.0.0',
    true
),
(
    'Enhanced Video Ideas Generator',
    'Improved the video ideas generator with better AI prompts and more creative output. Now generates more specific, actionable video concepts tailored to your industry and video type.',
    CURRENT_DATE - INTERVAL '1 day',
    'improvement',
    ARRAY['video ideas', 'AI', 'improvement'],
    NULL,
    true
),
(
    'SEO Landing Pages Added',
    'Created three new SEO-optimized landing pages: Content Marketing AI, Video Script Generator, and Video Marketing Tools. Each page targets specific high-value keywords and includes comparison tables, use cases, and CTAs.',
    CURRENT_DATE - INTERVAL '1 day',
    'feature',
    ARRAY['SEO', 'landing pages', 'marketing'],
    NULL,
    true
),
(
    'Image Generation Fix',
    'Fixed image generation issues in AICreatePage and PersonaPage. Updated API calls to use correct Gemini model and improved error handling for better reliability.',
    CURRENT_DATE - INTERVAL '2 days',
    'fix',
    ARRAY['bug fix', 'images', 'API'],
    NULL,
    true
),
(
    'Navigation Improvements',
    'Enhanced navigation with blog link, improved mobile menu, and better dropdown functionality. Added quick access to all major features from the main navigation.',
    CURRENT_DATE - INTERVAL '3 days',
    'improvement',
    ARRAY['UI', 'navigation', 'UX'],
    NULL,
    true
),
(
    'Footer Redesign',
    'Completely redesigned footer with better organization, social links, and free tools section. Matches modern design standards similar to Sudowrite and other leading SaaS platforms.',
    CURRENT_DATE - INTERVAL '4 days',
    'improvement',
    ARRAY['UI', 'footer', 'design'],
    NULL,
    true
),
(
    'Business Page Launch',
    'Launched dedicated Business page for enterprise customers. Includes team collaboration features, enterprise security, custom AI models, advanced analytics, and priority support information.',
    CURRENT_DATE - INTERVAL '5 days',
    'feature',
    ARRAY['business', 'enterprise', 'B2B'],
    NULL,
    true
)
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check blog posts were inserted
SELECT COUNT(*) as blog_posts_count FROM blog_posts;

-- Check changelog entries were inserted
SELECT COUNT(*) as changelog_entries_count FROM changelog_entries;

-- Check categories were inserted
SELECT COUNT(*) as categories_count FROM blog_categories;

-- ============================================
-- SEED DATA COMPLETE
-- ============================================
-- Blog posts: 4
-- Changelog entries: 8
-- Categories: 5 (already in complete_migration.sql)
-- ============================================




