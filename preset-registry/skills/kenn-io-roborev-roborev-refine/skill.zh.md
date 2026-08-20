---
name: roborev-refine
description: Use only when the user explicitly invokes /roborev-refine
disable-model-invocation: true
---
# roborev-refine

迭代式审查-修复循环：审查当前分支或提交范围，修复发现的问题，提交，
重新审查，并重复此过程，直到所有审查通过或达到迭代次数上限。

与 `/roborev-fix`（不重新审查的单次修复）不同，refine 会在每次修复后通过重新审查
来验证发现的问题是否已解决，从而形成闭环。

此 skill 应在当前编码智能体 CLI 中执行 refine 工作流。不要只是通过 shell 调用 `roborev refine`。

## 用法

```
/roborev-refine [--since <commit>] [--branch <name>] [--max-iterations <n>]
```

## 仅限显式调用

调用必须是显式的：字面量个人 `/roborev-refine`，或结构化的
Grok Build skill 选择。
诸如“refine this change”之类未通过这些显式机制之一发出的请求，必须使用原生
行为，且不得运行 roborev。

- `--since <commit>`：refine 此提交之后的提交（不包括该提交）；在默认分支上为必需项
- `--branch <name>`：在 refine 前验证当前分支是否匹配
- `--max-iterations <n>`：最大修复-审查循环次数（默认值：10）

此 skill 有意聚焦于当前分支流程。它不公开
`roborev refine --all-branches` 或 `roborev refine --list`。

## 沙箱访问

roborev 使用本地守护进程。如果命令因 `permission denied` 而失败，沙箱可能正在
阻止访问其回环端口或 Unix 套接字。请使用运行时支持的沙箱权限提升机制重试相同命令。不要启动或重启守护进程，因为
沙箱化的状态探测无法连接到它。

## 不应调用此 skill 的情况

当用户正在展示或粘贴现有审查
结果，或者他们只想进行一次审查而不修复时，请勿调用此 skill。仅审查请使用
`/roborev-review-branch`，仅修复请使用 `/roborev-fix`。

## 重要

此 skill 要求你**执行 bash 命令**来验证输入、启动
审查并等待重新审查。只有当 refine 循环完成并且你向用户展示结果后，任务才算完成。

这些说明是指导原则，而非严格脚本。请结合对话
上下文。跳过已经满足的步骤。当项目级
AGENTS.md 指令与这些步骤冲突时，应遵从前者。

## 说明

当用户调用 `/roborev-refine [--since <commit>] [--branch <name>] [--max-iterations <n>]` 时：

### 1. 验证输入和 refine 上下文

如果提供了 `--branch`，请在执行任何
工作前验证当前分支是否匹配。如果不匹配，则停止并告知用户。

如果提供了 `--since`，请使用下面按 since 范围限定的审查片段；它们会安全地存储原始值，
验证其能解析为有效提交且是 `HEAD` 的祖先，然后在同一个 shell 调用中运行审查。

如果未提供 `--since`，请确保你并非正在 refine 默认分支。
这与 `roborev refine` 的行为一致：它拒绝在未提供 `--since` 的情况下于默认分支
运行。

如果提供了 `--max-iterations`，请解析它（默认值：10）。这是修复-审查循环的最大次数，
而不是审查总次数。

### 2. 运行初始审查

选择与请求范围匹配的审查命令：

```bash
read -r since <<'ROBOREV_REF'
<commit>
ROBOREV_REF
resolved_since=$(git rev-parse --verify -- "$since^{commit}") || exit 1
git merge-base --is-ancestor "$resolved_since" HEAD || exit 1
roborev review --since "$since" --wait
```

或者，如果未提供 `--since`：

```bash
roborev review --branch --wait
```

`--since` 是 `roborev refine --since` 最接近的手动等效命令。
`--branch` 会审查当前分支相对于其 merge-base 的变更。

**注意：** 当判定结果为 Fail 时，`--wait` 会以代码 1 退出。这是
预期行为。无论退出代码是什么，都必须始终捕获命令输出并检查
该输出，以确定审查是通过还是失败。

审查完成后，读取并解析输出。从
`Enqueued job <id> for ...` 行或审查标头中提取 job ID — 后续添加评论和
关闭审查时需要使用该 ID。

**Panels：** 如果配置了 `default_panel`（或审查以其他方式分发
到 panel），则 `Enqueued job <id>` 对应的是综合（父）job。所有
通过/失败决策都必须以父 job 的判定结果为准，并且要对该父 job 添加评论和关闭
操作 — 绝不能操作单个成员 job。重新审查会重新运行同一个 panel。

如果命令输出包含错误（daemon 未运行、repo 未初始化、审查出错），
请报告该错误。如果需要检查 daemon，建议运行 `roborev status`；如果 repo
尚未初始化，建议运行 `roborev init`。

如果审查**通过**，告知用户并停止。不需要修复。

### 3. 修复审查循环

如果审查**失败**，开始迭代循环。每次迭代（最多执行 `--max-iterations` 次）：

#### 3a. 修复发现的问题

从审查输出中解析发现的问题。收集每条发现的问题及其严重性、
文件路径和行号。然后：

