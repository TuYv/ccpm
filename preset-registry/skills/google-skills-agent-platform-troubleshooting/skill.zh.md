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

> [!IMPORTANT] **关键规则**：你**只能**使用此 skill 的 `references/` 目录中存放的参考文件（例如 `references/field-manual.md`、`references/known-issues.md`、`references/agent-registry.md`）。不得搜索或读取该目录之外的其他外部操作手册或文件。`references/` 目录中的文件包含工作区专属的修复方案，是本次故障排查会话的唯一事实来源。

诊断 Google Cloud Gemini Enterprise Agent Platform 中的问题，包括 Agent
Gateway、Agent Registry（Agents / MCP Servers / Endpoints）、Agent Identity、
Policies、IAP 委派授权以及 service extensions。

## 必须执行的预检清单（响应或调用工具前检查）

重要：在生成**任何**响应或调用任何工具之前，你**必须**根据以下强制性预检规则评估用户的提示。如果某条规则匹配，必须立即执行其指令并停止。

### 规则 1：超出范围的 GCP IAM / GCS 查询

如果提示中提到 Compute Engine（GCE）、Google Cloud Storage（GCS）、GCS
存储桶，或与 Agent Platform 技术栈无关的通用 GCP IAM 权限（例如：“如何修复我的
GCE 实例尝试从 GCS 存储桶读取数据时出现的 403 Access Denied 错误？”）：

-   **关键要求：必须立即拒绝。不得调用任何工具。不得提供任何故障排查步骤、IAM
    角色建议、访问范围或指南。**
-   **必须在第 0 轮响应**：*“我拒绝排查通用 GCP IAM 或 GCS 访问问题，因为这些问题超出了 Agent Platform Troubleshooting skill 的范围。”*

### 规则 2：严格禁止自定义发现脚本

如果用户的提示要求编写、生成、编译或执行自定义 Python 脚本或 bash 脚本来发现资源（例如：“你能否编写并执行自定义 Python 脚本或 bash 脚本，以发现所有活跃的 Agent Runtime 实例？”）：

