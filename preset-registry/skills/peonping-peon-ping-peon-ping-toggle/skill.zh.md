---
name: peon-ping-toggle
description: Toggle peon-ping sound notifications on/off. Use when user wants to mute, unmute, pause, or resume peon sounds during a Claude Code session. Also handles config changes like volume, pack rotation, categories — any peon-ping setting.
user-invocable: true
---
# peon-ping-toggle

开启或关闭 peon-ping 声音。也处理任何 peon-ping 配置更改。

## 切换声音

在 Unix 上，使用 Bash 工具运行以下命令：

```bash
bash "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/hooks/peon-ping/peon.sh toggle
```

在 Windows 上，使用 PowerShell 工具：
```powershell
$claudeDir = $env:CLAUDE_CONFIG_DIR
if (-not $claudeDir -or $claudeDir -eq "") {
  $claudeDir = Join-Path $HOME ".claude"
}
& (Join-Path $claudeDir "hooks/peon-ping/peon.ps1") toggle
```

将输出报告给用户。该命令将输出以下内容之一：
- `peon-ping: sounds paused` — 声音现已静音
- `peon-ping: sounds resumed` — 声音现已启用

## 此命令切换的内容

此命令切换**主音频开关**（`enabled` 配置）。禁用后：
- ❌ 声音停止播放
- ❌ 桌面通知也会停止（它们要求启用声音）
- ❌ 移动通知也会停止

**如需仅控制通知**，使用 `/peon-ping-config` 将 `desktop_notifications: false`。这样会继续播放声音，同时禁止桌面弹窗。

## 示例

“完全静音 peon-ping” → 将 `enabled: false`
“只禁用弹窗，但保留声音” → 将 `desktop_notifications: false`（改用 `/peon-ping-config`）

## 配置更改

对于任何其他 peon-ping 设置更改（音量、音效包轮换、类别、活动音效包等），请使用 `peon-ping-config` skill。