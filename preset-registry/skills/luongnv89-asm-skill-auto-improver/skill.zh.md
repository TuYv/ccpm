---
name: skill-auto-improver
description: "Improve an external, legacy, or drifted SKILL.md to the skill-creator standard — hard validation gates plus an advisory predictability audit. Don't use for authoring from scratch (skill-creator output is already standard), bulk eval, or prose edits."
license: MIT
compatibility: "Claude Code; requires `asm` on PATH and Python 3 for skill-creator's quick_validate.py"
allowed-tools: Bash Read Write Edit Grep Glob
effort: high
metadata:
  version: 2.1.0
  author: luongnv89
---
# Skill 自动改进器

你将运行一个由评估驱动的循环，将现有的 SKILL.md **改造为符合当前 skill-creator 标准的版本**。它是用于修复未经过 skill-creator 处理的技能的工具——包括外部技能、旧版技能、手动编写的技能，或已发生偏移的技能。全新的 skill-creator 输出从设计上就是可发布的，通常不需要使用此工具。

目标需要通过 **两个硬性门槛**，然后再接受一次**建议性**审计：

1. **门槛 1——skill-creator 标准（必须通过的最低标准）**——`quick_validate` 检查无误，Frontmatter 审计通过，并且在大小上限以内。
2. **门槛 2——asm-eval 最低标准（补充项）**——`overallScore > 85`，且每个类别均 `>= 8`。
3. **建议项——可预测性审计（阶段 2b）**——依据 skill-creator 的评估标准进行基于判断的检查，单独报告，**绝不阻塞流程**。

一个得分为 92 但未通过 `quick_validate.py` 的技能还不能算完成；一个通过了该检查但得分为 70 的技能也同样不能算完成。**两个门槛都必须通过，否则循环将报告阻塞项**——仅存在未解决的可预测性问题不会导致失败。

## 两种模式

在阶段 0 之前选择一种模式——两者不共用工作流程。

- **模式 1——改造（默认）。** 通过下面的阶段 0–7 循环，使目标达到 skill-creator 标准。所有“改进”“修复”“提升等级”或“达到标准”的请求都属于模式 1。
- **模式 2——委派转换（选择加入）。** 将目标的步骤重构为**按步骤进行上下文委派**：每个繁重步骤都要说明其工作者所需的自身 `references/` 树中的内容片段，并将其作为该工作者的 `Input` 传递。该模式在阶段 6 循环之外运行，针对已经通过门槛 1 的目标，并且只能在用户确认后执行。阶段 2b 中关于可委派性的发现会将流程引导至此处，但不会自行启动转换。操作步骤见：`references/delegation-conversion.md`。

## 依赖项预检（强制）

此技能会调用 `skill-creator`：运行该技能的 `quick_validate.py`（必需——这是门槛 1 的验证器），并读取其 `predictability-rubric.md`（**宽松失败**——本地副本可能早于该评估标准，而缺少该文件只会使阶段 2b 降级为警告）。必须在下面的仓库同步之前解决这两个依赖项，因为仓库同步是第一个会进行任何更改的步骤：

```bash
date +%s >&2                      # anchors the Run stats block below — read it off stderr
QV="$HOME/.claude/skills/skill-creator/scripts/quick_validate.py"
test -f "$QV" || {
  echo "Missing required skill: skill-creator" >&2
  echo "Install it:      asm install skill-creator -p claude --yes" >&2
  echo "No asm yet:      npm install -g agent-skill-manager" >&2
  echo "Verify:          asm list -p claude --json | grep 'skill-creator'" >&2
  exit 1
}
RUBRIC="$HOME/.claude/skills/skill-creator/references/predictability-rubric.md"
test -f "$RUBRIC" || echo "⚠ predictability rubric missing — Phase 2b degraded (gates unaffected)"
```

`-p claude` 并非装饰：`asm install` 在非交互模式下拒绝猜测提供方，`--yes` 不会涵盖该选择，而在验证中指定相同的提供方，可以避免在其他工具下安装成功却因 `$QV` 仍然缺失而误报成功。

如果检查未通过，请在第一次变更之前停止并打印这些命令 — 绝不要继续执行不完整的流程。这是此 skill 为每个目标执行审计的门禁（`references/skill-creator-checklist.md` → _依赖预检_）。

## 编辑前同步仓库（必需）

此 skill 会修改 git 仓库中的文件。在进行任何编辑之前，先将分支与远程仓库同步：

```bash
branch="$(git rev-parse --abbrev-ref HEAD)"
git fetch origin
git pull --rebase origin "$branch"
```

