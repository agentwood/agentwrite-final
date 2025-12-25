#!/bin/bash

# Setup script to configure aibcmedia.com to resolve to localhost
# This script adds an entry to /etc/hosts for local development

echo "🔧 Setting up aibcmedia.com for localhost..."

# Check if entry already exists
if grep -q "aibcmedia.com" /etc/hosts; then
    echo "✅ aibcmedia.com already configured in /etc/hosts"
    grep "aibcmedia.com" /etc/hosts
else
    echo "📝 Adding aibcmedia.com to /etc/hosts (requires sudo)..."
    echo "127.0.0.1 aibcmedia.com" | sudo tee -a /etc/hosts > /dev/null
    echo "✅ Added: 127.0.0.1 aibcmedia.com"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 You can now access:"
echo "   - Main app: http://aibcmedia.com:5173"
echo "   - Character chat: http://aibcmedia.com:3000"
echo ""
echo "⚠️  Note: If you need to remove this later, edit /etc/hosts and remove the aibcmedia.com line"

