---
name: day-one-patch
description: "Prepare a day-one patch for a game launch. Scopes, prioritises, implements, and QA-gates a focused patch addressing known issues discovered after gold master but before or immediately after public launch. Treats the patch as a mini-sprint with its own QA gate and rollback plan."
argument-hint: "[scope: known-bugs | cert-feedback | all]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task, AskUserQuestion
model: sonnet
---
# 首日补丁

每款已发布的游戏都会有首日补丁。在发布日之前做好规划可以避免混乱。此技能将补丁范围限定在安全且必要的内容内，通过轻量级 QA 流程进行把关，并确保在发布任何内容之前已有回滚计划。这是一个迷你冲刺——不是热修复，也不是完整冲刺。

**何时运行：**
- 黄金母版构建锁定后（认证已获批准或发布候选版本已添加标签）
- 存在已知错误，但在黄金母版中修复这些错误的风险过高时
- 认证反馈要求在提交后进行小幅修复时
- 发布门禁通过后，发布前试玩发现了必须修复的问题时

**首日补丁范围规则：**
- 仅包含能够快速安全修复的 P1/P2 错误
- 不添加新功能——仅限修复
- 不进行重构——仅做最小可行变更
- 任何需要超过 4 小时开发时间的修复都应归入补丁 1.1，而非首日补丁

**输出：** `production/releases/day-one-patch-[version].md`

---

## 阶段 1：加载发布上下文

读取：
- `production/stage.txt`——确认项目处于发布阶段
- `production/gate-checks/` 中最新的文件——读取发布门禁结论
- `production/qa/bugs/*.md`——加载所有 Status: Open 或 Fixed — Pending Verification 的错误
- `production/sprints/` 中最新的文件——了解已发布的内容
- `production/security/security-audit-*.md` 中最新的文件——检查是否存在任何未解决的安全事项

如果 `production/stage.txt` 不是 `Release` 或 `Polish`：
> “首日补丁准备适用于处于发布阶段的项目。当前阶段：[stage]。在项目临近发布之前，不适合使用此技能。”

---

## 阶段 2：确定补丁范围

### 步骤 2a——对未解决的错误进行分类，以确定是否纳入补丁

针对每个未解决的错误进行评估：

| 标准 | 是否纳入首日补丁？ |
|-----------|-------------------|
| 严重级别为 S1 或 S2 | 是——如果能够安全修复，则必须纳入 |
| 优先级为 P1 | 是 |
| 预计修复时间少于 4 小时 | 是 |
| 修复需要更改架构 | 否——推迟至 1.1 |
| 修复会引入新的代码路径 | 否——风险过高 |
| 修复仅涉及数据/配置（不更改代码） | 是——风险非常低 |
| 认证反馈要求 | 是——平台批准所必需 |
| 严重级别为 S3/S4 | 仅当修复只是简单的配置变更时纳入；否则推迟 |

### 步骤 2b——向用户展示补丁范围

使用 `AskUserQuestion`：
- 提示：“根据未解决的错误和认证反馈，以下是建议的首日补丁范围。这样是否合适？”
- 显示：已纳入错误的表格（ID、严重级别、描述、预计工作量）
- 显示：已推迟错误的表格（ID、严重级别、推迟原因）
- 选项：`[A] 批准此范围` / `[B] 调整——我想添加或移除项目` / `[C] 不需要首日补丁`

如果选择 [C]：输出“不需要首日补丁。继续执行 `/launch-checklist`。”然后停止。

### 步骤 2c——检查总范围

汇总预计工作量。如果总工作量超过 1 个工作日：
> “⚠️ 补丁范围为 [N hours]——这超出了安全的首日补丁时间窗口。请考虑将优先级较低的项目推迟至补丁 1.1。臃肿的首日补丁带来的风险会多于它所消除的风险。”

使用 `AskUserQuestion` 确认是继续执行还是缩小范围。

---

## 阶段 3：回滚计划

在编写任何代码之前，先定义回滚流程。这一点没有商量余地。

通过 Task 启动 `release-manager`。要求其制定一份涵盖以下内容的回滚计划：
- 如何在每个目标平台上恢复到黄金母版构建
- 各平台特有的回滚限制（某些平台无法回滚认证构建）
- 谁负责触发回滚
- 如果发生回滚，需要向玩家传达哪些信息

展示回滚计划。询问：“我可以将此回滚计划写入 `production/releases/rollback-plan-[version].md` 吗？”

在回滚计划写入之前，不要进入阶段 4。

---

## 阶段 4：实施修复

对于已批准范围内的每个 bug，启动一个专门的实施循环：

