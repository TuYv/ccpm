---
name: enhance-hooks
description: "Use when reviewing hooks for safety, timeouts, and correct frontmatter."
version: 5.1.0
argument-hint: "[path] [--fix]"
---
# enhance-hooks

分析钩子定义和脚本的安全性、正确性及最佳实践。

## 解析参数

```javascript
const args = '$ARGUMENTS'.split(' ').filter(Boolean);
const targetPath = args.find(a => !a.startsWith('--')) || '.';
const fix = args.includes('--fix');
```

## 工作流程

1. **发现** - 查找钩子文件（.md、.sh、.json）
2. **分类** - 识别钩子类型和事件
3. **解析** - 提取 frontmatter 和脚本内容
4. **检查** - 根据下方知识运行所有模式检查
5. **筛选** - 应用确定性筛选
6. **报告** - 生成 Markdown 输出
7. **修复** - 如果存在 --fix 标志，则应用自动修复

---

## 钩子知识参考

### 什么是钩子

钩子是在 Claude Code 会话中特定时间点触发的自动化操作。它们通过 bash 命令或基于 LLM 的评估，实现对 Claude 操作的验证、监控和控制。

### 钩子生命周期（完整参考）

钩子按以下顺序触发：

| 顺序 | 事件 | 描述 | 是否需要匹配器 |
|-------|-------|-------------|------------------|
| 1 | `SessionStart` | 会话开始或恢复 | 否 |
| 2 | `UserPromptSubmit` | 用户提交提示词 | 否 |
| 3 | `PreToolUse` | 工具执行之前（可修改/阻止） | 是 |
| 4 | `PermissionRequest` | 权限对话框出现时 | 是 |
| 5 | `PostToolUse` | 工具成功执行之后 | 是 |
| 6 | `SubagentStart` | 生成子智能体时 | 否 |
| 7 | `SubagentStop` | 子智能体完成时 | 否 |
| 8 | `Stop` | Claude 完成响应时 | 否 |
| 9 | `PreCompact` | 上下文压缩之前 | 否 |
| 10 | `SessionEnd` | 会话终止时 | 否 |
| 11 | `Notification` | Claude Code 发送通知时 | 否 |

### 钩子类型

**命令钩子**（`type: "command"`）：
- 执行 bash 命令，并拥有完整的 stdin/stdout 控制能力
- 适用于所有事件

**提示词钩子**（`type: "prompt"`）：
- 使用 LLM 评估来进行智能且具备上下文感知能力的决策
- **仅支持 `Stop` 和 `SubagentStop` 事件**

### 配置位置

| 文件 | 位置 | 作用域 | 是否提交 |
|------|----------|-------|-----------|
| 用户设置 | `~/.claude/settings.json` | 所有项目 | 否 |
| 项目设置 | `.claude/settings.json` | 当前项目 | 是 |
| 本地设置 | `.claude/settings.local.json` | 当前项目 | 否 |

### 配置结构

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/validate-bash.sh",
            "timeout": 30
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/format-code.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Check if all requested tasks are complete.",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

### 匹配器语法

| 模式 | 说明 |
|---------|-------------|
| `Write` | 匹配确切的工具名称 |
| `Edit\|Write` | 匹配多个工具（正则表达式 OR） |
| `Notebook.*` | 正则表达式模式匹配 |
| `*` 或 `""` | 匹配所有工具 |
| （省略） | Stop、SubagentStop、UserPromptSubmit 必须省略 |

### 输入模式（通过 stdin 传入 JSON）

所有钩子都会接收以下 JSON 结构：

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript",
  "cwd": "/project/root",
  "permission_mode": "default",
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": {
    "command": "npm test",
    "description": "Run test suite"
  }
}
```

### 退出码

| 退出码 | 行为 |
|-----------|----------|
| 0 | 成功——stdout 会显示给用户或作为上下文添加 |
| 2 | 阻断错误——显示 stderr，并阻止操作 |
| 其他 | 非阻断错误——在详细模式下显示 stderr |

### 输出模式

**PreToolUse 决策控制：**
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow|deny|ask",
    "permissionDecisionReason": "Reason for decision",
    "updatedInput": {
      "command": "modified command"
    },
    "additionalContext": "Context for Claude"
  }
}
```

**Stop/SubagentStop 控制：**
```json
{
  "decision": "block",
  "reason": "Tasks incomplete: missing test coverage"
}
```

### 环境变量

| 变量 | 说明 | 可用范围 |
|----------|-------------|--------------|
| `CLAUDE_PROJECT_DIR` | 项目根目录的绝对路径 | 所有钩子 |
| `CLAUDE_CODE_REMOTE` | 如果是远程会话，则为 "true" | 所有钩子 |
| `CLAUDE_ENV_FILE` | 用于持久化环境变量的路径 | 仅 SessionStart |
| `CLAUDE_FILE_PATHS` | 以空格分隔的文件路径 | PostToolUse（Write/Edit） |

