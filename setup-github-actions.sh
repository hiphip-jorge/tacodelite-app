#!/bin/bash

# GitHub Actions Setup Helper Script
# This script helps you configure the required GitHub secrets

echo "🚀 GitHub Actions Setup Helper"
echo "================================"
echo ""

echo "📋 Required GitHub Secrets:"
echo "1. AWS_ACCESS_KEY_ID"
echo "2. AWS_SECRET_ACCESS_KEY"
echo ""

echo "🔧 How to set up secrets:"
echo "1. Go to your GitHub repository"
echo "2. Click Settings → Secrets and variables → Actions"
echo "3. Click 'New repository secret'"
echo "4. Add each secret with the exact names above"
echo ""

echo "🔑 AWS IAM Permissions needed:"
echo "Your AWS user/role needs permissions for:"
echo "- S3 (for static assets)"
echo "- DynamoDB (for database)"
echo "- Lambda (for functions)"
echo "- API Gateway (for API)"
echo "- IAM (for roles)"
echo "- CloudFormation (for Terraform)"
echo ""

echo "📝 Workflow Files Created:"
echo "- .github/workflows/test.yml (for PRs)"
echo "- .github/workflows/staging.yml (for staging branch)"
echo "- .github/workflows/production.yml (for production branch)"
echo ""

echo "🌐 Deployment URLs:"
echo "- Staging: https://staging.tacodelitewestplano.com"
echo "- Production: https://tacodelitewestplano.com"
echo ""

echo "✅ Next Steps:"
echo "1. Set up GitHub secrets"
echo "2. Push to 'staging' branch to test staging deployment"
echo "3. Push to 'production' branch to test production deployment"
echo "4. Create pull requests to test the test workflow"
echo ""

echo "📚 Documentation:"
echo "See .github/README.md for detailed setup instructions"
