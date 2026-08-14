---
name: n8n-code-javascript
description: Write JavaScript code in n8n Code nodes. Use when writing JavaScript in n8n, using $input/$json/$node syntax, making HTTP requests with this.helpers / the $helpers global, working with dates using DateTime, troubleshooting Code node errors, choosing between Code node modes, or doing any custom data transformation in n8n. Always use this skill when a workflow needs a Code node — whether for data aggregation, filtering, API calls, format conversion, batch processing logic, or any custom JavaScript. Covers SplitInBatches loop patterns, cross-iteration data, pairedItem, and real-world production patterns. Also use when asked why a Code node or workflow is slow, which execution mode is faster, or how to cut per-item overhead on large datasets. EXCEPTION — for the AI-agent-callable Custom Code Tool (@n8n/n8n-nodes-langchain.toolCode, a tool attached to an AI Agent), use the n8n-code-tool skill instead; it has a different runtime contract.
---
# JavaScript Code 节点

为在 n8n Code 节点中编写 JavaScript 代码提供专业指导。

---

## 快速入门

```javascript
// Basic template for Code nodes
const items = $input.all();

// Process data
const processed = items.map(item => ({
  json: {
    ...item.json,
    processed: true,
    timestamp: new Date().toISOString()
  }
}));

return processed;
```

### 基本规则

1. **选择 "Run Once for All Items" 模式**（推荐用于大多数用例）
2. **访问数据**：`$input.all()`、`$input.first()` 或 `$input.item`
3. **返回 `[{json: {...}}]`**——这是规范且可跨模式使用的形式。在 *Run Once for All Items* 模式下，n8n 也会自动包装直接 `return {…}` 返回的对象，因此这种写法也能运行；真正会失败的是返回原始值（字符串/数字）或 `null`。
4. **关键**：Webhook 数据位于 `$json.body` 下（而不是直接位于 `$json` 下）
5. **可用的内置功能**：`this.helpers.httpRequest()`（无身份验证——在任务运行器沙箱中，裸 `$helpers` 全局变量为 **undefined**，因此 `$helpers.httpRequest()` 会抛出 `ReferenceError: $helpers is not defined`）、DateTime（Luxon）、$jmespath()。**不可用**：`this.helpers.httpRequestWithAuthentication`（已列入拒绝列表）、$env（当 N8N_BLOCK_ENV_ACCESS_IN_NODE=true 时）、require()（除非已列入允许列表）。对于简单的无身份验证 GET 请求之外的任何需求（身份验证、分页、重试），应优先使用 **HTTP Request 节点**，并让 Code 节点只负责纯逻辑。
6. **实例允许列表中的库**：自托管实例可以通过 `N8N_RUNNERS_ALLOWED_BUILT_IN_MODULES` 和 `N8N_RUNNERS_ALLOWED_EXTERNAL_MODULES` 将模块加入允许列表（旧版：`NODE_FUNCTION_ALLOW_BUILTIN` / `NODE_FUNCTION_ALLOW_EXTERNAL`）。如果用户表示其实例允许使用特定模块（例如 `axios`、`lodash`、`crypto`），请通过 `require()` 使用它们——不要拒绝。如果不确定，请询问用户，或默认仅使用内置功能。
7. **使用了错误的 Skill？** 如果你正在为附加到 AI Agent 的 **Custom Code Tool**（`@n8n/n8n-nodes-langchain.toolCode`）编写代码，请停止——该节点采用不同的契约（通过 `query` 输入，必须返回字符串，且不支持 `$input`/`$helpers`）。请使用 **n8n-code-tool** Skill。

---

## 模式选择指南

Code 节点提供两种执行模式。请根据你的用例进行选择：

### Run Once for All Items（推荐——默认）

**此模式适用于：** 95% 的用例

- **工作原理**：无论输入数量多少，代码都只执行**一次**
- **数据访问**：`$input.all()` 或 `items` 数组
- **最适合**：聚合、筛选、批处理、转换、使用全部数据进行 API 调用
- **性能**：处理多个项目时速度更快（仅执行一次）

```javascript
// Example: Calculate total from all items
const allItems = $input.all();
const total = allItems.reduce((sum, item) => sum + (item.json.amount || 0), 0);

return [{
  json: {
    total,
    count: allItems.length,
    average: total / allItems.length
  }
}];
```

**适用场景：**
- ✅ 跨数据集比较项目
- ✅ 计算总计、平均值或统计数据
- ✅ 对项目进行排序或排名
- ✅ 去重
- ✅ 构建聚合报告
- ✅ 合并来自多个项目的数据

