---
name: gke-workload-scaling
description: >-
  Manages scaling for GKE workloads using HPA and VPA. Use when configuring
  Horizontal Pod Autoscaler (HPA), configuring Vertical Pod Autoscaler (VPA),
  or applying best practices for GKE workload autoscaling. Do not use for
  cluster-level autoscaling (Cluster Autoscaler), static cluster sizing,
  or configuring node-level machine styles directly.
metadata:
  category: Containers
---
# GKE 工作负载扩缩容

此技能提供在 Google Kubernetes Engine (GKE) 上对应用程序进行扩缩容的工作流和最佳实践。涵盖手动扩缩容、水平 Pod 自动扩缩容 (HPA) 和垂直 Pod 自动扩缩容 (VPA)。

## 工作流

### 1. 手动扩缩容

将 Deployment 扩缩容到固定的副本数量。适用于需要立即进行手动干预或测试的场景。

**命令：**

```bash
kubectl scale deployment {deployment_name} --replicas={number} -n {namespace}

# Verify the scale event
kubectl get deployment {deployment_name} -n {namespace}
```

### 2. 水平 Pod 自动扩缩容 (HPA)

根据观测到的 CPU 利用率、内存利用率或自定义指标，自动调整 Pod 数量。

**前提条件：**

-   Metrics Server 必须正在运行（GKE 默认启用）。
-   容器需要明确定义资源请求和限制。

**快速命令：**

```bash
kubectl autoscale deployment {deployment_name} --cpu-percent=50 --min=1 --max=10
```

**清单方式（推荐）：** 使用 YAML 清单进行版本控制的配置。有关模板，请参阅 [assets/hpa-example.yaml](assets/hpa-example.yaml)。

```bash
kubectl apply -f assets/hpa-example.yaml

# Verify HPA is created and fetching metrics
kubectl get hpa
```

**自定义指标和外部指标：** 对于 GKE，基于 Cloud Monitoring 指标（例如 Pub/Sub 队列长度）进行扩缩容的现代推荐方式是使用 **External** 指标类型。GKE 控制平面原生支持该类型，无需 Custom Metrics Adapter。对于通过 Prometheus 公开的应用程序特定指标，可以使用 **Google Cloud Managed Service for Prometheus** 或 Prometheus Adapter。

### 3. 垂直 Pod 自动扩缩容 (VPA)

自动调整 Pod 的 CPU 和内存预留，使其与实际使用量相匹配。这对于合理调整工作负载的资源规格至关重要。

**前提条件：**

-   必须在集群上启用 VPA。
    -   **Autopilot：** 默认启用。
    -   **Standard：** 必须手动启用。

**在 Standard 集群上启用 VPA：**

```bash
gcloud container clusters update {cluster_name} --enable-vertical-pod-autoscaling --zone {zone}
```

**更新模式：**

-   `Off`：计算建议值，但不应用。适合进行“试运行”分析。
-   `Initial`：仅在创建 Pod 时分配资源。
-   `Auto`：如果建议值与请求值存在显著差异，则通过重启正在运行的 Pod 来更新资源。
-   `InPlaceOrRecreate`：尝试在不重新创建 Pod 的情况下更新 Pod 资源。如果无法进行原地更新，则回退到 `Auto` 模式（需要 GKE 1.34+）。

**示例：** 有关配置模板，请参阅 [assets/vpa-example.yaml](assets/vpa-example.yaml)。

## 最佳实践

1.  **定义资源请求：** HPA 和 VPA 依赖准确的资源请求。请始终在容器规范中定义资源请求。
2.  **避免指标冲突：** 不要将 HPA 和 VPA 配置为使用同一指标（例如，两者都使用 CPU）。这会导致反复波动。
    -   *典型模式：* HPA 基于 CPU，VPA 基于内存。
3.  **Pod 中断预算 (PDB)：** 定义 PDB，以确保在扩缩容事件或节点升级期间应用程序的可用性。
4.  **HPA 延迟：** HPA 具有稳定窗口（默认为 5 分钟），以防止快速波动。
5.  **VPA “Auto” 模式的风险：** 在 “Auto” 模式下，VPA 会重启 Pod 以更改资源。请确保应用程序能够妥善处理重启（例如，能够处理 SIGTERM）。
    -   *注意：* 默认情况下，VPA 至少需要 2 个副本才能执行驱逐操作（以防止唯一正在运行的副本被驱逐而导致停机）。在 GKE 1.22+ 中，可以通过在 `PodUpdatePolicy` 中设置 `minReplicas` 来覆盖此行为。

## 资源合理配置工作流

1.  以 `Off` 模式部署 VPA，并运行 24 小时以上
2.  查看建议：`kubectl describe vpa {deployment_name}-vpa -n
    {namespace}`
3.  将 `target` 值与当前 `requests` 进行比较
4.  应用 20% 的缓冲：`new_request = target * 1.2`
5.  使用补丁格式或更新部署清单，以应用新的资源
    请求

条件                          | 建议                                 | 风险
----------------------------- | ------------------------------------ | ------
CPU 请求量 > P95 实际用量的 5 倍    | 降低至 `P95 * 1.2`                   | 中
内存请求量 > P95 实际用量的 3 倍   | 降低至 `P95 * 1.2`                   | 中
CPU 请求量 > P95 实际用量的 2 倍    | 进行资源合理配置，并保留 20% 的缓冲        | 低
未设置资源限制                     | 添加限制以防止嘈杂邻居问题                  | 低