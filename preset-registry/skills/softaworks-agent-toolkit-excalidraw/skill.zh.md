---
name: excalidraw
description: "Use when working with *.excalidraw or *.excalidraw.json files, user mentions diagrams/flowcharts, or requests architecture visualization - delegates all Excalidraw operations to subagents to prevent context exhaustion from verbose JSON (single files: 4k-22k tokens, can exceed read limits)"
---
# Excalidraw 子代理委派

## 概述

**核心原则：** 主代理绝不直接读取 Excalidraw 文件。始终委派给子代理，以隔离上下文消耗。

Excalidraw 文件是 JSON，token 成本高但信息密度低。单个文件的范围为 4k-22k token（最大的可能超出 read 工具的限制）。读取多个图表会迅速耗尽上下文预算（7 个文件 = 67k token = 预算的 33%）。

## 问题所在

Excalidraw JSON 结构：
- 每个形状有 20 多个属性（x、y、width、height、strokeColor、seed、version 等）
- 大多数属性是视觉元数据（定位、样式、粗糙度）
- 实际内容：文本标签和元素关系（不到文件的 10%）
- **信噪比极低**

示例：14 个元素的图表 = 596 行，16K，约 4k token。79 个元素的图表 = 2,916 行，88K，约 22k token（超出读取限制）。

## 何时使用

**出现以下任一情况时触发：**
- 文件路径包含 `.excalidraw` 或 `.excalidraw.json`
- 用户请求：“解释/更新/创建图表”、“展示架构”、“可视化流程”
- 用户提到：“流程图”、“架构图”、“Excalidraw 文件”
- 涉及视觉产物的架构/设计文档任务

**即使是以下情况也要委派：**
- “小”文件（最小也有 4k token —— 依然可观）
- “快速检查”（检查组件名称仍需加载完整 JSON）
- 单文件操作（隔离可防止上下文污染）
- 修改操作（主上下文中不需要完整的格式理解）

## 委派模式

### 主代理职责

**绝不：**
- ❌ 对 *.excalidraw 文件使用 Read 工具
- ❌ 在主上下文中解析 Excalidraw JSON
- ❌ 为比较而加载多个图表
- ❌ 检查文件以“了解格式”

**始终：**
- ✅ 将所有 Excalidraw 操作委派给子代理
- ✅ 为子代理提供清晰的任务描述
- ✅ 请求纯文本摘要（而非原始 JSON）
- ✅ 让图表分析与主工作隔离

### 子代理任务模板

#### 读取/理解操作
```
Task: Extract and explain the components in [file.excalidraw.json]

Approach:
1. Read the Excalidraw JSON
2. Extract only text elements (ignore positioning/styling)
3. Identify relationships between components
4. Summarize architecture/flow

Return:
- List of components/services with descriptions
- Connection/dependency relationships
- Key insights about the architecture
- DO NOT return raw JSON or verbose element details
```

#### 修改操作
```
Task: Add [component] to [file.excalidraw.json], connected to [existing-component]

Approach:
1. Read file to identify existing elements
2. Find [existing-component] and its position
3. Create new element JSON for [component]
4. Add arrow elements for connections
5. Write updated file

Return:
- Confirmation of changes made
- Position of new element
- IDs of created elements
```

#### 创建操作
```
Task: Create new Excalidraw diagram showing [description]

Approach:
1. Design layout for [number] components
2. Create rectangle elements with text labels
3. Add arrows showing relationships
4. Use consistent styling (colors, fonts)
5. Write to [file.excalidraw.json]

Return:
- Confirmation of file created
- Summary of components included
- File location
```

#### 比较操作
```
Task: Compare architecture approaches in [file1] vs [file2]

Approach:
1. Read both files
2. Extract text labels from each
3. Identify structural differences
4. Compare component relationships

Return:
- Key differences in architecture
- Components unique to each approach
- Relationship/flow differences
- DO NOT return full element details from both files
```

## 常见的自我辩解（停止，改为委派）