### 为每个条目运行一次

**此模式适用于：** 仅限特殊情况

- **工作方式**：代码会针对每个输入条目**单独**执行
- **数据访问**：`$input.item` 或 `$item`
- **最适合**：条目特定逻辑、独立操作、逐条目验证
- **性能**：处理大型数据集时较慢（会执行多次）

```javascript
// Example: Add processing timestamp to each item
const item = $input.item;

return [{
  json: {
    ...item.json,
    processed: true,
    processedAt: new Date().toISOString()
  }
}];
```

**适用场景：**
- ✅ 每个条目都需要独立的 API 调用
- ✅ 对每个条目进行验证，并采用不同的错误处理方式
- ✅ 根据条目属性执行条目特定的转换
- ✅ 业务逻辑要求分别处理各个条目

**快速决策：**
- **需要查看多个条目？** → 使用 "All Items" 模式
- **每个条目都完全独立？** → 使用 "Each Item" 模式
- **不确定？** → 使用 "All Items" 模式（始终可以在内部循环）

### 为什么 "All Items" 更快——逐条目边界

模式选择是 Code 节点中影响性能最大的单一因素。每个*逐条目*执行上下文都会产生设置开销（在 n8n 2.x 上使用小型记录测得）：

| 每个条目执行的内容 | 近似开销 |
|---|---|
| Code **All Items**（整个集合只运行一次） | ~0.02 ms/item |
| 任意节点中的表达式（IF / Set / 等） | ~0.2 ms/item |
| Code **Each Item**（每个条目使用一个完整沙箱） | ~0.6 ms/item — 约为 All Items 的 25–30 倍 |

因此，对 10k 个条目使用 `Run Once for Each Item` 会产生约 6 秒的纯开销，而使用 `Run Once for All Items` 仅约为 0.2 秒。只有当条目确实需要隔离时（独立错误处理，或无法批处理的逐条目 API 调用）才使用 Each Item；否则，请在一个 All Items 节点*内部*进行循环。表达式本身的复杂度几乎不会带来开销（约 90% 的成本来自逐条目上下文，而不是你的代码），并且每次节点→节点的跳转都会重新复制所有条目——因此，应减少逐条目边界的*数量*，而不是对每个边界进行微优化。当条目数量少于几百时，这些都无关紧要；应在热路径上应用这些优化（条目数量大、I/O 较少）。

**另请参阅**：[DATA_ACCESS.md](DATA_ACCESS.md) → "Mode Performance"，了解相关推论、跳转成本和规模检查。

---

## 数据访问模式

有四种方式可以从上游节点提取数据。请注意，`$node["Name"]` 和 `$('Name')` 需要使用 `.first().json` 或 `.all()`——绝不能直接使用 `.json`。

```javascript
const allItems = $input.all();          // 1. All items — batch ops, aggregation (most common)
const data = $input.first().json;       // 2. First item — single objects, API responses
const item = $input.item;               // 3. Current item — "Each Item" mode ONLY (undefined otherwise)
const other = $node["Webhook"].json;    // 4. Named node — combine data across nodes
```

始终通过 `.json` 访问字段（例如，使用 `item.json.name`，而不是 `item.name`），并优先使用明确的 `$input.first().json.field`，而不是单独使用 `$json.field`。

**另请参阅**：[DATA_ACCESS.md](DATA_ACCESS.md) 中的完整指南——其中包含每种模式及其示例、决策树，以及常见错误（修改原始数据、缺少长度检查、在错误模式中使用 `$input.item`）。

---

## 关键：Webhook 数据结构

**最常见的错误**：Webhook 数据嵌套在 `.body` 下

```javascript
// ❌ WRONG - Will return undefined
const name = $json.name;
const email = $json.email;

// ✅ CORRECT - Webhook data is under .body
const name = $json.body.name;
const email = $json.body.email;

// Or with $input
const webhookData = $input.first().json.body;
const name = webhookData.name;
```

**原因**：Webhook 节点会将所有请求数据包装在 `body` 属性下。其中包括 POST 数据、查询参数和 JSON 载荷。

**参见**：[DATA_ACCESS.md](DATA_ACCESS.md) 以了解完整的 Webhook 结构详情

---

## 返回格式要求

**规范形式**：`[{json: {...}}]`——一个对象数组，其中每个对象都具有 `json` 属性。它含义明确，并且在两种执行模式下的工作方式完全相同，因此应将其作为默认形式。

