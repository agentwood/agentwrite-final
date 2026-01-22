"""
HARBOR Auto-Annotator - Quality Checker
"""

from dataclasses import dataclass
from typing import Optional

import cv2
import numpy as np

from ..config import settings
from ..schemas import QualityCheckResult


@dataclass
class QualityMetrics:
    """Quality metrics for a media item"""
    resolution: tuple[int, int]
    brightness: float
    blur_score: float
    duration_seconds: float
    frame_count: int
    nsfw_score: float = 0.0
    deepfake_score: float = 0.0


class QualityChecker:
    """Check media quality and authenticity"""
    
    def __init__(self):
        self.min_resolution = settings.MIN_RESOLUTION
        self.nsfw_threshold = settings.NSFW_THRESHOLD
    
    async def check_video(self, video_path: str) -> QualityCheckResult:
        """Run all quality checks on video"""
        issues = []
        
        # Get video properties
        cap = cv2.VideoCapture(video_path)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = frame_count / fps if fps > 0 else 0
        
        # Resolution check
        resolution_ok = width >= self.min_resolution[0] and height >= self.min_resolution[1]
        if not resolution_ok:
            issues.append(f"Resolution {width}x{height} below minimum {self.min_resolution[0]}x{self.min_resolution[1]}")
        
        # Duration check
        duration_ok = 3 <= duration <= 600
        if not duration_ok:
            if duration < 3:
                issues.append(f"Duration {duration:.1f}s too short (min 3s)")
            else:
                issues.append(f"Duration {duration:.1f}s too long (max 600s)")
        
        # Sample frames for quality analysis
        brightness_scores = []
        blur_scores = []
        
        sample_count = min(10, frame_count)
        sample_interval = max(1, frame_count // sample_count)
        
        for i in range(0, frame_count, sample_interval):
            cap.set(cv2.CAP_PROP_POS_FRAMES, i)
            ret, frame = cap.read()
            if not ret:
                break
            
            # Brightness
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            brightness = np.mean(gray) / 255.0
            brightness_scores.append(brightness)
            
            # Blur (Laplacian variance)
            blur = cv2.Laplacian(gray, cv2.CV_64F).var()
            blur_scores.append(blur)
        
        cap.release()
        
        # Average brightness
        avg_brightness = np.mean(brightness_scores) if brightness_scores else 0.5
        brightness_ok = 0.1 <= avg_brightness <= 0.9
        if not brightness_ok:
            if avg_brightness < 0.1:
                issues.append(f"Video too dark (brightness: {avg_brightness:.2f})")
            else:
                issues.append(f"Video overexposed (brightness: {avg_brightness:.2f})")
        
        # Average blur
        avg_blur = np.mean(blur_scores) if blur_scores else 100
        blur_ok = avg_blur >= 50  # Higher variance = sharper
        if not blur_ok:
            issues.append(f"Video too blurry (score: {avg_blur:.1f})")
        
        # NSFW check (placeholder - integrate with model)
        nsfw_score = await self._check_nsfw(video_path)
        nsfw_ok = nsfw_score < self.nsfw_threshold
        if not nsfw_ok:
            issues.append(f"NSFW content detected (score: {nsfw_score:.2f})")
        
        # Deepfake check (placeholder)
        deepfake_score = await self._check_deepfake(video_path)
        deepfake_ok = deepfake_score < 0.7
        if not deepfake_ok:
            issues.append(f"Potential deepfake detected (score: {deepfake_score:.2f})")
        
        # Calculate overall score
        checks = [resolution_ok, duration_ok, brightness_ok, blur_ok, nsfw_ok, deepfake_ok]
        score = sum(checks) / len(checks)
        passed = all(checks)
        
        # Determine rejection reason
        rejection_reason = None
        if not passed:
            if not resolution_ok:
                rejection_reason = "low_resolution"
            elif not nsfw_ok:
                rejection_reason = "nsfw_content"
            elif not deepfake_ok:
                rejection_reason = "deepfake_detected"
            elif not duration_ok:
                rejection_reason = "poor_quality"
            elif not brightness_ok or not blur_ok:
                rejection_reason = "poor_quality"
        
        return QualityCheckResult(
            passed=passed,
            score=score,
            issues=issues,
            resolution_ok=resolution_ok,
            brightness_ok=brightness_ok,
            blur_ok=blur_ok,
            nsfw_ok=nsfw_ok,
            deepfake_ok=deepfake_ok,
            duration_ok=duration_ok,
            rejection_reason=rejection_reason,
        )
    
    async def check_image(self, image: np.ndarray) -> QualityCheckResult:
        """Run quality checks on single image"""
        issues = []
        
        height, width = image.shape[:2]
        
        # Resolution
        resolution_ok = width >= self.min_resolution[0] and height >= self.min_resolution[1]
        if not resolution_ok:
            issues.append(f"Resolution {width}x{height} below minimum")
        
        # Brightness
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        brightness = np.mean(gray) / 255.0
        brightness_ok = 0.1 <= brightness <= 0.9
        if not brightness_ok:
            issues.append(f"Image brightness issue: {brightness:.2f}")
        
        # Blur
        blur = cv2.Laplacian(gray, cv2.CV_64F).var()
        blur_ok = blur >= 50
        if not blur_ok:
            issues.append(f"Image too blurry: {blur:.1f}")
        
        checks = [resolution_ok, brightness_ok, blur_ok]
        score = sum(checks) / len(checks)
        
        return QualityCheckResult(
            passed=all(checks),
            score=score,
            issues=issues,
            resolution_ok=resolution_ok,
            brightness_ok=brightness_ok,
            blur_ok=blur_ok,
            nsfw_ok=True,
            deepfake_ok=True,
            duration_ok=True,
        )
    
    async def _check_nsfw(self, video_path: str) -> float:
        """Check for NSFW content (placeholder)"""
        # TODO: Integrate with NSFW detection model (e.g., nsfw_detector)
        # For now, return safe score
        return 0.0
    
    async def _check_deepfake(self, video_path: str) -> float:
        """Check for deepfake content (placeholder)"""
        # TODO: Integrate with deepfake detection model
        # For now, return safe score
        return 0.0
    
    async def check_duplicate(self, media_id: str, embedding: list[float]) -> bool:
        """Check if content is duplicate (placeholder)"""
        # TODO: Compare embeddings with existing content
        return False


# Singleton
quality_checker = QualityChecker()
