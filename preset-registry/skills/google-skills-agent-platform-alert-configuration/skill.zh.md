---
name: agent-platform-alert-configuration
metadata:
  category: AiAndMachineLearning
description: >-
  Configures best-practice alerting policies for AI agents using OpenTelemetry
  (OTel) metrics, generating output as Terraform (.tf) configuration files.
  Use when analyzing, writing, or deploying alerting policies
  to monitor agent latency, error rates, token usage, and quality metrics.
  Don't use for standard infrastructure monitoring unrelated to AI agents,
  or when the agent is not instrumented with OpenTelemetry (for Reliability, Cost, Safety, Security alerts).
  NOTE: Reliability, Cost, Safety, and Security alerts use generic OTel metrics
  and work across runtimes (such as Cloud Run, Vertex AI). Quality alerts rely
  on Vertex AI Online Monitors and are strictly bound to Vertex AI deployments.
allowed-tools: terraform gcloud python
---
# Agent Platform 告警配置

## 关键步骤

### 1. 安全与确认分级（关键）

在代表用户执行任何命令或编写配置之前，
你必须根据所请求的操作遵守以下安全分级：

1.  **R 级：只读（`check_telemetry.py` / `gather_agent_info.py`）**
    *   **规则**：无需确认。你可以立即执行这些脚本，以检查遥测状态或收集 Agent 配置详细信息。
2.  **B 级：计费与资源创建（`create_online_monitor.py` /
    资源预配）**
    *   **规则**：**需要用户明确确认**。这些操作会产生额外的计费费用并创建云资源。Agent 必须始终明确警告用户 Online Monitor（需特别提及 **LLM evaluations**）和 Telemetry（需特别提及 **Cloud Trace/Cloud Logging
        export**）可能产生的额外计费费用。在继续进行资源预配或提供设置命令之前，你必须停止操作并请求用户明确批准。

### 2. 前提条件与依赖项

#### Agent 遥测

*   **免责声明**：要使可靠性、成本、安全和安保告警正常运行，底层 Agent 必须已插桩以发出 OpenTelemetry
    (OTel) 指标。如果 Agent 不发出这些指标，告警政策将没有可供评估的数据流。

#### Python 环境

在执行此 Skill 中的任何 python 脚本之前，你必须在环境中安装所需的依赖项。请先运行以下命令：

```bash
pip install -r scripts/requirements.txt
```

### 3. 输入假设

*   **明确遵循项目范围**：你只能为用户在提示中明确提供的 Google Cloud Project 配置告警、查询遥测数据或与之交互。除非用户明确指示，否则不要假定或使用来自你的环境或历史记录中的其他项目。
*   **按顺序转换文件**：如果用户明确要求复制文件后再进行修改，你必须按顺序执行这些操作（先复制，再修改），而不能直接写入最终内容。

### 4. 执行步骤

1.  **强制前提条件执行协议（按顺序）**：在生成或写入任何配置之前，你必须按顺序执行以下步骤：
    1.  **步骤 1：精简发现流程（强制）**：运行
        `gather_agent_info.py`，以自动识别 Agent 运行时、验证遥测、指标范围、关联的数据集等。此脚本涵盖了后续步骤中列出的大多数手动验证。
        *   命令：`python3 scripts/gather_agent_info.py --project-id
            {project_id} --agent-name {agent_name}`
        *   **注意**：如果此脚本**失败**、返回**部分数据**，或未生成你所需的全部信息，你必须通过运行步骤 2 中列出的手动回退步骤来满足要求，然后执行下面的步骤 3。如果步骤 1 成功并提供了所有信息，则**跳至**步骤 3（现有政策验证）。
    2.  **步骤 2：指标范围验证（回退）**：仅当步骤
        1 无法确定指标范围时才运行此步骤。
        *   **操作 A（CLI）**：运行 `gcloud beta monitoring metrics-scopes list
            projects/{project_id}`。如果返回了范围限定项目，你必须在该项目中部署政策。
        *   **操作 B（代码扫描）**：在 Terraform 配置中搜索
            `google_monitoring_monitored_project` 资源，以提取范围限定项目。
        *   **操作 C（回退）**：如果仍不明确，请询问用户：“你是否正在使用多项目 Cloud Monitoring Metric Scope？如果是，范围限定项目 ID 是什么？”
    3.  **步骤 3：现有政策验证**：避免重复。
        *   **操作**：扫描目标目录，检查是否已存在以相同指标为目标的聚合政策（按
            `reasoning_engine_id` 或 `gen_ai_agent_name` 分组）。使用
            `scan_duplicates.py` 进行验证。
2.  **告警政策类型资源文件**：你必须列出并读取
    `references/` 下名称以 `_alert_policies.md` 结尾的文件，以了解如何按类型配置告警政策。默认情况下，你必须配置以下所有告警类型，除非用户要求生成明确指定的告警政策和/或类型。按照这些文件的目录来帮助你找到需要阅读的参考章节：

