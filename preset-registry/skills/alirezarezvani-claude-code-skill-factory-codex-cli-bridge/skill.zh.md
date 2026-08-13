---
name: codex-cli-bridge
description: Bridge between Claude Code and OpenAI Codex CLI - generates AGENTS.md from CLAUDE.md, provides Codex CLI execution helpers, and enables seamless interoperability between both tools
---
# Codex CLI 桥接技能

## 目的

此技能在 **Claude Code** 与 **OpenAI 的 Codex CLI** 之间建立全面的桥梁，通过以下方式实现无缝互操作：

1. **文档转换**：将 CLAUDE.md 转换为 AGENTS.md（基于引用，不复制文件）
2. **执行辅助工具**：用于 Codex CLI 命令的 Python 封装器（始终使用 `codex exec`）
3. **技能文档**：让 Codex CLI 用户能够使用 Claude Skills

## 核心能力

### 1. 生成 CLAUDE.md → AGENTS.md
- 解析 CLAUDE.md 和项目结构
- 扫描 `.claude/skills/`、`.claude/agents/`、`documentation/` 文件夹
- 生成包含文件路径引用的完整 AGENTS.md
- **基于引用**：不复制文件，仅链接到现有文件
- 使用最相关的使用方式记录 Skills（bash 脚本与提示词引用）

### 2. 安全机制
- **自动检查 Codex CLI 安装状态**（`codex --version`）
- 如果缺少 CLAUDE.md，**自动运行 `/init`**（并通知用户）
- 验证身份认证和环境
- 提供用户友好的错误消息

### 3. Codex CLI 执行辅助工具
- `exec_analysis()` - 只读分析任务（gpt-5，只读沙箱）
- `exec_edit()` - 代码编辑任务（gpt-5-codex，工作区写入）
- `exec_with_search()` - 启用 Web 搜索的任务
- `resume_session()` - 继续上一次 Codex 会话
- **始终使用 `codex exec`**（绝不使用普通的 `codex`——这对 Claude Code 至关重要）

### 4. 面向 Codex CLI 的技能文档
- **仅提示词技能**：展示如何在 Codex 提示词中引用
- **功能型技能**：展示如何直接执行 Python 脚本
- **复杂技能**：展示以上两种方法
- 包含正确的 `codex exec` 命令语法
- 模型选择指南（gpt-5 与 gpt-5-codex）

## 输入要求

### 用于生成 AGENTS.md
```json
{
  "action": "generate-agents-md",
  "project_root": "/path/to/project",
  "options": {
    "validate_codex": true,
    "auto_init": true,
    "include_mcp": true,
    "skill_detail_level": "relevant"
  }
}
```

### 用于执行 Codex
```json
{
  "action": "codex-exec",
  "task_type": "analysis|edit|search",
  "prompt": "Your task description",
  "model": "gpt-5|gpt-5-codex",
  "sandbox": "read-only|workspace-write|danger-full-access"
}
```

## 输出格式

### AGENTS.md 结构
```markdown
# AGENTS.md

## Project Overview
[From CLAUDE.md]

## Available Skills
### Skill Name
**Location**: `path/to/skill/`
**Using from Codex CLI**: [Most relevant method]

## Workflow Patterns
[Slash commands → Codex equivalents]

## MCP Integration
[MCP server references]

## Command Reference
| Claude Code | Codex CLI |
|-------------|-----------|
[Mappings]
```

### 执行辅助工具输出
```python
{
  "status": "success|error",
  "output": "Command output",
  "session_id": "uuid",
  "model_used": "gpt-5|gpt-5-codex",
  "command": "codex exec ..."
}
```

## Python 脚本

### safety_mechanism.py
- 检查 Codex CLI 安装状态
- 验证 CLAUDE.md 是否存在（如果缺失，则自动运行 /init）
- 环境验证
- 用户通知

### claude_parser.py
- 解析 CLAUDE.md 各章节
- 扫描技能、代理和命令
- 提取质量门禁和 MCP 配置
- 仅返回文件路径（不复制内容）

### project_analyzer.py
- 自动检测项目结构
- 发现所有 Claude Code 资产
- 生成项目元数据
- 构建引用映射

### agents_md_generator.py
- 基于模板生成 AGENTS.md
- 文件路径引用（不复制内容）
- 技能文档化（采用最相关的方法）
- 工作流转换（Claude → Codex）

### skill_documenter.py
- 为 Codex CLI 用户编写技能文档
- 根据技能类型确定最相关的使用方法
- 为 Python 脚本生成 bash 示例
- 创建 Codex 提示词模板

### codex_executor.py
- Codex CLI 命令的 Python 封装
- 智能模型选择（gpt-5 与 gpt-5-codex）
- 沙箱模式辅助工具
- 会话管理
- **始终使用 `codex exec`**

## 使用示例

### 示例 1：生成 AGENTS.md

**用户提示词**：
```
Generate AGENTS.md for this project
```

