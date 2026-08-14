---
name: n8n-code-python
description: Write Python code in n8n Code nodes. Use when writing Python in n8n, using _input/_json/_node syntax, working with standard library, or need to understand Python limitations in n8n Code nodes. Use this skill when the user specifically requests Python for an n8n Code node. Note — JavaScript is recommended for 95% of use cases — only use Python when the user explicitly prefers it or the task requires Python-specific standard library capabilities (regex, hashlib, statistics). EXCEPTION — for Python in the AI-agent-callable Custom Code Tool (@n8n/n8n-nodes-langchain.toolCode), use the n8n-code-tool skill instead (input is _query, return must be a string).
---
# Python 代码节点（Beta）

关于在 n8n 代码节点中编写 Python 代码的专家指南。

---

## ⚠️ 重要提示：优先使用 JavaScript

**建议**：**95% 的使用场景都应使用 JavaScript**。仅在以下情况下使用 Python：
- 你需要特定的 Python 标准库函数
- 你明显更熟悉 Python 语法
- 你正在进行更适合用 Python 处理的数据转换

**优先使用 JavaScript 的原因：**
- 完整支持 n8n 辅助函数（`this.helpers.httpRequest` 等）
- 提供 Luxon DateTime 库，可用于高级日期/时间操作
- 不受外部库限制
- 拥有更完善的 n8n 文档和社区支持

---

## 快速开始

```python
# Basic template for Python Code nodes
items = _input.all()

# Process data
processed = []
for item in items:
    processed.append({
        "json": {
            **item["json"],
            "processed": True,
            "timestamp": datetime.now().isoformat()
        }
    })

return processed
```

### 基本规则

1. **优先考虑 JavaScript** - 仅在必要时使用 Python
2. **访问数据**：`_input.all()`、`_input.first()` 或 `_input.item`
3. **关键要求**：必须返回 `[{"json": {...}}]` 格式
4. **关键要求**：Webhook 数据位于 `_json["body"]` 下（而不是直接位于 `_json` 下）
5. **关键限制**：**不支持外部库**（不支持 requests、pandas、numpy）
6. **仅支持标准库**：json、datetime、re、base64、hashlib、urllib.parse、math、random、statistics

---

## 模式选择指南

与 JavaScript 相同——请根据你的使用场景进行选择：

### 对所有项目运行一次（推荐——默认模式）

**此模式适用于：** 95% 的使用场景

- **工作方式**：无论输入数量多少，代码都只执行**一次**
- **数据访问**：`_input.all()` 或 `_items` 数组（Native 模式）
- **最适合**：聚合、筛选、批处理、转换
- **性能**：处理多个项目时速度更快（仅执行一次）

```python
# Example: Calculate total from all items
all_items = _input.all()
total = sum(item["json"].get("amount", 0) for item in all_items)

return [{
    "json": {
        "total": total,
        "count": len(all_items),
        "average": total / len(all_items) if all_items else 0
    }
}]
```

### 对每个项目运行一次

**此模式适用于：** 仅限特殊场景

- **工作方式**：代码会为每个输入项目**分别**执行
- **数据访问**：`_input.item` 或 `_item`（Native 模式）
- **最适合**：项目特定逻辑、独立操作、逐项验证
- **性能**：处理大型数据集时较慢（需要执行多次）

```python
# Example: Add processing timestamp to each item
item = _input.item

return [{
    "json": {
        **item["json"],
        "processed": True,
        "processed_at": datetime.now().isoformat()
    }
}]
```

---

## Python 模式：Beta 与 Native

n8n 提供两种 Python 执行模式：

### Python（Beta）——推荐
- **使用**：`_input`、`_json`、`_node` 辅助语法
- **最适合**：大多数 Python 使用场景
- **可用的辅助功能**：`_now`、`_today`、`_jmespath()`
- **导入**：`from datetime import datetime`

```python
# Python (Beta) example
items = _input.all()
now = _now  # Built-in datetime object

return [{
    "json": {
        "count": len(items),
        "timestamp": now.isoformat()
    }
}]
```

### Python (Native)（Beta）
- **使用**：仅使用 `_items`、`_item` 变量
- **无辅助工具**：没有 `_input`、`_now` 等
- **限制更多**：仅支持标准 Python
- **适用场景**：需要使用不含 n8n 辅助工具的纯 Python 时

