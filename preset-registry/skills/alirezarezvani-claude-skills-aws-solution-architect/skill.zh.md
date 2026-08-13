---
name: "aws-solution-architect"
description: Design AWS architectures for startups using serverless patterns and IaC templates. Use when asked to design serverless architecture, create CloudFormation templates, optimize AWS costs, set up CI/CD pipelines, or migrate to AWS. Covers Lambda, API Gateway, DynamoDB, ECS, Aurora, and cost optimization.
---
# AWS 解决方案架构师

为初创公司设计可扩展、经济高效的 AWS 架构，并提供基础设施即代码模板。

---

## 工作流程

### 第 1 步：收集需求

收集应用程序规格：

```
- Application type (web app, mobile backend, data pipeline, SaaS)
- Expected users and requests per second
- Budget constraints (monthly spend limit)
- Team size and AWS experience level
- Compliance requirements (GDPR, HIPAA, SOC 2)
- Availability requirements (SLA, RPO/RTO)
```

### 第 2 步：设计架构

运行架构设计器以获取架构模式建议：

```bash
python scripts/architecture_designer.py --input requirements.json
```

**输出示例：**

```json
{
  "recommended_pattern": "serverless_web",
  "service_stack": ["S3", "CloudFront", "API Gateway", "Lambda", "DynamoDB", "Cognito"],
  "estimated_monthly_cost_usd": 35,
  "pros": ["Low ops overhead", "Pay-per-use", "Auto-scaling"],
  "cons": ["Cold starts", "15-min Lambda limit", "Eventual consistency"]
}
```

从推荐的模式中选择：
- **无服务器 Web**：S3 + CloudFront + API Gateway + Lambda + DynamoDB
- **事件驱动微服务**：EventBridge + Lambda + SQS + Step Functions
- **三层架构**：ALB + ECS Fargate + Aurora + ElastiCache
- **GraphQL 后端**：AppSync + Lambda + DynamoDB + Cognito

有关架构模式的详细规范，请参阅 `references/architecture_patterns.md`。

**验证检查点：** 在继续执行第 3 步之前，确认推荐的模式符合团队的运维成熟度和合规要求。

### 第 3 步：生成 IaC 模板

为所选模式创建基础设施即代码：

```bash
# Serverless stack (CloudFormation)
python scripts/serverless_stack.py --app-name my-app --region us-east-1
```

**CloudFormation YAML 输出示例（核心无服务器资源）：**

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Parameters:
  AppName:
    Type: String
    Default: my-app

Resources:
  ApiFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: index.handler
      Runtime: nodejs20.x
      MemorySize: 512
      Timeout: 30
      Environment:
        Variables:
          TABLE_NAME: !Ref DataTable
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref DataTable
      Events:
        ApiEvent:
          Type: Api
          Properties:
            Path: /{proxy+}
            Method: ANY

  DataTable:
    Type: AWS::DynamoDB::Table
    Properties:
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: pk
          AttributeType: S
        - AttributeName: sk
          AttributeType: S
      KeySchema:
        - AttributeName: pk
          KeyType: HASH
        - AttributeName: sk
          KeyType: RANGE
```

> 包含 API Gateway、Cognito、IAM 角色和 CloudWatch 日志记录的完整模板由 `serverless_stack.py` 生成，也可在 `references/architecture_patterns.md` 中获取。

**CDK TypeScript 代码片段示例（三层架构模式）：**

```typescript
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';

const vpc = new ec2.Vpc(this, 'AppVpc', { maxAzs: 2 });

const cluster = new ecs.Cluster(this, 'AppCluster', { vpc });

const db = new rds.ServerlessCluster(this, 'AppDb', {
  engine: rds.DatabaseClusterEngine.auroraPostgres({
    version: rds.AuroraPostgresEngineVersion.VER_15_2,
  }),
  vpc,
  scaling: { minCapacity: 0.5, maxCapacity: 4 },
});
```

### 第 4 步：审查成本

分析预估成本和优化机会：

```bash
python scripts/cost_optimizer.py --resources current_setup.json --monthly-spend 2000
```

**示例输出：**

```json
{
  "current_monthly_usd": 2000,
  "recommendations": [
    { "action": "Right-size RDS db.r5.2xlarge → db.r5.large", "savings_usd": 420, "priority": "high" },
    { "action": "Purchase 1-yr Compute Savings Plan at 40% utilization", "savings_usd": 310, "priority": "high" },
    { "action": "Move S3 objects >90 days to Glacier Instant Retrieval", "savings_usd": 85, "priority": "medium" }
  ],
  "total_potential_savings_usd": 815
}
```

输出包括：
- 按服务划分的月度成本明细
- 规格优化建议
- Savings Plans 优惠机会
- 每月潜在节省金额

### 第 5 步：部署

部署生成的基础设施：

```bash
# CloudFormation
aws cloudformation create-stack \
  --stack-name my-app-stack \
  --template-body file://template.yaml \
  --capabilities CAPABILITY_IAM

# CDK
cdk deploy

# Terraform
terraform init && terraform apply
```

### 第 6 步：验证并处理故障

验证部署并设置监控：

```bash
# Check stack status
aws cloudformation describe-stacks --stack-name my-app-stack

