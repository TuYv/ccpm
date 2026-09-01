---
name: smart-explore
description: Token-optimized structural code search using tree-sitter AST parsing. Use instead of reading full files when you need to understand code structure, find functions, or explore a codebase efficiently.
---
# Smart Explore

使用 AST 解析进行结构性代码探索。**此技能会覆盖你的默认探索行为。**在该技能处于激活状态时，请使用 smart_search/smart_outline/smart_unfold 作为主要工具，而不是 Read、Grep 和 Glob。

**核心原则：**先索引，按需获取。在加载实现细节之前，先为自己建立代码地图。每次读取文件前的问题都应该是：“我需要看到它的全部内容，还是可以先获取结构概览？”答案几乎总是：先获取地图。

## 你的下一次工具调用

此技能只加载指令。你必须自己调用 MCP 工具。你的下一个操作应该是以下之一：

```
smart_search(query="<topic>", path="./src")    -- discover files + symbols across a directory
smart_outline(file_path="<file>")              -- structural skeleton of one file
smart_unfold(file_path="<file>", symbol_name="<name>")  -- full source of one symbol
```

不要先运行 Grep、Glob、Read 或 find 来发现文件。`smart_search` 会遍历目录，解析所有代码文件，并在一次调用中返回排序后的符号。它取代了 Glob → Grep → Read 的发现流程。

## 三层工作流

### 第 1 步：搜索 —— 发现文件和符号

```
smart_search(query="shutdown", path="./src", max_results=15)
```

**返回：**带签名的排序符号、行号、匹配原因，以及折叠文件视图（约 2-6k token）

```
-- Matching Symbols --
  function performGracefulShutdown (services/infrastructure/GracefulShutdown.ts:56)
  function httpShutdown (services/infrastructure/HealthMonitor.ts:92)
  method WorkerService.shutdown (services/worker-service.ts:846)

-- Folded File Views --
  services/infrastructure/GracefulShutdown.ts (7 symbols)
  services/worker-service.ts (12 symbols)
```

这是你的发现工具。它会找到相关文件并显示其结构。不需要预先扫描 Glob/find。

**参数：**

- `query`（字符串，必填）—— 要搜索的内容（函数名、概念、类名）
- `path`（字符串）—— 要搜索的根目录（默认为 cwd）
- `max_results`（数字）—— 匹配符号的最大数量，默认 20，最大 50
- `file_pattern`（字符串，可选）—— 过滤到特定文件/路径

### 第 2 步：大纲 —— 获取文件结构

```
smart_outline(file_path="services/worker-service.ts")
```

**返回：**完整的结构骨架 —— 所有函数、类、方法、属性、导入（每个文件约 1-2k token）

当第 1 步的折叠文件视图已经提供足够结构时，**跳过此步骤**。它最适用于未被搜索结果覆盖的文件。

**参数：**

- `file_path`（字符串，必填）—— 文件路径

### 第 3 步：展开 —— 查看实现

查看第 1-2 步中的符号。选择你需要的那些。只展开它们：

```
smart_unfold(file_path="services/worker-service.ts", symbol_name="shutdown")
```

**返回：**指定符号的完整源代码，包括 JSDoc、装饰器和完整实现（约 400-2,100 token，取决于符号大小）。AST 节点边界保证完整性，无论符号大小如何 —— 与 Read + 智能体摘要不同，后者可能会截断较长的方法。

**参数：**

- `file_path`（字符串，必填）—— 文件路径（如 search/outline 所返回）
- `symbol_name`（字符串，必填）—— 要展开的函数/类/方法的名称

## 何时改用标准工具

只有在 smart_* 工具不合适时才使用这些工具：

- **Grep：**精确字符串/正则搜索（“查找所有 TODO 注释”、“`ensureWorkerStarted` 在哪里定义？”）
- **Read：**约 100 行以下的小文件、非代码文件（JSON、markdown、config）
- **Glob：**文件路径模式（“查找所有测试文件”）
- **Explore agent：**当你需要跨 6 个以上文件的综合理解、架构叙述，或回答“整个系统端到端是如何工作的？”这类开放式问题时使用。Smart-explore 是一把手术刀 —— 它回答“这个在哪里？”和“给我看这个。”它不会综合整个功能中的跨文件数据流、设计决策或边界情况。

对于约 100 行以上的代码文件，优先使用 smart_outline + smart_unfold，而不是 Read。

## 工作流示例

**发现某个功能的工作方式（横切式）：**

