---
name: archetype-review-base
description: Shared review framework that every domain reviewer (pci, oracle, gov, edtech, healthcare, mlops, etc.) MUST follow. Defines the output artifact (TM-{slug}.md), mandatory sections, severity scale, verdict format, the workflow scaffold (when-invoked, Step-0 read-inputs, HANDOFF), and the "domain heuristic vs generic check" boundary. Eliminates duplication across the ~30 reviewer prompts.
when_to_use: |
  Apply when invoked as ANY domain reviewer:
  - pci-reviewer, oracle-reviewer, gov-reviewer, healthcare-reviewer,
    mlops-reviewer, ai-security-reviewer, edtech-reviewer,
    enterprise-saas-reviewer, insurance-reviewer, regulated-reviewer,
    marketplace-reviewer, cms-reviewer, devtools-reviewer,
    library-reviewer, cli-reviewer, data-platform-reviewer,
    streaming-reviewer, infra-reviewer, firmware-reviewer,
    game-reviewer, web-store-reviewer, mobile-store-reviewer,
    db-migration-reviewer, ai-prompt-architect, ai-eval-engineer
  Do NOT apply when running security-officer general STRIDE — that's a
  different review tier (cross-domain, fallback for archetypes without
  a domain reviewer).
effort: medium
allowed-tools: Read, Write, Grep, Glob, Bash(git:*), Bash(bd:*)
paths:
  - "docs/**"
  - ".great_cto/verdicts/**"
---
# Archetype-review-base — 共享评审框架

每个领域评审员都遵循这一框架。每个评审员自己的
SKILL.md 会在此基础上添加领域启发式规则。此技能定义了
所有评审员之间必须完全相同的部分。

## 输出产物（规范）

实施前评审员（即 `*-reviewer` 智能体——`agents/` 中约有 30 个——
由 architect 在 senior-dev 认领任务之前调用）会在
`docs/sec-threats/TM-{slug}.md` 编写一份**威胁模型**，并追加一个 `<!-- HANDOFF -->` 块（见下文
“工作流脚手架”）。这是所有评审员统一采用的唯一约定。

**每个功能 slug 对应一个 TM 文件。** 按评审员添加的文件名后缀
（`TM-api-{slug}.md`、`TM-extension-{slug}.md`）已弃用——使用方会匹配
`TM-{slug}.md`，而带有各自后缀的文件会悄无声息地绕过其检查。当多个
领域评审员针对同一 slug 运行时，每个评审员都要将自己的 `## {reviewer}
findings` 章节及自己的 `<!-- HANDOFF -->` 块追加到共享的
`TM-{slug}.md` 中——绝不能覆盖其他评审员的章节。

下述**发现 / 严重级别 / 结论**结构，是写入该产物的内容格式（也适用于任何由评审层级智能体在实施后生成的
`docs/reviews/REVIEW-{slug}.md`）。不同阶段的路径不同；
章节语法完全相同。

## 必需的报告章节

报告（TM 或 REVIEW）必须严格按照以下顺序包含这些章节：

```markdown
# TM-{slug} — {reviewer name}      <!-- pre-impl; post-impl review-tier files use REVIEW-{slug} -->

Reviewed: {commit-sha or file paths or ARCH doc reference}
Standard: {regulation / framework you applied — list specific clauses}
Date: {ISO timestamp}

## Scope

2-3 sentences. What did you look at? What's intentionally out of scope?

## Findings

For each finding, use this exact format:

- **[Critical|High|Medium|Low]** {one-sentence finding title}
  - Location: {file:line or component name}
  - Rationale: {why this matters IN THIS DOMAIN — cite a regulation or
    domain-specific best practice. Generic "could be a problem" is
    rejected.}
  - Repro: {a command, or numbered steps, that SHOWS the finding. Required for
    Critical and High.}
  - Remediation: {specific fix — code change, config change, or
    architectural change. NOT "consider adding X" — write the exact change.}
  - References: {URL or document section}

Order findings: Critical → High → Medium → Low.
If no findings at a tier, write: "_None at {tier} severity._"

### Repro, and why it is required at Critical and High

A finding with no reproduction cannot be shown to be fixed, so closing it is an
opinion. A security review on 2026-08-07 said exactly this about its own weaker
items and scored them lower for it — the rule is that reviewer's own standard,
written down.

It is also what makes the finding survive you. The person who fixes it is not
you, and neither is the person who checks the fix; a reproduction is the only
part of a finding that both of them can run.

### File Critical and High as beads

A finding that lives only in a report is one nobody can track, and one whose
closure nobody can check. Two of them were closed on 2026-08-07 by the author of
the fix, which is not a check at all — `scripts/lib/finding-closure.mjs` calls
that `self-verified` and refuses it, but only for findings it can see.

```bash
bd create "[Critical] {title}" --label finding --type bug \
  -d "Location: {file:line}
