FROM runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel-ubuntu22.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
RUN pip install --no-cache-dir \
    runpod \
    chatterbox-tts \
    torch \
    torchaudio \
    numpy \
    scipy

# Copy handler and profiles from root level
COPY handler.py /app/handler.py
COPY profiles /app/profiles

ENV PYTHONUNBUFFERED=1

CMD ["python", "-u", "handler.py"]
