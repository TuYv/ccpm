---
name: pr
description: Open or update a pull request in this monorepo. Covers the pre-push checks, the changeset decision, Conventional Commit titles, how to fill the PR template, and what to do once CI runs. Use when asked to open a PR, push a branch for review, fix a red PR, or judge whether a branch is ready to merge.
---
# PR 技能

按顺序完成以下步骤，将分支从“代码已编写”推进到“审阅者可以合并”。当无法完成某一步时，应在 PR 正文中说明，而不是悄悄跳过。

## 使用时机

- 发起拉取请求，或推送一个预计会发起拉取请求的分支。
- 根据审阅意见或失败的 CI 运行结果更新拉取请求。
- 回答某个分支是否已准备好合并。

## 1. 确认分支

绝不要向 `main` 提交。确认当前位置；如果仍在 `main` 上，则从最新的 `main` 创建分支：

```bash
git status
git branch --show-current
git fetch origin main
git switch -c <type>/<short-slug> origin/main
```

使用计划在标题中采用的同一个 Conventional Commit 类型，因此可以使用 `feat/`、`fix/`、`docs/`、`chore/`、`refactor/`、`test/` 或 `perf/`。

## 2. 推送前运行检查

```bash
pnpm format && pnpm lint:fix
pnpm typecheck
pnpm test
```

当修改了包源代码时，也要运行 `pnpm build`，因为各个包通过构建输出相互解析。

推送前所有检查都必须通过。修复失败的根本原因。不要为了让运行结果变绿而禁用 lint 规则、放宽类型限制或跳过测试。

## 3. 决定是否添加 changeset

涉及已发布包的变更需要 changeset。仅限于文档、CI、测试或 agent 文件的变更不需要。

```bash
pnpm changeset
```

修复选择 `patch`，向后兼容的功能选择 `minor`，破坏性变更选择 `major`。摘要应面向阅读发布说明的用户编写，而不是面向阅读差异的审阅者编写。`changelog` 技能规定了措辞规范，`/changeset` 会替你完成这一步。

## 4. 覆盖连带影响

你修改的选项或公共 API 在差异之外还会出现在更多地方：

- 按照 `AGENTS.md` 的说明，在同一个 PR 中更新对应的 kubb.dev 页面。
- 确保文档中的默认值与插件 `plugin.ts` 中的解构默认值一致。
- 绝不要手动编辑 `tools/claude/.claude-plugin/plugin.json`。发布流程会通过 `pnpm sync:plugin-version` 从 `tools/claude/package.json` 同步其版本。

## 5. 提交

每个逻辑变更使用一个 Conventional Commit，采用祈使语气，末尾不要加句号：

```
feat(core): add a plugin resolver cache
```

每次提交前检查 `git diff --cached`。绝不要提交密钥、令牌、`.env` 文件或构建产物。使用 pnpm 重新生成锁文件，而不是手动编辑锁文件。

## 6. 编写标题和正文

### 标题

使用一行 Conventional Commit，采用祈使语气，不超过 72 个字符，末尾不要加句号。它会成为 squash-merge 提交，因此要面向未来阅读变更日志的人来编写。

根据已经命名的分支来确定标题：

1. 从分支前缀中取出类型，例如 `feat/`、`fix/`、`docs/`、`chore/`、`refactor/`、`test/` 或 `perf/`。
2. 将 kebab-case slug 转换为一个祈使语气、现在时的句子。
3. 当变更只涉及一个包时，在括号中添加 scope。

`feat/plugin-resolver-cache` 会转换为 `feat(core): add a plugin resolver cache`。

将 issue 编号写在正文中，使用 `Closes #123`，不要写在标题中。

### 正文

填写 `.github/pull_request_template.md`。保留其中的标题及其顺序，将每条 HTML
注释替换为实际内容，不要删除任何章节。

在 **变更** 下写两到五句话。先说明改动内容，再说明原因。指出审阅者应首先打开的
包或文件。如果 PR 会关闭某个 issue，请添加 `Closes #123`。

在 **检查清单** 下，仅为你确实在此分支完成的事项勾选复选框。未勾选的复选框下附上一行
原因，既诚实又有用。勾选了但未验证的复选框会损害审阅者对你的信任，因此这里绝对不要
这样做。

在 **发布影响** 下，如果此分支在 `.changeset/` 中新增了文件，请勾选 changeset 复选框；
如果没有已发布的包发生变化，请勾选文档复选框。

正文使用通俗语言：句子简短，使用主动语态，写出准确的路径和命令，不要把请求换一种
说法复述给读者。

### 测试方法

将其填写为简短列表，每行一个步骤，替换占位符：

- 步骤 1：[明确的复现步骤]
- 步骤 2：[下一步]
- 步骤 3：[预期结果]

从干净的检出开始，并使用真实的命令或路径，而不是对命令或路径的描述。当有人提供了
步骤时，在粘贴之前先修正它们：补充缺失的前置条件，按顺序排列，将模糊的指示替换为
准确的命令或路径，并说明预期结果。如果没有步骤，也无法从差异中推导出步骤，请索要
这些步骤，不要让此章节留空。

对于可见的改动，请添加截图；如果修改了已有内容，请同时提供修改前和修改后的截图。

### 影响

说明影响到哪些人：使用已发布包的人、使用生成输出的人，或仓库之外无人受到影响。如果
存在破坏性变更，请说明具体变更以及迁移步骤。

## 7. 推送并创建 PR

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

使用 `gh` CLI，而不是 GitHub MCP server 或其他 bot token，这样 PR 会由执行命令的人创建，
并出现在其自己的列表中。

创建后直接进入待审阅状态，不要创建为草稿。分支完成且检查通过后，使用 `gh pr ready` 将
草稿标记为可审阅。

添加仓库已经在使用的标签。`gh label list` 可以显示现有标签；自行创建标签反而不如不为
PR 添加标签。

合并时压缩提交并删除分支，`gh pr merge --squash --delete-branch` 可以一步完成。没有
合并权限时，请在正文中说明该 PR 应进行 squash。

一个 PR 只做一件事。当你在过程中发现无关工作时，不要将其加入，并在正文中提及。

## 8. CI 运行后

无论 PR 当前处于什么审阅状态，失败的 PR 都需要立即处理。

阅读失败的任务，在本地复现失败，修复原因，然后再次推送。只有在失败从未执行到测试主体
时（例如检出或安装错误），或者同一提交之前曾通过时，重新运行任务才有意义。

回复每一条审查意见。对于较小的本地修改请求，直接推送修复。对于较大的请求，回复你计划采取的方案，由作者决定。说明你做了哪些更改，以及审查者如何进行检查。

## 防护措施

- 将差异限制在请求的范围内。顺带进行的重构应放在单独的 PR 中。
- 绝不要强制推送到可能已被其他人检出的分支。
- 对差异中的所有面向用户的 Markdown（包括变更集）运行 `humanizer` skill。
- 推送前对生成的代码运行 `deslop` skill。
- 标题、正文、提交信息和变更集均使用美国英语。

## 相关 skills

| Skill | 用途 |
| --- | --- |
| [changelog](../changelog/SKILL.md) | 变更集和发行说明的措辞 |
| [deslop](../deslop/SKILL.md) | 清除差异中代码的 AI 痕迹 |
| [humanizer](../humanizer/SKILL.md) | 清除差异中文案的 AI 痕迹 |
| [jsdoc](../jsdoc/SKILL.md) | 为新增或变更的公共 API 编写文档 |