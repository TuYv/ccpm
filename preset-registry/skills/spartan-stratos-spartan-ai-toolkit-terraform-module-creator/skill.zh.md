---
name: terraform-module-creator
description: Create or extend reusable Terraform modules with proper structure, interfaces, and documentation. Use when building new infrastructure modules or extending existing ones.
allowed_tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---
# Terraform 模块创建器

遵循结构、接口和组合方面的标准约定，创建或扩展可复用的 Terraform 模块。

## 何时使用

- 创建新的可复用基础设施模块
- 使用新资源扩展现有模块
- 将内联资源重构为规范的模块
- 将临时模块标准化，使其遵循约定

## 流程

### 1. 确定模块用途

询问用户：
- **模块名称**（例如 `rds`、`ecs-service`、`s3-bucket`）
- **管理的资源**（它封装了哪些 AWS/云资源）
- **使用者**（哪些服务将使用该模块）

### 2. 创建模块目录

```
modules/{module-name}/
  main.tf           # Core resource or locals
  variables.tf      # All input variables
  outputs.tf        # All outputs
  {resource}.tf     # One file per resource type
  versions.tf       # Provider version constraints
  README.md         # Auto-generated usage docs
```

### 3. 定义变量

```hcl
# variables.tf — explicit interfaces, no hardcoded defaults for critical values

variable "name" {
  description = "Resource name prefix"
  type        = string

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]+$", var.name))
    error_message = "Name must be lowercase alphanumeric with hyphens."
  }
}

variable "vpc_id" {
  description = "VPC ID where resources are deployed"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for resource placement"
  type        = list(string)
}

variable "tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}

# Use object types for grouped config
variable "backup" {
  description = "Backup configuration"
  type = object({
    enabled          = bool
    retention_days   = number
    window           = optional(string, "03:00-04:00")
  })
  default = {
    enabled        = true
    retention_days = 7
  }
}
```

### 4. 每个文件一种资源

```hcl
# rds.tf — one resource type per file
resource "aws_db_instance" "this" {
  identifier     = var.name
  engine         = var.engine
  engine_version = var.engine_version
  instance_class = var.instance_class

  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage

  db_name  = var.db_name
  username = var.master_username
  password = var.master_password

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period = var.backup.retention_days
  backup_window           = var.backup.window
  deletion_protection     = var.deletion_protection

  tags = merge(var.tags, {
    Name = var.name
  })
}

resource "aws_db_subnet_group" "this" {
  name       = "${var.name}-subnet-group"
  subnet_ids = var.subnet_ids

  tags = merge(var.tags, {
    Name = "${var.name}-subnet-group"
  })
}
```

### 5. 每个资源一个安全组

```hcl
# sg.tf
resource "aws_security_group" "rds" {
  name_prefix = "${var.name}-rds-"
  vpc_id      = var.vpc_id
  description = "Security group for ${var.name} RDS instance"

  tags = merge(var.tags, {
    Name = "${var.name}-rds-sg"
  })

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_security_group_rule" "rds_ingress" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = aws_security_group.rds.id
  source_security_group_id = var.app_security_group_id
  description              = "Allow access from application"
}
```

### 6. 定义输出

```hcl
# outputs.tf — expose values that consumers need
output "endpoint" {
  description = "Database connection endpoint"
  value       = aws_db_instance.this.endpoint
}

output "port" {
  description = "Database port"
  value       = aws_db_instance.this.port
}

output "security_group_id" {
  description = "Security group ID for the database"
  value       = aws_security_group.rds.id
}

output "arn" {
  description = "ARN of the database instance"
  value       = aws_db_instance.this.arn
}

# Mark sensitive outputs
output "connection_string" {
  description = "Full connection string"
  value       = "postgresql://${var.master_username}:${var.master_password}@${aws_db_instance.this.endpoint}/${var.db_name}"
  sensitive   = true
}
```

### 7. 版本约束

```hcl
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
```

### 8. 发布到 Registry

新模块应贡献到 [c0x12c Terraform Registry](https://registry.terraform.io/namespaces/c0x12c)：

1. 按照 Terraform Registry 命名约定，在 `https://github.com/c0x12c/terraform-aws-{module-name}` 创建一个新仓库
2. 推送模块代码，并附带规范的 `versions.tf`、`variables.tf`、`outputs.tf`
3. 为发布打标签：`git tag v0.1.0 && git push --tags`
4. Registry 会根据 GitHub 标签自动发布
5. 使用者随后即可使用：`source = "c0x12c/{module-name}/aws"`，并搭配 `version = "~> 0.1.0"`

### 9. 模块使用示例

```hcl
# How consumers call this module — use c0x12c registry
module "database" {
  source  = "c0x12c/rds/aws"
  version = "~> 0.6.6"

  name            = "${local.name_prefix}-db"
  engine          = "postgres"
  engine_version  = "15.4"
  instance_class  = "db.t3.micro"
  allocated_storage = 20
  db_name         = "myservice"
  master_username = "admin"
  master_password = var.db_password
  vpc_id          = local.vpc_id
  subnet_ids      = local.private_subnet_ids
  app_security_group_id = module.ecs_service.security_group_id

  deletion_protection = var.env == "prod"

  backup = {
    enabled        = true
    retention_days = var.env == "prod" ? 30 : 7
  }

  tags = local.common_tags
}
```

## 交互风格

- 生成前先询问模块用途和使用者
- 一次性创建完整的模块
- 包含展示如何调用该模块的使用示例
- 验证命名和接口的一致性

## 规则

- 模块中禁止包含 provider 块 —— provider 由调用方提供
- 禁止硬编码值 —— 一切通过变量传入
- 显式接口 —— 每个输入都有 description、type，并在有用之处附带 validation
- 每个文件一种资源 —— 以资源类型命名
- 将主资源的资源名称设为 `this`
- 安全组使用 `name_prefix` 而非 `name`（支持先创建后销毁）
- 使用 `sensitive = true` 标记敏感输出
- 对分组配置使用 `object()` 类型
- 对有合理默认值的字段使用 `optional()`
- 版本约束放在 `versions.tf` 中，而非 `main.tf`
- 标签透传并合并，绝不覆盖
- 在适用之处使用生命周期规则实现零停机更新

## 输出

生成一个模块目录：

```
modules/{module-name}/
  main.tf
  variables.tf
  outputs.tf
  versions.tf
  sg.tf
  {resource-1}.tf
  {resource-2}.tf
```

另附一段供使用者复制的使用代码片段。
