#!/bin/bash

# Script to safely update GEMINI_API_KEY in .env file

ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env file not found in current directory"
  exit 1
fi

echo "🔑 Update Gemini API Key"
echo ""
echo "Current key (first 15 chars):"
grep "^GEMINI_API_KEY=" "$ENV_FILE" | cut -d'=' -f2 | cut -c1-15
echo ""
echo "Enter your new API key (or press Enter to skip):"
read -r new_key

if [ -z "$new_key" ]; then
  echo "❌ No key provided. Exiting."
  exit 1
fi

# Validate key format (should start with AIzaSy)
if [[ ! "$new_key" =~ ^AIzaSy ]]; then
  echo "⚠️  Warning: API key should start with 'AIzaSy'"
  read -p "Continue anyway? (y/n): " confirm
  if [ "$confirm" != "y" ]; then
    exit 1
  fi
fi

# Backup original file
cp "$ENV_FILE" "${ENV_FILE}.backup"
echo "✅ Backup created: ${ENV_FILE}.backup"

# Update the key
if grep -q "^GEMINI_API_KEY=" "$ENV_FILE"; then
  # Replace existing key
  sed -i.bak "s|^GEMINI_API_KEY=.*|GEMINI_API_KEY=$new_key|" "$ENV_FILE"
  rm -f "${ENV_FILE}.bak"
else
  # Add new key
  echo "GEMINI_API_KEY=$new_key" >> "$ENV_FILE"
fi

echo "✅ API key updated!"
echo ""
echo "New key (first 15 chars):"
grep "^GEMINI_API_KEY=" "$ENV_FILE" | cut -d'=' -f2 | cut -c1-15
echo ""
echo "⚠️  Don't forget to restart your dev server: npm run dev"




