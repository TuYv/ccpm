---
name: sprint-status
description: "Fast sprint status check. Reads the current sprint plan, scans story files for status, and produces a concise progress snapshot with burndown assessment and emerging risks. Run at any time during a sprint for quick situational awareness. Use when user asks 'how is the sprint going', 'sprint update', 'show sprint progress'."
argument-hint: "[sprint-number or blank for current]"
user-invocable: true
allowed-tools: Read, Glob, Grep
model: haiku
---
# Sprint 状态

这是一次快速的态势感知检查，而不是 Sprint 评审。它会读取
当前 Sprint 计划和故事文件，扫描状态标记，并在 30 行以内生成
简明快照。有关详细的 Sprint 管理，请使用
`/sprint-plan update` 或 `/milestone-review`。

**此 Skill 为只读。** 它绝不会提出变更、绝不会请求写入
文件，并且最多只会给出一项具体建议。

---

## 1. 查找 Sprint

**参数：** `$ARGUMENTS[0]`（留空 = 使用当前 Sprint）

- 如果提供了参数（例如 `/sprint-status 3`），则在
  `production/sprints/` 中搜索与 `sprint-03.md`、`sprint-3.md`
  或类似名称匹配的文件。报告找到的是哪个文件。
- 如果未提供参数，则查找 `production/sprints/` 中最近修改的文件，
  并将其视为当前 Sprint。
- 如果 `production/sprints/` 不存在或为空，则报告：“未找到 Sprint
  文件。请使用 `/sprint-plan new` 启动一个 Sprint。”然后停止。

完整读取 Sprint 文件。提取：
- Sprint 编号和目标
- 开始日期和结束日期
- 所有故事或任务条目，以及它们的优先级（Must Have / Should Have /
  Nice to Have）、负责人和估算

---

## 2. 计算剩余天数

使用今天的日期和 Sprint 文件中的 Sprint 结束日期，计算：
- Sprint 总天数（结束日期减去开始日期）
- 已过去天数
- 剩余天数
- 已消耗时间的百分比

如果 Sprint 文件不包含明确的日期，请注明“未找到 Sprint 日期——
已跳过燃尽评估。”

---

## 3. 扫描故事状态

**首先：检查 `production/sprint-status.yaml`。**

如果存在，则直接读取它——它是权威的事实来源。
从 `status` 字段中提取每个故事的状态。无需扫描 Markdown。
使用其中的 `sprint`、`goal`、`start`、`end` 字段，而不是重新解析 Sprint 计划。

**如果 `sprint-status.yaml` 不存在**（旧版 Sprint 或首次设置），
则回退到 Markdown 扫描：

1. 如果条目引用了故事文件路径，请检查该文件是否存在。
   读取该文件并扫描状态标记：DONE、COMPLETE、IN PROGRESS、
   BLOCKED、NOT STARTED（不区分大小写）。
2. 如果条目没有文件路径（Sprint 计划中的内联任务），则扫描
   Sprint 计划本身，查找该条目旁边的状态标记。
3. 如果未找到状态标记，则将其归类为 NOT STARTED。
4. 如果引用了文件但该文件不存在，则将其归类为 MISSING 并加以注明。

使用回退方式时，在输出底部添加以下说明：
“⚠ 未找到 `sprint-status.yaml`——状态根据 Markdown 推断。请运行 `/sprint-plan update` 生成该文件。”

可选操作（仅做快速检查——不要进行深度扫描）：在 `src/` 中 grep
与故事系统 slug 匹配的目录或文件名，以检查是否存在实现证据。
这仅作为提示，而不是确定状态的依据。

### 陈旧故事检测

收集所有故事的状态后，检查每个 IN PROGRESS 故事是否陈旧：

- 对于每个引用了文件的故事，读取该文件，并在 frontmatter 或标题区域中查找
  `Last Updated:` 字段（例如 `Last Updated: 2026-04-01`
  或 `updated: 2026-04-01`）。接受任何合理的日期字段名称：`Last Updated`、
  `Updated`、`last-updated`、`updated_at`。
- 使用今天的日期计算自该日期以来经过的天数。
- 如果该日期距今超过 4 天，则将该故事标记为 **STALE**。（4 天阈值考虑了周末——周五最后更新的故事要到周三才会显示为陈旧。）
- 如果故事文件中未找到日期字段，请注明“无时间戳——无法检查是否陈旧。”
- 如果故事没有引用文件（内联任务），请注明“内联任务——无法检查是否陈旧。”

