---
name: qwen-agent
description: Delegate menial, well-scoped coding tasks to a cheap Qwen-backed subagent via the `claude-9arm` command instead of burning Claude tokens/quota. Use when the work is mechanical and low-risk — bulk renames, formatting, boilerplate, find-replace, grep-style search & summarization, reading/condensing logs or files, test/docstring/comment scaffolding, or running builds/linters/tests and reporting pass-fail. Also use when the user says "use qwen", "delegate this", "send it to 9arm/qwen", or "do this cheaply". Do NOT use for architecture, design, debugging judgment, security-sensitive edits, or anything needing this conversation's context.
---
# qwen-agent

将**琐碎、自包含**的任务下放给运行在无头 Claude Code 实例（`claude-9arm`）中的 Qwen 模型。把昂贵的 Claude 推理留给真正需要它的工作。

## 该命令

`claude-9arm` 是一个 shell 别名 → `claude --model qwen3.6-35b-a3b`，经由 9arm 网关路由。使用 `-p` 以无头方式运行它：

```bash
claude-9arm -p "<self-contained task prompt>" --allowedTools Bash Read Edit Write Glob Grep
```

- **这是默认调用方式。**该标志列表限定了子代理无需提示即可使用哪些工具，使其能够无人值守地完成琐碎工作。缺少它，子代理会在第一次编辑或执行命令时停滞等待批准。
- 该别名默认固化了 `--allowedTools '*'`，Claude Code 会**静默忽略**它并给出警告（`Wildcard tool name "*" is not supported`）。该警告是预期内的，无害——你追加的 `--allowedTools` 才是实际生效的。
- 对于仅涉及编辑、风险较低的任务，你可以改用 `--permission-mode acceptEdits`（自动接受文件编辑，但 Bash 仍会请求确认——不要用它做验证/构建/测试运行）。

## 撰写任务提示词（最重要的一步）

qwen 子代理对当前对话的上下文**一无所知**。含糊的提示词是头号失败模式。每条提示词都必须自成一体：

- 为每个输入和输出文件使用**绝对路径**（`/Users/tpatinya/proj/src/foo.ts`，而不是 `foo.ts`）。
- **明确给出输入、输出和验收标准**——要改什么，以及“完成”是什么样子。
- **不要引用**“我们之前讨论过的那个文件”、“上文”或先前轮次的内容。
- 把 qwen 当作一个能干但照字面执行的初级工程师：把步骤写清楚，把范围收紧。

坏例子：`clean up the imports`
好例子：`In /Users/tpatinya/proj/src/api.ts, remove unused imports and sort the remaining import statements alphabetically. Do not change any other code. Confirm the file still parses.`

## 注意上下文窗口（128k）

Qwen 以 **128k token 的上下文窗口**运行——远小于 Claude 的。整个任务（你的提示词 + 它读取的每个文件 + 它自身的推理和编辑）都必须装进这个窗口。评估每个下放任务时要看模型容量，而不只是看“是否琐碎”：

- 下放前**估算占用空间**：大致按它必须读取 + 打开 + 写入的文件字节数 ÷ 4 ≈ token 数。如果单个任务会拉入大文件或一次性拉入很多文件，那就装不下。
- **把大型作业拆成相互独立的块**，每块只触及有限范围——例如每次一个文件（或几个小文件）、每次一个目录、每次一段日志。将这些块作为各自独立的 `claude-9arm` 调用来执行（前台，或按“返回契约”一节进行后台并行）。
- **不要让它读取不需要的内容。**把它指向确切需要的文件/路径；绝不要让它“扫描整个仓库”或读取一整棵大型目录树。
- 验证时**警惕上下文耗尽的征兆**：编辑被截断、忽略后面的指令、或总结遗漏了它被要求处理的文件，通常意味着任务溢出了——拆得更小后重试。

当一项工作天然大到无法干净切分（需要整个代码库的上下文才能正确完成）时，这表明它不适合作为 qwen 任务——留给你自己做。

## 工作目录

Bash 工具的 `cd` 在各次调用之间会重置，而 `cd &&` 可能触发权限提示。不要依赖 cwd：

- 在提示词中**使用绝对路径**，或
- 传入 `--add-dir /abs/path`，授予子代理对某个目录的访问权限。

## 返回契约

- **默认（文本）：**qwen 的最终消息会打印到 stdout——直接读取即可。
- **需要解析结果：**添加 `--output-format json` 并提取 `result` 字段。
- **后台 / 并行（同时运行多个）：**重定向到日志，并使用 Bash 工具的 `run_in_background: true` 运行，结束后读取日志：

  ```bash
  claude-9arm -p "<task>" --allowedTools Bash Read Edit Write Glob Grep > /tmp/qwen-<label>.log 2>&1
  ```

  将相互独立的任务作为各自独立的后台运行来启动；每项完成后收集其日志。在下放 2 个以上互不相关的琐碎任务时使用此方式。

## 工作流程清单

1. 确认任务是琐碎且低风险的（见描述部分）。如果它需要设计判断或当前对话的上下文，**自己做**——不要下放。
2. 检查它是否装得进 qwen 的 **128k 上下文窗口**——估算文件占用空间，并将大型作业拆成按文件/按目录限定的块（见“注意上下文窗口”）。
3. 编写一条完全自包含的提示词，包含绝对路径和验收标准。
4. 运行 `claude-9arm -p "..." --allowedTools Bash Read Edit Write Glob Grep`（前台），或对并行任务使用后台重定向。
5. **亲自验证输出**——qwen 更便宜但也不那么可靠。在报告成功之前，检查文件/结果是否真正满足验收标准。

## 一次性设置（可选，可消除重复提示）

若要避免下放运行时每次调用都触发权限提示，可为该命令添加一条 Bash 允许规则（通过 `update-config` 技能，或直接编辑设置）：

```json
{ "permissions": { "allow": ["Bash(claude-9arm:*)"] } }
```

## 何时不该下放

架构/设计、需要推理的调试、安全敏感的更改、任何需要当前对话上下文的内容，或一旦廉价模型改错就难以察觉代价的任务。拿不准时，留给自己。
