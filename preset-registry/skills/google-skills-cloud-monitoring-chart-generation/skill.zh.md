---
name: cloud-monitoring-chart-generation
metadata:
  category: CloudObservabilityAndMonitoring
description: >-
  Generates Google Cloud Monitoring Server-Driven UI (SDUI) Widget and
  XyChart Protocol Buffer textprotos from resolved PromQL or ListTimeSeries queries.
  Use when:
    - Generating valid google.monitoring.dashboard.v1.Widget textprotos,
      containing PrometheusQuery or TimeSeriesFilter datasets, for use with the Cloud Monitoring
      Dashboards API, gcloud CLI, or declarative dashboard definitions.
    - Synthesizing Server-Driven UI (SDUI) widget titles, axis labels, and
      plot types for Prometheus or ListTimeSeries queries.
  Don't use for:
    - Metric discovery or PromQL query generation. For those tasks, use the
      cloud-monitoring-metric-selection or cloud-monitoring-promql-query skills.
---
# Cloud Monitoring 图表生成 Skill（`cloud-monitoring-chart-generation`）

将 PromQL 或 ListTimeSeries JSON 请求载荷及指标元数据转换为有效的服务器驱动 UI（SDUI）`google.monitoring.dashboard.v1.Widget` Protocol Buffer textproto。这些生成的 textproto 旨在供 Cloud Monitoring Dashboards API、gcloud CLI 或声明式信息中心配置流水线使用。

> [!IMPORTANT] **首选 API 与互斥查询**：
> - **API 偏好**：除非用户明确要求使用 PromQL，或指标计算必须使用 PromQL，否则始终优先为 widget 生成 `ListTimeSeries`（`time_series_filter`）配置，而不是 PromQL。
> - **互斥**：widget 数据集的 `time_series_query` 必须包含 `time_series_filter` 或 `prometheus_query` **二者之一**。绝不能在同一个数据集中同时填充这两个字段。
> - **严格透传**：你必须逐字符精确复制所提供的 PromQL 查询或 ListTimeSeries JSON 中的 filter 字符串。在任何情况下都不要自行编造、重写或修改查询。

> [!CAUTION] **关键执行与工作目录规则**：
>
> -   **不要更改工作目录**：将工作目录保持在工作区根目录。不要使用 `cd` 进入 Skill 子目录。
> -   **禁止发现或搜索规则**：指标描述符、PromQL 查询、ListTimeSeries JSON 载荷、单位和资源类型始终会出现在对话上下文中。**绝不要**运行文件或代码库搜索工具（例如 grep、find、目录列表或代码库查询）来发现指标元数据或检查仓库结构。
> -   **脚本执行**：使用 python3 直接执行捆绑的 Python 脚本。
> -   **输出生成**：`assemble_widget_proto` 脚本会自动生成基于唯一 UUID 的文件名，以避免并行执行冲突。它会将生成的文件名输出到标准错误，并带有醒目的前缀 "Wrote widget textproto to:"。你必须从日志中解析这一确切前缀，以提取生成的路径，并将其用于第 4 阶段的验证。

## 前提条件：环境设置

在你的环境或沙箱中安装所需依赖项：

```bash
pip install -r scripts/requirements.txt
```

## 按照工作流流水线操作

```
[ Stage 1: compute_labels ]  --->  [ Stage 2: LLM Synthesis ]  --->  [ Stage 3: assemble_widget_proto ]
  Generates candidate labels         Formulates SemanticPlotSpec       Emits validated widget textproto
```

### 第 1 阶段：基线候选项合成

使用 python3 运行第 1 阶段：

```bash
# For PromQL:
python3 scripts/compute_labels.py \
  --metric_display_name "METRIC_DISPLAY_NAME" \
  --resource_type "RESOURCE_TYPE" \
  --metric_unit "UNIT" \
  --promql_query 'PROMQL_QUERY'

# For ListTimeSeries:
python3 scripts/compute_labels.py \
  --metric_display_name "METRIC_DISPLAY_NAME" \
  --resource_type "RESOURCE_TYPE" \
  --metric_unit "UNIT" \
  --filter_string 'metric.type="m"...' \
  --per_series_aligner "ALIGN_RATE" \
  --cross_series_reducer "REDUCE_SUM"
```

### 阶段 2：SemanticPlotSpec 预测（LLM）

审查用户提示词、PromQL 或 LTS 查询结构，以及阶段 1 的基准候选项，以构建一个包含 4 个键的 `SemanticPlotSpec` JSON 对象：

1. **`title`**：润色 `titleCandidate`，确保其简洁、易读，并且少于 80 个字符。
2. **`yAxisLabel`**：将其设置为简洁、易读的定量描述或指标概念，例如 `"Utilization"`、`"Bytes"` 或 `"Bytes Rate"`。不要在标签中附加单位符号或后缀，例如 `"(%)"`、`"(/s)"` 或 `"(By)"`，因为单位会通过 `unitOverride` 自动渲染。
3. **`plotType`**：默认为 `LINE`。如果用户明确要求，或者对于分布查询，则使用 `STACKED_AREA`。
4. **`unitOverride`**：将其设置为统一计量单位代码（UCUM）单位字符串，通过应用下方相应规则推导得出：

#### 列出时间序列（LTS）单位策略：

- **信任候选值**：对于列出时间序列流程，直接将其设置为阶段 1 生成的 `unitOverrideCandidate`。例如，阶段 1 会以数学方式处理 `ALIGN_RATE` 并生成 `By/s`，为 `ALIGN_PERCENT_CHANGE` 强制使用 `%`，并无条件正确输出原生归一化结果。

