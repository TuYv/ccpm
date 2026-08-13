---
name: skeptical-triage
description: Reusable 3-round self-challenge + arbiter pattern for filtering false positives from findings/verdicts. Use when the cost of a false-positive gate block exceeds the cost of ~4 extra LLM turns.
when_to_use: |
  Apply skeptical triage when:
  - A finding could block a gate (gate:code, gate:ship, gate:qa, gate:arch) and flipping it wrongly wastes CTO time
  - A verdict is about to be written to a report that downstream agents will trust (CSO, QA, ADR)
  - Multiple signals disagree (one reviewer says VALID, another says INVALID) — arbiter resolves cleanly
  Do NOT apply to:
  - P2 findings or advisory notes (cost > benefit)
  - Hard findings (secrets in source/git, confirmed CVEs, failing tests) — these are facts, not judgments
  - Quick factual lookups ("does this file exist?", "what version is pinned?")
effort: medium
allowed-tools: Read, Grep, Bash, Glob
paths:
  - "docs/**"
  - "src/**"
  - "lib/**"
  - "app/**"
---
# 怀疑式分诊

在多角度审查、安全审计、QA 回归标记或任何高风险判断演变成阻断项之前，过滤其中的误报。

进行三轮怀疑式自审，再由一名公正的仲裁者裁决，并根据投票给出置信度评分。

## 何时调用

| 调用方 | 发现类型 | 是否应用分诊？ |
|--------|--------------|---------------|
| `/review` | 角度 2/4/7/9 的 P0/P1（安全、SQL、隐私、并发） | 是 |
| `/review --deep` | 任意角度的 P0/P1 | 是 |
| `security-officer` | CSO 审计中的 P0/P1 | 是 |
| `security-officer` | 源代码/git 中的密钥、已确认的 CVE | **否** — 确凿发现 |
| `qa-engineer` | 不稳定测试判定（这是回归还是偶发失败？） | 是 |
| `architect` | ADR 权衡争议（当选项 A 和 B 看起来都合理时） | 是 |
| 任意 | P2/建议项 | 否 |

## 四步模式

按顺序执行以下步骤。每一轮都能看到之前的推理。仲裁者能看到所有轮次的结果。

### 第 1 轮 — 可达性 / 前提

问题：**前提是否成立？**
- 对于安全性/可靠性问题：外部攻击者能否通过不受信任的输入到达此代码路径？从缺陷位置开始，沿输入流反向追踪到其来源。如果只有可信的内部调用方 → 倾向于判定为 INVALID。
- 对于回归问题：从干净状态开始，能否在目标分支上复现失败行为？
- 对于 ADR 权衡：迫使做出该选择的约束是否真的具有约束力？（例如，“我们需要 <10ms p99”——这是真实要求还是期望目标？）

输出：`{round: 1, verdict: VALID|INVALID|UNCERTAIN, reasoning: "...", crux: "single key fact"}`

### 第 2 轮 — 验证所引用的防御措施 / 反证

问题：**所声称的防御措施是否真实且充分？**
- 对每一项被引用的防御措施 → 使用 `Grep` 查找其实际实现所在的行。
- 将常量名称解析为数值。`MAX_BUF_SIZE` 并不是已验证的边界——`#define MAX_BUF_SIZE 64` 才是。
- 对于回归问题：所引用的“测试覆盖了这一点”是否真的断言了正确的不变量？
- 对于 ADR：所引用的基准测试/先例是否真实存在（通过 grep 查找并阅读），还是仅仅来自传言？

如果你无法指出强制实施该防御措施的具体代码行，**那么它就不存在。**

输出：使用相同的 JSON 结构，并添加 `grep_used: true/false`。

### 第 3 轮 — 遗漏的角度

问题：**第 1–2 轮没有考虑到什么？**
- 错误路径、整数溢出、竞态窗口、不同调用方、平台差异
- 不要重复之前各轮的内容——应补充新证据或作出让步
- 对于 QA：重试逻辑是否掩盖了失败？是否存在其他测试造成的测试污染？
- 对于 ADR：是否存在两位审查者都未提出的选项 C？

输出：使用相同的 JSON 结构。

### 仲裁者

输入：全部 3 轮结果 + 原始发现/问题 + 源代码。

问题：**最终裁决——哪一方的证据更有力？**
- 给出单一的 `verdict: VALID|INVALID`（不得使用 UNCERTAIN——必须作出裁决）。
- 给出一句话的 `crux`——决定该裁决的关键事实。
- 如果之前 3 轮均得出了相同结论，只有在出现压倒性的新证据时才能推翻，并说明原因。

输出：
```json
{
  "verdict": "VALID",
  "crux": "memcpy at auth.c:142 copies network-controlled len bytes into 64-byte stack buffer with no bound check",
  "reasoning": "Rounds 1 and 3 verified attacker reach; Round 2 found no size check in 50 LOC radius; arbiter confirms no caller clamps len."
}
```

## 硬性规则

将这些规则写入每一轮的提示词中：

