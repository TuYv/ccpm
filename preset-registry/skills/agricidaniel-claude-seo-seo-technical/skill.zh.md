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
  version: "2.2.5"
  category: seo
---
# 技术 SEO 审计

## 类别

### 1. 可抓取性
- robots.txt：存在、有效，且未阻止重要资源
- XML sitemap：运行 `claude-seo run sitemap_discovery.py <url> --json`；要求在
  `found` 中存在有效条目，并将过时或不安全的 robots.txt 声明与正常工作的备用位置
  分开报告
- Noindex 标签：有意设置还是意外设置
- 抓取深度：重要页面距离首页不超过 3 次点击
- JavaScript 渲染：检查关键内容是否需要执行 JS
- 抓取预算：对于大型网站（>10k 个页面），效率很重要
- Googlebot **抓取限制**：Googlebot 会抓取前 **2MB 的 HTML** 和前 **64MB 的 PDF**（未压缩；15MB 是更广泛的 crawler-infra 默认值）。这是长期存在的限制，并非 2026 年的新变化，但内联 base64 图片、过大的内联 CSS/JS 或臃肿的导航都可能使关键内容/JSON-LD 超出上限，无法进入索引。确保关键内容 + 结构化数据位于前 2MB 内。
- 抓取速率会**自动调整**（在出现 5xx/响应缓慢时会降低速率）；**不存在手动控制抓取速率的方式**（旧版 Search Console 设置已于 2024 年 1 月移除）。可通过站点地图、服务器响应能力和 robots 控制来影响抓取。
- Google 的规范抓取/robots 参考文档已移至
  `developers.google.com/crawling`（于 2025-11-20 完成迁移）；IP 范围文件已移至
  `/crawling/ipranges/`，`googlebot.json` 已重命名为 `common-crawlers.json`。
- AMP 不再具有单独的排名优势。自 2026-07-01 起，Google Search 会将
  用户直接发送到发布商托管的 AMP URL，因此不要建议维护 AMP Cache、
  AMP Viewer 或 signed exchange。应按照与其他页面相同的内容、操作一致性和质量要求
  对 AMP 进行审计。

#### AI 爬虫管理

截至 2025-2026 年，AI 公司会积极抓取互联网，以训练模型并支持 AI 搜索。通过 robots.txt 管理这些爬虫是技术 SEO 的关键考量因素。

**已知的 AI 爬虫：**

| 爬虫 | 公司 | robots.txt token | 用途 |
|---------|---------|-----------------|---------|
| GPTBot | OpenAI | `GPTBot` | 模型训练 |
| ChatGPT-User | OpenAI | `ChatGPT-User` | 实时浏览 |
| ClaudeBot | Anthropic | `ClaudeBot` | 模型训练 |
| PerplexityBot | Perplexity | `PerplexityBot` | 搜索索引 + 训练 |
| Bytespider | ByteDance | `Bytespider` | 模型训练 |
| Google-Extended | Google | `Google-Extended` | Gemini 训练（不是搜索） |
| CCBot | Common Crawl | `CCBot` | 开放数据集 |

**关键区别：**
- 阻止 `Google-Extended` 会阻止内容用于 Gemini 训练，但**不会**影响 Google Search 索引或 AI Overviews（它们使用 `Googlebot`）
- 阻止 `GPTBot` 会阻止 OpenAI 训练，但**不会**阻止 ChatGPT 通过浏览功能引用你的内容（`ChatGPT-User`）
- 目前约有 3-5% 的网站使用针对 AI 的 robots.txt 规则

**选择性阻止 AI 爬虫的示例：**
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

**建议：**在屏蔽之前考虑你的 AI 可见性策略。被 AI 系统引用可以提升品牌知名度并带来引荐流量。交叉参考 `seo-geo` skill，了解完整的 AI 爬虫/抓取器分类。

> **用户触发的抓取器有意忽略 robots.txt。** Google 现在将 **Google-Agent**（Project Mariner，代理式浏览）以及 **Google-NotebookLM** 和 **Google Messages** 记录为*用户触发的*抓取器，这些抓取器**无法通过 robots.txt 屏蔽**。请改用服务器端访问控制。相比之下，`Google-Extended` 和 `Google-CloudVertexBot` 会遵守 robots.txt。新兴方案：**Web Bot Auth**（RFC 9421）允许机器人通过 `Signature-Agent` 标头以及位于 `agent.bot.goog` 的密钥目录进行加密身份验证（Google-Agent 使用）；反向 DNS 验证仍然是备用方案。

### 2. 可索引性
- Canonical 标签：自引用，不与 noindex 冲突
- 重复内容：近似重复、参数 URL、www 与非 www
- Canonical 化修复可能需要时间：Google 在重新评估期间，可能会在重复内容集群中保留已修正的页面，时间**最长可达两周**。修复后不要因为 canonical 没有立即变化，就认定修复失败。
- 内容单薄：低于每种类型最低字数要求的页面
- 分页：rel=next/prev 或“加载更多”模式
- Hreflang：适用于多语言/多地区网站的正确配置
- 索引膨胀：消耗抓取预算的不必要页面

