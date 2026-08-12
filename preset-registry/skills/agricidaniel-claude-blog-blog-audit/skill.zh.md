---
name: blog-audit
description: >
  Full-site blog health assessment scanning all blog files for quality scores,
  orphan pages, topic cannibalization, stale content, and AI citation readiness.
  Runs canonical batch analysis before site-wide checks. Produces per-post scores
  and a prioritized action queue. Use when user says "audit blog", "blog audit",
  "site audit", "blog health", "audit all posts", "check all blogs".
user-invokable: true
argument-hint: "[directory]"
license: MIT
---
# 博客审计：全站健康状况评估

对项目中的所有文章执行全面的博客健康状况评估。
扫描质量评分、孤立页面、主题蚕食、过时内容以及 AI 引用就绪度。
使用规范分析器 JSON 作为评分来源，并生成按优先级排序的行动队列。

## 审计流程

### 步骤 1：发现博客文件

扫描项目中的所有博客内容文件：

- 在常见博客目录和 CMS 导出文件夹中，递归匹配 `.md`、`.mdx`、`.html`、`.astro`、`.svelte`、`.vue`、
  `.tsx` 和 `.jsx`
- 需要检查的常见路径：
  - `content/`
  - `posts/`
  - `blog/`
  - `src/content/`
  - `_posts/`
  - `pages/blog/`
  - `articles/`
  - `content/blog/**`
  - 用户明确提供的 CMS 导出文件夹
  - `src/pages/blog/`
- 过滤掉隐藏路径、供应商路径、生成路径以及可能涉及机密信息的路径：`.git/`、
  点号开头的目录、`node_modules/`、`vendor/`、`dist/`、`build/`、`.next/`、
  `coverage/`、`reports/`、生成的导出内容、README、CHANGELOG、LICENSE、
  配置文件、SKILL.md、包文件、`.env*`、密钥和私人笔记
- 报告：“在 [directories] 中找到 N 个博客文件”

如果在标准位置未找到博客文件，请用户提供列入允许列表的根目录，
或仅搜索用户批准的内容目录。默认情况下不要扫描整个项目根目录。

### 步骤 2：规范批量分析

首先运行规范分析器并获取输出，将其用作每篇文章的评分来源：

```bash
python3 scripts/analyze_blog.py <blog-root> --batch --format json
```

分批处理文件，将并行后续工作的数量限制在一个较小的固定值，
遵守上下文限制，并聚合包含 `file`、`score`、
`categories`、`issues` 和 `metadata` 的确定性 JSON。在分析器 JSON 的基础上
叠加以下全站检查，而不是使用单独的评分标准。

#### 内容质量层
- 使用 30 分制内容质量量表为每篇文章评分
- 结合上下文评估段落和句子的节奏；长度仅用于描述，
  并非通用的通过/不通过阈值
- 评估标题结构和问句形式的标题
- 根据用户画像和内容类型评估可读性：面向消费者的内容倾向于
  更易读的区间，专业内容可以处于中等区间，而技术内容可以
  更密集，前提是仍保持清晰

#### SEO 优化层
- 检查每篇文章的页面内 SEO 元素：
  - 标题标签长度（40-60 可接受，50-60 为理想范围，仅作为预览警告）
  - 元描述简洁且针对具体页面。统计数据为可选内容，
    且必须在页面中可见并注明来源
  - H1 是否存在且唯一
  - 图片替代文本覆盖情况
  - 内部和外部链接数量
  - URL 别名质量

#### Schema 验证层
- 检测所有文章中的结构化数据
- 验证 Article/BlogPosting、Person、Organization 和 BreadcrumbList schema 的完整性
- 如果存在 FAQPage，则仅将其作为可选实体标记进行验证，而不是 Google 富媒体搜索结果
- 对 `dateModified`、`lastUpdated`、`updated` 和 `lastmod` 进行规范化，包括
  已进行时区规范化的生成 schema，然后要求新鲜度保持一致
- 标记缺失或格式错误的 schema

#### 链接健康层
- 映射所有文章之间的内部链接
- 构建有向链接图
- 检测孤立页面（没有入站内部链接）
- 检测死胡同页面（没有出站内部链接）
- 检查内部链接目标是否失效
- 推荐双向链接机会

#### 新鲜度检查层
- 从每篇文章的 frontmatter 中读取 lastUpdated 或 dateModified
- 计算自上次更新以来的天数
- 根据内容类型、来源或统计数据的时效，以及 GSC 流量衰减来标记新鲜度，而不是采用
  统一的天数阈值
- 按更新优先级进行分类

#### AI 就绪度层
- 评估每篇文章的 AI 引用就绪度
- 检查重要章节是否内容完整独立且有证据支持
- 评估是否符合目的以及实体是否清晰；问题式标题和常见问题解答是可选项
- 检查摘要和结构化格式是否有助于目标读者
- 检查 robots.txt、llms.txt、SSR/SSG 输出、受 JS 限制的内容、被阻止的资源，
  以及 GPTBot、ClaudeBot、PerplexityBot、Googlebot 和 Google-Extended 策略

### 步骤 2.5：技术抓取和搜索表现

在给出最终建议之前，添加全站技术检查：

- 验证站点地图覆盖范围、robots.txt、noindex 指令、规范标签、
  重定向、HTTP 状态码、hreflang 和内部规范链接的一致性
