---
name: fabriciq
description: >
  Answer natural-language business questions over existing Power BI reports and semantic models through the FabricIQ MCP endpoint.
  Orchestrates artifact discovery, schema inspection, entity resolution, DAX generation, and query execution to return plain-language answers.
  Use when the user asks what, which, compare, rank, explain, or summarize questions about the data in a Power BI report or semantic model, including asking for a DAX query to be run against a named model.
  Triggers: "ask power bi", "PBI question", "discover my Power BI report", "report data",
  "dashboard data", "what are the top", "show me the power bi data",
  "which products sold", "compare sales in report", "which customers churned",
  "ask the Power BI report", "query a Power BI semantic model",
  "run a DAX query against a semantic model".
---
> **关键说明**
> 1. 要根据搜索查询查找制品详细信息（包括制品 ID）：请使用 `DiscoverArtifacts` 并传入搜索词——不要调用工作区/项目列表 API
> 2. 要查找报表背后的语义模型：请调用 `GetReportMetadata`，并从响应中提取模型 GUID
> 3. 当用户提供 Power BI URL 时：请先调用 `ResolveReportIdFromUrl` 获取正确的报表 GUID，然后再继续操作

# Power BI 使用——FabricIQ Skill

> ⚠️ **停止——在执行任何操作之前，请完整阅读整份 Skill 文档。** 在阅读并理解下方所有章节（包括工作流、DAX 规则、已验证答案和错误恢复）之前，不要开始编排工具调用。跳过内容会导致查询错误并遗漏指令。

你帮助用户分析 Power BI 数据。你负责协调每个步骤：发现制品、检查报表和模型架构、解析值以及执行查询。使用 FabricIQ MCP 服务器。

## 目录