### 3. 安全性
- HTTPS：已强制启用、SSL 证书有效、无混合内容
- 安全标头：
  - Content-Security-Policy (CSP)
  - Strict-Transport-Security (HSTS)
  - X-Frame-Options
  - X-Content-Type-Options
  - Referrer-Policy
- HSTS preload：对于高安全性网站，检查是否包含在 preload 列表中
- **后退按钮劫持**（违反垃圾内容政策、恶意行为）：标记通过 `history.pushState`/`replaceState` 禁用后退按钮的页面（包括由第三方广告/库平台注入的脚本）。该行为已于 2026-04-13 加入 Google 的垃圾内容政策；**自 2026-06-15 起正式执行**（人工措施 + 自动降权）：应视为严重问题。

### 4. URL 结构
- 清晰的 URL：具有描述性，使用连字符，内容页面不使用查询参数
- 层级：反映网站架构的合理文件夹结构
- 重定向：不得存在重定向链（最多 1 跳），永久移动使用 301
- URL 长度：标记超过 100 个字符的 URL
- 尾部斜杠：保持使用方式一致

### 5. 移动端优化与页面体验
- 响应式设计：viewport meta 标签、响应式 CSS
- 触控目标：最小 48x48px，间距为 8px
- 字号：基础字号最小 16px
- 不得出现水平滚动
- 移动优先索引：Googlebot Smartphone 是主要抓取器（已于 2024 年完成推广）。移动版本**并非严格要求**（Google 表示“强烈建议”），无法在移动设备上正常运行的网站仍然可以被索引，但真正的风险是**内容/一致性丢失**，而不是被硬性排除。
- **移动端/桌面端内容一致性**（价值最高的移动端检查项）：主要内容应等价，robots meta 标签应匹配，标题/描述应匹配，结构化数据应等价，资源应可抓取；避免将需要用户交互才能加载的主要内容进行延迟加载。
- **侵入式插页式内容 / 广告密度**：标记整页插页式内容、独立的同意重定向页面、持续阻塞性的对话框，以及过多或造成干扰的广告密度（这是明确命名的页面体验因素）。可接受：小型横幅、标准 CMS/法律对话框。
- **“阅读更多”深层链接**：确保关键内容**在加载时立即可见**（不要隐藏在标签页/折叠面板后），不要在加载时劫持滚动，并保留 URL 哈希片段；隐藏在可展开部分后的内容不太可能符合要求。

> **页面体验是指导原则，而不是单一的排名系统。** 只有 **Core Web Vitals** 会直接影响排名；**HTTPS** 是已确认但影响轻微的信号（影响不到约 1% 的查询）。即使页面体验不佳，相关性仍然可能胜出，因此不要过度重视安全标头。注意：Search Console 已移除独立的 **Page Experience 报告**（请通过 Core Web Vitals + HTTPS 报告进行监控）。

### 6. Core Web Vitals
- **LCP** (Largest Contentful Paint)：目标 <=2.5s
- **INP** (Interaction to Next Paint)：目标 <=200ms
  - INP 于 2024 年 3 月 12 日取代 FID。FID 于 2024 年 9 月 9 日从 Chrome 的现场数据工具（CrUX API、PageSpeed Insights）中移除（Lighthouse 是一个从未报告 FID 的实验室工具）。任何地方都不要引用 FID。
- **CLS** (Cumulative Layout Shift)：目标 <=0.1
- 评估使用真实用户数据的第 75 百分位数
- 如果 MCP 可用，请使用 PageSpeed Insights API 或 CrUX 数据

### 7. Structured Data
- 检测：JSON-LD（首选）、Microdata、RDFa
- 根据 Google 支持的类型进行验证
- 完整分析请参阅 seo-schema skill

### 8. JavaScript Rendering
- 检查内容是否在初始 HTML 中可见，还是需要 JS
- 识别客户端渲染 (CSR) 与服务器端渲染 (SSR)
- 标记可能导致索引问题的 SPA 框架（React、Vue、Angular）
- 如适用，验证动态渲染设置

#### JavaScript SEO：Canonical 与索引指导（2025 年 12 月）

Google 于 2025 年 12 月更新了 JavaScript SEO 文档，并作出了以下关键澄清：

1. **Canonical 冲突：** 如果原始 HTML 中的 canonical 标签与 JavaScript 注入的标签不同，Google 可能会采用其中任意一个。确保服务器渲染的 HTML 与 JS 渲染输出中的 canonical 标签完全一致。
2. **使用 JavaScript 设置 noindex：** 如果原始 HTML 包含 `<meta name="robots" content="noindex">`，但 JavaScript 将其移除，Google 仍然可能遵循原始 HTML 中的 noindex。应在初始 HTML 响应中提供正确的 robots 指令。
3. **非 200 状态码：** 对于返回非 200 HTTP 状态码的页面，Google 不会渲染 JavaScript。错误页面上通过 JS 注入的任何内容或 meta 标签都将对 Googlebot 不可见。
4. **JavaScript 中的结构化数据：** 通过 JS 注入的 Product、Article 及其他结构化数据可能会延迟处理。对于有时效性的结构化数据（尤其是电子商务 Product 标记），应将其包含在初始服务器渲染的 HTML 中。

