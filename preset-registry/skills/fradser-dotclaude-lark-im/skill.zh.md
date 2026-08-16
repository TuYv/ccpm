---
name: lark-im
version: 1.0.0
description: "飞书即时通讯：收发消息和管理群聊。发送和回复消息、搜索聊天记录、管理群聊成员、上传下载图片和文件（支持大文件分片下载）、管理表情回复、发送应用内/短信/电话加急、发送和处理交互卡片（Interactive Card）、监听卡片按钮回调（card.action.trigger）。当用户需要发消息、查看或搜索聊天记录、下载聊天中的文件、查看群成员、搜索群、创建群聊或话题群、管理标记数据、管理 Feed 置顶（添加/移除/查询置顶会话）、管理标签数据、处理卡片回调时使用。"
metadata:
  requires:
    bins: ["lark-cli"]
  cliHelp: "lark-cli im --help"
---
# im (v1)

**关键要求 — 开始前必须先用 Read 工具读取 [`../lark-shared/SKILL.md`](../lark-shared/SKILL.md)，其中包含认证、权限处理**

## 核心概念

- **消息**：聊天中的单条消息，由 `message_id`（om_xxx）标识。支持的类型包括：文本、富文本、图片、文件、音频、视频、贴纸、交互式消息（卡片）、分享群聊、分享用户、合并转发等。
- **聊天**：群聊或点对点会话，由 `chat_id`（oc_xxx）标识。
- **话题**：消息下的回复话题，由 `thread_id`（om_xxx 或 omt_xxx）标识。
- **表情回应**：消息上的表情回应。
- **标记**：消息或话题的书签。
- **消息流快捷方式**：固定到当前用户消息流侧边栏的聊天，由 `feed_card_id`（对于 CHAT 类型，它是一个 `oc_xxx` open_chat_id）标识。
- **消息流分组**：在消息流列表中对消息流卡片进行分组的标签，由 `feed_group_id`（ofg_xxx）标识。成员是消息流卡片，每个成员由 `feed_id` + `feed_type` 标识。分为两种类型：`normal`（显式管理成员）和 `rule`（根据规则自动派生成员）。

## 资源关系

```
Chat (oc_xxx)
├── Message (om_xxx)
│   ├── Thread (reply thread)
│   ├── Reaction (emoji)
│   └── Resource (image / file / video / audio)
└── Member (user / bot)
```

## 重要说明

### 身份与令牌映射

- `--as user` 表示**用户身份**，并使用 `user_access_token`。调用以已授权的最终用户身份运行，因此权限同时取决于应用权限范围以及该用户自身对目标聊天、消息或资源的访问权限。
- `--as bot` 表示**机器人身份**，并使用 `tenant_access_token`。调用以应用机器人身份运行，因此行为取决于机器人的群聊成员身份、应用可见性、可用范围以及机器人特定的权限范围。
- 如果某个 IM API 表示同时支持 `user` 和 `bot`，则令牌类型会改变操作方的身份。同一个 API 使用一种身份时可能成功，而使用另一种身份时可能失败，因为所有者或管理员身份、群聊成员身份、租户边界或应用可用性都是根据当前调用方进行检查的。

### 使用机器人身份时的发送者名称解析

使用机器人身份（`--as bot`）获取消息时（例如 `+chat-messages-list`、`+threads-messages-list`、`+messages-mget`），发送者名称可能无法解析（显示为 open_id，而非显示名称）。当机器人无法访问用户的联系人信息时，就会发生这种情况。

**根本原因**：机器人的应用可见性设置未包含消息发送者，因此联系人 API 不会返回名称。

**解决方案**：检查 Lark 开发者控制台中的应用可见性设置——确保应用的可见范围覆盖需要解析名称的用户。或者，使用 `--as user` 以用户身份获取消息，这通常具有更广泛的联系人访问权限。

### 默认消息增强（表情回应 / update_time）

四个消息拉取快捷方式（`+messages-mget`、`+chat-messages-list`、`+messages-search`、`+threads-messages-list`）会自动为每条返回的消息附加一个 `reactions` 块，并为已编辑的消息附加 `update_time`——无需单独调用 `im.reactions.batch_query`。传入 `--no-reactions` 可选择停用此行为。有关完整约定（输出结构、`im:message.reactions:read` 权限范围要求以及“字段缺失 ≠ 获取失败”的数据规则），请阅读 [`references/lark-im-message-enrichment.md`](references/lark-im-message-enrichment.md)。

### 选择启用资源自动下载（`--download-resources`）

