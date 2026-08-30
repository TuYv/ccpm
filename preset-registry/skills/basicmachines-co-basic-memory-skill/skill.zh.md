---
name: basic-memory
description: Use the Basic Memory knowledge graph for persistent memory across sessions. Search before answering; capture decisions, meetings, and insights as notes.
category: memory
---
# Basic Memory 知识图谱

你可以访问由 Basic Memory 支持的持久化知识图谱。该图谱会跨会话保留，并与其他工具（Claude Desktop、Obsidian、`bm` CLI）共享。使用下面的 `bm_*` 工具来回忆和记录信息。

## 使用 `bm_*`，而不是 `bm` CLI

**始终直接调用 `bm_*` 工具。不要通过 shell 调用 `bm` CLI 来执行笔记操作。**

`bm_*` 工具通过持久化的 MCP 连接路由——每次调用大约耗时 0.1 秒。通过 shell 运行 `bm` 时，每次调用都会启动一个全新的 Python 进程（每次冷启动需要 1–2 秒），并绕过 Hermes 的自动逐轮记录功能，因此会话转录和摘要笔记不会反映你的操作。

当你确实需要这些封装器未提供的功能时（这种情况很少见），可以使用 CLI。除此之外，优先使用：

| 使用场景 | 工具（而不是 CLI） |
|---|---|
| 搜索图谱 | `bm_search` |
| 读取笔记 | `bm_read` |
| 创建 / 更新笔记 | `bm_write` / `bm_edit` |
| 导航关系 | `bm_context` |
| 移动 / 删除 | `bm_move` / `bm_delete` |
| 查看最近操作的内容 | `bm_recent` |
| 列出可用项目 | `bm_projects` |
| 列出云工作区 | `bm_workspaces` |

## 工具参考

### `bm_search` — 搜索图谱
在回答有关过往决策、项目、会议或任何可能已有记录的问题之前，使用此工具。

```
bm_search({ query: "auth strategy decision", limit: 5 })
```

### `bm_read` — 获取笔记的完整内容
搜索显示相关笔记后，读取该笔记以获取上下文。

```
bm_read({ identifier: "decisions/auth-strategy" })
bm_read({ identifier: "memory://projects/api-redesign" })
```

### `bm_context` — 通过 memory:// URL 导航
返回目标笔记以及通过遍历关系找到的相关笔记。

```
bm_context({ url: "memory://projects/api-redesign", depth: 1 })
```

### `bm_write` — 记录新知识
当用户分享值得保留的决策、会议结果或洞见时，将其记录下来。使用清晰的标题和文件夹。

```
bm_write({
  title: "API Authentication Decision",
  folder: "decisions",
  content: "# API Authentication\n\n## Context\n...\n\n## Decision\n..."
})
```

推荐的文件夹：`projects/`、`decisions/`、`meetings/`、`concepts/`、`weekly/`。

### `bm_edit` — 增量更新

操作：`append`、`prepend`、`find_replace`（需要 `find_text`）、`replace_section`（需要 `section`）。

```
bm_edit({
  identifier: "projects/api-redesign",
  operation: "append",
  content: "\n## Update 2026-05-09\nDeployed to staging."
})
```

### `bm_delete` / `bm_move` — 维护
谨慎使用。`bm_move` 接受 `new_folder`。

### `bm_recent` — 查看最近操作的内容
返回指定时间范围内更新过的笔记。当还没有具体查询时使用，例如：“我昨天在做什么？”

```
bm_recent({ timeframe: "7d" })
bm_recent({ timeframe: "yesterday", limit: 20 })
bm_recent({ timeframe: "2 weeks", type: "entity" })
```

`timeframe` 接受自然语言（`"yesterday"`、`"2 weeks"`、`"last month"`）或简写格式（`"7d"`、`"24h"`）。默认值为 `7d`。

### `bm_projects` — 列出可用项目
返回本地和云端每个项目的名称、工作区 slug 和 `external_id`（UUID）。当用户提到的项目不是当前活动项目时调用此工具。后续工具调用可通过工作区限定名称（`project: "personal/main"`）或 UUID（`project_id: "bf2a4c1e-d77f-..."`）进行路由——参见下方的跨项目路由。

```
bm_projects()
```

### `bm_workspaces` — 列出 BM Cloud 工作区
工作区是 BM Cloud 的概念。返回名称、类型、角色和默认标志。当同一个项目名称可能存在于多个工作区中且需要消除歧义时，与 `bm_projects` 配合使用。

```
bm_workspaces()
```

## 永久链接

永久链接是笔记规范且适合 URL 的标识符。共有三种形式；读写工具均接受这三种形式：

