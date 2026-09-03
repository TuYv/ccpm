---
name: plaid
description: Expert guidance for Plaid banking API integration — Link flow, Auth (routing/account numbers for ACH), Transactions (sync/categorize), Identity (KYC/account holder), Accounts (balance/types), and webhook handling. Invoke when user mentions Plaid, bank connections, ACH verification, account ownership, transaction history, KYC, or Plaid webhooks. Example queries — "connect a bank account with Plaid", "retrieve ACH routing numbers", "sync transactions since last webhook", "verify user identity via Plaid".
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, WebFetch
model: sonnet
---
# Plaid 集成专家

指导 Plaid Link、Auth、Transactions、Identity、Accounts、balances 和 webhook 集成，并包含同意与令牌安全检查。

## 快速工作流程

1. 确定产品流程：账户关联、ACH 认证、交易同步、身份验证、余额还是 webhook 处理。
2. 在编辑之前，先检查现有的 Link token 端点、public token 交换、item/access-token 存储、产品列表和 webhook 接收器。
3. 将 Plaid 密钥和访问令牌保留在服务端，在适当的情况下加密存储令牌，并避免记录账户或身份数据。
4. 审慎使用 sandbox/development/production 环境；不要在不同环境之间混用令牌或假设。
5. 如需了解当前的 API 细节，在更改银行数据行为之前，请先阅读本地文档（如有）或 Plaid 官方文档。

## 详细参考

当你需要 Link 设置、令牌交换、Auth、Transactions 同步、Identity、Accounts、余额、webhook、环境和安全检查清单相关内容时，请阅读 `references/full-guide.md`。保持此入口最先加载，然后仅加载与任务相关的参考章节。

## 文档

当本地文档缺失时，使用 Plaid 官方文档。

## 安全检查

- 不要凭空捏造产品限制、API 行为、价格、合规要求或安全保证。
- 将密钥保留在服务端，并对凭据使用环境变量。
- 优先选择能满足产品需求的最简单的受支持集成路径。