`+chat-messages-list`、`+messages-mget` 和 `+threads-messages-list` 接受 `--download-resources`（**默认关闭**——省略时不会有 `resources` 块，也不会发起额外请求）。设置后，符合条件的消息资源（图像/文件/音频/视频/媒体 + 帖子内嵌资源；**不包括贴纸**）会下载到 `./lark-im-resources/`，并且每条消息都会增加一个 `resources` 数组，其中包含 `{message_id, key, type, local_path, size_bytes}`。下载会按 `(message_id, file_key)` 去重，以有界并发方式运行，并隔离单个资源的失败（`error: true` + stderr 警告）。**权限范围：**需要 `im:message:readonly`（列表命令已声明该权限——无需额外权限范围）；在用户身份和机器人身份下均可使用。对于一次性下载，请使用 [`+messages-resources-download`](references/lark-im-messages-resources-download.md)。完整约定请参阅：[`references/lark-im-message-enrichment.md`](references/lark-im-message-enrichment.md)。

### 卡片消息（交互式）

**在发送或回复任何 `interactive` 卡片（`+messages-send` / `+messages-reply`）之前，你必须阅读 [`references/card/lark-im-card-create.md`](references/card/lark-im-card-create.md) 并遵循其中的工作流。传递给 `--msg-type interactive --content` 的卡片 JSON 必须是该工作流的输出——切勿手写或复制卡片载荷。**

事件订阅目前尚不支持将卡片消息（`interactive` 类型）紧凑转换。系统将改为返回原始事件数据，并向 stderr 输出提示。

`interactive` 卡片支持回调事件（`card.action.trigger`）——请参阅 [`references/lark-im-card-action-reply.md`](references/lark-im-card-action-reply.md)。

### 音频消息

`--audio` 用于发送语音消息，并且仅支持 Opus 音频文件，例如 `.opus` 文件或 Ogg Opus（`.ogg`）文件。对于 `mp3`、`wav` 或其他非 Opus 音频，可以先将其转换为 `.opus` 并继续使用 `--audio`，也可以使用 `--file` 将原始文件作为附件发送。

### 将文档内容作为消息发送

将从 Lark 文档获取的内容作为消息发送时，请使用 --doc-format im-markdown 获取文档，然后使用 --markdown 格式将其作为消息发送。获取的内容已经是 markdown；在任何内容转发场景中，都应保留获取到的原始文本，并以 --markdown 格式发送。注意：如果文档包含 type="user" 的 cite 标签，请原样保留，不要移除该标签。

### 标记类型

标记支持两个层级：

- **消息层标记**：`(ItemTypeDefault, FlagTypeMessage)`——常规消息书签
- **信息流层标记**：`(ItemTypeThread/ItemTypeMsgThread, FlagTypeFeed)`——作为信息流层书签的线程

信息流层标记的项目类型：
- **ItemTypeThread** (4) = 话题式聊天中的线程
- **ItemTypeMsgThread** (11) = 常规聊天中的线程

### 信息流快捷方式

信息流快捷方式会将聊天添加到当前用户的信息流侧边栏。它们与标记不同：

- **标记** = 消息/线程上的书签，作用域为用户的书签列表。
- **信息流快捷方式** = 用户信息流侧边栏中的条目（目前仅支持聊天）。

主要限制：
- OpenAPI 仅开放 **CHAT 类型**（`feed_card_id` 为 `oc_xxx`）；文档/应用/订阅快捷方式已在内部提供，但尚未加入白名单。
- 三项操作（创建/移除/列出）都**仅支持用户身份**——使用 `user_access_token` 签名。
- 创建/移除操作的批量大小为**每次调用 10 个**；列出操作是单页封装，使用不透明的 `page_token` 进行分页。

## Shortcuts（推荐优先使用）

Shortcut 是对常用操作的高级封装（`lark-cli im +<verb> [flags]`）。有 Shortcut 的操作优先使用。

