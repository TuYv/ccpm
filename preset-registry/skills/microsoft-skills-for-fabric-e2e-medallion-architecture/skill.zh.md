---
name: e2e-medallion-architecture
description: "Plans and builds end-to-end Fabric data platforms on the Bronze, Silver, and Gold medallion pattern: ingestion to analytics, PySpark and Delta layers, pipeline orchestration, per-layer Spark tuning, Materialized Lake View versus notebook choices for Silver and Gold, and Direct Lake handoff. Use for layered architecture design, planning and recommendations. For questions over an existing Power BI report use fabriciq."
---
> **遥测——强制要求。** 每个 `api.fabric.microsoft.com` 调用都必须携带
> `x-ms-fabric-skill: e2e-medallion-architecture`（`az rest`：`--headers "x-ms-fabric-skill=e2e-medallion-architecture"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该标头——但仍要添加。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 过滤
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 过滤

# 端到端 Medallion 架构

## 前置知识

阅读以下配套文档——其中包含此技能所依赖的基础背景：

- [COMMON-CORE.md](../../common/COMMON-CORE.md) — Fabric REST API 模式、身份验证、令牌受众、项目发现
- [COMMON-CLI.md](../../common/COMMON-CLI.md) — `az rest`、`az login`、令牌获取、通过 CLI 使用 Fabric REST
- [SPARK-AUTHORING-CORE.md](../../common/SPARK-AUTHORING-CORE.md) — Notebook 部署、湖屋创建、作业执行
- [notebook-api-operations.md](../spark-cli/references/authoring/resources/notebook-api-operations.md) — **创建 Notebook 所必需** — `.ipynb` 结构要求、单元格格式、`getDefinition`/`updateDefinition` 工作流

有关 Spark 特定的优化细节，请参阅 [data-engineering-patterns.md](../spark-cli/references/authoring/resources/data-engineering-patterns.md)。

---

## 架构概览

**Medallion 架构**是一种具有三个渐进式层级的数据湖屋模式：

| 层级 | 用途 | 优化配置 | 使用场景 |
|-------|---------|---------------------|----------|
| **Bronze**（原始） | 按接收时的原样落地原始数据 | 针对写入优化，仅追加，按摄取日期分区 | 审计追踪、重新处理、血缘 |
| **Silver**（清洗后） | 去重、验证并统一格式的数据 | 平衡读写，按业务日期分区 | 特征工程、运营报表 |
| **Gold**（聚合后） | 用于分析的预计算指标 | 针对读取优化（ZORDER、压缩），按月/年分区 | Power BI 报表、仪表板、通过 SQL endpoint 进行即席分析 |

- **Bronze**：读取时定义架构——架构灵活，Delta 时间旅行支持审计和回滚
- **Silver**：架构强制执行——拒绝不符合规范的写入；源发生变化时，使用 `mergeSchema` 处理架构演变
- **Gold**：严格的架构治理——仅包含经过整理并获得业务批准的数据集

---

## 必须/优先/避免

### 必须执行
- **根据是否支持启用架构来选择湖屋架构**（参见 [infrastructure-orchestration.md](../spark-cli/references/authoring/resources/infrastructure-orchestration.md)）：
  - **首选：**启用架构的湖屋 → 创建一个工作区和一个湖屋，并使用 `bronze`、`silver`、`gold` 架构
  - **旧版：**不支持启用架构 → 为每个层级创建单独的工作区（Bronze、Silver、Gold），以实现治理和访问控制
- **使用 Livy API 创建架构和表**——要在启用架构的湖屋中创建架构和表，请通过 Livy 会话提交 Spark SQL 语句（`POST /livyApi/versions/2023-12-01/sessions` → `POST .../statements`）。这是 Fabric 湖屋中执行 DDL 操作（CREATE SCHEMA、CREATE TABLE）的唯一程序化 REST 路径。
- 在 Bronze 中添加**元数据列**：摄取时间戳、源文件、批次 ID
- 在 Bronze 到 Silver 的转换过程中应用**数据质量规则**（去重、空值处理、范围验证）
- 所有 Medallion 层表均使用 **Delta Lake 格式**
- 在 Silver/Gold 写入中使用**分区感知覆盖**，避免重新处理未发生变化的数据
- 每个层级之后都包含**验证步骤**（行数、架构检查、异常检测）
- 通过 REST API 创建 Notebook 时，遵循 [notebook-api-operations.md](../spark-cli/references/authoring/resources/notebook-api-operations.md#ipynb-validation--fabric-nuances) 中的 **`.ipynb` 验证 + Fabric 注意事项**——每个代码单元格都必须包含 `"outputs": []` 和 `"execution_count": null`
- **完成完整的端到端流程**——不要在创建 Notebook 后停止；始终绑定湖屋，按顺序执行 Notebook（Bronze → Silver → Gold），验证结果，并将 Power BI 连接到 Gold 层，除非用户明确要求仅执行部分设置
- 在每个 MLV 与 Notebook 的建议中，都要说明 MLV 需要**启用架构的湖屋**。将 MLV 定义和增量刷新审查交由 `spark-cli` 的 **authoring** 模式处理；将计划、刷新、监视和故障诊断交由 `spark-cli` 的 **mlv** 模式处理。
- 对于周期性 MLV 刷新，请给出准确的交互路径 **Lakehouse → Materialized lake views → Manage → Schedules**。对于自动化，请使用 `POST /workspaces/{workspaceId}/lakehouses/{lakehouseId}/jobs/refreshMaterializedLakeViews/schedules`；绝不要臆造 `/mlvRefreshSchedules`，也不要通过 Notebook 计划来实现周期性刷新。

### 推荐
- 优先采用增量处理（watermark 模式），而不是全量刷新
- 为每个层使用独立的 notebook，以便独立测试和调试
- 在 Gold 表中对经常用于筛选的列使用 ZORDER
- 在 Silver 和 Gold 层写入数据后运行 OPTIMIZE
- 使用环境专用的 Spark 配置（Bronze 层偏重写入，Silver 层保持均衡，Gold 层偏重读取）
- 使用 OneLake 快捷方式向使用方工作区公开 Gold 数据，避免数据重复
- 明确各层的归属：工程师负责 Bronze/Silver，分析师负责 Gold
- 使用 Fabric Variable Libraries 集中管理各层的路径和配置
- 对于中等或高治理要求，采用多工作区部署模式（将 Bronze/Silver/Gold 分置于不同工作区）
- 当转换可以用 Spark SQL 表达，并且受益于声明式刷新语义时，对 Silver/Gold 表使用 Materialized Lake Views（MLVs）。请参阅 [spark-cli — Materialized Lake View patterns](../spark-cli/references/authoring/resources/materialized-lake-view-patterns.md) 和 [MLV incremental refresh patterns](../spark-cli/references/authoring/resources/mlv-incremental-refresh-patterns.md)。
- 将 "materialized view"、"spark materialized view" 和 "MLV" 视为同一个 Fabric 功能。

### 避免
- **在单个 lakehouse 中存储所有层且不使用 schemas** — 非 schema lakehouse 需要 notebook init cells 或 Environment 配置来启用 OneLake Spark Catalog，以支持 RLS/CLS 和 MLV。如果无法使用 schemas，请使用独立的 lakehouse 进行隔离。
- **在 schema-enabled lakehouse 可用时创建 3 个独立的 lakehouse** — 应改为在一个 lakehouse 中使用 schemas（结构更清晰，无需样板 init cells，并且对于 MLV 跨 schema 转换更加高效）
- 跳过 Silver 层，直接从 Bronze 转到 Gold
- 硬编码 workspace IDs、lakehouse IDs 或 FQDNs — 应通过 REST API 发现
- 对 Bronze 表使用不带 LIMIT 的 SELECT *（这些表会无限增长）
- 未检查下游依赖就运行 VACUUM
- 在 medallion 各层之间串联 OneLake 快捷方式（Bronze→Silver→Gold）— 每一层都必须进行物理实例化，以支持数据沿袭和治理
- 将完整的实现代码复制到 skills 中 — 应引导 LLM 生成代码
- 直接在 Spark 中读取 **external HTTP/HTTPS URLs** — Fabric Spark 无法访问任意外部 URL；应先将数据落地到 lakehouse 的 `Files/` 中（通过 `curl`、OneLake API 或 Fabric pipeline Copy activity），然后再从 lakehouse 路径读取
- **未验证 `.ipynb` 结构就通过 REST API 创建 notebooks** — 代码单元格缺少 `execution_count: null` 或 `outputs: []` 会导致静默失败，或出现“Job instance failed without detail error”

---

## 工作区设置指南

设置 medallion 工作区时，应首先选择架构模式（详细指南请参阅 [infrastructure-orchestration.md](../spark-cli/references/authoring/resources/infrastructure-orchestration.md)）：

### 选项 A：Schema-Enabled Lakehouse（首选）

1. **创建单个工作区**：`{project}-{env}`
2. **创建一个带 schemas 的 lakehouse**：`{project}_lakehouse`
3. **在 lakehouse 中创建 schemas**：
   - `bronze` schema 用于原始数据摄取
   - `silver` schema 用于清理和验证后的数据
   - `gold` schema 用于聚合分析
4. **选择转换方式**：
   - **选项 4a：** 为每个层使用 notebooks（PySpark 或 Spark SQL 转换）
   - **选项 4b：** 使用 Materialized Lake Views（Spark SQL）执行支持增量刷新的声明式转换（当查询符合 IR 要求时）— 请参阅 [materialized-lake-view-patterns.md](../spark-cli/references/authoring/resources/materialized-lake-view-patterns.md) 和 [mlv-incremental-refresh-patterns.md](../spark-cli/references/authoring/resources/mlv-incremental-refresh-patterns.md)
   - **注意：** PySpark MLVs 存在，但仅使用全量刷新（不支持增量刷新）— 当需要 UDFs/复杂 Python 逻辑时使用
   - **MLV 优势：** 对于 schema-enabled lakehouses，OneLake Spark Catalog 会**自动启用** — MLVs 开箱即用，无需 notebook init cells 或 Environment 配置
5. **RBAC**（可选）：在 schemas 中使用行级安全和列屏蔽来实现细粒度访问控制（同样需要 OneLake Spark Catalog）

### 选项 B：独立 Lakehouse（旧版）

1. **创建三个工作区**：
   - `{project}-bronze-{env}`
   - `{project}-silver-{env}`
   - `{project}-gold-{env}`
2. **每个工作区创建一个 lakehouse**：
   - Bronze 工作区 → `{project}_bronze` lakehouse
   - Silver 工作区 → `{project}_silver` lakehouse
   - Gold 工作区 → `{project}_gold` lakehouse
3. **为各层工作区分配 RBAC**：
   - Bronze：摄取/工程写入权限
   - Silver：工程/数据质量权限
   - Gold：分析/BI 使用者访问权限，并采用更严格的数据整理控制
4. **为非 schema lakehouse 启用 OneLake Spark Catalog**（RLS/CLS 和基于目录的访问模式所必需）：
   - **主要方式：**在 Environment 中设置 `spark.sql.fabric.catalog.enable-schemaless-lakehouses=true`，并将其附加到 notebook。
   - **替代方式：**省略 notebook 的默认 lakehouse 绑定。使用四段式完全限定引用（`workspace.lakehouse.schema.table`）。未设置默认 lakehouse 时，OneLake Spark Catalog 会自动启用。
   - **替代方式（内部/不受支持）：**将以下内容作为每个 notebook 的**第一个单元格**：
   ```python
   %%pyspark
   !echo "spark.sql.fabric.catalog.enable-schemaless-lakehouses=true" >> /home/trusted-service-user/.trident-context
   ```
   - **⚠️ 注意：**此变通方法使用内部运行时配置路径，未来的 Fabric 版本可能会更改该路径。**建议使用启用了 schema 的 lakehouse**，以获得稳定且有文档支持的 OneLake Spark Catalog 支持。
   - 使用此配置后，非 schema lakehouse 支持：
     - ✅ 行级安全性（RLS）和列级安全性（CLS）
   - **注意：**MLV 需要启用了 schema 的 lakehouse（选项 A）。对于非 schema lakehouse，请使用包含 Delta 表的 notebook。

### 通用步骤（两个选项均适用）

完成上述选项 A 或选项 B 后，执行以下步骤：

1. **为每个层创建 notebook**（每个转换阶段一个）— 遵循 `.ipynb` 验证和 Fabric 特有注意事项
2. **将每个 notebook 绑定到其 lakehouse** — 使用正确的 lakehouse ID 设置 `metadata.dependencies.lakehouse`（参见 [notebook-api-operations.md § 默认 Lakehouse 绑定](../spark-cli/references/authoring/resources/notebook-api-operations.md#default-lakehouse-binding)）：
   - 选项 A：所有 notebook → 同一个 lakehouse，使用 schema 前缀（`bronze.table`、`silver.table`）
   - 选项 B：
     - Bronze notebook → Bronze 工作区/lakehouse
     - Silver notebook → Silver 工作区/lakehouse（通过跨工作区 OneLake 访问/完全限定引用读取 Bronze）
     - Gold notebook → Gold 工作区/lakehouse（通过跨工作区访问读取 Silver）
3. **确认 notebook 部署** — 检查 `updateDefinition` 是否返回 `Succeeded`；这足以确认内容和 lakehouse 绑定已持久化。不要调用 `getDefinition` 进行再次验证 — 这是一个异步 LRO，会增加不必要的延迟。
4. **按顺序执行 notebook** — 先执行 Bronze，然后是 Silver，最后是 Gold — 使用 `POST .../jobs/instances?jobType=RunNotebook`，并在执行配置中提供正确的 `defaultLakehouse`（`id` 和 `name` 均为必填项）
5. **将 Power BI 连接到 Gold 层** — 发现 Gold lakehouse SQL endpoint，创建 Direct Lake 语义模型，并在 Gold 汇总表上创建包含可视化对象的报表（参见 [Gold 层 → Power BI 使用](#gold-layer--power-bi-consumption)）
6. **创建 pipeline**，用于编排 Bronze → Silver → Gold 流程以进行定期执行

### 显式覆盖：单工作区

如果用户明确要求单工作区部署（例如 POC/小型团队/单体模式），请保持当前方案：

- 一个工作区，包含独立的 Bronze/Silver/Gold lakehouse
- 即使共享工作区，也要在逻辑上保持各层分离
- 说明与多工作区设计相比的治理权衡

按环境进行参数化：工作区名称后缀（`-dev`、`-prod`）、数据量（示例数据与完整数据）、容量 SKU，以及 Bronze 保留期限。

---

## Bronze 层 — 摄取模式

当用户请求将数据摄取到 Bronze 层时，引导 LLM：

1. **先将数据落地到 lakehouse**：外部数据必须先暂存到 lakehouse 的 `Files/` 文件夹中，之后 Spark 才能读取 — 使用以下方式之一：
   - **Fabric Pipeline Copy activity**（定期加载的首选方式）— 连接外部数据源（HTTP、FTP、数据库、云存储）并将数据写入 OneLake
   - **OneLake API / `curl`** — 使用 `storage.azure.com` 令牌通过 REST API 上传文件（参见 COMMON-CLI.md § OneLake Data Access）
   - **OneLake Shortcut** — 用于已位于 Azure ADLS Gen2、S3 或其他 OneLake 位置的数据
   - **`notebookutils.fs`** — 在 notebook 中从已挂载的存储路径复制数据
   - ⚠️ **Fabric Spark 无法从任意 HTTP/HTTPS URL 读取数据** — `spark.read.format("csv").load("https://...")` 将会失败
2. **从 lakehouse 路径读取**：数据进入 `Files/` 后，使用相对于 lakehouse 的路径读取（例如，`spark.read.format("csv").load("Files/landing/daily/")`）
3. **添加元数据并写入**：添加跟踪列（摄取时间戳、源文件、批次 ID），使用描述性名称创建 Delta 表，按摄取日期分区，并使用追加模式
4. **进行验证**：记录行数，验证架构结构，并根据历史模式标记异常

---

## Silver 层 — 转换模式

当用户请求执行 Bronze 到 Silver 的转换时，引导 LLM：

- **质量规则**：根据自然键/复合键去重，过滤无效范围，处理空值（删除必填字段为空的记录，填充可选字段），验证逻辑约束
- **架构一致性**：使用 snake_case 列名，统一数据类型，添加派生列（时长、百分比、类别）
- **架构演进**：源架构发生变化时使用 `mergeSchema` 选项；协调下游 Gold 表和 Power BI 数据集的更新
- **写入策略**：按业务日期分区，执行分区感知覆盖，写入后运行 OPTIMIZE，并记录写入前后的指标

---

## Gold 层 — 聚合模式

当用户请求 Gold 分析表时，引导 LLM 生成：

- **常见聚合**：每日/每周/每月汇总，维度分析（按位置、类别、类型），随时间变化的趋势拆解，需求模式（小时、星期几）
- **Spark 会话配置** — 在 Gold notebook 中、任何写入操作**之前**设置以下属性：
  ```python
  spark.conf.set("spark.sql.parquet.vorder.default", "true")
  spark.conf.set("spark.databricks.delta.optimizeWrite.enabled", "true")
  spark.conf.set("spark.databricks.delta.optimizeWrite.binSize", "1g")
  ```
  - **V-Order**（`vorder.default`）— 对所有 Parquet 文件应用 Fabric 的列式排序优化，大幅提升 Direct Lake 和 SQL endpoint 的读取性能
  - **Optimize Write**（`optimizeWrite.enabled`）— 将小分区合并为大小适宜的文件（`binSize` 的目标约为 1 GB），减少文件数量并提升扫描效率
- **优化**：在筛选列上使用 ZORDER，写入后运行 OPTIMIZE，预聚合指标以避免运行时计算

---

## 端到端执行流程

在端到端设置奖牌架构时，LLM **不得在创建笔记本和部署代码后停止**。完整生命周期如下：

```
Create Resources → Deploy Content → Bind Lakehouses → Execute → Verify Results
```

### 分步说明

1. **创建各层工作区和湖屋（默认）** — 每层（Bronze、Silver、Gold）创建一个工作区和一个湖屋；记录工作区 ID 和湖屋 ID
2. **创建笔记本** — 每层创建一个笔记本，并确保其具有有效的 `.ipynb` 结构（参见 [notebook-api-operations.md](../spark-cli/references/authoring/resources/notebook-api-operations.md)）
3. **将湖屋绑定到每个笔记本** — 在 `.ipynb` payload 中包含 `metadata.dependencies.lakehouse`，其中包括：
   - `default_lakehouse`：目标湖屋 GUID
   - `default_lakehouse_name`：湖屋显示名称
   - `default_lakehouse_workspace_id`：工作区 GUID
4. **部署笔记本内容** — 使用 Base64 编码的 `.ipynb` payload 调用 `updateDefinition`（同时包含内容和湖屋绑定）
5. **确认部署** — 检查每个 `updateDefinition` LRO 是否返回 `Succeeded`；这已经足够。不要调用 `getDefinition` 重新验证 — 这是一个异步 LRO，会显著增加每个笔记本的延迟。
6. **按顺序执行笔记本** — 使用 `POST .../jobs/instances?jobType=RunNotebook`：
   - 在 `executionData.configuration` 中传递同时包含 `id` 和 `name` 的 `defaultLakehouse`
   - 先运行 Bronze → 轮询直到 `Completed` → 运行 Silver → 轮询 → 运行 Gold → 轮询
   - 提交前检查最近的作业（防止重复 — 参见 SPARK-AUTHORING-CORE.md）
7. **验证结果** — 每个笔记本完成后，确认预期表已存在且行数合理
8. **将 Power BI 连接到 Gold** — 在 Gold 汇总表上创建语义模型和报表（参见 [Gold 层 → Power BI 消费](#gold-层--power-bi-消费)）

### 常见失败：在创建笔记本后停止

如果流程在部署笔记本代码后停止，而没有进行绑定或执行：
- 笔记本将没有湖屋上下文 → `spark.sql()` 和相对路径（`Tables/`、`Files/`）会在运行时失败
- 用户看不到任何输出或结果 — 架构已经设置完成，但从未经过测试
- **始终完成到第 7 步**，除非用户明确要求在某个特定步骤停止

---

## Gold 层 → Power BI 消费

填充 Gold 表后，将 Power BI 连接到这些表以呈现分析结果。  
在 Gold 湖屋之上使用 DirectLake 构建语义模型。 


### 分步说明

1. **发现 Gold 湖屋 SQL endpoint** — 调用 `GET /v1/workspaces/{workspaceId}/lakehouses/{goldLakehouseId}`，提取 `properties.sqlEndpointProperties.connectionString` 和 `provisioningStatus`；等待状态变为 `Success`
2. **通过 SQL 验证 Gold 表** — 使用 `sqlcmd` 连接到 SQL endpoint（参见 [COMMON-CLI.md § SQL / TDS 数据平面访问](../../common/COMMON-CLI.md#sql--tds-data-plane-access)），并确认目标表存在：
   ```sql
   SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'nyc_taxi_daily_summary'
   ```
3. **创建语义模型** — 使用 [semantic-model-authoring](../semantic-model-authoring/SKILL.md) skill 创建语义模型并部署 TMDL。通过 `POST /v1/workspaces/{workspaceId}/items` 创建，使用 `type: "SemanticModel"`，然后使用 TMDL 格式通过 `updateDefinition` 部署定义（参见 [ITEM-DEFINITIONS-CORE.md § SemanticModel](../../common/ITEM-DEFINITIONS-CORE.md#semanticmodel)）：
   - 模型必须将 Gold 湖屋 SQL endpoint 作为其数据源
   - 定义到 Gold 汇总表（例如 `nyc_taxi_daily_summary`）的表映射
   - 使用 **Direct Lake** 模式 — 这会直接连接到 OneLake 中的 Delta 表，而无需导入数据
   - 为你认为有意义的关键聚合包含度量值（例如 `Total Trips`、`Avg Fare`、`Total Revenue`、`Month over Month Growth`）
4. **创建 Power BI 报表** — 使用 `type: "Report"` 调用 `POST /v1/workspaces/{workspaceId}/items`，然后使用 PBIR 格式通过 `updateDefinition` 部署定义（参见 [ITEM-DEFINITIONS-CORE.md § Report](../../common/ITEM-DEFINITIONS-CORE.md#report)）：
   - 通过 `definition.pbir` 引用第 3 步创建的语义模型
   - 至少定义一个包含 Gold 汇总表可视化对象的页面
   - 建议的可视化对象：折线图（日趋势）、卡片（KPI 总计）、条形图（按类别）、表格（详细视图）
5. **端到端验证** — 使用 `semantic-model-authoring` skill 进行元数据发现，在语义模型上运行 DAX 查询，并确认数据从 Gold 表流转到报表

### 原则

- **动态发现 SQL endpoint** — 连接字符串位于 lakehouse 响应中的 `properties.sqlEndpointProperties.connectionString`；绝不要对其进行硬编码
- **等待 SQL endpoint 预配完成** — 连接前状态必须为 `Success`；新创建的 lakehouse 可能需要几分钟才能完成预配
- **优先使用 Direct Lake 模式** — 避免数据重复；语义模型直接从 OneLake Delta 表读取数据
- **严格匹配表名和列名** — 语义模型表定义必须使用 Gold lakehouse 中 Delta 表和列的准确名称
- **对于语义模型创作**（TMDL、刷新、权限），请交叉参考 [semantic-model-authoring](../semantic-model-authoring/SKILL.md) skill
- **对于 DAX 查询验证**，请交叉参考 [semantic-model-authoring](../semantic-model-authoring/SKILL.md) skill，以发现元数据并执行 DAX 查询进行验证。

---

## 管道编排

当用户请求为 medallion 流程创建管道时，引导 LLM 按以下方式进行设计：

- **结构**：按顺序执行活动（Bronze → Silver → Gold），每个活动都等待前一个活动成功；独立的 Gold 聚合可以并行运行；包含验证和通知活动
- **参数化**：管道级处理日期（默认为昨天），传递给所有 notebook；使用动态日期表达式
- **计划**：与源刷新保持每日对齐，使用基于水印的增量处理，并定期执行完整刷新以修正数据
- **错误处理**：针对暂时性故障使用带退避的重试机制，针对持续性故障进行告警，并实现优雅降级（如果上游失败，下游使用之前的数据）

---

## 环境优化

**有关详细的 Spark 配置和优化策略，请参阅 [data-engineering-patterns.md](../spark-cli/references/authoring/resources/data-engineering-patterns.md)。**

| 层 | 配置特征 | 关键设置 |
|-------|---------|-------------|
| Bronze | 写入密集型 | 禁用 V-Order，启用 autoCompact，设置较大的文件目标大小，按 ingestion_date 分区 |
| Silver | 均衡型 | 启用 V-Order、自适应查询执行，按业务日期分区，在筛选列上使用 ZORDER |
| Gold | 读取密集型 | V-Order（`spark.sql.parquet.vorder.default=true`）、Optimize Write（`optimizeWrite.enabled=true`、`binSize=1g`）、向量化读取器、自适应执行、在所有筛选列上使用 ZORDER、预聚合指标 |

---

## 示例

### 示例 1：设置 Medallion 工作区（默认）

**提示词**：“为销售分析设置 Medallion 架构，并分别创建 Bronze、Silver 和 Gold 工作区”

**LLM 应生成的内容**：调用 REST API 来：
1. 创建工作区：`sales-bronze-dev`、`sales-silver-dev`、`sales-gold-dev`
2. 在每个工作区中创建一个 lakehouse：`sales_bronze`、`sales_silver`、`sales_gold`
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

### 示例 2：设计 Bronze 数据摄取

**提示词**：“将每日 CSV 文件摄取到 Bronze lakehouse，并添加元数据列”

**LLM 应生成的内容**：PySpark notebook，其中：
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

### 示例 3：Bronze 到 Silver 的转换

**提示词**：“清理 Bronze 数据：删除重复项、筛选无效记录、添加派生列，并写入 Silver”

**LLM 应生成的内容**：应用质量规则、架构一致性以及经过优化的分区写入的 PySpark notebook。

### 示例 4：端到端管道

**提示词**：“创建一个管道，每天凌晨 2 点依次运行 Bronze 数据摄取、Silver 转换，然后执行 Gold 聚合”

**LLM 应生成的内容**：包含按顺序执行的 notebook 活动、日期参数、重试逻辑和计划触发器的管道 JSON 定义。