1. 通过 Task 启动 `lead-programmer`，并提供：
   - bug 报告（准确的复现步骤，以及已知情况下的根本原因）
   - 约束条件：仅实施最小可行修复，不进行清理
   - 受影响的文件（来自 bug 报告的 Technical Context 部分）

2. lead-programmer 实施修复并运行针对性测试。

3. 通过 Task 启动 `qa-tester` 进行验证：修复后该 bug 是否仍可复现？

对于仅涉及配置/数据的修复：直接进行更改（无需 programmer agent）。确认值已更改，并重新运行所有相关的冒烟测试。

---

## 阶段 5：补丁 QA 门禁

这是一次轻量级 QA 检查，而不是完整的 `/team-qa`。该补丁已经通过发布门禁的 QA 批准；我们只需重新验证发生变更的区域。

通过 Task 启动 `qa-lead`，并提供：
- 所有已更改文件的列表
- 已修复 bug 的列表（包含阶段 4 中的验证状态）
- 受影响系统的冒烟检查范围

要求 qa-lead 判断：**针对性冒烟检查是否足够，或者是否有任何修复触及需要进行更广泛回归测试的系统？**

执行所需的 QA 范围：
- **针对性冒烟检查**——运行 `/smoke-check [affected-systems]`
- **更广泛的回归测试**——对受影响的系统运行 `tests/unit/` 和 `tests/integration/` 中的针对性测试

QA 结论必须为 PASS 或 PASS WITH WARNINGS，才能继续。如果结论为 FAIL：将失败的修复排除在首日补丁范围之外，并推迟至 1.1。

---

## 阶段 6：生成补丁记录

```markdown
# Day-One Patch: [Game Name] v[version]

**Date prepared**: [date]
**Target release**: [launch date or "day of launch"]
**Base build**: [gold master tag or commit]
**Patch build**: [patch tag or commit]

---

## Patch Notes (Internal)

### Bugs Fixed
| BUG-ID | Severity | Description | Fix summary |
|--------|----------|-------------|-------------|
| BUG-NNN | S[1-4] | [description] | [one-line fix] |

### Deferred to 1.1
| BUG-ID | Severity | Description | Reason deferred |
|--------|----------|-------------|-----------------|
| BUG-NNN | S[1-4] | [description] | [reason] |

---

## QA Sign-Off

**QA scope**: [Targeted smoke / Broader regression]
**Verdict**: [PASS / PASS WITH WARNINGS]
**QA lead**: qa-lead agent
**Date**: [date]
**Warnings (if any)**: [list or "None"]

---

## Rollback Plan

See: `production/releases/rollback-plan-[version].md`

**Trigger condition**: If [N] or more S1 bugs are reported within [X] hours of launch, execute rollback.
**Rollback owner**: [user / producer]

---

## Approvals Required Before Deploy

- [ ] lead-programmer: all fixes reviewed
- [ ] qa-lead: QA gate PASS confirmed
- [ ] producer: deployment timing approved
- [ ] release-manager: platform submission confirmed

---

## Player-Facing Patch Notes

[Draft for community-manager to review before publishing]

[list player-facing changes in plain language]
```

询问：“我可以将此补丁记录写入 `production/releases/day-one-patch-[version].md` 吗？”

---

## 阶段 7：后续步骤

补丁记录写入后：

1. 运行 `/patch-notes`，生成面向玩家的补丁说明版本
2. 补丁上线后，针对每个已修复的错误运行 `/bug-report verify [BUG-ID]`
3. 针对每个已验证的修复运行 `/bug-report close [BUG-ID]`
4. 使用 `/retrospective launch` 安排在上线后 48–72 小时进行发布后复盘

**如果补丁发布后仍有任何 S1 错误处于未解决状态：**
> “⚠️ 仍有 S1 错误尚未解决，且未包含在本次补丁中。这些是已接受的风险。请将其记录在回滚计划的触发条件中——如果这些错误大规模发生，回滚可能比发布后续补丁更合适。”

使用 `AskUserQuestion`：
- 提示：“首日补丁已完成。接下来做什么？”
- 选项：
  - `[A] Run /patch-notes — generate player-facing patch notes`
  - `[B] Run /bug-report to log any issues found post-deploy`
  - `[C] Stop here`

---

## 协作规程

- **范围纪律至关重要**——抵制范围蔓延；每一项新增内容都会增加风险
- **始终优先制定回滚计划**——没有回滚计划的补丁是不负责任的
- **延期不等于遗忘**——每个延期处理的错误都会自动获得一个 1.1 工单
- **玩家沟通是补丁的一部分**——`/patch-notes` 是必需的输出，而非可选项