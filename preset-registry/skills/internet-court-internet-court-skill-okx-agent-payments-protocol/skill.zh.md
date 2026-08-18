---
name: okx-agent-payments-protocol
description: "Use when an agent hits HTTP 402 / payment-required, or the user mentions x402, x402Version, X-PAYMENT, PAYMENT-REQUIRED, PAYMENT-SIGNATURE, WWW-Authenticate: Payment, permit2, upto, metered billing, a payment channel / voucher / session, channelId / channel_id, opening / closing / topping up / settling / refunding a channel, a paymentId or a2a_ link, creating / checking a payment link, A2MCP / an A2MCP endpoint, or sending a request to / calling an Agent's endpoint with a concrete endpoint URL. Covers x402 (exact, exact+Permit2, upto, aggr_deferred), MPP (charge / session), and a2a-pay paymentId flows. Any close / topup / settle / voucher / refund near a channel_id or session is an MPP mid-session op. The full bilingual trigger list (including Chinese) lives in the skill body."
license: MIT
metadata:
  author: okx
  version: "4.2.1"
  homepage: "https://web3.okx.com"
---
# OKX Agent Payments Protocol（Dispatcher）

> **⚠️ 请先阅读：触发时零文本输出 + 绝不跳过用户确认门槛。**
>
> 从检测到 402（或任何触发词）到发出第一张面向用户的卡片之间——无论是步骤 A3.5 的推荐卡片，还是步骤 A4 的确认卡片——输出**零**条用户可见文本。不得输出“已收到 402”、“已触发 OKX Agent Payments Protocol”、“检测到 N 个方案”、枚举方案 / 网络 / 代币 / 金额、“正在加载 skill”等内容——任何语言均不得输出（任何其他语言中的对应表述同样禁止）。skill-load 工具调用可以运行，但不得附带任何周围说明文字。
>
> 每笔支付恰好运行**一张**确认卡片：A3.5 的推荐卡片（存在 2 个或更多候选项，且用户选择了 `yes`），或 A4 的确认卡片（只有一个候选项，或用户从 A3.5 展开的列表中选择了替代项）。不得以“过去的用户偏好”/“简化流程”/“之前已经确认过一次”为由跳过适用的卡片——这些偏好并不存在。不得连续渲染两张包含相同信息的卡片——在 A3.5.5 中用户选择 `yes` 后，直接进入步骤 A5。检测后的下一条用户可见文本**必须**是这两张卡片之一。

三条支付路径，根据 HTTP 特征区分：基于 **`accepts`** 的 402（v1 的正文中包含 challenge，或 v2 的 `PAYMENT-REQUIRED` header）、**`WWW-Authenticate: Payment`** 402（支持 channel，`intent="charge"` 或 `"session"`），以及 **a2a-pay**（基于 paymentId，不含 402）。以下是共享步骤（检测 → 解码 → 确认 → 钱包检查），然后分派到相应参考文档。

