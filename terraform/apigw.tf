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
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
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
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${var.allowed_origins}'"
  }
}

# POST method for creating categories
resource "aws_api_gateway_method" "post_categories" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.categories.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "post_categories" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.categories.id
  http_method = aws_api_gateway_method.post_categories.http_method
  status_code = "201"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration" "post_categories" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.categories.id
  http_method = aws_api_gateway_method.post_categories.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.create_category.invoke_arn
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
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${var.allowed_origins}'"
  }
}

# POST method for creating menu items
resource "aws_api_gateway_method" "post_menu_items" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.menu_items.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "post_menu_items" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_items.id
  http_method = aws_api_gateway_method.post_menu_items.http_method
  status_code = "201"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration" "post_menu_items" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_items.id
  http_method = aws_api_gateway_method.post_menu_items.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.create_menu_item.invoke_arn
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

resource "aws_api_gateway_resource" "menu_version" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_rest_api.tacodelite_api.root_resource_id
  path_part   = "menu-version"
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

# CORS Support - OPTIONS method for menu-version
resource "aws_api_gateway_method" "options_menu_version" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.menu_version.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "options_menu_version" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_version.id
  http_method = aws_api_gateway_method.options_menu_version.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration" "options_menu_version" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_version.id
  http_method = aws_api_gateway_method.options_menu_version.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "options_menu_version" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_version.id
  http_method = aws_api_gateway_method.options_menu_version.http_method
  status_code = aws_api_gateway_method_response.options_menu_version.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${var.allowed_origins}'"
  }
}

# GET method for menu-version
resource "aws_api_gateway_method" "get_menu_version" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.menu_version.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "get_menu_version" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_version.id
  http_method = aws_api_gateway_method.get_menu_version.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = false
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
  }
}

resource "aws_api_gateway_integration" "get_menu_version" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_version.id
  http_method = aws_api_gateway_method.get_menu_version.http_method
  type        = "AWS_PROXY"
  integration_http_method = "POST"
  uri         = aws_lambda_function.get_menu_version.invoke_arn
}

resource "aws_api_gateway_integration_response" "get_menu_version" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_version.id
  http_method = aws_api_gateway_method.get_menu_version.http_method
  status_code = aws_api_gateway_method_response.get_menu_version.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'${var.allowed_origins}'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
  }

  depends_on = [
    aws_lambda_function.get_menu_version,
    aws_api_gateway_integration.get_menu_version
  ]
}

# POST method for menu-version (increment)
resource "aws_api_gateway_method" "increment_menu_version" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.menu_version.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "increment_menu_version" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_version.id
  http_method = aws_api_gateway_method.increment_menu_version.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = false
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
  }
}

resource "aws_api_gateway_integration" "increment_menu_version" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_version.id
  http_method = aws_api_gateway_method.increment_menu_version.http_method
  type        = "AWS_PROXY"
  integration_http_method = "POST"
  uri         = aws_lambda_function.increment_menu_version.invoke_arn
}

resource "aws_api_gateway_integration_response" "increment_menu_version" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_version.id
  http_method = aws_api_gateway_method.increment_menu_version.http_method
  status_code = aws_api_gateway_method_response.increment_menu_version.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'${var.allowed_origins}'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
  }

  depends_on = [
    aws_lambda_function.increment_menu_version,
    aws_api_gateway_integration.increment_menu_version
  ]
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

