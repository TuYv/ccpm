---
name: spec-driven
description: "Drive a spec-driven workflow for a larger feature: specify requirements and acceptance criteria, research decisions, plan numbered slices, implement, then verify. Use for multi-step features that need a reviewable paper trail. Skip it for small, obvious changes."
---
# 规范驱动开发

一种适用于规模较大、需要保留完整过程记录的功能的结构化工作流。每项功能都有自己的文件夹 `plans/<feature>/`。空白模板位于 `plans/templates/` 中，`/spec`、`/plan` 和 `/verify` 命令会将其复制到对应位置。对于小型且显而易见的更改，请改用轻量级的 `plan` 输出样式（单个内联计划，不创建文件）。

## 阶段

1. **指定规范**（`plans/<feature>/spec.md`）：记录需求（`FR-N`）和验收标准（`AC-N`）。描述行为和结果，而非代码。运行 `/spec <feature>`。
2. **研究**（`plans/<feature>/research.md`）：记录决策及其理由、待解决的问题和运行约束。
3. **规划**（`plans/<feature>/plan.md`）：描述架构，并将工作拆分为带编号的切片，每个切片都可独立演示。运行 `/plan <feature>`。使用 `plans/templates/slice.md` 为每个切片搭建框架，并保存至 `plans/<feature>/NNN-<slug>.md`。
4. **执行**（`plans/<feature>/NNN-<slug>.md`）：每次实现一个切片，在验证通过时勾选该切片的完成标准，并确保每个切片均可运行。运行 `/implement <feature>`。
5. **验证**（`plans/<feature>/verification.md`）：逐一执行端到端场景，每个场景均须映射回一个 `AC-N`。运行 `/verify <feature>`。

## 规则

- 先编写规范，再制定计划，最后编写代码。
- 每项验收标准（`AC-N`）都必须有对应的验证场景。
- 保持切片小巧且可独立演示，每个切片只关注一项内容。
- 有关文件职责及每项功能的目录布局，请参阅 `plans/README.md`。