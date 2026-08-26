---
name: blog-cluster
description: >
  Semantic topic cluster planning and automated execution engine for claude-blog.
  Performs SERP-based keyword research, groups keywords by search intent and
  SERP overlap, builds a hub-and-spoke cluster architecture, generates an
  interactive SVG cluster map, and executes the full cluster by orchestrating
  blog-write calls with shared cluster context and automatic internal-link
  injection. Fills the strategy-to-execution gap: blog-strategy plans the
  blueprint, blog-cluster builds the house.
  Use when user says "blog cluster", "topic cluster", "content cluster",
  "cluster plan", "cluster execute", "pillar content", "hub and spoke",
  "content ecosystem", "cluster map".
license: MIT
compatibility: Requires Claude Code and claude-blog (provides blog-write, blog-chart, blog-image)
metadata:
  author: AgriciDaniel
  version: "2.2.0"
  category: blog
user-invokable: true
argument-hint: "[plan|execute] [seed-keyword|cluster-plan.json]"
---
# 博客集群（语义主题集群引擎）

根据单个种子关键词，规划并执行完整的相互链接内容生态系统。分为三层：语义聚类（大脑）、集群架构（结构）和执行引擎（机器）。

> 改编自 Lutfiya Miller 提交的 **semantic-cluster-engine**
> （AI Marketing Hub Pro Challenge，2026 年 3 月获奖作品，95/100，典范级）。
> 原始仓库：https://github.com/Drfiya/semantic-cluster-engine
> 此移植版本保留了 Plan + Execute 架构和集群上下文创新，移除了特定品牌（ScienceExperts.ai）的样式和图像提示词，并通过 claude-blog 现有的子技能执行。

## 命令

| 命令 | 功能 |
|---------|--------------|
| `/blog cluster` | 交互式操作。询问用户是进行规划还是执行。 |
| `/blog cluster plan <seed-keyword>` | 基于 SERP 的语义分析。输出集群规划和映射。 |
| `/blog cluster plan --from strategy [path]` | 导入现有的 `blog-strategy` 集群构建计划，并根据 SERP 数据进行验证。 |
| `/blog cluster execute [path-to-plan]` | 按顺序调用 `blog-write`，携带集群上下文并自动建立内部链接。 |

## 关键参考资料（按需加载）

- `references/semantic-clustering.md`（SERP 重叠分析、意图分类、关键词全集扩展）
- `references/cluster-architecture.md`（中心辐射式架构规范、schema 策略、链接密度规则）
- `references/execution-workflow.md`（执行顺序、上下文注入、评分卡、失败处理）

## 与现有 claude-blog 技能的交叉引用

| 技能 | 此技能调用它的时机 |
|-------|--------------------------|
| `/blog strategy` | 上游规划。`plan --from strategy` 会使用其 Cluster Build Plan 表格。 |
| `/blog write` | 单篇文章执行。每个支柱页面和支线页面都由 `blog-write` 生成，并在开头附加集群上下文区块。 |
| `/blog chart` | 由 `blog-write` 在内部调用，用于生成内联 SVG 图表。此技能不会直接调用它。 |
| `/blog image` | 为每篇文章生成可选的主图。模型选择由 `blog-image` 委托处理；如果有可用的当前 Gemini 图像模型，应优先使用。 |
| `/blog seo-check` | 建议在执行后使用，用于逐篇进行页面 SEO 验证。 |
| `/blog cannibalization` | 建议在执行后使用，以确认整个集群不存在关键词重叠。 |
| `/blog schema` | 建议在执行后使用，以添加 `BreadcrumbList`、`ItemList` 和 `Article` schema。 |

此技能绝不会修改属于其他技能的文件。它通过 Task 工具或作为编排式子技能调用这些技能。

## 命令路由

1. 解析用户的命令以确定子命令。
2. 如果用户只输入了 `/blog cluster`，询问：“您想要**规划**一个新的集群，还是**执行**一个现有计划？”
3. 进行路由：
   - 将 `plan <keyword>` 路由至规划阶段（如下所述）
   - 将 `plan --from strategy [path]` 路由至策略导入流程（如下所述）
   - 将 `execute [path]`、`build` 或 `run` 路由至执行阶段（如下所述）