STALE 故事会包含在输出表格中，并汇总到“Attention Needed”
部分（参见阶段 5 的输出格式）。

**陈旧故事升级规则**：如果任何 IN PROGRESS 故事被标记为 STALE（超过 4 天没有进展），则燃尽评估结果
至少升级为 **At Risk**——即使完成百分比仍处于正常的
On Track 区间内。记录此升级原因："At Risk — [N] story(ies) with no progress in
[N] days."

---

## 4. 燃尽评估

计算：
- 已完成的任务（DONE 或 COMPLETE）
- 进行中的任务（IN PROGRESS）
- 被阻塞的任务（BLOCKED）
- 尚未开始的任务（NOT STARTED 或 MISSING）
- 完成百分比：(complete / total) * 100

通过比较完成百分比与已消耗时间百分比来评估燃尽情况：

- **On Track**：完成百分比与已消耗时间百分比相差不超过 10 个百分点，或完成进度领先
- **At Risk**：完成百分比落后于已消耗时间百分比 10 至 25 个百分点
- **Behind**：完成百分比落后于已消耗时间百分比超过 25 个百分点

如果无法获取日期，则跳过燃尽评估并报告 "On Track /
At Risk / Behind: unknown — sprint dates not found."

---

## 5. 输出

保持输出简洁。故事状态表是必需的——不得截断。尽量将总行数控制在 50 行以内；如果没有发现值得注意的内容，则省略 Emerging Risks 部分。使用以下格式：

```markdown
## Sprint [N] Status — [Today's Date]
**Sprint Goal**: [from sprint plan]
**Days Remaining**: [N] of [total] ([% time consumed])

### Progress: [complete/total] tasks ([%])

| Story / Task         | Priority   | Status      | Owner   | Blocker        |
|----------------------|------------|-------------|---------|----------------|
| [title]              | Must Have  | DONE        | [owner] |                |
| [title]              | Must Have  | IN PROGRESS | [owner] |                |
| [title]              | Must Have  | BLOCKED     | [owner] | [brief reason] |
| [title]              | Should Have| NOT STARTED | [owner] |                |

### Attention Needed
| Story / Task         | Status      | Last Updated   | Days Stale | Note           |
|----------------------|-------------|----------------|------------|----------------|
| [title]              | IN PROGRESS | [date or N/A]  | [N days]   | [STALE / no timestamp — cannot check staleness / inline task — cannot check staleness] |

*(Omit this section entirely if no IN PROGRESS stories are stale or have timestamp concerns.)*

### Burndown: [On Track / At Risk / Behind]
[1-2 sentences. If behind: which Must Haves are at risk. If on track: confirm
and note any Should Haves the team could pull.]

### Must-Haves at Risk
[List any Must Have stories that are BLOCKED or NOT STARTED with less than
40% of sprint time remaining. If none, write "None."]

### Emerging Risks
[Any risks visible from the story scan: missing files, cascading blockers,
stories with no owner. If none, write "None identified."]

### Recommendation
[One concrete action, or "Sprint is on track — no action needed."]
```

---

## 6. 快速升级规则

在输出前应用以下规则；如果触发，请将标记放在输出的最顶部（状态表上方）：

**严重风险标记** — 如果 Must Have 用户故事处于 BLOCKED 或 NOT STARTED 状态，且冲刺剩余时间不足 40%：

```
SPRINT AT RISK: [N] Must Have stories are not complete with [X]% of sprint
time remaining. Recommend replanning with `/sprint-plan update`.
```

**完成标记** — 如果所有 Must Have 用户故事均为 DONE：

```
All Must Haves complete. Team can pull from Should Have backlog.
```

**故事文件缺失标记** — 如果引用的任何故事文件不存在：

```
NOTE: [N] story files referenced in the sprint plan are missing.
Run `/story-readiness sprint` to validate story file coverage.
```

---

## 协作协议

此技能为只读模式。它报告从磁盘文件中观察到的事实。

- 它不会更新冲刺计划
- 它不会更改故事状态
- 它不会建议削减范围（这是 `/sprint-plan update` 的职责）
- 每次运行最多提出一条建议

如需了解特定故事的更多详情，用户可以直接阅读故事文件，或运行 `/story-readiness [path]`。

如需重新规划冲刺，请使用 `/sprint-plan update`。
如需进行冲刺结束回顾，请使用 `/retrospective`。