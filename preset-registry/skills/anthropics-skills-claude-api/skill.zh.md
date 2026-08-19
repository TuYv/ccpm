---
name: claude-api
description: |-
  Reference for the Claude API / Anthropic SDK — model ids, pricing, params, streaming, tool use, MCP, agents, caching, token counting, model migration.
  TRIGGER — read BEFORE opening the target file; don't skip because it "looks like a one-liner" — whenever: the prompt names Claude/Anthropic in any form (Claude, Anthropic, Fable, Opus, Sonnet, Haiku, `anthropic`, `@anthropic-ai`, `claude-*`, `us.anthropic.*`, `[1m]`); the user asks about an LLM (pricing/model choice/limits/caching) — never answer from memory; OR the task is LLM-shaped with provider unstated (agent/MCP/tool-definition/multi-agent/RAG/LLM-judge/computer-use; generate/summarize/extract/classify/rewrite/converse over NL; debugging refusals/cutoffs/streaming/tool-calls/tokens).
  SKIP only when another provider is being worked on (overrides all triggers): OpenAI/GPT/Gemini/Llama/Mistral/Cohere/Ollama named in the query; OR `grep -rE 'openai|langchain_openai|google.generativeai|genai|mistralai|cohere|ollama'` over the project hits (run this grep FIRST if no provider named — don't Read the file).
license: Complete terms in LICENSE.txt
---
# 使用 Claude 构建 LLM 驱动的应用程序

此技能可帮助你使用 Claude 构建由 LLM 驱动的应用程序。根据你的需求选择合适的使用方式，检测项目语言，然后阅读相关的语言特定文档。

## 开始之前

扫描目标文件（或者，如果没有目标文件，则扫描提示和项目），查找非 Anthropic 提供商标记 — `import openai`、`from openai`、`langchain_openai`、`OpenAI(`、`gpt-4`、`gpt-5`、诸如 `agent-openai.py` 或 `*-generic.py` 的文件名，或任何要求保持代码提供商中立的明确指令。如果发现任何此类标记，停止并告知用户：此技能会生成 Claude/Anthropic SDK 代码；询问他们是希望将该文件切换为 Claude，还是希望获得非 Claude 实现。不要使用 Anthropic SDK 调用编辑非 Anthropic 文件。

## 输出要求

当用户要求你添加、修改或实现 Claude 功能时，你的代码必须通过以下方式之一调用 Claude：

1. **项目语言的官方 Anthropic SDK**（`anthropic`、`@anthropic-ai/sdk`、`com.anthropic.*` 等）。只要项目存在受支持的 SDK，这就是默认方式。
2. **原始 HTTP**（`curl`、`requests`、`fetch`、`httpx` 等）— 仅当用户明确要求使用 cURL/REST/原始 HTTP、项目是 shell/cURL 项目，或该语言没有官方 SDK 时使用。

绝不要混用两者 — 不要仅仅因为感觉更轻量，就在 Python 或 TypeScript 项目中使用 `requests`/`fetch`。绝不要退回到 OpenAI 兼容的垫片。

**绝不要猜测 SDK 用法。**函数名、类名、命名空间、方法签名和导入路径必须来自明确文档 — 即此技能中的 `{lang}/` 文件，或 `shared/live-sources.md` 中列出的官方 SDK 仓库或文档链接。如果所需绑定没有在技能文件中明确记录，请在编写代码前从 `shared/live-sources.md` 对相关 SDK 仓库执行 WebFetch。不要根据 cURL 形式或另一种语言的 SDK 推断 Ruby/Java/Go/PHP/C# API。

**如果 WebFetch 或仓库访问失败**（网络受限、超时、克隆被阻止）：不要持续重试 — 使用 `{lang}/` 文件中的模式和命名空间/包表来编写代码，在其上运行编译器或解释器，并根据错误输出迭代。对于静态类型 SDK（C#、Java、Go），针对本地错误进行编译修复循环，比受阻的网络研究更快地得到可工作的代码。

## 默认设置

除非用户另有要求：

对于 Claude 模型版本，请使用 Claude Opus 5，你可以通过精确的模型字符串 `claude-opus-5` 访问它。对于任何稍微复杂的任务，请默认使用自适应思考（`thinking: {type: "adaptive"}`）。最后，对于任何可能涉及较长输入、较长输出或较高 `max_tokens` 的请求，请默认使用流式传输 — 它可以避免触发请求超时。如果你不需要处理各个流事件，请使用 SDK 的 `.get_final_message()` / `.finalMessage()` 助手获取完整响应。

## ⚠️ API 漂移 — 你训练中的既有认知可能已过时

一些常见的 Claude API 形式在 2025–2026 年间发生了变化。如果你从训练中回忆起某种模式，请在编写前根据此 Skill 中的 `{lang}/` 文件进行验证 — 下表列出了最常见的漂移点：

| 领域 | 过时的既有认知 | 当前 API |
|---|---|---|
| 扩展思考 | `thinking: {type: "enabled", budget_tokens: N}` | 在 Claude 4.6+ 模型上：`thinking: {type: "adaptive"}`。`budget_tokens` 在 Opus 4.6 / Sonnet 4.6 上已弃用，并且在 Fable 5 / Sonnet 5 / Opus 5 / 4.8 / 4.7 上会**被以 400 拒绝**。4.6 之前的模型仍使用 `budget_tokens`。 |
| Web 搜索 / Web 抓取工具类型 | `web_search_20250305`, `web_fetch_20250910` | 在 Opus 5/4.8/4.7/4.6、Sonnet 5 和 Sonnet 4.6 上使用 `web_search_20260209`, `web_fetch_20260209`（动态过滤）。较旧的模型保留基础变体；在 Vertex AI 上仅提供基础 `web_search_20250305`（Vertex 上不支持 Web 抓取）— 请参阅下方的 Server Tools QR。 |
| PHP 参数名称 | 将 snake_case 传输名称作为命名参数（`max_tokens`） | 顶层命名参数使用 camelCase（`maxTokens`）。嵌套数组键因功能而异（例如 `'taskBudget'`, `'skillID'`, `'mcp_server_name'`）— 请从文档示例中复制准确的键；不要批量转换。 |
| Managed Agents 凭据 | 通过自定义工具将密钥保留在主机端（这是 Vaults 发布前唯一的选择） | Vault `environment_variable` 凭据 — 由 Anthropic 存储，在出口时替换，且在沙箱中永不可见（`shared/managed-agents-tools.md` → Vaults）。对于自托管沙箱，主机端自定义工具仍是备用方案。 |

此 Skill 中的 `{lang}/` 文件比回忆中的模式更具权威性。

---

## 子命令

如果本提示底部的用户请求是一个纯子命令字符串（没有任何说明文字），请搜索本文档中的每个 **子命令** 表格 — 包括下方附加章节中的任何表格 — 并直接遵循匹配项“操作”列中的内容。这使用户能够通过 `/claude-api <subcommand>` 调用特定流程。如果文档中没有表格匹配，请将该请求视为普通文本。

| 子命令 | 操作 |
|---|---|
| `migrate` | 将现有 Claude API 代码迁移到较新的模型。**立即阅读 `shared/model-migration.md`** 并按顺序执行：步骤 0（确认范围 — 在进行任何编辑前询问哪些文件/目录），步骤 1（对每个文件进行分类），然后是按目标模型划分的破坏性变更章节。不要总结指南 — 直接执行。如果用户没有指定目标模型，请在询问范围的同一轮中询问要迁移到哪个模型。应用按目标模型的变更后，根据 `shared/prompt-audit.md` 审核范围内的提示文本、工具描述和请求代码 — 为源模型编写的提示是每次迁移的一部分，并且它不会主动显现。 |
| `prompt-audit` | 审核现有提示、Skills 和工具描述中为较旧模型编写的过时模式（“cruft”）。**立即阅读 `shared/prompt-audit.md`** 并按顺序执行：步骤 0（根据请求和仓库确定范围及目标模型 — 在报告中说明假设，不要停下来询问）、清单盘点、溯源，然后是模式扫描。完整产出两项交付物 — 审核报告（包含 `file:line`、模式、为何它对目标模型而言已过时、置信度的发现）和拟议差异 — 无需暂停确认；仅当请求明确要求时才应用编辑。不要总结指南 — 直接执行。 |

---

## 语言检测

首先判断请求是否涉及特定的 SDK 语言。有些任务不涉及：审查提示词文本（`prompt-audit`）、选择模型、询问定价和限制，以及概念性的 API 问题都与语言无关。对于这些任务，跳过本节，不要询问用户使用的语言。

当任务确实涉及读取或编写 SDK 代码时，请先确定用户使用的语言，再阅读代码示例：

1. **查看项目文件**以推断语言：

   - `*.py`、`requirements.txt`、`pyproject.toml`、`setup.py`、`Pipfile` → **Python** — 从 `python/` 中读取
   - `*.ts`、`*.tsx`、`package.json`、`tsconfig.json` → **TypeScript** — 从 `typescript/` 中读取
   - `*.js`、`*.jsx`（不存在 `.ts` 文件）→ **TypeScript** — JS 使用相同的 SDK，从 `typescript/` 中读取
   - `*.java`、`pom.xml`、`build.gradle` → **Java** — 从 `java/` 中读取
   - `*.kt`、`*.kts`、`build.gradle.kts` → **Java** — Kotlin 使用 Java SDK，从 `java/` 中读取
   - `*.scala`、`build.sbt` → **Java** — Scala 使用 Java SDK，从 `java/` 中读取
   - `*.go`、`go.mod` → **Go** — 从 `go/` 中读取
   - `*.rb`、`Gemfile` → **Ruby** — 从 `ruby/` 中读取
   - `*.cs`、`*.csproj` → **C#** — 从 `csharp/` 中读取
   - `*.php`、`composer.json` → **PHP** — 从 `php/` 中读取

2. **如果检测到多种语言**（例如，同时存在 Python 和 TypeScript 文件）：

   - 检查用户当前文件或问题与哪种语言相关
   - 如果仍不明确，询问：“我检测到了 Python 和 TypeScript 文件。你正在使用哪种语言进行 Claude API 集成？”

3. **如果无法推断语言**（空项目、没有源文件，或使用了不受支持的语言）：

   - 使用 AskUserQuestion，并提供以下选项：Python、TypeScript、Java、Go、Ruby、cURL/raw HTTP、C#、PHP
   - 如果 AskUserQuestion 不可用，默认提供 Python 示例，并说明：“正在展示 Python 示例。如果你需要其他语言，请告诉我。”

4. **如果检测到不受支持的语言**（Rust、Swift、C++、Elixir 等）：

   - 建议使用 `curl/` 中的 cURL/raw HTTP 示例，并说明可能存在社区 SDK
   - 主动提供 Python 或 TypeScript 示例，作为参考实现

5. **如果用户需要 cURL/raw HTTP 示例**，从 `curl/` 中读取。

### 特定语言的功能支持

上述每种 SDK 语言均支持 beta Tool Runner 和 Managed Agents（beta）——Python（`@beta_tool` 装饰器）、TypeScript（`betaZodTool` + Zod）、Java（带注解的类）、Go（`toolrunner` pkg 中的 `BetaToolRunner`）、Ruby（`BaseTool` + `tool_runner`）、C#（`BetaToolRunner` + 原始 JSON schema）、PHP（`BetaRunnableTool` + `toolRunner()`）；代码入口位于下方 Tool Use Patterns 快速参考中。cURL 使用原始 HTTP（不具备 SDK 功能），并支持 Managed Agents。

> **Managed Agents 代码示例**：请参阅下方 `## Managed Agents (Beta)` 节中的阅读指南。

---

## 我应该使用哪个接口？

> **从简单开始。** 默认使用满足需求的最简单层级。单次 API 调用和工作流可处理大多数用例——只有当任务确实需要开放式、模型驱动的探索时，才使用 agents。“最简单”指的是你需要自行维护的代码最少：对于托管、定时或具备记忆能力的 agent，Managed Agents 通常是最简单的选项（无需循环代码、状态文件或调度器），即使它是一个更大的平台。

| 用例                                            | 层级            | 推荐使用面                | 原因                                                         |
| ----------------------------------------------- | --------------- | ------------------------- | ------------------------------------------------------------ |
| 分类、总结、提取、问答                          | 单次 LLM 调用   | **Claude API**            | 一次请求，一次响应                                           |
| 批处理或嵌入                                    | 单次 LLM 调用   | **Claude API**            | 专用端点                                                     |
| 使用代码控制逻辑的多步骤管道                    | 工作流          | **Claude API + tool use** | 由你编排循环                                                 |
| 使用自有工具的自定义智能体                      | 智能体          | **Claude API + tool use** | 最高灵活性                                                   |
| 具有工作区、由服务器管理状态的智能体            | 智能体          | **Managed Agents**        | Anthropic 运行循环并托管工具执行沙箱                         |
| 持久化且带版本的智能体配置                      | 智能体          | **Managed Agents**        | 智能体是存储对象；会话固定到某个版本                         |
| 带文件挂载的长时间运行多轮智能体                | 智能体          | **Managed Agents**        | 每会话容器、SSE 事件流、Skills + MCP                         |
| 按计划运行的智能体（cron、“每晚一次”）          | 智能体          | **Managed Agents** — 计划部署 | 部署会自主触发会话；无需客户端调度器                     |

> **注意：** 当你希望 Anthropic 运行智能体循环，*并且*托管工具执行所在的容器时，Managed Agents 是正确选择——文件操作、bash 和代码执行都会在每会话工作区中运行。如果你希望自行托管计算资源，或运行自定义工具运行时，Claude API + tool use 是正确选择——使用工具运行器处理智能体循环——其每轮钩子仍可提供审批关卡、日志记录、错误拦截和条件执行（参见 `shared/tool-use-concepts.md`）——或者，在希望完全自行掌控整个循环时使用手动循环。

> **云服务提供商访问。** **Claude Platform on AWS** 由 Anthropic 运营，并具备当日 API 功能对等性——客户端设置请参见 `shared/claude-platform-on-aws.md`。有关 **Claude Platform on AWS**、**Amazon Bedrock**、**Google Vertex AI** 和 **Microsoft Foundry** 的各项功能可用性，请参见 `shared/platform-availability.md`——该表格是本 Skill 中唯一的事实来源；不要从其他任何地方推断可用性。

### 构建智能体：四种方法

一旦你确定确实需要一个智能体（开放式、由模型驱动的工具使用），就有四种不同的构建方式。两个相互独立的问题将它们区分开来：**谁提供 harness**（智能体循环 + 上下文管理）以及**谁提供部署**（智能体运行所在的基础设施）。Tool Runner 和 Claude Agent SDK 都只提供 *harness*——你仍需自行托管和部署它们——这也是它们容易被混淆的原因。Managed Agents (CMA) 是唯一同时提供 **harness** *和*托管部署的选项；手动循环两者都不提供。

| # | 方案 | 你编写 | Harness 与部署 | 可用工具 | 适用场景 |
|---|----------|-----------|----------------------|-----------------|----------|
| 1 | **Claude API — 手动循环** | 你自己编写 `while stop_reason == "tool_use"` 循环 | 你构建 harness；你负责托管 | 仅限你定义的工具 | 你想掌控*整个*循环 — 不依赖 beta，或需要的控制流不适合 Tool Runner 的逐轮钩子 |
| 2 | **Claude API — Tool Runner** (`client.beta.messages.tool_runner` + `@beta_tool` / `betaZodTool`) | 仅编写工具函数 | SDK 提供循环（**仅 harness**）；你负责托管 | 仅限你定义的工具 | 需要自定义工具代理，但不想手写循环（大多数情况）。逐轮钩子仍可提供审批关卡、错误拦截、结果修改（例如 `cache_control`）、重试、流式传输和压缩 |
| 3 | **Managed Agents**（REST，beta） | Agent 配置 + 你的工具结果 | Anthropic 提供 harness **并且**托管每会话沙箱（**harness + 部署**） | Anthropic 托管的沙箱（bash、文件、代码执行）+ Skills/MCP + 你的工具 | 你希望 Anthropic 运行循环*并且*托管每会话工作区；需要持久化/版本化配置；需要长时间运行的会话 |
| 4 | **Claude Agent SDK** — *独立产品* (`claude-agent-sdk` / `@anthropic-ai/claude-agent-sdk`) | 一个提示词 + 选项 | SDK 提供 Claude Code harness + 内置工具（**仅 harness**）；你负责托管 | 内置 Read/Write/Edit/Bash/Glob/Grep/WebSearch/WebFetch + MCP + 子代理 | 你希望在自己的基础设施上运行一个开箱即用的编码/文件系统代理 |

harness/部署的划分是关键心智模型：选项 1、2 和 4 都**将部署留给你**；只有选项 3（CMA）增加了托管部署。此 Skill 生成选项 1–3；选项 4 是另一个库，有其自身文档 — 请参阅下方的消歧说明。

> **Tool Runner ≠ Claude Agent SDK。** 两者名称相近，但属于不同的软件包：
> - **Tool Runner** 是常规 Anthropic API SDK（`anthropic` / `@anthropic-ai/sdk`）的一部分，通过 `client.beta.messages.tool_runner` 使用。它会自动执行请求 → 执行 → 循环这一流程，*仅适用于你定义的工具*。没有内置工具、没有文件系统访问、没有沙箱 — 你需要提供每一个工具并托管计算资源。它是上面的选项 2，即对 `POST /v1/messages` 的轻量辅助封装。
> - **Claude Agent SDK**（`claude-agent-sdk` / `@anthropic-ai/claude-agent-sdk`）是作为库封装的 Claude Code。它提供内置工具（文件读取/写入/编辑、bash、grep、网页搜索）、完整代理循环、上下文管理、钩子、子代理、权限和会话。你调用 `query(prompt, options)`，它会驱动全部流程。
>
> 两者都**仅提供 harness — 需要由你负责托管和部署。** 差异在于 harness 的范围：Tool Runner 会遍历*你*定义的工具（具有用于审批、拦截、结果修改和重试的逐轮钩子 — 但没有内置工具）；Agent SDK 是带内置工具的完整 Claude Code harness。两者都不提供托管部署 — **Managed Agents（CMA）**提供的正是这一能力（Anthropic 托管循环和每会话沙箱）。
>
> **此 Skill 覆盖 Claude API 和 Managed Agents（选项 1–3）；它不会生成 Claude Agent SDK 代码。** 如果用户实际需要 Claude Agent SDK，请将其指向对应文档（`code.claude.com/docs/en/agent-sdk`）— 不要以 API Tool Runner 替代它，反之亦然。

### 我应该构建 Agent 吗？

在选择 Agent 层级之前，请检查以下四项标准：

- **复杂度** — 任务是否包含多个步骤，且难以预先完整定义？（例如，“将这份设计文档转成 PR”与“从这份 PDF 中提取标题”）
- **价值** — 结果是否足以证明更高的成本和延迟是合理的？
- **可行性** — Claude 是否擅长处理这类任务？
- **错误成本** — 错误是否能够被发现并恢复？（测试、审查、回滚）

如果其中任一项的答案为“否”，请保持在更简单的层级（单次调用或工作流）。

---

## 架构

所有请求都通过 `POST /v1/messages`。工具和输出约束是该单一端点的功能，而不是独立的 API。

**用户定义的工具** — 你可以定义工具（通过装饰器、Zod schema 或原始 JSON），SDK 的工具运行器会负责调用 API、执行你的函数，并循环执行直至 Claude 完成。若需完全控制，你可以手动编写循环。

**服务端工具** — 由 Anthropic 托管、运行在 Anthropic 基础设施上的工具。代码执行完全在服务端进行（在 `tools` 中声明，Claude 会自动运行代码）。计算机使用功能可以由服务端托管，也可以自行托管。

**结构化输出** — 对 Messages API 的响应格式（`output_config.format`）和/或工具参数验证（`strict: true`）施加约束。推荐的方法是 `client.messages.parse()`，它会根据你的 schema 自动验证响应。注意：旧的 `output_format` 参数已弃用；请在 `messages.create()` 中使用 `output_config: {format: {...}}`。

**支持端点** — 批处理（`POST /v1/messages/batches`）、文件（`POST /v1/files`）、Token 计数（`POST /v1/messages/count_tokens` — 参见 `shared/token-counting.md`）以及模型（`GET /v1/models`、`GET /v1/models/{id}` — 用于实时发现能力和上下文窗口）会为 Messages API 请求提供输入或支持。

---

## 当前模型（缓存时间：2026-06-24）

| 模型             | 模型 ID            | 上下文        | 输入 $/1M | 输出 $/1M |
| ----------------- | ------------------- | -------------- | ---------- | ----------- |
| Claude Fable 5    | `claude-fable-5`      | 1M             | $10.00     | $50.00      |
| Claude Mythos 5（仅限 Project Glasswing） | `claude-mythos-5` | 1M | $10.00     | $50.00      |
| Claude Opus 5     | `claude-opus-5`       | 1M             | $5.00      | $25.00      |
| Claude Opus 4.8 | `claude-opus-4-8`  | 1M             | $5.00      | $25.00      |
| Claude Opus 4.7   | `claude-opus-4-7`   | 1M             | $5.00      | $25.00      |
| Claude Opus 4.6   | `claude-opus-4-6`   | 1M             | $5.00      | $25.00      |
| Claude Sonnet 5   | `claude-sonnet-5`   | 1M             | $3.00（截至 2026-08-31 的介绍价为 $2.00） | $15.00（介绍价为 $10.00） |
| Claude Sonnet 4.6 | `claude-sonnet-4-6` | 1M             | $3.00      | $15.00      |
| Claude Haiku 4.5  | `claude-haiku-4-5`  | 200K           | $1.00      | $5.00       |

**合作伙伴定价：**上述价格为 Anthropic 第一方 API 费率，也适用于 Microsoft Foundry 上的 Claude；后者通过 Microsoft Marketplace 按标准 API 费率计费。Amazon Bedrock 和 Vertex AI 上的 Claude 由合作伙伴运营，定价另行计算 — 请参阅 [Bedrock](https://aws.amazon.com/bedrock/pricing/) 或 [Vertex AI](https://cloud.google.com/vertex-ai/generative-ai/pricing#claude-models)。对于 WebFetch，请使用 `shared/live-sources.md` 中的 Pricing 行。

**除非用户明确指定其他模型，否则始终使用 `claude-opus-5`。** 这不可协商。除非用户明确说“使用 sonnet”或“使用 haiku”，否则不要使用 `claude-sonnet-5`、`claude-sonnet-4-6` 或任何其他模型。绝不要因成本降级，是否这样做由用户决定，而不是你。仅当用户明确要求 Claude Fable 5、“fable”或 Anthropic 最强大的模型时，才使用 `claude-fable-5`，它与 Opus 系列相比具有不同的 API 行为（见下文），且定价高于 Opus 层级。**仅使用表格中的精确模型 ID 字符串，这些字符串本身已完整；绝不要追加日期后缀**（应为 `claude-sonnet-4-6`，绝不能是 `claude-sonnet-4-6-20251114` 或你可能从训练数据中记得的其他带日期后缀的变体）。如果用户请求表中未列出的旧模型（例如“opus 4.5”“sonnet 3.7”），请读取 `shared/models.md` 以获取准确 ID，切勿自行构造。

### Claude Fable 5 (`claude-fable-5`) — 最强大的广泛发布模型

Claude Fable 5 是 Anthropic 最强大的广泛发布模型，适用于要求最高的推理和长周期智能体工作；下述所有内容同样适用于 **Claude Mythos 5**（`claude-mythos-5`，Project Glasswing —— 具有相同的能力、定价和 API 接口；是仅限受邀使用的 `claude-mythos-preview` 的继任者）。支持 1M 上下文窗口（最大值也是默认值），最大输出为 128K。与 Opus 层级相比的关键 API 差异如下；详情请参阅 `shared/model-migration.md` → 迁移至 Claude Fable 5：

- **思考始终开启** —— 完全省略 `thinking` 参数（或发送 `{type: "adaptive"}`）。其他任何显式配置都会被拒绝：`{type: "disabled"}` 和 `{type: "enabled", budget_tokens: N}` 都会返回 400。使用 `output_config.effort` 控制深度（支持从 `low` 到 `xhigh` 以及 `max`）。
- **绝不会返回原始思维链** —— 响应携带常规 `thinking` 块（而非 `redacted_thinking`）：`display: "summarized"` 返回可读摘要，`"omitted"`（默认值）会使 `thinking` 字段保留为空字符串。重放规则：在同一模型上原样传回思考块；其他模型会静默丢弃它们（不计费，无需移除任何内容）；详见 `shared/model-migration.md`。
- **分词器** —— 使用与 Opus 4.8 相同的分词器（随 Opus 4.7 引入）。从 Opus 4.7/4.8 迁移时，token 数量大致不变；每 token 定价不同。从 Opus 4.6、Sonnet、Haiku 或更早版本迁移时，请使用 `count_tokens` 重新建立基准（Opus 4.7 分词器使用的 token 数量约为 1×–1.35×）。
- **`refusal` 停止原因 —— 处理它，并默认启用回退** —— 安全分类器可能拒绝请求（HTTP 200，`stop_reason: "refusal"`，并带有 `stop_details` 类别）；读取 `content` 前务必检查 `stop_reason`。**在编写 `claude-fable-5` 或 `claude-opus-5` 代码时，默认包含服务端 `fallbacks` 参数。** 最简单的形式是：`betas: ["server-side-fallback-2026-07-01"]` + `fallbacks: "default"`，它会按拒绝类别路由，因此你无需维护模型列表。（旧的数组形式 —— `betas: ["server-side-fallback-2026-06-01"]` + `fallbacks: [{"model": "claude-opus-4-8"}]` —— 仍然可用；Claude API 和 AWS 上的 Claude Platform 可使用它；在 Bedrock、Vertex 和 Foundry 上，请改用 SDK 的客户端 `BetaRefusalFallbackMiddleware` + `BetaFallbackState`。）告知用户你已启用它；仅当他们拒绝时才移除。完整语义（计费、流式响应中途拒绝、额度重新定价）请参阅 `shared/model-migration.md` → refusal 部分。**`{lang}/claude-api/README.md` § Refusal Fallbacks 中的各语言代码示例仅涵盖数组形式** —— 对于 `"default"` 模式，请遵循 `shared/model-migration.md` → 迁移至 Claude Opus 5 → 新 API 功能中的原始 HTTP 结构，并将 `fallbacks: [{...}]` 替换为 `fallbacks: "default"`，同时使用 `-2026-07-01` 标头；请求的其余部分保持不变。
- **不支持 assistant 预填充** —— 与其余 4.6+ 系列相同。
- **要求 30 天数据保留** —— Claude Fable 5 不适用于零数据保留；来自保留配置未满足该要求的组织的请求会返回 `400 invalid_request_error`。
- **更长的轮次，不同的提示方式** —— 困难任务的单次请求可能运行数分钟（请规划超时、流式传输和进度 UX）；针对常规工作进行 effort 扫描时，应包含 low/medium；为先前模型编写的提示通常过于规定性，会降低输出质量。推荐的提示片段请参阅 `shared/model-migration.md` → 迁移至 Claude Fable 5 → 行为变化（可通过提示调整）。

如果上方有任何模型字符串看起来不熟悉，那只是因为它们是在你的训练数据截止日期之后发布的，它们是真实存在的模型。

**实时能力查询：**上方表格是缓存的。当用户询问“X 的上下文窗口是多少”“X 是否支持视觉/思考/effort”，或“哪些模型支持 Y”时，请查询 Models API（`client.models.retrieve(id)` / `client.models.list()`）——字段参考和能力筛选示例见 `shared/models.md`。

---

## 身份验证（快速参考）

**未设置 `ANTHROPIC_API_KEY` 并不意味着没有凭据。** SDK 和 `ant` CLI 按以下顺序解析凭据（首个匹配项优先）：`ANTHROPIC_API_KEY` → `ANTHROPIC_AUTH_TOKEN` → 由 `ANTHROPIC_PROFILE` 选择的，或来自 `ant auth login` 的活动 OAuth 配置文件 → 工作负载身份联合环境变量 → 磁盘上的默认配置文件。执行 `ant auth login` 后，即使未设置环境变量，裸 `Anthropic()` / `new Anthropic()` / `anthropic.NewClient()` 也能正常工作。

**当你需要调用 API 而 `ANTHROPIC_API_KEY` 未设置时，不要向用户索要密钥。** 首先运行 `ant auth status`——它会显示哪个凭据来源和配置文件处于活动状态。如果它报告存在活动配置文件：

- **SDK 代码或 `ant` CLI：**直接运行即可。零参数客户端构造函数和每个 `ant …` 子命令都会自动获取该配置文件——无需环境变量。
- **原始 `curl` / HTTP：**使用 `ant auth print-credentials --access-token` 获取短期令牌，并将其作为 `Authorization: Bearer <token>` 发送，**同时**附加请求头 `anthropic-beta: oauth-2025-04-20`（OAuth 令牌应放在 `Authorization: Bearer` 中，而不是 `x-api-key:`——将 curl 从 API 密钥转换为 OAuth 时，改变的是请求头，而不是替换密钥）。始终传入 `--access-token`；不带参数的形式会输出 JSON，而不是裸令牌。

只有在 `ant auth status` 报告没有活动凭据来源（或根本未安装 `ant`）时，才向用户索要密钥。优先建议使用 `ant auth login`——它会在 `~/.config/anthropic/` 下存储一个配置文件，SDK 会自动读取——也可选择导出 `ANTHROPIC_API_KEY`。

完整的身份验证详情（命名配置文件、作用域、API 密钥遮蔽配置文件的陷阱、刷新令牌过期）：`shared/anthropic-cli.md`。

---

## 思考与 Effort（快速参考）

在每个当前模型上使用自适应思考（`thinking: {type: "adaptive"}`）——Claude 会动态决定是否思考、何时思考以及思考多少。各模型规则如下：

| 模型 | 思考配置 | 省略 `thinking` | `budget_tokens` | 采样（`temperature`/`top_p`/`top_k`） | Effort 级别 |
|---|---|---|---|---|---|
| Fable 5 | `{type: "adaptive"}` 或省略；显式指定 `{type: "disabled"}` 会返回 400——请改为省略该参数 | 运行自适应模式（思考始终开启） | 已移除——`{type: "enabled", budget_tokens: N}` 会返回 400 | 已移除——400 | `low`/`medium`/`high`/`xhigh`/`max` |
| Claude Opus 5 | `{type: "adaptive"}` 或省略；仅在 effort 为 `high` 或更低时接受 `{type: "disabled"}`——在 `xhigh`/`max` 时返回 400，并参见下方禁用思考的陷阱 | 运行**自适应**模式（默认开启思考——不同于 Opus 4.8/4.7） | 已移除——400 | 已移除——400 | `low`–`max`（全部五个级别） |
| Opus 4.8 / 4.7 | `{type: "adaptive"}` 是唯一的开启模式；接受 `{type: "disabled"}` | 在**不启用**思考的情况下运行——请显式设置 `{type: "adaptive"}` | 已移除——400 | 已移除——400 | `low`/`medium`/`high`/`xhigh`/`max` |
| Sonnet 5 | `{type: "adaptive"}` 是唯一的开启模式；接受 `{type: "disabled"}` | 运行自适应模式 | 已移除——400 | 已移除——400 | `low`/`medium`/`high`/`xhigh`/`max` |
| Opus 4.6 / Sonnet 4.6 | `{type: "adaptive"}`（推荐；自动启用交错思考，无需 beta 请求头） | 显式设置 `{type: "adaptive"}` | 已弃用——请勿在新代码中使用；仅作为过渡性应急方案（见下文） | 允许 | `low`/`medium`/`high`/`max`（`xhigh` 随 Opus 4.7 推出） |
| 较旧版本（Sonnet 4.5、Haiku 4.5，……）——仅在被明确请求时使用 | `{type: "enabled", budget_tokens: N}` | 不启用思考 | 思考时必需；必须小于 `max_tokens`，最小值为 1024——否则会报错 | 允许 | `effort` 在 Opus 4.5 上可用（仅 `low`/`medium`/`high`——没有 `xhigh`/`max`）；在 Sonnet 4.5 / Haiku 4.5 上会报错 |

Opus 4.8 保持与 4.7 相同的请求接口（没有新增破坏性变更）——有关行为重新调优，请参阅 `shared/model-migration.md` → 迁移到 Opus 4.8；如果从 4.6 或更早版本迁移，有关完整的破坏性变更列表，请参阅 → 迁移到 Opus 4.7。禁用 `thinking` 时，Opus 4.8 可能会在可见响应中写入更长的推理内容——请保持启用自适应思考，或添加仅限最终答案的指令（参阅迁移指南）。

- **工作量（GA，无 beta 标头）：** `output_config: {effort: "low"|"medium"|"high"|"xhigh"|"max"}` ——位于 `output_config` 内部，而非顶层；默认值为 `high`（等同于省略该项）。控制思考深度和总体 token 消耗；与自适应思考结合使用，以获得最佳的成本质量权衡。`xhigh`（在 Opus 4.7 中新增，介于 `high` 和 `max` 之间）是 Fable 5 / Opus 4.7/4.8 / Sonnet 5 上大多数编码和智能体用例的最佳设置，也是 Claude Code 中的默认值；在这些模型上，工作量比同层级的任何先前模型都更重要——迁移时请重新调优它，并在提供完整任务规范的前提下，以 `high`/`xhigh` 运行长周期/智能体任务。对于智能敏感型工作，至少使用 `high`；当正确性比成本更重要时使用 `max`；对于子智能体或简单任务使用 `low`——较低的工作量意味着更少且更合并的工具调用、更少的前言以及更简洁的确认（`high` 往往是在质量与 token 效率之间取得平衡的最佳选择）。
- **思考显示 — Fable 5 / Mythos 5 / Opus 5 / 4.8 / 4.7 / Sonnet 5 默认使用 `"omitted"`：** `display: "summarized"` 会返回易读的推理摘要；`"omitted"`（全部六个模型上的默认值——相较于 Opus 4.6 和 Sonnet 4.6 的静默变更，后两者使用的是 `"summarized"`）会流式传输文本为空的 `thinking` 块。`display` 仅控制可见性——在每种设置下都会进行思考并以相同方式计费；任何模型都不会暴露原始思维链。如果你向用户流式传输推理，默认设置看起来会像是在输出前长时间停顿——请显式设置 `thinking: {type: "adaptive", display: "summarized"}`。（与显示无关，在同一模型上继续时，请原样回传思考块；其他模型会静默忽略它们——参阅迁移指南。）
- **当用户要求“扩展思考”、“思考预算”或 `budget_tokens` 时：** 始终使用 Fable 5、Opus 5、4.8、4.7 或 4.6，并设置 `thinking: {type: "adaptive"}` ——固定思考 token 预算的概念已弃用，自适应思考将取而代之。请勿在新的 4.6/4.7/4.8 代码中使用 `budget_tokens`，也不要仅仅因为用户提到了它就切换到旧版模型。*渐进迁移例外：* `budget_tokens` 仍仅在 Opus 4.6 和 Sonnet 4.6 上可用，作为现有代码的过渡性应急方案；在你调优 `effort` 前，若现有代码需要硬性 token 上限，可使用它——参阅 `shared/model-migration.md` → 过渡性应急方案。它在 Fable 5、Opus 5/4.7/4.8 和 Sonnet 5 上已被完全移除。

---

## 压缩（快速参考）

**Beta、Fable 5、Opus 5、Opus 4.8、Opus 4.7、Opus 4.6、Sonnet 5 和 Sonnet 4.6。** 对于可能超过 1M 上下文窗口的长时间运行对话，请启用服务端压缩。当 API 接近触发阈值（默认：150K tokens）时，会自动总结较早的上下文。需要 beta 标头 `compact-2026-01-12`。

**关键：**在每一轮中，将 `response.content`（而不只是文本）追加回你的消息。响应中的压缩块必须保留——API 会在下一次请求时使用它们替换已压缩的历史记录。仅提取文本字符串并将其追加，会悄然丢失压缩状态。

有关代码示例，请参阅 `{lang}/claude-api/README.md`（压缩部分）。完整文档可通过 `shared/live-sources.md` 中的 WebFetch 获取。

---

## 提示缓存（快速参考）

**前缀匹配。**前缀中任意位置的任何字节变化，都会使其后的所有内容失效。渲染顺序为 `tools` → `system` → `messages`。将稳定内容放在前面（固定的系统提示词、确定性的工具列表），将易变内容（时间戳、每请求 ID、变化的问题）放在最后一个 `cache_control` 断点之后。

**对话中途的操作员指令**（Claude Opus 5、Claude Opus 4.8、Claude Fable 5、Claude Mythos 5；不包括 Claude Sonnet 5；无需 beta 标头）：将 `{"role": "system", ...}` 追加到 `messages[]`，而不是编辑顶层 `system`。这会保留缓存的历史前缀，并且是防提示注入的操作员通道。请参阅 `shared/prompt-caching.md` § 对话中途的系统消息。

**顶层自动缓存**（在 `messages.create()` 中设置 `cache_control: {type: "ephemeral"}`）是在不需要细粒度放置时最简单的选项。每个请求最多 4 个断点。最小可缓存前缀约为 1024 个 token——更短的前缀不会缓存，且不会有提示。

**通过 `usage.cache_read_input_tokens` 验证**——如果在重复请求中它始终为零，说明存在静默失效因素（系统提示词中的 `datetime.now()`、未排序的 JSON、变化的工具集）。

有关放置模式、架构指导和静默失效因素审计清单：请阅读 `shared/prompt-caching.md`。特定语言的语法请参阅 `{lang}/claude-api/README.md`（提示缓存部分）。

---

## 快速模式（快速参考）

**研究预览版，仅适用于 Claude Opus 5 / Opus 4.8**——适用于 Claude API 和 Managed Agents，不适用于 Bedrock / Google Cloud / Foundry。Opus 4.7 快速模式已被移除：在 4.7 上使用 `speed: "fast"` 会返回错误。Claude Opus 5 的快速模式定价为每 MTok $10 / $50。快速模式以溢价运行相同的模型，输出 token 速度最高可提升至 2.5 倍。每个请求都必须满足三项要求：使用 **beta** 消息端点（`client.beta.messages.…`），传递 beta 标志 `fast-mode-2026-02-01`，并将 `speed: "fast"` 设为顶层请求参数（不是标头，也不在 `extra_body` 中）。

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
| cURL | `anthropic-beta: fast-mode-2026-02-01` 标头 | 请求正文中的 `"speed": "fast"` |

`response.usage.speed` 会报告所使用的速度。快速模式拥有独立于标准 Opus 的速率限制；遇到 429 时，可在 `retry-after` 延迟后重试，或者移除 `speed` 并回退到标准模式（注意：切换速度会使提示缓存失效）。Batch API、Priority Tier、AWS 上的 Claude Platform 或第三方平台不支持此功能。

**Priority Tier 不涵盖 Claude Opus 5。** 它支持所有其他当前模型，包括 Claude Fable 5 和 Opus 4.8，但不包括 Claude Opus 5、Claude Sonnet 5、Claude Mythos 5 和 Mythos Preview —— 使用其中任一模型的 Priority Tier 请求都会验证失败。

---

## 任务预算（快速参考）

**Beta，Claude Opus 5 / Fable 5 / Sonnet 5 / Opus 4.8 / 4.7。** 任务预算为 Claude 的智能体循环提供一个令牌上限，使其能够自行控制节奏并平稳完成，而不是被中途截断 —— 这不同于 `max_tokens`，后者是模型无法感知的、强制执行的单次响应上限。最小 `total` 为 20,000。在 `client.beta.messages.stream(...)` 的 `output_config` 内设置 `task_budget`，并使用 Beta 标志 `task-budgets-2026-03-13` —— 请使用流式响应，以避免较大的 `max_tokens` 触发 HTTP 超时（完整详情：`shared/model-migration.md` → 任务预算）：

```python
with client.beta.messages.stream(
    model="claude-opus-5", max_tokens=128000,
    output_config={"effort": "high", "task_budget": {"type": "tokens", "total": 64000}},
    betas=["task-budgets-2026-03-13"],
    messages=[...], tools=[...],
) as stream:
    response = stream.get_final_message()
```

`task_budget` 字段包括：`type`（始终为 `"tokens"`）、`total`，以及可选的 `remaining`（默认值为 `total`）。服务器会注入一个 Claude 在生成期间可见的倒计时标记；该预算会统计 Claude 在本轮生成的内容以及读取的工具结果 —— **不会**统计你在每次请求中重新发送的完整历史记录。这与 **托管智能体会话预算** 并不相同 —— 后者是针对单个 CMA 会话、以美元计价且由平台强制执行的硬性上限（`shared/managed-agents-core.md` § 会话预算）；任务预算则是建议性的，并以令牌计量。

**观察消耗：**如果你想展示进度，请跨循环迭代累计 `response.usage.output_tokens`（以及你追加的工具结果块的令牌数）。在正常循环中不要设置 `remaining` —— 服务器会自行跟踪倒计时；在同时重新发送完整历史记录时传入由客户端计算的 `remaining`，会导致预算消耗被低报。**仅在**你在请求之间压缩或重写历史记录，且服务器无法再推导此前消耗时，才传入 `remaining`。

---

## 提供商客户端（快速参考）

在第三方平台上使用 Claude 时，应使用该平台专用的客户端类 —— 不要使用带有 `base_url` 覆盖的第一方 `Anthropic()` 客户端。构造完成后，客户端会暴露与第一方 SDK 相同的 `messages.create` / `.stream` 接口。

### Amazon Bedrock

使用 **Mantle** 客户端（Messages-API Bedrock 端点）。Bedrock 模型 ID 使用 `anthropic.` 前缀（例如 `"anthropic.claude-opus-5"`）。必须指定区域。

| 语言 | 客户端 |
|---|---|
| Python | `from anthropic import AnthropicBedrockMantle` → `AnthropicBedrockMantle(aws_region="…")` |
| TypeScript | `import { AnthropicBedrockMantle } from "@anthropic-ai/bedrock-sdk"` → `new AnthropicBedrockMantle({ awsRegion: "…" })` |
| Go | `bedrock.NewMantleClient(ctx, bedrock.MantleClientConfig{ AWSRegion: "…" })` |
| Java | `AnthropicOkHttpClient.builder().backend(BedrockMantleBackend.fromEnv()).build()`（来自 `com.anthropic.bedrock.backends`） |
| C# | `new AnthropicBedrockMantleClient(new() { AwsRegion = "…" })`（包 `Anthropic.Bedrock`） |
| PHP | `use Anthropic\Bedrock\MantleClient;` → `new MantleClient(awsRegion: '…')` |
| Ruby | `Anthropic::BedrockMantleClient.new(aws_region: "…")` |

`AnthropicBedrock` / `BedrockClient` / `BedrockBackend`（不含 `Mantle`）是旧版的 `bedrock-runtime` InvokeModel 路径——新代码应优先使用 Mantle 客户端。

### Microsoft Foundry

| 语言 | 客户端 |
|---|---|
| Python | `from anthropic import AnthropicFoundry` → `AnthropicFoundry(api_key=…, resource="…")` |
| TypeScript | `import AnthropicFoundry from "@anthropic-ai/foundry-sdk"` → `new AnthropicFoundry({ … })` |
| Java | `AnthropicOkHttpClient.builder().backend(FoundryBackend.fromEnv()).build()`（来自 `com.anthropic.foundry.backends`） |
| C# | `new AnthropicFoundryClient(new AnthropicFoundryApiKeyCredentials(…))`（包 `Anthropic.Foundry`） |
| PHP | `Foundry\Client::withCredentials(…)` |

Go 和 Ruby SDK 目前不支持 Foundry。对于 Ruby，可改用标准的 `Anthropic::Client.new(base_url: "<foundry endpoint>")` 作为后备方案（未内置 Entra ID 身份验证）。有关 AWS 上的 Claude Platform，请参阅 `shared/claude-platform-on-aws.md`。

### Google Cloud Vertex AI

两个必需的构造函数参数：GCP `project_id` 和 `region`。Vertex 模型 ID **不带前缀**——当前代模型（Opus 4.8/4.7/4.6、Sonnet 5、Sonnet 4.6）使用裸的第一方 ID（例如 `"claude-opus-5"`）；带日期快照的模型使用 `@` 作为版本分隔符（例如 `claude-opus-4-5@20251101`，**而不是** `claude-opus-4-5-20251101`）。身份验证使用 GCP ADC（`gcloud auth application-default login`）；不需要 Anthropic API 密钥。`region` 可以是 `"global"`（推荐）、多区域（`"us"`/`"eu"`），或特定区域。构造完成后，使用相同的 `messages.create` / `.stream` 接口。

| 语言 | 客户端 |
|---|---|
| Python | `from anthropic import AnthropicVertex` → `AnthropicVertex(project_id="…", region="…")`（安装 `"anthropic[vertex]"`） |
| TypeScript | `import { AnthropicVertex } from "@anthropic-ai/vertex-sdk"` → `new AnthropicVertex({ projectId, region })` |
| Go | `import "github.com/anthropics/anthropic-sdk-go/vertex"` → `anthropic.NewClient(vertex.WithGoogleAuth(ctx, region, projectID))` |
| Java | `AnthropicOkHttpClient.builder().backend(VertexBackend.builder().region("…").project("…").build()).build()`（来自 `com.anthropic.vertex.backends`） |
| C# | `new AnthropicClient { Backend = new VertexBackend(projectId, region) }`（包 `Anthropic.Vertex`） |
| PHP | `use Anthropic\Vertex;` → `Vertex\Client::fromEnvironment(location: '…', projectId: '…')`——注意是 `location`，不是 `region` |
| Ruby | `Anthropic::VertexClient.new(region: "…", project_id: "…")` |

---

## 上下文编辑（快速参考）

**Beta。** 上下文编辑会在模型看到对话之前，**清除**其中旧的工具结果或思考块；它**不是压缩**（压缩会生成摘要）。在使用 beta `context-management-2025-06-27` 的 `client.beta.messages.*` 上，传入带有策略类型的 `context_management.edits`：

```python
client.beta.messages.create(
    model="claude-opus-5", max_tokens=4096,
    betas=["context-management-2025-06-27"],
    context_management={"edits": [{"type": "clear_tool_uses_20250919"}]},
    tools=[...], messages=[...],
)
```

策略类型：`clear_tool_uses_20250919`（清除旧的工具结果；可选的 `clear_tool_inputs: true` 还会清除 `tool_use` 参数）和 `clear_thinking_20251015`（清除思考块）。**不要**使用 `compact_20260112` 或 beta `compact-2026-01-12`，它们属于独立的压缩功能。

---

## 对话中途系统消息（快速参考）

**Claude Opus 5、Claude Opus 4.8、Claude Fable 5 和 Claude Mythos 5；不包括 Claude Sonnet 5；无需 beta 请求头。** 将 `{"role": "system", "content": "…"}` 追加到 `messages` 数组中（而不是顶层 `system` 字段），即可在对话中途添加运营方指令，而不会使缓存前缀失效。使用常规的 `client.messages.create`，不存在 beta 版本。对话中途的系统消息必须位于 `user` 消息之后（或位于以服务器工具使用结尾的 `assistant` 消息之后），并且必须是 `messages` 中最后一项，或其后紧跟一个 `assistant` 轮次；它不能是 `messages[0]`。可用性：`shared/platform-availability.md`。参见 `shared/prompt-caching.md` § 对话中途系统消息。

---

## 托管代理（Beta）

**托管代理** 是第三种接口形态：由服务器托管的有状态代理，并使用 Anthropic 托管的工具执行。先创建一个持久化且带版本的 Agent 配置（`POST /v1/agents`），然后启动引用该配置的 Session。每个会话都会配置一个容器作为代理的工作区：bash、文件操作和代码执行均在其中运行；代理循环本身则运行在 Anthropic 的编排层，并通过工具操作该容器。会话会流式传输事件；你将消息和工具结果发送回去。

可用性：`shared/platform-availability.md`。对于 Bedrock / Vertex / Foundry 上的代理（这些平台不支持托管代理），请使用 Claude API + 工具使用。

**强制流程：** Agent（一次）→ Session（每次运行）。`model`/`system`/`tools` 位于 Agent 上，绝不位于 Session 上。完整阅读指南、beta 请求头和注意事项请参见 `shared/managed-agents-overview.md`。

**Beta 请求头：** `managed-agents-2026-04-01` — SDK 会为所有 `client.beta.{agents,environments,sessions,vaults,memory_stores,deployments,deployment_runs}.*` 调用自动设置此请求头。Skills API 使用 `skills-2025-10-02`，Files API 使用 `files-api-2025-04-14`，但对于 `/v1/skills` 和 `/v1/files` 以外的端点，你无需显式传入这些请求头。

**子命令** — 使用 `/claude-api <subcommand>` 直接调用：

| 子命令 | 操作 |
|---|---|
| `managed-agents-onboard` | 引导用户从零开始设置托管代理。**立即阅读 `shared/managed-agents-onboarding.md`**，并遵循其中的访谈脚本：**说明 → 配置代理（提出建议，而非盘问）→ 环境 → 会话**（与 Console 快速入门具有相同的流程，认证延后到会话步骤）—— 默认值和内联建议应承担主要工作；在输出任何代码之前，进行静默的可行性检查（任务与工具/凭据/数据的匹配情况）。不要总结，直接开展访谈。 |

**阅读指南：**先阅读 `shared/managed-agents-overview.md`，然后阅读专题 `shared/managed-agents-*.md` 文件（core、environments、tools、events、outcomes、multiagent、webhooks、memory、scheduled-deployments、client-patterns、onboarding、api-reference）。对于 Python、TypeScript、Go、Ruby、PHP 和 Java，请阅读 `{lang}/managed-agents/README.md` 以获取代码示例。对于 cURL，请阅读 `curl/managed-agents.md`。**Agent 是持久化的——创建一次后，通过 ID 引用。**使用 `ant` CLI 将 Agent 和环境定义为受版本控制的 YAML 并应用它们——这是推荐流程（参见 `shared/anthropic-cli.md`）：CLI 负责控制平面（创建和更新 Agent），你的代码负责数据平面（使用已存储的 Agent ID 调用 `sessions.create`）。仅当必须以编程方式进行预配时，才在代码中调用 `agents.create()`；无论采用哪种方式，都应存储返回的 Agent ID，并将其传递给之后的每一次 `sessions.create`；绝不要在请求路径中调用 `agents.create()`。如果语言 README 未展示所需的绑定，请从 `shared/live-sources.md` 获取相关条目，而不要猜测。C# 通过 `client.Beta.Agents` 和相关命名空间提供处于 Beta 阶段的 Managed Agents 支持——详情请参见 `csharp/claude-api/README.md`，或参阅 `curl/managed-agents.md` 获取原始 HTTP 参考。

**当用户想要从零开始设置 Managed Agent 时**（例如，“如何开始”“带我创建一个”“设置一个新的 Agent”）：阅读 `shared/managed-agents-onboarding.md` 并执行其中的访谈流程——这与 `managed-agents-onboard` 子命令的流程相同。

**当用户询问“如何为 X 编写客户端代码”时：**应使用 `shared/managed-agents-client-patterns.md`——其中涵盖无损流重连、`processed_at` 排队/已处理门控、中断、`tool_confirmation` 往返、正确的空闲/终止退出门控、空闲后的状态竞争、流优先排序、文件挂载注意事项等。对于凭据，应优先使用 vault `environment_variable` 凭据——这是第一方机制；机密会在出口处被替换，且永远不会进入沙箱（`shared/managed-agents-tools.md` → Vaults）。当 vault 凭据不适用时（例如自托管沙箱），通过自定义工具将凭据保留在主机端是后备方案。

**当用户希望 Agent 按计划运行时**（cron、“每晚”“每周报告”）：阅读 `shared/managed-agents-scheduled-deployments.md`——部署会按照 cron 周期自主触发会话，并提供每次触发的运行记录和生命周期控制（暂停/取消暂停/归档）。

**当 Agent 的工作需要分发时**（跨多个来源的研究、按文件或按记录处理工作、“研究 N 件事，然后总结”），**或者单个循环会因阅读而耗尽其上下文时：**阅读 `shared/managed-agents-multiagent.md` 并推荐使用多 Agent 会话——先在 roster 中仅使用 `{"type": "self"}`，以便 Agent 能够将任务委派给自身副本，然后将阅读量大的子任务转移给通过 ID 引用的更低成本工作 Agent（例如 Claude Haiku 4.5）。

## 服务器工具（快速参考）

服务器端工具在 Anthropic 的基础设施上运行，无需客户端执行循环。在 `tools` 中声明；结果会作为同一响应中的内容块返回。除非另有说明，否则**无需 beta 标头**。**优先使用你的模型所支持的最新类型变体。** 以下 `_20260209` Web 搜索 / Web 获取变体（动态过滤）要求使用 Opus 5/4.8/4.7/4.6、Sonnet 5 或 Sonnet 4.6；适用于旧版模型的基础变体列在表格之后。

| 工具 | `type` | `name` | 关键可选参数 | 结果块类型 |
|---|---|---|---|---|
| Web 搜索 | `web_search_20260209` | `web_search` | `max_uses`、`allowed_domains`/`blocked_domains`、`user_location` | `web_search_tool_result` → `.content` 是 `web_search_result` 的列表 |
| Web 获取 | `web_fetch_20260209` | `web_fetch` | `max_uses`、`allowed_domains`/`blocked_domains`、`citations`、`max_content_tokens` | `web_fetch_tool_result` → `.content` 是带有 `document` 块的 `web_fetch_result` |
| 代码执行 | `code_execution_20260521` | `code_execution` | 无 | `bash_code_execution_tool_result` → `.content.stdout` / `.stderr` / `.return_code` |
| 工具搜索（正则表达式） | `tool_search_tool_regex_20251119` | `tool_search_tool_regex` | 将其他工具标记为 `defer_loading: true` | `tool_search_tool_result` |
| 工具搜索（BM25） | `tool_search_tool_bm25_20251119` | `tool_search_tool_bm25` | 将其他工具标记为 `defer_loading: true` | `tool_search_tool_result` |

`web_search_20260209` / `web_fetch_20260209` 内置动态过滤，底层会运行代码执行，因此请勿在 `tools` 中单独声明 `code_execution`（第二个执行环境会使模型混淆）。对于早于 Opus 4.6 / Sonnet 4.6 的模型，请改用基础变体 `web_search_20250305` / `web_fetch_20250910`；在 Vertex AI 上仅提供基础 `web_search_20250305`。`code_execution_20260120`（REPL 持久化 + 程序化工具调用）可用于 Opus 4.5+ / Sonnet 4.5+。**仅限 Go SDK：** `code_execution_20260521` 位于 `client.Beta.Messages.New` 下，并使用 `Betas: []anthropic.AnthropicBeta{"code-execution-2025-08-25"}`（其他语言使用普通的 `client.messages.create`）；`code_execution_20260120` 在 Go 中与其他环境一样使用非 beta 的 `client.Messages.New`。Web 获取只能获取对话中已存在的 URL。不同提供商对各工具的可用性有所不同，请参阅 `shared/platform-availability.md`。有关 `pause_turn` 的处理，请参阅 `shared/tool-use-concepts.md`。

## 文档与文件输入（快速参考）

**PDF（base64，无 beta）：** 在用户内容中使用 `{"type": "document", "source": {"type": "base64", "media_type": "application/pdf", "data": <b64 string>}}`，并将其放置在文本块之前。Base64 字符串不得包含换行符。限制：32 MB 请求、600 页（对于 200k 上下文模型为 100 页）。Java：`ContentBlockParam.ofDocument(DocumentBlockParam... Base64PdfSource.builder().data(...))`。

**文件 API（beta `files-api-2025-04-14`）：** 通过 `client.beta.files.upload(...)` 上传 → 响应中的 `id` 即为 `file_id`。对于 PDF/文本，将其引用为 `{"type": "document", "source": {"type": "file", "file_id": "..."}}`；对于图片，则引用为 `{"type": "image", ...}`，内容块类型必须与文件的 MIME 类型匹配。在上传以及引用该文件的 `messages.create` 中，均需要 beta 标头。可用性：`shared/platform-availability.md`。

**引用（无 beta）：** 在每个 `document` 内容块上设置 `citations: {enabled: true}`（要么全部设置，要么全部不设置）。响应会拆分为多个 `text` 块；带引用的块包含一个 `citations` 数组。每个引用包含 `cited_text`、`document_index`、`document_title`，以及按 `type` 区分的位置：纯文本使用 `char_location`（`start_char_index`/`end_char_index`），PDF 使用 `page_location`（`start_page_number`/`end_page_number`，从 1 开始计数），自定义内容使用 `content_block_location`。与 `output_config.format` 不兼容（会返回 400）。

## 工具使用模式（快速参考）

**严格工具使用（无 beta）：** 在工具定义中将 `strict: true` 设为顶层字段（与 `name`/`description`/`input_schema` 同级），**不要**设在 `tool_choice` 中。Schema 必须包含 `additionalProperties: false` + `required`。这保证 `tool_use.input` 能够精确通过校验。Go：`Strict: anthropic.Bool(true)` + 通过 `InputSchema.ExtraFields` 设置 `additionalProperties`；Java：`.strict(true)` + `.putAdditionalProperty("additionalProperties", JsonValue.from(false))`。

**并行工具使用（默认开启）：** 一条 assistant 消息可以包含多个 `tool_use` 块。并发执行它们，然后在**一条** user 消息中返回**所有** `tool_result` 块 —— 将它们拆分到多条消息中会在无形中训练 Claude 停止发起并行调用。对于失败的工具，返回带有 `is_error: true` 的 `tool_result` —— 不要省略它。

**Tool Runner（SDK beta 辅助工具）：** 通过 `client.beta.messages.*` 为你驱动工具调用循环。Python：`@beta_tool` 装饰器 + `client.beta.messages.tool_runner(...)` → `runner.until_done()`。TypeScript：从 `@anthropic-ai/sdk/helpers/beta/zod` 导入 `betaZodTool({...})` + `client.beta.messages.toolRunner(...)` → `await runner`。Go：`toolrunner.NewBetaToolFromJSONSchema(...)` + `client.Beta.Messages.NewToolRunner(...)` → `.RunToCompletion(ctx)`。Java 需要 `.addBeta("structured-outputs-2025-11-13")`。Ruby：`Anthropic::BaseTool` 子类 + `client.beta.messages.tool_runner(...)`。PHP：`BetaRunnableTool` + `->toolRunner(...)`。C#：原始 JSON-schema 工具 + 通过 `client.Beta.Messages.ToolRunner(...)` 使用 `BetaToolRunner`。

**程序化工具调用（无需 beta header）：** Claude 从代码执行内部调用你的自定义工具。添加 `{"type": "code_execution_20260120", "name": "code_execution"}`，并在自定义工具上设置 `"allowed_callers": ["code_execution_20260120"]`。Opus 4.5+ / Sonnet 4.5+（可用性：`shared/platform-availability.md`）。响应待处理的程序化调用时，user 消息必须**仅**包含 `tool_result` 块（不含文本）。与 `strict: true`、`disable_parallel_tool_use`、强制 `tool_choice` 或 MCP 工具不兼容。

## 其他 API 接口（快速参考）

**消息批处理（无 beta；可用性：`shared/platform-availability.md`）：** `client.messages.batches.create(requests=[{custom_id, params}, ...])` → 轮询 `client.messages.batches.retrieve(id).processing_status`，直到 `"ended"` → 流式读取 `client.messages.batches.results(id)`。每个结果包含 `.custom_id` + `.result.type`（`succeeded`/`errored`/`canceled`/`expired`）；成功时读取 `.result.message.content`。Python 将请求封装为 `Request(custom_id=..., params=MessageCreateParamsNonStreaming(...))`。结果会以**任意顺序**到达 —— 按 `custom_id` 而非位置作为键。

**Models API（无 beta；可用性：`shared/platform-availability.md`）：** `client.models.list()`（自动分页）和 `client.models.retrieve("claude-opus-5")`。每个模型对象包含 `id`、`display_name`、`created_at`，以及自 2026 年 3 月起提供的 `max_input_tokens`（上下文窗口）、`max_tokens`（输出上限）和 `capabilities`。不存在 `context_window` 字段。

**停止详情（GA，Opus 4.7+）：** 仅当 `stop_reason == "refusal"` 时，`response.stop_details` 才会被填充（字段包括：`type: "refusal"`、`category`——一个开放集合，例如 `"cyber"`、`"bio"`、`"reasoning_extraction"`、`"frontier_llm"` 或 `null`；完整列表请参阅文档——以及 `explanation`）。对于其他所有 `stop_reason`（`end_turn`、`max_tokens`、`tool_use`、`pause_turn` 等），其值均为 `null`——读取前务必进行保护判断。

**客户端配置（无 beta）：** `timeout` 默认值为 10 分钟；**不同 SDK 的单位不同**——Python/Ruby：秒；TypeScript：**毫秒**；Go：`option.WithRequestTimeout(time.Duration)`；Java：`Duration`；C#：`TimeSpan`。对于非流式请求中的大 `max_tokens`，TS 会将默认值扩大到 60 分钟；Java 会对流式请求进行同样的扩展（Java 非流式请求的范围为 30 秒至 10 分钟）。`max_retries`/`maxRetries` 默认值为 2（重试 408/409/429/5xx 及连接错误）。`base_url`（或 `ANTHROPIC_BASE_URL` 环境变量）。单请求覆盖：Python `client.with_options(timeout=5.0).messages.create(...)`；TS `client.messages.create({...}, {timeout: 5_000})`；Ruby `request_options: {timeout: 5}`。超时会重试——总耗时最长可达 `timeout × (max_retries+1)`。

## 工作负载身份联合（快速参考）

**GA，无 beta 请求头。** 构造常规的零参数客户端（`Anthropic()` / `new Anthropic()` / `anthropic.NewClient()` / `AnthropicOkHttpClient.fromEnv()`）；当 `ANTHROPIC_FEDERATION_RULE_ID`、`ANTHROPIC_ORGANIZATION_ID`、`ANTHROPIC_SERVICE_ACCOUNT_ID` 和 `ANTHROPIC_IDENTITY_TOKEN_FILE`（或 `ANTHROPIC_IDENTITY_TOKEN`）**全部**已设置时，SDK 会自动检测 WIF，在 `/v1/oauth/token` 交换 JWT，并自动刷新。`ANTHROPIC_WORKSPACE_ID` 不决定是否激活——仅当联合规则跨越多个工作区时才必需（否则为 400 `workspace_id_required`），对于单工作区规则则可选。`ANTHROPIC_API_KEY` 或 `ANTHROPIC_AUTH_TOKEN`（即使为空）优先级高于 WIF，已设置的 `ANTHROPIC_PROFILE` 也优先于联合环境变量（缺少指定名称的 profile 会报错，而不会回退）——请取消设置这三个变量。

---

## 阅读指南

检测到语言后，根据用户需要阅读相应文件。

**所有 SDK 语言均采用相同的多文件布局**——目录 `{lang}/claude-api/` 包含 `README.md`（安装、客户端初始化、基本请求、思考、缓存、停止详情、杂项）、`tool-use.md`（工具定义、代理循环、Anthropic 定义的工具、结构化输出）、`streaming.md`、`batches.md`、`files-api.md`。并非每种语言都包含每个文件（例如 Ruby 没有 `batches.md`）；如果某个文件不存在，则表示该功能的示例尚未针对该语言编写文档——请回退使用 cURL 形式，或从 `shared/live-sources.md` 中 WebFetch SDK 仓库。**cURL** → `curl/examples.md`。

下方的快速任务参考对所有语言均使用 `{lang}/claude-api/FILE.md` 路径表示法。

### 快速任务参考

**单个文本分类/摘要/提取/问答：**
→ 仅阅读 `{lang}/claude-api/README.md` — 对任何任务都**始终先阅读 README**（安装、快速开始、常见模式、错误处理）

**聊天 UI 或实时响应显示：**
→ 阅读 `{lang}/claude-api/README.md` + `{lang}/claude-api/streaming.md`

**长时间运行的对话（可能超出上下文窗口）：**
→ 阅读 `{lang}/claude-api/README.md` — 参见 Compaction 部分
**迁移到较新的模型（Fable 5 / Opus 5 / Opus 4.8 / Opus 4.7 / Opus 4.6 / Sonnet 5 / Sonnet 4.6）、替换已退役模型，或将 `budget_tokens` / 预填充模式迁移到当前 API：**
→ 阅读 `shared/model-migration.md`
**提示 Fable 5 或对其进行调优（长轮次、投入程度、详细程度、自主运行、子代理）：**
→ 阅读 `shared/model-migration.md` → 迁移到 Fable 5 → 行为变化（可通过提示调节）+ 长时间运行代理建议
**提示缓存 / 优化缓存 / “为什么我的缓存命中率低”：**
→ 阅读 `shared/prompt-caching.md`（前缀稳定性设计、断点放置、会悄然使缓存失效的反模式）+ `{lang}/claude-api/README.md`（Prompt Caching 部分）
**审查或清理提示、技能或工具描述（“这个提示过时了吗”、“移除冗余内容”、“这是为较旧模型编写的”）：**
→ 阅读 `shared/prompt-audit.md` — 包含带有可搜索信号的过时模式表格、保留清单（不应删除的内容），以及报告 + 拟议差异输出约定
**统计文件 / 提示 / 差异中的 token 数量（“X 有多少 token”）：**
→ 阅读 `shared/token-counting.md` — 使用 `messages.count_tokens`，绝不使用 `tiktoken`

**函数调用 / 工具使用 / 代理：**
→ 阅读 `{lang}/claude-api/README.md` + `shared/tool-use-concepts.md`（概念基础：函数调用、代码执行、记忆、结构化输出）+ `{lang}/claude-api/tool-use.md`（特定语言的代码示例：工具运行器、手动循环、代码执行、记忆、结构化输出）

**代理设计（工具界面、上下文管理、缓存策略）：**
→ 阅读 `shared/agent-design.md`（bash 与专用工具、程序化工具调用、工具搜索/技能、上下文编辑与压缩与记忆、缓存原则）

**批处理（对延迟不敏感；以 50% 成本异步运行）：**
→ 阅读 `{lang}/claude-api/README.md` + `{lang}/claude-api/batches.md`

**跨多个请求上传文件（无需重新上传同一文件）：**
→ 阅读 `{lang}/claude-api/README.md` + `{lang}/claude-api/files-api.md`

**调试 HTTP 错误或实现错误处理：**
→ 阅读 `shared/error-codes.md` — 包含各 SDK 类型化异常类表格及 Go 的 `errors.As` 模式

**最新官方文档：**
→ 通过 WebFetch 获取 `shared/live-sources.md` 中的 URL

**托管代理（具有工作区的服务器托管有状态代理）：**
→ 参见上方 `## Managed Agents (Beta)` 部分中的阅读指南 — 其中列出了每个 `shared/managed-agents-*.md` 文件，以及特定语言的 README（`{lang}/managed-agents/README.md`、`curl/managed-agents.md`）。

---

## 何时使用 WebFetch

在以下情况使用 WebFetch 获取最新文档：

- 用户要求“最新”或“当前”信息
- 缓存的数据似乎不正确
- 用户询问此处未涵盖的功能

实时文档 URL 位于 `shared/live-sources.md`。

## 常见陷阱

- 将文件或内容传递给 API 时，不要截断输入。如果内容太长，无法容纳在上下文窗口中，请通知用户并讨论选项（分块、摘要等），而不是静默截断。
- **Prefill 已移除（Fable 5、Opus 5、Sonnet 5 和 4.6/4.7/4.8 系列）：** 在 Fable 5、Opus 5、Sonnet 5、Opus 4.6、Opus 4.7、Opus 4.8 和 Sonnet 4.6 上，助手消息预填充（上一轮助手消息预填充）会返回 400 错误。请改用结构化输出（`output_config.format`）或系统提示词指令来控制响应格式。（有一个例外：回退额度预填充声明，在使用 `fallback_has_prefill_claim: true` 兑换额度时，服务器接受回显的助手消息；请参阅迁移指南的拒绝部分。）
- **编辑前确认迁移范围：** 当用户要求将代码迁移到较新的 Claude 模型、但未指定具体文件、目录或文件列表时，**先询问要应用到哪个范围**：整个工作目录、特定子目录，还是特定文件集。在用户确认之前，不要开始编辑。“迁移我的代码库”、“将我的项目迁移到 X”、“升级到 Sonnet 4.6”或仅写“迁移到 Opus 4.8”等祈使表达**仍然具有歧义**：它们说明了要做什么，但没有说明在哪里做，因此需要询问。只有当提示词指定了确切文件、具体目录或明确文件列表时，才无需询问直接继续（“迁移 `app.py`”、“迁移 `services/` 下的所有内容”、“更新 `a.py` 和 `b.py`”）。参阅 `shared/model-migration.md` 的步骤 0。
- **`max_tokens` 默认值：** 不要将 `max_tokens` 设得过低，达到上限会导致输出在思路未完成时截断，并需要重试。对于非流式请求，默认使用 `~16000`（可使响应保持在 SDK HTTP 超时限制内）。对于流式请求，默认使用 `~64000`（无需担心超时，因此给模型足够空间）。只有在存在明确原因时才使用更低的值：分类（`~256`）、成本上限、刻意保持简短的输出，或使用 **`max_tokens: 0`** 进行缓存预热（参阅 `shared/prompt-caching.md` → 预热）。
- **在 Claude Opus 5 上禁用思考有两种失败模式，应优先使用低/中等 effort。** 仅影响显式选择退出的代码；思考默认开启，因此要留意从 Opus 4.8 延续下来的禁用思考设置。使用 `thinking: {type: "disabled"}` 时，模型偶尔会将工具调用写入其**可见文本**，而不是 `tool_use` 块：该轮会成功，调用永远不会运行，不会引发错误，并且在智能体循环中，该文本会污染后续轮次。它还可能将 `<thinking>` 标签泄漏到响应中。开启思考并降低 `effort` 可以同时解决这两个问题，且仍能降低成本。如果某个路由必须保持关闭思考：**删除**所有“不要思考/不要推理”规则（这会加重标签泄漏），不要提及思考标签，并添加组合指令 *“When you use a tool, you may say a brief sentence first. If no tool can express what the user asked for, say so instead of guessing. Do not include internal or system XML tags in your response.”*。详情请参阅 `shared/model-migration.md` → 禁用思考时的两种失败模式。
- **128K 输出 token：** Fable 5、Opus 5、Opus 4.6、Opus 4.7、Opus 4.8、Sonnet 5 和 Sonnet 4.6 支持最高 128K `max_tokens`，但 SDK 对如此大的值要求使用流式传输以避免 HTTP 超时。使用 `.stream()` 和 `.get_final_message()` / `.finalMessage()`。
- **工具调用 JSON 解析（Fable 5、Opus 5 和 4.6/4.7/4.8 系列）：** Fable 5、Opus 5、Opus 4.6、Opus 4.7、Opus 4.8 和 Sonnet 4.6 可能会在工具调用 `input` 字段中生成不同的 JSON 字符串转义形式（例如 Unicode 或正斜杠转义）。始终使用 `json.loads()` / `JSON.parse()` 解析工具输入，绝不要对序列化后的输入进行原始字符串匹配。
- **结构化输出（所有模型）：** 在 `messages.create()` 上使用 `output_config: {format: {...}}`，而不是已弃用的 `output_format` 参数。这是通用 API 变更，并非 4.6 特有。
- **不要重新实现 SDK 功能：** SDK 提供高级辅助工具，应使用它们，而不是从头构建。具体而言：使用 `stream.finalMessage()`，而不是将 `.on()` 事件包装在 `new Promise()` 中；使用带类型的异常类（`Anthropic.RateLimitError` 等），而不是对错误消息进行字符串匹配；使用 SDK 类型（`Anthropic.MessageParam`、`Anthropic.Tool`、`Anthropic.Message` 等），而不是重新定义等价接口。
- **错误处理：捕获一条链，而非一个宽泛类。** 单个 `except APIStatusError` / `catch (AnthropicServiceException)` / `rescue APIError` 会失去可重试（429、≥500、网络）和不可重试（400/404）故障之间的区别。编写按具体程度从高到低排列的链，例如 `NotFoundError` → `RateLimitError` → `APIStatusError` → `APIConnectionError`（或 Go 等价写法：使用 `errors.As` 转换为 `*anthropic.Error`，然后 `switch apierr.StatusCode { case 404: …; case 429: …; default: … }`）。各语言的类名和命名空间位于 `shared/error-codes.md`。
- **不要研究 SDK 类型，先写代码。** 如果本 Skill 所含文档未展示某个类型名，请根据特定语言文档中的命名空间/包表编写代码文件，并让编译器错误指出正确名称。在写代码前，不要花费轮次使用 WebFetch、克隆 SDK 仓库，或编译并运行单独的反射程序来发现类型名，应先产出源文件，然后修复编译器报告的问题。针对已安装 SDK 快速执行 `strings` / `jar tf` / `javap` 来定位名称是可接受的（它会在数秒内返回），但不要再进一步。类型名错误的文件是可恢复的；花费一个会话进行探索却没有写出任何文件，则不是。
- **Bash 和文本编辑器工具由 Anthropic 定义，且没有 schema。** 声明 `{"type": "bash_20250124", "name": "bash"}` / `{"type": "text_editor_20250728", "name": "str_replace_based_edit_tool"}`，无需 `input_schema`。使用自有 schema 命名为 `"bash"` 的自定义工具是不同的工具。处理器路径和安全检查位于 `shared/tool-use-concepts.md` § 客户端工具。
- **Advisor 工具模型配对。** Advisor 工具的 `model` 必须至少与请求的顶级 `model` 具有同等能力，例如执行器 `claude-sonnet-5` → Advisor `claude-opus-4-8` 或 `claude-opus-4-7`。无效配对会返回 400。配对表位于 `shared/tool-use-concepts.md` § Advisor。可用性参阅 `shared/platform-availability.md`。
- **Agent Skills ≠ Managed Agents。** 若要让 Claude 通过 Agent Skills 生成 `.pptx`/`.xlsx`/等文件，请使用 `client.beta.messages.create`，并传入 `container={"skills": [...]}`、`code_execution_20260521` 工具，以及 `code-execution-2025-08-25` 和 `skills-2025-10-02` 两个 beta。此处不要使用 `client.beta.agents` / `sessions` / `environments`，它们属于 Managed Agents 接口，而非 Agent Skills。
- **MCP 连接器需要两部分。** 仅使用 `mcp_servers=[{type:"url", url, name}]` 会被作为验证错误拒绝，还应添加带有 beta `mcp-client-2025-11-20` 的 `tools=[{type:"mcp_toolset", mcp_server_name:<same name>}]`。可用性参阅 `shared/platform-availability.md`。
- **`inference_geo` 是直接的顶级请求参数**，即 `client.messages.create(..., inference_geo="us")` / `.inferenceGeo("us")`。不要将其放入 `extra_body` / `putAdditionalBodyProperty`。（仅适用于 Messages API，在 Managed Agents 中，`inference_geo` 会嵌套于智能体的 `model` 对象内，绝不位于顶级；参阅 `shared/managed-agents-core.md` § 固定推理地理位置。）在 Opus 4.6 / Sonnet 4.6 及更高版本中受支持；可用性参阅 `shared/platform-availability.md`。`response.usage.inference_geo` 会报告推理的运行位置。
- **细粒度工具流式传输不是 beta 功能。** 在工具定义上设置 `eager_input_streaming: true`，并调用常规 `client.messages.stream(...)`。不存在 beta 标头，也不存在 `client.beta.*` 路径。
- **缓存诊断是 beta 功能。** 使用带 beta `cache-diagnosis-2026-04-07` 的 `client.beta.messages.*`。在第一轮传入 `diagnostics: {previous_message_id: null}`，在后续轮次传入 `diagnostics: {previous_message_id: <previous response id>}`；结果位于 `response.diagnostics`。可用性参阅 `shared/platform-availability.md`。
- **Memory 工具类型为 `memory_20250818`。** 声明 `{"type": "memory_20250818", "name": "memory"}`。Go 在 `client.Beta.Messages.New` 上使用 beta 命名空间类型 `{OfMemoryTool20250818: &anthropic.BetaMemoryTool20250818Param{}}`；Python/TypeScript/Ruby/PHP/C# 使用非 beta 的 `client.messages.create`；Java 同时具有非 beta 的 `MemoryTool20250818` 和 beta 工具运行器路径。Python/TypeScript 提供 `BetaAbstractMemoryTool` / `betaMemoryTool` 辅助工具来实现后端。
- **使用功能实际支持的模型。** 某些功能仅限于特定模型层级：快速模式仅适用于 Claude Opus 5 / Opus 4.8（且仅限 Claude API），任务预算（仅限 Messages API，Managed Agents 会话预算没有模型层级限制）仅适用于 Claude Opus 5 / Fable 5 / Sonnet 5 / Opus 4.8 / 4.7，Advisor 工具则要求有效的执行器↔Advisor 配对。如果用户提示词指定的模型不支持该功能，请改用受支持的模型，并在输出中说明替换情况。
- **不要为 SDK 数据结构定义自定义类型：** SDK 为所有 API 对象导出了类型。消息使用 `Anthropic.MessageParam`，工具定义使用 `Anthropic.Tool`，工具结果使用 `Anthropic.ToolUseBlock` / `Anthropic.ToolResultBlockParam`，响应使用 `Anthropic.Message`。定义自己的 `interface ChatMessage { role: string; content: unknown }` 会重复 SDK 已提供的内容，并失去类型安全性。
- **报告和文档输出：** 对于生成报告、文档或可视化的任务，代码执行沙箱预装了 `python-docx`、`python-pptx`、`matplotlib`、`pillow` 和 `pypdf`。Claude 可以生成格式化文件（DOCX、PDF、图表）并通过 Files API 返回它们，对于“报告”或“文档”类请求，应考虑这一方式，而不是纯 stdout 文本。
- **服务器工具错误不会抛出异常。** Web 搜索和 Web 抓取错误会返回 HTTP 200，并带有 `web_search_tool_result` / `web_fetch_tool_result` 块，其 `content` 是单个错误对象（例如 `{error_code: "max_uses_exceeded"}`），而不是抛出的异常。对于 Web 搜索，成功的 `content` 是一个*列表*；错误的 `content` 是一个*对象*，在索引之前应根据此项进行分支处理。
- **代码执行输出块类型：** `code_execution_20260521` 返回 `bash_code_execution_tool_result`（带有 `.content.stdout`），**而不是**旧版的裸 `code_execution_tool_result`。遍历 `response.content` 并匹配正确类型。
- **工具搜索：绝不要延迟所有工具。** 搜索工具本身不得设置 `defer_loading: true`，并且 `tools` 中至少有一个工具必须为非延迟，否则 API 会返回 400 `All tools have defer_loading set`。