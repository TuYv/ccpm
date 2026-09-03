---
name: competition-race-condition-state-drift
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for race windows, ordering bugs, idempotency failures, lock gaps, concurrent worker drift, and state inconsistencies that produce decisive effects. Use when the user asks to reproduce timing-sensitive bugs, concurrent state corruption, duplicate actions, stale reads, or privilege or balance drift caused by request ordering. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛竞态条件状态漂移

本技能只能作为下游专门化技能，在 `$ctf-sandbox-orchestrator` 已经激活并确立了沙盒假设、节点归属和证据优先级之后使用。如果尚未发生这些情况，请先返回 `$ctf-sandbox-orchestrator`。

当决定性行为取决于请求时序、异步顺序、锁间隙或陈旧状态时，使用本技能。

除非用户明确要求使用英文，否则请以简体中文回复。

## 快速开始

1. 首先识别可变状态：数据行、缓存键、队列载荷、会话字段、计数器或文件。
2. 使用最小的并发序列和固定的时序假设进行复现。
3. 在仅改变一个变量的情况下，捕获一次基线运行和一次竞态运行。
4. 分别追踪读取、检查、写入、入队和提交的边界。
5. 从干净重置出发，证明最终状态漂移。

## 工作流程

### 1. 映射可变边界

- 记录事务范围、锁行为、重试逻辑、幂等键、缓存失效和队列交接。
- 注意读取-检查-写入在何处被拆分到不同请求、工作进程或服务之间。
- 让每个边界都关联到精确的时间戳或序列号。

### 2. 复现时序窗口

- 通过受控延迟、重复请求或重排的工作进程执行，构建确定性的并发输入。
- 在相同载荷下比较被接受和被拒绝的路径。
- 记录当顺序改变时，哪个条件会发生翻转。

### 3. 归约至决定性竞态链

- 压缩为：请求 A 与 B 的顺序 -> 陈旧检查或锁间隙 -> 冲突写入 -> 最终产生的能力或工件。
- 说明根本原因是缺少锁、弱幂等性、陈旧缓存读取、异步提交延迟，还是重试副作用。
- 如果该路径变为以队列为主，则移交给队列工作进程漂移技能。

## 阅读此参考资料

- 加载 `references/race-condition-state-drift.md`，以获取竞态测试装置思路、证据块和一致性检查方法。

## 需保留的内容

- 可变键、事务边界、锁行为和幂等标记
- 基线运行和竞态运行的带时间戳或带序列号的追踪记录
- 一条证明漂移的最小可重放并发序列
