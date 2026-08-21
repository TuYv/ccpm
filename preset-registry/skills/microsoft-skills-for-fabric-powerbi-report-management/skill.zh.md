---
name: powerbi-report-management
description: "Manage Power BI report workspace items and PBIR definitions in Microsoft Fabric via `az rest` CLI against the Fabric REST API. Use when the user wants to: (1) upload or publish a PBIR/report definition to Fabric, (2) get or download report definitions, (3) update report item definitions or properties, (4) list workspace reports, (5) delete reports. For editing PBIR files, pages, visuals, filters, themes, or formatting, use `powerbi-report-authoring`. For business questions over report data, use `fabriciq`. Triggers: upload PBIR report definition, upload Power BI report, download PBIR definition, publish PBIR definition, publish Power BI report to Fabric, manage Power BI reports, list workspace reports."
metadata:
  version: 0.1.0
---
> **遥测 — 强制要求。** 每次调用 `api.fabric.microsoft.com` 时都必须携带
> `x-ms-fabric-skill: powerbi-report-management`（`az rest`：`--headers "x-ms-fabric-skill=powerbi-report-management"`），
> 包括每次 LRO 轮询、`fabric_lro` 和重试。代码片段中省略了此项——但仍须添加。

> **关键说明**
> 1. 要根据工作区名称查找工作区详细信息（包括其 ID）：列出所有工作区，然后使用 JMESPath 筛选
> 2. 要根据工作区 ID、项类型和项名称查找项详细信息（包括其 ID）：列出该工作区中该类型的所有项，然后使用 JMESPath 筛选

# Power BI 报表管理

使用 `az rest` 调用 Fabric REST API，管理 Microsoft Fabric 工作区中的 Power BI 报表。此技能涵盖报表项及其 PBIR 定义的完整 CRUD 生命周期。

> **范围**：仅限报表项 CRUD 和定义管理。对于报表布局创作（页面、视觉对象、筛选器、格式设置），请使用 `powerbi-report-authoring`。

> **边界**：此技能负责在 Fabric 与外部之间传输 PBIR 定义。PBIR 内容创作仍由 `powerbi-report-authoring` 负责。

## 配套技能

此技能是划分 Power BI 创作范围的三个技能之一。
每个技能仅负责一类事项；请将工作交由正确的技能处理。

| 技能 | 负责内容 | 用途 |
|---|---|---|
| `powerbi-report-authoring` | 报表内容（PBIR JSON 创作） | 页面、视觉对象、筛选器、格式设置、主题、表达式、`definition.pbir`、`version.json`、`report.json` |
| `powerbi-report-management`（此技能） | 在 Fabric 与外部之间传输报表 | 列出、创建、获取、更新、删除报表项；下载/上传 PBIR 定义 |
| 语义模型创作技能 | 语义模型创作和部署 | 创建/编辑度量值、表和关系，处理 TMDL，将语义模型部署到 Fabric |

