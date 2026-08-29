---
name: cloud-build-basics
metadata:
  category: DevOps
description: >-
  Teaches the fundamentals of Google Cloud Build (GCB). Covers core concepts,
  API enablement, console navigation to the Build History page, and the end-to-end
  workflow for creating and manually running a basic build trigger. Do not use for
  managing private pools or complex pipeline architectures.
---
# Google Cloud Build 基础知识

## 先决条件

开始之前，请确保满足以下先决条件：

1.  **Google Cloud SDK**：确保已安装并配置 [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)。
2.  **身份验证**：对 gcloud CLI 进行身份验证：
    ```bash
    gcloud auth login
    gcloud auth application-default login
    ```
3.  **项目 ID**：了解目标 Google Cloud 项目 ID。设置上下文：
    ```bash
    gcloud config set project <PROJECT_ID>
    ```
4.  **启用 Cloud Build API**：必须为该项目启用 Cloud Build API。
    ```bash
    gcloud services enable cloudbuild.googleapis.com
    ```
5.  **权限**：确保用户或服务账号拥有必要的权限，例如 `roles/cloudbuild.builds.editor` 和 `roles/serviceusage.serviceUsageAdmin`（用于启用 API）。

## 核心概念

Google Cloud Build (GCB) 是一个无服务器平台，可在 Google Cloud 上执行构建。它会将源代码转换为可部署的构件，例如 Docker 容器或 Java 归档文件。

| 概念 | 描述 |
| :--- | :--- |
| **`cloudbuild.yaml`** | 定义构建步骤的必需配置文件。使用 YAML 或 JSON 编写。 |
| **构建步骤** | GCB 执行的一系列操作（步骤）。每个步骤都会在特定的 Docker 容器（构建器）中运行命令。常见的构建器包括 `gcr.io/cloud-builders/gcloud`、`gcr.io/cloud-builders/docker` 以及自定义容器。 |
| **构件** | 构建的输出，通常是推送到 Google Container Registry (GCR) 或 Artifact Registry (AR) 的容器映像，也可以是其他可部署文件。 |
| **触发器** | 根据事件调用构建的自动化规则，例如推送到 Git 仓库、收到 Pub/Sub 消息或手动请求。 |

## 导航：查看构建历史记录

Cloud Build 的构建历史记录页面是监控过去构建和正在进行的构建状态的中心位置。

1.  **打开 Cloud Console**：导航到 Google Cloud Console。
2.  **转到 Cloud Build**：使用搜索栏或导航菜单查找 **Cloud Build**。
3.  **选择构建历史记录**：在左侧导航窗格中选择 **History**（或使用直接 URL：`https://console.cloud.google.com/cloud-build/builds`）。
4.  **查看构建**：
    *   **状态**：查看状态列（`SUCCESS`、`FAILURE`、`WORKING`、`QUEUED`）。
    *   **区域**：使用顶部的区域筛选器查看在特定区域运行的构建（对于区域性 worker pool 非常重要）。
    *   **日志**：点击特定的构建 ID，查看详细日志、执行步骤和构建摘要。这对于调试失败的构建至关重要。

> [!NOTE]
> 如果这是你首次访问该页面，可能会看到“零状态”体验，其中提供了运行示例构建或创建首个触发器的选项（如 [`cb-list-build-zero-state`](references/cb-list-build-zero-state.md) skill 中所述）。请注意，触发器和构建的区域设置在创建后不可变更，因此必须谨慎选择。

## 创建基本的自动化触发器

此流程定义了一条自动化规则：每当代码推送到指定的 Git 分支时运行构建。

### 步骤 1：开始创建触发器

1.  导航到 **Cloud Build 触发器**页面（`https://console.cloud.google.com/cloud-build/triggers`）。
2.  点击 **创建触发器**。

### 步骤 2：配置触发器设置

