---
name: codeagent
description: Execute codeagent-wrapper for multi-backend AI code tasks. Supports Codex, Claude, Gemini, and OpenCode backends with agent presets, skill injection, file references (@syntax), worktree isolation, parallel execution, and structured output.
---
# Codeagent Wrapper 集成

## 概述

使用可插拔的 AI 后端（Codex、Claude、Gemini、OpenCode）、智能体预设、自动检测的技能注入以及并行任务编排来执行 `codeagent-wrapper` 命令。默认在后台执行，并且当工作可以拆分为多个独立任务时，优先使用 `--parallel`。

## 适用场景

- 需要深入理解的复杂代码分析
- 涉及多个文件的大规模重构
- 多智能体编排（探索 → 设计 → 实现 → 审查）
- 支持后端/智能体选择的自动化代码生成
- 带依赖管理的并行任务执行

## 快速参考

```
codeagent-wrapper [flags] <task|-> [workdir]
codeagent-wrapper [flags] resume <session_id> <task|-> [workdir]
codeagent-wrapper --parallel [flags] < tasks_config
```

## CLI 标志

| 标志 | 说明 | 默认值 |
|------|-------------|---------|
| `--backend <name>` | 后端：codex、claude、gemini、opencode | codex |
| `--agent <name>` | 智能体预设（来自 models.json 或 agents/ 目录） | 无 |
| `--model <name>` | 覆盖任意后端的模型 | 后端默认值 |
| `--skills <names>` | 要注入的技能名称，以逗号分隔 | 自动检测 |
| `--reasoning-effort <level>` | 推理级别：low、medium、high | 后端默认值 |
| `--prompt-file <path>` | 自定义提示词文件（仅限 ~/.claude 或 ~/.codeagent/agents/） | 无 |
| `--output <path>` | 将结构化 JSON 输出写入文件 | 无 |
| `--worktree` | 在隔离的 git worktree 中执行（分支：do/{task_id}） | false |
| `--skip-permissions` | 跳过 Claude 后端的权限提示 | false |
| `--parallel` | 启用从 stdin 读取的并行任务执行 | false |
| `--full-output` | 在并行输出中包含完整消息（默认为摘要） | false |
| `--config <path>` | 配置文件路径 | ~/.codeagent/config.* |
| `--cleanup` | 清理旧日志并退出 | — |
| `-v`, `--version` | 输出版本并退出 | — |

## 后端

| 后端 | 标志 | 最适合 |
|---------|------|----------|
| **Codex** | `--backend codex`（默认） | 深度代码分析、复杂逻辑、算法优化、大规模重构 |
| **Claude** | `--backend claude` | 文档编写、提示词工程、需求明确的功能 |
| **Gemini** | `--backend gemini` | UI/UX 原型设计、设计系统实现 |
| **OpenCode** | `--backend opencode` | 轻量级任务、最小功能集 |

## 智能体预设

智能体预设将后端、模型、提示词和工具控制打包成一个可复用的名称。使用 `--agent <name>` 进行选择。

**来源（按顺序检查）：**
1. `~/.codeagent/models.json` → `agents.<name>` 对象
2. `~/.codeagent/agents/<name>.md` → markdown 文件将作为提示词

**智能体配置字段**（位于 models.json 中）：
```json
{
  "agents": {
    "develop": {
      "backend": "codex",
      "model": "gpt-4.1",
      "prompt_file": "~/.codeagent/prompts/develop.md",
      "reasoning": "high",
      "yolo": true,
      "allowed_tools": ["Read", "Write", "Bash"],
      "disallowed_tools": ["WebFetch"]
    }
  }
}
```

**常用代理预设：**

| 代理 | 用途 | 只读 |
|-------|---------|-----------|
| `code-explorer` | 追踪代码、梳理架构、查找模式 | 是 |
| `code-architect` | 设计方案、文件规划、构建顺序 | 是 |
| `code-reviewer` | 审查错误、简洁性和规范 | 是 |
| `develop` | 实现代码、运行测试、进行更改 | 否 |

## 技能注入

### 自动检测

未指定 `--skills` 时，会根据工作目录自动检测技能：

| 检测到的文件 | 注入的技能 |
|---|---|
| `go.mod` / `go.sum` | `golang-base-practices` |
| `Cargo.toml` | `rust-best-practices` |
| `pyproject.toml` / `setup.py` / `requirements.txt` | `python-best-practices` |
| `package.json` | `vercel-react-best-practices`, `frontend-design` |
| `vue.config.js` / `vite.config.ts` / `nuxt.config.ts` | `vue-web-app` |

### 手动覆盖

