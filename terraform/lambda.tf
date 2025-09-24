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
          aws_dynamodb_table.users.arn,
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

# Lambda Functions

# Menu Items Lambda Functions
resource "aws_lambda_function" "get_menu_items" {
  filename         = "../lambda/getMenuItems.zip"
  function_name    = "${var.app_name}-get-menu-items-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30

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

resource "aws_lambda_function" "search_menu_items" {
  filename         = "../lambda/searchMenuItems.zip"
  function_name    = "${var.app_name}-search-menu-items-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30

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
  filename         = "../lambda/getMenuItemsByCategory.zip"
  function_name    = "${var.app_name}-get-menu-items-by-category-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30

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
  filename         = "../lambda/updateMenuItem.zip"
  function_name    = "${var.app_name}-update-menu-item-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30

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
  filename         = "../lambda/deleteMenuItem.zip"
  function_name    = "${var.app_name}-delete-menu-item-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30

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

resource "aws_lambda_function" "create_menu_item" {
  filename         = "../lambda/createMenuItem.zip"
  function_name    = "${var.app_name}-create-menu-item-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.menu_items.name
      CATEGORIES_TABLE = aws_dynamodb_table.menu_categories.name
      ALLOWED_ORIGINS = var.allowed_origins
    }
  }

  tags = {
    Name        = "${var.app_name}-create-menu-item-${var.environment}"
    Environment = var.environment
    Purpose     = "Create menu items"
  }
}

# Categories Lambda Functions
resource "aws_lambda_function" "get_categories" {
  filename         = "../lambda/getCategories.zip"
  function_name    = "${var.app_name}-get-categories-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30

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
  filename         = "../lambda/updateCategory.zip"
  function_name    = "${var.app_name}-update-category-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30

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

resource "aws_lambda_function" "create_category" {
  filename         = "../lambda/createCategory.zip"
  function_name    = "${var.app_name}-create-category-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.menu_categories.name
      ALLOWED_ORIGINS = var.allowed_origins
    }
  }

  tags = {
    Name        = "${var.app_name}-create-category-${var.environment}"
    Environment = var.environment
    Purpose     = "Create categories"
  }
}

# Authentication Lambda Functions
data "archive_file" "admin_login" {
  type        = "zip"
  source_dir  = "../lambda/auth/login"
  output_path = "../lambda/auth/login.zip"
}

resource "aws_lambda_function" "admin_login" {
  filename         = data.archive_file.admin_login.output_path
  function_name    = "${var.app_name}-admin-login-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30
  source_code_hash = data.archive_file.admin_login.output_base64sha256

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

data "archive_file" "admin_verify" {
  type        = "zip"
  source_dir  = "../lambda/auth/verify"
  output_path = "../lambda/auth/verify.zip"
}

resource "aws_lambda_function" "admin_verify" {
  filename         = data.archive_file.admin_verify.output_path
  function_name    = "${var.app_name}-admin-verify-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30
  source_code_hash = data.archive_file.admin_verify.output_base64sha256

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

# Admin User Management Lambda Functions
resource "aws_lambda_function" "get_admin_users" {
  filename         = "../lambda/getAdminUsers.zip"
  function_name    = "${var.app_name}-get-admin-users-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30

  environment {
    variables = {
      ADMIN_USERS_TABLE = aws_dynamodb_table.admin_users.name
      ALLOWED_ORIGINS = var.allowed_origins
    }
  }

  tags = {
    Name        = "${var.app_name}-get-admin-users-${var.environment}"
    Environment = var.environment
    Purpose     = "Get all admin users"
  }
}

# User Management Lambda Functions
resource "aws_lambda_function" "get_users" {
  filename         = "../lambda/getUsers.zip"
  function_name    = "${var.app_name}-get-users-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30

  environment {
    variables = {
      USERS_TABLE = aws_dynamodb_table.users.name
      ALLOWED_ORIGINS = var.allowed_origins
    }
  }

  tags = {
    Name        = "${var.app_name}-get-users-${var.environment}"
    Environment = var.environment
    Purpose     = "Get all users"
  }
}

resource "aws_lambda_function" "get_user_by_id" {
  filename         = "../lambda/getUserById.zip"
  function_name    = "${var.app_name}-get-user-by-id-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30

  environment {
    variables = {
      USERS_TABLE = aws_dynamodb_table.users.name
      ALLOWED_ORIGINS = var.allowed_origins
    }
  }

  tags = {
    Name        = "${var.app_name}-get-user-by-id-${var.environment}"
    Environment = var.environment
    Purpose     = "Get user by ID"
  }
}

resource "aws_lambda_function" "update_user" {
  filename         = "../lambda/updateUser.zip"
  function_name    = "${var.app_name}-update-user-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30

  environment {
    variables = {
      USERS_TABLE = aws_dynamodb_table.users.name
      ALLOWED_ORIGINS = var.allowed_origins
    }
  }

  tags = {
    Name        = "${var.app_name}-update-user-${var.environment}"
    Environment = var.environment
    Purpose     = "Update user"
  }
}

resource "aws_lambda_function" "delete_user" {
  filename         = "../lambda/deleteUser.zip"
  function_name    = "${var.app_name}-delete-user-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30

  environment {
    variables = {
      USERS_TABLE = aws_dynamodb_table.users.name
      ALLOWED_ORIGINS = var.allowed_origins
    }
  }

  tags = {
    Name        = "${var.app_name}-delete-user-${var.environment}"
    Environment = var.environment
    Purpose     = "Delete user"
  }
}

# Delete Category Lambda Function
resource "aws_lambda_function" "delete_category" {
  filename         = "../lambda/deleteCategory.zip"
  function_name    = "${var.app_name}-delete-category-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.menu_items.name
      CATEGORIES_TABLE = aws_dynamodb_table.menu_categories.name
      ALLOWED_ORIGINS = var.allowed_origins
    }
  }

  tags = {
    Name        = "${var.app_name}-delete-category-${var.environment}"
    Environment = var.environment
    Purpose     = "Delete category"
  }
}

