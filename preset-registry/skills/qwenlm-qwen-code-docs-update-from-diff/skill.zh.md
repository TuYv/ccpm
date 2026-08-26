---
name: docs-update-from-diff
description: Review local code changes with git diff and update the official
  docs under docs/ to match. Use when the user asks to document current
  uncommitted work, sync docs with local changes, update docs after a feature or
  refactor, or when phrases like "git diff", "local changes", "update docs", or
  "official docs" appear.
---
# 根据差异更新文档

## 概述

检查本地差异，推导文档影响范围，并仅更新仓库的
`docs/` 页面。以当前代码为事实来源，确保变更范围明确、具体且便于导航。

如果受影响的功能无法清晰对应到现有文档章节，请在编辑前阅读
[references/docs-surface.md](references/docs-surface.md)。

## 工作流

### 1. 构建变更集

从本地 Git 状态开始，而不是凭假设进行。

- 检查 `git status --short`、`git diff --stat` 以及针对性的 `git diff`
  输出。
- 优先关注非文档变更，确保文档差异以代码为依据。
- 忽略 `README.md` 和其他非 `docs/` 内容，除非它们有助于确认变更意图。

### 2. 推导文档影响

对于每个发生变化的行为，提取文档必须反映的面向用户或面向开发者的事实。

- 新增的命令、标志、配置键、默认值、工作流或限制
- 重命名的行为或已移除的行为
- 发生变化的示例、路径或设置步骤
- 应归入现有页面但尚未提及的新功能

优先更新现有页面，而不是创建新页面。只有当功能引入了一个稳定主题，且会使现有页面更难理解时，才创建新页面。

### 3. 找到正确的文档位置

将每项变更映射到最小且正确的文档范围：

- 面向最终用户的行为：`docs/users/**`
- 开发者内部机制、SDK、贡献者工作流、工具：
  `docs/developers/**`
- 共享的落地页或导航变更：根目录下的 `docs/**` 和 `_meta.ts`

如果新增页面，请更新同一文档章节中最近的 `_meta.ts`，确保该页面可被发现。

### 4. 编写更新内容

编辑文档时应达到以下标准：

- 陈述当前行为，而不是实现历史
- 使用差异中明确的命令、文件路径、设置键和默认值
- 删除或改写过时文本，而不是在其基础上不断叠加注意事项
- 确保示例与当前 CLI 和仓库布局一致
- 保持仓库现有的文档语气和标题结构

### 5. 完成前交叉检查

确认更新后的文档涵盖实际变更：

- 在 `docs/` 中搜索旧名称、已移除的标志或过时的示例
- 确认链接和相对路径仍然合理
- 确认任何新页面都已包含在相关的 `_meta.ts` 中
- 对照代码差异重新阅读已修改的文档，而不是凭记忆检查
- 如果差异新增、移动、重命名或移除了 `docs/users/` 下的页面，请确认
  `qc-helper` 打包技能的主题到路径索引表（`packages/core/src/skills/bundled/qc-helper/SKILL.md`）已同步更新。
  该技能随 CLI 一起发布，并在运行时使用硬编码的文档路径表——过时的条目会导致 `/qc-helper` 无法找到正确的文档。
  同时检查 `.qwen/skills/` 下项目级技能中可能需要更新的硬编码
  `docs/users/` 引用。

## 实用启发式规则

- 如果变更影响命令，也要检查快速入门、工作流和功能页面是否存在偏差。
- 如果变更影响配置，也要检查
  `docs/users/configuration/settings.md`、功能页面以及身份验证/提供商文档。
- 如果变更影响工具或代理行为，在适用时同时检查
  `docs/users/features/**` 和 `docs/developers/tools/**`。
- 如果测试比实现代码更清楚地揭示了预期行为，请使用测试来确认措辞。
- 如果变更新增、移动、重命名或移除了文档页面，还要更新硬编码的文档路径使用方：`qc-helper` 的 SKILL.md 索引表、
  `_meta.ts` 导航文件，以及 `.qwen/skills/` 下引用
  `docs/users/` 路径的任何项目级技能。

## 交付内容

在 `docs/` 下完成文档编辑，使不了解差异内容的读者也能理解当前本地更改。保持最终摘要简短，并指出更新了哪些页面。