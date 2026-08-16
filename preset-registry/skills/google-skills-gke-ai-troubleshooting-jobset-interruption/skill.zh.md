---
name: gke-ai-troubleshooting-jobset-interruption
metadata:
  category: Containers
description: >-
  Diagnoses GKE JobSet interruptions, restarts, and preemptions for AI/ML training workloads autonomously.
  Use when troubleshooting JobSet restart loops, spot VM preemptions, node readiness failures, host VM issues, or coordinator worker crashes.
  Don't use for general GKE cluster creation, basic workload deployment, or non-JobSet application issues.
---
# GKE JobSet 中断故障排查

使用此技能系统地诊断并解决托管大规模 AI/ML 工作负载的 GKE 集群上的 JobSet 中断、重启和抢占问题。

## ⚠️ 前提条件与沙箱规则

-   必须在集群的 `kube-state-metrics` 中启用 JobSet 指标包。
-   必须为 Google Cloud 项目启用 Cloud Logging 和 Cloud Monitoring。
-   **自主执行与沙箱执行规则**：如果 API 查询、工具或命令遇到
    `403 Permission Denied`、身份验证错误或网络隔离，**请勿进入身份验证或凭据故障排查循环**。
    使用已获取的变量填充查询模板
    (`{project_id}`, `{cluster_name}`, `{workload_name}`, `{start_time}`,
    `{end_time}`)，检查任何可用的本地暂存遥测数据或模拟数据文件，并自主完成诊断工作流和解决建议。

## 🔍 诊断工作流

### 步骤 0：获取上下文并定义时间窗口

使用工具、工作区文件、环境详细信息或用户提示中的上下文，自主收集以下信息：

-   **项目 ID** (`{project_id}`)
-   **集群名称** (`{cluster_name}`)
-   **工作负载名称（JobSet 名称）** (`{workload_name}`)
-   **工作负载命名空间** (`{namespace}`)
-   **问题发生时间** (`{issue_time}`)

如果用户未明确提供特定变量，请检查集群资源或日志以确定这些变量，或者使用提供的 `{variable}` 占位符。

#### 时间处理规则

1.  **自主确定时间窗口**：如果提供的是相对时间（例如“X 分钟前”），或者没有提供确切时间戳，请基于当前时间或可用的日志时间戳计算查询窗口。
2.  **窗口计算**：如果 `{issue_time}` 时间戳可用（或计算为 `T`），则设置 `{start_time}` = `T - 30m`，并设置 `{end_time}` = `T +
    30m`。

--------------------------------------------------------------------------------

### 步骤 1：识别 JobSet 重启和尝试次数 [低风险]

验证 JobSet 是否正在经历重启循环，并确定重启频率。

#### 可视化图表 / MQL 查询 - 重启

-   **MQL 查询规范**：

    ```mql
    fetch prometheus_target
    | metric 'prometheus.googleapis.com/kube_jobset_restarts/gauge'
    | filter resource.cluster_name == '{cluster_name}' && metric.jobset_name == '{workload_name}'
    | align next_older(1m)
    | every 1m
    | group_by [metric.jobset_name], [val: max(value)]
    ```

#### PromQL 指标查询 - 重启

-   **PromQL 查询规范**：

    ```promql
    kube_jobset_restarts{jobset_name="{workload_name}", cluster="{cluster_name}"}
    ```

-   **诊断逻辑**：重启值非零或持续增加，表示 JobSet 控制器正在因工作节点故障或中断而主动重启 JobSet。

-   **自动化**：报告发现后自动继续执行步骤 2。

--------------------------------------------------------------------------------

### 步骤 2：检查节点池中断 [低风险]

确定 JobSet 重启是否由物理节点池级别的事件触发（例如 Spot 抢占、维护或主机终止）。

#### A. 指标查询（节点池中断次数）

##### 可视化图表 / MQL 查询 - 中断

-   **MQL 查询规范**：

    ```mql
    fetch k8s_node_pool
    | metric 'kubernetes.io/node_pool/interruption_count'
    | filter cluster_name == '{cluster_name}'
    | align next_older(10m)
    | every 10m
    | group_by [metric.interruption_type, metric.interruption_reason, metadata.system.node_pool_name], [val: sum(value)]
    ```

##### PromQL 查询 - 中断

-   **PromQL 查询规范**：

    ```promql
    sum by (interruption_type, interruption_reason, node_pool_name, cluster_name) (
      avg_over_time(kubernetes_io:node_pool_interruption_count{cluster_name="{cluster_name}"}[10m])
    )
    ```

#### B. 日志查询（节点池生命周期事件）

-   **LQL 日志过滤器规范**：

    ```sql
    resource.type="gke_nodepool"
    AND resource.labels.cluster_name="{cluster_name}"
    AND timestamp >= "{start_time}"
    AND timestamp <= "{end_time}"
    ```

-   **诊断逻辑**：

    -   **PreemptionEvent**：Spot VM 被抢占，或节点被缩容。
    -   **MaintenanceEvent**：节点池已更新，或 Google 安排了维护。
    -   **TerminationEvent**：严重的主机故障。检查 `interruption_reason`
        或日志中是否存在主机问题。
    -   有关节点终止日志和抢占事件的示例，请参阅[故障特征](references/failure_signatures.md)。

-   **自动化**：自动继续执行步骤 3。

--------------------------------------------------------------------------------

### 步骤 3：检查节点及其底层主机 VM [低风险]

将节点就绪失败与物理主机 VM 关联起来，以确定是否有单个故障主机反复导致协调器 Pod 失败。

#### A. 指标查询（节点就绪状态检查）

##### 可视化图表 / MQL 查询 - 节点状态

