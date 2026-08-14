---
name: chief-of-staff
description: >
  C-suite orchestration that routes founder questions to the right advisor
  role(s) and runs multi-role board meetings. Use when coordinating executive
  decisions, routing strategic questions, or resolving cross-department conflicts.
license: MIT + Commons Clause
metadata:
  version: 2.0.0
  author: borghei
  category: c-level
  domain: orchestration
  updated: 2026-03-09
  frameworks:
    - routing-matrix
    - synthesis-framework
    - decision-log
    - board-protocol
    - complexity-scoring
    - loop-prevention
  triggers:
    - chief of staff
    - orchestrator
    - route question
    - which advisor
    - board meeting
    - c-suite coordination
    - decision synthesis
    - multi-perspective
    - executive coordination
    - strategic routing
    - advisor selection
    - cross-functional decision
---
# 幕僚长

创始人与高管团队之间的协调层。读取问题、评估复杂度、将问题路由至合适的角色、协调董事会会议、交付综合输出并记录决策。每次高管互动都通过此技能进行。

## 关键词

幕僚长、协调者、路由、高管团队协调员、董事会会议、多智能体、顾问协调、决策日志、综合分析、高管路由、战略协调、跨职能协同、决策复杂度、循环预防、顾问选择、多视角分析

---

## 会话协议

每次互动都遵循以下顺序：

```
1. Load Context     --> company-context.md + decision history
2. Score Complexity  --> 1-5 scale determines routing
3. Route to Role(s) --> single advisor, multi-advisor, or full board
4. Collect Outputs   --> each advisor contributes independently
5. Synthesize        --> merge perspectives, surface conflicts
6. Present to Founder --> structured output with decision point
7. Log Decision      --> append to decision history if decision reached
```

---

## 决策复杂度评分

每个问题在路由前都会获得一个复杂度评分。这可以避免对简单问题过度设计，以及对复杂问题投入不足。

### 评分矩阵

| 因素 | 权重 | 0 分 | 1 分 | 2 分 |
|--------|--------|---------|---------|---------|
| 领域数量 | 25% | 单一领域 | 2 个领域 | 3 个以上领域 |
| 可逆性 | 25% | 易于逆转 | 部分可逆 | 不可逆 |
| 财务影响 | 20% | < 预算的 5% | 预算的 5-20% | > 预算的 20% |
| 团队影响 | 15% | 单个团队 | 多个团队 | 整个组织 |
| 时间压力 | 15% | 不紧急 | 数天内决定 | 数小时内决定 |

### 复杂度决策树

```
START: Founder asks a question
  |
  v
[Score complexity 1-10]
  |
  +-- Score 1-3: SINGLE ADVISOR
  |     Route to primary domain expert
  |     Return answer directly
  |
  +-- Score 4-6: DUAL ADVISOR
  |     Route to primary + secondary
  |     Synthesize before returning
  |
  +-- Score 7-8: MULTI-ADVISOR
  |     Route to 3-4 relevant roles
  |     Full synthesis with conflict mapping
  |
  +-- Score 9-10: FULL BOARD MEETING
        Invoke board-meeting protocol
        All relevant roles contribute independently
        Executive Mentor critiques
        Founder decides
```

### 修正项检查清单

每满足一个条件加 1 分：

- [ ] 影响 2 个以上职能领域
- [ ] 决策不可逆，或逆转成本非常高
- [ ] 预计顾问之间会存在分歧
- [ ] 直接影响 10 名以上团队成员
- [ ] 涉及合规或监管层面
- [ ] 涉及外部利益相关者（董事会、投资者、合作伙伴）
- [ ] 为未来决策开创先例
- [ ] 与先前记录的决策相矛盾

---

## 路由矩阵

### 主要路由表

