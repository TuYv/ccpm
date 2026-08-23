---
name: cmux-settings
description: "View and edit cmux settings in ~/.config/cmux/cmux.json. Use when the user wants to change cmux preferences (appearance, sidebar, notifications, automation, browser, shortcuts), set a value by JSON path, validate the file, open it in an editor, or look up which keys cmux recognizes. Triggers on '/cmux-settings', 'change cmux setting', 'set <something> in cmux', 'cmux config', 'cmux.json', or 'rebind a cmux shortcut'."
---
# cmux-settings

cmux 从 `~/.config/cmux/cmux.json`（JSONC）读取用户设置。文件监视器会在保存时应用更改，无需重启。旧版 `~/.config/cmux/settings.json` 仅作为后备来源，用于读取 `cmux.json` 中缺失的键。

模式：`https://raw.githubusercontent.com/manaflow-ai/cmux/main/web/data/cmux.schema.json`。权威路径列表位于 `Sources/CmuxSettingsJSONPathSupport.swift`；已安装的技能在 `references/all-keys.md` 中附带了一份生成的副本。设置部分包括 `app`、`terminal`、`notifications`、`sidebar`、`sidebarAppearance`、`workspaceColors`、`automation`、`browser`、`shortcuts`。非设置部分（`actions`、`ui`、`commands`、`vault`、`rightSidebar`）共用同一个文件。

## 辅助脚本

每次读取/写入都使用附带的辅助工具。它会移除 JSONC 注释、以原子方式写入，并依据模式验证键。

```bash
skills/cmux-settings/scripts/cmux-settings <subcommand>            # from a cmux checkout
~/.codex/skills/cmux-settings/scripts/cmux-settings <subcommand>   # installed Codex skill
```

本文档其余部分假定它已作为 `cmux-settings` 位于 `$PATH` 中；从检出的代码库运行时，执行 `export PATH="$PWD/skills/cmux-settings/scripts:$PATH"`。

| 命令 | 作用 |
|---|---|
| `cmux-settings path` | 输出配置文件路径。 |
| `cmux-settings dump` | 输出原始文件（保留注释）。 |
| `cmux-settings dump --no-comments` | 输出解析后的 JSON。 |
| `cmux-settings get <a.b.c>` | 输出点分隔 JSON 路径处的值。 |
| `cmux-settings set <a.b.c> <value>` | 设置值。`<value>` 会被解析为 JSON（`true`、`42`、`"text"`、`[…]`、`{…}`）；未加引号的普通单词会存储为字符串。 |
| `cmux-settings unset <a.b.c>` | 删除键，恢复为应用内默认值。 |
| `cmux-settings list-supported` | 列出应用可识别的所有设置 JSON 路径。 |
| `cmux-settings validate` | 解析文件并标记未知的设置键。 |
| `cmux-settings open` | 在 `$EDITOR`、VS Code、Cursor 或 TextEdit 中打开 `cmux.json`。 |

`--file <path>` 会覆盖目标文件，这对 `--file ~/.config/cmux/settings.json` 等情况很有用。

## 工作流程

1. 当用户使用自然语言说出某项设置时，查找对应的键：
   ```bash
   cmux-settings list-supported | rg -i 'sidebar.*terminal|terminal.*sidebar'
   ```
2. 设置该键。JSON 字面量必须是有效的 JSON。
   ```bash
   cmux-settings set sidebarAppearance.matchTerminalBackground true
   cmux-settings set app.appearance dark
   cmux-settings set shortcuts.bindings.newTab '["ctrl+b","c"]'
   cmux-settings set browser.hostsToOpenInEmbeddedBrowser '["localhost","*.internal.example"]'
   ```
3. 重新读取并运行 `cmux-settings validate`。
4. 告知用户设置已自动重新加载，并说明 `cmux-settings unset <key>` 可将其恢复。

## 快速参考

- 外观：`app.appearance`（`"system" | "light" | "dark"`）、`app.appIcon`、`app.menuBarOnly`、`app.minimalMode`。
- 侧边栏色调：`sidebarAppearance.matchTerminalBackground`、`.tintColor`、`.tintOpacity`（0..1）。
- 侧边栏详细信息：`sidebar.hideAllDetails`、`.showBranchDirectory`、`.showPullRequests`、`.showPorts`、`.showLog`。
- 通知：`notifications.dockBadge`、`.sound`（枚举值包括 `"none"`、`"custom_file"`）、`.customSoundFilePath`、`.hooks`（数组）。
- 浏览器：`browser.defaultSearchEngine`、`.theme`、`.openTerminalLinksInCmuxBrowser`、`.hostsToOpenInEmbeddedBrowser`。
- 自动化：`automation.socketControlMode`（`off | cmuxOnly | automation | password | allowAll`）、`.portBase`、`.portRange`。
- 快捷键：`shortcuts.bindings.<actionId>` = `"cmd+b"`、`["ctrl+b","c"]`、`null`，或使用 `""` 取消绑定。操作 ID 见 [references/shortcut-actions.md](references/shortcut-actions.md)。

设置项、默认值和说明的完整列表：`cmux-settings list-supported` 或 [references/all-keys.md](references/all-keys.md)。

## 规则

- 仅编辑 `cmux.json`。除非用户明确要求，否则绝不要编辑 `settings.json`；它是旧版文件，仅当 `cmux.json` 中缺少某个键时才会读取。
- 绝不要让用户重启 cmux。文件监视器会在保存时重新加载。
- 批量编辑后，始终运行 `cmux-settings validate`。出现未知键意味着用户粘贴了应用未使用的键。
- 不要盲目覆盖 `actions`、`ui`、`commands`、`vault` 或 `rightSidebar`；它们共用同一文件，并包含经过手动精细调整的非设置配置。
- 快捷键操作 ID 必须与 schema 枚举匹配。绑定前先查找对应的 ID。
- 颜色格式为 `#RRGGBB`；不透明度范围为 `0..1`。
- 先将应用层级的表述（“设置 > 通知 > Dock 徽标”）转换为 JSON 路径；`web/app/[locale]/(landing)/docs/configuration/page.tsx` 与 schema 保持 1:1 对应。