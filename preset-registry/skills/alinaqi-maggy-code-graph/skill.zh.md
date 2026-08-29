---
name: code-graph
description: AST-based code graph for fast symbol lookup, dependency analysis, and blast radius via codebase-memory-mcp MCP server
when-to-use: "Before reading files — query the graph first for symbol lookup, call tracing, and blast radius"
user-invocable: false
effort: medium
---
# 代码图谱技能


**用途：** 使用代码图谱（codebase-memory-mcp）进行亚毫秒级的符号查找、函数搜索、依赖分析和影响范围检测。这可以替代通过蛮力 grep 和读取文件来进行代码导航。

---

## 核心原则

**先图谱，后文件。** 在读取文件或使用 grep 之前，先查询代码图谱。只有在需要修改文件，或需要图谱无法提供的上下文时，才读取完整文件。

**规划时考虑图谱。** 在规划任何变更时——功能、重构、错误修复——都应先查询图谱，以了解范围、依赖关系和影响范围。这不仅适用于实现阶段，也适用于思考和规划阶段。对于搜索字符串字面量、日志消息、配置值，以及代码结构之外的内容，grep 仍然是正确的工具。

```
┌────────────────────────────────────────────────────────────────┐
│  先图谱，后文件                                                │
│  ─────────────────────────────────────────────────────────────│
│  代码图谱将整个代码库编入一个持久化知识图谱。Claude 通过 MCP    │
│  进行即时的符号查找、依赖链分析和影响范围检测，而不是读取数百个 │
│  文件。                                                        │
│                                                                │
│  14 个 MCP 工具 │ 64 种语言 │ 亚毫秒级查询 │ 零依赖             │
│  与通过蛮力读取文件相比，导航所需 token 减少约 99%              │
├────────────────────────────────────────────────────────────────┤
│  自动更新                                                      │
│  ─────────────────────────────────────────────────────────────│
│  文件监视器使图谱保持同步。提交后钩子确保图谱保持最新。无需手动 │
│  重建。                                                        │
└────────────────────────────────────────────────────────────────┘
```

---

## 何时使用图谱，何时直接读取

| 任务 | 使用图谱工具 | 直接读取？ |
|------|---------------|------------|
| 查找函数/类定义 | `search_graph` | 否 |
| 获取函数签名和文档 | `get_code_snippet` | 否 |
| 查找函数的所有调用方 | `trace_call_path` | 否 |
| 跟踪依赖链 | `query_graph` | 否 |
| 确定变更的影响范围 | `detect_changes` | 否 |
| 理解项目架构 | `get_architecture` | 否 |
| 搜索代码模式 | `search_code` | 否 |
| 读取需要修改的完整实现 | 使用 `search_graph` 定位，然后读取文件 | 是 |
| 理解业务逻辑上下文 | 使用 `get_code_snippet` 获取概览，然后读取文件 | 是 |

**规则：** 如果图谱工具能够回答问题，就使用它。只有在需要完整源代码来进行编辑时，才打开文件。

---

## 可用的 MCP 工具

### 索引与状态

| 工具 | 用途 | 使用时机 |
|------|---------|-------------|
| `index_repository` | 为项目构建/重建图谱 | 首次设置，或进行重大重构之后 |
| `index_status` | 检查图谱是否为最新状态 | 查询之前，如果不确定图谱是否最新 |
| `list_projects` | 列出所有已建立索引的项目 | 多项目导航 |

### 查询与导航

| 工具 | 用途 | 使用时机 |
|------|---------|-------------|
| `search_graph` | 按名称查找符号（模糊匹配） | “查找与身份验证相关的函数” |
| `search_code` | 在已索引的代码库中进行文本搜索 | “查找 TODO 注释”、模式匹配 |
| `get_code_snippet` | 获取特定符号的源代码 | 需要签名、文档字符串、实现时 |
| `get_graph_schema` | 了解图的结构和关系 | 探索有哪些可用数据时 |
| `query_graph` | 运行结构化图查询 | 进行复杂的依赖关系查询时 |

### 分析

