#!/bin/bash

# Script to update GitHub secrets with fresh AWS credentials
# Run this after starting a new AWS Learner Lab session

echo "🔧 AWS Secrets Update Script"
echo "=============================="
echo ""
echo "⚠️  IMPORTANT: Start your AWS Learner Lab session first!"
echo ""
echo "1. Go to AWS Learner Lab"
echo "2. Click 'Start Lab'"
echo "3. Click 'AWS Details'"
echo "4. Copy the credentials below"
echo ""

read -p "Enter AWS_ACCESS_KEY_ID: " AWS_ACCESS_KEY_ID
read -p "Enter AWS_SECRET_ACCESS_KEY: " AWS_SECRET_ACCESS_KEY
read -p "Enter AWS_SESSION_TOKEN: " AWS_SESSION_TOKEN

echo ""
echo "🔐 Setting GitHub Secrets..."

# Use GitHub CLI to set secrets
gh secret set AWS_ACCESS_KEY_ID --body "$AWS_ACCESS_KEY_ID"
gh secret set AWS_SECRET_ACCESS_KEY --body "$AWS_SECRET_ACCESS_KEY"
gh secret set AWS_SESSION_TOKEN --body "$AWS_SESSION_TOKEN"

echo "✅ GitHub secrets updated successfully!"
echo ""
echo "🚀 Now trigger the CD workflow:"
echo "   git tag v0.7.4 && git push origin v0.7.4"