| 形式 | 示例 | 使用时机 |
|---|---|---|
| **简短** | `decisions/auth-strategy` | 裸 `folder/note-slug`。工具需要 `project`（或 `project_id`）参数进行路由——仅凭永久链接还不够。 |
| **项目限定** | `main/decisions/auth-strategy` | `project-name/folder/note-slug`。包含足够的上下文信息，无需单独的 `project` 参数即可进行路由。 |
| **工作区限定** | `personal/main/decisions/auth-strategy` | `workspace-slug/project-name/folder/note-slug`。包含完整路由信息，即使跨云工作区中存在同名项目也可以正常路由。 |

**重要：`bm_write` 返回的永久链接已经编码了后续读取所需的路由信息。** 如果你使用 `project="personal/main"` 进行写入，会得到 `personal/main/folder/note-slug`，随后可以调用 `bm_read({ identifier: <that permalink> })`，无需提供 `project` 参数。该永久链接会自动进行路由。

`memory://` URL 遵循相同的形式：`memory://personal/main/decisions/auth-strategy` 有效。对于 `bm_read`，`memory://` 前缀是可选的（上述三种永久链接形式中的任意一种都可以直接使用）；`bm_context` 则要求该前缀。

## 跨项目路由

每个读写工具（`bm_search`、`bm_read`、`bm_write`、`bm_edit`、`bm_context`、`bm_delete`、`bm_move`、`bm_recent`）都接受可选的 `project` 和 `project_id`：

- `project` — 项目名称，可选择包含工作区限定。名称全局唯一时使用普通形式（`"main"`）；当需要通过 slug 选择特定的云工作区时，使用限定形式（`"personal/main"`、`"team-paul/research"`）。
- `project_id` — 来自 `bm_projects` 的 UUID（`external_id` 字段）。这是最稳定的标识符——项目重命名后仍然有效，并且无需限定即可跨工作区使用。如果同时传入两者，`project_id` 优先于 `project`。
- 两者都省略时，调用将使用 Hermes 配置的当前活动项目。

```
# 普通项目名称（唯一）
bm_write({ title: "...", folder: "...", content: "...", project: "main" })

# 工作区限定名称（消除跨工作区同名项目的歧义）
bm_write({ title: "...", folder: "...", content: "...", project: "personal/main" })

# UUID（最稳定，项目重命名后仍然有效）
bm_write({ title: "...", folder: "...", content: "...", project_id: "bf2a4c1e-d77f-..." })
```

`bm_projects` 和 `bm_workspaces` 本身**不接受路由参数**——它们会跨所有内容列出结果。

## 配方：将现有文件写入特定项目

当用户提出类似 *“将这个 markdown 文件保存到我的个人 `main` 项目中，并返回永久链接”* 的请求时：

1. **发现项目。** 调用 `bm_projects()`，查找与用户描述的项目和工作区匹配的条目。你可以通过工作区限定名称（`personal/main`）或 UUID（`external_id`）进行路由。

   ```
   bm_projects()
   # → [{name: "main", external_id: "bf2a4c1e-d77f-4b7a-9c3e-5d8a1f0e2b6d", workspace: "Personal", ...}, ...]
   ```

   如果某个项目名称出现在多个工作区中，请使用 `bm_workspaces()` 确认需要使用哪个 slug。

2. **从磁盘读取文件。** 使用 Hermes 的文件系统工具（而不是 `bm_*` 工具——本地文件尚未位于图谱中）。

3. **使用显式路由写入笔记。** 两种形式均可；工作区限定名称在日志中更易读，UUID 则更持久。

   ```
   bm_write({
     title: "StartWithDrew Level 9 Task Queue",
     folder: "startwithdrew",
     content: <file body>,
     project: "personal/main"
   })
   # → returns "personal/main/startwithdrew/start-with-drew-level-9-task-queue"
   # (the returned permalink is workspace-qualified — carries its own routing)
   ```

4. **通过重新读取进行验证。** 不需要 `project` 参数——工作区限定的永久链接会自行进行路由。

   ```
   bm_read({ identifier: "personal/main/startwithdrew/start-with-drew-level-9-task-queue" })
   ```

向用户返回永久链接（并提供项目名称以便明确）。

## 何时使用各工具

