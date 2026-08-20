---
name: release-notes
description: Generate and publish concise, evidence-based notes in the body of the latest existing GitHub Release. Use only when the user explicitly invokes `$release-notes` or explicitly asks to update the latest existing GitHub Release body. Do not invoke for general release planning, changelog, tag, or version tasks.
disable-model-invocation: true
---
# 发布说明

仅更新最新的现有 GitHub Release 的正文。将仓库差异视为事实依据。拉取请求和提交仅用作辅助证据。

## 安全规则

- 所有 GitHub Release、拉取请求、议题和 API 操作均使用 `gh`。仅当缺少所需的标签对象或历史记录时才使用 `git fetch`。
- 不要创建或删除 Release。
- 不要更改标签、标题、目标、草稿状态、预发布状态、最新 Release 状态或其他 Release 元数据。
- 不要发布草稿。
- 当不存在 Release 时，不要改为创建新 Release。
- 不要根据版本文本、语义化版本或 Git 标签顺序推断 Release 顺序。
- 当所需证据不可用时停止操作。不要发布不完整或推测性的说明。
- 将说明文件视为对当前 Release 正文的完整替换，而不是要追加的文本。

## 1. 验证前置条件

在用户希望发布的仓库中运行所有检查：

1. 确认当前目录位于 Git 工作树中：

   ```sh
   git rev-parse --is-inside-work-tree
   ```

2. 确认 `gh` 可用：

   ```sh
   command -v gh
   ```

3. 确认 `gh` 能够解析并访问当前 GitHub 仓库。保存其 URL，并从中获取 GitHub 主机：

   ```sh
   REPO_URL="$(gh repo view --json url --jq '.url')"
   GH_HOSTNAME="${REPO_URL#*://}"
   GH_HOSTNAME="${GH_HOSTNAME%%/*}"
   ```

4. 使用仓库 URL 获取其 GitHub 主机。确认该主机的当前活动账户：

   ```sh
   gh auth status --active --hostname "$GH_HOSTNAME"
   ```

如果任何检查失败，请停止并给出清晰的错误信息。不要初始化 Git 仓库、更改身份验证或选择其他仓库作为后备方案。

## 2. 选择 Release 范围

使用 GitHub 按降序排列的 Release 列表顺序作为 Release 序列。包括草稿和预发布版本，因为它们都是现有 Release：

```sh
gh release list --limit 2 --order desc \
  --json tagName,name,createdAt,publishedAt,isDraft,isPrerelease,isImmutable,isLatest
```

- 选择第一项作为最新 Release。
- 选择第二项作为上一个 Release。
- 如果列表为空，停止并说明未找到现有 GitHub Release。绝不要创建 Release。
- 如果只有一项，则将其视为项目的首个 Release。
- 不要对结果重新排序。草稿可能没有 `publishedAt` 值。
- 不要将任一标签替换为没有对应 GitHub Release 的 Git 标签。

根据此结果设置 `LATEST_TAG`，并在存在上一个 Release 时设置 `PREVIOUS_TAG`。在每条命令中都为这两个值加上引号。然后在进行任何编辑之前加载并记录最新 Release：

```sh
gh release view \
  --json tagName,name,body,isDraft,isPrerelease,isImmutable,publishedAt,targetCommitish,url \
  -- "$LATEST_TAG"
```

确认返回的 `tagName` 与 `LATEST_TAG` 一致。记录此结果中的 `tagName`、`name`、`isDraft`、`isPrerelease`、`isImmutable` 和 `targetCommitish`。同时记录 Release 列表结果中的 `isLatest`、`createdAt` 和 `publishedAt`。使用这些值进行最终安全检查。如果 `isImmutable` 为 true，则停止并报告 GitHub 不允许更新正文。

## 3. 解析标签历史

设置完整的 Git 引用，以防以 `-` 开头的标签被当作命令选项：

```sh
LATEST_REF="refs/tags/$LATEST_TAG"
PREVIOUS_REF="refs/tags/$PREVIOUS_TAG"
```

仅当 `PREVIOUS_TAG` 存在时才设置 `PREVIOUS_REF`。确认所选的每个发布标签都能解析为本地提交：

```sh
git rev-parse --verify "$LATEST_REF^{commit}"
git rev-parse --verify "$PREVIOUS_REF^{commit}"
```

仅当 `PREVIOUS_TAG` 存在时才运行第二条命令。如果缺少某个标签，请检查 Git 远程仓库，找出对应同一 GitHub 仓库的远程仓库，并使用 `git fetch` 获取所需标签。不要假定远程仓库名为 `origin`。如果无法明确确定远程仓库，或者某个发布标签仍无法解析，请停止。不要猜测替代范围。

