---
name: integrations
description: "Use this skill when the user needs to connect third-party services, set up APIs, add OAuth, configure webhooks, or integrate tools like Slack, Zapier, email providers, or payment processors. Covers API integration patterns, auth flows, webhook handling, and building integrations that non-technical founders can maintain."
---
# 第三方集成

最简单且能用的集成就是最好的集成。如果 Zapier 能做到，就不要自己定制开发。本技能帮助你决定该构建哪些集成、如何以简单的方式构建它们，以及如何处理不可避免的故障。

## 核心原则

- 构建客户要求的集成，而不是你认为很酷的集成。
- 最简单且能用的集成就是最好的集成。先用 Zapier，再考虑定制代码。
- 每个集成都是一种维护负担。任何集成都可能因第三方更改其 API 而失效。
- 身份验证是最难的部分。要么正确实现 OAuth，要么使用现成的库。
- 始终处理失败情况。API 会宕机，Webhook 会丢失。为此做好规划。

## 集成决策框架

### 自建 vs. 购买 vs. 跳过

```
Should I build this integration?

1. Are 3+ customers asking for it?
   No → Skip it. Revisit when demand exists.
   Yes ↓

2. Can Zapier/Make/n8n handle it?
   Yes → Tell users to use Zapier. Don't build it yourself.
   No ↓

3. Is there a well-documented API with a good SDK?
   Yes → Build it (or have AI build it).
   No → Evaluate if the effort is worth the churn it prevents.
```

### SaaS 的集成优先级

**优先构建这些（大多数 SaaS 应用都需要）：**

| 集成 | 原因 | 难度 |
|-------------|-----|-----------|
| Stripe | 支付是你业务的核心 | 中等（文档和 SDK 都不错） |
| 邮件服务商（Resend、SendGrid） | 事务性邮件必不可少 | 简单 |
| 认证服务商（Supabase Auth、Clerk） | 登录功能必不可少 | 简单（使用其 SDK） |
| 分析工具（PostHog、Mixpanel） | 你需要跟踪使用情况 | 简单（嵌入脚本即可） |

**客户提出需求时再构建这些：**

| 集成 | 原因 | 难度 |
|-------------|-----|-----------|
| Slack | 在团队已经在用的地方发送通知 | 简单 |
| Zapier | 让用户自行构建集成 | 中等 |
| Google/Microsoft OAuth | “使用 Google 登录”是用户所期望的 | 中等 |
| Webhook（出站） | 让客户在自己的系统中接收事件 | 中等 |

**在 MRR 达到 $10k+ 之前先跳过这些：**

| 集成 | 为什么要等 |
|-------------|------------|
| Salesforce | API 复杂，而需要它的客户成单周期很长 |
| 定制企业级 SSO（SAML） | 只有企业级订单才需要 |
| 数据仓库导出 | 等你有了数据量大的客户再构建 |

---

## 常见集成模式

### 模式 1：OAuth 登录（Google、GitHub 等）

**作用：** 让用户使用现有账号登录。

**告诉 AI：**
```
Add Google OAuth sign-in to my app.
I'm using [Supabase Auth / Clerk / NextAuth].
Requirements:
- "Sign in with Google" button on login page
- Create user record on first sign-in
- Link to existing account if email matches
- Handle the error case gracefully
```

**设置清单：**
```
- [ ] Create OAuth app in provider's developer console
- [ ] Set redirect URI to your production AND localhost URLs
- [ ] Store client ID and secret in environment variables (never in code)
- [ ] Test the full flow: sign in → callback → user created
- [ ] Test edge case: user signs up with email, then tries Google with same email
```

### 模式 2：发送邮件（事务性）

**作用：** 欢迎邮件、密码重置、通知。

**推荐的服务商：**
- **Resend** — API 简单，免费额度不错，为开发者打造
- **SendGrid** — 老牌服务商，功能更多，免费额度更高
- **Postmark** — 送达率最佳，专注于事务性邮件

**告诉 AI：**
```
Set up transactional email with [Resend/SendGrid] for my [framework] app.
I need to send:
- Welcome email on signup
- Password reset email
- [Other emails you need]
Use environment variables for API keys.
Include error handling if the email fails to send.
```

### 模式 3：Webhook（接收）

