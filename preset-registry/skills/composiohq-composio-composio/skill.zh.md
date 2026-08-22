---
name: composio
description: Route and complete Composio work across Composio For You and Composio Platform. Use when the user mentions Composio; wants an agent to use apps such as Gmail, Slack, GitHub, Notion, Calendar, or Linear; needs first-time setup, an SDK or MCP integration, CLI operation, migration guidance, current documentation, or help diagnosing a connection or tool call.
---
# Composio

将此 Skill 用作路由器。识别产品和任务，仅加载相关指南；对于可能变化的细节，请查阅权威文档，然后回答用户的问题或完成用户请求的工作。

## 1. 选择产品

不要混用这些产品。它们使用不同的凭据和设置路径。

| | Composio For You | Composio Platform |
|---|---|---|
| 适用场景 | 用户希望自己的智能体使用自己的应用 | 开发者正在构建一款由其用户连接账户的产品 |
| 主要使用界面 | MCP 或 Composio CLI | 应用程序内的 SDK 会话 |
| 凭据 | 客户端需要请求头时使用 `ck_...` 消费者密钥 | `COMPOSIO_API_KEY` 项目密钥 |
| 控制面板 | `dashboard.composio.dev` → For You | `dashboard.composio.dev` → Platform |

仅当上下文无法确定产品时，询问一个简短问题：

> 这是供你自己的智能体和账户使用，还是用于一款由你的用户连接其账户的产品？

如果提到了某个个人 AI 客户端，但没有产品代码，则视为 For You。如果涉及应用程序代码库、SDK、用户或租户身份、后端或产品智能体，则视为 Platform。

## 2. 选择任务

在采取行动之前，先确定请求的目标：

- **解释或查找：**回答问题、比较方法或查找当前 API。
- **设置：**首次配置凭据、MCP 客户端、CLI 或 SDK。
- **构建或更改：**将 Composio 集成到现有智能体或应用程序中。
- **操作：**为实际任务查找、连接并运行工具。
- **调试或迁移：**诊断故障、更新旧版集成，或从旧版直接执行方式或 Tool Router 迁移。

不要将解释、文档查询或范围明确的小型错误修复变成新手引导。

## 3. 仅加载相关指南

- For You：阅读 [Composio For You](references/for-you.md)。
- Platform：阅读 [Composio Platform](references/platform.md)。
- 提供商、连接或执行失败：另请阅读[错误与提供商注意事项](references/errors.md)。

## 完成所选任务

- 对于问题，在需要时获取最新文档并给出具体答案。不要修改项目，也不要强制调用工具。
- 对于设置或集成，检查现有环境，保留其架构和身份模型，进行最小且有用的更改；当凭据和用户授权可用时，通过一次安全的真实工具调用进行验证。
- 对于操作请求，仅连接任务所需的应用，并执行所请求的工作流。
- 对于调试，获取 Composio 日志或请求 ID，确定发生故障的边界，修复该边界，并在用户已授权执行时重试。

## 稳定规则

1. 在选择凭据、URL、SDK 或命令之前，先确定产品。
2. 将控制面板引导流程视为一种上下文，而不是此 Skill 的身份。当开发者已通过 Getting Started 获得现有的 `COMPOSIO_API_KEY` 时，使用该密钥，绝不要在聊天中创建、轮换、替换、打印或索取它。在此路径中不要运行 `composio dev init`。
3. 对于没有从控制面板移交凭据的常规首次 Platform 设置，请遵循 Platform 指南中的当前设置路径。
4. 切勿虚构工具包或工具 slug。应在运行时或通过 CLI 发现它们。
5. 不要构建提供商 OAuth 流程。需要身份验证时，Composio 会返回 Connect Link。
6. 新的 Platform 集成应使用会话。保留应用程序现有的用户身份和智能体架构。
7. 不要将凭据放入源代码控制、URL、日志、聊天或命令输出中。
8. 在诊断工具调用失败之前，先获取日志或请求 ID。
9. 优先使用能够完成当前任务的最小配置。除非请求或现有代码需要，否则不要在初始路径中加入工具包筛选器、标签策略、沙箱控制、自定义身份验证、提供商特定的安全加固及其他高级选项。
10. 不要虚构代码仓库事实。在文件、框架、环境加载器、身份字段、智能体路径或依赖项被提供或检查之前，绝不要声称其存在。如果无法获得代码库上下文，请说明未知之处，并请求访问权限或询问一个必要的细节。
11. 在 SDK 或 API 示例中，使用当前公开页面或 schema 中的确切标识符和调用形式。应复制所请求语言的文档化形式，而不是在 TypeScript 和 Python 之间转换名称；如果某个必要细节没有文档说明，请解释其行为，不要虚构代码。

## 权威信息

对于稳定的决策，请使用随附的参考资料。面向用户的来源列表仅包含实际查阅过的公开 `https://docs.composio.dev/...` 页面；不包含随附参考资料的名称、本地路径和 `file://` URL。对于可能已发生变化的版本、提供商适配器、客户端特定设置、工具包行为或 API，在回答或编辑代码之前，请优先使用当前的权威文档以及当前的 CLI 或工具模式：

当来源之间存在分歧时，应优先采用当前 API 参考文档和实时端点行为，而不是任何标记为 Legacy 的页面，并明确指出 REST API 版本。

```text
https://docs.composio.dev/llms.txt
https://docs.composio.dev/docs/<page>.md
https://docs.composio.dev/toolkits/<toolkit>.md
```

如果这些主要来源无法解答有关 Composio 产品或故障排除的问题，请查询位于 `https://docs.composio.dev/api/knowledge-search?q=<question>` 的公开统一知识搜索。

搜索结果可能是权威文档、知识库、工具包、示例或参考页面。请使用返回的证据回答问题；公开记录无法证明用户账户、项目、连接或工具调用的实时状态。

当知识搜索提供证据时，请引用结果中返回的 `canonicalUrl`，而不是搜索 API URL。如果 `canonicalUrl` 是相对地址，请先加上 `https://docs.composio.dev` 前缀再引用。

仅当结果的摘录或页面直接解答了问题时，才将其视为证据。如果没有公开来源直接记录某个确切的错误或症状，请如实说明，而不要根据相近的结果作出诊断；应请求提供日志、请求 ID 或所需的实时证据。

请使用文档完成任务。除非用户明确要求提供链接，否则不要只是把链接交给用户。