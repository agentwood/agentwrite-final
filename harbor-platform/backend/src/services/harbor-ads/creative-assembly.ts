/**
 * Harbor Ads - Creative Assembly Service
 * Construct ad blueprints with shot lists, scripts, and pacing
 */

import { v4 as uuidv4 } from 'uuid';
import type {
    ClientAdProject,
    AdCreative,
    PromptStructure,
    Platform
} from '../../models/ad-project.js';
import type { ContentSource, ContentSelection } from './content-selection.js';

export interface AdBlueprint {
    id: string;
    projectId: string;
    name: string;

    // Structure
    shotList: ShotListItem[];
    script: ScriptFragment[];
    pacing: PacingPlan;

    // Platform specific
    platform: Platform;
    aspectRatio: '9:16' | '16:9' | '1:1' | '4:5';
    targetDuration: number;

    // Generation ready
    promptStructure: PromptStructure;

    createdAt: Date;
}

export interface ShotListItem {
    order: number;
    sourceId: string;
    startMs: number;
    endMs: number;
    description: string;
    transition?: 'cut' | 'fade' | 'dissolve' | 'zoom';
}

export interface ScriptFragment {
    type: 'text_overlay' | 'voiceover' | 'caption' | 'cta';
    content: string;
    startMs: number;
    endMs: number;
    style?: {
        position?: 'top' | 'center' | 'bottom';
        fontSize?: 'small' | 'medium' | 'large';
        animation?: 'fade' | 'slide' | 'bounce' | 'none';
    };
}

export interface PacingPlan {
    hookDuration: number;
    bodyDuration: number;
    ctaDuration: number;
    totalDuration: number;
    beatsPerMinute: number;
    energyLevel: 'low' | 'medium' | 'high';
}

/**
 * Creative Assembly Service
 */
export class CreativeAssemblyService {

    /**
     * Create ad blueprint from content selection
     */
    async createBlueprint(
        project: ClientAdProject,
        selection: ContentSelection
    ): Promise<AdBlueprint> {
        const platform = selection.criteria.platform;
        const aspectRatio = selection.criteria.aspectRatio;

        // Determine target duration based on platform
        const targetDuration = this.getTargetDuration(platform);

        // Create pacing plan
        const pacing = this.createPacingPlan(targetDuration, project.goals?.objective);

        // Build shot list
        const shotList = this.buildShotList(selection.sources, pacing);

        // Generate script fragments
        const script = this.generateScript(project, pacing);

        // Create prompt structure for generation
        const promptStructure = this.buildPromptStructure(project, shotList, script, pacing);

        const blueprint: AdBlueprint = {
            id: uuidv4(),
            projectId: project.id,
            name: `${project.name} - ${platform} Ad`,
            shotList,
            script,
            pacing,
            platform,
            aspectRatio,
            targetDuration,
            promptStructure,
            createdAt: new Date(),
        };

        console.log(`[Assembly] Created blueprint ${blueprint.id} for project ${project.id}`);
        return blueprint;
    }

    /**
     * Get target duration for platform
     */
    private getTargetDuration(platform: Platform): number {
        const durations: Record<Platform, number> = {
            tiktok: 15000,
            instagram_reels: 15000,
            youtube_shorts: 30000,
            facebook_reels: 15000,
            snapchat: 10000,
            pinterest: 15000,
            twitter: 15000,
        };
        return durations[platform] || 15000;
    }

    /**
     * Create pacing plan based on duration and objective
     */
    private createPacingPlan(
        totalDuration: number,
        objective?: string
    ): PacingPlan {
        // Hook should be 10-20% of total
        const hookRatio = 0.15;
        // CTA should be 10-15% of total
        const ctaRatio = 0.12;
        // Body is the rest
        const bodyRatio = 1 - hookRatio - ctaRatio;

        // Determine energy level based on objective
        let energyLevel: 'low' | 'medium' | 'high' = 'medium';
        let bpm = 120;

        if (objective === 'awareness' || objective === 'engagement') {
            energyLevel = 'high';
            bpm = 140;
        } else if (objective === 'conversion') {
            energyLevel = 'medium';
            bpm = 110;
        }

        return {
            hookDuration: Math.round(totalDuration * hookRatio),
            bodyDuration: Math.round(totalDuration * bodyRatio),
            ctaDuration: Math.round(totalDuration * ctaRatio),
            totalDuration,
            beatsPerMinute: bpm,
            energyLevel,
        };
    }

