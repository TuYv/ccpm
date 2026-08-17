---
name: knowledge-consolidation
description: Build frameworks from scattered insights across all braindumps and notes
roles: [all]
integrations: []
---
# COG 知识整合技能

## 目的
通过模式识别和系统化综合，将脑力倾倒、每日简报和签到中零散的洞见转化为连贯的框架和“单一事实来源”知识文档。

## 何时调用
- 用户希望整合自己的洞见
- 用户说“整合知识”“构建框架”“综合洞见”
- 需要进行定期知识库维护时（每周、每月、每季度）
- 用户希望从积累的脑力倾倒内容中提取模式
- 在做出可受益于框架参考的重大决策之前

## 智能体模式感知

**检查 `00-inbox/MY-PROFILE.md` frontmatter 中的 `agent_mode`：**
- 如果是 `agent_mode: team` —— 将扫描和模式提取委派给并行子智能体（例如，每个领域一个：个人脑力倾倒、专业脑力倾倒、特定项目内容、每日简报）。每个智能体识别主题和模式，然后由一个综合智能体将发现整合为框架。
- 如果是 `agent_mode: solo`（默认）—— 直接处理所有扫描、模式识别和框架构建工作。不进行委派。

## 执行前检查

**获取当前时间戳（生成任何文件前均为必需）：**

1. 使用 Bash 运行 `date '+%Y-%m-%d %H:%M'`，获取实际的当前日期和时间
2. 存储此值，并将其用于 `created:` frontmatter 字段
3. 绝不猜测或编造时间——始终使用 `date` 命令返回的值

## 流程

### 1. 数据收集

**扫描知识库中尚未处理或仅部分处理的内容：**

- 自上次整合以来的所有脑力倾倒：
  - `02-personal/braindumps/`
  - `03-professional/braindumps/`
  - `04-projects/*/braindumps/`
  - `00-inbox/braindump-*.md`（混合领域）

- 每日简报和签到：
  - `01-daily/briefs/`
  - `01-daily/checkins/`

- 以下位置中的所有会议记录或项目文档：
  - `04-projects/*/planning/`
  - `04-projects/*/resources/`

**确定范围：**
- 询问用户：“我应该分析哪个时间段？（上周、上个月、上季度、所有时间，还是自定义范围？）”
- 识别尚未处理的内容（检查是否存在 `status: "captured"` 或缺少整合元数据）

**收集统计信息：**
- 待分析文档总数
- 按领域和类型细分
- 覆盖的日期范围

### 2. 模式识别

对所有内容进行系统化模式检测：

#### 频率分析
**哪些内容反复出现？**
- 识别在多份文档中提及的主题
- 跟踪主题频率和聚类情况
- 识别持续存在的问题或疑虑
- 发现反复出现的行动项或决策

#### 时间聚类
**哪些洞见是同时出现的？**
- 按时间段对相关洞见进行分组
- 识别思维如何随时间演变
- 识别思维发生转变的拐点
- 梳理触发变化的催化因素

#### 领域关联
**哪些模式跨越了不同领域？**
- 影响专业思考的个人洞见
- 应用于项目的专业经验
- 影响个人成长的项目经历
- 贯穿所有领域的战略主题

#### 矛盾分析
**思维在哪些方面存在冲突？**
- 识别相互矛盾的想法或方法
- 区分演变与不一致
- 理解矛盾的解决或持续存在的张力
- 追踪观点随时间发生的变化

#### 跨维度模式
**贯穿所有维度的元模式：**
- 决策方法
- 问题解决策略
- 学习模式
- 情绪/精力模式
- 关系模式
- 创造性过程

### 3. 框架构建

将模式综合为可付诸行动的框架：

#### 识别核心原则
**从零散洞见提炼出基本真理：**
- 哪些模式揭示了更深层的原则？
- 形成了哪些规则或启发式方法？
- 正在形成哪些心智模型？
- 哪些策略被证明是有效的？

