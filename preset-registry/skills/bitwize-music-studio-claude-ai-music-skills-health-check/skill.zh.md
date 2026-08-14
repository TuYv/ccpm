---
name: health-check
description: Runs plugin health checks (venv packages, skill registration, and album slug collisions). Use when the user asks to check plugin health, verify setup, or troubleshoot missing skills.
model: haiku
allowed-tools:
  - ToolSearch
  - bitwize-music-mcp
---
# 健康检查

## 你的任务

运行 `health_check` MCP 工具，并向用户报告结果。

## 工作流程

**重要：任何步骤都不要使用 Bash。仅使用下面列出的工具。**

1. 使用 `ToolSearch` 工具并以 `select:mcp__plugin_bitwize-music_bitwize-music-mcp__health_check` 作为查询，以加载 MCP 工具架构
2. 调用 `mcp__plugin_bitwize-music_bitwize-music-mcp__health_check`（MCP 工具，而非 CLI 命令）
3. 使用下面的格式清晰地报告结果

## 报告格式

### 全部正常

```
HEALTH CHECK: OK
  Venv: N packages verified
  Skills: N skills registered
  Collisions: no album slug collisions
```

### 警告

```
HEALTH CHECK: WARN

VENV [warn]
  N outdated: pkg1 (1.0 -> 1.1), pkg2 (2.0 -> 2.1)
  N missing: pkg3, pkg4
  Fix: <the venv check's `fix` field from the health_check result> (already the correct command for the user's OS)

SKILLS [warn]
  N missing from Claude Code: skill-a, skill-b
  N ghost (deleted but cached): skill-c
  Fix: claude plugin update bitwize-music

COLLISIONS [warn]
  N album slug collision(s):
  slug-name: kept [genre-a], shadowed by [genre-b]
  Fix: Rename one album with /bitwize-music:rename or move its directory, then run rebuild_state

For comprehensive diagnostics, run the `diagnose` MCP tool.
```

### 失败

```
HEALTH CHECK: FAIL

VENV [fail]
  Venv not found at ~/.bitwize-music/venv
  Fix: /bitwize-music:setup
```

## 请记住

1. **保持简洁**——这是一份状态报告
2. **显示修复命令**——状态不是正常时，始终包含修复命令
3. **建议使用 diagnose**——如果发现警告，请提及 `diagnose` MCP 工具以进行更深入的检查