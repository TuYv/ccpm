---
name: claude-mem-install
description: >-
  Use this when setting up claude-mem on Grok Bot: local worker plus CMEM Pro
  observer (default), optional host-login observer, or remote cmem.ai. No Cursor
  required.
---
# 在 Grok Bot 上安装 claude-mem

独立于 Cursor。Grok Bot 没有 session-start / file-read / tool-use 钩子。

## 本地 worker + CMEM Pro observer（默认）

```
npx claude-mem install --ide grok-bot
```

除非你想要环回 shim，否则**不要**传入 `--provider host`。不传 `--provider` 时，这就是 CMEM Pro 路径：

- Worker 运行在 `127.0.0.1:<port>`（默认 `37700 + uid%100`）。健康状态下不要重启。
- 每个 Grok Bot agent 各有一个 transcript watcher（`platformSource=grok-bot`）
- 通过 CMEM Pro 的 observer：`CLAUDE_MEM_PROVIDER=openrouter`、`CLAUDE_MEM_OPENROUTER_BASE_URL=https://cmem.ai/api/inference/v1`、`CLAUDE_MEM_OPENROUTER_MODEL=cmem-observer`，API 密钥来自安装器的 OAuth（`cm_pro` 记忆密钥）
- 交互式安装器会预先选中 CMEM Pro
- 在真实任务开始时调用 MCP `session_start_context`

无需 xAI 密钥。无需 Claude CLI。

## 可选：本地 host-login observer

仅限显式选择启用。并非用户默认。

```
npx claude-mem install --ide grok-bot --provider host
```

在**空闲的**环回端口（而非 worker 端口）上运行 OpenAI 兼容的环回 shim。空闲时的回复为 `<skip_summary />`；已完成的单元为一条 `<observation>`。此 Grok 登录用于完成 inbox 任务（skill host-observer）。

## 远程 worker / 远程 observer

设置插件变量 `CLAUDE_MEM_MCP_TOKEN`，并使用 MCP `claude-mem-remote`。

```
npx claude-mem install --ide grok-bot --runtime server --server-url https://cmem.ai
```
