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
  version: "2.1.1"
  category: blog
user-invokable: true
argument-hint: "[plan|execute] [seed-keyword|cluster-plan.json]"
---
# 博客集群（语义主题集群引擎）

从单个种子关键词出发，规划并执行完整的互联内容生态系统。包含三层：语义聚类（大脑）、集群架构（结构）和执行引擎（机器）。

> 改编自 Lutfiya Miller 提交的 **semantic-cluster-engine**
>（2026 年 3 月 AI Marketing Hub Pro Challenge 冠军，评分 95/100，卓越级）。
> 原始仓库：https://github.com/Drfiya/semantic-cluster-engine
> 此移植版本保留了 Plan + Execute 架构和集群上下文创新，移除了品牌特定的（ScienceExperts.ai）样式和图像
> 提示词，并通过 claude-blog 现有的子技能进行处理。

## 命令

| 命令 | 功能 |
|---------|--------------|
| `/blog cluster` | 交互模式。询问是进行规划还是执行。 |
| `/blog cluster plan <seed-keyword>` | 基于 SERP 的语义分析。输出集群计划和地图。 |
| `/blog cluster plan --from strategy [path]` | 导入现有的 `blog-strategy` 集群构建计划，并依据 SERP 数据进行验证。 |
| `/blog cluster execute [path-to-plan]` | 依次调用 `blog-write`，注入集群上下文并自动建立内部链接。 |

## 关键参考资料（按需加载）

- `references/semantic-clustering.md`（SERP 重叠分析、意图分类、关键词空间扩展）
- `references/cluster-architecture.md`（中心辐射式架构规范、Schema 策略、链接密度规则）
- `references/execution-workflow.md`（执行顺序、上下文注入、评分卡、故障处理）

## 对现有 claude-blog 技能的交叉引用

| 技能 | 此技能何时调用它 |
|-------|--------------------------|
| `/blog strategy` | 上游规划。`plan --from strategy` 使用其 Cluster Build Plan 表格。 |
| `/blog write` | 逐篇文章执行。每篇辐射文章和支柱文章都由 `blog-write` 生成，并在前面添加集群上下文块。 |
| `/blog chart` | 由 `blog-write` 在内部调用，用于生成内嵌 SVG 图表。此技能不会直接调用它。 |
| `/blog image` | 可选择为每篇文章生成头图。模型选择委托给 `blog-image`；若当前有可用的 Gemini 图像模型，则优先使用。 |
| `/blog seo-check` | 建议在执行后使用，以逐篇验证页面 SEO。 |
| `/blog cannibalization` | 建议在执行后使用，以确认集群内的关键词重叠为零。 |
| `/blog schema` | 建议在执行后使用，以添加 `BreadcrumbList`、`ItemList` 和 `Article` Schema。 |

此技能绝不会修改属于其他技能的文件。它通过 Task 工具调用这些技能，或将其作为经过编排的子技能调用。

## 命令路由

1. 解析用户的命令以确定子命令。
2. 如果用户只输入了 `/blog cluster`，则询问：“你想要**规划**一个新集群，还是**执行**一个现有计划？”
3. 路由：
   - 将 `plan <keyword>` 路由到规划阶段（见下文）
   - 将 `plan --from strategy [path]` 路由到策略导入流程（见下文）
   - 将 `execute [path]`、`build` 或 `run` 路由到执行阶段（见下文）

---

## 规划阶段：`/blog cluster plan <seed-keyword>`

参考：`references/semantic-clustering.md`

### 第 1 步：种子关键词扩展

使用 WebSearch 将种子关键词扩展为包含 30 至 50 个短语的关键词集合：

1. 直接搜索 `<seed>`，获取相关搜索和“其他用户还问了”。
2. 长尾扩展：`<seed> guide`、`<seed> tips`、`<seed> tools`、`<seed> examples`、`<seed> vs`、`best <seed>`、`how to <seed>`。
3. 问题挖掘：`what is <seed>`、`how does <seed> work`、`why <seed>`、`<seed> for beginners`。
4. 意图变体：添加商业修饰词（best、top、review、comparison、pricing）、信息型修饰词（guide、tutorial、explained、examples）和交易型修饰词（buy、download、tool、software、service）。
5. 年份时效性：`<seed> 2026`。

### 第 2 步：语义聚类

使用 `references/semantic-clustering.md` 中的优先级规则对扩展后的关键词进行分组：

