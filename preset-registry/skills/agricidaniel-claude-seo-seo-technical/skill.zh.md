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
  version: "2.2.4"
  category: seo
---
# 技术 SEO 审计

## 类别

### 1. 可抓取性
- robots.txt：存在、有效，且未阻止重要资源
- XML 站点地图：运行 `claude-seo run sitemap_discovery.py <url> --json`；要求 `found` 中存在有效条目，并将过期或不安全的 robots.txt 声明与可正常工作的备用位置分开报告
- Noindex 标签：判断是有意设置还是意外设置
- 抓取深度：重要页面应能在从首页出发的 3 次点击内到达
- JavaScript 渲染：检查关键内容是否需要执行 JS
- 抓取预算：对于大型网站（页面数 >10k），效率很重要
- Googlebot **提取限制**：Googlebot 会提取 HTML 的前 **2MB** 和 PDF 的前 **64MB**（未压缩；15MB 是更广泛的抓取工具基础设施默认值）。这是长期存在的限制，并非 2026 年的变更，但内联 base64 图片、过大的内联 CSS/JS 或臃肿的导航可能会将关键内容/JSON-LD 推到上限之外，从而无法被编入索引。确保关键内容和结构化数据位于前 2MB 以内。
- 抓取速率会**自动调整**（遇到 5xx/响应缓慢时会降低速率）；**无法手动控制抓取速率**（旧版 Search Console 设置已于 2024 年 1 月移除）。可通过站点地图、服务器响应能力和 robots 控制来影响抓取。
- Google 的权威抓取/robots 参考资料已迁移至 **developers.google.com/crawling**（迁移日期为 2025-11-20）；IP 范围文件已移至 `/crawling/ipranges/`，且 `googlebot.json` 已重命名为 `common-crawlers.json`。

#### AI 抓取工具管理

截至 2025-2026 年，AI 公司正在积极抓取 Web 内容，以训练模型并支持 AI 搜索。通过 robots.txt 管理这些抓取工具是技术 SEO 中的一项关键考量。

**已知的 AI 抓取工具：**

| 抓取工具 | 公司 | robots.txt 令牌 | 用途 |
|---------|---------|-----------------|---------|
| GPTBot | OpenAI | `GPTBot` | 模型训练 |
| ChatGPT-User | OpenAI | `ChatGPT-User` | 实时浏览 |
| ClaudeBot | Anthropic | `ClaudeBot` | 模型训练 |
| PerplexityBot | Perplexity | `PerplexityBot` | 搜索索引 + 训练 |
| Bytespider | ByteDance | `Bytespider` | 模型训练 |
| Google-Extended | Google | `Google-Extended` | Gemini 训练（非搜索） |
| CCBot | Common Crawl | `CCBot` | 开放数据集 |

**关键区别：**
- 阻止 `Google-Extended` 会防止内容被用于 Gemini 训练，但不会影响 Google 搜索索引或 AI Overviews（它们使用 `Googlebot`）
- 阻止 `GPTBot` 会防止内容被用于 OpenAI 训练，但不会阻止 ChatGPT 通过浏览功能（`ChatGPT-User`）引用你的内容
- 目前约有 3-5% 的网站使用针对 AI 的 robots.txt 规则

**示例：选择性阻止 AI 抓取工具：**
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

**建议：** 在阻止之前，请考虑你的 AI 可见性策略。被 AI 系统引用可以提升品牌知名度并带来引荐流量。有关完整的 AI 抓取工具/提取工具分类，请交叉参考 `seo-geo` skill。

> **用户触发的抓取工具在设计上会忽略 robots.txt。** Google 现已将 **Google-Agent**（Project Mariner，智能体式浏览）、**Google-NotebookLM** 和 **Google Messages** 记录为*用户触发的*抓取工具，**无法通过 robots.txt 屏蔽**。请改用服务器端访问控制。相比之下，`Google-Extended` 和 `Google-CloudVertexBot` 会遵守 robots.txt。新兴方案：**Web Bot Auth**（RFC 9421）允许机器人通过 `Signature-Agent` 标头以及位于 `agent.bot.goog` 的密钥目录进行加密身份验证（Google-Agent 已采用）；反向 DNS 验证仍作为后备方案。

### 2. 可索引性
- 规范标签：自引用，不与 noindex 冲突
- 重复内容：近似重复内容、参数 URL、www 与非 www
- 单薄内容：字数低于相应类型最低要求的页面
- 分页：rel=next/prev 或“加载更多”模式
- Hreflang：针对多语言/多地区网站正确配置
- 索引膨胀：不必要的页面消耗抓取预算

