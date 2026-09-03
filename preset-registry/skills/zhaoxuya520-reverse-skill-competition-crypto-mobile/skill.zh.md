---
name: competition-crypto-mobile
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for crypto, encoding, steganography, APK, IPA, and mobile trust-boundary challenges. Use when the user asks to decode a blob, recover a transform chain or key, inspect hidden media payloads, hook an APK or IPA signer, inspect app storage, or replay mobile request-signing logic. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛密码学与移动端

只有在 `$ctf-sandbox-orchestrator` 已经处于激活状态并确立了沙箱假设、节点所有权和证据优先级之后，才将本技能作为下游专门化来使用。如果尚未发生上述情况，请先返回 `$ctf-sandbox-orchestrator`。

如果当前挑战依赖于恢复变换链、隐藏的媒体载荷、移动端签名路径或本地信任边界，请使用本技能。

除非用户明确要求使用英文，否则请以简体中文回复。

## 快速开始

1. 判断主导路径是密码学、隐写还是移动端。
2. 按顺序恢复各层变换；不要直接跳到最花哨的算法。
3. 记录会影响结果的确切参数和边界。
4. 对能够证明该行为的最窄移动端边界进行 hook。
5. 复现明文、载荷、已签名请求或被接受的分支。

## 工作流程

### 1. 密码学与编码

- 逐步重建整条链：容器、压缩、编码、xor 或替换、加密、完整性校验、最终解析。
- 保留确切的密钥、IV、nonce、salt、tag、偏移量和字节序。

###
