---
name: prose-style
description: Reusable writing-style contract for agent outputs (reports, ARCH docs, verdicts, threat models). Forces direct prose with concrete evidence, no marketing voice, no hedge words. The single most-referenced skill across the pipeline — used by 28 agents.
when_to_use: |
  Apply to every agent that writes a human-readable artefact:
  - architect ARCH-*.md, ADR-*.md
  - pm PLAN-*.md
  - qa-engineer QA-*.md reports
  - security-officer CSO audit reports
  - 18 reviewer agents' REVIEW-*.md outputs
  - threat-models TM-*.md
  Do NOT apply to:
  - Raw code (use language-native style guides instead)
  - Verdict log lines (machine-parsed, format is fixed)
  - Beads task titles/descriptions (length-bounded, plain text)
effort: low
allowed-tools: Read, Write
paths:
  - "docs/**"
  - ".great_cto/verdicts/**"
---
# 行文风格——智能体报告写作规范

great_cto 报告的读者是周二下午 3 点忙碌的 CTO。他们会快速查找事实、决策以及需要关注的事项。营销式措辞和模糊用语只会浪费他们的时间。

## 五条规则

### 1. 开门见山给出结论

差：
> 在审阅架构文档并考虑包括但不限于可扩展性、安全性和可维护性在内的各种权衡因素后，我们认为所提方案总体上可以接受，但有些方面可能需要改进。

好：
> 批准，但需完成 2 项更改：(a) 将 PII 加密迁移到 KMS，(b) 为 webhook 处理程序添加幂等键。详情如下。

### 2. 提供具体证据，而非形容词

差：“性能可以接受。”
好：“在 5 万次请求中，p99 延迟为 142ms（k6 运行时间：2026-05-12 14:00 UTC，`tests/load/<your-scenario>.js`）。SLO 为 200ms。”

差：“安全性看起来不错。”
好：“Critical 或 High 级别无发现。2 个 Medium：`src/logger.ts:14` 中的日志级别为硬编码，`src/middleware/cors.ts:8` 中缺少 CORS 标头。”

### 3. 不使用模糊用语

禁用：*总体上、有一点、相当、基本上、有点、算是、或多或少、在某些情况下、经常、有时、偶尔、可能、也许、没准、有潜在可能、或许可以考虑*。

用具体表述替代，或直接省略。如果你确实不知道，就写“由于 <原因>，尚不确定”——这也是有价值的信息。

### 4. 不使用空洞的开场白

禁用：
- “在本文档中，我们将讨论……”
- “需要特别指出的是……”
- “首要的是……”
- “归根结底……”
- “不言而喻……”

如果删除一个句子不会造成信息损失，就将其删除。

### 5. 在最后一行给出结论行

每份最终报告都以以下格式之一结尾：

```
VERDICT: APPROVED — <one-line summary>
VERDICT: DONE — <one-line summary>
VERDICT: BLOCKED reason="<specific blocker>"
VERDICT: FAIL reason="<specific failure>"
```

董事会的 `readVerdicts()` 函数会解析这一行。该格式可供机器读取——不要添加修饰性文字。

## 模板

### 审查报告

```markdown
# REVIEW-<feature> — <reviewer name>

Reviewed: <commit-sha or file paths>
Standard: <regulation / framework you applied>

## Findings
- [Critical|High|Med|Low] <one-sentence finding>
  - location: <path:line>
  - rationale: <why this matters in this domain>
  - remediation: <specific fix>

## Verdict
VERDICT: APPROVED|BLOCKED reason="<short>"
```

### 架构 / ADR

```markdown
# ARCH-<feature> | ADR-<NNN>

Date: <ISO>
Status: proposed | accepted | superseded

## Context
2-4 sentences. What problem, what constraint.

## Decision
Imperative single sentence: "Use X for Y."

## Consequences
- Positive: <bullets>
- Negative: <bullets>
- Reversible? yes/no — if no, document migration cost

## Alternatives considered
<bullets with one-line dismissal reason each>
```

## 需要用 grep 检查的反模式

在编写结论行之前，使用以下表达式搜索草稿：

```
\b(generally|somewhat|fairly|mostly|kind of|sort of|possibly|perhaps|maybe)\b
```

如果匹配项出现在非引用句子中，请将其改写得具体明确，或将其删除。

## 为什么这很重要

董事会的 `readVerdicts()` 会解析每一份报告。营销式措辞会破坏
解析器。含糊其词的报告会浪费读者的时间。具体的信息能让
CTO 信任智能体的判断。