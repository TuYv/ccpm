---
name: blog-factcheck
description: >
  Verify statistics and claims in blog posts by fetching cited source URLs and
  checking if the claimed data actually appears on the page. Extracts all
  statistical claims (numbers, percentages, named sources), fetches each cited
  URL via WebFetch, and scores match confidence (exact match 1.0, paraphrase
  0.7-0.9, not found 0.0). Flags uncited claims as UNVERIFIED. Use when user
  says "fact check", "verify statistics", "check sources", "validate claims",
  "factcheck", "source verification".
user-invokable: true
argument-hint: "[file]"
---
# 博客事实核查

验证博客文章中的统计数据、声明和来源归属。纯 Claude 管线，不依赖外部 NLP。

## 工作流程

### 第 1 步：阅读博客文章

阅读目标文件，并识别所有包含数据声明的章节。

### 第 2 步：提取统计声明

扫描全文，找出每一条包含数字、百分比、金额或具名来源的声明。构建声明列表，并包含以下字段：

| 字段 | 描述 |
|-------|-------------|
| claim_text | 包含统计数据的确切句子或短语 |
| value | 数值（例如，"42%"、"$1.2M"、"3x"） |
| attribution | 具名来源（如有）（例如，"HubSpot"、"Gartner 2025"） |
| url | 引用的 URL（如有）（来自 Markdown 链接或括号中的引用） |
| location | 声明所在的标题或行号 |

### 第 3 步：验证有引用来源的声明

对于每条包含 URL 的声明：

1. 通过 WebFetch 获取来源页面
2. 在返回的内容中搜索具体数值
3. 如果找到完全一致的数值，检查其上下文是否与声明主题相符
4. 分配置信度分数（参见下方的验证评分）

按顺序处理各项声明，以避免触发来源网站的速率限制。

### 第 4 步：标记无引用来源的声明

对于没有 URL 的声明：

- 将状态标记为 UNVERIFIED
- 建议用户可用于查找来源的搜索查询
- 如果归属信息中提及了特定组织，则建议搜索其域名

### 第 5 步：生成验证报告

输出完整的结果表、汇总统计数据和建议采取的措施。

## 声明提取模式

识别符合以下结构的声明：

**引用来源完整**（最高优先级）：
- `[Number]% [claim] ([Source], [Year])` - 括号引用
- `[claim] [Number]% ... [markdown link to source]` - 内联链接
- `According to [Source], [Number]...` - 以来源归属开头

**无引用来源的统计数据**（标记为需要补充来源）：
- `[Number]% of [noun phrase]` - 独立的百分比
- `[Number]x more/less/higher/lower` - 倍数声明
- `$[Number] [claim]` - 无来源归属的金额数字

**弱信号**（提取前检查上下文）：
- `studies show`、`research indicates`、`data suggests` + 附近的数字
- `survey found`、`report reveals`、`analysis shows` + 附近的数字
- 单独出现的整数概数（例如，"millions of users"）- 除非数值具体，否则跳过

## 验证评分

| 分数 | 状态 | 标准 |
|-------|--------|----------|
| 1.0 | VERIFIED | 在引用页面的匹配上下文中找到完全一致的数字 |
| 0.7-0.9 | PARAPHRASE | 找到相似数据，但措辞、取整方式或时间范围不同 |
| 0.3-0.6 | WEAK | 来源页面存在且涵盖该主题，但具体统计数据不可见 |
| 0.0 | NOT FOUND | 引用页面中完全不包含所声明的数据 |
| N/A | UNVERIFIED | 该声明未提供来源 URL |

**评分指南**：
- 声明为 "43%"，而来源表述为 "nearly half"，评分为 0.8
- 声明引用 "2024" 年的数据，而来源只有 "2023" 年的数据，评分为 0.7
- 声明引用的是主页，而统计数据位于子页面上，评分为 0.3
- URL 返回 404 或无法访问，评分为 0.0

## 输出格式

### 验证报告：[文章标题]

**文件**：[path]
**发现的声明**：[总数]
**已验证**：[数量] | **转述**：[数量] | **证据薄弱**：[数量] | **未找到**：[数量] | **未验证**：[数量]

| # | 声明 | 来源 URL | 分数 | 状态 | 备注 |
|---|-------|-----------|-------|--------|-------|
| 1 | “73% 的营销人员……” | https://example.com/report | 1.0 | 已验证 | 在第 3 节中找到完全匹配的内容 |
| 2 | “ROI 提升 5 倍” | https://example.com/study | 0.8 | 转述 | 来源称“接近 5 倍” |
| 3 | “60% 的人更喜欢视频” | （无） | N/A | 未验证 | 尝试：“2025 年视频偏好统计数据” |

### 建议的操作
- [列出需要来源 URL 的声明]
- [列出分数较低或未找到、需要替换来源的声明]
- [列出来源数据可能已过时的声明]

## 集成

此 skill 可由 `blog-analyze` 调用，作为可选的深度验证步骤。
从分析器调用时，仅在分析报告中标记得分低于 0.7 的声明。

独立使用方式：`/blog factcheck path/to/post.md`

## 交叉引用

claude-blog 继承了 FLOW 的证据三要素（正文中的年份锚点、包含发布者和标题的行内引用，以及带检索日期的 URL）。完整框架请参阅 `skills/blog-flow/references/flow-framework.md` 和 `/blog flow`。

## 局限性

- **付费墙内容**：WebFetch 无法访问登录墙后的内容。这些内容的评分为 WEAK (0.5)，并附上关于检测到付费墙的说明。
- **动态页面**：通过 JavaScript 渲染的内容可能无法由 WebFetch 获取。
  如果页面返回的内容很少，请在状态中注明这一点。
- **PDF 来源**：WebFetch 可能无法可靠地提取 PDF 文本。请标记 PDF URL 以供
  人工验证。
- **已归档页面**：如果某个 URL 返回 404，建议检查 web.archive.org。
- **速率限制**：每次运行最多处理 10 个 URL，以免给
  来源服务器造成过大压力。如果一篇文章引用的 URL 超过 10 个，请验证前 10 个，并将
  其余 URL 列为 SKIPPED。