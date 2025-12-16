#!/bin/bash

echo "🚀 Starting build process..."

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd ../client
npm install

# Build client
echo "🔨 Building client application..."
npm run build

# Verify build
if [ -d "dist" ]; then
    echo "✅ Client build successful!"
    echo "Build output location: $(pwd)/dist"
    ls -la dist/
else
    echo "❌ Client build failed - dist directory not found"
    exit 1
fi

echo "✅ Build process completed!"
