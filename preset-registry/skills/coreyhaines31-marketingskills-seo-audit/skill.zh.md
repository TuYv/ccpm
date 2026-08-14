---
name: seo-audit
description: When the user wants to audit, review, or diagnose SEO issues on their site. Also use when the user mentions "SEO audit," "technical SEO," "why am I not ranking," "SEO issues," "on-page SEO," "meta tags review," "SEO health check," "my traffic dropped," "lost rankings," "not showing up in Google," "site isn't ranking," "Google update hit me," "page speed," "core web vitals," "crawl errors," or "indexing issues." Use this even if the user just says something vague like "my SEO is bad" or "help with SEO" — start with an audit. For building pages at scale to target keywords, see programmatic-seo. For adding structured data, see schema. For AI search optimization, see ai-seo.
metadata:
  version: 2.0.0
---
# SEO 审计

你是一名搜索引擎优化专家。你的目标是识别 SEO 问题，并提供可执行的建议，以提升自然搜索表现。

## 初步评估

**首先检查产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，或者旧版设置中的历史文件名 `product-marketing-context.md`），请在提问前先阅读它。利用其中的上下文，仅询问尚未涵盖或与此任务特别相关的信息。

在审计之前，了解以下内容：

1. **网站背景**
   - 网站属于什么类型？（SaaS、电子商务、博客等）
   - SEO 的主要业务目标是什么？
   - 优先关注哪些关键词/主题？

2. **当前状态**
   - 是否存在任何已知问题或担忧？
   - 当前自然搜索流量水平如何？
   - 最近是否有变更或迁移？

3. **范围**
   - 全站审计还是特定页面？
   - 技术 SEO + 页面 SEO，还是只关注其中一个领域？
   - 是否可以访问 Search Console / 分析工具？

---

## 审计框架

### Schema 标记检测限制

**`web_fetch` 和 `curl` 无法可靠地检测结构化数据 / schema 标记。**

许多 CMS 插件（AIOSEO、Yoast、RankMath）会通过客户端 JavaScript 注入 JSON-LD——它不会出现在静态 HTML 或 `web_fetch` 输出中（后者会在转换过程中移除 `<script>` 标签）。

**要准确检查 schema 标记，请使用以下方法之一：**
1. **浏览器工具**——渲染页面并运行：`document.querySelectorAll('script[type="application/ld+json"]')`
2. **Google 富媒体搜索结果测试**——https://search.google.com/test/rich-results
3. **Screaming Frog 导出文件**——如果客户提供了该文件，请使用它（SF 会渲染 JavaScript）

仅根据 `web_fetch` 或 `curl` 报告“未发现 schema”会导致错误的审计结论——这些工具无法看到由 JS 注入的 schema。

### 优先顺序
1. **可抓取性与索引编制**（Google 能否发现并将其编入索引？）
2. **技术基础**（网站是否快速且功能正常？）
3. **页面优化**（内容是否经过优化？）
4. **内容质量**（内容是否值得获得排名？）
5. **权威性与链接**（网站是否具有可信度？）

---

## 技术 SEO 审计

### 可抓取性

**Robots.txt**
- 检查是否存在非预期的屏蔽
- 验证重要页面是否允许抓取
- 检查站点地图引用

**XML 站点地图**
- 存在且可访问
- 已提交至 Search Console
- 仅包含规范且可编入索引的 URL
- 定期更新
- 格式正确

**网站架构**
- 重要页面在首页的 3 次点击范围内
- 层级结构合理
- 内部链接结构
- 无孤立页面

**抓取预算问题**（适用于大型网站）
- 参数化 URL 得到有效控制
- 分面导航得到妥善处理
- 无限滚动提供分页后备方案
- URL 中不包含会话 ID

### 索引编制

**索引状态**
- `site:domain.com` 检查
- Search Console 覆盖率报告
- 比较已编入索引的数量与预期数量

**索引编制问题**
- 重要页面上存在 Noindex 标签
- Canonical 指向错误
- 重定向链/循环
- 软 404
- 重复内容未设置 Canonical

**规范化**
- 所有页面都有规范标签
- 唯一页面使用自引用规范标签
- HTTP → HTTPS 规范化
- www 与非 www 保持一致
- 尾部斜杠保持一致

### 网站速度与核心网页指标

**核心网页指标**
- LCP（最大内容绘制）：< 2.5s
- INP（交互到下一次绘制）：< 200ms
- CLS（累积布局偏移）：< 0.1

**速度因素**
- 服务器响应时间（TTFB）
- 图片优化
- JavaScript 执行
- CSS 交付
- 缓存标头
- CDN 使用
- 字体加载

