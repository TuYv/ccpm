---
name: datalineage-summary
metadata:
  category: BigDataAndAnalytics
description: >-
  Summarizes Google Cloud Data Lineage graphs to help users debug data quality issues and understand data provenance for BQ/GCS.
  Use when summarizing upstream and downstream data flows, and presenting complex lineage data as an intuitive Markdown report.
  Don't use for generic BigQuery queries, editing lineage relationships, or downstream deprecation.
  Don't use for downstream blast-radius impact analysis (use datalineage-bigquery-asset-impact-analysis skill instead).
---
# 数据血缘摘要

此技能指导智能体调查并总结特定焦点资产（表级血缘）或特定字段（列级血缘）的数据血缘图。它以直观的从左到右方式说明数据如何进入和离开该资产，将复杂的节点和链接细节抽象为浅显易懂的文字。

## 前提条件

此技能依赖 **Google Cloud Data Lineage (Knowledge Catalog) MCP Server** 进行图遍历。请确保可以在上游和下游两个方向运行 `search_lineage` 查询。有关详细的连接配置和工具架构，请参阅 [MCP 用法](references/mcp-usage.md)。

## 工作流逻辑

### 1. 获取血缘

以焦点为起点，分别沿两个方向（上游和下游）获取血缘图，方法是对 MCP 工具进行*两次单独调用*：一次使用 `"direction": "UPSTREAM"`，另一次使用 `"direction": "DOWNSTREAM"`。

*   **位置策略**：你**必须**使用 `read_url` 工具，从提供的 [Knowledge Catalog 位置](https://docs.cloud.google.com/dataplex/docs/locations.md.txt)链接中动态获取完整的位置列表。为了确保不会遗漏跨区域血缘，在填充 `locations` 数组之前，始终使用此链接核实当前的 GCP 区域列表。你**必须**使用从此链接获取的所有受支持物理区域填充 `locations` 数组。你也可以选择额外确定资产具体处于活动状态的区域（使用 `bq show` 或 `gcloud storage ls`）。
*   **搜索参数**：调用 `search_lineage` 时，使用 `maxDepth = 10`、`maxResults = 5000` 和 `maxProcessPerLink = 10` 作为稳健的默认值。例如，DOWNSTREAM 调用应采用如下格式（根据需要扩展 `locations` 数组）：

    ```json
    {
      "parent": "projects/project_id/locations/us",
      "locations": [
        "us",
        "us-central1",
        "us-east1",
        "us-west1",
        "europe-west1",
        "asia-northeast1"
      ],
      "rootCriteria": {
        "entities": {
          "entities": [
            {
              "fullyQualifiedName": "bigquery:project.dataset.table"
            }
          ]
        }
      },
      "direction": "DOWNSTREAM",
      "limits": {
        "maxDepth": 10,
        "maxResults": 5000,
        "maxProcessPerLink": 10
      }
    }
    ```

    请确保使用 `"direction": "UPSTREAM"` 进行类似调用，以获取上游血缘。

*   **列级血缘 (CLL)**：`search_lineage` 工具可以通过配置 `field` 数组查找所有列级血缘 (CLL)。如果请求的是表级血缘 (TLL)，请利用 `"*"` 通配符配置调用，以便同时获取 CLL 链接和 TLL 链接。例如：

    ```json
    "rootCriteria": {
      "entities": {
        "entities": [
          {
            "fullyQualifiedName": "bigquery:project.dataset.table",
            "field": [
              "*"
            ]
          }
        ]
      }
    }
    ```

如果要评估特定列，请将 `"*"` 替换为具体的列名
    （例如 `"efficiency_score"`）。

### 2. 总结

使用以下提示指南生成摘要。

*   **角色**：作为一名专业的数据血缘分析师，以从左到右的方式生成简洁、
    易于理解的数据流演练说明。
*   **结构与流程**：直接以摘要正文开始，并按以下结构组织：
    *   **整体流程类型**：说明推断出的工作流类型和数据领域
        （例如，“这似乎是一个特征工程工作流……”）。
    *   **系统概览**：首先列出涉及的主要系统。如果请求的是列级血缘，
        则必须在开头明确声明分析范围仅限于指定字段。
    *   **上游血缘**：使用完全一致的加粗标题 `**Upstream Lineage:**`。
        叙述必须详细说明数据如何到达焦点资产，并提及
        关键源系统、项目和处理任务（例如 Dataproc 上的 Spark）。
    *   **下游血缘**：使用完全一致的加粗标题 `**Downstream
        Lineage:**`。详细说明数据如何从焦点资产流向最终
        消费系统。
    *   **分析元数据**：展示 API 调用所使用的参数，
        以清晰说明摘要的边界。输出必须包含：
        *   **搜索的位置**：`{list_of_locations_queried}`
        *   **父位置**：`{parent_path}`
        *   **深度限制**：`{maxDepth}`
        *   **每条链接的流程限制**：`{maxProcessPerLink}`
        *   **给用户的提示**：提示用户可以请求使用
            扩展的位置（如果尚未使用全部位置）或更大的深度重新运行。
*   **粒度约束**：
    *   优先描述系统、项目和数据集之间的流转，而不是单个
        文件/表。
    *   如果具体资产（例如源表、
        中间视图、消费表）少于 5 个，则必须明确列出其名称。少于 5 个时，
        不要只汇总数量；应明确列出名称。
        否则，如果有 5 个或更多，则按数量汇总（例如，“5 个 GCS
        存储桶”）。
    *   仅说明*最终源*、*最终消费者*和
        *资产总数*的数量。
    *   如果只涉及一个项目，不要为每个数据集重复写出项目名称。
*   **语气**：避免使用术语和“存在不同的事实要点”之类的泛泛表述。
    表达要直接、清晰。最终输出采用 Markdown 格式。

### 3. 返回摘要

将最终生成的摘要输出返回给用户。

## 外部文档

-   [Google Cloud Knowledge Catalog 数据血缘文档](https://docs.cloud.google.com/dataplex/docs/about-data-lineage.md.txt)
-   [使用 Data Lineage MCP 服务器](https://docs.cloud.google.com/dataplex/docs/use-lineage-mcp.md.txt)
-   [Knowledge Catalog Data Lineage API 参考](https://docs.cloud.google.com/dataplex/docs/reference/data-lineage/rest.md.txt)