#!/bin/bash

# Deploy script for Taco Delite App to AWS using Terraform
# This script builds the app and deploys it to AWS

set -e

echo "🚀 Starting deployment to AWS using Terraform..."

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform is not installed. Please install Terraform first."
    echo "   Visit: https://www.terraform.io/downloads.html"
    exit 1
fi

# Check if AWS CLI is installed and configured
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install AWS CLI first."
    echo "   Visit: https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

# Build the app
echo "📦 Building the app..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Aborting deployment."
    exit 1
fi

echo "✅ Build completed successfully!"

# Initialize Terraform (if needed)
echo "🔧 Initializing Terraform..."
terraform init

# Plan the deployment
echo "📋 Planning Terraform deployment..."
terraform plan -var-file=staging.tfvars

# Ask for confirmation
read -p "Do you want to proceed with the deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled."
    exit 1
fi

# Apply the deployment
echo "☁️  Deploying to AWS..."
terraform apply -var-file=staging.tfvars -auto-approve

if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    
    # Get outputs
    echo "📊 Deployment outputs:"
    terraform output
    
    # Upload static assets
    echo "📤 Uploading static assets to S3..."
    npm run upload:static
    
    echo "✅ Your app is now live on AWS!"
    echo "🌐 URL: $(terraform output -raw deployment_url)"
else
    echo "❌ Deployment failed."
    exit 1
fi
