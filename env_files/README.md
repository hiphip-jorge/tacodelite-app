# Environment Files Directory

This directory contains environment-specific configuration files for Terraform deployments.

## Files

- `staging.tfvars` - Staging environment variables
- `production.tfvars` - Production environment variables
- `terraform.tfvars` - Default terraform variables (if exists)

## Usage

These files are referenced by terraform commands in package.json scripts:

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production

# Manual terraform commands
terraform plan -var-file=env_files/staging.tfvars
terraform apply -var-file=env_files/production.tfvars
```

## Security Note

These files may contain sensitive information. Ensure they are properly secured and not committed to version control if they contain secrets.
