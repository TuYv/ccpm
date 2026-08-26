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
> ### 强制性前置条件：显式进行叶级语法验证
>
> 所有关于 `gcloud` 命令、标志、标志值和位置参数语法的既有知识都已**过时且容易导致幻觉**。
>
> 在通过 `gcloud help <command>` 验证叶级语法之前，绝 NEVER 提议命令参数、输出标志选项、执行命令，或为任何 `gcloud` 任务概述分步计划（也可以在计划中将叶级帮助查询列为强制步骤）。
>
> **强制性操作规则**：
>
> 1.  **直接执行与代码生成**：在提议或执行最终命令语法之前，**始终**调用 `gcloud help
>     <leaf_command>`（例如 `gcloud help compute instances create` 或
>     `gcloud help sql instances create`）。
>
> 2.  **计划与策略查询**：当被要求提供实现用户目标的计划、策略或后续步骤时（例如，*“你计划如何实现 X……”*），响应**必须明确包含运行 `gcloud help
>     <leaf_command>`**，并将其作为计划的第 1 步，然后才能提议标志或执行命令。
>
> 3.  **非传递式验证**：父命令组帮助（例如 `gcloud
>     help compute`）不足以进行叶级语法验证。
>     必须在特定的叶级子命令处执行验证。
>
> 4.  **禁止使用网络搜索作为后备方案**：绝 NEVER 使用 `search_web`、网络搜索或外部文档搜索工具来查询 gcloud CLI 语法。`gcloud help <leaf_command>` 是命令语法**唯一获授权的依据**。
>
> 5.  **保留用户标志和项目**：在提议中间命令步骤时，**始终**保留用户指定的所有标志（包括 `--project=<project_id>`）在提议的响应文本中。
>
> 6.  **强制性计划模板**：生成计划时，响应**必须**复制以下确切的 4 步结构：
>
>     -   **步骤 1**：通过 `gcloud help <leaf_command>` 验证语法
>     -   **步骤 2**：验证参数（确认必需和可选标志，并明确检查是否支持 `--dry-run` 或 `--validate-only` 标志）
>     -   **步骤 3**：提议试运行命令（如果支持 `--dry-run` 或 `--validate-only`，则在下一步之前**必须**调用 `--dry-run` 或 `--validate-only`。）
>     -   **步骤 4**：提议命令并请求授权（如果该命令在“禁止操作”拒绝列表中，必须说明禁止自主执行，并且必须明确请求用户授权后才能继续。如果该命令不在拒绝列表中，则提议执行或继续执行，同时遵循下方的**所有“执行限制”**。）

本文档为与 Google Cloud SDK（`gcloud` CLI）交互的 AI 代理提供必要的指南和最佳实践。遵循这些规则对于避免虚构命令、标志、标志值和位置参数语法、防止破坏性操作以及最大限度地减少上下文窗口使用至关重要。

## 执行模式

AI 代理可以通过两种主要方式与 Google Cloud 资源交互：

-   **直接 CLI 执行**：直接在本地或自动化 shell 环境中执行 `gcloud` 命令。有关安装、身份验证流程和配置管理，请参阅 [CLI 使用](references/cli-usage.md)。
-   **模型上下文协议（MCP）**：通过 Cloud CLI 远程 MCP 服务器（`run_gcloud_command`）调用结构化工具。有关工具架构、参数规则和服务器配置，请参阅 [MCP 使用](references/mcp-usage.md)。

## 核心原则

### 1. 显式命令验证（强制要求）

*   **操作**：对于计划运行的*确切*命令，**始终**调用 `gcloud help <command>`（例如：`gcloud help compute instances create`）。
*   **验证**：在尝试执行命令或制定计划之前，确保该具体叶命令的命令、标志、标志值和位置参数语法均有效。不能根据父级命令组的验证结果推断其子命令也有效。

### 2. 数据缩减策略（强制要求）

尽量减少 `gcloud` 返回的数据量，以节省上下文窗口空间并降低延迟。**不得**执行任何未包含至少一个数据缩减标志（`--limit`、`--filter` 或 `--format`）的 `list` 命令。

