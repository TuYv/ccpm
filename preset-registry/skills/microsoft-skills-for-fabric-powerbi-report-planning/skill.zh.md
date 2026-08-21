---
name: powerbi-report-planning
description: >-
  Build a guided requirements-to-implementation workflow for new Power BI
  reports and dashboards from semantic models, datasets, or PBIP projects. Use
  when the user wants to: (1) plan then implement a report, (2) define audience,
  scope, page plan, design direction, dependencies, and delivery target, (3)
  create a locked report spec with approval before PBIR authoring. For direct
  edits to existing report files, use `powerbi-report-authoring`. For design-only
  critique or redesign, use `powerbi-report-design`. Triggers: "build me a
  dashboard", "create a new report", "plan then implement", "define and build
  Power BI report", "walk me through creating a report".
metadata:
  version: 0.1.0
---
# Power BI 报表规划技能

此技能编排新 Power BI 报表的完整生命周期：

**定义 -> 检查 -> 规范 -> 审批 -> 构建 -> 验证 -> 发布**

它有意涵盖比单纯的需求收集流程更广的范围：既会记录报表规范，**也会**在用户批准后继续进入实施阶段。

## 必须/建议/避免

### 必须

- 对于需要需求收集、依赖项检查、审批和构建顺序安排的综合性报表创建工作流，使用此技能。
- 每次提出一个聚焦的澄清问题，并在所需决策明确后停止提问。
- 锁定 `_brief/report-spec.md`，并在实施前获得批准。
- 通过 `powerbi-report-design` 处理设计决策，通过 `powerbi-report-authoring` 处理文件操作。

### 建议

- 从提示、模型、现有 PBIP 文件或之前的轮次中推断显而易见的答案，而不是重复提问。
- 在最终确定页面范围或视觉对象建议之前检查语义模型。
- 将发布视为可选操作，并且仅在获得批准后继续。

### 避免

- 不要将此技能用于对现有 PBIR 文件进行小范围、局部性的编辑。
- 不要在用户批准已锁定的报表规范之前进行构建。
- 不要重复提供属于配套技能范畴的详细视觉设计或 PBIR 创作指导。

## 适用场景示例

当用户希望创建新的 Power BI 报表，并且同时需要以下两项内容时，请使用此技能：

1. 引导式需求工作流。
2. 批准后进入实施阶段的路径。

示例：

- “让我们基于此语义模型创建一个新的 Power BI 报表。”
- “帮助我定义并构建一个 Power BI 报表。”
- “使用报表实施手册开始创建新报表。”
- “为新的 Power BI 报表创建可复用的工作流。”

不要将此技能用于对现有报表页面进行小范围编辑。对于直接的 PBIR 创作任务，请使用 `powerbi-report-authoring`。对于**不需要完整引导式工作流**的视觉评审或从零开始的设计指导（一次性的“重新设计这个”或“这个应该是什么样子？”），请直接使用 `powerbi-report-design`。此技能会在第 3–4 轮中*使用*设计技能，而不是取代它。

## 必需的操作规则

1. **每次只问一个问题。** 每次澄清都使用 `ask_user`。
2. **澄清轮次最多为 3–5 轮。** 每轮可以有一个主要问题，并且仅在绝对必要时提出一个后续问题。
3. **在锁定规范之前检查语义模型。** 如果可用，请使用语义模型技能或 MCP 服务器；否则直接检查本地 TMDL/PBIP 文件。
4. **明确检查依赖项。** 不要假定 Desktop、MCP、创作工具或 Fabric 发布功能可用。
5. **构建前生成一份已锁定的 `_brief/report-spec.md`。**
6. **实施前请求批准。** 在用户明确批准之前不要进行构建。
7. **获得批准后，进行端到端构建。** 包括模型更改、PBIR 生成、验证、Desktop 预览、截图迭代以及可选的 Fabric 发布。
8. **除非发布获得批准，否则本地编辑应保留在本地。**
9. **不要重复询问已知答案。** 如果原始提示、检查过的文件或之前的轮次已经提供了受众、页面数量、交付目标、范围或设计方向，请将其记录在工作笔记中并继续。仅针对真正存在的歧义或高风险权衡进行提问。

## 依赖项检查清单

实施前，请记录以下状态：