---

## 规划阶段：`/blog cluster plan <seed-keyword>`

参考：`references/semantic-clustering.md`

### 步骤 1. 种子关键词扩展

使用 WebSearch 将种子扩展为包含 30 到 50 个短语的关键词全集：

1. 直接搜索 `<seed>`，收集相关搜索和“People also ask”。
2. 长尾扩展：`<seed> guide`、`<seed> tips`、`<seed> tools`、`<seed> examples`、`<seed> vs`、`best <seed>`、`how to <seed>`。
3. 问题挖掘：`what is <seed>`、`how does <seed> work`、`why <seed>`、`<seed> for beginners`。
4. 意图变体：添加商业修饰词（best、top、review、comparison、pricing）、信息型修饰词（guide、tutorial、explained、examples）以及交易型修饰词（buy、download、tool、software、service）。
5. 年份新鲜度：`<seed> 2026`。

### 步骤 2. 语义聚类

使用 `references/semantic-clustering.md` 中的优先级规则对扩展后的关键词进行分组：

1. **SERP 重叠分析**是主要信号。两个关键词如果共享的前 10 条结果中有 4 条或更多，通常表示它们针对相同的意图，应考虑合并为一篇文章。
2. **意图分类**将每个关键词归类为信息型、商业型、交易型或导航型。
3. **实体映射**识别 Google 与该主题关联的人物、产品、框架和组织。
4. **分组**将意图和主题接近且相同的关键词合并。每个分组将成为中心辐射式结构中的一个分支。

### 步骤 3. 集群架构设计

参考：`references/cluster-architecture.md`

构建中心辐射式结构：

- **支柱页面（中心）**：针对最宽泛的关键词。字数为 2,500 到 4,000。模板为 `pillar-page`。链接到每个辐射页面。
- **辐射页面**：每个页面针对一个长尾集群。字数为 1,200 到 1,800。根据意图自动选择模板。链接回支柱页面，并横向链接到同级页面。

集群构建规则：

- 常规模式：每个支柱页面包含 2 到 5 个集群，每个集群包含 2 到 4 个辐射页面，总计 1 个支柱页面加 5 到 15 个辐射页面。
- 小型集群模式：对于范围较窄的种子关键词，只有在警告用户并请求确认后，才允许采用 1 个支柱页面加 2 到 4 个辐射页面的结构。
- 每个辐射页面针对唯一的主要关键词（零关键词蚕食）。

### 步骤 4. 内部链接矩阵

对于每个辐射页面 `S`：

- `S` 指向支柱页面（始终如此；锚文本使用支柱页面的主要关键词）。
- 支柱页面指向 `S`（始终如此；锚文本使用 `S` 的主要关键词）。
- `S` 指向同一集群中的其他辐射页面（每个页面 2 到 3 个链接，使用上下文相关的锚文本）。
- `S` 指向相邻集群中的辐射页面（0 到 1 个链接，仅在语义相关时添加）。

验证每个辐射页面至少有 2 个入站链接。统计计划中的内部链接总数。

### 步骤 5. 生成输出文件

所有计划和执行产物都放入当前工作目录下的同一个子目录中。将输出目录规范化，拒绝符号链接，并拒绝写入集群目录之外的位置。Slug 只能包含小写字母、数字和连字符；拒绝绝对路径、`..`、Slug 内的路径分隔符以及隐藏的控制字符。

```
<cwd>/
└── cluster-<seed-keyword-slug>/
    ├── cluster-plan.json
    ├── cluster-map.html
    ├── pillar-<slug>.md       (Execute Phase)
    ├── <spoke-slug>.md        (Execute Phase, one per spoke)
    └── cluster-scorecard.md   (Execute Phase)
```

#### `cluster-plan.json` schema

