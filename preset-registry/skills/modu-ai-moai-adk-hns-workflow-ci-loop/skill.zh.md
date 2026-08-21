---
name: hns-workflow-ci-loop
description: >
  Unified CI watch + auto-fix loop skill. Polls gh pr checks after /moai sync PR creation,
  classifies required vs auxiliary failures, attempts safe automated patches (max 3 iterations),
  and escalates semantic failures to the user. Use for CI loop workflow — NOT for general
  loop iteration patterns (see moai-workflow-loop).

when_to_use: >
  Use for the CI watch and auto-fix loop after /moai sync PR creation:
  polling gh pr checks, classifying required vs auxiliary failures, safe
  automated patch attempts (max 3 iterations), and escalation of semantic
  failures.

license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Bash, Read
user-invocable: false
metadata:
  version: "0.1.0"
  category: "workflow"
  status: "active"
  updated: "2026-05-22"
  tags: "ci, watch, autofix, polling, github-actions, required-checks, force-push-prohibited"

progressive_disclosure:
  enabled: true
  level1_tokens: 120
  level2_tokens: 5000
---
# CI 循环（`hns-workflow-ci-loop`）

统一的 CI 监视与自动修复循环。编排器在 `/moai sync`
第 4 阶段（`gh pr create`）返回 PR 编号后调用此技能。该技能轮询必要检查，将
失败分为机械性失败与语义性失败，最多尝试 3 轮安全补丁，并通过 AskUserQuestion
上报语义性失败。

## 快速参考

**触发条件**：`/moai sync` 第 4 阶段创建 PR 后返回 PR 编号，或需要对现有 PR
进行 CI 监控。

**两个阶段，一个技能**：
1. **监视** — 每 30 秒轮询一次 `gh pr checks`，通过
   `.github/required-checks.yml` SSoT 对必要检查和辅助检查进行分类；在通过、失败或超时时退出。
2. **自动修复** — 必要检查失败（退出码 2）时，接收 JSON 移交数据，最多执行 3 轮补丁
   迭代，并立即上报语义性失败。

**单行命令**：
```bash
MOAI_CIWATCH_GH=gh sh scripts/ci-watch/run.sh <PR_NUMBER> <BRANCH>
```

**退出码**：
- `0` — 所有必要检查均已通过 → 进入可合并 AskUserQuestion
- `1` — 致命错误 → 显示修复措施
- `2` — 必要检查失败 → JSON 移交 → 自动修复阶段
- `3` — 达到 30 分钟硬超时 → 显示阻塞消息并交还控制权

**硬性不变量**：
- AskUserQuestion 仅限编排器使用 — CLI、shell 脚本以及 `manager-develop`（cycle_type=autofix）子代理绝不能调用它。
- 绝对禁止强制推送（`--force`、`-f`、`--force-with-lease` 均被禁用）。
- 自动修复最多迭代 3 轮；第 4 轮及以后必须触发阻塞性的 AskUserQuestion。
- 语义性失败（竞态、死锁、panic、断言）绝不进行自动修补。
- 受保护文件：`.env*`、凭据、`.claude/settings*.json`、`.github/required-checks.yml`、
  `scripts/ci-watch/run.sh`。

## 实施指南

### 阶段 1 — 监视循环

**轮询频率**：至少 30 秒一次（受 GitHub API 速率限制影响）。可通过
`CIWATCH_POLL_INTERVAL` 环境变量覆盖，生产环境中绝不能低于 30。测试模式使用
`MOAI_CIWATCH_NO_SLEEP=1`（单次轮询后退出）。

**30 分钟硬超时**：`CIWATCH_TIMEOUT_SECONDS=1800` 为默认值。超时时以退出码 3 退出。
不要自动重启。

**必要检查与辅助检查**：必要检查位于 `.github/required-checks.yml`
`branches.<pattern>.contexts` 中。列在 `auxiliary:` 下的辅助检查绝不能阻止
进入可合并状态。禁止在脚本中硬编码检查名称。

