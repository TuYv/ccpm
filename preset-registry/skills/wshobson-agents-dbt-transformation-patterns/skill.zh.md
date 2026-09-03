---
name: dbt-transformation-patterns
description: Master dbt (data build tool) for analytics engineering with model organization, testing, documentation, and incremental strategies. Use when building data transformations, creating data models, or implementing analytics engineering best practices.
---
# dbt 转换模式

适用于生产环境的 dbt（data build tool）模式，涵盖模型组织、测试策略、文档编写以及增量处理。

## 何时使用此技能

- 使用 dbt 构建数据转换管道
- 将模型组织为 staging（暂存）、intermediate（中间）和 marts（集市）层
- 实现数据质量测试
- 为大型数据集创建增量模型
- 记录数据模型与数据血缘
- 搭建 dbt 项目结构

## 核心概念

### 1. 模型分层（奖章架构）

```
sources/          Raw data definitions
    ↓
staging/          1:1 with source, light cleaning
    ↓
intermediate/     Business logic, joins, aggregations
    ↓
marts/            Final analytics tables
```

### 2. 命名约定

| 层级         | 前缀           | 示例                          |
| ------------ | -------------- | ----------------------------- |
| Staging      | `stg_`         | `stg_stripe__payments`        |
| Intermediate | `int_`         | `int_payments_pivoted`        |
| Marts        | `dim_`, `fct_` | `dim_customers`, `fct_orders` |

## 快速开始

```yaml
# dbt_project.yml
name: "analytics"
version: "1.0.0"
profile: "analytics"

model-paths: ["models"]
analysis-paths: ["analyses"]
test-paths: ["tests"]
seed-paths: ["seeds"]
macro-paths: ["macros"]

vars:
  start_date: "2020-01-01"

models:
  analytics:
    staging:
      +materialized: view
      +schema: staging
    intermediate:
      +materialized: ephemeral
    marts:
      +materialized: table
      +schema: analytics
```

```
# Project structure
models/
├── staging/
│   ├── stripe/
│   │   ├── _stripe__sources.yml
│   │   ├── _stripe__models.yml
│   │   ├── stg_stripe__customers.sql
│   │   └── stg_stripe__payments.sql
│   └── shopify/
│       ├── _shopify__sources.yml
│       └── stg_shopify__orders.sql
├── intermediate/
│   └── finance/
│       └── int_payments_pivoted.sql
└── marts/
    ├── core/
    │   ├── _core__models.yml
    │   ├── dim_customers.sql
    │   └── fct_orders.sql
    └── finance/
        └── fct_revenue.sql
```

## 详细模式与实战示例

详细的模式文档位于 `references/details.md`。当上方的导航层级内容不够用时，请阅读该文件。

## 最佳实践

### 推荐做法

- **使用 staging 层** - 数据清洗一次，处处可用
- **积极测试** - 非空、唯一、关系测试
- **为一切编写文档** - 列描述、模型描述
- **使用增量模型** - 适用于超过 100 万行的表
- **版本控制** - 将 dbt 项目纳入 Git 管理

### 避免做法

- **不要跳过 staging 层** - 从原始数据直接到 mart 是技术债
- **不要硬编码日期** - 使用 `{{ var('start_date') }}`
- **不要重复逻辑** - 提取到宏中
- **不要在生产环境测试** - 使用 dev target
- **不要忽视数据新鲜度** - 监控源数据
