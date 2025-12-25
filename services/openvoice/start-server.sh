#!/bin/bash
# Start OpenVoice server for local development

set -e

echo "Starting OpenVoice server..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 not found. Please install Python 3.10+"
    exit 1
fi

# Check if virtual environment exists, create if not
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
if [ ! -f "venv/.deps-installed" ]; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
    touch venv/.deps-installed
fi

# Set default environment variables if not set
export PORT=${PORT:-8000}
export HOST=${HOST:-0.0.0.0}
export ALLOWED_ORIGINS=${ALLOWED_ORIGINS:-http://localhost:3000,http://localhost:3001}

echo "Starting server on ${HOST}:${PORT}..."
echo "OpenVoice server will be available at http://localhost:${PORT}"
echo "Press Ctrl+C to stop"

# Start the server
python server.py


