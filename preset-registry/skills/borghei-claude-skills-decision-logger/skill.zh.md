---
name: decision-logger
description: >
  Two-layer memory for executive decisions, separating raw deliberation from
  approved decisions to prevent hallucinated consensus. Use when logging
  decisions, reviewing past decisions, or checking overdue action items.
license: MIT + Commons Clause
metadata:
  version: 2.0.0
  author: borghei
  category: c-level
  domain: decision-memory
  updated: 2026-03-09
  frameworks:
    - two-layer-memory
    - conflict-detection
    - supersession-tracking
    - action-item-management
    - decision-search
  triggers:
    - decision log
    - log decision
    - past decisions
    - decision history
    - action items
    - overdue items
    - decision review
    - decision conflict
    - decision tracking
    - board minutes
    - approved decisions
    - decision search
    - what did we decide
    - reopen decision
---
# 决策日志

用于高管决策的双层记忆系统。第 1 层存储讨论过的所有内容。第 2 层只存储创始人批准的内容。未来会话只读取第 2 层——这可以防止过去讨论中虚构的共识渗入新的决策过程。

## 关键词

决策日志、记忆、已批准的决策、行动项、董事会会议纪要、冲突检测、DO_NOT_RESURFACE、决策历史、逾期、取代、决策搜索、决策跟踪、问责

---

## 双层架构

### 为什么需要两层？

单层决策日志会造成一个危险的问题：智能体读取过去的辩论、被否决的提案和已放弃的想法，然后将它们视为新决策的上下文。这会导致“虚构的共识”，即被否决的想法通过反复出现而逐渐被视为已接受。

双层系统通过严格分离原始讨论与已批准决策来防止这一问题。

### 分层架构

```
Layer 1: Raw Transcripts (NEVER auto-loaded)
  Location: memory/board-meetings/YYYY-MM-DD-raw.md
  Contains: Full deliberation, all perspectives, rejected arguments
  Loaded: Only on explicit founder request
  Retention: Active 90 days, then archived

Layer 2: Approved Decisions (AUTO-LOADED every session)
  Location: memory/board-meetings/decisions.md
  Contains: Only founder-approved decisions and action items
  Loaded: Automatically at start of every board meeting (Phase 1)
  Mutation: Append-only. Decisions are never deleted, only superseded.
```

### 层间交互规则

| 规则 | 理由 |
|------|-----------|
| 第 2 层仅允许追加 | 保留完整的决策历史 |
| 第 1 层从不自动加载 | 防止虚构的共识 |
| 只有幕僚长可以写入第 2 层 | 单一控制点 |
| 智能体绝不直接写入 | 所有写入操作都必须在创始人批准后通过幕僚长完成 |
| 被取代的决策仍保留在第 2 层 | 历史就是记录；任何内容都不会被删除 |

---

## 决策条目格式

### 标准决策记录

```markdown
## [YYYY-MM-DD] -- [DECISION TITLE]

**Decision:** [One clear statement of what was decided]
**Context:** [1-2 sentences on why this decision was needed]
**Owner:** [One person or role accountable for execution]
**Deadline:** [YYYY-MM-DD]
**Review Date:** [YYYY-MM-DD]
**Confidence:** [High / Medium / Low]
**Rationale:** [Why this option over alternatives, 1-2 sentences]

**User Override:** [If founder changed agent recommendation -- what and why]

**Rejected Alternatives:**
- [Proposal] -- [reason for rejection] [DO_NOT_RESURFACE]
- [Proposal] -- [reason for rejection]

**Action Items:**
- [ ] [Action] -- Owner: [name] -- Due: [YYYY-MM-DD]
- [ ] [Action] -- Owner: [name] -- Due: [YYYY-MM-DD]

**Dependencies:** [Other decisions this depends on]
**Supersedes:** [DATE of previous decision on same topic, if any]
**Superseded by:** [Filled retroactively if overridden later]
**Raw transcript:** memory/board-meetings/[DATE]-raw.md
**Tags:** [topic tags for search -- e.g., pricing, hiring, market-entry]
```

