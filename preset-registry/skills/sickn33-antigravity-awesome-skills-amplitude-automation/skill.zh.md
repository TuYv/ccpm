---
name: amplitude-automation
description: "Automate Amplitude tasks via Rube MCP (Composio): events, user activity, cohorts, user identification. Always search tools first for current schemas."
risk: critical
source: community
date_added: "2026-02-27"
---
# 通过 Rube MCP 实现 Amplitude 自动化

通过 Rube MCP 使用 Composio 的 Amplitude 工具包来自动化 Amplitude 产品分析。

## 前提条件

- Rube MCP 必须已连接（RUBE_SEARCH_TOOLS 可用）
- 通过 `RUBE_MANAGE_CONNECTIONS` 以工具包 `amplitude` 建立处于激活状态的 Amplitude 连接
- 始终先调用 `RUBE_SEARCH_TOOLS` 以获取最新的工具 schema

## 设置

**获取 Rube MCP**：在客户端配置中将 `https://rube.app/mcp` 添加为 MCP 服务器。无需 API 密钥——只需添加该端点即可使用。


1. 通过确认 `RUBE_SEARCH_TOOLS` 能够响应，验证 Rube MCP 可用
2. 调用 `RUBE_MANAGE_CONNECTIONS` 并指定工具包 `amplitude`
3. 如果连接不是 ACTIVE 状态，请按照返回的认证链接完成 Amplitude 身份验证
4. 在运行任何工作流之前，确认连接状态显示为 ACTIVE

## 核心工作流

### 1. 发送事件

**适用场景**：用户想要跟踪事件或向 Amplitude 发送事件数据

**工具序列**：
1. `AMPLITUDE_SEND_EVENTS` - 向 Amplitude 发送一个或多个事件 [必选]

**关键参数**：
- `events`：事件对象数组，每个对象包含：
  - `event_type`：事件名称（例如 'page_view'、'purchase'）
  - `user_id`：唯一用户标识符（若未提供 `device_id` 则为必填）
  - `device_id`：设备标识符（若未提供 `user_id` 则为必填）
  - `event_properties`：包含自定义事件属性的对象
  - `user_properties`：包含要设置的用户属性的对象
  - `time`：自纪元以来以毫秒为单位的事件时间戳

**注意事项**：
- 每个事件必须至少提供 `user_id` 或 `device_id` 之一
- 每个事件都必须有 `event_type`，不能为空
- `time` 必须以毫秒为单位（13 位纪元时间戳），而不是秒
- 存在批量上限；请查看 schema 了解每次请求的最大事件数
- 事件采用异步处理；API 响应成功并不意味着数据立即可查询

### 2. 获取用户活动

**适用场景**：用户想要查看特定用户的事件历史

**工具序列**：
1. `AMPLITUDE_FIND_USER` - 按 ID 或属性查找用户 [前置条件]
2. `AMPLITUDE_GET_USER_ACTIVITY` - 获取用户的事件流 [必选]

**关键参数**：
- `user`：Amplitude 内部用户 ID（来自 FIND_USER）
- `offset`：事件列表的分页偏移量
- `limit`：返回的最大事件数

**注意事项**：
- `user` 参数需要 Amplitude 的内部用户 ID，而不是你应用的 user_id
- 必须先调用 FIND_USER 将你的 user_id 解析为 Amplitude 的内部 ID
- 默认按时间倒序返回活动记录
- 大量活动历史需要通过 `offset` 进行分页

### 3. 查找与识别用户

**适用场景**：用户想要查找用户或设置用户属性

**工具序列**：
1. `AMPLITUDE_FIND_USER` - 按各种标识符搜索用户 [必选]
2. `AMPLITUDE_IDENTIFY` - 设置或更新用户属性 [可选]

**关键参数**：
- FIND_USER 相关：
  - `user`：搜索词（user_id、email 或 Amplitude ID）
- IDENTIFY 相关：
  - `user_id`：你应用的用户标识符
  - `device_id`：设备标识符（user_id 的替代项）
  - `user_properties`：包含 `$set`、`$unset`、`$add`、`$append` 操作的对象

**注意事项**：
- FIND_USER 会在 user_id、device_id 和 Amplitude ID 范围内搜索
- IDENTIFY 使用特殊的属性操作（`$set`、`$unset`、`$add`、`$append`）
- `$set` 会覆盖现有值；`$setOnce` 仅在属性尚未设置时才设置
- IDENTIFY 必须至少提供 `user_id` 或 `device_id` 之一
- 用户属性的更改是最终一致的，并非立即生效

### 4. 管理群组

**适用场景**：用户想要列出群组、查看群组详情或更新群组成员

**工具序列**：
1. `AMPLITUDE_LIST_COHORTS` - 列出所有已保存的群组 [必选]
2. `AMPLITUDE_GET_COHORT` - 获取群组详细信息 [可选]
3. `AMPLITUDE_UPDATE_COHORT_MEMBERSHIP` - 在群组中添加/移除用户 [可选]
4. `AMPLITUDE_CHECK_COHORT_STATUS` - 检查异步群组操作的状态 [可选]

