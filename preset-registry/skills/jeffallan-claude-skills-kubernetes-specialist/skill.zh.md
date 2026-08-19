---
name: kubernetes-specialist
description: Use when deploying or managing Kubernetes workloads. Invoke to create deployment manifests, configure pod security policies, set up service accounts, define network isolation rules, debug pod crashes, analyze resource limits, inspect container logs, or right-size workloads. Use for Helm charts, RBAC policies, NetworkPolicies, storage configuration, performance optimization, GitOps pipelines, and multi-cluster management.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.1"
  domain: infrastructure
  triggers: Kubernetes, K8s, kubectl, Helm, container orchestration, pod deployment, RBAC, NetworkPolicy, Ingress, StatefulSet, Operator, CRD, CustomResourceDefinition, ArgoCD, Flux, GitOps, Istio, Linkerd, service mesh, multi-cluster, cost optimization, VPA, spot instances
  role: specialist
  scope: infrastructure
  output-format: manifests
  related-skills: devops-engineer, cloud-architect, sre-engineer, terraform-engineer, security-reviewer, chaos-engineer
---
# Kubernetes 专家

## 何时使用此技能

- 部署工作负载（Deployments、StatefulSets、DaemonSets、Jobs）
- 配置网络（Services、Ingress、NetworkPolicies）
- 管理配置（ConfigMaps、Secrets、环境变量）
- 设置持久化存储（PV、PVC、StorageClasses）
- 创建用于应用打包的 Helm charts
- 排查集群和工作负载问题
- 实施安全最佳实践

## 核心工作流

1. **分析需求** — 了解工作负载特性、扩缩容需求和安全要求
2. **设计架构** — 选择工作负载类型、网络模式和存储方案
3. **实现清单文件** — 创建声明式 YAML，并正确配置资源限制和健康检查
4. **加固安全** — 应用 RBAC、NetworkPolicies、Pod Security Standards 和最小权限原则
5. **验证** — 运行 `kubectl rollout status`、`kubectl get pods -w` 和 `kubectl describe pod <name>` 以确认健康状态；必要时使用 `kubectl rollout undo` 回滚

## 参考指南

根据上下文加载详细指导：

| 主题 | 参考资料 | 加载时机 |
|-------|-----------|-----------|
| 工作负载 | `references/workloads.md` | Deployments、StatefulSets、DaemonSets、Jobs、CronJobs |
| 网络 | `references/networking.md` | Services、Ingress、NetworkPolicies、DNS |
| 配置 | `references/configuration.md` | ConfigMaps、Secrets、环境变量 |
| 存储 | `references/storage.md` | PV、PVC、StorageClasses、CSI drivers |
| Helm Charts | `references/helm-charts.md` | Chart 结构、values、templates、hooks、测试、仓库 |
| 故障排查 | `references/troubleshooting.md` | kubectl debug、日志、事件、常见问题 |
| 自定义 Operators | `references/custom-operators.md` | CRD、Operator SDK、controller-runtime、协调 |
| Service Mesh | `references/service-mesh.md` | Istio、Linkerd、流量管理、mTLS、金丝雀发布 |
| GitOps | `references/gitops.md` | ArgoCD、Flux、渐进式交付、sealed secrets |
| 成本优化 | `references/cost-optimization.md` | VPA、HPA 调优、spot instances、配额、资源规格优化 |
| 多集群 | `references/multi-cluster.md` | Cluster API、联邦、跨集群网络、灾难恢复 |

## 约束

### 必须执行
- 使用声明式 YAML 清单文件（避免使用命令式 kubectl 命令）
- 为所有容器设置资源 requests 和 limits
- 包含存活和就绪探针
- 对敏感数据使用 secrets（绝不硬编码凭据）
- 应用最小权限的 RBAC 权限
- 实施 NetworkPolicies 以进行网络分段
- 使用 namespaces 实现逻辑隔离
- 一致地为资源添加标签以便组织管理
- 在 annotations 中记录配置决策

### 禁止执行
- 未设置资源 limits 就部署到生产环境
- 将 secrets 存储在 ConfigMaps 或纯环境变量中
- 为应用 Pod 使用默认 ServiceAccount
- 允许不受限制的网络访问（默认允许所有）
- 没有正当理由时以 root 身份运行容器
- 跳过健康检查（存活/就绪探针）
- 对生产镜像使用 latest 标签
- 暴露不必要的端口或服务

## 常见 YAML 模式

### 包含资源限制、探针和安全上下文的部署

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  namespace: my-namespace
  labels:
    app: my-app
    version: "1.2.3"
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
        version: "1.2.3"
    spec:
      serviceAccountName: my-app-sa   # never use default SA
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 2000
      containers:
        - name: my-app
          image: my-registry/my-app:1.2.3   # never use latest
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 15
            periodSeconds: 20
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: ["ALL"]
          envFrom:
            - secretRef:
                name: my-app-secret   # pull credentials from Secret, not ConfigMap
```

### 最小化 RBAC（最小权限原则）

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-app-sa
  namespace: my-namespace
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: my-app-role
  namespace: my-namespace
rules:
  - apiGroups: [""]
    resources: ["configmaps"]
    verbs: ["get", "list"]   # grant only what is needed
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: my-app-rolebinding
  namespace: my-namespace
subjects:
  - kind: ServiceAccount
    name: my-app-sa
    namespace: my-namespace
roleRef:
  kind: Role
  name: my-app-role
  apiGroup: rbac.authorization.k8s.io
```

### NetworkPolicy（默认拒绝 + 显式允许）

```yaml
# Deny all ingress and egress by default
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: my-namespace
spec:
  podSelector: {}
  policyTypes: ["Ingress", "Egress"]
---
# Allow only specific traffic
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-my-app
  namespace: my-namespace
spec:
  podSelector:
    matchLabels:
      app: my-app
  policyTypes: ["Ingress"]
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 8080
```

## 验证命令

部署后，请验证运行状况和安全态势：

```bash
# Watch rollout complete
kubectl rollout status deployment/my-app -n my-namespace

# Stream pod events to catch crash loops or image pull errors
kubectl get pods -n my-namespace -w

# Inspect a specific pod for failures
kubectl describe pod <pod-name> -n my-namespace

# Check container logs
kubectl logs <pod-name> -n my-namespace --previous   # use --previous for crashed containers

# Verify resource usage vs. limits
kubectl top pods -n my-namespace

# Audit RBAC permissions for a service account
kubectl auth can-i --list --as=system:serviceaccount:my-namespace:my-app-sa

# Roll back a failed deployment
kubectl rollout undo deployment/my-app -n my-namespace
```

## 输出模板

在实现 Kubernetes 资源时，请提供：
1. 结构正确的完整 YAML 清单
2. 如有需要，提供 RBAC 配置（ServiceAccount、Role、RoleBinding）
3. 用于网络隔离的 NetworkPolicy
4. 对设计决策和安全考量的简要说明

[文档](https://jeffallan.github.io/claude-skills/skills/infrastructure/kubernetes-specialist/)