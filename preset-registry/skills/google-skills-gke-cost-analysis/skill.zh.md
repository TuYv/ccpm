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

此技能提供有关回答 GKE 相关成本、结算报告和利用率分析等自然语言问题的指导。

## 概述

当用户询问 GKE 成本时（例如，“我在各个项目中的成本是多少？”、
“成本最高的命名空间是什么？”、“为什么我的集群成本突然飙升？”），请使用
此技能，基于 BigQuery 结算导出、成本分配元数据和实时集群指标，
提供结构化的专业回答。

## 说明

处理与成本相关的问题时：

1.  **提供直接回答**：清晰、简洁地回答具体的成本问题或
    分析请求。
2.  **说明 BigQuery 集成**：说明如何查询 BigQuery 以获取
    历史成本明细。请注意，GKE 成本源自 GCP
    Billing Detailed BigQuery Export（`gcp_billing_export_resource_v1_*`）。
3.  **检查并验证成本分配**：说明必须在集群上启用 GKE Cost Allocation
    （`--enable-cost-allocation`），才能获得命名空间、标签和
    工作负载级别的结算粒度。如果查询返回空标签，
    请提供用于启用该功能的 `gcloud` 命令。
4.  **分析定价驱动因素和利用率**：诊断成本驱动因素时，
    说明集群运行于 Autopilot 模式（按 Pod 请求的
    CPU/内存计费）还是 Standard 模式（按底层 VM 节点规格和控制
    平面费用计费），并将实时利用率（`kubectl top`）与
    已配置的资源请求进行比较。
5.  **提供可操作的命令/查询**：提供具体的 BigQuery CLI（`bq
    query`）命令，或只读的 `gcloud`/`kubectl` 检查命令。如果可用，
    优先使用 `bq`，而不是 BigQuery Studio。

## 要点和定价驱动因素

-   **数据源**：GKE 成本来自 GCP Billing Detailed BigQuery Export。
    用户必须提供其 BigQuery 表的完整路径（数据集名称
    以及包含 Billing Account ID 的表名称）。
-   **粒度要求**：必须在集群上启用 GKE Cost Allocation
    （`--enable-cost-allocation`），才能在 BigQuery 中填充
    `goog-k8s-cluster-name`、`k8s-namespace`、`k8s-workload-name` 和
    `k8s-workload-type` 标签。
-   **Autopilot 与 Standard 的成本驱动因素**：
    -   **Autopilot 定价**：直接按 Pod 资源请求
        （`requests.cpu`、`requests.memory`、临时存储）计费。资源请求过高的
        Pod 会增加结算费用，无论该 Pod 是否实际使用了这些
        CPU 周期或内存。
    -   **Standard 定价**：按已配置的节点池 VM（`e2`、`n4`、
        `c3` 等）以及集群管理费（每小时 $0.10）计费。空闲节点或
        多个利用率较低的开发集群会导致额外的基础设施成本。
-   **赠金和折扣的影响**：分析 `cost` 与
    `cost_before_credits` 时，请注意，承诺使用折扣（CUD）和 Spot VM
    在结算导出中体现为赠金或降价费用。
-   **工具和语法**：优先使用 BigQuery CLI（`bq`）。编写 Standard
    SQL 查询时，请使用句点（`.`）而不是冒号（`:`）来分隔
    项目 ID 和数据集名称（`{project_id}.{dataset_name}.{table_name}`）。
-   **默认值**：除非另有指定，否则假定查询最近 30 天、行数限制为 10，并按成本降序
    排列（`ORDER BY cost DESC`）。

## 实时集群与成本监控

使用只读 CLI 命令检查当前集群预算、节点利用率，以及 Pod 资源消耗与请求量的对比情况：

```bash
# View billing budgets for an account (requires Cost Management API)
gcloud billing budgets list --billing-account={billing_account} --quiet

# Verify/Enable GKE cost allocation on a cluster for namespace-level billing tracking
gcloud container clusters update {cluster_name} \
    --enable-cost-allocation \
    --region {region}

# View live node resource utilization across the cluster
kubectl top nodes

# View pod resource usage across namespaces (compare against requested limits to diagnose waste)
kubectl top pods --all-namespaces --containers
```

