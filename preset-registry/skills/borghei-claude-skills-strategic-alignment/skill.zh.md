---
name: strategic-alignment
description: >
  Cascades strategy from boardroom to individual contributor and detects
  misalignment. Use when teams pull in different directions, OKRs don't connect,
  departments optimize locally at company expense, or strategy doesn't translate
  to execution.
license: MIT + Commons Clause
metadata:
  version: 2.0.0
  author: borghei
  category: c-level
  domain: strategic-alignment
  updated: 2026-03-09
  frameworks:
    - articulation-test
    - cascade-mapping
    - orphan-detection
    - conflict-detection
    - silo-diagnosis
    - communication-gap
    - realignment-protocol
    - alignment-scoring
  triggers:
    - strategic alignment
    - strategy cascade
    - OKR alignment
    - orphan OKRs
    - conflicting goals
    - silos
    - communication gap
    - department alignment
    - alignment checker
    - strategy articulation
    - cross-functional alignment
    - goal cascade
    - misalignment
    - alignment score
    - teams pulling in different directions
    - departments not aligned
    - OKRs don't connect
    - local optimization
    - strategy communication
---
# 战略对齐引擎

战略往往不是在董事会会议室里失败的，而是在层层传导中失败的。这项技能可以在错位演变成功能失调之前将其识别出来，并构建相应的机制，使战略从 CEO 到每一位一线贡献者始终保持一致。

## 关键词

战略对齐、战略传导、OKR 对齐、孤立 OKR、目标冲突、部门壁垒、沟通差距、部门对齐、战略表述、跨职能对齐、目标传导、错位、对齐评分、局部优化、战略沟通、传导映射

---

## 对齐问题

**一个目标距离制定它的战略越远，就越不可能反映最初的意图。**

这就是组织中的传话游戏。它发生在每一个层级。问题在于它有多严重，以及该如何解决。

```
CEO says: "We need to win the mid-market healthcare segment"
VP hears: "Healthcare is the priority"
Director translates: "Build healthcare features"
Team executes: "Add HIPAA compliance checkbox to the roadmap"
IC works on: "HIPAA feature that nobody asked for and doesn't close deals"

Result: Effort spent, strategy not advanced.
```

---

## 先澄清

在生成内容之前，请确认以下输入。如果其中任何一项未知或含糊，请提问——不要自行假设：

- [ ] **需要哪种交付成果**（完整诊断、传导映射、部门壁垒诊断、沟通差距分析或研讨会议程）——每一种都使用框架中的不同步骤
- [ ] **用一句话表述当前战略**——对齐情况需要以战略源头为基准进行检验；如果战略本身含糊不清，应先解决这个问题，再进行传导
- [ ] **公司、团队和个人层面的实际目标/OKR**——检测孤立目标、目标冲突和覆盖缺口需要真实的传导链，而不是假设的传导链
- [ ] **公司规模和组织结构**——对于大型组织或矩阵式组织，需要调整五人测试和层级式传导的假设

停止规则：只询问对输出影响最大的 2-3 个问题。如果用户说“直接起草”，则继续执行，并在交付成果顶部列出你的假设。

---

## 第 1 步：战略表述测试

在检查传导之前，先检查源头。

### 五人测试

询问来自五个不同团队的五个人：

> “公司当前最重要的战略优先事项是什么？”

| 结果 | 评分 | 诊断 |
|--------|-------|-----------|
| 5 人的回答完全相同 | 10/10 | 表述清晰。检查传导情况。 |
| 4 人的回答相似 | 7-8/10 | 基本一致。进一步向回答不同的人澄清。 |
| 3 人意见一致 | 5-6/10 | 对齐较为松散。重新沟通。 |
| 2 人意见一致 | 2-4/10 | 战略不明确。先修正，再进行传导。 |
| 无人达成一致 | 0-1/10 | 不存在共同战略。从这里开始。 |

### 战略格式测试

战略必须能够用一句话表述。

| 格式 | 评分 |
|--------|-------|
| 一句清晰的话 | 良好 |
| 两句话 | 可接受 |
| 一个段落 | 过于复杂，难以传导 |
| 一份文档 | 过于复杂，难以内化 |

**示例**：