# DELETE method for deleting individual categories
resource "aws_api_gateway_method" "delete_category" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.category.id
  http_method   = "DELETE"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "delete_category" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.category.id
  http_method = aws_api_gateway_method.delete_category.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration" "delete_category" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.category.id
  http_method = aws_api_gateway_method.delete_category.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.delete_category.invoke_arn
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
  statement_id  = "AllowExecutionFromAPIGateway-get-menu-items"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_menu_items.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_categories" {
  statement_id  = "AllowExecutionFromAPIGateway-get-categories"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_categories.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "update_category" {
  statement_id  = "AllowExecutionFromAPIGateway-update-category"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.update_category.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "create_category" {
  statement_id  = "AllowExecutionFromAPIGateway-create-category"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_category.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "delete_category" {
  statement_id  = "AllowExecutionFromAPIGateway-delete-category"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_category.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "search_menu_items" {
  statement_id  = "AllowExecutionFromAPIGateway-search-menu-items"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.search_menu_items.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_menu_items_by_category" {
  statement_id  = "AllowExecutionFromAPIGateway-get-menu-items-by-category"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_menu_items_by_category.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "update_menu_item" {
  statement_id  = "AllowExecutionFromAPIGateway-update-menu-item"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.update_menu_item.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "delete_menu_item" {
  statement_id  = "AllowExecutionFromAPIGateway-delete-menu-item"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_menu_item.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "create_menu_item" {
  statement_id  = "AllowExecutionFromAPIGateway-create-menu-item"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_menu_item.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_menu_version" {
  statement_id  = "AllowExecutionFromAPIGateway-get-menu-version"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_menu_version.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "increment_menu_version" {
  statement_id  = "AllowExecutionFromAPIGateway-increment-menu-version"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.increment_menu_version.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "admin_login" {
  statement_id  = "AllowExecutionFromAPIGateway-admin-login"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_login.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "admin_verify" {
  statement_id  = "AllowExecutionFromAPIGateway-admin-verify"
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
    aws_api_gateway_integration.post_menu_items,
    aws_api_gateway_integration.get_menu_version,
    aws_api_gateway_integration.increment_menu_version,
    aws_api_gateway_integration.options_menu_version,
    aws_api_gateway_integration.get_categories,
    aws_api_gateway_integration.post_categories,
    aws_api_gateway_integration.search_menu_items,
    aws_api_gateway_integration.get_menu_items_by_category,
    aws_api_gateway_integration.put_menu_item,
    aws_api_gateway_integration.delete_menu_item,
    aws_api_gateway_integration.put_category,
    aws_api_gateway_integration.delete_category,
    aws_api_gateway_integration.admin_login,
    aws_api_gateway_integration.admin_verify,
    aws_api_gateway_integration.get_admin_users,
    aws_api_gateway_integration.post_admin_users,
    aws_api_gateway_integration.put_admin_user,
    aws_api_gateway_integration.delete_admin_user,
    aws_api_gateway_integration.get_users,
    aws_api_gateway_integration.get_user_by_id,
    aws_api_gateway_integration.put_user,
    aws_api_gateway_integration.delete_user,
    aws_api_gateway_integration.get_announcements,
    aws_api_gateway_integration.post_announcements,
    aws_api_gateway_integration.put_announcement,
    aws_api_gateway_integration.delete_announcement,

    aws_api_gateway_method.options_categories,
    aws_api_gateway_method.options_menu_items,
    aws_api_gateway_method.options_search,
    aws_api_gateway_method.options_menu_version,
    aws_api_gateway_method.options_menu_items_by_category,
    aws_api_gateway_method.options_admin_users,
    aws_api_gateway_method.options_users,
    aws_api_gateway_method.options_user,
    aws_api_gateway_method.get_menu_version,
    aws_api_gateway_method.increment_menu_version,
    aws_api_gateway_method.admin_login,
    aws_api_gateway_method.admin_verify,
    aws_api_gateway_method.get_admin_users,
    aws_api_gateway_method.post_admin_users,
    aws_api_gateway_method.put_admin_user,
    aws_api_gateway_method.delete_admin_user,
    aws_api_gateway_method.options_admin_user,
    aws_api_gateway_method.get_users,
    aws_api_gateway_method.get_user_by_id,
    aws_api_gateway_method.put_user,
    aws_api_gateway_method.delete_user,
    aws_api_gateway_method.get_announcements,
    aws_api_gateway_method.post_announcements,
    aws_api_gateway_method.put_announcement,
    aws_api_gateway_method.delete_announcement,
    aws_api_gateway_method.options_announcements,
    aws_api_gateway_method.options_announcement,
    aws_api_gateway_method_response.options_categories,
    aws_api_gateway_method_response.options_menu_items,
    aws_api_gateway_method_response.options_search,
    aws_api_gateway_method_response.options_menu_version,
    aws_api_gateway_method_response.options_menu_items_by_category,
    aws_api_gateway_method_response.options_users,
    aws_api_gateway_method_response.options_user,
    aws_api_gateway_method_response.get_menu_version,
    aws_api_gateway_method_response.increment_menu_version,
    aws_api_gateway_method_response.admin_login,
    aws_api_gateway_method_response.admin_verify,
    aws_api_gateway_method_response.get_users,
    aws_api_gateway_method_response.get_user_by_id,
    aws_api_gateway_method_response.put_user,
    aws_api_gateway_method_response.delete_user,
    aws_api_gateway_method_response.get_announcements,
    aws_api_gateway_method_response.post_announcements,
    aws_api_gateway_method_response.put_announcement,
    aws_api_gateway_method_response.delete_announcement,
    aws_api_gateway_method_response.options_announcements,
    aws_api_gateway_method_response.options_announcement,
    aws_api_gateway_integration.options_categories,
    aws_api_gateway_integration.options_menu_items,
    aws_api_gateway_integration.options_search,
    aws_api_gateway_integration.options_menu_items_by_category,
    aws_api_gateway_integration.options_users,
    aws_api_gateway_integration.options_user,
    aws_api_gateway_integration.options_announcements,
    aws_api_gateway_integration.options_announcement,
    aws_api_gateway_integration.options,
    aws_api_gateway_integration.options_admin,
    aws_api_gateway_integration.options_admin_login,
    aws_api_gateway_integration.options_admin_verify,
    aws_api_gateway_integration.options_admin_users,
    aws_api_gateway_integration_response.options_categories,
    aws_api_gateway_integration_response.options_menu_items,
    aws_api_gateway_integration_response.options_search,
    aws_api_gateway_integration_response.options_menu_version,
    aws_api_gateway_integration_response.options_menu_items_by_category,
    aws_api_gateway_integration_response.options_users,
    aws_api_gateway_integration_response.options_user,
    aws_api_gateway_integration_response.options_announcements,
    aws_api_gateway_integration_response.options_announcement,
    aws_api_gateway_integration_response.options_admin,
    aws_api_gateway_integration_response.get_menu_version,
    aws_api_gateway_integration_response.increment_menu_version,
    aws_api_gateway_integration_response.options_admin_login,
    aws_api_gateway_integration_response.options_admin_verify,
    aws_api_gateway_integration_response.options_admin_users,
    aws_api_gateway_integration_response.admin_login,
    aws_api_gateway_integration_response.admin_verify,
    aws_lambda_permission.get_menu_items,
    aws_lambda_permission.create_menu_item,
    aws_lambda_permission.get_menu_version,
    aws_lambda_permission.increment_menu_version,
    aws_lambda_permission.get_categories,
    aws_lambda_permission.create_category,
    aws_lambda_permission.update_category,
    aws_lambda_permission.delete_category,
    aws_lambda_permission.search_menu_items,
    aws_lambda_permission.get_menu_items_by_category,
    aws_lambda_permission.update_menu_item,
    aws_lambda_permission.delete_menu_item,
    aws_lambda_permission.admin_login,
    aws_lambda_permission.admin_verify,
    aws_lambda_permission.get_admin_users,
    aws_lambda_permission.create_admin_user,
    aws_lambda_permission.update_admin_user,
    aws_lambda_permission.delete_admin_user,
    aws_lambda_permission.get_users,
    aws_lambda_permission.get_user_by_id,
    aws_lambda_permission.update_user,
    aws_lambda_permission.delete_user,
    aws_lambda_permission.get_announcements,
    aws_lambda_permission.create_announcement,
    aws_lambda_permission.update_announcement,
    aws_lambda_permission.delete_announcement
  ]

  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id

  # Force new deployment when Lambda functions change
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_method.get_menu_items.id,
      aws_api_gateway_method.post_menu_items.id,
      aws_api_gateway_method.get_menu_version.id,
      aws_api_gateway_method.increment_menu_version.id,
      aws_api_gateway_method.get_categories.id,
      aws_api_gateway_method.post_categories.id,
      aws_api_gateway_method.put_category.id,
      aws_api_gateway_method.delete_category.id,
      aws_api_gateway_method.search_menu_items.id,
      aws_api_gateway_method.get_menu_items_by_category.id,
      aws_api_gateway_method.put_menu_item.id,
      aws_api_gateway_method.delete_menu_item.id,
      aws_api_gateway_method.admin_login.id,
      aws_api_gateway_method.admin_verify.id,
      aws_api_gateway_method.get_admin_users.id,
      aws_api_gateway_method.post_admin_users.id,
      aws_api_gateway_method.put_admin_user.id,
      aws_api_gateway_method.delete_admin_user.id,
      aws_api_gateway_method.get_users.id,
      aws_api_gateway_method.get_user_by_id.id,
      aws_api_gateway_method.put_user.id,
      aws_api_gateway_method.delete_user.id,
      aws_api_gateway_method.options.id,
      aws_api_gateway_method.options_categories.id,
      aws_api_gateway_method.options_menu_items.id,
      aws_api_gateway_method.options_search.id,
      aws_api_gateway_method.options_menu_version.id,
      aws_api_gateway_method.options_menu_items_by_category.id,
      aws_api_gateway_method.options_admin.id,
      aws_api_gateway_method.options_admin_login.id,
      aws_api_gateway_method.options_admin_verify.id,
      aws_api_gateway_method.options_admin_users.id,
      aws_api_gateway_method.options_users.id,
      aws_api_gateway_method.options_user.id,
      aws_api_gateway_method.options_admin_user.id,
      aws_api_gateway_integration.get_menu_items.id,
      aws_api_gateway_integration.post_menu_items.id,
      aws_api_gateway_integration.get_menu_version.id,
      aws_api_gateway_integration.increment_menu_version.id,
      aws_api_gateway_integration.options_menu_version.id,
      aws_api_gateway_integration.get_categories.id,
      aws_api_gateway_integration.post_categories.id,
      aws_api_gateway_integration.put_category.id,
      aws_api_gateway_integration.delete_category.id,
      aws_api_gateway_integration.search_menu_items.id,
      aws_api_gateway_integration.get_menu_items_by_category.id,
      aws_api_gateway_integration.put_menu_item.id,
      aws_api_gateway_integration.delete_menu_item.id,
      aws_api_gateway_integration.admin_login.id,
      aws_api_gateway_integration.admin_verify.id,
      aws_api_gateway_integration.get_admin_users.id,
      aws_api_gateway_integration.post_admin_users.id,
      aws_api_gateway_integration.put_admin_user.id,
      aws_api_gateway_integration.delete_admin_user.id,
      aws_api_gateway_integration.get_users.id,
      aws_api_gateway_integration.get_user_by_id.id,
      aws_api_gateway_integration.put_user.id,
      aws_api_gateway_integration.delete_user.id,
      aws_api_gateway_integration.options.id,
      aws_api_gateway_integration.options_categories.id,
      aws_api_gateway_integration.options_menu_items.id,
      aws_api_gateway_integration.options_search.id,
      aws_api_gateway_integration.options_menu_version.id,
      aws_api_gateway_integration.options_menu_items_by_category.id,
      aws_api_gateway_integration.options_admin.id,
      aws_api_gateway_integration.options_admin_login.id,
      aws_api_gateway_integration.options_admin_verify.id,
      aws_api_gateway_integration.options_admin_users.id,
      aws_api_gateway_integration.options_users.id,
      aws_api_gateway_integration.options_user.id,
      aws_api_gateway_integration.options_admin_user.id
    ]))
  }

  # Handle deployment recreation properly to avoid stage dependency issues
  lifecycle {
    create_before_destroy = true
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

# Admin Users Integration Responses
# Note: GET method uses Lambda proxy integration, so no integration response needed

resource "aws_api_gateway_integration_response" "options_admin_users" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin_users.id
  http_method = aws_api_gateway_method.options_admin_users.http_method
  status_code = aws_api_gateway_method_response.options_admin_users.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${var.allowed_origins}'"
  }

  depends_on = [aws_api_gateway_integration.options_admin_users]
}

# User Management API Resources
resource "aws_api_gateway_resource" "admin_users" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_rest_api.tacodelite_api.root_resource_id
  path_part   = "admin-users"
}


resource "aws_api_gateway_resource" "admin_user" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_resource.admin_users.id
  path_part   = "{id}"
}

resource "aws_api_gateway_resource" "users" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_rest_api.tacodelite_api.root_resource_id
  path_part   = "users"
}

resource "aws_api_gateway_resource" "user" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_resource.users.id
  path_part   = "{userId}"
}

