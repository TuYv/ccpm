---
name: hyperflow-spec
description: Hyperflow design phase. Use when the user is exploring an idea, weighing approaches, or has an ambiguous request — verbs like brainstorm, design, explore, "should we", "what's the best way to", "unsure about". Thinking, not building. Produces an approved design at .hyperflow/specs/<slug>.md, then hands off to hyperflow-scope.
---
# hyperflow-spec — 设计阶段（Antigravity 单智能体）

此阶段是**思考，而非构建**。设计获批准前不得编写代码。遵循 `hyperflow` 规范（自主性、文件优先、AskUserQuestion 闸门）。

## 步骤

1. **先进行研究。** 阅读相关代码、`AGENTS.md`，以及存在时的 `.hyperflow/memory/*`。自行梳理受影响的范围。不要询问代码能够回答的问题。
2. 通过 AskUserQuestion 提出 **2-5 个澄清问题**（最低 2 个）——只询问代码无法确定的*做什么/选哪个/在哪里*。多选问题标记一个“（推荐）”；二选一问题不标记。
3. **提出 2-3 种方案**，每种方案用一句话说明优点/缺点/适用性。推荐其中一种；让用户选择。
4. **逐节编写设计。** 按以下结构将设计写入 `.hyperflow/specs/<slug>.md`：状态表 → TL;DR（2-3 句话）→ 组件 → 1. 架构 → 2. 数据流 → 3. 关键决策（包含已接受/拒绝的权衡）→ 4. 边界情况 → 5. 文件结构（创建/修改）。展示该设计；询问 `Approve all / Revise <section>`。
5. **获得批准后**，进行交接：调用 `hyperflow-scope` 技能，并传入规范文件路径。

## 规则

- 此处绝不编写实现代码。
- 不要把小任务膨胀成规范；对于简单明确的请求，直接跳转到 `hyperflow-scope`。
- 规范文件才是产物；聊天中只需提供简短的文件指引。