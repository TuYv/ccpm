---
name: gke-ai-troubleshooting-tpu-metrics-monitoring
description: >-
  Monitors and troubleshoots GKE TPU workloads, nodes, and node pools using GKE
  system metrics and PromQL. Use when monitoring TensorCore duty cycle, TPU memory,
  node readiness, multi-host TPU node pool availability, host maintenance or
  preemption interruptions, and calculating MTTR or MTBI metrics for GKE TPUs.
  Don't use for general non-TPU GKE workload monitoring or non-metric TPU debugging.
metadata:
  category: CloudObservabilityAndMonitoring
---
# GKE TPU 指标监控指南

此技能使智能体能够使用 GKE 系统指标监控 GKE TPU 工作负载、节点和节点池。它有助于诊断工作负载中断或性能问题是否由底层基础设施引起。

## 步骤 0：必需的上下文

使用可用的 GKE 和 Cloud 工具自行收集所需的上下文（例如集群详细信息或节点池名称），或使用提供的 `{variable}` 占位符：

- `{project_id}`：GCP 项目 ID。
- `{cluster_name}`：GKE 集群名称。
- `{location}`：GKE 集群位置（区域或可用区）。
- `{node_name}`：（可选）特定 GKE 节点的名称。
- `{node_pool_name}`：（可选）GKE 节点池的名称。

---

## 诊断步骤

### 步骤 1：验证 TPU 运行时指标配置 [低风险] [自动]

在分析运行时指标之前，请验证工作负载是否已配置为导出这些指标。这可确保集群和容器环境已针对自动抓取指标进行正确设置，并能够查看加速器的运行状况。

- **操作**：验证 Pod 规范和集群是否满足以下前提条件：
  - TPU 容器上已公开 `containerPort: 8431`（Prometheus 抓取指标所必需）。
  - 如果使用 JAX，则 JAX 版本须为 `0.4.14` 或更高版本（更早的版本不会导出运行时指标）。
  - GKE 版本须为 `1.27.4-gke.900` 或更高版本（支持 TPU 运行时指标所必需）。
  - 集群上已启用 GKE 系统指标（Cloud Monitoring 注入指标所必需）。

### 步骤 2：监控 TPU 运行时指标 [低风险] [自动]

如果配置正确，则 Cloud Monitoring 中将提供以下指标（受监控资源为 `k8s_node` 和 `k8s_container`）：

- **容器指标**：
  - `kubernetes.io/container/accelerator/duty_cycle`：在过去的采样周期（60 秒）内，TensorCore 在 TPU 芯片上主动进行处理的时间百分比。
  - `kubernetes.io/container/accelerator/memory_used`：已分配的加速器内存量，以字节为单位。
  - `kubernetes.io/container/accelerator/memory_total`：加速器内存总量，以字节为单位。
- **节点指标**：
  - `kubernetes.io/node/accelerator/duty_cycle`
  - `kubernetes.io/node/accelerator/memory_used`
  - `kubernetes.io/node/accelerator/memory_total`

### 步骤 3：检查节点状态条件 [低风险] [自动]

查询 GKE 节点的状态条件（GKE 版本须为 `1.32.1-gke.1357001` 或更高版本）。

- **PromQL 查询（检查特定节点是否为 Ready）**：
  ```promql
  kubernetes_io:node_status_condition{monitored_resource="k8s_node", cluster_name="{cluster_name}", node_name="{node_name}", condition="Ready", status="True"}
  ```
- **PromQL 查询（列出值为 True 的非 Ready 条件节点）**：
  ```promql
  kubernetes_io:node_status_condition{monitored_resource="k8s_node", cluster_name="{cluster_name}", condition!="Ready", status="True"}
  ```
- **PromQL 查询（列出非 Ready 节点）**：
  ```promql
  kubernetes_io:node_status_condition{monitored_resource="k8s_node", cluster_name="{cluster_name}", condition="Ready", status="False"}
  ```
- **PromQL 查询（整个舰队的节点状态）**：
  ```promql
  avg by (condition,status)(avg_over_time(kubernetes_io:node_status_condition{monitored_resource="k8s_node"}[5m]))
  ```

