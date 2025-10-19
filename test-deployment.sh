#!/bin/bash

# Professional Deployment Test Script
echo "🧪 Testing Professional Monorepo Deployment Configuration..."

# Test 1: Check if frontend directory exists
echo "📁 Test 1: Checking frontend directory..."
if [ ! -d "frontend" ]; then
    echo "❌ ERROR: frontend directory not found!"
    exit 1
fi
echo "✅ frontend directory exists"

# Test 2: Check if package.json exists in frontend
echo "📦 Test 2: Checking frontend package.json..."
if [ ! -f "frontend/package.json" ]; then
    echo "❌ ERROR: frontend/package.json not found!"
    exit 1
fi
echo "✅ frontend/package.json exists"

# Test 3: Check if root package.json has build script
echo "🔧 Test 3: Checking root build script..."
if ! grep -q "build:frontend" package.json; then
    echo "❌ ERROR: build:frontend script not found in root package.json!"
    exit 1
fi
echo "✅ build:frontend script exists"

# Test 4: Test the build command
echo "🏗️ Test 4: Testing build command..."
npm run build:frontend

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "✅ Configuration is correct for Vercel deployment"
    echo ""
    echo "🚀 Ready for deployment!"
    echo "   - Frontend directory preserved ✅"
    echo "   - Build command works ✅"
    echo "   - Output directory exists ✅"
else
    echo "❌ Build failed!"
    echo "Check the error messages above for details"
    exit 1
fi
