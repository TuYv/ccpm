---
name: fetch-tweets
description: Search and curate X/Twitter behind one selector - keyword, topic roundup, a single or tracked-account digest, an X list, or the AI-agent buzz preset - clustered into signal-scored sub-narratives.
metadata:
  title: Fetch Tweets
  category: basics
  var: ""
  tags:
    - social
  requires:
    - XAI_API_KEY?
---
<!-- autoresearch: 变体 B — 通过聚类、信号评分和洞见提取生成更精炼的输出。合并后的 HUB：通过 `source:` 选择器整合 tweet-digest、tweet-roundup、list-digest、refresh-x、agent-buzz。 -->
> **${var}** — `<source>:<arg>`，其中 `<source>` ∈ `keyword | topic | account | list | agent-buzz`。`<arg>` 因来源而异（可以是查询、主题、账号名、以逗号分隔的列表 ID，或可选的关注重点）。如果未提供 `source:` 前缀，则根据 `<arg>` 的形式推断来源（参见**来源选择器**）。对于 `keyword` 和 `list`，此项为**必填**；对于 `topic`、`account` 和 `agent-buzz`，此项可选。

今天是 ${today}。此技能沿五种**来源轴**之一获取 X/Twitter 内容，并生成一份*精选*摘要——按子叙事聚类、按信号排序、每项提炼一条洞见——绝不会只是按时间顺序平铺罗列。

## 来源选择器

在执行其他任何操作之前，将 `${var}` 解析为 `SOURCE` 和 `ARG`。

**显式形式（推荐）：** `<source>:<arg>`
- `keyword:$SOL OR solana OR "solana network"` — 原始 X 搜索查询，**原样**传递给 Grok（遵循 OR/AND 运算符）。
- `topic:brain-computer interfaces` — 单个主题汇总。`topic:`（参数为空）→ 先从 MEMORY.md 解析主题**列表**，再使用内置默认值。
- `account:vitalikbuterin` — 某个账号的近期推文。`account:`（参数为空）→ 摘要整理 `memory/topics/tracked-accounts.yml` 中的**每个**账号。
- `list:1953536336675365173,1937207796270829766` — 一个或多个数字形式的 X 列表 ID。追加 `|<topic>` 可增强指定主题：`list:195...,193...|AI agents`。
- `agent-buzz` — 精选的 AI 智能体生态系统预设。`agent-buzz:MCP protocol` 会优先关注预设中的某个项目或主题。

**隐式形式（向后兼容迁移后的裸变量配置）：** 当 `${var}` **没有**可识别的 `source:` 前缀时，按以下顺序推断 `SOURCE`：
1. `${var}` 为空 → `topic`（默认的多主题汇总）。
2. `${var}` 全部由数字组成，或是以逗号分隔的全数字值（末尾可带 `|<topic>` 后缀）→ `list`。
3. `${var}` 是 `@handle`，或匹配 `^[A-Za-z0-9_]{1,15}$`（裸账号名）→ `account`。
4. 其他任何形式 → `keyword`。

注意：`agent-buzz` **没有**独特的隐式形式（其参数看起来与关键词或主题相同），因此**只能**通过显式的 `agent-buzz` / `agent-buzz:...` 前缀选择。

设置好 `SOURCE` 和 `ARG` 后，跳转到下方对应的分支。每次调用只运行一个分支。

## 共享前置步骤（所有分支）

1. 读取 `memory/MEMORY.md` 获取上下文，并读取近期的 `memory/logs/`（每个分支会指定其回溯窗口——2 天或 3 天），以去重已经报告过的推文。
2. 通过合并以下两个来源，**加载去重集合 `SEEN_TWEETS`**：
   - 该分支的**持久化已见文件**（各模式的路径见下表），如果存在，则读取其中所有 URL。
   - 该分支的**日志回溯窗口**——在范围内的每个 `memory/logs/*.md` 文件中，使用 grep 查找匹配 `https://x.com/` 的行。

   各模式的已见文件（保留其旧版路径，以确保合并后去重历史得以延续）：
   | 模式 | 已见文件 | 日志回溯 |
   |---|---|---|
   | keyword | `memory/fetch-tweets-seen.txt` | 3 天 |
   | topic | `memory/tweet-roundup-seen.txt` | 3 天 |
   | account | *（仅日志——参见对应分支）* | 2 天 |
   | list | `memory/list-digest-seen.txt` | 2 天 |
   | agent-buzz | *（仅日志——3 天的 `status/<id>` 集合）* | 3 天 |
3. **每个**分支的通知都必须遵守以下共享格式规范：
   - 使用 `x.com/handle`（**绝不**使用 `@handle`），以免 Telegram 提醒或标记用户。*（例外：下方的账号摘要和 agent-buzz 格式历来会在正文中使用 `@handle`；保留其文档规定的格式，但在可行时优先使用 `x.com/handle`。）*
   - 每条保留下来的推文都必须带有可点击的 Markdown 链接——`[View](url)` / `[View tweet](url)`。如果 URL 不可用，则移除链接并注明“（链接不可用）”。
   - 绝不编造互动数据。缺失时 → `0`，不要猜测。
   - **仅在有信号时发送通知。** 如果某次运行确实没有结果，或结果全部重复，则记录其状态，但**不发送任何内容**。

## 语气

由 `account` 和 `agent-buzz` 分支用于单行观点/洞察。如果 `soul/SOUL.md` 和 `soul/STYLE.md` 已填充，请读取两者并匹配操作者的语气。如果它们是空模板或不存在，则使用清晰、直接、中立的语气——陈述推文所表达的内容，不要使用模棱两可的措辞，也不要在推文本身之外加入主观评论。

---

## 分支：keyword（`source:keyword`）

在 X 上搜索与 `ARG` 匹配的推文，并按子叙事分组生成精选摘要。