| 依赖项 | 用途 | 何时需要 |
|---|---|---|
| Power BI Desktop | 打开/重新加载 PBIP，并以可视方式验证报表 | 本地预览时始终需要 |
| PBIP/PBIR 项目 | 基于文件的报表创作 | 生成报表时始终需要 |
| TMDL 语义模型 | 模型持久化和源代码管理 | 编辑模型时需要 |
| `powerbi-modeling-mcp` | 检查表、列、度量值；创建度量值/列；部署语义模型 | 实时创作模型时需要 |
| `powerbi-report-authoring` 技能 | 验证 PBIR、重新加载 Desktop、截取页面截图 | 验证报表创作时需要 |
| `powerbi-report-management` 技能 | 创建/更新/下载 Fabric 报表 | 仅发布到 Fabric 时需要 |
| Node.js | 基于生成器的 PBIR 创作 | 建议用于创建可复现的报表 |

如果某项依赖不可用，请继续规划，并将受影响的阶段标记为
阻塞/手动。不要假装该依赖可用。

## 轮次结构

### 第 0 轮 — 设置和依赖项检查

目标：确定语义模型、报表目标和可用工具。

只询问无法自动检查的信息：

> 此报表应使用哪个语义模型或数据集？

如果可以发现候选项，建议的选项应具体明确。枚举范围内
现有的 Fabric 语义模型和本地 `.SemanticModel` 文件夹，
然后将其作为选项列出，并将最匹配的选项标记为推荐。例如：

- `<DiscoveredSemanticModelName>`（推荐）
- 另一个现有的 Fabric 语义模型
- 一个新的本地数据集

然后检查：

- 现有的 `.pbip`、`.Report`、`.SemanticModel` 文件夹。
- 是否存在 TMDL 文件。
- 是否存在 Power BI Desktop 自动化脚本。
- MCP 连接是否可用或能否建立。
- 是否要求发布到 Fabric。

输出工作记录：

```markdown
Dependency status:
- Semantic model:
- PBIP/PBIR:
- Desktop preview:
- Modeling MCP:
- Report-authoring skill:
- Fabric publishing:
- Node generator:
```

### 第 1 轮 — 受众和任务

目标：了解报表面向的受众，以及它所支持的决策/任务。

如果提示中已明确说明受众和待完成的任务，请总结推断出的答案，
而不是提问。否则，请逐一询问缺失的信息。

受众不明确时询问：

> 此报表的主要受众是谁？

建议的选项：

1. 高管 / 领导层 — 简明的 KPI、趋势、风险和决策信息
2. 分析师 — 探索、下钻、比较和表格
3. 运营人员 — 监控、异常、状态和待处理事项队列
4. 外部受众 — 精致的故事呈现、引导式叙事、最少的切片器
5. 爱好者 / 粉丝 — 杂志风格的叙事、丰富的视觉对象和排名

然后，仅当待完成的任务仍不明确时询问：

> 此报表应帮助他们完成什么？

建议的选项：

1. 了解整体情况
2. 跟踪绩效
3. 发现异常值或机会
4. 比较实体或细分群体
5. 探索单条记录/档案
6. 为定期业务评审做准备

采集：

```markdown
Audience:
Primary purpose:
Tone:
Success criteria:
```

### 第 2 轮 — 模型清单与范围

目标：检查模型并定义首次构建的范围边界，同时避免重复询问用户已经提供的范围。

使用任何可用的模型检查能力——按照以下优先顺序，选择第一个适用的选项：

1. 已安装的语义模型创作技能。
2. 建模 MCP 服务器（例如 `powerbi-modeling-mcp-*`）——连接到实时模型，列出表、列、度量值和关系，并运行 DAX 进行实时验证。
3. 当实时连接不可用时，直接读取本地 TMDL 文件（`definition/model.tmdl`、`definition/tables/*.tmdl`、`definition/relationships.tmdl`）。

不要在面向用户的提示中硬编码工具名称——描述检查意图，并让智能体选择可用的工具。

总结：

```markdown
Facts:
- table, grain, keys, useful measures

Dimensions:
- date/time, geography, entity, category, owner, status, segment

Existing measures:
- core available measures

Likely missing model work:
- measures
- calculated columns
- relationship fixes
- sort columns
- helper fields for slicers/search

Risks:
- nulls/sparsity
- inactive relationships
- high-cardinality slicers
- fields that will not filter as expected
```

检查后，根据原始请求和先前的回答推断首次构建范围。如果用户已经给出了页数、报表类型或内容边界（例如，“构建一个 4 页的仪表板”），则不要单独询问范围问题。相反，应在工作备注中总结该边界：

