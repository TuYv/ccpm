---
name: code-review
description: "Performs an architectural and quality code review on a specified file or set of files. Checks for coding standard compliance, architectural pattern adherence, SOLID principles, testability, and performance concerns."
argument-hint: "[path-to-file-or-directory]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Task, AskUserQuestion
model: sonnet
agent: lead-programmer
---
## 阶段 1：加载目标文件

完整读取目标文件。读取 CLAUDE.md 以了解项目编码标准。

---

## 阶段 2：确定引擎专家

读取 `.claude/docs/technical-preferences.md` 中的 `## Engine Specialists` 小节。注意：

- **Primary** 专家（用于架构和广泛的引擎相关问题）
- **Language/Code Specialist**（用于审查项目主要编程语言的文件）
- **Shader Specialist**（用于审查着色器文件）
- **UI Specialist**（用于审查 UI 代码）

如果该小节内容为 `[TO BE CONFIGURED]`，则表示尚未指定引擎——跳过引擎专家相关步骤。

---

## 阶段 3：ADR 合规性检查

**参数：** `/code-review [file(s)]` 可以选择将故事文件路径作为最后一个参数（例如 `/code-review src/combat/attack.gd production/epics/combat/story-001.md`）。如果提供了故事路径，请读取该文件以提取适用的 ADR 引用。

按照以下优先级顺序搜索 ADR 引用：
1. 故事文件（如果作为参数提供）
2. 实现文件顶部的文件头注释
3. 引用了这些文件的提交消息（`git log --oneline -- [file]`）

查找类似 `ADR-NNN` 或 `docs/architecture/ADR-` 的模式。

如果未找到 ADR 引用，请注明：“未找到 ADR 引用——已跳过 ADR 合规性检查。若要进行完整的 ADR 合规性审查，请提供故事路径：`/code-review [files] [story-path]`。”

对于每个被引用的 ADR：读取文件，提取 **Decision** 和 **Consequences** 小节，然后对任何偏差进行分类：

- **架构违规**（阻塞）：使用了 ADR 中明确拒绝的模式
- **ADR 偏移**（警告）：在未使用被禁止模式的情况下，明显偏离了所选方案
- **轻微偏差**（信息）：与 ADR 指引存在细微差异，但不影响整体架构

---

## 阶段 4：标准合规性

确定系统类别（引擎、玩法、AI、网络、UI、工具）并评估：

- [ ] 公共方法和类具有文档注释
- [ ] 每个方法的圈复杂度低于 10
- [ ] 没有方法超过 40 行（不包括数据声明）
- [ ] 依赖项通过注入提供（游戏状态不使用静态单例）
- [ ] 配置值从数据文件加载
- [ ] 系统公开接口（而非依赖具体类）

---

## 阶段 5：架构与 SOLID

**架构：**
- [ ] 依赖方向正确（引擎 <- 玩法，而非反向）
- [ ] 模块之间不存在循环依赖
- [ ] 层级分离合理（UI 不拥有游戏状态）
- [ ] 使用事件/信号进行跨系统通信
- [ ] 与代码库中已确立的模式保持一致

**SOLID：**
- [ ] 单一职责：每个类只有一个发生变更的理由
- [ ] 开闭原则：无需修改即可扩展
- [ ] 里氏替换：子类型可以替代其基类型
- [ ] 接口隔离：不存在臃肿接口
- [ ] 依赖倒置：依赖抽象，而非具体实现

---

## 阶段 6：游戏特定关注点

- [ ] 帧率无关性（使用增量时间）
- [ ] 热路径（更新循环）中无内存分配
- [ ] 正确处理 null/空状态
- [ ] 在需要时保证线程安全
- [ ] 资源清理（无泄漏）

---

## 阶段 7：专家审查（并行）

通过 Task 同时启动所有适用的专家——不要等一个专家完成后再启动下一个。

### 引擎专家

如果配置了引擎，请确定每个文件适用的专家，并行启动：

