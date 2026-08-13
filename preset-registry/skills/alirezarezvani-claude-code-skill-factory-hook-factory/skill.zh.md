---
name: hook-factory
description: Generate production-ready Claude Code hooks with interactive Q&A, automated installation, and enhanced validation. Supports 10 templates across 7 event types for comprehensive workflow automation.
version: 2.0.0
author: Claude Code Skills Factory
tags: [hooks, automation, code-generation, workflow, productivity, interactive, installer]
---
# Hook Factory v2.0

**通过交互式问答、自动安装和增强验证，生成可用于生产环境的 Claude Code 钩子。**

## 此 Skill 的功能

Hook Factory v2.0 是一个全面的钩子生成系统，提供三种模式：

1. **交互模式**（新增！）- 包含智能默认值的 7 问引导流程
2. **自然语言模式** - 使用简单的英语描述你的需求
3. **模板模式** - 直接基于 10 个生产级模板生成

**主要特性：**
- **交互式问答** - 7 个问题，支持验证和智能默认值
- **自动安装** - 提供具备备份/回滚功能的 Python 和 Bash 安装程序
- **增强验证** - 密钥检测、事件特定规则、命令验证
- **10 个模板** - 涵盖 7 种事件类型（PostToolUse、SubagentStop、SessionStart、PreToolUse、UserPromptSubmit、Stop、PrePush）
- **全面的安全保障** - 工具检测、静默失败、原子操作
- **支持 macOS/Linux** - 可用于 Unix 生产环境

## 何时使用此 Skill

当你希望执行以下操作时，请使用 hook-factory：

- 编辑后自动格式化代码
- 使用 git 自动暂存文件
- 在代理完成任务时运行测试
- 在会话开始时加载项目上下文
- 创建自定义工作流自动化
- 通过示例了解钩子的工作原理

## 功能

### 三种生成模式

**1. 交互模式（推荐）**
```bash
python3 hook_factory.py -i
```
- 7 问引导流程
- 基于事件类型的智能默认值
- 输入验证和安全警告
- 可选择自动安装

**2. 自然语言模式**
```bash
python3 hook_factory.py -r "auto-format Python files after editing"
```
- 简单的关键词匹配
- 快速生成常见模式

**3. 模板模式（高级）**
```bash
python3 hook_factory.py -t post_tool_use_format -l python
```
- 直接选择模板
- 完整的自定义控制

### 支持的钩子模板（共 10 个）

**格式化与代码质量：**
1. **post_tool_use_format** - 编辑后自动格式化（Python、JS、TS、Rust、Go）
2. **post_tool_use_git_add** - 使用 git 自动暂存文件

**测试与验证：**
3. **subagent_stop_test_runner** - 在代理完成任务时运行测试
4. **pre_tool_use_validation** - 在工具执行前进行验证
5. **pre_push_validation** - 在 git push 前进行检查

**会话管理：**
6. **session_start_load_context** - 在会话开始时加载上下文
7. **stop_session_cleanup** - 在会话结束时执行清理

**用户交互：**
8. **user_prompt_submit_preprocessor** - 预处理用户提示词
9. **notify_user_desktop** - 桌面通知（macOS/Linux）

**安全：**
10. **security_scan_code** - 使用 semgrep/bandit 进行安全扫描

### 支持的语言

- Python（black 格式化程序、pytest）
- JavaScript（prettier、jest）
- TypeScript（prettier、jest）
- Rust（rustfmt、cargo test）
- Go（gofmt、go test）

### 增强验证（v2.0）

**四层验证系统：**

1. **结构验证** - JSON 语法、必填字段、类型
2. **安全验证** - 无破坏性操作、工具检测、静默失败
3. **匹配器验证** - 有效的 glob 模式、工具名称、文件路径
4. **事件特定验证** - 针对各事件类型的规则（PreToolUse、SessionStart 等）

**v2.0 新增：**
- ✅ **密钥检测** - AWS 密钥、JWT 令牌、API 密钥、私钥（20 多种模式）
- ✅ **事件特定规则** - PreToolUse 必须具有工具匹配器、SessionStart 只能执行只读操作等
- ✅ **命令验证** - Bash 语法、Unix 命令、路径验证、危险操作
- ✅ **macOS/Linux 验证** - 平台特定的命令检查

### 安全功能

