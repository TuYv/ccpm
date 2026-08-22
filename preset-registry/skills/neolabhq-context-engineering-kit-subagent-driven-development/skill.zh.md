---
name: subagent-driven-development
description: Use when executing implementation plans with independent tasks in the current session or facing 3+ independent issues that can be investigated without shared state or dependencies - dispatches fresh subagent for each task with code review between tasks, enabling fast iteration with quality gates
---
# 子代理驱动开发

通过为每个任务或问题派遣全新的子代理来创建并执行计划，并在每个任务完成后或批量任务完成后审查代码和输出。

**核心原则：** 每个任务使用全新的子代理 + 在任务之间或任务完成后进行审查 = 高质量、快速迭代。

通过代理执行计划：

- 在同一会话中执行（无需切换上下文）
- 每个任务使用全新的子代理（避免上下文污染）
- 在每个任务完成后或批量任务完成后进行代码审查（尽早发现问题）
- 迭代更快（任务之间无需人工介入）

## 支持的执行类型

### 顺序执行

当任务或问题彼此相关且需要按顺序执行时，依次调查或修改它们是最佳方式。

为每个任务或问题派遣一个代理，让其依次开展工作。每个任务或问题完成后，审查输出和代码。

**适用场景：**

- 任务紧密耦合
- 任务应按顺序执行

### 并行执行

当存在多个互不相关的任务或问题（不同文件、不同子系统、不同缺陷）时，依次调查或修改它们会浪费时间。每个任务或调查相互独立，可以并行进行。

为每个独立的问题领域派遣一个代理，让它们并发工作。

**适用场景：**

- 各项任务大多相互独立
- 可以在所有任务完成后进行整体审查

## 顺序执行流程

### 1. 加载计划

读取计划文件，创建包含所有任务的 TodoWrite。

### 2. 使用子代理执行任务

针对每个任务：

**派遣全新的子代理：**

```
Task tool (general-purpose):
  description: "Implement Task N: [task name]"
  prompt: |
    You are implementing Task N from [plan-file].

    Read that task carefully. Your job is to:
    1. Implement exactly what the task specifies
    2. Write tests (following TDD if task says to)
    3. Verify implementation works
    4. Commit your work
    5. Report back

    Work from: [directory]

    Report: What you implemented, what you tested, test results, files changed, any issues
```

**子代理返回报告**，其中包含工作摘要。

### 3. 审查子代理的工作

**派遣代码审查子代理：**

```
Task tool (superpowers:code-reviewer):
  Use template at requesting-code-review/code-reviewer.md

  WHAT_WAS_IMPLEMENTED: [from subagent's report]
  PLAN_OR_REQUIREMENTS: Task N from [plan-file]
  BASE_SHA: [commit before task]
  HEAD_SHA: [current commit]
  DESCRIPTION: [task summary]
```

**代码审查代理返回：** 优点、问题（严重/重要/轻微）、评估

### 4. 应用审查反馈

**如果发现问题：**

- 立即修复严重问题
- 在开始下一个任务前修复重要问题
- 记录轻微问题

**如有需要，派遣后续子代理：**

```
"Fix issues from code review: [list issues]"
```

### 5. 标记为完成，继续下一个任务

- 在 TodoWrite 中将任务标记为已完成
- 继续下一个任务
- 重复步骤 2-5

### 6. 最终审查

所有任务完成后，派遣最终代码审查代理：

- 审查整个实现
- 检查是否满足计划中的所有要求
- 验证整体架构

### 7. 完成开发

最终审查通过后：

- 宣布："我正在使用 finishing-a-development-branch skill 来完成这项工作。"
- **必需的子技能：** 使用 superpowers:finishing-a-development-branch
- 按照该技能的说明验证测试、提供选项并执行所选操作

### 工作流示例

```
You: I'm using Subagent-Driven Development to execute this plan.

[Load plan, create TodoWrite]

Task 1: Hook installation script

[Dispatch implementation subagent]
Subagent: Implemented install-hook with tests, 5/5 passing

[Get git SHAs, dispatch code-reviewer]
Reviewer: Strengths: Good test coverage. Issues: None. Ready.

[Mark Task 1 complete]

Task 2: Recovery modes

[Dispatch implementation subagent]
Subagent: Added verify/repair, 8/8 tests passing

[Dispatch code-reviewer]
Reviewer: Strengths: Solid. Issues (Important): Missing progress reporting

[Dispatch fix subagent]
Fix subagent: Added progress every 100 conversations

[Verify fix, mark Task 2 complete]

...

[After all tasks]
[Dispatch final code-reviewer]
Final reviewer: All requirements met, ready to merge

Done!
```

### 危险信号

**绝不要：**

- 跳过任务之间的代码审查
- 在严重问题尚未修复时继续推进
- 并行派遣多个实现子代理（会产生冲突）
- 未阅读计划任务就开始实现

**如果子代理未能完成任务：**

- 派遣修复子代理，并提供具体说明
- 不要尝试手动修复（会造成上下文污染）

## 并行执行流程

加载计划，进行严格审查，分批执行任务，并在每批任务之间报告以供审查。

**核心原则：** 分批执行，并设置检查点供架构师审查。

**开始时宣布：** "我正在使用 executing-plans skill 来实施此计划。"

### 第 1 步：加载并审查计划

1. 读取计划文件
2. 严格审查——找出对计划存在的任何问题或疑虑
3. 如果存在疑虑：在开始之前向你的人类合作伙伴提出
4. 如果没有疑虑：创建 TodoWrite 并继续

### 第 2 步：执行批次

**默认：前 3 个任务**

对于每项任务：

1. 标记为 in_progress
2. 严格遵循每个步骤（计划中的步骤粒度较小）
3. 按照规定运行验证
4. 标记为 completed

