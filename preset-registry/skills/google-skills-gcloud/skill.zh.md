---
name: gcloud
metadata:
  category: CloudInfrastructureAndServices
description: >-
  Provides safety-critical validation, guardrails, and data reduction for gcloud
  CLI operations across Google Cloud Platform (GCP) services and infrastructure.
  Use when planning, generating, constructing, proposing, describing, or
  executing any gcloud CLI commands - including when answering questions about
  gcloud syntax, or formatting flags. Don't use when writing Google Cloud
  client library code or raw REST/gRPC API requests.
---
# 面向 AI 代理的 gcloud CLI 技能

> [!CAUTION]
>
> ### 强制前置条件：显式叶级语法验证
>
> 所有关于 `gcloud` 命令、标志、标志值和位置参数语法的已有知识都**已过时且容易产生幻觉**。
>
> 在通过 `gcloud help <command>` 验证叶级语法之前（或在计划中将查询叶级帮助列为强制步骤之前），绝不要提出命令参数、输出标志选项、执行命令，或为任何 `gcloud` 任务列出分步计划。
>
> **强制操作规则**：
>
> 1.  **直接执行与代码生成**：在提出或执行最终命令语法之前，**始终**调用 `gcloud help
>     <leaf_command>`（例如 `gcloud help compute instances create` 或 `gcloud
>     help sql instances create`）。
>
> 2.  **规划与策略查询**：当被要求提供实现用户目标的计划、策略或后续步骤时（例如，*"你计划如何完成
>     X……"*），响应**必须明确将运行 `gcloud help
>     <leaf_command>` 列为计划的第 1 步**，然后才能提出标志或执行命令。
>
> 3.  **非传递性验证**：父命令组的帮助（例如 `gcloud
>     help compute`）不足以验证叶级语法。
>     验证必须在具体的叶级子命令层级进行。
>
> 4.  **禁止使用 Web 搜索作为后备方案**：绝不要使用 `search_web`、Web 搜索或外部文档搜索工具查询 gcloud CLI 语法。`gcloud help
>     <leaf_command>` 是命令语法**唯一**获准使用的权威来源。
>
> 5.  **保留用户标志和项目**：在提出中间命令步骤时，**始终**在响应文本中保留用户指定的所有标志（包括
>     `--project=<project_id>`）。
>
> 6.  **强制计划模板**：生成计划时，响应**必须**
>     复制以下确切的 4 步结构：
>
>     -   **第 1 步**：通过 `gcloud help <leaf_command>` 验证语法
>     -   **第 2 步**：验证参数（确认必需和可选
>         标志，并明确检查是否支持 `--dry-run` 或 `--validate-only`
>         标志）
>     -   **第 3 步**：提出试运行命令（如果支持 `--dry-run` 或
>         `--validate-only`，则在下一步之前必须调用一次 `--dry-run` 或
>         `--validate-only`。）
>     -   **第 4 步**：提出命令并获取授权（如果该命令位于
>         “禁止操作”拒绝列表中，请说明禁止自主执行，并且必须明确请求用户授权后
>         才能继续。如果该命令不在拒绝列表中，则提出或继续
>         执行，同时遵循下方的*所有*“执行约束”。）

本文档为与 Google Cloud SDK（`gcloud` CLI）交互的 AI 代理提供必要的准则和最佳实践。遵循这些规则对于避免产生虚构的命令、标志、标志值和位置参数语法、防止破坏性操作以及最大限度减少上下文窗口占用至关重要。

## 入门指南

### 1. 安装

如果缺少 `gcloud` 可执行文件，请参阅官方
[Google Cloud CLI 安装指南](https://docs.cloud.google.com/sdk/docs/install-sdk.md.txt)，
在当前平台（Linux、macOS、Windows 等）上进行安装。

### 2. 授权

使用 Google Cloud 对 CLI 进行身份验证。请选择与运行环境相匹配的流程：

*   **用户账号（交互式）**：运行 `gcloud auth login`。按照浏览器中的提示登录。
*   **用户账号（无头流程）**：如果在没有 Web 浏览器的终端中操作
    （例如容器、远程 SSH），请添加 `--no-browser` 标志：
    `gcloud auth login --no-browser`。复制 URL，在另一台计算机上登录，
    然后返回身份验证代码。
*   **应用默认凭据（ADC）**：要对来自本地应用程序或 SDK 库的代码调用
    进行身份验证，请通过 `gcloud auth
    application-default login` 设置 ADC（对于无头环境，请添加
    `--no-browser`）。
*   **服务账号（最适合分离式/无头自动化）**：使用 JSON 密钥文件直接进行
    身份验证。非常适合完全自动化的后台任务和流水线：`gcloud auth activate-service-account
    --key-file=path/to/key.json`。请注意，出于安全原因，某些组织可能会限制
    对 JSON 密钥文件的访问。
*   **服务账号模拟（本地结对编程代理的首选方式）**：利用人类开发者现有的
    用户凭据来采用服务账号身份。最适合本地开发助手，可避免在人类用户的工作站上
    使用不安全的私钥：`gcloud config set
    auth/impersonate_service_account SERVICE_ACCT_EMAIL`

*权限分离（关键）*：两种服务账号方式都可确保代理的权限与人类用户广泛的访问
权限严格区分（强制实施最小权限原则），并确保操作以代理的专用身份得到正确审计。
*（模拟需要 `roles/iam.serviceAccountTokenCreator`）*。

有关更详细的策略和身份验证类型（例如工作负载身份联合），请参阅
[授权 gcloud CLI](https://docs.cloud.google.com/sdk/docs/authorizing.md.txt)。

## 核心原则

### 1. 显式命令验证（强制）

*   **操作**：对于计划运行的*确切*命令，**始终**调用 `gcloud help <command>`
    （例如 `gcloud help compute instances create`）。
*   **验证**：在尝试执行或给出计划之前，确保命令、标志、标志值和位置参数语法
    对该特定叶级命令有效。父命令组的验证结果不能传递给子命令。

### 2. 数据精简策略（强制）

尽量减少 `gcloud` 返回的数据量，以节省上下文窗口空间并降低延迟。执行任何
`list` 命令时，都必须包含至少一个数据精简标志（`--limit`、`--filter` 或
`--format`）。

*   **投影**：使用 `--format="json(key1, key2, ...)"` 仅选择任务所需的特定
    字段。要了解高级投影和格式化语法，请参阅 `gcloud topic projections` 和
    `gcloud topic formats`。

*   **限制数量**：使用 `--limit=N` 限制返回的资源数量。

*   **筛选**：使用 `--filter` 在服务器端缩小结果范围。优先使用
    `:` 进行模式匹配，并且切勿对冒号右侧的内容加引号。将整个筛选标志视为单个字符串，不要对字符加引号或进行转义。
    要了解筛选表达式语法，请参阅 `gcloud topic
    filters`。

*   **架构发现**：不受约束的资源列表可能会因冗余数据而迅速耗尽上下文窗口。
    为防止这种情况，请在执行查询之前先发现资源的架构。如果不确定用于投影字段
    (`--format`) 或筛选 (`--filter`) 的 JSON 键路径，请运行目标资源的
    list 命令（如果支持），并将数量限制为一项：

    ```bash
    gcloud <GROUP> <RESOURCE> list --limit=1 --format=json
    ```

    检查这个单一实例的 JSON 结构，以便在请求完整或筛选后的数据集之前，安全地确定正确的架构键。

### 3. 执行约束

*   **单条命令**：一次执行一条 `gcloud` 命令。不得进行命令链接或排序执行。
*   **禁止 Shell 运算符**：不要使用命令替换 (`$(...)`)、管道
    (`|`) 或重定向 (`>`, `>>`, `<`)。这样可以提高命令安全性，并确保用户更容易理解和审查命令。
*   **非交互式执行 (`--quiet` / `-q`)**：在所有执行命令中传入 `--quiet`（或
    `-q`）全局标志（例如，`gcloud pubsub topics
    delete temp-topic --quiet --project=test-project`）。AI 代理运行在没有 TTY 或 `stdin` 输入处理程序的无头非交互式环境中。如果不使用 `--quiet`，需要用户确认的命令（例如删除资源、批准默认值或选择未指定的区域）将无限期暂停执行以等待输入，从而导致后台任务超时。包含 `--quiet` 会强制启用非交互模式，使 `gcloud` 自动接受安全的默认选项；如果缺少必需参数，则立即失败并显示明确的错误。
*   **禁止盲目列出**：绝不要在没有 `--limit`、`--filter` 或 `--format` 的情况下执行 `list` 命令。

### 4. 项目和位置范围限定（关键）

为确保命令具有确定性、非交互性并以正确的环境为目标，命令必须显式提供项目和位置范围。

*   **显式指定目标项目**：不要依赖当前配置的默认值。
    始终在所有资源操作和查询命令后附加 `--project=<PROJECT_ID>`（运行纯本地配置命令时除外）。这样可避免意外对错误的项目执行操作。

*   **防止位置提示**：许多 Google Cloud 资源是区域性或可用区级资源。
    如果省略位置标志（例如 `--region`、`--zone` 或
    `--location`），`gcloud` 将触发交互式提示，要求选择可用区/区域。这违反了**禁止交互**规则。如果命令需要位置标志，请始终显式提供。

*   **位置发现**：如果服务的正确区域、可用区或位置未知，请先运行发现命令（如果结果很多，请记得限制结果数量）：

    *   **Compute Engine（虚拟机、网络）**：

        *   `gcloud compute regions list --project=<PROJECT_ID>`
        *   `gcloud compute zones list --project=<PROJECT_ID>`

    *   **其他服务（标准 API 风格）**：许多 GCP 服务使用统一的
        `locations list` 命令：

        *   `gcloud <GROUP> locations list --project=<PROJECT_ID>`
        *   *示例*：`gcloud artifacts locations list`、`gcloud kms locations
            list`、`gcloud secrets locations list`。

## 安全与防护措施

> [!CAUTION] **破坏性操作（删除、更新、移除）必须获得用户的明确授权。**
> 除非用户在安全且预先批准的工作流中明确指示，否则绝不能自主调用这些操作。

### 禁止的操作（拒绝列表）

绝不能自主执行以下命令。这些命令需要明确的人工介入授权：

*   **任何 IAM 策略、角色或绑定修改**（安全）：存在权限提升、管理员被锁定、服务中断或未经授权的数据暴露风险。
*   **禁止主动启用 API**：假定必要的 API 已启用。为防止意外配置资源或产生账单费用，请勿主动尝试启用 API。启用任何 API 均需用户批准。
*   **`gcloud * delete`**（破坏性）：不可逆的资源销毁（例如删除项目）或数据擦除。
*   **`gcloud billing *`**（财务）：存在服务中断或成本失控的风险。
*   **`gcloud organizations *`**（治理）：组织级变更会影响所有用户的安全态势。
*   **`gcloud kms *`**（加密）：存在导致数据被永久锁定的风险。
*   **`gcloud infra-manager deployments apply`**（破坏性）：自主执行 IaC 可能会销毁托管资源。

### 执行准则

*   **试运行（强制）**：如果命令帮助输出中列出了 `--dry-run` 或 `--validate-only` 标志（或等效标志），则在建议的命令或初始执行步骤中始终包含该标志。在实际执行之前，始终使用 `--dry-run` 或 `--validate-only` 预览变更。

*   **长时间运行的操作**：对于支持该标志的命令，强烈建议为长时间运行的操作使用 `--async` 标志，以避免阻塞智能体工作流。请注意，并非每个命令都有 `--async` 标志。对于返回操作 ID 的命令（无论是通过 `--async` 还是默认返回），如果下一步需要，应轮询操作状态直至完成。

*   **非交互式标志（`--quiet`）**：在所有建议或执行的命令中包含 `--quiet`（或 `-q`），以确保非交互式执行，而不会等待 TTY 确认提示。

## 结构化工作流

### 发现工作流

当被要求对不熟悉的服务执行任务时：

1.  **调用帮助**：在执行目标叶级命令之前，对其调用 `gcloud help <COMMAND>`。
2.  **遍历命令树**：如果不清楚确切的命令，请对命令组运行帮助（例如 `gcloud help
    compute` 或 `gcloud help`），以发现可用的子组和命令。
3.  **发现架构**：在构造过滤器或投影之前，运行 `gcloud <GROUP> <RESOURCE> list --limit=1
    --format=json` 以检查 JSON 键。切勿在未使用范围限定标志（例如 `--limit=1`）的情况下执行不受约束的 `list` 命令，以防止上下文窗口耗尽。
4.  **强制缩减数据**：在执行所有命令时，都应包含数据缩减标志（`--limit`、`--filter`、`--format`）。

## 快速参考 / 速查表

任务               | 命令模板
------------------ | ----------------------------------------------------------
发现架构           | `gcloud <GROUP> <RESOURCE> list --limit=1 --format=json`
筛选列表           | `gcloud <GROUP> <RESOURCE> list --filter="status:RUNNING"`
指定列             | `gcloud <GROUP> <RESOURCE> list --format="json(name, id)"`
了解过滤器         | `gcloud topic filters`
了解格式           | `gcloud topic formats`
了解投影           | `gcloud topic projections`
异步操作           | `gcloud <COMMAND> --async`
检查操作           | `gcloud operations describe <OPERATION_ID>`
常用命令           | `gcloud cheat-sheet`
列出区域 (GCE)     | `gcloud compute regions list --project=<PROJECT_ID>`
列出可用区 (GCE)   | `gcloud compute zones list --project=<PROJECT_ID>`
列出位置           | `gcloud <GROUP> locations list --project=<PROJECT_ID>`

有关在自动化中使用 gcloud CLI 的指导，请参阅
[gcloud CLI 脚本编写指南](https://docs.cloud.google.com/sdk/docs/scripting-gcloud.md.txt)。