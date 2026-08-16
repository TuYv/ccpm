---
name: lark-event
version: 1.0.0
description: "Lark/Feishu real-time event listening / subscribing / consuming: stream events as NDJSON via `lark-cli event consume <EventKey>` (covers IM messages/reactions/chat changes, Task updates, VC meeting started/joined/ended, Minutes generated, Whiteboard updated, etc.). Use for Lark bots, real-time message processing, long-running subscribers, streaming webhook/push handlers. Supports `--max-events` / `--timeout` bounded runs and a stderr ready-marker contract — designed for AI agents running as subprocesses."
metadata:
  requires:
    bins: ["lark-cli"]
  cliHelp: "lark-cli event --help"
---
# Lark 事件

> **前置条件：** 请先阅读 [`../lark-shared/SKILL.md`](../lark-shared/SKILL.md)，了解身份验证、`--as user/bot` 切换、`Permission denied` 处理方式以及安全规则。

## 核心命令

| 命令 | 用途 |
|------|------|
| `lark-cli event list [--json]` | 列出所有可订阅的 EventKey |
| `lark-cli event schema <EventKey> [--json]` | 显示 EventKey 的参数和输出模式 |
| `lark-cli event consume <EventKey> [flags]` | 阻塞式消费；事件 → stdout NDJSON |
| `lark-cli event status [--json] [--fail-on-orphan]` | 检查本地总线守护进程的状态 |
| `lark-cli event stop [--all] [--force]` | 停止总线守护进程 |


## 常用标志

| 标志 | 说明 |
|---|---|
| `--param key=value` / `-p` | 业务参数（可重复使用；多值以逗号分隔）。使用未知键时会失败，并在行内列出有效名称 |
| `--jq <expr>` | 用于筛选/转换每个事件的 jq 表达式；输出为空时跳过该事件 |
| `--max-events N` | 在收到 N 个事件后退出。默认值 0 = 不限数量 |
| `--timeout D` | 在持续时间 D 后退出（例如 `30s`、`2m`）。默认值 0 = 无超时。`--max-events` / `--timeout` 中任一条件先触发即生效 |
| `--output-dir <dir>` | 将每个事件写入一个文件（仅允许相对路径；防止路径遍历） |
| `--quiet` | 禁止输出 stderr 诊断信息。**AI 不应使用此标志**——它会屏蔽就绪标记 |
| `--as user\|bot\|auto` | 会话使用的身份（参见 lark-shared） |


## 示例

```bash
# Default: stream every event for the key (no filter, no projection)
lark-cli event consume im.message.receive_v1 --as bot

# Grab one sample event to inspect payload shape
lark-cli event consume im.message.receive_v1 --max-events 1 --timeout 30s --as bot

# Run for 10 minutes then auto-exit
lark-cli event consume im.message.receive_v1 --timeout 10m --as bot

# Consume multiple EventKeys concurrently (one shape per process, no dispatcher)
lark-cli event consume im.message.receive_v1          --as bot > receive.ndjson &
lark-cli event consume im.message.reaction.created_v1 --as bot > reaction.ndjson &
wait

```

## 调用流程

1. `lark-cli event list --json` → 选择一个合法的键
2. `lark-cli event schema <key> --json` → 读取 `resolved_output_schema` + `jq_root_path` 以确定字段路径
3. `lark-cli event consume <key> [--jq '<expr>']` → 消费事件

## 子进程约定

### 就绪标记

`event consume` 的 stderr 会输出固定的一行 `[event] ready event_key=<key>`。**父进程应阻塞等待 stderr，直到该行出现，然后再开始读取 stdout。** 不要退而使用 `sleep`。

### stdin EOF = 优雅退出

`event consume` 将 stdin 关闭视为关闭信号（专为 AI 子进程调用方接入）。**有界运行不受此规则影响：设置 `--max-events` 或 `--timeout`（> 0）时，将忽略 stdin EOF，并且仅在达到自身限制、超时或收到 SIGTERM 时退出。** 对于无界运行，`< /dev/null` / `nohup` / systemd 的默认 `StandardInput=null` 会导致进程立即优雅退出（stderr `reason: signal`）。要让无界运行保持活动状态：

- 向 stdin 输入一个永不产生 EOF 的源：`< <(tail -f /dev/null)`
- 或以有界方式运行：`--max-events N` / `--timeout D`

### 退出码与原因

退出时，stderr 的最后一行为 `[event] exited — received N event(s) in Xs (reason: ...)`。

| 退出码 | 原因 | 触发条件 |
|---|---|---|
| 0 | `reason: limit` | 达到 `--max-events` |
| 0 | `reason: timeout` | 达到 `--timeout` |
| 0 | `reason: signal` | Ctrl+C / SIGTERM / stdin EOF（stdin EOF 仅适用于无界运行） |
| 1 | stderr 上的 JSON 错误信封 | 消费前设置期间发生 Lark API 业务失败（例如创建/删除订阅） |
| 2 | stderr 上的 JSON 错误信封（无 `exited` 行） | 验证失败（未知 EventKey、错误的 `--param` / `--jq`、已有另一个总线连接） |
| 3 | stderr 上的 JSON 错误信封 | 身份验证失败（缺少令牌、缺少权限范围） |
| 4 / 5 | stderr 上的 JSON 错误信封 | 网络/内部故障（总线启动、握手、文件 I/O） |

启动和运行时故障会在 stderr 上发出结构化 JSON 错误信封：`{"ok":false,"error":{"type","subtype","param","message","hint",...}}`（该信封还可能包含顶层的 `identity` / `_notice` 同级字段）。请解析 `error.type` / `error.subtype` 以进行分支处理（例如，`missing_scope` 带有 `missing_scopes` 列表），通过 `error.param` 定位有问题的标志，并根据 `error.hint` 获取恢复操作——不要使用正则表达式匹配消息文本。

