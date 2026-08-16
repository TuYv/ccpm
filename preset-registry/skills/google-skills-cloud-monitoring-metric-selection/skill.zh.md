---
name: cloud-monitoring-metric-selection
metadata:
  category: CloudObservabilityAndMonitoring
description: >-
  Retrieve, query, and identify relevant Google Cloud Monitoring metric
  descriptors for a GCP service or resource (such as Compute Engine, Spanner,
  BigQuery, Cloud Run, Cloud SQL, Pub/Sub, Cloud Storage, etc.). Use when asked
  to find, list, search, or discover GCP metric types, names, kind/value
  schemas, or descriptors.
---
# 指标选择（服务查询与本地关键词过滤）

使用此技能识别最相关的 Google Cloud Monitoring 指标描述符。它通过 API 查询目标服务的所有指标描述符，并使用关键词匹配在代理的上下文中对其进行本地过滤。

## 关键规则

*   **始终查询实时 API**：你必须始终通过调用 `list_metric_descriptors` MCP 工具，动态检索最新的指标描述符。
*   **必须确认项目 ID 和资源参数**：在调用任何 API 工具（例如 `list_metric_descriptors`）之前，你必须确保提示、URI 或环境上下文中提供了 GCP 项目 ID。如果无法确定项目 ID，你必须在执行 API 查询之前要求用户澄清或提供该 ID。不要对未经确认的默认项目名称或占位项目名称（例如 `mock-project`、`my-project-id`、`unused` 或 `YOUR_PROJECT_ID`）运行 API 查询。
*   **回退报告**：如果 API 调用失败并使用了回退来源（例如公共文档），你必须说明错误、回退来源以及非实时数据的风险（例如可能已过时、缺少自定义指标或架构不匹配）。

## 工作流程

### 第 1 步：验证并自动配置 MCP

1.  检查当前启用的工具集中是否存在任何匹配 `list_metric_descriptors` 的工具（例如 `google-cloud-monitoring:list_metric_descriptors`、`mcp_google-cloud-monitoring_list_metric_descriptors` 或类似模式）。
2.  **通过唯一 URL 验证**：为确保调用的是正确的 Google Cloud Monitoring 工具，请确认底层 MCP 服务器配置指向：**`https://monitoring.googleapis.com/mcp`**。
3.  如果该工具**缺失**：

    *   找到用户环境中的 MCP 配置文件。检查以下常见路径：
        -   `~/.gemini/config/mcp_config.json`
        -   `~/.codeium/windsurf/mcp_config.json`
        -   `cline_mcp_settings.json`
        -   `claude_desktop_config.json`
    *   使用以下服务器配置直接更新或合并配置文件。**关键要求**：合并 JSON 对象，以保留 `mcpServers` 中所有现有的 MCP 服务器。不要覆盖该文件。

        ```json
        "google-cloud-monitoring": {
          "url": "https://monitoring.googleapis.com/mcp",
          "authProviderType": "google_credentials",
          "enabledTools": [
            "list_metric_descriptors"
          ]
        }
        ```

    *   输出一条清晰的消息，通知用户已配置 `google-cloud-monitoring` MCP 服务器，并请求他们重新启动或开启新的聊天会话以刷新工具。停止调用其他工具并结束当前轮次。

### 第 2 步：分析请求并提取关键词

1.  **确定项目 ID 和标识符**：检查提示、资源 URI 或环境上下文中是否包含 GCP 项目 ID 和资源标识符。根据上述关键规则，不要使用占位项目名称。

2.  **识别服务前缀**：将目标 GCP 服务映射到其标准前缀（例如 `compute`、`spanner`、`bigquery`、`storage`）。

3.  **提取指标概念**：从用户提示中提取指标关键词（例如“CPU”“内存”“扫描的字节数”“延迟”“连接数”），并将其映射到用于搜索的子字符串。

*查询分析示例：*

*   **用户提示**：“检查 Cloud Storage 存储桶的写入吞吐量和请求计数”
*   **资源 URI**：
    `//storage.googleapis.com/projects/my-project/buckets/my-bucket`
*   **服务前缀**：`storage`（映射到 `storage.googleapis.com`）
*   **指标关键词**：`write`、`throughput`、`request`、`count`
*   **映射后的子字符串**：`write`、`throughput`、`request_count`、`count`

### 第 3 步：通过 list_metric_descriptors 工具查询指标描述符

使用 `list_metric_descriptors` MCP 工具（使用 `pageSize: 200`）查询每个已识别服务前缀的所有指标描述符。由于 Google Cloud Monitoring 过滤器不允许使用 `OR` 组合多个 `metric.type` 限制条件，因此必须**为每个已识别的服务前缀分别发起查询**（可以顺序执行，也可以并行执行）。

如果任何响应包含 `nextPageToken`，则必须连续进行后续调用并传入 `pageToken`，直到检索完该前缀的所有剩余描述符，然后才能进行过滤。