**作用：** 第三方服务在发生某些事件时通知你的应用（例如 Stripe 支付成功）。

**告诉 AI：**
```
Create a webhook endpoint for [Stripe/service] in my [framework] app.
Requirements:
- Verify the webhook signature (critical for security)
- Handle these events: [list events, e.g., checkout.session.completed]
- Respond with 200 quickly, process async if needed
- Log the raw payload for debugging
- Handle duplicate events (idempotency)
```

**Webhook 清单：**
```
- [ ] Endpoint URL is configured in the third party's dashboard
- [ ] Webhook signature is verified on every request
- [ ] Endpoint responds with 200 within 5 seconds
- [ ] Failed processing retries gracefully
- [ ] Events are idempotent (processing the same event twice is safe)
- [ ] Raw payloads are logged for debugging
```

### 模式 4：Webhook（发送）

**作用：** 你的应用在发生某些事件时通知客户的系统。

**告诉 AI：**
```
Add outgoing webhooks to my app so customers can receive events.
Requirements:
- Customers can register a webhook URL in settings
- Send POST requests with JSON payload when [events] occur
- Include a signature header for verification
- Retry failed deliveries 3 times with exponential backoff
- Show delivery status in the customer's dashboard
```

### 模式 5：Zapier 集成

**作用：** 让你的客户把你的应用连接到 5000 多个其他应用，而无需你逐一构建集成。

**何时构建：** 当多个客户要求的集成你不想单独构建时。

**告诉 AI：**
```
Help me plan a Zapier integration for [product].
My app can:
- Triggers (things that happen): [e.g., new project created, task completed]
- Actions (things Zapier can do in my app): [e.g., create a task, update a record]
What API endpoints do I need to expose for Zapier?
```

---

## API 密钥管理

### 你自己的 API 密钥（用于连接服务）

```
Rules:
- [ ] NEVER put API keys in code. Use environment variables.
- [ ] Different keys for development and production.
- [ ] Rotate keys if you accidentally commit one (immediately).
- [ ] Document which keys are needed in a .env.example file.
- [ ] Use the narrowest permissions possible for each key.
```

### 客户的 API 密钥（如果你对外提供 API）

```
- [ ] Generate unique keys per customer
- [ ] Allow customers to revoke and regenerate keys
- [ ] Rate limit by API key
- [ ] Log usage by API key
- [ ] Hash stored keys (don't store in plain text)
```

---

## 集成的错误处理

每个集成迟早都会出故障。为此做好规划：

```
Integration Error Handling Checklist:
- [ ] What happens if the API is down? (Queue and retry? Show error to user?)
- [ ] What happens if auth credentials expire? (Re-auth flow? Alert the user?)
- [ ] What happens if the API returns unexpected data? (Log and fail gracefully?)
- [ ] What happens if rate limits are hit? (Backoff and retry? Queue?)
- [ ] Is there a timeout? (Don't wait forever for a response)
- [ ] Are errors logged with enough context to debug?
```

---

## 常见错误

| 错误 | 解决方法 |
|---------|-----|
| 构建没人要求的定制集成 | 等有 3 个以上客户提出需求再构建 |
| 把 API 密钥写在源代码里 | 永远使用环境变量 |
| 不验证 Webhook 签名 | 验证每一个传入的 Webhook。不验证 = 安全漏洞 |
| API 调用没有错误处理 | 每个外部调用都需要 try/catch 和兜底方案 |
| 构建 Zapier 已能实现的功能 | 向客户推荐 Zapier。只构建 Zapier 做不到的部分 |
| 失败的 Webhook 没有重试逻辑 | 使用指数退避重试 3 次 |
| 只测试正常流程 | 测试：API 宕机、凭证错误、触发限流、超时 |

---

## 成功是什么样子

- 核心集成（支付、邮件、认证）在生产环境中可靠运行
- 第三方 API 密钥安全地存储在环境变量中
- Webhook 端点经过验证、幂等且有日志记录
- 客户能够连接他们需要的工具（直接连接或通过 Zapier）
- 借助完善的日志，你能快速调试集成故障

---

## 相关技能

- **build** — 把集成规格说明交给 AI 工具去实现
- **database** — 用于存储集成数据的模式设计
- **secure** — API 密钥的安全存储与 OAuth 实现
- **debug** — 诊断集成故障
