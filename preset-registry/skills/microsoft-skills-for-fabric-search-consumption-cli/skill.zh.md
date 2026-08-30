---
name: search-consumption-cli
description: "Finds Fabric items across every workspace with the Catalog Search API when the workspace is unknown, locating an item by display name, inventorying one item type tenant-wide, and returning the workspace and item IDs later calls need. Dataflow Gen1 and Gen2 items are not supported. Use only to locate items; once found, query them with the owning item skill such as sqldw-cli, spark-cli, eventhouse-cli or fabriciq."
---
> **遥测 — 强制要求。** 每次 `api.fabric.microsoft.com` 调用都必须携带
> `x-ms-fabric-skill: search-consumption-cli`（`az rest`：`--headers "x-ms-fabric-skill=search-consumption-cli"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了该标头 — 仍必须添加。

> **关键注意事项**
> 1. Catalog Search API 查找的是**项目**，而不是工作区。若要按名称查找工作区，请使用 `GET /v1/workspaces`（参见 [COMMON-CLI.md § 按名称解析工作区属性](../../common/COMMON-CLI.md#resolve-workspace-properties-by-name)）。
> 2. 搜索文本会匹配项目的**显示名称**、**说明**和**工作区名称**。
> 3. 不支持 Dataflow (Gen1) 和 Dataflow (Gen2)。

# Catalog Search — CLI 技能

## 前置知识

- [COMMON-CORE.md](../../common/COMMON-CORE.md) — Fabric REST API 模式、身份验证
- [COMMON-CLI.md](../../common/COMMON-CLI.md) — CLI 实现（az、curl、jq）

## 目录

| 任务 | 参考 | 备注 |
|---|---|---|
| 搜索项目 | [SKILL.md § 搜索项目](#search-for-an-item) | 按名称、说明或工作区名称 |
| 列出某类型的所有项目 | [SKILL.md § 列出某类型的所有项目](#list-all-items-of-a-type) | 空搜索 + 类型筛选器 |
| 分页 | [SKILL.md § 分页](#pagination) | 延续令牌模式 |
| 代理工作流 | [SKILL.md § 代理工作流](#agentic-workflow) | |
| 示例 | [SKILL.md § 示例](#examples) | |
| 易错点和故障排除 | [SKILL.md § 易错点和故障排除](#gotchas-and-troubleshooting) | |

---

## 必须/优先/避免

### 必须执行

- **先进行身份验证** — 参见 [COMMON-CORE.md § 身份验证和令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition) 和 [COMMON-CLI.md § 身份验证方案](../../common/COMMON-CLI.md#authentication-recipes)。Catalog Search API 要求 `Catalog.Read.All` 作用域。
- **将 JSON 请求正文写入临时文件** — 避免筛选字符串产生 shell 引号问题。
- **消除歧义** — 如果有多个结果匹配，请提供显示名称、类型和工作区名称，并要求用户确认。

### 优先执行

- **优先使用 Catalog Search，而不是先列出再筛选** — 一次跨工作区调用，无需先解析工作区。
- **类型筛选器** — 使用 `"filter": "Type eq 'Lakehouse'"` 缩小结果范围，减少噪声。
- **使用带类型筛选器的空搜索** — 列出所有工作区中的某一类型的所有项目。
- 使用 **`jq`** 从响应中提取 ID — 对嵌套的 `hierarchy.workspace` 而言，比 JMESPath 更简洁。

### 避免

- **搜索工作区** — Catalog Search API 返回的是项目，而不是工作区。请改用 `GET /v1/workspaces`（参见 [COMMON-CLI.md § 按名称解析工作区属性](../../common/COMMON-CLI.md#resolve-workspace-properties-by-name)）。
- **在工作区/项目已知后查询源数据** — 应转到特定工作负载的消费技能（`sqldw-cli`、`spark-cli`、`eventhouse-cli` 或 `fabriciq`），而不是使用 Catalog Search。
- **臆造筛选器语法** — 仅支持 `eq`、`ne`、`or` 和括号。
- **假定所有项目类型都受支持** — 当前不会返回 Dataflow (Gen1) 和 Dataflow (Gen2)。

---

## 搜索项目

```bash
cat > /tmp/body.json << 'EOF'
{"search": "SalesLakehouse", "filter": "Type eq 'Lakehouse'", "pageSize": 10}
EOF
az rest --method post \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/catalog/search" \
  --body @/tmp/body.json
```

搜索文本会匹配项目显示名称、说明和工作区名称。类型筛选是可选的。对于每个匹配项，响应会包含 `id`、`type`、`displayName`、`description` 和 `hierarchy.workspace`（包含 `id` 和 `displayName`）。

### 提取项目和工作区 ID

```bash
az rest --method post \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/catalog/search" \
  --body @/tmp/body.json \
  --query "value[0].{itemId:id, workspaceId:hierarchy.workspace.id, name:displayName}" \
  --output json
