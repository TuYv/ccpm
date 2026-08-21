---
name: gke-networking
description: >-
  Plans, configures, and manages core GKE cluster networking. Covers private
  clusters, VPC-native configurations, DNS, node egress, Dataplane V2, and
  IP planning. Use when designing GKE networking layouts, configuring private
  clusters, setting up Dataplane V2, planning GKE IP ranges, or managing VPC-
  native cluster modes. Don't use for application ingress, load balancing, or
  service networking (use gke-service-networking instead).
metadata:
  category: Networking
---
# GKE 网络

本参考文档涵盖 GKE 集群的网络配置。黄金路径强制使用启用了 Dataplane V2 的私有 VPC 原生集群。

> **MCP 工具：** `get_cluster`、`update_cluster`、`apply_k8s_manifest`、
> `get_k8s_resource`

## 黄金路径网络默认设置

设置                                                                  | 黄金路径值                         | 第 0/1 天 | 备注
-------------------------------------------------------------------- | ---------------------------------- | ---------- | -----
`privateClusterConfig.enablePrivateNodes`                            | `true`                             | 第 0 天    | 节点没有公共 IP
`masterAuthorizedNetworksConfig.privateEndpointEnforcementEnabled`   | `true`                             | 第 0 天    | 只能通过私有端点或 DNS 访问控制平面
`controlPlaneEndpointsConfig.dnsEndpointConfig.allowExternalTraffic` | `true`                             | 第 0 天    | 允许从 VPC 外部通过 DNS 访问
`networkConfig.datapathProvider`                                     | `ADVANCED_DATAPATH` (Dataplane V2) | 第 0 天    | 基于 eBPF，内置网络政策
`networkConfig.dnsConfig.clusterDns`                                 | `CLOUD_DNS`                        | 第 0 天    | 托管式 DNS，比 kube-dns 更可靠
`networkConfig.enableIntraNodeVisibility`                            | `true`                             | 第 1 天    | 为节点内流量启用 VPC 流日志
`ipAllocationPolicy.autoIpamConfig.enabled`                          | `true`                             | 第 0 天    | 自动管理 IP 范围
`ipAllocationPolicy.createSubnetwork`                                | `true`                             | 第 0 天    | 自动创建专用子网
`defaultMaxPodsConstraint.maxPodsPerNode`                            | `48`                               | 第 0 天    | 保守的默认值；高密度场景下为 110

## 私有集群访问模式

黄金路径会创建一个私有集群。用户可以通过以下方式访问该集群：

1.  **DNS 端点（默认）**：`allowExternalTraffic: true` 允许从 VPC 外部通过
    集群的 DNS 端点进行访问。无需 VPN。
2.  **私有端点**：从 VPC 内部或通过 Cloud
    VPN/Interconnect 直接访问。
3.  **授权网络**：将特定 CIDR 添加到
    `masterAuthorizedNetworksConfig`，以实现基于 IP 的访问控制。

```bash
# Access private cluster via DNS endpoint (golden path default)
gcloud container clusters get-credentials {cluster_name} \
  --region {region} --dns-endpoint \
  --quiet

# Access via private endpoint (from within VPC)
gcloud container clusters get-credentials {cluster_name} \
  --region {region} --internal-ip \
  --quiet
```

## 使用自有 VPC/子网

如果客户已有网络基础设施：

```bash
gcloud container clusters create-auto {cluster_name} \
  --region {region} \
  --network {vpc_name} \
  --subnetwork {subnet_name} \
  --cluster-secondary-range-name {pod_range} \
  --services-secondary-range-name {svc_range} \
  --enable-private-nodes \
  --enable-master-authorized-networks \
  --quiet
```

> **Day-0 警告**：集群创建后，无法更改 VPC、子网和 IP 范围。

## VPC 原生模式的优势

VPC 原生集群使用 GCP Alias IP 范围进行原生流量路由。需要涵盖的主要
优势：

1.  **可扩展性**：流量直接在 VPC 内进行原生路由，无需使用
    自定义路由，并可避免自定义路由限制所造成的瓶颈。
2.  **直接集成 VPC**：无需复杂的桥接或路由隧道，即可直接集成
    GCP 网络中的资源。
3.  **避免 IP 耗尽**：支持不连续的 IP 范围并优化
    分配，从而降低子网 IP 范围耗尽的风险。

## IP 规划

| 资源          | 黄金路径     | 备注                                       |
| ------------- | ------------ | ------------------------------------------ |
| Pod CIDR      | `/17`（自动） | 约 32K 个 Pod IP；大小取决于 maxPodsPerNode |
| Service CIDR  | `/20`（自动） | 约 4K 个服务 IP                             |
| 节点子网      | 自动创建     | 建议使用 /20 以满足增长需求                 |
| 每节点最大 Pod 数 | 48       | 每个节点获得一个 /25 Pod 范围；设为 110 时  |
:               :              : 每个节点使用 /24                           :

**Pod CIDR 容量估算经验法则：**

-   `maxPodsPerNode=48` -> 每个节点使用 Pod CIDR 中的一个 `/25`（128 个 IP）
-   `maxPodsPerNode=110` -> 每个节点使用 Pod CIDR 中的一个 `/24`（256 个 IP）
-   maxPodsPerNode 越大 = 给定 CIDR 可容纳的节点越少

## 出站流量

-   默认：节点使用 Cloud NAT 访问外部互联网（私有节点
    没有公共 IP），从而使私有节点无需暴露公共 IP
    即可访问互联网。
-   对于静态出站 IP：使用手动 IP 分配配置 Cloud NAT，以
    保持一致的源 IP，供外部允许列表或合作伙伴
    防火墙使用。
-   对于受限出站流量：通过自定义路由将流量导向防火墙设备，
    以根据组织安全策略检查和过滤出站流量。

## 网络策略

Dataplane V2（黄金路径）提供内置的网络策略强制执行功能——
无需额外的插件。为每个命名空间应用默认拒绝策略，然后允许特定
流量。

> 有关默认拒绝策略，请参阅 `gke-workload-security` skill；有关
> 各团队的允许策略，请参阅 `gke-multitenancy` skill。