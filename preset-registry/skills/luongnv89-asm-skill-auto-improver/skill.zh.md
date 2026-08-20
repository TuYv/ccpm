---
name: skill-auto-improver
description: "Improve an external, legacy, or drifted SKILL.md to the skill-creator standard — hard validation gates plus an advisory predictability audit. Don't use for authoring from scratch (skill-creator output is already standard), bulk eval, or prose edits."
license: MIT
compatibility: "Claude Code; requires `asm` on PATH and Python 3 for skill-creator's quick_validate.py"
allowed-tools: Bash Read Write Edit Grep Glob
effort: high
metadata:
  version: 1.3.0
  author: luongnv89
---
# Skill 自动改进器

你将运行一个由评估驱动的循环，**按照当前 skill-creator 标准改造现有的 SKILL.md**。这是针对未通过 skill-creator 创建的技能的修复工具，包括外部技能、旧版技能、手动编写的技能或已发生漂移的技能。全新生成的 skill-creator 输出在设计上即可直接发布（参见 skill-creator 的 `predictability-rubric.md` → _可直接发布——不依赖 auto-improver_），通常**不应**需要此技能。

目标必须通过**两个硬性门槛**，随后还要接受一项**建议性**审计：

1. **门槛 1——skill-creator 标准（必须通过的最低要求）**——`quick_validate` 检查无误，通过 Frontmatter 审计，且不超过 500 行（详见下文）。
2. **门槛 2——asm-eval 最低要求（补充）**——`overallScore > 85`，并且每个类别都 `>= 8`。
3. **建议项——可预测性审计（阶段 2b，不是门槛）**——根据 skill-creator 的评分标准作出判断并单独报告，**绝不**作为阻断条件。

一个技能即使得分为 92，但未通过 `quick_validate.py`，也不算完成；即使通过了 `quick_validate.py`，但得分为 70，同样不算完成。**两个门槛都必须通过，否则循环将报告阻断问题**——仅有尚未解决的可预测性问题绝不会构成阻断。

## 编辑前同步仓库（强制）

此技能会修改 git 仓库中的文件。在进行任何编辑之前，先将本地分支与远程同步：

```bash
branch="$(git rev-parse --abbrev-ref HEAD)"
git fetch origin
git pull --rebase origin "$branch"
```

如果工作树存在未提交的更改，请执行 `git stash`，完成同步后再执行 `git stash pop`。如果缺少 `origin`，或 `git pull` 遇到冲突，**停止并询问用户**，之后再继续——不要跳过或强制同步。

## 何时使用

对于**现有的、外部的、旧版的、手动编写的或已发生漂移的**技能，请使用此技能：

- 用户要求“改进”“升级”“修复”“完善”现有技能，或“使其达到标准”
- 某个技能并非通过 skill-creator 编写（手写、导入或继承），且必须达到当前标准
- 某个技能已**发生漂移**——它早于当前标准，或后续编辑导致其无法通过 `quick_validate.py` 或低于 85/8 的最低要求
- 你正准备将此类技能用于 `asm publish` 或加入目录

**不适用于**对全新 skill-creator 输出进行常规清理（其在设计上即可直接发布——请使用 `/skill-creator` 进行编写）。假定 SKILL.md 已存在。如果只需要报告，请直接运行 `asm eval` 和 `quick_validate.py`，不要使用此技能。

## 前置条件

在修改任何文件之前，请验证以下所有条件。如果任一条件不满足，请停止并告知用户。

- `asm` 可通过 PATH 使用（`command -v asm` 或 `which asm`）
- Python 3 可用，并且 `~/.claude/skills/skill-creator/scripts/quick_validate.py` 存在（必须已在本地安装 skill-creator）
- 目标技能路径中包含 `SKILL.md` 文件
- 工作树中不存在无关的未提交编辑（脏文件会混入差异中）
- 你对技能目录具有写入权限

确定 skill-creator 的验证器（必需）和评分标准（软失败）路径一次，并在后续重复使用。评分标准采用**软失败**机制——本地安装的 skill-creator 可能早于仓库版本，并未包含该文件；文件缺失只会使阶段 2b 降级为警告，绝不会中止运行：

```bash
QV="$HOME/.claude/skills/skill-creator/scripts/quick_validate.py"
test -f "$QV" || { echo "skill-creator not installed at $QV"; exit 1; }
RUBRIC="$HOME/.claude/skills/skill-creator/references/predictability-rubric.md"
test -f "$RUBRIC" || echo "⚠ predictability rubric missing — Phase 2b degraded (gates unaffected)"
```

## 输入

用户提供以下任一项：