| Shortcut | 说明 |
|----------|------|
| [`+chat-create`](references/lark-im-chat-create.md) | 创建群聊或话题群；支持用户/机器人身份；--chat-mode group\|topic；私有/公开；可邀请用户/机器人；可选将机器人设为管理员 |
| [`+chat-list`](references/lark-im-chat-list.md) | 列出当前用户/机器人所在的会话；默认列出群聊；传入 --types=p2p,group 可包含 P2P 单聊（仅用户身份）；支持用户/机器人身份、排序、分页和 --exclude-muted（仅用户身份） |
| [`+chat-members-list`](references/lark-im-chat-members-list.md) | 列出会话成员；返回独立的 users[] / bots[] 分组；可通过用户或机器人身份调用；--member-types 用于筛选要返回的成员类型；支持 --page-all 分页；当服务器限制某个分组的返回数量时，通过 truncations[] 显示截断信息 |
| [`+chat-messages-list`](references/lark-im-chat-messages-list.md) | 列出群聊或 P2P 会话中的消息；支持用户/机器人身份；接受 --chat-id 或 --user-id，可解析 P2P chat_id，并支持时间范围、排序和分页 |
| [`+chat-search`](references/lark-im-chat-search.md) | 按 --query 关键字和/或 --member-ids 搜索可见群聊；支持用户/机器人身份；例如，可按群名称查找 chat_id；支持类型筛选、排序、分页和 --exclude-muted（仅用户身份） |
| [`+chat-update`](references/lark-im-chat-update.md) | 更新群聊名称或描述；支持用户/机器人身份；可更新会话的名称或描述 |
| [`+messages-mget`](references/lark-im-messages-mget.md) | 按 ID 批量获取消息；支持用户/机器人身份；最多获取 50 个 om_ 消息 ID，格式化发送者名称，并展开话题回复 |
| [`+messages-reply`](references/lark-im-messages-reply.md) | 回复消息（支持话题回复）；支持用户/机器人身份；支持文本/Markdown/富文本/媒体回复、话题内回复和幂等键 |
| [`+messages-resources-download`](references/lark-im-messages-resources-download.md) | 下载消息中的图片/文件；支持用户/机器人身份；支持自动分块下载大型文件（每块 8MB），并根据 Content-Type 自动检测文件扩展名 |
| [`+messages-search`](references/lark-im-messages-search.md) | 使用用户身份跨会话搜索消息（支持关键字、发送者、时间范围筛选）；仅支持用户身份；可按会话/发送者/附件/时间筛选，支持通过 `--page-all` / `--page-limit` 自动分页，并通过批量 mget 和 chats batch_query 扩充结果 |
| [`+messages-send`](references/lark-im-messages-send.md) | 向群聊或私聊发送消息；支持用户/机器人身份；可使用文本/Markdown/富文本/媒体格式向 chat-id 或 user-id 发送消息，并支持幂等键 |
| [`+threads-messages-list`](references/lark-im-threads-messages-list.md) | 列出话题中的消息；支持用户/机器人身份；接受 om_/omt_ 输入，可将消息 ID 解析为 thread_id，并支持排序和分页 |
| [`+flag-create`](references/lark-im-flag-create.md) | 为消息创建书签；仅支持用户身份；默认为消息层书签；使用 --flag-type feed 创建信息流层书签（根据会话模式自动检测 item_type） |
| [`+flag-cancel`](references/lark-im-flag-cancel.md) | 取消（移除）书签。未提供 --flag-type 时，会尽力执行双重取消：移除消息层书签，并在可以确定 chat_type 时移除信息流层书签 |
| [`+flag-list`](references/lark-im-flag-list.md) | 列出书签；仅支持用户身份；自动使用消息内容扩充信息流类型的话题条目；支持 `--page-all` 自动分页 |
| [`+feed-shortcut-create`](references/lark-im-feed-shortcut-create.md) | 将会话添加到用户的信息流快捷方式；仅支持用户身份；仅限 oc_xxx 会话 ID；每次调用最多批量处理 10 个；`--head`/`--tail` 控制插入顺序；部分失败时返回 `ok:false` 明细 |
| [`+feed-shortcut-remove`](references/lark-im-feed-shortcut-remove.md) | 从用户的信息流快捷方式中移除会话；仅支持用户身份；每次调用最多批量处理 10 个；移除不存在的快捷方式会视为幂等成功；真实的单项失败会返回 `ok:false` 明细 |
| [`+feed-shortcut-list`](references/lark-im-feed-shortcut-list.md) | 列出用户信息流快捷方式的一页数据；仅支持用户身份；第一页省略 `--page-token`；默认输出会在 `detail` 下扩充 CHAT 条目；传入 `--no-detail` 可跳过额外查询和 `im:chat:read` 权限范围 |
| [`+feed-group-list`](references/lark-im-feed-group-list.md) | 列出调用者的信息流分组（标签）；仅支持用户身份；支持 `--page-all` 自动分页 |
| [`+feed-group-list-item`](references/lark-im-feed-group-list-item.md) | 列出信息流分组（标签）中的信息流卡片；仅支持用户身份；根据 feed_id 解析 chat_name，以此扩充每个条目；支持 --page-all 自动分页 |
| [`+feed-group-query-item`](references/lark-im-feed-group-query-item.md) | 按 ID 查询信息流分组（标签）中的特定信息流卡片；仅支持用户身份；根据 feed_id 解析 chat_name，以此扩充每个条目 |

