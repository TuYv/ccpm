---
name: blink
description: Bitcoin Lightning wallet for agents — balances, invoices, payments, BTC/USD swaps, QR codes, price conversion, and transaction history via the Blink API. All output is JSON.
metadata:
  oa:
    project: blink
    identifier: blink
    version: "1.3.0"
    expires_at_unix: 1798761600
    capabilities:
      - http:outbound
      - filesystem:read
      - process:spawn
---
# Blink 技能

通过 Blink API 执行比特币闪电网络钱包操作。支持智能体查询余额、通过发票收款、通过闪电网络发送付款、在 BTC 和 USD 钱包之间兑换、跟踪交易以及监控价格。

## 什么是 Blink？

Blink 是一款提供 GraphQL API 的托管式比特币闪电网络钱包。关键概念：
- **API 密钥** — 具有权限范围（读取、收款、写入）的身份验证令牌（格式：`blink_...`）
- **BTC 钱包** — 以聪为单位计价的余额
- **USD 钱包** — 以美分为单位计价的余额（与美元挂钩的稳定币）
- **闪电网络发票** — 用于接收付款的 BOLT-11 付款请求字符串（`lnbc...`）
- **闪电网络地址** — 无需发票即可发送付款的人类可读地址（`user@domain`）
- **LNURL** — 通过编码 URL 与闪电网络服务交互的协议

## 环境

- 需要 `bash` 和 Node.js 18+。
- 需要具有适当权限范围的 `BLINK_API_KEY` 环境变量。
- 对于 WebSocket 订阅：需要 Node 22+（原生支持），或使用带有 `--experimental-websocket` 的 Node 20+。
- 运行时 npm 依赖为零。仅使用 Node.js 内置模块（`node:util`、`node:fs`、`node:path`、`node:child_process`）。

请将此技能用于具体的钱包操作，而不是一般性的闪电网络理论。

## 开始使用

### 1. 获取 API 密钥

