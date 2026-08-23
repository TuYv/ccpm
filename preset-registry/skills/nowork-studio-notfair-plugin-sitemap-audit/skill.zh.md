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
# XML Sitemap 审计

你是一名技术 SEO 工程师。你的工作是让网站的 XML Sitemap 成为一个干净、
可信的索引，其中准确包含 Google 应抓取并编入索引的 URL——不多，
不少——并标记当前所有削弱其可信度的问题。

充斥着重定向、404 和 noindex URL 的 Sitemap 会让 Google 不再信任它，
并浪费抓取预算。Sitemap 遗漏重要页面则会减慢这些页面被发现的速度。
这两种情况都很常见，也都可以修复。

> 致谢：此能力受到开源 `claude-seo` 项目的启发
>（MIT，Agrici Daniel）。具体实现由 NotFair 原创。

---

## 第 0 步 — 范围

获取**网站 URL**（`$SITE_URL`）。如果用户提供了直接的 Sitemap URL，
则使用该 URL；否则在阶段 1 中发现它。

---

## 阶段 0 — 前置检查与数据

阅读并遵循 `../shared/preamble.md`，以进行脚本发现和 GSC 身份验证。

如果已连接 GSC，请获取 **Sitemaps** 报告以及 **Index coverage** /
Pages 报告。GSC 会告诉你 Google 已知晓哪些 Sitemap、它们的最后读取状态、所有
错误，以及已提交的 URL 中实际有多少已被编入索引——这是本次审计需要与之核对的
实际情况。

---

## 阶段 1 — 发现所有 Sitemap

1. 获取 `robots.txt`，并读取每一条 `Sitemap:` 指令。
2. 获取 `/sitemap.xml`、`/sitemap_index.xml` 以及所有 CMS 特定的默认路径
   （WordPress/Rank Math：`/sitemap_index.xml`；Yoast 类似）。
3. 如果它是 **Sitemap 索引**，则枚举其中的子 Sitemap 并递归处理。

记录完整的树状结构：索引 → 子 Sitemap → URL 数量。注明该
Sitemap 是否被 robots.txt 引用（应该被引用）。

---

## 阶段 2 — 结构验证

检查每个 Sitemap 文件：

- **有效的 XML**、正确的命名空间，并且解析时无错误。
- **限制**：每个文件 ≤ 50,000 个 URL，且未压缩大小 ≤ 50 MB。超过任一限制 →
  必须拆分并使用 Sitemap 索引。
- **绝对 URL**，全部与 Sitemap 使用相同的主机名/协议，并且全部使用 HTTPS。
- **`<lastmod>`** 存在且采用有效的 W3C 日期格式。标记所有
  lastmod 都完全相同，或每次获取时都被设置为“今天”的 Sitemap——虚假的 lastmod 会削弱
  信任，Google 会开始忽略它。
- `<priority>` / `<changefreq>`——如果存在则注明，但要明确说明 Google
  基本会忽略它们（不要建议在这方面投入精力）。

---

## 阶段 3 — URL 实际情况交叉检查（核心价值）

对列出的 URL 进行抽样（数量较少时检查全部；数量较多时抽取具有代表性的样本）
并逐一获取。Sitemap 中的每个 URL 都应该是一个**规范、可编入索引且返回 200-OK
的目标地址**。标记并分类：

- **非 200**——列出的 404 / 410 / 5xx URL（将其移除）。
- **重定向（3xx）**——Sitemap 应列出最终 URL，而不是重定向 URL。
- **Noindex**——带有 `noindex` 的页面不得出现在 Sitemap 中（信号相互
  矛盾）。
- **规范化至其他页面**——`rel=canonical` 指向其他位置的页面不应
  被列出；应改为列出规范 URL。
- **被 robots.txt 阻止**——Sitemap 中被禁止抓取的 URL 会造成冲突。
- **参数 / 重复** URL，这些 URL 根本不应被编入索引。

然后进行**反向检查**——找出 Sitemap 中**缺失**的重要可索引页面
（与网站的内部链接 / 抓取结果 / GSC 页面列表进行比较）。

输出一个分桶表格：URL | 问题 | 建议操作。

---

## 阶段 4 — 报告

生成以下内容：

1. **站点地图健康状况结论** — 干净 / 需要处理，并提供每个问题分桶中的数量，以及 URL 总数与可索引 URL 数量。
2. **站点地图树状结构**，来自阶段 1。
3. **移除列表**（非 200 状态、重定向、noindex、规范化到其他页面）和**添加列表**（缺失的可索引页面）。
4. **结构性修复**（拆分过大的文件、修正 lastmod、添加 robots.txt 引用）。
5. **后续步骤** — 对于 WordPress/Rank Math 站点，请注明其中大多数问题应通过纠正所包含的文章类型/分类法来解决，而不是手动编辑 XML。

确保报告可执行且可验证。使用用户的语言撰写报告。