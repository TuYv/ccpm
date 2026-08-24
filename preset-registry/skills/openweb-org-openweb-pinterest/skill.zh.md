# Pinterest

## 概述
视觉发现与收藏平台。社交媒体的典型代表。

## 工作流

### 搜索和探索 Pin
1. `searchPins(query)` → 返回包含 Pin `id`、图片、标题、图板/发布者信息的结果
2. `getPin(id)` → 返回完整的 Pin 详情，包括描述、链接和互动统计数据

### 探索图板和用户
1. `searchPins(query)` → 结果包含 `pinner.username` 和 `board` slug
2. `getBoard(username, slug)` → 返回图板详情，包括 Pin 数量和关注者数量
3. `getUserProfile(username)` → 返回用户资料，包括关注者/正在关注数量和个人简介

### 快速搜索建议
1. `searchTypeahead(term)` → 返回 Pin、图板和用户的自动补全建议

### 将 Pin 保存到图板（已验证）
1. `searchPins(query)` 或 `getHomeFeed()` → 查找 Pin → `id` (= `pin_id`)
2. `searchPins(query)` → 结果包含 `pinner.username` 和 `board` slug
3. `getBoard(username, slug)` → 目标图板 → `board_id`
4. `savePin(pin_id ← searchPins, board_id ← getBoard)` → 响应包含**已保存 Pin 记录**的 `id`（与 `pin_id` 不同）以及所选图板的 `board.id`

### 移除已保存的 Pin（已验证，需要跨操作链）
1. `savePin(...)` → `resource_response.data.id`（已保存 Pin 的记录 ID）、`resource_response.data.board.id`
2. `unsavePin(id ← savePin response, board_id ← savePin response)` — `PinResource/delete/` 需要的是**已保存 Pin 的记录 ID**，而不是原始的 `pin_id`。在 `example.json` 中使用 `${prev.savePin.resource_response.data.id}` 和 `${prev.savePin.resource_response.data.board.id}`，以便验证流程串联这些 ID。

### 关注和取消关注图板（已验证）
1. `searchPins(query)` → 结果包含 `pinner.username` 和 `board` slug
2. `getBoard(username, slug)` → `board_id`
3. `followBoard(board_id)` → 将 `POST /v3/boards/{board_id}/follow/` 封装在 `/resource/ApiResource/update/` 中
4. `unfollowBoard(board_id)` → 将同一个 v3 URL 封装在 `/resource/ApiResource/delete/` 中

### 浏览首页动态和通知
1. `getHomeFeed()` → 个性化推荐 Pin
2. `getNotifications()` → 最近的活动（转存、关注、评论）

## 操作

| 操作 | 意图 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchPins | 按关键词搜索 Pin | query, scope, page_size | id, images, grid_title, description, pinner, board, bookmark | 入口点；通过 `bookmark` 分页 |
| getPin | 获取 Pin 详情 | id ← searchPins | title, description, link, images, pinner, board, repin/reaction/comment counts | |
| getBoard | 获取图板详情 | username + slug（例如 `WhoWhatWear/travel`） | name, description, pin_count, follower_count, owner, cover images | |
| getUserProfile | 获取用户资料 | username | full_name, about, follower/following/pin/board counts, image | |
| searchTypeahead | 输入联想建议 | term | label, type, id, images | |
| savePin | 将 Pin 保存到图板 | pin_id ← searchPins/getHomeFeed, board_id ← getBoard | resource_response.data.id（已保存 Pin 的记录）、resource_response.data.board.id | 写入；反向操作：unsavePin |
| unsavePin | 从图板移除已保存的 Pin | id ← savePin（已保存 Pin 的记录）、board_id ← savePin | status | 写入；反向操作：savePin。使用 `${prev.savePin.resource_response.data.{id,board.id}}` |
| followBoard | 关注图板 | board_id ← getBoard（URL `/v3/boards/{board_id}/follow/`） | id, name, url, followed_by_me | 写入；通过 `/resource/ApiResource/update/` 路由；反向操作：unfollowBoard |
| unfollowBoard | 取消关注图板 | board_id ← getBoard（URL `/v3/boards/{board_id}/follow/`） | status | 写入；通过 `/resource/ApiResource/delete/` 路由；反向操作：followBoard |
| getHomeFeed | 个性化首页动态 | page_size | id, images, grid_title, pinner, board, bookmark | 通过 `bookmark` 分页 |
| getNotifications | 通知动态 | page_size | id, type, message, timestamp, actors, target, bookmark | 通过 `bookmark` 分页 |

