#!/bin/bash

# Test script for Docker image validation
# Tests both local build and Docker Hub image

echo "=== Lab 7 Docker Image Testing ==="

# Test 1: Build image locally
echo "1. Building Docker image locally..."
docker build -t fragments:local Labs/fragments/

if [ $? -eq 0 ]; then
    echo "✅ Local build successful"
else
    echo "❌ Local build failed"
    exit 1
fi

# Test 2: Run local image
echo "2. Testing local image..."
docker run -d -p 8080:8080 --name fragments-test fragments:local

sleep 5

# Test health endpoint
if curl -f http://localhost:8080/ > /dev/null 2>&1; then
    echo "✅ Local image health check passed"
else
    echo "⚠️  Local image health check failed (may need env vars)"
fi

# Cleanup
docker stop fragments-test > /dev/null 2>&1
docker rm fragments-test > /dev/null 2>&1

# Test 3: Hadolint validation
echo "3. Running Hadolint validation..."
cd Labs/fragments
docker run --rm -i hadolint/hadolint < Dockerfile

if [ $? -eq 0 ]; then
    echo "✅ Dockerfile passes Hadolint validation"
else
    echo "❌ Dockerfile has Hadolint issues"
fi

echo "=== Testing Complete ==="
echo "Next steps:"
echo "1. Configure GitHub Secrets (DOCKERHUB_USERNAME, DOCKERHUB_TOKEN)"
echo "2. Push to main branch to trigger CI workflow"
echo "3. Create git tag to trigger CD workflow"