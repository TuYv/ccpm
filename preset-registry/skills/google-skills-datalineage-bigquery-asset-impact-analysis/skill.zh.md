---
name: datalineage-bigquery-asset-impact-analysis
metadata:
  category: BigDataAndAnalytics
description: >-
  Analyzes the downstream impact (blast radius) when a BigQuery table or view is broken, stale, or modified.
  Identifies all downstream tables, dashboards, and processes that will be affected.
  Use when:
  - Performing a blast radius or impact analysis for a BigQuery table or view.
  - Assessing the consequences of modifying, deleting, or pausing updates to a BigQuery asset.
  - Identifying downstream dependencies (tables, dashboards, processes) of a BigQuery asset.
  Don't use for:
  - General BigQuery querying or data analysis (use BigQuery-related tools instead).
  - Non-BigQuery assets (e.g., Cloud Storage files) unless they are part of the BigQuery lineage.
  - Creating or modifying lineage links directly.
---
# BigQuery 资产影响分析

此技能指导代理在 BigQuery 表或视图被报告为损坏、数据陈旧、缺失时，或者当用户计划进行维护并希望了解修改资产或暂停资产更新所带来的后果时，执行下游影响分析（影响范围评估）。

它主要依赖 **Google Cloud Data Lineage (Knowledge Catalog) MCP Server** 来发现资产之间的关系。

## 前提条件

此技能需要具备 Google Cloud Data Lineage API 的访问权限，并与 Data Lineage MCP Server 建立有效的客户端连接。有关详细的连接配置和工具架构，请参阅 [MCP 用法](references/mcp-usage.md)。

## 分析工作流

### 1. 解析资产的完全限定名称 (FQN)

*   确保 BigQuery 资产采用正确的 FQN 格式：
    *   *格式：* `bigquery:{project_id}.{dataset_id}.{table_or_view_id}`
    *   *示例：* `bigquery:my-prod-project.analytics.orders`


### 2. 确定位置和父路径

确定要搜索的位置，并构造 Data Lineage API 请求：

*   **发现资产位置**：运行命令 `bq show --format=json
    {project_id}:{dataset_id}` 并提取 `location` 字段（例如，
    `us-central1` 或 `us`）。如果由于权限不足或缺少工具而无法发现位置，
    请提示用户提供数据集的位置。
*   **设置父路径**：使用项目 ID 和 MCP 服务器的位置设置 `parent`
    路径。查阅 `DataLineageServer` 工具定义，以确定已配置的区域或位置
    （例如 `us`）。格式为：
    `projects/{project_id}/locations/{mcp_server_location}`。
*   **配置搜索范围**：在载荷的 `locations` 数组中包含已发现的资产位置
    （例如 `["us-central1"]` 或 `["us",
    "us-central1"]`）。

### 3. 检索下游血缘关系图

调用 `DataLineageServer:search_lineage` 工具以获取下游关系。

*   **方向**：设置为 `DOWNSTREAM`。
*   **搜索参数**：使用 `max_depth = 10` 和 `max_process_per_link = 5`
    作为稳健的默认值。

### 4. 确定影响范围

遍历返回的血缘链接以构建影响图：

*   **受影响的资产**：每个链接的 `target` 表示依赖源资产的下游资产。
*   **转换流程**：检查每个链接上的 `processes` 字段。此字段用于标识
    传播数据的 ETL 管道、BigQuery 视图或计划查询。
*   **直接影响与间接影响**：
    *   **直接影响（深度 1）**：直接使用源资产的资产。
        如果某个链接具有 `dependency_type: EXACT_COPY`，请将目标标记为
        “直接陈旧 / 相同副本”。
    *   **间接影响（深度 > 1）**：位于更下游的资产，
        这些资产将出现级联的数据陈旧或故障。

### 5. 汇总并设置输出格式

使用以下结构向用户清晰地呈现你的发现：

1.  **执行摘要**：说明受影响的下游资产总数以及影响的最大深度。
2.  **关键路径**：突出显示高优先级下游资产（例如，名称中包含
    "prod"、"dashboard"、"reporting" 或 "master" 的资产）。
3.  **影响范围表**：使用清晰的 Markdown 表格列出依赖关系。你
    必须包含所有列：

    | 下游资产                         | 转换过程                                | 深度  | 影响类型 |
    | :------------------------------- | :------------------------------------ | :---- | :---------- |
    | `bigquery:project.dataset.table` | `projects/p/locations/l/processes/proc` | 1     | 直接      |
    | `bigquery:project.dataset.view`  | `projects/p/locations/l/processes/view` | 2     | 间接    |
4.  **分析元数据**：清晰说明搜索所使用的参数和边界，
    以便用户选择是否扩展它们：
    *   **已搜索的位置**：`{list_of_locations_queried}`
    *   **父级位置**：`{parent_path}`
    *   **深度限制**：`{max_depth}`
    *   **每个链接的进程限制**：`{max_process_per_link}`
    *   *给用户的提示*：告知用户，他们可以请求使用扩展后的位置
        或更大的深度限制重新运行分析。

## 关键约束与防护措施

1.  **正确解读空响应**：
    *   如果血缘响应为空，应立即认为查询位置中不存在
        依赖关系，并将此情况告知用户。
2.  **严格禁止绕过限制**：
    *   仅使用 `DataLineageServer:search_lineage` 工具检索
        下游关系。
3.  **首先验证资产是否存在**：
    *   如果 `bq show` 表明源表不存在，应停止并将此情况
        直接告知用户。除非用户明确指示，否则不要尝试猜测其他表名。
4.  **禁止省略输出或虚构产物**：
    *   在最终响应中直接提供完整的下游影响范围表。除非你已
        明确执行文件写入工具来创建单独的 Markdown 文件或产物，否则不要告知用户
        你已创建包含详细信息的此类文件或产物。

## 参考目录

-   [MCP 使用方法](references/mcp-usage.md)：使用 Google Cloud Data Lineage
    远程 MCP 服务器以及工具偏好。

## 外部文档

-   [Google Cloud Knowledge Catalog Data Lineage 文档](https://cloud.google.com/dataplex/docs/about-data-lineage)
-   [使用 Data Lineage MCP 服务器](https://docs.cloud.google.com/dataplex/docs/use-lineage-mcp)
-   [Knowledge Catalog Data Lineage API 参考](https://cloud.google.com/dataplex/docs/reference/data-lineage/rest)