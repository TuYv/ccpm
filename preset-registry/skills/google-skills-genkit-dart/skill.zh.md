---
name: developing-genkit-dart
description: Generates code and provides documentation for the Genkit Dart SDK. Use when the user asks to build AI agents in Dart, use Genkit flows, or integrate LLMs into Dart/Flutter applications.
metadata:
  category: AiAndMachineLearning
---
# Genkit Dart

Genkit Dart 是一个面向 Dart 的 AI SDK，为代码生成、结构化输出、工具、流程和 AI agent 提供统一接口。

## 核心功能和用法
如果你需要有关初始化 Genkit（`Genkit()`）、生成（`ai.generate`）、工具（`ai.defineTool`）、流程（`ai.defineFlow`）、嵌入（`ai.embedMany`）、流式传输或调用远程流程端点的帮助，请加载核心框架参考文档：  
[references/genkit.md](references/genkit.md)

## 提示词（Dotprompt）

`.prompt` 文件通过 YAML frontmatter 和 Handlebars 模板，将提示词内容从 Dart 代码中分离出来。请参阅 [references/dotprompt.md](references/dotprompt.md)：其中介绍了
`promptDir`、`ai.prompt()`（调用/流式传输/渲染）、变体、partials、通过 `defineSchema` 定义的命名 schema，以及 `tools`/`maxTurns`/`returnToolRequests`/`use`
（中间件）frontmatter 字段。`.prompt` 文件还可以通过 `definePromptAgent` 直接为 agent 提供支持。

## Agents

Genkit Dart 提供用于持久化、多轮对话的 **agent** API（会话、快照、中断、分支、后台执行、自定义状态、artifacts 和多 agent 委托）。服务器 API 来自
`package:genkit/genkit.dart`，浏览器/HTTP 客户端来自
`package:genkit/client.dart`。`remoteAgent` 客户端可从任何 Dart 应用中使用，包括 **Flutter**；后端也可完全互换——它可以通过相同的 HTTP 协议与使用 Dart、JS/TypeScript 或 Go 实现的 Genkit agent 通信。Dart 有一些特定事项：中断被建模为调用
`ctx.interrupt(...)` 的工具（不存在 `defineInterrupt`），子 agent 委托使用来自 `package:genkit_middleware` 的 `agents()` 中间件，目前还没有 `artifacts()` 中间件（请直接定义 artifact 工具）。

更多详情请参阅：

-   [Agents](references/agents.md)：定义/提供 agent，以及由客户端管理的状态（从这里开始）。
-   [Sessions & persistence](references/agents-sessions.md)：会话存储（`InMemorySessionStore`/`FileSessionStore`/`FirestoreSessionStore`）。
-   [Human-in-the-loop / interrupts](references/agents-human-in-the-loop.md)：通过 `ctx.interrupt` 暂停以等待批准/输入，以及恢复执行。
-   [Branching](references/agents-branching.md)：从快照分叉出一个对话。
-   [Background agents](references/agents-background.md)：分离长时间运行的轮次并进行轮询。
-   [Working with state](references/agents-state.md)：类型化的自定义会话状态，自动同步到客户端。
-   [Artifacts](references/agents-artifacts.md)：生成和读取命名交付物。
-   [Multi-agent orchestration](references/agents-multi-agent.md)：使用 `agents()` 中间件委托给子 agent。
-   [Advanced custom agents](references/agents-custom.md)：使用 `defineCustomAgent` 完全控制轮次。
-   [Deploying agents](references/agents-deployment.md)：使用 `genkit_shelf` 通过 HTTP 提供 agent（多个 agent、CORS）。

## Genkit CLI（推荐）

`genkit start` 会以非侵入方式包装任何使用 Genkit 库的 Dart 程序，在保持程序不变的情况下运行它，同时捕获每个 Genkit 操作的跟踪信息，这样你就能证明工具确实被调用，并从终端检查模型的输入/输出，即使是在无头检查中也是如此。它会转发 stdio，因此依赖 stdin/stdout 的交互式 CLI 工具也能正常工作。直接运行应用（`dart run`）会跳过跟踪捕获，因此你调试时将无法获取这些信息。使用 `genkit --version` 检查安装情况。

**安装：**
```bash
curl -sL cli.genkit.dev | bash # Native CLI
# OR
npm install -g genkit-cli # Via npm
# OR run commands directly with npx without a global install (prefix every genkit command):
# npx genkit-cli start -- dart run main.dart
```

**主要模式（默认）：**在常规运行命令前加上 `genkit start --`。这会收集程序运行的任何 Genkit 代码产生的遥测数据，无论这些代码是由开发者 UI、你自己的 Web 服务器/Web UI，还是普通脚本触发的。启动开发者 UI（通常位于 http://localhost:4000），用于运行流程、模型和代理 playground，以及浏览追踪记录：

```bash
genkit start -- dart run main.dart
genkit start --noui -- dart run main.dart   # same, without the Dev UI (still a persistent server)
```
`genkit start` 会持续运行，直到你使用 Ctrl+C 停止它。在常见场景下，这是预期且正确的行为：例如由 Web/移动应用调用的服务器，或需要由你自行退出的交互式 CLI。`--noui` 只会移除开发者 UI；它**不是**一次性命令，不会自行退出。在自动化/非交互式环境中，**不要**将 `genkit start` 用作阻塞步骤；对于此类场景，请使用下面的 `flow:run`。