```markdown
First-build scope:
- <focused first build / standard report / operational app / narrative report>
- inferred from: <user prompt | prior answer | model shape>
- included now:
- deferred:
```

仅当边界不明确、过于宽泛或存在风险时，才询问范围问题。询问时，应根据已检查的模型提供针对性的选项，而不是通用的首次构建选项。例如：

> 该模型支持销售、产品、地理位置、折扣和盈利能力分析。
> 对于此次首次构建，我们应该将重点放在高管绩效上，还是同时包含更深入的产品/客户探索？

### 第 3 轮 — 叙事与页面规划

目标：将模型和范围转化为页面架构。

调用或明确查阅 `powerbi-report-design`，以获取页面级原型路由和构图指导。设计技能负责视觉路由；不要在此处重复其路由表。使用第 2 轮中的数据结构，提供 2–3 个报表结构选项供用户确认。

该设计技能提供的五种原型是：**高管摘要**、**运营监控**、**分析画布**、**叙事故事**、**对比基准**。对于布局变体、多原型报表以及跨页面变体轮换，请遵循设计技能的原型和构图指导。

仅在应用第 2 轮推断出的首次构建范围后再询问：

> 我们应该使用哪种报表结构？

提供 2–3 个具名构图方案（例如，对于多领域请求，可使用*高管概览页 + 分析探索 + 对比排名*；对于聚焦型请求，可使用*单一高管概览页*）。根据第 1–2 轮推荐一个方案，并将其标记为 `(Recommended)`。

在用户选择后，在答案中起草页面列表：

```markdown
Proposed pages:
1. <Page> — archetype — purpose — core visuals — fields/measures
2. <Page> — archetype — purpose — core visuals — fields/measures
<repeat for each approved page>
```

记录切片器和交互：

- 全局切片器
- 页面专用切片器
- 用于高基数维度的搜索/前缀切片器
- 钻取/详情页面
- 必要时使用书签/导航

### 第 4 轮 — 设计风格、可访问性和交付

目标：确定设计风格、可访问性基线和交付目标。

调用或明确查阅 `powerbi-report-design`，以确定设计风格和主题方向。设计风格（基调 + 标志性元素）由设计技能负责——不要在此另造一套平行术语。使用设计技能的风格指导来选择基调与标志性元素的组合，然后将其呈现给用户。

询问：

> 你希望这份报表给人什么样的感受？

根据第 1–2 轮确定的受众和领域，提供 2–3 个具体的风格选项。每个选项都要说明一种报表感受，以及由此带来的一种标志性视觉处理。推荐其中一个，并标记为 `(Recommended)`。

如果用户有品牌指南，应提供一个以品牌为导向的选项，而不是选择通用基调。

然后，仅在交付方式尚不明确时询问：

> 完成后的报表应交付到哪里？

推荐选项：

1. 首先仅生成本地 PBIP
2. 发布到现有 Fabric 工作区
3. 在 Fabric 中创建新的语义模型和报表
4. 更新现有 Fabric 报表
5. 先在本地构建，稍后再决定是否发布

设计默认值（这些默认值来自设计技能的注意事项和基础主题；除非用户另有要求，否则自动应用）：

- 使用符合可访问性要求的对比度（每一组文本/背景组合至少达到 WCAG AA 标准）。
- 避免红色配红色以及低对比度的调色板。
- 优先使用 Azure Map，而不是已弃用的 map/filledMap 视觉对象。
- 为每个图表添加替代文本。
- 对高基数字段使用可搜索的下拉式切片器。
- 仅对类别较少的字段使用平铺式/列表式切片器。
- 将明细表格放在页面靠下的位置。
- 确保报表交互可预测且保持一致。

## 设计契约关卡

在生成 `_brief/report-spec.md` 以供审批之前，从 `powerbi-report-design` 获取一个规范的 `Design Brief:` YAML 块。规划器可以向设计技能提供需求、模型清单、页面目标和用户约束，但不得自行编写一套相互竞争的详细设计框架。

该规范设计块必须包括：

- `generated_by: powerbi-report-design`
- `contract_version`
- 页面计划中的每个页面都对应一个 `pages[]` 条目
- `pages[].layout_contract.canvas`
- `pages[].layout_contract.grid.regions`
- `pages[].layout_contract.placements`
- `pages[].layout_contract.space_audit`
- 每个页面都要有一个 `page_title` 文本框位置，并包含非空的标题文本
- 切片器应放置在右上方的 `filters` 区域中，或放置在有明确理由的筛选器边栏中
- 不得让无修饰的单值 `cardVisual` 占据最大/主导性的焦点区域，除非设计将其标记为包含上下文和设计理由的复合 KPI 呈现形式
- 不得存在未解决的占位符、省略号或仅以文字描述的线框图

