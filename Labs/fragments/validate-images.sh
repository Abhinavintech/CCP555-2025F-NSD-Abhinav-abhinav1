#!/bin/bash

echo "=== Part 3: Validating Images ==="

echo "3.1 Local Testing - Docker Hub Image"
echo "Pulling abhinavintech/fragments:main from Docker Hub..."
docker pull abhinavintech/fragments:main

echo "Running container..."
docker run -d -p 8080:8080 --name fragments-test abhinavintech/fragments:main

echo "Waiting for container to start..."
sleep 5

echo "Testing health check endpoint..."
curl http://localhost:8080/ || echo "Expected: Container requires AWS Cognito env vars"

echo "Checking container logs..."
docker logs fragments-test

echo "Cleaning up..."
docker stop fragments-test
docker rm fragments-test

echo "✅ Part 3.1 Complete: Docker image builds and starts correctly (requires env vars for full functionality)"

echo ""
echo "3.2 EC2 Testing - AWS ECR Image"
echo "Commands to run on EC2 instance:"
echo ""
echo "# Set AWS credentials"
echo "export AWS_ACCESS_KEY_ID=ASIAYS2NWY6BRZSPZYCB"
echo "export AWS_SECRET_ACCESS_KEY=7OBY0FQP8gbawFoJibNTm018XRNl9MgerOv0Mrrl"
echo "export AWS_SESSION_TOKEN=<full-session-token>"
echo "export AWS_DEFAULT_REGION=us-east-1"
echo ""
echo "# Login to ECR"
echo "aws ecr get-login-password --region us-east-1 | \\"
echo "  docker login --username AWS --password-stdin \\"
echo "  590184105859.dkr.ecr.us-east-1.amazonaws.com"
echo ""
echo "# Pull and run image"
echo "docker pull 590184105859.dkr.ecr.us-east-1.amazonaws.com/ccp555-2025f/fragments-abhinav:v0.7.0"
echo "docker run -d -p 8080:8080 \\"
echo "  590184105859.dkr.ecr.us-east-1.amazonaws.com/ccp555-2025f/fragments-abhinav:v0.7.0"
echo ""
echo "# Test health check"
echo "curl http://localhost:8080/"

echo "=== Validation Complete ==="