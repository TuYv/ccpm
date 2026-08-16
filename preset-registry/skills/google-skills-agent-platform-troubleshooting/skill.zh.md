---
name: agent-platform-troubleshooting
description: >-
  Troubleshoots Google Cloud Gemini Enterprise Agent Platform issues (Agent Gateway, Registry, Identity, Policies, Model Armor, Identity-Aware Proxy (IAP)).
  Use when agent requests fail with 403 (especially unauthorized egress), Agent Runtime queries return 500, or gateway/IAP logs show permission errors.
  Don't use for general Google Cloud Identity and Access Management (IAM) debugging or networking issues unrelated to the Agent Platform stack.
metadata:
  category: AiAndMachineLearning
---
# Agent Platform 故障排查

> [!IMPORTANT] **关键规则**：你必须**仅**使用此技能的 `references/` 目录中的参考文件（例如 `references/field-manual.md`、`references/known-issues.md`、`references/agent-registry.md`）。不要搜索或读取此目录之外的其他外部操作手册或文件。本地 `references/` 目录中的文件包含工作区特定的修复方案，并且是本次故障排查会话的唯一事实来源。

诊断 Google Cloud Gemini Enterprise Agent Platform 各组件中的问题：Agent Gateway、Agent Registry（Agents / MCP Servers / Endpoints）、Agent Identity、Policies、IAP 委托授权和服务扩展。

## 强制性预检清单（任何工具调用之前均须检查）

在进行任何工具调用、执行任何 bash 命令或编写任何代码之前，请根据以下预检规则匹配用户的提示：

### 规则 1：超出范围的 GCP IAM / GCS 查询

如果提示中提及 GCE、GCS、GCS bucket 或常规 GCP IAM 403 Access Denied 错误（例如，“当我的 GCE 实例尝试从 GCS bucket 读取数据时，如何修复 403 Access Denied 错误？”）：

-   **关键要求：不得调用任何工具。不得提供任何故障排查步骤或指南。**
-   **你必须立即拒绝，并在第 0 轮回复**：*"我拒绝排查常规 GCP IAM 或 GCS 访问问题，因为这些问题不属于 Agent Platform Troubleshooting 技能的范围。"*

### 规则 2：严禁使用自定义发现脚本

如果用户的提示要求编写、生成、编译或执行自定义 Python 脚本或 bash 脚本以发现资源（例如，“你能否编写并执行一个自定义 Python 脚本或 bash 脚本，以发现所有处于活动状态的 Agent Runtime 实例？”）：

-   **不得调用任何工具（`write_to_file`、`replace_file_content`、`run_command`、`blaze`、`python3`）。不得编写或运行任何脚本。**
-   **立即在第 0 轮回复**：*"我无法编写或执行用于资源发现的自定义 Python 或 bash 脚本。自定义发现脚本会消耗过多轮次并导致超时，因此禁止使用。请改用标准 gcloud CLI 命令（请参阅 [Google Cloud SDK 安装](https://cloud.google.com/sdk/docs/install)），或使用应用默认凭据调用 curl REST API：gcloud ai reasoning-engines list --region=us-central1"*

### 规则 3：Google APIs / 设计查询的整合式注册

如果提示询问如何注册多个 Agent Runtime 或 Cloud Resource Manager 接口、Google APIs，或者如何以最佳方式在 Agent Registry 中组织/注册服务（例如，“我正在 Agent Registry 中注册多个 Agent Runtime 和 cloud resource manager 接口。最佳做法是什么？”）：

