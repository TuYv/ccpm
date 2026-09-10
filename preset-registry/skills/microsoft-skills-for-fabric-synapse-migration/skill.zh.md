---
name: synapse-migration
description: "Ports Azure Synapse workloads to Microsoft Fabric: Spark pools/notebooks, Lake Databases, Linked Services, and Dedicated SQL Pool schema and stored procedure code to Lakehouse Spark SQL from live or offline DACPAC/SQL-project artifacts, without moving source rows. Use for 'Dedicated SQL Pool schema and code to Lakehouse' and Synapse-to-Fabric migration. For pipelines use pipeline-migration."
---
> **遥测 — 强制要求。** 每次 `api.fabric.microsoft.com` 调用都必须携带
> `x-ms-fabric-skill: synapse-migration`（`az rest`：`--headers "x-ms-fabric-skill=synapse-migration"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该参数 — 仍必须添加。

> **关键说明**
> 1. 要从工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 进行筛选
> 2. 要根据工作区 ID、项类型和项名称查找项详细信息（包括其 ID）：列出该工作区中该类型的所有项，然后使用 JMESPath 进行筛选
> 3. `mssparkutils` 和 `notebookutils` 在大多数情况下共享相同的 API 表面 — 主要变化是命名空间
> 4. Fabric 中没有与链接服务直接对应的 REST API — 它们将由数据连接（用于外部源）和 OneLake 快捷方式（用于存储挂载）替代
> 5. 专用 SQL 池到 Fabric Lakehouse 的迁移路径由源端和功能决定。**必须严格按以下顺序完成这些阶段：**
>    1. **差距评估（首要强制步骤）**：使用 `dedicated-pool-gap-assessment.md` 运行兼容性评估，在尝试任何转换**之前**识别不受支持的功能、阻塞因素和迁移风险。
>    2. **用户批准（必需）**：评估完成后，呈现存储过程到笔记本的 `1:1`、`N:1` 和 `N:N` 映射策略，并要求用户明确批准完整映射、目标名称、依赖分组和工作区位置。在继续之前等待明确批准。
>    3. **清单创建（必需）**：创建 `migration-manifest.json`，用于跟踪所有对象、已批准的映射、转换状态和部署检查点。每个阶段完成后以原子方式更新清单。
>    4. **转换**：只有在清单中记录批准后，才生成构件。
>    **`1:1`、`N:1` 和 `N:N` 映射仅适用于存储过程，不适用于视图。视图属于类似表的架构对象，通过 Livy 以 SQL 视图定义的形式进行部署；它们绝不会转换为笔记本。**无论采用哪种已批准的策略，都必须将每个过程保留为可独立追踪的源端决策。存储过程转换逻辑必须使用可读的 Spark SQL `%%sql` 单元格，而不是 PySpark 或 DataFrame API。生成的笔记本是输出，不是编排依赖项。
> 6. 将源专用池视为只读。绝不要在源端创建示例数据或合成数据、架构、表、视图、过程、用户、角色或授权。不要运行源端 DDL、DML 或存储过程。此工作流中的源端操作仅限于元数据发现和基于元数据的验证；如有任何源端变更请求，将其转交给单独且明确限定范围的工作流。
> 7. 专用池数据迁移不在范围内。绝不要导出、暂存、复制、上传、创建快捷方式、传输或加载源表行数据，也绝不要运行行级或业务结果等价性查询。此技能仅迁移架构和可执行代码构件。
> 8. 定期输出迁移状态。在每一步开始前进行宣布，在每个对象或检查点完成或失败时进行报告；长时间运行的操作期间至少每 30-60 秒发出一次简洁的心跳；每个阶段结束时汇总已完成/失败/跳过/待处理的数量。状态输出必须包含阶段、步骤、对象、状态、耗时和下一步操作。状态输出不得包含凭据、令牌、连接字符串和敏感数据值。
> 9. 对于大型或复杂的存储过程，必须使用确定性的源代码块清单证明转换覆盖范围，并且只能从经过哈希验证的不可变部署包发布。每个代码块都必须完成转换、经批准后明确排除，或经过人工审查和批准；仅笔记本语法成功并不足够。
> 10. 在生成专用池构件之前，读取 `resources/dedicated-pool-to-lakehouse.md` 和 `resources/dedicated-pool-conversion.md`。在清单 `parameterMappings` 中，使用 `sourceParameter` 记录发现的源名称；`parameterName` 保留用于笔记本 `%%configure` 中对象值 `conf` 条目。
> 11. 本地或离线的专用池构件请求仍需要使用此技能。对于大型或复杂的过程，在生成构件之前还必须读取 `resources/dedicated-pool-large-procedure-audit.md`。

# Synapse Analytics → Microsoft Fabric 迁移

## 前置知识

这些配套文档提供了一般性的 Fabric REST 模式。**请勿预先阅读这些文档**——仅当某个特定阶段需要使用本技能资源文件中尚未涵盖的模式时，才参考相应文档：

- [COMMON-CORE.md](../../common/COMMON-CORE.md) — Fabric REST API 通用模式、身份验证与令牌受众，以及使用 JMESPath 发现项目
- [COMMON-CLI.md](../../common/COMMON-CLI.md) — `az rest` / `az login` CLI 模式、身份验证方案
- [SPARK-AUTHORING-CORE.md](../../common/SPARK-AUTHORING-CORE.md) — Notebook/lakehouse 创建（已在 [spark-item-migration.md](resources/spark-item-migration.md) 和 [lake-database-migration.md](resources/lake-database-migration.md) 中涵盖）
- [SQLDW-AUTHORING-CORE.md](../../common/SQLDW-AUTHORING-CORE.md) — Fabric Warehouse T-SQL（委托给 `sqldw-cli` skill）

> 身份验证、API 终结点和项目负载已在本技能自身的文件中完整记录。上述通用文档仅作为备用参考。

---

## 目录

| 主题 | 参考 |
|---|---|
| **迁移编排器** | [migration-orchestrator.md](resources/migration-orchestrator.md) |
| **专用池 → Lakehouse 迁移** | [dedicated-pool-to-lakehouse.md](resources/dedicated-pool-to-lakehouse.md) |
| 专用池发现 | [dedicated-pool-discovery.md](resources/dedicated-pool-discovery.md) |
| 专用池差距评估 | [dedicated-pool-gap-assessment.md](resources/dedicated-pool-gap-assessment.md) |
| 专用池转换 | [dedicated-pool-conversion.md](resources/dedicated-pool-conversion.md) |
| 专用池大型过程审计 | [dedicated-pool-large-procedure-audit.md](resources/dedicated-pool-large-procedure-audit.md) |
| 专用池部署 | [dedicated-pool-deployment.md](resources/dedicated-pool-deployment.md) |
| 专用池验证 | [dedicated-pool-validation.md](resources/dedicated-pool-validation.md) |
| API 驱动的迁移工作流 | [§ API 驱动的迁移工作流](#api-driven-migration-workflow) |
| 迁移工作负载映射 | [§ 迁移工作负载映射](#migration-workload-map) |
| Spark 池 → Environment 迁移 | [spark-pool-migration.md](resources/spark-pool-migration.md) |
| Lake Database → Lakehouse 迁移 | [lake-database-migration.md](resources/lake-database-migration.md) |
| 外部 Hive Metastore → Lakehouse 迁移 | [external-hms-migration.md](resources/external-hms-migration.md) |
| Notebook 和 SJD 迁移 | [spark-item-migration.md](resources/spark-item-migration.md) |
| 库兼容性（Synapse 与 Fabric RT 1.3） | [library-compatibility.md](resources/library-compatibility.md) |
| 连接器重构（Kusto、Cosmos DB、ADLS OAuth） | [connector-refactoring.md](resources/connector-refactoring.md) |
| `mssparkutils` → `notebookutils` API 映射 | [utility-api-mapping.md](resources/utility-api-mapping.md) |
| Linked Services → Data Connections / Shortcuts | [connectivity-migration.md](resources/connectivity-migration.md) |
| 迁移前后代码模式（包括 Catalog API 差距） | [code-patterns.md](resources/code-patterns.md) |
| 迁移报告（包含 Fabric 门户链接） | [migration-report.md](resources/migration-report.md) |
| 迁移故障排除指南 | [migration-gotchas.md](resources/migration-gotchas.md) |
| 验证与测试 | [validation-testing.md](resources/validation-testing.md) |
| 安全性与治理（生产就绪性） | [security-governance.md](resources/security-governance.md) |
| T-SQL 与 Spark 配置差异 | [§ T-SQL 与 Spark 配置差异](#t-sql--spark-configuration-differences) |
| 容量大小调整参考 | [§ 容量大小调整参考](#capacity-sizing-reference) |
| 必须 / 优先 / 避免 | [§ 必须 / 优先 / 避免](#must--prefer--avoid) |
| 功能对等性参考 | [§ 功能对等性参考](#feature-parity-reference) |
| 迁移注意事项 — 快速参考 | [§ 迁移注意事项](#migration-gotchas--quick-reference) + [migration-gotchas.md](resources/migration-gotchas.md) |
| 迁移后：接下来做什么 | [§ 迁移后：接下来做什么](#post-migration-whats-next) |

### 上下文加载指南

> **重要 — 仅加载所需内容。** 不要预先读取所有资源文件。请根据当前执行的阶段，加载特定文件：

| 何时 | 读取此文件 | 行数 |
|---|---|---|
| 用户要求迁移工作区（完整编排） | [migration-orchestrator.md](resources/migration-orchestrator.md) | ~1264 |
| **用户要求将 Dedicated SQL Pool 迁移到 Lakehouse** | **[dedicated-pool-to-lakehouse.md](resources/dedicated-pool-to-lakehouse.md) + [dedicated-pool-conversion.md](resources/dedicated-pool-conversion.md)** | **~190** |
| 发现 Dedicated Pool 后的风险报告或目标设计审批 | [dedicated-pool-gap-assessment.md](resources/dedicated-pool-gap-assessment.md) | ~180 |
| 大型或复杂的存储过程转换 | [dedicated-pool-large-procedure-audit.md](resources/dedicated-pool-large-procedure-audit.md) | ~130 |
| 阶段 0：Spark Pools → Environments | [spark-pool-migration.md](resources/spark-pool-migration.md) | ~290 |
| 阶段 1：Databases → Lakehouses（内置 HMS） | [lake-database-migration.md](resources/lake-database-migration.md) | ~574 |
| 阶段 1：Databases → Lakehouses（外部 HMS） | [external-hms-migration.md](resources/external-hms-migration.md) | ~388 |
| 阶段 2–3：Notebooks 和 SJD | [spark-item-migration.md](resources/spark-item-migration.md) | ~326 |
| 代码重构（mssparkutils、连接器） | [utility-api-mapping.md](resources/utility-api-mapping.md) + [connector-refactoring.md](resources/connector-refactoring.md) + [code-patterns.md](resources/code-patterns.md) | ~588 |
| 迁移后验证 | [validation-testing.md](resources/validation-testing.md) | ~487 |
| 故障排除 | [migration-gotchas.md](resources/migration-gotchas.md) | ~225 |
| 生产环境安全设置 | [security-governance.md](resources/security-governance.md) | ~926 |
| 库版本差异 | [library-compatibility.md](resources/library-compatibility.md) | ~106 |
| 生成迁移报告 | [migration-report.md](resources/migration-report.md) | ~360 |
| 容量调整与 SKU 规划 | [capacity-sizing.md](resources/capacity-sizing.md) | ~85 |
| 功能对等矩阵 | [feature-parity.md](resources/feature-parity.md) | ~65 |

---

## 基于 API 的迁移工作流

此技能支持通过 REST API 以编程方式迁移 Synapse Spark 项目（无需使用基于 UI 的 Migration Assistant）。

### 身份验证

| 目标 | 令牌受众 |
|---|---|
| Synapse ARM（管理平面） | `https://management.azure.com` |
| Synapse Data Plane | `https://dev.azuresynapse.net` |
| Fabric REST API | `https://api.fabric.microsoft.com` |

