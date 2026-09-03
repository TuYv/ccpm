---
name: ralph-specum-prototype
description: This skill should be used only when the user explicitly invokes `$ralph-specum-prototype`, or explicitly asks Ralph Specum in Codex to run, resume, quick-run, or cancel an optional prototype.
metadata:
  surface: helper
  action: prototype
---
# Ralph Specum 原型

协调一个可选的原型叠加层。将源码工作委托给子代理，并在已记录的交接发生之前保持主 Ralph 阶段不变。

## 加载契约

从当前已加载的技能推导 `RALPH_CODEX_PLUGIN_ROOT`：先取包含 `SKILL.md` 的目录，再取其父级 `skills` 目录，然后再取上一级父目录。绝不要从项目工作目录推导插件根目录。

在进行任何原型变更之前，先完整阅读本技能目录下的 `../../references/prototype-coordinator.md`。将其视为 direct、suggested、resume、quick、cancel、isolation、review、publication 和 handoff 行为的唯一事实来源。

## 路由请求

1. 使用 `"$RALPH_CODEX_PLUGIN_ROOT/scripts/resolve_spec_paths.py"` 解析显式路径、确切的 spec 名称或 `.current-spec`。只使用返回的 `basePath`、`specRoot`、settings 和 warnings。
2. 解析一种模式：默认为 direct，suggested 带有返回阶段，resume 按 ID，quick，或 cancel 按 ID。
3. 在预留、恢复、审查或发布之前，先核对候选记录与最终记录。
4. 仅使用以下机制：
   - `"$RALPH_CODEX_PLUGIN_ROOT/scripts/locked_state.py"`，用于 `activePrototypes` 和每一次状态变更
   - `"$RALPH_CODEX_PLUGIN_ROOT/scripts/prototype_records.py"`，用于精确的候选字节、审查回执、不可变发布、核对以及下游选择
   - `"$RALPH_CODEX_PLUGIN_ROOT/scripts/prototype_harness.py"`，用于确定性的控制结果和重试元数据
5. 使用子代理工具派生内部构建器。只存储返回的 `agentId`；使用 `wait_agent` 等待，使用 `interrupt_agent` 停止。绝不要为内部构建器使用 `create_thread` 或 `threadId`。
6. 将常规捕获、脏路径转移、判定、交接、删除以及远程操作保持在用户的显式控制之下。让 quick 模式掌管其受限的选择，并在每次终局结果之后继续设计。

## 完成闸门

只有在协调器契约验证了不可变的最终字节、通过加锁辅助脚本移除活动条目、应用过期门控与交接门控，并报告本地源码处置情况之后，才可结束。在用户授权那次确切的远程写入之前，让每一个远程指针保持待定状态。
