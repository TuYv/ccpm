---
name: powerbi-report-design
description: >-
  Generate Power BI report visual design guidance before PBIR files are
  written. Use when the user wants to: (1) choose tone, signature, page
  archetypes, chart types, layout, color, typography, theme direction, or
  accessibility approach, (2) redesign/restyle an existing report, apply a
  brand, or critique chart/layout choices, (3) produce a design contract for
  `powerbi-report-authoring`. For end-to-end requirements, approval, and build
  sequencing, use `powerbi-report-planning`. Triggers: "design Power BI report",
  "make dashboard look professional", "choose chart type", "apply brand to
  report", "redesign report", "create design brief", "Power BI report design archetype".
metadata:
  version: 0.1.0
---
# Power BI 报表设计技能

此技能为 Power BI 报表提供设计指导。它确定设计标识（基调 + 标志性设计），根据各页面的需求将用户请求导向正确的原型，并应用贯穿全局的设计原则（颜色、字体排印、图标设计、布局、交互性、可访问性）。

**范围边界** — 此技能决定报表应该呈现*什么样的外观*以及*为什么这样设计*。它**不会**编写 PBIR 文件。生成设计约定后，将所有文件操作移交给 `powerbi-report-authoring`：页面/视觉对象创建、主题注册、表达式编码、格式对象和验证。

## 必须/建议/避免

### 必须

- 在做出设计决策之前，检查语义模型或可用字段。
- 给出具体的设计选择：基调、标志性设计、页面原型、图表选择依据、布局方向、颜色、字体排印以及可访问性注意事项。
- 将文件操作移交给 `powerbi-report-authoring`；此技能不编辑 PBIR。

### 建议

- 仅询问会实质性影响结果的缺失设计输入。
- 按需使用参考文件，而不是加载完整的设计目录。
- 当设计将被实施时，输出结构化的 `Design Brief:`。

### 避免

- 不要直接创建页面、视觉对象、筛选器、主题或 PBIR 文件。
- 不要在未给出具体布局、颜色和图表决策的情况下，提供含糊的“让它更现代”之类的指导。
- 对于宽泛的创建/构建请求，不要取代规划工作流。

## 主题文件和示例

此根文件涵盖端到端工作流、主题、注意事项以及设计约定模板。根据需要阅读主题文件：

| 文件 | 何时阅读 |
|------|-------------|
| `references/tone-catalog.md` | 当提示中没有指定具体基调，或需要为后续工作确定具体的调色板/字体选择时阅读 |
| `references/signatures.md` | 在选择或完善报表的标志性视觉设计手法时阅读 |
| `references/archetype-composition.md` | 对于多页报表，当页面角色或变体轮换方式不明确时阅读 |
| `references/archetypes/<name>.md` | 在布局每个页面**之前阅读** — 布局模板、密度、图表组合 |
| `references/chart-selection.md` | 在选择图表类型**之前阅读** — 编码层级、用途匹配 |
| `references/visual-cookbook.md` | 在配置任何视觉对象**之前阅读** — 各类型的排序、颜色、标签、条件格式 |
| `references/layout.md` | 在画布上放置视觉对象**之前阅读** — 8 像素网格、构图模板 |
| `references/color.md` | 在定义调色板、颜色语义、渐变或条件格式时阅读 |
| `references/typography.md` | 在覆盖字号、字体搭配或字重约定时阅读 |
| `assets/base.json` | 在为生成的报表处理主题**之前阅读** — 调整自定义主题时，保留其中针对文本框/卡片/表格各类型的保护措施 |
| `references/interactivity.md` | 在添加钻取、书签或交叉筛选规则时阅读 |
| `references/brownfield.md` | 在重新设计、重新设定样式、更换主题或应用品牌规范时阅读 |
| `references/accessibility.md` | 在最终确定任何报表**之前阅读** — WCAG 检查清单、替代文本、对比度 |
| `references/anti-patterns.md` | 在最终确定任何报表**之前阅读** — 常见问题及其修复方法 |
| `references/pre-flight-checklist.md` | 在移交/最终审核之前阅读完整检查清单 |
| `references/design-brief.md` | 在移交**之前阅读** — 完整的 `Design Brief:` 模板、机械式 `layout_contract` 架构、页面标题/页眉带、切片器位置、禁止重叠规则和验证检查清单 |

