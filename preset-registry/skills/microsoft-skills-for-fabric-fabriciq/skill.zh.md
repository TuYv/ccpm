---
name: fabriciq
description: "Answers natural-language business questions over existing Power BI reports and semantic models through the FabricIQ MCP endpoint, discovering artifacts, resolving entities, generating the DAX itself, and returning a plain-language answer. Use when the user asks a data question, including one that says to query the model directly. For DAX the user supplies, or measures to save, use semantic-model-authoring."
---
> **关键注意事项**
> 1. 要从搜索查询中查找工件详细信息（包括工件 ID）：使用 `DiscoverArtifacts` 和搜索词 — 不要调用工作区/项目列表 API
> 2. 要查找报表背后的语义模型：调用 `GetReportMetadata`，并从响应中提取模型 GUID
> 3. 当用户提供 Power BI URL 时：在继续操作前调用 `ResolveReportIdFromUrl`，以获取正确的报表 GUID

# Power BI 使用 — FabricIQ Skill

> ⚠️ **停止 — 在执行任何操作前，请完整阅读本文档。** 在阅读并理解下面的所有部分（包括 Workflow、DAX Rules、Verified Answers 和 Error Recovery）之前，不要开始编排工具调用。跳过部分内容会导致查询错误并遗漏指令。

你可以帮助用户分析 Power BI 数据。你负责编排每个步骤：发现工件、检查报表和模型架构、解析值以及执行查询。使用 FabricIQ MCP 服务器。

## 目录

