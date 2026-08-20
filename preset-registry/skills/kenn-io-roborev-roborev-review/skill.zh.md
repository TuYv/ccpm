---
name: roborev-review
description: Use only when the user explicitly invokes /roborev-review
disable-model-invocation: true
---
# roborev-review

请求对某个提交进行代码审查并展示结果。

## 用法

```
/roborev-review [commit] [--type security|design] [--panel <name>|none]
```

## 仅限显式调用

调用必须是显式的：字面量个人 `/roborev-review`，或结构化的
Grok Build skill 选择。
诸如“审查这个提交”之类未使用上述任一显式机制的请求，必须使用原生
行为，且不得运行 roborev。

## 沙箱访问

roborev 使用本地守护进程。如果命令因 `permission denied` 失败，沙箱可能正在
阻止访问其回环端口或 Unix socket。请使用运行时支持的沙箱权限提升机制重试相同命令。
不要启动或重启守护进程，因为处于沙箱中的状态探测无法访问它。

## 不应调用此技能的情况

当用户正在展示或粘贴现有审查
结果时，**不要**调用此技能。包含审查发现、结论或摘要的消息属于
输出——而不是启动新审查的请求。

## 重要

此技能要求你**执行 bash 命令**来验证提交并运行审查。在审查完成并向用户展示结果之前，任务不算完成。

这些说明是指南，而非严格脚本。请结合对话
上下文。跳过已满足的步骤。若项目级
AGENTS.md 指令与这些步骤冲突，请优先遵循前者。

## 说明

当用户调用 `/roborev-review [commit] [--type security|design] [--panel <name>|none]` 时：

### 1. 验证输入

如果提供了提交引用，请使用下方由提交提供的命令片段；它会在调用 `roborev review` 前存储并验证该引用。

如果验证失败，告知用户该引用无效。不要继续。

### 2. 构建并运行命令

构建并执行审查命令：

如果未指定提交，请运行：

```bash
roborev review --wait [--type <type>] [--panel <name>|none]
```

如果指定了提交，请运行：

```bash
read -r commit <<'ROBOREV_REF'
<commit>
ROBOREV_REF
git rev-parse --verify -- "$commit^{commit}" || exit 1
roborev review "$commit" --wait [--type <type>] [--panel <name>|none]
```

- 如果指定了 `--type`，请包含它
- 如果指定了 `--panel <name>`，请包含它（会扇出至指定配置面板）；`--panel none` 会强制执行单代理审查

`--wait` 标志会阻塞至审查完成。

### 3. 展示结果

如果命令输出包含错误（例如守护进程未运行、仓库未初始化、审查出错），请将其报告给用户。建议使用 `roborev status` 检查守护进程；如果仓库未初始化，则使用 `roborev init`；或重新运行审查。

否则，向用户展示审查结果：
- 突出展示结论（通过或失败）
- 如果存在发现，请按严重程度分组列出，并包含文件路径和行号，以便用户直接导航
- 如果审查通过，简要确认即可

#### 面板（多审查者审查）

如果传递了 `--panel <name>`，或为显式
审查配置了 `default_panel`，审查会扇出至一个审查者面板。在这种情况下，
`Enqueued job <id>` 是汇总（父）任务，用于聚合它们，其结论和发现是整个面板的综合结果。
请展示该综合结论/发现，并针对该父任务 id 提供修复建议——绝不要针对单个审查者。对于汇总任务，`roborev show` 会输出一行审查者摘要
（例如 `3 reviewers: bug P, security F`）。`--panel none` 会强制执行单代理审查，而自动提交后钩子审查无论 `default_panel` 如何都保持单代理。

### 4. 提供后续步骤

如果审查发现问题（结论为 Fail），请主动提出处理这些问题：

- “Would you like me to fix these findings? You can run `/roborev-fix <job_id>`”

从审查输出中提取任务 ID，并在建议中包含它。请在 `Enqueued job <id> for ...` 行或审查标题中查找。对于面板审查，此 ID 是综合父任务。

如果审查通过，请确认结果，但不要提供 `/roborev-fix`。

## 示例

**对 HEAD 的默认审查：**

用户：`/roborev-review`

Agent：
1. 执行 `roborev review --wait`
2. 展示结论，以及按严重程度分组的问题
3. 如果存在问题：“Would you like me to address these findings? Run `/roborev-fix 1042`”
4. 如果通过：“Review passed with no findings.”

**对特定提交的安全审查：**

用户：`/roborev-review abc123 --type security`

Agent：
1. 验证：`git rev-parse --verify -- "abc123^{commit}"`
2. 执行 `roborev review abc123 --wait --type security`
3. 展示结论和问题
4. 如果存在问题：“Would you like me to address these findings? Run `/roborev-fix 1043`”

## 另请参阅

- `/roborev-design-review` — `/roborev-review --type design` 的简写
- `/roborev-fix` — 在代码中修复审查发现的问题
- `/roborev-review-branch` — 审查当前分支上的所有提交