---
name: cost-optimization
description: Optimize cloud costs across AWS, Azure, GCP, and OCI through resource rightsizing, tagging strategies, reserved instances, and spending analysis. Use when reducing cloud expenses, analyzing infrastructure costs, or implementing cost governance policies.
---
# 云成本优化

跨 AWS、Azure、GCP 和 OCI 优化云成本的策略与模式。

## 目的

实施系统化的成本优化策略，在保持性能和可靠性的同时降低云支出。

## 适用场景

- 降低云支出
- 资源规格合理化（Right-size）
- 实施成本治理
- 优化多云成本
- 满足预算约束

## 成本优化框架

### 1. 可见性

- 实施成本分摊标签
- 使用云成本管理工具
- 设置预算告警
- 创建成本仪表盘

### 2. 规格合理化（Right-Sizing）

- 分析资源利用率
- 缩减过度配置的资源
- 使用自动伸缩
- 移除闲置资源

### 3. 定价模式

- 使用预留容量
- 利用 Spot/抢占式实例
- 实施节省计划
- 使用承诺使用折扣

### 4. 架构优化

- 使用托管服务
- 实施缓存
- 优化数据传输
- 使用生命周期策略

## AWS 成本优化

### 预留实例

```
Savings: 30-72% vs On-Demand
Term: 1 or 3 years
Payment: All/Partial/No upfront
Flexibility: Standard or Convertible
```

### 节省计划

```
Compute Savings Plans: 66% savings
EC2 Instance Savings Plans: 72% savings
Applies to: EC2, Fargate, Lambda
Flexible across: Instance families, regions, OS
```

### Spot 实例

```
Savings: Up to 90% vs On-Demand
Best for: Batch jobs, CI/CD, stateless workloads
Risk: 2-minute interruption notice
Strategy: Mix with On-Demand for resilience
```

### S3 成本优化

```hcl
resource "aws_s3_bucket_lifecycle_configuration" "example" {
  bucket = aws_s3_bucket.example.id

  rule {
    id     = "transition-to-ia"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    expiration {
      days = 365
    }
  }
}
```

## Azure 成本优化

### 预留 VM 实例

- 1 年或 3 年期限
- 最高可节省 72%
- 灵活的规格调整
- 可兑换

### Azure 混合权益

- 使用现有的 Windows Server 许可证
- 结合 RI 最高可节省 80%
- 适用于 Windows 和 SQL Server

### Azure Advisor 建议

- VM 规格合理化
- 删除未使用的资源
- 使用预留容量
- 优化存储

## GCP 成本优化

### 承诺使用折扣

- 1 年或 3 年承诺
- 最高可节省 57%
- 适用于 vCPU 和内存
- 基于资源或基于支出

### 持续使用折扣

- 自动折扣
- 运行中的实例最高可享 30% 折扣
- 无需承诺
- 适用于 Compute Engine、GKE

### 抢占式 VM

- 最高可节省 80%
- 最长运行时间为 24 小时
- 最适合批量工作负载

## OCI 成本优化

### 灵活形状

- 独立伸缩 OCPU 和内存
- 使实例规格匹配工作负载需求
- 减少固定 VM 形状造成的容量浪费

### 承诺与预算

- 对可预测的支出使用年度承诺
- 设置区间级别的预算并配置告警
- 使用 OCI Cost Analysis 跟踪月度预测

### 抢占式容量

- 对批量型和临时性工作负载使用抢占式实例
- 保留可容忍中断的自动伸缩组
- 与标准容量混合使用以支撑关键服务

## 标签策略

### AWS 标签

```hcl
locals {
  common_tags = {
    Environment = "production"
    Project     = "my-project"
    CostCenter  = "engineering"
    Owner       = "team@example.com"
    ManagedBy   = "terraform"
  }
}

resource "aws_instance" "example" {
  ami           = "ami-12345678"
  instance_type = "t3.medium"

  tags = merge(
    local.common_tags,
    {
      Name = "web-server"
    }
  )
}
```

**参考：** 参见 `references/tagging-standards.md`

## 成本监控

### 预算告警

```hcl
# AWS Budget
resource "aws_budgets_budget" "monthly" {
  name              = "monthly-budget"
  budget_type       = "COST"
  limit_amount      = "1000"
  limit_unit        = "USD"
  time_period_start = "2024-01-01_00:00"
  time_unit         = "MONTHLY"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = ["team@example.com"]
  }
}
```

### 成本异常检测

- AWS Cost Anomaly Detection
- Azure Cost Management 告警
- GCP 预算告警
- OCI 预算与成本分析

## 架构模式

### 模式 1：Serverless 优先

- 对事件驱动场景使用 Lambda/Functions
- 仅为执行时间付费
- 内置自动伸缩
- 无闲置成本

### 模式 2：规格合理化的数据库

```
Development: t3.small RDS
Staging: t3.large RDS
Production: r6g.2xlarge RDS with read replicas
```

### 模式 3：多层级存储

```
Hot data: S3 Standard
Warm data: S3 Standard-IA (30 days)
Cold data: S3 Glacier (90 days)
Archive: S3 Deep Archive (365 days)
```

### 模式 4：自动伸缩

```hcl
resource "aws_autoscaling_policy" "scale_up" {
  name                   = "scale-up"
  scaling_adjustment     = 2
  adjustment_type        = "ChangeInCapacity"
  cooldown              = 300
  autoscaling_group_name = aws_autoscaling_group.main.name
}

resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "60"
  statistic           = "Average"
  threshold           = "80"
  alarm_actions       = [aws_autoscaling_policy.scale_up.arn]
}
```

## 成本优化清单

- [ ] 实施成本分摊标签
- [ ] 删除未使用的资源（EBS、EIP、快照）
- [ ] 基于利用率为实例规格合理化
- [ ] 为稳定工作负载使用预留容量
- [ ] 实施自动伸缩
- [ ] 优化存储类别
- [ ] 使用生命周期策略
- [ ] 启用成本异常检测
- [ ] 设置预算告警
- [ ] 每周审查成本
- [ ] 使用 Spot/抢占式实例
- [ ] 优化数据传输成本
- [ ] 实施缓存层
- [ ] 使用托管服务
- [ ] 持续监控与优化

## 工具

- **AWS：** Cost Explorer、Cost Anomaly Detection、Compute Optimizer
- **Azure：** Cost Management、Advisor
- **GCP：** Cost Management、Recommender
- **OCI：** Cost Analysis、Budgets、Cloud Advisor
- **多云：** CloudHealth、Cloudability、Kubecost


## 相关技能

- `terraform-module-library` - 用于资源预配
- `multi-cloud-architecture` - 用于云平台选型
