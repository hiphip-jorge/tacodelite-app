#!/bin/bash

# Build and package authentication Lambda functions
set -e

echo "🔧 Building authentication Lambda functions..."

# Create auth directory if it doesn't exist
mkdir -p lambda/auth

# Build login function
echo "📦 Building admin login function..."
cd lambda/auth/login
npm install --production
zip -r ../login.zip . -x "*.git*" "node_modules/.cache/*"
cd ../../..

# Build verify function
echo "📦 Building admin verify function..."
cd lambda/auth/verify
npm install --production
zip -r ../verify.zip . -x "*.git*" "node_modules/.cache/*"
cd ../../..

echo "✅ Authentication Lambda functions built successfully!"
echo "📁 Files created:"
echo "  - lambda/auth/login.zip"
echo "  - lambda/auth/verify.zip"