| 任务 | 参考 | 备注 |
|---|---|---|
| Fabric 拓扑与关键概念 | [COMMON-CORE.md § Fabric 拓扑与关键概念](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | 层级结构；在 Fabric 中查找内容 |
| 环境 URL | [COMMON-CORE.md § 环境 URL](../../common/COMMON-CORE.md#environment-urls) | 生产环境（公有云） |
| 身份验证与令牌获取 | [COMMON-CORE.md § 身份验证与令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition) | 错误的 audience = 401；涵盖令牌 audience、委托权限与应用权限、OAuth 流程、身份类型以及 Entra 应用注册 |
| 身份验证配方 | [COMMON-CLI.md § 身份验证配方](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程、环境检测、令牌获取和调试 |
| 易错点、最佳实践与故障排除 | [COMMON-CORE.md § 易错点、最佳实践与故障排除](../../common/COMMON-CORE.md#gotchas-best-practices--troubleshooting) | 常见错误；最佳实践 |
| 必须/优先/避免 | [SKILL.md § 必须/优先/避免](#mustpreferavoid) | Power BI 使用的防护规则 |
| 工作流 | [SKILL.md § 工作流](#workflow) | FabricIQ 编排步骤 |

## 可用工具

| 工具 | 用途 |
|------|---------|
| `DiscoverArtifacts(searchQuery, artifactTypes?, maxResults?)` | 根据自由文本搜索 Power BI 报表和语义模型。当用户未提供工件 GUID 或 Power BI URL 时，首先调用。最多返回 50 个结果。优先选择报表，而不是独立的语义模型 |
| `ResolveReportIdFromUrl(url)` | 当用户粘贴的 Power BI 或 Fabric URL 中的报表 ID 尚未解析时调用。对于工作区-App URL（`.../groups/me/apps/<appId>/reports/<reportId>`）来说是必需的，因为路径级别的 reportId 是每个应用实例的 ID，而不是已发布报表的 GUID |
| `GetReportMetadata(reportObjectId=<guid>)` | 获取报表页面、视觉对象、筛选器和工作区信息。支持可选的 `queries` 参数（JMESPath 字符串），用于投影出精简的子集 — 仅当先前调用返回的是概览/摘要而不是完整数据时才传入 queries。首次调用时省略 queries，以查看完整元数据 |
| `GetSemanticModelSchema(artifactId=<guid>)` | 获取表/列/度量值定义、关系、自定义 AI 指令和已验证答案。支持可选的 `queries` 参数（JMESPath）。首次调用时省略 queries，以查看完整架构 |
| `ValueSearch(artifactId, searchTerms, scope?)` | 在针对命名实体（客户、产品、区域等）编写 DAX 筛选器之前调用。返回要用于筛选的列和精确值，确保 DAX 不会猜测规范拼写 |
| `ExecuteQuery(artifactId=<guid>, daxQueries=[...], maxRows?)` | 执行 1–4 个 DAX 查询（每个条目一个 EVALUATE），并返回表格结果。每个查询默认返回 250 行，最多返回 1,000 行。如果需要超过默认值，请设置 `maxRows` |

## 必须/优先/避免

### 必须执行

- **在生成查询之前完整读取元数据和架构** — 始终完整读取 `GetReportMetadata` 和 `GetSemanticModelSchema` 工具的结果，然后再继续。遵循这些工具提供的所有指示（例如 CustomInstructions、VerifiedAnswers）。不要跳过、略读或只读部分结果 — 其中包含正确生成 DAX 所需的关键上下文
- **始终遵循 Custom Instructions** — 语义模型中的 CustomInstructions 是强制性规则。完整阅读这些指示，并将其应用于你编写的每条 DAX 查询（例如默认日期筛选器、必需的度量值、命名规则）。如果架构被截断，请在编写任何 DAX 之前，通过 JMESPath 获取 CustomInstructions
- **在编写自定义 DAX 之前始终检查已验证答案** — 读取架构后，扫描所有已验证答案的标题和问题，检查是否与用户的问题在语义上匹配。如果存在匹配项，请使用该答案。当已验证答案涵盖相同意图时，不要编写临时 DAX
- **以数据源为边界** — 绝不编造事实或使用外部数据；只能依赖 Power BI 成果
- **始终先进行发现** — 除非你已经拥有成果 ID，否则调用 `DiscoverArtifacts`
- **绝不编造数据** — 只能使用工具返回的结果
- **精简分析 DAX** — 尽早聚合和筛选；优先使用足以完成任务的最小行集
- **洞察优先于结构** — 当用户要求“总结报表”时，他们需要的是数据洞察，而不是布局描述。始终运行查询以获取实际数据

### 优先

- 优先使用报表而非语义模型。查看报表视觉对象中的度量值和绑定，而不是直接使用原始架构中的度量值
- 默认应用报表、页面和视觉对象筛选器 — 仅当用户指定了不同条件时才省略或调整这些筛选器
- 回答清晰、简洁、非技术化 — 先给出结论，并使用 **粗体** 突出关键数字
- 使用 `ValueSearch` 返回的已解析值来帮助构建准确的 DAX 筛选器
- 只要可能，就使用图标展示进度：🔍 📊 📝

### 避免

- 使用尚未确认存在于数据中的值来编写 DAX 筛选器
- 在终端环境中使用图像 — 使用文本表格和 Unicode 格式
- 在面向用户的回答中提及 DAX、架构或工具名称

## 工作流

1. **识别成果** —
   - 如果用户分享了 Power BI URL，请调用 `ResolveReportIdFromUrl(url)`，除非平台已经将该成果预注册为 `[rpt_N]` / `[dataset_N]`（此时直接使用对应的 GUID）。`ResolveReportIdFromUrl` 是将工作区-App 报表 URL 映射到底层已发布报表 GUID 的唯一可靠方式
   - 否则调用 `DiscoverArtifacts(searchQuery=<keywords from user request>)`
   - 如果存在多个高度匹配的候选项，将它们展示给用户，并请用户选择
   - 对于“列出我的所有报表”这类枚举意图（没有特定关键词），使用宽泛的词调用 `DiscoverArtifacts` — 告知用户结果是最匹配的项目，而不是完整列表
   - **报表 ID ≠ 语义模型 ID** — `GetReportMetadata` 需要报表 GUID（`reportObjectId`），而 `GetSemanticModelSchema`、`ExecuteQuery` 和 `ValueSearch` 需要语义模型 GUID（`artifactId`）。`DiscoverArtifacts` 会返回这两种不同成果类型及其各自的 ID。从报表开始时，先调用 `GetReportMetadata` — 其响应中的 `semanticModel` 字段包含底层语义模型 ID，然后将该 ID 传递给架构/查询工具

2. **检查报表** — 如果该工件是报表，请先调用 `GetReportMetadata(reportObjectId=...)`，**不要使用 `queries` 参数**，以获取完整响应。这样可以全面了解页面、视觉对象、绑定和筛选器。只有在初始响应被截断，或需要深入查看某个特定切片时，才在后续调用中使用 JMESPath `queries`。查询报表数据时，默认始终在 DAX 查询中应用报表筛选器、页面筛选器以及相关视觉对象筛选器。不要跳过任何报表级筛选器——即使所引用的表或列未出现在架构中（某些表处于隐藏状态，但仍是正确筛选所必需的）。使用 `TREATAS` 应用此类筛选器；例如，如果报表元数据显示 `'Budget'[Scenario]` 的取值为 `('Actual', 'Forecast')`，但 `Budget` 不在架构中，则应用：`TREATAS({"Actual", "Forecast"}, 'Budget'[Scenario])`。当用户的问题明确与某个筛选器冲突时（例如，报表筛选为 year=2022，而用户询问 2023），请在 DAX 中覆盖冲突维度上的该筛选器，保留其他所有筛选器，并在回答中披露这一覆盖操作。如果意图不明确——该问题既可能表示“我想查看不同的切片”，也可能表示“你的报表筛选器有误”——请在运行查询前询问用户希望采用哪种方式。

3. **分析架构** — 调用 `GetSemanticModelSchema(artifactId=...)` 时，**不要使用 `queries` 参数**，以先获取完整架构。这样可以全面了解表、列、度量值、关系、CustomInstructions 和 VerifiedAnswers。**读取并保留所有 VerifiedAnswers 条目（标题、问题、绑定）**——在下一步以及整个会话期间进行匹配时都需要使用这些信息。只有在初始响应被截断（正文中出现警告文本或紧凑摘要），且需要投影特定切片时，才在后续调用中使用 JMESPath `queries`。**当架构被截断时，在继续之前，必须完整获取 VerifiedAnswers 和 CustomInstructions——没有例外。** 请按以下顺序优先获取：(1) VerifiedAnswers — `schema.VerifiedAnswers`，(2) CustomInstructions — `schema.CustomInstructions`，(3) 与用户问题相关的表/度量值。不得跳过 (1) 或 (2) 中的任何一项——两者都是正确生成 DAX 所必需的。

   **Custom Instructions（强制要求——在生成任何 DAX 之前完整阅读）：** CustomInstructions 是由语义模型所有者编写的领域特定规则。它们可能定义：默认时间范围、首选度量值、命名约定、筛选要求、计算覆盖规则或业务逻辑约束。**必须阅读并遵循所有 CustomInstructions**——它们决定应如何为此模型编写 DAX。如果架构被截断且无法看到 CustomInstructions，请在编写任何 DAX 之前调用 `GetSemanticModelSchema`，并使用 `queries=["schema.CustomInstructions"]` 获取它们。除非匹配的 Verified Answer 与之冲突，否则应将 CustomInstructions 应用于每个查询——VA 定义优先于特定查询的 CustomInstructions（该 VA 是在了解 Custom Instructions 的基础上编写的，并有意定义了自身的筛选上下文）。绝不要使用 CustomInstruction 向 VA 定义的查询添加、移除或覆盖筛选器。

4. **检查已验证答案（MANDATORY — 在编写任何自定义 DAX 之前执行此操作）** — 扫描每个已验证答案的 Title 和 Question，判断其与用户问题在语义上是否相似。如果用户的问题涉及**相同的指标、实体、维度或分析意图**，则该已验证答案就匹配——即使措辞不同（同义词、改写、不同粒度的表达方式）。匹配示例："revenue by region" ↔ "sales breakdown by geography"；"top customers" ↔ "biggest accounts by spend"。**当任何已验证答案高度匹配时，必须使用该答案**——遵循下方的已验证答案规则。不要跳过此步骤，也不要在存在匹配的已验证答案时继续编写自定义 DAX。如果完整的架构响应被截断，无法看到完整的 VerifiedAnswers 列表，请调用 `GetSemanticModelSchema`，并使用 `queries=["schema.VerifiedAnswers[].{Title: Title, Question: Question}"]` 获取所有已验证答案的标题，然后再继续。

5. **解析实体值** — 如果用户指定了具体值（特定客户、产品、区域等），请在构造 DAX 筛选器之前，针对语义模型调用 `ValueSearch(artifactId=<model guid>, searchTerms=[<value>])`。

6. **编写 DAX** — 根据架构编写 DAX；在适用时，将查询范围限定为报表视觉对象所使用的列和度量值。优先使用模型中定义的度量值，而不是临时编写的 CALCULATE。

7. **查询** — 使用 `daxQueries` 调用 `ExecuteQuery`（包含 1–4 个条目）。在同一次调用中并行运行相互独立的查询。

8. **验证** — 如果查询返回 BLANK 或意外的空结果，请检查架构、度量值和筛选器，并最多重试一次，使用修正后的 DAX。

9. **回答** — 综合结果，提供带有数据引用的清晰答案。先给出结论，关键数字使用 **粗体**，在终端环境中将表格格式化为文本表格。绝不要提及 DAX、架构或工具名称。按名称而不是 ID 引用工件。

### 后续问题

当用户针对同一工件提出后续问题时：
1. 如果新问题提到了新的实体值，再次调用 `ValueSearch`
2. 编写一个结合先前结果上下文的新 DAX 查询
3. 调用 `ExecuteQuery` 并展示结果

### 错误恢复

如果 DAX 查询返回空值、行数很少或总计异常：
1. 检查查询的日期是否没有数据 — 重新定位到有值的正确日期
2. 将 DAX 筛选器与报表元数据筛选器进行比较 — 缺少筛选器可能导致返回错误范围的结果
3. 验证使用的度量值是否正确 — 检查报表视觉对象的绑定关系以及架构中的度量值 DAX 表达式
4. 如果出现连接错误，该度量值可能依赖实时连接的外部数据源 — 尝试使用其他表中的替代度量值
5. 修正查询，并通过 `ExecuteQuery` 重新执行

### 错误分类

| 错误 | 操作 |
|-------|--------|
| 无效 DAX | 阅读错误消息，修正 DAX，并重试一次 |
| 未授权（无 PBI 访问权限） | 这可能是真实的访问权限问题（管理员需要启用 Power BI MCP 访问权限），也可能是已知限制：对于无法访问的工件，该工具会报告“无访问权限”。告知用户这一情况 |
| 受到限制 | 告知用户 Power BI 已受到速率限制；稍后再试 |
| 超出行数/值数量限制 | 数据已被截断，但仍可使用。建议进行聚合，而不是倾倒原始行数据 |
| 功能未启用 | 租户上可能未启用 PBI MCP 终结点。请用户联系管理员 |
| 超时 | 语义模型可能正在冷加载。重试一次。如果再次超时，建议用户几分钟后重试 |

### 支持的项目

仅支持 Power BI 报表和语义模型。目前不支持分页报表、仪表板以及任何其他 Power BI 或 Fabric 项目类型。如果用户指向了不受支持的项目，请说明这一点，并建议改用报表或语义模型。

## 已验证答案

> ⚠️ **已验证答案是最高优先级的事实来源。** 当某个已验证答案与用户的问题匹配时，它优先于你原本可能编写的任何自定义 DAX——包括从 CustomInstructions 派生的任何筛选器或范围。逐字使用已验证答案的定义；仅在 CustomInstructions 与已验证答案的绑定、筛选器或粒度不冲突时应用 CustomInstructions，并且绝不能仅根据 CustomInstructions 修改已验证答案中定义的元素。

当语义模型包含已验证答案，且其中一个与用户的问题匹配时：

1. 通过 JMESPath 获取完整定义：`schema.VerifiedAnswers[?regex_match(Question, 'keyword')] | [0]`
   - 如果初始 schema 响应已经包含完整的已验证答案定义，则直接使用——无需额外调用。
   - 如果你只有标题/问题（来自截断的响应），现在获取完整定义。
2. 已验证答案定义了一个视觉对象规范——将其视为需要复现的蓝图。
3. **构建能够忠实复现所有绑定和筛选器的 DAX 查询**——不得替换、遗漏或添加定义中未指定的任何列或度量值：
   - `Bindings` 对象将视觉对象角色（Rows、Category、Columns、Values、Y、Series、Breakdown 等）映射到列和度量值——键的列表并不详尽。将每个绑定项与 schema 交叉引用，以确定它是列还是度量值。
   - 使用所有列作为 `SUMMARIZECOLUMNS` 中的分组列，并且只使用所列出的度量值作为表达式。严格按照 `Bindings` 中的显示方式引用字段。
   - 将 `Filters` 中的每个筛选器作为单独的 `SUMMARIZECOLUMNS` 筛选器参数应用。每个筛选器按以下方式转换：
     • Positive IN：`TREATAS({values}, table[col])`
     • 所有其他条件（NOT IN、NOT NULL、IS BLANK、范围）：`KEEPFILTERS(FILTER(ALL(table[col]), <condition>))`
     • 多列元组筛选器：`KEEPFILTERS(FILTER(ALL(table[col1], table[col2]), <condition>))`
     不要将多个列筛选器合并到单个 `FILTER('table', ...)` 中——这会因自动存在导致错误的总计。
   - 当视觉对象具有多个维度列（例如矩阵中的 Rows + Columns）时，使用 `ROLLUPADDISSUBTOTAL` 为每个分组级别生成小计行。
4. 除已验证答案定义中的筛选器外，不要添加其他筛选器；已验证答案中的筛选器构成完整且权威的筛选上下文。仅当用户明确请求已验证答案中不存在的数据切片时，才添加筛选器（例如“只显示 Contoso Ltd”）。如果已验证答案省略了日期筛选器，则不要添加日期筛选器——即使结果为空。
5. 不要简化、遗漏度量值或更改粒度。按照已验证答案绑定所定义的粒度呈现结果——不要重新聚合，也不要汇总到更粗的级别。如果用户明确请求不同的范围、粒度或筛选器，则相应覆盖已验证答案。
6. **层级查询（3 个或更多分组列，或高基数结果）：** 当已验证答案包含高基数维度分组列时，完整的 `ROLLUPADDISSUBTOTAL` 结果可能超过行数限制，从而截断重要的小计。使用两个并行查询：
   - **汇总查询：** 仅包含前 1–2 个分组列（不使用 `ROLLUPADDISSUBTOTAL`）以及所有度量值。这可以确保得到紧凑、完整的顶层视图，且不会被截断。
   - **详细查询：** 使用包含所有分组列的完整 `ROLLUPADDISSUBTOTAL`。首先按小计标志降序排序（例如 `IsLevel1Subtotal DESC, IsLevel2Subtotal DESC, …`），然后在每个级别内按主要数值度量值降序排序。这样可以确保小计出现在叶级行之前，并在结果截断时保留下来。
   如果层级包含 4 个或更多分组级别，请考虑将详细查询限制在前 3–4 个级别，或使用每个级别的 TOPN，以使结果保持在行数限制以内。并行调用两个查询。
7. **行级详细信息已验证答案：** 当某个已验证答案返回带有关键度量值的实体级行时，按该度量值排序——不要按名称或 ID 排序。结果可能会被截断到行数限制；最重要的行必须排在最前面。

**已验证答案定义优先于自定义指令。** 匹配到已验证答案时，其绑定、筛选器和粒度是唯一事实来源。不要根据自定义指令添加、删除或覆盖任何筛选器（例如，不要添加 VA 中省略的默认时间范围筛选器）。VA 的编写者已了解自定义指令，并有意定义了其自身的筛选器上下文。

## JMESPath 查询示例

> **重要：** 仅在**后续调用**中使用 JMESPath `queries`——即在不带 `queries` 的初始调用返回完整响应或截断响应之后。绝不要跳过初始完整调用，直接使用定向 JMESPath 查询。

### 对于 GetReportMetadata

| 用途 | 查询 |
|---------|-------|
| 查看页面和视觉对象标题的概览 | `queries=["ReportMetadata.Pages \| { PageCount: length(@), Pages: @[0:20].{ Page: Title, VisualCount: length(Visuals), VisualTitles: Visuals[].Title } }"]` |
| 按关键字搜索视觉对象 | `queries=["ReportMetadata.Pages[].Visuals[?regex_match(to_string(@), 'revenue\|sales')] \| [] \| [:10]"]` |
| 提取报表和页面筛选器 | `queries=["{ ReportFilters: ReportMetadata.Filters, PageFilters: ReportMetadata.Pages[?Title == 'PAGE_TITLE'] \| [0].Filters }"]` |
| 查找报表定义的度量值 | `queries=["ReportMetadata.Measures[?regex_match(to_string(@), 'revenue\|target')] \| [0:10]"]` |

### 对于 GetSemanticModelSchema

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
- 每个查询只包含一个 `EVALUATE` 语句——绝不要包含多个
- 当 `EVALUATE` 返回多行时，始终包含 `ORDER BY` 子句
- 不要使用 `ORDERBY` 函数对最终查询结果排序
- 如果查询在 `EVALUATE` 之前包含 `VAR`、`MEASURE`、`COLUMN` 或 `TABLE` 定义，请在开头使用 `DEFINE`
- 使用 `DEFINE` 时，只使用一个 `DEFINE` 块。各个定义之间用换行分隔，不要使用逗号或分号
- 定义度量值时：始终使用其所属表完整限定度量值名称（例如，`DEFINE MEASURE 'TableName'[MeasureName] = ...`）。所属表必须存在于语义模型中
- 使用度量值时：仅通过名称引用，不要添加表限定符（例如，`[MeasureName]`）

### CALCULATE / CALCULATETABLE 布尔筛选器
- 不能直接使用度量值或另一个 `CALCULATE` 函数——请先使用变量存储结果
- 不能引用来自两个不同表的列
- 涉及 `IN` 运算符时，表操作数必须是表变量，而不能是表表达式
- 不要将布尔筛选器赋值给 `VAR` 定义

### SUMMARIZECOLUMNS
- 参数顺序：分组列 → 筛选器 → 类度量值扩展列（全部可选，但必须遵循此顺序）
- 将其作为使用分组列和类度量值扩展构建汇总表时的默认选项
- 不要在没有类度量值扩展列的情况下使用（改用 `SUMMARIZE`）
- 仅返回至少有一个度量值不为 BLANK 的行
- 不要使用布尔筛选器

### SUMMARIZE
- 仅用于：`SUMMARIZE(<table expression>, <column1>, ..., <columnN>)`
- 永远不要与类度量值表达式一起使用——应改用 `SUMMARIZECOLUMNS`
- 若要获取单列的非重复值，请使用 `VALUES('Table'[Column])`
- 当第一个参数是表变量时，请将列引用为 `[Column]`（而不是 `_TableVar[Column]`）

### GROUPBY
- 仅当其第一个参数为表值变量时使用
- `CURRENTGROUP` 仅在 `GROUPBY` 中有效

### SELECTCOLUMNS
- 用于投影列（保留重复项）或重命名列
- 重命名后，后续表达式（`TOPN`、`ORDER BY`）必须使用新的列名

### 其他规则
- 在 `SELECTCOLUMNS` 或 `CALCULATETABLE` 等表表达式中包含下游所需的所有列（例如 `ORDER BY`、`FILTER` 中所需的列）
- 筛选器会根据定义的方向（单向或双向）通过关系传播
- 对于集合函数（`INTERSECT`、`UNION`、`EXCEPT`）：两个输入表必须具有完全相同的列数
- 如果用户未指定筛选器，请遵循应用于目标视觉对象的筛选器（视觉对象级别 + 页面级别 + 报表级别），并在响应上下文中包含已应用的筛选器列表。
- 不要借用任何其他视觉对象（同一页面或其他页面）中的筛选器，即使这些筛选器看起来是通用的、防御性的或类似数据清理规则，除非同一筛选器已在目标视觉对象上或页面/报表级别独立声明。
- 生成的 DAX 必须与适用的筛选器在逻辑上等价，不得添加任何会使结果超出这些筛选器影响范围的谓词。

### 时间智能的日期上下文
- 始终通过日期表中的分组列或显式日期筛选器建立有效的日期上下文
- 使用 `ROW` 进行时间智能计算时，通过 `CALCULATETABLE` 提供外部筛选器，以建立明确的“当前日期”引用
- 永远不要单独使用 `MAX('Calendar'[Date])`——它可能返回未来日期。请使用 `LASTNONBLANK`，或先使用 `[Measure] <> BLANK()` 进行筛选，再按日期排序

### 报表度量值
- 报表度量值定义在报表层，而不是语义模型中。要在 DAX 中使用报表度量值，请从 `GetReportMetadata` 获取其表达式，并使用 `DEFINE MEASURE` 将其内联重新定义。在 DAX 查询中按名称引用仅存在于报表中的度量值将失败。

### 其他规则
- 使用 `TOPN` 进行排名。除非用户要求更多行，否则默认最多返回 50 行
- 不支持 INFO 函数、DMV 查询和 MDX — 仅支持 DAX
- 如果查询返回错误，请阅读错误消息，修正 DAX，然后重试一次

## 示例

### 发现和查询

**用户：**“在 Sales Benchmark 报表中，按收入排名前 5 的产品是什么？”

**Agent 步骤：**
1. 使用 searchQuery: "Sales Benchmark" 调用 `DiscoverArtifacts`
2. 选择 Report 工件 → 记录 `ArtifactId`
3. 使用报表 ID 调用 `GetReportMetadata`
4. 使用工件 ID 调用 `GetSemanticModelSchema` — 检查已验证答案和自定义说明
5. 使用视觉对象的度量值、绑定和筛选器编写 DAX 查询
6. 使用工件 ID 和 DAX 查询调用 `ExecuteQuery`
7. 展示格式化后的答案

### 带上下文的后续问题

**用户：**“现在按区域细分”

**Agent 步骤：**
1. 结合上一次查询的上下文编写新的 DAX 查询
2. 使用工件 ID 和新的 DAX 查询调用 `ExecuteQuery`
3. 展示格式化后的答案

### 值查找

**用户：**“预算场景下 Terra Firma 的销售额是多少？”

**Agent 步骤：**
1. 使用工件 ID 和 searchTerms: ["Terra Firma", "Budget"] 调用 `ValueSearch`
2. 使用解析出的值作为筛选器编写 DAX 查询
3. 使用工件 ID 和 DAX 查询调用 `ExecuteQuery`
4. 展示格式化后的答案