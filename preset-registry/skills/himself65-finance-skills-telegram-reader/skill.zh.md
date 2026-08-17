---
name: telegram-reader
description: >
  Read Telegram channels and groups for financial news and market research using tdl (read-only).
  Use this skill whenever the user wants to read Telegram channels, export messages from financial
  Telegram groups, list their Telegram chats, search for news in Telegram channels, or gather
  market intelligence from Telegram.
  Triggers include: "check my Telegram", "read Telegram channel", "Telegram news",
  "what's new in my Telegram channels", "export messages from", "list my Telegram chats",
  "financial news on Telegram", "crypto Telegram", "market news Telegram",
  any mention of Telegram in context of reading financial news, crypto signals, or market research.
  This skill is READ-ONLY — it does NOT support sending messages, joining channels, or any write operations.
---
# Telegram 新闻技能（只读）

使用 Telegram CLI 工具 [tdl](https://github.com/iyear/tdl) 读取 Telegram 频道和群组，以获取财经新闻并进行市场研究。

**此技能为只读。** 它专为金融研究而设计：读取频道消息、监控财经新闻频道以及导出消息历史记录。它不支持发送消息、加入/退出频道或任何写入操作。

---

## 第 1 步：确保已安装 tdl

**当前环境状态：**

```
!`(command -v tdl && tdl version 2>&1 | head -3 || echo "TDL_NOT_INSTALLED") 2>/dev/null`
```

如果上述状态显示版本号，则表示已安装 tdl——请跳至第 2 步。

如果显示 `TDL_NOT_INSTALLED`，请根据用户的平台安装 tdl：

| 平台 | 安装命令 |
|----------|----------------|
| macOS / Linux | `curl -sSL https://docs.iyear.me/tdl/install.sh \| sudo bash` |
| macOS (Homebrew) | `brew install telegram-downloader` |
| Linux (Termux) | `pkg install tdl` |
| Linux (AUR) | `yay -S tdl` |
| Linux (Nix) | `nix-env -iA nixos.tdl` |
| Go（任何平台） | `go install github.com/iyear/tdl@latest` |

询问用户偏好哪种安装方式。macOS 默认使用 Homebrew，Linux 默认使用 curl 脚本。

---

## 第 2 步：确保 tdl 已通过身份验证

**当前身份验证状态：**

```
!`(tdl chat ls --limit 1 2>&1 >/dev/null && echo "AUTH_OK" || echo "AUTH_NEEDED") 2>/dev/null`
```

如果显示 `AUTH_OK`，请跳至第 3 步。

如果显示 `AUTH_NEEDED`，请指导用户完成登录。**登录需要交互式输入**——用户必须手动输入电话号码和验证码。

### 登录方式

**方式 A：二维码（推荐——最快）**

```bash
tdl login -T qr
```

终端中将显示一个二维码。用户使用 Telegram 移动应用扫描该二维码（设置 > 设备 > 连接桌面设备）。

**方式 B：电话号码 + 验证码**

```bash
tdl login -T code
```

用户输入电话号码，然后输入发送到其 Telegram 应用的验证码。

**方式 C：从 Telegram Desktop 导入**

如果用户已安装并登录 Telegram Desktop：

```bash
tdl login
```

这会从现有的桌面客户端导入会话。桌面客户端必须来自[官方网站](https://desktop.telegram.org/)，而不能来自 App Store 或 Microsoft Store。

### 命名空间

默认情况下，tdl 使用 `default` 命名空间。要管理多个账户：

```bash
tdl login -n work -T qr      # Login to "work" namespace
tdl chat ls -n work           # Use "work" namespace for commands
```

### 重要登录说明

- 登录是**一次性**操作。成功登录后，会话将持久保存在磁盘上。
- 如果登录失败，请让用户检查网络连接并重试。
- **切勿以编程方式索取或处理 Telegram 密码/双重验证代码**——始终让用户以交互方式输入。

---

## 第 3 步：确定用户的需求

将用户的请求与以下只读操作之一进行匹配。

| 用户请求 | 命令 | 关键标志 |
|---|---|---|
| 列出所有聊天/频道 | `tdl chat ls` | `-o json`, `-f "FILTER"` |
| 仅列出频道 | `tdl chat ls -f "Type contains 'channel'"` | `-o json` |
| 导出最近的消息 | `tdl chat export -c CHAT -T last -i N` | `--all`, `--with-content` |
| 按时间范围导出消息 | `tdl chat export -c CHAT -T time -i START,END` | `--all`, `--with-content` |
| 按 ID 范围导出消息 | `tdl chat export -c CHAT -T id -i FROM,TO` | `--all`, `--with-content` |
| 从话题/讨论串导出 | `tdl chat export -c CHAT --topic TOPIC_ID` | `--all`, `--with-content` |
| 按名称搜索频道 | `tdl chat ls -f "VisibleName contains 'NAME'"` | `-o json` |

### 聊天标识符

`-c` 标志接受多种格式：

| 格式 | 示例 |
|--------|---------|
| 用户名（带 @） | `-c @channel_name` |
| 用户名（不带 @） | `-c channel_name` |
| 数字聊天 ID | `-c 123456789` |
| 公开链接 | `-c https://t.me/channel_name` |
| 电话号码 | `-c "+1 123456789"` |
| 已保存的消息 | `-c ""`（空值） |

---

## 第 4 步：执行命令

### 列出聊天

```bash
# List all chats
tdl chat ls

# JSON output for processing
tdl chat ls -o json

# Filter for channels only
tdl chat ls -f "Type contains 'channel'"

# Search by name
tdl chat ls -f "VisibleName contains 'Bloomberg'"
```

### 导出消息

始终使用 `--all --with-content` 来获取文本消息（而不仅仅是媒体）：

```bash
# Last 20 messages from a channel
tdl chat export -c @channel_name -T last -i 20 --all --with-content -o /tmp/tdl-export.json

# Messages from a time range (Unix timestamps)
tdl chat export -c @channel_name -T time -i 1710288000,1710374400 --all --with-content -o /tmp/tdl-export.json

# Messages by ID range
tdl chat export -c @channel_name -T id -i 100,200 --all --with-content -o /tmp/tdl-export.json
```

### 关键规则

1. **首先检查身份验证** — 在执行其他命令之前运行 `tdl chat ls --limit 1`，以验证会话是否有效
2. **导出消息以供阅读时，始终使用 `--all --with-content`** — 如果没有这些标志，tdl 只会导出媒体消息
3. **使用 `-o FILE`** 将导出内容保存到文件，然后读取 JSON — 这比解析标准输出更可靠
4. **从小规模导出开始** — 除非用户要求更多，否则使用 `-T last -i 20`
5. **对 `chat ls` 使用过滤器**，帮助用户在导出前找到正确的频道
6. **绝不执行写入操作** — 此技能为只读；不要发送消息、加入频道或修改任何内容
7. **转换时间戳** — 当用户提供日期时，将其转换为 Unix 时间戳，以用于 `-T time` 过滤器

### 使用导出的 JSON

导出后，读取 JSON 文件并提取相关信息：

```bash
# Export messages
tdl chat export -c @channel_name -T last -i 20 --all --with-content -o /tmp/tdl-export.json

# Read and process the export
cat /tmp/tdl-export.json
```

导出的 JSON 包含消息对象，其中包含 `id`、`date`、`message`（文本内容）、`from_id`、`views` 等字段以及媒体元数据。

---

## 第 5 步：展示结果

获取数据后，以清晰的方式呈现结果，供金融研究使用：

1. **总结关键消息** — 突出显示最相关的新闻或市场动态
2. **包含时间戳** — 显示每条消息的发布时间
3. **按主题分组** — 如果涉及多个频道，则按主题组织（宏观、财报、加密货币等）
4. **标记可操作信息** — 注明突发新闻、目标价和超预期财报
5. **提供频道上下文** — 说明每条消息来自哪个频道/群组
6. **对于频道列表**，显示频道名称、成员数量和类型

---

## 第 6 步：诊断

如果出现问题：

| 错误 | 原因 | 解决方法 |
|-------|-------|-----|
| `not authorized` 或会话错误 | 未登录或会话已过期 | 运行 `tdl login -T qr` 重新进行身份验证 |
| `FLOOD_WAIT_X` | 受到 Telegram 速率限制 | 等待 X 秒，然后重试 |
| `CHANNEL_PRIVATE` | 无权访问频道 | 用户必须先在自己的 Telegram 应用中加入该频道 |
| `tdl: command not found` | 未安装 tdl | 按照第 1 步进行安装 |

---

## 参考文件

- `references/commands.md` — 用于读取频道和导出消息的完整 tdl 命令参考

当你需要确切的命令语法或详细的标志文档时，请阅读该参考文件。