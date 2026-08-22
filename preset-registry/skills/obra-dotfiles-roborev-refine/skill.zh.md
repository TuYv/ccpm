---
name: roborev-refine
description: Iterative review-fix loop for the current branch — reviews via daemon, fixes inline, re-reviews until passing or max iterations reached
---
# roborev-refine

迭代式审查-修复循环：审查当前分支或提交范围，修复发现的问题，提交，再次审查，并重复此过程，直到所有审查都通过或达到迭代次数上限。

与 `$roborev-fix`（不进行再次审查的单次修复）不同，refine 会在每次修复后重新审查，从而形成闭环，验证发现的问题是否已解决。

此 Skill 应在当前编码代理 CLI 内执行 refine 工作流。不要只是通过 shell 调用 `roborev refine`。

## 用法

```
$roborev-refine [--since <commit>] [--branch <name>] [--max-iterations <n>]
```

- `--since <commit>`：优化此提交之后（不含此提交）的提交；在默认分支上必须提供
- `--branch <name>`：在优化前验证当前分支是否匹配
- `--max-iterations <n>`：修复-审查循环的最大次数（默认值：10）

此 Skill 有意专注于当前分支流程。它不提供 `roborev refine --all-branches` 或 `roborev refine --list`。

## 不应调用此 Skill 的情况

当用户正在展示或粘贴现有审查结果，或只希望进行一次审查而不修复时，请勿调用此 Skill。仅审查时使用 `$roborev-review-branch`，仅修复时使用 `$roborev-fix`。

## 重要

此 Skill 要求你**执行 bash 命令**来验证输入、启动审查并等待重新审查。只有在 refine 循环结束并向用户展示结果后，任务才算完成。

这些指令是指导原则，而非僵化的脚本。请结合对话上下文。跳过已经满足的步骤。当这些步骤与项目级 CLAUDE.md 指令冲突时，以后者为准。

## 指令

当用户调用 `$roborev-refine [--since <commit>] [--branch <name>] [--max-iterations <n>]` 时：

### 1. 验证输入和 refine 上下文

如果提供了 `--branch`，请在执行任何操作前验证当前分支是否匹配。如果不匹配，请停止并告知用户。

如果提供了 `--since`，请验证它能解析为有效提交，并且是 `HEAD` 的祖先。

如果未提供 `--since`，请确保当前不是在默认分支上进行优化。这与 `roborev refine` 的行为一致：在默认分支上未提供 `--since` 时，它会拒绝运行。

如果提供了 `--max-iterations`，请解析其值（默认值：10）。这是修复-审查循环的最大次数，而不是审查总次数。

### 2. 运行初始审查

选择与请求范围相匹配的审查命令：

```bash
roborev review --since <commit> --wait
```

或者，如果未提供 `--since`：

```bash
roborev review --branch --wait
```

`--since` 是与 `roborev refine --since` 最接近的手动等效方式。`--branch` 会相对于当前分支的合并基点审查当前分支。

**注意：** 当结论为 Fail 时，`--wait` 会以代码 1 退出。这是预期行为。无论退出代码是什么，都要捕获命令输出并检查它，以确定通过还是失败。

审查完成后，读取并解析输出。从 `Enqueued job <id> for ...` 行或审查标题中提取任务 ID——稍后添加评论和关闭任务时需要用到它。

**评审组：**如果配置了 `default_panel`（或评审因其他原因分派给了评审组），则 `Enqueued job <id>` 指的是综合（父）任务。所有通过/失败的判断都必须以父任务的结论为准，并在该父任务上发表评论及将其关闭——绝不要对单个成员任务执行这些操作。重新评审会再次运行同一个评审组。

如果命令输出包含错误（守护进程未运行、仓库未初始化、评审出错），请报告该错误。建议使用 `roborev status` 检查守护进程，或者在仓库未初始化时使用 `roborev init`。

如果评审**通过**，请告知用户并停止。无需修复。

### 3. 修复-评审循环

如果评审**失败**，则开始迭代循环。对于每次迭代（最多执行 `--max-iterations` 次）：

#### 3a. 修复发现的问题

解析评审输出中的问题。收集每个问题的严重程度、文件路径和行号。然后：

1. **按严重程度排序**：先修复 HIGH 级问题，然后是 MEDIUM，最后是 LOW
2. **按文件分组**：在每个严重级别内，批量编辑同一个文件，以尽量减少上下文切换
3. 如果某些问题无法修复（误报、有意的设计），请将其记录下来以便在评论中说明，而不是不作解释地跳过

