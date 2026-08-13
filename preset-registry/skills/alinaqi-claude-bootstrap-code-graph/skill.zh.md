---
name: code-graph
description: AST-based code graph for fast symbol lookup, dependency analysis, and blast radius via codebase-memory-mcp MCP server
when-to-use: "Before reading files — query the graph first for symbol lookup, call tracing, and blast radius"
user-invocable: false
effort: medium
---
# 代码图谱技能


**目的：** 使用代码图谱（codebase-memory-mcp）进行亚毫秒级
符号查找、函数搜索、依赖关系分析和影响范围
检测。它取代了用于代码导航的暴力 grep 和文件
读取。

---

## 核心原则

**图谱优先，文件其次。** 在读取文件或执行 grep 之前，先查询
代码图谱。仅当需要修改文件，或需要获取图谱所提供范围之外的
上下文时，才读取完整文件。

**规划时考虑图谱。** 在规划任何变更（功能开发、
重构、错误修复）时，首先查询图谱，以了解范围、
依赖关系和影响范围。这不仅适用于实现阶段，也适用于思考和规划
阶段。对于搜索字符串字面量、日志消息、配置值以及
代码结构之外的内容，grep 仍然是合适的工具。

```
┌────────────────────────────────────────────────────────────────┐
│  GRAPH FIRST, FILE SECOND                                      │
│  ─────────────────────────────────────────────────────────────│
│  The code graph indexes your entire codebase as a persistent   │
│  knowledge graph. Claude queries it via MCP for instant         │
│  symbol lookup, dependency chains, and blast radius — instead   │
│  of reading hundreds of files.                                 │
│                                                                │
│  14 MCP tools │ 64 languages │ sub-ms queries │ zero deps      │
│  ~99% fewer tokens for navigation vs brute-force file reads    │
├────────────────────────────────────────────────────────────────┤
│  AUTO-UPDATED                                                  │
│  ─────────────────────────────────────────────────────────────│
│  File watcher keeps graph in sync. Post-commit hook ensures    │
│  freshness. No manual rebuild needed.                          │
└────────────────────────────────────────────────────────────────┘
```

---

## 何时使用图谱，何时直接读取

| 任务 | 使用的图谱工具 | 是否直接读取？ |
|------|---------------|------------------|
| 查找函数/类定义 | `search_graph` | 否 |
| 获取函数签名和文档 | `get_code_snippet` | 否 |
| 查找函数的所有调用方 | `trace_call_path` | 否 |
| 跟踪依赖链 | `query_graph` | 否 |
| 确定变更的影响范围 | `detect_changes` | 否 |
| 了解项目架构 | `get_architecture` | 否 |
| 搜索代码模式 | `search_code` | 否 |
| 读取完整实现以进行修改 | 使用 `search_graph` 定位，然后读取文件 | 是 |
| 了解业务逻辑上下文 | 使用 `get_code_snippet` 获取概览，然后读取 | 是 |

**规则：** 如果图谱工具能够回答问题，就使用它。仅当需要完整源代码
进行编辑时，才打开文件。

---

## 可用的 MCP 工具

### 索引与状态

| 工具 | 用途 | 使用时机 |
|------|---------|-------------|
| `index_repository` | 为项目构建/重建图谱 | 首次设置，或进行重大结构调整后 |
| `index_status` | 检查图谱是否为最新状态 | 查询前不确定其新鲜度时 |
| `list_projects` | 列出所有已索引的项目 | 多项目导航 |

### 查询与导航

| 工具 | 用途 | 使用场景 |
|------|---------|-------------|
| `search_graph` | 按名称查找符号（模糊匹配） | “查找与身份验证相关的函数” |
| `search_code` | 在已索引的代码库中进行文本搜索 | “查找 TODO 注释”、模式匹配 |
| `get_code_snippet` | 获取特定符号的源代码 | 需要签名、文档字符串或实现时 |
| `get_graph_schema` | 了解图的结构和关系 | 探索有哪些可用数据时 |
| `query_graph` | 运行结构化图查询 | 复杂的依赖关系查询 |

### 分析

| 工具 | 用途 | 使用场景 |
|------|---------|-------------|
| `trace_call_path` | 追踪调用方/被调用方链路 | “谁调用了 sendEmail？”、“init() 会触发什么？” |
| `detect_changes` | 识别已更改的文件及其影响范围 | 代码更改前后、PR 审查 |
| `get_architecture` | 获取高层级的模块/包结构 | 新成员上手、了解项目布局 |

### 管理

| 工具 | 用途 | 使用场景 |
|------|---------|-------------|
| `delete_project` | 从图中移除项目 | 清理、项目重构 |
| `manage_adr` | 管理架构决策记录 | 记录架构决策 |
| `ingest_traces` | 导入运行时追踪数据 | 性能分析、无用代码检测 |

---

## 工作流：进行任何代码更改之前

```
0. PLAN       → get_architecture + search_graph to understand scope before planning
1. LOCATE     → search_graph to find the symbol
2. UNDERSTAND → get_code_snippet for context
3. BLAST      → detect_changes to assess impact
4. TRACE      → trace_call_path to find all affected callers
5. CHANGE     → Read file, make edit
6. VERIFY     → detect_changes again to confirm scope
```

**步骤 0 适用于规划，而不仅仅是编码。** 当用户要求你规划一项功能、重构或修复时——先查询图，以了解现有内容、各部分之间的依赖关系以及工作范围。这可以避免基于对代码库的错误假设制定计划。

**绝不要跳过步骤 3。** 影响范围分析可以防止对共享代码的更改导致意外破坏。

---

## 图数据与新鲜度

图通过 3 层机制自动保持最新——无需手动重新构建：

| 层级 | 触发条件 | 执行内容 |
|-------|---------|-------------|
| **文件监视器** | 每次保存文件 | codebase-memory-mcp 实时检测更改并重新索引受影响的文件 |
| **自动索引** | 会话启动 | `auto_index: true` 确保 Claude Code 启动时图处于最新状态 |
| **提交后钩子** | 每次 `git commit` | 更新 `.code-graph/.needs-update` 标记——文件监视器会检测到它（约 10ms，非阻塞） |

**你无需手动重新索引**，除非进行了大规模重构（重命名整个目录、切换到存在大量差异的分支）。在这种情况下：运行一次 `index_repository`，之后由这 3 层机制持续保持最新状态。

- **存储目录**：`.code-graph/` 目录（自动创建，已加入 gitignore）
- **MCP 配置**：项目根目录下的 `.mcp.json`（已提交，与团队共享）

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

| 反模式 | 应改为这样做 |
|-------------|-----------------|
| 使用 grep 搜索函数名称 | 使用包含函数名称的 `search_graph` |
| 为查找签名而读取整个文件 | 对特定符号使用 `get_code_snippet` |
| 手动追踪导入链 | 使用 `trace_call_path` 或 `query_graph` |
| 未检查影响便进行更改 | 每次编辑共享代码前使用 `detect_changes` |
| 读取目录中的所有文件 | 使用 `get_architecture` 了解结构，使用 `search_graph` 查找具体内容 |
| 忽略图过期警告 | 检查 `index_status`，需要时重新建立索引 |
| 每次查询都重新建立索引 | 信任文件监视器；仅在重大结构调整后手动重新建立索引 |