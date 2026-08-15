---
name: local-codex
description: "Launch and manage OpenAI Codex CLI (local agent) as a non-interactive coding sub-agent. Use when the user wants to delegate coding tasks to Codex, run code reviews, generate or refactor code, or use Codex GPT-5.5 agent capabilities through local CLI. Triggers on phrases like 'codex', 'run codex', 'codex exec', 'code review with codex', 'delegate to codex', 'use codex for coding', or any request to invoke the local Codex CLI agent. Uses ChatGPT Pro OAuth (flat-rate, no API charges) via ~/.codex/auth.json. Never uses API keys."
---
# 本地 Codex

使用你的 ChatGPT Pro 订阅（OAuth，无 API 费用），将编码任务委托给本地 OpenAI Codex CLI 智能体。

## 何时使用

- 用户希望通过 Codex 生成、重构或审查代码
- 用户希望运行 `codex exec` 执行非交互式任务
- 用户希望使用 Codex 的 GPT-5.5 智能体能力
- 用户提到“codex”“run codex”或“delegate to codex”

## 身份验证（OAuth / ChatGPT Pro）

**重要**：此技能使用来自 `~/.codex/auth.json` 的 OAuth 身份验证（ChatGPT Pro 固定费率订阅）。**请勿设置 `OPENAI_API_KEY` 或传递 API 密钥**——否则将切换为按使用量计费。

- Codex 桌面应用和 CLI 共享相同的身份验证缓存
- 如果身份验证失败，请在终端中运行 `codex login`（浏览器 OAuth 流程）
- 有关身份验证问题，请参阅 [references/oauth-guide.md](references/oauth-guide.md)

## Codex CLI 路径

此技能按以下顺序自动检测 Codex CLI：
1. `/Applications/Codex.app/Contents/Resources/codex`（桌面应用）
2. `/usr/local/bin/codex`（npm 全局安装）
3. `/opt/homebrew/bin/codex`（Homebrew）
4. `~/.npm-global/bin/codex`
5. 回退到 `which codex`

## 使用模式

### 1. 基本执行（单个任务）

```bash
python3 scripts/codex_wrapper.py exec "<prompt>" [<workdir>] [<model>] [<sandbox>] [<timeout>]
```

示例：
```bash
python3 scripts/codex_wrapper.py exec \
  "Write a Python function to calculate fibonacci" \
  /tmp \
  gpt-5.5 \
  workspace-write \
  300
```

### 2. 代码审查

```bash
python3 scripts/codex_wrapper.py review [<workdir>] [<model>] [uncommitted:true] [<timeout>]
```

示例：
```bash
python3 scripts/codex_wrapper.py review \
  /path/to/repo \
  gpt-5.5 \
  true \
  300
```

### 3. 检查状态

```bash
python3 scripts/codex_wrapper.py status
```

## 输出格式

包装器返回包含以下字段的 JSON：
- `success`：布尔值
- `exit_code`：整数
- `elapsed_seconds`：浮点数
- `stdout`：原始输出
- `stderr`：错误流（已截断）
- `parsed_jsonl`：解析后的 JSONL 事件（如果使用 --json）
- `final_message`：提取的助手文本（如果可用）

## 参数

| 参数 | 默认值 | 选项 |
|-----------|---------|---------|
| model | `gpt-5.5` | `gpt-5.5`、`gpt-5.5-pro`、`o4-mini` 等 |
| sandbox | `workspace-write` | `read-only`、`workspace-write`、`danger-full-access` |
| timeout | 300 | 秒（对于大型任务请增加） |
| json_output | true | 始终为 true（包装器解析 JSONL） |

## 安全说明

- 对于分析/审查任务，使用 `sandbox=read-only`（不写入文件）
- 对于代码生成任务，使用 `sandbox=workspace-write`（写入工作目录）
- 仅在明确需要时使用 `sandbox=danger-full-access`（完整系统访问权限）
- 在 Git 仓库之外运行时，始终使用 `--skip-git-repo-check`
- 对于一次性任务，使用 `--ephemeral`（不保留会话）

## 会话管理

对于多步骤任务，Codex 支持恢复会话：
```bash
# First step
codex exec --ephemeral "Step 1..."
# Later
codex exec resume --last "Step 2..."
```

包装器目前运行单次执行。对于多步骤工作流，请使用原始 `codex exec` 命令。

## 限制

- 必须运行桌面应用才能刷新 OAuth 令牌（或者令牌必须仍然有效）
- 当前版本（alpha）中的 `codex doctor` 存在问题，请避免使用
- 环境变量**不会**继承到 Codex 的沙箱中；请通过配置或提示词传递
- 大文件操作可能需要增加超时时间