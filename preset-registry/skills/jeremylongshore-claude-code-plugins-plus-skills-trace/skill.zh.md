---
name: trace
description: |
  Use when encountering bugs, test failures, runtime errors, broken builds, or "this doesn't work" reports. Systematic root-cause analysis before any patch — never blind-patches symptoms. Standalone, ends with a final-integration review of the fix.
  Trigger with /hyperflow:trace, "debug this", "find the root cause", "why is this failing", "this test is broken".
allowed-tools: Read, Bash(git:*), Bash(npm:*), Bash(pnpm:*), Glob, Grep, Agent, AskUserQuestion
argument-hint: "<bug description or failing test name>"
version: 3.1.3
license: MIT
compatibility: Designed for Claude Code
tags: [debugging, root-cause, systematic, multi-agent]
---
# 追踪

查找根本原因，而非症状。绝不在不了解错误发生原因的情况下直接修补问题。

所有 Agent 都继承会话模型。Reviewer 和 Debugger 使用加粗标签；Worker 使用普通标签。

## 每步 Agent 映射（DOCTRINE 规则 12）

每个实质性步骤都至少会调度一个 Agent。原子步骤（依据 DOCTRINE 12.2.8）由单个 Worker → Reviewer 配对构成，不会分发为多个独立角度。

| 步骤 | 状态 | Workers | Reviewers | 备注 |
|---|---|---|---|---|
| 1 — 复现 | 原子（12.2.8） | Searcher | **Reviewer** | 如果缺少复现则运行；单个 Worker→Reviewer 配对 |
| 2 — 收集证据 | 原子（12.2.8） | `searcher` specialist × 3 | **Reviewer** | 3 个并行 Searcher → 单个 Reviewer；一个 Worker-group→Reviewer 配对 |
| 3 — 提出假设 | 原子（12.2.8） | **`debugger` specialist** | **Reviewer** | 单个 Debugger（5 Whys + 按优先级排序的假设）；可以跨假设分发步骤 4（规则 18） |
| 4 — 验证 | 2 个子阶段 | Implementer × N | **Debugger** · **Reviewer** | 4a：并行 Implementer → Reviewer；4b：Debugger 重新评估 → Reviewer |
| 5 — 从根源修复 | 原子（12.2.8） | Implementer × N | **Reviewer** | N 个 Implementer（每个文件一个）→ Reviewer；单个 Worker-group→Reviewer 配对 |
| 6 — 回归测试 | 原子（12.2.8） | Writer | **Reviewer** | 单个 Writer → 单个 Reviewer；无并行角度 |
| 7 — Memory + 最终输出 | 原子（12.2.8） | Writer | **Reviewer** | 单个 Writer → 集成 Reviewer；无并行角度 |

## 步骤 1 — 复现

原子步骤 — 单个 Searcher → Reviewer 配对（DOCTRINE 12.2.8）。不采用并行角度：当症状未知时，工件检索是单一范围的搜索。

如果用户提供了堆栈追踪、测试名称或日志片段 — 完全跳过 Worker 调度（此时步骤 1 已由现有输入直接满足；继续步骤 2）。

否则，调度 `Searcher — locating bug reproduction in recent changes/tests`。

收集：失败的测试名称或命令、错误消息、堆栈追踪、日志行、涉及受影响范围的近期提交。

随后调度 `**Reviewer** — confirming reproduction is valid`，并附上收集到的工件。

Reviewer 确认：
- 故障是否一致且可确定性复现（或标记为间歇性）。
- 错误是否与所述症状相符。
- 该复现是否并非测试环境工件（缺少种子数据、错误的环境变量、时钟漂移）。

如果属于环境问题（仅 CI、间歇性、依赖时间）— 在继续步骤 2 前明确标记。

## 步骤 2 — 收集证据

原子步骤 — 一个 Worker-group（3 个并行 Searcher）→ 单个 Reviewer 配对（DOCTRINE 12.2.8）。这三个 Searcher 是单个子阶段内的并行角度，而非独立子阶段。它们将作为 [`searcher`](../../agents/searcher.md) specialist 调度 — 路径锚定的证据、只读、不可继续分发。

在单条消息中同时调度：
- `Searcher — reading error stack traces and logs`
- `Searcher — mapping the code paths involved`
- `Searcher — finding related tests (passing and failing)`

每个 Searcher 将其发现以结构化列表形式写入：文件路径、行号、关键值、时间戳。

然后在全部三个 Searcher 的输出上调度 `**Reviewer** — verifying evidence coverage`。

