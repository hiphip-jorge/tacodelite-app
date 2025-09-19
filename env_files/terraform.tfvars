# Taco Delite App Terraform Variables
# Update these values for your specific deployment

# Environment
environment = "staging"

# App name
app_name = "tacodelite-app"

# AWS Region
aws_region = "us-east-1"

# Allowed origins for CORS (update with your actual domains)
# For local development, these are already included
# For production, add your actual domain(s):
# allowed_origins = "https://yourdomain.com,https://www.yourdomain.com,https://staging.yourdomain.com"
allowed_origins = "https://localhost:3000,https://localhost:5173,http://localhost:3000,http://localhost:5173,http://localhost:4173,https://localhost:4173,https://staging.tacodelitewestplano.com,https://tacodelitewestplano.com,https://www.tacodelitewestplano.com,http://tacodelite-app-staging.s3-website-us-east-1.amazonaws.com"

# Optional: Custom domain (uncomment and update if using)
# domain_name = "yourdomain.com"
# certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/your-cert-id"
