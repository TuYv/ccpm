---
name: bigtable-basics
metadata:
  category: Databases
description: >-
  Assists in provisioning instances/tables, designing performant schemas, and querying data in Bigtable. Use when designing Bigtable row keys, configuring column families, writing SQL queries or client library code (Java, Go, Python) for Bigtable, or diagnosing performance/hotspotting issues. Also use when provisioning Bigtable clusters using gcloud or cbt CLIs. Don't use for generic Cloud SQL administration.
---
# Bigtable 基础

本技能提供用于管理和开发 Google Bigtable 的核心工作流和指导。

## 核心原则

-   **控制平面与数据平面：**
    -   将 **`gcloud`** 用于控制平面操作：管理实例、集群、应用配置文件、备份和 IAM。创建表、逻辑视图、物化视图和授权视图。
    -   将 **`cbt`** 用于数据平面操作：更新表、列族，以及读取/写入数据。
-   **性能优先：** Bigtable 是一个 NoSQL 数据库。效率取决于行键设计。始终警告全表扫描。
-   **客户端选择：** 对于生产用例，相较于其他语言，应优先选择 **Java** 或 **Go**，因为它们具有更优的性能和功能覆盖。
-   **可观测性：** 在诊断性能或热点问题时，**始终**将 **Key Visualizer**（通过 Cloud Console）作为主要诊断工具提及，因为它能够提供跨行键访问模式最细粒度的视图。随后应使用 gcloud CLI 中的 hot-tablets 工具和表统计信息，以及 `cbt read` 下的 `include-stats=full` 选项来诊断慢查询。

> [!IMPORTANT] **安全规则：** 在进行非模拟器数据库更改之前，你必须获得用户的明确确认。在提供修改数据库结构或数据的命令或说明时，你必须提及这一安全要求。

## 快速方案

### 1. 查询数据

对于复杂转换或聚合，请使用 SQL；对于较简单的查询模式，请使用键值 API。*注意：使用 `_key` 上的精确匹配、前缀 (`_key LIKE 'myprefix%'`) 或范围谓词，以避免代价高昂的无界扫描。在可能的情况下，建议使用显式行范围 (`_key BETWEEN 'start' AND 'end'`)，它是比前缀匹配性能更高的替代方案。*

如果由于存在多个访问模式且无法全部通过单一架构满足，不得不进行代价高昂的扫描（无论是无界查询，还是扫描大范围的前缀或范围查询），请考虑以下两个选项之一：

-   如果查询将用于面向用户和/或对延迟敏感的应用程序，请使用键针对额外访问模式优化的持续物化视图。
-   如果次要访问模式不频繁，属于 ETL、ML 模型训练或分析型只读任务等批处理模式，请改用 Bigtable Data Boost。

### 2. 操作数据

对于插入、更新、递增和删除操作，请使用键值 API。SQL API 为只读。

### 3. 数据模型定义 (DDL)

SQL API 不支持 DDL 操作。应使用 gcloud CLI 创建、删除和更新表。逻辑视图和持续物化视图定义为 SQL 查询，但必须使用 gcloud CLI 创建。

## 参考指南

-   **CLI 操作**：
    -   [infrastructure_management.md](references/infrastructure_management.md)：
        配置实例、集群和表架构。
    -   [cli_data_access.md](references/cli_data_access.md)：通过 `cbt` CLI 读取和写入数据。
-   **设计与发现**：
    -   [schema_design.md](references/schema_design.md)：表和持续物化视图的行键及性能最佳实践。
    -   [dataplex.md](references/dataplex.md)：Bigtable 资产的数据目录搜索。
-   **查询与代码**：
    -   [sql_guide.md](references/sql_guide.md)：通过 SQL 和 CLI 查询结构化行键。
    -   [client_libraries.md](references/client_libraries.md)：高性能 Go/Java/Python 代码模式。

## 常见工作流

### 架构演进（DevOps）

1.  对于生产环境架构变更，**优先使用 Terraform**，以防止意外
    数据丢失。
2.  对于手动执行的 `cbt` 变更，在提出任何修改之前，先通过列出表的列族和 GC 策略来检查现有状态：

    ```bash
    cbt ls {table}
    ```

    如需修改，请创建列族或更新 GC 策略：

    ```bash
    cbt createfamily {table} {family}
    cbt setgcpolicy {table} {family} "maxversions=5 AND maxage=30d"
    ```

3.  有关完整语法，请参阅
    [infrastructure_management.md](references/infrastructure_management.md)。

## 外部资源

*   [Cloud Bigtable 文档](https://cloud.google.com/bigtable/docs)
*   [Bigtable SQL 参考](https://cloud.google.com/bigtable/docs/googlesql-overview)
*   [cbt CLI 参考](https://cloud.google.com/bigtable/docs/cbt-reference)
*   [gcloud bigtable 参考](https://cloud.google.com/sdk/gcloud/reference/bigtable)