---
name: company-os
description: >
  Meta-framework for how a company runs -- the connective tissue between C-suite
  roles (EOS, Scaling Up, OKR-native). Use when setting up company operations,
  selecting a management framework, designing meeting rhythms, or implementing
  OKRs.
license: MIT + Commons Clause
metadata:
  version: 2.0.0
  author: borghei
  category: c-level
  domain: company-operations
  updated: 2026-03-09
  frameworks:
    - os-comparison
    - accountability-chart
    - scorecard-design
    - meeting-pulse
    - ids-resolution
    - rocks-framework
    - communication-cadence
  triggers:
    - operating system
    - company OS
    - EOS
    - Scaling Up
    - Rockefeller Habits
    - OKR
    - OKRs
    - L10 meeting
    - rocks
    - scorecard
    - accountability chart
    - issues list
    - IDS
    - meeting pulse
    - quarterly planning
    - weekly scorecard
    - management framework
    - company rhythm
    - traction
    - meeting cadence
    - weekly meeting
    - annual planning
---
# 公司操作系统

操作系统是决定公司如何运作的一整套工具、节奏和约定。每家公司都有一套操作系统——只是大多数公司并不知道它是什么。将其明确化，才能对其加以改进。

## 关键词

操作系统、EOS、创业者操作系统、Scaling Up、洛克菲勒习惯、OKR、Holacracy、L10 会议、关键任务、记分卡、责任图、问题清单、IDS、会议节奏、季度规划、每周记分卡、管理框架、公司节奏、Traction、年度规划、沟通节奏

---

## 首先澄清

生成内容之前，请确认以下信息。如果有任何信息未知或含糊，请提问——不要自行假设：

- [ ] **公司规模和阶段**——框架建议（EOS / Scaling Up / OKR 原生 / Holacracy）和实施时间线主要由员工人数决定
- [ ] **实际出了什么问题**（没有记分卡、优先事项不一致、反复出现的未解决问题、会议过多）——这决定了应首先构建六大组件中的哪一个
- [ ] **创始人的运营风格**（运营型还是愿景型），以及公司是工程驱动还是销售驱动——这会影响在特定规模区间内对框架的选择
- [ ] **现有的节奏和指标**——确保新的操作系统取代现有会议，而不是叠加在其上，造成会议疲劳

停止规则：只询问最能改变输出结果的 2～3 个问题。如果用户说“直接起草”，则继续执行，并在产出内容顶部列出你的假设。

---

## 操作系统选择

### 决策树

```
START: "Which operating system?"
  |
  v
[Company size?]
  |
  +-- 10-50 people
  |     |
  |     v
  |   [Is the founder operational or visionary?]
  |     |
  |     +-- Operational --> EOS / Traction (structured, simple)
  |     +-- Visionary --> Scaling Up (ambitious, strategy-heavy)
  |
  +-- 50-200 people
  |     |
  |     v
  |   [Engineering-led or sales-led?]
  |     |
  |     +-- Engineering-led --> OKR-native (hypothesis-driven)
  |     +-- Sales-led --> Scaling Up or EOS (execution-focused)
  |
  +-- 200+ people
  |     |
  |     v
  |   [High autonomy or high alignment needed?]
  |     |
  |     +-- High autonomy --> Holacracy (only if patient)
  |     +-- High alignment --> Custom hybrid (best of EOS + OKR)
  |
  +-- Not sure --> Start with EOS. It is the simplest to implement.
```

### 框架对比矩阵

| 特性 | EOS | Scaling Up | OKR 原生 | Holacracy |
|---------|-----|-----------|------------|-----------|
| 复杂度 | 低 | 中 | 中 | 高 |
| 实施时间 | 30～90 天 | 90～180 天 | 60～120 天 | 6～12 个月 |
| 最适合的公司规模 | 10～250 人 | 50～500 人 | 20～500 人 | 50～300 人 |
| 目标框架 | 关键任务（二元结果） | OKR + 优先事项 | OKR（分级评分） | 角色 + 职责 |
| 会议节奏 | 每周 L10 | 每日站会 + 每周会议 | 每周 + 每季度 | 治理会议 + 战术会议 |
| 问题解决 | IDS | 保留/淘汰/合并 | 复盘 | 治理流程 |
| 责任机制 | 责任图 | 职能责任制 | OKR 负责人制 | 基于角色 |
| 记分卡 | 每周数据 | 每周 KPI | 季度 KR | 每个角色的指标 |
| 优势 | 简单、实施迅速 | 严谨、重战略 | 灵活、适合科技公司 | 分布式权力 |
| 劣势 | 可能显得僵化 | 复杂、需要严格执行 | 缺乏结构时可能偏离方向 | 学习曲线陡峭 |

