---
name: Generating Database Seed Data
description: |
  This skill enables Claude to generate realistic test data and database seed scripts for development and testing environments. It uses Faker libraries to create realistic data, maintains relational integrity, and allows configurable data volumes. Use this skill when you need to quickly populate a database with sample data for development, testing, or demonstration purposes. The skill is triggered by phrases like "seed database", "generate test data", "create seed script", or "populate database with realistic data".
---
## 概述

此技能可自动创建数据库种子脚本，使用真实且一致的测试数据填充数据库。它利用 Faker 库生成多样且可信的数据，确保关系完整性并支持配置数据量。

## 工作原理

1. **分析架构**：Claude 会分析数据库架构，以了解表结构和关系。
2. **生成数据**：Claude 使用 Faker 库为每张表生成真实的数据，并遵循数据类型和约束。
3. **维护关系**：Claude 会确保维护外键关系，在各表之间创建一致且有效的数据。
4. **创建种子脚本**：Claude 会生成包含所生成数据的数据库种子脚本（例如 SQL、JavaScript）。

## 何时使用此技能

当你需要执行以下操作时，此技能会被激活：
- 使用真实数据填充开发数据库。
- 为自动化数据库设置创建种子脚本。
- 为应用程序测试生成测试数据。
- 使用预填充数据演示应用程序。

## 示例

### 示例 1：填充用户数据库

用户请求：“创建一个种子脚本，使用 50 个真实用户填充我的 users 表。”

此技能将会：
1. 分析 'users' 表架构（姓名、电子邮件、密码等）。
2. 使用 Faker 库生成 50 组真实的用户数据。
3. 创建一个 SQL 种子脚本，将生成的用户数据插入到 'users' 表中。

### 示例 2：为博客数据库添加种子数据

用户请求：“为我的博客数据库生成测试数据，包括文章、评论和用户。”

此技能将会：
1. 分析 'posts'、'comments' 和 'users' 表架构及其关系。
2. 为每张表生成真实数据，确保维护外键关系（例如，评论关联到文章，文章关联到用户）。
3. 创建一个种子脚本（例如使用 TypeORM 的 JavaScript），将生成的数据插入数据库。

## 最佳实践

- **数据量**：从较小的数据量开始，逐步增加，以避免性能问题。
- **数据一致性**：确保所使用的 Faker 库适用于数据库要求的数据类型和格式。
- **幂等性**：将种子脚本设计为幂等的，以便能够多次运行而不会导致错误或重复数据。

## 集成

此技能可与数据库迁移工具和框架良好集成，使你能够自动化整个数据库设置流程，包括架构创建和数据播种。它还可以与测试框架结合使用，为自动化测试生成真实的测试数据。