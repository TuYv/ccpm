---
name: gke-cost-optimization
description: >-
  Optimizes GKE costs, rightsizes workloads, and configures Spot VMs, CUDs, cost
  allocation, and resource quotas. Use when optimizing GKE cluster or workload
  costs, configuring GKE cost allocation or quotas, rightsizing CPU/memory
  requests, or selecting Spot VMs and machine types. Don't use for general
  compute class provisioning or GPU Selection (use gke-compute-classes instead).
metadata:
  category: CloudObservabilityAndMonitoring
---
# GKE 成本优化

本参考文档介绍了在保持安全可靠的同时降低 Google Kubernetes
Engine (GKE) 成本的策略和工作流。

## 工作流与优化策略

### 1. 前提条件：成本分配与监控

若要启用 GKE 成本分配 (`--enable-cost-allocation`)，以便跨命名空间和标签跟踪结算信息、检查实时集群利用率 (`kubectl top`)，
或在 BigQuery 中运行历史成本明细查询 (`bq`)，请使用
**`gke-cost-analysis`** 技能。启用跟踪并诊断出资源浪费后，
请应用以下优化工作流。

### 2. 配置资源配额

资源配额用于限制多租户集群中各租户的资源消耗总量，
从而防止成本失控。模板：
[assets/resource-quota-example.yaml](assets/resource-quota-example.yaml)
（设置命名空间和 `hard` 限制，然后执行 `kubectl apply -f`）。

### 3. Pod 资源规格调整（VPA 与 MPA）

调整 Pod 资源请求，使其与实际利用率相匹配。过度配置的
资源请求是造成浪费的最大来源之一。

-   **以建议模式使用 VPA** (`updateMode: "Off"` — 提供建议但
    不驱逐 Pod)：

```bash
# 1. Deploy VPA in recommendation mode (template: assets/vpa-recommendation-mode.yaml)
kubectl apply -f assets/vpa-recommendation-mode.yaml
# 2. Wait 24+ hours for data collection, then read recommendations
kubectl get vpa {deployment_name}-vpa -o jsonpath='{.status.recommendation}'
```

-   **优化规则：**

条件                          | 操作                               | 节省幅度
----------------------------- | ---------------------------------- | -------
CPU 请求量 > P95 实际用量的 5 倍    | 降至 `P95 * 1.2`              | 高
内存请求量 > P95 实际用量的 3 倍 | 降至 `P95 * 1.2`              | 高
CPU 请求量 > P95 实际用量的 2 倍    | 降至 `P95 * 1.2`              | 中
未设置资源请求                | 添加请求（支持装箱调度） | 中

-   **使用 MPA**：同时进行水平和垂直扩缩容时，协调 HPA 和 VPA 的建议，
    以避免扩缩容事件发生冲突。
-   **查看成本建议**：在 Google Cloud Console 中查看 (`Cost
    Management` > `GKE Cost Optimization`) 内置的资源规格调整建议。

### 4. 通过 ComputeClasses 与 NodeSelector 使用 Spot 虚拟机

对容错工作负载使用 Spot 虚拟机，可将成本降低 60-90%。

#### 4.1 ComputeClass 配置

若要配置优先使用 Spot、按需实例作为回退选项的 ComputeClass（包括优先级排序、
`activeMigration` 和机器系列选择），请使用 **`gke-compute-classes`**
技能——ComputeClass YAML 生成和优先级配置属于该技能的范畴，
不属于本技能的范畴。

#### 4.2 直接为工作负载选择 Spot (`nodeSelector`)

对于 GKE Autopilot 中的无状态或批处理工作负载，可使用 `nodeSelector`
直接指定 Spot 容量：

> [!WARNING] **抢占警告**：Spot 虚拟机可被中断，并可能随时在提前
> 30 秒通知后被抢占。工作负载必须具备
> 容错能力，并至少运行 2 个副本以实现高可用性。推荐 Spot 虚拟机时，
> 始终必须明确警告用户这种抢占风险。

确切的 Pod 级选择器如下：

```yaml
nodeSelector:
  cloud.google.com/gke-spot: "true"
```

完整的 Deployment 示例（replicas >= 2、`terminationGracePeriodSeconds: 25`、
`preStop` 钩子）：[assets/spot-deployment-example.yaml](assets/spot-deployment-example.yaml)。

**适合 Spot 的工作负载：**

