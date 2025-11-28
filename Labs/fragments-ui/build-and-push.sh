#!/bin/bash

# Build and push fragments-ui to Docker Hub
# Usage: ./build-and-push.sh [your-dockerhub-username]

DOCKERHUB_USERNAME=${1:-abhinavintech}
IMAGE_NAME="fragments-ui"
TAG="latest"

echo "Building Docker image: $DOCKERHUB_USERNAME/$IMAGE_NAME:$TAG"

# Build the Docker image
docker build -t $DOCKERHUB_USERNAME/$IMAGE_NAME:$TAG .

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "Pushing to Docker Hub..."
    
    # Push to Docker Hub
    docker push $DOCKERHUB_USERNAME/$IMAGE_NAME:$TAG
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully pushed to Docker Hub!"
        echo "Image: $DOCKERHUB_USERNAME/$IMAGE_NAME:$TAG"
    else
        echo "❌ Failed to push to Docker Hub"
        exit 1
    fi
else
    echo "❌ Build failed"
    exit 1
fi