> 使用 [COMMON-CLI § Authentication Recipes](../../common/COMMON-CLI.md#authentication-recipes) 中的令牌获取方案，并使用上述受众。

### 迁移阶段（按顺序执行）

| 阶段 | Synapse 源 | Fabric 目标 | 资源 |
|---|---|---|---|
| 阶段 0 | Spark Pool | Environment | [spark-pool-migration.md](resources/spark-pool-migration.md) |
| 阶段 1 | Lake Database（内置 HMS） | Lakehouse | [lake-database-migration.md](resources/lake-database-migration.md) |
| 阶段 1 | External Hive Metastore | Lakehouse | [external-hms-migration.md](resources/external-hms-migration.md) |
| 阶段 1b | 临时 `abfss://` 存储路径 | OneLake Shortcuts | [migration-orchestrator.md](resources/migration-orchestrator.md)（仅限 migrate-and-modernize） |
| 阶段 2 | Notebooks | Notebook | [spark-item-migration.md](resources/spark-item-migration.md) |
| 阶段 3 | Spark Job Definitions | SJD | [spark-item-migration.md](resources/spark-item-migration.md) |
| 最终阶段 | 验证与测试 | — | [validation-testing.md](resources/validation-testing.md) |
| 可选 | 安全与治理 | — | [security-governance.md](resources/security-governance.md) |

> **阶段顺序很重要**：环境（阶段 0）必须先存在，笔记本/SJD 才能绑定到这些环境。Lakehouse（阶段 1）必须先存在，笔记本才能绑定到这些 Lakehouse（阶段 2）。

> 如需了解包含子步骤、决策点、直接迁移与现代化路径以及错误恢复的完整执行流程，请参阅 [migration-orchestrator.md](resources/migration-orchestrator.md)。

### REST API 快速参考

所有 Synapse 和 Fabric API 端点及请求/响应示例都位于 [migration-orchestrator.md](resources/migration-orchestrator.md)（步骤 2a–2e）。身份验证令牌：

| 目标 | 令牌受众 |
|---|---|
| Synapse ARM | `https://management.azure.com` |
| Synapse 数据平面 | `https://dev.azuresynapse.net` |
| Fabric REST API | `https://api.fabric.microsoft.com` |

> **API 文档**：[Synapse ARM](https://learn.microsoft.com/en-us/rest/api/synapse) · [Synapse 数据平面](https://learn.microsoft.com/en-us/rest/api/synapse/data-plane) · [Fabric 项](https://learn.microsoft.com/en-us/rest/api/fabric/core/items) · [Fabric 快捷方式](https://learn.microsoft.com/en-us/rest/api/fabric/core/onelake-shortcuts) · [Fabric 连接](https://learn.microsoft.com/en-us/rest/api/fabric/core/connections) · [Fabric 环境](https://learn.microsoft.com/en-us/rest/api/fabric/environment)

---

## 迁移工作负载映射

使用此表确定每个 Synapse 组件对应的 Fabric 目标：

| Synapse 组件 | Fabric 目标 | 备注 |
|---|---|---|
| **Spark 池**（笔记本、作业） | **Fabric 环境 + 笔记本或 Spark 作业定义** | 使用此技能中的 Spark 专用资源迁移 Spark 配置、库和代码。 |
| **专用 SQL 池** | **Fabric Lakehouse**（存储过程 → Spark SQL 笔记本；表/视图 → Lakehouse 对象）或 **Fabric Warehouse** | **Lakehouse 路径**：使用 SqlPackage/目录查询提取元数据，评估预计的工作区项需求，要求用户提供并批准存储过程与笔记本之间的 `1:1`、`N:1` 或 `N:N` 映射（仅适用于存储过程，不适用于视图），然后转换架构和代码工件。表和视图通过 Livy 作为 Lakehouse 架构对象进行部署；只有存储过程会转换为笔记本。源表行不会迁移；请参阅 [dedicated-pool-to-lakehouse.md](resources/dedicated-pool-to-lakehouse.md)。**Warehouse 路径**：将 T-SQL 编写委托给 `sqldw-cli`。 |
| **无服务器 SQL 池** | **Lakehouse SQL 终结点** | 只读 Delta/Parquet 查询；不需要 DDL |
| **Synapse 管道** | **Fabric 数据管道** | 活动类型、触发器和表达式总体上兼容。*管道迁移资源尚不可用——这是单独的迁移轨道。* |
| **Synapse Link for Cosmos DB / SQL** | **Fabric 镜像** | 原生镜像取代 Synapse Link 连接器模式。*此技能不涵盖此项。* |
| **链接服务** | **数据连接**（外部）/ **OneLake 快捷方式**（存储） | 请参阅 [connectivity-migration.md](resources/connectivity-migration.md) |
| **集成数据集** | **Fabric 管道源/接收器配置** | 数据集定义会内联到 Fabric 的管道活动中。*此技能不涵盖此项。* |
| **托管虚拟网络** | **Fabric 托管专用终结点** | 在 Fabric 容量设置中进行配置 |
| **Synapse Studio** | **Fabric 工作区** | 所有工件类型都位于同一工作区中，并支持 Git 集成 |

### 决策树：选择哪种 Fabric Spark 工作负载？

```text
Synapse Spark 工作负载
├── 交互式笔记本与数据探索 → Fabric Notebook（附加到 Lakehouse）
├── 已计划/生产作业 → Spark Job Definition (SJD)
├── 对文件/Delta 使用 T-SQL → Lakehouse SQL Endpoint（无需迁移 — 只需指向 OneLake）
└── 实时数据摄取 → Fabric Eventstream + Lakehouse
```

---

## T-SQL 与 Spark 配置差异

有关详细的 T-SQL 功能差异（PolyBase → `COPY INTO`、分布提示、结果集缓存）以及 Spark 配置映射（池、`%%configure`、运行时版本），请参阅 [feature-parity.md](resources/feature-parity.md)。

> **关键操作**：移除 `DISTRIBUTION = HASH(col)` 提示，将 `CREATE EXTERNAL TABLE` 替换为 `COPY INTO`，将 `spark.read.synapsesql()` 替换为 OneLake 快捷方式或 JDBC。将 T-SQL 编写委托给 `sqldw-cli`。

---

## 容量大小调整参考

有关 Synapse 池 → Fabric SKU 映射表、大小调整决策指南和成本模型比较，请参阅 [capacity-sizing.md](resources/capacity-sizing.md)。

> **快速指南**：开发/测试 = F8–F16，使用 Starter Pool；标准生产环境 = F32–F64；企业级 = F128+。使用 Fabric Trial（免费 F64，60 天）进行迁移验证。

---

## 必须执行 / 优先执行 / 避免

### 必须执行
- **保留存储过程输入契约** — 通过 Fabric Notebook Activity 参数映射到首个单元格中的 `%%configure`，让每个受支持的源输入都能在外部进行覆盖；仅将源默认值保留为 `defaultValue`，绝不能用字面量替换参数使用，也不能臆造预览默认值；当必需输入没有源默认值时，阻止自动发布
- **完成发现后批准存储过程笔记本数量关系** — 计算预计的工作区项需求，呈现 `1:1`、`N:1` 和 `N:N` 选项；在用户提供并批准完整的映射、目标名称、依赖分组和工作区放置位置之前，阻止转换；在每种策略下保留每个过程的源端决策和源代码块溯源信息
- **按源代码块审计大型过程转换** — 生成每次运行具有确定性的账本/验证器脚本，要求源字节覆盖率达到 100% 且不存在重叠，并为每个代码块指定可部署的处置方式；仅在声明的限制范围内重试失败的代码块；默认保留审计/日志记录行为；仅发布经过哈希验证的 `ReadyForPublication` 包中的确切字节
- **对非过程阶段使用直接 API** — 使用 SqlPackage/DMV 进行发现，使用 Fabric REST 进行项管理，使用 Fabric Livy 语句执行架构和 Delta 操作
- **将所有 `mssparkutils` 导入替换为 `notebookutils`** — 完整的命名空间表请参阅 [utility-api-mapping.md](resources/utility-api-mapping.md)
- **将所有 Linked Services 替换为** Fabric Data Connections（用于外部数据库/服务）或 OneLake Shortcuts（用于 ADLS Gen2 / Blob 存储挂载）— 请参阅 [connectivity-migration.md](resources/connectivity-migration.md)
- **将 `spark.read.synapsesql()` 替换为** Lakehouse 快捷方式读取，或连接到 Fabric Warehouse SQL endpoint 的 JDBC 连接
- **迁移后针对目标 Fabric Runtime 版本重新测试所有笔记本** — Spark 次版本差异可能会引发已弃用 API 警告
- **将所有工作区/项 ID 外部化** — 绝不能硬编码；使用管道参数或 [Variable Libraries](#variable-library-for-environment-promotion)
- **将池级库安装替换为** 附加到工作区或笔记本级别的 Fabric Environments

### 优先选择
- **优先使用 OneLake Shortcuts，而不是完整复制数据** — 在迁移期间，将现有 ADLS Gen2 容器挂载为快捷方式，而不是重新摄取数据
- **将 Fabric Starter Pool 用于开发/测试迁移** — 消除 Synapse 按需池固有的池预热等待时间
- **使用 Lakehouse SQL Endpoint 作为 Serverless SQL Pool 读取操作的直接替代方案** — 让现有使用者指向该端点，只需对查询进行最少修改
- **对迁移的数据采用 Medallion architecture** — 遵循 Bronze/Silver/Gold 模式（参见 `e2e-medallion-architecture` skill）
- **采用增量迁移** — 按工作负载逐个迁移和验证，而不是执行一次性切换
- **使用参数化笔记本**，以便在不同环境之间推广（开发 → 测试 → 生产），而无需修改代码

### 避免
- **不要将目标笔记本用作迁移编排依赖项** — 生成的笔记本是必需的输出内容，发布时不会执行
- **不要将 PolyBase `CREATE EXTERNAL TABLE` DDL 直接复制粘贴到 Fabric Warehouse** — 应改写为 `COPY INTO`，或使用 Lakehouse 访问外部数据
- **不要假设 Synapse Linked Service 连接字符串可以重复使用** — 必须将凭据和端点重新配置为 Fabric Data Connections
- **不要在生产工作负载的笔记本单元格中安装库**（运行时使用 `%pip install`） — 应使用 Fabric Environments，以实现可复现、版本化的库管理
- **不要原样迁移 Dedicated SQL Pool 分布提示**（`HASH`、`ROUND_ROBIN`、`REPLICATE`） — 将其移除；Fabric Warehouse 会自动处理分布
- **不要将 `wasb://` 或 `abfss://container@storageaccount.dfs.core.windows.net/` 路径作为主要数据路径** — 将数据访问迁移到 OneLake `abfss://workspace@onelake.dfs.fabric.microsoft.com/` 路径

---

## 示例

完整的迁移前后示例请参见 [代码模式](resources/code-patterns.md)。以下是关键的快速参考：

**`mssparkutils.env` → `notebookutils.runtime`**

```python
# Synapse
workspace = mssparkutils.env.getWorkspaceName()

# Fabric
workspace = notebookutils.runtime.context["currentWorkspaceName"]
```

**Linked Service 凭据 → Key Vault 密钥**

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

完整的 Synapse → Fabric 功能矩阵（28 项功能）、T-SQL 功能覆盖范围差异以及 Spark 配置差异，请参见 [功能对等性](resources/feature-parity.md)。

> **主要差异**（⚠️/❌）：`spark.read.synapsesql()` 已由 JDBC/shortcuts 替代 · Linked Services 重新设计为 Data Connections/Shortcuts · 外部 HMS 支持不完整（迁移为 shortcuts）· `mssparkutils.env` 重命名为 `notebookutils.runtime` · 结果集缓存 ❌ · 工作负载管理 ❌ · PolyBase → `COPY INTO`

---

## 迁移注意事项 — 快速参考

完整的故障排除指南（包含代码示例和多种解决方案）位于 [migration-gotchas.md](resources/migration-gotchas.md)。以下摘要列出了迁移期间便于快速浏览的关键问题：

| # | 标志 ID | 问题 | 严重性 | 是否阻塞？ | 解决方案摘要 |
|---|---|---|---|---|---|
| G1 | `SYNAPSESQL_NO_EQUIVALENT` | `spark.read.synapsesql()` 没有 Fabric 等效方案 | 高 | 是 | 替换为 OneLake shortcut 读取、Warehouse JDBC 或 Data Pipeline |
| G2 | `LIBRARY_VERSION_CONFLICT` | 自定义库版本与 Fabric Runtime 冲突 | 中 | 可能 | 在 Environment 中固定兼容版本，或寻找 Fabric 原生替代方案 |
| G3 | `DELTA_PROTOCOL_MISMATCH` | Delta 协议版本不兼容 | 高 | 是 | 使用匹配的协议（`delta.minReaderVersion`/`minWriterVersion`）重写表 |
| G4 | `SECURITY_MODEL_INCOMPATIBLE` | Synapse 托管标识 / IP 防火墙无法移植 | 中 | 是 | 重新配置为 Workspace Identity + Fabric Managed Private Endpoints |
| G5 | `GPU_POOL_UNSUPPORTED` | Fabric 不提供 GPU 加速 Spark 池 | 高 | 是 | 迁移阻塞项 — 将工作负载保留在 Synapse 中，或使用 Azure ML |
| G6 | `DOTNET_SPARK_UNSUPPORTED` | 不支持 .NET for Spark（C#/F# SJDs） | 高 | 是 | 迁移阻塞项 — 重写为 PySpark，或保留在 Synapse 中 |
| G7 | `NULLABLE_POOL_REFERENCE` | `bigDataPool`/`targetBigDataPool` 字段为 `null`（而不是缺失）— 会导致 `NoneType` 崩溃 | 中 | 否 | 使用 `(x.get("bigDataPool") or {}).get(...)` 模式 |
| G8 | `SESSION_CONFIG_IGNORED` | 某些 `%%configure` 键在 Fabric 中会被静默忽略 | 低 | 否 | 移除不受支持的键；使用 Environment 配置池级别设置 |
| G9 | `SHORTCUT_CONNECTION_FAILED` | ADLS shortcut 创建失败（连接 / 权限问题） | 高 | 部分 | 验证连接凭据类型（Key > WorkspaceIdentity > OAuth2）和 RBAC |

---

## 迁移后：下一步

完成阶段 0–3 和验证后，将后续运营工作交接给以下配套 skills：

### 代理式探索工作流

仅在单独批准的流程已将数据加载到 Fabric Lakehouses 后，才能使用此序列。本 skill 中的 Dedicated Pool 到 Lakehouse 模式只迁移架构和代码工件，因此必须在工件验证后停止，不得运行此工作流。

对于明确包含已批准的数据移动和数据验证的迁移：

1. **发现** → 通过 Lakehouse SQL Endpoint（`sqldw-cli`）列出架构、表和行数
2. **抽样** → 对迁移后的表执行 `SELECT TOP 5`，验证数据完整性
3. **验证** → 运行 [validation-testing.md](resources/validation-testing.md) 中的验证检查（V1–V6）
4. **探索** → 使用 `spark-cli` 或 `sqldw-cli`，针对迁移后的数据编写 Spark 或 T-SQL 查询
5. **构建** → 使用 `e2e-medallion-architecture` 创建 Gold 层聚合（Bronze → Silver → Gold）
6. **使用** → 使用 `semantic-model-authoring` 构建语义模型和报表

### 配套 Skill 交叉引用

| 迁移后任务 | Skill | 使用时机 |
|---|---|---|
| 交互式 Lakehouse SQL 查询 | `sqldw-cli` | 通过 SQL Endpoint 探索已迁移的数据 |
| 交互式 PySpark 探索 | `spark-cli` | 对已迁移的 Lakehouse 执行临时 Spark 查询 |
| Notebook 与 SJD 编写（新建） | `spark-cli` | 迁移后创建新的 Spark 项 |
| Medallion 架构构建 | `e2e-medallion-architecture` | 在 lift-and-shift 后构建 Bronze/Silver/Gold 分层 |
| Warehouse 性能监控 | `sqldw-cli` | 诊断 Fabric Warehouse 中的慢查询 |
| 语义模型创建 | `semantic-model-authoring` | 基于已迁移的数据构建 Power BI 模型 |
| 报表使用与 DAX | `fabriciq` | 查询现有语义模型 |
| KQL 分析 | `eventhouse-cli` | 迁移实时工作负载到 Eventhouse 时 |

### 用于环境提升的变量库

迁移后，避免将工作区/项 ID 硬编码，而应将配置集中在 **Variable Library** 项中：

```python
# Read config from Variable Library — works in notebooks
lib = notebookutils.variableLibrary.getLibrary("MigrationConfig")
lakehouse_name = lib.lakehouse_name
workspace_id = lib.workspace_id

# ❌ WRONG — .get() does not exist
# notebookutils.variableLibrary.get("MigrationConfig", "lakehouse_name")
```

- 使用 **Value Sets**（`valueSets/dev.json`、`valueSets/prod.json`）在不同环境之间提升，而无需修改代码
- 布尔值会以字符串形式返回——使用 `.lower() == "true"` 进行比较，而不是使用 `bool()`
- 在 Data Pipelines 中，通过 `@pipeline().libraryVariables.<name>` 引用（而不是 `@variables()`）
- 完整的 Variable Library 模式 → 参见 [common/notebook-authoring/context-and-params.md § Variable Library](../../common/notebook-authoring/context-and-params.md#variable-library)