# HARBOR Auto-Annotator - Dockerfile

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenCV and torch
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY pyproject.toml ./
RUN pip install --no-cache-dir -e .

# Copy source
COPY src ./src

# Create directories
RUN mkdir -p /app/storage /app/models /app/temp

# Environment
ENV PYTHONUNBUFFERED=1
ENV STORAGE_PATH=/app/storage
ENV MODEL_CACHE=/app/models

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8002/health || exit 1

# Run
EXPOSE 8002
CMD ["python", "-m", "src.main"]
