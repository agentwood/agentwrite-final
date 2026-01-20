/**
 * Avatar Style Guide for Agentwood Characters
 * 
 * HARDCODED DOCUMENTATION - Persists across devices/sessions
 * 
 * This file documents the avatar style used for the original 30 seeded characters.
 * All new in-house characters MUST follow this style for visual consistency.
 */

export const AVATAR_STYLE_GUIDE = {
    /**
     * Style: Stylized Anime/Semi-Realistic Portrait
     * 
     * Key Characteristics:
     * - High-quality digital painting style
     * - Soft, atmospheric lighting
     * - Expressive eyes with detailed highlights
     * - Subtle gradients and color harmonies
     * - Professional character portrait composition
     * - Background: Dark, atmospheric, moody
     */
    styleDescription: 'Stylized anime-influenced digital portrait with cinematic lighting',

    /**
     * Recommended Generation Parameters
     */
    generationParams: {
        style: 'digital painting, character portrait, anime-influenced, detailed',
        lighting: 'cinematic, soft ambient, dramatic shadows',
        background: 'dark, atmospheric, blurred, moody gradient',
        quality: 'highly detailed, professional quality, 4k',
        composition: 'portrait, face focus, upper body, centered',
        negativePrompt: 'low quality, blurry, distorted, cartoon, 3D render, photorealistic',
    },

    /**
     * Example Prompt Template
     * Replace {name}, {gender}, {personality}, {category} with character data
     */
    promptTemplate: `
    {name}, {gender} character portrait, {personality} expression,
    stylized anime digital painting, highly detailed,
    cinematic lighting, dark atmospheric background,
    professional character art, expressive eyes,
    {category} aesthetic, fantasy character design
  `.trim(),

    /**
     * Aspect Ratio: Square portraits (1:1)
     * Resolution: 512x512 minimum, 1024x1024 recommended
     */
    dimensions: {
        width: 1024,
        height: 1024,
        aspectRatio: '1:1',
    },

    /**
     * Color Palette Guidelines
     * - Deep purples and blues for mysterious characters
     * - Warm oranges/reds for energetic characters
     * - Cool greens/teals for calm characters
     * - Dark grays/blacks for villains
     */
    colorGuidelines: {
        romantic: ['#8B4573', '#A855F7', '#EC4899'],
        adventure: ['#F59E0B', '#EF4444', '#8B5CF6'],
        mystery: ['#1E293B', '#334155', '#6366F1'],
        comedy: ['#22C55E', '#FACC15', '#F97316'],
        horror: ['#1F2937', '#4B5563', '#7C3AED'],
        mentor: ['#059669', '#0D9488', '#14B8A6'],
    },
};

/**
 * Generate avatar prompt for a character
 */
export function generateAvatarPrompt(character: {
    name: string;
    gender?: string;
    category?: string;
    description?: string;
}): string {
    const { name, gender = 'neutral', category = 'general', description = '' } = character;

    // Extract personality hints from description
    const personality = description.includes('angry') ? 'intense, fierce' :
        description.includes('calm') ? 'serene, peaceful' :
            description.includes('playful') ? 'cheerful, playful' :
                'confident, engaging';

    return `
    ${name}, ${gender} character portrait, ${personality} expression,
    stylized anime digital painting, highly detailed,
    cinematic lighting, dark atmospheric background,
    professional character art, expressive eyes,
    ${category} aesthetic, fantasy character design
  `.trim().replace(/\s+/g, ' ');
}

export default AVATAR_STYLE_GUIDE;
