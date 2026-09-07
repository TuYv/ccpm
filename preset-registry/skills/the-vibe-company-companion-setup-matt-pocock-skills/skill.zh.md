---
name: setup-matt-pocock-skills
description: "Configure this repo for the engineering skills: set up its issue tracker, triage label vocabulary, and domain doc layout. Run once before first use of the other engineering skills."
disable-model-invocation: true
---
# 设置 Matt Pocock 的技能

搭建工程技能所假定的仓库级配置：

- **问题追踪器**：issue 的存放位置（默认为 GitHub；本地 markdown 也开箱即用）
- **分诊标签**：用于五个标准分诊角色的字符串
- **领域文档**：`CONTEXT.md` 和 ADR 的存放位置，以及读取它们的消费者规则

这是一个由提示驱动的技能，而非确定性脚本。先探索、展示你的发现、与用户确认，然后再写入。

## 流程

### 1. 探索

查看当前仓库以了解其初始状态。读取已存在的内容；不要凭空假设：

- `git remote -v` 和 `.git/config`：这是一个 GitHub 仓库吗？是哪一个？
- 仓库根目录下的 `AGENTS.md` 和 `CLAUDE.md`：两者中是否存在其中一个？其中是否已经有 `## Agent skills` 章节？
- 仓库根目录下的 `CONTEXT.md` 和 `CONTEXT-MAP.md`
- `docs/adr/` 以及任何 `src/*/docs/adr/` 目录
- `docs/agents/`：此技能先前的输出是否已存在？
- `.scratch/`：表示本地 markdown 问题追踪器约定已在使用中的迹象
- `triage` 技能是否已安装？（此技能旁的 `triage` 技能文件夹，或你可用技能列表中的 `triage`。）这决定了 B 节是否运行。
- Monorepo 信号：`pnpm-workspace.yaml`、`package.json` 中的 `workspaces` 字段，或已填充且拥有自己 `src/` 的 `packages/*`。这些只存在于真正大型的多包仓库中；它们缺失则意味着单上下文，而几乎所有仓库都属于这种情况。

### 2. 呈现发现并进行询问

总结哪些已存在、哪些缺失。然后按顺序处理各节。一次一节、得到一个回答，再进行下一节。

每节都以推荐答案开头，让用户用一个词就能接受。只在选择确实存在分叉时才给出单行说明；当探索阶段已经敲定结果时，整节跳过（未安装 `triage` 时的 B 节、无 monorepo 时的 C 节）。

**A 节：问题追踪器。**

> 说明：「问题追踪器」是指该仓库的 issue 所在的地方。`to-tickets`、`triage` 和 `to-spec` 等技能会对它进行读写。它们需要知道是要调用 `gh issue create`、在 `.scratch/` 下写入一个 markdown 文件，还是遵循你所描述的其他工作流。请选择你实际为该仓库追踪工作的地方。

默认姿态：这些技能是为 GitHub 设计的。如果某个 `git remote` 指向 GitHub，就提议使用 GitHub。如果某个 `git remote` 指向 GitLab（`gitlab.com` 或自托管主机），就提议使用 GitLab。否则（或者用户另有偏好时），提供以下选项：

- **GitHub**：issue 存放在仓库的 GitHub Issues 中（使用 `gh` CLI）
- **GitLab**：issue 存放在仓库的 GitLab Issues 中（使用 [`glab`](https://gitlab.com/gitlab-org/cli) CLI）
- **本地 markdown**：issue 以文件形式存放在本仓库的 `.scratch/<feature>/` 下（适合单人项目或没有远程仓库的仓库）
- **其他**（Jira、Linear 等）：请用户用一段话描述该工作流；技能会将其记录为自由格式的文字

将该选择记录在 `docs/agents/issue-tracker.md` 中。GitHub 和 GitLab 模板带有「PR 作为请求入口」标志，默认**关闭**。保持其关闭且不要主动提及：希望把外部 PR 纳入分诊队列的用户，可以稍后自行在文件中翻转该标志。

**B 节：分诊标签词汇。**如果未安装 `triage` 技能（探索阶段已告知你），则整节跳过，因为未安装的技能不需要标签。

如果已安装，只问一个问题：

> 是否保留默认的分诊标签？（推荐：**是**）

默认值是五个标准角色，每个标签字符串与其名称相同：`needs-triage`、`needs-info`、`ready-for-agent`、`ready-for-human`、`wontfix`。回答**是**时，原样写入。仅当用户回答否时——通常是因为他们的追踪器已经在使用其他名称（例如用 `bug:triage` 代替 `needs-triage`）——才收集覆盖值，让 `triage` 使用现有标签而不是创建重复标签。

**C 节：领域文档。**默认为**单上下文**（仓库根目录下一个 `CONTEXT.md` + `docs/adr/`）。这几乎适用于所有仓库；无需询问直接写入。

仅当探索发现了 monorepo 信号时，才提供**多上下文**选项（根目录下的 `CONTEXT-MAP.md` 指向各上下文的 `CONTEXT.md` 文件）。然后确认他们想要哪种布局。

### 3. 确认与编辑

向用户展示以下内容的草稿：

- 将添加到正在编辑的 `CLAUDE.md` / `AGENTS.md` 中的 `## Agent skills` 块（选择规则见第 4 步）
- `docs/agents/issue-tracker.md`、`docs/agents/domain.md` 和 `docs/agents/triage-labels.md`（最后一个仅在安装了 `triage` 时才有）的内容

写入之前先让他们修改。

### 4. 写入

**选择要编辑的文件：**

- 如果 `CLAUDE.md` 已存在，编辑它。
- 否则，如果 `AGENTS.md` 已存在，编辑它。
- 如果两者都不存在，询问用户要创建哪一个；不要替他们做选择。

当 `CLAUDE.md` 已存在时，绝不要创建 `AGENTS.md`（反之亦然）；始终编辑已有的那个文件。

如果所选文件中已存在 `## Agent skills` 块，就原地更新其内容，而不是追加一个重复的块。不要覆盖用户对周围各节的修改。

该块：

```markdown
## Agent skills

### Issue tracker

[one-line summary of where issues are tracked]. See `docs/agents/issue-tracker.md`.

### Triage labels

[one-line summary of the label vocabulary]. See `docs/agents/triage-labels.md`.

### Domain docs

[one-line summary of layout: "single-context" or "multi-context"]. See `docs/agents/domain.md`.
```

只有在安装了 `triage` 且 B 节已运行的情况下，才包含 `### Triage labels` 子块并写入 `docs/agents/triage-labels.md`。否则两者均省略。

然后，以本技能文件夹中的种子模板为起点编写各文档文件：

- [issue-tracker-github.md](./issue-tracker-github.md)：GitHub 问题追踪器
- [issue-tracker-gitlab.md](./issue-tracker-gitlab.md)：GitLab 问题追踪器
- [issue-tracker-local.md](./issue-tracker-local.md)：本地 markdown 问题追踪器
- [triage-labels.md](./triage-labels.md)：标签映射（仅在安装了 `triage` 时）
- [domain.md](./domain.md)：领域文档消费者规则 + 布局

对于「其他」类问题追踪器，根据用户的描述从零编写 `docs/agents/issue-tracker.md`。

### 5. 完成

告诉用户设置已完成，并告知哪些工程技能现在会从这些文件中读取信息。提醒他们以后可以直接编辑 `docs/agents/*.md`；只有在想要更换问题追踪器或从头重来时，才需要重新运行此技能。
