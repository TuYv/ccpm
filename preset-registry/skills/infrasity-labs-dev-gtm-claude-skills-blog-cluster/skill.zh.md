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
compatibility: Requires Claude Code and claude-blog (provides blog-write, blog-chart, blog-image)
user-invokable: true
argument-hint: "[plan|execute] [seed-keyword|cluster-plan.json]"
---
# 博客集群（语义主题集群引擎）

根据单个种子关键词规划并执行完整的互联内容生态系统。包含三个层次：语义聚类（大脑）、集群架构
（结构）和执行引擎（机器）。

## 命令

| 命令 | 功能 |
|---------|--------------|
| `/blog cluster` | 交互式。询问是进行规划还是执行。 |
| `/blog cluster plan <seed-keyword>` | 基于 SERP 的语义分析。输出集群计划和地图。 |
| `/blog cluster plan --from strategy [path]` | 导入现有的 `blog-strategy` 集群构建计划，并根据 SERP 数据进行验证。 |
| `/blog cluster execute [path-to-plan]` | 按顺序调用 `blog-write`，并提供集群上下文及自动内部链接。 |

## 关键参考资料（按需加载）

- `references/semantic-clustering.md`（SERP 重叠分析、意图分类、关键词全集扩展）
- `references/cluster-architecture.md`（中心辐射式规范、Schema 策略、链接密度规则）
- `references/execution-workflow.md`（执行顺序、上下文注入、评分卡、失败处理）

## 与现有 claude-blog 技能的交叉引用

| 技能 | 此技能何时调用它 |
|-------|--------------------------|
| `/blog strategy` | 上游规划。`plan --from strategy` 使用其集群构建计划表。 |
| `/blog write` | 单篇文章执行。每篇辐射文章和支柱文章均由 `blog-write` 生成，并在前面添加集群上下文块。 |
| `/blog chart` | 由 `blog-write` 在内部调用，用于生成内嵌 SVG 图表。此技能不会直接调用它。 |
| `/blog image` | 可选择为每篇文章生成头图（如果未配置 `nanobanana-mcp`，则进行优雅降级）。 |
| `/blog seo-check` | 建议在执行后使用，以对每篇文章进行页面 SEO 验证。 |
| `/blog cannibalization` | 建议在执行后使用，以确认整个集群中的关键词重叠为零。 |
| `/blog schema` | 建议在执行后使用，以添加 `BreadcrumbList`、`ItemList` 和 `Article` Schema。 |

此技能绝不会修改属于其他技能的文件。它通过 Task 工具调用这些技能，或将其作为编排的子技能调用。

## 命令路由

1. 解析用户的命令以确定子命令。
2. 如果用户只输入了 `/blog cluster`，则询问：“您想要**规划**一个新集群，还是**执行**一个现有计划？”
3. 路由：
   - 将 `plan <keyword>` 路由到规划阶段（见下文）
   - 将 `plan --from strategy [path]` 路由到策略导入流程（见下文）
   - 将 `execute [path]`、`build` 或 `run` 路由到执行阶段（见下文）

---

## 规划阶段：`/blog cluster plan <seed-keyword>`

参考：`references/semantic-clustering.md`

### 第 1 步：扩展种子关键词

使用 WebSearch 将种子关键词扩展为包含 30 到 50 个短语的关键词全集：

1. 直接搜索 `<seed>`，获取相关搜索和“其他用户还问了以下问题”。
2. 长尾扩展：`<seed> guide`、`<seed> tips`、`<seed> tools`、`<seed> examples`、`<seed> vs`、`best <seed>`、`how to <seed>`。
3. 问题挖掘：`what is <seed>`、`how does <seed> work`、`why <seed>`、`<seed> for beginners`。
4. 意图变体：添加商业修饰词（best、top、review、comparison、pricing）、信息型修饰词（guide、tutorial、explained、examples）和交易型修饰词（buy、download、tool、software、service）。
5. 年份时效性：`<seed> 2026`。

### 第 2 步：语义聚类

使用 `references/semantic-clustering.md` 中的优先级规则对扩展后的关键词进行分组：

1. **SERP 重叠分析**是主要判断依据。如果两个关键词在搜索结果前 10 名中有 5 个或更多相同结果，则它们针对的是同一搜索意图，应归入同一篇文章。
2. **意图分类**将每个关键词划分为信息型、商业型、交易型或导航型。
3. **实体映射**识别 Google 与该主题相关联的人物、产品、框架和组织。
4. **分组**将搜索意图相同且主题相近的关键词组合在一起。每个分组构成中心辐射式架构中的一个分支。

