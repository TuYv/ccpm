---
name: lean-ctx
description: Local context tooling for AI agents. Use it to select, shape, reuse, recover, and inspect context before inference when reading files, running shell commands, searching code, or exploring directories.
---
# lean-ctx — 面向 AI Agent 的本地上下文 SDK

## 设置

```bash
which lean-ctx || curl -fsSL https://raw.githubusercontent.com/yvgude/lean-ctx/main/skills/lean-ctx/scripts/install.sh | bash
lean-ctx setup
```

## 工具可见性档位

| 档位 | 对外通告的工具 |
|---------|------------------|
| Lean（默认，不固定） | `ctx_read`, `ctx_shell`, `shell`, `ctx_search`, `ctx_glob`, `ctx_tree`, `ctx_session`, `ctx_compose`, `ctx_callgraph`, `ctx_patch`*, `ctx_call`, `ctx_expand` |
| `minimal` | `ctx_read`, `ctx_shell`, `ctx_search`, `ctx_glob`, `ctx_tree`；`ctx_call` 也会作为后备调用器被通告 |
| `standard` | minimal 档位 + `ctx_compose`, `ctx_explore`, `ctx_knowledge`, `ctx_session`, `ctx_callgraph`, `ctx_graph`, `ctx_delta`, `ctx_execute`, `ctx_expand`, `ctx_overview`, `ctx_url_read`, `ctx_patch`；`ctx_call` 也会作为后备调用器被通告 |
| `power` | 完整的公开工具注册表 |

\* Lean 档位会对拥有可靠原生编辑器的客户端隐藏 `ctx_patch`。被禁用的工具、角色策略以及客户端兼容性还会进一步收窄每一个档位。

## Shell 钩子（用它代替直接执行命令）

```bash
lean-ctx -c "git status"
lean-ctx -c "cargo test"
lean-ctx -c "npm install"
lean-ctx ls src/
```

## ctx_read 模式

| 模式 | 使用时机 |
|------|------|
| `anchored` | 你将要编辑的文件（全文 + 供 ctx_patch 使用的 `N:hh\|` 锚点） |
| `full` | 逐字读取缓存内容 |
| `map` | 仅上下文（依赖 + 导出） |
| `signatures` | 仅 API 表面 |
| `diff` | 编辑之后（变更的行） |
| `aggressive` | 大文件，剥离语法；JSON 数组按行去重（无损） |
| `entropy` | 香农过滤 |
| `task` | 与任务相关的行 |
| `lines:N-M` | 指定范围 |
| `auto` | 由系统自动选择最优模式 |

重新读取可能会使用本地缓存。设置 `fresh=true` 可绕过缓存。
冗余 JSON（由同类对象组成的数组）会被无损压缩成紧凑的 `_defaults` + 逐行条目形式；如果有片段被丢弃，可用 `ctx_expand(id, json_path=… | search=…)` 恢复。

## 文件编辑

锚定式编辑可保持精确、可按源地址定位的视图：`ctx_read(mode="anchored")` → `ctx_patch(path, op, line, hash, new_text)`。
绝不要逐字节复现旧文本；通过 `ops:[…]` 批量操作；`op=create` 用于写入新文件。
锚点过期 → 返回 CONFLICT 并附带新锚点（重试一次）。原生 Edit/StrReplace 仍然可用；
`ctx_edit`（str_replace）是通过 ctx_call / power 档位提供的旧式后备方案。

## 更多工具（通过 ctx_call 或 ctx_load_tools）

架构：ctx_symbol, ctx_callgraph, ctx_impact, ctx_architecture, ctx_routes, ctx_smells, ctx_quality
  ↳ “如果我改动这个文件/类/类型，什么会被破坏？” → ctx_impact（文件级影响范围；对 C#、Java、Go 和 Kotlin，可解析同包/命名空间内没有导入语句的类型使用）。“谁调用了这个函数？” → ctx_callgraph（符号级）。“导航性如何 / 复杂性让我付出了多少代价？” → ctx_quality（导航性评分 + token 质量税）。
实验性本地协作（仅限显式选择加入）：ctx_agent, ctx_share, ctx_task, ctx_handoff, ctx_workflow
验证：ctx_benchmark, ctx_verify, ctx_proof, ctx_review
批量：ctx_fill, ctx_execute, ctx_expand, ctx_pack

完整文档：https://leanctx.com/docs
