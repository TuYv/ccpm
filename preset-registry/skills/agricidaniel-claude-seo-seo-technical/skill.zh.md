---
name: seo-technical
description: >
  Technical SEO audit across 9 categories: crawlability, indexability, security,
  URL structure, mobile, Core Web Vitals, structured data, JavaScript rendering,
  and IndexNow protocol. Use when user says "technical SEO", "crawl issues",
  "robots.txt", "Core Web Vitals", "site speed", or "security headers".
user-invocable: true
argument-hint: "[url]"
license: MIT
metadata:
  author: AgriciDaniel
  version: "2.3.1"
  category: seo
---
# 技术 SEO 审计

## 类别

### 1. 可抓取性
- robots.txt：存在且有效，没有阻止重要资源
- XML sitemap：运行 `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run sitemap_discovery.py <url> --json`；要求 `found` 中存在有效条目，并将过时或不安全的 robots.txt 声明与正常工作的备用位置分开报告
- Noindex 标签：有意设置还是意外设置
- 抓取深度：重要页面应在距离首页 3 次点击以内
- JavaScript 渲染：检查关键内容是否需要执行 JS
- 抓取预算：对于大型网站（超过 10,000 个页面），效率很重要
- Googlebot **抓取限制**：Googlebot 会抓取前 **2MB 的 HTML** 和前 **64MB 的 PDF**（未压缩；15MB 是更广泛的爬虫基础设施默认值）。这并非 2026 年的新变化，而是长期存在的限制；内联 base64 图片、过大的内联 CSS/JS，或臃肿的导航，都可能使关键内容/JSON-LD 超出该限制，导致无法被编入索引。确保关键内容和结构化数据位于前 2MB 内。
- 抓取速率会**自动调整**（在出现 5xx 错误或响应缓慢时会降低）；**没有手动控制抓取速率的功能**（旧版 Search Console 设置已于 2024 年 1 月移除）。通过 sitemap、服务器响应能力和 robots 控制来影响抓取。
- Google 的 canonical 抓取/robots 参考文档已迁移至 `developers.google.com/crawling`（迁移日期为 2025-11-20）；IP 范围文件已移至 `/crawling/ipranges/`，`googlebot.json` 已重命名为 `common-crawlers.json`。
- AMP 没有独立的排名优势。自 2026-07-01 起，Google Search 会将用户直接导向由发布者托管的 AMP URL，因此不要建议维护 AMP Cache、AMP Viewer 或 signed exchange。应按照与其他页面相同的内容、操作一致性和质量要求审计 AMP。

#### AI 爬虫管理

截至 2025-2026 年，AI 公司会主动抓取互联网，以训练模型并支持 AI 搜索。通过 robots.txt 管理这些爬虫是技术 SEO 中的重要考虑因素。

**已知的 AI 爬虫：**

| 爬虫 | 公司 | robots.txt 标记 | 用途 |
|---------|---------|-----------------|---------|
| GPTBot | OpenAI | `GPTBot` | 模型训练（**不是** ChatGPT Search） |
| OAI-SearchBot | OpenAI | `OAI-SearchBot` | ChatGPT Search 可引用性 |
| ChatGPT-User | OpenAI | `ChatGPT-User` | 实时浏览（由用户触发） |
| ClaudeBot | Anthropic | `ClaudeBot` | 模型训练（**不是** Claude 搜索可引用性） |
| Claude-SearchBot | Anthropic | `Claude-SearchBot` | Claude 搜索结果可引用性 |
| PerplexityBot | Perplexity | `PerplexityBot` | 搜索索引和训练 |
| Bytespider | ByteDance | `Bytespider` | 模型训练 |
| Google-Extended | Google | `Google-Extended` | Gemini 训练（**不是**搜索） |
| Applebot-Extended | Apple | `Applebot-Extended` | 退出 Apple Intelligence 训练（**不影响** Siri/Spotlight/Safari） |
| CCBot | Common Crawl | `CCBot` | 开放数据集 |