    /**
     * Build shot list from content sources
     */
    private buildShotList(
        sources: ContentSource[],
        pacing: PacingPlan
    ): ShotListItem[] {
        const shots: ShotListItem[] = [];
        let currentTime = 0;

        // Hook shot (first source or best match)
        const hookSource = sources[0];
        if (hookSource) {
            shots.push({
                order: 1,
                sourceId: hookSource.id,
                startMs: currentTime,
                endMs: pacing.hookDuration,
                description: 'Hook - Attention grabbing opening',
                transition: 'cut',
            });
            currentTime = pacing.hookDuration;
        }

        // Body shots (distribute remaining sources)
        const bodySources = sources.slice(1, -1);
        const shotDuration = pacing.bodyDuration / Math.max(bodySources.length, 1);

        bodySources.forEach((source, index) => {
            shots.push({
                order: index + 2,
                sourceId: source.id,
                startMs: currentTime,
                endMs: currentTime + shotDuration,
                description: `Body shot ${index + 1}`,
                transition: index % 2 === 0 ? 'cut' : 'dissolve',
            });
            currentTime += shotDuration;
        });

        // CTA shot (last source)
        const ctaSource = sources[sources.length - 1] || sources[0];
        if (ctaSource) {
            shots.push({
                order: shots.length + 1,
                sourceId: ctaSource.id,
                startMs: currentTime,
                endMs: pacing.totalDuration,
                description: 'CTA - Call to action',
                transition: 'fade',
            });
        }

        return shots;
    }

    /**
     * Generate script fragments
     */
    private generateScript(
        project: ClientAdProject,
        pacing: PacingPlan
    ): ScriptFragment[] {
        const fragments: ScriptFragment[] = [];
        const goals = project.goals;

        // Hook text
        const hookTexts = [
            'Discover something new',
            'You won\'t believe this',
            'The secret to success',
            'Transform your experience',
        ];
        fragments.push({
            type: 'text_overlay',
            content: hookTexts[Math.floor(Math.random() * hookTexts.length)],
            startMs: 0,
            endMs: pacing.hookDuration,
            style: { position: 'center', fontSize: 'large', animation: 'bounce' },
        });

        // Key message in body
        if (goals?.keyMessages && goals.keyMessages.length > 0) {
            const bodyStart = pacing.hookDuration;
            goals.keyMessages.slice(0, 2).forEach((message, index) => {
                const start = bodyStart + (index * pacing.bodyDuration / 2);
                fragments.push({
                    type: 'text_overlay',
                    content: message,
                    startMs: start,
                    endMs: start + (pacing.bodyDuration / 2),
                    style: { position: 'bottom', fontSize: 'medium', animation: 'fade' },
                });
            });
        }

        // CTA
        const ctaText = goals?.cta || 'Learn More';
        fragments.push({
            type: 'cta',
            content: ctaText,
            startMs: pacing.hookDuration + pacing.bodyDuration,
            endMs: pacing.totalDuration,
            style: { position: 'center', fontSize: 'large', animation: 'slide' },
        });

        return fragments;
    }

    /**
     * Build prompt structure for generation engine
     */
    private buildPromptStructure(
        project: ClientAdProject,
        shotList: ShotListItem[],
        script: ScriptFragment[],
        pacing: PacingPlan
    ): PromptStructure {
        const hookScript = script.find(s => s.startMs === 0);
        const ctaScript = script.find(s => s.type === 'cta');

        return {
            hook: {
                type: 'action',
                text: hookScript?.content,
                durationMs: pacing.hookDuration,
            },
            body: shotList.slice(1, -1).map(shot => ({
                sceneDescription: shot.description,
                durationMs: shot.endMs - shot.startMs,
                visualStyle: project.brandGuidelines?.tone || 'professional',
            })),
            cta: {
                text: ctaScript?.content || 'Learn More',
                style: 'overlay',
                durationMs: pacing.ctaDuration,
            },
            totalDurationMs: pacing.totalDuration,
            aspectRatio: '9:16',
        };
    }

    /**
     * Create ad creative from blueprint
     */
    async createCreative(
        blueprint: AdBlueprint,
        generationModel: 'veo' | 'sora' | 'runway' | 'pika' | 'internal' = 'internal'
    ): Promise<AdCreative> {
        const creative: AdCreative = {
            id: uuidv4(),
            projectId: blueprint.projectId,
            name: blueprint.name,
            sourceMedia: blueprint.shotList.map(s => s.sourceId),
            promptStructure: blueprint.promptStructure,
            generationModel,
            status: 'draft',
            variants: [],
            reviewNotes: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        console.log(`[Assembly] Created creative ${creative.id} from blueprint ${blueprint.id}`);
        return creative;
    }
}

// Singleton instance
export const creativeAssemblyService = new CreativeAssemblyService();
