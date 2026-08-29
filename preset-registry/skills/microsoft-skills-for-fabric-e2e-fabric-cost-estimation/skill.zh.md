---
name: e2e-fabric-cost-estimation
description: "Estimates Fabric capacity cost before a migration by profiling Spark, SQL, Power BI, and Real-Time workloads, then recommending SKU size and comparing Reserved, Pay-As-You-Go, and Autoscale billing. Use only for capacity sizing and pricing questions, not for general migration or connectivity work."
---
> **Telemetry — 必须遵守。** 每次 `api.fabric.microsoft.com` 调用都必须携带
> `x-ms-fabric-skill: e2e-fabric-cost-estimation`（`az rest`：`--headers "x-ms-fabric-skill=e2e-fabric-cost-estimation"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该标头——但仍必须添加。

> **重要说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 进行筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 进行筛选
> 3. **定价因区域而异。** 在进行任何价格查询之前，始终解析容量所在的 Azure 区域（通过 Fabric REST `GET /v1/capacities`，该接口会返回 `region`/`sku`/`state`，或通过 ARM），或者在此之前询问用户，并在每个报价数字中注明区域。

> **🔴 必须获取实时价格——只要回答中包含美元数字，就必须执行。**
> 在提供**任何**美元金额、成本、盈亏平衡点、计费模式比较、RI 与 PAYG 分析、迁移成本或成本工作表之前，**必须**运行一个 shell 命令（`bash`/`powershell`），调用 Azure Retail Prices API：`https://prices.azure.com/api/retail/prices`。这项要求无一例外地适用于每个涉及价格的回答——Databricks/Synapse 迁移成本、**Autoscale 与基础 SKU 的盈亏平衡点**、RI 与 PAYG 的盈亏平衡点、成本工作表以及计费模式策略。必须**先**获取实时的每 CU 小时 PAYG 费率（`priceType eq 'Consumption'`、`* Capacity Usage CU` 计量项）、预留期限总价以及 `autoscale for Spark Capacity Usage CU` 费率，然后再进行计算。回答涉及价格的问题时，绝不能使用记忆中的费率或硬编码费率，也绝不能仅根据公式推理盈亏平衡点。如果计量项查询未返回任何行，必须将此情况告知用户——**绝不能**静默回退到硬编码费率（例如，不要假定 Autoscale 为 `$0.18/CU-hr`；Autoscale 计量项是独立的费率，必须获取该费率）。
> **例外——纯容量规模评估：** 如果问题完全以容量单位回答，且**不包含美元数字**（例如“哪个 SKU 适合 80 CUs？”或“P2 对应多少个 CUs？”），则这是 CU 计算，而非定价，不需要获取价格。只要在该容量评估回答中附加美元金额，就必须获取实时价格。

> **🟠 先澄清，再执行——不要假设默认值。**
> 涉及价格的请求需要两个输入，之后才能获取价格或进行计算：**Azure 区域**和**工作负载配置**（例如每天的 CU 小时数、节点/作业详细信息，或迁移源集群的规模）。如果缺少其中任何一项，你的**第一条**回复必须**询问用户提供缺失的输入，并停止执行**——不要选择默认区域（绝不能假定 `East US` 或任何其他区域来“先开始”，不要调用价格 API，也不要根据假设值生成估算。只有在用户提供缺失的输入后，才能获取实时价格并进行计算。即使强制获取价格的规则适用于最终的价格回答，先询问用户仍然是正确的行为。

> **🔴 自动缩放费率是一个独立计费项 — 切勿重复使用基础/PAYG 费率。**
> `autoscale for Spark Capacity Usage CU` 计量项的价格与基础 `* Capacity Usage CU` PAYG 费率**完全独立**。你**必须**通过单独的 API 调用获取该费率，并读取返回的 `retailPrice`。将基础/PAYG 费率（或记忆中的数值，例如 `0.18`）赋值给自动缩放变量属于正确性错误 — 例如，`autoscaleRate = paygRate` 或 `autoscaleRate = 0.18` 都是**禁止的**。如果自动缩放计量项查询未返回任何行，请列出该区域的所有 Fabric Spark 计量项，并将结果呈现给用户；绝不能使用基础费率进行替代。

# Fabric 成本估算

## 前置知识

- [COMMON-CORE.md](../../common/COMMON-CORE.md) — Fabric 拓扑、容量概念、身份验证与令牌受众
- [COMMON-CLI.md](../../common/COMMON-CLI.md) — 容量发现的 CLI 模式、身份验证步骤（`az login`、令牌获取）

---

## 目录