**关键区别：**
- 阻止 `Google-Extended` 会阻止其用于 Gemini 训练，但**不会**影响 Google Search 索引或 AI Overviews（它们使用 `Googlebot`）
- 阻止 `GPTBot` 会阻止 OpenAI 进行训练，但**不会**影响 ChatGPT Search 的可引用性；可引用性由 `OAI-SearchBot` 控制，用户触发的浏览则由 `ChatGPT-User` 控制。对于任何可引用性声明，都应检查 `OAI-SearchBot`；`GPTBot` 的状态只能作为有关训练使用情况的证据
- 阻止 `ClaudeBot` 会阻止 Anthropic 进行模型训练，但**不会**影响 Claude 自有搜索功能中的可引用性；根据 Anthropic 的爬虫支持文章，该功能由 `Claude-SearchBot` 控制。对于任何 Claude 搜索可引用性声明，都应检查 `Claude-SearchBot`；`ClaudeBot` 的状态只能作为有关训练使用情况的证据
- 阻止 `Applebot-Extended` 会退出 Apple Intelligence/生成式模型训练，但**不会**影响通过 Siri、Spotlight 或 Safari 发现内容；根据 Apple 的支持文章，这些功能遵循 `Applebot`，而 `Applebot-Extended` 本身不会进行抓取
- 目前约有 3-5% 的网站使用 AI 专用的 robots.txt 规则

**示例：选择性阻止 AI 爬虫：**
```
# Allow search indexing, block AI training crawlers
User-agent: GPTBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: Bytespider
Disallow: /

# Allow all other crawlers (including Googlebot for search)
User-agent: *
Allow: /
```

**建议：**在阻止之前，考虑你的 AI 可见性策略。被 AI 系统引用能够提升品牌知名度并带来引荐流量。交叉参考 `seo-geo` 技能，了解完整的 AI 爬虫/抓取器分类。

> **用户触发的抓取器会按设计忽略 robots.txt。**Google 现在记录了 **Google-Agent**（Project Mariner、代理式浏览）以及 **Google-NotebookLM** 和 **Google Messages**，将其列为*用户触发的*抓取器，**无法通过 robots.txt 阻止**。应改用服务器端访问控制。相比之下，`Google-Extended` 和 `Google-CloudVertexBot` 遵守 robots.txt。新兴方案：**Web Bot Auth**（RFC 9421）允许机器人通过 `Signature-Agent` 标头和位于 `agent.bot.goog` 的密钥目录进行加密身份验证（Google-Agent 使用此方案）；反向 DNS 验证仍是备用方案。

### 2. 可索引性
- 规范标签：自引用，且不与 noindex 冲突
- 重复内容：近似重复、参数 URL、www 与非 www
- 规范化修复可能需要时间：Google 在重新评估页面时，可能会在**最多两周**内将已修正的页面保留在重复内容集群中。修复后不要因为规范 URL 未立即变化，就认定修复失败。
- 内容单薄：低于各类型最低字数要求的页面
- 分页：rel=next/prev 或“加载更多”模式
- Hreflang：多语言/多地区网站配置正确
- 索引膨胀：消耗抓取预算的不必要页面

### 3. 安全性
- HTTPS：强制启用、SSL 证书有效、无混合内容
- 安全标头：
  - Content-Security-Policy (CSP)
  - Strict-Transport-Security (HSTS)
  - X-Frame-Options
  - X-Content-Type-Options
  - Referrer-Policy
- HSTS 预加载：高安全性网站检查是否已加入预加载列表
- **后退按钮劫持**（违反垃圾内容政策、恶意行为）：标记通过 `history.pushState`/`replaceState` 禁用后退按钮的页面（包括第三方广告/库平台注入的脚本）。该行为于 2026-04-13 被加入 Google 垃圾内容政策；**自 2026-06-15 起正式执行**（人工措施 + 自动降权）：应将其视为严重问题。

