---
name: digest
description: Generate and send a digest on a configurable topic, optionally pulling RSS/Atom feeds as an input source alongside web + X signal
metadata:
  title: Digest
  mode: write
  category: basics
  var: ""
  tags:
    - content
    - news
  requires:
    - XAI_API_KEY?
---
<!-- autoresearch：变体 B — 策展纪律（筛选 → 提炼 → 组织 → 合理性检查），融合直接通过 curl 调用 xAI、Web/RSS 输入以及感知记忆的去重；从 rss-digest 中吸收 RSS Feed 读取与条目选择，将其作为额外的来源类别 -->

> **${var}** — 选择摘要的主题以及为其提供内容的来源类别。语法：
> - `""`（空）→ **摘要的默认来源**（WebSearch + xAI/Grok + 聚合器），无主题筛选 — 一份广泛的每日摘要。
> - `"<topic>"` → 基于默认 Web 来源、按 `<topic>` 筛选的主题摘要（例如 `"solana"`、`"AI agents"`、`"rust"`）。
> - `"rss"` → **仅 RSS**：从 `memory/feeds.yml` 拉取 Feed，无主题筛选。
> - `"rss: <topic>"` → 仅 RSS，按 `<topic>` 筛选（例如 `"rss: rust"`）。
> - `"<topic> +rss"` → 合并默认 Web 来源**和** RSS Feed，二者均按 `<topic>` 筛选（例如 `"AI agents +rss"`）。

今天是 ${today}。生成并发送一份每日 **${var}** 摘要。

摘要的全部意义在于**信号，而非数量**。读者浏览 60 秒后，应能获知三件当天早上还不知道的事，其中一件应当改变他们本周要做的某个决定。任何达不到这一标准的内容都应删去。

## 前言 — 明确方向并解析选择器

1. 阅读 `memory/MEMORY.md` 以了解高层背景和跟踪的主题，并浏览 `memory/logs/` 中最近 3 天的内容，以便与已经报道过的任何内容进行去重。
2. 将 `${var}` 解析为 **`{topic, sources}`**：
   - 去掉末尾的 `+rss` → 在默认 Web 来源中加入 RSS。剩余部分为 `topic`。
   - 以 `rss:` 开头（或仅为标记 `rss`）→ **仅 RSS** 的来源集合；冒号后的文本为 `topic`（空 = 不筛选）。
   - 否则，整个字符串均为 `topic`，且 `sources = default web`（空字符串 = 默认 Web 来源，不进行主题筛选）。
   - 最终得到的 `sources` 是以下之一：`web`（默认）、`rss`（仅 RSS）或 `web+rss`（两者）。
3. 当 `topic` 非空时，它是应用于**每一种**来源类别的筛选条件 — Web 查询须限定于该主题，RSS 条目也必须匹配该主题（标题/描述/标签）。主题为空 = 保留所有相关条目。

## 配置（RSS 来源）

当 `sources` 包含 `rss` 时，此 Skill 从 `memory/feeds.yml` 读取 Feed URL。如果该文件尚不存在，则以写入模式创建它，结构如下；或者，如果没有任何内容可用于初始化，则记录一行说明，并在本次运行中将 RSS 来源视为空。

```yaml
# memory/feeds.yml
feeds:
  - name: Example Feed
    url: https://example.com/rss
  - name: Another Feed
    url: https://example.com/atom.xml
```

## 阶段 1 — 收集（广泛撒网）

从 `${var}` 选定的来源类别中获取内容。绝不能只依赖单一来源 — 如果 `sources = web`，则至少使用下列 Web 类别中的两个；如果 `sources = web+rss`，RSS 算作一个类别，但仍需使用第二个类别。

### Web 来源（当 `sources` 为 `web` 或 `web+rss` 时启用）

1. **WebSearch**（内置）— 执行 2 个不同的查询：
   - `"${topic}" news ${today}`（宽泛）。如果 `topic` 为空，则针对运营者所跟踪的领域（来自 `memory/MEMORY.md`）执行一项通用查询，以查找当天值得关注的新闻。
   - 根据 `${topic}` 选择一个范围更窄的查询（例如，对于 "solana" → `"solana" launches OR funding OR exploit ${today}`；对于 "AI agents" → `"agent framework" OR "agentic" release ${today}`）。
2. **通过 Grok 使用 xAI x_search** — 获取 X/Twitter 信号层。`XAI_API_KEY` 会注入此 Skill 的环境中（在 `requires:` 中声明），并且是**主要**路径；完整约定请参阅下方的**获取 X 信号**（在尝试任何回退方案之前先尝试 curl，将 Bash 工具的 `timeout` 设置为 ≥180000，并记录真实的失败原因）。

