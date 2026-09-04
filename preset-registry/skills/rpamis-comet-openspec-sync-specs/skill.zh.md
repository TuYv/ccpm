---
name: openspec-sync-specs
description: Sync delta specs from a change to main specs. Use when the user wants to update main specs with changes from a delta spec, without archiving the change.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.3.1"
---
将变更中的增量规格同步到主规格。

这是一个**由 agent 驱动**的操作——你将阅读增量规格并直接编辑主规格来应用这些变更。这样可以实现智能合并（例如，添加一个场景而无需复制整个需求）。

**输入**：可选择指定变更名称。如果省略，检查是否可以从对话上下文中推断出来。如果模糊或存在歧义，你**必须**提示用户选择可用的变更。

**步骤**

1. **如果未提供变更名称，提示用户进行选择**

   运行 `openspec list --json` 获取可用变更。使用 **AskUserQuestion 工具**让用户进行选择。

   显示具有增量规格的变更（位于 `specs/` 目录下）。

   **重要**：切勿猜测或自动选择变更。始终让用户自行选择。

2. **查找增量规格**

   在 `openspec/changes/<name>/specs/*/spec.md` 中查找增量规格文件。

   每个增量规格文件包含如下章节：
   - `## ADDED Requirements` - 要新增的需求
   - `## MODIFIED Requirements` - 对现有需求的修改
   - `## REMOVED Requirements` - 要移除的需求
   - `## RENAMED Requirements` - 要重命名的需求（FROM:/TO: 格式）

   如果未找到增量规格，告知用户并停止。

3. **针对每个增量规格，将变更应用到主规格**

   对于每个在 `openspec/changes/<name>/specs/<capability>/spec.md` 处拥有增量规格的能力（capability）：

   a. **阅读增量规格**，以理解预期的变更

   b. **阅读主规格**，位于 `openspec/specs/<capability>/spec.md`（可能尚不存在）

   c. **智能地应用变更**：

      **ADDED Requirements:**
      - 如果该需求在主规格中不存在 → 新增它
      - 如果该需求已存在 → 将其更新以保持一致（视为隐式的 MODIFIED）

      **MODIFIED Requirements:**
      - 在主规格中找到该需求
      - 应用这些变更——具体可以是：
        - 新增场景（无需复制已有场景）
        - 修改已有场景
        - 修改需求描述
      - 保留增量中未提及的场景/内容

      **REMOVED Requirements:**
      - 从主规格中移除整个需求块

      **RENAMED Requirements:**
      - 找到 FROM 需
