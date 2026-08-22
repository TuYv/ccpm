---
name: gke-app-onboarding
description: >-
  Manages GKE application onboarding, covering containerization, deployment
  manifests, and migration. Use when onboarding or deploying an application to
  GKE for the first time, or containerizing an app for GKE. Don't use for
  general GKE cluster administration or upgrades (use gke-basics or
  gke-upgrades instead).
metadata:
  category: Containers
---
# GKE 应用接入

本参考文档提供首次将应用容器化并部署到 GKE 的工作流。

> **MCP 工具：** `apply_k8s_manifest`、`get_k8s_resource`、
> `get_k8s_rollout_status`、`get_k8s_logs`、`describe_k8s_resource`

## 工作流

### 1. 应用评估

在进行容器化之前，请评估应用：

-   **语言和框架**：确定技术栈
-   **依赖项**：列出所需的库和外部服务
-   **配置**：应用如何配置？（环境变量、配置文件、密钥）
-   **有状态性**：是否需要持久化存储？（数据库、文件存储）
-   **网络**：端口映射和协议（HTTP、gRPC、TCP）
-   **健康检查端点**：应用是否提供健康检查端点？

### 2. 容器化

创建容器镜像。对于大多数应用，建议使用采用多阶段构建的 Dockerfile——有关完整示例，请参阅
[`references/go-example.md`](./references/go-example.md) 中的 Go Dockerfile。

**最佳实践：**

-   使用多阶段构建以减小生产镜像的体积
-   使用 distroless 或精简基础镜像以缩小攻击面
-   以非 root 用户身份运行
-   将日志输出到 `stdout` 和 `stderr`，以便 Cloud Logging 收集

[`assets/`](./assets/) 中提供了一个完整的 Node.js 示例：
[`Dockerfile`](./assets/Dockerfile)（使用非 root `node` 用户）、
[`index.js`](./assets/index.js)（实现相互独立的 `/healthz` 和 `/readyz`
端点）、[`package.json`](./assets/package.json)，以及
[`deployment.yaml`](./assets/deployment.yaml)（经过安全加固的 Deployment 和
ClusterIP Service，探针分别连接到 `/healthz` 和 `/readyz`）。

对于不希望编写 Dockerfile 的应用，可以使用
[**Cloud Native Buildpacks**](https://buildpacks.io/) 自动检测语言并构建容器镜像：

```bash
pack build <image> --builder gcr.io/buildpacks/builder:latest
```

### 3. 镜像管理

构建并存储容器镜像：

```bash
# Configure Docker for Artifact Registry
gcloud auth configure-docker <REGION>-docker.pkg.dev --quiet

# Build and push
docker build -t <REGION>-docker.pkg.dev/<PROJECT>/<REPO>/<IMAGE>:<TAG> .
docker push <REGION>-docker.pkg.dev/<PROJECT>/<REPO>/<IMAGE>:<TAG>
```

**漏洞扫描**：在 Artifact Registry 中启用自动扫描，以检测基础镜像和依赖项中的问题。

```bash
# Check scan results
gcloud artifacts docker images describe \
  <REGION>-docker.pkg.dev/<PROJECT>/<REPO>/<IMAGE>:<TAG> \
  --show-package-vulnerability \
  --quiet
```

### 4. 清单生成

为应用生成 Kubernetes 清单。[`references/go-example.md`](./references/go-example.md)
中提供了一个基准 Deployment + ClusterIP Service 清单（包含探针、资源请求/限制和 2 个副本）。

**清单检查表：**

-   已设置资源请求和限制
-   已配置存活探针和就绪探针
-   生产环境至少使用 2 个副本
-   使用适当的 Service 类型（内部访问使用 ClusterIP，外部访问使用 Gateway API）

请参阅 [`assets/deployment.yaml`](./assets/deployment.yaml)，其中提供了一个经过安全加固的完整示例。生产级安全加固的 Pod 规范必须包含以下**全部**配置：`runAsNonRoot:
true`、`readOnlyRootFilesystem: true`、`allowPrivilegeEscalation: false`、
`capabilities.drop: ["ALL"]`、`seccompProfile: {type: RuntimeDefault}`、
`automountServiceAccountToken: false`（除非 Pod 需要该令牌——在这种情况下，请说明
原因）、资源请求、通过摘要固定的镜像，以及 ClusterIP 服务。

该检查清单是此处生成任何 Pod 规范时必须遵循的基准。对于超出此范围的清单工作
——Gateway API 路由、GCS FUSE 和 Secret 卷挂载、`subPath`
叠加、Spot VM 定向，或 AI/推理服务规范——请参阅
`gke-manifest-generation`。

### 5. 部署

```
# MCP (preferred)
apply_k8s_manifest(parent="projects/<PROJECT>/locations/<REGION>/clusters/<CLUSTER>", yamlManifest="<manifest>")

# Verify
get_k8s_rollout_status(parent="...", resourceType="deployment", name="my-app")
get_k8s_resource(parent="...", resourceType="pod", labelSelector="app=my-app")
```

**kubectl 备用方案：**

```bash
kubectl apply -f manifests/
kubectl rollout status deployment/my-app
kubectl get pods -l app=my-app
```

## 黄金路径接入检查清单

对于每个接入 GKE 的生产应用：

1.  **容器安全**：非 root 用户（`runAsNonRoot: true`）、使用锁文件
    安装、最小化/distroless 基础镜像。
2.  **资源请求**：明确指定 CPU 和内存请求（GKE
    Autopilot 强制要求）。
3.  **健康探针**：同时配置存活探针（`livenessProbe`）和就绪
    探针（`readinessProbe`）。
4.  **可靠性与可用性**：至少 2 个副本，以及一个
    `PodDisruptionBudget`（`minAvailable: 1` 或 `2`）。
5.  **IAM 与 Workload Identity**：使用 Workload Identity
    （`iam.gke.io/gcp-service-account`），而不是静态服务账号密钥。

## 后续步骤

应用在 GKE 上运行后：

-   配置自动扩缩容——请参阅 `gke-workload-scaling` Skill
-   设置可观测性——请参阅 `gke-observability` Skill
-   强化安全性——请参阅 `gke-workload-security` Skill
-   配置可靠性（PDB、拓扑分布）——请参阅 `gke-reliability`
    Skill