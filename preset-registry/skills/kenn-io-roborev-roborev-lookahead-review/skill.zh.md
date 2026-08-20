---
name: roborev-lookahead-review
description: Use only when the user explicitly invokes /roborev-lookahead-review
disable-model-invocation: true
---
# roborev-lookahead-review

请求对某个提交执行时间序列前视审查并呈现结果。前视审查会检查变更是否使用了在其所代表的时间点尚不可用的信息——这也称为 peekahead、未来信息泄漏或时间泄漏。

## 使用方式

```
/roborev-lookahead-review [commit] [--panel <name>|none]
```

## 仅限显式调用

调用必须是显式的：字面量个人 `/roborev-lookahead-review`，或结构化的
Grok Build skill 选择。

像“检查这个提交是否存在 peekahead”这样的请求，如果没有使用上述显式机制，必须使用原生行为，且不得运行 roborev。

## 沙箱访问

roborev 使用本地守护进程。如果命令失败并显示 `permission denied`，沙箱可能阻止了对其回环端口或 Unix socket 的访问。使用运行时支持的沙箱提权机制重试相同的命令。不要因为沙箱环境中的状态探测无法访问守护进程而启动或重启守护进程。

## 不应调用此 skill 的情况

当用户正在提供或粘贴已有的审查结果时，**不要**调用此 skill。包含审查发现、结论或摘要的消息属于输出，而不是请求开始新的审查。

## 重要事项

此 skill 要求你**执行 bash 命令**来验证提交并运行审查。只有在审查完成并将结果呈现给用户后，任务才算完成。

这些说明是指导原则，而非僵化的脚本。请结合对话上下文。若项目级 `AGENTS.md` 中的说明与这些步骤冲突，应遵循项目级说明。跳过已经满足的步骤。

## 说明

当用户调用 `/roborev-lookahead-review [commit] [--panel <name>|none]` 时：

### 1. 验证输入

如果提供了提交引用，使用下面的提交命令片段；它会在调用 `roborev review` 前保存并验证该引用。

如果验证失败，告知用户该引用无效。不要继续执行。

### 2. 构建并运行命令

构建并执行审查命令：

如果未指定提交，运行：

```bash
roborev review --wait --type lookahead [--panel <name>|none]
```

如果指定了提交，运行：

```bash
read -r commit <<'ROBOREV_REF'
<commit>
ROBOREV_REF
git rev-parse --verify -- "$commit^{commit}" || exit 1
roborev review "$commit" --wait --type lookahead [--panel <name>|none]
```

- 如果指定了 `--panel <name>`，将其包含在命令中（分发到指定名称的配置面板）；`--panel none` 强制执行单代理审查

`--wait` 标志会阻塞，直到审查完成。

### 3. 呈现结果

如果命令输出包含错误（例如守护进程未运行、仓库未初始化或审查出错），将其报告给用户。建议使用 `roborev status` 检查守护进程；如果仓库未初始化，使用 `roborev init`；或者重新运行审查。

否则，将审查结果呈现给用户：
- 突出显示结论（Pass 或 Fail）
- 如果存在发现，按严重性分组列出，并提供文件路径和行号，以便用户直接定位
- 如果审查通过，简短确认即可

#### 面板（多审阅者审阅）

如果你传递 `--panel <name>`，或者为显式审阅配置了 `default_panel`，审阅会分发给一个由多名审阅者组成的面板。在这种情况下，`Enqueued job <id>` 是汇总这些审阅结果的**综合（父）**任务，其结论和发现是整个面板的综合结果。展示该综合结论/发现，并针对该父任务 ID 提供修复建议——绝不要针对单个审阅者。对于综合任务，`roborev show` 会打印一行审阅者摘要（例如 `3 reviewers: bug P, security F`）。`--panel none` 会强制执行单代理审阅，而自动的提交后钩子审阅无论 `default_panel` 如何设置，始终保持单代理。

### 4. 提供后续步骤

如果审阅存在发现（结论为 Fail），请主动提出处理它们：

- “您想让我修复这些发现吗？您可以运行 `/roborev-fix <job_id>`”

从审阅输出中提取任务 ID，以便包含在建议中。请在 `Enqueued job <id> for ...` 行或审阅标题中查找它。对于面板审阅，该 ID 是综合父任务的 ID。

如果审阅通过，请确认结果，不要提供 `/roborev-fix`。

## 示例

**对 HEAD 进行默认的前瞻审阅：**

用户：`/roborev-lookahead-review`

代理：
1. 执行 `roborev review --wait --type lookahead`
2. 按严重程度分组展示结论和发现
3. 如果存在发现：“您想让我处理这些发现吗？运行 `/roborev-fix 1042`”
4. 如果通过：“前瞻审阅通过，未发现任何问题。”

**对特定提交进行前瞻审阅：**

用户：`/roborev-lookahead-review abc123`

代理：
1. 验证：`git rev-parse --verify -- "abc123^{commit}"`
2. 执行 `roborev review abc123 --wait --type lookahead`
3. 展示结论和发现
4. 如果存在发现：“您想让我处理这些发现吗？运行 `/roborev-fix 1043`”

## 另请参阅

- `/roborev-review --type lookahead` — 等效命令，且额外支持 `--type` 的灵活配置
- `/roborev-lookahead-review-branch` — 对当前分支上的所有提交进行前瞻审阅
- `/roborev-fix` — 在代码中修复审阅发现的问题