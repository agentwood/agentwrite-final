# Using a slightly newer base image that works well with PyTorch 2.1
FROM runpod/pytorch:2.2.0-py3.10-cuda12.1.1-devel-ubuntu22.04

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    ffmpeg \
    git \
    libsndfile1 \
    portaudio19-dev \
    libportaudio2 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Install Fish Speech manually from source
RUN git clone https://github.com/fishaudio/fish-speech.git /app/fish-speech

# Install dependencies from our own requirements.txt (which includes core deps)
# We skip installing from repo since it lacks requirements.txt


# Add to PYTHONPATH
ENV PYTHONPATH="/app/fish-speech:/app"

# Copy application code
COPY handler.py .
COPY profiles /app/profiles
COPY test_imports.py .

# Verify installation during build
RUN python test_imports.py

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD python -c "import torch; print('OK')"

# Run
CMD ["python", "-u", "handler.py"]
