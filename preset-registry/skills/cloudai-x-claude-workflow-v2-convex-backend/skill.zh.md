---
name: convex-backend
description: Convex backend development guidelines. Use when writing Convex functions, schemas, queries, mutations, actions, or any backend code in a Convex project. Triggers on tasks involving Convex database operations, real-time subscriptions, file storage, or serverless functions.
---
# Convex 后端指南

### 何时加载

- **触发条件**：Convex 特定开发、编写 Convex 函数、schema、query、mutation、action 或实时订阅
- **跳过条件**：项目不使用 Convex 作为后端

使用 TypeScript 构建 Convex 后端的综合指南。涵盖函数语法、validator、schema、query、mutation、action、调度和文件存储。

## 何时应用

在以下情况下参考这些指南：

- 编写新的 Convex 函数（query、mutation、action）
- 定义数据库 schema 和 validator
- 实现实时数据获取
- 设置 cron job 或定时函数
- 使用文件存储
- 设计 API 结构

## 规则类别

| 类别              | 影响程度 | 描述                                      |
| ----------------- | -------- | ----------------------------------------- |
| 函数语法          | 严重     | 使用 args/returns/handler 的新函数语法    |
| Validator         | 严重     | 类型安全的参数和返回值验证                |
| Schema 设计       | 高       | 表定义、index、系统字段                   |
| Query 模式        | 高       | 使用 index 高效获取数据                   |
| Mutation 模式     | 中       | 数据库写入、patch 与 replace              |
| Action 模式       | 中       | 外部 API 调用、Node.js 运行时             |
| 调度              | 中       | Cron 和延迟函数执行                       |
| 文件存储          | 低       | Blob 存储和元数据                         |

## 快速参考

### 函数注册

```typescript
// Public functions (exposed to clients)
import { query, mutation, action } from "./_generated/server";

// Internal functions (only callable from other Convex functions)
import {
  internalQuery,
  internalMutation,
  internalAction,
} from "./_generated/server";
```

### 函数语法（始终使用此语法）

```typescript
export const myFunction = query({
  args: { name: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    return "Hello " + args.name;
  },
});
```

### 常用 Validator

| 类型     | Validator                         | 示例          |
| -------- | --------------------------------- | ------------- |
| 字符串   | `v.string()`                      | `"hello"`     |
| 数字     | `v.number()`                      | `3.14`        |
| 布尔值   | `v.boolean()`                     | `true`        |
| ID       | `v.id("tableName")`               | `doc._id`     |
| 数组     | `v.array(v.string())`             | `["a", "b"]`  |
| 对象     | `v.object({...})`                 | `{name: "x"}` |
| 可选值   | `v.optional(v.string())`          | `undefined`   |
| 联合类型 | `v.union(v.string(), v.number())` | `"x"` 或 `1`  |
| 字面量   | `v.literal("status")`             | `"status"`    |
| Null     | `v.null()`                        | `null`        |

### 函数引用

```typescript
// Public functions
import { api } from "./_generated/api";
api.example.myQuery; // convex/example.ts → myQuery

// Internal functions
import { internal } from "./_generated/api";
internal.example.myInternalMutation;
```

### 使用索引查询

```typescript
// Schema
messages: defineTable({...}).index("by_channel", ["channelId"])

// Query
await ctx.db
  .query("messages")
  .withIndex("by_channel", (q) => q.eq("channelId", channelId))
  .order("desc")
  .take(10);
```

### 关键规则

1. 所有函数都**必须包含 `args` 和 `returns` 校验器**
2. **使用 `v.null()` 表示无返回值**——绝不能省略返回值校验器
3. **使用 `withIndex()` 而不是 `filter()`**——在 schema 中定义索引
4. **对私有函数使用 `internalQuery/Mutation/Action`**
5. **Action 不能访问 `ctx.db`**——改用 runQuery/runMutation
6. 在同一文件中调用函数时，**包含类型注解**

## 完整编译文档

有关包含所有规则和详细代码示例的完整指南，请参阅 [AGENTS.md](AGENTS.md)。