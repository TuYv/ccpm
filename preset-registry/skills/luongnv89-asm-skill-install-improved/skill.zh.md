---
name: skill-install-improved
description: "Install an improved variant of one named skill: resolve it by local path, repo, or name, run skill-auto-improver on a throwaway copy, then install the improved result. Don't use for improving in place, upstream PRs, or plain asm install."
license: MIT
compatibility: "Claude Code; requires `asm` and `git` on PATH"
allowed-tools: Bash Read Write Edit Grep Glob
effort: high
metadata:
  version: 1.0.0
  author: luongnv89
---
# 改进后安装技能

你安装的不是已发布的技能原版，而是某个技能的**改进**版本：将目标解析到本地目录 → 对其运行 `skill-auto-improver` → 安装改进后的结果 → 报告改进了哪些内容以及改进自何处。改进是安装流程中的一个步骤，而不是单独的任务。每次运行只处理一个技能。

## 何时使用

- 用户说“安装 `<skill>`，但先改进它”或“安装 `<skill>` 的改进版本”
- 用户指向目录中低于 85/8 门槛的技能，并希望在自己的机器上安装更好的版本
- 用户有一个本地或已克隆的技能目录，并希望安装改进版本，而不是未经处理的原始版本

在以下情况下**不要**触发：只改进而不安装（`skill-auto-improver`）、向上游贡献（`skill-upstream-pr`）、从头创建（`skill-creator`）、普通安装（`asm install <source>`），或一次批量改进多个技能。

## 前置条件

在解析任何内容之前逐项验证。如果任何一项失败，请停止并告知用户。

- PATH 中存在 `asm` 和 `git`
- Python 3 和 `~/.claude/skills/skill-creator/scripts/quick_validate.py` — `skill-auto-improver` 需要它
- 能够通过网络访问 GitHub，以处理仓库和名称形式的输入
- 对安装目标具有写入权限——即所选工具和作用域对应的目录（对于 `claude`：全局为 `~/.claude/skills/`，项目为 `.claude/skills/`）。其他工具会安装到别处；请从 `asm list --json` 或安装输出中获取实际路径。

### 绝不修改用户自己的文件（设计决策）

**每种输入形式都会在 `$(mktemp -d)` 下的临时副本中进行改进——包括本地路径。** 这是有意为之：会重写用户工作副本的安装操作属于用户并未要求的副作用；`skill-auto-improver` 要求在任何编辑之前执行 `git fetch` + `git pull --rebase`（若针对本地路径，这会变基用户的分支）；而复制可确保所有输入形式的行为完全一致。

**权衡：**改进只会体现在已安装的副本中，而不会写入用户的工作树。该副本没有 `origin`，也没有历史记录，因此改进工具要求的仓库同步**不适用**并会被跳过——不会覆盖任何内容，也不会推送任何内容。跳过此步骤时，请明确说明。若要持久保留更改，请引导用户使用 `skill-auto-improver`（针对其路径）或 `skill-upstream-pr`（针对源仓库）。

## 输入

用户通过以下四种形式之一指定**一个**目标技能：本地路径（`skills/foo`）、本地 `SKILL.md` 文件路径、仓库（`https://github.com/owner/repo`、`owner/repo`）或技能名称（`code-review`）。阶段 0 会将所有形式统一解析为一个本地目录 `$SKILL_PATH`。

在阶段 3 之前还需要确定：安装**作用域**（`global` 或 `project`）和目标**工具**（`-p/--tool` — `claude`、`codex`、`agents`，……）。用户未说明其中任何一项时，都应询问；绝不能猜测。在非交互式运行中，如果没有 `--tool`，`asm install` 会直接失败，而 `-y` 并不能涵盖此项。

可选：`--name <alt>` 意图。

## 工作流程

按顺序执行各阶段。不得跳过或重新排序。

### 阶段 0 — 将目标解析为一个本地目录

完整约定见 `references/target-resolution.md`。简而言之，使用 `WORK="$(mktemp -d)"`：

- **本地路径** — 使用 `cp -R` 复制到 `$WORK` 中。若路径指向 `SKILL.md` **文件**，应先取其父目录；`skill-auto-improver` 接受的是目录，而不是文件。
- **仓库** — 使用普通的 `git clone` 克隆到 `$WORK` 中。**绝不使用 `gh repo fork`**——此技能不会执行任何公开的 GitHub 操作。
- **技能名称** — 运行 `asm search "<term>" --available --json`，然后从所选结果的 `installCommand` 中，**逐字复制** `asm install ` 之后的字符串。绝不要手动构造 `github:owner/repo:path`。克隆该字符串所指向的内容。

将 `$SKILL_PATH` 设置为包含所选 `SKILL.md` 的目录。如果检出内容中包含多个该文件且未提供子路径，请列出它们（`find "$WORK" -maxdepth 5 -name SKILL.md -type f`），并**询问要选择哪一个。绝不要猜测。**

为报告记录：提供的标识符、解析得到的安装或克隆 URL，以及上游提交 SHA。

### 阶段 1 — 委托给 skill-auto-improver

