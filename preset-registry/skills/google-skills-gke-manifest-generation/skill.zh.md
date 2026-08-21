---
name: gke-manifest-generation
metadata:
  category: Containers
description: >-
  Generates and updates secure, production-ready Kubernetes YAML manifests optimized for GKE Autopilot and GKE Standard clusters. Use when creating or modifying GKE deployment manifests, configuring container security contexts, setting CPU/memory resource limits, defining readiness/liveness/startup probes, mounting secrets and volumes, configuring GKE Gateway API routes, targeting Spot VMs, or deploying AI model inference workloads (vLLM, TGI, Gemma). Don't use for live cluster operations, pod troubleshooting (use gke-workload-troubleshooting), or cluster infrastructure provisioning (use gke-cluster-creation).
---
# GKE 清单生成技能

此技能提供指导原则、工具集成和模板，用于将自然语言描述或应用程序代码变更转换为安全、合规且经济高效的 Kubernetes YAML 清单，并针对 GKE Autopilot 和 GKE Standard 集群进行了优化。

## 核心规则与验证

生成或更新 YAML 清单时，**必须**严格遵守以下规则：

### 1. 命名空间与资源隔离

-   **显式命名空间**：始终在每个资源（Deployments、Services、ConfigMaps、
    Secrets、PVCs、Roles、绑定）的元数据中显式声明 `namespace: {namespace}`。
    将其映射到当前 `SETTINGS.md` 中配置的命名空间。绝不能省略命名空间。
-   **专用 ServiceAccount**：避免使用命名空间的 `default`
    ServiceAccount。始终为每个微服务创建并引用专用的 `ServiceAccount`
    （例如 `devteam-agent-sa`）。

### 2. GKE 资源调优（Autopilot 与 Standard）

-   **资源请求与限制**：始终为所有容器指定 CPU 和内存请求与限制。
    -   *GKE Autopilot*：请求量直接决定 Pod 计费；请求与限制必须相等。
        如果二者不同，Autopilot 会自动增大请求以匹配限制，这可能会显著增加成本。
    -   *GKE Standard*：请求可确保稳定的调度和装箱；限制可防止资源匮乏和
        “吵闹邻居”问题。
-   **密度默认值**：对于 GKE Standard 上的无状态应用或边车容器，
    默认使用保守的请求值（例如 `requests.cpu: "100m"` 或 `"200m"`、
    `requests.memory: "256Mi"` 或 `"512Mi"`），并设置可突发的限制。
    为限制采用合理的超配比率（例如请求量的 2 到 4 倍，如
    `limits.cpu: "400m"` 到 `"800m"`，以及 `limits.memory: "512Mi"` 到 `"1Gi"`）。
    避免过高的超配限制（例如为 `100m` 的请求设置 `limits.cpu: "4"`），
    以防止在高调度负载下出现严重的 CPU 节流和延迟劣化，尤其是在无法保证节点
    资源份额的环境中。
-   **用于暂存/开发环境的 Spot VM**：对于非生产工作负载（例如命名空间中包含
    `-test`、`-dev` 或 `-staging`），或者用户要求进行成本优化时，
    自动以 GKE Spot VM 为目标。这需要同时注入以 Spot VM 为目标的
    `nodeSelector`，以及用于容忍 Spot VM 污点的相应容忍配置：

    ```yaml
    nodeSelector:
      cloud.google.com/gke-spot: "true"
    tolerations:
      - key: "cloud.google.com/gke-spot"
        operator: "Equal"
        value: "true"
        effect: "NoSchedule"
    ```

    （在 GKE Standard 上，这假设已配置 Spot 节点池）。

### 3. 容器安全加固（Pod 安全标准）

-   **非 Root 身份运行**：始终在 Pod 级别配置 `securityContext`
    （如需覆盖，也应在容器级别配置），以非 Root 用户身份运行（例如
    `runAsNonRoot: true`、`runAsUser: 10000`、`runAsGroup: 10000`、`fsGroup:
    10000`）。GKE Autopilot 会严格强制执行此要求，同时这也是 GKE Standard
    的关键安全基线。
-   **最小权限**：始终设置 `allowPrivilegeEscalation: false` 和
    `seccompProfile: {type: RuntimeDefault}`。