1. **不存在防御措施 → VALID，而不是 UNCERTAIN。** 如果你搜索了防御措施但没有找到，这就是答案。“其他代码可能会处理这个问题”不是有效的防御理由。
2. **常量名称不等于已验证的边界——只有解析后的值才是。** 使用 Grep 查找 `#define` / `const` 声明。
3. **指出具体行，否则就视为不存在。** 含糊地提及“此代码库中的假设”不算数。
4. **不要在同一响应中反驳自己的结论。** 如果你已经验证某项防御措施并不充分，那么这就是结论。不要再继续寻找理由来推翻它。
5. **代码质量问题 ≠ 安全漏洞。** 诊断状态上的数据竞争、仅内部使用的 API 中的 NULL 检查、只在调试构建中出现的 UB → INVALID。
6. **相信你自己的推理。** 如果你第一遍阅读时就看到了关键所在，不要凭空编造反驳理由。

## 置信度评分

```
confidence = valid_rounds_before_arbiter / 3
```

- `100%` (VVV) — 3/3 轮均为 VALID。除非发现全新的情况，否则仲裁者只需直接确认。
- `67%` (VVI or VIV or IVV) — 多数为 VALID。仲裁者根据新证据作出最终裁决。
- `33%` (IIV or IVI or VII) — 多数为 INVALID。仲裁者通常会确认 INVALID。
- `0%` (III) — 3/3 轮均为 INVALID。仲裁者很少会推翻该结果。

仲裁者会**覆盖**最终裁决；为确保透明度，置信度反映各轮投票结果。在输出中同时记录两者，以便人工查看仲裁者在哪些情况下作出了不同裁决。

## 将分诊结果应用于严重性级别

仲裁者返回结果后：

| 仲裁者裁决 | 置信度 | 严重性级别操作 |
|-----------------|------------|-----------------|
| `VALID` | ≥ 50% | 保留原始严重性级别 |
| `VALID` | < 50% | 降级：P0→P1，P1→P2 |
| `INVALID` | 任意 | 从门禁统计中移除，并在报告中记录为 `[FILTERED]` 以供审计 |
| `UNCERTAIN`（仅当仲裁者无法作出判断时） | n/a | 保留原始严重性级别，并标记为需要 CTO 人工审查 |

## 输出模式

每个调用方都将分诊结果记录到 `.great_cto/triage-log.jsonl`（仅追加，每行一个 JSON）：

```json
{
  "timestamp": "2026-04-19T12:34:56Z",
  "caller": "review|security-officer|qa-engineer|architect",
  "finding_id": "SEC-042",
  "file": "src/auth.c:142",
  "original_severity": "P0",
  "rounds": [
    {"round": 1, "verdict": "VALID",   "crux": "..."},
    {"round": 2, "verdict": "VALID",   "crux": "...", "grep_used": true},
    {"round": 3, "verdict": "INVALID", "crux": "..."}
  ],
  "arbiter": {"verdict": "VALID", "crux": "..."},
  "confidence": 0.67,
  "final_severity": "P0"
}
```

此日志用于衡量分诊是否真正发挥了作用。每周审查一次：

```bash
# False-positive rate: how many findings the arbiter flipped to INVALID
jq 'select(.arbiter.verdict=="INVALID")' .great_cto/triage-log.jsonl | wc -l

# Average rounds-to-consensus (did we need all 3 or did R1+R2 agree?)
jq '[.rounds[].verdict] | unique | length' .great_cto/triage-log.jsonl
```

如果完成 50 次分诊后 FP 率 < 10%——说明分诊正在过滤原本并不存在的噪声。降低阈值，或跳过对该审查角度的分诊。如果 FP 率 > 40%——说明原始审查提示词过于敏感；应收紧该审查角度的规则。

## Token 预算

每个经分诊的问题：约 4 次 LLM 交互（3 轮讨论 + 仲裁者）。对于典型规模的审查（每个 PR 约有 5-10 个经分诊的问题），每次 `/review` 的总预算为额外 20-40 次交互。尽可能批量处理——如果多个问题的关键争议点彼此独立，一个仲裁者可以在一次调用中处理多个问题。

对于成本敏感的运行（在大型 PR 上使用 `approval-level: auto`），可以考虑：仅分诊 P0，暂不分诊 P1。根据 `.great_cto/triage-log.jsonl` 中的数据重新调优。

## 反模式

- **不要分诊 P2/建议性问题。** 重点在于做出门禁决策。P2 仅供参考——让作者看到后继续推进即可。
- **不要让各轮讨论重复彼此的内容。** 第 3 轮的提示词必须明确要求“添加新的证据，否则让步”。如果 3 轮讨论给出了完全相同的推理，就浪费了 2 次交互。
- **在结果为 UNCERTAIN 时不要跳过仲裁者。** 如果全部 3 轮的结果都是 UNCERTAIN，仲裁者的职责就是做出决定——而不是继续让情况扑朔迷离。
- **不要隐瞒仲裁者的推翻决定。** 当仲裁者推翻多数票时，同时记录 `confidence`（投票结果）和 `final_verdict`（仲裁者结论）。应当让人类看到这种分歧。