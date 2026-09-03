---
name: competition-relay-coercion-chain
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for forced-auth coercion, relay chains, target selection, NTLM or related acceptance paths, and coercion-to-privilege transitions. Use when the user asks to trace a coercion primitive, follow a relay path, analyze forced authentication, determine which service accepts relayed auth, or connect a coercion step to resulting privilege, enrollment, or code execution. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛强制认证中继链

本技能仅作为下游专门化技能使用，前提是 `$ctf-sandbox-orchestrator` 已经激活并确立了沙箱假设、节点所有权和证据优先级。如果尚未做到这一点，请先返回 `$ctf-sandbox-orchestrator`。

当难点在于证明从强制认证到真正接受中继身份的服务的完整链条时，使用本技能。

除非用户明确要求使用英文，否则请以简体中文回复。

## 快速开始

1. 将链条拆分为强制认证源、被捕获的认证、中继目标、接受点和最终效果。
2. 记录每一跳的传输方式、协议和服务身份。
3. 将强制认证的产生、中继成功与下游权限区分开。
4. 将强制触发、中继记录和接受服务保持在同一条证据链中。
5. 复现能够证明决定性优势的最小强制认证到接受路径。

## 工作流程

### 1. 映射强制认证源

- 识别强制触发认证的服务、RPC、文件路径、打印机路径、WebDAV 边缘或协议触发点。
- 记录源主机、被强制的主体、传输方式以及任何环境前提条件。
- 用一条简洁的记录准确说明究竟是什么导致认证离开源。

### 2. 追踪中继目标

- 记录认证落在何处、如何被转发，以及哪个协议或服务在消费它。
- 区分仅捕获、仅重放与真正的中继接受。
- 将服务名称、目标主机、协议、中继记录和接受响应关联在一起。

### 3. 归约为决定性中继链

- 将结果压缩为最小的序列：强制触发 -> 中继的认证 -> 被接受的服务 -> 产生的权限或产物。
- 清楚说明决定性弱点位于强制认证源、中继目标、签名设置还是被接受的下游服务。
- 如果该路径最终变成证书注册问题或纯粹的 Kerberos 委派边缘问题，则移交给更聚焦的专门技能。

## 阅读此参考资料

- 加载 `references/relay-coercion-chain.md` 以获取强制认证清单、中继清单和证据打包内容。

## 需要保留的内容

- 强制触发细节、源主机、被强制的身份、目标主机、接受的服务以及最终效果
- 中继记录、错误或接受响应，以及每一跳使用的确切协议
- 最小的可重放的强制认证到接受序列
