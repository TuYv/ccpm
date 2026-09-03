---
name: summarize
description: Produce a structured summary of a video, article, tweet thread, or PDF — TLDR, key points with timestamps/locations, notable quotes, and who should read/watch it. Use when the user asks to summarize a link or file, wants a TLDR, or asks "what does this video/article say" / "is this worth watching".
---
# summarize

把内容给到某人，而无需付出运行时长。

## Workflow

1. **获取文本。** 如果输入是一个 URL 且已安装 `fetch-content` 技能，就使用它的脚本；否则使用你的网页抓取工具，或请对方直接粘贴内容。保留元数据。
2. **通读全文**，然后写出：

```markdown
# <title>
**<author> · <platform> · <date> · <duration/length> · <views if notable>**

**TLDR:** one paragraph, ≤3 sentences — the actual thesis, not the topic.

## Key points
Bulleted. Each point = one idea, with [timestamp] or [p.N] so the
reader can jump to it. Preserve the content's own structure (if it
promises "14 ways", list all 14 — compressed, not truncated).

## Notable quotes
1–3 verbatim quotes that carry the content's voice, with locations.

## Worth your time?
One honest sentence per audience: who gains from the full version,
who is fine with this summary.
```

## Rules

- 总结内容本身表达的观点，而不是你对它的评价（那是 `bullshit-detector` 技能的职责——如果内容透着炒作的味道，提一下那个技能即可，但不要在这里替它干活）。
- 数字、人名和论断必须逐字取自原文——不许四舍五入，不许“优化”。
- 如果内容是清单体文章，摘要必须包含完整的清单。绝不许写“……以及其他 9 种方法”。
- 篇幅与来源相称：一条推文 3 行，3 小时的播客则占满一页。
