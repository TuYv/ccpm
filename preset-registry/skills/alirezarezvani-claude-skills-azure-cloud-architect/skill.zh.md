---
name: "azure-cloud-architect"
description: "Design Azure architectures for startups and enterprises. Use when asked to design Azure infrastructure, create Bicep/ARM templates, optimize Azure costs, set up Azure DevOps pipelines, or migrate to Azure. Covers AKS, App Service, Azure Functions, Cosmos DB, and cost optimization."
---
# Azure 云架构师

使用 Bicep 基础设施即代码模板，为初创企业和大型企业设计可扩展且经济高效的 Azure 架构。

---

## 工作流程

### 步骤 1：收集需求

收集应用程序规格：

```
- Application type (web app, mobile backend, data pipeline, SaaS, microservices)
- Expected users and requests per second
- Budget constraints (monthly spend limit)
- Team size and Azure experience level
- Compliance requirements (GDPR, HIPAA, SOC 2, ISO 27001)
- Availability requirements (SLA, RPO/RTO)
- Region preferences (data residency, latency)
```

### 步骤 2：设计架构

运行架构设计器以获取模式建议：

```bash
python scripts/architecture_designer.py \
  --app-type web_app \
  --users 10000 \
  --requirements '{"budget_monthly_usd": 500, "compliance": ["SOC2"]}'
```

**输出示例：**

```json
{
  "recommended_pattern": "app_service_web",
  "service_stack": ["App Service", "Azure SQL", "Front Door", "Key Vault", "Entra ID"],
  "estimated_monthly_cost_usd": 280,
  "pros": ["Managed platform", "Built-in autoscale", "Deployment slots"],
  "cons": ["Less control than VMs", "Platform constraints", "Cold start on consumption plans"]
}
```

从建议的模式中选择：
- **App Service Web**：Front Door + App Service + Azure SQL + Redis Cache
- **AKS 上的微服务**：AKS + Service Bus + Cosmos DB + API Management
- **无服务器事件驱动架构**：Functions + Event Grid + Service Bus + Cosmos DB
- **数据管道**：Data Factory + Synapse Analytics + Data Lake Storage + Event Hubs

有关详细的模式规格，请参阅 `references/architecture_patterns.md`。

**验证检查点：** 在继续执行步骤 3 之前，确认建议的模式符合团队的运维成熟度和合规要求。

### 步骤 3：生成 IaC 模板

为所选模式创建基础设施即代码：

```bash
# Web app stack (Bicep)
python scripts/bicep_generator.py --arch-type web-app --output main.bicep
```

**Bicep 输出示例（核心 Web 应用资源）：**

```bicep
@description('The environment name')
param environment string = 'dev'

@description('The Azure region for resources')
param location string = resourceGroup().location

@description('The application name')
param appName string = 'myapp'

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: '${environment}-${appName}-plan'
  location: location
  sku: {
    name: 'P1v3'
    tier: 'PremiumV3'
    capacity: 1
  }
  properties: {
    reserved: true // Linux
  }
}

// App Service
resource appService 'Microsoft.Web/sites@2023-01-01' = {
  name: '${environment}-${appName}-web'
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      alwaysOn: true
    }
  }
  identity: {
    type: 'SystemAssigned'
  }
}

// Azure SQL Database
resource sqlServer 'Microsoft.Sql/servers@2023-05-01-preview' = {
  name: '${environment}-${appName}-sql'
  location: location
  properties: {
    administrators: {
      azureADOnlyAuthentication: true
    }
    minimalTlsVersion: '1.2'
  }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-05-01-preview' = {
  parent: sqlServer
  name: '${appName}-db'
  location: location
  sku: {
    name: 'GP_S_Gen5_2'
    tier: 'GeneralPurpose'
  }
  properties: {
    autoPauseDelay: 60
    minCapacity: json('0.5')
  }
}
```

> 包含 Front Door、Key Vault、Managed Identity 和监控的完整模板由 `bicep_generator.py` 生成，也可在 `references/architecture_patterns.md` 中获取。

**Bicep 是 Azure 推荐使用的 IaC 语言。** 应优先使用 Bicep，而不是 ARM JSON 模板：Bicep 可编译为 ARM JSON，语法更简洁，支持模块，并且由 Microsoft 提供官方支持。

### 步骤 4：审查成本

分析预估成本和优化机会：

```bash
python scripts/cost_optimizer.py \
  --config current_resources.json \
  --json
```

**输出示例：**