- 本地 Skill 路径：`skills/foo` 或 `/abs/path/to/skill`
- `SKILL.md` 文件的直接路径（将其父目录视为 Skill 路径）
- GitHub 简写：`github:owner/repo` 或 `github:owner/repo:path/to/skill`

对于 GitHub 输入，请让用户先克隆到本地，或者询问是否应向该仓库提交 PR。此 Skill 的默认方式是**本地编辑**——远程编辑不在 v1 的范围内。

## 门槛

请将两类判定分开：**硬性门槛**（门槛 1、门槛 2）是机械式的通过/失败检查——只有它们决定结果是 PASS 还是 BLOCKER。**可预测性发现**（阶段 2b）基于判断，仅供参考——即使仍有未解决的发现，只要两个门槛均通过，结果仍然是 PASS。

### 门槛 1 — Skill-creator 标准（必须达到的最低要求）

当以下条件**全部**满足时，Skill 即通过此门槛：

- `python "$QV" "$SKILL_PATH"` 以状态码 0 退出（没有意外字段、名称采用 kebab-case 且不超过 64 个字符、描述为不超过 1024 个字符的单行文本等）
- Frontmatter 审核（完整检查清单见 `references/frontmatter-audit.md`）通过
- `SKILL.md` 正文少于 500 行（否则拆分到 `references/`）
- 描述中包含负向触发条款，明确指出不应触发该 Skill 的相邻领域（缺失时 `quick_validate.py` 会发出警告）
- `metadata.version` 遵循 `MAJOR.MINOR.PATCH`；存在 `metadata.author`
- 如果存在 `docs/README.md`，其顶部包含供 AI 跳过的 HTML 注释
- `scripts/` 下的所有随附脚本在退出前都会向 stderr 输出描述性错误信息

此门槛**不可协商**——`asm publish` 和目录系统均依赖它。

### 门槛 2 — asm-eval 85/8 质量底线（补充要求）

```
overallScore > 85   AND   min(categories[*].score) >= 8
```

这比仅检查总分更严格——即使总分为 86，只要 `testability` 得分为 5，仍然无法通过。这样可确保质量均衡，避免某个强项掩盖弱项。

### 建议项 — 可预测性审核（非门槛）

两个门槛均通过，并不能保证该 Skill 每次运行时都会驱动相同的_流程_。阶段 2b 审核用于发现此类问题——检查清单和发现类别见 `references/predictability-audit.md`。

## 工作流程

按顺序执行以下阶段。不得跳过阶段或更改顺序。**阶段 4 是贯穿阶段 3 全程持续进行的辅助流程，而不是独立步骤**，因此不会出现在各阶段的步骤完成报告中。

### 阶段 0 — 根据两个门槛捕获基线

保存初始状态，以便审计前后差异：

```bash
mkdir -p .asm-improver
asm eval "$SKILL_PATH" --json > .asm-improver/baseline.json
python "$QV" "$SKILL_PATH" > .asm-improver/baseline-quickvalidate.txt 2>&1 || true
```

然后执行 `references/frontmatter-audit.md` 中所述的 **Frontmatter 审核**，并将发现保存到 `.asm-improver/baseline-frontmatter-audit.md`。

如果目标技能位于 git 仓库中，建议将 `.asm-improver/` 添加到 `.gitignore`，以避免迭代产物进入版本控制。

读取 JSON 并记录：

- `overallScore`、`grade`
- 每个 `categories[].score`（共 7 个类别，每个类别满分 10 分）
- `topSuggestions`（评估器自身给出的优先建议）

如果基线已经通过**两个**门槛，请立即停止——打印一行摘要并跳到最终报告。不要“改进”已经通过的技能。

### 阶段 1——应用确定性修复，然后规范化 frontmatter

运行评估器的自动修复器，轻松获得改进：

```bash
asm eval "$SKILL_PATH" --fix --dry-run   # preview the diff
asm eval "$SKILL_PATH" --fix              # write, creates SKILL.md.bak
```

这会处理尾随空格、CRLF 规范化、缺少 `effort` 以及其他机械性问题。**但是，当缺少作者或版本信息时，`asm eval --fix` 会写入顶层 `author:`（取自 `git config user.name`）和/或顶层 `version: 0.1.0`——而 `quick_validate.py` 会因它们是意外键而拒绝接受。**随后必须立即执行下面的规范化步骤。

#### Frontmatter 规范化（执行 `--fix` 后必须进行）

阅读 `references/frontmatter-audit.md` 中的“规范化 `asm eval --fix` 输出”一节，了解确切的迁移方式。简而言之：

