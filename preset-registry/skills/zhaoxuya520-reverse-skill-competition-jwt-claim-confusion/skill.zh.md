---
name: competition-jwt-claim-confusion
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for JWT, JWS, and JWE validation paths, header parsing, key selection, claim acceptance, audience and issuer checks, role derivation, and token-to-identity confusion bugs. Use when the user asks to inspect JWT headers or claims, key lookup, `kid` handling, `alg` confusion, audience or issuer validation, role claims, or explain how a token becomes accepted identity or privilege. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛 JWT 声明混淆

仅当 `$ctf-sandbox-orchestrator` 已激活并已确立沙箱假设、节点归属与证据优先级之后，才可将本技能作为下游专项技能使用。若尚未完成，请先返回 `$ctf-sandbox-orchestrator`。

当决定性漏洞并不仅仅是“存在一个 JWT”，而是头部、声明与密钥选择如何转化为被接受的身份时，使用本技能。

除非用户明确要求使用英文，否则以简体中文回复。

## 快速开始

1. 将令牌路径拆分为解析、密钥查找、签名或解密、声明校验以及最终接受。
2. 在改动任何内容之前，先记录头部字段、声明、密钥来源、issuer、audience 以及角色映射。
3. 将令牌的持有与实际接受该令牌的确切服务区分开来。
4. 将解析器行为、信任策略以及由此产生的应用会话或权限保持在同一条链路中。
5. 重现能够证明决定性混淆的最小令牌到接受的流程。

## 工作流程

### 1. 映射头部与密钥选择

- 记录诸如 `alg`、`kid`、`typ`、`cty`、`jku` 之类的头部字段，以及存在时的内嵌密钥材料。
- 注意密钥的来源：静态配置、JWKS、本地文件、缓存或动态查找。
- 将令牌解析器、密钥选择路径与校验模式保持绑定。

### 2. 证明声明到权限的接受

- 展示 subject、audience、issuer、tenant、scope、role 或自定义声明如何转化为应用会话、路由访问或后端权限。
- 记录 expiration、not-before、时钟偏移、issuer 匹配、audience 匹配以及声明规范化行为。
- 将令牌解析成功与实际授权成功区分开来。

### 3. 归约为决定性的 JWT 路径

- 将结果压缩为最小序列：提供令牌 -> 所走的解析器或密钥路径 -> 声明被接受 -> 产生的能力。
- 若混淆或绕过取决于两者差异，则保留一条规范的被接受令牌路径和一条被篡改的令牌路径。
- 如果任务扩展为更大的 OAuth 重定向链，则交回给更聚焦的 OAuth 技能。

## 阅读此参考文档

- 加载 `references/jwt-claim-confusion.md` 以获取头部清单、声明清单以及证据打包内容。

## 需要保留的内容

- 原始头部、声明、密钥来源、JWKS 或本地密钥路径，以及接受该令牌的服务
- 将令牌转化为被接受身份的确切校验或规范化步骤
- 一条最小化的、可重放的令牌到接受的序列
