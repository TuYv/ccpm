---
name: workflow-patterns
description: Use this skill when implementing tasks according to Conductor's TDD workflow, handling phase checkpoints, managing git commits for tasks, or understanding the verification protocol.
version: 1.0.0
---
# 工作流模式

本指南介绍如何使用 Conductor 的 TDD 工作流实现任务、管理阶段检查点、处理 git 提交，以及执行确保整个实现过程质量的验证协议。

## 何时使用此技能

- 根据某条轨道的 plan.md 实现任务
- 遵循 TDD 红-绿-重构循环
- 完成阶段检查点
- 管理 git 提交与 notes
- 理解质量保障门禁
- 处理验证协议
- 在 plan 文件中记录进度

## 详细模式与实战示例

详细的模式文档位于 `references/details.md`。当上方的导航层级不够用时，请阅读该文件。

## 最佳实践

1. **绝不跳过 RED**：始终先编写失败的测试
2. **小步提交**：每次提交只包含一个逻辑变更
3. **立即更新**：任务完成后立即更新 plan.md
4. **等待批准**：绝不跳过检查点验证
5. **详尽的 git notes**：包含有助于日后理解的上下文
6. **覆盖率纪律**：不接受低于目标的覆盖率
7. **质量门禁**：在标记完成前检查所有门禁
8. **按序推进**：按顺序完成各阶段
9. **记录偏差**：注明任何与原计划的差异
10. **干净状态**：每次提交都应使代码保持可用状态
11. **快速反馈**：开发过程中频繁运行相关测试
12. **清除阻塞**：及时处理阻塞问题，不要绕开它们
