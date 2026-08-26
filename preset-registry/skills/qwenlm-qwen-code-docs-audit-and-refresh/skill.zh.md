---
name: docs-audit-and-refresh
description: Audit the repository's docs/ content against the current codebase,
  find missing, incorrect, or stale documentation, and refresh the affected
  pages. Use when the user asks to review docs coverage, find outdated docs,
  compare docs with the current repo, or fix documentation drift across
  features, settings, tools, or integrations.
---
# 文档审计与刷新

## 概述

从仓库向外审计 `docs/`：检查当前实现，识别文档缺口或不准确之处，并更新相关页面。将工作限制在 `docs/` 内，并以代码、测试和当前配置界面作为权威来源。

在开展全面审计前，请先阅读 [references/audit-checklist.md](references/audit-checklist.md)，以确保扫描聚焦于高信号区域。

## 工作流程

### 1. 构建当前状态清单

检查定义面向用户或面向开发者行为的仓库区域。

- 阅读相关代码、测试、schema 和包接口。
- 重点关注已发布的行为、稳定的配置、公开的命令、集成以及开发者工作流。
- 将现有文档树作为预期覆盖范围的地图，而不是文档覆盖完整的证明。

### 2. 将实现与 `docs/` 进行对比

查找以下三类问题：

- 现有功能、设置、工具或工作流缺少文档
- 文档内容不正确，与当前代码库相矛盾
- 文档过时，使用了旧名称、默认值、路径或示例

在编辑前，优先使用仓库证据证明存在缺口。使用当前代码和测试，而不是凭直觉判断。

### 3. 按读者影响确定优先级

优先修复代价最高的问题：

1. 已损坏的入门、设置、身份验证、安装或命令流程
2. 错误的设置、默认值、路径或功能行为
3. 对真实使用界面完全缺失的文档
4. 影响较低的清晰度或组织结构改进

### 4. 刷新文档

在 `docs/` 下更新数量最少且正确的页面集合。

- 优先编辑现有页面
- 仅针对明确且持久的缺口添加新页面
- 添加或移动页面时，更新最近的 `_meta.ts`
- 确保示例可执行，并与当前仓库结构保持一致
- 删除无效或容易误导的文本，而不是在其上叠加警告

### 5. 验证刷新结果

完成前：

- 在 `docs/` 中搜索旧术语和已替换的配置键
- 检查相邻页面是否存在相互冲突的指导
- 确认新页面出现在正确的 `_meta.ts` 中
- 对照代码或测试重新阅读关键示例、命令和路径
- 验证随附的 skill 文档索引仍与当前 `docs/` 树保持一致。
  随附的 `qc-helper` skill
  (`packages/core/src/skills/bundled/qc-helper/SKILL.md`) 维护着一个将主题映射到文档文件路径的硬编码表。如果你在 `docs/users/` 下添加、移动、重命名或删除了页面，则必须更新该表以保持一致。检查 SKILL.md 中的 Features 和 Configuration 表，并与 `docs/users/features/` 和 `docs/users/configuration/` 中的实际文件进行对照。其他随附的 skill 或项目 skill 也可能引用文档路径——在 `.qwen/skills/` 和 `packages/core/src/skills/bundled/` 中搜索 `docs/users/`，以发现这些引用。

## 审计标准

- 优先进行广度优先的发现，然后深入处理已确认的缺口。
- 没有证据表明大范围内容错误或缺失时，不要重写大段内容。
- README 文件不在编辑范围内；将修改限制在 `docs/` 内。
- 如果审计发现的问题过大，无法在一次处理中解决，请指出剩余缺口。

## 交付内容

完成一次有针对性的文档更新，使当前代码库更加准确、完整。总结已审查的范围以及具体更新的页面。