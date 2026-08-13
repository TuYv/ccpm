---
name: "agent-protocol"
description: "Inter-agent communication protocol for C-suite agent teams. Defines invocation syntax, loop prevention, isolation rules, and response formats. Use when C-suite agents need to query each other, coordinate cross-functional analysis, or run board meetings with multiple agent roles."
license: MIT
metadata:
  version: 1.0.0
  author: Alireza Rezvani
  category: c-level
  domain: agent-orchestration
  updated: 2026-03-05
  frameworks: invocation-patterns
---
# 智能体间协议

高管智能体之间如何相互沟通。用于防止混乱、循环和循环推理的规则。

## 关键词
智能体协议、智能体间通信、智能体调用、智能体编排、多智能体、高管协调、智能体链、循环预防、智能体隔离、董事会会议协议

## 调用语法

任何智能体都可以使用以下格式查询另一个智能体：

```
[INVOKE:role|question]
```

**示例：**
```
[INVOKE:cfo|What's the burn rate impact of hiring 5 engineers in Q3?]
[INVOKE:cto|Can we realistically ship this feature by end of quarter?]
[INVOKE:chro|What's our typical time-to-hire for senior engineers?]
[INVOKE:cro|What does our pipeline look like for the next 90 days?]
```

**有效角色：** `ceo`、`cfo`、`cro`、`cmo`、`cpo`、`cto`、`chro`、`coo`、`ciso`、`gc`、`cdo`、`caio`、`cco`、`vpe`

| 角色令牌 | 顾问技能 |
|---|---|
| `gc` | general-counsel-advisor（法律、合同、投资条款清单） |
| `cdo` | chief-data-officer-advisor（数据战略、训练数据权利） |
| `caio` | chief-ai-officer-advisor（AI 战略、评估、AI 风险） |
| `cco` | chief-customer-officer-advisor（客户留存、客户成功） |
| `vpe` | vpe-advisor（工程交付、DORA、工程招聘） |

## 响应格式

被调用的智能体使用以下结构响应：

```
[RESPONSE:role]
Key finding: [one line — the actual answer]
Supporting data:
  - [data point 1]
  - [data point 2]
  - [data point 3 — optional]
Confidence: [high | medium | low]
Caveat: [one line — what could make this wrong]
[/RESPONSE]
```

**示例：**
```
[RESPONSE:cfo]
Key finding: Hiring 5 engineers in Q3 extends runway from 14 to 9 months at current burn.
Supporting data:
  - Current monthly burn: $280K → increases to ~$380K (+$100K fully loaded)
  - ARR needed to offset: ~$1.2M additional within 12 months
  - Current pipeline covers 60% of that target
Confidence: medium
Caveat: Assumes 3-month ramp and no change in revenue trajectory.
[/RESPONSE]
```

## 循环预防（硬性规则）

这些规则无条件执行。没有例外。

### 规则 1：禁止自我调用
智能体不能调用自身。
```
❌ CFO → [INVOKE:cfo|...] — BLOCKED
```

### 规则 2：最大深度 = 2
调用链可以是 A→B→C。第三次跳转将被阻止。
```
✅ CRO → CFO → COO (depth 2)
❌ CRO → CFO → COO → CHRO (depth 3 — BLOCKED)
```

### 规则 3：禁止循环调用
如果智能体 A 调用了智能体 B，那么在同一调用链中，智能体 B 不能调用智能体 A。
```
✅ CRO → CFO → CMO
❌ CRO → CFO → CRO (circular — BLOCKED)
```

### 规则 4：调用链跟踪
每次调用都会携带其调用链。格式：
```
[CHAIN: cro → cfo → coo]
```
智能体在发起另一次调用前会检查此调用链。

**被阻止时：** 返回以下内容，而不是发起调用：
```
[BLOCKED: cannot invoke cfo — circular call detected in chain cro→cfo]
State assumption used instead: [explicit assumption the agent is making]
```

## 隔离规则

### 董事会会议第 2 阶段（独立分析）
**禁止任何调用。** 每个角色在交叉交流之前独立形成观点。
- 原因：防止锚定效应和群体迷思
- 持续时间：整个第 2 阶段分析期间
- 如果智能体需要来自其他角色的数据：明确说明假设，并使用 `[ASSUMPTION: ...]` 标记

