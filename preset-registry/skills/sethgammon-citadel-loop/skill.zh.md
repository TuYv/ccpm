---
name: loop
license: MIT
description: >-
  Bounded foreground repetition for the current session. Creates a loop
  contract, runs or coordinates an action plus verifier up to a declared attempt
  limit, and records evidence under .planning/loops/. Use for repeat-until-pass
  work that is too small for daemon and not time-based scheduling.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - loop
  - repeat until
  - until tests pass
  - until lint passes
  - max attempts
  - retry until
last-updated: 2026-06-09
---
# /loop -- 有界前台循环

## 定向说明

**使用时机：** 用户希望在当前会话内进行一个可见的“重复直到通过”循环，例如“循环直到 lint 通过”或“最多尝试三次，如果测试仍然失败就停止”。

**不使用时机：** 该工作需要跨会话无人值守运行（`/daemon`）、按时间点定时执行（`/schedule`）、由文件变更触发（`/watch`），或作为指标驱动的优化实验运行（`/experiment`）。

## 命令

| 命令 | 行为 |
|---|---|
| `/loop status` | 显示所有已知的 Citadel 循环，按进行中/已停止分组。 |
| `/loop inspect {id}` | 显示单个循环的契约、验证命令、预算、运行次数和停止原因。 |
| `/loop templates` | 列出内置循环模板。 |
| `/loop plan --template {name}` | 从模板创建循环契约。 |
| `/loop run "{action}" --verify "{command}" --max {N}` | 运行一个有界前台循环。 |
| `/loop stop {id}` | 将某个循环标记为已停止。 |

## 协议

### 第 1 步：判定循环类型

判断用户请求的是哪一类循环：

| 用户意图 | 路由 |
|---|---|
| 在当前活动会话内重复 | `/loop` |
| 跨会话延续行动任务 | `/daemon` |
| 按时间计划运行 | `/schedule` |
| 监视 PR 检查/评审 | `/pr-watch` |
| 监视文件或标记注释 | `/watch` |
| 优化某个数值指标 | `/experiment` |

如果另一条路由明显更合适，应予说明并转向该路由。

### 第 2 步：要求提供验证命令

`/loop run` 必须有显式的验证命令。“显式”是指用户提供了 `--verify "<command>"`，或以自然语言给出了同等具体的验证命令。不要根据"lint"、"test"、“直到它能跑通”或“修到通过为止”之类的措辞去推断验证命令。如果缺少验证命令，应先询问，且不得运行 `loop-runner.js`、shell 命令或手动修复步骤。

可接受的示例如下：

```text
--verify "npm run lint"
--verify "npm run test"
--verify "node scripts/operating-proof.js --write"
```

如果缺失，按以下格式回复：

```text
/loop needs an explicit verifier before it can run. Please provide one, for example:
--verify "npm run lint"

I will not run the loop until the verifier is explicit.
```

### 第 3 步：创建契约

对于 status、inspect、templates 和 stop 命令，运行：

```bash
node .citadel/scripts/loops.js <command>
```

对于模板规划：

```bash
node .citadel/scripts/loops.js plan --template <name> --write
```

对于前台执行：

```bash
node .citadel/scripts/loop-runner.js --action "<action>" --verify "<verifier>" --max-attempts <N> --write
```

如果 `.citadel/scripts/` 不存在且这里就是 Citadel harness 仓库本身，则改用 `node scripts/loops.js` 或 `node scripts/loop-runner.js`。

运行器会在 `.planning/loops/{id}.json` 下写入契约，为每次尝试追加记录，并以共享的停止状态收尾。

### 第 4 步：遇到首个终止条件即停止

当以下任一条件成立时即停止：

- 验证命令通过
- 达到尝试次数上限
- 操作以一种需要人工审查的方式失败
- 所请求的操作会跨越安全或审批边界
- 用户要求停止

绝不在声明的尝试次数上限之外静默继续。

### 第 5 步：报告结果

总结以下内容：

- 循环 id
- 状态
- 已使用的尝试次数
- 验证命令
- 运行器命令，包括 `--verify` 和 `--max-attempts`
- 状态文件路径
- 若在成功前停止，则给出下一步行动

## 边缘情形

**如果 `.planning/` 不存在：** 在写入循环状态前先创建 `.planning/loops/`。如果写入失败，则内联输出契约并告知用户需要进行设置。

**没有验证命令：** 向用户索要。不要推断出破坏性或高成本的验证命令。

**操作是代理命令而非 shell 命令：** 每次尝试都由代理手动执行该操作，然后使用 `node scripts/loops.js
register` 记录该循环，或将循环契约作为状态工件。不要把斜杠命令传给 shell 运行器。

**验证命令因同一原因反复失败：** 在达到尝试上限时停止，并报告 `attempt-limit` 及最新证据。

**用户要求无人值守循环：** 转向 `/daemon` 或 `/schedule`，而不是 `/loop`。

## 上下文闸门

**披露：** “正在运行前台循环：操作 `{action}`，验证命令 `{verifier}`，最大尝试次数 `{N}`。”

**可逆性：** amber —— 循环可能运行用户提供的 shell 命令并修改文件；可检查 diff 或循环拥有的工件以便回退。

**信任闸门：**
- 任意级别：要求提供验证命令和尝试次数上限。
- 熟悉级别：披露契约后可执行 shell 操作/验证命令。
- 高风险命令：运行前须满足正常的工具审批边界。

## 质量闸门

- 除非文件系统阻止，循环契约应存在于 `.planning/loops/` 之下。
- 验证命令是显式的。
- 尝试次数上限是显式的且 >= 1。
- 最终状态使用 `docs/LOOP_CONTRACT.md` 中的共享循环词汇表。
- 最终答复包含循环 id 和状态文件路径。

## 退出协议

```
---HANDOFF---
- Loop: {id}
- Status: {status}
- Attempts: {used}/{max}
- Verifier: {command}
- Runner: node .citadel/scripts/loop-runner.js --action "{action}" --verify "{command}" --max-attempts {max} --write
- State: .planning/loops/{id}.json
- Next: {next action or "none"}
---
```
