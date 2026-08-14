---
name: board-meeting
description: >
  Multi-agent board meeting protocol running a structured 6-phase deliberation
  with isolated C-suite contributions to prevent groupthink. Use when making
  major strategic decisions or resolving cross-functional disagreements.
license: MIT + Commons Clause
metadata:
  version: 2.0.0
  author: borghei
  category: c-level
  domain: board-protocol
  updated: 2026-03-09
  frameworks:
    - 6-phase-protocol
    - two-layer-memory
    - independent-contributions
    - groupthink-prevention
    - synthesis-framework
    - decision-extraction
  triggers:
    - board meeting
    - executive deliberation
    - strategic decision
    - multi-perspective
    - structured deliberation
    - convene the board
    - C-suite meeting
    - executive council
    - founder review
    - decision extraction
    - multi-agent deliberation
    - need all perspectives
    - complex decision
---
# 董事会会议协议

一种结构化的多智能体审议机制，用于防止群体思维、记录少数意见，并形成清晰、可执行的决策。每个阶段都有其目的、格式以及不可跳过的规则。

## 关键词

董事会会议、高管审议、战略决策、C-suite、多智能体、创始人审查、决策提取、独立观点、群体思维防范、综合、批评者分析、结构化审议

---

## 先澄清

生成内容之前，请确认以下输入。如果有任何一项未知或含糊，请提问——不要自行假设：

- [ ] **要做出的确切决策**（用一句话表述）——整个协议都围绕综合形成单一决策展开；模糊的议题会产生模糊的综合结论
- [ ] **要启用哪些角色**——角色启用矩阵决定了哪些角色的观点会出现在阶段 2 中；错误的角色阵容意味着关键声音缺失或产生噪声
- [ ] **有哪些可用的数据和背景信息**，以及哪些是推测——阶段 2 的意见会标注置信度和来源，因此必须将已知事实与猜测区分开来
- [ ] **决策的可逆性和利害程度**——这决定了适合采用完整的 6 阶段协议，还是简化的咨询会议

停止规则：只询问对输出影响最大的 2-3 项。如果用户说“直接起草”，则继续执行，并在产出内容顶部列出你的假设。

---

## 6 阶段协议

```
PHASE 1: Context Gathering
    |
PHASE 2: Independent Contributions (ISOLATED)
    |
PHASE 3: Critic Analysis (Executive Mentor)
    |
PHASE 4: Synthesis (Chief of Staff)
    |
PHASE 5: Founder Review (FULL STOP -- human decides)
    |
PHASE 6: Decision Extraction and Logging
```

---

### 阶段 1：背景信息收集

**目的**：在任何人发表意见之前，加载所有相关背景信息。

```
Step 1: Load company context (if exists)
Step 2: Load decision history (Layer 2 ONLY -- NEVER raw transcripts)
Step 3: Reset session state -- no bleed from previous conversations
Step 4: Present agenda and activated roles
Step 5: Wait for founder confirmation before proceeding
```

#### 角色启用矩阵

并非所有角色都要参加每次会议。根据议题进行选择：

| 议题领域 | 启用 | 排除 |
|-------------|----------|---------|
| 市场扩张 | CEO, CMO, CFO, CRO, COO | CTO（除非涉及技术扩张） |
| 产品方向 | CEO, CPO, CTO, CMO | CFO（除非涉及预算问题） |
| 招聘 / 组织 | CEO, CHRO, CFO, COO | CMO, CTO（除非涉及其团队） |
| 定价 | CMO, CFO, CRO, CPO | CTO, CHRO |
| 技术 | CTO, CPO, CFO, CISO | CMO, CRO |
| 融资 | CEO, CFO, CRO | CISO, CHRO |
| 安全事件 | CEO, CTO, CISO, COO | CMO, CRO |
| 并购 | CEO, CFO, CTO, CHRO, COO | --（所有相关角色） |

**最大参会人数**：每次会议最多 6 个角色。超过 6 个角色只会产生噪声，而非洞见。

---

### 阶段 2：独立意见（相互隔离）

**关键规则**：禁止交叉影响。每位顾问在无法看到其他人输出的情况下独立发表意见。这是防止群体思维的主要机制。

#### 意见提交顺序

