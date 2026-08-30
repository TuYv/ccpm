---
name: n8n-validation-expert
description: Interpret validation errors and guide fixing them. Use when encountering validation errors, validation warnings, false positives, operator structure issues, or need help understanding validation results. Also use when asking about validation profiles, error types, the validation loop process, or auto-fix capabilities. Consult this skill whenever a validate_node or validate_workflow call returns errors or warnings — it knows which warnings are false positives and which errors need real fixes.
---
# n8n 验证专家

解读和修复 n8n 验证错误的专家指南。

---

## 验证理念

**尽早验证，频繁验证**

验证通常是一个迭代过程：
- 预期会经历验证反馈循环
- 通常需要 2-3 次验证 → 修复循环
- 平均耗时：思考错误 23 秒，修复错误 58 秒

**关键洞察**：验证是一个迭代过程，而不是一次性操作！

---

## 错误严重级别

### 1. 错误（必须修复）
**会阻止工作流执行** - 激活前必须解决

**类型**：
- `missing_required` - 未提供必填字段
- `invalid_value` - 值与允许的选项不匹配
- `type_mismatch` - 数据类型错误（应为数字却传入字符串）
- `invalid_reference` - 引用的节点不存在
- `invalid_expression` - 表达式语法错误

**示例**：
```json
{
  "type": "missing_required",
  "property": "channel",
  "message": "Channel name is required",
  "fix": "Provide a channel name (lowercase, no spaces, 1-80 characters)"
}
```

### 2. 警告（应该修复）
**不会阻止执行** - 工作流可以激活，但可能存在问题

**类型**：
- `best_practice` - 推荐但不是必需 — 仅在 `ai-friendly` / `strict` 下显示
- `deprecated` - 使用旧版 API/功能 — 在所有配置下显示
- `security` - 硬编码的密钥、未进行身份验证的 Webhook — 在所有配置下显示
- `performance` - 潜在的性能问题 — 提示性质，在 `ai-friendly` / `strict` 下显示

**示例**（最佳实践 — 在 `ai-friendly` / `strict` 下显示）：
```json
{
  "type": "warning",
  "nodeName": "Slack",
  "message": "Slack API can have rate limits and transient failures"
}
```

### 3. 建议（可选）
**有则更好** - 可以改进工作流的优化项

**类型**：
- `optimization` - 可以更高效
- `alternative` - 实现相同结果的更好方式

---

## 验证循环

### Telemetry 中的模式
**7,841 次出现**的这一模式：

```
1. Configure node
   ↓
2. validate_node (23 seconds thinking about errors)
   ↓
3. Read error messages carefully
   ↓
4. Fix errors
   ↓
5. validate_node again (58 seconds fixing)
   ↓
6. Repeat until valid (usually 2-3 iterations)
```

### 示例
```javascript
// Iteration 1
let config = {
  resource: "channel",
  operation: "create"
};

const result1 = validate_node({
  nodeType: "nodes-base.slack",
  config,
  profile: "runtime"
});
// → Error: Missing "name"

// ⏱️  23 seconds thinking...

// Iteration 2
config.name = "general";

const result2 = validate_node({
  nodeType: "nodes-base.slack",
  config,
  profile: "runtime"
});
// → Error: Missing "text"

// ⏱️  58 seconds fixing...

// Iteration 3
config.text = "Hello!";

const result3 = validate_node({
  nodeType: "nodes-base.slack",
  config,
  profile: "runtime"
});
// → Valid! ✅
```

**这是正常现象！** 不要因为需要多次迭代而气馁。

---

## 验证配置

四种配置是**累积的**（n8n-mcp ≥ 2.63.0）：每一种配置都会显示较低级别配置显示的所有内容，并额外显示更多内容。区分点在于最佳实践*提示* — `minimal` 和 `runtime` 不显示这些提示；`ai-friendly` 和 `strict` 会添加这些提示。除了 `minimal` 会跳过少数配置级检查（例如对明确指定的 `operation` 进行枚举验证）之外，所有配置中的错误都相同。安全和弃用警告会在所有配置下显示。

### minimal
**适用场景**：在搭建工作流的过程中进行快速结构检查。

**检查内容**：会发现可能导致执行停止的硬错误（缺少必填字段、代码为空、连接断开）。跳过枚举检查和所有建议性提示。

**速度最快，限制最少。**

### runtime（推荐默认值）
**适用场景**：构建过程中持续进行验证；日常使用的配置档。