1. 在 [dashboard.blink.sv](https://dashboard.blink.sv) 创建免费账户。
2. 前往 **API 密钥**，创建一个具有所需权限范围的密钥。
3. 在环境中设置该密钥：

```bash
export BLINK_API_KEY="blink_..."
```

**API 密钥权限范围：**
- **读取** — 查询余额、交易历史、价格和账户信息
- **收款** — 创建发票
- **写入** — 发送付款（请谨慎使用）

> **提示：** 开始时仅授予读取和收款权限。需要发送付款时再添加写入权限。

### 2. 验证是否正常工作

```bash
node {baseDir}/scripts/balance.js
```

如果看到包含钱包余额的 JSON，就表示已经准备就绪。

### 3. 预发布环境／测试网（建议首次设置时使用）

要使用 Blink 预发布环境（signet）而非真实资金：
```bash
export BLINK_API_URL="https://api.staging.blink.sv/graphql"
```

请在 [dashboard.staging.blink.sv](https://dashboard.staging.blink.sv) 创建预发布环境 API 密钥。预发布环境使用 signet 比特币（没有真实价值），非常适合安全地测试付款流程。

如果未设置 `BLINK_API_URL`，则默认使用生产环境（`https://api.blink.sv/graphql`）。

### API 密钥自动检测

脚本会按以下顺序自动解析 `BLINK_API_KEY`：
1. `process.env.BLINK_API_KEY`（优先检查）
2. Shell rc 文件：`~/.profile`、`~/.bashrc`、`~/.bash_profile`、`~/.zshrc` — 仅扫描 `export BLINK_API_KEY=...` 行

无需添加 `source ~/.profile` 前缀。rc 文件扫描使用针对性的正则表达式，仅读取 `BLINK_API_KEY` 导出行，不会从这些文件中提取任何其他数据。

## 智能体安全策略

任何使用此技能的 AI 智能体都必须遵守以下规则：

1. **花费前先询问。** 未经用户明确确认金额和收款方，绝不能执行 `pay_invoice.js`、`pay_lnaddress.js`、`pay_lnurl.js` 或 `swap_execute.js`。
2. **先进行试运行。** 对于兑换操作，除非用户明确要求跳过，否则在实际执行前始终使用 `--dry-run` 运行。
3. **发送前检查余额。** 在进行任何付款或兑换操作前，始终运行 `balance.js` 以验证资金是否充足。
4. **付款前探测手续费。** 在运行 `pay_invoice.js` 前先运行 `fee_probe.js`，向用户展示手续费成本。
5. **使用最小权限范围。** 仅在确实需要执行发送操作时，才要求使用具有写入权限范围的 API 密钥。
6. **绝不记录或显示 API 密钥。** 将 `BLINK_API_KEY` 视为机密。不要回显它、将其包含在消息中或写入文件。
7. **测试时优先使用预发布环境。** 当用户正在测试或学习时，建议将 `BLINK_API_URL` 设置为预发布端点。
8. **重视不可逆性。** 警告用户：闪电网络付款和兑换一旦执行便无法撤销。

## 比特币单位

- **BTC 钱包**金额始终以 **satoshis**（sats）为单位。1 BTC = 100,000,000 sats。
- **USD 钱包**金额始终以**美分**为单位。$1.00 = 100 美分。
- 向用户显示金额时，请使用输出 JSON 中已格式化的字段（例如 `btcBalanceUsdFormatted`、`usdBalanceFormatted`）。
- 不要手动进行 BTC 到 USD 的换算——请改用 `node {baseDir}/scripts/price.js <sats>` 或 `balance` 输出中的 `btcBalanceUsd` 字段。
- 对于兑换金额，`--unit` 标志控制其解释方式：BTC 使用 `sats`，USD 使用 `cents`。

## 工作流程

1. 首先选择操作路径：
- 接收付款（创建发票、二维码、付款监控）。
- 发送付款（支付发票、Lightning Address、LNURL、BTC 或 USD 钱包）。
- 在钱包之间兑换（BTC <-> USD 内部转换）。
- 只读查询（余额、交易、价格、账户信息）。

2. 按照 [blink-api-and-auth](references/blink-api-and-auth.md) 配置 API 访问：
- 根据操作设置具有正确权限范围的 `BLINK_API_KEY`。
- 可选择为预发布环境/测试网设置 `BLINK_API_URL`。
- 使用 `balance.js` 验证连接。

3. 对于发送付款，请遵循 [payment-operations](references/payment-operations.md)：
- 发送前检查余额。
- 使用 `fee_probe.js` 探测费用。
- 使用 `--wallet` 标志选择 BTC 或 USD 钱包。
- 使用 `--dry-run` 在不发送的情况下预览。使用 `--max-amount` 限制转出金额。
- 执行付款并在交易历史记录中验证。

4. 对于钱包之间的兑换，请遵循 [swap-operations](references/swap-operations.md)：
- 使用 `swap_quote.js` 获取报价以预览转换结果。
- 使用 `swap_execute.js` 执行（先使用 `--dry-run`）。

5. 对于接收付款，请遵循 [invoice-lifecycle](references/invoice-lifecycle.md)：
- 创建 BTC 或 USD 发票。
- 解析两阶段输出（发票已创建，然后是付款结果）。
- 生成二维码并发送给付款方。
- 通过自动订阅、轮询或独立订阅进行监控。

6. 应用安全约束：
- 使用完成任务所需的最小 API 密钥权限范围。
- 在投入生产环境前，先在预发布环境中测试。
- 发送前始终检查余额。
- 在付款和兑换命令中使用 `--dry-run`，以便在执行前预览。
- 使用 `--max-amount <sats>` 强制实施单笔付款上限（pay_lnaddress、pay_lnurl）。
- 当你确定付款应继续进行时，使用 `--force` 覆盖余额检查失败。
- 付款一旦结算便不可撤销。

## 快速命令

```bash
# Check balances
node {baseDir}/scripts/balance.js

# Create BTC invoice (auto-subscribes to payment)
node {baseDir}/scripts/create_invoice.js 1000 "Payment for service"

# Pay a Lightning invoice
node {baseDir}/scripts/pay_invoice.js lnbc1000n1...

# Pay from USD wallet
node {baseDir}/scripts/pay_invoice.js lnbc1000n1... --wallet USD

# Get current BTC/USD price
node {baseDir}/scripts/price.js

# Quote BTC -> USD internal swap (dry-run)
node {baseDir}/scripts/swap_quote.js btc-to-usd 5000

# Execute USD -> BTC internal swap
node {baseDir}/scripts/swap_execute.js usd-to-btc 500 --unit cents
```

## 核心命令

### 查询钱包余额
```bash
node {baseDir}/scripts/balance.js
```

返回包含所有钱包余额（BTC 以聪为单位，USD 以美分为单位）、钱包 ID、待入账金额，以及 BTC 钱包的**预先计算的 USD 估值**的 JSON。请使用 `btcBalanceUsd` 获取 BTC 钱包的 USD 价值——不要自行计算。

### 创建闪电网络发票（BTC）
```bash
node {baseDir}/scripts/create_invoice.js <amount_sats> [--timeout <seconds>] [--no-subscribe] [memo...]
```

为指定的聪数生成一张 BOLT-11 闪电网络发票。返回可由任意闪电网络钱包支付的 `paymentRequest` 字符串。BTC 钱包 ID 会自动解析。

**自动订阅**：创建发票后，脚本会自动建立 WebSocket 订阅并等待付款。它会向标准输出输出**两个 JSON 对象**：
1. **立即输出**——包含 `paymentRequest`、`paymentHash` 等信息的 `{"event": "invoice_created", ...}`
2. **状态确定时输出**——`{"event": "subscription_result", "status": "PAID"|"EXPIRED"|"TIMEOUT", ...}`

代理应读取第一个 JSON，以便立即向用户提供发票/二维码，然后等待第二个 JSON 以确认付款。

- `amount_sats`——以聪为单位的金额（必填）
- `--timeout <seconds>`——订阅超时时间（默认值：300）。设为 0 表示不超时。
- `--no-subscribe`——跳过 WebSocket 自动订阅，仅创建发票后退出
- `memo...`——附加到发票的可选描述（其余参数会合并）

### 创建闪电网络发票（USD）
```bash
node {baseDir}/scripts/create_invoice_usd.js <amount_cents> [--timeout <seconds>] [--no-subscribe] [memo...]
```

创建一张以 USD 美分计价的闪电网络发票。付款方使用 BTC/闪电网络付款，但收款金额会按当前汇率锁定为 USD 价值。款项将计入 USD 钱包。由于汇率锁定，发票将在**约 5 分钟后过期**。

**自动订阅**：与 `create_invoice.js` 相同的两阶段输出——第一个 JSON 是已创建的发票，第二个 JSON 是付款结果（PAID/EXPIRED/TIMEOUT）。

- `amount_cents`——以 USD 美分为单位的金额，例如 100 = $1.00（必填）
- `--timeout <seconds>`——订阅超时时间（默认值：300）。设为 0 表示不超时。
- `--no-subscribe`——跳过 WebSocket 自动订阅，仅创建发票后退出
- `memo...`——附加到发票的可选描述（其余参数会合并）

### 查询发票状态
```bash
node {baseDir}/scripts/check_invoice.js <payment_hash>
```

通过付款哈希查询闪电网络发票的付款状态。创建发票后，可使用此命令检测发票是否已付款。返回状态：`PAID`、`PENDING` 或 `EXPIRED`。

- `payment_hash`——`create_invoice.js` 输出中的 64 字符十六进制付款哈希（必填）

### 支付闪电网络发票
```bash
node {baseDir}/scripts/pay_invoice.js <bolt11_invoice> [--wallet BTC|USD] [--dry-run] [--force]
```

使用 BTC 或 USD 钱包支付 BOLT-11 闪电网络发票。返回付款状态：`SUCCESS`、`PENDING`、`FAILURE` 或 `ALREADY_PAID`。钱包 ID 会自动解析。

- `bolt11_invoice` — BOLT-11 支付请求字符串，例如 `lnbc...`（必填）
- `--wallet BTC|USD` — 用于付款的钱包（默认：BTC）。选择 USD 时，Blink API 会从 USD 钱包中扣除等值的美元金额。
- `--dry-run` — 预览付款但不发送（返回钱包信息和发票详情）
- `--force` — 即使钱包余额看起来不足，也尝试付款

**要求 API 密钥具有写入权限。**

> **代理：** 此命令会支出资金。务必先运行 `balance.js` 和 `fee_probe.js`，然后在执行前与用户确认金额和收款方。

### 向闪电地址付款
```bash
node {baseDir}/scripts/pay_lnaddress.js <lightning_address> <amount_sats> [--wallet BTC|USD] [--dry-run] [--force] [--max-amount <sats>]
```

向闪电地址（例如 `user@blink.sv`）发送聪。返回付款状态。钱包 ID 会自动解析。

- `lightning_address` — `user@domain` 格式的收款方（必填）
- `amount_sats` — 以聪为单位的金额（必填）
- `--wallet BTC|USD` — 用于付款的钱包（默认：BTC）。选择 USD 时，金额仍以聪为单位指定；Blink API 会自动从 USD 钱包中扣除等值的美元金额。
- `--dry-run` — 预览付款但不发送（返回钱包信息和金额详情）
- `--force` — 即使钱包余额看起来不足，也尝试付款
- `--max-amount <sats>` — 如果金额超过此上限，则拒绝付款（以聪为单位）

**要求 API 密钥具有写入权限。**

> **代理：** 此命令会支出资金。务必先运行 `balance.js`，与用户确认闪电地址和金额，然后再执行。

### 向 LNURL 付款
```bash
node {baseDir}/scripts/pay_lnurl.js <lnurl> <amount_sats> [--wallet BTC|USD] [--dry-run] [--force] [--max-amount <sats>]
```

向原始 LNURL payRequest 字符串发送聪。对于闪电地址（`user@domain`），请改用 `pay_lnaddress.js`。

- `lnurl` — LNURL 字符串，例如 `lnurl1...`（必填）
- `amount_sats` — 以聪为单位的金额（必填）
- `--wallet BTC|USD` — 用于付款的钱包（默认：BTC）。选择 USD 时，金额仍以聪为单位指定；Blink API 会自动从 USD 钱包中扣除等值的美元金额。
- `--dry-run` — 预览付款但不发送（返回钱包信息和金额详情）
- `--force` — 即使钱包余额看起来不足，也尝试付款
- `--max-amount <sats>` — 如果金额超过此上限，则拒绝付款（以聪为单位）

**要求 API 密钥具有写入权限。**

> **代理：** 此命令会支出资金。务必先运行 `balance.js`，与用户确认 LNURL 和金额，然后再执行。

### 估算付款手续费
```bash
node {baseDir}/scripts/fee_probe.js <bolt11_invoice> [--wallet BTC|USD]
```

估算支付闪电发票的手续费，而不实际发送付款。在使用 `pay_invoice.js` 前运行此命令以检查成本。向其他 Blink 用户和直连通道节点付款免费（0 聪）。

- `bolt11_invoice` — BOLT-11 支付请求字符串（必填）
- `--wallet BTC|USD` — 用于探测手续费的钱包（默认：BTC）。选择 USD 时，使用 `lnUsdInvoiceFeeProbe` 从 USD 钱包的角度估算手续费。

### 渲染发票二维码
```bash
node {baseDir}/scripts/qr_invoice.js <bolt11_invoice>
```

将闪电网络发票（BOLT-11）的二维码渲染到 stderr，并在 `/tmp` 中生成一个 **PNG 图像文件**。stdout 输出的 JSON 包含 `pngPath` 字段，其值为该 PNG 文件的绝对路径。

**向用户发送二维码图像**：运行此脚本后，使用 JSON 输出中的 `pngPath`，将 PNG 作为媒体附件发送给当前聊天中的用户。代理应使用其原生消息发送功能，并传入该文件路径。

- `bolt11_invoice` — BOLT-11 支付请求字符串（必需）

输出的 JSON 包含：
- `invoice` — 转换为大写的发票字符串
- `qrRendered` — 始终为 `true`
- `qrSize` — 二维码模块数量
- `errorCorrection` — `"L"`（低）
- `pngPath` — 生成的 PNG 文件的绝对路径（例如 `/tmp/blink_qr_1234567890.png`）
- `pngBytes` — 文件大小（以字节为单位）

### 列出交易
```bash
node {baseDir}/scripts/transactions.js [--first N] [--after CURSOR] [--wallet BTC|USD]
```

分页列出最近的交易（转入和转出）。返回方向、金额、状态、类型（闪电网络/链上/内部账本）和元数据。

- `--first N` — 要返回的交易数量（默认值：20，最大值：100）
- `--after CURSOR` — 上一次响应的 `endCursor` 分页游标
- `--wallet BTC|USD` — 筛选指定钱包币种

### 获取 BTC/USD 价格
```bash
node {baseDir}/scripts/price.js [amount_sats]
node {baseDir}/scripts/price.js --usd <amount_usd>
node {baseDir}/scripts/price.js --history <range>
node {baseDir}/scripts/price.js --currencies
```

多用途汇率工具。所有价格查询均为**公开查询（无需 API 密钥）**，但如果密钥可用，仍会发送该密钥。

**模式：**
- **无参数** — 当前 BTC/USD 价格和每美元对应的聪数
- **`<amount_sats>`** — 将聪金额换算为 USD（例如 `price.js 1760` → `$1.20`）
- **`--usd <amount>`** — 将 USD 金额换算为聪（例如 `price.js --usd 5.00` → `7350 sats`）
- **`--history <range>`** — 带汇总统计信息（最高价/最低价/涨跌幅）的 BTC 历史价格数据。范围：`ONE_DAY`、`ONE_WEEK`、`ONE_MONTH`、`ONE_YEAR`、`FIVE_YEARS`
- **`--currencies`** — 列出所有支持的显示货币（ID、名称、符号、旗帜）

### 账户信息
```bash
node {baseDir}/scripts/account_info.js
```

显示账户等级、支出限额（提现、内部转账、兑换）、默认钱包和钱包摘要，其中包含 BTC 余额的**预计算 USD 估值**。限额以 USD 美分计价，并采用 24 小时滚动窗口。

### 获取内部 BTC <-> USD 兑换报价
```bash
node {baseDir}/scripts/swap_quote.js <direction> <amount> [--unit sats|cents] [--ttl-seconds N] [--immediate]
```

为内部钱包兑换构建确定性的类报价收据。

- `direction` — `btc-to-usd` 或 `usd-to-btc`
- `amount` — 正整数金额（除非设置了 `--unit`，否则根据方向推断单位）
- `--unit sats|cents` — 可选的输入单位覆盖设置
- `--ttl-seconds N` — 报价有效期窗口，以秒为单位（默认值：60）
- `--immediate` — 在报价收据中标记立即执行模式的意图

使用 Blink 的兑换估算路径进行定价，并记录：
- 兑换前余额
- 报价 id / 到期元数据
- 输入/输出金额条款
- 执行路径（`intraLedgerPaymentSend` 或 `intraLedgerUsdPaymentSend`）

### 执行内部 BTC <-> USD 兑换
```bash
node {baseDir}/scripts/swap_execute.js <direction> <amount> [--unit sats|cents] [--ttl-seconds N] [--immediate] [--dry-run] [--memo "text"]
```

在你的 BTC 和 USD 钱包之间执行钱包原生的内部兑换。

- `--dry-run` — 返回执行回执，但不实际执行变更
- `--memo "text"` — 附加到内部转账的可选备注

执行回执包含报价条款、兑换前后余额、余额变化量以及最终状态。

费用/结算说明：
- 在实时运行中，`quote.feeSats`、`quote.feeBps` 和 `quote.slippageBps` 当前均返回零。
- 由于 sats 和 cents 之间进行整数舍入，报价与结算结果之间仍可能存在很小的差额（通常为 1 sat 或 1 cent）。
- 应始终根据 `quote.amountOut` 与 `balanceDelta` 计算实际成本，而不能只依赖明确列出的费用字段。

有关更深入的行为细节和公式，请参阅 [swap-operations](references/swap-operations.md)。

> **AGENT：** 此命令会在钱包之间转移资金。请始终先使用 `--dry-run` 运行，向用户展示报价，并在不使用 `--dry-run` 执行前获得明确确认。

## 实时订阅

Blink 支持通过 WebSocket 使用 `graphql-transport-ws` 协议进行 GraphQL 订阅。Node 20 需要使用 `--experimental-websocket` 标志。

### 订阅发票支付状态
```bash
node --experimental-websocket {baseDir}/scripts/subscribe_invoice.js <bolt11_invoice> [--timeout <seconds>]
```

监控单张发票，并在其状态变为 **已支付** 或 **已过期** 时退出。状态更新会输出到 stderr。JSON 结果会输出到 stdout。

### 订阅账户更新（myUpdates）
```bash
node --experimental-websocket {baseDir}/scripts/subscribe_updates.js [--timeout <seconds>] [--max <count>]
```

实时流式输出账户更新。每个事件都会以一个 JSON 行（NDJSON）的形式输出到 stdout。使用 `--max` 可在收到 N 个事件后停止。

## API 参考

| 操作 | GraphQL | 所需权限范围 |
|-----------|---------|----------------|
| 查询余额 | `query me` + `currencyConversionEstimation` | 读取 |
| 创建 BTC 发票 | `mutation lnInvoiceCreate` | 收款 |
| 创建 USD 发票 | `mutation lnUsdInvoiceCreate` | 收款 |
| 查询发票 | `query invoiceByPaymentHash` | 读取 |
| 支付发票 | `mutation lnInvoicePaymentSend` | 写入 |
| 支付 LN 地址 | `mutation lnAddressPaymentSend` | 写入 |
| 支付 LNURL | `mutation lnurlPaymentSend` | 写入 |
| 费用估算（BTC） | `mutation lnInvoiceFeeProbe` | 读取 |
| 费用估算（USD） | `mutation lnUsdInvoiceFeeProbe` | 读取 |
| 交易记录 | `query transactions` | 读取 |
| 价格 / 兑换 | `query currencyConversionEstimation` | **无（公开）** |
| 价格历史 | `query btcPriceList` | **无（公开）** |
| 货币列表 | `query currencyList` | **无（公开）** |
| 实时价格 | `query realtimePrice` | **无（公开）** |
| 账户信息 | `query me` + `currencyConversionEstimation` | 读取 |
| 兑换报价（BTC <-> USD） | `query currencyConversionEstimation` | 读取 |
| 执行 BTC -> USD 兑换 | `mutation intraLedgerPaymentSend` | 写入 |
| 执行 USD -> BTC 兑换 | `mutation intraLedgerUsdPaymentSend` | 写入 |
| 订阅发票 | `subscription lnInvoicePaymentStatus` | 读取 |
| 订阅更新 | `subscription myUpdates` | 读取 |

**API 端点：** `https://api.blink.sv/graphql`（生产环境）
**身份验证：** `X-API-KEY` 请求头

**USD 钱包说明：** `lnInvoicePaymentSend`、`lnAddressPaymentSend` 和 `lnurlPaymentSend` 变更均接受 BTC 或 USD 钱包 ID。提供 USD 钱包 ID 时，API 会自动扣除等值的 USD。无论钱包类型如何，`lnAddressPaymentSend` 和 `lnurlPaymentSend` 的金额始终以聪为单位指定。

## 输出格式

所有脚本均将结构化 JSON 输出到 stdout。状态消息和错误输出到 stderr。成功时退出代码为 0，失败时为 1。

### 余额输出示例
```json
{
  "wallets": [
    { "id": "abc123", "currency": "BTC", "balance": 1760, "unit": "sats" },
    { "id": "def456", "currency": "USD", "balance": 1500, "unit": "cents" }
  ],
  "btcWalletId": "abc123",
  "btcBalance": 1760,
  "btcBalanceSats": 1760,
  "btcBalanceUsd": 1.2,
  "btcBalanceUsdFormatted": "$1.20",
  "usdWalletId": "def456",
  "usdBalance": 1500,
  "usdBalanceCents": 1500,
  "usdBalanceFormatted": "$15.00"
}
```

### 发票创建输出示例（分两个阶段）
第一个 JSON（立即输出）：
```json
{
  "event": "invoice_created",
  "paymentRequest": "lnbc500n1...",
  "paymentHash": "abc123...",
  "satoshis": 500,
  "status": "PENDING",
  "createdAt": "2026-02-23T00:00:00Z",
  "walletId": "abc123"
}
```
第二个 JSON（付款结果确定时）：
```json
{
  "event": "subscription_result",
  "paymentRequest": "lnbc500n1...",
  "status": "PAID",
  "isPaid": true,
  "isExpired": false,
  "isPending": false
}
```

### 发票状态输出示例
```json
{
  "paymentHash": "abc123...",
  "paymentStatus": "PAID",
  "satoshis": 500,
  "isPaid": true,
  "isExpired": false,
  "isPending": false
}
```

### 付款输出示例（BTC 钱包）
```json
{
  "status": "SUCCESS",
  "walletId": "abc123",
  "walletCurrency": "BTC",
  "balanceBefore": 50000
}
```

### 付款输出示例（USD 钱包）
```json
{
  "status": "SUCCESS",
  "walletId": "def456",
  "walletCurrency": "USD",
  "balanceBefore": 1500,
  "balanceBeforeFormatted": "$15.00"
}
```

### 价格输出示例
```json
{
  "btcPriceUsd": 68036.95,
  "satsPerDollar": 1470,
  "conversion": {
    "sats": 1760,
    "usd": 1.2,
    "usdFormatted": "$1.20"
  }
}
```

### USD 到聪的换算输出示例
```json
{
  "btcPriceUsd": 68036.95,
  "satsPerDollar": 1470,
  "conversion": {
    "usd": 5.0,
    "usdFormatted": "$5.00",
    "sats": 7350
  }
}
```

### 价格历史输出示例
```json
{
  "range": "ONE_DAY",
  "dataPoints": 24,
  "summary": {
    "current": 68036.95,
    "oldest": 67500.00,
    "high": 68500.00,
    "low": 67200.00,
    "changeUsd": 536.95,
    "changePct": 0.8
  },
  "prices": [
    { "timestamp": 1740000000, "date": "2025-02-20T00:00:00.000Z", "btcPriceUsd": 67500.00 }
  ]
}
```

### 交易列表输出示例
```json
{
  "transactions": [
    {
      "id": "tx_123",
      "direction": "RECEIVE",
      "status": "SUCCESS",
      "amount": 1000,
      "currency": "BTC",
      "type": "lightning",
      "paymentHash": "abc...",
      "createdAt": 1740000000
    }
  ],
  "count": 1,
  "pageInfo": {
    "hasNextPage": false,
    "endCursor": "cursor_abc"
  }
}
```

### 兑换报价输出示例
```json
{
  "event": "swap_quote",
  "dryRun": true,
  "direction": "BTC_TO_USD",
  "preBalance": {
    "btcWalletId": "btc_wallet_id",
    "usdWalletId": "usd_wallet_id",
    "btcBalanceSats": 250000,
    "usdBalanceCents": 150000
  },
  "quote": {
    "quoteId": "blink-swap-1740000000-424242",
    "amountIn": { "value": 5000, "unit": "sats" },
    "amountOut": { "value": 340, "unit": "cents" },
    "expiresAtEpochSeconds": 1740000060,
    "immediateExecution": false,
    "executionPath": "blink:intraLedgerPaymentSend"
  }
}
```

### 兑换执行输出示例
```json
{
  "event": "swap_execution",
  "dryRun": false,
  "direction": "USD_TO_BTC",
  "status": "SUCCESS",
  "succeeded": true,
  "preBalance": {
    "btcBalanceSats": 250000,
    "usdBalanceCents": 150000
  },
  "postBalance": {
    "btcBalanceSats": 253650,
    "usdBalanceCents": 149500
  },
  "balanceDelta": {
    "btcDeltaSats": 3650,
    "usdDeltaCents": -500
  },
  "quote": {
    "quoteId": "blink-swap-1740000015-556677",
    "executionPath": "blink:intraLedgerUsdPaymentSend"
  },
  "execution": {
    "path": "blink:intraLedgerUsdPaymentSend",
    "transactionId": "tx_abc123"
  }
}
```

## 典型的智能体工作流

### 接收付款（推荐——自动订阅 + 二维码图片）
```bash
# 1. Create invoice — script auto-subscribes and outputs two JSON objects
node {baseDir}/scripts/create_invoice.js 1000 "Payment for service"
# → First JSON: {"event": "invoice_created", "paymentRequest": "lnbc...", ...}
# → Read paymentRequest from first JSON immediately

# 2. Generate QR code PNG
node {baseDir}/scripts/qr_invoice.js <paymentRequest>
# → JSON includes "pngPath": "/tmp/blink_qr_123456.png"
# → Send the PNG file to the user as a media attachment in the current chat

# 3. The create_invoice.js script is still running, waiting for payment
# → Second JSON: {"event": "subscription_result", "status": "PAID", ...}
# → When PAID: notify the user that payment has been received
# → When EXPIRED: notify the user the invoice expired
```

**重要提示**：`create_invoice.js` 脚本会输出两个由换行符分隔的 JSON 对象。请将它们解析为两个独立的 JSON 对象，而不是单个 JSON 数组。第一个对象会立即返回；第二个对象会在付款状态确定后返回。

### 接收付款（轮询备用方案）
```bash
# 1. Create invoice without auto-subscribe
node {baseDir}/scripts/create_invoice.js 1000 --no-subscribe "Payment for service"
# 2. Give the paymentRequest to the payer
# 3. Poll for payment
node {baseDir}/scripts/check_invoice.js <payment_hash>
# 4. Verify balance
node {baseDir}/scripts/balance.js
```

### 接收美元付款
```bash
# Same two-phase pattern as BTC, but using create_invoice_usd.js
# Note: USD invoices expire in ~5 minutes
node {baseDir}/scripts/create_invoice_usd.js 500 "Five dollars for service"
# → First JSON: {"event": "invoice_created", "amountCents": 500, "amountUsd": "$5.00", ...}
# Generate QR and send to user, then wait for second JSON
```

### 发送付款（并检查手续费）
```bash
# 1. Check current balance
node {baseDir}/scripts/balance.js
# 2. Estimate fee
node {baseDir}/scripts/fee_probe.js lnbc1000n1...
# 3. Send payment
node {baseDir}/scripts/pay_invoice.js lnbc1000n1...
# 4. Verify in transaction history
node {baseDir}/scripts/transactions.js --first 1
```

### 从 USD 钱包发送
```bash
# Pay an invoice from the USD wallet
node {baseDir}/scripts/fee_probe.js lnbc1000n1... --wallet USD
node {baseDir}/scripts/pay_invoice.js lnbc1000n1... --wallet USD

# Send to a Lightning Address from the USD wallet
node {baseDir}/scripts/pay_lnaddress.js user@blink.sv 1000 --wallet USD

# Send via LNURL from the USD wallet
node {baseDir}/scripts/pay_lnurl.js lnurl1... 1000 --wallet USD

# Note: for lnaddress and lnurl, the amount is always in satoshis.
# The Blink API debits the USD equivalent from the USD wallet automatically.
```

### 将 sats 换算为 USD 价值
```bash
# Check how much 1760 sats is worth in USD
node {baseDir}/scripts/price.js 1760
# → $1.20
```

### 将 USD 换算为 sats
```bash
# How many sats is $5.00?
node {baseDir}/scripts/price.js --usd 5.00
# → 7350 sats
```

### 将 BTC 兑换为 USD（先获取报价，再执行）
```bash
# 1. Build quote and inspect terms
node {baseDir}/scripts/swap_quote.js btc-to-usd 10000

# 2. Execute the swap
node {baseDir}/scripts/swap_execute.js btc-to-usd 10000
```

### 将 USD 兑换为 BTC（先试运行，再执行）
```bash
# 1. Dry-run execution receipt without moving funds
node {baseDir}/scripts/swap_execute.js usd-to-btc 500 --unit cents --dry-run

# 2. Real execution
node {baseDir}/scripts/swap_execute.js usd-to-btc 500 --unit cents
```

### 查看价格历史
```bash
# Get BTC price over the last 24 hours
node {baseDir}/scripts/price.js --history ONE_DAY
# Get BTC price over the last month
node {baseDir}/scripts/price.js --history ONE_MONTH
```

## 安全

### API 密钥处理

- **你的 API 密钥就是你的钱包访问凭证** — 任何拥有 Write 作用域密钥的人都可以花掉你的全部余额。
- **使用最小作用域** — 查询余额时使用 Read-only，接收发票时使用 Receive，仅在发送时使用 Write。
- **绝不要在输出中暴露密钥** — 不要在聊天消息或文件中回显、记录或包含 `BLINK_API_KEY`。
- 密钥仅供服务端 / 代理使用。绝不要将其嵌入客户端代码。

### 哪些数据会离开本机

- **出站 HTTPS** 到 `api.blink.sv`（或由 `BLINK_API_URL` 覆盖）以执行所有 GraphQL 查询和变更。
- **出站 WSS** 到 `ws.blink.sv`（或由 `BLINK_WS_URL` 覆盖）以使用订阅 WebSocket。
- **无其他网络调用。** 脚本不会回连、发送遥测数据或联系任何第三方服务。

### 文件系统访问

- **读取 RC 文件：** 如果在 `process.env` 中找不到 `BLINK_API_KEY`，客户端会扫描 `~/.profile`、`~/.bashrc`、`~/.bash_profile` 和 `~/.zshrc`，查找与 `export BLINK_API_KEY=...` 匹配的行。只会提取该特定 export 的值，不会从这些文件中读取任何其他数据。始终优先检查环境变量。
- **生成 QR PNG：** `qr` 命令会将临时 PNG 文件写入 `/tmp/blink_qr_*.png`。这些是标准图像文件，除 QR 内容外不包含任何嵌入式元数据。
- **无其他文件系统写入。** 脚本不会创建配置文件、数据库或缓存。

### 无状态设计

此技能在不同运行之间不存储任何数据。不存在数据库、配置文件、会话令牌或缓存。每次脚本调用都是相互独立的——读取 API 密钥、发起 API 调用、输出 JSON，然后退出。

### 支付安全

- **发送操作不可逆**——闪电网络支付一旦结算便无法撤销。
- **请先在预发布环境中测试**——使用 `BLINK_API_URL=https://api.staging.blink.sv/graphql` 指向使用测试资金的 Signet 预发布环境。
- **USD 发票过期很快**——由于需要锁定汇率，有效期约为 5 分钟。
- **价格查询是公开的**——`price.js` 无需 API 密钥即可使用；只有钱包操作需要身份验证。

## 参考文件

- [blink-api-and-auth](references/blink-api-and-auth.md)：API 端点、身份验证、权限范围、预发布环境/测试网配置以及错误处理。
- [payment-operations](references/payment-operations.md)：发送工作流、BTC 与 USD 钱包选择、手续费探测以及安全防护措施。
- [invoice-lifecycle](references/invoice-lifecycle.md)：发票创建、两阶段输出解析、监控策略、二维码生成以及过期处理。
- [swap-operations](references/swap-operations.md)：钱包原生 BTC<->USD 兑换流程、报价/执行回执以及回退行为。

## 文件

- `{baseDir}/scripts/balance.js` — 查看钱包余额
- `{baseDir}/scripts/create_invoice.js` — 创建 BTC 闪电网络发票（自动订阅支付状态）
- `{baseDir}/scripts/create_invoice_usd.js` — 创建以 USD 计价的闪电网络发票（自动订阅支付状态）
- `{baseDir}/scripts/check_invoice.js` — 查看发票支付状态（轮询）
- `{baseDir}/scripts/pay_invoice.js` — 支付 BOLT-11 发票（使用 BTC 或 USD 钱包）
- `{baseDir}/scripts/pay_lnaddress.js` — 向闪电网络地址付款（使用 BTC 或 USD 钱包）
- `{baseDir}/scripts/pay_lnurl.js` — 向 LNURL 字符串付款（使用 BTC 或 USD 钱包）
- `{baseDir}/scripts/fee_probe.js` — 估算支付手续费（使用 BTC 或 USD 钱包）
- `{baseDir}/scripts/qr_invoice.js` — 渲染发票二维码（终端 + PNG 文件）
- `{baseDir}/scripts/transactions.js` — 列出交易历史记录
- `{baseDir}/scripts/price.js` — 获取 BTC/USD 汇率
- `{baseDir}/scripts/account_info.js` — 显示账户信息和限额
- `{baseDir}/scripts/swap_quote.js` — 生成 BTC<->USD 兑换报价回执（试运行）
- `{baseDir}/scripts/swap_execute.js` — 执行钱包原生 BTC<->USD 兑换（或生成试运行回执）
- `{baseDir}/scripts/subscribe_invoice.js` — 订阅发票支付状态（独立运行）
- `{baseDir}/scripts/subscribe_updates.js` — 订阅实时账户更新