---
name: sync-guide
description: Comprehensive guide to building Notion Workers syncs — covers the two-sync architecture (backfill+delta), replace mode, pagination, consistency buffers, pacers, deletion strategies, and common pitfalls. Auto-loads when sync-related work is detected.
user-invocable: false
---
## 什么是同步？

同步是一个周期性运行的 `execute` 函数，它返回数据变更以填充 Notion 数据库。运行时会循环调用 `execute`：

```ts
const db = worker.database("myDb", {
  type: "managed",
  initialTitle: "My Data",
  primaryKeyProperty: "ID",
  schema: {
    properties: {
      Name: Schema.title(),
      ID: Schema.richText(),
    },
  },
})

worker.sync("mySync", {
  database: db,
  execute: async (state, { notion }) => ({
    changes: [
      {
        type: "upsert",
        key: "1",
        properties: {
          Name: Builder.title("Item 1"),
          ID: Builder.richText("1"),
        },
      },
    ],
    hasMore: false,
    nextState: undefined,
  }),
})
```

每次调用都会返回 `{ changes, hasMore, nextState }`。如果 `hasMore` 为 `true`，运行时会使用 `nextState` 再次调用 `execute`。此过程会一直持续到 `hasMore` 为 `false`，从而完成一个**周期**。下一个周期会按照计划的时间间隔开始，并使用上一周期结束时的状态。

**导入：**

```ts
import { Worker } from "@notionhq/workers"
import * as Builder from "@notionhq/workers/builder"
import * as Schema from "@notionhq/workers/schema"
```

## 决策框架

### 第 1 步：选择架构

决定因素是 **API 能力和数据集大小**。分为两个层级：

| 条件                                                              | 架构                                                               |
| ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| 小型数据源（少于 1,000 条记录）或没有变更跟踪能力的 API           | **简单替换同步**——一个同步，`mode: "replace"`                      |
| 其他所有情况（API 支持 `updated_at`、变更数据流、事件）           | **回填 + 增量组合**——两个同步写入同一个数据库                      |

**简单替换同步**：一个同步在每个周期返回完整数据集。在最终返回 `hasMore: false` 后，所有未出现的记录都会被自动删除。适用于数据集足够小、可以完整重新获取的情况。

**回填 + 增量组合**：两个同步共享一个数据库。**回填同步**（`mode: "replace"`、`schedule: "manual"`）在触发时重新获取所有数据。**增量同步**（`mode: "incremental"`、频繁调度）仅获取自上次运行以来发生的变更。这种方式可以清晰地分离关注点——无需双模式状态机，也不会出现从回填切换到增量时的错误。

在开始回填之前初始化增量游标。当两个同步都可以写入同一条记录时，在每次 upsert 中包含 `upstreamUpdatedAt`，这样过时的回填响应就无法覆盖更新的增量响应。

### 第 2 步：了解 API 的分页机制

大多数 API 都要求对结果进行分页。每批返回约 100 个变更。在一次 `execute` 调用中返回过多变更会导致失败。

**回填分页**（加载完整数据集）：

1. **不透明游标令牌**——GraphQL `endCursor`、Stripe `starting_after`
2. **页码 / 偏移量**——`?page=N&limit=100`
3. **键集（时间戳 + id）**——`WHERE created_at > X OR (created_at = X AND id > Y)`——对于按时间戳排序的可变数据，这是黄金标准

**增量分页**（仅加载变更，增量模式）：

1. **时间戳游标** — `?updated_since=<cursor>`，并使用一致性缓冲区
2. **基于 updated_at + id 的键集分页** — 在修改时间戳上使用相同的键集分页模式
3. **事件/变更日志流** — `GET /events?after=<eventId>`
4. **使用相同的不透明游标** — 当 API 按 `updated_at` 排序时，回填游标也适用于增量同步

### 第 3 步：一致性缓冲区（增量同步）

API 往往是最终一致的。刚刚写入或更新的记录可能不会立即出现在查询结果中。由于游标在增量模式下永不重置，如果游标越过了一条尚未建立索引的记录，该记录将被永久跳过。让游标比“当前时间”滞后 10-60 秒：

```ts
const bufferMs = 15_000
const maxCursor = new Date(Date.now() - bufferMs).toISOString()
function minTimestamp(a: string, b: string): string {
  return Date.parse(a) <= Date.parse(b) ? a : b
}

const nextCursor =
  records.length > 0 ? minTimestamp(lastRecord.updatedAt, maxCursor) : maxCursor
```