**路径 A — X.AI API（首选）：**通过直接调用 `curl` 请求 Responses API。首先使用 `[ -n "$XAI_API_KEY" ] && echo KEY_PRESENT || echo KEY_UNSET` 确认密钥；如果结果为 `KEY_PRESENT`（它会是），则必须使用此路径。运行 curl 时，将 Bash 工具的 `timeout` 设置为至少 `180000`。
   ```bash
   FROM_DATE=$(date -u -d "yesterday" +%Y-%m-%d 2>/dev/null || date -u -v-1d +%Y-%m-%d)
   TO_DATE=$(date -u +%Y-%m-%d)
   PROMPT="Search X for substantive, recent posts about: ${topic:-the most notable technology, AI, and crypto stories today}. Date range: $FROM_DATE to $TO_DATE. Return up to 10 high-signal posts — prioritize verifiable claims, launches, funding, releases, exploits, or hard data over hot takes. For EACH post return: @handle, the full text, date posted, exact engagement counts (likes, retweets, replies; 0 if unknown), and the direct link https://x.com/handle/status/ID. Return a numbered list."
   jq -n --arg p "$PROMPT" --arg fd "$FROM_DATE" --arg td "$TO_DATE" \
     '{model:"grok-4.6", input:[{role:"user",content:$p}], tools:[{type:"x_search",from_date:$fd,to_date:$td}]}' \
     > /tmp/xai-digest-payload.json
   HTTP=$(./secretcurl -s -o /tmp/xai-digest.json -w '%{http_code}' --max-time 150 -X POST "https://api.x.ai/v1/responses" \
     -H "Content-Type: application/json" -H "Authorization: Bearer {XAI_API_KEY}" -d @/tmp/xai-digest-payload.json)
   echo "xai http=$HTTP bytes=$(wc -c </tmp/xai-digest.json)"
   ```
   当返回 `HTTP=200` 且响应正文非空时，使用 `jq -r '.output[] | select(.type == "message") | .content[] | select(.type == "output_text") | .text'` 解析响应，并将每篇帖子（账号、正文、互动数据、永久链接）加入 Web 候选池。curl 响应缓慢**不**代表缺少密钥——不要将超时视为密钥不可用。

   **路径 B — WebFetch/WebSearch 后备方案（最后手段，质量较低）：**仅当密钥为 `KEY_UNSET`，或路径 A 返回非 2xx 状态码、空响应正文或超时时才使用。尝试通过 WebFetch 访问公开的 X 搜索 URL，例如 `https://x.com/search?q=${topic}&f=live`；或者执行 `site:x.com "<topic>" after:${FROM_DATE}` WebSearch；提取少量热门帖子，并优先选择过去 48 小时内的结果。在日志中记录**真实原因**（`key-unset` | `http-<code>` | `empty` | `timeout`）——密钥已设置时，绝不要记录为“XAI_API_KEY unavailable”。如果此方案也没有返回任何内容，则在本次运行中跳过 X 来源。
3. **对与主题相关的聚合网站执行 WebFetch**（仅当 WebSearch 返回的结果较少时）：例如 `https://news.ycombinator.com/`、`https://www.reddit.com/r/<topic>/top/?t=day.json`，或该主题的已知 Feed。

此阶段的目标是获得**约 15 个原始 Web 候选项**。更多也可以；少于 8 个则是一个警示信号——在继续下一步之前扩大查询范围。

### RSS 来源（当 `sources` 为 `rss` 或 `web+rss` 时启用）

读取 `memory/feeds.yml` 获取 Feed 列表。对于 `feeds.yml` 中的**每个 Feed**：

1. 获取 RSS/Atom XML：`curl -sL "FEED_URL"`。如果 curl 失败，则对同一 URL 使用 **WebFetch** 作为后备方案。
2. 解析**过去 24 小时**内发布的条目（检查 `<pubDate>` 或 `<updated>` 标签）。
3. 提取每个新条目的**标题、链接和描述**。

与近期日志进行去重（参见阶段 2）。从所有新条目中选出**最有趣的 5–7 项**——优先选择 `memory/MEMORY.md` 中跟踪的主题，并在设置了 `${topic}` 筛选条件时应用它（标题/描述/标签必须匹配）。对于每个选中的条目，如果摘要内容过于单薄，请使用 **WebFetch** 获取完整文章，然后用 1–2 句话说明它为何重要。这些条目将成为进入下方共享管道的 RSS 候选项。