**关键参数**：
- LIST_COHORTS：无必填参数
- GET_COHORT：`cohort_id`（来自列表结果）
- UPDATE_COHORT_MEMBERSHIP：
  - `cohort_id`：目标群组 ID
  - `memberships`：包含 `add` 和/或 `remove` 用户 ID 数组的对象
- CHECK_COHORT_STATUS：来自更新响应的 `request_id`

**注意事项**：
- 所有针对特定群组的操作都需要群组 ID
- UPDATE_COHORT_MEMBERSHIP 是异步的；请使用 CHECK_COHORT_STATUS 进行验证
- 状态检查需要使用更新响应中的 `request_id`
- 每次请求的成员变更数量可能有上限；大型更新请分批进行
- 只有行为群组支持通过 API 更新成员

### 5. 浏览事件类别

**适用场景**：用户想要发现 Amplitude 中可用的事件类型和类别

**工具序列**：
1. `AMPLITUDE_GET_EVENT_CATEGORIES` - 列出所有事件类别 [必选]

**关键参数**：
- 无必填参数；返回所有已配置的事件类别

**注意事项**：
- 类别在 Amplitude UI 中配置；API 仅提供读取权限
- 类别中的事件名称区分大小写
- 在发送事件之前，使用这些类别来验证 event_type 的取值

## 常见模式

### ID 解析

**应用 user_id -> Amplitude 内部 ID**：
```
1. Call AMPLITUDE_FIND_USER with user=your_user_id
2. Extract Amplitude's internal user ID from response
3. Use internal ID for GET_USER_ACTIVITY
```

**群组名称 -> 群组 ID**：
```
1. Call AMPLITUDE_LIST_COHORTS
2. Find cohort by name in results
3. Extract id for cohort operations
```

### 用户属性操作

Amplitude IDENTIFY 支持以下属性操作：
- `$set`：设置属性值（覆盖现有值）
- `$setOnce`：仅在属性尚未设置时设置
- `$add`：递增数值属性
- `$append`：追加到列表属性
- `$unset`：完全移除属性

示例结构：
```json
{
  "user_properties": {
    "$set": {"plan": "premium", "company": "Acme"},
    "$add": {"login_count": 1}
  }
}
```

### 异步操作模式

用于群组成员更新：
```
1. Call AMPLITUDE_UPDATE_COHORT_MEMBERSHIP -> get request_id
2. Call AMPLITUDE_CHECK_COHORT_STATUS with request_id
3. Repeat step 2 until status is 'complete' or 'error'
```

## 已知注意事项

**用户 ID**：
- Amplitude 拥有自己独立的内部用户 ID，与你应用的用户 ID 不同
- FIND_USER 可将你的 ID 解析为 Amplitude 的内部 ID
- GET_USER_ACTIVITY 需要 Amplitude 的内部 ID，而不是你的 user_id

**事件时间戳**：
- 必须使用自纪元以来的毫秒数（13 位）
- 秒数（10 位）会被解读为非常久远的日期
- 省略时间戳时将使用服务器接收时间

**速率限制**：
- 事件摄取有每个项目的吞吐量限制
- 尽可能批量发送事件以减少 API 调用
- 群组成员更新存在异步处理限制

**响应解析**：
- 响应数据可能嵌套在 `data` 键下
- 用户活动按时间倒序返回事件
- 群组列表可能包含已归档的群组；请检查 status 字段
- 以防御性方式解析，并为可选字段提供兜底处理

## 快速参考

| 任务 | 工具 Slug | 关键参数 |
|------|-----------|------------|
| 发送事件 | AMPLITUDE_SEND_EVENTS | events（数组） |
| 查找用户 | AMPLITUDE_FIND_USER | user |
| 获取用户活动 | AMPLITUDE_GET_USER_ACTIVITY | user, offset, limit |
| 识别用户 | AMPLITUDE_IDENTIFY | user_id, user_properties |
| 列出群组 | AMPLITUDE_LIST_COHORTS | （无） |
| 获取群组 | AMPLITUDE_GET_COHORT | cohort_id |
| 更新群组成员 | AMPLITUDE_UPDATE_COHORT_MEMBERSHIP | cohort_id, memberships |
| 检查群组状态 | AMPLITUDE_CHECK_COHORT_STATUS | request_id |
| 列出事件类别 | AMPLITUDE_GET_EVENT_CATEGORIES | （无） |

## 何时使用
本技能适用于执行概述中所述的工作流或操作。

## 局限性
- 仅当任务明确符合上述范围时才使用本技能。
- 不要将输出视为针对特定环境的验证、测试或专家评审的替代品。
- 如果缺少必需的输入、权限、安全边界或成功标准，请停止并请求澄清。
