#!/bin/bash

# Import n8n workflow automatically
# This script imports the voice audit workflow into n8n

WORKFLOW_FILE="./n8n/workflows/voice-audit-pipeline.json"
N8N_URL="http://localhost:5678"

echo "🔄 Importing Voice Audit Workflow to n8n..."

# Check if n8n is running
if ! curl -s "$N8N_URL" > /dev/null; then
    echo "❌ n8n is not running. Please start it first with: n8n start"
    exit 1
fi

# Check if workflow file exists
if [ ! -f "$WORKFLOW_FILE" ]; then
    echo "❌ Workflow file not found: $WORKFLOW_FILE"
    exit 1
fi

echo "📁 Found workflow file: $WORKFLOW_FILE"

# Import using n8n CLI
echo "📥 Importing workflow..."

# Method 1: Use n8n import command (if available)
if command -v n8n &> /dev/null; then
    n8n import:workflow --input="$WORKFLOW_FILE"
    
    if [ $? -eq 0 ]; then
        echo "✅ Workflow imported successfully!"
        echo "🌐 Access it at: $N8N_URL"
        echo "📡 Webhook URL: $N8N_URL/webhook/voice-audit-trigger"
    else
        echo "⚠️  Import via CLI failed. Please import manually:"
        echo "   1. Open: $N8N_URL"
        echo "   2. Go to: Workflows → Import from File"
        echo "   3. Select: $WORKFLOW_FILE"
    fi
else
    echo "⚠️  n8n CLI not available. Manual import required:"
    echo "   1. Open: $N8N_URL"
    echo "   2. Go to: Workflows → Import from File"  
    echo "   3. Select: $WORKFLOW_FILE"
fi

echo ""
echo "🔧 Next steps:"
echo "   1. Configure environment variables in n8n workflow"
echo "   2. Activate the workflow"
echo "   3. Test with: npx tsx scripts/trigger-voice-audit.ts <characterId>"