### 第 3 步：集群架构设计

参考：`references/cluster-architecture.md`

构建中心辐射式架构：

- **支柱页（中心）**：针对范围最广的关键词。字数为 2,500 至 4,000。模板为 `pillar-page`。向下链接到每个辐射页。
- **辐射页**：每个页面针对一个长尾关键词集群。字数为 1,200 至 1,800。根据搜索意图自动选择模板。向上链接到支柱页，并横向链接到同级页面。

集群形成规则：

- 每个支柱页包含 2 至 5 个集群。
- 每个集群包含 2 至 4 个辐射页。
- 总计：1 个支柱页加 5 至 15 个辐射页。
- 每个辐射页针对一个唯一的主关键词（零关键词蚕食）。

### 第 4 步：内部链接矩阵

对于每个辐射页 `S`：

- `S` 链接到支柱页（始终需要；锚文本使用支柱页的主关键词）。
- 支柱页链接到 `S`（始终需要；锚文本使用 `S` 的主关键词）。
- `S` 链接到同一集群中的其他辐射页（每个页面 2 至 3 个链接，使用上下文相关的锚文本）。
- `S` 链接到相邻集群中的辐射页（0 至 1 个链接，仅在语义相关时添加）。

验证每个辐射页至少有 3 个入站链接。统计规划的内部链接总数。

### 第 5 步：生成输出文件

所有规划和执行产物都放入当前工作目录的同一个子目录中：

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

注意：流量估算是根据 SERP 信号得出的相对指标（高、中、低），并非绝对搜索量。如需精确数据，用户应查阅 Ahrefs、SEMrush 或 DataForSEO（claude-blog 提供配套的同级 Skill `seo-dataforseo`）。

#### `cluster-map.html`（XSS 安全）

一个嵌入 SVG 可视化内容的静态、自包含 HTML 文件。编写者必须遵守以下规则：

- 不得使用内联 `<script>` 块。文档中的任何位置均不得使用 `onclick`、`onmouseover` 或任何 `on*` 事件属性。
- 不得使用外部脚本 `<src>` 引用。
- 绘制到 SVG 中的每个文本标签（标题、关键词、集群名称）都必须进行转义：插入前，将 `&` 替换为 `&amp;`、`<` 替换为 `&lt;`、`>` 替换为 `&gt;`、`"` 替换为 `&quot;`，并将 `'` 替换为 `&#39;`。
- 悬停效果仅使用 CSS `:hover`。不得使用 JavaScript。
- 在 SVG 节点内使用 `<title>` 子元素实现无障碍工具提示（浏览器原生支持，无需脚本）。

该地图展示：一个中心支柱节点、从中心向外辐射的彩色编码集群组、每个集群内的辐条节点，以及连接相关节点的链接线。

### 第 6 步：向用户展示计划

展示集群和文章的汇总表、内部链接总数、预估字数以及文件路径。在继续执行之前请求确认。等待用户明确批准。不得自动执行。

---

## 策略导入：`/blog cluster plan --from strategy [path]`

将 `blog-strategy` 的输出转换为集群计划。

1. 查找策略输出。在当前目录（或用户指定的路径）中扫描包含 `Cluster Build Plan` 表格的文件，该表格应包含列 `# | Spoke Topic | Template | Target Keyword | Word Count | Internal Links`（即 `/blog strategy` 生成的格式）。
2. 解析表格。提取支柱行（标记为 `P`）、辐条行、模板分配、目标关键词、字数以及链接关系。
3. 验证并扩充。对每个关键词执行 SERP 重叠验证（计划阶段第 2 步）。添加流量估算，并从语义上验证集群分组。
4. 如果 SERP 数据与策略表格存在冲突，应标记该冲突；不得在不作说明的情况下覆盖用户的战略意图。
5. 使用与标准计划阶段相同的输出生成 `cluster-plan.json` 和 `cluster-map.html`。
6. 展示转换后的计划，突出显示所有基于 SERP 的调整，并等待用户确认。

---

## 执行阶段：`/blog cluster execute [path-to-plan]`

参考：`references/execution-workflow.md`

