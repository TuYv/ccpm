---
name: playtest-report
description: "Generates a structured playtest report template or analyzes existing playtest notes into a structured format. Use this to standardize playtest feedback collection and analysis."
argument-hint: "[new|analyze path-to-notes] [--review full|lean|solo]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Task, AskUserQuestion
model: sonnet
---
## 阶段 1：解析参数

确定审查模式（仅确定一次，并存储供本次运行中的所有关卡派生任务使用）：
1. 如果传入了 `--review [full|lean|solo]` → 使用该值
2. 否则读取 `production/review-mode.txt` → 使用其中的值
3. 否则 → 默认使用 `lean`

完整的检查模式请参阅 `.claude/docs/director-gates.md`。

确定模式：

- `new` → 生成空白的试玩报告模板
- `analyze [path]` → 读取原始笔记，并使用结构化发现填写模板

---

## 阶段 2A：新建模板模式

生成以下模板并将其输出给用户：

```markdown
# Playtest Report

## Session Info
- **Date**: [Date]
- **Build**: [Version/Commit]
- **Duration**: [Time played]
- **Tester**: [Name/ID]
- **Platform**: [PC/Console/Mobile]
- **Input Method**: [KB+M / Gamepad / Touch]
- **Session Type**: [First time / Returning / Targeted test]

## Test Focus
[What specific features or flows were being tested]

## First Impressions (First 5 minutes)
- **Understood the goal?** [Yes/No/Partially]
- **Understood the controls?** [Yes/No/Partially]
- **Emotional response**: [Engaged/Confused/Bored/Frustrated/Excited]
- **Notes**: [Observations]

## Gameplay Flow
### What worked well
- [Observation 1]

### Pain points
- [Issue 1 -- Severity: High/Medium/Low]

### Confusion points
- [Where the player was confused and why]

### Moments of delight
- [What surprised or pleased the player]

## Bugs Encountered
| # | Description | Severity | Reproducible |
|---|-------------|----------|-------------|

## Feature-Specific Feedback
### [Feature 1]
- **Understood purpose?** [Yes/No]
- **Found engaging?** [Yes/No]
- **Suggestions**: [Tester suggestions]

## Quantitative Data (if available)
- **Deaths**: [Count and locations]
- **Time per area**: [Breakdown]
- **Items used**: [What and when]
- **Features discovered vs missed**: [List]

## Overall Assessment
- **Would play again?** [Yes/No/Maybe]
- **Difficulty**: [Too Easy / Just Right / Too Hard]
- **Pacing**: [Too Slow / Good / Too Fast]
- **Session length preference**: [Shorter / Good / Longer]

## Top 3 Priorities from this session
1. [Most important finding]
2. [Second priority]
3. [Third priority]
```

---

## 阶段 2B：分析模式

读取所提供路径中的原始笔记。与现有设计文档交叉核对。使用结构化发现填写上述模板。标记所有与设计意图冲突的试玩观察结果。

---

## 阶段 3：操作分流

将所有发现分为四类：

- **需要设计变更** — 趣味性问题、玩家困惑、机制失效、与 GDD 预期体验冲突的观察结果
- **平衡性调整** — 数值体验不合理、难度起伏过大或过于平缓
- **错误报告** — 可复现的明确实现缺陷
- **打磨事项** — 不会阻碍进度，但可在后续处理的操作阻力或体验问题

列出分类后的清单，然后进行分流：

- **设计变更：**“对受影响的设计文档运行 `/propagate-design-change [path]`，在进行变更前查找下游影响。”
- **平衡性调整：**“在调整数值前运行 `/balance-check [system]`，以核实完整的平衡情况。”
- **错误：**“使用 `/bug-report` 正式跟踪这些问题。”
- **打磨事项：**“当团队进入该阶段时，将其添加到 `production/` 中的打磨待办列表。”

---

## 阶段 3b：创意总监玩家体验评审

**评审模式检查** — 在启动 CD-PLAYTEST 前应用：
- `solo` → 跳过。注明：“CD-PLAYTEST 已跳过 — 单人模式。”继续进入阶段 4（保存报告）。
- `lean` → 跳过（不是 PHASE-GATE）。注明：“CD-PLAYTEST 已跳过 — 精简模式。”继续进入阶段 4（保存报告）。
- `full` → 正常启动。

对发现的问题进行分类后，通过 Task 启动 `creative-director`，并使用关卡 **CD-PLAYTEST**（`.claude/docs/director-gates.md`）。

传入：结构化报告内容、游戏支柱和核心幻想（来自 `design/gdd/game-concept.md`），以及正在测试的具体假设。

在保存报告之前，展示创意总监的评估。如果结论为 CONCERNS 或 REJECT，则在报告中添加 `## 创意总监评估` 章节，记录结论和反馈。如果结论为 APPROVE，则在报告中注明已批准。

---

## 阶段 4：保存报告

询问：“我可以将这份游戏测试报告写入 `production/qa/playtests/playtest-[date]-[tester].md` 吗？”

如果可以，则写入文件，并在需要时创建目录。

---

## 阶段 5：后续步骤

结论：**COMPLETE** — 游戏测试报告已生成。

- 首先处理优先级最高的发现类别。
- 处理完设计变更后：对更新后的 GDD 重新运行 `/design-review`。
- 修复缺陷后：重新运行 `/bug-triage` 以更新优先级。