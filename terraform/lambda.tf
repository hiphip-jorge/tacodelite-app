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

# Local variables for dynamic Lambda zip file detection
locals {
  # Functions with checksums (caching functions)
  get_menu_items_zip     = length(tolist(fileset("../lambda", "getMenuItems.*.zip"))) > 0 ? tolist(fileset("../lambda", "getMenuItems.*.zip"))[0] : "getMenuItems.zip"
  get_categories_zip     = length(tolist(fileset("../lambda", "getCategories.*.zip"))) > 0 ? tolist(fileset("../lambda", "getCategories.*.zip"))[0] : "getCategories.zip"
  create_category_zip    = length(tolist(fileset("../lambda", "createCategory.*.zip"))) > 0 ? tolist(fileset("../lambda", "createCategory.*.zip"))[0] : "createCategory.zip"
  update_category_zip    = length(tolist(fileset("../lambda", "updateCategory.*.zip"))) > 0 ? tolist(fileset("../lambda", "updateCategory.*.zip"))[0] : "updateCategory.zip"
  delete_category_zip    = length(tolist(fileset("../lambda", "deleteCategory.*.zip"))) > 0 ? tolist(fileset("../lambda", "deleteCategory.*.zip"))[0] : "deleteCategory.zip"
  create_menu_item_zip   = length(tolist(fileset("../lambda", "createMenuItem.*.zip"))) > 0 ? tolist(fileset("../lambda", "createMenuItem.*.zip"))[0] : "createMenuItem.zip"
  update_menu_item_zip   = length(tolist(fileset("../lambda", "updateMenuItem.*.zip"))) > 0 ? tolist(fileset("../lambda", "updateMenuItem.*.zip"))[0] : "updateMenuItem.zip"
  delete_menu_item_zip   = length(tolist(fileset("../lambda", "deleteMenuItem.*.zip"))) > 0 ? tolist(fileset("../lambda", "deleteMenuItem.*.zip"))[0] : "deleteMenuItem.zip"
  search_menu_items_zip  = length(tolist(fileset("../lambda", "searchMenuItems.*.zip"))) > 0 ? tolist(fileset("../lambda", "searchMenuItems.*.zip"))[0] : "searchMenuItems.zip"
  get_menu_items_by_category_zip = length(tolist(fileset("../lambda", "getMenuItemsByCategory.*.zip"))) > 0 ? tolist(fileset("../lambda", "getMenuItemsByCategory.*.zip"))[0] : "getMenuItemsByCategory.zip"
  get_menu_version_zip   = length(tolist(fileset("../lambda", "getMenuVersion.*.zip"))) > 0 ? tolist(fileset("../lambda", "getMenuVersion.*.zip"))[0] : "getMenuVersion.zip"
  increment_menu_version_zip = length(tolist(fileset("../lambda", "incrementMenuVersion.*.zip"))) > 0 ? tolist(fileset("../lambda", "incrementMenuVersion.*.zip"))[0] : "incrementMenuVersion.zip"
  get_admin_users_zip    = length(tolist(fileset("../lambda", "getAdminUsers.*.zip"))) > 0 ? tolist(fileset("../lambda", "getAdminUsers.*.zip"))[0] : "getAdminUsers.zip"
  create_admin_user_zip  = length(tolist(fileset("../lambda", "createAdminUser.*.zip"))) > 0 ? tolist(fileset("../lambda", "createAdminUser.*.zip"))[0] : "createAdminUser.zip"
  update_admin_user_zip  = length(tolist(fileset("../lambda", "updateAdminUser.*.zip"))) > 0 ? tolist(fileset("../lambda", "updateAdminUser.*.zip"))[0] : "updateAdminUser.zip"
  delete_admin_user_zip  = length(tolist(fileset("../lambda", "deleteAdminUser.*.zip"))) > 0 ? tolist(fileset("../lambda", "deleteAdminUser.*.zip"))[0] : "deleteAdminUser.zip"
  get_users_zip          = length(tolist(fileset("../lambda", "getUsers.*.zip"))) > 0 ? tolist(fileset("../lambda", "getUsers.*.zip"))[0] : "getUsers.zip"
  get_user_by_id_zip     = length(tolist(fileset("../lambda", "getUserById.*.zip"))) > 0 ? tolist(fileset("../lambda", "getUserById.*.zip"))[0] : "getUserById.zip"
  update_user_zip        = length(tolist(fileset("../lambda", "updateUser.*.zip"))) > 0 ? tolist(fileset("../lambda", "updateUser.*.zip"))[0] : "updateUser.zip"
  delete_user_zip        = length(tolist(fileset("../lambda", "deleteUser.*.zip"))) > 0 ? tolist(fileset("../lambda", "deleteUser.*.zip"))[0] : "deleteUser.zip"
  get_announcements_zip  = length(tolist(fileset("../lambda", "getAnnouncements.*.zip"))) > 0 ? tolist(fileset("../lambda", "getAnnouncements.*.zip"))[0] : "getAnnouncements.zip"
  create_announcement_zip = length(tolist(fileset("../lambda", "createAnnouncement.*.zip"))) > 0 ? tolist(fileset("../lambda", "createAnnouncement.*.zip"))[0] : "createAnnouncement.zip"
  update_announcement_zip = length(tolist(fileset("../lambda", "updateAnnouncement.*.zip"))) > 0 ? tolist(fileset("../lambda", "updateAnnouncement.*.zip"))[0] : "updateAnnouncement.zip"
  delete_announcement_zip = length(tolist(fileset("../lambda", "deleteAnnouncement.*.zip"))) > 0 ? tolist(fileset("../lambda", "deleteAnnouncement.*.zip"))[0] : "deleteAnnouncement.zip"
  # Modifier Groups functions
  get_modifier_groups_zip = length(tolist(fileset("../lambda", "getModifierGroups.*.zip"))) > 0 ? tolist(fileset("../lambda", "getModifierGroups.*.zip"))[0] : "getModifierGroups.zip"
  create_modifier_group_zip = length(tolist(fileset("../lambda", "createModifierGroup.*.zip"))) > 0 ? tolist(fileset("../lambda", "createModifierGroup.*.zip"))[0] : "createModifierGroup.zip"
  update_modifier_group_zip = length(tolist(fileset("../lambda", "updateModifierGroup.*.zip"))) > 0 ? tolist(fileset("../lambda", "updateModifierGroup.*.zip"))[0] : "updateModifierGroup.zip"
  delete_modifier_group_zip = length(tolist(fileset("../lambda", "deleteModifierGroup.*.zip"))) > 0 ? tolist(fileset("../lambda", "deleteModifierGroup.*.zip"))[0] : "deleteModifierGroup.zip"
  # Modifiers functions
  get_modifiers_zip = length(tolist(fileset("../lambda", "getModifiers.*.zip"))) > 0 ? tolist(fileset("../lambda", "getModifiers.*.zip"))[0] : "getModifiers.zip"
  create_modifier_zip = length(tolist(fileset("../lambda", "createModifier.*.zip"))) > 0 ? tolist(fileset("../lambda", "createModifier.*.zip"))[0] : "createModifier.zip"
  update_modifier_zip = length(tolist(fileset("../lambda", "updateModifier.*.zip"))) > 0 ? tolist(fileset("../lambda", "updateModifier.*.zip"))[0] : "updateModifier.zip"
  delete_modifier_zip = length(tolist(fileset("../lambda", "deleteModifier.*.zip"))) > 0 ? tolist(fileset("../lambda", "deleteModifier.*.zip"))[0] : "deleteModifier.zip"
  # Auth functions are not using checksums, keeping static paths
  auth_login_zip         = "login.zip"
  auth_verify_zip        = "verify.zip"
}

