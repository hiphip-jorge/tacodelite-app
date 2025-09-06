# DynamoDB Tables

# Menu Items Table (with composite key)
resource "aws_dynamodb_table" "menu_items" {
  name           = "${var.app_name}-menu-items-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "pk"
  range_key      = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  tags = {
    Name        = "${var.app_name}-menu-items-${var.environment}"
    Environment = var.environment
    Purpose     = "Menu items storage"
  }
}

# Menu Categories Table (single partition key)
resource "aws_dynamodb_table" "menu_categories" {
  name           = "${var.app_name}-categories-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "pk"

  attribute {
    name = "pk"
    type = "S"
  }

  tags = {
    Name        = "${var.app_name}-categories-${var.environment}"
    Environment = var.environment
    Purpose     = "Menu categories storage"
  }
}

# Admin Users Table for authentication
resource "aws_dynamodb_table" "admin_users" {
  name           = "${var.app_name}-admin-users-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "pk"

  attribute {
    name = "pk"
    type = "S"
  }

  # Global Secondary Index for email lookups
  global_secondary_index {
    name     = "email-index"
    hash_key = "email"
    projection_type = "ALL"
  }

  attribute {
    name = "email"
    type = "S"
  }

  tags = {
    Name        = "${var.app_name}-admin-users-${var.environment}"
    Environment = var.environment
    Purpose     = "Admin user authentication"
  }
}

# Users Table
resource "aws_dynamodb_table" "users" {
  name           = "${var.app_name}-users-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "pk"

  attribute {
    name = "pk"
    type = "S"
  }

  tags = {
    Name        = "${var.app_name}-users-${var.environment}"
    Environment = var.environment
    Purpose     = "User management"
  }
}
