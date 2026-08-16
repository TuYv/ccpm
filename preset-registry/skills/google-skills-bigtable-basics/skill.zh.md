---
name: bigtable-basics
metadata:
  category: Databases
description: >-
  Assists in provisioning instances/tables, designing performant schemas, and querying data in Bigtable. Use when designing Bigtable row keys, configuring column families, writing SQL queries or client library code (Java, Go, Python) for Bigtable, or diagnosing performance/hotspotting issues. Also use when provisioning Bigtable clusters using gcloud or cbt CLIs. Don't use for generic Cloud SQL administration.
---
# Bigtable 基础

本技能提供使用和管理 Google Bigtable 的核心工作流与指导。

## 核心原则

-   **控制平面与数据平面：**
    -   使用 **`gcloud`** 执行控制平面操作：管理实例、集群、应用配置文件、备份和 IAM。创建表、逻辑视图、物化视图和授权视图。
    -   使用 **`cbt`** 执行数据平面操作：更新表、列族，以及读取和写入数据。
-   **性能优先：** Bigtable 是一个 NoSQL 数据库。效率与行键设计密切相关。始终对全表扫描发出警告。
-   **客户端选择：** 对于生产用例，优先选择 **Java** 或 **Go**，因为与其他语言相比，它们具有更出色的性能和更全面的功能支持。
-   **可观测性：** 在诊断性能问题或热点问题时，**始终**
    将 **Key Visualizer**（通过 Cloud Console）作为主要诊断工具提及，因为它能够提供跨行键访问模式的最精细视图。随后应使用 hot-tablets 工具和 gcloud CLI 中的表统计信息，以及 `cbt read` 下的 `include-stats=full` 选项来诊断慢查询。

> [!IMPORTANT] **安全规则：** 在对非模拟器数据库进行更改之前，你必须获得用户的明确确认。在提供修改数据库结构或数据的命令或说明时，你必须提及此安全要求。

## 快速操作指南

### 1. 查询数据

对于复杂转换或聚合使用 SQL，对于较简单的查询模式使用键值 API。*注意：使用精确匹配、前缀（`_key LIKE 'myprefix%'`）或针对 `_key` 的范围谓词，以避免代价高昂的无界扫描。在可行的情况下，建议使用明确的行范围（`_key BETWEEN 'start' AND 'end'`），作为比前缀匹配性能更高的替代方案。*

如果由于存在多种访问模式，无法通过单一架构全部满足，因而无法避免代价高昂的扫描（包括无界扫描，或扫描较大范围的前缀查询或范围查询），请考虑以下两个选项之一：

-   如果查询将用于面向用户和/或延迟敏感的应用程序，请使用针对额外访问模式优化键的连续物化视图。
-   如果次要访问模式并不频繁，属于 ETL、ML 模型训练等批处理模式，或分析型只读任务，请改用 Bigtable Data Boost。

### 2. 操作数据

使用键值 API 执行插入、更新、递增和删除操作。SQL API 为只读。

### 3. 数据模型定义（DDL）

SQL API 不支持 DDL 操作。表的创建、删除和更新应使用 gcloud CLI 完成。逻辑视图和连续物化视图定义为 SQL 查询，但必须使用 gcloud CLI 创建。

## 参考指南

-   **CLI 操作**：
    -   [infrastructure_management.md](references/infrastructure_management.md)：
        配置实例、集群和表架构。
    -   [cli_data_access.md](references/cli_data_access.md)：通过 `cbt` CLI 读取和写入数据。
-   **设计与发现**：
    -   [schema_design.md](references/schema_design.md)：表和连续物化视图的行键及性能最佳实践。
    -   [dataplex.md](references/dataplex.md)：搜索 Bigtable 资产的数据目录。
-   **查询与代码**：
    -   [sql_guide.md](references/sql_guide.md)：通过 SQL 和 CLI 查询结构化行键。
    -   [client_libraries.md](references/client_libraries.md)：高性能 Go/Java/Python 代码模式。

## 常见工作流

### 架构演进（DevOps）

1.  对于生产环境中的架构变更，**优先使用 Terraform**，以防止意外的数据丢失。
2.  对于手动执行的 `cbt` 变更，在提出任何修改之前，先列出表的列族和 GC 策略以检查现有状态：

    ```bash
    cbt ls {table}
    ```

    如果需要修改，请创建列族或更新 GC 策略：

    ```bash
    cbt createfamily {table} {family}
    cbt setgcpolicy {table} {family} "maxversions=5 AND maxage=30d"
    ```

3.  有关完整语法，请参阅
    [infrastructure_management.md](references/infrastructure_management.md)。

## 外部资源

*   [Cloud Bigtable 文档](https://cloud.google.com/bigtable/docs)
*   [Bigtable SQL 参考](https://cloud.google.com/bigtable/docs/reference/sql)
*   [cbt CLI 参考](https://cloud.google.com/bigtable/docs/cbt-reference)
*   [gcloud bigtable 参考](https://cloud.google.com/sdk/gcloud/reference/bigtable)