> **面向用户的术语——重要**
>
> **规则 1——始终称为“OKX Agent Payments Protocol”，并始终加粗显示。** 无论用户使用何种语言，在面向用户的消息中都必须使用准确的英文术语 **OKX Agent Payments Protocol**，并始终使用 Markdown 加粗（`**OKX Agent Payments Protocol**`），确保用户看到强调效果。即使在其他语言的句子中，也必须将其作为固定的英文名词短语。协议字面量和内部标识符仅限用于 CLI 调用、HTTP headers、JSON payloads 和代码中——绝不要向用户说出这些内容。
>
> **规则 2——不要描述内部协议检测过程。** 分派逻辑（检测到哪个 header、加载哪个 reference、选择了哪个 scheme/intent、TEE 路径还是 local-key 路径）属于内部信息——保持内部处理。用户只需要看到：(a) 要支付的内容，(b) 需要确认的事项，(c) 结果。
>
> **规则 2 例外——仅限替代方案列表。** 在步骤 A3.5 中，字面量 `exact` / `aggr_deferred` / `charge` 只能出现在展开的**替代方案列表**中（用户选择“显示其他选项”后渲染的列表），因为此时用户正在明确地在不同 scheme 之间进行选择。它们不得出现在：默认推荐卡片、“N other methods”摘要行、状态描述、错误显示、支付后摘要或其他任何位置。推荐卡片只显示网络 / 代币 / 金额 / 收款方——绝不显示 scheme 名称。
>
> **规则 3——外部定义的协议字面量必须逐字节保持准确。** JSON 字段 `x402Version`、HTTP headers `X-PAYMENT` / `PAYMENT-SIGNATURE` / `PAYMENT-REQUIRED` / `WWW-Authenticate: Payment`，以及 reference URL `https://x402.org`，凡协议/服务器要求出现的地方都必须原样呈现——这些内容由外部定义，修改后会破坏互操作性。CLI 子命令名称（`onchainos payment pay` / `pay-local` / `charge` / `session ...` / `a2a-pay ...`）属于本 CLI 自有的接口，可能会发生变化；在 CLI 调用和代码中使用其当前名称，但绝不要向用户说出这些名称（规则 2）。
>
> **示例**
>
> （英文）`Preparing a payment via the **OKX Agent Payments Protocol**. Here are the charge details — please confirm before I proceed…`
> 使用其他语言描述时，将这句引导语翻译成对应语言，但保留 **OKX Agent Payments Protocol** 这一加粗的英文名词短语。

> **进度叙述也属于面向用户的内容 — 规则 1-3 仍然适用。**
>
> 长流程（解码 → 确认 → 钱包检查 → 签名 → 重放）很容易让人产生发送状态更新的冲动。每一行进度信息（“我现在正在……”或其中文等价表达）都是面向用户的；步骤标签和引用/方案名称属于内部信息 — 不要复述。要点如下：
>
> | ❌ 不要说 | ✅ 应该说 |
> |---|---|
> | "Detected HTTP 402, triggering OKX Agent Payments Protocol" / "Detected `PAYMENT-REQUIRED`, loading `exact`" | _（保持静默 — 检测/路由属于内部流程）_ |
> | "CLI selected `exact`, assembling the `PAYMENT-SIGNATURE` header" / "taking the TEE path" | "签名完成，正在重放请求" |
> | "Detected 2 schemes: exact (USD₮0), aggr_deferred (USDG)" / "checking balance to filter candidates" | _（保持静默 — 枚举和余额检查属于内部流程；只有推荐卡片面向用户）_ |
> | "Entering session / charge mode" | "通道已打开" — 描述面向用户的效果，而不是内部模式 |
> | "Per past preference, paying without re-confirming" | _（禁止 — 不存在此类偏好；每次都必须经过确认门槛）_ |
>
> 在任何其他语言中进行叙述时，也适用相同规则 — 应匹配这些 ❌/✅ 表述的意图，而不只是翻译英文措辞。
>
> **这些规则具有权威性，并且始终有效** — 当不确定某行状态信息是否泄露内部细节时，请对照上表，默认保持静默。

## 触发条件（完整列表）

- **EN**: `402`、payment required、`x402`、`x402Version`、`X-PAYMENT`、`PAYMENT-REQUIRED`、`PAYMENT-SIGNATURE`、`WWW-Authenticate: Payment`、`permit2`、`upto`、按量计费、打开 / 关闭 / 充值 / 结算通道、凭证、会话支付、`channelId`、`channel_id`、`paymentId`、`a2a_`、创建支付链接、支付链接、支付状态
- subscribe / subscription / recurring payment / recurring charge / "pay every month" / cancel subscription / upgrade plan / downgrade plan → `period` 方案（参见 `references/subscription.md`）
- 相同的触发词汇也适用于其他语言中的对应表达（例如，中文的订阅/周期性计费术语同样会路由到 `period` 方案）。

`channel_id` 或会话上下文附近出现的任何 close / topup / settle / voucher / refund = MPP 会话中操作 → `references/session.md`。