```json
{
  "seed_keyword": "<seed>",
  "generated_at": "YYYY-MM-DDTHH:MM:SSZ",
  "pillar": {
    "id": "P",
    "title": "Title of the pillar",
    "primary_keyword": "broadest keyword",
    "secondary_keywords": ["..."],
    "search_volume_estimate": "high|medium|low",
    "template": "pillar-page",
    "word_count_target": 3000,
    "cluster": "pillar"
  },
  "clusters": [
    {
      "name": "Cluster A: Theme",
      "intent": "informational|commercial|transactional",
      "color": "#2563eb",
      "posts": [
        {
          "id": "A1",
          "title": "Post title",
          "primary_keyword": "long-tail keyword",
          "secondary_keywords": ["..."],
          "search_volume_estimate": "high|medium|low",
          "template": "how-to-guide",
          "word_count_target": 1500,
          "links_to": ["P", "A2"],
          "links_from": ["P", "A2"]
        }
      ]
    }
  ],
  "total_posts": 9,
  "total_interlinks": 23,
  "estimated_total_words": 18000
}
```

注意：搜索量估算是根据 SERP 信号得出的相对指标（high、medium、low），并非绝对搜索量。如需精确数据，用户应查阅 Ahrefs、SEMrush 或 DataForSEO（claude-blog 提供 `seo-dataforseo` 配套 sibling）。

#### `cluster-map.html`（XSS-safe）

一个静态、独立的 HTML 文件，其中嵌入了 SVG 可视化图。作者必须遵守以下硬性规则：

- 不得使用内联 `<script>` 块。文档中的任何位置都不得出现 `onclick`、`onmouseover` 或任何 `on*` 事件属性。
- 不得使用外部脚本 `<src>` 引用。
- 绘制到 SVG 中的每个文本标签（标题、关键词、集群名称）都必须进行转义：在插入前，将 `&` 替换为 `&amp;`，将 `<` 替换为 `&lt;`，将 `>` 替换为 `&gt;`，将 `"` 替换为 `&quot;`，并将 `'` 替换为 `&#39;`。
- 悬停效果只能使用 CSS `:hover`。不得使用 JavaScript。
- 在 SVG 节点内部使用 `<title>` 子元素来提供可访问的工具提示（使用浏览器原生功能，不使用脚本）。

该图展示：中心的支柱节点、向外辐射的彩色集群组、每个集群中的 spoke 节点，以及连接相关节点的连线。

### 第 6 步：向用户展示计划

展示集群和文章的摘要表、内部链接总数、预计字数以及文件路径。询问用户确认后再继续执行。等待用户明确批准。不得自动执行。

---

## 策略导入：`/blog cluster plan --from strategy [path]`

将 `blog-strategy` 的输出衔接到集群计划中。

1. 定位策略输出。在当前目录（或用户指定的路径）中扫描包含 `Cluster Build Plan` 表格的文件，该表格包含 `# | Spoke Topic | Template | Target Keyword | Word Count | Internal Links` 这些列（这是 `/blog strategy` 生成的格式）。
2. 解析表格。提取支柱行（标记为 `P`）、spoke 行、模板分配、目标关键词、字数以及链接关系。
3. 验证并丰富。对每个关键词运行 SERP 重叠验证（计划阶段第 2 步）。添加搜索量估算，并从语义上验证集群分组。
4. 如果 SERP 数据与策略表相矛盾，标记该冲突；不得静默覆盖用户的战略意图。
5. 使用与标准计划阶段相同的输出生成 `cluster-plan.json` 和 `cluster-map.html`。
6. 展示转换后的计划，并突出显示基于 SERP 的任何调整，然后等待用户确认。

---

## 执行阶段：`/blog cluster execute [path-to-plan]`

参考：`references/execution-workflow.md`

### 步骤 1：加载计划

从用户指定的路径，或工作目录中最近的 `cluster-*/cluster-plan.json`，读取 `cluster-plan.json`。验证 JSON 结构。如果不存在计划，返回：“未找到集群计划。请先运行 `/blog cluster plan <seed-keyword>`。”

在读取用户提供的计划路径之前，将其相对于当前工作目录进行规范化。拒绝绝对路径、`..`、符号链接、文件名不是 `cluster-plan.json` 的路径，以及位于所选集群目录之外的任何路径。将所有生成的文章、图片、映射和评分卡输出限制在该集群目录内。

### 步骤 2：确定执行顺序

