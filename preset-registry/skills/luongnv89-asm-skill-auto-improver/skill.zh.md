---
name: skill-auto-improver
description: "Improve an external, legacy, or drifted SKILL.md to the skill-creator standard — hard validation gates plus an advisory predictability audit. Don't use for authoring from scratch (skill-creator output is already standard), bulk eval, or prose edits."
license: MIT
compatibility: "Claude Code; requires `asm` on PATH and Python 3 for skill-creator's quick_validate.py"
allowed-tools: Bash Read Write Edit Grep Glob
effort: high
metadata:
  version: 2.0.0
  author: luongnv89
---
# Skill 自动改进器

你运行的是一个由评估驱动的循环，用于将现有的 SKILL.md **改造为符合当前 skill-creator 标准的版本**。这是针对未经过 skill-creator 处理的 skill 的修复工具——包括外部的、遗留的、手动编写的或已发生偏移的 skill。全新的 skill-creator 输出天然已达到可发布状态（参见 skill-creator 的 `predictability-rubric.md` → _Publish-ready — no auto-improver dependency_），通常**不应**需要此 skill。

目标必须通过**两个硬性门槛**，然后再接受一次**建议性**审计：

1. **门槛 1 — skill-creator 标准（必须达到的最低要求）** — `quick_validate` 无错误，Frontmatter Audit 通过，且不超过 500 行（详见下文）。
2. **门槛 2 — asm-eval 最低要求（补充项）** — `overallScore > 85`，并且每个类别均 `>= 8`。
3. **建议性 — 可预测性审计（Phase 2b，不是门槛）** — 根据 skill-creator 的 rubric 进行基于判断的检查，将结果单独报告，**绝不**作为阻塞条件。

得分为 92 但未通过 `quick_validate.py` 的 skill 尚未完成；通过了 `quick_validate.py` 但得分为 70 的 skill 也尚未完成。**两个门槛都必须通过，否则循环会报告阻塞项**——仅存在尚未解决的可预测性问题，永远不会导致阻塞。

## 两种模式

在 Phase 0 之前选择一种模式——两者不共用同一套工作流。

- **模式 1 — 改造（默认）。** 将目标提升至 skill-creator 标准：执行下方未经修改的 Phase 0–7 循环。所有“改进”“修复”“提升级别”或“达到标准”的请求均属于模式 1。
- **模式 2 — 委派转换（选择启用）。** 将目标的步骤重构为**逐步上下文委派**——每个繁重步骤都要指明其 worker 所需的自身 `references/` 树中的相关切片，并将其作为 worker 的 `Input` 传递（参见 skill-creator 的 `subagent-patterns.md` → _Per-Step Context Delegation_）。该模式在 Phase 6 循环之外运行，针对已经通过门槛 1 的目标执行，并且只有在用户确认重构后才能执行。阅读 `references/delegation-conversion.md` 以了解完整流程，包括目标的 MAJOR bump，以及转换何时无法带来足够收益。Phase 2b 中关于可委派性的发现会将流程引导至此处——它不会自行启动转换。

## 依赖项预检（强制）

此 skill 会调用 `skill-creator`：运行其 `quick_validate.py`（必需——门槛 1 验证器），并读取其 `predictability-rubric.md`（容错失败——Phase 2b）。在下面的仓库同步之前（这是第一个会产生任何变更的步骤），一次性解析两者并重复使用。该 rubric 采用**容错失败**策略——本地安装的 skill-creator 可能早于仓库版本，因而未附带该文件；缺少该文件只会使 Phase 2b 降级为警告，永远不会中止运行：

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

`-p claude` 是必需的，不是装饰项：在非交互式 shell 中，`asm install` 拒绝猜测 provider，而 `--yes` 不会替你做出这一选择，因此省略它的 gate 会把一条会报错的命令交给用户，而不是完成安装。验证步骤使用了与检测路径所属的相同 provider，因此如果安装落到了其他工具下，而 `$QV` 仍然缺失，就不能报告成功。

如果未找到，必须在首次变更之前停止，并打印上面的三条命令 — 不要继续执行部分流程。这与该 skill 为每个目标审计的 gate 相同（`references/skill-creator-checklist.md` → _依赖项预检_）。