- 将顶层 `author: <name>` → `metadata.author: <name>`（保留值）。当前修复器写入的是 `author:`；旧版技能可能改为包含顶层 `creator:`——以相同方式处理，将其迁移到 `metadata.author:`。
- 将顶层 `version: <semver>` → `metadata.version: <semver>`（保留值）
- 删除不在允许集合（`name`、`description`、`license`、`allowed-tools`、`metadata`、`compatibility`、`effort`）中的任何其他顶层键——例如旧版 `tags:`。删除前，先向用户说明重要的删除项。
- 根据 YAML 安全规则，为包含 `:`、`#`、`-`、`<`、`>`、`|`、`{`、`}`、`[`、`]`、`,`、`&`、`*`、`?`、`=`、`!`、`%`、`@` 或 `` ` `` 的任何字符串值添加引号

规范化后，重新运行**两项**检查：

```bash
asm eval "$SKILL_PATH" --json > .asm-improver/iter-1.json
python "$QV" "$SKILL_PATH"
```

许多技能在此阶段无需修改正文，`asm eval` 分数就会提高 5–15 分，而 `quick_validate.py` 通常也会从失败变为通过。

### 阶段 2——优先修复门槛 1 的失败项

`quick_validate.py` 和 Frontmatter Audit 的检查结果应优先处理，因为它们决定是否可以发布。阅读 `references/skill-creator-checklist.md`，了解完整的改造操作手册。常见修复包括：

- 描述中缺少负向触发条款 → 追加“不要用于 X、Y、Z。”，列出 2–3 个相邻领域
- 描述超过 250 个字符 → 删除缓和措辞、合并同义词（1024 是硬性上限，250 是运行时预算目标）
- 正文超过 500 行 → 将内容密集的章节拆分到 `references/<topic>.md` 中，并用一行引用说明替换内联内容
- `docs/README.md` 中缺少 AI 跳过通知 → 在文件开头添加 `references/skill-creator-checklist.md` 中的 HTML 注释
- 捆绑脚本静默退出 → 在每个 `exit 1` / `sys.exit(1)` 之前添加 `echo "Error: ..." >&2` 行

每次编辑门槛 1 的相关内容后，都要重新运行 `python "$QV" "$SKILL_PATH"`。在门槛 1 完全通过之前，不要进入阶段 2b。

### 阶段 2b — 根据可预测性评分标准进行审查（建议性）

门槛 1 完全通过后，在阶段 3 **之前**根据 skill-creator 的评分标准进行审查，以便用审查结果指导各类别的编辑。此审查仅提供建议——绝不作为门槛，也绝不阻塞流程。

1. 确认 `$RUBRIC` 已解析（参见前置条件）。如果缺失，则以**软失败方式跳过**——记录 `⚠ predictability audit skipped (rubric unavailable)`，然后进入阶段 3。
2. 按照 `references/predictability-audit.md` 逐项检查——将 7 个项目分别记录为 `pass` / `advisory`，并为每项附上具体说明，然后保存到 `.asm-improver/predictability-audit.md`。

仅在发现的问题具有_针对性_时才采取行动（可预测性修复通常也会提升某个 asm-eval 类别）；绝不要为了满足某一项而使内容臃肿。问题处理细节和禁止臃肿规则见 `references/predictability-audit.md`。

### 阶段 3 — 修复得分最低的 asm-eval 类别

按分数升序排列 7 个类别。先处理得分最低的类别。当所有类别都达到 `>= 8` 时停止。

对于每个低于 8 分的类别：

1. 阅读 `references/category-playbook.md`，查找该类别的修复模式
2. 使用 `Edit`（进行小范围、有针对性的修改）或 `Write`（重构整个章节时）应用这些模式
3. 重新运行 `asm eval "$SKILL_PATH" --json` 和 `python "$QV" "$SKILL_PATH"`，并检查变化量

**不要盲目地批量编辑多个类别。**修复之间可能相互影响——为了提升 `testability` 而扩充正文，可能会拉低 `context-efficiency`，或使正文超过 500 行（这会导致门槛 1 失败）。一次只处理一个类别，每次修改后重新评估，保留有效的修改，并还原会导致任一门槛退步的修改。

### 阶段 4 — 注意跨门槛权衡（边栏——在阶段 3 期间适用）

这是一个持续适用的边栏说明，而不是一个按顺序执行的阶段：两个门槛对正文长度的要求相互冲突，因此，提升某个 asm-eval 类别的修复可能会拉低另一个类别，或突破 500 行上限。在阶段 3 之前阅读一次 `references/cross-gate-tradeoffs.md`，并在每次编辑时默认采用**链接到外部内容，而不是内联内容**的方式。

### 阶段 5 — 递增目标 skill 的 `metadata.version`

此阶段**作为阶段 6 循环中每次迭代的最后一个操作执行**，而不是在阶段 6 之后单独执行一次。编号顺序是为了保持叙述连贯；实际执行方式是每次迭代执行一次。

根据 skill-creator 的版本管理规则，每次编辑 SKILL.md 后，都必须在保存前递增 `metadata.version`：

- **补丁版本**（`x.y.Z`）：拼写错误修复、仅涉及 frontmatter 的规范化、轻微措辞调整
- **次版本**（`x.Y.0`）：新增章节、新增参考资料、扩展触发条件、添加 subagent
- **主版本**（`X.0.0`）：重构工作流、对输出格式进行破坏性变更

如果目标 SKILL.md 没有 `metadata.version`，则添加该字段，并从 `1.0.0` 开始。每次循环迭代只递增**一次**，而不是在一次迭代中的每次编辑后都递增——否则版本号会在缺乏实质性变更的情况下快速增长。

在循环日志中记录版本递增，以便最终报告显示基准版本 → 最终版本。

### 阶段 6 — 设置上限的循环

每次迭代后重新运行**两项**检查。满足以下任一条件时停止循环：

| 停止条件                                                     | 结果                     |
| ------------------------------------------------------------ | ------------------------ |
| Gate 1 通过且 `overallScore > 85` 且 `min(scores) >= 8`      | PASS — 继续生成报告      |
| 已完成 8 次评估迭代                                          | BLOCKER — 编写报告        |
| 连续 3 次迭代中两个 Gate 均无变化                            | BLOCKER — 编写报告        |
| 连续 2 次迭代中任一 Gate 出现回退                            | BLOCKER — 恢复并生成报告  |

**迭代期间的 Gate 1 回退** — 阶段 3 中的编辑可能会导致 SKILL.md 超过 500 行上限，或以其他方式破坏某项 Gate 1 检查（两个 Gate 对正文长度的要求相互冲突；参见阶段 4）。如果这种情况发生在一次迭代过程中，不要将其作为回退来结束本次迭代：返回阶段 2，在同一次迭代中修复 Gate 1 问题，然后重新运行两项检查。只有在该修复完成后，两个 Gate 的结果仍然都比上一次迭代更差时，才将本次迭代计为回退。这可以防止循环因代理能够当场解决的反复调整而触发“连续 2 次回退”停止条件。

将每次迭代的 JSON 保存到 `.asm-improver/iter-N.json`，并将单行 Gate 摘要保存到 `.asm-improver/iter-N-gates.txt`，以便最终报告对它们进行差异比较。

### 阶段 7 — 编写最终报告

编写 `.asm-improver/report.md`（完整布局见 `references/report-template.md`），并确保**三个报告章节在视觉上清晰区分**：

1. **Gate 状态** — 两个硬性 Gate 的基线与最终结果对比（`quick_validate.py`、Frontmatter Audit、`overallScore`、`grade`、各类别前后对比）。决定结果为 PASS 还是 BLOCKER。
2. **可预测性发现**（建议性）— 按项列出阶段 2b 的发现；对于仍未解决的项，附上一行说明；如果以失败软处理方式跳过，也应明确说明。绝不能作为 Gate 失败。
3. **未解决的阻塞项** — 仅限 BLOCKER；每项都需注明失败的**硬性 Gate**（Gate 1 或 Gate 2）、具体检查，以及无法解决的内容。绝不能将可预测性发现提升为此处的阻塞项。

还应包括：Skill 路径、`metadata.version` 基线 → 最终值、已更改文件、迭代次数（N/8）、已应用的关键修复。不得将阻塞结果伪装成通过。

## 步骤完成报告（必需）

每个阶段结束后，输出一个紧凑的状态块，以便快速查看通过/失败状态：

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

通过使用 `√`，失败使用 `×`，上下文信息使用 `—`。各阶段需报告：阶段 0（已捕获基线）、阶段 1（确定性检查 + 规范化）、阶段 2（Gate 1 修复）、阶段 2b（可预测性审计 — 报告发现数量及“建议性”/“失败软处理跳过”；此阶段绝不作为 Gate）、阶段 3（asm-eval 类别修复）、阶段 5（已应用版本升级）、阶段 6（循环停止条件）、阶段 7（已编写最终报告）。

## 验收标准

- 在进行任何编辑之前，已采集 `.asm-improver/baseline.json`、`.asm-improver/baseline-quickvalidate.txt` 和 `.asm-improver/baseline-frontmatter-audit.md`
- 已应用 `asm eval --fix`，随后规范化 frontmatter，使 `quick_validate.py` 能够接受结果
- 在开始任何 Gate 2 工作之前，Gate 1 的每项检查都至少处理过一次
- 在 Gate 1 全部通过后运行可预测性审计（Phase 2b）——将发现记录到 `.asm-improver/predictability-audit.md`；如果评分标准不可用，则记录跳过原因。审计发现仅供参考，绝不会作为循环的门禁条件
- `asm eval` 中低于 8 分的每个类别都至少处理过一次
- 每次迭代后都针对**两个**门禁重新评估，并将结果记录到 `.asm-improver/iter-N.json` 和 `.asm-improver/iter-N-gates.txt`
- 目标 skill 的 `metadata.version` 在每次产生编辑的迭代中恰好递增一次
- 循环在 Phase 6 的 4 个条件之一满足时停止——绝不无限循环
- 退出时，无论是 PASS 还是 BLOCKER，`.asm-improver/report.md` 都必须存在，并以三个视觉上明确区分的章节分别呈现门禁状态、仅供参考的可预测性发现和未解决的阻塞项
- PASS 时：`python "$QV" "$SKILL_PATH"` 以状态码 0 退出，并且最终评估 JSON 显示 `overallScore > 85` 且 `min(categories[*].score) >= 8`
- BLOCKER 时：报告列出仍然失败的每一项 Gate 1 检查和仍低于 8 分的每个类别，并分别提供一行原因。仅存在尚未解决的可预测性发现绝不构成阻塞项

### 预期输出

完整的 PASS 和 BLOCKER 报告模板请参阅 `references/report-template.md`。出现 BLOCKER 时，应包含一个 `## 未解决的阻塞项` 章节，列出每项失败的**硬门禁**检查，并分别提供一行原因。