Reviewer 确认三个 Searcher 是否真正对失败面进行了三角验证。如果仍存在缺口（例如未找到日志、代码路径不完整），Reviewer 会指出具体缺失的角度 — 仅针对这些缺口重新运行相应的 Searcher，然后重新运行 Reviewer。重复此过程，直到确认覆盖完整。

**失败恢复：** Searcher 工具错误和 NEEDS_REVISION 判定遵循 DOCTRINE 规则 14（`skills/hyperflow/failure-recovery.md`）。特别对于 trace，如果 Searcher 在证据收集过程中中止，调试器将面临不完整的覆盖范围 — 在步骤 3 的 Reviewer 输出中明确标记该缺口，并在根因综合中将其作为已知不确定性继续保留。不要默默地将证据视为完整后继续执行。

## 步骤 3 — 提出假设

原子化 — 单个 Debugger → Reviewer 对（DOCTRINE 12.2.8）。5 Whys 和假设排序属于单个连续推理任务；一次 Debugger 调用在一个过程中同时完成两者。

调度 `**Debugger** — 5 Whys + hypothesis ranking: <bug-summary>` — [`debugger`](../../agents/debugger.md) 专业代理，并携带其职责说明（根因优先于症状、书面 5 Whys 链、在受门控的流程中优先进行 Web 研究以查找已知问题/变更日志）。当确实存在 ≥ 2 个相互独立的假设时，debugger 可以将步骤 4 的验证**扇出**到这些假设上（深度 1，≤ 3 个子工作者 — DOCTRINE 规则 18）；单一假设的 bug 永远不会扇出。

单次调用生成：

**A 部分 — 5 Whys 因果链**（深度优先）：
- 为什么会失败？→ 因为 X → 为什么是 X？→ 因为 Y → 继续追问直到根因。
- 目标：到达结构性原因（数据契约违反、状态变更、缺失的防护、时序假设），而不是表面症状。
- 输出：一条以可达到的最深层根因为结尾的因果链。

**B 部分 — 假设扇出**（使用 A 部分的因果链）：
- 输出 1–3 个按优先级排序的假设。每个假设必须包括：
  - **What** — 怀疑的根因
  - **Evidence** — 步骤 2 中支持该假设的内容
  - **Counter-evidence** — 哪些内容可以证伪该假设
  - **Test** — 用于验证的最小变更（由步骤 4 使用）

然后在 Debugger 的输出上调度 `**Reviewer** — validating causal chain and hypothesis set`。

Reviewer 确认因果链是否到达结构性根因（而非症状），并确认每个假设都可以独立测试。

## 步骤 4 — 验证

两个子阶段（存在真正的顺序依赖：4b 依赖 4a 的结果；4b Debugger 执行实质性的重新评估工作，而不是纯粹的审查流程）。

### 步骤 4a — 最小变更验证

工作者：`Implementer` × N 并行，其中 N = 要测试的假设数量。每个假设分别同时调度一个 Implementer。

- `Implementer — verifying hypothesis 1: <hypothesis-1-test>` — 执行最小变更以确认/证伪
- `Implementer — verifying hypothesis 2: <hypothesis-2-test>`（如适用）

每个 Implementer 只执行步骤 3 中假设的 **Test** 字段所描述的变更。不进行额外清理，不重新格式化。每次变更后运行失败的测试/命令，并记录结果。

如果只存在一个假设，单个 Implementer 是合理的（没有并行角度；根据 DOCTRINE 12.2.3 的单 Worker 例外，采用单 Worker 子阶段）。

Reviewer：`**Reviewer** — 检查验证结果是否具有确定性`，针对 Implementer 输出进行检查。确认每次测试运行都是确定性的，并且结果能够明确映射到确认/证伪结论。

**失败恢复（4a）：** Implementer 工具错误和 NEEDS_REVISION 判定遵循 DOCTRINE 规则 14（`skills/hyperflow/failure-recovery.md`）。中止或无法确认/证伪其假设的 Implementer 会将该假设标记为 `INCONCLUSIVE`，链路不会中止。其他假设照常继续；4b Debugger 会收到完整集合，其中包括所有 `INCONCLUSIVE` 条目。

### 步骤 4b — 重新评估 + 循环门控

Worker：`**Debugger** — 根据验证结果重新评估假设`。这是实质性推理：Debugger 将假设预测与实际测试结果进行比较，并决定下一个分支。并非通过/失败检查：Debugger 可以输出 `CONFIRMED`、`FALSIFIED ALL` 或带有新方向的 `PARTIALLY CONFIRMED`。