#### PromQL 单位策略（LLM 手动覆盖）：

由于 PromQL 表达式可以进行几何组合，例如 `histogram_quantile(..., rate(...))`，因此应依靠你自己的语义推理来确定最终单位：

- **速率函数（`rate(...)`、`irate(...)`）**：将累积计数器转换为每秒速率。在原始指标单位后附加 `/s`。例如，原始指标单位为 `By` 时，使用 `rate(...)` 会得到 `unitOverride: "By/s"`。
  - **例外**：如果 `rate()` 在 `histogram_quantile()` 内求值，则输出为原始桶单位（如 `"s"`），而不是速率。
- **比率与百分比（`100 * (A / B)`）**：具有相同指标单位的比率通常表示百分比，因此得到 `unitOverride: "%"`。
- **归一化**：将 `10^2.%` 归一化为 `"%"`。
- **保留单位**：对于 `avg_over_time(...)` 或 `sum by (...)` 等简单聚合函数，保留并输出底层指标单位，不做修改。

- **图例模板**：不要配置 `legend_template` 字段。此字段被有意省略，以便 Cloud Monitoring 前端在运行时动态渲染其多列表格式图例。

`SemanticPlotSpec` 示例：

```json
{
  "title": "VM CPU Utilization us-central1-a",
  "yAxisLabel": "Utilization",
  "plotType": "LINE",
  "unitOverride": "%"
}
```

### 阶段 3：Protobuf 组装与输出

使用 python3 运行阶段 3，以生成并保存 widget textproto。对于 PromQL 使用 `--promql_query`，对于 ListTimeSeries 使用 `--lts_request_json`：

```bash
# For PromQL:
python3 scripts/assemble_widget_proto.py \
  --promql_query 'PROMQL_QUERY' \
  --spec_json 'SEMANTIC_PLOT_SPEC_JSON'

# For ListTimeSeries:
python3 scripts/assemble_widget_proto.py \
  --lts_request_json '{"filter": "...", "aggregation": {...}}' \
  --spec_json 'SEMANTIC_PLOT_SPEC_JSON'
```

> [!IMPORTANT] **强制文件输出约定**：不要尝试猜测或强制指定输出文件名。脚本会自动生成一个保证唯一的文件名，并将其打印到标准错误。请在 stderr 中搜索明确的前缀 "Wrote widget textproto to:"，以确定性地获取此文件名，然后在第 4 阶段的验证中将其作为目标文件。

-   **已分配文件名反馈**：每当保存输出文件时，脚本都会将文件路径记录到 stderr。请查看命令执行日志以获取所创建文件的确切文件名，以便在第 4 阶段的验证中将其作为目标文件。
-   **文本聊天输出**：在回复中，将生成的 SDUI 微件 textproto 包含在
    ```` ```textproto```` 代码块中：

```textproto
title: "..."
xy_chart {
  ...
}
```

### 验证并自动重试

> [!CAUTION] **在文件验证通过之前，请勿结束本轮回复**：1.
> **验证工件**：针对第 3 阶段生成的输出文件执行验证器脚本：
>
> ```bash
>    # For PromQL charts:
>    python3 scripts/validate_chart.py --input_file "GENERATED_FILE.textproto" \
>       --expected_promql_substring "SOME_IDENTIFYING_SUBSTRING_FROM_QUERY" \
>       --expected_unit_override "UNIT_OVERRIDE_CANDIDATE"
>
>    # For ListTimeSeries (LTS) charts:
>    python3 scripts/validate_chart.py --input_file "GENERATED_FILE.textproto" \
>       --expected_lts_filter_substring "SOME_IDENTIFYING_SUBSTRING_FROM_FILTER" \
>       --expected_unit_override "UNIT_OVERRIDE_CANDIDATE"
>
>    # ALWAYS provide an identifying substring and the Stage 1 unit override candidate to verify you didn't mutate the data.
    
>    # CRITICAL: If you generated multiple charts for multiple metrics, you MUST run this validation script independently for EACH file generated to ensure every chart is correct!
> ```
>
> 2.  **文件缺失或验证失败时自动重试**：如果 `validate_chart` 报告文件缺失或无效，请检查脚本参数并立即重新运行第 3 阶段：
>
>     ```bash
>     python3 scripts/assemble_widget_proto.py \
>       --promql_query 'PROMQL_QUERY' \
>       --spec_json 'SEMANTIC_PLOT_SPEC_JSON'
>     # Or use --lts_request_json if applicable
>     ```
> 3. **验证与重试**：运行 `validate_chart` 以验证生成的
>    textproto。如果验证因架构或语法错误而失败，请更正参数并最多重试 2 次。如果重试 2 次后验证仍然失败，请停止重试，向用户告知验证错误，并提供尽力生成的 textproto。
> 4.  **执行错误与验证错误**：请注意，来自 `validate_chart.py` 的架构/语法验证错误不同于操作系统或环境执行限制，后者将在下面的**优雅沙箱回退**中处理。

#### 执行优雅沙箱回退

如果由于环境或沙箱限制而无法执行 `compute_labels.py`、`assemble_widget_proto.py` 或 `validate_chart.py`，请执行以下操作：

1. 告知用户哪个脚本无法执行以及原因。
2. **直接在响应中合成并输出完整的微件 textproto**，遵循所有格式和单位规则。
3. 提供一个 **“本地验证”** 部分，其中包含独立的 python3 命令，以便用户在需要时在本地运行并验证架构。

## 支持链接

- [信息中心 API](https://docs.cloud.google.com/monitoring/dashboards/api-dashboard)
- [Prometheus 文档](https://prometheus.io/docs/prometheus/latest/querying/)