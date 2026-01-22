"""
HARBOR Auto-Annotator - Pipeline Orchestrator
Coordinates all annotation models in sequence
"""

import asyncio
import time
from datetime import datetime
from pathlib import Path
from typing import Optional

import cv2
import numpy as np

from ..config import settings
from ..schemas import (
    AnnotationJobRequest,
    AnnotationResult,
    Detection,
    Segment,
    TranscriptEntry,
    SceneLabel,
    QualityCheckResult,
)
from ..models import (
    yolo_detector,
    sam_segmenter,
    whisper_transcriber,
    clip_classifier,
    quality_checker,
)


class AnnotationPipeline:
    """Orchestrates the complete annotation pipeline"""
    
    def __init__(self):
        self.initialized = False
    
    async def initialize(self) -> None:
        """Initialize all models"""
        if self.initialized:
            return
        
        print("[Pipeline] Initializing models...")
        
        # Initialize models in parallel
        await asyncio.gather(
            yolo_detector.initialize(),
            sam_segmenter.initialize(),
            whisper_transcriber.initialize(),
            clip_classifier.initialize(),
        )
        
        self.initialized = True
        print("[Pipeline] All models ready")
    
    async def process_video(
        self,
        job: AnnotationJobRequest,
    ) -> AnnotationResult:
        """Process video through complete pipeline"""
        await self.initialize()
        
        start_time = time.time()
        models_used = []
        
        video_path = job.file_path
        frame_rate = job.frame_rate or settings.FRAME_RATE
        max_frames = job.max_frames or settings.MAX_FRAMES
        
        # Initialize result
        result = AnnotationResult(
            media_id=job.media_id,
            detections=[],
            segments=[],
            transcript=[],
            scene_labels=[],
        )
        
        # Extract video metadata
        cap = cv2.VideoCapture(video_path)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps if fps > 0 else 0
        cap.release()
        
        result.resolution = (width, height)
        result.duration_seconds = duration
        result.frame_count = total_frames
        
        # Step 1: Quality check
        if job.run_quality_check:
            print(f"[Pipeline] Running quality check...")
            quality_result = await quality_checker.check_video(video_path)
            result.quality_score = quality_result.score
            result.nsfw_detected = not quality_result.nsfw_ok
            result.nsfw_score = settings.NSFW_THRESHOLD if result.nsfw_detected else 0.0
            result.deepfake_detected = not quality_result.deepfake_ok
            
            if not quality_result.passed:
                print(f"[Pipeline] Quality check failed: {quality_result.issues}")
                result.processing_time_ms = int((time.time() - start_time) * 1000)
                return result
        
        # Step 2: Object detection (YOLO)
        if job.run_detection:
            print(f"[Pipeline] Running YOLO detection...")
            detections, detection_summary = await yolo_detector.detect_video(
                video_path,
                frame_rate=frame_rate,
                max_frames=max_frames,
            )
            result.detections = detections
            result.detection_summary = detection_summary
            models_used.append("YOLOv11")
            print(f"[Pipeline] Found {len(detections)} detections")
        
        # Step 3: Segmentation (SAM) - on keyframes with detections
        if job.run_segmentation and result.detections:
            print(f"[Pipeline] Running SAM segmentation...")
            
            # Group detections by frame
            frame_detections: dict[int, list[Detection]] = {}
            for det in result.detections:
                if det.frame_index is not None:
                    if det.frame_index not in frame_detections:
                        frame_detections[det.frame_index] = []
                    frame_detections[det.frame_index].append(det)
            
            # Sample frames for segmentation (max 10)
            sample_frames = sorted(frame_detections.keys())[:10]
            
            cap = cv2.VideoCapture(video_path)
            all_segments = []
            
            for frame_idx in sample_frames:
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
                ret, frame = cap.read()
                if not ret:
                    continue
                
                # Convert detections to dict format
                det_dicts = [
                    {
                        "bbox": {
                            "x": d.bbox.x,
                            "y": d.bbox.y,
                            "width": d.bbox.width,
                            "height": d.bbox.height,
                        },
                        "label": d.label,
                    }
                    for d in frame_detections[frame_idx]
                ]
                
                segments = await sam_segmenter.segment_image(
                    cv2.cvtColor(frame, cv2.COLOR_BGR2RGB),
                    detections=det_dicts,
                    frame_index=frame_idx,
                )
                all_segments.extend(segments)
            
            cap.release()
            result.segments = all_segments
            models_used.append("SAM3")
            print(f"[Pipeline] Generated {len(all_segments)} segments")
        
        # Step 4: Transcription (Whisper)
        if job.run_transcription:
            print(f"[Pipeline] Running Whisper transcription...")
            transcript, full_text, language = await whisper_transcriber.transcribe_video(
                video_path
            )
            result.transcript = transcript
            result.full_text = full_text
            result.detected_language = language
            models_used.append("Whisper")
            print(f"[Pipeline] Transcribed {len(transcript)} segments")
        
        # Step 5: Scene classification (CLIP)
        if job.run_scene_classification:
            print(f"[Pipeline] Running CLIP classification...")
            
            # Sample a representative frame
            cap = cv2.VideoCapture(video_path)
            middle_frame = total_frames // 2
            cap.set(cv2.CAP_PROP_POS_FRAMES, middle_frame)
            ret, frame = cap.read()
            cap.release()
            
            if ret:
                scene_labels = await clip_classifier.classify_image(
                    cv2.cvtColor(frame, cv2.COLOR_BGR2RGB),
                    frame_index=middle_frame,
                )
                result.scene_labels = scene_labels
                
                # Get embedding for semantic search
                embedding = await clip_classifier.get_embedding(
                    cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                )
                result.embeddings = embedding
                models_used.append("CLIP")
                print(f"[Pipeline] Classified {len(scene_labels)} scenes")
        
        result.models_used = models_used
        result.processing_time_ms = int((time.time() - start_time) * 1000)
        result.processed_at = datetime.utcnow()
        
        print(f"[Pipeline] Complete in {result.processing_time_ms}ms")
        
        return result
    
    async def process_image(
        self,
        image_path: str,
        media_id: str,
        run_segmentation: bool = True,
    ) -> AnnotationResult:
        """Process single image"""
        await self.initialize()
        
        start_time = time.time()
        models_used = []
        
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image: {image_path}")
        
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        height, width = image.shape[:2]
        
        result = AnnotationResult(
            media_id=media_id,
            resolution=(width, height),
            frame_count=1,
        )
        
        # Quality check
        quality_result = await quality_checker.check_image(image)
        result.quality_score = quality_result.score
        
        # Detection
        detections = await yolo_detector.detect_image(image_rgb)
        result.detections = detections
        result.detection_summary = {}
        for det in detections:
            result.detection_summary[det.label] = result.detection_summary.get(det.label, 0) + 1
        models_used.append("YOLOv11")
        
        # Segmentation
        if run_segmentation and detections:
            det_dicts = [
                {"bbox": {"x": d.bbox.x, "y": d.bbox.y, "width": d.bbox.width, "height": d.bbox.height}, "label": d.label}
                for d in detections
            ]
            segments = await sam_segmenter.segment_image(image_rgb, detections=det_dicts)
            result.segments = segments
            models_used.append("SAM3")
        
        # Scene classification
        scene_labels = await clip_classifier.classify_image(image_rgb)
        result.scene_labels = scene_labels
        embedding = await clip_classifier.get_embedding(image_rgb)
        result.embeddings = embedding
        models_used.append("CLIP")
        
        result.models_used = models_used
        result.processing_time_ms = int((time.time() - start_time) * 1000)
        
        return result
    
    def get_status(self) -> dict:
        """Get pipeline status"""
        return {
            "initialized": self.initialized,
            "models": {
                "yolo": yolo_detector.get_model_info(),
                "sam": sam_segmenter.get_model_info(),
                "whisper": whisper_transcriber.get_model_info(),
                "clip": clip_classifier.get_model_info(),
            }
        }


# Singleton
annotation_pipeline = AnnotationPipeline()