每个生成的钩子都包括：
- ✅ 工具检测（检查是否安装了必需的工具）
- ✅ 静默失败模式（绝不会中断你的工作流）
- ✅ 合适的超时设置（根据事件类型设为 5 秒至 120 秒）
- ✅ 无破坏性操作
- ✅ 生成前进行全面验证
- ✅ 清晰的文档和故障排除指南
- ✅ 安装期间自动备份

## 如何调用

### 自然语言请求

只需描述你希望钩子执行的操作：

```
"I want to auto-format Python files after editing"
"Create a hook that runs tests when agents complete"
"Auto-add files to git after editing"
"Load my TODO.md at session start"
```

### 显式选择模板

如果你知道想要使用哪个模板：

```
"Generate a hook using the post_tool_use_format template for JavaScript"
"Create a test runner hook for Rust"
```

### 列出可用模板

```
"Show me all available hook templates"
"List hook templates"
```

## 交互示例

### 示例 1：自动格式化 Python

**你：**“我需要一个钩子，在编辑后自动格式化我的 Python 代码”

**Hook Factory：**
- 检测到模板：`post_tool_use_format`
- 检测到语言：Python
- 生成使用 black 格式化工具的钩子
- 验证配置
- 保存到 `generated-hooks/auto-format-code-after-editing-python/`
- 创建 `hook.json` 和 `README.md`

### 示例 2：Git 自动添加

**你：**“当我编辑文件时，自动使用 git 暂存文件”

**Hook Factory：**
- 检测到模板：`post_tool_use_git_add`
- 生成 git 自动添加钩子
- 验证 git 命令
- 保存到 `generated-hooks/auto-add-files-to-git-after-editing/`

### 示例 3：测试运行器

**你：**“在代理完成编码后运行我的 JavaScript 测试”

**Hook Factory：**
- 检测到模板：`subagent_stop_test_runner`
- 检测到语言：JavaScript
- 配置 jest/npm test
- 保存到 `generated-hooks/run-tests-when-agent-completes-javascript/`

## 输出结构

对于每个钩子，Hook Factory 都会创建：

```
generated-hooks/
└── [hook-name]/
    ├── hook.json        # Complete hook configuration (validated)
    └── README.md        # Installation guide, usage, troubleshooting
```

### hook.json

可直接复制到 Claude Code 设置中的有效 JSON 配置：

```json
{
  "matcher": {
    "tool_names": ["Write", "Edit"]
  },
  "hooks": [
    {
      "type": "command",
      "command": "if ! command -v black &> /dev/null; then\n    exit 0\nfi\n\nif [[ \"$CLAUDE_TOOL_FILE_PATH\" == *.py ]]; then\n    black \"$CLAUDE_TOOL_FILE_PATH\" || exit 0\nfi",
      "timeout": 60
    }
  ]
}
```

### README.md

全面的文档，包括：
- 概述和工作原理
- 前置条件
- 安装说明（手动）
- 配置选项
- 安全注意事项
- 故障排除指南
- 高级自定义技巧

## 安装生成的钩子

### 自动安装（v2.0 新增！）

**使用 Python 安装程序：**
```bash
cd generated-skills/hook-factory

# Install to user level (~/.claude/settings.json)
python3 installer.py install generated-hooks/[hook-name] user

# Install to project level (.claude/settings.json)
python3 installer.py install generated-hooks/[hook-name] project

# Uninstall
python3 installer.py uninstall [hook-name] user

# List installed hooks
python3 installer.py list user
```

**使用 Bash 脚本（macOS/Linux）：**
```bash
cd generated-skills/hook-factory

# Install
./install-hook.sh generated-hooks/[hook-name] user

# Features:
# - Automatic backup with timestamp
# - JSON validation before/after
# - Atomic write operations
# - Rollback on failure
# - Keeps last 5 backups
```

**通过交互模式自动安装：**
- 对 Q7（自动安装）回答 'y'
- 钩子会自动安装
- 无需手动操作

### 手动安装（旧版）

1. **检查生成的文件**
   ```bash
   cd generated-hooks/[hook-name]
   cat README.md
   cat hook.json
   ```

2. **手动安装**
   - 打开 `.claude/settings.json`（项目级）或 `~/.claude/settings.json`（用户级）
   - 从 `hook.json` 复制钩子配置
   - 将其添加到相应的事件类型数组中
   - 保存并重启 Claude Code

3. **验证**
   - 查看 Claude Code 日志：`~/.claude/logs/`
   - 通过执行触发操作来测试钩子

## 验证

每个钩子都会针对以下方面进行验证：

