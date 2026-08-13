---
name: agentmail
description: Email infrastructure for AI agents. Create accounts, send/receive emails, manage webhooks, and check karma balance via the AgentMail API.
risk: safe
source: community
---
# AgentMail — 面向 AI 代理的邮件服务

AgentMail 为 AI 代理提供真实的电子邮件地址（`@theagentmail.net`）和 REST API。代理可以发送和接收邮件、注册服务（GitHub、AWS、Slack 等）以及获取验证码。karma 系统可防止垃圾邮件，并保持共享域名的高信誉度。

基础 URL：`https://api.theagentmail.net`

## 何时使用
- AI 代理需要一个真实的收件箱/发件箱来完成注册、验证码流程或事务型通信。
- 你需要创建 AgentMail 账号、发送消息、读取收件箱内容，或注册入站 Webhook。
- 你需要监控 karma 使用情况，或将邮件事件接入代理自动化流程。

## 快速上手

所有请求都需要 `Authorization: Bearer am_...` 头（来自控制台的 API key）。

### 创建邮箱账号（消耗 10 karma）

```bash
curl -X POST https://api.theagentmail.net/v1/accounts \
  -H "Authorization: Bearer am_..." \
  -H "Content-Type: application/json" \
  -d '{"address": "my-agent@theagentmail.net"}'
```

响应：`{"data": {"id": "...", "address": "my-agent@theagentmail.net", "displayName": null, "createdAt": 123}}`

### 发送邮件（消耗 1 karma）

```bash
curl -X POST https://api.theagentmail.net/v1/accounts/{accountId}/messages \
  -H "Authorization: Bearer am_..." \
  -H "Content-Type: application/json" \
  -d '{
    "to": ["recipient@example.com"],
    "subject": "Hello from my agent",
    "text": "Plain text body",
    "html": "<p>Optional HTML body</p>"
  }'
```

可选字段：`cc`、`bcc`（字符串数组）、`inReplyTo`、`references`（用于线程的字符串）、`attachments`（`{filename, contentType, content}` 数组，其中 content 为 base64 编码）。

### 读取收件箱

```bash
# List messages
curl https://api.theagentmail.net/v1/accounts/{accountId}/messages \
  -H "Authorization: Bearer am_..."

# Get full message (with body and attachments)
curl https://api.theagentmail.net/v1/accounts/{accountId}/messages/{messageId} \
  -H "Authorization: Bearer am_..."
```

### 检查 karma

```bash
curl https://api.theagentmail.net/v1/karma \
  -H "Authorization: Bearer am_..."
```

响应：`{"data": {"balance": 90, "events": [...]}}`

### 注册 Webhook（实时入站）

```bash
curl -X POST https://api.theagentmail.net/v1/accounts/{accountId}/webhooks \
  -H "Authorization: Bearer am_..." \
  -H "Content-Type: application/json" \
  -d '{"url": "https://my-agent.example.com/inbox"}'
```

Webhook 回调包含两个安全头：
- `X-AgentMail-Signature` —— 请求体的 HMAC-SHA256 十六进制摘要，使用 Webhook secret 签名
- `X-AgentMail-Timestamp` —— 发送回调时的毫秒级时间戳

验证签名并拒绝时间戳早于 5 分钟的请求，以防重放攻击：

```typescript
import { createHmac } from "crypto";

const verifyWebhook = (body: string, signature: string, timestamp: string, secret: string) => {
  if (Date.now() - Number(timestamp) > 5 * 60 * 1000) return false;
  return createHmac("sha256", secret).update(body).digest("hex") === signature;
};
```

### 下载附件

```bash
curl https://api.theagentmail.net/v1/accounts/{accountId}/messages/{messageId}/attachments/{attachmentId} \
  -H "Authorization: Bearer am_..."
```

返回 `{"data": {"url": "https://signed-download-url..."}}`。

## 完整 API 参考

| Method | Path | Description | Karma |
|--------|------|-------------|-------|
| POST | `/v1/accounts` | 创建邮箱账号 | -10 |
| GET | `/v1/accounts` | 列出所有账号 | |
| GET | `/v1/accounts/:id` | 获取账号详情 | |
| DELETE | `/v1/accounts/:id` | 删除账号 | +10 |
| POST | `/v1/accounts/:id/messages` | 发送邮件 | -1 |
| GET | `/v1/accounts/:id/messages` | 列出消息 | |
| GET | `/v1/accounts/:id/messages/:msgId` | 获取完整消息 | |
| GET | `/v1/accounts/:id/messages/:msgId/attachments/:attId` | 获取附件链接 | |
| POST | `/v1/accounts/:id/webhooks` | 注册 Webhook | |
| GET | `/v1/accounts/:id/webhooks` | 列出 Webhook | |
| DELETE | `/v1/accounts/:id/webhooks/:whId` | 删除 Webhook | |
| GET | `/v1/karma` | 获取余额与事件 | |

