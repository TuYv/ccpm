---
name: blog-cannibalization
description: >
  Detect keyword cannibalization across blog posts by extracting primary keywords
  from titles and headings, clustering semantically similar targets, and flagging
  posts competing for the same search intent. Supports local-only mode (grep-based)
  and DataForSEO API mode (Page Intersection endpoint at ~$0.01/call). Outputs
  severity-scored report with merge or differentiate recommendations. Use when
  user says "cannibalization", "keyword overlap", "competing pages", "duplicate
  keywords", "cannibalize".
user-invokable: true
argument-hint: "[directory] [--api]"
license: MIT
---
# 博客内容蚕食 - 关键词重叠检测

检测多篇博客文章何时在竞争相同的搜索关键词。支持两种模式：
仅本地分析（默认）和使用 DataForSEO API 获取 SERP 级数据的模式。

## 两种模式

| 模式 | 标志 | 成本 | 数据源 |
|------|------|------|-------------|
| 本地 | （默认） | 免费 | 通过 Grep/Read 分析文件内容 |
| API | `--api` | 约 $0.01/次调用 | DataForSEO Page Intersection + Ranked Keywords |

本地模式无需任何 API 密钥即可运行。API 模式需要将 DataForSEO 凭据
设置为环境变量：`DATAFORSEO_LOGIN` 和 `DATAFORSEO_PASSWORD`。

## 本地模式工作流程

### 第 1 步：扫描博客文件

使用 Glob 查找目标目录中的所有内容文件：
- 模式：`**/*.md`、`**/*.mdx`、`**/*.html`
- 跳过 `node_modules/`、`.git/`、`drafts/` 中的文件

### 第 2 步：提取主要关键词

对于每个文件，读取并从以下位置提取关键词信号：
- **Title 标签**或 H1 标题（权重最高）
- **H2 标题**（中等权重）
- **第一段**（辅助信号）
- Frontmatter 中的**元描述**（如果存在）

主要关键词提取方法：
1. 将标题、H1、H2、元描述和第一段分词为 1-gram、
   2-gram 和 3-gram 短语。
2. 以确定性方式进行规范化：转换为小写、移除与区域设置相匹配的停用词、
   统一进行词形还原或词干提取、保留产品名称，并保留
   "best"、"pricing"、"vs"、"review"、"template" 和年份等意图修饰词。
3. 分别对各部分评分：标题/H1 权重最高，元描述和 H2 权重中等，
   第一段作为辅助。
4. 选择得分最高的 2-3 词短语作为主要关键词，并记录
   H2 标题中的次要关键词。

### 第 3 步：按相似度聚类

按照以下匹配规则（按优先级排序）将文章分组为多个聚类：

1. **完全匹配** - 2 篇或更多文章具有相同的主要关键词
2. **词干匹配** - 具有相同的词根（例如，"optimize" 与 "optimization"）
3. **语义重叠** - 分配明确的意图标签，例如信息型、
   商业型、交易型、比较型或故障排除型。包含置信度
   和一句话的理由，或者使用具有明确阈值记录的嵌入工作流程。
4. **子集匹配** - 一个关键词包含另一个关键词（例如，"email marketing"
   与 "email marketing for startups"）

### 第 4 步：评分并标记

对于每个包含 2 篇或更多文章的聚类，评估严重程度并生成建议。

### 第 5 步：输出报告

显示结果表格以及每个聚类的建议。

## API 模式工作流程（DataForSEO）

需要使用 `--api` 标志和专用的本地 CLI 包装器，该包装器从环境中读取
`DATAFORSEO_LOGIN` 和 `DATAFORSEO_PASSWORD` 并输出
JSON。不要使用 WebFetch 执行 DataForSEO POST 调用，且绝不能在提示词或报告中暴露 Basic auth
标头、登录名、密码或编码后的凭据。如果项目中不存在
包装器，则报告 `SKIPPED: DataForSEO wrapper unavailable`
并运行本地模式。

### 使用的端点

**Page Intersection** - 查找多个 URL 均有排名的关键词：
```
POST https://api.dataforseo.com/v3/dataforseo_labs/google/page_intersection/live

{
  "pages": {
    "1": "https://example.com/post-a",
    "2": "https://example.com/post-b"
  },
  "language_code": "en",
  "location_code": 2840
}
```
成本：每次调用约 $0.01。返回重叠关键词及其排名、搜索量和 CPC。

**排名关键词** - 获取单个 URL 排名所覆盖的所有关键词：
```
POST https://api.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live

{
  "target": "https://example.com/post-a",
  "language_code": "en",
  "location_code": 2840
}
```

封装器从环境变量中获取 DataForSEO 身份验证标头，并且绝不会
将其打印出来。

### API 分析步骤

