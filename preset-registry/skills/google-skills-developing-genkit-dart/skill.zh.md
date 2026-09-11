---
name: developing-genkit-dart
description: Generates code and provides documentation for the Genkit Dart SDK. Use when the user asks to build AI agents in Dart, use Genkit flows, or integrate LLMs into Dart/Flutter applications.
metadata:
  category: AiAndMachineLearning
---
# Genkit Dart

Genkit Dart 是一个面向 Dart 的 AI SDK，为代码生成、结构化输出、工具、流程和 AI agent 提供统一接口。

## 核心功能和用法
如果需要有关初始化 Genkit（`Genkit()`）、生成（`ai.generate`）、工具（`ai.defineTool`）、流程（`ai.defineFlow`）、嵌入（`ai.embedMany`）、流式传输或调用远程流程端点的帮助，请加载核心框架参考文档：  
[references/genkit.md](references/genkit.md)

## 提示词（Dotprompt）

`.prompt` 文件通过 YAML frontmatter 和 Handlebars 模板，将提示词内容从 Dart 代码中分离出来。请参阅 [references/dotprompt.md](references/dotprompt.md)：
`promptDir`、`ai.prompt()`（调用/流式传输/渲染）、变体、局部模板、通过 `defineSchema` 定义的命名 schema，以及 `tools`/`maxTurns`/`returnToolRequests`/`use`（中间件）frontmatter 字段。`.prompt` 文件还可以通过 `definePromptAgent` 直接作为 agent 的后端。

## Agent

Genkit Dart 提供了用于持久化多轮对话的 **agent** API（会话、快照、中断、分支、后台执行、自定义状态、工件和多 agent 委托）。服务器端 API 来自
`package:genkit/genkit.dart`，浏览器/HTTP 客户端来自
`package:genkit/client.dart`。`remoteAgent` 客户端可以在任何 Dart 应用中工作，包括 **Flutter**，后端也可以完全互换：它可以通过相同的 HTTP 协议与使用 Dart、JS/TypeScript 或 Go 实现的 Genkit agent 通信。Dart 有几个特性需要注意：中断被建模为返回 `.interrupt(...)` 的工具（不存在 `defineInterrupt`），子 agent 委托使用 `package:genkit_middleware` 中的 `agents()` 中间件，目前还没有 `artifacts()` 中间件（请直接定义工件工具）。

有关更多详情，请参阅：

-   [Agent](references/agents.md)：定义/提供 agent，以及由客户端管理的状态（从这里开始）。
-   [会话和持久化](references/agents-sessions.md)：会话存储（`InMemorySessionStore`/`FileSessionStore`/`FirestoreSessionStore`）。
-   [人在回路中 / 中断](references/agents-human-in-the-loop.md)：通过 `.interrupt(...)` 暂停以等待批准/输入，以及恢复执行。
-   [分支](references/agents-branching.md)：从快照分叉对话。
-   [后台 agent](references/agents-background.md)：分离长时间运行的轮次并进行轮询。
-   [使用状态](references/agents-state.md)：类型化的自定义会话状态，自动同步到客户端。
-   [工件](references/agents-artifacts.md)：生成和读取命名交付物。
-   [多 agent 编排](references/agents-multi-agent.md)：使用 `agents()` 中间件委托给子 agent。
-   [高级自定义 agent](references/agents-custom.md)：使用 `defineCustomAgent` 完全控制轮次。
-   [部署 agent](references/agents-deployment.md)：使用 `genkit_shelf` 通过 HTTP 提供 agent（多个 agent、CORS）。

## 生成式 UI（A2UI）

