---
name: roborev-design-review
description: Use only when the user explicitly invokes /roborev-design-review
disable-model-invocation: true
---
# roborev-design-review

请求对某个提交进行设计审查，并展示结果。

## 用法

```
/roborev-design-review [commit] [--panel <name>|none]
```

## 仅限显式调用

必须显式调用：字面量个人命令 `/roborev-design-review`，或通过结构化的
Grok Build skill 选择调用。
诸如“审查这个提交的设计”这类未使用上述任一显式机制的请求，
必须使用原生行为，且不得运行 roborev。

## 沙箱访问

roborev 使用本地守护进程。如果命令因 `permission denied` 失败，沙箱可能正在
阻止对其回环端口或 Unix 套接字的访问。请使用运行时支持的沙箱权限提升机制重试相同命令。
不要启动或重启守护进程，因为处于沙箱中的状态探测无法访问它。

## 不应调用此 skill 的情况

当用户正在展示或粘贴已有的审查结果时，切勿调用此 skill。
包含审查发现、结论或摘要的消息属于输出，而非启动新审查的请求。

## 重要提示

此 skill 要求你**执行 bash 命令**来验证提交并运行审查。只有在审查完成且你向用户展示结果后，任务才算完成。

这些说明是指导原则，并非严格的脚本。请结合对话上下文。
跳过已经满足的步骤。如果项目级 `AGENTS.md` 中的说明与这些步骤冲突，请遵从前者。

## 说明

当用户调用 `/roborev-design-review [commit] [--panel <name>|none]` 时：

### 1. 验证输入

如果提供了提交引用，请使用下方由提交提供的命令片段；该片段会在调用 `roborev review` 前存储并验证该引用。

如果验证失败，请告知用户该引用无效。不要继续执行。

### 2. 构建并运行命令

构建并执行审查命令：

如果未指定提交，运行：

```bash
roborev review --wait --type design [--panel <name>|none]
```

如果指定了提交，运行：

```bash
read -r commit <<'ROBOREV_REF'
<commit>
ROBOREV_REF
git rev-parse --verify -- "$commit^{commit}" || exit 1
roborev review "$commit" --wait --type design [--panel <name>|none]
```

- 如果指定了 `--panel <name>`，请包含该选项（会分发给指定配置面板）；`--panel none` 会强制执行单代理审查

`--wait` 标志会阻塞，直到审查完成。

### 3. 展示结果

如果命令输出包含错误（例如守护进程未运行、仓库未初始化或审查出错），请向用户报告该错误。建议使用 `roborev status` 检查守护进程；如果仓库未初始化，则使用 `roborev init`；或者重新运行审查。

否则，向用户展示审查结果：
- 突出显示结论（通过或失败）
- 如果存在发现，请按严重程度分组列出，并附上文件路径和行号，以便用户直接跳转
- 如果审查通过，简要确认即可

#### 面板（多审查者审查）

如果你传递了 `--panel <name>`，或者为显式审查配置了 `default_panel`，审查将分发给一个审查者面板。
在这种情况下，`Enqueued job <id>` 是汇总各审查者结果的**综合（父）**任务，
其结论和发现是整个面板的综合结果。请展示该综合结论/发现，并针对该父任务 ID 提供修复选项——绝不要针对单个审查者。
对于综合任务，`roborev show` 会输出一行审查者摘要（例如 `3 reviewers: bug P, security F`）。
`--panel none` 会强制执行单代理审查；无论是否设置 `default_panel`，自动 post-commit hook 审查始终为单代理。

### 4. 提供后续步骤

如果审查发现问题（结论为 Fail），请提出处理这些问题：

- “Would you like me to fix these findings? You can run `/roborev-fix <job_id>`”

从审查输出中提取任务 ID，并将其包含在建议中。请在 `Enqueued job <id> for ...` 行或审查标题中查找。对于面板审查，该 ID 是综合父任务 ID。

如果审查通过，请确认结果，并且不要提供 `/roborev-fix`。

## 示例

**对 HEAD 进行默认设计审查：**

用户：`/roborev-design-review`

代理：
1. 执行 `roborev review --wait --type design`
2. 按严重程度分组展示结论和发现的问题
3. 如果存在问题：“Would you like me to address these findings? Run `/roborev-fix 1042`”
4. 如果通过：“Design review passed with no findings.”

**对特定提交进行设计审查：**

用户：`/roborev-design-review abc123`

代理：
1. 验证：`git rev-parse --verify -- "abc123^{commit}"`
2. 执行 `roborev review abc123 --wait --type design`
3. 展示结论和发现的问题
4. 如果存在问题：“Would you like me to address these findings? Run `/roborev-fix 1043`”

## 另请参阅

- `/roborev-review --type design` — 等效命令，并额外提供 `--type` 灵活性
- `/roborev-design-review-branch` — 审查当前分支上的所有提交的设计
- `/roborev-fix` — 在代码中修复审查发现的问题