Reviewer：`**Reviewer** — 确认重新评估判定是否合理`，针对 Debugger 的判定进行确认。

**失败恢复（4b）：** Debugger 工具错误和 NEEDS_REVISION 判定遵循 DOCTRINE 规则 14（`skills/hyperflow/failure-recovery.md`）。失败的 4b Debugger 调度不会中止链路；重试一次，然后升级处理。如果所有尝试均失败，将整个验证步骤标记为 `INCONCLUSIVE` 并呈现给用户，未获得根因判定前不得进入步骤 5。

Debugger 判定：
- `CONFIRMED <hypothesis-N>` → 使用该假设作为已确认的根因，进入步骤 5。
- `FALSIFIED ALL` → 使用更广泛的证据范围，循环回到步骤 2。
- `PARTIALLY CONFIRMED` → 针对主要候选项以更严格的测试重新调度步骤 4a。

在进入步骤 5 前，还原 4a 中的所有最小改动（真正的修复在步骤 5 中完成，而不是这里）。

## 步骤 5 — 在根因处修复

原子性执行：一个 Worker-group（N 个并行 Implementer）→ 单个 Reviewer 对（DOCTRINE 12.2.8）。N 个 Implementer 是同一 Worker-group 内的并行角度；Reviewer 对该组输出进行门控。

针对每个受影响文件同时调度一个 Implementer（或者仅涉及单个文件时，合计调度一个 Implementer）：
- `Implementer — 在 <file-1> 中修复根因：<change-description>`
- `Implementer — 在 <file-2> 中修复根因：<change-description>`（如适用）

每个 Implementer 会收到：该 bug、来自步骤 4b 的已验证根因、最小改动。不得进行额外重构，不得进行机会性清理，只处理根因。

约束（不可协商）：
- 不得吞没错误
- 不得围绕症状添加防御性 try/catch
- 不得使用标志或功能门控来隐藏 bug

然后针对全部 Implementer 输出调度 `**Reviewer** — 检查修复是否位于根因处`。

Reviewer 验证：
- 修复针对步骤 4b 已确认的根因，而非症状。
- 没有违反约束（吞没错误、try/catch 变通方案、功能门控）。
- 所修改的文件在内部保持一致（不存在跨 N 个文件的不完整修复）。

若被拒绝，附上 Reviewer 的具体异议并循环执行第 5 步。第 5 步通过前，**不得**提交。

## 第 6 步 — 回归测试

原子操作 — 单个 Writer → 单个 Reviewer 配对（DOCTRINE 12.2.8）。测试编写没有并行空间：两个 Writer 会产生重复或冲突的测试。

派遣 `Writer — adding regression test for <bug>`。

测试必须：
- 覆盖确切的故障代码路径。
- 断言缺失的行为（而不只是断言修复已存在）。
- 名称应描述 bug 场景，而不是实现细节。

然后派遣 `**Reviewer** — confirming regression test fails-without and passes-with the fix`。

Reviewer 流程：
1. 在脑中（或通过 Bash）回退第 5 步的修复。
2. 确认新测试在故障状态下失败。
3. 重新应用修复。
4. 确认测试在修复状态下通过。

如果测试在有无修复的情况下都能通过，则拒绝；Writer 需重写。测试必须能够明确区分有 bug 和已修复的状态。

如果现有测试套件存在让此 bug 漏过的覆盖缺口 → 在第 7 步中注明。

## 第 7 步 — 记忆 + 最终审查

原子操作 — 单个 Writer → 单个集成 Reviewer 配对（DOCTRINE 12.2.8）。单一产物写入，没有并行空间；Reviewer 覆盖完整的累计 diff。

根据 [memory-system.md](references/memory-system.md) 派遣 `Writer — appending pitfall to .hyperflow/memory/pitfalls.md`。

条目必须包括：
- Bug 模式（通用化，而非项目特定）
- 现有测试为何遗漏它
- 预防策略
- 标签：`pitfall` 加上领域标签（例如 `auth`、`async`、`state`）

然后派遣 `**Reviewer** — final validation of fix + test + memory entry`。

这是对整个追踪流程的集成审查。Reviewer 评估累计 diff：
- 修复落在根因处（而不是症状处）。
- 回归测试能够区分故障与修复状态。
- 记忆条目正确地概括了该模式。
- 整个链路中未引入任何约束违规。