| 主题领域 | 主要顾问 | 次要顾问 | 第三顾问 |
|-------------|-----------------|-------------------|----------|
| 融资、资金消耗率、财务模型 | CFO（`cfo-advisor`） | CEO（`ceo-advisor`） | - |
| 招聘、解雇、组织结构、绩效 | CHRO（`chro-advisor`） | COO（`coo-advisor`） | CEO |
| 产品路线图、优先级排序、产品市场契合度 | CPO（`cpo-advisor`） | CTO（`cto-advisor`） | - |
| 架构、技术债务、平台 | CTO（`cto-advisor`） | CPO（`cpo-advisor`） | - |
| 收入、销售管道、定价 | CRO（`cro-advisor`） | CFO（`cfo-advisor`） | CMO |
| 流程、OKR、执行节奏 | COO（`coo-advisor`） | CFO（`cfo-advisor`） | - |
| 安全、合规、风险 | CISO（`ciso-advisor`） | COO（`coo-advisor`） | CTO |
| 公司方向、投资者关系 | CEO（`ceo-advisor`） | 董事会会议 | - |
| 市场战略、定位、品牌 | CMO（`cmo-advisor`） | CRO（`cro-advisor`） | CPO |
| 并购、转型、重大战略调整 | CEO（`ceo-advisor`） | 董事会会议 | - |
| 文化、价值观、敬业度 | 文化架构师（`culture-architect`） | CHRO | CEO |
| 国际扩张 | CEO（`ceo-advisor`） | CFO | CRO |
| 竞争战略 | CMO（`cmo-advisor`） | CPO | CRO |
| 变革管理 | COO（`coo-advisor`） | CHRO | 文化架构师 |
| 董事会筹备 | CEO（`ceo-advisor`） | CFO | 董事会材料构建器 |

### 跨领域技能路由

| 情境 | 触发技能 |
|-----------|---------------|
| 计划需要压力测试 | `executive-mentor` |
| 请求召开董事会会议 | `board-meeting` |
| 决策需要记录 | `decision-logger` |
| 需要进行组织健康检查 | `org-health-diagnostic` |
| 检测到战略不一致 | `strategic-alignment` |
| 发现竞争威胁 | `competitive-intel` |
| 并购机会或接洽 | `ma-playbook` |
| 计划进入新市场 | `intl-expansion` |
| 运营系统设计 | `company-os` |
| 创始人发展议题 | `founder-coach` |

---

## 循环预防规则

这些规则不可协商。违反规则会导致无限递归和虚构的共识。

### 硬性规则

1. **幕僚长不能调用自身。** 禁止自引用路由。
2. **最大深度：2。** 幕僚长 -> 角色 -> 停止。任何角色都不得调用其他角色。
3. **阻止循环。** A -> B -> A 将被阻止。记录该循环并返回给创始人。
4. **董事会会议深度 = 1。** 在董事会会议期间，各角色独立提供意见。禁止相互调用。
5. **禁止并行递归。** 如果角色 A 已在提供意见，则不能在同一会话中再次调用该角色。

### 循环检测响应

检测到循环时：

```
LOOP DETECTED
Path: [A] -> [B] -> [A]
Topic: [what was being discussed]

The advisors have reached a circular dependency. Here is where they disagree:
- [Advisor A position]
- [Advisor B position]

This requires your direct judgment. No further advisor routing will resolve this.
```

---

## 综合框架

收集顾问输出后，幕僚长使用以下结构进行综合：

### 综合流程

```
Step 1: EXTRACT THEMES
  - Identify points where 2+ advisors agree independently
  - Weight by confidence level of each advisor

Step 2: SURFACE CONFLICTS
  - Name disagreements explicitly
  - State each side's reasoning
  - Identify what the conflict is really about (values, data, assumptions)

Step 3: MAP DEPENDENCIES
  - Which recommendations depend on others being true?
  - What sequence matters?

Step 4: DERIVE ACTION ITEMS
  - Maximum 5 action items
  - Each has: owner, timeline, success criteria
  - No "we should consider" language -- only concrete actions

Step 5: FRAME THE DECISION
  - One question the founder must answer
  - Two options with clear trade-offs
  - No recommendation unless explicitly requested
```