## 编辑前同步仓库（必需）

此 skill 会修改 git 仓库中的文件。在进行任何编辑之前，先将本地分支与远程同步：

```bash
branch="$(git rev-parse --abbrev-ref HEAD)"
git fetch origin
git pull --rebase origin "$branch"
```

如果工作树不干净，请执行 `git stash`，完成同步后再执行 `git stash pop`。如果缺少 `origin`，或 `git pull` 遇到冲突，**请停止并询问用户**后再继续 — 不要跳过或强制执行同步。

## 使用时机

对于**已有的、外部的、遗留的、手动编写的或已发生漂移的** skill，应使用此工具：

- 用户要求“改进”“提升”“修复”“润色”或“使其达到标准”某个现有 skill
- 某个 skill 并非由 skill-creator 编写（手写、导入、继承），并且必须达到当前标准
- 某个 skill 已经**发生漂移** — 早于现行标准，或编辑后导致 `quick_validate.py` 校验失败，或低于 85/8 下限
- 你正在为 `asm publish` 或目录准备此类 skill

**不要**用于对新鲜的 skill-creator 输出进行例行清理（其生成结果按设计即可发布 — 使用 `/skill-creator` 进行编写）。假定存在 SKILL.md。若只需要报告，请直接运行 `asm eval` 和 `quick_validate.py` — 不要使用此 skill。

## 前置条件

在接触任何文件之前，验证以下所有条件。如果任一条件失败，请停止并告知用户。

- `asm` 可通过 PATH 使用（`command -v asm` 或 `which asm`）
- Python 3 可用；skill-creator 的 `quick_validate.py` 通过上方的_依赖项预检（必需）_解析，这是唯一处理未找到情况的位置
- 目标 skill 路径包含 `SKILL.md` 文件
- 工作树没有无关的未提交编辑（脏文件会混入 diff）
- 你拥有 skill 目录的写入权限

## 输入

用户提供以下其中一种：

- 本地 skill 路径：`skills/foo` 或 `/abs/path/to/skill`
- 直接的 `SKILL.md` 文件路径（将其视为父目录）
- GitHub 简写：`github:owner/repo` 或 `github:owner/repo:path/to/skill`

对于 GitHub 输入，请先询问用户是要先在本地克隆，还是由你向该仓库提交 PR。此 skill 的默认路径是**本地编辑** — 远程编辑不在 v1 范围内。

## 各道 Gate

将两类决策分开：**硬性 gate**（Gate 1、Gate 2）是机械性的，只有通过或失败两种结果 — 它们单独决定 PASS 还是 BLOCKER。**可预测性发现**（Phase 2b）基于判断，属于建议性质 — 即使两个 gate 都通过但仍有未解决的发现，结果仍然是 PASS。

### 门槛 1 — Skill-creator 标准（必须通过的底线）

满足以下**全部**条件时，技能才能通过此门槛：

- `python "$QV" "$SKILL_PATH"` 退出码为 0（不存在意外键名、名称为 kebab-case 且不超过 64 个字符、描述为单行且不超过 1024 个字符，等等）
- Frontmatter 审计（完整检查清单见 `references/frontmatter-audit.md`）通过
- `SKILL.md` 正文少于 500 行（如果不满足，则拆分到 `references/`）
- 描述包含负向触发条件条款，列出不应触发该技能的相邻领域（缺失时 `quick_validate.py` 会发出警告）
- `metadata.version` 遵循 `MAJOR.MINOR.PATCH` 格式；存在 `metadata.author`
- 如果存在 `docs/README.md`，则其顶部包含 AI 跳过 HTML 注释
- `scripts/` 下的所有捆绑脚本在退出前都向 stderr 输出描述性错误信息
- **如果目标技能会调用其他技能**，则必须包含依赖项预检，列出每个依赖项、其安装命令、用于安装该安装器本身的命令，以及验证步骤（`references/skill-creator-checklist.md` → _依赖项预检_）。不调用其他技能的技能不需要此部分——缺少该部分不算问题，也绝不能添加空的依赖项预检部分

此门槛**不可协商**——`asm publish` 和目录都依赖于此。

