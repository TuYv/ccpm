---
name: [REPLACE: SKILL_NAME]
description: Digest of the most interesting new posts on [REPLACE: TOPIC] from RSS feeds and the open web
metadata:
  category: research
  var: ""
  tags:
    - research
---
> **${var}** — 可选。传入其他主题以覆盖默认值。如果为空，则摘要主题为 [REPLACE: TOPIC]。

今天是 ${today}。整理一份关于 **[REPLACE: TOPIC]** 的摘要，包含最有趣的 [REPLACE: MAX_ITEMS] 篇新文章。

## 步骤

1. **读取来源** — 从每个订阅源中获取过去 24 小时的条目：

   ```text
   [REPLACE: FEED_URLS]
   ```

   （以逗号或换行符分隔的 RSS/Atom URL 列表。）

   使用 **WebFetch** 获取每个订阅源并解析条目。如果某个订阅源返回 404 或格式错误的 XML，则记录一行警告，并在本次运行中跳过该订阅源。

2. **使用网页搜索补充内容** — 通过 `WebSearch` 搜索 `[REPLACE: TOPIC] latest`，最多选取 5 个过去 24 小时内发布、且尚未包含在订阅源结果中的新链接。

3. **评分与排序** — 根据以下标准为每个候选条目评分：
   - **时效性** — 发布时间在过去 24 小时内的条目获得满分。
   - **来源权重** — 配置列表中的订阅源优先于通用搜索结果。
   - **具体性** — 提及具体数字、代码或具名系统的条目优先于观点文章。

   丢弃任何明显偏离主题的内容（标题或摘要中应出现 `${var}` 或 `[REPLACE: TOPIC]` 关键词）。

4. **选取排名前 [REPLACE: MAX_ITEMS] 的条目** — 写入 `output/articles/[REPLACE: SKILL_NAME]-${today}.md`，每个条目的格式如下：
   ```markdown
   ### [Title](url)
   *[Source · published date]*
   2-3 sentences distilling the takeaway. No filler.
   ```

5. **发送通知** — 通过 `./notify` 发送：
   ```
   *[REPLACE: TOPIC] digest — ${today}*

   [N] picks. Top item: [shortened title].

   Full digest: https://github.com/${GITHUB_REPOSITORY}/blob/main/output/articles/[REPLACE: SKILL_NAME]-${today}.md
   ```

6. **记录日志** — 追加到 `memory/logs/${today}.md`：
   ```
   ## [REPLACE: SKILL_NAME]
   - **Sources scanned**: N feeds + 1 web search
   - **Items picked**: N (of M candidates)
   - **Top source**: domain
   - **Status**: DIGEST_OK | DIGEST_QUIET (no items) | DIGEST_DEGRADED (some feeds failed)
   ```

## 网络说明

`WebFetch` 和 `WebSearch` 是 Claude 的内置工具。不存在网络沙箱限制，`curl` 也可以使用；对于不稳定的公开 GET 请求，请使用 `WebFetch` 作为备用方案。此研究技能执行的读取操作无需身份验证，因此 `WebSearch` + `WebFetch` 是最简单的方式。

## 约束

- **绝不重复**。通过 `memory/topics/[REPLACE: SKILL_NAME]-seen.txt` 跟踪已发送的条目 URL（仅追加）。跳过其中已存在的任何内容。
- **不要凑数**。如果符合标准的条目少于 `[REPLACE: MAX_ITEMS]`，则少发一些，绝不要用低价值内容填充。
- **引用新闻事实，不要含糊转述**。应写成“Anthropic 发布了 X”，而不是“AI 实验室正在发布一些东西”。具体胜过含糊其词。