**将本地 `.pbip` 发布到 Fabric 时**，此技能是入口点。如果用户希望将本地语义模型与报表一同发布，此技能会将模型部署委派给可用的语义模型创作技能，然后解析生成的 `semanticModelId` 并将报表绑定到该模型。请参阅[发布本地 .pbip](#publishing-a-local-pbip)工作流。

## 工具栈

| 工具 | 角色 | 安装 |
|---|---|---|
| `az` CLI | **主要工具**：使用 `az rest` 调用 Fabric REST API，使用 `az login` 进行身份验证 | 大多数开发环境中已预安装 |
| `jq` | 解析和构造 JSON 有效负载 | 标准 CLI 工具——请参阅 [COMMON-CLI.md § 工具选择依据](../../common/COMMON-CLI.md#tool-selection-rationale) |
| `base64` | 为定义有效负载编码/解码 PBIR 文件内容 | Linux/macOS 内置 · Windows：使用 PowerShell `[Convert]::ToBase64String()` / `FromBase64String()` |

> **智能体检查**——首次操作前进行验证：
>
> ```bash
> az version 2>/dev/null || echo "INSTALL: https://learn.microsoft.com/cli/azure/install-azure-cli"
> ```

## 身份验证

所有调用都使用 Fabric API 受众。使用错误的受众会返回 401。

| API | 受众 (`--resource`) |
|---|---|
| Fabric Report Items API | `https://api.fabric.microsoft.com` |

有关共享身份验证模型、令牌受众和身份类型，请参阅
[COMMON-CORE.md § 身份验证与令牌获取](../../common/COMMON-CORE.md#authentication--token-acquisition)。

有关完整的身份验证方法（交互式、设备代码、服务主体、托管标识），
请参阅 [COMMON-CLI.md § 身份验证方法](../../common/COMMON-CLI.md#authentication-recipes)。

## 查找工作区和报表

> **共享模式** — 工作区和项目解析、分页以及 LRO 轮询
> 已在通用 Skill 库中记录。
> 在使用下面的 CRUD 操作**之前**，请阅读
> [COMMON-CLI.md § 在 Fabric 中查找工作区和项目](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric)。

### 按名称解析报表 ID

获取工作区 ID 后（按照 COMMON-CLI.md 中的说明），解析报表：

```bash
REPORT_NAME="Sales Report"
REPORT_ID=$(az rest --method get \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/workspaces/$WS_ID/reports" \
  --query "value[?displayName=='$REPORT_NAME'] | [0].id" \
  --output tsv)
```

## 示例：CRUD 操作

### 列出报表

返回工作区中的所有报表。

- **权限**：Viewer 工作区角色
- **作用域**：`Workspace.Read.All` 或 `Workspace.ReadWrite.All`

```bash
az rest --method get \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/workspaces/$WS_ID/reports" \
  --query "value[].{name:displayName, id:id, description:description}" \
  --output table
```

支持通过 `continuationToken` 查询参数进行分页。

### 获取报表（属性）

返回特定报表的属性（名称、说明、ID、工作区、敏感度标签）。

- **权限**：对报表的读取权限
- **作用域**：`Report.Read.All` 或 `Report.ReadWrite.All`

```bash
az rest --method get \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/workspaces/$WS_ID/reports/$REPORT_ID"
```

### 获取报表定义

下载完整的 PBIR 定义。这是一个 **POST** 操作（而不是 GET），并且支持 LRO。

- **权限**：对报表的读取和写入权限
- **作用域**：`Report.ReadWrite.All` 或 `Item.ReadWrite.All`
- **限制**：对于带有加密敏感度标签的报表，此操作会被阻止

**始终请求 `format=PBIR`** — 如果没有此参数，较旧的报表可能会
返回 PBIR-Legacy 格式（单个 `report.json` blob），而此 Skill
不支持该格式。

```bash
RESPONSE=$(az rest --method post \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/workspaces/$WS_ID/reports/$REPORT_ID/getDefinition?format=PBIR" \
  --verbose 2>&1)

# If 202 Accepted, extract operation ID and poll the LRO (see Long-Running Operations section)
# If 200 OK, the response contains the definition parts
```

> **格式检查**：检索定义后，请验证
> `definition.format == "PBIR"`。如果其值为 `"PBIR-Legacy"`，则此 Skill
> 不支持该格式。

#### 将定义部件解码到本地文件

> **注意**：`getDefinition` 通常会返回 `202 Accepted` (LRO)。请查看
> 长时间运行操作部分，提取操作 ID 并轮询
> 结果，然后再进行解码。

```bash
# After retrieving the definition (from 200 response or LRO result):
echo "$DEFINITION_JSON" | jq -r '.definition.parts[] | "\(.path)\t\(.payload)"' | \
  while IFS=$'\t' read -r path payload; do
    mkdir -p "$(dirname "./report-definition/$path")"
    echo "$payload" | base64 -d > "./report-definition/$path"
  done
```

### 创建报表（包含定义）

使用 PBIR 定义创建新报表。支持 LRO。

- **权限**：工作区参与者角色
- **作用域**：`Report.ReadWrite.All` 或 `Item.ReadWrite.All`

```bash
# Walk ./report-definition/ and build the parts[] array — every file under the
# directory is encoded and uploaded. Includes definition.pbir, report.json,
# version.json, pages/pages.json, every pages/<page>/page.json, and every
# pages/<page>/visuals/<visual>/visual.json.
PARTS=$(find ./report-definition -type f -not -name '.*' -not -name 'Thumbs.db' | while read -r file; do
  rel="${file#./report-definition/}"
  payload=$(base64 < "$file" | tr -d '\n')
  jq -nc --arg p "$rel" --arg b "$payload" \
    '{path:$p, payload:$b, payloadType:"InlineBase64"}'
done | jq -sc '.')

jq -n \
  --arg name "My New Report" \
  --arg desc "Created via Fabric API" \
  --argjson parts "$PARTS" \
  '{displayName:$name, description:$desc, definition:{parts:$parts}}' \
  > create-report.json

az rest --method post \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/workspaces/$WS_ID/reports" \
  --headers "Content-Type=application/json" \
  --body @create-report.json \
  --verbose 2>&1
```

> **PowerShell** — 使用 `Get-ChildItem -Recurse -File` 遍历目录，并使用
> `[Convert]::ToBase64String([System.IO.File]::ReadAllBytes($_.FullName))`
> 对每个文件进行编码（而不是使用 `base64 | tr -d '\n'`）。

> **重要提示**：始终需要 `definition.pbir`。上面的目录遍历会自动
> 包含 `./report-definition/` 下的每个文件——在编码之前，请确保
> 本地目录与完整的 PBIR 布局保持一致（包括顶层文件，以及所有
> `pages/<page>/page.json` 和 `pages/<page>/visuals/<visual>/visual.json`
> 文件）。

### 更新报表定义

覆盖整个定义。这是一个 **POST** 请求，并支持 LRO。

- **权限**：对报表的读取和写入权限
- **作用域**：`Report.ReadWrite.All` 或 `Item.ReadWrite.All`

```bash
# Rebuild parts[] from ./report-definition/ after edits (same walk as Create).
PARTS=$(find ./report-definition -type f -not -name '.*' -not -name 'Thumbs.db' | while read -r file; do
  rel="${file#./report-definition/}"
  payload=$(base64 < "$file" | tr -d '\n')
  jq -nc --arg p "$rel" --arg b "$payload" \
    '{path:$p, payload:$b, payloadType:"InlineBase64"}'
done | jq -sc '.')

jq -n --argjson parts "$PARTS" \
  '{definition:{parts:$parts}}' \
  > update-definition.json

az rest --method post \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/workspaces/$WS_ID/reports/$REPORT_ID/updateDefinition" \
  --headers "Content-Type=application/json" \
  --body @update-definition.json \
  --verbose 2>&1
```

> **关键提示**：`updateDefinition` 会替换**整个**定义。请包含
> 所有部分——无论已修改还是未修改。遗漏任何部分都会将其删除。

如果包含 `.platform` 文件，可使用可选查询参数 `?updateMetadata=true` 更新其中的项元数据。

### 更新报表（属性）

仅更新显示名称和/或描述（不更新定义）。

- **权限**：对报表的读取和写入权限
- **作用域**：`Report.ReadWrite.All` 或 `Item.ReadWrite.All`

```bash
cat > update-report.json << 'EOF'
{
  "displayName": "Renamed Report",
  "description": "Updated description"
}
EOF

az rest --method patch \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/workspaces/$WS_ID/reports/$REPORT_ID" \
  --headers "Content-Type=application/json" \
  --body @update-report.json
```

### 删除报表

删除报表。支持软删除（默认）和硬删除。

- **权限**：对报表的写入权限
- **作用域**：`Report.ReadWrite.All` 或 `Item.ReadWrite.All`

```bash
# Soft delete (recoverable)
az rest --method delete \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/workspaces/$WS_ID/reports/$REPORT_ID"

# Hard delete (permanent)
az rest --method delete \
  --resource "https://api.fabric.microsoft.com" \
  --url "https://api.fabric.microsoft.com/v1/workspaces/$WS_ID/reports/$REPORT_ID?hardDelete=true"
```

## 长时间运行的操作（LRO）

`Create Report`、`Get Report Definition` 和 `Update Report Definition` 可能会返回 `202 Accepted`，而不是立即返回结果。请从详细输出中获取 `x-ms-operation-id`，并按照 [COMMON-CLI.md § 长时间运行的操作](../../common/COMMON-CLI.md#long-running-operations-lro-pattern)中的说明进行轮询，直至操作达到终止状态。

发生冲突时，以下管理操作专用的防护规则优先于通用模式。

> **⚠️ 收到 202 后，切勿重试创建操作的 POST 请求。** `202 Accepted`
> 响应表示操作已被接受，并且很可能正在服务器端处理。
> 重试 POST 请求可能会创建重复项。
>
> **始终将 `--verbose` 输出写入文件**，以确保每次尝试都能可靠地捕获
> `x-ms-operation-id` 标头——这是跟踪操作的唯一可靠方法。
> 从内存字符串中使用正则表达式提取内容，在不同 shell 和平台上并不可靠。
> 捕获后，请像处理任何其他 LRO 调用一样轮询操作，直至其完成。
>
> ```powershell
> # PowerShell — reliable operation ID capture
> az rest --method post ... --verbose 2>&1 | Out-File "$env:TEMP\lro-response.txt" -Encoding utf8
> $opId = (Select-String -Path "$env:TEMP\lro-response.txt" -Pattern "x-ms-operation-id.*?'([a-f0-9-]+)'" | Select-Object -First 1).Matches.Groups[1].Value
> ```
>
> 作为最后的手段，如果即使写入文件后操作 ID 仍然丢失，
> 请列出工作区中的报表以查找已创建的报表——
> 但这不应作为常规处理方式。

有关更多详细信息，请参阅[长时间运行的操作](https://learn.microsoft.com/en-us/rest/api/fabric/articles/long-running-operation)。

## PBIR 定义结构

报表使用 PBIR 格式——即由 JSON 文件组成的文件夹：

```text
Report/
├── definition.pbir                              # Semantic model reference (required)
├── definition/
│   ├── report.json                              # Report-level settings (required)
│   ├── version.json                             # Format version (required)
│   ├── pages/
│   │   ├── pages.json                           # Page listing (required)
│   │   ├── <pageId>/
│   │   │   ├── page.json                        # Page layout
│   │   │   ├── visuals/
│   │   │   │   ├── <visualId>/
│   │   │   │   │   ├── visual.json              # Visual config
│   │   │   │   │   ├── mobile.json              # Mobile layout (optional)
│   ├── bookmarks/                               # Bookmarks (optional)
├── StaticResources/                             # Custom themes, images (optional)
```

API 负载中的所有部分均使用 `"payloadType": "InlineBase64"` 进行 base64 编码。

### definition.pbir — 语义模型引用

对于 Fabric API，请使用 `byConnection`（而不是 `byPath`）：

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/fabric/item/report/definitionProperties/2.0.0/schema.json",
  "version": "4.0",
  "datasetReference": {
    "byConnection": {
      "connectionString": "semanticmodelid=<SemanticModelId>"
    }
  }
}
```

## 必须/建议/避免

### 必须

- **所有 PBIR 内容都必须通过 `powerbi-report-authoring` skill 处理**——这是最重要的一条规则。无论是创建全新的报表还是修改现有报表，每个 PBIR 文件（`definition.pbir`、`report.json`、`version.json`、`pages.json`、页面配置、视觉对象、筛选器、格式设置、主题、表达式）都必须使用 `powerbi-report-authoring` 编写。请遵循其关于正确 PBIR 结构、架构和字段值的指导。使用其 CLI 工具进行验证。绝不要凭记忆或猜测构造任何 PBIR JSON——即使是像 `definition.pbir` 或 `version.json` 这样的“简单”文件也不例外。此 skill 严格用于 API 传输（下载、编码、上传）——它不负责编写 PBIR 内容。
- **始终向 `az rest` 传递 `--resource "https://api.fabric.microsoft.com"`**——省略它会导致无提示的身份验证失败。
- **始终在 `getDefinition` 上传递 `?format=PBIR`**——如果不传递，较旧的报表会返回此 skill 不支持的 PBIR-Legacy 格式。
- **仅使用 PBIR 格式**——如果返回的定义包含 `"format": "PBIR-Legacy"`，请停止操作并告知用户不支持 PBIR-Legacy。
- **在 `updateDefinition` 中包含所有定义部分**——包括已修改和未修改的部分。API 会替换整个定义；省略某些部分会将其删除。
- **对所有部分的负载进行 base64 编码**——每个 `payload` 值都必须经过 base64 编码。
- **在 Fabric API 的 `definition.pbir` 中使用 `byConnection`**——`byPath` 仅用于本地/Git 场景。
- **轮询 LRO 直至完成**——`Create`、`getDefinition` 和 `updateDefinition` 会返回 `202 Accepted`。持续轮询，直到进入终止状态。
- **在 LRO 操作中始终使用 `--verbose`**——默认情况下，`az rest` 不会公开响应标头。如果没有 `--verbose`，就无法捕获轮询所需的 `x-ms-operation-id` 标头，而且事后也没有其他方法可以获取该标头。
- **清理临时文件**——工作流完成后，删除在此过程中创建的所有本地临时目录和文件（已解码的定义、JSON 负载）。这些文件可能很大，并会在用户的计算机上不断累积。
- **解析出目标模型后，验证语义模型绑定**——一旦确定报表的目标语义模型（无论是通过可用的语义模型编写 skill 全新部署，还是选择现有的工作区模型），就下载其 TMDL，并将所有 PBIR 绑定（`Entity`、`queryRef`、`nativeQueryRef`、筛选器的 `Source`/`Entity` 引用）与模型的表、列和度量值名称进行比较。这适用于**两个**分支：即使是交接部署，也可能在发布期间重命名或转换模型，因此此差异比较不是可选步骤。如果名称不同，但模型在结构上等效（具有相同的列/度量值），请通过 `powerbi-report-authoring` 重新映射所有表限定绑定。如果模型在结构上不等效，请先提示用户，再尝试重新编写——说明哪些表、列或度量值不匹配，并询问是否继续。
- **默认情况下，本地编辑仅保留在本地**——当用户请求更改本地 `.pbip` 报表时，仅将更改应用于本地文件。除非用户明确要求发布、上传或推送报表，否则不要将其发布到 Fabric。即使该报表之前已发布到 Fabric，也应将后续编辑视为仅限本地，直到收到其他明确指示。**当用户确实请求发布本地 `.pbip` 时**，请遵循[发布本地 .pbip](#publishing-a-local-pbip)工作流：(a) 预先确认一次目标工作区；(b) 提示用户选择发布本地模型还是连接到现有工作区模型；(c) 在发布模型分支中，检查当前会话是否有可用的语义模型编写 skill，如果没有，则进行适当的降级处理；(d) 确认报表本身是新建还是更新现有报表。

### 推荐

- 优先使用**软删除**而非硬删除——这样可以恢复。
- 使用带有 JMESPath `--query` 的 **`az rest`** 进行筛选——内置 JSON 解析，无需额外工具。

### 避免

- **手动编写或直接构造 PBIR JSON**——无论是创建新文件还是修改现有文件，所有 PBIR 内容（`definition.pbir`、`report.json`、`version.json`、页面、视觉对象、筛选器、格式设置、主题、表达式）都必须通过 `powerbi-report-authoring` skill 处理。绝不能凭记忆或猜测构造任何 PBIR JSON——即使是“简单的”结构文件也不行。没有例外。
- **PBIR-Legacy 格式**——不要创建、读取或更新 PBIR-Legacy 定义。仅支持现代 PBIR 格式。
- 在 `updateDefinition` 中**仅发送修改过的部分**——该 API 会替换完整定义；未提供的部分将被删除。
- 在 API 有效负载的 `definition.pbir` 中**使用 `byPath`**——它仅适用于本地/Git 场景。
- **硬编码工作区/报表 ID**——应通过 List API 动态解析。
- **跳过 LRO 轮询**——定义操作可能是异步的；始终检查是否收到 202 响应。
- 在 `getDefinition` 中**省略 `?format=PBIR`**——可能会返回无法使用的 PBIR-Legacy 格式。
- **收到 202 后重试创建 POST 请求**——这可能会创建重复项。有关正确的恢复模式，请参阅 [LRO 部分](#long-running-operations-lro)。

## Agentic 工作流

### 发布本地 `.pbip`

当用户的磁盘上存在本地 `.pbip`（报表及其同级 `.SemanticModel`），并要求将该报表发布、上传、推送或部署到 Fabric 工作区时，这是主要入口点。

**1. 检测源是否为本地 `.pbip`。** 以下任一信号均可：

- 工作目录中或其上级目录中存在 `<Name>.pbip` 文件。
- 存在 `<Name>.Report` 文件夹，并且有一个同级的 `<Name>.SemanticModel` 文件夹。
- 报表的 `definition.pbir` 使用 `byPath`（本地/Git 形式），而非 `byConnection`（API 形式）。
- 存在 `.pbi/` 缓存文件夹。

如果源*不是*本地 `.pbip`（例如，报表已从 Fabric 下载，并且仅存在 `.Report` 文件夹，其中包含使用 `byConnection` 的 `definition.pbir`），则改用[修改 Fabric 中的现有报表](#modifying-an-existing-report-in-fabric)工作流。

**2. 确认一次目标工作区。** 按照 [COMMON-CLI.md](../../common/COMMON-CLI.md#finding-workspaces-and-items-in-fabric) 中的说明，通过名称解析并保存工作区 ID。此工作区同时用于模型部署（如适用）和报表发布——绝不能将两者拆分到不同工作区。

**3. 询问用户如何处理语义模型。** 必须明确询问——不要擅自选择：

> “你希望我也将本地语义模型发布到此工作区，还是将此报表连接到工作区中已有的语义模型？”

**4a. 分支：“发布本地模型”。**

- 检查当前会话中是否有可用的语义模型创作 skill。
  - **可用** → 转交给该工作流，以创建或更新语义模型。传入：目标工作区 ID、本地 `.SemanticModel` 文件夹路径（TMDL 源）以及所需的模型显示名称。等待该 skill 的工作流达到最终成功状态后再继续。
  - **不可用** → 告知用户，此会话中未加载语义模型创作 skill，因此无法发布本地模型。然后降级到分支 4b（连接到现有模型），并再次询问要将报表绑定到工作区中的哪个模型。

**4b. 分支：“连接到工作区中的现有模型”。**

- 列出目标工作区中的语义模型，并与用户确认目标
  模型。通过名称解析 `semanticModelId`。

**5. 解析 `semanticModelId`。** 无论采用哪个分支，报表都需要绑定到
一个具体的模型 ID：

- 完成 4a 后：列出目标工作区中的语义模型，并按名称找到
  刚刚部署的模型（模型 skill 会通过列出
  工作区项目进行验证，但不会返回 ID）。
- 完成 4b 后：此操作已完成。

**6. 根据已解析的模型验证绑定（通用，适用于两个
分支）。** 下载模型 TMDL，并按照
[解析目标模型后验证语义模型绑定](#must)这一“必须”要求运行绑定差异比较。
即使采用发布本地模型的分支，
模型 skill 也可能在部署期间重命名表或应用转换，因此
此差异比较并非可选操作。通过 `powerbi-report-authoring` skill
重新映射任何偏差；如果结构存在差异，则在重新创作前提示用户。

**7. 将 `definition.pbir` 从 `byPath` 重新绑定为 `byConnection`。** 使用
`powerbi-report-authoring` 设置：

```json
"datasetReference": {
  "byConnection": {
    "connectionString": "semanticmodelid=<resolved-id>"
  }
}
```

Fabric API 会拒绝 `byPath`；每次发布本地源时都必须进行此替换。

**8. 决定为报表新建还是更新现有报表。** 默认将报表
`displayName` 设置为不含扩展名的 `.pbip` 文件名（例如
`SalesDashboard.pbip` → `"SalesDashboard"`）。向用户展示该默认值，
以便用户可以覆盖它。

- 列出目标工作区中的报表，并查找所选的
  `displayName`。
  - **未找到** → 创建。按照
    [创建报表（包含定义）](#create-report-with-definition)操作。
  - **已找到** → 与用户确认：覆盖现有报表
    （`updateDefinition`）、使用其他名称发布，或取消。
    覆盖时按照[更新报表定义](#update-report-definition)操作。

**9. 编码并上传。** 运行现有传输流程——对所有
PBIR 部分进行 base64 编码（路径使用正斜杠！），构建 `parts` 负载，发起 POST 请求，
捕获 `x-ms-operation-id`（使用 `--verbose` 并将输出写入文件），轮询
LRO，直至最终成功。

**10. 清理**流程中创建的所有临时文件。

> **关于报表端验证的说明**：目前没有可靠的
> 编程方式可以确认报表在发布后是否正确呈现——
> 报表位于 Fabric 服务 URL，视觉对象呈现
> 需要浏览器会话。向用户提供工作区/报表 URL，以便
> 用户在浏览器中进行验证。

### 修改 Fabric 中的现有报表

1. **进行身份验证** → 参阅 [COMMON-CLI.md § 身份验证方法](../../common/COMMON-CLI.md#authentication-recipes)
2. **查找工作区** → 按名称解析工作区 ID
3. **列出/查找报表** → 按名称解析报表 ID
4. **下载定义** → `getDefinition?format=PBIR` → 轮询 LRO → 将各部分解码到本地文件
5. **创作 PBIR 内容** → 所有更改都**使用 `powerbi-report-authoring` skill**。这涵盖每个文件：`definition.pbir`、`report.json`、`version.json`、`pages.json`、页面配置、视觉对象、筛选器、格式设置、主题和表达式。遵循其关于正确结构、架构和字段值的指导。使用其 CLI 工具进行验证。切勿凭记忆构建或猜测任何 PBIR JSON。
6. **上传更改** → 将所有本地文件重新编码为 base64 → 使用所有部分（已修改 + 未修改）调用 `updateDefinition`
7. **清理** → 删除工作流期间创建的所有临时本地文件和目录

### 在 Fabric 中创建新报表

1. **身份验证** → 请参阅 [COMMON-CLI.md § 身份验证方法](../../common/COMMON-CLI.md#authentication-recipes)
2. **查找工作区** → 按名称解析工作区 ID
3. **解析语义模型** → 查找 `definition.pbir` 连接字符串所需的语义模型 ID 和工作区名称
4. **验证语义模型绑定** → 下载目标语义模型定义（TMDL），并将所有 PBIR `Entity`、`queryRef`、`nativeQueryRef` 和筛选器引用与目标表名/列名进行比较。如果名称不同但结构匹配，则重新映射所有表限定绑定。如果模型在结构上不同，请在继续操作前询问用户——说明不匹配之处，并询问是否要重新创作受影响的绑定
5. **创作 PBIR 内容** → **使用 `powerbi-report-authoring` skill** 从头生成完整的 PBIR 定义——`definition.pbir`、`report.json`、`version.json`、`pages.json`、页面配置以及所有视觉对象。绝不要凭记忆或猜测构造任何 PBIR JSON。
6. **上传** → 将所有文件编码为 base64 → 使用 `displayName` 和所有定义部分调用 `POST /reports`
7. **清理** → 删除临时本地文件

## 故障排除

| 错误 | 原因 | 修复方法 |
|---|---|---|
| `401 Unauthorized` | `--resource` 受众错误或缺失 | 始终传递 `--resource "https://api.fabric.microsoft.com"` |
| `403 Forbidden` | 权限不足 | 检查工作区角色（写入操作需要 Contributor 或更高权限） |
| `404 Not Found` | 工作区或报表 ID 错误 | 通过列表 API 重新解析 ID |
| `CorruptedPayload` | base64 格式错误或 PBIR JSON 无效 | 重新编码文件；编码前验证 JSON |
| `202` with no result | 未轮询 LRO 直至完成 | 实现 LRO 轮询模式 |
| `OperationNotSupportedForItem` | 报表具有加密的敏感度标签 | 无法获取加密报表的定义 |
| `ItemDisplayNameAlreadyInUse` | 工作区中存在重名项 | 使用唯一的显示名称 |
| `format: "PBIR-Legacy"` | 报表创建于 PBIR 成为默认格式之前 | 此 skill 不支持 PBIR-Legacy |
| 发布后视觉对象为空/无数据 | PBIR 实体名称与工作区语义模型的表名不匹配（例如，本地 CSV 表名与工作区表名不同） | 下载目标语义模型 TMDL，比较表名，更新所有 `Entity`、`queryRef`、`nativeQueryRef` 和筛选器引用以保持一致 |
| 创建/更新时出现 `MissingDefinitionParts`，即使已包含所有文件 | 定义部分路径使用了反斜杠（`definition\report.json`）——Fabric API 要求使用正斜杠。在 Windows 上，`path.join()` 默认生成反斜杠。 | 上传前将有效负载中的所有 `path` 值规范化为使用正斜杠（例如，在 Node.js 中使用 `.replace(/\\\\/g, '/')`，或在 PowerShell 中使用 `.Replace('\\', '/')`）。 |
| 创建后工作区中出现重复报表 | 收到 `202 Accepted` 响应后重试了创建 POST。每次重试都可能创建一份新报表。 | 收到 `202` 后绝不要重试创建 POST。有关可靠捕获操作 ID 和恢复步骤的信息，请参阅 [LRO 部分](#long-running-operations-lro)。使用删除报表 API 删除所有重复项。 |
| 通过模型交接发布本地 `.pbip` 后视觉对象为空 | 语义模型创作 skill 可能会在部署期间重命名或转换表/列，因此新部署模型的 TMDL 不再与报表的 PBIR 绑定匹配。 | 针对已部署模型重新运行 TMDL 差异验证（遵循 MUST [解析目标模型后验证语义模型绑定](#must)），并通过 `powerbi-report-authoring` skill 重新映射发生偏移的绑定。 |
| 发布后视觉对象为空，但 TMDL 差异检查无异常 | `definition.pbir` 中的 `byConnection` 仍指向过期的模型 ID（例如，来自 `.pbi/` 缓存或之前的发布），而非刚刚解析出的模型 ID。 | 重新执行[发布本地 .pbip](#publishing-a-local-pbip)的第 7 步，将 `byConnection` 设置为实际解析出的 `semanticModelId`，然后重新发布。 |
| 用户想要发布本地模型时，语义模型创作 skill 不可用 | 当前会话中未加载语义模型创作 skill。 | 告知用户并降级到连接现有模型的分支——再次询问要将报表绑定到哪个工作区模型。不要静默跳转。 |
| 模型发布到一个工作区，但报表 POST 到另一个工作区 | 未预先确认工作区，或模型部署和报表发布使用了两个不同的工作区。 | 强制执行单一工作区规则（[发布本地 .pbip](#publishing-a-local-pbip)的第 2 步）。恢复方法：将报表重新发布到模型所在的工作区，或移动模型。 |