---

## 六大核心组件

每个高效的运营系统都包含以下六个组件，无论采用何种框架：

### 组件 1：责任归属图

它不是组织架构图。责任归属图回答的是：“谁对这一结果负责？”

#### 设计原则

| 原则 | 实施方式 |
|-----------|---------------|
| 单一责任人 | 每项职能由一人负责。可以有多人参与相关工作。 |
| 明确责任缺口 | 找出无人负责的职能并指定责任人。 |
| 避免责任重叠 | 如果两个人都认为自己负责，那么实际上谁都没有真正负责。必须立即解决。 |
| 与发展阶段相适应 | 早期阶段，一人可以负责多个岗位。对此必须明确说明。 |
| 每季度审查 | 随着公司发展，责任归属会发生变化。每季度审查一次。 |

#### 责任归属图模板

```
CEO
  |
  +-- Revenue (CRO/VP Sales)
  |     +-- Inbound pipeline
  |     +-- Outbound pipeline
  |     +-- Customer success
  |
  +-- Product & Engineering (CTO/CPO)
  |     +-- Product roadmap
  |     +-- Engineering delivery
  |     +-- Technical operations
  |
  +-- Operations (COO)
  |     +-- Finance & legal
  |     +-- People operations
  |     +-- Business operations
  |
  +-- Marketing (CMO/VP Marketing)
        +-- Demand generation
        +-- Brand & content
        +-- Product marketing
```

#### 研讨会流程（2 小时）

```
Step 1: List all functions the company performs (30 min)
Step 2: Assign ONE owner per function (30 min)
Step 3: Identify gaps (functions nobody owns) (15 min)
Step 4: Identify overlaps (2+ people claiming ownership) (15 min)
Step 5: Resolve gaps and overlaps (20 min)
Step 6: Publish and communicate (10 min)
```

### 组件 2：记分卡

通过每周指标判断公司是否按计划推进。不是每月。不是每季度。是每周。

#### 记分卡规则

| 规则 | 理由 |
|------|-----------|
| 最多 5 至 15 项指标 | 超过 15 项 = 没有任何指标能得到关注 |
| 每项指标都有责任人 | 明确归属可以推动责任落实 |
| 每项指标都有每周目标 | 不是一个范围，而是一个具体数字 |
| 红/黄/绿状态 | 不要大段文字，而要像交通信号灯一样直观 |
| 只讨论红色指标 | 绿色 = 会议中无需讨论 |

#### 记分卡示例

| 指标 | 责任人 | 目标 | 本周 | 状态 |
|--------|-------|--------|------|--------|
| 新增 MRR | CRO | $50K | $43K | [R] |
| 客户流失率 | CS 负责人 | < 1% | 0.8% | [G] |
| 活跃用户数 | CPO | 2,000 | 2,150 | [G] |
| 部署次数 | CTO | 3/week | 3 | [G] |
| 未解决的严重缺陷 | CTO | 0 | 2 | [R] |
| 资金可维持时间 | CFO | > 18mo | 16mo | [Y] |
| 录用通知接受率 | CHRO | > 85% | 90% | [G] |

### 组件 3：会议节奏

#### 完整会议节奏

| 会议 | 频率 | 时长 | 参与者 | 目的 |
|---------|-----------|----------|-----|---------|
| 每日站会 | 每日 | 15 分钟 | 各团队 | 只讨论阻塞事项 |
| L10 / 领导层同步会 | 每周 | 90 分钟 | 领导团队 | 记分卡 + 问题 |
| 部门复盘会 | 每月 | 60 分钟 | 部门成员 + 领导层 | 深入分析部门指标 |
| 季度规划会 | 每季度 | 1-2 天 | 领导层 | 设定季度重点目标，复盘战略 |
| 年度规划会 | 每年 | 2-3 天 | 领导层 | 制定 1 年愿景和 3 年愿景 |

