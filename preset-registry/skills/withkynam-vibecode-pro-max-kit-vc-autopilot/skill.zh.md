---
name: vc-autopilot
description: "Emit and validate the provisional goal block for Autopilot Mode. Owns the 9-field format and resume detection from a pasted goal block."
argument-hint: "[task description or pasted goal block for resume detection]"
trigger_keywords: autopilot, run autopilot, full autopilot, autonomous mode, goal block, provisional goal, AUTOPILOT_ACTIVATED, resume autopilot
layer: contract
metadata:
  author: vibecode-pro-max-kit
  version: "1.0.0"
---
# vc-autopilot

负责 Autopilot 模式会话中**暂定目标块工件**的契约技能。该技能由编排器调用，用于发出目标块、进行校验，并从目标块恢复。规范协议位于 `process/development-protocols/autopilot.md`。

---

## 何时调用

在以下情况下调用此技能：

- 编排器刚刚收到 autopilot 触发短语，需要在合并澄清轮次之后发出暂定目标块。
- 编排器在会话开始时检测到粘贴进来的目标块，需要判断这是否为恢复场景（目标块已存在 → 不进行新的澄清轮次）。
- 需要针对某个工件运行 `validate-autopilot-goal-block.mjs` D1 校验器。

---

## 技能工件

**暂定目标块** — 一个不超过 4000 字符、恰好包含 9 个命名字段的结构化文本块。规范字段规格位于 `process/development-protocols/autopilot.md §Provisional Goal Block Format`。本技能不会重新定义该规格 — 只是引用它。

必填字段（精确的字符串锚点 — 不得重命名或缩写）：

1. `SESSION GOAL:`
2. `ENTRY PHASE:`
3. `REMAINING PHASES:`
4. `CLARIFICATIONS LOCKED:`
5. `EXECUTE CONSENT:` — 必须包含字面文本 `standing-granted`
6. `DECISION POLICY:`
7. `HARD STOPS:`
8. `TEST GATES:`
9. `START:`

---

## 发出流程

面向编排器的分步说明：

1. 完成合并澄清轮次（`process/development-protocols/autopilot.md §Consolidated Clarification Round`）。
2. 根据磁盘工件检测结果确定 `ENTRY PHASE`（autopilot.md §Trigger-Anywhere Detection Flow）。
3. 构建 `REMAINING PHASES` 清单：对于按规范 RIPER-5 顺序尚未完成的每个阶段，添加一行带 `[ ]` 复选框的条目，注明阶段名称和计划执行的策略。
4. 使用已锁定的澄清答案填写全部 9 个字段。
5. 统计总字符数。如果超过 4000：将 DECISION POLICY 和 CLARIFICATIONS LOCKED 压缩为摘要，并引用 autopilot.md 以查看完整细节。
6. 将该目标块以围栏代码块的形式打印到聊天中。
7. 将该目标块写入磁盘：`{task-folder}/{slug}_AUTOPILOT_GOAL_{dd-mm-yy}.md`（头部为："Emitted: [datetime]. Provisional block. V7 will emit (UPDATE) variant."）。
8. 发出 `AUTOPILOT_ACTIVATED: [task] — entry phase: [phase] — goal block emitted`。

---

## 恢复检测

编排器如何在会话开始时识别粘贴的目标块：

- 如果用户消息以标题/标签的形式包含全部 9 个字段名称，则将其视为一次 autopilot 恢复。
- 恢复时：完全跳过合并澄清轮次。从粘贴的目标块中读取 `ENTRY PHASE` 和 `REMAINING PHASES`。将 `CLARIFICATIONS LOCKED` 读取为已锁定的决策。将 `DECISION POLICY` 和 `HARD STOPS` 读取为常设策略。
- 发出 `[MODE: AUTOPILOT | <ENTRY PHASE>]`，并从 `START:` 开始运行。
- 不要发起新的澄清轮次（SPEC AC-14）。

---

## V7 UPDATE 变体

当 VALIDATE V7 在一次 autopilot 运行期间完成时，编排器会：

1. 从新的 validate-contract 中读取真实的门禁命令。
2. 复制暂定目标块。
3. 在 `SESSION GOAL:` 前加上 `(UPDATE) ` 前缀。
4. 将 `TEST GATES: TBD — populated after VALIDATE` 替换为实际的
