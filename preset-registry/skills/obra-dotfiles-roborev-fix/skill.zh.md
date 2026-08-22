---
name: roborev-fix
description: Use when the user asks to fix open failing reviews, invokes $roborev-fix, or provides job IDs; do not use when the user only pastes review findings with no request to discover or close reviews
---
# roborev-fix

一次性修复所有尚未解决且未通过的审查发现。

## 用法

```
$roborev-fix [job_id...]
```

## 何时不应调用此 Skill

不要仅仅因为用户在对话中粘贴了现有的审查发现或审查文本，就调用此 Skill。

如果提示中已经包含需要修复的发现，请将其视为直接的修复输入，并正常处理代码。出现结论、严重级别、文件路径、建议修复方案或复制的审查摘要，本身并不表示要求运行 `$roborev-fix`。

当用户明确调用 `$roborev-fix`、以任何措辞要求修复尚未解决且未通过/未处理的审查、提供需要获取的作业 ID，或同时提供作业 ID 和粘贴的审查发现时，使用此 Skill。

## 重要事项

你必须**执行 bash 命令**才能完成此任务。跳过根据对话上下文已经完成的步骤。发生冲突时，以 CLAUDE.md 为准。

## 说明

当用户调用 `$roborev-fix [job_id...]` 时：

### 1. 收集发现

**首先检查对话。**如果用户已经粘贴了审查发现（结论、严重级别、文件路径、建议修复方案），请直接使用这些内容。不要重新获取对话中已经存在的审查。复用粘贴的发现时，请收集与其一并提及的所有作业 ID——第 5 步需要使用这些 ID 对审查发表评论并将其关闭。如果粘贴的输出中缺少作业 ID，请通过 `roborev fix --list` 查找，并根据提交 SHA 或受审查文件路径，将每项粘贴的发现与正确的作业进行匹配。如果无法确信某项发现对应哪个具体作业，请向用户询问作业 ID，而不要关闭错误的审查。

如果提供了作业 ID，且对话中尚未包含发现，请获取它们：

```bash
roborev show --job <job_id> --json
```

如果既未提供作业 ID，对话中也没有发现，请查找尚未解决且未通过的审查：

```bash
roborev fix --list
```

此命令会列出每个可处理的、尚未解决且未通过的作业，包括其 ID、提交 SHA/ref、代理和摘要（评审组审查显示为其综合父作业）。
收集输出中的作业 ID。

如果命令失败，请向用户报告错误。常见原因包括：守护进程未运行，或仓库尚未初始化（建议运行 `roborev init`）。

如果没有找到尚未解决且未通过的审查，请告知用户没有需要修复的内容。

### 2. 获取审查（如有需要）

如果第 1 步已经获得了发现，请跳过此步骤。

对于每个作业 ID，以 JSON 格式获取完整审查：

```bash
roborev show --job <job_id> --json
```

如果某个作业 ID 的命令执行失败，请报告错误，并继续处理其余作业。

JSON 输出具有以下结构：
- `job_id`：作业 ID
- `output`：包含审查发现的审查文本
- `job.verdict`：通过时为 `"P"`，未通过时为 `"F"`（如果审查出错，则可能为空）
- `job.git_ref`：受审查的 git ref（SHA、范围或合成 ref）
- `closed`：此审查是否已经关闭
- `comments`：此审查下的评论数组（可能为空或不存在）
  - 每条评论包含 `responder`（评论者）和 `response`（评论文本）
  - 来自 `roborev-fix` 或 `roborev-refine` 的评论是自动化工具记录
  - 所有其他评论均来自开发者（用户反馈）

发现的可操作、未关闭且失败的作业可能是一个**综合（评审组）父作业**。其 `output` 和 `job.verdict` 是该评审组中所有评审者的综合结果，因此应完全像处理单个评审一样从父作业着手修复。当作业属于评审组时，`show --json` 还会包含一个新增的顶层 `panel` 块：

- `run_uuid`、`name`、`synthesis_job_id`
- `members`：评审者数组，每个评审者都包含 `job_id`、`name`、`agent`、
  `review_type`、`status` 和 `verdict`（在该成员完成之前为空或不存在）

发现过程只列出父作业（综合作业和非评审组评审），绝不会列出单个成员。
在父作业上发表评论并将其关闭。仅当用户明确要求时，才深入查看成员自己的评审
（`show --json --job <member_job_id>`）。

跳过 `job.verdict` 为 `"P"` 的所有评审（通过的评审没有需要修复的问题）。
跳过 `job.verdict` 为空或缺失的所有评审（该评审可能发生了错误，因而不可操作）。
跳过 `closed` 为 `true` 的所有评审，除非用户明确提供了该作业 ID（在这种情况下，应警告用户并要求确认）。

如果发现的所有评审都已通过、已关闭或因其他原因被跳过，请告知用户没有需要修复的内容。

如果评审包含 `comments`，请遵循其中的所有开发者反馈（误报、首选方法）。

可操作的关闭集合恰好是在步骤 1-2 中收集到的、未被跳过的失败作业 ID。
将这个原始作业列表与稍后由提交钩子或后续评审创建的任何作业分开保存。