## 边界情况

- **Skill 已通过两个门禁**：不要编辑它。仍须以只读方式运行 Phase 2b 可预测性审计并报告所有仅供参考的发现，然后停止——通过门禁并不能保证流程具有可预测性，但这里尚未解决的发现绝不会强制要求编辑。
- **SKILL.md 没有 frontmatter**：`asm eval --fix` 无法添加它。询问用户是要搭建一个 frontmatter（使用 skill-creator 模板），还是中止。
- **迭代导致任一门禁回退**：还原上一次编辑（如果可用，则使用 `cp SKILL.md.bak SKILL.md`；否则通过 git 撤销），然后尝试 playbook 中的另一种修复模式。
- **`asm eval --fix` 写入了 `quick_validate.py` 拒绝的键**：这是预期情况——Phase 1 的规范化步骤会处理它。不要跳过规范化。
- **编辑后 description 超过 250 个字符**：精简。250 个字符的目标可防止 Claude Code 的 `/skills` 列表从尾部开始截断，否则会截掉否定触发条件子句。
- **SKILL.md 正文超过 500 行**：根据渐进式披露规则将内容拆分到 `references/` 中。退出前，SKILL.md 必须减少到 500 行以下。
- **循环达到 8 次迭代上限**：该 skill 存在自动改进无法解决的结构性问题。编写阻塞报告并交还给用户。
- **GitHub 简写输入**：在 v1 中，要求用户先克隆到本地。远程编辑不在范围内。
- **破坏性操作**：绝不要对 skill 目录执行 `rm -rf`。`asm eval --fix` 会创建 `SKILL.md.bak`——将其保留在原处，直到用户明确执行清理。

## 参考资料

- `references/skill-creator-checklist.md` — Gate 1 改造手册（frontmatter、README、脚本、正文长度）
- `references/frontmatter-audit.md` — 完整的审核清单，以及 `asm eval --fix` 规范化迁移
- `references/category-playbook.md` — 针对 `asm eval` Gate 2 各类别的修复模式
- `references/predictability-audit.md` — Phase 2b 建议性审核清单（将评分标准的操作清单应用于目标 skill）
- `references/cross-gate-tradeoffs.md` — Phase 4 侧栏：两个 Gate 之间的正文长度权衡及外链规则
- `references/report-template.md` — PASS 和 BLOCKER 报告格式
- `~/.claude/skills/skill-creator/scripts/quick_validate.py` — Gate 1 机械验证器
- `~/.claude/skills/skill-creator/references/frontmatter-rules.md` — 审核规则的上游来源
- `~/.claude/skills/skill-creator/references/predictability-rubric.md` — Phase 2b 审核的上游来源（若不存在则软失败）
- `asm eval --help` — 评估器的参数参考
- ASM 仓库中的 `src/evaluator.ts` — Gate 2 各类别评分方式的权威来源