---
name: lean-ctx
description: Local context tooling for AI agents. Use it to select, shape, reuse, recover, and inspect context before inference when reading files, running shell commands, searching code, or exploring directories.
---
# LeanCTX — 面向 AI Agent 的本地上下文 SDK

LeanCTX 是一个面向现有 agent 的本地上下文层。它提供可选的文件表示、聚焦搜索、受控的 shell 输出整形、会话延续，以及需要时恢复到精确源码的能力。

## 设置（请先运行）

在使用 lean-ctx 之前，请先确认它已安装：

```bash
which lean-ctx || bash scripts/install.sh
```

如果本地没有安装脚本，请手动安装：

```bash
curl -fsSL https://raw.githubusercontent.com/yvgude/lean-ctx/main/skills/lean-ctx/scripts/install.sh | bash
```

安装完成后，运行单命令设置（会安装 shell hook + 编辑器接线 + 规则 + 技能）：

```bash
lean-ctx setup
```

lean-ctx 支持两种集成风格（按 agent 自动检测）：
- **混合模式（在有 shell 访问权限的环境中为默认）**：通过 MCP 进行缓存读取/搜索 + 通过 shell hook 压缩命令输出。
- **MCP 模式（适用于没有可靠 shell hook 的 IDE 扩展型 agent）**：缓存读取 + 所有工具均通过 MCP 提供。

## 何时使用 lean-ctx

优先使用当前 shell 已配置的压缩，而不是嵌套包装。在 agent shell 中，正常运行命令，除非用户明确要求使用 `lean-ctx -c <command>`，或任务设置/文档明确说明该 shell 未被包装。不要仅为了做决定而检查环境变量；用户可能禁止访问环境变量。

仅在以下情况使用 `lean-ctx -c <command>` 而非直接运行命令：
- 命令会产生冗长的输出（构建日志、git diff、依赖树、测试结果）
- 你正在读取文件且只需要结构或 API 表面
- 你想查看当前会话的本地上下文用量估算

## Shell 命令

```bash
git status                      # Compressed by configured agent shell/wrapper
git diff                        # Meaningful diff lines when configured
git log --oneline -10
npm install                     # Strips progress bars/noise when configured
cargo build
cargo test
docker ps
kubectl get pods
aws ec2 describe-instances
helm list
prisma migrate dev
curl -s <url>                   # JSON schema extraction
ls -la <dir>                    # Grouped directory listing

# Explicit user request / documented unwrapped shell:
lean-ctx -c "git status"
```

支持的工具：git, npm, pnpm, yarn, bun, deno, cargo, docker, kubectl, helm, gh, pip, ruff, go, eslint, prettier, tsc, aws, psql, mysql, prisma, swift, zig, cmake, ansible, composer, mix, bazel, systemd, terraform, make, maven, dotnet, flutter, poetry, rubocop, playwright, curl, wget, 等等。

## 文件读取（压缩模式）

```bash
lean-ctx read <file>                    # Full content with structured header
lean-ctx read <file> -m map             # Dependency graph + exports + API (~5-15% tokens)
lean-ctx read <file> -m signatures      # Function/class signatures only (~10-20% tokens)
lean-ctx read <file> -m aggressive      # Syntax-stripped (~30-50% tokens)
lean-ctx read <file> -m entropy         # Shannon entropy filtered (~20-40% tokens)
lean-ctx read <file> -m diff            # Only changed lines since last read
```

当你需要在不逐行阅读的情况下理解某个文件的功能时，使用 `map` 模式。
当你需要某个模块的 API 表面时，使用 `signatures` 模式（tree-sitter 支持 26 种语言）。
当你将要编辑该文件时，使用 `anchored` 模式（MCP：`ctx_read(mode="anchored")`）——它会添加 `N:hh|` 锚点，使 `ctx_patch` 可以按引用进行编辑，而无需回显旧文本。

## AI 工具集成