此技能不会重新实现改进循环。以 `$SKILL_PATH` 为目标，遵循 `skills/skill-auto-improver/SKILL.md` 中的工作流：阶段 0（基线）、阶段 1（`asm eval --fix` 加 frontmatter 规范化）、阶段 2–4（Gate 1 修复，然后针对 85/8 下限执行类别循环）、阶段 5–7（版本递增、8 次迭代上限、`.asm-improver/report.md`）。

由于目标是一次性副本，需要做两项调整：

- 其中的“编辑前仓库同步”步骤**不适用**。记录 `— repo sync skipped (throwaway copy, no origin)` 并继续。
- `.asm-improver/` 是相对于当前工作目录写入的，因此应在 `$SKILL_PATH` 内将其作为 cwd 运行循环，否则阶段 2 将没有任何内容可收集。

如果基线已经通过两个门槛，改进器会停止且不做任何编辑——这是有效结果，参见边缘情况。

### 阶段 2 — 收集产物，然后清理

**务必在清理前收集。** 所有内容都位于 `$SKILL_PATH/.asm-improver/` 下，并会随临时目录一起消失。读取 `baseline.json`、编号最大的 `iter-N.json` 和 `report.md`；提取 `references/install-and-report.md` 中列出的字段。

只有捕获这些值之后，才能删除不得随技能一起交付的两个产物——由 `asm eval --fix` 留下的 `SKILL.md.bak` 备份，以及 `.asm-improver/`。`asm install` 会递归复制源目录，因此残留内容会进入已安装的技能：

```bash
rm -f "$SKILL_PATH/SKILL.md.bak"
rm -rf "$SKILL_PATH/.asm-improver"
```

两项删除操作都必须限定在 `mktemp -d` 创建的副本中——先确认 `$SKILL_PATH` 仍位于 `$WORK` 内。绝不要让任一命令指向用户提供的路径。

### 阶段 3 — 安装改进后的目录

`skill-auto-improver` 从不重命名，因此改进后的变体会保留原始 frontmatter 中的 `name`，并与已安装的原始版本发生冲突。**`asm install` 遇到冲突时绝不会拒绝执行**——它会自行规划强制覆盖，而使用 `-y` 时，它会在不提示的情况下删除并替换目标目录。`-f` 在这里不会改变任何行为。因此，应在调用前**先**进行探测。相关标志和完整策略见 `references/install-and-report.md`。

```bash
asm list --json    # probe: is this skill already installed for $TOOL / $SCOPE?
```

- **两个名称均不匹配** — 安装；不会改动任何内容。
- **Frontmatter `name` 与 `$TOOL` 匹配** — 即使该条目位于其他作用域，也会设置 force。被删除的是**目标**目录（`$SKILL_PATH` 的 basename，或 `$TOOL`/`$SCOPE` 对应安装基目录下的 `alt`），它不一定是匹配条目的 `path`。明确指出该目标路径以及探测结果中该位置的内容，并在运行 `asm install` **之前获得明确确认**。一旦调用它，就不会再出现可供回退处理的失败。
- **仅目录名称匹配** — 不会删除，但复制操作仍会**合并到**现有目录中：发生冲突的文件会被覆盖，而先前占用者的其他文件会保留在已安装的 skill 中。这种情况也需要确认。
- **选择退出** — 仅在请求时，使用 `--name <alt>` 进行并行安装。它不会禁用 force，因此 `<base>/<alt>` 中已有的任何内容都会被删除并替换；请根据探测结果检查 `alt`。先发出警告：这样两者将共享同一个 frontmatter `name` 和完全相同的触发器，这正是 ASM 审计器会标记的重复触发器风险。

这两个名称来自同一次探测：frontmatter `name` 加上 `$TOOL` 决定是否设置 force，而目标目录名称决定哪些内容会被销毁。

只有在读取探测结果并确认上述任何冲突后，才能执行：

```bash
asm install "$SKILL_PATH" -p "$TOOL" --scope "$SCOPE" --json -y
```

安装 `$SKILL_PATH`，绝不能安装原始源目录——否则会安装未经改进的 skill。从安装命令自身的 `--json` 输出（`.path`）中获取已安装路径；绝不要假定路径为 `~/.claude/skills/`。

### 阶段 4 — 报告，然后清理

填写 `references/install-and-report.md` 中的模板。输出必须说明安装的是**改进后的变体**，而不是已发布的 skill；还必须包含来源信息（提供的标识符、解析后的 URL、上游 SHA）、改进前 → 改进后的数值、所采取的冲突处理路径及其替换的内容，以及安装路径。

仅在报告完成后删除 `$WORK`。

## 步骤完成报告（强制）

在每个阶段后输出一个紧凑的状态块：

```
◆ Phase N — [phase name] ([N of 5])
··································································
  [check 1]:         √ pass
  [check 2]:         × fail — [reason]
  Result:            PASS | FAIL | PARTIAL
```

使用 `√` 表示通过，`×` 表示失败，`—` 表示上下文。各阶段的检查项如下：

