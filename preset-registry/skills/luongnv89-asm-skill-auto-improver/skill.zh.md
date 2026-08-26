---
name: skill-auto-improver
description: "Improve an external, legacy, or drifted SKILL.md to the skill-creator standard — hard validation gates plus an advisory predictability audit. Don't use for authoring from scratch (skill-creator output is already standard), bulk eval, or prose edits."
license: MIT
compatibility: "Claude Code; requires `asm` on PATH and Python 3 for skill-creator's quick_validate.py"
allowed-tools: Bash Read Write Edit Grep Glob
effort: high
metadata:
  version: 1.4.0
  author: luongnv89
---
# Skill 自动改进器

你运行的是一个由评估驱动的循环，用于将**现有的 SKILL.md 改造为符合当前 skill-creator 标准的版本**。这是针对未经过 skill-creator 处理的技能的修复工具，包括外部技能、旧版技能、手动编写的技能或已发生偏移的技能。全新的 skill-creator 输出按设计即可直接发布（参见 skill-creator 的 `predictability-rubric.md` → _Publish-ready — no auto-improver dependency_），通常**不**需要此技能。

目标必须通过**两个硬性门槛**，然后再接受一次**建议性**审计：

1. **门槛 1 — skill-creator 标准（必须达到的底线）** — `quick_validate` 无错误，Frontmatter Audit 通过，且不超过 500 行（详情如下）。
2. **门槛 2 — asm-eval 底线（补充性）** — `overallScore > 85`，并且每个类别均 `>= 8`。
3. **建议性 — 可预测性审计（Phase 2b，不是门槛）** — 根据 skill-creator 的 rubric 进行基于判断的检查，单独报告结果，**绝不**阻止流程。

一个得分 92 但未通过 `quick_validate.py` 的技能并未完成；一个通过 `quick_validate.py` 但得分为 70 的技能也未完成。**两个门槛都必须通过，否则循环将报告阻塞项**——仅存在待处理的可预测性问题绝不会导致失败。

## 依赖预检（必须执行）

此技能会调用 `skill-creator`：运行其 `quick_validate.py`（必需——门槛 1 验证器），并读取其 `predictability-rubric.md`（宽松失败——Phase 2b）。在下面的仓库同步之前（这是第一个会产生任何变更的步骤），先解析这两个文件并复用。该 rubric 采用**宽松失败**策略——本地安装的 skill-creator 可能早于仓库版本，因而未随附该文件；文件缺失只会将 Phase 2b 降级为警告，绝不会中止运行：

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

`-p claude` 是必需的，不是装饰：在非交互式 shell 中，`asm install` 会拒绝猜测 provider，而 `--yes` 不会涵盖这一选择；因此，省略它的门槛会向用户提供一条会报错而不是执行安装的命令。验证使用了与检测路径相同的 provider 名称，因此，如果安装落在其他工具下，就不会在 `$QV` 仍然缺失的情况下错误地报告成功。

如果未找到文件，请在第一次变更之前停止，并输出上面的三个命令——不要继续执行不完整的运行。这与此技能为每个目标执行的门槛相同（`references/skill-creator-checklist.md` → _Dependency preflight_）。

## 编辑前的仓库同步（必须执行）

此技能会修改 git 仓库中的文件。在进行任何编辑之前，先将本地分支与远程同步：

```bash
branch="$(git rev-parse --abbrev-ref HEAD)"
git fetch origin
git pull --rebase origin "$branch"
```

如果工作树不干净，请执行 `git stash`，同步后再执行 `git stash pop`。如果缺少 `origin`，或 `git pull` 发生冲突，**请停止并询问用户**后再继续——不要跳过或强制执行同步。

## 使用时机

对于**已有的、外部的、遗留的、手动编写的或已发生偏移的** skill，请使用此技能：

