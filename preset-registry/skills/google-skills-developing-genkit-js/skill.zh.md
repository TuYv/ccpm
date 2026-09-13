---
name: developing-genkit-js
description: Develop AI-powered applications using Genkit in Node.js/TypeScript. Use when the user asks about Genkit, AI agents, flows, or tools in JavaScript/TypeScript, or when encountering Genkit errors, validation issues, type errors, or API problems.
metadata:
  category: AiAndMachineLearning
---
# Genkit JS

## 前置条件

确保 `genkit` CLI 可用。
-   运行 `genkit --version` 进行验证。所需的最低 CLI 版本：**1.29.0**
-   如果找不到该命令，或者存在较旧版本（1.x < 1.29.0），请安装或升级：`npm install -g genkit-cli@^1.29.0`。

**新项目**：如果你要在新的代码库中设置 Genkit，请遵循[设置指南](references/setup.md)。

## Hello World

```ts
import { z, genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize Genkit with the Google AI plugin
const ai = genkit({
  plugins: [googleAI()],
});

export const myFlow = ai.defineFlow({
  name: 'myFlow',
  inputSchema: z.string().default('AI'),
  outputSchema: z.string(),
}, async (subject) => {
  const response = await ai.generate({
    model: googleAI.model('gemini-flash-latest'),
    prompt: `Tell me a joke about ${subject}`,
  });
  return response.text;
});
```

## 提示（Dotprompt）

`.prompt` 文件通过 YAML frontmatter 和 Handlebars 模板将提示内容从代码中分离出来。请参阅 [Dotprompt](references/dotprompt.md)：`promptDir`、`ai.prompt()`（调用/流式传输/渲染）、变体、部分模板、通过 `ai.defineSchema` 定义的命名 schema，以及 `tools`/`maxTurns`/`returnToolRequests`/`use`（中间件）frontmatter 字段。

## Agent（Beta）

Genkit 提供了用于持久化、多轮对话的预览版 **agent** API（会话、快照、中断、分支、后台执行）。这是一个 **beta** API：服务器 API 来自 `genkit/beta`，浏览器客户端来自 `genkit/beta/client`，而不是稳定版的 `genkit` 入口点。**需要 `genkit` >= 1.39.0。**

有关更多详细信息，请参阅：

-   [Agent](references/agents.md)：定义和提供 agent，以及由客户端管理状态（从这里开始）。
-   [会话与持久化](references/agents-sessions.md)：会话存储（`InMemory`/`File`/`Firestore`）。
-   [人在环路 / 中断](references/agents-human-in-the-loop.md)：暂停以等待批准或输入，并恢复执行。
-   [分支](references/agents-branching.md)：从快照派生对话分支。
-   [后台 agent](references/agents-background.md)：分离长时间运行的轮次并进行轮询。
-   [使用状态](references/agents-state.md)：类型化的自定义会话状态，自动同步到客户端。
-   [Artifacts](references/agents-artifacts.md)：生成和读取命名交付物。
-   [多 agent 编排](references/agents-multi-agent.md)：将任务委派给子 agent。
-   [高级自定义 agent](references/agents-custom.md)：使用 `defineCustomAgent` 完全控制轮次。
-   [部署 agent](references/agents-deployment.md)：通过 HTTP 提供 agent（多个 agent、CORS、Web UI、其他框架）。

## 生成式 UI（A2UI）

Genkit 提供了一个 **A2UI**（Agent-to-UI）插件（`@genkit-ai/a2ui`），使 agent 能够流式传输交互式 UI **surface**（卡片、列表、表单、按钮），而不仅仅是文本。整个服务器端集成就是 agent（或 `ai.generate`）的 `use` 数组中的 `a2ui()` 模型中间件；浏览器则通过 `@a2ui/*` renderer 以及 `@genkit-ai/a2ui/client` 中的辅助工具来渲染 surface。它构建于 beta agent 客户端（`genkit/beta` + `genkit/beta/client`）之上。

-   [A2UI](references/a2ui.md)：服务器中间件、选项、客户端渲染、用户操作/表单、自定义目录以及安全/信任边界。

## 中间件

中间件包装生成过程（重试、回退、额外工具、请求/响应转换），并通过 `ai.generate`、提示词和代理上的 `use: [...]` 数组附加。

-   [使用中间件](references/middleware.md)：`use` 数组和 `@genkit-ai/middleware` 包（`retry`、`fallback`、`artifacts`、`agents`、`filesystem`、`skills`、`toolApproval`），以及内置核心中间件。
-   [构建自定义中间件](references/middleware-custom.md)：使用 `generateMiddleware` 编写自定义中间件，并通过 `.plugin()` 注册。

