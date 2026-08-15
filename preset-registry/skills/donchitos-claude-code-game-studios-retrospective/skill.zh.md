---
name: retrospective
description: "Generates a sprint or milestone retrospective by analyzing completed work, velocity, blockers, and patterns. Produces actionable insights for the next iteration."
argument-hint: "[sprint-N|milestone-name]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Bash, AskUserQuestion
model: sonnet
---
## 阶段 1：解析参数

确定这是一次冲刺复盘（`sprint-N`）还是里程碑复盘（`milestone-name`）。

---

## 阶段 1b：检查是否已有复盘

在加载任何数据之前，使用 glob 查找已有的复盘文件：

- 对于冲刺复盘：`production/retrospectives/retro-[sprint-slug]-*.md`
  （同时检查备用位置 `production/sprints/sprint-[N]-retrospective.md`）
- 对于里程碑复盘：`production/retrospectives/retro-[milestone-name]-*.md`

如果找到匹配的文件，使用 `AskUserQuestion`：
- 提示："发现已有复盘：[filename]。你希望如何继续？"
- 选项：
  - `[A] 更新现有复盘 — 加载该文件，并使用新数据添加或修订各部分`
  - `[B] 重新开始 — 生成新的复盘（归档旧复盘）`

如果选择 [A]：读取现有文件并沿用其内容，使用新数据修订各部分。
如果选择 [B]：以空白状态继续进入阶段 2。在写入新文件之前，将现有文件重命名，并添加 `-archived-[date]` 后缀。

---

## 阶段 2：加载冲刺或里程碑数据

从相应位置读取冲刺或里程碑计划：

- 冲刺计划：`production/sprints/`
- 里程碑定义：`production/milestones/`

**还要检查 `production/sprint-status.yaml`**：如果存在，则将其与冲刺计划一并读取。它是实际用户故事完成状态（status: done、完成日期、阻塞项）的权威来源。在阶段 3 中，将其作为完成度指标的主要来源。只有在 yaml 不存在时，才回退到扫描 markdown。记录 yaml 与冲刺计划之间的差异（例如，用户故事存在于 yaml 中但不在计划中，反之亦然）。

**如果文件不存在或为空**，输出：

> "未找到 [sprint/milestone] 的冲刺数据。请先运行 `/sprint-status` 生成
> 冲刺数据，或手动提供冲刺详情。"

然后使用 `AskUserQuestion` 提供两个选项：

- **[A] 手动提供数据** — 要求用户粘贴或描述冲刺任务、日期和结果；将其作为复盘的事实来源。
- **[B] 停止** — 中止该 skill。结论：**BLOCKED** — 没有可用的冲刺数据。

如果用户选择 [A]，收集数据，并使用其提供的内容继续进入阶段 3。
如果用户选择 [B]，则在此停止。

提取：计划任务、预估工作量、负责人和目标。

针对冲刺周期运行 git log，以了解实际提交的内容和时间。使用 Bash 工具（该工具在 Windows 上使用 Git Bash — `2>/dev/null` 是 bash 语法，而不是 PowerShell 语法）：

```
Bash: git log --oneline --since="4 weeks ago" 2>/dev/null || git log --oneline -20
```

如果冲刺计划中已知冲刺持续时间，则调整 `--since` 日期以与之匹配。

---

## 阶段 3：分析完成情况和趋势

通过将计划与实际交付成果进行比较，扫描已完成和未完成的任务。检查：

- 按计划完成的任务
- 已完成但与计划有所不同的任务
- 结转任务（未完成）
- 冲刺中途新增的任务（计划外工作）
- 已移除或缩减范围的任务

扫描代码库中的 TODO/FIXME 趋势：

- 统计当前 TODO/FIXME/HACK 注释的数量
- 如果可以获取上一迭代的数据（检查之前的回顾文档），则进行比较
- 说明技术债务是在增加还是减少

阅读 `production/retrospectives/` 中之前的回顾文档（如果有），以检查：

- 之前的行动项是否已得到处理？
- 相同的问题是否反复出现？
- 迭代速率的趋势如何？

---

## 阶段 4：生成回顾文档

