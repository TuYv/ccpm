---
name: track-management
description: Use this skill when creating, managing, or working with Conductor tracks - the logical work units for features, bugs, and refactors. Applies to spec.md, plan.md, and track lifecycle operations.
version: 1.0.0
---
# 轨道管理

关于创建、管理和完成 Conductor 轨道的指南——轨道是通过规范、规划和实施阶段来组织功能、缺陷和重构的逻辑工作单元。

## 何时使用本技能

- 创建新的功能、缺陷或重构轨道
- 编写或评审 spec.md 文件
- 创建或更新 plan.md 文件
- 管理轨道从创建到完成的完整生命周期
- 理解轨道状态标记与约定
- 使用 tracks.md 注册表
- 解读或更新轨道元数据

## 详细模式与完整示例

详细的模式文档位于 `references/details.md`。当上方导航层级不够充分时，请阅读该文件。

## 最佳实践

1. **一个轨道，一个关注点**：让轨道聚焦于单一逻辑变更
2. **小阶段**：将工作拆分为最多包含 3-5 个任务的阶段
3. **阶段后验证**：始终包含验证任务
4. **即时更新标记**：在工作过程中随时标记任务状态
5. **记录 SHA**：始终记录已完成任务的提交 SHA
6. **规划前评审规格**：在创建计划之前确保规格完整
7. **链接依赖**：明确标注轨道之间的依赖关系
8. **归档而非删除**：保留已完成的轨道以备查阅
9. **合理控制规模**：让轨道的工作量保持在 1-5 天之间
10. **明确的验收标准**：每项需求都必须是可测试的