如果该块缺少这些项目，请停止并修订设计契约，然后再请求批准或调用 `powerbi-report-authoring`。

## 锁定的报表规范输出

完成第 0-4 轮后，生成一个文件，并将其保存在当前工作目录下的 `./_brief/` 中：

- `./_brief/report-spec.md` — 用于审批和实施交接的唯一事实来源。

`report-spec.md` 包含两层：

1. 用于用户审批和提供可读上下文的 **Markdown 章节**。
2. 一个带围栏的 `yaml` 块，其中包含 `powerbi-report-design` 返回的原样 `Design Brief:`——即 `powerbi-report-authoring` 使用的权威实施契约。

如果 Markdown 正文与嵌入的 YAML 不一致，请在构建前修复 `report-spec.md`。不要让编写代理在相互冲突的指令之间做出选择。

如果代理运行时提供了专用的会话/暂存文件夹（例如由运行框架注入的 `session-state` 路径），你也可以在那里写入一份副本供用户查看，但权威的实施交接文件仍然是 `./_brief/report-spec.md`，除非后续每个编写步骤都明确携带替代文件的绝对路径。

### `report-spec.md` 模板

用户审批文档和代理交接契约。Markdown 用于记录签核粒度；嵌入的 YAML 用于记录确切的实施意图。

````markdown
# Report Spec

## Report identity
- Report name:
- Semantic model:
- Audience:
- Primary purpose:
- Delivery target:

## User decisions and constraints
- Scope:
- Page count:
- Interactivity:
- Design direction:
- Publishing:
- Tooling:
- Model edit permissions:
- Accessibility:
- Data caveats:

## Narrative
- Core story:
- Audience promise:
- Key questions answered:

## Design identity (from `powerbi-report-design` Step 1)
- Tone: <named entry from tone-catalog, e.g. "Editorial Newsroom">
- Signature: <one defining move, e.g. "tabular numerals + display serif headlines">
- Brownfield delta (if applicable): <current_tone → target_tone>

## Page plan (archetypes from `powerbi-report-design` Step 3)
1. Page name
   - Archetype:                      <Executive Summary | Analytical Canvas | …>
   - Layout variant (A/B/C):         <plus one-sentence variant_rationale>
   - Purpose:
   - Visuals:
   - Fields/measures:
   - Slicers/interactions:

## Design system summary
- Theme name + base palette (1–2 lines):
- Color semantics (which measure → which color, 1–2 lines):
- Typography pairing (display + body):
- Layout pattern (grid + gutter + density):
- Accessibility commitments:

## Model requirements
- Existing measures:
- New measures:
- New calculated columns:
- Relationship/sort requirements:

## Canonical design contract

Paste the exact fenced `yaml` block produced by `powerbi-report-design` here.
Do not rewrite it from planner memory and do not replace its mechanical
`layout_contract` with a freeform ASCII wireframe.

The YAML block is authoritative for implementation. `powerbi-report-authoring`
must implement this block; surrounding prose is context and conflict detection.

## Implementation notes

- Model changes:
- PBIR/report authoring:
- Validation:
- Desktop screenshot verification:
- Publishing boundary:
- Risks:
````

### 批准前必需的验收检查

在写出批准问题之前，请验证规范满足以下所有要求。如果任何检查未通过，请先修复 `report-spec.md` 和其中嵌入的 `Design Brief:` 块，然后再请求批准。

- 该块以 `Design Brief:` 开头。
- 其中包含 `generated_by: powerbi-report-design` 和 `contract_version`。
- 每个 Markdown 页面都有匹配的 `pages[]` 条目。
- 每个页面都有 `layout_contract.canvas`、`layout_contract.grid.regions` 和 `layout_contract.placements`。
- 每个页面都有 `layout_contract.space_audit`，其中 `unplaced_regions` 为空，并明确说明留白/平衡设计的理由。
- 每个页面都有一个 `page_title` 文本框位置，且标题文本非空。
- 切片器位于右上角的 `filters` 区域或有合理依据的筛选栏中；任何数据视觉对象都不得从切片器/页眉带区域下方开始。
- 除非 YAML 明确描述了包含上下文的复合 KPI 呈现方式，否则单独显示单一值的 `cardVisual` 不得成为最大/占主导地位的主视觉区域。
- 已批准的 YAML 不得包含省略号（`...`）、未解析的占位符，亦不得遗漏 Markdown 中承诺但未在 YAML 中定义的页面/视觉对象。

