---
name: n8n-code-tool
description: "Write JavaScript or Python for the n8n Custom Code Tool (@n8n/n8n-nodes-langchain.toolCode) — the AI-agent-callable tool, NOT the workflow Code node. Use when building a Code Tool attached to an AI Agent, writing code that an LLM will invoke, parsing the `query` input, returning a string result, defining an input schema for structured arguments (specifyInputSchema, jsonSchemaExample, DynamicStructuredTool), or troubleshooting errors like \"Wrong output type returned\", \"No execution data available\", \"The response property should be a string, but it is an object\", \"Cannot assign to read only property 'name'\", or an AI agent that refuses to call the tool. Covers the critical differences between Code node and Code Tool: return format (string vs `[{json:{...}}]`), unavailability of `$fromAI`/`$input`/`$helpers` in the Code Tool sandbox, naming rules for AI invocation, and when to use `toolWorkflow`/HTTP Request Tool instead."
---
# n8n 自定义代码工具

关于在 `@n8n/n8n-nodes-langchain.toolCode` 中编写代码的专业指南——这是一个可供 AI Agent 调用的工具，**不是**常规的工作流 Code 节点。

---

## ⚠️ 这不是 Code 节点

自定义代码工具在编辑器中看起来与 Code 节点相似——同样的 JavaScript 编辑器、相似的布局——但它是来自不同软件包、具有**不同运行时契约**的**完全不同的节点**。

| | Code 节点 | 自定义代码工具 |
|---|---|---|
| **节点类型** | `n8n-nodes-base.code` | `@n8n/n8n-nodes-langchain.toolCode` |
| **软件包** | `n8n-nodes-base` | `@n8n/n8n-nodes-langchain` |
| **调用方** | 上一个节点（工作流流转） | AI Agent（LangChain） |
| **输入** | `$input.all()` — 数据项流 | `query` — 来自 LLM 的字符串或对象 |
| **返回值** | `[{json: {...}}]`（数据项数组） | **字符串** |
| **`$fromAI()`** | 不适用 | **不可用**（参见错误） |
| **HTTP 辅助函数** | `this.helpers.httpRequest`（认证辅助函数被禁用） | 未暴露给工具沙箱 |
| **状态** | 每次运行的执行数据 | 无 `getContext`，无 `$getWorkflowStaticData` |

**如果把它当作 Code 节点使用，它就会失败。** 本技能的其余部分将介绍 Code Tool 的实际契约。

---

## 快速入门

### 最简 JavaScript Code Tool

```javascript
// `query` is whatever the AI sent (a string by default)
return `You asked: ${query}`;
```

### 最简 Python Code Tool

```python
# `_query` is whatever the AI sent (a string by default)
return f"You asked: {_query}"
```

### 基本规则

1. **返回字符串。** 数字会自动转换。返回其他任何类型都会抛出 `"The response property should be a string, but it is an object"`。
2. **输入变量是固定的**：`query`（JS）、`_query`（Python）。不能重命名。
3. **不要在 Code Tool 沙箱中使用 `$fromAI()`**——它会抛出 `"No execution data available"`。
4. **不要使用 `[{json: {...}}]`** 返回格式——那是 Code 节点使用的格式。否则会抛出 `"Wrong output type returned"`。
5. **使用描述性的工具名称**（字母/数字/下划线，v1.1+）。Agent 通过名称调用工具。
6. **编写准确的描述**——LLM 会根据描述决定是否调用该工具。

---

## 两种输入模式

Code Tool 有两种输入形式，由 `specifyInputSchema` 控制：

### 模式 1：非结构化（默认，`specifyInputSchema: false`）

AI 将**单个字符串**作为 `query` 传入。如果需要多个字段，AI 必须将它们都塞进这一个字符串中，然后由你解析。实际使用中，如果在描述里明确要求，LLM 通常很乐意传入 JSON 字符串。

```javascript
// Parse a JSON string the AI sent
let params;
try {
  params = typeof query === 'string' ? JSON.parse(query) : query;
} catch (e) {
  throw new Error('Expected a JSON object. Parser said: ' + e.message);
}
const price = Number(params.price);
const months = Number(params.months);
// ...
return JSON.stringify({ monthly_payment: /* ... */ });
```

**优点**：设置最简单，只需描述一个字段。
**缺点**：没有模式验证——如果 LLM 遗漏某个字段，工具会在运行时抛出错误。

**最适合**：快速原型、只有一个自然输入的工具（问题、URL、一段文本）。

### 模式 2：结构化（`specifyInputSchema: true`）

