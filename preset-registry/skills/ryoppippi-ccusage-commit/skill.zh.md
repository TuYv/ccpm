---
name: commit
description: Creates atomic Conventional Commits. Use when committing code changes, splitting a diff into independently revertable hunks, staging precise patches non-interactively, or writing commit messages.
---
<!--
示例提示：
  /commit
  /commit push=true
-->

# Commit

参数：

- `push`：提交后推送（默认：`false`）。

## 工作流程

1. 读取当前状态和最近的提交历史 —— `git status --short`、`git diff HEAD`、`git log --oneline -10` —— 并与日志中已有的粒度、作用域和说明风格保持一致。
2. 将 diff 拆分为可独立回退的单元，以 hunk 为单位而非以文件为单位。
3. 使用 `git apply --cached -v <patch>` 暂存每个单元。`git add -p` 和 `git add --interactive` 在此环境中会挂起，因此补丁是暂存文件一部分的唯一方式。当某个补丁应用失败时，请阅读 `references/git-apply.md`。
4. 执行提交，然后使用 `git show HEAD` 确认。

## 可回退性

每个提交都要能回答“如果只回退这一个提交，会不会破坏其他内容？”。预期会出现极小的提交：一条评审意见、一处措辞修正、一次参考文件提取。

小不等于不完整。移动、重命名或提取应作为一个同时包含两边的单一提交落地 —— 删除旧路径、添加新路径、更新引用、同步生成的链接。

即使每项改动都是正确的，也要把不同的关注点放进不同的提交，这样回退某个关注点时不会连带回退无关的工作。

PR 分支会以 squash 方式合并，因此评审修复会以后续提交的形式叠加。只对未发布的本地错误执行 amend，或在用户要求时才执行。

## 提交信息

主题行应指明被修改的产物或行为，并且在提交列表中单独阅读时也说得通；面向评审者的上下文放在正文中。比起 `chore: address review feedback`，更推荐使用 `docs(skills): clarify reference routing` 并在正文中引用 CodeRabbit 的反馈。正文在 72 列处换行，并涵盖问题、理由、决策和影响。

`commit-msg` 钩子会运行 `scripts/validate-commit-scope.nu`：当暂存的路径位于 `rust/adapters/<agent>/` 之下时，作用域必须是该 agent（`fix(kimi)`）、某个横切作用域之一，或者 —— 对于跨越多个 agent 的改动 —— 一个工作区作用域。`rust/adapters/common/` 推导出的作用域是 `adapter`，而不是 `common`。请阅读该脚本以获取当前列表；代码树的其他任何部分都不会推导出作用域。

仅涉及格式化工具的改动使用 `chore: format`，或在上述作用域规则适用时使用 `chore(<scope>): format`。提交信息使用美式英语。

## 推送（push=true）

改动通过 PR 进入 `main`，因此请在功能分支上提交；`references/push.md` 中包含分支和上游检查的说明。

当所有提交就位后推送一次，并让 `nix/git-hooks.nix` 中的钩子运行 —— 提交时运行 treefmt 和 gitleaks；推送时运行 treefmt、gitleaks、oxlint、`clippy -D warnings`、node test 和 cargo test。这些钩子的失败属于正常验证的一部分，因此请通过一个新的小提交来修复。
