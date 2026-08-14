---
name: release
description: Run the claude-code-viewer release flow end-to-end. Use when the user asks to release patch, minor, major, beta, or an explicit semver; includes non-interactive release execution, GitHub Actions monitoring with gh, release note cleanup, and publishing the GitHub Release.
---
# claude-code-viewer 发布

使用此 Skill 为该仓库执行端到端的发布流程。

## 输入

将用户的参数解释为发布版本说明：

- `patch`、`minor`、`major`、`beta`
- 或显式的语义化版本号，例如 `0.8.0` / `0.8.0-beta.0`

如果未提供版本说明，请询问用户要使用哪一个。

## 前置条件

1. 在仓库根目录下操作。
2. 检查当前分支和工作树：

```bash
git branch --show-current
git status --short
```

3. 如果存在与发布无关的未提交更改，请停止操作并询问用户如何处理。
4. 如果刚刚完成了与发布相关的更改，请在运行发布流程前提交这些更改，因为 `scripts/release.ts` 要求工作树保持干净。
5. 发布脚本要求配置 SSH 签名：

```bash
git config --get gpg.format
git config --get commit.gpgsign
git config --get tag.gpgsign
```

预期值分别为 `ssh`、`true`、`true`。

## 发布命令

运行非交互式发布：

```bash
VERSION_SPEC="patch" # replace with the user's requested spec
pnpm release -y --version "$VERSION_SPEC"
```

该脚本会运行 gatecheck、Lingui 验证、测试和构建检查。随后，它会更新 `package.json`、创建带签名的发布提交、创建带签名的标签，并推送提交和标签。

## 如果因分支没有上游而导致推送失败

发布提交和标签可能已经存在于本地。为当前分支设置上游并推送，然后推送标签：

```bash
BRANCH="$(git branch --show-current)"
git push --set-upstream origin "$BRANCH"
git push --tags
```

除非本地发布提交或标签已被删除，或者上一次运行在创建它们之前就已失败，否则不要重新运行 `pnpm release`。

## 监控 GitHub Actions

推送标签后，查找并监控 Release 工作流的运行：

```bash
gh run list --workflow Release --limit 5
RUN_ID="<id from the vX.Y.Z row>"
gh run watch "$RUN_ID" --exit-status
```

也可以使用以下可复用的单行命令：

```bash
TAG="v0.0.0"; RUN_ID="$(gh run list --workflow Release --limit 20 --json databaseId,headBranch,event --jq ".[] | select(.headBranch == \"$TAG\" and .event == \"push\") | .databaseId" | head -n 1)"; test -n "$RUN_ID" && gh run watch "$RUN_ID" --exit-status
```

如果工作流失败，请先检查日志，再采取纠正措施：

```bash
gh run view "$RUN_ID" --log-failed
```

## 验证发布

工作流成功后：

```bash
TAG="v0.0.0" # replace
npm view @kimuson/claude-code-viewer version
gh release view "$TAG" --json tagName,name,isDraft,isPrerelease,url
```

## 修正并发布 GitHub Release

工作流会创建一份包含自动生成发行说明的草稿 Release。检查生成的发行说明：

```bash
TAG="v0.0.0" # replace
gh release view "$TAG" --json body --jq .body
```

为 claude-code-viewer 用户重写发行说明：

- 使用简洁、以用户为中心的英语。
- 在适用时优先使用以下章节：`Features`、`Bug Fixes`、`Breaking Changes`、`Internal`。
- 描述用户可感知的影响，而非实现细节。
- 删除格式调整、仅修正拼写错误、仅更新依赖项和纯内部重构等无关紧要的条目，除非它们会影响用户。
- 将同一版本发布过程中的中间修复合并到相关功能或修复条目中。
- 确保每个条目简短清晰。

在发布前进行第二轮审查时，将重点审查委托给另一个智能体：

```bash
RELEASE_URL="https://github.com/d-kimuson/claude-code-viewer/releases/tag/v0.0.0" # replace
pi -p "Review the GitHub Release note at $RELEASE_URL for claude-code-viewer. Check that it is concise, user-focused, correctly categorized, and excludes internal-only noise. Do not edit files or GitHub releases; only report concrete findings."
```

当审查意见与上述规则一致时，应用这些意见。使用重写后的说明发布草稿：

```bash
TAG="v0.0.0" # replace
NOTES_FILE="/tmp/claude-code-viewer-$TAG-release-notes.md"
$EDITOR "$NOTES_FILE" # or write the file with the agent's file tool
gh release edit "$TAG" --notes-file "$NOTES_FILE" --draft=false
```

确认它已公开：

```bash
gh release view "$TAG" --json tagName,name,isDraft,isPrerelease,url
```

## 最终报告

报告以下内容：

- 已发布的标签/版本
- 使用的本地发布命令
- GitHub Actions 运行 ID 和结果
- npm 版本验证结果
- GitHub Release URL 以及草稿/公开状态
- 为发布自动化或 Skill 更新创建的任何后续提交