1. 首先处理支柱页面（这样分支页面就能链接到已知文件名）。
2. 然后处理分支页面，排序依据为 `(cluster priority, search_volume_estimate desc, post id alphabetical)`。集群优先级是该集群内预计搜索量之和（最高者优先）。
3. 当集群数量超过 2 个时，在集群之间交替执行，以分散早期内容的覆盖范围。

### 步骤 3：针对每篇文章构建集群上下文并调用 `blog-write`

构建集群上下文块（完整架构见 `references/execution-workflow.md`），并将其添加到传递给调用 `blog-write` 的 Task 工具的主题提示之前。上下文会告知 `blog-write` 集群名称、文章角色（支柱页面或分支页面）、主要和次要关键词、所选模板、目标字数、已经写好的文章列表（链接到这些文章）、即将编写的文章列表（使用 `[INTERNAL-LINK]` 占位符），以及本文的链接要求。

**证据来源传递。** 集群上下文会为每个分支页面和支柱页面包含以下指令：“确保实质性主张可以追溯到支持它们的来源。当日期、发布者/标题详情、检索备注、方法论和局限性有助于识别或解读来源时，记录这些信息。使用该出版物的引用格式。删除无法验证的统计数据，并替换与之矛盾的统计数据。”

这种级联机制会在批量执行过程中保持证据规范，而不会将固定的来源记录格式变成评分或门槛。参见 `skills/blog/references/flow-alignment.md`。

上下文还会指示 `blog-write` 自主运行：跳过主题澄清，跳过大纲审批，不自动检测模板，不暂停。

输出格式：默认使用标准 Markdown（`.md`），与 `blog-write` 的默认格式一致。如果用户明确请求 HTML，则相应设置平台目标。不要强制添加任何特定品牌的 CSS 或文字标识；这是用户后续流程的责任。

### 步骤 4：每篇文章可选的主图

如果 `blog-image` 可用，则通过 Task 工具调用 `/blog image generate`，为文章生成一张 16:9 的主图，并将其放置在 `cluster-<slug>/images/<post-slug>-hero.png`。将提供商选择委托给 `blog-image`；如果可用，优先使用当前的 Gemini 图像模型，并在评分卡中记录模型 ID。如果图像生成不可用或失败，则记录警告并继续执行，不生成图片。图像生成不会阻塞流程。

### 第 5 步。注入反向链接

每篇文章写入后：

1. 扫描集群目录中所有之前写入的文章，查找引用刚写入文章的 `[INTERNAL-LINK: keyword -> filename.md]` 标记。
2. 将每个匹配项替换为真实的 Markdown 链接：`[keyword](filename.md)`。
3. 首次处理时，将集群元数据块添加到该文章的 frontmatter 中（`cluster:`、`cluster_role:`、`cluster_group:`）。

### 第 6 步。失败处理

如果 `blog-write` 对任何文章返回质量门禁失败，立即停止批处理。保存进度，将失败的文章及所有剩余文章标记为已跳过，并告知用户在继续之前手动检查或重试失败的文章。质量失败后不要继续生成 5 到 15 篇文章，因为这可能造成规模化内容滥用风险。

如果 `blog-write` 在生成内容之前因超时或运行时错误失败，请在评分卡中记录该失败并停止，除非用户在检查原因后明确恢复执行。

如果用户在执行过程中取消操作，请保存进度并记录已完成的文章。下一次执行 `/blog cluster execute` 时，检测已经写入的文件，并从下一篇尚未写入的文章继续。

### 第 7 步。生成 `cluster-scorecard.md`

所有尝试写入的文章完成后，生成一份 Markdown 评分卡，涵盖：

- 每篇文章的状态（已写入、失败、已跳过），包括文件路径和字数。
- 每篇文章的质量评分（通过 Task 并行调用每篇文章的 `/blog analyze`）以及集群平均分。
- 集群凝聚力评分：由链接互惠性、意图多样性、模板多样性和关键词覆盖率综合得出的 0 到 100 分评分（公式见 `references/execution-workflow.md`）。
- 内部链接审计：每篇文章的出站链接数和入站链接数、孤立文章标记、未解析的 `[INTERNAL-LINK]` 标记。
- 关键词蚕食检查：任意两篇文章共享主要关键词，或任意文章对之间的关键词重叠率超过 70%。建议运行 `/blog cannibalization` 进行更深入的检查。
- 图片生成摘要：已生成与已跳过的主图数量。
- 建议的后续操作：生成结构化数据（`/blog schema`）、逐篇进行 SEO 验证（`/blog seo-check`）、内容再利用（`/blog repurpose`）。