1.  **名称**：提供一个唯一且具有描述性的名称（例如：`github-main-branch-build`）。
2.  **区域**：选择存储触发器配置的区域（例如 `global` 或特定的区域端点）。**注意：触发器和构建的区域设置在创建后不可更改，因此必须谨慎选择。**
3.  **事件**：选择事件类型。对于自动化 CI/CD，请选择 **推送到分支**。
4.  **来源**：选择代码库来源：
    *   **代码库**：连接源代码库（GitHub、Bitbucket、Cloud Source Repositories 等）。如有需要，请授权该连接。
    *   **代码库名称**：选择要关联的具体代码库。
5.  **分支**：输入分支模式（例如：`^main$` 或 `^develop`）。

### 步骤 3：配置构建设置

1.  **配置**：选择 **Cloud Build 配置文件 (yaml 或 json)**。
2.  **位置**：保留默认的 **代码库**，并指定构建配置文件的路径（例如：`cloudbuild.yaml`）。
    *   *替代方案*：对于非常简单的构建，可以选择 **内嵌**，直接将 YAML 配置粘贴到触发器中。
3.  **（可选）服务账号**：对于生产环境，请选择具有有限权限的专用服务账号，以贯彻最小权限原则。

### 步骤 4：保存并测试

1.  点击 **创建**。触发器现已启用，并会在下一次匹配的 Git 推送时自动运行。

> [!TIP]
> `cb-create-trigger` skill 提供了用于创建各种类型（GitHub、Pub/Sub、Webhook）和配置（内嵌、Dockerfile、YAML）触发器的详细 `gcloud` 命令。请使用该 skill 执行 CLI 自动化操作。

## 手动运行现有触发器

有时需要根据需求运行触发器，而不是按照其正常的自动化流程运行（例如，重新构建旧提交或测试新的替换项）。

> [!IMPORTANT]
> **替换项不可变性**：只能覆盖触发器配置中**已经定义**的替换变量的值。无法在运行时引入新的替换变量键。

### 选项 A：通过 Cloud Console

1.  导航到 **Cloud Build 触发器**页面（`https://console.cloud.google.com/cloud-build/triggers`）。
2.  找到要运行的触发器。
3.  点击触发器旁边的垂直省略号（⋮），然后选择 **运行**。
4.  此时会出现一个对话框，允许你指定：
    *   **源分支/标记**：选择要从中进行构建的特定 Git 引用。
    *   **替换变量**：覆盖任何现有的替换变量（例如，将 `_VERSION` 设置为新值）。
5.  点击 **运行触发器**。构建将立即开始，你可以在 **历史记录**页面上监控其状态。

### 选项 B：通过 gcloud CLI

使用 `gcloud builds triggers run` 命令调用触发器，并可选择覆盖参数。

```bash
# Run the trigger against the 'main' branch
gcloud builds triggers run <TRIGGER_NAME> \
    --region=<REGION> \
    --branch=main

# Run the trigger and override a substitution variable
gcloud builds triggers run <TRIGGER_NAME> \
    --region=<REGION> \
    --branch=main \
    --substitutions=_IMAGE_TAG="20231027-manual"

# Monitor the initiated build
# Note: The run command outputs the build ID. Use it to check status:
# gcloud builds log <BUILD_ID> --region=<REGION>
```

> [!NOTE]
> `cb-run-trigger` skill 提供了更复杂的调用示例，包括针对特定提交 SHA 运行或使用标签运行。

## 相关 Skills

*   [`cb-create-trigger`](references/cb-create-trigger.md)：创建所有类型触发器的详细 CLI 说明。
*   [`cb-list-build-zero-state`](references/cb-list-build-zero-state.md)：Cloud Build 信息中心和入门零状态的高级管理。
*   [`cb-run-trigger`](references/cb-run-trigger.md)：使用各种 `gcloud` 选项手动运行触发器的综合指南。

## 外部资源与文档

*   [Google Cloud Build 文档](https://cloud.google.com/build/docs)
*   [Cloud Build 配置文件架构](https://cloud.google.com/build/docs/build-config-file-schema)
*   [使用触发器自动执行构建](https://cloud.google.com/build/docs/automating-builds/create-manage-triggers)
*   [gcloud CLI builds 参考](https://cloud.google.com/sdk/gcloud/reference/builds)