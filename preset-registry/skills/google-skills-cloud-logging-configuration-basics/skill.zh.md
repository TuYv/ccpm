---
name: cloud-logging-configuration-basics
description: >-
  Configure single-project Google Cloud Logging: regional log buckets, log sinks, log views, restricting or hiding sensitive logs in the default view (_Default) filter,
  IAM permissions for views (Logs View Accessor, IAM conditions), logs-based metrics, log exclusions, and sampling.
  Don't use for cross-project logging or multi-project setups.
metadata:
  category: CloudObservabilityAndMonitoring
---
# 配置 Cloud Logging

使用此技能配置 Cloud Logging 资源，例如日志存储桶、日志
视图或日志接收器。

> [!IMPORTANT] **沙箱网络限制（对智能体测试至关重要）：**
> 在评估期间或受限的沙箱环境中，前往
> Google Cloud API 的网络流量会被阻止。**不要**运行网络发现命令来
> 查找资源名称、项目 ID 或组织 ID。始终使用用户提示或说明中提供的确切
> 项目 ID 或占位符，例如 `{project_id}`。假定这些资源存在，并直接继续
> 执行配置命令。运行这些发现命令将导致
> 执行挂起并超时。

## 安全与确认层级（至关重要）

在代表用户执行任何命令之前，你**必须**根据所请求的操作遵循
以下安全层级：

1.  **层级 R：只读**
    *   **说明：** 仅用于读取状态或查询日志的命令。
    *   **示例命令：**
        *   `gcloud logging read`
        *   `gcloud logging buckets list`
    *   **规则：** 无需确认。你可以立即执行这些命令
        来收集信息。
2.  **层级 M：变更（不涉及计费）**
    *   **说明：** 不会产生直接存储或计费成本，也不会影响
        资源安全/访问策略的配置修改或免费元数据创建操作。
    *   **示例命令：**
        *   `gcloud logging views create`
        *   `gcloud logging views update`
        *   `gcloud logging scopes create`
        *   `gcloud logging buckets create`
    *   **规则：** 无需确认。你可以立即执行这些命令
        来应用配置。
3.  **层级 B：涉及计费和安全敏感的变更（高风险）**
    *   **说明：** 创建会产生计费的资源或
        集成，或者修改安全和 IAM 访问控制策略
        （存在权限提升风险）的操作。
    *   **示例命令：**
        *   `gcloud logging metrics create`
        *   `gcloud logging links create`
        *   `gcloud projects add-iam-policy-binding`
    *   **规则：** **需要交互式确认。** 这些命令会创建
        产生计费成本的资源或更改安全访问权限。你**必须**
        展示确切的原始命令，并在执行前获得用户确认。
        绝不能在请求确认的同一轮中执行。
4.  **层级 D：造成不可逆的数据丢失**
    *   **说明：** 永久丢弃或删除日志的操作，例如
        接收器排除项。
    *   **示例命令：**
        *   `gcloud logging buckets delete`
        *   `gcloud logging sinks update --add-exclusion`
    *   **规则：** **需要明确输入确认。** 这些命令会
        立即且不可逆地丢弃或删除日志，或者可能导致
        日志数据不被存储。你**必须**要求用户明确输入
        确认，例如 “是的，丢弃日志”，并暂停执行，直到
        用户回复。

## 入门

