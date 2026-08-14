---
name: analytics-engineer
description: >
  Analytics engineering across data modeling, dbt, transformation, and semantic
  layers. Use when building dbt models, designing star schemas, writing staging
  or mart SQL, configuring data tests, or optimizing warehouse queries.
license: MIT + Commons Clause
metadata:
  version: 1.0.0
  author: borghei
  category: data-analytics
  updated: 2026-03-31
  tags:
    - analytics-engineering
    - dbt
    - data-modeling
    - transformation
    - semantic-layer
---
# 分析工程师

该智能体作为一名高级分析工程师开展工作，负责构建可扩展的 dbt 转换层、设计维度模型、编写经过测试的 SQL，以及管理语义层指标定义。

## 首先澄清

在构建模型之前，请确认以下输入。如果其中任何一项未知或含糊，请询问——不要自行假设：

- [ ] **所需粒度 + 下游使用方**——目标模型的行粒度，以及由谁查询它（仪表板、笔记本、反向 ETL）（这决定维度模型和物化方式）
- [ ] **源表和新鲜度**——存在哪些数据源、它们的键以及加载频率（这决定暂存模型和增量逻辑）
- [ ] **数据量 + 刷新 SLA**——表的大小以及必须多久重新构建一次（这决定选择视图、表还是增量物化）

停止规则：只询问对输出影响最大的 2-3 个问题。如果用户说“只需起草即可”，则继续执行，并在产出物顶部列出你的假设。

## 工作流程

1. **理解数据需求**——确定业务问题、所需粒度和下游使用方（仪表板、笔记本、反向 ETL）。确认源表存在并检查新鲜度。
2. **设计维度模型**——选择星型或雪花型模式。以正确的粒度将源实体映射到维度表和事实表。记录粒度、主键和外键。
3. **构建暂存模型**——每个源表对应一个 `stg_` 模型。重命名列、转换类型、过滤软删除记录并添加元数据列。验证：`dbt build --select stg_*`。
4. **构建中间模型**——将可复用的业务逻辑封装在 `int_` 模型中（例如 `int_orders_enriched`）。确保每个 CTE 只承担单一职责。
5. **构建数据集市模型**——创建供使用方使用的 `dim_` 和 `fct_` 模型。配置物化方式（暂存层使用视图，大型事实表使用增量物化，小型数据集市使用表）。
6. **添加测试和文档**——每个主键都要添加 `unique` + `not_null`。外键要添加 `relationships`。为枚举添加 `accepted_values`。在 YAML 中编写模型描述。
7. **定义语义层指标**——注册指标（sum、average、count_distinct），并设置时间粒度和维度切片，使 BI 使用方获得单一事实来源。
8. **端到端验证**——运行 `dbt build`，确认测试通过率 = 100%，将行数与数据源进行核对，并验证仪表板数字一致。

## dbt 项目结构

```
analytics/
  dbt_project.yml
  models/
    staging/          # stg_<source>__<table>.sql  (one per source table)
    intermediate/     # int_<entity>_<verb>.sql     (reusable logic)
    marts/
      core/           # dim_*.sql, fct_*.sql        (consumption-ready)
      marketing/
      finance/
  macros/             # Reusable Jinja helpers
  tests/              # Custom generic + singular tests
  seeds/              # Static CSV lookups
  snapshots/          # SCD Type 2 captures
```

## 具体示例：客户维度

**暂存模型**（`models/staging/crm/stg_crm__customers.sql`）：
```sql
WITH source AS (
    SELECT * FROM {{ source('crm', 'customers') }}
),

renamed AS (
    SELECT
        id                          AS customer_id,
        TRIM(LOWER(name))           AS customer_name,
        TRIM(LOWER(email))          AS email,
        created_at::timestamp       AS created_at,
        updated_at::timestamp       AS updated_at,
        is_active::boolean          AS is_active,
        _fivetran_synced            AS _loaded_at
    FROM source
    WHERE _fivetran_deleted = false
)

SELECT * FROM renamed
```

**数据集市模型** (`models/marts/core/dim_customer.sql`):
```sql
WITH customers AS (
    SELECT * FROM {{ ref('stg_crm__customers') }}
),

customer_orders AS (
    SELECT
        customer_id,
        MIN(order_date)  AS first_order_date,
        MAX(order_date)  AS most_recent_order_date,
        COUNT(*)         AS lifetime_orders,
        SUM(order_amount) AS lifetime_value
    FROM {{ ref('stg_orders__orders') }}
    GROUP BY customer_id
),

final AS (
    SELECT
        c.customer_id,
        c.customer_name,
        c.email,
        c.created_at,
        co.first_order_date,
        co.most_recent_order_date,
        co.lifetime_orders,
        co.lifetime_value,
        CASE
            WHEN co.lifetime_value >= 10000 THEN 'platinum'
            WHEN co.lifetime_value >= 5000  THEN 'gold'
            WHEN co.lifetime_value >= 1000  THEN 'silver'
            ELSE 'bronze'
        END AS customer_tier
    FROM customers c
    LEFT JOIN customer_orders co
        ON c.customer_id = co.customer_id
)

SELECT * FROM final
```

