---
name: linkedin-reader
description: >
  Read LinkedIn for financial research using opencli (read-only).
  Use this skill whenever the user wants to read their LinkedIn feed, search for jobs
  in the finance/trading industry, view professional posts about markets or earnings,
  or gather professional sentiment from LinkedIn.
  Triggers include: "check my LinkedIn feed", "search LinkedIn for", "LinkedIn posts about",
  "what's on LinkedIn about AAPL", "finance jobs on LinkedIn", "LinkedIn market sentiment",
  "who's posting about earnings on LinkedIn", "LinkedIn feed", "professional network buzz",
  "what are analysts saying on LinkedIn", any mention of LinkedIn in context
  of reading financial news, market research, job searches, or professional commentary.
  This skill is READ-ONLY — it does NOT support posting, liking, commenting, connecting, or any write operations.
---
# LinkedIn 技能（只读）

使用 [opencli](https://github.com/jackwener/opencli) 读取 LinkedIn 内容以开展金融研究。opencli 是一款通用 CLI 工具，可通过复用浏览器会话，将 Web 服务连接到终端。

**此技能为只读技能。** 它专为金融研究而设计：阅读有关市场的专业评论、监控分析师发布的内容、搜索金融/交易类职位，以及跟踪专业人士的情绪。它不支持发布、点赞、评论、建立联系、发送消息或任何写入操作。

**重要提示**：opencli 会复用你现有的 Chrome 登录会话——无需 API 密钥，也无需提取 Cookie。只需在 Chrome 中登录 linkedin.com，并安装 Browser Bridge 扩展程序即可。

---

## 第 1 步：确保 opencli 已安装并准备就绪

**当前环境状态：**

```
!`(command -v opencli && opencli doctor 2>&1 | head -5 && echo "READY" || echo "SETUP_NEEDED") 2>/dev/null || echo "NOT_INSTALLED"`
```

如果上述状态显示 `READY`，请跳至第 2 步。如果显示 `NOT_INSTALLED`，请先安装：

```bash
# Install opencli globally
npm install -g @jackwener/opencli
```

如果显示 `SETUP_NEEDED`，请引导用户完成设置：

### 设置

opencli 需要 Node.js >= 20，以及安装了 Browser Bridge 扩展程序的 Chrome 浏览器：

1. **安装 Browser Bridge 扩展程序：**
   - 从 [GitHub 发布页面](https://github.com/jackwener/opencli/releases)下载最新的 `opencli-extension-v{version}.zip`
   - 将其解压，在 Chrome 中打开 `chrome://extensions`，然后启用**开发者模式**
   - 点击**加载已解压的扩展程序**，并选择解压后的文件夹
2. **在 Chrome 中登录 linkedin.com**——opencli 会复用你现有的浏览器会话
3. **验证连接：**

```bash
opencli doctor
```

此命令会自动启动守护进程、验证扩展程序是否已连接，并检查会话健康状态。

### 常见设置问题

| 症状 | 解决方法 |
|---------|-----|
| `Extension not connected` | 在 Chrome 中安装 Browser Bridge 扩展程序，并确保它已启用 |
| `Daemon not running` | 运行 `opencli doctor`——它会自动启动守护进程 |
| `No session for linkedin.com` | 在 Chrome 中登录 linkedin.com，然后重试 |
| `AuthRequiredError` | LinkedIn 会话已过期——在 Chrome 中刷新 linkedin.com 并重新登录 |

---

## 第 2 步：确定用户的需求

将用户的请求与下面的某个读取命令相匹配，然后使用 `references/commands.md` 中对应的命令。

| 用户请求 | 命令 | 关键标志 |
|---|---|---|
| 设置检查 | `opencli doctor` | — |
| 首页动态/帖子 | `opencli linkedin timeline` | `--limit N`（默认值为 20，最大值为 100） |
| 搜索职位 | `opencli linkedin search "QUERY"` | `--location`、`--limit N`（默认值为 10，最大值为 100）、`--details` |
| 金融职位搜索 | `opencli linkedin search "QUERY"` | `--experience-level`、`--job-type`、`--remote`、`--company`、`--date-posted`、`--start` |

---

## 第 3 步：执行命令

### 通用模式

```bash
# Read LinkedIn feed posts
opencli linkedin timeline --limit 20 -f json

# Search for finance/trading jobs
opencli linkedin search "quantitative analyst" --limit 10 -f json
opencli linkedin search "portfolio manager" --location "New York" --limit 15 -f json

# Detailed job listings with descriptions
opencli linkedin search "financial analyst" --details --limit 10 -f json
```

### 关键规则

1. **首先检查设置** — 如果不确定连接状态，请在执行任何其他命令之前运行 `opencli doctor`
2. **使用 `-f json` 或 `-f yaml`** — 以便在以编程方式处理数据时获得结构化输出
3. **使用 `-f csv`** — 当用户需要与电子表格兼容的输出时
4. **使用 `--limit N`** — 控制结果数量；除非用户要求更多，否则从 10–20 条开始
5. **搜索职位时使用筛选条件** — 通过 `--location`、`--experience-level`、`--job-type`、`--remote`、`--date-posted` 缩小结果范围
6. **绝不要执行写入操作** — 此技能为只读；不要发布内容、点赞、评论、建立联系、发送消息或申请职位

### 输出格式标志（`-f`）

| 格式 | 标志 | 最适合 |
|---|---|---|
| 表格 | `-f table`（默认） | 便于阅读的终端输出 |
| JSON | `-f json` | 编程处理、LLM 上下文 |
| YAML | `-f yaml` | 结构化且易读的输出 |
| Markdown | `-f md` | 文档、报告 |
| CSV | `-f csv` | 导出到电子表格 |

### 输出列

**时间线**帖子包括：`rank`、`author`、`author_url`、`headline`、`text`、`posted_at`、`reactions`、`comments`、`url`。

**职位搜索**结果包括：`rank`、`title`、`company`、`location`、`listed`、`salary`、`url`。使用 `--details` 时还包括：`description`、`apply_url`。

---

## 第 4 步：呈现结果

获取数据后，以清晰的方式呈现，便于金融研究：

1. **总结关键内容** — 突出显示与用户研究最相关的帖子或职位
2. **注明归属信息** — 显示作者姓名、标题、帖子正文及互动数据（回应数、评论数）
3. **提供 URL** — 当用户可能希望阅读完整帖子或职位信息时
4. **对于信息流帖子**，重点展示市场评论、分析师观点、财报反应和专业人士情绪
5. **对于职位搜索结果**，呈现职位名称、公司、地点、薪资（如有）和发布日期
6. **标注情绪** — 指出专业人士的看涨/看跌情绪，以及共识观点与逆向观点
7. **将会话视为私密信息** — 绝不暴露浏览器会话详情

---

## 第 5 步：诊断

如果出现问题，请运行：

```bash
opencli doctor
```

此命令会检查守护进程状态、扩展连接情况和浏览器会话健康状况。

---

## 错误参考

| 错误 | 原因 | 修复方法 |
|-------|-------|-----|
| `Extension not connected` | Browser Bridge 未安装或未启用 | 安装扩展并在 Chrome 中启用 |
| `No session` | 未登录 linkedin.com | 在 Chrome 中登录 linkedin.com |
| `AuthRequiredError` | 检测到 LinkedIn 登录墙 | 刷新 linkedin.com 并重新登录 |
| `EmptyResultError` | 未找到与查询匹配的结果 | 扩大搜索词范围，或检查信息流中是否有内容 |
| Rate limited | 请求过多 | 等待几分钟，然后重试 |

---

## 参考文件

- `references/commands.md` — 完整的读取命令参考，包含所有标志、研究工作流和用法示例

当需要准确的命令语法、研究工作流模式或输出详情时，请阅读参考文件。