---
name: developing-genkit-python
description: Develop AI-powered applications using Genkit in Python. Use when the user asks about Genkit, AI agents, flows, or tools in Python, or when encountering Genkit errors, import issues, or API problems.
metadata:
  category: AiAndMachineLearning
---
# Genkit Python

使用一个 SDK 在 Python 中构建 AI 功能，包括生成、流式输出、工具、流程和多轮智能体。

## 前置条件

- Python **3.10+** 和 **`uv`**（[安装](https://docs.astral.sh/uv/getting-started/installation/)）
- Genkit CLI：如果缺少 `genkit --version`，请运行 `npm install -g genkit-cli`

新应用？[设置](references/setup.md)。模式？[示例](references/examples.md)。

## Hello World

```python
from genkit import Genkit
from genkit_google_genai import GoogleAI

ai = Genkit(
    plugins=[GoogleAI()],
    model='googleai/gemini-flash-latest',
)

async def main():
    response = await ai.generate(prompt='Tell me a joke about Python.')
    print(response.text)

if __name__ == '__main__':
    ai.run_main(main())
```

## 智能体（Beta）

支持历史记录、类型化状态、人工审批、分支和后台工作的多轮聊天。从这里开始：[智能体](references/agents.md)。

```python
chat = agent.chat()
res = await chat.send('Hello')           # AgentResponse
turn = chat.send_stream('Hello')         # AgentTurn — .stream / .response
```

更多：[sessions](references/agents-sessions.md) ·
[HITL](references/agents-human-in-the-loop.md) ·
[branching](references/agents-branching.md) ·
[background](references/agents-background.md) ·
[state](references/agents-state.md) ·
[artifacts](references/agents-artifacts.md) ·
[custom](references/agents-custom.md) ·
[HTTP](references/agents-http.md)

## 导入

- Google AI：`from genkit_google_genai import GoogleAI`
- 智能体：`from genkit.agent import InMemorySessionStore, ...`
- 中间件：`from genkit_middleware import Middleware, ToolApproval, ...`
- FastAPI：`from genkit_fastapi import serve_agent, serve_flow`
- 评估：`from genkit_evaluators import register_genkit_evaluators`

## 工作流

1. **智能体还是流程？** 如果任务是对话式、多轮，或被描述为“智能体”、“助手”或“聊天机器人”，请使用 `ai.define_agent` 构建它（见[智能体](references/agents.md)），而不是在流程中手写 `generate` + tools 循环。仅对一次性、无状态的生成使用普通流程。
2. 设置 **`GEMINI_API_KEY`**。使用带前缀的模型 ID（`googleai/gemini-flash-latest`）。
3. Genkit 应用通过 **`ai.run_main(main())`** 进入（尤其是在 `genkit start` 下）。见[常见错误](references/common-errors.md)。
4. 使用 [Dev Workflow](references/dev-workflow.md) 运行（`genkit start` + Dev UI）。
5. 使用 trace 验证，而不是盲目运行。直接运行应用（`uv run`）**不会**捕获开发 trace。请参阅 [Genkit CLI](#genkit-cli-recommended)，了解如何运行应用并捕获 trace。
6. 卡住了？先看[常见错误](references/common-errors.md)。

## Genkit CLI（推荐）

`genkit start` 会以非侵入方式包装任何使用 Genkit 库的 Python 程序，在不修改程序的情况下运行它，同时从每个 Genkit action 捕获 trace，这样你就能证明工具确实被调用，并从终端检查模型 I/O，即使是无头检查也可以。它会转发 stdio，因此依赖 stdin/stdout 的交互式 CLI 工具可以正常工作。直接运行应用（`uv run`）会跳过 trace 捕获，因此你是在盲调。

**主要模式（默认）：**在常规运行命令前加上 `genkit start --`。这会收集程序运行的任何 Genkit 代码产生的遥测数据，无论这些代码是由开发 UI、你自己的 Web 服务器/Web UI，还是普通脚本触发的：
```bash
genkit start -- uv run src/main.py
genkit start --noui -- uv run src/main.py   # same, without the Dev UI (still a persistent server)
```
`genkit start` 会持续运行，直到你使用 Ctrl+C 停止它。这对于常见场景是预期且正确的行为：例如供 Web/移动应用调用的服务器，或由你自行退出的交互式 CLI。`--noui` 只会移除开发 UI；它**不是**一次性命令，不会自行退出。在自动化/非交互式环境中，**不要**将 `genkit start` 用作阻塞步骤；应使用下面的 `flow:run`。

**非交互式使用（代理/CI）：**在 `--` 之前添加全局 `--non-interactive` 标志，使 CLI 使用默认值，并且永远不会在提示处阻塞（例如首次运行时的分析数据提示）：`genkit start --non-interactive -- uv run src/main.py`（`flow:run` 同样适用）。

**运行 flow（`flow:run`）：**从 CLI 按名称调用特定 flow。在 `--` 后追加运行命令，仅为本次运行启动运行时（该命令会按原样运行，以注册你的 flow）：
```bash
genkit flow:run myFlow '{"data": "input"}' -- uv run src/main.py
```
这是**自终止的**：它运行一次 flow，打印一个 `Trace ID`，然后退出，因此适合进行快速的非交互式检查（不同于 `genkit start`）。注意：`flow:run` 运行的是 **flow**（`@ai.flow()`），而不是代理；你不能直接对代理（`ai.define_agent`）使用 `flow:run`。要从 CLI 调用代理，请将一轮调用包装在一个临时 flow 中并运行它（参见[代理](references/agents.md)）。

**使用 trace 进行调试：**这是查看提示词、模型输入/输出、工具调用、延迟和错误的最快方式。在 `genkit start` 下进行任何运行后，都可以从终端进行检查：
```bash
genkit trace:list                        # find recent trace IDs
genkit trace:get <traceId>               # full trace details (inputs, outputs, tool calls, errors)
genkit trace:get <traceId> --format json # machine-readable JSON, safe to pipe into jq or other parsers
```

对于机器可读的输出，请传递 `--format json`，以获取可以通过管道传给 `jq` 或其他解析器的干净 JSON。**默认**输出面向人类阅读（包含横幅/日志行，大型 trace 可能会被截断），因此不要直接将这种格式通过管道传递；请使用 `--format json`、grep 或开发 UI 的 trace 查看器。


完整的检查清单和开发 UI 演示请参见[开发工作流](references/dev-workflow.md)。

## 参考

- [示例](references/examples.md)：结构化输出、流式传输、flow、工具、嵌入。
- [设置](references/setup.md)：新项目引导和插件。
- [常见错误](references/common-errors.md)：出现问题时首先阅读。
- [FastAPI](references/fastapi.md)：HTTP、`genkit_fastapi_handler`、并行 flow。
- [Dotprompt](references/dotprompt.md)：`.prompt` 文件和辅助工具。
- [评估](references/evals.md)：评估器和数据集。
- [开发工作流](references/dev-workflow.md)：`genkit start`、开发 UI、检查清单。
- [代理（Beta）](references/agents.md)：多轮 API。