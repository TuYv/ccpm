---
name: code-improver
description: "Runs an autonomous review-and-fix improvement loop over any code target — a skill, plugin, module, or directory — using a reviewer the user names: any installed skill or agent. Keeps a cross-round findings ledger, escalates when fixes stop converging, and guards scope mechanically. Use when asked to 'improve this code until review passes', 'run an improvement loop with <reviewer>', or to iterate review-and-fix with a specific reviewer. For skills prefer the skill-improver entry; for a branch prefer pr-improver."
argument-hint: "<TARGET_PATH> --reviewer <agent-or-skill-name> --scope <globs> [--max-rounds N]"
allowed-tools: Bash Glob Read TaskOutput TaskStop Workflow
---
# Code Improver

改进任意代码目标，请运行 `/code-improver:improve` —— 这是一个动态工作流，它会让指定的评审者与一个修复子代理循环协作，直到某次评审报告的关键/重大发现为零，然后清除自身留下的残余。这个循环、它的台账以及它的各项防护都存在于该工作流之中；本技能负责收集通用入口所需的三项输入，并转达最终结果。

## 启动循环

用户已提供：`$ARGUMENTS`（若为空，则从对话中获取细节）。

### 1. 收集三项必需输入 —— 不做猜测

1. **目标（Target）**：正在改进的目录的绝对路径。相对路径需对照工作目录解析；验证该目录确实存在。
2. **评审者（Reviewer）**：执行每一次评审的已安装技能或代理。必须由用户指名 —— 没有默认值，也没有捆绑的评审者。确定其类型：
   - 带命名空间的代理（例如 `plugin-dev:skill-reviewer`）→ `"kind": "agent"`
   - 已安装的技能（例如 `pr-review-toolkit:review-pr`）→ `"kind": "skill"`
   如果该名称两者皆有可能，检查会话的技能清单；若仍不明确，询问用户。若未指名评审者，请询问 —— 不要自行挑选。
3. **范围（Scope）**：循环可以触碰的仓库相对 glob。通用入口要求显式提供；若用户未给出，建议使用目标目录（`<repo-relative-target>/**`），并在启动前与用户确认。

### 2. 解析循环脚本

该循环是本插件中的动态工作流 `workflows/improve.js`。按路径启动它：`scriptPath` 接受一个解析好的绝对路径，而 Workflow 工具的 `name` 只解析内置和项目工作流，因此从市场安装的副本可能无法通过 `code-improver:improve` 响应。按顺序尝试，先命中者优先 —— 主目录排在 `.` 之前，因此已安装副本优先于本市场的检出：

1. `Bash: ls -d -- "${CLAUDE_PLUGIN_ROOT}/workflows/improve.js"`
2. `Bash: ls -d -- "${CODEX_PLUGIN_ROOT}/workflows/improve.js"`（如果设置的是这个变量）
3. `Bash: find ~/.claude ~/.codex . -maxdepth 7 -path '*/code-improver/workflows/improve.js' -print -quit 2>/dev/null`

完全按打印输出的样子使用该路径。其插件目录 —— 即去掉 `/workflows/improve.js` 后的路径 —— 就是 `pluginRoot`。如果三条都为空，尝试一次 `{name: "code-improver:improve"}`；如果这也不可用，就停下来并说明无法定位该循环。不要手工拼凑路径，也不要即兴模拟循环。

### 3. 调用工作流

使用 Workflow 工具运行它，`{scriptPath: "<the path from step 2>", args: {...}}`：

```json
{
  "target": "<absolute target path>",
  "reviewer": { "kind": "agent|skill", "name": "<namespaced-name>", "notes": "<what the reviewer should know about the target>" },
  "scope": ["<repo-relative-glob>/**"],
  "pluginRoot": "<the plugin directory from step 2>",
  "maxRounds": 5
}
```

- 仅在用户要求不同的上限时才设置 `maxRounds`。
- `pluginRoot` 让本次运行能找到其指标收集器；仅当第 2 步最终回退到按工作流名称调用时才省略该键 —— 届时工作流会自行搜索自身。
- `finalize`（`{"version_bump": bool, "narration_strip": bool, "docs_pass": bool}`）仅用于覆盖默认行为：当目标位于某个插件内部时进行版本提升，始终剥离叙述并执行文档整理。
- `decision` 仅在续接运行时传入（见下文）。

该工作流在后台运行，无需看管：它评审、修复、再评审，在每轮修复后检查范围，且只有在评审完全干净时才能完成。它从不提交；所有更改都保留在工作树中。

**如果 Workflow 工具不可用或被拒绝，请停下并说明。** 不要用直接编辑的方式在行内即兴模拟循环 —— 台账、范围防护和升级保障都在工作流里，行内仿造一样都不具备。

**如果结果是 `halted: "reviewer-unavailable"`，转达该结果并停止。** 指名的评审者未在本会话中安装；告知用户它由哪个插件提供，安装后重新运行。不要自己评审目标。

**循环运行期间不要结束你的回合。** Workflow 工具会立即返回一个任务 id；结果要稍后才到。在交互式会话中，完成通知会重新唤起你 —— 等待它即可。在非交互式运行（脚本、CI、评测）中没有稍后的回合：此时停止就等于在轮次中途弃置循环，因此启动后要轮询该任务（用 TaskOutput 查询返回的任务 id，或休眠后再检查）直到其完成，然后转达结果。一个回答“循环正在运行，我稍后报告”的会话已经丢掉了这次运行。

## 转达结果

工作流返回一个结构化结果。如实报告 —— 这些区别很重要：

- **`converged: true`** —— 最后一个动作是一次关键/重大发现为零的评审。报告所用轮数、剩余的次要发现（`open_minor_count`）以及产物路径（`ledger_path`、`metrics`）。
- **`capped: true`** —— 修复预算耗尽且最终评审仍发现阻塞性问题。直白地说：**触及上限，未收敛**，并列出 `open_blocking`。不要把这当作成功来汇报。
- **`escalation`** —— 循环检测到自己未在收敛（反复出现的发现、不减少的计数，或某个修复只是把问题挪了位置）。将升级消息和发现 id 转达给用户：这需要一项设计决策，而不是更多轮次。
- **`halted`** —— 某项防护被触发（范围违规、未登记的新文件、已失效或不可用的评审者，或某个 finalize 整理环节自身的编辑未通过紧随其后的检查）。转达 `violations`/`new_untracked_files` 中的路径、`finalize_regressions` 中的位置，以及附注。
- **`notes`** 总是随结果一同返回 —— 将其呈现出来；其中包含诸如“已初始化一个 git 仓库”之类的高声警告。

## 在升级后继续

循环在升级时停下是刻意设计。当用户做出决定后，以相同的 `target` 和 `reviewer` 启动一次全新运行，并附加：

```json
{ "decision": "<the user's ruling, verbatim>" }
```

新运行会重新加载磁盘上的台账，因此每一条发现、拒绝和裁定都会延续 —— 轮次从头计起，重新推导则不会。

要停止一个运行中的循环，请停止该工作流任务（TaskStop）；磁盘上的台账保持到最后一轮的最新状态，重新运行会从中续接。

## 何时不使用

- **一个 Claude Code 技能**：使用 `skill-improver` 入口 —— 它会接入正确的评审者
- **一个分支 / 拉取请求**：使用 `pr-improver` 入口 —— 它会从 diff 推导范围
- **一次性评审**：直接派发评审者；循环的价值在于迭代
- **快速的单点修复**：直接编辑该文件