#### 依据证据进行检验
**使用源材料验证框架：**
- 源洞见是否支持这些原则？
- 是否存在反例或例外？
- 我们可以对这一框架抱有多大信心？
- 它的边界条件是什么？

#### 界定边界
**框架何时适用/不适用？**
- 这一框架适用于哪些情境？
- 它有哪些局限性？
- 哪些情况下不应使用它？
- 它依赖哪些假设？

#### 创建应用方式
**如何使用这一框架：**
- 具体用例
- 决策应用
- 问题解决模板
- 实际实施步骤

### 4. 知识整合

更新并创建知识库文档：

#### 更新现有框架

对于每个需要更新的框架：

```markdown
---
type: "consolidated-knowledge"
domain: "[primary-domain]"
framework: "[framework-name]"
created: "[original-date]"
last_updated: "YYYY-MM-DD"
consolidation_id: "[consolidation-session-id]"
source_documents: [count]
status: "stable|working|emerging"
tags: ["#framework", "#consolidated", "#[topic]"]
---

# [Framework Name]

## Framework Overview
[Clear description of what this framework is and what it helps with]

**Status:** [Stable | Working | Emerging]
**Last Updated:** [Date]
**Source Insights:** [count] documents analyzed

---

## Core Principles

### Principle 1: [Name]
**Statement:** [Clear, concise principle statement]

**Evidence:**
- [[braindump-YYYY-MM-DD]] - [supporting insight]
- [[daily-brief-YYYY-MM-DD]] - [supporting evidence]
- [[checkin-YYYY-MM-DD]] - [pattern observation]

**Evolution:** [How this principle has developed or been refined]

**Confidence:** [High|Medium|Low] - [reasoning]

### Principle 2: [Name]
[Same structure as Principle 1]

### Principle 3: [Name]
[Same structure as Principle 1]

---

## Applications & Use Cases

### Use Case 1: [Scenario]
**When to Apply:** [Specific situation]

**How to Apply:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Outcomes:** [What to expect]

**Example:** [Real example from user's experience]

### Use Case 2: [Scenario]
[Same structure as Use Case 1]

---

## Boundaries & Limitations

**This framework works when:**
- [Condition 1]
- [Condition 2]
- [Condition 3]

**This framework does NOT work when:**
- [Anti-condition 1]
- [Anti-condition 2]
- [Anti-condition 3]

**Common Pitfalls:**
- [Pitfall 1 to avoid]
- [Pitfall 2 to avoid]

---

## Evolution & History

### [Date Range 1]: [Initial Development]
**What Emerged:** [How this framework first appeared]

**Catalysts:**
- [Event or insight that triggered initial thinking]

**Early Insights:**
- [[link]] - [early thought]
- [[link]] - [formative insight]

### [Date Range 2]: [Refinement Phase]
**What Changed:** [How framework evolved]

**New Evidence:**
- [[link]] - [supporting experience]
- [[link]] - [refining insight]

**Adjustments Made:**
- [Change 1]
- [Change 2]

### Current State: [Date]
**Current Understanding:** [Latest refined version]

**Recent Validation:**
- [[link]] - [recent application]
- [[link]] - [current evidence]

---

## Related Frameworks

- [[framework-2]] - [How they relate]
- [[framework-3]] - [Connection or overlap]
- [[framework-4]] - [When to use which]

---

## Future Development

**Questions for Deeper Exploration:**
- [Question 1 to investigate]
- [Question 2 needing more evidence]

**Potential Extensions:**
- [Area 1 for expansion]
- [Area 2 for integration]

**Watch For:**
- [Pattern 1 to monitor]
- [Signal 2 that might invalidate or refine]

---

*Consolidated from [X] sources | Confidence: [High/Medium/Low] | Status: [Stable/Working/Emerging]*
```

保存至：`05-knowledge/consolidated/[framework-name]-framework.md`

#### 创建新框架

对于新识别出的框架：

