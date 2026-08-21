---
name: gke-service-networking
description: >-
  Configures GKE edge networking, traffic routing, load balancing, and private
  service endpoints. Use when configuring Gateway API manifests, standard
  Ingress, Cloud Armor WAF security policies, Container-Native Load Balancing
  (NEGs), Private Service Connect (PSC), or Google-managed SSL certificates on
  GKE. Don't use for core cluster IP planning, Dataplane V2 network policies, or
  node NAT egress (use gke-networking instead).
metadata:
  category: Networking
---
# GKE 服务网络 Skill

此 Skill 提供了将 GKE 上运行的应用安全地公开到互联网或内部网络的工作流。

可部署的清单模板位于 `assets/` 中——应用前请编辑 `# Replace ...` 占位符。

## 工作流

### 1. 配置 Gateway API（推荐）

Gateway API 是在 Kubernetes 中管理路由的现代方式。

**前提条件**：必须在集群上启用 Gateway API（在运行 GKE 1.26+ 的新集群上默认启用；在较旧的受支持版本上，请使用 `--gateway-api=standard` 启用）。

**模板：**

-   `assets/gateway.yaml` — 使用 `gke-l7-global-external-managed` GatewayClass 并带有 HTTP 监听器的外部 Gateway。
-   `assets/httproute.yaml` — 通过 `parentRefs` 附加到 Gateway，并将路径前缀路由到 Service `backendRef` 的 HTTPRoute。
-   `assets/httproute-traffic-split.yaml` — 演示加权流量拆分（例如 90/10）的 HTTPRoute，用于跨后端服务的金丝雀部署。

```bash
kubectl apply -f assets/gateway.yaml
kubectl apply -f assets/httproute.yaml
```

**流量拆分（金丝雀部署）：**

HTTPRoute 支持跨多个后端 Service 进行加权流量拆分，以实现渐进式金丝雀发布：

```yaml
spec:
  rules:
    - backendRefs:
        - name: app-v1
          port: 80
          weight: 90
        - name: app-v2
          port: 80
          weight: 10
```

### 2. 配置标准 GKE Ingress

对于较简单的使用场景或旧版设置，请使用标准 Ingress。

**模板：** `assets/ingress.yaml` — 将流量路由到 Service 的 GCE Ingress（带有 `kubernetes.io/ingress.class:
"gce"` 注解）。

### 3. 使用 Cloud Armor 提供安全保护

Cloud Armor 提供 WAF 和 DDoS 防护。

1.  在 Cloud Armor 中创建 Security Policy：

    ```bash
    gcloud compute security-policies create {security_policy_name} \
      --description "WAF policy for {app_name}"

    # Example rule: block an abusive IP range
    gcloud compute security-policies rules create 1000 \
      --security-policy {security_policy_name} \
      --action deny-403 \
      --src-ip-ranges "203.0.113.0/24" \
      --description "Block abusive range"
    ```

2.  在 `BackendConfig` 中引用该策略：`assets/backendconfig.yaml`（设置 `spec.securityPolicy.name`）。

3.  通过注解将 `BackendConfig` 与你的 `Service` 关联：

    ```yaml
    # In your Kubernetes Service manifest metadata.annotations:
    cloud.google.com/backend-config: '{"default": "{backend_config_name}"}'
    # Or for specific port mappings:
    cloud.google.com/backend-config: '{"ports": {"80": "{backend_config_name}"}}'
    ```

### 4. 配置 Google 托管的 SSL 证书

自动预配和续订 SSL 证书。

**旧版 Ingress 方法：** 应用 `assets/managed-certificate.yaml`（一个列出你的域名的 `ManagedCertificate`），然后在 Ingress 注解中引用它：

```yaml
networking.gke.io/managed-certificates: {certificate_name}
```

**Gateway API 方法：** 对于标准 Certificate Manager 集成，请创建一个 `CertificateMap`，并使用准确的注解 `networking.gke.io/certmap` 在 Gateway 元数据注解中引用它（`certmap` 的拼写中不包含任何连字符）：

```yaml
metadata:
  annotations:
    networking.gke.io/certmap: {certificate_map_name}
```

> [!IMPORTANT] 注解键必须严格为 `networking.gke.io/certmap`（请勿
> 使用 `cert-map` 或 `certificate-map`）。

或者，也可以在 HTTPS 监听器的 `tls.certificateRefs` 中引用 Kubernetes Secret。
这两种方式都包含在 `assets/gateway-https.yaml` 中。

