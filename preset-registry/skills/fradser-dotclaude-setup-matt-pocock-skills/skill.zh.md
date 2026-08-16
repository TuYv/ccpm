---
name: setup-matt-pocock-skills
description: Configures a repo for the engineering skills — issue tracker, triage label vocabulary, and domain doc layout. Use once before first use of the other engineering skills, when the user says "set up the skills" or "initialize repo config".
disable-model-invocation: true
---
# 设置 Matt Pocock 的 Skills

搭建这些工程 Skills 所依赖的、针对每个仓库的配置：

- **问题跟踪器** — 问题存放的位置（默认使用 GitHub；也原生支持本地 Markdown）
- **分类标签** — 用于五种标准分类角色的字符串
- **领域文档** — `CONTEXT.md` 和 ADR 的存放位置，以及使用方读取它们时应遵循的规则

这是一个由提示词驱动的 Skill，而不是一个确定性脚本。先探索并展示你的发现，向用户确认，然后再写入。

## 流程

### 1. 探索

查看当前仓库以了解其初始状态。读取所有现有内容；不要自行假设：

- `git remote -v` 和 `.git/config` — 这是一个 GitHub 仓库吗？具体是哪一个？
- 仓库根目录中的 `AGENTS.md` 和 `CLAUDE.md` — 是否存在其中任何一个？其中是否已经有 `## Agent skills` 章节？
- 仓库根目录中的 `CONTEXT.md` 和 `CONTEXT-MAP.md`
- `docs/adr/` 以及所有 `src/*/docs/adr/` 目录
- `docs/agents/` — 这个 Skill 之前的输出是否已经存在？
- `.scratch/` — 是否有迹象表明已经在使用本地 Markdown 问题跟踪器约定
- 是否安装了 `triage` Skill？（与当前 Skill 同级的 `triage` Skill 文件夹，或者可用 Skills 中包含 `triage`。）这决定是否需要执行 B 部分。
- Monorepo 特征 — `pnpm-workspace.yaml`、`package.json` 中的 `workspaces` 字段，或者包含自身 `src/` 的非空 `packages/*`。只有真正的大型多包仓库才应使用多上下文；如果不存在这些特征，则表示使用单一上下文，而绝大多数仓库都是如此。

### 2. 展示发现并提问

总结当前已有和缺失的内容。然后按顺序逐一处理各部分——每次只处理一个部分并获取一个回答，然后再进入下一部分。

每个部分都先给出推荐答案，以便用户只需一个词即可接受。只有当选项确实存在分支时，才提供一行说明；如果探索结果已经确定了某部分，则完全跳过该部分（未安装 `triage` 时跳过 B 部分，不是 Monorepo 时跳过 C 部分）。

**A 部分 — 问题跟踪器。**

> 说明：“问题跟踪器”是这个仓库中存放问题的位置。`to-tickets`、`triage`、`to-spec` 和 `qa` 等 Skills 会从中读取内容并向其中写入内容——它们需要知道应该调用 `gh issue create`、在 `.scratch/` 下写入 Markdown 文件，还是遵循你所描述的其他工作流。请选择你在这个仓库中实际用于跟踪工作的地方。

默认立场：这些 Skills 是为 GitHub 设计的。如果某个 `git remote` 指向 GitHub，则建议使用 GitHub。如果某个 `git remote` 指向 GitLab（`gitlab.com` 或自行托管的主机），则建议使用 GitLab。否则（或者用户有其他偏好），使用 AskUserQuestion 工具提供以下选项：