### 门槛 2 — asm-eval 85/8 质量底线（补充）

```text
overallScore > 85   AND   min(categories[*].score) >= 8
```

这比只要求总体分数更严格——即使总体分数为 86，但 `testability` 得分为 5，仍然不通过。这样可以强制保证质量均衡，避免某个强项掩盖薄弱环节。

### 建议项 — 可预测性审计（不是门槛）

两个门槛都通过，并不保证每次运行都会驱动相同的_流程_。Phase 2b 审计会捕获这一点——检查清单和问题分类见 `references/predictability-audit.md`。

## 工作流

按顺序执行以下阶段。不要跳过阶段，也不要更改顺序。**Phase 4 是贯穿整个 Phase 3 持续运行的侧边流程，而不是独立步骤**，因此它不会出现在逐阶段的步骤完成报告中。

### Phase 0 — 针对两个门槛捕获基线

保存初始状态，以便对前后差异进行审计：

```bash
mkdir -p .asm-improver
asm eval "$SKILL_PATH" --json > .asm-improver/baseline.json
python "$QV" "$SKILL_PATH" > .asm-improver/baseline-quickvalidate.txt 2>&1 || true
```

然后执行 `references/frontmatter-audit.md` 中所述的 **Frontmatter 审计**，并将发现保存到 `.asm-improver/baseline-frontmatter-audit.md`。

如果目标技能位于 git 仓库中，建议将 `.asm-improver/` 添加到 `.gitignore`，使迭代产物不进入版本控制。

读取 JSON 并记录：

- `overallScore`、`grade`
- 每个 `categories[].score`（7 个类别，每个满分为 10 分）
- `topSuggestions`（评估器自身给出的优先事项）

如果基线已经通过**两个**门槛，则立即停止——打印一行摘要，然后跳转到最终报告。不要“改进”一个已经通过的技能（在 Mode 1 中，可委派性问题不是继续执行的理由——改为提供 Mode 2）。

### 阶段 1——应用确定性修复，然后规范化 frontmatter

运行评估器的自动修复器，获取无需额外操作的改进：

```bash
asm eval "$SKILL_PATH" --fix --dry-run   # 预览差异
asm eval "$SKILL_PATH" --fix              # 写入修改，并创建 SKILL.md.bak
```

此操作会处理尾随空格、CRLF 规范化、缺失的 `effort` 以及其他机械性问题。**但是，当缺少作者信息或版本号时，`asm eval --fix` 会写入顶层的 `author:`（取自 `git config user.name`）和/或顶层的 `version: 0.1.0`——而这两者都会被 `quick_validate.py` 判定为意外键。** 因此应立即执行下面的规范化步骤。

#### Frontmatter 规范化（`--fix` 后必须执行）

阅读 `references/frontmatter-audit.md`——“Normalizing `asm eval --fix` output”部分——以了解确切的迁移方式。简而言之：

