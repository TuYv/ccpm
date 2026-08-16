---
name: bigquery-basics
metadata:
  category: BigDataAndAnalytics
description: >-
  Manages datasets, tables, and jobs in BigQuery. Use when you need to interact
  with BigQuery, run SQL queries, manage BigQuery resources (datasets, tables,
  views), or perform basic data ingestion and analysis.
---
# BigQuery 基础

BigQuery 是一个无服务器、面向 AI 的数据平台，支持使用 SQL 和 Python 对大型数据集进行高速分析。其解耦架构将计算与存储分离，使二者能够独立扩缩容，同时提供内置的机器学习、地理空间分析和商业智能功能。

## 设置和基本用法

1.  **启用 BigQuery API：**

    ```bash
    gcloud services enable bigquery.googleapis.com --quiet
    ```

2.  **创建数据集：**

    ```bash
    bq mk --dataset --location=US my_dataset
    ```

3.  **创建表：**

    创建一个名为 `schema.json` 的文件，并在其中定义表架构：

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

- [变更历史记录](references/change-history.md)：使用 APPENDS 和 CHANGES 跟踪和查询表的增量变更。

-   [连续查询](references/continuous-queries.md)：运行连续 SQL 语句，实时分析传入的数据。

- [CLI 用法](references/cli-usage.md)：用于管理数据和作业的常用 `bq` 命令行工具操作。

- [客户端库](references/client-library-usage.md)：使用适用于 Python、Java、Node.js 和 Go 的 Google Cloud 客户端库。

- [MCP 用法](references/mcp-usage.md)：使用 BigQuery 远程 MCP 服务器和 Gemini CLI 扩展。

- [基础设施即代码](references/iac-usage.md)：数据集、表和预留的 Terraform 示例。

- [IAM 与安全](references/iam-security.md)：角色、权限和数据治理最佳实践。

*如果你需要的产品信息未包含在这些参考资料中，请使用 Developer Knowledge MCP 服务器的 `search_documents` 工具。*

## 相关技能

- [BigQuery AI 与 ML 技能](../bigquery-ai-ml)：
  关于 BigQuery AI 和 ML 功能（预测、异常检测、文本生成）的 SKILL.md 文件。