---
name: openspec-archive-change
description: Archive a completed change in the experimental workflow. Use when the user wants to finalize and archive a change after implementation is complete.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.3.1"
---
在实验性工作流中归档一个已完成的变更。

**输入**：可选地指定一个变更名称。如果省略，先检查是否可以从对话上下文中推断出来。如果含义模糊或不明确，你必须提示用户从可用变更中进行选择。

**步骤**

1. **如果未提供变更名称，提示进行选择**

   运行 `openspec list --json` 获取可用变更。使用 **AskUserQuestion 工具** 让用户进行选择。

   仅显示处于活跃状态的变更（尚未归档的）。
   如果可用，包含每个变更所使用的 schema。

   **重要**：切勿猜测或自动选择变更，始终让用户自己选择。

2. **检查产出物完成状态**

   运行 `openspec status --change "<name>" --json` 检查产出物的完成情况。

   解析 JSON 以了解：
   - `schemaName`：正在使用的工作流
   - `artifacts`：产出物列表及其状态（`done` 或其他）

   **如果有任何产出物不是 `done`：**
   - 显示警告，列出未完成的产出物
   - 使用 **AskUserQuestion 工具** 确认用户是否要继续
   - 如果用户确认，则继续

3. **检查任务完成状态**

   读取任务文件（通常是 `tasks.md`）以检查是否有未完成的任务。

   统计标记为 `- [ ]`（未完成）与 `- [x]`（已完成）的任务数量。

   **如果发现未完成的任务：**
   - 显示警告，展示未完成任务的数量
   - 使用 **AskUserQuestion 工具** 确认用户是否要继续
   - 如果用户确认，则继续

   **如果任务文件不存在：** 直接继续，不显示与任务相关的警告。

4. **评估增量规格的同步状态**

   检查 `openspec/changes/<name>/specs/` 下是否存在增量规格。如果不存在，直接继续，不进行同步提示。

   **如果存在增量规格：**
   - 将每个增量规格与位于 `openspec/specs/<capability>/spec.md` 的对应主规格进行对比
   - 确定将要应用哪些变更（新增、修改、移除、重命名）
   - 在提示之前展示一份汇总摘要

   **提示选项：**
   - 如果需要变更：“立即同步（推荐）”、“不同步直接归档”
   - 如果已同步：“立即归档”、“仍然同步”、“取消”

   如果用户选择同步，使用 Task 工具（subagent_type: "general-purpose"，prompt: "Use Skill tool to invoke openspec-sync-specs for change '<name>'. Delta spec analysis: <include the analyzed delta spec summary>"）。无论用户选择如何，都继续归档。

5. **执行归档**

   如果归档目录不存在，则创建它：
   ```bash
   mkdir -p openspec/changes/archive
   ```

   使用当前日期生成目标名称：`YYYY-MM-DD-<change-name>`

   **检查目标是否已存在：**
   - 如果存在：报错并失败，建议重命名已有的归档或使用其他日期
   - 如果不存在：将变更目录移动到归档中

   ```bash
   mv openspec/changes/<name> openspec/changes/archive/YYYY-MM-DD-<name>
   ```

6. **展示摘要**

   展示归档完成摘要，包括：
   - 变更名称
   - 所使用的 schema
   - 归档位置
   - 规格是否已同步（如适用）
   - 关于任何警告的说明（未完成的产出物/任务）

**成功时的输出**

```
## Archive Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Archived to:** openspec/changes/archive/YYYY-MM-DD-<name>/
**Specs:** ✓ Synced to main specs (or "No delta specs" or "Sync skipped")

All artifacts complete. All tasks complete.
```

**护栏**
- 如果未提供变更，始终提示进行选择
- 使用产出物图（openspec status --json）进行完成状态检查
- 不要因警告而阻止归档——只需告知并确认
- 移动到归档时保留 .openspec.yaml（它会随目录一起移动）
- 清晰地展示所发生情况的摘要
- 如果请求同步，使用 openspec-sync-specs 方式（由 agent 驱动）
- 如果存在增量规格，始终运行同步评估，并在提示之前展示汇总摘要
