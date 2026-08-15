---
name: skills-search
description: This skill should be used when users want to search, discover, install, or manage Claude Code skills from the CCPM registry. Triggers include requests like "find skills for PDF", "search for code review skills", "install cloudflare-troubleshooting", "list my installed skills", "what does skill-creator do", or any mention of finding/installing/managing Claude Code skills or plugins.
allowed-tools: Bash, Read
---
# Skills 搜索 — Agent 行为指令

## 自动引导（首先运行）

在执行任何其他操作之前，检查 ccpm 是否可用。如果不可用，使用一条命令引导整个生态系统：

```bash
# Check availability
which ccpm || npx @daymade/ccpm setup
```

`ccpm setup` 会安装此 skill，并配置 Claude Desktop MCP server（如果已安装）。引导完成后，下方所有命令均可直接使用。

## 核心行为

当此 skill 被激活时，你必须使用 Bash 工具直接执行相应的 `ccpm` 命令。不要向用户展示命令并要求其复制粘贴——请自行执行。

如果未全局安装 `ccpm`，请使用 `npx @daymade/ccpm` 直接替代下方所有命令。

## 意图映射

将用户意图匹配到正确的操作：

| 用户意图 | 操作 |
|-------------|--------|
| “查找用于 X 的 skills”/“搜索 X skills” | `ccpm search <query>` |
| “哪些 skills 比较热门”/“热门 skills” | `ccpm popular` |
| “有什么新内容”/“最新 skills” | `ccpm recent` |
| “安装 X”/“添加 X skill” | `ccpm install <skill-name>` |
| “X 是做什么的”/“介绍一下 X” | `ccpm info <skill-name>` |
| “我有哪些 skills”/“列出 skills” | `ccpm list` |
| “移除 X”/“卸载 X” | `ccpm uninstall <skill-name>` |
| “更新 X”/“更新所有 skills” | `ccpm update [name] [--all]` |
| “我需要 PDF/Excel/... 方面的帮助” | `ccpm search <topic>`，然后提议安装最匹配的 skill |

## 执行规则

1. **始终直接执行**——通过 Bash 工具运行 `ccpm` 命令，绝不要要求用户手动运行。
2. **汇总结果**——执行后，以清晰易读的格式呈现输出。
3. **建议后续步骤**——获得搜索结果后，提议安装。安装后，提醒用户重启 Claude Code。
4. **妥善处理错误**——如果找不到 `ccpm`，则回退到 `npx @daymade/ccpm`。如果无法访问 registry，请明确说明。
5. **带命名空间的 skills**——支持 `@org/skill-name` 格式（例如 `ccpm install @daymade/skill-creator`）。

## 命令参考

### 搜索
```bash
ccpm search <query> [--limit <n>] [--tags <t1,t2>] [--author <name>] [--smart]
```

### 发现
```bash
ccpm popular [--limit <n>]       # Most downloaded
ccpm recent [--limit <n>]        # Recently published/updated
```

### 安装与管理
```bash
ccpm install <skill-name>        # Install (user-level, default)
ccpm install <name> --project    # Install to current project only
ccpm install <name> --force      # Force reinstall
ccpm list                        # List installed skills
ccpm info <skill-name>           # Detailed skill information
ccpm update [name]               # Update a skill
ccpm update --all                # Update all skills
ccpm uninstall <skill-name>      # Remove a skill
```

## 安装后提醒

每次成功安装后，始终告诉用户：

> Skill 已成功安装。请重启 Claude Code（或开始新的对话），以使该 skill 可用。

## MCP Server 替代方案

对于希望使用原生工具集成（无需 Bash）的 Claude Desktop 用户，可以通过 MCP 服务器获得相同的功能：

```json
{
  "mcpServers": {
    "skill-search": {
      "command": "npx",
      "args": ["-y", "skills-search-mcp"]
    }
  }
}
```

此技能和 MCP 服务器都对同一个 `ccpm` CLI 进行了封装——二者互为补充，并不冲突。

## 故障排除

### "ccpm: command not found"
请改用 `npx @daymade/ccpm`，或进行全局安装：`npm install -g @daymade/ccpm`。

### 安装后技能不可用
重启 Claude Code——技能会在启动时加载。

### 权限错误
检查 `~/.claude/skills/` 的写入权限。尝试使用 `--project` 以项目级作用域进行安装。