-   **MQL 查询规范**：

    ```mql
    fetch k8s_node
    | metric 'kubernetes.io/node/status_condition'
    | filter cluster_name == '{cluster_name}' && metric.condition == 'Ready' && metric.status == 'False'
    | align next_older(1m)
    | every 1m
    | group_by [node_name, metadata.user.gke_nodepool], [val: max(value)]
    ```

##### PromQL 查询 - 节点状态

-   **PromQL 查询规范**：

    ```promql
    sum by (status, condition, node_pool_name) (
      kubernetes_io:node_status_condition{cluster_name="{cluster_name}", condition="Ready", status="False"}
    )
    ```

#### B. 指标查询（节点到主机的元数据拓扑关联）

-   **MQL 查询规范**：

    ```mql
    fetch k8s_node
    | metric 'kubernetes.io/node/cpu/total_cores'
    | filter cluster_name == '{cluster_name}'
    | align next_older(1m)
    | every 1m
    | group_by [node_name, metadata.user.gce_topology_host, metadata.user.gke_nodepool], [val: max(value)]
    ```

#### C. 日志查询（节点故障日志）

-   **LQL 日志过滤器规范**：

    ```sql
    resource.type="k8s_node"
    AND resource.labels.cluster_name="{cluster_name}"
    AND (textPayload:"host error" OR textPayload:"kernel panic" OR textPayload:"hardware failure" OR textPayload:"NodeNotReady")
    AND timestamp >= "{start_time}"
    AND timestamp <= "{end_time}"
    ```

-   **诊断逻辑**：识别特定节点是否处于不健康状态
    （`Ready=False` 或 `Unknown`），并通过 `metadata.user.gce_topology_host`
    将它们与对应的 GCE 物理主机 ID 关联起来。检查同一主机是否
    反复发生故障。

-   **自动化**：自动继续执行步骤 4。

--------------------------------------------------------------------------------

### 步骤 4：检查 Pod 和工作进程/容器故障 [低风险]

分析 Pod 状态阶段并检索协调器工作进程日志，以识别
应用级崩溃或网络死锁。

> **必需执行顺序**：在检查特定工作进程容器日志（C 节）之前，
> 你必须分析 Pod 状态阶段（A 节）和不可调度 Pod 指标（B 节），
> 以评估工作负载的整体健康状况。

#### A. 指标查询（Pod 生命周期阶段）

##### 可视化图表/MQL 查询 - Pod 阶段

-   **MQL 查询规范**：

    ```mql
    fetch k8s_pod
    | metric 'kubernetes.io/pod/status/phase'
    | filter cluster_name == '{cluster_name}' && pod_name ==~ '{workload_name}.*'
    | align next_older(10m)
    | every 10m
    | group_by [metric.phase], [val: count()]
    ```

##### PromQL 查询 - Pod 阶段

-   **PromQL 查询规范**：

    ```promql
    sum by (phase) (
      avg_over_time(kube_pod_status_phase{cluster="{cluster_name}", pod=~"{workload_name}.*"}[10m])
    )
    ```

#### B. 指标查询（不可调度 Pod 数量）

-   **MQL 查询规范**：

    ```mql
    fetch k8s_pod
    | metric 'kubernetes.io/pod/status/unschedulable'
    | filter cluster_name == '{cluster_name}' && pod_name ==~ '{workload_name}.*'
    | align next_older(10m)
    | every 10m
    | group_by [pod_name], [val: max(value)]
    ```

#### C. 日志查询（工作进程容器日志）

-   **LQL 日志过滤器规范**：

    ```sql
    resource.type="k8s_container"
    AND resource.labels.cluster_name="{cluster_name}"
    AND labels."k8s-pod/jobset_sigs_k8s_io/jobset-name"="{workload_name}"
    AND timestamp >= "{start_time}"
    AND timestamp <= "{end_time}"
    ```

-   **诊断逻辑**：

    1.  检查 Pod 时间线，找出待处理或不可调度的 Pod。
    2.  使用工作进程容器日志分析分片 0 中的工作进程 0（协调器），
        检查 NCCL 超时、集合通信问题或 MegaScale 卡死。

-   **自动化**：继续执行解决方案。

--------------------------------------------------------------------------------

## 🛠️ 解决工作流

### 解决方案 1：抢占与自动扩缩优化 [低风险]

如果步骤 2 显示 Spot VM 上的抢占次数较多：

-   **操作**：建议将关键的长时间运行训练工作负载切换到
    **GKE 预留/按需 VM**，或使用**紧凑布置政策**
    以最大限度地减少碎片整理导致的中断。
-   **理由**：消除现货市场抢占并减少训练重启。

### 解决方案 2：隔离故障宿主机 VM [高风险]

如果步骤 3 识别出某个特定宿主机 ID（`gce-topology-host`），并且该宿主机在多次尝试中持续发生故障或触发重启：

-   **操作**：建议封锁并排空 GKE 节点，删除底层 GCE VM 实例以触发实例重新创建，并向 Google Cloud 支持团队提交支持工单，同时注明物理宿主机 ID。
-   **理由**：GKE 自动修复会在健康的物理硬件上重新创建 VM 实例，从而避免无限重启循环。

--------------------------------------------------------------------------------

## 📋 复制粘贴检查清单

-   [ ] 收集上下文，并计算 `{start_time}`（`{issue_time} - 30m`）和
    `{end_time}`（`{issue_time} + 30m`）时间窗口。
-   [ ] 查询 JobSet 重启尝试。
-   [ ] 检查 Nodepool 中断（Spot 抢占与硬件终止）。
-   [ ] 查询节点到宿主机的映射，并检查节点日志中是否存在物理宿主机错误。
-   [ ] 检查 Pod 时间线状态和协调器工作容器日志。
-   [ ] 建议适当的调度策略（On-demand 与 Spot）或隔离宿主机 VM。