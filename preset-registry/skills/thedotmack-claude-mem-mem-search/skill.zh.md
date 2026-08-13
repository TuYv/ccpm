---
name: mem-search
description: Search claude-mem's persistent cross-session memory database. Use when user asks "did we already solve this?", "how did we do X last time?", or needs work from previous sessions.
---
# 记忆检索

在所有会话中搜索以往工作。简单流程是：search -> filter -> fetch。

## 使用场景

当用户询问“之前的会话”（而非当前对话）时使用：

- “我们以前已经修复过这个吗？”
- “上次是怎么解决 X 的？”
- “上周发生了什么？”

## 三层工作流（请始终遵循）

**请勿在先过滤前抓取完整细节。可节省 10 倍 token。**

### 步骤 1：搜索 - 获取带 ID 的索引

使用 `search` MCP 工具：

```  
search(query="authentication", limit=20, project="my-project")
```

**返回：** 包含 ID、时间戳、类型、标题的表格（~50-100 个 token/条）

```  
| ID | Time | T | Title | Read |
|----|------|---|-------|------|
| #11131 | 3:48 PM | 🟣 | Added JWT authentication | ~75 |
| #10942 | 2:15 PM | 🔴 | Fixed auth token expiration | ~50 |
```

**参数：**

- `query`（字符串）- 搜索词
- `limit`（数字）- 最大返回数量，默认 20，最大 100
- `project`（字符串）- 项目名称过滤条件
- `type`（字符串，可选）- `"observations"`、`"sessions"` 或 `"prompts"`
- `obs_type`（字符串，可选）- 用逗号分隔：bugfix、feature、decision、discovery、change
- `dateStart`（字符串，可选）- YYYY-MM-DD 或 epoch ms
- `dateEnd`（字符串，可选）- YYYY-MM-DD 或 epoch ms
- `offset`（数字，可选）- 跳过 N 条结果
- `orderBy`（字符串，可选）- `"date_desc"`（默认）、`"date_asc"`、`"relevance"`

### 步骤 2：时间线 - 获取相关结果的上下文

使用 `timeline` MCP 工具：

```  
timeline(anchor=11131, depth_before=3, depth_after=3, project="my-project")
```

或使用查询自动查找 anchor：

```  
timeline(query="authentication", depth_before=3, depth_after=3, project="my-project")
```

**返回：** 按时间顺序返回 `depth_before + 1 + depth_after` 个条目，包含以 anchor 为中心的 observations、sessions 和 prompts。

**参数：**

- `anchor`（数字，可选）- 用于居中展示的 Observation ID
- `query`（字符串，可选）- 若未提供 anchor，则自动查找
- `depth_before`（数字，可选）- anchor 前的条目数量，默认 5，最大 20
- `depth_after`（数字，可选）- anchor 后的条目数量，默认 5，最大 20
- `project`（字符串）- 项目名称过滤条件

### 步骤 3：抓取 - 仅对已过滤的 ID 获取完整详情

先查看步骤 1 的标题和步骤 2 的上下文，挑选相关 ID，舍弃其他无关项。

使用 `get_observations` MCP 工具：

```  
get_observations(ids=[11131, 10942])
```

**对 2 个及以上 observation，务必使用 `get_observations` ——一次性请求比多次请求更高效。**

**参数：**

- `ids`（数字数组，必填）- 要抓取的 Observation ID
- `orderBy`（字符串，可选）- `"date_desc"`（默认）、`"date_asc"`
- `limit`（数字，可选）- 最多返回多少条 observation
- `project`（字符串，可选）- 项目名称过滤条件

**返回：** 包含 title、subtitle、narrative、facts、concepts、files 的完整 observation 对象（每条约 500-1000 个 token）

## 示例

**查找最近的错误修复：**

```  
search(query="bug", type="observations", obs_type="bugfix", limit=20, project="my-project")
```

**查看上周发生了什么：**

```  
search(type="observations", dateStart="2025-11-11", limit=20, project="my-project")
```

**理解某个发现的上下文：**

```  
timeline(anchor=11131, depth_before=5, depth_after=5, project="my-project")
```

**批量抓取详情：**

```  
get_observations(ids=[11131, 10942, 10855], orderBy="date_desc")
```

## 为什么要使用这个工作流？

- **搜索索引：** 每条约 50-100 个 token
- **完整 observation：** 每条约 500-1000 个 token
- **批量抓取：** 1 次 HTTP 请求对比 N 次单独请求
- **先过滤后抓取可节省 10 倍 token**

## 知识代理

希望得到整合后的答案而非原始记录吗？使用 `/knowledge-agent` 从 observation 历史构建可查询语料库。知识代理会读取所有匹配的 observation，并以对话方式回答问题。