## 工作流程

### 步骤 0 — 数据优先调查

在做出任何设计决策之前，先检查语义模型。如果 Semantic Model MCP 服务器可用，则使用该服务器；否则直接读取 `.tmdl` 文件。对每个表抽取 top-N 行样本，以了解数据分布、基数和数量级。梳理表、列、度量值、层次结构和关系。将每个度量值与维度的组合映射到其所回答的分析问题。

### 步骤 1 — 设计标识

在选择原型或图表之前，先确定一种**调性**和一个**标志性设计**。调性体现报表的整体感受；标志性设计则是贯穿各个页面、反复出现的核心视觉手法。如果提示中没有明确指定设计标识，请使用 `references/tone-catalog.md` 和 `references/signatures.md` 来选择、重新组合或创作调性与标志性设计。不要生搬硬套目录中的条目；关键是形成一个具体的设计标识，用以驱动配色、字体、布局和反复出现的视觉处理。对于棕地重新设计，请阅读 `references/brownfield.md`，并同时记录当前和目标调性与标志性设计。

### 步骤 2 — 原型路由器

应**按页面**进行路由，而不是按报表进行路由。即使是一个宽泛的请求（“一份涵盖我们业务方方面面的报表”），通常也会分解为多个页面，而这些页面具有不同的受众、目的和使用节奏，因此也需要采用不同的原型。将每个页面都视为一次独立的路由决策。

| 信号 | 原型 | 参考 |
|--------|-----------|-----------|
| 高管层、董事会、总经理；≤10 秒浏览；“是否按计划推进？” | **高管摘要** | `references/archetypes/executive-summary.md` |
| 轮班操作员、NOC、监控大屏；“是否出现故障？” | **运营监控** | `references/archetypes/operational-monitor.md` |
| 分析师；假设检验；“为什么会发生 X？” | **分析画布** | `references/archetypes/analytical-canvas.md` |
| 由作者主导的论述；“事情是这样发生的” | **叙事故事** | `references/archetypes/narrative-story.md` |
| 排名、基准比较、差异；“相对于什么？” | **对比基准** | `references/archetypes/comparative-benchmark.md` |

当信号不明确时，默认使用**分析画布**——它是最灵活的原型，并且在条件不理想时仍能稳健适配。

**遇到模糊提示时：先询问，再进行路由。** 如果缺少受众、目的、页面数量或筛选深度，提示即属于模糊提示。遇到这种情况时，**停止并提供 2–3 个具体且有名称的选项**，使用面向用户的表述（绝不要暴露原型名称）。每个选项都应基于步骤 0 中语义模型的实际内容，对应一个具体的原型与变体组合。如果用户做出选择，则继续；如果用户仍不确定，则再提出一个用于缩小范围的后续问题；最多经过两轮后，选择最佳选项，在 `variant_rationale` 中记录该假设，然后继续。

**然后选择布局变体。** 每个原型参考文件都提供 **2–3 个布局变体**（A / B / C），并包含一个根据数据信号进行选择的表格。使用步骤 0 中的数据形态，逐页查看变体选择表。不要出于习惯默认选择变体 A。在 `Design Brief:` YAML 中记录所选变体以及促使你做出该选择的数据信号（`layout_variant` + `variant_rationale`）。

**将原型区域视为建议，而非强制要求。** 变体是布局的起点，而不是必需组件的检查清单。每张卡片、标注框、注释和上下文图块都必须通过回答一个独特的分析问题来证明其占用空间的合理性。如果语义模型缺少所需的派生洞察（增量、方差百分比、排名变化、异常阈值、比较基线或动态解释文本），则应删除该区域或将其改作他用，而不是用重复的绝对指标来填充。

对于多页报表，请参阅 [`references/archetype-composition.md`](references/archetype-composition.md)——其中介绍了常见组合（高管概览 + 下钻、运营 + 明细、叙事 + 证据、多领域）以及跨页面变体轮换规则。避免使用单一原型的报表；在数据信号支持的情况下，采用相同原型的页面必须轮换使用不同变体。

### 步骤 3 — 图表选择