- 用户要求“改进”、“提升”、“修复”、“润色”或“使其达到标准”的现有 skill
- skill 并非由 skill-creator 编写（手写、导入或继承而来），且必须达到当前标准
- skill 已发生**偏移**——早于当前标准，或编辑后未通过 `quick_validate.py`，或低于 85/8 下限
- 你正在为 `asm publish` 或目录准备此类 skill

**不适用于**对新生成的 skill-creator 输出进行例行清理（其生成结果本身即可用于发布——请使用 `/skill-creator` 编写）。假定存在 SKILL.md。仅需生成报告时，直接运行 `asm eval` 和 `quick_validate.py`，不要使用此技能。

## 前置条件

在接触任何文件之前，验证以下所有条件。如果任何一项失败，请停止并告知用户。

- `asm` 位于 PATH 中（`command -v asm` 或 `which asm`）
- Python 3 可用；skill-creator 的 `quick_validate.py` 由上方的 _Dependency Preflight (mandatory)_ 解析，这是唯一处理缺失情况的位置
- 目标 skill 路径包含 `SKILL.md` 文件
- 工作树没有无关的未提交编辑（脏文件会混入差异）
- 你对 skill 目录具有写入权限

## 输入

用户提供以下任一项：

- 本地 skill 路径：`skills/foo` 或 `/abs/path/to/skill`
- 直接的 `SKILL.md` 文件路径（视为其父目录）
- GitHub 简写：`github:owner/repo` 或 `github:owner/repo:path/to/skill`

对于 GitHub 输入，请先询问用户是否要在本地克隆，或是否应向该仓库提交 PR。此技能的默认路径是**本地编辑**——v1 不支持远程编辑。

## 各道关卡

将两类决策分开：**硬性关卡**（Gate 1、Gate 2）是机械化的通过/失败检查——只有它们决定 PASS 还是 BLOCKER。**可预测性检查结果**（Phase 2b）基于判断，仅提供建议——即使两道关卡均通过但仍有未解决的检查结果，也仍然是 PASS。

### Gate 1 — skill-creator 标准（必须达到的下限）

skill 满足以下**全部**条件时，即通过此关卡：

- `python "$QV" "$SKILL_PATH"` 退出码为 0（没有意外的键名、名称采用 kebab-case 且不超过 64 个字符、description 为单行且不超过 1024 个字符等）
- Frontmatter Audit（完整检查清单见 `references/frontmatter-audit.md`）通过
- `SKILL.md` 正文少于 500 行（若不满足，则拆分到 `references/`）
- description 包含说明相邻领域不应触发此 skill 的负向触发子句（缺少时 `quick_validate.py` 会发出警告）
- `metadata.version` 遵循 `MAJOR.MINOR.PATCH`；存在 `metadata.author`
- 如果存在 `docs/README.md`，则其顶部包含 AI-skip HTML 注释
- `scripts/` 下的任何捆绑脚本在退出前都会将描述性错误打印到 stderr
- **如果目标 skill 会调用另一个 skill**，则必须包含依赖预检，列出每个依赖项、其安装命令、用于安装该安装器本身的命令，以及验证步骤（`references/skill-creator-checklist.md` → _Dependency preflight_）。不调用其他 skill 的 skill 无需此部分——缺少该部分不构成检查结果，也绝不能添加空的部分

此门槛是**不可协商的**——`asm publish` 和 catalog 都依赖于它。

### 门槛 2 — asm-eval 85/8 质量下限（补充）

```
overallScore > 85   AND   min(categories[*].score) >= 8
```

比仅要求 overall 更严格——即使 overall 为 86，但 `testability` 得分为 5，仍然会失败。它强制要求质量均衡，避免某个强项掩盖弱项。

### 建议项 — 可预测性审计（不是门槛）

两个门槛都通过，并不保证该 skill 每次运行都会驱动相同的_流程_。Phase 2b 审计会捕捉这一点——检查清单和发现类别请参阅 `references/predictability-audit.md`。

## 工作流

按顺序执行以下阶段。不要跳过阶段，也不要更改顺序。**Phase 4 是贯穿 Phase 3 全程运行的持续性侧边流程，而不是一个独立步骤**，因此它不会出现在各阶段的 Step Completion Reports 中。