### 实用钩子示例

**安全防火墙（PreToolUse）：**
```bash
#!/usr/bin/env bash
set -euo pipefail

cmd=$(jq -r '.tool_input.command // ""')

# Block dangerous patterns
if echo "$cmd" | grep -qE 'rm -rf|git reset --hard|curl.*\|.*sh'; then
  echo '{"decision": "block", "reason": "Dangerous command blocked"}' >&2
  exit 2
fi

exit 0
```

**自动格式化程序（PostToolUse）：**
```bash
#!/usr/bin/env bash
set -euo pipefail

files=$(jq -r '.tool_input.file_path // ""')

for file in $files; do
  case "$file" in
    *.py) black "$file" 2>/dev/null || true ;;
    *.js|*.ts) prettier --write "$file" 2>/dev/null || true ;;
  esac
done

exit 0
```

**命令记录器（PreToolUse）：**
```bash
#!/usr/bin/env bash
set -euo pipefail
cmd=$(jq -r '.tool_input.command // ""')
printf '%s %s\n' "$(date -Is)" "$cmd" >> .claude/bash-commands.log
exit 0
```

**工作流编排（SubagentStop——提示词类型）：**
```json
{
  "hooks": {
    "SubagentStop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Review the subagent's work. Did it complete all tasks?"
          }
        ]
      }
    ]
  }
}
```

---

## 检测模式

### 1. Frontmatter 验证（高确定性）

**必需：**
- 使用 `---` 分隔符的 YAML frontmatter
- frontmatter 中包含 `name` 字段
- frontmatter 中包含 `description` 字段

**推荐：**
- 为命令钩子设置 `timeout`（默认值：30s）
- 指定钩子类型

**标记：**
- 缺少 frontmatter 分隔符
- 缺少名称或描述

### 2. 脚本安全性（高确定性）

**必需的安全模式：**
- 在脚本开头使用 `set -euo pipefail`
- 为 jq/JSON 解析添加错误处理
- 正确引用变量

**需要标记的危险模式：**

| 模式 | 风险 | 确定性 |
|---------|------|-----------|
| `rm -rf` | 未经确认即执行破坏性操作 | 高 |
| `git reset --hard` | 存在数据丢失风险 | 高 |
| `curl \| sh` | 远程代码执行 | 高 |
| `eval "$input"` | 任意代码执行 | 高 |
| `rm -r` | 递归删除（可能是有意为之） | 中 |
| `git push --force` | 强制推送（可能是有意为之） | 中 |

### 3. 退出代码处理（高确定性）

**检查：** 脚本是否使用正确的退出代码

**标记：**
- 成功路径缺少 `exit 0`
- 使用退出代码 1 表示阻止操作（应为 2）
- 脚本末尾没有退出代码

### 4. 钩子类型适用性（高确定性）

**检查：** 钩子类型是否与事件匹配

**标记：**
- 将提示词钩子用于 Stop/SubagentStop 以外的事件
- 缺少类型说明

### 5. 生命周期事件适用性（中等确定性）

| 事件 | 适用场景 |
|-------|----------------------|
| `PreToolUse` | 安全验证、命令阻止、输入修改 |
| `PostToolUse` | 格式化、日志记录、通知 |
| `Stop` | 完成情况检查、清理、总结 |
| `SubagentStop` | 工作流编排、结果验证 |
| `SessionStart` | 环境设置、初始化 |

**标记：**
- PostToolUse 钩子试图阻止操作（为时已晚）
- PreToolUse 钩子执行繁重处理（应保持快速）
- 在不受支持的事件上使用提示词钩子

### 6. 超时配置（中等确定性）

**指南：**
- 默认值：命令钩子为 30 秒
- 网络操作：始终设置明确的超时时间
- 外部服务调用：根据预期延迟设置超时时间

**标记：**
- 网络操作未设置超时时间
- 外部服务调用缺少超时设置
- 超时时间过长且无合理说明（>60s）

### 7. 输出格式（中等确定性）

**PreToolUse 输出字段：**
- `permissionDecision`：allow、deny 或 ask
- `permissionDecisionReason`：决策说明
- `updatedInput`：修改后的工具输入（可选）
- `additionalContext`：提供给 Claude 的上下文（可选）

**标记：**
- permissionDecision 值无效
- deny 决策缺少原因
- JSON 输出格式错误

### 8. 匹配器模式（中等确定性）

**检查：** 匹配器语法是否有效

**标记：**
- 正则表达式模式无效
- 匹配器范围过于宽泛（无合理说明的 `*`）
- 在不支持匹配器的事件（Stop、SubagentStop）上使用匹配器