```bash
codeagent-wrapper --agent develop --skills golang-base-practices,frontend-design - . <<'EOF'
Implement full-stack feature...
EOF
```

技能从 `~/.claude/skills/{name}/SKILL.md` 加载，移除 YAML 前置元数据后注入任务提示词。

## 使用模式

### 单个任务（推荐使用 HEREDOC）

```bash
codeagent-wrapper --backend codex - [workdir] <<'EOF'
<task content here>
EOF
```

默认执行模式为后台运行。仅当下一步需要立即获得完整响应时，才以前台模式运行。

以前台模式运行时，`codeagent-wrapper` 会在最终答案之前向 stdout 输出存活状态帧：

```text
[codeagent-progress] status=started ...
[codeagent-progress] status=streaming ...
[codeagent-progress] status=running ...
[codeagent-progress] status=completed ...
```

这些行仅表示进度。只要进度帧仍在持续到达，就不要断定“未返回数据”，也不要自行开始执行任务。

### 使用代理预设

```bash
codeagent-wrapper --agent develop --skills golang-base-practices - . <<'EOF'
Implement the authentication middleware following existing patterns.
EOF
```

### 简单任务（仅限简短提示词）

```bash
codeagent-wrapper --backend codex "simple task description" [workdir]
```

**自动检测 stdin**：当任务长度超过 800 个字符或包含特殊字符（`\n`、`\`、`"`、`'`、`` ` ``、`$`）时，会自动使用 stdin 模式。使用 `-` 可显式强制启用 stdin 模式。

### 恢复会话

```bash
codeagent-wrapper --backend codex resume <session_id> - <<'EOF'
<follow-up task>
EOF

# Or with agent preset
codeagent-wrapper --agent develop resume <session_id> - <<'EOF'
<follow-up task>
EOF
```

### Worktree 隔离

在隔离的 git worktree 中执行，使更改与主分支保持分离：

```bash
codeagent-wrapper --agent develop --worktree - . <<'EOF'
Implement feature in isolation...
EOF
```

**规则：**
- 只读代理（code-explorer、code-architect、code-reviewer）不需要 worktree
- 只有 `develop` 代理在进行更改时才需要 worktree

## 并行执行

对于多步骤或多代理工作，默认使用 `--parallel`。仅当工作确实是线性的，或下一步依赖当前任务的完整输出时，才回退到单任务模式。

### 任务配置格式

```bash
codeagent-wrapper --parallel <<'EOF'
---TASK---
id: <unique_id>
agent: <agent_name>
workdir: <path>
backend: <name>
model: <model_name>
reasoning_effort: <low|medium|high>
skills: <skill1>, <skill2>
dependencies: <id1>, <id2>
session_id: <id>
skip_permissions: true|false
worktree: true|false
---CONTENT---
<task content>
EOF
```

**任务头字段**（除 `id` 外均为可选字段）：

| 字段 | 描述 |
|-------|-------------|
| `id` | 唯一任务标识符（必填） |
| `agent` | Agent 预设名称 |
| `workdir` | 工作目录 |
| `backend` | 覆盖全局后端 |
| `model` | 覆盖模型 |
| `reasoning_effort` | 推理级别 |
| `skills` | 以逗号分隔的 Skill 名称 |
| `dependencies` | 必须先完成的任务 ID，以逗号分隔 |
| `session_id` | 恢复之前的会话 |
| `skip_permissions` | 跳过权限提示（Claude 后端） |
| `worktree` | 在 git worktree 中执行 |

### 多 Agent 编排示例

```bash
codeagent-wrapper --parallel <<'EOF'
---TASK---
id: p1_architecture
agent: code-explorer
workdir: .
---CONTENT---
Map architecture for the authentication subsystem. Return: module map + key files with line numbers.

---TASK---
id: p1_conventions
agent: code-explorer
workdir: .
---CONTENT---
Identify testing patterns, conventions, config. Return: test commands + file locations.

---TASK---
id: p2_design
agent: code-architect
workdir: .
dependencies: p1_architecture, p1_conventions
---CONTENT---
Design minimal-change implementation plan based on architecture analysis.

---TASK---
id: p3_backend
agent: develop
workdir: .
skills: golang-base-practices
dependencies: p2_design
---CONTENT---
Implement backend changes following the design plan.

---TASK---
id: p3_frontend
agent: develop
workdir: .
skills: vercel-react-best-practices,frontend-design
dependencies: p2_design
---CONTENT---
Implement frontend changes following the design plan.

---TASK---
id: p4_review
agent: code-reviewer
workdir: .
dependencies: p3_backend, p3_frontend
---CONTENT---
Review all changes for correctness, edge cases, and KISS compliance.
Classify each issue as BLOCKING or MINOR.
EOF
```

