---
name: twitter-reader
description: >
  Read Twitter/X for financial research using opencli (read-only).
  Use this skill whenever the user wants to read their Twitter feed, search for financial tweets,
  view bookmarks, look up user profiles, or gather market sentiment from Twitter/X.
  Triggers include: "check my feed", "search Twitter for", "show my bookmarks",
  "who follows", "look up @user", "what's trending about", "market sentiment on Twitter",
  "what are people saying about AAPL", "recent tweets from @elonmusk", "show me @user's posts",
  "fintwit", any mention of Twitter/X in context of reading financial news or market research.
  This skill is READ-ONLY — it does NOT support posting, liking, retweeting, or any write operations.
---
# Twitter 技能（只读）

使用 [opencli](https://github.com/jackwener/opencli) 读取 Twitter/X 内容以进行金融研究。opencli 是一款通用 CLI 工具，可通过复用浏览器会话将 Web 服务连接到终端。

**此技能为只读。** 它专为金融研究而设计：搜索市场讨论、阅读分析师推文、跟踪市场情绪，以及监控 Twitter/X 上的财经新闻。它不支持发帖、点赞、转推、回复或任何写入操作。

**重要提示**：opencli 会复用你现有的 Chrome 登录会话——无需 API 密钥，也无需提取 Cookie。只需在 Chrome 中登录 x.com，并安装 Browser Bridge 扩展程序即可。

---

## 第 1 步：确保 opencli 已安装并准备就绪

**当前环境状态：**

```
!`(command -v opencli && opencli doctor 2>&1 | head -5 && echo "READY" || echo "SETUP_NEEDED") 2>/dev/null || echo "NOT_INSTALLED"`
```

如果上方状态显示 `READY`，请跳至第 2 步。如果显示 `NOT_INSTALLED`，请先安装：

```bash
# Install opencli globally
npm install -g @jackwener/opencli
```

如果显示 `SETUP_NEEDED`，请指导用户完成设置：

### 设置

opencli 需要 Node.js >= 20，以及安装了 Browser Bridge 扩展程序的 Chrome 浏览器：

1. **安装 Browser Bridge 扩展程序：**
   - 从 [GitHub Releases 页面](https://github.com/jackwener/opencli/releases)下载最新的 `opencli-extension-v{version}.zip`
   - 将其解压，在 Chrome 中打开 `chrome://extensions`，并启用**开发者模式**
   - 点击**加载已解压的扩展程序**，然后选择解压后的文件夹
2. **在 Chrome 中登录 x.com**——opencli 会复用你现有的浏览器会话
3. **验证连接：**

```bash
opencli doctor
```

此命令会自动启动守护进程、验证扩展程序是否已连接，并检查会话健康状态。

### 常见设置问题

| 症状 | 解决方法 |
|---------|-----|
| `Extension not connected` | 在 Chrome 中安装 Browser Bridge 扩展程序，并确保其已启用 |
| `Daemon not running` | 运行 `opencli doctor`——它会自动启动守护进程 |
| `No session for twitter.com` | 在 Chrome 中登录 x.com，然后重试 |
| `CSRF token missing` | 在 Chrome 中刷新 x.com，以重新生成 ct0 Cookie |

---

## 第 2 步：确定用户的需求

将用户的请求与下方某个读取命令匹配，然后使用 `references/commands.md` 中对应的命令。

| 用户请求 | 命令 | 关键标志 |
|---|---|---|
| 设置检查 | `opencli doctor` | — |
| 首页动态 / 时间线 | `opencli twitter timeline` | `--type for-you\|following`, `--limit N`（默认值为 20） |
| 搜索推文 | `opencli twitter search "QUERY"` | `--filter top\|live`, `--limit N`（默认值为 15） |
| 热门话题 | `opencli twitter trending` | `--limit N`（默认值为 20） |
| 书签 | `opencli twitter bookmarks` | `--limit N`（默认值为 20） |
| 某位用户的近期推文 | `opencli twitter tweets USERNAME` | `--limit N`（默认值为 20） |
| 查看特定推文串 | `opencli twitter thread TWEET_ID` | `--limit N`（默认值为 50） |
| Twitter 文章 | `opencli twitter article TWEET_ID` | — |
| 用户个人资料 | `opencli twitter profile USERNAME` | —（默认为当前已登录用户） |
| 关注者 | `opencli twitter followers USERNAME` | `--limit N`（默认值为 50） |
| 正在关注 | `opencli twitter following USERNAME` | `--limit N`（默认值为 50） |
| 通知 | `opencli twitter notifications` | `--limit N`（默认值为 20） |

---

## 步骤 3：执行命令

### 通用模式

```bash
# Use -f json or -f yaml for structured output
opencli twitter timeline -f json --limit 20
opencli twitter timeline --type following --limit 20

# Recent tweets from a specific user
opencli twitter tweets elonmusk --limit 20 -f json

# Searching for financial topics
opencli twitter search "$AAPL earnings" --filter live --limit 10 -f json
opencli twitter search "Fed rate decision" --limit 20 -f yaml

# Trending topics
opencli twitter trending --limit 20 -f json
```

### 关键规则

1. **首先检查设置** — 如果不确定连接是否正常，请先运行 `opencli doctor`，再执行其他命令
2. **使用 `-f json` 或 `-f yaml`** — 以便在以编程方式处理数据时获得结构化输出
3. **使用 `-f csv`** — 当用户需要与电子表格兼容的输出时
4. **使用 `--limit N`** — 控制结果数量；除非用户要求更多，否则从 10-20 条开始
5. **搜索时使用 `--filter`** — `top`（默认）按相关性排序，`live` 获取最新推文
6. **绝不执行写入操作** — 此技能为只读；不要发布、点赞、转推、回复、引用、关注或删除

### 输出格式标志（`-f`）

| 格式 | 标志 | 最适合 |
|---|---|---|
| 表格 | `-f table`（默认） | 便于人类阅读的终端输出 |
| JSON | `-f json` | 编程处理、LLM 上下文 |
| YAML | `-f yaml` | 结构化且易于阅读的输出 |
| Markdown | `-f md` | 文档、报告 |
| CSV | `-f csv` | 导出到电子表格 |

### 输出列

推文列表命令（`timeline`、`search`、`thread`）包含：`id`、`author`、`text`、`created_at`、`likes`、`retweets`、`replies`、`views`、`url`、`has_media`、`media_urls`。

`tweets`（按用户获取帖子）还包含 `is_retweet`。

`bookmarks` 的列：`author`、`text`、`likes`、`retweets`、`bookmarks`、`url`。

`trending` 的列：`rank`、`topic`、`tweets`、`category`。

个人资料（`profile`）的列：`screen_name`、`name`、`bio`、`location`、`url`、`followers`、`following`、`tweets`、`likes`、`verified`、`created_at`。

`followers` / `following` 的列：`screen_name`、`name`、`bio`、`followers`。

`notifications` 的列：`id`、`action`、`author`、`text`、`url`。

---

## 步骤 4：展示结果

获取数据后，以清晰的方式呈现，供金融研究使用：

1. **总结关键内容** — 突出显示与用户金融研究最相关的推文
2. **注明来源** — 显示 @username、推文文本和互动指标（点赞数、浏览量）
3. **提供推文 URL** — 方便用户在需要时阅读完整帖子串
4. **对于搜索结果**，按相关性分组，并突出关键主题、市场情绪或市场信号
5. **对于用户资料**，展示粉丝数、个人简介和近期值得关注的动态
6. **标注市场情绪** — 说明看涨/看跌情绪，以及共识观点与逆向观点
7. **将会话视为私密信息** — 绝不暴露浏览器会话详情

---

## 步骤 5：诊断

如果出现异常，请运行：

```bash
opencli doctor
```

此命令会检查守护进程状态、扩展连接情况和浏览器会话健康状况。

---

## 错误参考

| 错误 | 原因 | 修复方法 |
|-------|-------|-----|
| `Extension not connected` | Browser Bridge 未安装或未启用 | 安装扩展程序并在 Chrome 中启用 |
| `No session` | 未登录 x.com | 在 Chrome 中登录 x.com |
| `CSRF token missing` | Cookie 已过期或页面需要刷新 | 在 Chrome 中刷新 x.com |
| 受到速率限制 | 请求过多 | 等待几分钟，然后重试 |

---

## 参考文件

- `references/commands.md` — 完整的读取命令参考，包含所有标志、研究工作流和使用示例
- `references/schema.md` — 输出格式文档和列定义

当你需要确切的命令语法、研究工作流模式或输出详情时，请阅读参考文件。