告警类型       | 参考文件
    :-------------- | :-------------
    **可靠性**     | [reliability_alert_policies.md](references/reliability_alert_policies.md)
    **质量**       | [quality_alert_policies.md](references/quality_alert_policies.md)
    **成本**       | [cost_alert_policies.md](references/cost_alert_policies.md)
    **安全性**     | [safety_alert_policies.md](references/safety_alert_policies.md)
    **安全防护**   | [security_alert_policies.md](references/security_alert_policies.md)

### 5. 输出与格式

*   **始终为目标智能体配置支持的告警策略**：
    *   **对于可靠性监控**：你必须准确配置五项告警策略：
        1.  **延迟**（异常监控）
        2.  **错误率 - 快速消耗 SLO**（1 小时时间窗口）
        3.  **错误率 - 慢速消耗 SLO**（3 天时间窗口）
        4.  **模型调用错误率**（基于 SQL 的可观测性分析告警）
        5.  **工具调用错误率**（基于 SQL 的可观测性分析告警）
    *   **对于质量监控**：你必须准确配置三项告警策略
        （需要 Vertex AI Online Monitors）：
        1.  **最终响应质量**
        2.  **工具使用质量**
        3.  **幻觉**
    *   **对于成本监控**：你必须准确配置一项成本告警策略：
        1.  **Token 快速消耗率**（异常监控）
    *   **对于安全性监控**：你必须准确配置一项安全性告警策略：
        1.  **Model Armor 安全策略高触发率**（基于 SQL 的
            可观测性分析告警）
    *   **对于安全防护监控**：你必须准确配置一项安全防护告警策略：
        1.  **IAM 权限遭拒高触发率**（基于 SQL 的可观测性
            分析告警）
*   **仅限 Terraform**：仅将生成的可观测性配置写入
    Terraform（`.tf`）文件（例如 `alerts.tf`、`variables.tf`）。
    -   只有在系统要求你部署告警且不存在有效的 Terraform 安装时，
        才需要安装 Terraform。使用 `condition_sql` 的基于 SQL 的告警要求
        provider 版本 **>= 6.0.0**（或支持该功能的 5.x 后期版本）。
    -   如果系统**未**要求你部署告警，则无需安装
        terraform。
*   **动态多资源告警（不固定到单一资源）**：除非明确提出要求（例如，
    “仅针对该智能体”），否则不得在告警条件中硬编码特定智能体 ID 或
    资源名称过滤器（例如 `{gen_ai_agent_name="{agent_name}"}` 或
    `metric.labels.agent_resource_name="{agent_name}"`）。请求中仅仅提及
    某个特定智能体名称或 ID，并不构成固定/过滤的明确要求；你仍然必须
    默认使用动态分组，以覆盖所有智能体。要动态覆盖项目中的所有活跃
    智能体：

*正确示例（PromQL 分组）：*

    ```promql
    sum(rate(workload_googleapis_com:gen_ai_invoke_agent_duration_count{monitored_resource="generic_node"}[5m])) by (gen_ai_agent_name)
    ```

    *错误示例（PromQL 硬编码过滤器）：*

    ```promql
    sum(rate(workload_googleapis_com:gen_ai_invoke_agent_duration_count{monitored_resource="generic_node", gen_ai_agent_name="support-bot"}[5m]))
    ```

    *   **对于使用 PromQL 的可靠性指标**：始终使用分组
        聚合。按 `gen_ai_agent_name` 分组（例如 `by
        (gen_ai_agent_name)`）。除非用户要求，否则应避免按单个 ID/名称
        进行过滤。
    *   **对于使用标准阈值过滤器的质量指标**：完全省略
        `agent_resource_name` 过滤器。配置条件过滤器，使其仅针对项目全局的
        受监控资源类型
        （`aiplatform.googleapis.com/OnlineEvaluator`）和指标类型
        （`aiplatform.googleapis.com/online_evaluator/scores`）。

    *正确示例（SQL 分组）：*

    ```sql
    SELECT
      JSON_VALUE(resource.attributes, '$."cloud.resource_id"') as agent_id,
      ...
    FROM ...
    GROUP BY agent_id
    ```

    *错误示例（SQL 硬编码过滤器）：*

    ```sql
    SELECT ...
    FROM ...
    WHERE JSON_VALUE(resource.attributes, '$."cloud.resource_id"') = 'support-bot'
    ```

    *   **对于使用 SQL 的下游调用**：省略针对特定智能体名称的
        `ENDS_WITH` 过滤器。改为提取智能体标识符
        （例如 `JSON_VALUE(resource.attributes, '$."cloud.resource_id"')`），并将其与
        模型或工具名称一起添加到 `GROUP BY` 子句中。
*   **目录推断**：优先使用用户明确提供的路径（如有）。
    否则，将配置文件部署到目标 Terraform 或 SRE
    文件夹（例如 `monitoring/`、`ops/`、`sre/`）。使用工具查找项目中
    告警策略或状态指针所在的位置，而不是盲目地写入
    根目录。
*   **通知渠道**：默认情况下，在没有用户输入的情况下，绝不配置任何通知
    渠道。如果用户在提示中明确提供了通知
    渠道，则配置告警以使用该渠道。如果未提供通知
    渠道，你必须在最终响应中明确询问用户
    是否希望配置通知渠道。**这是一个强制性
    问题，你绝不能在响应中省略它。****重要提示**：不要
    对通知渠道作出任何假设。如果你在代码库中搜索到
    通知渠道，在使用之前必须始终向用户确认。
