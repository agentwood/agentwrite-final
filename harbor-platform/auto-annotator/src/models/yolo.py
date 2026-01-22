"""
HARBOR Auto-Annotator - YOLOv11 Object Detection
"""

import asyncio
from pathlib import Path
from typing import Optional

import cv2
import numpy as np

from ..config import settings
from ..schemas import Detection, BoundingBox

# Lazy load to avoid import errors if not installed
_model = None


def get_model():
    """Lazy load YOLO model"""
    global _model
    if _model is None:
        from ultralytics import YOLO
        model_path = settings.MODEL_CACHE / settings.YOLO_MODEL
        
        # Download if not cached
        if not model_path.exists():
            _model = YOLO(settings.YOLO_MODEL)
            # Model is auto-downloaded by ultralytics
        else:
            _model = YOLO(str(model_path))
        
        print(f"[YOLO] Loaded model: {settings.YOLO_MODEL}")
    
    return _model


class YOLODetector:
    """YOLOv11 object detector"""
    
    def __init__(self, confidence_threshold: float = 0.5):
        self.confidence_threshold = confidence_threshold
        self.model = None
    
    async def initialize(self) -> None:
        """Initialize the model"""
        loop = asyncio.get_event_loop()
        self.model = await loop.run_in_executor(None, get_model)
    
    async def detect_image(
        self,
        image: np.ndarray,
        frame_index: Optional[int] = None,
        timestamp_ms: Optional[int] = None,
    ) -> list[Detection]:
        """Detect objects in a single image"""
        if self.model is None:
            await self.initialize()
        
        # Run inference
        loop = asyncio.get_event_loop()
        results = await loop.run_in_executor(
            None,
            lambda: self.model(image, conf=self.confidence_threshold, verbose=False)
        )
        
        detections = []
        
        for result in results:
            boxes = result.boxes
            if boxes is None:
                continue
            
            for i, box in enumerate(boxes):
                # Get box coordinates
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                conf = float(box.conf[0])
                cls = int(box.cls[0])
                label = result.names[cls]
                
                detection = Detection(
                    label=label,
                    confidence=conf,
                    bbox=BoundingBox(
                        x=float(x1),
                        y=float(y1),
                        width=float(x2 - x1),
                        height=float(y2 - y1),
                    ),
                    frame_index=frame_index,
                    timestamp_ms=timestamp_ms,
                )
                detections.append(detection)
        
        return detections
    
    async def detect_video(
        self,
        video_path: str,
        frame_rate: int = 1,
        max_frames: Optional[int] = None,
    ) -> tuple[list[Detection], dict[str, int]]:
        """Detect objects in video frames"""
        if self.model is None:
            await self.initialize()
        
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Calculate frame interval
        frame_interval = max(1, int(fps / frame_rate))
        
        all_detections = []
        label_counts: dict[str, int] = {}
        frame_index = 0
        processed_count = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Process every nth frame
            if frame_index % frame_interval == 0:
                timestamp_ms = int((frame_index / fps) * 1000) if fps > 0 else 0
                
                detections = await self.detect_image(
                    frame,
                    frame_index=frame_index,
                    timestamp_ms=timestamp_ms,
                )
                
                all_detections.extend(detections)
                
                # Update counts
                for det in detections:
                    label_counts[det.label] = label_counts.get(det.label, 0) + 1
                
                processed_count += 1
                
                if max_frames and processed_count >= max_frames:
                    break
            
            frame_index += 1
        
        cap.release()
        
        return all_detections, label_counts
    
    async def detect_batch(
        self,
        images: list[np.ndarray],
        frame_indices: Optional[list[int]] = None,
    ) -> list[list[Detection]]:
        """Batch detection for multiple images"""
        if self.model is None:
            await self.initialize()
        
        # Run batch inference
        loop = asyncio.get_event_loop()
        results = await loop.run_in_executor(
            None,
            lambda: self.model(images, conf=self.confidence_threshold, verbose=False)
        )
        
        all_detections = []
        
        for i, result in enumerate(results):
            frame_detections = []
            boxes = result.boxes
            
            if boxes is not None:
                for box in boxes:
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    conf = float(box.conf[0])
                    cls = int(box.cls[0])
                    label = result.names[cls]
                    
                    detection = Detection(
                        label=label,
                        confidence=conf,
                        bbox=BoundingBox(
                            x=float(x1),
                            y=float(y1),
                            width=float(x2 - x1),
                            height=float(y2 - y1),
                        ),
                        frame_index=frame_indices[i] if frame_indices else i,
                    )
                    frame_detections.append(detection)
            
            all_detections.append(frame_detections)
        
        return all_detections
    
    def get_model_info(self) -> dict:
        """Get model information"""
        if self.model is None:
            return {"loaded": False}
        
        return {
            "loaded": True,
            "name": settings.YOLO_MODEL,
            "device": str(self.model.device),
            "classes": len(self.model.names),
        }


# Singleton instance
yolo_detector = YOLODetector(confidence_threshold=settings.CONFIDENCE_THRESHOLD)
