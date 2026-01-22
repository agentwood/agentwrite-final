"""
HARBOR Cognee Service - Configuration
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Settings:
    """Application settings"""
    
    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8001"))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Cognee
    COGNEE_GRAPH_DB: str = os.getenv("COGNEE_GRAPH_DB", "networkx")
    COGNEE_VECTOR_DB: str = os.getenv("COGNEE_VECTOR_DB", "chromadb")
    COGNEE_LLM_PROVIDER: str = os.getenv("COGNEE_LLM_PROVIDER", "openai")
    
    # OpenAI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Neo4j
    NEO4J_URI: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER: str = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "")
    
    # Qdrant
    QDRANT_URL: str = os.getenv("QDRANT_URL", "http://localhost:6333")
    QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY", "")
    
    # Data paths
    DATA_DIR: Path = Path(os.getenv("DATA_DIR", "./data"))
    
    def __init__(self):
        self.DATA_DIR.mkdir(parents=True, exist_ok=True)


settings = Settings()