**已查看集合：** `memory/fetch-tweets-seen.txt` + 最近 3 天的日志（在前置阶段加载）。

1. **构建搜索提示词。** 将 `ARG` **原样**传递给 Grok 作为查询——不要将其收窄到单一角度；目标是广泛覆盖。要求返回**至少 15–20 条候选推文**（你将筛选至约 7–10 条）。始终要求提供明确的互动数据（点赞、转推、回复），以便基于数据进行排序。

2. **获取推文。** 为日志记录 `SOURCE_PATH=api|websearch`。

   **路径 A — X.AI API**（主要路径；参见 **Fetching (all branches)** 约定——尝试此路径，将 Bash 工具的 `timeout` 设置为 ≥180000，并捕获 HTTP 状态码）：
   ```bash
   FROM_DATE=$(date -u -d "yesterday" +%Y-%m-%d 2>/dev/null || date -u -v-1d +%Y-%m-%d)
   TO_DATE=$(date -u +%Y-%m-%d)
   PROMPT="Search X for tweets about: ${ARG}. Date range: ${FROM_DATE} to ${TO_DATE}. Return at least 15-20 candidate tweets — mix of high-engagement posts and smaller accounts that add a distinct angle. For each tweet include: @handle, the full text, date posted, exact engagement counts (likes, retweets, replies — never N/A; if unknown, say 0), and the direct link (https://x.com/handle/status/ID). Return as a numbered list."
   jq -n --arg p "$PROMPT" '{model:"grok-4.6", input:[{role:"user",content:$p}], tools:[{type:"x_search"}]}' > /tmp/xai-ft-keyword.json
   HTTP=$(./secretcurl -s -o /tmp/xai.json -w '%{http_code}' --max-time 150 -X POST "https://api.x.ai/v1/responses" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer {XAI_API_KEY}" \
     -d @/tmp/xai-ft-keyword.json)
   echo "xai http=$HTTP bytes=$(wc -c </tmp/xai.json)"
   ```
   当 `HTTP=200` 时，使用以下命令解析 `/tmp/xai.json`：`jq -r '.output[] | select(.type == "message") | .content[] | select(.type == "output_text") | .text'`，并标记 `SOURCE_PATH=api`。

   **路径 B — WebSearch 回退方案**（仅当密钥为 `KEY_UNSET`，或路径 A 根据约定返回非 2xx / 空结果 / 超时时使用）：使用内置 WebSearch 工具，并以 `site:x.com "<query terms>" after:${FROM_DATE}` 进行搜索。在日志顶部注明**真实原因**（`http-<code>` / `timeout` / `empty`；密钥已设置时绝不能写成“不可用”），以及“结果通过 WebSearch 汇编——质量低于通常水平”。WebSearch 偏向高互动量的较旧推文——**优先选择过去 48 小时内发布的结果**。标记 `SOURCE_PATH=websearch`。

3. **空结果与错误处理**（须加以区分）：
   - **确实为空**（0 条推文）：记录 `FETCH_TWEETS_EMPTY (source=${SOURCE_PATH})`，然后**停止——不发送通知**。
   - **API/缓存错误**（HTTP 错误、JSON 格式错误、所有路径均失败）：记录 `FETCH_TWEETS_ERROR (last_path=${SOURCE_PATH}, reason=...)`，然后**停止——不发送通知**。

4. **去重**：将每个候选 URL 与 `SEEN_TWEETS` 进行比对。如果全部重复：记录 `FETCH_TWEETS_NO_NEW: all results already reported`，然后**停止——不发送通知**。

5. **筛选编排**（核心步骤）：
   a. **聚类**：按照仍保留的推文所主张/讨论的内容，将其分成 2–4 个子叙事（例如，对于某个代币，可以分为“价格走势”“团队公告”“批评/FUD”“生态系统集成”）。命名应体现*切入角度*，而非主题。
   b. **按信号强度对每个聚类中的推文排序**（而非按原始互动量）：`signal = likes + 2×retweets + replies`，但应**降低**纯回复、泛泛喊单和近似重复改写内容的排序。除非能提供独特角度，否则丢弃总互动量低于 5 的推文。
   c. **每个聚类最多保留 2–3 条推文，总数控制在 7–10 条。**质量优先于数量——如果只有 5 条符合要求，就发送 5 条。不要为了凑数而添加内容。
   d. **提取每条推文的主张/信号**——说明*新颖或有趣之处*，而不是逐字转述。反例：“用户说代币正在上涨。”正例：“指出团队对推迟解锁一事保持沉默——这是首位公开提出该问题的主要持有者。”
   e. **生成一行信号摘要**，放在通知顶部——用一句观察概括对话的*整体形态*（例如：“情绪分化——4 条看好此次发布，3 条批评解锁条款。”）。

6. **保存并更新已读文件**（参见日志）。将每条保留推文的 URL（每行一个）追加到 `memory/fetch-tweets-seen.txt`（若不存在则创建）。

7. **通过 `./notify` 发送通知**，使用以下聚类输出格式：
   ```
   *Top Tweets — ${ARG} (${today})*
   _${signal_one_liner}_

   *${cluster_1_name}*
   1. x.com/handle — [insight summary]
   Likes: X | RTs: Y | Replies: Z
   [View tweet](https://x.com/handle/status/ID)

   2. x.com/handle — [insight summary]
   Likes: X | RTs: Y | Replies: Z
   [View tweet](https://x.com/handle/status/ID)

   *${cluster_2_name}*
   3. x.com/handle — [insight summary]
   ...
   ```
   单行信号摘要应使用斜体（`_..._`），直接放在标题下方；聚类标题使用 `*bold*`。