*   **通俗易懂的说明**：你的响应中必须包含对
    告警功能的通俗易懂说明。该说明必须以通俗易懂的方式解释
    告警衡量什么、算法如何工作，以及触发告警表示什么。

### 6. 输出验证

*   **后台任务清理**：你必须验证自己启动的所有后台
    任务的状态。在完成执行并返回
    最终响应之前，你必须终止或杀死所有仍在运行或挂起的后台
    任务（使用操作为 `kill` 的 `manage_task` 工具）。
*   **验证配置**：运行**配置检查**工具，以确保所有
    输出文件均使用正确的语法和结构编写。有关
    该工具的详细信息，请参阅下方的`工具脚本`章节。

## 工具脚本

使用以下脚本来发现智能体、收集配置详细信息、解决重复项并验证配置：

1.  **智能体信息收集**：简化智能体发现、环境审计
    （Metric Scopes、BQ Datasets、Notification Channels）、表推导（Log
    与 Trace）以及 Online Evaluator 验证。
    *   命令：`python3 scripts/gather_agent_info.py --project-id {project_id}
        --agent-name {agent_name}`
2.  **重复项验证与合并**：验证目标文件夹中已存在的告警，确保更改在原处合并，而不是追加：
    *   命令：`python3 scripts/scan_duplicates.py {target_tf_dir}
        --engine-var '${var.gen_ai_agent_name}'`
3.  **配置检查**：验证 PromQL 语法、匹配的引擎标签以及 HCL 结构：
    *   命令：`python3 scripts/lint_syntax.py {path_to_tf_file}`
    *   **自我修正循环**：如果验证失败（以非零状态退出或输出错误），你必须读取命令输出，定位包含检查错误的行/文件，分析 PromQL 语法或 Terraform HCL 问题，在原处进行调整，然后重新运行 `lint_syntax.py` 验证。重复此循环，直到验证脚本成功通过。

## 注意事项与行为修正

*   **原始错误边界**：说明原始错误数或失败请求绝对数量的边界无法随不断变化的流量吞吐量进行扩展。应改为推荐基于比率的错误率告警。
*   **安全阈值调节的端到端验证**：对动态指标阈值策略进行端到端验证时，不要尝试强制制造真实的平台错误。应改为使用标准安全边界（Z-score
    multiplier > 15）部署告警策略，然后暂时将标准差 Z-score 限制更新为负值（例如 > -3），以触发并验证“Firing”状态，之后再恢复原值。在主动执行此操作之前，始终需要获得确认。
*   **预期的脚本失败**：
    *   `scan_duplicates.py` 以代码 1 退出：解析 JSON
        输出以获取重复的资源目标。在原处执行升级编辑，然后重新检查，直到其以 0 通过。
    *   **避免冗余的发现调用**：如果 `gather_agent_info.py`
        成功返回 Trace 或 Log 表名称（或将其写入变量文件），不要重复调用
        `list_trace_scope_table_names.py` 或 `list_log_scope_table_names.py`。
        这些脚本由 `gather_agent_info.py` 在内部运行，仅作为外部回退方案提供。
    *   **脚本执行失败与自我修正**：如果实用工具脚本（例如 `gather_agent_info.py`、`check_telemetry.py`、
        `create_online_monitor.py`、`analyze_traffic.py`、
        `list_log_scope_table_names.py` 或 `list_trace_scope_table_names.py`）
        的执行意外失败，你必须读取并检查 stdout/stderr 日志或错误输出。分析错误消息，并尝试动态修正参数并重试执行，然后再升级问题或回退到手动方案。有关特定脚本的详细故障排除步骤，请查阅相关的领域专用参考文件。
*   **分布指标对齐器约束**：标准 `ALIGN_MEAN` 不能应用于像 `online_evaluator/scores` 这样的 `DELTA` 分布指标。你必须使用基于百分位数的对齐器（例如 `ALIGN_PERCENTILE_50`），将分数分布缩减为可比较的数值流。
*   **HCL Heredoc 插值**：在 PromQL 或 SQL 查询中引用 Terraform 变量（定义为字符串）时，你必须使用 ${var.variable_name} 语法。像 var.variable_name 这样的裸引用会在部署时失败。
*   **避免递归目录操作**：如果代码仓库根目录包含大量文件，则绝对不要从该目录运行递归列表或搜索命令（例如 `ls -R`、`find .` 或原始递归 `grep`），因为这会导致会话卡死。始终以特定子目录为目标。

## 相关链接

*   [使用在线监控器进行持续评估](https://docs.cloud.google.com/gemini-enterprise-agent-platform/optimize/evaluation/evaluate-online)
*   [Agent Platform 质量指标](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/rubric-metric-details)
*   [Google Cloud 告警策略指南](https://docs.cloud.google.com/monitoring/alerts)
*   [Google Cloud Monitoring PromQL 文档](https://docs.cloud.google.com/monitoring/promql)