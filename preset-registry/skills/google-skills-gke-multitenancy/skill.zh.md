---
name: gke-multitenancy
description: >-
  Plans and configures multi-tenancy on GKE. Covers namespace isolation, RBAC
  planning for teams, resource quotas, LimitRanges, network isolation, and
  cost allocation. Use when designing GKE multi-tenancy, configuring GKE
  namespaces, setting up resource quotas, or isolating GKE teams. Don't use
  for single-tenant cluster configuration or general deployment instructions
  (use gke-basics or gke-app-onboarding instead).
metadata:
  category: Containers
---
# GKE 多租户

本参考资料涵盖 GKE 上的企业多租户模式，包括命名空间隔离、RBAC 规划、资源配额和网络分段。

> **MCP 工具：** `apply_k8s_manifest`、`get_k8s_resource`、`check_k8s_auth`、
> `describe_k8s_resource`、`delete_k8s_resource`

## 何时使用

-   多个团队共享单个 GKE 集群
-   在一个集群中按环境（dev/staging/prod）隔离工作负载
-   实施最小权限访问控制
-   在团队或项目之间分摊成本

## 多租户模型

| 模型                          | 隔离性       | 复杂度 | 成本           |
| ----------------------------- | ------------ | ---------- | -------------- |
| **每团队一个命名空间**        | 软隔离（RBAC + | 低       | 最低（共享     |
:                               : 网络         :            : 集群）         :
:                               : 策略）       :            :                :
| **每环境一个命名空间**        | 软隔离       | 低       | 低             |
| **每团队一个节点池**          | 中等         | 中等     | 中等           |
:                               : （专用       :            :                :
:                               : 计算资源）   :            :                :
| **每团队一个集群**            | 硬隔离（完全 | 高       | 最高           |
:                               : 隔离）       :            :                :

> **黄金路径建议**：从每团队一个命名空间开始，以提高成本效率。仅在合规性要求时升级到更强的隔离级别。

## 命名空间隔离设置

### 1. 创建命名空间

```bash
kubectl create namespace team-a
kubectl create namespace team-b
kubectl label namespace team-a team=a
kubectl label namespace team-b team=b
```

### 2. RBAC 配置

**原则**：为每个命名空间授予最小权限。切勿绑定到
`system:authenticated`。

```yaml
# Namespace-scoped role for a team
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: team-a-developer
  namespace: team-a
rules:
- apiGroups: ["", "apps", "batch"]
  resources: ["pods", "deployments", "services", "configmaps", "jobs"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: team-a-developers
  namespace: team-a
subjects:
- kind: Group
  name: "team-a@example.com"  # Google Group
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: team-a-developer
  apiGroup: rbac.authorization.k8s.io
```

**RBAC 最佳实践：** 使用 Google Groups 进行主体绑定。优先使用命名空间作用域的 Role，而不是 ClusterRole。有关完整的 RBAC 加固指南，请参阅 `gke-platform-security` skill。

### 3. 资源配额

防止任何单个团队消耗全部集群资源：

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: team-a-quota
  namespace: team-a
spec:
  hard:
    requests.cpu: "10"
    requests.memory: "20Gi"
    limits.cpu: "20"
    limits.memory: "40Gi"
    pods: "50"
    services: "10"
    persistentvolumeclaims: "10"
```

### 4. LimitRange

为每个容器设置默认和最大资源约束：

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: team-a-limits
  namespace: team-a
spec:
  limits:
  - type: Container
    default:
      cpu: "500m"
      memory: "512Mi"
    defaultRequest:
      cpu: "100m"
      memory: "128Mi"
    max:
      cpu: "4"
      memory: "8Gi"
```

> [!IMPORTANT] **必须设置默认值**：在 `LimitRange` 中定义 `min` 或 `max` 限制时，
> **必须**同时定义对应的 `default` 和 `defaultRequest` 值。如果设置了 `min` 或
> `max`，却未设置默认值，则任何未明确指定资源请求/限制的 Pod 都会被准入控制器
> 拒绝。

### 5. 网络隔离

按命名空间应用默认拒绝策略（请参阅 `gke-workload-security` Skill），然后
允许团队内部流量：

```yaml
# Allow same-namespace pods to talk + DNS
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-same-namespace
  namespace: team-a
spec:
  podSelector: {}
  ingress:
  - from:
    - podSelector: {}
  egress:
  - to:
    - podSelector: {}
  - to:  # Allow DNS
    - namespaceSelector: {}
      podSelector:
        matchLabels:
          k8s-app: kube-dns
    ports:
    - protocol: UDP
      port: 53
```

## 费用分摊

### 用于费用归属的标签

```bash
# Label namespaces for billing
kubectl label namespace team-a cost-center=engineering
kubectl label namespace team-b cost-center=data-science
```

### GKE 费用分摊

启用 GKE 费用分摊，以便按命名空间和标签细分费用：

```bash
gcloud container clusters update <CLUSTER_NAME> --region <REGION> \
  --enable-cost-allocation
```

可在 Cloud Billing > GKE Cost Allocation 中查看。