```markdown
---
type: "consolidated-knowledge"
domain: "[primary-domain]"
framework: "[framework-name]"
created: "YYYY-MM-DD"
last_updated: "YYYY-MM-DD"
consolidation_id: "[consolidation-session-id]"
source_documents: [count]
status: "emerging"
tags: ["#framework", "#consolidated", "#new", "#[topic]"]
---

# [New Framework Name]

## Framework Discovery

**Identified:** [Date]
**Based On:** [X] insights from [timeframe]
**Domain:** [Primary domain with cross-domain applications]

**Discovery Context:**
[What pattern recognition revealed this framework]

---

## Core Principles

[Same structure as framework updates above]

---

[Continue with Applications, Boundaries, Evolution sections...]
```

保存至：`05-knowledge/consolidated/[framework-name]-framework.md`

#### 更新模式文档

```markdown
---
type: "pattern-analysis"
pattern: "[pattern-name]"
created: "YYYY-MM-DD"
domains: ["domain1", "domain2"]
frequency: "[high|medium|low]"
tags: ["#pattern", "#analysis"]
---

# Pattern: [Pattern Name]

## Pattern Description
[Clear description of the recurring pattern]

**Frequency:** Appeared in [X] documents over [timeframe]

**Domains:** [Which domains this pattern appears in]

**Significance:** [Why this pattern matters]

---

## Occurrences

### [Date 1] - [[source-document-1]]
**Context:** [What was happening]

**Manifestation:** [How pattern appeared]

**Outcome:** [What resulted]

### [Date 2] - [[source-document-2]]
[Same structure]

### [Date 3] - [[source-document-3]]
[Same structure]

---

## Analysis

**What Triggers This Pattern:**
- [Trigger 1]
- [Trigger 2]
- [Trigger 3]

**What Follows This Pattern:**
- [Consequence 1]
- [Consequence 2]

**Cross-Domain Implications:**
[How this pattern affects different areas]

**Potential Actions:**
- [Action to amplify if positive]
- [Action to mitigate if negative]
- [Action to understand better]

---

## Evolution Over Time

[How this pattern has changed or stayed consistent]

---

*Pattern identified through consolidation of [X] sources*
```

保存至：`05-knowledge/patterns/pattern-[name].md`

#### 创建时间线条目

```markdown
---
type: "timeline-entry"
topic: "[major-theme-or-shift]"
date_range: "YYYY-MM-DD to YYYY-MM-DD"
created: "YYYY-MM-DD"
tags: ["#timeline", "#evolution", "#thinking"]
---

# Thinking Evolution: [Major Theme/Shift]

## Timeline Period
**From:** [Start Date]
**To:** [End Date]
**Duration:** [X weeks/months]

---

## What Changed

**Initial State:**
[How thinking/approach started]

**End State:**
[Where thinking/approach ended up]

**Key Shift:**
[The fundamental change that occurred]

---

## Catalysts & Triggers

### [Date] - [Trigger Event 1]
**Source:** [[link-to-document]]

**What Happened:** [Description]

**Impact:** [How this triggered change]

### [Date] - [Trigger Event 2]
[Same structure]

---

## Evidence Trail

### Early Thinking: [Date Range]
- [[YYYY-MM-DD]] - [Initial thoughts]
- [[YYYY-MM-DD]] - [Early explorations]

### Intermediate Development: [Date Range]
- [[YYYY-MM-DD]] - [Evolving understanding]
- [[YYYY-MM-DD]] - [Testing and refinement]

### Current Understanding: [Date Range]
- [[YYYY-MM-DD]] - [Mature thinking]
- [[YYYY-MM-DD]] - [Latest application]

---

## Impact of This Evolution

**On Decisions:**
[How this shift affects decision-making]

**On Strategies:**
[How this shift affects strategic approach]

**On Frameworks:**
[Which frameworks were created or updated]

**On Actions:**
[What changed in behavior or practice]

---

## Lessons Learned

**What This Evolution Teaches:**
- [Learning 1]
- [Learning 2]
- [Learning 3]

**Future Implications:**
[What this suggests for future development]

---

*Timeline constructed from [X] source documents spanning [timeframe]*
```

