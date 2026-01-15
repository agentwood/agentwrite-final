# Use official F5-TTS image with models already embedded
FROM ghcr.io/swivid/f5-tts:main

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

WORKDIR /app

COPY handler.py .
COPY idle_handler.py .

# RunPod Serverless requires this CMD pattern (NOT ENTRYPOINT)
CMD ["python3", "-u", "handler.py"]
