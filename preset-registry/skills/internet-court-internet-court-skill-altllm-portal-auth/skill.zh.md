---
name: altllm-portal-auth
description: Use this skill when the user asks to log in or out with a wallet session, fetch a wallet sign-in challenge, verify an externally signed challenge, or troubleshoot AltLLM Portal wallet login for the local altllm CLI. Do NOT use for API key management, billing history, or payment links.
user-invocable: true
---
# AltLLM 门户认证

为本地 `altllm` CLI 提供钱包登录和会话初始化，包括 Privy 等外部签名方。

## 共享设置

> 在全新检出中执行第一个 `altllm` 命令之前，请阅读并遵循：
> - `../_shared/preflight.md`
> - `../_shared/session-and-target.md`

## 命令索引

| 命令 | 用途 |
|---|---|
| `login-wallet --private-key-env <name>` | 使用环境变量中本地可用的私钥登录 |
| `login-wallet --private-key-file <path>` | 使用文件中的本地可用私钥登录 |
| `login-wallet --private-key <hex> --allow-unsafe-private-key-argv` | 在明确接受 argv 暴露风险的情况下，使用内联私钥登录 |
| `login-wallet --prepare` | 获取供外部签名的挑战 |
| `login-wallet --nonce <nonce> --signature <sig>` | 验证外部签名的挑战并保存会话 |
| `status` | 显示已保存的门户会话用户和目标 URL 状态，但不暴露令牌 |
| `logout` | 删除本地保存的门户会话文件 |

## 规则

- 不要假设 CLI 必须控制钱包私钥。
- 如果钱包可以对挑战消息进行签名，请使用准备 + 验证流程。
- Privy 等外部签名方是有效的，只要它们能够为挑战返回标准钱包签名。
- 如果本地私钥和 `--signature` 均不可用，则返回挑战载荷并停止。
- 在本地自动签名之前，验证返回的挑战是否与请求的钱包、链以及预期的 AltLLM 登录挑战结构相匹配。
- 对于非默认、非回环 API 主机，优先使用 `--prepare` 和外部签名，而不是本地自动签名。
- 当前后端支持仍仅限于 EVM 地址和以太坊风格的签名。
- 将生成的会话保存到 `~/.altllm/portal-cli-session.json`，除非另有覆盖。
- 在运行实时命令之前，使用 `status` 或其 `whoami` 别名确认已保存的用户和目标 URL。
- `logout` 只会删除本地会话文件，不会撤销 API 密钥。

## 参考

有关命令、载荷和故障排除说明，请参阅 [references/cli-reference.md](references/cli-reference.md)。