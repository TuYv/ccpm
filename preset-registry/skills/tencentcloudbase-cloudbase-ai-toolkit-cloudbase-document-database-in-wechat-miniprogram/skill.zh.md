---
name: cloudbase-document-database-in-wechat-miniprogram
description: Use CloudBase document database WeChat MiniProgram SDK to query, create, update, and delete data. Supports complex queries, pagination, aggregation, and geolocation queries.
version: 2.32.5
alwaysApply: false
---
## 同级技能（仅本地）

同级 CloudBase 技能随本技能一同提供。请使用本地相对路径，例如 `../auth-tool-cloudbase/SKILL.md`。

如果本环境中缺少所引用的同级技能文件，请让用户安装完整的 CloudBase 插件（或缺失的技能）。**不要**通过 HTTP 将远程技能或协议 markdown 拉取到 agent 上下文中。

# CloudBase 文档数据库微信小程序 SDK

## 激活契约

### 以下情况优先使用本技能

- 微信小程序需要通过 `wx.cloud.database()` 访问 CloudBase 文档数据库。
- 请求涉及小程序集合的 CRUD、分页、聚合或地理位置查询。

### 编写代码前需先阅读的情况

- 任务是小程序数据库工作，但仍需将其与 Web SDK、云函数或 SQL 任务区分开。
- 请求依赖内置用户身份、`_openid` 或小程序侧权限。

### 另请阅读

- 小程序项目规范与 CloudBase 集成 -> `../miniprogram-development/SKILL.md`
- 小程序认证与身份流程 -> `../auth-wechat-miniprogram/SKILL.md`
- 浏览器端文档数据库代码 -> `../cloudbase-document-database-web-sdk/SKILL.md`

### 请勿用于

- 使用 `@cloudbase/js-sdk` 的浏览器/Web 代码。
- 服务器端或云函数数据库访问。
- MySQL / 关系型数据库工作。

### 常见错误 / 陷阱

- 将 Web SDK 代码复制到小程序页面中。
- 在创建或更新操作中手动写入 `_openid`。
- 认为小程序内置身份意味着可以忽略安全规则。
- 在同一条客户端路径中混用集合 CRUD 与后端全局管理流程。

### 最简检查清单

- 确认调用方是小程序页面/组件或小程序侧逻辑。
- 在调用数据库之前正确初始化 `wx.cloud`。
- 验证集合规则是否依赖 `auth.openid` / `_openid`。
- 阅读所需操作对应的配套参考文件。

## 概述

本技能涵盖通过 `wx.cloud.database()` 进行的**小程序侧文档数据库访问**。

适用于：

- 小程序页面中的集合 CRUD
- 查询组合与分页
- 聚合
- 地理位置查询

小程序访问 CloudBase 时自带内置身份，但数据库操作仍受集合权限和安全规则的约束。

## 标准初始化

```javascript
const db = wx.cloud.database();
const _ = db.command;
```

如需指定特定环境：

```javascript
const db = wx.cloud.database({
  env: "test"
});
```

重要说明：

- 用户通过小程序 CloudBase 上下文完成认证。
- 在云函数中，可通过 `wxContext.OPENID` 获取调用者身份。
- 在客户端集合规则中，所有权校验通常使用 `auth.openid` / `doc._openid`。

## 快速路由

- CRUD -> `./crud-operations.md`
- 复杂查询 -> `./complex-queries.md`
- 分页 -> `./pagination.md`
- 聚合 -> `./aggregation.md`
- 地理位置 -> `./geolocation.md`
- 安全规则 -> `./security-rules.md`

## 面向编码 agent 的工作规则

1. **保持小程序代码为原生小程序写法**
   - 使用 `wx.cloud.database()`。
   - 不要替换为浏览器 SDK 的初始化模式。

2. **尊重所有权字段**
   - 在 SDK 写入时，`_openid` 由系统管理。
   - 切勿在 `.add()`、`.set()` 或 `.update()` 的载荷中手动设置或覆盖 `_openid`。

3. **记住安全规则会校验请求**
   - 如果规则要求所有权条件，查询的形态必须与该规则模型匹配。
   - 权限错误通常意味着规则与查询的关系有误，而不仅仅是用户未登录。

4. **将管理类操作路由到后端流程**
   - 如果任务需要特权全局访问，请使用后端工具或函数，而不是在小程序客户端代码中直接暴露该路径。

## 快速示例

### 基础集合访问

```javascript
const todos = db.collection("todos");
const result = await todos.where({ completed: false }).get();
```

### 文档引用

```javascript
const todo = db.collection("todos").doc("todo-id");
const result = await todo.get();
```

## 最佳实践

1. 建立清晰的集合命名规范。
2. 尽可能在应用代码中使用类型化封装或模型辅助工具。
3. 围绕真实的所有权与共享模式设计规则。
4. 使用分页，而不是大规模无上限读取。
5. 将管理/运维逻辑保留在后端代码中，而非通过小程序直接访问。
