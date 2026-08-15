---
name: team-combat
description: "Orchestrate the combat team: coordinates game-designer, gameplay-programmer, ai-programmer, technical-artist, sound-designer, and qa-tester to design, implement, and validate a combat feature end-to-end."
argument-hint: "[combat feature description] [--review full|lean|solo]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task, AskUserQuestion, TodoWrite
model: sonnet
---
**参数检查：** 如果未提供战斗功能描述，则输出：
> "用法：`/team-combat [combat feature description]` — 请提供要设计和实现的战斗功能描述（例如，`melee parry system`、`ranged weapon spread`）。"
然后立即停止，不生成任何子代理，也不读取任何文件。

当使用有效参数调用此技能时，通过结构化流水线协调战斗团队。

**决策点：** 在每个阶段转换点，使用 `AskUserQuestion` 将子代理的提案作为可选项呈现给用户。将代理的完整分析写入对话，然后使用简洁的标签记录决策。必须获得用户批准后，才能进入下一阶段。

## 阶段 0：确定审查模式

1. 如果参数中传入了 `--review [mode]`，则使用该模式。
2. 否则，读取 `production/review-mode.txt`——使用其中写明的模式。
3. 否则，默认为 `lean`。

模式：
- `full` — 按照说明生成所有总监和负责人关卡
- `lean` — 跳过总监关卡，除非它们属于 PHASE-GATE 类型（CD-PHASE-GATE、TD-PHASE-GATE、PR-PHASE-GATE、AD-PHASE-GATE）
- `solo` — 完全跳过所有总监关卡的生成；运行技能时不使用任何代理关卡

存储确定后的模式，以供所有后续阶段使用。

## 团队构成
- **game-designer** — 设计机制，定义公式和边界情况
- **gameplay-programmer** — 实现核心玩法代码
- **ai-programmer** — 实现该功能的 NPC/敌人 AI 行为
- **technical-artist** — 创建 VFX、着色器效果和视觉反馈
- **sound-designer** — 定义音频事件、冲击音效和环境战斗音频
- **engine specialist**（主要）— 验证架构和实现模式是否符合引擎的惯用方式（从 `.claude/docs/technical-preferences.md` 的 Engine Specialists 部分读取）
- **qa-tester** — 编写测试用例并验证实现

## 如何委派

使用 Task 工具将每个团队成员生成为子代理：
- `subagent_type: game-designer` — 设计机制，定义公式和边界情况
- `subagent_type: gameplay-programmer` — 实现核心玩法代码
- `subagent_type: ai-programmer` — 实现 NPC/敌人 AI 行为
- `subagent_type: technical-artist` — 创建 VFX、着色器效果和视觉反馈
- `subagent_type: sound-designer` — 定义音频事件、冲击音效和环境音频
- `subagent_type: [primary engine specialist]` — 对架构和实现进行引擎惯用方式验证
- `subagent_type: qa-tester` — 编写测试用例并验证实现

始终在每个代理的提示词中提供完整上下文（设计文档路径、相关代码文件、约束条件）。在流水线允许的情况下，并行启动相互独立的代理（例如，阶段 3 的代理可以同时运行）。

## 流水线

### 阶段 1：设计
委派给 **game-designer**：
- 在 `design/gdd/` 中创建或更新设计文档，涵盖：机制概述、玩家幻想、详细规则、包含变量定义的公式、边界情况、依赖项、具有安全范围的调优参数，以及验收标准
- 输出：已完成的设计文档

### 阶段 2：架构
委派给 **gameplay-programmer**（如果涉及 AI，则同时委派给 **ai-programmer**）：
- 审查设计文档
- 设计代码架构：类结构、接口、数据流
- 确定与现有系统的集成点
- 输出：包含文件列表和接口定义的架构草图

然后启动 **primary engine specialist** 来验证提议的架构：
- 类/节点/组件结构是否符合锁定引擎的惯用方式？（例如 Godot 节点层级、Unity MonoBehaviour 与 DOTS 的选择、Unreal Actor/Component 设计）
- 是否存在应当使用的引擎原生系统，以替代自定义实现？
- 提议的 API 中是否有任何 API 在锁定的引擎版本中已弃用或发生变更？
- 输出：引擎架构说明——在阶段 3 开始前将其整合到架构中

使用 `AskUserQuestion`：
- 提示："架构草图已完成。是否批准继续进行并行实现？"
- 选项：
  - `[A] 继续——启动实现代理（gameplay-programmer、ai-programmer、technical-artist、sound-designer）`
  - `[B] 先修改架构——我会说明需要更改的内容`
  - `[C] 在此停止——我稍后继续`

仅当用户选择 [A] 时，才启动实现代理。

### 阶段 3：实现（尽可能并行）
并行委派：
- **gameplay-programmer**：实现核心战斗机制代码
- **ai-programmer**：实现 AI 行为（如果该功能涉及 NPC 反应）
- **technical-artist**：创建 VFX 和着色器效果
- **sound-designer**：定义音频事件列表和混音说明

### 阶段 4：集成
- 将玩法代码、AI、VFX 和音频连接起来
- 确保所有调优参数均已暴露并由数据驱动
- 验证该功能可与现有战斗系统协同工作

### 阶段 5：验证
委派给 **qa-tester**：
- 根据验收标准编写测试用例
- 测试设计中记录的所有边界情况
- 验证性能影响是否在预算范围内
- 为发现的任何问题提交错误报告

### 阶段 6：验收
- 汇总所有团队成员的结果
- 报告功能状态：COMPLETE / NEEDS WORK / BLOCKED
- 列出所有未解决的问题及其指定负责人

## 错误恢复协议

如果任何已启动的代理（通过 Task）返回 BLOCKED、错误或无法完成任务：

1. **立即披露**：在继续执行依赖阶段之前，向用户报告 "[AgentName]: BLOCKED — [reason]"
2. **评估依赖关系**：检查后续阶段是否需要被阻塞代理的输出。如果需要，则在未获得用户输入的情况下，不得越过该依赖点继续执行。
3. **通过 AskUserQuestion 提供选项**，选项包括：
   - 跳过此代理，并在最终报告中注明缺失项
   - 缩小范围后重试
   - 在此停止，并先解决阻塞问题
4. **始终生成部分报告**——输出所有已经完成的内容。不得因为一个代理受阻而丢弃工作。

常见阻塞问题：
- 输入文件缺失（找不到故事、缺少 GDD）→ 重定向到用于创建该文件的 skill
- ADR 状态为 Proposed → 不要实现；先运行 `/architecture-decision`
- 范围过大 → 通过 `/create-stories` 拆分为两个故事
- ADR 与故事之间的指令相互冲突 → 披露冲突，不要猜测

## 文件写入协议

所有文件写入操作（设计文档、实现文件、测试用例）均委派给通过 Task 生成的子智能体。每个子智能体都会执行“May I write to [path]?”协议。此编排器不直接写入文件。

## 输出

一份摘要报告，涵盖：设计完成状态、每位团队成员的实现状态、测试结果以及所有未解决的问题。

结论：**COMPLETE** — 战斗功能已完成设计、实现和验证。
结论：**BLOCKED** — 一个或多个阶段无法完成；已生成部分报告，并列出未解决的事项。

## 后续步骤

- 在关闭用户故事之前，对已实现的战斗代码运行 `/code-review`。
- 运行 `/balance-check` 以验证战斗公式和调优值。
- 如果需要优化 VFX、音频或性能，请运行 `/team-polish`。