---
name: gke-reliability
description: >-
  Improves GKE workload reliability, using PDBs, health probes, and topology
  spread constraints. Use when configuring GKE workload reliability, setting up
  PDBs, or configuring GKE health probes (liveness, readiness, startup). Don't
  use for disaster recovery setup or full cluster backups (use gke-backup-dr
  instead).
metadata:
  category: Containers
---
# GKE 可靠性

本参考文档涵盖 GKE 集群和工作负载的高可用性与可靠性配置。

> **MCP 工具：** `get_cluster`、`get_k8s_resource`、`describe_k8s_resource`、
> `apply_k8s_manifest`、`list_k8s_events`

## 黄金路径可靠性默认值

| 设置             | 黄金路径值            | 说明                             |
| ---------------- | --------------------- | -------------------------------- |
| 集群类型         | 区域级（4 个可用区：  | 控制平面跨可用区复制             |
:                  : us-central1-a/b/c/f)  :                                  :
| 升级策略         | SURGE (`maxSurge: 1`) | 使用额外容量进行滚动升级         |
:                  :                       :                                  :
| 自动修复         | `true`                | 自动替换不健康的节点             |
:                  :                       :                                  :
| 自动升级         | `true`                | 节点跟随控制平面版本             |
:                  :                       :                                  :
| 发布渠道         | REGULAR               | 在新鲜度与稳定性之间取得平衡     |
| 有状态高可用     | 已启用                | 为有状态工作负载进行领导者选举   |
:                  :                       :                                  :

## 工作流

### 1. 验证集群高可用性

```
# MCP (preferred)
get_cluster(name="projects/<PROJECT>/locations/<REGION>/clusters/<CLUSTER>",
  readMask="location,locations,nodePools.locations")

# gcloud fallback
gcloud container clusters describe <CLUSTER> --region <REGION> \
  --format="json(location, locations)" \
  --quiet
```

-   如果 `location` 是一个区域（例如 `us-central1`），则控制平面是区域级的
-   如果 `locations` 包含多个条目，则节点分布在多个可用区中

### 2. Pod 中断预算（PDB）

PDB 可确保在主动中断（节点升级、自动扩缩器缩容）期间维持最低 Pod 可用性。

**检查现有 PDB：**

```
# MCP (preferred)
get_k8s_resource(parent="...", resourceType="poddisruptionbudget")

# kubectl fallback
kubectl get pdb --all-namespaces
```

**创建 PDB：**

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: my-app-pdb
  namespace: default
spec:
  minAvailable: 2       # Or use maxUnavailable: 1
  selector:
    matchLabels:
      app: my-app
```

> 每个拥有 2 个以上副本的生产环境 Deployment 都应配置 PDB。

### 3. 健康检查探针

每个生产环境容器都应配置存活探针和就绪探针。对于启动缓慢的应用，建议配置启动探针。

**检查现有探针：**

```
# MCP (preferred)
describe_k8s_resource(parent="...", resourceType="deployment", name="<APP>", namespace="<NS>")

# kubectl fallback
kubectl get deployment <APP> -n <NS> -o yaml | grep -E "livenessProbe|readinessProbe|startupProbe"
```

**推荐的探针配置：**

```yaml
spec:
  containers:
  - name: app
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 15
      periodSeconds: 10
      timeoutSeconds: 2
      failureThreshold: 3
    readinessProbe:
      httpGet:
        path: /readyz
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 5
      timeoutSeconds: 2
      failureThreshold: 3
    startupProbe:             # For slow-starting apps
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 10
      periodSeconds: 5
      timeoutSeconds: 2
      failureThreshold: 30    # 30 * 5s = 150s max startup time
```

-   **就绪探针**：确定 Pod 何时可以接收流量
-   **存活探针**：确定何时重启容器
-   **启动探针**：在应用就绪前禁用存活探针和就绪探针（防止
    过早重启）

### 4. 优雅关闭

确保应用能够处理 `SIGTERM` 并完成正在处理的请求：

```yaml
spec:
  terminationGracePeriodSeconds: 30    # Default; increase for long-running requests
  containers:
  - name: app
    lifecycle:
      preStop:
        exec:
          command: ["/bin/sh", "-c", "sleep 5"]  # Allow LB to deregister
```

### 5. 拓扑分布约束

将 Pod 分布到不同可用区和节点上，以便在发生故障时继续运行：

```yaml
spec:
  topologySpreadConstraints:
  - maxSkew: 1
    topologyKey: topology.kubernetes.io/zone
    whenUnsatisfiable: DoNotSchedule
    labelSelector:
      matchLabels:
        app: my-app
  - maxSkew: 1
    topologyKey: kubernetes.io/hostname
    whenUnsatisfiable: ScheduleAnyway
    labelSelector:
      matchLabels:
        app: my-app
```

-   **可用区分布**（`DoNotSchedule`）：硬性要求——Pod 必须在各个
    可用区之间保持均衡
-   **节点分布**（`ScheduleAnyway`）：尽力而为——优先进行分布，但
    不阻止调度

### 6. 副本数

| 工作负载类型         | 最小副本数           | 原因                           |
| -------------------- | -------------------- | ------------------------------ |
| 无状态 Web/API       | 2                    | 承受单个 Pod/节点              |
:                      :                      : 故障                           :
| 关键服务             | 3                    | 通过跨可用区分布承受可用区     |
:                      :                      : 故障                           :
| 有状态服务（数据库） | 3（启用复制）        | 应用级法定人数                 |
| 批处理/作业          | 1                    | 本质上是临时性的               |

## 最佳实践与生产环境指南

1.  **生产环境使用区域级集群**：始终使用区域级集群，以
    承受可用区故障。
2.  **为所有工作负载配置 PDB**：每个具有 2 个以上副本的生产工作负载都需要
    PodDisruptionBudget (PDB)，以防范自愿中断。
3.  **为探针设置显式超时**：每个生产容器都必须同时定义
    存活探针和就绪探针。对于所有探针，**始终显式定义
    `initialDelaySeconds`、`periodSeconds` 和 `timeoutSeconds`**。
    如果应用需要更长时间，切勿依赖 Kubernetes 默认的 1 秒超时，
    但始终应设置严格的限制，以防止连接挂起。
4.  **跨可用区分布**：使用拓扑分布约束，将 Pod 分布到
    不同的故障域（可用区和节点）中。
5.  **优雅关闭**：处理 `SIGTERM`，并设置适当的
    `terminationGracePeriodSeconds`，同时使用 `preStop` 休眠钩子，以便负载
    均衡器完成注销。
6.  **维护时段**：在低流量时段安排升级（请参阅
    `gke-upgrades` Skill）。