---
name: github-contributor
description: End-to-end playbook for shipping high-quality pull requests to open-source projects you don't maintain — discovery, CONTRIBUTING compliance, PR-size check, minimal-diff implementation, PR description with AI-assisted disclosure, conflict resolution, and post-submission maintainer interaction. Use whenever creating, editing, or pushing a PR to a third-party GitHub repo — "submit a PR", "open a PR", "fix this upstream", "rebase against main", "respond to the bot review", an `owner/repo` target, or 提 PR / 上游 PR / 贡献代码 / rebase 冲突 / 回应维护者.
---
# GitHub 贡献者

一份按阶段组织的行动指南，用于提交维护者真正愿意合并的拉取请求。该技能围绕真实的 PR 生命周期构建——调研 → 实现 → 质量门禁 → 描述 → 提交后跟进——因为每个阶段都有各自的失败模式，而最常见的错误是在错误的阶段做正确的事（例如，为一个规模大了 10 倍的 PR 编写完美的描述）。

## 阶段 0 — 何时使用此技能

当以下条件**全部**成立时，使用此技能：

- 你正在为一个并非由你维护的仓库做贡献（维护者可以不作解释就关闭你的 PR）。
- 工作涉及以下一项或多项：源代码、测试、文档、构建配置。
- 你希望 PR 被合并，而不只是被提交。

**不要**将此技能用于：你自己的仓库、团队内部具有共享上下文的 PR、维护者正在等待你处理的热修复分支，或仅改动一行的简单变更（一条说明就足够了）。

## 阶段 1 — PR 前调研

PR 被关闭最常见的原因，是贡献者认为可接受的内容与维护者已经明确写下的要求不一致。在编写代码之前解决这个问题。

### 步骤 1.1 — 将 CONTRIBUTING.md 视为硬性契约

CONTRIBUTING.md **不是**风格建议。应将每一条编号规则都视为合并的前置条件。请特别注意：

- **AI 辅助贡献条款。** 在 AI PR 浪潮之后，许多项目于 2024-2026 年间添加了此类条款。典型措辞包括：“未经事先讨论的 AI 生成 PR 可能会被关闭”、“你必须能够解释每一行代码”、“一个 issue 对应一个 PR”。如果存在此类条款，你就有义务向项目作出明确披露（参见阶段 4），并且必须保持 PR 足够小。
- **先提 issue 的规则。** 有些项目要求在创建任何功能 PR 之前，必须先存在一个功能请求 issue。
- **针对不同语言的测试命令。** 如果 CONTRIBUTING.md 要求运行 `pnpm test:unit && cargo test`，你就应运行这些命令，而不是使用 IDE 偏好的其他命令。

如果缺少 CONTRIBUTING.md，这本身就是一个警示信号——参见 [`references/project_evaluation.md`](references/project_evaluation.md)。

### 步骤 1.2 — 根据项目基准合理检查 PR 规模

“小型 PR”是相对的。在创建 PR 之前，运行：

```bash
gh pr list --repo <owner>/<repo> --state merged --limit 10 \
  --json number,title,author,additions,deletions \
  --jq '.[] | "#\(.number) +\(.additions)/-\(.deletions): \(.title)"'
```

这会告诉你该项目实际合并的 PR 规模分布。如果你的 PR **比近期合并的最大 PR 大 5–10 倍**，这就是一个危险信号——请在提交前拆分。有关基准评估标准和拆分启发式方法，请参见 [`references/phase1_discovery.md`](references/phase1_discovery.md)。

### 步骤 1.3 — 在编码前编写一段范围契约

范围契约是你在打开编辑器之前**写给自己**的一小段文字：

> 目标：<一句话>。范围内：<项目符号列表，3–5 项>。明确不在范围内：<项目符号列表——具体说明当你忍不住想添加某些内容时，需要坚持不添加什么>。

然后，每次进行编辑时，都要问自己：“这是否在范围内？”如果你发现自己开始想着“既然都改到这里了……”，请停下来重新审视约定。范围蔓延是 PR 未合并便关闭的最大单一原因——有关范围纪律的章节，请参阅 [`references/phase2_implementation.md`](references/phase2_implementation.md)。

