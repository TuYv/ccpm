---
name: competition-windows-pivot
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for Kerberos, WinRM, SMB, RDP, Windows credential material, replayable tickets, delegation edges, and host-to-host pivot chains. Use when the user asks to replay Kerberos material, trace a WinRM, SMB, or RDP pivot, understand host-to-host privilege movement, or prove which Windows service accepted a credential or ticket. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛 Windows 横向移动

只有在 `$ctf-sandbox-orchestrator` 已处于激活状态并已确立沙箱假设、节点归属和证据优先级之后，才将本技能作为下游专门化技能使用。如果尚未发生这些情况，请先返回 `$ctf-sandbox-orchestrator`。

当挑战路径以主机到主机移动、可重放的票据材料或 Windows 权限边界为主时，使用本技能。

除非用户明确要求使用英文，否则以简体中文回复。

## 快速开始

1. 把横向移动压缩为一条具体链：立足点 -> 恢复出的工件 -> 重放路径 -> 跳板主机 -> 由此产生的能力。
2. 将已存储的凭据材料与可用的权限区分开。
3. 将主机证据、票据证据和权限影响保持在同一条时间线上。
4. 为每一件被重放的工件记录确切的接受服务或接受主机。
5. 复现仍能证明该权限边界的最小跳板。

## 工作流程

### 1. 恢复重放材料

- 检查活动路径中的 SAM、SECURITY、SYSTEM、NTDS、DPAPI、LSA 机密、浏览器存储、PowerShell 历史、ETW、Sysmon 和事件日志。
- 按实际可用的位置区分密码、哈希、票据、cookie、保管库 blob 或 gMSA 材料。

### 2. 追踪跳板链

- 梳理实际使用的协议：WinRM、SMB、RDP、WMI、管理共享、远程注册表或服务控制。
- 当 Kerberos 相关时，记录 SPN、委派、PAC 或组数据、加密类型以及接受服务。
- 当 AD 边界相关时，检查 ACL、GPO 链接、SIDHistory、委派、证书模板和复制权限。

### 3. 报告该边界

- 保持跳板路径具体且可重放。
- 说明哪个工件跨越了哪条边界，以及目标主机上出现了什么能力。

## 阅读此参考资料

- 加载 `references/windows-pivot.md` 以获取跳板清单、Kerberos 证据块和常见重放错误。
- 如果任务具体涉及 DPAPI 主密钥、浏览器或保管库存储、受保护的 blob，或证明恢复出的 DPAPI 机密在哪里被接受，优先使用 `$competition-dpapi-credential-chain`。
- 如果任务具体涉及 LSASS 内存、票据缓存、可重放的会话材料或驻留在主机上的凭据提取，优先使用 `$competition-lsass-ticket-material`。
- 如果任务具体涉及委派边界、SPN 信任、S4U 流程，或哪个服务接受被委派的票据，优先使用 `$competition-kerberos-delegation`。
- 如果难点在于强制认证、胁迫原语、中继目标，或接受中继认证的服务，优先使用 `$competition-relay-coercion-chain`。

## 需要保留的内容

- 主机名、登录 ID、SID、SPN、票据字段、服务名称和事件 ID
- 确切的重放点以及由此产生的登录会话、令牌或组变更
- 原始主机工件和推导出的时间线分开保存
