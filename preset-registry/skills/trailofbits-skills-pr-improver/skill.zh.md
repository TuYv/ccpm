---
name: pr-improver
description: "Runs an autonomous review-and-fix improvement loop over the current branch's changes until a PR review comes back clean, scoped mechanically to the directories the branch touched. Reviews are performed by an installed PR-review skill (default: pr-review-toolkit's review-pr). Use to fix review findings on a branch before opening or updating a pull request ('clean up this branch', 'fix this PR until review passes', 'run review-and-fix on my changes'). NOT for a one-time review — run the PR-review skill directly."
argument-hint: "[BASE_BRANCH] [--reviewer <skill-or-agent>] [--max-rounds N]"
allowed-tools: Bash Glob Read TaskOutput TaskStop Workflow
---
# PR Improver

通过运行 `/code-improver:improve` 来改进当前分支——这是一个动态工作流，会在该分支的变更上循环运行 PR 审查者和修复子代理，直到某次审查报告零条 critical/major 级别的发现为止。该循环、它的账本以及它的防护机制都位于工作流中；本技能从分支 diff 中推导出范围，并转达最终结果。

## 启动循环

用户提供的内容：`$ARGUMENTS`（若为空，则从对话中获取基准分支和偏好设置）。

### 1. 解析分支及其变更面

1. 仓库根目录：`git rev-parse --show-toplevel`。若在仓库之外运行，则明确报错。
2. 基准分支：若给出了参数则使用之，否则使用仓库的默认分支（`git symbolic-ref refs/remotes/origin/HEAD` → 其短名，回退到 `main`）。当前分支就是基准分支时拒绝运行——此时没有可供改进的 diff。
3. 变更文件：`git diff --name-only <base>...HEAD`。若为空，则说明情况并停止。
4. 范围：变更文件所在的**目录**，并加以放宽——逐文件的 glob 过于狭窄（PR 修复在变更代码旁边新增测试是完全正当的）。将每个变更文件映射为其仓库相对路径的目录 glob `<dir>/**`（仅当根目录下的文件发生变更时，才在仓库根处使用 `**`），然后去重，并删掉被其他 glob 覆盖的那些 glob。

### 2. 解析循环脚本

该循环是本插件中的动态工作流 `workflows/improve.js`。请按路径启动它：`scriptPath` 接受一个已解析的绝对路径，而 Workflow 工具的 `name` 解析的是内置工作流和项目工作流，因此通过 marketplace 安装的副本可能无法通过 `code-improver:improve` 这个名称找到。按顺序尝试，命中即止——home 目录排在 `.` 之前，因此已安装的副本优先于本 marketplace 的 checkout：

1. `Bash: ls -d -- "${CLAUDE_PLUGIN_ROOT}/workflows/improve.js"`
2. `Bash: ls -d -- "${CODEX_PLUGIN_ROOT}/workflows/improve.js"`（如果设置的是这个变量）
3. `Bash: find ~/.claude ~/.codex . -maxdepth 7 -path '*/code-improver/workflows/improve.js' -print -quit 2>/dev/null`

完全按打印出来的原样使用该路径。它的插件目录——即去掉 `/workflows/improve.js` 之后的路径——就是 `pluginRoot`。如果三者都返回空，就尝试一次 `{name: "code-improver:improve"}`；如果它也不可用，则停止并说明找不到该循环。不要手工拼装路径，也不要即兴拼凑一个循环。

### 3. 调用工作流

使用 Workflow 工具运行它，形式为 `{scriptPath: "<the path from step 2>", args: {...}}`：

```json
{
  "target": "<repo root>",
  "reviewer": {
    "kind": "skill",
    "name": "pr-review-toolkit:review-pr",
    "notes": "Review the working tree's changes against <base> as a pull request: correctness, tests, error handling, and the review dimensions the skill prescribes."
  },
  "scope": ["<derived-dir-glob>/**"],
  "pluginRoot": "<the plugin directory from step 2>",
  "maxRounds": 5
}
```