- 将顶层的 `author: <name>` → `metadata.author: <name>`（保留该值）。当前修复器会写入 `author:`；较旧的 skill 可能包含顶层的 `creator:`，应以相同方式处理，并迁移到 `metadata.author:`。
- 将顶层的 `version: <semver>` → `metadata.version: <semver>`（保留该值）
- 删除任何不在允许集合（`name`、`description`、`license`、`allowed-tools`、`metadata`、`compatibility`、`effort`）中的其他顶层键——例如旧版的 `tags:`。删除前，先将非简单删除告知用户。
- 根据 YAML 安全规则，为任何包含 `:`, `#`, `-`, `<`, `>`, `|`, `{`, `}`, `[`, `]`, `,`, `&`, `*`, `?`, `=`, `!`, `%`, `@` 或 `` ` `` 的字符串值加引号

完成规范化后，重新运行**两项**检查：

```bash
asm eval "$SKILL_PATH" --json > .asm-improver/iter-1.json
python "$QV" "$SKILL_PATH"
```

许多 skill 无需修改正文，仅在此处执行后，`asm eval` 的得分就会提高 5–15 分，而 `quick_validate.py` 通常也会从失败变为通过。

### 阶段 2——首先修复 Gate 1 失败项

`quick_validate.py` 和 Frontmatter Audit 的发现应优先处理，因为它们决定能否发布。阅读 `references/skill-creator-checklist.md`，获取完整的改造操作手册。常见修复包括：

- 描述缺少负向触发条件 → 追加“不要用于 X、Y、Z。”，列出 2–3 个相邻领域
- 描述超过 250 个字符 → 删除模糊措辞，合并同义词（1024 是硬上限，250 是运行时预算目标）
- 正文超过 500 行 → 将密集部分拆分到 `references/<topic>.md`，并用一行指针替换内联内容
- `docs/README.md` 缺少 AI 跳过提示 → 在开头添加 `references/skill-creator-checklist.md` 中的 HTML 注释
- 随附脚本静默退出 → 在每个 `exit 1` / `sys.exit(1)` 之前添加 `echo "Error: ..." >&2` 行
- Skill 在没有预检门禁的情况下调用另一个 skill，或虽有预检门禁却从未说明安装方式 → 报告该发现，并添加 `references/skill-creator-checklist.md` → _Dependency preflight_ 中的门禁。通过扫描目标内容中的 `/skill-name` 调用、对 `~/.claude/skills/` 或 `~/.agents/skills/` 的读取，以及交给命名 skill 执行的阶段来检测此问题

每次 Gate 1 编辑后都要重新运行 `python "$QV" "$SKILL_PATH"`。在 Gate 1 清理完毕前，不要进入阶段 2b。

### 阶段 2b — 根据可预测性评估标准进行审计（咨询性）

在 Gate 1 通过后、Phase 3 **之前**，根据 skill-creator 的评估标准进行审计，以便审计结果指导你的类别编辑。咨询性——绝不作为 gate，绝不阻塞流程。

1. 确认 `$RUBRIC` 已解析（_Dependency Preflight (mandatory)_）。如果缺失，**跳过且不阻塞流程**——记录 `⚠ predictability audit skipped (rubric unavailable)`，然后进入 Phase 3。
2. 遍历 `references/predictability-audit.md`——将 7 个项目中的每一项记录为 `pass` / `advisory`，并附上具体说明，保存到 `.asm-improver/predictability-audit.md`。第 #4 项包含**可委派性子检查**：如果某个重量级步骤没有指明任何 `references/` 片段，则应记录一条咨询性发现，说明是哪一步以及为什么不可委派；其修复方式是 Mode 2——绝不能进行 Mode 1 编辑。

仅在发现属于_针对性问题_时采取行动（可预测性修复通常也会提升某个 asm-eval 类别）；不要为了满足单个项目而盲目膨胀。发现处理的详细信息和禁止膨胀规则位于 `references/predictability-audit.md`。

### 阶段 3 — 修复得分最低的 asm-eval 类别

按得分升序排列 7 个类别。先处理得分最低的类别。当所有类别都达到 `>= 8` 时停止。

对于每个低于 8 分的类别：

1. 阅读 `references/category-playbook.md`，查找该类别的修复模式
2. 使用 `Edit`（小范围的针对性更改）或 `Write`（重构整个章节时）应用这些模式
3. 重新运行 `asm eval "$SKILL_PATH" --json` 和 `python "$QV" "$SKILL_PATH"`，并检查差异

**不要盲目批量编辑多个类别。** 修复可能会相互影响——扩充 `testability` 的正文可能会损害 `context-efficiency`，或使正文超过 500 行（从而无法通过 Gate 1）。一次只处理一个类别，每次更改后重新评估；保留有助于改善结果的更改，回退导致任一 gate 退化的更改。

### 阶段 4 — 留意跨 gate 的权衡（侧栏——适用于 Phase 3 期间）

这是一个持续适用的侧栏，而不是顺序执行的阶段：两个 gate 在正文长度上拉向相反方向，因此，提升某个 asm-eval 类别的修复可能会拉低另一个类别的得分，或突破 500 行上限。在 Phase 3 之前阅读一次 `references/cross-gate-tradeoffs.md`，并在每次编辑时默认**链接到外部，而不是内联展开**。

### 阶段 5 — 增加目标 skill 的 `metadata.version`

此阶段**在 Phase 6 循环的每次迭代中作为最后一个操作执行**，而不是在 Phase 6 之后作为一次性独立流程执行。编号是为了叙述连贯；实际执行按每次迭代进行。

根据 skill-creator 的版本管理规则，每次编辑 SKILL.md 都必须在保存前增加 `metadata.version`：

- **Patch** (`x.y.Z`)：拼写错误修复、仅 frontmatter 规范化、细微措辞调整
- **Minor** (`x.Y.0`)：新增章节、新增引用、扩展触发条件、新增子代理
- **Major** (`X.0.0`)：重构工作流、破坏性输出格式变更

如果目标 SKILL.md 没有 `metadata.version`，则从 `1.0.0` 开始添加。每次循环迭代**恰好增加一次**，而不是在一次迭代中的每次编辑后都增加——否则版本号会超前于有意义的更改而不断增长。

将此次版本升级记录到循环日志中，以便最终报告能够展示基线版本 → 最终版本。

### 阶段 6 — 设置上限的循环

每次迭代后重新运行**两项**检查。当满足以下任一条件时，循环停止：

| 停止条件                                                     | 结果                     |
| ------------------------------------------------------------ | ------------------------ |
| Gate 1 通过且 `overallScore > 85` 且 `min(scores) >= 8`      | PASS — 继续生成报告      |
| 已完成 8 次评估迭代                                          | BLOCKER — 撰写报告       |
| 连续 3 次迭代在两个 gate 上均无变化                           | BLOCKER — 撰写报告       |
| 连续 2 次迭代在任一 gate 上出现回归                           | BLOCKER — 回退并撰写报告 |

**迭代中途的 Gate 1 回归**——Phase 3 的编辑可能会使 SKILL.md 超过 500 行上限，或以其他方式导致 Gate 1 检查失败（两个 gate 在正文长度方面的要求相反；参见 Phase 4）。如果这种情况在一次迭代中发生，不要将其作为回归结束该迭代：返回 Phase 2，在同一次迭代中修复 Gate 1 的问题，然后重新运行两项检查。只有在修复完成后两个 gate 仍然都比上一次迭代更差时，才将该迭代计为一次回归。这样可以避免循环因 agent 能够在原地解决的问题而触发“连续 2 次回归”的停止条件。

将每次迭代的 JSON 保存到 `.asm-improver/iter-N.json`，并将单行 gate 摘要保存到 `.asm-improver/iter-N-gates.txt`，以便最终报告能够对它们进行差异比较。

### 阶段 7 — 撰写最终报告

撰写 `.asm-improver/report.md`（完整布局见 `references/report-template.md`），并确保**三个报告部分在视觉上彼此区分**：

1. **Gate 状态**——两个硬 gate（`quick_validate.py`、Frontmatter 审计、`overallScore`、`grade`、各类别的改进前后结果）的基线与最终状态。由此决定 PASS 还是 BLOCKER。
2. **可预测性发现**（建议项）——逐项列出 Phase 2b 的发现，对仍未解决的项目附上一行说明；如果以 fail-soft 方式跳过，也要说明。永远不要将其判定为 gate 失败。
3. **未解决的阻塞项**——仅在 BLOCKER 时包含；每一项都要指出失败的**硬 gate**（Gate 1 或 Gate 2）、具体检查项，以及无法解决的问题。可预测性发现绝不能提升到此处。

还要包含：skill 路径、`metadata.version` 基线 → 最终版本、已修改的文件、迭代次数（8 次中的 N 次）、已应用的关键修复。不要将 blocker 假装成 pass。使用下面的 **Run stats** 块结束报告——以及打印出的摘要。

## Run stats（必需）

每次更新 skill 的运行都必须以一个 run-stats 块结束其摘要——这是 Phase 7 报告之后最后打印的内容。它报告本次运行的**成本**，且绝不重复报告中已经包含的指标（迭代次数、分数、已修改的文件）。

`run_started_epoch` 由上方的 _Dependency Preflight（必需）_ 块中的 `date +%s >&2` 捕获一次；从该块的 stderr 中读取该值，不要从 shell 变量中读取，因为该变量未必能在后续命令中保留。若在该块运行前就停止，则没有可用的起始锚点，此时 `elapsed` 输出 `n/a`。

```
  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
  Run stats   elapsed 4m 12s · tokens 128,400 · cost $0.42
              agents 0 · skills 1 · tool calls 63
