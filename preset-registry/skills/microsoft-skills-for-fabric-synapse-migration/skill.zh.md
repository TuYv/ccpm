---
name: synapse-migration
description: >
  Port Azure Synapse Analytics workloads to Microsoft Fabric.
  Provides distinct migration patterns for Spark workloads, Lake Database metadata,
  and Dedicated SQL Pool schema and executable code to Fabric Lakehouse.
  Translates mssparkutils calls to notebookutils (including the env→runtime namespace change),
  replaces Linked Services with Fabric Data Connections and OneLake Shortcuts.
  Use when the user wants to:
  (1) port Synapse Spark notebooks to Fabric Lakehouse or Spark Job Definitions,
  (2) replace mssparkutils or Linked Services in Synapse code,
  (3) migrate Dedicated SQL Pool schema and executable code to Fabric Lakehouse using
  T-SQL to Spark SQL notebook conversion without moving source table rows.
  Triggers: "migrate from synapse", "synapse to fabric", "mssparkutils to notebookutils",
  "synapse linked service replacement", "port synapse notebooks", "synapse workspace migration",
  "synapse dedicated pool to lakehouse", "synapse T-SQL to Spark SQL",
  "assess synapse dedicated pool migration risk".
---
> **遥测 — 强制要求。** 每次调用 `api.fabric.microsoft.com` 时都必须携带
> `x-ms-fabric-skill: synapse-migration`（`az rest`：`--headers "x-ms-fabric-skill=synapse-migration"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该标头，但仍须添加。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 筛选
> 3. 在大多数情况下，`mssparkutils` 和 `notebookutils` 具有相同的 API 接口 — 主要变化是命名空间
> 4. Linked Services 在 Fabric 中没有直接对应的 REST API — 它们由 Data Connections（用于外部源）和 OneLake Shortcuts（用于存储挂载）取代
> 5. 从 Dedicated SQL Pool 到 Fabric Lakehouse 的路径由源和功能决定。完成 DACPAC 和目录发现后，按功能评估兼容性、迁移风险以及预计的目标工作区项目需求。展示 `1:1`、`N:1` 和 `N:N` 的存储过程到笔记本策略，并要求用户在转换前提供并明确批准完整映射、目标名称、依赖项分组和工作区放置方案。无论采用哪种已批准的策略，都应将每个过程保留为可独立追踪的源决策。存储过程转换逻辑必须使用可读的 Spark SQL `%%sql` 单元格，而非 PySpark 或 DataFrame API。生成的笔记本是输出，而非编排依赖项。
> 6. 将源 Dedicated Pool 视为只读。切勿在源中创建示例或合成数据、架构、表、视图、过程、用户、角色或授权。不要运行源 DDL、DML 或存储过程。此工作流中的源操作仅限于元数据发现和基于元数据的验证；任何请求的源变更都应转至单独且范围明确的工作流。
> 7. Dedicated Pool 数据迁移不在范围内。切勿导出、暂存、复制、上传、创建快捷方式、传输或加载源表行，也切勿运行行级或业务结果等价性查询。此技能仅迁移架构和可执行代码工件。
> 8. 定期输出迁移状态。在每个步骤开始前进行通知，在每个对象或检查点完成或失败时进行报告，在长时间运行的操作期间至少每 30-60 秒发出一次简洁的心跳状态，并在每个阶段结束时提供已完成/失败/已跳过/待处理的数量。包括阶段、步骤、对象、状态、已用时间和下一步操作。状态输出必须排除凭据、令牌、连接字符串和敏感数据值。
> 9. 对于大型或复杂的存储过程，应使用确定性的源代码块台账证明转换覆盖范围，并且仅从经过哈希验证的不可变部署包发布。每个代码块都必须完成转换、经批准明确排除，或经过人工审查和批准；仅笔记本语法检查成功是不够的。

# Synapse Analytics → Microsoft Fabric 迁移

## 前置知识

以下配套文档提供了通用的 Fabric REST 模式。**请勿预先阅读**——仅当特定阶段需要使用本 Skill 资源文件中尚未涵盖的模式时，才进行查阅：

- [COMMON-CORE.md](../../common/COMMON-CORE.md) — 通用 Fabric REST API 模式、身份验证与令牌受众，以及通过 JMESPath 发现项目
- [COMMON-CLI.md](../../common/COMMON-CLI.md) — `az rest` / `az login` CLI 模式和身份验证方法
- [SPARK-AUTHORING-CORE.md](../../common/SPARK-AUTHORING-CORE.md) — Notebook/Lakehouse 创建（已在 [spark-item-migration.md](resources/spark-item-migration.md) 和 [lake-database-migration.md](resources/lake-database-migration.md) 中涵盖）
- [SQLDW-AUTHORING-CORE.md](../../common/SQLDW-AUTHORING-CORE.md) — Fabric Warehouse T-SQL（委托给 `sqldw-cli` Skill）

> **身份验证、API 端点和项目有效负载均已在本 Skill 自身的文件中完整记录。**上述通用文档仅作为备用参考。

---

## 目录

| 主题 | 参考资料 |
|---|---|
| **迁移编排器** | [migration-orchestrator.md](resources/migration-orchestrator.md) |
| **专用池 → Lakehouse 迁移** | [dedicated-pool-to-lakehouse.md](resources/dedicated-pool-to-lakehouse.md) |
| 专用池发现 | [dedicated-pool-discovery.md](resources/dedicated-pool-discovery.md) |
| 专用池差距评估 | [dedicated-pool-gap-assessment.md](resources/dedicated-pool-gap-assessment.md) |
| 专用池转换 | [dedicated-pool-conversion.md](resources/dedicated-pool-conversion.md) |
| 专用池大型存储过程审计 | [dedicated-pool-large-procedure-audit.md](resources/dedicated-pool-large-procedure-audit.md) |
| 专用池部署 | [dedicated-pool-deployment.md](resources/dedicated-pool-deployment.md) |
| 专用池验证 | [dedicated-pool-validation.md](resources/dedicated-pool-validation.md) |
| API 驱动的迁移工作流 | [§ API 驱动的迁移工作流](#api-driven-migration-workflow) |
| 迁移工作负载映射 | [§ 迁移工作负载映射](#migration-workload-map) |
| Spark 池 → Environment 迁移 | [spark-pool-migration.md](resources/spark-pool-migration.md) |
| Lake Database → Lakehouse 迁移 | [lake-database-migration.md](resources/lake-database-migration.md) |
| 外部 Hive Metastore → Lakehouse 迁移 | [external-hms-migration.md](resources/external-hms-migration.md) |
| Notebook 与 SJD 迁移 | [spark-item-migration.md](resources/spark-item-migration.md) |
| 库兼容性（Synapse 与 Fabric RT 1.3） | [library-compatibility.md](resources/library-compatibility.md) |
| 连接器重构（Kusto、Cosmos DB、ADLS OAuth） | [connector-refactoring.md](resources/connector-refactoring.md) |
| `mssparkutils` → `notebookutils` API 映射 | [utility-api-mapping.md](resources/utility-api-mapping.md) |
| Linked Services → Data Connections / Shortcuts | [connectivity-migration.md](resources/connectivity-migration.md) |
| 迁移前后代码模式（包括 Catalog API 差距） | [code-patterns.md](resources/code-patterns.md) |
| 迁移报告（包含 Fabric 门户链接） | [migration-report.md](resources/migration-report.md) |
| 迁移故障排除指南 | [migration-gotchas.md](resources/migration-gotchas.md) |
| 验证与测试 | [validation-testing.md](resources/validation-testing.md) |
| 安全与治理（生产就绪） | [security-governance.md](resources/security-governance.md) |
| T-SQL 与 Spark 配置差异 | [§ T-SQL 与 Spark 配置差异](#t-sql--spark-configuration-differences) |
| 容量规模估算参考 | [§ 容量规模估算参考](#capacity-sizing-reference) |
| 必须 / 建议 / 避免 | [§ 必须 / 建议 / 避免](#must--prefer--avoid) |
| 功能对等性参考 | [§ 功能对等性参考](#feature-parity-reference) |
| 迁移注意事项——快速参考 | [§ 迁移注意事项](#migration-gotchas--quick-reference) + [migration-gotchas.md](resources/migration-gotchas.md) |
| 迁移后：后续步骤 | [§ 迁移后：后续步骤](#post-migration-whats-next) |

### 上下文加载指南

> **重要提示 — 仅加载所需内容。** 请勿预先读取所有资源文件。请加载当前所执行阶段对应的特定文件：

| 场景 | 读取此文件 | 行数 |
|---|---|---|
| 用户请求迁移工作区（完整编排） | [migration-orchestrator.md](resources/migration-orchestrator.md) | ~1264 |
| **用户请求将 Dedicated SQL Pool 迁移到 Lakehouse** | **[dedicated-pool-to-lakehouse.md](resources/dedicated-pool-to-lakehouse.md)** | **~78** |
| 大型或复杂的存储过程转换 | [dedicated-pool-large-procedure-audit.md](resources/dedicated-pool-large-procedure-audit.md) | ~130 |
| 阶段 0：Spark Pools → Environments | [spark-pool-migration.md](resources/spark-pool-migration.md) | ~290 |
| 阶段 1：Databases → Lakehouses（内置 HMS） | [lake-database-migration.md](resources/lake-database-migration.md) | ~574 |
| 阶段 1：Databases → Lakehouses（外部 HMS） | [external-hms-migration.md](resources/external-hms-migration.md) | ~388 |
| 阶段 2–3：Notebooks 与 SJDs | [spark-item-migration.md](resources/spark-item-migration.md) | ~326 |
| 代码重构（mssparkutils、连接器） | [utility-api-mapping.md](resources/utility-api-mapping.md) + [connector-refactoring.md](resources/connector-refactoring.md) + [code-patterns.md](resources/code-patterns.md) | ~588 |
| 迁移后验证 | [validation-testing.md](resources/validation-testing.md) | ~487 |
| 排查故障 | [migration-gotchas.md](resources/migration-gotchas.md) | ~225 |
| 生产环境安全设置 | [security-governance.md](resources/security-governance.md) | ~926 |
| 库版本差异 | [library-compatibility.md](resources/library-compatibility.md) | ~106 |
| 生成迁移报告 | [migration-report.md](resources/migration-report.md) | ~360 |
| 容量规模估算与 SKU 规划 | [capacity-sizing.md](resources/capacity-sizing.md) | ~85 |
| 功能对等矩阵 | [feature-parity.md](resources/feature-parity.md) | ~65 |

---

## API 驱动的迁移工作流

此 Skill 支持通过 REST API 以编程方式迁移 Synapse Spark 项目（无需使用基于 UI 的 Migration Assistant）。

### 身份验证

| 目标 | 令牌受众 |
|---|---|
| Synapse ARM（管理平面） | `https://management.azure.com` |
| Synapse 数据平面 | `https://dev.azuresynapse.net` |
| Fabric REST API | `https://api.fabric.microsoft.com` |

