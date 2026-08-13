# Claude-Mem OpenClaw 插件 — 安装指南

本指南介绍如何在 OpenClaw 网关上设置 claude-mem 插件。完成后，你的代理将通过系统提示词上下文注入在会话间保留持久记忆，并可选地将实时观测流推送到消息频道。

## 快速安装（推荐）

运行这行命令即可自动安装所有内容：

```bash
curl -fsSL https://install.cmem.ai/openclaw.sh | bash
```

安装程序会处理依赖检查（Bun、uv）、插件安装、内存槽配置、AI 提供商设置、worker 启动，以及可选的观测流配置——全部通过交互式方式完成。

### 使用选项安装

预先选择你的 AI 提供商和 API Key，以跳过交互提示：

```bash
curl -fsSL https://install.cmem.ai/openclaw.sh | bash -s -- --provider=gemini --api-key=YOUR_KEY
```

要进行完全无人值守安装（默认为 Claude Max Plan，跳过观测流）：

```bash
curl -fsSL https://install.cmem.ai/openclaw.sh | bash -s -- --non-interactive
```

要升级现有安装（保留设置，更新插件）：

```bash
curl -fsSL https://install.cmem.ai/openclaw.sh | bash -s -- --upgrade
```

安装后，跳转到 [第 4 步：重启网关并验证](#step-4-restart-the-gateway-and-verify) 以确认一切正常。

---

## 手动设置

以下步骤适用于你不想使用自动安装器，或需要逐步排查问题时的手动安装。

### 第 1 步：克隆 Claude-Mem 仓库

首先将 claude-mem 仓库克隆到 OpenClaw 网关可访问的位置。这样你就能获得 worker 服务源码和插件代码。

```bash
cd /opt  # or wherever you want to keep it
git clone https://github.com/thedotmack/claude-mem.git
cd claude-mem
npm install
npm run build
```

你需要安装 **bun** 才能运行 worker 服务。如果你还没有安装：

```bash
curl -fsSL https://bun.sh/install | bash
```

### 第 2 步：启动 Worker

claude-mem worker 是一个运行在 37777 端口的 HTTP 服务。它存储观测记录、生成摘要，并提供上下文时间线服务。插件通过 HTTP 与其通信——worker 运行位置不重要，只要能在 localhost:37777 访问即可。

#### 检查它是否已在运行

如果此机器也安装了 Claude Code，并且已安装 claude-mem，worker 可能已经在运行：

```bash
curl http://localhost:37777/api/health
```

**返回 `{"status":"ok"}`？** worker 已在运行。跳过到第 3 步。

**返回连接被拒绝或无响应？** worker 未在运行。继续下方操作。

#### 如果 Claude Code 已安装 claude-mem

如果 claude-mem 已作为 Claude Code 插件安装（位于 `~/.claude/plugins/marketplaces/thedotmack/`），请从该安装目录启动 worker：

```bash
cd ~/.claude/plugins/marketplaces/thedotmack
npm run worker:restart
```

验证：
```bash
curl http://localhost:37777/api/health
```

**返回 `{"status":"ok"}`？** 你已经完成了。跳过到第 3 步。

**仍未生效？** 检查 `npm run worker:status` 查看错误详情，或确认 bun 已安装并且在 PATH 中。

#### 如果未安装 Claude Code

从克隆的仓库启动 worker：

```bash
cd /opt/claude-mem  # wherever you cloned it
npm run worker:start
```

验证：
```bash
curl http://localhost:37777/api/health
```

**返回 `{"status":"ok"}`？** 你已经完成了。进入第 3 步。

**仍未生效？** 排查步骤：
- 检查是否安装了 bun：`bun --version`
- 检查 worker 状态：`npm run worker:status`
- 检查是否有其他进程占用端口 37777：`lsof -i :37777`
- 检查日志：`npm run worker:logs`（如果可用）
- 尝试直接运行以查看错误：`bun plugin/scripts/worker-service.cjs start`

### 第 3 步：将插件添加到网关

将 `claude-mem` 插件添加到 OpenClaw 网关配置中：

```json
{
  "plugins": {
    "claude-mem": {
      "enabled": true,
      "config": {
        "project": "my-project",
        "syncMemoryFile": true,
        "workerPort": 37777
      }
    }
  }
}
```

#### 配置字段说明

- **`project`**（string，默认值：`"openclaw"`）— 在记忆数据库中限定所有观测范围的项目名称。每个网关/用例请使用唯一名称，以免观测记录混淆。例如，如果该网关运行的是代码机器人，请使用 `"coding-bot"`。

- **`syncMemoryFile`**（boolean，默认值：`true`）— 启用后，插件会通过 `before_prompt_build` 钩子将观测时间线注入到每个代理的系统提示词。这使代理可在跨会话中获得上下文，而不需要写入 MEMORY.md。若要完全禁用上下文注入，请设置为 `false`（观测仍会被记录）。

- **`syncMemoryFileExclude`**（string[]，默认值：`[]`）— 被排除出自动上下文注入的代理 ID。适用于自行维护记忆的代理。被排除的代理仍会记录观测。

- **`workerPort`**（number，默认值：`37777`）— claude-mem worker 服务监听的端口。仅在你将 worker 配置到其他端口时修改。

---

## 第 4 步：重启网关并验证

重启 OpenClaw 网关以使其加载新插件配置。重启后检查网关日志是否出现：

```
[claude-mem] OpenClaw plugin loaded — v1.0.0 (worker: 127.0.0.1:37777)
```

如果看到这行，说明插件已加载。你也可以在任意 OpenClaw 会话中运行 `/claude_mem_status` 进行验证：

```
Claude-Mem Worker Status
Status: ok
Port: 37777
Active sessions: 0
Observation feed: disconnected
```

观测流显示 `disconnected` 是因为我们尚未配置它，下一步会完成。

## 第 5 步：验证观测是否已记录

让一个代理执行一些工作。插件会通过以下 OpenClaw 事件自动记录观测：

1. **`before_agent_start`** — 在代理启动时初始化一个 claude-mem 会话
2. **`before_prompt_build`** — 将观测时间线注入代理的系统提示词（缓存 60 秒）
3. **`tool_result_persist`** — 将每次工具调用（Read、Write、Bash 等）记录为一条观测
4. **`agent_end`** — 总结会话并将其标记为完成

这一切都会自动发生，无需额外配置。

要验证是否生效，可打开 worker 的查看器 UI：http://localhost:37777，观察代理运行后是否出现观测记录。

你也可以打开 worker 的查看器 UI：http://localhost:37777，查看观测记录是否实时出现。

## 第 6 步：设置观测流（流式推送到频道）

观测流会连接到 claude-mem worker 的 SSE（Server-Sent Events）流，并将每条新观测实时转发到消息频道。你的代理在学习，你也可以在 Telegram/Discord/Slack 等平台上实时看到它们的学习过程。

### 你会看到什么

每次 claude-mem 因代理工具调用创建新观测时，你的频道中会出现类似消息：

```
🧠 Claude-Mem Observation
**Implemented retry logic for API client**
Added exponential backoff with configurable max retries to handle transient failures
```

### 选择你的频道

你需要两样内容：
- **频道类型** — 必须与已在 OpenClaw 网关中运行的频道插件匹配
- **目标 ID** — 消息要发送到的聊天/频道/用户 ID

#### Telegram

频道类型：`telegram`

查找你的聊天 ID：
1. 在 Telegram 上给 @userinfobot 发消息 — https://t.me/userinfobot
2. 它会回复你的数字聊天 ID（例如 `123456789`）
3. 群聊的 ID 为负数（例如 `-1001234567890`）

```json
"observationFeed": {
  "enabled": true,
  "channel": "telegram",
  "to": "123456789"
}
```

#### Discord

频道类型：`discord`

查找你的频道 ID：
1. 在 Discord 打开开发者模式：Settings → Advanced → Developer Mode
2. 右键目标频道 → Copy Channel ID

```json
"observationFeed": {
  "enabled": true,
  "channel": "discord",
  "to": "1234567890123456789"
}
```

#### Slack

频道类型：`slack`

查找你的频道 ID（不是频道名称）：
1. 在 Slack 中打开该频道
2. 点击顶部的频道名称
3. 下拉到频道详情底部 — ID 看起来像 `C01ABC2DEFG`

#### Signal

频道类型：`signal`

使用在你的 OpenClaw 网关的 Signal 插件中配置的电话号码或群组 ID。

```json
"observationFeed": {
  "enabled": true,
  "channel": "signal",
  "to": "+1234567890"
}
```

#### WhatsApp

频道类型：`whatsapp`

使用在你的 OpenClaw 网关的 WhatsApp 插件中配置的电话号码或群组 JID。

```json
"observationFeed": {
  "enabled": true,
  "channel": "whatsapp",
  "to": "+1234567890"
}
```

#### LINE

频道类型：`line`

使用 LINE Developer Console 中的用户 ID 或群组 ID。

```json
"observationFeed": {
  "enabled": true,
  "channel": "line",
  "to": "U1234567890abcdef"
}
```

### 将其添加到你的配置中

你现在可以将插件配置写成如下（以 Telegram 为例）：

```json
{
  "plugins": {
    "claude-mem": {
      "enabled": true,
      "config": {
        "project": "my-project",
        "syncMemoryFile": true,
        "workerPort": 37777,
        "observationFeed": {
          "enabled": true,
          "channel": "telegram",
          "to": "123456789"
        }
      }
    }
  }
}
```

### 重启并验证

重启网关。按顺序检查日志中的以下三行：

```
[claude-mem] Observation feed starting — channel: telegram, target: 123456789
[claude-mem] Connecting to SSE stream at http://localhost:37777/stream
[claude-mem] Connected to SSE stream
```

然后在任意 OpenClaw 聊天中运行 `/claude_mem_feed`：

```
Claude-Mem Observation Feed
Enabled: yes
Channel: telegram
Target: 123456789
Connection: connected
```

如果 `Connection` 显示 `connected`，则说明已完成。让一个 agent 开始工作并观察观察内容是否流到你的频道。

## 命令参考

该插件会注册两个命令：

### /claude_mem_status

报告 worker 健康状态和当前会话状态。

```
/claude_mem_status
```

输出：
```
Claude-Mem Worker Status
Status: ok
Port: 37777
Active sessions: 2
Observation feed: connected
```

### /claude_mem_feed

显示观察源状态。接受可选的 `on`/`off` 参数。

```
/claude_mem_feed          — show status
/claude_mem_feed on       — request enable (update config to persist)
/claude_mem_feed off      — request disable (update config to persist)
```

## 工作原理

```
OpenClaw Gateway
  │
  ├── before_agent_start ───→ Init session
  ├── before_prompt_build ──→ Inject context into system prompt
  ├── tool_result_persist ──→ Record observation
  ├── agent_end ────────────→ Summarize + Complete session
  └── gateway_start ────────→ Reset session tracking + context cache
                    │
                    ▼
         Claude-Mem Worker (localhost:37777)
           ├── POST /api/sessions/init
           ├── POST /api/sessions/observations
           ├── POST /api/sessions/summarize
           ├── POST /api/sessions/complete
           ├── GET  /api/context/inject ──→ System prompt context
           └── GET  /stream ─────────────→ SSE → Messaging channels
```

### 系统提示词上下文注入

该插件通过 `before_prompt_build` hook 将观察时间线注入到每个 agent 的系统提示词中。内容来自 worker 的 `GET /api/context/inject` 接口。为避免每次 LLM 回合都重新获取，系统上下文会按项目缓存 60 秒。缓存会在网关重启时清空。

这将 `MEMORY.md` 保持在 agent 的管控下用于策划长期记忆，而观察时间线则通过系统提示词下发。

### 观察记录

每次工具调用（Read、Write、Bash 等）都会以观察项的形式发送到 claude-mem worker。worker 的 AI agent 会将其处理为带有标题、子标题、事实、概念和叙事的结构化观察。带有 `memory_` 前缀的工具会被跳过，以避免递归记录。

### 会话生命周期

- **`before_agent_start`** — 在 worker 中创建会话。
- **`before_prompt_build`** — 获取观察时间线并作为 `appendSystemContext` 返回。缓存 60 秒。
- **`tool_result_persist`** — 记录观察（fire-and-forget）。工具响应会被截断为 1000 个字符。
- **`agent_end`** — 发送最后一条 assistant 消息用于摘要，然后完成会话。两者均为 fire-and-forget。
- **`gateway_start`** — 清空所有会话跟踪（会话 ID、上下文缓存），以便 agent 重新开始。

### 观察源

后台服务会连接到 worker 的 SSE 流，并将 `new_observation` 事件转发到配置的消息频道。连接会自动重连，并采用指数退避（1 秒 → 最大 30 秒）。

## 故障排查

| 问题 | 检查项 |
|---------|---------------|
| Worker 健康检查失败 | 是否已安装 bun？（`bun --version`）。端口 37777 上是否有其他进程占用？（`lsof -i :37777`）。尝试直接运行：`bun plugin/scripts/worker-service.cjs start` |
| Worker 已从 Claude Code 安装启动但未响应 | 检查 `cd ~/.claude/plugins/marketplaces/thedotmack && npm run worker:status`。可能需要执行 `npm run worker:restart`。 |
| Worker 已从克隆仓库启动但未响应 | 检查 `cd /path/to/claude-mem && npm run worker:status`。确保先执行了 `npm install && npm run build`。 |
| agent 系统提示词中没有上下文 | 检查 `syncMemoryFile` 是否未设为 `false`。检查 agent 的 ID 是否在 `syncMemoryFileExclude` 中。确认 worker 正在运行并且有 observation。 |
| 观察未被记录 | 检查网关日志中的 `[claude-mem]` 消息。worker 必须正在运行并可在 localhost:37777 访问。 |
| Feed 显示 `disconnected` | Worker 的 `/stream` 端点不可达。检查 `workerPort` 是否与实际 worker 端口一致。 |
| Feed 显示 `reconnecting` | 连接已断开。插件会自动重连——请等待最多 30 秒。 |
| 日志中出现 `Unknown channel type` | 你的网关上未加载频道插件（例如 telegram）。确保该频道已配置且正在运行。 |
| 日志中出现 `Observation feed disabled` | 在配置中将 `observationFeed.enabled` 设置为 `true`。 |
| 日志中出现 `Observation feed misconfigured` | `observationFeed.channel` 和 `observationFeed.to` 都是必填项。 |
| 虽显示 `connected` 但频道中无消息 | feed 只发送已处理的观察，不会发送原始工具使用记录。存在 1-2 秒延迟。确保 worker 实际在处理观察（检查 http://localhost:37777）。 |

## 完整配置参考

```json
{
  "plugins": {
    "claude-mem": {
      "enabled": true,
      "config": {
        "project": "openclaw",
        "syncMemoryFile": true,
        "workerPort": 37777,
        "observationFeed": {
          "enabled": false,
          "channel": "telegram",
          "to": "123456789"
        }
      }
    }
  }
}
```

| 字段 | 类型 | 默认值 | 说明 |
|-------|------|---------|-------------|
| `project` | string | `"openclaw"` | 在数据库中按项目名对 observation 进行作用域划分 |
| `syncMemoryFile` | boolean | `true` | 将 observation 上下文注入 agent 的系统提示词 |
| `syncMemoryFileExclude` | string[] | `[]` | 被排除在上下文注入外的 agent ID |
| `workerPort` | number | `37777` | Claude-mem worker 服务端口 |
| `observationFeed.enabled` | boolean | `false` | 将 observations 流式推送到消息频道 |
| `observationFeed.channel` | string | — | 频道类型：`telegram`、`discord`、`slack`、`signal`、`whatsapp`、`line` |
| `observationFeed.to` | string | — | 目标聊天/频道/用户 ID |