1. **按严重性排序**：先修复 HIGH 级别的问题，然后是 MEDIUM，最后是 LOW
2. **按文件分组**：在每个严重性级别内，将同一文件的编辑批量处理，
   以尽量减少上下文切换
3. 如果某些发现的问题无法修复（误报、设计上的有意安排），请在评论中
   记录，而不是默默跳过

如果某条发现的问题上下文不明确，请读取相关源文件，以便在修改代码前
理解代码。

#### 3b. 运行测试

运行项目的测试套件以验证修复：

```bash
go test ./...
```

或者运行项目所使用的其他测试命令。如果测试失败，请先修复回归问题，
再继续后续步骤。

#### 3c. 提交，然后记录评论并关闭审查

按照项目约定先提交（参见 AGENTS.md）。只有提交成功后，才在审查中记录摘要评论并关闭审查：

```bash
roborev comment --commenter roborev-refine --job <job_id> -m "$(cat <<'ROBOREV_COMMENT'
<summary of changes>
ROBOREV_COMMENT
)"
# Only if the comment above succeeded:
roborev close <job_id>
```

对于 panel 审查，`<job_id>` 是综合父 job；关闭它即可关闭审查 — 不要关闭
单个成员 job。

**重要：** 始终像上面这样通过 heredoc 传递评论文本，绝不要将动态文本直接
插值到 shell 字符串中。审查派生的内容可能包含 shell 元字符，从而导致意外执行。

评论应按严重性和文件引用每项发现，说明已修复的内容，并注明跳过任何已驳回发现的原因。这些评论会包含在重新审查提示中。请保持简洁。

#### 3d. 重新审查

提交后，执行一次与原始 refine 范围一致的、明确的全范围重新审查。不要因为新提交的 `roborev wait` 结果通过就认为可以停止——完整的分支或提交范围审查必须通过后，才能报告成功。

如果安装了提交后钩子，该提交可能已加入一个限定提交范围的审查任务。检查该任务，以便将其清理：

```bash
roborev wait
```

如果 `roborev wait` 找到任务，请记住其任务 ID（从输出中获取），将其作为钩子审查任务。如果它报告 "No job found"，则继续执行，无需任务 ID。

**注意：** `roborev wait` 会将 HEAD 解析为单个 SHA，因此它只能找到限定提交范围的钩子审查。分支模式的钩子审查（存储在范围引用下）无法通过这种方式发现——它们会被下面的明确审查取代。

现在运行明确的全范围审查。如果使用 `--since` 进行 refine：

```bash
read -r since <<'ROBOREV_REF'
<commit>
ROBOREV_REF
resolved_since=$(git rev-parse --verify -- "$since^{commit}") || exit 1
git merge-base --is-ancestor "$resolved_since" HEAD || exit 1
roborev review --since "$since" --wait
```

如果不使用 `--since` 进行 refine：

```bash
roborev review --branch --wait
```

**获取任务 ID：** 从审查命令输出中的
`Enqueued job <id> for ...` 行提取任务 ID。

如果之前找到了钩子审查任务，现在将其关闭，以免 refine 留下过时的限定提交级别审查任务处于打开状态：

```bash
roborev close <hook_job_id>
```

- 如果明确的全范围审查**通过**：告知用户并停止。该分支或请求的提交范围没有问题。
- 如果审查**失败**：使用新的任务 ID 继续下一轮迭代（返回步骤 3a）。

### 4. 达到迭代上限

如果达到最大迭代次数后，明确的全范围审查仍然失败，请告知用户已完成的迭代次数以及剩余的发现，并建议他们手动检查剩余发现，或运行 `/roborev-fix` 进行有针对性的处理。

## 示例

**功能分支上的默认 refine：**

用户：`/roborev-refine`

代理：
1. 验证当前分支不是默认分支
2. 运行 `roborev review --branch --wait`
3. 审查返回结论 Fail，并包含 2 项发现
4. 在代码中修复两项发现
5. 运行 `go test ./...` — 通过
6. 提交更改
7. 记录评论并关闭旧的审查
8. 运行 `roborev wait` — 如果找到钩子审查，则记住任务 ID，以便稍后关闭
9. 运行 `roborev review --branch --wait`
10. 如果找到钩子审查任务，则将其关闭
11. 完整的分支审查返回 Pass
12. 告知用户：“分支审查在 1 轮修复迭代后通过。所有发现均已解决。”

**从特定起始提交开始 refine：**

用户：`/roborev-refine --since abc123 --max-iterations 3`

代理：
1. 验证 `abc123` 可解析且是 `HEAD` 的祖先
2. 运行 `roborev review --since abc123 --wait`
3. 审查返回结论 Fail
4. 修复发现、测试、提交、添加评论并关闭审查
5. 通过 `roborev wait` 检查钩子审查 — 如果找到限定提交范围的审查，则记住其任务 ID，以便在下一次明确运行 `roborev review --since abc123 --wait` 后将其关闭
6. 持续执行，直到完整的请求范围通过，或达到 3 次迭代上限

## 另请参阅

- `/roborev-review-branch` — 审查但不修复
- `/roborev-fix` — 单次修复，不进行重新审查
- `/roborev-respond` — 对审查发表评论并关闭审查，不修复代码