#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

# Simple builder script for F5-TTS runpod worker

if [ -z "$1" ]; then
    echo "Usage: ./builder.sh <image_name>"
    echo "Example: ./builder.sh myuser/f5-tts-worker:v1"
    exit 1
fi

IMAGE_NAME=$1

echo "Building Docker image: $IMAGE_NAME..."
# Use host network to ensure pip install works
docker build -t $IMAGE_NAME .

echo "Pushing to registry..."
docker push $IMAGE_NAME

echo "Build complete!"
echo "Now go to RunPod.io > Templates > New Template"
echo "Image Name: $IMAGE_NAME"
echo "Container Disk: 20GB (to hold the cached models)"
echo "Env Variables: None needed currently"
