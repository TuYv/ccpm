---
name: done-blocked
description: Reusable reporting contract for any agent that hands work back to the pipeline. Forces ONE of two terminal statuses (DONE or BLOCKED) with a specific evidence shape. Stops vague "probably finished" and "kind of stuck" verdicts.
when_to_use: |
  Apply to every terminal verdict an agent writes — the last line of a spawned agent run, the top of a report file, or the summary appended to a Beads task comment. Specifically:
  - architect ARCH doc completion → DONE or BLOCKED
  - senior-dev task close → DONE or BLOCKED
  - qa-engineer QA report verdict → DONE (PASS) or BLOCKED (FAIL with evidence)
  - security-officer CSO audit verdict → DONE (APPROVED) or BLOCKED (findings)
  - devops deploy step → DONE or BLOCKED
  - l3-support incident triage step → DONE or BLOCKED
  - project-auditor audit completion → DONE or BLOCKED
  Do NOT force this on intermediate progress pings (those are advisory). Only terminal verdicts.
effort: low
allowed-tools: Read, Write, Bash
paths:
  - ".great_cto/verdicts/**"
  - "docs/**"
---
# DONE / BLOCKED 报告契约

终态严格限定为两种，并且 BLOCKED 必须提供具体证据——不得使用含糊的受阻报告。

## 契约

每个智能体最终交接内容的最后一行必须是以下格式之一：

```
DONE: <用一句话概括已交付的内容>
  artifact: <报告/PR/提交的路径>
  next: <由谁接手——流水线阶段、门禁，或 "pipeline continues">
```

```
BLOCKED: <用一句话概括障碍>
  tried: <已尝试的操作——文件路径、命令、错误特征>
  failed_because: <具体原因——不得写 "unclear"，不得写 "complex">
  need: <解除阻塞所需的具体事项——文件访问权限、缺失的配置、CTO 决策、另一个智能体>
```

## 硬性规则

1. **不存在第三种状态。** "Mostly done"、"done with caveats"、"almost there" → 必须二选一。如果存在注意事项，则由其本身决定：
   - 注意事项仅涉及外观问题 / P2+ → **DONE**（提交一个 Beads 缺陷，然后继续）
   - 注意事项会阻塞流水线的下一阶段 → **BLOCKED**（不要佯装完成）

2. **BLOCKED 必须包含三个字段。** `tried` + `failed_because` + `need`。缺少任何字段 → 结论将被拒绝，智能体必须重新报告。即使情况“显而易见”，也不例外。

3. **沉默不代表 DONE。** 如果智能体停止输出，但没有终态行，父级 / 下一阶段会将其视为 BLOCKED，并记录 `failed_because: silent — no terminal verdict written`。

4. **`failed_because` 必须具体。** 以下表述会被拒绝：
   - "environment issue" → 说明*哪个*命令失败，以及出现了*什么*错误
   - "tests failing" → 说明*哪些*测试失败，以及实际的断言消息
   - "unclear requirements" → 说明需要做出*哪个*决策，以及两个选项分别是什么
   - "not enough context" → 说明你尝试读取了*哪个*文件 / 文档 / 配置

5. **`need` 必须明确指出解除阻塞所需的具体事项。** 以下表述会被拒绝：
   - "more information" → 提出一个具体问题
   - "help from another agent" → 指明智能体（architect / security-officer / …）
   - "CTO approval" → 说明确切的选择（批准门禁 X、在选项 A 和 B 之间选择、豁免检查）

## 结论写入位置

每个智能体都要将结论写入**两个位置**：

1. **智能体输出的最后一行**（对启动它的编排器可见）。
2. **`.great_cto/verdicts/<agent>-<YYYY-MM-DD-HHMMSS>.log`**——仅追加的审计记录。

```bash
mkdir -p .great_cto/verdicts
VERDICT_FILE=".great_cto/verdicts/<agent>-$(date -u +%Y-%m-%d-%H%M%S).log"
printf '%s\n' "$VERDICT_LINE" > "$VERDICT_FILE"
```

## 示例

**正确——DONE：**
```
DONE: CSO 审计通过——发现 0 个 P0、2 个 P1 问题，均已提交为 Beads 任务。
  artifact: docs/security/CSO-2026-04-19.md
  next: gate:ship 已准备就绪，等待 CTO 批准
```

**正确——BLOCKED：**
```
BLOCKED: senior-dev 无法认领任务 BD-42——它与 BD-38 存在循环依赖。
  tried: bd ready → 未出现 BD-42；bd dep tree BD-42 → 显示 BD-38 阻塞 BD-42，且 BD-42 阻塞 BD-38
  failed_because: 两个任务存在传递性相互依赖（BD-42 → BD-38 → BD-39 → BD-42）
  need: architect 将 BD-39 拆分为两个任务，以打破循环
```

**被拒绝——含糊的 BLOCKED：**
```
BLOCKED: 无法完成 QA——存在环境问题。
  tried: 运行了测试
  failed_because: 出了问题
  need: 帮助
```
被拒绝的原因：`tried` 缺少命令/路径；`failed_because` 属于同义反复；`need` 不具备可操作性。

## 衡量契约

`.great_cto/verdicts/*.log` 是机器可读的。每周摘要可以计算：
- 每个智能体的 `DONE:BLOCKED` 比率——某个智能体报告过多 BLOCKED，意味着该角色资源不足或提示词不清晰
- `failed_because` 聚类——如果同一原因出现 3 次以上，就说明这是一个值得通过元层面修复（工具、文档、技能）的重复性阻碍
- 沉默率（未写入最终裁定的智能体）——该指标应逐渐降至零

## 反模式

- 在同一份报告中同时写 DONE 和 BLOCKED（“DONE but blocked on X”）。只能选一个。如果你被阻塞了，工作就尚未完成。
- 当门禁仍未通过时，将 DONE 用作礼貌性信号。裁定是给机器看的，不是为了照顾 CTO 的感受。
- 只将裁定写入 stdout，而不持久化到 `.great_cto/verdicts/`。审计追踪记录才是让契约可衡量的关键。