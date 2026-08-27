---
name: setup-serena-mcp
description: Guide for setup Serena MCP server for semantic code retrieval and editing capabilities
---
用户输入：

```text
$ARGUMENTS
```

# Serena MCP server 设置指南

## 1. 确定设置上下文

询问用户希望将配置存储在哪里：

**选项：**

1. **项目级别（通过 git 共享）** - 配置纳入版本控制并与团队共享
   - CLAUDE.md 更新至：`./CLAUDE.md`

2. **项目级别（个人偏好）** - 配置保留在本地，不纳入 git 跟踪
   - CLAUDE.md 更新至：`./CLAUDE.local.md`
   - 确认这些文件已列在 `.gitignore` 中；如果没有，则添加它们

3. **用户级别（全局）** - 配置应用于该用户的所有项目
   - CLAUDE.md 更新至：`~/.claude/CLAUDE.md`

保存用户的选择，并在后续步骤中使用相应的路径。

## 2. 检查 Serena MCP server 是否已设置

尝试使用 Serena 的某个工具（例如 `find_symbol` 或 `get_symbols_overview`），检查是否可以访问 Serena MCP server。

如果无法访问，则继续进行设置。

## 3. 加载 Serena 文档

阅读以下文档，以了解 Serena 的功能和设置流程：

- 加载 <https://raw.githubusercontent.com/oraios/serena/refs/heads/main/README.md>，了解 Serena 是什么以及它的功能
- 加载 <https://oraios.github.io/serena/02-usage/020_running.html>，了解如何运行 Serena
- 加载 <https://oraios.github.io/serena/02-usage/030_clients.html>，了解如何配置 MCP 客户端
- 加载 <https://oraios.github.io/serena/02-usage/040_workflow.html>，了解如何为项目设置 Serena

## 4. 引导用户完成设置流程

根据已加载的文档：

1. **检查前置条件**：确认已安装 `uv`（运行 Serena 所必需）
2. **识别客户端类型**：确定用户使用的是哪种 MCP 客户端（Claude Code、Claude Desktop、Cursor、VSCode 等）
3. **提供设置说明**：如果用户的客户端尚未配置，则指导用户完成特定于该客户端的配置
4. **设置项目**：如果项目尚未设置，则指导用户完成项目设置流程
5. **开始为项目建立索引**：如果项目刚刚完成设置，则指导用户开始建立项目索引
6. 如果 MCP 刚刚完成设置，要求用户重启 Claude Code 以加载新的 MCP server，并向用户明确写出以下说明，包括“退出 claude code 控制台，然后运行 'claude --continue'，接着输入 "continue" 以继续设置”
7. **测试连接**：设置完成后，验证是否可以访问 Serena 工具
   1. 如果尚未执行，则运行 initial_instructions
   2. 检查是否已完成 onboarding；如果没有，则运行 onboarding。
   3. 然后尝试读取任意文件

添加 MCP server 后、测试连接之前，向用户 EXACTLY 写出以下消息：

```markdown
你必须重启 Claude Code 以加载新的 MCP server：

  1. 退出 Claude Code 控制台（输入 exit 或按 Ctrl+C）
  2. 运行 claude --continue
  3. 输入 "continue" 以恢复设置

  重启后，我将：
  - 验证 Serena 工具是否可访问
  - 如有需要，运行 initial_instructions
  - 为此项目执行 onboarding（如果尚未完成）

```

## 5. 更新 CLAUDE.md 文件

使用第 1 步中确定的路径。Serena 成功设置后，使用以下 EXACTLY 内容更新相应的 CLAUDE.md 文件：

```markdown
### 使用 Serena MCP 进行语义代码分析，而不是常规的代码搜索和编辑

Serena MCP 可用于高级代码检索和编辑功能。

**何时使用 Serena：**
- 基于符号的代码导航（查找定义、引用、实现）
- 在结构化代码库中进行精确的代码操作
- 在可用时，优先使用基于符号的操作，而不是基于文件的 grep/sed

**主要工具：**
- `find_symbol` - 在整个代码库中按名称查找符号
- `find_referencing_symbols` - 查找引用给定符号的所有符号
- `get_symbols_overview` - 获取文件中顶层符号的概览
- `read_file` - 读取项目目录中的文件内容

**使用说明：**
- 可以在 `.serena/memories/` 中手动查看/编辑记忆文件

```

如果服务器是在用户级别（全局）设置的，请添加以下部分：

```markdown

**项目设置（按项目）：**
1. 在项目目录中运行 `serena project create --index`
2. Serena 会自动检测语言；创建 `.serena/project.yml`
3. 首次使用会触发引导流程，并在 `.serena/memories/` 中创建记忆文件
```

## 6. 项目初始化（如需要）

如果这是一个新项目，或者 Serena 尚未初始化：

1. 指导用户运行项目初始化命令
2. 解释基于项目的工作流和索引
3. 根据需要配置项目专属设置