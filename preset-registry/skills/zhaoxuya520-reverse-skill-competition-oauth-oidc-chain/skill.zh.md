---
name: competition-oauth-oidc-chain
description: Internal downstream skill for ctf-sandbox-orchestrator. CTF-sandbox workflow for OAuth, OIDC, redirect flows, state or nonce handling, PKCE, token exchange, refresh logic, claim mapping, and accepted login paths. Use when the user asks to trace redirects, callback parameters, scopes, state, nonce, PKCE, refresh tokens, consent, or explain how an OAuth or OIDC chain turns into accepted identity or privilege. Use only after `$ctf-sandbox-orchestrator` has already established sandbox assumptions and routed here.
---
# 竞赛 OAuth OIDC 链

只有在 `$ctf-sandbox-orchestrator` 已经激活并确立了沙盒假设、节点所有权和证据优先级之后，才应将本技能作为下游专门化来使用。如果尚未做到这一点，请先返回 `$ctf-sandbox-orchestrator`。

当难点在于证明 OAuth 或 OIDC 流程如何成形、交换并最终被接受时，使用本技能。

除非用户明确要求使用英文，否则请以简体中文回复。

## 快速开始

1. 按顺序梳理认证链：入口路由、重定向、授权请求、回调、令牌交换、刷新，以及最终接受身份的服务。
2. 在进行任何改动之前，先记录 scopes、state、nonce、PKCE 材料、重定向 URI 以及携带 claims 的令牌。
3. 将令牌持有与实际身份接受区分开。
4. 将浏览器可见的重定向与后端可见的令牌交换保持在一条紧凑的链中。
5. 复现可证明决定性身份边界的最小重定向到接受流程。

## 工作流程

### 1. 梳理重定向与令牌路径

- 记录 issuer、client ID、重定向 URI、授权请求参数、回调参数、token endpoint 以及刷新路径。
- 注意哪些值是用户可控的、派生的、缓存的或经过校验的：`state`、`nonce`、PKCE verifier、audience、scope 或 prompt。
- 将浏览器重定向、服务端交换以及由此产生的会话状态保持关联在一起。

### 2. 证明令牌到身份的接受

- 展示 code、ID token、access token 或 refresh token 如何转化为应用会话、claims 映射、租户选择或被接受的权限。
- 记录令牌 claims、过期时间、audience、subject、scopes，以及确切接受身份的应用或后端边界。
- 区分 UI 登录成功与后端授权成功。

### 3. 精简为决定性的 OAuth 链

- 将结果压缩为最小序列：入口请求 -> 重定向 -> 回调 -> 令牌或 claim 的接受 -> 由此产生的能力。
- 如果某个参数变更会产生影响，则保留一条规范的正常流程和一条最小化的变异流程。
- 如果任务扩展到认证链之外的一般性 Web 路由或存储行为，请切换回范围更广的 Web 运行时技能。

## 阅读此参考

- 加载 `references/oauth-oidc-chain.md` 以获取重定向检查清单、令牌检查清单以及证据打包方式。
- 如果难点在于 JWT 头部解析、claim 规范化、密钥查找，或签发后的令牌校验混淆，请优先使用 `$competition-jwt-claim-confusion`。

## 需要保留的内容

- 重定向 URI、参数、code、令牌 claims、scopes，以及接受身份的服务或回调
- claims 或令牌转变为被接受的应用身份的确切位置
- 一条最小的、可重放的重定向到接受序列