# Set up CloudWatch alarms
aws cloudwatch put-metric-alarm --alarm-name high-errors ...
```

**如果堆栈创建失败：**

1. 检查失败原因：
   ```bash
   aws cloudformation describe-stack-events \
     --stack-name my-app-stack \
     --query 'StackEvents[?ResourceStatus==`CREATE_FAILED`]'
   ```
2. 查看 CloudWatch Logs，排查 Lambda 或 ECS 错误。
3. 修复模板或资源配置。
4. 重试前删除失败的堆栈：
   ```bash
   aws cloudformation delete-stack --stack-name my-app-stack
   # Wait for deletion
   aws cloudformation wait stack-delete-complete --stack-name my-app-stack
   # Redeploy
   aws cloudformation create-stack ...
   ```

**常见失败原因：**
- IAM 权限错误 → 验证 `--capabilities CAPABILITY_IAM` 和角色信任策略
- 超出资源限制 → 通过 Service Quotas 控制台申请提高配额
- 模板语法无效 → 部署前运行 `aws cloudformation validate-template --template-body file://template.yaml`

---

## 工具

### architecture_designer.py

根据需求生成架构模式。

```bash
python scripts/architecture_designer.py --input requirements.json --output design.json
```

**输入：** 包含应用类型、规模、预算和合规需求的 JSON
**输出：** 推荐模式、服务栈、成本估算和优缺点

### serverless_stack.py

创建无服务器 CloudFormation 模板。

```bash
python scripts/serverless_stack.py --app-name my-app --region us-east-1
```

**输出：** 可用于生产环境的 CloudFormation YAML，包含：
- API Gateway + Lambda
- DynamoDB 表
- Cognito 用户池
- 遵循最小权限原则的 IAM 角色
- CloudWatch 日志记录

### cost_optimizer.py

分析成本并提出优化建议。

```bash
python scripts/cost_optimizer.py --resources inventory.json --monthly-spend 5000
```

**输出：** 针对以下方面的建议：
- 移除闲置资源
- 调整实例规格
- 购买预留容量
- 转换存储层级
- NAT Gateway 替代方案

---

## 快速入门

### MVP 架构（< $100/月）

```
Ask: "Design a serverless MVP backend for a mobile app with 1000 users"

Result:
- Lambda + API Gateway for API
- DynamoDB pay-per-request for data
- Cognito for authentication
- S3 + CloudFront for static assets
- Estimated: $20-50/month
```

### 扩展型架构（$500-2000/月）

```
Ask: "Design a scalable architecture for a SaaS platform with 50k users"

Result:
- ECS Fargate for containerized API
- Aurora Serverless for relational data
- ElastiCache for session caching
- CloudFront for CDN
- CodePipeline for CI/CD
- Multi-AZ deployment
```

### 成本优化

```
Ask: "Optimize my AWS setup to reduce costs by 30%. Current spend: $3000/month"

Provide: Current resource inventory (EC2, RDS, S3, etc.)

Result:
- Idle resource identification
- Right-sizing recommendations
- Savings Plans analysis
- Storage lifecycle policies
- Target savings: $900/month
```

### IaC 生成

```
Ask: "Generate CloudFormation for a three-tier web app with auto-scaling"

Result:
- VPC with public/private subnets
- ALB with HTTPS
- ECS Fargate with auto-scaling
- Aurora with read replicas
- Security groups and IAM roles
```

---

## 输入要求

请提供以下架构设计详细信息：

| 要求 | 描述 | 示例 |
|-------------|-------------|---------|
| 应用程序类型 | 要构建的内容 | SaaS 平台、移动后端 |
| 预期规模 | 用户数、每秒请求数 | 1 万用户、100 RPS |
| 预算 | AWS 每月限额 | 最高 $500/月 |
| 团队情况 | 规模、AWS 经验 | 3 名开发者、中等水平 |
| 合规性 | 法规要求 | HIPAA、GDPR、SOC 2 |
| 可用性 | 正常运行时间要求 | 99.9% SLA、1 小时 RPO |

**JSON 格式：**

```json
{
  "application_type": "saas_platform",
  "expected_users": 10000,
  "requests_per_second": 100,
  "budget_monthly_usd": 500,
  "team_size": 3,
  "aws_experience": "intermediate",
  "compliance": ["SOC2"],
  "availability_sla": "99.9%"
}
```

---

## 输出格式

### 架构设计

- 模式建议及其理由
- 服务栈示意图（ASCII）
- 每月成本估算和权衡分析

### IaC 模板

- **CloudFormation YAML**：可用于生产环境的 SAM/CFN 模板
- **CDK TypeScript**：类型安全的基础设施代码
- **Terraform HCL**：兼容多云的配置

### 成本分析

- 当前支出明细及优化建议
- 优先级行动清单（高/中/低）和实施检查清单

---

## 参考文档

| 文档 | 内容 |
|----------|----------|
| `references/architecture_patterns.md` | 6 种模式：无服务器、微服务、三层架构、数据处理、GraphQL、多区域 |
| `references/service_selection.md` | 计算、数据库、存储、消息传递的决策矩阵 |
| `references/best_practices.md` | 无服务器设计、成本优化、安全加固、可扩展性 |