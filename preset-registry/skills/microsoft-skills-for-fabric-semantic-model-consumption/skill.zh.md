---
name: semantic-model-consumption
description: >
  Execute raw DAX queries and inspect metadata of Microsoft Fabric Power BI semantic models via the MCP server ExecuteQuery tool.
  Use when the user already knows the DAX to write, wants to run EVALUATE statements, or needs to inspect model metadata
  (tables, columns, measures, relationships, hierarchies) using INFO functions.
  For natural-language business questions (where you generate the DAX), use `fabriciq`.
  For creating, deploying, or managing semantic model definitions, use `semantic-model-authoring`.
  Triggers: "run DAX query", "execute EVALUATE", "semantic model metadata", "list semantic model tables",
  "INFO.VIEW.TABLES", "get measure expression", "DAX against", "query the model".
---
> **更新检查 — 每个会话一次（强制）**
> 此技能在一个会话中首次使用时，请先运行 **check-updates** 技能，然后再继续。
> - **GitHub Copilot CLI / VS Code**：调用 `check-updates` 技能。
> - **Claude Code / Cowork / Cursor / Windsurf / Codex**：比较本地与远程的 package.json 版本。
> - 如果本会话早些时候已执行过此检查，则跳过。

> **关键注意事项**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项目类型和项目名称查找项目详细信息（包括其 ID）：列出该工作区中该类型的所有项目，然后使用 JMESPath 筛选

# Power BI 语义模型使用

## 目录

