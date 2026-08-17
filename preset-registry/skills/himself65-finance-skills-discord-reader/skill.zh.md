---
name: discord-reader
description: >
  Read Discord for financial research using opencli (read-only).
  Use this skill whenever the user wants to read Discord channels, search for messages
  in trading servers, view guild/channel info, monitor crypto or market discussion groups,
  or gather financial sentiment from Discord.
  Triggers include: "check my Discord", "search Discord for", "read Discord messages",
  "what's happening in the trading Discord", "show Discord channels", "list my servers",
  "Discord sentiment on BTC", "what are people saying in Discord about AAPL",
  "monitor crypto Discord", any mention of Discord in context
  of reading financial news, market research, or trading community discussions.
  This skill is READ-ONLY — it does NOT support sending messages, reacting, or any write operations.
---
# Discord Skill（只读）

使用 [opencli](https://github.com/jackwener/opencli) 读取 Discord，以开展金融研究。opencli 是一款通用 CLI 工具，可通过 Chrome DevTools Protocol (CDP) 将桌面应用和 Web 服务连接到终端。

**此 Skill 为只读。** 它专为金融研究而设计：搜索交易服务器中的讨论、监控加密货币/市场群组、跟踪金融社区的情绪，以及阅读消息。它不支持发送消息、添加回应、编辑、删除或任何写入操作。

**重要提示**：opencli 通过 CDP 连接 Discord 桌面应用——无需机器人账户，也无需提取令牌。只需确保 Discord Desktop 正在运行。

---

## 第 1 步：确保已安装 opencli 且 Discord 已准备就绪

**当前环境状态：**

```
!`(command -v opencli && opencli discord-app status 2>&1 | head -5 && echo "READY" || echo "SETUP_NEEDED") 2>/dev/null || echo "NOT_INSTALLED"`
```

如果上方状态显示 `READY`，请跳至第 2 步。如果显示 `NOT_INSTALLED`，请先安装：

```bash
# Install opencli globally
npm install -g @jackwener/opencli
```

如果显示 `SETUP_NEEDED`，请指导用户完成设置：

### 设置

opencli 要求 Node.js >= 20。它通过 CDP（Chrome DevTools Protocol）连接 Discord Desktop——Discord 适配器不需要 Browser Bridge 扩展。需要完成以下两项：

1. **启用远程调试并启动 Discord：**

```bash
# macOS
/Applications/Discord.app/Contents/MacOS/Discord --remote-debugging-port=9232 &

# Linux
discord --remote-debugging-port=9232 &
```

2. **设置 CDP 端点环境变量：**

```bash
export OPENCLI_CDP_ENDPOINT="http://127.0.0.1:9232"
```

将此内容添加到你的 shell 配置文件（`.zshrc` / `.bashrc`）中，使其在不同会话间持续生效。

3. **验证连接：**

```bash
opencli discord-app status
```

### 常见设置问题

| 症状 | 解决方法 |
|---------|-----|
| `CDP connection refused` | 确保 Discord 正在使用 `--remote-debugging-port=9232` 运行 |
| `OPENCLI_CDP_ENDPOINT not set` | 运行 `export OPENCLI_CDP_ENDPOINT="http://127.0.0.1:9232"` |
| `status` 显示连接已断开 | 使用 CDP 标志重启 Discord，然后重试 |
| Discord 未使用预期端口 | 检查是否有其他应用正在使用端口 9232，或改用其他端口 |

### 提示：创建 shell 别名

```bash
alias discord-cdp='/Applications/Discord.app/Contents/MacOS/Discord --remote-debugging-port=9232 &'
```

---

## 第 2 步：确定用户的需求

将用户的请求与下方某个读取命令相匹配，然后使用 `references/commands.md` 中对应的命令。

| 用户请求 | 命令 | 关键标志 |
|---|---|---|
| 检查连接 | `opencli discord-app status` | — |
| 列出服务器 | `opencli discord-app servers` | `-f json` |
| 列出频道 | `opencli discord-app channels` | `-f json` |
| 列出在线成员 | `opencli discord-app members` | `-f json` |
| 读取最近的消息 | `opencli discord-app read` | `N`（数量）、`-f json` |
| 搜索消息 | `opencli discord-app search "QUERY"` | `-f json` |

**注意：** opencli 作用于 Discord 中**当前活跃的**服务器和频道。若要读取其他频道，用户必须先在 Discord 应用中切换到该频道，或使用 `channels` 命令确认有哪些可用频道。

---

## 步骤 3：执行命令

### 通用模式

```bash
# Use -f json or -f yaml for structured output
opencli discord-app servers -f json
opencli discord-app channels -f json

# Read recent messages from the active channel
opencli discord-app read 50 -f json

# Search for financial topics in the active channel
opencli discord-app search "AAPL earnings" -f json
opencli discord-app search "BTC pump" -f json
```

### 关键规则

1. **先检查连接** — 在执行任何其他命令之前，先运行 `opencli discord-app status`
2. **使用 `-f json` 或 `-f yaml`** — 以便在以编程方式处理数据时获得结构化输出
3. **先在 Discord 中切换频道** — opencli 从 Discord 应用中当前活跃的服务器/频道读取内容
4. **从少量消息开始读取** — 除非用户要求读取更多，否则使用 `opencli discord-app read 20`
5. **使用搜索查找关键词** — `opencli discord-app search` 使用 Discord 的内置搜索功能（Cmd+F / Ctrl+F）
6. **绝不执行写入操作** — 此技能为只读。opencli 提供了 `discord-app send` 和 `discord-app delete` 命令；不要调用它们。不要发送消息、添加回应、编辑、删除内容或管理服务器设置。

### 输出格式标志（`-f`）

| 格式 | 标志 | 最适合 |
|---|---|---|
| 表格 | `-f table`（默认） | 人类可读的终端输出 |
| JSON | `-f json` | 编程处理、LLM 上下文 |
| YAML | `-f yaml` | 结构化且可读的输出 |
| Markdown | `-f md` | 文档、报告 |
| CSV | `-f csv` | 导出到电子表格 |

### 读取服务器内容的典型工作流程

```bash
# 1. Verify connection
opencli discord-app status

# 2. List servers to confirm you're in the right one
opencli discord-app servers -f json

# 3. List channels in the current server
opencli discord-app channels -f json

# 4. Read recent messages (navigate to target channel in Discord first)
opencli discord-app read 50 -f json

# 5. Search for topics of interest
opencli discord-app search "price target" -f json
```

---

## 步骤 4：呈现结果

获取数据后，以清晰的方式呈现结果，供金融研究使用：

1. **总结关键内容** — 突出显示与用户金融研究最相关的消息
2. **包含来源信息** — 显示用户名、消息内容和时间戳
3. **对于搜索结果**，按相关性分组，并突出显示关键主题、情绪或市场信号
4. **对于服务器/频道列表**，使用整洁的表格呈现名称和类型
5. **标注市场情绪** — 指出看涨/看跌情绪，以及共识观点与逆向观点
6. **将会话视为私密信息** — 绝不暴露 CDP 端点或会话详细信息

---

## 步骤 5：诊断

如果某些功能无法正常工作，请检查：

1. **Discord 是否已启用 CDP 并正在运行？**
```bash
# Check if the port is open
lsof -i :9232
```

2. **环境变量是否已设置？**
```bash
echo $OPENCLI_CDP_ENDPOINT
```

3. **opencli 能否连接？**
```bash
opencli discord-app status
```

如果所有检查均失败，请使用 CDP 标志重启 Discord：
```bash
/Applications/Discord.app/Contents/MacOS/Discord --remote-debugging-port=9232 &
export OPENCLI_CDP_ENDPOINT="http://127.0.0.1:9232"
opencli discord-app status
```

---

## 错误参考

| 错误 | 原因 | 解决方法 |
|-------|-------|-----|
| `CDP connection refused` | Discord 未使用 CDP 运行，或端口错误 | 使用 `--remote-debugging-port=9232` 启动 Discord |
| `OPENCLI_CDP_ENDPOINT not set` | 缺少环境变量 | `export OPENCLI_CDP_ENDPOINT="http://127.0.0.1:9232"` |
| `No active channel` | 当前未在 Discord 中查看任何频道 | 在 Discord 应用中转到一个频道 |
| 请求频率受限 | 请求过多 | 等待几分钟，然后重试 |

---

## 参考文件

- `references/commands.md` — 完整的读取命令参考，包含所有标志和用法示例

需要准确的命令语法或详细的标志说明时，请阅读该参考文件。