### Phase 0 — 针对两个门槛捕获基线

保存起始状态，以便对前后差异进行审计：

```bash
mkdir -p .asm-improver
asm eval "$SKILL_PATH" --json > .asm-improver/baseline.json
python "$QV" "$SKILL_PATH" > .asm-improver/baseline-quickvalidate.txt 2>&1 || true
```

然后执行 `references/frontmatter-audit.md` 中描述的 **Frontmatter Audit**，并将发现保存到 `.asm-improver/baseline-frontmatter-audit.md`。

如果目标 skill 位于 git 仓库中，建议将 `.asm-improver/` 添加到 `.gitignore`，使迭代产物不会进入版本控制。

读取 JSON 并记录：

- `overallScore`、`grade`
- 每个 `categories[].score`（7 个类别，每个满分为 10 分）
- `topSuggestions`（评估器自身给出的优先事项）

如果基线已经**同时通过**两个门槛，立即停止——打印一行摘要并跳转到最终报告。不要“改进”一个已经通过的 skill。

### Phase 1 — 应用确定性修复，然后规范化 frontmatter

运行评估器的自动修复程序，以获取无需人工处理的改进：

```bash
asm eval "$SKILL_PATH" --fix --dry-run   # 预览差异
asm eval "$SKILL_PATH" --fix              # 写入修改，创建 SKILL.md.bak
```

此操作会处理行尾空格、CRLF 规范化、缺少 `effort` 以及其他机械性问题。**但是，当缺少 authorship 或 version 时，`asm eval --fix` 会写入顶层的 `author:`（取自 `git config user.name`）和/或顶层的 `version: 0.1.0`——这两项都会被 `quick_validate.py` 判定为意外键。**因此必须立即执行下面的规范化步骤。

#### Frontmatter 规范化（`--fix` 后必须执行）

阅读 `references/frontmatter-audit.md`——其中的“Normalizing `asm eval --fix` output”部分——了解确切的迁移方式。简而言之：