阅读 [`references/chart-selection.md`](references/chart-selection.md)，为每个分析问题匹配正确的视觉对象类型。遵循编码层级：位置 → 长度 → 角度 → 面积 → 色相。先对数据进行抽样——如果折线图中的线条平坦无变化，或条形图中只有两个条形，则说明选择了错误的视觉对象。

### 步骤 4 — 视觉配置

阅读 `references/visual-cookbook.md`，了解各视觉对象类型的规则：排序顺序、配色策略、标签位置、坐标轴配置和条件格式。这些规则决定了图表看起来是专业还是业余。在画布上放置视觉对象之前，请阅读 `references/layout.md`。

### 步骤 5 — 主题

根据步骤 1 中确定的设计标识调整报表主题。对于生成的报表，应从 `assets/base.json` 开始；或者在创建经过调整的自定义主题时，保留其中针对各类型的关键保护措施：`textbox` 的内边距/背景/边框覆盖、`cardVisual` 的零内边距/卡片间距、表格自适应扩展样式、隐藏的视觉对象标题栏，以及特定于类型的图表默认值。不要使用粗暴的通配符 `visualStyles["*"]["*"].padding` / background 来替代这些设置，除非已检查并覆盖所有受影响的视觉对象类型。如果报表已有主题，请保留该主题，除非用户要求更换主题或更新品牌形象。有关主题注册的完整机制——包括在调整 `assets/base.json` 时如何选择 `$schema` 版本——请使用 `powerbi-report-authoring` skill。

### 步骤 6 — 规范设计契约

输出一个结构化的 `Design Brief:` YAML 块。这是与 `powerbi-report-authoring` 之间的契约。使用步骤 0-5 中的具体值填充每个字段，并为每个页面包含一个机制化的 `layout_contract`。

在规划器工作流中使用此 skill 时，请将此 YAML 块嵌入 `_brief/report-spec.md` 的“规范设计契约”部分。有关完整模板、字段设计依据、棕地项目的当前/目标字段、最小简报应急方案、页面级机制化架构、示例和验证检查清单，请阅读 `references/design-brief.md`。

该契约必须包含设计来源标记（`generated_by: powerbi-report-design`）和 `contract_version`。除非用户要求其他尺寸，否则绿地报表默认使用 FHD（`1920 x 1080`）；棕地报表保留现有画布，除非已批准调整尺寸。在交接非简单页面之前，其 `layout_contract` 必须包含 `page_title` 的位置、预留的页眉/切片器区域或有合理依据的筛选器侧栏、`space_audit`，以及互不重叠的区域/放置位置。

请记住这个最小结构；完整模板和验证规则请参阅 `references/design-brief.md`：

```yaml
Design Brief:
  generated_by: powerbi-report-design
  contract_version: 1
  mode: greenfield
  design_identity: { tone: <tone>, signature: <signature> }
  pages:
    - name: <descriptive insight title>
      role: <landing | detail | drillthrough | tooltip>
      archetype: <Executive | Analytical | Operational | Narrative | Comparative>
      layout_variant: <A | B | C>
      variant_rationale: <one sentence: which data signal drove this pick>
      layout_contract:
        canvas: { width: 1920, height: 1080, margin: 32, gutter: 24, snap: 8 }
        grid:
          columns: 12
          rows: 12
          regions:
            header:  [1, 1, 9, 2]
            filters: [9, 1, 13, 2]
            body:    [1, 2, 13, 13]
        placements:
          - id: page_title
            region: header
            kind: textbox
            text: <descriptive insight title>
          - id: <visual_or_slicer_id>
            region: <defined region>
            kind: <cardVisual | barChart | lineChart | tableEx | slicer | azureMap | ...>
            purpose: <one analytical question>
            field_bindings: <Table[Field] or role map>
        space_audit:
          content_cell_count: <cells after excluding reserved header/slicer/rail>
          placed_cell_count: <cells covered by regions with placements>
          empty_cell_pct: <0-100>
          unplaced_regions: []
          largest_region: { name: <region>, pct_of_content: <0-100> }
          balance_rationale: <why region sizes match analytical priorities>
```

**最小简报快捷方式**（简单的单一视觉对象请求）：只需 3 行——
`mode`、`design_identity { tone, signature }`（在既有报表场景中也可使用 `unchanged`），
以及一项决策。示例请参阅 `references/design-brief.md`。

