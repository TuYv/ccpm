---
name: [REPLACE: SKILL_NAME]
description: Mention/keyword sweep on social platforms for [REPLACE: KEYWORDS] — trends, sentiment, top posts
metadata:
  category: social
  var: ""
  tags:
    - social
  requires:
    - XAI_API_KEY?
---
> **${var}** — 可选。传入其他关键词（以逗号分隔）以覆盖默认值。如果为空，则监控 `[REPLACE: KEYWORDS]`。

今天是 ${today}。监控社交平台上对 **[REPLACE: KEYWORDS]** 的提及并生成摘要。

## 步骤

1. **解析关键词** — `KEYWORDS="${var:-[REPLACE: KEYWORDS]}"`。按逗号拆分，去除每项首尾空格并转换为小写。每个词元分别作为一个搜索查询。

2. **搜索 X** — 对每个关键词，使用 X / xAI 搜索路径（项目的标准模式）：

   ```bash
   # Uses XAI_API_KEY in-run via ./secretcurl (the key is injected via requires:).
   # Mirror the fetch-tweets skill: POST https://api.x.ai/v1/responses with
   #   ./secretcurl -H "Authorization: Bearer {XAI_API_KEY}" -d @/tmp/payload.json
   # WebFetch (or a Nitter mirror) is the last-resort fallback.
   ```

   将语言限制为 `[REPLACE: LANGUAGE]`（例如 `en`、`fr`、`any`）。丢弃点赞数少于 `[REPLACE: MIN_LIKES]` 的帖子——此过滤器可保护频道免受低信号噪声的干扰。

3. **搜索 Reddit** — 对每个关键词：

   ```bash
   # Reddit's keyless JSON endpoint. WebFetch fallback if curl fails (sandbox).
   curl -sf "https://www.reddit.com/search.json?q=$KEYWORD&t=day&restrict_sr=0" \
     -H "User-Agent: aeon/1.0" > .reddit-cache.json || \
     echo "use WebFetch on https://www.reddit.com/search.json?q=$KEYWORD&t=day"
   ```

4. **评分并选出每个平台排名前 5 的帖子** — 按互动量（点赞、评论、得分）× 时效性进行评分（过去 24 小时内的帖子获得满分）。丢弃转发帖和明显的机器人账号（用户名类似 `*_bot`，或账号注册时间少于 7 天但发帖数超过 100）。

5. **标注情感倾向** — 对全部帖子中排名前 10 的帖子，根据帖子文本的语气分别标注为 `positive` / `neutral` / `negative`。保持轻量——只进行单词元分类，不做嵌套推理。

6. **写入 `output/articles/[REPLACE: SKILL_NAME]-${today}.md`**：
   ```markdown
   # [REPLACE: KEYWORDS] — ${today}

   ## Volume
   - X: N posts (vs 7d avg M)
   - Reddit: N posts (vs 7d avg M)

   ## Sentiment
   positive: X · neutral: Y · negative: Z

   ## Top posts
   1. [Author · platform · timestamp]
      "Excerpt or paraphrase."
      → URL

   2. ...
   ```

7. **发送通知** — 通过 `./notify` 发送 2–3 行摘要：`*[REPLACE: KEYWORDS] — ${today}* · N posts · sentiment skews positive/negative · top: <one-line title>. Full digest: <url>`。在平静日不发送通知（提及量低于 7 日平均值的 25%，且负面情感没有激增）。

8. **记录日志**到 `memory/logs/${today}.md`：
   ```
   ## [REPLACE: SKILL_NAME]
   - **Volume**: x_posts=N, reddit_posts=N, vs_7d_avg=Δ%
   - **Sentiment**: pos=X, neu=Y, neg=Z
   - **Status**: SOCIAL_OK | SOCIAL_QUIET | SOCIAL_SPIKE (vol > 2x avg) | SOCIAL_DEGRADED
   ```

## 网络说明

X / xAI 需要 `XAI_API_KEY`；Bash 分析器会拒绝在 `curl` 命令行中直接使用 `$XAI_API_KEY`，因此请使用 `{XAI_API_KEY}` 占位符调用 `./secretcurl`（密钥通过 `requires:` 注入）。Reddit 的 JSON 端点无需密钥，但会按 IP 进行速率限制——当 `curl` 返回 429 时，使用 `WebFetch` 作为后备方案。

## 约束条件

- **机器人过滤**至关重要。发布频率高的新账号会淹没几乎所有关键词的搜索结果，而且几乎总是不真实的。必须严格剔除。
- **讨论量比情绪更可信**。`SPIKE`（讨论量 > 7 天平均值的 2 倍）是真实信号；正常讨论量下的情绪变化往往不是。
- **互动量过滤阈值应动态调整**。`MIN_LIKES = [REPLACE: MIN_LIKES]` 是初始阈值——随着话题关注度上升，应提高该阈值，从而持续过滤噪声。