#### L10 会议议程（每周领导层会议）

| 环节 | 时长 | 活动 |
|---------|----------|----------|
| 好消息 | 5 分钟 | 个人和业务上的成果 |
| 记分卡审查 | 5 分钟 | 仅标记红色项目 |
| 重点目标审查 | 5 分钟 | 检查每项目标是否按计划推进 |
| 客户/员工要闻 | 5 分钟 | 值得关注的事件 |
| 问题清单（IDS） | 60 分钟 | 识别、讨论、解决 |
| 待办事项审查 | 5 分钟 | 上周的承诺：完成还是未完成？ |
| 总结 | 5 分钟 | 为会议打 1-10 分，下次怎样才能达到 10 分 |

### 组件 4：问题解决（IDS）

每个问题最多 15 分钟。这是解决问题的核心循环。

```
IDENTIFY: What is the actual issue? (One sentence, root cause, not symptom)
  |
DISCUSS: Relevant facts + perspectives. Time-boxed.
  |       When discussion starts repeating, STOP.
  |
SOLVE: One owner. One action. One due date. Written down.
```

#### IDS 反模式

| 反模式 | 失败原因 | 解决方法 |
|-------------|-------------|-----|
| “我们线下再讨论” | 转到线下的问题很少能得到解决 | 现在解决，或将其加入下周的清单 |
| 只讨论，不决策 | 讨论得很好，但没有行动项，就等于浪费时间 | 每次讨论都必须以一项决策结束 |
| 重新讨论已经决定的问题 | 会破坏这套机制 | 一旦解决，就从清单中移除。只有出现新数据时才能重新开启。 |
| 同一问题连续出现在 3 次以上的会议中 | 要么它不是真正的问题，要么大家过于畏惧而不敢处理 | 强制处理：本周解决，否则将其移除 |
| 将多个问题混为一谈 | 无法解决捆绑在一起的问题 | 每个条目只包含一个问题。必要时拆分。 |

### 组件 5：重点目标（90 天优先事项）

#### 重点目标规则

| 规则 | 理由 |
|------|-----------|
| 每人最多 3-7 项 | 超过 7 项，就会一项也完不成 |
| 公司级重点目标为 3-7 项 | 领导团队共同的优先事项 |
| 二元状态：已完成或未完成 | 不使用“已完成 60%” |
| 在季度规划时设定 | 每周审查（按计划推进/偏离计划） |
| 不是待办事项清单 | 重点目标需要持续投入 90 天的工作 |

#### 好的重点目标与差的重点目标

| 差的重点目标 | 原因 | 好的重点目标 |
|----------|-----|-----------|
| “改进销售流程” | 不可衡量，也不具体 | “在 3 月 31 日前实施包含销售管道阶段和报告功能的 CRM” |
| “招聘更多工程师” | 没有目标数量，也没有截止日期 | “在 4 月 15 日前招聘 3 名高级工程师并让其接受录用通知” |
| “降低客户流失率” | 没有目标值 | “在第二季度末之前，将月度客户流失率从 3% 降至 1.5%” |
| “改善沟通” | 无法观察 | “连续 12 周，每周五发布公司周报” |

### 组件 6：沟通节奏

| 受众 | 内容 | 时间 | 形式 |
|----------|------|------|--------|
| 全体员工 | 公司动态 | 每月 | 书面内容 + 问答 |
| 全体员工 | 季度业绩 + 优先事项 | 每季度 | 全员大会 |
| 领导团队 | 记分卡 | 每周 | 仪表板 |
| 董事会 | 公司业绩 | 每月或每季度 | 董事会备忘录/演示文稿 |
| 投资者 | 关键指标 + 说明 | 每月或每季度 | 投资者简报 |
| 客户 | 产品更新 | 每次发布时 | 发布说明 |

**默认规则**：如果正在考虑是否应在内部分享，那就分享。沟通不足的代价总是高于过度沟通。

---

## 实施路线图

### 30 天快速启动

| 周次 | 活动 | 时间投入 |
|------|----------|-----------------|
| 1 | 建立责任分工图 | 2 小时研讨会 |
| 2 | 定义 5-10 项每周记分卡指标 | 1 小时共识会议 |
| 3 | 启动每周 L10 会议 | 每周 90 分钟（持续进行） |
| 4 | 设定第一轮 90 天磐石目标 | 半天规划会议 |