这是追踪链中唯一的集成 Reviewer。交接至部署前必须通过。

## 反模式（拒绝这些）

| 症状修补 | 为什么不对 |
|---|---|
| “只要捕获这个异常” | 找出它为什么会抛出 |
| “添加空值检查” | 找出它为什么是空值 |
| “增加超时时间” | 找出它为什么慢 |
| “失败时重试” | 先理解失败模式 |

## 输出格式

```
── Debug Result ─────────────────────
Bug: <one-line>
Reproducible: yes / no / intermittent
Root cause: <one-line>
Fix: <one-line summary>
Files changed: <list>
Regression test: <path>
─────────────────────────────────────
```

按照 [output-style.md](references/output-style.md)，以用量摘要（模型名称、agent 数量、token 总量）结束。

## 交接

Debug **不在自动链中** — 它是独立的。第 7 步 Reviewer 通过后，停止并建议使用 `/hyperflow:deploy` 来运行 pre-push 门禁，并将修复和回归测试一起提交。**不要**自动调用 ship — 推送需要用户明确选择加入。

## 原则

完整规则见 [DOCTRINE.md](../hyperflow/DOCTRINE.md)。另请参阅 [worker-prompt.md](references/worker-prompt.md) 和 [reviewer-prompt.md](references/reviewer-prompt.md)。

**失败恢复（规则 14）。** Worker 错误和 NEEDS_REVISION 判定遵循 `skills/hyperflow/failure-recovery.md` 中的规范策略。为便于追踪，失败的假设测试（步骤 4）会将假设标记为 `INCONCLUSIVE`，而不是中止链路——其他假设仍可能解决该 bug。步骤 2 中 Searcher 中止会导致证据不完整；应在根因综合中标记这一缺口，而不是假定覆盖范围完整后继续进行。

## 概述

`/hyperflow:trace` 是系统化调试技能。它拒绝只修补症状——每个修复都从复现、证据收集、通过 Debugger 对假设进行排序开始，并在任何代码更改之前完成验证。三个并行 Searcher 会对失败面进行三角定位；Debugger 在一次调用中应用 5-Whys + 假设排序；Reviewer 确认修复直达根因，并确认回归测试在修复前失败、修复后通过。脱离自动链路——独立运行。

## 前置条件

- 一个可复现的 bug（或足够的症状信息以便复现）。如果不明确，步骤 1 会分派一个 Searcher 来定位失败。
- Git 仓库——用于比较近期更改，并将修复与回归测试一并提交。
- 在 `.hyperflow/testing.md` 中检测到测试运行器（vitest/jest/playwright/pytest 等）——步骤 6 的回归测试必需。
- `.hyperflow/memory/pitfalls.md` 可写——步骤 7 会追加学到的模式。

## 指令

