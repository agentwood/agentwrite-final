/**
 * RAG Engine - Cognee Adapter
 * Graph RAG using Cognee for semantic knowledge graphs
 * 
 * Cognee provides:
 * - Graph-based knowledge representation
 * - Semantic relationships between media entities
 * - Better retrieval for complex queries
 */

import { v4 as uuidv4 } from 'uuid';

export interface CogneeConfig {
    baseUrl: string;
    apiKey?: string;
    graphId: string;
}

export interface MediaEntity {
    id: string;
    mediaId: string;
    type: 'scene' | 'object' | 'person' | 'action' | 'audio' | 'transcript';
    content: string;
    metadata: Record<string, any>;

    // Temporal bounds
    startMs?: number;
    endMs?: number;

    // Relationships (for graph)
    relationships?: EntityRelationship[];
}

export interface EntityRelationship {
    targetId: string;
    type: 'contains' | 'follows' | 'related_to' | 'depicts' | 'spoken_by' | 'part_of';
    weight?: number;
    metadata?: Record<string, any>;
}

export interface CogneeDocument {
    id: string;
    text: string;
    metadata: Record<string, any>;
}

export interface GraphQuery {
    query: string;
    filters?: Record<string, any>;
    depth?: number;
    limit?: number;
}

export interface GraphSearchResult {
    entities: MediaEntity[];
    relationships: Array<{
        source: string;
        target: string;
        type: string;
        weight: number;
    }>;
    relevanceScores: Map<string, number>;
}

/**
 * Cognee Adapter for Graph RAG
 */
export class CogneeAdapter {

    private config: CogneeConfig;
    private entities: Map<string, MediaEntity> = new Map();
    private relationships: Array<{ sourceId: string; targetId: string; type: string; weight: number }> = [];
    private mediaEntityIndex: Map<string, string[]> = new Map();

    constructor(config?: Partial<CogneeConfig>) {
        this.config = {
            baseUrl: config?.baseUrl || process.env.COGNEE_URL || 'http://localhost:8000',
            apiKey: config?.apiKey || process.env.COGNEE_API_KEY,
            graphId: config?.graphId || 'harbor-media-graph',
        };
    }

    /**
     * Add media content to knowledge graph
     */
    async addToGraph(
        mediaId: string,
        entities: Array<{
            type: MediaEntity['type'];
            content: string;
            startMs?: number;
            endMs?: number;
            metadata?: Record<string, any>;
        }>
    ): Promise<MediaEntity[]> {
        const created: MediaEntity[] = [];

        for (const entityData of entities) {
            const entity: MediaEntity = {
                id: uuidv4(),
                mediaId,
                type: entityData.type,
                content: entityData.content,
                metadata: entityData.metadata || {},
                startMs: entityData.startMs,
                endMs: entityData.endMs,
                relationships: [],
            };

            this.entities.set(entity.id, entity);
            created.push(entity);

            // Index by media
            const mediaIndex = this.mediaEntityIndex.get(mediaId) || [];
            mediaIndex.push(entity.id);
            this.mediaEntityIndex.set(mediaId, mediaIndex);
        }

        // Auto-detect relationships between entities
        await this.inferRelationships(mediaId, created);

        // In production: call Cognee API
        // await this.callCognee('POST', '/add', { documents: this.entitiesToDocuments(created) });

        console.log(`[Cognee] Added ${created.length} entities for media: ${mediaId}`);
        return created;
    }

    /**
     * Infer relationships between entities
     */
    private async inferRelationships(mediaId: string, entities: MediaEntity[]): Promise<void> {
        // Sort by time
        const sorted = [...entities].sort((a, b) => (a.startMs || 0) - (b.startMs || 0));

        for (let i = 0; i < sorted.length; i++) {
            const current = sorted[i];

            // Temporal sequence: entity follows previous
            if (i > 0) {
                const prev = sorted[i - 1];
                this.addRelationship(prev.id, current.id, 'follows', 1.0);
            }

            // Overlapping entities are related
            for (let j = i + 1; j < sorted.length; j++) {
                const other = sorted[j];
                if (this.overlaps(current, other)) {
                    this.addRelationship(current.id, other.id, 'related_to', 0.8);
                }
            }

            // Scene contains objects/actions
            if (current.type === 'scene') {
                for (const entity of sorted) {
                    if (entity.id === current.id) continue;
                    if (this.contains(current, entity)) {
                        this.addRelationship(current.id, entity.id, 'contains', 0.9);
                    }
                }
            }
        }
    }

    /**
     * Check if two entities overlap temporally
     */
    private overlaps(a: MediaEntity, b: MediaEntity): boolean {
        if (a.startMs === undefined || a.endMs === undefined) return false;
        if (b.startMs === undefined || b.endMs === undefined) return false;
        return a.startMs < b.endMs && b.startMs < a.endMs;
    }

    /**
     * Check if entity A contains entity B temporally
     */
    private contains(a: MediaEntity, b: MediaEntity): boolean {
        if (a.startMs === undefined || a.endMs === undefined) return false;
        if (b.startMs === undefined || b.endMs === undefined) return false;
        return a.startMs <= b.startMs && a.endMs >= b.endMs;
    }

    /**
     * Add relationship to graph
     */
    private addRelationship(sourceId: string, targetId: string, type: string, weight: number): void {
        this.relationships.push({ sourceId, targetId, type, weight });

        const source = this.entities.get(sourceId);
        if (source) {
            source.relationships = source.relationships || [];
            source.relationships.push({ targetId, type: type as any, weight });
        }
    }