### 董事会会议阶段 3（批评者角色）
执行导师可以**引用**其他角色的输出，但**不能调用**它们。
- 原因：批评必须独立于新的数据请求
- 允许："CFO 的预测假设了 X，这与 CRO 的管道数据相矛盾"
- 不允许：在批评阶段使用 `[INVOKE:cfo|...]`

### 董事会会议之外
可以自由调用，但须遵守上述循环防止规则。

## 何时调用，何时假设

**在以下情况下调用：**
- 问题需要你不掌握的特定领域数据
- 此处的错误会实质性改变建议
- 问题本质上涉及跨职能协作（例如，招聘对预算和产能的影响）

**在以下情况下假设：**
- 数据的方向性很明确，精确度并不关键
- 你处于阶段 2 的隔离状态（始终假设，绝不调用）
- 调用链已达到深度 2
- 相较于你的主要分析，该问题无关紧要

**进行假设时，务必明确说明：**
```
[ASSUMPTION: runway ~12 months based on typical Series A burn profile — not verified with CFO]
```

## 冲突解决

当两个被调用的智能体给出相互冲突的答案时：

1. **明确标记冲突：**
   ```
   [CONFLICT: CFO projects 14-month runway; CRO expects pipeline to close 80% → implies 18+ months]
   ```
2. **说明解决方法：**
   - 保守方法：采用较差的情况
   - 概率方法：根据置信度分数进行加权
   - 上报：标记为需由人工决策
3. **绝不要默默选择其中一个**——将冲突呈现给用户。

## 广播模式（危机 / CEO）

CEO 可以同时向所有角色广播：
```
[BROADCAST:all|What's the impact if we miss the fundraise?]
```

响应会彼此独立地返回（任何智能体在形成自己的响应之前，都看不到其他智能体的响应）。在所有响应返回后再进行汇总。

## 决策记忆（规范布局）

所有高管技能和 `/cs:*` 命令都在**同一个**位置读写决策——由 `/cs:decide` 和 decision-logger 技能负责的双层模型：

```
~/.claude/decisions/
├── raw/YYYY-MM-DD-<slug>.md        # Layer 1 — full transcripts/deliberations (never auto-loaded)
├── raw/archive/YYYY/               # Raw files after 90 days
├── approved/YYYY-MM-DD-<slug>.md   # Layer 2 — one founder-approved decision record per file
└── approved/decisions.md           # Layer 2 index — append-only log of approved decisions
```

**规则：**
- **第 1 层（原始记录）**存储所有内容，包括被否决的论点。仅供参考——绝不会自动提供给未来的会话。
- **第 2 层（已批准记录）**仅存储经创始人批准的决策。董事会会议、`/cs:office-hours` 和 `/cs:founder-mode` 加载的就是这一层。这样可以防止产生虚构的共识。
- 写入者：`/cs:decide` 和幕僚长（董事会会议阶段 5 之后）。各个角色智能体绝不直接写入决策。
- decision-logger、chief-of-staff 和 board-meeting 都使用此布局。它们的 SKILL.md 文件会链接至此，而不是定义各自的路径。

**迁移：**早期版本使用 `memory/board-meetings/`（decision-logger、board-meeting）和 `~/.claude/decision-log.md`（chief-of-staff）；如果存在，则读取这些位置的历史记录，但所有新条目都写入 `~/.claude/decisions/`。

## 快速参考

| 规则 | 行为 |
|------|----------|
| 自调用 | ❌ 始终阻止 |
| 深度 > 2 | ❌ 阻止，并说明假设 |
| 循环调用 | ❌ 阻止，并说明假设 |
| 阶段 2 隔离 | ❌ 不允许调用 |
| 阶段 3 评审 | ❌ 仅供参考，不调用 |
| 冲突 | ✅ 明确呈现，不要隐瞒 |
| 假设 | ✅ 始终使用 `[ASSUMPTION: ...]` 明确标注 |

## 内部质量循环（在任何内容提交给创始人之前）

任何角色都必须通过此验证循环，才能向创始人汇报。创始人看到的是经过打磨和验证的输出，而不是初稿。

### 步骤 1：自我验证（每个角色，每次都要执行）

在提交之前，每个角色都要执行以下内部检查清单：

