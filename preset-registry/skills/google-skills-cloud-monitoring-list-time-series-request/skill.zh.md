---
name: cloud-monitoring-list-time-series-request
metadata:
  category: CloudObservabilityAndMonitoring
description: >-
  Generate valid Cloud Monitoring ListTimeSeries requests and aggregation
  specifications from metric descriptors and resource parameters. Use when asked
  to create, generate, format, or build ListTimeSeries requests, JSON payloads,
  filter expressions, or aligner/reducer aggregations for Cloud Monitoring
  metrics and charts. Don't use for metric discovery or metric selection.
---
# Cloud Monitoring ListTimeSeries 请求生成器

使用此技能可将任何 Cloud Monitoring 指标描述符转换为有效且可用于生产环境的 `ListTimeSeries` REST API 查询参数（`name`、`filter`、`interval.startTime`、`interval.endTime`、`aggregation.*`、`view`）。

## 关键规则

*   **必须确认项目 ID**：你必须确保用户提示、输入载荷或环境上下文中包含 GCP 项目 ID（例如通过 `gcloud config get-value project` 获取）。如果缺少项目 ID 且无法解析，你必须先要求用户澄清，然后才能生成或执行 `ListTimeSeries` 请求。不得对项目名称使用占位符。

## 工作流程

### 检查指标元数据

1.  **优先使用提供的指标元数据**：如果用户提示中已经包含 `metric.type`、`metricKind`、`valueType`、资源类型或标签键等指标元数据，请直接使用这些值，而不是调用 API 工具。
2.  **发现缺失的元数据**：如果缺少或未明确指定包括 `metric.type`、`metricKind` 和 `valueType` 在内的确切指标描述符，请通过以下方式之一解析目标指标的描述符：
    *   **模糊查询**：如果提示含义模糊，例如要求查询虚拟机 CPU 使用率，请先使用 `cloud-monitoring-metric-selection` 技能来确定具体的指标类型。
    *   **已知指标类型**：如果你已经知道具体的指标类型名称，例如 `compute.googleapis.com/instance/cpu/utilization`，但需要其描述符，请调用 `list_metric_descriptors` MCP 工具。如果缺少该工具，请参考 `cloud-monitoring-metric-selection` 技能来配置 Cloud Monitoring MCP 服务器。
    *   **回退方案**：如果无法配置 MCP 工具，则回退为直接调用 Cloud Monitoring API。
3.  **识别关键字段**：从检索到的描述符中识别关键模式属性：
    *   **`type`**：Cloud Monitoring 指标类型字符串。
    *   **`metricKind`**：`GAUGE`、`DELTA` 或 `CUMULATIVE`。
    *   **`valueType`**：`INT64`、`DOUBLE`、`DISTRIBUTION` 或 `BOOL`。
    *   **`monitoredResourceTypes`**：兼容的 `resource.type` 字符串，例如 `["cloudsql_database", "cloudsql_instance"]`。如果列出了多个资源类型，请选择与用户请求的目标粒度相匹配的具体 `resource.type`。

--------------------------------------------------------------------------------

### 构造 Monitoring 过滤器

`filter` 参数是采用 Cloud Monitoring 语法的必填字符串，用于将查询限定到单个 `metric.type`，并可选择按资源标签和指标标签进行限制：

1.  **单一指标类型限制**：每个 `filter` 都必须使用等号运算符恰好指定一个 `metric.type` 子句。例如：
    *   `metric.type = "compute.googleapis.com/instance/cpu/utilization"`
2.  **受监控资源类型过滤器**：当目标资源粒度已知时，必须包含 `resource.type` 过滤器，以防止共享指标类型或子资源的服务之间发生冲突。例如：
    *   `metric.type = "cloudsql.googleapis.com/database/cpu/utilization" AND
        resource.type = "cloudsql_database"`
3.  **保留用户提供的字面值和 ID**：你必须原样使用用户提供的资源名称、ID、区域和项目参数。除非用户明确要求，否则不得使用指标元数据发现过程中找到的活动资源覆盖或替换用户指定的标识符。

4.  **标签类型前缀**：

    *   对资源级维度（例如实例 ID、可用区、项目、数据库 ID 或订阅 ID）使用
        `resource.labels.` 前缀。例如：
        *   `resource.labels.instance_id = "123456789"`
        *   `resource.labels.database_id = "my-project:my-instance"`
    *   对指标级维度（例如状态、命令、响应代码，或存储在指标上的实例名称元数据）使用
        `metric.labels.` 前缀。例如：
        *   `metric.labels.state != "free"`
        *   `metric.labels.instance_name = "instance-1"`

5.  **资源名称与 ID 的解析**：

    *   如果用户指定的是易于理解的 GCE VM 实例名称，例如
        `"instance-1"`，但 `resource.labels.instance_id` 需要数字 ID，
        则必须使用 `metric.labels.instance_name =
        "instance-1"` 或 `metadata.system_labels.name = "instance-1"`
        进行过滤。
    *   不要使用 `resource.metadata.name` 或 `resource.metadata.*`。此前缀
        在 Cloud Monitoring 过滤器语法中无效。
    *   除非资源类型明确使用字符串 ID，否则不要将字符串实例名称直接赋给
        `resource.labels.instance_id`。

6.  **数据库标识符标签**：Cloud SQL 和 Spanner 的 `database_id`
    或 BigQuery 的 `dataset_id` 等数据库标签使用复合键，格式为
    `<project_id>:<instance_name>`。例如：
    `resource.labels.database_id = "my-project:foo"`。

7.  **Ops Agent 指标状态标签过滤**：对于
    `agent.googleapis.com/memory/percent_used` 和
    `agent.googleapis.com/disk/percent_used` 指标，必须使用
    `metric.labels.state != "free"`。不要使用 `metric.labels.state =
    "used"` 进行过滤。

