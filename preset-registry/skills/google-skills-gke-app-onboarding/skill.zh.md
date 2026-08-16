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

本参考文档提供了首次将应用容器化并部署到 GKE 的工作流。

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
-   **健康检查端点**：应用是否公开健康检查端点？

### 2. 容器化

创建容器镜像：

**Dockerfile（推荐用于大多数应用）：**

```dockerfile
# Multi-stage build for smaller, more secure images
FROM golang:1.22 AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 go build -o server .

FROM gcr.io/distroless/static:nonroot
COPY --from=builder /app/server /server
USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/server"]
```

**最佳实践：**

-   使用多阶段构建，使生产镜像保持精简
-   使用 distroless 或精简基础镜像以减少攻击面
-   以非 root 用户身份运行
-   将日志输出到 `stdout` 和 `stderr`，以便 Cloud Logging 收集

对于不希望编写 Dockerfile 的应用，可以使用
[**Cloud Native Buildpacks**](https://buildpacks.io/) 自动检测
语言并构建容器镜像：

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

**漏洞扫描**：在 Artifact Registry 中启用自动扫描，以
检测基础镜像和依赖项中的问题。

```bash
# Check scan results
gcloud artifacts docker images describe \
  <REGION>-docker.pkg.dev/<PROJECT>/<REPO>/<IMAGE>:<TAG> \
  --show-package-vulnerability \
  --quiet
```

### 4. 清单生成

为应用生成 Kubernetes 清单：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app
        image: <REGION>-docker.pkg.dev/<PROJECT>/<REPO>/<IMAGE>:<TAG>
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: "250m"
            memory: "256Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"
        livenessProbe:
          httpGet:
            path: /healthz
            port: 8080
          initialDelaySeconds: 10
        readinessProbe:
          httpGet:
            path: /readyz
            port: 8080
          initialDelaySeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: my-app
spec:
  selector:
    app: my-app
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP
```

**清单文件检查项：**

-   已设置资源请求和限制
-   已配置存活探针和就绪探针
-   生产环境至少使用 2 个副本
-   使用适当的 Service 类型（内部服务使用 ClusterIP，外部服务使用 Gateway API）

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

## 后续步骤

应用在 GKE 上运行后：

-   配置自动扩缩容——请参阅 `gke-workload-scaling` 技能
-   设置可观测性——请参阅 `gke-observability` 技能
-   加固安全性——请参阅 `gke-workload-security` 技能
-   配置可靠性（PDB、拓扑分布）——请参阅 `gke-reliability`
    技能