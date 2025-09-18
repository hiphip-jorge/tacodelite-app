#!/bin/bash

# Environment loader script for builds
# Usage: ./load-env.sh [environment] [command]
# Example: ./load-env.sh staging "vite build"

ENVIRONMENT=${1:-staging}
COMMAND=${2:-"vite build"}

case $ENVIRONMENT in
  "staging")
    export VITE_API_URL="https://staging.tacodelitewestplano.com/prod"
    export VITE_USE_MOCK="false"
    export VITE_ENVIRONMENT="staging"
    export VITE_APP_NAME="Taco Delite"
    BUILD_DIR="dist/staging"
    echo "🚀 Loading STAGING environment variables..."
    ;;
  "production")
    export VITE_API_URL="https://tacodelitewestplano.com/prod"
    export VITE_USE_MOCK="false"
    export VITE_ENVIRONMENT="production"
    export VITE_APP_NAME="Taco Delite"
    BUILD_DIR="dist/production"
    echo "🏭 Loading PRODUCTION environment variables..."
    ;;
  *)
    echo "❌ Unknown environment: $ENVIRONMENT. Use 'staging' or 'production'."
    exit 1
    ;;
esac

# Clean the build directory before building
if [ -n "$BUILD_DIR" ]; then
    echo "🧹 Cleaning $BUILD_DIR directory..."
    rm -rf "$BUILD_DIR"
fi

# Execute the command with the loaded environment
eval $COMMAND
