---
name: cloud-monitoring-list-time-series-request
metadata:
  category: CloudObservabilityAndMonitoring
description: >-
  Generates valid Cloud Monitoring ListTimeSeries requests and aggregation
  specifications from metric descriptors and resource parameters. Use when asked
  to create, generate, format, or build ListTimeSeries requests, JSON payloads,
  filter expressions, or aligner/reducer aggregations for Cloud Monitoring
  metrics and charts. Don't use for metric discovery or metric selection.
---
# Cloud Monitoring ListTimeSeries 请求生成器

使用此技能将任何 Cloud Monitoring 指标描述符转换为有效、可用于生产环境的 `ListTimeSeries` REST API 查询参数（`name`、`filter`、`interval.startTime`、`interval.endTime`、`aggregation.*`、`view`）。

## 关键规则

*   **必须明确项目 ID**：你 MUST 确保 GCP Project ID 存在于用户提示、输入负载或环境上下文中（例如通过 `gcloud config get-value project` 获取）。如果缺少 Project ID 且无法解析，则在生成或执行 `ListTimeSeries` 请求之前，MUST 要求用户进行澄清。不要对项目名称使用占位符。

## 工作流

### 检查指标元数据

1.  **优先使用已提供的指标元数据**：如果用户提示中已经包含指标元数据，例如 `metric.type`、`metricKind`、`valueType`、资源类型或标签键，请直接使用这些值，而不是调用 API 工具。
2.  **发现缺失的元数据**：如果缺少完整的指标描述符（包括 `metric.type`、`metricKind` 和 `valueType`），或这些信息不够明确，请通过以下路径之一解析目标指标的描述符：
    *   **模糊查询**：如果提示较为模糊，例如请求查询虚拟机 CPU 使用率，请先使用 `cloud-monitoring-metric-selection` 技能来确定具体的指标类型。
    *   **已知指标类型**：如果已经知道具体的指标类型名称，例如 `compute.googleapis.com/instance/cpu/utilization`，但需要其描述符，请调用 `list_metric_descriptors` MCP 工具。如果缺少该工具，请参考 `cloud-monitoring-metric-selection` 技能来配置 Cloud Monitoring MCP 服务器。
    *   **后备方案**：如果无法配置 MCP 工具，则改为直接调用 Cloud Monitoring API。
3.  **识别关键字段**：从获取的描述符中识别以下关键架构属性：
    *   **`type`**：Cloud Monitoring 指标类型字符串。
    *   **`metricKind`**：`GAUGE`、`DELTA` 或 `CUMULATIVE`。
    *   **`valueType`**：`INT64`、`DOUBLE`、`DISTRIBUTION` 或 `BOOL`。
    *   **`monitoredResourceTypes`**：兼容的 `resource.type` 字符串，例如 `["cloudsql_database", "cloudsql_instance"]`。如果列出了多个资源类型，请选择与用户请求目标粒度匹配的具体 `resource.type`。

--------------------------------------------------------------------------------

### 构造 Monitoring 过滤器

`filter` 参数是 Cloud Monitoring 语法中的必需字符串，用于将查询限制为单个 `metric.type` 以及可选的资源标签和指标标签：

1.  **限制为单个指标类型**：每个 `filter` MUST 使用相等运算符指定且只能指定一个 `metric.type` 子句。例如：
    *   `metric.type = "compute.googleapis.com/instance/cpu/utilization"`
2.  **监控资源类型过滤器**：当目标资源粒度已知时，MUST 包含 `resource.type` 过滤器，以避免在共享指标类型或子资源的服务之间发生冲突。例如：
    *   `metric.type = "cloudsql.googleapis.com/database/cpu/utilization" AND
        resource.type = "cloudsql_database"`
3.  **保留用户提供的字面值和 ID**：MUST 使用用户提供的字面资源名称、ID、区域和项目参数，不得对其进行更改。除非用户明确要求，否则不要将在指标元数据发现过程中找到的活动资源替换或覆盖用户指定的标识符。

4.  **标签类型前缀**：

    *   对于资源级维度，例如实例 ID、区域、项目、数据库 ID 或订阅 ID，使用
        `resource.labels.` 前缀。例如：
        *   `resource.labels.instance_id = "123456789"`
        *   `resource.labels.database_id = "my-project:my-instance"`
    *   对于指标级维度，例如状态、命令、响应代码，或存储在指标上的实例名称元数据，使用
        `metric.labels.` 前缀。例如：
        *   `metric.labels.state != "free"`
        *   `metric.labels.instance_name = "instance-1"`

5.  **资源名称与 ID 的解析**：

    *   如果用户指定了人类可读的 GCE VM 实例名称，例如
        `"instance-1"`，但 `resource.labels.instance_id` 需要数字 ID，
        则必须使用 `metric.labels.instance_name =
        "instance-1"` 或 `metadata.system_labels.name = "instance-1"` 进行过滤。
    *   不要使用 `resource.metadata.name` 或 `resource.metadata.*`。此
        前缀在 Cloud Monitoring 过滤器语法中无效。
    *   除非资源类型明确使用字符串 ID，否则不要将字符串实例名称直接赋值给
        `resource.labels.instance_id`。