### 第 4 步：删除策略

1. **回填同步（替换模式）**：无需额外处理 — 每个周期都会自动删除未出现的记录。当 API 不提供删除信号时，这是处理删除的主要机制。
2. **带删除 API 的增量同步**：发出 `{ type: "delete", key }` 标记。如果删除信号来自单独的端点（审计日志、归档筛选器），请使用**交替模式**：运行主增量流直至追平（`hasMore: false`），然后切换到删除流运行一个周期，再切换回来。两个游标各自独立持久化到状态中。
3. **无删除 API、数据集较大**：依靠回填同步在替换模式下执行的标记清除。手动触发回填，或按较低频率的计划运行，以清理陈旧记录。

## 替换模式

很简单：获取所有内容，将其全部返回，再由运行时处理删除。对于小型数据源，可将其用作独立同步；也可将其作为“回填 + 增量”组合中的回填部分。

```ts
const db = worker.database("records", {
  type: "managed",
  initialTitle: "Records",
  primaryKeyProperty: "ID",
  schema: {
    properties: { Name: Schema.title(), ID: Schema.richText() },
  },
})

const apiPacer = worker.pacer("myApi", {
  allowedRequests: 10,
  intervalMs: 1000,
})

worker.sync("recordsBackfill", {
  database: db,
  mode: "replace",
  schedule: "manual", // trigger manually or on a slow schedule
  execute: async (state) => {
    const page = state?.page ?? 1
    await apiPacer.wait()
    const { items, totalPages } = await fetchPage(page, 100)
    const hasMore = page < totalPages
    return {
      changes: items.map((item) => ({
        type: "upsert" as const,
        key: item.id,
        properties: {
          Name: Builder.title(item.name),
          ID: Builder.richText(item.id),
        },
      })),
      hasMore,
      nextState: hasMore ? { page: page + 1 } : undefined,
    }
  },
})
```

完整的可运行示例请参阅 `examples/replace-simple.ts` 和 `examples/replace-paginated.ts`。

## 增量模式（差量同步）

差量同步仅获取自上次运行以来发生的变更。当它与同一数据库上的替换模式回填同步配合使用时，可取代旧的双模态单同步模式。

```ts
// Reuses the same `db` and `apiPacer` from above

worker.sync("recordsDelta", {
  database: db,
  mode: "incremental",
  schedule: "5m",
  execute: async (state: { cursor: string } | undefined) => {
    const cursor = state?.cursor ?? new Date(0).toISOString()
    const bufferTs = new Date(Date.now() - 15_000).toISOString()

    await apiPacer.wait()
    // fetchChanges must apply bufferTs as an upstream upper bound.
    const { items, nextCursor } = await fetchChanges(cursor, bufferTs)
    const done = !nextCursor

    return {
      changes: items.map(toUpsert),
      hasMore: !done,
      nextState: {
        // This example assumes nextCursor is an ISO timestamp. Opaque cursors
        // must not be compared with the timestamp buffer.
        cursor: done
          ? minTimestamp(nextCursor ?? cursor, bufferTs)
          : nextCursor,
      },
    }
  },
})
```

**要点：**

- 差量同步的状态很简单——只有一个游标。不需要区分阶段。
- 回填同步（替换模式）负责初始全量加载以及定期清理已删除的记录。
- 两种同步都通过共享的 `db` 句柄写入同一个数据库。
- 两种同步共享同一个节流器——服务器会均匀分配预算。

完整模式请参阅 `examples/incremental-basic.ts`、`examples/incremental-bimodal.ts` 和 `examples/incremental-events.ts`。

## 模式参考

使用 `Schema` 类型定义 Notion 数据库结构，并使用 `Builder` 构建值：