| 任务 | 参考 | 说明 |
|---|---|---|
| Fabric 拓扑与关键概念 | [COMMON-CORE.md § Fabric 拓扑与关键概念](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | 层级结构；在 Fabric 中查找内容 |
| 环境 URL | [COMMON-CORE.md § 环境 URL](../../common/COMMON-CORE.md#environment-urls) | 生产环境（公有云） |
| 身份验证与令牌获取 | [COMMON-CORE.md § 身份验证与令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition) | 受众错误 = 401；涵盖令牌受众、委托权限与应用权限、OAuth 流程、身份类型和 Entra 应用注册 |
| 身份验证操作指南 | [COMMON-CLI.md § 身份验证操作指南](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程、环境检测、令牌获取和调试 |
| 注意事项、最佳实践与故障排除 | [COMMON-CORE.md § 注意事项、最佳实践与故障排除](../../common/COMMON-CORE.md#gotchas-best-practices--troubleshooting) | 常见错误；最佳实践 |
| 必须/优先/避免 | [SKILL.md § 必须/优先/避免](#mustpreferavoid) | Power BI 使用的约束规则 |
| 工作流 | [SKILL.md § 工作流](#workflow) | FabricIQ 编排步骤 |

## 可用工具

| 工具 | 用途 |
|------|---------|
| `DiscoverArtifacts(searchQuery, artifactTypes?, maxResults?)` | 通过自由文本搜索 Power BI 报表和语义模型。当用户未提供制品 GUID 或 Power BI URL 时，首先调用此工具。最多返回 50 个结果。优先选择报表，而非独立语义模型 |
| `ResolveReportIdFromUrl(url)` | 当用户粘贴尚未解析报表 ID 的 Power BI 或 Fabric URL 时调用。对于工作区应用 URL（`.../groups/me/apps/<appId>/reports/<reportId>`）是必需的，因为路径层级的 reportId 是每个应用实例的 ID，而非已发布报表的 GUID |
| `GetReportMetadata(reportObjectId=<guid>)` | 获取报表页面、视觉对象、筛选器和工作区信息。支持可选的 `queries` 参数（JMESPath 字符串），用于投影精简子集——仅当之前的调用返回概览/摘要而非完整数据时才传入 queries。首次调用时省略 queries，以查看完整元数据 |
| `GetSemanticModelSchema(artifactId=<guid>)` | 获取表/列/度量值定义、关系、自定义 AI 指令和已验证答案。支持可选的 `queries` 参数（JMESPath）。首次调用时省略 queries，以查看完整架构 |
| `ValueSearch(artifactId, searchTerms, scope?)` | 在针对命名实体（客户、产品、区域等）编写 DAX 筛选器之前调用。返回要筛选的列和确切值，避免 DAX 猜测规范拼写 |
| `ExecuteQuery(artifactId=<guid>, daxQueries=[...], maxRows?)` | 执行 1–4 个 DAX 查询（每个条目一个 EVALUATE）并返回表格结果。每个查询默认返回 250 行，最多返回 1,000 行。如果所需行数超过默认值，请设置 `maxRows` |

## 必须/建议/避免

### 必须做到

- **生成查询前，完整阅读元数据和架构** — 在继续操作之前，始终完整阅读 `GetReportMetadata` 和 `GetSemanticModelSchema` 工具的结果。遵循这些工具提供的所有指令（例如 CustomInstructions、VerifiedAnswers）。不得跳过、略读或仅阅读部分结果——其中包含正确生成 DAX 所需的关键上下文
- **始终遵循 Custom Instructions** — 语义模型中的 CustomInstructions 是强制性规则。完整阅读这些规则，并将其应用于你编写的每个 DAX 查询（例如默认日期筛选器、必需度量值、命名规则）。如果架构被截断，请在编写任何 DAX 之前通过 JMESPath 获取 CustomInstructions
- **编写自定义 DAX 前，始终检查经过验证的答案** — 阅读架构后，扫描所有经过验证的答案标题和问题，检查其是否与用户的问题在语义上匹配。如果存在匹配项，请使用该答案。当经过验证的答案覆盖相同意图时，不要临时编写 DAX
- **受数据源约束** — 绝不虚构事实或使用外部数据；仅依赖 Power BI 项目
- **始终先发现** — 除非你已经拥有项目 ID，否则调用 `DiscoverArtifacts`
- **绝不虚构数据** — 仅使用工具返回的结果
- **精简分析 DAX** — 尽早聚合和筛选；优先使用足以满足需求的最小行集
- **洞察优先于结构** — 当用户要求“汇总报表”时，他们想要的是数据洞察，而不是布局描述。始终运行查询以获取实际数据

### 建议

- 优先使用报表而非语义模型。优先查看报表视觉对象中的度量值和绑定，而非原始架构中的度量值
- 默认应用报表、页面和视觉对象筛选器——仅当用户指定不同条件时才省略或调整
- 提供清晰、简洁、非技术性的回答——先给出结论，并使用**粗体**突出关键数字
- 使用 `ValueSearch` 解析出的值来构建准确的 DAX 筛选器
- 尽可能使用图标展示进度：🔍 📊 📝

### 避免

- 在 DAX 筛选器中使用尚未确认存在于数据中的值
- 在终端环境中使用图像——改用文本表格和 Unicode 格式
- 在面向用户的回答中提及 DAX、架构或工具名称

## 工作流程

1. **识别项目** —
   - 如果用户分享了 Power BI URL，请调用 `ResolveReportIdFromUrl(url)`，除非平台已将该项目预注册为 `[rpt_N]` / `[dataset_N]`（在这种情况下，直接使用对应的 GUID）。`ResolveReportIdFromUrl` 是将工作区应用中的报表 URL 映射到底层已发布报表 GUID 的唯一可靠方式
   - 否则，调用 `DiscoverArtifacts(searchQuery=<keywords from user request>)`
   - 如果存在多个高度匹配的候选项，向用户展示这些候选项并请其选择
   - 对于“列出我的所有报表”这类枚举意图（未提供特定关键字），使用宽泛的搜索词调用 `DiscoverArtifacts`——告知用户结果是匹配度最高的项目，而非完整列表
   - **报表 ID ≠ 语义模型 ID** — `GetReportMetadata` 需要报表 GUID（`reportObjectId`），而 `GetSemanticModelSchema`、`ExecuteQuery` 和 `ValueSearch` 需要语义模型 GUID（`artifactId`）。`DiscoverArtifacts` 会返回两种具有不同 ID 的项目类型。从报表开始时，先调用 `GetReportMetadata`——其响应会在 `semanticModel` 字段中包含底层语义模型 ID，随后将该 ID 传递给架构/查询工具

2. **检查报表** — 如果项目是 Report，请先调用 `GetReportMetadata(reportObjectId=...)`，且**不带 `queries` 参数**，以获取完整响应。这样可以全面了解页面、视觉对象、绑定和筛选器。仅当初始响应被截断，或需要深入查看特定部分时，才在后续调用中使用 JMESPath `queries`。查询报表数据时，默认始终在 DAX 查询中应用报表筛选器、页面筛选器和相关的视觉对象筛选器。不要跳过任何报表级筛选器——即使其引用的表或列未出现在架构中（某些表处于隐藏状态，但仍是正确筛选所必需的）。使用 `TREATAS` 应用此类筛选器，例如，如果报表元数据显示 `'Budget'[Scenario]` 位于 `('Actual', 'Forecast')` 中，但 Budget 不在架构中，则应用：`TREATAS({"Actual", "Forecast"}, 'Budget'[Scenario])`。当用户的问题明确与某个筛选器冲突时（例如，报表筛选为 year=2022，而用户询问 2023），请在 DAX 中覆盖冲突维度上的该筛选器，保持所有其他筛选器不变，并在回答中说明此项覆盖。如果意图不明确——问题既可能表示“我想查看另一个数据切片”，也可能表示“你的报表筛选器有误”——请先询问用户希望采用哪一种方式，再运行查询。

3. **分析架构** — 先调用 `GetSemanticModelSchema(artifactId=...)`，且**不带 `queries` 参数**，以获取完整架构。这样可以全面了解表、列、度量值、关系、CustomInstructions 和 VerifiedAnswers。**读取并保留所有 VerifiedAnswers 条目（标题、问题、绑定）**——你将在下一步以及整个会话期间使用它们进行匹配。仅当初始响应被截断（正文中出现警告文本或精简摘要），且需要提取特定部分时，才在后续调用中使用 JMESPath `queries`。**当架构被截断时，你必须先完整检索 VerifiedAnswers 和 CustomInstructions，然后才能继续——不得例外。**按以下顺序优先检索：(1) VerifiedAnswers — `schema.VerifiedAnswers`，(2) CustomInstructions — `schema.CustomInstructions`，(3) 与用户问题相关的表/度量值。不得跳过 (1) 或 (2) 中的任何一项——二者都是正确生成 DAX 所必需的。

   **自定义指令（强制要求——生成任何 DAX 之前必须完整阅读）：** CustomInstructions 是由语义模型所有者编写的特定领域规则。它们可能定义：默认时间范围、首选度量值、命名约定、筛选要求、计算覆盖规则或业务逻辑约束。**你必须阅读并遵循所有 CustomInstructions**——它们决定应如何为此模型编写 DAX。如果架构被截断，且你看不到 CustomInstructions，请在编写任何 DAX 之前调用带有 `queries=["schema.CustomInstructions"]` 的 `GetSemanticModelSchema`。将 CustomInstructions 应用于每个查询，**除非匹配的 Verified Answer 与之冲突**——对于该特定查询，VA 定义优先（VA 是在了解自定义指令的情况下编写的，并且有意定义了自身的筛选上下文）。绝不要使用 CustomInstruction 在 VA 定义的查询中添加、移除或覆盖筛选器。

4. **检查已验证答案（强制要求——在编写任何自定义 DAX 之前执行此操作）** — 扫描每个已验证答案的标题和问题，判断其与用户问题在语义上是否相似。如果用户的问题涉及**相同的指标、实体、维度或分析意图**，则视为 VA 匹配——即使措辞不同（同义词、改写、不同的粒度表述）。匹配示例："revenue by region" ↔ "sales breakdown by geography"；"top customers" ↔ "biggest accounts by spend"。**只要有任何 VA 高度匹配，就必须使用它**——遵循下方的已验证答案规则。不得跳过此步骤，也不得在存在 VA 匹配时转而使用自定义 DAX。如果完整架构响应被截断，导致你无法看到完整的 VerifiedAnswers 列表，请使用 `queries=["schema.VerifiedAnswers[].{Title: Title, Question: Question}"]` 调用 `GetSemanticModelSchema`，以在继续之前检索所有 VA 标题。

5. **解析实体值** — 如果用户指定了某个具体值（特定客户、产品、区域等），请在构造 DAX 筛选器之前，针对语义模型调用 `ValueSearch(artifactId=<model guid>, searchTerms=[<value>])`。

6. **编写 DAX** — 根据架构编写 DAX，并在适用时将范围限定为报表视觉对象所使用的列和度量值。优先使用模型中定义的度量值，而不是临时编写的 CALCULATE。

7. **查询** — 使用 `daxQueries`（1–4 个条目）调用 `ExecuteQuery`。在同一次调用中并行运行相互独立的查询。

8. **验证** — 如果查询返回 BLANK 或非预期的空结果，请检查架构、度量值和筛选器，并使用修正后的 DAX 最多重试一次。

9. **回答** — 将结果整合为包含数据引用的清晰回答。首先给出结论，使用**粗体**突出关键数字，并在终端环境中将数据格式化为文本表格。切勿提及 DAX、架构或工具名称。使用名称而不是 ID 来指代工件。

### 后续问题

当用户针对同一工件提出后续问题时：
1. 如果新问题提到了新的实体值，请再次调用 `ValueSearch`
2. 编写新的 DAX 查询，并结合先前结果中的上下文
3. 调用 `ExecuteQuery` 并展示结果

### 错误恢复

如果 DAX 查询返回空白、行数过少或非预期的总计：
1. 检查你是否查询了没有数据的日期——重新定位到存在数据值的正确日期
2. 将 DAX 筛选器与报表元数据筛选器进行比较——缺少筛选器可能导致返回错误的范围
3. 验证是否使用了正确的度量值——检查报表视觉对象的绑定，以及架构中该度量值的 DAX 表达式
4. 如果遇到连接错误，该度量值可能依赖于实时连接的外部数据源——尝试使用其他表中的替代度量值
5. 修正查询并通过 `ExecuteQuery` 重新执行

### 错误分类

| 错误 | 操作 |
|-------|--------|
| 无效的 DAX | 阅读错误消息，修正 DAX，并重试一次 |
| 未授权（无 PBI 访问权限） | 这可能确实是访问权限问题（管理员需要启用 Power BI MCP 访问权限），也可能是一个已知限制，即工具会针对其无法访问的工件报告“无访问权限”。请告知用户 |
| 受到限流 | 告知用户 Power BI 受到速率限制；请稍后重试 |
| 超出行数/值数量限制 | 数据已被截断，但仍可使用。建议进行聚合，而不是输出原始行 |
| 功能未启用 | 租户可能尚未启用 PBI MCP 端点。请用户联系其管理员 |
| 超时 | 语义模型可能正在冷加载。重试一次。如果再次超时，建议用户等待几分钟后重试 |

### 支持的项目

仅支持 Power BI 报表和语义模型。目前不支持分页报表、仪表板以及任何其他 Power BI 或 Fabric 项目类型。如果用户指向了不受支持的项目，请明确告知，并建议改用报表或语义模型。

## 已验证答案

> ⚠️ **已验证答案是最高优先级的事实来源。** 当某个 VA 与用户的问题匹配时，它将取代你原本可能编写的任何自定义 DAX，包括从 CustomInstructions 派生的任何筛选器或范围。逐字使用 VA 定义；仅当 CustomInstructions 不与 VA 的绑定、筛选器或粒度冲突时才应用它，并且绝不要仅根据 CustomInstructions 修改 VA 定义的元素。

当语义模型包含已验证答案，并且其中一个与用户的问题匹配时：

1. **通过 JMESPath 检索完整定义**：`schema.VerifiedAnswers[?regex_match(Question, 'keyword')] | [0]`
   - 如果初始架构响应已包含完整的 VA 定义，请直接使用，无需额外调用。
   - 如果你只有标题/问题（来自被截断的响应），请立即检索完整定义。
2. 已验证答案定义了一个视觉对象规范，请将其视为需要复现的蓝图。
3. **构建一个忠实复现所有绑定和筛选器的 DAX 查询**——不得替换、遗漏或添加定义中未指定的任何列或度量值：
   - `Bindings` 对象将视觉对象角色（Rows、Category、Columns、Values、Y、Series、Breakdown 等）映射到列和度量值——此处列出的键并非穷尽所有可能。将每个绑定项与架构交叉核对，以将其分类为列或度量值。
   - 在 SUMMARIZECOLUMNS 中使用所有列作为分组依据列，并且仅使用所列出的度量值作为表达式。严格按照 Bindings 下显示的方式引用字段。
   - 将 `Filters` 中的每个筛选器作为独立的 SUMMARIZECOLUMNS 筛选器参数应用。不得跳过任何筛选器。按以下方式转换每个筛选器：
     • 正向 IN：TREATAS({values}, table[col])
     • 所有其他条件（NOT IN、NOT NULL、IS BLANK、范围）：KEEPFILTERS(FILTER(ALL(table[col]), <condition>))
     • 多列元组筛选器：KEEPFILTERS(FILTER(ALL(table[col1], table[col2]), <condition>))
     切勿将多个列筛选器合并到单个 FILTER('table', ...) 中——由于自动存在机制，这会导致总计不正确。
   - 当视觉对象包含多个维度列时（例如矩阵中的 Rows + Columns），使用 ROLLUPADDISSUBTOTAL 为每个分组级别生成小计行。
4. 不要添加 VA 定义之外的筛选器；VA 筛选器构成完整且权威的筛选上下文。仅当用户明确请求 VA 中不存在的数据切片时，才添加筛选器（例如“仅显示 Contoso Ltd”）。如果 VA 省略了日期筛选器，则不要添加，即使结果为空也是如此。
5. 不要简化、遗漏度量值或更改粒度。按照 VA 绑定所定义的粒度呈现结果，不要重新聚合或汇总到更粗的级别。如果用户明确请求不同的范围、粒度或筛选器，请相应地覆盖 VA。
6. **层次结构查询（3 个以上分组列或高基数结果）：** 当 VA 包含高基数维度分组列时，完整的 ROLLUPADDISSUBTOTAL 结果可能会超出行数限制，从而截断重要的小计。使用两个并行查询：
   - **汇总查询：** 仅包含最上层的 1–2 个分组列（不使用 ROLLUPADDISSUBTOTAL）以及所有度量值。这可确保获得紧凑、完整且绝不会被截断的顶层视图。
   - **明细查询：** 使用包含所有分组列的完整 ROLLUPADDISSUBTOTAL。ORDER BY 应首先按小计标志 DESC 排序（例如 `IsLevel1Subtotal DESC, IsLevel2Subtotal DESC, …`），然后在每个级别内按主要值度量 DESC 排序。这可确保小计出现在叶级行之前，并在发生截断时得以保留。
   如果层次结构包含 4 个以上的分组级别，请考虑将明细查询限制在最上面的 3–4 个级别，或在每个级别使用 TOPN，以使结果保持在行数限制以内。并行调用这两个查询。
7. **行级明细 VA：** 当 VA 返回带有关键度量值的实体级行时，ORDER BY 应按该度量值排序，而不是按名称或 ID 排序。结果可能会因行数限制而被截断；必须确保最重要的行优先显示。

**已验证答案的定义优先于自定义指令。** 匹配到已验证答案时，其绑定、筛选器和粒度是唯一事实来源。不要根据自定义指令添加、删除或覆盖任何筛选器（例如，不要添加已验证答案中省略的默认时间范围筛选器）。已验证答案是在了解自定义指令的情况下编写的，并有意定义了自己的筛选上下文。

## JMESPath 查询示例

> **重要提示：** 仅在**后续调用**中使用 JMESPath `queries`——即首次不带 `queries` 的调用返回完整或截断的响应之后。切勿跳过首次完整调用而直接使用定向 JMESPath 查询。

### 用于 GetReportMetadata

| 用途 | 查询 |
|---------|-------|
| 页面和视觉对象标题概览 | `queries=["ReportMetadata.Pages \| { PageCount: length(@), Pages: @[0:20].{ Page: Title, VisualCount: length(Visuals), VisualTitles: Visuals[].Title } }"]` |
| 按关键字搜索视觉对象 | `queries=["ReportMetadata.Pages[].Visuals[?regex_match(to_string(@), 'revenue\|sales')] \| [] \| [:10]"]` |
| 提取报表和页面筛选器 | `queries=["{ ReportFilters: ReportMetadata.Filters, PageFilters: ReportMetadata.Pages[?Title == 'PAGE_TITLE'] \| [0].Filters }"]` |
| 查找报表定义的度量值 | `queries=["ReportMetadata.Measures[?regex_match(to_string(@), 'revenue\|target')] \| [0:10]"]` |

### 用于 GetSemanticModelSchema

| 用途 | 查询 |
|---------|-------|
| **获取已验证答案（截断时优先级 1）** | `queries=["schema.VerifiedAnswers[].{Title: Title, Question: Question}"]` |
| **获取自定义指令（截断时优先级 2）** | `queries=["schema.CustomInstructions"]` |
| 按关键字搜索度量值 | `queries=["schema.Tables[].Measures[?regex_match(to_string(@), 'revenue\|sales')].{Name: Name, Expression: Expression} \| []"]` |
| 获取表详细信息 | `queries=["schema.Tables[?Name == 'TABLE_NAME'].{Columns: Columns[].{Name: Name, Type: Type}, Measures: Measures[].{Name: Name, Expression: Expression}} \| [0]"]` |
| 按关键字搜索已验证答案 | `queries=["schema.VerifiedAnswers[?regex_match(to_string(@), 'revenue\|sales')] \| [:5].{Title: Title, Question: Question}"]` |
| 列出所有关系 | `queries=["schema.ActiveRelationships[].{PK: PK, FK: FK}"]` |

## DAX 规则

编写 DAX 查询时，请遵循以下严格规则：

### 查询结构
- 每个查询仅包含一个 `EVALUATE` 语句——绝不能包含多个
- 当 `EVALUATE` 返回多行时，始终包含 `ORDER BY` 子句
- 不要使用 `ORDERBY` 函数对最终查询结果进行排序
- 如果查询在 `EVALUATE` 之前包含 `VAR`、`MEASURE`、`COLUMN` 或 `TABLE` 定义，请在开头使用 `DEFINE`
- 使用 `DEFINE` 时，只能使用一个 `DEFINE` 块。各定义之间用换行分隔，不要使用逗号或分号
- 定义度量值时：始终使用其所属表完整限定度量值名称（例如，`DEFINE MEASURE 'TableName'[MeasureName] = ...`）。所属表必须存在于语义模型中
- 使用度量值时：仅按名称引用，不要使用表限定符（例如，`[MeasureName]`）

### CALCULATE / CALCULATETABLE 布尔筛选器
- 不能直接使用度量值或另一个 `CALCULATE` 函数——应先使用变量存储结果
- 不能引用来自两个不同表的列
- 涉及 `IN` 运算符时，表操作数必须是表变量，而不能是表表达式
- 不要将布尔筛选器赋值给 `VAR` 定义

### SUMMARIZECOLUMNS
- 参数顺序：分组依据列 → 筛选器 → 类似度量值的扩展列（均为可选参数，但必须遵循此顺序）
- 构建包含分组依据列和类似度量值的扩展列的汇总表时，默认使用此函数
- 如果没有类似度量值的扩展列，请勿使用（改用 `SUMMARIZE`）
- 仅返回至少有一个度量值不为 BLANK 的行
- 请勿使用布尔筛选器

### SUMMARIZE
- 仅用于：`SUMMARIZE(<table expression>, <column1>, ..., <columnN>)`
- 切勿与类似度量值的表达式一起使用——应改用 `SUMMARIZECOLUMNS`
- 要获取单列的非重复值，请使用 `VALUES('Table'[Column])`
- 当第一个参数是表变量时，应将列引用为 `[Column]`（而不是 `_TableVar[Column]`）

### GROUPBY
- 仅在第一个参数为表值变量时使用
- `CURRENTGROUP` 仅在 `GROUPBY` 内有效

### SELECTCOLUMNS
- 用于投影列（保留重复项）或重命名列
- 重命名后，后续表达式（`TOPN`、`ORDER BY`）必须使用新列名

### 其他规则
- 在 `SELECTCOLUMNS` 或 `CALCULATETABLE` 等表表达式中，包含下游操作（例如 `ORDER BY`、`FILTER`）所需的所有列
- 筛选器根据已定义的关系方向（单向或双向）沿关系传播
- 对于集合函数（`INTERSECT`、`UNION`、`EXCEPT`）：两个输入表的列数必须相同
- 如果用户未指定筛选器，请遵循应用于目标视觉对象的筛选器（视觉对象级 + 页面级 + 报表级），并在响应上下文中包含已应用的筛选器列表。
- 请勿借用任何其他视觉对象（同一页面或其他页面）的筛选器，即使它们看起来通用、具有防御性或类似数据清理规则；除非同一筛选器已在目标视觉对象上独立声明，或在页面级/报表级声明。
- 生成的 DAX 必须在逻辑上等效于适用的筛选器，并且不得添加任何会使结果超出这些筛选器影响范围的谓词。

### 时间智能的日期上下文
- 始终通过日期表中的分组依据列或显式日期筛选器建立有效的日期上下文
- 将 `ROW` 与时间智能计算结合使用时，应通过 `CALCULATETABLE` 提供外部筛选器，以建立明确的“当前日期”参照
- 切勿单独使用 `MAX('Calendar'[Date])`——它可能返回未来日期。应使用 `LASTNONBLANK`，或先使用 `[Measure] <> BLANK()` 进行筛选，再按日期排序

### 报表度量值
- 报表度量值定义在报表层，而不是语义模型中。要在 DAX 中使用报表度量值，请从 `GetReportMetadata` 获取其表达式，并使用 `DEFINE MEASURE` 在查询中重新定义。直接在 DAX 查询中按名称引用仅存在于报表中的度量值将会失败。

### 其他规则
- 使用 `TOPN` 进行排名。除非用户要求更多，否则默认最多返回 50 行
- 不支持 INFO 函数、DMV 查询和 MDX——仅支持 DAX
- 如果查询返回错误，请阅读错误消息，修正 DAX，然后重试一次

## 示例

### 发现并查询

**用户：** “Sales Benchmark 报告中收入最高的 5 个产品是什么？”

**智能体步骤：**
1. 调用 `DiscoverArtifacts`，searchQuery: "Sales Benchmark"
2. 选择 Report 项目 → 记下 `ArtifactId`
3. 使用报告 ID 调用 `GetReportMetadata`
4. 使用项目 ID 调用 `GetSemanticModelSchema`——检查已验证答案和自定义指令
5. 使用视觉对象的度量值、绑定和筛选器编写 DAX 查询
6. 使用项目 ID 和 DAX 查询调用 `ExecuteQuery`
7. 提供格式化后的答案

### 结合上下文进行后续查询

**用户：** “现在按地区细分”

**智能体步骤：**
1. 结合上一个查询的上下文编写新的 DAX 查询
2. 使用项目 ID 和新的 DAX 查询调用 `ExecuteQuery`
3. 提供格式化后的答案

### 值查找

**用户：** “预算情景下 Terra Firma 的销售额是多少？”

**智能体步骤：**
1. 使用项目 ID 和 searchTerms: ["Terra Firma", "Budget"] 调用 `ValueSearch`
2. 使用解析出的值作为筛选器编写 DAX 查询
3. 使用项目 ID 和 DAX 查询调用 `ExecuteQuery`
4. 提供格式化后的答案