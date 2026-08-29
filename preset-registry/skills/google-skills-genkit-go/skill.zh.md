---
name: developing-genkit-go
description: Develop AI-powered applications using Genkit in Go. Use when the user asks to build AI features, agents, flows, or tools in Go using Genkit, or when working with Genkit Go code involving generation, prompts, streaming, tool calling, or model providers.
metadata:
  category: AiAndMachineLearning
---
# Genkit Go

Genkit Go 是一个面向 Go 的 AI SDK，通过统一的接口支持跨模型提供商的生成、结构化输出、流式传输、工具调用、提示词和流程。

## Hello World

```go
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/genkit-ai/genkit/go/ai"
	"github.com/genkit-ai/genkit/go/genkit"
	"github.com/genkit-ai/genkit/go/plugins/googlegenai"
	"github.com/genkit-ai/genkit/go/plugins/server"
)

func main() {
	ctx := context.Background()
	g := genkit.Init(ctx, genkit.WithPlugins(&googlegenai.GoogleAI{}))

	genkit.DefineFlow(g, "jokeFlow", func(ctx context.Context, topic string) (string, error) {
		return genkit.GenerateText(ctx, g,
			ai.WithModelName("googleai/gemini-flash-latest"),
			ai.WithPrompt("Tell me a joke about %s", topic),
		)
	})

	mux := http.NewServeMux()
	for _, f := range genkit.ListFlows(g) {
		mux.HandleFunc("POST /"+f.Name, genkit.Handler(f))
	}
	log.Fatal(server.Start(ctx, "127.0.0.1:8080", mux))
}
```

## 核心功能

根据你的需求加载相应的参考文档：

| 功能 | 参考文档 | 加载时机 |
| --- | --- | --- |
| 初始化 | [references/getting-started.md](references/getting-started.md) | 设置 `genkit.Init`、插件和 `*Genkit` 实例模式 |
| 生成 | [references/generation.md](references/generation.md) | `Generate`、`GenerateText`、`GenerateData`、流式传输、输出格式 |
| 提示词 | [references/prompts.md](references/prompts.md) | `DefinePrompt`、`DefineDataPrompt`、`.prompt` 文件、模式 |
| 工具 | [references/tools.md](references/tools.md) | `DefineTool`、工具中断、`RestartWith`/`RespondWith` |
| 中间件 | [references/middleware.md](references/middleware.md) | `ai.Middleware`、`ai.WithUse`、`Hooks`（Generate/Model/Tool）、内置功能（`Retry`、`Fallback`、`ToolApproval`、`Filesystem`、`Skills`） |
| 流程与 HTTP | [references/flows-and-http.md](references/flows-and-http.md) | `DefineFlow`、`DefineStreamingFlow`、`genkit.Handler`、HTTP 服务 |
| 模型提供商 | [references/providers.md](references/providers.md) | Google AI、Vertex AI、Anthropic、兼容 OpenAI 的服务、Ollama 设置 |

## Agents（实验性）

Genkit Go 提供了一个用于持久化、多轮对话的**实验性** agent API（会话、快照、中断、分支、后台执行）。
它受门控限制：使用 `genkit.Init(ctx, genkit.WithExperimental())` 进行初始化，否则构造函数会触发 panic。服务器构造函数来自 `genkit/exp`（别名为
`genkitx`）；类型和选项来自 `ai/exp`（别名为 `aix`）；会话存储来自
`ai/exp/localstore`。

- **Agent 还是流程？** 如果任务是对话式、多轮的，或被描述为“agent”“assistant”或“chatbot”，请使用 `genkitx.DefineAgent` 构建，而不是在流程中手动编写 `Generate` + 工具循环。只有对于单次、无状态的生成，才应使用普通流程。

详情请参阅：

-   [Agents](references/agents.md)：定义和提供 agent、运行轮次，以及客户端管理状态与服务器管理状态（从这里开始）。
-   [Sessions & persistence](references/agents-sessions.md)：会话存储（`localstore.NewInMemorySessionStore`/`NewFileSessionStore`）和快照。
-   [Human-in-the-loop / interrupts](references/agents-human-in-the-loop.md)：暂停以等待批准或输入，以及恢复执行。
-   [Branching](references/agents-branching.md)：从快照分叉出一个对话。
-   [Background agents](references/agents-background.md)：分离长时间运行的轮次并进行轮询。
-   [Working with state](references/agents-state.md)：类型化的自定义会话状态，以 JSON 补丁的形式流式传输。
-   [Artifacts](references/agents-artifacts.md)：生成和读取具名交付物。
-   [Multi-agent orchestration](references/agents-multi-agent.md)：委托给子 agent。
-   [Advanced custom agents](references/agents-custom.md)：使用 `DefineCustomAgent` 完全控制轮次。
-   [Deploying agents](references/agents-deployment.md)：使用 `genkit.Handler` 通过 HTTP 提供 agent。

## Genkit CLI（推荐）

`genkit start` 会以非侵入方式包装任何使用 Genkit 库的 Go 程序，在保持程序原样运行的同时，捕获每个 Genkit 操作的追踪信息，因此你可以证明工具确实被调用，并从终端检查模型的 I/O，即使是无头检查也可以。它会转发 stdio，因此依赖 stdin/stdout 的交互式 CLI 工具也能正常工作。直接运行应用（`go run .`）会跳过追踪捕获，让你只能在盲调试。使用 `genkit --version` 检查安装情况。