**检查内容**：错误（必填字段、值类型、允许的值、依赖关系、断开的引用），以及安全性和弃用警告。**不包含**最佳实践建议。

**平衡性最好——捕获所有会导致工作流无法运行的问题，同时不干扰代码风格。**

### ai-friendly
**适用场景**：希望在部署前获得最佳实践建议。

**检查内容**：包含 `runtime` 的全部检查，**此外还包括**最佳实践建议——针对每个节点的“未进行错误处理”建议、“webhook 应始终发送响应”提示、速率限制说明、过时的 `typeVersion` 建议、`cachedResultName` 以及长链提示。

**注意**：`ai-friendly` 比 `runtime` *更严格*，而不是更宽松。（旧版文档曾将其描述为减少误报——这只是在配置档门控机制失效时成立；现在该问题已经修复。）

### strict
**适用场景**：加固生产环境中的关键工作流。

**检查内容**：包含 `ai-friendly` 的全部检查，**此外还包括**遗留属性检查（“属性 'X' 不会被使用——在当前设置下不可见”）。

**最严格的 lint。** 由于误报已从源头修复，其警告是需要权衡的建议，而不是需要排除的噪声。

---

## 常见错误类型

五种核心错误类型，按大致出现频率排列：

- **`missing_required`** — 未提供必填字段。使用 `get_node` 查看必填字段，然后添加该字段。
- **`invalid_value`** — 值与允许的选项不匹配（枚举值区分大小写）。检查错误中的允许值列表或使用 `get_node`。
- **`type_mismatch`** — 数据类型错误（字符串 `"100"` 与数字 `100` 不同）。将其转换为预期类型。
- **`invalid_expression`** — 表达式语法错误（缺少 `{{}}`、存在拼写错误）。参见 n8n Expression Syntax skill。
- **`invalid_reference`** — 被引用的节点不存在（已重命名、已删除或拼写错误）。修正名称或使用 `cleanStaleConnections`。

第六类是 **`patchNodeField` 错误**（查找不到、匹配不明确、正则表达式无效/不安全）。当 `patchNodeField` 操作在 `n8n_update_partial_workflow` 期间失败时，就会出现这类错误——这是有意设计的严格行为，会报告错误，而不是静默地继续执行。

上述每种类型都在 **[ERROR_CATALOG.md](ERROR_CATALOG.md)** 中提供了可运行的示例（错误配置 → 修复方案），其中还包括 `patchNodeField` 错误案例及其修复方法。

---

## 自动清理系统

在任何工作流更新时自动**规范化常见的操作符结构**——包括 `n8n_create_workflow`、`n8n_update_partial_workflow` 或任何保存操作。请信任该机制；不要手动修复这些问题。

**保存时会规范化的内容**：
- **二元操作符**（equals、notEquals、contains、notContains、greaterThan、lessThan、startsWith、endsWith）——移除多余的 `singleValue` 属性。
- **一元操作符**（isEmpty、isNotEmpty、true、false）——添加 `singleValue: true`。
- **IF/Switch 元数据**——为 IF v2.2+ 和 Switch v3.2+ 补全 `conditions.options`。

**验证不再针对这些形状报错**（n8n-mcp ≥ 2.63.0）。n8n 会根据运算符名称推导一元性，并为 `conditions.options` 子字段设置默认值，因此无论是否存在 `singleValue` 和 options 元数据，`validate_node` / `validate_workflow` 都会接受该条件——保存时，清理器只会将其整理为规范形式。（较旧的服务器会错误地针对未经规范化的形状报错；如果遇到这种情况，请升级。）目前仍属于真正错误的情况包括：v2 节点上使用 v1 形状的 `conditions` 对象、没有任何条件的空过滤器，以及 v2 结构中使用旧版 v1 运算符名称（例如 `smaller`）。

**清理器无法修复的内容**（请手动处理）：连接到不存在节点的损坏连接（使用 `cleanStaleConnections`）、分支数量不匹配（添加/删除连接或规则），以及自相矛盾的损坏状态（可能需要手动干预数据库）。

前后示例以及完整的无法修复细节请参见 **[ERROR_CATALOG.md](ERROR_CATALOG.md)**（自动清理部分）。

---

## 误报

验证器经过全面改造后（n8n-mcp ≥ 2.63.0），移除了经典误报——表达式中的模板字面量、可选链、被省略的操作默认值、Webhook → Respond-to-Webhook 模式、IF/Filter 旧版形状等不再触发误报。现在不存在一份持续维护的“已知误报、可忽略”列表。

