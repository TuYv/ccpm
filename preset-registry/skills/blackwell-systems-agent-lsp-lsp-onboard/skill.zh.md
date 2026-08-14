---
name: lsp-onboard
description: First-session project onboarding. Explores the project structure, detects build system, test runner, entry points, and key architecture patterns. Produces a structured project profile the agent can reference throughout the session.
argument-hint: "[workspace-root-path]"
user-invocable: true
allowed-tools: mcp__lsp__start_lsp mcp__lsp__detect_lsp_servers mcp__lsp__list_symbols mcp__lsp__find_symbol mcp__lsp__blast_radius mcp__lsp__run_build mcp__lsp__run_tests mcp__lsp__get_diagnostics mcp__lsp__get_editing_context
license: MIT
compatibility: Requires the agent-lsp MCP server (github.com/blackwell-systems/agent-lsp)
metadata:
  required-capabilities: documentSymbolProvider
  optional-capabilities: referencesProvider callHierarchyProvider
---
# lsp-onboard

首次会话项目引导。首次连接到新项目时运行此技能。它通过 LSP 工具探索代码库，并生成结构化的项目概况：语言、构建系统、测试运行器、入口点、关键类型和架构模式。

该概况可帮助智能体在整个会话期间做出更好的决策，而无需重复探索相同内容。每个项目运行一次；后续会话中应跳过，除非项目结构发生了重大变化。

## 何时使用

- 首次处理新的代码库
- 发生重大结构变更后（新增包、构建系统迁移）
- 当智能体似乎不了解项目约定时

不要在每次会话中都运行此技能。这是一次性探索。

---

## 第 1 步：检测语言和服务器

```
mcp__lsp__detect_lsp_servers({ "workspace_dir": "<root>" })
```

记录存在哪些语言以及有哪些服务器可用。这能帮助你了解项目使用了哪些技术构建。

## 第 2 步：初始化并验证

```
mcp__lsp__start_lsp({ "root_dir": "<root>" })
```

等待初始化完成。对一个关键文件调用 `list_symbols`，以验证工作区已建立索引。

## 第 3 步：识别入口点

搜索常见的入口点模式：

```
mcp__lsp__find_symbol({ "query": "main" })
mcp__lsp__find_symbol({ "query": "Run" })
mcp__lsp__find_symbol({ "query": "Handler" })
```

记录入口点及其文件路径。这些是程序开始执行的位置。

## 第 4 步：梳理包结构

对于每个包含源文件的顶层目录，对一个代表性文件调用 `list_symbols`：

```
mcp__lsp__list_symbols({ "file_path": "<dir>/main.go", "format": "outline" })
```

建立整体认知：存在哪些包、它们导出了什么，以及它们之间如何关联。最多梳理 10 个包，以避免耗时过长。

## 第 5 步：检测构建和测试命令

```
mcp__lsp__run_build({ "workspace_dir": "<root>" })
mcp__lsp__run_tests({ "workspace_dir": "<root>" })
```

记录构建和测试是否通过，以及检测到了哪种语言/工具链。注明测试数量和所有失败项。

## 第 6 步：识别热点

选择 3 至 5 个看起来最核心的文件（入口点、共享类型、核心逻辑）。对每个文件执行：

```
mcp__lsp__blast_radius({ "changed_files": ["<file>"] })
```

拥有最多非测试调用方的文件是架构热点。对这些文件的更改具有最广泛的影响范围。

## 第 7 步：检查诊断信息

```
mcp__lsp__get_diagnostics({ "file_path": "<entry-point>" })
```

记录所有预先存在的错误或警告。这将建立基线，让智能体知道哪些问题在其开始工作之前就已经存在。

## 第 8 步：生成项目概况

编写结构化摘要：

```
## Project Profile: <name>

### Languages
- Go (primary), TypeScript (frontend)

### Build & Test
- Build: `go build ./...` (passes)
- Test: `go test ./...` (142 tests, 0 failures)

### Entry Points
- cmd/server/main.go:15 (main)
- cmd/worker/main.go:22 (main)

### Package Map
- cmd/server/     (HTTP server, routing)
- cmd/worker/     (background job processor)
- internal/api/   (handler layer)
- internal/store/ (database access)
- internal/types/ (shared type definitions)

### Hotspots (most referenced)
1. internal/types/models.go: 85 callers across 12 files
2. internal/store/queries.go: 42 callers across 8 files
3. internal/api/handlers.go: 31 callers across 6 files

### Pre-existing Issues
- 0 errors, 2 warnings (unused imports in test files)

### Conventions Observed
- Error wrapping with fmt.Errorf
- Table-driven tests
- Handler functions return (result, error)
```

此概况供代理在会话期间参考。无需保存到磁盘；它存在于对话上下文中。

---

## 注意事项

- 最多探索 10 个软件包和 5 个热点文件，以确保入门过程不超过 2 分钟
- 如果 `blast_radius` 运行缓慢（文件较大），则跳过热点分析步骤，并注明“已跳过热点分析（大型代码库）”
- 此概况仅供参考；随着你在会话期间了解更多信息，请在心中及时更新