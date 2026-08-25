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
  version: "2.2.5"
  category: seo
---
# 语义主题聚类

由 SERP 重叠驱动的关键词聚类，用于内容架构设计。根据 Google 实际对关键词的排名方式（共享前 10 个结果）对关键词进行分组，而不是依据文本相似度。设计带有内部链接矩阵的中心辐射式内容集群，并生成交互式集群地图可视化。

**脚本：**位于插件根目录下的 `scripts/` 目录中。

---

## 快速参考

| 命令 | 功能 |
|---------|-------------|
| `/seo cluster plan <seed-keyword>` | 完整规划工作流：扩展、聚类、架构设计、可视化 |
| `/seo cluster plan --from strategy` | 从现有的 `/seo plan` 输出中导入 |
| `/seo cluster execute` | 执行计划：通过 claude-blog 创建内容，或输出内容简报 |
| `/seo cluster map` | 重新生成交互式集群可视化 |

---

## 规划工作流

### 第 1 步：种子关键词扩展

使用 WebSearch 将种子关键词扩展为 30-50 个变体：

1. **相关搜索**：搜索种子关键词，提取“相关搜索”和“其他人还搜索了”
2. **People Also Ask (PAA)**：从 SERP 结果中提取所有 PAA 问题
3. **长尾修饰词**：附加常见修饰词：“best”、“how to”、“vs”、“for beginners”、“tools”、“examples”、“guide”、“template”、“mistakes”、“checklist”
4. **问题挖掘**：生成 who/what/when/where/why/how 变体
5. **意图修饰词**：添加商业修饰词：“pricing”、“review”、“alternative”、“comparison”、“free”、“top”

**去重：**规范化变体（转换为小写、移除冠词），删除完全重复项。
目标：生成 30-50 个不重复的关键词变体。如果少于 30 个，则以排名靠前的 PAA 问题为种子，执行第二轮扩展。

### 第 2 步：SERP 重叠聚类

这是核心差异化所在。加载 `references/serp-overlap-methodology.md` 以了解完整算法。

**流程：**
1. 根据初步意图猜测对关键词进行分组（减少成对比较次数）
2. 对每个组内的候选关键词对，使用 WebSearch 搜索两个关键词
3. 统计前 10 个自然搜索结果中共享的 URL 数量（忽略广告、精选摘要和 PAA）
4. 应用以下阈值：

| 共享结果数 | 关系 | 操作 |
|---------------|-------------|--------|
| 7-10 | 同一文章 | 合并为单个目标页面 |
| 4-6 | 同一集群 | 归入同一个分支集群 |
| 2-3 | 互相链接 | 放入相邻集群，并添加交叉链接 |
| 0-1 | 分开 | 分配到不同集群，或排除 |

**优化：**对于 40 个关键词，完整的成对比较需要进行 780 次比较。可采用以下方式替代：
- 先按意图分组（4 组，每组约 10 个关键词 = 4 x 45 = 180 次比较）
- 仅对分组边界上的关键词进行交叉检查
- 如果两个关键词都是同一核心词的长尾变体，则跳过比较对（假设属于同一集群）

**DataForSEO 集成：**如果 DataForSEO MCP 可用，则使用 `serp_organic_live_advanced` 代替 WebSearch 获取 SERP 数据。在每批次执行前运行 `claude-seo run dataforseo_costs.py check serp_organic_live_advanced --count N`。如果 `"status": "needs_approval"`，显示费用估算并询问用户。如果 `"status": "blocked"`，则回退到 WebSearch。

### 步骤 3：意图分类

将每个关键词归类为以下四种意图类别之一：

| 意图 | 信号 | 是否纳入集群？ |
|--------|---------|---------------------|
| 信息型 | how、what、why、guide、tutorial、learn | 是 |
| 商业型 | best、top、review、comparison、vs、alternative | 是 |
| 交易型 | buy、price、discount、coupon、order、sign up | 是 |
| 导航型 | 品牌名称、特定产品名称、login | 否（排除） |

从集群中移除导航型关键词。标记边界案例，供人工审核。
关键词可能具有混合意图（例如，“best CRM software”同时具有商业型和信息型意图）——应根据主导意图进行分类。

### 步骤 4：中心页与辐射页架构

加载 `references/hub-spoke-architecture.md` 以获取完整规范。

**设计集群结构：**

