---
name: roborev-review
description: Request a code review for a commit and present the results
---
# roborev-review

请求对某个提交进行代码审查并展示结果。

## 用法

```
$roborev-review [commit] [--type security|design] [--panel <name>|none]
```

## 不应调用此技能的情况

当用户正在展示或粘贴已有的审查结果时，请勿调用此技能。包含审查发现、结论或摘要的消息属于输出，而不是启动新审查的请求。

## 重要

此技能要求你**执行 bash 命令**以验证提交并运行审查。在审查完成并向用户展示结果之前，任务不算完成。

这些指令是指导原则，而非僵化的脚本。请结合对话上下文。跳过已经满足的步骤。当这些步骤与项目级 CLAUDE.md 指令冲突时，以后者为准。

## 指令

当用户调用 `$roborev-review [commit] [--type security|design] [--panel <name>|none]` 时：

### 1. 验证输入

如果提供了提交引用，请验证它能否解析为有效提交：

```bash
git rev-parse --verify -- <commit>^{commit}
```

如果验证失败，请告知用户该引用无效。不要继续操作。

### 2. 构建并运行命令

构建并执行审查命令：

```bash
roborev review [commit] --wait [--type <type>] [--panel <name>|none]
```

- 如果未指定提交，则将其省略（默认使用 HEAD）
- 如果指定了 `--type`，则将其包含在内
- 如果指定了 `--panel <name>`，则将其包含在内（分发到指定名称的配置面板）；`--panel none` 会强制使用单代理审查

`--wait` 标志会阻塞，直到审查完成。

### 3. 展示结果

如果命令输出中包含错误（例如，守护进程未运行、仓库未初始化、审查出错），请向用户报告。建议使用 `roborev status` 检查守护进程，若仓库尚未初始化则使用 `roborev init`，或者重新运行审查。

否则，向用户展示审查结果：
- 突出显示结论（通过或失败）
- 如果存在审查发现，请按严重程度分组列出，并包含文件路径和行号，以便用户直接定位
- 如果审查通过，简短确认即可

#### 面板（多审查者审查）

如果传入 `--panel <name>`，或者为显式审查配置了 `default_panel`，审查将分发给一个审查者面板。在这种情况下，`Enqueued job <id>` 是汇总这些审查结果的**综合（父级）**作业，其结论和审查发现是整个面板的综合结果。请展示该综合结论和审查发现，并针对该父级 ID 提供修复选项——绝不要使用单个审查者的 ID。对于综合作业，`roborev show` 会输出一行审查者摘要（例如 `3 reviewers: bug P, security F`）。`--panel none` 会强制使用单代理审查，而自动的提交后钩子审查无论 `default_panel` 如何配置，始终使用单代理。

### 4. 提供后续步骤

如果审查存在发现（结论为失败），请询问是否需要处理这些问题：

- “需要我修复这些审查发现吗？你可以运行 `$roborev-fix <job_id>`”

从审查输出中提取作业 ID，并将其包含在建议中。在 `Enqueued job <id> for ...` 行或审查标题中查找该 ID。对于面板审查，此 ID 是综合父作业的 ID。

如果审查通过，请确认结果，且不要建议使用 `$roborev-fix`。

## 示例

**对 HEAD 的默认审查：**

用户：`$roborev-review`

代理：
1. 执行 `roborev review --wait`
2. 展示审查结论以及按严重程度分组的发现
3. 如果存在发现：“是否希望我处理这些发现？请运行 `$roborev-fix 1042`”
4. 如果通过：“审查已通过，未发现任何问题。”

**对特定提交的安全审查：**

用户：`$roborev-review abc123 --type security`

代理：
1. 验证：`git rev-parse --verify -- abc123^{commit}`
2. 执行 `roborev review abc123 --wait --type security`
3. 展示审查结论和发现
4. 如果存在发现：“是否希望我处理这些发现？请运行 `$roborev-fix 1043`”

## 另请参阅

- `$roborev-design-review` — `$roborev-review --type design` 的简写
- `$roborev-fix` — 在代码中修复审查发现的问题
- `$roborev-review-branch` — 审查当前分支上的所有提交