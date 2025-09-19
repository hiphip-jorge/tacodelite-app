# Terraform backend configuration for remote state storage
# This backend will store state files for both staging and production workspaces
terraform {
  backend "s3" {
    bucket = "tacodelite-terraform-state"
    key    = "terraform.tfstate"
    region = "us-east-1"
    
    # Enable state locking with DynamoDB
    dynamodb_table = "tacodelite-terraform-locks"
    encrypt        = true
    
    # Workspaces will be automatically separated:
    # - staging workspace: terraform.tfstate/env:/staging/
    # - production workspace: terraform.tfstate/env:/production/
  }
}
