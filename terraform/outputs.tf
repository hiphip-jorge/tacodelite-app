output "s3_bucket_name" {
  description = "S3 bucket name for static assets"
  value       = aws_s3_bucket.static_assets.bucket
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.static_assets.arn
}

output "s3_website_endpoint" {
  description = "S3 website endpoint (for CloudFlare origin)"
  value       = "${aws_s3_bucket.static_assets.bucket}.s3-website-us-east-1.amazonaws.com"
}

output "dynamodb_menu_items_table" {
  description = "DynamoDB table name for menu items"
  value       = aws_dynamodb_table.menu_items.name
}

output "dynamodb_categories_table" {
  description = "DynamoDB table name for menu categories"
  value       = aws_dynamodb_table.menu_categories.name
}



output "dynamodb_users_table" {
  description = "DynamoDB table name for users"
  value       = aws_dynamodb_table.users.name
}

output "api_gateway_url" {
  description = "API Gateway base URL"
  value       = aws_api_gateway_stage.prod.invoke_url
}

output "api_endpoints" {
  description = "Available API endpoints"
  value       = {
    menu_items = "${aws_api_gateway_stage.prod.invoke_url}/menu-items"
    categories = "${aws_api_gateway_stage.prod.invoke_url}/categories"
    search     = "${aws_api_gateway_stage.prod.invoke_url}/search"
    menu_items_by_category = "${aws_api_gateway_stage.prod.invoke_url}/menu-items-by-category"
  }
}

output "cloudflare_setup_info" {
  description = "CloudFlare caching setup instructions"
  value       = <<-EOT
    🚀 Your API Gateway is ready for aggressive CloudFlare caching!
    
    📍 API Gateway URL: ${aws_api_gateway_stage.prod.invoke_url}
    
    🔧 To enable caching in CloudFlare:
    1. Add your domain to CloudFlare
    2. Set API Gateway URL as an additional origin
    3. Create Page Rules for aggressive caching (menu changes only 4x/year):
       - /categories* → Edge Cache TTL: 30 days (rarely changes)
       - /menu-items* → Edge Cache TTL: 30 days (rarely changes)
       - /search* → Edge Cache TTL: 7 days (more dynamic)
       - /api/* → Edge Cache TTL: 30 days (general API)
    
    💡 Benefits:
    - Global CDN caching (200+ locations)
    - Dramatically reduced DynamoDB costs
    - Faster API responses
    - Browser caching for 30 days
    - Free tier includes unlimited bandwidth
    
    🎯 Cache Strategy:
    - Menu data cached for 30 days (aggressive)
    - Browser will cache responses locally
    - CloudFlare will serve from edge cache
    - Only 4 menu updates per year = perfect for long caching
  EOT
}

output "deployment_instructions" {
  description = "Instructions for CloudFlare setup"
  value       = <<-EOT
    🚀 Your S3 bucket is ready!
    
    📦 S3 Bucket: ${aws_s3_bucket.static_assets.bucket}
    🌐 S3 Website URL: http://${aws_s3_bucket.static_assets.bucket}.s3-website-us-east-1.amazonaws.com
    
    🔧 Next steps for CloudFlare:
    1. Add your domain to CloudFlare
    2. Set S3 website endpoint as origin: ${aws_s3_bucket.static_assets.bucket}.s3-website-us-east-1.amazonaws.com
    3. Configure DNS to point to CloudFlare
    4. Enable CloudFlare proxy (orange cloud)
    
    💡 CloudFlare will provide:
    - Global CDN (free tier)
    - HTTPS/SSL (free)
    - DDoS protection (free)
    - Better performance worldwide
    
    🗄️ DynamoDB Tables Created:
    - Menu Items: ${aws_dynamodb_table.menu_items.name}
    - Categories: ${aws_dynamodb_table.menu_categories.name}
    - Users: ${aws_dynamodb_table.users.name}
  EOT
}