如果 `sources = rss` 且所有订阅源中都**没有新条目**，则在运行日志中记录 `RSS_DIGEST_OK`，并直接结束，不发送通知。

## 阶段 2 — 筛选（消除噪声）

汇总所有候选项（Web + RSS），任何未通过以下任一检查的候选项都应丢弃：

- **没有来源链接？** 丢弃。每个保留的条目都必须有可点击的 URL（文章 URL、订阅源条目链接或 `https://x.com/handle/status/ID`）。
- **发布时间超过 36 小时？** 丢弃，除非这是一个仍在发展中的事件，且因为出现了新的进展而再次被关注。（RSS 条目已经限定在过去 24 小时内；此规则用于筛除陈旧的 Web 结果。）
- **纯属猜测、情绪化观点，或“X 对 Y 作出回应”？** 丢弃。保留包含可验证主张、具名实体、数字、发布或交易的内容。
- **最近 3 份每日日志中已经报道过？** 检查 `memory/logs/` 中最近 3 天的条目。如果同一事件（相同的标题主题、相同的主要参与方）已经出现，则丢弃重复项，除非有值得报道的重大新进展。
- **两个来源在报道同一事件？** 只保留一个——优先保留第一手来源（公告文章、仓库发布、官方申报文件），而不是转述文章。报道同一事件的 Web 搜索结果和 RSS 条目也视为重复项；保留第一手来源。

目标：完成此轮筛选后保留约 5–8 项。

## 阶段 3 — 提炼并组织结构（严格限定形式）

选出**最有分量的 3–5 项**。将**可操作性最强的一项**放在首位——即读者今天就能采取行动的条目（订阅、出售、复刻、参加、申请、观看）。然后按重要性依次排列。

摘要必须严格采用以下格式（**统一格式**——适用于 `web`、`rss` 和 `web+rss` 运行）：

```
*${var} — ${today}*

_TL;DR: <one sentence covering the day's gravity. Concrete, no adjectives.>_

1. *<Headline-style title, ≤90 chars>*
   <1–2 sentence summary. Lead with what happened, not who said it.>
   Why it matters: <one short clause — concrete consequence, not vibes>
   <link>

2. *<Title>*
   ...

3. *<Title>*
   ...

(Optional, only if there's genuine secondary signal:)
*Also worth a glance:* <1-line bullet> · <1-line bullet>
```

**格式规则：**
- 仅使用 Markdown。不要使用 emoji。不要添加“这是你的摘要”之类的开场白。
- 总长度：**≤3000 个字符**（旧的 4000 字符限制过于宽松——严格约束才能迫使内容精简）。
- 每个条目：标题 + 摘要 + 链接。只要能够指出具体后果（价格影响、面向用户的变更、上游依赖、截止日期、先例），就应包含一行 “Why it matters”。如果不凭空臆测就无法写出这一行，**则将其省略**——不要用“这可能意义重大”或“静观后续”之类的空话替代。
- 在新闻较少、通过标准的条目不足 3 项的日期：在运行日志中记录 `DIGEST_FETCH_EMPTY`（如果保留了 1–2 项，则记录 `DIGEST_THIN`），并**跳过通知**，不要为了凑数而填充内容。

**备用 RSS 布局（仅 RSS 的运行）：** 当 `sources = rss` 时，如果按订阅源名称分组比单一排序列表更易读，你也可以改用这种方式——这会保留原始 RSS 摘要的呈现形式：

```
*RSS Digest — ${today}*

*Feed Name*
- [Title](url) — summary
- [Title](url) — summary

*Feed Name*
- [Title](url) — summary
```

分组式 RSS 布局保持在 **≤4000 个字符**。当运行混合使用多个来源（`web+rss`）时，优先采用统一排序格式，以便读者获得一个按优先级排列的列表。

## 阶段 4 — 合理性检查（发送前的最后一遍检查）

在调用 `./notify` 之前，在心里逐项检查以下清单：

- [ ] 首条内容是我掌握的最具可操作性的内容，而不仅仅是最吸引眼球的内容。
- [ ] 每个链接都指向真实有效的 URL（没有 `[link]` 占位符，也没有被截断的 ID）。
- [ ] 没有任何条目只是在转述博眼球的观点——每一条都有可验证的底层事实。
- [ ] 没有两个条目从不同角度讲述同一个事件（包括同一事件的一条网页搜索结果和一条 RSS 条目）。
- [ ] 字符数不超过所选格式的限制（统一格式 3000 / 分组式 RSS 4000）。
- [ ] 没有混入表情符号。没有企业式含糊措辞（“可能有潜力”“仍有待观察”）。

