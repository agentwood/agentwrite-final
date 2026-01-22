"""
HARBOR Auto-Annotator - FastAPI Main Application
"""

import asyncio
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional
from uuid import uuid4

import torch
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .schemas import (
    AnnotationJobRequest,
    BatchJobRequest,
    JobStatus,
    AnnotationResult,
    HealthResponse,
    ModelStatus,
)
from .pipeline import annotation_pipeline


# Job storage (in-memory, use Redis in production)
jobs: dict[str, JobStatus] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    print("[Auto-Annotator] Starting up...")
    
    # Pre-initialize models (optional, can be lazy)
    # await annotation_pipeline.initialize()
    
    yield
    
    print("[Auto-Annotator] Shutting down...")


app = FastAPI(
    title="HARBOR Auto-Annotator",
    description="AI-powered annotation pipeline using YOLOv11, SAM3, Whisper, CLIP",
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
    status = annotation_pipeline.get_status()
    
    return HealthResponse(
        status="healthy",
        version="0.1.0",
        models_loaded=status["models"],
        gpu_available=torch.cuda.is_available(),
        timestamp=datetime.utcnow(),
    )


@app.get("/models/status")
async def models_status():
    """Get status of all models"""
    return annotation_pipeline.get_status()


# ============================================
# ANNOTATION ENDPOINTS
# ============================================

@app.post("/annotate/video", response_model=AnnotationResult)
async def annotate_video(request: AnnotationJobRequest):
    """Annotate a single video synchronously"""
    try:
        result = await annotation_pipeline.process_video(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/annotate/image", response_model=AnnotationResult)
async def annotate_image(
    media_id: str,
    file_path: str,
    run_segmentation: bool = True,
):
    """Annotate a single image synchronously"""
    try:
        result = await annotation_pipeline.process_image(
            file_path,
            media_id,
            run_segmentation=run_segmentation,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# ASYNC JOB ENDPOINTS
# ============================================

@app.post("/jobs", response_model=JobStatus)
async def create_job(
    request: AnnotationJobRequest,
    background_tasks: BackgroundTasks,
):
    """Create async annotation job"""
    job_id = str(uuid4())
    
    job = JobStatus(
        job_id=job_id,
        status="pending",
        progress=0.0,
        media_id=request.media_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    jobs[job_id] = job
    
    # Run in background
    background_tasks.add_task(process_job, job_id, request)
    
    return job


async def process_job(job_id: str, request: AnnotationJobRequest):
    """Background job processor"""
    job = jobs.get(job_id)
    if not job:
        return
    
    try:
        job.status = "processing"
        job.current_step = "initializing"
        job.updated_at = datetime.utcnow()
        
        result = await annotation_pipeline.process_video(request)
        
        job.status = "completed"
        job.progress = 1.0
        job.result = result
        job.current_step = None
        job.updated_at = datetime.utcnow()
        
    except Exception as e:
        job.status = "failed"
        job.error = str(e)
        job.updated_at = datetime.utcnow()


@app.get("/jobs/{job_id}", response_model=JobStatus)
async def get_job(job_id: str):
    """Get job status"""
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.get("/jobs/{job_id}/result", response_model=Optional[AnnotationResult])
async def get_job_result(job_id: str):
    """Get job result"""
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != "completed":
        raise HTTPException(status_code=400, detail=f"Job not completed: {job.status}")
    return job.result


@app.post("/jobs/batch", response_model=list[JobStatus])
async def create_batch_job(
    request: BatchJobRequest,
    background_tasks: BackgroundTasks,
):
    """Create batch annotation jobs"""
    created_jobs = []
    
    for item in request.items:
        job_id = str(uuid4())
        job = JobStatus(
            job_id=job_id,
            status="pending",
            progress=0.0,
            media_id=item.media_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        jobs[job_id] = job
        created_jobs.append(job)
        
        background_tasks.add_task(process_job, job_id, item)
    
    return created_jobs


# ============================================
# QUALITY ENDPOINTS
# ============================================

@app.post("/quality/check")
async def check_quality(file_path: str):
    """Run quality check on file"""
    from .models import quality_checker
    
    try:
        result = await quality_checker.check_video(file_path)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# MAIN
# ============================================

def main():
    """Run the server"""
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )


if __name__ == "__main__":
    main()
