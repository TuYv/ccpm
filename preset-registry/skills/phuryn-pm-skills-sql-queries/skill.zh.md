---
name: sql-queries
description: "Generate SQL queries from natural language descriptions. Supports BigQuery, PostgreSQL, MySQL, and other dialects. Reads database schemas from uploaded diagrams or documentation. Use when writing SQL, building data reports, exploring databases, or translating business questions into queries."
---
# SQL 查询生成器

## 目的
将自然语言需求转换为适用于多个数据库平台的优化 SQL 查询。此技能帮助产品经理、分析师和工程师无需手动处理语法即可生成准确的查询。

## 工作原理

### 步骤 1：了解您的数据库架构
- 如果您提供架构文件（SQL、文档或图表描述），我会读取并分析它
- 提取表名、列定义、数据类型和关系
- 识别主键、外键和索引策略

### 步骤 2：处理您的请求
- 明确您需要检索或分析的确切数据
- 确认 SQL 方言（BigQuery、PostgreSQL、MySQL、Snowflake 等）
- 询问其他要求（筛选条件、聚合、排序）

### 步骤 3：生成优化查询
- 编写能够利用数据库结构的高效 SQL
- 添加注释以解释复杂逻辑
- 针对大型数据集补充性能方面的考量
- 在适用时提供替代方案

### 步骤 4：解释并测试
- 使用通俗易懂的英语解释查询逻辑
- 建议如何测试或验证结果
- 提供性能优化方面的建议
- 如果您愿意，可以生成测试脚本或示例数据

## 使用示例

**示例 1：根据架构文件生成查询**
```
Upload your database_schema.sql file and say:
"Generate a query to find users who signed up in the last 30 days
and had at least 5 active sessions"
```

**示例 2：根据图表描述生成查询**
```
"Here's my database: Users table (id, email, created_at), Sessions table
(id, user_id, timestamp, duration). Generate a query for average session
duration per user in January 2026."
```

**示例 3：复杂分析查询**
```
"Create a BigQuery query to analyze our revenue by region and customer tier,
including year-over-year growth rates."
```

## 核心能力

- **多方言支持**：支持 BigQuery、PostgreSQL、MySQL、Snowflake、SQL Server
- **文件读取**：读取架构文件、SQL 转储文件和数据文档
- **查询优化**：建议索引、分区和性能改进方案
- **查询解释**：拆解查询，便于学习和文档编写
- **测试**：可以生成测试查询和示例数据脚本
- **脚本执行**：为您的数据库创建可执行的 SQL 脚本

## 获得最佳结果的提示

1. **提供上下文**：分享您的数据库架构或结构
2. **明确具体要求**：清晰描述您需要的数据以及任何筛选条件
3. **说明数据库**：指定您使用的 SQL 方言
4. **包含约束条件**：说明数据量、时间范围和性能需求
5. **指定输出格式**：如果需要特定输出，请说明查询结果的格式

## 输出格式

您将获得：
- **SQL 查询**：包含注释、可用于生产环境的 SQL 代码
- **解释**：查询的作用及其工作方式
- **性能说明**：优化建议和注意事项
- **测试脚本**（如果请求）：示例数据和验证查询

---

### 延伸阅读

- [产品分析实战指南：面向产品经理的 AARRR、HEART、用户群组与漏斗](https://www.productcompass.pm/p/the-product-analytics-playbook-aarrr)
- [如何成为精通技术的产品经理](https://www.productcompass.pm/p/how-to-become-a-technology-literate)