| 差的表述 | 原因 | 好的表述 |
|-----|-----|------|
| “专注增长，同时维护企业客户关系、拓展国际市场并投资平台” | 四个优先事项 = 没有优先事项 | “在 B 轮融资前赢得 DACH 地区的中端医疗保健市场” |
| “在我们所做的领域做到最好” | 无法证伪 | “在 Q4 前实现 $5M ARR，并使 NRR 达到 110%+” |
| “以客户为先的创新方法” | 听起来不错，但毫无实际意义 | “交付排名前 10 的潜在客户所要求的工作流自动化功能” |

---

## 第 2 步：级联映射

梳理公司战略逐级贯穿每个组织层级的路径。

### 级联可视化

```
Company Level:  Strategy Statement
                    |
                Company OKR-1    Company OKR-2    Company OKR-3
                    |                 |                 |
Dept Level:    Sales OKRs       Eng OKRs         Product OKRs
                    |                 |                 |
Team Level:    Team A OKRs      Team B OKRs       Team C OKRs
                    |                 |                 |
Individual:    Personal goals    Personal goals    Personal goals
```

### 级联验证问题

针对每个层级的每项目标：

| 问题 | 目的 |
|----------|---------|
| 这支持哪项公司目标？ | 检验向上关联 |
| 如果 100% 达成，它能在多大程度上推动上级目标？ | 检验影响的显著性 |
| 这种关联是直接的还是理论上的？ | 检验影响的直接程度 |
| 还有谁在为同一个上级目标努力？ | 检验覆盖范围和重叠情况 |

---

## 第 3 步：发现对齐失败

需要发现三种失败模式：

### 模式 1：孤立目标

与任何公司级目标都没有关联的目标。

| 表现 | 根本原因 | 修复方法 |
|---------|-----------|-----|
| “我们整个季度都在做这件事，却没有人在意” | 目标自下而上制定，但未进行协调统一 | 建立关联或将其删除。每个目标都需要一个上级目标。 |
| 团队为取得的成果感到自豪，但领导层毫不知情 | 对成功的定义未对齐 | 在季度开始前明确进行级联映射 |
| 延续上季度的个人目标 | 出于惯性，而非明确意图 | 每季度重新进行级联 |

### 模式 2：目标冲突

两个团队的目标在同时成功达成时，反而会导致更糟糕的结果。

| 示例 | 冲突 | 修复方法 |
|---------|----------|-----|
| 销售：最大化新增客户数 / CS：最大化 NPS | 销售签下不匹配的客户，导致 CS 受损 | 共同目标：获得能够留存的合格新增客户 |
| 产品：快速发布 / 安全：零漏洞 | 速度与质量之间存在矛盾 | 共同 SLA：在 X 天内完成发布并通过 Y 项安全检查 |
| 市场营销：最大化潜在客户数 / 销售：签下企业客户 | 市场营销针对数量进行优化，而销售需要的是质量 | 共同指标：合格销售管道金额，而非潜在客户数量 |

### 模式 3：覆盖缺口

公司有 3 项 OKR。5 个团队支持 OKR-1，2 个团队支持 OKR-2，0 个团队支持 OKR-3。

| 检测方式 | 影响 | 修复方法 |
|-----------|--------|-----|
| 某项公司 OKR 持续未达成，而其他 OKR 均已达成 | 实际上没有人负责这项未达成的 OKR | 为每项公司 OKR 明确指派负责团队 |
| 资源分配与优先级不匹配 | 最高优先事项资源不足 | 使资源与声明的优先事项保持一致 |
| 战略表明 X 很重要，但没有任何团队的目标体现这一点 | 战略停留在愿景层面，未落实到运营层面 | 将战略转化为有明确负责团队的团队目标 |

---

## 第 4 步：孤岛诊断

当团队以牺牲公司指标为代价来优化局部指标时，就会形成孤岛。

### 孤岛检测矩阵

| 信号 | 评分（1-5） | 权重 |
|--------|-------------|--------|
| 部门达成目标，但公司未达成目标 | 5 = 总是如此 | 25% |
| 团队不了解其他团队的优先事项 | 5 = 从不了解 | 20% |
| 经常出现“那不是我们的问题” | 5 = 每天出现 | 20% |
| 跨职能升级只能逐级向上反映 | 5 = 总是如此 | 15% |
| 相互依赖的团队之间不共享数据 | 5 = 从不共享 | 10% |
| 跨职能项目耗时达到预期的 3 倍 | 5 = 总是如此 | 10% |

