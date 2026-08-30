---
name: skill-shortener
description: "Refactor a too-long SKILL.md by progressive disclosure: measure token cost, classify every section KEEP/CUT/MOVE, shorten the body into references/ and scripts/, verify nothing was lost. Don't use for authoring new skills, eval retrofits, or prose."
license: MIT
compatibility: "Claude Code; Python 3; skill-creator's quick_validate.py"
allowed-tools: Bash Read Write Edit Grep Glob
effort: high
metadata:
  version: 1.0.0
  author: luongnv89
---
# Skill 压缩器

通过**渐进式披露**缩减过长的 `SKILL.md`：代理在_每次_激活时都需要的内容保留在正文中，其余内容移到一个指明何时加载的指针之后——或者直接删去。

三个加载层决定一段内容应归于何处：

| 层级              | 包含内容                             | 成本       |
| ----------------- | ------------------------------------ | ---------- |
| **始终加载**      | frontmatter `name` + `description`   | 每轮       |
| **触发时加载**    | `SKILL.md` 正文                      | 每次激活   |
| **按需加载**      | `references/`、`scripts/`、`assets/` | 仅在读取时 |

标准是**保持行为不变**：缩短后的 skill 应驱动与原长文档相同的流程。行数是评分标准，而不是目标——如果通过删除循环的停止条件将文档缩减到 400 行，那么无论数字看起来多么理想，这次运行都算失败。

## 两种模式

在 Phase 0 之前选择一种；两种模式从 Phase 2 开始分 diverge。

- **模式 1——缩短（默认）。** 执行 Phase 0–4：测量、分类、规划、获批准后应用、验证。所有“缩短这个”“这个 SKILL.md 太长了”“降低它的 token 成本”“应用渐进式披露”之类的请求都属于模式 1。
- **模式 2——仅审计。** 执行 Phase 0–2，然后停止并交付规划。不会写入工作目录之外的任何内容，因此会跳过 Phase 0 中的仓库同步和快照。用户想了解_哪些内容会被移动_，或准备自行应用拆分时，使用此模式。

## 运行变量

下面的每个片段都会使用这四个变量。**Bash 工具调用之间不会共享 shell 状态**，因此需要在每个用到它们的调用开头重新声明——空的 `$SKILL_PATH` 会使 `cp -R "$SKILL_PATH/."` 变成复制文件系统根目录。只捕获一次 `RUN_EPOCH`，并重复使用这个_数字_；永远不要重新生成它。

```bash
SS="$HOME/.claude/skills/skill-shortener"                            # this skill
SKILL_PATH="$HOME/.claude/skills/<target>"                           # the target: the dir holding SKILL.md
QV="$HOME/.claude/skills/skill-creator/scripts/quick_validate.py"    # the Phase 4 gate
# RUN_EPOCH: reuse the number the preflight printed, e.g. RUN_EPOCH=1787948450
```

## 依赖项预检（强制）

此 skill 会调用 `skill-creator`：它会运行该 skill 的 `quick_validate.py`，将其作为 Phase 4 的 frontmatter 闸门。在执行下面的快照之前，也就是执行任何会改变内容的第一步之前，先解析它：

```bash
RUN_EPOCH="$(date +%s)"; echo "run_started_epoch=$RUN_EPOCH" >&2   # anchors Run stats
QV="$HOME/.claude/skills/skill-creator/scripts/quick_validate.py"
test -f "$QV" || {
  echo "Missing required skill: skill-creator" >&2
  echo "Install it:      asm install skill-creator -p claude --yes" >&2
  echo "No asm yet:      npm install -g agent-skill-manager" >&2
  echo "Verify:          asm list -p claude --json | grep 'skill-creator'" >&2
  exit 1
}
```

`-p claude` 不是装饰：`asm install` 在非交互模式下拒绝猜测 provider，而 `--yes` 不会涵盖该选择，因此不带它的安装命令会报错，而不是执行安装。若未找到，则在第一次变更之前停止，并打印出这三条命令——绝不要在不完整的运行状态下继续。

