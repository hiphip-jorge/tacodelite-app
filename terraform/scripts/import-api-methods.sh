#!/bin/bash
# Import existing API Gateway methods into Terraform state
# Run this when you get "Method already exists for this resource" errors
#
# Usage: ./scripts/import-api-methods.sh [staging|production]
# Run from terraform directory: cd tacodelite-app/terraform && ./scripts/import-api-methods.sh staging

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="$(dirname "$SCRIPT_DIR")"
cd "$TERRAFORM_DIR"

# Import only if resource is not already in state (avoids "Resource already managed" error)
import_if_missing() {
  local addr="$1"
  local id="$2"
  if terraform state show "$addr" &>/dev/null; then
    echo "  $addr: already in state"
  else
    terraform import "$addr" "$id" && echo "  $addr: imported"
  fi
}

# Select workspace if using staging/production
ENV="${1:-staging}"
terraform workspace select "$ENV" 2>/dev/null || true
APP_NAME="tacodelite-app"
API_NAME="${APP_NAME}-api-${ENV}"

echo "Importing API Gateway methods for ${API_NAME}..."

# Get REST API ID
REST_API_ID=$(aws apigateway get-rest-apis --query "items[?name=='${API_NAME}'].id" --output text)
if [ -z "$REST_API_ID" ]; then
  echo "Error: Could not find REST API '${API_NAME}'"
  exit 1
fi
echo "REST API ID: $REST_API_ID"

# Get root resource ID
ROOT_ID=$(aws apigateway get-resources --rest-api-id "$REST_API_ID" --query "items[?path=='/'].id" --output text)

# Get /menu resource ID (under root)
MENU_ID=$(aws apigateway get-resources --rest-api-id "$REST_API_ID" --query "items[?pathPart=='menu' && parentId=='${ROOT_ID}'].id" --output text)
if [ -z "$MENU_ID" ]; then
  echo "Error: Could not find /menu resource"
  exit 1
fi

# Get /menu/menu-items resource ID (parent must be menu)
MENU_ITEMS_ID=$(aws apigateway get-resources --rest-api-id "$REST_API_ID" --query "items[?pathPart=='menu-items' && parentId=='${MENU_ID}'].id" --output text)
if [ -z "$MENU_ITEMS_ID" ]; then
  echo "Error: Could not find /menu/menu-items resource"
  exit 1
fi

# Get /menu/menu-items/items resource ID (menu_items_sub)
MENU_ITEMS_SUB_ID=$(aws apigateway get-resources --rest-api-id "$REST_API_ID" --query "items[?pathPart=='items' && parentId=='${MENU_ITEMS_ID}'].id" --output text)
if [ -z "$MENU_ITEMS_SUB_ID" ]; then
  echo "Error: Could not find /menu/menu-items/items resource"
  exit 1
fi

echo ""
echo "Importing methods..."
import_if_missing aws_api_gateway_method.get_menu_items_unified "${REST_API_ID}/${MENU_ITEMS_SUB_ID}/GET"
import_if_missing aws_api_gateway_method.get_menu_items_base "${REST_API_ID}/${MENU_ITEMS_ID}/GET"
import_if_missing aws_api_gateway_method.options_menu_items "${REST_API_ID}/${MENU_ITEMS_ID}/OPTIONS"

echo ""
echo "Importing method responses..."
import_if_missing aws_api_gateway_method_response.get_menu_items_unified "${REST_API_ID}/${MENU_ITEMS_SUB_ID}/GET/200"
# get_menu_items_base method_response - may not exist in AWS (AWS_PROXY); Terraform will create if needed
import_if_missing aws_api_gateway_method_response.options_menu_items "${REST_API_ID}/${MENU_ITEMS_ID}/OPTIONS/200"

echo ""
echo "Importing integrations..."
import_if_missing aws_api_gateway_integration.get_menu_items_unified "${REST_API_ID}/${MENU_ITEMS_SUB_ID}/GET"
# get_menu_items_base integration - may not exist in AWS; skip import if already in state
if terraform state show aws_api_gateway_integration.get_menu_items_base &>/dev/null; then
  echo "  aws_api_gateway_integration.get_menu_items_base: already in state"
else
  terraform import aws_api_gateway_integration.get_menu_items_base "${REST_API_ID}/${MENU_ITEMS_ID}/GET" 2>/dev/null && echo "  get_menu_items_base (integration): imported" || echo "  get_menu_items_base (integration): not in AWS, Terraform will create"
fi
import_if_missing aws_api_gateway_integration.options_menu_items "${REST_API_ID}/${MENU_ITEMS_ID}/OPTIONS"

echo ""
echo "Importing integration responses..."
# get_menu_items_unified uses AWS_PROXY - no integration_response in Terraform
import_if_missing aws_api_gateway_integration_response.options_menu_items "${REST_API_ID}/${MENU_ITEMS_ID}/OPTIONS/200"

echo ""
echo "Done! Run: terraform plan"
echo ""
echo "IMPORTANT for CI/CD: The imports update your Terraform state. With S3 backend,"
echo "run 'terraform apply' locally after imports to push state, or add an import"
echo "step to your CI/CD pipeline that runs before terraform apply."
