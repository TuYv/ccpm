---
name: openspec-continue-change
description: Continue working on an OpenSpec change by creating the next artifact. Use when the user wants to progress their change, create the next artifact, or continue their workflow.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.3.1"
---
通过创建下一个工件来继续处理某个变更。

**输入**：可选择指定变更名称。如果省略，则检查能否从对话上下文中推断出来。如果模糊或有歧义，你必须提示用户从可用的变更中选择。

**步骤**

1. **如果未提供变更名称，提示用户进行选择**

   运行 `openspec list --json` 获取按最近修改时间排序的可用变更。然后使用 **AskUserQuestion 工具**让用户选择要处理的变更。

   将最近修改的前 3-4 个变更作为选项呈现，并显示：
   - 变更名称
   - Schema（如果存在则来自 `schema` 字段，否则为 "spec-driven"）
   - 状态（例如 "0/5 tasks"、"complete"、"no tasks"）
   - 最近修改时间（来自 `lastModified` 字段）

   将最近修改的变更标记为 "(Recommended)"，因为这很可能是用户想要继续处理的变更。

   **重要**：不要猜测或自动选择变更。始终让用户来选择。

2. **检查当前状态**
   ```bash
   openspec status --change "<name>" --json
   ```
   解析 JSON 以了解当前状态。响应包括：
   - `schemaName`：正在使用的工作流 schema（例如 "spec-driven"）
   - `artifacts`：工件数组及其状态（"done"、"ready"、"blocked"）
   - `isComplete`：布尔值，指示所有工件是否都已完成

3. **根据状态采取行动**：

   ---

   **如果所有工件都已完成（`isComplete: true`）**：
   - 向用户表示祝贺
   - 显示最终状态，包括所使用的 schema
   - 建议："所有工件已创建！你现在可以实现此变更或将其归档。"
   - 停止

   ---

   **如果有可创建的工件**（状态输出中显示 `status: "ready"` 的工件）：
   - 从状态输出中挑选第一个 `status: "ready"` 的工件
   - 获取其说明：
     ```bash
     openspec instructions <artifact-id> --change "<name>" --json
     ```
   - 解析 JSON。关键字段包括：
     - `context`：项目背景（对你的约束——不要包含在输出中）
     - `rules`：特定于工件的规则（对你的约束——不要包含在输出中）
     - `template`：输出文件要使用的结构
     - `instruction`：特定于 schema 的
