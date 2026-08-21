---
name: gke-golden-path
description: >-
  Provides GKE golden path configuration defaults, production readiness
  checklists, and cluster default patterns. Use when designing GKE clusters,
  verifying GKE production readiness, or checking configurations against
  GKE defaults. Don't use for setting up workload autoscaling specifically (use
  gke-workload-scaling instead).
metadata:
  category: Containers
---
# GKE 黄金路径配置

黄金路径是生产集群推荐使用的 Autopilot 配置。它定义了合理的默认值——当用户请求不同设置时，应应用这些设置并说明相关权衡。

> **MCP 工具：** `get_cluster`、`create_cluster`、`update_cluster`

## 规则

1.  **默认采用黄金路径。** 除非用户另有请求，否则使用黄金路径值。偏离黄金路径时，应说明相关权衡，但尊重用户的选择。
2.  **Day-0 与 Day-1。** 应显著标明 Day-0 决策（网络、私有节点、子网、IP 分配）——这些决策在创建后很难或无法更改。
3.  **工具优先级：MCP > gcloud > kubectl。** MCP 是首选，因为它使用结构化数据直接与 GKE API 交互，从而减少 shell 语法错误和解析歧义。有关完整的覆盖范围矩阵和替代选项，请参阅 `gke-basics` Skill 的 CLI 参考文档。如果用户说“use gcloud”或“use kubectl”，则在该会话中遵循其要求。
4.  **记录决策及其理由**，尤其是 Day-0 选择和偏离黄金路径的情况。

## 必需输入

如果用户不确定，请使用黄金路径默认值。

-   **项目 ID**（必需）
-   **区域**（必需，例如 `us-central1`）
-   **集群名称**（必需）
-   **环境类型**：开发/测试或生产（默认为生产）
-   **网络**：使用自有 VPC/子网或自动创建（默认：自动创建）
-   **规模预期**：预期节点/Pod 数量、工作负载类型
-   **成本约束**：对 Spot VM 的容忍度、预算考虑因素

## 始终应用的默认值

默认应用的推荐最佳实践。如果用户请求不同的设置，请应用该设置并简要说明其安全性或运维方面的权衡。

设置                                                               | 黄金路径值
------------------------------------------------------------------ | -----------------
`autopilot.enabled`                                                | `true`
`privateClusterConfig.enablePrivateNodes`                          | `true`
`masterAuthorizedNetworksConfig.privateEndpointEnforcementEnabled` | `true`
`secretManagerConfig.enabled` + `rotationInterval: 120s`           | `true`
`rbacBindingConfig.enableInsecureBinding*`                         | `false`（两者均为此值）
`workloadIdentityConfig.workloadPool`                              | 已启用
`networkConfig.datapathProvider`                                   | `ADVANCED_DATAPATH`
`networkConfig.dnsConfig.clusterDns`                               | `CLOUD_DNS`
`autoscaling.autoscalingProfile`                                   | `OPTIMIZE_UTILIZATION`
`verticalPodAutoscaling.enabled`                                   | `true`
`monitoringConfig` 组件                                            | SYSTEM_COMPONENTS, STORAGE, POD, DEPLOYMENT, STATEFULSET, DAEMONSET, HPA, JOBSET, CADVISOR, KUBELET, DCGM, APISERVER, SCHEDULER, CONTROLLER_MANAGER
`loggingConfig` 组件                                               | SYSTEM_COMPONENTS, WORKLOADS（默认启用）
`advancedDatapathObservabilityConfig.enableMetrics`                | `true`
`nodeConfig.shieldedInstanceConfig.enableSecureBoot`               | `true`
`nodeConfig.workloadMetadataConfig.mode`                           | `GKE_METADATA`
`nodeConfig.gcfsConfig.enabled` / `gvnic.enabled`                  | `true` / `true`
`addonsConfig.statefulHaConfig.enabled`                            | `true`
存储 CSI 驱动程序（Filestore、GCS FUSE、Parallelstore）             | 已启用
Pod 安全标准                                                       | 生产命名空间采用 `restricted`

## 客户可配置的设置

这些设置具有黄金路径默认值，但客户可以在有合理理由的情况下采用不同配置。**更改前请先询问。**

设置                                     | 默认值                              | 采用其他配置的原因
---------------------------------------- | ----------------------------------- | -----------
`dnsEndpointConfig.allowExternalTraffic` | `true`                              | 如果集群仅从 VPC 内部访问，则进行限制
`autoIpamConfig` / `createSubnetwork`    | `true` / `true`                     | 客户已有 VPC/子网
`maxPodsPerNode`                         | `48`                                | 高 Pod 密度时使用 `110`（会占用更多 CIDR 空间）
`subnetwork`                             | 自动创建                            | 客户使用现有子网
维护排除时段                             | 已配置（NO_MINOR_UPGRADES，1 年）   | 客户特定的调度安排
`nodeConfig.bootDisk.diskType`           | `pd-balanced`                       | I/O 密集型工作负载使用 `pd-ssd`，注重成本时使用 `pd-standard`
`nodeConfig.machineType`                 | `ek-standard-8`（Autopilot）        | 因工作负载而异；使用 ComputeClasses

## 约束规则

-   不要请求或输出机密信息（令牌、密钥、服务账号 JSON）。
-   通过 MCP 工具或 `gcloud config get-value
    project` 获取项目/集群上下文——不要让用户粘贴项目 ID。
-   对于 Day-0 决策，在继续操作前始终先提出澄清问题。
-   对于 Day-1 功能，提供黄金路径默认值及其权衡，并让客户确认。
-   不要承诺零停机；建议使用 PDB、健康探针、副本和分阶段升级。
-   审计现有集群时，与黄金路径进行比较，并报告偏差、严重程度及修复措施。

## 黄金路径配置

有关完整的集群级策略设置，请参阅 [golden-path-autopilot.yaml](./assets/golden-path-autopilot.yaml)。