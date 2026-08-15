---
name: design-review
description: "Reviews a game design document for completeness, internal consistency, implementability, and adherence to project design standards. Run this before handing a design document to programmers."
argument-hint: "[path-to-design-doc] [--depth full|lean|solo]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Task, AskUserQuestion
model: sonnet
---
## 阶段 0：解析参数

提取 `--depth [full|lean|solo]`（如果存在）。未提供标志时，默认为 `full`。

**注意**：`--depth` 控制此技能的*分析深度*（会生成多少个专家代理）。它独立于 `production/review-mode.txt` 中控制总监关卡生成的全局审查模式。两者是不同的概念——`--depth` 决定的是*此*技能分析文档的详尽程度。

- **`full`**：完整审查——所有阶段 + 专家代理委派（阶段 3b）
- **`lean`**：所有阶段，但不使用专家代理——速度更快，单会话分析
- **`solo`**：仅执行阶段 1-4，不进行委派，也不在阶段 5 提示后续步骤——从另一个技能内部调用时使用

---

## 阶段 1：加载文档

完整阅读目标设计文档。阅读 CLAUDE.md，以了解项目背景和标准。阅读目标文档引用或暗示的相关设计文档（检查 `design/gdd/` 中的相关系统）。

**依赖关系图验证：** 对于 Dependencies 部分列出的每个系统，使用 Glob 检查其 GDD 文件是否存在于 `design/gdd/` 中。标记所有尚不存在的文件——这些是下游作者会遇到的失效引用。

**世界观/叙事一致性：** 如果 `design/gdd/game-concept.md` 或 `design/narrative/` 中的任何文件存在，请阅读它们。记录此 GDD 中任何与既定世界规则、基调或设计支柱相矛盾的机制选择。在阶段 3b 中将此背景信息传递给 `game-designer`。

**既往审查检查：** 检查 `design/gdd/reviews/[doc-name]-review-log.md` 是否存在。如果存在，请阅读最新条目——记录当时给出的结论以及列出的阻塞项。本次会话属于复审；跟踪此前的问题是否已解决。

---

## 阶段 2：完整性检查

根据设计文档标准检查清单进行评估：

- [ ] 包含 Overview 部分（单段摘要）
- [ ] 包含 Player Fantasy 部分（预期感受）
- [ ] 包含 Detailed Rules 部分（无歧义的机制）
- [ ] 包含 Formulas 部分（定义所有数学公式及其变量）
- [ ] 包含 Edge Cases 部分（处理异常情况）
- [ ] 包含 Dependencies 部分（列出其他系统）
- [ ] 包含 Tuning Knobs 部分（明确可配置值）
- [ ] 包含 Acceptance Criteria 部分（可测试的成功条件）

---

## 阶段 3：一致性与可实现性

**内部一致性：**
- 公式生成的值是否与所描述的行为一致？
- 边界情况是否与主要规则相矛盾？
- 依赖关系是否为双向的（另一个系统是否知道本系统的存在）？

**可实现性：**
- 规则是否足够精确，使程序员无须猜测即可实现？
- 是否存在遗漏细节、仅作笼统处理的部分？
- 是否考虑了性能影响？

**跨系统一致性：**
- 是否与任何现有机制冲突？
- 是否会与其他系统产生非预期的交互？
- 是否符合游戏既定的基调和设计支柱？

---

## 阶段 3b：对抗性专家审查（仅限 full 模式）

**在 `lean` 或 `solo` 模式下跳过此阶段。**

**此阶段在 full 模式下是强制性的。**请勿跳过。

**在生成任何代理之前**，输出以下通知：
> “完整审查：正在并行生成专家代理。此过程通常需要 8–15 分钟。如需更快的单会话分析，请使用 `--review lean`。”

### 步骤 1 — 识别 GDD 涉及的所有领域

阅读 GDD 并识别其中涉及的每一个领域。一个 GDD 可能同时涉及多个领域——务必全面。常见信号如下：

| 如果 GDD 包含…… | 生成这些代理 |
|------------------------|-------------------|
| 成本、价格、掉落、奖励、经济系统 | `economy-designer` |
| 战斗数值、伤害、生命值、DPS | `game-designer`、`systems-designer` |
| AI 行为、寻路、目标选择 | `ai-programmer` |
| 关卡布局、生成机制、波次结构 | `level-designer` |
| 玩家成长、XP、解锁内容 | `economy-designer`、`game-designer` |
| UI、HUD、菜单、面向玩家的显示内容 | `ux-designer`、`ui-programmer` |
| 对话、任务、故事、世界观设定 | `narrative-director` |
| 动画、手感、时机、表现力 | `gameplay-programmer` |
| 多人游戏、同步、复制 | `network-programmer` |
| 音频提示、音乐触发器 | `audio-director` |
| 性能、绘制调用、内存 | `performance-analyst` |
| 特定于引擎的模式或 API | 主要引擎专家（来自 `.claude/docs/technical-preferences.md`） |
| 验收标准、测试覆盖率 | `qa-lead` |
| 数据模式、资源结构 | `systems-designer` |
| 任何游戏玩法系统 | `game-designer`（始终生成） |

