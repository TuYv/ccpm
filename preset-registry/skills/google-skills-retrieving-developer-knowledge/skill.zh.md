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

Developer Knowledge skill 可通过 Developer Knowledge MCP server 或 REST API fallback，访问 Google 官方开发者文档，涵盖 Google Cloud、AI/ML（ai.google.dev、ADK、TensorFlow）、Android、Chrome、Web、Flutter、Go、Firebase 以及其他 Google 开发者平台。

## Workflow

1. **Direct Retrieval**：回答技术问题时，在当前对话上下文中直接执行一次文档查询（不要将检索委托给子代理）：
   - **If MCP tools are present in your environment**：对于概念性指南或工作流，调用 `answer_query`；对于 CLI flags 或语法，调用 `search_documents`。
   - **If MCP tools are not present**：通过 `curl` 对 `https://developerknowledge.googleapis.com/v1` 发起 REST API 请求。
   - **A declared server is not always a connected server.** 某些客户端无法完成与此 server 的 MCP 握手，即使插件声明了该 server，也不会暴露 `answer_query`、`search_documents` 或 `get_documents` 工具。这种情况属于正常现象，请使用下面的 REST fallback。
2. **Confirm the lookup succeeded before using it**：收到响应并不代表查询成功。`PERMISSION_DENIED`、`UNAUTHENTICATED`、HTTP 401 或 403、空结果集或任何错误 payload 都表示查询失败，即使工具本身没有报告错误。查询失败时，不要假设查询已经成功并据此作答。尝试使用另一种传输方式一次；如果另一种方式也失败，请在回复用户时明确说明无法访问 Developer Knowledge，并说明你是在未使用该服务的情况下作答。把回忆中的文档内容伪装成检索结果是最糟糕的做法，因为回复中没有任何内容能够将其与真实查询结果区分开来。
3. **Immediate & Complete Solution Output**：收到文档响应后，立即在回复文本中直接输出完整、自包含且可执行的技术解决方案（包括带有所有必需 flags 和 placeholders 的命令、YAML/JSON 配置或代码片段）。

## Tool Selection & Usage

根据运行时环境中工具的可用性选择适当的工具：

### 1. Developer Knowledge MCP Tools (Preferred)

当活动工具定义中存在 Developer Knowledge MCP 工具时：

- `answer_query(query="...")`：用于概念性指南、架构比较、产品选择概览以及多步骤工作流。
- `search_documents(query="...")`：用于细粒度的 CLI flags、精确语法、参数名称以及 IAM 权限（`service.resource.verb`）。使用 2–5 个聚焦关键词（例如 `cloud run filestore nfs mount gcloud`），不要使用完整的对话式句子。
- `get_documents(names=["documents/{uri_without_scheme}"])`：通过资源名称获取完整文档页面（例如：`names: ["documents/docs.cloud.google.com/run/docs/overview/what-is-cloud-run"]`）。

### 2. REST API Fallback

当 MCP 工具不可用时，通过 `curl` 查询 Developer Knowledge REST API（`https://developerknowledge.googleapis.com/v1`）。有两种凭据可用，按以下顺序尝试。

**首选：现有的 Google 凭据。** 如果 `gcloud` 已完成身份验证，请传入 bearer token 和配额项目。无需安装或配置任何内容：

```bash
curl -s -X POST "https://developerknowledge.googleapis.com/v1:answerQuery" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "X-Goog-User-Project: $(gcloud config get-value project 2>/dev/null)" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"How do I configure public read access on Cloud Storage?\"}"
```

如果身份验证失败，例如出现 401、403 或任何其他凭据错误，说明该账户的 token 不被 API 接受。请将上面命令中的
`gcloud auth print-access-token` 替换为
`gcloud auth application-default print-access-token`，然后重试。API 接受哪种凭据取决于环境的身份验证方式，因此应将此处的身份验证错误视为需要尝试 application-default 凭据的原因，而不是查询失败。

**如果已配置 API key。** 如果环境中设置了 `DEVELOPERKNOWLEDGE_API_KEY`，请将其作为 `key` 查询参数传入，而不是使用 `Authorization` header。如果两种凭据都不可用，对于此客户端，API key 是受支持的方式：请按照 [Developer Knowledge 快速入门](https://developers.google.com/knowledge/quickstart)启用 API 并创建 API key，然后将其导出为 `DEVELOPERKNOWLEDGE_API_KEY`。请说明需要凭据，而不要在未查询的情况下直接回答。本节其余示例均使用这种形式：
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
- **Batch Get Documents**（这是一个 `GET` 请求，每个文档使用一个 `names` 参数，且不包含请求正文；每次调用最多 20 个文档）：
  ```bash
  curl -s -G "https://developerknowledge.googleapis.com/v1/documents:batchGet" \
    --data-urlencode "names=documents/docs.cloud.google.com/run/docs/overview/what-is-cloud-run" \
    --data-urlencode "names=documents/docs.cloud.google.com/storage/docs/creating-buckets" \
    --data-urlencode "key=${DEVELOPERKNOWLEDGE_API_KEY}"
  ```

## 综合与输出指南

1. **基于官方文档提供依据**：所有解决方案都必须直接基于检索到的文档。官方文档中的约定具有绝对优先级，高于记忆中的默认设置。
2. **精确的参数格式**：根据 Google 官方规范设置 CLI flags、复合键（例如 `location=IP:PATH`）和 IAM permission strings 的格式。
3. **在最终回复中提供完整解决方案**：始终在最终消息中直接输出完整、自包含、可执行的技术解决方案（命令、配置或代码片段），并使用清晰的标准占位符（例如 `PROJECT_ID`、`SERVICE_NAME`、`REGION`），即使这些内容此前已在内部规划中提及。

## 参考资料

- [MCP 使用与工具详情](references/mcp-usage.md)
- [REST API 回退指南](references/api-fallback.md)
- [支持的域名与范围限定](references/supported-domains.md)