### 4. URL 结构
- 简洁 URL：具有描述性、使用连字符，内容页面不使用查询参数
- 层级：反映网站架构的逻辑文件夹结构
- 重定向：不应存在重定向链（最多 1 次跳转），永久迁移使用 301
- URL 长度：标记超过 100 个字符的 URL
- 尾部斜杠：保持使用方式一致

### 5. 移动端优化与页面体验
- 响应式设计：viewport meta 标签、响应式 CSS
- 触控目标：最小 48x48px，间距为 8px
- 字体大小：基础字号最小为 16px
- 不得出现水平滚动
- 移动优先索引：Googlebot Smartphone 是主要抓取器（已于 2024 年完成部署）。移动版本**并非严格要求**（Google 表示“强烈建议”），无法在移动端正常运行的网站仍然可以被编入索引，但真正的风险是**内容/一致性丢失**，而不是被彻底排除。
- **移动端/桌面端内容一致性**（价值最高的移动端检查项）：主要内容等效、robots meta 标签一致、标题/描述一致、结构化数据等效、资源可抓取；避免将主要内容延迟加载到必须用户交互后才能显示。
- **侵入式插页式内容 / 广告密度**：标记整页插页式内容、独立的同意重定向页面、持续阻塞的对话框，以及过多/分散注意力的广告密度（这是页面体验中的一项明确指标）。可接受：小型横幅、标准 CMS/法律对话框。
- **“阅读更多”深层链接**：确保关键内容**在加载时立即可见**（不要隐藏在选项卡/折叠面板后），加载时不要劫持滚动，并保留 URL 哈希片段；隐藏在可展开部分中的内容更不可能获得相应资格。

> **页面体验是指导原则，而不是单一的排名系统。** 只有 **Core Web Vitals** 会直接影响排名；**HTTPS** 已确认是一个信号，但影响很轻微（影响的查询比例不到约 1%）。即使页面体验不佳，相关性仍可能胜出，因此不要过度重视安全标头。注意：独立的 **Page Experience 报告已从 Search Console 中移除**（通过 Core Web Vitals + HTTPS 报告进行监控）。

### 6. Core Web Vitals
- **LCP**（Largest Contentful Paint）：目标 <=2.5s
- **INP**（Interaction to Next Paint）：目标 <=200ms
  - INP 于 2024 年 3 月 12 日取代 FID。FID 于 2024 年 9 月 9 日从 Chrome 的现场数据工具（CrUX API、PageSpeed Insights）中移除（Lighthouse 是一个实验室工具，从未报告 FID）。任何地方都不要引用 FID。
- **CLS**（Cumulative Layout Shift）：目标 <=0.1
- 评估使用真实用户数据的第 75 百分位数
- 如果 MCP 可用，使用 PageSpeed Insights API 或 CrUX 数据

### 7. Structured Data
- 检测：JSON-LD（首选）、Microdata、RDFa
- 根据 Google 支持的类型进行验证
- 完整分析请参阅 seo-schema skill

### 8. JavaScript Rendering
- 检查内容是否显示在初始 HTML 中，还是需要 JS
- 识别客户端渲染（CSR）与服务端渲染（SSR）
- 标记可能导致索引问题的 SPA 框架（React、Vue、Angular）
- 如果检测到动态渲染，将其标记为技术债务，而不是有效的配置。
  Google 将其称为“变通方案，而非推荐的解决方案”，因为它会增加复杂性和资源成本。
  请参阅 https://developers.google.com/search/docs/crawling-indexing/javascript/dynamic-rendering

**推荐的渲染策略：**

| 策略 | 使用场景 |
|----------|----------|
| **SSR** | 面向 SEO 的公开内容、动态页面 |
| **SSG** | 静态内容、博客、文档 |
| **CSR** | 仅限经过身份验证的内容或登录后内容 |