Repro: {command or steps}
Rationale: {why}
Remediation: {exact fix}"
```

随后，随着发现项的推进：

```bash
bd comment <id> "fixed-by: <agent>"      # whoever writes the fix
bd comment <id> "verified-by: <agent>
repro-result: passed"                    # someone who did NOT write it,
                                         # stating what the repro did NOW
bd close <id> --reason "repro re-run after the fix, now passing"
```

`repro-result` 可以是 `passed`、`failed` 或 `not_run`，验证者需要在
与 `verified-by` 相同的评论中填写它。不会有任何机制代你重新执行复现步骤：
从 bead 描述中运行命令会使报告渠道变成执行渠道，而这在
2026-08-07 的 `execution-claims` 中产生了三个 CRITICAL。因此，这一级检查的是谁声称复现已通过，
以及该人员是否编写了修复——而不是检查命令本身。这是一个真实存在的限制，也是
有意为之的限制。

如果验证没有说明复现的执行结果，该发现项会保持为
`repro-not-run`。“我看没问题”不算结果。

验证者不能是修复者，验证必须在修复之后进行，并且复现现在必须通过。
这些条件会受到检查，而不只是提出要求。

## 结论

VERDICT: {APPROVED|BLOCKED} reason="{specific reason}"
```

## 严重性等级（以领域为基准）

严重性应依据**本领域**的监管或正确性基准进行评级，而非通用的 STRIDE 严重性。例如：

- PCI 审查员将静态存储时未加密的 PAN 评为 **Critical**（违反 PCI 范围要求；造成直接的监管风险）
- 预言机审查员将 Chainlink 数据陈旧时间 < 1h 评为 **High**（当前可能尚可接受，但在压力情况下容易受到 MEV 攻击）
- 政府审查员将 Section 508 无障碍缺陷评为 **High**（存在联邦合同风险；并非 Critical，因为这不会立即造成违规事件）

在 Rationale 中引用相应标准。如果无法引用，该发现很可能属于通用问题，应将严重性下调一级（通用问题由 security-officer agent 处理）。

## 结论规则

- 仅当所有 Critical 和所有 High 级发现均已在 bd 待办列表中安排修复时，才允许使用 `VERDICT: APPROVED`。（使用 `bd ready --label {your-archetype}` 检查。）
- 如果哪怕有一个 Critical 或 High 级发现没有修复措施，或者在调查中发现了你无法解决的未知问题，则必须使用 `VERDICT: BLOCKED`。
- Medium 和 Low 级发现不会造成阻塞。记录这些发现；流水线继续运行。

## 领域启发式检查与通用检查

你是**专业审查员**。你的职责是识别通用 STRIDE / OWASP 检查无法发现的领域特定问题。判定规则：

| 检查涉及…… | 归属 |
|---|---|
| 卡数据、PCI 范围、支付幂等性 | pci-reviewer |
| 预言机数据陈旧、MEV、合约可升级性 | oracle-reviewer |
| PHI 流、BAA 链、FHIR/HL7 | healthcare-reviewer |
| 通用 XSS、SQLi、弱哈希、源代码中的密钥 | security-officer（**不属于你**） |
| 通用的“需要错误处理” | senior-dev / code-reviewer（**不属于你**） |

如果发现属于通用问题，请简要提及，但**不要**夸大其严重性。将其交由相应的通用审查员处理。

## 应用 skeptical-triage

在输出 `VERDICT: BLOCKED` 之前，应用 `skeptical-triage` skill（进行 3 轮自我质疑）。在 gate:plan 阶段误报 BLOCKED 会浪费 CTO 的时间。仅当 3/3 轮均确认后才进行阻塞。

## 结论日志行

