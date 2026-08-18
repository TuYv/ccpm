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
---
# 博客内容蚕食——关键词重叠检测

检测多篇博客文章何时在竞争相同的搜索关键词。提供两种模式：
仅本地分析（默认）和使用 DataForSEO API 获取 SERP 级数据的模式。

## 两种模式

| 模式 | 标志 | 成本 | 数据来源 |
|------|------|------|-------------|
| 本地 | （默认） | 免费 | 通过 Grep/Read 分析文件内容 |
| API | `--api` | 约 $0.01/次调用 | DataForSEO Page Intersection + Ranked Keywords |

本地模式无需任何 API 密钥即可运行。API 模式需要 DataForSEO 凭据，
并将其设置为环境变量：`DATAFORSEO_LOGIN` 和 `DATAFORSEO_PASSWORD`。

## 本地模式工作流程

### 第 1 步：扫描博客文件

使用 Glob 查找目标目录中的所有内容文件：
- 匹配模式：`**/*.md`、`**/*.mdx`、`**/*.html`
- 跳过 `node_modules/`、`.git/`、`drafts/` 中的文件

### 第 2 步：提取主要关键词

对于每个文件，读取并从以下位置提取关键词信号：
- **Title 标签**或 H1 标题（权重最高）
- **H2 标题**（中等权重）
- **第一段**（辅助信号）
- Frontmatter 中的**元描述**（如果存在）

主要关键词提取方法：
1. 将 Title 和 H1 分词为一元、二元和三元短语
2. 根据每个短语在 Title + H2 + 第一段中的出现频率进行评分
3. 选择得分最高的 2-3 词短语作为主要关键词
4. 记录 H2 标题中的次要关键词

### 第 3 步：按相似度聚类

按照以下匹配规则对文章进行聚类（按优先级排序）：

1. **精确匹配**——2 篇或更多文章具有完全相同的主要关键词
2. **词干匹配**——具有相同的词根（例如，"optimize" 与 "optimization"）
3. **语义重叠**——Claude 判断两个关键词针对相同的
   搜索意图（例如，"best CRM software" 与 "top CRM tools 2026"）
4. **子集匹配**——一个关键词包含另一个关键词（例如，"email marketing"
   与 "email marketing for startups"）

### 第 4 步：评分并标记

对于每个包含 2 篇或更多文章的聚类，评估严重程度并生成建议。

### 第 5 步：输出报告

显示结果表格以及每个聚类的建议。

## API 模式工作流程（DataForSEO）

需要使用 `--api` 标志。使用 WebFetch 调用 DataForSEO 端点。

### 使用的端点

**Page Intersection**——查找多个 URL 均有排名的关键词：
```
POST https://api.dataforseo.com/v3/dataforseo_labs/google/page_intersection/live
Authorization: Basic <base64(login:password)>

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

**Ranked Keywords**——获取单个 URL 有排名的所有关键词：
```
POST https://api.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live

{
  "target": "https://example.com/post-a",
  "language_code": "en",
  "location_code": 2840
}
```

### API 分析步骤

1. 收集用户提供的所有已发布 URL（或从站点地图中获取）
2. 对每个 URL 运行 Ranked Keywords，以构建关键词画像
3. 对共享关键词聚类的 URL 对运行 Page Intersection
4. 使用下方公式计算严重程度
5. 输出包含搜索量和排名数据的增强报告

## 严重程度评分

根据重叠信号划分为四个严重程度级别：

| 级别 | 判定标准 | 处理紧迫性 |
|-------|----------|----------------|
| 严重 | 完全相同的关键词，且两个页面均排在前 20 名 | 立即处理 |
| 高 | 相同的关键词集群，其中一个页面的排名高于另一个 | 本周处理 |
| 中 | 相关关键词，且 SERP 部分重叠 | 本月处理 |
| 低 | 语义相似，但已确认搜索意图不同 | 监控 |

### 严重程度公式（API 模式）

```
severity_score = overlap_count x avg_search_volume x (1 / position_gap)
```

其中：
- `overlap_count` = 共同排名关键词的数量
- `avg_search_volume` = 共同关键词的月均搜索量
- `position_gap` = 平均排名位置之差的绝对值（最小为 1）

分数越高 = 关键词蚕食问题越紧迫。

### 严重程度启发式规则（本地模式）

没有 SERP 数据时，使用简化评分：
- **严重**：文章之间的主要关键词完全匹配
- **高**：主要关键词的词干匹配，或有 3 个以上共同的 H2 关键词
- **中**：主要关键词存在语义重叠
- **低**：仅存在子集匹配，或仅共享次要关键词

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

### 各集群详情

对于每个标记出的集群，提供：
- 两篇文章的标题和 URL
- 重叠关键词的完整列表（API 模式下包含搜索量）
- 哪篇文章更强（内容更全面、结构更合理）
- 具体建议及其理由

## 建议

针对每个关键词蚕食集群，可采取以下四种操作之一：

### MERGE
当两个页面的内容都较单薄，或以相近的深度覆盖相同的搜索意图时。
- 将两个页面中的最佳内容合并为一篇全面的文章
- 将较弱的 URL 通过 301 重定向至合并后的文章
- 保留所有指向任一 URL 的内部链接

### DIFFERENTIATE
当页面服务于不同的搜索意图，但目标关键词存在重叠时。
- 将较弱文章的主要关键词调整为相关的长尾关键词
- 更新标题、H1 和元描述，以体现新的内容重点
- 在两篇文章之间添加内部链接，以表明主题不同

### CANONICAL
当一篇文章显然是权威内容，而另一篇是质量较低的重复内容时。
- 在较弱页面上添加指向权威页面的 `rel="canonical"`
- 如果较弱页面没有提供任何独特价值，可考虑将其设为 noindex
- 从较弱页面链接至权威页面

### NO ACTION
当搜索意图确实不同，仅存在表层的关键词相似性时。
- 记录相关理由，以供未来审核
- 每季度监控排名，检查位置是否发生变化
- 如果任一文章的排名下降，则重新评估

## 错误处理

- **未找到博客文件**：如果目录中不包含任何 .md、.mdx 或 .html 文件，报告“在 [directory] 中未找到博客文件”，并建议检查路径
- **缺少 DataForSEO 凭据**：在 API 模式下，如果未配置凭据，则自动回退到本地模式并通知用户
- **API 速率限制**：DataForSEO 设有每分钟速率限制。如果收到 429 响应，请等待并重试一次。如果问题仍然存在，则对剩余 URL 切换到本地模式
- **WebFetch 失败**：如果来源 URL 无法访问，则跳过该 URL，并在报告中注明“无法验证 - 来源不可用”
- **仅包含单篇文章的目录**：如果只有一篇博客文章，报告“蚕食分析至少需要 2 篇文章”，然后正常退出