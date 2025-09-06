# Taco Delite Infrastructure

This directory contains the Terraform configuration for the Taco Delite application infrastructure.

## Structure

- `main.tf` - Terraform configuration, providers, and core settings
- `variables.tf` - Input variables and their definitions
- `outputs.tf` - Output values and deployment instructions
- `s3.tf` - S3 bucket configuration for static assets
- `dynamodb.tf` - DynamoDB tables for data storage
- `lambda.tf` - Lambda functions and IAM roles/policies
- `apigw.tf` - API Gateway configuration and endpoints

## Resources

### S3 (`s3.tf`)
- Static assets bucket with public read access
- Website hosting configuration
- CORS configuration for web access

### DynamoDB (`dynamodb.tf`)
- `menu_items` - Menu items with composite key (pk, sk)
- `menu_categories` - Categories with single partition key (pk)
- `admin_users` - Admin authentication with email index
- `users` - General user management

### Lambda (`lambda.tf`)
- IAM role and policy for Lambda execution
- Menu item functions: get, search, update, delete, get-by-category
- Category functions: get, update
- Authentication functions: login, verify

### API Gateway (`apigw.tf`)
- REST API with CORS support
- Endpoints for all Lambda functions
- Lambda permissions and integrations
- Usage plan and API key (optional)

## Usage

```bash
# Initialize Terraform
terraform init

# Plan changes
terraform plan

# Apply changes
terraform apply

# Destroy infrastructure
terraform destroy
```

## Environment Variables

Required variables (set in `terraform.tfvars` or environment):
- `jwt_secret` - Secret key for JWT token generation

## Outputs

After deployment, Terraform outputs:
- API Gateway URL
- S3 bucket information
- DynamoDB table names
- Deployment instructions for CloudFlare
