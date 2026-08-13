---
name: setup-matt-pocock-skills
description: Configure this repo for the engineering skills — set up its issue tracker, triage label vocabulary, and domain doc layout. Run once before first use of the other engineering skills.
disable-model-invocation: true
---
# 配置 Matt Pocock 的技能

搭建工程技能所依赖的每个仓库配置：

- **Issue tracker** — 问题（issue）存放位置（默认使用 GitHub；同时也内置支持本地 Markdown）
- **Triage labels** — 五个标准分诊角色所使用的标签字符串
- **Domain docs** — `CONTEXT.md` 和 ADR 所在位置，以及读取它们的消费规则

这是一个基于提示词驱动的技能，不是确定性脚本。先探索、呈现你发现的内容、与用户确认，然后再写入。

## 1. 流程

### 1. 探索

查看当前仓库以了解其初始状态。读取现有内容；不要臆测：

- `git remote -v` 和 `.git/config` — 是否是 GitHub 仓库？是哪一个？
- 仓库根目录下的 `AGENTS.md` 和 `CLAUDE.md` — 是否存在？其中是否已有 `## Agent skills` 区块？
- 仓库根目录下的 `CONTEXT.md` 和 `CONTEXT-MAP.md`
- `docs/adr/` 以及任何 `src/*/docs/adr/` 目录
- `docs/agents/` — 该技能的先前输出是否已经存在？
- `.scratch/` — 本地 Markdown 问题跟踪约定是否已经在使用的迹象
- `triage` 技能是否已安装？（在本目录旁边是否有 `triage` 技能文件夹，或在可用技能中是否有 `triage`。）这决定 Section B 是否执行。
- Monorepo 信号 — `pnpm-workspace.yaml`、`package.json` 中的 `workspaces` 字段，或存在每个都有 `src/` 的 `packages/*`。仅在真正庞大的多包仓库中出现；它们不存在通常表示单上下文，这是几乎所有仓库的情况。

### 2. 呈现发现并询问

先总结哪些有、哪些没有。然后按顺序逐节处理——一节一条答案，再进入下一节。

每节请先给出建议答案，便于用户一字采纳；仅当分支选择确实不同才给出一行解释；若探索已明确结果则跳过该节（当 `triage` 未安装时跳过 B 节；当不存在 monorepo 时跳过 C 节）。

**Section A — Issue tracker。**

> 说明：`issue tracker` 是该仓库问题存放的位置。像 `to-tickets`、`triage` 和 `to-spec` 这样的技能会读取和写入该位置，它们需要知道是调用 `gh issue create`，还是向 `.scratch/` 下写 markdown 文件，或按你描述的其他流程执行。请选择该仓库实际跟踪工作的地方。

默认策略：这些技能是为 GitHub 设计的。如果 `git remote` 指向 GitHub，则建议使用该方式；如果 `git remote` 指向 GitLab（`gitlab.com` 或自建 GitLab 主机），则建议使用 GitLab。否则（或用户偏好其他方式）提供以下选项：

- **GitHub** — 问题存放在该仓库的 GitHub Issues 中（使用 `gh` CLI）
- **GitLab** — 问题存放在该仓库的 GitLab Issues 中（使用 [`glab`](https://gitlab.com/gitlab-org/cli) CLI）
- **Local markdown** — 问题存放为本仓库 `.scratch/<feature>/` 下的文件（适合个人项目或无远端仓库）
- **Other**（Jira、Linear 等）— 请用一段文字描述你的流程；技能将把它以自由文本形式记录下来

将选择写入 `docs/agents/issue-tracker.md`。GitHub 与 GitLab 的模板都包含一个“PRs as a request surface”开关，默认值为**关闭**——保持关闭且不要提起；后续若用户想把外部 PR 纳入 triage 队列，可在文件中自行打开该开关。

**Section B — Triage 标签词汇。** 如果探索发现 `triage` 技能未安装，请直接跳过此节——未安装的技能无需标签。

如果已安装，固定只问一个问题：

> 你是否要保留默认的 triage 标签？（推荐：**是**）

默认值是五个标准角色，对应标签字符串与角色名完全一致：`needs-triage`、`needs-info`、`ready-for-agent`、`ready-for-human`、`wontfix`。若选择是，按原样写入。只有用户选择否——通常是因为其跟踪器已使用其他名称（例如 `needs-triage` 使用 `bug:triage`）——才收集替代映射，以让 `triage` 使用已有标签而非创建副本。

**Section C — Domain docs。** 默认使用**单上下文**布局：仓库根目录下一个 `CONTEXT.md` + `docs/adr/`。这适用于几乎所有仓库，直接写入，无需询问。

仅当探索发现 monorepo 信号时，才提供**多上下文**方案——一个根目录下的 `CONTEXT-MAP.md` 指向各上下文的 `CONTEXT.md`；然后确认用户想要的布局。

### 3. 确认并编辑

展示给用户以下草案：

- 要添加到 `CLAUDE.md` 或 `AGENTS.md`（见第 4 步选择规则）的 `## Agent skills` 区块
- `docs/agents/issue-tracker.md`、`docs/agents/domain.md` 及 `docs/agents/triage-labels.md`（仅当 `triage` 已安装时）内容

让用户在写入前先编辑。

### 4. 写入

**选择要编辑的文件：**

- 若 `CLAUDE.md` 存在，则编辑它。
- 否则若 `AGENTS.md` 存在，则编辑它。
- 两者都不存在时，询问用户要创建哪一个——不要替用户替他选定。

当 `CLAUDE.md` 已存在且选定时，不要创建 `AGENTS.md`（反之亦然）——始终只编辑已有的那个文件。

如果所选文件中已存在 `## Agent skills` 区块，请就地更新该区块内容，而不是追加重复内容。不要覆盖用户对相邻章节的编辑。

该区块为：

```markdown
## Agent skills

### Issue tracker

[one-line summary of where issues are tracked]. See `docs/agents/issue-tracker.md`.

### Triage labels

[one-line summary of the label vocabulary]. See `docs/agents/triage-labels.md`.

### Domain docs

[one-line summary of layout — "single-context" or "multi-context"]. See `docs/agents/domain.md`.
```

仅在安装了 `triage` 且已执行 Section B 时，才包含 `### Triage labels` 子区块，并写入 `docs/agents/triage-labels.md`。否则两者都省略。

然后使用本技能目录中的种子模板作为起点写入文档文件：

- [issue-tracker-github.md](./issue-tracker-github.md) — GitHub 问题追踪器
- [issue-tracker-gitlab.md](./issue-tracker-gitlab.md) — GitLab 问题追踪器
- [issue-tracker-local.md](./issue-tracker-local.md) — 本地 Markdown 问题追踪器
- [triage-labels.md](./triage-labels.md) — 标签映射（仅当 `triage` 已安装）
- [domain.md](./domain.md) — Domain 文档消费规则与布局

对于“其他”问题追踪器，使用用户描述从头编写 `docs/agents/issue-tracker.md`。

### 5. 完成

告知用户设置已完成，并说明哪些工程技能将从这些文件读取。提醒他们之后可以直接编辑 `docs/agents/*.md`；仅在需要切换问题追踪器或想从头重置时才需要重新运行此技能。