在 *Run Once for All Items* 模式下，n8n 会在输出时自动规范化较宽松的结构：单个裸对象或裸对象数组都会自动包装在 `json` 下。因此，`return {foo: 1}` 可以正常运行。对于无法包装的值——因而会在运行时真正失败并报出“Code doesn't return items properly”错误的值——则是原始值（字符串/数字/布尔值）或 `null`/`undefined`。（n8n-mcp ≥ 2.63.0 不再将返回裸对象标记为错误；这反映了这种自动包装行为。）

### 正确的返回格式

```javascript
// ✅ Single result
return [{
  json: {
    field1: value1,
    field2: value2
  }
}];

// ✅ Multiple results
return [
  {json: {id: 1, data: 'first'}},
  {json: {id: 2, data: 'second'}}
];

// ✅ Transformed array
const transformed = $input.all()
  .filter(item => item.json.valid)
  .map(item => ({
    json: {
      id: item.json.id,
      processed: true
    }
  }));
return transformed;

// ✅ Empty result (when no data to return)
return [];

// ✅ Conditional return
if (shouldProcess) {
  return [{json: processedData}];
} else {
  return [];
}
```

### 非规范返回形式（会被自动包装——优先使用规范形式）

```javascript
// ⚠️ Auto-wrapped in All Items mode → [{json: {field: value}}]. Runs, but prefer the array form.
return {
  json: {field: value}
};

// ⚠️ Auto-wrapped → [{json: {field: value}}]. Runs, but add the json wrapper for clarity.
return [{field: value}];

// ✅ Fine — input items already carry a json property, so returning them unchanged is a valid passthrough
return $input.all();
```

### 确实会出错的返回形式

```javascript
// ❌ FAILS: primitive — n8n errors "Code doesn't return items properly"
return "processed";

// ❌ FAILS: null / undefined — nothing to pass to the next node
return null;
```

**其重要性**：规范的 `[{json: {...}}]` 形式含义明确，并且在两种模式下的行为相同。在 All Items 模式下，n8n 会自动规范化裸对象和对象数组，但原始值或 `null` 返回值无法被包装，并会导致执行停止。

**参见**：[ERROR_PATTERNS.md](ERROR_PATTERNS.md) #3 以了解详细的错误解决方案

---

## 常见模式概览

以下是生产工作流中最实用的 Code 节点形式。先来看一个简单示例——对所有项目进行求和/聚合：

```javascript
const items = $input.all();
const total = items.reduce((sum, item) => sum + (item.json.amount || 0), 0);
return [{ json: { total, count: items.length, average: total / items.length } }];
```

完整库涵盖 10 种模式：多源聚合、正则表达式过滤、Markdown/结构化文本解析、JSON 比较、CRM/表单转换、发布处理、带计算字段的数组转换、Slack Block Kit 格式化、Top-N 排名以及字符串聚合报告——每种模式都包含多个变体。

**请参阅**：[COMMON_PATTERNS.md](COMMON_PATTERNS.md)，了解 10 种详细的生产模式（以及最佳实践部分：验证输入、使用 try-catch、尽早过滤、优先使用数组方法而非循环、使用 console.log 调试）。

---

## 错误预防——最常见的错误

以下是 Code 节点中反复出现的故障，按大致发生频率排序：

1. **代码为空/缺少返回值**——始终以 `return [...]` 结尾，并确保*每个*分支都有返回值。
2. **将表达式语法用作代码**——不要在应使用 JavaScript 的地方编写 `{{ }}`（`return {{ $json.x }}` 会导致语法错误）。请使用 `` `${$json.field}` `` 或 `$input.first().json.field`。在字符串字面量*内部*使用 `{{ }}` 没有问题——它只是普通文本，n8n 不会对其求值。
3. **返回值结构**——推荐使用 `return [{json:{...}}]`。在 All Items 模式下，直接使用 `return {…}` 会被自动包装，但真正会导致失败的是返回原始值（字符串/数字）或 `null`。
4. **缺少空值检查**——使用可选链：`item.json?.user?.email || 'fallback'`。
5. **Webhook 请求体嵌套**——`$json.email` 是 undefined；请使用 `$json.body.email`。
6. **身份验证辅助函数被阻止**（`httpRequestWithAuthentication`）且 `$env` 被阻止——通过凭据/HTTP Request 节点传递密钥，而不是通过 Code 节点沙箱。