如果某个问题的上下文不明确，请先阅读相关源文件以理解代码，然后再进行修改。

#### 3b. 运行测试

运行项目的测试套件以验证修复：

```bash
go test ./...
```

或者运行项目使用的其他测试命令。如果测试失败，请先修复回归问题，然后再继续。

#### 3c. 提交，然后记录评论并关闭评审

首先按照项目约定（参见 CLAUDE.md）进行提交。只有在提交成功后，才在评审中记录总结评论并将其关闭：

```bash
roborev comment --commenter roborev-refine --job <job_id> -m "$(cat <<'ROBOREV_COMMENT'
<summary of changes>
ROBOREV_COMMENT
)"
# Only if the comment above succeeded:
roborev close <job_id>
```

对于评审组评审，`<job_id>` 是综合父任务；关闭它即会关闭评审——不要关闭单个成员任务。

**重要：**始终如上所示通过 heredoc 传递评论文本，绝不要通过将动态文本直接插入 shell 字符串来传递。评审产生的内容可能包含 shell 元字符，从而导致意外执行。

评论应按严重程度和文件引用每个问题，说明修复了哪些内容，并注明为何跳过任何被驳回的问题。这些评论会包含在重新评审提示中。请保持简洁。

#### 3d. 重新评审

提交后，运行与原始优化范围一致的显式全范围重新评审。不要仅因新提交的 `roborev wait` 结果通过就停止——必须等完整分支或提交范围评审通过后，才能报告成功。

如果安装了提交后钩子，此次提交可能已将一个提交范围的评审加入队列。请检查该评审，以便将其清理：

```bash
roborev wait
```

如果 `roborev wait` 找到了任务，请记住其任务 ID（来自输出），并将其作为钩子评审任务。如果它报告 "No job found"，则在没有该任务的情况下继续。

**注意：** `roborev wait` 会将 HEAD 解析为单个 SHA，因此它只能找到
提交范围的钩子审查。分支模式的钩子审查（存储在范围引用下）
无法通过这种方式发现——它们将被下面的显式审查取代。

现在运行显式的全范围审查。如果使用 `--since` 进行优化：

```bash
roborev review --since <commit> --wait
```

如果不使用 `--since` 进行优化：

```bash
roborev review --branch --wait
```

**获取任务 ID：** 从审查命令输出中的
`Enqueued job <id> for ...` 行提取。

如果之前找到了钩子审查任务，现在将其关闭，以免优化过程遗留
仍处于开启状态的提交级审查：

```bash
roborev close <hook_job_id>
```

- 如果显式全范围审查**通过**：告知用户并停止。该
  分支或请求的提交范围没有问题。
- 如果审查**失败**：使用新的任务 ID 继续下一次迭代（返回步骤 3a）。

### 4. 达到迭代次数上限

如果达到最大迭代次数后，显式全范围审查仍然失败，请告知用户已完成
多少次迭代、还剩哪些发现项，并建议其手动审查剩余发现项，或运行
`$roborev-fix` 进行有针对性的处理。

## 示例

**功能分支上的默认优化：**

用户：`$roborev-refine`

代理：
1. 验证当前分支不是默认分支
2. 运行 `roborev review --branch --wait`
3. 审查返回失败结论，并包含 2 个发现项
4. 修复代码中的两个发现项
5. 运行 `go test ./...` — 通过
6. 提交更改
7. 记录评论并关闭旧审查
8. 运行 `roborev wait` — 如果找到钩子审查，记住任务 ID，以便稍后关闭
9. 运行 `roborev review --branch --wait`
10. 如果找到了钩子审查任务，则将其关闭
11. 完整分支审查返回通过结论
12. 告知用户：“经过 1 次修复迭代后，分支审查已通过。所有发现项均已解决。”

**从特定起始提交开始优化：**

用户：`$roborev-refine --since abc123 --max-iterations 3`

代理：
1. 验证 `abc123` 可以解析，并且是 `HEAD` 的祖先
2. 运行 `roborev review --since abc123 --wait`
3. 审查返回失败结论
4. 修复发现项、测试、提交、评论并关闭
5. 通过 `roborev wait` 检查钩子审查 — 如果找到提交范围的钩子审查，则记住它，以便在下一次显式执行 `roborev review --since abc123 --wait` 后将其关闭
6. 继续操作，直到请求的完整范围通过审查或用尽 3 次迭代

## 另请参阅

- `$roborev-review-branch` — 仅审查，不修复
- `$roborev-fix` — 单次修复，不重新审查
- `$roborev-respond` — 对审查发表评论并将其关闭，但不修复代码