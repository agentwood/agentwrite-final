
import fs from 'fs';
import path from 'path';
import { KEYWORD_PILLARS, CONTENT_TEMPLATES } from './content-strategy';

const STATE_FILE = path.join(process.cwd(), 'data', 'content-engine-state.json');
const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

interface ContentState {
    startDate: string; // ISO date of when the engine started
    processedKeywords: Record<string, 'PUBLISHED' | 'INDEXED'>; // keyword -> status
    lastRun: string;
}

interface ArticleMetadata {
    slug: string;
    title: string;
    pillar: string;
    keyword: string;
    date: string;
}

export class AutonomousEngine {
    private state: ContentState;

    constructor() {
        this.state = this.loadState();
    }

    private loadState(): ContentState {
        if (fs.existsSync(STATE_FILE)) {
            return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
        }
        const initialState: ContentState = {
            startDate: new Date().toISOString(),
            processedKeywords: {},
            lastRun: new Date().toISOString()
        };
        this.saveState(initialState);
        return initialState;
    }

    private saveState(state: ContentState) {
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    }

    private getDayCount(): number {
        const start = new Date(this.state.startDate).getTime();
        const now = new Date().getTime();
        return Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    private getPhase(day: number): 'AUTHORITY' | 'EXPANSION' | 'COMPETITION' {
        if (day <= 30) return 'AUTHORITY';
        if (day <= 60) return 'EXPANSION';
        return 'COMPETITION';
    }

    public getNextTarget() {
        const day = this.getDayCount();
        const phase = this.getPhase(day);

        console.log(`[Engine] Day ${day} | Phase: ${phase}`);

        // Flatten keywords
        const allKeywords: { pillar: string; keyword: string; difficulty: 'easy' | 'medium' }[] = [];

        for (const [pillar, data] of Object.entries(KEYWORD_PILLARS)) {
            data.easy.forEach(k => allKeywords.push({ pillar, keyword: k, difficulty: 'easy' }));
            data.medium.forEach(k => allKeywords.push({ pillar, keyword: k, difficulty: 'medium' }));
        }

        // Filter UNUSED
        const unused = allKeywords.filter(k => !this.state.processedKeywords[k.keyword]);

        if (unused.length === 0) {
            throw new Error('All keywords processed! Reset state or add more keywords.');
        }

        // Selection Logic based on Phase
        let candidates = unused;

        if (phase === 'AUTHORITY') {
            // Prioritize Easy, Explainer/System pillars
            candidates = unused.filter(k => k.difficulty === 'easy');
        } else if (phase === 'EXPANSION') {
            // Mix of Easy/Medium
            candidates = unused; // Broaden scope
        } else {
            // Prioritize Medium
            candidates = unused.filter(k => k.difficulty === 'medium');
            if (candidates.length === 0) candidates = unused; // Fallback
        }

        if (candidates.length === 0) candidates = unused; // Safety fallback

        // Simple random for now, could add "No Repeat Pillar" logic here
        const selected = candidates[Math.floor(Math.random() * candidates.length)];

        // Determine Template
        let template = CONTENT_TEMPLATES.TEMPLATE_A_EXPLAINER;
        if (phase === 'EXPANSION' && (selected.keyword.includes('vs') || selected.keyword.includes('alternative'))) {
            template = CONTENT_TEMPLATES.TEMPLATE_B_COMPARISON;
        } else if (phase === 'COMPETITION') {
            template = CONTENT_TEMPLATES.TEMPLATE_C_DEEP_DIVE;
        }

        return {
            pillar: selected.pillar,
            keyword: selected.keyword,
            template: template
        };

    }

    public markAsPublished(keyword: string) {
        this.state.processedKeywords[keyword] = 'PUBLISHED';
        this.state.lastRun = new Date().toISOString();
        this.saveState(this.state);
    }

    // --- Internal Linking Logic ---

    private getAllArticles(): ArticleMetadata[] {
        if (!fs.existsSync(CONTENT_DIR)) return [];

        const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
        return files.map(file => {
            const content = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
            // Simple regex parse for frontmatter
            const titleMatch = content.match(/title: "(.*?)"/);
            const pillarMatch = content.match(/pillar: "(.*?)"/);
            const keywordMatch = content.match(/keyword: "(.*?)"/);
            const dateMatch = content.match(/date: "(.*?)"/);

            return {
                slug: file.replace('.md', ''),
                title: titleMatch ? titleMatch[1] : '',
                pillar: pillarMatch ? pillarMatch[1] : '',
                keyword: keywordMatch ? keywordMatch[1] : '',
                date: dateMatch ? dateMatch[1] : ''
            };
        });
    }

    public getInternalLinks(currentPillar: string): { type: string; title: string; slug: string }[] {
        const articles = this.getAllArticles();
        const links: { type: string; title: string; slug: string }[] = [];

        // 1. Lateral Link (Same Pillar)
        const lateral = articles.find(a => a.pillar === currentPillar); // Just finding first for now, could be random
        if (lateral) {
            links.push({ type: 'Lateral', title: lateral.title, slug: lateral.slug });
        }

        // 2. Upward Link (Conceptually just linking to category page, but for now let's link to another article in a "Core" pillar if available)
        // In a real app we'd link to /blog/category/[pillar]

        // 3. Random related
        const random = articles.filter(a => a.pillar !== currentPillar)[0];
        if (random) {
            links.push({ type: 'Related', title: random.title, slug: random.slug });
        }

        return links;
    }
}