- 将顶层 `author: <name>` → `metadata.author: <name>`（保留其值）。当前修复程序会写入 `author:`；较旧的 skill 可能携带顶层的 `creator:`，处理方式相同，将其迁移到 `metadata.author:`。
- 将顶层 `version: <semver>` → `metadata.version: <semver>`（保留其值）
- 删除所有不在允许集合（`name`、`description`、`license`、`allowed-tools`、`metadata`、`compatibility`、`effort`）中的其他顶层键——例如旧版的 `tags:`。删除前，先向用户提示非简单删除的内容。
- 根据 YAML 安全规则，为任何包含 `:`、`#`、`-`、`<`、`>`、`|`、`{`、`}`、`[`、`]`、`,`、`&`、`*`、`?`、`=`、`!`、`%`、`@` 或 `` ` `` 的字符串值加引号。

标准化后，重新运行**两项**检查：

```bash
asm eval "$SKILL_PATH" --json > .asm-improver/iter-1.json
python "$QV" "$SKILL_PATH"
```

许多 skill 在此处无需修改正文，`asm eval` 的得分就会提升 5–15 分，而 `quick_validate.py` 通常也会从失败变为通过。

### 阶段 2——先修复 Gate 1 失败项

`quick_validate.py` 和 Frontmatter Audit 的发现应优先处理，因为它们会阻止发布。阅读 `references/skill-creator-checklist.md`，了解完整的改造流程。常见修复包括：

- Description 缺少否定触发条件 → 追加 "Don't use for X, Y, Z."，列出 2–3 个相邻领域
- Description 超过 250 个字符 → 删除保守措辞，合并同义词（1024 是硬上限，250 是运行时预算目标）
- 正文超过 500 行 → 将密集章节拆分到 `references/<topic>.md`，并将内联内容替换为一行指针
- `docs/README.md` 缺少 AI 跳过提示 → 在开头添加 `references/skill-creator-checklist.md` 中的 HTML 注释
- 随附脚本静默退出 → 在每个 `exit 1` / `sys.exit(1)` 前添加 `echo "Error: ..." >&2` 行
- skill 在没有预检门禁的情况下调用另一个 skill，或预检门禁从未说明安装方式 → 报告该发现，并添加 `references/skill-creator-checklist.md` → _Dependency preflight_ 中的门禁。通过扫描目标中对 `/skill-name` 的调用、对 `~/.claude/skills/` 或 `~/.agents/skills/` 下内容的读取，以及交给命名 skill 执行的阶段来检测

每次 Gate 1 修改后，重新运行 `python "$QV" "$SKILL_PATH"`。在 Gate 1 完全通过之前，不要进入阶段 2b。

### 阶段 2b——根据可预测性评分标准进行审计（建议性）

Gate 1 通过后，在阶段 3 **之前**根据 skill-creator 的评分标准进行审计，以便审计结果指导你的分类修改。该审计仅供建议——绝不会作为门禁，也不会阻塞流程。

1. 确认 `$RUBRIC` 已解析（_Dependency Preflight (mandatory)_）。如果缺失，则**跳过并软失败**——记录 `⚠ predictability audit skipped (rubric unavailable)`，然后进入阶段 3。
2. 按照 `references/predictability-audit.md` 逐项检查——将 7 项分别记录为 `pass` / `advisory`，并附上具体说明，保存到 `.asm-improver/predictability-audit.md`。

仅在发现具有_针对性_时采取行动（可预测性修复通常也会提升某个 asm-eval 分类）；不要为了满足单个项目而盲目膨胀。`references/predictability-audit.md` 中包含发现处理的详细说明以及避免膨胀的规则。

### 阶段 3——修复 asm-eval 得分最低的分类

按得分升序排列 7 个分类。先处理得分最低的分类。当所有分类都达到 `>= 8` 时停止。

对于每个低于 8 分的分类：

1. 阅读 `references/category-playbook.md`，查找该分类的修复模式
2. 使用 `Edit`（进行小范围、有针对性的修改）或 `Write`（需要重构整个章节时）应用这些模式
3. 重新运行 `asm eval "$SKILL_PATH" --json` 和 `python "$QV" "$SKILL_PATH"`，并检查分数变化

**不要盲目批量修改多个分类。** 修复可能相互影响——扩充正文以提升 `testability` 可能会损害 `context-efficiency`，或导致正文超过 500 行（从而无法通过 Gate 1）。一次只处理一个分类，每次修改后重新评估；保留有帮助的修改，回退导致任一门禁退化的修改。

### 阶段 4 — 留意跨门槛权衡（侧栏 — 适用于阶段 3）

这是一个持续适用的侧栏，而不是按顺序执行的阶段：两个门槛在正文长度上相互拉扯，因此，提升某个 asm-eval 类别的修复可能会拉低另一个类别的得分，或突破 500 行上限。在阶段 3 之前读取一次 `references/cross-gate-tradeoffs.md`，并在每次编辑时默认**链接到外部内容，而不是内联展开**。

### 阶段 5 — 提升目标 skill 的 `metadata.version`

此阶段**在阶段 6 循环的每次迭代中作为最后一个操作执行**，而不是在阶段 6 结束后作为单独的一次性步骤执行。编号按叙事流程排列；实际执行按每次迭代进行。

根据 skill-creator 的版本管理规则，每次编辑 SKILL.md 都必须在保存前提升 `metadata.version`：

- **Patch** (`x.y.Z`)：拼写错误修复、仅 frontmatter 规范化、细微措辞调整
- **Minor** (`x.Y.0`)：新增章节、新增引用、扩展触发条件、添加子代理
- **Major** (`X.0.0`)：重构工作流、破坏性输出格式变更

如果目标 SKILL.md 没有 `metadata.version`，则添加一个从 `1.0.0` 开始的版本号。每次循环迭代只提升**一次**，而不是在一次迭代中的每次编辑都提升——否则版本号会超前于有意义的变更。

在循环日志中记录版本提升，以便最终报告能够展示基线版本 → 最终版本。

### 阶段 6 — 限制次数的循环

每次迭代后重新运行**两项**检查。当以下任一条件满足时，循环停止：

| 停止条件                                               | 结果                  |
| ------------------------------------------------------------ | ------------------------ |
| Gate 1 通过 **且** `overallScore > 85` **且** `min(scores) >= 8` | PASS — 继续生成报告 |
| 已完成 8 次评估迭代                                  | BLOCKER — 撰写报告   |
| 连续 3 次迭代在两个门槛上都没有变化     | BLOCKER — 撰写报告   |
| 连续 2 次迭代在任一门槛上出现回归      | BLOCKER — 回退并报告 |

**迭代中途的 Gate 1 回归** — 阶段 3 的编辑可能会使 SKILL.md 超过 500 行上限，或以其他方式导致 Gate 1 检查失败（两个门槛在正文长度上相互拉扯；参见阶段 4）。当这种情况在迭代过程中发生时，不要将该迭代作为回归结束：返回阶段 2，在同一次迭代中修复 Gate 1 的问题，然后重新运行两项检查。只有在修复完成后两个门槛仍然都比上一次迭代更差时，才将该迭代计为一次回归。这样可以避免循环因代理能够在当前迭代中解决的问题而触发“连续 2 次回归”的停止条件。

将每次迭代的 JSON 保存到 `.asm-improver/iter-N.json`，并将一行门槛摘要保存到 `.asm-improver/iter-N-gates.txt`，以便最终报告能够对它们进行差异比较。

### 阶段 7 — 撰写最终报告

撰写 `.asm-improver/report.md`（完整布局见 `references/report-template.md`），并确保**三个报告部分在视觉上彼此区分**：

1. **门槛状态** — 两个硬门槛的基线与最终结果（`quick_validate.py`、Frontmatter Audit、`overallScore`、`grade`、各类别前后对比）。由此决定 PASS 还是 BLOCKER。
2. **可预测性发现**（建议性）— 按条目列出阶段 2b 的发现，对仍未解决的条目附上一行说明；如果以 fail-soft 方式跳过，则明确说明。绝不能作为门槛失败。
3. **未解决的阻塞项** — 仅限 BLOCKER；每一项都要注明失败的**硬门槛**（Gate 1 或 Gate 2）、具体检查，以及无法解决的内容。可预测性发现绝不能提升到此处。

还应包括：skill 路径、`metadata.version` 的基线版本 → 最终版本、已更改的文件、迭代次数（8 次中的第 N 次）、已应用的关键修复。不要把阻塞问题伪装成通过。结束报告——以及打印出的摘要——时，必须使用下面的 **Run stats** 代码块。

## Run stats（必需）

每次更新 skill 的运行都必须以一个运行统计代码块结束摘要——这是 Phase 7 报告之后打印的最后内容。它报告本次运行的**成本**，且绝不重复报告中已经包含的指标（迭代次数、分数、已更改的文件）。

`run_started_epoch` 由上方 _Dependency Preflight (mandatory)_ 代码块中的 `date +%s >&2` 只捕获一次；应从该代码块的 stderr 中读取其值，而不要从 shell 变量中读取，因为该变量不一定能在后续命令中保留。如果在执行该代码块之前停止，则没有可用的时间锚点，因此 `elapsed` 输出 `n/a`。

```
  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
  Run stats   elapsed 4m 12s · tokens 128,400 · cost $0.42
              agents 0 · skills 1 · tool calls 63
