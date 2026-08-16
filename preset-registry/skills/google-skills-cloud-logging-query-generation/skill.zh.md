---
name: cloud-logging-query-generation
metadata:
  category: CloudObservabilityAndMonitoring
description: >-
  Generates Logging Query Language (LQL) queries for Google Cloud Logging from natural language. Use this skill when you need to query log data or when you are debugging issues. You can filter log data by Google Cloud service. Don't use this skill to query other databases, such as SQL or Cloud Spanner.
---
# 生成 Logging Query Language 查询

使用此 Skill 为 Cloud Logging 生成正确的 Logging Query Language（LQL）查询。

## 核心规则

1.  **严格的语法要求：**

    *   字符串字面量**始终使用双引号（`"`）**。不要使用单引号（`'`）。
    *   布尔运算符全部使用大写：`AND`、`OR`、`NOT`。
    *   始终使用括号对各项进行分组，并明确指定优先级。

2.  **常见陷阱：**

    *   **实例 ID 与实例名称：** 对于 `gce_instance` 资源类型，请勿将实例名称与实例 ID 进行比较。实例名称是字符串（例如 `my-instance`），而实例 ID 是数字。如果只有名称，则按实例名称进行搜索，即使用 `SEARCH("my-instance")`；如果该资源提供了相应标签，也可以使用 `resource.labels.instance_name`。
    *   **资源类型的准确性：** 不要猜测资源类型。必须在特定于服务的参考文件中查找正确的 `resource.type` 值。例如，在按转发规则名称或区域进行过滤时，针对内部 HTTP(S) 负载均衡器规则应使用 `internal_http_lb_rule`（而不是 `http_load_balancer`）。

3.  **输出格式和占位符：**

    *   **仅**输出原始 LQL 查询文本。不要包含对话式填充内容。除非用户明确要求，否则不要将查询包裹在 Markdown 代码块中。允许使用有效的 LQL 注释（使用 `--`），并且这是加入解释或警告的**唯一**可接受方式。
    *   **绝不能因缺少变量而中止。** 如果用户的请求缺少具体标识符（例如项目 ID、实例名称或 IP 地址），不要要求用户澄清。如果某个变量是构造有效查询所必需的（例如区域日志的日志存储桶名称），请插入一个用尖括号包裹的大写占位符字符串（例如 `"<PROJECT_ID>"`）。**至关重要的是**：如果你为用户省略的变量加入占位符，它将充当显式过滤条件，从而导致遗漏日志。因此，如果某个字段并非绝对必需，则必须省略包含该占位符的整个过滤条件/行。例如，如果用户未指定实例，则应完全省略 `resource.labels.instance_id="..."`；但如果要构造区域日志存储桶查询，而项目 ID 又是绝对必需的，则必须包含带占位符的 `logName=".../projects/<PROJECT_ID>/..."`。

4.  **首选字段：**

    *   当查询针对特定 Google Cloud 服务或资源时，应包含 `resource.type` 和 `log_id` 限制条件。全局查询（例如“最新的错误日志”）不需要这些限制条件。

## 详细参考

有关 LQL 语法规则（包括运算符、NULL 处理、SEARCH 和正则表达式），请参阅 `references/api_reference.md`。

## 服务参考文件

在生成查询之前，你必须阅读特定服务的示例。
LQL 架构和 `resource.type` 值因服务而异。**不要在文件中找到基础架构后就停止阅读。你必须确认架构块下方的段落或具体查询示例中，是否详细说明了状态跟踪（如 `previousState`）的特定要求或特定于资源的日志 ID。**

**对于以下服务，请阅读明确列出的文件：**

*   [App Engine](references/query_app_engine.md)
*   [BigQuery](references/query_bigquery.md)
*   [Cloud Deployment Manager](references/query_deployment_manager.md)
*   [Cloud Functions](references/query_cloud_functions.md)
*   [Cloud Observability（Monitoring、Logging、Trace）](references/query_cloud_observability.md)
*   [Cloud Run](references/query_cloud_run.md)
*   [Cloud Source Repositories](references/query_cloud_source_repositories.md)
*   [Cloud Spanner](references/query_spanner.md)
*   [Cloud SQL](references/query_cloud_sql.md)
*   [Cloud Storage](references/query_cloud_storage.md)
*   [Cloud Tasks](references/query_cloud_tasks.md)
*   [Compute Engine（GCE）](references/query_compute_engine.md)
*   [Dataflow](references/query_dataflow.md)
*   [Dataproc](references/query_dataproc.md)
*   [Kubernetes Engine（GKE）](references/query_gke.md)
*   [IAM 和服务账号](references/query_iam.md)
*   [网络（VPC、负载均衡及其他）](references/query_networking.md)
*   [安全（审计日志记录）](references/query_security.md)
*   [Service Usage（启用/停用 API、配额）](references/query_service_usage.md)
*   [第三方（例如 Nginx、Apache）](references/query_third_party.md)

**对于未列出的 Google Cloud 服务：**如果服务未在上方列出，请根据你的常识编写 LQL 查询。

## 查询生成规则

1.  **资源类型：**当查询聚焦于特定服务时，明确指定 `resource.type`。对于某些查询，你可能需要跨多个类型进行搜索（例如 `resource.type=("bigquery_project" OR
    "bigquery_dataset")`）。
2.  **审计日志和管理员日志：**如果用户请求审计日志、管理员日志、API 日志，或者与谁创建、更新、删除、读取或访问了某项资源有关的日志：
    *   你必须阅读
        [references/query_audit_logs.md](references/query_audit_logs.md)，以了解正确的 `protoPayload` 架构路径和常见示例。
    *   如果未列出具体示例，请通过组合服务和动词来推测 `protoPayload.methodName`。进行推测时，你必须使用限定作用域的 `SEARCH()` 函数（例如 `SEARCH(protoPayload.methodName,
        "compute.instances.insert")`），而不是精确匹配运算符（`=`），以避免版本前缀不匹配。不要使用冒号运算符（`:`），因为它可能导致子字符串误匹配。
    *   对于通用的 API 启用/停用事件（例如某项服务被停用），始终使用 `resource.type="audited_resource"`。
3.  **处理未知架构（至关重要）：**如果用户要求按特定字段或条件进行过滤，而你无法在参考文件中找到匹配的示例或架构，**那么你必须使用全局搜索生成查询。**
    *   只有在确定其确切名称时，才能指定 `jsonPayload.*` 或 `protoPayload.*` 字段结构。
    *   使用 `SEARCH()` 函数，在正确的 `resource.type` 中全局查找关键词。
    *   **强制性 LQL 注释：**当提供使用 `SEARCH` 的查询时，你必须在查询顶部添加一条 LQL 注释（使用 `--`），说明由于参考资料中没有确切架构，因此使用了全局关键词搜索。不要输出对话式文本，严格遵守输出格式规则。

## 相关链接

*   [Cloud Logging 查询语言文档](https://docs.cloud.google.com/logging/docs/view/logging-query-language)
*   [受监控资源类型目录](https://docs.cloud.google.com/logging/docs/api/v2/resource-list)
*   [Cloud Logging 查询库](https://docs.cloud.google.com/logging/docs/view/query-library)