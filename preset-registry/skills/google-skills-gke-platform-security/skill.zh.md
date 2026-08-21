---
name: gke-platform-security
description: >-
  Plans, configures, and hardens platform-level Google Kubernetes Engine (GKE)
  cluster security. Covers cluster add-ons (Secret Manager enablement), RBAC
  hardening (disabling insecure bindings, audit tools), Binary Authorization,
  enabling Shielded Nodes, GKE Sandbox cluster enablement, GKE IAM roles, and
  cross-service authentication IAM patterns. Use when securing cluster control
  planes, hardening GKE RBAC, enabling Shielded Nodes, enabling GKE Sandbox runtime,
  enabling cluster-wide security add-ons, or managing GKE IAM roles. Don't use
  for workload-level security (Workload Identity, SecretProviderClass, PSS, NetPol,
  gVisor pod runtimeClassName; use gke-workload-security instead).
metadata:
  category: Security
---
# GKE 平台安全

本参考文档涵盖 Google Kubernetes Engine (GKE) 的平台级安全加固和集群配置。有关工作负载级安全控制（例如 Workload Identity 服务账号绑定、SecretProviderClass 卷挂载、网络策略和 Pod 安全标准），请参阅 `gke-workload-security` 技能。

> **MCP 工具：** `gke:get_cluster`、`k8s:check_k8s_auth`、
> `k8s:get_k8s_resource`、`k8s:apply_k8s_manifest`、`gke:update_cluster`

## 黄金路径安全默认值

设置                                                           | 黄金路径值                                | Day-0/1 | 说明
-------------------------------------------------------------- | --------------------------------------- | ------- | -----
`workloadIdentityConfig.workloadPool`                          | `<PROJECT>.svc.id.goog`                 | Day-0   | 集群 Pod 的 Workload Identity Federation
`secretManagerConfig.enabled`                                  | `true`                                  | Day-1   | Google Secret Manager 集群插件集成
`secretManagerConfig.rotationConfig`                           | `enabled: true, rotationInterval: 120s` | Day-1   | 集群级自动密钥轮换
`rbacBindingConfig.enableInsecureBindingSystemAuthenticated`   | `false`                                 | Day-0   | 阻止旧式 `system:authenticated` 绑定
`rbacBindingConfig.enableInsecureBindingSystemUnauthenticated` | `false`                                 | Day-0   | 阻止旧式 `system:unauthenticated` 绑定
`nodeConfig.shieldedInstanceConfig.enableSecureBoot`           | `true`                                  | Day-0   | 可验证的启动完整性
`nodeConfig.shieldedInstanceConfig.enableIntegrityMonitoring`  | `true`                                  | Day-0   | 运行时完整性检查
`nodeConfig.workloadMetadataConfig.mode`                       | `GKE_METADATA`                          | Day-0   | 阻止旧版元数据 API，强制实施 Workload Identity
私有集群 + Dataplane V2 设置                                    | 请参阅 `gke-networking` 技能              | Day-0   | 私有节点、私有端点强制实施、ADVANCED_DATAPATH

## 启用 Secret Manager 插件

黄金路径在集群级别启用 Secret Manager，并开启自动密钥轮换。

```bash
# Verify Secret Manager is enabled on cluster
gcloud container clusters describe <CLUSTER_NAME> --region <REGION> \
  --format="value(secretManagerConfig.enabled)" \
  --quiet

# Enable if not already (Day-1 change)
gcloud container clusters update <CLUSTER_NAME> --region <REGION> \
  --enable-secret-manager \
  --secret-manager-rotation-interval=120s \
  --quiet
```

> **注意：** 有关配置 `SecretProviderClass` 清单以及在应用部署中将密钥挂载为卷的信息，
> 请参阅 `gke-workload-security`
> 技能。

## RBAC 加固

黄金路径会禁用不安全的旧式 RBAC 绑定，这些绑定会向 `system:authenticated` 和 `system:unauthenticated` 组授予广泛访问权限。

```bash
# Verify insecure bindings are disabled
gcloud container clusters describe <CLUSTER_NAME> --region <REGION> \
  --format="yaml(rbacBindingConfig)" \
  --quiet
```

**RBAC 最佳实践：**

-   优先使用命名空间范围的 Roles，而不是集群范围的 ClusterRoles。
-   绑定到特定的 Groups 或 ServiceAccounts，绝不要绑定到 `system:authenticated`
    或 `system:unauthenticated`。
-   通过 MCP 审计权限：`k8s:check_k8s_auth(parent="...", verb="list",
    resourceType="pods", namespace="...")`（或 `kubectl auth can-i --list
    --as=<user>`）。
-   通过 MCP 检查绑定：`k8s:get_k8s_resource(parent="...",
    resourceType="clusterrolebinding")`（或 `kubectl get
    clusterrolebindings,rolebindings --all-namespaces`）。

> 有关企业级 RBAC 规划，请参阅 `gke-multitenancy` skill 和
> https://docs.cloud.google.com/kubernetes-engine/docs/best-practices/rbac.md.txt

## Binary Authorization