**状态码：**`FETCH_TWEETS_OK`（已通知）| `FETCH_TWEETS_EMPTY` | `FETCH_TWEETS_ERROR` | `FETCH_TWEETS_NO_NEW`。

---

## 分支：主题（`source:topic`）

概述 X 上围绕一个或多个可配置主题的最新讨论。

**已读集合：**`memory/tweet-roundup-seen.txt` + 最近 3 天的日志。

1. **确定主题列表**（按优先级排序）：
   1. 已设置 `ARG` → `TOPICS=("$ARG")`（单主题模式）。
   2. 否则，如果 MEMORY.md 中有 `## Tweet Roundup Topics` 章节 → 使用其中的项目符号行，每行作为一个查询。
   3. 否则，使用内置默认值：
      - `artificial intelligence OR AI agents OR LLM`
      - `crypto OR bitcoin OR DeFi`
      - `technology OR startups OR open source`

2. **按主题获取内容**——为每个主题跟踪 `SOURCE ∈ {api, websearch, failed}`。

   **路径 A——直接调用 X.AI curl**（主要路径）：对于每个主题，调用 Grok 的 `x_search`。
   ```bash
   FROM_DATE=$(date -u -d "yesterday" +%Y-%m-%d 2>/dev/null || date -u -v-1d +%Y-%m-%d)
   TO_DATE=$(date -u +%Y-%m-%d)
   PROMPT="Search X for recent tweets about: ${TOPIC}. Date range: ${FROM_DATE} to ${TO_DATE}. Return up to 8 substantive tweets. For each: @handle, full text, date, exact engagement counts (likes, retweets, replies; 0 if unknown), and the direct link https://x.com/handle/status/ID."
   jq -n --arg p "$PROMPT" '{model:"grok-4.6", input:[{role:"user",content:$p}], tools:[{type:"x_search"}]}' > /tmp/xai-ft-topic.json
   ./secretcurl -s -o /tmp/xai-topic-out.json -X POST "https://api.x.ai/v1/responses" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer {XAI_API_KEY}" \
     -d @/tmp/xai-ft-topic.json
   ```
   使用标准 `jq` 提取器解析。如果提取出文本，则设置 `SOURCE=api`。提取每条推文的 `@handle`、文本、互动量和永久链接。

**路径 B — WebSearch 回退方案**（仅当 `XAI_API_KEY` 未设置，或路径 A 出错/返回空结果时）：`site:x.com "<topic keywords>" after:<YESTERDAY>`。始终包含单词 "today" 和 `${today}`，以强制获取最新结果。丢弃所有可见日期早于 48 小时前的结果。每个主题最多收集 5 个候选结果。标记为 `SOURCE=websearch`。如果两条路径均未返回任何结果，则标记为 `SOURCE=failed`。

3. **评分和筛选。** 要求：具有已知的 `@handle`；具有 `https://x.com/<handle>/status/<id>` URL（如果缺失，则保留，但标记为“链接不可用”）；发布于 48 小时内；URL **不在** `SEEN_TWEETS` 中。计算 `signal_score = likes + 2×retweets + replies`（在没有互动计数的 WebSearch 路径中，使用结果排名作为弱代理指标）。**降权 50%**：对父推文的回复；与得分更高的推文近似重复的推文（文本重合度 >70% 或链接到相同 URL）。

4. **按主题策划：**
   - **0 个保留结果** → 删除该主题。不要填充内容。
   - **1–3 个保留结果** → 按 `signal_score` 从高到低排列。
   - **4 个及以上保留结果** → 分成 2–3 个子叙事（共享关键词/实体/主张）；为每个子叙事添加标签，并将各叙事排名第 1 的推文作为代表。
   为每条报告的推文撰写一条**洞察**（说明其主张/揭示了什么，而不是改写标题）。为每个主题撰写一行**对话态势**（“看涨势头强劲，反对者沉默”“对 X 的发布意见分化”“单一事件占据主导 — Y”）。

5. **通知。** 如果所有主题都被删除：记录 `TWEET_ROUNDUP_EMPTY`，然后**停止 — 不发送通知**。否则通过 `./notify` 发送（≤4000 个字符）：
   ```
   *Tweet Roundup — ${today}*
   _Source: api:X websearch:Y failed:Z_

   *[Topic 1]* — _conversation shape_
   - x.com/handle — insight (signal: 12.3k) [View](https://x.com/handle/status/ID)
   - x.com/handle — insight (signal: 4.1k) [View](https://x.com/handle/status/ID)

   *[Topic 2]* — _conversation shape_
   - x.com/handle — insight (signal: 8k) [View](https://x.com/handle/status/ID)
   ```
   仅当互动计数可用（api 路径）时显示 `signal: <score>`；在 WebSearch 路径中直接省略。

6. **持久化 + 记录日志**（参见“日志”）。将每个已报告的 URL（每行一个）追加到 `memory/tweet-roundup-seen.txt`（如果缺失则创建）。

**约束：**绝不发送空的汇总通知（宁缺毋滥）；绝不 `@handle` 任何人；绝不报告已存在于 `SEEN_TWEETS` 中的 URL。**状态码：**`TWEET_ROUNDUP_OK` | `TWEET_ROUNDUP_EMPTY`。

---

## 分支：账户（`source:account`）

两种子模式：**单个账号**（提供一个账号可供决策的摘要）与**所有已跟踪账号**（按主题分组的关注列表摘要）。根据 `ARG` 进行选择。

**已查看集合：**从最近 2 天的日志中，提取先前 `### fetch-tweets` 账户条目下的每个 `https://x.com/` URL，存入 `SEEN_URLS`。

### 账户 — 单个账号（`ARG` 是一个 @handle）

