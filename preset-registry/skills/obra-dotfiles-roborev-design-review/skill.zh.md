---
name: roborev-design-review
description: Request a design review for a commit and present the results
---
# roborev-design-review

请求对某个提交进行设计审查并展示结果。

## 用法

```
$roborev-design-review [commit] [--panel <name>|none]
```

## 何时不应调用此技能

当用户正在展示或粘贴已有的审查结果时，请勿调用此技能。包含审查发现、结论或摘要的消息属于输出，而不是发起新审查的请求。

## 重要说明

此技能要求你**执行 bash 命令**以验证提交并运行审查。只有在审查完成并向用户展示结果后，任务才算完成。

这些说明是指导原则，并非刻板的脚本。请结合对话上下文执行。跳过已经完成的步骤。当这些步骤与项目级 `CLAUDE.md` 中的说明冲突时，以后者为准。

## 说明

当用户调用 `$roborev-design-review [commit] [--panel <name>|none]` 时：

### 1. 验证输入

如果提供了提交引用，请验证它能否解析为有效提交：

```bash
git rev-parse --verify -- <commit>^{commit}
```

如果验证失败，请告知用户该引用无效。不要继续执行。

### 2. 构建并运行命令

构建并执行审查命令：

```bash
roborev review [commit] --wait --type design [--panel <name>|none]
```

- 如果未指定提交，则省略它（默认使用 HEAD）
- 如果指定了 `--panel <name>`，则包含该参数（将任务分发给指定配置的评审组）；`--panel none` 强制使用单智能体审查

`--wait` 标志会阻塞，直到审查完成。

### 3. 展示结果

如果命令输出中包含错误（例如守护进程未运行、仓库未初始化或审查出错），请向用户报告。建议使用 `roborev status` 检查守护进程，在仓库未初始化时使用 `roborev init`，或重新运行审查。

否则，向用户展示审查结果：
- 突出显示结论（Pass 或 Fail）
- 如果存在审查发现，请按严重程度分组列出，并附上文件路径和行号，以便用户直接定位
- 如果审查通过，简短确认即可

#### 评审组（多评审者审查）

如果传入 `--panel <name>`，或者为显式审查配置了 `default_panel`，审查任务将分发给一个评审组。在这种情况下，`Enqueued job <id>` 是汇总这些审查的**综合（父）**任务，其结论和审查发现是整个评审组的综合结果。请展示该综合结论和审查发现，并针对该父任务 ID 提供修复建议——绝不要使用某个单独评审者的任务。对于综合任务，`roborev show` 会输出一行评审者摘要（例如 `3 reviewers: bug P, security F`）。`--panel none` 强制使用单智能体审查，并且无论 `default_panel` 如何配置，自动的提交后钩子审查始终使用单智能体。

### 4. 提供后续步骤

如果审查存在发现（结论为 Fail），请主动询问是否需要处理：

- “是否需要我修复这些审查发现？你可以运行 `$roborev-fix <job_id>`”

从审查输出中提取任务 ID，并将其包含在建议中。请在 `Enqueued job <id> for ...` 行或审查标题中查找。对于评审组审查，此 ID 是综合父任务的 ID。

如果审查通过，请确认结果，并且不要建议使用 `$roborev-fix`。

## 示例

**默认审查 HEAD 的设计：**

用户：`$roborev-design-review`

代理：
1. 执行 `roborev review --wait --type design`
2. 展示结论和按严重程度分组的发现
3. 如果存在发现：“需要我处理这些发现吗？请运行 `$roborev-fix 1042`”
4. 如果通过：“设计审查已通过，未发现任何问题。”

**审查特定提交的设计：**

用户：`$roborev-design-review abc123`

代理：
1. 验证：`git rev-parse --verify -- abc123^{commit}`
2. 执行 `roborev review abc123 --wait --type design`
3. 展示结论和发现
4. 如果存在发现：“需要我处理这些发现吗？请运行 `$roborev-fix 1043`”

## 另请参阅

- `$roborev-review --type design` — 功能等效，并提供额外的 `--type` 灵活性
- `$roborev-design-review-branch` — 对当前分支上的所有提交进行设计审查
- `$roborev-fix` — 在代码中修复审查发现的问题