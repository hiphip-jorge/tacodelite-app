terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  # Use local backend with state file in terraform directory
  backend "local" {
    path = "terraform.tfstate"
  }
  
  # Comment out backend until bucket exists
  # backend "s3" {
  #   bucket = "your-terraform-state-bucket"
  #   key    = "infrastructure/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "tacodelite-app"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}