## Karma 机制

每个操作都有 karma 消耗或奖励：

| Event | Karma | Why |
|---|---|---|
| `money_paid` | +100 | 充值购买积分 |
| `email_received` | +2 | 来自受信任域名的回复 |
| `account_deleted` | +10 | 删除地址时返还 karma |
| `email_sent` | -1 | 发送邮件会消耗 karma |
| `account_created` | -10 | 创建地址会消耗 karma |

**重要规则：**
- 仅会为来自受信任服务商（Gmail、Outlook、Yahoo、iCloud、ProtonMail、Fastmail、Hey 等）的入站邮件奖励 karma。来自未知/一次性域名的邮件不会获得 karma。
- 每个发件人仅在你回复前奖励一次 karma；若发件人 X 在未回复的情况下连续发 5 封邮件，仅首封奖励 karma。回复 X 后，下一封来自 X 的邮件才会再次奖励 karma。
- 删除账号将退还创建账号时消耗的 10 karma。

当 karma 降到 0 时，发送邮件和创建账号会返回 HTTP 402。请在执行会消耗 karma 的操作前始终先检查余额。

## TypeScript SDK

```typescript
import { createClient } from "@agentmail/sdk";

const mail = createClient({ apiKey: "am_..." });

// Create account
const account = await mail.accounts.create({
  address: "my-agent@theagentmail.net",
});

// Send email
await mail.messages.send(account.id, {
  to: ["human@example.com"],
  subject: "Hello",
  text: "Sent by an AI agent.",
});

// Read inbox
const messages = await mail.messages.list(account.id);
const detail = await mail.messages.get(account.id, messages[0].id);

// Attachments
const att = await mail.attachments.getUrl(accountId, messageId, attachmentId);
// att.url is a signed download URL

// Webhooks
await mail.webhooks.create(account.id, {
  url: "https://my-agent.example.com/inbox",
});

// Karma
const karma = await mail.karma.getBalance();
console.log(karma.balance);
```

## 错误处理

```typescript
import { AgentMailError } from "@agentmail/sdk";

try {
  await mail.messages.send(accountId, { to: ["a@b.com"], subject: "Hi", text: "Hey" });
} catch (e) {
  if (e instanceof AgentMailError) {
    console.log(e.status);   // 402, 404, 401, etc.
    console.log(e.code);     // "INSUFFICIENT_KARMA", "NOT_FOUND", etc.
    console.log(e.message);
  }
}
```

## 常见模式

### 注册服务并读取验证码邮件

```typescript
const account = await mail.accounts.create({
  address: "signup-bot@theagentmail.net",
});

// Use the address to sign up (browser automation, API, etc.)

// Poll for verification email
for (let i = 0; i < 30; i++) {
  const messages = await mail.messages.list(account.id);
  const verification = messages.find(m =>
    m.subject.toLowerCase().includes("verify") ||
    m.subject.toLowerCase().includes("confirm")
  );
  if (verification) {
    const detail = await mail.messages.get(account.id, verification.id);
    // Parse verification link/code from detail.bodyText or detail.bodyHtml
    break;
  }
  await new Promise(r => setTimeout(r, 2000));
}
```

### 发送邮件并等待回复

```typescript
const sent = await mail.messages.send(account.id, {
  to: ["human@company.com"],
  subject: "Question about order #12345",
  text: "Can you check the status?",
});

for (let i = 0; i < 60; i++) {
  const messages = await mail.messages.list(account.id);
  const reply = messages.find(m =>
    m.direction === "inbound" && m.timestamp > sent.timestamp
  );
  if (reply) {
    const detail = await mail.messages.get(account.id, reply.id);
    // Process reply
    break;
  }
  await new Promise(r => setTimeout(r, 5000));
}
```

## 类型定义

```typescript
type Account = { id: string; address: string; displayName: string | null; createdAt: number };
type Message = { id: string; from: string; to: string[]; subject: string; direction: "inbound" | "outbound"; status: string; timestamp: number };
type MessageDetail = Message & { cc: string[] | null; bcc: string[] | null; bodyText: string | null; bodyHtml: string | null; inReplyTo: string | null; references: string | null; attachments: AttachmentMeta[] };
type AttachmentMeta = { id: string; filename: string; contentType: string; size: number };
type KarmaBalance = { balance: number; events: KarmaEvent[] };
type KarmaEvent = { id: string; type: string; amount: number; timestamp: number; metadata?: Record<string, unknown> };
```

## 限制
- 仅在任务明确符合上述范围时使用此 skill。
- 不要将此输出视为环境相关验证、测试或专家评审的替代方案。
- 如果缺少所需输入、权限、安全边界或成功标准，请停止并请求澄清。
