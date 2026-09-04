---
name: relational-database-web-cloudbase
description: "[Deprecated] Use when building frontend Web apps that talk to CloudBase Relational Database via @cloudbase/js-sdk – provides the canonical init pattern so you can then use Supabase-style queries from the browser. New environments should use PostgreSQL with app.rdb() — see postgresql-development skill instead."
version: 2.32.5
alwaysApply: false
metadata:
  priority: "5"
  deprecated: "true"
---
## 同级技能（仅限本地）

同级 CloudBase 技能随本技能一同发布。请使用本地相对路径，例如 `../auth-tool-cloudbase/SKILL.md`。

如果本环境中缺少所引用的同级技能文件，请让用户安装完整的 CloudBase 插件（或缺失的技能）。**不要**通过 HTTP 拉取远程技能或协议 markdown 到智能体上下文中。

# CloudBase 关系型数据库 Web SDK

## 激活契约

### 优先使用本技能的情况

- 浏览器或 Web 应用需要通过 `@cloudbase/js-sdk` 访问 CloudBase 关系型数据库。
- 任务专门涉及前端初始化和浏览器端查询的使用。

### 若满足以下条件，请在编写代码前先阅读

- 你需要区分浏览器 SDK 用法与 MCP 数据库管理或后端 Node 访问。
- 请求中提到了 Supabase 迁移、前端共享数据库客户端或浏览器端表查询。

### 之后还应阅读

- MySQL SQL 管理和 MCP 操作 -> `../relational-database-mcp-cloudbase/SKILL.md`
- Web 认证/登录 -> `../auth-web-cloudbase/SKILL.md`
- 常规 Web 应用搭建 -> `../web-development/SKILL.md`

### 请勿用于

- 基于 MCP 的 SQL 开通、schema 变更或权限管理。
- 后端/Node 服务访问。
- 文档数据库操作。

### 常见错误 / 易错点

- 在 MCP 管理流程中初始化 SDK。
- 把 `app` 本身当作关系型数据库客户端。
- 在每个组件中重复初始化 CloudBase。
- 将前端浏览器访问与管理员式的 schema 变更混在一起。

### 最简检查清单

- 确认调用方是 Web 前端。
- 保持一个共享的 CloudBase 应用和一个共享的关系型数据库客户端。
- 将 MySQL 开通/schema 相关工作交给 `relational-database-mcp-cloudbase`。如果任务提到 PostgreSQL、CloudBase PG、PG 模式、`app.rdb()`、`queryPgDatabase`、`managePgDatabase` 或 RLS，则改为交给 `postgresql-development-cloudbase`。
- 在访问数据之前单独处理认证。

## 概述

本技能为 CloudBase 关系型数据库标准化了**浏览器端初始化模式**。

初始化完成后，使用 `db` 配合 Supabase 风格的查询模式。

## 安装

```bash
npm install @cloudbase/js-sdk
```

## 规范初始化

```javascript
import cloudbase from "@cloudbase/js-sdk";

const app = cloudbase.init({
  env: "your-env-id"
});

const auth = app.auth;
// Handle login separately

const db = app.rdb();
```

## 初始化规则

- 同步初始化。
- 除非框架绝对需要，否则不要使用 `import("@cloudbase/js-sdk")` 惰性加载 SDK。
- 创建一个共享的 `db` 客户端并复用它。
- 不要编造不受支持的 `cloudbase.init()` 选项。

## 快速路由

### 在以下情况使用本技能

- 你正在将浏览器组件连接到关系型表
- 你正在用 CloudBase 替换 Supabase 浏览器客户端
- 你需要一个规范的前端共享 `db` 客户端

### 在以下情况改用 `relational-database-mcp-cloudbase`

- 你需要创建/销毁 MySQL
- 你需要进行 MySQL DDL 或写入 SQL 管理
- 你需要通过 MCP 检查或修改 MySQL 表安全规则

### 在以下情况改用 `postgresql-development-cloudbase`

- 任务提到 PostgreSQL、CloudBase PG、PG 模式、`app.rdb()`、`queryPgDatabase`、`managePgDatabase`、PostgREST 或 RLS
- 浏览器端表代码必须使用 PG 语义，而不是旧版 NoSQL / MySQL 管理工具

## 示例：前端共享数据库客户端

```javascript
import cloudbase from "@cloudbase/js-sdk";

const app = cloudbase.init({
  env: "your-env-id"
});

export const db = app.rdb();
```

## 示例：Supabase 风格查询

```javascript
const { data, error } = await db
  .from("posts")
  .select("*")
  .order("created_at", { ascending: false });

if (error) {
  console.error("Failed to load posts", error.message);
}
```

## 示例：插入 / 更新 / 删除

```javascript
await db.from("posts").insert({ title: "Hello" });
await db.from("posts").update({ title: "Updated" }).eq("id", 1);
await db.from("posts").delete().eq("id", 1);
```

## 核心原则

- `app.rdb()` 为你提供关系型数据库客户端。
- 在此之后，使用 Supabase 风格的查询知识进行表操作。
- 将 schema 管理和特权管理保留在浏览器代码之外。