```bash
lean-ctx init --global                # Install shell aliases
lean-ctx init --agent cursor          # Hybrid (MCP reads/search + shell hooks)
lean-ctx init --agent claude          # Hybrid (Claude Code)
lean-ctx init --agent codebuddy       # Hybrid (CodeBuddy)
lean-ctx init --agent codex           # Hybrid (Codex CLI)
lean-ctx init --agent opencode        # Hybrid (OpenCode)

lean-ctx init --agent copilot         # MCP (VS Code / Copilot)
lean-ctx init --agent jetbrains       # MCP (JetBrains)
lean-ctx init --agent windsurf        # Hybrid (Windsurf)

# Mode is auto-detected; override with --mode mcp|hybrid if needed.
```

## 本地知识与会话延续

CLI（在混合模式和 MCP 设置中均可工作）：

```bash
lean-ctx knowledge remember "value" --category <c> --key <k>
lean-ctx knowledge recall "query"
lean-ctx knowledge search "query"
lean-ctx knowledge export [--format json|jsonl|simple] [--output <path>]
lean-ctx knowledge import <path> [--merge replace|append|skip-existing] [--dry-run]
lean-ctx knowledge remove --category <c> --key <k>
lean-ctx knowledge consolidate [--all]

lean-ctx session task "what you're doing"
lean-ctx session finding "what you found"
lean-ctx session decision "what you decided"
lean-ctx session save
```

如果你的 IDE 启用了 MCP，同样的本地能力也可以作为 MCP 工具使用（`ctx_knowledge`、`ctx_session` 等）。实验性的本地协作工具需显式选择启用，不属于默认的公共 Runtime 表面。

## 附加智能工具

- `ctx_patch(path, ops)` — 锚定编辑：来自 `ctx_read(mode="anchored")` 的 `N:hh|` 行+哈希锚点，批量原子操作，`op=create` 用于新文件（`ctx_edit` 是旧版的 str-replace 回退方案）
- `ctx_overview(task)` — 在会话开始时生成与任务相关的项目地图
- `ctx_preload(task)` — 主动式上下文加载器，缓存与任务相关的文件
- `ctx_semantic_search(query)` — 基于语义的 BM25 代码搜索，覆盖整个项目
- `ctx_intent` 现在支持多意图检测和复杂度分类
- 语义缓存：TF-IDF + 余弦相似度，用于在多次读取之间发现相似文件

## 会话延续

```bash
lean-ctx sessions list          # List all CCP sessions
lean-ctx sessions show          # Show latest session state
lean-ctx sessions delete <id>   # Delete one saved session
lean-ctx wrapped                # Local usage summary card
lean-ctx wrapped --month        # Monthly local usage summary card
lean-ctx benchmark run          # Local representation comparison (terminal output)
lean-ctx benchmark run --json   # Machine-readable JSON output
lean-ctx benchmark report       # Shareable Markdown report
```

用于会话延续的 MCP 工具：
- `ctx_session status` — 显示当前会话状态（约 400 token）
- `ctx_session load` — 恢复上一个会话（跨对话记忆）
- `ctx_session task "description"` — 设置当前任务
- `ctx_session finding "file:line — summary"` — 记录关键发现
- `ctx_session decision "summary"` — 记录架构决策
- `ctx_session save` — 强制将会话持久化到磁盘
- `ctx_gain action=wrapped` — 在对话中生成一张本地用量摘要卡片
- `ctx_refactor` — 基于 LSP 的重命名、引用、定义、实现（需要语言服务器）
- `ctx_expand action=search_all query="..."` — FTS5 跨归档全文搜索

## 分析

```bash
lean-ctx gain                   # Visual local context-usage estimates (not a benchmark)
lean-ctx dashboard              # Web dashboard at localhost:3333
lean-ctx session                # Adoption statistics
lean-ctx discover               # Find uncompressed commands in shell history
```

## 技巧

- 输出后缀会报告该表示对应的本地源码/输出 token 数量
- 对于大型输出，lean-ctx 会自动截断，同时保留相关上下文
- 来自 curl/wget 的 JSON 响应会被精简为 schema 大纲
- 构建错误按类型分组并附带计数
- 测试结果只显示失败项及汇总计数
- 缓存的重复读取可以返回一个紧凑的本地引用