*过滤器模式构造：* 将目标服务域映射到适当的前缀形式：

1.  **标准 Google Cloud 服务**：
    `starts_with("<service_prefix>.googleapis.com/")`（例如
    `bigquery.googleapis.com/`、`redis.googleapis.com/`）。
2.  **Ops Agent（客机操作系统）**：`starts_with("agent.googleapis.com/")`（用于客机操作系统的内存/磁盘指标）。
3.  **Kubernetes / GKE 原生指标**：`starts_with("kubernetes.io/")`
4.  **Istio 服务网格**：`starts_with("istio.io/")`
5.  **Knative Serving / Autoscaler**：`starts_with("knative.dev/")`
6.  **自定义/外部指标**：使用 `starts_with("custom.googleapis.com/")`
    或 `starts_with("external.googleapis.com/")`。

*工具调用载荷示例：* 如果请求同时以 Spanner 和 Compute Engine 为目标，请执行以下两个工具调用：

1.  Spanner 查询：

```json
{
  "name": "projects/my-project-id",
  "filter": "metric.type = starts_with(\"spanner.googleapis.com/\")",
  "pageSize": 200
}
```

1.  Compute Engine 查询：

```json
{
  "name": "projects/my-project-id",
  "filter": "metric.type = starts_with(\"compute.googleapis.com/\")",
  "pageSize": 200
}
```

使用这些载荷调用 `list_metric_descriptors` 工具。

### 第 4 步：本地过滤与回退协议

汇总第 3 步返回的所有描述符，并在你的 LLM 上下文中对其进行本地过滤：

1.  **关键词过滤**：通过将目标指标关键词（例如“cpu”“latency”）与描述符的 `type`、`displayName` 和 `description` 字段进行匹配来过滤列表。
2.  **资源对齐**：检查指标是否包含与目标资源粒度相匹配的标签（例如，当目标为数据库资源时，检查是否存在 `database` 标签）。不要尝试直接动态匹配资源类型字符串，因为 Google Cloud Monitoring 的资源映射（例如 Spanner 数据库映射到 `spanner_instance`）可能并不直观。

#### 故障排除与 API 回退方案

如果任何工具调用失败、超时或返回空结果，请采用以下策略：

*   **情况 A：API 语法错误**：检查错误消息，修正过滤器语法，然后重试。
*   **情况 B：超时／速率限制**：使用更小的页面大小（例如 `pageSize: 20`）重试一次调用。
*   **情况 C：无法恢复的失败／空列表**：
    1.  验证目标服务是否已在项目中启用。
    2.  搜索 Google Cloud 公共文档，确认该服务的标准指标。

### 步骤 5：输出所选指标

对于每个服务域，仅返回与用户意图直接相关的 5-15 个关键指标。

你必须使用清晰的 Markdown 表格报告所选指标，并按服务分组（即每个服务前缀对应一个表格）。表格必须包含以下列：“指标类型”、“显示名称”、“描述”、“指标种类”、“值类型”、“单位”和“受监控资源类型”。将 Google Cloud Monitoring `list_metric_descriptors` 工具调用响应对象中的字段直接映射到表格列：

*   **指标类型**：映射到 `type` 字段（例如
    `spanner.googleapis.com/instance/cpu/utilization`）。
*   **显示名称**：映射到 `displayName` 字段。
*   **描述**：映射到 `description` 字段。
*   **指标种类**：映射到 `metricKind` 字段（例如 `GAUGE`、
    `DELTA`、`CUMULATIVE`）。
*   **值类型**：映射到 `valueType` 字段（例如 `INT64`、
    `DOUBLE`、`DISTRIBUTION`、`BOOL`）。
*   **单位**：映射到 `unit` 字段（例如 `1`、`By`、`s`、`ms`）。
*   **受监控资源类型**：映射到 `monitoredResourceTypes` 列表字段
    （例如 `["spanner_instance"]`）。

*输出表示例：*

指标类型                                         | 显示名称        | 描述                         | 指标种类 | 值类型 | 单位 | 受监控资源类型
:------------------------------------------------ | :-------------- | :--------------------------- | :------- | :----- | :--- | :-------------
`spanner.googleapis.com/instance/cpu/utilization` | 实例 CPU 利用率 | 当前正在使用的已分配 CPU 比例。 | GAUGE    | DOUBLE | 1    | `["spanner_instance"]`

## 参考文档与链接

*   **Google Cloud Monitoring 指标列表**：
    [GCP 指标文档](https://cloud.google.com/monitoring/api/metrics_gcp)
*   **MetricDescriptor MCP 工具参考**：
    [MCP 工具参考：monitoring.googleapis.com](https://docs.cloud.google.com/monitoring/api/ref_v3_mcp/mcp/tools_list/list_metric_descriptors)
*   **Monitoring 过滤器语法指南**：
    [Monitoring 过滤器](https://cloud.google.com/monitoring/api/v3/filters)