如果工作树不干净，请执行 `git stash`，同步，然后执行 `git stash pop`。如果缺少 `origin`，或拉取时发生冲突，**请停止并询问用户** — 绝不要跳过或强制执行同步。

## 使用时机

针对**已有、外部、遗留、手动编写或已发生偏移**的 skill 使用此工具：

- 用户要求“改进”、“提升级别”、“修复”、“润色”或“使其达到标准”某个已有 skill
- 某个 skill 并非在 skill-creator 外部编写 — 由人工编写、导入或继承 — 且必须达到当前标准
- 某个 skill 已经**发生偏移**：早于当前标准，或编辑导致其未通过 `quick_validate.py`，或低于 85/8 门槛
- 你正在为 `asm publish` 或目录准备此类 skill

**不要**将其用于 skill-creator 的全新输出（使用 `/skill-creator` 编写），也不要仅用于生成报告（直接运行 `asm eval` 加 `quick_validate.py`）。默认存在 SKILL.md。

## 前置条件

在接触任何文件之前，验证以下所有条件。如果任何一项失败，请停止并告知用户。

- `asm` 位于 PATH 中（`command -v asm`）
- Python 3 可用 — `quick_validate.py` 本身由_依赖预检（必需）_解析，这是唯一处理检查未通过的地方
- 目标 skill 路径包含 `SKILL.md`
- 工作树中没有无关的未提交编辑 — 不干净的文件会混入差异
- 你对 skill 目录具有写入权限

## 输入

以下输入之一：本地 skill 路径（`skills/foo`、`/abs/path/to/skill`）、`SKILL.md` 文件路径（按其父目录处理），或 GitHub 简写（`github:owner/repo[:path/to/skill]`）。

对于 GitHub 输入，请先让用户在本地克隆。此 skill 会编辑**本地**内容；远程编辑不在 v1 的范围内。

## 各项门禁

**硬门禁**（门禁 1、门禁 2）是机械式的，通过或失败 — 它们单独决定 PASS 还是 BLOCKER。**可预测性检查结果**（阶段 2b）基于判断并属于建议性内容：即使两个门禁均为绿色但仍有未解决的检查结果，也依然是 PASS。绿色门禁并不能保证 skill 每次运行都会驱动相同的_流程_ — 这正是阶段 2b 要捕获的问题，而 `references/predictability-audit.md` 包含其检查清单和问题分类。

### 门禁 1 — skill-creator 标准（必须达到的最低要求）

满足**以下全部条件**时，skill 才能通过：

- `python "$QV" "$SKILL_PATH"` 以退出码 0 结束
- 通过 Frontmatter 审计 — 检查清单见 `references/frontmatter-audit.md`
- 正文少于 500 行且少于 3000 个单词
- description 包含负向触发条款，列出不应触发此 skill 的相邻领域
- `metadata.version` 符合 `MAJOR.MINOR.PATCH` 格式；存在 `metadata.author`
- 如果存在 `docs/README.md`，则其开头应为 AI-skip HTML 注释
- `scripts/` 下的任何随附脚本都必须在退出前向 stderr 打印描述性错误
- **如果目标 skill 会调用其他 skill**，则必须包含依赖预检，列出每个依赖项、其安装命令、用于安装该安装器本身的命令，以及验证步骤（`references/skill-creator-checklist.md` → _依赖预检_）。不调用任何其他 skill 的目标无需此部分 — 绝不要添加空的依赖预检部分

此门槛是**不可协商的**：`asm publish` 和目录都依赖它。

### Gate 2 — asm-eval 85/8 质量下限（补充）

```
overallScore > 85   AND   min(categories[*].score) >= 8
```

这比仅要求总体分数更严格——即使总体分数为 86，但 `testability` 得分为 5，仍然会失败——因此一个强项不能掩盖一个弱项。

## 工作流

按顺序执行以下阶段；绝不要跳过或调换顺序。**阶段 4 是贯穿阶段 3 始终运行的连续侧边栏，而不是一个独立步骤**，因此它没有单独的步骤完成报告。

### 阶段 0 — 针对两个门槛记录基线

保存初始状态，以便对前后差异进行审计：

```bash
mkdir -p .asm-improver
asm eval "$SKILL_PATH" --json > .asm-improver/baseline.json
python "$QV" "$SKILL_PATH" > .asm-improver/baseline-quickvalidate.txt 2>&1 || true
```

然后运行 `references/frontmatter-audit.md` 中的 **Frontmatter Audit**，将发现结果保存到 `.asm-improver/baseline-frontmatter-audit.md`。在 git 仓库中，建议将 `.asm-improver/` 添加到 `.gitignore`。

