---
name: competition-graphql-rpc-drift
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for GraphQL schemas, persisted queries, RPC manifests, generated clients, OpenAPI drift, hidden operations, and contract-to-handler mismatches. Use when the user asks to inspect GraphQL or RPC requests, compare client contracts to live handlers, recover hidden operations, trace generated clients, or explain how schema or contract drift produces the decisive behavior. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛 GraphQL RPC 契约漂移

本技能只能作为下游专门技能使用，前提是 `$ctf-sandbox-orchestrator` 已经激活并确立了沙盒假设、节点归属和证据优先级。如果尚未发生这些，请先返回 `$ctf-sandbox-orchestrator`。

当难点在于将声明的契约与实际运行的处理程序进行匹配，以发现隐藏、过期或特权操作时，使用本技能。

除非用户明确要求使用英文，否则请用简体中文回复。

## 快速开始

1. 首先收集声明的契约面：schema、manifest、生成的客户端、持久化查询映射或 OpenAPI 规范。
2. 在改动任何内容之前，先记录实际的请求形态、操作名称、变量、方法、路径和认证上下文。
3. 并排比较声明的契约、生成客户端的行为以及实际处理程序的行为。
4. 保留一个被接受的操作和一个漂移或隐藏的操作，且二者差异最小。
5. 重现能够证明关键分支的最小契约与处理程序不匹配。

## 工作流程

### 1. 梳理声明的契约面

- 记录定义预期契约面的 GraphQL schema、内省输出、持久化查询 id、RPC manifest、生成的客户端或 OpenAPI 文档。
- 注意带版本的端点、仅客户端存在的防护、隐藏的枚举、可选字段以及操作命名惯例。
- 保持文档来源和生成路径与观测到的请求相互关联。

### 2. 验证实际处理程序行为

- 捕获真实的请求与响应对，包括操作名称、变量、headers、cookies 和状态码。
- 比较客户端校验、schema 预期与实际处理程序的规范化或回退行为。
- 记录仍然会执行的隐藏操作、过期字段、未公开文档的方法或仅存在于处理程序中的分支。

### 3. 归约到关键的漂移路径

- 将结果压缩为最小序列：声明的契约 -> 实际请求 -> 处理程序分支 -> 由此产生的能力。
- 清楚地说明关键漂移究竟存在于生成客户端的假设、持久化查询映射、schema 版本偏移、RPC manifest 不匹配，还是处理程序侧的隐藏逻辑之中。
- 如果在验收之后任务转向通用的 JWT、OAuth 或队列行为，则移交至范围更窄的专门技能。

## 阅读此参考

- 加载 `references/graphql-rpc-drift.md` 以获取契约检查清单、实际处理程序检查清单以及证据打包方法。

## 需要保留的内容

- Schema、manifest、生成的客户端、持久化查询 id、操作名称和版本标记
- 一对被接受的请求和一对漂移的请求，用于证明该不匹配
- 一条能够触及关键效果的最小契约到处理程序序列
