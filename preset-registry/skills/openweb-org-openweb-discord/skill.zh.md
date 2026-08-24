# Discord

## 概述
实时消息平台。原型：消息传递。

## 工作流

### 浏览服务器消息
1. `listGuilds` → 选择公会 → `guildId`
2. `listGuildChannels(guildId)` → 选择频道 → `channelId`
3. `getChannelMessages(channelId, limit)` → 包含内容、作者和时间戳的消息

### 搜索服务器
1. `listGuilds` → 选择公会 → `guildId`
2. `searchMessages(guildId, content)` → 带上下文的匹配消息

### 发送消息并添加回应
1. `listGuilds` → 选择公会 → `guildId`
2. `listGuildChannels(guildId)` → 选择频道 → `channelId`
3. `sendMessage(channelId, content)` → 带 ID 的消息 → `messageId`
4. `addReaction(channelId, messageId, emoji)` → 204

### 撤销消息和回应
1. `getChannelMessages(channelId)` → `messageId`（或使用 `messageId ← sendMessage`）
2. `deleteMessage(channelId, messageId)` → 204
3. `removeReaction(channelId, messageId, emoji)` → 204

### 检查服务器
1. `listGuilds` → 选择公会 → `guildId`
2. `getGuildInfo(guildId)` → 服务器详细信息、成员数量、功能
3. `getGuildRoles(guildId)` → 包含权限的角色列表

## 操作

| 操作 | 意图 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| getCurrentUser | 获取我的个人资料 | — | username, email, avatar, premium_type | 入口点 |
| listGuilds | 列出我的服务器 | — | id, name, icon, owner, permissions | 入口点 |
| getDirectMessages | 列出私信频道 | — | id, type, recipients, last_message_id | 入口点 |
| getGuildInfo | 服务器详细信息 | guildId ← listGuilds | name, description, owner_id, member count, features, roles | |
| listGuildChannels | 服务器中的频道 | guildId ← listGuilds | id, name, type, topic, position | |
| getGuildRoles | 服务器角色 | guildId ← listGuilds | name, permissions, color, position | |
| searchMessages | 在服务器中搜索 | guildId ← listGuilds, content（查询） | total_results、带上下文的消息 | |
| getChannelInfo | 频道详细信息 | channelId ← listGuildChannels | name, type, topic, guild_id | |
| getChannelMessages | 读取消息 | channelId ← listGuildChannels | content, author, timestamp, attachments, embeds | 分页（limit, before, after） |
| getPinnedMessages | 已置顶的消息 | channelId ← listGuildChannels | content, author, timestamp | 不分页 |
| sendMessage | 发送消息 | channelId ← listGuildChannels, content | id, content, author, timestamp | 写入操作 |
| addReaction | 对消息添加回应 | channelId, messageId ← getChannelMessages, emoji | 204，无内容 | 写入操作 |
| deleteMessage | 删除消息 | channelId, messageId ← getChannelMessages | 204，无内容 | 写入操作，撤销 sendMessage |
| removeReaction | 移除自己的回应 | channelId, messageId ← getChannelMessages, emoji | 204，无内容 | 写入操作，撤销 addReaction |

## 快速开始

```bash
# Get current user info
openweb discord exec getCurrentUser '{}'

# List my servers (guilds)
openweb discord exec listGuilds '{}'

# List channels in a server
openweb discord exec listGuildChannels '{"guildId":"GUILD_ID"}'

# Read messages in a channel
openweb discord exec getChannelMessages '{"channelId":"CHANNEL_ID","limit":50}'

# Search messages in a guild
openweb discord exec searchMessages '{"guildId":"GUILD_ID","content":"search term"}'

# Send a message to a channel
openweb discord exec sendMessage '{"channelId":"CHANNEL_ID","content":"Hello!"}'

# React to a message with thumbs up
openweb discord exec addReaction '{"channelId":"CHANNEL_ID","messageId":"MSG_ID","emoji":"👍"}'

# Delete a message
openweb discord exec deleteMessage '{"channelId":"CHANNEL_ID","messageId":"MSG_ID"}'

# Remove own reaction from a message
openweb discord exec removeReaction '{"channelId":"CHANNEL_ID","messageId":"MSG_ID","emoji":"👍"}'
```

## 已知限制

- `createServer` / `createChannel` — **不受支持**（已于 2026-04-20 从规范中移除）。Discord 要求创建实体的端点包含 `X-Super-Properties` 请求头（base64 编码的客户端指纹数据块）；页面传输层不会注入该请求头，也没有可用于生成该请求头的 discord 适配器。所有其他写入操作（`sendMessage`、`deleteMessage`、`addReaction`、`removeReaction`）均可通过同一个 `webpack_module_walk` Authorization 请求头正常工作。解除限制的方法：从 SPA 包中捕获一个有效的 super-properties 值，并将其添加为常量请求头（或构建一个 discord 适配器）。