---
name: n8n-validation-expert
description: Interpret validation errors and guide fixing them. Use when encountering validation errors, validation warnings, false positives, operator structure issues, or need help understanding validation results. Also use when asking about validation profiles, error types, the validation loop process, or auto-fix capabilities. Consult this skill whenever a validate_node or validate_workflow call returns errors or warnings — it knows which warnings are false positives and which errors need real fixes.
---
# n8n 验证专家

解读并修复 n8n 验证错误的专家指南。

---

## 验证理念

**尽早验证，频繁验证**

验证通常是迭代进行的：
- 预期会经历多轮验证反馈
- 通常需要 2-3 次验证 → 修复循环
- 平均：花费 23 秒思考错误，58 秒修复错误

**关键洞察**：验证是一个迭代过程，而非一次完成！

---

## 错误严重级别

### 1. 错误（必须修复）
**阻止工作流执行** - 必须在激活前解决

**类型**：
- `missing_required` - 未提供必填字段
- `invalid_value` - 值与允许的选项不匹配
- `type_mismatch` - 数据类型错误（使用了字符串而不是数字）
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

### 2. 警告（应当修复）
**不会阻止执行** - 工作流可以激活，但可能存在问题

**类型**：
- `best_practice` - 建议但非必需 — 仅在 `ai-friendly` / `strict` 下显示
- `deprecated` - 使用旧 API/功能 — 在所有配置档案下显示
- `security` - 硬编码密钥、未经身份验证的 Webhook — 在所有配置档案下显示
- `performance` - 潜在的性能问题 — 提示性建议，在 `ai-friendly` / `strict` 下显示

**示例**（最佳实践 — 在 `ai-friendly` / `strict` 下显示）：
```json
{
  "type": "warning",
  "nodeName": "Slack",
  "message": "Slack API can have rate limits and transient failures"
}
```

### 3. 建议（可选）
**锦上添花** - 可以改进工作流的优化项

**类型**：
- `optimization` - 可以提高效率
- `alternative` - 实现相同结果的更好方式

---

## 验证循环

### 遥测数据中的模式
此模式共出现 **7,841 次**：

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

**这是正常现象！** 不要因为多次迭代而气馁。

---

## 验证配置档案

这四个配置档案是**逐级累加**的（n8n-mcp ≥ 2.63.0）：每个配置档案都会显示低一级配置档案的全部内容，并在此基础上显示更多内容。它们的分界线在于最佳实践*提示* — `minimal` 和 `runtime` 不显示这些提示；`ai-friendly` 和 `strict` 则会添加这些提示。除 `minimal` 会跳过少量配置级检查（例如对显式 `operation` 进行枚举验证）外，所有配置档案中的错误都相同。安全和弃用警告会在所有配置档案下显示。

### minimal
**适用场景**：在组装工作流时进行快速结构检查。

**可发现**：会导致执行停止的严重错误（缺少必填字段、代码为空、连接断开）。跳过枚举检查和所有建议。

**速度最快，限制最少。**

### runtime（推荐默认）
**适用场景**：构建过程中持续进行验证；适合日常使用的配置。

**可发现**：错误（必填字段、值类型、允许的值、依赖关系、失效引用），以及安全和弃用警告。**不包含**最佳实践建议。

**平衡之选——能捕获所有会导致故障的问题，同时不会对代码风格指手画脚。**

### ai-friendly
**适用场景**：希望在部署前获得最佳实践建议。

**可发现**：`runtime` 能发现的所有问题，**外加**最佳实践建议——针对各节点的“未进行错误处理”建议、“webhook 应始终发送响应”、速率限制提示、使用过时 `typeVersion` 的提示，以及 `cachedResultName` 和长链提示。

**注意**：`ai-friendly` 比 `runtime` *更严格*，而不是更宽松。（旧版文档曾将其描述为可减少误报——这只在配置门控失效期间属实；现在该问题已修复。）

