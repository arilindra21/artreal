#!/bin/bash
# ArtReal Push Script
# Usage: ./push.sh "commit message"

cd "$(dirname "$0")"

if [ -z "$1" ]; then
    echo "Usage: ./push.sh \"commit message\""
    exit 1
fi

# Add all changes
git add .

# Commit with message
git commit -m "$1"

# Push to origin
git push origin main

echo "✅ Pushed successfully!"
