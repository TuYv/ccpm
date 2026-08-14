---
name: n8n-node-configuration
description: Operation-aware node configuration guidance. Use when configuring nodes, understanding property dependencies, determining required fields, choosing between get_node detail levels, or learning common configuration patterns by node type. Always use this skill when setting up node parameters — it explains which fields are required for each operation, how displayOptions control field visibility, and when to use patchNodeField for surgical edits vs full node updates.
---
# n8n 节点配置

针对可感知操作及属性依赖关系的节点配置提供专家指导。

---

## 配置理念

**渐进式披露**：从最简配置开始，按需增加复杂性

配置最佳实践：
- 使用 `detail: "standard"` 的 `get_node` 是最常用的发现模式
- 配置编辑之间的平均间隔为 56 秒
- 通过返回 1-2K 个词元即可覆盖 95% 的使用场景

**关键洞察**：大多数配置只需要标准详情，而不需要完整模式！

---

## 核心概念

### 1. 可感知操作的配置

**并非所有字段都始终为必填项**——这取决于具体操作！

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

**关键点**：资源和操作共同决定哪些字段为必填项！

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

**机制**：displayOptions 控制字段的可见性

### 3. 渐进式发现

**使用正确的详情级别**：

1. **get_node({detail: "standard"})** - 默认
   - 快速概览（约 1-2K 个词元）
   - 必填字段和常用选项
   - **优先使用**——可满足 95% 的需求

2. **get_node({mode: "search_properties", propertyQuery: "..."})**（用于查找特定字段）
   - 按名称查找属性
   - 在查找身份验证、请求体、请求头等内容时使用

3. **get_node({detail: "full"})**（完整模式）
   - 所有属性（约 3-8K 个词元）
   - 仅在标准详情不足时使用

---

## 配置工作流

### 标准流程

1. 确定节点类型和操作。
2. 使用 `get_node`（默认使用标准详情）。
3. 配置必填字段。
4. 验证配置。
5. 如果某个字段不明确 → `get_node({mode: "search_properties"})`。
6. 按需添加可选字段。
7. 再次验证。
8. 部署。

### 示例：配置 HTTP Request