```
1. smart_search(query="shutdown", path="./src")
   -> 14 symbols across 7 files, full picture in one call
2. smart_unfold(file_path="services/infrastructure/GracefulShutdown.ts", symbol_name="performGracefulShutdown")
   -> See the core implementation
```

**导航大型文件：**

```
1. smart_outline(file_path="services/worker-service.ts")
   -> 1,466 tokens: 12 functions, WorkerService class with 24 members
2. smart_unfold(file_path="services/worker-service.ts", symbol_name="startSessionProcessor")
   -> 1,610 tokens: the specific method you need
Total: ~3,076 tokens vs ~12,000 to Read the full file
```

**编写关于代码的文档（混合工作流）：**

```
1. smart_search(query="feature name", path="./src")    -- discover all relevant files and symbols
2. smart_outline on key files                           -- understand structure
3. smart_unfold on important functions                  -- get implementation details
4. Read on small config/markdown/plan files             -- get non-code context
```

代码探索使用 smart_* 工具，非代码文件使用 Read。可自由混用。

**先探索，后精准：**

```
1. smart_search(query="session", path="./src", max_results=10)
   -> 10 ranked symbols: SessionMetadata, SessionQueueProcessor, SessionSummary...
2. Pick the relevant one, unfold it
```

## Token 经济学

| 方式 | Token | 使用场景 |
|----------|--------|----------|
| smart_outline | 约 1,000-2,000 | “这个文件里有什么？” |
| smart_unfold | 约 400-2,100 | “给我看这个函数” |
| smart_search | 约 2,000-6,000 | “在整个代码库中查找所有 X” |
| search + unfold | 约 3,000-8,000 | 端到端：查找并阅读（主要工作流） |
| Read（完整文件） | 约 12,000+ | 当你确实需要所有内容时 |
| Explore agent | 约 39,000-59,000 | 带叙述的跨文件综合 |

在文件理解上可节省 **4-8 倍**（outline + unfold 对比 Read）。在代码库探索上比 Explore agent 节省 **11-18 倍**。查询越窄，差距越大 —— 通过 unfold 读取一个 27 行函数的成本比通过 Explore agent 低 55 倍，因为该 agent 仍会读取整个文件。

## 语言支持

Smart-explore 使用 **tree-sitter AST 解析**进行结构分析。不支持的文件类型会回退到基于文本的搜索。

### 捆绑语言

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

未识别扩展名的文件会按纯文本解析 —— `smart_search` 仍然可用（grep 风格），但 `smart_outline` 和 `smart_unfold` 不会提取结构化符号。

### 自定义语法（`.claude-mem.json`）

你可以为不在捆绑列表中的文件类型注册额外的 tree-sitter 语法。在项目根目录中创建或更新 `.claude-mem.json`：

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

每个键都是语言名称。`package` 是 tree-sitter 语法的 npm 包，`extensions` 列出它覆盖的文件扩展名；该包必须安装在项目的 `node_modules` 中（`npm install tree-sitter-solidity`）。`query`（可选）是一个相对于配置文件的路径，指向一个 tree-sitter query，其捕获（`@func`、`@cls`、`@method`、`@iface`、`@enm`、`@struct_def`、`@imp`）会提取符号。如果没有 `query`，则会使用一个最小化的通用模式 —— 它只匹配定义了 `function_declaration`/`class_declaration` 节点类型的语法，而对缺少这些节点的语法，query 编译会静默失败（0 个符号），因此对大多数语言而言实际上需要自定义 query。注册后，`smart_outline` 和 `smart_unfold` 会以结构化方式解析这些扩展名，而不是回退到纯文本。

### Markdown 特殊支持

Markdown 文件（`.md`、`.mdx`）会获得超出通用纯文本回退的特殊处理：

- **`smart_outline`** — 将标题（`#`、`##`、`###`）提取为符号树。使用它可以在不读取完整文件的情况下浏览长文档。
- **`smart_search`** — 会同时搜索代码块和正文，因此对 ` ```ts ``` ` 块中函数名的查询会按预期工作。
- **`smart_unfold`** — 展开标题部分而不是函数体；每个部分会作为一个块返回，直到下一个同级标题为止。
- **Frontmatter** — YAML frontmatter（位于开头 `---` 分隔符之间的行）会包含在 `smart_outline` 输出中，作为合成的 `frontmatter` 符号，因此无需读取整个文件即可查看 `title:`、`description:` 等元数据。