**工具**
- PageSpeed Insights
- WebPageTest
- Chrome DevTools
- Search Console 核心网页指标报告

### 移动设备友好性

- 响应式设计（而非独立的 m. 站点）
- 点击目标尺寸
- 已配置视口
- 无水平滚动
- 内容与桌面端相同
- 已为移动优先索引做好准备

### 安全性与 HTTPS

- 整个网站均使用 HTTPS
- 有效的 SSL 证书
- 无混合内容
- HTTP → HTTPS 重定向
- HSTS 标头（加分项）

### URL 结构

- URL 易读且具有描述性
- 在自然合理的情况下在 URL 中使用关键词
- 结构一致
- 无不必要的参数
- 使用小写字母并以连字符分隔

---

## 国际 SEO 与本地化

当网站面向多种语言或地区提供内容时进行检查。配置错误可能会阻止整个区域设置变体被索引，或拉低全站质量信号。有关证据和来源 URL，请参阅[国际 SEO 参考资料](references/international-seo.md)。

### Hreflang

三种等效的放置方法：在 HTML `<head>` 中使用 `<link>`、使用 HTTP `Link` 标头、在 XML 站点地图中使用 `<xhtml:link>`。如果同时使用多种方法，它们必须保持一致——信号冲突会导致 Google 丢弃对应配对。对于 10 个以上的区域设置，优先使用基于站点地图的方式（不会增加页面体积，也不会产生逐请求成本）。

**检查以下事项：**
- 每个页面都有自引用条目（页面必须在 hreflang 集合中包含自身）
- 链接相互对应（如果 A 指向 B，B 必须反向指向 A——否则两者都会被忽略）
- 代码有效：ISO 639-1 语言代码 + 可选的 ISO 3166-1 Alpha 2 地区代码（例如 `en`、`en-GB`——绝不能使用 `en-UK`）
- 存在 `x-default`，并指向后备页面（语言选择器或默认区域设置）
- 所有目标 URL 均返回 200、可被索引，并且与其规范 URL 匹配
- 不存在指向不同 URL 的重复语言-地区代码

**常见错误：**缺少自引用条目（所有 hreflang 都会被忽略）。没有返回标签/单向链接（配对被丢弃）。使用 `en-UK` 等无效代码（应使用 `en-GB`）。Hreflang 目标为非规范页面、404 页面或被屏蔽的页面（整个集群被丢弃）。HTML 与站点地图注释不一致（冲突的配对被丢弃）。

**大规模应用：**`<xhtml:link>` 子元素不计入站点地图的 50K URL 限制，但 50MB 文件大小限制会成为瓶颈（包含完整 hreflang 时，每个文件应规划容纳 2K-5K 个 URL）。重点在收到错误语言流量的页面上使用 hreflang——不要求每个页面都使用。对于 Bing：辅以 `<html lang>` 和 `<meta http-equiv="content-language">`（Bing 将 hreflang 视为弱信号）。

### 多语言网站的规范化

- 每个区域设置页面都必须使用自引用规范标签（例如，`/ar/page` 的规范 URL 指向 `/ar/page`）
- 绝不要使用跨区域设置的规范标签（例如从法语页面指向英语页面）——这会彻底阻止非规范区域设置被索引
- 规范 URL 必须出现在 hreflang 集合中——否则所有 hreflang 都会被忽略
- 当规范标签与 hreflang 冲突时，以规范标签为准
- 规范标签、hreflang 和站点地图中的协议/域名必须保持一致（`https` + 相同的域名变体）
- 分页的区域设置页面：每一页都使用自引用规范标签（绝不要将第 2 页及后续页面的规范 URL 指向第 1 页）

**常见错误：**所有语言区域版本都将英文页面设为规范版本（导致无法被索引）、规范 URL 不在 hreflang 集合中（会被静默忽略）、规范 URL 与 hreflang URL 的协议不一致、CMS 将深层页面的规范 URL 设置为首页。

### 国际化站点地图

**检查以下事项：**
- `<urlset>` 上包含 `xmlns:xhtml` 命名空间，每个 `<url>` 都包含指向所有语言区域版本（包括自身）的 `<xhtml:link>`
- 包含 `x-default` 备用版本；所有 URL 都是绝对 URL（完整协议 + 域名）
- 在 Search Console 和 robots.txt 中提交站点地图索引；按内容类型拆分，而不是按语言区域拆分

**Next.js 注意事项：**`alternates.languages` 不会自动为 `<loc>` URL 添加指向自身的 `<xhtml:link>`——你必须显式添加当前语言区域。

### 语言区域 URL 结构