1. **选择中心关键词**：搜索量最高、意图最广泛，并且与其他关键词具有最多 SERP 重叠的关键词
2. **将辐射关键词分组到集群中**：每个集群是一个子主题区域（每个中心页对应 2-5 个集群）
3. **将文章分配到集群**：每个集群包含 2-4 篇辐射文章
4. **为每篇文章选择模板**：基于意图分类：

| 意图模式 | 模板选项 |
|---------------|-----------------|
| 信息型（广泛） | ultimate-guide |
| 信息型（how） | how-to |
| 信息型（列表） | listicle |
| 信息型（概念） | explainer |
| 商业型（比较） | comparison |
| 商业型（评估） | review |
| 商业型（排名） | best-of |
| 交易型 | landing-page |

5. **设置字数目标：**
   - 中心页：2500-4000 字
   - 辐射文章：1200-1800 字

6. **关键词蚕食检查**：任何两篇文章不得共享相同的主要关键词。如果 SERP
   重叠度达到 7+，则将这些关键词合并到一篇文章中，同时针对这两个关键词。

### 步骤 5：内部链接矩阵

设计双向链接结构：

| 链接类型 | 方向 | 要求 |
|-----------|-----------|-------------|
| 辐射页指向中心页 | spoke -> pillar | 必须（每个辐射页都需要） |
| 中心页指向辐射页 | pillar -> spoke | 必须（每个辐射页都需要） |
| 集群内辐射页互链 | spoke <-> spoke | 每篇文章 2-3 个链接 |
| 跨集群链接 | spoke -> spoke (other cluster) | 每篇文章 0-1 个链接 |

**规则：**
- 每篇文章必须至少有 3 个指向它的内部链接
- 不得存在孤立页面（每篇文章都必须能从中心页经由 2 次点击到达）
- 锚文本必须使用目标关键词或其近似变体（不得使用“点击此处”）
- 链接位置：位于正文内容中，而不仅仅是导航栏或侧边栏

将链接矩阵生成为 JSON 邻接表：
```json
{
  "links": [
    { "from": "pillar", "to": "cluster-0-post-0", "type": "mandatory", "anchor": "keyword" },
    { "from": "cluster-0-post-0", "to": "pillar", "type": "mandatory", "anchor": "keyword" }
  ]
}
```

### 步骤 6：交互式集群地图

使用 `templates/cluster-map.html` 中的模板生成 `cluster-map.html`。

1. 读取模板文件
2. 根据集群规划构建 `CLUSTER_DATA` JSON 对象：
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
5. 告知用户：“在浏览器中打开 `cluster-map.html`，即可探索交互式集群地图。”

---

## 策略导入

使用 `--from strategy` 调用时：

1. 查找当前目录中最近一次 `/seo plan` 的输出（搜索匹配 `*SEO*Plan*`、`*strategy*`、`*content-strategy*` 的文件）
2. 解析 Markdown 表格中的：关键词、页面类型、内容支柱、URL 结构
3. 验证提取的数据：检查重复项、缺失的关键词、不完整的条目
4. 使用 SERP 数据进行丰富：对提取的关键词运行 SERP 重叠分析
5. 使用导入的关键词作为起始集合构建集群计划（跳过步骤 1）

如果未找到策略文件，提示用户："当前目录中未找到现有的 SEO 计划。请先运行 `/seo plan`，或提供一个种子关键词以进行全新聚类。"

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
3. 检查恢复状态：扫描输出目录中已写入的文章
4. 按优先级顺序执行：先处理支柱页面，然后按搜索量处理支撑页面（从最高开始）
5. 对于每篇文章，调用 `blog-write` skill，并提供集群上下文：
   - 集群角色（支柱或支撑）
   - 集群中的位置（集群索引、文章索引）
   - 目标关键词和次要关键词
   - 模板类型和目标字数
   - 要包含的内部链接（及锚文本）
   - 后续文章将链接到本篇文章的位置（占位标记）
6. 每篇文章写入后，扫描之前的文章以查找反向链接占位符，并注入新文章的 URL
7. 所有文章写入后，生成集群评分卡

**如果未安装 claude-blog：**

1. 为集群计划中的每篇文章生成详细的内容简报
2. 每份简报包括：
   - 标题和元描述
   - 主要关键词和次要关键词
   - 模板类型和建议结构（H2/H3 大纲）
   - 目标字数
   - 要包含的内部链接（及锚文本）
   - 需要涵盖的关键要点
   - 需要与之形成差异的竞争页面
