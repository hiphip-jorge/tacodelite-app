#!/bin/bash

# Upload static assets to S3 bucket
# This script should be run after Terraform deployment
# Usage: ./upload-static.sh [--environment staging|production]

set -e

# Parse command line arguments
ENVIRONMENT=""
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [--environment staging|production]"
            echo "  -e, --environment    Specify environment (staging or production)"
            echo "  -h, --help          Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option $1"
            exit 1
            ;;
    esac
done

echo "📤 Uploading static assets to S3..."

# Check if Terraform has been run (only if we need to get bucket name from Terraform)
if [ -z "$ENVIRONMENT" ] && [ -z "$S3_BUCKET_NAME" ]; then
    if [ ! -f ".terraform/terraform.tfstate" ] && [ ! -f "terraform.tfstate" ] && [ ! -f "terraform/.terraform/terraform.tfstate" ] && [ ! -f "terraform/terraform.tfstate" ]; then
        echo "❌ Terraform state not found. Please run 'terraform init' and 'terraform apply' first."
        exit 1
    fi
fi

# Determine S3 bucket name and build directory
if [ -n "$ENVIRONMENT" ]; then
    # Use environment flag
    case $ENVIRONMENT in
        staging)
            BUCKET_NAME="tacodelite-app-staging"
            BUILD_DIR="dist/staging"
            ;;
        production)
            BUCKET_NAME="tacodelite-app-production"
            BUILD_DIR="dist/production"
            ;;
        *)
            echo "❌ Invalid environment: $ENVIRONMENT"
            echo "   Valid options: staging, production"
            exit 1
            ;;
    esac
    echo "🎯 Using environment: $ENVIRONMENT"
    echo "📁 Build directory: $BUILD_DIR"
elif [ -n "$S3_BUCKET_NAME" ]; then
    # Use environment variable
    BUCKET_NAME="$S3_BUCKET_NAME"
    BUILD_DIR="dist"  # Default to dist for backward compatibility
    echo "🎯 Using S3_BUCKET_NAME: $BUCKET_NAME"
else
    # Try to get from Terraform output (check both current dir and terraform subdir)
    BUCKET_NAME=$(terraform output -raw s3_bucket_name 2>/dev/null || terraform -chdir=terraform output -raw s3_bucket_name 2>/dev/null || echo "")
    BUILD_DIR="dist"  # Default to dist for backward compatibility
    
    if [ -z "$BUCKET_NAME" ]; then
        echo "❌ Could not determine S3 bucket name."
        echo ""
        echo "   Options:"
        echo "   1. Use environment flag: ./upload-static.sh --environment staging"
        echo "   2. Set environment variable: S3_BUCKET_NAME=your-bucket-name ./upload-static.sh"
        echo "   3. Run terraform apply first to set up the bucket"
        exit 1
    fi
    echo "🎯 Using Terraform output: $BUCKET_NAME"
fi

echo "📦 S3 Bucket: $BUCKET_NAME"

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo "📦 Building app..."
    if [ "$ENVIRONMENT" = "staging" ]; then
        npm run build:staging
    elif [ "$ENVIRONMENT" = "production" ]; then
        npm run build:production
    else
        npm run build
    fi
fi

# Upload to S3 with proper Content-Type headers
echo "🚀 Uploading files to S3 with proper Content-Type headers..."

# Upload HTML files with text/html Content-Type
echo "📄 Uploading HTML files..."
aws s3 cp "$BUILD_DIR/index.html" "s3://$BUCKET_NAME/index.html" \
  --content-type "text/html" \
  --cache-control "no-cache,no-store,must-revalidate"

# Upload CSS files with text/css Content-Type
echo "🎨 Uploading CSS files..."
if [ -d "$BUILD_DIR/assets" ]; then
  for css_file in "$BUILD_DIR/assets"/*.css; do
    if [ -f "$css_file" ]; then
      filename=$(basename "$css_file")
      aws s3 cp "$css_file" "s3://$BUCKET_NAME/assets/$filename" \
        --content-type "text/css" \
        --cache-control "max-age=31536000,public"
      echo "  ✅ Uploaded: $filename"
    fi
  done
fi

# Upload JS files with application/javascript Content-Type
echo "⚡ Uploading JavaScript files..."
if [ -d "$BUILD_DIR/assets" ]; then
  for js_file in "$BUILD_DIR/assets"/*.js; do
    if [ -f "$js_file" ]; then
      filename=$(basename "$js_file")
      aws s3 cp "$js_file" "s3://$BUCKET_NAME/assets/$filename" \
        --content-type "application/javascript" \
        --cache-control "max-age=31536000,public"
      echo "  ✅ Uploaded: $filename"
    fi
  done
fi

# Upload images with appropriate Content-Type
echo "🖼️ Uploading image files..."
if [ -d "$BUILD_DIR/assets" ]; then
  # PNG files
  for img_file in "$BUILD_DIR/assets"/*.png; do
    if [ -f "$img_file" ]; then
      filename=$(basename "$img_file")
      aws s3 cp "$img_file" "s3://$BUCKET_NAME/assets/$filename" \
        --content-type "image/png" \
        --cache-control "max-age=31536000,public"
      echo "  ✅ Uploaded: $filename"
    fi
  done
  
  # JPG/JPEG files
  for img_file in "$BUILD_DIR/assets"/*.jpg "$BUILD_DIR/assets"/*.jpeg; do
    if [ -f "$img_file" ]; then
      filename=$(basename "$img_file")
      aws s3 cp "$img_file" "s3://$BUCKET_NAME/assets/$filename" \
        --content-type "image/jpeg" \
        --cache-control "max-age=31536000,public"
      echo "  ✅ Uploaded: $filename"
    fi
  done
  
  # WebP files
  for img_file in "$BUILD_DIR/assets"/*.webp; do
    if [ -f "$img_file" ]; then
      filename=$(basename "$img_file")
      aws s3 cp "$img_file" "s3://$BUCKET_NAME/assets/$filename" \
        --content-type "image/webp" \
        --cache-control "max-age=31536000,public"
      echo "  ✅ Uploaded: $filename"
    fi
  done
fi

# Upload favicon
echo "🔖 Uploading favicon..."
if [ -f "$BUILD_DIR/favicon.ico" ]; then
  aws s3 cp "$BUILD_DIR/favicon.ico" "s3://$BUCKET_NAME/favicon.ico" \
    --content-type "image/x-icon" \
    --cache-control "max-age=31536000,public"
  echo "  ✅ Uploaded: favicon.ico"
fi

echo "✅ Static assets uploaded successfully with proper Content-Type headers!"
echo "🌐 Your app should be available at:"
echo "   S3 Website: http://$BUCKET_NAME.s3-website-us-east-1.amazonaws.com"
echo "   Direct S3: https://$BUCKET_NAME.s3.amazonaws.com/index.html"
echo ""
echo "💡 Next step: Set up CloudFlare using the S3 website endpoint as origin"
