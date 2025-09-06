#!/bin/bash

# Deploy Taco Delite Infrastructure
set -e

echo "🚀 Deploying Taco Delite Infrastructure..."

# Check if terraform.tfvars exists
if [ ! -f "terraform.tfvars" ]; then
    echo "❌ terraform.tfvars not found!"
    echo "Please create terraform.tfvars with required variables:"
    echo "jwt_secret = \"your-secret-key-here\""
    exit 1
fi

# Initialize Terraform
echo "📋 Initializing Terraform..."
terraform init

# Plan changes
echo "📋 Planning changes..."
terraform plan

# Ask for confirmation
echo ""
read -p "Do you want to apply these changes? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Applying changes..."
    terraform apply -auto-approve
    echo "✅ Infrastructure deployed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Deploy Lambda functions: ../deploy-lambda.sh"
    echo "2. Upload static assets to S3"
    echo "3. Configure CloudFlare with the outputs above"
else
    echo "❌ Deployment cancelled"
    exit 1
fi