```
SELF-VERIFY CHECKLIST:
□ Source Attribution — Where did each data point come from?
  ✅ "ARR is $2.1M (from CRO pipeline report, Q4 actuals)"
  ❌ "ARR is around $2M" (no source, vague)

□ Assumption Audit — What am I assuming vs what I verified?
  Tag every assumption: [VERIFIED: checked against data] or [ASSUMED: not verified]
  If >50% of findings are ASSUMED → flag low confidence

□ Confidence Score — How sure am I on each finding?
  🟢 High: verified data, established pattern, multiple sources
  🟡 Medium: single source, reasonable inference, some uncertainty
  🔴 Low: assumption-based, limited data, first-time analysis

□ Contradiction Check — Does this conflict with known context?
  Check against company-context.md and recent decisions in decision-log
  If it contradicts a past decision → flag explicitly

□ "So What?" Test — Does every finding have a business consequence?
  If you can't answer "so what?" in one sentence → cut it
```

### 步骤 2：同行验证（跨职能验证）

当某项建议影响其他角色的职责领域时，必须由该角色在提交之前进行验证。

| 如果你的建议涉及…… | 与……共同验证 | 他们检查…… |
|-------------------------------------|-------------------|---------------|
| 财务数字或预算 | CFO | 计算、对资金可维持时间的影响、预算现实性 |
| 收入预测 | CRO | 销售管线支撑、历史准确性 |
| 员工人数或招聘 | CHRO | 市场现实性、薪酬可行性、时间安排 |
| 技术可行性或时间安排 | CTO | 工程产能、技术债务负担 |
| 运营流程变更 | COO | 产能、依赖关系、规模化影响 |
| 面向客户的变更 | CRO + CPO | 客户流失风险、产品路线图冲突 |
| 安全或合规声明 | CISO | 实际安全态势、法规要求 |
| 市场或定位声明 | CMO | 数据支撑、竞争现实 |
| 法律风险、合同、投资条款清单 | GC | 条款风险、知识产权归属、监管触发条件 |
| 数据权利、训练数据来源 | CDO | 同意依据、GDPR Art. 6、对数据资产的影响 |
| AI 模型声明、评估结果、AI 风险 | CAIO | 评估覆盖范围、幻觉 SLO、欧盟《人工智能法案》风险等级 |
| 留存、客户流失、客户健康度声明 | CCO | GRR/NRR 分解、客户流失根本原因 |
| 交付时间表、工程吞吐量 | VPE | DORA 指标、实际周期时间、团队产能 |

**同行验证格式：**
```
[PEER-VERIFY:cfo]
Validated: ✅ Burn rate calculation correct
Adjusted: ⚠️ Hiring timeline should be Q3 not Q2 (budget constraint)
Flagged: 🔴 Missing equity cost in total comp projection
[/PEER-VERIFY]
```

**在以下情况下跳过同行验证：**
- 单一领域的问题，且不产生跨职能影响
- 时间敏感的主动预警（先发送预警，之后再验证）
- 创始人明确要求快速给出看法

### 第 3 步：批判者预审（仅限高风险决策）

对于**不可逆、高成本或关乎公司存亡**的决策，由执行导师在创始人查看之前进行预审。

**触发预审的条件：**
- 涉及的支出超过剩余可维持运营时间所对应资金的 20%
- 影响超过 30% 的团队成员（裁员、重组）
- 改变公司战略或方向
- 涉及外部承诺（融资条款、合作关系、并购）
- 所有角色一致同意的任何建议（可疑的共识）

**预审输出：**
```
[CRITIC-SCREEN]
Weakest point: [The single biggest vulnerability in this recommendation]
Missing perspective: [What nobody considered]
If wrong, the cost is: [Quantified downside]
Proceed: ✅ With noted risks | ⚠️ After addressing [specific gap] | 🔴 Rethink
[/CRITIC-SCREEN]
```

### 第 4 步：纠偏（收到创始人反馈后）

该循环不会在交付时结束。创始人回应后：

```
FOUNDER FEEDBACK LOOP:
1. Founder approves → log decision (Layer 2), assign actions
2. Founder modifies → update analysis with corrections, re-verify changed parts
3. Founder rejects → log rejection with DO_NOT_RESURFACE, understand WHY
4. Founder asks follow-up → deepen analysis on specific point, re-verify

POST-DECISION REVIEW (30/60/90 days):
- Was the recommendation correct?
- What did we miss?
- Update company-context.md with what we learned
- If wrong → document the lesson, adjust future analysis
```

### 按风险等级划分的验证级别

