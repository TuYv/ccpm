---
name: shepherd
description: "Use when asked to shepherd, babysit, monitor, or poll open pull requests or merge requests — including triaging review comments, detecting CI failures, fixing trivial CI issues, and keeping PRs/MRs moving without manual intervention."
---
# PR 看护

## 核心原则

循环轮询开放的 PR（GitHub）和 MR（GitLab），先在本地修复所有未解决的问题，然后推送修复、解决评审讨论串，再等待 CI。只要 PR 中仍有未处理的反馈或失败的 CI 检查，就绝不能闲置等待。

## 平台检测

使用 `git remote get-url origin` 确定平台：

| 远程 URL 模式 | 平台 | CLI 工具 | ID 前缀 |
|---|---|---|---|
| `github.com` | GitHub | `gh` | `#` |
| `gitlab.*` | GitLab | `glab` | `!` |

在下述所有命令中，使用检测到的 CLI 工具（`gh` 或 `glab`）。本技能使用 `PR` 统称拉取请求和合并请求。

## 命令参考

| 操作 | GitHub（`gh`） | GitLab（`glab`） |
|---|---|---|
| 列出开放的 PR | `gh pr list --state open --json number,title,headRepository,baseRefName,statusCheckRollup` | `glab mr list --source-branch $(git branch --show-current) --output json` |
| 查看 PR 详情 | `gh pr view <#> --comments --json comments` | `glab mr view <!> --comments` |
| 检查 CI 状态 | `gh pr checks <#>` | `glab mr view <!>`（检查 `pipeline` 或 `head_pipeline` 字段） |
| 查看 CI 日志 | `gh run view <run-id> --log-failed` | `glab ci trace <job-id>` |
| 列出 CI 流水线 | — | `glab ci list --mr <!>` |
| 添加评论 | `gh pr comment <#> --body "..."` | `glab mr note <!> --message "..."` |
| 合并 | `gh pr merge <#> --squash --delete-branch` | `glab mr merge <!> --squash` |
| 批准 | `gh pr review <#> --approve` | `glab mr approve <!>` |

## 何时使用

- 用户说“看护我的 PR”“帮我盯着 PR”“关注我的 PR”“监控开放的 PR”或“轮询 PR”——可互换地适用于 GitHub PR 和 GitLab MR
- 用户有需要在数分钟或数小时内持续关注的开放 PR
- 用户要求你自主处理 PR 评审反馈
- CI 因你可以修复的问题而持续失败（lint、格式、轻微的测试故障）

**以下情况请勿使用：**
- 失败需要你并不具备的领域知识（含义不明确的测试失败、架构层面的反馈）
- 用户明确要求先执行其他操作
- 没有需要看护的开放 PR

## 核心循环

```
Detect platform: git remote get-url origin
While the user wants monitoring:
  1. List open PRs (see command reference)
  2. For each PR:
     a. Check for new comments
     b. Triage comments (see Comment Triage below)
     c. Fix ALL actionable issues locally — do not push yet
     d. If any changes made, push once with [autofix] prefix in the message
     e. Check CI status (see CI Fix Workflow below)
     f. If CI failing, follow CI Fix Workflow
     g. If changes pushed and CI green, comment "ready for re-review" if requested
  3. Wait an appropriate interval before polling again
```

## 轮询间隔

- 正在主动修复问题时为 **30-60 秒**
- 所有 PR 都在等待评审或 CI 正在运行时为 **2-5 分钟**
- PR 连续多个轮询周期都没有新动态时为 **10 分钟以上**

记录已经查看过的评论，以避免重复处理。将其与上一次轮询的评论集合（时间戳/ID）进行比较。

## 评论分类处理

| 评论类型 | 信号 | 操作 |
|---|---|---|
| 批准 / LGTM | “LGTM”、“可以合并”、`APPROVED` 审查 / GitLab 批准 | 检查 CI 是否为绿色，然后询问是否合并；如已收到指示，则直接合并 |
| 修改请求 | “请修改”、“请求更改”、`REQUEST_CHANGES` | 阅读具体反馈，在本地修复 |
| 小问题 / 建议 | “小问题”、“可选”、“考虑一下” | 如果修改很简单（重命名、格式调整），则应用。如果存在争议，则跳过并询问用户 |
| 问题 | “为什么”、“……怎么样”、“你考虑过……吗” | 回答问题。如果不确定，则转达给用户 |
| CI 提醒 | “测试失败”、“CI 是红色的”、“流水线失败” | 记录失败，然后在推送后按照 CI 修复工作流处理 |
| 合并冲突 | “需要变基”、“存在冲突” | 在基础分支上执行变基并推送。如果冲突较复杂，则报告给用户 |