## API 资源

```bash
lark-cli schema im.<resource>.<method>   # 调用 API 前必须先查看参数结构
lark-cli im <resource> <method> [flags] # 调用 API
```

> **重要**：使用原生 API 时，必须先运行 `schema` 查看 `--data` / `--params` 参数结构，不要猜测字段格式。

### chats

  - `create` — 创建群。身份：仅限 `bot`（`tenant_access_token`）。
  - `get` — 获取群信息。身份：支持 `user` 和 `bot`；调用方必须在目标群中才能获取完整详情，对于内部群，调用方还必须属于同一租户。
  - `link` — 获取群分享链接。身份：支持 `user` 和 `bot`；调用方必须在目标群中；当群分享仅限群主或管理员时，调用方必须是群主或管理员；对于内部群，调用方还必须属于同一租户。
  - `update` — 更新群信息。身份：支持 `user` 和 `bot`。

### chat.members

  - `create` — 将用户或机器人拉入群聊。身份：支持 `user` 和 `bot`；调用方必须在目标群中；对于 `bot` 调用，被添加的用户必须在应用的可用范围内；对于内部群，操作者必须属于同一租户；如果只有群主或管理员可以添加成员，则调用方必须是群主或管理员，或者是具有 `im:chat:operate_as_owner` 权限的群创建机器人。
  - `delete` — 将用户或机器人移出群聊。身份：支持 `user` 和 `bot`；只有群主、管理员或创建群的机器人可以移除其他成员；每次请求最多可移除 50 个用户或 5 个机器人。

### chat.user_setting

  - `batch_query` — 批量查询当前用户在群内的个人偏好设置（例如，`is_muted` 会将普通消息设为免打扰，`is_mute_at_all` 会将 @all 消息设为免打扰）；每次请求最多可查询 10 个群。身份：仅限 `user`（`user_access_token`）；调用方必须在每个目标群中。
  - `batch_update` — 批量更新当前用户在群内的个人偏好设置（例如，`is_muted` 会将普通消息设为免打扰，`is_mute_at_all` 会将 @all 消息设为免打扰）；每次请求最多可更新 10 个群。身份：仅限 `user`（`user_access_token`）；调用方必须在每个目标群中。

### chat.nickname

  - `get` — 获取自己的群昵称。获取自己在群内的昵称（仅限本人）。身份：仅限 `user`（`user_access_token`）；未设置昵称时返回空字符串。
  - `update` — 设置自己的群昵称。设置或更新自己在群内的昵称（仅限本人）。身份：仅限 `user`（`user_access_token`）；`nickname` 必须是非空字符串（最多 300 字节）。使用 DELETE 可将其清空。
  - `delete` — 清空自己的群昵称。清空自己在群内的昵称（仅限本人）。身份：仅限 `user`（`user_access_token`）。

### chat.managers

  - `add_managers` — 指定群管理员。身份：支持 `user` 和 `bot`；只有群主可以添加管理员；每个群最多可设置 10 名管理员（超大群为 20 名），并且每次请求最多可添加 5 个机器人。
  - `delete_managers` — 删除群管理员。身份：支持 `user` 和 `bot`；只有群主可以移除管理员；每次请求最多可移除 50 个用户或 5 个机器人。

### chat.moderation

  - `get` — 获取群成员发言权限。身份：支持 `user` 和 `bot`；调用方必须在目标群中，并且属于同一租户。
  - `update` — 更新群发言权限。身份：支持 `user` 和 `bot`；只有群主（或具有 `im:chat:operate_as_owner` 权限的群创建机器人）可以更新；调用方必须在群中。

### messages

  - `delete` — 撤回消息。身份：支持 `user` 和 `bot`；对于 `bot` 调用，机器人必须在群中才能撤回群消息；要撤回其他用户的群消息，机器人必须是群主、管理员或群创建者；对于用户单聊消息的撤回，目标用户必须在机器人的可用范围内。
  - `forward` — 转发消息。身份：支持 `user` 和 `bot`。
  - `merge_forward` — 合并转发消息。身份：仅限 `bot`（`tenant_access_token`）。
  - `read_users` — 查询消息已读信息。身份：仅限 `bot`（`tenant_access_token`）；机器人必须在群中，并且只能查询其在过去 7 天内发送的消息的已读状态。
  - `urgent_app` — 发送应用内加急。身份：仅限 `bot`（`tenant_access_token`）；机器人必须是消息发送者，并且必须在包含该消息的会话中。
  - `urgent_phone` — 发送电话加急。身份：仅限 `bot`（`tenant_access_token`）；机器人必须是消息发送者，并且必须在包含该消息的会话中。
  - `urgent_sms` — 发送短信加急。身份：仅限 `bot`（`tenant_access_token`）；机器人必须是消息发送者，并且必须在包含该消息的会话中。

