# GitHub Actions CI/CD Setup

This repository uses GitHub Actions for automated deployment to AWS. The CI/CD pipeline automatically builds, tests, and deploys the application based on the branch.

[![Test and Lint](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/test.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/test.yml)
[![Deploy to Staging](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/staging.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/staging.yml)
[![Deploy to Production](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/production.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/production.yml)

## Workflows

### Test and Lint (`test.yml`)
- **Trigger**: Pull requests to `staging` or `main` branches
- **Actions**:
  1. Run ESLint to check code quality
  2. Test build both staging and production configurations
  3. Ensure builds complete successfully

### Staging Deployment (`staging.yml`)
- **Trigger**: Push to `staging` branch
- **Environment**: Staging
- **Actions**:
  1. Build staging app with staging environment variables
  2. Deploy infrastructure using Terraform staging workspace
  3. Upload static assets to staging S3 bucket

### Production Deployment (`production.yml`)
- **Trigger**: Push to `main` branch
- **Environment**: Production
- **Actions**:
  1. Build production app with production environment variables
  2. Deploy infrastructure using Terraform production workspace
  3. Upload static assets to production S3 bucket

## Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

### AWS Credentials
- `AWS_ACCESS_KEY_ID` - Your AWS access key ID
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret access key

### How to Set Up Secrets
1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the exact names above

## AWS IAM Permissions

Your AWS user/role needs the following permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:*",
                "dynamodb:*",
                "lambda:*",
                "apigateway:*",
                "iam:*",
                "cloudformation:*",
                "logs:*"
            ],
            "Resource": "*"
        }
    ]
}
```

## Deployment Process

### Staging
1. Push changes to `staging` branch
2. GitHub Actions automatically:
   - Builds the app with staging configuration
   - Deploys to staging AWS resources
   - Uploads static assets to staging S3 bucket

### Production
1. Push changes to `production` or `main` branch
2. GitHub Actions automatically:
   - Builds the app with production configuration
   - Deploys to production AWS resources
   - Uploads static assets to production S3 bucket

## Environment Variables

The workflows automatically set the correct environment variables:

### Staging
- `VITE_API_URL`: `https://staging.tacodelitewestplano.com/prod`
- `VITE_ENVIRONMENT`: `staging`
- `VITE_USE_MOCK`: `false`

### Production
- `VITE_API_URL`: `https://tacodelitewestplano.com/prod`
- `VITE_ENVIRONMENT`: `production`
- `VITE_USE_MOCK`: `false`

## Terraform Workspaces

The workflows use Terraform workspaces to maintain separate state for each environment:
- **Staging**: Uses `staging` workspace
- **Production**: Uses `production` workspace

This ensures that staging and production deployments don't interfere with each other.

## Monitoring Deployments

1. Go to your GitHub repository
2. Click **Actions** tab
3. View the workflow runs and their status
4. Click on a specific run to see detailed logs

## Troubleshooting

### Common Issues

1. **AWS Credentials Error**
   - Verify that `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` secrets are set correctly
   - Check that the AWS user has sufficient permissions

2. **Terraform Workspace Error**
   - The workflow will automatically create workspaces if they don't exist
   - If issues persist, check the Terraform state files

3. **Build Failures**
   - Check the build logs in the Actions tab
   - Ensure all dependencies are properly installed

4. **Deployment Failures**
   - Check the Terraform plan output in the logs
   - Verify that AWS resources don't have naming conflicts

### Manual Deployment

If you need to deploy manually (not recommended for production):

```bash
# Staging
git checkout staging
npm run deploy:staging

# Production
git checkout production
npm run deploy:production
```

## Security Notes

- Never commit AWS credentials to the repository
- Use GitHub Secrets for all sensitive information
- Regularly rotate AWS access keys
- Monitor AWS CloudTrail for deployment activities