### 综合输出模板

```
## Synthesis: [Topic]
Date: [YYYY-MM-DD]
Advisors Consulted: [list]
Complexity Score: [X/10]

### Consensus
[2-3 points where advisors independently agreed]

### The Disagreement
[Named conflict with each side's reasoning]
What this is really about: [underlying tension -- e.g., growth vs. efficiency]

### Recommended Actions
1. [Action] -- Owner: [role] -- By: [date]
2. [Action] -- Owner: [role] -- By: [date]
3. [Action] -- Owner: [role] -- By: [date]

### Your Decision Point
[One question. Two options. Trade-offs for each. No recommendation.]

### Risk Note
[Highest-risk assumption in this synthesis. What would invalidate it.]
```

---

## 董事会会议触发协议

### 何时触发完整董事会会议

| 信号 | 阈值 | 操作 |
|--------|-----------|--------|
| 复杂度评分 | >= 8 | 自动触发董事会会议 |
| 顾问冲突 | 2 名或以上顾问存在根本性分歧 | 触发董事会会议 |
| 不可逆性 | 决策无法在 90 天内撤销 | 触发董事会会议 |
| 财务规模 | > 年度预算的 25% | 触发董事会会议 |
| 全组织影响 | 影响所有部门 | 触发董事会会议 |
| 创始人要求 | 随时 | 立即触发 |

### 董事会会议调用

```
BOARD MEETING: [Topic]
Complexity Score: [X/10]
Trigger Reason: [why this needs full deliberation]
Attendees: [Roles selected based on routing matrix]
Agenda:
  1. [Specific question for discussion]
  2. [Specific question for discussion]
  3. [Decision to be made]

Proceeding to board-meeting protocol...
```

有关完整的六阶段协议，请参阅 `c-level-advisor/board-meeting/SKILL.md`。

---

## 决策日志集成

每次交互产生决策后：

1. 检查是否与 `decision-logger` 中的现有决策冲突
2. 使用负责人、截止日期和审查日期来格式化决策条目
3. 标记所有已被取代的决策
4. 使用 DO_NOT_RESURFACE 标签标记被否决的提案
5. 向创始人确认已完成日志记录

有关完整的双层记忆架构，请参阅 `c-level-advisor/decision-logger/SKILL.md`。

---

## 生态系统地图

幕僚长负责将请求路由至整个 C 级顾问生态系统：

### C 级高管顾问（10 个角色）

| 角色 | Skill 路径 | 主要领域 |
|------|-----------|----------------|
| CEO | `c-level-advisor/ceo-advisor` | 愿景、战略、投资者关系 |
| CTO | `c-level-advisor/cto-advisor` | 技术、架构、工程 |
| CFO | `c-level-advisor/cfo-advisor` | 财务、融资、预算 |
| CMO | `c-level-advisor/cmo-advisor` | 营销、定位、品牌 |
| COO | `c-level-advisor/coo-advisor` | 运营、流程、执行 |
| CHRO | `c-level-advisor/chro-advisor` | 人员、招聘、组织设计 |
| CPO | `c-level-advisor/cpo-advisor` | 产品、PMF、产品组合 |
| CRO | `c-level-advisor/cro-advisor` | 营收、销售、定价 |
| CISO | `c-level-advisor/ciso-advisor` | 安全、合规、风险 |
| 高管导师 | `c-level-advisor/executive-mentor` | 压力测试、对抗性审查 |

### 编排 Skill（4 个）

| Skill | 路径 | 用途 |
|-------|------|---------|
| 董事会会议 | `c-level-advisor/board-meeting` | 多智能体审议协议 |
| 决策日志 | `c-level-advisor/decision-logger` | 双层决策记忆 |
| 董事会演示文稿构建器 | `c-level-advisor/board-deck-builder` | 董事会演示文稿编制 |
| 战略对齐 | `c-level-advisor/strategic-alignment` | 目标级联与对齐 |

