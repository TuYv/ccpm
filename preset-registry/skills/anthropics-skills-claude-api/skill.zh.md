---
name: claude-api
description: |-
  Reference for the Claude API / Anthropic SDK — model ids, pricing, params, streaming, tool use, MCP, agents, caching, token counting, model migration.
  TRIGGER — read BEFORE opening the target file; don't skip because it "looks like a one-liner" — whenever: the prompt names Claude/Anthropic in any form (Claude, Anthropic, Fable, Opus, Sonnet, Haiku, `anthropic`, `@anthropic-ai`, `claude-*`, `us.anthropic.*`, `[1m]`); the user asks about an LLM (pricing/model choice/limits/caching) — never answer from memory; OR the task is LLM-shaped with provider unstated (agent/MCP/tool-definition/multi-agent/RAG/LLM-judge/computer-use; generate/summarize/extract/classify/rewrite/converse over NL; debugging refusals/cutoffs/streaming/tool-calls/tokens).
  SKIP only when another provider is being worked on (overrides all triggers): OpenAI/GPT/Gemini/Llama/Mistral/Cohere/Ollama named in the query; OR `grep -rE 'openai|langchain_openai|google.generativeai|genai|mistralai|cohere|ollama'` over the project hits (run this grep FIRST if no provider named — don't Read the file).
license: Complete terms in LICENSE.txt
---
# 使用 Claude 构建 LLM 驱动应用

本技能帮助你使用 Claude 构建由 LLM 驱动的应用。根据你的需求选择合适的 surface，先检测项目语言，再读取相关的语言特定文档。

## 开始之前

扫描目标文件（如果没有目标文件，则扫描提示词和项目）中是否有非 Anthropic 提供商的标记——`import openai`、`from openai`、`langchain_openai`、`OpenAI(`、`gpt-4`、`gpt-5`、`agent-openai.py` 或 `*-generic.py` 这类文件名，或任何明确要求保持代码与 provider 无关的指示。若发现上述内容，立即停止并告知用户该技能生成的是 Claude/Anthropic SDK 代码；询问用户是否希望将文件切换到 Claude，或改用非 Claude 实现。不要在非 Anthropic 文件中使用 Anthropic SDK 调用进行编辑。

## 输出要求

当用户要求你添加、修改或实现 Claude 功能时，你的代码必须通过以下任一方式调用 Claude：

1. **该项目语言的官方 Anthropic SDK**（`anthropic`、`@anthropic-ai/sdk`、`com.anthropic.*` 等）。在该项目语言存在支持的 SDK 时，这是默认方式。
2. **原始 HTTP**（`curl`、`requests`、`fetch`、`httpx` 等）——仅当用户明确要求 cURL/REST/raw HTTP，或项目是 shell/cURL 项目，或该语言没有官方 SDK 时使用。

切勿混用两者——不要因为觉得更轻量就对 Python 或 TypeScript 项目使用 `requests`/`fetch`。也不要回退到 OpenAI 兼容的 shim。

**不要猜测 SDK 用法。** 函数名、类名、命名空间、方法签名和导入路径必须来自明确的文档，要么来自该技能中的 `{lang}/` 文件，要么来自 `shared/live-sources.md` 中列出的官方 SDK 仓库或文档链接。若所需绑定未在技能文件中明确列出，请在编写代码前先 WebFetch 相应 SDK 仓库。不要根据 cURL 形状或其他语言 SDK 推断 Ruby/Java/Go/PHP/C# API。

**如果 WebFetch 或仓库访问失败**（网络受限、超时、克隆受阻）：不要反复重试——改为按 `{lang}/` 文件中的模式和命名空间/包表编写代码，运行编译器或解释器检查，并根据错误输出迭代修复。对于静态类型 SDK（C#、Java、Go），与其被阻塞的网络调研相比，本地错误驱动的编译修正循环通常更快地得到可运行代码。

## 默认设置

除非用户另有要求：

Claude 模型版本请使用 Claude Opus 5，你可通过精确模型字符串 `claude-opus-5` 访问。对于任何有一定复杂度的请求，请默认使用自适应思考（`thinking: {type: "adaptive"}`）。最后，对于可能涉及长输入、长输出或较高 `max_tokens` 的请求，请默认启用流式输出；这样可避免请求超时。若你无需处理单独的流事件，请使用 SDK 的 `.get_final_message()` / `.finalMessage()` 助手获取完整响应。

## ⚠️ API Drift — 你的训练先验可能已过时

2025–2026 年有多个常见 Claude API 形态发生了变化。如果你凭记忆调用了某种模式，请在编写前先以该技能的 `{lang}/` 文件核验——下表是最常见的 drift 点：

| 区域 | 过时先验 | 当前 API |
|---|---|---|
| 扩展思考 | `thinking: {type: "enabled", budget_tokens: N}` | 在 Claude 4.6+ 模型中使用 `thinking: {type: "adaptive"}`。`budget_tokens` 在 Opus 4.6 / Sonnet 4.6 上仍会弃用，并且在 Fable 5 / Sonnet 5 / Opus 5 / 4.8 / 4.7 上会被拒绝并返回 **400**。4.6 以下模型仍使用 `budget_tokens`。 |
| 网页搜索 / 网页抓取工具类型 | `web_search_20250305`, `web_fetch_20250910` | 在 Opus 5/4.8/4.7/4.6、Sonnet 5 和 Sonnet 4.6 上使用 `web_search_20260209`, `web_fetch_20260209`（动态过滤）；旧模型仍保留基础变体；在 Vertex AI 上仅有基础 `web_search_20250305` 可用（web fetch 在 Vertex 上不可用）——见下文 Server Tools QR。 |
| PHP 参数名 | 以下划线命名且作为命名参数的 wire 名（如 `max_tokens`） | 顶层命名参数为驼峰式（如 `maxTokens`）。嵌套数组键会因特性不同而变化（例如 `'taskBudget'`、`'skillID'`、`'mcp_server_name'`）——请从文档示例中原样复制键名，不要批量转换。 |
| 托管代理凭据 | 仅支持自定义工具在主机端保留密钥（vault 上线前唯一选项） | Vault `environment_variable` 凭据——由 Anthropic 存储，在出网时替换，在沙箱中不可见（见 `shared/managed-agents-tools.md` → Vaults）。自托管沙箱仍以主机端自定义工具作为兜底。 |

该技能中的 `{lang}/` 文件在回忆的模式之上具有最高权威性。

---

## 子命令

如果本提示底部的用户请求是一个裸子命令字符串（无正文），请检索本文档中的每个 **子命令** 表（包括后续附加部分中的任何表），并直接按匹配的 Action 列执行。这使用户可通过 `/claude-api <子命令>` 触发特定流程。若文档中没有匹配的表格，则按普通正文处理。

| Subcommand | Action |
|---|---|
| `migrate` | 将现有 Claude API 代码迁移到更新的模型。**立即阅读 `shared/model-migration.md` 并按顺序执行**：第 0 步（确认范围——在任何编辑之前先询问文件/目录），第 1 步（分类每个文件），然后执行每个目标模型对应的破坏性变更部分。不要总结该指南——请执行它。如果用户未指定目标模型，请与范围确认问题在同一回合中询问要迁移到哪个模型。 |

## 语言检测

在阅读代码示例前，先确定用户在使用哪种语言：

1. **查看项目文件** 来推断语言：

   - `*.py`, `requirements.txt`, `pyproject.toml`, `setup.py`, `Pipfile` → **Python**——从 `python/` 读取
   - `*.ts`, `*.tsx`, `package.json`, `tsconfig.json` → **TypeScript**——从 `typescript/` 读取
   - `*.js`, `*.jsx`（项目中不存在 `.ts` 文件）→ **TypeScript**——JS 与 TypeScript 使用同一 SDK，从 `typescript/` 读取
   - `*.java`, `pom.xml`, `build.gradle` → **Java**——从 `java/` 读取
   - `*.kt`, `*.kts`, `build.gradle.kts` → **Java**——Kotlin 使用 Java SDK，从 `java/` 读取
   - `*.scala`, `build.sbt` → **Java**——Scala 使用 Java SDK，从 `java/` 读取
   - `*.go`, `go.mod` → **Go**——从 `go/` 读取
   - `*.rb`, `Gemfile` → **Ruby**——从 `ruby/` 读取
   - `*.cs`, `*.csproj` → **C#**——从 `csharp/` 读取
   - `*.php`, `composer.json` → **PHP**——从 `php/` 读取

2. **若检测到多种语言**（例如 Python 和 TypeScript 文件同时存在）：

   - 检查用户当前文件或问题对应的语言
   - 若仍模糊，则询问：“I detected both Python and TypeScript files. Which language are you using for the Claude API integration?”

3. **若无法推断语言**（空项目、无源码文件或不支持的语言）：

   - 使用 AskUserQuestion 给出选项：Python、TypeScript、Java、Go、Ruby、cURL/raw HTTP、C#、PHP
   - 若 AskUserQuestion 不可用，默认展示 Python 示例，并注明：“Showing Python examples. Let me know if you need a different language.”

4. **若检测到不支持的语言**（Rust、Swift、C++、Elixir 等）：

   - 建议使用 `curl/` 中的 cURL/raw HTTP 示例，并说明社区 SDK 可能存在
   - 提供 Python 或 TypeScript 示例作为参考实现

5. **若用户需要 cURL/raw HTTP 示例**，从 `curl/` 读取。

### 语言特定功能支持

以上所有 SDK 语言均支持 beta Tool Runner 和托管代理（测试版）——Python（`@beta_tool` 装饰器）、TypeScript（`betaZodTool` + Zod）、Java（注解类）、Go（`toolrunner` 包中的 `BetaToolRunner`）、Ruby（`BaseTool` + `tool_runner`）、C#（`BetaToolRunner` + 原始 JSON schema）、PHP（`BetaRunnableTool` + `toolRunner()`）；代码入口位于后续的 Tool Use Patterns 快速参考中。cURL 为 raw HTTP（无 SDK 特性）且支持托管代理。

> **托管代理代码示例**：见下文 `## Managed Agents (Beta)` 部分的阅读说明。

---
---

## 我应该使用哪个 Surface？

> **从简单开始。** 优先选择满足需求的最简层级。单次 API 调用和工作流能处理大多数场景——只有在任务确实需要开放式、模型驱动的探索时才使用 agent。**“最简单”**意味着你自己要维护的代码最少：对于托管式、定时或有记忆功能的 agent，Managed Agents 通常是最简单的选择（无需循环代码、无需状态文件、无需调度器），即使它是一个更庞大的平台。

| 使用场景                                        | 层级            | 推荐 Surface       | 原因                                                          |
| ----------------------------------------------- | --------------- | ------------------------- | ------------------------------------------------------------ |
| 分类、摘要、抽取、问答  | 单次 LLM 调用 | **Claude API**            | 一个请求，一个响应                                    |
| 批处理或嵌入向量                  | 单次 LLM 调用 | **Claude API**            | 专用端点                                        |
| 带有代码控制逻辑的多步骤流水线 | 工作流        | **Claude API + tool use** | 你来编排循环                                     |
| 使用你自己的工具的自定义 agent                | Agent           | **Claude API + tool use** | 最强灵活性                                          |
| 具有工作区的服务器托管有状态 agent    | Agent           | **Managed Agents**        | Anthropic 运行循环并托管工具执行沙箱 |
| 可持久化、版本化的 agent 配置              | Agent           | **Managed Agents**        | Agent 是可存储对象；会话会绑定到某个版本         |
| 具有文件挂载的长时多轮 agent  | Agent           | **Managed Agents**        | 每会话容器、SSE 事件流、Skills + MCP       |
| 按计划运行的 agent（cron、“每晚一次”） | Agent       | **Managed Agents** — 定时部署 | 部署会自动触发会话；无需客户端侧调度器 |

> **注意：** 当你希望 Anthropic 运行 agent 循环并托管工具执行容器（文件操作、bash、代码执行都在每会话工作区内运行）时，Managed Agents 是正确选择。如果你希望自行托管计算资源或运行自定义工具运行时，Claude API + tool use 是正确选择——使用工具运行器执行 agentic 循环——其逐轮钩子仍可提供审批门、日志、错误拦截和条件执行（见 `shared/tool-use-concepts.md`）——或者使用手动循环，当你希望完全掌控整个循环时。

> **云服务提供商接入。** **Claude Platform on AWS** 由 Anthropic 运营，并与 API 保持同日同步——客户端配置请参见 `shared/claude-platform-on-aws.md`。关于 **Claude Platform on AWS**、**Amazon Bedrock**、**Google Vertex AI** 和 **Microsoft Foundry** 的逐项功能可用性，请参见 `shared/platform-availability.md`——该表是本 skill 的唯一事实来源；请不要从其他地方推断可用性。

### 构建 Agent：四种方法

一旦你确认确实需要一个 agent（开放式、模型驱动的工具使用），就有四种不同方式。两个独立问题将它们区分开来：**谁提供 harness**（agent 循环 + 上下文管理）以及**谁提供部署**（agent 运行的基础设施）。Tool Runner 和 Claude Agent SDK 都只提供*仅 harness*——你仍需自行托管并部署它们——这也是它们容易被混淆的原因。Managed Agents（CMA）是唯一同时提供 harness 和托管部署的选项；手动循环则两者都不提供。

| # | 方法 | 你编写 | Harness 与部署 | 可用工具 | 使用场景 |
|---|----------|-----------|----------------------|-----------------|----------|
| 1 | **Claude API — 手动循环** | 自己编写 `while stop_reason == "tool_use"` 循环 | 你构建 harness；你托管 | 你定义的工具 | 你希望拥有完整循环：无需 beta 依赖，或控制流不适配 Tool Runner 的逐轮钩子 |
| 2 | **Claude API — Tool Runner**（`client.beta.messages.tool_runner` + `@beta_tool` / `betaZodTool`） | 仅工具函数 | SDK 提供循环（*仅 harness*）；你托管 | 你定义的工具 | 使用自定义工具 agent 且无需手写循环（大多数场景）。逐轮钩子仍提供审批门、错误拦截、结果修改（例如 `cache_control`）、重试、流式和压缩 |
| 3 | **Managed Agents**（REST，beta） | Agent 配置 + 你的工具结果 | Anthropic 提供 harness 并托管每会话沙箱（*harness + 部署*） | Anthropic 托管沙箱（bash、文件、代码执行）+ Skills/MCP + 你的工具 | 你希望 Anthropic 运行循环并托管每会话工作区；配置可持久化/版本化；会话可长时间运行 |
| 4 | **Claude Agent SDK** — *独立产品*（`claude-agent-sdk` / `@anthropic-ai/claude-agent-sdk`） | 提示词 + 选项 | SDK 提供 Claude Code harness 与内置工具（*仅 harness*）；你托管 | 内置 Read/Write/Edit/Bash/Glob/Grep/WebSearch/WebFetch + MCP + 子代理 | 你希望在自己的基础设施上运行开箱即用的代码/文件系统 agent |

Harness 与部署的拆分是关键思维模型：方案 1、2、4 都将部署留给你；只有方案 3（CMA）提供托管部署。1–3 是本 skill 生成的内容；方案 4 是一个有独立文档的不同库——见下方澄清。

> **Tool Runner ≠ Claude Agent SDK。** 它们听起来相似，但属于不同包：
> - **Tool Runner** 是标准 Anthropic API SDK（`anthropic` / `@anthropic-ai/sdk`）的一部分，通过 `client.beta.messages.tool_runner` 使用。它自动化请求→执行→循环这一周期，用于你定义的工具。没有内置工具、无文件系统访问、无沙箱——你需提供全部工具并托管计算资源。它是上面的方案 2，是 `POST /v1/messages` 之上的轻量封装。
> - **Claude Agent SDK**（`claude-agent-sdk` / `@anthropic-ai/claude-agent-sdk`）是 Claude Code 作为库的封装。它内置工具（文件读写编辑、bash、grep、网页搜索）、完整 agent 循环、上下文管理、钩子、子代理、权限与会话。你调用 `query(prompt, options)` 并让它驱动一切。
>
> 两者都是**仅 harness**——由你部署和托管。差异在于 harness 的范围：Tool Runner 循环的是你定义的工具（并带有审批、拦截、结果修改和重试等逐轮钩子——但无内置工具）；Agent SDK 则是具备内置工具的完整 Claude Code harness。二者都不提供托管部署——这正是 **Managed Agents（CMA）** 的增益点（Anthropic 托管循环和每会话沙箱）。
>
> **本 skill 覆盖 Claude API 与 Managed Agents（方案 1–3）；不生成 Claude Agent SDK 代码。** 如果用户确实要使用 Claude Agent SDK，请引导到其文档（`code.claude.com/docs/en/agent-sdk`）——不要用 API Tool Runner 替代它，反之亦然。

### 我是否该构建一个 Agent？

在选择 agent 层级前，先检查以下四个标准：

- **复杂度**——任务是多步骤且无法提前完全指定吗？（例如“将这份设计文档转成 PR”与“从这份 PDF 提取标题”）
- **价值**——输出结果是否能证明更高成本和延迟是值得的？
- **可行性**——Claude 能胜任这类任务吗？
- **错误成本**——错误能否被捕获并恢复？（测试、评审、回滚）

如果这四项中任一项答案为“否”，请保持在更简单层级（单次调用或工作流）。

---

## 架构

所有调用都通过 `POST /v1/messages` 完成。工具与输出约束是这个单一端点的特性，不是独立 API。

**用户定义工具**——你定义工具（通过装饰器、Zod schema 或原始 JSON），SDK 的 tool runner 负责调用 API、执行你的函数，并循环调用直到 Claude 完成。若要完全控制，你可以手动编写循环。

**服务器端工具** — 运行在 Anthropic 基础设施上的 Anthropic 托管工具。代码执行完全在服务器端进行（在 `tools` 中声明后，Claude 会自动运行代码）。Computer use 可以是服务器托管或自托管。

**结构化输出** — 限制 Messages API 的响应格式（`output_config.format`）和/或工具参数验证（`strict: true`）。推荐的方法是使用 `client.messages.parse()`，它会自动按照你的 schema 验证响应。注意：旧的 `output_format` 参数已弃用；请在 `messages.create()` 上使用 `output_config: {format: {...}}`。

**支持端点** — 批量（`POST /v1/messages/batches`）、文件（`POST /v1/files`）、令牌计数（`POST /v1/messages/count_tokens` — 见 `shared/token-counting.md`）、以及模型（`GET /v1/models`、`GET /v1/models/{id}` — 实时能力/上下文窗口发现）会为 Messages API 请求提供支持或输入支持。

---

## Current Models (cached: 2026-06-24)

| Model             | Model ID            | Context        | Input $/1M | Output $/1M |
| ----------------- | ------------------- | -------------- | ---------- | ----------- |
| Claude Fable 5    | `claude-fable-5`      | 1M             | $10.00     | $50.00      |
| Claude Mythos 5（仅 Project Glasswing） | `claude-mythos-5` | 1M | $10.00     | $50.00      |
| Claude Opus 5     | `claude-opus-5`       | 1M             | $5.00      | $25.00      |
| Claude Opus 4.8 | `claude-opus-4-8`  | 1M             | $5.00      | $25.00      |
| Claude Opus 4.7   | `claude-opus-4-7`   | 1M             | $5.00      | $25.00      |
| Claude Opus 4.6   | `claude-opus-4-6`   | 1M             | $5.00      | $25.00      |
| Claude Sonnet 5   | `claude-sonnet-5`   | 1M             | $3.00（$2.00 入门费率，直至 2026-08-31） | $15.00（$10.00 入门费率） |
| Claude Sonnet 4.6 | `claude-sonnet-4-6` | 1M             | $3.00      | $15.00      |
| Claude Haiku 4.5  | `claude-haiku-4-5`  | 200K           | $1.00      | $5.00       |

**合作方定价：** 上述价格是 Anthropic 官方 API 费率——也适用于 Claude on Microsoft Foundry，该服务按微软市场标准 API 费率计费。Claude on Amazon Bedrock 和 Vertex AI 由合作方运营，采用独立定价——见 [Bedrock](https://aws.amazon.com/bedrock/pricing/) 或 [Vertex AI](https://cloud.google.com/vertex-ai/generative-ai/pricing#claude-models)。对于 WebFetch，请使用 `shared/live-sources.md` 中的 Pricing 行。

**除非用户明确指定其他模型，否则** **始终使用 `claude-opus-5`**。这不是可协商项。除非用户明确说“use sonnet”或“use haiku”，否则不要使用 `claude-sonnet-5`、`claude-sonnet-4-6` 或任何其他模型。不要为了省成本而降级——这是用户的决策，不是你的。仅当用户明确要求 Claude Fable 5、“fable”或 Anthropic 最强模型时才使用 `claude-fable-5`，它与 Opus 系列有不同的 API 行为（见下文），且定价高于 Opus 档位。**只使用表格中的精确模型 ID 字符串——它们已完整无缺；不要追加日期后缀**（使用 `claude-sonnet-4-6`，而不是 `claude-sonnet-4-6-20251114` 或你从训练数据中记忆到的任何其他日期后缀变体）。如果用户请求了表中未列出的旧模型（例如“opus 4.5”“sonnet 3.7”），请阅读 `shared/models.md` 获取准确 ID，不要自行构造。

### Claude Fable 5 (`claude-fable-5`) — 最强泛发布模型

Claude Fable 5 是 Anthropic 最强的泛发布模型，适用于最苛刻的推理和长时程智能体任务；以下内容同样适用于 **Claude Mythos 5**（`claude-mythos-5`，Project Glasswing — 具备相同能力、价格和 API 表面；`claude-mythos-preview` 邀请制版本的继任者）。1M 上下文窗口（该最大值同时为默认值），128K 最大输出。与 Opus 档位相比的关键 API 差异见 `shared/model-migration.md` → Migrating to Claude Fable 5：

- **Thinking 始终开启** — 完全省略 `thinking` 参数（或发送 `{type: "adaptive"}`）。任何其他显式配置都会被拒绝：`{type: "disabled"}` 和 `{type: "enabled", budget_tokens: N}` 都返回 400。通过 `output_config.effort` 控制深度（支持 `low` 到 `xhigh` 和 `max`）。
- **不会返回原始思维链** — 响应包含常规 `thinking` 块（不是 `redacted_thinking`）：`display: "summarized"` 会返回可读摘要，`"omitted"`（默认）将 `thinking` 字段保留为空字符串。重放规则：在同一模型中按原样返回思维块；其他模型会静默丢弃它们（不计费——无需移除）；详情见 `shared/model-migration.md`。
- **Tokenizer** — 与 Opus 4.8 相同（随 Opus 4.7 引入）。从 Opus 4.7/4.8 迁移时 token 数大致不变；但每 token 计费不同。若来自 Opus 4.6、Sonnet、Haiku 或更早版本，请用 `count_tokens` 重新基准化（Opus 4.7 tokenizer 使用约 1×–1.35× 更多 token）。
- **`refusal` 停止原因 — 处理它，并默认选择 fallback** — 安全分类器可能拒绝请求（HTTP 200，`stop_reason: "refusal"`，并带有 `stop_details` 分类）；始终在读取 `content` 前检查 `stop_reason`。**当你编写 `claude-fable-5` 或 `claude-opus-5` 代码时，请默认包含服务器端 `fallbacks` 参数。** 最简形式：`betas: ["server-side-fallback-2026-07-01"]` + `fallbacks: "default"`，它按拒绝分类路由，因此你不必维护模型列表。（旧的数组形式——`betas: ["server-side-fallback-2026-06-01"]` + `fallbacks: [{"model": "claude-opus-4-8"}]`——仍然可用；Claude API 和 Claude Platform on AWS——在 Bedrock、Vertex 和 Foundry 上，应使用 SDK 的客户端侧 `BetaRefusalFallbackMiddleware` + `BetaFallbackState`。）请告知用户你已启用该功能；除非用户拒绝，否则不要关闭。完整语义（计费、流式中拒绝、信用重定价）见 `shared/model-migration.md` → refusal 部分。**`{lang}/claude-api/README.md` 中的逐语言示例仅覆盖数组形式**——对于 `"default"` 模式，请按 `shared/model-migration.md` → Migrating to Claude Opus 5 → New API features 中的原始 HTTP 形态，改为 `fallbacks: "default"` 并使用 `-2026-07-01` header；请求的其余部分保持不变。
- **无 assistant prefill** — 与 4.6+ 系列其余模型相同。
- **需要 30 天数据保留期** — Claude Fable 5 不适用于零数据保留；保留配置不符合要求的组织发起的请求会返回 `400 invalid_request_error`。
- **更长的会话、更改提示策略** — 困难任务的单次请求可能运行数分钟（计划超时/流式/进度 UX）；常规工作应包含 low/medium 的 effort 扫描；为旧模型编写的提示往往过于规定，可能降低输出质量。见 `shared/model-migration.md` → Migrating to Claude Fable 5 → Behavioral shifts（可调提示）中的推荐提示片段。

如果上方任何模型字符串看起来不熟悉，只是说明它们在你的训练截止数据之后发布——它们都是真实模型。

**实时能力查询：** 上表为缓存结果。当用户询问“X 的上下文窗口是多少”、“X 是否支持 vision/thinking/effort”，或“哪些模型支持 Y”时，请查询 Models API（`client.models.retrieve(id)` / `client.models.list()`）——字段参考和能力过滤示例见 `shared/models.md`。

---

## Authentication (Quick Reference)

**未设置 `ANTHROPIC_API_KEY` 并不表示没有凭据。** SDK 与 `ant` CLI 按以下顺序解析凭据（先匹配优先）：`ANTHROPIC_API_KEY` → `ANTHROPIC_AUTH_TOKEN` → `ant auth login` 的 `ANTHROPIC_PROFILE` 选定或激活 OAuth 配置文件 → Workload Identity Federation 环境变量 → 磁盘上的默认配置文件。完成 `ant auth login` 后，即使未设置环境变量，直接调用 `Anthropic()` / `new Anthropic()` / `anthropic.NewClient()` 也可正常工作。

**当你需要调用 API 且 `ANTHROPIC_API_KEY` 未设置时，不要向用户索要密钥。** 先运行 `ant auth status`——它会显示当前激活的凭据来源和配置文件。如果它报告有活动配置文件：

- **SDK 代码或 `ant` CLI：** 直接运行即可。零参数客户端构造函数和每个 `ant …` 子命令都会自动接管该配置文件，无需环境变量。
- **原始 `curl` / HTTP：** 使用 `ant auth print-credentials --access-token` 获取一个短期令牌，并以 `Authorization: Bearer <token>` 发送，**另外加上** `anthropic-beta: oauth-2025-04-20` 头（OAuth 令牌使用 `Authorization: Bearer`，而不是 `x-api-key:`——把 API key 的 curl 改为 OAuth 令牌时只是请求头变化，不是更换 key）。始终加 `--access-token`；无参数形式会打印 JSON，而不是裸 token。

仅在 `ant auth status` 报告没有活动的凭据来源（或 `ant` 本身未安装）时，才向用户索要密钥。建议优先使用 `ant auth login` 作为第一方案——它会在 `~/.config/anthropic/` 下保存一个配置文件，SDK 会自动读取；备选方案是导出 `ANTHROPIC_API_KEY`。

完整认证细节（命名配置文件、scopes、API-key-shadows-profile 陷阱、refresh-token 过期）：`shared/anthropic-cli.md`。

---

## Thinking & Effort（快速参考）

在每个当前模型上使用 adaptive thinking（`thinking: {type: "adaptive"}`）—— Claude 会动态决定何时以及思考多少。按模型规则如下：

| 模型 | 思考配置 | 省略 `thinking` | `budget_tokens` | 采样（`temperature`/`top_p`/`top_k`） | Effort 等级 |
|---|---|---|---|---|---|
| Fable 5 | `{type: "adaptive"}` 或省略；显式设置 `{type: "disabled"}` 会返回 400——请改为省略该参数 | 运行 adaptive（思考始终开启） | 已移除——`{type: "enabled", budget_tokens: N}` 返回 400 | 已移除——400 | `low`/`medium`/`high`/`xhigh`/`max` |
| Claude Opus 5 | `{type: "adaptive"}` 或省略；`{type: "disabled"}` 仅在 effort 为 `high` 或以下时可接受——在 `xhigh`/`max` 下返回 400，另见下文的 disabled-thinking 陷阱 | 运行 **adaptive**（思考默认开启——与 Opus 4.8/4.7 不同） | 已移除——400 | 已移除——400 | `low`–`max`（全部五档） |
| Opus 4.8 / 4.7 | `{type: "adaptive"}` 是唯一的开启模式；`{type: "disabled"}` 可接受 | 运行 **无**思考——请显式设置 `{type: "adaptive"}` | 已移除——400 | 已移除——400 | `low`/`medium`/`high`/`xhigh`/`max` |
| Sonnet 5 | `{type: "adaptive"}` 是唯一的开启模式；`{type: "disabled"}` 可接受 | 运行 adaptive | 已移除——400 | 已移除——400 | `low`/`medium`/`high`/`xhigh`/`max` |
| Opus 4.6 / Sonnet 4.6 | `{type: "adaptive"}`（推荐；自动启用交错思考，无需 beta header） | 显式设置 `{type: "adaptive"}` | 已弃用——请勿在新代码中使用；仅作过渡性后门（见下文） | 允许 | `low`/`medium`/`high`/`max`（`xhigh` 于 Opus 4.7 引入） |
| 更早版本（Sonnet 4.5、Haiku 4.5 等）——仅在显式请求时 | `{type: "enabled", budget_tokens: N}` | 无思考 | 思考所需；必须小于 `max_tokens`，最小 1024——否则报错 | 允许 | `effort` 在 Opus 4.5 上生效（仅 `low`/`medium`/`high`，不支持 `xhigh`/`max`）；在 Sonnet 4.5 / Haiku 4.5 上报错 |

Opus 4.8 与 4.7 共享同一请求面（无新破坏性变更）——详见 `shared/model-migration.md` → `Migrating to Opus 4.8` 以了解行为再调优，并在从 4.6 或更早版本迁移时参见 `Migrating to Opus 4.7` 获取完整破坏性变更列表。若 `thinking` 被禁用，Opus 4.8 可能会在可见响应中写入更长的推理内容——请保持 adaptive thinking 开启，或添加仅最终答案指令（见迁移指南）。

- **Effort（GA，无 beta header）：** `output_config: {effort: "low"|"medium"|"high"|"xhigh"|"max"}`，必须放在 `output_config` 内而非顶层；默认值 `high`（等价于省略该字段）。它控制思考深度与总体 token 消耗；与 adaptive thinking 结合可获得最佳的成本-质量平衡。`xhigh`（在 Opus 4.7 上新增，介于 `high` 与 `max` 之间）是 Fable 5 / Opus 4.7/4.8 / Sonnet 5 上多数编码与 agentic 场景的最佳设置，也是 Claude Code 的默认值；在这些模型上 effort 的影响力高于其同级旧模型，因此迁移时请重新调参，并在给出完整任务说明后，用 `high`/`xhigh` 运行长时程或 agentic 任务。对高智能敏感任务至少用 `high`，对正确性优先于成本的任务用 `max`，对子代理或简单任务用 `low`——较低 effort 会减少且更集中调用工具，减少前言，并输出更简洁的确认（通常 `high` 是质量与 token 效率的平衡点）。
- **Thinking 可见性 — 在 Fable 5 / Mythos 5 / Opus 5 / 4.8 / 4.7 / Sonnet 5 上默认 `omitted`：** `display: "summarized"` 会返回可读的推理摘要；`"omitted"`（这六个模型的默认值，这是从 Opus 4.6 和 Sonnet 4.6 的 `"summarized"` 到 `"omitted"` 的一次静默变化）会以空文本流式输出 `thinking` 区块。`display` 只控制可见性——在任何设置下都会发生思考并计费；原始思维链在任何模型上都不会暴露。若你要向用户流式展示推理，默认行为会表现为输出前长时间停顿，请明确设置 `thinking: {type: "adaptive", display: "summarized"}`。（独立于 display，继续在同一模型上时要原样回显 `thinking` 区块；其他模型会静默忽略它们——详见迁移指南。）
- **当用户要求“extended thinking”、“thinking budget”或 `budget_tokens` 时：** 始终在 Fable 5、Opus 5、4.8、4.7 或 4.6 上使用 `thinking: {type: "adaptive"}`——固定思考 token 预算已弃用，adaptive thinking 已取而代之。不要在新 4.6/4.7/4.8 代码中使用 `budget_tokens`，也不要仅因用户提到它就切到旧模型。*渐进式迁移例外：* `budget_tokens` 仍在 Opus 4.6 与 Sonnet 4.6 上可用，作为现有代码在你尚未调好 `effort`、需要硬性 token 上限时的过渡逃生路径——见 `shared/model-migration.md` → `Transitional escape hatch`。在 Fable 5、Opus 5/4.7/4.8 和 Sonnet 5 上已完全移除。

---

## Compaction（快速参考）

**Beta、Fable 5、Opus 5、Opus 4.8、Opus 4.7、Opus 4.6、Sonnet 5、Sonnet 4.6。** 对于可能超过 1M 上下文窗口的长时间对话，请启用服务端 compaction。API 在接近触发阈值（默认 150K tokens）时会自动总结先前上下文。需要 `compact-2026-01-12` beta header。

**关键：** 每一轮都要将 `response.content`（而不仅是文本）回写到你的消息中。Compaction 区块必须保留——API 会在下一次请求中用它替换被压缩的历史。只提取文本字符串并回写会悄悄丢失 compaction 状态。

参见 `{lang}/claude-api/README.md`（Compaction 部分）中的代码示例。完整文档见 `shared/live-sources.md` 中通过 WebFetch 获取的内容。

---

## Prompt Caching（快速参考）

**前缀匹配。** 任何字节级变化都会使后续内容全部失效。渲染顺序为 `tools` → `system` → `messages`。请将稳定内容放在前面（固定系统提示、确定性工具列表），将易变内容（时间戳、每次请求 ID、变化的问题）放在最后一个 `cache_control` 断点之后。

**会话中期操作指令**（Claude Opus 5、Claude Opus 4.8、Claude Fable 5、Claude Mythos 5；非 Claude Sonnet 5；无 beta header）：向 `messages[]` 追加 `{"role": "system", ...}`，而不是编辑顶层 `system`。这可保留已缓存的历史前缀，也是防止 prompt injection 的操作通道。详见 `shared/prompt-caching.md` § Mid-conversation system messages。

**顶层自动缓存**（`messages.create()` 上使用 `cache_control: {type: "ephemeral"}`）是你不需要细粒度控制时最简单的选择。每个请求最多 4 个断点。可缓存前缀最短约 1024 tokens——更短前缀将静默不缓存。

**使用 `usage.cache_read_input_tokens` 进行验证** — 如果在重复请求中始终为零，则说明有静默失效器在起作用（例如 system prompt 中的 `datetime.now()`、未排序的 JSON、变化的工具集）。

有关放置模式、架构指南和 silent-invalidator 审核清单，请阅读 `shared/prompt-caching.md`。语言特定语法请参考 `{lang}/claude-api/README.md`（Prompt Caching 部分）。

---

## 快速模式（快速参考）

**仅限研究预览，适用于 Claude Opus 5 / Opus 4.8** — 适用于 Claude API 和 Managed Agents，不适用于 Bedrock / Google Cloud / Foundry。Opus 4.7 快速模式已被移除：4.7 上的 `speed: "fast"` 会返回错误。Claude Opus 5 的快速模式按每 MTok $10 / $50 计费。快速模式在同一模型下可实现高达 2.5 倍的更高输出 token/秒，价格为更高档。每个请求都需要三项设置：使用 **beta** messages 端点（`client.beta.messages.…`）、传入 beta 标志 `fast-mode-2026-02-01`，并将 `speed: "fast"` 作为顶层请求参数（不是 header，也不是放在 `extra_body` 中）。

```python
client.beta.messages.create(
    model="claude-opus-5", max_tokens=4096,
    speed="fast", betas=["fast-mode-2026-02-01"],
    messages=[...],
)
```

| 语言 | Beta 标志 | Speed 参数 |
|---|---|---|
| Python | `betas=["fast-mode-2026-02-01"]` | `speed="fast"` |
| TypeScript / Ruby | `betas: ["fast-mode-2026-02-01"]` | `speed: "fast"` |
| Go | `[]anthropic.AnthropicBeta{anthropic.AnthropicBetaFastMode2026_02_01}` | `Speed: anthropic.BetaMessageNewParamsSpeedFast` |
| Java | `.addBeta(AnthropicBeta.FAST_MODE_2026_02_01)` | `.speed(MessageCreateParams.Speed.FAST)` |
| C# | `Betas = ["fast-mode-2026-02-01"]` | `Speed = Speed.Fast` (`Anthropic.Models.Beta.Messages`) |
| PHP | `betas: ['fast-mode-2026-02-01']` | `speed: 'fast'` |
| cURL | `anthropic-beta: fast-mode-2026-02-01` header | `"speed": "fast"` in body |

`response.usage.speed` 会报告实际使用的 speed。快速模式有独立于标准 Opus 的速率限制；在 429 时，要么在 `retry-after` 延迟后重试，要么去掉 `speed` 回退到标准模式（注意：切换 speed 会使提示词缓存失效）。不支持 Batch API、Priority Tier、AWS 上的 Claude Platform 或第三方平台。

**Priority Tier 不覆盖 Claude Opus 5。** 它适用于所有其他当前模型，包括 Claude Fable 5 和 Opus 4.8，但不包括 Claude Opus 5、Claude Sonnet 5、Claude Mythos 5 和 Mythos Preview；对这些模型发起 Priority Tier 请求会触发校验失败。

---

## 任务预算（快速参考）

**Beta，适用于 Claude Opus 5 / Fable 5 / Sonnet 5 / Opus 4.8 / 4.7。** 任务预算为 Claude 的 agentic loop 提供 token 上限，让它进行节奏控制并优雅完成，而不是被直接中断；这与 `max_tokens` 不同，后者是模型不知道的每次响应强制上限。`total` 最小值为 20,000。使用 beta 标志 `task-budgets-2026-03-13` 在 `client.beta.messages.stream(...)` 的 `output_config` 中设置 `task_budget` —— 请使用流式调用，以避免较大 `max_tokens` 触发 HTTP 超时（完整细节见 `shared/model-migration.md` → Task Budgets）：

```python
with client.beta.messages.stream(
    model="claude-opus-5", max_tokens=128000,
    output_config={"effort": "high", "task_budget": {"type": "tokens", "total": 64000}},
    betas=["task-budgets-2026-03-13"],
    messages=[...], tools=[...],
) as stream:
    response = stream.get_final_message()
```

`task_budget` 字段包括：`type`（始终为 `"tokens"`）、`total`，以及可选的 `remaining`（默认为 `total`）。服务端会注入一个倒计时标记供 Claude 在生成过程中读取；预算会统计 Claude 本次生成的内容以及本轮读取的工具结果——**不**统计你每次重发的完整历史。它与 **Managed Agents 会话预算**不同——后者是针对单个 CMA 会话的硬性美元额度、平台强制上限（`shared/managed-agents-core.md` § Session budgets）；任务预算是建议性且以 token 为单位。

**观察消耗情况：** 如果要展示进度，可在循环迭代中累加 `response.usage.output_tokens`（再加上你追加的 tool-result block 的 token 数）。在普通循环中保持 `remaining` 不设置——服务端会自行跟踪倒计时；在你每次请求中同时重发完整历史时再传客户端计算的 `remaining` 会低估预算。只有在你在请求间压缩或重写历史，导致服务端无法再推导先前消耗时，才应传入 `remaining`。

---

## Provider 客户端（快速参考）

当目标是第三方平台上的 Claude 时，请使用该平台的专用 client 类，而不是带有 `base_url` 覆盖的第一方 `Anthropic()` 客户端。构造完成后，客户端会公开与第一方 SDK 相同的 `messages.create` / `.stream` 接口。

### Amazon Bedrock

使用 **Mantle** 客户端（Messages-API Bedrock endpoint）。Bedrock 模型 ID 需要 `anthropic.` 前缀（例如 `"anthropic.claude-opus-5"`）。必须指定区域。

| 语言 | 客户端 |
|---|---|
| Python | `from anthropic import AnthropicBedrockMantle` → `AnthropicBedrockMantle(aws_region="…")` |
| TypeScript | `import { AnthropicBedrockMantle } from "@anthropic-ai/bedrock-sdk"` → `new AnthropicBedrockMantle({ awsRegion: "…" })` |
| Go | `bedrock.NewMantleClient(ctx, bedrock.MantleClientConfig{ AWSRegion: "…" })` |
| Java | `AnthropicOkHttpClient.builder().backend(BedrockMantleBackend.fromEnv()).build()`（来自 `com.anthropic.bedrock.backends`） |
| C# | `new AnthropicBedrockMantleClient(new() { AwsRegion = "…" })`（package `Anthropic.Bedrock`） |
| PHP | `use Anthropic\Bedrock\MantleClient;` → `new MantleClient(awsRegion: '…')` |
| Ruby | `Anthropic::BedrockMantleClient.new(aws_region: "…")` |

`AnthropicBedrock` / `BedrockClient` / `BedrockBackend`（不带 `Mantle`）是旧版 `bedrock-runtime` InvokeModel 路径；新代码应优先使用 Mantle 客户端。

### Microsoft Foundry

| 语言 | 客户端 |
|---|---|
| Python | `from anthropic import AnthropicFoundry` → `AnthropicFoundry(api_key=…, resource="…")` |
| TypeScript | `import AnthropicFoundry from "@anthropic-ai/foundry-sdk"` → `new AnthropicFoundry({ … })` |
| Java | `AnthropicOkHttpClient.builder().backend(FoundryBackend.fromEnv()).build()`（来自 `com.anthropic.foundry.backends`） |
| C# | `new AnthropicFoundryClient(new AnthropicFoundryApiKeyCredentials(…))`（package `Anthropic.Foundry`） |
| PHP | `Foundry\Client::withCredentials(…)` |

Go 和 Ruby SDK 目前不支持 Foundry。对于 Ruby，可使用标准 `Anthropic::Client.new(base_url: "<foundry endpoint>")` 作为兜底（未内置 Entra ID 鉴权）。关于 Claude Platform on AWS，请参见 `shared/claude-platform-on-aws.md`。

### Google Cloud Vertex AI

两项构造参数是必需的：GCP `project_id` 和 `region`。Vertex 模型 ID **不带前缀**——当前代模型（Opus 4.8/4.7/4.6、Sonnet 5、Sonnet 4.6）使用原生一级 ID（例如 `"claude-opus-5"`）；有时间戳的快照模型使用 `@` 版本分隔符（例如 `claude-opus-4-5@20251101`，**不是** `claude-opus-4-5-20251101`）。鉴权使用 GCP ADC（`gcloud auth application-default login`）；不使用 Anthropic API key。`region` 可以是 `"global"`（推荐）、多区域（`"us"` / `"eu"`）或具体区域。构造完成后，使用相同的 `messages.create` / `.stream` 接口即可。

| 语言 | 客户端 |
|---|---|
| Python | `from anthropic import AnthropicVertex` → `AnthropicVertex(project_id="…", region="…")`（安装 `"anthropic[vertex]"`） |
| TypeScript | `import { AnthropicVertex } from "@anthropic-ai/vertex-sdk"` → `new AnthropicVertex({ projectId, region })` |
| Go | `import "github.com/anthropics/anthropic-sdk-go/vertex"` → `anthropic.NewClient(vertex.WithGoogleAuth(ctx, region, projectID))` |
| Java | `AnthropicOkHttpClient.builder().backend(VertexBackend.builder().region("…").project("…").build()).build()`（来自 `com.anthropic.vertex.backends`） |
| C# | `new AnthropicClient { Backend = new VertexBackend(projectId, region) }`（package `Anthropic.Vertex`） |
| PHP | `use Anthropic\Vertex;` → `Vertex\Client::fromEnvironment(location: '…', projectId: '…')`——注意是 `location`，不是 `region` |
| Ruby | `Anthropic::VertexClient.new(region: "…", project_id: "…")` |

---
---

## 上下文编辑（速查）

**Beta。** 上下文编辑会在模型查看对话前**清除**旧的工具结果或思考块；它并非**压缩**（压缩会生成摘要）。在带有 beta `context-management-2025-06-27` 的 `client.beta.messages.*` 上，请传入 `context_management.edits` 并设置策略类型：

```python
client.beta.messages.create(
    model="claude-opus-5", max_tokens=4096,
    betas=["context-management-2025-06-27"],
    context_management={"edits": [{"type": "clear_tool_uses_20250919"}]},
    tools=[...], messages=[...],
)
```

策略类型包括：`clear_tool_uses_20250919`（清除旧工具结果；可选 `clear_tool_inputs: true` 也会清除 tool_use 参数）和 `clear_thinking_20251015`（清除思考块）。不要使用 `compact_20260112` 或 beta `compact-2026-01-12`，这两个是独立的压缩功能。

---

## 对话中途系统消息（速查）

**Claude Opus 5、Claude Opus 4.8、Claude Fable 5、Claude Mythos 5；不支持 Claude Sonnet 5；无 beta 头部。** 将 `{"role": "system", "content": "…"}` 追加到 `messages` 数组中（而不是顶层 `system` 字段），即可在不中断缓存前缀的情况下，在对话中途添加操作指令。使用常规 `client.messages.create`，没有 beta。对话中途系统消息必须紧随 `user` 消息之后（或紧随以服务端工具使用结束的 `assistant` 消息），并且必须是 `messages` 的最后一条，或后面紧跟一个 `assistant` 回合——它不能是 `messages[0]`。可用性请见：`shared/platform-availability.md`。参见 `shared/prompt-caching.md` § Mid-conversation system messages。

---

## 托管代理（Beta）

**托管代理**是第三种界面：Anthropic 托管、带状态的代理，并采用 Anthropic 托管的工具执行。你先创建持久化、版本化的 Agent 配置（`POST /v1/agents`），再启动引用该配置的会话。每个会话都会为代理工作区配备一个容器——bash、文件操作和代码执行都在该容器内运行；代理循环本身在 Anthropic 的编排层上运行，并通过工具在容器内执行。会话会流式返回事件；你需要回传消息与工具结果。

可用性：`shared/platform-availability.md`。在 Bedrock / Vertex / Foundry（不支持托管代理）上，请使用 Claude API + tool use。

**强制流程：** Agent（一次）→ Session（每次运行）。`model`/`system`/`tools` 只在 agent 上定义，不在 session 上。完整阅读指南、beta 头部和坑位说明见 `shared/managed-agents-overview.md`。

**Beta headers：** `managed-agents-2026-04-01`——SDK 会为所有 `client.beta.{agents,environments,sessions,vaults,memory_stores,deployments,deployment_runs}.*` 调用自动设置该头部。Skills API 使用 `skills-2025-10-02`，Files API 使用 `files-api-2025-04-14`，除 `/v1/skills` 和 `/v1/files` 外，你无需手动传入这些头部。

**子命令** — 直接使用 `/claude-api <subcommand>` 调用：

| 子命令 | 动作 |
|---|---|
| `managed-agents-onboard` | 引导用户从零开始设置托管代理。**立即阅读 `shared/managed-agents-onboarding.md`** 并按其访谈脚本执行：**描述 → 配置代理（提出建议，不要反问）→ 环境 → 会话**（与 Console 快速入门相同的流程，身份认证延后到会话步骤）— 默认值和内嵌建议会承担执行工作，在输出任何代码前先做静默可行性校验（任务 vs 工具/凭证/数据）—不要总结，执行访谈。 |

**阅读指南：** 先阅读 `shared/managed-agents-overview.md`，再阅读主题化的 `shared/managed-agents-*.md` 文件（core、environments、tools、events、outcomes、multiagent、webhooks、memory、scheduled-deployments、client-patterns、onboarding、api-reference）。Python、TypeScript、Go、Ruby、PHP 和 Java 请阅读 `{lang}/managed-agents/README.md` 获取示例代码。cURL 请阅读 `curl/managed-agents.md`。**代理是持久化的——创建一次，按 ID 引用。** 建议按 YAML 在 `ant` CLI 中定义并应用 agent 和环境（推荐流程，见 `shared/anthropic-cli.md`）：CLI 负责控制面（创建和更新代理），你的代码负责数据面（`sessions.create` 与存储的 agent ID）。仅在必须按编程方式创建时才在代码中调用 `agents.create()`；无论哪种方式，都要保存返回的 agent ID，并在后续每次 `sessions.create` 时传入；切勿在请求路径中调用 `agents.create()`。若你需要的绑定在语言 README 中未出现，请从 `shared/live-sources.md` WebFetch 相关条目，而不是猜测。C# 通过 `client.Beta.Agents` 及相关命名空间提供 beta 托管代理支持——详见 `csharp/claude-api/README.md`，或查看 `curl/managed-agents.md` 的原始 HTTP 参考。

**当用户想从零开始设置托管代理**（例如“如何开始”、“带我创建一个”、“设置新代理”）：阅读 `shared/managed-agents-onboarding.md` 并执行其访谈；流程与 `managed-agents-onboard` 子命令一致。

**当用户询问“如何为 X 编写客户端代码”时：** 请参考 `shared/managed-agents-client-patterns.md`，其中涵盖无损流重连、`processed_at` 队列/处理门控、interrupt、`tool_confirmation` 往返、正确的 idle/terminated 断开门控、post-idle 状态竞争、流优先顺序、文件挂载陷阱等。凭证上优先使用 vault 的 `environment_variable` 凭证——这是一级机制；凭证在出口处替换且绝不进入沙箱（见 `shared/managed-agents-tools.md` → Vaults）。当 vault 凭证不适用（例如自托管沙箱）时，保留凭证在主机端通过自定义工具处理作为备选方案。

**当用户希望代理按计划运行**（cron，“每天夜里”，“每周报告”）：阅读 `shared/managed-agents-scheduled-deployments.md`——部署会按 cron 节奏自动触发会话，并提供按次运行记录与生命周期控制（pause/unpause/archive）。

**当代理任务发散**（跨多个来源调研、按文件或按记录执行、先研究 N 件事再总结）**或单次循环会被阅读内容塞满上下文**时，阅读 `shared/managed-agents-multiagent.md` 并建议使用多代理会话——先在 roster 中仅加入 `{"type": "self"}`，让代理可向自己的副本发起委派，再将阅读密集的子任务交给更便宜的 worker 代理（例如 Claude Haiku 4.5），通过 ID 引用。

---

## 服务器端工具（速查）

服务器端工具在 Anthropic 基础设施上运行——没有客户端侧执行循环。在 `tools` 中声明；结果会作为内容块返回在同一响应中。**无额外 beta 头部**，除非另有说明。**优先使用你的模型支持的最新类型变体。** 下表中的 `_20260209` web search / web fetch 变体（支持动态过滤）需要 Opus 5/4.8/4.7/4.6、Sonnet 5 或 Sonnet 4.6；旧模型的基础变体见表后。  

| 工具 | `type` | `name` | 关键可选参数 | 结果块类型 |
|---|---|---|---|---|
| Web search | `web_search_20260209` | `web_search` | `max_uses`、`allowed_domains`/`blocked_domains`、`user_location` | `web_search_tool_result` → `.content` 为 `web_search_result` 列表 |
| Web fetch | `web_fetch_20260209` | `web_fetch` | `max_uses`、`allowed_domains`/`blocked_domains`、`citations`、`max_content_tokens` | `web_fetch_tool_result` → `.content` 为带 `document` 块的 `web_fetch_result` |
| 代码执行 | `code_execution_20260521` | `code_execution` | 无 | `bash_code_execution_tool_result` → `.content.stdout` / `.stderr` / `.return_code` |
| 工具搜索（正则） | `tool_search_tool_regex_20251119` | `tool_search_tool_regex` | 将其他工具标记为 `defer_loading: true` | `tool_search_tool_result` |
| 工具搜索（BM25） | `tool_search_tool_bm25_20251119` | `tool_search_tool_bm25` | 将其他工具标记为 `defer_loading: true` | `tool_search_tool_result` |

`web_search_20260209` / `web_fetch_20260209` 内置动态过滤——代码执行在底层运行，因此不要在 `tools` 中单独声明 `code_execution`（第二个执行环境会干扰模型）。对于 Opus 4.6 / Sonnet 4.6 以下的模型，改用基础变体 `web_search_20250305` / `web_fetch_20250910`；在 Vertex AI 上仅提供基础 `web_search_20250305`。`code_execution_20260120`（REPL 持久化 + 编程式工具调用）在 Opus 4.5+ / Sonnet 4.5+ 上可用。**仅限 Go SDK：** `code_execution_20260521` 位于 `client.Beta.Messages.New` 下，并带 `Betas: []anthropic.AnthropicBeta{"code-execution-2025-08-25"}`（其他语言使用普通 `client.messages.create`）；`code_execution_20260120` 在 Go 中与其他语言一样使用非 beta 的 `client.Messages.New`。Web fetch 只会抓取会话中已存在的 URL。不同提供商对工具的可用性不一致，详见 `shared/platform-availability.md`。`pause_turn` 的处理见 `shared/tool-use-concepts.md`。

## 文档与文件输入（快速参考）

**PDF（base64，非 beta）：** `{"type": "document", "source": {"type": "base64", "media_type": "application/pdf", "data": <b64 string>}}`，放在用户内容中的文本块之前。Base64 字符串不得包含换行。限制：32 MB 请求、600 页（针对 200k 上下文模型为 100 页）。Java：`ContentBlockParam.ofDocument(DocumentBlockParam... Base64PdfSource.builder().data(...))`。

**Files API（beta `files-api-2025-04-14`）：** 通过 `client.beta.files.upload(...)` 上传；响应中的 `id` 即为 `file_id`。对 PDF/text 文件使用 `{"type": "document", "source": {"type": "file", "file_id": "..."}}`，对图片使用 `{"type": "image", ...}`——内容块类型必须与文件的 MIME type 一致。上传与引用该文件的 `messages.create` 两者都必须带有 beta header。可用性：`shared/platform-availability.md`。

**引用（无 beta）：** 在每个 `document` 内容块上设置 `citations: {enabled: true}`（全部开启或全部关闭）。响应会拆分为多个 `text` 块；被引用的块携带 `citations` 数组。每个引用包含 `cited_text`、`document_index`、`document_title`，以及按 `type` 指定的位置：纯文本为 `char_location`（`start_char_index`/`end_char_index`），PDF 为 `page_location`（`start_page_number`/`end_page_number`，1 开始计数），自定义内容为 `content_block_location`。与 `output_config.format` 不兼容（会返回 400）。

## 工具使用模式（快速参考）

**严格工具调用（无 beta）：** 在工具定义上将 `strict: true` 作为顶层字段设置（与 `name`/`description`/`input_schema` 同级），**而不是**在 `tool_choice` 上设置。Schema 必须包含 `additionalProperties: false` 和 `required`。可保证 `tool_use.input` 的校验完全严格。Go：`Strict: anthropic.Bool(true)` + `InputSchema.ExtraFields`；Java：`.strict(true)` + `.putAdditionalProperty("additionalProperties", JsonValue.from(false))`。

**并行工具调用（默认开启）：** 一条 assistant 消息可包含多个 `tool_use` 块。并发执行它们后，在单条用户消息中返回**全部** `tool_result` 块；将结果拆成多条消息会悄然训练 Claude 停止进行并发调用。工具失败时返回 `tool_result` 并设置 `is_error: true`，不要丢弃。

**Tool Runner（SDK beta 辅助）：** 通过 `client.beta.messages.*` 为你驱动工具调用循环。Python：`@beta_tool` 装饰器 + `client.beta.messages.tool_runner(...)` → `runner.until_done()`。TypeScript：`@anthropic-ai/sdk/helpers/beta/zod` 中的 `betaZodTool({...})` + `client.beta.messages.toolRunner(...)` → `await runner`。Go：`toolrunner.NewBetaToolFromJSONSchema(...)` + `client.Beta.Messages.NewToolRunner(...)` → `.RunToCompletion(ctx)`。Java：需要 `.addBeta("structured-outputs-2025-11-13")`。Ruby：`Anthropic::BaseTool` 子类 + `client.beta.messages.tool_runner(...)`。PHP：`BetaRunnableTool` + `->toolRunner(...)`。C#：原始 JSON-schema 工具 + `client.Beta.Messages.ToolRunner(...)` 中的 `BetaToolRunner`。

**程序化工具调用（无 beta header）：** Claude 在代码执行内部调用你的自定义工具。添加 `{"type": "code_execution_20260120", "name": "code_execution"}` **并**在你的自定义工具上设置 `"allowed_callers": ["code_execution_20260120"]`。Opus 4.5+ / Sonnet 4.5+（可用性：`shared/platform-availability.md`）。当回复待处理的程序化调用时，用户消息必须只包含 `tool_result` 块（不能包含文本）。与 `strict: true`、`disable_parallel_tool_use`、强制 `tool_choice` 或 MCP 工具均不兼容。

## 其他 API 接口（快速参考）

**消息批处理（无 beta；可用性：`shared/platform-availability.md`）：** `client.messages.batches.create(requests=[{custom_id, params}, ...])` → 轮询 `client.messages.batches.retrieve(id).processing_status` 直到 `"ended"` → 使用 `client.messages.batches.results(id)` 流式读取。每个结果包含 `.custom_id` 和 `.result.type`（`succeeded`/`errored`/`canceled`/`expired`）；成功时读取 `.result.message.content`。Python 用 `Request(custom_id=..., params=MessageCreateParamsNonStreaming(...))` 封装请求。结果返回顺序**任意**——应按 `custom_id` 关联，而非按位置。

**模型 API（无 beta；可用性：`shared/platform-availability.md`）：** `client.models.list()`（自动分页）和 `client.models.retrieve("claude-opus-5")`。每个模型对象都有 `id`、`display_name`、`created_at`，以及自 2026 年 3 月起的 `max_input_tokens`（上下文窗口）、`max_tokens`（输出上限）和 `capabilities`。不存在 `context_window` 字段。

**停止详情（GA，Opus 4.7+）：** `response.stop_details` 仅在 `stop_reason == "refusal"` 时才会有值（字段为：`type: "refusal"`，`category`——一个开放集合，例如 `"cyber"`、`"bio"`、`"reasoning_extraction"`、`"frontier_llm"`，或 `null`；完整列表见文档，以及 `explanation`）。对于其他所有 `stop_reason`（如 `end_turn`、`max_tokens`、`tool_use`、`pause_turn` 等）其值为 `null`，读取前务必先判空。

**客户端配置（无 beta）：** `timeout` 默认 10 分钟；**各 SDK 的单位不同**——Python/Ruby：秒；TypeScript：**毫秒**；Go `option.WithRequestTimeout(time.Duration)`；Java `Duration`；C# `TimeSpan`。TS 在非流式请求下会根据较大的 `max_tokens` 将默认值提升到最多 60 分钟；Java 在流式请求下会提升（Java 非流式请求在 30 秒到 10 分钟范围内伸缩）。`max_retries`/`maxRetries` 默认为 2（重试 408/409/429/5xx + 连接错误）。`base_url`（或 `ANTHROPIC_BASE_URL` 环境变量）。请求级覆盖：Python `client.with_options(timeout=5.0).messages.create(...)`；TS `client.messages.create({...}, {timeout: 5_000})`；Ruby `request_options: {timeout: 5}`。超时会触发重试，因此实际墙钟时长可达 `timeout × (max_retries+1)`。

## Workload Identity Federation（快速参考）

**GA，无 beta header。** 构建普通的无参数客户端（`Anthropic()` / `new Anthropic()` / `anthropic.NewClient()` / `AnthropicOkHttpClient.fromEnv()`）；当且仅当以下环境变量全部设置时：`ANTHROPIC_FEDERATION_RULE_ID`、`ANTHROPIC_ORGANIZATION_ID`、`ANTHROPIC_SERVICE_ACCOUNT_ID` 和 `ANTHROPIC_IDENTITY_TOKEN_FILE`（或 `ANTHROPIC_IDENTITY_TOKEN`），SDK 会自动检测 WIF，向 `/v1/oauth/token` 交换 JWT，并自动刷新。`ANTHROPIC_WORKSPACE_ID` 不决定是否启用——仅在联合规则跨工作区时必需（否则会返回 400 `workspace_id_required`），对单工作区规则是可选的。`ANTHROPIC_API_KEY` 或 `ANTHROPIC_AUTH_TOKEN`（即使为空）优先于 WIF；设置了 `ANTHROPIC_PROFILE` 也会覆盖联合环境变量（缺失指定配置文件会报错，而不会回退）——请将三者全部取消设置。

## 阅读指南

检测语言后，根据用户需求阅读相关文件。

**所有 SDK 语言都采用同一多文件结构**，即 `{lang}/claude-api/` 目录，包含 `README.md`（安装、客户端初始化、基础请求、thinking、缓存、停止详情、杂项）、`tool-use.md`（工具定义、Agentic 循环、Anthropic 定义工具、结构化输出）、`streaming.md`、`batches.md`、`files-api.md`。并非所有语言都有全部文件（例如 Ruby 没有 `batches.md`）；若某文件缺失，说明该语言尚未记录该功能示例，可回退到 cURL 形态或从 `shared/live-sources.md` WebFetch SDK 仓库。**cURL** → `curl/examples.md`。

The Quick Task Reference below uses the `{lang}/claude-api/FILE.md` path notation for all languages.

### 快速任务参考

**单一文本分类/总结/抽取/Q&A：**
→ 仅阅读 `{lang}/claude-api/README.md`（任何任务都应**先阅读 README**，包括安装、快速开始、常见模式、错误处理）

**聊天界面或实时响应展示：**
→ 阅读 `{lang}/claude-api/README.md` + `{lang}/claude-api/streaming.md`

**长时对话（可能超出上下文窗口）：**
→ 阅读 `{lang}/claude-api/README.md`，查看 Compaction 部分

**迁移到新模型（Fable 5 / Opus 5 / Opus 4.8 / Opus 4.7 / Opus 4.6 / Sonnet 5 / Sonnet 4.6）、替换已退役模型，或将 `budget_tokens` / 预填充模式迁移到当前 API：**
→ 阅读 `shared/model-migration.md`

**提示或调优 Fable 5（长会话、努力程度、输出冗长度、自治运行、子代理）：**
→ 阅读 `shared/model-migration.md` → Migrating to Fable 5 → Behavioral shifts (prompt-tunable) + Long-running agent recommendations

**提示词缓存 / 缓存优化 / “我的缓存命中率为什么这么低”：**
→ 阅读 `shared/prompt-caching.md`（前缀稳定性设计、断点放置、会悄然失效的反模式）+ `{lang}/claude-api/README.md`（Prompt Caching 部分）

**统计文件 / 提示词 / diff 的 token 数量（“X 有多少 token”）：**
→ 阅读 `shared/token-counting.md`，使用 `messages.count_tokens`，不要使用 `tiktoken`

**函数调用 / 工具使用 / 代理（Agents）：**
→ 阅读 `{lang}/claude-api/README.md` + `shared/tool-use-concepts.md`（概念基础：函数调用、代码执行、记忆、结构化输出）+ `{lang}/claude-api/tool-use.md`（特定语言的代码示例：工具运行器、手动循环、代码执行、记忆、结构化输出）

**代理设计（工具表面、上下文管理、缓存策略）：**
→ 阅读 `shared/agent-design.md`（bash 与专用工具、程序化工具调用、工具搜索/技能、上下文编辑与压缩与记忆、缓存原则）

**批处理（对时延不敏感；异步以 50% 成本运行）：**
→ 阅读 `{lang}/claude-api/README.md` + `{lang}/claude-api/batches.md`

**跨多次请求上传同一文件（无需重复上传）：**
→ 阅读 `{lang}/claude-api/README.md` + `{lang}/claude-api/files-api.md`

**调试 HTTP 错误或实现错误处理：**
→ 阅读 `shared/error-codes.md` — 每个 SDK 的类型化异常类表及 Go `errors.As` 模式

**最新官方文档：**
→ 使用 WebFetch 获取 `shared/live-sources.md` 中的链接

**托管代理（Managed Agents，带工作空间的服务端有状态代理）：**
→ 参见上方 `## Managed Agents (Beta)` 的阅读指南 — 其中列出了所有 `shared/managed-agents-*.md` 文件，以及各语言 README（`{lang}/managed-agents/README.md`、`curl/managed-agents.md`）。

---

## 何时使用 WebFetch

当以下情况需要时，使用 WebFetch 获取最新文档：

- 用户请求“最新”或“当前”信息
- 缓存数据似乎不正确
- 用户询问这里未覆盖的功能

实时文档链接见 `shared/live-sources.md`。

## 常见陷阱

- 向 API 传入文件或内容时不要截断输入。如果内容过长无法放入上下文窗口，请通知用户并讨论选项（分块、摘要等），而不是静默截断。
- **Prefill 已移除（Fable 5、Opus 5、Sonnet 5、以及 4.6/4.7/4.8 系列）：** assistant message 的 prefill（上一条 assistant turn 的 prefill）在 Fable 5、Opus 5、Sonnet 5、Opus 4.6、Opus 4.7、Opus 4.8 和 Sonnet 4.6 上会返回 400 错误。请改用结构化输出（`output_config.format`）或系统提示词指令来控制响应格式。（一个例外：fallback-credit 的 prefill 声明 — 在使用 `fallback_has_prefill_claim: true` 兑换积分时，服务端接受回显的 assistant 消息；详见迁移指南中的拒绝部分。）
- **编辑前先确认迁移范围：** 当用户要求将代码迁移到更新的 Claude 模型但未指定具体文件、目录或文件列表时，**先询问要应用到哪个范围**——是整个工作目录、某个子目录，还是一组文件。不要在用户确认前开始编辑。像“migrate my codebase”“move my project to X”“upgrade to Sonnet 4.6”或仅说“migrate to Opus 4.8”这类祈使式表述仍然不明确——它们说明了要做什么但没说明在哪做，所以请提问。仅当提示明确给出具体文件、具体目录或明确文件列表（如“migrate `app.py`”“migrate everything under `services/`”“update `a.py` and `b.py`”）时才继续执行。详见 `shared/model-migration.md` 的 Step 0。
- **`max_tokens` 的默认值：** 不要把 `max_tokens` 设得过低——超出上限会导致输出被截断并需要重试。对非流式请求，建议默认 `~16000`（可避免触发 SDK HTTP 超时）。对流式请求，建议默认 `~64000`（超时不是问题，给模型更多空间）。仅在有明确原因时再降低，例如分类（`~256`）、成本上限、故意短回复，或用于缓存预热的 `max_tokens: 0`（见 `shared/prompt-caching.md` → Pre-warming）。
- **在 Claude Opus 5 上禁用思考有两种失败模式——建议改用 low/medium effort。** 仅影响明确选择关闭思考的代码；默认思考是开启的，因此要注意 Opus 4.8 可能遗留的禁用思考设置。使用 `thinking: {type: "disabled"}` 时，模型有时会把工具调用写到其**可见文本**中而不是 `tool_use` 块：会话成功但调用不会执行，不会报错，而且在 agentic 循环中该文本会污染后续回合。它也可能把 `<thinking>` 标签泄露到响应中。开启思考并降低 `effort` 可同时修复这两个问题，并仍能降低成本。若必须保持 thinking-off：**删除任何 don't-think/don't-reason 规则（会加重标签泄露）**，不要提及 thinking 标签，并加入合并指令 *“When you use a tool, you may say a brief sentence first. If no tool can express what the user asked for, say so instead of guessing. Do not include internal or system XML tags in your response.”* 详情见 `shared/model-migration.md` → Two failure modes when thinking is disabled。
- **128K 输出 token：** Fable 5、Opus 5、Opus 4.6、Opus 4.7、Opus 4.8、Sonnet 5 和 Sonnet 4.6 支持最高 128K `max_tokens`，但 SDK 需要流式才能避免 HTTP 超时。请使用 `.stream()` 结合 `.get_final_message()` / `.finalMessage()`。
- **工具调用 JSON 解析（Fable 5、Opus 5 和 4.6/4.7/4.8 系列）：** Fable 5、Opus 5、Opus 4.6、Opus 4.7、Opus 4.8 和 Sonnet 4.6 可能在工具调用 `input` 字段中产生不同的 JSON 转义（如 Unicode 或正斜杠转义）。务必使用 `json.loads()` / `JSON.parse()` 解析工具输入，切勿对序列化输入做原始字符串匹配。
- **结构化输出（所有模型）：** 使用 `output_config: {format: {...}}`，而不是在 `messages.create()` 中使用已弃用的 `output_format` 参数。这是通用 API 变更，不是 4.6 专属。
- **不要重复实现 SDK 功能：** SDK 已提供高级封装——应直接使用它们，而不是从头造轮子。具体来说：使用 `stream.finalMessage()`，而不是用 `new Promise()` 包裹 `.on()` 事件；使用类型化异常类（如 `Anthropic.RateLimitError`）而不是按错误信息字符串匹配；使用 SDK 类型（如 `Anthropic.MessageParam`、`Anthropic.Tool`、`Anthropic.Message`）而不是重新定义等效接口。
- **错误处理要按链捕获，而非只抓一个大类：** 单独捕获 `except APIStatusError` / `catch (AnthropicServiceException)` / `rescue APIError` 会丢失可重试（429、≥500、网络）与不可重试（400/404）失败的区分。应按“最具体优先”写链式处理，例如 `NotFoundError` → `RateLimitError` → `APIStatusError` → `APIConnectionError`（或 Go 对应写法：先 `errors.As` 为 `*anthropic.Error`，再 `switch apierr.StatusCode { case 404: …; case 429: …; default: … }`）。各语言的类名与命名空间见 `shared/error-codes.md`。
- **不要先研究 SDK 类型——先写代码：** 如果某个类型名未在该技能包含的文档中出现，请先按语言文档的命名空间/包表写源码文件，再按编译器报错修正。不要在不写文件的情况下花多轮去 WebFetch、克隆 SDK 仓库，或写并运行额外反射程序去找类型名。使用 `strings` / `jar tf` / `javap` 快速查询已安装 SDK 名称是可接受的，但不要做过度扩展。先写出文件比类型名写错更容易修复；没有文件产出的探索型会话不值得。
- **Bash 与文本编辑工具由 Anthropic 定义，schema 不可用。** 声明为 `{"type": "bash_20250124", "name": "bash"}` / `{"type": "text_editor_20250728", "name": "str_replace_based_edit_tool"}`，不要加 `input_schema`。名称为 `"bash"` 的自定义工具是不同工具。处理器路径与安全检查见 `shared/tool-use-concepts.md` § Client-Side Tools。
- **Advisor 工具模型配对。** advisor 工具的 `model` 必须至少与请求的顶层 `model` 同级或更强，例如 executor `claude-sonnet-5` 对应 advisor `claude-opus-4-8` 或 `claude-opus-4-7`。无效配对会返回 400。配对表见 `shared/tool-use-concepts.md` § Advisor。可用性见 `shared/platform-availability.md`。
- **Agent Skills 与 Managed Agents 不同。** 要让 Claude 通过 Agent Skills 生成 `.pptx` / `.xlsx` 等文件，请调用 `client.beta.messages.create`，并传入 `container={"skills": [...]}`、`code_execution_20260521` 工具，以及 `code-execution-2025-08-25` + `skills-2025-10-02` 两个 beta；不要使用 `client.beta.agents` / `sessions` / `environments`，那是 Managed Agents 面向的接口。
- **MCP 连接器需要两个部分。** 仅使用 `mcp_servers=[{type:"url", url, name}]` 会被校验拒绝——还必须同时添加带 beta `mcp-client-2025-11-20` 的 `tools=[{type:"mcp_toolset", mcp_server_name:<same name>}]`。可用性见 `shared/platform-availability.md`。
- **`inference_geo` 是直接的顶层请求参数**——`client.messages.create(..., inference_geo="us")` / `.inferenceGeo("us")`。不要放在 `extra_body` / `putAdditionalBodyProperty` 中。（仅 Messages API——在 Managed Agents 中，`inference_geo` 改为嵌套在 agent 的 `model` 对象内，绝不在顶层；见 `shared/managed-agents-core.md` § Pinning inference geography。）支持的模型为 Opus 4.6 / Sonnet 4.6 及以上；可用性见 `shared/platform-availability.md`。`response.usage.inference_geo` 会返回推理实际发生的地区。
- **细粒度工具流式不是 beta 功能。** 在工具定义中设置 `eager_input_streaming: true`，并调用常规 `client.messages.stream(...)`。无需 beta header，也不需要 `client.beta.*` 路径。
- **缓存诊断是 beta。** 使用带 beta `cache-diagnosis-2026-04-07` 的 `client.beta.messages.*`。首轮传 `diagnostics: {previous_message_id: null}`，后续轮次传 `diagnostics: {previous_message_id: <previous response id>}`；结果在 `response.diagnostics`。可用性见 `shared/platform-availability.md`。
- **内存工具类型为 `memory_20250818`。** 声明为 `{"type": "memory_20250818", "name": "memory"}`。Go 在 `client.Beta.Messages.New` 上使用 beta-namespace 类型 `{OfMemoryTool20250818: &anthropic.BetaMemoryTool20250818Param{}}`；Python/TypeScript/Ruby/PHP/C# 使用非 beta 的 `client.messages.create`；Java 同时有非 beta 的 `MemoryTool20250818` 与 beta tool-runner 路径。Python/TypeScript 提供 `BetaAbstractMemoryTool` / `betaMemoryTool` 用于实现后端。
- **请使用支持该功能的模型。** 某些功能仅限特定模型层级——fast mode 仅支持 Claude Opus 5 / Opus 4.8（仅 Claude API），任务预算（仅 Messages API；Managed Agents 的会话预算无模型层级限制）仅支持 Claude Opus 5 / Fable 5 / Sonnet 5 / Opus 4.8 / 4.7，advisor 工具要求有效的 executor↔advisor 配对。若用户提示的模型不支持某项功能，请改用支持该功能的模型，并在输出中注明替换。
- **不要为 SDK 数据结构自定义类型：** SDK 已导出所有 API 对象类型。使用 `Anthropic.MessageParam` 表示消息、`Anthropic.Tool` 表示工具定义、`Anthropic.ToolUseBlock` / `Anthropic.ToolResultBlockParam` 表示工具结果、`Anthropic.Message` 表示响应。定义自己的 `interface ChatMessage { role: string; content: unknown }` 不但重复，也会丢失类型安全。
- **报告和文档输出：** 对于会产出报告、文档或可视化的任务，代码执行沙箱预装了 `python-docx`、`python-pptx`、`matplotlib`、`pillow` 和 `pypdf`。Claude 可生成格式化文件（DOCX、PDF、图表）并通过 Files API 返回，遇到“报告”或“文档”类需求可优先考虑这种方式，而不是纯 stdout 文本。
- **服务器端工具错误不会抛异常。** 网络搜索与网页抓取错误会以 HTTP 200 返回 `web_search_tool_result` / `web_fetch_tool_result` 块，`content` 是单个错误对象（如 `{error_code: "max_uses_exceeded"}`），而不是抛异常。对于 web search，成功的 `content` 是*列表*；错误时是*对象*——在建立索引前先做分支判断。
- **代码执行输出块类型：** `code_execution_20260521` 返回 `bash_code_execution_tool_result`（其 `.content.stdout`），而非旧版裸 `code_execution_tool_result`。应遍历 `response.content` 并匹配正确的 type。
- **工具搜索：不要全部延迟。** 搜索工具本身不能设置 `defer_loading: true`，并且 `tools` 中至少要有一个非延迟工具，否则 API 会返回 400 `All tools have defer_loading set`。