```

字段固定且顺序如下——绝不得重新排序、重命名或添加字段：

| Field        | Value                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------ |
| `elapsed`    | 墙钟时间持续时长，格式为 `{H}h {M}m {S}s`；仅省略值为零的前导单位（`4m 12s`、`48s`）     |
| `tokens`     | **条件字段**——仅在主机报告了使用量时打印，并使用千位分隔符 |
| `cost`       | **条件字段**——仅在主机报告了运行成本时打印，格式为 `$0.42`                    |
| `agents`     | 本次运行生成的子代理数量                                                                       |
| `skills`     | 本次运行调用的其他 skill 数量（`skill-creator` 的验证器计为一个）                        |
| `tool calls` | 本次运行进行的工具调用次数                                                                   |

- **当主机未报告 `tokens` 和 `cost` 的数值时，完全省略这两个字段**——不得留下多余的 `·`，也不得使用占位符。绝不要根据输出长度、文件大小或迭代次数估算它们，也不要从主机记录或日志中重新推算它们。
- **`elapsed`、`agents`、`skills` 和 `tool calls` 始终打印。**无法确定的值打印字面量 `n/a`；已确定的值为 `0` 时，在确实为零的情况下应打印 `0`。
- 缺少某个可选数值时，绝不能抑制代码块的其余内容。

**每一种终止结果都必须打印该代码块**，而不仅仅是在 PASS 时打印：包括循环完成、BLOCKER 报告、基线已通过两项门禁时 Phase 0 的提前退出、前置条件失败以及运行中止。只有完全没有产生任何输出的运行可以不打印代码块。开始时读取一次 epoch，结束时读取一次；输出两行——绝不要在每个阶段调用计时，也不要进行摘要处理。

## Step Completion Reports（必需）

每个阶段结束后，输出一个紧凑的状态块，以便快速查看通过/失败状态：

```
◆ Phase N — [phase name]
····································································
  Frontmatter valid:   √ pass
  quick_validate:      √ pass
  asm overall:         86 → 91
  Min category:        7 → 8
  Target version:      1.2.0 → 1.3.0
  Result:              PASS | FAIL | PARTIAL
