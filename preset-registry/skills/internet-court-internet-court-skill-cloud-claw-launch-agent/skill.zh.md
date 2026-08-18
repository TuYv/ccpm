---
name: cloud-claw-launch-agent
description: Use this skill when the user wants to launch a new AltClaw, OpenClaw, PicoClaw, or Ottie deployment through Cloud Claw. Covers the same user-facing fields and constraints exposed in the Cloud Claw UI, using the local altllm cloud-claw-* commands. Do NOT use for post-launch lifecycle tasks like start/stop/delete/logs; use cloud-claw-manage-vm.
user-invocable: true
---
# 启动 Cloud Claw Agent

将此技能用于 Cloud Claw UI 中提供的**新部署**工作流，通过此仓库中的本地 CLI 命令执行。

实现的事实来源是同级仓库：

- `../cloud-claw`

## 共享设置

> 使用此技能前，请阅读：
> - `../_shared/cloud-claw-preflight.md`
> - `../_shared/cloud-claw-api-surface.md`

## 支持的 Agent 类型

| Agent 类型 | 内部值 | 面向用户的说明 |
|---|---|---|
| OpenClaw | `openclaw` | 付费层路径，支持 Telegram + Web 控制面板 |
| PicoClaw | `picoclaw` | 仅支持 Telegram |
| Ottie | `aintern` | 仅支持 Telegram，采用自我进化的分支路径 |

## 启动规则

- 使用 `altllm cloud-claw-deploy`。
- 部署 `name` 必须匹配 `^[a-z0-9-]+$`，且最大长度为 63。
- `agentType` 必须是以下值之一：
  - `openclaw`
  - `picoclaw`
  - `aintern`
- `picoclaw` 和 `aintern` 要求提供 `TELEGRAM_BOT_TOKEN`。
- `openclaw` 使用 `OPENCLAW_MODEL`。
- UI 支持的 OpenClaw 模型选项为：
  - `altllm/altllm-standard`
  - `altllm/altllm-mega`
- 后端可能会自动为已登录用户注入 AltLLM API 密钥。
- 启动成功取决于配额、可用空闲槽位、有效额度和支付状态。

## 参考

有关 payload 示例和预期响应，请参阅[references/cli-reference.md](references/cli-reference.md)。