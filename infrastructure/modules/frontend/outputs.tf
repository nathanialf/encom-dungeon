output "bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.website.bucket
}

output "bucket_domain_name" {
  description = "Domain name of the S3 bucket"
  value       = aws_s3_bucket.website.bucket_domain_name
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.website.domain_name
}

output "cloudfront_hosted_zone_id" {
  description = "Hosted zone ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.website.hosted_zone_id
}

output "distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.website.id
}

output "website_url" {
  description = "URL of the website"
  value       = var.domain_name != null ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.website.domain_name}"
}

output "certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = var.domain_name != null && var.create_certificate ? aws_acm_certificate.website[0].arn : null
}

output "hosted_zone_id" {
  description = "ID of the Route53 hosted zone"
  value       = var.domain_name != null ? (var.hosted_zone_id != null ? var.hosted_zone_id : aws_route53_zone.website[0].zone_id) : null
}

output "domain_name" {
  description = "Custom domain name (if configured)"
  value       = var.domain_name
}