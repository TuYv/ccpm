---
name: cloud-claw
description: Use this umbrella skill when the request spans multiple Cloud Claw user-facing domains, especially launching a new AltClaw or OpenClaw VM and then managing lifecycle, logs, renewal, or dashboard access through the local altllm cloud-claw-* commands in this repository.
user-invocable: true
---
# Cloud Claw 技能

当任务涉及多个面向用户的 Cloud Claw 工作流时，使用此总技能。

这些技能托管在此仓库中，并通过本地 `altllm cloud-claw-*` 命令提供工作流。产品实现本身仍位于同级仓库中：

- `../cloud-claw`

## 共享设置

> 使用这些技能前，请阅读：
> - `../_shared/cloud-claw-preflight.md`
> - `../_shared/cloud-claw-api-surface.md`

## 技能映射

| 技能 | 用途 | 使用时机 |
|---|---|---|
| `cloud-claw-launch-agent` | 启动新的 OpenClaw、PicoClaw 或 Ottie 部署 | 新建部署、智能体选择、启动前置条件、启动载荷 |
| `cloud-claw-manage-vm` | 查看和操作现有 VM | 列出、检查、启动、停止、续期、自动续期、日志、仪表板 |

## 规则

- 当请求仅涉及一个领域时，优先使用专门技能。
- 当工作流同时涉及部署创建和后续 VM 管理时，使用此总技能。
- 优先使用本地 `altllm cloud-claw-*` 命令，而不是临时编写原始 HTTP 请求。
- 使用 UI 所采用的面向用户的 API 路由。不要将底层 GCP 构建/镜像脚本作为默认工作流。

## 参考

有关 API 覆盖范围和文件归属，请参阅 [references/skill-map.md](references/skill-map.md)。