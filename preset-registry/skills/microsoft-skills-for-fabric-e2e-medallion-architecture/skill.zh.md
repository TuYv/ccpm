---
name: e2e-medallion-architecture
description: >
  Plan and implement end-to-end Microsoft Fabric data platforms and Medallion Architecture (Bronze/Silver/Gold)
  lakehouse patterns using PySpark, Delta Lake, Lakehouse/Warehouse items, Fabric Pipelines, and semantic-model handoff.
  Use for multi-layer workspaces, ingestion-to-analytics pipelines, Bronze-to-Silver-to-Gold notebook orchestration,
  layer-specific Fabric Spark tuning, and Materialized Lake View versus notebook decisions for Silver and Gold.
  For natural-language questions over existing Power BI report data, use `fabriciq`.
  Triggers: "medallion architecture", "bronze silver gold", "lakehouse layers", "e2e data pipeline",
  "end-to-end Fabric data platform", "medallion Spark tuning", "Silver Gold MLV or notebooks".
---
> **遥测 — 强制要求。** 每个 `api.fabric.microsoft.com` 调用都必须携带
> `x-ms-fabric-skill: e2e-medallion-architecture`（`az rest`：`--headers "x-ms-fabric-skill=e2e-medallion-architecture"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了此项，但仍必须添加。

> **关键说明**
> 1. 要通过工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要通过工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 筛选

# 端到端奖牌架构

## 前置知识

请阅读以下配套文档——它们包含此技能所依赖的基础背景知识：

- [COMMON-CORE.md](../../common/COMMON-CORE.md) — Fabric REST API 模式、身份验证、令牌受众、项目发现
- [COMMON-CLI.md](../../common/COMMON-CLI.md) — `az rest`、`az login`、令牌获取、通过 CLI 使用 Fabric REST
- [SPARK-AUTHORING-CORE.md](../../common/SPARK-AUTHORING-CORE.md) — Notebook 部署、Lakehouse 创建、作业执行
- [notebook-api-operations.md](../spark-cli/references/authoring/resources/notebook-api-operations.md) — **创建 Notebook 时必读** — `.ipynb` 结构要求、单元格格式、`getDefinition`/`updateDefinition` 工作流

有关 Spark 特定的优化详情，请参阅 [data-engineering-patterns.md](../spark-cli/references/authoring/resources/data-engineering-patterns.md)。

---

## 架构概述

**奖牌架构**是一种包含三个渐进式层级的数据 Lakehouse 模式：

| 层级 | 用途 | 优化特征 | 使用场景 |
|-------|---------|---------------------|----------|
| **铜牌层**（原始） | 完全按照接收时的原样存放原始数据 | 写入优化、仅追加、按摄取日期分区 | 审计跟踪、重新处理、血缘追踪 |
| **银牌层**（已清洗） | 去重、验证且标准化的数据 | 读写均衡、按业务日期分区 | 特征工程、运营报表 |
| **金牌层**（已聚合） | 面向分析的预计算指标 | 读取优化（ZORDER、压缩）、按月/年分区 | Power BI 报表、仪表板、通过 SQL 终结点进行即席分析 |

- **铜牌层**：读时模式——模式灵活，Delta 时间旅行支持审计和回滚
- **银牌层**：模式强制执行——拒绝不符合要求的写入；当数据源发生变化时，使用 `mergeSchema` 处理模式演变
- **金牌层**：严格的模式治理——仅包含经过整理且获得业务认可的数据集

---

## 必须/建议/避免

### 必须执行
- 根据是否支持启用模式来**选择 Lakehouse 架构**（请参阅 [infrastructure-orchestration.md](../spark-cli/references/authoring/resources/infrastructure-orchestration.md)）：
  - **首选：** 启用模式的 Lakehouse → 创建一个工作区和一个 Lakehouse，并在其中创建 `bronze`、`silver`、`gold` 模式
  - **旧版：** 未启用模式 → 为每个层级（铜牌层、银牌层、金牌层）创建单独的工作区，以实现治理和访问控制
- **使用 Livy API 创建模式和表**——要在启用模式的 Lakehouse 中创建模式和表，请通过 Livy 会话提交 Spark SQL 语句（`POST /livyApi/versions/2023-12-01/sessions` → `POST .../statements`）。这是在 Fabric Lakehouse 中以编程方式通过 REST 执行 DDL 操作（CREATE SCHEMA、CREATE TABLE）的唯一路径。
- 在铜牌层中添加**元数据列**：摄取时间戳、源文件、批次 ID
- 在铜牌层到银牌层的转换中应用**数据质量规则**（去重、空值处理、范围验证）
- 所有奖牌层表均使用 **Delta Lake 格式**
- 在银牌层/金牌层写入中使用**分区感知覆盖**，避免重新处理未发生变化的数据
- 在每一层之后都包含**验证步骤**（行数、模式检查、异常检测）
- 通过 REST API 创建 Notebook 时，遵循 [notebook-api-operations.md](../spark-cli/references/authoring/resources/notebook-api-operations.md#ipynb-validation--fabric-nuances) 中的 **`.ipynb` 验证和 Fabric 注意事项**——每个代码单元格都必须包含 `"outputs": []` 和 `"execution_count": null`
- **完成完整的端到端流程**——不要在创建 Notebook 后停止；除非用户明确要求部分设置，否则始终需要绑定 Lakehouse、按顺序执行 Notebook（铜牌层 → 银牌层 → 金牌层）、验证结果，并将 Power BI 连接到金牌层
- 在每个 MLV 与 Notebook 的对比建议中，都要说明 MLV 需要**启用模式的 Lakehouse**。将 MLV 定义和增量刷新审核移交给 `spark-cli` **authoring** 模式；将计划、刷新、监控和故障诊断移交给 `spark-cli` **mlv** 模式。
- 对于定期 MLV 刷新，请提供确切的交互路径 **Lakehouse → 具体化 Lake 视图 → 管理 → 计划**。对于自动化，请使用 `POST /workspaces/{workspaceId}/lakehouses/{lakehouseId}/jobs/refreshMaterializedLakeViews/schedules`；绝不要虚构 `/mlvRefreshSchedules`，也不要通过 Notebook 计划来执行定期刷新。

### 推荐
- 优先采用增量处理（水印模式），而不是全量刷新
- 每一层使用独立笔记本，以便进行独立测试和调试
- 对 Gold 表中经常筛选的列使用 ZORDER
- 在 Silver 和 Gold 层写入后运行 OPTIMIZE
- 使用特定于环境的 Spark 配置（Bronze 侧重写入、Silver 兼顾读写、Gold 侧重读取）
- 使用 OneLake 快捷方式向使用方工作区公开 Gold 数据，而不产生重复副本
- 明确各层的所有权：工程师负责 Bronze/Silver，分析师负责 Gold
- 使用 Fabric Variable Libraries 集中管理各层的路径和配置
- 对具有中等/高治理要求的场景使用多工作区部署模式（Bronze/Silver/Gold 位于不同的工作区）
- 当转换可以用 Spark SQL 表达且能受益于声明式刷新语义时，对 Silver/Gold 表使用物化湖视图（MLV）。请参阅 [spark-cli — 物化湖视图模式](../spark-cli/references/authoring/resources/materialized-lake-view-patterns.md)和 [MLV 增量刷新模式](../spark-cli/references/authoring/resources/mlv-incremental-refresh-patterns.md)。
- 将“物化视图”“Spark 物化视图”和“MLV”视为同一项 Fabric 功能。

### 避免
- **在不使用架构的情况下将所有层存储在单个湖屋中** — 不支持架构的湖屋需要使用笔记本初始化单元格或 Environment 配置来启用 OneLake Spark Catalog，才能使用 RLS/CLS 和 MLV。如果架构不可用，请使用独立湖屋进行隔离。
- **在支持架构的湖屋可用时创建 3 个独立湖屋** — 应改为在一个湖屋内使用架构（更简洁，无需样板式初始化单元格，并且 MLV 跨架构转换的效率更高）
- 跳过 Silver 层，直接从 Bronze 进入 Gold
- 对工作区 ID、湖屋 ID 或 FQDN 进行硬编码 — 应通过 REST API 发现
- 在 Bronze 表上使用不带 LIMIT 的 SELECT *（这些表会无限增长）
- 在未检查下游依赖项的情况下运行 VACUUM
- 在奖牌式架构的各层之间串联 OneLake 快捷方式（Bronze→Silver→Gold）— 每一层都必须进行物理物化，以支持沿袭关系和治理
- 将完整实现代码复制到技能中 — 应引导 LLM 生成代码
- 直接在 Spark 中读取**外部 HTTP/HTTPS URL** — Fabric Spark 无法访问任意外部 URL；应先将数据放入湖屋的 `Files/` 中（通过 `curl`、OneLake API 或 Fabric 管道 Copy 活动），然后从湖屋路径读取
- 通过 REST API 创建笔记本时**不验证 `.ipynb` 结构** — 代码单元格缺少 `execution_count: null` 或 `outputs: []` 会导致无提示失败或出现“Job instance failed without detail error”

---

## 工作区设置指南

设置奖牌式工作区时，应先选择架构模式（详细指南请参阅 [infrastructure-orchestration.md](../spark-cli/references/authoring/resources/infrastructure-orchestration.md)）：

### 选项 A：支持架构的湖屋（首选）

1. **创建单个工作区**：`{project}-{env}`
2. **创建一个带架构的湖屋**：`{project}_lakehouse`
3. **在湖屋内创建架构**：
   - 用于原始数据引入的 `bronze` 架构
   - 用于已清理/已验证数据的 `silver` 架构
   - 用于聚合分析数据的 `gold` 架构
4. **选择转换方法**：
   - **选项 4a：** 每一层使用笔记本（PySpark 或 Spark SQL 转换）
   - **选项 4b：** 使用物化湖视图（Spark SQL）进行支持增量刷新的声明式转换（当查询符合 IR 条件时）— 请参阅 [materialized-lake-view-patterns.md](../spark-cli/references/authoring/resources/materialized-lake-view-patterns.md) 和 [mlv-incremental-refresh-patterns.md](../spark-cli/references/authoring/resources/mlv-incremental-refresh-patterns.md)
   - **注意：** PySpark MLV 确实存在，但仅使用全量刷新（不支持增量刷新）— 当需要 UDF/复杂 Python 逻辑时使用
   - **MLV 优势：** 对于支持架构的湖屋，OneLake Spark Catalog 会**自动启用** — MLV 可以开箱即用，无需笔记本初始化单元格或 Environment 配置
5. **RBAC**（可选）：在架构内使用行级安全性和列掩码，以实现细粒度访问控制（也需要 OneLake Spark Catalog）

### 选项 B：独立 Lakehouse（旧版）

1. **创建三个工作区**：
   - `{project}-bronze-{env}`
   - `{project}-silver-{env}`
   - `{project}-gold-{env}`
2. **在每个工作区中创建一个 Lakehouse**：
   - Bronze 工作区 → `{project}_bronze` Lakehouse
   - Silver 工作区 → `{project}_silver` Lakehouse
   - Gold 工作区 → `{project}_gold` Lakehouse
3. **按层级工作区分配 RBAC**：
   - Bronze：摄取/工程写入权限
   - Silver：工程/数据质量权限
   - Gold：分析/BI 使用者访问权限，并实施更严格的数据整理控制
4. **为非架构 Lakehouse 启用 OneLake Spark Catalog**（RLS/CLS 和基于目录的访问模式需要此配置）：
   - **首选方式：**在 Environment 中设置 `spark.sql.fabric.catalog.enable-schemaless-lakehouses=true`，并将其附加到笔记本。
   - **替代方式：**省略笔记本的默认 Lakehouse 绑定。使用由四部分组成的完全限定引用（`workspace.lakehouse.schema.table`）。未设置默认 Lakehouse 时，OneLake Spark Catalog 会自动启用。
   - **替代方式（内部/不受支持）：**将以下内容添加为每个笔记本的**第一个单元格**：
   ```python
   %%pyspark
   !echo "spark.sql.fabric.catalog.enable-schemaless-lakehouses=true" >> /home/trusted-service-user/.trident-context
   ```
   - **⚠️ 注意：**此解决方法使用了可能会在未来 Fabric 版本中发生变化的内部运行时配置路径。为了获得稳定且有正式文档支持的 OneLake Spark Catalog，**优先使用已启用架构的 Lakehouse**。
   - 使用此配置后，非架构 Lakehouse 支持：
     - ✅ 行级安全性（RLS）和列级安全性（CLS）
   - **注意：**MLV 需要已启用架构的 Lakehouse（选项 A）。对于非架构 Lakehouse，请使用包含 Delta 表的笔记本。

### 通用步骤（两个选项均适用）

完成上述选项 A 或选项 B 后，执行以下步骤：

1. **为每一层创建笔记本**（每个转换阶段一个）— 遵循 `.ipynb` 验证要求和 Fabric 特有注意事项
2. **将每个笔记本绑定到其 Lakehouse** — 使用正确的 Lakehouse ID 设置 `metadata.dependencies.lakehouse`（请参阅 [notebook-api-operations.md § 默认 Lakehouse 绑定](../spark-cli/references/authoring/resources/notebook-api-operations.md#default-lakehouse-binding)）：
   - 选项 A：所有笔记本 → 同一个 Lakehouse，使用架构前缀（`bronze.table`、`silver.table`）
   - 选项 B：
     - Bronze 笔记本 → Bronze 工作区/Lakehouse
     - Silver 笔记本 → Silver 工作区/Lakehouse（通过跨工作区 OneLake 访问/完全限定引用读取 Bronze）
     - Gold 笔记本 → Gold 工作区/Lakehouse（通过跨工作区访问读取 Silver）
3. **确认笔记本部署** — 检查 `updateDefinition` 是否返回 `Succeeded`；这足以确认内容和 Lakehouse 绑定已持久化。请勿调用 `getDefinition` 进行重新验证——它是异步 LRO，会增加不必要的延迟。
4. **按顺序执行笔记本** — 先执行 Bronze，再执行 Silver，最后执行 Gold — 使用 `POST .../jobs/instances?jobType=RunNotebook`，并在执行配置中提供正确的 `defaultLakehouse`（必须同时提供 `id` 和 `name`）
5. **将 Power BI 连接到 Gold 层** — 发现 Gold Lakehouse SQL 终结点，创建 Direct Lake 语义模型，并基于 Gold 汇总表创建包含可视化对象的报表（请参阅 [Gold 层 → Power BI 使用](#gold-layer--power-bi-consumption)）
6. **创建管道**，以编排 Bronze → Silver → Gold 流程并实现周期性执行

### 显式覆盖：单工作区

如果用户明确要求采用单工作区部署（例如 POC/小型团队/单体模式），请保持当前方法：

- 使用一个工作区，并分别设置 Bronze/Silver/Gold 湖仓
- 即使共享工作区，也要在逻辑上保持分层隔离
- 明确指出与多工作区设计相比在治理方面的权衡

按环境进行参数化：工作区名称后缀（`-dev`、`-prod`）、数据量（样本与完整数据）、容量 SKU，以及 Bronze 保留期限。

---

## Bronze 层 — 摄取模式

当用户请求将数据摄取到 Bronze 层时，引导 LLM：

1. **先将数据落地到湖仓**：外部数据必须先暂存到湖仓的 `Files/` 文件夹中，Spark 才能读取——可使用以下方式之一：
   - **Fabric Pipeline Copy 活动**（定期加载的首选方式）——连接到外部源（HTTP、FTP、数据库、云存储）并写入 OneLake
   - **OneLake API / `curl`**——通过 REST API 使用 `storage.azure.com` 令牌上传文件（参见 COMMON-CLI.md § OneLake 数据访问）
   - **OneLake Shortcut**——适用于已位于 Azure ADLS Gen2、S3 或其他 OneLake 位置的数据
   - **`notebookutils.fs`**——在笔记本中从已挂载的存储路径复制数据
   - ⚠️ **Fabric Spark 无法从任意 HTTP/HTTPS URL 读取数据**——`spark.read.format("csv").load("https://...")` 将会失败
2. **从湖仓路径读取**：数据进入 `Files/` 后，使用湖仓相对路径读取（例如，`spark.read.format("csv").load("Files/landing/daily/")`）
3. **添加元数据并写入**：添加跟踪列（摄取时间戳、源文件、批次 ID），写入名称具有描述性的 Delta 表，按摄取日期分区，并使用追加模式
4. **验证**：记录行数，验证架构结构，标记与历史模式相比存在的异常

---

## Silver 层 — 转换模式

当用户请求进行 Bronze 到 Silver 的转换时，引导 LLM：

- **质量规则**：根据自然键/复合键去重，筛除无效范围，处理空值（删除必填字段为空的记录，填充可选字段），验证逻辑约束
- **架构一致性**：采用 snake_case 列名、标准化数据类型以及派生列（持续时间、百分比、类别）
- **架构演进**：当源架构发生变化时，使用 `mergeSchema` 选项；协调 Gold 表和 Power BI 数据集的下游更新
- **写入策略**：按业务日期分区，采用分区感知的覆盖写入，写入后运行 OPTIMIZE，并记录处理前后的指标

---

## Gold 层 — 聚合模式

当用户请求 Gold 分析表时，引导 LLM 生成：

- **常见聚合**：每日/每周/每月汇总、维度分析（按位置、类别、类型）、随时间变化的趋势明细、需求模式（一天中的时段、一周中的星期几）
- **Spark 会话配置**——在执行任何写入操作**之前**，在 Gold 笔记本中设置以下属性：
  ```python
  spark.conf.set("spark.sql.parquet.vorder.default", "true")
  spark.conf.set("spark.databricks.delta.optimizeWrite.enabled", "true")
  spark.conf.set("spark.databricks.delta.optimizeWrite.binSize", "1g")
  ```
  - **V-Order**（`vorder.default`）——将 Fabric 的列式排序优化应用于所有 Parquet 文件，显著提升 Direct Lake 和 SQL 终结点的读取性能
  - **Optimize Write**（`optimizeWrite.enabled`）——将小分区合并为大小最优的文件（每个 `binSize` 的目标大小约为 1 GB），从而减少文件数量并提高扫描效率
- **优化**：对筛选列执行 ZORDER，写入后运行 OPTIMIZE，并预聚合指标以避免运行时计算

---

## 端到端执行流程

在端到端设置奖牌架构时，LLM 在创建笔记本并部署代码后**不得停止**。完整生命周期如下：

```
Create Resources → Deploy Content → Bind Lakehouses → Execute → Verify Results
```

### 分步说明

1. **创建各层工作区和湖仓（默认）** — 每层（Bronze、Silver、Gold）分别创建一个工作区和一个湖仓；记录工作区 ID 和湖仓 ID
2. **创建笔记本** — 每层一个，并使用有效的 `.ipynb` 结构（参见 [notebook-api-operations.md](../spark-cli/references/authoring/resources/notebook-api-operations.md)）
3. **将湖仓绑定到每个笔记本** — 在 `.ipynb` 负载中包含 `metadata.dependencies.lakehouse`，其中包括：
   - `default_lakehouse`：目标湖仓 GUID
   - `default_lakehouse_name`：湖仓显示名称
   - `default_lakehouse_workspace_id`：工作区 GUID
4. **部署笔记本内容** — 使用 `updateDefinition` 和经过 Base64 编码的 `.ipynb` 负载（内容与湖仓绑定信息一起部署）
5. **确认部署** — 检查每个 `updateDefinition` LRO 是否返回 `Succeeded`；这已足够。不要调用 `getDefinition` 进行再次验证——它是异步 LRO，会显著增加每个笔记本的延迟。
6. **按顺序执行笔记本** — 使用 `POST .../jobs/instances?jobType=RunNotebook`：
   - 在 `executionData.configuration` 中传递同时包含 `id` 和 `name` 的 `defaultLakehouse`
   - 首先运行 Bronze → 轮询直至 `Completed` → 运行 Silver → 轮询 → 运行 Gold → 轮询
   - 提交前检查近期作业（防止重复——参见 SPARK-AUTHORING-CORE.md）
7. **验证结果** — 每个笔记本完成后，确认预期表已存在且行数合理
8. **将 Power BI 连接到 Gold** — 基于 Gold 汇总表创建语义模型和报表（参见 [Gold 层 → Power BI 使用](#gold-layer--power-bi-consumption)）

### 常见失败：在创建笔记本后停止

如果流程在部署笔记本代码后停止，而未进行绑定或执行：
- 笔记本将没有湖仓上下文 → `spark.sql()` 和相对路径（`Tables/`、`Files/`）会在运行时失败
- 用户看不到任何输出或结果——架构虽已设置完成，但从未经过测试
- 除非用户明确要求在某个特定步骤停止，否则**始终必须完成到第 7 步**

---

## Gold 层 → Power BI 使用

填充 Gold 表后，将其连接到 Power BI 以呈现分析结果。
使用 DirectLake 在 Gold 湖仓之上构建语义模型。


### 分步说明

1. **发现 Gold 湖仓 SQL 终结点** — 调用 `GET /v1/workspaces/{workspaceId}/lakehouses/{goldLakehouseId}`，并提取 `properties.sqlEndpointProperties.connectionString` 和 `provisioningStatus`；等待状态变为 `Success`
2. **通过 SQL 验证 Gold 表** — 使用 `sqlcmd` 连接到 SQL 终结点（参见 [COMMON-CLI.md § SQL / TDS 数据平面访问](../../common/COMMON-CLI.md#sql--tds-data-plane-access)），并确认目标表存在：
   ```sql
   SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'nyc_taxi_daily_summary'
   ```
3. **创建语义模型** — 使用 [semantic-model-authoring](../semantic-model-authoring/SKILL.md) 技能创建语义模型并部署 TMDL。通过 `POST /v1/workspaces/{workspaceId}/items` 创建，设置 `type: "SemanticModel"`，然后使用 TMDL 格式通过 `updateDefinition` 部署定义（参见 [ITEM-DEFINITIONS-CORE.md § SemanticModel](../../common/ITEM-DEFINITIONS-CORE.md#semanticmodel)）：
   - 模型必须引用 Gold 湖仓 SQL 终结点作为其数据源
   - 定义一个映射到 Gold 汇总表（例如 `nyc_taxi_daily_summary`）的表
   - 使用 **Direct Lake** 模式——该模式无需导入数据，即可直接连接到 OneLake 中的 Delta 表
   - 为你认为有意义的关键聚合添加度量值（例如 `Total Trips`、`Avg Fare`、`Total Revenue`、`Month over Month Growth`）
4. **创建 Power BI 报表** — 通过 `POST /v1/workspaces/{workspaceId}/items` 创建，设置 `type: "Report"`，然后使用 PBIR 格式通过 `updateDefinition` 部署定义（参见 [ITEM-DEFINITIONS-CORE.md § Report](../../common/ITEM-DEFINITIONS-CORE.md#report)）：
   - 通过 `definition.pbir` 引用第 3 步创建的语义模型
   - 至少定义一个页面，并包含基于 Gold 汇总表的视觉对象
   - 建议的视觉对象：折线图（每日趋势）、卡片（KPI 总计）、条形图（按类别）、表格（详细视图）
5. **验证端到端流程** — 使用 `semantic-model-authoring` 技能进行元数据发现，对语义模型运行 DAX 查询，并确认数据能够从 Gold 表流经语义模型并最终呈现在报表中

### 原则

- **动态发现 SQL 终结点** — 连接字符串位于湖屋响应的 `properties.sqlEndpointProperties.connectionString` 中；切勿将其硬编码
- **等待 SQL 终结点预配完成** — 连接前状态必须为 `Success`；新创建的湖屋可能需要数分钟才能完成预配
- **优先使用 Direct Lake 模式** — 避免数据重复；语义模型直接从 OneLake Delta 表读取数据
- **严格匹配表名和列名** — 语义模型表定义必须使用 Gold 湖屋中完全一致的 Delta 表名和列名
- **对于语义模型创作**（TMDL、刷新、权限），请交叉参考 [semantic-model-authoring](../semantic-model-authoring/SKILL.md) 技能
- **对于 DAX 查询验证**，请交叉参考 [semantic-model-authoring](../semantic-model-authoring/SKILL.md) 技能，了解用于验证的元数据发现和 DAX 查询。

---

## 流水线编排

当用户请求用于奖章式流程的流水线时，引导 LLM 按以下方式进行设计：

- **结构**：顺序活动（Bronze → Silver → Gold），每个活动等待前一个活动成功完成；相互独立的 Gold 聚合可以并行运行；包括验证和通知活动
- **参数化**：流水线级处理日期（默认为昨天），传递给所有笔记本；使用动态日期表达式
- **调度**：按日运行并与源刷新保持一致，基于水印进行增量处理，定期执行完整刷新以应用更正
- **错误处理**：对暂时性故障采用带退避机制的重试，对持续性故障发出警报，支持优雅降级（如果上游失败，下游使用之前的数据）

---

## 环境优化

**有关详细的 Spark 配置和优化策略，请参阅 [data-engineering-patterns.md](../spark-cli/references/authoring/resources/data-engineering-patterns.md)。**

| 层 | 配置特征 | 关键设置 |
|-------|---------|-------------|
| Bronze | 写入密集型 | 禁用 V-Order，启用 autoCompact，设置较大的目标文件大小，按 ingestion_date 分区 |
| Silver | 均衡型 | 启用 V-Order、自适应查询执行，按业务日期分区，对筛选列使用 ZORDER |
| Gold | 读取密集型 | V-Order（`spark.sql.parquet.vorder.default=true`）、优化写入（`optimizeWrite.enabled=true`、`binSize=1g`）、矢量化读取器、自适应执行、对所有筛选列使用 ZORDER、预聚合指标 |

---

## 示例

### 示例 1：设置奖章式工作区（默认）

**提示词**："为销售分析设置包含独立 Bronze、Silver 和 Gold 工作区的奖章式架构"

**LLM 应生成的内容**：用于执行以下操作的 REST API 调用：
1. 创建工作区：`sales-bronze-dev`、`sales-silver-dev`、`sales-gold-dev`
2. 在每个工作区中创建一个湖屋：`sales_bronze`、`sales_silver`、`sales_gold`
3. 按工作区/层分配 RBAC 角色

```bash
# Workspace creation (see COMMON-CLI.md for full patterns)
cat > /tmp/body.json << 'EOF'
{"displayName": "sales-analytics-dev"}
EOF
workspace_id=$(az rest --method post --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/workspaces" \
  --body @/tmp/body.json --query "id" --output tsv)

# Create Bronze lakehouse
cat > /tmp/body.json << 'EOF'
{"displayName": "sales_bronze", "type": "Lakehouse"}
EOF
az rest --method post --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/workspaces/$workspace_id/items" \
  --body @/tmp/body.json
```

### 示例 2：设计青铜层摄取

**提示词**："将每日 CSV 文件摄取到青铜层 Lakehouse，并添加元数据列"

**LLM 应生成的内容**：一个执行以下操作的 PySpark 笔记本：
1. 使用架构推断或显式架构读取源文件
2. 添加 `ingestion_timestamp`、`source_file`、`batch_id` 列
3. 写入按摄取日期分区的 Delta 表
4. 记录行数和验证指标

```python
# Bronze ingestion pattern (guide LLM to generate full implementation)
from pyspark.sql.functions import current_timestamp, input_file_name, lit
import uuid

batch_id = str(uuid.uuid4())
df = (spark.read.format("csv").option("header", True).load("/Files/landing/daily/")
      .withColumn("ingestion_timestamp", current_timestamp())
      .withColumn("source_file", input_file_name())
      .withColumn("batch_id", lit(batch_id)))
df.write.mode("append").partitionBy("ingestion_date").format("delta").saveAsTable("bronze.events_raw")
```

### 示例 3：青铜层到白银层的转换

**提示词**："清理青铜层数据：删除重复项、筛除无效记录、添加派生列并写入白银层"

**LLM 应生成的内容**：一个应用质量规则和架构一致性处理，并执行分区写入及优化的 PySpark 笔记本。

### 示例 4：端到端管道

**提示词**："创建一个管道，每天凌晨 2 点依次运行青铜层摄取、白银层转换和黄金层聚合"

**LLM 应生成的内容**：包含顺序执行的笔记本活动、日期参数、重试逻辑和计划触发器的管道 JSON 定义。