编排器应将 `reason: limit/timeout/signal`（退出码均为 0）视为“业务完成”，将非零退出码视为“失败”。

### 绝不要使用 `kill -9`

**避免对消费进程使用 `kill -9`**：对于带有 **PreConsume hook** 的 EventKey（即通过 OAPI 注册服务端订阅的 EventKey），`kill -9` 会跳过 OAPI 取消订阅操作，从而泄漏服务端订阅（症状：重启时出现“subscription already exists”，以及事件重复投递）。请优先使用 SIGTERM 或关闭 stdin。

### 一次消费一个 EventKey（多键 = 多个 shell）

该命令只接受一个位置参数；不支持 `k1,k2` 和通配符。监听 N 个键意味着运行 N 个子进程——这是**有意为之**：

- 每个进程的 stdout 仅输出一种结构；AI 无需分派器逻辑
- 故障隔离（一个键失败不会影响其他键）
- 每个键可独立设置 `--as` / `--jq` / `--max-events` / `--timeout`

所有 N 个消费者共享一个总线守护进程（UDS 本地 IPC），因此开销很小

## 通过 schema 编写 jq

`event schema <key> --json` 是编写 `--jq` 时的权威依据。需要关注以下四点：

**(1) 字段从何处开始**——查看 `jq_root_path`

- 值为 `"."` → 字段位于顶层，应写成 `.chat_id`
- 值为 `".event"` → 字段位于 V2 信封内，应写成 `.event.chat_id`

**(2) 字段列表和类型**——查看 `resolved_output_schema.properties.<name>`

每个字段都带有 `type` / `description`，部分字段还带有 `format`。以下片段来自 `event schema im.message.receive_v1 --json`：

```json
{
  "chat_id":     {"type":"string", "format":"chat_id",      "description":"Chat ID, prefixed with oc_"},
  "sender_id":   {"type":"string", "format":"open_id",      "description":"Sender open_id, prefixed with ou_"},
  "create_time": {"type":"string", "format":"timestamp_ms", "description":"Send time as ms-epoch string"}
}
```

**(3) 字段语义** — 查看 `format` 标签

Lark 定义的语义标签（**不是** JSON Schema 的标准 `format`）。常见值：`open_id` / `chat_id` / `message_id` / `timestamp_ms` / `email`。用途：区分“字符串类型相同、含义不同”的字段，以便通过 API 反向查询或转换格式。

**(4) 解码状态** — 阅读字段的 `description`

`event consume` 会运行 Process 钩子，这些钩子可能会预先解码某些 payload 字段（展平 V2 信封、将 `.content` 渲染为纯文本等）——其行为与原始 OAPI 不同。**编写 jq 之前，务必阅读字段的 `description`**，对于 `content` / `data` / `body` / `payload` 之类的通用字段名尤其如此。

**为什么这很重要**：对已经解码的文本字段盲目应用 `fromjson`，会导致 jq 在每个事件上报错并静默丢弃该事件——消费者看起来仍在运行，但不会输出任何内容，只有一行 `WARN` 被埋在 stderr 中。（这是一般行为：任何 jq 运行时错误都会跳过该事件，并输出一行 WARN；循环不会中止。）

**不要跳过 schema 中的信息**：使用 jq 对 `event schema --json` 进行投影时，不要从 `properties` 中剔除 `.description`——这个字段会告诉你某个字段是否已经解码。请转储完整的属性对象，而不只是键。

---

**补充说明**：`--param` 的有效参数也位于 schema 中——`params` 部分列出了 `name` / `type` / `required` / `enum` / `default` / `description`；**如果缺少该部分，则表示此键不接受任何 `--param`**。

## 主题索引

| 主题       | 参考资料                                                                       | 涵盖内容 |
|------------|------------------------------------------------------------------------------|---|
| IM         | [`references/lark-event-im.md`](references/lark-event-im.md)                 | 12 个 IM EventKey 的目录 + 结构说明（扁平结构与 V2 信封）+ `im.message.receive_v1` 字段注意事项（`sender_id` 仅为 open_id；除 `interactive` 卡片外，`.content` 均为纯文本）+ 常用 jq 用法（按 chat_type / message_type / sender 过滤）；关于 `card.action.trigger`，另请参阅 [`../lark-im/references/lark-im-card-action-reply.md`](../lark-im/references/lark-im-card-action-reply.md) |
| Task       | [`references/lark-event-task.md`](references/lark-event-task.md)             | 1 个 Task EventKey（`task.task.update_user_access_v2`）的目录 + 原生 V2 信封结构 + 任务提交类型 + 用户/机器人订阅说明 |
| VC         | [`references/lark-event-vc.md`](references/lark-event-vc.md)                 | 4 个 VC EventKey（`vc.meeting.participant_meeting_started_v1`、`vc.meeting.participant_meeting_joined_v1`、`vc.meeting.participant_meeting_ended_v1`、`vc.note.generated_v1`）的目录 + 字段参考 + 来源类型语义（仅限会议） |
| Minutes    | [`references/lark-event-minutes.md`](references/lark-event-minutes.md)       | 1 个 Minutes EventKey（`minutes.minute.generated_v1`）的目录 + 字段参考 + 来源类型语义（仅限会议） |
| Whiteboard | [`references/lark-event-whiteboard.md`](references/lark-event-whiteboard.md) | 1 个 Board EventKey（`board.whiteboard.updated_v1`）的目录 + 按白板订阅模型（需要 `-p whiteboard_id=<token>`）+ payload 字段参考（whiteboard_id / operator_ids 三类 ID） |