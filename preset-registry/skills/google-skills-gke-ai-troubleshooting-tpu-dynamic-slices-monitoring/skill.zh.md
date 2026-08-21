---
name: gke-ai-troubleshooting-tpu-dynamic-slices-monitoring
description: >-
  Monitors, troubleshoots, and manages GKE TPU Dynamic Slices custom resources. Use when checking TPU slice lifecycle states, troubleshooting slice provisioning failures, validating single-slice or multi-slice (JobSet) workload manifests, or safely patching stuck finalizers and disabling the slice controller. Don't use for generic GKE cluster node pool creation or standard non-TPU workload management (use gke-basics or gke-cluster-creation instead).
metadata:
  category: Containers
---
# GKE TPU 动态 Slice 监控与管理

监控 TPU Slice 自定义资源的状态、排查预配失败问题、验证动态 Slice 上的工作负载清单，并执行清理操作。

## 前提条件

-   已为项目启用 Cloud Logging。
-   已配置 `kubectl` 和 `gcloud` CLI，以便访问 GKE 集群。

## 诊断工作流

### 步骤 0：获取上下文并定义时间窗口

使用集群工具或以下参数收集项目、集群和 Slice 的上下文：

-   **项目 ID**：`{project_id}`（例如 `my-gcp-project`）
-   **集群名称**：`{cluster_name}`（例如 `tpu-cluster`）
-   **区域/可用区**：`{location}`（例如 `us-central1-a`）
-   **Slice 名称**：`{slice_name}`（例如 `test-slice`）
-   **问题发生时间**：`{timestamp}`（可选；默认为最近 30 分钟的时间窗口，即从 `[T - 30m]` 到 `[T + 30m]`）

--------------------------------------------------------------------------------

### 步骤 1：描述 Slice 自定义资源 [低风险]

当被要求检查、排查或确认 Slice 状态时，立即使用可用的集群工具执行 `kubectl describe slice {slice_name}` 进行检查。根据下方的条件表解析生成的 `Status.Conditions` 输出，以诊断确切状态并提供具体建议。

-   **命令**：

    ```bash
    kubectl describe slice {slice_name}
    ```

#### 状态与原因分析

分析 `Status.Conditions`（尤其是 `Type: Ready` 及其 `Reason` 和 `Status`）：

| 生命周期状态/原因 | 含义 | 建议操作 |
| :--- | :--- | :--- |
| **`SliceNotCreated`** | GKE Slice Controller 正在初始化 Slice 并执行资源检查。 | 等待几分钟，然后重新检查 Slice 状态。 |
| **`SliceCreationFailed`** | 前提条件验证失败（例如，所选节点不存在、节点已被另一个 Slice 使用，或者拓扑与分区数量不匹配）。 | 验证所选节点是否存在、尚未分配，并确认拓扑与分区数量匹配。 |
| **`ACTIVATING`** | GKE 正在主动组建和预配 TPU Slice。 | 监控节点预配情况。 |
| **`ACTIVE`** | TPU Slice 已成功组建，并已准备好承载工作负载。 | 继续部署或检查工作负载。 |
| **`ACTIVE_DEGRADED`** | Slice 可用，但一个或多个子块处于降级状态。 | 监控工作负载日志中的互连或设备错误。检查故障节点虚拟机。 |
| **`FAILED`** | GKE 无法组建 TPU Slice（例如，所选节点不属于同一个预留块）。 | 确保所有选定节点都属于同一个预留块。 |
| **`DEACTIVATING`** | Slice 正在拆解（由用户删除或严重的系统性故障触发）。 | 等待拆解完成；如果卡住，则修补 finalizer。 |
| **`INCOMPLETE`** | Slice CR 从集群中删除前的终止阶段。 | 无需操作；该资源很快会被移除。 |

#### 预配失败排查清单

在排查切片创建或配置失败（`SliceCreationFailed` 或 `FAILED`）时，请执行以下验证步骤：