**请参阅**：[ERROR_PATTERNS.md](ERROR_PATTERNS.md)，获取完整指南——其中包含每种错误的错误/正确代码、转义规则、沙箱限制（错误 #6–#7）、预防检查清单以及错误消息快速查找表。

---

## 内置函数与辅助函数

```javascript
// HTTP requests (no auth — see sandbox note below)
const res = await this.helpers.httpRequest({ method: 'GET', url: 'https://api.example.com/data' });

// DateTime (Luxon): now, formatting, arithmetic
const now = DateTime.now();
const formatted = now.toFormat('yyyy-MM-dd');
const tomorrow = now.plus({ days: 1 });

// $jmespath() — query JSON structures
const adults = $jmespath($input.first().json, 'users[?age >= `18`]');

// $getWorkflowStaticData() — data that persists across executions
```

**沙箱（自 n8n v2.0 起，JsTaskRunnerSandbox）：**访问器为 `this.helpers.httpRequest()`——裸 `$helpers` 全局变量在此处为 **undefined**（`$helpers.httpRequest()` 会抛出 `ReferenceError`）。在 `this` 丢失的嵌套异步函数中，请以 `await fn.call(this, ...)` 的形式调用。`this.helpers.httpRequestWithAuthentication` 和 `this.helpers.requestWithAuthenticationPaginated` 已被列入拒绝列表（→ `UnsupportedFunctionError`）；对于需要身份验证的调用，请使用带凭据的 **HTTP Request 节点**（首选）、子工作流，或者仅在令牌已作为数据流经工作流时，才在 `this.helpers.httpRequest()` 上手动添加 `Authorization: Bearer ${token}` 标头。当 `N8N_BLOCK_ENV_ACCESS_IN_NODE=true` 时，`$env` 会被阻止；`require()` 仅适用于允许列表中的模块。`Buffer`、`URL` 和标准 JS 全局对象（Math、JSON、Object、Array）始终可用。

**参见**：[BUILTIN_FUNCTIONS.md](BUILTIN_FUNCTIONS.md) 获取完整参考资料——包括完整的 httpRequest 选项、所有 DateTime/Luxon 操作、JMESPath 模式、静态数据使用场景以及沙箱限制详情。

---

## 最佳实践

- **首先验证输入**——在处理前防范空数组或缺失 `.json` 的情况。
- **对有风险的操作使用 try-catch**（HTTP 调用），并返回错误对象，而不是让程序崩溃。
- **优先使用数组方法**（`filter`/`map`/`reduce`），而不是手动循环。
- **尽早筛选，最后转换**——在执行高成本操作之前缩小数据集。
- 使用**描述性名称**和 `console.log()` 进行调试（输出会发送到浏览器控制台）。

**参见**：[COMMON_PATTERNS.md](COMMON_PATTERNS.md) → “最佳实践”，获取每一项的代码示例。

---

## 生产环境注意事项

从真实部署中艰难总结出的经验——此处提供摘要，相关代码请参见 [DATA_ACCESS.md](DATA_ACCESS.md) → “生产环境注意事项”：

- **SplitInBatches 的输出不符合直觉**：`main[0]` = **完成**（所有批次处理完毕后触发一次），`main[1]` = **每个批次**（循环体）。为安全起见，请在完成输出后添加一个 **Limit 1** 节点。
- **迭代次数就是成本**：每次循环迭代都会通过引擎重新运行整个循环体（每次约有 0.8 ms 的开销）。`batchSize: 1` 相当于循环版本的 *Each Item*——请使用实际约束（速率限制、页面大小、内存）所允许的最大批次，或者完全不要使用循环。
- **跨迭代累积（关键）**：循环结束后，`$('Node Inside Loop').all()` 仅返回最后一次迭代中的条目。请通过 `$getWorkflowStaticData('global')` 进行累积（循环前重置、循环内追加、循环后读取）。
- **pairedItem**：当输出的条目无法与输入形成 1:1 映射时，请设置 `pairedItem: { item: i }`，否则下游 Set 节点会因 `paired_item_no_info` 而失败。
- **节点引用语法**：使用 `$('Node').first().json` 或 `$('Node').all()`——切勿直接在引用上使用 `.json`。
- **浮点数精度**：比较货币时应精确到分——使用 `Math.round(a*100) !== Math.round(b*100)`——以避免浮点噪声导致误报。

---

## 何时使用 Code 节点