# Announcements API Resources
resource "aws_api_gateway_resource" "announcements" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_rest_api.tacodelite_api.root_resource_id
  path_part   = "announcements"
}

resource "aws_api_gateway_resource" "announcement" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_resource.announcements.id
  path_part   = "{id}"
}

# CORS Support - OPTIONS method for announcements
resource "aws_api_gateway_method" "options_announcements" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.announcements.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "options_announcements" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.announcements.id
  http_method = aws_api_gateway_method.options_announcements.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration" "options_announcements" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.announcements.id
  http_method = aws_api_gateway_method.options_announcements.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "options_announcements" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.announcements.id
  http_method = aws_api_gateway_method.options_announcements.http_method
  status_code = aws_api_gateway_method_response.options_announcements.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${var.allowed_origins}'"
  }
}

# CORS Support - OPTIONS method for individual announcement
resource "aws_api_gateway_method" "options_announcement" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.announcement.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "options_announcement" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.announcement.id
  http_method = aws_api_gateway_method.options_announcement.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration" "options_announcement" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.announcement.id
  http_method = aws_api_gateway_method.options_announcement.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "options_announcement" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.announcement.id
  http_method = aws_api_gateway_method.options_announcement.http_method
  status_code = aws_api_gateway_method_response.options_announcement.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${var.allowed_origins}'"
  }
}