上方 [步骤 1 — 复现](#step-1--reproduce) 至 [步骤 7 — 记忆 + 最终审查](#step-7--memory--final-review) 中包含 7 个编号步骤。步骤 1、2、3、5、6、7 是原子步骤（DOCTRINE 12.2.8）。步骤 4 包含 2 个子阶段（存在真正的顺序依赖）。摘要：

1. **复现** — 原子步骤。Searcher 定位复现所需的产物（如有必要）；Reviewer 验证可复现性。在继续之前标记间歇性问题。
2. **收集证据** — 原子步骤。3 个并行 Searcher（日志、代码路径、相关测试）；Reviewer 验证覆盖范围；如果仍存在缺口，则重新运行特定的 Searcher。
3. **提出假设** — 原子步骤。Debugger 在一次调用中运行 5-Whys 因果链，并展开 1–3 个排序后的假设；Reviewer 验证因果链和假设集。
4. **验证** — 2 个子阶段。4a：并行 Implementer 针对每个假设进行最小改动 → Reviewer 确认确定性。4b：Debugger 根据结果重新评估并输出判定 → Reviewer 确认判定合理。循环执行 4a，或继续后续步骤。
5. **从根因修复** — 原子步骤。并行 Implementer 按受影响文件进行修复；Reviewer 确认修复不是症状修补；如果被拒绝则循环。
6. **回归测试** — 原子步骤。Writer 添加一个在代码损坏时必须失败的测试；Reviewer 确认修复前失败、修复后通过；如果测试只是无条件通过，则拒绝。
7. **记忆 + 最终审查** — 原子步骤。Writer 将问题模式追加到 `.hyperflow/memory/pitfalls.md`；集成 Reviewer 审查完整的累计差异。

## 输出

有关结构化区块（Bug、可复现、根因、修复、变更文件、回归测试），请参见上方的 [输出格式](#output-format)。最后附带使用摘要（agent 数量 + token 总数）。

## 错误处理

| 失败情形 | 行为 |
|---|---|
| 无法复现 | 步骤 1 输出 `Cannot reproduce — needs more info`；通过 `AskUserQuestion` 向用户询问额外的复现上下文。复现不可靠时，**不得**继续执行步骤 2。 |
| 间歇性 / 不稳定 | 在步骤 1 输出中明确标记；询问用户是希望将其视为不稳定问题继续处理，还是调查根本原因。 |
| 所有假设均被证伪 | 返回步骤 2，扩大证据收集范围。完成 2 个完整周期后，向用户提示：`Cannot localize root cause — need additional traces`。 |
| 审查者认为修复是症状补丁 | 拒绝并根据审查者的反馈返回步骤 5。**不得**提交症状补丁。 |
| 回归测试在有修复和无修复时都通过 | 拒绝；作者重写测试。该测试必须能够明确区分存在缺陷和已修复的状态。 |
| 缺少测试运行器 | 跳过步骤 6，并明确警告：`No test runner detected — fix committed without regression test`。建议用户添加测试运行器。 |

## 示例

### 标准追踪 —— 测试失败

```
/hyperflow:trace one of my auth tests is failing — find the root cause and fix it

搜索员 — 在最近的变更/测试中定位缺陷复现
**审查者** — 确认复现有效
搜索员 — 阅读错误堆栈追踪和日志
搜索员 — 映射涉及的代码路径
搜索员 — 查找相关测试（通过和失败）
**审查者** — 验证证据覆盖范围
**调试员** — 5 个为什么 + 假设排序：auth.test.ts:42 "refresh token rejected"

假设 1（很可能）：PR #189 更改了刷新令牌 TTL，但测试 fixture 未更新
假设 2（可能）：测试环境与 JWT 签发者之间存在时钟偏差

实现者 — 验证假设 1：刷新令牌 TTL
实现者 — 验证假设 2：时钟偏差检查
审查者 — 检查验证结果是否确定
**调试员** — 根据验证结果重新评估假设
审查者 — 确认重新评估结论合理
[假设 1 已确认]

实现者 — 修复根本原因：使测试 fixture TTL 与新的 TOKEN_REFRESH_TTL 常量保持一致
**审查者** — 检查修复是否针对根本原因
作者 — 为 TTL 漂移添加回归测试
**审查者** — 确认回归测试在无修复时失败、在有修复时通过
作者 — 将陷阱追加至 .hyperflow/memory/pitfalls.md
**审查者** — 对修复 + 测试 + 记忆条目进行最终验证

── 调试结果 ─────────────────────
缺陷：auth.test.ts:42 "refresh token rejected"
可复现：是
根本原因：测试 fixture TTL 硬编码为旧值；未与 TOKEN_REFRESH_TTL 常量同步
修复：将 TOKEN_REFRESH_TTL 导入测试 fixture；移除魔法数字
更改的文件：src/auth/test-fixtures.ts, test/auth/refresh.test.ts
回归测试：test/auth/refresh.test.ts::"TTL constant drift catches stale fixtures"
─────────────────────────────────────
代理：共 12 个 · 约 Xk 个 token
```

### 拒绝症状补丁请求

```
/hyperflow:trace just catch the exception in src/payments/processor.ts

拒绝 —— 追踪绝不会修补症状。异常是一个信号。让我找出它抛出的原因。

搜索员 — 阅读错误堆栈追踪和日志
...（继续执行完整的根本原因流程）
```

### 间歇性 Bug

```
/hyperflow:trace tests pass locally but fail in CI ~30% of the time

Flagged — intermittent. Possible causes: ordering dependency, race condition,
environmental difference, flaky external. Proceeding with extra evidence gathering.

Searcher — reading CI logs vs local logs
Searcher — looking for shared state between test files
...
```

## 资源

- [DOCTRINE.md](../hyperflow/DOCTRINE.md) — 编排规则（尤其是第 12 条中关于逐步代理的规定）。
- [worker-prompt.md](references/worker-prompt.md) — worker 提示词模板。
- [reviewer-prompt.md](references/reviewer-prompt.md) — reviewer 提示词模板。
- [memory-system.md](references/memory-system.md) — 陷阱条目格式。
- [output-style.md](references/output-style.md) — agent 标签格式及使用摘要规范。