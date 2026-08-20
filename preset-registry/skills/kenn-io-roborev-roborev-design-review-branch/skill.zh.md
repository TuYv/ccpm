---
name: roborev-design-review-branch
description: Use only when the user explicitly invokes /roborev-design-review-branch
disable-model-invocation: true
---
# roborev-design-review-branch

请求对当前分支上的所有提交进行设计审查并展示结果。

## 用法

```
/roborev-design-review-branch [--base <branch>] [--panel <name>|none]
```

## 仅限显式调用

调用必须是显式的：字面量个人 `/roborev-design-review-branch`，或通过结构化的
Grok Build skill 选择。
诸如“审查此分支的设计”这类不具备上述任一
显式机制的请求，必须使用原生行为，且不得运行 roborev。

## 沙盒访问

roborev 使用本地守护进程。如果命令因 `permission denied` 失败，可能是沙盒
阻止了对其回环端口或 Unix 套接字的访问。请使用运行时支持的沙盒权限提升机制
重试相同命令。不得启动或重启该守护进程，因为处于沙盒中的状态探测无法连接到它。

## 不应调用此技能的情况

当用户正在展示或粘贴已有审查
结果时，**不得**调用此技能。包含审查发现、结论或摘要的消息属于
输出，而不是启动新审查的请求。

## 重要

此技能要求你**执行 bash 命令**来验证输入并运行审查。只有在审查完成并向用户展示结果后，任务才算完成。

这些说明是指导原则，而非固定脚本。请结合对话
上下文。跳过已满足的步骤。若与这些步骤冲突，请优先遵从项目级
AGENTS.md 指令。

## 说明

当用户调用 `/roborev-design-review-branch [--base <branch>] [--panel <name>|none]` 时：

### 1. 验证输入

如果提供了基础分支，请使用下面的基础分支命令片段；它会在调用 `roborev review` 前存储并验证引用。

如果验证失败，请告知用户该引用无效。不得继续执行。

### 2. 构建并运行命令

构建并执行审查命令：

如果未指定基础分支，运行：

```bash
roborev review --branch --wait --type design [--panel <name>|none]
```

如果指定了基础分支，运行：

```bash
read -r branch <<'ROBOREV_REF'
<branch>
ROBOREV_REF
git rev-parse --verify -- "$branch" || exit 1
roborev review --branch --wait --type design --base "$branch" [--panel <name>|none]
```

- 如果指定了 `--base`，则包含它（否则自动检测基础分支）
- 如果指定了 `--panel <name>`，则包含它（会分发给指定的配置面板）；`--panel none` 会强制使用单代理审查

`--wait` 标志会阻塞，直至审查完成。

### 3. 展示结果

如果命令输出包含错误（例如守护进程未运行、仓库未初始化或审查出错），请向用户报告。建议使用 `roborev status` 检查守护进程；如果仓库未初始化，使用 `roborev init`；或者重新运行审查。

否则，向用户展示审查结果：
- 突出显示结论（通过或失败）
- 如果存在发现，请按严重程度分组列出，并附上文件路径和行号，以便用户直接定位
- 如果审查通过，简短确认即可

#### 审查小组（多审查者审查）

如果你传递了 `--panel <name>`，或者为显式审查配置了 `default_panel`，审查会分发给一个审查者小组。在这种情况下，`Enqueued job <id>` 是用于聚合它们的**综合（父）**任务，其裁决和发现项是整个小组的综合结果。应展示该综合裁决/发现项，并针对该父任务 ID 提供修复建议——绝不能针对单个审查者。对于综合任务，`roborev show` 会打印一行审查者摘要（例如，`3 reviewers: bug P, security F`）。`--panel none` 强制执行单智能体审查，而自动的提交后钩子审查无论 `default_panel` 如何设置，始终保持单智能体。

### 4. 提供后续步骤

如果审查存在发现项（裁决为 Fail），请提出处理建议：

- “您想让我修复这些发现项吗？您可以运行 `/roborev-fix <job_id>`”

从审查输出中提取任务 ID，并将其包含在建议中。在 `Enqueued job <id> for ...` 行或审查标题中查找。对于小组审查，此 ID 是综合父任务。

如果审查通过，请确认结果，不要提供 `/roborev-fix`。

## 示例

**默认分支设计审查：**

用户：`/roborev-design-review-branch`

智能体：
1. 执行 `roborev review --branch --wait --type design`
2. 按严重程度分组展示裁决和发现项
3. 如果存在发现项：“您想让我处理这些发现项吗？运行 `/roborev-fix 1042`”
4. 如果通过：“分支设计审查通过，未发现问题。”

**针对特定基准的设计审查：**

用户：`/roborev-design-review-branch --base develop`

智能体：
1. 验证：`git rev-parse --verify -- "develop"`
2. 执行 `roborev review --branch --wait --type design --base develop`
3. 展示裁决和发现项
4. 如果存在发现项：“您想让我处理这些发现项吗？运行 `/roborev-fix 1043`”

## 另请参阅

- `/roborev-review-branch --type design` — 等效命令，并额外提供 `--type` 灵活性
- `/roborev-design-review` — 对单个提交进行设计审查
- `/roborev-fix` — 在代码中修复审查发现项