保存至：`05-knowledge/timeline/[topic]-evolution-YYYY-MM.md`

### 5. 生成整合报告

创建整合主文档：

```markdown
---
type: "knowledge-consolidation"
domain: "integrated"
date: "YYYY-MM-DD"
consolidation_period: "YYYY-MM-DD to YYYY-MM-DD"
created: "YYYY-MM-DD HH:MM"
sources_analyzed: [number]
frameworks_updated: ["framework1", "framework2"]
frameworks_created: ["new-framework1"]
patterns_identified: [number]
tags: ["#consolidation", "#knowledge", "#frameworks"]
---

# Knowledge Consolidation - [Date]

## Executive Summary

**Period Analyzed:** [Start date] to [End date]

**Documents Processed:**
- [X] braindumps
- [X] daily briefs
- [X] weekly check-ins
- [X] project documents

**Major Outcomes:**
- **Frameworks Updated:** [count] - [list]
- **New Frameworks Created:** [count] - [list]
- **Patterns Identified:** [count]
- **Timeline Entries:** [count]

**Key Insights Synthesized:**
1. [Major insight 1]
2. [Major insight 2]
3. [Major insight 3]

---

## Processing Statistics

- **Total documents analyzed:** [number]
- **Date range:** [start] to [end]
- **Domains covered:** [list]
- **New patterns identified:** [number]
- **Frameworks updated:** [number]
- **New frameworks created:** [number]
- **Timeline entries added:** [number]
- **Archive actions taken:** [number]

---

## Major Themes This Period

### Theme 1: [Name]
**Frequency:** Appeared in [X] documents

**Evolution:** [How thinking evolved]

**Key Insights:**
- [[source]] - [insight 1]
- [[source]] - [insight 2]
- [[source]] - [insight 3]

**Framework Implications:**
[How this theme affected or created frameworks]

**Status:** [Stable understanding | Still exploring | Needs more evidence]

### Theme 2: [Name]
[Same structure as Theme 1]

---

## Frameworks Updated

### Framework 1: [Name]
**Location:** [[05-knowledge/consolidated/[filename]]]

**What Changed:**
- [Addition/modification 1]
- [Addition/modification 2]

**New Evidence Added:**
- [[source]] - [insight]
- [[source]] - [insight]

**Confidence Change:** [Before] → [After]

**New Applications:**
- [Use case 1]
- [Use case 2]

### Framework 2: [Name]
[Same structure]

---

## New Frameworks Created

### New Framework: [Name]
**Location:** [[05-knowledge/consolidated/[filename]]]

**Created:** Based on [X] insights from [timeframe]

**Core Principles:**
1. [Principle 1]
2. [Principle 2]
3. [Principle 3]

**Primary Use Cases:**
- [Use case 1]
- [Use case 2]

**Status:** Emerging (needs more evidence and validation)

**Future Development:**
[What's needed to mature this framework]

---

## Patterns Identified

### Pattern 1: [Name]
**Frequency:** [High|Medium|Low]

**Domains:** [Which domains]

**Description:** [What the pattern is]

**Implications:** [Why it matters]

**Documentation:** [[05-knowledge/patterns/[filename]]]

### Pattern 2: [Name]
[Same structure]

---

## Thinking Evolution

### Major Shift: [Topic]
**Timeline:** [Date range]

**What Changed:** [Description]

**Catalysts:**
- [Event 1]
- [Event 2]

**Impact:**
[How this shift affects frameworks, decisions, actions]

**Documentation:** [[05-knowledge/timeline/[filename]]]

---

## Cross-Cutting Insights

**Connections Across Domains:**
- [Cross-domain insight 1]
- [Cross-domain insight 2]
- [Cross-domain insight 3]

**Contradictions Identified:**
- [Contradiction 1] - [Resolution approach]
- [Contradiction 2] - [Still unresolved]

**Strategic Implications:**
[Higher-level observations about trajectory and direction]

---

## Knowledge Base Maintenance

### Updates Made
- ✅ Updated framework: [name]
- ✅ Created new framework: [name]
- ✅ Documented pattern: [name]
- ✅ Added timeline entry: [topic]
- ✅ Archived outdated insights: [list]

### Archive Actions
**Braindumps Processed:**
- Updated metadata from `status: "captured"` to `status: "consolidated"`
- Added consolidation references: `consolidated_in: "[[consolidation-YYYY-MM-DD]]"`

**Superseded Content:**
- Archived: [list of old framework versions or outdated insights]
- Location: `00-inbox/archive/`

---

## Future Consolidation Needs

### Ready for Framework Creation
- [ ] [Area 1] - Sufficient evidence gathered - Target: [date]
- [ ] [Area 2] - Pattern established - Target: [date]

### Needs Deeper Analysis
- [ ] [Area 3] - Contradictions to resolve - Target: [date]
- [ ] [Area 4] - Emerging but not yet clear - Target: [date]

### Monitoring Required
- [ ] [Pattern 1] - Watch for additional occurrences
- [ ] [Theme 2] - Track evolution over next [period]

---

## Quality Assessment

**Completeness:** [All relevant insights processed?]

**Coherence:** [Frameworks logically consistent?]

**Traceability:** [Clear links to source material?]

**Actionability:** [Frameworks applicable to decisions?]

**Evolution Documented:** [Thinking progression captured?]

---

## Next Steps

**Immediate Actions:**
- [Action 1 based on consolidation insights]
- [Action 2 to apply new frameworks]

**Future Consolidation:**
- **Next Consolidation:** [Suggested date]
- **Focus Areas:** [What to emphasize next time]

**Framework Applications:**
- [Decision 1 that could benefit from framework]
- [Situation 2 to apply framework to]

---

*Consolidation completed: [Date] | Processed [X] documents | Created/updated [X] frameworks*
```

