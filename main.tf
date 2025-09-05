terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
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

# S3 bucket for static assets
resource "aws_s3_bucket" "static_assets" {
  bucket = "${var.app_name}-${var.environment}"
}

resource "aws_s3_bucket_public_access_block" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false

  # Force these settings to be applied
  depends_on = [aws_s3_bucket.static_assets]
}

resource "aws_s3_bucket_cors_configuration" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = split(",", var.allowed_origins)
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Enable S3 static website hosting
resource "aws_s3_bucket_website_configuration" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# S3 bucket policy for public web hosting
resource "aws_s3_bucket_policy" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.static_assets.arn}/*"
      }
    ]
  })

  # Ensure public access block is applied before policy
  depends_on = [aws_s3_bucket_public_access_block.static_assets]
}

# DynamoDB Tables
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

# Lambda Functions
resource "aws_lambda_function" "get_menu_items" {
  filename         = "lambda/getMenuItems.zip"
  function_name    = "${var.app_name}-get-menu-items-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  source_code_hash = filebase64sha256("lambda/getMenuItems.zip")

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.menu_items.name
      ALLOWED_ORIGINS = var.allowed_origins
    }
  }

  tags = {
    Name        = "${var.app_name}-get-menu-items-${var.environment}"
    Environment = var.environment
    Purpose     = "Get menu items"
  }
}

resource "aws_lambda_function" "get_categories" {
  filename         = "lambda/getCategories.zip"
  function_name    = "${var.app_name}-get-categories-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  source_code_hash = filebase64sha256("lambda/getCategories.zip")

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.menu_categories.name
      ALLOWED_ORIGINS = var.allowed_origins
    }
  }

  tags = {
    Name        = "${var.app_name}-get-categories-${var.environment}"
    Environment = var.environment
    Purpose     = "Get categories"
  }
}

resource "aws_lambda_function" "update_category" {
  filename         = "lambda/updateCategory.zip"
  function_name    = "${var.app_name}-update-category-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  source_code_hash = filebase64sha256("lambda/updateCategory.zip")

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.menu_categories.name
      ALLOWED_ORIGINS = var.allowed_origins
    }
  }

  tags = {
    Name        = "${var.app_name}-update-category-${var.environment}"
    Environment = var.environment
    Purpose     = "Update categories"
  }
}

resource "aws_lambda_function" "search_menu_items" {
  filename         = "lambda/searchMenuItems.zip"
  function_name    = "${var.app_name}-search-menu-items-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  source_code_hash = filebase64sha256("lambda/searchMenuItems.zip")

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.menu_items.name
      ALLOWED_ORIGINS = var.allowed_origins
    }
  }

  tags = {
    Name        = "${var.app_name}-search-menu-items-${var.environment}"
    Environment = var.environment
    Purpose     = "Search menu items"
  }
}

resource "aws_lambda_function" "get_menu_items_by_category" {
  filename         = "lambda/getMenuItemsByCategory.zip"
  function_name    = "${var.app_name}-get-menu-items-by-category-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  source_code_hash = filebase64sha256("lambda/getMenuItemsByCategory.zip")

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.menu_items.name
      ALLOWED_ORIGINS = var.allowed_origins
    }
  }

  tags = {
    Name        = "${var.app_name}-get-menu-items-by-category-${var.environment}"
    Environment = var.environment
    Purpose     = "Get menu items by category"
  }
}

resource "aws_lambda_function" "update_menu_item" {
  filename         = "lambda/updateMenuItem.zip"
  function_name    = "${var.app_name}-update-menu-item-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  source_code_hash = filebase64sha256("lambda/updateMenuItem.zip")

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.menu_items.name
      ALLOWED_ORIGINS = var.allowed_origins
    }
  }

  tags = {
    Name        = "${var.app_name}-update-menu-item-${var.environment}"
    Environment = var.environment
    Purpose     = "Update menu items"
  }
}

resource "aws_lambda_function" "delete_menu_item" {
  filename         = "lambda/deleteMenuItem.zip"
  function_name    = "${var.app_name}-delete-menu-item-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  source_code_hash = filebase64sha256("lambda/deleteMenuItem.zip")

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.menu_items.name
      ALLOWED_ORIGINS = var.allowed_origins
    }
  }

  tags = {
    Name        = "${var.app_name}-delete-menu-item-${var.environment}"
    Environment = var.environment
    Purpose     = "Delete menu item"
  }
}

# Authentication Lambda Functions
resource "aws_lambda_function" "admin_login" {
  filename         = "lambda/auth/login.zip"
  function_name    = "${var.app_name}-admin-login-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  source_code_hash = filebase64sha256("lambda/auth/login.zip")

  environment {
    variables = {
      ADMIN_USERS_TABLE = aws_dynamodb_table.admin_users.name
      ALLOWED_ORIGINS = var.allowed_origins
      JWT_SECRET = var.jwt_secret
    }
  }

  tags = {
    Name        = "${var.app_name}-admin-login-${var.environment}"
    Environment = var.environment
    Purpose     = "Admin authentication"
  }
}

resource "aws_lambda_function" "admin_verify" {
  filename         = "lambda/auth/verify.zip"
  function_name    = "${var.app_name}-admin-verify-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  source_code_hash = filebase64sha256("lambda/auth/verify.zip")

  environment {
    variables = {
      ADMIN_USERS_TABLE = aws_dynamodb_table.admin_users.name
      ALLOWED_ORIGINS = var.allowed_origins
      JWT_SECRET = var.jwt_secret
    }
  }

  tags = {
    Name        = "${var.app_name}-admin-verify-${var.environment}"
    Environment = var.environment
    Purpose     = "Admin token verification"
  }
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "${var.app_name}-lambda-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.app_name}-lambda-role-${var.environment}"
    Environment = var.environment
    Purpose     = "Lambda execution role"
  }
}

# IAM Policy for Lambda
resource "aws_iam_role_policy" "lambda_policy" {
  name = "${var.app_name}-lambda-policy-${var.environment}"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:Scan",
          "dynamodb:Query",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:PutItem"
        ]
        Resource = [
          aws_dynamodb_table.menu_items.arn,
          aws_dynamodb_table.menu_categories.arn,
          aws_dynamodb_table.admin_users.arn,
          "${aws_dynamodb_table.admin_users.arn}/index/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# API Gateway
resource "aws_api_gateway_rest_api" "tacodelite_api" {
  name        = "${var.app_name}-api-${var.environment}"
  description = "Taco Delite Menu API"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Name        = "${var.app_name}-api-${var.environment}"
    Environment = var.environment
    Purpose     = "Menu API"
  }
}

# API Gateway CORS configuration
resource "aws_api_gateway_method" "options" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_rest_api.tacodelite_api.root_resource_id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "options" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_rest_api.tacodelite_api.root_resource_id
  http_method = aws_api_gateway_method.options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration" "options" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_rest_api.tacodelite_api.root_resource_id
  http_method = aws_api_gateway_method.options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "options" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_rest_api.tacodelite_api.root_resource_id
  http_method = aws_api_gateway_method.options.http_method
  status_code = aws_api_gateway_method_response.options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${var.allowed_origins}'"
  }
}

# CORS Support - OPTIONS method for categories
resource "aws_api_gateway_method" "options_categories" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.categories.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "options_categories" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.categories.id
  http_method = aws_api_gateway_method.options_categories.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration" "options_categories" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.categories.id
  http_method = aws_api_gateway_method.options_categories.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "options_categories" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.categories.id
  http_method = aws_api_gateway_method.options_categories.http_method
  status_code = aws_api_gateway_method_response.options_categories.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${var.allowed_origins}'"
  }
}

# API Gateway Resources
resource "aws_api_gateway_resource" "menu_items" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_rest_api.tacodelite_api.root_resource_id
  path_part   = "menu-items"
}

# Individual menu item resource for updates
resource "aws_api_gateway_resource" "menu_item" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_resource.menu_items.id
  path_part   = "{id}"
}

# Admin Authentication API Resources
resource "aws_api_gateway_resource" "admin" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_rest_api.tacodelite_api.root_resource_id
  path_part   = "admin"
}

resource "aws_api_gateway_resource" "admin_login" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_resource.admin.id
  path_part   = "login"
}

resource "aws_api_gateway_resource" "admin_verify" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_resource.admin.id
  path_part   = "verify"
}

# CORS Support - OPTIONS method for menu_items
resource "aws_api_gateway_method" "options_menu_items" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.menu_items.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "options_menu_items" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_items.id
  http_method = aws_api_gateway_method.options_menu_items.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration" "options_menu_items" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_items.id
  http_method = aws_api_gateway_method.options_menu_items.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "options_menu_items" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_items.id
  http_method = aws_api_gateway_method.options_menu_items.http_method
  status_code = aws_api_gateway_method_response.options_menu_items.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,PUT,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${var.allowed_origins}'"
  }
}

# PUT method for updating menu items
resource "aws_api_gateway_method" "put_menu_item" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.menu_item.id
  http_method   = "PUT"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "put_menu_item" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_item.id
  http_method = aws_api_gateway_method.put_menu_item.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration" "put_menu_item" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_item.id
  http_method = aws_api_gateway_method.put_menu_item.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.update_menu_item.invoke_arn
}

# DELETE method for menu items
resource "aws_api_gateway_method" "delete_menu_item" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.menu_item.id
  http_method   = "DELETE"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "delete_menu_item" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_item.id
  http_method = aws_api_gateway_method.delete_menu_item.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration" "delete_menu_item" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_item.id
  http_method = aws_api_gateway_method.delete_menu_item.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.delete_menu_item.invoke_arn
}

resource "aws_api_gateway_resource" "categories" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_rest_api.tacodelite_api.root_resource_id
  path_part   = "categories"
}

resource "aws_api_gateway_resource" "category" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_resource.categories.id
  path_part   = "{id}"
}

resource "aws_api_gateway_resource" "search" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_rest_api.tacodelite_api.root_resource_id
  path_part   = "search"
}

# CORS Support - OPTIONS method for search
resource "aws_api_gateway_method" "options_search" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.search.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "options_search" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.search.id
  http_method = aws_api_gateway_method.options_search.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration" "options_search" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.search.id
  http_method = aws_api_gateway_method.options_search.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "options_search" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.search.id
  http_method = aws_api_gateway_method.options_search.http_method
  status_code = aws_api_gateway_method_response.options_search.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${var.allowed_origins}'"
  }
}

resource "aws_api_gateway_resource" "menu_items_by_category" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_rest_api.tacodelite_api.root_resource_id
  path_part   = "menu-items-by-category"
}

# CORS Support - OPTIONS method for menu_items_by_category
resource "aws_api_gateway_method" "options_menu_items_by_category" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.menu_items_by_category.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "options_menu_items_by_category" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_items_by_category.id
  http_method = aws_api_gateway_method.options_menu_items_by_category.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration" "options_menu_items_by_category" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_items_by_category.id
  http_method = aws_api_gateway_method.options_menu_items_by_category.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "options_menu_items_by_category" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_items_by_category.id
  http_method = aws_api_gateway_method.options_menu_items_by_category.http_method
  status_code = aws_api_gateway_method_response.options_menu_items_by_category.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${var.allowed_origins}'"
  }
}

# API Gateway Methods
resource "aws_api_gateway_method" "get_menu_items" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.menu_items.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "get_menu_items" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_items.id
  http_method = aws_api_gateway_method.get_menu_items.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = false
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
  }
}

resource "aws_api_gateway_method" "get_categories" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.categories.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "get_categories" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.categories.id
  http_method = aws_api_gateway_method.get_categories.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = false
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
  }
}

resource "aws_api_gateway_method" "search_menu_items" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.search.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "search_menu_items" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.search.id
  http_method = aws_api_gateway_method.search_menu_items.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = false
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
  }
}

resource "aws_api_gateway_method" "get_menu_items_by_category" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.menu_items_by_category.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "get_menu_items_by_category" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_items_by_category.id
  http_method = aws_api_gateway_method.get_menu_items_by_category.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = false
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
  }
}

# Lambda Integrations
resource "aws_api_gateway_integration" "get_menu_items" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_items.id
  http_method = aws_api_gateway_method.get_menu_items.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.get_menu_items.invoke_arn
}



resource "aws_api_gateway_integration" "get_categories" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.categories.id
  http_method = aws_api_gateway_method.get_categories.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.get_categories.invoke_arn
}

# PUT method for updating individual categories
resource "aws_api_gateway_method" "put_category" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.category.id
  http_method   = "PUT"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "put_category" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.category.id
  http_method = aws_api_gateway_method.put_category.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration" "put_category" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.category.id
  http_method = aws_api_gateway_method.put_category.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.update_category.invoke_arn
}



resource "aws_api_gateway_integration" "search_menu_items" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.search.id
  http_method = aws_api_gateway_method.search_menu_items.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.search_menu_items.invoke_arn
}



resource "aws_api_gateway_integration" "get_menu_items_by_category" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_items_by_category.id
  http_method = aws_api_gateway_method.get_menu_items_by_category.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.get_menu_items_by_category.invoke_arn
}



# Lambda Permissions
resource "aws_lambda_permission" "get_menu_items" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_menu_items.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_categories" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_categories.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "update_category" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.update_category.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "search_menu_items" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.search_menu_items.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_menu_items_by_category" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_menu_items_by_category.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "update_menu_item" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.update_menu_item.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "delete_menu_item" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_menu_item.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "admin_login" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_login.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "admin_verify" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_verify.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

# Note: Aggressive caching will be handled by CloudFlare + Browser
# Since menu changes only 4 times per year, we can cache very aggressively
# CloudFlare will cache at the edge, browsers will cache locally

# API Gateway Usage Plan (Rate Limiting)
resource "aws_api_gateway_usage_plan" "tacodelite_usage_plan" {
  name        = "${var.app_name}-usage-plan-${var.environment}"
  description = "Usage plan for Taco Delite Menu API"

  api_stages {
    api_id = aws_api_gateway_rest_api.tacodelite_api.id
    stage  = aws_api_gateway_stage.prod.stage_name
  }

  # Rate limiting: 1000 requests per day, 100 per hour
  quota_settings {
    limit  = 1000
    period = "DAY"
  }

  throttle_settings {
    rate_limit  = 100
    burst_limit = 50
  }

  tags = {
    Name        = "${var.app_name}-usage-plan-${var.environment}"
    Environment = var.environment
    Purpose     = "API rate limiting"
  }
}

# Note: Using the default stage created by the deployment

# API Gateway Deployment
resource "aws_api_gateway_deployment" "tacodelite_api" {
  depends_on = [
    aws_api_gateway_integration.get_menu_items,
    aws_api_gateway_integration.get_categories,
    aws_api_gateway_integration.search_menu_items,
    aws_api_gateway_integration.get_menu_items_by_category,
    aws_api_gateway_integration.put_menu_item,
    aws_api_gateway_integration.delete_menu_item,
    aws_api_gateway_integration.admin_login,
    aws_api_gateway_integration.admin_verify,

    aws_api_gateway_method.options_categories,
    aws_api_gateway_method.options_menu_items,
    aws_api_gateway_method.options_search,
    aws_api_gateway_method.options_menu_items_by_category,
    aws_api_gateway_method.admin_login,
    aws_api_gateway_method.admin_verify,
    aws_api_gateway_method_response.options_categories,
    aws_api_gateway_method_response.options_menu_items,
    aws_api_gateway_method_response.options_search,
    aws_api_gateway_method_response.options_menu_items_by_category,
    aws_api_gateway_method_response.admin_login,
    aws_api_gateway_method_response.admin_verify,
    aws_api_gateway_integration.options_categories,
    aws_api_gateway_integration.options_menu_items,
    aws_api_gateway_integration.options_search,
    aws_api_gateway_integration.options_menu_items_by_category,
    aws_api_gateway_integration.options_admin,
    aws_api_gateway_integration_response.options_categories,
    aws_api_gateway_integration_response.options_menu_items,
    aws_api_gateway_integration_response.options_search,
    aws_api_gateway_integration_response.options_menu_items_by_category,
    aws_api_gateway_integration_response.options_admin,
    aws_api_gateway_integration_response.options_admin_login,
    aws_api_gateway_integration_response.options_admin_verify,
    aws_api_gateway_integration_response.admin_login,
    aws_api_gateway_integration_response.admin_verify,
    aws_lambda_permission.get_menu_items,
    aws_lambda_permission.get_categories,
    aws_lambda_permission.update_category,
    aws_lambda_permission.search_menu_items,
    aws_lambda_permission.get_menu_items_by_category,
    aws_lambda_permission.update_menu_item,
    aws_lambda_permission.delete_menu_item,
    aws_lambda_permission.admin_login,
    aws_lambda_permission.admin_verify
  ]

  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id

  # Force new deployment when Lambda functions change
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_method.get_menu_items.id,
      aws_api_gateway_method.get_categories.id,
      aws_api_gateway_method.put_category.id,
      aws_api_gateway_method.search_menu_items.id,
      aws_api_gateway_method.get_menu_items_by_category.id,
      aws_api_gateway_method.put_menu_item.id,
      aws_api_gateway_method.admin_login.id,
      aws_api_gateway_method.admin_verify.id,
      aws_api_gateway_integration.get_menu_items.id,
      aws_api_gateway_integration.get_categories.id,
      aws_api_gateway_integration.put_category.id,
      aws_api_gateway_integration.search_menu_items.id,
      aws_api_gateway_integration.get_menu_items_by_category.id,
      aws_api_gateway_integration.put_menu_item.id,
      aws_api_gateway_integration.admin_login.id,
      aws_api_gateway_integration.admin_verify.id
    ]))
  }
}

# API Gateway Stage
resource "aws_api_gateway_stage" "prod" {
  deployment_id = aws_api_gateway_deployment.tacodelite_api.id
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  stage_name    = "prod"

  depends_on = [
    aws_api_gateway_deployment.tacodelite_api
  ]

  tags = {
    Name        = "${var.app_name}-stage-${var.environment}"
    Environment = var.environment
    Purpose     = "API Stage"
  }
}

# Admin Login Method
resource "aws_api_gateway_method" "admin_login" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.admin_login.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "admin_login" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin_login.id
  http_method = aws_api_gateway_method.admin_login.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration" "admin_login" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin_login.id
  http_method = aws_api_gateway_method.admin_login.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.admin_login.invoke_arn
}

resource "aws_api_gateway_integration_response" "admin_login" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin_login.id
  http_method = aws_api_gateway_method.admin_login.http_method
  status_code = aws_api_gateway_method_response.admin_login.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${var.allowed_origins}'"
  }
}

# Admin Verify Method
resource "aws_api_gateway_method" "admin_verify" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.admin_verify.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "admin_verify" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin_verify.id
  http_method = aws_api_gateway_method.admin_verify.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration" "admin_verify" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin_verify.id
  http_method = aws_api_gateway_method.admin_verify.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.admin_verify.invoke_arn
}

resource "aws_api_gateway_integration_response" "admin_verify" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin_verify.id
  http_method = aws_api_gateway_method.admin_verify.http_method
  status_code = aws_api_gateway_method_response.admin_verify.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${var.allowed_origins}'"
  }
}

# CORS Support for Admin Endpoints
resource "aws_api_gateway_method" "options_admin" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.admin.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "options_admin" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin.id
  http_method = aws_api_gateway_method.options_admin.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration" "options_admin" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin.id
  http_method = aws_api_gateway_method.options_admin.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "options_admin" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin.id
  http_method = aws_api_gateway_method.options_admin.http_method
  status_code = aws_api_gateway_method_response.options_admin.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${var.allowed_origins}'"
  }
}

# CORS Support for Admin Login Endpoint
resource "aws_api_gateway_method" "options_admin_login" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.admin_login.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "options_admin_login" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin_login.id
  http_method = aws_api_gateway_method.options_admin_login.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration" "options_admin_login" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin_login.id
  http_method = aws_api_gateway_method.options_admin_login.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "options_admin_login" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin_login.id
  http_method = aws_api_gateway_method.options_admin_login.http_method
  status_code = aws_api_gateway_method_response.options_admin_login.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${var.allowed_origins}'"
  }
}

# CORS Support for Admin Verify Endpoint
resource "aws_api_gateway_method" "options_admin_verify" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.admin_verify.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "options_admin_verify" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin_verify.id
  http_method = aws_api_gateway_method.options_admin_verify.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration" "options_admin_verify" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin_verify.id
  http_method = aws_api_gateway_method.options_admin_verify.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "options_admin_verify" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin_verify.id
  http_method = aws_api_gateway_method.options_admin_verify.http_method
  status_code = aws_api_gateway_method_response.options_admin_verify.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${var.allowed_origins}'"
  }
}

# API Gateway Methods






