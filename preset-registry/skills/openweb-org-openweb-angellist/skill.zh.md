# AngelList Venture

## 概述
AngelList Venture (`venture.angellist.com`)——面向投资者的仪表板，用于管理联合投资、交易和 LP 消息。仅限登录后使用。仅支持只读操作。

## 工作流

### 查看待处理的交易邀请
1. `listInvites` → 所有当前邀请，包含交易 id、名称、联合投资方和状态
2. `getInvite(virtualDealId)` → 资料室：备忘录、推介材料、幻灯片和附件（通过 portal.angellist.com）

### 阅读收件箱消息
1. `listMessages` → 分页的消息会话，包含参与者、最后一条消息和未读状态
2. `getMessage(conversationId)` → 包含所有消息的完整会话

### 阅读联合投资动态
1. `listPosts` → 分页的联合投资动态，包含标题、作者和日期
2. `getPost(postId)` → 完整动态正文、联合投资方和文档

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 传输方式 |
|-----------|--------|-----------|------------|-----------|
| listInvites | 当前交易管线 | — | id, dealName, virtualDealId, syndicateName, canInvest, investUrl | 适配器（页面、Apollo） |
| getInvite | 交易资料室 | virtualDealId ← listInvites | senderOrgHandle, sections[].header, sections[].content, sections[].files[] | 适配器（页面、拦截 portal） |
| listMessages | 收件箱会话 | limit?, cursor? | conversations[].id, participants, lastMessage, isUnread | 适配器（页面、Apollo） |
| getMessage | 会话消息 | conversationId ← listMessages | participants, messages[].text, messages[].sentAt, messages[].sentBy | 适配器（页面、Apollo） |
| listPosts | 联合投资动态 | limit?, cursor? | posts[].id, title, fromName, publishAt, isUnread | 适配器（页面、Apollo） |
| getPost | 完整动态 | postId ← listPosts | title, body, fromName, syndicateName, documents | 适配器（页面、Apollo） |

## 已知限制
- 仅限登录后使用；会话 Cookie 来自默认 Chrome 配置文件。
- `getInvite` 会导航至 portal.angellist.com（跨源）；基金类型和交易类型的邀请可能具有不同的资料室布局。
- `x-al-gql` 签名请求头需要通过主世界 CDP 调用 Apollo client.query()——patchright 的隔离 evaluate 无法访问 `__APOLLO_CLIENT__`。
- GraphQL `messages` 解析器要求将 `conversationId` 直接传递给 `messages()` 字段，而不能只传递给父级 `conversation()`。