-   **只读根文件系统**：设置 `readOnlyRootFilesystem: true`，以防止修改
    容器镜像文件系统。
    -   *可写目录回退方案*：如果启用了 `readOnlyRootFilesystem`，
        请将本地 `emptyDir` 卷挂载到 `/tmp` 或 `/var/run/`，以允许应用程序
        （如 Java/Nginx）写入临时文件而不会崩溃。
-   **Secret 卷挂载**：优先将 Secrets 作为只读文件挂载
    （在 `volumes` 规范中使用 `defaultMode: 0400` 进行配置），而不是将其映射为
    环境变量，除非应用程序框架仅支持基于环境变量的配置。这样可以防止 Secret
    泄漏到应用程序日志中。

### 4. 健康检查（强制探针）

-   **存活与就绪探针**：每个 Deployment 容器都必须同时定义
    `livenessProbe` 和 `readinessProbe`。
    -   **Web/API**：使用 `httpGet` 探针。
    -   **TCP 服务**：使用 `tcpSocket` 探针。
    -   **数据库/缓存**：使用基于命令的 `exec` 探针（例如，
        `exec.command: ["redis-cli", "ping"]`）。
-   **用于启动缓慢应用的启动探针**：对于启动时间较长的应用程序
    （例如 Java Spring Boot、复杂的 Python 脚本、LLM 模型服务器），
    还**必须**定义 `startupProbe`。定义 `startupProbe` 后，
    存活探针和就绪探针会在它成功之前保持禁用，从而防止
    Kubernetes 在启动期间过早终止 Pod：

    ```yaml
    startupProbe:
      httpGet:
        path: /healthz
        port: 8080
      failureThreshold: 30
      periodSeconds: 10
    ```

-   **合理的默认值**：根据启动时间，将 `initialDelaySeconds: 5` 设置为
    `15`（例如，Java 需要比 Go/Nginx 更长的延迟）。

### 5. Service 与 Ingress 路由

-   **内部 ClusterIP**：所有内部微服务默认使用 `type:
    ClusterIP`。除非工作负载明确需要从互联网公开访问，否则绝不要使用
    `type: LoadBalancer` 或 `NodePort`。
-   **端口命名**：始终为 Service 和容器端口分配清晰、标准的名称
    （例如 `name: http-web` 或 `name: grpc-api`），以支持
    自动协议发现、追踪和 Web App 路由。
-   **优先使用 Gateway API**：对外暴露 API 时，优先使用 GKE
    Gateway API（`Gateway` 和 `HTTPRoute` 资源），而不是传统的 `Ingress`
    对象，以支持高级 L7 路由和安全功能（例如 Cloud
    Armor）。

### 6. 卷挂载、StorageClass 与 subPath 安全性

-   **避免覆盖目录**：将 `ConfigMap` 或 `Secret` 挂载到
    包含其他文件的应用程序目录（例如 Nginx 公共目录）时，
    始终使用 `subPath` 仅覆盖特定文件。
    *注意事项*：请注意，使用 `subPath` 卷挂载的容器不会在
    底层 ConfigMap 或 Secret 被修改时自动接收配置更新；
    必须手动重启 Pod 才能应用更改。
-   **StorageClass 选择**：在 PersistentVolumeClaim 中使用正确的 GKE
    存储类：
    -   *CSI 驱动程序集群（Autopilot 和现代 Standard）*：使用 `standard-rwo`
        （默认平衡型 PD）或 `premium-rwo`（SSD PD）。
    -   *旧版 Standard 集群*：如果未配置 `standard-rwo`/`premium-rwo`，
        则使用 `standard`（默认 PD）或 `premium`
        （SSD PD）。
    -   *数据库规则*：仅当提示明确要求高 IOPS、低延迟或
        数据库存储时，才使用 SSD 存储类（`premium-rwo` 或 `premium`）。

### 7. GKE 上的高可用性

-   **拓扑分布**：对于副本数 >1 的 Deployment，使用 `podAntiAffinity`
    或 `topologySpreadConstraints`，并设置 `topologyKey: "kubernetes.io/hostname"`，
    以将 Pod 分布到不同的 GKE 节点和可用区。
