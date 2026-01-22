"""
HARBOR Auto-Annotator - Pydantic Schemas
"""

from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field


# ============================================
# DETECTION MODELS
# ============================================

class BoundingBox(BaseModel):
    """Bounding box coordinates"""
    x: float
    y: float
    width: float
    height: float


class Detection(BaseModel):
    """Object detection result"""
    label: str
    confidence: float
    bbox: BoundingBox
    frame_index: Optional[int] = None
    timestamp_ms: Optional[int] = None


class Segment(BaseModel):
    """Segmentation result"""
    label: str
    mask_path: Optional[str] = None
    mask_rle: Optional[str] = None  # Run-length encoded mask
    area: float
    frame_index: Optional[int] = None


class TranscriptEntry(BaseModel):
    """Speech transcription entry"""
    text: str
    start_ms: int
    end_ms: int
    confidence: float
    language: Optional[str] = None


class SceneLabel(BaseModel):
    """Scene classification label"""
    label: str
    confidence: float
    frame_index: Optional[int] = None


# ============================================
# ANNOTATION RESULTS
# ============================================

class AnnotationResult(BaseModel):
    """Complete annotation result for a media item"""
    media_id: str
    
    # Detection results
    detections: list[Detection] = Field(default_factory=list)
    detection_summary: dict[str, int] = Field(default_factory=dict)  # label -> count
    
    # Segmentation results (SAM)
    segments: list[Segment] = Field(default_factory=list)
    
    # Transcription results (Whisper)
    transcript: list[TranscriptEntry] = Field(default_factory=list)
    full_text: Optional[str] = None
    detected_language: Optional[str] = None
    
    # Scene understanding (CLIP)
    scene_labels: list[SceneLabel] = Field(default_factory=list)
    embeddings: Optional[list[float]] = None
    
    # Quality metrics
    quality_score: float = 0.0
    resolution: Optional[tuple[int, int]] = None
    duration_seconds: Optional[float] = None
    frame_count: int = 0
    
    # Processing info
    processed_at: datetime = Field(default_factory=datetime.utcnow)
    processing_time_ms: int = 0
    models_used: list[str] = Field(default_factory=list)
    
    # Flags
    nsfw_detected: bool = False
    nsfw_score: float = 0.0
    deepfake_detected: bool = False
    deepfake_score: float = 0.0


# ============================================
# JOB MODELS
# ============================================

class AnnotationJobRequest(BaseModel):
    """Request to annotate a media item"""
    media_id: str
    file_path: str
    dataset_id: Optional[str] = None
    
    # Options
    run_detection: bool = True
    run_segmentation: bool = True
    run_transcription: bool = True
    run_scene_classification: bool = True
    run_quality_check: bool = True
    
    # Custom settings
    frame_rate: Optional[int] = None
    max_frames: Optional[int] = None
    confidence_threshold: Optional[float] = None


class BatchJobRequest(BaseModel):
    """Request for batch annotation"""
    job_id: str
    items: list[AnnotationJobRequest]
    priority: int = 0
    callback_url: Optional[str] = None


class JobStatus(BaseModel):
    """Job status"""
    job_id: str
    status: str  # pending, processing, completed, failed
    progress: float = 0.0
    current_step: Optional[str] = None
    media_id: Optional[str] = None
    result: Optional[AnnotationResult] = None
    error: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ============================================
# QUALITY MODELS
# ============================================

class QualityCheckResult(BaseModel):
    """Quality check result"""
    passed: bool
    score: float
    issues: list[str] = Field(default_factory=list)
    
    resolution_ok: bool = True
    brightness_ok: bool = True
    blur_ok: bool = True
    nsfw_ok: bool = True
    deepfake_ok: bool = True
    duration_ok: bool = True
    
    rejection_reason: Optional[str] = None


# ============================================
# API RESPONSES
# ============================================

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    models_loaded: dict[str, bool]
    gpu_available: bool
    timestamp: datetime


class ModelStatus(BaseModel):
    """Model status info"""
    name: str
    loaded: bool
    version: Optional[str] = None
    device: str = "cpu"
    memory_mb: Optional[float] = None