仅这四项就能带来比大多数公司一年内所实现的更显著的协同改善。

### 90 天完整实施

| 月份 | 重点 | 交付成果 |
|-------|-------|-------------|
| 1 | 基础 | 责任分工图、记分卡、L10 会议 |
| 2 | 深化 | 明确磐石目标、启用问题清单、每日站会 |
| 3 | 节奏 | 完整的会议节奏、沟通节奏、首次季度复盘 |

---

## 常见失败模式

| 失败模式 | 表现 | 解决方法 |
|---------|---------|-----|
| 实施不完整 | “我们制定 OKR，但不进行跟进检查” | 只实施一半的 OS 比完全不实施更糟。承诺采用完整系统。 |
| 会议疲劳 | 在现有会议之上增加新的会议节奏 | 替换会议，而不是增加会议 |
| 指标过载 | 设置 30 个 KPI，因为“它们都很重要” | 从 5 个开始。仅在节奏建立后再增加。 |
| 磐石目标膨胀 | 每人 12 个磐石目标 | 硬性上限：每人 7 个，公司 7 个。 |
| 领导者不遵守 | 领导层缺席 L10 或忽视 IDS | OS 会反映领导层对它的重视程度。领导者必须以身作则。 |
| 没有季度复盘 | 年度目标到年末才检查 | 季度是最低复盘频率。 |
| 记分卡没有目标值 | 跟踪数字但不设阈值 | 每项指标都需要目标值，才能指导行动。 |

---

## 危险信号

- 当被问及“公司最重要的 3 项优先事项是什么？”时，五位团队负责人给出不同答案 -- 协同失败
- 同一个问题在问题清单上存在 4 周以上 -- 回避问题或存在结构性问题
- 没有每周记分卡 -- 盲目运营
- 设定了磐石目标，但从不进行每周复盘 -- 目标缺乏问责
- 责任分工图已超过 6 个月未更新 -- 已偏离实际情况
- 会议总是在没有做出决策的情况下结束 -- 会议设计存在问题
- 沟通全是自上而下，从不自下而上 -- 反馈闭环已断裂

---

## 与最高管理层的整合

| 角色 | OS 依赖关系 |
|------|---------------|
| CEO (`ceo-advisor`) | 设定愿景，为一年期计划和磐石目标提供方向 |
| COO (`coo-advisor`) | 负责会议脉搏和问题解决节奏 |
| CFO (`cfo-advisor`) | 负责记分卡中的财务指标 |
| CTO (`cto-advisor`) | 负责工程磐石目标和技术记分卡指标 |
| CHRO (`chro-advisor`) | 负责人员指标（离职率、招聘速度） |
| 文化架构师 (`culture-architect`) | 将文化仪式融入会议脉搏 |
| 战略协同 (`strategic-alignment`) | 验证团队磐石目标是否由公司磐石目标逐级分解而来 |
| 变革管理 (`change-management`) | 新 OS 的推广遵循 ADKAR 模型 |

---

## 输出产物

| 请求 | 交付物 |
|---------|-------------|
| “建立我们的运营系统” | 框架建议 + 30 天实施计划 |
| “设计我们的会议节奏” | 完整的会议节奏，包括议程和负责人 |
| “构建我们的计分卡” | 5-15 项指标，包括负责人、目标值和阈值 |
| “协助我们进行季度规划” | 规划会议议程 + Rocks 制定框架 |
| “解决我们的问责问题” | 责任架构图研讨会 + 缺口/重叠分析 |
| “我们总是在讨论相同的问题” | IDS 培训 + 问题清单审查 |

---

## 工具参考

### scorecard_builder.py

构建并跟踪每周公司计分卡，提供 RAG 状态、趋势分析以及可供 L10 会议使用的 IDS 问题清单。

```bash
# Run with demo data
python scripts/scorecard_builder.py

# From JSON with metrics and rocks
python scripts/scorecard_builder.py --input scorecard.json

# JSON output
python scripts/scorecard_builder.py --json
```

### rocks_tracker.py

跟踪公司和个人的 90 天 Rocks，提供二元状态、阻碍因素识别和负责人问责。

