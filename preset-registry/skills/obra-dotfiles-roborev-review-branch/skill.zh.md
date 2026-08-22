---
name: roborev-review-branch
description: Request a code review for all commits on the current branch and present the results
---
# roborev-review-branch

请求对当前分支上的所有提交进行代码审查，并展示结果。

## 用法

```
$roborev-review-branch [--base <branch>] [--type security|design] [--panel <name>|none]
```

## 不应调用此技能的情况

当用户正在展示或粘贴已有的审查结果时，请勿调用此技能。包含审查发现、结论或摘要的消息属于输出，而不是发起新审查的请求。

## 重要提示

此技能要求你**执行 bash 命令**以验证输入并运行审查。在审查完成并向用户展示结果之前，任务不算完成。

这些说明是指导原则，而不是僵化的脚本。请结合对话上下文。跳过已经完成的步骤。当这些步骤与项目级 CLAUDE.md 中的说明冲突时，以后者为准。

## 说明

当用户调用 `$roborev-review-branch [--base <branch>] [--type security|design] [--panel <name>|none]` 时：

### 1. 验证输入

如果提供了基础分支，请验证它能否解析为有效的 ref：

```bash
git rev-parse --verify -- <branch>
```

如果验证失败，请告知用户该 ref 无效。不要继续执行。

### 2. 构建并运行命令

构建并执行审查命令：

```bash
roborev review --branch --wait [--base <branch>] [--type <type>] [--panel <name>|none]
```

- 如果指定了 `--base`，则将其包含在命令中（否则会自动检测基础分支）
- 如果指定了 `--type`，则将其包含在命令中
- 如果指定了 `--panel <name>`，则将其包含在命令中（将审查分派到指定名称的配置面板）；`--panel none` 会强制执行单智能体审查

`--wait` 标志会阻塞，直到审查完成。

### 3. 展示结果

如果命令输出包含错误（例如守护进程未运行、仓库未初始化或审查出错），请将其报告给用户。建议运行 `roborev status` 检查守护进程；如果仓库尚未初始化，则运行 `roborev init`；或者重新运行审查。

否则，向用户展示审查结果：
- 醒目地显示结论（通过或失败）
- 如果存在审查发现，请按严重程度分组列出，并包含文件路径和行号，以便用户直接定位
- 如果审查通过，简要确认即可

#### 面板（多审查者审查）

如果传入了 `--panel <name>`，或者为显式审查配置了 `default_panel`，审查将分派给一个审查者面板。在这种情况下，`Enqueued job <id>` 是汇总这些审查结果的**综合（父级）**作业，其结论和审查发现是整个面板的综合结果。请展示该综合结论和审查发现，并针对该父级 ID 提供修复选项——绝不要针对单个审查者。对于综合作业，`roborev show` 会输出一行审查者摘要（例如 `3 reviewers: bug P, security F`）。`--panel none` 会强制执行单智能体审查，并且无论 `default_panel` 如何配置，自动的提交后钩子审查始终保持为单智能体审查。

### 4. 提供后续步骤

如果审查有发现（结论为失败），请主动提出处理这些问题：

- “你希望我修复这些发现的问题吗？你可以运行 `$roborev-fix <job_id>`”

从审查输出中提取任务 ID，并将其包含在建议中。可在 `Enqueued job <id> for ...` 行或审查标题中查找。对于面板审查，此 ID 是综合任务的父任务 ID。

如果审查通过，请确认结果，不要提供 `$roborev-fix`。

## 示例

**默认分支审查：**

用户：`$roborev-review-branch`

智能体：
1. 执行 `roborev review --branch --wait`
2. 展示结论，并按严重程度对发现的问题进行分组
3. 如果存在问题：“你希望我处理这些发现的问题吗？运行 `$roborev-fix 1042`”
4. 如果通过：“分支审查已通过，未发现问题。”

**针对特定基准分支的安全审查：**

用户：`$roborev-review-branch --base develop --type security`

智能体：
1. 验证：`git rev-parse --verify -- develop`
2. 执行 `roborev review --branch --wait --base develop --type security`
3. 展示结论和发现的问题
4. 如果存在问题：“你希望我处理这些发现的问题吗？运行 `$roborev-fix 1043`”

## 另请参阅

- `$roborev-design-review-branch` — `$roborev-review-branch --type design` 的简写
- `$roborev-fix` — 在代码中修复审查发现的问题
- `$roborev-review` — 审查单个提交