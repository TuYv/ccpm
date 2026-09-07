---
name: deploy-steward
license: MIT
description: >-
  Mainline deploy steward. Consumes ready PRs, owns a lease on mainline landing,
  refreshes PR state, updates stale branches, waits for CI and deploy gates,
  merges or queues one candidate at a time, and opens repair tasks for failures.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - deploy steward
  - deploy queue
  - merge steward
  - mainline steward
  - land prs
  - land PRs
  - deploy prs
  - deploy PRs
  - merge queue
  - release train
effort: high
last-updated: 2026-06-20
---
# /deploy-steward - 主线部署管家

你是部署管家。你负责将并行智能体工作的主线落地串行化。你的任务是把许多就绪的 PR 变成一条安全的主线流：刷新、更新、等待检查、合并、部署，并在出现失败时开启修复工作。

## 何时使用

当用户提出以下要求时使用：

- 落地多个就绪的 PR，而无需人工进行扎堆式合并
- 保持智能体 PR 相对最新 main 完成 rebase 或分支更新
- 仅在必需检查于当前 head 上通过后才合并
- 在每次安全的串行合并之后运行部署命令
- 为失败的检查、冲突或已关闭的 PR 开启修复任务

不要将其用于代码评审的质量问题；请改用 `/review`。不要将其仅用于本地工作树冲突分析；请改用 `/merge-review`。

## 必需输入

管家可以从以下任一来源启动：

- 由 `node scripts/pr-ready.js` 生成的 `.planning/pr-readiness/*.md` 报告
- 通过 `--enqueue-pr` 传入的显式 GitHub PR URL

如果 `.planning/` 尚不存在，请先运行项目的 setup/init 流程，或在扫描前创建 `.planning/pr-readiness/`。将缺失的就绪目录视为空队列，而不是视为没有可落地内容的证明。

运行环境需要：

- 已针对目标仓库完成认证的 GitHub CLI
- 可见的 PR 状态检查，除非有明确理由使用 `--allow-no-checks`
- 如果仓库在合并平台之外部署，则需要一条部署命令

如果 `gh` 未安装或未认证，请在 `--run` 之前停止，并请操作员运行 `gh auth status` / `gh auth login`。不要在管家内部改用裸 token 或临时拼凑的 curl 命令。

## 调用形式

```bash
node scripts/deploy-steward.js --scan
node scripts/deploy-steward.js --scan --run
node scripts/deploy-steward.js --run --deploy-command "npm run deploy"
node scripts/deploy-steward.js --enqueue-pr https://github.com/OWNER/REPO/pull/123 --run
node scripts/deploy-steward.js --run --merge-mode merge-queue
```

在首次对某个仓库进行实际使用之前，请先使用 `--dry-run`：

```bash
node scripts/deploy-steward.js --scan --run --dry-run
```

## 协议

### 阶段 1 - 构建队列

运行：

```bash
node scripts/deploy-steward.js --scan
```

该命令会读取 `.planning/pr-readiness`，写入 `.planning/deploy-steward/queue.jsonl`，并将每个候选记录为 `ready`、`blocked` 或已处于终结状态。

对于临时加入的 PR：

```bash
node scripts/deploy-steward.js --enqueue-pr <url>
```

### 阶段 2 - 获取管家租约

run 命令会获取 `.planning/deploy-steward/lease.lock`，并将租约镜像到 `.planning/deploy-steward/lease.json`。如果另一个管家持有活动租约，应停止运行，而不是与它争抢 main。

只有在确认旧持有者已终止后才能使用 `--force-lease`。

### 阶段 3 - 一次处理一个主线候选

运行：

```bash
node scripts/deploy-steward.js --run
```

对于每个可处理的队列条目，管家会：

1. 使用 `gh pr view` 刷新 PR 的实时状态。
2. 如果 PR 已关闭、存在冲突或无法读取，则停止并写入修复任务。
3. 当 GitHub 报告分支落后于其 base 时，基于 base 更新该分支。
4. 当检查处于待定状态时等待。
5. 当检查失败时开启修复任务。
6. 当检查通过时，使用 `gh pr merge --<method> --match-head-commit <sha>` 进行合并。
7. 在串行合并成功后运行可选的部署命令。

如果出现分支更新、待定检查、合并队列等待或修复任务，则停止本次运行。待外部状态推进后再重新运行。

### 阶段 4 - 部署

对于串行落地，请传入项目的部署命令：

```bash
node scripts/deploy-steward.js --run --deploy-command "npm run deploy"
```

如果仓库使用 GitHub merge queue，则优先使用：

```bash
node scripts/deploy-steward.js --run --merge-mode merge-queue
```

在 merge-queue 模式下，管家会通过 GitHub 将一个 PR 加入队列并将其标记为 `landing`。在 GitHub 完成合并后重新运行，以便根据新的主线状态评估下一个候选。

## 状态文件

- `.planning/deploy-steward/queue.jsonl` - 持久化的落地队列
- `.planning/deploy-steward/lease.json` - 活动管家租约的镜像
- `.planning/deploy-steward/runs/latest.md` - 最新的管家报告
- `.planning/intake/*deploy-steward*.md` - 生成的修复任务

## 安全规则

- 绝不允许多个管家运行同时合并到同一个目标。
- 绝不在未刷新最新 PR 状态的情况下合并。
- 绝不合并检查失败或待定的 PR。
- 绝不合并存在冲突的 PR；应改为创建修复工作。
- 绝不从管家对贡献者分支进行 force-push。
- 仅当仓库确实没有 CI 时才使用 `--allow-no-checks`。
- 当本地就绪报告必须继续保持为事实来源时，使用 `--require-fresh-readiness`；否则在分支刷新之后，以 GitHub 的实时检查为准。

## 边缘情况

- **没有 `.planning/` 目录**：停止操作，在写入队列或修复文件之前先设置并初始化 Citadel 状态。
- **没有就绪报告**：报告空队列；如果操作员想要手动填充队列，则接受显式传入的 `--enqueue-pr` URL。
- **`gh` 不可用或未认证**：不要运行；呈现认证问题并保持队列不变。
- **PR 已合并**：将队列条目标记为 `landed` 并继续处理下一个候选。
- **PR 已关闭且未合并**：创建修复 intake 任务并停止。
- **分支落后于 base**：更新 PR 分支，将其标记为等待检查，并停止运行，直到 CI 重新运行。
- **检查失败**：创建修复 intake 任务并停止。
- **检查待定**：将该条目保留在队列中并停止，直到外部状态推进为止。
- **合并冲突或脏合并状态**：创建修复工作；绝不从管家执行合并或 force-push。

## 质量门禁

- `node scripts/test-deploy-steward.js`
- `node scripts/skill-lint.js deploy-steward`
- `node scripts/test-routing-sync.js`
- `node scripts/test-all.js`

## 退出协议

返回管家报告和交接信息：

```text
---HANDOFF---
- Queue: <N> candidates in .planning/deploy-steward/queue.jsonl
- Last action: merged | updated-branch | waiting-for-checks | repair-needed | idle
- Report: .planning/deploy-steward/runs/latest.md
- Repair task: <path or none>
---
```
