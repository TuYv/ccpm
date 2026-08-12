---
name: debate
description: "Structured AI debate templates and synthesis. Use when orchestrating multi-round debates between AI tools, 'debate topic', 'argue about', 'stress test idea', 'devil advocate'."
version: 5.1.0
argument-hint: "[topic] [--proposer=tool] [--challenger=tool] [--rounds=N] [--effort=level]"
---
# debate

用于在 AI 工具之间开展结构化多轮辩论的提示词模板、上下文组装规则和综合结论格式。

## 参数

从 `$ARGUMENTS` 解析：
- **topic**：辩论的问题/主题（必填）
- **--proposer**：担任提议方角色的工具（claude、gemini、codex、opencode、copilot）
- **--challenger**：担任质疑方角色的工具（必须与提议方不同）
- **--rounds**：来回辩论的轮数（1-5，默认值：2）
- **--effort**：应用于所有工具调用的思考强度（low、medium、high、max）
- **--model-proposer**：提议方使用的特定模型（可选）
- **--model-challenger**：质疑方使用的特定模型（可选）

## 通用规则

所有参与者（提议方和质疑方）都必须使用具体证据（文件路径、代码模式、基准测试或文档记载的行为）来支持其主张。任何一方提出的无依据主张都会被另一方指出，并记录在裁决中。此规则适用于每一轮。

## 提示词模板

### 第 1 轮：提议方开场陈述

```
You are participating in a structured debate as the PROPOSER.

Topic: {topic}

Your job: Analyze this topic thoroughly and present your position. Take a clear stance. Do not hedge excessively.

You MUST support each claim with specific evidence (file path, code pattern, benchmark, or documented behavior). Unsupported claims will be challenged. "I think" or "generally speaking" without evidence is not acceptable.

Provide your analysis:
```

### 第 1 轮：质疑方回应

```
You are participating in a structured debate as the CHALLENGER.

Topic: {topic}

The PROPOSER ({proposer_tool}) argued:

---
{proposer_round1_response}
---

Your job: Find weaknesses, blind spots, and flaws in the proposer's argument. You MUST identify at least one genuine flaw or overlooked consideration before agreeing on anything. Propose concrete alternatives where you disagree.

Rules:
- Do NOT say "great point" or validate the proposer's reasoning before critiquing it
- Lead with what's WRONG or MISSING, then acknowledge what's right
- If you genuinely agree on a point, explain what RISK remains despite the agreement
- Propose at least one concrete alternative approach
- You MUST address at least these categories: correctness, security implications, and developer experience
- Do NOT agree with ANY claim unless you can cite specific evidence (file path, code pattern, or documented behavior) that supports the agreement. Unsupported agreement is not allowed.
- If the proposer makes a claim without evidence, call it out: "This claim is unsupported."

Provide your challenge:
```

### 第 2 轮及以后：提议方答辩

```
You are the PROPOSER in round {round} of a structured debate.

Topic: {topic}

{context_summary}

The CHALLENGER ({challenger_tool}) raised these points in round {previous_round}:

---
{challenger_previous_response}
---

Your job: Address each challenge directly. For each point:
- If they're right, concede explicitly and explain how your position evolves
- If they're wrong, explain why with specific evidence (file path, code pattern, benchmark, or documented behavior)
- If it's a tradeoff, acknowledge the tradeoff and explain why you still favor your approach with evidence

Every claim you make -- whether concession, rebuttal, or new argument -- MUST cite specific evidence. The challenger will reject unsupported claims.

Do NOT simply restate your original position. Your response must show you engaged with the specific challenges raised.

Provide your defense:
```

### 第 2 轮及以后：挑战者跟进

```
You are the CHALLENGER in round {round} of a structured debate.

Topic: {topic}

{context_summary}

The PROPOSER ({proposer_tool}) responded to your challenges:

---
{proposer_previous_response}
---

IMPORTANT: Do NOT let the proposer reframe your challenges as agreements. If they say "we actually agree" but haven't addressed the substance, reject it. Default to suspicion, not acceptance.

Your job: Evaluate the proposer's defense. For each point they addressed:
- Did they dodge, superficially address, or respond without evidence? Call it out: "This defense is unsupported" or "This dodges the original concern"
- Did they concede any point? Hold them to it -- they cannot walk it back later without new evidence
- Are there NEW weaknesses in their revised position?
- Did they adequately address your concern with specific evidence? Only then acknowledge it, and cite what convinced you

You MUST either identify at least one new weakness or unresolved concern, OR explicitly certify a previous concern as genuinely resolved with specific evidence for why you're now satisfied. "I'm convinced because [evidence]" is acceptable. "I agree now" without evidence is not.
If you see new problems, raise them.

Provide your follow-up:
```

## 上下文组装

### 第 1-2 轮：完整上下文

在提示词中包含此前所有交流的完整文本。上下文足够小（总计通常少于 5000 个 token）。