对于所有描述游戏玩法机制或面向玩家规则的 GDD，都应生成 `game-designer`。
对于所有包含公式或系统交互规则的 GDD，都应生成 `systems-designer`。
这些是最常见的基准配置——但对于纯 UI 规格、音频规格或世界观文档，并非必须如此。请使用上面的领域表来确定哪些专家确实相关。

### 步骤 2 — 并行生成所有相关专家

**关键：此技能中的 Task 会生成一个 SUBAGENT——一个拥有独立上下文窗口的、
彼此分离且独立的 Claude 会话。它不是任务跟踪。请勿在内部模拟专家视角。
请勿自行从各领域角度进行推理。你必须实际发出 Task 调用。
模拟审查并不等同于专家审查。**

同时发出所有 Task 调用。请勿逐个生成。

**以对抗性方式向每位专家发出提示：**
> “这是 [system] 的 GDD，以及主审查目前得出的结构性发现。
> 你的任务不是验证此设计——而是找出问题。
> 请从你的领域专长出发质疑这些设计选择。哪些地方有误、
> 规定不充分、可能引发问题，或者完全缺失？
> 请具体且严厉地指出问题。欢迎对主审查提出不同意见。”

**针对各类代理的附加说明：**

- **`game-designer`**：以此 GDD 的 B 节中所述的玩家幻想为审查基准。此设计是否真正实现了该幻想？玩家是否能感受到预期的体验？标出所有虽有利于实现、却削弱了既定感受的规则。

- **`systems-designer`**：对于 GDD 中的每个公式，代入边界值（合理输入的最小值和最大值）。报告是否有任何输出出现退化——负值、除以零、无穷大，或在极端情况下产生不合理的结果。

- **`qa-lead`**：审查每一项验收标准。标记任何无法独立测试的标准——诸如“感觉平衡”“正常工作”“表现良好”之类的表述不能算作 AC。对于任何未通过此项检查的标准，提出具体的改写建议。

### 步骤 3 — 高级负责人审查

所有专家都回复后，启动 `creative-director` 作为**高级审查者**：
- 提供：GDD、所有专家的发现，以及专家之间的任何分歧
- 询问：“综合这些发现。最重要的问题是什么？你是否同意专家的意见？你对这份设计的总体结论是什么？”
- creative-director 的综合意见将成为阶段 4 中的**最终结论**。

### 步骤 4 — 呈现分歧

如果专家彼此之间或与 creative-director 意见不一致，请勿默默选择其中一种观点。应在阶段 4 中明确呈现分歧，以便用户裁定。

使用来源标记每一项发现：`[game-designer]`、`[economy-designer]`、`[creative-director]` 等。

---

## 阶段 4：输出审查结果

```
## Design Review: [Document Title]
Specialists consulted: [list agents spawned]
Re-review: [Yes — prior verdict was X on YYYY-MM-DD / No — first review]

### Completeness: [X/8 sections present]
[List missing sections]

### Dependency Graph
[List each declared dependency and whether its GDD file exists on disk]
- ✓ enemy-definition-data.md — exists
- ✗ loot-system.md — NOT FOUND (file does not exist yet)

### Required Before Implementation
[Numbered list — blocking issues only. Each item tagged with source agent.]

### Recommended Revisions
[Numbered list — important but not blocking. Source-tagged.]

### Specialist Disagreements
[Any cases where agents disagreed with each other or with the main review.
Present both sides — do not silently resolve.]

### Nice-to-Have
[Minor improvements, low priority.]

### Senior Verdict [creative-director]
[Creative director's synthesis and overall assessment.]

### Scope Signal
Estimate implementation scope based on: dependency count, formula count,
systems touched, and whether new ADRs are required.
- **S** — single system, no formulas, no new ADRs, <3 dependencies
- **M** — moderate complexity, 1-2 formulas, 3-6 dependencies
- **L** — multi-system integration, 3+ formulas, may require new ADR
- **XL** — cross-cutting concern, 5+ dependencies, multiple new ADRs likely
Label clearly: "Rough scope signal: M (producer should verify before sprint planning)"

### Verdict: [APPROVED / NEEDS REVISION / MAJOR REVISION NEEDED]
```

此技能为只读——阶段 4 期间不会写入任何文件。

---

## 阶段 5：后续步骤

所有结束阶段的交互都使用 `AskUserQuestion`。绝不要使用纯文本。

**第一个小组件——下一步操作：**