目前剩下的是**最佳实践建议**（仅在 `ai-friendly` / `strict` 下显示），它们指出了真实存在的权衡，但在你的情况下可能是可以接受的。并非每条建议都需要修复——其中许多取决于具体上下文。以下是一些常见建议，以及何时可以接受、何时值得修复：

- **“...without error handling”** — 对于开发/测试以及非关键通知来说可以接受；对于处理重要数据的生产环境，应当修复。（这绝不是硬错误——样式问题不会阻止执行。）
- **“No retry logic”** — 对于幂等操作、具有自身重试机制的 API、手动触发器来说可以接受；对于不稳定的外部服务和生产自动化，应当修复。
- **“...rate limits and transient failures”** — 对于内部/低流量/受服务器端限制的 API 来说可以接受；对于公开的高流量 API，应当修复。
- **“Unbounded query”** — 对于规模较小且已知的数据集、聚合操作、开发/测试来说可以接受；对于大型表上的生产查询，应当修复。

相比之下，安全和弃用警告会在*所有*配置档案下显示，应将其视为真正的问题。

每种情况的完整处理指南、验证器不再标记的问题列表、配置档案策略、“我是否应该修复这个问题？”决策框架，以及如何记录已接受的建议，请参见 **[FALSE_POSITIVES.md](FALSE_POSITIVES.md)**。

---

## 验证结果结构

### 完整响应
```javascript
{
  "valid": false,
  "errors": [
    {
      "type": "missing_required",
      "property": "channel",
      "message": "Channel name is required",
      "fix": "Provide a channel name (lowercase, no spaces)"
    }
  ],
  "warnings": [
    {
      "type": "best_practice",
      "property": "errorHandling",
      "message": "Slack API can have rate limits",
      "suggestion": "Add onError: 'continueRegularOutput'"
    }
  ],
  "suggestions": [
    {
      "type": "optimization",
      "message": "Consider using batch operations for multiple messages"
    }
  ],
  "summary": {
    "hasErrors": true,
    "errorCount": 1,
    "warningCount": 1,
    "suggestionCount": 1
  }
}
```

### 如何阅读验证结果

1. **首先检查 `valid`** — `true` 表示配置有效；`false` 表示存在错误，必须先修复后才能部署。
2. **首先修复 `errors`** — 每个错误都包含 `property`、`message` 和 `fix`。这些错误必须解决。
3. **查看 `warnings`** — 每条警告都有 `message` 和 `suggestion`；根据具体情况决定是否处理（参见上面的误报部分）。
4. **考虑 `suggestions`** — 可选的改进建议，并非必需。

---

## 工作流验证

### validate_workflow（结构）
**验证整个工作流**，而不仅仅是单个节点

**检查项**：
1. **节点配置** - 每个节点是否有效
2. **连接** - 是否存在断开的引用
3. **表达式** - 语法和引用是否有效
4. **流程** - 工作流的逻辑结构

**示例**：
```javascript
validate_workflow({
  workflow: {
    nodes: [...],
    connections: {...}
  },
  options: {
    validateNodes: true,
    validateConnections: true,
    validateExpressions: true,
    profile: "runtime"
  }
})
```

### 常见工作流错误

#### 1. 连接断开
```json
{
  "error": "Connection from 'Transform' to 'NonExistent' - target node not found"
}
```

**修复方法**：移除过时的连接，或创建缺失的节点

#### 2. 循环（警告，而非错误）
```json
{
  "warning": "Workflow contains a cycle: Node A → Node B → Node A"
}
```

循环是**警告**，而不是硬错误（n8n-mcp ≥ 2.63.0）——由运行时控制的循环（错误重试、数据驱动的分页、路由器回流）会执行至完成，属于合法情况。只有在循环并非有意设计时才需要**修复**：确保循环存在真正的退出条件（条件节点、错误输出或有界计数器），以免无限循环。

#### 3. 多个起始节点
```json
{
  "warning": "Multiple trigger nodes found - only one will execute"
}
```

**修复方法**：移除多余的触发器，或拆分为多个独立工作流

#### 4. 未连接的节点
```json
{
  "warning": "Node 'Transform' is not connected to workflow flow"
}
```

**修复方法**：连接该节点；如果未使用，则将其移除

---

## 恢复策略

### 策略 1：重新开始
**适用情况**：配置严重损坏

**步骤**：
1. 从 `get_node` 中记录必需字段
2. 创建最小的有效配置
3. 逐步添加功能
4. 每次添加后进行验证

