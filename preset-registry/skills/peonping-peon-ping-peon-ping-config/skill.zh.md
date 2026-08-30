---
name: peon-ping-config
description: Update peon-ping configuration — volume, pack rotation, categories, active pack, and other settings. Use when user wants to change peon-ping settings like volume, enable round-robin, add packs to rotation, toggle sound categories, or adjust any config.
user-invocable: false
---
# peon-ping-config

更新 peon-ping 配置设置。

## 配置位置

配置文件位于 `${CLAUDE_CONFIG_DIR:-$HOME/.claude}/hooks/peon-ping/config.json`。

## 可用设置

- **volume**（number，0.0–1.0）：声音音量
- **default_pack**（string）：当前声音包名称（例如 `"peon"`、`"sc_kerrigan"`、`"glados"`）。旧版键名 `active_pack` 也可作为回退项接受。
- **enabled**（boolean）：总开关
- **pack_rotation**（array of strings）：每个会话中用于轮换的声音包列表。空数组 `[]` 仅使用 `default_pack`。
- **pack_rotation_mode**（string）：`"random"`（默认）在每个会话中随机选择一个声音包。`"round-robin"` 按顺序循环使用。`"session_override"` 使用 `/peon-ping-use` 中为每个会话明确指定的声音包；无效或缺失的声音包将回退到 `default_pack`，并移除过期的分配。旧版值 `"agentskill"` 也可作为别名接受。
- **categories**（object）：切换单独的 CESP 声音类别：
  - `session.start`、`task.acknowledge`、`task.complete`、`task.error`、`input.required`、`resource.limit`、`user.spam` — 每项均为 boolean
- **disabled_sounds**（object）：禁用声音包中的特定声音文件，按声音包名称 → 类别 → 文件名数组（基名）进行设置。示例：
  ```json
  "disabled_sounds": {
    "peon": { "session.start": ["Hello1.wav"] }
  }
  ```
  如果某个类别中的所有声音都列在其中，该类别将保持静音。建议使用 CLI：
  ```bash
  peon sounds list [pack]
  peon sounds disable <category> <file> [--pack=<name>]
  peon sounds enable  <category> <file> [--pack=<name>]
  ```
- **annoyed_threshold**（number）：触发 user.spam 声音所需的快速提示次数
- **annoyed_window_seconds**（number）：annoyed threshold 的时间窗口
- **silent_window_seconds**（number）：对于耗时少于此秒数的任务，抑制 task.complete 声音
- **session_ttl_days**（number，默认值：7）：清理超过 N 天的过期会话声音包分配（使用 session_override 模式时）
- **desktop_notifications**（boolean）：独立于声音切换通知弹窗（默认值：`true`）
- **use_sound_effects_device**（boolean）：通过 macOS Sound Effects 设备（`true`）或使用 afplay 通过默认输出设备（`false`）播放音频。仅影响 macOS。默认值：`true`

## 如何更新

1. 使用 Read 工具读取配置文件
2. 使用 Edit 工具编辑相关字段
3. 向用户确认更改

## 常见配置示例

### 禁用桌面通知弹窗但保留声音

**用户请求：**“禁用桌面通知”

**操作：**
在配置中将 `desktop_notifications: false` 设置为 `false`

**结果：**
- ✅ 声音继续播放（语音提醒）
- ❌ 抑制桌面通知弹窗
- ✅ 移动通知不受影响（独立开关）

**CLI 命令替代方案：**
```bash
peon notifications off
# or
peon popups off
```

### 调整音量

**用户请求：**“将音量设置为 30%”

**操作：**
在配置中将 `volume: 0.3` 设置为 `0.3`

### 启用 round-robin 声音包轮换

**用户请求：**“启用 peon 和 glados 的轮询式 pack 轮换”

**操作：**
设置：
```json
{
  "pack_rotation": ["peon", "glados"],
  "pack_rotation_mode": "round-robin"
}
```

## 目录 pack 绑定

将 sound pack 永久关联到工作目录，以便该目录中的每个会话都自动使用正确的 pack。使用 `path_rules` 配置键（由 `{ "pattern": "<glob>", "pack": "<name>" }` 对象组成的数组）。

### CLI 命令

```bash
# 将 pack 绑定到当前目录
peon packs bind <pack>
# 例如 peon packs bind glados
# → bound glados to /Users/dan/Frontend

# 使用自定义 glob 模式绑定（匹配名称符合条件的任意目录）
peon packs bind <pack> --pattern "*/Frontend/*"

# 自动下载缺失的 pack 并进行绑定
peon packs bind <pack> --install

# 移除当前目录的绑定
peon packs unbind

# 移除指定模式的绑定
peon packs unbind --pattern "*/Frontend/*"

# 列出所有绑定（* 表示匹配当前目录的规则）
peon packs bindings
```

### 手动配置

也可以直接编辑 `config.json` 中的 `path_rules` 数组：

```json
{
  "path_rules": [
    { "pattern": "/Users/dan/Frontend/*", "pack": "glados" },
    { "pattern": "*/backend/*", "pack": "sc_kerrigan" }
  ]
}
```

模式使用 Python `fnmatch` glob 语法。第一个匹配的规则优先。路径规则会覆盖 `default_pack` 和 `pack_rotation`，但会被 `session_override` 分配覆盖。

## 列出可用的 pack

要显示可用的 pack，请运行：

```bash
bash "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/hooks/peon-ping/peon.sh packs list
```