检查仓库是否为浅克隆：

```sh
git rev-parse --is-shallow-repository
```

如果结果为 `true`，请使用已确定的 GitHub 远程仓库获取完整历史记录和标签：

```sh
git fetch --unshallow --tags "$GITHUB_REMOTE"
```

然后再次运行浅克隆仓库检查。仅当结果为 `false` 且两个必需的标签提交都能解析时才继续。如果无法获取完整历史记录，请停止。不要根据不完整的历史记录生成发布说明。

当 `PREVIOUS_TAG` 存在时，检查它是否为 `LATEST_TAG` 的祖先：

```sh
git merge-base --is-ancestor "$PREVIOUS_REF^{commit}" "$LATEST_REF^{commit}"
```

非祖先结果并不意味着自动失败。请在工作笔记中注明这一点，使用树差异来确定已发布状态的变化，并检查历史记录的两侧，以免提交列表导致错误陈述。

## 4. 调查所有已发布的变更

如果存在上一个版本，请从以下命令开始：

```sh
git log --date=short --format='%H%x09%ad%x09%s' "$PREVIOUS_REF..$LATEST_REF"
git diff --stat "$PREVIOUS_REF" "$LATEST_REF"
git diff --name-status "$PREVIOUS_REF" "$LATEST_REF"
git diff "$PREVIOUS_REF" "$LATEST_REF"
```

对于非线性历史记录，还应检查：

```sh
git log --left-right --graph --oneline "$PREVIOUS_REF...$LATEST_REF"
```

对于首个版本，请检查从最新标签可达的所有历史记录，并将其已发布的树与空树进行比较：

```sh
git log --reverse --date=short --format='%H%x09%ad%x09%s' "$LATEST_REF"
EMPTY_TREE="$(git hash-object -t tree /dev/null)"
git diff --stat "$EMPTY_TREE" "$LATEST_REF"
git diff --name-status "$EMPTY_TREE" "$LATEST_REF"
git diff "$EMPTY_TREE" "$LATEST_REF"
```

逐一核查每个发生变更的路径。检查相关的差异片段，而不仅仅是统计信息或文件名。对于生成的文件或二进制文件，请检查其源文件、清单、配置或其他能够说明其用户影响的证据。不要包括工作树变更或 `LATEST_TAG` 之后的提交。

按以下证据优先级进行判断：

1. 实际的代码和配置差异。
2. 已合并拉取请求的标题、正文、变更文件以及关联议题的上下文。
3. 提交消息。

当 PR 数据能够明确不清楚的目的、用户影响、迁移步骤或参考信息时，请使用 PR 数据。必要时查找与提交关联的 PR：

```sh
gh api -H 'Accept: application/vnd.github+json' \
  "repos/{owner}/{repo}/commits/$COMMIT_SHA/pulls"
gh pr view "$PR_NUMBER" \
  --json number,state,mergedAt,title,body,files,commits,closingIssuesReferences,url
```

仅当 `state` 为 `MERGED` 且存在 `mergedAt` 时，才使用 PR 上下文。在添加任何 PR 或 issue 编号前，都要验证其关联性。提交前缀、PR 标签或 PR 标题并不能证明其对用户有影响。

## 5. 选择面向用户的变更

对于每项行为变更，确定用户能够观察到什么，以及有哪些证据支持该结论。仅当变更对以下一个或多个方面产生实质性影响时，才将其纳入：

- 行为或用户体验
- 兼容性或迁移
- 安装或配置
- 公共命令、标志、API 或文件格式
- 安全或隐私
- 性能或资源使用

通常排除重构、格式调整、lint 变更、测试、CI 变更、构建维护、合并提交、常规依赖项更新、内部清理以及仅涉及文档的变更。仅当 diff 证明其对用户有实质性影响时，才纳入其中某项变更。

在分类前调查含义不明确的变更。如果现有证据无法支持有用的结论，则仅描述证据所支持的事实，或省略该变更。绝不要虚构行为、修复、性能结果、安全影响、破坏性影响、迁移步骤，或 PR 和 issue 链接。

如果没有任何变更对用户产生实质性影响，则仅编写简短、客观的摘要，说明该版本包含维护性变更，但用户可见行为没有实质性变化。不要创建空章节。

## 6. 起草发布正文

创建一个隔离的临时目录和 Markdown 文件：

```sh
RELEASE_NOTES_DIR="$(mktemp -d)"
RELEASE_NOTES_FILE="$RELEASE_NOTES_DIR/release-notes.md"
```