### strict
**适用场景**：加固生产环境中的关键工作流。

**可发现**：`ai-friendly` 能发现的所有问题，**外加**残留属性检查（“属性 'X' 不会被使用——在当前设置下不可见”）。

**最全面的代码检查。** 误报问题已从源头修复，因此其警告是需要权衡的建议，而非需要对抗的噪声。

---

## 常见错误类型

五种核心错误类型，按出现频率大致排序如下：

- **`missing_required`**——未提供必填字段。使用 `get_node` 查看必填字段，然后将其添加。
- **`invalid_value`**——值与允许的选项不匹配（枚举区分大小写）。查看错误信息中的允许值列表或使用 `get_node`。
- **`type_mismatch`**——数据类型错误（字符串 `"100"` 与数字 `100`）。转换为预期类型。
- **`invalid_expression`**——表达式语法错误（缺少 `{{}}`、存在拼写错误）。请参阅 n8n Expression Syntax skill。
- **`invalid_reference`**——引用的节点不存在（已重命名、删除或名称拼写错误）。修正名称或使用 `cleanStaleConnections`。

第六类是 **`patchNodeField` 错误**（找不到目标、匹配结果不唯一、正则表达式无效或不安全），它会在执行 `n8n_update_partial_workflow` 期间某个 `patchNodeField` 操作失败时出现——这是有意采用的严格设计，它会报错，而不是静默地继续执行。

上述每种类型都有实际示例（错误配置 → 修复方案），此外，**[ERROR_CATALOG.md](ERROR_CATALOG.md)** 中还包含 `patchNodeField` 错误案例及其修复方法。

---

## 自动清理系统

在任何工作流更新时——无论是 `n8n_create_workflow`、`n8n_update_partial_workflow`，还是任意保存操作——**自动规范化常见运算符结构**。请信任该系统；不要手动修复这些结构。

**保存时会规范化的内容**：
- **二元运算符**（equals、notEquals、contains、notContains、greaterThan、lessThan、startsWith、endsWith）——移除多余的 `singleValue` 属性。
- **一元运算符**（isEmpty、isNotEmpty、true、false）——添加 `singleValue: true`。
- **IF/Switch 元数据**——为 IF v2.2+ 和 Switch v3.2+ 补全 `conditions.options`。

**验证不再对这些结构报错**（n8n-mcp ≥ 2.63.0）。n8n 会根据运算符名称推导其是否为一元运算符，并为 `conditions.options` 的子字段提供默认值，因此，无论是否存在 `singleValue` 和选项元数据，`validate_node` / `validate_workflow` 都会接受该条件——清理器只会在保存时将其整理为规范形式。（旧版服务器会错误地对未规范化的结构报错；如果遇到这种情况，请升级。）仍然属于真正错误的情况包括：v2 节点上使用了 v1 结构的 `conditions` 对象、没有任何条件的空过滤器，以及在 v2 结构中使用旧版 v1 运算符名称（例如 `smaller`）。

**清理器无法修复的内容**（需手动处理）：指向不存在节点的断开连接（使用 `cleanStaleConnections`）、分支数量不匹配（添加或删除连接或规则），以及存在矛盾的损坏状态（可能需要手动干预数据库）。

前后对比示例以及无法修复内容的完整详情，请参阅 **[ERROR_CATALOG.md](ERROR_CATALOG.md)**（自动清理章节）。

---

## 误报

验证器全面改进后（n8n-mcp ≥ 2.63.0），已消除以往常见的误报——表达式中的模板字面量、可选链、被省略的操作默认值、Webhook → Respond-to-Webhook 模式、IF/Filter 旧版结构等都不会再触发警报。现在已不存在需要忽略的固定“已知误报”列表。

目前剩余的是**最佳实践建议**（仅在 `ai-friendly` / `strict` 下显示），它们会提示真实存在的权衡，但在你的具体场景中可能是可以接受的。并非每条建议都需要修复——许多建议取决于具体上下文。以下是常见建议，以及各自在什么情况下可以接受、什么情况下值得修复：

