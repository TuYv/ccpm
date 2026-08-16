---
name: gke-cluster-creation
description: >-
  Plans and executes GKE cluster creation, provisioning, and production
  readiness audits using pre-defined templates (Autopilot, Standard Regional,
  GPU/AI Inference, AI Hypercompute). Use when creating GKE clusters,
  provisioning GKE environments, selecting cluster modes, or auditing GKE
  clusters. Don't use for application onboarding or deployment configuration
  (use gke-app-onboarding instead).
metadata:
  category: Containers
---
# GKE 集群创建

本参考指南通过提供一组最佳实践模板，并指导进行模式选择和自定义，帮助创建 Google Kubernetes Engine (GKE) 集群。**黄金路径 Autopilot** 配置是所有新集群的默认选择。

> **MCP 工具：** `list_clusters`、`create_cluster`、`get_cluster`、
> `list_operations`、`get_operation`

## 工作流程

1.  **了解上下文**：使用 `list_clusters` 查看现有集群。如果项目未知，请使用
    `gcloud config get-value project`。
2.  **收集输入信息**：`project_id`、`location`（区域或可用区）、
    `cluster_name`、环境类型。如果缺少必要信息，请在执行操作前询问用户。
3.  **选择模式并解释权衡因素**：如果用户尚未指定模板或模式，请介绍可用模板
    （例如 Autopilot、Standard Regional、GPU Inference、AI Hypercompute），
    并解释关键权衡因素（成本与可用性、Autopilot 与 Standard 节点管理）。
4.  **配置网络**：自动创建子网（默认）或使用自有子网。
5.  **检查黄金路径设置**：展示默认配置块（`gcloud` 命令或 `create_cluster`
    JSON 载荷），并在创建前与用户确认。
6.  **创建**：使用 MCP `create_cluster` 工具或 `gcloud` CLI。
7.  **跟踪**：使用 `get_operation` 监控创建进度。
8.  **验证**：使用带有 `readMask="*"` 的 `get_cluster`，确认已应用黄金路径
    设置。

## 模式选择

| 标准               | Autopilot（黄金路径）     | Standard                  |
| ------------------ | ------------------------- | ------------------------- |
| 节点管理           | 由 Google 管理            | 自行管理                  |
| 定价               | 按 Pod 资源请求付费       | 按节点（VM）付费          |
:                    :                           :                           :
| 节点自定义         | 通过 ComputeClasses       | 完全控制                  |
| DaemonSets         | 允许（存在                | 完全控制                  |
:                    : 限制）                    :                           :
| GPU/TPU            | 通过 ComputeClasses       | 通过节点池支持            |
:                    : 支持                      :                           :
| 最适合             | 大多数生产工作负载        | 内核调优、自定义操作系统、|
:                    :                           : 特权工作负载              :

> **规则**：除非客户有 Autopilot 无法满足的特定要求，否则默认使用 Autopilot。

## 最佳实践

在指导用户或生成配置时，请遵循以下 GKE 最佳实践：

### 安全与网络

1.  **私有集群**：默认使用具有私有控制平面的私有集群（`enablePrivateNodes:
    true`），并限制公共端点（`enable-master-authorized-networks`），以最大限度地缩小攻击面。
2.  **VPC 原生网络**：使用 VPC 原生集群（`useIpAliases: true` /
    `--enable-ip-alias`），以启用别名 IP 范围和 Pod 级防火墙规则。
3.  **Workload Identity**：优先使用 Workload Identity（`workloadPool:
    <PROJECT_ID>.svc.id.goog`），以安全地授予 GKE 工作负载访问 Google Cloud
    服务的权限，而不是使用静态服务账号密钥。
4.  **受防护的 GKE 节点**：启用受防护的 GKE 节点
    （`--enable-shielded-nodes`、`--enable-secure-boot`），以防御 rootkit 和
    bootkit。
5.  **最小权限（RBAC）**：实施严格的基于角色的访问控制限制
    （`scoped-rbs-bindings`）。

### 成本优化

1.  **自动扩缩容**：启用 Cluster Autoscaler 和 Horizontal/Vertical Pod
    Autoscaler（`--enable-autoscaling`、`--enable-vertical-pod-autoscaling`），
    以根据需求调整资源。
2.  **合理配置资源与 Spot VM**：选择合适的机器类型和节点数量。对于可容错、非关键的批处理
    或推理工作负载，可考虑使用 Spot VM（`--spot`）。

### 高可用性与可靠性

1.  **区域级集群**：在生产环境中使用区域级集群，以确保控制平面跨多个可用区复制（使用
    `--region` 而非 `--zone`）。*注意：Standard 区域级集群默认会跨
    3 个可用区创建节点。*