```bash
# Run with demo data
python scripts/rocks_tracker.py

# Specify quarter
python scripts/rocks_tracker.py --quarter Q2

# From JSON
python scripts/rocks_tracker.py --input rocks.json

# JSON output
python scripts/rocks_tracker.py --json
```

### meeting_pulse_designer.py

设计公司会议节奏、验证会议负荷、识别重复项和缺口，并生成 L10 议程模板。

```bash
# Run with demo meetings
python scripts/meeting_pulse_designer.py

# Specify team size
python scripts/meeting_pulse_designer.py --team-size 50

# From JSON with current meetings
python scripts/meeting_pulse_designer.py --input meetings.json

# JSON output
python scripts/meeting_pulse_designer.py --json
```

---

## 故障排除

| 问题 | 可能原因 | 解决方法 |
|---------|-------------|-----|
| 五位团队负责人对最重要的三项优先事项给出了不同答案 | 协同失效——Rocks 未逐级分解或未进行每周复盘 | 重新开展季度规划；每周在 L10 中复盘 Rocks；将公司优先事项公开展示在显眼位置 |
| 同一个问题在问题清单上停留了 4 周以上 | 有意回避，或结构性问题棘手到令人不敢处理 | 强制处理：本周解决，否则永久移除；必要时升级处理 |
| 计分卡包含 30 多项 KPI | 指标过载——没有任何指标能得到应有的关注 | 精简至 5-10 项指标。只保留能够反映公司是否按计划推进的指标。 |
| 已制定 Rocks，但从未进行复盘 | 目标缺乏问责；未召开 L10 会议 | 每周 L10 不容妥协；每周用 5 分钟复盘 Rocks |
| 领导团队跳过 L10 或忽略 IDS | 领导者不遵守规则会摧毁运营系统 | CEO 必须强制执行：领导者要以身作则。如果 CEO 跳过，运营系统就会失效。 |
| 在现有会议之外继续增加会议 | 会议不断累积导致会议疲劳 | 替换会议，而不是增加会议。审查会议清单；消除重复会议 |

---

## 成功标准

- 每周都召开 L10 会议，领导团队出席率达到 90% 以上（连续 12 周以上无例外）
- 每周复盘计分卡，并使用 IDS 格式讨论红色指标（不忽略任何红色指标）
- 到季度末，70% 以上的季度 Rocks 按完成/未完成的二元标准完成
- 问题清单：每个问题平均在 2 次会议内解决（任何问题都不得拖延 4 周以上）
- 所有团队负责人都能完全一致地说出公司最重要的三项优先事项（每季度测试）
- 每人每周的会议时长少于 10 小时（通过 meeting_pulse_designer.py 测量）
- 每季度审查并更新责任架构图，确保没有任何职能无人负责

---

## 范围与局限性

**范围内**：运营体系选择（EOS、Scaling Up、OKR、Holacracy）、责任架构图、每周记分卡、会议节奏设计、IDS 问题解决、90 天岩石目标、沟通节奏、实施路线图。

**范围外**：OKR 软件配置、项目管理工具设置、敏捷/Scrum 方法论、冲刺规划、产品待办事项管理、人力资源政策制定。

**局限性**：记分卡构建器可以根据提供的数据计算 RAG，但无法从业务系统中获取实时指标。岩石目标跟踪器依赖手动更新状态，无法自动检测是否完成。会议节奏设计器会根据团队规模和会议清单提供建议，但无法将公司特有的文化规范纳入考量。框架比较仅提供方向性参考，实际实施能否成功取决于领导层的投入程度。

---

## 集成点

| 技能 | 集成方式 |
|-------|-------------|
| `ceo-advisor` | CEO 设定愿景，为一年期计划和岩石目标提供依据 |
| `coo-advisor` | 负责会议节奏和问题解决节奏 |
| `cfo-advisor` | 每周记分卡中的财务指标 |
| `cto-advisor` | 工程岩石目标和技术记分卡指标 |
| `chro-advisor` | 记分卡中的人员指标（人员流失率、招聘速度） |
| `culture-architect` | 将文化仪式融入会议节奏 |
| `strategic-alignment` | 验证团队岩石目标是否由公司岩石目标层层分解而来 |
| `change-management` | 新运营体系的推广遵循 ADKAR 模型，以促进采用 |
| `chief-of-staff` | 统筹季度规划会议和 L10 后续跟进 |