### 第 3 步：报告

完成该批次后：

- 展示已实现的内容
- 展示验证输出
- 说明："已准备好接收反馈。"

### 第 4 步：继续

根据反馈：

- 根据需要应用更改
- 执行下一批任务
- 重复进行，直至完成

### 第 5 步：完成开发

所有任务完成并通过验证后：

- 宣布："我正在使用 finishing-a-development-branch skill 来完成这项工作。"
- **必需的子技能：** 使用 superpowers:finishing-a-development-branch
- 按照该技能的说明验证测试、提供选项并执行所选操作

### 何时停止并寻求帮助

**出现以下情况时，立即停止执行：**

- 在批次执行过程中遇到阻碍（缺少依赖项、测试失败、指令不明确）
- 计划存在导致无法开始的关键缺口
- 你不理解某条指令
- 验证反复失败

**应请求澄清，而不是猜测。**

### 何时重新审视之前的步骤

**在以下情况下返回评审（步骤 1）：**

- 合作伙伴根据你的反馈更新了计划
- 基本方法需要重新考虑

**不要强行绕过阻塞问题**——停下来并询问。

### 请记住

- 首先严格评审计划
- 严格按照计划步骤执行
- 不要跳过验证
- 当计划要求时引用技能
- 批次之间：只需报告并等待
- 遇到阻塞时停下来，不要猜测

## 并行调查流程

并行执行的一种特殊情况，适用于存在多个互不相关的故障，并且可以在没有共享状态或依赖关系的情况下进行调查。

### 1. 识别独立领域

按照出现问题的部分对故障进行分组：

- 文件 A 的测试：工具审批流程
- 文件 B 的测试：批次完成行为
- 文件 C 的测试：中止功能

每个领域都是独立的——修复工具审批不会影响中止测试。

### 2. 创建聚焦的智能体任务

每个智能体获得：

- **具体范围：** 一个测试文件或子系统
- **明确目标：** 让这些测试通过
- **约束条件：** 不要修改其他代码
- **预期输出：** 总结发现和修复的内容

### 3. 并行分派

```typescript
// In Claude Code / AI environment
Task("Fix agent-tool-abort.test.ts failures")
Task("Fix batch-completion-behavior.test.ts failures")
Task("Fix tool-approval-race-conditions.test.ts failures")
// All three run concurrently
```

### 4. 评审并集成

智能体返回结果后：

- 阅读每份总结
- 验证各项修复之间不存在冲突
- 运行完整测试套件
- 集成所有更改

### 智能体提示词结构

好的智能体提示词应当：

1. **聚焦**——只针对一个明确的问题领域
2. **自包含**——包含理解问题所需的全部上下文
3. **明确说明输出**——智能体应该返回什么？

```markdown
Fix the 3 failing tests in src/agents/agent-tool-abort.test.ts:

1. "should abort tool with partial output capture" - expects 'interrupted at' in message
2. "should handle mixed completed and aborted tools" - fast tool aborted instead of completed
3. "should properly track pendingToolCount" - expects 3 results but gets 0

These are timing/race condition issues. Your task:

1. Read the test file and understand what each test verifies
2. Identify root cause - timing issues or actual bugs?
3. Fix by:
   - Replacing arbitrary timeouts with event-based waiting
   - Fixing bugs in abort implementation if found
   - Adjusting test expectations if testing changed behavior

Do NOT just increase timeouts - find the real issue.

Return: Summary of what you found and what you fixed.
```

### 常见错误

**❌ 范围太宽：** “修复所有测试”——智能体会迷失方向  
**✅ 具体：** “修复 agent-tool-abort.test.ts”——范围聚焦

**❌ 缺少上下文：** “修复竞态条件”——智能体不知道问题在哪里  
**✅ 提供上下文：** 粘贴错误消息和测试名称

**❌ 没有约束：** 智能体可能会重构所有内容  
**✅ 提供约束：** “不要修改生产代码”或“仅修复测试”

**❌ 输出要求模糊：** “修好它”——你不知道发生了哪些更改  
**✅ 具体：** “返回根本原因和更改内容的总结”

### 不适用的情况

**相关故障：** 修复一个故障可能会同时修复其他故障——应先一起调查  
**需要完整上下文：** 必须查看整个系统才能理解问题  
**探索性调试：** 尚不清楚具体哪里出了问题  
**共享状态：** 各智能体会相互干扰（编辑相同文件、使用相同资源）

### 会话中的真实示例

**场景：** 大规模重构后，3 个文件中出现了 6 个测试失败

**失败情况：**

- agent-tool-abort.test.ts：3 个失败（时序问题）
- batch-completion-behavior.test.ts：2 个失败（工具未执行）
- tool-approval-race-conditions.test.ts：1 个失败（执行次数 = 0）

**决策：** 各问题领域相互独立——中止逻辑、批量完成和竞态条件彼此分离

**分派：**

```
Agent 1 → Fix agent-tool-abort.test.ts
Agent 2 → Fix batch-completion-behavior.test.ts
Agent 3 → Fix tool-approval-race-conditions.test.ts
```

**结果：**

- 智能体 1：用基于事件的等待替换了超时机制
- 智能体 2：修复了事件结构错误（threadId 放错了位置）
- 智能体 3：增加了等待异步工具执行完成的逻辑

**集成：** 所有修复相互独立，没有冲突，完整测试套件全部通过

**节省的时间：** 并行解决 3 个问题，而非依次解决

### #验证

智能体返回结果后：

1. **审查每份摘要**——了解具体改动
2. **检查冲突**——智能体是否编辑了相同的代码？
3. **运行完整测试套件**——验证所有修复能否协同工作
4. **抽查**——智能体可能会犯系统性错误