## 批准关卡

写完 `report-spec.md` 后，只提出一个批准问题：

> 是否批准此报表规范，以便我开始构建？

推荐选项：

1. 批准 — 开始构建
2. 修改受众/目的
3. 修改范围/页面计划
4. 修改设计/交付方式

在用户批准之前，不要调用创作或发布技能。

## 批准后的实施

用户批准后，按以下顺序执行：

1. 重新读取已批准的规范性报表规范（通常为 `_brief/report-spec.md`，或明确沿用的其他绝对路径），并提取其中嵌入的 `Design Brief:` YAML 块。在开始创作之前，验证其中包含 `generated_by: powerbi-report-design`、`contract_version`、每个页面各有一个已填充的 `layout_contract`，且每个页面都有 `space_audit`。对于从零开始构建的报表，除非用户选择了其他尺寸，否则请验证画布为 FHD（`1920 x 1080`），并验证最大/占主导地位的区域不是单独显示单一值的 `cardVisual`。
2. 将第一个实施待办事项标记为进行中。
3. 连接到语义模型。
4. 按照以下优先顺序，使用任何可用的模型创作路径创建/更新所需的度量值和计算列：语义模型创作技能、建模 MCP 服务器或直接编辑 TMDL。
5. 尽可能使用 DAX 验证每项模型变更。
6. 在计算列或度量值发生变更后，触发所选工具支持的轻量级重新计算（例如，使用 `refreshType=Calculate` 进行 XMLA 刷新），除非明确要求执行完整的源刷新，并且这样做是安全的。
7. 将模型变更导出为 TMDL。
8. 如果导出结果采用扁平的 TMDL 布局，请将其重新组织为 `definition/database.tmdl`、`definition/model.tmdl`、`definition/relationships.tmdl` 和 `definition/tables/*.tmdl`。
9. 搭建或复制 PBIP/PBIR 报表结构。
10. 按照 `powerbi-report-authoring` 指南创作 PBIR。
11. 生成报表文件。
12. 验证必需的文件和 JSON。
13. 在 Power BI Desktop 中打开/重新加载。
14. 对页面进行截图。
15. 修复视觉对象、切片器、数据绑定、无障碍访问和布局问题。
16. 仅当已批准的交付目标包括发布时才进行发布。

## Fabric 发布规则

仅当已获批准的交付目标包含发布时，才执行发布。将发布步骤交由
`powerbi-report-management` 处理；不要在此技能中编写 Fabric REST 调用
或 `definition.pbir` `byConnection` 有效负载。有关权威的 `byConnection` 架构
（用于本地 Desktop 验证的最小 API 形式和完整 XMLA 形式）、LRO
轮询以及主题上传规则，请参阅 `powerbi-report-management`。

调用 `powerbi-report-management` 时应遵守的规划器级规则：

- 动态解析工作区、报表和语义模型；不要硬编码
  ID。
- 创建/更新时包含所有 PBIR 定义部件；绝不要发送不完整的
  定义。
- 自定义主题的上传路径必须与 `report.json` 中引用的路径
  完全一致。
- 对长时间运行的操作使用 `--verbose`，并轮询 LRO，直至达到终止
  状态（`Succeeded` / `Failed`）。
- 操作完成后，清理所有临时发布脚本或有效负载文件。

## 验证标准

在满足以下条件之前，报表不算完成：

- 所需的 PBIP/PBIR 文件均已存在。
- 所有 JSON 均可成功解析。
- `definition.pbir` 指向预期的语义模型。
- 页面和视觉对象按预期数量生成。
- Power BI Desktop 能够打开 `.pbip`。
- Desktop 重新加载成功。
- 至少能成功捕获封面和所有新创建页面的屏幕截图。
- 如果已发布，Fabric LRO 返回 `Succeeded`。

## 反模式与陷阱

- 生成 PBIR 比手动编辑单个视觉对象 JSON 文件更安全。
- 必须先持久化模型更改，再重新加载 Desktop。
- DAX 筛选方向可能会破坏基于事实端标志的维度聚合。
- 高基数切片器需要搜索或前缀筛选。
- Desktop 验证能够发现 JSON 验证无法发现的问题。
- Fabric 发布对 `byConnection` 架构和主题路径非常敏感。