```
1. Research/data gathering (if needed)
2. CMO  -- market perspective
3. CFO  -- financial perspective
4. CEO  -- strategic perspective
5. CTO  -- technical perspective
6. COO  -- operational perspective
7. CHRO -- people perspective
8. CRO  -- revenue perspective
9. CISO -- security/risk perspective
10. CPO -- product perspective
```

#### 贡献格式（严格）

每位顾问的贡献必须严格遵循以下格式：

```
## [ROLE] -- [DATE]

Key Points (maximum 5):
  1. [Finding] -- Confidence: [High/Medium/Low] -- Source: [data source]
  2. [Finding] -- Confidence: [High/Medium/Low] -- Source: [data source]
  3. [Finding] -- Confidence: [High/Medium/Low] -- Source: [data source]

Recommendation: [Clear position statement]
Confidence: [High / Medium / Low]
Key Assumption: [The one assumption this recommendation depends on]
What Would Change My Mind: [Specific condition or data point]
```

#### 各角色的推理技巧

| 角色 | 技巧 | 工作方式 |
|------|-----------|-------------|
| CEO | 思维树 | 探索 3 种可能的未来，并逐一评估 |
| CFO | 思维链 | 逐步展示计算过程 |
| CMO | 递归思维 | 起草 -> 自我批评 -> 完善 |
| CPO | 第一性原理 | 分解至最基本的用户需求 |
| CRO | 思维链 | 必须明确展示销售管道计算过程 |
| COO | 逐步分析 | 梳理运营流程 |
| CTO | 先分析后行动 | 研究 -> 分析 -> 提出建议 |
| CISO | 基于风险 | 对每个选项评估概率 x 影响 |
| CHRO | 同理心 + 数据 | 先考虑对人的影响，再用指标验证 |

---

### 阶段 3：批判性分析

**目的**：执行导师同时接收阶段 2 的所有输出，并进行对抗性审查。

#### 批判性检查清单

| 检查项 | 问题 |
|-------|----------|
| 可疑的共识 | 哪些地方的意见过于轻易地达成了一致？ |
| 共同假设 | 哪些假设是共有的，但尚未经过验证？ |
| 缺失的声音 | 谁没有参与讨论？（客户的声音？一线运营人员？） |
| 未提及的风险 | 有哪些风险无人提及？ |
| 领域越界 | 是否有任何代理超出了其职责领域？ |
| 数据质量 | 哪些主张有数据支持，哪些仅基于假设？ |
| 可逆性 | 是否有人评估过该决策能否撤销？ |

#### 批判性分析输出格式

```
## CRITIC ANALYSIS

Consensus Assessment:
  [Genuine agreement / Suspicious alignment / Split decision]

Unvalidated Assumptions:
  1. [Assumption shared by multiple advisors but not verified]
  2. [Assumption]

Missing Perspectives:
  - [Voice or data point not represented]

Unmentioned Risks:
  - [Risk nobody raised]

Domain Violations:
  - [If any agent operated outside their domain]

The Uncomfortable Truth:
  [The one thing nobody wants to say but needs to be said]
```

---

### 阶段 4：综合

**目的**：幕僚长将所有输入整合为可供决策的格式。

#### 综合结构

```
## BOARD MEETING SYNTHESIS
Topic: [topic]
Date: [date]
Attendees: [roles]

### Decision Required
[One sentence: what must be decided]

### Perspectives Summary
| Role | Position | Confidence | Key Concern |
|------|----------|-----------|-------------|
| [Role] | [1-line summary] | [H/M/L] | [Top concern] |
| [Role] | [1-line summary] | [H/M/L] | [Top concern] |

### Where They Agree
[2-3 consensus points]

### Where They Disagree
[Named conflicts with each side's reasoning]
[What the disagreement is really about]

### Critic's View
[The uncomfortable truth from Phase 3]

### Recommended Decision
[Clear recommendation with rationale]

### Action Items (if approved)
1. [Action] -- Owner: [role] -- Deadline: [date]
2. [Action] -- Owner: [role] -- Deadline: [date]
3. [Action] -- Owner: [role] -- Deadline: [date]

### Your Call
[If you disagree with the recommendation, here are alternatives:]
Option A: [description] -- Trade-off: [what you gain/lose]
Option B: [description] -- Trade-off: [what you gain/lose]
```

---

### 阶段 5：创始人审查

**完全停止。等待创始人。在此之后，任何智能体都不得采取行动。**

