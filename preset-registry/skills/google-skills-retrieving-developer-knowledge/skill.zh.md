---
name: retrieving-developer-knowledge
metadata:
  category: CloudInfrastructureAndServices
description: >-
  Searches, retrieves, and synthesizes official Google developer documentation across Google Cloud,
  AI/Gemini, Android, Chrome, Web, Flutter, Go, Firebase, and other Google developer platforms.
  Integrates with the Developer Knowledge MCP server (search_documents, get_documents, answer_query)
  or the Developer Knowledge REST API fallback. Use when searching for gcloud CLI commands, API syntax,
  IAM permissions, official documentation, architectural comparisons, or product choice overviews.
  Don't use for local filesystem lookups or non-Google documentation.
---
# Google Developer Knowledge

Developer Knowledge skill 可通过 Developer Knowledge MCP server 或 REST API fallback，访问 Google Cloud、AI/ML（ai.google.dev、ADK、TensorFlow）、Android、Chrome、Web、Flutter、Go、Firebase 以及其他 Google 开发者平台的官方开发者文档。

## 工作流程

1. **直接检索**：回答技术问题时，在当前对话上下文中直接执行一次文档查找（不要将检索委托给子代理）：
   - **如果你的环境中存在 MCP 工具**：对于概念性指南/工作流，调用 `answer_query`；对于 CLI 标志/语法，调用 `search_documents`。
   - **如果不存在 MCP 工具**：通过 `curl` 针对 `https://developerknowledge.googleapis.com/v1` 执行 REST API 请求。
2. **立即输出完整解决方案**：收到文档响应后，立即直接在回复文本中输出完整、自包含且可执行的技术解决方案（包含所有必需标志和占位符的命令、YAML/JSON 配置或代码片段）。

## 工具选择与使用

根据运行时环境中是否存在相应工具，选择适当的工具：

### 1. Developer Knowledge MCP 工具（首选）

当当前工具定义中存在 MCP 工具时：

- **`answer_query(query="...")`**：用于概念性指南、架构比较、产品选择概览和多步骤工作流。
- **`search_documents(query="...", page_size=5)`**：用于细粒度的 CLI 标志、精确语法、参数名称和 IAM 权限（`service.resource.verb`）。使用 2–5 个聚焦关键词（例如 `cloud run filestore nfs mount gcloud`），而不是完整的对话式句子。
- **`get_documents(names=["documents/{uri_without_scheme}"])`**：通过资源名称获取完整文档页面（例如 `names: ["documents/docs.cloud.google.com/run/docs/overview/what-is-cloud-run"]`）。

### 2. REST API fallback

当环境中未声明 MCP 工具时，使用环境变量中的 API key（`DEVELOPERKNOWLEDGE_API_KEY`）通过 HTTP 请求访问 Developer Knowledge REST API（`https://developerknowledge.googleapis.com/v1`）：

- **Answer Query**：
  ```bash
  curl -s -X POST "https://developerknowledge.googleapis.com/v1:answerQuery?key=${DEVELOPERKNOWLEDGE_API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"query": "How do I configure public read access on Cloud Storage?"}'
  ```
- **Search Document Chunks**（使用 2–5 个聚焦关键词）：
  ```bash
  curl -s "https://developerknowledge.googleapis.com/v1/documents:searchDocumentChunks?query=gcloud+logging+metrics+create&key=${DEVELOPERKNOWLEDGE_API_KEY}"
  ```
- **Get Document**：
  ```bash
  curl -s "https://developerknowledge.googleapis.com/v1/documents/docs.cloud.google.com/run/docs/overview/what-is-cloud-run?key=${DEVELOPERKNOWLEDGE_API_KEY}"
  ```
- **Batch Get Documents**：
  ```bash
  curl -s -X POST "https://developerknowledge.googleapis.com/v1/documents:batchGet?key=${DEVELOPERKNOWLEDGE_API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"names": ["documents/docs.cloud.google.com/run/docs/overview/what-is-cloud-run"]}'
  ```

## 综合与输出指南

1. **以官方文档为依据**：所有解决方案都必须直接基于检索到的文档。官方文档中的约定优先级绝对高于记忆中的默认设置。
2. **精确的参数格式**：根据官方 Google 规范格式化 CLI 标志、复合键（例如 `location=IP:PATH`）和 IAM 权限字符串。
3. **最终回复中的完整解决方案**：始终在最终消息中直接输出完整、自包含且可执行的技术解决方案（命令、配置或代码片段），并使用清晰的标准占位符（例如 `PROJECT_ID`、`SERVICE_NAME`、`REGION`），即使这些内容此前已在内部规划中提及。

## 参考资料

- [MCP 使用方法与工具详情](references/mcp-usage.md)
- [REST API 回退指南](references/api-fallback.md)
- [支持的域名与范围限定](references/supported-domains.md)