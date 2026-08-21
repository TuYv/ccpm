---
name: ctx-doctor
description: |
  Run context-mode diagnostics. Checks runtimes, hooks, FTS5,
  plugin registration, npm and marketplace versions.
  Trigger: /context-mode:ctx-doctor
user-invocable: true
---
# Context Mode 诊断工具

运行诊断并直接在对话中显示结果。

## 操作说明

1. 直接调用 `ctx_doctor` MCP 工具。它会在服务端运行所有检查，并返回纯文本状态报告。
2. 原样显示结果——结果已使用纯文本状态前缀进行格式化：`[OK]` PASS、`[FAIL]` FAIL、`[WARN]` WARN。为实现跨客户端兼容（例如 Z.ai GLM），采用渲染器安全格式（不使用 Markdown 任务列表语法）。
3. **回退方案**（仅当 MCP 工具调用失败时）：从此 Skill 的基础目录推导出**插件根目录**（向上 2 级——移除 `/skills/ctx-doctor`），然后使用 Bash 运行：
   ```
   CLI="<PLUGIN_ROOT>/cli.bundle.mjs"; [ ! -f "$CLI" ] && CLI="<PLUGIN_ROOT>/build/cli.js"; node "$CLI" doctor
   ```
   使用相同的 `[OK]`/`[FAIL]`/`[WARN]` 前缀原样重新显示结果。