#!/bin/bash

# Modifier System Seeding Script
# This script seeds the DynamoDB table with modifier groups and modifiers

set -e

echo "🌮 TacoDelite Modifier System Seeding"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the tacodelite-app root directory"
    exit 1
fi

# Load environment variables
if [ -f "env_files/terraform.tfvars" ]; then
    echo "📋 Loading environment variables from terraform.tfvars..."
    # Extract values from terraform.tfvars format
    ENVIRONMENT=$(grep 'environment =' env_files/terraform.tfvars | sed 's/.*= *"\(.*\)".*/\1/')
    APP_NAME=$(grep 'app_name =' env_files/terraform.tfvars | sed 's/.*= *"\(.*\)".*/\1/')
    AWS_REGION=$(grep 'aws_region =' env_files/terraform.tfvars | sed 's/.*= *"\(.*\)".*/\1/')
    
    # Set DynamoDB table name based on environment
    DYNAMODB_TABLE="${APP_NAME}-menu-items-${ENVIRONMENT}"
    echo "📋 Environment: $ENVIRONMENT"
    echo "📋 App Name: $APP_NAME"
    echo "📋 AWS Region: $AWS_REGION"
    echo "📋 DynamoDB Table: $DYNAMODB_TABLE"
elif [ -f ".env" ]; then
    echo "📋 Loading environment variables from .env..."
    source .env
else
    echo "⚠️  Warning: No environment file found. Using defaults."
    # Set default values
    ENVIRONMENT="staging"
    APP_NAME="tacodelite-app"
    AWS_REGION="us-east-1"
    DYNAMODB_TABLE="tacodelite-app-menu-items-staging"
    echo "📋 Using default table: $DYNAMODB_TABLE"
fi

# Export environment variables for the Node.js script
export DYNAMODB_TABLE
export AWS_REGION

echo ""
echo "🚀 Starting modifier system seeding..."
echo "Table: $DYNAMODB_TABLE"
echo "Region: $AWS_REGION"
echo ""

# Run the seeding script
node data/seed-modifiers.js

echo ""
echo "✅ Modifier system seeding completed!"
echo ""
echo "📊 Next steps:"
echo "1. Check the admin interface to verify modifier groups and modifiers"
echo "2. Edit menu items to assign modifier groups"
echo "3. Test the modifier selection in the customer interface"
echo ""
echo "📚 Documentation: docs/MODIFIER_SEEDING_STRATEGY.md"
