# OpenVoice POC Dockerfile
# Based on OpenVoice GitHub repository setup

FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    wget \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Note: OpenVoice needs to be cloned and model files downloaded
# This is done in docker-compose.yml or setup script
# See: https://github.com/myshell-ai/OpenVoice

# Copy application files
COPY . .

# Expose API port
EXPOSE 8000

# Default command (can be overridden)
CMD ["python", "server.py"]