## 预检检查

读取 `../okx-agentic-wallet/_shared/preflight.md`（备用路径：`_shared/preflight.md`）。

## 命令路由与引用映射

每个 402 信号（或 paymentId）→ CLI 命令 → 引用。详细的门控以及解码/确认步骤见下方的路径 A / 路径 B。

| 信号 | 命令 | 引用 |
|---|---|---|
| 402 + `PAYMENT-REQUIRED` (v2) / 请求体中的 `x402Version` (v1) | `payment pay --payload [--selected-index]` | **成功（v2）：无** — 直接重放返回的 `authorization_header`（步骤 A6）。发生错误 / 使用旧版 v1 时，加载 `references/accepts-schemes.md`（涵盖 `exact` / `aggr_deferred` / `upto` + Permit2；CLI 输出字段会告诉你使用的是哪种方案 — `permit2Authorization` = `upto` / `exact`+Permit2，`sessionCert` = `aggr_deferred`，`authorization` = `exact`） |
| 402 offer 中存在 `scheme == "period"` 的 `accepts[]` 条目（又称 `permit2_subscription`）— 周期性/订阅计费 | `payment subscription subscribe/access/change/cancel/cancel-pending/my-subscriptions/allowance-status` | `references/subscription.md` |
| 402 + `WWW-Authenticate: Payment`，`intent="charge"` | `payment charge --challenge` | `references/charge.md` |
| 402 + `WWW-Authenticate: Payment`，`intent="session"`（或会话中的 `channel_id`） | `payment session open/voucher/topup/close` | `references/session.md` |
| paymentId / `a2a_…` 链接 / 创建或检查支付链接 | `payment a2a-pay create/pay/status` | `references/a2a_charge.md` |

> **不要在成功路径上加载参考文档。** 当 `onchainos payment pay` 返回 `authorization_header` 时（x402 v2，即正常的 `exact` / `aggr_deferred` / `upto` 结果），按照步骤 A6 直接重放请求，完全跳过 `references/accepts-schemes.md`。仅在**失败 / 旧版**路径上加载它：`Permit2 allowance insufficient` → `references/accepts-schemes.md`（一次性 approve），或旧版 x402 v1 原始 proof → 其 `"Legacy: x402 v1"` 部分。`charge` / `session` / `a2a_charge` 始终需要加载——这些是多阶段流程。

> **会话中途的操作**（在存在活动 `channel_id` 的情况下进行 close / topup / settle / voucher / refund，无论是否有新的 402）→ 留在此处，直接跳转到 `references/session.md` 中对应的阶段。**不要**搜索单独的 `close-channel` / `topup-channel` / `settle-channel` 工具——它们都是 `onchainos payment session ...` 子命令。

---

# 路径 A：HTTP 402

## 步骤 A1：从原始响应开始

你已经拥有原始 HTTP 响应。如果它**不是 402**，直接返回响应正文。否则 → 步骤 A2。

**捕获用户提示中提供的任何请求参数**（例如“旧金山的天气” → `city=San Francisco`、`token=0x…`；“翻译成中文” → `lang=zh`）。将每一项记录为 `name → value`，用于步骤 A3-Params 计划——这里给出的值**绝不重新询问**，只需显示在确认卡片中。即使第一次请求不需要这些参数，也要保留它们；卖方可能会在付费重放时要求这些参数。

## 步骤 A2：检测协议

```
Priority 1: response.headers['WWW-Authenticate']
  starts with "Payment "        → continue at Step A3-WWW-Authenticate
Priority 2: response.headers['PAYMENT-REQUIRED']
  base64-encoded JSON           → continue at Step A3-Accepts (v2)
Priority 3: response body JSON has "x402Version"
                                → continue at Step A3-Accepts (v1)
Otherwise                       → not a supported payment protocol, stop
```

**两个指示器同时存在**时——根据 WWW-Authenticate 的意图进行分支：