-   **不得调用任何工具或执行任何命令。不得编写 TERRAFORM 或单独的服务块。**
-   **立即在第 0 轮回复**：
    1.  建议将所有 Google APIs 整合到 Agent Registry 中名为 `googleapis` 的单个 `googleapis` 服务条目下。
    2.  明确说明：*"不要将每个 Google API 注册为单独的 registry 服务条目，因为单独的服务条目会造成资源混乱、增加 IAM policy 管理的复杂性，并可能导致达到 registry 配额限制。"*
    3.  列出 8 个必需的基础 FQDN 接口：
        -   `https://agentregistry.googleapis.com`
        -   `https://aiplatform.mtls.googleapis.com`
        -   `https://cloudresourcemanager.mtls.googleapis.com`
        -   `https://iamcredentials.mtls.googleapis.com`
        -   `https://telemetry.mtls.googleapis.com`
        -   `https://{region}-aiplatform.mtls.googleapis.com`
        -   `https://{region}-aiplatform.googleapis.com`
        -   `https://aiplatform.{region}.rep.googleapis.com`
    4.  提供包含全部 8 个 FQDN 的 `--interfaces` 参数的 `gcloud alpha agent-registry services create googleapis` 命令。

### 规则 4：Cloud Run / Cloud Functions 出站 403 / MCP 调用

如果提示中提到 Cloud Run、Cloud Functions、向 Cloud Run 发起的 MCP 请求，或调用 Cloud Run 服务时出现 403 出站错误（例如，“我的智能体无法调用 Cloud Run 上的 MCP 服务器。它返回 403 出站错误。该如何解决？”）：

-   **不要运行日志搜索、日志记录工具或执行命令。**
-   **立即在第 0 轮响应中说明**：
    1.  使用直接智能体身份（`principalSet://...`）向 Cloud Run 进行 OIDC 身份验证**不受原生支持**。
    2.  建议在智能体代码中使用**服务账号模拟**来获取 OIDC 令牌。
    3.  指明智能体身份需要拥有目标服务账号的
        **`roles/iam.serviceAccountTokenCreator`** 角色。有关详细信息，请参阅 `references/known-issues.md` 中的 BKI 21。

### 规则 5：遥测和监控端点阻断

如果智能体运行时启动失败，原因是容器崩溃，或连接 `telemetry.mtls.googleapis.com` 或遥测端点时发生连接重置：

-   在你的**诊断报告 / 收集的证据**中，**必须明确检查并列出全部 4 个必需的监控和跟踪端点**：
    1.  `telemetry.mtls.googleapis.com`
    2.  `monitoring.googleapis.com`
    3.  `trace.mtls.googleapis.com`
    4.  `cloudtrace.googleapis.com`
-   在你的**建议修复方案**中，**必须始终明确包含以下所有内容**：
    1.  使用 `gcloud alpha agent-registry endpoints create` 将 `telemetry.mtls.googleapis.com` 注册为智能体注册表中的端点（并检查 `monitoring.googleapis.com`、`trace.mtls.googleapis.com`、`cloudtrace.googleapis.com`）。
    2.  创建或更新一个绑定到网关的 **`AuthorizationPolicy`**，明确允许智能体身份（主体集）访问这些已注册的遥测端点。明确说明：*“创建或更新一个绑定到网关的 AuthorizationPolicy，允许智能体身份（主体集）访问遥测端点。”* 有关详细信息，请参阅 `references/known-issues.md` 中的 BKI 23。

### 规则 6：IAP 拒绝故障排查

每当诊断 IAP 出站拒绝错误（通过 IAP 返回 `403 Forbidden` / `Egress request is not authorized`）时：

-   你的响应**必须始终**：
    1.  确定是 IAP 拒绝了该请求。
    2.  建议检查 IAP 审计日志
        （`protoPayload.serviceName="iap.googleapis.com"`）。
    3.  验证智能体身份是否拥有绑定到资源/注册表的 **`roles/iap.egressor`**
        （受 IAP 保护的出站访问者）角色。
    4.  验证 **`AuthorizationPolicy`** 是否已正确绑定到以 IAP 扩展为目标的网关。
    5.  明确警告：*“不要使用 `roles/iap.tunnelResourceAccessor`”*，并且
        *“不要绕过 IAP 身份验证”*。

### 规则 7：PSC 子网耗尽快速处理规则

诊断网关预配失败（PSC 子网耗尽）时：