3. 将简报作为单独的 Markdown 文件写入 `cluster-briefs/` 目录
4. 告知用户："安装 [claude-blog](https://github.com/AgriciDaniel/claude-blog) 以自动创建内容。简报已保存到 `cluster-briefs/`。"

---

## 集群评分卡

执行后的质量报告。在 `/seo cluster execute` 后自动运行，也可以通过分析输出目录按需运行。

| 指标 | 目标 | 衡量方式 |
|--------|--------|-------------|
| 覆盖率 | 100% | 已写入文章数 / 计划文章数 |
| 链接密度 | 每篇 3+ 个 | 统计每篇文章中的内部链接数 |
| 孤立页面 | 0 | 入站链接少于 1 个的文章 |
| 关键词蚕食 | 0 个冲突 | 检查重复的主要关键词 |
| 图片数量 | 每篇 1+ 张 | 至少包含一张图片的文章 |
| 支柱链接 | 100% | 所有支撑页面都链接到支柱页面，反之亦然 |
| 交叉链接 | 80%+ | 已实施的推荐支撑页面之间链接 |
| 内容缺口 | 0 | 被跳过或不完整的计划文章 |

---

## 集群重新生成

当调用 `/seo cluster map` 时：

1. 从当前目录读取 `cluster-plan.json`
2. 扫描输出目录并更新文章状态（已规划与已撰写）
3. 使用更新后的状态重新生成 `cluster-map.html`
4. 报告：已撰写文章数与已规划文章数、链接完成百分比

---

## 输出文件

所有输出都写入当前工作目录：

| 文件 | 描述 |
|------|-------------|
| `cluster-plan.json` | 机器可读的集群规划（完整数据） |
| `cluster-plan.md` | 人类可读的集群规划摘要 |
| `cluster-map.html` | 交互式 SVG 可视化 |
| `cluster-briefs/` | 内容简报（如果未安装 claude-blog） |
| `cluster-scorecard.md` | 执行后的质量报告 |

---

## Skill 间集成

| Skill | 关系 |
|-------|-------------|
| `seo-plan` | 导入来源：策略导入会读取 seo-plan 的输出 |
| `seo-content` | 质量检查：对生成的内容进行 E-E-A-T 验证 |
| `seo-schema` | Schema 标记：用于集群页面的 Article、BreadcrumbList、ItemList |
| `seo-dataforseo` | 数据来源：DataForSEO MCP 可用时提供 SERP 数据 |
| `seo-google` | 报告：生成集群规划和评分卡的 PDF 报告 |

集群规划或执行完成后，提供：
"生成 PDF 报告？使用 `/seo google report`"

---

## 错误处理

| 错误 | 原因 | 解决方案 |
|-------|-------|------------|
| "No seed keyword provided" | 缺少参数 | 提示用户提供种子关键词或 URL |
| "Insufficient keyword variants" | 扩展后少于 15 个关键词 | 使用 PAA 问题运行第二轮扩展 |
| "SERP data unavailable" | WebSearch 和 DataForSEO 均失败 | 30 秒后重试；如果仍然失败，则使用仅基于搜索意图的聚类，并发出警告 |
| "No strategy file found" | 使用了 `--from strategy`，但不存在规划文件 | 提示用户先运行 `/seo plan` |
| "cluster-plan.json not found" | 未进行规划就执行 | 提示用户先运行 `/seo cluster plan` |
| "claude-blog not installed" | 未安装博客 skill 却尝试执行 | 改为生成内容简报；建议安装 |
| "DataForSEO budget exceeded" | 成本检查返回了 "blocked" | 回退到 WebSearch；告知用户 |
| "Duplicate primary keywords" | 检测到关键词蚕食 | 合并受影响的文章，或重新分配关键词 |
| "Orphan page detected" | 文章缺少入站链接 | 从最近的集群同级页面添加链接 |
| "Resume state corrupted" | 规划与输出不匹配 | 根据输出目录扫描结果重建状态 |

---

## 安全性

- 所有 URL 均通过 `claude-seo run render_page.py <url> --mode auto` 获取（通过 `url_safety` 提供支持 SPA 的 SSRF 防护）
- 不存储或传输凭据
- 输出文件不包含 PII 或 API 密钥
- 每次 API 调用前都会执行 DataForSEO 成本检查

## FLOW 框架集成

对于提示词引导的关键词研究和差距分析，使用 `/seo flow find [url|topic]`：FLOW 的 5 个 find 阶段提示词通过结构化的发现提示词，为基于 SERP 重叠的聚类方法提供补充。