### 策略 2：二分查找
**适用情况**：工作流验证通过，但执行结果不正确

**步骤**：
1. 移除一半节点
2. 进行验证和测试
3. 如果运行正常：问题位于已移除的节点中
4. 如果运行失败：问题位于剩余节点中
5. 重复上述步骤，直到定位问题

### 策略 3：清理过时的连接
**适用情况**：出现“未找到节点”错误

**步骤**：
```javascript
n8n_update_partial_workflow({
  id: "workflow-id",
  operations: [{
    type: "cleanStaleConnections"
  }]
})
```

### 策略 4：使用自动修复
**适用情况**：可以自动解决的验证错误

**步骤**：
```javascript
// 预览修复内容（默认设置 - 不会应用修复）
n8n_autofix_workflow({
  id: "workflow-id",
  applyFixes: false,
  confidenceThreshold: "medium"  // high, medium, low
})

// 查看修复内容，然后应用
n8n_autofix_workflow({
  id: "workflow-id",
  applyFixes: true
})
```

---

## 自动修复功能

`n8n_autofix_workflow` 工具可以修复以下类型的问题：

1. **expression-format** - 表达式中缺少 `=` 前缀（例如，`{{ $json.field }}` → `={{ $json.field }}`）
2. **typeversion-correction** - 将节点降级到受支持的 typeVersions
3. **error-output-config** - 移除冲突的 onError 设置
4. **node-type-correction** - 使用相似性匹配修复未知节点类型（置信度达到 90% 以上）
5. **webhook-missing-path** - 为缺少 path 配置的 webhook 节点生成 UUID
6. **typeversion-upgrade** - 智能升级到最新节点版本并自动迁移
7. **version-migration** - 为需要手动操作的复杂破坏性变更提供指导

**置信度级别**：`high`（90% 以上，可安全自动应用）、`medium`（70–89%，建议检查）、`low`（低于 70%，需要人工检查）

```javascript
// Preview all fixes
n8n_autofix_workflow({id: "workflow-id"})

// Only apply high-confidence fixes
n8n_autofix_workflow({
  id: "workflow-id",
  applyFixes: true,
  confidenceThreshold: "high"
})

// Target specific fix types
n8n_autofix_workflow({
  id: "workflow-id",
  fixTypes: ["expression-format", "typeversion-upgrade"],
  applyFixes: true
})
```

**更新后指导**：对于版本升级，请检查响应中的 `postUpdateGuidance` 字段，以获取分步迁移说明。

---

## 最佳实践

### ✅ 应该做

- 每次重大变更后都进行验证
- 完整阅读错误消息
- 迭代式地修复错误（一次修复一个）
- 在部署前使用 `runtime` 配置文件
- 在假定成功之前检查 `valid` 字段
- 对于操作符问题，信任自动清理功能
- 不确定需求时使用 `get_node`
- 记录你接受的误报

### ❌ 不应该做

- 激活前跳过验证
- 尝试一次性修复所有错误
- 忽略错误消息
- 在开发期间使用 `strict` 配置文件（噪声过多）
- 假定验证已经通过（始终检查结果）
- 手动修复自动清理功能可以处理的问题
- 带着未解决的错误进行部署
- 忽略所有警告（其中一些很重要！）

---

## 验证工作流后运行工作流

`validate_workflow` 会检查结构、参数和表达式——但从不执行任何操作。验证通过的工作流在真实数据上仍可能失败，因此在认为它已完成之前，请先运行一次。

**使用 webhook、form 或 chat 触发器时：**`n8n_test_workflow({workflowId})` — 默认的 `method: "auto"` 会检测触发器并通过 HTTP 触发它（工作流必须处于激活状态）。

**没有此类触发器时**（Manual Trigger、Schedule、子工作流），不存在 HTTP 入口点。请使用 pin-data 路径，该路径会通过 n8n 自己的 MCP server（`N8N_MCP_ACCESS_TOKEN`，n8n 2.34+）运行：

1. `n8n_test_workflow({workflowId, method: "prepare"})` — 列出需要固定数据的节点。
2. 为列出的每个节点构建一个示例条目，以节点 **名称** 为键，并将每个条目包装在 `{json: {...}}` 中：
   ```json
   {"When clicking 'Test workflow'": [{"json": {"orderId": "1234", "email": "a@b.com"}}]}
   ```
   使用扁平对象而不是由 `{json}` 条目组成的数组，是这里最常见的错误。
