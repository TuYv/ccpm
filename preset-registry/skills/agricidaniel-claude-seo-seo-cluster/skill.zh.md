---
name: seo-cluster
description: >
  SERP-based semantic topic clustering for content architecture planning. Groups
  keywords by actual Google SERP overlap (not text similarity), designs hub-and-spoke
  content clusters with internal link matrices, and generates interactive
  visualizations. Optionally executes content creation if claude-blog is installed.
  Use when user says "topic cluster", "content cluster", "semantic clustering",
  "pillar page", "hub and spoke", "content architecture", "keyword grouping",
  or "cluster plan".
user-invocable: true
argument-hint: "<seed-keyword or url>"
license: MIT
metadata:
  author: AgriciDaniel
  original_author: "Lutfiya Miller (Pro Hub Challenge Winner)"
  version: "2.2.4"
  category: seo
---
# 语义主题聚类

基于 SERP 重叠度的关键词聚类，用于构建内容架构。根据 Google 实际的排名方式（共享的前 10 条搜索结果）对关键词进行分组，而不是依据文本相似度。设计中心辐射型内容集群及内部链接矩阵，并生成交互式集群地图可视化。

**脚本：** 位于插件根目录下的 `scripts/` 目录中。

---

## 快速参考

| 命令 | 功能 |
|---------|-------------|
| `/seo cluster plan <seed-keyword>` | 完整规划工作流：扩展、聚类、架构设计、可视化 |
| `/seo cluster plan --from strategy` | 从现有的 `/seo plan` 输出中导入 |
| `/seo cluster execute` | 执行计划：通过 claude-blog 创建内容或输出简报 |
| `/seo cluster map` | 重新生成交互式集群可视化 |

---

## 规划工作流

### 第 1 步：种子关键词扩展

使用 WebSearch 将种子关键词扩展为 30-50 个变体：

1. **相关搜索**：搜索种子关键词，提取“相关搜索”和“其他用户还搜索了”
2. **其他用户还问了（PAA）**：从 SERP 结果中提取所有 PAA 问题
3. **长尾修饰词**：附加常见修饰词："best"、"how to"、"vs"、"for beginners"、"tools"、"examples"、"guide"、"template"、"mistakes"、"checklist"
4. **问题挖掘**：生成 who/what/when/where/why/how 变体
5. **意图修饰词**：添加商业修饰词："pricing"、"review"、"alternative"、"comparison"、"free"、"top"

**去重：** 对变体进行规范化处理（转换为小写、移除冠词），删除完全重复的内容。目标：获得 30-50 个唯一关键词变体。如果少于 30 个，则以排名靠前的 PAA 问题作为种子，执行第二轮扩展。

### 第 2 步：SERP 重叠聚类

这是核心差异化功能。加载 `references/serp-overlap-methodology.md` 以获取完整算法。

**流程：**
1. 根据初步判断的意图对关键词进行分组（减少两两比较）
2. 对同一组内的每一对候选关键词，使用 WebSearch 分别进行搜索
3. 统计前 10 条自然搜索结果中的共享 URL 数量（忽略广告、精选摘要和 PAA）
4. 应用以下阈值：

| 共享结果数 | 关系 | 操作 |
|---------------|-------------|--------|
| 7-10 | 同一篇文章 | 合并到单个目标页面中 |
| 4-6 | 同一集群 | 归入同一个辐射内容集群 |
| 2-3 | 相互链接 | 放入相邻集群，并添加交叉链接 |
| 0-1 | 分离 | 分配到不同集群或排除 |

**优化：** 对于 40 个关键词，完整的两两比较需要进行 780 次比较。改为：
- 先按意图分组（4 组，每组约 10 个 = 4 x 45 = 180 次比较）
- 仅交叉检查位于分组边界的关键词
- 如果一对关键词都是同一个核心词的长尾变体，则跳过比较（假定属于同一集群）

**DataForSEO 集成：** 如果 DataForSEO MCP 可用，则使用 `serp_organic_live_advanced` 代替 WebSearch 获取 SERP 数据。每批处理前运行 `claude-seo run dataforseo_costs.py check serp_organic_live_advanced --count N`。如果 `"status": "needs_approval"`，则显示成本估算并询问用户。如果 `"status": "blocked"`，则回退到 WebSearch。

### 第 3 步：意图分类

将每个关键词归入以下四种意图类别之一：

| 意图 | 信号 | 是否纳入主题集群？ |
|--------|---------|---------------------|
| 信息型 | how, what, why, guide, tutorial, learn | 是 |
| 商业型 | best, top, review, comparison, vs, alternative | 是 |
| 交易型 | buy, price, discount, coupon, order, sign up | 是 |
| 导航型 | 品牌名称、特定产品名称、login | 否（排除） |

从主题集群中移除导航型关键词。标记临界情况以供
人工审核。关键词可能具有混合意图（例如，"best CRM software" 同时具有
商业型和信息型意图）——按主导意图进行分类。

### 第 4 步：中心辐射式架构

