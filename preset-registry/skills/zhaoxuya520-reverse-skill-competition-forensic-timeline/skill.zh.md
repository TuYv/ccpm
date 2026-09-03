---
name: competition-forensic-timeline
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for DFIR chronology, cross-artifact correlation, persistence chains, and incident timeline reconstruction. Use when the user asks to build a forensic timeline, correlate EVTX, PCAP, registry, disk, memory, mailbox, or browser artifacts, explain the order of attacker actions, or pinpoint the stage where the decisive artifact appears. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛取证时间线

仅在 `$ctf-sandbox-orchestrator` 已激活并已确立沙箱假设、节点所有权和证据优先级之后，才将本技能作为下游专项使用。如果尚未完成这些步骤，请先返回 `$ctf-sandbox-orchestrator`。

当难点不在于找到单一制品，而在于将大量制品整合为一条可重放的时序时，使用本技能。

除非用户明确要求使用英文，否则请以简体中文回复。

## 快速开始

1. 选择最小且可靠的锚点：首次执行、首次登录、首次网络会话、首次文件写入或首次邮箱操作。
2. 在关联之前，先对时间戳、时区、主机名、用户、进程 ID、消息 ID 和文件路径进行规范化。
3. 构建一条从初始立足点到持久化、执行、访问或数据外泄的最小链路。
4. 将已确认的事件顺序与推断出的空白区分开来。
5. 重现能够得出制品结论或权限结论的决定性时间线片段。

## 工作流程

### 1. 确立时间线锚点

- 仅收集当前活动的证据面：EVTX、Sysmon、注册表、Amcache、prefetch、浏览器制品、邮件痕迹、PCAP、内存或文件系统元数据。
- 记录时钟来源、时区，以及任何可能导致事件顺序改变的时间漂移或截断。
- 跨来源关联共享标识符：PID、登录 ID、GUID、消息 ID、主机名、用户名、IP 或哈希。

### 2. 关联执行图

- 将进程树、服务或任务创建、网络会话、文件写入、注册表更改、邮箱规则或令牌使用作为一条路径进行追踪。
- 通过匹配标识符和相邻关系来区分因果边与巧合，而不仅仅依据相近的时间戳。
- 将原始制品与解析摘要并排保留，使每个步骤都可追溯。

### 3. 压缩为决定性叙事

- 将时间线压缩为能够证明初始访问、持久化、横向移动、收集或制品恢复的最小序列。
- 将缺失的验证步骤单独列出，而不是混入已确认的时间线。
- 如果任务主要变成恶意软件配置提取或 Windows 跳板边缘问题，请切换到更聚焦的专项技能。

## 阅读此参考

- 加载 `references/forensic-timeline.md` 以了解锚点选择、跨来源关联和证据封装。
- 如果难点在于数据包重组、协议成帧或从抓包中提取传输对象，请优先使用 `$competition-pcap-protocol`。

## 需要保留的内容

- 源文件路径、事件 ID、登录 ID、消息 ID、PID、哈希值，以及标注了时区的时间戳
- 针对决定性片段的一份紧凑时间线表格或有序列表
- 原始制品、解析输出与推断边保持分开
