---
name: claude-to-im
description: |
  Bridge THIS Claude Code or Codex session to Telegram, Discord, Feishu/Lark, QQ, or WeChat so the
  user can chat with Claude from their phone. Use for: setting up, starting, stopping,
  or diagnosing the claude-to-im bridge daemon; forwarding Claude replies to a messaging
  app; any phrase like "claude-to-im", "bridge", "消息推送", "消息转发", "桥接",
  "连上飞书", "手机上看claude", "启动后台服务", "诊断", "查看日志", "配置".
  Subcommands: setup, start, stop, status, logs, reconfigure, doctor.
  Do NOT use for: building standalone bots, webhook integrations, or coding with IM
  platform SDKs — those are regular programming tasks.
argument-hint: "setup | start | stop | status | logs [N] | reconfigure | doctor"
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - AskUserQuestion
  - Grep
  - Glob
---
# Claude-to-IM 桥接技能

你正在管理 Claude-to-IM 桥接。
用户数据存储在 `~/.claude-to-im/`。

技能目录（SKILL_DIR）位于 `~/.claude/skills/claude-to-im`。
在 Codex 安装中，它也可能位于 `~/.codex/skills/Claude-to-IM-skill`。
如果这两个路径都不存在，则回退到使用 Glob，匹配模式为 `**/skills/**/claude-to-im/SKILL.md` 或 `**/skills/**/Claude-to-IM-skill/SKILL.md`，并根据结果推导根目录。

## 命令解析

将 `$ARGUMENTS` 中的用户意图解析为以下子命令之一：

| 用户说（示例） | 子命令 |
|---|---|
| `setup`, `configure`, `配置`, `我想在飞书上用 Claude`, `帮我连接 Telegram`, `帮我接微信` | setup |
| `start`, `start bridge`, `启动`, `启动桥接` | start |
| `stop`, `stop bridge`, `停止`, `停止桥接` | stop |
| `status`, `bridge status`, `状态`, `运行状态`, `怎么看桥接的运行状态` | status |
| `logs`, `logs 200`, `查看日志`, `查看日志 200` | logs |
| `reconfigure`, `修改配置`, `帮我改一下 token`, `换个 bot` | reconfigure |
| `doctor`, `diagnose`, `诊断`, `挂了`, `没反应了`, `bot 没反应`, `出问题了` | doctor |

**消歧：`status` 与 `doctor`** — 当用户只是想检查桥接是否正在运行（信息查询）时，使用 `status`。当用户报告问题或怀疑某处出现故障（诊断）时，使用 `doctor`。如果不确定，而用户描述了某种症状（例如“没反应了”“挂了”），优先使用 `doctor`。

提取 `logs` 的可选数字参数（默认值为 50）。

在向用户询问任何平台凭据之前，先在内部读取 `SKILL_DIR/references/setup-guides.md`，以了解在哪里查找各项凭据。不要一开始就把完整指南全部展示给用户——只需说明他们接下来需要执行的具体步骤（例如：“前往 https://open.feishu.cn → 你的应用 → 凭证，查找 App ID”）。如果用户表示不知道如何操作，再展示指南中的相关章节。

## 运行时环境检测

在执行任何子命令之前，检测当前运行环境：

1. **Claude Code** — `AskUserQuestion` 工具可用。使用它运行交互式设置向导。
2. **Codex / 其他环境** — `AskUserQuestion` 不可用。回退到非交互式指导：说明操作步骤，展示 `SKILL_DIR/config.env.example`，并让用户手动创建 `~/.claude-to-im/config.env`。

你可以通过检查可用工具列表中是否存在 AskUserQuestion 来判断。

## 配置检查（适用于 `start`、`stop`、`status`、`logs`、`reconfigure`、`doctor`）

在运行除 `setup` 之外的任何子命令之前，检查 `~/.claude-to-im/config.env` 是否存在：

- **如果不存在：**
  - 在 Claude Code 中：告知用户“未找到配置”，并使用 AskUserQuestion 自动启动 `setup` 向导。
  - 在 Codex 中：告知用户“未找到配置。请根据以下示例创建 `~/.claude-to-im/config.env`：”，然后展示 `SKILL_DIR/config.env.example` 的内容并停止。不要尝试启动守护进程——缺少 config.env 时，进程会在启动时崩溃，并遗留一个陈旧的 PID 文件，阻止后续启动。
- **如果存在：**继续执行请求的子命令。

## 子命令

### `setup`

运行交互式设置向导。此子命令需要 `AskUserQuestion`。如果该功能不可用（Codex 环境），则改为显示 `SKILL_DIR/config.env.example` 的内容，逐字段进行说明，并指导用户手动创建配置文件。

当 `AskUserQuestion` 可用时，**一次只收集一个字段**。每次用户回答后，先向用户确认该值（对于密钥，仅显示最后 4 个字符，其余部分需隐藏），然后再进入下一个问题。

**第 1 步 — 选择渠道**