读取 JSON，并记录 `overallScore`、`grade`、全部 7 个 `categories[].score` 以及 `topSuggestions`。每个类别的 `findings` 都包含其得分背后的测量数据，其中包括正文词数。使用这些数据；绝不要手动估算。

如果基线同时通过**两个**门槛，则停止：打印一行摘要，然后跳转到最终报告。在模式 1 中，delegability 发现不是继续执行的理由——改为提供模式 2。

### 阶段 1 — 应用确定性修复，然后规范化 frontmatter

运行评估器的自动修复功能，获取无需额外操作的改进：

```bash
asm eval "$SKILL_PATH" --fix --dry-run   # 预览差异
asm eval "$SKILL_PATH" --fix              # 写入修改，创建 SKILL.md.bak
```

它会处理行尾空格、CRLF 规范化以及缺少的 `effort`。如果 dry-run 报告 **"No fixes needed"**，则视为本阶段已完成——不要继续应用 `--fix`。

#### Frontmatter 规范化（`--fix` 之后必须执行）

当 `--fix` 确实写入修改时，它会添加顶层 `author:`（取自 `git config user.name`）和/或 `version: 0.1.0`，而这两者都会被 `quick_validate.py` 判定为意外键。应用 `references/frontmatter-audit.md` → _Normalizing `asm eval --fix` output_。然后重新运行**两项**检查：

```bash
asm eval "$SKILL_PATH" --json > .asm-improver/iter-1.json
python "$QV" "$SKILL_PATH"
```

许多 skill 无需修改正文，就能在此处提升 5–15 分；`quick_validate.py` 通常也会从失败变为通过。

### 阶段 2 — 首先修复 Gate 1 失败项

`quick_validate.py` 和 Frontmatter Audit 优先处理，因为它们会阻止发布。`references/skill-creator-checklist.md` 为每项失败检查提供了修复方法——frontmatter、description、正文大小、`docs/README.md` 的 AI 跳过提示、脚本 stderr、版本以及 preflight。按从上到下的顺序处理。

有一项没有机械验证器支持，因此要有意识地查找：**Skill 在没有 preflight gate 的情况下调用另一个 skill**，或者从未说明安装方式。通过扫描 `/skill-name` 调用、读取 `~/.claude/skills/` 或 `~/.agents/skills/` 下的内容，以及交给具名 skill 执行的阶段来检测；按照清单中的 _Dependency preflight_ 部分进行修复。

在每次 Gate 1 编辑后重新运行 `python "$QV" "$SKILL_PATH"`。在 Gate 1 通过前，不得进入 Phase 2b。

### Phase 2b — 根据可预测性评估标准进行审计（建议性）

Gate 1 通过后、进入 Phase 3 **之前**，根据 skill-creator 的评估标准进行审计，以便审计结果指导你的类别编辑。此审计仅供参考——永远不会成为门槛，也不会阻塞流程。

1. 确认 `$RUBRIC` 已解析（_依赖项预检（必需）_）。如果缺失，则**跳过并以宽松方式失败**：记录 `⚠ predictability audit skipped (rubric unavailable)`，然后进入 Phase 3。
2. 遍历 `references/predictability-audit.md`，将其中 7 个项目分别标记为 `pass` 或 `advisory`，并附上具体说明，然后将遍历结果保存到 `.asm-improver/predictability-audit.md`。第 #4 项的**可委派性子检查**要指出哪个步骤不可委派以及原因；其补救方式是 Mode 2，绝不能进行 Mode 1 编辑。

只有在修复是_有针对性的_情况下，才根据审计结果采取行动——一个修复通常也会提升某个 asm-eval 类别。绝不要为了满足某一项而盲目扩充；同一份参考文档中也规定了这一点。

### Phase 3 — 修复最低的 asm-eval 类别

按升序排列这 7 个类别，优先处理最低的类别。当所有类别都达到 `>= 8` 时停止——不要为已经通过的类别继续追分。

对于每个低于 8 的类别：

1. 阅读该类别对应的 `references/category-playbook.md`，了解其修复模式
2. 使用 `Edit` 应用修复；如果需要重构整个章节，则使用 `Write`
3. 重新运行 `asm eval "$SKILL_PATH" --json` 和 `python "$QV" "$SKILL_PATH"`，检查**每个**类别的变化，而不只是你编辑的类别

**绝不要盲目批量编辑多个类别。** 修复之间会相互影响：扩充正文以提升 `testability` 可能会损害 `context-efficiency`，或突破 500 行上限。一次只处理一个类别；如果某项修复导致任一门槛退步，则保留有帮助的部分并还原退步的部分。

### Phase 4 — 留意门槛之间的权衡（侧栏——适用于 Phase 3 期间）

