---
name: peon-ping-use
description: Set which voice pack (character voice) plays for the current chat session. Automatically enables session_override rotation mode if not already set. Use when user wants a specific character voice like GLaDOS, Peon, or Kerrigan for this conversation.
user_invocable: true
license: MIT
metadata:
  author: PeonPing
  version: "1.0"
---
# peon-ping-use

设置当前聊天会话使用的语音包（角色语音）。

## 工作原理

当用户输入 `/peon-ping-use <packname>` 时，**beforeSubmitPrompt hook** 会在命令到达模型之前拦截该命令并立即处理：

1. 验证请求的语音包是否存在
2. 在 config.json 中启用 `session_override` 轮换模式
3. 将当前会话 ID 映射到 .state.json 中请求的语音包
4. 返回即时确认（使用零个 token）

当 hook 阻止消息时，Cursor 会将光标保留在输入框中，因此你可以立即输入下一条消息。

hook 脚本（`scripts/hook-handle-use.sh` 和 `scripts/hook-handle-use.ps1`）会完成所有工作——此 SKILL.md 文件的存在目的仅仅是为了让该功能显示在 `/` 命令自动补全菜单中，便于发现。

## 用法

用户可以通过输入以下内容调用此功能：

```
/peon-ping-use peasant
/peon-ping-use glados
/peon-ping-use sc_kerrigan
```

如果 hook 未安装或执行失败，可以按照下面的说明手动执行。

## 手动备用方案（如果 hook 失败）

如果由于某种原因 hook 没有拦截该命令，请按照以下步骤操作：

### 1. 解析语音包名称

从用户的请求中提取语音包名称。常见的语音包名称包括：
- `peon` — 魔兽争霸苦工
- `glados` — 《Portal》中的 GLaDOS
- `sc_kerrigan` — 《StarCraft》中的 Kerrigan
- `peasant` — 魔兽争霸农民
- `hk47` — 《星球大战》中的 HK-47

### 2. 列出可用语音包

运行此命令查看已安装的语音包：

```bash
bash "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/hooks/peon-ping/peon.sh packs list
```

解析输出以验证请求的语音包是否存在。

### 3. 获取会话 ID

会话 ID 位于环境变量 `CLAUDE_SESSION_ID` 中。读取它：

```bash
echo "$CLAUDE_SESSION_ID"
```

**如果为空（Cursor 用户）：** 使用 `"default"` 作为 `session_packs` 中的键。这会将语音包应用于所有未显式分配语音包的会话。添加 `session_packs["default"] = {"pack": "PACK_NAME", "last_used": UNIX_TIMESTAMP}`。

### 4. 更新配置以启用 session_override 模式

读取配置文件：

```bash
cat "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/hooks/peon-ping/config.json
```

**必需操作：** 将 `pack_rotation_mode` 设置为 `"session_override"`。语音包必须存在于 packs 目录中；如果已分配的语音包缺失或无效，peon-ping 会回退到 `default_pack` 并移除过期的分配。hook 还会将该语音包添加到 `pack_rotation` 中（手动备用方案也可以执行相同操作）。

设置完成后的配置示例：

```json
"pack_rotation_mode": "session_override",
"pack_rotation": ["peasant", "peon", "ra2_kirov"]
```

如果 `pack_rotation_mode` 为 `"random"` 或 `"round-robin"`，请将其更改为 `"session_override"`。如果请求的语音包不在 `pack_rotation` 中，请将其添加进去。

### 5. 更新状态，将语音包分配给此会话

读取状态文件：

```bash
cat "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/hooks/peon-ping/.state.json
```

更新 `session_packs` 对象，将此会话映射到请求的语音包。如果 `session_packs` 不存在，请创建它：

```json
{
  "session_packs": {
    "SESSION_ID_HERE": "pack_name_here"
  }
}
```

使用 StrReplace 或编辑 JSON 以添加/更新条目：

- 如果 `session_packs` 存在：添加或更新 session ID 键
- 如果 `session_packs` 不存在：在开头的大括号之后添加它

### 6. 向用户确认

使用类似以下消息报告成功：

```
Voice set to [PACK_NAME] for this session
   Rotation mode: session_override
```

## 错误处理

- **未找到 Pack**：列出可用的 Pack，并要求用户选择一个
- **没有 session ID**：告知用户此功能需要 Claude Code
- **文件读写错误**：报告错误，并建议手动编辑配置

## 交互示例

```
User: Use GLaDOS voice for this chat
Assistant: [Lists packs to verify glados exists]
Assistant: [Gets session ID]
Assistant: [Updates config.json to set pack_rotation_mode: "session_override"]
Assistant: [Updates .state.json to set session_packs[session_id] = "glados"]
Assistant: Voice set to GLaDOS for this session
           Rotation mode: session_override
```

## Cursor 兼容性说明

Cursor 不会公开 session ID。改用 `session_packs["default"]`：执行手动回退时，将 `"default": {"pack": "peasant", "last_used": 0}` 添加到 `session_packs` 中。这会将语音应用于没有显式分配的会话（包括 Cursor 聊天）。

## 重置为默认值

要停止在此会话中使用特定的 Pack，请从 `.state.json` 的 `session_packs` 中移除 session ID，或将 `pack_rotation_mode` 改回 `"random"` 或 `"round-robin"`。