## 阶段 2——实现

### 步骤 2.1——获取上游更新后，立即从 `main` 创建分支

```bash
git fetch origin
git switch -c feat/short-descriptive-name origin/main
```

始终从上游 `main`（或项目的默认分支）创建分支，绝不要从你自己的 fork 的 `main` 创建，因为它可能已经过时。

### 步骤 2.2——用最小的差异解决问题

拒绝任何并非你的范围约定直接要求的更改。尤其要注意：
- **不要**“既然都改到这里了”就顺手重构周边代码。
- **不要**重新格式化你未修改的行（你的格式化工具可能与项目使用的工具不同，即使二者都自称是“Prettier”）。
- **不要**为了提高清晰度而重命名变量，除非重命名本身就是修复。

如果某项后续改进确实有价值，请单独提交 issue，或在当前 PR 合并后另开一个 PR。

### 步骤 2.3——使用 Conventional Commits，每个提交只包含一项逻辑变更

使用 [Conventional Commits](https://www.conventionalcommits.org/)：`<type>(<scope>): <description>`，其中 type 为 `feat | fix | docs | refactor | test | chore | ci | perf`。每个提交都应当能够独立接受审查。

当审查意见要求修复时，使用 `git commit --fixup=<sha>`，并在推送前通过 `git -c sequence.editor=: rebase -i --autosquash origin/main` 进行压缩——完整的 fixup 工作流请参阅 [`references/phase2_implementation.md`](references/phase2_implementation.md)。

## 阶段 3——质量门禁

维护者的信任靠证据建立，而不是靠口头声明。这一阶段的目的是生成可以粘贴到 PR 中的证据。

### 步骤 3.1——在本地运行项目完整的 lint 和测试套件

从 CONTRIBUTING.md 中读取确切命令。典型示例（请以你的项目规定为准）：

```bash
pnpm typecheck && pnpm format:check && pnpm test:unit
cargo fmt --check && cargo clippy --all-targets && cargo test
```

如果有任何检查失败，请先修复再继续。不要在本地检查未通过的情况下推送 PR，并指望 CI 帮你查明问题——这会浪费维护者的时间。

### 步骤 3.2——对于 GUI / 桌面应用：在隔离环境中运行真实的端到端测试

对于 Tauri/Electron/Cocoa 应用，你几乎肯定不能直接使用 `pnpm dev`，否则可能会污染你的真实安装环境。应遵循以下模式：**先隔离数据目录，再运行真实的二进制程序**：

1. 找到项目的测试隔离钩子（通常是 `XXX_TEST_HOME`、`XXX_DATA_DIR`，或 `config.rs` / `paths.go` 中的配置标志）。
2. 启动前，将其指向 `/tmp/<app-name>-e2e/`。
3. 通过用户实际使用的入口触发该功能（URL scheme、CLI arg、deeplink）。
4. 通过读取实际持久化的状态（SQLite、JSON 文件）进行验证，而不仅仅依赖目视检查。
5. 截取 GUI 屏幕截图，用于 PR 描述。

完整的隔离操作指南，包括如何通过 Tauri 的单实例转发触发深层链接且不触及 macOS LaunchServices，详见 [`references/phase3_quality_gates_and_e2e.md`](references/phase3_quality_gates_and_e2e.md)。

### 步骤 3.3 — 自我审查：你真的做了自己即将声称做过的事情吗？

在撰写 PR 描述之前，列出你打算写下的每一条“我测试了……”/“我验证了……”/“我运行了……”陈述。逐一问自己：“我的证据是什么？”如果答案是“我觉得我做过”或“它应该能正常工作”，那你实际上并没有做过。只写下你能够证实的内容。

这条规则可以避免最具破坏性的信任危机：维护者运行你声称“测试过”的命令，却发现它根本无法正常工作。

### 步骤 3.4 — 推送时验证

本地测试通过并不代表工作已经完成。在你宣称 PR 已准备好合并之前，请执行推送时检查清单：

1. **可见性检查** — 确认目标仓库确实如你所认为的那样是公开或私有的：
   ```bash
   gh repo view <owner>/<repo> --json visibility,isPrivate,defaultBranchRef
   ```
2. **安全钩子** — 如果预推送检查失败，请修正规则或内容；不要使用 `--no-verify`。
3. **推送成功** — 如果推送因 503 或身份验证错误而失败，请检查 `git config --global --get-regexp url` 中是否存在过期的 URL 重写配置。
4. **可合并性检查** — `git push` 成功并不意味着 GitHub 能够合并：
   ```bash
   gh pr view <pr-number> --repo <owner>/<repo> --json mergeable,mergeStateStatus
   ```

完整详情（URL 重写、PII 钩子误报、`--force-with-lease` 注意事项）请参阅 [`references/push_time_gotchas.md`](references/push_time_gotchas.md)。

## 阶段 4 — 编写 PR 描述

一份出色的 PR 描述可以完成三项工作：(1) 让维护者在 30 秒内决定是否合并；(2) 为审查者提供验证所需的一切信息，无需私信询问你；(3) 建立一份即使团队成员更替也能保留下来的书面记录。

### 步骤 4.1 — 结构

使用以下框架。详细模板和测试覆盖矩阵示例请参阅 [`references/phase4_pr_description.md`](references/phase4_pr_description.md) 和 [`references/communication_templates.md`](references/communication_templates.md)。

```
## Summary / 概述
<two sentences — what changed and why it matters>

## What / 变更内容
<bulleted list of commits with their purpose, or files with their purpose>

## Why / 动机
<the problem this solves; if no prior issue, briefly justify why>

## Test Plan / 测试计划
<exact commands a maintainer can run; coverage matrix for non-trivial changes>

## Backward Compatibility / 向后兼容
<state explicitly; don't make the maintainer infer>

## Security Considerations
<only if the change touches auth, inputs, or shared state>

## Screenshots / 截图
<for UI changes — see Step 4.3>

## Related Issue
<Fixes #N, or explain why no issue exists>

## Checklist
<the project's PR template checklist, with real evidence of each>

## AI-Assisted Disclosure
<see Step 4.4>
```

### 步骤 4.2 — 测试覆盖矩阵（适用于非简单变更）

当你添加了 2 个以上的测试时，请用表格展示它们，并将每个测试映射到其所保障的行为。相比阅读测试代码，这可以大幅加快审查速度：

```markdown
| Layer | Test | What it proves |
|---|---|---|
| URL parsing | `test_parse_provider_with_extra_env` | extraEnv query param extracted |
| Security | `test_extra_env_stringifies_scalars_and_skips_invalid_values` | bool/number stringified; null/array/object dropped |
```

### 步骤 4.3 — 在不污染仓库的情况下添加截图

`gh` CLI **不**支持向 PR 附加图片（底层的 `uploads.github.com` 上传 API 仅限浏览器使用，并且会拒绝 PAT 令牌）。有三种可行的方法：

1. **首选 — 让用户在 GitHub Web UI 中拖入图片。** 在 PR 正文草稿中留下清晰标记的占位符（例如 `[SCREENSHOT_1_PLACEHOLDER]`）。当用户在 github.com 上编辑 PR 时，可以将图片拖入 Markdown，GitHub 会把它们上传到 `user-images.githubusercontent.com`，然后用图片替换占位符。完全不会造成污染。
2. **备选 — 在你的复刻仓库中创建孤立分支。** 创建一个孤立分支（例如命名为 `assets-pr-N-screenshots`），提交图片，并通过 `raw.githubusercontent.com` 引用它们。这会污染你的复刻仓库，但不会污染 PR 差异。
3. **最后手段 — 第三方图片托管服务。** 持久性和隐私性都不明确；任何敏感内容都应避免使用这种方式。

### 步骤 4.4 — AI 辅助披露（当 CONTRIBUTING.md 或维护者惯例要求时）

如果项目的 CONTRIBUTING.md 提到了 AI 辅助 PR，或者维护者曾在过去的 PR 中对 AI 输出发表过质疑性评论，请在 PR 正文底部添加一段简短的披露说明。请具体说明你做了什么，而不是含糊地作出保证。

```markdown
## AI-Assisted Disclosure

Per CONTRIBUTING.md §N:

1. I have read every line; happy to walk through any function or design choice.
2. Tested locally: <list actual commands you ran with their results>.
3. Single-topic PR scoped to <one sentence>.
4. <opened/will open> Issue #N for discussion.
5. AI tools used: Claude Code for drafting; <list any others>. Final review and decisions are mine.
```

披露并非万能药——它不能为糟糕的 PR 开脱。但如果项目明确要求披露而你没有提供，就会立刻损害信任。

## 阶段 5 — 提交后

### 步骤 5.1 — 明确回复自动化机器人审查

现代项目会使用 Codex、Claude bot、CodeRabbit 等工具进行初步审查。它们的评论会显示为**针对特定代码行的审查评论**，而不是 PR 级别的评论。请直接回复每一项发现（这样维护者就能在发现项旁边看到处理结果），并引用解决该问题的提交哈希以及函数/测试：

```bash
gh api repos/<owner>/<repo>/pulls/<pr>/comments \
  -X POST \
  -F in_reply_to=<finding_comment_id> \
  -f body="Addressed in commit \`<sha>\`: <function or test name>. <one-sentence explanation>. Thanks for the catch!"
```

`<finding_comment_id>` 是评论 URL（`#discussion_rXXXXXXXX`）中的数字 ID。完整的机器人回复工作流请参阅 [`references/phase5_post_submission.md`](references/phase5_post_submission.md)。

### 步骤 5.2 — 在不丢失审查历史记录的情况下变基到上游 main

当上游 `main` 有新进展且你的 PR 出现冲突时：

```bash
git fetch origin
git rebase origin/main
# resolve conflicts file by file
git add <files>
git -c sequence.editor=: rebase --continue
git push fork <branch> --force-with-lease
```

使用 `--force-with-lease`，绝不要直接使用 `--force`。如果在此期间其他人（或机器人）向你的分支推送了内容，`lease` 变体会中止操作，从而防止你在不知情的情况下破坏评审讨论串。

如果你在评审后做了小幅清理（一个 `--fixup` 提交），请使用 autosquash 将其压缩进相关提交，以保持合并后的历史整洁。完整操作顺序请参阅 [`references/phase2_implementation.md`](references/phase2_implementation.md)。

### 步骤 5.3 — 当子代理／反向评审提出“问题”时，先筛选再回应

如果你运行了反向评审代理（或者维护者的机器人一口气抛给你 20 多个问题），不要把它们全都粘贴到 PR 中。针对每个问题，询问以下三个问题：

| 筛选条件 | 出现以下情况时舍弃 |
|---|---|
| 可能性 | “这种情况在此代码库中真的可能发生吗？”→ 否 |
| 成本 | “修复它的成本是否高于其风险？”→ 是 |
| 场景 | “这种场景是否已在上游被阻止？”→ 是 |

反向评审的目的是发现你未曾考虑到的问题，而不是强制修复每一个理论上的隐患。严格筛选，然后在 PR 中解释为什么接受或拒绝每一条建议。

## 参考文件

| 文件 | 用途 |
|---|---|
| [`references/phase1_discovery.md`](references/phase1_discovery.md) | 解析 CONTRIBUTING.md、PR 大小基准评估标准、范围约定模板 |
| [`references/phase2_implementation.md`](references/phase2_implementation.md) | 修正提交与 autosquash 工作流、范围纪律的反模式 |
| [`references/phase3_quality_gates_and_e2e.md`](references/phase3_quality_gates_and_e2e.md) | 隔离主目录模式、单实例转发、SQLite 验证、屏幕截图与窗口聚焦 |
| [`references/phase4_pr_description.md`](references/phase4_pr_description.md) | 正文框架、测试覆盖矩阵、AI 使用披露模板、截图占位符模式 |
| [`references/phase5_post_submission.md`](references/phase5_post_submission.md) | `gh api in_reply_to` 用法、`--force-with-lease` 语义、反向评审筛选 |
| [`references/push_time_gotchas.md`](references/push_time_gotchas.md) | Git 远程 URL 重写、PII 钩子误报、可合并性验证、强制推送注意事项 |
| [`references/case_study_cc-switch_pr_2634.md`](references/case_study_cc-switch_pr_2634.md) | 完整的真实案例演练，包括开发日志、SQLite 转储和截图 |
| [`references/case_study_cc-switch_pr_1624.md`](references/case_study_cc-switch_pr_1624.md) | 前端／状态管理变基案例研究——异步初始化保护、测试耦合、i18n 冲突 |
| [`references/pr_checklist.md`](references/pr_checklist.md) | 原始综合检查清单（旧版；各阶段文档已取代其中的工作流章节） |
| [`references/project_evaluation.md`](references/project_evaluation.md) | 用于探索步骤的项目健康度评估标准 |
| [`references/communication_templates.md`](references/communication_templates.md) | 认领 Issue、回应评审以及合并后沟通的模板 |
| [`references/high_quality_pr_case_study.md`](references/high_quality_pr_case_study.md) | OpenClaw PR #39763 演练——小型修复案例研究 |

## 应避免的反模式

以下这些失败模式会导致 PR 被关闭，即使底层代码本身没有问题。每一种都来自真实的 PR。

1. **捏造测试声明。** 实际上只运行了单元测试，却写着“已使用 `pnpm dev` 在本地测试”。维护者会尝试复现，并从此彻底失去对你的信任。
2. **PR 规模达到项目近期合并基准的 5–10 倍。** 即使代码质量很好，这种规模也会让许多维护者认为这是“AI 倾倒的代码”。
3. **变基时扩大范围。** “在解决冲突时”将一个不相关的上游功能带入你的分支，会在毫无预警的情况下将修复 PR 变成功能 PR。
4. **将重构混入修复提交。** 审查者无法判断是哪一行实现了错误修复；应将其拆分，或者在重构提交上使用 `--fixup` 提交。
5. **在审查期间不使用 `--lease` 就强制推送。** 这会悄无声息地破坏审查讨论串。
6. **忽略机器人审查评论。** 即使机器人错了，也应回复并解释原因——沉默会被理解为“没有注意到”。
7. **将披露信息藏在不显眼的位置。** AI 辅助披露应放在 PR 正文中，而不是作为脚注放在无人阅读的提交消息里。
8. **写完 PR 后才阅读 CONTRIBUTING.md。** CONTRIBUTING.md 中有一半的规则与 PR 的组织方式有关，而不是与代码的功能有关。
9. **在项目要求先有议题时直接提交功能。** 即使在同一个小时内补建了议题，时间戳对维护者来说也很重要。
10. **粘贴原始的反向审查输出。** 在 PR 正文中列出 20 项发现看起来像噪声。先筛选，再回应。

## 快速参考

### 必需的 gh CLI 命令

```bash
gh repo view <owner>/<repo> --json visibility,isPrivate,defaultBranchRef
gh pr list --repo <owner>/<repo> --state merged --limit 10
gh pr view <pr-number> --repo <owner>/<repo> --json title,body,commits,mergeable,reviewDecision
gh pr edit <pr-number> --repo <owner>/<repo> --body-file pr_body.md
gh api repos/<owner>/<repo>/pulls/<pr>/comments -X POST -F in_reply_to=<id> -f body="..."
```

### Conventional Commits 速查表

```
feat(<scope>): user-visible new behavior
fix(<scope>):  user-visible bug fix
refactor(<scope>): no behavior change
docs(<scope>): documentation only
test(<scope>): tests only
chore(<scope>): tooling / build / housekeeping
perf(<scope>): measurable performance change
ci(<scope>): CI config only
```

### 高质量 PR 的关键指标

基于对活跃项目的成功贡献：

- 变更文件数：修复为 1-5 个，包含测试的功能最多约 15 个
- 生产代码差异：如有可能，控制在 200 行以内；其余应为测试/文档
- PR 描述：包含证据在内共 200-600 行；欢迎使用矩阵表格
- 首次回应机器人/维护者的时间：24 小时以内
- 首次推送时 CI 通过：目标

如果你的 PR 有两项或更多指标与这些要求相差甚远，请在提交前重新阅读阶段 1。