这是一个持续适用的侧栏，而非顺序执行的阶段：各门槛在正文长度方面的要求相互拉扯，因此提升一个类别的修复可能会降低另一个类别的分数，或突破 Gate 1 上限。每次调用都会完整加载 SKILL.md，因此每个内联段落都会永久占用代理的上下文窗口——`context-efficiency` 分数衡量的正是这项预算。在每次编辑前先阅读一次 `references/cross-gate-tradeoffs.md`，然后默认**链接到外部，而不是内联内容**。

### Phase 5 — 增加目标 skill 的 `metadata.version`

这一步作为每次 Phase 6 迭代中的**最后一个动作**执行，而不是在 Phase 6 结束后一次性执行——版本号只是叙述用途，按顺序递增。每次迭代**恰好增加一次**，绝不要每次编辑都增加，否则版本号会在有意义的变更之前不断增长。记录每次增加版本的操作，以便报告显示基线版本 → 最终版本。

- **补丁版本**（`x.y.Z`）：拼写错误修复、仅 frontmatter 规范化、措辞调整
- **次版本**（`x.Y.0`）：新增章节、新增引用、扩展触发条件、添加子代理
- **主版本**（`X.0.0`）：重构工作流、破坏性输出格式变更

没有 `metadata.version` 的目标，从 `1.0.0` 开始添加版本号。

### Phase 6 — 设置上限并循环

每次迭代后重新运行**两项**检查。当满足以下任一条件时，循环停止：

| 停止条件                                                     | 结果                     |
| ------------------------------------------------------------ | ------------------------ |
| Gate 1 通过且 `overallScore > 85` 且 `min(scores) >= 8`      | PASS — 继续生成报告      |
| 完成 8 次评估迭代                                             | BLOCKER — 编写报告       |
| 连续 3 次迭代在两个 gate 上均无进展                           | BLOCKER — 编写报告       |
| 连续 2 次迭代在任一 gate 上出现回归                           | BLOCKER — 回退并编写报告 |

**迭代中途的 Gate 1 回归不算回归。** 当 Phase 3 的编辑导致 Gate 1 检查失败（见 Phase 4）时，回到 Phase 2，在同一轮迭代内修复，然后重新运行两项检查。只有在此后两个 gate 仍然变差时，才将该迭代计为一次回归——否则普通的反复变更会触发两次回归停止条件。

将每次迭代保存到 `.asm-improver/iter-N.json`，并在 `.asm-improver/iter-N-gates.txt` 中保存一行 gate 摘要，以便报告能够对它们进行差异比较。

### Phase 7 — 编写最终报告

按照 `references/report-template.md` 的布局编写 `.asm-improver/report.md`，其中包含**三个视觉上清晰区分的部分**：

1. **Gate 状态** — 两个硬 gate 的基线与最终状态：`quick_validate.py`、Frontmatter 审计、`overallScore`、`grade`、各类别的前后对比。这决定 PASS 还是 BLOCKER。
2. **可预测性发现**（建议项）— 列出 Phase 2b 中的每个条目，为每个未解决项附上一行说明；如果采用 fail-soft 方式跳过，也要说明。绝不能将其视为 gate 失败。
3. **未解决的阻塞项** — 仅列出 BLOCKER，每项都要指明失败的**硬 gate**、具体检查以及无法解决的内容。绝不能将可预测性发现提升到此处。

添加 skill 路径、`metadata.version` 的基线 → 最终值、发生变更的文件、迭代次数（8 次中的 N 次）以及关键修复。绝不要将 blocker 假装成 pass。结束报告——以及打印的摘要——时，附上下面的 **Run stats** 块。

## Run stats（必需）

每次运行都必须以一个 run-stats 块结束摘要——这是 Phase 7 报告之后最后打印的内容。它报告本次运行的**成本**，且绝不重复报告中已经包含的指标。

`elapsed` 是 `now - run_started_epoch`，其中 epoch 是 _Dependency Preflight（必需）_ 中的 `date +%s >&2`——从该代码块的 stderr 中读取，而不是使用一个不一定能保留下来的 shell 变量。如果在该代码块运行之前就停止，则没有可用的锚点，因此 `elapsed` 打印为 `n/a`。

```
  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
  Run stats   elapsed 4m 12s · tokens 128,400 · cost $0.42
              agents 0 · skills 1 · tool calls 63
```

字段是固定的，顺序也固定——绝不能重新排序、重命名或添加字段：`elapsed`、`tokens`、`cost`、`agents`、`skills`、`tool calls`。每个字段的格式请参阅：`references/run-stats.md`。