### 已完成行动项格式

```markdown
- [x] [Action] -- Owner: [name] -- Completed: [YYYY-MM-DD] -- Result: [one sentence]
```

---

## 冲突检测系统

在记录任何新决策之前，系统会检查三种类型的冲突。

### 冲突类型 1：违反 DO_NOT_RESURFACE

新决策与之前被否决的提案相匹配。

```
Detection: New proposal text similarity > 70% to a rejected proposal

Response:
  BLOCKED: "[Proposal]" was rejected on [DATE].
  Reason: [original rejection reason]

  To reopen: Founder must explicitly say "reopen [topic] from [DATE]"
  This cannot be overridden by agents.
```

### 冲突类型 2：主题矛盾

针对同一主题的两个有效决策得出了不同结论。

```
Detection: Same tags + contradictory conclusions

Response:
  DECISION CONFLICT DETECTED

  Active decision (older): [DATE] -- [decision text]
  New decision: [DATE] -- [decision text]

  These decisions contradict each other.

  Options:
  1. Supersede old decision (new replaces old)
  2. Merge decisions (reconcile the conflict)
  3. Defer to founder (present both, let founder choose)
```

### 冲突类型 3：负责人冲突

同一行动在不同决策中被分配给了不同人员。

```
Detection: Same action description, different owners

Response:
  OWNER CONFLICT

  Action: "[action text]"
  Decision 1 ([DATE]): Owner = [Person A]
  Decision 2 ([DATE]): Owner = [Person B]

  Resolve: Which owner is correct?
```

### 冲突解决决策树

```
START: Conflict detected
  |
  v
[What type of conflict?]
  |
  +-- DO_NOT_RESURFACE --> Block automatically. Only founder can reopen.
  |
  +-- Topic contradiction --> [Is the new decision from a board meeting?]
  |                           |
  |                           +-- YES --> Supersede old by default (board > individual)
  |                           +-- NO  --> Present both to founder for resolution
  |
  +-- Owner conflict --> [Which decision is more recent?]
                         |
                         +-- Flag to founder with both dates
                         +-- Default to more recent unless founder overrides
```

---

## 决策生命周期

### 状态

```
PROPOSED --> APPROVED --> ACTIVE --> [COMPLETED | SUPERSEDED | EXPIRED]

PROPOSED:    Agent synthesis presented to founder
APPROVED:    Founder explicitly approved
ACTIVE:      Being executed, action items in progress
COMPLETED:   All action items done, review confirmed success
SUPERSEDED:  New decision replaced this one
EXPIRED:     Review date passed without renewal
```

### 状态转换

| 起始状态 | 目标状态 | 触发条件 | 执行方 |
|------|----|---------|-----|
| 已提议 | 已批准 | 创始人说“是”或“批准” | 创始人 |
| 已提议 | 已拒绝 | 创始人说“不”或“拒绝” | 创始人 |
| 已批准 | 进行中 | 行动项开始执行 | 自动 |
| 进行中 | 已完成 | 所有行动项均被标记为完成 | 幕僚长 |
| 进行中 | 已取代 | 针对同一主题作出新决策 | 幕僚长 |
| 进行中 | 已过期 | 审查日期已过，且未续期 | 系统警报 |

---

## 首先澄清

在记录决策之前，请确认以下信息。如果任何一项未知或含糊，请询问——不要假设：

- [ ] **确切的决策陈述**（用一个清晰的句子说明决定了什么）——这是记录的核心；含糊的陈述会使日志无法用于未来的冲突检测
- [ ] **负责人和截止日期**——每条决策记录都需要一名唯一的责任人和一个日期，否则就无法跟踪，也无法在逾期时提示
- [ ] **被否决的替代方案及原因**——这些内容将成为 DO_NOT_RESURFACE 条目，防止被否决的想法重新进入未来的讨论
- [ ] **此决策是否取代同一主题下的先前决策**——这决定了如何针对现有日志进行冲突检测和取代关系跟踪