- `reviewer` —— 上面的默认值需要 `pr-review-toolkit` 插件。当用户指定了另一个 PR 审查者（skill 或 agent）时，就改用它，并相应地设置 kind。
- 仅当用户要求不同的上限时才传入 `maxRounds`。
- `pluginRoot` 让本次运行能找到它的指标收集器；仅当第 2 步最终退回到用工作流名称时才省略该键——此时工作流会自行搜索自身。
- `finalize` 的默认值对 PR 而言是合适的：除非分支位于某个插件内部，否则不做版本号提升；narration strip 与 docs pass 均开启。
- `decision` 仅在续接运行时才传入（见下文）。

循环的基线快照是循环启动时的工作树——它的范围防护机制保护着分支上未提交的工作；审查者审查的是 PR 自身的提交。

该工作流在后台运行，无需人工看管：它会审查、修复、再审查，在每轮修复后检查范围，并且只有在一轮干净的审查下才能完成。它从不提交；所有变更都保留在工作树中。

**如果 Workflow 工具不可用或被拒绝，请停止并如实说明。** 不要用直接编辑的方式内联即兴模拟这个循环——账本、范围防护和升级保障都位于工作流中，内联的仿制品一样都不具备。

**如果结果是 `halted: "reviewer-unavailable"`，请转达该结果并停止。** 该审查者未安装在本会话中；告诉用户是哪个插件提供它（默认值需要 `pr-review-toolkit`），并在安装后重新运行。不要亲自审查该分支。

**在循环运行期间，不要结束你的回合。** Workflow 工具会立即返回一个任务 id；结果要稍后才出来。在交互式会话中，完成通知会重新唤起你——等它到来。在非交互式运行（脚本化、CI、评测）中没有“稍后的回合”：停下来就等于让循环在一轮中途被弃置，因此启动之后要轮询该任务（用返回的任务 id 调用 TaskOutput，或者 sleep 后再检查），直到它完成，然后转达结果。一个只会回答“循环正在运行，我稍后会汇报”的会话已经丢掉了这次运行。

## 转达结果

该工作流返回一个结构化的结果。如实报告它——这些区别很重要：

- **`converged: true`** —— 最后一个动作是一次零 critical/major 发现的审查。报告所用的轮数、剩余的 minor 级发现（`open_minor_count`），以及产物路径（`ledger_path`、`metrics`）。
- **`capped: true`** —— 修复预算已用尽，且最终审查仍发现了阻塞性问题。直白说明：**已达上限（capped），并未收敛（converged）**，并列出 `open_blocking`。不要把这一结果当作成功来呈现。
- **`escalation`** —— 循环检测到自身没有收敛（发现反复出现、计数不降，或某个修复把问题挪到了别处）。将升级消息和发现 id 转达给用户：这需要的是一个设计决策，而不是更多轮次。
- **`halted`** —— 某个防护机制被触发（范围违规、未登记的新文件、已失效或不可用的审查者，或某个 finalize 轮次自身的编辑未能通过紧随其后的检查）。转达 `violations`/`new_untracked_files` 中的路径、`finalize_regressions` 中的位置，以及备注。
- **`notes` 总是随结果一起返回——要把它们呈现出来；其中包含诸如 “a git repository was initialized” 这样醒目的警告。**

## 在升级之后继续

循环在设计上就会在升级时停止。当用户做出决定后，使用相同的参数外加以下内容启动一次新的运行：

```json
{ "decision": "<the user's ruling, verbatim>" }
```

新的运行会重新加载磁盘上的账本，因此每一条发现、驳回和裁定都会延续下来——轮次重新开始，重新推导则不会。

要停止一个正在运行的循环，请停止该工作流任务（TaskStop）；磁盘上的账本会保持到最后一轮的最新状态，重新运行时会从中继续。

## 何时不使用

- **一次性审查**：直接运行 PR 审查 skill；循环的价值在于迭代
- **一个 skill**：使用 `skill-improver` 入口——它会接好正确的审查者
- **尚未推送的探索性工作**：审查-修复循环是用来固化 diff 的；而当其形态还在变动时，手动迭代能提供更多控制