3. `n8n_test_workflow({workflowId, method: "pinned", pinData})` — 使用这些数据运行工作流并等待结果。

**如果想在不固定数据的情况下快速手动运行**，`method: "direct"` 会启动一次手动执行，并在执行启动后立即返回；请轮询 `n8n_executions({action: "get", id: executionId, mode: "error"})` 获取结果。`direct` 运行不会固定任何数据，因此每个节点都会执行，其发起的任何外部调用都是真实调用——而且即使是 `pinned`，也只会固定触发器、凭据和 HTTP Request 节点。`executionMode: "production"` 会改变执行上下文，但不会决定是否产生副作用；除非用户要求进行生产环境运行，否则请保持默认值。

**`method: "auto"` 永远不会通过 n8n 的 MCP 服务器运行工作流。** 对于没有外部触发器的工作流，它会报告这一事实，并列出 `prepare`/`pinned`/`direct`；只有在你按名称请求时，路由的方法才会运行。

**首次路由运行前需要征得同意。** 对于“Available in MCP”设置已关闭的工作流，n8n 会拒绝这些调用，并返回 `WORKFLOW_NOT_EXPOSED`。使用 `exposeToMcp: true` 重新运行会开启该设置并重试一次。这是工作流上一个可见且持久的设置（启用它属于工作流更新，因此可能覆盖并发进行的 UI 编辑）——**在传入该参数前请先询问用户**。同意流程只会启用该设置；不会隐式禁用任何内容。再次关闭它需要执行明确操作：`n8n_update_partial_workflow({id: workflowId, operations: [{type: "updateSettings", settings: {availableInMCP: false}}]})`，或者在 n8n UI 中切换该开关。

**读取结果：** 如果运行已经启动但随后失败，会返回带有 `executionId` 的 `EXECUTION_FAILED`；请使用 `n8n_executions({action: "get", id, mode: "error"})` 检查该执行，从抛出错误的节点开始修复，然后再次验证并运行。

---

## 审查现有工作流

构建过程中进行验证（上面的循环）是为了捕获你自己正在进行的工作中的架构和形状错误。**审查现有工作流**——无论是你自己的工作流，还是他人交给你的工作流——则是另一项工作：该工作流已经通过 `validate_workflow` 的检查，你需要寻找验证无法发现的问题（隐蔽的连接错误、容易受到注入攻击的查询、会丢弃项目的 Switch、Set/Code 反模式、缺失的错误路径）。为此，请使用 `n8n_get_workflow` 拉取工作流，并逐项检查 **[REVIEW_CHECKLIST.md](REVIEW_CHECKLIST.md)**——这是一份按严重性分级的审计清单（必须修复 / 应该修复 / 最好修复），其中每一项都指向用于修复的规范 skill。同时运行 `n8n_audit_instance`，以发现整个实例中的硬编码密钥和未进行身份验证的 Webhook。

---

## 详细指南

如需完整的错误目录、误报说明和工作流审查指南，请参阅：

- **[ERROR_CATALOG.md](ERROR_CATALOG.md)** - 包含示例的完整错误类型列表
- **[FALSE_POSITIVES.md](FALSE_POSITIVES.md)** - 警告在何时可以接受
- **[REVIEW_CHECKLIST.md](REVIEW_CHECKLIST.md)** - 用于审查现有工作流的分级严重性审计清单

---

## 总结

**要点**：
1. **验证是迭代进行的**（平均 2-3 个循环，23s + 58s）
2. **必须修复错误**，警告则可选
3. **自动清理**会在保存时规范化操作符结构；验证不再针对原始形状报错
4. **默认使用运行时配置**；如需最佳实践建议，可升级到 `ai-friendly`/`strict`
5. **经典误报已修复**（≥ 2.63.0）——剩余警告属于建议或安全性/弃用提示，而不是验证器错误
6. **阅读错误消息**——其中包含修复指导

**验证流程**：
1. 验证 → 读取错误 → 修复 → 再次验证
2. 重复此过程，直到验证通过（通常需要 2-3 次迭代）
3. 检查警告并决定是否可以接受
4. 满怀信心地部署

**相关技能与工具**：
- n8n MCP 工具专家 - 正确使用验证工具
- n8n 表达式语法 - 修复表达式错误
- n8n 节点配置 - 了解必填字段
- `n8n_audit_instance` - 主动进行安全验证（硬编码的密钥、未经过身份验证的 Webhook、缺少错误处理、数据保留）。