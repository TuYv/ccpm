---
name: e2e-fabric-cost-estimation
description: >
  Estimate Microsoft Fabric capacity costs before migration by analyzing existing workload
  profiles (Spark, SQL, Power BI, Real-Time Intelligence) and recommending optimal SKU sizing,
  billing modes, and Reserved Instance strategies. Use when the user wants to:
  (1) estimate Fabric costs for a migration, (2) size a Fabric capacity SKU,
  (3) compare Fabric pricing tiers, (4) calculate storage/compute/network costs,
  (5) recommend Reserved vs. Pay-As-You-Go vs. Autoscale billing.
  Trigger phrases are scoped to Fabric capacity cost/sizing to avoid over-routing on generic
  cost, migration, or connection questions.
  Triggers: "estimate fabric cost", "fabric capacity sizing", "fabric sku recommendation",
  "fabric cost estimate", "fabric reserved instance", "fabric capacity pay-as-you-go",
  "fabric autoscale billing".
---
> **遥测 — 强制要求。** 每个对 `api.fabric.microsoft.com` 的调用都必须携带
> `x-ms-fabric-skill: e2e-fabric-cost-estimation`（`az rest`：`--headers "x-ms-fabric-skill=e2e-fabric-cost-estimation"`），
> 包括每次 LRO 轮询、`fabric_lro` 调用和重试。代码片段中可能省略了它，但仍须添加。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 筛选
> 3. **定价因区域而异。** 在查询任何价格之前，始终解析容量所在的 Azure 区域（通过 Fabric REST `GET /v1/capacities`，其返回 `region`/`sku`/`state`，或通过 ARM），或者询问用户；并在每个报价数字旁注明区域。

> **🔴 强制获取实时报价 — 只要回答中包含美元金额，就必须执行。**
> 在提供**任何**美元金额、成本、盈亏平衡点、计费模式比较、RI 与 PAYG 分析、迁移成本或成本工作表之前，你都**必须**运行一个调用 Azure 零售价格 API `https://prices.azure.com/api/retail/prices` 的 shell 命令（`bash`/`powershell`）。此要求无一例外地适用于每个*涉及价格的*回答——Databricks/Synapse 迁移成本、**自动缩放与基础 SKU 的盈亏平衡分析**、RI 与 PAYG 的盈亏平衡分析、成本工作表以及计费模式策略。必须**先**获取实时的每 CU 小时 PAYG 费率（`priceType eq 'Consumption'`、`* Capacity Usage CU` 计量项）、预留期限总价以及 `autoscale for Spark Capacity Usage CU` 费率，然后再进行计算。绝不能使用记忆中的费率或硬编码费率回答涉及价格的问题，也绝不能仅根据公式推算盈亏平衡点。如果计量项查询未返回任何行，请向用户说明——**绝不能**静默回退到硬编码费率（例如，不得假设自动缩放费率为 `$0.18/CU-hr`；自动缩放计量项具有独立费率，必须获取该费率）。
> **例外——纯容量规模估算：** 如果问题可以纯粹以**容量单位**回答且*不包含美元金额*（例如，“哪个 SKU 适合 80 个 CU？”或“P2 对应多少个 CU？”），则属于 CU 计算而非定价，无需获取价格。一旦为该规模估算答案附加美元金额，就必须获取价格。

> **🟠 先澄清，再执行——不要假设默认值。**
> 涉及价格的请求需要两个输入，之后才能获取价格或进行计算：**Azure 区域**和**工作负载配置**（例如，每日 CU 小时数、节点/作业详细信息，或迁移所涉及的源集群规模）。如果缺少其中**任何一项**，你的**首次**回复必须**向用户询问缺少的输入并停止**——不要选择默认区域（绝不能为了“先开始”而假设 `East US` 或任何其他区域），不要调用定价 API，也不要根据假设值生成估算。只有在用户提供缺少的输入后，才能获取实时价格并进行计算。即使强制获取价格规则适用于*最终*涉及价格的回答，先询问仍然是正确的做法。

> **🔴 自动缩放费率是一个独立的计量项——绝不能为其复用基础/PAYG 费率。**
> `autoscale for Spark Capacity Usage CU` 计量项的价格与基础 `* Capacity Usage CU` PAYG 费率**相互独立**。你**必须**通过单独的 API 调用获取该价格，并读取返回的 `retailPrice`。将基础/PAYG 费率（或记忆中的数值，例如 `0.18`）赋给自动缩放变量属于正确性缺陷——例如，**禁止**使用 `autoscaleRate = paygRate` 或 `autoscaleRate = 0.18`。如果自动缩放计量项查询未返回任何行，请列出该区域的所有 Fabric Spark 计量项并将其呈现给用户；绝不能用基础费率替代。

# Fabric 成本估算

## 前置知识

- [COMMON-CORE.md](../../common/COMMON-CORE.md) — Fabric 拓扑、容量概念、身份验证和令牌受众
- [COMMON-CLI.md](../../common/COMMON-CLI.md) — 用于容量发现的 CLI 模式、身份验证方法（`az login`、令牌获取）

---

## 目录