停止规则：只询问对输出影响最大的 2-3 项。如果用户说“直接起草即可”，则继续，并在产出内容顶部列出你的假设。

## 记录工作流

### 决策后记录（董事会会议第 5 阶段之后）

```
Step 1: Founder approves synthesis
  |
Step 2: Write Layer 1 raw transcript
  --> memory/board-meetings/YYYY-MM-DD-raw.md
  |
Step 3: Run conflict detection against decisions.md
  |
  +-- Conflicts found --> Surface to founder, wait for resolution
  +-- No conflicts --> Continue
  |
Step 4: Append approved entries to decisions.md (Layer 2)
  |
Step 5: Set review dates and action item deadlines
  |
Step 6: Confirm to founder:
  "Logged: [N] decisions, [M] action items tracked, [K] flags added"
```

---

## 行动项管理

### 逾期检测

在每次会话开始时，扫描以下内容：

1. 已超过截止日期的行动项
2. 复审日期已过的决策
3. 已超过 90 天但没有完成状态的决策

### 警报格式

```
OVERDUE ITEMS (as of [today's date])

Action Items Past Deadline:
  1. [Action] -- Owner: [name] -- Due: [date] -- [X] days overdue
     From decision: [decision title] ([date])

  2. [Action] -- Owner: [name] -- Due: [date] -- [X] days overdue

Decisions Pending Review:
  1. [Decision title] -- Review was due: [date]
     Original decision: [summary]
     Prompt: "You decided [X] on [date]. Worth a check-in?"

Stale Decisions (> 90 days, no status update):
  1. [Decision title] -- Decided: [date] -- Last update: [date]
```

### 行动项优先级矩阵

| 紧迫性 | 影响 | 优先级 | 响应 |
|---------|--------|----------|----------|
| 已逾期 | 高 | 紧急 | 立即上报给创始人 |
| 已逾期 | 低 | 高 | 在下次会话中标记 |
| 本周到期 | 高 | 高 | 主动提示 |
| 本周到期 | 低 | 中 | 纳入每周摘要 |
| 下个月到期 | 任意 | 低 | 仅监控 |

---

## 搜索与检索

### 搜索能力

| 查询类型 | 示例 | 返回结果 |
|-----------|---------|---------|
| 按主题 | "定价" | 所有带有定价标签的决策 |
| 按负责人 | "CTO" | 由 CTO 负责的所有决策和行动项 |
| 按日期范围 | "2025 年第 4 季度" | 2025 年 10 月至 12 月的所有决策 |
| 按状态 | "逾期" | 所有逾期行动项 |
| 按冲突 | "冲突" | 所有检测到的矛盾 |
| 按标签 | "招聘 AND 工程" | 标签的交集 |

### 决策摘要视图

| 视图 | 内容 | 使用场景 |
|------|----------|-----------|
| 最近 10 项 | 最近批准的 10 项决策 | 默认快速视图 |
| 完整历史记录 | 按时间顺序排列的所有决策 | 审计或深度审查 |
| 按负责人 | 按责任人分组 | 责任检查 |
| 按主题 | 按标签分组 | 战略审查 |
| 仅逾期项 | 仅显示逾期项目 | 行动管理 |
| 仅活跃项 | 仅显示存在未完成行动项的决策 | 执行跟踪 |

---

## 文件结构

```
memory/
  board-meetings/
    decisions.md           # Layer 2: append-only, founder-approved
    YYYY-MM-DD-raw.md      # Layer 1: full transcript per meeting
    archive/
      YYYY/                # Raw transcripts after 90 days
```

---

## 与其他 Skill 的集成