**状态文件**：`.moai/state/ci-watch-active.flag`（YAML）。跟踪 `pr_number`、`started_at`、
`heartbeat_at`、`required_checks`、`abort_requested`。心跳停滞超过 90 秒时允许
接管。中止命令：`moai pr watch --abort`。

**后台监视标准化**：对于长时间运行的 PR（5 分钟以上），使用
`gh pr checks <PR> --watch`，并通过 `run_in_background: true` 调用。禁止使用休眠加轮询循环 —
它们会阻塞编排器的主会话。

**状态报告格式**（stderr，仅在状态变化的轮询周期输出，不使用 ANSI）：
```
[ci-watch] PR #<N>: required 4/6 pass, 2 pending; advisory 0 fail
```

**退出码为 2 时的移交模式** — 具有稳定字段的 JSON：`prNumber`、`branch`、
`failedChecks[]`（每个条目为 `{name, runId, logUrl}`）、`auxiliaryFailCount`、
`totalRequired`。字段稳定性：`name`、`runId`、`logUrl` 是稳定契约 — 不要
重命名。模式来源：CI-watch 移交结构体。

### 阶段 2 — 自动修复循环

**进入条件**：`ci-watch` 以状态码 2 退出 + 有效的 JSON 交接数据。状态文件：
`.moai/state/ci-autofix-<PR>.json`（按 PR 划分，过期阈值为 24 小时）。

**OQ2 节奏矩阵**（迭代行为的唯一事实来源）：

- 第 1 次迭代，任意 mechanical sub_class → 通过 AskUserQuestion 确认并应用（第 1 个选项 =
  "应用补丁（推荐）"）。
- 第 1 次迭代，semantic/unknown → 通过 AskUserQuestion 上报诊断报告（不尝试补丁）。
- 第 2-3 次迭代，mechanical + sub_class=trivial → 静默应用并记录日志（不调用 AskUserQuestion）。
- 第 2-3 次迭代，mechanical + sub_class=non-trivial → 通过 AskUserQuestion 确认并应用。
- 第 2-3 次迭代，semantic/unknown → 通过 AskUserQuestion 上报（不应用补丁）。
- 第 4 次及后续迭代 → 必须调用阻塞式 AskUserQuestion（无计时器，选项：手动修复 / 修订
  SPEC / 放弃 PR）。

"trivial" = 空白、gofmt/goimports、导入顺序（匹配 `classify.sh` `RX_TRIVIAL_*`）。

**补丁提交规则**：每个补丁 = 一个新提交。格式：
`fix(ci): auto-fix <classification> failure (iter <N>)`。推送后，重新调用
`scripts/ci-watch/run.sh` 以重启监视循环。

**第 4 次及后续迭代的上报处理**（必须阻塞，不得静默超时）：
1. （推荐）手动修复 — 手动调查并修复
2. 修订 SPEC — 修订 SPEC 并重新开始实现
3. 放弃 PR — 关闭 PR 并放弃此方案

**`manager-develop` (cycle_type=autofix) 的生成提示词**会注入：交接 JSON、classification + sub_class、
失败的 CI 日志 + PR 差异、模式指令（mechanical → 提议 unified-diff 补丁；
semantic/unknown → 仅返回诊断，不提供补丁）。硬性要求：子代理不得调用 AskUserQuestion —
仅返回 Markdown。

**审计日志**：`.moai/logs/ci-autofix/<PR-NNN>-<YYYY-MM-DD>.md`。仅追加。每次
迭代记录 classification、sub_class、action、patch_sha、escalation_reason。

### 受保护文件（绝不自动修改）

- `**/.env`, `**/.env.*`
- `**/credentials*`, `**/*_key.json`, `**/*secret*`
- `.claude/settings.json`, `.claude/settings.local.json`
- `.github/required-checks.yml`（Wave 1 SSoT，Wave 2/3 只读）
- `scripts/ci-watch/run.sh`（Wave 2 不变量）

