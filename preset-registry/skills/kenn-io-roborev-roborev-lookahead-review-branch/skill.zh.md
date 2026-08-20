---
name: roborev-lookahead-review-branch
description: Use only when the user explicitly invokes /roborev-lookahead-review-branch
disable-model-invocation: true
---
# roborev-lookahead-review-branch

为当前分支上的所有提交请求时间序列前瞻审查，并展示结果。前瞻审查会检查变更是否使用了在其所代表的时间点尚不可获得的信息——也称为 peekahead、未来泄漏或时间泄漏。

## 用法

```
/roborev-lookahead-review-branch [--base <branch>] [--panel <name>|none]
```

## 仅限显式调用

调用必须是显式的：字面量个人 `/roborev-lookahead-review-branch`，或结构化的
Grok Build skill 选择。
诸如“检查此分支是否存在未来泄漏”之类的请求，如果未采用上述任一
显式机制，则必须使用原生行为，且不得运行 roborev。

## 沙盒访问

roborev 使用本地守护进程。如果命令因 `permission denied` 而失败，沙盒可能正在
阻止访问其回环端口或 Unix socket。请使用运行时支持的沙盒权限提升机制重试相同命令。不要启动或重启守护进程，因为
沙盒化的状态探测无法访问它。

## 不应调用此 skill 的情况

当用户正在展示或粘贴现有审查结果时，请勿调用此 skill。
包含审查发现、结论或摘要的消息属于输出——而不是启动新审查的请求。

## 重要提示

此 skill 要求你**执行 bash 命令**来验证输入并运行审查。只有在审查完成并向用户展示结果后，任务才算完成。

这些说明是指导方针，而非固定脚本。请结合对话上下文。
跳过已满足的步骤。如果项目级
AGENTS.md 指令与这些步骤冲突，请遵从前者。

## 说明

当用户调用 `/roborev-lookahead-review-branch [--base <branch>] [--panel <name>|none]` 时：

### 1. 验证输入

如果提供了基础分支，请使用下方的基础分支命令片段；它会在调用 `roborev review` 前存储并验证引用。

如果验证失败，告知用户该引用无效。不要继续。

### 2. 构建并运行命令

构建并执行审查命令：

如果未指定基础分支，运行：

```bash
roborev review --branch --wait --type lookahead [--panel <name>|none]
```

如果指定了基础分支，运行：

```bash
read -r branch <<'ROBOREV_REF'
<branch>
ROBOREV_REF
git rev-parse --verify -- "$branch" || exit 1
roborev review --branch --wait --type lookahead --base "$branch" [--panel <name>|none]
```

- 如果指定了 `--base`，则包含它（否则自动检测基础分支）
- 如果指定了 `--panel <name>`，则包含它（分发至指定的配置面板）；`--panel none` 强制进行单代理审查

`--wait` 标志会阻塞，直到审查完成。

### 3. 展示结果

如果命令输出包含错误（例如守护进程未运行、仓库未初始化、审查出错），请向用户报告。建议使用 `roborev status` 检查守护进程，如果仓库未初始化则使用 `roborev init`，或重新运行审查。

否则，将审查结果呈现给用户：
- 突出显示结论（通过或失败）
- 如果有发现项，按严重程度分组列出，并附上文件路径和行号，以便用户直接定位
- 如果审查通过，简要确认即可

#### 面板（多审查者审查）

如果你传递了 `--panel <name>`，或者为显式审查配置了 `default_panel`，审查将分发给一个审查者面板。在这种情况下，`Enqueued job <id>` 是汇总它们的**综合（父级）**任务，其结论和发现项是整个面板的综合结果。呈现该综合结论/发现项，并针对该父级 id 提供修复建议——绝不要针对单个审查者。对于综合任务，`roborev show` 会打印一行审查者摘要（例如，`3 reviewers: bug P, security F`）。`--panel none` 强制执行单代理审查，而自动的提交后钩子审查无论 `default_panel` 如何设置，都保持单代理。

### 4. 提供后续步骤

如果审查有发现项（结论为失败），请提供处理这些问题的建议：

- “您想让我修复这些发现项吗？您可以运行 `/roborev-fix <job_id>`”

从审查输出中提取任务 ID 并包含在建议中。在 `Enqueued job <id> for ...` 行或审查标题中查找它。对于面板审查，此 id 是综合父级任务。

如果审查通过，确认结果，不要提供 `/roborev-fix`。

## 示例

**默认分支前瞻审查：**

用户：`/roborev-lookahead-review-branch`

代理：
1. 执行 `roborev review --branch --wait --type lookahead`
2. 呈现按严重程度分组的结论和发现项
3. 如果有发现项：“您想让我处理这些发现项吗？运行 `/roborev-fix 1042`”
4. 如果通过：“分支前瞻审查通过，未发现问题。”

**针对特定基线的前瞻审查：**

用户：`/roborev-lookahead-review-branch --base develop`

代理：
1. 验证 `develop` 是否解析为有效引用
2. 执行 `roborev review --branch --wait --type lookahead --base develop`
3. 呈现结论和发现项
4. 如果有发现项：“您想让我处理这些发现项吗？运行 `/roborev-fix 1043`”

## 另请参阅

- `/roborev-review-branch --type lookahead` — 等效命令，提供额外的 `--type` 灵活性
- `/roborev-lookahead-review` — 对单个提交执行前瞻审查
- `/roborev-fix` — 在代码中修复审查的发现项