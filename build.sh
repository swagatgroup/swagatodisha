#!/bin/bash

# Vercel Build Script
# This script ensures the frontend directory exists and builds correctly

echo "Starting Vercel build process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Are we in the project root?"
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo "Error: frontend directory not found!"
    echo "Current directory contents:"
    ls -la
    exit 1
fi

# Navigate to frontend and build
echo "Navigating to frontend directory..."
cd frontend

echo "Installing dependencies..."
npm install

echo "Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "Build successful!"
    exit 0
else
    echo "Build failed!"
    exit 1
fi
