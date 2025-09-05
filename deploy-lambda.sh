#!/bin/bash

# Deploy Lambda functions for Taco Delite API
set -e

echo "🚀 Deploying Lambda functions..."

# Create lambda directory if it doesn't exist
mkdir -p lambda

# Function to package and zip a Lambda function
package_lambda() {
    local function_name=$1
    local function_dir=$2
    
    echo "📦 Packaging $function_name..."
    
    # Create a temporary directory for packaging
    local temp_dir=$(mktemp -d)
    
    # Copy function files
    cp "$function_dir/index.js" "$temp_dir/"
    
    # Install dependencies if package.json exists
    if [ -f "$function_dir/package.json" ]; then
        echo "📥 Installing dependencies for $function_name..."
        cd "$function_dir"
        npm install --production
        if [ -d "node_modules" ]; then
            cp -r node_modules "$temp_dir/"
        fi
        cd - > /dev/null
    fi
    
    # Create zip file
    cd "$temp_dir"
    zip -r "$function_name.zip" .
    cd - > /dev/null
    
    # Move zip to lambda directory
    mv "$temp_dir/$function_name.zip" "lambda/"
    
    # Clean up
    rm -rf "$temp_dir"
    
    echo "✅ $function_name packaged successfully"
}

# Package each Lambda function
package_lambda "getMenuItems" "lambda/getMenuItems"
package_lambda "getCategories" "lambda/getCategories"
package_lambda "updateCategory" "lambda/updateCategory"
package_lambda "searchMenuItems" "lambda/searchMenuItems"
package_lambda "getMenuItemsByCategory" "lambda/getMenuItemsByCategory"
package_lambda "updateMenuItem" "lambda/updateMenuItem"
package_lambda "deleteMenuItem" "lambda/deleteMenuItem"
package_lambda "admin-login" "lambda/auth/login"
package_lambda "admin-verify" "lambda/auth/verify"

echo "🎉 All Lambda functions packaged successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Run 'terraform plan' to review changes"
echo "2. Run 'terraform apply' to deploy infrastructure"
echo "3. Update React app to use real API endpoints"
echo ""
echo "🗂️ Lambda packages created in 'lambda/' directory:"
ls -la lambda/*.zip