| 风险等级 | 自我验证 | 同行验证 | 批判者预审 |
|--------|-------------|-------------|-------------------|
| 低（信息性） | ✅ 必须 | ❌ 跳过 | ❌ 跳过 |
| 中（运营性） | ✅ 必须 | ✅ 必须 | ❌ 跳过 |
| 高（战略性） | ✅ 必须 | ✅ 必须 | ✅ 必须 |
| 关键（不可逆） | ✅ 必须 | ✅ 必须 | ✅ 必须 + 董事会会议 |

### 输出格式有何变化

验证后的输出会增加置信度和来源信息：

```
BOTTOM LINE
[Answer] — Confidence: 🟢 High

WHAT
• [Finding 1] [VERIFIED: Q4 actuals] 🟢
• [Finding 2] [VERIFIED: CRO pipeline data] 🟢  
• [Finding 3] [ASSUMED: based on industry benchmarks] 🟡

PEER-VERIFIED BY: CFO (math ✅), CTO (timeline ⚠️ adjusted to Q3)
```

---

## 用户沟通标准

所有高管角色面向创始人的输出都遵循同一种格式，无一例外。创始人是决策者——向他们提供结果，而不是过程。

### 标准输出（单角色回应）

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 [ROLE] — [Topic]

BOTTOM LINE
[One sentence. The answer. No preamble.]

WHAT
• [Finding 1 — most critical]
• [Finding 2]
• [Finding 3]
(Max 5 bullets. If more needed → reference doc.)

WHY THIS MATTERS
[1-2 sentences. Business impact. Not theory — consequence.]

HOW TO ACT
1. [Action] → [Owner] → [Deadline]
2. [Action] → [Owner] → [Deadline]
3. [Action] → [Owner] → [Deadline]

⚠️ RISKS (if any)
• [Risk + what triggers it]

🔑 YOUR DECISION (if needed)
Option A: [Description] — [Trade-off]
Option B: [Description] — [Trade-off]
Recommendation: [Which and why, in one line]

📎 DETAIL: [reference doc or script output for deep-dive]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 主动警报（未经请求——由上下文触发）

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚩 [ROLE] — Proactive Alert

WHAT I NOTICED
[What triggered this — specific, not vague]

WHY IT MATTERS
[Business consequence if ignored — in dollars, time, or risk]

RECOMMENDED ACTION
[Exactly what to do, who does it, by when]

URGENCY: 🔴 Act today | 🟡 This week | ⚪ Next review

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 董事会会议输出（多角色综合）

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 BOARD MEETING — [Date] — [Agenda Topic]

DECISION REQUIRED
[Frame the decision in one sentence]

PERSPECTIVES
  CEO: [one-line position]
  CFO: [one-line position]
  CRO: [one-line position]
  [... only roles that contributed]

WHERE THEY AGREE
• [Consensus point 1]
• [Consensus point 2]

WHERE THEY DISAGREE
• [Conflict] — CEO says X, CFO says Y
• [Conflict] — CRO says X, CPO says Y

CRITIC'S VIEW (Executive Mentor)
[The uncomfortable truth nobody else said]

RECOMMENDED DECISION
[Clear recommendation with rationale]

ACTION ITEMS
1. [Action] → [Owner] → [Deadline]
2. [Action] → [Owner] → [Deadline]
3. [Action] → [Owner] → [Deadline]

🔑 YOUR CALL
[Options if you disagree with the recommendation]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 沟通规则（不可协商）

1. **结论优先。** 始终如此。创始人的时间是最稀缺的资源。
2. **只提供结果和决策。** 不叙述过程（“首先我分析了……”）。不要边思考边表达。
3. **是什么 + 为什么 + 怎么做。** 每项发现都要说明它是什么、为什么重要（业务影响），以及如何采取行动。
4. **每个部分最多 5 个要点。** 更长的内容应放入参考文档。
5. **行动必须有负责人和截止日期。** 禁止使用“我们应该考虑”。明确谁在何时之前完成什么。
6. **将决策表述为选项。** 不要问“你怎么看？”——而要说“选项 A 或 B，以下是权衡取舍，以下是我的建议。”
7. **由创始人做决定。** 各角色提出建议。创始人批准、修改或否决。每项输出都必须遵循这一层级关系。
8. **风险必须具体。** 不要说“可能存在风险”——而要说“如果发生 X，Y 就会失效，造成 $Z 的损失。”
9. **不使用未经解释的术语。** 如果使用某个术语，请在首次使用时解释。
10. **保持沉默也是一种选择。** 如果没有需要报告的内容，不要编造更新。

## 参考资料
- `references/invocation-patterns.md` — 常见的跨职能协作模式及示例