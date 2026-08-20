---
name: roborev-review-branch
description: Use only when the user explicitly invokes /roborev-review-branch
disable-model-invocation: true
---
# roborev-review-branch

请求对当前分支上的所有提交进行代码审查并展示结果。

## 用法

```
/roborev-review-branch [--base <branch>] [--type security|design] [--panel <name>|none]
```

## 仅限显式调用

调用必须是显式的：个人直接输入字面量 `/roborev-review-branch`，或通过结构化的
Grok Build 技能选择进行调用。
对于“审查此分支”之类未使用上述任一显式机制的请求，必须使用
原生行为，且不得运行 roborev。

## 沙箱访问

roborev 使用本地守护进程。如果命令因 `permission denied` 而失败，可能是沙箱
阻止了对其环回端口或 Unix 套接字的访问。请使用运行时支持的沙箱权限提升机制
重试同一命令。不要启动或重启守护进程，因为沙箱中的状态探测可能无法访问它。

## 不应调用此技能的情况

当用户正在展示或粘贴已有的审查结果时，请勿调用此技能。
包含审查发现、结论或摘要的消息属于输出，而不是发起新审查的请求。

## 重要说明

此技能要求你**执行 bash 命令**来验证输入并运行审查。只有在审查完成并向用户展示结果后，任务才算完成。

这些说明是指导原则，而非严格脚本。请结合对话
上下文。跳过已经满足的步骤。如果项目级
AGENTS.md 说明与这些步骤冲突，请遵循前者。

## 说明

当用户调用 `/roborev-review-branch [--base <branch>] [--type security|design] [--panel <name>|none]` 时：

### 1. 验证输入

如果提供了基础分支，请使用下方的基础分支命令片段；该片段会在调用 `roborev review` 之前存储并验证该引用。

如果验证失败，请告知用户该引用无效。不要继续。

### 2. 构建并运行命令

构建并执行审查命令：

如果未指定基础分支，请运行：

```bash
roborev review --branch --wait [--type <type>] [--panel <name>|none]
```

如果指定了基础分支，请运行：

```bash
read -r branch <<'ROBOREV_REF'
<branch>
ROBOREV_REF
git rev-parse --verify -- "$branch" || exit 1
roborev review --branch --wait --base "$branch" [--type <type>] [--panel <name>|none]
```

- 如果指定了 `--base`，请将其包含在命令中（否则会自动检测基础分支）
- 如果指定了 `--type`，请将其包含在命令中
- 如果指定了 `--panel <name>`，请将其包含在命令中（会分发到指定名称的配置面板）；`--panel none` 会强制使用单智能体审查

`--wait` 标志会阻塞，直至审查完成。

### 3. 展示结果

如果命令输出包含错误（例如守护进程未运行、仓库未初始化、审查出错），请向用户报告。建议使用 `roborev status` 检查守护进程；如果仓库尚未初始化，则使用 `roborev init`；或者重新运行审查。

否则，向用户展示审查结果：
- 突出显示结论（通过或失败）
- 如果有审查发现，请按严重程度分组列出，并附上文件路径和行号，以便用户直接定位
- 如果审查通过，简短确认即可

#### 评审组（多评审者评审）

如果你传入 `--panel <name>`，或者为显式评审配置了 `default_panel`，评审将分发给一个评审组中的多个评审者。在这种情况下，`Enqueued job <id>` 是汇总这些评审的**综合（父）**任务，其结论和发现是整个评审组的综合结果。请展示该综合结论和发现，并建议针对该父任务 ID 进行修复——绝不要针对单个评审者。对于综合任务，`roborev show` 会输出一行评审者摘要（例如 `3 reviewers: bug P, security F`）。`--panel none` 会强制使用单智能体评审，而自动的提交后钩子评审无论 `default_panel` 如何配置，始终使用单智能体。

### 4. 提供后续步骤

如果评审有发现（结论为 Fail），则提议处理这些问题：

- “你希望我修复这些发现吗？你可以运行 `/roborev-fix <job_id>`”

从评审输出中提取任务 ID 并包含在建议中。可在 `Enqueued job <id> for ...` 行或评审标题中查找。对于评审组评审，此 ID 是综合父任务的 ID。

如果评审通过，则确认结果，不要建议使用 `/roborev-fix`。

## 示例

**默认分支评审：**

用户：`/roborev-review-branch`

智能体：
1. 执行 `roborev review --branch --wait`
2. 展示结论以及按严重程度分组的发现
3. 如果存在发现：“你希望我处理这些发现吗？请运行 `/roborev-fix 1042`”
4. 如果通过：“分支评审已通过，未发现问题。”

**针对特定基准分支的安全评审：**

用户：`/roborev-review-branch --base develop --type security`

智能体：
1. 验证：`git rev-parse --verify -- "develop"`
2. 执行 `roborev review --branch --wait --base develop --type security`
3. 展示结论和发现
4. 如果存在发现：“你希望我处理这些发现吗？请运行 `/roborev-fix 1043`”

## 另请参阅

- `/roborev-design-review-branch` — `/roborev-review-branch --type design` 的简写
- `/roborev-fix` — 在代码中修复评审发现的问题
- `/roborev-review` — 评审单个提交