#!/bin/bash

# Build Lambda Functions Script
# This script packages all Lambda functions into zip files for deployment

set -e

echo "📦 Building Lambda functions..."

# Check if zip command is available
if ! command -v zip &> /dev/null; then
    echo "❌ Error: zip command not found. Installing zip..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y zip
    elif command -v yum &> /dev/null; then
        sudo yum install -y zip
    else
        echo "❌ Cannot install zip. Please ensure zip is available."
        exit 1
    fi
fi

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LAMBDA_DIR="$PROJECT_ROOT/lambda"

cd "$LAMBDA_DIR"

# Function to package a Lambda function with checksum
package_lambda_with_checksum() {
    local function_dir="$1"
    local base_name="$2"
    
    if [ -d "$function_dir" ]; then
        echo "📦 Packaging $function_dir..."
        
        # Remove old zip files
        rm -f "${base_name}.zip"
        rm -f "${base_name}."[0-9a-f]*".zip"
        
        # Copy shared directory if it exists
        if [ -d "shared" ]; then
            cp -r shared "$function_dir/"
        fi
        
        # Create zip file
        cd "$function_dir"
        
        # Install dependencies if package.json exists
        if [ -f "package.json" ]; then
            echo "  📥 Installing dependencies..."
            npm ci --only=production
        fi
        
        # Create zip (exclude node_modules if it exists, as Lambda runtime provides AWS SDK)
        if [ -d "node_modules" ]; then
            zip -r "../${base_name}.zip" . -x "node_modules/@aws-sdk/*" "node_modules/aws-sdk/*" "*.DS_Store"
        else
            zip -r "../${base_name}.zip" . -x "*.DS_Store"
        fi
        
        cd ..
        
        # Remove copied shared directory
        if [ -d "$function_dir/shared" ]; then
            rm -rf "$function_dir/shared"
        fi
        
        # Calculate content-based checksum (based on source files, not zip)
        # This ensures same checksum for identical code, different only when code changes
        checksum=$(find . -name "*.js" -o -name "*.json" | sort | xargs cat | sha256sum | cut -c1-8)
        mv "${base_name}.zip" "${base_name}.${checksum}.zip"
        
        # Verify zip file was created
        if [ -f "${base_name}.${checksum}.zip" ]; then
            echo "  ✅ Created ${base_name}.${checksum}.zip ($(du -h "${base_name}.${checksum}.zip" | cut -f1))"
        else
            echo "  ❌ Failed to create ${base_name}.${checksum}.zip"
            exit 1
        fi
    else
        echo "  ⚠️  Directory $function_dir not found, skipping..."
    fi
}

# Function to package a Lambda function without checksum (for functions that don't need it)
package_lambda() {
    local function_dir="$1"
    local zip_name="$2"
    
    if [ -d "$function_dir" ]; then
        echo "📦 Packaging $function_dir..."
        
        # Remove existing zip file
        rm -f "$zip_name"
        
        # Create zip file
        cd "$function_dir"
        
        # Install dependencies if package.json exists
        if [ -f "package.json" ]; then
            echo "  📥 Installing dependencies..."
            npm ci --only=production
        fi
        
        # Create zip (exclude node_modules if it exists, as Lambda runtime provides AWS SDK)
        if [ -d "node_modules" ]; then
            zip -r "../$zip_name" . -x "node_modules/@aws-sdk/*" "node_modules/aws-sdk/*" "*.DS_Store"
        else
            zip -r "../$zip_name" . -x "*.DS_Store"
        fi
        
        cd ..
        
        # Verify zip file was created
        if [ -f "$zip_name" ]; then
            echo "  ✅ Created $zip_name ($(du -h "$zip_name" | cut -f1))"
        else
            echo "  ❌ Failed to create $zip_name"
            exit 1
        fi
    else
        echo "  ⚠️  Directory $function_dir not found, skipping..."
    fi
}

# Package all Lambda functions
echo "🚀 Starting Lambda packaging process..."

# Core functions with checksums (for caching support)
package_lambda_with_checksum "getMenuItems" "getMenuItems"
package_lambda_with_checksum "getCategories" "getCategories"
package_lambda_with_checksum "createCategory" "createCategory"
package_lambda_with_checksum "updateCategory" "updateCategory"
package_lambda_with_checksum "deleteCategory" "deleteCategory"
package_lambda_with_checksum "createMenuItem" "createMenuItem"
package_lambda_with_checksum "updateMenuItem" "updateMenuItem"
package_lambda_with_checksum "deleteMenuItem" "deleteMenuItem"