- **JSON 语法**：JSON 有效且可解析
- **结构**：必需字段存在且类型正确
- **安全性**：不包含破坏性操作（rm -rf 等）
- **工具检测**：外部工具具有检测检查
- **静默失败**：命令不会中断工作流
- **超时设置**：适合相应的事件类型
- **匹配器**：glob 模式和工具名称有效

## 最佳实践

1. **从简单开始**：针对常见模式使用自然语言请求
2. **安装前检查**：始终阅读生成的 README.md
3. **隔离测试**：先在测试项目中尝试钩子
4. **逐步自定义**：从默认设置开始，稍后再进行自定义
5. **监控日志**：如果钩子无法正常工作，请检查 `~/.claude/logs/`

## 限制

**平台支持：**
- ✅ 完全支持 macOS 和 Linux
- ❌ 不支持 Windows（使用 Unix 命令和 Bash 特有语法）

**自定义：**
- 交互模式提供智能默认值，但深度自定义能力有限
- 高级用户应使用模板模式并手动编辑
- 不提供 GUI，仅支持 CLI

**模板系统：**
- 10 个模板涵盖常见模式
- 自定义模板需要手动添加到 templates.json
- 暂不支持模板组合（组合多个模式）

## 技术细节

### 此 Skill 中的文件

**核心文件：**
- `SKILL.md` - 此清单文件
- `hook_factory.py` - 带有 CLI 接口的主编排器（687 行）
- `generator.py` - 模板替换和钩子生成
- `validator.py` - 增强型验证引擎（700 多行）
- `templates.json` - 10 个生产级钩子模板
- `README.md` - Skill 使用指南和示例

**v2.0 新增内容：**
- `installer.py` - 自动化安装系统（536 行）
- `install-hook.sh` - Bash 安装脚本（148 行）
- `examples/` - 10 个参考示例（10 个文件夹 × 2 个文件）

### 依赖项

- Python 3.7+
- 仅使用标准库（无外部依赖）

### 架构（v2.0）

**交互模式流程：**
```
User: python3 hook_factory.py -i
    ↓
[7-Question Flow with Smart Defaults]
    ↓
[Template Selection]
    ↓
[Variable Substitution]
    ↓
[4-Layer Validation]
    ↓
[File Generation]
    ↓
[Optional: Auto-Install via installer.py]
    ↓
Generated Hook in generated-hooks/ + Installed
```

**自然语言流程：**
```
User Request
    ↓
[Keyword Matching]
    ↓
[Template Selection]
    ↓
[Variable Substitution]
    ↓
[4-Layer Validation]
    ↓
[File Generation]
    ↓
Generated Hook in generated-hooks/
```

**安装流程：**
```
Hook Folder
    ↓
[installer.py or install-hook.sh]
    ↓
[Backup settings.json]
    ↓
[Load + Validate JSON]
    ↓
[Merge Hook]
    ↓
[Atomic Write (temp → rename)]
    ↓
[Validate Result]
    ↓
✅ Installed (or ❌ Rollback)
```

## 故障排除

### “无法根据请求确定钩子类型”
- 使用更具体的关键词（format、test、git add、load）
- 或使用显式模板选择
- 或列出模板以查看可用内容

### 生成的钩子无法工作
- 检查 Claude Code 日志
- 验证所需工具是否已安装
- 在终端中手动测试命令
- 查看 README.md 的故障排除部分

### 验证错误
- 查看错误消息和修复建议
- 常见问题：缺少工具检测、破坏性命令
- 如有需要，修改模板

## 示例目录

`examples/` 目录包含参考实现：

```
examples/
├── auto-format-python/      # PostToolUse format example
├── git-auto-add/            # PostToolUse git example
├── test-runner/             # SubagentStop test example
└── load-context/            # SessionStart context example
```

每个示例都包含可直接复制使用的 `hook.json` 和 `README.md` 文件。

## 贡献

要添加新的钩子模式：

1. 将模板添加到 `templates.json`
2. 更新 `generator.py` 中的关键词匹配
3. 将示例添加到 `examples/`
4. 更新此 SKILL.md

## 版本历史

- **1.0.0**（2025-10-30）：首次发布
  - 4 种核心钩子模式
  - 自然语言生成
  - 全面验证
  - 简单的关键词匹配

## 支持

- **文档**：请参阅技能目录中的 README.md
- **示例**：请参阅 examples/ 目录
- **验证问题**：检查 validator.py 输出
- **Claude Code 钩子**：https://docs.claude.com/en/docs/claude-code/hooks

---

**由 Claude Code Skills Factory 生成**
**最后更新：** 2025-10-30