### 第 7 步——审查与交接

在交接之前，请阅读 `references/design-brief.md` 和
`references/pre-flight-checklist.md`，然后依据这两份文档严格审查设计
契约。对于既有报表场景，还要逐项检查
`references/brownfield.md` 中专门针对既有报表的项目。在交接前修复所有问题。

如果可以获得独立审查（由另一次独立推理过程或同事完成），请务必这样做——布局空缺、缺少切片器、单色图表、原始字段名称以及未能贯彻设计基调等问题，最容易被新的视角发现。

契约通过检查清单后，将其交给 `powerbi-report-authoring` 实施。

## 易踩坑点

以下是不易察觉、但会导致报表看起来残缺或缺乏辨识度的问题。请逐项检查。

**声明了基调但从未贯彻**——简报中写着 `tone: editorial newsroom`，但最终交付的排版、调色板以及网格线/边框处理方式却与其他所有报表完全相同。基调必须通过具体的视觉选择*体现出来*。请逐项检查基调目录中相应行的后续选择列。

**页面背景**——每个页面都应使用经过有意设计的页面底色；避免白色画布搭配白色视觉对象容器，否则会产生扁平、无边界的视觉对象，使其与背景融为一体。具体的 `page.json` 实现机制由创作环节负责。

**无重叠 / 控件不被裁剪** — 任何视觉对象的边界框都不得重叠，除非这种重叠是明确有意为之的（例如，位于图表后方的注释形状）。顶部栏切片器与标题共用一个预留的标题/切片器区域：页面标题仍以左侧为锚点，切片器排列在其右侧。图表/卡片应从该区域下方开始，而不是置于其下层。提高切片器的 Z 顺序不能替代无重叠布局。

**冗余标注** — 如果侧边标注或 KPI 上下文磁贴重复展示相邻图表中已经显示的同一绝对指标，就只会造成干扰。标注需要有与派生比较、阈值、排名、异常或生成式叙述相关联的 `insight_basis` / `callout_value_basis`；否则应移除该标注，并将空间留给能够增加信息量的图表、表格、筛选器上下文或注释。

**时间切片器粒度** — 不要仅仅因为存在日期列，就不加思考地选择完整日期 `Between` 切片器。对于管理层页面和年度粒度的数据，应使用年份下拉列表/磁贴，除非用户需要按日/月范围进行探索，且该列是可渲染的 Date/DateTime 字段。

**文本框滚动条** — 文本框需要具有足够的高度，以容纳其字号以及任何 VCO/主题内边距，否则 Desktop 会渲染出滚动条。高度公式：`max(18, ⌈fontSize × 25/16⌉) + padding_top + padding_bottom`。如果主题使用通配符内边距，请添加文本框专用的零内边距覆盖设置，或增加文本框高度。

**颜色映射约定** — 每个绑定到度量值的视觉对象都必须遵循 `Design Brief.color_map`。`measure_match` 表示在卡片、折线、条形图、地图和表格中精确复用同一基础颜色；`gradient` 表示针对同一度量值使用浅色调 → 基础色的渐变。交付前应审核已构建的报表，检查是否存在不一致。

**单色条形图** — 单度量值条形图可能会将所有条形渲染为同一种颜色，因为 PBI 是按系列而非按类别分配调色板颜色的。如果类别对比很重要，请在设计简报中指定预期的按类别着色或渐变处理方式，并由创作环节负责具体实现。不要通过将同一字段同时用作类别和图例来规避这一问题。

**原始字段名** — 智能体经常会在坐标轴、标题和图例中保留诸如 `method_category`、`customer_id`、`Count of order_line_id` 或 `date_of_enrolment` 之类的原始数据库名称。检查每个坐标轴标签、列标题、图例项和卡片标签。为每个字段设置易于理解的显示名称。

**聚合项的显示名称** — 使用诸如“Total Fights”或“Students”这样具有描述性的名称，而不是“Sum of fight_key”或“Count of student_id”。通过投影中的 `displayName` 或坐标轴标题覆盖进行设置。

**百分比格式** — 以小数形式存储的比率（例如 0.53）应显示为“53%”，而不是“0.53”。在相关视觉对象属性中将数字格式字符串设置为 `"0%"` 或 `"0.0%"`。