**得分 30+**：严重的信息孤岛。需要立即干预。
**得分 20-29**：中度信息孤岛。应在下一季度解决。
**得分 10-19**：轻微协作障碍。持续监测并解决特定热点问题。
**得分 < 10**：跨职能运作健康。

### 信息孤岛的根本原因及解决方案

| 根本原因 | 解决方案 | 负责人 |
|-----------|-----|-------|
| 激励机制不一致 | 在团队协作的环节设立共同目标 | CEO + COO |
| 缺乏共同目标 | 为每对存在协作关系的团队增加 1 个跨职能 OKR | COO |
| 缺乏共同语言 | 每月开展跨职能成果展示与交流 | 文化架构师 |
| 地理位置/时区 | 有意识地安排异步协作重叠时段，并每季度举行线下活动 | COO + CHRO |
| 组织设计 | 考虑重组，以减少工作交接 | CEO + CHRO |

---

## 第 5 步：沟通差距分析

CEO 所表达的并非团队实际听到的内容。差距会随着公司规模的扩大而加剧。

### 信息衰减模型

```
CEO communicates strategy
  |
  v [10-20% loss]
VP interprets through their lens
  |
  v [10-20% loss]
Manager translates for team
  |
  v [10-20% loss]
IC receives modified version
  |
  v [10-20% loss]
IC interprets further based on daily work

Total signal loss: 40-80% from CEO to IC
```

### 沟通差距的来源

| 来源 | 识别方式 | 解决方案 |
|--------|-----------|-----|
| 模糊不清 | 不同团队有不同的理解 | 让战略足够具体，以至于有可能被证明是错误的 |
| 频率不足 | 只说一次，却期望大家牢记 | 通过不同渠道将战略重复传达 7 次 |
| 媒介不匹配 | 为视觉型思考者提供书面文档 | 使用多种形式（书面、视觉、口头） |
| 信任缺失 | 团队不相信战略会真正落实 | 通过资源配置证明战略是认真的 |
| 信息过滤 | 管理者对信息进行删改 | 越级沟通 + 全员大会 |

---

## 第 6 步：重新对齐流程

如何在不制造恐惧的情况下纠正错位。

### 重新对齐决策树

```
START: Misalignment detected
  |
  v
[Is the problem at the strategy level or the cascade level?]
  |
  +-- STRATEGY (Step 1 failed)
  |     --> CEO rewrites strategy as one sentence
  |     --> Re-communicate through all channels
  |     --> Re-run 5-person test after 2 weeks
  |
  +-- CASCADE (Step 2-3 failures)
  |     |
  |     v
  |   [Which failure pattern?]
  |     |
  |     +-- Orphan goals --> Connect or cut workshop
  |     +-- Conflicting goals --> Cross-functional OKR review
  |     +-- Coverage gaps --> Assign explicit ownership
  |
  +-- SILOS (Step 4)
  |     --> Fix incentives first
  |     --> Add shared metrics
  |     --> Consider org design change
  |
  +-- COMMUNICATION (Step 5)
        --> Increase frequency (weekly, not quarterly)
        --> Add skip-level communication
        --> Show resource proof (money follows words)
```

### 重新对齐工作坊（半天）

```
Agenda:
  1. CEO restates strategy (15 min)
  2. Each dept maps their goals to strategy (45 min)
  3. Identify orphans, conflicts, gaps together (30 min)
  4. Fix orphans: connect or cut (30 min)
  5. Fix conflicts: shared metrics or priority resolution (30 min)
  6. Fix gaps: assign ownership (15 min)
  7. Communication plan (15 min)
```

---

## 对齐评分

快速健康检查。为每个领域按 0-10 分评分。

| 领域 | 问题 | 得分 |
|------|----------|-------|
| 战略清晰度 | 来自不同团队的 5 个人能否一致地表述战略？ | /10 |
| 级联完整性 | 所有团队目标是否都与公司目标相关联？ | /10 |
| 冲突检测 | 是否已审查并解决跨团队的 OKR 冲突？ | /10 |
| 覆盖度 | 每个公司 OKR 是否都有明确的负责团队？ | /10 |
| 沟通 | 团队的行为是否体现了战略？ | /10 |

### 评分解读

| 总分（/50） | 状态 | 行动 |
|-------------|--------|--------|
| 45-50 | 优秀 | 维持现有体系。每季度检查一次即可。 |
| 35-44 | 良好 | 在下一个 OKR 周期中解决具体的薄弱领域。 |
| 20-34 | 对齐偏差正在造成损失 | 立即关注。在 2 周内召开研讨会。 |
| < 20 | 战略漂移 | 采取危机级干预措施。由 CEO 牵头重新对齐。 |