工具会变成 LangChain `DynamicStructuredTool`。LLM 会看到带类型的参数模式，并将一个**经过验证的对象**作为 `query` 传入。你可以直接访问各个字段。

```javascript
// query is now an object matching your schema
const price = query.price;
const months = query.months;
const residual_percent = query.residual_percent;

const monthly = computeAnnuity(price, months, residual_percent);
return JSON.stringify({ monthly_payment: monthly });
```

模式可通过以下任一方式定义：
- `schemaType: "fromJson"` + `jsonSchemaExample`（n8n v≥1.3）——粘贴一个 JSON 示例，n8n 会推断模式
- `schemaType: "manual"` + `inputSchema`——自行编写完整的 JSON Schema

**优点**：LLM 可获得类型提示，无效调用会在代码运行前被拒绝，代码更简洁。
**缺点**：需要进行少量额外设置；要求 n8n 版本支持模式。

**最适合**：具有多个带类型参数的生产工具（计算器、API 封装，以及任何包含容易被 LLM 字符串化的数值字段的工具）。

**另请参阅**：[INPUT_SCHEMA.md](INPUT_SCHEMA.md)，了解完整的模式设置方法。

---

## 返回格式

**返回值必须是字符串。** LLM 会将其作为工具的观察结果读取。

```javascript
// ✅ String
return "42";

// ✅ Number (auto-converted to string by n8n)
return 42;

// ✅ JSON-encoded structured result (recommended for rich output)
return JSON.stringify({ result: 42, currency: "SEK" });

// ❌ Raw object → "The response property should be a string, but it is an object"
return { result: 42 };

// ❌ Workflow item format → "Wrong output type returned"
return [{ json: { result: 42 } }];

// ❌ Array → "The response property should be a string, but it is an object"
return [1, 2, 3];
```

### 最佳实践：使用 JSON 字符串化结构化结果

当工具的输出不只是简单的标量时，请返回 JSON 字符串：

```javascript
return JSON.stringify({
  monthly_payment_sek: 5405,
  loan_amount: 351920,
  total_cost_of_credit: 63295
});
```

LLM 能够可靠地解析 JSON，并选取向用户展示时所需的字段。

### 错误处理：代理会读取失败信息

错误不只是会停止工作流——它们还会返回给 LLM，而 LLM 通常会修正调用并重试。请利用这一点：

```javascript
// Option A: throw — n8n surfaces the message to the agent
if (!isFinite(price)) throw new Error('price must be a number, e.g. 439900');

// Option B: return an error string — agent reads it like any tool result
if (!isFinite(price)) return JSON.stringify({ error: 'price must be a number, e.g. 439900' });
```

无论采用哪种方式，都要编写**供 LLM 阅读的**错误消息：说明错误所在，并指出有效调用应是什么样的。仅仅使用 `throw new Error('invalid input')` 会浪费一次重试机会；有指导性的消息通常能让下一次调用得到修正。

---

## 工具名称和描述

这些字段不是文档——它们是 **LLM 所看到的工具契约**。请将其视为提示词工程。

### 名称
- 必须匹配 `[A-Za-z0-9_]+`（v1.1+）。不能包含空格、连字符或表情符号。
- 使用具有动词含义的描述性名称：`calculate_car_loan`、`get_weather`、`search_orders`。
- 智能体通过此名称调用工具。`Code Tool`（默认名称）毫无用处——智能体不知道何时应该调用它。

### 描述
- 说明**何时**使用它以及**要发送什么**。
- 如果使用非结构化模式，**请包含一个 LLM 应发送的 JSON 字符串示例**。
- 如果使用结构化模式，schema 本身已经足以说明格式——只需描述用途。

**非结构化示例（JSON-in-string 模式）：**
```
Deterministiskt beräknar månadskostnad för billån. Anropa med EN JSON-sträng:
{"price":439900,"down_payment":87980,"interest_rate":6.95,"months":36,"residual_percent":50}
Fält: price (SEK), down_payment (SEK), interest_rate (% per år), months, residual_percent (0-99).
```

**结构化示例（由 schema 定义）：**
```
Deterministically computes the monthly car-loan payment given price, down payment, 
annual interest rate, term, and residual percent. Use whenever the user asks for 
monthly cost, total credit cost, or loan breakdown.
```

---

## 常见错误及修复方法

### 错误 1：`"There was an error: 'Cannot assign to read only property \"name\" of object: Error: No execution data available'"`

**原因**：你在 Code Tool 沙箱内调用了 `$fromAI()`。