### 9. 反模式（低确定性）

- 钩子中包含复杂逻辑（应保持简单快速）
- 缺少文档/注释
- 硬编码路径（应使用 `$CLAUDE_PROJECT_DIR`）
- 网络调用缺少错误处理
- 钩子脚本中包含密钥/凭据

---

## 自动修复实现

### 1. 缺少安全标头
```bash
#!/usr/bin/env bash
set -euo pipefail
```

### 2. 缺少退出码
在脚本末尾添加 `exit 0`

### 3. 缺少 frontmatter 字段
```yaml
---
name: hook-name
description: Hook description
timeout: 30
---
```

### 4. 阻塞退出码错误
对于阻塞错误，将 `exit 1` 替换为 `exit 2`

---

## 输出格式

```markdown
## Hook Analysis: {hook-name}

**File**: {path}
**Type**: {command|prompt|config}
**Event**: {PreToolUse|PostToolUse|Stop|...}

### Summary
- HIGH: {count} issues
- MEDIUM: {count} issues

### Frontmatter Issues ({n})
| Issue | Fix | Certainty |

### Safety Issues ({n})
| Issue | Fix | Certainty |

### Exit Code Issues ({n})
| Issue | Fix | Certainty |

### Lifecycle Issues ({n})
| Issue | Fix | Certainty |

### Output Format Issues ({n})
| Issue | Fix | Certainty |
```

---

## 模式统计

| 类别 | 模式数 | 可自动修复 |
|----------|----------|--------------|
| Frontmatter | 3 | 2 |
| 安全性 | 6 | 2 |
| 退出码 | 3 | 2 |
| Hook 类型 | 2 | 0 |
| 生命周期 | 5 | 0 |
| 超时 | 3 | 0 |
| 输出 | 3 | 0 |
| 匹配器 | 3 | 0 |
| 反模式 | 5 | 0 |
| **总计** | **33** | **6** |

---

<examples>
### 示例：缺少安全标头

<bad_example>
```bash
#!/usr/bin/env bash
cmd=$(jq -r '.tool_input.command // ""')
```
**为什么不好**：缺少 `set -euo pipefail` 意味着错误可能会在不被察觉的情况下被忽略。
</bad_example>

<good_example>
```bash
#!/usr/bin/env bash
set -euo pipefail
cmd=$(jq -r '.tool_input.command // ""')
```
**为什么好**：遇到错误、未设置的变量和管道失败时立即退出。
</good_example>

### 示例：用于阻塞的退出码错误

<bad_example>
```bash
if [[ "$cmd" == *"rm -rf"* ]]; then
  echo "Blocked dangerous command" >&2
  exit 1  # Wrong!
fi
```
**为什么不好**：退出码 1 不会阻塞操作。操作仍将继续执行。
</bad_example>

<good_example>
```bash
if [[ "$cmd" == *"rm -rf"* ]]; then
  echo '{"decision": "block", "reason": "Dangerous command"}' >&2
  exit 2  # Correct blocking exit code
fi
```
**为什么好**：退出码 2 会阻塞操作。JSON 输出可提供上下文。
</good_example>

### 示例：Prompt Hook 用于错误的事件

<bad_example>
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "hooks": [{ "type": "prompt", "prompt": "Is this safe?" }]
      }
    ]
  }
}
```
**为什么不好**：Prompt Hook 仅适用于 Stop 和 SubagentStop 事件。
</bad_example>

<good_example>
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "hooks": [{ "type": "command", "command": "./validate.sh" }]
      }
    ]
  }
}
```
**为什么好**：Command Hook 适用于所有事件。
</good_example>

### 示例：危险命令模式

<bad_example>
```bash
if echo "$cmd" | grep -q 'rm'; then
  exit 2
fi
```
**为什么不好**：范围过于宽泛，会阻塞合法的 `rm file.tmp`。
</bad_example>

<good_example>
```bash
if echo "$cmd" | grep -qE 'rm\s+(-rf|-fr)\s+/'; then
  exit 2
fi
```
**为什么好**：具体模式可精准匹配真正危险的命令。
</good_example>

### 示例：硬编码路径

<bad_example>
```bash
log_file="/home/user/project/.claude/commands.log"
```
**为什么不好**：硬编码路径在其他机器上会失效。
</bad_example>

<good_example>
```bash
log_file="$CLAUDE_PROJECT_DIR/.claude/commands.log"
```
**为什么好**：使用环境变量以实现可移植性。
</good_example>
</examples>

---

## 约束

- 仅对确定性为 HIGH 的问题应用自动修复
- 谨慎处理安全模式——假阴性比假阳性更糟糕
- 绝不删除内容，只提出改进建议
- 根据上方嵌入的知识参考进行验证