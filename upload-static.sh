#!/bin/bash

# Upload static assets to S3 bucket
# This script should be run after Terraform deployment

set -e

echo "📤 Uploading static assets to S3..."

# Check if Terraform has been run
if [ ! -f ".terraform/terraform.tfstate" ] && [ ! -f "terraform.tfstate" ]; then
    echo "❌ Terraform state not found. Please run 'terraform init' and 'terraform apply' first."
    exit 1
fi

# Get S3 bucket name from Terraform output or use default
BUCKET_NAME=$(terraform output -raw s3_bucket_name 2>/dev/null || echo "")

if [ -z "$BUCKET_NAME" ]; then
    echo "❌ Could not get S3 bucket name from Terraform output."
    echo "   Please ensure Terraform deployment was successful."
    echo ""
    echo "   You can also manually specify the bucket name:"
    echo "   export S3_BUCKET_NAME=your-bucket-name"
    echo "   ./upload-static.sh"
    exit 1
fi

echo "📦 S3 Bucket: $BUCKET_NAME"

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "📦 Building app..."
    npm run build
fi

# Upload to S3 with proper Content-Type headers
echo "🚀 Uploading files to S3 with proper Content-Type headers..."

# Upload HTML files with text/html Content-Type
echo "📄 Uploading HTML files..."
aws s3 cp dist/index.html "s3://$BUCKET_NAME/index.html" \
  --content-type "text/html" \
  --cache-control "no-cache,no-store,must-revalidate"

# Upload CSS files with text/css Content-Type
echo "🎨 Uploading CSS files..."
if [ -d "dist/assets" ]; then
  for css_file in dist/assets/*.css; do
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
if [ -d "dist/assets" ]; then
  for js_file in dist/assets/*.js; do
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
if [ -d "dist/assets" ]; then
  # PNG files
  for img_file in dist/assets/*.png; do
    if [ -f "$img_file" ]; then
      filename=$(basename "$img_file")
      aws s3 cp "$img_file" "s3://$BUCKET_NAME/assets/$filename" \
        --content-type "image/png" \
        --cache-control "max-age=31536000,public"
      echo "  ✅ Uploaded: $filename"
    fi
  done
  
  # JPG/JPEG files
  for img_file in dist/assets/*.jpg dist/assets/*.jpeg; do
    if [ -f "$img_file" ]; then
      filename=$(basename "$img_file")
      aws s3 cp "$img_file" "s3://$BUCKET_NAME/assets/$filename" \
        --content-type "image/jpeg" \
        --cache-control "max-age=31536000,public"
      echo "  ✅ Uploaded: $filename"
    fi
  done
  
  # WebP files
  for img_file in dist/assets/*.webp; do
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
if [ -f "dist/favicon.ico" ]; then
  aws s3 cp dist/favicon.ico "s3://$BUCKET_NAME/favicon.ico" \
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
