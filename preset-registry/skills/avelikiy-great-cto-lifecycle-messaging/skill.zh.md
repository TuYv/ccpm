---
name: lifecycle-messaging
description: Email/SMS lifecycle and deliverability framework for SMB Product-Builder products that send transactional or lifecycle messages (booking reminders, CRM sequences, receipts, win-back). Codifies provider selection (Resend/Postmark/Twilio/SendGrid), domain auth (SPF/DKIM/DMARC), consent and compliance (TCPA, CAN-SPAM, CASL, quiet hours, double opt-in), suppression-list discipline, and the transactional-vs-marketing split. Applied by integrations-engineer and senior-dev whenever a feature sends messages — so deliverability and consent are designed in, not bolted on after the first spam complaint.
when_to_use: |
  Apply when a feature sends email or SMS:
  - integrations-engineer designing a Twilio / email-provider integration
  - senior-dev implementing booking reminders, CRM sequences, receipts, or win-back
  - architect deciding the messaging provider + domain-auth setup for a crm/booking product
  Do NOT apply for purely in-app notifications with no email/SMS leg.
effort: medium
allowed-tools: Read, Write, Grep, Glob, WebFetch
paths:
  - "docs/integrations/**"
  - "docs/architecture/**"
---
# 生命周期消息传递——可送达、经同意、合规

消息无法送达（可送达性差），或未经同意就送达（违反 TCPA/
CAN-SPAM），对 SMB 产品而言都是致命的。本技能通过构造确保两者都正确。
**在首次发送之前，先设计好用户同意与可送达性方案。**

## 1. 事务性消息与营销消息——将二者分开

逐条判断消息属于哪一类；它们适用不同的规则，并且应使用不同的
发送身份（通常使用不同的子域名/服务提供商）：

| | 事务性消息 | 营销/生命周期消息 |
|---|---|---|
| 示例 | 收据、预订确认/提醒、密码重置 | 赢回用户、促销、新闻简报、培育步骤 |
| 同意 | 由交易行为隐含授权 | **必须明确选择加入** |
| 退订 | 不强制要求（但须执行 STOP） | **必须提供**，支持一键退订，并快速执行 |
| 发送域名 | `txn.` 子域名 | `mail.`/`news.` 子域名 |

绝不要因为“送达效果更好”就在事务性通道发送营销内容——
这正是导致事务性域名信誉受损的做法。

## 2. 服务提供商选择（选择一个并说明理由）

- **电子邮件**——Postmark（事务性邮件可送达性最佳，对营销邮件限制严格）、Resend
  （开发者体验优先，是不错的默认选择）、SendGrid（适合大规模发送）。默认：**事务性邮件使用 Resend**，
  仅当生命周期消息量达到一定规模时，再添加营销级 ESP。
- **SMS**——Twilio（消息服务 + 发送方号码池）或 Telnyx。为了支持扩展和故障转移，应使用 Messaging Service，
  而不是单个号码。对于美国的应用程序到个人 SMS，**必须**完成 A2P 10DLC 注册——
  在发送前注册品牌/活动。

## 3. 域名身份验证（电子邮件不可妥协的要求）

- **SPF**——在 DNS 中授权发送方 IP。
- **DKIM**——发布服务提供商的签名密钥；对消息进行签名。
- **DMARC**——从带有 rua 报告的 `p=none` 开始；完成对齐后，逐步提升至 `p=quarantine`→`p=reject`。
  如果没有 DMARC 对齐，生命周期邮件会进入垃圾邮件箱。
- 逐步预热新的发送域名；绝不要使用未经预热的域名进行大批量发送。

## 4. 同意 + 合规（以美国为先）

- **CAN-SPAM（电子邮件）**——提供有效的实体邮寄地址，确保 From/Subject 准确，提供可用的
  一键退订，并在 10 天内执行。
- **TCPA（SMS/语音）**——发送营销 SMS 前须获得事先明确的书面同意；自动处理 STOP/UNSTOP/
  HELP 关键词；遵守**静默时段**（按接收者当地时间，晚上 9 点至早上 8 点不得发送营销消息）。
  保留同意证明（时间戳、来源）。
- **CASL**（如果接收者位于加拿大）——明确选择加入 + 身份标识 + 退订机制。
- 对营销列表尽可能采用**双重确认加入**——这既能保护可送达性，也能证明已获得同意。

## 5. 严格执行抑制规则（可送达性的生命线）

维护一个统一的**抑制列表**，发送方在每次发送前都必须检查：
- 硬退信 → 永久抑制
- 垃圾邮件投诉（FBL）→ 抑制 + 调查
- 退订 / STOP → 立即针对相应通道进行抑制
- 未重新获得同意，绝不要从迁移数据中重新导入已被抑制的地址

忽略抑制规则进行发送，是被列入阻止名单的最快途径。

## 6. 可靠性模式

- 以领域事件为键实现幂等发送（针对预订 X 的提醒只发送一次，即使发生
  重试也是如此）——与 integrations-engineer 协调该键。
- 状态回调 / webhook 对账：记录已送达/已退回/失败；暴露
  失败，不要将其吞掉。
- 对生命周期消息实施速率限制并使用队列发送；绝不循环发送。
- 免打扰时段和时区根据**接收者的**区域设置计算，而不是服务器的。

## 输出

应用后，在集成契约
（`docs/integrations/INTEGRATE-{slug}.md`）中添加一个 **Messaging** 章节：

```
## Messaging
- channels: email <provider> / sms <provider>
- identities: txn = <subdomain>, marketing = <subdomain/ESP>
- domain auth: SPF/DKIM/DMARC plan = <state>
- consent: <implied/explicit per message type>; STOP/HELP = handled
- quiet hours: <recipient-local window>; 10DLC: <registered?>
- suppression: <store> checked pre-send
- idempotency key: <derivation>
```