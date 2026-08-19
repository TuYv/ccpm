---
name: hyperflow-amplify
description: Hyperflow prompt amplifier. Use when a prompt is rough, vague, or under-specified and should be rewritten to high quality before running it — "enhance this prompt", "make this prompt better", "improve my prompt", "rewrite this prompt". Domain-aware: detects the prompt's domain, injects the matching specialist standards + project rules, scores against an 8-dimension rubric, then offers to run it.
---
# hyperflow-amplify — 提示词放大器（Antigravity 单代理）

将粗略提示词转化为唯一最强版本，然后交接出去。**Amplify 从不编写代码**——它产出供其他工作流（或你）执行的提示词。遵循 `hyperflow` 准则。

## 步骤

1. **理解意图。** 检测提示词所属的领域（前端/ui、api/db 后端、移动端、安全、性能、重构/修复 bug/测试、devops、文档）。如存在，阅读项目规则：`AGENTS.md`、`~/.gemini/AGENTS.md`、`.hyperflow/memory/*`。记录资深工程师必须自行猜测的缺口。
2. **放大。** 使用以下骨架重写为唯一最强版本（根据需要调整章节存在与否——简洁是一项约束，绝不将一行提示词膨胀成规格说明）：
   - 角色 / 专业能力定位（一行）
   - 精确任务（无歧义的目标）
   - 上下文（相关背景、当前状态、输入）
   - 约束（领域准则标准 + 项目规则——发生冲突时以项目规则为准）
   - 输出（交付物格式 + 验收标准）
   - 范围外（明确的非目标）
3. **评分**：依据 8 维度量表为草稿评分（每项 1-5 分）：意图清晰度 · 上下文充分性 · 范围边界 · 结构 · 已注入领域准则 · 输出规格 · 防护措施 · 简洁性。若任一维度 < 4，修订一次。
4. **呈现**：在一个可直接复制的围栏代码块中给出放大后的提示词，并附上 2-4 行理由（做了哪些改动、注入了哪些标准/项目规则、任何已标记的歧义）。
5. **交接门槛**（AskUserQuestion，4 个选项 → 标记一个“推荐”）：发送至 `hyperflow-spec`（推荐）· 发送至 `hyperflow-scope` · 发送至 `hyperflow-dispatch` · 仅复制。选择“发送至……”后，使用放大后的提示词调用相应工作流。

## 规则

- 从不编写代码。项目规则优先于通用角色标准。放大后的提示词或理由中不得包含 AI 归因。