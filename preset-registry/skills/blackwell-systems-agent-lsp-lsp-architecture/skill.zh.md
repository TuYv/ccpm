---
name: lsp-architecture
description: Generate a structural architecture overview of a codebase: languages, package map, entry points, dependency graph, and hotspots. One call for the big picture.
argument-hint: "[workspace-root-path]"
user-invocable: true
allowed-tools: mcp__lsp__start_lsp mcp__lsp__list_symbols mcp__lsp__blast_radius mcp__lsp__detect_lsp_servers mcp__lsp__find_symbol
license: MIT
compatibility: Requires the agent-lsp MCP server (github.com/blackwell-systems/agent-lsp)
metadata:
  required-capabilities: documentSymbolProvider
  optional-capabilities: workspaceSymbolProvider referencesProvider
---
> 需要 agent-lsp MCP 服务器。

# lsp-architecture

生成任意代码库的结构化架构概览：语言分布、包层次结构、入口点、依赖流和热点文件。一次调用即可了解全局。

只读；不会修改任何文件。

**调用方式：** 用户提供工作区根路径（例如
`"/home/user/myproject"`）。如果省略，则使用当前工作目录。

---

## 步骤 0 — 初始化

如果 LSP 尚未运行，请使用工作区根路径启动它：

```
mcp__lsp__start_lsp({
  "workspace_root": "<workspace-root>"
})
```

然后检测可用的语言服务器：

```
mcp__lsp__detect_lsp_servers({
  "workspace_root": "<workspace-root>"
})
→ returns: list of detected servers with language names and file patterns
```

记录可用语言及其文件 glob 模式。这决定了后续步骤中要运行哪些查询。

---

## 步骤 1 — 语言检测

扫描工作区以确定语言分布。使用检测到的服务器所对应的文件扩展名计数，并通过文件系统扫描（使用 Glob 工具）进行补充，以统计每种语言的文件数量。

对于每种检测到的语言，报告：
- 语言名称
- 文件数量
- 预估代码行数（抽取 3-5 个有代表性的文件作为样本并进行推算）

跳过 `vendor/`、`node_modules/`、`.git/`、`dist/`、`build/` 以及其他常见依赖或输出目录中的文件。

---

## 步骤 2 — 包结构

使用 `find_symbol` 进行宽泛查询，以发现包和模块的层次结构。根据语言调整查询：

**Go：**
```
mcp__lsp__find_symbol({
  "query": "",
  "symbol_kind_filter": "Package"
})
```

同时查询顶层类型和函数，以补充包级详细信息：

```
mcp__lsp__find_symbol({
  "query": "",
  "symbol_kind_filter": "Function"
})
```

**Python：**
```
mcp__lsp__find_symbol({
  "query": "",
  "symbol_kind_filter": "Class"
})
```

**TypeScript/JavaScript：**
```
mcp__lsp__find_symbol({
  "query": "",
  "symbol_kind_filter": "Function"
})
```

从返回的符号中提取目录路径，并构建包层次结构树。按照符号所在的目录对其分组。对于每个包/目录，注明：
- 相对于工作区根目录的路径
- 简要描述（根据符号名称和目录名称推断）
- 大致的符号数量

**包数量上限为 30 个。** 如果包含符号的目录超过 30 个，则仅保留符号数量最多的 30 个，并注明已省略其他目录。

**在整个步骤 2 中，工作区符号查询总数上限为 5 次。**

---

## 步骤 3 — 入口点

使用 `find_symbol` 搜索常见入口点模式：

```
mcp__lsp__find_symbol({
  "query": "main"
})
```

同时搜索其他常见入口点名称（如有需要，仅使用一次额外查询）：`"Run"`、`"Serve"`、`"Handler"`、`"App"`、`"Main"`。

识别并分类：
- **CLI 入口点：** `main` 函数、`Run` 或 `Execute` 命令
- **HTTP 处理程序：** `Handler`、`Serve`、`ListenAndServe` 模式
- **测试套件：** 顶层测试文件（仅注明数量，不要逐一列出）

使用 `file:line` 列出每个入口点。

---

## 第 4 步 — 热点分析

识别符号密度最高（导出符号最多）的文件，然后衡量其影响范围。

### 4a — 查找候选文件

根据第 2 步中发现的符号，统计每个文件的导出符号数量。
按导出符号数量选取**排名前 10 的文件**。

### 4b — 衡量影响范围

对每个候选文件调用 `blast_radius`：

```
mcp__lsp__blast_radius({
  "changed_files": ["<absolute-path-to-file>"],
  "include_transitive": false
})
→ returns: affected_symbols, test_callers, non_test_callers
```

此工具使用持久化缓存，因此对同一文件的重复调用会即时完成。

### 4c — 对热点进行排名

