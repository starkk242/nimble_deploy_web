#!/bin/bash

# Docker Test Script for Nimble Deploy
# Tests Docker build and basic functionality

set -e

echo "🧪 Testing Docker Build and Deployment"
echo "======================================"

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

echo "🏗️  Building Docker image..."
docker build -t nimble-deploy-test .

echo "✅ Docker image built successfully"

echo "🧪 Testing image size and layers..."
docker images nimble-deploy-test

echo "🔍 Testing health endpoint..."
# Start container in background for testing
docker run -d --name nimble-test -p 3001:5000 nimble-deploy-test

sleep 5

# Test health endpoint
if curl -f http://localhost:3001/api/health; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    docker logs nimble-test
    docker stop nimble-test
    docker rm nimble-test
    exit 1
fi

# Cleanup
echo "🧹 Cleaning up test container..."
docker stop nimble-test
docker rm nimble-test

echo "✅ Docker test completed successfully!"
echo "💡 Ready for production deployment with ./deploy.sh"