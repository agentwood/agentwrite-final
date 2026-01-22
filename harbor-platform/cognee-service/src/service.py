"""
HARBOR Cognee Service - Graph RAG Service
Core service wrapping Cognee functionality
"""

import asyncio
import time
from datetime import datetime
from typing import Any, Optional
from uuid import uuid4

# Cognee imports (with fallback for development)
try:
    import cognee
    from cognee.api.v1.add import add as cognee_add
    from cognee.api.v1.cognify import cognify as cognee_cognify
    from cognee.api.v1.search import search as cognee_search
    COGNEE_AVAILABLE = True
except ImportError:
    COGNEE_AVAILABLE = False
    print("Warning: Cognee not installed. Using mock implementation.")

from .config import settings
from .models import (
    MediaEntity,
    EntityRelationship,
    SearchResult,
    SubgraphResponse,
    CognitionResult,
    GraphStats,
)


class CogneeService:
    """
    Graph RAG service using Cognee
    Manages knowledge graph for media entities
    """
    
    def __init__(self):
        self.initialized = False
        self.entities: dict[str, MediaEntity] = {}
        self.relationships: list[EntityRelationship] = []
        self.media_index: dict[str, list[str]] = {}  # media_id -> entity_ids
    
    async def initialize(self) -> None:
        """Initialize Cognee with configured backends"""
        if COGNEE_AVAILABLE:
            try:
                # Configure Cognee
                cognee.config.set_llm_config({
                    "provider": settings.COGNEE_LLM_PROVIDER,
                    "api_key": settings.OPENAI_API_KEY,
                })
                
                if settings.COGNEE_GRAPH_DB == "neo4j":
                    cognee.config.set_graph_database_config({
                        "graph_database_provider": "neo4j",
                        "graph_database_url": settings.NEO4J_URI,
                        "graph_database_username": settings.NEO4J_USER,
                        "graph_database_password": settings.NEO4J_PASSWORD,
                    })
                
                if settings.COGNEE_VECTOR_DB == "qdrant":
                    cognee.config.set_vector_database_config({
                        "vector_db_provider": "qdrant",
                        "vector_db_url": settings.QDRANT_URL,
                        "vector_db_key": settings.QDRANT_API_KEY,
                    })
                
                self.initialized = True
                print("[CogneeService] Initialized with Cognee")
            except Exception as e:
                print(f"[CogneeService] Cognee init failed: {e}, using local mode")
                self.initialized = True
        else:
            self.initialized = True
            print("[CogneeService] Running in local mode (no Cognee)")
    
    async def add_to_graph(
        self,
        media_id: str,
        entities: list[dict[str, Any]],
        auto_relate: bool = True,
    ) -> CognitionResult:
        """Add entities to knowledge graph"""
        start_time = time.time()
        created_entities: list[MediaEntity] = []
        
        for entity_data in entities:
            entity = MediaEntity(
                id=str(uuid4()),
                media_id=media_id,
                entity_type=entity_data.get("type", "object"),
                content=entity_data.get("content", ""),
                start_ms=entity_data.get("start_ms"),
                end_ms=entity_data.get("end_ms"),
                metadata=entity_data.get("metadata", {}),
            )
            
            self.entities[entity.id] = entity
            created_entities.append(entity)
            
            # Index by media
            if media_id not in self.media_index:
                self.media_index[media_id] = []
            self.media_index[media_id].append(entity.id)
        
        # Auto-create relationships
        relationships_created = 0
        if auto_relate:
            relationships_created = await self._infer_relationships(media_id, created_entities)
        
        # If Cognee available, also add to Cognee graph
        if COGNEE_AVAILABLE and self.initialized:
            try:
                text_data = "\n".join([e.content for e in created_entities])
                await cognee_add(text_data, dataset_name=f"media_{media_id}")
                await cognee_cognify()
            except Exception as e:
                print(f"[CogneeService] Cognee add failed: {e}")
        
        processing_time = int((time.time() - start_time) * 1000)
        
        return CognitionResult(
            media_id=media_id,
            entities_created=len(created_entities),
            relationships_created=relationships_created,
            processing_time_ms=processing_time,
        )
    
    async def _infer_relationships(
        self,
        media_id: str,
        entities: list[MediaEntity]
    ) -> int:
        """Infer relationships between entities"""
        count = 0
        sorted_entities = sorted(entities, key=lambda e: e.start_ms or 0)
        
        for i, current in enumerate(sorted_entities):
            # Temporal sequence
            if i > 0:
                prev = sorted_entities[i - 1]
                self._add_relationship(prev.id, current.id, "follows", 1.0)
                count += 1
            
            # Overlapping entities
            for j in range(i + 1, len(sorted_entities)):
                other = sorted_entities[j]
                if self._overlaps(current, other):
                    self._add_relationship(current.id, other.id, "related_to", 0.8)
                    count += 1
            
            # Scene contains
            if current.entity_type == "scene":
                for entity in sorted_entities:
                    if entity.id != current.id and self._contains(current, entity):
                        self._add_relationship(current.id, entity.id, "contains", 0.9)
                        count += 1
        
        return count
    
    def _overlaps(self, a: MediaEntity, b: MediaEntity) -> bool:
        if a.start_ms is None or a.end_ms is None:
            return False
        if b.start_ms is None or b.end_ms is None:
            return False
        return a.start_ms < b.end_ms and b.start_ms < a.end_ms
    
    def _contains(self, a: MediaEntity, b: MediaEntity) -> bool:
        if a.start_ms is None or a.end_ms is None:
            return False
        if b.start_ms is None or b.end_ms is None:
            return False
        return a.start_ms <= b.start_ms and a.end_ms >= b.end_ms
    
    def _add_relationship(
        self,
        source_id: str,
        target_id: str,
        rel_type: str,
        weight: float
    ) -> None:
        rel = EntityRelationship(
            source_id=source_id,
            target_id=target_id,
            relationship_type=rel_type,
            weight=weight,
        )
        self.relationships.append(rel)
    
    async def search(
        self,
        query: str,
        filters: Optional[dict[str, Any]] = None,
        depth: int = 2,
        limit: int = 20,
    ) -> SearchResult:
        """Search knowledge graph"""
        matched_entities: list[MediaEntity] = []
        relevance_scores: dict[str, float] = {}
        
        # Try Cognee search first
        if COGNEE_AVAILABLE and self.initialized:
            try:
                results = await cognee_search(query, limit=limit)
                # Process Cognee results
                for result in results:
                    # Map to our entity format
                    pass
            except Exception as e:
                print(f"[CogneeService] Cognee search failed: {e}")
        
        # Local text search fallback
        query_terms = query.lower().split()
        
        for entity in self.entities.values():
            content = entity.content.lower()
            score = 0.0
            
            for term in query_terms:
                if term in content:
                    score += 1 / len(query_terms)
            
            # Apply filters
            if filters:
                if filters.get("media_id") and entity.media_id != filters["media_id"]:
                    continue
                if filters.get("type") and entity.entity_type != filters["type"]:
                    continue
            
            if score > 0:
                matched_entities.append(entity)
                relevance_scores[entity.id] = score
        
        # Expand graph by depth
        expanded_ids = set(e.id for e in matched_entities)
        for _ in range(depth):
            for rel in self.relationships:
                if rel.source_id in expanded_ids and rel.target_id not in expanded_ids:
                    target = self.entities.get(rel.target_id)
                    if target:
                        matched_entities.append(target)
                        expanded_ids.add(rel.target_id)
                        source_score = relevance_scores.get(rel.source_id, 0)
                        relevance_scores[rel.target_id] = source_score * rel.weight * 0.5
        
        # Get relevant relationships
        relevant_rels = [
            r for r in self.relationships
            if r.source_id in expanded_ids and r.target_id in expanded_ids
        ]
        
        # Sort and limit
        matched_entities.sort(key=lambda e: relevance_scores.get(e.id, 0), reverse=True)
        
        return SearchResult(
            entities=matched_entities[:limit],
            relationships=relevant_rels,
            relevance_scores=relevance_scores,
        )
    
    async def find_similar(self, entity_id: str, limit: int = 10) -> list[MediaEntity]:
        """Find similar entities using graph structure"""
        entity = self.entities.get(entity_id)
        if not entity:
            return []
        
        connected: dict[str, float] = {}
        
        for rel in self.relationships:
            if rel.source_id == entity_id:
                connected[rel.target_id] = connected.get(rel.target_id, 0) + rel.weight
            if rel.target_id == entity_id:
                connected[rel.source_id] = connected.get(rel.source_id, 0) + rel.weight
        
        sorted_ids = sorted(connected.keys(), key=lambda x: connected[x], reverse=True)
        
        return [
            self.entities[eid] for eid in sorted_ids[:limit]
            if eid in self.entities
        ]
    
    async def get_media_entities(self, media_id: str) -> list[MediaEntity]:
        """Get all entities for a media item"""
        entity_ids = self.media_index.get(media_id, [])
        return [self.entities[eid] for eid in entity_ids if eid in self.entities]
    
    async def get_subgraph(self, media_id: str) -> SubgraphResponse:
        """Build subgraph for visualization"""
        entity_ids = set(self.media_index.get(media_id, []))
        
        nodes = [
            {
                "id": eid,
                "label": self.entities[eid].content[:50],
                "type": self.entities[eid].entity_type,
            }
            for eid in entity_ids if eid in self.entities
        ]
        
        edges = [
            {
                "source": r.source_id,
                "target": r.target_id,
                "type": r.relationship_type,
            }
            for r in self.relationships
            if r.source_id in entity_ids and r.target_id in entity_ids
        ]
        
        return SubgraphResponse(nodes=nodes, edges=edges)
    
    async def remove_media(self, media_id: str) -> int:
        """Remove all entities for a media item"""
        entity_ids = self.media_index.get(media_id, [])
        entity_set = set(entity_ids)
        
        # Remove relationships
        self.relationships = [
            r for r in self.relationships
            if r.source_id not in entity_set and r.target_id not in entity_set
        ]
        
        # Remove entities
        for eid in entity_ids:
            self.entities.pop(eid, None)
        
        # Remove index
        self.media_index.pop(media_id, None)
        
        return len(entity_ids)
    
    async def get_stats(self) -> GraphStats:
        """Get graph statistics"""
        entity_types: dict[str, int] = {}
        for entity in self.entities.values():
            entity_types[entity.entity_type] = entity_types.get(entity.entity_type, 0) + 1
        
        relationship_types: dict[str, int] = {}
        for rel in self.relationships:
            relationship_types[rel.relationship_type] = relationship_types.get(rel.relationship_type, 0) + 1
        
        return GraphStats(
            total_entities=len(self.entities),
            total_relationships=len(self.relationships),
            entity_types=entity_types,
            relationship_types=relationship_types,
        )


# Singleton service
cognee_service = CogneeService()