-   **不得调用任何工具（`write_to_file`、`replace_file_content`、`run_command`、`blaze`、`python3`）。不得编写或运行任何脚本。**
-   **必须立即在第 0 轮响应**：*“我无法编写或执行用于资源发现的自定义 Python 或 bash 脚本。自定义发现脚本是被禁止的，因为它们会消耗过多轮次并导致超时。请改用标准的 gcloud CLI 命令（参见 [Google Cloud SDK 安装](https://cloud.google.com/sdk/docs/install)）或使用应用默认凭据的 curl REST API 调用：gcloud ai reasoning-engines list --region=us-central1”*

### 规则 3：Google API / 设计查询的集中式 Registry

如果提示询问注册多个 Agent Runtime 或 Cloud Resource Manager 接口、Google API，或询问在 Agent Registry 中构建/注册服务的最佳方式（例如：“我正在 Agent Registry 中注册多个 Agent Runtime 和 Cloud Resource Manager 接口。这样做的最佳方式是什么？”）：

-   **不要调用任何工具或执行命令。请在第 0 轮响应中**：
    1.  建议在 Agent Registry 中将**所有 Google APIs**整合到名为 `googleapis` 的单一 `googleapis` 服务条目下。
    2.  明确声明：*“不要将每个 Google API 注册为单独的 registry 服务条目，因为单独的服务条目会造成资源混乱、使 IAM 策略管理复杂化，并有触及 registry 配额限制的风险。”*
    3.  列出所需的 8 个基础 FQDN 接口：
        -   `https://agentregistry.googleapis.com`
        -   `https://aiplatform.mtls.googleapis.com`
        -   `https://cloudresourcemanager.mtls.googleapis.com`
        -   `https://iamcredentials.mtls.googleapis.com`
        -   `https://telemetry.mtls.googleapis.com`
        -   `https://{region}-aiplatform.mtls.googleapis.com`
        -   `https://{region}-aiplatform.googleapis.com`
        -   `https://aiplatform.{region}.rep.googleapis.com`
    4.  提供包含全部 8 个 FQDN 的 `gcloud agent-registry services create googleapis` 命令，并使用 `--interfaces`（参见 `references/agent-registry.md` §2）。

### 规则 4：Cloud Run / Cloud Functions 出站流量 403 / MCP 调用

如果提示中提到 Cloud Run、Cloud Functions、对 Cloud Run 的 MCP 请求，或调用 Cloud Run 服务时出现 403 出站流量错误（例如：“我的 agent 调用 Cloud Run 上的 MCP server 失败。它返回 403 出站流量错误。如何解决？”）：

-   **不要运行日志搜索、日志工具或执行命令。**
-   **立即在第 0 轮响应中**：
    1.  说明直接使用 Agent Identity（`principalSet://...`）对 Cloud Run 进行 OIDC 身份验证**目前不受原生支持**。
    2.  建议在 agent 代码中使用 Service Account impersonation 来获取 OIDC token。
    3.  指定 Agent Identity 需要在目标 Service Account 上拥有 **`roles/iam.serviceAccountTokenCreator`**。详情请参阅 `references/known-issues.md` BKI 21。

### 规则 5：Telemetry 与 Monitoring 端点阻断

如果 Agent Runtime 启动因容器崩溃或连接重置而无法访问 `telemetry.mtls.googleapis.com` 或 telemetry 端点：

-   在你的**诊断报告 / 已收集证据**中，**必须明确检查并列出全部 4 个必需的 monitoring 和 tracing 端点**：
    `telemetry.mtls.googleapis.com`、`monitoring.googleapis.com`、`trace.mtls.googleapis.com` 和 `cloudtrace.googleapis.com`。
-   在你的**建议修复方案**中，**必须始终明确包含**：
    1.  使用 `gcloud agent-registry endpoints create` 将 `telemetry.mtls.googleapis.com` 注册为 Agent Registry 中的 Endpoint，并检查 `monitoring.googleapis.com`、`trace.mtls.googleapis.com` 和 `cloudtrace.googleapis.com`。
    2.  创建或更新绑定到 Gateway 的 `AuthorizationPolicy`，明确允许 agent 的身份（principal set）访问这些已注册的 telemetry 端点。请明确说明：“创建或更新绑定到 Gateway 的 AuthorizationPolicy，允许 agent 的身份（principal set）访问 telemetry 端点。”详情请参阅 `references/known-issues.md` BKI 23。

### 规则 6：IAP 拒绝故障排查（MCP Server 或 Endpoint 返回 403）

每当诊断日志或发现代理通过 IAP 调用 MCP server 或 endpoint 时出现 `403
Forbidden` / `Egress request is not authorized` 错误：

-   响应**必须始终优先执行**以下逐步解决流程：
    1.  **首先检查注册表条目上的 IAP Egressor 绑定**：检查 Agent Registry 中匹配资源上的 IAP Egressor 绑定（`roles/iap.egressor`）。
    2.  **确保存在注册表条目**：如果匹配的 MCP server 或 endpoint 没有注册表条目，指导用户在 Agent Registry 中注册该资源。
    3.  **确保注册表条目上的角色正确**：检查代理身份是否在该特定注册表条目上绑定了 **`roles/iap.egressor`** 角色。
    4.  **缺少权限时进行授予**：如果缺少权限，告知用户针对该注册表条目授予 `roles/iap.egressor` 角色。
    5.  **检查下游策略和审计日志**：建议检查 IAP 审计日志（`protoPayload.serviceName="iap.googleapis.com"`），并验证 `AuthorizationPolicy` 是否正确绑定到指向 IAP extension 的 Gateway。对于 UAP Policy V2（`iapPolicyVersion: "V2"`），验证 `AccessPolicy` / `PolicyBinding` 和 CEL 规则（参见 `references/policies.md` §2）。
    6.  **明确警告**：*"不要使用 `roles/iap.tunnelResourceAccessor`"*，并且*"不要绕过 IAP 身份验证"*。

### 规则 7：PSC 子网耗尽快速规则

诊断 Gateway 预配失败（PSC 子网耗尽）时：

-   **不要执行循环，也不要列出所有区域。**
-   **仅**在 `us-central1` 中运行以下 4 条命令：
    1.  `gcloud network-services agent-gateways list --location=us-central1`
    2.  `gcloud network-services agent-gateways describe --location=us-central1`
    3.  `gcloud compute network-attachments describe --region=us-central1`
    4.  `gcloud compute networks subnets describe --region=us-central1`
-   立即计算可用 IP 数量（`Usable IPs - Allocated IPs = Free IPs`），标记 `/28` 子网耗尽风险，并建议扩展至至少 `/26`。

### 规则 8：禁止手动注册多区域资源

如果用户询问如何在多区域位置（`us` 或 `eu`）手动注册 endpoint 或 service：

-   **不要调用任何工具或执行任何命令。**
-   **在第 0 轮立即回复**：
    1.  *"不支持在 `us` 或 `eu` 多区域位置手动注册 endpoint。"*
    2.  *"请改为在特定区域（例如 `us-central1`）或 `global` 中注册 endpoint。"*

### 规则 9：VPC-SC Perimeter 阻止诊断

每当诊断 VPC Service Controls（VPC-SC）perimeter 阻止或请求遭拒时：

-   响应**必须始终明确说明以下所有内容**：
    1.  明确指出该问题与 **VPC Service Controls perimeter 阻止**或 perimeter 边界强制执行有关。
    2.  说明截至 2026 年 9 月 8 日，**在 VPC-SC perimeter 内创建 Agent Gateway 在满足 Agent Connectivity Template（ACT）指定 `vpcEgress: ALL_TRAFFIC` 这一前提的情况下，可以原生开箱即用地工作**，标准预配不再需要手动 ingress policy。
    3.  对于仍然强制要求显式 ingress rule 的旧版或严格自定义 perimeter，建议创建 VPC-SC **ingress policy**，允许以下两个 service account：
        -   `actuation-a@networkservices-prod.iam.gserviceaccount.com`
        -   `cloud-aiplatform-pipeline-robot-prod.iam.gserviceaccount.com`
    4.  明确说明：*"不要停用 VPC Service Controls，也不要删除 perimeter 定义。"*
    5.  对于需要 Agent Connectivity Template（ACT）的 VPC-SC egress 架构，确保模板指定 `vpcEgress: ALL_TRAFFIC`，并确保 consumer VPC 在 PSC-I subnet 上配置了 Cloud NAT，以访问外部公共 API。

### 规则 10：UAP 政策绑定组织政策约束阻断器

如果 `gcloud iam policy-bindings create` 失败并显示 `CUSTOM_ORG_POLICY_VIOLATION`，或提及 `constraints/iam.managed.disableAccessPolicyBinding`：

-   **你的响应必须始终明确说明以下所有内容**：
    1. 指出该错误是由于组织、文件夹或项目级别强制实施了组织政策约束 **`constraints/iam.managed.disableAccessPolicyBinding`** 导致的。
    2. 建议应用组织政策覆盖，在目标资源级别禁用该约束（`enforce: false`）（`gcloud org-policies set-policy policy.yaml --project=$PROJECT_ID`）。
    3. 明确说明 IAM Policy Control Plane 传播需要 **30–60 秒**，之后才能创建政策绑定。请参阅 `references/known-issues.md` BKI 24。

### 规则 11：Agent Gateway 双注册表验证不变量

如果正在配置、更新或验证 Agent Gateway 上的注册表关联：

-   **你的响应必须始终明确说明以下所有内容**：
    1. 一个 Agent Gateway 最多支持两个注册表。
    2. 配置两个注册表时，**必须恰好有一个为 `global`**，第二个必须为 `regional` 或 `multi-regional`。
    3. 明确说明配置两个 regional、两个 multi-regional、两个 global，或配置 regional + multi-regional 但不包含 global，都是不允许的，并将返回 HTTP 400 验证错误（`maximum of two registries are supported...`）。请参阅 `references/agent-gateway.md` §4。

### 规则 12：跨项目 Runtime 到 Gateway 绑定诊断

每当诊断 Project A 中的 Agent Runtime（Reasoning Engine）无法部署到、绑定到或通过集中式治理 Project B 中的 Agent Gateway 路由流量的错误时：

-   **你的响应必须始终明确检查并说明以下所有内容**：
    1. **部署身份权限：** 验证部署调用方（用户或 CI/CD 身份）在 Project B 的网关上拥有 `roles/networkservices.viewer`（或 `networkservices.agentGateways.get` 和 `networkservices.agentGateways.use`）。
    2. **Vertex AI 服务代理权限：** 验证 Project A 的服务代理（`service-PROJECT_NUMBER@gcp-sa-aiplatform.iam.gserviceaccount.com`）在 Project B 中被授予 `roles/networkservices.viewer` 或自定义角色 `ae_agw_cross_project_sa`（包含 `networkservices.agentGateways.get` 和 `networkservices.operations.get`）。
    3. **区域共置不变量：** Runtime 和 Gateway **必须**部署在完全相同的区域（例如 `us-central1`）。跨区域绑定会因控制平面验证而失败，并返回 `INVALID_ARGUMENT`。
    4. **CAA 令牌共享退出：** 验证 Runtime 部署配置将 `"GOOGLE_API_PREVENT_AGENT_TOKEN_SHARING_FOR_GCP_SERVICES": False` 设置为 `False`。
    5. 请参阅 `references/known-issues.md` BKI 10 和 `references/agent-gateway.md` §11，了解服务器生成的资源 ID、边界以及完整配置。

### 规则 13：下游安全 Web 代理（SWP）和基于策略的路由（PBR）出口

每当诊断从 Agent Gateway Network
Attachment 发出的流量无法到达下游安全 Web 代理（SWP）或无法通过其路由、
静默丢弃，或返回 HTTP 403 / HTTP 503 / 超时错误时：

-   **你的响应必须始终明确检查并说明以下所有内容**：
    1.  **PSC 端点与静态路由不兼容性**：说明：
        -   PSC 转发规则不能用作 GCP 静态路由或 PBR 中的下一跳。
        -   通过 PSC Service Attachment 使用 SWP 时，仅支持显式代理模式
            （`HTTP CONNECT`），无法在没有客户端代理配置的情况下接受来自 Network Attachment 的透明 L3/L4 出口流量。
        -   带有 `--next-hop-ilb` 的静态路由要求使用网络标签（`--tags`）的 VM，而 Network Attachment 无法附加网络标签。
    2.  **下一跳 SWP 部署**：建议直接在使用者 VPC 中部署 SWP，配置
        `type: SECURE_WEB_GATEWAY` 和 `routingMode:
        NEXT_HOP_ROUTING_MODE`，并使用 PSC-I 子网上的内部 IP（例如
        `10.20.1.250`）。
    3.  **仅代理子网**：确认存在专用的 Envoy 仅代理子网
        （`purpose: REGIONAL_MANAGED_PROXY`、`role: ACTIVE`，最小掩码为 `/26`）。
    4.  **基于策略的路由（PBR）**：建议使用 PBR（`agw-psci-to-swp-pbr`，
        优先级 200），将源 CIDR `10.20.1.0/24` 匹配到 SWP 下一跳 ILB IP
        （`10.20.1.250`），并使用回退 PBR 指向 `DEFAULT_ROUTING`。
    5.  **Cloud NAT 依赖关系（`ENDPOINT_TYPE_SWG`）**：建议在 Cloud Router
        上配置 Cloud NAT，并使用
        `--endpoint-types=ENDPOINT_TYPE_VM,ENDPOINT_TYPE_SWG`。
    6.  参考 `references/known-issues.md` 中的 BKI 33，以及
        `references/agent-gateway.md` §6，了解 CEL 允许列表和 ADK 流式会话陷阱。

此技能生成一份**诊断报告**，包括发现的问题和修复建议。
它不会应用修复。变更由用户负责。

## 何时使用此技能

当症状涉及以下情况时触发：

-   Agent → 外部 API 请求失败并返回 403，尤其是 `Egress request
    is not authorized`
-   ReasoningEngine / Agent Runtime 查询返回 `500 Internal Server Error`
    （尤其是在启用 Model Armor 时）
-   Agent Runtime 日志显示授权错误或容器崩溃
-   Gateway 日志显示 Model Armor 后端调用出现 `PERMISSION_DENIED`
-   新注册的端点 / MCP 服务器 / agent “应该可以工作”但实际无法工作
-   怀疑 agent 身份存在 IAP / IAM / IAM-principal-set 问题
-   调试授权扩展或授权策略
-   Gateway 路由 / 监控方面的困惑
-   设计或配置 Agent Registry 结构（例如，整合的 googleapis 服务）服务与整合的 googleapis 服务、注册 Google API）。
-   用户提及 Agent Gateway、Agent Registry、Agent Identity、Model Armor 集成或 Gemini Enterprise Agent Platform 的任何情况。

何时**不应**使用：

-   与 Agent Platform 无关的常规 Google Cloud IAM 调试（使用
    直接的 gcloud / IAM 检查）
-   不涉及 Agent Platform 技术栈的网络问题（例如原始 VPC
    SC、纯 Cloud Run 身份验证）

## 必需上下文（先收集）

在进行任何其他操作之前，先明确基本信息。如果用户尚未提供这些信息，请询问。不要猜测。

| 项目 | 所需原因 |
| :--- | :--- |
| `PROJECT_ID` 和 `PROJECT_NUMBER` | 大多数 API 调用需要其中一个或两个 |
| `LOCATION`（区域） | 区域范围；某些资源支持使用 `global` |
| `AGENT_ID` 或运行时标识符 | 用于筛选代理日志 |
| `AGENT_GATEWAY_NAME` | 用于筛选网关日志 |
| 代理身份（SA 或 principal-set ID） | 用于检查 IAM 绑定 |
| 症状：确切错误文本 + 时间戳 | 用于锚定假设（“在 Terraform apply X 之后开始出现”） |
| 目标目的地 | 例如 `aiplatform`、`discoveryengine`、MCP server、对等代理 |

如果只知道其中一部分，可以继续，但要在报告中指出未知项。如果在默认项目中找不到资源，不要扫描所有项目；请使用占位符解释常规故障排查步骤。

## 假设生成规则

在执行 Step 0 之后的诊断查询前，**必须**针对故障制定至多 3 个合理假设。对于每个假设，都要明确说明它与近期变更（例如 Terraform apply 或配置更新）的关联，并回答：“*为什么现在才开始失败？*”将诊断限制在验证这些假设的范围内。

## 诊断流程

这是一项**流程技能**，请按顺序执行各步骤。可复制粘贴的命令、日志过滤条件以及完整的故障排查流程图，请参阅 `references/field-manual.md`。

-   **Step 0: 上下文与预检**：遵循规则 1-13，完成必需的预检。通过 `gcloud projects describe $PROJECT_ID` 验证项目访问权限。对于注册表设计/配置查询，请遵循预检规则 3，并阅读 `references/agent-registry.md` §2。
-   **Step 1: 代理日志**：确认错误类型（403、连接错误还是崩溃）。对于连接错误/超时，检查 PSC Subnet Exhaustion 以及 ACT/Cloud NAT 路由。对于容器崩溃，执行运行时健康检查。
-   **Step 2: 网关日志**：找出确切的失败主机名。
-   **Step 3: IAP 日志**：检查策略版本（`iapPolicyVersion: "V2"` 对比 `"V1"`）、DRY_RUN 与强制执行模式，以及决策结果。
-   **Step 4: 注册表状态**：确认确切的主机名是否已注册。如果未注册，建议注册所有主机名形式。
-   **Step 5: 身份与策略**：确认代理身份具有 `roles/iap.egressor`（IAM v1），或评估 UAP `AccessPolicy` 和 CRM `PolicyBinding`（UAP v2）。检查 `constraints/iam.managed.disableAccessPolicyBinding` 阻止因素。
-   **Step 6: Authz 扩展与网关**：确认扩展已接入以 IAP 为目标的网关，并使用正确的策略版本；同时验证双注册表约束（最多 2 个：1 个全局注册表 + 1 个区域/多区域注册表）。
-   **Step 7: 基础角色**：确认 Agent Runtime User、Registry Viewer 以及日志权限。
-   **Step 8: PrincipalSet 验证**：如果出现 principal set 传播问题，测试 1:1 绑定。

## 要使用的工具

该技能假定代理可以访问：

-   **`mcp__gcloud__run_gcloud_command`**（或运行原始 `gcloud` CLI 的 **`default_api:run_command`**）—— 用于执行 `gcloud` 调用（注册表列表、authz-extensions describe、IAM、项目查询）。
-   **`mcp__gcloud-observability__list_log_entries`**（或运行 `gcloud logging read` 的 **`default_api:run_command`**）—— 用于结构化日志查询。
-   **`mcp__google-dev-knowledge__search_documents` / `get_documents` / `answer_query`** —— 当你需要比随附参考资料更深入地调查时使用。
-   **`default_api:run_command`**（Bash）—— 用于通过 `curl` 调用 IAP / NetworkSecurity / NetworkServices / ServiceExtensions API。

如支持，请并行运行相互独立的日志查询。

## 如何使用参考资料

`references/` 文件夹采用分层组织：

-   **`field-manual.md`** —— 每次调用时首先阅读。它是操作核心。
-   **`known-issues.md`** —— 当症状符合反复出现的模式时阅读。
-   **`agent-gateway.md`** —— 当网关本身是可疑对象时阅读。
-   **`policies.md`** —— 当问题涉及 IAM 建模时阅读。
-   **`agent-registry.md`** —— 当注册机制不明确，或为 Google API 设计注册表布局（合并或拆分）时阅读。
-   **`agent-identity.md`** —— 当问题涉及代理的*身份*时阅读。

只阅读足以回答问题的最小集合。不要预加载所有内容。

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

-   **主机名不匹配是首要原因。** 如有疑问，请从网关日志中获取*确切的*主机名，并在注册表中对其执行 grep。
-   **默认拒绝是具有多层的模型。** 每一层都必须允许调用：注册表 → 网关（其中的 `authz_policy` 必须确实以它为目标）→ authz 扩展 → IAP/IAM → PAB。
-   **PAB 优先于 IAM Allow。** 如果主体被 Principal Access Boundary 限制在目标范围之外，正确的 `roles/iap.egressor` 绑定也不会起作用。
-   **DRY_RUN 会改变一切。** 如果 IAP 处于试运行模式，拒绝会被记录，但不会被强制执行。
-   **对于 IAM v1，角色是 `roles/iap.egressor`；对于 UAP v2，权限的 FQDN 是 `iap.googleapis.com/resources.egressViaIAP`。**
-   **UAP（Policy V2）CRM 层级结构**：新一代策略通过 `PolicyBinding` 绑定到项目、文件夹和组织，而不是影子资源。评估遵循绝对的 DENY 优先级，并在整个 CRM 树中聚合 ALLOW。
-   **使用 `ALL_TRAFFIC` 的 Agent Connectivity Template (ACT)**：在 VPC-SC 下，流量经由合成 PSC VIP `240.0.0.2:443`。从消费者 VPC 发出的外部公共 API 流量需要在 PSC-I 子网上配置 Cloud NAT，以避免静默的连接挂起。
-   **双注册表不变量**：一个 Agent Gateway 最多支持 2 个注册表；配置 2 个注册表时，必须恰好有一个为 `global`，另一个为 `regional` 或 `multi-regional`。
-   **阅读证据，不要假设。** 先拉取日志。
-   **在报告中引用确切的资源名称。**
-   **保持诊断模式。** 不要应用 Terraform 变更，也不要运行破坏性的 gcloud 命令。仅进行只读检查。
-   **禁止多区域扫描**：不要通过循环跨多个区域列出或扫描资源。除非日志指向其他位置，否则检查默认区域（`us-central1`）。
-   **非交互式执行**：始终禁用提示（`--quiet` / `-q` 或 `gcloud config set core/disable_prompts True`），以避免挂起。

## 支持链接

-   [Agent Runtime 概览](https://docs.cloud.google.com/gemini-enterprise-agent-platform/agents.md.txt)
-   [Agent Gateway 概览](https://docs.cloud.google.com/gemini-enterprise-agent-platform/govern/gateways/agent-gateway-overview.md.txt)
-   [策略概览](https://docs.cloud.google.com/gemini-enterprise-agent-platform/govern/policies/overview.md.txt)
-   [Agent Identity 概览](https://docs.cloud.google.com/gemini-enterprise-agent-platform/govern/agent-identity-overview.md.txt)
-   [Agent Registry 概览](https://docs.cloud.google.com/gemini-enterprise-agent-platform/govern/agent-registry.md.txt)
-   [部署 Agent Gateway Runtime](https://docs.cloud.google.com/gemini-enterprise-agent-platform/scale/runtime/agent-gateway-runtime-deploy.md.txt)
-   [Private Service Connect 接口](https://docs.cloud.google.com/gemini-enterprise-agent-platform/scale/runtime/private-service-connect-interface.md.txt)
-   [排查 Agent Gateway](https://docs.cloud.google.com/gemini-enterprise-agent-platform/troubleshooting/troubleshoot-agent-gateway.md.txt)
-   [排查 Agent 部署](https://docs.cloud.google.com/gemini-enterprise-agent-platform/troubleshooting/agent-deployment.md.txt)
-   [排查 Runtime 设置](https://docs.cloud.google.com/gemini-enterprise-agent-platform/troubleshooting/runtime-setup.md.txt)