```markdown
## Retrospective: [Sprint N / Milestone Name]
Period: [Start Date] -- [End Date]
Generated: [Date]

### Metrics

| Metric | Planned | Actual | Delta |
|--------|---------|--------|-------|
| Tasks | [X] | [Y] | [+/- Z] |
| Completion Rate | -- | [Z%] | -- |
| Story Points / Effort Days | [X] | [Y] | [+/- Z] |
| Bugs Found | -- | [N] | -- |
| Bugs Fixed | -- | [N] | -- |
| Unplanned Tasks Added | -- | [N] | -- |
| Commits | -- | [N] | -- |

### Velocity Trend

| Sprint | Planned | Completed | Rate |
|--------|---------|-----------|------|
| [N-2] | [X] | [Y] | [Z%] |
| [N-1] | [X] | [Y] | [Z%] |
| [N] (current) | [X] | [Y] | [Z%] |

**Trend**: [Increasing / Stable / Decreasing]
[One sentence explaining the trend]

### What Went Well
- [Observation backed by specific data or examples]
- [Another positive observation]
- [Recognize specific contributions or decisions that paid off]

### What Went Poorly
- [Specific issue with measurable impact -- e.g., "Feature X took 5 days
  instead of estimated 2, blocking tasks Y and Z"]
- [Another issue with impact]
- [Do not assign blame -- focus on systemic causes]

### Blockers Encountered

| Blocker | Duration | Resolution | Prevention |
|---------|----------|------------|------------|
| [What blocked progress] | [How long] | [How it was resolved] | [How to prevent recurrence] |

### Estimation Accuracy

| Task | Estimated | Actual | Variance | Likely Cause |
|------|-----------|--------|----------|--------------|
| [Most overestimated task] | [X] | [Y] | [+Z] | [Why] |
| [Most underestimated task] | [X] | [Y] | [-Z] | [Why] |

**Overall estimation accuracy**: [X%] of tasks within +/- 20% of estimate

[Analysis: Are we consistently over- or under-estimating? For which types of
tasks? What adjustment should we apply?]

### Carryover Analysis

| Task | Original Sprint | Times Carried | Reason | Action |
|------|----------------|---------------|--------|--------|
| [Task that was not completed] | [Sprint N-X] | [N] | [Why] | [Complete / Descope / Redesign] |

### Technical Debt Status
- Current TODO count: [N] (previous: [N])
- Current FIXME count: [N] (previous: [N])
- Current HACK count: [N] (previous: [N])
- Trend: [Growing / Stable / Shrinking]
- [Note any areas of concern]

### Previous Action Items Follow-Up

| Action Item (from Sprint N-1) | Status | Notes |
|-------------------------------|--------|-------|
| [Previous action] | [Done / In Progress / Not Started] | [Context] |

### Action Items for Next Iteration

| # | Action | Owner | Priority | Deadline |
|---|--------|-------|----------|----------|
| 1 | [Specific, measurable action] | [Who] | [High/Med/Low] | [When] |
| 2 | [Another action] | [Who] | [Priority] | [When] |

### Process Improvements
- [Specific change to how we work, with expected benefit]
- [Another improvement -- keep it to 2-3 actionable items, not a wish list]

### Summary
[2-3 sentence overall assessment: Was this a good sprint/milestone? What is
the single most important thing to change going forward?]
```

---

## 阶段 5：保存回顾总结

向用户展示回顾总结和最重要的发现（完成率、速率趋势、首要阻碍因素、最重要的行动项）。

询问：“我可以将此内容写入 `production/retrospectives/retro-sprint-[N]-[date].md` 吗？”（如果是里程碑回顾，则写入 `production/retrospectives/retro-[milestone-name]-[date].md`）

如果同意，则写入文件，并在需要时创建 `production/retrospectives/` 目录。结论：**已完成** — 回顾总结已保存。

如果不同意，则到此为止。结论：**受阻** — 用户拒绝写入。

---

## 阶段 6：后续步骤

使用 `AskUserQuestion`：
- 提示：“回顾总结已完成。行动项和速率数据均已就绪。你想现在使用这些预加载的数据开始冲刺规划吗？”
- 选项：
  - `[A] 是 — 打开冲刺规划，并预先填入回顾行动项和速率变化`
  - `[B] 否 — 准备好后，我会手动引用回顾总结文件`

如果用户选择 [A]：继续调用 `/sprint-plan new`，传入回顾总结文件路径以及行动项和速率变化的摘要，以便冲刺规划工具参考。

- 如果这是里程碑回顾，则运行 `/gate-check`，正式评估进入下一阶段的就绪情况。

### 指南

- 坦诚且具体。含糊的回顾总结（“沟通可以做得更好”）只会带来含糊的改进。应使用数据和示例。
- 聚焦系统性问题，而不是归咎于个人。
- 将行动项限制在 3-5 个。过多会分散重点。
- 每个行动项都必须有负责人和截止日期。
- 检查之前的行动项是否已完成。反复出现且未得到处理的行动项是流程存在问题的信号。
- 如果这是里程碑回顾，还应评估里程碑目标是否达成，以及这对整体项目时间线意味着什么。