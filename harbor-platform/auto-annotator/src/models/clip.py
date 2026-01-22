"""
HARBOR Auto-Annotator - CLIP Scene Understanding
"""

import asyncio
import base64
from io import BytesIO
from typing import Optional

import httpx
import numpy as np
from PIL import Image

from ..config import settings
from ..schemas import SceneLabel


# Default scene labels for classification
DEFAULT_SCENE_LABELS = [
    "indoor scene",
    "outdoor scene",
    "urban street",
    "nature landscape",
    "office environment",
    "home interior",
    "retail store",
    "restaurant",
    "sports event",
    "concert or performance",
    "beach or waterfront",
    "mountain scenery",
    "forest or woods",
    "cityscape",
    "rural area",
    "industrial setting",
    "construction site",
    "transportation hub",
    "medical facility",
    "educational setting",
]

# Activity labels
DEFAULT_ACTIVITY_LABELS = [
    "person walking",
    "person running",
    "person sitting",
    "person standing",
    "person talking",
    "person eating",
    "person working",
    "person exercising",
    "person playing sports",
    "person using phone",
    "person dancing",
    "group gathering",
    "vehicle in motion",
    "animal activity",
]


class CLIPClassifier:
    """CLIP scene classification and embedding generation"""
    
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.client: Optional[httpx.AsyncClient] = None
    
    async def initialize(self) -> None:
        """Initialize HTTP client"""
        if self.client is None:
            self.client = httpx.AsyncClient(
                timeout=30.0,
                headers={"Authorization": f"Bearer {self.api_key}"}
            )
    
    async def close(self) -> None:
        """Close HTTP client"""
        if self.client:
            await self.client.aclose()
            self.client = None
    
    async def classify_image(
        self,
        image: np.ndarray,
        labels: list[str] = None,
        frame_index: Optional[int] = None,
    ) -> list[SceneLabel]:
        """Classify image using CLIP via OpenAI API"""
        await self.initialize()
        
        if labels is None:
            labels = DEFAULT_SCENE_LABELS + DEFAULT_ACTIVITY_LABELS
        
        # Convert numpy to base64
        pil_image = Image.fromarray(image)
        buffer = BytesIO()
        pil_image.save(buffer, format="JPEG")
        image_b64 = base64.b64encode(buffer.getvalue()).decode()
        
        try:
            # Use GPT-4 Vision for classification (CLIP-like functionality)
            response = await self.client.post(
                "https://api.openai.com/v1/chat/completions",
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": f"Classify this image. Select ALL applicable labels from this list and provide confidence (0-1) for each: {', '.join(labels)}. Respond in JSON format: {{\"labels\": [{{\"label\": \"...\", \"confidence\": 0.X}}]}}"
                                },
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{image_b64}",
                                        "detail": "low"
                                    }
                                }
                            ]
                        }
                    ],
                    "max_tokens": 500,
                    "response_format": {"type": "json_object"}
                }
            )
            
            if response.status_code != 200:
                print(f"[CLIP] API error: {response.status_code}")
                return []
            
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            
            import json
            result = json.loads(content)
            
            scene_labels = []
            for item in result.get("labels", []):
                scene_label = SceneLabel(
                    label=item["label"],
                    confidence=item["confidence"],
                    frame_index=frame_index,
                )
                scene_labels.append(scene_label)
            
            return scene_labels
            
        except Exception as e:
            print(f"[CLIP] Error: {e}")
            return []
    
    async def get_embedding(
        self,
        image: np.ndarray,
    ) -> Optional[list[float]]:
        """Get CLIP embedding for image via OpenAI"""
        await self.initialize()
        
        # Convert numpy to base64
        pil_image = Image.fromarray(image)
        buffer = BytesIO()
        pil_image.save(buffer, format="JPEG")
        image_b64 = base64.b64encode(buffer.getvalue()).decode()
        
        try:
            # Describe image first, then embed the description
            describe_response = await self.client.post(
                "https://api.openai.com/v1/chat/completions",
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": "Describe this image in 2-3 sentences for semantic search."},
                                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}", "detail": "low"}}
                            ]
                        }
                    ],
                    "max_tokens": 200,
                }
            )
            
            if describe_response.status_code != 200:
                return None
            
            description = describe_response.json()["choices"][0]["message"]["content"]
            
            # Get embedding of description
            embed_response = await self.client.post(
                "https://api.openai.com/v1/embeddings",
                json={
                    "model": "text-embedding-3-small",
                    "input": description,
                }
            )
            
            if embed_response.status_code != 200:
                return None
            
            embedding = embed_response.json()["data"][0]["embedding"]
            return embedding
            
        except Exception as e:
            print(f"[CLIP] Embedding error: {e}")
            return None
    
    async def similarity_search(
        self,
        query: str,
        embeddings: list[list[float]],
    ) -> list[tuple[int, float]]:
        """Find most similar embeddings to query"""
        await self.initialize()
        
        try:
            # Get query embedding
            response = await self.client.post(
                "https://api.openai.com/v1/embeddings",
                json={
                    "model": "text-embedding-3-small",
                    "input": query,
                }
            )
            
            if response.status_code != 200:
                return []
            
            query_embedding = response.json()["data"][0]["embedding"]
            
            # Calculate cosine similarity
            import numpy as np
            query_vec = np.array(query_embedding)
            
            similarities = []
            for i, emb in enumerate(embeddings):
                emb_vec = np.array(emb)
                sim = np.dot(query_vec, emb_vec) / (np.linalg.norm(query_vec) * np.linalg.norm(emb_vec))
                similarities.append((i, float(sim)))
            
            # Sort by similarity
            similarities.sort(key=lambda x: x[1], reverse=True)
            
            return similarities
            
        except Exception as e:
            print(f"[CLIP] Search error: {e}")
            return []
    
    def get_model_info(self) -> dict:
        """Get model information"""
        return {
            "loaded": bool(self.api_key),
            "name": "CLIP (via OpenAI)",
            "provider": "OpenAI",
        }


# Singleton
clip_classifier = CLIPClassifier()
