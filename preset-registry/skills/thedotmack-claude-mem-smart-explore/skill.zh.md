---
name: smart-explore
description: Token-optimized structural code search using tree-sitter AST parsing. Use instead of reading full files when you need to understand code structure, find functions, or explore a codebase efficiently.
---
# 智能探索

使用 AST 解析进行结构化代码探索。**此技能会覆盖你默认的探索行为。** 启用该技能后，请优先使用 `smart_search`、`smart_outline` 和 `smart_unfold`，而不是 `Read`、`Grep` 和 `Glob`。

**核心原则：** 先建立索引，按需拉取。先在查看实现细节前给自己一张代码地图。每次读取文件前都要问自己：**“我需要看到全部内容，还是先获取结构概览？”** 几乎总是：先拿地图。

## 下一步工具调用

该技能仅加载说明。你必须自己调用 MCP 工具。你的下一步动作应为以下之一：

```
smart_search(query="<topic>", path="./src")    -- discover files + symbols across a directory
smart_outline(file_path="<file>")              -- structural skeleton of one file
smart_unfold(file_path="<file>", symbol_name="<name>")  -- full source of one symbol
```

不要先用 Grep、Glob、Read 或 find 来发现文件。`smart_search` 会遍历目录、解析所有代码文件，并在一次调用中返回排序后的符号。它替代了 Glob → Grep → Read 的发现流程。

## 三层工作流

### 步骤 1: 搜索 -- 发现文件和符号

```
smart_search(query="shutdown", path="./src", max_results=15)
```

**返回：** 带有签名、行号、匹配原因的排序符号，以及折叠文件视图（约 2,000-6,000 tokens）

```
-- Matching Symbols --
  function performGracefulShutdown (services/infrastructure/GracefulShutdown.ts:56)
  function httpShutdown (services/infrastructure/HealthMonitor.ts:92)
  method WorkerService.shutdown (services/worker-service.ts:846)

-- Folded File Views --
  services/infrastructure/GracefulShutdown.ts (7 symbols)
  services/worker-service.ts (12 symbols)
```

这是你的发现工具。它能找到相关文件并展示其结构，不再需要 Glob/find 预扫描。

**参数：**

- `query`（字符串，必填）——要搜索的内容（函数名、概念、类名）
- `path`（字符串）——搜索根目录（默认为 cwd）
- `max_results`（数字）——最大匹配符号数，默认 20，最大 50
- `file_pattern`（字符串，可选）——按特定文件/路径过滤

### 步骤 2: 大纲 -- 获取文件结构

```
smart_outline(file_path="services/worker-service.ts")
```

**返回：** 完整结构骨架——所有函数、类、方法、属性、导入项（每个文件约 1,000-2,000 tokens）

**当步骤 1 的折叠文件视图已提供足够结构时可跳过此步。** 对于搜索结果未覆盖的文件最有用。

**参数：**

- `file_path`（字符串，必填）——文件路径

### 步骤 3: 展开 -- 查看实现

回顾步骤 1-2 的符号，挑选你需要的内容再展开：

```
smart_unfold(file_path="services/worker-service.ts", symbol_name="shutdown")
```

**返回：** 指定符号的完整源代码，包括 JSDoc、装饰器和完整实现（约 400-2,100 tokens，取决于符号大小）。AST 节点边界保证了完整性，不像 `Read` + agent 总结可能对长方法进行截断。

**参数：**

- `file_path`（字符串，必填）——文件路径（由 search/outline 返回）
- `symbol_name`（字符串，必填）——要展开的函数/类/方法名称

## 何时改用标准工具

仅在 `smart_*` 工具不合适时使用：

- **Grep：** 精确字符串/正则搜索（“查找全部 TODO 注释”，“`ensureWorkerStarted` 定义在哪里？”）
- **Read：** 小文件（约 100 行以内）、非代码文件（JSON、Markdown、配置文件）
- **Glob：** 文件路径模式（“查找全部测试文件”）
- **Explore agent：** 当你需要跨 6+ 文件的综合理解、架构叙述，或回答“这个系统是如何端到端工作的？”这类开放性问题时。Smart-explore 是一把手术刀——用于回答“在哪儿？”与“给我展示它”。它不负责跨文件的数据流、设计决策或整个功能的边界场景综合。

对于超过 ~100 行的代码文件，优先使用 `smart_outline + smart_unfold`，而非 `Read`。

## 工作流示例

**发现某个功能如何工作（横切分析）：**