## 应用成本优化

如需根据分析结果应用规格合理化调整（例如设置 `VPA` 建议模式、将 CPU/内存调整为 `P95 * 1.2`、通过 `nodeSelector` 或 `ComputeClass` 配置 Spot VM、强制实施 `ResourceQuotas`，或选择机器类型和 CUD），请使用 **`gke-cost-optimization`** skill。

## BigQuery 查询示例

使用这些查询作为模板来回答问题。所有参数（数据集、表、项目、集群等）都必须替换为用户提供的值。

### 单个集群中单个工作负载的成本

```sql
bq query --nouse_legacy_sql '
SELECT
  SUM(cost) + SUM(IFNULL((SELECT SUM(c.amount) FROM UNNEST(credits) c), 0)) AS cost,
  SUM(cost) AS cost_before_credits
FROM {billing_export_table} AS bqe
WHERE _PARTITIONTIME >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
  AND project.id = "{project_id}"
  AND EXISTS(SELECT * FROM bqe.labels AS l WHERE l.key = "goog-k8s-cluster-location" AND l.value = "{region}")
  AND EXISTS(SELECT * FROM bqe.labels AS l WHERE l.key = "goog-k8s-cluster-name" AND l.value = "{cluster_name}")
  AND EXISTS(SELECT * FROM bqe.labels AS l WHERE l.key = "k8s-namespace" AND l.value = "{namespace}")
  AND EXISTS(SELECT * FROM bqe.labels AS l WHERE l.key = "k8s-workload-type" AND l.value = "{workload_type}")
  AND EXISTS(SELECT * FROM bqe.labels AS l WHERE l.key = "k8s-workload-name" AND l.value = "{workload_name}")
;
'
```

### 每个集群中各个工作负载的成本

```sql
bq query --nouse_legacy_sql '
SELECT
  project.id AS project_id,
  (SELECT l.value FROM bqe.labels AS l WHERE l.key = "goog-k8s-cluster-location" LIMIT 1) AS cluster_location,
  (SELECT l.value FROM bqe.labels AS l WHERE l.key = "goog-k8s-cluster-name" LIMIT 1) AS cluster_name,
  (SELECT l.value FROM bqe.labels AS l WHERE l.key = "k8s-namespace" LIMIT 1) AS k8s_namespace,
  (SELECT l.value FROM bqe.labels AS l WHERE l.key = "k8s-workload-type" LIMIT 1) AS k8s_workload_type,
  (SELECT l.value FROM bqe.labels AS l WHERE l.key = "k8s-workload-name" LIMIT 1) AS k8s_workload_name,
  SUM(cost) + SUM(IFNULL((SELECT SUM(c.amount) FROM UNNEST(credits) c), 0)) AS cost,
  SUM(cost) AS cost_before_credits
FROM {billing_export_table} AS bqe
WHERE _PARTITIONTIME >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
  AND EXISTS(SELECT * FROM bqe.labels AS l WHERE l.key = "goog-k8s-cluster-name")
GROUP BY 1, 2, 3, 4, 5, 6
ORDER BY 7 DESC
LIMIT 10
;
'
```

### 集群中按命名空间划分的费用明细

```sql
bq query --nouse_legacy_sql '
SELECT
  (SELECT l.value FROM bqe.labels AS l WHERE l.key = "k8s-namespace" LIMIT 1) AS k8s_namespace,
  SUM(cost) + SUM(IFNULL((SELECT SUM(c.amount) FROM UNNEST(credits) c), 0)) AS net_cost,
  SUM(cost) AS gross_cost
FROM {billing_export_table} AS bqe
WHERE _PARTITIONTIME >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
  AND project.id = "{project_id}"
  AND EXISTS(SELECT * FROM bqe.labels AS l WHERE l.key = "goog-k8s-cluster-name" AND l.value = "{cluster_name}")
GROUP BY 1
ORDER BY 2 DESC
LIMIT 10
;
'
```

注意：检查 `goog-k8s-cluster-name` 标签是否存在，可将总计费数据的范围
明确限定为 GKE 费用。