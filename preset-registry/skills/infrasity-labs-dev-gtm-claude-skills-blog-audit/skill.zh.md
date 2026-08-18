---
name: blog-audit
description: >
  Full-site blog health assessment scanning all blog files for quality scores,
  orphan pages, topic cannibalization, stale content, and AI citation readiness.
  Spawns parallel subagents for comprehensive analysis. Produces per-post scores
  and a prioritized action queue. Use when user says "audit blog", "blog audit",
  "site audit", "blog health", "audit all posts", "check all blogs".
user-invokable: true
argument-hint: "[directory]"
---
# 博客审计：全站健康评估

对项目中的所有文章执行全面的博客健康评估。
扫描内容质量评分、孤立页面、主题蚕食、过时内容以及 AI 引用就绪度。
使用并行子代理进行高效分析，并生成按优先级排序的行动队列。

## 审计流程

### 第 1 步：发现博客文件

扫描项目中的所有博客内容文件：

- 在常见博客目录中使用 Glob 查找 `*.md`、`*.mdx`、`*.html`
- 需要检查的常见路径：
  - `content/`
  - `posts/`
  - `blog/`
  - `src/content/`
  - `_posts/`
  - `pages/blog/`
  - `articles/`
  - `src/pages/blog/`
- 过滤非博客文件：README、CHANGELOG、LICENSE、配置文件、
  SKILL.md、package.json、node_modules
- 报告："在 [directories] 中找到 N 个博客文件"

如果在标准位置未找到博客文件，则在整个项目根目录中搜索包含博客类 frontmatter（title、date、description）的 Markdown 文件。

### 第 2 步：并行分析

通过 Task 工具启动子代理，对所有已发现的博客文件进行并行处理：

#### 内容质量代理
- 按照 30 分制内容质量评分标准为每篇文章评分
- 检查段落长度（目标为 40-80 个单词，硬性上限为 150 个单词）
- 检查句子长度（目标为 15-20 个单词）
- 评估标题结构和问句形式的标题
- 评估可读性（弗莱施阅读易读性目标为 60-70）

#### SEO 优化代理
- 检查每篇文章的页面 SEO 元素：
  - 标题标签长度（50-60 个字符）
  - Meta 描述（150-160 个字符，包含统计数据）
  - H1 是否存在且唯一
  - 图片 alt 文本覆盖率
  - 内部链接和外部链接数量
  - URL slug 质量

#### Schema 验证代理
- 检测所有文章中的结构化数据
- 验证 BlogPosting schema 的完整性
- 检查 FAQ schema 是否存在以及格式是否正确
- 验证 dateModified 是否与 frontmatter 中的 lastUpdated 一致
- 标记缺失或格式错误的 schema

#### 链接健康代理
- 映射所有文章之间的内部链接
- 构建有向链接图
- 检测孤立页面（入站内部链接数为零）
- 检测死胡同页面（出站内部链接数为零）
- 检查损坏的内部链接目标
- 推荐双向链接机会

#### 时效性检查代理
- 从每篇文章的 frontmatter 中读取 lastUpdated 或 dateModified
- 计算距上次更新的天数
- 标记超过 90 天未更新的文章
- 按更新优先级分类

#### AI 就绪度代理
- 评估每篇文章的 AI 引用就绪度
- 检查段落级可引用性（120-180 个单词的章节）
- 评估问答格式和实体明确性
- 检查是否包含 TL;DR 框和引用摘要块
- 评估 AI 爬虫的可访问性

### 第 3 步：主题蚕食检测

分析所有文章之间的关键词竞争：

1. 从每篇文章中提取主要关键词/主题：
   - 标题文本
   - H1 标题
   - Meta 描述
   - 第一段
2. 规范化关键词（转换为小写、移除停用词）
3. 检测多篇文章是否以同一主要关键词为目标
4. 标记相互竞争的文章，并给出以下建议之一：
   - **合并**：将两篇较弱的文章合并为一篇高质量文章
   - **重定向**：将较弱的文章通过 301 重定向至较强的文章
   - **差异化**：调整侧重点，使文章分别针对不同的搜索意图

### 第 4 步：孤立页面检测

构建并分析内部链接图：

1. 对于每篇博客文章，提取所有内部链接（相对链接和绝对链接）
2. 构建邻接映射：`{ page -> [pages it links to] }`
3. 构建反向映射：`{ page -> [pages linking to it] }`
4. 识别孤立页面：入站内部链接为零的文章
5. 识别死胡同页面：出站内部链接为零的文章
6. 对于每个孤立页面，根据主题相关性推荐 2-3 篇应链接到该页面的现有文章

### 第 5 步：陈旧内容检测

审核所有文章的内容时效性：

1. 读取 frontmatter 字段：`lastUpdated`、`dateModified`、`date`、`updated`
2. 计算每篇文章自上次更新以来的天数
3. 按更新优先级分类：
   - **高**（>180 天）：内容可能已过时，统计数据可能已陈旧
   - **中**（90-180 天）：检查准确性并更新统计数据
   - **低**（<90 天）：近期已更新，无需立即处理
4. 估算每篇文章的更新工作量：
   - 轻度更新：更新统计数据、检查链接（1-2 小时）
   - 中度更新：重写部分章节、添加新数据（3-4 小时）
   - 重度更新：建议全文重写（5 小时以上）

### 第 6 步：生成全站报告

将所有结果汇总为一份综合报告：

#### 汇总仪表板
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
| Stale Content (90+ days) | N |
```

#### 各文章表格
```
### Per-Post Scores
| Post | Score | Content | SEO | E-E-A-T | Technical | AI Citation | Issues |
|------|-------|---------|-----|---------|-----------|-------------|--------|
| [filename] | XX/100 | X/25 | X/20 | X/20 | X/15 | X/20 | [count] |
```

#### 按优先级排序的行动队列
```
### Prioritized Action Queue (Lowest Score First)
| Priority | Post | Score | Top Issue | Recommended Action |
|----------|------|-------|-----------|--------------------|
| 1 | [file] | XX | [issue] | [action] |
| 2 | [file] | XX | [issue] | [action] |
```

#### 关键词蚕食报告
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

#### 陈旧内容
```
### Stale Content
| Post | Last Updated | Days Stale | Priority | Refresh Effort |
|------|-------------|------------|----------|----------------|
| [file] | [date] | [N] | High/Med/Low | Light/Moderate/Heavy |
```

### 第 7 步：保存报告

将完整报告保存到项目根目录下的 `blog-audit-report.md`。

保存后，告知用户：
- 报告位置：`[project-root]/blog-audit-report.md`
- 调查结果摘要（文章总数、平均得分、严重问题数量）
- 建议先对得分最低的文章运行 `/blog analyze <file>`
- 建议对重点文章运行 `/blog geo <file>`，以优化 AI 引用效果

## 交叉参考

如需使用基于证据的审计提示词，执行超出本次全站健康检查范围的审计，请参阅 `/blog flow optimize`（可见性、CTR、schema、内容提取审计）和 `/blog flow win`（双界面评分卡、转化审计）。