1. **规范化 `ARG`。** 移除开头的 `@`、`https://x.com/`、`https://twitter.com/`、`https://nitter.net/`，以及末尾的斜杠或 `/status/...`。转换为小写。如果为空、包含空格或长度 >15 个字符，则拒绝。拒绝时 → `REFRESH_X_NO_VAR`：发送 `./notify "fetch-tweets: REFRESH_X_NO_VAR — set an X handle"` 并以状态码 0 退出。将清理后的账号标识存储为 `ACCOUNT`。

2. **加载推文：**
   - **路径 A — X.AI API**（主要路径）：通过 Grok 的 `x_search` 搜索该账号最近发布的推文。
     ```bash
     PROMPT="Search X for the latest tweets, replies, and quote tweets from @${ACCOUNT} in the last 2 days. Return each with full text, timestamp, type (original|reply|quote), what it replies to/quotes if any, exact engagement counts (likes, retweets, replies; 0 if unknown), and the permalink https://x.com/${ACCOUNT}/status/ID. Skip retweets of others. Return chronological."
     jq -n --arg p "$PROMPT" '{model:"grok-4.6", input:[{role:"user",content:$p}], tools:[{type:"x_search"}]}' > /tmp/xai-ft-account.json
     ./secretcurl -m 30 -s -o /tmp/xai-account-out.json -X POST "https://api.x.ai/v1/responses" \
       -H "Content-Type: application/json" \
       -H "Authorization: Bearer {XAI_API_KEY}" \
       -d @/tmp/xai-ft-account.json
     ```
     使用标准 `jq` 提取器解析。记录 `source=api`。
   - **路径 B — WebFetch 回退方案**（仅当 `XAI_API_KEY` 未设置，或路径 A 出错／解析后的文本中没有 x.com 状态 URL 时使用）：使用以下提示词 WebFetch `https://x.com/${ACCOUNT}`：*"列出此个人资料中所有可见的推文、回复和引用推文，包括完整文本、时间戳、互动数（点赞／转推／回复，如有显示），以及永久链接 https://x.com/handle/status/ID。按时间顺序返回列表。"* 记录 `source=webfetch`。
   - **路径 C — 降级方案**：如果 `XAI_API_KEY` 未设置且 WebFetch 未返回任何内容 → 跳至步骤 8，状态设为 `REFRESH_X_NO_API_KEY`（缺少密钥）或 `REFRESH_X_ERROR`（已设置密钥，但两条路径均失败）。

3. **解析为结构化推文：** `url`、`text`、`timestamp`、`type`（原创／回复／引用）、`reply_to`、`quoted_text`、`likes`、`retweets`、`replies`。丢弃对他人推文的转推。缺失的计数 → 0。计算 `signal_score = likes + 2*retweets + replies − (3 if type=reply else 0)`。

4. **去重并设置门槛：** 丢弃 `url` 已存在于 `SEEN_URLS` 中的所有推文（`deduped_count`）。如果保留下来的推文少于 3 条，并且无法检测到任何线程（步骤 5）→ 跳至步骤 8，状态设为 `REFRESH_X_NO_NEW`（所有内容均被去重）或 `REFRESH_X_EMPTY`（账号未发布任何内容）。

5. **检测线程：** 线程 = `ACCOUNT` 在 30 分钟内发布的 2 条以上推文，且后续推文回复了较早的推文，或者与开篇推文共享 ≥2 个有意义的关键词。无论单条推文的分数如何，线程中的推文都作为不可拆分的整体单元。记录 `{opener_url, tweet_count, combined_signal}`。

6. **聚类并提取洞见：** 根据主题重合度，将保留下来的内容（线程 = 一个单元）归为 **2–4 个子叙事**；如果无法形成至少 2 个，则使用一个聚类。每个聚类包括：**标题**（3–8 个词）、**热门推文**（1–3 段摘录，每段 ≤200 个字符，附永久链接和互动数据）、**洞见**（一句话——说明该聚类揭示了作者的立场／主张／转变；不能只是复述——如果无法超越复述，就丢弃该聚类）。每个线程包括：1–2 句简明总结 + 开篇推文 URL。

7. **撰写结论**（必须且只能选择一个）+ 不超过 20 个词的导语：
   | 结论 | 适用情形 |
   |---|---|
   | `ANNOUNCEMENT` | 发布、招聘、政策或产品上线 |
   | `ARGUMENT` | 大部分信号来自反主流观点或争论 |
   | `BUILDING` | 发布成果／代码／技术进展类聚类占主导 |
   | `SHITPOST` | 笑话、梗图、无关紧要的闲聊占主导 |
   | `CONTEXT` | 主要是在回应新闻周期，而非推动新闻议题 |
   | `QUIET` | 原创推文少于 3 条，且没有线程 |

8. **保存摘要**（参见日志）。当状态为空/无新增/错误/无变量时，只写入账户标题 + 状态页脚，跳过聚类部分。

9. **更新 MEMORY.md（有条件）：** 仅当某个聚类包含公告、具体主张、具名项目或立场转变时，才在 `## Tracked X Accounts` 部分下添加一条项目符号（若不存在则创建）：`- @ACCOUNT YYYY-MM-DD: [one-sentence claim] — [permalink]`。不要记录改述内容/梗/泛泛观点。

10. **通过 `./notify` 发送通知。** 当状态为 `REFRESH_X_OK` 时：
    ```
    x refresh — @ACCOUNT ([VERDICT])
    [lede]
    top cluster: [title] — "[≤80 char excerpt]" ([likes]❤)
    [N tweets, T threads, K deduped]
    ```
    当状态为 `REFRESH_X_EMPTY` / `REFRESH_X_NO_NEW` 时：**跳过通知**（仅写入日志条目）。当状态为 `REFRESH_X_NO_API_KEY` / `REFRESH_X_ERROR` / `REFRESH_X_NO_VAR` 时：发送包含状态码 + 一行提示的通知（例如 `"fetch-tweets: REFRESH_X_NO_API_KEY — set XAI_API_KEY in workflow secrets"`）。

