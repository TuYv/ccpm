---
name: ctx-upgrade
description: |
  Update context-mode from GitHub and fix hooks/settings.
  Pulls latest, builds, installs, updates npm global, configures hooks.
  Trigger: /context-mode:ctx-upgrade
user-invocable: true
---
# Context Mode 升级

从 GitHub 拉取最新版本并重新安装插件。

## 说明

1. 直接调用 `ctx_upgrade` MCP 工具。它会返回一条要执行的 shell 命令。
2. 使用 shell 执行工具（Bash、shell_execute 等）运行返回的命令。
3. 以 Markdown 清单形式显示结果：
   ```
   ## context-mode upgrade
   - [x] Pulled latest from GitHub
   - [x] Built and installed v1.0.39
   - [x] Hooks configured
   - [x] Doctor: all checks PASS
   ```
   成功时使用 `[x]`，失败时使用 `[ ]`。显示实际版本号。
4. 告知用户**重启会话**以使用新版本。
5. **回退方案**（仅当 MCP 工具调用失败时）：从此 skill 的基础目录推导出**插件根目录**（向上 2 级——移除 `/skills/ctx-upgrade`），然后使用 Bash 运行：
   ```
   CLI="<PLUGIN_ROOT>/cli.bundle.mjs"; [ ! -f "$CLI" ] && CLI="<PLUGIN_ROOT>/build/cli.js"; node "$CLI" upgrade
   ```