```

---

### 筛选示例

| 目标 | 筛选条件 |
|---|---|
| 仅限湖仓 | `Type eq 'Lakehouse'` |
| 报表或语义模型 | `Type eq 'Report' or Type eq 'SemanticModel'` |
| 排除笔记本 | `Type ne 'Notebook'` |

有关支持的项目类型完整列表，请参阅 [Catalog Search API 参考](https://learn.microsoft.com/en-us/rest/api/fabric/core/catalog/search)。

---

## 列出某一类型的所有项目

使用空搜索字符串和类型筛选条件（`pageSize` 最大值为 1000）：

```bash
cat > /tmp/body.json << 'EOF'
{"search": "", "filter": "Type eq 'Lakehouse'", "pageSize": 100}
EOF
az rest --method post \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/catalog/search" \
  --body @/tmp/body.json
```

---

## 分页

如果响应包含非 null 的 `continuationToken`，请在下一次请求中传递它：

```bash
cat > /tmp/body.json << 'EOF'
{"search": "", "filter": "Type eq 'Lakehouse'", "pageSize": 100, "continuationToken": "<token>"}
EOF
az rest --method post \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/catalog/search" \
  --body @/tmp/body.json
```

持续执行，直到 `continuationToken` 为 null。

---

## 智能代理工作流

1. **询问** — 用户提供项目名称、类型或描述关键词。
2. **搜索** — 使用用户输入和可选的类型筛选条件调用 Catalog Search。
3. **消歧** — 如果有多个匹配项，则展示结果（名称、类型、工作区），并请用户选择。
4. **返回** — 提供搜索结果，并包含项目 `id` 和 `hierarchy.workspace.id`，供后续使用。

---

## 示例

### 查找特定报表
```bash
cat > /tmp/body.json << 'EOF'
{"search": "Monthly Sales Revenue", "filter": "Type eq 'Report'", "pageSize": 10}
EOF
az rest --method post \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/catalog/search" \
  --body @/tmp/body.json \
  --query "value[].{name:displayName, type:type, workspace:hierarchy.workspace.displayName}" \
  --output table
```

### 列出所有工作区中的语义模型
```bash
cat > /tmp/body.json << 'EOF'
{"search": "", "filter": "Type eq 'SemanticModel'", "pageSize": 1000}
EOF
az rest --method post \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/catalog/search" \
  --body @/tmp/body.json
```

### 将搜索结果保存到文件
```bash
cat > /tmp/body.json << 'EOF'
{"search": "", "filter": "Type eq 'Lakehouse'", "pageSize": 1000}
EOF
az rest --method post \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/catalog/search" \
  --body @/tmp/body.json \
  --query "value[].{name:displayName, type:type, workspace:hierarchy.workspace.displayName, id:id}" \
  --output json > /tmp/search_results.json
```

---

## 常见问题与故障排查

| 症状 | 原因 | 修复方法 |
|---|---|---|
| `401 Unauthorized` | Token audience 错误或会话已过期 | 验证 `--resource "https://api.fabric.microsoft.com"`。运行 `az login`。 |
| `InvalidPageSize` | `pageSize` 超出 1–1000 的范围 | 使用 1 到 1000 之间的值。 |
| `InvalidFilter` | 筛选器语法错误 | 仅支持 `eq`、`ne`、`or` 和括号。不要将 `eq` 与 `and` 混用，也不要将 `ne` 与 `or` 混用。不要在同一个筛选器中混用 `eq` 和 `ne`。 |
| `TypeNotFound` | 筛选器中的项目类型无法识别 | 检查拼写（区分大小写）。有效类型请参阅 [API reference](https://learn.microsoft.com/en-us/rest/api/fabric/core/catalog/search)。 |
| `FilterTooManyValues` | 筛选器包含超过 500 个值 | 减少筛选器中的类型值数量。 |
| `InvalidRequest` | 缺少请求正文 | 确保 `--body` 指向有效的 JSON 文件。 |
| 已知项目的结果为空 | 不支持该项目类型 | Dataflow Gen1/Gen2 不包含在内。请改用 `GET /v1/workspaces/{id}/items`。 |
| 找不到新项目 | Catalog 索引传播延迟 | 索引延迟具有不确定性，目前还不是近实时的——通常需要几分钟，但不作保证。刚创建的项目可能尚未出现在搜索结果中；请改用 `GET /v1/workspaces/{id}/items` 验证其是否存在。 |
| 结果过多 | 搜索文本过于宽泛 | 添加类型筛选器，或使用更具体的搜索文本。 |
|