上下文块格式：
```
Previous exchanges:

Round 1 - Proposer ({proposer_tool}):
{full response}

Round 1 - Challenger ({challenger_tool}):
{full response}
```

### 第 3 轮及以后：上下文摘要

从第 3 轮开始，将第 1 轮至第 N-2 轮的完整交流文本替换为摘要。仅完整包含最近一轮的回复。

格式：
```
Summary of rounds 1-{N-2}:
{summary of key positions, agreements, and open disagreements}

Round {N-1} - Proposer ({proposer_tool}):
{full response}

Round {N-1} - Challenger ({challenger_tool}):
{full response}
```

编排器智能体（opus）负责生成摘要。目标长度：500-800 个 token。必须保留：
- 双方各自的核心立场
- 所有让步（逐字引用，不得转述）
- 支撑共识的所有证据引用
- 分歧点（尚未解决）
- 各轮之间的任何矛盾（例如，提议者在第 1 轮让步，但在第 2 轮反悔——需明确注明两者）

## 综合输出格式

所有轮次结束后，编排器生成以下结构化输出：

```
## Debate Summary

**Topic**: {topic}
**Proposer**: {proposer_tool} ({proposer_model})
**Challenger**: {challenger_tool} ({challenger_model})
**Rounds**: {rounds_completed}
**Rigor**: Structured perspective comparison (prompt-enforced adversarial rules, no deterministic verification)

### Verdict

{winner_tool} had the stronger argument because: {specific reasoning citing debate evidence}

### Debate Quality

Rate the debate on these dimensions:
- **Genuine disagreement**: Did the challenger maintain independent positions, or converge toward the proposer? (high/medium/low)
- **Evidence quality**: Did both sides cite specific examples, or argue from generalities? (high/medium/low)
- **Challenge depth**: Were the challenges substantive, or surface-level? (high/medium/low)

### Key Agreements
- {agreed point 1} (evidence: {what supports this agreement})
- {agreed point 2} (evidence: {what supports this agreement})

### Key Disagreements
- {point}: {proposer_tool} argues {X}, {challenger_tool} argues {Y}

### Unresolved Questions
- {question that neither side adequately addressed}

### Recommendation
{Orchestrator's recommendation - must pick a direction, not "both have merit"}
```

**综合规则：**
- 裁决必须明确选择一方。不接受“双方的方法各有优点”这样的结论。
- 引用辩论中的具体论点作为裁决依据。
- 建议必须具有可操作性——用户基于这场辩论应该采取什么行动。
- 未解决的问题应突出辩论在哪些方面存在不足，而不是说明双方“同样有效”。

## 状态文件架构

保存到 `{AI_STATE_DIR}/debate/last-debate.json`：

```json
{
  "id": "debate-{ISO timestamp}-{4 char random hex}",
  "topic": "original topic text",
  "proposer": {"tool": "claude", "model": "opus"},
  "challenger": {"tool": "gemini", "model": "gemini-3.1-pro-preview"},
  "effort": "high",
  "rounds_completed": 2,
  "max_rounds": 2,
  "status": "completed",
  "exchanges": [
    {"round": 1, "role": "proposer", "tool": "claude", "response": "...", "duration_ms": 8500},
    {"round": 1, "role": "challenger", "tool": "gemini", "response": "...", "duration_ms": 12000},
    {"round": 2, "role": "proposer", "tool": "claude", "response": "...", "duration_ms": 9200},
    {"round": 2, "role": "challenger", "tool": "gemini", "response": "...", "duration_ms": 11000}
  ],
  "verdict": {
    "winner": "claude",
    "reasoning": "...",
    "agreements": ["..."],
    "disagreements": ["..."],
    "recommendation": "..."
  },
  "timestamp": "{ISO 8601 timestamp}"
}
```

平台状态目录：
- Claude Code：`.claude/`
- OpenCode：`.opencode/`
- Codex CLI：`.codex/`

## 错误处理

| 错误 | 操作 |
|-------|--------|
| 提议方在第 1 轮失败 | 中止辩论。没有开场立场便无法继续。 |
| 质疑方在第 1 轮失败 | 显示提议方的立场，并附注：“[WARN] 质疑方失败。正在显示提议方未经质疑的立场。” |
| 任何工具在辩论过程中失败 | 根据已完成的轮次进行综合。在输出中注明未完成的轮次。 |
| 工具调用超时（>240s） | 第 1 轮提议方：中止。第 1 轮质疑方：以未经质疑的方式继续。第 2 轮及以后：根据已完成的轮次进行综合，并附上超时说明。 |
| Consult 结果信封指示失败（status/exit/error/empty output） | 将其视为该角色在该轮次的工具失败，并应用上述相同的角色和轮次策略。 |
| 成功获取信封后结构化解析失败 | 将其视为该角色在该轮次的工具失败，仅包含经过净化的解析元数据（`PARSE_ERROR:<type>:<code>`，隐去密钥、移除控制字符、最多 200 个字符），然后应用上述相同的角色和轮次策略。 |
| 所有轮次均超时 | “[ERROR] 辩论失败：所有工具调用均已超时。” |
| 未记录任何成功的交锋（非超时） | “[ERROR] 辩论失败：未记录任何成功的交锋。” |

