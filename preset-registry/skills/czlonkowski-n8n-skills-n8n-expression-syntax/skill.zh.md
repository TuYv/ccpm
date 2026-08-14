---
name: n8n-expression-syntax
description: Validate n8n expression syntax and fix common errors. Use when writing n8n expressions, using {{}} syntax, accessing $json/$node variables, troubleshooting expression errors, mapping data between nodes, or referencing webhook data in workflows. Use this skill whenever configuring node fields that reference data from previous nodes — expressions are how n8n passes data between nodes, and getting the syntax wrong is the most common source of workflow errors. Also use when asked whether a complex expression hurts performance.
---
# n8n 表达式语法

在工作流中正确编写 n8n 表达式的专家指南。

---

## 表达式格式

n8n 中的所有动态内容均使用**双花括号**：

```
{{expression}}
```

**示例**：
```
✅ {{$json.email}}
✅ {{$json.body.name}}
✅ {{$node["HTTP Request"].json.data}}
❌ $json.email  (no braces - treated as literal text)
❌ {$json.email}  (single braces - invalid)
```

---

## 核心变量

### $json - 当前节点输出

访问当前节点中的数据：

```javascript
{{$json.fieldName}}
{{$json['field with spaces']}}
{{$json.nested.property}}
{{$json.items[0].name}}
```

### $node - 引用其他节点

访问任意先前节点中的数据：

```javascript
{{$node["Node Name"].json.fieldName}}
{{$node["HTTP Request"].json.data}}
{{$node["Webhook"].json.body.email}}
```

**重要事项**：
- 节点名称**必须**放在引号中
- 节点名称**区分大小写**
- 必须与工作流中的确切节点名称一致

### $now - 当前时间戳

访问当前日期/时间：

```javascript
{{$now}}
{{$now.toFormat('yyyy-MM-dd')}}
{{$now.toFormat('HH:mm:ss')}}
{{$now.plus({days: 7})}}
```

### $env - 环境变量

访问环境变量：

```javascript
{{$env.API_KEY}}
{{$env.DATABASE_URL}}
```

**警告**：某些 n8n 实例启用了 `N8N_BLOCK_ENV_ACCESS_IN_NODE`，这会完全阻止对 `$env` 的访问。如果 `$env` 返回错误，请使用以下替代方法：
- 将值存储在凭据中
- 使用 Set 节点并手动输入值
- 通过 webhook 查询参数传递值

---

## 🚨 关键：Webhook 数据结构

**最常见的错误**：Webhook 数据**不在**根级别！

### Webhook 节点输出结构

```javascript
{
  "headers": {...},
  "params": {...},
  "query": {...},
  "body": {           // ⚠️ USER DATA IS HERE!
    "name": "John",
    "email": "john@example.com",
    "message": "Hello"
  }
}
```

### 正确访问 Webhook 数据

```javascript
❌ WRONG: {{$json.name}}
❌ WRONG: {{$json.email}}

✅ CORRECT: {{$json.body.name}}
✅ CORRECT: {{$json.body.email}}
✅ CORRECT: {{$json.body.message}}
```

**原因**：Webhook 节点会将传入的数据封装在 `.body` 属性下，以保留请求头、路径参数和查询参数。

---

## 常见模式

### 访问嵌套字段

```javascript
// Simple nesting
{{$json.user.email}}

// Array access
{{$json.data[0].name}}
{{$json.items[0].id}}

// Bracket notation for spaces
{{$json['field name']}}
{{$json['user data']['first name']}}
```

### 引用其他节点

```javascript
// Node without spaces
{{$node["Set"].json.value}}

// Node with spaces (common!)
{{$node["HTTP Request"].json.data}}
{{$node["Respond to Webhook"].json.message}}

// Webhook node
{{$node["Webhook"].json.body.email}}
```

### 组合变量

```javascript
// Concatenation (automatic)
Hello {{$json.body.name}}!

// In URLs
https://api.example.com/users/{{$json.body.user_id}}

// In object properties
{
  "name": "={{$json.body.name}}",
  "email": "={{$json.body.email}}"
}
```

---

## 不应使用表达式的情况

### ❌ Code 节点

Code 节点使用的是**直接 JavaScript 访问**，而不是表达式！

```javascript
// ❌ WRONG in Code node
const email = '={{$json.email}}';
const name = '{{$json.body.name}}';

// ✅ CORRECT in Code node
const email = $json.email;
const name = $json.body.name;

// Or using Code node API
const email = $input.item.json.email;
const allItems = $input.all();
```

### ❌ Webhook 路径

```javascript
// ❌ WRONG
path: "{{$json.user_id}}/webhook"

// ✅ CORRECT
path: "user-webhook"  // Static paths only
```

### ❌ 凭证字段