- `intent="session"` 与基于 `accepts` 的选项同时提供 → 停止并询问用户：
  > 服务器通过 **OKX Agent Payments Protocol** 提供两种支付方式：
  > 1. **Session（多请求）**——打开通道，并为每个请求签发 voucher
  > 2. **一次性购买**
  >
  > 你希望使用哪一种？

  选择选项 1 → 继续步骤 A3-WWW-Authenticate（session 路径）。选择选项 2 → 忽略 session 意图，继续步骤 A3-Accepts，并使用 accepts 选项。

- `intent="charge"` 与基于 `accepts` 的选项同时提供 → 所有选项都是一次性的；**不要**显示 session 与一次性支付之间的提示。解码两类协议（步骤 A3-Accepts 和步骤 A3-WWW-Authenticate），合并候选项，并交由步骤 A3.5 处理推荐。

## 步骤 A3-Accepts：解码

**自行**解码 402 载荷，仅用于**显示和推荐**——不要执行 CLI 往返：

```
raw_402 = response.headers['PAYMENT-REQUIRED']   // v2 (base64-encoded JSON)
       or response.body                          // v1 (already plain JSON)

decoded = JSON.parse(atob(raw_402))              // v2; for v1 it's already JSON: JSON.parse(response.body)
```

提取以供显示：

```
accepts = decoded.accepts
option  = decoded.accepts[0]       // for display only
```

**原样保留 `raw_402`** —— Step A6 会将其直接传递给 `onchainos payment pay --payload`（CLI 会重新解码并签名）。本地解码仅用于显示；绝不要重新编码或组装任何内容。

## Step A3-WWW-Authenticate：解码

解析 WWW-Authenticate header：

```
Payment id="...", realm="...", method="evm", intent="...", request="<base64url>", expires="..."
```

对 `request` 进行 base64url 解码以获取 JSON body。保存：

```
intent              charge | session
amount              base units string (e.g. "1000000")
currency            ERC-20 contract address
recipient           merchant payee address
methodDetails:
  chainId           EVM chain ID (e.g. 196 for X Layer)
  escrowContract    REQUIRED for session, ABSENT for charge
  feePayer          true (transaction mode) | false (hash mode)
  splits            optional, charge only, max 10 entries
  minVoucherDelta   optional, session only
  channelId         optional, session topUp/voucher only — pre-existing channel
suggestedDeposit    optional, session only — suggested initial deposit
unitType            optional — "request" | "second" | "byte" etc.
```

**方法检查** —— 此处仅支持 `method="evm"`。如果 `method` 是 `"tempo"`、`"svm"`、`"stripe"` 等 → 停止并告知用户此 dispatcher 无法处理它。

**Challenge 过期** —— 如果 `expires=...`（ISO-8601）已过期，则 challenge 已失效：重新发送原始请求，以便在签名之前获取新的 402。过期的 challenge 会失败并返回 `30001 incorrect params`。

将 `amount` 从 base units 转换为人类可读格式（参见 `_shared/amount-display.md`）。

## Step A3-Params：构建请求参数计划

> 在 Step A3 解码之后、任何确认卡片之前运行。除了支付条款之外，seller 还可以声明 **paid replay** 必须携带哪些参数以及如何携带。构建一个 **param plan**，让用户在确认支付的同时确认参数，并正确地将这些参数附加到 replay 中。

param plan 是由 `{ name, value, carrier, required, source }` 组成的列表，`carrier ∈ {query, body, header, path}`。没有 seller 声明的参数，且用户也没有指定参数 → **空计划**；replay 保持不变。

### 来源 1 —— Bazaar `outputSchema.input`（首选）

如果已解码的 402（或任意 `accepts[i]`）携带 `outputSchema.input`，则解析它：

