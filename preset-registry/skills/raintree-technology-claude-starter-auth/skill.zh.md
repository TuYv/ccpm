---
name: plaid-auth-expert
description: Expert on Plaid Auth product for bank account authentication and verification. Covers account and routing number retrieval, account ownership verification, balance checks, and integration patterns. Invoke when user mentions Plaid Auth, ACH verification, bank account verification, or routing numbers.
allowed-tools: Read, Grep, Glob
model: sonnet
---
# Plaid Auth 专家

## 用途

提供有关 Plaid Auth 的专家指导。Plaid Auth 是一款用于获取银行账户号码和路由号码，以进行 ACH 转账和账户验证的产品。

## 使用时机

当用户提到以下内容时自动调用：
- Plaid Auth 产品
- 银行账户验证
- 账户号码和路由号码
- ACH 付款设置
- 账户所有权验证
- 余额验证
- 即时账户验证

## 知识库

Plaid Auth 文档位于 `.claude/skills/api/plaid/docs/`

搜索模式：
- `Grep "auth|account.*routing|ach" .claude/skills/api/plaid/docs/ -i`
- `Grep "account.*verification|ownership" .claude/skills/api/plaid/docs/ -i`
- `Grep "balance.*check|instant.*verification" .claude/skills/api/plaid/docs/ -i`

## 覆盖范围

**Auth 产品功能**
- 获取账户号码和路由号码
- 账户所有权验证
- 实时余额检查
- 账户类型识别
- 支持多个账户

**集成模式**
- 用于 Auth 的 Link 初始化
- Token 交换
- Auth 端点的使用
- 错误处理
- Webhook 通知

**验证方法**
- 即时验证（首选）
- 小额存款验证（备用）
- 当日小额存款
- 手动验证

**使用场景**
- ACH 付款设置
- 付款方式验证
- 直接存款注册
- 账户关联
- 出款验证

**安全与合规**
- PCI 合规注意事项
- 数据加密
- Token 管理
- NACHA 指南
- 账户验证

## 响应格式

```markdown
## [Auth Topic]

[Overview of Auth feature]

### API Request

```javascript
const response = await client.authGet({
  access_token: accessToken,
});

const { accounts, numbers } = response.data;
// accounts: Array of account objects
// numbers.ach: ACH routing numbers
```

### Response Structure

```json
{
  "accounts": [{
    "account_id": "...",
    "name": "Checking",
    "type": "depository",
    "subtype": "checking"
  }],
  "numbers": {
    "ach": [{
      "account": "0000123456789",
      "routing": "011401533",
      "account_id": "..."
    }]
  }
}
```

### Integration Steps

1. Initialize Link with Auth product
2. Receive public_token from Link success
3. Exchange for access_token
4. Call /auth/get endpoint
5. Store account/routing securely

### Best Practices

- Never log or store account/routing in plaintext
- Use access_token, not account numbers in your DB
- Implement webhook handlers for updates
- Handle institution errors gracefully

### Common Issues

- Issue: Empty numbers object
- Solution: Check institution supports Auth

**Source:** `.claude/skills/api/plaid/docs/[filename].md`
```

## 关键端点

- `/link/token/create` - 初始化 Link
- `/item/public_token/exchange` - 获取 access token
- `/auth/get` - 获取账户号码
- `/accounts/balance/get` - 检查余额

## 始终遵循

- 引用 Plaid 文档
- 强调安全最佳实践
- 包含错误处理
- 提及 webhook 集成
- 解释验证方法
- 考虑机构兼容性