# CORS Support - OPTIONS method for admin users
resource "aws_api_gateway_method" "options_admin_users" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.admin_users.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# CORS Support - OPTIONS method for users
resource "aws_api_gateway_method" "options_users" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.users.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "options_admin_users" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin_users.id
  http_method = aws_api_gateway_method.options_admin_users.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_method_response" "options_users" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = aws_api_gateway_method.options_users.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration" "options_users" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = aws_api_gateway_method.options_users.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "options_users" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = aws_api_gateway_method.options_users.http_method
  status_code = aws_api_gateway_method_response.options_users.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${var.allowed_origins}'"
  }
}

# CORS Support - OPTIONS method for individual user
resource "aws_api_gateway_method" "options_user" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.user.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "options_user" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.user.id
  http_method = aws_api_gateway_method.options_user.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration" "options_user" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.user.id
  http_method = aws_api_gateway_method.options_user.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "options_user" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.user.id
  http_method = aws_api_gateway_method.options_user.http_method
  status_code = aws_api_gateway_method_response.options_user.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${var.allowed_origins}'"
  }
}

# GET method for all admin users
resource "aws_api_gateway_method" "get_admin_users" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.admin_users.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "get_admin_users" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin_users.id
  http_method = aws_api_gateway_method.get_admin_users.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration" "get_admin_users" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin_users.id
  http_method = aws_api_gateway_method.get_admin_users.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.get_admin_users.invoke_arn
}

