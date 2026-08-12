---
name: mcp-server-patterns
description: Build MCP servers with Node/TypeScript SDK — tools, resources, prompts, Zod validation, stdio vs Streamable HTTP. Use Context7 or official MCP docs for latest API.
origin: ECC
---
# MCP 服务器模式

模型上下文协议（MCP）允许 AI 助手调用工具、读取资源，并使用服务器提供的提示词。在构建或维护 MCP 服务器时，请使用此技能。SDK API 会不断演进；请查阅 Context7（使用 query-docs 查询“MCP”）或 MCP 官方文档，以获取当前的方法名称和签名。

## 何时使用

适用于以下情况：实现新的 MCP 服务器、添加工具或资源、选择 stdio 或 HTTP、升级 SDK，或调试 MCP 注册和传输问题。

## 工作原理

### 核心概念

- **工具**：模型可以调用的操作（例如搜索、运行命令）。根据 SDK 版本，使用 `registerTool()` 或 `tool()` 注册。
- **资源**：模型可以获取的只读数据（例如文件内容、API 响应）。使用 `registerResource()` 或 `resource()` 注册。处理程序通常接收 `uri` 参数。
- **提示词**：客户端可以呈现的可复用参数化提示词模板（例如在 Claude Desktop 中）。使用 `registerPrompt()` 或等效方法注册。
- **传输**：本地客户端（例如 Claude Desktop）使用 stdio；远程客户端（Cursor、云端）首选 Streamable HTTP。旧版 HTTP/SSE 用于向后兼容。

Node/TypeScript SDK 可能提供 `tool()` / `resource()` 或 `registerTool()` / `registerResource()`；官方 SDK 已随时间发生变化。请始终查阅当前的 [MCP 文档](https://modelcontextprotocol.io)或 Context7 进行确认。

### 使用 stdio 连接

对于本地客户端，请创建 stdio 传输，并将其传递给服务器的连接方法。具体 API 因 SDK 版本而异（例如构造函数与工厂函数）。请参阅 MCP 官方文档，或在 Context7 中查询“MCP stdio server”，以获取当前模式。

请让服务器逻辑（工具 + 资源）独立于传输，以便在入口点中接入 stdio 或 HTTP。

### 远程（Streamable HTTP）

对于 Cursor、云端或其他远程客户端，请使用 **Streamable HTTP**（根据当前规范，每个 MCP 使用单一 HTTP 端点）。仅在需要向后兼容时支持旧版 HTTP/SSE。

## 示例

### 安装和服务器设置

```bash
npm install @modelcontextprotocol/sdk zod
```

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({ name: "my-server", version: "1.0.0" });
```

请使用你的 SDK 版本所提供的 API 注册工具和资源：某些版本使用 `server.tool(name, description, schema, handler)`（位置参数），其他版本则使用 `server.tool({ name, description, inputSchema }, handler)` 或 `registerTool()`。资源也是如此——当 API 提供 `uri` 时，请在处理程序中包含它。请查阅 MCP 官方文档或 Context7，确认当前的 `@modelcontextprotocol/sdk` 签名，以避免复制粘贴错误。

使用 **Zod**（或 SDK 首选的架构格式）进行输入验证。

## 最佳实践

- **架构优先**：为每个工具定义输入架构；记录参数和返回结构。
- **错误**：返回模型可以理解的结构化错误或消息；避免返回原始堆栈跟踪。
- **幂等性**：尽可能优先使用幂等工具，以确保重试安全。
- **速率和成本**：对于调用外部 API 的工具，请考虑速率限制和成本；在工具描述中加以说明。
- **版本控制**：在 package.json 中固定 SDK 版本；升级时查看发行说明。

## 官方 SDK 和文档

- **JavaScript/TypeScript**：`@modelcontextprotocol/sdk`（npm）。使用 Context7，并将库名称指定为 "MCP"，以获取当前的注册和传输模式。
- **Go**：GitHub 上的官方 Go SDK（`modelcontextprotocol/go-sdk`）。
- **C#**：适用于 .NET 的官方 C# SDK。