如果 `manager-develop` (cycle_type=autofix) 子代理提出的补丁涉及其中任何文件，请拒绝并上报。

### Go 辅助程序和 Shell 脚本

Go 辅助程序：CI 监视分类器（required-vs-auxiliary）、交接 JSON-schema
结构体、监视状态文件，以及 PR 监视报告生成器（`EmitReadyToMergeReport`、
`EmitFailureHandoff`）。Shell：`scripts/ci-watch/run.sh`（主
循环，通过 `MOAI_CIWATCH_GH` 模拟）；`scripts/ci-watch/lib/classify.sh`（yq + grep
回退方案）；`scripts/ci-autofix/log-fetch.sh`（失败日志 + PR 差异）；
`scripts/ci-autofix/classify.sh`（mechanical 与 semantic 分类）。

**gh CLI 兼容性**：`workflow` JSON 字段要求 `gh >= 2.50`。在较旧版本的 `gh` 上，
`classify.sh` 会回退到基于 `required:` 列表的名称启发式判断。

## 配合良好的组件

- `manager-develop` (cycle_type=autofix) — 执行失败诊断和补丁提议的子代理
- `manager-git` — 提交/推送自动修复补丁
- `.claude/rules/moai/workflow/ci-watch-protocol.md` — 硬性监视调用契约
- `.claude/rules/moai/workflow/ci-autofix-protocol.md` — 硬性自动修复调用契约
- `.github/required-checks.yml` — Wave 1 SSoT

## 常见的错误理由

- “小型 PR 可以跳过监视循环”——小型 PR 也可能无法通过 CI。循环无需额外成本，还能省去手动轮询。
- “辅助检查失败应阻止合并”——根据 SSoT 的定义，此类检查仅提供建议。如需更改分类，请编辑 `required-checks.yml`。
- “即使是语义失败也尝试自动修补”——语义失败（竞态、断言）无法在缺少上下文的情况下自动修补；错误的补丁反而更糟。
- “使用强制推送来清理历史记录”——强制推送会破坏审查者查看差异的能力。始终创建新提交。
- “在第 3 次迭代后超时”——禁止静默超时；必须由用户明确决定。
- “不经确认直接应用简单修复”——第 1 次迭代始终需要确认；第 2 次及后续迭代中的简单修复可以静默应用。

## 危险信号

- `manager-develop` (cycle_type=autofix) 子代理调用 AskUserQuestion（硬性要求：仅限编排器调用）
- 第 4 次迭代在没有阻塞式 AskUser 的情况下自动继续
- 脚本中的任何位置出现 `git push --force` / `-f` / `--force-with-lease`
- 语义分类触发补丁尝试
- 状态文件缺失 → 迭代计数器丢失 → 存在无限循环风险
- 监视轮询间隔小于 30 秒（存在速率限制风险）
- 修改 `required-checks.yml` 后未重新运行 `moai github init`

## 验证

- [ ] `bash scripts/ci-watch/test/run_test.sh` 通过所有 shell 测试
- [ ] `go test ./internal/ciwatch/... ./internal/cli/pr/... -race` 通过
- [ ] `internal/ciwatch/` 覆盖率 >= 85%
- [ ] `FormatStatusUpdate()` 输出中不包含 ANSI 代码
- [ ] `EmitReadyToMergeReport` 的第一个选项带有 `(Recommended)`
- [ ] CLI 不调用 AskUserQuestion
- [ ] `grep -r 'push -f\|push --force' scripts/ci-autofix/ scripts/ci-watch/` 不返回任何匹配项
- [ ] 审计日志 `.moai/logs/ci-autofix/<PR>-<DATE>.md` 包含每次迭代

<!-- 根据技能整合策略，从 moai-workflow-ci-watch + moai-workflow-ci-autofix 吸收 -->