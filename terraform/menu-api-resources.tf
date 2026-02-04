# New Menu API Resources - Parameterized Structure

# Main menu resource
resource "aws_api_gateway_resource" "menu" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_rest_api.tacodelite_api.root_resource_id
  path_part   = "menu"
}

# Menu items resource
resource "aws_api_gateway_resource" "menu_items" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_resource.menu.id
  path_part   = "menu-items"
}

# Individual menu item resource
resource "aws_api_gateway_resource" "menu_item" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_resource.menu_items.id
  path_part   = "{id}"
}

# Menu items sub-resources (items, modifiers, etc.)
resource "aws_api_gateway_resource" "menu_items_sub" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_resource.menu_items.id
  path_part   = "items"
}

# Menu items by category resource
resource "aws_api_gateway_resource" "menu_items_by_category" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_resource.menu_items_sub.id
  path_part   = "by-category"
}

# Menu items by category with ID
resource "aws_api_gateway_resource" "menu_items_by_category_id" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_resource.menu_items_by_category.id
  path_part   = "{id}"
}

# Menu items search resource
resource "aws_api_gateway_resource" "menu_items_search" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_resource.menu_items_sub.id
  path_part   = "search"
}

# Menu categories resource
resource "aws_api_gateway_resource" "menu_categories" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_resource.menu.id
  path_part   = "categories"
}

# Individual category resource
resource "aws_api_gateway_resource" "menu_category" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_resource.menu_categories.id
  path_part   = "{id}"
}

# Menu modifier groups resource
resource "aws_api_gateway_resource" "menu_modifier_groups" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_resource.menu.id
  path_part   = "modifier-groups"
}

# Individual modifier group resource
resource "aws_api_gateway_resource" "menu_modifier_group" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_resource.menu_modifier_groups.id
  path_part   = "{id}"
}

# Menu modifiers resource (under /menu path to avoid conflict)
resource "aws_api_gateway_resource" "menu_modifiers" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_resource.menu.id
  path_part   = "modifiers"
}

# Individual modifier resource
resource "aws_api_gateway_resource" "menu_modifier" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_resource.menu_modifiers.id
  path_part   = "{id}"
}

# Menu version resource
resource "aws_api_gateway_resource" "menu_version" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_resource.menu.id
  path_part   = "version"
}

# Menu health check resource
resource "aws_api_gateway_resource" "menu_health" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  parent_id   = aws_api_gateway_resource.menu.id
  path_part   = "health"
}

# CORS Support - OPTIONS method for menu
resource "aws_api_gateway_method" "options_menu" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.menu.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "options_menu" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu.id
  http_method = aws_api_gateway_method.options_menu.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration" "options_menu" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu.id
  http_method = aws_api_gateway_method.options_menu.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "options_menu" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu.id
  http_method = aws_api_gateway_method.options_menu.http_method
  status_code = aws_api_gateway_method_response.options_menu.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,If-None-Match'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# GET method for menu items (unified resource handler)
resource "aws_api_gateway_method" "get_menu_items_unified" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.menu_items_sub.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "get_menu_items_unified" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_items_sub.id
  http_method = aws_api_gateway_method.get_menu_items_unified.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.ETag" = true
    "method.response.header.X-Menu-Version" = true
    "method.response.header.X-Resource-Type" = true
  }
}

resource "aws_api_gateway_integration" "get_menu_items_unified" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_items_sub.id
  http_method = aws_api_gateway_method.get_menu_items_unified.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.getMenuResource.invoke_arn
}

# GET method for menu items (base level)
resource "aws_api_gateway_method" "get_menu_items_base" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.menu_items.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "get_menu_items_base" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_items.id
  http_method = aws_api_gateway_method.get_menu_items_base.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.ETag" = true
    "method.response.header.X-Menu-Version" = true
    "method.response.header.X-Resource-Type" = true
  }
}

resource "aws_api_gateway_integration" "get_menu_items_base" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_items.id
  http_method = aws_api_gateway_method.get_menu_items_base.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.getMenuResource.invoke_arn
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
  http_method  = aws_api_gateway_method.post_menu_items.http_method
  status_code  = "201"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
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

# PUT method for updating menu item
resource "aws_api_gateway_method" "put_menu_item" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.menu_item.id
  http_method   = "PUT"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "put_menu_item" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_item.id
  http_method  = aws_api_gateway_method.put_menu_item.http_method
  status_code  = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
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

# DELETE method for menu item
resource "aws_api_gateway_method" "delete_menu_item" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.menu_item.id
  http_method   = "DELETE"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "delete_menu_item" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_item.id
  http_method  = aws_api_gateway_method.delete_menu_item.http_method
  status_code  = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
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

# CORS OPTIONS for menu item (individual {id} path)
resource "aws_api_gateway_method" "options_menu_item" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.menu_item.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "options_menu_item" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_item.id
  http_method  = aws_api_gateway_method.options_menu_item.http_method
  status_code  = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration" "options_menu_item" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_item.id
  http_method = aws_api_gateway_method.options_menu_item.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "options_menu_item" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_item.id
  http_method  = aws_api_gateway_method.options_menu_item.http_method
  status_code  = aws_api_gateway_method_response.options_menu_item.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,If-None-Match'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# GET method for menu categories
resource "aws_api_gateway_method" "get_menu_categories" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.menu_categories.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "get_menu_categories" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_categories.id
  http_method = aws_api_gateway_method.get_menu_categories.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.ETag" = true
    "method.response.header.X-Menu-Version" = true
    "method.response.header.X-Resource-Type" = true
  }
}

resource "aws_api_gateway_integration" "get_menu_categories" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_categories.id
  http_method = aws_api_gateway_method.get_menu_categories.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.getMenuResource.invoke_arn
}

# GET method for menu version
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
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.ETag" = true
    "method.response.header.X-Menu-Version" = true
    "method.response.header.X-Resource-Type" = true
  }
}

resource "aws_api_gateway_integration" "get_menu_version" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_version.id
  http_method = aws_api_gateway_method.get_menu_version.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.getMenuResource.invoke_arn
}

# CORS Support - OPTIONS method for menu items
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
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
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
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,If-None-Match'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# CORS Support - OPTIONS method for menu categories
resource "aws_api_gateway_method" "options_menu_categories" {
  rest_api_id   = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id   = aws_api_gateway_resource.menu_categories.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "options_menu_categories" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_categories.id
  http_method = aws_api_gateway_method.options_menu_categories.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration" "options_menu_categories" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_categories.id
  http_method = aws_api_gateway_method.options_menu_categories.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "options_menu_categories" {
  rest_api_id = aws_api_gateway_rest_api.tacodelite_api.id
  resource_id = aws_api_gateway_resource.menu_categories.id
  http_method = aws_api_gateway_method.options_menu_categories.http_method
  status_code = aws_api_gateway_method_response.options_menu_categories.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,If-None-Match'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}
