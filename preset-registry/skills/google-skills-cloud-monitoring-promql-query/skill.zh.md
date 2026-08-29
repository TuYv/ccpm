---
name: cloud-monitoring-promql-query
metadata:
  category: CloudObservabilityAndMonitoring
description: >-
  Generates valid PromQL queries from Cloud Monitoring metric descriptors and
  resource parameters. Use when asked to create, generate, write, or format
  PromQL queries, PromQL strings, or PromQL aggregations for Cloud Monitoring
  metrics and resources. Don't use for raw metric discovery or metric selection.
---
# Cloud Monitoring PromQL 生成器

使用此技能从任意 Cloud Monitoring 指标类型生成有效的 PromQL 查询。本指南适用于所有 Cloud Monitoring 指标类型，方法是将 Cloud Monitoring 指标和资源描述符映射到 PromQL 结构。

## 工作流

### 解析 Project ID（关键且阻塞）

在执行任何其他操作之前（例如搜索代码、读取参考资料或运行验证），你 MUST 验证 Google Cloud Project ID 是否可用：

1.  **检查提示/负载**：查找用户提示或输入中的 Project ID。
2.  **检查环境**：如果提示中不存在 Project ID，你 MUST 运行 `gcloud config get-value project`，尝试从环境中解析该值。
3.  **请求澄清（阻塞）**：如果提示中没有 Project ID，且 `gcloud` 命令执行失败、返回空字符串或不可用，你 MUST 立即停止。不要生成 PromQL 查询，不要运行验证脚本，也不要使用占位符（例如 `YOUR_PROJECT_ID`）。你必须拒绝继续操作，并要求用户提供 Project ID。

### 检查指标和资源描述符

1.  **优先使用已提供的描述符**：如果用户的提示已经包含指标描述符详细信息（例如 `metric.type`、`metricKind`、`valueType` 或 `monitoredResourceTypes`），或包含特定的资源过滤值，则直接使用这些值，而不是调用 Cloud Monitoring API。
2.  **发现缺失的描述符**：如果确切的指标描述符（`metric.type`、`metricKind`、`valueType`）缺失或不够明确，请通过以下路径之一解析目标指标类型的描述符：
    *   **模糊查询**：如果提示较为模糊（例如 `"VM CPU usage"`），请先使用 `cloud-monitoring-metric-selection` 技能来确定具体的指标类型。
    *   **已知指标类型**：如果已经有具体的指标类型名称（例如 `compute.googleapis.com/instance/cpu/utilization`），但需要其描述符，请调用 `google-cloud-monitoring:list_metric_descriptors` MCP 工具。如果缺少该工具，请参考 `cloud-monitoring-metric-selection` 技能来配置 Cloud Monitoring MCP 服务器。
    *   **回退方案**：如果无法配置 MCP 工具，则改为直接调用 Cloud Monitoring API。
3.  **识别关键字段**：从获取的描述符中识别四个关键的架构属性：
    *   **`type`**：Cloud Monitoring 指标类型字符串。
    *   **`metricKind`**：`GAUGE`、`DELTA` 或 `CUMULATIVE`。
    *   **`valueType`**：`INT64`、`DOUBLE`、`DISTRIBUTION` 或 `BOOL`。
    *   **`monitoredResourceTypes`**：资源限定和分组所需的兼容 `resource.type` 字符串。

### 解析资源过滤器与发现协议

要按特定资源实例过滤数据，请应用以下资源规则和发现协议：

1.  **受监控资源过滤器**：始终在查询中包含
    `monitored_resource="<type>"` 过滤器，以防止在共享指标名称的服务之间发生冲突。
    *   **示例**：`monitored_resource="gae_app"`
2.  **保留用户字面值（重要）**：始终使用用户提示中提供的字面资源名称、
    命名空间和 ID。除非用户明确要求你查找活跃资源，否则**不要**
    使用 Cloud Monitoring 发现期间找到的活跃资源名称覆盖或替换这些值。遥测发现只能用于识别
    指标类型名称和标签键，不能用于覆盖用户输入。
3.  **资源标识符映射**：
    *   **直接且具体的键**：使用可用的最具体资源标识符。**示例**：`version_id`、`cluster_name`。
    *   **名称到 ID 的解析**：如果用户按资源*名称*进行过滤
        （例如 `"instance-1"`），但资源架构使用数字 ID（例如 `instance_id`），
        请使用 PromQL 字符串名称标签，而不是数字 ID 标签。**示例**：`instance_name`、
        `metadata_system_name`。
    *   **复合标识符**：对于具有层级标识符的资源
        （例如 Cloud SQL 数据库），将过滤器格式化为单个复合键。**不要**将其拆分为单独的
        `project_id` 和子资源标签。**示例**：`database_id="{project_id}:{instance_name}"`。
