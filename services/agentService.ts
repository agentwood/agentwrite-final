import { GoogleGenAI } from '@google/genai';
import { OutlineSection, AgentTask } from '../types';
import { calculateTextCost, calculateOutlineCost } from './costService';

const API_KEY = import.meta.env.API_KEY || import.meta.env.VITE_API_KEY;

/**
 * Planning Agent: Generates detailed outlines for long-form content
 */
export class PlanningAgent {
    private client: GoogleGenAI;

    constructor() {
        this.client = new GoogleGenAI({ apiKey: API_KEY });
    }

    /**
     * Generate outline from user prompt
     */
    async generateOutline(
        title: string,
        genre: string,
        targetWordCount: number,
        additionalContext?: string
    ): Promise<OutlineSection[]> {
        const numSections = Math.max(3, Math.ceil(targetWordCount / 800));
        const wordsPerSection = Math.floor(targetWordCount / numSections);

        const prompt = `You are an expert writing coach and story architect. Create a detailed outline for a ${genre} work titled "${title}".

TARGET: ${targetWordCount} words total
STRUCTURE: ${numSections} sections (approximately ${wordsPerSection} words each)
${additionalContext ? `CONTEXT: ${additionalContext}` : ''}

For each section, provide:
1. A compelling section title
2. Target word count
3. 3-5 key points or plot elements to cover

Output your response as a JSON array of sections. Each section should have:
{
  "title": "Section title",
  "wordCount": ${wordsPerSection},
  "keyPoints": ["point 1", "point 2", "point 3", ...]
}

Make the outline coherent, engaging, and suitable for the ${genre} genre.`;

        // @ts-ignore - SDK types might be slightly off in this environment
        const model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Extract JSON from response (handle cases where model adds explanation text)
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('Failed to parse outline from AI response');
        }

        const sections = JSON.parse(jsonMatch[0]);

        // Add IDs and order
        return sections.map((section: any, index: number) => ({
            id: `section-${Date.now()}-${index}`,
            title: section.title,
            wordCount: section.wordCount || wordsPerSection,
            keyPoints: section.keyPoints || [],
            order: index,
            status: 'pending' as const,
        }));
    }

    /**
     * Estimate cost for outline generation
     */
    getCost(): number {
        return calculateOutlineCost();
    }
}

/**
 * Writing Agent: Generates section content based on outline
 */
export class WritingAgent {
    private client: GoogleGenAI;

    constructor() {
        this.client = new GoogleGenAI({ apiKey: API_KEY });
    }

    /**
     * Generate content for a specific section
     */
    async generateSection(
        section: OutlineSection,
        previousSections: string[],
        genre: string,
        projectTitle: string
    ): Promise<string> {
        const contextText = previousSections.length > 0
            ? `\n\nPREVIOUS SECTIONS:\n${previousSections.join('\n\n---\n\n')}`
            : '';

        const prompt = `You are writing Section ${section.order + 1} of a ${genre} work titled "${projectTitle}".

SECTION TITLE: "${section.title}"
TARGET WORD COUNT: ${section.wordCount} words
KEY POINTS TO COVER:
${section.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}
${contextText}

Write this section in a ${genre} style. If there are previous sections, maintain coherence and avoid repetition. Create engaging, vivid prose that flows naturally from what came before.

Write ONLY the section content, no preamble or meta-commentary.`;

        // @ts-ignore
        const model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const result = await model.generateContent(prompt);
        return result.response.text();
    }

    /**
     * Estimate cost for section generation
     */
    getCost(wordCount: number): number {
        return calculateTextCost(wordCount);
    }
}

/**
 * Agent orchestrator for managing agent tasks
 */
export class AgentOrchestrator {
    private planningAgent: PlanningAgent;
    private writingAgent: WritingAgent;

    constructor() {
        this.planningAgent = new PlanningAgent();
        this.writingAgent = new WritingAgent();
    }

    /**
     * Create and execute a planning task
     */
    async executePlanningTask(
        projectId: string,
        title: string,
        genre: string,
        targetWordCount: number,
        additionalContext?: string
    ): Promise<OutlineSection[]> {
        return this.planningAgent.generateOutline(
            title,
            genre,
            targetWordCount,
            additionalContext
        );
    }

    /**
     * Create and execute a writing task for a section
     */
    async executeWritingTask(
        section: OutlineSection,
        previousSections: string[],
        genre: string,
        projectTitle: string
    ): Promise<string> {
        return this.writingAgent.generateSection(
            section,
            previousSections,
            genre,
            projectTitle
        );
    }

    /**
     * Generate all sections sequentially
     */
    async generateAllSections(
        outline: OutlineSection[],
        genre: string,
        projectTitle: string,
        onSectionComplete?: (sectionIndex: number, content: string) => void
    ): Promise<string[]> {
        const generatedSections: string[] = [];

        for (let i = 0; i < outline.length; i++) {
            const section = outline[i];
            const content = await this.executeWritingTask(
                section,
                generatedSections,
                genre,
                projectTitle
            );

            generatedSections.push(content);

            if (onSectionComplete) {
                onSectionComplete(i, content);
            }
        }

        return generatedSections;
    }
}