**首选框架：** Next.js、Astro、React Router v7 (Remix)、SvelteKit

#### JavaScript SEO：Canonical 与索引指导（2025 年 12 月）

Google 于 2025 年 12 月更新了 JavaScript SEO 文档，并作出了以下重要说明：

1. **Canonical 冲突：** 如果原始 HTML 中的 canonical 标签与 JavaScript 注入的标签不同，Google 可能使用其中任意一个。确保服务端渲染的 HTML 与 JS 渲染输出中的 canonical 标签完全一致。
2. **使用 JavaScript 设置 noindex：** 如果原始 HTML 包含 `<meta name="robots" content="noindex">`，但 JavaScript 将其移除，Google 仍可能遵循原始 HTML 中的 noindex。应在初始 HTML 响应中提供正确的 robots 指令。
3. **非 200 状态码：** 对于返回非 200 HTTP 状态码的页面，Google 不会渲染 JavaScript。错误页面上通过 JS 注入的任何内容或 meta 标签对 Googlebot 都不可见。
4. **JavaScript 中的结构化数据：** 通过 JS 注入的 Product、Article 及其他结构化数据可能会延迟处理。对于有时效性的结构化数据（尤其是电商 Product 标记），应将其包含在初始服务端渲染的 HTML 中。

**最佳实践：**在初始服务器渲染的 HTML 中提供关键 SEO 元素（canonical、meta robots、结构化数据、title、meta description），而不是依赖 JavaScript 注入。

### 9. IndexNow 协议
- 检查网站是否支持面向 Bing、Yandex、Naver 的 IndexNow
- Google 之外的其他搜索引擎支持该协议
- 建议实施该协议，以便在非 Google 搜索引擎上更快完成索引

## 面向代理的页面与代理式浏览

AI 代理（不仅是 AI 摘要工具）越来越多地通过以下三种渠道读取网站：视觉模型读取的屏幕截图、原始 HTML/DOM，以及**可访问性树**（最清晰的信号）。审计标准包括：语义化 HTML（使用真正的 `<button>` 和 `<a>`，而不是 `<div onclick>`）、标签关联、交互目标尺寸、不同模板间的布局稳定性、`cursor: pointer` 的正确性，详见 `references/agent-friendly-pages.md`。

Google 现在提供 Lighthouse **Agentic Browsing** 类别（自 Lighthouse 13.3.0、Chrome 150+ 起默认启用；包含：以代理为中心的可访问性、CLS + llms.txt、三项 WebMCP 审计）。它报告的是**分数比例（N 项中的 X 项），而不是 0-100 分数**，应将其与下方该 skill 自有的 Agent-UX 0-100 启发式评分区分开来。Lighthouse 13.4.1 通过 PSI API 重新启用了该类别。该类别也可通过带有 `--only-categories=agentic-browsing` 参数的 Lighthouse CLI、DevTools 以及 PSI 网页界面使用。详见 `references/agent-friendly-pages.md`。

### 审计命令

```bash
# Render with Playwright + capture accessibility tree, then score
"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run agent_ux_check.py https://example.com --json
```

扫描器会输出 Agent-UX 分数（0-100）以及逐项列出的问题：
- HTML 检查结果：真实按钮 / 锚点、`<div onclick>` 控件、语义化地标、缺少 `<label for>` 的输入框、缺少 ARIA 标签的输入框
- 可访问性树检查结果：节点总数、交互节点数、未命名的交互元素、`role="generic"` 占比

可访问性树快照通过 Playwright 使用 Chromium 的 `Accessibility.getFullAXTree` CDP 命令获取。若要在不评分的情况下捕获该树，请使用 `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run render_page.py <url> --a11y-tree --json`。

将检查结果作为**改进机会**呈现，而不是失败项；不要因为 Agent-UX 分数低于 100 就阻止审计。需要验证 WebMCP 的 origin trial / 注册状态，而不支持 WebMCP 仍然只是改进机会，而不是缺陷。

