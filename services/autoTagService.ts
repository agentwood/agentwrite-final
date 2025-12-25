/**
 * Automatic Tagging Service for Blog Posts
 * Analyzes post content, title, and keywords to automatically generate relevant tags
 */

interface TagSuggestion {
    tag: string;
    confidence: number;
    reason: string;
}

// Common tag categories and their keywords
const TAG_KEYWORDS: Record<string, string[]> = {
    'AI Writing': ['ai', 'artificial intelligence', 'machine learning', 'automated', 'generator'],
    'Content Writing': ['content', 'blog', 'article', 'copywriting', 'copy'],
    'Story Writing': ['story', 'fiction', 'novel', 'narrative', 'tale', 'plot'],
    'Creative Writing': ['creative', 'creative writing', 'fiction', 'imagination', 'storytelling'],
    'Blog Writing': ['blog', 'blog post', 'article', 'post', 'publishing'],
    'Novel Writing': ['novel', 'book', 'long-form', 'fiction', 'manuscript'],
    'Short Story': ['short story', 'flash fiction', 'micro fiction', 'tale'],
    'Character Development': ['character', 'protagonist', 'hero', 'villain', 'persona'],
    'Plot Generation': ['plot', 'storyline', 'narrative arc', 'story structure'],
    'Interactive Fiction': ['interactive', 'choose your own', 'branching', 'gamebook'],
    'Marketing Content': ['marketing', 'copywriting', 'ad copy', 'sales', 'promotion'],
    'SEO Writing': ['seo', 'search engine', 'keywords', 'optimization', 'ranking'],
    'Tutorial': ['tutorial', 'guide', 'how to', 'step by step', 'walkthrough'],
    'Comparison': ['vs', 'versus', 'comparison', 'compare', 'alternative'],
    'Tool Review': ['review', 'tool', 'software', 'app', 'platform'],
    'Writing Tips': ['tips', 'advice', 'best practices', 'techniques', 'strategies'],
    'Writing Tools': ['tool', 'software', 'app', 'platform', 'service'],
    'Free Tools': ['free', 'no cost', 'trial', 'free tier', 'gratis'],
    'Writing Automation': ['automation', 'automated', 'automatic', 'streamline'],
    'Content Strategy': ['strategy', 'planning', 'content calendar', 'workflow'],
};

// Competitor-related tags
const COMPETITOR_TAGS: Record<string, string[]> = {
    'Sudowrite Alternative': ['sudowrite', 'sudo write', 'novel writing ai'],
    'Talefy Alternative': ['talefy', 'interactive story', 'game story'],
    'Dipsea Alternative': ['dipsea', 'audio story', 'erotic audio'],
    'Jasper Alternative': ['jasper', 'copy.ai', 'content writing ai'],
    'NovelAI Alternative': ['novelai', 'novel ai', 'anime story'],
};

/**
 * Extract keywords from text
 */
function extractKeywords(text: string): string[] {
    const lowerText = text.toLowerCase();
    const words = lowerText
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3);
    
    return [...new Set(words)];
}

/**
 * Calculate tag relevance score
 */
function calculateRelevanceScore(
    text: string,
    keywords: string[]
): number {
    const lowerText = text.toLowerCase();
    let score = 0;
    
    keywords.forEach(keyword => {
        const regex = new RegExp(keyword.toLowerCase(), 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
            score += matches.length;
        }
    });
    
    return score;
}

/**
 * Automatically generate tags for a blog post
 */
export function autoGenerateTags(
    title: string,
    content: string,
    excerpt: string,
    category: string,
    seoKeywords?: string
): string[] {
    const combinedText = `${title} ${excerpt} ${content} ${seoKeywords || ''}`.toLowerCase();
    const suggestions: TagSuggestion[] = [];
    
    // Check against tag keyword lists
    Object.entries(TAG_KEYWORDS).forEach(([tag, keywords]) => {
        const score = calculateRelevanceScore(combinedText, keywords);
        if (score > 0) {
            suggestions.push({
                tag,
                confidence: Math.min(score * 10, 100),
                reason: `Found ${score} keyword matches`,
            });
        }
    });
    
    // Check for competitor mentions
    Object.entries(COMPETITOR_TAGS).forEach(([tag, keywords]) => {
        const score = calculateRelevanceScore(combinedText, keywords);
        if (score > 0) {
            suggestions.push({
                tag,
                confidence: Math.min(score * 15, 100), // Higher weight for competitor tags
                reason: `Mentions competitor`,
            });
        }
    });
    
    // Add category as a tag if it's a standard category
    const categoryMap: Record<string, string> = {
        'Video Marketing': 'Video Marketing',
        'Video Ideas': 'Video Ideas',
        'Content Marketing': 'Content Marketing',
        'AI Tools': 'AI Tools',
        'Tutorials': 'Tutorial',
        'Creative Writing': 'Creative Writing',
        'Story Writing': 'Story Writing',
        'Blog Writing': 'Blog Writing',
    };
    
    if (categoryMap[category]) {
        suggestions.push({
            tag: categoryMap[category],
            confidence: 90,
            reason: 'Post category',
        });
    }
    
    // Extract additional keywords from title
    const titleKeywords = extractKeywords(title);
    titleKeywords.forEach(keyword => {
        if (keyword.length > 4 && !suggestions.find(s => s.tag.toLowerCase().includes(keyword))) {
            // Capitalize first letter for tag
            const tagName = keyword.charAt(0).toUpperCase() + keyword.slice(1);
            suggestions.push({
                tag: tagName,
                confidence: 50,
                reason: 'Extracted from title',
            });
        }
    });
    
    // Sort by confidence and return top tags
    const sorted = suggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 8); // Top 8 tags
    
    // Remove duplicates and return tag names
    const uniqueTags = [...new Set(sorted.map(s => s.tag))];
    
    return uniqueTags.slice(0, 6); // Return max 6 tags
}

/**
 * Suggest tags based on content analysis
 */
export function suggestTags(
    title: string,
    content: string,
    excerpt: string,
    category: string
): TagSuggestion[] {
    const tags = autoGenerateTags(title, content, excerpt, category);
    
    return tags.map(tag => ({
        tag,
        confidence: 75, // Default confidence
        reason: 'Auto-generated from content analysis',
    }));
}

/**
 * Validate and clean tags
 */
export function cleanTags(tags: string[]): string[] {
    return tags
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0 && tag.length < 50)
        .map(tag => {
            // Capitalize first letter of each word
            return tag
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        })
        .filter((tag, index, self) => self.indexOf(tag) === index); // Remove duplicates
}