```python
# Python (Native) example
processed = []

for item in _items:
    processed.append({
        "json": {
            "id": item["json"].get("id"),
            "processed": True
        }
    })

return processed
```

**建议**：使用 **Python (Beta)**，以获得更好的 n8n 集成。

---

## 数据访问模式

通过以下划线开头的变量访问输入数据。每个条目都是一个形如 `{"json": {...}}` 的字典，因此实际字段位于 `["json"]` 下。

```python
# Pattern 1: _input.all() - Most common. Arrays, batch ops, aggregations
all_items = _input.all()            # list of {"json": {...}} dicts

# Pattern 2: _input.first() - Very common. Single objects, API responses
data = _input.first()["json"]       # built-in safety vs all_items[0]

# Pattern 3: _input.item - "Run Once for Each Item" mode ONLY
current = _input.item["json"]       # None/error in All Items mode

# Pattern 4: _node - Reference a specific named node
webhook_data = _node["Webhook"]["json"]
http_data = _node["HTTP Request"]["json"]
```

**参见**：[DATA_ACCESS.md](DATA_ACCESS.md) 中的完整指南——其中包含六种 `_input.all()` 用法（过滤、转换、聚合、排序、分组、去重）、`_input.first()` 和 `_input.item` 示例、多节点合并、JS 与 Python 变量对照表，以及决策树。

---

## 重要：Webhook 数据结构

**最常见的错误**：Webhook 数据嵌套在 `["body"]` 下

```python
# ❌ WRONG - Will raise KeyError
name = _json["name"]
email = _json["email"]

# ✅ CORRECT - Webhook data is under ["body"]
name = _json["body"]["name"]
email = _json["body"]["email"]

# ✅ SAFER - Use .get() for safe access
webhook_data = _json.get("body", {})
name = webhook_data.get("name")
```

**原因**：Webhook 节点会将所有请求数据封装在 `body` 属性下。这包括 POST 数据、查询参数和 JSON 负载。

**参见**：[DATA_ACCESS.md](DATA_ACCESS.md) 以了解完整的 Webhook 结构详情

---

## 返回格式要求

**关键规则**：始终返回包含 `"json"` 键的字典列表

### 正确的返回格式

```python
# ✅ Single result
return [{
    "json": {
        "field1": value1,
        "field2": value2
    }
}]

# ✅ Multiple results
return [
    {"json": {"id": 1, "data": "first"}},
    {"json": {"id": 2, "data": "second"}}
]

# ✅ List comprehension
transformed = [
    {"json": {"id": item["json"]["id"], "processed": True}}
    for item in _input.all()
    if item["json"].get("valid")
]
return transformed

# ✅ Empty result (when no data to return)
return []

# ✅ Conditional return
if should_process:
    return [{"json": processed_data}]
else:
    return []
```

### 错误的返回格式

```python
# ❌ WRONG: Dictionary without list wrapper
return {
    "json": {"field": value}
}

# ❌ WRONG: List without json wrapper
return [{"field": value}]

# ❌ WRONG: Plain string
return "processed"

# ❌ WRONG: Incomplete structure
return [{"data": value}]  # Should be {"json": value}
```

**重要原因**：后续节点要求使用列表格式。格式错误会导致工作流执行失败。

**参见**：[ERROR_PATTERNS.md](ERROR_PATTERNS.md) 中的第 2 节，了解详细的错误解决方案

---

## 关键限制：不可使用外部库

**最重要的 PYTHON 限制**：在默认安装中无法导入外部包。

> **自托管例外**：外部包是否可用，完全取决于实例的 Python 运行器配置。如果用户说明其自托管实例的 Python 运行器环境中提供了特定的包，请使用这些包——不要拒绝。如果不确定，请询问用户或仅编写使用标准库的代码。

**❌ 不可用**（会引发 `ModuleNotFoundError`）：`requests`、`pandas`、`numpy`、`scipy`、`bs4`/BeautifulSoup、`lxml`。

**✅ 可用**（仅限标准库）：`json`、`datetime`、`re`、`base64`、`hashlib`、`urllib.parse`、`math`、`random`、`statistics`。

### 替代方案

**需要发送 HTTP 请求？**
- ✅ 在 Code 节点之前使用 **HTTP Request 节点**
- ✅ 或切换到 **JavaScript** 并使用 `this.helpers.httpRequest()`（裸 `$helpers` 全局变量在任务运行器沙箱中未定义）