## 快速开始

```bash
# Search for cat pins
openweb pinterest exec searchPins '{"source_url":"/search/pins/?q=cats","data":"{\"options\":{\"query\":\"cats\",\"scope\":\"pins\",\"page_size\":25},\"context\":{}}"}'

# Get pin details
openweb pinterest exec getPin '{"source_url":"/pin/12345/","data":"{\"options\":{\"id\":\"12345\",\"field_set_key\":\"detailed\"},\"context\":{}}"}'

# Get board details
openweb pinterest exec getBoard '{"source_url":"/WhoWhatWear/travel/","data":"{\"options\":{\"slug\":\"WhoWhatWear/travel\",\"field_set_key\":\"detailed\"},\"context\":{}}"}'

# Get user profile
openweb pinterest exec getUserProfile '{"source_url":"/pinterest/","data":"{\"options\":{\"username\":\"pinterest\",\"field_set_key\":\"profile\"},\"context\":{}}"}'

# Save a pin to a board
openweb pinterest exec savePin '{"source_url":"/","data":"{\"options\":{\"pin_id\":\"PIN_ID\",\"board_id\":\"BOARD_ID\",\"section_id\":null},\"context\":{}}"}'

# Unsave a pin (uses PinResource/delete — id is the saved-pin record id from savePin response, NOT the original pin_id)
openweb pinterest exec unsavePin '{"source_url":"/","data":"{\"options\":{\"id\":\"SAVED_PIN_ID\",\"board_id\":\"BOARD_ID\"},\"context\":{}}"}'

# Follow a board (modern endpoint: /resource/ApiResource/update/ wrapping /v3/boards/{board_id}/follow/)
openweb pinterest exec followBoard '{"source_url":"/marthastewart/baking-and-dessert-recipes-and-ideas/","data":"{\"options\":{\"url\":\"/v3/boards/BOARD_ID/follow/\"},\"context\":{}}"}'

# Unfollow a board (same wrapped URL via /resource/ApiResource/delete/)
openweb pinterest exec unfollowBoard '{"source_url":"/marthastewart/baking-and-dessert-recipes-and-ideas/","data":"{\"options\":{\"url\":\"/v3/boards/BOARD_ID/follow/\"},\"context\":{}}"}'

# Get home feed
openweb pinterest exec getHomeFeed '{"source_url":"/","data":"{\"options\":{\"field_set_key\":\"hifi\",\"in_nux\":false,\"prependPartner\":false,\"page_size\":25},\"context\":{}}"}'

# Get notifications
openweb pinterest exec getNotifications '{"source_url":"/notifications/","data":"{\"options\":{\"field_set_key\":\"default\",\"page_size\":25},\"context\":{}}"}'
```

## 已知限制
- **`unsavePin` 需要 `savePin` 返回的已保存 Pin 记录 ID** — `PinResource/delete/` 接收的是 `savePin` 的 `resource_response.data.id` 中返回的 ID（而不是原始的 `pin_id`）。手动串联操作时，请保存 `savePin` 的响应，并将其中的 `id` 和 `board.id` 传给 `unsavePin`。在 `example.json` 中，使用 `${prev.savePin.resource_response.data.id}` 和 `${prev.savePin.resource_response.data.board.id}`（请验证跨操作模板功能）。
- **关注图板的操作位于“更多操作”菜单中** — Pinterest 已弃用 `/resource/BoardFollowingResource/`。现代版关注/取消关注点击操作经过以下封装：`POST /resource/ApiResource/{update,delete}/`，请求体为 `data={"options":{"url":"/v3/boards/{board_id}/follow/"},"context":{}}`。图板 UI 中的“关注”按钮已移至三点菜单中，因此在捕获 HAR 时很容易遗漏。
- **写入操作使用表单编码的请求体** — `POST /resource/{ResourceName}/{create,update,delete}/`，其中包含表单编码的 `source_url` 和 `data` 字段（`data` 是 `{"options":{...},"context":{}}` 的 JSON 字符串）。除非 HAR 证明并非如此，否则任何新的写入操作都应沿用此格式。
- **`source_url` 应与操作自然发生的页面相匹配** — 当 `source_url` 仅为 `/` 时，Pinterest 有时会拒绝写入操作。请使用操作目标对应的图板/Pin URL（例如 `/<username>/<board-slug>/`）。