- **“……没有错误处理”**——对于开发/测试和非关键通知，可以接受；对于处理重要数据的生产环境，应予以修复。（这绝不会是硬性错误——代码风格不会阻止执行。）
- **“没有重试逻辑”**——对于幂等操作、自带重试机制的 API、手动触发器，可以接受；对于不稳定的外部服务和生产自动化，应予以修复。
- **“……速率限制和瞬时故障”**——对于内部、低流量或由服务器端限制的 API，可以接受；对于公共、高流量 API，应予以修复。
- **“无界查询”**——对于规模较小且已知的数据集、聚合操作、开发/测试，可以接受；对于在大型表上执行的生产查询，应予以修复。

相比之下，安全和弃用警告会在*所有*配置中显示，应将其视为实际问题。

针对每种情况的完整指导、不再被验证器标记的内容列表、配置策略、“我应该修复这个问题吗？”决策框架，以及如何记录已接受的建议，请参阅 **[FALSE_POSITIVES.md](FALSE_POSITIVES.md)**。

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

### 如何阅读结果

1. **首先检查 `valid`** — `true` 表示配置有效；`false` 表示存在必须在部署前修复的错误。
2. **优先修复 `errors`** — 每个错误都包含 `property`、`message` 和 `fix`。这些错误必须解决。
3. **审查 `warnings`** — 每个警告都包含 `message` 和 `suggestion`；请根据具体情况决定是否处理（参见上文的“误报”）。
4. **考虑 `suggestions`** — 这些是可选的改进建议，并非必须实施。

---

## 工作流验证

### validate_workflow（结构）
**验证整个工作流**，而不仅仅是单个节点

**检查项**：
1. **节点配置** - 每个节点均有效
2. **连接** - 不存在无效引用
3. **表达式** - 语法和引用有效
4. **流程** - 工作流逻辑结构合理

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

#### 1. 断开的连接
```json
{
  "error": "Connection from 'Transform' to 'NonExistent' - target node not found"
}
```

**修复方法**：移除过时的连接或创建缺失的节点

#### 2. 循环（警告，而非错误）
```json
{
  "warning": "Workflow contains a cycle: Node A → Node B → Node A"
}
```

循环是**警告**，而非严重错误（n8n-mcp ≥ 2.63.0）— 由运行时控制的循环（错误重试、数据驱动的分页、路由器回馈）会执行至完成，并且是合理的。仅在循环并非有意设计时才需要**修复**：确保循环存在真正的退出机制（条件节点、错误输出或有上限的计数器），使其不会无限运行。

#### 3. 多个起始节点
```json
{
  "warning": "Multiple trigger nodes found - only one will execute"
}
```

**修复方法**：移除多余的触发器，或将其拆分为单独的工作流

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
1. 记录 `get_node` 中的必填字段
2. 创建最小有效配置
3. 逐步添加功能
4. 每次添加后进行验证

### 策略 2：二分查找
**适用情况**：工作流能够通过验证，但执行结果不正确

**步骤**：
1. 移除一半节点
2. 验证并测试
3. 如果正常：问题出在已移除的节点中
4. 如果仍然失败：问题出在剩余节点中
5. 重复上述步骤，直到定位问题

### 策略 3：清理过时连接
**适用情况**：出现“找不到节点”错误

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
**适用情况**：验证错误可以自动解决

**步骤**：
```javascript
// Preview fixes (default - doesn't apply)
n8n_autofix_workflow({
  id: "workflow-id",
  applyFixes: false,
  confidenceThreshold: "medium"  // high, medium, low
})

// Review fixes, then apply
n8n_autofix_workflow({
  id: "workflow-id",
  applyFixes: true
})
```

---

## 自动修复能力

`n8n_autofix_workflow` 工具可以修复以下类型的问题：