| Skill | 集成点 |
|-------|------------------|
| 幕僚长（`chief-of-staff`） | 管理记录工作流，写入第 2 层 |
| 董事会会议（`board-meeting`） | 在第 5 阶段批准后触发记录 |
| 战略一致性（`strategic-alignment`） | 检查决策是否正确落实到团队目标 |
| 高管导师（`executive-mentor`） | 审查陈旧决策，以便重新评估 |
| 组织健康度（`org-health-diagnostic`） | 将决策速度作为健康度指标 |

---

## 危险信号

- 同一主题讨论 3 次以上，却没有已记录的决策——回避决策
- 同一负责人的行动项持续逾期——产能或责任落实问题
- 未检查历史记录就做出决策——存在决策矛盾的风险
- 未经明确请求便加载第 1 层——存在虚构共识的风险
- 决策未设置审查日期——决策会在未经重新评估的情况下逐渐陈旧
- 被否决的提案换一种表述后再次出现——未执行 DO_NOT_RESURFACE
- 董事会会议开始时未查阅决策日志——未利用组织记忆
- 所有决策均由一人负责——存在瓶颈或授权失败

---

## 主动触发条件

- 决策的审查日期已过——提示：“你在 [date] 决定了 [X]。是否值得跟进一下？”
- 行动项逾期 > 7 天——结合负责人背景信息上报给创始人
- 同一主题领域存在 3 项以上活跃决策——需要进行整合审查
- 30 天以上没有记录任何决策——该系统是否仍在使用？
- 新提议的决策与 DO_NOT_RESURFACE 匹配——阻止并说明原因
- 6 个月以上的决策没有状态更新——标记为陈旧并提示审查

---

## 输出产物

| 请求 | 交付内容 |
|---------|-------------|
| “显示近期决策” | 最近批准的 10 项决策及其状态 |
| “哪些逾期了？” | 所有逾期行动项，包括负责人和逾期天数 |
| “搜索有关 [topic] 的决策” | 按主题/标签筛选的决策历史记录 |
| “记录此决策” | 包含所有字段的格式化决策条目 |
| “检查冲突” | 针对所有活跃决策执行冲突扫描 |
| “董事会决策摘要” | 决策速度、完成率和未完成项目 |

---

## 工具参考

### 1. decision_tracker.py

跟踪高管决策并进行完整的生命周期管理（Proposed > Approved > Active > Completed/Superseded/Expired）。扫描逾期行动项和陈旧决策，并生成状态摘要。

```bash
python scripts/decision_tracker.py --input decisions.json --json
python scripts/decision_tracker.py --input decisions.json
```

| 标志 | 类型 | 说明 |
|------|------|-------------|
| `--input` | 必需 | 包含决策记录（标题、状态、负责人、截止日期、行动项、标签）的 JSON 文件路径 |
| `--json` | 可选 | 以 JSON 格式而非人类可读文本输出 |

### 2. decision_quality_scorer.py

从 6 个维度评估决策质量：问题框定（问题定义）、备选方案（考虑过的选项）、信息（证据质量）、推理（逻辑健全性）、承诺（行动明确性）和元认知（对不确定性的认知）。生成改进建议。

```bash
python scripts/decision_quality_scorer.py --input decision_assessments.json --json
python scripts/decision_quality_scorer.py --input decision_assessments.json
```

| 标志 | 类型 | 说明 |
|------|------|-------------|
| `--input` | 必需 | 包含决策评估（各维度评分为 1-10，可选结果数据）的 JSON 文件路径 |
| `--json` | 可选 | 以 JSON 格式而非人类可读文本输出 |

### 3. decision_tree_builder.py

构建带有期望值分析的决策树。计算通过概率加权结果的最优路径，识别价值最高的决策，并针对关键假设生成敏感性分析。

```bash
python scripts/decision_tree_builder.py --input tree_data.json --json
python scripts/decision_tree_builder.py --input tree_data.json
```