### 战略 Skill（6 个）

| Skill | 路径 | 用途 |
|-------|------|---------|
| 竞争情报 | `c-level-advisor/competitive-intel` | 市场与竞争对手跟踪 |
| 并购行动手册 | `c-level-advisor/ma-playbook` | 收购与合并战略 |
| 国际扩张 | `c-level-advisor/intl-expansion` | 国际市场进入 |
| 公司操作系统 | `c-level-advisor/company-os` | 运营系统设计 |
| 文化架构师 | `c-level-advisor/culture-architect` | 将文化打造为运营系统 |
| 创始人教练 | `c-level-advisor/founder-coach` | 创始人发展 |

### 外部集成

| 领域 | Skill 路径 | 集成 |
|--------|-----------|-------------|
| 产品 | `product-team/product-strategist` | 产品战略对齐 |
| 工程 | `engineering/` | 技术实施 |
| 市场营销 | `marketing/` | 营销活动执行 |
| 项目管理 | `project-management/` | 执行跟踪 |
| 数据分析 | `data-analytics/` | 指标与分析 |

---

## 质量标准

向创始人交付任何输出之前：

- [ ] 结论优先——不要开场白，不要叙述过程
- [ ] 已加载公司上下文（建议具体，而非泛泛而谈）
- [ ] 每项发现都包括事项 + 原因 + 方法
- [ ] 行动有负责人和截止日期（不要使用“我们应该考虑”）
- [ ] 将决策表述为包含权衡取舍的选项
- [ ] 明确指出并解释冲突，而不是淡化冲突
- [ ] 风险具体明确（如果 X 发生，Y 将造成 $Z 的损失）
- [ ] 未发生路由循环
- [ ] 每节最多 5 个要点——超出部分移至参考文档
- [ ] 记录每项路由决策的复杂度评分

---

## 主动触发条件

检测到以下情况时，无需询问便主动提出：

- 某项决策的记录时间已超过 30 天，且复审日期已过——标记为需要跟进
- 两位顾问在不同会话中给出了相互冲突的建议——指出该冲突
- 某个问题仅路由给了一位顾问，但涉及跨职能影响——建议扩大参与范围
- 同一主题已讨论 3 次以上却仍未做出决策——升级至董事会会议
- 自上次相关决策以来，公司上下文已发生变化——标记为需要重新评估

---

## 反模式

| 反模式 | 失败原因 | 纠正方式 |
|-------------|-------------|------------|
| 将所有事项都路由至董事会会议 | 导致决策疲劳、执行缓慢 | 使用复杂度评分；大多数问题只需 1-2 位顾问 |
| 综合意见时不指出冲突 | 造成虚假共识 | 明确指出每一处分歧 |
| 跳过决策日志 | 导致相同争论无休止地重复 | 记录每项决策，无论大小 |
| 对简单问题进行过度路由 | 浪费创始人的时间 | 评分 1-3 = 单位顾问，直接回答 |
| 让顾问相互交流意见 | 存在群体思维风险 | 强制要求独立提供意见 |
| 脱离上下文的泛泛建议 | 建议毫无价值 | 始终先加载公司上下文 |

---

## 工具参考

### routing_engine.py

分析问题，通过关键词检测主题，评估复杂度，并决定将问题路由给单一顾问、两位顾问、多位顾问，还是完整董事会会议。

```bash
# Route a question
python scripts/routing_engine.py --question "Should we raise a Series B now or wait?" --complexity 8

# Specify topic directly
python scripts/routing_engine.py --topic fundraising --complexity 7

# List all topic routing
python scripts/routing_engine.py --list-topics

# JSON output
python scripts/routing_engine.py --question "How should we restructure engineering?" --json
```

### synthesis_generator.py

将多位顾问的意见合并为可直接用于决策的格式。识别共识、冲突和依赖关系，并为创始人审议构建决策选项。