```json
{
  "current_monthly_usd": 2000,
  "recommendations": [
    { "action": "Right-size SQL Database GP_S_Gen5_8 to GP_S_Gen5_2", "savings_usd": 380, "priority": "high" },
    { "action": "Purchase 1-year Reserved Instances for AKS node pools", "savings_usd": 290, "priority": "high" },
    { "action": "Move Blob Storage to Cool tier for objects >30 days old", "savings_usd": 65, "priority": "medium" }
  ],
  "total_potential_savings_usd": 735
}
```

输出包括：
- 按服务划分的每月成本明细
- 适当调整资源规格的建议
- 预留实例和节省计划机会
- 每月潜在节省金额

### 步骤 5：配置 CI/CD

使用 Azure DevOps Pipelines 或 GitHub Actions 配置 Azure：

```yaml
# GitHub Actions — deploy Bicep to Azure
name: Deploy Infrastructure
on:
  push:
    branches: [main]

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - uses: azure/arm-deploy@v2
        with:
          resourceGroupName: rg-myapp-dev
          template: ./infra/main.bicep
          parameters: environment=dev
```

```yaml
# Azure DevOps Pipeline
trigger:
  branches:
    include:
      - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: AzureCLI@2
    inputs:
      azureSubscription: 'MyServiceConnection'
      scriptType: 'bash'
      scriptLocation: 'inlineScript'
      inlineScript: |
        az deployment group create \
          --resource-group rg-myapp-dev \
          --template-file infra/main.bicep \
          --parameters environment=dev
```

### 步骤 6：安全审查

在投入生产之前验证安全状况：

- **身份认证**：使用带有 RBAC 的 Entra ID（Azure AD），并使用 Managed Identity 进行服务间身份认证——切勿在代码中存储凭据
- **机密**：使用 Key Vault 存储所有机密、证书和连接字符串
- **网络**：在所有子网上配置 NSG，为 PaaS 服务配置 Private Endpoint，并使用带有 WAF 的 Application Gateway
- **加密**：传输过程中使用 TLS 1.2+，静态数据使用 Azure 托管密钥或客户管理的密钥
- **监控**：启用 Microsoft Defender for Cloud，并使用 Azure Policy 设置防护规则
- **合规性**：为 SOC 2 / HIPAA / ISO 27001 计划分配 Azure Policy

**如果部署失败：**

1. 检查部署状态：
   ```bash
   az deployment group show \
     --resource-group rg-myapp-dev \
     --name main \
     --query 'properties.error'
   ```
2. 查看活动日志中是否存在 RBAC 或策略错误。
3. 部署前验证 Bicep 模板：
   ```bash
   az bicep build --file main.bicep
   az deployment group validate \
     --resource-group rg-myapp-dev \
     --template-file main.bicep
   ```

**常见失败原因：**
- RBAC 权限错误 — 验证执行部署的主体是否拥有资源组的 Contributor 角色
- 资源提供程序未注册 — 运行 `az provider register --namespace Microsoft.Web`
- 命名冲突 — Azure 资源名称通常要求全局唯一（存储帐户、Web 应用）
- 超出配额 — 通过 Azure Portal > Subscriptions > Usage + quotas 申请提高配额

---

## 工具

### architecture_designer.py

根据需求生成架构模式建议。

```bash
python scripts/architecture_designer.py \
  --app-type web_app \
  --users 50000 \
  --requirements '{"budget_monthly_usd": 1000, "compliance": ["HIPAA"]}' \
  --json
```

**输入：** 应用程序类型、预期用户数、JSON 需求
**输出：** 推荐的模式、服务栈、成本估算、优缺点

### cost_optimizer.py

分析 Azure 资源配置以节省成本。

```bash
python scripts/cost_optimizer.py --config resources.json --json
```

**输入：** 包含当前 Azure 资源清单的 JSON 文件
**输出：** 针对以下方面的建议：
- 移除闲置资源
- 合理调整 VM 和数据库规模
- 购买预留实例
- 转换存储层级
- 未使用的公共 IP 和负载均衡器

### bicep_generator.py

根据架构类型生成 Bicep 模板脚手架。

```bash
python scripts/bicep_generator.py --arch-type microservices --output main.bicep
```

**输出：** 可用于生产环境的 Bicep 模板，包含：
- 托管标识（无需密码）
- Key Vault 集成
- Azure Monitor 的诊断设置
- 网络安全组
- 用于成本分摊的标记

---

## 快速入门

### Web 应用架构（< $100/月）

```
Ask: "Design an Azure web app for a startup with 5000 users"

Result:
- App Service (B1 Linux) for the application
- Azure SQL Serverless for relational data
- Azure Blob Storage for static assets
- Front Door (free tier) for CDN and routing
- Key Vault for secrets
- Estimated: $40-80/month
```

### AKS 上的微服务（$500-2000/月）

