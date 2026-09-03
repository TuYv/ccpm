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

Developer Knowledge 技能可通过 Developer Knowledge MCP server 或 REST API fallback，访问 Google 官方开发者文档，涵盖 Google Cloud、AI/ML（ai.google.dev、ADK、TensorFlow）、Android、Chrome、Web、Flutter、Go、Firebase 以及其他 Google 开发者平台。

## 工作流程

1. **直接检索**：回答技术问题时，在当前对话上下文中直接执行一次文档查找（不要将检索委派给子代理）：
   - **如果环境中存在 MCP tools**：对于概念性指南/工作流，调用 `answer_query`；对于 CLI flags/语法，调用 `search_documents`。
   - **如果环境中不存在 MCP tools**：通过 `curl` 针对 `https://developerknowledge.googleapis.com/v1` 执行 REST API 请求。
   - **已声明的 server 不一定是已连接的 server。** 某些客户端无法与此 server 完成 MCP 握手，因此根本不会暴露 `answer_query`、`search_documents` 或 `get_documents` tool，即使插件声明了其中一个。将其视为正常情况，并使用下面的 REST fallback。

2. **使用结果前确认查找成功**：收到响应并不代表得到了答案。`PERMISSION_DENIED`、`UNAUTHENTICATED`、HTTP 401 或 403、空结果集，或任何错误 payload，都属于失败的查找，即使 tool 本身没有报告错误。查找失败时，不要假装查找成功后再回答。尝试一次另一种传输方式；如果另一种方式也失败，则在回复用户时明确说明无法访问 Developer Knowledge，并说明你是在未使用它的情况下回答。把记忆中的文档内容呈现为检索结果是最糟糕的做法，因为回复中没有任何信息可以区分它是真实查找结果还是其他内容。

3. **立即输出完整解决方案**：收到文档响应后，立即在回复文本中直接输出完整、自包含且可执行的技术解决方案（包括带有所有必需 flags 和 placeholders 的命令、YAML/JSON 配置或代码片段）。

## Tool 选择与使用

根据运行时环境中是否存在相应 tool，选择合适的 tool：

### 1. Developer Knowledge MCP Tools（首选）

当 active tool definitions 中存在 MCP tools 时：

- **`answer_query(query="...")`**：用于概念性指南、架构比较、产品选择概览以及多步骤工作流。
- **`search_documents(query="...", page_size=5)`**：用于细粒度的 CLI flags、精确语法、参数名称和 IAM 权限（`service.resource.verb`）。使用 2–5 个聚焦关键词（例如 `cloud run filestore nfs mount gcloud`），而不是完整的对话式句子。
- **`get_documents(names=["documents/{uri_without_scheme}"])`**：通过 resource name 获取完整文档页面（例如 `names: ["documents/docs.cloud.google.com/run/docs/overview/what-is-cloud-run"]`）。

### 2. REST API Fallback

当 MCP tools 不存在时，查询 Developer Knowledge REST API（`https://developerknowledge.googleapis.com/v1`）。支持两种 credential，应按以下顺序尝试。

**首选：现有的 Google 凭据。** 如果 `gcloud` 已完成身份验证，请传递 bearer token 和配额项目。无需安装或配置任何内容：

```bash
curl -s -X POST "https://developerknowledge.googleapis.com/v1:answerQuery" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "X-Goog-User-Project: $(gcloud config get-value project 2>/dev/null)" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"How do I configure public read access on Cloud Storage?\"}"
```

如果身份验证失败，出现 401、403 或任何其他凭据错误，则表示该账号拥有 API 不接受的 token。请在上面的命令中将
`gcloud auth print-access-token` 替换为 `gcloud auth application-default print-access-token`，然后重试。API 接受哪种凭据取决于环境的身份验证方式，因此应将此处的身份验证错误视为需要尝试应用默认凭据，而不是查询失败。

**API key（如果已配置）。** 如果环境中设置了 `DEVELOPERKNOWLEDGE_API_KEY`，请将其作为 `key` 查询参数传递，而不是使用 `Authorization` header。本节中的其余示例均使用这种形式：
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

1. **基于官方文档进行依据说明**：所有解决方案都必须直接基于检索到的文档。官方文档中的约定始终优先于记忆中的默认设置。
2. **参数格式必须准确**：根据 Google 官方规范格式化 CLI 标志、组合键（例如 `location=IP:PATH`）和 IAM 权限字符串。
3. **最终响应中提供完整解决方案**：始终在最终消息中输出完整、自包含且可执行的技术解决方案（命令、配置或代码片段），并附带清晰的标准占位符（例如 `PROJECT_ID`、`SERVICE_NAME`、`REGION`），即使这些内容此前已在内部规划中引用过。

## 参考资料

- [MCP 使用方法与工具详情](references/mcp-usage.md)
- [REST API 回退指南](references/api-fallback.md)
- [支持的域名与范围限定](references/supported-domains.md)