```javascript
// ❌ WRONG
apiKey: "={{$env.API_KEY}}"

// ✅ CORRECT
Use n8n credential system, not expressions
```

---

## 转换守门规则

在添加任何用于转换数据的节点或编写任何代码之前，请按以下顺序判断，并在遇到第一个适用的方案时停止：

1. 在使用该值的字段中使用**表达式**（`{{ ... }}`）。属性访问、方法链（`.map().filter().join()`）、三元表达式、字符串构建、Luxon 日期运算——如果只是“获取 A，生成 B”，且不需要中间变量，就应该使用表达式。这涵盖了大多数“只需转换一下这个值”的场景。
2. **在 Edit Fields 字段中使用箭头函数 IIFE。** 当逻辑需要中间变量、分支或注释，但仍然只处理一个条目时，直接在字段值中用立即调用的箭头函数将其包裹起来：

   ```
   ={{ (() => {
       const items = $json.line_items;
       const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
       const tax = subtotal * 0.08;
       return (subtotal + tax).toFixed(2);
   })() }}
   ```

   外层的 `(...)` 将函数括起来；末尾的 `()` 调用该函数。缺少其中任何一个，n8n 都会拒绝运行。在函数内部，你可以使用完整的表达式作用域（`$json`、`$('Node')`、`$now`、Luxon），以及 `const`/`let`、`if`/`switch`、`try`/`catch` 和正则表达式。不能使用 `require`，也不能使用 `await`。
3. **Code 节点——最后的手段。** 仅当你需要对整个数据集进行多条目聚合（`$input.all()`）、使用允许列表中的库或执行异步工作时才使用。

**为什么这个顺序很重要。** 这并非风格问题，而是可读性和性能问题。Code 节点在沙箱化虚拟机中运行，每次调用都需要进行初始化和值编组——在你的逻辑开始运行之前，冷启动开销可能达到 500–1000ms。（在预热且条目数量较多的运行中，这项开销会被摊薄，因此应将其视为常见场景下的开销，而非普遍恒定值。）相同逻辑如果放在表达式或 Edit Fields IIFE 中，会在进程内以个位数毫秒完成，并完全跳过沙箱。对于纯粹的单条目数据整形，两者功能没有差异，但性能差距很大；而在每请求 Webhook 之类的热点路径上，这种差距还会不断累积。表达式也会直接显示在使用它的字段中，而不是隐藏在某个上游节点里，迫使他人必须打开该节点才能理解。只有当输入或作用域确实有此需要时，才越过当前阶段使用后续方案。

## Set 节点反模式与分支汇合

### 删除只供一个使用者使用的 Set 节点

如果一个 Set / Edit Fields 节点的唯一作用是提取某个值并将其传给**一个**下游节点，那么它就是多余的。应改为直接在使用该值的节点中内联其表达式。

```
❌  Webhook → Set { customer_id: {{ $json.body.customer_id }} } → Postgres: WHERE id = {{ $json.customer_id }}

✅  Webhook → Postgres: WHERE id = {{ $('Webhook').item.json.body.customer_id }}
```

Set 节点增加了一次中转，让画布更加杂乱，并带来重构隐患，却没有完成任何消费者自身无法完成的工作。要使用 `n8n_update_partial_workflow` 将其彻底移除：重新连接节点（对 Set 的来源与目标执行 `removeConnection`，再使用 `addConnection` 将来源直接连接到消费者），使用 `patchNodeField` 修改消费者的表达式，使其按节点名称引用原始来源，然后使用 `removeNode` 移除 Set。

**快速测试：**统计有多少个下游节点引用 Set 生成的每个字段。
- **0 或 1 个** → 删除 Set，将其逻辑内联到消费者中。
- **2 个以上** → 它可能有保留的价值。

**合理的例外情况**——在以下情况下保留 Set：
- **2 个以上的消费者**读取同一个派生值，并且派生逻辑并不简单（命名有助于提高可读性，而且只需计算一次）。
- **它是子工作流最终的 Return 节点**，用于定义输出契约。此处的“单个消费者”实际上是每一个调用方，因此 Set *就是* API 边界——并且当 `Include Other Fields: false` 时，它会对输出结构设置白名单，避免内部临时字段泄漏。
- **你正在重命名字段或设置字段白名单**，并希望这些操作集中显示在一处，而不是分散在各个消费者表达式中。

### 分支汇合：使用 NoOp 锚定

当分支汇合时（在 IF/Switch/Merge 之后），`$json` 会变成“最后触发的那个分支”——这具有不确定性，并且会悄无声息地导致数据错误。在汇合处插入一个 **NoOp** 节点，为其指定描述性名称（`Combine Inputs`），并让下游节点按名称引用它：

```
Branch A ──┐
           ├─→ [NoOp: Combine Inputs] ──→ downstream uses $('Combine Inputs').item.json.x
Branch B ──┘
```

