---
name: competition-kerberos-delegation
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for Kerberos delegation, SPN trust edges, S4U abuse, RBCD, constrained or unconstrained delegation, and service-ticket acceptance. Use when the user asks about constrained delegation, unconstrained delegation, RBCD, S4U, SPNs, ticket acceptance, or how a Kerberos trust edge turns into effective privilege under sandbox assumptions. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛中的 Kerberos 委派

仅在 `$ctf-sandbox-orchestrator` 已激活并已确立沙箱假设、节点所有权和证据优先级之后，才将本技能作为下游专项技能使用。如果尚未完成这些步骤，请先返回 `$ctf-sandbox-orchestrator`。

当难点不在于“这里是否存在 Kerberos”，而在于存在哪条委派边、正在铸造哪种票据、以及哪个服务真正接受它时，使用本技能。

除非用户明确要求使用英文，否则请以简体中文回复。

## 快速开始

1. 先写出信任链：主体 -> 委派边 -> 票据类型 -> 目标 SPN -> 接受票据的服务 -> 最终获得的权限。
2. 将“持有票据”与“被接受的权限”区分开来。
3. 将 SPN、委派模式、PAC/组数据、加密类型以及服务接受情况保存在一个紧凑的证据块中。
4. 先复现一条最小化的委派链，再扩展到各种变体。
5. 将每一条权限声明都关联到具体的被接受票据或服务端效果。

## 工作流程

### 1. 识别委派边

- 判断该路径属于约束委派、非约束委派、基于资源的约束委派、协议过渡，还是其他信任边。
- 仅在 SPN、ACL、服务账户、SIDHistory、证书模板和复制权限会影响当前活跃路径时，才对它们进行检查。

### 2. 追踪票据的铸造与接受

- 记录 TGT/TGS 类型、相关的 S4U 步骤、委派标志、PAC 或组数据、加密类型、缓存位置以及目标 SPN。
- 证明到底是哪个服务实际接受了票据，以及接受之后出现了什么能力。

### 3. 报告有效的委派边

- 将整条链压缩为一条可重放的路径，而不是一句含糊的“域已沦陷”式表述。
- 将候选委派边与真正落地权限的那条边区分开来。

## 阅读此参考文档

- 加载 `references/kerberos-delegation.md`，以获取委派检查清单、需要保留的票据字段以及常见的证明错误。

## 需要保留的内容

- SPN、票据类型、委派模式、PAC/组数据、加密类型、缓存位置、接受票据的服务
- 能证明有效权限的服务端日志、事件 ID、登录会话变更或组变更
- 使票据可重放的那条确切信任边
