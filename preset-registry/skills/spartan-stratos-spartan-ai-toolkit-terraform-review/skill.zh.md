---
name: terraform-review
description: PR review checklist for Terraform changes covering structure, state safety, security, naming, modules, variables, providers, and CI/CD. Use when reviewing Terraform PRs or doing pre-merge checks.
allowed_tools:
  - Read
  - Glob
  - Grep
---
# Terraform 审查

对 Terraform 变更执行 8 个类别的审查清单。产出 Approved / Needs Changes / Blocked 结论。

## 何时使用

- 审查 Terraform 拉取请求
- 基础设施变更的合并前验证
- 提交 PR 之前进行自查
- 审计现有 Terraform 代码

## 流程

### 1. 结构

- [ ] 文件遵循标准布局：`live/`、`modules/`、`envs/`
- [ ] modules 中每个文件仅包含一个资源
- [ ] `terraform.tf` 包含 backend + provider 配置
- [ ] `variables.tf`、`outputs.tf`、`locals.tf` 为独立文件
- [ ] PR 中不包含 `.terraform/` 或 `*.tfstate*`

```
# CORRECT structure
terraform/
  live/terraform.tf        # backend + provider
  live/variables.tf        # inputs
  live/locals.tf           # computed values
  live/outputs.tf          # exports
  modules/{service}/       # one resource per file
  envs/{env}/              # per-environment config

# WRONG — everything in one file
terraform/main.tf          # 500 lines of mixed resources
```

### 2. 状态安全

- [ ] 自动化中不使用 `terraform state` 命令
- [ ] 状态存储在 S3 中并使用 DynamoDB 锁定
- [ ] 关键资源（RDS、存有数据的 S3）设置 `prevent_destroy`
- [ ] 若没有记录在案的 `terraform state rm` 计划，不得移除资源
- [ ] 安全组和启动配置设置 `create_before_destroy`
- [ ] 使用 import block 纳管现有资源（而非 `terraform import` CLI）

```hcl
# CORRECT — protect critical resources
resource "aws_db_instance" "main" {
  lifecycle {
    prevent_destroy = true
  }
}

# CORRECT — zero-downtime SG updates
resource "aws_security_group" "app" {
  name_prefix = "${local.name_prefix}-app-"
  lifecycle {
    create_before_destroy = true
  }
}
```

### 3. 安全性

- [ ] 不得将 `.tf` 或 `.tfvars` 中的密钥提交到 git
- [ ] 敏感变量标记为 `sensitive = true`
- [ ] S3 存储桶阻止公共访问
- [ ] RDS/Redis 仅位于私有子网
- [ ] 安全组遵循最小权限原则（非 ALB 不得有 `0.0.0.0/0` 入站）
- [ ] 启用加密（S3 SSE、RDS 加密、Redis 传输中 + 静态加密）
- [ ] IAM 策略使用最小权限，不对 `*` 资源执行 `*` 操作

```hcl
# WRONG — overly permissive
resource "aws_security_group_rule" "bad" {
  cidr_blocks = ["0.0.0.0/0"]
  from_port   = 0
  to_port     = 65535
}

# CORRECT — scoped to specific source
resource "aws_security_group_rule" "good" {
  source_security_group_id = var.alb_security_group_id
  from_port                = 8080
  to_port                  = 8080
}
```

### 4. 命名

- [ ] 资源使用 `local.name_prefix`（模式：`{project}-{service}-{env}`）
- [ ] 模块内所有资源命名一致
- [ ] 标签包含：Project、Service、Environment、ManagedBy
- [ ] 不得硬编码名称或账户 ID

```hcl
# CORRECT
locals {
  name_prefix = "${var.project}-${var.service}-${var.env}"
}

# WRONG
resource "aws_s3_bucket" "assets" {
  bucket = "my-bucket-prod"  # hardcoded
}
```

### 5. 模块

- [ ] 模块内不得包含 provider block
- [ ] 模块的 source 使用版本锁定（`?ref=vX.Y.Z`）
- [ ] 无循环模块依赖
- [ ] 模块输出仅暴露使用者所需的内容
- [ ] 模块包含 `versions.tf`，其中写明所需的 provider 版本

```hcl
# CORRECT — pinned version
module "rds" {
  source = "git::https://github.com/{project}/terraform-modules.git//rds?ref=v1.2.0"
}

# WRONG — no version pin
module "rds" {
  source = "git::https://github.com/{project}/terraform-modules.git//rds"
}
```

### 6. 变量

- [ ] 所有变量都有 `description` 和 `type`
- [ ] 敏感变量标记为 `sensitive = true`
- [ ] 关键输入（CIDR、名称、枚举值）使用 validation block
- [ ] 无未使用的变量
- [ ] 默认值对开发环境合理，按环境覆盖

```hcl
# CORRECT
variable "instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"

  validation {
    condition     = can(regex("^db\\.", var.instance_class))
    error_message = "Must be a valid RDS instance class."
  }
}

# WRONG — no description, no type
variable "instance_class" {}
```

### 7. Provider

- [ ] provider 版本使用 `~>` 锁定（悲观约束）
- [ ] 为 Terraform 本身指定 `required_version`
- [ ] provider 配置仅出现在 `live/terraform.tf`，绝不在模块中
- [ ] 在 provider 级别配置默认标签

### 8. CI/CD

- [ ] `terraform fmt -check` 在 CI 中运行
- [ ] `terraform validate` 在 CI 中运行
- [ ] Plan 输出作为 PR 评论发布
- [ ] Apply 仅在合并到 main 时运行
- [ ] 状态锁定防止并发 apply
- [ ] 密钥通过 CI 环境注入，而不是提交到代码库

## 交互风格

- 读取 PR 中所有已变更的 `.tf` 文件
- 检查每个类别——不跳过任何部分
- 将阻断性问题（安全性、状态安全）与建议分开标记
- 为每项发现显示确切的文件和行号

## 规则

- 阻断性问题：代码中的密钥、缺少状态锁定、`0.0.0.0/0` 入站、缺少加密
- 需要修改：缺少描述、缺少版本锁定、命名不一致
- 建议：代码风格、可选验证、文档

## 输出

产出结构化的审查报告：

```
## Terraform Review: {PR title}

### Verdict: Approved | Needs Changes | Blocked

### Findings

#### Blocked (if any)
- [ ] **[Security]** Secrets found in terraform.tfvars — file:line

#### Needs Changes (if any)
- [ ] **[Naming]** Hardcoded bucket name in s3.tf:12
- [ ] **[Modules]** Missing version pin on RDS module

#### Suggestions (if any)
- **[Variables]** Consider adding validation on `instance_class`

### Checklist Summary
| Category  | Status |
|-----------|--------|
| Structure | Pass   |
| State     | Pass   |
| Security  | Fail   |
| Naming    | Warn   |
| Modules   | Warn   |
| Variables | Pass   |
| Providers | Pass   |
| CI/CD     | Pass   |
```