NoOp 能够经受重构：以后即使在它与消费者之间插入转换节点，也不会破坏 `$('Combine Inputs')` 引用。（如果各分支生成的结构*不同*，请使用 Set 节点代替 NoOp，将它们规范化为统一结构——参见上面的例外情况。）

更广泛地说，在包含多个分支的流程中，**应优先使用 `$('Node').item.json.x`，而不是深层的 `$json.x`。** 一旦插入中间节点，或者某个节点清除了条目上下文（Aggregate、采用 Run for All 的 Code、分支合并），`$json` 就会失效；这种失败不会产生提示，下游会在没有任何报错的情况下获得错误数据。无论来源与消费者之间存在什么节点，按节点名称引用都明确无歧义。

---

## 验证规则

### 1. 始终使用 {{}}

表达式**必须**使用双花括号包裹。

```javascript
❌ $json.field
✅ {{$json.field}}
```

### 2. 对空格和特殊字符使用引号

包含空格、变音符号或特殊字符的字段名或节点名称必须使用**方括号表示法**：

```javascript
❌ {{$json.field name}}
✅ {{$json['field name']}}

❌ {{$node.HTTP Request.json}}
✅ {{$node["HTTP Request"].json}}

// Bracket notation is mandatory for keys with special characters
✅ {{$json['Gross Price w/o shipment']}}
✅ {{$json['Cena brutto zł']}}
```

### 3. 精确匹配节点名称

节点引用**区分大小写**：

```javascript
❌ {{$node["http request"].json}}  // lowercase
❌ {{$node["Http Request"].json}}  // wrong case
✅ {{$node["HTTP Request"].json}}  // exact match
```

### 4. 不要嵌套使用 {{}}

不要重复包裹表达式：

```javascript
❌ {{{$json.field}}}
✅ {{$json.field}}
```

---

## 常见错误

如需查看完整的错误目录及修复方法，请参阅 [COMMON_MISTAKES.md](COMMON_MISTAKES.md)

### 快速修复

| 错误 | 修复方法 |
|---------|-----|
| `$json.field` | `{{$json.field}}` |
| `{{$json.field name}}` | `{{$json['field name']}}` |
| `{{$node.HTTP Request}}` | `{{$node["HTTP Request"]}}` |
| `{{{$json.field}}}` | `{{$json.field}}` |
| `{{$json.name}}`（Webhook） | `{{$json.body.name}}` |
| `'={{$json.email}}'`（Code 节点） | `$json.email` |

---

## 可用示例

如需查看真实的工作流示例，请参阅 [EXAMPLES.md](EXAMPLES.md)

### 示例 1：从 Webhook 到 Slack

**Webhook 接收到**：
```json
{
  "body": {
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello!"
  }
}
```

**在 Slack 节点的文本字段中**：
```
New form submission!

Name: {{$json.body.name}}
Email: {{$json.body.email}}
Message: {{$json.body.message}}
```

### 示例 2：从 HTTP Request 到 Email

**HTTP Request 返回**：
```json
{
  "data": {
    "items": [
      {"name": "Product 1", "price": 29.99}
    ]
  }
}
```

**在 Email 节点中**（引用 HTTP Request）：
```
Product: {{$node["HTTP Request"].json.data.items[0].name}}
Price: ${{$node["HTTP Request"].json.data.items[0].price}}
```

### 示例 3：格式化时间戳

```javascript
// Current date
{{$now.toFormat('yyyy-MM-dd')}}
// Result: 2025-10-20

// Time
{{$now.toFormat('HH:mm:ss')}}
// Result: 14:30:45

// Full datetime
{{$now.toFormat('yyyy-MM-dd HH:mm')}}
// Result: 2025-10-20 14:30
```

---

## 数据类型处理

### 数组

```javascript
// First item
{{$json.users[0].email}}

// Array length
{{$json.users.length}}

// Last item
{{$json.users[$json.users.length - 1].name}}
```

### 对象

```javascript
// Dot notation (no spaces)
{{$json.user.email}}

// Bracket notation (with spaces or dynamic)
{{$json['user data'].email}}
```

### 字符串

```javascript
// Concatenation (automatic)
Hello {{$json.name}}!

// String methods
{{$json.email.toLowerCase()}}
{{$json.name.toUpperCase()}}
```

### 数字

```javascript
// Direct use
{{$json.price}}

// Math operations
{{$json.price * 1.1}}  // Add 10%
{{$json.quantity + 5}}
```

---

## 高级模式

### 条件内容

```javascript
// Ternary operator
{{$json.status === 'active' ? 'Active User' : 'Inactive User'}}

// Default values
{{$json.email || 'no-email@example.com'}}
```

### 日期操作