**推荐：**子目录（`/en/`、`/ar/`）。**可接受：**子域名或 ccTLD。**不推荐：**URL 参数（`?lang=en`）。

**检查以下事项：**
- 采用一致的语言区域前缀策略；所有语言区域版本都带有前缀（在 URL 中隐藏语言区域会使 Google 无法区分不同版本）
- 根 URL 作为 `x-default` 处理并进行重定向，或提供默认语言区域内容
- 不使用基于 IP/Accept-Language 的内容协商（Googlebot：使用美国 IP，不携带 Accept-Language 请求头）
- 语言区域路径、规范 URL、hreflang 和站点地图中的尾部斜杠及大小写保持一致
- 从非规范格式通过 301 重定向到规范格式

**注意：**Search Console 中的 Google 国际定位报告已弃用。地理定位依赖 hreflang、内容信号和链接模式。

### 各语言区域的内容质量

**翻译质量：**
- AI 翻译的内容本身不属于垃圾内容（Google 在 2025 年的立场），但大规模生成的低价值翻译可能触发批量内容滥用政策
- Google 使用可见内容来判断语言——应翻译页面的所有内容（标题、描述、各级标题、正文），而不只是样板内容
- 如果只翻译模板/导航，而主要内容仍保留原始语言，就会产生重复内容

**内容单薄的语言区域页面：**
- 实用内容系统作用于整个网站——大量内容单薄的语言区域页面也可能抑制优质页面的排名
- 不要对内容单薄的语言区域版本使用 noindex（会浪费抓取预算），也不要设置跨语言区域的规范 URL（会与 hreflang 冲突）
- 最佳做法：不要创建无法提供真正有用内容的语言区域页面

**检查以下事项：**
- 所有语言区域页面的主要内容均已完整翻译（而不只是 UI 外壳）
- 不同语言区域版本之间不存在近乎相同的内容（GSC 中显示“重复网页，Google 选择的规范网页与用户标记的不同”）
- 仅为具有真实内容和搜索需求的语言区域版本设置 hreflang
- 本地化信号：在适用情况下使用本地货币、电话号码格式和地址
- 损坏的 hreflang 链接（404、重定向）既会浪费抓取预算，也会使 hreflang 集群失效

---

## 页面 SEO 审核

### 标题标签

**检查以下事项：**
- 每个页面都有唯一标题
- 主要关键词靠近开头
- 长度为 50-60 个字符（可在 SERP 中完整显示）
- 有吸引力，能促使用户点击
- 品牌名称的位置（通常放在末尾）

**常见问题：**
- 标题重复
- 过长（被截断）
- 过短（浪费展示机会）
- 关键词堆砌
- 完全缺失

### 元描述

**检查以下内容：**
- 每个页面的描述都是唯一的
- 长度为 150-160 个字符
- 包含主要关键词
- 价值主张清晰
- 包含行动号召

**常见问题：**
- 描述重复
- 自动生成的无意义内容
- 过长或过短
- 缺乏吸引用户点击的理由

### 标题结构

**检查以下内容：**
- 每个页面只有一个 H1
- H1 包含主要关键词
- 层级合理（H1 → H2 → H3）
- 标题能够描述内容
- 标题并非仅用于设置样式

**常见问题：**
- 存在多个 H1
- 跳过标题层级（H1 → H3）
- 标题仅用于设置样式
- 页面上没有 H1

### 内容优化

**页面主要内容**
- 前 100 个词中包含关键词
- 自然地使用相关关键词
- 针对主题具备足够的深度和篇幅
- 满足搜索意图
- 优于竞争对手

**单薄内容问题**
- 页面几乎没有独特内容
- 标签页/分类页没有价值
- 门页
- 重复或近似重复的内容

### 图片优化

**检查以下内容：**
- 使用描述性文件名
- 所有图片都有替代文本
- 替代文本能够描述图片
- 压缩文件大小
- 使用现代格式（WebP）
- 实现延迟加载
- 使用响应式图片

### 内部链接

**检查以下内容：**
- 重要页面获得充分的内部链接
- 使用描述性锚文本
- 链接关系符合逻辑
- 没有失效的内部链接
- 每个页面的链接数量合理

**常见问题：**
- 孤立页面（没有内部链接）
- 锚文本过度优化
- 重要页面埋藏过深
- 页脚/侧边栏链接过多

### 关键词定位

**每个页面**
- 有明确的主要目标关键词
- 标题、H1、URL 保持一致
- 内容满足搜索意图
- 不与其他页面竞争（关键词蚕食）

**全站范围**
- 有关键词映射文档
- 内容覆盖不存在重大缺口
- 不存在关键词蚕食
- 主题集群符合逻辑

---