按 `non_test_callers` 总数降序排列文件。非测试调用方最多的文件就是架构热点：更改这些文件会产生最广泛的影响范围。

---

## 第 5 步 — 输出

按以下格式生成架构报告：

```
## Architecture Overview: <project-name>

### Languages
- Go: 150 files (~15K lines)
- TypeScript: 30 files (~3K lines)

### Package Map
cmd/agent-lsp/     (entrypoint, CLI routing)
internal/lsp/      (LSP client, process management)
internal/tools/    (MCP tool handlers)
internal/session/  (speculative execution sessions)
...

### Entry Points
- cmd/agent-lsp/main.go:55 (main)
- cmd/agent-lsp/server.go:276 (Run)

### Hotspots (most referenced files)
1. internal/lsp/client.go: 150+ callers across 30 files
2. internal/tools/helpers.go: 80 callers across 20 files
...

### Dependency Flow
cmd/ -> internal/tools/ -> internal/lsp/ -> (gopls subprocess)
         |-> internal/session/ -> internal/lsp/
```

### 报告章节

**语言：** 每种语言一行，包含文件数和估算的 LOC。

**包映射：** 目录树，并在括号中描述每个包的职责。最多列出 30 个条目。

**入口点：** 每项包含 `file:line` 和一个括号标签（例如 `(main)`、`(HTTP handler)`、`(CLI command)`）。

**热点：** 按引用次数排列的文件列表。对于每个文件，显示非测试调用方总数以及包含调用方的不同文件数量。

**依赖流：** 使用简单的 ASCII 箭头图展示顶层包之间的依赖关系。根据热点调用方数据和包结构进行推断。保持简洁：只展示主要流向路径，而不是每一条边。

---

## 示例

```
Goal: architecture overview of /home/user/agent-lsp

Step 0 — Initialize
  start_lsp: workspace_root="/home/user/agent-lsp"
  detect_lsp_servers:
  → Go (gopls): *.go
  → detected 1 language server

Step 1 — Language Detection
  Glob: **/*.go (excluding vendor/) → 85 files
  Sample 5 files, average 180 lines → estimate ~15K total lines
  → Go: 85 files (~15K lines)

Step 2 — Package Structure
  find_symbol: query="", symbol_kind_filter="Package"
  → 12 packages found

  find_symbol: query="", symbol_kind_filter="Function"
  → 240 functions across 12 packages

  Package map:
    cmd/agent-lsp/       (entrypoint, CLI routing, 15 symbols)
    internal/lsp/        (LSP client lifecycle, 45 symbols)
    internal/tools/      (MCP tool handlers, 60 symbols)
    internal/session/    (speculative execution, 25 symbols)
    internal/protocol/   (LSP protocol types, 30 symbols)
    skills/              (embedded skill definitions, 5 symbols)

Step 3 — Entry Points
  find_symbol: query="main"
  → cmd/agent-lsp/main.go:55 main()

  find_symbol: query="Run"
  → cmd/agent-lsp/server.go:276 Run()
  → cmd/agent-lsp/daemon.go:40 RunDaemon()

  Entry points:
  - cmd/agent-lsp/main.go:55 (main)
  - cmd/agent-lsp/server.go:276 (Run, server lifecycle)
  - cmd/agent-lsp/daemon.go:40 (RunDaemon, background mode)

Step 4 — Hotspot Analysis
  Top files by symbol count:
    1. internal/lsp/client.go (22 exported symbols)
    2. internal/tools/helpers.go (18 exported symbols)
    3. internal/protocol/types.go (15 exported symbols)

  blast_radius on each:
    internal/lsp/client.go → 150 non-test callers across 30 files
    internal/tools/helpers.go → 80 non-test callers across 20 files
    internal/protocol/types.go → 60 non-test callers across 15 files

Step 5 — Output

## Architecture Overview: agent-lsp

### Languages
- Go: 85 files (~15K lines)

### Package Map
cmd/agent-lsp/       (entrypoint, CLI routing)
internal/lsp/        (LSP client, process management)
internal/tools/      (MCP tool handlers)
internal/session/    (speculative execution sessions)
internal/protocol/   (LSP protocol types)
skills/              (embedded skill definitions)

### Entry Points
- cmd/agent-lsp/main.go:55 (main)
- cmd/agent-lsp/server.go:276 (Run)
- cmd/agent-lsp/daemon.go:40 (RunDaemon)

### Hotspots (most referenced files)
1. internal/lsp/client.go: 150 callers across 30 files
2. internal/tools/helpers.go: 80 callers across 20 files
3. internal/protocol/types.go: 60 callers across 15 files

### Dependency Flow
cmd/agent-lsp/ -> internal/tools/ -> internal/lsp/ -> (gopls subprocess)
                    |-> internal/session/ -> internal/lsp/
                    |-> internal/protocol/
```