**约束：** 绝不捏造互动数据；绝不包含 `SEEN_URLS` 中的 URL；仅仅改述内容的洞见不算洞见（丢弃该聚类）；MEMORY.md 每次更新仅占一行。**状态码：** `REFRESH_X_OK` | `REFRESH_X_EMPTY` | `REFRESH_X_NO_NEW` | `REFRESH_X_NO_API_KEY` | `REFRESH_X_ERROR` | `REFRESH_X_NO_VAR`。

### account — 所有已跟踪账户（`ARG` 为空）

使用此功能回答关注列表中“*这些特定的人*发布了什么”。

1. **读取配置** `memory/topics/tracked-accounts.yml`。如果文件缺失或为 `accounts: []` → 记录 `TWEET_DIGEST_NO_CONFIG` 并退出（不发送通知）。模式：
   ```yaml
   accounts:
     - handle: vitalikbuterin
       why: ethereum core thinking      # optional — grouping/context label
     - handle: balajis
       why: macro + tech narratives
   ```

2. **获取每个账户的近期推文。** 对于每个 `handle`：
   - **路径 A — 实时 curl**（主要路径，`XAI_API_KEY` 已注入并设置）：
     ```bash
     PROMPT="Search X for the latest tweets from:${HANDLE} in the last 3 days. Return the 5 most interesting or substantive tweets. For each: full text, date, direct link (https://x.com/${HANDLE}/status/ID). Skip retweets of others."
     jq -n --arg p "$PROMPT" '{model:"grok-4.6", input:[{role:"user",content:$p}], tools:[{type:"x_search"}]}' > /tmp/xai-ft-acct1.json
     ./secretcurl -m 30 -s -o /tmp/xai-acct1-out.json -X POST "https://api.x.ai/v1/responses" \
       -H "Content-Type: application/json" \
       -H "Authorization: Bearer {XAI_API_KEY}" \
       -d @/tmp/xai-ft-acct1.json
     ```
     使用标准 `jq` 提取器解析。
   如果未设置 `XAI_API_KEY`，则记录 `TWEET_DIGEST_NO_KEY: skill requires XAI_API_KEY` 并退出（不发送通知）。
   **去重：** 丢弃 `SEEN_URLS` 中已存在的任何候选 URL（取最近 2 天的日志）。

3. **按主题而非账户分组。** 遍历完整的候选集；识别 2–4 个主题（例如“L2 设计决策”“宏观经济 / 利率”“AI 模型发布”“监管”）。每条推文映射到一个主题；对于单一主题的信息流，可以使用 `why:` 标签来辅助主题命名。

4. **为每条值得关注的推文写一句话概述**——说明推文讲了什么，而不是你对它的看法。语气遵循 **Voice** 一节。

5. **通过 `./notify` 发送通知**：
   ```
   *Tweet Digest — ${today}*

   *Theme: <theme>*
   @handle: <one-sentence summary> — [link](url)
   @handle: <one-sentence summary> — [link](url)

   *Theme: <theme>*
   ...
   ```
   如果所有账号中都没有值得关注的推文：记录 `TWEET_DIGEST_OK` 并结束（不发送通知）。

**状态码：** `TWEET_DIGEST_OK`（已通知或无异常）| `TWEET_DIGEST_NO_CONFIG` | `TWEET_DIGEST_NO_KEY`。

---

## 分支：列表（`source:list`）

过去 24 小时内所跟踪 X 列表中的跨列表叙事共鸣，以及按信号评分选出的热门推文。列表是*策展人信号*——其价值在于跨列表共鸣、洞见和判断，而不是简单地按列表罗列排名前 N 的内容。

**已查看集合：** `memory/list-digest-seen.txt` + 过去 2 天的日志。

1. **解析并验证 `ARG`。**
   ```bash
   if [ -z "$ARG" ]; then
     echo "LIST_DIGEST_NO_CONFIG: var must contain at least one X list ID" \
       >> "memory/logs/$(date -u +%Y-%m-%d).md"
     exit 0
   fi
   IDS_PART="${ARG%%|*}"
   TOPIC_FILTER=""
   [ "$ARG" != "$IDS_PART" ] && TOPIC_FILTER="${ARG#*|}"
   for LIST_ID in $(echo "$IDS_PART" | tr ',' ' '); do
     if ! [[ "$LIST_ID" =~ ^[0-9]+$ ]]; then
       echo "LIST_DIGEST_NO_CONFIG: invalid list ID '$LIST_ID' (must be numeric)" \
         >> "memory/logs/$(date -u +%Y-%m-%d).md"
       exit 0
     fi
   done
   ```
   如果未设置 `XAI_API_KEY`，则回退到路径 B。如果所有路径都未返回数据，则记录 `LIST_DIGEST_NO_CONFIG: XAI_API_KEY required`，并在不发送通知的情况下停止。