## 重要：不要信任内部知识

Genkit 最近经历了一次重大的破坏性 API 变更。你的知识已经过时。你必须查阅文档。推荐使用：

```sh
genkit docs:read js/get-started.md
genkit docs:read js/flows.md
```

请参阅[常见错误](references/common-errors.md)，其中列出了已弃用的 API（例如 `configureGenkit`、`response.text()`、`defineFlow` import）及其 v1.x 替代项。

**始终使用 Genkit CLI 或提供的参考资料验证信息。**

## 错误排查协议

**当你遇到任何与 Genkit 相关的错误时（ValidationError、API 错误、类型错误、404 等）：**

1. **强制第一步**：阅读[常见错误](references/common-errors.md)
2. 确认错误是否符合已知模式
3. 应用文档中记录的解决方案
4. 仅当 common-errors.md 中未找到相关内容时，再查阅其他来源（例如 `genkit docs:search`）

**不要：**
- 根据假设或内部知识尝试修复
- 因为“认为自己知道修复方法”而跳过阅读 common-errors.md
- 依赖 pre-1.0 Genkit 的模式

**此协议对错误处理不可协商。**

## 开发工作流

1.  **代理还是 flow？**：如果任务是对话式、多轮交互，或被描述为“代理”“助手”或“聊天机器人”，应使用 `ai.defineAgent` 构建（参见[代理](references/agents.md)），而不是在 flow 中手动实现 `generate` + 工具循环。只有单次、无状态的生成才应使用普通 flow。
2.  **选择 Provider**：Genkit 与 Provider 无关（Google AI、OpenAI、Anthropic、Ollama 等）。
    -   如果用户未指定 Provider，默认使用 **Google AI**。
    -   如果用户询问其他 Provider，请使用 `genkit docs:search "plugins"` 查找相关文档。
3.  **检测框架**：检查 `package.json` 以识别运行时（Next.js、Firebase、Express）。
    -   查找 `@genkit-ai/next`、`@genkit-ai/firebase` 或 `@genkit-ai/google-cloud`。
    -   根据具体框架的模式调整实现。
4.  **遵循最佳实践**：
    -   请参阅[最佳实践](references/best-practices.md)，了解项目结构、模式定义和工具设计方面的指导。
    -   **保持精简**：仅指定与默认值不同的选项。不确定时，检查文档/源代码。
