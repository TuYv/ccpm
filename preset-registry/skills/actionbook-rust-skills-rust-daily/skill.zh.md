---
name: rust-daily
description: |
  CRITICAL: Use for Rust news and daily/weekly/monthly reports. Triggers on:
  rust news, rust daily, rust weekly, TWIR, rust blog,
  Rust 日报, Rust 周报, Rust 新闻, Rust 动态
argument-hint: "[today|week|month]"
context: fork
agent: Explore
---
# Rust 每日报告

> **版本：** 2.1.0 | **最后更新：** 2025-01-27

获取 Rust 社区动态，并按时间范围筛选。

## 数据源

| 类别 | 来源 |
|----------|---------|
| 生态系统 | Reddit r/rust、This Week in Rust |
| 官方 | blog.rust-lang.org、Inside Rust |
| 基金会 | rustfoundation.org（新闻、博客、活动） |

## 参数

- `time_range`：day | week | month（默认值：week）
- `category`：all | ecosystem | official | foundation

## 执行模式检测

**关键：首先检查代理文件是否可用，以确定执行模式。**

尝试读取：`../../agents/rust-daily-reporter.md`

---

## 代理模式（插件安装）

**当 `../../agents/rust-daily-reporter.md` 存在时：**

### 工作流程

```
1. Read: ../../agents/rust-daily-reporter.md
2. Task(subagent_type: "general-purpose", run_in_background: false, prompt: <agent content>)
3. Wait for result
4. Format and present to user
```

---

## 内联模式（仅安装 Skills）

**当代理文件不可用时，直接执行每个数据源：**

### 1. Reddit r/rust

```bash
# Using agent-browser CLI
agent-browser open "https://www.reddit.com/r/rust/hot/"
agent-browser get text ".Post" --limit 10
agent-browser close
```

**或使用 WebFetch 作为备用方案：**
```
WebFetch("https://www.reddit.com/r/rust/hot/", "Extract top 10 posts with scores and titles")
```

**将输出解析为：**
| 分数 | 标题 | 链接 |
|-------|-------|------|

### 2. This Week in Rust

```bash
# Check actionbook first
mcp__actionbook__search_actions("this week in rust")
mcp__actionbook__get_action_by_id(<action_id>)

# Then fetch
agent-browser open "https://this-week-in-rust.org/"
agent-browser get text "<selector_from_actionbook>"
agent-browser close
```

**将输出解析为：**
- 第 #{number} 期（{date}）：要点

### 3. Rust 博客（官方）

```bash
agent-browser open "https://blog.rust-lang.org/"
agent-browser get text "article" --limit 5
agent-browser close
```

**或使用 WebFetch 作为备用方案：**
```
WebFetch("https://blog.rust-lang.org/", "Extract latest 5 blog posts with dates and titles")
```

**将输出解析为：**
| 日期 | 标题 | 摘要 |
|------|-------|---------|

### 4. Inside Rust

```bash
agent-browser open "https://blog.rust-lang.org/inside-rust/"
agent-browser get text "article" --limit 3
agent-browser close
```

**或使用 WebFetch 作为备用方案：**
```
WebFetch("https://blog.rust-lang.org/inside-rust/", "Extract latest 3 posts with dates and titles")
```

### 5. Rust 基金会

```bash
# News
agent-browser open "https://rustfoundation.org/media/category/news/"
agent-browser get text "article" --limit 3
agent-browser close

# Blog
agent-browser open "https://rustfoundation.org/media/category/blog/"
agent-browser get text "article" --limit 3
agent-browser close

# Events
agent-browser open "https://rustfoundation.org/events/"
agent-browser get text "article" --limit 3
agent-browser close
```

### 时间筛选

获取所有数据源后，按时间范围筛选：

| 范围 | 筛选条件 |
|-------|--------|
| day | 最近 24 小时 |
| week | 最近 7 天 |
| month | 最近 30 天 |

### 合并结果

获取所有来源后，按以下输出格式合并结果。

---

## 工具链优先级

两种模式使用相同的工具链顺序：

1. **actionbook MCP** - 首先检查已缓存/预获取的内容
   ```
   mcp__actionbook__search_actions("rust news {date}")
   mcp__actionbook__search_actions("this week in rust")
   mcp__actionbook__search_actions("rust blog")
   ```

2. **agent-browser CLI** - 用于动态网页内容
   ```bash
   agent-browser open "<url>"
   agent-browser get text "<selector>"
   agent-browser close
   ```

3. **WebFetch** - agent-browser 不可用时的后备方案

| 来源 | 主要工具 | 后备工具 |
|--------|--------------|----------|
| Reddit | agent-browser | WebFetch |
| TWIR | actionbook → agent-browser | WebFetch |
| Rust Blog | actionbook → WebFetch | - |
| Foundation | actionbook → WebFetch | - |

**请勿使用：**
- 直接使用 Chrome MCP
- 使用 WebSearch 获取新闻页面

---

## 输出格式

```markdown
# Rust {Weekly|Daily|Monthly} Report

**Time Range:** {start} - {end}

## Ecosystem

### Reddit r/rust
| Score | Title | Link |
|-------|-------|------|
| {score} | {title} | [link]({url}) |

### This Week in Rust
- Issue #{number} ({date}): highlights

## Official
| Date | Title | Summary |
|------|-------|---------|
| {date} | {title} | {summary} |

## Foundation
| Date | Title | Summary |
|------|-------|---------|
| {date} | {title} | {summary} |
```

---

## 验证

- 每个来源应至少包含 1 条结果，否则标记为“No updates”
- 获取失败时，使用替代工具重试
- 如果某个来源使用所有工具均失败，请报告原因

## 错误处理

| 错误 | 原因 | 解决方案 |
|-------|-------|----------|
| 找不到 Agent 文件 | 仅安装了 Skills | 使用内联模式 |
| agent-browser 不可用 | 未安装 CLI | 使用 WebFetch |
| 站点超时 | 网络问题 | 重试一次，然后跳过该来源 |
| 结果为空 | 选择器不匹配 | 报告问题并使用后备工具 |