- **当宿主未报告数值时，完全省略 `tokens` 和 `cost`**——不得留下多余的 `·`，也不得使用占位符。绝不要估算这些数值，也绝不要根据宿主的 transcripts 或日志重新构造。
- **始终打印 `elapsed`、`agents`、`skills` 和 `tool calls`。** 无法确定的值打印字面量 `n/a`；`0` 是一个已确定的值，在确实为 0 时应正确打印。
- 缺少某个可选数值时，绝不能抑制该代码块的其余内容。
- 在**每种终止结果**下都打印该代码块——包括循环完成、BLOCKER、Phase 0 提前退出、先决条件失败以及运行中止。只有完全没有任何输出的运行不打印该代码块。

## 步骤完成报告（必需）

每个阶段结束后，输出一个紧凑的状态块，以便快速查看通过/失败情况：

```
◆ Phase N — [phase name]
··································································
  Frontmatter valid:   √ pass
  quick_validate:      √ pass
  asm overall:         86 → 91
  Min category:        7 → 8
  Target version:      1.2.0 → 1.3.0
  Result:              PASS | FAIL | PARTIAL
```

在 Phase 0、1、2、2b、3、5、6 和 7 之后各输出一个。Phase 2b 的状态块报告发现数量，并标注“advisory”或“skipped fail-soft”——该阶段从不作为循环的门槛。

## 验收标准

决定结果的标准。完整的运行检查清单——包括每项产物和流程义务——位于 `references/acceptance-criteria.md`；在编写报告之前逐项检查。

- 在进行任何编辑之前，将基线保存到 `.asm-improver/`，并在每次迭代中针对**两个**门槛重新评估并保存结果
- 在进行任何 Gate 2 工作之前，先处理每项 Gate 1 检查；以下每个低于 8 分的类别至少处理一次
- Gate 1 清理完成后运行 Phase 2b，或记录其 fail-soft 跳过情况——发现项永远不会阻塞循环
- 每次迭代产生编辑后，将 `metadata.version` 递增一次；循环在 Phase 6 的 4 个条件之一满足时停止
- 无论以何种方式退出，`.asm-improver/report.md` 都必须存在，并且摘要以 Run stats 块结尾
- PASS 条件：`python "$QV" "$SKILL_PATH"` 退出码为 0，且 `overallScore > 85`，且 `min(categories[*].score) >= 8`
- BLOCKER 条件：报告列出每项失败的 Gate 1 检查，以及所有仍低于 8 分的类别，并为每项提供一行原因

### 预期输出

完整的 PASS 和 BLOCKER 布局请参见 `references/report-template.md`。对于 BLOCKER，添加一个 `## Unresolved blockers` 部分，列出每项失败的**硬门槛**检查，并为每项提供一行原因。

## 边缘情况

上述阶段未涵盖两项规则。其他所有边缘情况——没有 frontmatter、被拒绝的 `--fix` 键、超过 250 个字符的描述、内容固定测试、正文过长、8 次迭代上限、GitHub 简写——都记录在 `references/edge-cases.md` 中，在相关情况出现时阅读。

- **破坏性操作**：绝不要对 skill 目录执行 `rm -rf`。`asm eval --fix` 会创建 `SKILL.md.bak` — 在用户明确清理之前保留它。
- **包含大量不可委派步骤但通过门槛的 skill**：这是 **Mode 2** 候选项。提供转换方案；绝不要在 Mode 1 下编辑它。

## 参考资料

- `references/skill-creator-checklist.md` — Gate 1 改造操作手册
- `references/frontmatter-audit.md` — 审计检查清单和 `asm eval --fix` 规范化迁移
- `references/category-playbook.md` — 针对 Gate 2 的各类别修复模式
- `references/predictability-audit.md` — Phase 2b advisory 检查清单
- `references/cross-gate-tradeoffs.md` — Phase 4 侧栏：正文长度和链接导出规则
- `references/delegation-conversion.md` — Mode 2 流程
- `references/report-template.md` — PASS、BLOCKER 和 Mode 2 报告布局
- `references/acceptance-criteria.md` — 完整运行检查清单
- `references/run-stats.md` — run-stats 字段定义
- `references/edge-cases.md` — 完整边缘情况列表
- 在 `~/.claude/skills/skill-creator/` 下：`scripts/quick_validate.py`（Gate 1 验证器），以及 `references/frontmatter-rules.md`、`predictability-rubric.md` 和 `dependency-preflight.md` — 本地参考资料自包含复述的上游来源
- `asm eval --help`，以及 ASM 仓库中的 `src/evaluator-core.ts` — 每个 Gate 2 类别的评分方式