- 主要语言文件（`.gd`、`.cs`、`.cpp`）→ 语言/代码专家
- 着色器文件（`.gdshader`、`.hlsl`、shader graph）→ 着色器专家
- UI 屏幕/微件代码 → UI 专家
- 跨领域或不明确 → 首席专家

对于任何涉及引擎架构（场景结构、节点层级、生命周期钩子）的文件，还应启动**首席专家**。

### QA 可测试性审查

对于逻辑和集成故事，还应通过 Task 启动 `qa-tester`，使其与引擎专家并行运行。传入：
- 正在审查的实现文件
- 故事的 `## QA Test Cases` 部分（由 qa-lead 预先编写的测试规范）
- 故事的 `## Acceptance Criteria`

要求 qa-tester 评估：
- [ ] 是否已公开所有测试钩子和接口（未隐藏在 private/internal 访问权限之后）？
- [ ] 故事的 `## QA Test Cases` 部分中的 QA 测试用例是否能映射到可测试的代码路径？
- [ ] 是否有任何验收标准在当前实现下无法测试（例如，值被硬编码、没有可用于注入的接缝）？
- [ ] 实现是否引入了现有 QA 测试用例未涵盖的新边界情况？
- [ ] 是否存在应进行测试但尚无测试的可观察副作用？

对于视觉/手感和 UI 故事：qa-tester 审查 `## QA Test Cases` 中的手动验证步骤能否通过当前实现完成——例如，“手动检查人员需要进入的状态是否确实可达？”

收集所有专家的发现后再生成输出。

---

## 阶段 8：输出审查

```
## Code Review: [File/System Name]

### Engine Specialist Findings: [N/A — no engine configured / CLEAN / ISSUES FOUND]
[Findings from engine specialist(s), or "No engine configured." if skipped]

### Testability: [N/A — Visual/Feel or Config story / TESTABLE / GAPS / BLOCKING]
[qa-tester findings: test hooks, coverage gaps, untestable paths, new edge cases]
[If BLOCKING: implementation must expose [X] before tests in ## QA Test Cases can run]

### ADR Compliance: [NO ADRS FOUND / COMPLIANT / DRIFT / VIOLATION]
[List each ADR checked, result, and any deviations with severity]

### Standards Compliance: [X/6 passing]
[List failures with line references]

### Architecture: [CLEAN / MINOR ISSUES / VIOLATIONS FOUND]
[List specific architectural concerns]

### SOLID: [COMPLIANT / ISSUES FOUND]
[List specific violations]

### Game-Specific Concerns
[List game development specific issues]

### Positive Observations
[What is done well -- always include this section]

### Required Changes
[Must-fix items before approval — ARCHITECTURAL VIOLATIONs always appear here]

### Suggestions
[Nice-to-have improvements]

### Verdict: [APPROVED / APPROVED WITH SUGGESTIONS / CHANGES REQUIRED]
```

此技能为只读——不会写入任何文件。

---

## 阶段 9：后续步骤

使用 `AskUserQuestion`：
- 提示：“代码审查完成——结论：[APPROVED / CHANGES REQUIRED / MAJOR REVISION]。你希望如何继续？”
- 选项（根据结论进行调整）：
  - 如果是 APPROVED：
    - `[A] Run /story-done to mark the story complete`
    - `[B] Stop here`
  - 如果是 CHANGES REQUIRED 或 MAJOR REVISION：
    - `[A] Fix the issues and re-run /code-review`
    - `[B] Run /story-done anyway with noted exceptions`
    - `[C] Stop here`

如果发现 ARCHITECTURAL VIOLATION：
- 如果该违规与某个**现有 ADR** 相矛盾：修复实现，使其符合 `docs/architecture/[adr-file].md`。如果设计确实已经发生变化，运行 `/architecture-decision` 以正式*修订*现有 ADR——不要创建与之冲突的新 ADR。
- 如果被违反的模式**不存在对应的 ADR**：在修复代码之前，运行 `/architecture-decision` 以记录正确的方法。