### 第 1 步：加载计划

从用户指定的路径或工作目录中最近的 `cluster-*/cluster-plan.json` 读取 `cluster-plan.json`。验证 JSON 结构。如果不存在计划，则返回：“未找到集群计划。请先运行 `/blog cluster plan <seed-keyword>`。”

### 第 2 步：确定执行顺序

1. 首先执行支柱页面（以便辐条页面能够链接到一个已知文件名）。
2. 然后执行辐条页面，排序依据为 `(cluster priority, search_volume_estimate desc, post id alphabetical)`。集群优先级是该集群内预估流量的总和（最高者优先）。
3. 当存在 2 个以上集群时，在集群之间交替执行，以提高早期内容分布的多样性。

### 第 3 步：为每篇文章构建集群上下文并调用 `blog-write`

构建集群上下文块（完整 schema 见 `references/execution-workflow.md`），并将其添加到传递给 Task 工具以调用 `blog-write` 的主题提示词之前。该上下文会告知 `blog-write` 集群名称、文章的角色（支柱文章或辐射文章）、主要和次要关键词、所选模板、目标字数、已完成文章的列表（链接到这些文章）、即将撰写文章的列表（使用 `[INTERNAL-LINK]` 占位符），以及当前文章的链接要求。

**FLOW 证据三元组传递（必需）。** 每篇辐射文章和支柱文章的集群上下文都必须包含以下指令：“对每项公开统计数据应用 FLOW 证据三元组。在正文中注明年份（‘In 2026,’），使用包含发布者和标题的行内引用，并在来源块中提供带检索日期的 URL。删除无法验证的统计数据。替换与可靠来源相矛盾的数据。”

这种级联传递是必需的，因为集群执行属于高杠杆操作（一次处理 5 到 15 篇文章）。如果不显式传递，单篇辐射文章可能会在不知不觉中跳过证据规范。参见 `skills/blog/references/flow-alignment.md`。

该上下文还会指示 `blog-write` 自主运行：跳过主题澄清、跳过大纲审批、不自动检测模板，也不中途暂停。

输出格式：默认使用标准 markdown（`.md`），与 `blog-write` 的默认设置一致。如果用户明确要求 HTML，请相应设置平台目标。不要强加任何品牌专属 CSS 或文字标识；这由用户在下游环节自行处理。

### 第 4 步：为每篇文章选择性生成主视觉图

如果已配置 `nanobanana-mcp`，则通过 Task 工具调用 `/blog image generate`，为文章生成一张 16:9 的主视觉图，并将其保存到 `cluster-<slug>/images/<post-slug>-hero.png`。在文章的 frontmatter 中（`coverImage:`）以及正文顶部插入标准 markdown 图片引用。如果 MCP 不可用或执行失败，则记录警告并在不生成图片的情况下继续。图片生成不会阻塞流程。

### 第 5 步：注入反向链接

每篇文章完成后：

1. 扫描集群目录中所有此前已完成的文章，查找引用刚完成文章的 `[INTERNAL-LINK: keyword -> filename.md]` 标记。
2. 将每处匹配替换为真实的 markdown 链接：`[keyword](filename.md)`。
3. 首次处理时，在文章的 frontmatter 中添加集群元数据块（`cluster:`、`cluster_role:`、`cluster_group:`）。

### 第 6 步：失败处理

如果单篇文章的 `blog-write` 执行失败（超时、报错或未通过质量门禁），请记录该失败并继续处理其余文章。不要中止整个集群。评分卡会标记此缺口，并建议针对该文章手动调用 `/blog write` 重试。

如果用户在执行过程中取消操作，请保存进度并注明已完成的文章。下次执行 `/blog cluster execute` 时，检测已写入的文件，并从下一篇尚未完成的文章继续。

### 第 7 步：生成 `cluster-scorecard.md`

所有尝试执行的文章处理完毕后，生成一份 markdown 评分卡，其中包括：

