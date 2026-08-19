---
name: hyperflow-plan
description: Hyperflow planning phase. Use when a request needs shaping before code — a rough prompt to sharpen, an ambiguous idea to design, or a clear-enough task to decompose. Verbs like plan, design, brainstorm, explore, "should we", "what's the best way to", scope, decompose, "plan out", "break down", "enhance this prompt". Thinking, not building. Writes an optional spec to .hyperflow/specs/<slug>.md and a task file to .hyperflow/tasks/<slug>.md, then hands off to hyperflow-dispatch.
---
# hyperflow-plan — 规划阶段（Antigravity 单智能体）

思考，而非构建。唯一允许写入的是 `.hyperflow/`。当请求不需要某个阶段时，跳过该阶段。遵循 `hyperflow` doctrine（自主性、文件优先、AskUserQuestion 闸门）。

## 步骤

1. **增强（可跳过）。** 如果提示较为粗略，将其重写为最完善的形式 — 角色 · 任务 · 上下文 · 约束 · 输出规范。当请求已经足够具体时跳过。不要将只有一行的请求扩展成一份规范。
2. **先研究。** 阅读相关代码、`AGENTS.md` 和 `.hyperflow/memory/*`。自行梳理受影响的范围 — 不要询问代码可以回答的问题。
3. **设计（可跳过）。** 对于开放式请求：提出至少 2 个澄清问题（仅询问内容/对象/位置），提出 2–3 种方案，然后逐节设计并写入 `.hyperflow/specs/<slug>.md`，每一节都需获得批准。明确的请求直接进入分解阶段。当涉及系统、UI、动效或移动端界面时，应依据匹配的标准进行设计（架构分解 + 图示、设计系统、Motion 语言、移动平台/设备矩阵）。
4. **分解。** 生成一个按拓扑排序的批次图；每个子任务 = 一项符合 conventional commit 大小的变更。**拆分任何**涉及超过 5 个文件、超过 500 行代码、2 个以上子系统或超过 10 分钟审查的子任务。写入 `.hyperflow/tasks/<slug>.md`：状态表 → 目标 → 原因 → 范围概览 → 受影响的文件 → 执行计划 → 批次（角色、文件、复杂度、验收标准、提交占位符）→ 验证计划。
5. **输出** `计划就绪 — .hyperflow/tasks/<slug>.md（N 个批次，M 个子任务）`。
6. **交接**：使用任务 slug 调用 `hyperflow-dispatch` skill — 或者，在双会话模式下，写入一份已提交的交接包并停止。

## 规则

- 不得编写实现代码；不得修改源文件。
- 设计路径至少提出 2 个澄清问题；直接分解路径提出 0–3 个澄清问题。
- 对于多文件工作，单批次计划属于反模式 — 应进行分解。
- 始终包含具体的验证计划。