```

字段是固定的，且顺序固定——绝不可重新排序、重命名或添加：

| Field        | Value                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------ |
| `elapsed`    | 墙钟时长，`{H}h {M}m {S}s`；仅省略值为零的前导单位（`4m 12s`、`48s`）     |
| `tokens`     | **有条件**——仅当主机报告了使用量时打印，并使用千位分隔符 |
| `cost`       | **有条件**——仅当主机报告了运行成本时打印，格式为 `$0.42`                    |
| `agents`     | 此次运行生成的子代理                                                                       |
| `skills`     | 此次运行调用的其他技能（`skill-creator` 的验证器计为一个）                        |
| `tool calls` | 此次运行进行的工具调用                                                                   |

- **当主机未报告数值时，`tokens` 和 `cost` 将被完全省略**——不得留下多余的 `·`，也不得使用占位符。绝不可根据输出长度、文件大小或迭代次数估算，也绝不可根据主机转录内容或日志重构。
- **`elapsed`、`agents`、`skills` 和 `tool calls` 始终打印。** 无法确定的值打印字面量 `n/a`；`0` 是一个已确定的值，在实际为零时应正确打印。
- 缺失的可选数值绝不能抑制代码块的其余部分。

在**每一种**终止结果下打印，而不只是 PASS：循环完成、BLOCKER 报告、基线已通过两个门禁时 Phase 0 提前退出、前置条件失败以及运行中止。只有完全没有产生任何输出的运行不打印代码块。开始时读取一次 epoch，结束时读取一次，输出两行——绝不可每个阶段调用一次计时，也绝不可执行总结步骤。

## 步骤完成报告（必需）

每个阶段结束后，输出一个紧凑的状态代码块，以便快速查看通过/失败状态：

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

使用 `√` 表示通过，使用 `×` 表示失败，使用 `—` 表示上下文。按阶段报告：Phase 0（已捕获基线）、Phase 1（确定性 + 规范化）、Phase 2（Gate 1 修复）、Phase 2b（可预测性审计——报告发现数量以及“advisory”/“skipped fail-soft”；此阶段永不作为门禁）、Phase 3（asm-eval 类别修复）、Phase 5（已应用版本递增）、Phase 6（循环停止条件）、Phase 7（已写入最终报告，已打印运行统计）。

## 验收标准

- 在进行任何编辑之前，已捕获 `.asm-improver/baseline.json`、`.asm-improver/baseline-quickvalidate.txt` 和 `.asm-improver/baseline-frontmatter-audit.md`
- 已应用 `asm eval --fix`，随后已规范化 frontmatter，使 `quick_validate.py` 接受结果
- 在进行任何 Gate 2 工作之前，已至少处理每项 Gate 1 检查一次
- 调用另一个技能的目标必须在运行结束时包含依赖预检，列出每个依赖、其安装命令、安装程序本身的安装命令以及验证步骤；不调用其他技能的目标不得添加此部分
- Gate 1 通过后运行可预测性审计（Phase 2b）——将发现记录到 `.asm-improver/predictability-audit.md`，或在评分标准不可用时记录跳过原因。发现仅供参考，绝不作为循环的门禁
- 已至少处理每个 `asm eval` 类别中低于 8 分的类别一次
- 每次迭代后都针对**两个**门禁重新评估，并将结果捕获到 `.asm-improver/iter-N.json` 和 `.asm-improver/iter-N-gates.txt`
- 每次产生编辑的迭代，目标技能的 `metadata.version` 恰好递增一次
- 循环在 Phase 6 中的 4 个条件之一满足时停止——绝不允许无界运行
- 退出时存在 `.asm-improver/report.md`，无论是通过还是阻塞，其中都包含门禁状态、可预测性审计发现以及未解决阻塞项三个视觉上彼此区分的部分
- 每一种终止结果都以 Run stats 代码块结束——始终包含 `elapsed`、`agents`、`skills` 和 `tool calls`（无法确定时使用 `n/a`），仅在主机报告了 `tokens` 和 `cost` 时打印它们，绝不可捏造
- 在 PASS 时：`python "$QV" "$SKILL_PATH"` 以 0 退出，且最终评估 JSON 显示 `overallScore > 85`，并且 `min(categories[*].score) >= 8`
- 在 BLOCKER 时：报告列出仍然失败的每项 Gate 1 检查，以及仍低于 8 分的每个类别，并为每项提供一行原因。未解决的可预测性发现本身绝不构成 blocker

### 预期输出

完整的 PASS 和 BLOCKER 报告模板请参见 `references/report-template.md`。如果是 BLOCKER，请包含一个 `## 未解决的阻塞项` 部分，列出每项未通过的**硬门禁**检查，并为每项提供一行原因。