**需要进行数据分析（pandas/numpy）？**
- ✅ 使用 Python 的 **statistics** 模块进行基本统计
- ✅ 或切换到 **JavaScript** 处理大多数操作
- ✅ 使用列表和字典进行手动计算

**需要进行网页抓取（BeautifulSoup）？**
- ✅ 使用 **HTTP Request 节点** + **HTML Extract 节点**
- ✅ 或切换到 **JavaScript**，使用正则表达式/字符串方法

**参见**：[STANDARD_LIBRARY.md](STANDARD_LIBRARY.md) 以获取完整参考资料

---

## 常用模式概览

根据生产工作流，最实用的 Python 模式包括：

1. **数据转换** - 使用列表推导式转换所有条目
2. **筛选与聚合** - 使用内置函数进行求和、筛选和计数
3. **使用正则表达式处理字符串** - 使用 `re` 从文本中提取模式
4. **数据验证** - 验证和清理数据，并附加错误列表
5. **统计分析** - 使用 `statistics` 模块计算均值/中位数/标准差

所有这五种模式的可直接复制代码片段均位于 [COMMON_PATTERNS.md](COMMON_PATTERNS.md#quick-pattern-snippets)，其中还包含 10 种完整详述的生产模式（多源聚合、Markdown 解析、JSON 比较、CRM 标准化、字典查找、Top-N 筛选等）。

---

## 错误预防 - 最常见的 5 个错误

1. **导入外部库**（Python 特有）→ `import requests` 会引发 `ModuleNotFoundError`。请改用 HTTP Request 节点或 JavaScript。
2. **代码为空或缺少返回语句** → 每条路径都必须以 `return [{"json": ...}]` 结束。
3. **返回格式错误** → 使用列表封装：将 `{"json": {...}}` 改为 `[{"json": {...}}]`。
4. **访问字典时出现 KeyError** → 使用 `.get()`：`_json.get("user", {}).get("name", "Unknown")`。
5. **Webhook 正文嵌套** → 通过 `["body"]` 读取：`_json.get("body", {}).get("email", "no-email")`。

**参见**：[ERROR_PATTERNS.md](ERROR_PATTERNS.md) 获取综合指南——其中包含每种错误的错误与正确代码对比、错误消息、嵌套访问修复方法、一个额外的 `AttributeError` 案例、预防检查清单以及快速修复表。

---

## 标准库参考

最实用的模块：`json`（解析/生成）、`datetime`（日期 + `timedelta`）、`re`（正则表达式）、`base64`（编码/解码）、`hashlib`（哈希）、`urllib.parse`（URL 操作）和 `statistics`（平均值/中位数/标准差）。此外还可以使用：`math`、`random`、`collections`、`itertools`、`functools`。

如需精简速查表及各模块的完整示例，请参阅 [STANDARD_LIBRARY.md](STANDARD_LIBRARY.md#quick-reference-most-useful-modules)。

---

## 最佳实践

### 1. 始终使用 .get() 访问字典

```python
# ✅ SAFE: Won't crash if field missing
value = item["json"].get("field", "default")

# ❌ RISKY: Crashes if field doesn't exist
value = item["json"]["field"]
```

### 2. 显式处理 None/Null 值

```python
# ✅ GOOD: Default to 0 if None
amount = item["json"].get("amount") or 0

# ✅ GOOD: Check for None explicitly
text = item["json"].get("text")
if text is None:
    text = ""
```

### 3. 使用列表推导式进行筛选

```python
# ✅ PYTHONIC: List comprehension
valid = [item for item in items if item["json"].get("active")]

# ❌ VERBOSE: Manual loop
valid = []
for item in items:
    if item["json"].get("active"):
        valid.append(item)
```

### 4. 返回一致的结构

```python
# ✅ CONSISTENT: Always list with "json" key
return [{"json": result}]  # Single result
return results  # Multiple results (already formatted)
return []  # No results
```

### 5. 使用 print() 语句进行调试

```python
# Debug statements appear in browser console (F12)
items = _input.all()
print(f"Processing {len(items)} items")
print(f"First item: {items[0] if items else 'None'}")
```

---

## 生产环境中的注意事项

### SplitInBatches 循环语义

SplitInBatches 节点有两个输出：
- `main[0]` = **完成**——在所有批次完成后触发一次
- `main[1]` = **每个批次**——每个批次都会触发（循环体）

始终在完成输出后添加一个 **Limit 1** 节点。

### 正确的节点引用语法

```python
# ❌ WRONG
data = _node['HTTP Request']['json']

# ✅ CORRECT - call .first() then access json
data = _node['HTTP Request'].first()['json']
```

### Python 中无法使用跨迭代数据

在 Python Beta 模式下，`$getWorkflowStaticData('global')` 可能不可用。如果需要跨 SplitInBatches 迭代累积数据，请改用 JavaScript Code 节点来实现累积逻辑。

---

## 何时使用 Python，何时使用 JavaScript

### 在以下情况下使用 Python：
- ✅ 需要使用 `statistics` 模块执行统计运算
- ✅ 你明显更熟悉 Python 语法
- ✅ 你的逻辑很适合使用列表推导式
- ✅ 需要特定的标准库函数

### 在以下情况下使用 JavaScript：
- ✅ 需要发送 HTTP 请求（`this.helpers.httpRequest()`）
- ✅ 需要高级日期/时间功能（DateTime/Luxon）
- ✅ 希望获得更好的 n8n 集成
- ✅ **适用于 95% 的使用场景**（推荐）

### 在以下情况下考虑使用其他节点：
- ❌ 简单字段映射 → 使用 **Set** 节点
- ❌ 基础过滤 → 使用 **Filter** 节点
- ❌ 简单条件判断 → 使用 **IF** 或 **Switch** 节点
- ❌ 仅发送 HTTP 请求 → 使用 **HTTP Request** 节点

---

## 与其他技能集成

### 可配合使用：

**n8n 表达式语法**：
- 其他节点中的表达式使用 `{{ }}` 语法
- Code 节点直接使用 Python（不使用 `{{ }}`）
- 何时使用表达式，何时使用代码

**n8n MCP 工具专家**：
- 如何查找 Code 节点：`search_nodes({query: "code"})`
- 获取配置帮助：`get_node({nodeType: "nodes-base.code"})`
- 验证代码：`validate_node({nodeType: "nodes-base.code", config: {...}})`

**n8n 节点配置**：
- 模式选择（All Items 与 Each Item）
- 语言选择（Python 与 JavaScript）
- 理解属性依赖关系

**n8n 工作流模式**：
- 转换步骤中的 Code 节点
- 在模式中何时使用 Python，何时使用 JavaScript

**n8n 验证专家**：
- 验证 Code 节点配置
- 处理验证错误
- 自动修复常见问题

**n8n Code JavaScript**：
- 何时改用 JavaScript
- JavaScript 与 Python 功能对比
- 从 Python 迁移到 JavaScript

---

## 快速参考检查清单

在部署 Python Code 节点之前，请确认：

- [ ] **已优先考虑 JavaScript** - 仅在必要时使用 Python
- [ ] **代码不为空** - 必须包含有实际意义的逻辑
- [ ] **存在返回语句** - 必须返回字典列表
- [ ] **返回格式正确** - 每个条目：`{"json": {...}}`
- [ ] **数据访问正确** - 使用 `_input.all()`、`_input.first()` 或 `_input.item`
- [ ] **无外部导入** - 仅使用标准库（json、datetime、re 等）
- [ ] **安全访问字典** - 使用 `.get()` 避免 KeyError
- [ ] **Webhook 数据** - 如果来自 webhook，则通过 `["body"]` 访问
- [ ] **模式选择** - 大多数情况下使用 "All Items"
- [ ] **输出一致** - 所有代码路径均返回相同的结构

---

## 其他资源

### 相关文件
- [DATA_ACCESS.md](DATA_ACCESS.md) - 全面的 Python 数据访问模式
- [COMMON_PATTERNS.md](COMMON_PATTERNS.md) - 10 种适用于 n8n 的 Python 模式
- [ERROR_PATTERNS.md](ERROR_PATTERNS.md) - 最常见的 5 种错误及解决方案
- [STANDARD_LIBRARY.md](STANDARD_LIBRARY.md) - 完整的标准库参考

### n8n 文档
- Code 节点指南：https://docs.n8n.io/code/code-node/
- n8n 中的 Python：https://docs.n8n.io/code/builtin/python-modules/

---

**已准备好在 n8n Code 节点中编写 Python——但请优先考虑 JavaScript！** 针对特定需求使用 Python，参考错误模式指南以避免常见错误，并充分利用标准库。