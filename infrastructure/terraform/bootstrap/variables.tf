variable "environment" {
  description = "Environment name (dev or prod)"
  type        = string
  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "Environment must be either dev or prod."
  }
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-west-1"
}