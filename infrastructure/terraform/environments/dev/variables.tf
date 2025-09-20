variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-west-1"
}

variable "domain_name" {
  description = "Custom domain name for the dev environment"
  type        = string
  default     = "dev.dungeon.riperoni.com"
}

variable "hosted_zone_id" {
  description = "Route53 hosted zone ID for dev.dungeon.riperoni.com domain"
  type        = string
  default     = null
}

variable "create_certificate" {
  description = "Whether to create an ACM certificate for the domain"
  type        = bool
  default     = true
}