1. 收集用户提供的所有已发布 URL（或从站点地图中收集）
2. 对每个 URL 运行排名关键词分析，以构建关键词画像
3. 对共享关键词聚类的 URL 对运行页面交集分析
4. 使用以下公式计算严重程度
5. 输出包含搜索量和排名位置数据的增强报告

## 严重程度评分

根据重叠信号划分为四个严重程度级别：

| 级别 | 标准 | 处理紧迫性 |
|-------|----------|----------------|
| 严重 | 完全相同的关键词，且两个页面均排在前 20 名 | 立即处理 |
| 高 | 相同的关键词聚类，其中一个页面的排名高于另一个页面 | 本周处理 |
| 中 | 相关关键词，且部分搜索结果页重叠 | 本月处理 |
| 低 | 语义相似，但经确认搜索意图不同 | 监控 |

### 严重程度公式（API 模式）

```
severity_score = overlap_count x avg_search_volume x (1 / position_gap)
```

其中：
- `overlap_count` = 共同排名关键词的数量
- `avg_search_volume` = 共同关键词的平均月搜索量
- `position_gap` = 平均排名位置之差的绝对值（最小为 1）

分数越高 = 关键词蚕食问题越紧迫。

### 严重程度启发式规则（本地模式）

在没有搜索结果页数据的情况下，使用简化评分：
- **严重**：文章之间的主要关键词完全匹配
- **高**：主要关键词的词干匹配，或有 3 个以上共同的 H2 关键词
- **中**：主要关键词存在语义重叠
- **低**：仅存在子集匹配，或共享次要关键词

## 输出格式

### 汇总表

```
| Post A | Post B | Shared Keywords | Severity | Recommendation |
|--------|--------|-----------------|----------|----------------|
| /best-crm-tools | /top-crm-software | best crm, crm tools, crm software | Critical | MERGE |
| /email-tips | /email-marketing-guide | email marketing | High | DIFFERENTIATE |
| /seo-basics | /seo-for-beginners | seo basics, beginner seo | Critical | CANONICAL |
| /react-hooks | /react-state-mgmt | react, state | Low | NO ACTION |
```

### 各聚类详情

对于每个被标记的聚类，提供：
- 两篇文章的标题和 URL
- 重叠关键词的完整列表（API 模式下包含搜索量）
- 哪篇文章更强（内容更全面、结构更好）
- 具体建议及其理由

## 建议

针对每个关键词蚕食聚类，有四种可采取的操作：

### MERGE
当两个页面内容都较单薄，或以相近的深度覆盖相同的搜索意图时。
- 将两个页面中最优质的内容合并为一篇全面的文章
- 使用 301 将较弱的 URL 重定向到合并后的文章
- 保留所有指向任一 URL 的内部链接

### DIFFERENTIATE
当页面服务于不同的搜索意图，但关键词定位存在重叠时。
- 将较弱文章的主要关键词调整为相关的长尾关键词
- 更新标题、H1 和元描述，以体现新的内容重点
- 在两篇文章之间添加内部链接，以表明它们讨论的是不同主题

### 规范链接
当一个页面明显是权威页面，而另一个页面是内容较弱的重复页面时。
- 在较弱的页面上添加指向权威页面的 `rel="canonical"`
- 不要随意同时使用规范链接和 noindex。只有在确实希望从搜索结果中移除页面时才使用 noindex
- 从较弱的页面链接到权威页面

### NOINDEX
当一个页面应从搜索结果中移除，但仍需保留供用户访问时。
- 确认该页面不存在有意义的独特搜索需求或商业价值
- 在确认 noindex 指令已被识别之前，保持页面可抓取
- 不要将其作为解决重复内容问题的默认方案

### 不采取操作
当两个页面的意图确实不同，只是表层关键词相似时。
- 记录判断依据，以供后续审核参考
- 每季度监控排名，查看是否有任何位置变化
- 如果任一文章排名下降，则重新评估

## 错误处理

- **未找到博客文件**：如果目录中不包含 .md、.mdx 或 .html 文件，则报告“在 [directory] 中未找到博客文件”，并建议检查路径
- **缺少 DataForSEO 凭据**：在 API 模式下，如果未配置凭据，则自动回退到本地模式并通知用户
- **API 速率限制**：DataForSEO 设有每分钟速率限制。如果收到 429 响应，请等待并重试一次。如果问题仍然存在，则对剩余 URL 切换到本地模式
- **API 请求失败**：如果 DataForSEO 返回错误，则在速率限制范围内重试一次。如果仍然失败，则对剩余 URL 切换到本地模式，并报告失败的端点，但不包含凭据
- **仅含单篇文章的目录**：如果仅存在一篇博客文章，则报告“内容蚕食分析至少需要 2 篇文章”，并正常退出