2. **获取每个列表的热门推文（过去 24 小时）**——优先使用 API，WebSearch 作为回退方案。
   **路径 A——X.AI Responses API**（主要路径）：
   ```bash
   FROM_DATE=$(date -u -d "yesterday" +%Y-%m-%d 2>/dev/null || date -u -v-1d +%Y-%m-%d)
   TO_DATE=$(date -u +%Y-%m-%d)
   PROMPT="Look at X list https://x.com/i/lists/${LIST_ID}. Step 1: report the list name and a one-line description. Step 2: identify the most engaging tweets posted by members of this list between ${FROM_DATE} and ${TO_DATE} UTC. Return the top 12 tweets ranked by engagement (likes, retweets, replies). For EACH tweet you MUST return: (a) @handle, (b) the full tweet text (not a paraphrase), (c) explicit engagement counts as separate fields — likes:N, retweets:N, replies:N, views:N if available, (d) the direct permalink in the form https://x.com/<handle>/status/<id>, (e) media type (image|video|none), (f) one-line context if it's a reply or quote tweet (who/what). Skip retweets of accounts NOT on this list. If a tweet has an image and you can analyze it, include a one-line image description."
   jq -n --arg p "$PROMPT" --arg fd "$FROM_DATE" --arg td "$TO_DATE" \
     '{model:"grok-4.6", input:[{role:"user",content:$p}], tools:[{type:"x_search", from_date:$fd, to_date:$td, enable_image_understanding:true}]}' \
     > /tmp/xai-ft-list.json
   ./secretcurl -s -o /tmp/xai-list-out.json --max-time 180 -X POST "https://api.x.ai/v1/responses" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer {XAI_API_KEY}" \
     -d @/tmp/xai-ft-list.json
   ```
   使用标准 `jq` 提取器进行解析。
   **路径 B——WebSearch 回退方案**（仅当未设置 `XAI_API_KEY`，或路径 A 出错/未返回任何内容时）：`site:x.com "i/lists/${LIST_ID}" OR list:${LIST_ID} after:${FROM_DATE}`。质量较低；将此列表的来源标记为 `websearch`。
   **单个列表的结果：** `ok`（≥3 条推文）| `quiet`（1–2 条）| `empty`（0 条，已找到列表但没有帖子）| `error`（API/访问失败——注明原因）。

3. **构建候选池。** 为每条推文记录 `{handle, text, likes, retweets, replies, views, url, list_ids_seen_on:[], list_names_seen_on:[], media, is_reply, is_quote}`。**跨列表按 URL 去重**——同一条推文出现在多个列表中 → 合并记录，同时保留 `list_ids_seen_on` 和 `list_names_seen_on`（跨列表出现是一种信号）。**根据历史记录去重**——丢弃已存在于 `memory/list-digest-seen.txt` 或最近 2 天日志中的 URL。

4. **为每个候选项评分**（对互动量取自然对数，避免一条爆款推文主导结果）：
   ```
   base = ln(1+likes) + 2.0*ln(1+retweets) + 1.5*ln(1+replies)
   bonuses:
     +2.0  appeared on ≥2 distinct lists (cross-list resonance)
     +1.5  appeared on ≥3 distinct lists
     +1.0  topic_filter set AND tweet text/context matches (case-insensitive substring or obvious semantic match)
     +0.5  small-account-signal (≤25k followers per Grok's note OR no follower data + technical/insider content)
     +0.3  media is image OR video
   penalties:
     -1.0  is_reply AND replied-to NOT on any tracked list
     -0.5  pure link share with <10 words of original commentary
   score = base + sum(bonuses) - sum(penalties)
   ```

5. **聚类为跨列表叙事**，需同时满足以下所有条件：来自 ≥2 个不同列表的 ≥2 条推文；共享 ≥2 个实质性关键词/实体（专有名词、项目名称、股票代码、技术术语——忽略停用词）；发布于同一个 24 小时时间窗口内。`narrative score = sum of constituent tweet scores`；**叙事标题**不超过 80 个字符，应概括该聚类共同表达的内容。选择一条**锚点推文**（单条得分最高）以及最多 2 条支持推文。**聚类数量上限：**如果聚类结果少于 2 个或多于 4 个，则回退为扁平化排名列表，并使用内联 `[cluster-name]` 标签（不设置“🔗 跨列表叙事”部分）。

6. **编写摘要**（上限 4000 个字符）：顶部最多展示 **3 个叙事**（按叙事得分排序）；然后每个列表最多展示 **5 条独立推文**（单条得分最高，且尚未纳入任何叙事）；总数硬性上限为 **12 项**——从独立推文的末尾开始删减。**洞见规范：**每一项都需要一行**意义解读**（影响、逆向观点、缺失的数字、交易流信号）；不得只是改写原文。**低活跃列表规则：**如果某个列表中得分最高的存留推文低于 2.0（约等于原始点赞数少于 8），则为该列表写一行“今日低活跃”。**主题过滤器**是评分加成项（第 4 步），而不是硬性过滤条件。**结论行：**最顶部用一行概括今天这些列表共同传达的信息。

7. **通过 `./notify` 发送通知**，严格采用以下格式（`x.com/handle`、`[label](url)`）：
   ```
   *List Digest — ${today}*

   [VERDICT LINE — one line, ≤140 chars, plain text]

   🔗 *Cross-list narratives*
   1. *[narrative title]* — appeared on [List A] + [List B]
      x.com/handle: [insight, not paraphrase] (♥ likes, ↻ rt) — [View](url)
      x.com/handle2: [insight] (♥ likes, ↻ rt) — [View](url)

   2. *[narrative title]* — appeared on [List A] + [List C]
      ...

   *[List Name 1]*
   - x.com/handle — [insight] (♥ likes, ↻ rt) — [View](url)
   - x.com/handle — [insight] (♥ likes, ↻ rt) — [View](url)

   *[List Name 2]*
   - quiet day

   ---
   sources: list1=ok | list2=quiet | list3=error(no-access)
   status: LIST_DIGEST_OK
   ```
   如果跨列表叙事为空，则删除整个相应部分。如果每个列表的状态都是 `quiet`/`empty`，则发送单行“*List Digest — ${today}* — 所有跟踪列表均无动态”，而不是用无意义内容填充。

8. **记录并持久化**（参见日志）。将每个已报告的 URL（每行一个）追加到 `memory/list-digest-seen.txt`（若不存在则创建）。