如果结果为 APPROVED（首次审查，无需修订），则直接进入系统索引小组件、审查日志小组件，然后进入最终结束小组件。不要显示单独的“下一步操作”小组件——最终结束小组件已涵盖后续步骤。

如果是 NEEDS REVISION 或 MAJOR REVISION NEEDED，可选项：
- `[A] Revise the GDD now — address blocking items together`
- `[B] Stop here — revise in a separate session`
- `[C] Accept as-is and move on (only if all items are advisory)`

**如果用户选择 [A] — 立即修订：**

处理所有阻塞项；仅当无法仅根据 GDD 和现有文档解决问题时，才询问设计决策。在进行任何编辑之前，将所有设计决策问题集中到一次多标签页 `AskUserQuestion` 中——不要在修订过程中针对每个阻塞项逐一打断用户。

完成所有修订后，显示一张汇总表（阻塞项 → 已应用的修复），并使用 `AskUserQuestion` 显示一个**修订后的结束组件**：

- 提示："修订完成——已解决 [N] 个阻塞项。下一步做什么？"
- 注明当前上下文使用情况：如果上下文已使用约 50% 以上，添加："（建议：重新审查前执行 /clear——本会话已使用 X% 的上下文。完整的重新审查会运行 5 个代理，需要干净的上下文。）"
- 选项：
  - `[A] Re-review in a new session — run /design-review [doc-path] after /clear`
  - `[B] Accept revisions and mark Approved — update systems index, skip re-review`
  - `[C] Move to next system — /design-system [next-system] (#N in design order)`
  - `[D] Stop here`

绝不要以纯文本结束修订流程。始终使用此组件结束。

**第二个组件——跟踪记录（合并，用于 APPROVED 路径）：**

当结论为 APPROVED 时，使用一个设置了 `multiSelect: true` 的 `AskUserQuestion`，批量处理两项跟踪更新：
- 提示："结论：APPROVED。我现在可以更新跟踪记录。请选择希望我完成的项目："
- 选项：
  - `Update systems-index.md status to 'Approved' for [system]`
  - `Append approval entry to design/gdd/reviews/[doc-name]-review-log.md`

如果选择了审查日志选项，请追加与下方相同格式的内容。在显示最终结束组件之前，执行用户选择的两项操作。

当结论为 NEEDS REVISION 或 MAJOR REVISION NEEDED 时，和以前一样使用单独的组件：

使用第二个 `AskUserQuestion`：
- 提示："我可以更新 `design/gdd/systems-index.md`，将 [system] 标记为 [In Review / Approved] 吗？"
- 选项：`[A] Yes — update it` / `[B] No — leave it as-is`

使用第三个 `AskUserQuestion`：
- 提示："我可以将此审查摘要追加到 `design/gdd/reviews/[doc-name]-review-log.md` 吗？这将创建修订历史，以便未来重新审查时跟踪变更。"
- 选项：`[A] Yes — append to review log` / `[B] No — skip`

如果选择是，请按以下格式追加条目：
```
## Review — [YYYY-MM-DD] — Verdict: [APPROVED / NEEDS REVISION / MAJOR REVISION NEEDED]
Scope signal: [S/M/L/XL]
Specialists: [list]
Blocking items: [count] | Recommended: [count]
Summary: [2-3 sentence summary of key findings from creative-director verdict]
Prior verdict resolved: [Yes / No / First review]
```

---

**最终结束组件——始终在所有文件写入完成后显示：**

回答完 systems-index 和 review-log 组件后，检查项目状态并显示最后一个 `AskUserQuestion`：

在构建选项之前，请读取：
- `design/gdd/systems-index.md` — 查找所有 Status 为 In Review 或 NEEDS REVISION 的系统（刚刚审查的系统除外）
- 统计 `design/gdd/` 中的 `.md` 文件数量（不包括 game-concept.md、systems-index.md），以确定是否值得提供 `/review-all-gdds`（GDD 数量 ≥2）
- 按设计顺序查找下一个 Status 为 Not Started 的系统

动态构建选项列表——仅包含确实可作为下一步的选项：
- `[_] Run /design-review [other-gdd-path] — [system name] is still [In Review / NEEDS REVISION]`（如果另一个 GDD 需要审查，则包含此选项）
- `[_] Run /consistency-check — verify this GDD's values don't conflict with existing GDDs`（如果至少存在 1 个其他 GDD，则始终包含此选项）
- `[_] Run /review-all-gdds — holistic design-theory review across all designed systems`（如果至少存在 2 个 GDD，则包含此选项）
- `[_] Run /design-system [next-system] — next in design order`（始终包含此选项，并注明实际系统名称）
- `[_] Stop here`

仅为实际包含的选项依次分配字母 A、B、C……。将最能推进流程的选项标记为 `(recommended)`。

绝不要在文件写入后以纯文本结束该技能。始终以此小组件收尾。