- 如果可用，使用 `blog-google` 获取 Core Web Vitals、GSC 查询、URL
  检查、索引状态和 GA4 上下文
- 报告已跳过的可选检查，并注明原因，例如
  `SKIPPED: credentials unavailable`

### 步骤 3：主题蚕食检测

分析所有文章之间的关键词竞争：

1. 从每篇文章中提取主要关键词/主题：
   - 标题文本
   - H1 标题
   - 元描述
   - 第一段
2. 通过停用词处理、词形还原、区域设置感知和意图修饰词
   对关键词进行规范化
3. 使用分析器数据、嵌入或明确的置信度按意图进行聚类，
   在可用时使用 GSC 查询到 URL 的数据，并在可用时使用 SERP 重合度
4. 标记相互竞争的文章，并给出以下建议之一：
   - **合并**：将两篇较弱的文章合并为一篇高质量文章
   - **重定向**：在保留反向链接、验证重定向映射并更新内部
     链接后，将较弱的文章通过 301 重定向至较强的文章
   - **差异化**：调整侧重点，使文章分别针对不同的意图

### 步骤 4：孤立页面检测

构建并分析内部链接图：

1. 根据网站配置和站点地图规范化 URL，包括相对链接、
   同域绝对链接、尾部斜杠、生成的路由、锚点和 slug
   映射
2. 构建邻接映射：`{ page -> [pages it links to] }`
3. 构建反向映射：`{ page -> [pages linking to it] }`
4. 识别孤立页面：没有入站内部链接的文章
5. 识别死胡同页面：没有出站内部链接的文章
6. 对于每个孤立页面，根据主题相关性推荐 2-3 篇应链接到该页面的
   现有文章

### 步骤 5：陈旧内容检测

审核所有文章的内容新鲜度：

1. 读取 frontmatter 字段：`lastUpdated`、`dateModified`、`date`、`updated`
2. 计算每篇文章自上次更新以来的天数
3. 按更新优先级进行分类：
   - **高**：主题变化快、来源或统计数据已过时，或 GSC 流量衰减
   - **中**：常青主题中的示例、链接或截图逐渐过时
   - **低**：最近经过验证或内容稳定的参考资料
4. 估算每篇文章的更新工作量：
   - 轻度更新：更新统计数据、检查链接（1-2 小时）
   - 中度更新：重写部分章节、添加新数据（3-4 小时）
   - 重度更新：建议完整重写（5 小时以上）

### 第 6 步：生成全站报告

将所有结果汇总为一份综合报告：

#### 摘要仪表板
```
## Blog Audit Report

**Audit Date:** [date]
**Total Posts:** N
**Average Score:** XX/100

### Health Overview
| Metric | Count |
|--------|-------|
| Posts Scoring 90+ (Excellent) | N |
| Posts Scoring 70-89 (Good) | N |
| Posts Scoring 50-69 (Needs Work) | N |
| Posts Scoring <50 (Poor) | N |
| Orphan Pages | N |
| Dead-End Pages | N |
| Cannibalization Issues | N |
| Stale or Decaying Content | N |
```

#### 单篇文章表格
```
### Per-Post Scores
| Post | Score | Content | SEO | E-E-A-T | Technical | AI Citation | Issues |
|------|-------|---------|-----|---------|-----------|-------------|--------|
| [filename] | XX/100 | X/30 | X/25 | X/15 | X/15 | X/15 | [count] |
```

#### 按优先级排序的操作队列
```
### Prioritized Action Queue (Lowest Score First)
| Priority | Post | Score | Top Issue | Recommended Action |
|----------|------|-------|-----------|--------------------|
| 1 | [file] | XX | [issue] | [action] |
| 2 | [file] | XX | [issue] | [action] |
```

#### 内容蚕食报告
```
### Topic Cannibalization
| Keyword | Competing Posts | Recommendation |
|---------|----------------|----------------|
| [keyword] | post-a.md, post-b.md | Merge / Redirect / Differentiate |
```

#### 孤立页面
```
### Orphan Pages (No Inbound Links)
| Page | Inbound Links | Recommended Link Sources |
|------|---------------|--------------------------|
| [file] | 0 | post-a.md, post-b.md, post-c.md |
```

#### 过时内容
```
### Stale Content
| Post | Last Updated | Days Stale | Priority | Refresh Effort |
|------|-------------|------------|----------|----------------|
| [file] | [date] | [N] | High/Med/Low | Light/Moderate/Heavy |
```

### 第 7 步：保存报告

将带时间戳的 Markdown 和 JSON 导出文件保存在 `reports/` 下，例如
`reports/blog-audit-YYYY-MM-DD.md` 和 `reports/blog-audit-YYYY-MM-DD.json`。
不要覆盖之前的审计报告。

保存后，告知用户：
- 报告位置：`[project-root]/reports/blog-audit-YYYY-MM-DD.md` 和
  `[project-root]/reports/blog-audit-YYYY-MM-DD.json`
- 调查结果摘要（文章总数、平均分、严重问题数量）
- 建议先对得分最低的文章运行 `/blog analyze <file>`
- 建议对关键文章运行 `/blog flow optimize`，以执行 AI 引用 SEO 检查

## 交叉引用

如需进行超出本次全站健康检查范围、以证据为导向的审计提示，请参阅 `/blog flow optimize`（可见性、CTR、schema、信息提取审计）和 `/blog flow win`（双界面记分卡、转化审计）。