> **在考虑使用 Code 节点之前，请先按照 n8n Expression Syntax skill 中的转换选择流程进行判断**：依次尝试表达式 → Edit Fields 字段内的箭头函数 IIFE → Code 节点。前两种方式可以覆盖大多数“转换此数据”任务，每次耗时约为 1–10ms；相比之下，Code 节点在沙箱中运行约需 500–1000ms——对于纯粹的单条目塑形，两者存在约 100 倍的差距，却没有功能上的区别。只有在需要对整个数据集进行聚合（`$input.all()`）、使用白名单库或执行异步工作时，才值得使用 Code 节点。此外，在为加密操作（HMAC、哈希、签名）或 XML/SOAP/RSS 解析编写代码之前，请先检查是否存在**原生节点**——n8n 提供了 Crypto 节点（`nodes-base.crypto`）和 XML 节点（`nodes-base.xml`），无需任何 JavaScript 即可处理这些任务。对于原生节点已经能够完成的工作却转而使用 Code，是最常见的误判之一。

在以下情况下使用 Code 节点：
- ✅ 需要多个步骤的复杂转换
- ✅ 自定义计算或业务逻辑
- ✅ 递归操作
- ✅ 解析具有复杂结构的 API 响应
- ✅ 多步骤条件判断
- ✅ 跨条目的数据聚合

在以下情况下，请考虑使用其他节点：
- ❌ 简单字段映射 → 使用 **Set** 节点
- ❌ 基础过滤 → 使用 **Filter** 节点
- ❌ 简单条件判断 → 使用 **IF** 或 **Switch** 节点
- ❌ 仅发送 HTTP 请求 → 使用 **HTTP Request** 节点

**Code 节点擅长处理**：原本需要串联多个简单节点才能实现的复杂逻辑

---

## 与其他技能集成

### 可配合使用：

**n8n 表达式语法**：
- 其他节点中的表达式使用 `{{ }}` 语法
- Code 节点直接使用 JavaScript（无需 `{{ }}`）
- 何时使用表达式，何时使用代码

**n8n MCP 工具专家**：
- 如何查找 Code 节点：`search_nodes({query: "code"})`
- 获取配置帮助：`get_node({nodeType: "nodes-base.code"})`
- 验证代码：`validate_node({nodeType: "nodes-base.code", config: {...}})`

**n8n 节点配置**：
- 模式选择（All Items 与 Each Item）
- 语言选择（JavaScript 与 Python）
- 理解属性依赖关系

**n8n 工作流模式**：
- 转换步骤中的 Code 节点
- Webhook → Code → API 模式
- 工作流中的错误处理

**n8n 验证专家**：
- 验证 Code 节点配置
- 处理验证错误
- 自动修复常见问题

---

## 快速参考检查清单

部署 Code 节点之前，请确认：

- [ ] **代码不为空** - 必须包含有意义的逻辑
- [ ] **存在 return 语句** - 返回数据项，而不是原始值/`null`
- [ ] **规范的返回格式** - 每个数据项：`{json: {...}}`（裸对象会被自动包装，但应显式指定）
- [ ] **数据访问正确** - 使用 `$input.all()`、`$input.first()` 或 `$input.item`
- [ ] **未将 `{{ }}` 作为代码编写** - 使用 JavaScript 模板字面量：`` `${value}` ``
- [ ] **错误处理** - 对 null/undefined 输入使用保护子句
- [ ] **Webhook 数据** - 如果数据来自 webhook，请通过 `.body` 访问
- [ ] **模式选择** - 大多数情况下使用“All Items”
- [ ] **性能** - 优先使用 map/filter，而不是手动循环
- [ ] **输出一致** - 所有代码路径都返回相同的结构

---

## 其他资源

### 相关文件
- [DATA_ACCESS.md](DATA_ACCESS.md) - 全面的数据访问模式
- [COMMON_PATTERNS.md](COMMON_PATTERNS.md) - 10 种经过生产环境检验的模式
- [ERROR_PATTERNS.md](ERROR_PATTERNS.md) - 最常见的 5 种错误及其解决方案
- [BUILTIN_FUNCTIONS.md](BUILTIN_FUNCTIONS.md) - 完整的内置功能参考

### n8n 文档
- Code 节点指南：https://docs.n8n.io/code/code-node/
- 内置方法：https://docs.n8n.io/code-examples/methods-variables-reference/
- Luxon 文档：https://moment.github.io/luxon/

---

**准备好在 n8n Code 节点中编写 JavaScript 了！** 从简单的转换开始，使用错误模式指南避免常见错误，并参考模式库中的生产就绪示例。