### 3. 安全性
- HTTPS：强制启用、SSL 证书有效、无混合内容
- 安全标头：
  - Content-Security-Policy (CSP)
  - Strict-Transport-Security (HSTS)
  - X-Frame-Options
  - X-Content-Type-Options
  - Referrer-Policy
- HSTS 预加载：对于高安全性网站，检查是否已列入预加载列表
- **返回按钮劫持**（违反垃圾内容政策，属于恶意行为）：标记通过 `history.pushState`/`replaceState` 使返回按钮失效的页面（包括第三方广告/库平台注入的脚本）。已于 2026-04-13 纳入 Google 垃圾内容政策；**自 2026-06-15 起已开始执行**（人工处置 + 自动降权）：按严重问题处理。

### 4. URL 结构
- 简洁 URL：具有描述性、使用连字符，内容 URL 不含查询参数
- 层级结构：反映网站架构的合理文件夹结构
- 重定向：无重定向链（最多 1 跳），永久迁移使用 301
- URL 长度：标记超过 100 个字符的 URL
- 尾部斜杠：用法保持一致

### 5. 移动端优化与网页体验
- 响应式设计：viewport 元标签、响应式 CSS
- 触控目标：最小 48x48px，间距为 8px
- 字体大小：基础字号最小为 16px
- 无水平滚动
- 移动优先索引：Googlebot Smartphone 是主要抓取工具（已于 2024 年完成全面启用）。移动版本**并非严格要求**（Google 表示“强烈建议”）；无法在移动端正常运行的网站仍可能被索引，但真正的风险是**内容缺失/不一致**，而不是被彻底排除。
- **移动端/桌面端内容一致性**（价值最高的移动端检查项）：主要内容等效、robots 元标签一致、标题/描述一致、结构化数据等效、资源可抓取；避免以需要用户交互的延迟加载方式加载主要内容。
- **侵入式插页/广告密度**：标记全屏插页、独立的同意确认跳转页面、持续阻挡内容的对话框，以及过多或干扰性强的广告密度（网页体验中明确列出的一项）。可接受的形式：小型横幅、标准 CMS/法律合规对话框。
- **“阅读更多”深层链接**：确保关键内容**在加载后立即可见**（而非隐藏在选项卡/手风琴式折叠区域中），不要在加载时劫持滚动，并保留 URL 哈希片段；隐藏在可展开区域后的内容不太可能符合要求。

> **网页体验只是指导因素，并非一个独立的排名系统。**只有 **Core Web Vitals** 会直接影响排名；**HTTPS** 是一个已确认但权重较低的信号（影响不到约 1% 的查询）。即使网页体验欠佳，相关性仍可能占据优势，因此不要过度看重安全标头。注意：Search Console 中独立的**网页体验报告已被移除**（请通过 Core Web Vitals 和 HTTPS 报告进行监控）。

### 6. Core Web Vitals
- **LCP**（最大内容绘制）：目标值 <=2.5s
- **INP**（交互到下一次绘制）：目标值 <=200ms
  - INP 已于 2024 年 3 月 12 日取代 FID。FID 已于 2024 年 9 月 9 日从 Chrome 的现场数据工具（CrUX API、PageSpeed Insights）中移除（Lighthouse 是一个实验室工具，从未报告过 FID）。任何地方都不得提及 FID。
- **CLS**（累积布局偏移）：目标值 <=0.1
- 评估使用真实用户数据的第 75 百分位数
- 如果 MCP 可用，则使用 PageSpeed Insights API 或 CrUX 数据

### 7. 结构化数据
- 检测：JSON-LD（首选）、Microdata、RDFa
- 根据 Google 支持的类型进行验证
- 如需完整分析，请参阅 seo-schema skill

### 8. JavaScript 渲染
- 检查内容在初始 HTML 中是否可见，还是需要 JS 才能显示
- 识别客户端渲染（CSR）与服务器端渲染（SSR）
- 标记可能导致索引问题的 SPA 框架（React、Vue、Angular）
- 如果适用，验证动态渲染配置

#### JavaScript SEO：规范网址与索引指南（2025 年 12 月）

Google 于 2025 年 12 月更新了其 JavaScript SEO 文档，其中包含重要说明：

1. **规范网址冲突：**如果原始 HTML 中的 canonical 标签与 JavaScript 注入的标签不同，Google 可能使用其中任意一个。请确保服务器渲染的 HTML 与 JS 渲染的输出中的 canonical 标签完全一致。
2. **JavaScript 与 noindex：**如果原始 HTML 包含 `<meta name="robots" content="noindex">`，但 JavaScript 将其移除，Google 仍可能遵循原始 HTML 中的 noindex。请在初始 HTML 响应中提供正确的 robots 指令。
3. **非 200 状态码：**Google 不会在返回非 200 HTTP 状态码的网页上渲染 JavaScript。错误页面中通过 JS 注入的任何内容或 meta 标签对 Googlebot 都不可见。
4. **JavaScript 中的结构化数据：**通过 JS 注入的 Product、Article 和其他结构化数据可能会延迟处理。对于时效性强的结构化数据（尤其是电子商务 Product 标记），请将其包含在服务器渲染的初始 HTML 中。

