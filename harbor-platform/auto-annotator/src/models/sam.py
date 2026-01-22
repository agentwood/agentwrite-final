"""
HARBOR Auto-Annotator - SAM3 Segmentation
Uses Roboflow API for SAM3 inference
"""

import asyncio
import base64
from pathlib import Path
from typing import Optional
from io import BytesIO

import httpx
import numpy as np
from PIL import Image

from ..config import settings
from ..schemas import Segment, BoundingBox


class SAMSegmenter:
    """SAM3 segmentation via Roboflow API"""
    
    def __init__(self):
        self.api_key = settings.ROBOFLOW_API_KEY
        self.endpoint = settings.SAM_ENDPOINT
        self.client: Optional[httpx.AsyncClient] = None
    
    async def initialize(self) -> None:
        """Initialize HTTP client"""
        if self.client is None:
            self.client = httpx.AsyncClient(timeout=60.0)
    
    async def close(self) -> None:
        """Close HTTP client"""
        if self.client:
            await self.client.aclose()
            self.client = None
    
    async def segment_image(
        self,
        image: np.ndarray,
        detections: list[dict] = None,
        frame_index: Optional[int] = None,
    ) -> list[Segment]:
        """Segment objects in image using SAM3"""
        await self.initialize()
        
        # Convert numpy to base64
        pil_image = Image.fromarray(image)
        buffer = BytesIO()
        pil_image.save(buffer, format="JPEG")
        image_b64 = base64.b64encode(buffer.getvalue()).decode()
        
        # Prepare prompts from detections if provided
        prompts = []
        if detections:
            for det in detections:
                bbox = det.get("bbox", {})
                prompts.append({
                    "type": "box",
                    "data": [
                        bbox.get("x", 0),
                        bbox.get("y", 0),
                        bbox.get("x", 0) + bbox.get("width", 0),
                        bbox.get("y", 0) + bbox.get("height", 0),
                    ],
                    "label": det.get("label", "object"),
                })
        
        # Call Roboflow SAM3 API
        try:
            response = await self.client.post(
                f"{self.endpoint}/sam3",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "image": image_b64,
                    "prompts": prompts if prompts else None,
                    "multimask_output": False,
                },
            )
            
            if response.status_code != 200:
                print(f"[SAM] API error: {response.status_code}")
                return []
            
            data = response.json()
            
            segments = []
            for pred in data.get("predictions", []):
                segment = Segment(
                    label=pred.get("class", "object"),
                    mask_rle=pred.get("mask", {}).get("rle"),
                    area=pred.get("area", 0),
                    frame_index=frame_index,
                )
                segments.append(segment)
            
            return segments
            
        except Exception as e:
            print(f"[SAM] Error: {e}")
            return []
    
    async def segment_with_points(
        self,
        image: np.ndarray,
        points: list[tuple[int, int]],
        labels: list[int] = None,
        frame_index: Optional[int] = None,
    ) -> list[Segment]:
        """Segment using point prompts"""
        await self.initialize()
        
        # Convert numpy to base64
        pil_image = Image.fromarray(image)
        buffer = BytesIO()
        pil_image.save(buffer, format="JPEG")
        image_b64 = base64.b64encode(buffer.getvalue()).decode()
        
        # Prepare point prompts
        prompts = []
        for i, (x, y) in enumerate(points):
            prompts.append({
                "type": "point",
                "data": [x, y],
                "label": labels[i] if labels else 1,  # 1 = foreground
            })
        
        try:
            response = await self.client.post(
                f"{self.endpoint}/sam3",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "image": image_b64,
                    "prompts": prompts,
                    "multimask_output": False,
                },
            )
            
            if response.status_code != 200:
                return []
            
            data = response.json()
            
            segments = []
            for pred in data.get("predictions", []):
                segment = Segment(
                    label="segment",
                    mask_rle=pred.get("mask", {}).get("rle"),
                    area=pred.get("area", 0),
                    frame_index=frame_index,
                )
                segments.append(segment)
            
            return segments
            
        except Exception as e:
            print(f"[SAM] Error: {e}")
            return []
    
    async def segment_auto(
        self,
        image: np.ndarray,
        frame_index: Optional[int] = None,
    ) -> list[Segment]:
        """Auto-segment entire image (everything mode)"""
        await self.initialize()
        
        # Convert numpy to base64
        pil_image = Image.fromarray(image)
        buffer = BytesIO()
        pil_image.save(buffer, format="JPEG")
        image_b64 = base64.b64encode(buffer.getvalue()).decode()
        
        try:
            response = await self.client.post(
                f"{self.endpoint}/sam3",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "image": image_b64,
                    "mode": "everything",
                },
            )
            
            if response.status_code != 200:
                return []
            
            data = response.json()
            
            segments = []
            for i, pred in enumerate(data.get("predictions", [])):
                segment = Segment(
                    label=f"segment_{i}",
                    mask_rle=pred.get("mask", {}).get("rle"),
                    area=pred.get("area", 0),
                    frame_index=frame_index,
                )
                segments.append(segment)
            
            return segments
            
        except Exception as e:
            print(f"[SAM] Error: {e}")
            return []
    
    def get_model_info(self) -> dict:
        """Get model information"""
        return {
            "loaded": bool(self.api_key),
            "name": "SAM3",
            "provider": "Roboflow",
            "endpoint": self.endpoint,
        }


# Singleton
sam_segmenter = SAMSegmenter()
