# HARBOR Cognee Service

Graph RAG microservice for the HARBOR platform using [Cognee](https://github.com/topoteretes/cognee).

## Overview

This service provides:
- Knowledge graph construction from media entities
- Semantic search with graph traversal
- Entity relationship inference
- Subgraph visualization data

## Quick Start

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

# Install dependencies
pip install -e ".[dev]"

# Copy environment file
cp .env.example .env
# Edit .env with your API keys

# Run the service
python -m src.main
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/graph/add` | Add entities to graph |
| POST | `/graph/search` | Search knowledge graph |
| POST | `/graph/similar` | Find similar entities |
| GET | `/graph/stats` | Graph statistics |
| GET | `/media/{id}/entities` | Get media entities |
| GET | `/media/{id}/subgraph` | Get visualization data |
| DELETE | `/media/{id}` | Remove media from graph |
| POST | `/ingest/text` | Ingest raw text |

## Example Usage

```python
import httpx

# Add entities
response = httpx.post("http://localhost:8001/graph/add", json={
    "media_id": "video_123",
    "entities": [
        {"type": "scene", "content": "Urban street scene", "start_ms": 0, "end_ms": 5000},
        {"type": "object", "content": "Red car", "start_ms": 1000, "end_ms": 3000},
        {"type": "person", "content": "Man walking", "start_ms": 2000, "end_ms": 4000},
    ],
    "auto_relate": True
})

# Search
response = httpx.post("http://localhost:8001/graph/search", json={
    "query": "urban street car",
    "depth": 2,
    "limit": 10
})
```

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `COGNEE_GRAPH_DB` | Graph database | `networkx` |
| `COGNEE_VECTOR_DB` | Vector database | `chromadb` |
| `COGNEE_LLM_PROVIDER` | LLM provider | `openai` |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `PORT` | Server port | `8001` |

## Production Setup

For production, use Neo4j and Qdrant:

```env
COGNEE_GRAPH_DB=neo4j
COGNEE_VECTOR_DB=qdrant
NEO4J_URI=bolt://neo4j:7687
QDRANT_URL=http://qdrant:6333
```

## Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install -e .
CMD ["python", "-m", "src.main"]
```