- 每篇文章的状态（已写入、失败、已跳过），以及文件路径和字数。
- 每篇文章的质量评分（并行对每篇文章调用 `/blog analyze`）和集群平均分。
- 集群凝聚力评分：由链接互惠性、意图多样性、模板多样性和关键词覆盖率综合计算得出的 0 到 100 分（公式见 `references/execution-workflow.md`）。
- 内部链接审计：每篇文章的出站和入站链接数量、孤立文章标记、未解析的 `[INTERNAL-LINK]` 标记。
- 关键词蚕食检查：是否有任意两篇文章使用相同的主要关键词，或任意一对文章的关键词重叠率超过 70%。建议运行 `/blog cannibalization` 进行更深入的检查。
- 图片生成摘要：已生成与已跳过的首图数量。
- 建议的后续操作：生成结构化数据（`/blog schema`）、逐篇文章进行 SEO 验证（`/blog seo-check`）、内容再利用（`/blog repurpose`）。

### 第 8 步：最终报告

向用户返回简洁摘要，其中包含总数、评分卡路径和后续操作命令。

---

## 输出产物（摘要）

| 文件 | 阶段 | 格式 |
|------|-------|--------|
| `cluster-plan.json` | 规划 | JSON |
| `cluster-map.html` | 规划 | 静态 HTML + 内联 SVG，不使用 JavaScript |
| `pillar-<slug>.md` | 执行 | Markdown（或平台检测到的格式） |
| `<spoke-slug>.md` | 执行 | Markdown（或平台检测到的格式） |
| `images/<post-slug>-hero.png` | 执行（可选） | 通过 `blog-image` 生成的 PNG |
| `cluster-scorecard.md` | 执行 | Markdown |

---

## 质量门槛

| 门槛 | 检查项 | 失败时的操作 |
|------|-------|----------------|
| 集群最低要求 | 至少 2 个集群，每个集群至少包含 2 篇文章 | 在规划期间发出警告；建议扩展 |
| 关键词蚕食 | 任意两篇文章不得使用相同的主要关键词 | 阻止执行；要求调整规划 |
| 链接完整性 | 每篇文章至少有 3 个入站内部链接 | 在评分卡中发出警告 |
| 字数 | 支柱文章至少 2,500 字；卫星文章至少 1,200 字 | 作为硬性约束传递给 `blog-write` |
| 意图多样性 | 各集群中至少包含 2 种不同的意图 | 在评分卡中发出警告 |
| 模板多样性 | 集群中至少使用 3 种不同的模板 | 在评分卡中发出警告 |

---

## 错误处理

| 场景 | 操作 |
|----------|--------|
| 种子关键词过于宽泛（关键词变体超过 50 个） | 建议先缩小主题范围，再进行聚类。 |
| 种子关键词过于狭窄（关键词变体少于 5 个） | 提供较小的集群方案（1 篇支柱文章加 2 到 3 篇卫星文章），或建议扩大范围。 |
| WebSearch 不可用 | 改用 Claude 的推理能力扩展关键词并进行分组。在评分卡中注明准确性有所降低。 |
| 某篇文章的 `blog-write` 失败 | 记录、跳过并继续。在评分卡中标记该缺口。 |
| 未安装 `blog-write` | 返回：“blog-cluster 需要 claude-blog。请先安装它，再运行此技能。” |
| `cluster-plan.json` 格式错误 | 验证 JSON，并报告解析错误及其行号。 |
| 用户取消执行 | 保存进度；下次调用时自动检测已写入的文章并继续执行。 |
| 未配置 `nanobanana-mcp` | 跳过首图生成；在执行开始时警告一次，不要针对每篇文章重复警告。 |

---

## 与相关 claude-blog 技能的区别

| 技能 | 作用 | blog-cluster 的增量能力 |
|-------|------|------------------------|
| `blog-strategy` | 规划 3 至 5 个内容支柱，并将中心辐射图作为战略规划练习进行绘制 | 基于 SERP 执行语义聚类，然后将规划落实为真正的、相互链接的文章。 |
| `blog-calendar` | 围绕主题集群安排发布日期 | 不构建集群，也不撰写文章；此技能两者都做。 |
| `blog-cannibalization` | 检测现有内容中的关键词重叠 | 仅用于诊断。blog-cluster 在规划阶段就能防止关键词蚕食。 |
| `blog-write` | 每次撰写一篇文章 | blog-cluster 使用共享的集群上下文和双向链接来编排多次 `blog-write` 调用。 |
| `blog-outline` | 生成一份基于 SERP 信息的单篇文章大纲 | blog-cluster 为整个集群生成等同于大纲的规划，然后撰写文章。 |

blog-cluster 是总承包商：它分析主题，制定数据驱动的规划，并从一个种子关键词出发构建完整的内容结构。