4.  **资源标签发现**：`google-cloud-monitoring:list_metric_descriptors` 工具只返回
    指标特定的标签。如果监控资源的标签架构未知，请直接从 Cloud Monitoring v3
    REST API（`projects.monitoredResourceDescriptors.get`）获取资源描述符：

    ```bash
    TOKEN=$(gcloud auth application-default print-access-token 2>/dev/null || gcloud auth print-access-token)
    curl -s -H "Authorization: Bearer ${TOKEN}" \
    "https://monitoring.googleapis.com/v3/projects/{project_id}/monitoredResourceDescriptors/{monitored_resource_type}"
    ```

    HTTP 200 OK 响应会返回 `MonitoredResourceDescriptor` 对象，其中包含
    `labels` 数组以及该资源准确的资源标签键。

### 选择聚合结构与默认值

查询结构和聚合函数（例如 `rate`、
`histogram_quantile`、`sum` 或 `avg`）取决于指标类型及其可视化方式。

1.  **查阅参考资料**：将
    [Cloud Monitoring 到 PromQL 基础聚合参考](references/basic_aggregations.md)
    作为唯一事实来源，用于将 Cloud Monitoring 属性（Metric
    Kind、Value Type、Aligner、Reducer）映射到其 PromQL 结构。
2.  **SRE 聚合与可视化规则**：
    *   **不要对比率/百分比利用率指标求和或求平均**（例如 CPU
        % 或内存限制利用率），也不要跨资源实例进行聚合。相反，应保持其未聚合状态（原始指标），
        按实例分组，或封装在 `topk(30,
        avg_over_time(...))` 中。
    *   **状态标签过滤（重要）**：只有指标
        `agent.googleapis.com/memory/percent_used` 和
        `agent.googleapis.com/disk/percent_used` 需要 `{state!="free"}`。不要
        使用 `{state="used"}` 进行过滤。

### 格式化并验证查询

在呈现任何 PromQL 查询之前，使用 linter 对其进行验证：

#### Python 依赖项

在执行验证脚本（`scripts/validate_promql.py`）之前，安装所需的 Python 依赖项：

```bash
python3 -c "import promql_parser" || pip install promql-parser
```

#### 验证流程

1.  **格式约束**：
    *   **指标名称规范化**：使用以下步骤将 Cloud Monitoring 指标类型转换为
        PromQL 指标名称：
        1.  **拆分域和路径**：按第一个斜杠（`/`）拆分 Cloud Monitoring 指标类型，
            以将域与路径分开。
            *   **示例**：
                `storage.googleapis.com/network/received_bytes_count` -> 域
                `storage.googleapis.com`，路径 `network/received_bytes_count`
        2.  **规范化域**：将域中的所有句点（`.`）替换为下划线（`_`）。
            *   **示例**：`storage.googleapis.com` ->
                `storage_googleapis_com`
        3.  **规范化路径**：将路径中的所有句点（`.`）和斜杠（`/`）替换为下划线（`_`）。
            *   **示例**：`network/received_bytes_count` ->
                `network_received_bytes_count`
        4.  **使用冒号连接**：使用冒号（`:`）连接规范化后的域和路径。
            *   **示例**：
                `storage_googleapis_com:network_received_bytes_count`
        5.  **原生 Prometheus 指标**：如果指标类型不包含斜杠，则保持原样。
            *   **示例**：`up` -> `up`，`http_requests_total` ->
                `http_requests_total`
        6.  **Distribution 后缀**：如果指标的 `valueType` 为
            `DISTRIBUTION`，则在规范化名称末尾追加 `_bucket`。
            *   **示例**：
                `cloudfunctions.googleapis.com/function/execution_times` ->
                `cloudfunctions_googleapis_com:function_execution_times_bucket`
    *   确保最终查询为**不包含注释的单行内容**（不得包含 `#` 或
        `//`）。Cloud Monitoring 查询转换会折叠空白字符，可能导致代码末尾的注释被忽略或引发解析错误。
    *   **分组子句语法**：确保分组子句（例如 `by
        (label)`）只能跟在聚合运算符（例如 `sum`、`avg`、`min`、`max` 或
        `count`）之后。绝不要将分组子句直接放在指标选择器之后。
        *   **错误示例**：`metric{...} by (label)`
        *   **正确示例**：`sum(rate(metric{...}[5m])) by (label)`
    *   **带围栏的输出代码块**：最终回复中始终将最终验证通过的 PromQL
        查询包裹在带围栏的 `promql` 代码块中。
2.  **Linter 验证**：
    *   在单个批次中验证所有生成的查询：`python3
        <path_to_skill>/scripts/validate_promql.py --query '<q1>' '<q2>'`
    *   如果验证失败，请阅读
        [PromQL 错误恢复指南](references/promql_error_recovery.md)，在重复该流程之前诊断并修复常见的类型不匹配和语法错误。

## 参考资料

*   [Cloud Monitoring PromQL 基本聚合参考](references/basic_aggregations.md)
*   [Cloud Monitoring PromQL 错误恢复指南](references/promql_error_recovery.md)
*   [Cloud Monitoring PromQL 文档](https://docs.cloud.google.com/monitoring/promql.md.txt)
*   [Cloud Monitoring 受监控资源类型参考](https://docs.cloud.google.com/monitoring/api/resources.md.txt)