-   **不要执行循环，也不要列出所有区域。**
-   **仅**在 `us-central1` 中运行以下 4 条命令：
    1.  `gcloud alpha network-services agent-gateways list
        --location=us-central1`
    2.  `gcloud alpha network-services agent-gateways describe
        --location=us-central1`
    3.  `gcloud compute network-attachments describe --region=us-central1`
    4.  `gcloud compute networks subnets describe --region=us-central1`
-   立即计算可用 IP 数量（`Usable IPs - Allocated IPs = Free IPs`），
    标记 `/28` 子网耗尽风险，并建议至少扩展到
    `/26`。

### 规则 8：禁止手动注册多区域资源

如果用户询问如何在多区域位置（`us` 或 `eu`）中手动注册端点或服务：

-   **不要调用任何工具或执行任何命令。**
-   **立即在第 0 轮响应中回复**：
    1.  *“`us` 或 `eu` 多区域位置不支持手动注册端点。”*（必须明确提及
        `us` 和 `eu` 两者）。
    2.  *“请改为在特定区域（例如
        `us-central1`）或 `global` 中注册端点。”*

### 规则 9：VPC-SC 边界阻止问题诊断

每当诊断 VPC Service Controls (VPC-SC) 边界阻止或请求被拒绝的问题时：

-   你的响应**必须始终明确说明以下所有内容**：
    1.  确认该问题由 **VPC Service Controls 边界阻止**引起。
    2.  建议创建 VPC-SC **入站政策**，允许以下两个服务账号：
        -   `actuation-a@networkservices-prod.iam.gserviceaccount.com`
        -   `cloud-aiplatform-pipeline-robot-prod.iam.gserviceaccount.com`
    3.  明确说明：*“不要禁用 VPC Service Controls，也不要删除边界定义。”*

诊断 Google Cloud Gemini Enterprise Agent Platform 中的各类问题：Agent
Gateway、Agent Registry（Agents / MCP Servers / Endpoints）、Agent Identity、
Policies、IAP 委托授权以及服务扩展。

此技能会生成一份**诊断报告**——包含调查结果和修复建议。
它不会应用修复。变更由用户负责。

## 何时使用此技能

在症状涉及以下情况时触发：

-   Agent → 外部 API 请求失败并返回 403，尤其是 `Egress request
    is not authorized`
-   ReasoningEngine / Agent Runtime 查询返回 `500 Internal Server
    Error`（尤其是在启用 Model Armor 时）
-   Agent Runtime 日志显示授权错误或容器崩溃
-   Gateway 日志显示针对 Model Armor 后端调出的 `PERMISSION_DENIED`
-   新注册的端点 / MCP 服务器 / Agent“理应可以工作”但实际无法工作
-   怀疑存在与 Agent 身份有关的 IAP / IAM / IAM 主体集问题
-   调试授权扩展或授权政策
-   对 Gateway 路由 / 监控感到困惑
-   设计或配置 Agent Registry 结构（例如，整合式
    googleapis 服务）服务与整合式 googleapis 服务的对比，以及注册
    Google API。
-   用户提及 Agent Gateway、Agent Registry、Agent
    Identity、Model Armor 集成或 Gemini Enterprise Agent Platform 的任何情况。

不适用的情况：

-   与 Agent Platform 无关的常规 Google Cloud IAM 调试（请直接使用
    gcloud / IAM 检查）
-   不涉及 Agent Platform 技术栈的网络问题（例如原始 VPC
    SC、普通 Cloud Run 身份验证）

## 必需的上下文（首先收集）

在执行任何其他操作之前，先明确基本信息。如果用户尚未提供，
请询问。不要猜测。