5.  **确保正确性**：
    -   完成更改后运行类型检查（例如 `npx tsc --noEmit`）。
    -   如果类型检查失败，请先查阅[常见错误](references/common-errors.md)，再搜索源代码。
    -   使用 trace 进行验证，而不是盲目运行。直接运行应用（`node`/`tsx`/`npm start`）不会捕获开发 trace。有关如何运行应用并捕获 trace，请参阅[CLI 用法（推荐）](#cli-usage-recommended)。
6.  **处理错误**：
    -   遇到任何错误时：**第一步都必须阅读[常见错误](references/common-errors.md)**
    -   将错误与文档中记录的模式进行匹配
    -   在尝试其他方案之前，先应用文档中记录的修复方法。

## 查找文档

使用 Genkit CLI 查找权威文档：

1.  **搜索主题**：`genkit docs:search <query>`
    -   示例：`genkit docs:search "streaming"`
2.  **列出所有文档**：`genkit docs:list`
3.  **阅读指南**：`genkit docs:read <path>`
    -   示例：`genkit docs:read js/flows.md`

## CLI 用法（推荐）

`genkit start` 会以非侵入方式包装任何使用 Genkit 库的 Node.js 程序，原样运行该程序，同时捕获每个 Genkit 操作的追踪信息，因此你可以从终端**证明工具确实被调用过，并检查模型的输入输出**，即使是在无头检查中也是如此。它会转发标准输入输出，因此依赖 stdin/stdout 的交互式 CLI 工具也能正常工作。直接运行应用（`node`/`tsx`/`npm start`）会跳过追踪捕获，导致你无法获得调试追踪信息。

**主要模式（默认）：** 在常规运行命令前加上 `genkit start --`。这会收集你的应用运行的任何 Genkit 代码的遥测数据，无论这些代码是由开发 UI、你自己的 Web 服务器/Web UI，还是普通脚本触发的：
```bash
genkit start -- npx tsx --watch src/index.ts
genkit start --noui -- npx tsx src/index.ts   # 相同效果，但不启动 Dev UI（仍然是持久运行的服务器）
```
`genkit start` 会一直运行，直到你使用 Ctrl+C 停止它。对于常见场景，这是预期且正确的行为：例如由 Web 或移动应用调用的服务器，或由你自行退出的交互式 CLI。`--noui` 只会移除 Dev UI；它**不是**一次性命令，不会自行退出。在自动化/非交互环境中，不要将 `genkit start` 用作阻塞步骤。

**非交互式用法（代理/CI）：** 在 `--` 前添加全局 `--non-interactive` 标志，使 CLI 使用默认值，并且永远不会在提示处阻塞（例如首次运行时的分析数据提示）：`genkit start --non-interactive -- npx tsx src/index.ts`（`flow:run` 同样适用）。

**运行 flow（`flow:run`）：** 从 CLI 按名称调用特定 flow。在 `--` 后追加运行命令，仅为此次运行启动运行时（该命令会按原样运行，以注册你的 flow）：
```bash
genkit flow:run myFlow '{"data": "input"}' -- npx tsx src/index.ts
```
这是**会自行终止的**命令：它运行一次 flow，打印一个 `Trace ID`，然后退出（使用 `genkit trace:get <id>` 检查该 ID）。因此，对于必须自行退出的快速非交互式检查，这是正确的选择；不要使用会阻塞的 `genkit start`，也不要直接运行应用（后者会跳过追踪）。始终显式传入输入 JSON：省略时，`flow:run` 会发送 `undefined`，不会回退到 schema 的 `.default()`。注意：`flow:run` 运行的是 **flow**（`ai.defineFlow`），而不是代理；你不能直接对代理使用 `flow:run`（代理使用 `ai.defineAgent`）。要从 CLI 运行代理，请将一次交互包装在一个临时 flow 中，然后运行该 flow（参见 [Agents](references/agents.md)）。

**使用追踪进行调试：** 这是查看提示词、模型输入/输出、工具调用、延迟和错误的最快方式。在 `genkit start` 下运行后，可以从终端检查追踪信息：
```bash
genkit trace:list                        # 查找最近的追踪 ID
genkit trace:get <traceId>               # 完整的追踪详情（输入、输出、工具调用、错误）
genkit trace:get <traceId> --format json # 机器可读的 JSON，可安全地通过管道传递给 jq 或其他解析器
```

对于机器可读的输出，请传递 `--format json`，以获取可通过 `jq` 或其他解析器管道处理的干净 JSON。**默认**输出面向人类阅读（包含横幅/日志行，大型跟踪记录可能会被截断），因此不要直接将该形式通过管道传递；请使用 `--format json`、grep 或 Dev UI 跟踪查看器。


另请参阅 [CLI Reference](references/docs-and-cli.md) 获取更多命令，并运行 `genkit --help` 查看完整列表。


## 参考资料

-   [Best Practices](references/best-practices.md)：关于模式定义、流程设计和结构的推荐模式。
-   [Dotprompt](references/dotprompt.md)：`.prompt` 文件，包括 `promptDir`、`ai.prompt()`、变体、局部模板、命名模式，以及 `tools`/`maxTurns`/`returnToolRequests`/`use` frontmatter。
-   [Docs & CLI Reference](references/docs-and-cli.md)：文档搜索、CLI 任务和工作流。
-   [Common Errors](references/common-errors.md)：关键“陷阱”、迁移指南和故障排除。
-   [Setup Guide](references/setup.md)：新项目的手动设置说明。
-   [Examples](references/examples.md)：最小可复现示例（基本生成、多模态、思考模式）。
-   [Agents (Beta)](references/agents.md)：Agent 基础、服务和客户端管理的状态。更深入的主题：[sessions](references/agents-sessions.md)、[human-in-the-loop](references/agents-human-in-the-loop.md)、[branching](references/agents-branching.md)、[background agents](references/agents-background.md)、[state](references/agents-state.md)、[artifacts](references/agents-artifacts.md)、[multi-agent](references/agents-multi-agent.md)、[custom agents](references/agents-custom.md)、[deployment](references/agents-deployment.md)。
-   [Middleware](references/middleware.md)：使用中间件和 `@genkit-ai/middleware` 软件包。另请参阅[构建自定义中间件](references/middleware-custom.md)。
-   [A2UI (Generative UI)](references/a2ui.md)：`@genkit-ai/a2ui` 插件（`a2ui()` 中间件）、选项、客户端渲染、用户操作/表单、自定义目录和安全性。