```javascript
// Add days
{{$now.plus({days: 7}).toFormat('yyyy-MM-dd')}}

// Subtract hours
{{$now.minus({hours: 24}).toISO()}}

// Set specific date
{{DateTime.fromISO('2025-12-25').toFormat('MMMM dd, yyyy')}}
```

### 字符串操作

```javascript
// Substring
{{$json.email.substring(0, 5)}}

// Replace
{{$json.message.replace('old', 'new')}}

// Split and join
{{$json.tags.split(',').join(', ')}}
```

---

## 性能：表达式复杂度（几乎）没有成本

一个常见的担忧是，复杂的 `{{ }}` 会很慢。事实并非如此——真正产生成本的是 n8n 对表达式进行求值的*次数*，而不是每个表达式有多复杂。

在一个 n8n 2.x 实例上的测量结果表明，一个复杂的表达式（`sqrt`、`split`、`reduce`、算术运算）与一个简单的 `{{ $json.x > 50 }}` 相比，处理每个条目的成本相同——两者大约都是 **~0.2 ms/item**，因为其中约 90% 的时间用于 n8n 构建逐条目求值上下文，而不是运行表达式。

这在实践中意味着：

- **不要为了“速度”而把一个正常工作的表达式拆分成一连串节点。** 每个额外节点都会对每个条目重新求值并重新复制所有条目；一个节点使用一个更丰富的表达式，优于三个节点分别使用简单表达式。
- **对于相同的逐条目检查，一个表达式（~0.2 ms/item）比使用 "Run Once for Each Item" 模式的 Code 节点节省约 3 倍成本**（~0.6 ms/item）——但使用 "Run Once for All Items" 模式的 Code 节点成本更低（~0.02 ms/item），因为它只跨越一次逐条目边界，而不是 N 次。
- 这只会在处理**数千个条目**时产生明显影响；低于这个数量时，耗时不到 100 ms。**n8n Code JavaScript** Skill 中提供了完整的逐条目边界模型。

---

## 调试表达式

### 在表达式编辑器中测试

1. 单击包含表达式的字段
2. 打开表达式编辑器（单击 "fx" 图标）
3. 查看结果的实时预览
4. 检查以红色突出显示的错误

### 常见错误消息

**"Cannot read property 'X' of undefined"**
→ 父对象不存在
→ 检查数据路径

**"X is not a function"**
→ 尝试在非函数上调用方法
→ 检查变量类型

**表达式显示为普通文本**
→ 缺少 {{ }}
→ 添加花括号

---

## 表达式辅助功能

### 可用方法

**String**:
- `.toLowerCase()`, `.toUpperCase()`
- `.trim()`, `.replace()`, `.substring()`
- `.split()`, `.includes()`

**Array**:
- `.length`, `.map()`, `.filter()`
- `.find()`, `.join()`, `.slice()`

**DateTime** (Luxon):
- `.toFormat()`, `.toISO()`, `.toLocal()`
- `.plus()`, `.minus()`, `.set()`

**Number**:
- `.toFixed()`, `.toString()`
- 数学运算：`+`, `-`, `*`, `/`, `%`

---

## 最佳实践

### ✅ 应该做

- 始终使用 {{ }} 表示动态内容
- 对包含空格的字段名使用方括号表示法
- 从 `.body` 引用 webhook 数据
- 使用 $node 引用其他节点的数据
- 在表达式编辑器中测试表达式

### ❌ 不应该做

- 不要在 Code 节点中使用表达式
- 不要忘记为包含空格的节点名称添加引号
- 不要使用额外的 {{ }} 进行双重包裹
- 不要假设 webhook 数据位于根级别（它位于 .body 下！）
- 不要在 webhook 路径或凭据中使用表达式

---

## 相关 Skill

- **n8n MCP Tools Expert**：了解如何使用 MCP 工具验证表达式
- **n8n Workflow Patterns**：查看实际工作流示例中的表达式
- **n8n Node Configuration**：了解何时需要使用表达式

---

## 总结

**基本规则**：
1. 使用 {{ }} 包裹表达式
2. Webhook 数据位于 `.body` 下
3. Code 节点中不使用 {{ }}
4. 为包含空格的节点名称添加引号
5. 节点名称区分大小写

**最常见的错误**：
- 缺少 {{ }} → 添加花括号
- 在 Webhook 中使用 `{{$json.name}}` → 改用 `{{$json.body.name}}`
- 在 Code 节点中使用 `{{$json.email}}` → 改用 `$json.email`
- `{{$node.HTTP Request}}` → 改用 `{{$node["HTTP Request"]}}`

更多详情，请参阅：
- [COMMON_MISTAKES.md](COMMON_MISTAKES.md) - 完整的错误目录
- [EXAMPLES.md](EXAMPLES.md) - 真实工作流示例

---

**需要帮助？** 请参阅 n8n 表达式文档，或使用 n8n-mcp 验证工具检查你的表达式。