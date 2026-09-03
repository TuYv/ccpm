---
name: competition-dpapi-credential-chain
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for DPAPI masterkeys, vault blobs, browser credential stores, protected secrets, domain backup keys, and secret-to-acceptance replay chains. Use when the user asks to inspect DPAPI blobs or masterkeys, recover browser or vault credentials, trace DPAPI context or backup-key use, or explain how protected Windows secrets become accepted access or privilege. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛 Dpapi 凭据链

仅在 `$ctf-sandbox-orchestrator` 已处于活动状态并已确立沙箱假设、节点所有权和证据优先级之后，才将本技能作为下游专门化技能使用。如果尚未完成这些步骤，请先返回 `$ctf-sandbox-orchestrator`。

当决定性的 Windows 机密受 DPAPI 保护，且难点在于证明由哪个上下文解包它以及明文在何处被接受时，使用本技能。

除非用户明确要求使用英文，否则请以简体中文回复。

## 快速开始

1. 将受保护的 blob、masterkey、解密上下文与最终接受服务区分开来。
2. 在得出宽泛结论之前，先记录 SID、用户或机器上下文、masterkey 路径、vault 或浏览器存储，以及目标重放点。
3. 将 DPAPI 源工件、解包步骤、明文机密和接受边保持在同一条链中。
4. 区分本地用户 DPAPI、机器 DPAPI、域备份密钥的使用，以及特定于应用的包装。
5. 重现能够证明决定性边的、从 DPAPI 到被接受访问的最小路径。

## 工作流程

### 1. 映射受保护机密与 DPAPI 上下文

- 记录 blob 来源、masterkey 位置、SID、保护器范围、配置文件路径、凭据存储，以及任何应用包装器（例如浏览器加密或 vault 元数据）。
- 注意决定性值是位于 Credential Manager、Vault、浏览器 Cookie、浏览器密码、Wi-Fi 配置文件、RDP 文件，还是自定义应用存储中。
- 将受保护工件、masterkey 候选以及账户或机器上下文关联在一起。

### 2. 证明解包与接受

- 展示机密是如何被解密的：用户登录材料、机器上下文、域备份密钥，或其他已恢复的保护器。
- 记录明文类型、目标主机或服务、重放方法，以及由此产生的会话、令牌或数据访问。
- 将成功的 blob 解密与实际被接受的访问区分开来。

### 3. 精简为决定性的 DPAPI 链

- 将结果压缩为最小序列：受保护工件 -> masterkey 或解包上下文 -> 明文机密 -> 被接受的重放或访问 -> 由此产生的能力。
- 明确说明决定性边究竟位于 masterkey 恢复、DPAPI 范围混淆、应用包装器处理，还是在接受已恢复机密的服务。
- 如果任务扩展为通用的 LSASS 票据材料或完整的 Windows 跳板操作，则交回给范围更窄的主机技能或跳板技能。

## 阅读此参考资料

- 加载 `references/dpapi-credential-chain.md`，以获取 blob 检查清单、masterkey 检查清单和证据打包内容。

## 需要保留的内容

- blob 路径、masterkey 路径、SID、保护器范围、存储名称以及应用包装器细节
- 由恢复的明文解锁的确切接受服务或数据集
- 一条从受保护工件到被接受访问、能够证明该边的最小序列
