---
name: competition-queue-worker-drift
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for queues, async workers, cron jobs, delayed tasks, retry behavior, worker-only config drift, and payload-to-side-effect chains. Use when the user asks to trace a queue payload, inspect async job execution, explain worker-only behavior, follow retries or dead-letter handling, or connect an enqueued item to a later file, cache, email, or privilege-bearing side effect. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛队列 Worker 行为漂移

只有在 `$ctf-sandbox-orchestrator` 已经激活并确立了沙盒假设、节点归属和证据优先级之后，才可将本技能作为下游专门技能使用。如果尚未完成这些步骤，请先返回 `$ctf-sandbox-orchestrator`。

当决定性效果发生在入队之后、Worker 内部，或仅在不同于请求路径的异步运行时状态下才会出现时，使用本技能。

除非用户明确要求使用英文，否则请以简体中文回复。

## 快速开始

1. 首先梳理异步链路：入队点、队列负载、Worker 消费者、重试机制，以及最终副作用。
2. 将请求时状态与 Worker 运行时状态分开对待。
3. 将队列名称、消息结构、Worker 配置、重试策略和下游存储记录在同一条链路中。
4. 当行为出现分歧时，对比同步路径与异步路径。
5. 复现从入队到副作用的最小完整流程，以证明决定性的异步漂移。

## 工作流程

### 1. 梳理入队点与 Worker 身份

- 记录队列名称、主题、cron 定时任务、延迟作业、死信队列、Worker 进程和消费者组。
- 留意哪些配置、环境变量、特性开关或凭据仅存在于 Worker 环境中。
- 将入队请求、已存储的负载和 Worker 身份始终保持关联。

### 2. 追踪仅存在于 Worker 的状态与重试

- 展示 Worker 运行时与请求路径的差异：不同的环境、文件、挂载、缓存、权限或时钟。
- 记录重试次数、退避策略、去重键、失败处理、死信流程以及幂等性行为。
- 区分请求的即时成功与 Worker 最终的成功或失败。

### 3. 精简到决定性的异步链路

- 将结果压缩为最小序列：入队 -> Worker 运行时 -> 重试或分支 -> 产生的效果。
- 明确说明决定性差异究竟存在于负载结构、Worker 配置、重试路径，还是下游消费者中。
- 如果问题实际上出在 Worker 调用的文件解析器上，请切换回更聚焦的文件解析器技能。

## 阅读此参考

- 加载 `references/queue-worker-drift.md`，其中包含队列核对清单、重试核对清单和证据整理打包方法。

## 需要保留的内容

- 队列名称、负载、Worker 身份、重试元数据、死信边界以及下游效果
- 导致行为改变的确切的仅限 Worker 的配置或状态
- 一条从入队到副作用的最小复现链路
