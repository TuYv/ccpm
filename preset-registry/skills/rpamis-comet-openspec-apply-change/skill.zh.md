---
name: openspec-apply-change
description: Implement tasks from an OpenSpec change. Use when the user wants to start implementing, continue implementation, or work through tasks.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.3.1"
---
执行某个 OpenSpec 变更中的任务。

**输入**：可以选择指定一个变更名称。如果省略，则检查能否从对话上下文中推断。如果模糊或存在歧义，你必须提示用户从可用变更中进行选择。

**步骤**

1. **选择变更**

   如果提供了名称，则使用它。否则：
   - 如果用户提到了某个变更，则从对话上下文中推断
   - 如果只有一个活跃的变更，则自动选择
   - 如果存在歧义，运行 `openspec list --json` 获取可用变更，并使用 **AskUserQuestion 工具**让用户进行选择

   始终告知：“正在使用变更：<name>”，并说明如何覆盖（例如 `/opsx:apply <other>`）。

2. **检查状态以了解 schema**
   ```bash
   openspec status --change "<name>" --json
   ```
   解析 JSON 以了解：
   - `schemaName`：正在使用的工作流（例如 “spec-driven”）
   - 哪个 artifact 包含任务（spec-driven 下通常为 “tasks”，其他情况请查看状态）

3. **获取 apply 指令**

   ```bash
   openspec instructions apply --change "<name>" --json
   ```

   它会返回：
   - `contextFiles`：artifact ID -> 具体文件路径数组（因 schema 而异——可能是 proposal/specs/design/tasks，或 spec/tests/implementation/docs）
   - 进度（总数、已完成、剩余）
   - 带状态的任务列表
   - 基于当前状态的动态指令

   **处理状态：**
   - 如果 `state: "blocked"`（缺少 artifacts）：显示消息，建议使用 openspec-continue-change
   - 如果 `state: "all_done"`：表示祝贺，建议归档
   - 否则：开始实现

4. **读取上下文文件**

   阅读 apply 指令输出中 `contextFiles` 下列出的每一个文件路径。
   这些文件取决于所使用的 schema：
   - **spec-driven**：proposal、specs、design、tasks
   - 其他 schema：遵循 CLI 输出中的 contextFiles

5. **显示当前进度**

   显示：
   - 正在使用的 schema
   - 进度：“N/M 个任务已完成”
   - 剩余任务概览
   - 来自 CLI 的动态指令

6. **执行任务（循环直到完成或受阻）**

   对每个待办任务：
   - 显示正在处理的是哪个任务
   - 进行所需的代码更改
   - 保持更改最小化且聚焦
   - 在任务文件中将任务标记为完成：`- [ ]` → `- [x]`
   - 继续下一个任务

   **在以下情况下暂停：**
   - 任务不明确 → 请求澄清
   - 实现过程中暴露出设计问题 → 建议更新 artifacts
   - 遇到错误或阻碍 → 报告并等待指导
   - 用户中断

7. **完成或暂停时，显示状态**

   显示：
   - 本次会话完成的任务
   - 总体进度：“N/M 个任务已完成”
   - 如果全部完成：建议归档
   - 如果已暂停：说明原因并等待指导

**实现期间的输出**

```
## Implementing: <change-name> (schema: <schema-name>)

Working on task 3/7: <task description>
[...implementation happening...]
✓ Task complete

Working on task 4/7: <task description>
[...implementation happening...]
✓ Task complete
```

**完成时的输出**

```
## Implementation Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Progress:** 7/7 tasks complete ✓

### Completed This Session
- [x] Task 1
- [x] Task 2
...

All tasks complete! Ready to archive this change.
```

**暂停时的输出（遇到问题）**

```
## Implementation Paused

**Change:** <change-name>
**Schema:** <schema-name>
**Progress:** 4/7 tasks complete

### Issue Encountered
<description of the issue>

**Options:**
1. <option 1>
2. <option 2>
3. Other approach

What would you like to do?
```

**护栏**
- 持续处理任务，直到完成或受阻
- 开始之前务必阅读上下文文件（来自 apply 指令的输出）
- 如果任务存在歧义，先暂停询问，然后再实现
- 如果实现过程中发现问题，暂停并建议更新 artifacts
- 保持代码更改最小化，并限定在每个任务的范围内
- 每完成一个任务后立即更新任务复选框
- 遇到错误、阻碍或需求不明确时暂停——不要猜测
- 使用 CLI 输出中的 contextFiles，不要假定特定的文件名

**灵活工作流集成**

此技能支持“针对变更执行操作”的模型：

- **可随时调用**：在所有 artifacts 尚未完成时（前提是任务已存在）、在部分实现之后，以及与其他操作交替进行时
- **允许更新 artifacts**：如果实现过程中发现设计问题，建议更新 artifacts——不锁定于特定阶段，可灵活推进工作
