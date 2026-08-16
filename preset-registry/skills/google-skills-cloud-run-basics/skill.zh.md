---
name: cloud-run-basics
metadata:
  category: Serverless
description: >-
  Manages Cloud Run services, jobs, and worker pools. Use when you need to deploy applications
  responding to HTTP requests (services), run event-triggered or scheduled tasks (jobs),
  or handle always-on pull-based background processing (worker pools).
---
# Cloud Run 基础知识

Cloud Run 是一个完全托管的应用平台，用于在 Google 高度可扩展的基础设施上运行代码、函数或容器。它将基础设施管理抽象化，并提供三种主要资源类型：

1.  **服务：** 响应发送到唯一且稳定的端点的 HTTP 请求，使用无状态实例，并根据各种关键指标自动扩缩容；也可响应事件和函数调用。
2.  **作业：** 执行可并行化的任务，这些任务可手动执行或按计划执行，并持续运行直至完成。
3.  **工作器池：** 处理始终运行的后台工作负载，例如基于拉取的工作负载，包括 Kafka 使用方、Pub/Sub 拉取队列或 RabbitMQ 使用方。

## 前提条件

1.  启用 Cloud Run Admin API 和 Cloud Build API：

    ```bash
    gcloud services enable run.googleapis.com cloudbuild.googleapis.com --quiet
    ```