询问要启用哪些渠道（telegram、discord、feishu、qq、weixin）。接受以逗号分隔的输入。简要说明每个渠道：
- **telegram** — 最适合个人使用。支持流式预览和内联权限按钮。
- **discord** — 适合团队使用。支持服务器、频道和用户级访问控制。
- **feishu** (Lark) — 适用于飞书/Lark 团队。支持流式卡片、工具进度和内联权限按钮。
- **qq** — 仅支持 QQ C2C 私聊。不支持内联权限按钮和流式预览。权限通过文本 `/perm ...` 命令管理。
- **weixin** — 使用微信扫码登录。仅支持关联一个账号；重新登录会替换之前的账号。不支持内联权限按钮和流式预览。权限通过文本 `/perm ...` 命令或快捷回复 `1/2/3` 管理。语音消息仅使用微信自身语音转文字所返回的文本；桥接程序不会转写原始语音音频。

**第 2 步 — 收集各渠道的令牌**

对于每个已启用的渠道，一次收集一个凭证。用一句话告诉用户可以在哪里找到每个值。仅当用户请求帮助或表示不知道如何操作时，才显示完整的指南章节（来自 `SKILL_DIR/references/setup-guides.md`）：

- **Telegram**：Bot Token → 确认（隐藏）→ Chat ID（获取方式请参阅指南）→ 确认 → Allowed User IDs（可选）。**重要：**必须至少设置 Chat ID 或 Allowed User IDs 之一，否则机器人将拒绝所有消息。
- **Discord**：Bot Token → 确认（隐藏）→ Allowed User IDs → Allowed Channel IDs（可选）→ Allowed Guild IDs（可选）。**重要：**必须至少设置 Allowed User IDs 或 Allowed Channel IDs 之一，否则机器人将拒绝所有消息（默认拒绝）。
- **Feishu**：App ID → 确认 → App Secret → 确认（隐藏）→ Domain（可选）→ Allowed User IDs（可选）。收集凭证后，说明用户必须完成的两阶段设置：
  - **阶段 1**（启动桥接程序之前）：(A) 批量添加权限，(B) 启用机器人能力，(C) 发布第一个版本并由管理员审批。这样可使权限和机器人生效。
  - **阶段 2**（需要桥接程序正在运行）：(D) 运行 `/claude-to-im start`，(E) 使用长连接模式配置事件（`im.message.receive_v1`）和回调（`card.action.trigger`），(F) 发布第二个版本并由管理员审批。
  - **为什么需要两个阶段：**保存事件订阅时，飞书会验证 WebSocket 连接——如果桥接程序未运行，保存将失败。桥接程序需要已发布的权限才能连接。
  - 以简短的检查清单形式说明即可——仅在用户提出请求时显示完整指南。
- **QQ**：先收集两个必填字段，再收集可选字段：
  1. QQ App ID（必填）→ 确认
  2. QQ App Secret（必填）→ 确认（隐藏）
  - 告知用户：这两个值可在 https://q.qq.com/qqbot/openclaw 找到
  3. Allowed User OpenIDs（可选，按 Enter 跳过）——注意：这是 `user_openid`，**不是** QQ 号。如果用户尚无 openid，可以留空。
  4. Image Enabled（可选，默认为 true，按 Enter 跳过）——如果底层提供方不支持图片输入，请设为 false
  5. Max Image Size MB（可选，默认为 20，按 Enter 跳过）
  - 提醒用户：QQ 首个版本仅支持 C2C 私聊沙箱访问。不支持群组/频道、内联按钮和流式预览。
- **Weixin**：不要询问静态令牌。改为：
  1. 告知用户此渠道使用扫码登录，而不是手动输入凭证。
  2. 运行 `cd SKILL_DIR && npm run weixin:login`
  3. 辅助程序会写入 `~/.claude-to-im/runtime/weixin-login.html`，并尝试自动在本地浏览器中打开该文件。
  4. 如果自动打开失败，告知用户手动打开该 HTML 文件，并使用微信扫描二维码。
  5. 等待辅助程序报告成功，然后确认关联的账号已保存到本地。
  - 简要说明：关联的 Weixin 账号存储在 `~/.claude-to-im/data/weixin-accounts.json` 中。再次运行该辅助程序会替换之前关联的账号。
  - 简要说明：`CTI_WEIXIN_MEDIA_ENABLED` 仅控制传入图片/文件/视频的下载。对于语音消息，桥接程序仅接受微信内置语音转文字所返回的文本。如果微信未提供转写文本，桥接程序会回复错误，而不会下载或转写原始音频。

**第 3 步 — 常规设置**

询问运行时、默认工作目录、模型和模式：
- **运行时**：`claude`（默认）、`codex`、`auto`
  - `claude` — 使用 Claude Code CLI + Claude Agent SDK（需要安装 `claude` CLI）
  - `codex` — 使用 OpenAI Codex SDK（需要 `codex` CLI；通过 `codex auth login` 或 `OPENAI_API_KEY` 进行身份验证）
  - `auto` — 首先尝试 Claude，如果未找到 Claude CLI，则回退到 Codex