| 模式类型                         | 构建器值                                   | 说明                                                                                                                                                                                        |
| -------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Schema.title()`                 | `Builder.title("text")`                    | 主要显示字段。每个模式必须有且仅有一个。                                                                                                                                                    |
| `Schema.richText()`              | `Builder.richText("text")`                 | 文本内容、ID                                                                                                                                                                                |
| `Schema.url()`                   | `Builder.url("https://...")`               | URL 字段                                                                                                                                                                                    |
| `Schema.email()`                 | `Builder.email("a@b.com")`                 | 电子邮件字段                                                                                                                                                                                |
| `Schema.phoneNumber()`           | `Builder.phoneNumber("+1...")`             | 电话字段                                                                                                                                                                                    |
| `Schema.checkbox()`              | `Builder.checkbox(true)`                   | 布尔值                                                                                                                                                                                      |
| `Schema.file()`                  | `Builder.file("https://...", "name")`      | 文件 URL + 可选显示名称                                                                                                                                                                     |
| `Schema.number()`                | `Builder.number(42)`                       | 数字。可选格式：`Schema.number("percent")`                                                                                                                                                   |
| `Schema.date()`                  | `Builder.date("2024-01-15")`               | 日期（YYYY-MM-DD）。另请参阅：`Builder.dateTime("2024-01-15T10:30:00Z")`、`Builder.dateRange(start, end)`                                                                                    |
| `Schema.select([...])`           | `Builder.select("Option A")`               | 单选。定义选项：`Schema.select([{ name: "A" }, { name: "B" }])`。**选项的 `name` 值不能为空**——不支持 `Schema.select([])` 和 `{ name: "" }`。                                                |
| `Schema.multiSelect([...])`      | `Builder.multiSelect("A", "B")`            | 多选                                                                                                                                                                                        |
| `Schema.status(...)`             | `Builder.status("Done")`                   | 带分组的状态                                                                                                                                                                                |
| `Schema.people()`                | `Builder.people("email@co.com")`           | 通过电子邮件指定人员                                                                                                                                                                        |
| `Schema.place()`                 | `Builder.place({ lat: 40.7, lon: -74.0 })` | 地理位置                                                                                                                                                                                    |
| `Schema.relation("databaseKey")` | `[Builder.relation("pk")]`                 | 与另一个托管数据库的关联。值为**数组**。                                                                                                                                                    |

关联使用相关数据库的键。双向关联的配置方式相同：

```ts
Schema.relation("otherDatabase", {
  twoWay: true,
  relatedPropertyName: "Back Link",
})
```

行级图标和页面内容：

```ts
changes: [
  {
    type: "upsert",
    key: "1",
    properties: {
      Name: Builder.title("Example"),
      // ... other properties ...
    },
    icon: Builder.emojiIcon("🎯"), // or Builder.notionIcon("rocket", "blue")
    pageContentMarkdown: "## Details\nSome text", // Markdown body for the page
  },
]
```

## 常见错误

1. **未使用节流器** — `execute` 中的每次 API 调用之前都应执行 `await apiPacer.wait()`。否则，同步会触发速率限制并失败。
2. **增量同步中缺少一致性缓冲区** — 对于采用最终一致性的 API，游标会永久跳过尚未建立索引的记录。
3. **未进行分页** — 一次返回过多变更。建议从每批约 100 条开始。
4. **对大型数据集使用替换模式** — 如果 API 支持变更跟踪，应将替换模式的回填同步与增量同步配合使用，而不是每个周期都重新获取所有数据。
5. **游标没有推进** — 会导致无限循环。确保每次迭代之间 `nextState` 都会发生变化。
6. **忘记处理首次运行** — 首次调用时，`state` 为 `undefined`。请使用 `state?.cursor ?? null`。
7. **忘记回填同步和增量同步共用一个数据库** — 两种同步必须使用同一个 `worker.database()` 句柄，以及相同的键和属性结构。
8. **未触发回填同步** — 配置了 `schedule: "manual"` 的回填同步不会自动运行。请在部署时触发它，或定期触发以清理已删除的记录。
9. **空的选择值** — `Schema.select()` 要求至少有一个选项具有非空的 `name`。不支持 `Schema.select([])` 和 `{ name: "" }`。

## 用于同步开发的 CLI 命令

```shell
# Deploy
ntn workers deploy

# Preview (test without writing)
ntn workers sync trigger <key> --preview
ntn workers sync trigger <key> --preview --context '<json>'  # continue pagination

# Trigger a sync run
ntn workers sync trigger <key>

# Check sync status
ntn workers sync status

# View run logs
ntn workers runs list
ntn workers runs list --plain | head -n1 | cut -f1 | xargs -I{} ntn workers runs logs {}

# Reset state (full re-backfill)
ntn workers sync state reset <key>

# Manage secrets
ntn workers env set KEY=value
ntn workers env push
```

## API 模式参考

有关源自 Salesforce、Stripe、HubSpot、GitHub 和 ServiceNow 生产环境同步的详细策略，请参阅 [api-pagination-patterns.md](./api-pagination-patterns.md)。