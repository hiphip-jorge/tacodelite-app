variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
  default     = "staging"
  
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be either 'staging' or 'production'."
  }
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "tacodelite-app"
}

variable "allowed_origins" {
  description = "Comma-separated list of allowed origins for CORS (e.g., 'https://yourdomain.com,https://www.yourdomain.com')"
  type        = string
  default     = "https://localhost:3000,https://localhost:5173,http://localhost:3000,http://localhost:5173,https://staging.tacodelitewestplano.com,https://tacodelitewestplano.com"
}

variable "jwt_secret" {
  description = "Secret key for JWT token signing"
  type        = string
  default     = "your-secret-key-change-in-production"
  sensitive   = true
}

variable "domain_name" {
  description = "Custom domain name for the application (optional)"
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "ACM certificate ARN for custom domain (optional)"
  type        = string
  default     = ""
}

variable "enable_api" {
  description = "Whether to enable API Gateway (false for static site only)"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
}
