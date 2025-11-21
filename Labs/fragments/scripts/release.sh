#!/bin/bash

# Release script for Lab 7
# Creates a git tag and pushes it to trigger CD workflow

VERSION="v0.7.0"

echo "Creating release tag: $VERSION"

# Create and push tag
git tag $VERSION
git push origin main --tags

echo "Tag $VERSION created and pushed. CD workflow should trigger automatically."
echo "Check GitHub Actions at: https://github.com/Abhinavintech/CCP555-2025F-NSD-Abhinav-abhinav1/actions"