*   **投影**：使用 `--format="json(key1, key2, ...)"` 仅选择任务所需的特定字段。如需了解高级投影和格式化语法，请参阅 `gcloud topic projections` 和 `gcloud topic formats`。

*   **限制数量**：使用 `--limit=N` 限制返回的资源数量。

*   **过滤**：使用 `--filter` 在服务器端缩小结果范围。优先使用 `:` 进行模式匹配，并且绝不要引用冒号右侧的内容。将整个过滤器标志视为单个字符串，不要引用或转义其中的字符。如需研究过滤器表达式语法，请参阅 `gcloud topic filters`。

*   **架构发现**：不受约束的资源列表可能会很快因冗余数据耗尽上下文窗口。为避免这种情况，请在执行查询之前先发现资源的架构。如果不确定用于投影字段（`--format`）或过滤（`--filter`）的 JSON 键路径，请使用单项限制运行目标资源的 `list` 命令（如果支持）：

    ```bash
    gcloud <GROUP> <RESOURCE> list --limit=1 --format=json
    ```

    检查这一个实例的 JSON 结构，以便在请求完整数据集或经过过滤的数据集之前，安全地确定正确的架构键。

### 3. 执行限制

*   **单条命令**：一次只执行一条 `gcloud` 命令。不得链接或串联命令。
*   **不得使用 shell 运算符**：不要使用命令替换（`$(...)`）、管道（`|`）或重定向（`>`、`>>`、`<`）。这样做可以提高命令安全性，并确保用户更容易理解和审查命令。
*   **非交互式执行（`--quiet` / `-q`）**：在所有执行命令中传递全局标志 `--quiet`（或 `-q`）（例如：`gcloud pubsub topics delete temp-topic --quiet --project=test-project`）。AI 代理运行在无头、非交互式环境中，没有 TTY 或 `stdin` 输入处理程序。如果不使用 `--quiet`，需要用户确认的命令（例如删除资源、批准默认值或选择未指定的区域）将暂停执行并无限期等待输入，从而导致后台任务超时。包含 `--quiet` 会强制使用非交互模式，使 `gcloud` 自动接受安全的默认选项；如果缺少必需参数，则会立即失败并显示明确的错误。
*   **不得盲目列出**：绝不要执行不带 `--limit`、`--filter` 或 `--format` 的 `list` 命令。

### 4. 项目和位置范围限定（关键）

为确保命令具有确定性、非交互性，并且针对正确的环境，必须明确提供项目和位置范围限定。

*   **明确指定项目目标**：不要依赖活动配置中的默认值。始终将 `--project=<PROJECT_ID>` 附加到所有操作资源和查询资源的命令中（纯本地配置命令除外）。这样可以避免错误地对错误项目执行操作。

*   **防止位置提示**：许多 Google Cloud 资源具有区域级或可用区级属性。如果省略位置标志（例如 `--region`、`--zone` 或 `--location`），`gcloud` 将触发交互式提示，要求选择可用区/区域。这违反了**无交互**规则。如果命令需要位置标志，始终提供明确的位置标志。

*   **位置发现**：如果不知道服务所需的正确区域、可用区或位置，请先运行发现命令（如果结果很多，请记得限制结果数量）：

    *   **Compute Engine（虚拟机、网络）**：

        *   `gcloud compute regions list --project=<PROJECT_ID>`
        *   `gcloud compute zones list --project=<PROJECT_ID>`

    *   **其他服务（标准 API 风格）**：许多 GCP 服务都使用统一的 `locations list` 命令：

        *   `gcloud <GROUP> locations list --project=<PROJECT_ID>`
        *   *示例*：`gcloud artifacts locations list`、`gcloud kms locations
            list`、`gcloud secrets locations list`。

## 安全性与防护措施

> [!CAUTION] **破坏性操作（delete、update、remove）必须获得用户的明确授权。**除非在安全且预先批准的工作流上下文中明确要求执行，否则绝不能自主调用这些操作。

### 禁止的操作（拒绝列表）

绝不自主执行以下命令。这些命令需要人类参与并明确授权：

