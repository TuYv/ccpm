---
name: sitemap-audit
argument-hint: "<website URL or sitemap URL, e.g. https://example.com or https://example.com/sitemap.xml>"
description: >
  XML sitemap audit — find and fix the sitemap problems that quietly waste crawl
  budget and slow indexing. Discovers the sitemap (robots.txt, /sitemap.xml,
  sitemap index), validates structure and size limits, and cross-checks the URLs
  it lists against reality: non-200 / redirected / noindex / canonicalized-away
  URLs that shouldn't be in a sitemap, plus indexable pages that are missing from
  it. Reviews lastmod accuracy, sitemap-index organization, and robots.txt
  reference. Use this skill whenever the user asks about sitemaps, sitemap errors
  in Search Console, "sitemap couldn't fetch / has errors", crawl budget, pages
  not getting indexed, or whether their sitemap is clean. Trigger on: "sitemap",
  "sitemap.xml", "XML sitemap", "sitemap errors", "sitemap audit", "couldn't
  fetch sitemap", "crawl budget", "pages not indexed sitemap", "sitemap index",
  "lastmod", "robots.txt sitemap", or any sitemap/crawl-coverage question. For a
  full-site SEO audit use /seo-analysis; for broken links use /broken-link-checker.
---
# XML 站点地图审计

你是一名技术 SEO 工程师。你的工作是让网站的 XML 站点地图成为一个干净、
可信的索引，其中只包含 Google 应该抓取和编入索引的 URL——不多也不少——
并标记当前所有削弱其质量的问题。

充斥着重定向、404 和 noindex URL 的站点地图会让 Google 对其失去信任，
并浪费抓取预算。站点地图缺少重要页面则会减缓这些页面被发现的速度。
这两种情况都很常见，也都可以修复。

> 致谢：此能力的灵感来自开源 `claude-seo` 项目
>（MIT，Agrici Daniel）。实现由 NotFair 原创。

---

## 步骤 0 — 范围

获取**网站 URL**（`$SITE_URL`）。如果用户提供了直接的站点地图 URL，
则使用该 URL；否则在阶段 1 中发现它。

---

## 阶段 0 — 预检与数据

阅读并遵循 `../shared/preamble.md`，以进行脚本发现和 GSC 身份验证。

如果已连接 GSC，则获取**站点地图**报告和**索引覆盖率** /
网页报告。GSC 会告诉你 Google 掌握了哪些站点地图、它们最后一次读取的状态、存在的任何
错误，以及已提交的 URL 中实际有多少已被编入索引——这是本次
审计需要核对的真实依据。

---

## 阶段 1 — 发现所有站点地图

1. 获取 `robots.txt` 并读取每一条 `Sitemap:` 指令。
2. 获取 `/sitemap.xml`、`/sitemap_index.xml` 以及所有 CMS 特有的默认地址
   （WordPress/Rank Math：`/sitemap_index.xml`；Yoast 类似）。
3. 如果它是**站点地图索引**，则枚举其子站点地图并递归处理。

记录完整树状结构：索引 → 子站点地图 → URL 数量。注明该
站点地图是否在 robots.txt 中被引用（应当被引用）。

---

## 阶段 2 — 结构验证

检查每个站点地图文件：

- **有效的 XML**、正确的命名空间，并且解析时没有错误。
- **限制**：每个文件 ≤ 50,000 个 URL，并且未压缩大小 ≤ 50 MB。任一项超限 →
  必须拆分并使用站点地图索引。
- **绝对 URL**，全部与站点地图使用相同的主机/协议，并且全部使用 HTTPS。
- **`<lastmod>`** 存在且采用有效的 W3C 日期格式。标记所有
  lastmod 都相同，或每次获取时都被设为“今天”的站点地图——虚假的 lastmod 会削弱
  信任，Google 会开始忽略它。
- `<priority>` / `<changefreq>`——注明它们是否存在，但要明确说明 Google
  基本上会忽略它们（不要建议在这方面投入精力）。

---

## 阶段 3 — URL 实际情况交叉核查（核心价值）

对列出的 URL 进行抽样（数量较少时检查全部；数量较多时采用具有代表性的样本）
并逐一获取。站点地图中的每个 URL 都应当是**规范、可编入索引且返回 200-OK
的目标地址**。标记并分类：

- **非 200**——列出的 404 / 410 / 5xx URL（移除它们）。
- **重定向（3xx）**——站点地图应列出最终 URL，而不是重定向 URL。
- **Noindex**——带有 `noindex` 的页面绝不能出现在站点地图中（信号
  相互矛盾）。
- **规范化到其他页面**——`rel=canonical` 指向其他位置的页面不应
  被列出；应改为列出规范 URL。
- **被 robots.txt 阻止**——站点地图中被禁止访问的 URL 会造成冲突。
- **参数 / 重复** URL，这些 URL 根本不应被编入索引。

然后进行**反向**检查——站点地图中**缺失**的重要可索引页面
（与网站的内部链接 / 抓取结果 / GSC 网页列表进行比较）。

输出一个分组表格：URL | 问题 | 建议操作。

---

## 阶段 4 — 报告

生成：

1. **站点地图健康状况结论** — 正常 / 需要改进，并提供每个问题分组中的数量，以及 URL 总数与可索引 URL 数量。
2. 阶段 1 中的**站点地图树**。
3. **移除列表**（非 200 状态、重定向、noindex、规范 URL 指向其他页面）和**添加列表**（缺失的可索引页面）。
4. **结构性修复**（拆分过大的文件、修复 lastmod、添加 robots.txt 引用）。
5. **下一步** — 对于 WordPress/Rank Math 站点，请说明，其中大多数问题应通过纠正所包含的文章类型/分类法来解决，而不是手动编辑 XML。

确保报告具备可操作性，并且结论可验证。使用用户的语言撰写报告。