## 编辑前的快照与仓库同步（必需）

**始终先创建快照。** 最常见的目标目录——`~/.claude/skills/<name>/`——_不是_ git 仓库，因此 git 并不能保证提供撤销路径；而且此技能会重写整个目录，而不是单个文件：

```bash
: "${SKILL_PATH:?set SKILL_PATH to the target skill directory}"
: "${RUN_EPOCH:?reuse the epoch captured in the preflight}"
case "$PWD/" in "$SKILL_PATH"/*) echo "cwd is inside $SKILL_PATH — run from outside it, or the workdir is copied into itself" >&2; exit 1;; esac
SNAP=".skill-shortener/snapshot-$RUN_EPOCH"
mkdir -p "$SNAP" && cp -R "$SKILL_PATH/." "$SNAP/"
```

然后，仅当目标目录本身是 git 工作树根目录时才进行同步——对于较大仓库中的任意嵌套路径，`rev-parse --git-dir` 都会成功，因此不得因此触发对该工作树的 fetch/pull：

```bash
toplevel="$(git -C "$SKILL_PATH" rev-parse --show-toplevel 2>/dev/null || true)"
if [ -n "$toplevel" ] && [ "$(cd "$SKILL_PATH" && pwd -P)" = "$toplevel" ]; then
  branch="$(git -C "$SKILL_PATH" rev-parse --abbrev-ref HEAD)"
  git -C "$SKILL_PATH" fetch origin && git -C "$SKILL_PATH" pull --rebase origin "$branch"
else
  echo "note: $SKILL_PATH is not a git work tree root — $SNAP is the only undo path; skip fetch/pull"
fi
```

如果工作树有未提交的更改，则执行 `git stash`，同步，然后执行 `git stash pop`。如果缺少 `origin` 或拉取发生冲突，**停止并询问用户**——绝不能跳过或强制执行同步。在 git 仓库中，建议将 `.skill-shortener/` 添加到 `.gitignore`。

## 三种处置方式

正文的每个部分都必须且只能对应其中一种处置方式，并且每种方式各有一个参考文档。阅读你即将分配的处置方式所对应的参考文档——不要一开始就全部阅读。

| 处置方式 | 含义 | 分配前阅读 |
| ----------- | -------------------------------------------------------------------- | -------------------------------------------------------------- |
| **KEEP**    | 每次激活时都需要；保留在正文中 | 分配此方式前阅读 `references/behavior-preservation.md` |
| **CUT**     | 删除；模型已经知道，或不会改变任何行为 | 分配此方式前阅读 `references/cut-list.md` |
| **MOVE**    | 搬移到 `references/`、`scripts/` 或 `assets/`，并添加指向它的指针 | 分配此方式前阅读 `references/split-patterns.md` |

## 工作流

### 阶段 0——基线

**模式 2——跳过快照和 git 同步。** 仅审计不得触发 `fetch` / `pull --rebase`。运行预检和下面的两个 `measure_skill.py` 命令，然后继续执行阶段 1。不要创建 `$SNAP`，也不要运行仓库同步代码块。

**模式 1。** 运行预检，在 `$SKILL_PATH` 本身是 git 工作树根目录时创建快照并进行同步（见上文），然后进行测量：

```bash
python3 "$SS/scripts/measure_skill.py" "$SKILL_PATH" --json --out .skill-shortener/baseline.json
python3 "$SS/scripts/measure_skill.py" "$SKILL_PATH"   # the human-readable section table
```

章节表按最大项优先排列，这里就是最需要精简的部分——先读它，再读正文。

**提前退出。** 如果判定结果为 `WITHIN_CAP`，请停止：输出当前占用量，并说明无需缩短——拆分一个已经符合上限的正文只会增加一次指针跳转，却不会带来任何节省。唯一的例外是现有的 `references/` 树存在链式引用或孤立内容；请参见 _Edge cases_。用户可以覆盖此决定。

**完成标准：** `.skill-shortener/baseline.json` 存在，且其中的 `sections` 数组非空，同时已记录判定结果。

