---
name: email-best-practices
description: Use when building email features, emails going to spam, high bounce rates, setting up SPF/DKIM/DMARC authentication, implementing email capture, ensuring compliance (CAN-SPAM, GDPR, CASL), handling webhooks, retry logic, making emails accessible (alt text, headings, contrast, screen readers), or deciding transactional vs marketing.
license: MIT
metadata:
  author: Resend
  version: "1.0.2"
  homepage: https://resend.com/agent-skills
  source: https://github.com/resend/email-best-practices
  openclaw:
    links:
      repository: https://github.com/resend/email-best-practices
      documentation: https://resend.com/docs/email-best-practices-skill
---
# 邮件最佳实践

关于构建可送达、合规、用户友好的邮件的指南。

## 架构概览

```
[User] → [Email Form] → [Validation] → [Double Opt-In]
                                              ↓
                                    [Consent Recorded]
                                              ↓
[Suppression Check] ←──────────────[Ready to Send]
        ↓
[Idempotent Send + Retry] ──────→ [Email API]
                                       ↓
                              [Webhook Events]
                                       ↓
              ┌────────┬────────┬─────────────┐
              ↓        ↓        ↓             ↓
         Delivered  Bounced  Complained  Opened/Clicked
                       ↓        ↓
              [Suppression List Updated]
                       ↓
              [List Hygiene Jobs]
```

## 快速参考

| 需要做什么 | 参阅 |
|------------|-----|
| 设置 SPF/DKIM/DMARC，解决垃圾邮件问题 | [送达能力](./references/deliverability.md) |
| 构建密码重置、OTP、确认邮件 | [事务性邮件](./references/transactional-emails.md) |
| 规划应用需要哪些邮件 | [事务性邮件目录](./references/transactional-email-catalog.md) |
| 构建简报订阅、校验邮箱地址 | [邮件采集](./references/email-capture.md) |
| 发送简报、促销内容 | [营销邮件](./references/marketing-emails.md) |
| 确保 CAN-SPAM/GDPR/CASL 合规 | [合规](./references/compliance.md) |
| 区分事务性与营销邮件 | [邮件类型](./references/email-types.md) |
| 处理重试、幂等、错误 | [发送可靠性](./references/sending-reliability.md) |
| 处理投递事件、设置 webhook | [Webhook 与事件](./references/webhooks-events.md) |
| 管理退信、投诉、抑制名单 | [名单管理](./references/list-management.md) |
| 让邮件具备可访问性（屏幕阅读器、替代文本、对比度） | [无障碍](./references/accessibility.md) |

## 从这里开始

**新应用？**
先从[目录](./references/transactional-email-catalog.md)入手，规划你的应用需要哪些邮件（密码重置、验证等），然后在发送第一封邮件之前设置好[送达能力](./references/deliverability.md)（DNS 身份验证）。

**遇到垃圾邮件问题？**
先查看[送达能力](./references/deliverability.md)——身份验证问题是最常见的原因。Gmail/Yahoo 会拒收未经身份验证的邮件。

**要发送营销邮件？**
按以下路径进行：[邮件采集](./references/email-capture.md)（收集用户同意）→ [合规](./references/compliance.md)（法律要求）→ [营销邮件](./references/marketing-emails.md)（最佳实践）。

**要实现生产级发送？**
增加可靠性：[发送可靠性](./references/sending-reliability.md)（重试 + 幂等）→ [Webhook 与事件](./references/webhooks-events.md)（跟踪投递状态）→ [名单管理](./references/list-management.md)（处理退信）。

**无障碍问题？**
大多数邮件都通不过基础的无障碍检查。参阅[无障碍](./references/accessibility.md)了解 `lang`/`dir`、表现性表格、标题、替代文本、`<title>` 以及对比度相关内容。