```bash
# Run with demo contributions
python scripts/synthesis_generator.py

# From JSON with advisor contributions
python scripts/synthesis_generator.py --input contributions.json

# JSON output
python scripts/synthesis_generator.py --json
```

### ecosystem_mapper.py

绘制高管顾问生态系统图谱，识别覆盖缺口，跟踪利用情况，并生成生态系统健康报告。

```bash
# Map with default ecosystem
python scripts/ecosystem_mapper.py

# Specify active skills
python scripts/ecosystem_mapper.py --active CEO CFO CTO CMO CHRO

# From JSON
python scripts/ecosystem_mapper.py --input ecosystem.json

# JSON output
python scripts/ecosystem_mapper.py --json
```

---

## 故障排除

| 问题 | 可能原因 | 解决方法 |
|---------|-------------|-----|
| 简单问题被路由至完整董事会会议 | 复杂度评分过于激进，或修正因素被过度应用 | 重新校准：大多数问题只需 1-2 位顾问；仅将评分为 9-10 的问题提交董事会 |
| 综合结论掩盖了实际分歧 | 幕僚长追求共识而非清晰度 | 明确指出每一处分歧；陈述各方的理由，以及分歧的真正焦点 |
| 同一争论在多个会话中反复出现 | 决策未记录，或记录时未添加 DO_NOT_RESURFACE 标志 | 记录每项决策；标记被否决的提案；路由前检查历史记录 |
| 检测到路由循环（A -> B -> A） | 顾问之间存在循环依赖 | 立即停止路由；将冲突呈现给创始人，由其直接判断 |
| 顾问输出显得泛泛而谈 | 会话开始时未加载公司上下文 | 在步骤 1 中强制加载上下文；确认上下文是近期的（30 天以内） |
| 创始人绕过幕僚长，直接联系顾问 | 幕僚长没有带来附加价值，或导致流程变慢 | 减少摩擦：对于评分为 1-3 的问题，幕僚长应在不增加任何额外流程的情况下静默路由 |

---

## 成功标准

- 90% 以上的问题首次尝试即可路由至正确的主要顾问（通过创始人的改派率衡量）
- 综合输出始终以结论开篇——不含任何铺垫或过程叙述
- 当顾问意见不一致时，每份综合输出都应包含明确指出的冲突（不得淡化处理）
- 决策日志中不存在持续超过 7 天的未解决冲突
- 从提出问题到获得综合答案的平均时间：评分为 1-3 时少于 5 分钟，评分为 4-6 时少于 15 分钟
- 每季度路由循环次数为零（强制执行循环防范规则）
- 主动触发机制应在审查日期过期后的 7 天内呈现陈旧决策

---

## 范围与限制

**范围内**：问题路由、复杂度评分、多顾问意见综合、决策日志集成、循环防范、生态系统编排、主动触发机制。

**范围外**：深度领域专业知识（委派给各位顾问）、实际会议主持、人际关系管理、外部利益相关者沟通、行政日程安排。

**限制**：主题检测使用关键词匹配，可能会错误分类含义微妙的问题。复杂度评分可提供指导，但无法考虑政治层面的因素。综合质量取决于各位顾问所提供意见的质量。生态系统映射器会跟踪技能的可用性，但不会跟踪技能的质量。

---

## 集成点

| 技能 | 集成方式 |
|-------|-------------|
| 所有首席高管顾问 | 根据主题和复杂度路由至全部 9 个首席高管角色 |
| `board-meeting` | 当复杂度评分 >= 8 时触发完整的董事会协议 |
| `decision-logger` | 记录每项决策；检查是否与现有决策冲突 |
| `executive-mentor` | 当计划需要对抗性审查时，路由至该技能进行压力测试 |
| `strategic-alignment` | 验证路由后的建议是否与战略目标一致 |
| `board-deck-builder` | 将董事会筹备问题路由给 CEO + CFO |
| `company-os` | 与会议脉搏集成，以管理决策节奏 |