## 边界情况

- **Skill 已经通过两道门禁**：不要编辑它。仍然以只读方式运行 Phase 2b 可预测性审计，并报告任何建议性发现，然后停止——通过门禁并不保证流程具有可预测性，但这里发现的未解决问题永远不会强制进行编辑。包含大量不可委派步骤且通过门禁的 skill 是 **Mode 2** 候选：提供转换方案，但在 Mode 1 下不要编辑。
- **SKILL.md 没有 frontmatter**：`asm eval --fix` 无法添加它。询问用户是要使用 skill-creator 模板生成一个，还是中止。
- **迭代导致任一门禁退化**：还原上一次编辑（如果存在则执行 `cp SKILL.md.bak SKILL.md`，否则通过 git 撤销），然后尝试操作手册中的另一种修复模式。
- **`asm eval --fix` 写入了 `quick_validate.py` 会拒绝的键**：这是预期行为——Phase 1 的规范化步骤会处理它。不要跳过规范化。
- **编辑后描述超过 250 个字符**：进行精简。250 个字符的目标是防止 Claude Code 的 `/skills` 列表从尾部开始截断，从而截掉你的负向触发条件。
- **SKILL.md 正文超过 500 行**：根据渐进式披露规则将内容拆分到 `references/` 中。退出前必须让 SKILL.md 少于 500 行。
- **循环达到 8 次迭代上限**：该 skill 存在自动改进无法解决的结构性问题。编写阻塞项报告并交还给用户。
- **GitHub 简写输入**：对于 v1，要求用户先在本地克隆。远程编辑不在范围内。
- **破坏性操作**：绝不要执行 `rm -rf` 删除 skill 目录。`asm eval --fix` 会创建 `SKILL.md.bak`——在用户明确清理之前保留该文件。