1.  如果您受某项网域限制组织政策约束，该政策会[限制](https://docs.cloud.google.com/organization-policy/restrict-domains.md.txt)
   项目接受未经身份验证的调用，则需要按照[测试私有
    服务](https://docs.cloud.google.com/run/docs/triggering/https-request.md.txt)中的说明访问已部署的服务。

### 所需角色

您需要以下角色才能部署 Cloud Run 资源：

*   项目的 Cloud Run Admin (`roles/run.admin`)
*   项目的 Cloud Run Source Developer (`roles/run.sourceDeveloper`)
*   服务身份的 Service Account User (`roles/iam.serviceAccountUser`)
*   项目的 Logs Viewer (`roles/logging.viewer`)

除非您覆盖此行为，否则 Cloud Build 会自动使用 Compute Engine 默认服务账号作为默认 Cloud Build 服务账号，以构建源代码和 Cloud Run 资源。

要让 Cloud Build 构建源代码，请向 Cloud Build 服务账号授予项目的 Cloud Run Builder (`roles/run.builder`) 角色：

```bash
gcloud projects add-iam-policy-binding PROJECT_ID \
    --member=serviceAccount:SERVICE_ACCOUNT_EMAIL_ADDRESS \
    --role=roles/run.builder \
    --quiet
```

将 `PROJECT_ID` 替换为您的 Google Cloud 项目 ID，并将
`SERVICE_ACCOUNT_EMAIL_ADDRESS` 替换为 Cloud Build 服务账号的电子邮件地址。

## 部署 Cloud Run 服务

您可以使用容器映像将服务部署到 Cloud Run，也可以使用一条 Google Cloud CLI 命令直接从源代码部署。

> **关键规则：** 所有已部署的代码都必须监听 0.0.0.0（而不是 127.0.0.1），
> 并使用注入的 $PORT 环境变量（默认为 8080），否则将在启动时崩溃。

### 将容器映像部署到 Cloud Run

Cloud Run 会在部署期间导入您的容器映像。只要某个正在提供服务的修订版本仍在使用该容器映像，Cloud Run 就会保留其副本。启动新的 Cloud Run 实例时，不会从容器代码库拉取容器映像。

### 支持的容器映像

你可以直接使用存储在 [Artifact
Registry](https://docs.cloud.google.com/artifact-registry/docs/overview.md.txt) 或
[Docker Hub](https://hub.docker.com/) 中的容器映像。Google 建议使用 Artifact
Registry，因为 Docker Hub 映像会被
[缓存](https://docs.cloud.google.com/artifact-registry/docs/pull-cached-dockerhub-images.md.txt)
最多一小时。

你可以使用来自其他公共或私有注册表（如 JFrog
Artifactory、Nexus 或 GitHub Container Registry）的容器映像，方法是设置一个 [Artifact
Registry 远程
代码库](https://docs.cloud.google.com/artifact-registry/docs/repositories/remote-repo.md.txt)。

只有在部署热门容器映像（例如 [Docker 官方
映像](https://docs.docker.com/docker-hub/official_images/) 或 [Docker
赞助的开源软件映像](https://docs.docker.com/docker-hub/dsos-program/)）时，才应考虑使用
[Docker Hub](https://hub.docker.com/)。为获得更高的可用性，Google 建议使用
[Artifact Registry 远程
代码库](https://docs.cloud.google.com/artifact-registry/docs/repositories/remote-repo.md.txt)
部署这些 Docker Hub 映像。

要部署容器映像，请运行以下命令：

```bash
    gcloud run deploy SERVICE_NAME \
        --image IMAGE_URL \
        --region us-central1 \
        --allow-unauthenticated \
        --quiet
```

替换以下内容：

*   SERVICE_NAME：要部署到的服务名称。服务名称必须不超过 49 个字符，并且在每个区域和项目中必须唯一。如果
    服务尚不存在，此命令会在部署期间创建该服务。你可以完全省略此参数，但如果省略，
    系统会提示你输入服务名称。
*   IMAGE_URL：容器映像的引用，例如
    `us-docker.pkg.dev/cloudrun/container/hello:latest`。如果你使用 Artifact
    Registry，则必须已创建代码库 REPO_NAME。该 URL 遵循
    `LOCATION-docker.pkg.dev/PROJECT_ID/REPO_NAME/PATH:TAG` 格式。请注意，
    如果未提供 `--image` 标志，deploy 命令将尝试从源代码进行部署。

### 从源代码部署

可以通过两种不同的方式从源代码部署服务：

*   通过构建从源代码部署（默认）：此选项使用 Google Cloud 的
    buildpacks 和 Cloud Build 自动从源代码构建容器映像，无需在计算机上安装 Docker，也无需设置
    buildpacks 或 Cloud Build。默认情况下，Cloud Run 使用 Cloud Build 提供的默认机器
    类型。

    *   要从源代码部署并启用基础映像自动更新，请运行以下
        命令：

         ```bash
         gcloud run deploy SERVICE_NAME --source . \
         --base-image BASE_IMAGE \
         --automatic-updates \
         --quiet
         ```

        Cloud Run 仅支持使用 [Google Cloud 的
        buildpacks 基础
        映像](https://docs.cloud.google.com/docs/buildpacks/base-images.md.txt)的自动基础映像更新。

*   要使用 Dockerfile 从源代码部署，请运行以下命令：

         ```bash
          gcloud run deploy SERVICE_NAME --source . --quiet
         ```
            当您提供 Dockerfile 时，Cloud Build 会在云端运行该文件，并
            部署服务。

*   从源代码部署而不进行构建（预览版）：此选项会将制品
    直接部署到 Cloud Run，绕过 Cloud Build 步骤。这样可以缩短
    部署时间。要从源代码部署而不进行构建，请运行以下
    命令：

    ```bash
    gcloud beta run deploy SERVICE_NAME \
     --source APPLICATION_PATH \
     --no-build \
     --base-image=BASE_IMAGE \
     --command=COMMAND \
     --args=ARG \
     --quiet
    ```

    替换以下内容：

    *   SERVICE_NAME：Cloud Run 服务的名称。
    *   APPLICATION_PATH：应用在本地文件
        系统中的位置。
    *   BASE_IMAGE：您希望用于应用的[运行时基础映像](https://docs.cloud.google.com/run/docs/configuring/services/runtime-base-images.md.txt)。
    例如，
        `us-central1-docker.pkg.dev/serverless-runtimes/google-24-full/runtimes/nodejs24`。
        您还可以使用仅含操作系统的基础映像（例如
    `osonly24`）部署预编译的二进制文件，而无需配置其他
        特定于语言的运行时组件。
    *   COMMAND：容器启动时使用的命令。
    *   ARG：发送给容器命令的参数。如果使用多个
    参数，请将每个参数分别指定在单独一行中。

    有关从源代码部署而不进行构建的示例，请参阅[从源代码部署而不进行
        构建的
        示例](https://docs.cloud.google.com/run/docs/deploying-source-code.md.txt)。

## 创建并执行 Cloud Run 作业

要创建新作业，请运行以下命令：

```bash
gcloud run jobs create JOB_NAME --image IMAGE_URL OPTIONS --quiet
```

或者，使用 deploy 命令：

```bash
gcloud run jobs deploy JOB_NAME --image IMAGE_URL OPTIONS --quiet
```

替换以下内容：

*   JOB_NAME：要创建的作业名称。如果省略此
    参数，运行命令时系统将提示您输入作业名称。
*   IMAGE_URL：容器映像的引用，例如
    `us-docker.pkg.dev/cloudrun/container/job:latest`。

*   或者，将 OPTIONS 替换为以下任一标志：

    *   `--tasks`：接受大于或等于 1 的整数。默认值为 1；
        最大值为 10,000。每个任务都会获得环境变量
        `CLOUD_RUN_TASK_INDEX`，其值介于 0 和任务数
        减 1 之间，同时还会获得 `CLOUD_RUN_TASK_COUNT`，其值为
        任务数。
    *   `--max-retries`：失败任务的重试次数。一旦任何
        任务失败次数超过此限制，整个作业就会被标记为失败。例如，
        如果设置为 1，失败的任务将重试一次，总共
        尝试两次。默认值为 3。接受 0 到 10 之间的整数。
    *   `--task-timeout`：接受类似 "2s" 的时长。默认值为 10 分钟；
        最大值为 168 小时（7 天）。对于使用 GPU 的任务，最大
        可用超时时间为 1 小时。
    *   `--parallelism`：可并行执行的最大任务数。
        默认情况下，任务将尽可能快地并行
        启动。
    *   --execute-now：如果设置，则在作业创建后立即启动一次作业
        执行。等同于先调用 `gcloud run jobs create`，
        再调用 `gcloud run jobs execute`。

除上述选项外，你还可以指定更多配置，
    例如环境变量或内存限制。

如需查看创建作业时可用选项的完整列表，请参阅 [`gcloud
run jobs
create`](https://docs.cloud.google.com/sdk/gcloud/reference/run/jobs/create)
命令行文档。

等待作业创建完成。成功完成后，你将看到一条成功消息。

要执行现有作业，请运行以下命令：

```bash
gcloud run jobs execute JOB_NAME --quiet
```

如果希望该命令等待执行完成，请运行以下命令：

```bash
gcloud run jobs execute JOB_NAME --wait --region=REGION --quiet
```

请替换以下内容：

*   JOB_NAME：作业的名称。
*   REGION：可找到该资源的区域。例如，
    `europe-west1`。或者，设置 `run/region` 属性。

## 部署工作器池

你可以使用容器映像部署 Cloud Run 工作器池，也可以直接
从源代码部署。

### 部署容器映像

你可以指定带有标记的容器映像（例如，
`us-docker.pkg.dev/my-project/container/my-image:latest`），也可以指定带有确切
摘要的容器映像（例如，
`us-docker.pkg.dev/my-project/container/my-image@sha256:41f34ab970ee...`）。

### 支持的容器映像

你可以直接使用存储在 [Artifact
Registry](https://docs.cloud.google.com/artifact-registry/docs/overview.md.txt) 或
[Docker Hub](https://hub.docker.com/) 中的容器映像。Google 建议使用 Artifact
Registry，因为 Docker Hub 映像会被
[缓存](https://docs.cloud.google.com/artifact-registry/docs/pull-cached-dockerhub-images.md.txt)
长达一小时。

通过设置 [Artifact
Registry 远程
代码库](https://docs.cloud.google.com/artifact-registry/docs/repositories/remote-repo.md.txt)，
你可以使用来自其他公共或私有注册表（例如 JFrog
Artifactory、Nexus 或 GitHub Container Registry）的容器映像。

只有在部署热门容器映像（例如 [Docker 官方
映像](https://docs.docker.com/docker-hub/official_images/) 或 [Docker
赞助的 OSS 映像](https://docs.docker.com/docker-hub/dsos-program/)）时，才应考虑使用
[Docker Hub](https://hub.docker.com/)。为获得更高的可用性，Google 建议使用
[Artifact Registry 远程
代码库](https://docs.cloud.google.com/artifact-registry/docs/repositories/remote-repo.md.txt)
部署这些 Docker Hub 映像。

要部署容器映像，请运行以下命令：

```bash
gcloud run worker-pools deploy WORKER_POOL_NAME --image IMAGE_URL --quiet
```

请替换以下内容：

*   WORKER_POOL_NAME：要部署到的工作器池的名称。如果该
  工作器池尚不存在，此命令会在
    部署期间创建该工作器池。你可以完全省略此参数，但如果省略，
    系统会提示你输入工作器池名称。

*   IMAGE_URL：对包含工作器池的容器映像的引用，
    例如 `us-docker.pkg.dev/cloudrun/container/worker-pool:latest`。请注意，
    如果未提供 `--image` 标志，部署命令会尝试
    从源代码部署。

等待部署完成。成功完成后，Cloud Run 会显示成功消息，以及已部署工作器池的修订版本信息。

### 从源代码部署工作器池

你可以使用单条 gcloud CLI 命令，直接从源代码将新的工作器池或工作器池修订版本部署到 Cloud Run，即使用带有 `--source` 标志的 `gcloud run worker-pools` deploy。

如果不提供 `--image` 或 `--source` 标志，deploy 命令默认使用源代码部署。

在后台，此命令使用 [Google Cloud 的 buildpacks](https://docs.cloud.google.com/docs/buildpacks/overview.md.txt) 和 Cloud Build，自动从源代码构建容器映像，而无需在你的计算机上安装 Docker，也无需设置 buildpacks 或 Cloud Build。默认情况下，Cloud Run 使用 Cloud Build 提供的默认机器类型。

要从源代码部署工作器池，请运行以下命令：

```bash
gcloud run worker-pools deploy WORKER_POOL_NAME --source . --quiet
```

将 `WORKER_POOL_NAME` 替换为你希望用于工作器池的名称。

### 部署失败时的处理方法：

1.  **IAM/权限错误：**阅读
    [iam-security.md](references/iam-security.md)。
2.  **启动时崩溃/健康检查失败：**立即使用
    `gcloud logging read "resource.labels.service_name=SERVICE_NAME" --limit=20`
    获取日志，以查明确切的运行时错误。
3.  **原生依赖项错误 (Node/Python)：**如果正在使用 `--no-build`，请切换到
    `--source .` (Buildpacks)，以便为 Linux 正确编译原生扩展。

## 参考目录

-   [核心概念](references/core-concepts.md)：服务、作业和
    工作器池之间的区别，以及服务的资源模型和自动扩缩行为。

-   [CLI 用法](references/cli-usage.md)：用于部署和管理的基本 `gcloud run`
    命令。

-   [客户端库](references/client-library-usage.md)：使用 Google
    Cloud 客户端库与 Cloud Run 交互。

-   [MCP 用法](references/mcp-usage.md)：使用 Cloud Run 远程 MCP
    服务器。

-   [基础设施即代码](references/iac-usage.md)：服务、作业、工作器池和 IAM
    绑定的 Terraform 示例。

-   [IAM 与安全性](references/iam-security.md)：角色、服务身份以及入站/出站流量控制。

-   [网络最佳实践与成本优化](references/networking.md)：成本优化策略、Direct VPC
    出站流量、IP 地址和端口耗尽应对策略、性能吞吐量调优以及 MTU 设置。

*如果你需要这些参考资料中未包含的产品信息，请使用 Developer Knowledge MCP
    服务器的 `search_documents` 工具。*