---
name: competition-custom-protocol-replay
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for custom binary or text protocol recovery, handshake reconstruction, framing, sequence control, checksums, stateful replay, and accepted-session reproduction. Use when the user asks to decode an unknown protocol, recover custom framing, build a replay harness, satisfy sequence or checksum rules, replay a captured session, or prove the smallest message order that reaches an accepted branch. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛自定义协议重放

本技能只应在 `$ctf-sandbox-orchestrator` 已激活并已确定沙盒假设、节点归属和证据优先级之后，作为下游专门化技能使用。如果尚未完成这些步骤，请先返回 `$ctf-sandbox-orchestrator`。

当难点不只是给协议命名，而是要复现被接受所需的精确消息顺序与状态时，使用本技能。

除非用户明确要求使用英文，否则请用简体中文回复。

## 快速开始

1. 在解码字段语义之前，先确定客户端与服务器角色、会话边界以及重置条件。
2. 在进行大范围重放尝试之前，先恢复分帧、长度、分隔符、序列号、校验和、nonce 和状态转换。
3. 保留一份成功交互的规范转录。
4. 重放时每次只改动一个字段或一条消息。
5. 复现能够证明决定性分支的最小被接受会话。

## 工作流程

### 1. 映射会话状态机

- 识别握手、协商、认证、保活、命令和拆除各个阶段。
- 记录哪些字段是静态的，哪些是派生的，哪些依赖于先前消息。
- 使消息顺序、方向和时序始终绑定到同一个会话身份。

### 2. 恢复分帧与完整性

- 重建长度字段、分隔符、类型字节、校验和、MAC、计数器、压缩或加密边界。
- 区分传输层分帧与应用层分帧。
- 记录改动单个字段或单个步骤后，服务器接受行为发生变化的准确位置。

### 3. 构建最小重放测试工具

- 将路径缩减到能到达被接受状态、解析器分支、命令效果或产物的最小转录。
- 同时保留原始抓包序列与重放的最小序列。
- 如果问题主要是通用的 PCAP 或流解码，没有有状态重放需求，请切换回更泛化的 PCAP 技能。

## 阅读此参考

- 加载 `references/custom-protocol-replay.md`，其中包含状态机检查清单、转录检查清单和证据打包说明。

## 需要保留的内容

- 规范转录、消息类型、字段边界、校验和、计数器和会话标识符
- 原始抓包切片以及能产生接受结果的重放测试工具输入
- 使协议从被拒绝翻转为被接受（或相反）的确切改动