| 工具 | 用途 | 使用时机 |
|------|---------|-------------|
| `trace_call_path` | 跟踪调用方/被调用方链 | “谁调用了 sendEmail？”、“init() 会触发什么？” |
| `detect_changes` | 识别变更文件及影响范围 | 代码变更前后、PR 审查时 |
| `get_architecture` | 了解高层模块/包结构 | 熟悉项目、了解项目布局时 |

### 管理

| 工具 | 用途 | 使用时机 |
|------|---------|-------------|
| `delete_project` | 从图中移除项目 | 清理、项目重构时 |
| `manage_adr` | 架构决策记录 | 记录架构决策时 |
| `ingest_traces` | 导入运行时跟踪记录 | 性能分析、检测死代码时 |

---

## 工作流：任何代码变更之前

```
0. PLAN       → get_architecture + search_graph to understand scope before planning
1. LOCATE     → search_graph to find the symbol
2. UNDERSTAND → get_code_snippet for context
3. BLAST      → detect_changes to assess impact
4. TRACE      → trace_call_path to find all affected callers
5. CHANGE     → Read file, make edit
6. VERIFY     → detect_changes again to confirm scope
```

**步骤 0 适用于规划，而不仅仅是编写代码。** 当用户要求你规划功能、重构或修复时——先查询图，以了解已有内容、依赖关系以及影响范围。这样可以避免基于对代码库的错误假设制定计划。

**绝不要跳过步骤 3。** 影响范围分析可以防止对共享代码的变更造成意外破坏。

---

## 图数据与新鲜度

图通过 3 层机制自动保持最新状态——无需手动重建：

| 层 | 触发条件 | 发生的事情 |
|-------|---------|-------------|
| **文件监视器** | 每次文件保存 | codebase-memory-mcp 检测变更，并实时重新索引受影响的文件 |
| **自动索引** | 会话开始时 | `auto_index: true` 确保 Claude Code 启动时图处于最新状态 |
| **提交后钩子** | 每次 `git commit` | 更新 `.code-graph/.needs-update` 标记——文件监视器会获取该变更（约 10 毫秒，非阻塞） |

**你不需要手动重新索引**，除非进行了大规模重构（重命名整个目录、切换到存在大量差异的分支）。在这种情况下：运行一次 `index_repository`，之后由这 3 层机制保持图的最新状态。

- **存储位置**：`.code-graph/` 目录（自动创建，并被 gitignore 忽略）
- **MCP 配置**：项目根目录中的 `.mcp.json`（已提交，并与团队共享）

---

## MCP 配置

代码图 MCP 服务器在项目根目录的 `.mcp.json` 中配置：

```json
{
  "mcpServers": {
    "codebase-memory": {
      "command": "codebase-memory-mcp",
      "args": []
    }
  }
}
```

**安装：** `~/.claude/install-graph-tools.sh`

---

## 决策框架

```
Need to find a symbol/function?
  → search_graph (sub-ms, structured result)
  → NOT: grep -r "functionName" (slow, unstructured)

Need to understand dependencies?
  → query_graph or trace_call_path (complete, traversable)
  → NOT: manually reading import statements

Need to assess change impact?
  → detect_changes (comprehensive, instant)
  → NOT: searching for usages manually across files

Need to understand architecture?
  → get_architecture (high-level overview)
  → NOT: reading every directory listing

Need to read/modify code?
  → search_graph to locate, then Read the specific file
  → NOT: reading entire directories hoping to find it
```

---

## 反模式

| 反模式 | 应改为 |
|-------------|-----------------|
| 搜索函数名称 | 使用函数名称调用 `search_graph` |
| 阅读整个文件以查找签名 | 对特定符号使用 `get_code_snippet` |
| 手动跟踪导入链 | 使用 `trace_call_path` 或 `query_graph` |
| 未检查影响就进行更改 | 在每次编辑共享代码前使用 `detect_changes` |
| 阅读目录中的所有文件 | 使用 `get_architecture` 了解结构，使用 `search_graph` 查找具体内容 |
| 忽略图谱过时警告 | 检查 `index_status`，必要时重新索引 |
| 每次查询都重新索引 | 信任文件监视器；仅在重大重构后手动重新索引 |