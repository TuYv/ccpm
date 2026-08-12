---
name: documentation-lookup
description: Use up-to-date library and framework docs via Context7 MCP instead of training data. Activates for setup questions, API references, code examples, or when the user names a framework (e.g. React, Next.js, Prisma).
origin: ECC
---
# 文档查询（Context7）

当用户询问库、框架或 API 时，请通过 Context7 MCP（工具 `resolve-library-id` 和 `query-docs`）获取最新文档，而不要依赖训练数据。

## 核心概念

- **Context7**：提供实时文档的 MCP 服务器；对于库和 API，应使用它而不是训练数据。
- **resolve-library-id**：根据库名称和查询返回与 Context7 兼容的库 ID（例如 `/vercel/next.js`）。
- **query-docs**：获取指定库 ID 和问题的文档及代码片段。始终先调用 resolve-library-id，以获取有效的库 ID。

## 何时使用

在用户有以下需求时启用：

- 询问安装或配置问题（例如“如何配置 Next.js 中间件？”）
- 请求依赖某个库的代码（“编写一个 Prisma 查询来……”）
- 需要 API 或参考信息（“Supabase 有哪些身份验证方法？”）
- 提及特定框架或库（React、Vue、Svelte、Express、Tailwind、Prisma、Supabase 等）

只要请求依赖库、框架或 API 准确且最新的行为，就应使用此技能。它适用于已配置 Context7 MCP 的各种工具环境（例如 Claude Code、Cursor、Codex）。

## 工作原理

### 第 1 步：解析库 ID

调用 **resolve-library-id** MCP 工具，并传入：

- **libraryName**：取自用户问题的库或产品名称（例如 `Next.js`、`Prisma`、`Supabase`）。
- **query**：用户的完整问题。这可以提高结果的相关性排名。

在查询文档之前，必须获得与 Context7 兼容的库 ID（格式为 `/org/project` 或 `/org/project/version`）。在此步骤尚未获得有效库 ID 时，不要调用 query-docs。

### 第 2 步：选择最佳匹配项

从解析结果中，依据以下条件选择一个结果：

- **名称匹配度**：优先选择与用户所询问内容完全匹配或最接近的结果。
- **基准分数**：分数越高，表示文档质量越好（最高为 100）。
- **来源信誉**：如有可选项，优先选择信誉为 High 或 Medium 的来源。
- **版本**：如果用户指定了版本（例如“React 19”“Next.js 15”），应优先选择列出的特定版本库 ID（例如 `/org/project/v1.2.0`）。

### 第 3 步：获取文档

调用 **query-docs** MCP 工具，并传入：

- **libraryId**：在第 2 步中选定的 Context7 库 ID（例如 `/vercel/next.js`）。
- **query**：用户的具体问题或任务。问题越具体，获取的片段越相关。

限制：每个问题调用 query-docs（或 resolve-library-id）的次数不得超过 3 次。如果调用 3 次后答案仍不明确，请说明不确定之处，并使用你掌握的最佳信息，而不要猜测。

### 第 4 步：使用文档

- 使用获取到的最新信息回答用户的问题。
- 在有帮助时，包含文档中的相关代码示例。
- 在库或版本相关信息很重要时予以注明（例如“在 Next.js 15 中……”）。

## 示例

### 示例：Next.js 中间件

1. 调用 **resolve-library-id**，传入 `libraryName: "Next.js"`、`query: "How do I set up Next.js middleware?"`。
2. 根据名称和基准分数，从结果中选择最佳匹配项（例如 `/vercel/next.js`）。
3. 调用 **query-docs**，传入 `libraryId: "/vercel/next.js"`、`query: "How do I set up Next.js middleware?"`。
4. 使用返回的片段和文本进行回答；如果相关，请包含文档中的最简 `middleware.ts` 示例。

### 示例：Prisma 查询

1. 使用 `libraryName: "Prisma"`、`query: "How do I query with relations?"` 调用 **resolve-library-id**。
2. 选择 Prisma 官方库 ID（例如 `/prisma/prisma`）。
3. 使用该 `libraryId` 和查询调用 **query-docs**。
4. 返回 Prisma Client 的使用模式（例如 `include` 或 `select`），并附上文档中的简短代码片段。

### 示例：Supabase 身份验证方法

1. 使用 `libraryName: "Supabase"`、`query: "What are the auth methods?"` 调用 **resolve-library-id**。
2. 选择 Supabase 文档库 ID。
3. 调用 **query-docs**；总结身份验证方法，并展示所获取文档中的最简示例。

## 最佳实践

- **具体明确**：尽可能使用用户的完整问题作为查询，以提高相关性。
- **注意版本**：当用户提到版本时，若解析步骤提供了特定版本的库 ID，请使用该 ID。
- **优先选择官方来源**：存在多个匹配项时，优先选择官方或主要软件包，而不是社区分支。
- **不得包含敏感数据**：从发送到 Context7 的任何查询中移除 API 密钥、密码、令牌及其他机密信息。将用户的问题视为可能包含机密信息，然后再将其传递给 resolve-library-id 或 query-docs。