**退出状态分类：** `LIST_DIGEST_NO_CONFIG`（变量为空/无效，或没有获取路径——仅记录日志）| `LIST_DIGEST_EMPTY`（每个列表均为 0 条推文，或所有候选项均已见过——仅记录日志）| `LIST_DIGEST_PARTIAL`（部分列表成功/部分失败——通知成功获取的内容，并呈现失败情况）| `LIST_DIGEST_OK`（≥1 条新推文——发送通知）。

---

## 分支：agent-buzz (`source:agent-buzz`)

一个按主题筛选的预设：经过策划且关注叙事脉络，解读过去 24 小时内 X 上的 AI 智能体圈子都在讨论什么。**重在策划，而非聚合**——分成 2 个集群的 6 条高信号推文，胜过混杂着各种噪声的 10 条推文。`ARG`（可选）是要优先关注的项目/主题。

**已见集合：**最近 3 天的日志——提取此技能已发布的每个 `https://x.com/.../status/<id>`；将这些 ID 视为去重集合。

1. **获取候选项：**
   ```bash
   FROM_DATE=$(date -u -d "1 day ago" +%Y-%m-%d 2>/dev/null || date -u -v-1d +%Y-%m-%d)
   TO_DATE=$(date -u +%Y-%m-%d)
   ```
   **路径 A——X.AI API**（首选；每条推文的响应**必须**包含明确的互动数据和关注者数量，否则无法执行第 3 步的评分）：
   ```bash
   PROMPT="Search X from ${FROM_DATE} to ${TO_DATE} for tweets in the AI-agents conversation: autonomous agents, agent frameworks, MCP / agent protocols, agent products, agent benchmarks, agent research papers. Return up to 40 candidates. For EACH candidate you MUST return: @handle, follower_count (integer or null), role_guess (builder|founder|researcher|investor|commentator|anon), one-line claim (what they actually said — not a paraphrase, the thesis), likes (int), retweets (int), replies (int), posted_at (ISO), direct_link (https://x.com/username/status/ID). Prefer builders/founders/researchers. Skip obvious engagement-farming threads (\"RT if you agree\", reply-guy pileons, giveaways)."
   jq -n --arg p "$PROMPT" --arg fd "$FROM_DATE" --arg td "$TO_DATE" \
     '{model:"grok-4.6", input:[{role:"user",content:$p}], tools:[{type:"x_search", from_date:$fd, to_date:$td}]}' \
     > /tmp/xai-ft-buzz.json
   ./secretcurl -s -o /tmp/xai-buzz-out.json -X POST "https://api.x.ai/v1/responses" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer {XAI_API_KEY}" \
     -d @/tmp/xai-ft-buzz.json
   ```
   使用标准 `jq` 提取器解析。记录 `source=xai`。
   **路径 B——WebSearch 后备方案**（仅当 `XAI_API_KEY` 未设置，或路径 A 出错/返回空结果时）：强制获取最新内容的查询 `"AI agents twitter today ${today}"`——丢弃超过 48 小时的任何内容，预期元数据质量会有所下降。记录 `source=websearch`。

   如果设置了 `ARG`，还需使用相同的模式发起第二次调用，并将范围限定为该主题；合并结果。

2. **跳过条件**（聚类之前）——丢弃符合以下任意条件的候选项：
   - **重复：**`status/<id>` 已存在于 3 天去重集合中。
   - **互动诱导：**投票帖串、“bookmark this”、“drop a 🔥”，以及点赞数低于 <follower_count/10 的跟风回复围攻。
   - **仅自我推广：**纯粹推销产品，没有观点/基准测试/数据点。发布推文如果包含具体的能力声明或数字，则可以保留。
   - **时效性不足：**`posted_at` 早于 30 小时前。
   - **匿名且互动量低：**role_guess=anon 且 (likes+retweets) < 200。

3. **信号评分：** `signal = likes + 2*retweets + replies`，然后，如果 role_guess ∈ {builder, founder, researcher}，则 × 1.3；如果只是没有具体指代对象的纯热点观点（未提及具体项目、数字、论文或基准测试），则 × 0.7；如果与另一条保留下来的推文近乎重复，则 × 0.5（只保留得分较高的一条）。

4. **叙事聚类：** 将保留下来的推文归入 **2–4 个叙事聚类**——聚类应代表共同的*论点*，而非关键词（应为“MCP 供应商锁定之争”，而非“MCP”）。每个聚类名称不超过 5 个词。如果某个聚类包含超过 60% 的推文，则将其拆分。不属于任何聚类的推文应被丢弃，除非其信号得分位列总体前三。目标：**2–4 个聚类，每个包含 2–3 条推文，总计 6–9 条（严格不超过 10 条）。**

5. **洞察提取**——每条推文对应一行**洞察**（不超过 20 个词）：提取实际主张或数据点，而不是改述；如果是观点，应说明*他们反对什么*；如果是公告，应说明*与此前已有成果相比新增了什么*（而不是“X 发布了”）。**反炒作检查**——改写任何包含以下内容的洞察：`game-changing`、`revolutionary`、`mind-blowing`、`wild`、`huge`、`massive`、`unreal`、`insane`，以及含糊的“AI agents are evolving”“the future of X”。

6. **对话脉络导语**——用一个开场句（不超过 25 个词）点明讨论实际围绕什么展开（“主要是协议之争——MCP 与 A2A——此外还有两个具体产品发布。”）。如果无法用一句话如实概括，说明聚类有误——重新执行第 4 步。

7. **通过 `./notify` 发送通知：**
   ```
   *Agent Buzz — ${today}*
   _<conversation-shape one-liner>_

   **<Cluster 1 name>**
   • @handle — <insight>
     <link>
   • @handle — <insight>
     <link>

   **<Cluster 2 name>**
   • @handle — <insight>
     <link>

   <!-- _src: xai|websearch · candidates: N → kept: M_ -->
   ```
   保留页脚——未来进行自我审计时，要靠它调试内容为空的日期。绝不要为了凑满 10 条而填充内容。6 条优质内容 > 10 条平庸内容。