保存到：`05-knowledge/consolidated/consolidation-YYYY-MM-DD.md`

### 6. 清理与归档

**标记已处理的灵感速记：**
更新已处理灵感速记中的 frontmatter：
```yaml
status: "consolidated"
consolidated_in: "[[consolidation-YYYY-MM-DD]]"
consolidated_date: "YYYY-MM-DD"
```

**归档过时内容：**
将已被取代的框架或洞见移动到：
`00-inbox/archive/[filename]-archived-YYYY-MM-DD.md`

添加说明，解释归档原因以及由什么内容取代。

**维护整洁的知识库：**
- 在保留重要上下文的同时消除冗余
- 更新交叉引用
- 修复失效链接
- 确保标签一致

### 7. 确认完成

整合完成后：
- 向用户显示：“知识整合完成！已处理 [X] 份文档”
- 重点显示：“已更新 [X] 个框架，新建 [X] 个框架”
- 显示：“整合报告已保存至 [file path]”
- 建议审阅已创建或更新的关键框架
- 主动提出可详细解释任何特定框架

## 循环工程

整合是一个**带有完整性审查器的循环提取过程，直到没有新内容可提取为止**，而不是单次扫描。共享词汇请参阅 `.claude/skills/loop-engineering/SKILL.md`。

**循环：**扫描一批范围内的文档 → 提取主题、模式和候选框架原则 → 运行完整性审查器（“是否还有范围内的文档尚未阅读？是否有在 N+ 份文档中反复出现、但尚未被任何框架涵盖的主题？”）→ 如果审查器发现新内容，则再执行一轮提取 → 当连续 2 轮均未发现新内容（干涸）时停止。在 `agent_mode: team` 模式下，第一次扫描会按领域分派，每个领域由一名工作器负责（个人 / 职业 / 各项目 / 简报）；每个工作器仅返回其结论，随后由一次综合处理将其合并。

