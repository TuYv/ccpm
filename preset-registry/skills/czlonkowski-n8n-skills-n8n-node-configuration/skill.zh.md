---
name: n8n-node-configuration
description: Operation-aware node configuration guidance. Use when configuring nodes, understanding property dependencies, determining required fields, choosing between get_node detail levels, or learning common configuration patterns by node type. Always use this skill when setting up node parameters — it explains which fields are required for each operation, how displayOptions control field visibility, and when to use patchNodeField for surgical edits vs full node updates.
---
# n8n 节点配置

针对依赖属性的、了解操作的节点配置专家指南。

---

## 配置理念

**渐进式披露**：从最少配置开始，按需增加复杂度

配置最佳实践：
- `get_node` 搭配 `detail: "standard"` 是最常用的发现模式
- 配置编辑之间的平均间隔为 56 秒
- 通过 1-2K tokens 的响应覆盖 95% 的使用场景

**关键洞察**：大多数配置只需要标准详情，而不是完整架构！

---

## 核心概念

### 1. 了解操作的配置

**并非所有字段始终都是必需的**——这取决于操作！

**示例**：Slack 节点
```javascript
// For operation='post'
{
  "resource": "message",
  "operation": "post",
  "channel": "#general",  // Required for post
  "text": "Hello!"        // Required for post
}

// For operation='update'
{
  "resource": "message",
  "operation": "update",
  "messageId": "123",     // Required for update (different!)
  "text": "Updated!"      // Required for update
  // channel NOT required for update
}
```

**关键点**：资源 + 操作决定哪些字段是必需的！

### 2. 属性依赖关系

**字段会根据其他字段的值显示或隐藏**

**示例**：HTTP Request 节点
```javascript
// When method='GET'
{
  "method": "GET",
  "url": "https://api.example.com"
  // sendBody not shown (GET doesn't have body)
}

// When method='POST'
{
  "method": "POST",
  "url": "https://api.example.com",
  "sendBody": true,       // Now visible!
  "body": {               // Required when sendBody=true
    "contentType": "json",
    "content": {...}
  }
}
```

**机制**：displayOptions 控制字段可见性

### 3. 渐进式发现

**使用恰当的详情级别**：

1. **get_node({detail: "standard"})** - 默认
   - 快速概览（约 1-2K tokens）
   - 必需字段 + 常用选项
   - **优先使用**——可覆盖 95% 的需求

2. **get_node({mode: "search_properties", propertyQuery: "..."})**（用于查找特定字段）
   - 按名称查找属性
   - 查找身份验证、正文、标头等内容时使用

3. **get_node({detail: "full"})**（完整架构）
   - 所有属性（约 3-8K tokens）
   - 仅在标准详情不足时使用

---

## 配置工作流

### 标准流程

1. 确定节点类型和操作。
2. 使用 `get_node`（默认使用标准详情）。
3. 配置必需字段。
4. 验证配置。
5. 如果某个字段不明确 → `get_node({mode: "search_properties"})`。
6. 按需添加可选字段。
7. 再次验证。
8. 部署。

### 示例：配置 HTTP Request