**状态码：** `AGENT_BUZZ_OK`（已通知至少 1 个聚类）| `AGENT_BUZZ_EMPTY`（获取成功，但没有内容通过筛选——发送 `Agent Buzz — ${today}: quiet day, no survivors.`）| `AGENT_BUZZ_ERROR`（所有来源均失败——发送 `Agent Buzz — ${today}: all sources failed (${error summary}).`，并记录每个来源的失败情况）。

---

## 日志（所有分支）

每次运行都在 `memory/logs/${today}.md` 的单个 `### fetch-tweets` 标题下追加一条记录（健康检查循环会解析此结构）。第一项必须是标明所运行分支/模式的**判别项**；其余项目应为分支专属内容。始终以项目符号形式包含已上报的推文 URL（供下次运行去重）。

```
### fetch-tweets
- mode: <keyword|topic|account|list|agent-buzz>
- status: <STATUS_CODE for the branch that ran>
- source: <SOURCE_PATH / per-source counts / per-list outcome, as applicable>
- <branch-specific bullets — carry over each branch's fields:>
    - keyword:     signal one-liner; per-cluster URLs with `likes:N rts:N replies:N` + insight
    - topic:       `topics: [t1: N tweets, t2: 0 (dropped)]`; `source: cache:X websearch:Y failed:Z`
    - account(1):  Verdict + lede; Counts (N tweets, X orig/Y reply/Z quote, T threads, deduped K); Clusters; Threads; Vibe
    - account(all):themes covered; per-account tweet counts
    - list:        Lists tracked; Per-list `list1=ok(N) | list2=quiet(N) | list3=error`; Verdict; Narratives count
    - agent-buzz:  source used; candidates N → kept M; cluster names
- urls:
    - https://x.com/handle1/status/...
    - https://x.com/handle2/status/...
```

对于空结果/无新内容/错误/无配置状态，只写入 `### fetch-tweets` 标题以及 `mode:` 和 `status:` 项目符号（跳过详细信息部分），以便 skill-health 仍能观测到本次运行。记录日志后，如果对应分支存在持久化的已查看文件，则更新该文件（keyword / topic / list——参见已查看文件表）。

## 输出格式说明

截至本次提交，没有链消费此技能的输出（不存在 `consume: [fetch-tweets]` 引用）。如果下游链步骤开始消费它，请先输出一个扁平的 URL 列表，再输出聚类/分支内容，以免聚类或叙述性标题破坏消费者的处理逻辑。

## 获取数据（所有分支）

此技能的 `XAI_API_KEY` **会注入到你的环境中**（已在 `requires:` 中声明）。它存在且有效。**每个分支的主要获取路径都是直接使用 `curl` 请求 `https://api.x.ai/v1/responses`，并设置 `Authorization: Bearer {XAI_API_KEY}`。** 不存在阻止此请求的网络沙箱；此技能的早期版本曾声称存在——该说法已经过时且不正确。直接发起请求即可。

**在使用任何回退方案之前，你必须尝试直接使用 curl。** 规则如下：

1. **检查，不要假设。** 运行 `[ -n "$XAI_API_KEY" ] && echo KEY_PRESENT || echo KEY_UNSET`。如果输出 `KEY_PRESENT`（实际会如此），则必须尝试路径 A。
2. **留出足够的时间。** `x_search` 调用通常需要 30–120 秒（它会实时搜索 X）。当你调用 Bash 工具执行 curl 时，**将工具的 `timeout` 设置为至少 180000（180 秒）**，并在 curl 本身添加 **`--max-time 150`**，使其能够明确失败而不是一直挂起。curl 响应缓慢**并不**意味着密钥缺失——不要将超时视为“密钥不可用”。
3. **捕获 HTTP 状态码**，确保回退决策基于事实而非假设。首先使用 `jq -n` 将 JSON 请求体构建到固定文件中（如上述各分支所做），然后使用 `-d @file` 发送——每条 `./secretcurl` 命令都必须是 100% 字面量（不能包含 `$VAR`，否则权限层会阻止执行）：
   ```bash
   HTTP=$(./secretcurl -s -o /tmp/xai.json -w '%{http_code}' --max-time 150 -X POST "https://api.x.ai/v1/responses" \
     -H "Content-Type: application/json" -H "Authorization: Bearer {XAI_API_KEY}" -d @/tmp/xai-ft-keyword.json)
   echo "xai http=$HTTP bytes=$(wc -c </tmp/xai.json)"
   ```
   然后使用标准 `jq` 提取器解析 `/tmp/xai.json`。`HTTP=200` 且响应体非空 → 使用该结果（`SOURCE_PATH=api`）。
4. **仅在确实失败时才回退**，并且**记录真实原因**——密钥已设置时，绝不要写“XAI_API_KEY 不可用”。使用以下原因之一：`key-unset`（仅当步骤 1 输出 `KEY_UNSET` 时）、`http-<code>`（非 2xx）、`empty`（状态码为 200，但未解析出推文）、`timeout`（curl 超过 `--max-time`）。

**WebSearch / WebFetch 仅作为最终回退方案**——其质量较低（WebSearch 倾向于返回较旧的高互动量推文）。密钥有效时，绝不要使用它们。

## 环境变量

- `XAI_API_KEY` — 用于 Grok 的 `x_search` 工具的 X.AI API 密钥。已在 `requires:` 中声明，因此它会**注入到此技能的环境中**，并作为每个分支的主要获取路径。如果它确实未设置，各分支会降级为质量较低的 WebSearch/WebFetch；但 `account (all)` 子模式会直接硬退出（`TWEET_DIGEST_NO_KEY`）。