| 情况 | 工具 |
|---|---|
| 用户询问的主题可能已经有相关文档 | 先使用 `bm_search`，然后使用 `bm_read` |
| 用户提出一个决策、计划或会议结果 | 提议使用 `bm_write` |
| 更新已有内容 | `bm_edit`（按时间顺序的日志使用 append，持续维护的文档使用 replace_section） |
| 探索相关概念 | `bm_context` |
| “我昨天在做什么？”/ 尚未提出具体查询 | `bm_recent` |
| 用户指定的项目不是当前活动项目 | `bm_projects` → 使用 `project: "workspace/name"` 或 `project_id: "<uuid>"` 调用读取/写入工具 |
| 相同的项目名称可能存在于多个工作区中 | `bm_projects`（必要时加上 `bm_workspaces`）→ 使用工作区限定的 `project` 或 `project_id` 进行路由 |
| 跟进刚刚写入的笔记 | 直接使用返回的永久链接——它已经编码了路由信息 |

## 笔记结构

BM 将 `- [category]` 行视为**观察结果**，并将 `## Relations` 下的 WikiLink 行视为**关系**。类别（`[decision]`、`[insight]`、`[risk]`、`[fact]`、`[todo]` 等）和关系类型（`relates_to`、`implements`、`depends_on`、`blocks` 等）没有固定限制——根据内容选择合适的类型。YAML frontmatter 支持 `title`、`type`、`tags` 和 `permalink` 作为标准字段；也允许使用任意自定义字段。完整约定请参阅[知识格式文档](https://docs.basicmemory.com/raw/concepts/knowledge-format.md)。

```markdown
# Clear Title

## Context
Background and current situation.

## Key Points
- Main insights
- Important details

## Observations
- [decision] We chose PostgreSQL for ACID guarantees
- [insight] Users prefer social login
- [risk] Deployment lacks rollback path

## Relations
- relates_to [[Other Note Title]]
- depends_on [[Database Choice]]

## Next Steps
- [ ] Implement
- [ ] Document
```

## 行为指南

1. **先搜索再回答。** 如果用户询问“我们对 X 做了什么决定？”，请先运行 `bm_search`。
2. **主动询问是否记录。** 当用户分享决定或会议结果时，询问：“要把这保存为笔记吗？”
3. **绝不声称保存了未实际写入的内容。** “记住/记录/保存/记下这个”意味着在该轮调用 `bm_write`（或 `bm_edit`）。只有在工具返回结果后才能报告已保存，并引用返回的永久链接——绝不要引用凭记忆想起的文件名。
4. **建议建立关联。** 当搜索返回相关笔记时，将它们展示出来，让用户知道已有的相关内容。
5. **不要过度记录。** 每轮已经在自动捕获。不要为每个回复都创建 `bm_write`——只有当用户希望保留实质性内容时才这样做。
6. **敏感信息。** 未经确认，不要记录凭据或个人数据。

## 易错点

如果笔记正文包含字面形式的 `<memory-context>...</memory-context>` 标签，Hermes 的流式输出清理器会在你将笔记原样回显给用户时吞掉这些标签（以及成对标签之间的文本）。工具输入不受影响。如果必须包含此类内容，请将其放在代码块中。

## 延伸阅读

官方文档位于 [docs.basicmemory.com](https://docs.basicmemory.com)。每个页面都有位于 `/raw/<path>.md` 的便于 AI 阅读的原始 Markdown 视图（或者向规范 URL 发送 `Accept: text/markdown`）。当你需要了解本技能未涵盖的详细信息时，可通过 `WebFetch` 获取以下任一页面：

- **[知识格式](https://docs.basicmemory.com/raw/concepts/knowledge-format.md)** — 观察类别、关系类型、frontmatter 约定。
- **[观察与关系](https://docs.basicmemory.com/raw/concepts/observations-and-relations.md)** — 笔记如何形成可搜索、可遍历的图。
- **[记忆 URL](https://docs.basicmemory.com/raw/concepts/memory-urls.md)** — 基于标题的寻址、通配符（`memory://docs/*`）以及路由解析顺序。
- **[项目与文件夹](https://docs.basicmemory.com/raw/concepts/projects-and-folders.md)** — 多项目布局、文件夹组织以及云路由行为。
- **[语义搜索](https://docs.basicmemory.com/raw/concepts/semantic-search.md)** — `bm_search` 如何解析查询（语义搜索 + 全文搜索）。
- **[MCP 工具参考](https://docs.basicmemory.com/raw/reference/mcp-tools-reference.md)** — Basic Memory 的完整 MCP 工具集（此处的 `bm_*` 工具是经过筛选的子集）。
- **[云路由](https://docs.basicmemory.com/raw/cloud/routing.md)** — 本地与云端项目模式、按项目配置路由。
- **[llms.txt 索引](https://docs.basicmemory.com/llms.txt)** — 原始 Markdown 页面的完整站点地图，便于查找上方未列出的页面。