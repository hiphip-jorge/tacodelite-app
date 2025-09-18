# Scripts Directory

This directory contains deployment and utility scripts for the Taco Delite application.

## Files

- `load-env.sh` - Environment variable loader for builds
- `upload-static.sh` - Static file upload script for S3
- `deploy.sh` - Main deployment script
- `deploy-lambda.sh` - Lambda function deployment script
- `build-auth-lambda.sh` - Authentication lambda build script
- `cloudflare-worker-staging.js` - Cloudflare worker for staging
- `cloudflare-worker-production.js` - Cloudflare worker for production

## Usage

These scripts are typically called by npm scripts in package.json, but can also be run directly:

```bash
# Load environment variables and run a command
./scripts/load-env.sh staging "vite build"

# Upload static files
./scripts/upload-static.sh --environment staging
```