如果缺少 `gcloud` 可执行文件，请参阅
[Google Cloud CLI 安装指南](https://docs.cloud.google.com/sdk/docs/install-sdk.md.txt)
进行安装。

## 创建日志存储桶（合规性与分析）（M 级）

要创建具有特定保留政策、用于满足监管合规要求，并启用了 Observability Analytics 的区域级日志存储桶：

> [!WARNING] **强制性 Observability Analytics 降级警告：** 每当提供有关 Cloud Logging
> 成本优化或排除项的指导、编写指南或起草命令时，你都**必须**在最终文本回复及生成的任何指南中明确包含以下警告：
> “日志存储桶升级为使用 Observability Analytics 后，**无法通过降级移除分析功能**。”

```bash
gcloud logging buckets create {bucket_id} \
    --project={project_id} \
    --location={region} \
    --retention-days={retention_days} \
    --enable-analytics
```

*   `{bucket_id}`：例如，`my-custom-bucket`
*   `{region}`：例如，`us-central1`。要同时使用 Observability Analytics，必须使用区域级日志存储桶。
*   `{retention_days}`：例如，`365`

在通过日志接收器将日志路由到日志存储桶之前，该存储桶不会产生存储或注入费用。

### 验证日志存储桶（R 级）

检查日志存储桶的配置以验证其合规性：

```bash
gcloud logging buckets describe {bucket_id} \
    --location={region} \
    --project={project_id}
```

### 将日志路由到日志存储桶（B 级）

> [!IMPORTANT] **计费操作（B 级）：** 将日志条目路由到存储桶会根据存储的数据量持续产生费用。运行此命令前，你必须获得用户的交互式确认。

只有当日志接收器过滤条件与日志条目匹配并以该存储桶为目标时，日志条目才会存储在日志存储桶中。

要将日志条目路由到日志存储桶：

```bash
gcloud logging sinks create {sink_id} \
    projects/{project_id}/locations/{region}/buckets/{bucket_id} \
    --log-filter='{filter_expression}' \
    --project={project_id}
```

--------------------------------------------------------------------------------

## 基于日志的指标

基于日志的指标会统计与过滤条件匹配的日志条目数量，使你能够跟踪错误率并设置提醒政策。

### 1. 创建基于日志的计数器指标（B 级）

> [!IMPORTANT] **计费操作（B 级）：** 创建基于日志的指标会根据所报告的数据点数量持续产生费用。运行此命令前，你必须获得用户的交互式确认。

要统计特定日志模式（例如，“OutOfMemory”错误）的出现次数：

```bash
gcloud logging metrics create {metric_name} \
    --log-filter='{filter_expression}' \
    --description='{description}' \
    --project={project_id}
```

*   `{metric_name}`：例如，`oom_error_count`
*   `{filter_expression}`：例如，`textPayload:"OutOfMemory"`
*   `{description}`：例如，“有关 OOM 的日志条目计数”

请参阅
[REST 资源：projects.metric](https://docs.cloud.google.com/logging/docs/reference/v2/rest/v2/projects.metrics.md.txt#LogMetric)
以了解指标字段的限制。

### 2. 验证基于日志的指标（R 级）

要验证指标是否存在并检查其配置，请使用
`describe` 命令：

```bash
gcloud logging metrics describe {metric_name} \
    --project={project_id}
```

--------------------------------------------------------------------------------

## 限制对敏感日志的访问（安全性）

在该项目中拥有 `roles/logging.viewer` 的任何人，都可以通过 `_Default` 日志视图查看项目
`_Default` 日志存储桶中的日志。要限制日志的可见性：

> [!IMPORTANT] **歧义处理（智能体指南）：** 如果用户要求
> “排除”“隐藏”或“移除”敏感日志，但未明确说明
> 是否要停止存储这些日志，你**必须**默认选择**从
> 默认视图中排除这些日志（步骤 1）**。这是一项安全且非破坏性的 M 级
> 操作。仅当用户明确使用 *“停止存储”*、
> *“永久丢弃”* 或 *“接收器排除项”* 等具有破坏性含义的措辞时，才配置存储排除项（参见“从存储中丢弃敏感
> 日志”部分）。

### 1. 从默认视图中排除敏感日志（M 级）

要明确阻止一般用户访问敏感日志，请更新
`_Default` 日志视图的过滤器：

```bash
gcloud logging views update _Default \
    --bucket=_Default \
    --location=global \
    --project={project_id} \
    --log-filter='NOT LOG_ID("cloudaudit.googleapis.com/data_access") AND NOT LOG_ID("externalaudit.googleapis.com/data_access") AND NOT LOG_ID("{sensitive_log_id}")'
```

### 2. 创建日志视图（M 级）

创建一个新的日志视图，其中包含项目
`_Default` 日志存储桶中的敏感日志。例如，创建一个可访问
`{sensitive_log_id}` 的“security-logs-view”

```bash
gcloud logging views create security-logs-view \
    --bucket=_Default \
    --location=global \
    --project={project_id} \
    --log-filter='LOG_ID("{sensitive_log_id}")' \
    --description="Sensitive logs"
```

### 3. 使用 IAM 条件授予日志视图访问权限（B 级）

> [!IMPORTANT] **安全操作（B 级）：** 授予 IAM 权限会更改
> 访问控制策略，因此必须在执行前获得用户的明确确认。

使用 IAM 限制对日志视图的访问。授予 Logs Viewer Accessor
角色时，始终附加一个 IAM 条件，将授权范围限制为特定日志
视图。例如，要仅向 `{security_group_email}` 授予对
`_Default` 存储桶中 `security-logs-view` 的访问权限：

```bash
gcloud projects add-iam-policy-binding {project_id} \
--member='group:{security_group_email}' \
--role='roles/logging.viewAccessor' \
--condition="expression=resource.name=='projects/{project_id}/locations/global/buckets/_Default/views/security-logs-view',title=Restricted to Specific Log View,description=Only allows access to the specified log view"
```

将 `{location}` 替换为日志存储桶的位置，例如 `global`，或类似 `us-central1` 的区域位置。

### 4. 验证敏感日志限制（R 级）

要验证用于敏感日志的 Log View 是否配置正确：

```bash
gcloud logging views describe {view_id} \
    --bucket={bucket_id} \
    --location={region} \
    --project={project_id}
```

确保 `filter` 块包含适当的限制表达式。

--------------------------------------------------------------------------------

## 从存储中丢弃敏感日志（D 级）

如果组织的合规策略完全禁止存储敏感日志，可以配置排除规则，在将其写入磁盘之前丢弃。

> [!CAUTION] **破坏性操作（D 级）：** 从所有日志接收器中排除日志会立即且不可逆地删除日志条目。
>
> **安全规则：** 在运行此命令之前，你必须要求用户以键入方式明确确认，例如：“我确认要从存储中排除 `{sensitive_log_id}` 日志”。**同一轮次限制：** 不得在请求确认的同一轮次中执行 `gcloud logging sinks update` 命令。立即停止工具执行，并等待用户回复。

**使用接收器排除规则从存储中排除敏感日志**

```bash
gcloud logging sinks update _Default \
    --project={project_id} \
    --add-exclusion=name=exclude-sensitive,filter='LOG_ID("{sensitive_log_id}")'
```

--------------------------------------------------------------------------------

## 成本优化（降低日志记录成本）

Cloud Logging 的费用取决于提取和存储的数据量。可以通过排除高容量、低价值的日志或对其进行采样来降低成本。每个将日志路由到不同日志存储桶的日志接收器都会产生费用，因此都可以作为优化对象。

> [!CAUTION] **破坏性操作（D 级）：** 本节中的排除规则可能会立即停止存储日志条目。
>
> **安全规则：** 在执行排除或采样更新之前，你必须要求用户以键入方式明确确认（例如：“我确认要排除负载均衡器日志”）。

### 排除所有高容量日志（D 级）

要完全停止将特定类型的日志提取到日志存储桶中，请向将日志路由到该存储桶的日志接收器添加排除规则。

```bash
gcloud logging sinks update {sink_id} \
    --project={project_id} \
    --add-exclusion=name={exclusion_name},filter={exclusion_filter}
```

*   `{sink_id}`：例如 '_Default'
*   `{exclusion_name}`：例如 'exclude-lb-logs'
*   `{exclusion_filter}`：例如 'resource.type="http_load_balancer"'

### 对高容量日志进行采样（D 级）

如果需要保留部分日志用于分析，但又希望减少日志量，请在排除过滤器中使用 `sample()` 函数。

> [!IMPORTANT] `sample(field, fraction)` 函数会匹配占日志总量 `fraction` 比例的日志。在**排除过滤器**中使用时，匹配的日志将被**丢弃**。如果排除 90% 的日志条目，则只会保留 10%。要排除 90%，请在排除过滤器中使用 `sample(insertId, 0.9)`。

要排除 90% 的 `DEBUG` 严重级别日志：

```bash
gcloud logging sinks update _Default \
    --project={project_id} \
    --add-exclusion=name=sample-debug-logs,filter='severity=DEBUG AND sample(insertId, 0.9)'
```

### 验证日志排除项和成本优化（Tier R）

要验证日志排除项是否正确，请列出接收器的详细信息，并
检查 `exclusions` 以确保其中包含你的过滤条件。例如，对于
`_Default` 接收器：

```bash
gcloud logging sinks describe _Default --project={project_id}
```

--------------------------------------------------------------------------------

## 参考资料和支持链接

*   [Google Cloud Logging - 计数器指标](https://docs.cloud.google.com/logging/docs/logs-based-metrics/counter-metrics.md.txt)
*   [Google Cloud Logging - 自定义日志视图](https://docs.cloud.google.com/logging/docs/logs-views.md.txt)
*   [Google Cloud Logging - 排除项](https://docs.cloud.google.com/logging/docs/routing/overview.md.txt)