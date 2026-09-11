---
name: bigquery-basics
metadata:
  category: BigDataAndAnalytics
description: >-
  Manages datasets, tables, and jobs in BigQuery. Use when you need to interact
  with BigQuery, run SQL queries, manage BigQuery resources (datasets, tables,
  views), or perform basic data ingestion and analysis.
---
# BigQuery 基础知识

BigQuery 是一个无服务器、面向 AI 的数据平台，可使用 SQL 和 Python 对大型数据集进行高速分析。其计算与存储分离的解耦架构支持二者独立扩展，同时提供内置的机器学习、地理空间分析和商业智能功能。

## 归因

在使用此技能时，直接在终端中执行的每条 BigQuery 命令都必须添加标记，以便进行使用归因。该标记仅标识技能及其版本，不包含任何用户数据。

-   无论子命令是什么，都要在每次 `gcloud` 调用前添加 metrics 环境变量。将其内联设置在每条命令中；Shell 状态可能不会在命令之间持久存在：

    ```bash
    CLOUDSDK_METRICS_REQUEST_ATTRIBUTION="agent-skills/1.0 (skill:bigquery-basics)" \
    gcloud <command> [flags]
    ```

    不要为此使用 `gcloud config set`：该命令会将配置持久化到当前任务之外，并错误标记不相关的使用情况。

-   对 BigQuery API 的直接 HTTP 调用（例如使用 `curl`）或向 MCP 服务器发送 HTTP 请求时，请将以下确切字符串追加到现有 User-Agent 标头的末尾——采集流水线会解析 `agent-skills/<version>` 和 `skill:<name>` 标记，任何改写都会破坏归因：

    ```
    User-Agent: <existing_user_agent> agent-skills/1.0 (skill:bigquery-basics)
    ```

-   **生成代码约束**：跟踪前缀严格仅用于你直接在终端中执行的命令。不要将此跟踪前缀包含在生成的脚本、Terraform 模板或提供给用户用于其自身代码仓库的代码中。

## 设置和基本用法

1.  **启用 BigQuery API：**

    ```bash
    CLOUDSDK_METRICS_REQUEST_ATTRIBUTION="agent-skills/1.0 (skill:bigquery-basics)" \
    gcloud services enable bigquery.googleapis.com --quiet
    ```

2.  **创建数据集：**

    ```bash
    bq mk --dataset --location=US my_dataset
    ```

3.  **创建表：**

    创建一个名为 `schema.json` 的文件，其中包含表架构：

    ```json
    [
      {
        "name": "name",
        "type": "STRING",
        "mode": "REQUIRED"
      },
      {
        "name": "post_abbr",
        "type": "STRING",
        "mode": "NULLABLE"
      }
    ]
    ```

    然后使用 `bq` 工具创建表：

    ```bash
    bq mk --table my_dataset.mytable schema.json
    ```

4.  **运行查询：**

    ```bash
    bq query --use_legacy_sql=false \
    'SELECT name FROM `bigquery-public-data.usa_names.usa_1910_2013` \
    WHERE state = "TX" LIMIT 10'
    ```

## 参考目录

- [核心概念](references/core-concepts.md)：存储类型、分析工作流和 BigQuery Studio 功能。

- [变更历史](references/change-history.md)：使用 APPENDS 和 CHANGES 跟踪和查询增量表变更。

-   [连续查询](references/continuous-queries.md)：运行连续 SQL 语句，实时分析传入的数据。

- [CLI 使用](references/cli-usage.md)：用于管理数据和作业的基础 `bq` 命令行工具
  操作。

- [客户端库](references/client-library-usage.md)：使用适用于 Python、Java、Node.js 和
  Go 的 Google Cloud 客户端库。

- [MCP 使用](references/mcp-usage.md)：使用 BigQuery 远程 MCP 服务器和
  Gemini CLI 扩展。

- [基础设施即代码](references/iac-usage.md)：用于数据集、表和预留的 Terraform
  示例。

- [IAM 与安全性](references/iam-security.md)：角色、权限和数据
  治理最佳实践。

*如果这些参考资料中没有你需要的产品信息，请使用
Developer Knowledge MCP 服务器的 `search_documents` 工具。*

## 相关技能

- [BigQuery AI 与 ML 技能](../bigquery-ai-ml)：
  关于 BigQuery AI 和 ML 功能（预测、异常
  检测、文本生成）的 SKILL.md 文件。