**最佳实践：**在服务器渲染的初始 HTML 中提供关键 SEO 元素（canonical、meta robots、结构化数据、title、meta description），而不是依赖 JavaScript 注入。

### 9. IndexNow 协议
- 检查网站是否支持面向 Bing、Yandex、Naver 的 IndexNow
- Google 以外的搜索引擎支持此协议
- 建议实施此协议，以便在非 Google 搜索引擎上实现更快的索引

## 对智能体友好的页面与智能体式浏览

AI 智能体（而不仅仅是 AI 摘要工具）越来越多地通过三种
渠道读取网站：基于屏幕截图的视觉模型、原始 HTML/DOM，以及**无障碍
树**（最清晰的信号）。审核标准包括：语义化 HTML（使用真正的 `<button>`
和 `<a>`，而不是 `<div onclick>`）、标签关联、交互目标尺寸、
不同模板之间的布局稳定性、`cursor: pointer` 的正确性；完整内容位于
`references/agent-friendly-pages.md`。

Google 现已在 Lighthouse 中提供 **Agentic Browsing** 类别（自 Lighthouse 13.3.0、Chrome 150+ 起默认启用；分组包括：以智能体为中心的无障碍功能、CLS +
llms.txt，以及三项 WebMCP 审计）。它报告的是**分数形式的通过比例（X of N），
而不是 0-100 分数**，请注意将其与下文此技能自身的 Agent-UX 0-100
启发式评分区分开来。PSI REST API 不提供该类别；请通过 Lighthouse CLI
`--only-categories=agentic-browsing`、DevTools 或 PSI Web UI 运行。请参阅
`references/agent-friendly-pages.md`。

### 审计命令

```bash
# Render with Playwright + capture accessibility tree, then score
claude-seo run agent_ux_check.py https://example.com --json
```

扫描器会输出 Agent-UX 分数（0-100）以及逐项列出的问题：
- HTML 检查结果：真实按钮/锚点、`<div onclick>` 小组件、语义化
  地标、缺少 `<label for>` 的输入框、缺少 ARIA 标签的输入框
- 无障碍树检查结果：节点总数、交互节点、未命名的
  交互元素、`role="generic"` 比例

无障碍树快照使用 Playwright 的
`page.accessibility.snapshot(interesting_only=False)`。若只捕获树而不评分，
请使用 `claude-seo run render_page.py <url> --a11y-tree --json`。

请将检查结果表述为**改进机会**，而不是失败项；不要因 Agent-UX 分数
低于 100 而阻止审计。WebMCP 的源试用/注册状态需要核实，
且不支持 WebMCP 仍应视为改进机会，而不是缺陷。

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

### 严重问题（立即修复）
### 高优先级（1 周内修复）
### 中优先级（1 个月内修复）
### 低优先级（待办事项）

## DataForSEO 集成（可选）

如果 DataForSEO MCP 工具可用，请使用 `on_page_instant_pages` 进行真实页面分析（状态码、页面计时、失效链接、页面检查），使用 `on_page_lighthouse` 进行 Lighthouse 审计（性能、无障碍、SEO 分数），并使用 `domain_analytics_technologies_domain_technologies` 检测技术栈。

## Google API 集成（可选）

如果已配置 Google API 凭据，请使用 `claude-seo run pagespeed_check.py <url> --json` 获取真实的 PSI + CrUX 现场数据（替代仅基于实验室数据的 CWV 估算），使用 `claude-seo run crux_history.py <url> --json` 获取 25 周的 CWV 趋势，并使用 `claude-seo run gsc_inspect.py <url> --json` 获取每个 URL 的真实索引状态。

## 错误处理

| 场景 | 操作 |
|----------|--------|
| URL 无法访问 | 报告连接错误及状态码。建议验证 URL、检查 DNS 解析，并确认网站可公开访问。 |
| 未找到 robots.txt | 说明未在根域名检测到 robots.txt。建议创建一个包含适当指令的文件。继续审计其余类别。 |
| 未配置 HTTPS | 标记为严重问题。报告是否直接提供 HTTP 服务而未重定向、是否存在混合内容，或 SSL 证书是否缺失/已过期。 |
| Core Web Vitals 数据不可用 | 说明 CrUX 数据不可用（低流量网站很常见）。建议使用 Lighthouse 实验室数据作为替代指标，并建议在流量增加后重新测试。 |