按以下确切顺序组织正文，并省略所有空章节：

1. `### Highlights`
2. `### Added`
3. `### Changed`
4. `### Fixed`
5. `### Breaking Changes`
6. `### Deprecated`
7. `### Removed`
8. `### Security`

以一到两句简洁的摘要开头，概述该版本及其最重要的用户影响。不要添加版本标题，也不要重复发布标题。仅对包含条目的章节使用以下结构：

```markdown
A concise summary of the release and its most important user impact.

### Highlights

- Major user-facing improvement.

### Added

- Added support for ... (#123)

### Changed

- Improved ...

### Fixed

- Fixed an issue where ...

### Breaking Changes

- Replaced `--old-flag` with `--new-flag` for users of the command-line interface.
  - **Migration:** Replace `--old-flag` with `--new-flag` in scripts and configuration.
```

应用以下写作规则：

- 面向用户写作，而不是面向内部维护人员。
- 每个项目符号只描述一项有意义的变更。
- 优先描述具体行为，而不是实现细节。
- 使用一致的动词作为项目符号的开头，例如 `Added`、`Improved`、`Changed`、`Fixed`、`Deprecated` 或 `Removed`。
- 将命令、标志、配置键、API 名称、文件路径、环境变量以及其他技术标识符放在反引号中。
- 在有帮助时，在项目符号末尾添加经过验证的 PR 或 issue 引用。
- 仅将 `Highlights` 用于大约一至三项重要内容。对于小型版本，请省略该章节。
- 不要在两个章节中重复同一项变更，除非简短的 `Highlights` 条目能够提供有用的强调。
- 不要添加提交清单、贡献者章节、依赖项更新列表或 `Full Changelog` 链接。
- 保持发布说明简洁。相比完整记录内部历史，应优先提供有用的信息。

对于每项破坏性变更，请说明发生了什么变化以及哪些用户会受到影响。如果证据支持，请添加嵌套的 `**Migration:**` 说明。在开篇摘要中提及一项重要的破坏性变更。没有证据时，不要使用破坏性变更标签。

仅将 `### Security` 用于会对公众产生实质安全影响的内容。以适合公开披露的安全层级说明改进。不要包含敏感的漏洞细节或利用说明。

## 7. 发布前审查

阅读完整的临时 Markdown 文件。在执行编辑前纠正所有问题。确认：

- 摘要为一到两句话
- 不存在版本标题或发布标题
- 各章节采用规范顺序，且没有空章节
- 条目没有重复
- 不包含仅供内部使用的工作
- 每项陈述都有证据支持
- 每个类别都与可观察到的影响相符
- 在信息可用时，破坏性变更包含受影响用户和迁移详情
- 措辞一致且简洁
- 正文不包含贡献者列表、依赖项转储或 `Full Changelog` 链接

在执行编辑前，立即再次运行步骤 2 中的发布列表查询。确认其第一个标签仍为 `LATEST_TAG`，并且为此版本记录的列表元数据未发生变化。然后再次运行 `gh release view -- "$LATEST_TAG"`，并确认记录的发布元数据仍然标识预期的版本。如果 CI 或其他操作方创建了更新的版本，或更改了所选版本，请停止操作。

## 8. 仅更新正文

严格运行以下发布编辑命令。不要添加任何其他 `gh release edit` 选项：

```sh
gh release edit --notes-file "$RELEASE_NOTES_FILE" -- "$LATEST_TAG"
```

如果命令失败，请报告错误。不要创建替代版本，也不要为了使编辑成功而更改发布设置。

成功后再次读取该版本。确认其正文与 `RELEASE_NOTES_FILE` 一致，并且 `tagName`、`name`、`isDraft`、`isPrerelease` 和 `isImmutable` 与编辑前记录的值一致：

```sh
gh release view \
  --json tagName,name,body,isDraft,isPrerelease,isImmutable,publishedAt,targetCommitish,url \
  -- "$LATEST_TAG"
gh release list --limit 2 --order desc \
  --json tagName,name,createdAt,publishedAt,isDraft,isPrerelease,isImmutable,isLatest
```

还要确认 `targetCommitish`、`createdAt`、`publishedAt` 和 `isLatest` 未发生变化。确认 `LATEST_TAG` 仍然是第一项。如果编辑期间出现了新版本，请报告竞态情况，并且不要声称已编辑的版本仍是最新版本。

报告更新后的标签和 URL、已发布的章节，以及所有因含义不明确而省略的变更。如果回读结果不匹配，不要声称操作成功。

无论成功还是失败，都要删除临时文件和目录。先删除文件，然后删除空目录。不要使用递归删除命令。