# Create Admin User Lambda
resource "aws_lambda_function" "create_admin_user" {
  function_name = "${var.app_name}-create-admin-user-${var.environment}"
  role         = aws_iam_role.lambda_role.arn
  handler      = "index.handler"
  runtime      = "nodejs20.x"
  timeout      = 30

  filename         = "../lambda/createAdminUser.zip"

  environment {
    variables = {
      ADMIN_USERS_TABLE = aws_dynamodb_table.admin_users.name
      ALLOWED_ORIGINS   = var.allowed_origins
    }
  }

  tags = {
    Name        = "${var.app_name}-create-admin-user-${var.environment}"
    Environment = var.environment
    Purpose     = "Create admin user"
  }
}

# Update Admin User Lambda
resource "aws_lambda_function" "update_admin_user" {
  function_name = "${var.app_name}-update-admin-user-${var.environment}"
  role         = aws_iam_role.lambda_role.arn
  handler      = "index.handler"
  runtime      = "nodejs20.x"
  timeout      = 30

  filename         = "../lambda/updateAdminUser.zip"

  environment {
    variables = {
      ADMIN_USERS_TABLE = aws_dynamodb_table.admin_users.name
      ALLOWED_ORIGINS   = var.allowed_origins
    }
  }

  tags = {
    Name        = "${var.app_name}-update-admin-user-${var.environment}"
    Environment = var.environment
    Purpose     = "Update admin user"
  }
}

# Delete Admin User Lambda
resource "aws_lambda_function" "delete_admin_user" {
  function_name = "${var.app_name}-delete-admin-user-${var.environment}"
  role         = aws_iam_role.lambda_role.arn
  handler      = "index.handler"
  runtime      = "nodejs20.x"
  timeout      = 30

  filename         = "../lambda/deleteAdminUser.zip"

  environment {
    variables = {
      ADMIN_USERS_TABLE = aws_dynamodb_table.admin_users.name
      ALLOWED_ORIGINS   = var.allowed_origins
    }
  }

  tags = {
    Name        = "${var.app_name}-delete-admin-user-${var.environment}"
    Environment = var.environment
    Purpose     = "Delete admin user"
  }
}

# Get Menu Version Lambda Function
resource "aws_lambda_function" "get_menu_version" {
  filename         = "../lambda/getMenuVersion.zip"
  function_name    = "${var.app_name}-${var.environment}-get-menu-version"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.menu_items.name
      ALLOWED_ORIGINS = var.allowed_origins
    }
  }

  depends_on = [
    aws_iam_role_policy.lambda_policy
  ]
}

# Increment Menu Version Lambda Function
resource "aws_lambda_function" "increment_menu_version" {
  filename         = "../lambda/incrementMenuVersion.zip"
  function_name    = "${var.app_name}-${var.environment}-increment-menu-version"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.menu_items.name
      ALLOWED_ORIGINS = var.allowed_origins
    }
  }

  depends_on = [
    aws_iam_role_policy.lambda_policy
  ]
}
