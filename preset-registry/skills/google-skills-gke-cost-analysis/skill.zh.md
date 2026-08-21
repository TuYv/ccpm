---
name: gke-cost-analysis
metadata:
  category: CloudObservabilityAndMonitoring
description: >-
  Answer natural language questions and perform analysis on GKE cluster and
  workload costs using BigQuery billing exports, cost allocation data, and live
  cluster monitoring metrics. Use when querying GKE costs across projects,
  namespaces, or workloads, analyzing billing reports in BigQuery (`bq`), checking
  cluster cost budgets (`gcloud billing`), or diagnosing cost drivers like pod
  requests vs. actual utilization (`kubectl top`). Don't use for applying cost
  optimization changes, creating rightsizing manifests (VPA/MPA), or selecting
  ComputeClasses (use gke-cost-optimization instead).
---
# GKE 成本分析

此技能提供相关指导，用于回答有关 GKE 成本、结算报告和利用率分析的自然语言问题。

## 概述

当用户询问 GKE 成本时（例如，“我在各个项目中的成本是多少？”、“成本最高的命名空间是什么？”、“为什么我的集群成本正在激增？”），请使用此技能，结合 BigQuery 结算导出、成本分配元数据和实时集群指标，提供结构化的专业回答。

## 说明

处理与成本相关的问题时：

1.  **提供直接答案**：清晰简洁地回答具体的成本问题或分析请求。
2.  **说明 BigQuery 集成**：说明如何查询 BigQuery 以获取历史成本明细。请注意，GKE 成本来源于 GCP 结算明细 BigQuery 导出（`gcp_billing_export_resource_v1_*`）。
3.  **检查并验证成本分配**：说明必须在集群上启用 GKE 成本分配（`--enable-cost-allocation`），才能获得命名空间、标签和工作负载级别的结算粒度。如果查询返回空标签，请提供用于启用该功能的 `gcloud` 命令。
4.  **分析定价驱动因素和利用率**：诊断成本驱动因素时，请说明集群采用的是 Autopilot 模式（按 Pod 请求的 CPU/内存计费）还是 Standard 模式（按底层虚拟机节点规格和控制平面费用计费），并将实时利用率（`kubectl top`）与已配置的资源请求进行比较。
5.  **提供可执行的命令/查询**：提供具体的 BigQuery CLI（`bq
    query`）命令，或只读的 `gcloud`/`kubectl` 检查命令。可用时优先使用 `bq`，而不是 BigQuery Studio。

## 要点和定价驱动因素

-   **数据源**：GKE 成本来源于 GCP 结算明细 BigQuery 导出。用户必须提供其 BigQuery 表的完整路径（数据集名称，以及名称中包含结算账号 ID 的表名）。
-   **粒度要求**：必须在集群上启用 GKE 成本分配（`--enable-cost-allocation`），才能在 BigQuery 中填充 `goog-k8s-cluster-name`、`k8s-namespace`、`k8s-workload-name` 和 `k8s-workload-type` 标签。
-   **Autopilot 与 Standard 的成本驱动因素**：
    -   **Autopilot 定价**：直接根据 Pod 资源请求（`requests.cpu`、`requests.memory`、临时存储）计费。无论 Pod 是否实际使用这些 CPU 周期或内存，资源请求过高的 Pod 都会推高费用。
    -   **Standard 定价**：根据已配置的节点池虚拟机（`e2`、`n4`、`c3` 等）计费。空闲节点或多个利用率较低的开发集群会造成额外的基础设施成本。
    -   **集群管理费**：Standard 和 Autopilot 模式均收取每个集群约 0.10 美元/小时的费用。免费层级会为每个结算账号中的一个符合条件的集群免除此费用。
-   **抵扣和折扣的影响**：分析 `cost` 与 `cost_before_credits` 时，请注意，承诺使用折扣（CUD）和 Spot 虚拟机会在结算导出中显示为抵扣项或降价后的费用。
-   **工具和语法**：优先使用 BigQuery CLI（`bq`）。编写 Standard SQL 查询时，请使用点号（`.`）而不是冒号（`:`）来分隔项目 ID 和数据集名称（`{project_id}.{dataset_name}.{table_name}`）。
-   **默认设置**：除非另有指定，否则假定查询最近 30 天的数据，将行数限制为 10，并按成本降序排列（`ORDER BY cost DESC`）。

## 实时集群与成本监控

使用只读 CLI 命令检查当前集群预算、节点利用率，以及 Pod 资源消耗与请求量的对比：

```bash
# View billing budgets for an account (requires Cost Management API)
gcloud billing budgets list --billing-account={billing_account} --quiet

# View live node resource utilization across the cluster
kubectl top nodes

# View pod resource usage across namespaces (compare against requested limits to diagnose waste)
kubectl top pods --all-namespaces --containers
```

> **警告 — 会修改集群，并非只读操作：** 启用 GKE 成本分配
> 会修改集群。运行前须获得用户明确确认，并且
> 命名空间/工作负载标签仅会从启用后开始写入结算导出数据
>（不会回填历史数据）。
>
> ```bash
> gcloud container clusters update {cluster_name} \
>     --enable-cost-allocation \
>     --region {region}
> ```

## 应用成本优化

如需根据分析结果应用规格调整变更（例如设置 `VPA`
建议模式、将 CPU/内存调整为 `P95 * 1.2`、通过 `nodeSelector` 或 `ComputeClass`
配置 Spot VM、强制实施 `ResourceQuotas`，或选择
机器类型和 CUD），请使用 **`gke-cost-optimization`** skill。

## BigQuery 查询模板

可直接调整使用的 `bq query` 模板——单个工作负载成本、按工作负载和集群
细分、按命名空间细分——以及占位符策略和默认值（30 天、`LIMIT 10`、`ORDER BY cost DESC`）均位于
[references/billing-queries.md](references/billing-queries.md) 中。所有参数
（数据集、表、项目、集群等）都必须替换为用户提供的值。

注意：检查 `goog-k8s-cluster-name` 标签是否存在，可将结算数据总量的范围
明确限定为 GKE 成本。