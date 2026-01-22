"""
HARBOR Auto-Annotator - Configuration
"""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings"""
    
    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8002"))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Storage paths
    STORAGE_PATH: Path = Path(os.getenv("STORAGE_PATH", "./storage"))
    TEMP_PATH: Path = Path(os.getenv("TEMP_PATH", "./temp"))
    MODEL_CACHE: Path = Path(os.getenv("MODEL_CACHE", "./models"))
    
    # API Keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ROBOFLOW_API_KEY: str = os.getenv("ROBOFLOW_API_KEY", "")
    
    # Model settings
    YOLO_MODEL: str = os.getenv("YOLO_MODEL", "yolo11n.pt")  # yolo11n, yolo11s, yolo11m, yolo11l, yolo11x
    WHISPER_MODEL: str = os.getenv("WHISPER_MODEL", "base")  # tiny, base, small, medium, large
    SAM_ENDPOINT: str = os.getenv("SAM_ENDPOINT", "https://detect.roboflow.com")
    
    # Processing settings
    FRAME_RATE: int = int(os.getenv("FRAME_RATE", "1"))  # Frames per second to extract
    MAX_FRAMES: int = int(os.getenv("MAX_FRAMES", "300"))
    BATCH_SIZE: int = int(os.getenv("BATCH_SIZE", "8"))
    
    # Quality thresholds
    MIN_RESOLUTION: tuple = (1280, 720)
    NSFW_THRESHOLD: float = float(os.getenv("NSFW_THRESHOLD", "0.3"))
    CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.5"))
    
    # Redis (job queue)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    def __init__(self):
        self.STORAGE_PATH.mkdir(parents=True, exist_ok=True)
        self.TEMP_PATH.mkdir(parents=True, exist_ok=True)
        self.MODEL_CACHE.mkdir(parents=True, exist_ok=True)


settings = Settings()
