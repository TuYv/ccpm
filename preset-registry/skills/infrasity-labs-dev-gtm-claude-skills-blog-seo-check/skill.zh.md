---
name: blog-seo-check
description: >
  Post-writing SEO validation with pass/fail checklist covering title tag length
  and keyword placement, meta description quality, heading hierarchy and keyword
  density, internal/external link audit with anchor text analysis, canonical URL
  verification, Open Graph meta tags (og:title, og:description, og:image), Twitter
  Card validation, URL structure optimization, and image alt text presence. Produces
  prioritized fix list with specific recommendations. Use when user says "seo check",
  "check seo", "validate seo", "blog seo", "seo validation", "on-page seo",
  "title tag check", "meta description check", "heading check", "link audit".
user-invokable: true
argument-hint: "<file-path>"
---
# 博客 SEO 检查：写作后验证

针对已完成的博客文章运行全面的页面 SEO 验证，并生成通过/失败检查清单，同时为每项失败提供具体的修复建议。专为写作完成后运行而设计，可在发布前发现问题。

## 工作流程

### 步骤 1：读取内容

读取目标文件并提取：
- **Frontmatter** - title、description、date、lastUpdated、author、tags、canonical、og:image、slug/URL
- **标题结构** - 包含完整文本的 H1、H2、H3 层级结构
- **链接** - 包含锚文本的所有内部和外部链接
- **Meta 标签** - OG 标签、Twitter Card 标签、canonical URL
- **正文内容** - 用于关键词和结构分析的完整文本

如果用户提供的是 URL 而不是文件路径，请使用 WebFetch 获取页面并提取相关元素。

### 步骤 2：标题标签验证

| 检查项 | 通过标准 |
|-------|---------------|
| 字符数 | 40-60 个字符（不会在 SERP 中被截断） |
| 关键词位置 | 主关键词位于标题的前半部分 |
| 强效词 | 至少包含一个强效词（例如 Guide、Best、How、Why、Essential、Proven、Complete） |
| 截断风险 | 在 60 个字符处截断时不会丢失关键信息 |
| 独特性 | 不宽泛笼统——与内容明确相关 |

### 步骤 3：Meta 描述

| 检查项 | 通过标准 |
|-------|---------------|
| 字符数 | 150-160 个字符 |
| 包含统计数据 | 至少包含一个具体数字或数据点 |
| 价值主张 | 以明确的读者收益或价值主张结尾 |
| 包含关键词 | 主关键词自然出现（无堆砌） |
| 无关键词堆砌 | 关键词最多出现一次 |
| 行动号召 | 暗示采取行动（learn、discover、find out、see） |

### 步骤 4：标题层级

| 检查项 | 通过标准 |
|-------|---------------|
| 单个 H1 | 恰好有一个 H1 标签（标题） |
| 不跳级 | H1 -> H2 -> H3，绝不出现 H1 -> H3 或 H2 -> H4 |
| 标题中包含关键词 | 主关键词自然出现在 2-3 个标题中，不生硬植入 |
| 问句格式 | 60-70% 的 H2 标题为问句 |
| H2 数量 | 标准博客文章包含 6-8 个 H2 章节 |
| 标题长度 | 每个标题少于 70 个字符 |

### 步骤 5：内部链接

| 检查项 | 通过标准 |
|-------|---------------|
| 链接数量 | 每篇文章包含 3-10 个内部链接 |
| 锚文本 | 具有描述性（不是“click here”或“read more”） |
| 双向链接 | 检查被链接页面是否也反向链接（如果没有则标记） |
| 非孤立状态 | 文章至少链接到站内其他 3 个页面 |
| 链接分布 | 链接分散在整篇文章中，而不是集中在一起 |
| 无自链接 | 文章不链接到自身 |

使用 Grep 和 Glob 扫描项目中现有的博客内容，并尽可能验证双向链接。

### 步骤 5.5：链接去重

| 检查项 | 通过标准 |
|-------|---------------|
| 无重复 URL | 每个 URL 在正文内容中最多出现一次 |
| 保留最佳实例 | 如果存在重复项，保留锚文本描述性最强的实例 |
| 导航链接除外 | 页眉/页脚导航链接不计入正文去重 |
| 片段规范化 | 带有不同 #fragments 的 URL 视为同一 URL |

对于发现的每个重复项：
1. 规范化 URL（移除末尾斜杠、查询参数和片段标识符）
2. 根据锚文本的描述性为每个实例评分（关键词丰富 > 宽泛笼统）
3. 建议保留得分最高的实例，移除其他实例
4. 每个重复项从 SEO 优化得分中扣除 1 分

Google 对每个页面上的每个 URL 会记录 1-2 个锚文本（Zyppy 2023）。最佳做法：在正文内容中仅链接到
同一 URL 一次；每 2,000 字设置 5-10 个内部链接；每个页面的链接总数最多约为 50 个。

### 步骤 6：外部链接