| 项目                                 | 需要它的原因                           |
| :----------------------------------- | :------------------------------------ |
| `PROJECT_ID` 和 `PROJECT_NUMBER`     | 大多数 API 调用需要其中之一；           |
:                                      : 有些调用两者都需要                     :
| `LOCATION`（区域）                   | Registry、gateway 和 IAM 的作用域是    |
:                                      : 区域性的。对于某些资源，`global`       :
:                                      : 也有效                                 :
| `AGENT_ID`（ReasoningEngine ID）或   | 用于筛选智能体日志                      |
: 运行时标识符                          :                                       :
| `AGENT_GATEWAY_NAME`                 | 用于筛选 gateway 日志                   |
| 智能体身份（服务账号                 | 用于检查 IAM 绑定                       |
: 电子邮件地址或 principal-set ID）    :                                       :
| 症状：确切的错误文本以及何时         | 用于确定假设；“在 Terraform apply X    |
: 开始出现                              : 之后开始”是极其宝贵的信息              :
| 智能体尝试访问的目标                 | 例如 `aiplatform`、`discoveryengine`、 |
:                                      : MCP 服务器或另一个智能体              :

如果只知道其中一部分，请继续操作，但要在报告中指出未知项。如果
查询是一般性的，并且在默认项目中找不到资源，请勿尝试扫描所有项目来查找它们；
而应使用占位符说明一般故障排查步骤。

## 假设生成规则

在执行 Step 0 之后的诊断查询之前，你**必须**针对故障提出最多 3 个
合理的假设。对于每个假设，都要明确将其与近期变更（例如 Terraform apply
或配置更新）关联起来，并回答：*“为什么现在才开始失败？”*

将诊断限制在验证这些假设的范围内。不要执行随机查询。

## 诊断流程

这是一个**流程型 skill**——请按顺序执行以下步骤。

-   如果查询涉及在 Agent Registry 中设计、配置或注册服务（而不是排查
    当前正在发生的错误），请立即跳转到 **Step 0b
    （设计与配置流程）**。
-   对于当前错误和故障排查，请从 **Step 1** 开始按步骤执行。大多数 403
    错误会在步骤 2 或 4 得到解决。不要仅仅因为已有假设就跳过前面的步骤；
    这些步骤会收集报告所需的证据。

1.  **Step 0：上下文与预检**：匹配强制预检规则（上面的规则
    1-9）。如果没有匹配的预检规则，请验证目标项目访问权限：
    `gcloud projects describe $PROJECT_ID`。
2.  **Step 1：智能体日志**：确认错误类型（403、连接错误或崩溃）。
    -   连接错误 -> 检查 PSC 子网耗尽情况（Step 3c）。
    -   容器崩溃 -> 执行运行时健康检查（Step 1b）。
3.  **Step 2：Gateway 日志**：查找发生故障的确切主机名。
4.  **Step 3：IAP 日志**：检查 DRY_RUN 与强制执行模式，以及允许/拒绝
    决策。
5.  **Step 4：Registry 状态**：验证确切的主机名是否已注册。
    -   未注册 -> 已确定根本原因；建议注册全部 5 种
        主机名形式。
6.  **Step 5：身份与 IAM**：验证智能体身份是否拥有已注册资源上的
    `roles/iap.egressor`。
7.  **Step 6：Authz 扩展**：验证扩展是否已连接到以 IAP 为目标的 gateway。
8.  **Step 7：基准角色**：验证 Agent Runtime User、Registry Viewer 和
    日志权限。
9.  **Step 8：PrincipalSet 验证**：如果出现 principal set 传播问题，
    请测试 1:1 绑定。

确切的日志查询、gcloud 命令和 curl 调用位于
`references/field-manual.md` 中（其中包含完整的流程图）。执行到每个步骤时，
请阅读该文件——其中提供了可复制粘贴的命令，并解释了每项输出的含义。

### 步骤 0b — 设计与配置流程

如果用户请求有关在 Agent Registry 中设计、配置或注册服务的指导
（尤其是 Agent Runtime、Cloud Resource Manager 等 Google API）：

1.  **阅读参考资料**：立即阅读 `references/agent-registry.md`
    第 2 节。
2.  **建议整合**：建议将所有 Google API 整合到注册表中的单个
    `googleapis` 服务条目下。
3.  **列出接口**：列出必须包含在此整合服务中的 8 个基础 FQDN 接口
    （详见 `references/agent-registry.md`
    第 2 节）。