1. **SERP 重叠分析**是主要信号。如果两个关键词在排名前 10 的结果中有 4 个或更多相同结果，它们通常针对相同的意图，应考虑归入同一篇文章。
2. **意图分类**将每个关键词归类为信息型、商业型、交易型或导航型。
3. **实体映射**识别 Google 与该主题关联的人物、产品、框架和组织。
4. **分组**将意图相同且主题相近的关键词组合在一起。每个分组都会成为中心辐射式架构中的一个分支。

### 第 3 步：集群架构设计

参考：`references/cluster-architecture.md`

构建中心辐射式架构：

- **支柱页（中心）**：以范围最广的关键词为目标。字数为 2,500 至 4,000。模板为 `pillar-page`。向下链接到每个辐射页。
- **辐射页**：每个页面以一个长尾关键词集群为目标。字数为 1,200 至 1,800。根据意图自动选择模板。向上链接到支柱页，并横向链接到同级页面。

集群构建规则：

- 普通模式：每个支柱页包含 2 至 5 个集群，每个集群包含 2 至 4 个辐射页，总计 1 个支柱页加 5 至 15 个辐射页。
- 小型集群模式：对于范围较窄的种子关键词，仅在警告用户并请求确认后，才允许采用 1 个支柱页加 2 至 4 个辐射页的结构。
- 每个辐射页都以一个独有的主要关键词为目标（零关键词蚕食）。

### 第 4 步：内部链接矩阵

对于每个辐射页 `S`：

- `S` 指向支柱页（始终添加；锚文本使用支柱页的主要关键词）。
- 支柱页指向 `S`（始终添加；锚文本使用 `S` 的主要关键词）。
- `S` 指向同一集群中的其他辐射页（每页 2 至 3 个链接，使用上下文相关的锚文本）。
- `S` 指向相邻集群中的辐射页（0 至 1 个链接，仅在语义相关时添加）。

验证每个辐射页至少有 2 个入站链接。统计计划中的内部链接总数。

### 第 5 步：生成输出文件

所有规划和执行产物都应放入当前工作目录下的同一个子目录中。对输出目录进行规范化处理，拒绝符号链接，并禁止写入集群目录之外的位置。slug 必须仅包含小写字母、数字和连字符；拒绝绝对路径、`..`、slug 内的路径分隔符以及隐藏控制字符。

```
<cwd>/
└── cluster-<seed-keyword-slug>/
    ├── cluster-plan.json
    ├── cluster-map.html
    ├── pillar-<slug>.md       (Execute Phase)
    ├── <spoke-slug>.md        (Execute Phase, one per spoke)
    └── cluster-scorecard.md   (Execute Phase)
```

#### `cluster-plan.json` 架构

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

注意：搜索量估算是根据 SERP 信号得出的相对指标（高、中、低），而不是绝对搜索量。如需精确数据，用户应查阅 Ahrefs、SEMrush 或 DataForSEO（claude-blog 提供配套的同级 `seo-dataforseo`）。

#### `cluster-map.html`（XSS 安全）

一个静态、独立的 HTML 文件，其中嵌入了 SVG 可视化图。编写器必须遵守以下规则：

- 不得包含内联 `<script>` 块。文档中的任何位置都不得出现 `onclick`、`onmouseover` 或任何 `on*` 事件属性。
- 不得包含外部脚本 `<src>` 引用。
- SVG 中绘制的每个文本标签（标题、关键词、集群名称）都必须进行转义：插入前，将 `&` 替换为 `&amp;`、将 `<` 替换为 `&lt;`、将 `>` 替换为 `&gt;`、将 `"` 替换为 `&quot;`，并将 `'` 替换为 `&#39;`。
- 悬停效果只能使用 CSS `:hover`。不得使用 JavaScript。
- 在 SVG 节点内使用 `<title>` 子元素来提供无障碍工具提示（浏览器原生，无需脚本）。

该图展示：一个位于中心的支柱节点、从中心向外辐射且按颜色区分的集群组、每个集群内的辐条节点，以及连接相关节点的链接线。

### 第 6 步：向用户展示计划

展示集群和文章的汇总表、内部链接总数、预估总字数及文件路径。继续执行前请求确认。等待用户明确批准。不得自动执行。

---

## 策略导入：`/blog cluster plan --from strategy [path]`

将 `blog-strategy` 输出转换为集群计划。