| 字段 | 用途 |
|---|---|
| `input.type` | `"http"` → 在此处处理。`"mcp"` → 超出范围，跳过参数组装。 |
| `input.method` | replay 使用的方法（可能与原始方法不同）。`GET`/`HEAD`/`DELETE` → 参数放入 **query**；`POST`/`PUT`/`PATCH` → 放入 **body**（`input.bodyType`：`json`/`form-data`/`text`）。 |
| `input.queryParams` / `input.body` / `input.pathParams` / `input.headers` | 对应 carrier（query / body / path / header）的参数。 |

JSON Schema 的 `properties` + `required` 可提供每个参数的类型以及该参数是否为必需参数。每个声明的参数对应一个计划条目。

### 来源 2 —— 非 Bazaar（保守处理）

没有 `outputSchema.input` → **仅在卖方明确发出信号时**添加参数；**绝不自行臆造参数**：

- 响应**正文**列出要求（`required` / `params` / `parameters` / `fields` / `inputSchema`），或
- **错误消息**指出缺少某个参数（例如 `missing required query param "city"`），或
- 文档说明的响应**标头**要求提供某个参数。

存在歧义 → 不添加任何内容，原样重放。

### 填充值

对于每个条目，解析 `value`：(1) 用户的提示（步骤 A1）→ `source=prompt`，不要再次询问；(2) 对话上下文 → `source=context`；(3) 仍然缺失**且为必填** → 询问用户，将所有缺失项合并为一个问题（这是合法的门控操作，而非旁白 — ZERO-TEXT-ON-TRIGGER 不禁止此操作）。可选项 + 无法解析 → 丢弃。

## 步骤 A3.5：多方案推荐（适用时）

**仅当**合并后的候选池包含 `{exact, aggr_deferred, charge, period}` 中的 **2 个或更多**时适用。否则直接跳到步骤 A4，并使用唯一可用的候选项。

> 当 402 `accepts[]` 包含 `{exact, aggr_deferred, charge, period}` 中的 2 个或更多时，加载 `references/multi-scheme.md`。将 `period` 视为周期性计费选项：仅当用户意图是持续订阅，而不是单次调用时，才推荐该选项。

适用时 → **加载 `references/multi-scheme.md`**并从头到尾遵循其中的流程。它会返回**选定的候选项**，并告知你从哪里继续：步骤 A4（用户选择了替代方案），或直接跳到步骤 A6（用户用 `yes` 接受了方案 — A5 的钱包检查已经满足）。

## 步骤 A4：显示支付详情并停止

**🟢 如果**用户在 A3.5.5 中用 `yes` 接受了推荐方案（卡片已经显示网络 / 代币 / 金额 / 收款方），则完全跳过此步骤。直接进入步骤 A5（如果 A3.5.2 已处理登录，则此处为空操作）→ A6。

**🔴 如果满足以下任一条件，则正常执行此步骤：**
- 步骤 A3.5 未运行（单候选路径），或
- 用户从 A3.5 的展开列表中选择了替代方案（所选候选项仍需要完整详情确认）。

**⚠️ 强制要求（执行此步骤时）：显示详情并停止，等待用户明确确认。在用户确认之前，不得调用 `onchainos wallet status` 或任何其他工具。**

对于基于 `accepts` 的 402（`PAYMENT-REQUIRED` 标头 v2 / `x402Version` 正文 v1）：

> 此资源需要通过 **OKX Agent Payments Protocol** 付款：
> - **网络**：`<chain name>`（`<option.network>`）
> - **代币**：`<token symbol>`（`<option.asset>`）
> - **金额**：`<human-readable amount>`（v2 使用 `option.amount`，v1 使用 `option.maxAmountRequired`；使用代币小数位数将其从最小单位转换为人类可读金额）
> - **付款至**：`<option.payTo>`
> - **请求参数**（如果步骤 A3-Params 计划为空，则完全省略此行）：每个参数一行，格式为 `<name> = <value>` → `<carrier: query | body | header | path>`
>
> 是否继续付款？（yes / no）

对于 `WWW-Authenticate: Payment` 402：