加载 `references/hub-spoke-architecture.md` 以获取完整规范。

**设计主题集群结构：**

1. **选择支柱关键词**：搜索量最高、意图最广泛、与其他关键词的 SERP 重叠度最高
2. **将辐射内容归入主题集群**：每个主题集群代表一个子主题领域（每个支柱包含 2-5 个主题集群）
3. **将文章分配到主题集群**：每个主题集群包含 2-4 篇辐射文章
4. **为每篇文章选择模板**：根据意图分类：

| 意图模式 | 模板选项 |
|---------------|-----------------|
| 信息型（宽泛） | ultimate-guide |
| 信息型（方法） | how-to |
| 信息型（列表） | listicle |
| 信息型（概念） | explainer |
| 商业型（比较） | comparison |
| 商业型（评估） | review |
| 商业型（排名） | best-of |
| 交易型 | landing-page |

5. **设置字数目标：**
   - 支柱页面：2500-4000 字
   - 辐射文章：1200-1800 字

6. **关键词蚕食检查**：任意两篇文章不得使用相同的主要关键词。如果 SERP
   重叠度为 7+，则将这些关键词合并到一篇文章中，并同时以它们为目标关键词。

### 第 5 步：内部链接矩阵

设计双向链接结构：

| 链接类型 | 方向 | 要求 |
|-----------|-----------|-------------|
| 辐射文章到支柱页面 | spoke -> pillar | 强制（每篇辐射文章） |
| 支柱页面到辐射文章 | pillar -> spoke | 强制（每篇辐射文章） |
| 辐射文章到辐射文章（同一主题集群内） | spoke <-> spoke | 每篇文章 2-3 个链接 |
| 跨主题集群 | spoke -> spoke (other cluster) | 每篇文章 0-1 个链接 |

**规则：**
- 每篇文章必须至少有 3 个入站内部链接
- 不得存在孤立页面（从支柱页面出发，2 次点击内可访问每篇文章）
- 锚文本必须使用目标关键词或其近似变体（不得使用 "click here"）
- 链接位置：应位于正文内容中，而不能仅位于导航栏或侧边栏中

以 JSON 邻接表的形式生成链接矩阵：
```json
{
  "links": [
    { "from": "pillar", "to": "cluster-0-post-0", "type": "mandatory", "anchor": "keyword" },
    { "from": "cluster-0-post-0", "to": "pillar", "type": "mandatory", "anchor": "keyword" }
  ]
}
```

### 第 6 步：交互式主题集群地图

使用 `templates/cluster-map.html` 中的模板生成 `cluster-map.html`。

1. 读取模板文件
2. 根据主题集群规划构建 `CLUSTER_DATA` JSON 对象：
   ```javascript
   {
     pillar: { title, keyword, volume, template, wordCount, url },
     clusters: [{ name, color, posts: [{ title, keyword, volume, template, wordCount, url, status }] }],
     links: [{ from, to, type }],
     meta: { totalPosts, totalClusters, totalLinks, estimatedWords }
   }
   ```
3. 将模板中的 `CLUSTER_DATA` 占位符替换为实际 JSON
4. 将完成的 HTML 文件写入输出目录
5. 告知用户："在浏览器中打开 `cluster-map.html`，以探索交互式主题集群地图。"

---

## 策略导入

使用 `--from strategy` 调用时：

1. 在当前目录中查找最近一次 `/seo plan` 的输出（搜索匹配
   `*SEO*Plan*`、`*strategy*`、`*content-strategy*` 的文件）
2. 解析 Markdown 表格中的以下内容：关键词、页面类型、内容支柱、URL 结构
3. 验证提取的数据：检查重复项、缺失的关键词、不完整的条目
4. 使用 SERP 数据进行丰富：对提取的关键词运行 SERP 重叠分析
5. 使用导入的关键词作为起始集合构建集群计划（跳过步骤 1）

如果未找到策略文件，则提示用户：“当前目录中未找到现有的 SEO 计划。
请先运行 `/seo plan`，或提供一个种子关键词以进行全新的集群规划。”

---

## 执行工作流

调用 `/seo cluster execute` 时：

### 检查 claude-blog

```
Test: Does ~/.claude/skills/blog/SKILL.md exist?
```

**如果已安装 claude-blog：**

1. 加载 `references/execution-workflow.md` 以获取完整算法
2. 从当前目录读取 `cluster-plan.json`
3. 检查恢复状态：扫描输出目录中已完成撰写的文章
4. 按优先级顺序执行：先处理支柱文章，再按搜索量处理卫星文章（从高到低）
5. 对于每篇文章，调用 `blog-write` Skill，并提供集群上下文：
   - 集群角色（支柱文章或卫星文章）
   - 在集群中的位置（集群索引、文章索引）
   - 目标关键词和次要关键词
   - 模板类型和目标字数
   - 要包含的内部链接（附锚文本）
   - 将从后续文章接收的链接（占位符标记）
6. 每篇文章撰写完成后，扫描之前文章中的反向链接占位符，
   并注入新文章的 URL
