---
name: safe-refactor
description: Restructure code while preserving behavior. Use for extraction, consolidation, ownership moves, or cleanup where verification must bracket structural edits.
---
# 安全重构

定义行为保持边界，并在进行结构性编辑前建立验证。

- 将特性变更保持在重构之外。
- 一次只迁移一个边界。
- 除非在范围中明确说明，否则保留公共接口、失败行为、顺序和兼容性。
- 保持中间状态可构建且可测试。
- 避免在没有正确性需求时增加依赖或配置。

在修改后运行相同的验证。当行为匹配且目标结构达成后停止。