---

## 季度对齐检查

通过季度检查防止问题再次发生：

| 活动 | 时间 | 参与者 | 时长 |
|----------|------|-----|----------|
| 5 人战略表述测试 | 季度第 1 周 | 从各层级随机选取 | 15 分钟 |
| 级联图审查 | 第 1 周 | 领导团队 | 1 小时 |
| 冲突扫描 | 第 1 周 | COO + 部门负责人 | 30 分钟 |
| 覆盖度审计 | 第 1 周 | COO | 30 分钟 |
| 部门壁垒脉搏检查 | 第 2 周 | 跨职能调查 | 5 分钟调查 |
| 向 CEO 汇报 | 第 2 周 | COO 或幕僚长 | 15 分钟演示 |

---

## 危险信号

- 团队持续达成目标，而公司未达成指标——局部优化
- 跨职能项目耗时达到预期的 3 倍——协调失败
- 战略每季度更新，但团队优先事项没有变化——级联机制失效
- 团队层面出现“那是领导层的问题”——责任缺口
- 新举措未与现有 OKR 建立关联——战略漂移
- 部门负责人针对人员规模或预算进行优化，而非公司成果——激励机制错位
- 相同的对齐问题每个季度反复出现——这是系统性问题，而非一次性修复即可解决
- 没有人能说出公司的首要任务——战略未得到有效传达

---

## 与高管团队协作

| 当…… | 与……协作 | 以便…… |
|---------|-------------|-------|
| 制定新战略时 | CEO + COO | 在宣布前将其级联为关键任务 |
| OKR 周期开始时 | COO（`coo-advisor`） | 在最终确定前检查跨团队冲突 |
| 团队未达成目标时 | CHRO（`chro-advisor`） | 诊断：是能力缺口还是对齐缺口？ |
| 发现部门壁垒时 | COO | 设计共享指标或跨职能 OKR |
| 并购后 | CEO + 文化架构师 | 检测合并实体之间的战略冲突 |
| 季度规划时 | 公司运营系统（`company-os`） | 将对齐检查纳入规划节奏 |
| 推行变革时 | 变革管理（`change-management`） | 确保变革与战略保持一致 |

---

## 输出成果

| 请求 | 交付成果 |
|---------|-------------|
| “检查我们的对齐情况” | 包含对齐评分的完整 6 步诊断 |
| “我们的 OKR 是否对齐？” | 标明无归属项、冲突和缺口的级联图 |
| “我们存在部门壁垒” | 包含根本原因和具体修复措施的部门壁垒诊断 |
| “战略没有转化为执行” | 沟通缺口分析 + 修复计划 |
| “组织一次对齐研讨会” | 研讨会议程 + 引导指南 |
| “季度对齐检查” | 季度检查流程 + 报告模板 |

---

## 故障排除

| 问题 | 可能原因 | 解决方案 |
|---------|-------------|------------|
| 尽管已有战略，5 人测试得分仍低于 5/10 | 战略过于复杂、过于模糊，或只传达了一次 | 将战略改写为一句可证伪的话；通过 7 种以上渠道进行传达；每周重复一次，持续 4 周，然后重新测试 |
| 级联图显示存在孤立目标，但团队拒绝将其取消 | 团队对进行中的工作有情感依赖；沉没成本谬误 | 将其定义为“关联或取消”：每个目标都必须有一个上级 OKR；如果不存在上级 OKR，则要么建立关联，要么停止这项工作 |
| 已识别出相互冲突的目标，但未能达成解决方案 | 部门负责人不愿妥协；激励机制不一致 | 上报 CEO，由其做出优先级决策；创建由两个团队共同负责的共享指标；使用平衡计分卡进行视角对齐 |
| 信息孤岛得分高于 30，但没有人承认存在问题 | 每个孤岛内部运作良好；问题只出现在交界处 | 展示跨职能项目数据：耗时达到预期的 3 倍；说明交接失败对客户造成的影响；使用战略地图进行可视化 |
| 尽管增加了沟通频率，沟通差距仍然存在 | 媒介不当、传达者不当，或信息过于抽象 | 采用不同的沟通形式（书面、视觉、口头）；开展跨级沟通；用资源分配来证明战略（“资金流向与口头承诺一致”） |
| 对齐研讨会产生的行动事项从未得到落实 | 缺乏跟进机制；研讨会被当作一次性活动，而非持续过程 | 在研讨会期间为每个行动事项指定负责人和截止日期；在下一次每周领导层会议上审查；跟踪完成率 |
| 季度对齐检查沦为走过场 | 对不对齐没有任何后果；诊断结果未与决策挂钩 | 将对齐得分与 OKR 周期规划挂钩；必须先处理红色对齐领域，才能最终确定新的 OKR |