**修复方法**：`$fromAI()` 是供**其他**支持工具的节点（HTTP Request Tool、SendGrid Tool、`toolWorkflow` 等）使用的辅助函数——它不会暴露在 `toolCode` 内。直接从 `query` 读取 AI 的输入（或者使用 `specifyInputSchema` 定义结构化字段）。

### 错误 2：`"Wrong output type returned"`

**原因**：你返回了工作流样式的数组，例如 `[{ json: { ... } }]`。这是 Code **node** 的契约，而不是 Code **Tool** 的契约。

**修复方法**：返回字符串。对于结构化数据，使用 `return JSON.stringify(output)`。

### 错误 3：`"The response property should be a string, but it is an object"`

**原因**：你返回了普通对象或数组。

**修复方法**：使用 `JSON.stringify()` 序列化结果，或者将其强制转换为字符串。

### 错误 4：AI 从不调用工具

**原因**：工具名称过于笼统（`Code Tool`、`My Tool`），或者描述没有明确说明何时应使用它。

**修复方法**：将其重命名为具有动词含义的名称（`calculate_car_loan`），并重写描述，明确说明触发条件（例如“只要用户询问每月费用，就使用此工具”）。

### 错误 5：AI 向 `query` 发送无效内容

**原因**：非结构化工具的描述过于模糊。LLM 只能猜测输入格式。

**修复方法**：可以选择 (a) 在描述中包含一个具体的 JSON 示例，或者 (b) 切换到 `specifyInputSchema: true`，让 LLM 获得类型化 schema。

**另请参阅**：[ERROR_PATTERNS.md](ERROR_PATTERNS.md)，其中包含带复现步骤的完整目录。

---

## 沙箱中不可用的功能

Code Tool 沙箱比 Code node 沙箱的限制**更严格**。不要假设辅助函数也可在其中使用：

| 辅助函数 | Code node | Code Tool |
|---|---|---|
| `$input.all()`, `$input.first()`, `$input.item` | ✅ | ❌ |
| `$node["NodeName"]` | ✅ | ❌ |
| `$json`, `$binary` | ✅ | ❌ |
| `$fromAI()` | ❌ | ❌（尽管它就在 AI 智能体旁边） |
| `this.helpers.httpRequest()` | ✅ | ❌ |
| `DateTime` (Luxon) | ✅ | ✅（JS 沙箱中的标准功能） |
| `$jmespath()` | ✅ | ❌ |
| `this.getContext(...)` | ✅ | ❌ |
| `$getWorkflowStaticData(...)` | ✅ | ❌ |

**含义**：Code Tool 用于**纯计算**。如果你需要发起 HTTP 调用、执行 API 查询或维护跨调用状态，请使用其他工具节点：
- 使用 HTTP Request Tool 调用外部 API
- 使用 `toolWorkflow`（Call Sub-workflow Tool）处理需要访问完整 Code 节点沙箱的多步骤逻辑
- 使用 MCP / 数据库工具维护持久状态

---

## 何时使用 Code Tool，何时使用替代方案

在以下情况下使用 **Code Tool**：
- ✅ 纯确定性计算（数学运算、解析、格式化、验证）
- ✅ 不应由 LLM 自行完成的轻量级转换（精确数学运算、正则表达式）
- ✅ 你希望将代码直接内嵌在工作流中，而不是放在单独的子工作流中

在以下情况下使用 **`toolWorkflow`**（Call Sub-workflow Tool）：
- ✅ 你需要多个参数，并希望使用清晰的 `$fromAI()` 类型定义
- ✅ 你需要访问 `this.helpers`、凭据或其他节点
- ✅ 逻辑可在多个智能体之间复用
- ✅ 你希望获得结构化的强类型输入，而无需编写 JSON Schema

在以下情况下使用 **HTTP Request Tool**：
- ✅ 该工具本质上是单次 API 调用
- ✅ 你希望在 URL、查询参数或请求正文中逐个绑定 `$fromAI()` 参数

**经验法则**：如果你发现自己想使用 `$fromAI()`，那么你可能应该使用 `toolWorkflow`，而不是 `toolCode`。

---

## 完整的可运行示例

一个生产级计算器工具（非结构化、字符串内嵌 JSON 模式）：