## 参考资料

- `references/skill-creator-checklist.md` — 门禁 1 改造操作手册（frontmatter、README、脚本、正文长度）
- `references/frontmatter-audit.md` — 完整审计清单以及 `asm eval --fix` 规范化迁移
- `references/category-playbook.md` — 针对 `asm eval` 门禁 2 的各类别修复模式
- `references/predictability-audit.md` — Phase 2b 建议性审计清单（应用于目标 skill 的评分标准操作清单）
- `references/cross-gate-tradeoffs.md` — Phase 4 侧栏：两道门禁之间的正文长度权衡以及链接跳转规则
- `references/delegation-conversion.md` — Mode 2：将现有 skill 转换为按步骤进行上下文委派（选择加入、需用户确认，在 Phase 6 循环之外）
- `references/report-template.md` — PASS、BLOCKER 和 Mode 2 转换报告布局
- `~/.claude/skills/skill-creator/scripts/quick_validate.py` — 门禁 1 机械验证器
- `~/.claude/skills/skill-creator/references/frontmatter-rules.md` — 审计规则的上游来源
- `~/.claude/skills/skill-creator/references/predictability-rubric.md` — Phase 2b 审计的上游来源（不存在时软失败）
- `~/.claude/skills/skill-creator/references/dependency-preflight.md` — 依赖预检规则的上游来源（上面的清单包含了无需该文件即可完成审计和修复的全部内容）
- `asm eval --help` — 评估器的标志参考
- ASM 仓库中的 `src/evaluator.ts` — 每个门禁 2 类别评分方式的事实来源