```

通过使用 `√` 表示通过，使用 `×` 表示失败，使用 `—` 表示上下文。按阶段报告：阶段 0（已捕获基线）、阶段 1（确定性 + 规范化）、阶段 2（Gate 1 修复）、阶段 2b（可预测性审计——报告发现数量以及“advisory”/“skipped fail-soft”；此阶段永不作为门控条件）、阶段 3（asm-eval 类别修复）、阶段 5（已应用版本递增）、阶段 6（循环停止条件）、阶段 7（已写入最终报告，已打印运行统计）。

## 验收标准

- 在进行任何编辑之前，已捕获 `.asm-improver/baseline.json`、`.asm-improver/baseline-quickvalidate.txt` 和 `.asm-improver/baseline-frontmatter-audit.md`
- 已应用 `asm eval --fix`，随后对 frontmatter 进行规范化，使 `quick_validate.py` 接受结果
- 在进行任何 Gate 2 工作之前，已至少处理每项 Gate 1 检查一次
- 调用另一个 skill 的目标，在运行结束时必须包含依赖项预检，列出每个依赖项、其安装命令、安装程序自身的安装命令，以及一个验证步骤；不调用任何 skill 的目标不得添加此类章节
- 在 Gate 1 完成后运行可预测性审计（阶段 2b）——将发现记录到 `.asm-improver/predictability-audit.md`，或者在评分标准不可用时记录跳过原因。发现仅供参考，永远不会作为循环的门控条件
- 对以下每个 `asm eval` 类别中低于 8 的类别至少处理一次
- 每次迭代后都要针对**两个**门控条件重新评估，并记录到 `.asm-improver/iter-N.json` 和 `.asm-improver/iter-N-gates.txt`
- 每次产生编辑的迭代都必须将目标 skill 的 `metadata.version` 递增且仅递增一次
- 循环必须在阶段 6 的 4 个条件之一满足时停止——绝不能无界运行
- 退出时，无论通过还是阻塞，都必须存在 `.asm-improver/report.md`，其中包含门控状态、可预测性审计发现，以及未解决的阻塞项，且三者应为视觉上明显不同的章节
- 每个终端结果都必须以 Run stats 块结束——始终包含 `elapsed`、`agents`、`skills` 和 `tool calls`（无法确定时使用 `n/a`）；仅当宿主报告了 `tokens` 和 `cost` 时才打印它们，绝不得捏造
- 在 PASS 情况下：`python "$QV" "$SKILL_PATH"` 以 0 退出，并且最终评估 JSON 显示 `overallScore > 85`，且 `min(categories[*].score) >= 8`
- 在 BLOCKER 情况下：报告必须列出仍然失败的每项 Gate 1 检查，以及仍低于 8 的每个类别，并为每项提供一行原因。仅存在未解决的可预测性发现不构成阻塞项

### 预期输出

完整的 PASS 和 BLOCKER 报告模板请参见 `references/report-template.md`。在 BLOCKER 情况下，包含一个 `## Unresolved blockers` 章节，列出每项失败的**硬门控**检查，并为每项提供一行原因。

