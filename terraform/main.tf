terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  # Backend configuration moved to backend.tf
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