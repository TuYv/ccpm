---
name: composio
description: Route and complete Composio work across Composio For You and Composio Platform. Use when the user mentions Composio; wants an agent to use apps such as Gmail, Slack, GitHub, Notion, Calendar, or Linear; needs first-time setup, an SDK or MCP integration, CLI operation, migration guidance, current documentation, or help diagnosing a connection or tool call.
---
# Composio

将此技能用作路由器。识别产品和任务，仅加载相关指南，针对易变的细节查阅权威文档，然后回答用户的问题或完成用户请求的工作。

## 1. 选择产品

不要混用这些产品。它们使用不同的凭据和设置路径。

| | Composio For You | Composio Platform |
|---|---|---|
| 适用场景 | 用户希望自己的智能体使用自己的应用 | 开发者正在构建一款让其用户连接账户的产品 |
| 主要使用方式 | MCP 或 Composio CLI | 应用程序内的 SDK 会话 |
| 凭据 | 客户端需要请求头时使用 `ck_...` 消费者密钥 | `COMPOSIO_API_KEY` 项目密钥 |
| 控制面板 | `dashboard.composio.dev` → For You | `dashboard.composio.dev` → Platform |

仅当上下文无法确定产品时，询问一个简短的问题：

> 这是供您自己的智能体和账户使用，还是用于一款让您的用户连接其账户的产品？

如果提到的是某个个人 AI 客户端，且没有产品代码，则视为 For You。如果涉及应用程序代码库、SDK、用户或租户身份、后端或产品智能体，则视为 Platform。

## 2. 选择任务

在采取行动之前，先确定请求的预期结果：

- **解释或查找：**回答问题、比较方案或查找当前 API。
- **设置：**首次配置凭据、MCP 客户端、CLI 或 SDK。
- **构建或更改：**将 Composio 集成到现有智能体或应用程序中。
- **操作：**为实际任务查找、连接并运行工具。
- **调试或迁移：**诊断故障、更新旧版集成，或从旧版直接执行或 Tool Router 迁移。

不要将解释、文档查找或范围明确的小型错误修复变成新手引导流程。

## 3. 仅加载相关指南

- For You：阅读 [Composio For You](references/for-you.md)。
- Platform：阅读 [Composio Platform](references/platform.md)。
- 提供商、连接或执行故障：还需阅读[错误和提供商注意事项](references/errors.md)。

## 完成选定的任务

- 对于问题，必要时获取最新文档并给出具体答案。不要修改项目或强制调用工具。
- 对于设置或集成，检查现有环境，保留其架构和身份模型，进行最小且有用的更改；如果凭据和用户授权可用，则通过一次安全的真实工具调用进行验证。
- 对于操作请求，仅连接任务所需的应用并执行请求的工作流。
- 对于调试，获取 Composio 日志或请求 ID，确定发生故障的边界，修复该边界，并在用户已授权执行时重试。

## 稳定规则

1. 在选择凭据、URL、SDK 或命令之前，先确定产品。
2. 将控制面板的新手引导视为一种上下文，而不是技能本身的身份。当开发者携带从 Getting Started 获得的现有 `COMPOSIO_API_KEY` 前来时，直接使用该密钥，绝不要在聊天中创建、轮换、替换、打印或索要该密钥。不要在此路径中运行 `composio dev init`。
3. 对于没有控制面板凭据交接的常规首次 Platform 设置，请遵循 Platform 指南中的当前设置路径。
4. 绝不要编造工具包或工具 slug。应在运行时或通过 CLI 查找它们。
5. 不要构建提供商 OAuth 流程。需要身份验证时，Composio 会返回 Connect Link。
6. 新的 Platform 集成应使用会话。保留应用程序现有的用户身份和智能体架构。
7. 不要将凭据放入源代码管理、URL、日志、聊天内容或命令输出中。
8. 在诊断失败的工具调用之前，先获取日志或请求 ID。
9. 优先选择能够完成当前任务的最小配置。除非请求或现有代码需要，否则不要在初始路径中加入工具包筛选器、标签策略、沙箱控制、自定义身份验证、提供商专用加固及其他高级选项。
10. 不要编造代码仓库的情况。在文件、框架、环境加载器、身份字段、智能体路径或依赖项得到提供或检查之前，绝不要声称它们存在。如果无法获得代码库上下文，请说明未知情况，并请求访问权限或一项必要信息。

## 规范信息

对于稳定的决策，请使用随附的参考资料。对于可能已发生变化的版本、提供商适配器、客户端特定设置、工具包行为或 API，请在回答或编辑代码前获取当前的 Markdown 源文件：

当来源存在冲突时，应优先采用当前 API 参考文档和实时端点行为，而不是任何标记为 Legacy 的页面，并明确说明 REST API 版本。

```text
https://docs.composio.dev/llms.txt
https://docs.composio.dev/docs/<page>.md
https://docs.composio.dev/toolkits/<toolkit>.md
```

使用文档完成任务。除非用户明确要求链接，否则不要只是向用户提供链接。