1. 定位策略输出。在当前目录（或用户指定的路径）中扫描包含 `Cluster Build Plan` 表格的文件，该表格应包含 `# | Spoke Topic | Template | Target Keyword | Word Count | Internal Links` 列（即 `/blog strategy` 生成的格式）。
2. 解析表格。提取支柱行（标记为 `P`）、辐条行、模板分配、目标关键词、字数和链接关系。
3. 验证并完善。对每个关键词执行 SERP 重叠验证（计划阶段第 2 步）。添加搜索量估算，并从语义上验证集群分组。
4. 如果 SERP 数据与策略表相矛盾，则标记该冲突；不得在不作说明的情况下覆盖用户的策略意图。
5. 使用与标准计划阶段相同的输出生成 `cluster-plan.json` 和 `cluster-map.html`。
6. 展示转换后的计划，突出显示所有基于 SERP 的调整，并等待用户确认。

---

## 执行阶段：`/blog cluster execute [path-to-plan]`

参考：`references/execution-workflow.md`

### 第 1 步：加载计划

从用户指定的路径，或工作目录中最新的 `cluster-*/cluster-plan.json` 读取 `cluster-plan.json`。验证 JSON 结构。如果不存在计划，则返回：“未找到集群计划。请先运行 `/blog cluster plan <seed-keyword>`。”

在读取用户提供的计划路径之前，先基于当前工作目录对其进行规范化。拒绝绝对路径、`..`、符号链接、文件名不是 `cluster-plan.json` 的路径，以及所选集群目录之外的任何路径。将所有生成的文章、图像、地图和评分卡输出限制在该集群目录内。

### 第 2 步：确定执行顺序

1. 首先处理支柱页面（这样辐射页面就可以链接到一个已知的文件名）。
2. 然后处理辐射页面，按 `(cluster priority, search_volume_estimate desc, post id alphabetical)` 排序。集群优先级是该集群内预估搜索量之和（最高者优先）。
3. 当存在 2 个以上的集群时，在集群之间交替执行，以提高早期内容分布的多样性。

### 第 3 步：针对每篇文章构建集群上下文并调用 `blog-write`

构建集群上下文块（完整模式见 `references/execution-workflow.md`），并将其添加到通过 Task 工具调用 `blog-write` 时所传主题提示词的开头。该上下文会告知 `blog-write` 集群名称、文章角色（支柱或辐射）、主要和次要关键词、所选模板、目标字数、已完成文章列表（链接到这些文章）、即将撰写的文章列表（使用 `[INTERNAL-LINK]` 占位符），以及该文章的链接要求。

**证据来源信息传递。** 集群上下文会为每篇辐射文章和支柱文章加入以下指令：“确保重要主张可追溯至支持它们的来源。在日期、发布者/标题详情、检索说明、方法和局限性有助于识别或解读来源时，记录这些信息。使用出版物的引用格式。删除无法验证的统计数据，并替换与可靠证据相矛盾的数据。”

这种级联机制可在批量执行过程中维持证据规范，而不会将固定的来源记录格式转变为评分项或门槛。参见 `skills/blog/references/flow-alignment.md`。

该上下文还会指示 `blog-write` 自主运行：跳过主题澄清、跳过大纲审批、不自动检测模板且不中途暂停。

输出格式：默认使用标准 Markdown（`.md`），与 `blog-write` 的默认设置一致。如果用户明确要求 HTML，则相应地设置目标平台。不要强加任何品牌专属的 CSS 或字标；这由用户在下游流程中负责。

### 第 4 步：为每篇文章生成可选的头图

如果 `blog-image` 可用，则通过 Task 工具调用 `/blog image generate`，为文章生成一张 16:9 的头图，并将其放置在 `cluster-<slug>/images/<post-slug>-hero.png`。将提供商选择委托给 `blog-image`，在可用时优先使用当前的 Gemini 图像模型，并在评分卡中记录模型 ID。如果图像生成不可用或失败，则记录警告并在不生成图像的情况下继续。图像生成不会阻塞流程。

### 步骤 5. 反向链接注入

每篇文章写入后：

1. 扫描集群目录中此前写入的所有文章，查找引用刚写入文章的 `[INTERNAL-LINK: keyword -> filename.md]` 标记。
2. 将每个匹配项替换为真实的 Markdown 链接：`[keyword](filename.md)`。
3. 在首次处理时，将集群元数据块添加到文章的 frontmatter 中（`cluster:`、`cluster_role:`、`cluster_group:`）。

### 步骤 6. 失败处理

如果 `blog-write` 对任何文章返回质量门禁失败，请立即停止该批次。保存进度，将失败文章及所有剩余文章标记为已跳过，并告知用户在继续之前手动检查或重试失败的文章。不要在发生质量失败后继续生成 5 到 15 篇文章，因为这可能带来规模化内容滥用的风险。

如果 `blog-write` 因超时或运行时错误而在内容生成前失败，请将失败记录在评分卡中并停止，除非用户在检查原因后明确要求恢复执行。

