# GitHub Secrets Setup Guide

To complete the CI/CD pipeline, you need to add the following secrets to your GitHub repository:

## Docker Hub Secrets

1. Go to your GitHub repository: https://github.com/Abhinavintech/CCP555-2025F-NSD-Abhinav-abhinav1
2. Click on Settings → Secrets and variables → Actions
3. Click "New repository secret" and add:

### DOCKERHUB_USERNAME
- Name: `DOCKERHUB_USERNAME`
- Value: `abhinavintech`

### DOCKERHUB_TOKEN
- Name: `DOCKERHUB_TOKEN`
- Value: Your Docker Hub Personal Access Token
- To create a token:
  1. Go to https://hub.docker.com/settings/security
  2. Click "New Access Token"
  3. Name: "GitHub Actions CI/CD"
  4. Permissions: Read, Write, Delete
  5. Copy the generated token

## AWS Secrets (for CD workflow)

### AWS_ACCESS_KEY_ID
- Name: `AWS_ACCESS_KEY_ID`
- Value: Your AWS Access Key ID from AWS Learner Lab

### AWS_SECRET_ACCESS_KEY
- Name: `AWS_SECRET_ACCESS_KEY`
- Value: Your AWS Secret Access Key from AWS Learner Lab

### AWS_SESSION_TOKEN
- Name: `AWS_SESSION_TOKEN`
- Value: Your AWS Session Token from AWS Learner Lab

## Testing

After adding the secrets:
1. Make a small commit to trigger CI workflow
2. Create a version tag (e.g., v0.7.2) to trigger CD workflow
3. Check GitHub Actions tab for green checkmarks

## Current Status

- ✅ CI workflow will run basic tests without secrets
- ⏳ Docker Hub push requires DOCKERHUB_USERNAME and DOCKERHUB_TOKEN
- ⏳ AWS ECR push requires AWS credentials