---
name: timewarp-identity
description: Register an ECDSA P-256 agent public key and issue short-lived scoped opaque bearer tokens on a TimeWarp.Architecture host. Use when onboarding a machine agent without a browser or human sponsor.
---
# TimeWarp.Identity — agent 接入指南

本主机采用 **passkey / agent-key 优先** 的认证方式。Agent 不使用邮箱/密码。算法：**ECDSA P-256**（ES256）。公钥传输格式：base64url **SPKI DER**。签名：**DER**（RFC 3279），而非 P1363。密钥 ID = SHA-256(SPKI)。

完整认证说明：[/auth.md](/auth.md)。发现索引：[/llms.txt](/llms.txt)。

## 仪式（无需浏览器）

| 步骤 | 方法 | 路由 |
|------|--------|-------|
| 开始注册 | `POST` | `/api/identity/agent/register/options` |
| 完成注册 | `POST` | `/api/identity/agent/register` |
| 开始令牌 | `POST` | `/api/identity/agent/token/options` |
| 完成令牌 | `POST` | `/api/identity/agent/token` |
| 我是谁 | `GET` | `/api/identity/agent/me` |

`GET /api/identity/agent/me` 需要携带 `Authorization: Bearer <token>`，且 scope 为 `identity:read`。

## 持有证明域

不要凭空编造签名载荷的前缀。请优先使用 **TimeWarp.Identity** 提供的 `AgentKeyProof.BuildSignedData`：

- 注册：UTF-8 `TimeWarp.Identity.AgentKey.Register.v1:` ‖ challenge
- 令牌：UTF-8 `TimeWarp.Identity.AgentKey.Token.v1:` ‖ challenge

## 已知作用域（v1）

| 作用域 | 用途 |
|-------|---------|
| `identity:read` | `/api/identity/agent/me` 及类似的读取操作 |
| `credential:manage` | 列出 / 添加 / 撤销自身凭据 |
| `demo:invoke` | 为计量式演示能力预留 |

未知作用域会被拒绝，并返回机器可读的问题响应。令牌是短生命周期的、由存储支撑的不透明授权（v1 中不是 JWT）；刷新意味着重新执行令牌仪式。

## 首选工具（需检出仓库）

```bash
dotnet run tools/agent-identity-cli/agent.cs -- demo
# also: keygen | register | token | whoami
# --server defaults to https://localhost:63611
```

## 人类用户（浏览器）

WebAuthn 通行密钥：界面位于 [/Passkeys](/Passkeys) 和 [/Login](/Login)；仪式在 `/api/identity/passkey/*` 之下进行。完成后获得会话 cookie。

## 支付

Identity 回答的是*谁*。**x402**（TimeWarp.402）仅在付费路由上回答*是否已付款*。免费路由和发现路由**绝不**返回 HTTP **402**。
