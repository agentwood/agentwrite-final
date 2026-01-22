"""
HARBOR Cognee Service - FastAPI Application
REST API for Graph RAG operations
"""

from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .models import (
    AddToGraphRequest,
    SearchRequest,
    SimilarRequest,
    IngestTextRequest,
    SearchResult,
    SubgraphResponse,
    CognitionResult,
    GraphStats,
    HealthResponse,
    MediaEntity,
)
from .service import cognee_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize service on startup"""
    await cognee_service.initialize()
    yield


app = FastAPI(
    title="HARBOR Cognee Service",
    description="Graph RAG microservice for media knowledge graphs",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# HEALTH ENDPOINTS
# ============================================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    try:
        import cognee
        cognee_version = cognee.__version__
    except:
        cognee_version = "not installed"
    
    return HealthResponse(
        status="healthy",
        version="0.1.0",
        cognee_version=cognee_version,
        graph_db=settings.COGNEE_GRAPH_DB,
        vector_db=settings.COGNEE_VECTOR_DB,
        timestamp=datetime.utcnow(),
    )


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "HARBOR Cognee Service",
        "version": "0.1.0",
        "description": "Graph RAG for media knowledge graphs",
        "endpoints": {
            "health": "/health",
            "add": "POST /graph/add",
            "search": "POST /graph/search",
            "stats": "GET /graph/stats",
        },
    }


# ============================================
# GRAPH ENDPOINTS
# ============================================

@app.post("/graph/add", response_model=CognitionResult)
async def add_to_graph(request: AddToGraphRequest):
    """Add entities to knowledge graph"""
    try:
        result = await cognee_service.add_to_graph(
            media_id=request.media_id,
            entities=request.entities,
            auto_relate=request.auto_relate,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/graph/search", response_model=SearchResult)
async def search_graph(request: SearchRequest):
    """Search knowledge graph"""
    try:
        result = await cognee_service.search(
            query=request.query,
            filters=request.filters,
            depth=request.depth,
            limit=request.limit,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/graph/similar", response_model=list[MediaEntity])
async def find_similar(request: SimilarRequest):
    """Find similar entities"""
    try:
        entities = await cognee_service.find_similar(
            entity_id=request.entity_id,
            limit=request.limit,
        )
        return entities
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/graph/stats", response_model=GraphStats)
async def get_stats():
    """Get graph statistics"""
    try:
        return await cognee_service.get_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# MEDIA ENDPOINTS
# ============================================

@app.get("/media/{media_id}/entities", response_model=list[MediaEntity])
async def get_media_entities(media_id: str):
    """Get all entities for a media item"""
    try:
        return await cognee_service.get_media_entities(media_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/media/{media_id}/subgraph", response_model=SubgraphResponse)
async def get_subgraph(media_id: str):
    """Get subgraph for visualization"""
    try:
        return await cognee_service.get_subgraph(media_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/media/{media_id}")
async def remove_media(media_id: str):
    """Remove all entities for a media item"""
    try:
        count = await cognee_service.remove_media(media_id)
        return {"removed": count, "media_id": media_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# INGEST ENDPOINTS
# ============================================

@app.post("/ingest/text", response_model=CognitionResult)
async def ingest_text(request: IngestTextRequest):
    """Ingest raw text for processing"""
    try:
        # Create entity from text
        entities = [{
            "type": request.text_type,
            "content": request.text,
            "start_ms": request.start_ms,
            "end_ms": request.end_ms,
            "metadata": {"source": "text_ingest"},
        }]
        
        result = await cognee_service.add_to_graph(
            media_id=request.media_id,
            entities=entities,
            auto_relate=True,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# MAIN
# ============================================

def main():
    """Run the service"""
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )


if __name__ == "__main__":
    main()
