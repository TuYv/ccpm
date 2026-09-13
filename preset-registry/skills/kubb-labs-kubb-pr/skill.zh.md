---
name: pr
description: Open or update a pull request in this monorepo. Covers the pre-push checks, the changeset decision, Conventional Commit titles, how to fill the PR template, and what to do once CI runs. Use when asked to open a PR, push a branch for review, fix a red PR, or judge whether a branch is ready to merge.
---
# PR 技能

将分支从“代码已编写”推进到“审阅者可以合并”。按顺序完成各个步骤。当无法完成某一步时，要在 PR 正文中说明，而不是悄悄跳过。

## 适用场景

- 发起 pull request，或推送一个预期将发起 pull request 的分支。
- 根据审阅意见或失败的 CI 运行结果更新 pull request。
- 回答某个分支是否已准备好合并。

## 保持所有输出简短

标题、正文、提交、审阅回复以及你在聊天中的汇报都遵循同一条规则：先说明变更内容，只保留读者需要采取行动的信息，删去其余内容。PR 正文应控制在 150 个单词以内。对所有面向他人书写的内容运行 `humanizer` 技能。

## 1. 确认分支

绝不要提交到 `main`。检查当前位置；如果仍在 `main` 上，则从最新的 `main` 创建分支：

```bash
git status
git branch --show-current
git fetch origin main
git switch -c <type>/<short-slug> origin/main
```

使用计划在标题中采用的 Conventional Commit 类型作为前缀，例如 `feat/`、`fix/`、`docs/`、`chore/`、`refactor/`、`test/` 或 `perf/`。

## 2. 推送前运行检查

```bash
pnpm format && pnpm lint:fix
pnpm typecheck
pnpm test
```

当你修改了包源代码时，还要运行 `pnpm build`，因为各个包通过构建输出相互解析。

推送前所有检查都必须通过。修复失败的根本原因。不要为了让运行结果变绿而禁用 lint 规则、放宽类型或跳过测试。

## 3. 决定是否需要 changeset

会进入已发布包的变更需要 changeset。仅限于文档、CI、测试或 agent 文件的变更不需要。

```bash
pnpm changeset
```

修复选择 `patch`，向后兼容的功能选择 `minor`，破坏性变更选择 `major`。摘要应面向阅读发行说明的用户，而不是阅读差异的审阅者。`changelog` 技能规定了措辞约定，`/changeset` 会完成这一步。

## 4. 覆盖连带影响

你修改的选项或公共 API 会出现在比差异中更多的位置：

- 按照 `AGENTS.md` 的说明，在同一个 PR 中更新对应的 kubb.dev 页面。
- 确保文档中的默认值与插件 `plugin.ts` 中的解构默认值一致。
- 绝不要手动编辑 `tools/claude/.claude-plugin/plugin.json`。发布流程会通过 `pnpm sync:plugin-version`，从 `tools/claude/package.json` 同步其版本。

## 5. 提交

每个逻辑变更使用一个 Conventional Commit，采用祈使语气，末尾不加句号：

```
feat(core): add a plugin resolver cache
```

每次提交前检查 `git diff --cached`。绝不要提交密钥、令牌、`.env` 文件或构建产物。使用 pnpm 重新生成锁文件，不要手动编辑锁文件。

## 6. 编写标题和正文

### 标题

使用一行 Conventional Commit，采用祈使语气，不超过 72 个字符，末尾不加句号。它会成为 squash merge 提交，因此要面向未来阅读变更日志的人来编写。

根据已经命名的分支读取标题：

1. 从分支前缀中获取类型，例如 `feat/`、`fix/`、`docs/`、`chore/`、`refactor/`、`test/` 或 `perf/`。
2. 将 kebab-case slug 转换为祈使语气、一般现在时的句子。
3. 当变更集中在一个包中时，在标题中添加括号包围的 scope。

`feat/plugin-resolver-cache` 变为 `feat(core): add a plugin resolver cache`。

将 issue 编号放在正文中，使用 `Closes #123`，不要放在标题中。

### 正文