如果用户在执行过程中取消，请保存进度并记录已完成的文章。下次执行 `/blog cluster execute` 时，检测已写入的文件，并从下一篇尚未写入的文章开始恢复。

### 步骤 7. 生成 `cluster-scorecard.md`

所有尝试处理的文章完成后，生成一份 Markdown 评分卡，涵盖：

- 每篇文章的状态（已写入、失败、已跳过），包括文件路径和字数。
- 每篇文章的质量评分（通过 Task 并行对每篇文章调用 `/blog analyze`）以及集群平均分。
- 集群凝聚力评分：由链接互惠性、意图多样性、模板多样性和关键词覆盖率综合得出的 0 到 100 分（公式见 `references/execution-workflow.md`）。
- 内部链接审计：每篇文章的出站和入站链接数量、孤立标记、未解析的 `[INTERNAL-LINK]` 标记。
- 关键词蚕食检查：任意两篇文章是否共享主要关键词，或任意一对文章的关键词重叠率是否超过 70%。建议运行 `/blog cannibalization` 进行更深入的检查。
- 图片生成摘要：已生成与已跳过的头图。
- 建议的后续操作：生成 schema（`/blog schema`）、逐篇文章进行 SEO 验证（`/blog seo-check`）、内容再利用（`/blog repurpose`）。

### 步骤 8. 最终报告

向用户返回简明摘要，其中包括总数、评分卡路径和后续操作命令。

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

| 门禁 | 检查 | 失败时的操作 |
|------|-------|----------------|
| 集群最低要求 | 至少 2 个集群，每个集群至少包含 2 篇文章 | 在规划期间发出警告；建议扩展 |
| 关键词蚕食 | 不得有两篇文章共享主要关键词 | 阻止执行；要求调整规划 |
| 链接完整性 | 每篇文章至少有 2 个入站内部链接 | 在评分卡中发出警告 |
| 长度估算 | 支柱文章通常需要比卫星文章更有深度 | 作为可选的规划上下文传递给 `blog-write`；绝不强制执行原始字数下限 |
| 意图多样性 | 各集群中至少有 2 种不同的意图 | 在评分卡中发出警告 |
| 模板多样性 | 集群中至少有 3 种不同的模板 | 在评分卡中发出警告 |

---

## 错误处理

| 场景 | 操作 |
|----------|--------|
| 种子关键词过于宽泛（超过 50 个关键词变体） | 建议先缩小关注范围，再进行聚类。 |
| 种子关键词过于狭窄（少于 5 个关键词变体） | 提供较小的集群（一个支柱页面加 2 至 3 个辐射页面），或建议扩大范围。 |
| WebSearch 不可用 | 仅生成计划草案，并要求用户确认、导入关键词数据或提供 SERP 数据后再执行。 |
| `blog-write` 未通过质量门槛或内容生成失败 | 停止批处理、保存进度、将剩余文章标记为已跳过，并要求手动检查或明确恢复执行。 |
| 未安装 `blog-write` | 返回："blog-cluster requires claude-blog. Install it before running this skill." |
| `cluster-plan.json` 格式错误 | 验证 JSON，并报告带行号的解析错误。 |
| 用户取消执行 | 保存进度；下次调用时恢复，并自动检测已写完的文章。 |
| 可选的图像生成功能不可用或失败 | 跳过主视觉图生成；在执行开始时警告一次，而不是每篇文章都警告。 |

---

## 与相关 claude-blog 技能的区别

| 技能 | 作用 | blog-cluster 增加的能力 |
|-------|------|------------------------|
| `blog-strategy` | 规划 3 至 5 个内容支柱，并绘制中心辐射图，作为战略规划练习 | 基于 SERP 执行语义聚类，然后将计划落实为真实且相互链接的文章。 |
| `blog-calendar` | 围绕主题集群安排发布日期 | 不构建集群，也不撰写文章；本技能两者都能完成。 |
| `blog-cannibalization` | 检测现有内容中的关键词重叠 | 仅用于诊断。blog-cluster 在规划阶段防止关键词蚕食。 |
| `blog-write` | 每次撰写一篇文章 | blog-cluster 使用共享的集群上下文和双向链接，编排多次 `blog-write` 调用。 |
| `blog-outline` | 生成单个基于 SERP 信息的大纲 | blog-cluster 为整个集群生成与大纲等效的规划，然后撰写文章。 |

blog-cluster 就像总承包商：它分析主题、制定数据驱动的计划，并从一个种子关键词出发构建完整的内容结构。