> 请使用 [COMMON-CLI § 身份验证方法](../../common/COMMON-CLI.md#authentication-recipes)中的令牌获取方法，并使用上述受众。

### 迁移阶段（按顺序执行）

| 阶段 | Synapse 源 | Fabric 目标 | 资源 |
|---|---|---|---|
| 阶段 0 | Spark Pool | Environment | [spark-pool-migration.md](resources/spark-pool-migration.md) |
| 阶段 1 | Lake Database（内置 HMS） | Lakehouse | [lake-database-migration.md](resources/lake-database-migration.md) |
| 阶段 1 | 外部 Hive Metastore | Lakehouse | [external-hms-migration.md](resources/external-hms-migration.md) |
| 阶段 1b | 临时 `abfss://` 存储路径 | OneLake Shortcuts | [migration-orchestrator.md](resources/migration-orchestrator.md)（仅限 migrate-and-modernize） |
| 阶段 2 | Notebooks | Notebook | [spark-item-migration.md](resources/spark-item-migration.md) |
| 阶段 3 | Spark Job Definitions | SJD | [spark-item-migration.md](resources/spark-item-migration.md) |
| 最终阶段 | 验证与测试 | — | [validation-testing.md](resources/validation-testing.md) |
| 可选 | 安全与治理 | — | [security-governance.md](resources/security-governance.md) |

> **阶段顺序至关重要**：必须先创建环境（阶段 0），笔记本/SJD 才能绑定到环境。必须先创建 Lakehouse（阶段 1），笔记本才能绑定到它们（阶段 2）。

> 有关包含子步骤、决策点、直接迁移与现代化改造路径以及错误恢复的完整执行流程，请参阅 [migration-orchestrator.md](resources/migration-orchestrator.md)。

### REST API 快速参考

所有 Synapse 和 Fabric API 端点及其请求/响应示例均位于 [migration-orchestrator.md](resources/migration-orchestrator.md)（步骤 2a–2e）中。身份验证令牌：

| 目标 | 令牌受众 |
|---|---|
| Synapse ARM | `https://management.azure.com` |
| Synapse 数据平面 | `https://dev.azuresynapse.net` |
| Fabric REST API | `https://api.fabric.microsoft.com` |

> **API 文档**：[Synapse ARM](https://learn.microsoft.com/en-us/rest/api/synapse) · [Synapse 数据平面](https://learn.microsoft.com/en-us/rest/api/synapse/data-plane) · [Fabric 项目](https://learn.microsoft.com/en-us/rest/api/fabric/core/items) · [Fabric 快捷方式](https://learn.microsoft.com/en-us/rest/api/fabric/core/onelake-shortcuts) · [Fabric 连接](https://learn.microsoft.com/en-us/rest/api/fabric/core/connections) · [Fabric 环境](https://learn.microsoft.com/en-us/rest/api/fabric/environment)

---

## 迁移工作负载映射

使用此表确定每个 Synapse 组件对应的正确 Fabric 目标：

| Synapse 组件 | Fabric 目标 | 备注 |
|---|---|---|
| **Spark 池**（笔记本、作业） | **Fabric 环境 + 笔记本或 Spark 作业定义** | 使用此技能中针对 Spark 的资源迁移 Spark 配置、库和代码。 |
| **专用 SQL 池** | **Fabric Lakehouse**（使用 Spark SQL 笔记本转换 T-SQL）或 **Fabric Warehouse** | **Lakehouse 路径**：使用 SqlPackage/目录查询提取元数据，评估预计的工作区项目需求，要求用户提供并批准 `1:1`、`N:1` 或 `N:N` 的存储过程到笔记本映射，然后转换架构和代码工件。不迁移源表数据行；请参阅 [dedicated-pool-to-lakehouse.md](resources/dedicated-pool-to-lakehouse.md)。**Warehouse 路径**：将 T-SQL 编写工作委派给 `sqldw-cli`。 |
| **无服务器 SQL 池** | **Lakehouse SQL 端点** | 对 Delta/Parquet 进行只读查询；无需 DDL |
| **Synapse 管道** | **Fabric 数据管道** | 活动类型、触发器和表达式大体兼容。*管道迁移资源尚不可用——需采用单独的迁移流程。* |
| **适用于 Cosmos DB / SQL 的 Synapse Link** | **Fabric 镜像** | 原生镜像取代 Synapse Link 连接器模式。*此技能未涵盖。* |
| **链接服务** | **数据连接**（外部）/ **OneLake 快捷方式**（存储） | 请参阅 [connectivity-migration.md](resources/connectivity-migration.md) |
| **集成数据集** | **Fabric 管道源/接收器配置** | 在 Fabric 中，数据集定义以内联方式包含在管道活动中。*此技能未涵盖。* |
| **托管虚拟网络** | **Fabric 托管专用终结点** | 在 Fabric 容量设置中进行配置 |
| **Synapse Studio** | **Fabric 工作区** | 所有工件类型都位于启用了 Git 集成的单一工作区中 |

### 决策树：应选择哪种 Fabric Spark 工作负载？

```text
Synapse Spark workload
├── Interactive notebook with data exploration → Fabric Notebook (attached to Lakehouse)
├── Scheduled/production job → Spark Job Definition (SJD)
├── T-SQL over files/Delta → Lakehouse SQL Endpoint (no migration needed — just point to OneLake)
└── Real-time ingest → Fabric Eventstream + Lakehouse
```

---

## T-SQL 与 Spark 配置差异

有关 T-SQL 功能范围差距（PolyBase → `COPY INTO`、分布提示、结果集缓存）和 Spark 配置映射（池、`%%configure`、运行时版本）的详细信息，请参阅 [feature-parity.md](resources/feature-parity.md)。

> **关键操作**：移除 `DISTRIBUTION = HASH(col)` 提示，将 `CREATE EXTERNAL TABLE` 替换为 `COPY INTO`，将 `spark.read.synapsesql()` 替换为 OneLake 快捷方式或 JDBC。将 T-SQL 编写工作委托给 `sqldw-cli`。

---

## 容量规模参考

有关 Synapse 池 → Fabric SKU 映射表、规模决策指南和成本模型对比，请参阅 [capacity-sizing.md](resources/capacity-sizing.md)。

> **快速指南**：开发/测试 = F8–F16，搭配 Starter Pool；标准生产环境 = F32–F64；企业级 = F128+。使用 Fabric Trial（免费 F64，60 天）进行迁移验证。

---

## 必须 / 建议 / 避免

### 必须执行
- **保留存储过程输入契约** — 通过映射到首个单元格中 `%%configure` 的 Fabric Notebook Activity 参数，确保每个受支持的源输入都可从外部覆盖；仅将源默认值保留为 `defaultValue`，绝不要用字面量替代参数使用，也不要虚构预览默认值；当必需输入没有源默认值时，阻止自动发布
- **在发现阶段后审批存储过程笔记本基数** — 计算预计的工作区项需求，提供 `1:1`、`N:1` 和 `N:N` 选项，并在用户提供并批准完整映射、目标名称、依赖项分组和工作区放置方案之前阻止转换；无论采用哪种策略，都要保留每个过程的源决策和源代码块来源信息
- **按源代码块审计大型过程转换** — 为每次运行生成确定性的账本/验证器脚本，要求实现 100% 且互不重叠的源字节覆盖，并为每个代码块提供可部署的处置方式；仅在声明的限制范围内重试失败的代码块；默认保留审计/日志记录行为；并且仅发布经过哈希验证的 `ReadyForPublication` 包中的确切字节
- **对非过程阶段使用直接 API** — 使用 SqlPackage/DMV 进行发现，使用 Fabric REST 进行项管理，并使用 Fabric Livy 语句执行架构和 Delta 操作
- **将所有 `mssparkutils` 导入替换为 `notebookutils`** — 有关完整的命名空间表，请参阅 [utility-api-mapping.md](resources/utility-api-mapping.md)
- **替换所有 Linked Services**，改用 Fabric Data Connections（用于外部数据库/服务）或 OneLake Shortcuts（用于 ADLS Gen2 / Blob 存储挂载）— 请参阅 [connectivity-migration.md](resources/connectivity-migration.md)
- **替换 `spark.read.synapsesql()`**，改用 Lakehouse 快捷方式读取，或使用指向 Fabric Warehouse SQL 终结点的 JDBC 连接
- **迁移后重新测试所有笔记本**，并针对目标 Fabric Runtime 版本进行测试 — Spark 次版本差异可能会引发已弃用 API 警告
- **将所有工作区/项 ID 外部化** — 绝不要硬编码；应使用管道参数或[变量库](#variable-library-for-environment-promotion)
- **替换池级库安装**，改用附加在工作区或笔记本级别的 Fabric Environments

### 推荐
- **优先使用 OneLake 快捷方式，而非完整复制数据** — 将现有 ADLS Gen2 容器挂载为快捷方式，而不是在迁移期间重新摄取数据
- **开发/测试迁移使用 Fabric Starter Pool** — 消除 Synapse 按需池固有的池预热等待时间
- **使用 Lakehouse SQL Endpoint 直接替代 Serverless SQL Pool 读取功能** — 将现有使用方指向该端点，只需对查询进行极少量更改
- **迁移后的数据采用奖牌架构** — 与 Bronze/Silver/Gold 模式保持一致（请参阅 `e2e-medallion-architecture` skill）
- **增量迁移** — 逐个工作负载进行迁移和验证，而不是执行一次性整体切换
- **参数化 notebook** — 无需更改代码即可在不同环境间升级（dev → test → prod）

### 避免
- **不要将目标 notebook 用作迁移编排依赖项** — 生成的 notebook 是必需的输出，并且会在不执行的情况下发布
- **不要将 PolyBase `CREATE EXTERNAL TABLE` DDL 复制粘贴到 Fabric Warehouse 中** — 应改写为 `COPY INTO`，或使用 Lakehouse 访问外部数据
- **不要假定 Synapse Linked Service 连接字符串可以复用** — 必须将凭据和端点重新配置为 Fabric Data Connections
- **不要在 notebook 单元格中安装库**（运行时执行 `%pip install`）以用于生产工作负载 — 使用 Fabric Environments 实现可重现、带版本控制的库管理
- **不要原样迁移 Dedicated SQL Pool 分布提示**（`HASH`、`ROUND_ROBIN`、`REPLICATE`）— 请将其移除；Fabric Warehouse 会自动处理分布
- **不要将 `wasb://` 或 `abfss://container@storageaccount.dfs.core.windows.net/` 路径用作主要数据路径** — 将数据访问迁移到 OneLake `abfss://workspace@onelake.dfs.fabric.microsoft.com/` 路径

---

## 示例

完整的前后对比示例请参阅 [code-patterns.md](resources/code-patterns.md)。主要快速参考：

**`mssparkutils.env` → `notebookutils.runtime`**

```python
# Synapse
workspace = mssparkutils.env.getWorkspaceName()

# Fabric
workspace = notebookutils.runtime.context["currentWorkspaceName"]
```

**Linked Service 凭据 → Key Vault 机密**

```python
# Synapse
conn = mssparkutils.credentials.getConnectionStringOrCreds("MyLinkedService")

# Fabric
conn = notebookutils.credentials.getSecret("https://myvault.vault.azure.net/", "my-secret")
```

**Dedicated SQL Pool DDL → Fabric Warehouse DDL**

```sql
-- Synapse (remove distribution hints)
CREATE TABLE dbo.Fact (...) WITH (DISTRIBUTION = HASH(id), CLUSTERED COLUMNSTORE INDEX);

-- Fabric Warehouse
CREATE TABLE dbo.Fact (...);
```

---

## 功能对等性参考

完整的 Synapse → Fabric 功能矩阵（28 项功能）、T-SQL 功能范围差异和 Spark 配置差异，请参阅 [feature-parity.md](resources/feature-parity.md)。

> **主要差距**（⚠️/❌）：`spark.read.synapsesql()` 由 JDBC/快捷方式取代 · Linked Services 重新设计为 Data Connections/Shortcuts · 仅部分支持外部 HMS（迁移为快捷方式）· `mssparkutils.env` 重命名为 `notebookutils.runtime` · 结果集缓存 ❌ · 工作负载管理 ❌ · PolyBase → `COPY INTO`

---

## 迁移注意事项——快速参考

包含代码示例和多选项解决方案的完整故障排除指南位于 [migration-gotchas.md](resources/migration-gotchas.md)。本摘要列出了关键问题，便于在迁移期间快速浏览：

| # | 标志 ID | 问题 | 严重程度 | 是否阻塞？ | 解决方案摘要 |
|---|---|---|---|---|---|
| G1 | `SYNAPSESQL_NO_EQUIVALENT` | `spark.read.synapsesql()` 在 Fabric 中没有等效功能 | 高 | 是 | 替换为 OneLake 快捷方式读取、Warehouse JDBC 或数据管道 |
| G2 | `LIBRARY_VERSION_CONFLICT` | 自定义库版本与 Fabric Runtime 冲突 | 中 | 可能 | 在 Environment 中固定兼容版本，或寻找 Fabric 原生替代方案 |
| G3 | `DELTA_PROTOCOL_MISMATCH` | Delta 协议版本不兼容 | 高 | 是 | 使用匹配的协议重写表（`delta.minReaderVersion`/`minWriterVersion`） |
| G4 | `SECURITY_MODEL_INCOMPATIBLE` | Synapse 托管标识/IP 防火墙不可移植 | 中 | 是 | 重新配置为 Workspace Identity + Fabric Managed Private Endpoints |
| G5 | `GPU_POOL_UNSUPPORTED` | Fabric 中不提供 GPU 加速的 Spark 池 | 高 | 是 | 迁移阻塞项——将工作负载保留在 Synapse 中或使用 Azure ML |
| G6 | `DOTNET_SPARK_UNSUPPORTED` | 不支持 .NET for Spark（C#/F# SJD） | 高 | 是 | 迁移阻塞项——使用 PySpark 重写或保留在 Synapse 中 |
| G7 | `NULLABLE_POOL_REFERENCE` | `bigDataPool`/`targetBigDataPool` 字段为 `null`（而不是缺失）——会导致 `NoneType` 崩溃 | 中 | 否 | 使用 `(x.get("bigDataPool") or {}).get(...)` 模式 |
| G8 | `SESSION_CONFIG_IGNORED` | 某些 `%%configure` 键在 Fabric 中会被静默忽略 | 低 | 否 | 删除不受支持的键；使用 Environment 进行池级配置 |
| G9 | `SHORTCUT_CONNECTION_FAILED` | ADLS 快捷方式创建失败（连接/权限问题） | 高 | 部分 | 验证连接凭据类型（Key > WorkspaceIdentity > OAuth2）和 RBAC |

---

## 迁移后：后续步骤

完成阶段 0–3 和验证后，将后续持续运维工作移交给以下配套技能：

### 智能体式探索工作流

仅当另行批准的流程已将数据加载到 Fabric Lakehouse 后，才使用此序列。此技能中的 Dedicated Pool 到 Lakehouse 模式仅迁移架构和代码构件，因此必须在构件验证后停止，且不得运行此工作流。

对于明确包含已批准的数据移动和数据验证的迁移：

1. **发现** → 通过 Lakehouse SQL Endpoint（`sqldw-cli`）列出架构、表和行数
2. **采样** → 对已迁移的表执行 `SELECT TOP 5`，以验证数据完整性
3. **验证** → 运行 [validation-testing.md](resources/validation-testing.md) 中的验证检查（V1–V6）
4. **探索** → 使用 `spark-cli` 或 `sqldw-cli`，针对已迁移的数据编写 Spark 或 T-SQL 查询
5. **构建** → 使用 `e2e-medallion-architecture` 创建 Gold 层聚合（Bronze → Silver → Gold）
6. **使用** → 使用 `semantic-model-authoring` 构建语义模型和报表

### 配套 Skill 交叉引用

| 迁移后任务 | Skill | 使用场景 |
|---|---|---|
| 交互式湖仓 SQL 查询 | `sqldw-cli` | 通过 SQL 终结点探索迁移后的数据 |
| 交互式 PySpark 探索 | `spark-cli` | 对迁移后的湖仓执行临时 Spark 查询 |
| Notebook 和 SJD 创作（新建） | `spark-cli` | 在迁移后创建新的 Spark 项 |
| 奖牌架构建设 | `e2e-medallion-architecture` | 在直接迁移后构建青铜层/白银层/黄金层结构 |
| Warehouse 性能监控 | `sqldw-cli` | 诊断 Fabric Warehouse 上的慢查询 |
| 语义模型创建 | `semantic-model-authoring` | 基于迁移后的数据构建 Power BI 模型 |
| 报表使用与 DAX | `fabriciq` | 查询现有语义模型 |
| KQL 分析 | `eventhouse-cli` | 将实时工作负载迁移到 Eventhouse 时 |

### 用于环境提升的变量库

迁移后，应通过将配置集中到一个**变量库**项中，避免硬编码工作区 ID 和项 ID：

```python
# Read config from Variable Library — works in notebooks
lib = notebookutils.variableLibrary.getLibrary("MigrationConfig")
lakehouse_name = lib.lakehouse_name
workspace_id = lib.workspace_id

# ❌ WRONG — .get() does not exist
# notebookutils.variableLibrary.get("MigrationConfig", "lakehouse_name")
```

- 使用**值集**（`valueSets/dev.json`、`valueSets/prod.json`）在不同环境间进行提升，无需更改代码
- 布尔值会以字符串形式返回——应使用 `.lower() == "true"` 进行比较，而不是 `bool()`
- 在数据管道中，通过 `@pipeline().libraryVariables.<name>` 引用（而不是 `@variables()`）
- 完整的变量库模式 → 请参阅 [common/notebook-authoring/context-and-params.md § 变量库](../../common/notebook-authoring/context-and-params.md#variable-library)