# LIGHTWEIGHT BUILD - Downloads models at runtime instead of baking
# This trades cold-start speed for reliable builds
FROM pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime

ENV PIP_DEFAULT_TIMEOUT=300

# System dependencies
RUN apt-get update && apt-get install -y \
    git \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first (these are fast)
RUN pip install --no-cache-dir runpod

# Clone and install F5-TTS
RUN git clone --depth 1 https://github.com/SWivid/F5-TTS.git .
RUN pip install --no-cache-dir -e .

# SKIP MODEL DOWNLOAD - will happen on first request
# This makes the build reliable but first request will be slow (~30s)

COPY handler.py .

CMD [ "python3", "-u", "handler.py" ]
