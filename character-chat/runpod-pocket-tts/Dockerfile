# Pocket TTS Server
# Runs on CPU - no GPU required
# Deploy to any CPU server (DigitalOcean, Railway, etc.)

FROM python:3.11-slim

# Install Pocket TTS
RUN pip install --no-cache-dir pocket-tts

# Create voices directory
RUN mkdir -p /app/voices

WORKDIR /app

# Copy voice files (mount as volume in production)
# COPY voices/ /app/voices/

# Expose HTTP port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the server
# First run will download ~1GB model
CMD ["pocket-tts", "serve", "--host", "0.0.0.0", "--port", "8000"]
