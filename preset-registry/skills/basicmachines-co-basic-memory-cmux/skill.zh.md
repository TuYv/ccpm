---
name: cmux
description: End-user control of cmux topology and routing (windows, workspaces, panes/surfaces, focus, moves, reorder, identify, trigger flash). Use when automation needs deterministic placement and navigation in a multi-pane cmux layout.
---
# cmux 核心控制

非浏览器 cmux 拓扑结构与路由。

- **窗口**：顶层 macOS cmux 窗口。
- **工作区**：窗口内类似标签页的分组。
- **窗格**：工作区中的拆分容器。
- **表面**：窗格内的标签页（终端或浏览器面板）。

## 快速开始

```bash
cmux identify --json                              # current caller context
cmux list-windows / list-workspaces / list-panes
cmux list-pane-surfaces --pane pane:1
cmux new-workspace
cmux new-split right --panel pane:1
cmux move-surface --surface surface:7 --pane pane:2 --focus true
cmux split-off --surface surface:7 right
cmux reorder-surface --surface surface:7 --before surface:3

# workspace context-menu actions (color, description, rename, pin, ...)
cmux workspace-action --action set-color --color Blue
cmux workspace-action --action set-description --description "Ship checklist"

# attention cue
cmux trigger-flash --surface surface:7
```

## 句柄模型

输出默认使用短引用（`window:N`、`workspace:N`、`pane:N`、`surface:N`）。接受 UUID 作为输入；仅在需要 UUID 输出时使用 `--id-format uuids|both` 请求。

## 设置

cmux 管理的设置位于 `~/.config/cmux/cmux.json`。`cmux docs settings` 会输出文档 URL、模式 URL、GitHub 原始资源、cmux.json 路径以及重新加载命令。`cmux settings`、`cmux settings cmux-json` 和 `cmux settings shortcuts` 会打开 UI。

`cmux reload-config` 会同时重新加载 `cmux.json` 和 `~/.config/ghostty/config`，原地刷新终端，无需重启应用。

终端渲染（字体、光标样式、主题、回滚缓冲区、`background-opacity`、`background-blur`）应在 Ghostty 配置中设置，而非 cmux 设置。其他所有设置（应用行为、侧边栏、通知、浏览器行为、自动化、工作区颜色、cmux 管理的快捷键）都属于 cmux 设置。编辑前，请将所有现有的 `cmux.json` 复制为同目录下带时间戳的 `.bak` 文件。旧版 `~/.config/cmux/settings.json` 和 `~/Library/Application Support/com.cmuxterm.app/settings.json` 仅在缺少键时作为回退读取。

## 深入参考

| 参考 | 使用场景 |
|-----------|-------------|
| [references/handles-and-identify.md](references/handles-and-identify.md) | 句柄语法、自我识别、调用方定位 |
| [references/windows-workspaces.md](references/windows-workspaces.md) | 窗口/工作区生命周期、重新排序/移动，以及上下文菜单操作（颜色、描述、重命名） |
| [references/panes-surfaces.md](references/panes-surfaces.md) | 拆分、表面、移动/重新排序、焦点路由 |
| [references/trigger-flash-and-health.md](references/trigger-flash-and-health.md) | 闪烁提示和表面健康检查 |
| [../cmux-workspace/SKILL.md](../cmux-workspace/SKILL.md) | 当前调用方工作区规则和非干扰式自动化 |
| [../cmux-settings/SKILL.md](../cmux-settings/SKILL.md) | 安全编辑和验证 cmux.json 设置 |
| [../cmux-browser/SKILL.md](../cmux-browser/SKILL.md) | 基于表面的 WebView 上的浏览器自动化 |
| [../cmux-markdown/SKILL.md](../cmux-markdown/SKILL.md) | 支持实时文件监视的 Markdown 查看器面板 |