```
Ask: "Design a microservices architecture on Azure for a SaaS platform with 50k users"

Result:
- AKS cluster with 3 node pools (system, app, jobs)
- API Management for gateway and rate limiting
- Cosmos DB for multi-model data
- Service Bus for async messaging
- Azure Monitor + Application Insights for observability
- Multi-zone deployment
```

### 无服务器事件驱动架构（< $200/月）

```
Ask: "Design an event-driven backend for processing orders"

Result:
- Azure Functions (Consumption plan) for compute
- Event Grid for event routing
- Service Bus for reliable messaging
- Cosmos DB for order data
- Application Insights for monitoring
- Estimated: $30-150/month depending on volume
```

### 数据管道（每月 $300-1500）

```
Ask: "Design a data pipeline for ingesting 10M events/day"

Result:
- Event Hubs for ingestion
- Stream Analytics or Functions for processing
- Data Lake Storage Gen2 for raw data
- Synapse Analytics for warehouse
- Power BI for dashboards
```

---

## 输入要求

请提供以下架构设计所需的详细信息：

| 要求 | 描述 | 示例 |
|-------------|-------------|---------|
| 应用类型 | 你要构建的内容 | SaaS 平台、移动后端 |
| 预期规模 | 用户数、每秒请求数 | 1 万用户、100 RPS |
| 预算 | Azure 每月限额 | 每月最高 $500 |
| 团队情况 | 规模、Azure 经验 | 3 名开发者、中等水平 |
| 合规性 | 监管要求 | HIPAA、GDPR、SOC 2 |
| 可用性 | 正常运行时间要求 | 99.9% SLA、1 小时 RPO |

**JSON 格式：**

```json
{
  "application_type": "saas_platform",
  "expected_users": 10000,
  "requests_per_second": 100,
  "budget_monthly_usd": 500,
  "team_size": 3,
  "azure_experience": "intermediate",
  "compliance": ["SOC2"],
  "availability_sla": "99.9%"
}
```

---

## 反模式

| 反模式 | 失败原因 | 应改为 |
|---|---|---|
| 对新项目使用 ARM JSON 模板 | 冗长、难以阅读、不支持模块 | 使用 Bicep——可编译为 ARM，语法更简洁 |
| 将机密存储在应用设置中 | 机密在门户中可见，且无法轮换 | 在应用设置中使用 Key Vault 引用 |
| 使用单个大型 AKS 节点池 | 无法针对不同工作负载进行优化 | 使用多个节点池：系统、应用、作业 |
| 在 PaaS 服务上使用公共终结点 | 扩大了暴露的攻击面 | 使用专用终结点和 VNet 集成 |
| “以防万一”而过度预配 | 从第一个月起就浪费预算 | 从小规模开始，使用自动缩放，并每月适当调整规模 |
| 所有内容共用资源组 | 爆炸半径过大，RBAC 管理混乱 | 每个环境中的每个工作负载使用一个资源组 |
| 没有标记策略 | 无法跟踪成本或所有权 | 标记：环境、所有者、成本中心、应用名称 |
| 使用经典资源 | 已弃用且功能有限 | 仅使用 ARM/Bicep 资源 |

---

## 输出格式

### 架构设计

- 模式建议及其理由
- 服务栈图（ASCII）
- 每月成本估算及权衡分析

### IaC 模板

- **Bicep**：推荐——第一方支持、支持模块、语法简洁
- **ARM JSON**：需要时从 Bicep 生成
- **Terraform HCL**：使用 azurerm provider，兼容多云

### 成本分析

- 当前支出明细及优化建议
- 按优先级划分的行动列表（高/中/低）和实施检查清单

---

## 交叉引用

| Skill | 关系 |
|-------|-------------|
| `engineering-team/aws-solution-architect` | AWS 对应 Skill——采用相同的 6 步工作流，但使用不同的服务 |
| `engineering-team/gcp-cloud-architect` | GCP 对应 Skill——补全三大云平台 |
| `engineering-team/senior-devops` | 更广泛的 DevOps 范畴——流水线、监控、容器化 |
| `engineering/terraform-patterns` | IaC 实现——用于面向 Azure 的 Terraform 模块 |
| `engineering/ci-cd-pipeline-builder` | 流水线构建——自动化 Azure DevOps 和 GitHub Actions |

---

## 参考文档

| 文档 | 内容 |
|----------|----------|
| `references/architecture_patterns.md` | 5 种模式：Web 应用、微服务/AKS、无服务器、数据管道、多区域 |
| `references/service_selection.md` | 计算、数据库、存储、消息传递和网络的决策矩阵 |
| `references/best_practices.md` | 命名约定、标记、RBAC、网络安全、监控、灾难恢复 |