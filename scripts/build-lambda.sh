#!/bin/bash

# Build Lambda Functions Script
# This script packages all Lambda functions into zip files for deployment

set -e

echo "📦 Building Lambda functions..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LAMBDA_DIR="$PROJECT_ROOT/lambda"

cd "$LAMBDA_DIR"

# Function to package a Lambda function
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
            zip -r "../$zip_name" . -x "node_modules/@aws-sdk/*" "node_modules/aws-sdk/*"
        else
            zip -r "../$zip_name" .
        fi
        
        cd ..
        echo "  ✅ Created $zip_name"
    else
        echo "  ⚠️  Directory $function_dir not found, skipping..."
    fi
}

# Package all Lambda functions
echo "🚀 Starting Lambda packaging process..."

# Core functions
package_lambda "getMenuItems" "getMenuItems.zip"
package_lambda "searchMenuItems" "searchMenuItems.zip"
package_lambda "getMenuItemsByCategory" "getMenuItemsByCategory.zip"
package_lambda "updateMenuItem" "updateMenuItem.zip"
package_lambda "deleteMenuItem" "deleteMenuItem.zip"
package_lambda "createMenuItem" "createMenuItem.zip"
package_lambda "getMenuVersion" "getMenuVersion.zip"
package_lambda "incrementMenuVersion" "incrementMenuVersion.zip"

# Category functions
package_lambda "getCategories" "getCategories.zip"
package_lambda "updateCategory" "updateCategory.zip"
package_lambda "createCategory" "createCategory.zip"
package_lambda "deleteCategory" "deleteCategory.zip"

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
echo "📋 Created zip files:"
ls -la *.zip
echo ""
echo "📁 Auth zip files:"
ls -la auth/*.zip

echo ""
echo "🎯 Ready for Terraform deployment!"
