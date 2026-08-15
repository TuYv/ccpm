---
name: scope-check
description: "Analyze a feature or sprint for scope creep by comparing current scope against the original plan. Flags additions, quantifies bloat, and recommends cuts. Use when user says 'any scope creep', 'scope review', 'are we staying in scope'."
argument-hint: "[feature-name or sprint-N]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash
model: haiku
---
# 范围检查

此技能为只读——仅报告发现的问题，不写入任何文件。

将原始规划范围与当前状态进行比较，以检测、量化范围蔓延并确定其处理优先级。

**参数：** `$ARGUMENTS[0]`——功能名称、冲刺编号或里程碑名称。

---

## 阶段 1：查找原始计划

查找与给定参数对应的基准范围文档：

- **功能名称** → 读取 `design/gdd/[feature].md` 或 `design/` 中匹配的文件
- **冲刺编号**（例如 `sprint-3`）→ 读取 `production/sprints/sprint-03.md` 或类似文件
- **里程碑** → 读取 `production/milestones/[name].md`

如果找不到文档，请报告缺失的文件并停止。如果没有可供比较的基准，请勿继续。

---

## 阶段 2：读取当前状态

检查实际已经实现或正在进行的内容：

- 扫描代码库中与该功能或冲刺相关的文件
- 阅读与此工作相关的 git 日志（`git log --oneline --since=[start-date]`）
- 检查表明存在尚未完成的范围新增项的 TODO/FIXME 注释
- 如果功能处于冲刺中期，请检查当前有效的冲刺计划

---

## 阶段 3：比较原始范围与当前范围

生成比较报告：

```markdown
## Scope Check: [Feature/Sprint Name]
Generated: [Date]

### Original Scope
[List of items from the original plan]

### Current Scope
[List of items currently implemented or in progress]

### Scope Additions (not in original plan)
| Addition | Source | When | Justified? | Effort |
|----------|--------|------|------------|--------|
| [item] | [commit/person] | [date] | [Yes/No/Unclear] | [S/M/L] |

### Scope Removals (in original but dropped)
| Removed Item | Reason | Impact |
|-------------|--------|--------|
| [item] | [why removed] | [what's affected] |

### Bloat Score
- Original items: [N]
- Current items: [N]
- Items added: [N] (+[X]%)
- Items removed: [N]
- Net scope change: [+/-N] ([X]%)

### Risk Assessment
- **Schedule Risk**: [Low/Medium/High] — [explanation]
- **Quality Risk**: [Low/Medium/High] — [explanation]
- **Integration Risk**: [Low/Medium/High] — [explanation]

### Recommendations
1. **Cut**: [Items that should be removed to stay on schedule]
2. **Defer**: [Items that can move to a future sprint/version]
3. **Keep**: [Additions that are genuinely necessary]
4. **Flag**: [Items that need a decision from producer/creative-director]
```

---

## 阶段 4：判定

根据净范围变化给出规范判定：

| 净变化 | 判定 | 含义 |
|-----------|---------|---------|
| ≤10% | **PASS** | 进展正常——处于可接受的偏差范围内 |
| 10–25% | **CONCERNS** | 轻微范围蔓延——可通过有针对性的削减进行控制 |
| 25–50% | **FAIL** | 严重范围蔓延——必须削减范围或正式延长时间线 |
| >50% | **FAIL** | 已失控——停止、重新规划并上报给制作人 |

醒目地输出判定：

```
**Scope Verdict: [PASS / CONCERNS / FAIL]**
Net change: [+X%] — [On Track / Minor Creep / Significant Creep / Out of Control]
```

---

## 阶段 5：后续步骤

提交报告后，提供具体的后续行动建议：

- **通过** → 无需采取行动。建议在下一个里程碑前重新运行检查。
- **存在疑虑** → 主动帮助确定削减收益比最高的 2–3 个新增项。提及 `/sprint-plan update`，以便正式重新界定范围。
- **不通过** → 建议上报给制作人。提及使用 `/sprint-plan update` 重新规划，或使用 `/estimate` 重新确定时间线基准。

始终以下述内容结尾：
> “完成削减后，再次运行 `/scope-check [name]`，以验证判定结果是否有所改善。”

---

### 规则

- 范围蔓延是指在没有相应削减内容或延长时间线的情况下增加内容
- 并非所有新增内容都是不好的——其中一些是新发现的需求。但必须明确承认并将其纳入考量
- 在建议削减内容时，应优先保留核心玩家体验，而不是锦上添花的内容
- 始终量化范围变化——“感觉规模变大了”不具备可操作性，而“物品数量增加了 35%”则具备可操作性