-   **PodDisruptionBudget**：对于副本数 >1 的 Deployment，声明
    `PodDisruptionBudget`，以保证在 GKE 节点自愿升级和维护周期期间
    的最低副本可用性。

### 8. 更新与服务端应用协调

-   **稳定的列表键**：在 Kubernetes Server-Side Apply (SSA) 中，关联列表（例如卷、卷挂载、端口和容器定义）中的元素会根据其唯一标识键（通常为 `name`）进行匹配和合并。修改现有列表项的属性时，**必须**保持 `name` 键稳定。重命名 `name` 键会导致 SSA 创建一个全新的条目，并保留旧条目不变（成为孤立条目），而不是对其进行修改。
-   **最小差异**：仅进行所请求的更改。严格遵循现有的标签、注解和约定。

--------------------------------------------------------------------------------

## 专用工作负载：GKE AI/推理服务（vLLM、TGI 等）

对于模型服务工作负载，应优先使用 GKE Inference Quickstart 等优化工具（如果可用）。如果手动生成：

1.  **GPU 请求与分配**：
    -   始终在 `requests` 和 `limits` 中请求 `nvidia.com/gpu`。
    -   添加一个 `nodeSelector` 或节点亲和性，目标为所需的 GKE 加速器标签（例如 `cloud.google.com/gke-accelerator: nvidia-l4`）。
2.  **共享内存扩容**：
    -   模型服务器需要较大的共享内存（`/dev/shm`）来进行进程间通信。始终声明一个设置了 `medium: Memory` 的 `emptyDir` 卷，并将其挂载到 `/dev/shm`。
3.  **权重加载优化**：
    -   使用 GKE GCS Fuse CSI 驱动程序（`csi.storage.gke.io`）挂载模型权重目录（例如 GCS 存储桶），并设置为 `readOnly: true`，以实现高效的冷启动。

--------------------------------------------------------------------------------

## 工具使用与依据准则

生成清单时，应利用以下工具来减少幻觉并优化配置：

1.  **推理工作负载（GKE Inference Quickstart CLI）**：

    -   确保已安装
        [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)。
    -   对于所有 AI/LLM 推理工作负载（例如模型服务），**必须**优先使用 `gcloud` CLI 的 GKE Inference Quickstart 命令生成优化后的清单，而不是手动编写：

        ```bash
        gcloud container ai profiles manifests create \
          --model={model_name} \
          --model-server={server_name} \
          --accelerator-type={accelerator_type} \
          --output=manifest \
          --output-path={output_file_path}
        ```

    -   *约束*：必须包含此命令返回的所有资源（Deployments、Services、PodMonitoring 等），不得过滤。

2.  **以官方文档为依据（Developer Knowledge API）**：

    -   对于 GKE 特定功能、API 默认值、清单示例或安全上下文，**必须**查询 Google 的开发者知识库，以获取官方 GKE 文档：
        -   **`answer_query`**：使用此工具提出直接问题（例如，*"如何在 GKE 中配置 GCS Fuse CSI 驱动程序"*）。这是一般查询的首选工具。
        -   **`search_documents`**：当没有具体问题时，使用此工具搜索相关的 GKE 指南或示例。
        -   **`get_document`**：当已有特定文档 ID 时，使用此工具获取完整的文档内容。

--------------------------------------------------------------------------------

## 参考示例

有关详细的、可用于生产环境的清单模板，请参阅以下参考指南：

-   **[基础加固型 Nginx 工作负载](references/basic-workload.md)**：
    可用于生产环境的部署，包含专用服务账号、安全上下文、探针、反亲和性和 PodDisruptionBudget。
-   **[网络策略](references/network-policy.md)**：默认拒绝入站流量的网络策略，以及针对特定应用的选择性入站流量放行。
-   **[AI/LLM 推理工作负载](references/ai-inference.md)**：GPU 资源分配、Workload Identity、GCS FUSE CSI 驱动挂载、`/dev/shm`
    共享内存扩容以及启动探针。
-   **[GKE Gateway API 路由](references/gateway-api.md)**：使用 GKE L7 Gateway API（`Gateway` 和 `HTTPRoute` 资源）公开工作负载。