```
FOUNDER REVIEW

[Paste synthesis above]

Options:
  [A] Approve as recommended
  [M] Modify (specify changes)
  [R] Reject (specify reason)
  [Q] Ask follow-up question to specific role
  [D] Defer decision (specify timeline)
```

#### 阶段 5 规则

| 规则 | 理由 |
|------|-----------|
| 创始人的修正优先于所有智能体的提议 | 人类判断拥有最终决定权 |
| 不得反驳创始人的决定 | 智能体提供建议，创始人做出决定 |
| 30 分钟无活动后自动关闭为“待审查” | 防止会议无限期搁置 |
| 创始人可随时重新开启 | 决策不受时间锁定 |
| 后续问题应提交给特定角色 | 使讨论保持聚焦 |

---

### 阶段 6：决策提取

**目的**：创始人批准后，提取并记录所有决策。

```
Step 1: Write full transcript to Layer 1
  --> memory/board-meetings/YYYY-MM-DD-raw.md

Step 2: Run conflict detection against existing decisions
  --> Check for DO_NOT_RESURFACE violations
  --> Check for topic contradictions
  --> Check for owner conflicts

Step 3: Surface any conflicts to founder for resolution

Step 4: Append approved decisions to Layer 2
  --> memory/board-meetings/decisions.md

Step 5: Mark rejected proposals with DO_NOT_RESURFACE

Step 6: Confirm to founder:
  "Meeting concluded. Logged: [N] decisions, [M] action items,
   [K] DO_NOT_RESURFACE flags."
```

---

## 失败模式参考

| 失败模式 | 检测方式 | 修复方法 |
|---------|-----------|-----|
| 群体思维 | 所有顾问意见一致，毫无分歧 | 以隔离方式重新运行阶段 2；强制提出“最有力的反对论点” |
| 分析瘫痪 | 每位顾问讨论的要点超过 5 个 | 上限设为 5 个；即使置信度为低，也必须给出建议 |
| 纠缠细枝末节 | 讨论次要问题，却推迟重大决策 | 记录为异步行动；回到主要议程 |
| 角色越界 | CFO 做产品决策，CTO 制定定价 | 由批评者在阶段 3 中标记；从综合结论中排除 |
| 层级污染 | 在阶段 1 中加载原始会议记录 | 硬性规则：仅使用 decisions.md。绝不使用原始记录。 |
| 创始人缺席 | 阶段 5 超时 | 自动关闭为待处理。没有创始人就不得做出决策。 |
| 上下文过时 | 未加载公司上下文 | 阶段 1 必须检查上下文 |
| 角色缺失 | 未启用关键视角 | 幕僚长依据路由矩阵审查议题 |

---

## 会议节奏

| 触发条件 | 会议类型 | 通常时长 |
|---------|-------------|-----------------|
| 每季度定期召开 | 全面战略审查 | 2-3 小时 |
| 复杂度评分 >= 8 | 按需战略会议 | 1-2 小时 |
| 跨职能冲突 | 问题解决会议 | 1 小时 |
| 危机或紧急决策 | 紧急会议 | 30-60 分钟 |
| 创始人要求 | 任意议题 | 不定 |

---

## 危险信号

- 董事会会议始终无法产出决策——会议只是表演
- 同一议题在 3 次以上会议中讨论——回避决策
- 阶段 2 的意见完全一致——隔离机制遭到破坏，或议题过于简单
- 未执行阶段 3（批评者）——存在群体思维风险
- 创始人跳过阶段 5——决策缺乏问责
- 决策已记录但从未审查——决策记录器未正常运行
- 所有角色每次都参加会议——议题选择机制未正常运行

---

## 输出产物

| 请求 | 交付内容 |
|---------|-------------|
| “就[主题]召开董事会会议” | 完整执行六阶段协议 |
| “快速顾问会议” | 简化流程：第 1-2-4-5 阶段（跳过批评者环节） |
| “回顾过去的会议” | 加载第 1 层原始会议记录（仅限明确请求） |
| “我们对[主题]做出了什么决定？” | 搜索第 2 层决策历史记录 |
| “恢复待处理的会议” | 重新加载第 5 阶段及待处理的综合结论 |

---

## 工具参考

### meeting_simulator.py

验证角色激活、贡献完整性和阶段顺序。