- **工作目录**：默认为 `$CWD`
- **模型**（可选）：留空以继承运行时自身的默认模型。如果用户希望覆盖默认模型，请让他们输入模型名称。不要硬编码或推荐具体的模型名称——可用模型会随时间变化。
- **模式**：`code`（默认）、`plan`、`ask`

**第 4 步 — 写入配置并验证**

1. 显示包含所有设置的最终汇总表（密钥仅显示最后 4 个字符，其余部分隐藏）
2. 写入前请用户确认
3. 使用 Bash 创建目录结构：`mkdir -p ~/.claude-to-im/{data,logs,runtime,data/messages}`
4. 使用 Write 创建 `~/.claude-to-im/config.env`，以 KEY=VALUE 格式写入所有设置
5. 使用 Bash 设置权限：`chmod 600 ~/.claude-to-im/config.env`
6. 验证令牌——读取 `SKILL_DIR/references/token-validation.md`，获取各平台的确切命令和预期响应。这样可以在用户尝试启动守护进程之前发现输入错误和凭据错误。对于微信，成功完成二维码登录即可视为验证通过。
7. 使用汇总表报告结果。如果有任何验证失败，请解释可能的问题及其修复方法。
8. 成功后，告诉用户：“设置完成！运行 `/claude-to-im start` 以启动桥接服务。”

### `start`

**预检查：**验证 `~/.claude-to-im/config.env` 是否存在（参见上面的“配置检查”）。如果不存在，守护进程会立即崩溃并留下过期的 PID 文件。

运行：`bash "SKILL_DIR/scripts/daemon.sh" start`

向用户显示输出。如果失败，告诉用户：
- 运行 `doctor` 进行诊断：`/claude-to-im doctor`
- 查看最近的日志：`/claude-to-im logs`

### `stop`

运行：`bash "SKILL_DIR/scripts/daemon.sh" stop`

### `status`

运行：`bash "SKILL_DIR/scripts/daemon.sh" status`

### `logs`

从参数中提取可选的行数 N（默认为 50）。
运行：`bash "SKILL_DIR/scripts/daemon.sh" logs N`

### `reconfigure`

1. 从 `~/.claude-to-im/config.env` 读取当前配置
2. 以清晰的表格格式显示当前设置，并隐藏所有密钥（仅显示最后 4 个字符）
3. 使用 AskUserQuestion 询问用户想要更改的内容
4. 收集新值时，告诉用户可从哪里找到该值；只有当用户请求帮助时，才显示 `SKILL_DIR/references/setup-guides.md` 中的完整指南
5. 以原子方式更新配置文件（写入 tmp，然后重命名）
6. 重新验证所有已更改的令牌
7. 提醒用户：“运行 `/claude-to-im stop`，然后运行 `/claude-to-im start` 以应用更改。”

如果用户想在 `reconfigure` 期间切换微信账号，请再次运行 `cd SKILL_DIR && npm run weixin:login`。每次成功扫码都会替换之前关联的本地账号。

### `doctor`

运行：`bash "SKILL_DIR/scripts/doctor.sh"`

显示结果，并针对所有失败项建议修复方法。常见修复方法：
- 缺少 SDK cli.js → `cd SKILL_DIR && npm install`
- dist/daemon.mjs 已过期 → `cd SKILL_DIR && npm run build`
- 缺少配置 → 运行 `setup`
- 缺少 Weixin 账号或账号已过期 → `cd SKILL_DIR && npm run weixin:login`
- Weixin 语音消息提示缺少语音转文字功能 → 启用微信自带的语音转文字功能并重新发送；该桥接程序本身不会转写原始语音音频

对于更复杂的问题（未收到消息、权限超时、内存占用过高、PID 文件过期），请阅读 `SKILL_DIR/references/troubleshooting.md` 以获取详细的诊断步骤。

**飞书升级说明：** 如果用户从此技能的旧版本升级后，飞书返回权限错误（例如流式卡片无法工作、输入状态指示失败、权限按钮无响应），根本原因几乎肯定是飞书后端缺少权限或回调。请引导用户查看 `SKILL_DIR/references/setup-guides.md` 中的“从旧版本升级”部分——他们需要添加新的权限范围（`cardkit:card:write`、`cardkit:card:read`、`im:message:update`、`im:message.reactions:read`、`im:message.reactions:write_only`），添加 `card.action.trigger` 回调，并重新发布应用。此次升级需要执行两次发布，因为添加回调需要有效的 WebSocket 连接（桥接程序必须正在运行）。

## 注意事项

- 输出中始终对密钥进行掩码处理（仅显示最后 4 个字符）——用户经常会在错误报告中分享终端输出，因此暴露令牌将构成安全事件。
- 启动守护进程前，始终检查 config.env 是否存在——如果缺少该文件，进程会在启动时崩溃，并留下阻止后续启动的过期 PID 文件（需要手动清理）。
- 守护进程以后台 Node.js 进程运行，由平台的进程管理器管理（macOS 上为 launchd，Linux 上为 setsid，Windows 上为 WinSW/NSSM）。
- 配置持久保存在 `~/.claude-to-im/config.env`——可跨会话保留。