默认情况下，黄金路径中未启用此功能，但建议启用，以便在整个集群中强制实施生产环境
镜像来源验证：

```bash
# Enable Binary Authorization
gcloud container clusters update <CLUSTER_NAME> --region <REGION> \
  --binauthz-evaluation-mode=PROJECT_SINGLETON_POLICY_ENFORCE \
  --quiet
```

## Shielded Nodes 与 GKE Sandbox 启用

在集群级别启用可验证的节点启动完整性和内核隔离功能：

```bash
# Enable Shielded Nodes on an existing cluster
gcloud container clusters update <CLUSTER_NAME> --region <REGION> \
  --enable-shielded-nodes \
  --quiet

# Enable GKE Sandbox (gVisor) runtime on an existing cluster
gcloud container clusters update <CLUSTER_NAME> --region <REGION> \
  --enable-gke-sandbox \
  --quiet
```

> **注意：** 要在 gVisor 沙箱内运行工作负载，请按照
> `gke-workload-security` skill 中的详细说明，在 Pod 规范中指定
> `runtimeClassName: gvisor`。

## 常用 IAM 角色

用于 GKE 平台和集群访问的五种最常用预定义 IAM 角色：

| 角色                            | 用途                | 适用场景             |
| ------------------------------- | ------------------- | -------------------- |
| `roles/container.admin`         | 完全控制集群和      | 平台团队管理员管理   |
:                                 : Kubernetes 资源     : 集群生命周期         :
:                                 :                     :                      :
| `roles/container.clusterAdmin`  | 管理集群，但不能    | 创建/删除集群的      |
:                                 : 管理项目级 IAM      : 集群操作员           :
| `roles/container.developer`     | 部署工作负载        | 将应用部署到现有     |
:                                 :（Pod、服务和部署）  : 集群的应用开发者     :
:                                 :                     :                      :
| `roles/container.viewer`        | 对集群和            | 监控、审计或         |
:                                 : Kubernetes 资源的   : 只读仪表板           :
:                                 : 只读访问            :                      :
| `roles/container.clusterViewer` | 仅列出和获取        | 需要集群元数据的     |
:                                 : 集群详细信息        : CI/CD 流水线         :
:                                 :                     :                      :

> **最小权限原则**：从 `roles/container.viewer` 或
> `roles/container.developer` 开始，仅在需要时提升权限。避免在团队范围内广泛授予
> `roles/container.admin`。

## 服务账号和代理

-   **GKE 服务代理**
    (`service-<PROJECT_NUMBER>@container-engine-robot.iam.gserviceaccount.com`)：
    自动创建。代表您管理节点、网络和集群操作。请勿移除或修改其权限。
-   **节点服务账号**：默认情况下，节点使用 Compute Engine 默认
    服务账号。对于生产平台，请创建一个仅具有最低必要权限
    （`roles/monitoring.metricWriter`、`roles/logging.logWriter`）的专用 Google 服务
    账号，并在创建节点池时为其分配该账号。
-   **Workload Identity**：如需将 Google 服务账号绑定到 Kubernetes
    服务账号（`roles/iam.workloadIdentityUser`），请参阅
    `gke-workload-security` skill。

## 跨服务身份验证模式

在通过 Workload Identity 进行关联之前，向后端 Google
服务账号（GSA）授予访问外部 Google Cloud 服务权限时，常见的项目级 IAM 策略绑定模式如下：

```bash
# Grant a GSA access to Cloud Storage objects
gcloud projects add-iam-policy-binding <PROJECT_ID> \
  --member "serviceAccount:<GSA_NAME>@<PROJECT_ID>.iam.gserviceaccount.com" \
  --role "roles/storage.objectViewer" \
  --quiet

# Grant a GSA access to Cloud SQL databases
gcloud projects add-iam-policy-binding <PROJECT_ID> \
  --member "serviceAccount:<GSA_NAME>@<PROJECT_ID>.iam.gserviceaccount.com" \
  --role "roles/cloudsql.client" \
  --quiet

# Grant a GSA access to Pub/Sub subscriptions
gcloud projects add-iam-policy-binding <PROJECT_ID> \
  --member "serviceAccount:<GSA_NAME>@<PROJECT_ID>.iam.gserviceaccount.com" \
  --role "roles/pubsub.subscriber" \
  --quiet

## Resources

- [GKE Cluster Hardening Guide](https://cloud.google.com/kubernetes-engine/docs/how-to/hardening-your-cluster)
- [GKE RBAC Best Practices](https://cloud.google.com/kubernetes-engine/docs/best-practices/rbac)
- [Secret Manager Add-on for GKE](https://cloud.google.com/kubernetes-engine/docs/how-to/secret-manager)
- [Binary Authorization on GKE](https://cloud.google.com/binary-authorization/docs/getting-started-gke)
- [Shielded GKE Nodes](https://cloud.google.com/kubernetes-engine/docs/how-to/shielded-gke-nodes)
- [GKE Sandbox (gVisor)](https://cloud.google.com/kubernetes-engine/docs/concepts/sandbox)
```