```json
{
  "parameters": {
    "name": "calculate_car_loan",
    "description": "Computes monthly car-loan payment using an annuity formula with residual/balloon. Call with a single JSON string. Example: {\"price\":439900,\"down_payment\":87980,\"interest_rate\":6.95,\"months\":36,\"residual_percent\":50,\"setup_fee\":695,\"monthly_admin_fee\":59}. Required: price, down_payment, interest_rate, months, residual_percent. Optional: setup_fee, monthly_admin_fee (default 0).",
    "language": "javaScript",
    "jsCode": "let params;\ntry {\n  params = typeof query === 'string' ? JSON.parse(query) : query;\n} catch (e) {\n  throw new Error('Invalid JSON: ' + e.message);\n}\n\nconst price           = Number(params.price);\nconst down_payment    = Number(params.down_payment);\nconst interest_rate   = Number(params.interest_rate);\nconst months          = Number(params.months);\nconst residual_percent= Number(params.residual_percent);\nconst setup_fee       = Number(params.setup_fee ?? 0) || 0;\nconst monthly_admin_fee = Number(params.monthly_admin_fee ?? 0) || 0;\n\nif (!isFinite(price) || price <= 0) throw new Error('price must be > 0');\nif (down_payment < 0 || down_payment >= price) throw new Error('down_payment must be in [0, price)');\n\nconst principal = price - down_payment;\nconst residual  = price * (residual_percent / 100);\nconst r = interest_rate / 100 / 12;\nconst growth = Math.pow(1 + r, months);\nconst base = r === 0\n  ? (principal - residual) / months\n  : (principal - residual / growth) * r / (1 - 1 / growth);\nconst monthly_payment = base + monthly_admin_fee;\n\nreturn JSON.stringify({\n  monthly_payment_sek: Math.round(monthly_payment),\n  loan_amount: Math.round(principal),\n  residual_value_sek: Math.round(residual),\n  total_cost_of_credit: Math.round(monthly_payment * months + residual + setup_fee - principal)\n});"
  },
  "type": "@n8n/n8n-nodes-langchain.toolCode",
  "typeVersion": 1.3,
  "name": "calculate_car_loan"
}
```

通过 `ai_tool` 连接类型将其接入 AI Agent。

---

## 与其他 Skill 的集成

**n8n-code-javascript**：Code **节点** Skill。大多数 JavaScript 模式（数组、map/filter、DateTime）都可以迁移——但 I/O 契约不同。不要复制数据访问代码。

**n8n-node-configuration**：`specifyInputSchema` 是一个典型的由 displayOptions 驱动的条件字段。在 `@n8n/n8n-nodes-langchain.toolCode` 上使用 `get_node({detail: "standard"})` 查看与 schema 相关的属性。

**n8n-workflow-patterns**：Code Tool 位于“带工具的 AI Agent”模式中。一个 Agent 通常有多个工具；Code Tool 是“本地计算”选项。

**n8n-validation-expert**：上面列出的三个 Code Tool 错误具有明确的特征——如果验证中出现“Wrong output type returned”，就应将返回值从条目数组改为字符串。

---

## 快速参考清单

部署 Code Tool 之前：

- [ ] **节点类型**是 `@n8n/n8n-nodes-langchain.toolCode`（而不是 `nodes-base.code`）
- [ ] **工具名称**具有描述性、采用动词形式并使用 snake_case（例如 `calculate_car_loan`）
- [ ] **描述**说明何时使用该工具，并且（如果是非结构化输入）提供一个 JSON 示例
- [ ] **输入**从 `query`（JS）或 `_query`（Python）读取
- [ ] 代码主体中**没有 `$fromAI()`**
- [ ] **没有 `$input` / `$json` / `$helpers`**——这些在沙箱中不可用
- [ ] **返回值**是字符串（结构化输出使用 `JSON.stringify()`）
- [ ] 通过 `ai_tool` 连接**接入** AI Agent
- [ ] 已使用 LLM 将发送的确切输入类型进行**测试**（字符串中的 JSON，或经过 schema 验证的对象）

---

## 其他资源

- [INPUT_SCHEMA.md](INPUT_SCHEMA.md)——深入讲解结构化输入（DynamicStructuredTool）
- [ERROR_PATTERNS.md](ERROR_PATTERNS.md)——完整的错误目录，包括原因和修复方法

### 官方来源
- [n8n Custom Code Tool 文档](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolcode/)
- [ToolCode 源代码](https://github.com/n8n-io/n8n/blob/master/packages/%40n8n/nodes-langchain/nodes/tools/ToolCode/ToolCode.node.ts)——沙箱契约
- [LangChain 工具文档](https://js.langchain.com/docs/modules/agents/tools/)——DynamicTool / DynamicStructuredTool

---

**请记住**：Code Tool 是一个采用 Code 节点 UI 的 LangChain 工具。其契约是：**输入字符串，输出字符串**。其他一切都由此而来。