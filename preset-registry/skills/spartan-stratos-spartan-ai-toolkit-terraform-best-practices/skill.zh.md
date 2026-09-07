---
name: terraform-best-practices
description: Quick reference for Terraform conventions including file organization, naming, modules, state, security, and anti-patterns. Use when writing or reviewing Terraform code.
---
# Terraform 最佳实践 — 快速参考

## 文件组织

```
terraform/
  live/                    # Orchestration — providers, backend, module calls
    terraform.tf           # backend + provider (ONLY place for providers)
    variables.tf           # all input variables
    locals.tf              # computed values, remote state refs
    outputs.tf             # exported values
    {resource-group}.tf    # module invocations grouped by concern
  modules/{name}/          # Reusable — no providers, no hardcoded values
    main.tf                # locals, data sources
    variables.tf           # inputs with descriptions + types
    outputs.tf             # consumed values only
    versions.tf            # required_providers
    {resource}.tf          # one file per resource type
  envs/{env}/              # Per-environment config
    state.config           # backend partial config
    terraform.tfvars       # non-sensitive values
    secrets.tfvars         # sensitive values (gitignored)
```

## 命名

| 事项 | 约定 | 示例 |
|-------|-----------|---------|
| 资源前缀 | `{project}-{service}-{env}` | `acme-payments-prod` |
| 变量 | `snake_case` | `instance_class` |
| 局部值 | `snake_case` | `name_prefix` |
| 输出 | `snake_case` | `repository_url` |
| 资源 | `this`（主资源）或描述性名称 | `aws_db_instance.this` |
| 安全组 | `name_prefix`（而非 `name`） | `"${local.name_prefix}-app-"` |
| 文件 | `{resource-type}.tf` | `rds.tf`, `sg.tf`, `ecr.tf` |
| 模块 | `kebab-case` 目录 | `modules/ecs-service/` |
| 标签 | PascalCase 键名 | `Project`, `Environment`, `ManagedBy` |

## 模块模式

使用来自 [c0x12c Terraform Registry](https://registry.terraform.io/namespaces/c0x12c) 的模块。
每个模块源均遵循 `c0x12c/{name}/aws` 格式 — 可用模块和版本请参见该 Registry。

```hcl
# Calling a registry module — always version-pin
module "database" {
  source  = "c0x12c/rds/aws"
  version = "~> 0.6.6"

  name       = "${local.name_prefix}-db"
  vpc_id     = local.vpc_id
  subnet_ids = local.private_subnet_ids
  tags       = local.common_tags
}

# Inside a module — no provider, explicit interface
# versions.tf
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

# variables.tf — every var has description + type
variable "name" {
  description = "Resource name prefix"
  type        = string
}

# outputs.tf — only what consumers need
output "endpoint" {
  description = "Connection endpoint"
  value       = aws_db_instance.this.endpoint
}
```

## 状态管理

```hcl
# Backend config — S3 + DynamoDB locking
terraform {
  backend "s3" {}
}

# envs/dev/state.config
bucket         = "{project}-terraform-state"
key            = "{service}/dev/terraform.tfstate"
region         = "us-east-1"
dynamodb_table = "{project}-terraform-locks"
encrypt        = true

# Init with partial config
# terraform init -backend-config=../envs/dev/state.config
```

```hcl
# Remote state for cross-stack references
data "terraform_remote_state" "infra" {
  backend = "s3"
  config = {
    bucket = "{project}-terraform-state"
    key    = "infra/terraform.tfstate"
    region = var.region
  }
}

locals {
  vpc_id = data.terraform_remote_state.infra.outputs.vpc_id
}
```

## 安全检查清单

```hcl
# Sensitive variables
variable "db_password" {
  type      = string
  sensitive = true
}

# S3 — block public, encrypt, version
module "s3" {
  versioning              = true
  server_side_encryption  = { sse_algorithm = "aws:kms" }
  block_public_access     = {
    block_public_acls       = true
    block_public_policy     = true
    ignore_public_acls      = true
    restrict_public_buckets = true
  }
}

# RDS — encrypt, private subnet, protect
resource "aws_db_instance" "this" {
  storage_encrypted   = true
  deletion_protection = var.env == "prod"
  publicly_accessible = false  # ALWAYS false
}

# Security groups — source SG, not CIDR
resource "aws_security_group_rule" "app_to_db" {
  source_security_group_id = aws_security_group.app.id  # not cidr_blocks
  from_port                = 5432
  to_port                  = 5432
}

# Default tags at provider level
provider "aws" {
  default_tags {
    tags = {
      Project     = var.project
      Service     = var.service
      Environment = var.env
      ManagedBy   = "terraform"
    }
  }
}
```

## 常见反模式

```hcl
# WRONG — provider in module
# modules/rds/main.tf
provider "aws" { region = "us-east-1" }  # NEVER in a module

# WRONG — no version pin
module "rds" {
  source = "git::https://github.com/{project}/terraform-modules.git//rds"
  # missing ?ref=vX.Y.Z
}

# WRONG — hardcoded values
resource "aws_s3_bucket" "assets" {
  bucket = "acme-prod-assets"  # use ${local.name_prefix}-assets
}

# WRONG — secrets in code
resource "aws_db_instance" "main" {
  password = "hunter2"  # use var.db_password (sensitive)
}

# WRONG — wildcard IAM
resource "aws_iam_policy" "app" {
  policy = jsonencode({
    Statement = [{ Action = "*", Resource = "*", Effect = "Allow" }]
  })
}

# WRONG — public database
resource "aws_db_instance" "main" {
  publicly_accessible = true  # NEVER for databases
}

# WRONG — no state locking
terraform {
  backend "s3" {
    # missing dynamodb_table for locking
  }
}

# WRONG — all resources in one file
# main.tf with 500+ lines of mixed RDS, S3, SQS, IAM...
# Split into rds.tf, s3.tf, sqs.tf, iam.tf
```

## CI/CD 模式

```yaml
# Standard workflow
# PR: fmt check → validate → plan (comment on PR)
# Merge to main: init → plan → apply

# Key rules:
# - Never auto-apply on PR
# - Always post plan output as PR comment
# - Lock state during apply (DynamoDB)
# - Inject secrets via CI environment variables
# - Pin Terraform version in CI to match team
```

## 应避免的做法

- 模块中的 provider 块
- 未固定版本的模块
- 硬编码的名称、ID 或账号
- `.tf` 文件中或已提交的 `.tfvars` 中的敏感信息
- 通配符 IAM 策略（对 `*` 使用 `*`）
- 公开的数据库或缓存
- 存储缺少加密
- 单体文件（按资源类型拆分）
- 在自动化中使用 `terraform import`（使用 `import` 块）
- 变量和输出缺少 `description`
- 嵌套的 locals 映射（保持扁平）
- 对条件性资源使用 `count`（使用带集合的 `for_each`）