| 任务 | 参考资料 | 备注 |
|---|---|---|
| 在 Fabric 中查找工作区和项目 | [COMMON-CLI.md § 在 Fabric 中查找工作区和项目](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) | **强制** — *请先阅读链接* [根据名称查找工作区 ID，或根据名称、项目类型和工作区 ID 查找项目 ID 时需要] |
| Fabric 拓扑与关键概念 | [COMMON-CORE.md § Fabric 拓扑与关键概念](../../common/COMMON-CORE.md#fabric-topology--key-concepts) | 层次结构；在 Fabric 中查找内容 |
| 环境 URL | [COMMON-CORE.md § 环境 URL](../../common/COMMON-CORE.md#environment-urls) | 生产环境（公有云） |
| 身份验证与令牌获取 | [COMMON-CORE.md § 身份验证与令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition) | 受众错误 = 401；涵盖令牌受众、委托权限与应用权限、OAuth 流程、身份类型以及 Entra 应用注册 |
| 核心控制平面 REST API | [COMMON-CORE.md § 核心控制平面 REST API](../../common/COMMON-CORE.md#core-control-plane-rest-apis) | 包括工作区/项目 CRUD、按名称解析、分页、LRO 轮询和速率限制模式 |
| OneLake 数据访问 | [COMMON-CORE.md § OneLake 数据访问](../../common/COMMON-CORE.md#onelake-data-access) | 需要 `storage.azure.com` 令牌，而非 Fabric 令牌；涵盖 URL 结构、ADLS Gen2 对等功能和快捷方式 |
| 作业执行 | [COMMON-CORE.md § 作业执行](../../common/COMMON-CORE.md#job-execution) | 运行按需作业；获取/取消作业 |
| 容量管理 | [COMMON-CORE.md § 容量管理](../../common/COMMON-CORE.md#capacity-management) | 列出容量；将工作区分配给容量 |
| 注意事项、最佳实践与故障排除 | [COMMON-CORE.md § 注意事项、最佳实践与故障排除](../../common/COMMON-CORE.md#gotchas-best-practices--troubleshooting) | 常见错误；最佳实践 |
| 工具选择依据 | [COMMON-CLI.md § 工具选择依据](../../common/COMMON-CLI.md#tool-selection-rationale) ||
| 身份验证方案 | [COMMON-CLI.md § 身份验证方案](../../common/COMMON-CLI.md#authentication-recipes) | `az login` 流程、环境检测、令牌获取和调试 |
| 通过 `az rest` 使用 Fabric 控制平面 API | [COMMON-CLI.md § 通过 `az rest` 使用 Fabric 控制平面 API](../../common/COMMON-CLI.md#fabric-control-plane-api-via-az-rest) | **始终传递 `--resource`**；包括工作区/项目操作、分页和 LRO 模式 |
| 通过 `curl` 访问 OneLake 数据 | [COMMON-CLI.md § 通过 `curl` 访问 OneLake 数据](../../common/COMMON-CLI.md#onelake-data-access-via-curl) | 使用 `curl`，而非 `az rest`（令牌受众不同）；文件列表/读取/上传/删除和目录创建 |
| SQL / TDS 数据平面访问 | [COMMON-CLI.md § SQL / TDS 数据平面访问](../../common/COMMON-CLI.md#sql--tds-data-plane-access) | `sqlcmd` (Go) 连接、查询、CSV 导出、服务主体身份验证和连接参数发现 |
| 作业执行（CLI） | [COMMON-CLI.md § 作业执行](../../common/COMMON-CLI.md#job-execution) | 运行笔记本/管道、刷新语义模型、检查/取消作业 |
| OneLake 快捷方式 | [COMMON-CLI.md § OneLake 快捷方式](../../common/COMMON-CLI.md#onelake-shortcuts) | 创建快捷方式；列出快捷方式；删除快捷方式 |
| 容量管理（CLI） | [COMMON-CLI.md § 容量管理](../../common/COMMON-CLI.md#capacity-management) | 列出容量；将工作区分配给容量 |
| 组合方案 | [COMMON-CLI.md § 组合方案](../../common/COMMON-CLI.md#composite-recipes) | 端到端工作区→湖屋→文件、SQL 终结点→查询和笔记本执行方案 |
| 注意事项与故障排除（CLI 特定） | [COMMON-CLI.md § 注意事项与故障排除（CLI 特定）](../../common/COMMON-CLI.md#gotchas--troubleshooting-cli-specific) ||
| 快速参考 | [COMMON-CLI.md § 快速参考](../../common/COMMON-CLI.md#quick-reference) | `az rest` 模板；令牌受众 ↔ CLI 工具矩阵 |
| 先决条件 | [SKILL.md § 先决条件](#prerequisites) ||
| 必须/优先/避免 | [SKILL.md § 必须/优先/避免](#mustpreferavoid) | 只读语义模型使用的防护规则。必须执行；优先；避免 |
| 元数据发现 | [SKILL.md § 元数据发现](#metadata-discovery) | INFO.VIEW.* 和 INFO.* 函数。 |
| 建议的发现顺序 | [SKILL.md § 建议的发现顺序](#recommended-discovery-order) | 元数据探索的首选顺序 |
| 常用 INFO 函数 | [SKILL.md § 常用 INFO 函数](#frequently-used-info-functions) | 首轮发现的常用函数列表 |
| 完整 INFO 函数目录（动态） | [discovery-queries.md § 完整 INFO 函数目录（动态）](./references/discovery-queries.md#complete-info-function-catalog-dynamic) ||
| 元数据对象 → INFO 函数映射 | [SKILL.md § 元数据对象 → INFO 函数映射](#metadata-object--info-function-map) | 用于以对象为中心进行发现的内联映射 |
| 查询执行 | [SKILL.md § 查询执行](#query-execution) | ExecuteQuery 使用形式 |
| 故障排除 | [SKILL.md § 故障排除](#troubleshooting) | 解决常见的执行和元数据问题 |
| 示例 | [SKILL.md § 示例](#examples) | 元数据查询示例；数据查询示例 |
| 范围估算查询 | [discovery-queries.md § 范围估算查询](./references/discovery-queries.md#scope-estimation-queries) ||
| INFO 输出列 | [discovery-queries.md § INFO 输出列](./references/discovery-queries.md#info-output-columns) | INFO.VIEW.*（首轮元数据发现的首选）；关键 INFO.*（深度元数据/诊断） |
| 缩小结果范围（投影 + 筛选） | [discovery-queries.md § 缩小结果范围（投影 + 筛选）](./references/discovery-queries.md#narrowing-results-projection--filtering) ||
| 深度元数据查询 | [discovery-queries.md § 深度元数据查询](./references/discovery-queries.md#deep-metadata-queries) ||
| 依赖项发现 | [discovery-queries.md § 依赖项发现](./references/discovery-queries.md#dependency-discovery) | DAX 查询的依赖项行集；限定到某个度量值的依赖项行；反向依赖项（引用某个度量值的对象） |

## 前置条件

- [COMMON-CORE.md](../../common/COMMON-CORE.md) — Fabric 概念、身份验证和控制平面 API 上下文。
- [COMMON-CLI.md](../../common/COMMON-CLI.md) — 面向 CLI 的发现流程以及令牌/受众模式。

## 必须/建议/避免

### 必须执行

- **调用 MCP 工具进行发现和执行** — 使用 `DiscoverArtifacts` 查找语义模型 GUID，并使用 `ExecuteQuery` 运行 DAX 查询。这些是 MCP 工具调用，而不是 shell 命令。请勿使用 `az rest`、`Get-Command` 或 PowerShell 脚本来发现或调用它们。
- 保持此技能为只读：仅执行元数据发现和分析型 DAX 查询。
- 将 DAX 数据查询和 `INFO.VIEW.*` 视为任何拥有语义模型读取权限的用户均可使用；假定其他 `INFO.*` 函数可能需要更高权限。
- 动态解析工作区和语义模型项的标识；不要硬编码 ID。
- 在编写数据查询之前，使用 DAX `INFO.VIEW.*` / `INFO.*` 进行元数据发现。

### 建议

- 在迭代优化查询之前，尽早验证语义模型范围（`artifactId`）。
- 渐进式发现语义模型架构：使用经过筛选和投影的 `INFO.VIEW.*` / `INFO.*` 调用（例如 `SELECTCOLUMNS` + `FILTER`），仅获取与当前任务直接相关的信息，而不是预先检索完整架构。请参阅 [discovery-queries.md § 缩小结果范围（投影 + 筛选）](./references/discovery-queries.md#narrowing-results-projection--filtering)。
- 保持指南与提供商无关，以降低工具端点迁移的风险。

### 避免

- 在此技能中执行模型更改操作。

## 推荐的发现顺序

1. 在深入发现之前，运行 [discovery-queries.md § 范围估算查询](./references/discovery-queries.md#scope-estimation-queries)，以估算元数据范围（表、列、度量值和关系的数量）。
2. 从 `INFO.VIEW.TABLES()` 开始，以快速获取表清单。
3. 扩展到 `INFO.VIEW.COLUMNS()` 和 `INFO.VIEW.MEASURES()`，以获取语义详细信息。
4. 使用 `INFO.VIEW.RELATIONSHIPS()` 验证联接和筛选行为。
5. 使用 [discovery-queries.md](./references/discovery-queries.md) 中的完整查询目录了解更深入的模式。

## 常用 INFO 函数

- `INFO.VIEW.TABLES`
- `INFO.VIEW.MEASURES`
- `INFO.VIEW.COLUMNS`
- `INFO.VIEW.RELATIONSHIPS`
- `INFO.PARTITIONS`
- `INFO.MODEL`
- `INFO.STORAGETABLECOLUMNSEGMENTS`
- `INFO.DEPENDENCIES`
- `INFO.EXPRESSIONS`
- `INFO.ROLES`
- `INFO.STORAGETABLECOLUMNS`
- `INFO.CALCULATIONGROUPS`
- `INFO.CALCULATIONITEMS`
- `INFO.CULTURES`
- `INFO.OBJECTTRANSLATIONS`
- `INFO.USERDEFINEDFUNCTIONS`
- `INFO.REFRESHPOLICIES`
- `INFO.ATTRIBUTEHIERARCHYSTORAGES`
- `INFO.COLUMNPARTITIONSTORAGES`
- `INFO.COLUMNSTORAGES`
- `INFO.DICTIONARYSTORAGES`
- `INFO.HIERARCHYSTORAGES`
- `INFO.PARTITIONSTORAGES`
- `INFO.RELATIONSHIPINDEXSTORAGES`
- `INFO.RELATIONSHIPSTORAGES`
- `INFO.SEGMENTMAPSTORAGES`
- `INFO.SEGMENTSTORAGES`
- `INFO.STORAGEFOLDERS`
- `INFO.STORAGEFILES`
- `INFO.TABLESTORAGES`
- `INFO.GENERALSEGMENTMAPSEGMENTMETADATASTORAGES`
- `INFO.DELTATABLEMETADATASTORAGES`
- `INFO.PARQUETFILESTORAGES`
- `INFO.STORAGETABLES`

## 元数据对象 → INFO 函数映射

| 元数据对象 | 主要 INFO 函数 |
|---|---|
| 模型 | `INFO.MODEL` |
| 表 | `INFO.VIEW.TABLES` |
| 列 | `INFO.VIEW.COLUMNS`, `INFO.GROUPBYCOLUMNS`, `INFO.RELATEDCOLUMNDETAILS` |
| 度量值 | `INFO.VIEW.MEASURES`, `INFO.FORMATSTRINGDEFINITIONS`, `INFO.DETAILROWSDEFINITIONS` |
| 关系 | `INFO.VIEW.RELATIONSHIPS` |
| 分区 | `INFO.PARTITIONS`, `INFO.EXPRESSIONS`, `INFO.QUERYGROUPS`, `INFO.REFRESHPOLICIES`, `INFO.DATACOVERAGEDEFINITIONS` |
| 安全角色和权限 | `INFO.ROLES`, `INFO.TABLEPERMISSIONS`, `INFO.COLUMNPERMISSIONS` |
| 层次结构 | `INFO.HIERARCHIES`, `INFO.LEVELS`, `INFO.ATTRIBUTEHIERARCHIES`, `INFO.VARIATIONS` |
| 计算组/计算项 | `INFO.CALCULATIONGROUPS`, `INFO.CALCULATIONITEMS`, `INFO.CALCULATIONEXPRESSIONS` |
| 透视 | `INFO.PERSPECTIVES`, `INFO.PERSPECTIVETABLES`, `INFO.PERSPECTIVECOLUMNS`, `INFO.PERSPECTIVEHIERARCHIES`, `INFO.PERSPECTIVEMEASURES` |
| 日历 | `INFO.CALENDARS`, `INFO.CALENDARCOLUMNGROUPS`, `INFO.CALENDARCOLUMNREFERENCES` |
| 区域性 | `INFO.CULTURES` |
| 对象翻译 | `INFO.OBJECTTRANSLATIONS` |
| 函数 | `INFO.USERDEFINEDFUNCTIONS` |
| 依赖项/血缘 | `INFO.DEPENDENCIES`, `INFO.CHANGEDPROPERTIES`, `INFO.EXCLUDEDARTIFACTS` |
| 存储内部信息/大小 | `INFO.STORAGEFOLDERS`, `INFO.STORAGEFILES`, `INFO.TABLESTORAGES`, `INFO.COLUMNSTORAGES`, `INFO.PARTITIONSTORAGES`, `INFO.SEGMENTMAPSTORAGES`, `INFO.DICTIONARYSTORAGES`, `INFO.COLUMNPARTITIONSTORAGES`, `INFO.SEGMENTSTORAGES`, `INFO.RELATIONSHIPSTORAGES`, `INFO.RELATIONSHIPINDEXSTORAGES`, `INFO.ATTRIBUTEHIERARCHYSTORAGES`, `INFO.HIERARCHYSTORAGES`, `INFO.GENERALSEGMENTMAPSEGMENTMETADATASTORAGES`, `INFO.DELTATABLEMETADATASTORAGES`, `INFO.PARQUETFILESTORAGES`, `INFO.STORAGETABLES`, `INFO.STORAGETABLECOLUMNS`, `INFO.STORAGETABLECOLUMNSEGMENTS` |

## 查询执行

直接使用 **FabricIQ MCP 服务器**工具——以 MCP 工具调用的方式调用它们：

| 参数 | 说明 |
|-----------|-------------|
| `artifactId` | 目标语义模型的 GUID |
| `daxQueries` | 包含 1–4 个 DAX 查询的数组（每个查询必须包含单个 `EVALUATE` 语句） |
| `maxRows` | 可选。默认值为 250，每个查询最多返回 1,000 行 |

### 如何查找项目 ID

1. **首选方式**：调用 `DiscoverArtifacts`（MCP 工具），将 `searchQuery` 设置为模型名称，并设置 `artifactTypes: ["SemanticModel"]`。
2. **仅当 MCP 发现功能不可用时才使用后备方式**：通过 Fabric REST（`az rest`）进行解析——列出工作区中类型为 `SemanticModel` 的项目，并按 `displayName` 进行筛选。

### 执行查询

直接调用 `ExecuteQuery` MCP 工具：

```
ExecuteQuery(
  artifactId = "<SEMANTIC_MODEL_GUID>",
  daxQueries = ["EVALUATE SUMMARIZECOLUMNS(...)"]
)
```

### 先获取架构

在编写 DAX 之前，调用 `GetSemanticModelSchema(artifactId = "<SEMANTIC_MODEL_GUID>")` 以检索表、列和度量值定义。

## 故障排除

- **MCP 服务器中没有可用的 ExecuteQuery 功能**
  - **问题：** 由于当前工具列表中没有 `ExecuteQuery`，无法开始执行查询。
  - **原因：** FabricIQ MCP 服务器尚未注册、尚未加载，或当前客户端会话中的工具元数据已过期。
  - **解决方法：** 检查当前有效的 MCP 服务器/工具清单，并确认已公开 `ExecuteQuery`。
- **高级 INFO 函数返回权限错误**
  - **问题：** 针对 `INFO.*` 的查询因授权或特权相关错误而失败。
  - **原因：** 许多 `INFO.*` 函数需要高于标准读取访问权限的语义模型权限。
  - **解决方法：** 从面向读取发现的 `INFO.VIEW.*` 函数开始。
- **元数据输出量过大，无法进行聚焦分析**
  - **问题：** 返回完整的元数据行集会引入过多属性，并占用工作上下文。
  - **原因：** 无限制的 `INFO.VIEW.*` 和 `INFO.*` 查询会返回广泛的对象/属性范围，而这些信息对于当前任务通常并非必需。
  - **解决方法：** 使用 [discovery-queries.md § 范围估算查询](./references/discovery-queries.md#scope-estimation-queries)中的范围估算查询来估算范围并检查输出架构，然后按照 [discovery-queries.md § 缩小结果范围（投影 + 筛选）](./references/discovery-queries.md#narrowing-results-projection--filtering)中的说明，通过投影和筛选来缩小结果范围。
- **不要使用 `INFO` DAX 函数检索角色成员身份**
  - **问题：** `INFO.ROLEMEMBERSHIPS()` 返回空结果或不完整的结果。
  - **原因：** 角色成员在部署后于服务级别（Entra ID）进行分配，而不是在模型定义中分配——因此 DAX `INFO` 函数无法可靠地显示这些成员。
  - **解决方法：** 请参阅[管理角色成员身份文档](https://learn.microsoft.com/en-us/fabric/security/service-admin-row-level-security#manage-role-membership)，了解有关角色成员身份管理的最新指南。

## 示例

有关完整的查询目录（包括依赖关系模式），请参阅 [discovery-queries.md](./references/discovery-queries.md)。

### 元数据查询示例

```dax
EVALUATE
INFO.VIEW.TABLES()
ORDER BY [Name]
```

### 数据查询示例

```dax
DEFINE
MEASURE 'Sales'[Total Sales] = SUM('Sales'[Amount])
EVALUATE
SUMMARIZECOLUMNS(
    'Customer'[Customer Name],
    "Total Sales", [Total Sales]
)
ORDER BY [Total Sales] DESC
```