**非交互式使用（代理/CI）：**在 `--` 前添加全局 `--non-interactive` 标志，使 CLI 使用默认值，并且永远不会因提示而阻塞（例如首次运行时的分析数据提示）：`genkit start --non-interactive -- dart run main.dart`（`flow:run` 同样适用）。

**运行流程（`flow:run`）：**从 CLI 中按名称调用特定流程。在 `--` 后追加运行命令，以便仅针对本次运行启动运行时（该命令会按原样运行，以注册你的流程）：
```bash
genkit flow:run myFlow '{"data": "input"}' -- dart run main.dart
```
这是一个**自动终止**的命令：它运行流程一次，打印一个 `Trace ID`，然后退出，因此适合进行快速的非交互式检查（不同于 `genkit start`）。注意：`flow:run` 运行的是**流程**（`ai.defineFlow`），而不是代理；你不能直接对代理（`ai.defineAgent`）使用 `flow:run`。若要从 CLI 运行代理，请将代理的一轮交互封装到一个临时流程中，然后运行该流程（请参见 [Agents](references/agents.md)）。可以使用下面的追踪命令检查本次运行的追踪记录。

**使用追踪记录进行调试：**这是查看提示、模型输入/输出、工具调用、延迟和错误的最快方式。在 `genkit start` 下完成任意运行后，可以从终端进行检查：
```bash
genkit trace:list                        # find recent trace IDs
genkit trace:get <traceId>               # full trace details (inputs, outputs, tool calls, errors)
genkit trace:get <traceId> --format json # machine-readable JSON, safe to pipe into jq or other parsers
```

若要获取机器可读的输出，请传递 `--format json`，以获得可以通过管道传给 `jq` 或其他解析器的整洁 JSON。**默认**输出面向人类阅读（包含 banner/日志行，大型追踪记录可能会被截断），因此不要直接对这种格式使用管道；请使用 `--format json`、grep 或开发者 UI 的追踪查看器。


**文档：**
```bash
genkit docs:search "streaming" dart
genkit docs:list dart
genkit docs:read dart/flows.md
```

## 插件生态系统
Genkit 依赖一套庞大的插件，用于执行生成式 AI 操作、与外部 LLM 交互，或托管 Web 服务器。

当被要求使用任何给定插件时，务必参考下方对应的参考文档来验证其用法：当你需要了解该插件的具体初始化参数、工具、模型和使用模式时，应加载相应的参考文档：

| 插件名称 | 参考链接 | 描述 |
| ---- | ---- | ---- |
| `genkit_google_genai` | [references/genkit_google_genai.md](references/genkit_google_genai.md) | 加载以了解 Google Gemini 插件接口的使用方法。 |
| `genkit_anthropic` | [references/genkit_anthropic.md](references/genkit_anthropic.md) | 加载以了解用于 Claude 模型的 Anthropic 插件接口。 |
| `genkit_openai` | [references/genkit_openai.md](references/genkit_openai.md) | 加载以了解用于 GPT 模型、Groq 和自定义兼容端点的 OpenAI 插件接口。 |
| `genkit_middleware` | [references/genkit_middleware.md](references/genkit_middleware.md) | 加载以了解针对特定代理行为的工具：`filesystem`、`skills` 和 `toolApproval` 中断。 |
| `genkit_mcp` | [references/genkit_mcp.md](references/genkit_mcp.md) | 加载以了解 Model Context Protocol 集成（服务器、主机和客户端功能）。 |
| `genkit_chrome` | [references/genkit_chrome.md](references/genkit_chrome.md) | 加载以了解如何使用 Prompt API 在 Chrome 浏览器内本地运行 Gemini Nano。 |
| `genkit_shelf` | [references/genkit_shelf.md](references/genkit_shelf.md) | 加载以了解如何使用 Dart Shelf 通过 HTTP 集成 Genkit Flow 操作。 |
| `genkit_firebase_ai` | [references/genkit_firebase_ai.md](references/genkit_firebase_ai.md) | 加载以了解 Firebase AI 插件接口（通过 Vertex AI 使用 Gemini API）。 |

## 外部依赖
每当你在 Tools、Flows 和 Prompts 中定义映射关系的 schemas 时，都必须使用 [schemantic](https://pub.dev/packages/schemantic) 库。  
要了解如何使用 schemantic，请务必阅读 [references/schemantic.md](references/schemantic.md)，了解如何实现类型安全的生成式 Dart 代码。当你遇到 `@Schema()`、`SchemanticType` 或带有 `$` 前缀的类等符号时，这一点尤其重要。Genkit Dart 对其所有数据模型都使用 schemantic，因此理解这一点对于使用 Genkit Dart 是一项**关键技能**。

## 最佳实践
- **Agent 还是 flow？** 如果任务具有对话性、多轮交互，或被描述为“agent”、“assistant”或“chatbot”，应使用 `ai.defineAgent`（参见 [Agents](references/agents.md)）来构建，而不是在 flow 中手动编写 `generate` + 工具循环。只有在进行一次性、无状态生成时，才应使用普通 flow。
- 在生成最终响应之前，务必使用 `dart analyze` 检查代码是否能够干净地编译。
- 始终使用 Genkit CLI 进行本地开发和调试。
- 使用 traces 进行验证，而不是盲目运行。直接运行应用（`dart run`）不会捕获开发追踪信息。请参阅 [Genkit CLI](#genkit-cli-recommended) 部分，了解如何运行应用并捕获追踪信息。