工作负载                          | 是否适合 Spot？
--------------------------------- | ---------------
批处理／数据处理                  | 是
开发／测试环境                    | 是
无状态 Web/API（replicas >= 2）   | 是（配合 PDB）
支持检查点的作业                  | 是
有状态工作负载（数据库）          | 否
单副本关键服务                    | 否

### 5. 机器类型选择

选择节点规格或配置 ComputeClasses 时：

| 系列          | 使用场景                                          | 相对成本 |
| ------------- | ------------------------------------------------- | -------- |
| e2            | 通用型、可突发                                    | 最低     |
| t2a / t2d     | 横向扩展（Arm/AMD）、性价比优化                   | 低       |
| n4a           | 基于 Axion Arm、通用型、性价比优化                | 低       |
| n4 / n4d      | 通用型（Intel/AMD）、灵活规格                     | 中低     |
| c4a           | 基于 Axion Arm、通用型、高效率                    | 中       |
| c3 / c4       | 计算优化型（Intel）                               | 中高     |
| c3d / c4d     | 计算优化型（AMD）、高吞吐量                       | 中高     |
| ek-standard   | Autopilot 增强型                                  | 中       |
| m3 / x4       | 内存优化型、SAP HANA、大型数据库                  | 高       |
| g2 (L4 GPU)   | AI 推理                                           | 高       |
| a3 (H100 GPU) | AI 训练                                           | 最高     |
| a4 / a4x      | 超大规模 AI（Blackwell GPU）                      | 最高     |

### 6. 承诺使用折扣（CUD）

对于基准用量可预测的稳态工作负载，购买 1 年期或
3 年期 CUD：

-   **基于资源的 CUD**（承诺用于某个机器系列／区域）：1 年期折扣约为
    30% 后段，3 年期约为 55%（因机器系列而异）。
-   **灵活 CUD**（基于支出，可跨系列／区域使用）：以较低的
    折扣（1 年期约 28%，3 年期约 46%）换取灵活性。
-   **Autopilot：** Autopilot 专用 CUD 已于 2026 年 1 月停止提供——用于覆盖
    Autopilot 用量的新承诺是基于支出的 Compute Flexible CUD
    （现有 Autopilot CUD 承诺将持续至期限结束）。
-   自动应用于整个区域内符合条件的用量。
-   通过 Google Cloud 控制台 > 结算 > 承诺使用折扣进行购买。

**承诺规模应仅按稳态基准用量确定。** 无论是否实际使用，承诺都会在
整个期限内计费，因此，按峰值用量过度承诺会使折扣变成浪费。衡量一个
具有代表性的周期内实际用量的下限，以此确定承诺规模，并使用本 Skill
中已有的弹性选项覆盖超出该基准的所有用量：

-   **基线负载**（始终运行）→ 基于资源的 CUD。
-   **可变/突发负载** → 使用按需容量进行自动扩缩容。
-   **可容忍中断的负载**（批处理、CI、无状态工作器）→ Spot 虚拟机，可与自动扩缩容结合使用，且无需承诺用量。

推荐 CUD 时，应明确说明各类容量的分配比例，而不是暗示应对全部资源用量作出承诺。

### 7. 集群管理与多租户

-   **闲置的开发集群**：GKE 不支持停止/启动操作，只要集群存在，就会持续产生集群管理费。要降低闲置成本，可将节点池缩容至零（`gcloud container clusters resize {cluster_name}
    --node-pool {pool_name} --num-nodes 0`），或通过 IaC（Terraform/Config Connector）删除并重新创建集群。
-   **合理调整节点池规模（Standard）**：使用 Cluster Autoscaler，并设置适当的最小值/最大值限制。
-   **使用低成本的预热余量，替代过度预配的节点**：待机容量缓冲区（Preview，GKE 1.36.0-gke.2253000+）可将预初始化的节点保持在暂停状态——只需支付磁盘和 IP 的费用，而非完整的节点费用，恢复时间约为 30 秒。请参阅 **`gke-cluster-autoscaler`** skill。
-   **多租户整合**：使用 Namespaces 和 ResourceQuotas 隔离工作负载，让多个工程团队共享同一个集群，而不是为每个团队分别维护集群。

## 成本与利用率监控

要检查实时节点/Pod 利用率（`kubectl top nodes/pods`）、查看集群成本预算（`gcloud billing budgets list`），或在 BigQuery 中查询详细的结算报告（`bq query`），请参阅 **`gke-cost-analysis`** skill。