## 外部工具快速参考

> 规范来源：`plugins/consult/skills/consult/SKILL.md`。使用这些模板直接构建并执行 CLI 命令。不要通过 `Skill: consult` 调用——在 Claude Code 中，这会加载交互式命令包装器并导致递归循环。先将问题写入 `{AI_STATE_DIR}/consult/question.tmp`，然后通过 Bash 执行命令。

### 安全命令模式

| 提供商 | 安全命令模式 |
|----------|---------------------|
| Claude | `claude -p - --output-format json --model "MODEL" --max-turns TURNS --allowedTools "Read,Glob,Grep" < "{AI_STATE_DIR}/consult/question.tmp"` |
| Gemini | `gemini -p - --output-format json -m "MODEL" < "{AI_STATE_DIR}/consult/question.tmp"` |
| Codex | `codex exec "$(cat "{AI_STATE_DIR}/consult/question.tmp")" --json -m "MODEL" -c model_reasoning_effort="LEVEL"` |
| OpenCode | `opencode run - --format json --model "MODEL" --variant "VARIANT" < "{AI_STATE_DIR}/consult/question.tmp"` |
| Copilot | `copilot -p - < "{AI_STATE_DIR}/consult/question.tmp"` |

### 工作量到模型的映射

| 工作量 | Claude | Gemini | Codex | OpenCode | Copilot |
|--------|--------|--------|-------|----------|---------|
| 低 | claude-haiku-4-5（1 轮） | gemini-3-flash-preview | gpt-5.3-codex（低） | 默认（低） | 无法控制 |
| 中 | claude-sonnet-4-6（3 轮） | gemini-3-flash-preview | gpt-5.3-codex（中） | 默认（中） | 无法控制 |
| 高 | claude-opus-4-6（5 轮） | gemini-3.1-pro-preview | gpt-5.3-codex（高） | 默认（高） | 无法控制 |
| 最大 | claude-opus-4-6（10 轮） | gemini-3.1-pro-preview | gpt-5.3-codex（高） | 默认 + --thinking | 无法控制 |

### 输出解析

| 提供商 | 解析表达式 |
|----------|-----------------|
| Claude | `JSON.parse(stdout).result` |
| Gemini | `JSON.parse(stdout).response` |
| Codex | `JSON.parse(stdout).message` 或原始文本 |
| OpenCode | 以换行符分隔的 JSON。对于 `type === "text"` 的事件，拼接其中的 `part.text`。会话 ID 来自 `event.sessionID`。 |
| Copilot | 原始 stdout 文本 |

解析规范：
1. 在进行任何解析之前，先评估执行状态（超时/非零退出/错误/空输出）。
2. 仅在执行状态成功时进行解析。
3. 如果解析失败，只呈现经过清理的解析元数据（绝不包含原始 stdout/stderr 片段），并应用角色/轮次失败策略，而不是挂起或静默继续。

### ACP 传输命令

> 当提供商支持 ACP 时，它可作为一种替代传输方式。直接构建并执行 CLI 命令——不要使用 `Skill: consult`（这会在 Claude Code 中导致递归循环）。

| 提供商 | ACP 命令模式 |
|----------|-------------------|
| Claude | `node acp/run.js --provider="claude" --question-file="{AI_STATE_DIR}/consult/question.tmp" --timeout=240000 --model="MODEL"` |
| Gemini | `node acp/run.js --provider="gemini" --question-file="{AI_STATE_DIR}/consult/question.tmp" --timeout=240000 --model="MODEL"` |
| Codex | `node acp/run.js --provider="codex" --question-file="{AI_STATE_DIR}/consult/question.tmp" --timeout=240000 --model="MODEL"` |
| OpenCode | `node acp/run.js --provider="opencode" --question-file="{AI_STATE_DIR}/consult/question.tmp" --timeout=240000 --model="MODEL"` |
| Copilot | `node acp/run.js --provider="copilot" --question-file="{AI_STATE_DIR}/consult/question.tmp" --timeout=240000` |
| Kiro | `node acp/run.js --provider="kiro" --question-file="{AI_STATE_DIR}/consult/question.tmp" --timeout=240000` |

请注意，辩论轮次的超时时间为 240000ms（240s），而咨询的超时时间为 120000ms（120s）。

**Kiro**：仅支持 ACP 的提供程序。不支持 CLI 模式。当 `kiro-cli` 位于 PATH 中时可用。

### ACP 输出解析

ACP 传输的输出解析方式与 CLI 传输完全相同——ACP 运行器（`acp/run.js`）会将响应规范化为相同的 JSON 信封格式。信封中的 `transport` 字段用于指示 `"acp"` 或 `"cli"`。