### 依赖解析

- 使用 Kahn 算法对任务进行拓扑排序
- 检测并报告循环依赖
- 父任务失败会导致依赖它的任务被跳过
- 同一层级的独立任务会并发运行

### 输出模式

**摘要（默认）**：按任务提供包含提取字段的结构化报告：
```
=== Execution Report ===
3 tasks | 2 passed | 1 failed

### task_id PASS 92%
Did: Brief description of work done
Files: file1.ts, file2.ts
Tests: 12 passed
Log: /tmp/codeagent-xxx.log

### task_id FAIL
Exit code: 1
Error: Assertion failed
Detail: Expected status 200 but got 401
Log: /tmp/codeagent-zzz.log
```

**完整输出**（`--full-output`）：包含完整的任务消息。仅用于调试特定故障。

### 结构化 JSON 输出

```bash
codeagent-wrapper --parallel --output results.json <<'EOF'
...
EOF
```

生成：
```json
{
  "results": [
    {
      "task_id": "task_1",
      "exit_code": 0,
      "message": "...",
      "session_id": "...",
      "coverage": "92%",
      "files_changed": ["file.ts"],
      "tests_passed": 12,
      "log_path": "/tmp/..."
    }
  ],
  "summary": { "total": 3, "success": 2, "failed": 1 }
}
```

## 返回格式

单任务输出：
```
Agent response text here...

---
SESSION_ID: 019a7247-ac9d-71f3-89e2-a823dbd8fd14
```

## 环境变量

| 变量 | 描述 | 默认值 |
|----------|-------------|---------|
| `CODEAGENT_SKIP_PERMISSIONS` | 跳过 Claude 后端权限提示（`true`/`false`） | true |
| `CODEX_BYPASS_SANDBOX` | 控制是否绕过 Codex 沙箱（`true`/`false`） | true |
| `CODEAGENT_MAX_PARALLEL_WORKERS` | 最大并发工作进程数（0=无限制，最大 100） | 0 |
| `CODEAGENT_TMPDIR` | 可执行脚本的自定义临时目录 | 系统临时目录 |
| `CODEAGENT_ASCII_MODE` | 使用 ASCII 符号（PASS/WARN/FAIL）而非 Unicode | false |

**配置文件**：支持 `~/.codeagent/config.(yaml|yml|json|toml)`，使用与 CLI 标志相同的键（kebab-case）。环境变量使用带下划线的 `CODEAGENT_` 前缀。

## 退出代码

| 代码 | 含义 |
|------|---------|
| `0` | 成功 |
| `1` | 常规错误（缺少参数、任务失败） |
| `127` | 未找到后端命令 |
| `130` | 已中断（Ctrl+C） |

## 调用模式

**单任务**：
```
Bash tool parameters:
- command: codeagent-wrapper --agent <agent> --skills <skills> - [workdir] <<'EOF'
  <task content>
  EOF
- background: true
- description: <brief description>
```

**并行任务**：
```
Bash tool parameters:
- command: codeagent-wrapper --parallel <<'EOF'
  ---TASK---
  id: task_id
  agent: <agent>
  workdir: /path
  skills: <skill1>, <skill2>
  dependencies: dep1, dep2
  ---CONTENT---
  task content
  EOF
- background: true
- description: <brief description>
```

## 关键规则

**绝不要终止 codeagent 进程。** 长时间运行的任务很正常。默认在后台执行并检查进度，而不是阻塞等待命令完成。

1. **通过日志文件检查任务状态**：
   ```bash
   tail -f /tmp/claude/<workdir>/tasks/<task_id>.output
   ```

2. **优先使用包装器进度帧，而不是临时抓取日志**：
   如果 stdout 仍在输出 `[codeagent-progress] ...`，则任务仍在运行，并未停滞。

3. **检查进程，但不要终止**：
   ```bash
   ps aux | grep codeagent-wrapper | grep -v grep
   ```

**原因：** 终止进程会浪费 API 成本并丢失进度。

## 工具控制（Claude 后端）

将 Claude 后端与 agent 预设配合使用时，可控制可用工具：

```json
{
  "agents": {
    "safe-develop": {
      "backend": "claude",
      "allowed_tools": ["Read", "Write", "Bash", "Grep", "Glob"],
      "disallowed_tools": ["WebFetch", "WebSearch"]
    }
  }
}
```

作为 `--allowedTools` 和 `--disallowedTools` 传递给 Claude CLI。仅支持显式列举（不支持通配符）。