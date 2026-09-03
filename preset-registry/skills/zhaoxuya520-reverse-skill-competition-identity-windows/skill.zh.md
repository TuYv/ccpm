---
name: competition-identity-windows
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for Active Directory, Kerberos, LDAP, OAuth, enterprise messaging, Windows host forensics, credential material, and lateral-movement challenges. Use when the user asks to trace tickets or tokens, inspect mailbox rules, analyze Windows host evidence, understand an AD trust path, or explain a lateral-movement chain across sandbox-linked nodes. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛身份与 Windows

只有在 `$ctf-sandbox-orchestrator` 已经激活并确立了沙箱假设、节点所有权和证据优先级之后，才能将本技能作为下游专门化技能使用。如果尚未做到这一点，请先返回 `$ctf-sandbox-orchestrator`。

当挑战围绕身份流转、可重放的凭据、Windows 主机痕迹、企业邮件或横向移动展开时，使用本技能。

除非用户明确要求使用英文，否则请以简体中文回复。

## 快速开始

1. 在深入每一条主机痕迹之前，先梳理身份链或跳板链。
2. 将凭据的持有与被接受的特权区分开来。
3. 将身份证据、主机证据和邮件证据关联到同一条时间线上。
4. 将票据、SID、事件 ID、邮箱规则和跳板主机保存在紧凑的证据块中。
5. 用最小可行链路复现权限边或邮件效果。

## 工作流程

### 1. 身份与 AD

- 追踪主体来源、同步路径、令牌或票据的签发、声明转换、组解析以及接受方服务。
- 在涉及 Kerberos 时，记录票据类型、SPN、委派模式、PAC 或组数据、加密类型以及缓存位置。

### 2. Windows 主机与跳板移动

- 将 SAM、SECURITY、SYSTEM、NTDS、DPAPI、LSA secrets、ETW、Sysmon、PowerShell、服务、计划任务、WMI、WinRM、SMB 和 RDP 关联为一张统一的跳板图。
- 将移动过程表述为一条具体链路：立足点 -> 恢复出的痕迹 -> 重放路径 -> 跳板主机 -> 由此获得的能力。

### 3. 企业消息传递

- 将钓鱼诱饵、同意日志、邮箱规则和身份提供者事件保持绑定在一起，使邮件路径与权限路径始终保持连通。

## 阅读此参考

- 加载 `references/identity-windows.md`，以获取票据、主机和企业消息传递方面的检查清单。
- 如果任务主要是主机到主机的跳板、Kerberos 重放或 Windows 权限链，优先使用 `$competition-windows-pivot`。
- 如果任务专门涉及约束委派、非约束委派、RBCD、S4U 或票据接受证明，优先使用 `$competition-kerberos-delegation`。
- 如果任务专门涉及 AD CS、证书模板、EKU、注册权限、PKINIT 或基于证书的权限，优先使用 `$competition-ad-certificate-abuse`。
- 如果任务专门涉及 OAuth 或 OIDC 声明、回调流程、作用域、同意或被接受的登录身份，优先使用 `$competition-oauth-oidc-chain`。
- 如果任务专门涉及 DPAPI 主密钥、保管库 blob、浏览器或保管库机密、备份密钥的使用，或从受保护机密到访问权限的链路，优先使用 `$competition-dpapi-credential-chain`。
- 如果任务专门涉及 LSASS 内存、票据缓存、与 LUID 关联的材料、DPAPI 上下文或可重放的主机凭据痕迹，优先使用 `$competition-lsass-ticket-material`。
- 如果任务专门涉及邮箱规则、转发、OAuth 同意、委托访问或传输层邮件滥用，优先使用 `$competition-mailbox-abuse`。
- 如果任务专门涉及强制身份验证、中继目标，或证明哪个服务接受中继的身份验证，优先使用 `$competition-relay-coercion-chain`。

## 需要保留的内容

- SID、SPN、票据字段、事件 ID、邮箱规则和重放点
- 精确的主机到主机跳板顺序，以及接受凭据或票据的服务
- 原始痕迹、解析后的摘要和推导出的时间线，作为相互独立的输出