| 检查项 | 通过标准 |
|-------|---------------|
| 来源层级 | 仅链接到第 1-3 层级的来源（权威来源，而非 SEO 博客） |
| 失效链接 | 使用 WebFetch 验证主要外部链接是否可以访问 |
| Rel 属性 | 外部链接具有适当的 rel 属性（赞助内容/UGC 使用 nofollow） |
| 链接数量 | 至少包含 3 个指向权威来源的外部链接 |
| 无竞争对手链接 | 不在非必要情况下链接到直接竞争对手 |

### FLOW 证据三元组（引用）

对于文章中的每项公开统计数据，验证以下三个组成部分：

- 年份锚点出现在统计数据之前的正文中（“在 2026 年，”或“截至 2026 年第一季度，”），而不是隐藏在括号中。
- 行内引用同时注明发布者和文档标题（或报告名称）。
- 文章底部的来源区块包含每个引用来源的 URL，以及 `retrieved YYYY-MM-DD`。

未能满足以上任一项的文章必须删除无法验证的声明，或将其替换为经过验证的替代内容。参见 `skills/blog/references/flow-alignment.md`。如需通过一次性提示词驱动的检查，请参见 `/blog flow optimize`。

### 步骤 7：规范 URL

| 检查项 | 通过标准 |
|-------|---------------|
| 存在 | 在 frontmatter 或 meta 标签中定义了规范 URL |
| 格式正确 | 完整的绝对 URL（https://domain.com/path） |
| 末尾斜杠 | 与网站约定保持一致（不混用末尾斜杠） |
| 自引用 | 规范 URL 指向页面自身（除非有意跨域） |

### 步骤 8：OG Meta 标签

| 检查项 | 通过标准 |
|-------|---------------|
| og:title | 存在，与 title 标签一致或形成补充 |
| og:description | 存在，150-160 个字符，适合社交分享且具有吸引力 |
| og:image | 存在，最小尺寸为 1200x630，使用绝对 URL |
| og:type | 博客文章设置为 "article" |
| og:url | 存在，与规范 URL 一致 |
| og:site_name | 存在，与网站/品牌名称一致 |

### 步骤 9：Twitter Card

| 检查项 | 通过标准 |
|-------|---------------|
| twitter:card | 博客文章设置为 "summary_large_image" |
| twitter:title | 存在，少于 70 个字符 |
| twitter:description | 存在，少于 200 个字符 |
| twitter:image | 存在，与 og:image 相同或相似 |
| twitter:site | 如果网站拥有 Twitter/X 账号，则该项存在 |

### 步骤 10：URL 结构

| 检查项 | 通过标准 |
|-------|---------------|
| 长度 | 简短——路径部分少于 75 个字符 |
| 包含关键词 | URL slug 中包含主要关键词或其近似变体 |
| 无日期 | URL 不包含 /2025/ 或 /2026/ 日期路径段 |
| 无特殊字符 | 仅使用小写字母、数字和连字符 |
| 小写 | 整个 URL 路径均为小写 |
| 无停用词 | slug 中尽量少用 "the"、"a"、"and"、"of" |
| 无文件扩展名 | URL 中不含 .html 或 .php（简洁 URL） |

### 步骤 11：生成报告

按以下格式输出一份全面的 SEO 验证报告：

```
## SEO Validation Report: [Title]

**File**: [path or URL]
**Date**: [check date]
**Overall**: [X/Y checks passed] - [PASS/NEEDS WORK/FAIL]

### Results

| # | Check | Status | Details | Fix |
|---|-------|--------|---------|-----|
| 1 | Title length | PASS | 52 chars | - |
| 2 | Title keyword | PASS | "keyword" in first half | - |
| 3 | Title power word | FAIL | No power word found | Add "Guide", "Essential", or "Complete" |
| 4 | Meta description length | PASS | 155 chars | - |
| 5 | Meta description stat | FAIL | No number found | Add a key statistic from the post |
| ... | ... | ... | ... | ... |

### Summary

**Passed**: [N] checks
**Failed**: [N] checks

### Priority Fixes
1. [Most impactful fix - what to change and where]
2. [Second most impactful fix]
3. [Third most impactful fix]

### Notes
- [Any observations about overall SEO health]
- [Suggestions for improvement beyond the checklist]
```

状态值：
- **PASS** - 符合标准
- **FAIL** - 不符合标准，并提供修复方法
- **WARN** - 部分符合标准或属于边缘情况，并提供建议
- **N/A** - 不适用（例如，如果网站没有 X 账号，则无 Twitter Card 标签）

### 可选：实时性能检查（blog-google）

如果文章有已发布的 URL，并且 blog-google 凭据可用：

1. 检查凭据：`python3 skills/blog-google/scripts/run.py google_auth --check --json`
2. 如果为 Tier 0+，运行 PageSpeed：`python3 skills/blog-google/scripts/run.py pagespeed_check <url> --json`
3. 附加到报告中：
   - Lighthouse 性能、无障碍、最佳实践和 SEO 评分
   - CWV 现场数据（LCP、INP、CLS）及其红绿灯评级
   - 预计节省量最高的 3 个优化机会
4. 如果凭据不可用或 URL 尚未发布，则静默回退。