- **阶段 0** — `Form identified`、`Copied to temp`、`SKILL_PATH unambiguous`、`Provenance recorded`
- **阶段 1** — `Baseline captured`、`Improver ran`、`Repo sync skipped`、`Gates cleared or stop reason known`
- **阶段 2** — `Metrics harvested`、`.bak removed`、`.asm-improver removed`、`Deletions confined to temp`
- **阶段 3** — `Collision probed before install`、`Overwrite confirmed (if any)`、`Tool and scope supplied`、`Install succeeded`
- **阶段 4** — `Report printed`、`Provenance shown`、`Temp dir removed`

## 验收标准

- 恰好解析出一个目标，来源可以是本地路径、仓库或技能名称
- `$SKILL_PATH` 是一个包含 `SKILL.md` 的目录，位于通过 `mktemp -d` 创建的副本中——用户的文件不会被修改
- 名称解析原样复制 `installCommand`；不手动构造 `github:` URL
- 仓库解析使用普通的 `git clone`；不 fork、不 push，也不执行任何公开的 GitHub 操作
- 存在多个 `SKILL.md` 候选项且未提供路径 → 询问用户，而不是猜测
- `skill-auto-improver` 在 `$SKILL_PATH` 上运行；清理前读取 `baseline.json`、`iter-N.json` 和 `report.md`
- 安装前移除 `SKILL.md.bak` 和 `.asm-improver/`，且两项删除操作都仅限于 `$WORK`
- `asm install` 指向 `$SKILL_PATH`——即改进后的目录——绝不指向原始来源，并同时提供 `-p/--tool` 和 `--scope`
- 在运行 `asm install` **之前**探测冲突；若匹配，则仅在获得明确确认后覆盖，或在发出警告后使用 `--name <alt>`；报告中说明采用了哪种方式
- 报告列出安装路径，说明安装的是改进版本，并展示改进前 → 改进后的结果以及来源信息
- 仅在报告完成后移除 `$WORK`

### 预期输出

- 在所选作用域下安装一个技能，其中包含改进后的 `SKILL.md`
- 按照 `references/install-and-report.md` 生成报告，以“installed an improved variant of `<name>`”开头，并包含改进前 → 改进后的数值
- 已安装的技能内不存在 `.asm-improver/` 和 `SKILL.md.bak`
- 不更改用户自己的技能目录，也不触及远程 GitHub 状态

### 示例

对初始分数为 71 的技能执行“Install code-review, improved”后，结果如下：

```
◆ Installed an improved variant of `code-review`
  Installed to:    ~/.claude/skills/code-review   (read from install --json .path)
  Install path:    confirmed overwrite of the previous install at that path
  Tool / scope:    claude / global
  Supplied as:     code-review
  Resolved from:   github:owner/repo:skills/code-review @ a1b2c3d
  Overall score:   71 (C) → 92 (A)   Min category: 5 → 8
  Version:         1.0.0 → 1.3.0     Iterations: 3 of 8
```

## 边缘情况

- **基线已通过两个门槛**——改进器停止且不进行编辑。第 2 阶段的清理和第 3 阶段的探测仍会运行：改进器的第 0 阶段会先写入 `.asm-improver/`，然后才确定无需编辑，因此应先清理，再探测冲突。安装**未经更改的原始版本**，并明确报告无需改进，同时列出基线分数。绝不能暗示发生了实际并不存在的分数变化。
- **改进器最终处于 BLOCKER 状态**（达到 8 次迭代或停滞）——结果优于基线，但仍低于最低标准。展示阻塞项列表，并询问是安装部分改进的结果还是中止。绝不能静默安装。
- **本地路径目标**——在副本上进行改进，因此用户的目录树不受影响，并跳过仓库同步。引导用户使用 `skill-auto-improver` 或 `skill-upstream-pr` 来持久化更改。
- **克隆内容中存在多个 `SKILL.md` 文件**——逐一列出并询问用户。绝不批量处理，也绝不猜测。
- **`asm search` 未返回结果，或返回多个同等合理的匹配项**——展示候选项并询问用户；绝不安装第一个搜索结果。
- **目标没有 frontmatter**——`asm eval --fix` 无法添加它。报告问题并停止；不要把无法改进的技能当作已改进的技能安装。
- **冲突项是来自其他来源的同名技能**——安装操作会静默替换他人的技能，不报错也不提示。探测是发现该问题的唯一机会：在运行 `asm install` 之前，指出目标目录以及探测到的相关信息（`name`、`dirName`、`provider`、`scope`），请求确认，并提供 `--name <alt>` 选项。
- **在收集结果前移除临时目录**——指标将丢失，无法满足展示改进前后对比的要求。始终在第 2 阶段、清理之前收集结果。
- **解析期间克隆失败或磁盘故障**——停止操作、移除 `$WORK` 并报告。绝不安装不完整的检出内容。

## 参考资料

- `references/target-resolution.md` — 归一化为一个本地 `$SKILL_PATH` 的三种输入形式
- `references/install-and-report.md` — 安装标志、冲突策略、采集的字段、报告模板
- `skills/skill-auto-improver/SKILL.md` — 此技能委托执行的改进循环
- `skills/skill-upstream-pr/SKILL.md` — 当改进应回馈至源仓库时使用的同级路径
- `asm install --help` 和 `asm search --help` — 标志参考资料