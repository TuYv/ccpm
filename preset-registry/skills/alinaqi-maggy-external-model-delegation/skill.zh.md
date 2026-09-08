---
name: external-model-delegation
description: UserPromptSubmit hook pattern that classifies prompts into six cost tiers and delegates to external model CLIs
when-to-use: When configuring or debugging prompt-based delegation to qwen3, deepseek, kimi, or codex
user-invocable: false
effort: medium
---
# 外部模型委派模式

`UserPromptSubmit` hook 将每个用户提示分类为六种成本/性能层级之一。该 hook 注入 `additionalContext`，指示 Claude 运行特定的委派脚本并返回其输出。

## 层级路由表

| 层级 | 委派命令 | 成本 |
|------|----------|------|
| QWEN | `qwen3 "prompt"` | $0（本地 Ollama） |
| DEEPSEEK_FLASH | `deepseek --flash "prompt"` | 每百万 tokens $0.14 / $0.28 |
| DEEPSEEK_PRO | `deepseek --pro "prompt"` | 每百万 tokens $0.44 / $0.87 |
| KIMI | `kimi --quiet -p "prompt"` | 每百万 tokens $0.60 / $2.50 |
| CODEX | `codex exec` | 不固定 |
| CLAUDE | 原生处理 | 每百万 tokens $3-5 / $15-25 |

## 委派脚本模式

每个脚本都是 `~/bin/` 中的独立可执行文件，接受一个提示并将响应写入 stdout：

```
~/bin/
├── qwen3      # Shell: curl to local Ollama API
├── kimi       # Shell: execs Kimi CLI binary
├── deepseek   # Python: httpx to DeepSeek Anthropic-compat API
└── route-task # Shell + qwen3: classifies prompt into tier
```

### 脚本契约

1. 将提示作为第一个参数：`qwen3 "what is 2+2"`
2. 支持 `--flash` / `--pro` 模型标志（deepseek）
3. 支持 `--quiet` 模式标志（kimi）
4. 将响应写入 stdout，将错误写入 stderr
5. 成功时退出码为 0，出错时返回非零退出码

## 编写新的委派脚本

```bash
#!/bin/bash
# Minimal delegator template
PROMPT="$1"
API_KEY="${EXTERNAL_API_KEY:-}"
# Call external API, write result to stdout
curl -s https://api.example.com/chat \
  -H "Authorization: Bearer $API_KEY" \
  -d "$(jq -n --arg p "$PROMPT" '{prompt: $p}')" \
  | jq -r '.response'
```

## 路由 hook 流程

```
User types prompt
    ↓
UserPromptSubmit hook fires
    ↓
qwen3 classifies into tier (QWEN|DEEPSEEK_FLASH|DEEPSEEK_PRO|KIMI|CODEX|CLAUDE)
    ↓
Hook injects additionalContext: "Run: <delegation-command>"
    ↓
Claude reads context, spawns delegation script, returns output
    ↓
User sees response from the delegated model
```

## 分类层级

| 层级 | 任务类型 |
|------|----------|
| QWEN | grep、find、regex、shell、语法查询、日志阅读、简短摘要 |
| DEEPSEEK_FLASH | 简单代码、样板代码、CRUD、编写测试、小型修复、配置 |
| DEEPSEEK_PRO | 多文件功能、重构、调试、中等规模编码、文档 |
| KIMI | 单文件审查、中等推理、提交消息、diff 摘要 |
| CODEX | 跨多个文件的大批量生成、机械式修改 |
| CLAUDE | 架构、安全、复杂调试、系统设计、质量关键型任务 |

## 环境

```bash
# Required env vars (set in ~/.zshrc)
export DEEPSEEK_API_KEY="sk-..."      # For deepseek delegator
export OPENAI_API_KEY="sk-..."         # For codex CLI
# Ollama must be running locally for qwen3 classification + delegation
```