#!/bin/bash

# n8n Voice Audit System - Quick Start Script

echo "🚀 Starting n8n Voice Audit System Setup..."

# Check if n8n is installed
if ! command -v n8n &> /dev/null; then
    echo "📦 Installing n8n globally..."
    npm install -g n8n
fi

# Create n8n data directory
mkdir -p ~/.n8n

# Set environment variables
export N8N_PORT=5678
export N8N_WEBHOOK_URL="http://localhost:5678/webhook"
export N8N_EDITOR_BASE_URL="http://localhost:5678"

echo "✅ n8n installed successfully"
echo ""
echo "📋 Next steps:"
echo "1. Start n8n: n8n start"
echo "2. Open browser: http://localhost:5678"
echo "3. Import workflow: n8n/workflows/voice-audit-pipeline.json"
echo ""
echo "🔗 Workflow will be available at:"
echo "   http://localhost:5678/workflow/voice-audit-pipeline"
echo ""
echo "📡 Webhook endpoint:"
echo "   http://localhost:5678/webhook/voice-audit-trigger"
echo ""

# Optionally start n8n
read -p "Start n8n now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌐 Starting n8n on http://localhost:5678..."
    n8n start
fi