### 3. 修复所有问题

如果仅凭评审输出无法明确理解某个问题的上下文，并且 `job.git_ref` 不是 `"dirty"`，请运行 `git show <git_ref>` 查看原始差异。仅在需要时执行此操作——评审输出通常已经包含足够的详细信息（文件路径、行号、描述），可直接修复问题。

从所有失败评审的 `output` 字段中解析问题。收集每个问题的严重程度、文件路径和行号。然后：

1. **按严重程度排序**：先修复 HIGH 问题，然后是 MEDIUM，最后是 LOW
2. **按文件分组**：在每个严重程度级别内，将同一文件的编辑批量处理，以尽量减少上下文切换
3. 如果同一文件包含来自多个评审的问题，请在一次编辑中一并修复
4. 如果某些问题无法修复（误报、有意的设计），请将其记录下来以便在评论中说明，而不是默默跳过

### 4. 运行测试

运行项目的测试套件，以验证所有修复均有效：

```bash
go test ./...
```

或者运行项目所使用的任何其他测试命令。如果测试失败，请先修复回归问题再继续。

### 5. 记录评论并关闭评审

必须遵循关闭顺序。验证修复后，应先对步骤 1-2 中的原始可操作作业 ID 逐一发表评论并关闭，且仅处理这些 ID；完成后才能等待、获取或响应由提交钩子创建的任何新评审。不要将修复后自动生成的评审视为关闭已处理原始评审的前置条件；应在单独的 `$roborev-fix` 周期中处理该新评审。

如果仓库策略要求必须先提交，关闭评论才能引用 SHA，请先执行步骤 6，然后立即返回此处并关闭原始作业集合。否则，请先关闭再提交。

对于每个已修复的原始作业，先记录一条摘要评论，然后将其关闭。请将以下操作作为**独立命令**运行，并且只有在确认评论成功后，才运行 `roborev close`：

```bash
roborev comment --commenter roborev-fix --job <job_id> "<summary of changes>"
# Only if the comment above succeeded:
roborev close <job_id>
```

评论应按严重程度和文件引用每个发现，说明修复了哪些问题，并注明任何有意跳过的发现。内容应保持简洁（1-3 句话）。在 bash 命令中转义引号和特殊字符。

### 6. 提交

遵循项目的提交约定（参见 CLAUDE.md）。如果项目要求始终提交，则无需询问，直接提交。

### 7. 审核原始关闭状态

在最终回复之前，明确审核原始的可操作作业 ID，并验证每一个都报告 `closed=true`：

```bash
roborev show --job <job_id> --json
```

此次审核不要依赖 `roborev list --open`；不相关的未关闭审查可能会掩盖原始待关闭集合是否已得到处理。

## 示例

**提示中粘贴的发现：**

用户：“Roborev 在 foo.go:42 中发现 HIGH 问题，在 bar.go:10 中发现 MEDIUM 问题……”

代理：
1. 将粘贴的发现视为直接修复输入
2. 直接修复代码，不调用 `$roborev-fix`
3. 仅当用户之后要求对特定审查发表评论或将其关闭时，才使用 roborev 命令

**自动发现：**

用户：`$roborev-fix`

代理：
1. 运行 `roborev fix --list`，发现 2 个未关闭且未通过的审查：作业 1019 和作业 1021
2. 分别使用 `roborev show --job 1019 --json` 和 `roborev show --job 1021 --json` 获取这两个审查
3. 对其中一个发现缺少足够上下文的审查运行 `git show <git_ref>`
4. 修复这两个审查中的全部 3 个发现，按严重程度排序并按文件分组
5. 运行 `go test ./...` 进行验证
6. 记录评论并关闭审查：
   - `roborev comment --commenter roborev-fix --job 1019 "Fixed null check and added error handling"`
   - `roborev close 1019`
   - `roborev comment --commenter roborev-fix --job 1021 "Fixed missing validation"`
   - `roborev close 1021`
7. 按照项目约定提交更改；如果仓库策略要求关闭评论中包含 SHA，则在第 6 步之前提交
8. 使用 `roborev show --job <job_id> --json` 审核作业 1019 和 1021，并验证 `closed=true`

**显式作业 ID：**

用户：`$roborev-fix 1019 1021`

代理：
1. 跳过发现过程，直接获取作业 1019 和 1021
2. 作业 1019 的结论为 Fail，包含 2 个发现；作业 1021 的结论为 Pass——跳过 1021，并告知用户
3. 修复作业 1019 中的 2 个发现
4. 运行 `go test ./...` 进行验证
5. 记录评论并关闭审查：
   - `roborev comment --commenter roborev-fix --job 1019 "Fixed null check in foo.go and error handling in bar.go"`
   - `roborev close 1019`
6. 按照项目约定提交更改；如果仓库策略要求关闭评论中包含 SHA，则在第 5 步之前提交
7. 使用 `roborev show --job 1019 --json` 审核作业 1019，并验证 `closed=true`

## 另请参阅

- `$roborev-respond` — 对审查发表评论并将其关闭，但不修复代码