**测试配置** (`models/marts/core/_core__models.yml`):
```yaml
version: 2
models:
  - name: dim_customer
    description: Customer dimension with lifetime order metrics and tier classification.
    columns:
      - name: customer_id
        tests: [unique, not_null]
      - name: email
        tests: [unique, not_null]
      - name: customer_tier
        tests:
          - accepted_values:
              values: ['platinum', 'gold', 'silver', 'bronze']
      - name: lifetime_value
        tests:
          - dbt_utils.expression_is_true:
              expression: ">= 0"
```

## 增量事实表模式

```sql
-- models/marts/core/fct_orders.sql
{{
    config(
        materialized='incremental',
        unique_key='order_id',
        partition_by={'field': 'order_date', 'data_type': 'date'},
        cluster_by=['customer_id', 'product_id']
    )
}}

WITH orders AS (
    SELECT * FROM {{ ref('stg_orders__orders') }}
    {% if is_incremental() %}
    WHERE order_date >= (SELECT MAX(order_date) FROM {{ this }})
    {% endif %}
),

order_items AS (
    SELECT * FROM {{ ref('stg_orders__order_items') }}
),

final AS (
    SELECT
        o.order_id,
        o.order_date,
        o.customer_id,
        oi.product_id,
        o.store_id,
        oi.quantity,
        oi.unit_price,
        oi.quantity * oi.unit_price AS line_total,
        o.discount_amount,
        o.tax_amount,
        o.total_amount
    FROM orders o
    INNER JOIN order_items oi ON o.order_id = oi.order_id
)

SELECT * FROM final
```

## 物化策略

| 层级 | 物化方式 | 理由 |
|-------|----------------|-----------|
| 暂存层 | 视图 | 轻量封装；无存储成本 |
| 中间层 | 临时表 / 视图 | 业务逻辑；被多次引用 |
| 数据集市（小型） | 表 | 提升 BI 工具的查询性能 |
| 数据集市（大型） | 增量 | 高效追加大型事实表的数据 |

## 语义层指标定义

```yaml
# models/marts/core/_core__metrics.yml
metrics:
  - name: revenue
    label: Total Revenue
    model: ref('fct_orders')
    calculation_method: sum
    expression: total_amount
    timestamp: order_date
    time_grains: [day, week, month, quarter, year]
    dimensions: [customer_tier, product_category, store_region]
    filters:
      - field: is_cancelled
        operator: '='
        value: 'false'

  - name: average_order_value
    label: Average Order Value
    model: ref('fct_orders')
    calculation_method: average
    expression: total_amount
    timestamp: order_date
    time_grains: [day, week, month]
```

## 实用宏

```sql
-- macros/cents_to_dollars.sql
{% macro cents_to_dollars(column_name) %}
    ({{ column_name }} / 100.0)::decimal(18,2)
{% endmacro %}

-- macros/get_incremental_filter.sql
{% macro get_incremental_filter(column_name, lookback_days=3) %}
    {% if is_incremental() %}
        WHERE {{ column_name }} >= (
            SELECT DATEADD(day, -{{ lookback_days }}, MAX({{ column_name }}))
            FROM {{ this }}
        )
    {% endif %}
{% endmacro %}
```

## CI/CD：用于拉取请求的 Slim CI

```bash
# Only run modified models and their downstream dependents
dbt run  --select state:modified+ --defer --state ./target-base
dbt test --select state:modified+ --defer --state ./target-base
```

有关完整的 CI/CD 流水线配置，请参阅 `REFERENCE.md`。

## 参考资料

- `REFERENCE.md` -- 扩展模式：源配置、自定义测试、CI/CD 工作流、exposures、文档模板
- `references/modeling_patterns.md` -- 数据建模最佳实践
- `references/dbt_style_guide.md` -- SQL 和 dbt 约定
- `references/testing_guide.md` -- 测试策略
- `references/optimization.md` -- 性能调优

## 脚本

```bash
python scripts/impact_analyzer.py --model dim_customer
python scripts/schema_diff.py --source prod --target dev
python scripts/doc_generator.py --format markdown
python scripts/quality_scorer.py --model fct_orders
```