## 输出

### 技术评分：XX/100

### 类别明细
| 类别 | 状态 | 分数 |
|----------|--------|-------|
| 可抓取性 | pass/warn/fail | XX/100 |
| 可索引性 | pass/warn/fail | XX/100 |
| 安全性 | pass/warn/fail | XX/100 |
| URL 结构 | pass/warn/fail | XX/100 |
| 移动端 | pass/warn/fail | XX/100 |
| Core Web Vitals | pass/warn/fail | XX/100 |
| 结构化数据 | pass/warn/fail | XX/100 |
| JS 渲染 | pass/warn/fail | XX/100 |
| IndexNow | pass/warn/fail | XX/100 |

### 关键问题（立即修复）
### 高优先级（1 周内修复）
### 中优先级（1 个月内修复）
### 低优先级（纳入待办）

## DataForSEO 集成（可选）

如果 DataForSEO MCP 工具可用，请使用 `on_page_instant_pages` 进行真实页面分析（状态码、页面计时、损坏的链接、页面检查），使用 `on_page_lighthouse` 进行 Lighthouse 审计（性能、可访问性、SEO 分数），并使用 `domain_analytics_technologies_domain_technologies` 检测技术栈。

## Google API 集成（可选）

如果已配置 Google API 凭据，请使用 `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run pagespeed_check.py <url> --json` 获取真实的 PSI + CrUX 字段数据（取代仅基于实验室数据的 CWV 估算），使用 `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run crux_history.py <url> --json` 获取 25 周的 CWV 趋势，并使用 `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run gsc_inspect.py <url> --json` 获取每个 URL 的真实索引状态。

## 审计本地或私有主机

`url_safety` 默认拒绝环回地址和私有地址，因此 `http://localhost:3000` 和 Tailscale 上的 staging 主机会因“Blocked hostname”或“Blocked IP literal”而失败。该默认设置是有意设计的：这些脚本会跟踪其抓取页面中发现的 URL。

要审计预部署主机，操作员需要在 `CLAUDE_SEO_LOCAL_TARGETS` 中指定该主机。该变量是以逗号分隔的 `host` 或 `host:port` 条目列表：

```bash
CLAUDE_SEO_LOCAL_TARGETS="localhost:3000,127.0.0.1:8080,100.101.102.103" \
  "${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run fetch_page.py http://localhost:3000/
```

它涵盖和不涵盖的内容如下：

| 行为 | 加入允许列表的主机 |
|-----------|------------------|
| 首先，通过原始 HTTP 访问顶层 URL | 允许 |
| 从该 URL 到达的重定向目标 | 拒绝 |
| 渲染页面获取的子资源 | 拒绝 |
| Playwright 渲染（`--render`、截图） | 拒绝；请使用原始 HTTP 路径 |
| 变量中未指定的主机 | 拒绝 |
| 云元数据端点，即使已列出 | 拒绝 |

`host:port` 仅匹配该端口；不带端口的 `host` 匹配任意端口。未设置该变量时，策略不变。绝不要建议用户为其不控制的主机设置该变量。请参阅 SECURITY.md。

## 错误处理

| 场景 | 操作 |
|----------|--------|
| URL 无法访问 | 报告包含状态码的连接错误。建议验证 URL、检查 DNS 解析，并确认网站可公开访问。 |
| 未找到 robots.txt | 说明在根域名处未检测到 robots.txt。建议创建一个包含适当指令的 robots.txt。继续审计其余类别。 |
| 未配置 HTTPS | 标记为严重问题。报告是否在没有重定向的情况下提供 HTTP、是否存在混合内容，或 SSL 证书是否缺失/过期。 |
| Core Web Vitals 数据不可用 | 说明 CrUX 数据不可用（低流量网站较为常见）。建议使用 Lighthouse 实验室数据作为代理，并建议增加流量后重新测试。 |