# Other functions without checksums
package_lambda "searchMenuItems" "searchMenuItems.zip"
package_lambda "getMenuItemsByCategory" "getMenuItemsByCategory.zip"
package_lambda "getMenuVersion" "getMenuVersion.zip"
package_lambda "incrementMenuVersion" "incrementMenuVersion.zip"

# Auth functions (these create zip files in auth/ subdirectory)
echo "📦 Packaging auth/login..."
if [ -d "auth/login" ]; then
    cd "auth/login"
    
    # Install dependencies if package.json exists
    if [ -f "package.json" ]; then
        echo "  📥 Installing dependencies..."
        npm ci --only=production
    fi
    
    # Create zip (exclude node_modules if it exists)
    if [ -d "node_modules" ]; then
        zip -r "../login.zip" . -x "node_modules/@aws-sdk/*" "node_modules/aws-sdk/*"
    else
        zip -r "../login.zip" .
    fi
    
    cd "../.."
    echo "  ✅ Created auth/login.zip"
else
    echo "  ⚠️  Directory auth/login not found, skipping..."
fi

echo "📦 Packaging auth/verify..."
if [ -d "auth/verify" ]; then
    cd "auth/verify"
    
    # Install dependencies if package.json exists
    if [ -f "package.json" ]; then
        echo "  📥 Installing dependencies..."
        npm ci --only=production
    fi
    
    # Create zip (exclude node_modules if it exists)
    if [ -d "node_modules" ]; then
        zip -r "../verify.zip" . -x "node_modules/@aws-sdk/*" "node_modules/aws-sdk/*"
    else
        zip -r "../verify.zip" .
    fi
    
    cd "../.."
    echo "  ✅ Created auth/verify.zip"
else
    echo "  ⚠️  Directory auth/verify not found, skipping..."
fi

# Admin functions
package_lambda "getAdminUsers" "getAdminUsers.zip"
package_lambda "createAdminUser" "createAdminUser.zip"
package_lambda "updateAdminUser" "updateAdminUser.zip"
package_lambda "deleteAdminUser" "deleteAdminUser.zip"

# User functions
package_lambda "getUsers" "getUsers.zip"
package_lambda "getUserById" "getUserById.zip"
package_lambda "updateUser" "updateUser.zip"
package_lambda "deleteUser" "deleteUser.zip"

echo "✅ Lambda packaging complete!"

# Verify all required zip files exist
echo "🔍 Verifying all zip files..."
missing_files=()

# Check main Lambda functions (with checksums)
required_files_with_checksums=(
    "getMenuItems.*.zip"
    "getCategories.*.zip"
    "createCategory.*.zip"
    "updateCategory.*.zip"
    "deleteCategory.*.zip"
    "createMenuItem.*.zip"
    "updateMenuItem.*.zip"
    "deleteMenuItem.*.zip"
)

# Check other Lambda functions
required_files=(
    "searchMenuItems.zip"
    "getMenuItemsByCategory.zip"
    "getMenuVersion.zip"
    "incrementMenuVersion.zip"
    "getAdminUsers.zip"
    "createAdminUser.zip"
    "updateAdminUser.zip"
    "deleteAdminUser.zip"
    "getUsers.zip"
    "getUserById.zip"
    "updateUser.zip"
    "deleteUser.zip"
)

# Check files with checksums
for pattern in "${required_files_with_checksums[@]}"; do
    if ! ls $pattern 1> /dev/null 2>&1; then
        missing_files+=("$pattern")
    fi
done

# Check regular files
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

# Check auth zip files
if [ ! -f "auth/login.zip" ]; then
    missing_files+=("auth/login.zip")
fi
if [ ! -f "auth/verify.zip" ]; then
    missing_files+=("auth/verify.zip")
fi

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "✅ All required zip files created successfully!"
    echo "📋 Created zip files:"
    ls -la *.zip
    echo ""
    echo "📁 Auth zip files:"
    ls -la auth/*.zip
    echo ""
    echo "🎯 Ready for Terraform deployment!"
else
    echo "❌ Missing zip files:"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
    exit 1
fi
