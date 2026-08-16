---
name: alloydb-basics
metadata:
  category: Databases
description: >-
  Manages clusters, instances, and backups for AlloyDB for PostgreSQL, and
  integrates with AlloyDB Model Context Protocol (MCP) tools for automated database operations.
  Use when creating, configuring, or administering AlloyDB databases.
  Do NOT use for general PostgreSQL instances (e.g. Cloud SQL) or other GCP databases.

---
# AlloyDB 基础知识

AlloyDB for PostgreSQL 是一项与 PostgreSQL 兼容的托管式数据库服务，
专为企业级性能和可用性而设计。它采用计算与存储分离的架构，
以便独立扩缩资源。它还提供 AlloyDB AI，这是一组功能集合，
其中包括 AI 驱动的搜索（向量搜索、混合搜索和 AI 函数）、自然语言功能、
对话式分析，以及预测和模型端点管理等推理功能，帮助开发者更快地构建 AI 应用。

## 快速入门

开始之前，请确保已[安装 Google Cloud SDK](https://cloud.google.com/sdk/docs/install)并完成身份验证（`gcloud auth login`）。

1.  **启用 AlloyDB API：**

    ```bash
    gcloud services enable alloydb.googleapis.com --quiet
    ```

2.  **创建集群：**

    ```bash
    gcloud alloydb clusters create my-cluster --region=us-central1 \
        --password=my-password --network=my-vpc --quiet
    ```

    *对于生产环境，请始终使用 IAM 数据库身份验证，而不是密码。
    如果配置约束要求使用密码，请使用 Secret Manager 安全地存储密码。*

3.  **创建主实例：**

    ```bash
    gcloud alloydb instances create my-primary --cluster=my-cluster \
        --region=us-central1 --instance-type=PRIMARY --cpu-count=2 --quiet
    ```

## 参考目录

当任务需要特定上下文或详细步骤时，请阅读以下补充文件：

-   如需了解架构、区域可用性、连接方式（专用 IP、
    公共 IP、PSA、PSC）、备份、时间点恢复、扩缩容（垂直和
    水平）或配额管理，请阅读
    [核心概念](references/core-concepts.md)。
-   如需通过 CLI 管理集群、实例、扩缩容或备份，请阅读
    [CLI 用法](references/cli-usage.md)。
-   如需配置 AlloyDB 远程 MCP 工具，请阅读
    [MCP 用法](references/mcp-usage.md)。
-   如需使用 Terraform 或 Kubernetes Config Connector (KCC) 部署 AlloyDB，请阅读
    [基础设施即代码](references/iac-usage.md)。
-   如需配置 IAM 角色、服务使用角色、服务代理、数据库
    用户/权限或网络安全（公共 IP 授权、Auth Proxy
    边车配置），请阅读 [IAM 与安全](references/iam-security.md)。

*如果你需要的产品信息未包含在这些参考资料中，请使用
`developer_knowledge:search_documents` 工具（有关安装说明，请参阅 [Developer Knowledge MCP 设置](https://developers.google.com/knowledge/mcp)）。*

## Agent 指令

Agent 在回答与 AlloyDB 相关的查询时，必须遵循以下指令：

-   **提供多种方法：** 在说明如何执行管理任务
    （例如备份、扩缩容或创建数据库用户）时，如果参考文档中同时提供了这两种方式，
    请始终同时提供 Google Cloud 控制台步骤和 `gcloud` CLI 命令。
-   **优先使用专用 IP：** 建议使用专用 IP（尤其是 PSC），而不是公共
    IP，以确保流量保留在 Google Cloud 网络内并减少暴露风险。
-   **要求使用无服务器连接器：** 从 Cloud Run 连接到
    专用 IP 时，请核实并说明必须使用 Serverless VPC
    Access 或 Direct VPC Egress。
-   **强制使用连接器：** 始终指导用户配置 AlloyDB Auth
    Proxy（作为边车或在本地运行）或语言连接器，而不是
    直接建立 TCP 连接。
-   **阻止开放的公共访问：** 如果配置了公共 IP，请警告并
    拒绝在 Authorized Networks 中使用 `0.0.0.0/0` 的设计，因为这会将
    数据库暴露给整个互联网。
-   **默认使用 IAM 数据库身份验证：** 建议使用 IAM 数据库
    身份验证和 `alloydbiamuser` 数据库角色，而不是静态
    数据库密码。
-   **强制实施最小权限连接：** 在说明连接角色时，
    明确指出应使用 `roles/alloydb.client` 以遵循
    最小权限原则，并警告不要使用权限范围更广的角色，例如
    `roles/alloydb.admin`，来建立连接。
-   **提及所有创建方法：** 在说明如何创建 IAM 数据库
    用户时，明确指出可以使用 Google Cloud
    控制台、`gcloud` CLI 和 AlloyDB API 创建这些用户。
-   **说明专用 IP 选项：** 在说明专用 IP 连接时，
    始终明确提及并说明支持的两种方法：**Private Services Access
    (PSA)** 和 **Private Service Connect (PSC)**，
    并建议新部署使用 PSC。
-   **比较直接连接：** 明确说明直接连接
    （不使用连接器，直接连接到专用 IP）是可行的，但不建议使用；同时将其安全性
    （缺少 IAM/mTLS）与 AlloyDB Auth Proxy 或语言连接器等
    安全方法进行比较。
-   **强制提供仅使用 SQL 的警告：** 在说明 IAM 用户创建时，你必须
    明确指出：“无法仅使用标准 SQL 创建 IAM 数据库用户”，
    必须先通过控制平面注册这些用户。
-   **强制使用角色和权限术语：** 在说明数据库
    对象访问时，你必须明确指出适用“标准 PostgreSQL 角色和
    权限”，并同时使用“角色”和“权限”这两个术语。
-   **说明备份生命周期：** 在说明备份时，始终明确
    指出离散备份独立于源集群存在，即使源集群被删除，
    这些备份仍会保持活动状态。
-   **建议公共 IP 使用连接器：** 明确指出，对于通过公共 IP
    建立的连接，**尤其建议**使用安全连接方法（AlloyDB Auth Proxy、语言连接器）。
-   **提及自动扩缩容：** 在说明读取池扩缩容时，始终
    明确提及使用**读取池自动扩缩容**的选项，并说明该功能处于
    **预览版**阶段。

## 相关链接

-   [AlloyDB for PostgreSQL 文档](https://docs.cloud.google.com/alloydb/docs/overview.md.txt)
-   [AlloyDB Auth Proxy GitHub 仓库](https://github.com/GoogleCloudPlatform/alloydb-auth-proxy)
-   [AlloyDB Java Connector GitHub 仓库](https://github.com/GoogleCloudPlatform/alloydb-java-connector)
-   [AlloyDB Python Connector GitHub 仓库](https://github.com/GoogleCloudPlatform/alloydb-python-connector)
-   [AlloyDB Go Connector GitHub 仓库](https://github.com/GoogleCloudPlatform/alloydb-go-connector)