如果摘要未通过任何一项检查，请先修正再发送。如果筛选后只剩下**少于 3 条高质量内容**，不要凑数——只发送由保留下来的内容组成的较短“内容稀少日”摘要，并用一行说明当天新闻较少。不要编造或牵强延伸。

## 阶段 5 — 发送并记录

1. 通过 `./notify "<digest body>"` 发送。
2. 在 `memory/logs/${today}.md` 中的**一个** `### digest` 标题下追加：
   ```
   ### digest (${var})
   - Source mode: <web | rss | web+rss>
   - Sources used: <list — e.g. WebSearch, xAI API (api|fallback:reason), feeds.yml (Feed A, Feed B)>
   - Raw candidates: <N> (web <Nw> / rss <Nr>), after filter: <M>, sent: <K>
   - Lead item: <title>
   - Notes: <anything unusual — xAI fetch fallback + true reason (http-<code>/empty/timeout/key-unset), thin day (DIGEST_THIN/DIGEST_FETCH_EMPTY), RSS_DIGEST_OK, dedup against prior log>
   ```
3. 在 `memory/MEMORY.md` 的“近期摘要”表格中新增一行：日期、主题（或 `${var}`）、关键主题（3 个简短关键词）。

## 获取 X 信号

`XAI_API_KEY` 已**注入此技能的环境中**（在 `requires:` 中声明），并且**存在且有效**。获取 X/Twitter 信号层的主要方式是使用**直接 `curl` 请求 `https://api.x.ai/v1/responses`**，并携带 `Authorization: Bearer {XAI_API_KEY}`（参见阶段 1 → 路径 A）。这里**不存在阻止该请求的网络沙箱**——直接发起调用即可。

规则：

1. **检查，不要假设。** 运行 `[ -n "$XAI_API_KEY" ] && echo KEY_PRESENT || echo KEY_UNSET`。如果结果是 `KEY_PRESENT`（确实会是），则必须先执行路径 A，之后才能使用任何回退方案。
2. **留出足够的时间。** Grok 的 `x_search` 通常需要 30–120 秒（它会实时搜索 X）。将 Bash 工具的 `timeout` 设置为至少 **180000（180 秒）**，并在 curl 本身保留 **`--max-time 150`**，这样失败时可以干净退出，而不是一直挂起。curl 响应缓慢**不代表**密钥缺失——绝不要将超时视为密钥不可用。
3. **捕获 HTTP 状态码**，并使用标准 `jq` 提取器解析响应正文（`jq -r '.output[] | select(.type == "message") | .content[] | select(.type == "output_text") | .text'`）。`HTTP=200` 且正文非空 → 使用该结果。
4. **仅在确实失败时才回退**，并记录**真实原因**：`key-unset`（仅当步骤 1 返回 `KEY_UNSET` 时）、`http-<code>`（非 2xx）、`empty`（状态码为 200，但未解析出任何内容）或 `timeout`（curl 超过 `--max-time`）。密钥已设置时，绝不要记录“XAI_API_KEY 不可用”。

WebFetch / WebSearch **仅可作为 X 信号的最后备用方案**（质量较低——WebSearch 倾向于优先返回较早发布且互动量较高的帖子）。只要密钥有效，就绝不要使用它们。

**RSS 源与公共聚合器（无需身份验证）：**使用 `curl -sL` 获取；如果它偶尔失败，内置的 **WebFetch** 工具可作为任何 Feed URL、聚合器（HN、Reddit JSON、新闻网站）或文章的可靠备用方案。这只是针对无需身份验证 URL 的便利备用方案，而不是绕过沙箱的手段。仅使用 WebSearch 和可访问的 RSS 构建摘要仍然有效——请在日志中注明，以便健康检查发现这种模式。

## 所需的环境变量

- `XAI_API_KEY` — 用于 Grok `x_search` 的 X.AI API 密钥。已在 `requires:` 中声明，因此会**注入到此 Skill 的环境中**，并作为 X 信号层的主要路径（直接使用 `curl`；请参阅**获取 X 信号**）。对整体功能而言是可选的——如果该变量未设置，摘要仍可仅基于 Web 和 RSS 来源正常工作。
- 通过仓库密钥配置的通知渠道（请参阅 CLAUDE.md）。

## 约束

- 绝不要发送包含占位链接或“TBD”章节的摘要。
- 绝不要为了达到目标条目数而编造内容。宁可少一些高质量条目，也不要更多低质量条目。
- 绝不要重复 `memory/logs/` 过去 3 天内已出现的报道，除非有实质性更新——若确实重复，必须明确说明。