| 主题 | 章节 |
|---|---|
| Fabric 计费模型概述 | [§ 计费模型](#fabric-billing-model) |
| 容量单位（CU）参考 | [§ CU 参考](#capacity-unit-reference) |
| 工作负载成本估算 | [§ 工作负载估算](#workload-cost-estimation) |
| 存储定价 | [§ 存储](#storage-pricing) |
| 网络定价 | [§ 网络](#network-egress-pricing) |
| 计费模式策略 | [§ 计费策略](#billing-mode-strategy) |
| SKU 规模选择决策树 | [§ SKU 规模选择](#sku-sizing-decision-tree) |
| 迁移成本工作表 | [§ 工作表](#migration-cost-worksheet) |
| 定价 API 参考 | [pricing-api-reference.md](resources/pricing-api-reference.md) |
| 必须 / 建议 / 避免 | [§ 必须 / 建议 / 避免](#must--prefer--avoid) |
---

## Fabric 计费模型

Microsoft Fabric 使用**统一容量模型**，所有工作负载共享一个**容量单位（CU）**池。需要了解的计费维度如下：

| 维度 | 说明 | 计费机制 |
|---|---|---|
| **计算（CU 秒）** | 查询、Spark 作业和管道所消耗的处理能力 | 从容量 SKU 中扣除 CU 消耗量 |
| **存储（GB/月）** | 用于 Delta 表、文件和快捷方式的 OneLake 存储 | 按 GB 收取月度费用 |
| **网络出站（GB）** | 离开 Azure 区域的数据 | 按 GB 收取出站费用 |
| **容量预留** | 基础 SKU 承诺（F2–F8192） | 月度或年度承诺 |

### 计费模式

| 模式 | 说明 | 最适合 |
|---|---|---|
| **预留实例（RI）** | 1 年或 3 年承诺；可享受大幅折扣（通过实时 API 计算） | 稳态基础负载 |
| **即用即付（PAYG）** | 按小时计费；无承诺；按完整标价收费 | 测试、不可预测的工作负载 |
| **Spark 自动缩放计费** | 可选择启用的无服务器模型；Spark 作业从容量中卸载，并按 Spark CU 小时计费。Spark 的突发和消峰平滑功能将被禁用；不消耗容量 CU | 将可变的 Spark 支出与稳态容量隔离 |
| **Fabric 试用版** | 试用容量（大小因租户/资格而异——通常最高为 F64，可使用 60 天）；使用前请核实当前试用条款；绝不能据此确定生产环境的容量规模 | 仅用于评估 |

### 容量 SKU 层级 — 实时价格查询

**切勿使用硬编码价格。** 始终在运行时从 Azure Retail Prices API 获取当前价格。

#### 第 1 步：检测客户区域

如果客户已有 Fabric 容量，请通过核心 Fabric REST API 获取其区域、SKU 和状态 — `GET https://api.fabric.microsoft.com/v1/capacities` 会返回每个容量的 `region`、`sku` 和 `state`。Azure Resource Manager（`az resource list`）可作为等效的备用方案；只有 Fabric **Admin** API（`/v1/admin/capacities`）会省略区域。请参阅 [`resources/pricing-api-reference.md`](resources/pricing-api-reference.md#3-fabric-capacity-discovery-fabric-rest--arm) 中的模板。

如果尚不存在容量，请询问用户计划部署到哪个 Azure 区域。

#### 第 2 步：获取实时 Fabric 价格

查询 **Azure Retail Prices API**（公共 API，无需身份验证）。**对于每个涉及价格的问题 — 包括自动缩放与基础容量的盈亏平衡分析，以及计费模式（PAYG/RI/暂停-恢复）策略 — 在进行任何计算之前，你的第一个操作必须是在 shell（`bash`/`powershell`）中实际运行此获取命令。** 不要仅根据公式推断盈亏平衡点或计费方案之间的权衡；请先运行命令，然后使用返回的 `retailPrice` 行进行计算：

```bash
curl -s "https://prices.azure.com/api/retail/prices?api-version=2023-01-01-preview&\$filter=serviceName%20eq%20'Microsoft%20Fabric'%20and%20armRegionName%20eq%20'<region>'" | jq '.Items[] | {meterName, retailPrice, unitOfMeasure, type, reservationTerm}'
```

使用 [`resources/pricing-api-reference.md`](resources/pricing-api-reference.md#pagination) 中的参考模板对 `NextPageLink` 结果进行分页，然后筛选所选区域的 **Fabric 容量计量项**。Retail Prices API **不会**为每个 F-SKU 返回一行数据 — 使用 `^F\d+` 匹配 `skuName`/`armSkuName` 不会返回任何结果。**PAYG** 每 CU 小时费用现在通过按工作负载划分的 Consumption 计量项计费，这些计量项的 `meterName` 以 `Capacity Usage CU` 结尾（`priceType eq 'Consumption'`、`unitOfMeasure eq '1 Hour'`）；取这些计量项中 `retailPrice` 的**众数**作为基础计算费率（这是一个较低的每 CU 小时数值 — 始终使用 API 返回的值；**不要**复制此 skill 中的任何示例数字）。**Reservations** 来自 `meterName eq 'Fabric Capacity CU'`（旧版统一计量项现在仅用于预留）。从这些行中读取每 CU 费率。

#### 第 3 步：构建价格表

API 提供的是**每 CU 费率**，而不是每 SKU 价格。请将每 CU 费率乘以文档化的 SKU→CU 映射中每个 SKU 的 CU 数量，以构建每 SKU 价格表（`F`*n* = *n* 个 CU，例如 F64 = 64、F128 = 128、F256 = 256、F512 = 512、F1024 = 1024、F2048 = 2048、F4096 = 4096、F8192 = 8192）。

将每个 `reservationTerm` 分组正确换算为**月度**金额（预留行表示的是**整个期限的总额**，而不是小时费率）：

- **PAYG 月度费用** = `consumptionCuHourRate × skuCUs × 730`（Consumption 行，`priceType eq 'Consumption'`，`meterName` 类似于 `* Capacity Usage CU`）
- **1 年期 RI 月度费用** = `reservationRetailPrice × skuCUs ÷ 12`（**不要**乘以 730）
- **3 年期 RI 月度费用** = `reservationRetailPrice × skuCUs ÷ 36`

请参阅 [`resources/pricing-api-reference.md`](resources/pricing-api-reference.md#monthly-cost-calculation) 中的月度成本换算指南。

#### 第 4 步：向用户展示

展示定价表，并明确注明区域：

```text
Fabric Capacity Pricing — Region: [detected_region] (live as of [today's date])

| SKU | CUs | Monthly PAYG | 1-Year RI | 3-Year RI | RI Savings |
|-----|-----|-------------|-----------|-----------|------------|
| F4  | 4   | $[live]     | $[live]   | $[live]   | [calc]%    |
| ... | ... | ...         | ...       | ...       | ...        |

Source: Azure Retail Prices API (prices.azure.com)
```

> **重要**：如果无法访问该 API，请告知用户并引导他们使用 [Azure 定价计算器](https://azure.microsoft.com/pricing/calculator/)。切勿回退到硬编码价格——这些价格会过时。

---

## 容量单位参考

### 各工作负载的 CU 消耗

| 工作负载 | CU 消耗模型 | 关键指标 |
|---|---|---|
| **Spark**（笔记本、SJD） | 活跃 Spark 会话期间的 CU 秒数 | vCores × 持续时间 |
| **SQL DW**（仓库查询） | 每次查询的 CU 秒数 | 查询复杂度 × 扫描的数据量 |
| **Power BI**（语义模型、报表） | 每次查询/刷新的 CU 秒数 | 数据集大小、刷新频率、DAX 复杂度 |
| **数据管道** | 每次活动执行的 CU 秒数 | 活动类型、移动的数据量 |
| **Eventhouse / KQL** | 每次查询及引入的 CU 秒数 | 引入速率、查询频率 |
| **Dataflows Gen2** | 每次刷新的 CU 秒数 | 转换复杂度、数据量 |
| **OneLake** | 仅存储（静态数据不消耗 CU） | 存储的 GB 数 |

### Spark CU 映射（对迁移至关重要）

> **已记录的换算关系**：**1 个 Fabric CU = 2 个 Spark vCores**（[Fabric Spark 并发限制](https://learn.microsoft.com/en-us/fabric/data-engineering/spark-job-concurrency-and-queueing)）。因此，节点的 CU 等价值为 `vCores ÷ 2`。下方的 vCore 数量是池节点的默认值；在确定 SKU 规模之前，始终应通过试点验证实际消耗量。

| Spark 池节点大小 | vCores | 内存 | 每节点的 CU 等价值（vCores ÷ 2） |
|---|---|---|---|
| 小型 | 4 vCores | 32 GB | 2 CUs |
| 中型 | 8 vCores | 64 GB | 4 CUs |
| 大型 | 16 vCores | 128 GB | 8 CUs |
| 超大型 | 32 vCores | 256 GB | 16 CUs |
| 超超大型 | 64 vCores | 512 GB | 32 CUs |

F64 容量可提供基础 128 个 Spark vCores，并可通过标准（按容量计费）模型中的 Spark 突发扩展至最高 3 倍（384 个 vCores）。

**Spark 计费有两种不同的模型**——请将二者区分开来：

1. **标准（按容量计费）Spark**：Spark 作业消耗容量 SKU 中的 CU。支持突发（最高 3 倍）和平滑处理。消耗的 CU 小时 = `nodes × CU-per-node × active-seconds / 3600`，并计入该容量的账单。
2. **Spark 自动缩放计费（选择启用、无服务器）**：这是一种独立的计费模型，其中 Spark 作业会**从容量中卸载**，并按照 `autoscale for Spark Capacity Usage CU` 计量项，以每 Spark CU 小时计费。在此模型下，Spark 作业**不会**消耗容量 CU，并且 **Spark 的突发和平滑处理会被禁用**。你可以设置 Spark CU 上限；仅对会话的活跃时间计费。使用此模型可将可变的 Spark 支出与稳态容量隔离开来——它**并不是**同一 SKU 上“超出基础容量的突发”。

### Databricks 到 Fabric Spark 的映射

> **⚠️ 未经验证的启发式估算**：这些映射仅为近似值，Microsoft 尚未正式发布相关文档。在确定容量规模之前，请通过试点工作负载进行验证。

| Databricks 群集配置 | Fabric 等效配置 | CU 估算 |
|---|---|---|
| 2× Standard_D4ds_v5（每个 4 个 vCore） | 2× Small 节点 | 峰值约 4 CU |
| 4× Standard_D8ds_v5（每个 8 个 vCore） | 4× Medium 节点 | 峰值约 16 CU |
| 8× Standard_D16s_v5（每个 16 个 vCore） | 8× Large 节点 | 峰值约 64 CU |
| 自动缩放 2–10 个工作节点（D4s） | 自动缩放 2–10 个 Small 节点 | 突发时约 4–20 CU |

---

## 工作负载成本估算

### 步骤 0：检测当前支出（源平台）

在估算 Fabric 成本之前，请使用 Azure 成本管理获取客户当前的实际支出。使用 [`resources/pricing-api-reference.md § Azure Cost Management API`](resources/pricing-api-reference.md#2-azure-cost-management-api-auth-required) 中的查询模板和 CLI 模式：

- **上月按服务统计**（按 `ServiceName` 分组，筛选 Databricks / Synapse / HDInsight / Power BI / Microsoft Fabric）：确定各产品的基准支出
- **每日趋势**（粒度为 `Daily`，按 `ServiceName` 分组）：揭示峰值日期，这些日期对应峰值 CU 需求

解析响应以提取：
- 按服务划分的**上月总支出**（Databricks、Synapse、HDInsight、Power BI）
- **资源明细**（计算与存储及网络）
- **峰值与平均值**的每日成本模式

#### 非 Azure 源平台（AWS、GCP、Databricks、Snowflake、Teradata）

当源平台不在 Azure 上时，请从该平台实时获取当前支出——**切勿硬编码或猜测源端价格**。优先使用客户的**实际账单/用量**；仅在存在公开标价 API 时才使用该 API；否则使用官方定价页面或发票，并注明来源和日期。有关经过验证的端点（AWS Price List、GCP Cloud Billing Catalog）以及 Databricks/Snowflake 的实际用量查询，请参阅 [`resources/pricing-api-reference.md § Source Platform Pricing (Multi-Cloud)`](resources/pricing-api-reference.md#4-source-platform-pricing-multi-cloud)。

#### Databricks 专项：获取群集利用率

请参阅 [pricing-api-reference.md § Databricks Clusters API](resources/pricing-api-reference.md#databricks-clusters-api)。按照 [COMMON-CLI.md](../../common/COMMON-CLI.md) 获取令牌，并调用 `GET /api/2.0/clusters/list`。关键字段：`cluster_name`、`node_type_id`、`num_workers`、`autoscale`。

#### Synapse 专项：获取池配置

有关 `az synapse sql pool` 和 `az synapse spark pool` CLI 命令，请参阅 [pricing-api-reference.md § Synapse Pools](resources/pricing-api-reference.md#synapse-pools)。

### 步骤 1：分析现有工作负载

从源平台收集以下指标：

| 源平台 | 要收集的指标 | 查找位置 |
|---|---|---|
| **Databricks** | 群集小时数/天、DBU 消耗量、工作节点数、节点类型 | 群集指标、账单控制台 |
| **Synapse Spark** | 池运行时长、节点数、节点大小 | Synapse Studio → 监视 → Apache Spark 池 |
| **Synapse SQL** | DWU 小时数/天、查询数、数据扫描量 | DMV、Azure Monitor |
| **Azure SQL/SQLDB** | DTU/vCore 小时数、查询模式 | Performance Insights |
| **Power BI Premium** | P-SKU 大小、刷新频率、用户数 | Power BI 管理门户 |
| **HDInsight** | VM 小时数、群集大小、HDFS 存储 | Azure 账单 |
| **AWS Redshift / EMR** | 节点类型、节点数、群集运行时长、存储空间（GB） | AWS Cost Explorer；通过 AWS CLI 获取群集配置 |
| **Google BigQuery / Dataproc** | 槽位数或按需扫描的 TB 数；Dataproc vCPU 小时数 | Cloud Billing 导出；GCP 控制台 |
| **Snowflake** | 仓库大小、每日消耗的额度、存储空间（TB） | `ACCOUNT_USAGE.METERING_DAILY_HISTORY` |
| **Teradata Vantage** | 节点/AMP 数、TCore、存储空间；或市场按量计费单位 | 客户发票/云市场计量 |

### 步骤 2：映射到 Fabric CU 需求

**Spark 工作负载**（最常见的迁移场景）：

```text
Daily CU demand = Σ (job_duration_hours × nodes × CU_per_node)
                  where CU_per_node = node_vCores ÷ 2

Example:
- 3 Spark jobs/day
- Job 1: 2 hours × 4 Medium nodes (4 CU each) = 2 × 4 × 4 = 32 CU-hours
- Job 2: 1 hour × 2 Small nodes (2 CU each) = 1 × 2 × 2 = 4 CU-hours
- Job 3: 0.5 hours × 8 Large nodes (8 CU each) = 0.5 × 8 × 8 = 32 CU-hours
- Total daily: 68 CU-hours
- Peak concurrent: 32 CUs (Job 1 or Job 3)
```

**SQL 仓库工作负载**（Synapse Dedicated SQL / DW）：

请**勿**根据 DWU 到 CU 的公式进行容量估算——Microsoft 并未发布官方换算方式，因此任何 `DWU ÷ 2` 数值都无法用于确定承诺型 SKU。应改为根据客户的**实际计费数据**进行估算，并通过试点加以验证：

```text
Workflow (measured, not heuristic):
1. Pull the customer's real DWU-hours/day from their Synapse invoice line
   or Azure Cost Management (Meter: "cDWU" / "Compute"), not from peak DWU.
2. Run a representative workload on the smallest candidate Fabric F-SKU and
   read measured CU-seconds from the Capacity Metrics app (see § Validation).
3. Scale that measured CU/DWU-hour ratio to the customer's total DWU-hours,
   then feed the resulting CU demand into the live-API SKU pricing lookup.
4. Present the number as pilot-validated, never as a formula output.
```

> **⚠️ 未经试点验证，不得做出承诺型容量估算。** 如果目前还无法开展试点，请将 DWU-hours 列为*有待测量的输入*，并注明该估算因缺少试点数据而受阻——不得将通过 DWU ÷ 2 得出的 CU 数值作为交付结果。

**Power BI 工作负载**：

```text
CU demand ≈ P-SKU CU equivalent × utilization%

P1 = 64 CUs (F64), P2 = 128 CUs (F128), P3 = 256 CUs (F256), P4 = 512 CUs (F512), P5 = 1024 CUs (F1024)
EM1/A1 = 8 CUs (F8), EM2/A2 = 16 CUs (F16), EM3/A3 = 32 CUs (F32)

Example — single Power BI P-SKU, like-for-like migration:
- P2 at 70% avg utilization, 15 refreshes/day
- P2 direct equivalent = 128 CUs (F128)
- Effective sustained demand: 128 × 0.70 ≈ 90 CUs. Refresh bursts are short and
  absorbed by capacity smoothing, so the sustained concurrent demand stays ~90 CUs.
- Apply the 1.2× safety factor to the *demand* (NOT the source nameplate):
  90 × 1.2 = 108 CUs → round up to next tier → **F128**
- F128 is the direct P-SKU equivalent and already provides headroom over a
  sub-100% workload. Do NOT multiply the source P-SKU's *rated* nameplate
  (128) by the safety factor — the nameplate already exceeds the utilized
  demand, so 128 × 1.2 → F256 double-counts headroom and over-provisions.
```

### 步骤 3：聚合并确定容量

```text
Sized CU = max over time of (Σ concurrent CU across all workloads in that window) + headroom
           (workloads share one capacity; size to the worst-case *concurrent sum*,
            NOT max(individual workload peaks) — peaks in different workloads can coincide)

Build a time-bucketed demand curve (e.g., hourly) summing Spark + SQL + PBI + Pipelines
CU in each bucket, then take the maximum bucket.

Recommended SKU = next SKU above (max_concurrent_CU × 1.2 safety factor)
  where max_concurrent_CU is the worst-case *effective/measured* concurrent CU
  DEMAND (already utilization-adjusted) — NOT a source SKU's rated nameplate.
  For a single Power BI P-SKU like-for-like migration, the recommendation is the
  direct CU-equivalent tier (P1→F64, P2→F128, P3→F256); do not inflate it further.

Two billing options for Spark:
  A) Standard (capacity-billed): include Spark CU in the concurrent sum above (one SKU).
  B) Autoscale Billing for Spark: size the base SKU for SQL + PBI + Pipelines only;
     Spark is offloaded and billed separately (does not consume capacity CUs).
```

注意：容量平滑可以重新分配*短时*突发负载（交互式负载约 5–64 分钟，后台负载最长 24 小时），但不会降低稳态并发总量——请按照持续并发需求确定容量大小。

---

## 存储定价

### 实时查询：OneLake 存储费率

从 Azure 零售价格 API 获取客户所在区域的 OneLake 存储费率。OneLake 存储采用**分层定价**——不存在单一的 `OneLake Storage` 计量项（使用该筛选条件会返回零行）。请使用分层计量项名称，并选择与数据访问模式匹配的层级：`OneLake Storage Hot Data Stored`、`OneLake Storage Cool Data Stored`、`OneLake Storage Cold Data Stored`，以及用于镜像副本的 `Storage Mirroring Data Stored`（筛选条件：`serviceName eq 'Microsoft Fabric' and armRegionName eq '<region>'`，忽略包含 `reservationTerm` 的行）。如果筛选条件返回零行，请列出该区域的所有 Fabric 存储计量项并向用户展示——绝不能在无提示的情况下使用硬编码费率。请参阅 [`resources/pricing-api-reference.md`](resources/pricing-api-reference.md#storage-egress-and-serverless-rate-lookups) 中的可运行模板。

### 存储类型和定价模型

| 存储类型 | 定价查询筛选条件 | 说明 |
|---|---|---|
| **OneLake（托管 Delta/Parquet）** | `meterName eq 'OneLake Storage Hot Data Stored'`（或 Cool/Cold） | Fabric 的主要存储；按访问模式分层 |
| **OneLake 快捷方式（不复制）** | $0（仅快捷方式元数据） | 源存储费用仍然适用 |
| **ADLS Gen2（源，通过快捷方式访问）** | `serviceName eq 'Storage' and skuName eq 'Hot LRS'` | 现有存储；不产生数据副本 |
| **镜像存储** | `meterName eq 'Storage Mirroring Data Stored'` | OneLake 中的 Delta 副本 |

### 根据现有平台估算存储量

| 来源 | 指标 | Fabric 对应项 |
|---|---|---|
| Databricks DBFS / 托管表 | Delta 表总大小（GB） | 与 OneLake Tables/ 中的大小相同 |
| Synapse Spark 托管表 | ADLS Gen2 synfs 容器大小 | 迁移或使用快捷方式；大小相同 |
| Synapse SQL DW 存储 | `DBCC PDW_SHOWSPACEUSED` | 大致相同（Delta 格式） |
| Power BI 数据集 | 模型大小（压缩后、内存中） | 数据集导入量 = 压缩后大小 × 2–4，得到未压缩 Delta 大小 |
| HDInsight HDFS | HDFS `du` 输出 | 转换为 Delta；与原始数据相比，压缩率通常为 30–60% |

---

## 网络出站流量定价

### 实时查询：出站流量费率

使用筛选条件 `serviceName eq 'Bandwidth' and armRegionName eq '<region>' and meterName eq 'Standard Data Transfer Out'` 获取客户所在区域的带宽/出站流量费率（忽略包含 `reservationTerm` 的行）。请参阅 [`resources/pricing-api-reference.md`](resources/pricing-api-reference.md#storage-egress-and-serverless-rate-lookups) 中的可运行模板。

### 出站流量成本模型

Azure 出站流量采用**分层定价**，并且数据源决定适用的计量项。绝不能应用单一的每 GB 固定费率——请先确定层级和数据源，再查询实时费率。

| 场景 | 定价来源 | 缓解措施 |
|---|---|---|
| 同一区域（区域内） | 免费 | 将容量和存储部署在同一区域 |
| 互联网出站流量的第一层级 | 带宽 API：每月前 100 GB 免费（`meterName eq 'Standard Data Transfer Out'`），之后采用分层定价 | 对小规模传输进行批处理，使其控制在免费额度以内 |
| 互联网出站流量（超出免费层级） | 带宽 API：根据每月流量分层——GB 数量越大，费率越低 | 尽量减少公共下载；分别计算每个层级区间的价格 |
| 跨区域（区域间） | 带宽 API：`meterName eq 'Inter Region Data Transfer Out'` | 使用 OneLake 区域快捷方式 |
| 跨云源（AWS/GCP → Fabric） | **源云平台的**出站流量计量项（AWS Data Transfer Out / GCP Network Egress），而非 Azure | 通过同一云平台的快捷方式暂存；出站流量由源云平台计费 |
| Private Link / Private Endpoint | 标准出站流量费**加上** PE 小时费用**再加上**每 GB 的 PE 数据处理费用 | 用于满足合规要求；为全部三个组成部分编制预算 |

**迁移出站流量估算**：对于一次性迁移，请按照当前各层级费率，将迁移的数据量拆分到适用的层级区间（免费 → 层级 1 → 层级 2……）中；从 AWS/GCP 迁移时，还需加上**源云平台**的出站流量费用。在 Azure 内同一区域间迁移：$0。

---

## 计费模式策略

### 决策框架

```text
┌─────────────────────────────────────────────────────────────┐
│ Is the workload Spark-heavy (>50% of CU demand)?            │
│                                                             │
│ YES → Consider Autoscale Billing for Spark (offloads Spark  │
│       from capacity, billed separately) + Reserved Instance │
│       sized for the non-Spark base (SQL + PBI + Pipelines). │
│       Alternative: one capacity-billed SKU sized for the    │
│       full concurrent sum if you prefer a single bill.      │
│                                                             │
│ NO → Is demand predictable and steady?                     │
│      YES → Reserved Instance (1-year or 3-year)            │
│      NO  → Pay-As-You-Go (for evaluation period)          │
│            then reassess after 30 days of metrics          │
│                                                             │
│ Intermittent (dev/test, scheduled batch windows)?          │
│   → Pause/resume the capacity (billing stops while paused) │
│     instead of, or combined with, PAYG.                    │
└─────────────────────────────────────────────────────────────┘
```

### Spark 密集型工作负载：Spark 自动缩放计费与标准容量对比

Spark 有**两种不同的计费模型**——请选择其中一种；它们不会在同一个 Spark 作业上叠加：

- **标准模式（按容量计费）**：Spark 从容量 SKU 中消耗 CU（支持 3 倍突发和用量平滑）。应根据一段时间内*所有*工作负载（SQL + PBI + Pipelines + Spark）的并发 CU 总和确定单个 SKU 的大小。
- **Spark 自动缩放计费（选择加入的无服务器模式）**：Spark 作业会**从容量中卸载**，并按 Spark CU 小时通过 `autoscale for Spark Capacity Usage CU` 计量器单独计费。Spark 的突发和用量平滑功能将被**禁用**，且这些作业**不会**消耗容量 CU。这样，你便可以根据非 Spark 稳态工作负载（SQL DW + Power BI + Pipelines）确定基础容量的大小，并为 Spark 单独付费，同时设置 Spark CU 上限。

请实时获取自动缩放 Spark 费率（`$/CU-hour`）——**不要重复使用基础/PAYG 费率，也绝不要硬编码费率值。**对于任何自动缩放或盈亏平衡问题，你的第一步都必须是在 shell 中运行以下获取命令，并读取 API 返回的 `retailPrice`：

```bash
curl -s "https://prices.azure.com/api/retail/prices?api-version=2023-01-01-preview&\$filter=serviceName%20eq%20'Microsoft%20Fabric'%20and%20armRegionName%20eq%20'<region>'%20and%20meterName%20eq%20'autoscale%20for%20Spark%20Capacity%20Usage%20CU'" | jq '.Items[] | select(.reservationTerm == null) | {meterName, retailPrice, unitOfMeasure, armRegionName}'
```

使用返回行中的 `retailPrice` 值作为自动缩放费率。如果该区域未返回任何行，请列出并展示该区域的所有 Fabric Spark 计量器——**不要**假定、复制或重复使用基础费率。请参阅 [`resources/pricing-api-reference.md`](resources/pricing-api-reference.md#storage-egress-and-serverless-rate-lookups) 中的可运行模板。

**估算公式**（Autoscale Billing 模型，使用实时费率）：

```text
Example (fill in live prices from API):
- SQL DW peak: 16 CUs
- Power BI peak: 8 CUs  
- Spark peak: 64 CUs (but only 4 hours/day)
- Pipelines: 4 CUs

Base capacity (standard, capacity-billed): sized for SQL + PBI + Pipelines = 16 + 8 + 4 = 28 CUs raw
  → apply 1.2× safety: 28 × 1.2 = 33.6 CUs → round up to next tier → **F64**
  Monthly cost: [look up F64 1-Year RI rate from API, amortized ÷ 12]
  
Spark (Autoscale Billing, offloaded from capacity):
  64 CU × 4 hours/day × 30 days = 7,680 CU-hours/month
  Cost: 7,680 × [live 'autoscale for Spark Capacity Usage CU' rate from API]

Total: [base RI ÷ 12] + [Spark autoscale] + [storage] + [egress]
Compare vs. current spend from Cost Management API above.
```

### 预留实例与 PAYG 的盈亏平衡点

**不要**依赖静态利用率阈值。应根据特定 SKU 和区域的**实时**定价计算盈亏平衡点：

```text
monthlyAmortizedReservationCost = skuCUs × reservationRetailPrice ÷ (12 for 1-yr | 36 for 3-yr)
paygMonthlyAtFullUse            = skuCUs × paygCuHourRate × 730
breakEvenHoursPerMonth          = monthlyAmortizedReservationCost ÷ (skuCUs × paygCuHourRate)

→ If expected billed hours/month > breakEvenHoursPerMonth, the RI wins.
→ Express RI savings as (paygMonthlyAtFullUse − monthlyAmortizedReservationCost) ÷ paygMonthlyAtFullUse.
```

`reservationRetailPrice`（期限总价）和 `paygCuHourRate`（`priceType eq 'Consumption'`，来自 `* Capacity Usage CU` 计量项）均来自 Retail Prices API。对于高度波动或季节性的需求，可将规模较小的 RI 基础容量与 PAYG 搭配使用，或针对可变部分使用 Spark 的 Autoscale Billing。

---

## SKU 规模选择决策树

### 输入变量

从用户处收集：

1. 所有工作负载的**并发 CU 峰值需求**
2. **每日平均 CU 小时数**消耗量
3. **工作负载构成**（Spark、SQL、PBI 和其他工作负载各自所占百分比）
4. **增长预测**（未来 12 个月预测）
5. **合规要求**（Private Link、专用容量）
6. **预算约束**（每月上限）

### 规模选择算法

```text
1. Build a time-bucketed concurrent-demand curve; concurrent_CU = Σ workload CU per bucket
2. peak_CU = max concurrent_CU over the curve (NOT max of individual workload peaks)
3. Pick the CU basis by billing mode (Spark is the only workload that can be offloaded):
     If using Autoscale Billing for Spark:
       basis_CU = max concurrent (SQL + PBI + Pipelines)   # Spark offloaded, billed separately
     Else (standard, capacity-billed):
       basis_CU = peak_CU                                  # Spark included in the concurrent sum
4. Apply the growth forecast to the CU DEMAND, before sizing (never to a chosen SKU —
   multiplying a SKU by a growth factor can invent a tier that does not exist):
     projected_CU = basis_CU × (1 + growth_rate)
5. Apply the 1.2x safety factor to the projected demand (BOTH billing modes, incl. the
   Autoscale base):
     sized_CU = projected_CU × 1.2
6. Round UP to the next real SKU tier. The ONLY valid Fabric capacity tiers are
   **F2, F4, F8, F16, F32, F64, F128, F256, F512, F1024, F2048, F4096, F8192**
   (CUs double at each step). There are NO in-between sizes: never name an
   interpolated tier such as F48, F96, F192, or F1500 — always snap to an
   existing tier from that list, even in comparisons, ranges, or asides.
7. Validate: chosen-SKU monthly cost ≤ budget constraint
8. If budget exceeded: recommend workload optimization or phased migration
```

### 快速参考 SKU 选择器

将**调整后的 CU** 代入此表——即先执行容量估算算法的第 1–5 步，计算 `sized_CU = peak_CU × (1 + growth_rate) × 1.2`，然后将该值（而非未经调整的峰值需求）映射到相应层级。安全系数和增长率已计入左侧列，因此不要再次应用。

| 调整后的 CU（计入增长率和 1.2× 安全系数后） | 推荐的基础 SKU | 备注 |
|---|---|---|
| ≤ 2 CUs | F2 | 试用/超小型开发环境 |
| 3–4 CUs | F4 | 开发/测试、小型团队 |
| 5–8 CUs | F8 | 小型生产环境 |
| 9–16 CUs | F16 | 中型生产环境 |
| 17–32 CUs | F32 | 标准生产环境 |
| 33–64 CUs | F64 | 大型生产环境、多个团队 |
| 65–128 CUs | F128 | 企业级 |
| 129–256 CUs | F256 | 大型企业 |
| 257–512 CUs | F512 | 超大型企业 |
| 513–1024 CUs | F1024 | 多团队企业平台 |
| 1025–2048 CUs | F2048 | 超大规模资源体系 |
| 2049–4096 CUs | F4096 | 超大规模资源体系 |
| 4097–8192 CUs | F8192 | 最大的单容量层级 |
| > 8192 CUs | 多个容量 | 讨论多容量架构/工作区分区 |

---

## 迁移成本工作表

### 模板：向用户展示

估算迁移成本时，请使用上述 API 提供的实时数据。生成一份涵盖以下关键部分的工作表：

- **标题信息**——客户/项目名称、区域、定价日期、数据源
- **当前支出**——通过成本管理 API 获取各平台（Databricks、Synapse SQL/Spark、Power BI Premium、Storage）的实时月度成本
- **源工作负载概况**——每日 Spark 作业数、每日 SQL DWU 小时数、Power BI SKU 利用率、管道运行次数、存储 TB 数
- **Fabric CU 需求**——按工作负载类型划分的峰值和平均 CU 估算值及总计
- **推荐配置**——基础 SKU（F 层级）、Spark 计费模式、RI 期限
- **月度成本明细**——根据实时 API 价格计算的容量、Spark 自动缩放、存储和网络出口流量成本
- **相比当前支出的节省额**——差额和百分比变化

完整的可打印模板请参阅 [`resources/cost-estimation-worksheet.md`](resources/cost-estimation-worksheet.md)。

---

## 必须 / 建议 / 避免

### 必须执行
- **始终获取比较双方的实时价格。**目标（Fabric）价格来自 Azure 零售价格 API（`prices.azure.com`）；源平台价格来自该平台的实时计费/价格 API 或客户的实际账单。切勿为任一方硬编码金额。
- **切勿仅根据启发式转换就最终确定 SKU 或承诺成本。**将所有*跨平台* vCore→CU 和 DWU→CU 映射仅视为*试点验证输入*（Fabric 内部的 1 CU = 2 Spark vCores 比率已有文档说明，但源引擎与 Fabric 之间的等效关系并无文档依据）。将通过启发式方法得出的数值标记为初步估算，并要求先运行试点工作负载（使用容量指标应用测量 CU 消耗量），再确定任何最终容量规格或购买 RI。
- **检测客户所在区域**，可从其现有 Fabric 容量中获取，或明确询问——价格因区域而异
- 当客户拥有 Azure 订阅访问权限时，**通过 Azure 成本管理 API 获取当前支出**——以此建立比较基准
- 估算前**始终询问源工作负载概况**——切勿假设工作负载规模
- **包括所有成本维度**——计算（CU）、存储、网络出口流量以及所有高级功能（Private Link、BCDR）
- **明确说明数据源**——区域、货币、API 查询日期，以及用于验证的 Azure 定价计算器链接
- 当 Spark 占 CU 需求的 50% 以上时，**单独计算 Spark 自动缩放计费**——在该模式下，Spark 将从容量中卸载并单独计费；不要将其合并到基础容量中
- 在选择 SKU 前，对峰值 CU 需求**应用 1.2× 安全系数**
- **包括预留实例分析**——针对推荐的 SKU 展示 PAYG 与 1 年期、3 年期方案的比较
- **展示成本工作表模板**，其中所有行项目均使用实时数据填写

### 推荐
- **对于以 Spark 为主的工作负载，使用 Autoscale Billing for Spark** — 将 Spark 从容量中卸载并单独计费，避免为了突发式 Spark 作业而过度预配基础 SKU（在此模型下，Spark 会禁用突发与平滑机制）
- **预留实例基础容量 + Autoscale Billing for Spark**，将其作为以 Spark 为主的混合工作负载的默认建议
- **对于现有 ADLS Gen2 数据，优先使用 OneLake 快捷方式而非复制数据** — 避免产生双重存储成本
- **将容量和存储部署在同一 Azure 区域** — 消除跨区域出站流量费用
- **存在预算限制时采用分阶段迁移** — 从 F8/F16 开始，并逐步扩容
- **迁移后每月监控利用率** — 仅在获得 30 天以上的实际使用数据后才建议使用 RI
- **在估算中考虑工作负载平滑机制** — Fabric 会在约 5–64 分钟内平滑交互式突发负载，并在最长 24 小时内平滑后台作业；使用 Autoscale Billing 时，Spark 会**禁用平滑机制**。该机制会重新分配突发负载，但不会降低稳定状态下的并发需求。

### 避免
- **不要硬编码价格** — 始终使用实时来源（Fabric 使用 Azure Retail Prices API；源平台使用其价格 API 或实际账单来确定当前支出）；硬编码值会过时
- **不要为没有公开价格 API 的平台虚构价格**（Databricks DBU、Snowflake credits、Teradata）— 使用客户的实际用量/账单或官方定价页面，并注明来源
- **不要在未说明来源和日期的情况下引用价格** — 始终注明“来自截至 [date] 的 Azure Retail Prices API”
- **在稳定状态尚未确定前，不要建议 3 年期 RI** — 等待工作负载模式得到验证（至少 3 个月）
- **不要仅根据 Spark 峰值来确定容量大小** — 要么将 Spark 纳入并发 CU 总量（标准模式），要么通过 Autoscale Billing for Spark 将其卸载；基础 SKU 用于承载非 Spark 的稳定状态负载
- **不要忽略 Power BI 的 CU 消耗** — 语义模型刷新和交互式查询会消耗大量 CU
- **不要遗漏多区域或混合架构的网络出站流量费用**
- **不要混淆 CU 和 vCore** — CU 是 Fabric 的统一计费单位；vCore 是 Spark 执行资源。在 Fabric Spark 中，vCore→CU 比率已有*文档说明*（1 CU = 2 Spark vCores，请参阅 Spark CU 映射部分），因此从 Fabric 池节点到 CU 的换算是确定的。需要采用启发式方法的是**跨平台**等效换算，即将源引擎（Databricks/Synapse/EMR）的 vCore 映射为 Fabric CU；在确定 SKU 大小之前，必须通过试点验证该映射
- **不要跳过 Cost Management API 检查** — 如果用户拥有 Azure 访问权限，应始终以编程方式确定其当前的基准支出

---

## 示例

### 示例 1：Databricks 迁移成本估算

**用户提示词**：“我有 5 个 Databricks Spark 作业，每天在 4×D8s_v5 集群上各运行约 3 小时，此外还有一个 Power BI P1 和 2TB 的 Delta 表。迁移到 Fabric 后需要多少费用？”

**智能体工作流**：
1. 检测区域（询问用户，或通过 `GET /v1/capacities` 或 ARM 检查现有容量 — 请参阅 [§ Fabric 容量发现](resources/pricing-api-reference.md#3-fabric-capacity-discovery-fabric-rest--arm)）
2. 通过 [Cost Management API](resources/pricing-api-reference.md#2-azure-cost-management-api-auth-required) 获取当前 Databricks 支出
3. 使用 [Retail Prices 分页模式](resources/pricing-api-reference.md#pagination)获取实时 Fabric 定价
4. 计算 CU 需求并提供工作表

**CU 计算逻辑**：
```text
Spark: 5 jobs × 3h × 4 nodes × 4 CU/node (D8s_v5 = 8 vCores = Medium = 4 CU) = 240 CU-hours/day
Peak concurrent (2 jobs overlap): 2 × 4 × 4 = 32 CUs → candidate for Autoscale Billing for Spark
PBI: P1 = 64 CUs (F64 equivalent) — steady-state base
Storage: 2 TB × OneLake tiered rate (from API)

Recommended config (Autoscale Billing for Spark option):
  Base: F64 (1-Year RI) — covers Power BI P1 steady-state
  Spark: Autoscale Billing — 240 CU-hours/day × 30 days × live 'autoscale for Spark Capacity Usage CU' rate
  Storage: 2 TB × 1024 GB × live OneLake Hot rate
  Total = (Base RI ÷ 12) + Spark Autoscale + Storage
```

**价格查询**：使用 `armSkuName eq 'Fabric_Capacity_CU_Hour'` + `armRegionName eq '<region>'` + `meterName eq 'Fabric Capacity CU'` 筛选零售价格 API。`reservationTerm` **是**可筛选的 OData 字段，因此可以直接使用 `reservationTerm eq '1 Year'` 获取 1 年期数据行（或者从返回的每一行中读取该字段）——将该期限总价 ÷ 12 × 64 CUs 进行摊销。Spark 费率使用 `meterName eq 'autoscale for Spark Capacity Usage CU'`，存储费率使用 `meterName eq 'OneLake Storage Hot Data Stored'`。有关完整的分页和筛选模式，请参阅 [pricing-api-reference.md](resources/pricing-api-reference.md)。

### 示例 2：Synapse SQL DW 迁移

**用户提示**：“我们每天运行 Synapse DW1000c 18 小时，并拥有 5TB 的数据仓库数据。”

**代理工作流**：
1. 通过 [成本管理 API](resources/pricing-api-reference.md#2-azure-cost-management-api-auth-required) 获取当前 Synapse 支出（筛选条件：`"Azure Synapse Analytics"`）
2. 使用客户所在区域的[零售价格分页模式](resources/pricing-api-reference.md#pagination)获取实时 Fabric 定价
3. 计算 CU 需求并推荐 SKU

**CU 计算逻辑**：
```text
Sizing input: the customer's measured DWU-hours/day from their Synapse invoice
(DW1000c × 18h ≈ 18,000 DWU-hours/day) — NOT a DWU ÷ 2 CU formula.
Pilot the workload on a candidate F-SKU, read CU-seconds from Capacity Metrics,
and scale the measured CU/DWU-hour ratio to total DWU-hours.
Do NOT apply an assumed engine-efficiency discount; size from the pilot's measured CU,
not from a guessed "% less CU" factor.
Pilot-start SKU: F512 as a conservative starting tier to run the pilot on.

Pricing (from API):
  F512 PAYG monthly: paygCuHourRate × 512 CUs × 730   (priceType eq 'Consumption', '* Capacity Usage CU' meter)
  F512 1-yr RI monthly: reservationRetailPrice × 512 CUs ÷ 12   (reservation row is a TERM TOTAL, not ×730)
  Storage: 5 TB × 1024 × OneLake Hot rate

Recommendation: Start F512 PAYG → monitor 30 days → right-size down (e.g., to F256 RI) if measured CU is lower
```