7. 所有文章撰写完成后，生成集群评分卡

**如果未安装 claude-blog：**

1. 为集群计划中的每篇文章生成详细的内容简报
2. 每份简报包括：
   - 标题和元描述
   - 主要关键词和次要关键词
   - 模板类型和建议结构（H2/H3 大纲）
   - 目标字数
   - 要包含的内部链接（附锚文本）
   - 需要涵盖的要点
   - 需要与之形成差异化的竞品页面
3. 将简报作为单独的 Markdown 文件写入 `cluster-briefs/` 目录
4. 告知用户：“安装 [claude-blog](https://github.com/AgriciDaniel/claude-blog)
   即可自动创建内容。简报已保存至 `cluster-briefs/`。”

---

## 集群评分卡

执行后的质量报告。在 `/seo cluster execute` 完成后自动运行，或通过分析输出目录
按需运行。

| 指标 | 目标 | 衡量方式 |
|--------|--------|-------------|
| 覆盖率 | 100% | 已撰写文章数 / 计划文章数 |
| 链接密度 | 每篇 3 个以上 | 统计每篇文章的内部链接数 |
| 孤立页面 | 0 | 入站链接少于 1 个的文章 |
| 关键词蚕食 | 0 个冲突 | 检查是否存在重复的主要关键词 |
| 图片数量 | 每篇 1 张以上 | 至少包含一张图片的文章 |
| 支柱链接 | 100% | 所有卫星文章均链接到支柱文章，反之亦然 |
| 交叉链接 | 80% 以上 | 已实施的推荐卫星文章间链接 |
| 内容缺口 | 0 | 被跳过或未完成的计划文章 |

---

## 映射图重新生成

调用 `/seo cluster map` 时：

1. 从当前目录读取 `cluster-plan.json`
2. 扫描输出目录并更新文章状态（计划中与已完成）
3. 使用更新后的状态重新生成 `cluster-map.html`
4. 报告：已完成与计划中的文章数量、链接完成百分比

---

## 输出文件

所有输出均写入当前工作目录：

| 文件 | 描述 |
|------|-------------|
| `cluster-plan.json` | 机器可读的主题集群计划（完整数据） |
| `cluster-plan.md` | 便于阅读的主题集群计划摘要 |
| `cluster-map.html` | 交互式 SVG 可视化图 |
| `cluster-briefs/` | 内容简报（如果没有 claude-blog） |
| `cluster-scorecard.md` | 执行后的质量报告 |

---

## 跨 Skill 集成

| Skill | 关系 |
|-------|-------------|
| `seo-plan` | 导入来源：策略导入功能会读取 seo-plan 输出 |
| `seo-content` | 质量检查：对生成的内容进行 E-E-A-T 验证 |
| `seo-schema` | Schema 标记：用于主题集群页面的 Article、BreadcrumbList、ItemList |
| `seo-dataforseo` | 数据源：当 DataForSEO MCP 可用时获取 SERP 数据 |
| `seo-google` | 报告：生成主题集群计划和评分卡的 PDF 报告 |

主题集群规划或执行完成后，询问：
“要生成 PDF 报告吗？使用 `/seo google report`”

---

## 错误处理

| 错误 | 原因 | 解决方案 |
|-------|-------|------------|
| "No seed keyword provided" | 缺少参数 | 提示用户提供种子关键词或 URL |
| "Insufficient keyword variants" | 扩展后得到的关键词少于 15 个 | 使用 PAA 问题执行第二轮扩展 |
| "SERP data unavailable" | WebSearch 和 DataForSEO 均失败 | 30 秒后重试；如果问题持续存在，则使用仅基于意图的聚类并发出警告 |
| "No strategy file found" | 使用了 `--from strategy`，但不存在计划 | 提示用户先运行 `/seo plan` |
| "cluster-plan.json not found" | 未进行规划便执行 | 提示用户先运行 `/seo cluster plan` |
| "claude-blog not installed" | 尝试执行，但未安装博客 Skill | 改为生成内容简报；建议安装 |
| "DataForSEO budget exceeded" | 成本检查返回 "blocked" | 回退到 WebSearch；通知用户 |
| "Duplicate primary keywords" | 检测到关键词蚕食 | 合并受影响的文章或重新分配关键词 |
| "Orphan page detected" | 文章缺少入站链接 | 从最接近的主题集群同级页面添加链接 |
| "Resume state corrupted" | 计划与输出不匹配 | 通过扫描输出目录重建状态 |

---

## 安全性

- 所有 URL 均通过 `claude-seo run render_page.py <url> --mode auto` 获取（通过 `url_safety` 提供支持 SPA 的 SSRF 防护）
- 不存储或传输任何凭据
- 输出文件不包含 PII 或 API 密钥
- 每次调用 API 前都会运行 DataForSEO 成本检查

## FLOW 框架集成

对于提示词引导的关键词研究和差距分析，请使用 `/seo flow find [url|topic]`：FLOW 的 5 个发现阶段提示词通过结构化发现提示，对基于 SERP 重叠度的聚类方法形成补充。