# POST method for creating admin users
resource "aws_api_gateway_method" "post_admin_users" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.admin_users.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "post_admin_users" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin_users.id
  http_method = aws_api_gateway_method.post_admin_users.http_method
  status_code = "201"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration" "post_admin_users" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin_users.id
  http_method = aws_api_gateway_method.post_admin_users.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.create_admin_user.invoke_arn
}

# PUT method for updating individual admin users
resource "aws_api_gateway_method" "put_admin_user" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.admin_user.id
  http_method   = "PUT"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "put_admin_user" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin_user.id
  http_method = aws_api_gateway_method.put_admin_user.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration" "put_admin_user" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin_user.id
  http_method = aws_api_gateway_method.put_admin_user.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.update_admin_user.invoke_arn
}

# DELETE method for deleting individual admin users
resource "aws_api_gateway_method" "delete_admin_user" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.admin_user.id
  http_method   = "DELETE"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "delete_admin_user" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin_user.id
  http_method = aws_api_gateway_method.delete_admin_user.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration" "delete_admin_user" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin_user.id
  http_method = aws_api_gateway_method.delete_admin_user.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.delete_admin_user.invoke_arn
}

# OPTIONS method for individual admin user
resource "aws_api_gateway_method" "options_admin_user" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.admin_user.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "options_admin_user" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin_user.id
  http_method = aws_api_gateway_method.options_admin_user.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration" "options_admin_user" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin_user.id
  http_method = aws_api_gateway_method.options_admin_user.http_method

  type = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "options_admin_user" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin_user.id
  http_method = aws_api_gateway_method.options_admin_user.http_method
  status_code = aws_api_gateway_method_response.options_admin_user.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${var.allowed_origins}'"
  }

  depends_on = [aws_api_gateway_integration.options_admin_user]
}

resource "aws_api_gateway_integration" "options_admin_users" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.admin_users.id
  http_method = aws_api_gateway_method.options_admin_users.http_method

  type = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# GET method for all users
resource "aws_api_gateway_method" "get_users" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.users.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "get_users" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = aws_api_gateway_method.get_users.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = false
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
  }
}

resource "aws_api_gateway_integration" "get_users" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = aws_api_gateway_method.get_users.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.get_users.invoke_arn
}

# GET method for individual user
resource "aws_api_gateway_method" "get_user_by_id" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.user.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "get_user_by_id" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.user.id
  http_method = aws_api_gateway_method.get_user_by_id.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = false
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
  }
}