完成报告后，通过辅助脚本记录规范的结论（参见 `agents/_shared/verdict-format.md`——**不要**手动编写该行；辅助脚本可保证格式能被看板解析器和流水线分派器读取，并且 `auto` 会记录实际的 token 成本）：

```bash
bash scripts/log-verdict.sh {your-name} {APPROVED|BLOCKED} auto \
  feature={slug} tm=docs/sec-threats/TM-{slug}.md criticals={N} highs={M}
```

## 行文规则——应用 skill `prose-style`

- 不使用模糊措辞（“generally”“somewhat”“maybe”）
- 开门见山给出结论
- 使用具体证据（file:line），而非形容词
- 不使用空洞的开场白（“In this review, we will...”）
- 结论行必须位于报告的**最后一行**

## 何时升级处理，何时进行审查

在以下情况下升级给 security-officer（而非仅执行 BLOCK）：

- 发现跨越了你的领域边界（例如 PCI 审查员发现了通用 SQLi——这是 security-officer 的职责）
- 监管问题存在歧义（例如“根据 HIPAA，这是 BA 还是 sub-processor？”）
- 用户提供了相互冲突的要求（因矛盾而判定 BLOCKED，而不是依据你的领域专业知识）

升级处理：创建一个带有 `security-officer` 标签的 `bd` 任务，并使其 `blocks` 你的评审结论。

## 签署前自检

在写下结论行之前，对你的草稿执行 grep，检查：
- `\b(generally|somewhat|fairly|mostly|possibly|perhaps|maybe)\b` — 重写
- 任何没有 Location 行的发现 — 修正
- 任何 Remediation 不是具体变更的发现 — 修正
- 任何没有 remediation-in-bd 的 Critical/High — 将结论改为 BLOCKED

如果任何检查在非引用块中触发，请在签署前修正。

## 工作流脚手架（共享 — 你的提示词不得重复此内容）

每位评审者都共享同一套框架。它位于此处；领域评审者自己的提示词应仅在此基础上添加该领域的启发式规则，绝不可重新陈述以下步骤。（过去，每位评审者都会复制约 80 行此类内容 — 消除这种重复正是此技能存在的意义。）

### 调用你的时机

- `senior-dev` 处于实现前模式，并且项目 `archetype` 与你的匹配（或与你声明的 `applies_to:` 匹配）。
- Architect 已完成 ARCH 文档；senior-dev 尚未开始编码。
- 你的领域中出现任何新入口（新标志、连接器、支付路径、迁移……）。

你应在 senior-dev 认领任务之前运行。在流水线继续之前，你的 Critical/High 发现必须在 bd 待办事项中有对应的修复任务。

### 步骤 0 — 读取输入（规范步骤；不要重新推导）

```bash
mkdir -p docs/sec-threats
ARCH=$(ls docs/architecture/ARCH-*.md 2>/dev/null | sort -V | tail -1)
[ -z "$ARCH" ] && { echo "BLOCKED: no ARCH doc — architect must run first." >&2; exit 1; }
SLUG=$(basename "$ARCH" .md | sed 's/^ARCH-//')
TM="docs/sec-threats/TM-${SLUG}.md"
```

然后依次阅读：ARCH 文档中与该领域相关的章节、你所在领域的源文件，以及你的领域所需的任何 `.great_cto/PROJECT.md` 字段（例如 `code-sets:`、`payers:`、`compliance:`）。

### 输出 — `docs/sec-threats/TM-${SLUG}.md`

如果存在你的领域模板，请使用 `skills/great_cto/templates/TM-{archetype}.md`；否则使用上文的 Findings/Severity/Verdict 语法。文件末尾应包含一个供编排器解析的交接块：

```yaml
<!-- HANDOFF -->
{your-name}-verdict: signed-off | blocked
critical-findings: <N>
high-findings: <M>
must-implement-before-senior-dev:
  - <specific change 1>
  - <specific change 2>
gate: <gate:domain-signoff or — if none>
```

### 不要在你的提示词中包含

- “## Skills used” 页脚 — 你的 `skills:` 前置元数据才是事实来源。
- 对严重性等级、结论规则、行文规则、升级策略或自检的重新陈述 — 这些均已在此技能的上文中定义。
- Step-0 bash 的副本 — 此处的版本为规范版本。

在剥离此脚手架后，领域评审者应遵循的最简结构请参见 `skills/archetype-review-base/reviewer-template.md`。