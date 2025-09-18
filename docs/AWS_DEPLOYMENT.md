# AWS Deployment Guide for Taco Delite App

This guide explains how to deploy the Taco Delite App to AWS using Terraform.

## Prerequisites

1. **Terraform installed** (version >= 1.0)
   - Download from: https://www.terraform.io/downloads.html
   - Or use Homebrew: `brew install terraform`

2. **AWS CLI installed and configured** with appropriate credentials
   - Download from: https://aws.amazon.com/cli/
   - Configure with: `aws configure`

3. **Node.js 18+** installed

## Quick Deploy

```bash
# Install dependencies
npm install

# Deploy to AWS (staging)
npm run deploy

# Or use the deploy script
./deploy.sh
```

## Available Scripts

- `npm run dev` - Start local development server
- `npm run build` - Build the app for production
- `npm run deploy` - Deploy to AWS (staging)
- `npm run deploy:staging` - Deploy to staging environment
- `npm run deploy:production` - Deploy to production environment
- `npm run terraform:init` - Initialize Terraform
- `npm run terraform:plan` - Plan Terraform deployment
- `npm run terraform:apply` - Apply Terraform changes
- `npm run terraform:destroy` - Destroy AWS resources
- `npm run terraform:output` - Show Terraform outputs
- `npm run upload:static` - Upload static assets to S3
- `./deploy-lambda.sh` - Package and deploy Lambda functions

## Deployment Process

1. **Build**: The app is built using Vite and output to the `dist/` directory
2. **Lambda**: Package and deploy Lambda functions using `./deploy-lambda.sh`
3. **Infrastructure**: Terraform creates AWS resources (S3, Lambda, API Gateway, DynamoDB, etc.)
4. **Upload**: Static assets are uploaded to S3
5. **Deploy**: CloudFlare serves the app globally with real-time API integration

## AWS Resources Created

- **S3 Bucket**: Static website hosting with public read access
- **S3 Website Configuration**: Index and error document handling
- **IAM Policies**: Public read access for web hosting
- **CORS Configuration**: Cross-origin resource sharing support
- **Lambda Functions**: Backend API for menu operations
- **API Gateway**: REST API endpoints for frontend integration
- **DynamoDB Tables**: Data storage for menu items and categories

## Environment Configuration

### Staging Environment
```bash
# Deploy to staging
npm run deploy:staging

# Or manually
terraform init
terraform plan -var-file=staging.tfvars
terraform apply -var-file=staging.tfvars
```

### Production Environment
```bash
# Deploy to production
npm run deploy:production

# Or manually
terraform plan -var-file=production.tfvars
terraform apply -var-file=production.tfvars
```

## Custom Domain Setup

To use a custom domain:

1. **Create ACM Certificate** in the same region as your CloudFront distribution
2. **Update variables.tf**:
   ```hcl
   domain_name = "yourdomain.com"
   certificate_arn = "arn:aws:acm:us-east-1:..."
   ```
3. **Deploy**: `terraform apply -var-file=staging.tfvars`

## Local Development

```bash
# Start local dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Terraform Commands

```bash
# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var-file=staging.tfvars

# Apply changes
terraform apply -var-file=staging.tfvars

# Show outputs
terraform output

# Destroy resources
terraform destroy -var-file=staging.tfvars
```

## Troubleshooting

### Build Issues
- Ensure all dependencies are installed: `npm install`
- Check that Vite build completes successfully: `npm run build`

### Terraform Issues
- Verify AWS credentials are properly configured
- Check that you have the necessary AWS permissions
- Ensure Terraform version is >= 1.0

### Deployment Issues
- Check CloudWatch logs for any errors
- Verify S3 bucket permissions
- Check CloudFront distribution status

## Architecture

The app uses:
- **Frontend**: Vite + React
- **Static Hosting**: S3 with website hosting enabled
- **CDN**: CloudFlare (free tier) for global distribution
- **Backend**: AWS Lambda functions for API operations
- **API**: API Gateway for REST endpoints
- **Database**: DynamoDB for menu data storage
- **Infrastructure**: Terraform for IaC
- **Routing**: S3 + CloudFlare handle SPA routing

## Lambda Functions

The backend includes these Lambda functions:

- **getMenuItems**: Fetches all menu items from DynamoDB
- **getCategories**: Fetches all menu categories
- **searchMenuItems**: Searches menu items by query string
- **getMenuItemsByCategory**: Filters items by category ID

### API Endpoints

After deployment, your API will be available at:
- **GET** `/menu-items` - Fetch all menu items
- **GET** `/categories` - Fetch all categories  
- **GET** `/search?query={searchTerm}` - Search menu items
- **GET** `/menu-items?categoryId={id}` - Filter by category

### Lambda Deployment

To deploy Lambda functions:
```bash
# Package and prepare Lambda functions
./deploy-lambda.sh

# Deploy infrastructure (includes Lambda)
terraform apply
```

## CloudFlare Setup

After deploying to AWS S3:

1. **Add your domain to CloudFlare**
2. **Set S3 website endpoint as origin** (from Terraform output)
3. **Configure DNS** to point to CloudFlare
4. **Enable CloudFlare proxy** (orange cloud icon)

**Benefits of CloudFlare Free Tier:**
- 🌍 Global CDN (200+ locations)
- 🔒 Free SSL/HTTPS certificates
- 🛡️ DDoS protection
- ⚡ Performance optimization
- 📱 Mobile optimization
- 💰 **$0/month** (vs $5-20+ for CloudFront)

## Cost Optimization

- S3 storage is very cost-effective (~$0.023/GB/month)
- CloudFront provides global CDN at low cost
- Lambda functions are pay-per-use (disabled by default)
- Consider setting up CloudWatch alarms for monitoring

## Security

- S3 bucket is private with CloudFront OAI access only
- HTTPS enforced via CloudFront
- IAM roles follow least privilege principle
- CORS configured for web app access

## Monitoring

- CloudWatch logs for Lambda functions (if enabled)
- CloudFront access logs
- S3 access logs
- Set up CloudWatch alarms for costs and errors