---

## 成功标准

- 在战略传达后的 30 天内，5 人表述测试得分达到 8/10 或更高
- 季度级联映射审查后，不再存在任何孤立目标
- 所有已识别的目标冲突均在 2 周内形成包含共享指标的书面解决方案
- 信息孤岛检测得分保持在 20 以下（轻微摩擦或健康状态），并连续维持 3 个季度
- 沟通差距分析显示，从 CEO 到 IC 层级的信号损失低于 30%（通过战略理解度调查衡量）
- 对齐得分（5 个领域，满分 50）达到或高于 35，并保持稳定或呈改善趋势
- 每个季度的对齐检查均在该季度前 2 周内完成

---

## 范围与局限性

- **范围内：** 战略表述测试、级联映射与验证、孤立目标检测、冲突目标识别、覆盖缺口分析、信息孤岛诊断、沟通差距分析、重新对齐协议、对齐评分、季度检查节奏
- **范围外：** OKR 编写和目标设定方法（使用项目管理或 Company OS 技能）；个人绩效管理（使用 CHRO Advisor）；战略制定（使用 CEO Advisor——此技能假定战略已经存在，并测试其级联情况）
- **局限性：** 对齐诊断是针对特定时间点的评估；对齐会持续退化，因此需要按季度维护
- **局限性：** 5 人测试是一种启发式方法，并非统计学上严谨的调查；对于人数超过 200 人的组织，应辅以更广泛的脉搏调查
- **局限性：** 信息孤岛检测矩阵依赖自报数据；应辅以客观衡量指标（跨职能项目时间线、问题升级模式）
- **局限性：** 该框架假定采用分层式 OKR 级联；矩阵型组织和扁平化结构可能需要调整级联映射方法

---

## 集成点

| 技能 | 集成方式 | 数据流 |
|-------|-------------|-----------|
| `ceo-advisor` | 必须先有战略，才能检验对齐情况 | CEO 战略声明 → 对齐阐述测试 |
| `coo-advisor` | 运营部门负责对齐节奏和跨职能 OKR | 对齐冲突 → COO 共享指标设计 |
| `company-os` | 将对齐检查纳入规划节奏 | 对齐节奏 → Company OS 季度周期 |
| `chief-of-staff` | CoS 负责主持对齐研讨会并跟踪后续落实情况 | 对齐行动项 → CoS 跟踪 |
| `culture-architect` | 信息孤岛既是结构性问题，也是文化问题 | 对齐孤岛诊断 → 文化干预 |
| `change-management` | 战略变更需要更新对齐级联 | 变更计划 → 对齐重新级联 |
| `org-health-diagnostic` | 运营健康维度反映对齐质量 | 健康运营评分 → 对齐优先级 |
| `internal-narrative` | 战略沟通取决于叙事的清晰度 | 对齐沟通差距 → 叙事改进 |

---

## Python 工具

| 工具 | 用途 | 用法 |
|------|---------|-------|
| `scripts/okr_cascade_validator.py` | 验证团队 OKR 是否与公司 OKR 相关联，并检测孤立项、冲突和覆盖缺口 | `python scripts/okr_cascade_validator.py --company-okrs company_okrs.csv --team-okrs team_okrs.csv --json` |
| `scripts/strategy_map_generator.py` | 生成平衡计分卡战略地图，关联财务、客户、流程和学习视角 | `python scripts/strategy_map_generator.py --objective "Win mid-market healthcare in DACH" --financial "5M ARR by Q4" --customer "NPS > 40" --process "Ship workflow automation" --learning "Hire 3 healthcare domain experts" --json` |
| `scripts/alignment_scorer.py` | 计算 5 个维度的对齐评分，并提供趋势跟踪和建议 | `python scripts/alignment_scorer.py --clarity 8 --cascade 6 --conflicts 7 --coverage 5 --communication 6 --previous-score 28 --json` |