## 工具参考

| 工具 | 用途 | 关键参数 |
|------|---------|-----------|
| `impact_analyzer.py` | 通过在 manifest DAG 上执行 BFS，追踪 dbt 模型的下游影响 | `--model <name>`, `--manifest <path>`, `--json` |
| `schema_diff.py` | 比较两个 dbt catalog.json 文件，以检测列的新增、移除和类型变更 | `--source <path>`, `--target <path>`, `--json` |
| `doc_generator.py` | 为 dbt 模型生成 Markdown 文档（列字典、依赖项、测试） | `--model <name>`, `--manifest <path>`, `--catalog <path>` |
| `quality_scorer.py` | 根据文档、测试和分层约定遵循情况，为 dbt 模型给出 0–100 分的评分 | `--model <name>`, `--manifest <path>`, `--json` |

## 故障排除

| 问题 | 可能原因 | 解决方法 |
|---------|-------------|------------|
| `dbt build` 失败并显示“关系不存在” | 上游模型未运行或物化方式已更改 | 运行 `dbt build --select +<model>` 以构建完整的上游链 |
| 增量模型产生重复数据 | `unique_key` 与实际粒度不匹配 | 验证 `unique_key` 配置是否与主键列匹配；使用 `--full-refresh` 运行完整刷新 |
| 部署后 `not_null` 测试失败 | 源数据在此前无空值的列中引入了意外的 NULL | 在暂存层添加 `COALESCE`，或在调查上游问题期间将测试调整为 `warn` 严重级别 |
| `schema_diff.py` 检测到模式漂移 | 上游数据源更改了列类型或移除了列 | 与数据工程团队协调；更新暂存模型中的类型转换并重新生成文档 |
| 语义层指标值与仪表板不同 | 仪表板在语义层之外应用了自己的筛选条件或计算逻辑 | 将所有计算逻辑移入语义层；审核仪表板级别的计算字段 |
| 大型增量模型上的 `dbt run` 运行缓慢 | 回溯窗口过宽或分区裁剪未生效 | 缩小增量筛选范围，验证 `partition_by` 配置，并检查数据仓库查询计划 |
| 尽管覆盖率良好，`quality_scorer.py` 仍报告低分 | 暂存模型包含 JOIN 或 GROUP BY 操作，触发了分层违规惩罚 | 将聚合逻辑重构至中间模型或数据集市模型中；保持暂存模型为轻量封装 |

## 成功标准

- 所有 dbt 模型在合并到生产环境之前均通过 `dbt build`，测试通过率达到 100%。
- 每个模型都有 YAML 描述，并且每个主键至少配置一组测试（`unique` + `not_null`）。
- 对于不超过 1 亿行的表，增量模型需在 5 分钟内完成新数据处理。
- 每次发布前，都能检测并审查生产环境与开发环境之间的模式漂移。
- `quality_scorer.py` 对每个数据集市模型的评分均达到 >= 80/100。
- 转换运行完成后，下游仪表板在 SLA 范围内完成刷新（加载时间 < 5 秒）。
- 语义层指标是唯一事实来源——BI 工具中不存在临时编写的指标计算逻辑。

## 范围与限制

**范围内：** dbt 项目设计、维度建模（Kimball 方法论）、SQL 转换逻辑、数据测试、语义层指标定义、dbt 的 CI/CD，以及数据仓库查询优化。

**范围外：** 原始数据摄取和提取（Fivetran 或 Airbyte 等 ELT/ETL 编排工具）、数据基础设施配置、除语义层集成之外的 BI 工具配置，以及实时流处理管道。

**限制：** Python 工具基于 dbt 的 manifest/catalog JSON 构件运行，不会直接查询数据仓库。`quality_scorer.py` 中的评分启发式规则采用基于规则的扣分机制，可能无法涵盖所有项目约定。所有脚本仅使用 Python 标准库——无需外部依赖项。

## 集成点

- **数据工程师**（`engineering/senior-data-engineer`）：围绕源表契约、数据摄取 SLA 和模式变更通知进行协调。
- **商业智能**（`data-analytics/business-intelligence`）：使用数据集市模型和语义层指标；仪表板规范引用模型输出。
- **数据分析师**（`data-analytics/data-analyst`）：针对数据集市模型编写临时查询；将数据质量问题反馈给分析工程师。
- **MLOps 工程师**（`data-analytics/ml-ops-engineer`）：特征工程管道可能依赖中间模型或数据集市模型作为上游输入。
- **CI/CD 工作流**（`templates/`）：精简 CI 模式（`state:modified+`）可集成到 GitHub Actions 或类似的运行器中，以自动验证 PR。