实际操作中的验证驱动循环：从最少配置（`method`、`url`、`authentication`）开始，然后让每个 `validate_node` 错误提示下一个必需字段（POST 操作需要 `sendBody` → 当 `sendBody=true` 时需要 `body`），直到配置有效。完整的分步演练请参阅 **[OPERATION_PATTERNS.md](OPERATION_PATTERNS.md#worked-example-configuring-http-request-step-by-step)**。

---

## get_node 详情级别

### 标准详情（默认——使用此级别！）

**✅ 初始配置**
```javascript
get_node({
  nodeType: "nodes-base.slack"
});
// detail="standard" is the default
```

**返回**（约 1–2K 个 token）：
- 必填字段
- 常用选项
- 操作列表
- 元数据

**用途**：满足 95% 的配置需求

### 完整详情（谨慎使用）

**✅ 标准详情不足时**
```javascript
get_node({
  nodeType: "nodes-base.slack",
  detail: "full"
});
```

**返回**（约 3–8K 个 token）：
- 完整架构
- 所有属性
- 所有嵌套选项

**警告**：响应较大，仅在标准详情不足时使用

### 搜索属性模式

**✅ 查找特定字段**
```javascript
get_node({
  nodeType: "nodes-base.httpRequest",
  mode: "search_properties",
  propertyQuery: "auth"
});
```

**用途**：查找身份验证、请求头、请求体字段等

### 决策树

1. 开始配置新节点 → `get_node`（标准）。
2. 标准详情已包含所需信息 → 使用这些信息进行配置。否则继续。
3. 查找特定字段 → 使用 `search_properties` 模式。否则继续。
4. 仍需要更多信息 → `get_node({detail: "full"})`。

**动态属性**：当 `standard` 详情将某个属性标记为 `dynamicOptions: {methodName, methodType, dependsOn}` 时，其实际值来自实时的 `loadOptions`/`listSearch` 方法，而不是随附文档中的内容——不要猜测 ID。使用 `n8n_explore_node_resources` 解析（需要 `N8N_MCP_ACCESS_TOKEN`、n8n 2.34+），并将返回的 `value` 放入配置中；`name` 仅是显示文本。

以下六个参数全部必填，且不会相互推断：

```javascript
n8n_explore_node_resources({
  nodeType: "n8n-nodes-base.googleSheets",  // LONG form
  version: 4.5,                              // the node typeVersion the method belongs to
  methodName: "getSheets",                   // copied verbatim from dynamicOptions
  methodType: "listSearch",                  // "listSearch" for resource locators, "loadOptions" for plain dropdowns
  credentialType: "googleSheetsOAuth2Api",
  credentialId: "c2",                        // from n8n_manage_credentials({action: "list"})
  currentNodeParameters: {                   // whatever dependsOn names, in its real shape
    documentId: {__rl: true, mode: "id", value: "1AbC…"}
  }
})
```

`dependsOn` 列出该方法需要预先选定的参数——将它们传入 `currentNodeParameters`，并保持资源定位器值的 `{__rl: true, mode, value}` 结构，否则该方法不会返回有用结果。`methodName` 区分大小写，并且特定于 `nodeType` + `version` 组合；不匹配时会返回 `OFFICIAL_MCP_ERROR`，而不是空列表。

---

## 属性依赖深入解析

字段具有 `displayOptions` 可见性规则：其中多个条件之间为 AND 关系，多个值之间为 OR 关系（例如，`body` 在 `sendBody=true` **且** `method IN (POST, PUT, PATCH)` 时显示）。反复出现的三种模式是布尔切换（sendBody → body）、操作切换（post 与 update 显示不同字段）以及类型选择（字符串条件与布尔条件）。若要查找控制某个字段的设置，请使用 `get_node({mode: "search_properties", propertyQuery: "..."})` 或 `get_node({detail: "full"})`——尤其是在验证标记某个你看不到的字段时。

机制详情、全部四种依赖模式、复杂流程、嵌套依赖和故障排查请参阅 **[DEPENDENCIES.md](DEPENDENCIES.md)**（可在 [快速参考：displayOptions 和常见依赖模式](DEPENDENCIES.md#quick-reference-displayoptions-and-common-dependency-patterns) 下查看快速参考摘要）。

---

## 常见节点模式

### 模式 1：资源/操作节点

**示例**：Slack、Google Sheets、Airtable

**结构**：
```javascript
{
  "resource": "<entity>",      // What type of thing
  "operation": "<action>",     // What to do with it
  // ... operation-specific fields
}
```

**配置方式**：
1. 选择资源
2. 选择操作
3. 使用 get_node 查看操作专属要求
4. 配置必填字段

### 模式 2：基于 HTTP 的节点

**示例**：HTTP Request、Webhook

**结构**：
```javascript
{
  "method": "<HTTP_METHOD>",
  "url": "<endpoint>",
  "authentication": "<type>",
  // ... method-specific fields
}
```

**依赖关系**：
- POST/PUT/PATCH → sendBody 可用
- sendBody=true → body 必填
- authentication != "none" → 凭据必填

**关键点：credentials 块、节点 id、typeVersion**
- **切勿设置占位凭据 ID**（例如 `"id": "REPLACE_ME"`）——对于未知 ID，n8n 的 UI 会渲染一个永久禁用的凭据选择器。真实 ID 未知时请省略 `credentials` 块；这样用户会看到一个正常可点击的下拉菜单。
- **节点 `id` 必须是 UUID v4**，不能使用可读的 slug——前端会据此绑定表单和凭据组件。
- **不要硬编码旧版 `typeVersion` 值**——使用 `get_node` 验证当前版本（httpRequest 为 4.4+）。

### 模式 3：数据库节点

**示例**：Postgres、MySQL、MongoDB

**结构**：
```javascript
{
  "operation": "<query|insert|update|delete>",
  // ... operation-specific fields
}
```

**依赖关系**：
- operation="executeQuery" → query 必填
- operation="insert" → table + values 必填
- operation="update" → table + values + where 必填

**关键点：写操作可能返回 0 个项目**
- INSERT、UPDATE、DELETE 可能产生 0 个 n8n 输出项目，具体取决于节点和操作（原始查询执行会可靠地返回 0 行结果；某些数据库节点会返回受影响的行）
- 在执行写操作的节点上设置 `alwaysOutputData: true`，以保持下游链路继续运行
- 如果下游节点需要数据，应使用 `$('UpstreamNode').all()`，而不是 `$input`

### 模式 4：条件逻辑节点

**示例**：IF、Switch、Merge

**结构**：
```javascript
{
  "conditions": {
    "<type>": [
      {
        "operation": "<operator>",
        "value1": "...",
        "value2": "..."  // Only for binary operators
      }
    ]
  }
}
```

**依赖关系**：
- 二元运算符（equals、contains 等）→ value1 + value2
- 一元运算符（isEmpty、isNotEmpty）→ 仅需 value1 + singleValue: true

---

## 特定操作的配置

必填字段会随资源 + 操作而变化：Slack 的 `post` 需要 `channel`+`text`，但 `update` 需要 `messageId`+`text`（channel 可选），而 `channel/create` 需要 `name`。HTTP `GET` 使用 `sendQuery`+`queryParameters`；`POST` 需要 `sendBody`+`body`。IF 二元运算符（`equals`）需要 `value1`+`value2`；一元运算符（`isEmpty`）只需要 `value1`，并会自动添加 `singleValue: true`。每种操作的具体最小配置请参阅 **[OPERATION_PATTERNS.md](OPERATION_PATTERNS.md#operation-specific-configuration-examples)**。

---

## 处理条件要求

某些字段仅在特定条件下才是必需的：当 `sendBody=true` 且 `method IN (POST, PUT, PATCH, DELETE)` 时，HTTP `body` 是必需的；如果运算符是一元运算符（`isEmpty`、`isNotEmpty`、`true`、`false`），则 `singleValue` 应为 `true`——自动清理功能会替你设置该值。通过阅读验证错误、搜索属性（`get_node({mode: "search_properties"})`），或从最小配置开始迭代，可以发现条件要求。**[DEPENDENCIES.md](DEPENDENCIES.md#handling-conditional-requirements)** 中提供了完整的发现示例。

---

## 特定节点的配置说明

### SplitInBatches v3

```javascript
{
  "batchSize": 100,  // Number of items per batch
  "options": {}
}
```

**输出连接**：
- `main[0]`（完成）→ 连接到下游处理节点（先添加 Limit 1）
- `main[1]`（每个批次）→ 连接到循环体，然后回连到 SplitInBatches 输入端

有关详细的循环和嵌套循环模式，请参阅 n8n Workflow Patterns skill。

### Google Sheets 节点

**逐项执行**：每个输入项都会触发一次单独的 API 调用。如果有 100 个输入项，并使用 Google Sheets 的“Append Row”节点，则会进行 100 次 API 调用。要批量写入，请先在 Code 节点中聚合各项，然后使用单个 HTTP Request 调用 Sheets API。

**公式列**：对于包含公式列的工作表，绝不要使用 `append`——它会覆盖公式。相反，应使用 HTTP Request，通过 Sheets API 的 `values.update`（PUT）方法和 `googleApi` 凭据进行操作。

---

## 配置反模式

### ❌ 不要：预先过度配置

**不佳**：
```javascript
// Adding every possible field
{
  "method": "GET",
  "url": "...",
  "sendQuery": false,
  "sendHeaders": false,
  "sendBody": false,
  "timeout": 10000,
  "ignoreResponseCode": false,
  // ... 20 more optional fields
}
```

**较好**：
```javascript
// Start minimal
{
  "method": "GET",
  "url": "...",
  "authentication": "none"
}
// Add fields only when needed
```

### ❌ 不要：跳过验证

**不佳**：
```javascript
// Configure and deploy without validating
const config = {...};
n8n_update_partial_workflow({...});  // YOLO
```

**较好**：
```javascript
// Validate before deploying
const config = {...};
const result = validate_node({...});
if (result.valid) {
  n8n_update_partial_workflow({...});
}
```

### ❌ 不要：忽略操作上下文

**不佳**：
```javascript
// Same config for all Slack operations
{
  "resource": "message",
  "operation": "post",
  "channel": "#general",
  "text": "..."
}

// Then switching operation without updating config
{
  "resource": "message",
  "operation": "update",  // Changed
  "channel": "#general",  // Wrong field for update!
  "text": "..."
}
```

**较好**：
```javascript
// Check requirements when changing operation
get_node({
  nodeType: "nodes-base.slack"
});
// See what update operation needs (messageId, not channel)
```

---

## 使用 patchNodeField 进行精确字段编辑

当你需要编辑节点字段中的特定字符串，而不是替换整个字段时，请在 `n8n_update_partial_workflow` 中使用 `patchNodeField`。这对于以下情况尤其有用：

- 在 Code 节点中编辑代码，而无需重新传输完整代码块
- 更新大型 HTML 电子邮件模板中的 URL 或文本
- 修复 JSON 请求体或长文本字段中的拼写错误

```javascript
// Instead of replacing the entire jsCode field:
n8n_update_partial_workflow({
  id: "wf-123",
  operations: [{
    type: "patchNodeField",
    nodeName: "Code",
    fieldPath: "parameters.jsCode",
    patches: [{find: "const limit = 10;", replace: "const limit = 50;"}]
  }]
})
```

`patchNodeField` 是严格的——如果找不到 find 字符串，或该字符串匹配多次，就会报错（除非设置了 `replaceAll: true`）。这可以防止配置更新时发生意外的静默失败。完整语法和示例请参阅 n8n MCP 工具专家 skill。

---

## 最佳实践

### 应该做

1. **从 get_node（标准详细程度）开始**
   - 响应约占 1–2K 个 token
   - 覆盖 95% 的配置需求
   - 默认详细程度

2. **迭代式验证**
   - 配置 → 验证 → 修复 → 重复
   - 平均迭代 2–3 次属于正常情况
   - 仔细阅读验证错误

3. **遇到问题时使用 search_properties 模式**
   - 如果字段似乎缺失，就搜索它
   - 了解哪些内容控制字段的显示
   - `get_node({mode: "search_properties", propertyQuery: "..."})`

4. **遵循操作上下文**
   - 不同操作有不同要求
   - 更改操作时始终检查 get_node
   - 不要假设配置可以直接迁移

5. **信任自动清理**
   - 运算符结构会自动修复
   - 不要手动添加或移除 singleValue
   - 保存时会添加 IF/Switch 元数据

### ❌ 不应该做

1. **立即跳转到 detail="full"**
   - 先尝试标准详细程度
   - 只有在需要时才升级
   - 完整架构占 3–8K 个 token

2. **盲目配置**
   - 部署前始终进行验证
   - 了解字段为何是必需的
   - 对条件字段使用 search_properties

3. **不理解配置就直接复制**
   - 不同操作需要不同字段
   - 复制后进行验证
   - 根据新的上下文进行调整

4. **手动修复自动清理问题**
   - 让自动清理处理运算符结构
   - 专注于业务逻辑
   - 保存并让系统修复结构

---

## 各节点系列的静默失败陷阱

有些错误配置能够通过 `validate_node` 和 `validate_workflow` 的检查，运行时也不会报错，却会悄悄执行错误的操作——`get_node` 会显示字段存在，但不会说明省略这些字段时会发生什么。以下是高频问题：

- **Switch** — 没有 `options.fallbackOutput` ⇒ 不匹配的项目会被静默丢弃。
- **Merge** — `numberOfInputs` 默认为 2（额外的数据源会被丢弃）；`useDataOfInput` 使用从 1 开始的索引，而 `connections.<src>.main[idx]` 槽位使用从 0 开始的索引（`useDataOfInput: "N"` → `main[N-1]`）。
- **Database** — 将 `{{ }}` 插值到 `parameters.query` 中会导致 SQL 注入；请使用 `$1/$2` 占位符 + `options.queryReplacement`。
- **Slack** — Block Kit 必须包装为 `={{ { "blocks": ... } }}`，否则会以纯文本形式发送。
- **Webhook / Respond** — 即使在错误分支中，`responseCode` 也默认为 200。
- **Schedule Trigger** — 时区属于工作流级别（Workflow Settings），而不是每条规则单独设置。

完整的症状/原因/修复详情（以 JSON 和 `n8n_update_partial_workflow` 术语说明）请参阅 **[NODE_FAMILY_GOTCHAS.md](NODE_FAMILY_GOTCHAS.md)**。

---

## 详细参考

有关特定主题的综合指南：

- **[DEPENDENCIES.md](DEPENDENCIES.md)** - 深入了解属性依赖关系和 displayOptions
- **[OPERATION_PATTERNS.md](OPERATION_PATTERNS.md)** - 按节点类型整理的常见配置模式
- **[NODE_FAMILY_GOTCHAS.md](NODE_FAMILY_GOTCHAS.md)** - 各节点系列中不易察觉的运行时陷阱（Switch、Merge、Database、Slack、Webhook、Schedule）

---

## 总结

**配置策略**：
1. 从 `get_node` 开始（默认使用标准详细信息）
2. 配置操作所需的字段
3. 验证配置
4. 如果遇到问题，搜索属性
5. 迭代直到配置有效（平均 2-3 个周期）
6. 确信无误后部署

**关键原则**：
- **以操作为依据**：不同操作具有不同的要求
- **渐进式披露**：从最小配置开始，按需添加
- **考虑依赖关系**：了解字段可见性规则
- **以验证为驱动**：让验证结果指导配置

**相关技能**：
- **n8n MCP Tools Expert** - 了解如何正确使用发现工具
- **n8n Validation Expert** - 解读验证错误
- **n8n Expression Syntax** - 配置表达式字段
- **n8n Workflow Patterns** - 使用正确的配置应用模式