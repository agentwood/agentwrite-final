#!/bin/bash

echo "🔧 Character Chat - Environment Setup"
echo "===================================="
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing .env file"
        exit 0
    fi
fi

echo "📝 Creating .env file..."
echo ""

# Create .env file
cat > .env << 'ENVFILE'
# Gemini API Key
# Get yours from: https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Database URL (SQLite for local dev)
DATABASE_URL="file:./dev.db"

# Admin Secret Key (for admin endpoints)
# Generated automatically below
ADMIN_SECRET_KEY=
ENVFILE

# Generate admin secret
if command -v openssl &> /dev/null; then
    SECRET=$(openssl rand -hex 32)
    sed -i.bak "s/ADMIN_SECRET_KEY=$/ADMIN_SECRET_KEY=$SECRET/" .env
    rm .env.bak 2>/dev/null
    echo "✅ Generated ADMIN_SECRET_KEY"
else
    echo "⚠️  openssl not found, please set ADMIN_SECRET_KEY manually"
fi

echo ""
echo "✅ .env file created!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit .env and add your GEMINI_API_KEY"
echo "   2. Get your key from: https://aistudio.google.com/apikey"
echo "   3. Run: npm run db:push"
echo "   4. Run: npm run db:seed"
echo "   5. Run: npm run dev"
echo ""
