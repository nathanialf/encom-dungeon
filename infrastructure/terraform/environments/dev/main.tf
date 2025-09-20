terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "dev-encom-dungeon-terraform-state"
    key    = "encom-dungeon/dev/terraform.tfstate"
    region = "us-west-1"
  }
}

# Configure AWS Provider
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "encom-dungeon"
      Environment = "dev"
      ManagedBy   = "terraform"
    }
  }
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Local values
locals {
  project_name = "encom-dungeon"
  environment  = "dev"
  
  # Frontend configuration
  frontend_bucket_name = "${local.project_name}-frontend-${local.environment}-${data.aws_region.current.name}"
  
  common_tags = {
    Project     = local.project_name
    Environment = local.environment
    Account     = data.aws_caller_identity.current.account_id
    Region      = data.aws_region.current.name
  }
}

# Frontend Module
module "frontend" {
  source = "../../../modules/frontend"
  
  bucket_name       = local.frontend_bucket_name
  index_document    = "index.html"
  price_class       = "PriceClass_100"  # Cost-optimized for dev
  domain_name       = var.domain_name
  hosted_zone_id    = var.hosted_zone_id
  create_certificate = var.create_certificate
  
  tags = merge(local.common_tags, {
    Component = "frontend"
  })
}