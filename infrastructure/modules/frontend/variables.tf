variable "bucket_name" {
  description = "Name of the S3 bucket for website hosting"
  type        = string
}

variable "index_document" {
  description = "Index document for the website"
  type        = string
  default     = "index.html"
}

variable "price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}

variable "domain_name" {
  description = "Custom domain name for the CloudFront distribution"
  type        = string
  default     = null
}

variable "hosted_zone_id" {
  description = "Route53 hosted zone ID for the domain"
  type        = string
  default     = null
}

variable "create_certificate" {
  description = "Whether to create an ACM certificate for the domain"
  type        = bool
  default     = false
}