实践中的验证驱动循环：从最简配置（`method`、`url`、`authentication`）开始，然后让每次 `validate_node` 错误揭示下一个必填字段（POST 需要 `sendBody` → 当 `sendBody=true` 时需要 `body`），直到验证通过。完整的分步演练参见 **[OPERATION_PATTERNS.md](OPERATION_PATTERNS.md#worked-example-configuring-http-request-step-by-step)**。

---

## get_node 详情级别

### 标准详情（默认——使用此级别！）

**✅ 起始配置**
```javascript
get_node({
  nodeType: "nodes-base.slack"
});
// detail="standard" is the default
```

**返回内容**（约 1-2K tokens）：
- 必填字段
- 常用选项
- 操作列表
- 元数据

**适用场景**：满足 95% 的配置需求

### 完整详情（谨慎使用）

**✅ 标准详情不足时**
```javascript
get_node({
  nodeType: "nodes-base.slack",
  detail: "full"
});
```

**返回内容**（约 3-8K tokens）：
- 完整 schema
- 所有属性
- 所有嵌套选项

**警告**：响应内容较大，仅在标准详情不足时使用

### 搜索属性模式

**✅ 查找特定字段**
```javascript
get_node({
  nodeType: "nodes-base.httpRequest",
  mode: "search_properties",
  propertyQuery: "auth"
});
```

**适用场景**：查找身份验证、headers、body 字段等。

### 决策树

1. 开始配置新节点 → `get_node`（标准详情）。
2. 标准详情包含所需内容 → 使用它进行配置。否则继续。
3. 查找特定字段 → `search_properties` 模式。否则继续。
4. 仍需要更多信息 → `get_node({detail: "full"})`。

---

## 深入了解属性依赖关系

字段具有用于控制可见性的 `displayOptions` 规则：通过 `show`/`hide` 块定义，其中多个条件之间为 AND 关系，多个值之间为 OR 关系（例如，当 `sendBody=true` 且 `method IN (POST, PUT, PATCH)` 时显示 `body`）。反复出现的三种模式分别是布尔开关（sendBody → body）、操作切换（post 与 update 显示不同字段）以及类型选择（string 与 boolean 条件）。要查找控制某个字段的条件，请使用 `get_node({mode: "search_properties", propertyQuery: "..."})` 或 `get_node({detail: "full"})`——尤其是在验证提示某个你看不到的字段有问题时。

有关机制的详细信息、全部四种依赖模式、复杂流程、嵌套依赖关系以及故障排除，请参阅 **[DEPENDENCIES.md](DEPENDENCIES.md)**（快速参考回顾位于[快速参考：displayOptions 和常见依赖模式](DEPENDENCIES.md#quick-reference-displayoptions-and-common-dependency-patterns)）。

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

**配置方法**：
1. 选择资源
2. 选择操作
3. 使用 get_node 查看特定于操作的要求
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
- sendBody=true → body 为必填项
- authentication != "none" → credentials 为必填项

**关键事项：credentials 块、节点 id、typeVersion**
- **切勿设置占位 credential ID**（例如 `"id": "REPLACE_ME"`）——对于未知 ID，n8n 的 UI 会渲染一个永久禁用的 credential 选择器。当真实 ID 未知时，请省略 `credentials` 块；这样用户将获得一个可以正常点击的下拉列表。
- **节点 `id` 必须是 UUID v4**，而不能是可读的 slug——前端会将表单和 credential 组件绑定到该 ID。
- **不要硬编码旧的 `typeVersion` 值**——使用 `get_node` 验证当前版本（httpRequest 为 4.4+）。

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
- operation="executeQuery" → 必须提供 query
- operation="insert" → 必须提供 table + values
- operation="update" → 必须提供 table + values + where

**重要：写入操作可能返回 0 个项目**
- INSERT、UPDATE、DELETE 可能产生 0 个 n8n 输出项目，具体取决于节点和操作（执行原始查询一定会返回 0 个结果行；某些数据库节点会返回受影响的行）
- 在写入操作节点上设置 `alwaysOutputData: true`，以保持下游链路继续运行
- 如果下游节点需要数据，应使用 `$('UpstreamNode').all()` 而不是 `$input`

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

必填字段会随资源和操作而变化：Slack `post` 需要 `channel`+`text`，但 `update` 需要 `messageId`+`text`（channel 可选），而 `channel/create` 需要 `name`。HTTP `GET` 使用 `sendQuery`+`queryParameters`；`POST` 需要 `sendBody`+`body`。IF 二元运算符（`equals`）需要 `value1`+`value2`；一元运算符（`isEmpty`）只需要 `value1`，外加自动添加的 `singleValue: true`。每种情况的具体最小配置请参阅 **[OPERATION_PATTERNS.md](OPERATION_PATTERNS.md#operation-specific-configuration-examples)**。

---

## 处理条件性要求

有些字段仅在特定条件下才是必填项：当 `sendBody=true` 且 `method IN (POST, PUT, PATCH, DELETE)` 时，HTTP `body` 为必填项；当运算符为一元运算符（`isEmpty`、`isNotEmpty`、`true`、`false`）时，IF `singleValue` 应为 `true`——自动清理功能会替你完成此设置。可通过阅读验证错误、搜索属性（`get_node({mode: "search_properties"})`）或从最小配置开始迭代来发现条件性要求。具体的发现示例请参阅 **[DEPENDENCIES.md](DEPENDENCIES.md#handling-conditional-requirements)**。

---

## 节点特定配置说明

### SplitInBatches v3

```javascript
{
  "batchSize": 100,  // Number of items per batch
  "options": {}
}
```

**输出连线**：
- `main[0]`（完成）→ 连接到下游处理流程（先添加 Limit 1）
- `main[1]`（每个批次）→ 连接到循环体，然后再循环连接回 SplitInBatches 输入

有关循环和嵌套循环模式的详细信息，请参阅 n8n Workflow Patterns 技能。

### Google Sheets 节点

**逐项目执行**：每个输入项目都会触发一次单独的 API 调用。如果有 100 个项目并使用 Google Sheets "Append Row" 节点，则会发出 100 次 API 调用。若要批量写入，请先在 Code 节点中聚合项目，然后通过 Sheets API 使用单个 HTTP Request。

**公式列**：对于包含公式列的工作表，切勿使用 `append`，否则会覆盖公式。应改用 HTTP Request，通过 Google Sheets API 的 `values.update`（PUT）方法以及 `googleApi` 凭据进行操作。

---

## 配置反模式

### ❌ 不要：预先过度配置

**错误示例**：
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

**正确示例**：
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

**错误示例**：
```javascript
// Configure and deploy without validating
const config = {...};
n8n_update_partial_workflow({...});  // YOLO
```

**正确示例**：
```javascript
// Validate before deploying
const config = {...};
const result = validate_node({...});
if (result.valid) {
  n8n_update_partial_workflow({...});
}
```

### ❌ 不要：忽略操作上下文

**错误示例**：
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

**正确示例**：
```javascript
// Check requirements when changing operation
get_node({
  nodeType: "nodes-base.slack"
});
// See what update operation needs (messageId, not channel)
```

---

## 使用 patchNodeField 精准编辑字段

当你需要编辑节点字段中的特定字符串，而不是替换整个字段时，请在 `n8n_update_partial_workflow` 中使用 `patchNodeField`。它尤其适用于：

- 编辑 Code 节点中的代码，而无须重新传输完整代码块
- 更新大型 HTML 电子邮件模板中的 URL 或文本
- 修复 JSON 正文或长文本字段中的拼写错误

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

`patchNodeField` 非常严格——如果未找到待查找字符串，或者该字符串匹配多次（除非设置 `replaceAll: true`），它就会报错。这可以防止配置更新期间出现意外的静默失败。有关完整语法和示例，请参阅 n8n MCP Tools Expert 技能。

---

## 最佳实践

### 应该这样做

1. **从 get_node（标准详细程度）开始**
   - 响应约为 1-2K 个 token
   - 可满足 95% 的配置需求
   - 默认详细程度

2. **迭代验证**
   - 配置 → 验证 → 修复 → 重复
   - 平均进行 2-3 次迭代是正常的
   - 仔细阅读验证错误

3. **遇到困难时使用 search_properties 模式**
   - 如果某个字段似乎缺失，请搜索它
   - 了解哪些因素控制字段的可见性
   - `get_node({mode: "search_properties", propertyQuery: "..."})`

4. **尊重操作上下文**
   - 不同操作 = 不同要求
   - 更改操作时，始终检查 get_node
   - 不要假设配置可以通用

5. **信任自动清理**
   - 操作符结构会自动修复
   - 不要手动添加/删除 singleValue
   - 保存时会添加 IF/Switch 元数据

### ❌ 不要这样做

1. **一开始就使用 detail="full"**
   - 先尝试标准详细程度
   - 仅在需要时才升级
   - 完整 schema 会占用 3-8K tokens

2. **盲目配置**
   - 部署前务必验证
   - 理解字段为何必填
   - 对条件字段使用 search_properties

3. **在不理解的情况下复制配置**
   - 不同操作需要不同字段
   - 复制后进行验证
   - 根据新的上下文进行调整

4. **手动修复自动清理问题**
   - 让自动清理处理操作符结构
   - 专注于业务逻辑
   - 保存并让系统修复结构

---

## 按节点系列划分的静默失败陷阱

有些错误配置可以顺利通过 `validate_node` 和 `validate_workflow`，运行时也不会报错，却会悄无声息地产生错误结果——`get_node` 会显示存在哪些字段，但不会告诉你省略这些字段时会发生什么。以下是高频问题：

- **Switch** — 缺少 `options.fallbackOutput` ⇒ 未匹配的条目会被静默丢弃。
- **Merge** — `numberOfInputs` 默认为 2（多余的来源会被丢弃）；`useDataOfInput` 使用从 1 开始的索引，而 `connections.<src>.main[idx]` 槽位使用从 0 开始的索引（`useDataOfInput: "N"` → `main[N-1]`）。
- **Database** — 将 `{{ }}` 插值到 `parameters.query` 中会导致 SQL 注入；请使用 `$1/$2` 占位符 + `options.queryReplacement`。
- **Slack** — Block Kit 必须包装为 `={{ { "blocks": ... } }}`，否则会以纯文本形式发布。
- **Webhook / Respond** — 即使在错误分支中，`responseCode` 也默认为 200。
- **Schedule Trigger** — 时区在工作流级别（Workflow Settings）设置，而不是按规则设置。

完整的症状/原因/修复详情（使用 JSON + `n8n_update_partial_workflow` 的表述）请参阅 **[NODE_FAMILY_GOTCHAS.md](NODE_FAMILY_GOTCHAS.md)**。

---

## 详细参考资料

有关特定主题的综合指南：

- **[DEPENDENCIES.md](DEPENDENCIES.md)** - 深入讲解属性依赖关系和 displayOptions
- **[OPERATION_PATTERNS.md](OPERATION_PATTERNS.md)** - 按节点类型划分的常见配置模式
- **[NODE_FAMILY_GOTCHAS.md](NODE_FAMILY_GOTCHAS.md)** - 按系列划分的静默运行时陷阱（Switch、Merge、Database、Slack、Webhook、Schedule）

---

## 总结

**配置策略**：
1. 从 `get_node` 开始（默认为标准详细程度）
2. 配置操作所需的必填字段
3. 验证配置
4. 遇到困难时搜索属性
5. 迭代直至有效（平均 2-3 个周期）
6. 满怀信心地部署

**关键原则**：
- **操作感知**：不同操作 = 不同要求
- **渐进式披露**：从最小配置开始，按需添加
- **依赖感知**：理解字段可见性规则
- **验证驱动**：让验证指导配置

**相关技能**：
- **n8n MCP Tools Expert** - 如何正确使用发现工具
- **n8n Validation Expert** - 解读验证错误
- **n8n Expression Syntax** - 配置表达式字段
- **n8n Workflow Patterns** - 使用正确的配置应用模式