- **GitHub** — 问题存放在该仓库的 GitHub Issues 中（使用 `gh` CLI）
- **GitLab** — 问题存放在该仓库的 GitLab Issues 中（使用 [`glab`](https://gitlab.com/gitlab-org/cli) CLI）
- **本地 Markdown** — 问题以文件形式存放在此仓库的 `.scratch/<feature>/` 下（适合个人项目或没有远程仓库的项目）
- **其他**（Jira、Linear 等）— 用户通过该工具的 “Other” 字段，用一段文字描述工作流；该 Skill 会将其记录为自由格式的文本

将选择记录在 `docs/agents/issue-tracker.md` 中。GitHub 和 GitLab 模板带有一个“将 PR 作为请求入口”标志，默认处于**关闭**状态——保持关闭，不要主动提起；如果用户希望将外部 PR 纳入分流队列，可以稍后在文件中启用该标志。

**B 节——分流标签词汇。** 如果未安装 `triage` skill（探索阶段已获知），则完全跳过本节——未安装的 skill 不需要标签。

如果已安装，请通过 AskUserQuestion 工具只询问一个问题：

> “你想保留默认的分流标签吗？”——选项：保留默认值（推荐）/ 使用我自己的标签名称

默认值是五个规范角色，每个标签字符串都与其名称相同：`needs-triage`、`needs-info`、`ready-for-agent`、`ready-for-human`、`wontfix`。如果回答为**是**，则按原样写入。只有在用户回答否时——通常是因为其跟踪器已经使用了其他名称（例如，用 `bug:triage` 表示 `needs-triage`）——才收集覆盖值，以便 `triage` 应用现有标签，而不是创建重复标签。

**C 节——领域文档。** 默认使用**单上下文**——在仓库根目录放置一个 `CONTEXT.md` 和 `docs/adr/`。这适用于几乎所有仓库；无需询问，直接写入。

仅当探索阶段发现 monorepo 信号时，才提供**多上下文**方案——使用根目录中的 `CONTEXT-MAP.md` 指向各上下文的 `CONTEXT.md` 文件。然后使用 AskUserQuestion 工具确认用户想要哪种布局。

### 3. 确认并编辑

向用户展示以下内容的草稿：

- 要添加到所编辑的 `CLAUDE.md` / `AGENTS.md` 文件中的 `## Agent skills` 区块（选择规则见第 4 步）
- `docs/agents/issue-tracker.md`、`docs/agents/domain.md` 和 `docs/agents/triage-labels.md` 的内容（最后一个仅在安装了 `triage` 时展示）

允许用户在写入前进行编辑。

### 4. 写入

**选择要编辑的文件：**

- 如果 `CLAUDE.md` 存在，则编辑它。
- 否则，如果 `AGENTS.md` 存在，则编辑它。
- 如果两者都不存在，使用 AskUserQuestion 工具询问要创建哪一个——不要替用户做出选择。

当 `CLAUDE.md` 已存在时，绝不要创建 `AGENTS.md`（反之亦然）——始终编辑已经存在的那个文件。

如果所选文件中已存在 `## Agent skills` 区块，则就地更新其内容，而不是追加重复区块。不要覆盖用户对周边章节所做的编辑。

该区块：

```markdown
## Agent skills

### Issue tracker

[one-line summary of where issues are tracked]. See `docs/agents/issue-tracker.md`.

### Triage labels

[one-line summary of the label vocabulary]. See `docs/agents/triage-labels.md`.

### Domain docs

[one-line summary of layout — "single-context" or "multi-context"]. See `docs/agents/domain.md`.
```

仅当已安装 `triage` 且已执行 B 节时，才包含 `### Triage labels` 子区块并写入 `docs/agents/triage-labels.md`。否则，两者都省略。

然后以此 skill 文件夹中的种子模板为起点，写入文档文件：

- [issue-tracker-github.md](./issue-tracker-github.md)——GitHub issue 跟踪器
- [issue-tracker-gitlab.md](./issue-tracker-gitlab.md)——GitLab issue 跟踪器
- [issue-tracker-local.md](./issue-tracker-local.md)——本地 Markdown issue 跟踪器
- [triage-labels.md](./triage-labels.md)——标签映射（仅当已安装 `triage` 时）
- [domain.md](./domain.md)——领域文档使用方规则和布局

对于“其他”问题跟踪器，请根据用户的描述从头编写 `docs/agents/issue-tracker.md`。

## 关键要求：写入前必须确认，绝不重复

此流程由提示驱动：展示发现结果，逐节询问，展示草稿，并在写入任何内容之前让用户编辑。切勿在 `CLAUDE.md` 已存在时创建 `AGENTS.md`（反之亦然）；应原地更新现有的 `## Agent skills` 块，而不是追加重复内容。

### 5. 完成

告知用户设置已完成，并说明哪些工程技能现在会读取这些文件。提醒用户之后可以直接编辑 `docs/agents/*.md`——仅当他们想要切换问题跟踪器或从头重新开始时，才需要重新运行此技能。