| 标志 | 类型 | 说明 |
|------|------|-------------|
| `--input` | 必需 | 包含决策节点（选项、概率、结果、价值）的 JSON 文件路径 |
| `--json` | 可选 | 以 JSON 格式而非人类可读文本输出 |

---

## 故障排除

| 问题 | 可能原因 | 解决方案 |
|---------|-------------|------------|
| 同一主题讨论了 3 次以上，却没有记录决策 | 回避决策或没有明确的决策权限 | 在下次会议中强制做出决策；使用决策树构建器明确选项；明确指定决策负责人 |
| 同一负责人负责的行动项持续逾期 | 负责人承诺过多、能力不足或存在问责问题 | 审查负责人的工作量；如果是能力问题则重新分配；如果是问责问题则升级至创始人处理 |
| 做出决策时未检查历史记录 | 会议开始时未查阅决策日志；尚未形成整合使用的习惯 | 在董事会会议第 1 阶段自动加载决策日志；主动呈现相关的过往决策 |
| 被否决的提案换一种表述后再次出现 | 未执行 DO_NOT_RESURFACE；团队成员不了解之前的否决记录 | 在记录前强制执行冲突检测；阻止与已否决事项匹配的提案；要求创始人明确执行 "reopen" |
| 决策日志不断增长，却从未用于分析模式 | 日志被当作档案，而非战略工具 | 每季度开展决策审查；分析决策速度、完成率和质量趋势 |
| 所有决策都由一人负责 | 存在瓶颈或授权失败 | 分散决策责任；使用决策质量评分器评估集中决策是提升还是损害了质量 |
| 决策质量评分在 "alternatives" 维度偏低 | 团队锚定于第一个选项，而非探索其他方案 | 对超过特定阈值的决策要求至少提出 3 个备选方案；使用决策树构建器对选项建模 |

---

## 成功标准

- 所有董事会会议决策均在批准后 24 小时内记录到第 2 层
- 行动项在规定期限内的完成率超过 80%
- `DO_NOT_RESURFACE` 违规次数为零（被否决的提案不会重新进入决策流程）
- 90% 以上的有效决策按期进行决策审查
- 决策质量评分在全部 6 个维度上的平均分高于 7/10
- 在记录新决策之前，冲突检测能够发现 100% 的主题矛盾
- 每次董事会会议开始时均查阅决策日志

---

## 范围与局限性

**范围内：** 双层决策记忆架构、决策录入和生命周期管理（提议 > 已批准 > 有效 > 已完成/已取代/已过期）、冲突检测（`DO_NOT_RESURFACE`、主题矛盾、负责人冲突）、带逾期提醒的行动项跟踪、按主题/负责人/日期/状态搜索和检索决策、决策质量评分，以及通过决策树进行预期价值分析。

**范围外：** CRM 或项目管理工具集成（工具使用 JSON 导出）、会议转录或录音、团队级任务管理（使用 project-management/ 技能）、战略规划或 OKR 跟踪（使用 strategic-alignment 或 ceo-advisor），以及自动化决策。本技能用于跟踪和评估决策，而不是代替用户作出决策。

**局限性：** 冲突检测使用标签和文本匹配；语义相似但措辞不同的提案可能无法被发现。决策质量评分属于回顾性评估，并依赖诚实的自我评价。决策树的预期价值计算假设概率是可估算的；在高度不确定的环境中，概率赋值可能具有误导性。双层架构需要严格执行才能维持；如果第 2 层未得到持续更新，组织记忆将会退化。

---

## 集成点

- **chief-of-staff** -- 管理记录工作流；第 2 层写入的单一控制点
- **board-meeting** -- 在第 5 阶段批准后触发决策记录；在第 1 阶段加载决策日志
- **strategic-alignment** -- 检查决策是否正确地逐层落实到团队目标和 OKR
- **executive-mentor** -- 审查长期未更新的决策以进行重新评估；辅导如何改进决策质量
- **ceo-advisor** -- 记录和跟踪战略决策；利用决策模式为领导力辅导提供参考