1. **节点存在性与分配检查**：验证所选 TPU 节点是否存在于集群中，以及是否已分配给其他切片（`kubectl get nodes -l cloud.google.com/gke-tpu-slice`、`kubectl get slice -A`）。
2. **拓扑对齐**：确认分区数量与请求的拓扑维度相匹配（例如，拓扑 `2x2` 需要 4 个节点）。
3. **预留块对齐检查**：确认所有选定的 TPU 节点都属于同一预留和预留块。

--------------------------------------------------------------------------------

### 第 2 步：验证工作负载规范 [低风险]

确保正确配置工作负载清单，使其以动态切片为目标。

#### 1. 单切片工作负载要求

检查 Pod 模板是否包含以下注解和选择器：

-   **注解**：
    -   `cloud.google.com/gke-tpu-slice-topology: "{topology}"`（例如，
        `"4x4x4"`）
-   **NodeSelector**：
    -   `cloud.google.com/gke-tpu-topology: "{topology}"`（例如，`"4x4x4"`）
    -   `cloud.google.com/gke-tpu-accelerator: "{accelerator_type}"`（例如，
        `"tpu7x"`）
    -   `cloud.google.com/gke-tpu-slice: "{slice_name}"`（例如，`"test-slice"`）

#### 2. 多切片（JobSet）工作负载要求

如果部署多切片 JobSet，请验证：

-   **JobSet 注解**：
    -   `alpha.jobset.sigs.k8s.io/exclusive-topology:
        cloud.google.com/gke-tpu-slice`
-   **Pod 模板注解**：
    -   `cloud.google.com/gke-tpu-slice-topology: "{topology}"`
-   **Pod 模板 NodeSelector**：
    -   `cloud.google.com/gke-tpu-topology: "{topology}"`
    -   `cloud.google.com/gke-tpu-accelerator: "{accelerator_type}"`
    -   *注意：请勿在 nodeSelector 中手动指定 `cloud.google.com/gke-tpu-slice`；
        JobSet 会自动处理切片分配。*

--------------------------------------------------------------------------------

## 解决与管理工作流

### 解决方案 1：强制删除卡住的切片 [高风险]

如果切片卡在 `DEACTIVATING` 状态，或者由于终结器卡住而导致删除操作无限期挂起：

1. **确定原因**：说明切片资源上的终结器（`metadata.finalizers`）正在阻止 Kubernetes 完成资源删除。
2. **提出解决方案**：建议使用 JSON 补丁操作从元数据路径（`/metadata/finalizers`）中移除终结器：

    ```bash
    kubectl patch slice {slice_name} --type json -p='[{"op": "remove", "path": "/metadata/finalizers"}]'
    ```

3. **提供警告**：明确警告用户，移除终结器会绕过控制器的标准拆除流程，并可能导致底层 VM、网络或加速器资源未被清理或成为孤立资源。
4. **关键安全要求**：响应中必须明确请求用户确认（例如，*"通过 JSON 补丁移除 `/metadata/finalizers` 上的终结器是一项高风险操作，可能会留下孤立资源。您是否确认要将此补丁应用于切片 `{slice_name}`？"*），并在应用或执行补丁之前暂停操作，等待用户确认。

--------------------------------------------------------------------------------

### 解决方案 2：禁用并清理 Slice Controller [高风险]

如果需要禁用动态切片：

1.  **检查现有 Slice**：

    ```bash
    kubectl get slice -A
    ```

    在禁用控制器之前，确保已删除所有 Slice。

2.  **通过 gcloud 禁用 Slice Controller**：

    ```bash
    gcloud container clusters update {cluster_name} \
        --location={location} \
        --no-enable-slice-controller
    ```

3.  **删除 Slice CRD**：

    ```bash
    kubectl delete crd slices.accelerator.gke.io
    ```

4.  **清理节点标签**：从集群中的所有节点移除 GKE TPU Slice 标签：

    ```bash
    kubectl label nodes --all cloud.google.com/gke-tpu-slice- cloud.google.com/gke-tpu-slice-topology-
    ```

-   **安全规则**：提供确切的命令，并在执行禁用操作或破坏性清理步骤之前进行确认。