resource "aws_api_gateway_integration" "get_user_by_id" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.user.id
  http_method = aws_api_gateway_method.get_user_by_id.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.get_user_by_id.invoke_arn
}

# PUT method for updating user
resource "aws_api_gateway_method" "put_user" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.user.id
  http_method   = "PUT"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "put_user" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.user.id
  http_method = aws_api_gateway_method.put_user.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration" "put_user" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.user.id
  http_method = aws_api_gateway_method.put_user.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.update_user.invoke_arn
}

# DELETE method for user
resource "aws_api_gateway_method" "delete_user" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.user.id
  http_method   = "DELETE"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "delete_user" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.user.id
  http_method = aws_api_gateway_method.delete_user.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
    "method.response.header.Access-Control-Allow-Origin"  = false
  }
}

resource "aws_api_gateway_integration" "delete_user" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.user.id
  http_method = aws_api_gateway_method.delete_user.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.delete_user.invoke_arn
}

# Lambda Permissions for Admin User Management
resource "aws_lambda_permission" "get_admin_users" {
  statement_id  = "AllowExecutionFromAPIGateway-get-admin-users"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_admin_users.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "create_admin_user" {
  statement_id  = "AllowExecutionFromAPIGateway-create-admin-user"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_admin_user.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "update_admin_user" {
  statement_id  = "AllowExecutionFromAPIGateway-update-admin-user"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.update_admin_user.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "delete_admin_user" {
  statement_id  = "AllowExecutionFromAPIGateway-delete-admin-user"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_admin_user.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

# Lambda Permissions for User Management
resource "aws_lambda_permission" "get_users" {
  statement_id  = "AllowExecutionFromAPIGateway-get-users"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_users.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_user_by_id" {
  statement_id  = "AllowExecutionFromAPIGateway-get-user-by-id"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_user_by_id.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "update_user" {
  statement_id  = "AllowExecutionFromAPIGateway-update-user"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.update_user.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "delete_user" {
  statement_id  = "AllowExecutionFromAPIGateway-delete-user"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_user.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

# Lambda Permissions for Announcements
resource "aws_lambda_permission" "get_announcements" {
  statement_id  = "AllowExecutionFromAPIGateway-get-announcements"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_announcements.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "create_announcement" {
  statement_id  = "AllowExecutionFromAPIGateway-create-announcement"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_announcement.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "update_announcement" {
  statement_id  = "AllowExecutionFromAPIGateway-update-announcement"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.update_announcement.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "delete_announcement" {
  statement_id  = "AllowExecutionFromAPIGateway-delete-announcement"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_announcement.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tacodelite_api.execution_arn}/*/*"
}

# Announcements API Methods

# GET method for announcements
resource "aws_api_gateway_method" "get_announcements" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.announcements.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "get_announcements" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.announcements.id
  http_method = aws_api_gateway_method.get_announcements.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = false
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
  }
}

resource "aws_api_gateway_integration" "get_announcements" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.announcements.id
  http_method = aws_api_gateway_method.get_announcements.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.get_announcements.invoke_arn
}

# POST method for creating announcements
resource "aws_api_gateway_method" "post_announcements" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.announcements.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "post_announcements" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.announcements.id
  http_method = aws_api_gateway_method.post_announcements.http_method
  status_code = "201"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = false
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
  }
}

resource "aws_api_gateway_integration" "post_announcements" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.announcements.id
  http_method = aws_api_gateway_method.post_announcements.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.create_announcement.invoke_arn
}

# PUT method for updating announcements
resource "aws_api_gateway_method" "put_announcement" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.announcement.id
  http_method   = "PUT"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "put_announcement" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.announcement.id
  http_method = aws_api_gateway_method.put_announcement.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = false
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
  }
}

resource "aws_api_gateway_integration" "put_announcement" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.announcement.id
  http_method = aws_api_gateway_method.put_announcement.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.update_announcement.invoke_arn
}

# DELETE method for announcements
resource "aws_api_gateway_method" "delete_announcement" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.announcement.id
  http_method   = "DELETE"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "delete_announcement" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.announcement.id
  http_method = aws_api_gateway_method.delete_announcement.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = false
    "method.response.header.Access-Control-Allow-Headers" = false
    "method.response.header.Access-Control-Allow-Methods" = false
  }
}

resource "aws_api_gateway_integration" "delete_announcement" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.announcement.id
  http_method = aws_api_gateway_method.delete_announcement.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.delete_announcement.invoke_arn
}

# API Gateway Methods