*   **任何 IAM 政策、角色或绑定修改**（安全性）：存在权限提升、管理员锁定、服务中断或未经授权的数据暴露风险。
*   **不得主动启用 API**：假定必要的 API 已启用。为防止意外配置资源或产生计费费用，不要主动尝试启用 API。启用任何 API 都需要用户批准。
*   **`gcloud * delete`**（破坏性）：不可逆的资源销毁（例如删除项目）或数据擦除。
*   **`gcloud billing *`**（财务）：存在服务中断或产生无上限费用的风险。
*   **`gcloud organizations *`**（治理）：组织级别的更改会影响所有用户的安全状况。
*   **`gcloud kms *`**（加密）：存在永久锁定数据的风险。
*   **`gcloud infra-manager deployments apply`**（破坏性）：自主执行 IaC 可能会销毁受管理的资源。

### 执行准则

*   **试运行（强制）**：如果命令帮助输出中列出了 `--dry-run` 或 `--validate-only` 标志（或等效标志），则始终在建议的命令或初始执行步骤中包含该标志。在实际执行之前，始终使用 `--dry-run` 或 `--validate-only` 预览更改。

*   **长时间运行的操作**：对于支持此功能的命令，强烈建议在长时间运行的操作中使用
    `--async` 标志，以避免阻塞代理流程。请注意，并非每个命令都有 `--async` 标志。
    对于返回操作 ID 的命令（无论是通过 `--async` 还是默认返回），如果下一步需要，
    则必须轮询操作状态直至完成。

*   **非交互式标志（`--quiet`）**：在所有建议执行或实际执行的命令中包含
    `--quiet`（或 `-q`），以确保以非交互方式执行，而无需等待 TTY 确认提示。

## 结构化工作流

### 发现工作流

当被要求对不熟悉的服务执行任务时：

1.  **调用帮助**：在执行目标叶命令之前，调用 `gcloud help <COMMAND>`。
2.  **遍历命令树**：如果不知道确切命令，则对命令组运行帮助命令（例如 `gcloud help
    compute` 或 `gcloud help`），以发现可用的子组和命令。
3.  **发现架构**：运行 `gcloud <GROUP> <RESOURCE> list --limit=1
    --format=json`，在构造过滤器或投影之前检查 JSON 键。不要在没有范围限定标志（例如
    `--limit=1`）的情况下执行不受约束的 `list` 命令，以防止耗尽上下文窗口。
4.  **强制执行数据缩减**：在所有命令执行中包含数据缩减标志（`--limit`、
    `--filter`、`--format`）。

## 快速参考 / 速查表

任务               | 命令模板
------------------ | ----------------------------------------------------------
发现架构    | `gcloud <GROUP> <RESOURCE> list --limit=1 --format=json`
过滤列表      | `gcloud <GROUP> <RESOURCE> list --filter="status:RUNNING"`
特定列   | `gcloud <GROUP> <RESOURCE> list --format="json(name, id)"`
了解过滤器      | `gcloud topic filters`
了解格式      | `gcloud topic formats`
了解投影  | `gcloud topic projections`
异步操作    | `gcloud <COMMAND> --async`
检查操作    | `gcloud operations describe <OPERATION_ID>`
常用命令    | `gcloud cheat-sheet`
列出区域 (GCE) | `gcloud compute regions list --project=<PROJECT_ID>`
列出可用区 (GCE)   | `gcloud compute zones list --project=<PROJECT_ID>`
列出位置     | `gcloud <GROUP> locations list --project=<PROJECT_ID>`

请参阅
[gcloud CLI 脚本编写指南](https://docs.cloud.google.com/sdk/docs/scripting-gcloud.md.txt)，
了解如何在自动化中使用 gcloud CLI。

## 参考目录

-   [CLI 用法](references/cli-usage.md)：平台安装、身份验证方法（交互式、无头、
    ADC、服务帐号密钥、身份模拟）以及本地配置管理。

-   [MCP 用法](references/mcp-usage.md)：使用 Cloud CLI 远程 MCP
    服务器（`run_gcloud_command`）、项目参数范围限定、输入文件和执行指南。