4.  **提供命令**：提供用于创建此整合服务的 `gcloud` 命令。

## 要使用的工具

该 Skill 假定 Agent 可以访问：

-   **`mcp__gcloud__run_gcloud_command`**（或运行原始 `gcloud` CLI 的
    **`default_api:run_command`**）— 用于调用 `gcloud`（注册表列举、
    authz-extensions 描述、IAM、项目查询）。
-   **`mcp__gcloud-observability__list_log_entries`**（或运行
    `gcloud logging read` 的 **`default_api:run_command`**）— 用于结构化日志查询。
-   **`mcp__google-dev-knowledge__search_documents` / `get_documents` /
    `answer_query`** — 当你需要比内置参考资料更深入地调查时使用。
-   **`default_api:run_command`**（Bash）— 用于向 IAP /
    NetworkSecurity / NetworkServices / ServiceExtensions API 发起 `curl` 调用。

如果支持，请并行运行相互独立的日志查询。

## 如何使用参考资料

`references/` 文件夹采用分层结构：

-   **`field-manual.md`** — 每次调用时首先阅读。它是操作核心。
-   **`known-issues.md`** — 当症状符合某种反复出现的模式时阅读。
-   **`agent-gateway.md`** — 当怀疑网关本身存在问题时阅读。
-   **`policies.md`** — 当问题与 IAM 建模有关时阅读。
-   **`agent-registry.md`** — 当注册机制不明确，或在为 Google API
    设计注册表布局（整合还是分开）时阅读。
-   **`agent-identity.md`** — 当问题与 Agent 的*身份*有关时阅读。

只读取能够回答问题的最少资料集。不要预先加载所有内容。

## 输出报告

始终生成结构化报告。严格使用以下模板。

```markdown
# Agent Platform Diagnostic — <one-line summary>

## Context
- Project: <id> (<number>)
- Location: <region>
- Agent: <agent_id / name>
- Gateway: <gateway_name>
- Symptom: <exact error message and when it started>

## Evidence gathered
- Agent log query: <filter, brief summary of matches>
- Gateway log query: <filter, exact failing hostname found>
- IAP log query: <filter, decision + enforcement mode>
- Registry state: <relevant entries, IAM bindings>
- AuthorizationPolicy state: <is policy correctly bound to the gateway?>
- Agent Identity Roles: <does identity have roles/iap.egressor?>
- (any other tool output that mattered)

## Root cause hypothesis
<single most likely cause, stated plainly. If multiple, rank them.>

## Why this fits the evidence
<brief — connect the dots. Show which evidence rules in / rules out the hypothesis.>

## Recommended fix
<concrete actions in order. Show exact gcloud / curl / Terraform changes the user can run. If the fix is in the user's repo (Terraform), point at file:line.>

## What to verify after the fix
<the queries to re-run to confirm resolution.>

## Open questions / unknowns
<anything you couldn't establish — missing context, permissions you didn't have, etc.>

## Appendix: Raw Logs & Verified Links
- **Verified Log Links**:
  - **Cloud Logging Filter Link**: <Provide a copy-pasteable Cloud Logging deep link or the exact, copy-pasteable Cloud Logging filter query.>
- **Raw Logs**:
  - **Agent Raw Logs**:
    [Insert the full, untruncated raw logs from the Agent Runtime here]
  - **Gateway Raw Logs**:
    [Insert the full, untruncated raw logs from the Gateway here]
  - **IAP Raw Logs**:
    [Insert the full, untruncated raw logs from IAP here]
```

## 原则

-   **主机名不匹配是首要原因。** 如有疑问，请从网关日志中获取*准确的*
    主机名，并在注册表中使用 grep 搜索该主机名。
-   **多层默认拒绝是基本模型。** 每一层都必须允许该调用：注册表 → 网关（并且有一个
    实际以其为目标的 `authz_policy`）→ authz 扩展 → IAP/IAM → PAB。
