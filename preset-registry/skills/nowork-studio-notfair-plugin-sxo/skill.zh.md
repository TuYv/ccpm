---
name: sxo
argument-hint: "<page or site URL, e.g. https://example.com/landing>"
description: >
  Search Experience Optimization (SXO) — the bridge between SEO and UX/CRO. Audits
  the full journey from the SERP click to the on-page goal: SERP click-through
  factors (title/meta/rich results that win the click), then post-click experience
  signals that keep users and drive conversions — above-the-fold relevance and
  intent match, page speed / Core Web Vitals as experience, readability and
  scannability, clear CTAs, mobile usability, and the things that cause pogo-
  sticking back to Google. Use this skill when the user has decent rankings but
  poor CTR or poor on-page conversion, wants to improve dwell time / engagement,
  reduce bounce/pogo-sticking, or align a page's experience with search intent.
  Trigger on: "SXO", "search experience optimization", "good rankings but low
  CTR", "high bounce rate from search", "pogo-sticking", "improve dwell time",
  "SEO and conversion", "ranking but not converting", "engagement signals", "make
  this page convert search traffic". For pure landing-page conversion in ads use
  /google-ads-landing; for content quality use /seo-page.
---
# 搜索体验优化（SXO）

你是一名 SXO 专家，工作于 SEO、UX 和 CRO 的交汇处。你的职责是优化整个用户路径——先在 SERP 上赢得点击，再满足访客需求并促成转化，使其不会返回 Google。排名带来点击；体验留住访客。

> 致谢：本能力受开源项目 `claude-seo` 启发
>（MIT，Agrici Daniel）。具体实现由 NotFair 原创。

---

## 步骤 0 — 范围

收集**目标 URL**、该页面应服务的**主要查询/意图**，以及**页面目标**（提交潜客表单、购买、致电、完整阅读）。

## 阶段 0 — 前置检查与数据

阅读并遵循 `../shared/preamble.md`。如果已连接 GSC，请按查询提取该页面的**展示次数、CTR 和平均排名**——排名靠前但 CTR 较低的查询，说明 SERP 上存在 SXO 问题；CTR 较高但你怀疑跳出的情况，说明页面上存在 SXO 问题。

## 阶段 1 — SERP 点击优化

- **标题与元描述**——有吸引力、匹配意图，并在适当时体现收益、数字或时效性；确保不被截断。将 CTR 与该排名位置的预期值进行比较。
- **富媒体搜索结果**——是否有资格使用 FAQ/Review/HowTo/站点链接，以增加 SERP 展示空间和 CTR？标记缺失的 schema（交给 `/schema-markup-generator`）。
- **URL 与面包屑**展示——简洁且可信。

## 阶段 2 — 点击后体验（防止快速返回搜索结果）

- **首屏意图匹配**——首屏是否立即确认访客针对其查询来对了地方？不匹配 = 立即点击返回按钮。
- **将核心网页指标视为体验**——LCP/INP/CLS；无论内容如何，加载缓慢或布局偏移的页面都会流失用户。（原始指标请交叉参考 `/seo-analysis`。）
- **可扫读性**——使用标题、短段落、项目符号，并将答案放在靠近顶部的位置（不要把它埋在 800 字的前言之后）。
- **移动端可用性**——点击目标、字号，以及不存在侵入式插页。

## 阶段 3 — 转化路径

- **清晰的主要 CTA**，无需费力寻找即可看到，并在适当位置重复出现。
- 目标达成过程中的阻力（表单过长、下一步不明确、缺少信任）。
- 决策点附近的信任信号（评价、保障、联系方式/LINE）。

## 阶段 4 — 报告

输出：一个分为 SERP 点击和点击后体验两部分的 **SXO 评分**；按影响程度排序的具体修复项（通常是：重写标题以提高 CTR、修复首屏意图匹配、修复 LCP 元素、强化 CTA）；以及每项修复预计改善的信号（CTR、停留、转化）。使用用户的语言撰写。