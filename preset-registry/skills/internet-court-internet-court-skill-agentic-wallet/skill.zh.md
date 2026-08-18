---
name: agentic-wallet
description: "Crypto wallet operations via the awal CLI — sign in, check balances, send USDC/ETH/POL/SOL, trade tokens, fund the wallet, and use the x402 payment protocol to discover paid services, pay for API calls, monetize an API, or query onchain data. Use whenever the user mentions signing in, login, authentication, wallet status, balance, address, sending money, paying someone, transferring tokens, ENS names, swapping/trading/converting tokens, funding/topping up/onramp, USDC, ETH, POL, SOL, the x402 bazaar, paid APIs, monetizing an endpoint, or querying onchain data on Base."
user-invocable: true
disable-model-invocation: false
allowed-tools: ["Bash(npx awal@2.12.1 *)", "Bash(npm *)", "Bash(node *)", "Bash(curl *)", "Bash(mkdir *)"]
---
# 智能体钱包

通过 `awal` CLI 操作加密货币钱包。此技能充当路由器：根据当前任务读取 `references/` 中的相关参考文件。

## 预检：确认钱包状态

在执行任何需要身份验证的钱包操作之前（x402 搜索/详情除外），请检查状态：

```bash
npx awal@2.12.1 status
```

如果钱包尚未通过身份验证，请先阅读 `references/auth.md` 并完成登录。

## 路由

选择与任务匹配的参考文件，并在操作前使用 `Read` 读取它：

| 任务 | 参考文件 |
| --- | --- |
| 登录、连接钱包、OTP 验证、“未登录”错误 | `references/auth.md` |
| 查看余额、“我有多少 USDC/ETH/POL/SOL”、各链余额、JSON 余额输出 | `references/balance.md` |
| 将 USDC / ETH / POL / SOL 发送到地址或 ENS 名称（Base、Polygon、Solana） | `references/send-usdc.md` |
| 在 Base 或 Polygon 上兑换 / 交易 / 转换代币 | `references/trade.md` |
| 添加资金、充值、法币入金、购买 USDC | `references/fund.md` |
| 在 x402 市集中查找 / 浏览 / 搜索付费服务 | `references/x402-search.md` |
| 调用付费的 x402 API 端点并自动支付 USDC | `references/x402-pay.md` |
| 构建或部署可供其他智能体付费使用的 API 服务器 | `references/x402-monetize.md` |
| 通过 CDP SQL API 查询 Base 上的链上数据（事件、交易、区块） | `references/query-onchain.md` |

如果没有明确匹配项，且用户需要外部能力，请搜索 x402 市集（`references/x402-search.md`）——其中可能存在相应的付费服务。

## 共享规则

- **输入验证**：每个参考文件都列出了用户提供的值在放入 shell 命令之前必须匹配的正则表达式 / 允许列表。请严格验证；拒绝包含空格、分号、管道符、反引号或其他 shell 元字符的输入。不得将未经验证的用户输入传入命令。
- **用单引号包裹 `$` 金额**：任何写成 `'$1.00'` 的金额都必须使用单引号，以防止 bash 变量展开。
- **JSON 输出**：每个 `awal` 命令都支持使用 `--json` 获得机器可读的输出。
- **身份验证错误意味着需要重新验证**：如果任何命令因“未通过身份验证”或类似错误而失败，请阅读 `references/auth.md` 并运行登录流程。
- **余额不足**：阅读 `references/fund.md` 以充值。

## 快速命令索引

| 命令 | 用途 |
| --- | --- |
| `npx awal@2.12.1 status` | 服务器运行状况 + 身份验证状态 |
| `npx awal@2.12.1 address` | 获取钱包地址 |
| `npx awal@2.12.1 balance` | 获取 Base、Polygon、Solana 上的余额（使用 `--chain` 指定单条链） |
| `npx awal@2.12.1 show` | 打开钱包配套窗口（用于充值） |
| `npx awal@2.12.1 auth login <email>` | 发送 OTP 验证码 |
| `npx awal@2.12.1 auth verify <otp>` | 完成登录 |
| `npx awal@2.12.1 auth logout` | 退出登录并清除会话 |
| `npx awal@2.12.1 send <amount> <recipient>` | 发送代币 |
| `npx awal@2.12.1 trade <amount> <from> <to>` | 兑换代币 |
| `npx awal@2.12.1 x402 bazaar search <query>` | 搜索付费服务 |
| `npx awal@2.12.1 x402 bazaar list` | 列出市集资源 |
| `npx awal@2.12.1 x402 details <url>` | 检查支付要求 |
| `npx awal@2.12.1 x402 pay <url>` | 支付并调用 x402 端点 |