### reactions

  - `batch_query` — 批量获取消息表情。身份：支持 `user` 和 `bot`。[必读](references/lark-im-reactions.md)
  - `create` — 添加消息表情回复。身份：支持 `user` 和 `bot`；调用方必须在包含该消息的会话中。[必读](references/lark-im-reactions.md)
  - `delete` — 删除消息表情回复。身份：支持 `user` 和 `bot`；调用方必须在包含该消息的会话中，且只能删除由自身添加的表情回复。[必读](references/lark-im-reactions.md)
  - `list` — 获取消息表情回复。身份：支持 `user` 和 `bot`；调用方必须在包含该消息的会话中。[必读](references/lark-im-reactions.md)

### threads

  - `forward` — 转发话题。身份：支持 `user` 和 `bot`。

### images

  - `create` — 上传图片。身份：仅支持 `bot`（`tenant_access_token`）。

### pins

  - `create` — 固定消息。身份：支持 `user` 和 `bot`。
  - `delete` — 取消固定消息。身份：支持 `user` 和 `bot`。
  - `list` — 获取群内固定消息。身份：支持 `user` 和 `bot`。

### feed.groups

  - `batch_add_item` — 批量将信息流卡片添加到信息流分组。身份：仅支持 `user`（`user_access_token`）。[必读](references/lark-im-feed-groups.md)
  - `batch_query` — 批量查询信息流分组。身份：仅支持 `user`（`user_access_token`）。[必读](references/lark-im-feed-groups.md)
  - `batch_remove_item` — 批量从信息流分组中移除信息流卡片。身份：仅支持 `user`（`user_access_token`）。[必读](references/lark-im-feed-groups.md)
  - `create` — 创建信息流分组。身份：仅支持 `user`（`user_access_token`）。[必读](references/lark-im-feed-groups.md)
  - `delete` — 删除信息流分组。身份：仅支持 `user`（`user_access_token`）。[必读](references/lark-im-feed-groups.md)
  - `update` — 更新信息流分组。身份：仅支持 `user`（`user_access_token`）。[必读](references/lark-im-feed-groups.md)

## 权限表

| 方法 | 所需 scope |
|------|-----------|
| `chats.create` | `im:chat:create` |
| `chats.get` | `im:chat:read` |
| `chats.link` | `im:chat:read` |
| `chats.update` | `im:chat:update` |
| `chat.members.create` | `im:chat.members:write_only` |
| `chat.members.delete` | `im:chat.members:write_only` |
| `chat.members.get` | `im:chat.members:read` |
| `+chat-members-list` | `im:chat.members:read` |
| `chat.user_setting.batch_query` | `im:chat.user_setting:read` |
| `chat.user_setting.batch_update` | `im:chat.user_setting:write` |
| `chat.managers.add_managers` | `im:chat.managers:write_only` |
| `chat.managers.delete_managers` | `im:chat.managers:write_only` |
| `chat.moderation.get` | `im:chat.moderation:read` |
| `chat.moderation.update` | `im:chat:moderation:write_only` |
| `messages.delete` | `im:message:recall` |
| `messages.forward` | `im:message` |
| `messages.merge_forward` | `im:message` |
| `messages.read_users` | `im:message:readonly` |
| `messages.urgent_app` | `im:message.urgent` |
| `messages.urgent_phone` | `im:message.urgent:phone` |
| `messages.urgent_sms` | `im:message.urgent:sms` |
| `reactions.batch_query` | `im:message.reactions:read` |
| `reactions.create` | `im:message.reactions:write_only` |
| `reactions.delete` | `im:message.reactions:write_only` |
| `reactions.list` | `im:message.reactions:read` |
| `threads.forward` | `im:message` |
| `images.create` | `im:resource` |
| `pins.create` | `im:message.pins:write_only` |
| `pins.delete` | `im:message.pins:write_only` |
| `pins.list` | `im:message.pins:read` |
| `feed.groups.batch_add_item` | `im:feed_group_v1:write` |
| `feed.groups.batch_query` | `im:feed_group_v1:read` |
| `feed.groups.batch_remove_item` | `im:feed_group_v1:write` |
| `feed.groups.create` | `im:feed_group_v1:write` |
| `feed.groups.delete` | `im:feed_group_v1:write` |
| `feed.groups.update` | `im:feed_group_v1:write` |