1. **expression-format** - 表达式缺少 `=` 前缀（例如，`{{ $json.field }}` → `={{ $json.field }}`）
2. **typeversion-correction** - 降级使用不受支持的 typeVersions 的节点
3. **error-output-config** - 移除相互冲突的 onError 设置
4. **node-type-correction** - 使用相似度匹配修复未知节点类型（置信度 90% 以上）
5. **webhook-missing-path** - 为缺少 path 配置的 webhook 节点生成 UUID
6. **typeversion-upgrade** - 通过自动迁移智能升级到最新节点版本
7. **version-migration** - 为需要手动操作的复杂破坏性变更提供指导

**置信度级别**：`high`（90% 以上，可安全地自动应用）、`medium`（70-89%，建议审核）、`low`（低于 70%，需要手动审核）

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
- 迭代修复错误（一次修复一个）
- 在部署前使用 `runtime` 配置文件
- 在认定成功之前检查 `valid` 字段
- 对操作符问题信任自动清理机制
- 不清楚要求时使用 `get_node`
- 记录你所接受的误报

### ❌ 不应该做

- 激活前跳过验证
- 尝试一次性修复所有错误
- 忽略错误消息
- 在开发期间使用 `strict` 配置文件（噪声过多）
- 假定验证已通过（始终检查结果）
- 手动修复自动清理问题
- 在仍有未解决错误的情况下部署
- 忽略所有警告（有些警告很重要！）

---

## 审查现有工作流

在构建过程中进行验证（即上述循环）旨在捕获你正在开发的工作流中的 schema 和结构错误。**审查现有工作流**——无论是你自己的，还是别人交给你的——则是一项不同的工作：该工作流已经顺利通过 `validate_workflow`，而你要查找的是验证无法发现的问题（静默连接错误、容易受到注入攻击的查询、会丢弃项目的 Switch、Set/Code 反模式、缺少错误处理路径）。为此，请使用 `n8n_get_workflow` 拉取工作流，并逐项检查 **[REVIEW_CHECKLIST.md](REVIEW_CHECKLIST.md)**——这是一份按严重程度分级的审计清单（MUST FIX / SHOULD FIX / NICE TO HAVE），其中每一项都会指向用于修复该问题的权威技能文档。同时运行 `n8n_audit_instance`，以发现整个实例中的硬编码机密信息和未经身份验证的 webhook。

---

## 详细指南

有关完整的错误目录、误报和工作流审查，请参阅：

- **[ERROR_CATALOG.md](ERROR_CATALOG.md)** - 包含示例的完整错误类型列表
- **[FALSE_POSITIVES.md](FALSE_POSITIVES.md)** - 警告在什么情况下可以接受
- **[REVIEW_CHECKLIST.md](REVIEW_CHECKLIST.md)** - 用于审查现有工作流的严重程度分级审计清单

---

## 总结

**要点**：
1. **验证是一个迭代过程**（平均 2-3 个周期，23 秒 + 58 秒）
2. **错误必须修复**，警告可选择处理
3. **自动清理**会在保存时规范化操作符结构；验证器不再因原始结构而报错
4. 默认使用运行时配置；如需最佳实践建议，请升级为 `ai-friendly`/`strict`
5. **经典误报已修复**（≥ 2.63.0）——剩余警告属于建议或安全/弃用通知，并非验证器错误
6. **阅读错误消息**——其中包含修复指导

**验证流程**：
1. 验证 → 阅读错误 → 修复 → 再次验证
2. 重复此过程，直到验证通过（通常需要 2-3 次迭代）
3. 查看警告并判断是否可接受
4. 放心部署

**相关技能和工具**：
- n8n MCP Tools Expert - 正确使用验证工具
- n8n Expression Syntax - 修复表达式错误
- n8n Node Configuration - 了解必填字段
- `n8n_audit_instance` - 主动进行安全验证（硬编码密钥、未经身份验证的 Webhook、缺少错误处理、数据保留）