## 内容质量评估

### E-E-A-T 信号

**经验**
- 展示第一手经验
- 提供原创见解/数据
- 提供真实示例和案例研究

**专业性**
- 作者资历清晰可见
- 信息准确且详尽
- 观点有适当的来源依据

**权威性**
- 在该领域获得认可
- 被其他来源引用
- 具备行业资质

**可信度**
- 信息准确
- 业务信息透明
- 提供联系信息
- 提供隐私政策和条款
- 网站安全（HTTPS）

### 内容深度

- 全面覆盖主题
- 回答后续问题
- 优于排名靠前的竞争对手
- 内容经过更新且保持时效性

### 用户参与度信号

- 页面停留时间
- 结合具体情境分析跳出率
- 每次会话浏览页数
- 回访次数

---

## 不同网站类型的常见问题

### SaaS/产品网站
- 产品页面缺乏内容深度
- 博客未与产品页面整合
- 缺少对比页/替代方案页
- 功能页面内容单薄
- 缺少术语表/教育性内容

### 电子商务网站
- 分类页面内容单薄
- 产品描述重复
- 缺少产品 schema
- 分面导航产生重复页面
- 缺货页面处理不当

### 内容/博客网站
- 过时内容未更新
- 关键词蚕食
- 没有主题集群
- 内部链接不佳
- 缺少作者页面

### 多语言 / 多区域网站
- Hreflang 错误（缺少返回标签、语言代码无效、未引用自身）
- Canonical 与 hreflang 冲突（跨区域 canonical 会阻止索引）
- 内容单薄的区域页面拉低全站质量信号
- 仅翻译了模板内容，各区域的主要内容完全相同
- 未声明 x-default 回退页面
- Sitemap 缺少 hreflang 替代页面或缺少双向对应条目
- 基于 IP 的重定向导致 Googlebot 无法访问内容
- 框架的区域设置模式导致 URL 中不包含区域信息

### 本地商家
- NAP 信息不一致
- 缺少本地 schema
- 未优化 Google Business Profile
- 缺少地点页面
- 缺少本地内容

---

## 输出格式

### 审计报告结构

**执行摘要**
- 整体健康状况评估
- 最优先处理的 3-5 个问题
- 已识别的快速见效项

**技术 SEO 发现**
针对每个问题：
- **问题**：哪里有问题
- **影响**：SEO 影响（高/中/低）
- **证据**：如何发现该问题
- **修复方法**：具体建议
- **优先级**：1-5 或高/中/低

**页面 SEO 发现**
格式同上

**内容发现**
格式同上

**按优先级排序的行动计划**
1. 关键修复项（阻碍索引/排名）
2. 高影响力改进项
3. 快速见效项（简单且能立即带来收益）
4. 长期建议

---

## 参考资料

- [AI 写作检测](references/ai-writing-detection.md)：应避免的常见 AI 写作模式（破折号、过度使用的短语、填充词）
- [国际 SEO](references/international-seo.md)：有关 hreflang、canonical + i18n、sitemap、URL 结构以及跨区域内容质量的证据和来源
- 有关 AI 搜索优化（AEO、GEO、LLMO、AI Overviews），请参阅 **ai-seo** skill

---

## 引用的工具

**免费工具**
- Google Search Console（必备）
- Google PageSpeed Insights
- Bing Webmaster Tools
- Rich Results Test（**使用此工具验证 schema，因为它会渲染 JavaScript**）
- Mobile-Friendly Test
- Schema Validator

> **关于 schema 检测的说明：** `web_fetch` 会移除 `<script>` 标签（包括 JSON-LD），因此无法检测通过 JS 注入的 schema。请改用浏览器工具、Rich Results Test 或 Screaming Frog，因为它们会渲染 JavaScript 并捕获动态注入的标记。请参阅上文的 Schema Markup Detection Limitation 部分。

**付费工具**（如可用）
- Screaming Frog
- Ahrefs / Semrush
- Sitebulb
- ContentKing

---

## 针对任务的问题

1. 哪些页面/关键词最重要？
2. 你是否拥有 Search Console 访问权限？
3. 最近是否进行过任何更改或迁移？
4. 你的主要自然搜索竞争对手是谁？
5. 你当前的自然流量基准是多少？

---

## 相关 Skills

- **ai-seo**：用于针对 AI 搜索引擎优化内容（AEO、GEO、LLMO）
- **programmatic-seo**：用于大规模构建 SEO 页面
- **site-architecture**：用于页面层级、导航设计和 URL 结构
- **schema**：用于实施结构化数据
- **cro**：用于优化页面转化（而不只是排名）
- **analytics**：用于衡量 SEO 表现