### 5. 启用容器原生负载均衡（推荐）

容器原生负载均衡允许负载均衡器直接以 Kubernetes Pod 为目标，
而不是以节点为目标。这可以改善延迟和流量分配。

**前提条件**：集群必须为 VPC 原生集群。

**工作原理**：Service 上的 `cloud.google.com/neg` 注解会触发创建
一个映射 Pod IP 的 NEG。GKE 通常会自动添加该注解，但并非总是如此——而关键就在于
了解自己属于哪种情况。

```yaml
# In your Kubernetes Service manifest metadata.annotations:
cloud.google.com/neg: '{"ingress": true}'
```

**自动添加注解的情况**（请勿手动添加）：

-   **内部 Ingress** — *始终*使用容器原生负载均衡，并非
    可选项。内部 Ingress 始终使用 `GCE_VM_IP_PORT` NEG，并且要求
    使用 VPC 原生集群。
-   **外部 Ingress**，但仅限同时满足以下四个条件：集群为
    VPC 原生集群、未使用 Shared VPC、未使用 GKE Network Policy，并且
    已启用 `HttpLoadBalancing` 插件（默认启用——请勿将其禁用）。
    此时，GKE 会自动为 Service 添加注解。

**必须显式添加注解的情况**：

-   **独立 NEG** — 由你自行管理负载均衡器，而不是
    让 Ingress 管理。如果必须在 GKE 外部配置负载均衡器，则需要采用此方式，
    因为 Ingress 会在同步或升级时覆盖其管理的负载均衡器设置。
    你需要负责负载均衡器的每一个部分。
-   **任何不满足上述四个条件之一的外部 Ingress 集群** —
    使用 Shared VPC、GKE Network Policy 或非 VPC 原生集群时，需要为每个 Service 启用。
-   **旧版配置** — 在 VPC 原生集群上创建的一些较旧的外部 Ingress 对象
    仍使用实例组后端。

**不支持／无 NEG 回退机制**：

-   Windows Server 节点池。
-   使用外部 Ingress 的基于路由（非 VPC 原生）集群——Ingress
    控制器会回退到跨所有节点的非托管实例组。

> **规模影响**：如果不使用 NEG，集群最多只能包含 1,000 个节点，并且
> Ingress 后方未使用 NEG 的 Service 在超过此规模后将无法正常运行。使用
> NEG 时则不受 GKE 节点数量限制。

### 6. 配置 Private Service Connect（PSC）

Private Service Connect 允许你将一个 VPC 中的服务安全地公开给
另一个 VPC 中的使用方，而无需使用 VPC 对等互连。

**前提条件**：后端 Service 必须是内部直通式网络
负载均衡器，即带有
`networking.gke.io/load-balancer-type: "Internal"` 注解的
`type: LoadBalancer`。`ServiceAttachment` 要求使用这种类型；ClusterIP 或外部 LoadBalancer Service
均无法使用。

**步骤：**

1.  为你的工作负载创建一个内部 LoadBalancer Service。
2.  创建一个引用该 Service 的 `ServiceAttachment`：
    `assets/service-attachment.yaml`（用于设置 `connectionPreference`、PSC NAT
    子网以及 Service 的 `resourceRef`）。
3.  与使用方共享 `ServiceAttachment` URI，以便他们在自己的 VPC 中创建 PSC 端点。

### 7. 拓扑感知路由（成本与延迟优化）

为了最大限度降低跨可用区数据传输成本和网络延迟，请为 Kubernetes Service 配置拓扑感知路由。此功能会将流量路由到与发起请求的客户端位于同一可用区的 Pod：

```yaml
# In your Kubernetes Service manifest metadata.annotations:
service.kubernetes.io/topology-mode: auto
```

## 注意事项

1.  **必须启用 Certificate Manager API**，`networking.gke.io/certmap`
    注解才能生效（`gcloud services enable
    certificatemanager.googleapis.com`）；否则 Gateway 将无法预配证书映射。
2.  **区域级 Gateway 类需要仅代理子网**：`gke-l7-regional-external-managed`
    和 `gke-l7-rilb` 等类要求所在区域中存在一个设置了
    `--purpose=REGIONAL_MANAGED_PROXY` 的子网；如果没有该子网，Gateway 将一直处于未编程状态。
3.  **ManagedCertificate 的预配依赖 DNS**：在域名的 A/AAAA 记录指向负载均衡器
    IP 之前，证书会一直处于 `Provisioning` 状态；DNS 配置正确后，预配过程可能还需要 15–60 分钟。