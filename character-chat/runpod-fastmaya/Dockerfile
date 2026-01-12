FROM pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Install FastMaya and dependencies
RUN pip install --no-cache-dir \
    runpod \
    scipy \
    numpy \
    git+https://github.com/ysharma3501/FastMaya.git

# Copy handler
COPY handler.py .

# Run
CMD ["python", "-u", "handler.py"]