> 此资源需要通过 **OKX Agent Payments Protocol** 付款：
> - **付款类型**：`<one-shot payment | session (multiple requests)>`（渲染为“单次付款”/“会话（多次请求）” — 绝不要使用“单次购买”；翻译成其他语言时也要保持相同的区分）
> - **网络**：`<chain name>`（`eip155:<chainId>`）
> - **代币**：`<symbol>`（`<currency address>`）
> - **每次请求的金额**：`<human-readable>`（原子单位：`<amount>`）
> - **付款至**：`<recipient>`
> - **由谁支付 Gas**：`<server (transaction mode) | you broadcast it yourself (hash mode)>`
> - **分成收款方**（仅限单次付款，如存在）：`<N other parties also receive a share>`
> - **建议的预充值余额**（仅限会话，如存在）：`<human-readable>`
> - **请求参数**（如果步骤 A3-Params 计划为空，则完全省略此行）：每个参数一行，格式为 `<name> = <value>` → `<carrier: query | body | header | path>`
>
> 是否继续付款？（yes / no）

- **用户确认** → 步骤 A5。
- **用户拒绝** → 停止。不进行支付，也不检查钱包。

## 步骤 A5：检查钱包状态（仅在用户明确确认后）

```bash
onchainos wallet status
```

- **已登录** → 步骤 A6。
- **未登录（基于 `accepts` 的路径）** → 请用户在以下两种方式中选择一种：(1) 钱包登录（TEE 签名）；或 (2) 本地私钥（`onchainos payment pay-local`，支持 `exact + EIP-3009`、`exact + Permit2` 和 `upto` ——不支持 `aggr_deferred`，需要 TEE 会话密钥）。在用户做出选择之前，不要读取文件或检查环境变量。
- **未登录（`WWW-Authenticate: Payment` 路径）** → 请用户通过电子邮件 OTP 或 AK 登录。**仅支持 TEE ——此路径不提供本地密钥回退方案**（只有基于 `accepts` 的路径提供该方案）。

## 步骤 A6：交由 scheme/intent 参考文档处理

| 路径 | 操作 |
|---|---|
| **基于 `accepts`**（`PAYMENT-REQUIRED` header v2 / `x402Version` body v1） | 运行 `onchainos payment pay --payload '<raw_402 from Step A3>'`。如果执行了步骤 A3.5 且用户选择了一个基于 accepts 的候选项，则添加 `--selected-index <index in decoded.accepts>`，这样 CLI 会准确地为该条目签名；如果只有一个候选项，则省略该参数（CLI 会自动选择）。CLI 会进行解码、使用所选账户签名，并返回 `{authorization_header, header_name, scheme, wallet}` —— **不得手动组装**。<br>**成功（正常路径）** — 存在 `authorization_header` → 直接进入下方的重放步骤；不要加载任何 scheme 参考文档。<br>如果用户选择了本地密钥回退方案，则改为运行 `onchainos payment pay-local --payload '<raw_402>'`（成功规则相同；支持 `exact + EIP-3009`、`exact + Permit2` 和 `upto` —— `aggr_deferred` 仅支持 TEE）。<br>**`Permit2 allowance insufficient` 错误**（`upto` / `exact`+permit2，首次支付该代币时）→ 加载 **`references/accepts-schemes.md`**，执行一次性 approve，然后重试支付。<br>**Legacy v1** — CLI 返回原始 proof（`signature`+`authorization`，不包含 `authorization_header`）→ 加载 **`references/accepts-schemes.md`**，按照其中的 "Legacy: x402 v1" 部分组装 `X-PAYMENT` header。 |
| `period`（订阅 / `permit2_subscription`） | 在 "Decide operation" 处加载 **`references/subscription.md`**（订阅 vs 访问 vs 更改 vs 取消）。首次提供 → `payment subscription subscribe`；资源已激活 → `payment subscription access`（不得重新订阅）；升级/降级 → `change`；拆除 → `cancel` / `cancel-pending`。 |
| **`WWW-Authenticate: Payment`、`intent="charge"`** | 在 "Decide mode" 处加载 **`references/charge.md`**。 |
| **`WWW-Authenticate: Payment`、`intent="session"`** | 在 "Phase S1: Open Channel" 处加载 **`references/session.md`**（如果用户正处于具有活动 `channel_id` 的会话中，则跳转到 S2 / S2b / S3）。 |

