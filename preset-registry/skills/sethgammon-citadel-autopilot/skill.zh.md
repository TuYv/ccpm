---
name: autopilot
license: MIT
description: >-
  Intake-to-delivery pipeline. Processes pending items from .planning/intake/:
  briefs new ideas, executes approved work through research → plan → build → verify.
  Drop a file in .planning/intake/ and invoke this skill.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - intake
  - process pending
  - pipeline
last-updated: 2026-03-20
---
# /autopilot — 收件处理管线

## 定位说明

在以下情况使用 Autopilot：
- `.planning/intake/` 中存在待处理条目
- 你希望在没有人工编排的情况下处理收件条目
- 工作范围明确且定义清晰（复杂度为 Small 或 Medium）

不要在以下情况使用 Autopilot：
- 大型、跨多次会话的战役（改用 Archon）
- 并行执行（改用 Fleet）
- 探索性或开放式工作（改用 Marshal）

## 协议

### 步骤 0：交付预检

当用户明确指定某个收件文件，或请求“将收件转为 PR”时，在做任何自由形式的构建工作之前，优先执行确定性的交付预检：

```bash
node scripts/deliver.js --intake .planning/intake/{item}.md
```

如果未指定具体的收件文件，使用：

```
node scripts/deliver.js --next
```

这会选取 `.planning/intake/` 中优先级最高的待处理条目，并保持黄金路径的确定性。

这会创建一个进行中的战役，包含已认领的范围、验收标准、map 上下文和退出证据行，然后将该收件条目标记为 `in-progress`。随后使用 `/do continue` 从已创建的战役继续。

在构建和验证完成之后、将战役标记为完成之前，先打包交付物：

```bash
node scripts/package-delivery.js {campaign-slug}
```

如果 PR 已存在，将该 PR 记录为评审目标：

```bash
node scripts/package-delivery.js {campaign-slug} --pr https://github.com/{owner}/{repo}/pull/{number}
```

### 步骤 1：扫描

读取 `.planning/intake/` 中的所有文件并识别：
- `status: pending` → 需要撰写简报
- `status: briefed` → 可以构建
- `status: approved` → 可以构建
- `status: in-progress` → 检查是否卡住

### 步骤 2：撰写简报（针对 pending 条目）

对每个 pending 条目：

1. 阅读收件文件
2. 阅读描述中提到的相关文件
3. 调研范围：已有哪些文件、已确立了哪些模式
4. 撰写简报：
   - **Scope**：Small / Medium / Large
   - **Approach**：如何实现（2-3 句话）
   - **Files**：需要创建或修改哪些文件
   - **Quality gates**：完成时必须满足什么条件
   - **Risks**：可能出现什么问题
5. 将该条目的状态更新为 `briefed`

### 步骤 3：构建（针对 briefed/approved 条目）

对每个 briefed 条目（最小的优先）：

1. 阅读简报
2. 执行所述方法：
   - 创建或修改列出的文件
   - 遵循项目的约定（CLAUDE.md）
   - 每次改动后运行 typecheck
3. 验证：
   - 所有质量关卡均通过
   - typecheck 无错误
   - 测试通过（如适用）
4. 将状态更新为 `completed`

### 步骤 4：报告

输出已处理内容的摘要：

```
Autopilot processed {N} items:
  ✓ {item-1}: briefed → built → verified
  ✓ {item-2}: briefed
  ✗ {item-3}: blocked — {reason}
```

## 收件条目格式

```markdown
---
title: "Feature Name"
status: pending | briefed | approved | in-progress | completed
priority: normal | high
target: src/path/to/affected/area/
---

Description of what needs to be done...
```

## 边缘情况

- **`.planning/intake/` 为空或不存在**：输出“没有可处理的内容 — `.planning/intake/` 为空。可在其中放置文件，或运行 `/do setup` 进行初始化。”不要报错。
- **收件条目没有明确的行动项**：如果描述过于模糊而无法执行，向用户提出一个澄清问题，或者跳过该条目并附注：“已跳过 — 方向不明确。请更新收件文件后重新运行。”
- **条目状态无法识别**：将未知状态视为 `pending`，并按简报 → 构建的流程继续。
- **构建期间 typecheck 失败**：将失败情况记录在该条目的状态中，继续处理下一个条目，并在退出摘要中报告该阻塞项。
- **`.planning/` 不存在**：输出设置提示并干净地退出。Autopilot 必须依托 `.planning/intake/` 才能运行 — 如果该目录缺失，视为空收件队列，并建议运行 `/do setup`。

## 情境关卡

**披露：**“正在处理收件队列：N 个条目待处理。将按条目分派技能。”
**可逆性：** amber — 通过分派可能修改文件的其他技能来处理收件条目；撤销取决于被分派的技能
**信任关卡：**
- 任意：审查收件内容和简报。
- 熟悉（5 次以上会话）：autopilot 可自主处理排队条目；新手应在运行前审查收件内容。

## 质量关卡

- 绝不在未先阅读 CLAUDE.md 的情况下进行构建
- 每次文件改动后都运行 typecheck
- 仅在验证通过时才将条目标记为 completed
- 如果某个条目被阻塞，记录原因并继续处理后续条目

## 退出协议

```
---HANDOFF---
- Processed {N} intake items
- Built: {list of completed items}
- Blocked: {list with reasons}
- Remaining: {count of items still pending}
---
```