2.  **Pod 中断预算**：建议设置 Pod Disruption Budgets，以确保节点维护期间
    应用程序的稳定性。
3.  **发布渠道**：订阅发布渠道（`REGULAR` 或 `STABLE`），
    以实现自动化且更安全的集群升级。

## 模板

### 1. 黄金路径 Autopilot（生产环境）

这是默认选项。所有设置均与
`../gke-golden-path/assets/golden-path-autopilot.yaml` 匹配。

**通过 gcloud：**

```bash
gcloud container clusters create-auto <CLUSTER_NAME> \
  --region <REGION> \
  --project <PROJECT_ID> \
  --release-channel regular \
  --enable-private-nodes \
  --enable-master-authorized-networks \
  --enable-dns-access \
  --enable-secret-manager \
  --secret-manager-rotation-interval=120s \
  --scoped-rbs-bindings \
  --monitoring=SYSTEM,API_SERVER,SCHEDULER,CONTROLLER_MANAGER,STORAGE,POD,DEPLOYMENT,STATEFULSET,DAEMONSET,HPA,CADVISOR,KUBELET,DCGM \
  --quiet
```

**通过 MCP（`create_cluster`）：**

```json
{
  "parent": "projects/<PROJECT_ID>/locations/<REGION>",
  "cluster": {
    "name": "<CLUSTER_NAME>",
    "autopilot": { "enabled": true },
    "privateClusterConfig": { "enablePrivateNodes": true },
    "masterAuthorizedNetworksConfig": {
      "privateEndpointEnforcementEnabled": true
    },
    "releaseChannel": { "channel": "REGULAR" },
    "secretManagerConfig": {
      "enabled": true,
      "rotationConfig": { "enabled": true, "rotationInterval": "120s" }
    },
    "rbacBindingConfig": {
      "enableInsecureBindingSystemAuthenticated": false,
      "enableInsecureBindingSystemUnauthenticated": false
    }
  }
}
```

### 2. Autopilot 开发/测试环境

放宽部分黄金路径默认设置，以便在非生产环境中节省成本并简化访问。

**通过 gcloud：**

```bash
gcloud container clusters create-auto <CLUSTER_NAME> \
  --region <REGION> \
  --project <PROJECT_ID> \
  --release-channel rapid \
  --quiet
```

**通过 MCP（`create_cluster`）：**

```json
{
  "parent": "projects/<PROJECT_ID>/locations/<REGION>",
  "cluster": {
    "name": "<CLUSTER_NAME>",
    "autopilot": { "enabled": true },
    "releaseChannel": { "channel": "RAPID" }
  }
}
```

> **警告**：此配置不会应用黄金路径安全加固。仅适用于
> 开发/测试环境。

### 3. Standard 区域级集群（高可用性/自定义要求）

最适合无法使用 Autopilot 的情况（例如，需要自定义内核调优或特定的节点操作系统）。
默认跨可用区创建 3 个节点。

**通过 gcloud：**

```bash
gcloud container clusters create <CLUSTER_NAME> \
  --region <REGION> \
  --project <PROJECT_ID> \
  --num-nodes 3 \
  --machine-type e2-standard-4 \
  --disk-type pd-balanced \
  --enable-autoscaling --min-nodes 1 --max-nodes 10 \
  --enable-shielded-nodes --enable-secure-boot \
  --workload-pool=<PROJECT_ID>.svc.id.goog \
  --enable-private-nodes \
  --enable-master-authorized-networks \
  --enable-vertical-pod-autoscaling \
  --enable-dataplane-v2 \
  --release-channel regular \
  --quiet
```

**通过 MCP（`create_cluster`）：**

```json
{
  "parent": "projects/<PROJECT_ID>/locations/<REGION>",
  "cluster": {
    "name": "<CLUSTER_NAME>",
    "initialNodeCount": 3,
    "nodeConfig": {
      "machineType": "e2-standard-4",
      "diskType": "pd-balanced",
      "diskSizeGb": 100,
      "oauthScopes": ["https://www.googleapis.com/auth/cloud-platform"],
      "shieldedInstanceConfig": {
        "enableSecureBoot": true,
        "enableIntegrityMonitoring": true
      },
      "workloadMetadataConfig": {
        "mode": "GKE_METADATA"
      }
    },
    "privateClusterConfig": { "enablePrivateNodes": true },
    "releaseChannel": { "channel": "REGULAR" },
    "workloadIdentityConfig": {
      "workloadPool": "<PROJECT_ID>.svc.id.goog"
    }
  }
}
```