**验证器（尽可能采用确定性验证）：**
- **可追溯性：**每条框架原则至少链接一份源文档。没有 `[[source]]` 的原则会被丢弃，而不会发布。这是机械式检查，也是 COG 针对整合所采用的验证优先规则。
- **覆盖率：**每份范围内的文档最终都标记为 `status: "consolidated"`，并包含一个 `consolidated_in` 反向链接。
- **去重：**创建框架之前，检查 `05-knowledge/consolidated/`，以便更新现有框架，而不是重复创建。
- 完整性审查器（“我们是否遗漏了某个主题？”）是唯一依赖判断的检查；应明确执行该检查，并将其与证据关联。

**终止条件（分层）：**
- **干涸：**连续 K=2 轮未发现新主题或新文档。
- **覆盖完成：**所有范围内的文档均已标记为已整合。
- **硬性上限：**设置最大提取轮数，使充满噪声的语料库无法无限循环。

**模式：**循环直至干涸（主干）+ 计划—执行—验证（每一轮）+ 编排器—工作器（团队模式下的领域扫描）+ 完整性审查器。

**循环内上下文：**以增量方式编写整合报告，并根据持续维护的集合对新主题进行去重，而不是根据对话进行去重。将内容外部化到报告文件中，正是避免大型语料库超出上下文窗口的关键。

## 整合指南

### 质量优先于数量
- 不要强行提炼尚未成熟的洞见
- 让模式从证据中自然浮现
- 对尚不完整的思考保持耐心
- 高质量的框架需要时间和证据
- 将框架标记为“萌芽中”“实践中”或“稳定”

### 保留细微差异
- 不要过度简化复杂的洞见
- 保留重要的背景和条件
- 注明框架存在的局限性
- 保留尚未解决的矛盾
- 明确承认不确定性

### 保持可追溯性
- 始终链接回源文档
- 展示框架的证据链
- 记录思考的演变过程
- 支持未来的验证或修订
- 让框架主张易于审核

### 动态文档
- 框架应随着新洞见不断演变
- 定期更新胜过追求完美的初稿
- 使用明确的状态标识（萌芽中/实践中/稳定）
- 鼓励迭代和完善
- 通过 Git 记录版本历史

## 分析技术参考

### 模式检测方法
1. **频率分析：** 统计提及次数，对主题进行聚类
2. **时间聚类：** 按时间分组，追踪演变过程
3. **领域关联：** 发现跨领域联系
4. **矛盾分析：** 识别冲突，追踪解决过程
5. **能量模式检测：** 识别情绪和实践模式

### 框架综合流程
1. **识别核心原则：** 提炼基本事实
2. **依据证据检验：** 使用来源进行验证
3. **界定边界：** 确定适用范围
4. **创建应用：** 开发用例
5. **记录演变：** 追踪随时间推移的发展过程

### 时间线构建方法
1. **标记转折点：** 思考发生转变的时刻
2. **识别催化因素：** 触发变化的因素
3. **记录演变：** 理解如何逐步发展
4. **提炼经验：** 演变过程带来的启示

## 成功指标
- 完整性：所有相关洞见均得到处理
- 连贯性：框架在逻辑上保持一致
- 可追溯性：与源材料之间存在清晰链接
- 可操作性：框架能够应用于决策
- 演变性：思考的演进过程得到记录
- 用户价值：框架在实践中得到实际运用

## 常见用例
- **每周整合：** 将一周的洞见整理为模式
- **每月框架开发：** 构建战略框架
- **季度战略综合：** 从全局视角进行整合
- **年度知识库清理：** 保持质量和相关性
- **决策前框架咨询：** 将框架应用于重大决策
- **项目复盘：** 为框架提炼经验

## 理念

知识整合技能体现了 COG 的自我演进智能：
- 将零散的想法转化为战略框架
- 尊重思考随时间推移的演变
- 构建作为“单一事实来源”的动态文档
- 保持可追溯性和基于证据的推理
- 创造可操作的知识，以支持更明智的决策
- 在寻找模式的同时尊重细微差异
- 重视迭代和持续完善