## 边界情况

- **Skill 已经通过两个门控条件**：不要编辑它。仍需只读运行阶段 2b 可预测性审计并报告任何仅供参考的发现，然后停止——通过门控并不保证流程具有可预测性，但此处未解决的发现绝不会强制进行编辑。
- **SKILL.md 没有 frontmatter**：`asm eval --fix` 无法添加它。询问用户是要使用 skill-creator 模板搭建一个，还是中止。
- **迭代导致任一门控条件退化**：还原上一次编辑（如果可用则执行 `cp SKILL.md.bak SKILL.md`，否则通过 git 撤销），然后尝试 playbook 中另一种修复模式。
- **`asm eval --fix` 写入了 `quick_validate.py` 拒绝的键**：这是预期行为——阶段 1 的规范化步骤会处理它。不要跳过规范化。
- **编辑后描述超过 250 个字符**：进行裁剪。250 字符的目标是防止 Claude Code 的 `/skills` 列表中从尾部开始截断，从而截掉你的否定触发条件子句。
- **SKILL.md 正文超过 500 行**：根据渐进式披露规则将内容拆分到 `references/` 中。退出前必须使 SKILL.md 少于 500 行。
- **循环达到 8 次迭代上限**：该 skill 存在自动改进无法解决的结构性问题。写入阻塞报告并交还给用户。
- **GitHub 简写输入**：对于 v1，要求用户先在本地克隆。远程编辑不在范围内。
- **破坏性操作**：绝不要对 skill 目录执行 `rm -rf`。`asm eval --fix` 会创建 `SKILL.md.bak`——在用户明确清理之前保留它。

## 参考资料

- `references/skill-creator-checklist.md` — Gate 1 改造操作手册（frontmatter、README、scripts、正文长度）
- `references/frontmatter-audit.md` — 完整审计清单，以及 `asm eval --fix` 规范化迁移
- `references/category-playbook.md` — `asm eval` Gate 2 各类别的修复模式
- `references/predictability-audit.md` — Phase 2b 建议性审计清单（评分标准的操作性清单，应用于目标 skill）
- `references/cross-gate-tradeoffs.md` — Phase 4 侧栏：两道 Gate 之间的正文长度权衡，以及链接跳转规则
- `references/report-template.md` — PASS 和 BLOCKER 报告布局
- `~/.claude/skills/skill-creator/scripts/quick_validate.py` — Gate 1 机械验证器
- `~/.claude/skills/skill-creator/references/frontmatter-rules.md` — 审计规则的上游来源
- `~/.claude/skills/skill-creator/references/predictability-rubric.md` — Phase 2b 审计的上游来源（不存在时采用 fail-soft）
- `~/.claude/skills/skill-creator/references/dependency-preflight.md` — dependency-preflight 规则的上游来源（上面的清单已包含无需该文件即可完成审计和修复所需的全部内容）
- `asm eval --help` — 评估器的 flag 参考
- ASM 仓库中的 `src/evaluator.ts` — 各 Gate 2 类别评分方式的事实来源