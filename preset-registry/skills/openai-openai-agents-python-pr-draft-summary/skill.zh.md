---
name: pr-draft-summary
description: Create the required PR-ready summary block, branch suggestion, title, and draft description for openai-agents-python. Use before the final response whenever the current task changed runtime code, tests, examples, build/test configuration, or docs with behavior impact, regardless of perceived change size and including local-only or uncommitted work. Skip only for trivial or conversation-only tasks, repo-meta/doc-only tasks without behavior impact, an explicitly invoked $release-candidate-prep handoff, or when the user explicitly says not to include the PR draft block.
---
# PR 草稿摘要

## 目的
在符合条件的代码工作完成后，生成本仓库要求的、可直接用于 PR 的摘要：一段简洁的摘要，以及可直接用于 PR 的标题和草稿描述，其中描述以“This pull request <verb> ...”开头。该内容块应可直接粘贴到 openai-agents-python 的 PR 中。

## 触发时机
- 在每次最终回复之前，检查当前任务是否更改了运行时代码（`src/agents/`）、测试（`tests/`）、示例（`examples/`）、构建/测试配置，或具有行为影响的文档。
- 如果有更改，请在完成必要验证后、发送最终回复前运行此技能。不要根据感知到的改动规模来决定是否运行。
- 对符合条件的仅存在于本地且尚未提交的工作，也要运行此技能，即使用户并未要求创建拉取请求。生成这段文本并不代表获准创建分支、提交、推送或打开拉取请求。
- 仅在以下情况下跳过：琐碎任务或纯对话任务；不影响行为的仓库元数据/纯文档任务；显式调用 `$release-candidate-prep` 进行交接，并使用完整的 `$final-release-review` 报告作为发布专用 PR 描述；或者用户明确表示不要包含 PR 草稿块。此例外适用于准备发布候选版本本身，不适用于实现或更改发布准备技能。

## 自动收集的输入（不要询问用户）
- 当前分支：`git rev-parse --abbrev-ref HEAD`。
- 工作树：`git status -sb`。
- 未跟踪文件：`git ls-files --others --exclude-standard`（与 `git status -sb` 配合使用，以确保它们被显示；`--stat` 不包含这些文件）。
- 已更改文件：`git diff --name-only`（未暂存）和 `git diff --name-only --cached`（已暂存）；使用 `git diff --stat` 和 `git diff --stat --cached` 获取规模信息。
- 最新发布标签（优先使用可感知远程仓库的查找方式）：`LATEST_RELEASE_TAG=$(.agents/skills/final-release-review/scripts/find_latest_release_tag.sh origin 'v*' 2>/dev/null || git tag -l 'v*' --sort=-v:refname | head -n1)`。
- 基准引用（使用分支的上游，回退到 `origin/main`）：
  - `BASE_REF=$(git rev-parse --abbrev-ref --symbolic-full-name @{upstream} 2>/dev/null || echo origin/main)`。
  - `BASE_COMMIT=$(git merge-base --fork-point "$BASE_REF" HEAD || git merge-base "$BASE_REF" HEAD || echo "$BASE_REF")`。
- 超出基准分叉点的提交：`git log --oneline --no-merges ${BASE_COMMIT}..HEAD`。
- 本仓库的类别信号：运行时（`src/agents/`）、测试（`tests/`）、示例（`examples/`）、文档（`docs/`、`mkdocs.yml`）、构建/测试配置（`pyproject.toml`、`uv.lock`、`Makefile`、`.github/`）。

## 工作流程
1) 无需询问用户，运行上述命令；先计算 `BASE_REF`/`BASE_COMMIT`，以便后续命令复用它们。
2) 如果没有已暂存、未暂存或未跟踪的更改，并且 `${BASE_COMMIT}` 之后没有新增提交，请简短回复未检测到代码更改，并跳过输出 PR 内容块。
3) 根据“类别信号”中列出的已涉及路径推断更改类型；将其分类为功能、修复、重构或具有影响的文档。仅当差异更改了已发布的公共 API、外部配置、持久化数据、序列化状态或传输协议时，才标记向后兼容性风险。应基于 `LATEST_RELEASE_TAG` 判断该风险，而不是基于仅存在于未发布分支中的变动。
4) 使用关键路径（前 5 个）和 `git diff --stat` 输出，以 1–3 个短句概述更改；明确指出来自 `git status -sb`/`git ls-files --others --exclude-standard` 的未跟踪文件，因为 `--stat` 不包含这些文件。如果工作树干净，但 `${BASE_COMMIT}` 之后存在新增提交，则使用这些提交消息进行概述。
5) 为描述选择开头动词：功能 → `adds`，错误修复 → `fixes`，重构/性能 → `improves` 或 `updates`，仅文档 → `updates`。
6) 建议一个分支名称。如果当前已不在 main 上，则保留当前分支；否则，根据主要领域建议使用 `feat/<slug>`、`fix/<slug>` 或 `docs/<slug>`（例如 `docs/pr-draft-summary-guidance`）。
7) 如果当前分支与 `issue-<number>` 匹配（仅含数字），则保留该分支建议。如果可用，可以选择性地获取少量议题上下文（例如通过 GitHub API），但如果不可用，不要阻塞或重试。当存在议题编号时，使用同一仓库的原生引用 `#<number>`，并包含自动关闭行，例如 `This pull request resolves #<number>.`。不要添加明确的议题 URL，也不要将该引用包装在 Markdown 链接中。
8) 使用下方模板起草 PR 标题和描述。应用仓库范围内的 GitHub 可粘贴性规则：对于同一仓库的议题或 PR，必须使用 `#123`；对于跨仓库引用，必须使用 `owner/repo#123`；绝不要在可直接复制的内容块中输出 `[PR #123](https://github.com/owner/repo/pull/123)`、`[#123](...)`、Codex 导航链接、本地文件链接、仅限 Codex 使用的引用标记或脚注，或应用指令。保留指向 API 文档、设计说明及其他不采用 GitHub 原生议题或拉取请求语法的目标的普通描述性链接。
9) 返回内容块之前，规范化引用：将每个同一仓库的 URL 或 `openai/openai-agents-python#<number>` 引用替换为 `#<number>`，将每个跨仓库的议题或拉取请求 URL 替换为 `owner/repo#<number>`，然后重新扫描整个内容块。如果仍存在使用 Markdown 链接的议题或拉取请求标签、带同一仓库限定名的引用，或裸露的 GitHub 议题或拉取请求 URL，请勿返回该内容块。
10) 仅输出“输出格式”中的内容块。任何外围状态说明都应保持简短，并使用英文。

## 输出格式
结束任务时，除非该任务属于文档中说明的跳过情形，或用户表示不需要，否则请在简短的状态说明后添加以下精简的 Markdown 块（仅使用英文）。

```
# Pull Request Draft

## Branch name suggestion

git checkout -b <kebab-case suggestion, e.g., feat/pr-draft-summary-skill>

## Title

<single-line imperative title, which can be a commit message; if a common prefix like chore: and feat: etc., having them is preferred>

## Description

<include what you changed plus a draft pull request title and description for your local changes; start the description with prose such as "This pull request resolves/updates/adds ..." using a verb that matches the change (you can use bullets later), explain the change background (for bugs, clearly describe the bug, symptoms, or repro; for features, what is needed and why), any behavior changes or considerations to be aware of, and you do not need to mention tests you ran.>
```

保持简洁——不要在该块前后添加冗余文字，并避免在 `Changes` 和描述之间重复细节。除非明确要求，否则无需列出所运行的测试。