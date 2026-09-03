---
name: competition-pcap-protocol
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for packet capture analysis, session reconstruction, application-protocol decoding, stream reassembly, beacon timing, and packet-to-process correlation. Use when the user asks to analyze a PCAP, rebuild TCP or UDP sessions, decode HTTP, WebSocket, DNS, custom C2, or binary protocols, extract transferred artifacts, or tie packet sequences to host or malware behavior. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛 PCAP 协议

本技能仅应在 `$ctf-sandbox-orchestrator` 已经激活并确立了沙箱假设、节点所有权和证据优先级之后，作为下游专门化技能使用。如果尚未做到这一点，请先返回 `$ctf-sandbox-orchestrator`。

当决定性证据存在于数据包顺序、协议分帧或流重建之中，而非单个 IOC 或主机日志时，使用本技能。

除非用户明确要求使用英文，否则请以简体中文回复。

## 快速开始

1. 首先确立抓包边界：主机、时间跨度、接口、丢失的数据包、重传和流数量。
2. 在解码载荷语义之前，先按会话对流量分组。
3. 将协议分帧、序列、时序和传输的工件一并记录，而不是作为孤立的数据包分别记录。
4. 只有在会话重建完成之后，才将数据包证据与主机、恶意软件或应用行为进行关联。
5. 复现能够证明挑战路径的最小解码流或传输工件。

## 工作流程

### 1. 构建会话映射

- 识别端点、协议、端口、TLS 握手、DNS 查询、websocket 升级和长生命周期流。
- 在下结论之前，先记录缺失的抓包覆盖、非对称路由、丢包或重组问题。
- 将控制通道、批量传输、保活流量和噪声区分开来。

### 2. 解码协议边界

- 在解读字段之前，先重组 TCP 流或 UDP 会话。
- 恢复分帧、消息顺序、自定义头部、二进制字段、压缩、加密边界和对象传输。
- 使载荷方向、时序和会话状态与每条解码后的消息保持对应。

### 3. 将数据包与行为关联起来

- 展示哪段数据包序列对应哪个主机事件、恶意软件分支、登录流程、上传、数据外传步骤或命令通道。
- 区分协议识别与工件恢复：如果缺少解码内容或可证实的下游影响，仅仅说出 HTTP、DNS 或自定义 C2 的名字是不够的。
- 如果解码后任务主要变为主机时间线问题，请切换到更严格的取证时间线技能。

## 阅读此参考资料

- 加载 `references/pcap-protocol.md` 以获取会话检查清单、解码检查清单和证据打包内容。
- 如果难点在于 WebSocket 或 SSE 握手、订阅流程、实时帧或帧驱动的状态，请优先使用 `$competition-websocket-runtime`。
- 如果难点在于自定义握手、分帧、校验和、序列依赖或确定性重放测试装置，请优先使用 `$competition-custom-protocol-replay`。

## 需要保留的内容

- 流 ID、端点对、数据包范围、时间戳、协议分帧和对象边界
- 解码后的请求、响应、命令、传输的文件，以及承载它们的会话
- 能够证明挑战行为的精确数据包序列或重建后的流