**执行过程**：
1. 安全机制检查是否已安装 Codex CLI
2. 检查 CLAUDE.md 是否存在（如果缺失，则自动运行 /init）
3. 解析 CLAUDE.md 和项目结构
4. 生成包含文件引用的 AGENTS.md
5. 使用最相关的使用方法记录所有技能

**输出**：项目根目录中完整的 AGENTS.md 文件

---

### 示例 2：执行 Codex 分析任务

**用户提示词**：
```
Use Codex to analyze this codebase for security vulnerabilities
```

**执行过程**：
```python
from codex_executor import CodexExecutor

executor = CodexExecutor()
result = executor.exec_analysis(
    "Analyze this codebase for security vulnerabilities",
    model="gpt-5"
)
```

**执行**：
```bash
codex exec -m gpt-5 -s read-only \
  -c model_reasoning_effort=high \
  "Analyze this codebase for security vulnerabilities"
```

---

### 示例 3：执行 Codex 代码编辑

**用户提示词**：
```
Use Codex to refactor main.py for better async patterns
```

**执行过程**：
```python
executor = CodexExecutor()
result = executor.exec_edit(
    "Refactor main.py for better async patterns",
    model="gpt-5-codex"
)
```

**执行**：
```bash
codex exec -m gpt-5-codex -s workspace-write \
  -c model_reasoning_effort=high \
  "Refactor main.py for better async patterns"
```

---

### 示例 4：恢复 Codex 会话

**用户提示词**：
```
Continue the previous Codex session
```

**执行过程**：
```python
executor = CodexExecutor()
result = executor.resume_session()
```

**执行**：
```bash
codex exec resume --last
```

## 最佳实践

### AGENTS.md 生成
1. **始终在包含 CLAUDE.md 的项目中运行**（或让自动初始化创建它）
2. **首先验证是否已安装 Codex CLI**
3. **使用最相关的方法记录技能**（bash 与提示词）
4. **使用基于引用的方法**（不复制文件）

### Codex 执行
1. **始终使用 `codex exec`**（切勿在 Claude Code 中使用普通的 `codex`）
2. **选择正确的模型**：
   - `gpt-5`：通用推理、架构和分析
   - `gpt-5-codex`：代码编辑和专门的编码任务
3. **选择正确的沙箱**：
   - `read-only`：安全分析（默认）
   - `workspace-write`：文件修改
   - `danger-full-access`：网络访问（很少需要）
4. **在需要时启用搜索**（`--search` 标志）

### 对 Skill 文档
1. **仅提示词型 Skill**：在 Codex 提示词中引用
2. **功能型 Skill**：直接执行 Python 脚本
3. **复杂型 Skill**：同时展示两种方法
4. **始终提供可运行的示例**

## 命令集成

此 Skill 与现有 Claude Code 命令集成：

- **`/init`**：创建 CLAUDE.md 后自动生成 AGENTS.md
- **`/update-claude`**：当 CLAUDE.md 发生变化时重新生成 AGENTS.md
- **`/check-docs`**：验证 AGENTS.md 是否存在并保持同步
- **`/sync-agents-md`**：手动重新生成 AGENTS.md
- **`/codex-exec <task>`**：使用 codex_executor.py 的封装命令

## 安装

### 前置条件
1. **已安装 Codex CLI**：
   ```bash
   codex --version  # Should show v0.48.0 or higher
   ```

2. **Codex 已完成身份验证**：
   ```bash
   codex login
   ```

3. **Claude Code v1.0+**

### 安装 Skill

**选项 1：复制到项目**
```bash
cp -r generated-skills/codex-cli-bridge ~/.claude/skills/
```

**选项 2：从此仓库使用**
```bash
# Skill auto-discovered when Claude Code loads this project
```

## 故障排除

### 错误："Codex CLI not found"
**解决方案**：安装 Codex CLI，并确保它位于 PATH 中
```bash
which codex  # Should return path
codex --version  # Should work
```

### 错误："CLAUDE.md not found"
**解决方案**：Skill 会自动运行 `/init` 并发出通知。如果失败：
```bash
# Manually run /init
/init
```

### 错误："stdout is not a terminal"
**解决方案**：始终使用 `codex exec`，切勿使用普通的 `codex`
```bash
❌ codex -m gpt-5 "task"
✅ codex exec -m gpt-5 "task"
```

### AGENTS.md 不同步
**解决方案**：手动重新生成
```bash
/sync-agents-md
```

## 参考资料

- **Codex CLI 文档**：`openai-codex-cli-instructions.md`
- **Claude Skills 文档**：`claude-skills-instructions.md`
- **Skill 示例**：`claude-skills-examples/codex-cli-skill.md`
- **AGENTS.md 规范**：https://agents.md/

## 版本

**v1.0.0** - 首次发布（2025-10-30）

## 许可证

Apache 2.0

---

**创建者**：Claude Code Skills Factory
**维护用途**：跨工具团队协作（Claude Code ↔ Codex CLI）
**同步状态**：基于引用的桥接（单向同步：CLAUDE.md → AGENTS.md）