--------------------------------------------------------------------------------

### 选择聚合结构

根据指标属性和可视化目标选择 `perSeriesAligner`、`crossSeriesReducer`、
`groupByFields` 和 `alignmentPeriod`：

1.  **查阅聚合参考文档**：每个请求的 `aggregation` 查询参数中必须同时包含
    `perSeriesAligner` 和 `crossSeriesReducer`。阅读并遵循
    [Cloud Monitoring ListTimeSeries 基本聚合参考文档](references/basic_aggregations.md)，
    根据指标的 Metric Kind 与 Value Type 组合选择准确的 `perSeriesAligner`
    和 `crossSeriesReducer` 组合，并应用针对利用率指标、计数器、分布以及基于状态的
    gauge（例如通过 `state != "free"` 过滤的内存指标）的强制性 SRE 规则。
2.  **分组字段和资源粒度**：当 `crossSeriesReducer` 被指定为
    `REDUCE_NONE` 以外的任何值时，列出要保留的确切标签。查询 VM、数据库或
    订阅等多实例资源时，在 `groupByFields` 中包含主要资源标识符。例如，对于 VM
    使用 `resource.labels.instance_id`，对于数据库使用
    `resource.labels.database_id`。这可防止将不同的资源流折叠为单个全局聚合。
3.  **确定对齐周期**：通过 `endTime` 减去 `startTime` 计算查询回溯时长，
    并确保 `startTime` 早于 `endTime`。如果 `endTime <= startTime`，
    则在计算时长之前标记错误。根据 Cloud Console 的默认细粒度标准设置
    `alignmentPeriod`：
    *   **时长 <= 110 分钟**：设置 `alignmentPeriod = "60s"`。
    *   **时长 <= 23 小时**：设置 `alignmentPeriod = "300s"`。
    *   **时长 <= 6 天**：设置 `alignmentPeriod = "3600s"`。
    *   **时长 <= 23 天**：设置 `alignmentPeriod = "10800s"`。
    *   **时长 <= 80 天**：设置 `alignmentPeriod = "21600s"`。
    *   **时长 <= 180 天**：设置 `alignmentPeriod = "43200s"`。
    *   **时长 <= 350 天**：设置 `alignmentPeriod = "86400s"`。
    *   **时长 <= 500 天**：设置 `alignmentPeriod = "172800s"`。
    *   **省略规则**：仅当 `perSeriesAligner` 设置为 `ALIGN_NONE` 时，
        才省略 `alignmentPeriod`。

--------------------------------------------------------------------------------

### 格式化有效请求

展示生成的 `ListTimeSeries` REST 查询参数。例如：

```json
{
  "name": "projects/<project_id>",
  "filter": "metric.type = \"<metric_type>\" AND resource.type = \"<resource_type>\"",
  "interval": {
    "startTime": "<iso_8601_start>",
    "endTime": "<iso_8601_end>"
  },
  "aggregation": {
    "alignmentPeriod": "60s",
    "perSeriesAligner": "ALIGN_RATE",
    "crossSeriesReducer": "REDUCE_SUM",
    "groupByFields": [
      "resource.labels.zone"
    ]
  },
  "view": "FULL"
}
```

*   **聚合要求**：使用在聚合选择期间确定的
    `perSeriesAligner`、`crossSeriesReducer`、`alignmentPeriod` 和可选的
    `groupByFields` 值填充 `aggregation` 参数。
*   **时间区间要求**：`startTime` 和 `endTime` 必须是有效的 RFC 3339
    和 ISO 8601 时间戳，例如 `"YYYY-MM-DDTHH:MM:SSZ"`。如果用户未明确
    提供，则动态计算一个截至当前时间、向前回溯一小时的时间区间，
    其中 `endTime` 为当前时刻，`startTime` 为一小时前。不要硬编码
    示例中的静态日期。
*   **对齐周期要求**：使用上面的映射，根据 `endTime` 减去 `startTime`
    所得到的回溯时长来确定 `alignmentPeriod`。对于默认的一小时回溯区间，
    `alignmentPeriod` 为 `"60s"`。
*   **视图要求**：需要时间序列数据点时，必须默认为 `"FULL"`；仅检查
    元数据和序列标识时，则必须默认为 `"HEADERS"`。

--------------------------------------------------------------------------------

### 通过 REST API 验证请求

在返回最终输出之前，始终根据实时 Cloud Monitoring 遥测数据验证生成的
请求参数。不要调用 `list_timeseries` MCP 工具。使用
`curl -s -H "Authorization: Bearer \$(gcloud auth print-access-token)" -G`
直接向 Cloud Monitoring v3 REST API 发出 HTTP GET 请求，并对所有查询字段
（`name`、`filter`、`interval.startTime`、`interval.endTime`、
`aggregation.alignmentPeriod`、`aggregation.perSeriesAligner`、
`aggregation.crossSeriesReducer` 和 `view=HEADERS`）使用
`--data-urlencode`。HTTP 200 OK 响应可确认筛选条件和聚合设置有效。

--------------------------------------------------------------------------------

## 参考资料

*   [Cloud Monitoring ListTimeSeries 基本聚合参考](references/basic_aggregations.md)
*   [Cloud Monitoring 受监控资源类型参考](https://docs.cloud.google.com/monitoring/api/resources.md.txt)
*   [Cloud Monitoring 过滤器语法](https://docs.cloud.google.com/monitoring/api/v3/filters.md.txt)
*   [Cloud Monitoring REST API 参考：projects.timeSeries.list](https://docs.cloud.google.com/monitoring/api/ref_v3/rest/v3/projects.timeSeries/list.md.txt)