    /**
     * Query knowledge graph
     */
    async query(params: GraphQuery): Promise<GraphSearchResult> {
        const { query, filters, depth = 2, limit = 20 } = params;

        // In production: call Cognee API
        // const response = await this.callCognee('POST', '/search', { query, depth, limit });

        // Local graph search (simulated)
        const matchedEntities: MediaEntity[] = [];
        const relevanceScores = new Map<string, number>();

        // Text matching
        const queryTerms = query.toLowerCase().split(/\s+/);

        for (const entity of this.entities.values()) {
            const content = entity.content.toLowerCase();
            let score = 0;

            for (const term of queryTerms) {
                if (content.includes(term)) {
                    score += 1 / queryTerms.length;
                }
            }

            // Check filters
            if (filters) {
                if (filters.mediaId && entity.mediaId !== filters.mediaId) continue;
                if (filters.type && entity.type !== filters.type) continue;
            }

            if (score > 0) {
                matchedEntities.push(entity);
                relevanceScores.set(entity.id, score);
            }
        }

        // Expand graph for depth
        const expandedIds = new Set(matchedEntities.map(e => e.id));
        for (let d = 0; d < depth; d++) {
            for (const rel of this.relationships) {
                if (expandedIds.has(rel.sourceId) && !expandedIds.has(rel.targetId)) {
                    const target = this.entities.get(rel.targetId);
                    if (target) {
                        matchedEntities.push(target);
                        expandedIds.add(rel.targetId);
                        // Propagate relevance with decay
                        const sourceScore = relevanceScores.get(rel.sourceId) || 0;
                        relevanceScores.set(rel.targetId, sourceScore * rel.weight * 0.5);
                    }
                }
            }
        }

        // Get relevant relationships
        const relevantRelationships = this.relationships
            .filter(r => expandedIds.has(r.sourceId) && expandedIds.has(r.targetId))
            .map(r => ({
                source: r.sourceId,
                target: r.targetId,
                type: r.type,
                weight: r.weight,
            }));

        // Sort by relevance and limit
        matchedEntities.sort((a, b) =>
            (relevanceScores.get(b.id) || 0) - (relevanceScores.get(a.id) || 0)
        );

        return {
            entities: matchedEntities.slice(0, limit),
            relationships: relevantRelationships,
            relevanceScores,
        };
    }

    /**
     * Get entity by ID
     */
    async getEntity(entityId: string): Promise<MediaEntity | null> {
        return this.entities.get(entityId) || null;
    }

    /**
     * Get entities for media
     */
    async getMediaEntities(mediaId: string): Promise<MediaEntity[]> {
        const ids = this.mediaEntityIndex.get(mediaId) || [];
        return ids.map(id => this.entities.get(id)!).filter(Boolean);
    }

    /**
     * Find similar entities using graph structure
     */
    async findSimilar(entityId: string, limit: number = 10): Promise<MediaEntity[]> {
        const entity = this.entities.get(entityId);
        if (!entity) return [];

        // Find connected entities
        const connected = new Map<string, number>();

        for (const rel of this.relationships) {
            if (rel.sourceId === entityId) {
                connected.set(rel.targetId, (connected.get(rel.targetId) || 0) + rel.weight);
            }
            if (rel.targetId === entityId) {
                connected.set(rel.sourceId, (connected.get(rel.sourceId) || 0) + rel.weight);
            }
        }

        // Sort by connection strength
        const sorted = Array.from(connected.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);

        return sorted
            .map(([id]) => this.entities.get(id)!)
            .filter(Boolean);
    }

    /**
     * Build subgraph for visualization
     */
    async buildSubgraph(mediaId: string): Promise<{
        nodes: Array<{ id: string; label: string; type: string }>;
        edges: Array<{ source: string; target: string; type: string }>;
    }> {
        const entityIds = this.mediaEntityIndex.get(mediaId) || [];
        const entitySet = new Set(entityIds);

        const nodes = entityIds
            .map(id => this.entities.get(id)!)
            .filter(Boolean)
            .map(e => ({
                id: e.id,
                label: e.content.slice(0, 50),
                type: e.type,
            }));

        const edges = this.relationships
            .filter(r => entitySet.has(r.sourceId) && entitySet.has(r.targetId))
            .map(r => ({
                source: r.sourceId,
                target: r.targetId,
                type: r.type,
            }));

        return { nodes, edges };
    }

    /**
     * Remove media from graph
     */
    async removeMedia(mediaId: string): Promise<number> {
        const entityIds = this.mediaEntityIndex.get(mediaId) || [];
        const entitySet = new Set(entityIds);

        // Remove relationships
        this.relationships = this.relationships.filter(
            r => !entitySet.has(r.sourceId) && !entitySet.has(r.targetId)
        );

        // Remove entities
        for (const id of entityIds) {
            this.entities.delete(id);
        }

        this.mediaEntityIndex.delete(mediaId);

        console.log(`[Cognee] Removed ${entityIds.length} entities for media: ${mediaId}`);
        return entityIds.length;
    }

    /**
     * Get graph statistics
     */
    async getStats(): Promise<{
        totalEntities: number;
        totalRelationships: number;
        entityTypes: Record<string, number>;
        relationshipTypes: Record<string, number>;
    }> {
        const entityTypes: Record<string, number> = {};
        for (const entity of this.entities.values()) {
            entityTypes[entity.type] = (entityTypes[entity.type] || 0) + 1;
        }

        const relationshipTypes: Record<string, number> = {};
        for (const rel of this.relationships) {
            relationshipTypes[rel.type] = (relationshipTypes[rel.type] || 0) + 1;
        }

        return {
            totalEntities: this.entities.size,
            totalRelationships: this.relationships.length,
            entityTypes,
            relationshipTypes,
        };
    }
}

// Singleton instance
export const cogneeAdapter = new CogneeAdapter();