6.  **数据库标识符标签**：Cloud SQL 和 Spanner 的数据库标签（例如
    `database_id`），或 BigQuery 的 `dataset_id`，使用格式为
    `<project_id>:<instance_name>` 的组合键。例如：
    `resource.labels.database_id = "my-project:foo"`。

7.  **Ops Agent 指标状态标签过滤**：对于
    `agent.googleapis.com/memory/percent_used` 和
    `agent.googleapis.com/disk/percent_used` 指标，必须使用
    `metric.labels.state != "free"`。不要使用 `metric.labels.state =
    "used"` 进行过滤。

--------------------------------------------------------------------------------

### 选择聚合结构

根据指标属性和可视化目标选择 `perSeriesAligner`、`crossSeriesReducer`、`groupByFields` 和
`alignmentPeriod`：

1.  **查阅聚合参考**：每个请求的 `aggregation` 查询参数中都必须包含
    `perSeriesAligner` 和 `crossSeriesReducer`。阅读并遵循
    [Cloud Monitoring ListTimeSeries Basic Aggregations Reference](references/basic_aggregations.md)，
    根据指标的 Metric Kind 和 Value Type 配对选择确切的 `perSeriesAligner` 和
    `crossSeriesReducer` 组合，并应用针对利用率指标、计数器、分布以及基于状态的
    gauge（例如按 `state != "free"` 过滤的内存指标）的强制性 SRE 规则。
2.  **分组字段与资源粒度**：当 `crossSeriesReducer` 指定为除 `REDUCE_NONE` 以外的任何值时，
    列出要保留的确切标签。查询 VM、数据库或订阅等多实例资源时，将主要资源标识符包含在
    `groupByFields` 中。例如，对 VM 使用 `resource.labels.instance_id`，对数据库使用
    `resource.labels.database_id`。这样可以避免将不同资源流合并为单个全局聚合结果。
3.  **对齐周期的确定**：根据 `endTime` 减去 `startTime` 计算查询回溯时长，并确保
    `startTime` 早于 `endTime`。如果 `endTime <= startTime`，则在计算时长之前报告错误。根据 Cloud Console 默认的细粒度标准设置
    `alignmentPeriod`：
    *   **时长 <= 110 分钟**：设置 `alignmentPeriod = "60s"`。
    *   **时长 <= 23 小时**：设置 `alignmentPeriod = "300s"`。
    *   **时长 <= 6 天**：设置 `alignmentPeriod = "3600s"`。
    *   **时长 <= 23 天**：设置 `alignmentPeriod = "10800s"`。
    *   **时长 <= 80 天**：设置 `alignmentPeriod = "21600s"`。
    *   **时长 <= 180 天**：设置 `alignmentPeriod = "43200s"`。
    *   **时长 <= 350 天**：设置 `alignmentPeriod = "86400s"`。
    *   **时长 <= 500 天**：设置 `alignmentPeriod = "172800s"`。
    *   **省略规则**：仅当 `perSeriesAligner` 设置为 `ALIGN_NONE` 时才省略
        `alignmentPeriod`。

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

*   **聚合要求**：使用聚合选择过程中确定的
    `perSeriesAligner`、`crossSeriesReducer`、`alignmentPeriod` 以及可选的
    `groupByFields` 值填充 `aggregation` 参数。
*   **时间间隔要求**：`startTime` 和 `endTime` 必须是有效的 RFC 3339
    和 ISO 8601 时间戳，例如 `"YYYY-MM-DDTHH:MM:SSZ"`。如果用户未明确提供，
    则动态计算一个截至当前时间的一小时回溯时间间隔，其中 `endTime` 为当前时刻，
    `startTime` 为一小时前。不要硬编码示例中的静态日期。
*   **对齐周期要求**：根据 `endTime` 减去 `startTime` 得到的回溯时长，使用上述映射确定
    `alignmentPeriod`。对于默认的一小时回溯时间间隔，`alignmentPeriod` 为 `"60s"`。
*   **视图要求**：需要时间序列数据点时，必须默认为 `"FULL"`；仅检查元数据和序列标识时，
    则默认为 `"HEADERS"`。

--------------------------------------------------------------------------------

### 通过 list_timeseries MCP 工具验证请求

在返回最终输出之前，必须根据实时 Cloud Monitoring 遥测数据验证生成的请求参数。调用
`list_timeseries` MCP 工具，并传入所有生成的查询参数（`name`、`filter`、`interval`、
`aggregation`）。验证时必须设置 `view="HEADERS"`，以便在验证请求结构的同时最大限度地减少延迟和
负载大小。没有 API 错误的响应表明筛选条件和聚合设置有效。

如果 `list_timeseries` 工具不可用，则回退到直接 API 调用。

--------------------------------------------------------------------------------

## 参考资料

*   [Cloud Monitoring ListTimeSeries 基本聚合参考](references/basic_aggregations.md)
*   [Cloud Monitoring 受监控资源类型参考](https://docs.cloud.google.com/monitoring/api/resources.md.txt)
*   [Cloud Monitoring 筛选语法](https://docs.cloud.google.com/monitoring/api/v3/filters.md.txt)
*   [Cloud Monitoring REST API 参考：projects.timeSeries.list](https://docs.cloud.google.com/monitoring/api/ref_v3/rest/v3/projects.timeSeries/list.md.txt)