---
name: setup-serena-mcp
description: Guide for setup Serena MCP server for semantic code retrieval and editing capabilities
argument-hint: Optional - specific configuration preferences or client type
---
用户输入：

```text
$ARGUMENTS
```

# Serena MCP 服务器设置指南

## 1. 确定设置上下文

询问用户希望将配置存储在哪里：

**选项：**

1. **项目级别（通过 git 共享）** - 配置由版本控制跟踪，并与团队共享
   - CLAUDE.md 更新写入：`./CLAUDE.md`

2. **项目级别（个人偏好）** - 配置保留在本地，不由 git 跟踪
   - CLAUDE.md 更新写入：`./CLAUDE.local.md`
   - 验证这些文件是否列在 `.gitignore` 中，如果没有，则将其添加进去

3. **用户级别（全局）** - 配置应用于该用户的所有项目
   - CLAUDE.md 更新写入：`~/.claude/CLAUDE.md`

保存用户的选择，并在后续步骤中使用适当的路径。

## 2. 检查 Serena MCP 服务器是否已设置

尝试使用 Serena MCP 服务器的某个工具（例如 `find_symbol` 或 `get_symbols_overview`），检查你是否能够访问该服务器。

如果无法访问，则继续进行设置。

## 3. 加载 Serena 文档

阅读以下文档，以了解 Serena 的功能和设置流程：

- 加载 <https://raw.githubusercontent.com/oraios/serena/refs/heads/main/README.md>，了解 Serena 是什么及其功能
- 加载 <https://oraios.github.io/serena/02-usage/020_running.html>，了解如何运行 Serena
- 加载 <https://oraios.github.io/serena/02-usage/030_clients.html>，了解如何配置 MCP 客户端
- 加载 <https://oraios.github.io/serena/02-usage/040_workflow.html>，了解如何为项目设置 Serena

## 4. 引导用户完成设置流程

根据已加载的文档：

1. **检查前置条件**：验证是否已安装 `uv`（运行 Serena 所必需）
2. **确定客户端类型**：确定用户正在使用哪种 MCP 客户端（Claude Code、Claude Desktop、Cursor、VSCode 等）
3. **提供设置说明**：如果尚未配置，则针对其客户端提供相应的配置指导
4. **设置项目**：如果项目尚未设置，则引导用户完成项目设置流程
5. **开始为项目建立索引**：如果项目刚刚完成设置，则引导用户完成项目索引流程
6. 如果刚刚设置了 MCP，则要求用户重启 Claude Code 以加载新的 MCP 服务器，并向用户写出明确说明，包括“退出 claude code 控制台，然后运行 'claude --continue'，接着输入 "continue" 以继续设置流程”
7. **测试连接**：验证设置完成后是否可以访问 Serena 工具
   1. 如果尚未执行，则运行 initial_instructions
   2. 检查是否已执行新手引导，如果没有，则运行它。
   3. 然后尝试读取任意文件

添加 MCP 服务器后、测试连接之前，向用户原样写出以下消息：

```markdown
You must restart Claude Code to load the new MCP server:

  1. Exit Claude Code console (type exit or press Ctrl+C)
  2. Run claude --continue
  3. Type "continue" to resume setup

  After restart, I will:
  - Verify Serena tools are accessible
  - Run initial_instructions if needed
  - Perform onboarding for this project (if not already done)

```

## 5. 更新 CLAUDE.md 文件

使用步骤 1 中确定的路径。Serena 成功设置后，使用以下内容**原样**更新相应的 CLAUDE.md 文件：

```markdown
### Use Serena MCP for Semantic Code Analysis instead of regular code search and editing

Serena MCP is available for advanced code retrieval and editing capabilities.

**When to use Serena:**
- Symbol-based code navigation (find definitions, references, implementations)
- Precise code manipulation in structured codebases
- Prefer symbol-based operations over file-based grep/sed when available

**Key tools:**
- `find_symbol` - Find symbol by name across the codebase
- `find_referencing_symbols` - Find all symbols that reference a given symbol
- `get_symbols_overview` - Get overview of top-level symbols in a file
- `read_file` - Read file content within the project directory

**Usage notes:**
- Memory files can be manually reviewed/edited in `.serena/memories/`

```

如果服务器是在用户级别（全局）设置的，请添加以下部分：

```markdown

**Project setup (per project):**
1. Run `serena project create --index` in your project directory
2. Serena auto-detects language; creates `.serena/project.yml`
3. First use triggers onboarding and creates memory files in `.serena/memories/`
```

## 6. 项目初始化（如需要）

如果这是一个新项目，或者 Serena 尚未初始化：

1. 指导用户运行项目初始化命令
2. 说明基于项目的工作流和索引机制
3. 根据需要配置项目特定的设置