---
name: ops-oncall-log
description: "Create a structured on-call log by pulling alerts from monitoring and writing a summary to your team's wiki. Requires a monitoring MCP (recommended: Datadog) and a wiki MCP (Confluence or Notion)."
allowed_tools:
  - Read
  - Glob
  - Grep
  - Bash
---
# 值班日志

从你的监控平台拉取告警，并在团队 wiki 上创建一份结构化的值班日志。

## 何时使用

- 值班轮班结束时——为下一位值班工程师记录发生了什么
- 每日或每周的值班回顾会议
- 随时间积累，构建告警模式的历史记录

## 流程

### 1. 验证 MCP 服务器可用性

需要两个 MCP 服务器：

1. **监控 MCP** —— 用于获取告警事件和监控项状态。推荐：Datadog MCP。
2. **Wiki MCP** —— 用于创建日志页面。支持：Confluence（`mcp__claude_ai_Atlassian__*`）或 Notion（`mcp__claude_ai_Notion__*`）。

如果**任一**服务器缺失，则**停止**并提示：

> **错误：缺少必需的 MCP 服务器：`<list>`。**
> 此技能同时需要监控 MCP 和 wiki MCP。
> 推荐：Datadog MCP + Confluence 或 Notion MCP。

### 2. 收集配置

向用户询问：

1. **日志频率** —— 每日还是每周？（默认：每周）
2. **值班轮换安排** —— 轮换从星期几开始？（默认：星期五，仅对每周模式有意义）
3. **环境过滤** —— 包含哪些环境？（默认：仅生产环境）
4. **Wiki 空间/父页面** —— 在哪里创建日志页面：
   - **Confluence：** 空间键（space key）和父页面 ID
   - **Notion：** 父页面 ID 或数据库 ID
5. **模板页面**（可选）—— 用作格式参考的已有页面

如果用户之前运行过此技能且配置可用（例如在 `.spartan/config.yaml` 中），则复用这些设置并确认：
> "将使用之前的设置：**<frequency>** 频率、**<env>** 告警、wiki 位于 **<location>**。是否正确？"

### 3. 确定日期范围

根据第 2 步得到的日志频率：

- **每日：** 今天（或用户指定的具体日期）
- **每周：** 根据轮换日计算值班时间窗口（例如：星期五到星期五）

如果用户提供了自定义日期范围，则改用该范围。

向用户确认：
> "即将记录 **<start date> – <end date>** 的值班日志。是否正确？"

等待确认后再继续。

### 4. 从监控系统拉取告警

#### 4a. 检查已有页面（增量更新）

在 wiki 中搜索该周期对应的已有页面（使用第 7 步的命名约定）。如果找到，读取该页面以找到**最后更新时间戳**。询问用户："该周期的页面已存在。**更新（update）**它还是**新建（create new）**？"

- 如果选择**更新**：将最后更新时间戳作为 `from` 日期，而非完整窗口的起始时间——这样可以避免重复拉取已记录的告警，并减少 token 消耗。
- 如果选择**新建**：使用完整窗口的起始时间，并在第 8 步创建一个单独的页面。

每次更新时，都在页面顶部添加一行 `**Last updated:** <timestamp>`。

#### 4b. 查询已触发的告警事件

使用可用的监控 MCP 拉取告警事件：
- 按环境 + triggered/warn 状态过滤
- 时间范围：从上次更新时间（新页面则为窗口起始时间）到当前时间
- 按时间戳排序

**分页：** 如果结果被截断，持续分页直到拉取所有事件。

#### 4c. 过滤与归一化

对所有拉取到的事件：
- **排除**非目标环境的事件
- **排除**恢复（recovery）事件——只统计 triggered 和 warn 事件
- **归一化**监控项标题：去掉状态前缀，得到基础监控项名称

#### 4d. 构建告警摘要

按**基础监控项名称**对事件分组。对每个分组收集：

1. **出现次数** —— 该监控项在窗口期内的触发事件总数
2. **出现时间** —— 每次触发的时间戳，并附上监控平台中对应事件的链接
3. **当前状态** —— 该监控项现在是否仍处于 Alert 状态？

按出现次数降序排列告警。

#### 4e. 检查当前处于活跃状态的监控项

查询当前处于 Alert 状态的监控项。将这些标记为需要下一班值班人员跟进。

如果窗口期内没有告警，则注明“本周期无告警”并继续。

### 5. 询问补充说明

> "是否有需要写入日志的补充说明、事故或行动项？"

记录用户的输入。如果回答“没有”，则不带说明继续。

### 6. 获取模板（如果已配置）

如果用户在第 2 步提供了模板页面，则获取该页面并将其结构作为格式指南。否则使用第 8 步中的默认结构。

### 7. 查找或创建目标位置

以一致的层级结构组织值班日志：

```
On-call Logs/
  On-call <YYYY>/
    On-call <MM>/<YYYY>/
      [On-call] <Start Date> - <End Date>
```

1. 检查年份文件夹是否存在——不存在则创建
2. 检查月份文件夹是否存在——不存在则创建
3. 检查该周期的页面是否已存在：
   - 如果找到且用户在第 4a 步选择了**更新**：在第 8 步更新该页面
   - 如果找到且用户在第 4a 步选择了**新建**：在第 8 步创建一个新页面
   - 如果未找到：直接进入第 8 步

### 8. 创建日志页面

在 wiki 平台上创建页面：

```markdown
# On-call Log: <Start Date> – <End Date>

## Alert Summary

| Alert | Count | Times | Cause | Resolution |
|-------|-------|-------|-------|------------|
| <monitor name> | <N> | <timestamp 1>, <timestamp 2>, ... | | Still active |

**Total alerts:** <N> across <M> unique monitors

## Currently Active Alerts
<list monitors still in Alert status, or "None — all clear">

## Notes
<additional notes from Step 5, or "None">

## Action Items for Next On-call
- <follow up on active alert X>
- <investigate recurring alert Y — triggered N times>
```

**格式要求：**
- 将告警名称链接到对应的监控页面
- 将时间戳链接到对应的具体事件
- "Cause" 列留空，由工程师事后填写
- 当前处于 Alert 状态的监控项，"Resolution" 设为 "Still active"；已恢复的监控项则留空（由工程师事后填写）

### 9. 展示结果

```markdown
## On-call Log Created

**Page:** <page title>
**URL:** <wiki page URL>
**Alerts logged:** <N> alerts across <M> unique monitors
**Active alerts:** <count or "None">
**Notes:** <summary or "None">
```

如果存在未解决的告警：
> **下一班值班人员的行动项：** 以下告警仍处于活跃状态——请与相关团队跟进：`<list>`

## 交互风格

- 拉取前先确认配置和日期范围——不要自行假设
- 一次性集中提问，不要反复来回询问
- 突出展示最终页面的 URL，让用户可以立即分享

## 规则

- 拉取告警前务必确认日期范围
- 除非用户明确要求包含其他环境，否则只纳入生产环境告警
- 绝不创建重复的 wiki 页面——先检查是否已有页面
- "Cause" 列留空——由工程师事后填写。处于活跃状态的监控项将 "Resolution" 设为 "Still active"，已恢复的则留空
- 完整分页——不要展示不完整的告警数据

## 输出

直接在 wiki 平台（Confluence 或 Notion）上创建日志页面。在对话中内联展示 URL 和统计数据。
