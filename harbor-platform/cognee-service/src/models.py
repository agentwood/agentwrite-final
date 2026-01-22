"""
HARBOR Cognee Service - Data Models
Pydantic models for API requests and responses
"""

from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field


# ============================================
# ENTITY MODELS
# ============================================

class MediaEntity(BaseModel):
    """Entity extracted from media"""
    id: str
    media_id: str
    entity_type: str = Field(..., description="scene, object, person, action, audio, transcript")
    content: str
    start_ms: Optional[int] = None
    end_ms: Optional[int] = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class EntityRelationship(BaseModel):
    """Relationship between entities"""
    source_id: str
    target_id: str
    relationship_type: str = Field(..., description="contains, follows, related_to, depicts, spoken_by, part_of")
    weight: float = 1.0
    metadata: dict[str, Any] = Field(default_factory=dict)


# ============================================
# REQUEST MODELS
# ============================================

class AddToGraphRequest(BaseModel):
    """Request to add content to knowledge graph"""
    media_id: str
    entities: list[dict[str, Any]]
    auto_relate: bool = True


class SearchRequest(BaseModel):
    """Graph search request"""
    query: str
    filters: Optional[dict[str, Any]] = None
    depth: int = 2
    limit: int = 20


class SimilarRequest(BaseModel):
    """Find similar entities request"""
    entity_id: str
    limit: int = 10


class IngestTextRequest(BaseModel):
    """Ingest raw text for processing"""
    media_id: str
    text: str
    text_type: str = "transcript"  # transcript, description, caption
    start_ms: Optional[int] = None
    end_ms: Optional[int] = None


# ============================================
# RESPONSE MODELS
# ============================================

class GraphStats(BaseModel):
    """Knowledge graph statistics"""
    total_entities: int
    total_relationships: int
    entity_types: dict[str, int]
    relationship_types: dict[str, int]


class SearchResult(BaseModel):
    """Graph search result"""
    entities: list[MediaEntity]
    relationships: list[EntityRelationship]
    relevance_scores: dict[str, float]


class SubgraphResponse(BaseModel):
    """Subgraph for visualization"""
    nodes: list[dict[str, Any]]
    edges: list[dict[str, Any]]


class CognitionResult(BaseModel):
    """Result from Cognee cognition"""
    media_id: str
    entities_created: int
    relationships_created: int
    processing_time_ms: int


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    cognee_version: str
    graph_db: str
    vector_db: str
    timestamp: datetime