| 主题 | 章节 |
|---|---|
| Fabric 计费模型概述 | [§ 计费模型](#fabric-billing-model) |
| 容量单位 (CU) 参考 | [§ CU 参考](#capacity-unit-reference) |
| 工作负载成本估算 | [§ 工作负载估算](#workload-cost-estimation) |
| 存储定价 | [§ 存储](#storage-pricing) |
| 网络定价 | [§ 网络](#network-egress-pricing) |
| 计费模式策略 | [§ 计费策略](#billing-mode-strategy) |
| SKU 规模选择决策树 | [§ SKU 规模选择](#sku-sizing-decision-tree) |
| 迁移成本工作表 | [§ 工作表](#migration-cost-worksheet) |
| 定价 API 参考 | [pricing-api-reference.md](resources/pricing-api-reference.md) |
| 必须 / 首选 / 避免 | [§ 必须 / 首选 / 避免](#must--prefer--avoid) |
---

## Fabric 计费模型

Microsoft Fabric 使用**统一容量模型**，所有工作负载共享一个**容量单位 (CU)** 池。了解以下计费维度：

| 维度 | 描述 | 计费机制 |
|---|---|---|
| **计算 (CU-seconds)** | 查询、Spark 作业、管道消耗的处理能力 | 根据容量 SKU 计算 CU 消耗 |
| **存储 (GB/month)** | Delta 表、文件、快捷方式使用的 OneLake 存储 | 按 GB 计收月费 |
| **网络出口 (GB)** | 离开 Azure 区域的数据 | 按 GB 收取出口费用 |
| **容量预留** | 基础 SKU 承诺（F2–F8192） | 按月或按年承诺 |

### 计费模式

| 模式 | 描述 | 最适用于 |
|---|---|---|
| **预留实例 (RI)** | 承诺 1 年或 3 年；可享受大幅折扣（计算费用需通过实时 API 获取） | 稳定的基础负载 |
| **即用即付 (PAYG)** | 按小时计费；无承诺；完整列表价格 | 测试、不可预测的工作负载 |
| **Spark 自动缩放计费** | 可选择的无服务器模型；Spark 作业从容量中卸载，并按每 Spark CU 小时计费。Spark 不启用突发与平滑处理；不会消耗容量 CU | 将可变 Spark 支出与稳定的容量支出隔离 |
| **Fabric 试用版** | 试用容量（大小因租户/资格而异 — 通常在 60 天内最高可达 F64）；使用前请核实当前试用条款；绝不要据此确定生产环境规模 | 仅用于评估 |

### 容量 SKU 层级 — 实时定价查询

**不要使用硬编码价格。** 始终在运行时从 Azure Retail Prices API 获取当前定价。

#### 步骤 1：检测客户区域

如果客户已经拥有 Fabric 容量，请从核心 Fabric REST API 获取其区域、SKU 和状态 — `GET https://api.fabric.microsoft.com/v1/capacities` 会返回每个容量的 `region`、`sku` 和 `state`。Azure Resource Manager（`az resource list`）是等效的备用方案；只有 Fabric **Admin** API（`/v1/admin/capacities`）不会返回区域。请参阅 [`resources/pricing-api-reference.md`](resources/pricing-api-reference.md#3-fabric-capacity-discovery-fabric-rest--arm) 中的模板。

如果尚不存在容量，请询问用户计划在哪个 Azure 区域进行部署。

#### 步骤 2：获取实时 Fabric 定价

查询 **Azure Retail Prices API**（公开 API，无需身份验证）。**对于每个定价问题 — 包括 Autoscale 与基础容量的盈亏平衡点，以及计费模式（PAYG/RI/暂停-恢复）策略 — 第一个操作都必须是在 shell（`bash`/`powershell`）中实际运行此获取命令，然后才能进行任何计算。** 不要仅根据公式推理盈亏平衡点或计费权衡；先运行命令，然后根据返回的 `retailPrice` 行进行计算：

```bash
curl -s "https://prices.azure.com/api/retail/prices?api-version=2023-01-01-preview&\$filter=serviceName%20eq%20'Microsoft%20Fabric'%20and%20armRegionName%20eq%20'<region>'" | jq '.Items[] | {meterName, retailPrice, unitOfMeasure, type, reservationTerm}'
```

使用 [`resources/pricing-api-reference.md`](resources/pricing-api-reference.md#pagination) 中的参考模板，对 `NextPageLink` 结果进行分页，然后筛选所选区域的 **Fabric 容量计量项**。Retail Prices API 不会为每个 F-SKU 返回一行数据 — 对 `skuName`/`armSkuName` 使用 `^F\d+` 进行匹配不会返回任何结果。**PAYG** 每 CU 小时的费用现在通过每个工作负载的 Consumption 计量项计费，这些计量项的 `meterName` 以 `Capacity Usage CU` 结尾（`priceType eq 'Consumption'`、`unitOfMeasure eq '1 Hour'`）；从这些计量项中取 `retailPrice` 的**众数**，作为基础计算费率（这是一个较低的每 CU 小时数值 — 始终使用 API 返回的值；**不要**复制此 skill 中的任何示例数值）。**预留**来自 `meterName eq 'Fabric Capacity CU'` 的计量项（旧版扁平计量项现在仅用于预留）。从这些行中读取每 CU 费率。

#### 步骤 3：构建定价表

API 提供的是**每 CU 费率**，而不是每个 SKU 的价格。通过将每 CU 费率乘以文档化的 SKU→CU 映射中各 SKU 的 CU 数量，构建每个 SKU 的价格表（`F`*n* = *n* 个 CU，例如 F64 = 64、F128 = 128、F256 = 256、F512 = 512、F1024 = 1024、F2048 = 2048、F4096 = 4096、F8192 = 8192）。

正确地将每个 `reservationTerm` 桶转换为**每月**数值（预留行是**期限总价**，而不是每小时费率）：

- **PAYG 月度费用** = `consumptionCuHourRate × skuCUs × 730`（Consumption 行，`priceType eq 'Consumption'`，`meterName` 类似于 `* Capacity Usage CU`）
- **1 年 RI 月度费用** = `reservationRetailPrice × skuCUs ÷ 12`（**不要**乘以 730）
- **3 年 RI 月度费用** = `reservationRetailPrice × skuCUs ÷ 36`

请参阅 [`resources/pricing-api-reference.md`](resources/pricing-api-reference.md#monthly-cost-calculation) 中的月度转换指南。

#### 步骤 4：呈现给用户

呈现定价表，并明确注明区域：

```text
Fabric Capacity Pricing — Region: [detected_region] (live as of [today's date])

| SKU | CUs | Monthly PAYG | 1-Year RI | 3-Year RI | RI Savings |
|-----|-----|-------------|-----------|-----------|------------|
| F4  | 4   | $[live]     | $[live]   | $[live]   | [calc]%    |
| ... | ... | $[live]     | $[live]   | $[live]   | ...        |

Source: Azure Retail Prices API (prices.azure.com)
```

> **重要**：如果 API 无法访问，请告知用户，并引导其使用 [Azure 定价计算器](https://azure.microsoft.com/pricing/calculator/)。绝不要回退到硬编码价格——它们会逐渐过时。

---

## 容量单位参考

### 各工作负载的 CU 消耗

| 工作负载 | CU 消耗模型 | 关键指标 |
|---|---|---|
| **Spark**（笔记本、SJD） | 活动 Spark 会话期间的 CU-秒数 | vCore 数量 × 持续时间 |
| **SQL DW**（数据仓库查询） | 每个查询的 CU-秒数 | 查询复杂度 × 扫描的数据量 |
| **Power BI**（语义模型、报表） | 每个查询/刷新的 CU-秒数 | 数据集大小、刷新频率、DAX 复杂度 |
| **数据管道** | 每次活动执行的 CU-秒数 | 活动类型、移动的数据量 |
| **Eventhouse / KQL** | 查询 + 数据引入的 CU-秒数 | 数据引入速率、查询频率 |
| **Dataflows Gen2** | 每次刷新的 CU-秒数 | 转换复杂度、数据量 |
| **OneLake** | 仅存储（静态存储不消耗 CU） | 存储的 GB 数 |

### Spark CU 映射（迁移的关键）

> **文档所述转换关系**：**1 Fabric CU = 2 个 Spark vCore**（[Fabric Spark 并发限制](https://learn.microsoft.com/en-us/fabric/data-engineering/spark-job-concurrency-and-queueing)）。因此，节点的 CU 等效值为 `vCores ÷ 2`。以下 vCore 数量是池节点的默认值；在确定 SKU 大小之前，始终应通过试点验证实际消耗。

| Spark 池节点大小 | vCore 数量 | 内存 | 每个节点的 CU 等效值（vCores ÷ 2） |
|---|---|---|---|
| Small | 4 vCores | 32 GB | 2 CUs |
| Medium | 8 vCores | 64 GB | 4 CUs |
| Large | 16 vCores | 128 GB | 8 CUs |
| X-Large | 32 vCores | 256 GB | 16 CUs |
| XX-Large | 64 vCores | 512 GB | 32 CUs |

F64 容量在基础配置下提供 128 个 Spark vCore，并且在标准（按容量计费）模型下，可通过 Spark 突发扩展至 3 倍（384 个 vCore）。

**Spark 计费有两种不同的模型**——请将它们分开处理：

1. **标准（按容量计费）Spark**：Spark 作业从容量 SKU 中消耗 CU。突发（最高 3 倍）和消峰计费适用。消耗的 CU-小时 = `nodes × CU-per-node × active-seconds / 3600`，并从容量中计费。
2. **Spark 自动缩放计费（选择加入、无服务器）**：一种独立的计费模型，Spark 作业会从**容量中卸载**，并按照 `autoscale for Spark Capacity Usage CU` 计量单位，以每个 Spark CU-小时计费。在此模型下，Spark 作业**不会消耗容量 CU**，并且 **Spark 不适用突发和消峰计费**。你可以设置 Spark CU 上限；系统仅对活动会话时间计费。使用此模型可以将可变的 Spark 支出与稳定状态下的容量支出分离——它**不是**同一 SKU 上“超出基础容量的突发”。

### Databricks 到 Fabric Spark 映射

> **⚠️未经验证的经验性估算**：这些映射是近似值，并非 Microsoft 的官方文档说明。在确定容量规模之前，请通过试点工作负载进行验证。

| Databricks 集群配置 | Fabric 等效配置 | CU 估算 |
|---|---|---|
| 2× Standard_D4ds_v5（每个 4 个 vCore） | 2× Small 节点 | 峰值约 4 CUs |
| 4× Standard_D8ds_v5（每个 8 个 vCore） | 4× Medium 节点 | 峰值约 16 CUs |
| 8× Standard_D16s_v5（每个 16 个 vCore） | 8× Large 节点 | 峰值约 64 CUs |
| 自动缩放 2–10 个工作节点（D4s） | 自动缩放 2–10 个 Small 节点 | 突发约 4–20 CUs |

---

## 工作负载成本估算

### 步骤 0：检测当前支出（源平台）

在估算 Fabric 成本之前，使用 Azure Cost Management 获取客户当前的实际支出。使用 [`resources/pricing-api-reference.md § Azure Cost Management API`](resources/pricing-api-reference.md#2-azure-cost-management-api-auth-required) 中的查询模板和 CLI 模式：

- **按服务统计上个月的支出**（按 `ServiceName` 分组，并筛选 Databricks / Synapse / HDInsight / Power BI / Microsoft Fabric）：确定每种产品的基线
- **每日趋势**（粒度为 `Daily`，按 `ServiceName` 分组）：揭示支出峰值日期，这些日期对应峰值 CU 需求

解析响应以提取：
- 各服务（Databricks、Synapse、HDInsight、Power BI）**上个月的总支出**
- **资源明细**（计算、存储、网络）
- **峰值与平均值**每日成本模式

#### 非 Azure 源平台（AWS、GCP、Databricks、Snowflake、Teradata）

当源平台不在 Azure 上时，从该平台实时获取当前支出——**绝不要硬编码或猜测源平台价格**。优先使用客户的**实际计费/消耗数据**；仅在存在公开目录价格 API 时使用该 API；否则使用官方定价页面或发票，并说明来源和日期。有关已验证的端点（AWS Price List、GCP Cloud Billing Catalog）以及 Databricks/Snowflake 的实际使用量查询，请参阅 [`resources/pricing-api-reference.md § Source Platform Pricing (Multi-Cloud)`](resources/pricing-api-reference.md#4-source-platform-pricing-multi-cloud)。

#### Databricks 特定操作：获取集群利用率

请参阅 [pricing-api-reference.md § Databricks Clusters API](resources/pricing-api-reference.md#databricks-clusters-api)。根据 [COMMON-CLI.md](../../common/COMMON-CLI.md) 获取令牌，并调用 `GET /api/2.0/clusters/list`。关键字段：`cluster_name`、`node_type_id`、`num_workers`、`autoscale`。

#### Synapse 特定操作：获取池配置

有关 `az synapse sql pool` 和 `az synapse spark pool` CLI 命令，请参阅 [pricing-api-reference.md § Synapse Pools](pricing-api-reference.md#synapse-pools)。

### 步骤 1：分析现有工作负载

从源平台收集以下指标：

| 源平台 | 要收集的指标 | 查找位置 |
|---|---|---|
| **Databricks** | 集群小时数/天、DBU 消耗量、工作节点数、节点类型 | 集群指标、计费控制台 |
| **Synapse Spark** | 池运行小时数、节点数、节点大小 | Synapse Studio → 监视 → Apache Spark 池 |
| **Synapse SQL** | DWU 小时数/天、查询数量、扫描的数据量 | DMV、Azure Monitor |
| **Azure SQL/SQLDB** | DTU/vCore 小时数、查询模式 | 性能见解 |
| **Power BI Premium** | P-SKU 大小、刷新频率、用户数 | Power BI 管理门户 |
| **HDInsight** | VM 小时数、集群大小、HDFS 存储 | Azure 计费 |
| **AWS Redshift / EMR** | 节点类型、节点数、集群运行小时数、存储 GB | AWS Cost Explorer；通过 AWS CLI 获取集群配置 |
| **Google BigQuery / Dataproc** | 槽位数或按需扫描的 TB 数；Dataproc vCPU 小时数 | Cloud Billing 导出；GCP 控制台 |
| **Snowflake** | 仓库大小、每天消耗的 credits、存储 TB | `ACCOUNT_USAGE.METERING_DAILY_HISTORY` |
| **Teradata Vantage** | 节点/AMP 数量、TCore、存储；或市场中的计量单位 | 客户发票 / 云市场计量 |

### 第 2 步：映射到 Fabric CU 需求

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

**SQL warehouse 工作负载**（Synapse Dedicated SQL / DW）：

不要根据 DWU-to-CU 公式进行规模测算——Microsoft 未发布官方换算关系，因此任何 `DWU ÷ 2` 数值对于已承诺的 SKU 都无法实际用于决策。相反，应根据客户的**实际计费信号**驱动估算，并通过试点进行验证：

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

> **⚠️ 未完成试点时不得进行已承诺的规模测算。** 如果目前还无法进行试点，应将 DWU-hours 作为*待测量的输入*，并标记该估算受阻于试点数据——不要将 DWU ÷ 2 CU 数值作为交付结果。

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

### 第 3 步：汇总并确定规模

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

注意：容量平滑会重新分配*短时*突发负载（交互式约 5–64 分钟，后台最长 24 小时），但不会降低稳态并发总量——请根据持续并发需求进行容量规划。

---

## 存储定价

### 实时查询：OneLake 存储费率

通过 Azure Retail Prices API 获取客户所在区域的 OneLake 存储费率。OneLake 存储采用**分层定价**——不存在单一的 `OneLake Storage` 计量项（该筛选条件会返回零行）。请使用分层计量项名称，并选择与数据访问模式匹配的层级：`OneLake Storage Hot Data Stored`、`OneLake Storage Cool Data Stored`、`OneLake Storage Cold Data Stored`，以及用于镜像副本的 `Storage Mirroring Data Stored`（筛选条件：`serviceName eq 'Microsoft Fabric' and armRegionName eq '<region>'`，忽略包含 `reservationTerm` 的行）。如果筛选条件返回零行，请列出该区域的所有 Fabric 存储计量项并展示给用户——绝不能默默使用硬编码费率。请参阅 [`resources/pricing-api-reference.md`](resources/pricing-api-reference.md#storage-egress-and-serverless-rate-lookups) 中可运行的模板。

### 存储类型和定价模型

| 存储类型 | 定价查询筛选条件 | 备注 |
|---|---|---|
| **OneLake（托管 Delta/Parquet）** | `meterName eq 'OneLake Storage Hot Data Stored'`（或 Cool/Cold） | 主要的 Fabric 存储；根据访问模式分层 |
| **OneLake 快捷方式（不复制）** | $0（仅快捷方式元数据） | 源存储费用仍然适用 |
| **ADLS Gen2（源，通过快捷方式访问）** | `serviceName eq 'Storage' and skuName eq 'Hot LRS'` | 现有存储；不会产生重复副本 |
| **镜像存储** | `meterName eq 'Storage Mirroring Data Stored'` | OneLake 中的 Delta 副本 |

### 根据现有平台估算存储量

| 源平台 | 指标 | Fabric 对应项 |
|---|---|---|
| Databricks DBFS / 托管表 | Delta 表总大小（GB） | OneLake Tables/ 中的大小相同 |
| Synapse Spark 托管表 | ADLS Gen2 synfs 容器大小 | 迁移或使用快捷方式；大小相同 |
| Synapse SQL DW 存储 | `DBCC PDW_SHOWSPACEUSED` | 大致相同（Delta 格式） |
| Power BI 数据集 | 模型大小（压缩后、内存中） | 数据集导入 = 未压缩 Delta 大小的压缩后 × 2–4 |
| HDInsight HDFS | HDFS `du` 输出 | 转换为 Delta；相较于原始数据通常可压缩 30–60% |

---

## 网络出口定价

### 实时查询：出口费率

使用筛选条件 `serviceName eq 'Bandwidth' and armRegionName eq '<region>' and meterName eq 'Standard Data Transfer Out'` 获取客户所在区域的带宽/出口费率（忽略包含 `reservationTerm` 的行）。请参阅 [`resources/pricing-api-reference.md`](resources/pricing-api-reference.md#storage-egress-and-serverless-rate-lookups) 中可运行的模板。

### 出口成本模型

Azure 出口采用**分层定价**，数据来源不同，适用的计量项也不同。绝不能套用单一的固定每 GB 费率——请先确定层级和来源，再查询实时费率。

| 场景 | 定价来源 | 缓解措施 |
|---|---|---|
| 同一区域（区域内） | 免费 | 让容量和存储保持共置 |
| 互联网出口的第一层 | Bandwidth API：每月前 100 GB 免费（`meterName eq 'Standard Data Transfer Out'`），之后分层计费 | 将小型传输批处理到免费额度内 |
| 互联网出口（超过免费层级） | Bandwidth API：根据每月用量分层——GB 数量越高，费率逐级降低 | 尽量减少公共下载；分别计算每个层级区间的价格 |
| 跨区域（区域间） | Bandwidth API：`meterName eq 'Inter Region Data Transfer Out'` | 使用 OneLake 区域快捷方式 |
| 跨云源（AWS/GCP → Fabric） | **源云**的出口计量项（AWS Data Transfer Out / GCP Network Egress），而非 Azure | 通过同云快捷方式进行暂存；出口费用由源云计收 |
| Private Link / Private Endpoint | 标准出口费用 **加上** PE 小时费用 **加上**按 GB 计的 PE 数据处理费用 | 用于满足合规要求；需要为这三个组成部分全部编制预算 |

**迁移出站流量估算**：对于一次性迁移，按迁移时实时的各层级费率，将迁移量分摊到适用的层级区间（免费层 → 第 1 层 → 第 2 层……），并在从 AWS/GCP 迁移时，加上**源云**的出站流量费用。同一区域内的 Azure 内部移动：$0。

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

### Spark 密集型工作负载：Spark 自动缩放计费与标准容量

Spark 有**两种不同的计费模式**——请选择其中一种；同一个 Spark 作业不能同时采用这两种模式计费：

- **标准模式（按容量计费）**：Spark 从容量 SKU 中消耗 CU（支持 3× 突发和均衡处理）。应将一个 SKU 的大小设置为能够随时间覆盖*所有*工作负载（SQL + PBI + Pipelines + Spark）的并发 CU 总和。
- **Spark 自动缩放计费（选择加入的无服务器模式）**：Spark 作业会**从容量中卸载**，并按照 `autoscale for Spark Capacity Usage CU` 计量器，以每 Spark CU 小时单独计费。Spark 不支持突发和均衡处理，这些作业也**不会消耗容量 CU**。这样，你可以根据非 Spark 稳态工作负载（SQL DW + Power BI + Pipelines）来确定基础容量的大小，并通过设置 Spark CU 上限来独立支付 Spark 费用。

实时获取自动缩放 Spark 费率（`$/CU-hour`）——**不要重复使用基础/PAYG 费率，也绝不要硬编码数值。**对于任何自动缩放/盈亏平衡问题，你的第一步都必须是在 shell 中运行以下获取命令，并读取 API 返回的 `retailPrice`：

```bash
curl -s "https://prices.azure.com/api/retail/prices?api-version=2023-01-01-preview&\$filter=serviceName%20eq%20'Microsoft Fabric'%20and%20armRegionName%20eq%20'<region>'%20and%20meterName%20eq%20'autoscale for Spark Capacity Usage CU'" | jq '.Items[] | select(.reservationTerm == null) | {meterName, retailPrice, unitOfMeasure, armRegionName}'
```

使用返回结果中对应行的 `retailPrice` 值作为自动缩放费率。如果该区域没有返回任何行，则列出该区域的所有 Fabric Spark 计量器并展示出来——**不要**假设、复制或重复使用基础费率。请参阅 [`resources/pricing-api-reference.md`](resources/pricing-api-reference.md#storage-egress-and-serverless-rate-lookups) 中可运行的模板。

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

`reservationRetailPrice`（期限总价）和 `paygCuHourRate`（`priceType eq 'Consumption'`，来自 `* Capacity Usage CU` 计量器）均来自 Retail Prices API。对于高度可变或具有季节性的需求，可将较小的 RI 基础容量与 PAYG 搭配使用，或针对 Spark 的可变部分使用 Autoscale Billing。

---

## SKU 大小选择决策树

### 输入变量

向用户收集：

1. **所有工作负载的峰值并发 CU 需求**
2. **每日消耗的平均 CU-hours**
3. **工作负载构成**（Spark、SQL、PBI 及其他所占比例）
4. **增长预测**（12 个月预测）
5. **合规要求**（Private Link、专用容量）
6. **预算约束**（月度上限）

### 大小选择算法

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

### SKU 快速参考选择器

将 **sized CU** 输入此表——即先运行 Sizing Algorithm 的第 1–5 步，计算 `sized_CU = peak_CU × (1 + growth_rate) × 1.2`，然后将该值（**而不是**原始峰值需求）映射到相应层级。安全系数和增长率已经包含在左列中，因此不要重复应用。

| Sized CU (after growth + 1.2× safety) | Recommended Base SKU | Notes |
|---|---|---|
| ≤ 2 CUs | F2 | 试用 / 极小型开发 |
| 3–4 CUs | F4 | 开发/测试，小型团队 |
| 5–8 CUs | F8 | 小型生产环境 |
| 9–16 CUs | F16 | 中型生产环境 |
| 17–32 CUs | F32 | 标准生产环境 |
| 33–64 CUs | F64 | 大型生产环境，多团队 |
| 65–128 CUs | F128 | 企业级 |
| 129–256 CUs | F256 | 大型企业 |
| 257–512 CUs | F512 | 超大型企业 |
| 513–1024 CUs | F1024 | 多团队企业平台 |
| 1025–2048 CUs | F2048 | 超大型环境 |
| 2049–4096 CUs | F4096 | 超大规模环境 |
| 4097–8192 CUs | F8192 | 最大单容量层级 |
| > 8192 CUs | Multiple capacities | 讨论多容量架构 / 工作区分区 |

---

## 迁移成本工作表

### 模板：呈现给用户

估算迁移成本时，使用上述 API 中的实时数据。生成一份工作表，涵盖以下关键部分：

- **Header** — 客户/项目名称、区域、定价日期、数据来源
- **Current Spend** — 通过 Cost Management API 获取各平台（Databricks、Synapse SQL/Spark、Power BI Premium、Storage）的实时月度成本
- **Source Workload Profile** — 每日 Spark 作业数、每日 SQL DWU-hours、Power BI SKU 利用率、管道运行次数、存储 TB
- **Fabric CU Demand** — 按工作负载类型及总体计算峰值和平均 CU 估算值
- **Recommended Configuration** — 基础 SKU（F-tier）、Spark 计费模式、RI 期限
- **Monthly Cost Breakdown** — 根据实时 API 价格计算容量、Spark autoscale、存储和网络出口的月度成本明细
- **Savings vs. Current** — 差额和百分比变化

完整的可打印模板请参见 [`resources/cost-estimation-worksheet.md`](resources/cost-estimation-worksheet.md)。

---

## 必须 / 优先 / 避免

### 必须做到
- **始终获取实时定价——比较双方都要获取。** 目标平台（Fabric）的价格来自 Azure Retail Prices API（`prices.azure.com`）；源平台的价格来自该平台的实时计费/价格 API 或客户的实际发票。绝不要为任一方硬编码美元金额。
- **绝不要仅根据启发式换算最终确定 SKU 或承诺成本。** 将所有*跨平台* vCore→CU 和 DWU→CU 映射视为*仅用于试点验证的输入*（Fabric 内部的 1 CU = 2 Spark vCores 比率已有文档记录，但源引擎 → Fabric 的等价关系尚未确定）。将基于启发式方法得出的数字标记为初步估算，并要求使用试点工作负载（通过 Capacity Metrics 应用测量 CU 消耗），然后再进行任何最终规模确定或 RI 购买。
- **从客户现有的 Fabric capacity 中检测客户所在区域，或明确询问客户**——价格因区域而异
- **当客户拥有 Azure 订阅访问权限时，通过 Azure Cost Management API 获取当前支出**——为比较建立基线
- **在进行估算前始终询问源工作负载配置**——绝不要假设工作负载规模
- **包含所有成本维度**——计算（CU）、存储、网络出口，以及任何高级功能（Private Link、BCDR）
- **明确说明数据来源**——区域、货币、API 查询日期，并提供 Azure Pricing Calculator 链接以供验证
- **当 Spark 占 CU 需求超过 50% 时，单独核算 Autoscale Billing for Spark**——在该模型下，Spark 会从容量中卸载出来并单独计费；不要将其计入基础容量
- **在选择 SKU 前，将峰值 CU 需求乘以 1.2 的安全系数**
- **包含 Reserved Instance 分析**——针对推荐 SKU，展示 PAYG、1-year 和 3-year 的比较
- **提供迁移成本工作表模板**，并使用实时数据填写所有明细项目

### 优先
- **针对以 Spark 为主的工作负载使用 Autoscale Billing for Spark** — 将 Spark 从容量中卸载出来并单独计费，避免为了突发性 Spark 作业而过度预配基础 SKU（在此模型下，Spark 禁用突发和负载平滑）
- 对于混合型、以 Spark 为主的工作负载，默认建议使用 **Reserved Instance 基础容量 + Autoscale Billing for Spark**
- 对现有 ADLS Gen2 数据，优先使用 **OneLake Shortcuts 而非复制数据** — 避免双重存储成本
- **将容量和存储置于同一 Azure 区域** — 消除跨区域出口流量
- 在预算受限时采用**分阶段迁移**方案 — 从 F8/F16 开始，然后逐步扩展
- 迁移后进行**每月利用率监控** — 只有在获得 30 天以上的实际使用数据后，才建议使用 RI
- 在估算中考虑**工作负载平滑** — Fabric 会将交互式突发负载平滑到约 5–64 分钟内，并将后台作业平滑到最长 24 小时；**Autoscale Billing 下的 Spark 禁用平滑**。它会重新分配突发负载，但不会降低稳态下的并发需求。

### 避免
- **不要硬编码价格** — 始终使用实时数据源（Fabric 使用 Azure Retail Prices API；当前支出使用源平台的价格 API 或实际账单）；硬编码的值会过时
- **不要为没有公开价格 API 的平台虚构价格**（Databricks DBU、Snowflake credits、Teradata）— 使用客户的实际使用数据/账单或官方定价页面，并注明来源
- **不要在未注明来源和日期的情况下引用价格** — 始终包含 "from Azure Retail Prices API as of [date]"
- **不要在稳态工作负载尚未建立的情况下推荐 3-year RI** — 等待工作负载模式得到验证（至少 3 个月）
- **不要仅根据 Spark 峰值来确定容量大小** — 要么将 Spark 纳入并发 CU 总和（标准方式），要么通过 Autoscale Billing for Spark 将其卸载；基础 SKU 覆盖非 Spark 的稳态需求
- **不要忽略 Power BI CU 消耗** — 语义模型刷新和交互式查询会消耗大量 CU
- **不要忘记多区域或混合架构中的网络出口流量**
- **不要混淆 CU 和 vCore** — CU 是 Fabric 的统一计费单位；vCore 是 Spark 的执行资源。在 Fabric Spark 中，vCore→CU 的比例是**有文档说明的**（1 CU = 2 Spark vCore，参见 Spark CU Mapping 部分），因此 Fabric 池节点 → CU 的换算是确定性的。具有启发性的是**跨平台**等效关系 — 将源引擎的 vCore（Databricks/Synapse/EMR）映射为 Fabric CU — 在确定 SKU 大小之前，必须通过试点进行验证
- **不要跳过 Cost Management API 检查** — 如果用户拥有 Azure 访问权限，始终通过编程方式确定其当前基线支出

---

## 示例

### 示例 1：Databricks 迁移成本估算

**用户提示**：“我每天运行 5 个 Databricks Spark 作业，每个作业使用 4×D8s_v5 集群运行约 3 小时，此外还有一个 Power BI P1 和 2TB Delta 表。在 Fabric 中这需要多少成本？”

**代理工作流**：
1. 检测区域（询问用户，或通过 `GET /v1/capacities` 或 ARM 检查现有容量 — 参见 [§ Fabric capacity discovery](resources/pricing-api-reference.md#3-fabric-capacity-discovery-fabric-rest--arm)）
2. 通过 [Cost Management API](resources/pricing-api-reference.md#2-azure-cost-management-api-auth-required) 获取当前 Databricks 支出
3. 使用 [Retail Prices 分页模式](resources/pricing-api-reference.md#pagination) 获取实时 Fabric 定价
4. 计算 CU 需求并展示工作表

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

**价格查询**：使用 `armSkuName eq 'Fabric_Capacity_CU_Hour'` + `armRegionName eq '<region>'` + `meterName eq 'Fabric Capacity CU'` 对 Retail Prices API 进行筛选。`reservationTerm` **是**可筛选的 OData 字段，因此可以直接使用 `reservationTerm eq '1 Year'` 拉取 1 年期记录（或者从每条返回的记录中读取该字段）——将该期限总价 ÷ 12 × 64 CUs 进行摊销。对于 Spark 费率，使用 `meterName eq 'autoscale for Spark Capacity Usage CU'`；对于存储，使用 `meterName eq 'OneLake Storage Hot Data Stored'`。完整的分页和筛选模式请参阅 [pricing-api-reference.md](resources/pricing-api-reference.md)。

### 示例 2：Synapse SQL DW 迁移

**用户提示**："我们每天运行 Synapse DW1000c 18 小时，并且有 5TB 的仓库数据。"

**Agent 工作流**：
1. 通过 [成本管理 API](resources/pricing-api-reference.md#2-azure-cost-management-api-auth-required) 获取当前 Synapse 支出（筛选条件：`"Azure Synapse Analytics"`）
2. 使用适用于客户所在区域的 [Retail Prices 分页模式](resources/pricing-api-reference.md#pagination) 获取实时 Fabric 定价
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