```
1. smart_search(query="shutdown", path="./src")
   -> 14 symbols across 7 files, full picture in one call
2. smart_unfold(file_path="services/infrastructure/GracefulShutdown.ts", symbol_name="performGracefulShutdown")
   -> See the core implementation
```

**导航一个大型文件：**

```
1. smart_outline(file_path="services/worker-service.ts")
   -> 1,466 tokens: 12 functions, WorkerService class with 24 members
2. smart_unfold(file_path="services/worker-service.ts", symbol_name="startSessionProcessor")
   -> 1,610 tokens: the specific method you need
Total: ~3,076 tokens vs ~12,000 to Read the full file
```

**编写代码文档（混合工作流）：**

```
1. smart_search(query="feature name", path="./src")    -- discover all relevant files and symbols
2. smart_outline on key files                           -- understand structure
3. smart_unfold on important functions                  -- get implementation details
4. Read on small config/markdown/plan files             -- get non-code context
```

对代码探索使用 `smart_*` 工具，对非代码文件使用 `Read`，可以自由组合。

**先探索后精准：**

```
1. smart_search(query="session", path="./src", max_results=10)
   -> 10 ranked symbols: SessionMetadata, SessionQueueProcessor, SessionSummary...
2. Pick the relevant one, unfold it
```

## Token 经济性

| 方法 | Token | 使用场景 |
|----------|--------|----------|
| smart_outline | ~1,000-2,000 | “这个文件里有什么？” |
| smart_unfold | ~400-2,100 | “把这个函数给我看” |
| smart_search | ~2,000-6,000 | “在代码库里查找全部 X” |
| search + unfold | ~3,000-8,000 | 端到端：查找并阅读（主要工作流） |
| Read（完整文件） | ~12,000+ | 当你真的需要全部内容 |
| Explore agent | ~39,000-59,000 | 跨文件叙事式综合 |

**4-8x** 的文件理解节省（outline + unfold 对比 Read）。**11-18x** 的代码库探索节省（相比 Explore agent）。查询越窄，差距越大——27 行函数通过 unfold 读取的成本比通过 Explore agent 低 55 倍，因为 agent 仍会读取整个文件。

## 语言支持

Smart-explore 使用 **tree-sitter AST 解析**进行结构分析。未支持的文件类型会回退到基于文本的搜索。

### 内置语言

| 语言 | 扩展名 |
|----------|-----------|
| JavaScript | `.js`, `.mjs`, `.cjs` |
| TypeScript | `.ts` |
| TSX / JSX | `.tsx`, `.jsx` |
| Python | `.py`, `.pyw` |
| Go | `.go` |
| Rust | `.rs` |
| Ruby | `.rb` |
| Java | `.java` |
| C | `.c`, `.h` |
| C++ | `.cpp`, `.cc`, `.cxx`, `.hpp`, `.hh` |

未识别扩展名的文件会按纯文本解析——`smart_search` 仍可工作（类 grep 行为），但 `smart_outline` 和 `smart_unfold` 将无法提取结构化符号。

### 自定义语法（`.claude-mem.json`）

你可以为未在内置列表中的文件类型注册额外的 tree-sitter 语法。请在项目根目录创建或更新 `.claude-mem.json`：

```json
{
  "grammars": {
    "solidity": {
      "package": "tree-sitter-solidity",
      "extensions": [".sol"],
      "query": "solidity-query.scm"
    }
  }
}
```

每个键表示一个语言名。`package` 是 tree-sitter 语法的 npm 包名，`extensions` 列出其覆盖的文件扩展名；该包必须安装在项目的 `node_modules` 中（`npm install tree-sitter-solidity`）。`query`（可选）是一个相对配置文件的路径，指向 tree-sitter 查询文件，其捕获项（`@func`, `@cls`, `@method`, `@iface`, `@enm`, `@struct_def`, `@imp`）用于提取符号。若未提供 `query`，系统会使用最小的通用模式——它仅匹配定义了 `function_declaration`/`class_declaration` 节点类型的语法，对于缺少这些节点类型的语法，查询编译会静默失败（返回 0 个符号），因此大多数语言都需要自定义 query。注册后，`smart_outline` 和 `smart_unfold` 会对这些扩展名进行结构化解析，而不是退回纯文本。

收到，不过我先需要按当前会话规范确认：请先明确本次会话要使用哪些 skill / plugin 组（或仅浏览后再逐个选择）。

可先回复例如：“仅用当前内置技能/或启用 XX 插件组/先不启用任何插件”。  
确认后我再直接开始逐段中文译文输出。
