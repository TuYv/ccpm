---
name: claude-skills-troubleshooting
description: Diagnose and resolve Claude Code plugin and skill issues. This skill should be used when plugins are installed but not showing in available skills list, skills are not activating as expected, or when troubleshooting enabledPlugins configuration in settings.json. Triggers include "plugin not working", "skill not showing", "installed but disabled", or "enabledPlugins" issues.
---
# Claude Skills 故障排除

## 概述

诊断并解决常见的 Claude Code 插件和 Skill 配置问题。此 Skill 提供用于排查插件安装、启用和激活问题的系统化调试流程。

## 快速诊断

运行诊断脚本以识别常见问题：

```bash
python3 scripts/diagnose_plugins.py
```

该脚本会检查：
- 已安装插件与已启用插件不一致
- `settings.json` 中缺少 `enabledPlugins` 条目
- 根据 `known_marketplaces.json` 中的 `lastUpdated` 判断出的过期 Marketplace 缓存
- 缺失、格式错误、不含时区或时间在未来的 `lastUpdated` 元数据
- 无效的插件配置

将 `lastUpdated` 视为唯一的缓存新鲜度信息来源。不要回退使用缓存目录的修改时间：Marketplace 更新可能会刷新嵌套文件，而不会更改该目录的时间戳。如果缓存过期或新鲜度元数据无效，诊断脚本将以非零状态码退出。

## 常见问题

### 问题 1：插件已安装，但未显示在可用 Skill 中

**症状：**
- `/plugin` 显示插件已安装
- Skill 未出现在 Skill 工具的可用列表中
- `installed_plugins.json` 中存在插件元数据

**根本原因：** 已知缺陷（[GitHub #17832](https://github.com/anthropics/claude-code/issues/17832)）——插件会被添加到 `installed_plugins.json`，但不会自动添加到 `settings.json` 中的 `enabledPlugins`。

**诊断：**
```bash
# Check if plugin is in installed_plugins.json
cat ~/.claude/plugins/installed_plugins.json | grep "plugin-name"

# Check if plugin is enabled in settings.json
cat ~/.claude/settings.json | grep "plugin-name"
```

**解决方案：**
```bash
# Option 1: Use CLI to enable
claude plugin enable plugin-name@marketplace-name

# Option 2: Manually edit settings.json
# Add to enabledPlugins section:
# "plugin-name@marketplace-name": true
```

### 问题 2：了解插件状态架构

**关键文件：**

| 文件 | 用途 |
|------|---------|
| `~/.claude/plugins/installed_plugins.json` | 所有插件（已安装 + 已禁用）的注册表 |
| `~/.claude/settings.json` → `enabledPlugins` | 控制哪些插件处于激活状态 |
| `~/.claude/plugins/known_marketplaces.json` | 已注册的 Marketplace 来源 |
| `~/.claude/plugins/cache/` | 实际的插件文件 |

**插件仅在同时满足以下条件时才处于激活状态：**
1. 存在于 `installed_plugins.json` 中（已注册）
2. 已列在 `settings.json` → `enabledPlugins` 中，且值为 `true`

### 问题 3：Marketplace 缓存过期

**症状：**
- GitHub 上已有最新更改
- 安装程序能找到插件，但获取的是旧版本
- 新添加的插件不可见

**解决方案：**
```bash
# Update marketplace cache
claude plugin marketplace update marketplace-name

# Or clear and re-fetch
rm -rf ~/.claude/plugins/cache/marketplace-name
claude plugin marketplace update marketplace-name
```

### 问题 4：在 Marketplace 中找不到插件

**常见原因（按可能性从高到低排列）：**

1. **本地更改尚未推送到 GitHub**——这是最常见的原因！
   ```bash
   git status
   git push
   claude plugin marketplace update marketplace-name
   ```

2. **marketplace.json 配置错误**
   ```bash
   python3 -m json.tool .claude-plugin/marketplace.json
   ```

3. **缺少 Skill 目录**
   ```bash
   ls -la skill-name/SKILL.md
   ```

## 诊断命令参考

| 用途 | 命令 |
|---------|---------|
| 列出 marketplace | `claude plugin marketplace list` |
| 更新 marketplace | `claude plugin marketplace update {name}` |
| 安装插件 | `claude plugin install {plugin}@{marketplace}` |
| 启用插件 | `claude plugin enable {plugin}@{marketplace}` |
| 禁用插件 | `claude plugin disable {plugin}@{marketplace}` |
| 卸载插件 | `claude plugin uninstall {plugin}@{marketplace}` |
| 检查已安装的插件 | `cat ~/.claude/plugins/installed_plugins.json \| jq '.plugins \| keys'` |
| 检查已启用的插件 | `cat ~/.claude/settings.json \| jq '.enabledPlugins'` |

## 批量启用缺失的插件

要启用某个 marketplace 中所有已安装但被禁用的插件：

```bash
python3 scripts/enable_all_plugins.py marketplace-name
```

## Skills 与 Commands 架构

Claude Code 有两种可由用户调用的扩展：

1. **Skills**（位于 `skills/` 目录中）
   - 根据描述匹配自动激活
   - 当用户请求与 Skill 描述匹配时加载

2. **Commands**（位于 `commands/` 目录中）
   - 可通过 `/command-name` 显式调用
   - 显示在 Skill 工具的可用列表中
   - 需要命令文件（例如 `commands/seer.md`）

如果某个 Skill 应该能够被显式调用，请添加相应的命令文件。

## 参考资料

- 有关 GitHub issue 跟踪，请参阅 `references/known_issues.md`
- 有关插件架构的详细信息，请参阅 `references/architecture.md`