---
name: opencli-reader
description: >
  Generic read-only fallback for any source opencli covers but this repo has no dedicated
  reader for — Yahoo Finance, Bloomberg, Reuters, Barchart, Eastmoney, Xueqiu, Sinafinance,
  Reddit, HackerNews, Substack, Medium, Weibo, Bilibili, Xiaohongshu, Zhihu, arXiv,
  Google Scholar, Apple Podcasts, Xiaoyuzhou, Spotify, YouTube, Weixin, Amazon, and more.
  Triggers: "use opencli to read", "grab the frontpage from hackernews",
  "read reddit r/wallstreetbets", "fetch Eastmoney hot stocks", "pull Xueqiu feed",
  "get Bloomberg markets headlines", "search arXiv for", any request to read from a site
  where a specialized skill does not exist but opencli does.
  FALLBACK — prefer twitter-reader, linkedin-reader, discord-reader, telegram-reader, or
  yc-reader when the source matches. READ-ONLY — never invoke write operations.
---
# opencli 阅读器（通用回退，只读）

适用于 opencli 通过其[适配器注册表](https://github.com/jackwener/opencli)支持的任何来源的通用回退方案（已支持 100 多个网站，并持续增加）。仅当**没有专用的 finance-skill 覆盖该来源**时才使用此技能——当请求与专用技能（`twitter-reader`、`linkedin-reader`、`discord-reader`、`telegram-reader`、`yc-reader`）之一匹配时，始终应优先使用专用技能。

**此技能为只读。** 不得调用 opencli 提供的写入命令（post、like、comment、send、save、upvote、subscribe、follow、delete、reply-dm 等）。

---

## 第 1 步：决定是否使用此技能

仅当请求**无法**由更具体的技能处理时，才使用此技能。

| 如果用户询问…… | 改用此技能 |
|---|---|
| Twitter/X | `twitter-reader` |
| LinkedIn | `linkedin-reader` |
| Discord | `discord-reader` |
| Telegram | `telegram-reader` |
| Y Combinator | `yc-reader` |
| opencli 支持的其他任何来源（Yahoo Finance、Bloomberg、Reuters、Reddit、HackerNews、Eastmoney、Xueqiu、Substack、arXiv 等） | **此技能** |

如果来源也不在 opencli 的注册表中，请停止并告知用户该请求不在支持范围内——不要退而使用临时抓取方案。

---

## 第 2 步：确保 opencli 已准备就绪

**当前环境状态：**

```
!`(command -v opencli && opencli doctor 2>&1 | head -5 && echo "READY" || echo "SETUP_NEEDED") 2>/dev/null || echo "NOT_INSTALLED"`
```

如果为 `NOT_INSTALLED`：

```bash
npm install -g @jackwener/opencli
```

如果为 `SETUP_NEEDED`，请指导用户完成 Browser Bridge 设置（仅策略为 `COOKIE`、`HEADER`、`INTERCEPT` 或 `UI` 的适配器需要此设置——`PUBLIC` 和 `LOCAL` 适配器无需浏览器即可工作）：

1. 从 [GitHub Releases 页面](https://github.com/jackwener/opencli/releases)下载最新的 `opencli-extension-v{version}.zip`
2. 将其解压，在 Chrome 中打开 `chrome://extensions`，启用**开发者模式**
3. 点击**加载已解压的扩展程序**，然后选择解压后的文件夹
4. 确保 Chrome 已登录目标网站，然后重新运行 `opencli doctor`

需要 Node.js >= 20（或 Bun >= 1.0）。

---

## 第 3 步：查找正确的命令

**不要猜测命令名称或标志**——注册表中有 500 多个命令，并且每周都会发生变化。应改用：

```bash
# Full registry (grouped by site), machine-readable JSON
opencli list -f json

# Filter to a site
opencli list | grep -i <site>

# Site-level help (all commands + flags)
opencli <site> --help

# Command-level help (positional args + flags + defaults)
opencli <site> <command> --help
```

`opencli list -f json` 中每条命令的条目包括：
- `site` — 适配器命名空间（例如 `yahoo-finance`）
- `name` — 子命令（例如 `quote`）
- `strategy` — `PUBLIC` / `COOKIE` / `HEADER` / `INTERCEPT` / `UI` / `LOCAL` — 用于说明是否需要登录浏览器
- `description`、`args`、`columns` — 规范元数据

将 `opencli list -f json` 作为事实依据。绝不要凭记忆将网站列表粘贴到计划中；每周都会新增适配器。

### 最常用财经 / 研究来源速查表

下表仅列出**常用来源**，并非详尽清单——请始终使用 `opencli <site> --help` 进行确认。

| 来源 | 站点标识 | 常用命令 |
|---|---|---|
| Yahoo Finance | `yahoo-finance` | `quote` |
| Bloomberg | `bloomberg` | `markets`, `economics`, `industries`, `tech`, `politics`, `opinions`, `news`, `businessweek`, `feeds`, `main` |
| Reuters | `reuters` | `search` |
| Eastmoney（东方财富） | `eastmoney` | `quote`, `rank`, `kline`, `sectors`, `etf`, `holders`, `money-flow`, `northbound`, `longhu`, `kuaixun`, `convertible`, `index-board`, `announcement`, `hot-rank` |
| Xueqiu（雪球） | `xueqiu` | `stock`, `hot-stock`, `hot`, `feed`, `comments`, `watchlist`, `search`, `groups`, `fund-snapshot`, `fund-holdings`, `earnings-date`, `kline` |
| Sinafinance | `sinafinance` |（参见 `--help`）|
| TDX / THS | `tdx`, `ths` |（参见 `--help`）|
| Barchart（期权） | `barchart` | `quote`, `options`, `flow`, `greeks` |
| Reddit | `reddit` | `hot`, `popular`, `frontpage`, `search`, `subreddit`, `read`, `user`, `user-posts`, `user-comments`, `saved` |
| HackerNews | `hackernews` | `top`, `best`, `new`, `ask`, `show`, `jobs`, `user`, `search` |
| Substack | `substack` | `feed`, `publication`, `search` |
| Medium | `medium` |（参见 `--help`）|
| arXiv | `arxiv` |（参见 `--help`）|
| Google Scholar | `google-scholar` |（参见 `--help`）|
| Weibo | `weibo` |（参见 `--help`）|
| Bilibili | `bilibili` | `hot`, `video` 及更多 |
| Xiaohongshu（小红书） | `xiaohongshu` |（参见 `--help`）|
| Rednote（小红书国际版） | `rednote` |（参见 `--help`——与 `xiaohongshu` 一致）|
| Zhihu | `zhihu` |（参见 `--help`）|
| Tieba（百度贴吧） | `tieba` |（参见 `--help`）|
| Hupu（虎扑） | `hupu` |（参见 `--help`）|
| Xianyu（闲鱼） | `xianyu` |（参见 `--help`）|
| 1688 | `1688` |（参见 `--help`）|
| Gitee | `gitee` |（参见 `--help`）|
| Quark | `quark` |（参见 `--help`）|
| Baidu Scholar | `baidu-scholar` |（参见 `--help`）|
| Nowcoder | `nowcoder` |（参见 `--help`）|
| Wanfang | `wanfang` |（参见 `--help`）|
| Doubao（豆包） | `doubao` |（参见 `--help`）|
| Yuanbao（腾讯元宝） | `yuanbao` |（参见 `--help`）|
| Google Gemini | `gemini` |（参见 `--help`）|
| NotebookLM | `notebooklm` |（参见 `--help`）|
| Claude | `claude` |（参见 `--help`）|
| 36kr | `36kr` |（参见 `--help`）|
| Jike | `jike` |（参见 `--help`）|
| Bluesky | `bluesky` |（参见 `--help`）|
| Apple Podcasts | `apple-podcasts` |（参见 `--help`）|
| Xiaoyuzhou（播客） | `xiaoyuzhou` |（参见 `--help`）|
| Spotify | `spotify` |（参见 `--help`）|
| YouTube | `youtube` |（参见 `--help`）|
| Weixin Official Account | `weixin` |（参见 `--help`——`drafts` 为读取操作；`create-draft` 为写入操作）|
| Toutiao | `toutiao` | `articles` |
| 政府政策 / 法律 | `gov-policy`, `gov-law` |（参见 `--help`）|
| 网页下载 / 阅读器 | `web` | `read`, `download` |

对于未列出的来源，请运行 `opencli list -f json` 并进行筛选。

---

## 第 4 步：运行前检查适配器的策略

运行 `opencli list -f json`（或 `opencli <site> <command> --help`）并查看 `strategy` 字段：

| 策略 | 含义 | 前置条件 |
|---|---|---|
| `PUBLIC` | 纯 HTTP；无需浏览器 | 无 |
| `LOCAL` | 与本地端点通信 | 本地服务正在运行 |
| `COOKIE` / `HEADER` | 复用你在 Chrome 中对该网站的登录状态 | Chrome 已登录该网站 + 已加载 Browser Bridge 扩展 |
| `INTERCEPT` | 打开自动化窗口以捕获已签名的请求 | 与 COOKIE 相同；请耐心等待——可能需要几秒钟 |
| `UI` | 完整的 DOM 交互 | 与 COOKIE 相同；速度最慢；结果取决于网站当前的布局 |

如果用户没有登录，且适配器的策略不是 `PUBLIC` / `LOCAL`，请告知他们需要先在 Chrome 中登录该网站，然后再重试。

---

## 步骤 5：执行命令

### 通用模式

```bash
opencli <site> <command> [positional-args] [flags] -f json
```

### 通用标志

| 标志 | 作用 |
|---|---|
| `-f json` | 结构化 JSON——进行代理处理时始终优先使用此格式 |
| `-f yaml` / `-f csv` / `-f md` / `-f table` / `-f plain` | 其他格式 |
| `-v` | 详细日志记录（同时设置 `OPENCLI_VERBOSE=1`） |
| `--live` | 命令执行后保持自动化窗口打开（仅限基于浏览器的适配器） |
| `--focus` | 在前台打开自动化窗口（仅限基于浏览器的适配器） |

命令专用标志（`--limit`、`--filter`、`--type` 等）**并非**通用标志——始终查看 `opencli <site> <command> --help`。

### 示例

```bash
# Yahoo Finance quote (PUBLIC)
opencli yahoo-finance quote AAPL -f json

# Reddit hot posts in a subreddit (COOKIE or PUBLIC depending on subreddit)
opencli reddit subreddit wallstreetbets --limit 20 -f json
opencli reddit search "SPY options" --limit 15 -f json

# HackerNews top (PUBLIC)
opencli hackernews top --limit 20 -f json

# Eastmoney hot rank (PUBLIC)
opencli eastmoney hot-rank -f json

# Xueqiu hot stocks (PUBLIC or COOKIE)
opencli xueqiu hot-stock -f json
opencli xueqiu stock SH600519 -f json

# Bloomberg markets headlines (COOKIE)
opencli bloomberg markets -f json

# arXiv paper search (PUBLIC)
opencli arxiv search "volatility surface" --limit 10 -f json

# Substack feed
opencli substack feed --limit 20 -f json

# Web page → readable markdown (PUBLIC)
opencli web read "https://example.com/article" -f json
```

### 关键规则

1. 在构造本次会话中尚未运行过的命令之前，**始终使用 `opencli <site> <command> --help`**——不要想当然地猜测标志名称。
2. 使用 **`-f json`** 进行程序化处理。
3. **先使用较小的 `--limit`**（10–20）验证输出结构，然后再拉取更多内容。
4. **运行基于浏览器的适配器之前，请检查 `strategy`**——如果用户尚未登录，`COOKIE` / `UI` 适配器将会失败。
5. **绝不要执行写入操作。** 在各类适配器中需要避免的常见写入命令名称包括：`post`、`reply`、`comment`、`like`、`unlike`、`upvote`、`save`、`subscribe`、`unsubscribe`、`follow`、`unfollow`、`block`、`unblock`、`delete`、`bookmark`、`unbookmark`、`send`、`create-draft`、`reply-dm`、`accept`。如果不确定某个命令是读取操作还是写入操作，请检查 `opencli list -f json` 中的 `description`；如果其中暗示该命令会修改数据，则跳过它。

---

## 步骤 6：处理失败

如果命令返回空结果或出错，则站点可能已更改其选择器 / API。opencli 内置了一个自修复循环：

```bash
# Re-run with diagnostic context
OPENCLI_DIAGNOSTIC=1 opencli <site> <command> <args>
```

这会生成结构化的 `RepairContext`，用于标识失败适配器的源文件路径。可以采取以下措施：

1. 如果用户已安装 `opencli-autofix` skill，请让他们运行该 skill。
2. 如果没有，建议他们前往 https://github.com/jackwener/opencli/issues 提交 issue，并附上 `RepairContext` 输出。
3. 不要悄悄回退到自行编写的抓取方案——这样会向上游 registry 隐瞒该 bug。

目标站点的速率限制也可能导致结果为空；请等待后重试。

---

## 步骤 7：呈现结果

1. **汇总数据**以回答用户的实际问题，不要只是直接输出原始 JSON。
2. **注明来源**——对于每个条目，在可用时提供站点名称和 URL。
3. **对于市场数据**，展示价格 / 涨跌幅 / 成交量 / 市值，并标记异常情况。
4. **对于新闻/帖子**，突出显示标题、时间戳和关键引文。
5. **对于研究内容（arXiv、Scholar）**，提供标题、作者、摘要和链接。
6. **将浏览器会话视为私密信息**——绝不要回显 CDP 端点、cookie 或身份验证令牌。

---

## 参考文件

- `references/discovery.md` — 如何使用 `opencli list`、`opencli <site> --help`，以及 registry 条目的 JSON schema
- `references/finance-sources.md` — 关于金融类适配器（Yahoo Finance、Bloomberg、Eastmoney、Xueqiu、Barchart、Reuters、Reddit、HackerNews）的详细说明，以及哪些命令属于读取操作、哪些属于写入操作

当你需要特定站点的具体示例，或者用户询问某项未被专用 reader 覆盖的能力时，请阅读这些参考文件。