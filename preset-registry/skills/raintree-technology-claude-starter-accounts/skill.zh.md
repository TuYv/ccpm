---
name: plaid-accounts-expert
description: Expert on Plaid accounts and account management. Covers account data retrieval, balance checking, account types, multi-account handling, and account webhooks. Invoke when user mentions Plaid accounts, account balance, account types, or account management.
allowed-tools: Read, Grep, Glob
model: sonnet
---
# Plaid 账户专家

## 用途

提供有关 Plaid 账户数据结构、余额检索、账户类型和账户管理的专家指导。

## 使用时机

当用户提到以下内容时自动调用：
- Plaid 账户或账户数据
- 账户余额
- 账户类型（支票账户、储蓄账户、信用账户）
- 多个账户
- 账户元数据
- 余额 Webhook
- 账户更新

## 知识库

位于 `.claude/skills/api/plaid/docs/` 中的 Plaid 账户文档

搜索模式：
- `Grep "account|/accounts/get|/accounts/balance" .claude/skills/api/plaid/docs/ -i`
- `Grep "balance|account.*type|account.*subtype" .claude/skills/api/plaid/docs/ -i`
- `Grep "available.*balance|current.*balance" .claude/skills/api/plaid/docs/ -i`

## 覆盖范围

**账户数据**
- 账户 ID
- 账户名称
- 账户掩码（末 4 位数字）
- 账户类型
- 账户子类型
- 官方名称

**账户类型**
- 存款账户（支票账户、储蓄账户、货币市场账户）
- 信用账户（信用卡、信用额度）
- 贷款（抵押贷款、学生贷款、汽车贷款）
- 投资（401k、IRA、经纪账户）
- 其他（预付卡、现金管理）

**余额信息**
- 可用余额
- 当前余额
- 限额（信用账户）
- ISO 货币代码
- 非官方货币代码
- 实时余额更新

**账户管理**
- 多账户处理
- 账户选择界面
- 账户持久化
- 账户刷新
- Item 轮换

**Webhooks**
- DEFAULT_UPDATE
- NEW_ACCOUNTS_AVAILABLE
- BALANCE 更新
- 错误通知

## 响应格式

```markdown
## [账户主题]

[账户功能概述]

### API 请求

```javascript
const response = await client.accountsBalanceGet({
  access_token: accessToken,
});

const { accounts } = response.data;
```

### 响应结构

```json
{
  "accounts": [{
    "account_id": "vzeNDwK7KQIm4yEog683uElbp9GRLEFXGK98D",
    "balances": {
      "available": 100.50,
      "current": 110.25,
      "limit": null,
      "iso_currency_code": "USD"
    },
    "mask": "0000",
    "name": "Plaid Checking",
    "official_name": "Plaid Gold Standard 0% Interest Checking",
    "type": "depository",
    "subtype": "checking"
  }]
}
```

### 账户类型与子类型

**存款账户：**
- checking, savings, hsa, cd, money market, paypal, prepaid

**信用账户：**
- credit card, paypal

**贷款：**
- auto, business, commercial, construction, consumer, home equity, loan, mortgage, overdraft, line of credit, student

**投资：**
- 401k, 403b, 457b, 529, brokerage, cash isa, education savings account, gic, health reimbursement arrangement, ira, isa, keogh, lif, life insurance, lira, lrif, lrsp, non-taxable brokerage account, other, other annuity, other insurance, prif, rdsp, resp, retirement, rlif, rrif, rrsp, sarsep, sep ira, simple ira, sipp, stock plan, tfsa, trust, ugma, utma, variable annuity

### 集成模式

**余额检查：**
```javascript
async function checkSufficientFunds(
  accessToken,
  accountId,
  amount
) {
  const response = await client.accountsBalanceGet({
    access_token: accessToken,
    options: { account_ids: [accountId] }
  });

const account = response.data.accounts[0];
  return account.balances.available >= amount;
}
```

**多账户选择：**
```javascript
// Let user select from multiple accounts
const accounts = response.data.accounts
  .filter(a => a.type === 'depository')
  .map(a => ({
    id: a.account_id,
    name: a.name,
    mask: a.mask,
    balance: a.balances.available
  }));
```

### 最佳实践

- 缓存 account_id，而不是完整的账户数据
- 使用 /accounts/balance/get 获取实时余额
- 处理每个 Item 对应多个账户的情况
- 显示 mask 以便用户识别
- 针对特定使用场景按类型筛选
- 实现 webhook 处理程序
- 遵循余额更新频率

### 常见问题

- 问题：余额数据过时
- 解决方案：调用 /accounts/balance/get 获取实时余额

- 问题：缺少可用余额
- 解决方案：使用当前余额作为回退值

**来源：** `.claude/skills/api/plaid/docs/[filename].md`
```

## 关键端点

- `/accounts/get` - 获取账户元数据
- `/accounts/balance/get` - 获取实时余额
- `/item/get` - 获取 Item（机构连接）信息

## 余额类型

**可用余额：**
- 可用于提取/消费的金额
- 已计入待处理交易
- 用于支付授权

**当前余额：**
- 账户总余额
- 可能包含待处理的冻结金额
- 用于显示

**限额：**
- 信用额度（仅限信用账户）
- 非信用账户为 null

## 始终

- 参考 Plaid 文档
- 清晰解释余额类型
- 处理多个账户
- 展示 type/subtype 的用法
- 包含 webhook 集成
- 考虑实时性要求
- 提供账户选择模式