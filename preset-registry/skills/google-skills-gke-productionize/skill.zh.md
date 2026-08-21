---
name: gke-productionize
metadata:
  category: Containers
description: Orchestrates comprehensive production readiness reviews and assessments for GKE clusters and workloads across scalability, security, reliability, observability, backup/DR, and cost optimization. Use when asked to productionize, prepare, assess, audit, or review a GKE cluster or workload before going live to production. Don't use for deep-dive single-domain implementation (use specific domain skills like gke-workload-scaling, gke-platform-security, gke-workload-security, gke-service-networking, gke-reliability instead).
---
# GKE 生产化技能

此技能作为高级编排器，用于帮助 GKE 集群及其工作负载做好生产就绪准备。

> [!IMPORTANT]
> 这是一个**元技能**或**编排器技能**。在整个生产化过程中，你应调用并运行本文档中列出的许多其他专项技能。不要尝试直接在此技能中实现所有生产就绪功能；应使用此技能评估环境，然后将各领域的工作委派给相应的专项技能。

## 范围

此技能适用于：

-   单个应用（无论是否已在 Kubernetes 上运行）。
-   一组应用。
-   目标集群。

## 工作流程

### 1. 发现阶段

在提出建议之前，先了解环境的当前状态。

#### 集群发现

运行以下命令以了解集群配置：

-   检查集群详细信息：`gcloud container clusters describe {cluster_name}
    --location {location} --project {project}`
-   检查是 Autopilot 还是 Standard：在 describe 输出中查找以下配置块：

    ```yaml
    autopilot:
      enabled: true
    ```
-   检查发布渠道：查找 `releaseChannel`。

#### 工作负载发现

如果目标是特定应用，请了解其配置：

-   获取 deployment/statefulset 详细信息：`kubectl get deployment {app_name} -n
    {namespace} -o yaml`
-   检查是否使用专用 namespace 及标签：`kubectl get namespace {namespace}
    -o yaml`（查找 Pod Security Standards 标签）。
-   检查是否使用专用 service account：`kubectl get pods -n {namespace}
    -o
    custom-columns="NAME:.metadata.name,SERVICE_ACCOUNT:.spec.serviceAccountName"`
-   检查资源 requests 和 limits。
-   检查 liveness、readiness 和 startup probes。
-   检查 HPA：`kubectl get hpa -n {namespace}`
-   检查 PDB：`kubectl get pdb -n {namespace}`
-   检查 NetworkPolicies：`kubectl get networkpolicy -n {namespace}`

### 2. 生产就绪评估

**在实施之前，你必须针对下方列出的每个相关专项领域运行相应技能，并将其指导纳入评估和计划中。未能做到这一点将导致生产配置不合规。**

#### A. 应用接入（Kubernetes 之前）

如果应用尚未在 GKE 上运行，你必须运行 `gke-app-onboarding` 技能，以规划容器化、镜像构建和基础部署。

#### B. 可扩缩性与资源管理

确保工作负载具有适当的资源和自动扩缩能力。

-   **操作**：你必须运行 `gke-workload-scaling` 技能，以配置 HPA、VPA 和资源 limits。

#### C. 可观测性

确保已设置充分的日志记录和监控。

-   **操作**：你必须运行 `gke-observability` 技能，以设置 Cloud Logging、Monitoring 和 Managed Prometheus。

#### D. 可靠性

确保高可用性和优雅降级。

-   **操作**：你必须运行 `gke-reliability` 技能，以配置区域级集群、PDB 和健康探针。

#### E. 安全性

强化集群和工作负载的安全性。

-   **操作**：你必须运行 `gke-platform-security` 和
    `gke-workload-security` 技能，以配置 Workload Identity、网络策略和
    Shielded Nodes。
-   **命名空间隔离**：确保工作负载在专用命名空间中运行，并通过标签强制实施
    Pod Security Standards (PSS)。
-   **最小权限**：确保工作负载使用专用 ServiceAccount，而不是
    `default` ServiceAccount。

#### F. 备份与灾难恢复

确保有状态数据受到保护。

-   **操作**：你必须运行 `gke-backup-dr` 技能，以配置 Backup
    for GKE 和恢复流程。

#### G. 边缘安全与入口

保护外部访问。

-   **操作**：你必须运行 `gke-service-networking` 技能，以配置 Gateway API、
    Ingress 和 Cloud Armor。

#### H. 成本优化

确保高效使用资源。

-   **操作**：你必须运行 `gke-cost-optimization` 技能，以获取有关
    合理调整资源规模、配额和 Spot VMs 的策略。

#### I. 升级与维护策略

确保升级策略安全且可预测。

-   **操作**：你必须运行 `gke-upgrades` 技能，以配置发布渠道
    选择、维护时段/排除时段和节点池升级策略。

#### J. 黄金路径默认配置审计

确保集群配置符合推荐的默认配置。

-   **操作**：你必须运行 `gke-golden-path` 技能，将集群
    与黄金路径默认配置进行比较，并报告偏差、严重程度和
    修复措施。

### 3. 生产就绪度评分

评估完成后，为每个领域提供包含 RAG（红、黄、绿）
状态和总体就绪度评分的摘要报告。这有助于确定
修复工作的优先级。

以确定性的方式应用以下评分标准，确保对同一
环境的重复评估产生相同结果：

1.  **各领域标准**：对于每个已评估领域（A-J），列出所执行的具体
    检查（依据该领域技能的指导），并将每项检查分类为
    **通过**、**严重失败**（阻碍生产，例如未设置资源
    请求、未备份有状态数据、在严格限制的环境中使用公共
    控制平面）或 **轻微失败**（改进项，例如缺少 VPA
    建议、批处理工作负载未使用 Spot）。
2.  **RAG 映射（各领域）**：
    -   **红色** = 存在一个或多个严重失败的检查项。
    -   **黄色** = 不存在严重失败，但存在一个或多个轻微失败的检查项。
    -   **绿色** = 所有检查项均通过。
3.  **领域评分**：绿色 = 100，黄色 = 50，红色 = 0。
4.  **加权总分**：安全性、可靠性和备份/灾难恢复的权重为
    2 倍；所有其他已评估领域的权重为 1 倍。总分 = 各领域（评分 x
    权重）之和 / 权重之和，并四舍五入到最接近的整数。不适用的领域
    （例如，完全无状态工作负载的备份/灾难恢复）不计入
    分子和分母，并注明排除情况。
5.  **就绪度结论**：>= 90 且没有红色领域 = “生产就绪”；
    70-89 且没有红色领域 = “就绪，但需后续跟进”；其他所有情况 =
    “未达到生产就绪状态”。

在报告中，展示各领域的检查清单、RAG 状态、权重以及计算得出的总体评分。

## 适应性指南

-   **单个应用**：重点关注该特定应用的健康探针、HPA、资源限制、PDB 和工作负载身份。
-   **集群范围**：重点关注集群自动扩缩器、多可用区设置、发布渠道、维护窗口以及默认网络策略。
-   **主动执行**：主动执行相关 Skill（例如可观测性、安全性、扩缩容、可靠性）以进行评估并提出改进建议；在实施会改变状态的操作之前，先征得用户确认。