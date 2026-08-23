---
name: trace-ingest
description: Publish a local Claude, Codex, or OpenAgents conversation as a public OpenAgents trace at openagents.com/trace/{uuid}. Use when the user wants to take a conversation/session id on this machine, sanitize/redact it, ingest it via the OpenAgents API, and get a shareable /trace/{uuid} URL — repeatably and at scale.
---
# 本地对话 → 公开的 /trace/{uuid}

此技能可将在本机上已存在的对话（Claude Code 会话、Codex rollout 或 OpenAgents Desktop 对话）转换为**公开的** OpenAgents 轨迹，并可在 `https://openagents.com/trace/{uuid}` 查看。

它是对 `apps/qa-runner` 中已有机制的一层轻量 CLI 封装：包括 ATIF 转换器、`@openagentsinc/atif` 的公开安全脱敏器与触发器，以及 `POST /api/traces` 发布传输。有关完整架构和服务器契约，请阅读审计文档 `docs/traces/2026-07-19-local-conversation-public-trace-ingest.md`。

## 唯一需要的命令

在仓库中运行（使用 `tsx`，无需构建/安装步骤）：

```sh
cd /Users/christopherdavid/work/openagents/apps/qa-runner

# 1) ALWAYS dry-run first — build + redact + validate locally, no upload:
pnpm trace:ingest <conversationId> --dry-run --out /tmp/trace.json --json

# 2) Publish (needs an agent token):
export OPENAGENTS_AGENT_TOKEN=oa_agent_...        # never print or commit this
pnpm trace:ingest <conversationId>                # visibility=public by default
```

成功后会输出可分享的 URL：

```
published public trace from claude (303 steps):
  https://openagents.com/trace/1f4c…-…-…
```

`pnpm trace:ingest` = `node --import tsx src/ingest-conversation-cli.ts`。

## 什么是“对话 ID”

| 来源               | ID 形式                                   | 存储位置                                                                                   |
| ------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| Claude Code        | v4 UUID（会话 ID）                        | `~/.claude/projects/<slug>/<id>.jsonl`                                                     |
| Codex              | UUIDv7（位于 rollout 文件名末尾）         | `~/.codex/sessions/YYYY/MM/DD/rollout-*-<id>.jsonl`                                        |
| OpenAgents Desktop | 大写 UUID                                 | `~/Library/Application Support/<Profile>/KhalaDesktop/conversations.json` 中的数组元素     |
| Full Auto 主机线程 | UUID（运行的 `threadRef`）                | `<userData>/threads.json` 中的线程——传入 `--source openagents --user-data <userData>`       |

来源会被**自动检测**（claude → codex → openagents）。当 ID 可能存在歧义时，可使用 `--source claude|codex|openagents` 强制指定来源。

Full Auto 隔离主机不使用 `conversations.json`。它们将运行线程存储在 `<userData>/threads.json`（`{version, threads:[{id, title, notes}]}`）中。使用 `--user-data <userData>` 和线程 ID，将 openagents 来源指向该存储。它会生成与普通对话相同的脱敏 ATIF。

## 标志

- `-s, --source <kind>` — 强制指定来源（默认为 `auto`）。
- `-v, --visibility <public|unlisted|owner_only>` — 存储的可见性。默认值为 `public`。`unlisted` 表示仅可通过链接访问且不会被列出。`owner_only` 表示私有。
- `--dry-run` — 构建 + 脱敏 + 验证，但**不**上传。
- `--out <file>` — 与 `--dry-run` 一起使用时，写入脱敏后的 ATIF JSON 以供检查。
- `--max-steps <n>` — 限制步骤数，默认值和硬性上限均为 `2000`。它会保留有效的前缀，并注明已截断。大型编码会话会超出服务器上限。此标志可确保它们仍能被摄取，而不是失败。
- `--agent-name <name>`, `--model <id>` — 覆盖轨迹头信息。
- `--user-data <dir>` — 还会在此应用的 userData 目录中探测 `openagents` 来源：Full Auto 隔离主机 `threads.json` 中的运行线程（或该目录下的 `KhalaDesktop/conversations.json`）。未设置 = 与默认查找按字节完全一致。
- `--base-url <url>` — 摄取基础 URL（默认为 `$OPENAGENTS_BASE_URL` 或 `https://openagents.com`）。
- `--token <oa_agent_…>` — 智能体 bearer 令牌（默认为 `$OPENAGENTS_AGENT_TOKEN`）。
- `--json` — 机器可读的结果（uuid、url、脱敏计数）。

## 安全模型（不得削弱）

1. CLI 使用摄取 API 所信任的同一个 `@openagentsinc/atif`
   脱敏器对轨迹进行**深度脱敏**（主目录路径、电子邮件、令牌、密钥、钱包
   材料、IP、电话号码、长数据块、用户名……）。
2. 随后，它会在本地运行**公共安全触发检查**；如果仍有任何泄漏内容，
   它将拒绝上传——你会收到检查结果代码，绝不会发生无提示泄漏。
3. **服务器会再次执行脱敏和触发检查**，并拒绝任何不安全的内容（422）。
   公开轨迹仅作为证据：它不授予任何工作验收、付款或公开声明的权限。

首次公开发布敏感会话前，务必使用 `--dry-run --out`，并目视检查 JSON。
切勿在共享历史记录中的命令行上传入令牌——应优先使用环境中的
`OPENAGENTS_AGENT_TOKEN`。

## 扩展规模／重复使用

- 发布操作具有**幂等性**：重新运行同一对话会返回相同的 uuid（其键值为
  脱敏后轨迹的摘要）。
- 要一次性处理大量会话，可循环将 id 传给 `pnpm trace:ingest <id> --json`
  并收集 `url` 字段。服务器端的速率限制为每位所有者每小时 120 条轨迹。

## 故障排除

- `No local … conversation found for id`——id 或 `--source` 错误。确认文件
  存在（`ls ~/.claude/projects/**/<id>.jsonl`、`ls ~/.codex/sessions`）。
- `Trajectory has no steps`——会话已中止或为空（微型 Codex rollout 中很常见）。
  没有可发布的内容。
- `still trips the public-safety tripwire after redaction`——使用
  `--dry-run --out` 检查，并从上游移除导致问题的内容。不要强制发布。
- `no agent token`——设置 `OPENAGENTS_AGENT_TOKEN`（参见仓库中的 Khala
  运行手册）。
- `Cannot create a string longer than …`——rollout 异常庞大（数百 MB）。
  使用 `--max-steps` 或跳过它。