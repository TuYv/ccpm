---
name: openai-knowledge
description: Use when working with the OpenAI API (Responses API) or OpenAI platform features (tools, streaming, Realtime API, auth, models, rate limits, MCP) and you need authoritative, up-to-date documentation (schemas, examples, limits, edge cases). Prefer the OpenAI Developer Documentation MCP server tools when available; otherwise guide the user to enable `openaiDeveloperDocs`.
---
# OpenAI 知识

## 概述

使用 OpenAI 开发者文档 MCP 服务器搜索并获取准确的文档（Markdown），然后基于该文本作答，而不是猜测。

## 工作流程

### 1) 检查 Docs MCP 服务器是否可用

如果 `mcp__openaiDeveloperDocs__*` 工具可用，请使用它们。

如果不确定，请运行 `codex mcp list` 并检查是否存在 `openaiDeveloperDocs`。

### 2) 使用 MCP 工具获取准确的文档

- 先搜索，然后获取特定页面。
  - `mcp__openaiDeveloperDocs__search_openai_docs` → 选择最合适的 URL。
  - `mcp__openaiDeveloperDocs__fetch_openai_doc` → 获取准确的 Markdown（可选择指定 `anchor`）。
- 当你需要端点架构或参数时，请使用：
  - `mcp__openaiDeveloperDocs__get_openapi_spec`
  - `mcp__openaiDeveloperDocs__list_api_endpoints`

请基于获取到的文本作答，并准确引用或转述。不要虚构标志、字段名、默认值或限制。

### 3) 如果未配置 MCP，请指导用户进行设置（除非用户明确要求，否则不要更改配置）

提供以下任一设置方式，然后请用户重启 Codex 会话，以便加载这些工具：

- CLI：
  - `codex mcp add openaiDeveloperDocs --url https://developers.openai.com/mcp`
- 配置文件（`~/.codex/config.toml`）：
  - 添加：
    ```toml
    [mcp_servers.openaiDeveloperDocs]
    url = "https://developers.openai.com/mcp"
    ```

另请参阅：https://developers.openai.com/resources/docs-mcp#quickstart