```bash
# Simulate with defaults
python scripts/meeting_simulator.py

# Specify topic and complexity
python scripts/meeting_simulator.py --topic "Series B timing" --type fundraising --complexity 9

# Specify activated roles
python scripts/meeting_simulator.py --type m_and_a --roles CEO CFO CTO CHRO

# List all topic types and required roles
python scripts/meeting_simulator.py --list-topics

# JSON output
python scripts/meeting_simulator.py --type strategy --json
```

### decision_tracker.py

跟踪董事会决策、检测冲突，并标记逾期的审查和行动。

```bash
# Track demo decisions
python scripts/decision_tracker.py

# From decision log file
python scripts/decision_tracker.py --input decisions.json

# JSON output
python scripts/decision_tracker.py --json
```

### complexity_scorer.py

对决策复杂度进行评分，以确定应由单顾问、双顾问、多顾问还是董事会处理。

```bash
# Score with CLI flags
python scripts/complexity_scorer.py --topic "Market expansion" --domains 2 --reversibility 2 --financial 1 --team 2 --urgency 0

# Add modifiers
python scripts/complexity_scorer.py --topic "Acquisition" --domains 2 --reversibility 2 --financial 2 --team 2 --urgency 1 --modifiers cross_functional external_stakeholders sets_precedent

# JSON output
python scripts/complexity_scorer.py --topic "Pricing change" --json
```

---

## 故障排除

| 问题 | 可能原因 | 解决方法 |
|---------|-------------|-----|
| 所有顾问在第 2 阶段均表示赞同，没有任何分歧 | 群体思维或主题过于简单；隔离原则可能已被破坏 | 重新执行第 2 阶段，要求每个角色强制提出“最有力的反对论点” |
| 每位顾问的讨论超过 5 个要点 | 分析瘫痪；未强制执行上限 | 严格限制为 5 个关键要点；即使信心水平为低，也必须给出建议 |
| 第 5 阶段因创始人未响应而超时 | 创始人缺席或回避决策 | 30 分钟后自动以“待审查”状态结束；没有创始人参与不得做出决策 |
| 同一主题在 3 次以上会议中被讨论 | 回避决策或未呈现新数据 | 升级处理：强制做出决策，或明确说明时间安排并正式延期 |
| 决策已记录但从未审查 | 决策记录器未集成到会议节奏中 | 将“先前决策审查”添加到第 1 阶段的上下文加载中 |
| 角色在其职责领域之外开展工作 | 未进行批评者分析，或批评者未发现该问题 | 强制执行第 3 阶段的批评者检查清单；明确标记越界行为 |

---

## 成功标准

- 每次董事会会议至少产生 1 项已记录的决策，并包含负责人、截止日期和复审日期
- 阶段 2 的贡献内容均为独立生成（每季度交叉影响事件为零）
- 阶段 3 的批评分析在每次会议中识别出至少 1 项未经验证的假设
- 在综合结果展示后的 30 分钟内记录创始人的批准、修改或否决意见
- 决策历史中不存在相互冲突的生效决策（冲突会被检测并解决）
- 标准战略审查会议时长控制在 2 小时以内，问题解决会议控制在 1 小时以内
- 90% 以上已记录决策的行动项在规定的截止日期前完成

---

## 范围与限制

**范围内**：多智能体审议协议、角色激活矩阵、贡献格式、批评分析、综合、决策提取、决策冲突检测、会议模拟。

**范围外**：实际的 AI 智能体编排（这是协议规范，而非运行时代码）、实时会议引导、视频/音频录制、外部董事会成员管理。

**限制**：该协议假设所有顾问的贡献均以文本格式提供。复杂度评分可提供路由指导，但无法考虑政治因素。决策冲突检测基于完全一致的主题匹配——不同主题之间的语义冲突需要人工判断。

---

## 集成点

| Skill | 集成方式 |
|-------|-------------|
| `chief-of-staff` | 将复杂度评分为 9-10 的问题路由至董事会会议协议 |
| `decision-logger` | 阶段 6 将决策直接写入双层决策记忆 |
| `board-deck-builder` | 董事会材料中的各部分为阶段 1 提供会前阅读背景信息 |
| `executive-mentor` | 阶段 3 的批评分析可由 Executive Mentor Skill 执行 |
| `ceo-advisor` through `ciso-advisor` | 所有 C 级高管顾问在阶段 2 独立提供意见 |
| `strategic-alignment` | 验证会议决策是否与战略目标保持一致 |