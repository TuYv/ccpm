---
name: block-no-verify-hook
description: Configure a PreToolUse hook to prevent AI agents from skipping git pre-commit hooks with --no-verify and other bypass flags. Use when setting up Claude Code projects that enforce commit quality gates.
---
# 阻止 No-Verify 的钩子

一种 PreToolUse 钩子配置，可在执行前拦截并阻止绕过标志的使用，确保 AI 代理无法跳过 pre-commit 钩子、GPG 签名或其他 git 安全机制。

## 概述

AI 编码代理（Claude Code、Codex 等）可以运行带有 `--no-verify` 等标志的 shell 命令来绕过 pre-commit 钩子。这使得 pre-commit 钩子中配置的 lint、格式化、测试和安全检查形同虚设。block-no-verify 钩子添加了一个 PreToolUse 防护，会在执行前拒绝任何包含绕过标志的工具调用。

## 问题

当 AI 代理提交代码时，可能会使用绕过标志来避免钩子执行失败：

```bash
# These commands skip pre-commit hooks entirely
git commit --no-verify -m "quick fix"
git push --no-verify
git commit --no-gpg-sign -m "unsigned commit"
git merge --no-verify feature-branch
```

这会导致：
- 未格式化的代码进入仓库
- lint 错误绕过检查
- 安全扫描被跳过
- 未签名的提交绕过签名策略
- 测试套件被绕过

## 解决方案

在 `.claude/settings.json` 中添加一个 `PreToolUse` 钩子，它会检查每一次 Bash 工具调用，并阻止包含绕过标志的命令。

### 配置

将以下内容添加到项目的 `.claude/settings.json` 中：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hook": {
          "type": "command",
          "command": "if printf '%s' \"$TOOL_INPUT\" | grep -qE '(^|&&|;|\\|)\\s*git\\s+.*--(no-verify|no-gpg-sign)'; then echo 'BLOCKED: --no-verify and --no-gpg-sign flags are not allowed. Run the commit without bypass flags so that pre-commit hooks execute properly.' >&2; exit 2; fi"
        }
      }
    ]
  }
}
```

### 工作原理

1. **匹配器**：该钩子仅针对 `Bash` 工具调用，因此不会干扰其他工具（Read、Edit、Grep 等）。
2. **检查**：`$TOOL_INPUT` 环境变量包含代理即将执行的完整命令。该钩子使用 `printf` 安全地传递输入（避免 `echo` 在处理特殊字符时的陷阱），并且仅检查跟在 `git` 命令后面的 `--no-verify` 或 `--no-gpg-sign` 标志。
3. **阻止**：如果在 git 命令中发现绕过标志，该钩子会以退出码 2 退出并打印一条错误消息。退出码 2 会让 Claude Code 完全拒绝该工具调用。
4. **放行**：如果未发现绕过标志，该钩子会以退出码 0 退出，命令正常执行。

### 退出码

| 代码 | 含义 |
|------|---------|
| 0 | 允许工具调用继续执行 |
| 1 | 错误（工具调用仍会继续执行，但会显示警告） |
| 2 | 完全阻止该工具调用 |

## 被阻止的标志

| 标志 | 用途 | 阻止原因 |
|------|---------|-------------|
| `--no-verify` | 跳过 pre-commit 和 commit-msg 钩子 | 绕过 lint、格式化、测试和安全检查 |
| `--no-gpg-sign` | 跳过 GPG 提交签名 | 绕过提交签名策略 |

## 安装

### 项目级设置

在项目根目录下创建或更新 `.claude/settings.json`：

```bash
mkdir -p .claude
cat > .claude/settings.json << 'EOF'
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hook": {
          "type": "command",
          "command": "if printf '%s' \"$TOOL_INPUT\" | grep -qE '(^|&&|;|\\|)\\s*git\\s+.*--(no-verify|no-gpg-sign)'; then echo 'BLOCKED: --no-verify and --no-gpg-sign flags are not allowed. Run the commit without bypass flags so that pre-commit hooks execute properly.' >&2; exit 2; fi"
        }
      }
    ]
  }
}
EOF
```

### 全局设置

若要在所有项目中强制生效，请将配置添加到 `~/.claude/settings.json`：

```bash
mkdir -p ~/.claude
cat > ~/.claude/settings.json << 'EOF'
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hook": {
          "type": "command",
          "command": "if printf '%s' \"$TOOL_INPUT\" | grep -qE '(^|&&|;|\\|)\\s*git\\s+.*--(no-verify|no-gpg-sign)'; then echo 'BLOCKED: --no-verify and --no-gpg-sign flags are not allowed. Run the commit without bypass flags so that pre-commit hooks execute properly.' >&2; exit 2; fi"
        }
      }
    ]
  }
}
EOF
```

## 验证

测试该钩子是否会阻止绕过标志：

```bash
# This should be blocked by the hook:
git commit --no-verify -m "test"

# This should succeed normally:
git commit -m "test"
```

## 扩展钩子

### 添加更多要阻止的标志

要阻止其他标志（例如 `--force`），请扩展 grep 模式：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hook": {
          "type": "command",
          "command": "if printf '%s' \"$TOOL_INPUT\" | grep -qE '(^|&&|;|\\|)\\s*git\\s+.*--(no-verify|no-gpg-sign|force-with-lease|force)'; then echo 'BLOCKED: Bypass flags are not allowed.' >&2; exit 2; fi"
        }
      }
    ]
  }
}
```

### 与其他钩子组合使用

block-no-verify 钩子可与其他 PreToolUse 钩子配合使用：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hook": {
          "type": "command",
          "command": "if printf '%s' \"$TOOL_INPUT\" | grep -qE '(^|&&|;|\\|)\\s*git\\s+.*--(no-verify|no-gpg-sign)'; then echo 'BLOCKED: Bypass flags not allowed.' >&2; exit 2; fi"
        }
      },
      {
        "matcher": "Bash",
        "hook": {
          "type": "command",
          "command": "if printf '%s' \"$TOOL_INPUT\" | grep -qE 'rm\\s+-rf\\s+/'; then echo 'BLOCKED: Dangerous rm command.' >&2; exit 2; fi"
        }
      }
    ]
  }
}
```

## 最佳实践

1. **提交设置文件** —— 将 `.claude/settings.json` 纳入版本控制，以便团队所有成员都能受益于该钩子。
2. **在入职文档中说明** —— 在项目的贡献指南中提及该钩子，让开发者了解为什么要阻止绕过标志。
3. **与 pre-commit 钩子配合使用** —— block-no-verify 钩子确保 pre-commit 钩子得以运行；请确保你配置了有实际意义的 pre-commit 钩子。
4. **设置后进行测试** —— 通过在测试提交中故意触发该钩子，验证其是否正常工作。