### 第 8 步。最终报告

向用户返回一份简洁摘要，其中包括总数、评分卡路径和后续操作命令。

---

## 输出产物（摘要）

| 文件 | 阶段 | 格式 |
|------|-------|--------|
| `cluster-plan.json` | 规划 | JSON |
| `cluster-map.html` | 规划 | 静态 HTML + 内联 SVG，无 JavaScript |
| `pillar-<slug>.md` | 执行 | Markdown（或平台检测到的格式） |
| `<spoke-slug>.md` | 执行 | Markdown（或平台检测到的格式） |
| `images/<post-slug>-hero.png` | 执行（可选） | 通过 `blog-image` 生成的 PNG |
| `cluster-scorecard.md` | 执行 | Markdown |

---

## 质量门禁

| 门禁 | 检查项 | 失败时的操作 |
|------|-------|----------------|
| 集群最小规模 | 至少包含 2 个集群，且每个集群至少包含 2 篇文章 | 在规划期间发出警告；建议扩展 |
| 关键词蚕食 | 没有两篇文章共享主要关键词 | 阻止执行；要求调整规划 |
| 链接完整性 | 每篇文章至少有 2 个入站内部链接 | 在评分卡中发出警告 |
| 长度估算 | 支柱文章通常需要比分支文章更深入 | 将其作为可选规划上下文传递给 `blog-write`；绝不强制执行原始字数下限 |
| 意图多样性 | 各集群之间至少有 2 种不同意图 | 在评分卡中发出警告 |
| 模板多样性 | 整个集群中至少有 3 种不同模板 | 在评分卡中发出警告 |

---

## 错误处理

| 场景 | 操作 |
|----------|--------|
| 种子关键词过于宽泛（超过 50 个关键词变体） | 建议在聚类前缩小重点范围。 |
| 种子关键词过于狭窄（少于 5 个关键词变体） | 提供一个更小的集群（支柱主题加 2 至 3 个分支主题），或建议扩大范围。 |
| WebSearch 不可用 | 仅生成计划草案，并要求用户在执行前确认、导入关键词数据或 SERP 数据。 |
| `blog-write` 未通过质量门禁或内容生成失败 | 停止批处理，保存进度，将剩余文章标记为跳过，并要求手动检查或明确恢复执行。 |
| 未安装 `blog-write` | 返回：“`blog-cluster` 需要 `claude-blog`。运行此技能前请先安装它。” |
| `cluster-plan.json` 格式错误 | 验证 JSON，并报告带行号的解析错误。 |
| 用户取消执行 | 保存进度；下次调用时自动检测已写入的文章并从中恢复。 |
| 可选的图像生成不可用或失败 | 跳过主图生成；在执行开始时警告一次，而不是针对每篇文章分别警告。 |

---

## 与相关 claude-blog 技能的区别

| 技能 | 作用 | blog-cluster 的新增功能 |
|-------|------|------------------------|
| `blog-strategy` | 规划 3 至 5 个内容支柱，并将中心辐射图作为战略练习绘制出来 | 执行基于 SERP 的语义聚类，然后将计划执行为真实且相互链接的文章。 |
| `blog-calendar` | 围绕主题集群安排发布日期 | 不构建集群或撰写文章；这项技能两者都会完成。 |
| `blog-cannibalization` | 检测现有内容中的关键词重叠 | 仅用于诊断。blog-cluster 会在规划阶段防止关键词蚕食。 |
| `blog-write` | 一次撰写一篇文章 | blog-cluster 通过共享集群上下文和双向链接，协调多次 `blog-write` 调用。 |
| `blog-outline` | 生成单篇受 SERP 信息影响的大纲 | blog-cluster 为整个集群生成相当于大纲的内容，然后撰写这些文章。 |

blog-cluster 就像总承包商：它分析主题，绘制数据驱动的计划，并根据单个种子关键词构建完整的结构。