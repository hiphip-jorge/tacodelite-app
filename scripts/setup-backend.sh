#!/bin/bash

# Setup Terraform S3 Backend Script
# This script creates the S3 bucket and DynamoDB table for Terraform remote state

set -e

echo "🚀 Setting up Terraform remote state backend..."

# Configuration
BUCKET_NAME="tacodelite-terraform-state"
DYNAMODB_TABLE="tacodelite-terraform-locks"
AWS_REGION="us-east-1"

# Create S3 bucket for Terraform state
echo "📦 Creating S3 bucket: $BUCKET_NAME"
aws s3 mb "s3://$BUCKET_NAME" --region "$AWS_REGION" || echo "Bucket may already exist"

# Enable versioning on the bucket
echo "🔄 Enabling versioning on S3 bucket..."
aws s3api put-bucket-versioning \
  --bucket "$BUCKET_NAME" \
  --versioning-configuration Status=Enabled

# Enable server-side encryption
echo "🔒 Enabling server-side encryption..."
aws s3api put-bucket-encryption \
  --bucket "$BUCKET_NAME" \
  --server-side-encryption-configuration '{
    "Rules": [
      {
        "ApplyServerSideEncryptionByDefault": {
          "SSEAlgorithm": "AES256"
        }
      }
    ]
  }'

# Create DynamoDB table for state locking
echo "🔐 Creating DynamoDB table for state locking: $DYNAMODB_TABLE"
aws dynamodb create-table \
  --table-name "$DYNAMODB_TABLE" \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region "$AWS_REGION" || echo "Table may already exist"

# Wait for table to be active
echo "⏳ Waiting for DynamoDB table to be active..."
aws dynamodb wait table-exists --table-name "$DYNAMODB_TABLE" --region "$AWS_REGION"

echo "✅ Terraform remote state backend setup complete!"
echo ""
echo "📋 Backend Configuration:"
echo "   S3 Bucket: $BUCKET_NAME"
echo "   DynamoDB Table: $DYNAMODB_TABLE"
echo "   Region: $AWS_REGION"
echo ""
echo "🔄 Next steps:"
echo "   1. Run: terraform init -migrate-state"
echo "   2. This will migrate your local state to S3"
echo "   3. GitHub Actions will then use the remote state"