### 4. GPU 推理与 AI 工作负载（L4 / ComputeClass）

最适合：AI/ML 推理、小型模型服务。可通过 Autopilot + ComputeClass，或通过使用 `g2-standard-4`（`nvidia-l4`）的 Standard 节点池进行配置。*注意：需要 `g2-standard-4` 配额。*

**Autopilot ComputeClass / GIQ 方式：**

```bash
# 1. Create golden path cluster (same as template 1)
gcloud container clusters create-auto <CLUSTER_NAME> \
  --region <REGION> --project <PROJECT_ID> \
  --enable-private-nodes --enable-master-authorized-networks \
  --enable-dns-access --enable-secret-manager --scoped-rbs-bindings \
  --quiet

# 2. Apply GPU ComputeClass (see gke-compute-classes.md)
kubectl apply -f gpu-compute-class.yaml

# 3. Or use GIQ for inference (see gke-inference.md)
gcloud container ai profiles manifests create \
  --model=gemma-2-9b-it --model-server=vllm --accelerator-type=nvidia-l4 --quiet > inference.yaml
kubectl apply -f inference.yaml
```

**通过 MCP（`create_cluster`）使用 Standard 节点池的方式：**

```json
{
  "parent": "projects/<PROJECT_ID>/locations/<REGION>",
  "cluster": {
    "name": "<CLUSTER_NAME>",
    "initialNodeCount": 1,
    "nodeConfig": {
      "machineType": "g2-standard-4",
      "accelerators": [
        {
          "acceleratorCount": "1",
          "acceleratorType": "nvidia-l4"
        }
      ],
      "diskSizeGb": 100,
      "oauthScopes": ["https://www.googleapis.com/auth/cloud-platform"]
    }
  }
}
```

### 5. AI 超级计算（A3 HighGPU / 大型模型服务）

最适合：大规模 LLM / AI 模型训练和超级计算推理。*注意：每小时成本较高，并且有严格的配额要求（`a3-highgpu-8g` / `nvidia-h100-80gb-hbm3`）。*

**通过 gcloud：**

```bash
gcloud container clusters create <CLUSTER_NAME> \
  --region <REGION> \
  --project <PROJECT_ID> \
  --num-nodes 1 \
  --machine-type a3-highgpu-8g \
  --accelerator type=nvidia-h100-80gb-hbm3,count=8 \
  --disk-size 200 \
  --scopes https://www.googleapis.com/auth/cloud-platform \
  --workload-pool=<PROJECT_ID>.svc.id.goog \
  --release-channel regular \
  --quiet
```

**通过 MCP（`create_cluster`）：**

```json
{
  "parent": "projects/<PROJECT_ID>/locations/<REGION>",
  "cluster": {
    "name": "<CLUSTER_NAME>",
    "initialNodeCount": 1,
    "nodeConfig": {
      "machineType": "a3-highgpu-8g",
      "accelerators": [
        {
          "acceleratorCount": "8",
          "acceleratorType": "nvidia-h100-80gb-hbm3"
        }
      ],
      "diskSizeGb": 200,
      "oauthScopes": ["https://www.googleapis.com/auth/cloud-platform"]
    }
  }
}
```

## 说明

-   如果上下文中没有 `project_id`，**务必**询问。
-   **务必**询问 `region`（或位置）。
-   **务必**询问一个唯一的 `cluster_name`。
-   除非客户另有指定，或有自定义节点/内核/超级计算方面的要求，否则**默认**使用黄金路径 Autopilot。
-   当偏离黄金路径而改用 GKE Standard 时，**务必发出警告**，强调这偏离了黄金路径，并说明由此增加的运维/管理开销（手动管理节点池、升级和自动扩缩容）。
-   如果用户尚未指定，在向其提供模板或模式选项时，**说明权衡取舍**（例如 Autopilot 与 Standard、成本与可用性）。
-   **提供配置**块（`gcloud` 命令或 JSON 载荷），并在调用任何创建工具之前请求确认。
-   对于后续难以更改的 Day-0 决策（网络、私有节点），**发出警告**。
-   当用户选择 GPU（`g2-standard-4`、`a3-highgpu-8g`）、TPU 或多区域/区域级集群（`--region` 默认使用 3 个可用区）时，明确**警告**成本和配额要求。
-   使用 MCP `create_cluster` 时，`cluster.name` 参数应为**短名称**（例如 `my-cluster`），而不是完整资源路径（`projects/<PROJECT_ID>/locations/<REGION>/clusters/<CLUSTER_NAME>`）。`parent` 参数用于定义作用域（`projects/<PROJECT_ID>/locations/<REGION>`）。