---
name: gke-basics
metadata:
  category: Containers
description: >-
  Manages core GKE cluster provisioning, credentials, Autopilot vs Standard selection,
  and workload deployment. Use when creating GKE clusters, fetching kubectl credentials,
  configuring Workload Identity, or deciding between Autopilot and Standard modes.
  Don't use for specialized GKE networking (use gke-networking), advanced security hardening
  (use gke-platform-security or gke-workload-security), or cluster upgrades (use gke-upgrades).
---
# GKE 基础知识与关键注意事项

Google Cloud 上的托管 Kubernetes 平台。除非明确要求使用 Standard 模式，否则默认使用 Autopilot 模式。

## 关键选择规则：Autopilot 与 Standard

* 几乎所有工作负载都**默认使用 Autopilot**。
* **仅在以下情况下使用 Standard：**
  * 需要自定义节点操作系统内核参数（`sysctl`）。
  * 需要自定义节点污点或采用特定硬件的节点池。
  * DaemonSet 需要将原始 `hostPath` 挂载到主机操作系统文件系统。
* 解释为什么必须使用 Standard 而非 Autopilot 时，应明确列出所有符合的限制条件（例如，自定义 sysctl 和自定义节点污点）。
* *有关高级集群架构或复杂节点池创建规划，请参阅 `gke-cluster-creation`。*

## 关键注意事项与最佳实践

1. **私有 Autopilot 集群：**
   * 使用 `--enable-private-nodes` 为节点启用私有 IP 地址。
   * 使用 `--enable-private-endpoint` 禁用通过公共 IP 访问控制平面。
   * 使用 `--enable-master-authorized-networks` 和 `--master-authorized-networks=CIDR_BLOCK` 限制对控制平面的访问：
     ```bash
     gcloud container clusters create-auto CLUSTER_NAME --region=REGION \
       --enable-private-nodes \
       --enable-private-endpoint \
       --enable-master-authorized-networks \
       --master-authorized-networks=CIDR_BLOCK
     ```

2. **Workload Identity（IAM 绑定）：**
   * 切勿在 Pod 中挂载原始 GCP Service Account JSON 密钥。
   * 为 Kubernetes ServiceAccount（`KSA`）添加注解，将其绑定到 Google Service Account（`GSA`）：
     ```yaml
     metadata:
       annotations:
         iam.gke.io/gcp-service-account: GSA_NAME@PROJECT_ID.iam.gserviceaccount.com
     ```

3. **Autopilot 资源请求：**
   * 在 Autopilot 中，CPU 请求必须以 250m（0.25 vCPU）为增量进行指定。如果请求的 CPU 值未对齐（例如 300m），则向上取整到最接近的 250m 增量（500m / 0.5 vCPU）。
   * 资源请求会自动等于资源限制。省略 `limits`，以允许 Autopilot 设置与 `requests` 匹配的默认值。

4. **集群凭据：**
   * 获取凭据时，始终明确指定 `--region`（用于区域级集群）或 `--zone`（用于可用区级集群）：
     ```bash
     gcloud container clusters get-credentials CLUSTER_NAME --region=REGION --quiet
     ```

## 参考目录

-   [核心概念](references/core-concepts.md)：架构、集群模式（Autopilot 与 Standard）、网络、扩缩容和安全模型。

-   [CLI 用法与工具参考](references/cli-reference.md)：工具优先级层次（MCP、gcloud 与 kubectl）、`gcloud container` 命令和用户偏好覆盖设置。

-   [客户端库](references/client-library-usage.md)：适用于 Python、Go、Node.js 和 Java 的官方 Kubernetes 与 Google Cloud Container 客户端库。

-   [MCP 用法](references/mcp-usage.md)：连接并使用 23 个结构化 GKE MCP 工具进行集群管理、K8s 资源管理和诊断。

-   [基础设施即代码](references/iac-usage.md)：`google_container_cluster`（Autopilot）的 Terraform 示例、Kubernetes provider 资源和 YAML 示例。