**重放（成功路径 ——无需参考文档）：**使用返回的 header 重新发送原始请求（`<header_name>: <authorization_header>`，或者对于 legacy v1，使用你组装的 `X-PAYMENT`），预期得到 `HTTP 200`，并在本地解码任何 `PAYMENT-RESPONSE` header（`echo '<value>' | base64 -d | jq .`），以读取 `status` / `transaction` / `amount` / `payer`。向用户展示结算详情；以对话方式建议后续操作——不要暴露内部字段名或 skill ID。

---

# 路径 B：a2a-pay（基于 paymentId，无 402）

用户会通过明确提及 `paymentId` / `a2a_...` 链接、要求“创建支付链接”，或要求查询 a2a 支付状态来调用此路径。

## 步骤 B1：识别角色

| 用户说…… | 加载 | 角色 |
|---|---|---|
| “create payment link” / “generate payment” / `--amount`/`--recipient` | `references/a2a_charge.md` → “Seller — Create” | 卖方 |
| 提供要支付的 `paymentId` / `a2a_...` | `references/a2a_charge.md` → “Buyer — Pay” | 买方 |
| 提供 `paymentId` 并询问状态 | `references/a2a_charge.md` → “Status — Query” | 任一方 |

如果用户只说“I want to pay”，但没有提供 paymentId — 停止操作，并要求用户提供卖方签发的 paymentId。不要尝试其他操作。

## 步骤 B2：钱包状态

`create` 和 `pay` 都需要有效的钱包会话。运行 `onchainos wallet status`：

- **已登录** → 继续（加载参考文档并遵循其中说明）。
- **未登录** → 要求用户通过 `onchainos wallet login` 或 `onchainos wallet login <email>` 登录。**不要在没有有效会话的情况下签名。**

## 步骤 B3：交接给 `references/a2a_charge.md`

该参考文档包含完整的 create/pay/status 流程（包括自动轮询和信任委托说明）。买方侧的信任已委托给上游 — 买方按照服务器端 challenge 声明的内容进行签名。

---

# 跨流程说明

## 读取卖方错误（`WWW-Authenticate: Payment` / a2a-pay）

当卖方拒绝请求时，不要显示原始 JSON，也不要只显示数字代码。按照以下优先级提取人类可读的解释，使用第一个非空匹配项：

1. `body.reason`（mppx、OKX TS Session）
2. `body.detail`（RFC 9457 ProblemDetails）
3. `body.message`
4. `body.msg`（OKX SA API）
5. `body.error`
6. `body.title`（RFC 9457 简短标题 — 仅作为后备）
7. 兜底 — 格式化整个 body，并添加 HTTP 状态码

格式：

> ❌ 卖方拒绝了请求：`<reason text>`（代码 `<code if present>`，HTTP `<status>`）

## 金额显示

面向用户显示的所有金额都必须同时包含人类可读形式和原子单位形式：`<human> (<atomic>)`，例如 `0.0004 USDC (400)`。小数位数表和未知符号的后备处理 → `_shared/amount-display.md`。

## 建议后续步骤

成功完成支付并收到响应后，以自然对话的方式建议：

| 刚完成的操作 | 建议 |
|---|---|
| 成功的 HTTP 402 重放 | 通过 `okx-agentic-wallet` 检查余额变化；或向同一资源发起另一个请求 |
| 成功的 a2a 支付 | 通过 `okx-agentic-wallet` 验证支付后的余额 |
| 重放时出现 402（已过期） | 使用新签名重试 |
| 通道会话进行中 | 下一次请求到达时签发另一个 voucher；完成后关闭通道 |