# Lambda Functions

# Menu Items Lambda Functions
resource "aws_lambda_function" "get_menu_items" {
  filename         = "../lambda/${local.get_menu_items_zip}"
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
  filename         = "../lambda/${local.search_menu_items_zip}"
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
  filename         = "../lambda/${local.get_menu_items_by_category_zip}"
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
  filename         = "../lambda/${local.update_menu_item_zip}"
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
  filename         = "../lambda/${local.delete_menu_item_zip}"
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
  filename         = "../lambda/${local.create_menu_item_zip}"
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
  filename         = "../lambda/${local.get_categories_zip}"
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
  filename         = "../lambda/${local.update_category_zip}"
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
  filename         = "../lambda/${local.create_category_zip}"
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
resource "aws_lambda_function" "admin_login" {
  filename         = "../lambda/auth/login.zip"
  function_name    = "${var.app_name}-admin-login-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30
  source_code_hash = filebase64sha256("../lambda/auth/login.zip")

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
  filename         = "../lambda/auth/verify.zip"
  function_name    = "${var.app_name}-admin-verify-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30
  source_code_hash = filebase64sha256("../lambda/auth/verify.zip")

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
  filename         = "../lambda/${local.get_admin_users_zip}"
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
  filename         = "../lambda/${local.get_users_zip}"
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
  filename         = "../lambda/${local.get_user_by_id_zip}"
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
  filename         = "../lambda/${local.update_user_zip}"
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
  filename         = "../lambda/${local.delete_user_zip}"
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
  filename         = "../lambda/${local.delete_category_zip}"
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

  filename         = "../lambda/${local.create_admin_user_zip}"

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

  filename         = "../lambda/${local.update_admin_user_zip}"

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

  filename         = "../lambda/${local.delete_admin_user_zip}"

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
  filename         = "../lambda/${local.get_menu_version_zip}"
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
  filename         = "../lambda/${local.increment_menu_version_zip}"
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

# Announcements Lambda Functions

resource "aws_lambda_function" "get_announcements" {
  filename         = "../lambda/${local.get_announcements_zip}"
  function_name    = "${var.app_name}-${var.environment}-get-announcements"
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

resource "aws_lambda_function" "create_announcement" {
  filename         = "../lambda/${local.create_announcement_zip}"
  function_name    = "${var.app_name}-${var.environment}-create-announcement"
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

resource "aws_lambda_function" "update_announcement" {
  filename         = "../lambda/${local.update_announcement_zip}"
  function_name    = "${var.app_name}-${var.environment}-update-announcement"
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

resource "aws_lambda_function" "delete_announcement" {
  filename         = "../lambda/${local.delete_announcement_zip}"
  function_name    = "${var.app_name}-${var.environment}-delete-announcement"
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

# Modifier Groups Lambda Functions
resource "aws_lambda_function" "get_modifier_groups" {
  filename         = "../lambda/${local.get_modifier_groups_zip}"
  function_name    = "${var.app_name}-${var.environment}-get-modifier-groups"
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

resource "aws_lambda_function" "create_modifier_group" {
  filename         = "../lambda/${local.create_modifier_group_zip}"
  function_name    = "${var.app_name}-${var.environment}-create-modifier-group"
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

resource "aws_lambda_function" "update_modifier_group" {
  filename         = "../lambda/${local.update_modifier_group_zip}"
  function_name    = "${var.app_name}-${var.environment}-update-modifier-group"
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

resource "aws_lambda_function" "delete_modifier_group" {
  filename         = "../lambda/${local.delete_modifier_group_zip}"
  function_name    = "${var.app_name}-${var.environment}-delete-modifier-group"
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

# Modifiers Lambda Functions
resource "aws_lambda_function" "get_modifiers" {
  filename         = "../lambda/${local.get_modifiers_zip}"
  function_name    = "${var.app_name}-${var.environment}-get-modifiers"
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

resource "aws_lambda_function" "create_modifier" {
  filename         = "../lambda/${local.create_modifier_zip}"
  function_name    = "${var.app_name}-${var.environment}-create-modifier"
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

resource "aws_lambda_function" "update_modifier" {
  filename         = "../lambda/${local.update_modifier_zip}"
  function_name    = "${var.app_name}-${var.environment}-update-modifier"
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

resource "aws_lambda_function" "delete_modifier" {
  filename         = "../lambda/${local.delete_modifier_zip}"
  function_name    = "${var.app_name}-${var.environment}-delete-modifier"
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