### 阶段 1 — 对每个章节进行分类（清单）

读取正文，然后为 `baseline.json` 中的每个标题准确分配一种处理方式。写入 `.skill-shortener/manifest.json`：

```json
{
  "target": "<skill-path>",
  "sections": [
    { "heading": "Overview", "disposition": "KEEP" },
    {
      "heading": "API error codes",
      "disposition": "MOVE",
      "destination": "references/<topic>.md",
      "load_condition": "when the API returns a non-200"
    },
    {
      "heading": "History",
      "disposition": "CUT",
      "reason": "changelog and attribution; changes no behavior"
    }
  ]
}
```

`destination` 可以是字符串或列表。`load_condition` 是要写入指针中的条件，因此应按照代理读取时的形式编写："when X"、"before Y"、"if Z"。

清单**就是防止内容丢失的记录**。除非通过清单进行核验，否则不能认为任何内容得到了保留，因此未分类的章节就是一个等待发生的、未经审计的删除。

**完成标准：** `baseline.json` 中的每个标题都在清单中恰好出现一次；每个 `CUT` 都带有 `reason`；每个 `MOVE` 都带有 `destination` 和 `load_condition`。`scripts/verify_shorten.py` 会在阶段 4 检查这四项——不要推迟处理。

### 阶段 2 — 制定计划并审批

将计划以表格形式呈现——包括标题、处理方式、目标位置、节省的行数，以及相对于两个上限的预计正文大小和始终加载/按需加载的拆分。首先列出节省最多的三项。

**预期输出**——在修改任何文件之前输出计划：

```
Plan for skill-x — 812 lines / 5,140 words → projected 190 lines / 1,480 words

  heading                  disposition  destination                   lines
  -----------------------  -----------  ----------------------------  -----
  Azure deployment         MOVE         references/<branch>.md         -180
  Error code reference     MOVE         references/<codes>.txt         -140
  Release history          CUT          changelog; changes no behavior  -46
  Workflow                 KEEP         -                                 0

  always-loaded 64 tokens (unchanged) · on-trigger 12,900 → 3,700 · on-demand +9,100
```

**模式 2 到此结束。** 在模式 1 中，请停止并等待明确的批准。拆分是一项判断，而用户才是需要承担结果的人。

**完成标准：** 用户已批准计划，或已提出修改意见，并且这些修改已回填到清单中。

### 阶段 3 — 执行

1. 写入每个 `MOVE` 的目标文件。移动的内容必须**自包含**——即使读者只有指针提供的上下文，也能够据此采取行动。对于任何超过 300 行的参考文件，在顶部添加一行内容目录。
2. 重写正文：删除 `CUT` 章节，将每个 `MOVE` 章节替换为带有其 `load_condition` 的指针（"Read `references/<topic>.md` when the API returns a non-200"）。单纯写一句“参见 `references/<topic>.md`”只是完成了迁移，而不是完成了信息披露，并且会导致阶段 4 失败。
3. 保持参考文件**只有一层深度**。指向另一个参考文件的参考文件构成链式引用——应将其内容内联，或将其提升为同级文件。
4. 更新 `metadata.version`：纯迁移使用**次版本号**；如果任何 `CUT` 删除了指令，或步骤顺序发生了变化，则使用**主版本号**。

当计划提取出三个或更多参考文件且 Agent 工具可用时，应将每个文件分别交给一个 worker：worker 的 `Input` 是 `references/split-patterns.md` 加上该部分的文本，并返回完成后的文件。正文重写由主 agent 负责，这是唯一需要了解全局的步骤。

**完成条件：**每个 `MOVE` 目标都存在且非空，正文包含指向每个目标的条件指针，并且版本号已递增。

### 阶段 4 — 验证

```bash
python3 "$SS/scripts/verify_shorten.py" "$SKILL_PATH" \
  --manifest .skill-shortener/manifest.json \
  --baseline .skill-shortener/baseline.json
python3 "$QV" "$SKILL_PATH"
```

