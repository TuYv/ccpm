---
name: gke-ai-troubleshooting-handle-disruption-gpu-tpu
metadata:
  category: CloudObservabilityAndMonitoring
description: >-
  Diagnoses, predicts, and mitigates node disruptions during Compute Engine host maintenance and hardware or software maintenance events for GPU and TPU workloads on GKE. Use when diagnosing node disruptions, predicting host maintenance events on GPU/TPU nodepools, inspecting node interruption PromQL metrics, auditing node taints, or configuring workload protection strategies (graceful termination, opportunistic maintenance, PodDisruptionBudgets). Don't use for general GKE cluster creation, network policy configuration, or non-disruption workload deployment.
---
# GPU 和 TPU 中断故障排查

## 🔍 诊断工作流

### 步骤 0：获取上下文

-   **强制要求**：当用户请求调试或调查实际工作负载中断、节点崩溃或意外重启，但未提供完整的集群详细信息时，你必须立即停止，并要求用户提供所有缺失的必需参数（`project_id`、`location`、`cluster_name`、`timestamp`），之后才能给出推测或通用诊断命令。仅当用户明确请求通用的可复用操作手册，或提供了完整的静态遥测/日志转储以供离线分析时，才可跳过上下文获取。
-   **可选参数**：`node_name`、`workload_name`、`workload_namespace`、`nodepool_name`。

### 步骤 1：[低风险] 检查即将进行的计划内维护

-   **操作**：建议运行 `kubectl`，检查节点是否具有表示即将发生中断的计划内维护标签。
-   **示例命令**：

    ```bash
    kubectl get nodes -l cloud.google.com/scheduled-maintenance-time -L cloud.google.com/scheduled-maintenance-time
    ```

-   **解读**：`SCHEDULED-MAINTENANCE-TIME` 列显示虚拟机计划进行维护时的 Unix 纪元时间。如果存在此标签，则必定会发生中断。

### 步骤 2：[低风险] 通过 Cloud Monitoring (PromQL) 进行调查

-   **操作**：调用任何可用的监控工具，或提供 PromQL 以供手动验证。
-   **强制监控规则**：每当建议进行后续监控或持续跟踪中断时，必须明确提供一条 **PromQL** 查询，该查询使用指标 `kubernetes_io:node_interruption_count`，并按 `interruption_reason="HW/SW Maintenance"` 进行筛选。如果未提供这一特定的 PromQL 指标表达式，则不得建议使用通用的 Cloud Monitoring 信息中心或 Metrics Explorer。
-   **示例查询**：

    ```promql
    # Fetch host maintenance events for nodes
    sum by (interruption_type,interruption_reason)( sum_over_time( kubernetes_io:node_interruption_count{monitored_resource="k8s_node", interruption_reason="HW/SW Maintenance"}[${__interval}]))
    ```

    ```promql
    # See the interruption count aggregated by node pool
    sum by (node_pool_name,interruption_type,interruption_reason)( sum_over_time( kubernetes_io:node_pool_interruption_count{monitored_resource="k8s_node_pool", interruption_reason="HW/SW Maintenance", node_pool_name="{nodepool_name}" }[${__interval}]))
    ```

-   **解读**：如果 `kubernetes_io:node_interruption_count` 在 `interruption_reason="HW/SW Maintenance"` 条件下显示大于 0 的值，则表示底层 Compute Engine 虚拟机因计划内主机维护而中断。

### 步骤 3：[低风险] 通过 Cloud Logging 和节点污点进行调查

-   **操作**：调用 `query_logs`，或指导用户筛选其 GKE 日志中的活动主机维护事件，并检查节点污点。
-   **指导**：在 Cloud Logging 中查找 `cloud.google.com/active-node-maintenance` 被设置为 `ONGOING` 的记录。要检查 GKE 是否已封锁即将终止的节点以防止调度新的工作负载，请确认是否存在 `cloud.google.com/impending-node-termination:NoSchedule` 污点（可在 GKE 事件日志中检查，也可直接通过 `kubectl describe node` 检查）。
-   **解读**：
    -   `cloud.google.com/active-node-maintenance` 被设置为 `ONGOING`，表示 GKE 正因主机维护而主动停止工作负载。
    -   `cloud.google.com/impending-node-termination:NoSchedule` 污点表示 GKE 已封锁该节点，以防止将新的 Pod 调度到即将终止的节点上。切勿建议容忍此污点。

### 第 4 步：结论与解决方案

-   **操作**：向用户提供调查结果摘要；如果已确认或已安排主机维护事件，则建议适当的缓解策略。
-   **报告规则**：仅报告信号。报告能够明确表明中断由 Compute Engine 主机维护导致，且具体影响底层 GPU/TPU 节点的高信号信息。不要倾倒原始日志。
-   **负面调查结果排除规则**：如果节点计划维护标签、PromQL 中断计数和当前维护日志均返回负面/空结果，则明确得出结论：中断并非由 Compute Engine 主机维护导致。引导用户调查应用层原因（例如 OOMKill 事件、CUDA 运行时错误或资源限制），并且不要将主机维护缓解措施作为主要解决方案。
-   **强制性工作负载保护三项措施**：每当发现或预计 GPU/TPU 节点将进行主机维护时，应始终同时建议以下三项互补的缓解措施：
    1.  **配置优雅终止**：对于需要时间保存状态的工作负载（例如通过 Orbax 执行检查点保存的机器学习框架），请遵循[启用中断处理](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/handle-disruption-gpu-tpu#enabling-handling)指南，并设置 `spec.terminationGracePeriodSeconds`（最长 60 分钟），以便在节点关闭前处理 `SIGTERM` 信号。
    2.  **启用机会性维护**：要在 GKE 检测到 GPU/TPU 节点空闲时自动触发维护，请配置[机会性维护](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/handle-disruption-gpu-tpu#opportunistic-maintenance)。
    3.  **配置 PodDisruptionBudgets (PDBs)**：确保工作负载使用 `PodDisruptionBudget`，以便在驱逐和中断期间维持 `minAvailable` 个副本。