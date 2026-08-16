---
name: pr-writer
description: Create or refresh reviewer-facing PR titles and descriptions. Use when opening a PR, updating its title or body, or preparing branch changes for review.
---
# PR 撰写器

将 PR 正文写成供审阅者阅读的说明，而不是变更日志、模板、验证日志或逐文件摘要。

## 检查变更

需要经过身份验证的 `gh`。检查当前分支、工作树、PR、基础分支、提交和完整差异：

```bash
git branch --show-current
git status --porcelain
gh pr view --json number,title,body,url,baseRefName,headRefName
gh repo view --json defaultBranchRef
```

如果 `gh pr view` 报告不存在 PR，则继续首次创建 PR。对于现有 PR，使用其 `baseRefName`；否则使用仓库的默认分支。设置 `BASE`，然后检查：

```bash
git log "$BASE"..HEAD --oneline
git diff "$BASE"...HEAD
```

如果当前位于 `main` 或 `master`，请先创建功能分支。确保预期变更均已提交，并审阅整个分支的差异，而不是只查看最新提交或现有 PR 文本。

## 核心规则

- 在实现细节之前，描述具体的行为变更、受影响的界面以及对审阅者的影响。
- 仅在有帮助时说明动机、风险、权衡、迁移方式或审阅重点。
- 使用能让变更更易于审阅的最精简结构。
- 将内部提示词或流程术语替换为具体行为。
- 刷新 PR 时，应根据当前完整差异重写正文，不要叙述审阅历史。

## 标题

使用 `<type>(<scope>): <subject>` 或 `<type>: <subject>`。

允许的类型：`feat`、`fix`、`ref`、`perf`、`docs`、`test`、`build`、`ci`、`chore`、`style`、`meta`、`license` 和 `revert`。

- 使用最准确且范围最窄的类型和作用域，描述整个分支的主要变更。
- 仅当变更破坏外部契约时才使用 `!`，并在正文中说明受影响的界面。
- 避免使用 `update`、`cleanup`、`misc`、`fix stuff` 或 `address feedback` 等含糊的主题。不要在末尾添加句号。
- 仅当现有标题仍能描述完整差异时才保留它。

## 正文结构

选择满足需要的最精简结构：

| 变更 | 包含内容 |
|--------|---------|
| 小型或显而易见的变更 | 一段不带标题的简洁说明。 |
| 功能、错误修复或重构 | 变更后的行为及其影响；相关时补充根本原因、保持不变的行为或不明显的实现方式。 |
| 契约或破坏性变更 | 受影响的 API、schema、payload、config、permission、storage 或 CLI 界面；包含兼容性和迁移指南。 |
| 运维、视觉或工作流变更 | 在有帮助时说明对用户或运维人员的影响、量化效果、失败模式或流程。 |
| 广泛、生成式或横跨多个部分的变更 | 组织原则、为何必须覆盖如此广泛的范围，以及应从何处开始审阅。 |

默认：

```markdown
<What changed and what effect it has.>

<Why the approach, risk, migration, or review focus matters, if not obvious.>
```

对于根据审阅反馈进行的更新，应描述最终形成的整个 PR，而不是一系列修改过程。

## 审阅辅助材料

仅当辅助材料能够减少审阅者自行梳理信息的工作量时才使用：

- 针对已变更契约的简洁前后对比或接口示例。
- 针对异步流程或状态转换的小型 Mermaid 图。
- 在已有视觉证据时提供截图或录屏说明。
- 在审阅者或采用者需要时提供发布、兼容性、风险或审阅顺序说明。

用一句话介绍构件，并说明审阅者应注意什么。若使用文字说明更清晰，
则省略构件。

## 边界

- 不要添加默认的 `Summary`、`Changes` 或 `Test Plan` 章节。
- 省略常规验证，除非它会改变风险评估或说明有意义的回归覆盖情况。对于文档、技能、文案或配置变更，默认省略。
- 不要粘贴命令、CI 日志、验证输出、提交日志、占位符或详尽的文件列表。
- 切勿包含客户或组织名称、用户电子邮件、支持工单内容、密钥或个人身份信息。
- 仅当问题引用可从用户输入、分支名称、提交、PR 讨论或跟踪器输出中得到验证时才使用。`Fixes <issue>` 会关闭问题；`Refs <issue>` 只会建立链接。

## 创建或更新

将新 PR 创建为草稿。先将正文写入临时 Markdown 文件，然后运行：

```bash
gh pr create --draft --title '<title>' --body-file /tmp/pr-body.md
```

使用 `gh api` 更新现有 PR：

```bash
gh api -X PATCH repos/{owner}/{repo}/pulls/PR_NUMBER \
  -f title='<title>' \
  -F body=@/tmp/pr-body.md
```

当后续提交实质性地改变范围、实现方法、破坏性行为、风险、迁移方式或审阅预期时，更新标题和正文。仅涉及拼写修正、格式调整和重命名的后续提交无需更新。

## 示例

小型变更：

```markdown
The AI Customizations section now starts collapsed so it does not consume
sidebar space before users need it. Expanding it preserves the existing saved
preference behavior.
```

破坏性契约变更：

````markdown
Run logs now emit chunk-level records instead of one skill-level record.
Consumers that read top-level `findings` must iterate over
`chunk.findings` for each record.

Before:

```json
{"skill": "security-review", "findings": [...]}
```

After:

```json
{"schemaVersion": 1, "chunk": {"index": 1, "findings": [...]}}
```
````