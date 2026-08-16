---
name: iterate-pr
description: Iterate on a PR until actionable CI passes and high/medium review feedback is addressed. Use for PR CI failures, review feedback, or green-check loops; do not wait for human approval, draft status, or merge gates.
disable-model-invocation: false
---
# 迭代处理 PR，直至 CI 通过

目标：修复可操作的 CI 失败项以及高/中优先级的审查反馈。遇到人工批准、草稿就绪和合并就绪门禁时停止并报告。

要求：
- 已认证的 `gh`
- `uv`
- 将目标仓库根目录作为 cwd
- 使用相对于 skill 根目录的脚本路径，例如 `scripts/fetch_pr_checks.py`

## 捆绑脚本

| 脚本 | 运行方式 | 输出 |
|--------|-----|--------|
| `scripts/fetch_pr_checks.py` | `uv run scripts/fetch_pr_checks.py [--pr NUMBER]` | JSON：`pr`、`summary`、`checks`、失败片段 |
| `scripts/fetch_pr_feedback.py` | `uv run scripts/fetch_pr_feedback.py [--pr NUMBER]` | JSON 分类：`high`、`medium`、`low`、`bot`、`resolved` |
| `scripts/monitor_pr_checks.py` | `uv run scripts/monitor_pr_checks.py [--pr NUMBER]` | 终端标记及以制表符分隔的检查项 |
| `scripts/reply_to_thread.py` | `uv run scripts/reply_to_thread.py THREAD_ID BODY [...]` | JSON 回复结果 |

检查摘要字段包括 `failed`、`pending`、`actionable_pending` 和 `human_gate_pending`。

监控标记：
- `ALL_CHECKS_PASSED`
- `CHECKS_DONE_WITH_FAILURES`
- `NO_CHECKS_REGISTERED`
- `DRAFT_PR_WITH_NO_CHECKS`
- `CHECKS_BLOCKED_BY_REVIEW_GATE`

## 工作流

### 1. 识别 PR

运行：
```bash
gh pr view --json number,url,headRefName,isDraft,reviewDecision
```

在以下情况下停止：
- 不存在 PR
- 在监控宽限期后，草稿 PR 仍没有检查项：报告 `DRAFT_PR_WITH_NO_CHECKS`

草稿规则：仅检查现有的检查项/反馈。除非被要求，否则不要标记为可供审查。

### 2. 处理反馈

运行 `uv run scripts/fetch_pr_feedback.py [--pr NUMBER]`。

| 分类 | 操作 |
|--------|--------|
| `high` | 修复 |
| `medium` | 修复 |
| `low` | 询问用户要处理哪些 |
| `bot` | 跳过信息性评论 |
| `resolved` | 跳过 |

反馈修复检查清单：
- 验证根本原因
- 搜索相关代码
- 修复所有实例
- 对于 `review_bot: true`：修复真实问题，并解释误报

低优先级提示格式：
```text
Found 3 low-priority suggestions:
1. [l] "Consider renaming this variable" - @reviewer in api.py:42
2. [nit] "Could use a list comprehension" - @reviewer in utils.py:18
3. [style] "Add a docstring" - @reviewer in models.py:55

Which should I address? ("1,3", "all", or "none")
```

### 3. 检查 CI 状态

运行 `uv run scripts/fetch_pr_checks.py [--pr NUMBER]`。

| 状态 | 操作 |
|-------|--------|
| `failed > 0` 且 `actionable_pending == 0` | 修复失败项 |
| `actionable_pending > 0` | 等待；等待期间轮询反馈 |
| `pending > 0` 且 `actionable_pending == 0` | 报告 `CHECKS_BLOCKED_BY_REVIEW_GATE` |
| 宽限期后仍没有检查项 | 报告 `NO_CHECKS_REGISTERED` 或 `DRAFT_PR_WITH_NO_CHECKS` |
| 所有可操作的检查项均已通过 | 执行 CI 后反馈检查 |

等待可操作的审查机器人：sentry、warden、cursor、bugbot、seer、codeql。
不要等待批准、`isDraft`、`REVIEW_REQUIRED`、Codecov 或信息性机器人。

### 4. 修复 CI 失败项

对于每个失败项：
1. 读取完整日志：`gh run view <run-id> --log-failed`
2. 从断言/异常/lint 规则追踪到源代码
3. 编辑前说明原因：“失败是因为 X，受 Y 影响”
4. 搜索相关调用位置/模式
5. 修复根本原因，而不是症状
6. 必要时添加有针对性的测试覆盖

### 5. 先在本地验证，然后提交并推送

提交前：
- 测试修复：重新运行特定测试
- lint/类型修复：重新运行受影响的检查器
- 代码修复：重新运行覆盖相关代码的测试
- 本地失败：推送前修复

```bash
git add <files>
git commit -m "fix: <descriptive message>"
git push
```

### 6. 监控 CI 并处理反馈

循环：
1. 运行 `uv run scripts/fetch_pr_checks.py`
2. 按步骤 3 中的表格处理
3. 当 `actionable_pending > 0` 时，运行 `uv run scripts/fetch_pr_feedback.py`
4. 立即修复新的高/中优先级反馈
5. 如果有更改，则验证、提交、推送，并重新开始循环
6. 否则等待 30 秒后重复
7. 检查通过后，等待 10 秒，再获取一次反馈
8. 如果存在新的高/中优先级反馈，则返回步骤 4

Claude Code 可选操作：通过 `MonitorTool` 运行 `uv run scripts/monitor_pr_checks.py`，并设置 `persistent: false`；将超时时间设置为仓库 CI 的正常运行时长。每次推送后重新启动监控器。

## 退出条件

| 退出方式 | 条件 |
|------|------------|
| 成功 | 可操作的 CI 已通过；CI 后反馈无问题；低优先级选项已处理 |
| 询问用户 | 同一失败在尝试 2 次后仍存在；反馈不明确；基础设施问题 |
| 停止 | 没有 PR；分支需要 rebase；没有检查；草稿状态且无检查；仅剩人工关卡 |

## 回退方案

如果脚本失败，直接使用 `gh` CLI：
- `gh pr view --json number,url,headRefName,isDraft,reviewDecision`
- `gh pr checks --json name,state,bucket,description,link`
- `gh run view <run-id> --log-failed`
- `gh api repos/{owner}/{repo}/pulls/{number}/comments`