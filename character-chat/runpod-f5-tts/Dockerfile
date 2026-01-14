# OPTIMIZED: Use RunPod's official image (cached on their nodes)
FROM runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel

ENV PIP_DEFAULT_TIMEOUT=300
ENV DEBIAN_FRONTEND=noninteractive

# System dependencies
RUN apt-get update && apt-get install -y \
    git \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies (fast)
RUN pip install --no-cache-dir runpod onnxruntime-gpu numpy scipy soundfile

# Clone and install F5-TTS (without re-installing torch)
RUN git clone --depth 1 https://github.com/SWivid/F5-TTS.git .
RUN pip install --no-cache-dir --no-deps -e .

# SKIP MODEL DOWNLOAD - will happen on first request
# This makes the build reliable but first request will be slow (~30s)

COPY handler.py .

CMD [ "python3", "-u", "handler.py" ]
