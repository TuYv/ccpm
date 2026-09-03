---
name: competition-lsass-ticket-material
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for LSASS-resident secrets, Windows logon sessions, Kerberos ticket caches, DPAPI-backed material, SSP artifacts, and replayable credential extraction. Use when the user asks to inspect LSASS memory, recover tickets or logon sessions, trace DPAPI or SSP material, distinguish which credential artifacts are replayable, or connect host-resident credential material to an accepted pivot or privilege edge. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛 LSASS 票据材料

本技能仅作为下游专业化技能使用，前提是 `$ctf-sandbox-orchestrator` 已激活并已确立沙箱假设、节点归属和证据优先级。如果尚未发生这些情况，请先返回 `$ctf-sandbox-orchestrator`。

当决定性的主机工件位于 LSASS、票据缓存或相邻凭据材料中，且难点在于证明哪些内容可重放时，使用本技能。

除非用户明确要求使用英文，否则以简体中文回复。

## 快速开始

1. 将原始凭据材料与实际可用的重放边缘区分开。
2. 在做出宽泛结论之前，先记录登录会话、LUID、票据缓存、安全包、账户和目标服务。
3. 将主机工件、提取出的秘密、重放尝试以及最终的接受结果保持在同一条链中。
4. 根据各项凭据实际可使用的位置，区分密码、哈希、票据、DPAPI 秘密、SSP 残留和令牌。
5. 复现能够证明决定性边缘的最短的从主机工件到被接受权限的路径。

## 工作流程

### 1. 映射 LSASS 与相邻凭据状态

- 记录登录会话、LUID、票据缓存、安全包名称、SSP、DPAPI 上下文，以及与当前路径相关的任何服务账户材料。
- 注明决定性值是 TGT、服务票据、委派票据、DPAPI 秘密、明文、哈希，还是特定安全包的秘密。
- 将主机来源、账户上下文和缓存位置保持关联。

### 2. 证明重放或接受

- 展示提取的材料在何处被接受：SMB、WinRM、服务票据使用、DPAPI 解包、Schannel，或其他主机或服务边缘。
- 记录 SPN、目标主机、登录会话、票据标志、加密类型，以及由此产生的权限或令牌变化。
- 区分确实存在的材料与在该路径中实际可重放的材料。

### 3. 归约为决定性凭据链

- 将结果压缩为最短序列：主机工件 -> 提取的材料 -> 被接受的重放或解包 -> 由此产生的能力。
- 明确说明决定性边缘位于 LSASS 内存、票据缓存复用、DPAPI 上下文，还是接受方服务的行为之中。
- 如果任务扩展为完整的主机到主机横向移动，请交回给聚焦范围更窄的 Windows 横向移动技能。

## 阅读此参考

- 加载 `references/lsass-ticket-material.md` 以获取会话检查清单、重放检查清单以及证据打包说明。
- 如果任务具体涉及 DPAPI 主密钥、受保护的 blob、浏览器或凭据保管库存储，或证明哪个恢复出的 DPAPI 秘密被接受，请优先使用 `$competition-dpapi-credential-chain`。

## 需要保留的内容

- LUID、会话 ID、票据类型、SPN、加密类型、安全包名称，以及缓存或内存来源
- 确切的接受方主机或服务，以及由此产生的权限或登录效果
- 一条能够证明该边缘的最短的从主机工件到重放的序列
