---
name: share
description: Turn a BS report (or any analysis result) into ready-to-paste posts for X/Twitter, LinkedIn, Facebook, Reddit, Hacker News, or a newsletter issue — plus a branded image carousel (PNGs + PDF) for visual platforms. Use when the user wants to share, post, publish, or promote a report, asks for "a thread", "a LinkedIn post", "a carousel", or "format this for X".
---
# share

拿到一份已完成的报告，产出平台原生的内容，即贴即用。绝不套用通用模板：每个平台都有自己专属的格式、长度和链接礼仪。

## 工作流程

1. **定位报告。** 可能是用户指定的文件、本次对话中生成的报告，或者——如果两者都没有——主动提议先运行 `bullshit-detector` 技能。
2. 若用户未说明，**询问发布到哪些平台**。默认组合：X 推文串 + LinkedIn 帖子。
3. **撰写帖子**，严格遵循 [PLATFORMS.md](PLATFORMS.md) 中针对各平台的规范——钩子、长度上限、链接位置。每条帖子单独输出为一个围栏代码块，用户可以原样复制。
4. **轮播图（如有要求，或该平台能从中受益时）：** 将报告提炼为 `slides.json`（结构见下文）并进行渲染：

```bash
uv run <this-skill-dir>/scripts/render_carousel.py slides.json -o carousel/
```

首次运行需要一次性安装浏览器：`uv run --with playwright playwright install chromium`。输出：`slide-N.png`（1080×1350，适用于 X、LinkedIn、Instagram）+ `carousel.pdf`（LinkedIn 文档帖子）。

## slides.json 结构

```json
{
  "title": "Video/article title",
  "source": "Author · Platform · 1.16M views",
  "score": 5,
  "verdict_line": "Real tools, fantasy income math",
  "footer": "@their-handle · their-link (the sharer's, not the tool author's — see rules)",
  "slides": [
    { "type": "hook" },
    { "type": "claim", "n": "1/12", "claim": "Quoted or paraphrased claim, ≤200 chars",
      "verdict": "misleading", "evidence": "One-sentence reality, ≤160 chars" },
    { "type": "cta", "headline": "Run it on anything",
      "lines": ["the sharer's own links — ask, don't assume"] }
  ]
}
```

判定值：`confirmed` / `plausible` / `misleading` / `false` / `unverifiable` / `not checked`
