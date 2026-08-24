# ChatGPT

## 概述
ChatGPT 后端 API——OpenAI 的对话式 AI 接口。内容平台原型。

## 工作流

### 浏览对话
1. `listConversations` → 选择对话 → `conversationId`
2. `getConversation(conversationId)` → 完整消息树

### 搜索和阅读
1. `searchConversations(query)` → 包含 `conversationId` 的结果
2. `getConversation(conversationId)` → 完整消息树

### 发送消息
1. `sendMessage({ prompt })` → 由 SPA 驱动的发送 → `{ conversation_id, response_text }`
2. `getConversation(conversation_id)` → 回复完成后获取完整消息树

`sendMessage` 不再需要 `model` / `parentMessageId`——chatgpt-web
适配器会驱动实时 SPA，因此页面将选择当前模型，并为你将
新一轮消息加入对话线程。只需传入 `prompt`。

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| getProfile | 已认证的用户信息 | — | id, name, email | 入口点 |
| listConversations | 最近的对话 | limit?, cursor? | items[].id, title, cursor | 分页（cursor） |
| getConversation | 完整的对话详情 | conversationId ← listConversations \| sendMessage | mapping（消息树）, current_node | 树状结构 |
| searchConversations | 搜索历史对话 | query | items[].conversation_id, snippet | 分页（offset cursor） |
| getModels | 可用模型 | — | models[].slug, title | 入口点 |
| sendMessage | 发送消息并获取回复 | prompt | conversation_id, response_text, sse_event_count | 写操作；由 SPA 驱动的适配器 |

## 快速开始

```bash
# Get user profile
openweb chatgpt exec getProfile '{}'

# List recent conversations
openweb chatgpt exec listConversations '{"limit": 10}'

# Get a conversation
openweb chatgpt exec getConversation '{"conversationId": "<id>"}'

# Search conversations
openweb chatgpt exec searchConversations '{"query": "python"}'

# Get available models
openweb chatgpt exec getModels '{}'

# Send a message (SPA-driven)
openweb chatgpt exec sendMessage '{"prompt": "Summarize the OpenWeb readme."}'
```

## 已知限制

- **`sendMessage.response_text` 可能返回空值。** Playwright 的
  `Response.text()` 会在 SSE 流结束前完成解析，因此适配器
  通常只能捕获开头的帧。`conversation_id` 是可靠的——
  后续可使用 `getConversation` 读取组装完成的回复。修复路径：
  将适配器切换为 CDP `Network.dataReceived` 监听器，对帧进行缓冲，
  直至流关闭。
- **`sendMessage` 需要托管的浏览器会话。** 它通过
  实时 chatgpt.com SPA 运行，以便页面能够完成 OpenAI 的 Sentinel
  chat-requirements + SHA3-512 工作量证明挑战。没有 Node
  回退方案。完整原理请参阅 `DOC.md` § 适配器模式。
- **读取操作仍使用 Node 传输层**（`exchange_chain` → Bearer）。只有
  `sendMessage` 由适配器驱动。