| 借口 | 现实 | 应对做法 |
|--------|---------|------------|
| “直接读取最省事” | 不必要地消耗 4k-22k token | 委派给子代理 |
| “直接读取是 token 高效的” | 基线测试显示用掉了 9-45% 的预算 | 始终委派 |
| “这对一次性分析是最优的” | “一次性”仍然污染主上下文 | 子代理隔离 |
| “这个 JSON 很简单” | 简单 ≠ token 高效 | 无论如何都委派 |
| “我需要了解格式” | 主代理不需要格式理解 | 子代理处理格式 |
| “在合理范围内”（18k token） | “合理”是主观的自我辩解 | 硬性规则：委派 |
| “只是快速检查一下组件” | “快速检查”仍会加载完整 JSON | 通过子代理提取文本 |
| “文件很小（16K）” | 4k token 并不小 | 大小阈值无关紧要 |

## 危险信号 —— 停止并委派

发现你自己正要：
- 对 .excalidraw 文件使用 Read 工具
- “快速检查”存在哪些组件
- 修改前“了解结构”
- 加载文件来“看看里面有什么”
- 并排比较多个图表
- 解析 JSON 来“只提取文本”

**以上所有情况都意味着：改用 Task 工具配合子代理。**

## 快速参考

| 操作 | 主代理动作 | 子代理返回内容 |
|-----------|-------------------|------------------|
| **理解图表** | 使用“Extract and explain”模板委派 | 组件列表 + 关系 |
| **修改图表** | 使用“Add [X] connected to [Y]”模板委派 | 确认 + 所做更改 |
| **创建图表** | 使用“Create showing [description]”模板委派 | 文件位置 + 摘要 |
| **比较图表** | 使用“Compare [A] vs [B]”模板委派 | 关键差异（而非原始 JSON） |

## Token 分析（为什么这很重要）

来自基线测试的真实数据：

| 场景 | 不委派 | 委派 | 节省 |
|----------|-------------------|-----------------|---------|
| 单个大型文件 | 22k token（45% 预算） | 约 500 token（子代理摘要） | 98% |
| 双文件比较 | 18k token（9% 预算） | 约 800 token（差异摘要） | 96% |
| 修改任务 | 14k token（7% 预算） | 约 300 token（确认信息） | 98% |

**上下文污染影响：**
- 读取全部 7 个项目图表：67k token（200k 预算的 33%）
- 采用委派：约 2k token（隔离在子代理中）
- **节省：保留 97% 的上下文预算**

## 实现示例

**❌ 错误（直接读取）：**
```
User: "What architecture is shown in detailed-architecture.excalidraw.json?"
Agent: Let me read that file... [reads 22k tokens into main context]
```

**✅ 正确（子代理委派）：**
```
User: "What architecture is shown in detailed-architecture.excalidraw.json?"
Agent: I'll use a subagent to extract the architecture details.

[Dispatches Task tool with general-purpose subagent]
Task: Extract and explain components in .ryanquinn3/ticketing/detailed-architecture.excalidraw.json

[Receives ~500 token summary with component list and relationships]
[Responds to user with architecture explanation, main context preserved]
```

## 为什么“简单的 JSON”无关紧要

代理常常这样辩解：“格式很简单，我直接读就行。”

**问题不在于复杂度，而在于冗长：**
- 结构简单，但每个元素有 20 多个属性
- 重复的元数据（seed、version、nonce、roughness）
- 定位数据（x、y、width、height）没有语义价值
- 视觉样式（strokeColor、opacity、fillStyle）与内容无关

**Token 成本来自体量，而非复杂度。**

即使是“简单的”JSON 也会消耗 4k-22k token，因为：
- 79 个元素 × 每个约 280 token = 22k token
- 大多数 token 是元数据噪声
- 只有文本标签和关系才重要（约占内容的 10%）

## 铁律

**主代理绝不读取 Excalidraw 文件。没有例外。**

不适用于：
- “快速检查”
- “小文件”
- “了解格式”
- “一次性分析”
- “最优效率”

**始终委派。通过子代理实现隔离是零成本的。**