### 步骤 4：检查节点池状态 [低风险] [自动]

查询多主机 TPU 节点池的状态。

- **PromQL 查询（验证特定节点池是否处于运行状态）**：
  ```promql
  kubernetes_io:node_pool_status{monitored_resource="k8s_node_pool", cluster_name="{cluster_name}", node_pool_name="{node_pool_name}", status="Running"}
  ```
- **PromQL 查询（按状态分组监控节点池）**：
  ```promql
  count by (status)(count_over_time(kubernetes_io:node_pool_status{monitored_resource="k8s_node_pool"}[5m]))
  ```
  _可能的状态_：`Provisioning`、`Running`、`Error`、`Reconciling`、`Stopping`。

### 步骤 5：检查节点池可用性 [低风险] [自动]

查询多主机 TPU 节点池中的所有节点是否均可用。

- **PromQL 查询（检查一段时间内的可用性）**：
  ```promql
  avg by (node_pool_name)(avg_over_time(kubernetes_io:node_pool_multi_host_available{monitored_resource="k8s_node_pool", cluster_name="{cluster_name}"}[5m]))
  ```
  _值_：`1`（是，所有节点均可用）或 `0`（否，部分节点不可用）。

### 步骤 6：分析节点中断 [低风险] [自动]

查询 GKE 节点的中断次数。

- **PromQL 查询（中断及其原因的明细）**：
  ```promql
  sum by (interruption_type,interruption_reason)(sum_over_time(kubernetes_io:node_interruption_count{monitored_resource="k8s_node"}[5m]))
  ```
  _中断类型_：`TerminationEvent`、`MaintenanceEvent`、`PreemptionEvent`。
  _中断原因_：`HostError`、`Eviction`、`AutoRepair`。
- **PromQL 查询（筛选主机维护事件）**：
  ```promql
  sum by (interruption_type,interruption_reason)(sum_over_time(kubernetes_io:node_interruption_count{monitored_resource="k8s_node", interruption_reason="HW/SW Maintenance"}[5m]))
  ```
- **PromQL 查询（按节点池聚合中断次数）**：
  ```promql
  sum by (node_pool_name,interruption_type,interruption_reason)(sum_over_time(kubernetes_io:node_pool_interruption_count{monitored_resource="k8s_node_pool", interruption_reason="HW/SW Maintenance", node_pool_name="{node_pool_name}"}[5m]))
  ```

### 步骤 7：计算恢复和中断指标 [低风险] [自动]

计算过去 7 天的平均恢复时间（MTTR）和平均中断间隔时间（MTBI）。

- **PromQL 查询（MTTR - 平均恢复时间）**：
  ```promql
  sum(sum_over_time(kubernetes_io:node_pool_accelerator_times_to_recover_sum{monitored_resource="k8s_node_pool", cluster_name="{cluster_name}"}[7d])) / sum(sum_over_time(kubernetes_io:node_pool_accelerator_times_to_recover_count{monitored_resource="k8s_node_pool",cluster_name="{cluster_name}"}[7d]))
  ```
- **PromQL 查询（MTBI - 平均中断间隔时间）**：
  ```promql
  sum(count_over_time(kubernetes_io:node_memory_total_bytes{monitored_resource="k8s_node", node_name=~"gke-tpu.*|gk3-tpu.*", cluster_name="{cluster_name}"}[7d])) / sum(sum_over_time(kubernetes_io:node_interruption_count{monitored_resource="k8s_node", node_name=~"gke-tpu.*|gk3-tpu.*", cluster_name="{cluster_name}"}[7d]))
  ```

### 步骤 8：监控 TPU 主机指标 [低风险] [自动]

对于 GKE `1.28.1-gke.1066000` 或更高版本，请监控 TPU 主机性能。

- **容器指标**：
  - `kubernetes.io/container/accelerator/tensorcore_utilization`：当前 TensorCore 的利用率百分比。
  - `kubernetes.io/container/accelerator/memory_bandwidth_utilization`：当前正在使用的加速器内存带宽百分比。
- **节点指标**：
  - `kubernetes.io/node/accelerator/tensorcore_utilization`
  - `kubernetes.io/node/accelerator/memory_bandwidth_utilization`