**评论解决规则：**
- 推送任何更改之前，修复 PR 上所有可操作的问题
- 不要在处理每条评论后都推送——将所有修复合并为一次推送
- 仅在推送成功后解决审查线程（标记为已解决）——不要在修复仍只存在于本地时解决
- 不要仅为了表示“正在轮询”或“跟进检查”而发表评论——这些都是噪声
- 如果自上次评论后没有任何变化，则不要评论
- 将相关回复合并为一条评论
- 推送修复时，添加 `[autofix]` 前缀，以便人工识别自动推送

## CI 修复工作流

```
1. Check CI status (see command reference)
2. Identify failing check(s) or job(s)
3. If pipeline is still running, wait for completion
4. For each failure:
   a. Get logs (see command reference)
   b. Diagnose root cause:
      - Lint failure? Run the linter locally, fix formatting, push
      - Compilation error? Can you see the error clearly? Fix and push
      - Test failure? Read the test output. Only fix if the fix is obvious
      - Flaky test? Re-run once. If it fails again, report to user
   c. If fix is straightforward (≤ 3 lines, obvious intent):
      - Make the fix
      - Push with message "ci: fix [what was fixed]"
      - Re-check CI
   d. If fix is not obvious:
      - DO NOT guess
      - Report to user with the failure log snippet and your assessment
5. If no failures remain, mark CI as resolved
```

### GitLab CI 特定说明

GitLab 流水线的结构为阶段 → 作业。使用：

```
glab ci list --mr <!>           # list pipeline jobs
glab ci trace <job-id>          # view job logs
glab ci retry <job-id>          # retry a failed job
```

GitLab CI 可能包含手动阶段（环境、部署）。仅处理自动阶段；除非收到指示，否则跳过手动阶段。

## 合并

仅在满足以下条件时合并：
- 所有被请求的审查者均已批准（或已满足审查要求）
- 所有 CI 检查均为绿色
- 不存在合并冲突
- 用户已明确授予合并权限，或者你拥有长期有效的合并权限

| 平台 | 合并命令 |
|---|---|
| GitHub | `gh pr merge <#> --squash --delete-branch` |
| GitLab | `glab mr merge <!> --squash` |

对于 GitLab，如果“删除源分支”不是项目默认设置，则添加 `--remove-source-branch`。

## 处理复杂情况

| 复杂的 PR（文件多、差异大） | 简单的 PR（改动小、意图明确） |
|---|---|
| 寻找拆分机会（能否拆成 2-3 个更小的 PR？） | 获得批准且 CI 通过后迅速合并 |
| 格外关注审查反馈——重新审查更困难 | 积极修复 CI 失败 |
| 记录你检查过的内容，方便用户快速浏览 | 默认：自行合并 |

## 停止条件

出现以下情况时，停止轮询并向用户报告：
- 用户返回或要求停止
- 所有 PR 均已合并或关闭
- 同一个 CI 失败重复出现 3 个周期且未解决
- 某条评论需要你无法做出的人类判断
- 你发现了无法妥善解决的合并冲突

## 常见错误

| 错误 | 修正方法 |
|---|---|
| 只轮询一次就停止 | 此技能的核心是循环。除非触发停止条件，否则要继续。 |
| 每个周期都评论“我检查过了，一切正常” | 仅在你采取了操作或被要求提供状态时发表评论。 |
| 获得批准后未检查 CI 就合并 | 获得批准 ≠ 可以合并。始终先检查 CI。 |
| 修复你不理解的测试 | “显而易见的修复”意味着你能解释为什么。如果不能，就不要修复。 |
| 修复每条评论后都推送 | 先修复所有问题，然后一次性推送。 |
| 推送前将审查讨论标记为已解决 | 仅在推送成功后才将讨论标记为已解决。 |
| 未处理所有反馈就再次推送 | 推送前对所有尚未处理的评论进行分类处理。 |
| 使用错误的 CLI 工具 | 首先检测平台（参见平台检测）。 |
| 未跟踪哪些评论是新的 | 与上次轮询中的评论时间戳/ID 进行比较。不要再次回复旧评论。 |
| 将 GitLab 手动作业视为失败 | 跳过手动阶段（部署、审查应用）。仅处理自动 CI 失败。 |

## 危险信号——停止并询问用户

- CI 失败日志包含超过 50 行你不熟悉的代码
- 审查者要求进行架构变更
- 你已推送 3 个或更多修复提交，但 CI 仍然失败
- 一条评论与另一位审查者的意见相矛盾
- 合并冲突涉及你最初未修改的文件
- 用户说“继续盯着这个”或“停止”——他们的指示优先于此技能
- 平台检测失败或返回模糊结果（多个远程仓库、两者均为自托管）