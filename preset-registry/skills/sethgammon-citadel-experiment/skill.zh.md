---
name: experiment
license: MIT
description: >-
  Automated optimization loop with scalar fitness function. Proposes changes in
  isolated worktrees, measures with a metric command, keeps improvements, discards
  failures. Supports convergence detection and diminishing returns.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - experiment
  - optimize
  - try
  - A/B
  - measure
last-updated: 2026-03-21
---
# /experiment — 指标驱动的优化循环

## 输入

用户提供三项内容：
1. **scope**：要修改的文件（glob 模式，例如 "src/api/**/*.ts"）
2. **metric**：输出单个数字的 shell 命令（例如 `npm run build 2>&1 | tail -1 | grep -oP '\d+'`）
3. **budget**：迭代次数上限（默认：5）或时间上限（例如 "10 minutes"）

如果缺少任何输入，请向用户询问。该指标必须向 stdout 输出单个数字。

## 协议

### 步骤 1：基线

1. 暂存（stash）所有未提交的更改（退出时恢复）
2. 运行指标命令。记录基线值。
3. 确定优化方向：是数值越低越好（如包体积、错误数），还是越高越好（如 FPS、测试数）？
   如果不明确，请询问用户。
4. 记录日志：`Baseline: {value} ({metric command})`

### 步骤 2：迭代

对每次迭代（直至达到预算上限）：

1. **创建隔离**：在 worktree 中生成一个子代理（`isolation: "worktree"`）
2. **提出变更**：该代理在范围内修改文件以改进指标。
   提供上下文：基线值、指标方向、范围、之前各次迭代尝试了什么。
3. **测量**：在 worktree 中运行指标命令（通过 `node scripts/run-with-timeout.js 300`）
4. **门控**：运行类型检查（同样通过超时包装器）。如果失败，立即丢弃。
5. **评估**：
   - 有改进？→ 保留（KEEP）。合并该 worktree 分支。新基线 = 新值。
   - 持平或更差？→ 丢弃（DISCARD）。删除该 worktree。
6. **记录迭代日志**：
   ```
   Iteration {N}: {value} ({delta from baseline}) → {KEEP|DISCARD}
   Change: {one-line description of what was tried}
   ```

### 步骤 3：收敛检查

每次迭代之后，检查：
- **局部最优**：最近 3 次迭代全部被丢弃 → 停止（“未发现更多改进”）
- **收益递减**：最近一次保留的改进 < 0.5% → 停止（“收益递减”）
- **预算耗尽**：迭代次数或时间超限 → 停止

### 步骤 4：报告

将结果写入 `.planning/research/experiment-{slug}.md`：

```
# Experiment: {Description}

> Metric: `{command}`
> Direction: {lower|higher} is better
> Scope: {glob pattern}
> Budget: {N iterations}
> Date: {ISO date}

## Results

| Iteration | Value | Delta | Verdict | Change |
|-----------|-------|-------|---------|--------|
| baseline  | {N}   | —     | —       | —      |
| 1         | {N}   | {+/-} | KEEP    | {desc} |
| 2         | {N}   | {+/-} | DISCARD | {desc} |

## Outcome
- **Start**: {baseline}
- **End**: {final value}
- **Improvement**: {percentage}
- **Iterations**: {kept}/{total}
- **Stop reason**: {convergence|diminishing|budget}

## Kept Changes
{List of changes that were kept, with commit hashes}
```

同时记录到 `.planning/telemetry/agent-runs.jsonl`：
```json
{"event":"experiment-complete","slug":"{slug}","baseline":0,"final":0,"improvement":"0%","kept":0,"total":0,"timestamp":"ISO"}
```

## 常用指标

| 目标 | 指标命令 |
|------|---------------|
| 减小包体积 | `npm run build 2>&1 \| grep -oP 'Total size: \K\d+'` |
| 减少类型错误 | `npx tsc --noEmit 2>&1 \| grep -c 'error TS'` |
| 提高测试通过率 | `npm test 2>&1 \| grep -oP '\d+ passing'` |
| 减少文件数量 | `find src -name '*.ts' \| wc -l` |
| 减少代码行数 | `wc -l src/**/*.ts \| tail -1 \| awk '{print $1}'` |

## 适用场景

- 当你想优化一个可度量的指标（包体积、错误数、测试覆盖率、FPS）
- 当你有明确的假设，但不确定几种方案中哪一种更优
- 当手动 A/B 测试太慢或容易出错时
- 不适用于目标是主观的场合（“让它感觉更好”）——指标必须是一个数字

## 安全规则

- 绝不修改范围之外的文件
- 始终使用 worktree 隔离来进行变更
- 在保留一个变更之前，始终先运行类型检查
- 退出时恢复已暂存的更改（即使出错也要恢复）
- 如果指标命令执行失败，按丢弃（DISCARD）处理（而不是崩溃）

## 情境门控

**披露：**“正在对 [目标] 运行实验循环，适应度：[函数]。每次迭代都会提交。预算：[N 次迭代]。”
**可逆性：** 琥珀色（amber）——会在多次迭代中修改源文件；每次迭代都会提交；对保留的提交使用 `git revert` 撤销。
**信任门控：**
- 熟悉（5 次以上会话）：可自主迭代并提交；新手应使用 /improve，并在各步骤之间进行人工审查。

## 质量门控

- 基线在任何迭代开始之前就已测量
- 每次被保留的迭代都改进了指标且通过了类型检查
- 每次被丢弃的迭代都有记录在案的原因
- 停止原因是以下之一：收敛、收益递减或预算耗尽
- 实验报告存在于 `.planning/research/experiment-{slug}.md`，且所有迭代行均已填写

## 边缘情况

**指标命令无输出或输出非数字文本**：视为指标失败。在开始迭代之前，请用户提供一个向 stdout 输出单个数字的命令。

**不支持 worktree**（例如浅克隆）：退回到分支隔离。创建一个分支，在其中进行变更、测量，然后删除或合并该分支。绝不直接修改工作树。

**如果 .planning/research/ 不存在**：在写入实验报告之前先创建它。如果 `.planning/` 本身不存在，则创建完整路径，或将报告内联输出。

**预算耗尽且保留下来的迭代为零**：将结果报告为“未发现改进”。这是一个有效的结果——不要超出预算继续执行。

## 退出协议

```
---HANDOFF---
- Experiment: {description}
- Result: {baseline} → {final} ({improvement}%)
- Kept: {N}/{total} iterations
- Stop reason: {reason}
- Report: .planning/research/experiment-{slug}.md
- Reversibility: amber — undo kept iterations with `git revert` on each kept commit
---
```
