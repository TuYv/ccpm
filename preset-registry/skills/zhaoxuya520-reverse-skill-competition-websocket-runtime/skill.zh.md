---
name: competition-websocket-runtime
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for WebSocket and SSE handshakes, auth material, subscription state, realtime message schemas, reconnect behavior, and frame-driven runtime effects. Use when the user asks to inspect a WebSocket or SSE handshake, decode frames, trace subscriptions, follow reconnect logic, inspect auth material sent during realtime setup, or explain how live frames change rendered or persisted state. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛 WebSocket 运行时

只有在 `$ctf-sandbox-orchestrator` 已经激活并确立了沙盒假设、节点归属和证据优先级之后，才将此技能作为下游专门化来使用。如果尚未发生这些情况，请先返回 `$ctf-sandbox-orchestrator`。

当决定性行为由实时握手和帧流承载，而不仅仅是单次 HTTP 时，使用此技能。

除非用户明确要求使用英文，否则请以简体中文回复。

## 快速开始

1. 首先梳理握手：origin、path、headers、cookies、query、auth token 以及升级响应。
2. 将连接建立、订阅消息、保活、服务器推送和重连逻辑区分开来。
3. 将消息 schema、topic 或 channel 标识以及状态副作用记录在同一条链中。
4. 将帧与已渲染、已存储或后端可见的效果关联起来。
5. 复现能到达决定性状态变更的最小握手加帧序列。

## 工作流程

### 1. 梳理实时握手

- 记录初始的 HTTP 或 SSE 请求、升级头部、cookies、令牌、查询参数、origin 检查以及协商出的协议。
- 注意认证材料是由头部、cookies、查询字符串还是初始应用帧携带的。
- 将路由、订阅端点和会话标识保持绑定在一起。

### 2. 解码消息流

- 区分订阅、退订、ack、心跳、服务器推送、重连和终止帧。
- 还原会影响行为的消息类型、channel ID、schema 字段和时序。
- 将传输层的保活与应用层的业务消息区分开。

### 3. 归约至决定性实时路径

- 将结果压缩为最小序列：握手 -> 认证帧或订阅帧 -> 被推送或被接受的帧 -> 产生的状态变更。
- 将规范帧顺序与任何重放的最小顺序并排保留。
- 如果难点在于与运行时 UI 或应用状态无关的通用协议重组，请切换回更专门的协议技能。

## 阅读此参考

- 加载 `references/websocket-runtime.md` 以获取握手清单、帧清单和证据打包内容。

## 需要保留的内容

- 握手头部、cookies、查询参数、认证材料、协商出的子协议以及 channel ID
- 帧 schema、订阅消息、服务器推送、重连流程以及产生的状态变更
- 能够证明决定性分支的最小可重放实时序列
