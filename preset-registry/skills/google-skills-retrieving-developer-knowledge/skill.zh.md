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
# Google 开发者知识

Developer Knowledge skill 提供对 Google 官方开发者文档的访问，涵盖 Google Cloud、AI/ML（ai.google.dev、ADK、TensorFlow）、Android、Chrome、Web、Flutter、Go、Firebase 以及其他 Google 开发者平台，可通过 Developer Knowledge MCP server 或 REST API fallback 访问。

## 工作流

1. **直接检索**：回答技术问题时，在当前对话上下文中直接执行一次文档查询（不要将检索委派给子代理）：
   - **如果环境中存在 MCP 工具**：对于概念性指南/工作流，调用 `answer_query`；对于 CLI 标志/语法，调用 `search_documents`。
   - **如果环境中不存在 MCP 工具**：通过 `curl` 针对 `https://developerknowledge.googleapis.com/v1` 执行 REST API 请求。
   - **已声明的服务器不一定是已连接的服务器。** 某些客户端无法完成与此服务器的 MCP 握手，因此即使插件声明了该服务器，也可能完全不提供 `answer_query`、`search_documents` 或 `get_documents` 工具。请将这种情况视为正常，并使用下面的 REST fallback。
2. **使用前确认查询成功**：收到响应并不意味着查询自动得到了答案。`PERMISSION_DENIED`、`UNAUTHENTICATED`、HTTP 401 或 403、空结果集或任何错误负载都表示查询**失败**，即使工具本身没有报告错误。查询失败时，不要假装查询成功后再回答。请尝试另一种传输方式一次；如果该方式也失败，请在回复用户时明确说明无法访问 Developer Knowledge，并说明你是在未使用该服务的情况下回答。把回忆中的文档内容呈现为检索结果是最不可取的做法，因为回复中没有任何内容可以区分它是否来自真实查询。
3. **立即输出完整解决方案**：收到文档响应后，立即在回复文本中直接输出完整、独立且可执行的技术解决方案（包括所有必需标志和占位符的命令、YAML/JSON 配置或代码片段）。

## 工具选择与使用

根据运行时环境中工具的可用性选择适当的工具：

### 1. Developer Knowledge MCP 工具（首选）

当活动工具定义中存在 Developer Knowledge MCP 工具时：

- **`answer_query(query="...")`**：用于概念性指南、架构比较、产品选择概览以及多步骤工作流。
- **`search_documents(query="...")`**：用于细粒度的 CLI 标志、精确语法、参数名称以及 IAM 权限（`service.resource.verb`）。使用 2–5 个聚焦关键词（例如 `cloud run filestore nfs mount gcloud`），不要使用完整的对话式句子。
- **`get_documents(names=["documents/{uri_without_scheme}"])`**：通过资源名称获取完整文档页面（例如 `names: ["documents/docs.cloud.google.com/run/docs/overview/what-is-cloud-run"]`）。

### 2. REST API fallback

当 MCP 工具不存在时，查询 Developer Knowledge REST API（`https://developerknowledge.googleapis.com/v1`）。有两种凭据可用，请按以下顺序尝试。

**首选：现有的 Google 凭据。** 如果 `gcloud` 已完成身份验证，请传递 bearer token 和配额项目。无需安装或配置任何内容：

```bash
curl -s -X POST "https://developerknowledge.googleapis.com/v1:answerQuery" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "X-Goog-User-Project: $(gcloud config get-value project 2>/dev/null)" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"How do I configure public read access on Cloud Storage?\"}"
```

如果身份验证失败，无论是 401、403 还是其他任何凭据错误，都表示该账户的 token 无法被 API 接受。将上面命令中的
`gcloud auth print-access-token` 替换为
`gcloud auth application-default print-access-token`，然后重试。API 接受哪种凭据取决于环境的身份验证方式，因此应将此处的身份验证错误视为尝试应用默认凭据的理由，而不是查询失败。

**如果已配置 API key。** 如果环境中设置了 `DEVELOPERKNOWLEDGE_API_KEY`，请将其作为 `key` 查询参数传递，而不是使用 `Authorization` 请求头。本节中的其余示例均使用这种形式：
- **回答查询**：
  ```bash
  curl -s -X POST "https://developerknowledge.googleapis.com/v1:answerQuery?key=${DEVELOPERKNOWLEDGE_API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"query": "How do I configure public read access on Cloud Storage?"}'
  ```
- **搜索文档片段**（使用 2–5 个聚焦关键词）：
  ```bash
  curl -s "https://developerknowledge.googleapis.com/v1/documents:searchDocumentChunks?query=gcloud+logging+metrics+create&key=${DEVELOPERKNOWLEDGE_API_KEY}"
  ```
- **获取文档**：
  ```bash
  curl -s "https://developerknowledge.googleapis.com/v1/documents/docs.cloud.google.com/run/docs/overview/what-is-cloud-run?key=${DEVELOPERKNOWLEDGE_API_KEY}"
  ```
- **批量获取文档**：
  ```bash
  curl -s -X POST "https://developerknowledge.googleapis.com/v1/documents:batchGet?key=${DEVELOPERKNOWLEDGE_API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"names": ["documents/docs.cloud.google.com/run/docs/overview/what-is-cloud-run"]}'
  ```

## 综合与输出指南

1. **以官方文档为依据**：所有解决方案都必须直接基于检索到的文档。官方文档中的约定具有绝对优先级，高于记忆中的默认设置。
2. **参数格式必须准确**：根据 Google 官方规范格式化 CLI 标志、组合键（例如 `location=IP:PATH`）和 IAM 权限字符串。
3. **最终响应中的完整解决方案**：始终在最终消息中输出完整、自包含、可执行的技术解决方案（命令、配置或代码片段），并直接包含清晰的标准占位符（例如 `PROJECT_ID`、`SERVICE_NAME`、`REGION`），即使这些内容此前已在内部规划中提及。

## 参考资料

- [MCP 使用方法与工具详情](references/mcp-usage.md)
- [REST API 回退指南](references/api-fallback.md)
- [支持的域名与范围限定](references/supported-domains.md)