Genkit Dart 提供了一个 **A2UI**（Agent-to-UI）插件（`genkit_a2ui`），
允许 agent 流式传输交互式 UI **surface**（卡片、列表、表单、按钮），
而不仅仅是文本。完整的服务器端集成是在 agent 的（或 `ai.generate` 的）
`use` 列表中使用 `a2ui()` 模型中间件；Flutter 客户端则使用
[`genui`](https://pub.dev/packages/genui) 包以及 `package:genkit_a2ui/client.dart` 中的辅助工具来渲染 surface。Dart 特有的一点是：必须在 `Genkit(plugins: [...])` 中注册 `A2uiPlugin()`（与 JS 不同，JS 会从注册表中按名称解析中间件）。

-   [A2UI](references/a2ui.md)：服务器中间件、选项、Flutter/genui 客户端渲染、用户操作/表单、自定义目录，以及安全/信任边界。

## Genkit CLI（推荐）

`genkit start` 会以非侵入方式包装任何使用 Genkit 库的 Dart 程序，在保持程序原样运行的同时，捕获每个 Genkit 操作的跟踪信息，因此你可以确认工具确实被调用，并从终端检查模型的输入输出，即使是无界面检查也可以。它会转发标准输入输出，因此依赖 stdin/stdout 的交互式 CLI 工具可以正常工作。直接运行应用（`dart run`）会跳过跟踪捕获，让你的调试处于盲区。使用 `genkit --version` 检查安装情况。

**安装：**
```bash
curl -sL cli.genkit.dev | bash # Native CLI
# OR
npm install -g genkit-cli # Via npm
# OR run commands directly with npx without a global install (prefix every genkit command):
# npx genkit-cli start -- dart run main.dart
```

**主要模式（默认）：**在常规运行命令前加上 `genkit start --`。这会收集程序运行的所有 Genkit 代码的遥测数据，无论这些代码是由开发者界面、你自己的 Web 服务器/Web 界面，还是普通脚本触发的。它会启动开发者界面（通常为 http://localhost:4000），用于运行 flow、模型和 agent playground，以及浏览跟踪信息：

```bash
genkit start -- dart run main.dart
genkit start --noui -- dart run main.dart   # same, without the Dev UI (still a persistent server)
```
`genkit start` 会持续运行，直到你使用 Ctrl+C 停止它。对于常见场景，这是预期且正确的行为：例如你的 Web/移动应用会调用的服务器，或需要你自行退出的交互式 CLI。`--noui` 只会移除开发者界面；它**不是**一次性命令，不会自行退出。不要在自动化/非交互环境中将 `genkit start` 用作阻塞步骤；此时应使用下面的 `flow:run`。

**非交互式使用（agents/CI）：**在 `--` 前添加全局 `--non-interactive` 标志，使 CLI 使用默认设置，并且永远不会在提示处阻塞（例如首次运行时的分析数据提示）：`genkit start --non-interactive -- dart run main.dart`（`flow:run` 同样适用）。

**运行 flow（`flow:run`）：**从 CLI 按名称调用特定 flow。在 `--` 后附加运行命令，仅针对本次运行启动运行时（该命令会按原样运行，以注册你的 flow）：
```bash
genkit flow:run myFlow '{"data": "input"}' -- dart run main.dart
```
这是**自动终止的**：它会运行一次 flow，打印一个 `Trace ID`，然后退出，因此适合快速的非交互式检查（不同于 `genkit start`）。注意：`flow:run` 运行的是 flow（`ai.defineFlow`），而不是 agent；你不能直接对 agent（`ai.defineAgent`）使用 `flow:run`。要从 CLI 运行 agent，可以将一轮交互包装在一个临时 flow 中，然后运行该 flow（参见 [Agents](references/agents.md)）。本次运行的跟踪信息可以使用下面的跟踪命令进行检查。

**使用跟踪信息进行调试：**这是查看提示词、模型输入/输出、工具调用、延迟和错误的最快方式。在 `genkit start` 下完成任何运行后，可以从终端检查跟踪信息：
```bash
genkit trace:list                        # find recent trace IDs
genkit trace:get <traceId>               # full trace details (inputs, outputs, tool calls, errors)
genkit trace:get <traceId> --format json # machine-readable JSON, safe to pipe into jq or other parsers
```

对于机器可读输出，传入 `--format json` 以获得干净的 JSON，便于通过管道传给 `jq` 或其他解析器。**默认**输出面向人类阅读（包含横幅/日志行，大型 trace 可能会被截断），因此不要直接将这种形式通过管道传递；请使用 `--format json`、grep，或 Dev UI trace 查看器。


**文档：**
```bash
genkit docs:search "streaming" dart
genkit docs:list dart
genkit docs:read dart/flows.md
```

## 插件生态系统
Genkit 依赖大量插件来执行生成式 AI 操作、与外部 LLM 对接，或托管 Web 服务器。

当被要求使用任何给定插件时，始终通过参考下面对应的引用来验证用法。当你需要了解该插件的具体初始化参数、工具、模型和使用模式时，应加载该引用：

| 插件名称 | 引用链接 | 描述 |
| ---- | ---- | ---- |
| `genkit_google_genai` | [references/genkit_google_genai.md](references/genkit_google_genai.md) | 加载以了解 Google Gemini 插件接口用法。 |
| `genkit_anthropic` | [references/genkit_anthropic.md](references/genkit_anthropic.md) | 加载以了解 Claude 模型的 Anthropic 插件接口。 |
| `genkit_openai` | [references/genkit_openai.md](references/genkit_openai.md) | 加载以了解 GPT 模型、Groq 和自定义兼容端点的 OpenAI 插件接口。 |
| `genkit_middleware` | [references/genkit_middleware.md](references/genkit_middleware.md) | 加载以了解特定 agentic 行为的工具：`filesystem`、`skills` 和 `toolApproval` interrupts。 |
| `genkit_mcp` | [references/genkit_mcp.md](references/genkit_mcp.md) | 加载以了解 Model Context Protocol 集成（Server、Host 和 Client 能力）。 |
| `genkit_chrome` | [references/genkit_chrome.md](references/genkit_chrome.md) | 加载以了解使用 Prompt API 在 Chrome 浏览器内本地运行 Gemini Nano。 |
| `genkit_shelf` | [references/genkit_shelf.md](references/genkit_shelf.md) | 加载以了解使用 Dart Shelf 通过 HTTP 集成 Genkit Flow actions。 |
| `genkit_firebase_ai` | [references/genkit_firebase_ai.md](references/genkit_firebase_ai.md) | 加载以了解 Firebase AI 插件接口（通过 Vertex AI 使用 Gemini API）。 |
| `genkit_a2ui` | [references/a2ui.md](references/a2ui.md) | 加载以了解 A2UI（Agent-to-UI）：通过 `a2ui()` middleware 流式传输生成式 UI surfaces，并在客户端使用 `genui` 渲染。 |

## 外部依赖
每当你在 Tools、Flows 和 Prompts 中定义 schemas mapping 时，都必须使用 [schemantic](https://pub.dev/packages/schemantic) 库。
要学习如何使用 schemantic，请务必阅读 [references/schemantic.md](references/schemantic.md)，了解如何实现类型安全的生成式 Dart 代码。当你遇到 `@Schema()`、`SchemanticType` 或带有 `$` 前缀的类等符号时，这一点尤其相关。Genkit Dart 对其所有数据模型都使用 schemantic，因此理解它是使用 Genkit Dart 的一项关键技能。

## 最佳实践
- **Agent 还是 flow？** 如果任务是对话式、多轮的，或被描述为“agent”、“assistant”或“chatbot”，请使用 `ai.defineAgent`（参见 [Agents](references/agents.md)）来构建，而不是在 flow 中手写 `generate` + tools 循环。仅在单次、无状态生成时才使用普通 flow。
- 在生成最终响应之前，始终使用 `dart analyze` 检查代码是否能干净编译。
- 始终使用 Genkit CLI 进行本地开发和调试。
- 使用 traces 进行验证，而不是盲目运行。直接运行应用（`dart run`）不会捕获 dev traces。请参见 [Genkit CLI](#genkit-cli-recommended) 部分，了解如何运行应用并捕获 traces。