FROM runpod/pytorch:2.2.0-py3.11-cuda12.1.1-devel-ubuntu22.04

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
RUN pip install --no-cache-dir \
    runpod \
    torch==2.2.0 \
    torchaudio==2.2.0 \
    transformers \
    accelerate \
    fish-speech

# Download Fish Speech models (cached in image)
RUN python -c "from fish_speech.models.text_to_semantic import TextToSemantic; TextToSemantic.from_pretrained('fishaudio/fish-speech-1.5')"
RUN python -c "from fish_speech.models.vqgan import VQGAN; VQGAN.from_pretrained('fishaudio/fish-speech-1.5-vqgan')"

# Copy handler
COPY handler.py .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD python -c "import torch; print('OK')"

# Run
CMD ["python", "-u", "handler.py"]