然后执行**回读**，这是任何脚本都无法替你完成的：打开计划创建的每个文件，确认材料完整到位，并且读起来是指令，而不是摘录。脚本可以证明清单是完整的、连接关系是正确的；只有回读才能证明内容在移动过程中没有丢失。

如果失败，请修复并重新运行——最多进行 3 轮，然后报告仍然失败的内容，而不是继续循环。如果结果比原始版本更糟，请恢复——同时保护这两个变量，因为空的 `$SNAP` 会导致 skill 被删除且没有任何内容可恢复：

```bash
: "${SKILL_PATH:?}"; : "${SNAP:?}"; test -d "$SNAP" || { echo "no snapshot at $SNAP" >&2; exit 1; }
rm -rf "$SKILL_PATH" && cp -R "$SNAP" "$SKILL_PATH"
```

**完成条件：**`verify_shorten.py` 退出码为 0，`quick_validate.py` 退出码为 0，并且每个创建的文件都已完成回读。

## 边界情况

仅列出那些判断很容易出错的情况——其他情况均应根据具体情况处理。

- **已经同时处于两个上限以内** → 执行阶段 0 的提前退出。拆分一个已经符合要求的正文会增加一次指针跳转，却不会节省任何内容。
- **目标已经存在 `references/`** → 也要对其进行测量。即使正文符合要求，一个链式或孤立的已有目录树也属于范围之内；这是唯一一种 `WITHIN_CAP` 判定仍然值得继续处理的情况。
- **路径是一个集合**（根目录没有 `SKILL.md`，但子目录中有）→ 询问要处理哪个 skill。一个清单中绝不能跨越两个 skill。
- **用户要求删减一个绝不能删减的区块** → 用一句话说明它为何保留，然后通过其他处置方式达到大小目标。不要默默照做，也不要拒绝整个任务。
- **某个部分过大，无法放入单个目标文件** → `destination` 接受一个列表。按子主题拆分，绝不能按行号范围拆分：半个流程并不是自包含的。
- **低于一个上限但超过另一个上限** → 两个上限都构成门槛。480 行但有 4,200 个单词，仍然不算缩减充分。

## 阶段完成报告

每个阶段结束后，打印：

```
◆ [阶段名称]（4 个阶段中的第 N 阶段 — [上下文]）
··································································
  [检查 1]：          √ 通过
  [检查 2]：          × 失败 — [原因]
  [标准]：            √ 满足 N/M 项
  ____________________________
  结果：              通过 | 失败 | 部分通过
```

各阶段检查项：阶段 0：`Preflight`、`Snapshot`、`Baseline measured`、`Cap verdict`。阶段 1：`Every section classified`、`Reasons given`、`Load conditions written`。阶段 2：`Plan presented`、`Approval received`。阶段 3：`Destinations written`、`Pointers conditional`、`Version bumped`。阶段 4：`verify_shorten`、`quick_validate`、`Read-back`。

## 运行统计（必需）

每次运行结束时——包括提前退出、拒绝门禁或阶段失败——都必须以此区块作为最后输出的内容：

```
  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
  Run stats   elapsed 4m 12s · tokens 96,300 · cost $0.31
              agents 0 · skills 1 · tool calls 22
```

字段固定，并按以下顺序排列：`elapsed`、`tokens`、`cost`、`agents`、`skills`、`tool calls`。当主机未报告数值时，完全省略 `tokens` 和 `cost`——绝不估算。其他四项始终输出；无法确定的值输出 `n/a`，而 `0` 表示已确定的值。`elapsed` 取自 `RUN_EPOCH`，在预检阶段捕获一次。

## 参考文件

| 文件                                  | 何时读取                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| `references/behavior-preservation.md` | 分配 `KEEP` 时——其中列出了无论代价如何都绝不能删减的区块                           |
| `references/cut-list.md`              | 分配 `CUT` 时——其中说明了哪些内容可以安全删除，以及如何表述原因                   |
| `references/split-patterns.md`        | 分配 `MOVE` 时——用于选择目标位置、编写指针和进行扁平化处理                         |