---
name: roborev-design-review-branch
description: Request a design review for all commits on the current branch and present the results
---
# roborev-design-review-branch

请求对当前分支上的所有提交进行设计审查并展示结果。

## 用法

```
$roborev-design-review-branch [--base <branch>] [--panel <name>|none]
```

## 不应调用此技能的情况

当用户正在展示或粘贴已有的审查结果时，请勿调用此技能。包含审查发现、结论或摘要的消息是输出，而不是发起新审查的请求。

## 重要

此技能要求你**执行 bash 命令**来验证输入并运行审查。在审查完成并向用户展示结果之前，任务不算完成。

这些说明是指导原则，而非死板的脚本。请结合对话上下文。跳过已经完成的步骤。当项目级 CLAUDE.md 中的说明与这些步骤冲突时，以前者为准。

## 说明

当用户调用 `$roborev-design-review-branch [--base <branch>] [--panel <name>|none]` 时：

### 1. 验证输入

如果提供了基础分支，请验证它能否解析为有效的引用：

```bash
git rev-parse --verify -- <branch>
```

如果验证失败，请告知用户该引用无效。不要继续操作。

### 2. 构建并运行命令

构建并执行审查命令：

```bash
roborev review --branch --wait --type design [--base <branch>] [--panel <name>|none]
```

- 如果指定了 `--base`，请将其包含在命令中（否则会自动检测基础分支）
- 如果指定了 `--panel <name>`，请将其包含在命令中（将审查分发到指定的配置面板）；`--panel none` 会强制使用单个智能体进行审查

`--wait` 标志会阻塞，直到审查完成。

### 3. 展示结果

如果命令输出包含错误（例如守护进程未运行、仓库未初始化、审查出错），请将其报告给用户。建议使用 `roborev status` 检查守护进程，若仓库未初始化则使用 `roborev init`，或者重新运行审查。

否则，请向用户展示审查结果：
- 突出显示结论（通过或失败）
- 如果存在审查发现，请按严重程度分组列出，并附上文件路径和行号，以便用户直接定位
- 如果审查通过，简短确认即可

#### 面板（多审查者审查）

如果你传入 `--panel <name>`，或者为显式审查配置了 `default_panel`，审查会分发给一个审查者面板。在这种情况下，`Enqueued job <id>` 是汇总这些审查的**综合（父）**任务，其结论和审查发现是整个面板的综合结果。请展示该综合结论和审查发现，并针对该父任务 ID 提供修复选项——绝不要针对单个审查者。对于综合任务，`roborev show` 会输出一行审查者摘要（例如 `3 reviewers: bug P, security F`）。`--panel none` 会强制使用单个智能体进行审查，并且无论 `default_panel` 如何配置，自动提交后钩子审查始终使用单个智能体。

### 4. 提供后续步骤

如果审查存在发现（结论为失败），请询问是否需要处理：

- “你希望我修复这些发现吗？你可以运行 `$roborev-fix <job_id>`”

从审查输出中提取作业 ID，并将其包含在建议中。在 `Enqueued job <id> for ...` 行或审查标题中查找。对于面板审查，此 ID 是综合作业的父作业 ID。

如果审查通过，请确认结果，不要建议使用 `$roborev-fix`。

## 示例

**默认分支设计审查：**

用户：`$roborev-design-review-branch`

代理：
1. 执行 `roborev review --branch --wait --type design`
2. 展示结论和按严重程度分组的发现
3. 如果存在发现：“是否需要我处理这些发现？请运行 `$roborev-fix 1042`”
4. 如果通过：“分支设计审查已通过，未发现任何问题。”

**针对特定基准分支的设计审查：**

用户：`$roborev-design-review-branch --base develop`

代理：
1. 验证：`git rev-parse --verify -- develop`
2. 执行 `roborev review --branch --wait --type design --base develop`
3. 展示结论和发现
4. 如果存在发现：“是否需要我处理这些发现？请运行 `$roborev-fix 1043`”

## 另请参阅

- `$roborev-review-branch --type design` — 功能等效，并且支持更灵活的 `--type`
- `$roborev-design-review` — 对单个提交进行设计审查
- `$roborev-fix` — 在代码中修复审查发现的问题