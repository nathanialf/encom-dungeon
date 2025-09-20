# Frontend outputs
output "frontend_bucket_name" {
  description = "Name of the S3 bucket for frontend hosting"
  value       = module.frontend.bucket_name
}

output "frontend_url" {
  description = "URL of the frontend website"
  value       = module.frontend.website_url
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = module.frontend.cloudfront_domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.frontend.distribution_id
}