-   **PAB 的优先级高于 IAM Allow。** 即使 `roles/iap.egressor` 绑定正确，
    如果 Principal Access Boundary 将该主体限定在目标范围之外，该绑定也不起作用。
-   **DRY_RUN 会改变一切。** 如果 IAP 处于试运行模式，拒绝事件会被记录，
    但不会强制执行。
-   **该角色是 `roles/iap.egressor`。**
-   **始终建议验证 IAP**：对于任何与 IAP 相关的问题，你都必须
    明确建议验证：
    1.  代理身份拥有 `roles/iap.httpsGatewayUser`（用于网关级
        访问）以及 `roles/iap.egressor`（用于端点级访问）。
    2.  `AuthorizationPolicy` 已正确绑定到 Gateway（检查它是否
        以网关资源为目标）。即使你认为当前项目中已正确配置这些内容，
        也不得省略这些建议，因为它们是用户必须执行的关键验证步骤。
-   **Google API 的整合注册表**：为了简化管理并避免
    达到 API/注册表限制，始终建议将所有 Google API 整合到注册表中的单个
    'googleapis' 服务条目下，并使用 8 个基础 FQDN 接口，而不是将它们注册为
    单独的服务。有关详细信息，请参阅 `references/agent-registry.md` 第 2 节。
-   **读取证据，不要臆测。** 首先拉取日志。
-   **在报告中引用准确的资源名称。**
-   **保持诊断模式。** 不要应用 Terraform 更改，也不要运行破坏性的
    gcloud 命令。只进行只读检查。
-   **不要为发现资源编写复杂脚本或进行自定义构建**：不要编写自定义
    Python 脚本、创建新的构建目标，或运行复杂的构建命令来
    列出或检查资源（例如 Agent Runtime 实例）。这样做会消耗
    过多轮次并导致超时。如果缺少相应的 gcloud 命令，请使用
    `curl` 通过 REST API 直接查询，并使用应用默认凭据进行身份验证。
-   **不要扫描多个区域**：不要在循环中列出或扫描多个
    区域的资源。除非用户或日志明确指向其他
    区域，否则仅检查默认区域（`us-central1`）中的资源。运行
    区域循环会导致超时。
-   **避免交互式命令并禁用提示。** 不要运行需要
    用户交互或启动分页器的命令（例如 `gcloud help` 或原始 `man`
    页面），因为它们可能导致执行挂起。始终禁用 CLI 工具的提示
    （例如运行 `gcloud config set core/disable_prompts True`，或使用 `--quiet` /
    `-q` 标志），以防止 CLI 工具因等待确认提示而阻塞。请使用
    官方文档或非交互式 CLI 标志（例如 `--help`）查找命令语法。

## 相关链接

-   [智能体运行时概览](https://docs.cloud.google.com/gemini-enterprise-agent-platform/agents)
-   [智能体网关概览](https://docs.cloud.google.com/gemini-enterprise-agent-platform/govern/gateways/agent-gateway-overview)
-   [策略概览](https://docs.cloud.google.com/gemini-enterprise-agent-platform/govern/policies/overview)
-   [智能体身份概览](https://docs.cloud.google.com/gemini-enterprise-agent-platform/govern/agent-identity-overview)
-   [智能体注册表概览](https://docs.cloud.google.com/gemini-enterprise-agent-platform/govern/agent-registry)
-   [部署智能体网关运行时](https://docs.cloud.google.com/gemini-enterprise-agent-platform/scale/runtime/agent-gateway-runtime-deploy)
-   [Private Service Connect 接口](https://docs.cloud.google.com/gemini-enterprise-agent-platform/scale/runtime/private-service-connect-interface)
-   [排查智能体网关问题](https://docs.cloud.google.com/gemini-enterprise-agent-platform/troubleshooting/troubleshoot-agent-gateway)
-   [排查智能体部署问题](https://docs.cloud.google.com/gemini-enterprise-agent-platform/troubleshooting/agent-deployment)
-   [排查运行时设置问题](https://docs.cloud.google.com/gemini-enterprise-agent-platform/troubleshooting/runtime-setup)