**安装：**
```bash
curl -sL cli.genkit.dev | bash
```

**主要模式（默认）：** 在常规运行命令前加上 `genkit start --`。这会收集程序运行的任何 Genkit 代码产生的遥测数据，无论这些代码是由开发 UI、你自己的 Web 服务器/Web UI，还是普通脚本触发的。它会启动 Developer UI（通常为 http://localhost:4000），用于运行 flow、模型和 agent playground，以及浏览追踪信息：
```bash
genkit start -- go run .
genkit start --noui -- go run .   # same, without the Dev UI (still a persistent server)
genkit start -o -- go run .       # also opens the browser
```
`genkit start` 会持续运行，直到你使用 Ctrl+C 将其停止。对于常见场景，这是预期且正确的行为：例如供 Web/移动应用调用的服务器，或由你自行退出的交互式 CLI。`--noui` 只会移除开发 UI；它**不是**一次性命令，也不会自行退出。在自动化/非交互式上下文中，**不要**将 `genkit start` 用作阻塞步骤；请改用下面的 `flow:run`。

**非交互式使用（agents/CI）：** 在 `--` 前添加全局 `--non-interactive` 标志，使 CLI 使用默认设置，并且永远不会在提示处阻塞（例如首次运行时的分析通知）：`genkit start --non-interactive -- go run .`（`flow:run` 同样适用）。

**运行 flow（`flow:run`）：** 从 CLI 按名称调用指定的 flow。在 `--` 后附加运行命令，仅为本次运行启动运行时（该命令会原样运行，以注册你的 flow）：
```bash
genkit flow:run myFlow '{"data": "input"}' -- go run .
genkit flow:run myFlow '{"data": "input"}' --stream -- go run .   # with streaming
genkit flow:run myFlow '{"data": "input"}' --wait -- go run .     # wait for completion
```
这是**自动终止的**：它会运行一次 flow，打印一个 `Trace ID`，然后退出，因此它适合快速的非交互式检查（不同于 `genkit start`）。本次运行的追踪信息可以使用下面的追踪命令进行检查。

**使用追踪信息进行调试：** 这是查看提示词、模型输入/输出、工具调用、延迟和错误的最快方式。在 `genkit start` 下完成任何运行后，可以从终端进行检查：
```bash
genkit trace:list                        # find recent trace IDs
genkit trace:get <traceId>               # full trace details (inputs, outputs, tool calls, errors)
genkit trace:get <traceId> --format json # machine-readable JSON, safe to pipe into jq or other parsers
```

对于机器可读的输出，传递 `--format json` 以获取干净的 JSON，你可以将其通过管道传给 `jq` 或其他解析器。**默认**输出面向人类阅读（包含 banner/日志行，大型追踪信息可能会被截断），因此不要直接将这种形式通过管道传递；请使用 `--format json`、grep 或开发 UI 的追踪查看器。

**文档：**
```bash
genkit docs:search "streaming" go
genkit docs:list go
genkit docs:read go/flows.md
```

完整的 CLI 和 Developer UI 详细信息请参阅 [references/getting-started.md](references/getting-started.md)。

## 关键指导


- **显式传递 `g`。** `genkit.Init` 返回的 `*Genkit` 实例是核心注册表。将其传递给所有 Genkit 函数，而不是将其存储为全局变量。这是整个 SDK 中的核心模式。
- **将 AI 逻辑封装在 flows 中。** Flows 为你提供追踪、可观测性、通过 `genkit.Handler` 进行 HTTP 部署，以及从 Developer UI 和 CLI 进行测试的能力。任何值得保留的生成调用都应放在 flow 中。
- **通过追踪进行验证，而不是盲目运行。** 直接运行应用（`go run .`）不会捕获开发追踪信息。请参阅 [Genkit CLI（推荐）](#genkit-cli-recommended) 部分，了解如何运行应用并捕获追踪信息。
- **在输出类型上使用 `jsonschema:"description=..."` 结构体标签。** 模型会使用这些描述来理解每个字段应包含的内容。没有这些描述，结构化输出的质量会显著下降。
- **编写良好的工具描述。** 模型会根据工具的描述字符串决定调用哪些工具。含糊的描述会导致工具调用遗漏或错误。
- **对复杂提示使用 `.prompt` 文件。** 这样可以将提示内容与 Go 代码分离，支持 Handlebars 模板化，并且无需重新编译即可进行迭代。对于简单的单行场景，代码定义的提示更合适。
- **在编写中间件之前，优先考虑使用内置中间件。** `Retry`、`Fallback`、`ToolApproval`、`Filesystem` 和 `Skills` 覆盖了常见的横切需求，并可通过 `ai.WithUse` 相互组合。请参阅 [references/middleware.md](references/middleware.md)。如果确实需要编写自定义中间件，请在由 `New` 捕获的闭包中为每次调用分配状态，并保护任何由 `WrapTool` 修改的内容，因为工具可能会并发运行。
- **查找最新的模型 ID。** 模型名称经常变化。请查阅提供商文档以获取当前的模型 ID，而不要依赖硬编码的名称。请参阅 [references/providers.md](references/providers.md)。