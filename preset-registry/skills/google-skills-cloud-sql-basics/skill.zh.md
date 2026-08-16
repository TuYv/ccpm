---
name: cloud-sql-basics
metadata:
  category: Databases
description: >-
  This file generates or explains Cloud SQL resources. Use this file when the
  user asks to create a Cloud SQL instance or database for MySQL, PostgreSQL, or
  SQL Server.

  Cloud SQL manages third-party MySQL, PostgreSQL, and SQL Server instances as
  resources in Cloud SQL. For example, when Cloud SQL creates an open-source
  MySQL instance, the resulting resource is a Cloud SQL for MySQL instance that
  Google Cloud manages.

  Cloud SQL handles backups, high availability, and secure connectivity for
  relational database workloads.
---
# Cloud SQL 基础

Cloud SQL 是一项完全托管的关系型数据库服务，支持 MySQL、PostgreSQL 和 SQL Server。它能够自动执行补丁、更新、备份和副本等耗时任务，同时为您的应用提供高性能和高可用性。

## 前提条件

请确保您拥有创建和管理 Cloud SQL 实例所需的 IAM 权限。**Cloud SQL Admin** (`roles/cloudsql.admin`) 角色提供对 Cloud SQL 资源的完整访问权限。

## 快速入门（PostgreSQL）

1.  **启用 API：**
    
    ```bash
    gcloud services enable sqladmin.googleapis.com --quiet
    ```

2.  **创建实例：**
    
    ```bash
    gcloud sql instances create INSTANCE_NAME \
      --database-version=POSTGRES_18 \
      --cpu=2 \
      --memory=7680MiB \
      --region=REGION \
      --quiet
    ```

3.  **为默认用户设置密码：**

    由于这是一个 Cloud SQL for PostgreSQL 实例，因此默认管理员用户是
    `postgres`：
    
    ```bash
    gcloud sql users set-password postgres \
      --instance=INSTANCE_NAME --password=PASSWORD \
      --quiet
    ```

4.  **创建数据库：**
    
    ```bash
    gcloud sql databases create DATABASE_NAME \
      --instance=INSTANCE_NAME \
      --quiet
    ```

5.  **获取实例连接名称：**

    您需要使用实例连接名称（格式为
    `PROJECT_ID:REGION:INSTANCE_NAME`）通过 Cloud SQL Auth
    Proxy 进行连接。使用以下命令获取该名称：
    
    ```bash
    gcloud sql instances describe INSTANCE_NAME \
      --format="value(connectionName)" \
      --quiet
    ```

6.  **连接到实例：**

    必须运行 Cloud SQL Auth Proxy 才能连接到该实例。在另一个终端中，使用连接名称启动代理：
    
    ```bash
    ./cloud-sql-proxy INSTANCE_CONNECTION_NAME
    ```

    代理运行后，在另一个终端中使用 `psql` 进行连接：
    
    ```bash
    psql "host=127.0.0.1 port=5432 user=postgres dbname=DATABASE_NAME password=PASSWORD sslmode=disable"
    ```

## 参考资料目录

-   [核心概念](references/core-concepts.md)：Cloud SQL 版本（Enterprise
    和 Enterprise Plus）、实例架构、读取池、高可用性（HA）
    以及支持的数据库引擎。

-   [CLI 用法](references/cli-usage.md)：用于管理实例、数据库和用户的基本 `gcloud sql` 命令。

-   [客户端库和连接器](references/client-library-usage.md)：
    使用 Python、Java、Node.js 和 Go 连接到 Cloud SQL。

-   [MCP 用法](references/mcp-usage.md)：使用 Cloud SQL 远程 MCP
    服务器和 Gemini CLI 扩展程序。

-   [基础设施即代码](references/iac-usage.md)：用于实例、数据库和用户的 Terraform
    配置。

-   [IAM 和安全性](references/iam-security.md)：预定义角色、SSL/TLS
    证书和 Auth Proxy 配置。

-   [灾难恢复和备份](references/dr-backups.md)：备份类型、
    时间点恢复（PITR）、副本、读取池比较，以及 Enterprise Plus Advanced DR。

*如果你需要这些参考资料中未包含的产品信息，请使用
    Developer Knowledge MCP 服务器的 `search_documents` 工具。*