**最佳实践：** 在初始服务器渲染的 HTML 中提供关键 SEO 元素（canonical、meta robots、结构化数据、title、meta description），而不是依赖 JavaScript 注入。

### 9. IndexNow Protocol
- 检查网站是否支持适用于 Bing、Yandex、Naver 的 IndexNow
- Google 以外的搜索引擎支持该协议
- 建议实施该协议，以便在非 Google 搜索引擎上更快地完成索引

## 对代理友好的页面与代理式浏览

AI 代理（不仅是 AI 摘要工具）越来越多地通过以下三种渠道读取网站：截图上的视觉模型、原始 HTML/DOM，以及**无障碍树**（最清晰的信号）。审核标准包括：语义化 HTML（使用真正的 `<button>` 和 `<a>`，而不是 `<div onclick>`）、标签关联、交互目标尺寸、跨模板的布局稳定性、`cursor: pointer` 的正确性，详见 `references/agent-friendly-pages.md`。

Google 现已在 Lighthouse 中提供 **Agentic Browsing** 类别（自
Lighthouse 13.3.0、Chrome 150+ 起默认启用；分组包括：以智能体为中心的无障碍功能、CLS +
llms.txt，以及三项 WebMCP 审计）。它报告的是**分数形式的通过率（N 项中通过 X 项），
而不是 0-100 分制的得分**，请注意将其与下文中本技能自身的 Agent-UX 0-100
启发式评分区分开来。Lighthouse 13.4.1 已通过 PSI API 重新启用该类别。
也可通过带有
`--only-categories=agentic-browsing` 参数的 Lighthouse CLI、DevTools 和 PSI Web UI 使用该类别。请参阅
`references/agent-friendly-pages.md`。

### 审计命令

```bash
# Render with Playwright + capture accessibility tree, then score
claude-seo run agent_ux_check.py https://example.com --json
```

扫描器会输出 Agent-UX 分数（0-100）以及逐项列出的问题：
- HTML 检查结果：真正的按钮/锚点、`<div onclick>` 小部件、语义化
  地标、缺少 `<label for>` 的输入框、缺少 ARIA 标签的输入框
- 无障碍树检查结果：节点总数、交互节点数、未命名的
  交互元素、`role="generic"` 比例

无障碍树快照通过 Playwright 使用 Chromium 的
`Accessibility.getFullAXTree` CDP 命令。如需仅捕获
无障碍树而不进行评分，请使用
`claude-seo run render_page.py <url> --a11y-tree --json`。

将检查结果呈现为**改进机会**，而不是失败项；不要因为 Agent-UX 分数
低于 100 而阻止审计。WebMCP 源试用/注册状态需要核实，
缺少 WebMCP 支持仍应视为改进机会，而不是缺陷。

## 输出

### 技术评分：XX/100

### 分类明细
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

### 严重问题（立即修复）
### 高优先级（1 周内修复）
### 中优先级（1 个月内修复）
### 低优先级（待办事项）

## DataForSEO 集成（可选）

如果 DataForSEO MCP 工具可用，请使用 `on_page_instant_pages` 进行真实页面分析（状态码、页面计时、失效链接、页面内检查），使用 `on_page_lighthouse` 进行 Lighthouse 审计（性能、无障碍性、SEO 评分），并使用 `domain_analytics_technologies_domain_technologies` 检测技术栈。

## Google API 集成（可选）

如果已配置 Google API 凭据，请使用 `claude-seo run pagespeed_check.py <url> --json` 获取真实的 PSI + CrUX 现场数据（替代仅基于实验室数据的 CWV 估算），使用 `claude-seo run crux_history.py <url> --json` 获取 25 周的 CWV 趋势，并使用 `claude-seo run gsc_inspect.py <url> --json` 获取每个 URL 的真实索引状态。

## 错误处理

| 场景 | 操作 |
|----------|--------|
| URL 无法访问 | 报告连接错误及状态码。建议验证 URL、检查 DNS 解析，并确认网站可公开访问。 |
| 未找到 robots.txt | 说明在根域名下未检测到 robots.txt。建议创建包含适当指令的 robots.txt。继续审计其余类别。 |
| 未配置 HTTPS | 标记为严重问题。报告是否存在 HTTP 无重定向直接提供内容、混合内容，或 SSL 证书缺失/已过期。 |
| Core Web Vitals 数据不可用 | 说明 CrUX 数据不可用（低流量网站中很常见）。建议使用 Lighthouse 实验室数据作为替代指标，并建议增加流量后再重新测试。 |