填写 `.github/pull_request_template.md`。保留其中的标题及其顺序，将每条 HTML
注释替换为实际内容，不要删除任何部分。正文应让审阅者读一遍即可理解。

在 **Changes** 下写一到三句话。先说明做了什么，再说明原因。指出审阅者应首先查看的包或文件。如果该 PR 会关闭一个 issue，添加 `Closes #123`。

在 **Checklist** 下，仅勾选你确实在此分支上完成的事项。未勾选的复选框下方应附上一行原因，这样更诚实且对审阅者有帮助。未经验证就勾选会损害审阅者的信任，这是这里绝不能做的事。

当此分支新增了 `.changeset/` 文件时，勾选 changeset 复选框；当没有已发布的包发生变化时，勾选文档复选框。

在打开 PR 前，对正文运行 `humanizer` skill，并修复它指出的问题。这里最常见的问题包括：开头重复标题、使用 `comprehensive` 和 `robust` 等词、句中加粗，以及用短横线连接两个分句。删掉审阅者已经知道的背景、被排除的方案，以及任何没有提到文件、命令或结果的句子。

### 如何测试

三行，替换占位符：

- 步骤 1：[清晰的复现步骤]
- 步骤 2：[下一步]
- 步骤 3：[预期结果]

使用真实的命令或路径，并从干净的 checkout 开始。修正别人提供的步骤，不要原样粘贴：补充缺失的前置条件，按顺序排列步骤，写明预期结果。如果无法从 diff 推导出测试步骤，请询问。对于可见变更，添加截图；如果修改了已有内容，同时添加修改前和修改后的截图。

### 影响

用一行说明影响对象：使用已发布包的用户、消费生成输出的用户，或仓库之外无人受到影响。如果变更会破坏现有使用方式，写明迁移步骤。

## 7. 推送并打开 PR

```bash
git fetch origin main
git pull --ff-only
git push -u origin <branch>

gh pr create \
  --base main \
  --title "<conventional commit title>" \
  --body-file <body>.md \
  --assignee @me
```

使用 `gh` CLI，而不是 GitHub MCP server 或其他 bot token，这样 PR 会由执行命令的人创建，并出现在其自己的列表中。

以待审阅状态打开 PR，不要创建为草稿。分支完成且检查通过后，使用 `gh pr ready` 将草稿标记为准备审阅。

添加仓库已有的标签。`gh label list` 可以显示这些标签；自行发明标签不如不添加标签。

合并时压缩 commits 并删除分支，`gh pr merge --squash --delete-branch` 可以一步完成。当你没有合并权限时，在正文中说明该 PR 需要被压缩合并。

一个 PR 只做一件事。如果过程中发现无关工作，将其排除，并在正文中提及。

## 8. CI 运行后

无论 PR 处于何种审查状态，红色的 PR 都意味着现在需要处理。

阅读失败的 job，在本地复现失败，修复原因，然后再次推送。只有在失败从未进入测试主体时（例如 checkout 或 install 错误），或者同一提交之前曾经通过时，重新运行 job 才有意义。

用一两句话回复每条审查评论：说明你改了什么，以及审查者如何检查。对于小范围的本地请求，直接推送修复。对于较大的请求，回复你提议的方案，由作者决定。

## 约束

- 将 diff 控制在请求范围内。顺手进行的重构应放在单独的 PR 中。
- 绝不要对可能已被其他人 checkout 的分支执行强制推送。
- 在推送前，对 PR 正文、changeset 以及 diff 中面向用户的 markdown 运行 `humanizer` skill。
- 在推送前，对生成的代码运行 `deslop` skill。
- 标题、正文、提交以及 changeset 使用美国英语。

## 相关 skills

| Skill | 用于 |
| --- | --- |
| [changelog](../changelog/SKILL.md) | changeset 和发布说明的措辞 |
| [deslop](../deslop/SKILL.md) | 去除 diff 中代码里的 AI 痕迹 |
| [humanizer](../humanizer/SKILL.md) | 去除 diff 中 prose 里的 AI 痕迹 |
| [jsdoc](../jsdoc/SKILL.md) | 为新增或变更的公共 API 编写文档 |