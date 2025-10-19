# Quick Deployment Test Script
# This script tests if the build configuration works locally

echo "Testing Vercel build configuration..."

# Test if frontend directory exists
if [ ! -d "frontend" ]; then
    echo "❌ ERROR: frontend directory not found!"
    exit 1
fi

# Test if package.json exists in frontend
if [ ! -f "frontend/package.json" ]; then
    echo "❌ ERROR: frontend/package.json not found!"
    exit 1
fi

# Test build command
echo "Running build command..."
cd frontend && npm install && npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "✅ Configuration is correct for Vercel deployment"
else
    echo "❌ Build failed!"
    exit 1
fi
