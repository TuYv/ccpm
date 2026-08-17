---
name: daily-brief
description: Generate personalized news intelligence with verified sources (7-day freshness requirement)
roles: [all]
integrations: [web-search]
---
# COG 每日简报 Skill

## 目的
为个性化每日简报查找经过核实的相关新闻，遵循严格的验证标准，并根据用户的具体兴趣和项目分析其战略相关性。

## 何时调用
- 用户想要每日新闻简报
- 用户说“每日简报”“新闻”“发生了什么”“晨间简报”
- 用户希望持续了解其关注领域的最新动态
- 晨间例行流程或定期查看时间

## Agent 模式感知

**检查 `00-inbox/MY-PROFILE.md` frontmatter 中的 `agent_mode`：**
- 如果为 `agent_mode: team` — 将不同兴趣领域的新闻研究委派给并行 sub-agents（例如，每个主题集群分配一个 agent）。每个 agent 负责搜索、核实来源并返回调查结果。将所有结果合并并综合为最终简报。
- 如果为 `agent_mode: solo`（默认）— 直接在对话中处理所有研究与综合工作。不进行委派。

## 执行前检查

**执行前，检查用户个人资料：**

1. 在 vault 中查找 `00-inbox/MY-PROFILE.md` 和 `00-inbox/MY-INTERESTS.md`
2. 如果未找到：
   ```
   Welcome to COG! Daily briefs work best when personalized.

   Let's quickly set up your profile (takes 2 minutes).

   Would you like to run onboarding first, or should I generate a general brief?
   ```
3. 如果已找到：
   - 读取 `MY-INTERESTS.md`，获取用于新闻筛选的主题
   - 读取 `MY-PROFILE.md`，获取用户姓名和正在进行的项目
   - 如果存在，读取 `03-professional/COMPETITIVE-WATCHLIST.md` 以进行竞争动态追踪
   - 使用这些主题筛选相关新闻
   - 在相关时，将新闻与用户正在进行的项目联系起来

**获取当前时间戳（生成任何文件前均为必需）：**

1. 使用 Bash 运行 `date '+%Y-%m-%d %H:%M'`，获取实际的当前日期和时间
2. 存储该值，并将其用于 frontmatter 的 `created:` 字段
3. 绝不要猜测或编造时间——始终使用 `date` 命令返回的值

## 流程

### 1. 收集上下文

收集个性化筛选所需的信息：

- 读取 `00-inbox/MY-PROFILE.md`，获取：
  - 用户姓名
  - 用户角色/职位
  - 正在进行的项目

- 读取 `00-inbox/MY-INTERESTS.md`，获取：
  - 用户感兴趣的主题
  - 偏好的新闻来源

- 读取 `03-professional/COMPETITIVE-WATCHLIST.md`（如果存在），获取：
  - 需要追踪的公司/人员

#### 去重——扫描以往简报

从 `01-daily/briefs/` 中读取最多 3 份最近的每日简报（按最新优先）：
- 从其 frontmatter 中提取 `dedup_urls`（如果存在）
- 同时扫描其标题/报道标题，作为跨来源匹配的语义后备方案
- 构建一组**已报道事件**以避免重复

**匹配规则（按优先级排序）：**
1. **URL 匹配（主要）：**如果候选报道的主要来源 URL 已出现在 `dedup_urls` 中，则视为已知事件
2. **标题匹配（后备）：**如果 URL 不同，但标题描述的事件与之前的报道相同，则视为重复——这可以识别由不同媒体报道的同一事件

在新闻研究期间（步骤 2），应用去重规则：
- **跳过**已报道的事件，除非出现**重大更新**（新数据、结果、升级、逆转）
- 如果包含更新，请添加前缀“**更新：**_首次报道于 [date]_”
- 超过 3 份简报之前的事件，如果仍在发展中，则可以再次收录

### 2. 新闻研究与策展

采用全面的新闻研究方法：

#### 基于兴趣的研究
- 根据用户当前的兴趣画像进行搜索
- 聚焦与用户角色和项目具有战略相关性的内容
- 识别新出现的模式和发展动态
- 丰富信息来源，以获得平衡的视角

#### 核验标准（强制）

**日期核验：**
- 所有新闻必须仅来自过去 7 天
- 通过已验证的时间戳核实发布日期
- 未明确披露时，绝不纳入更早的新闻

**来源可信度评估：**
- **一级来源（可信度最高）：** 主流新闻机构（Reuters、AP、Bloomberg、WSJ、NYT）、公司官方公告、政府声明
- **二级来源（可信度高）：** 行业出版物、可信的科技/商业博客、知名机构发布的研究报告
- **三级来源（可信度中等——需谨慎核验）：** 已认证账号发布的社交媒体内容、公司博客、社区讨论
- 任何主张至少需要 2 个可信来源
- 交叉核对关键事实和数据

**事实交叉核对：**
- 通过多个相互独立的来源核实主张
- 在纳入任何统计数据之前，使用 WebFetch 进行核验
- 识别潜在偏见，并提供平衡的视角

#### 战略相关性分析

评估对用户的影响：

**直接影响（高优先级）：**
- 直接影响用户项目或公司的新闻
- 影响用户所在行业的监管变化
- 直接竞争对手采取的竞争举措
- 影响用户技术栈的技术发展

**战略影响（中优先级）：**
- 影响用户目标客户的市场趋势
- 用户所在行业的投资动向
- 影响招聘的人才市场变化
- 合作机会或威胁

**背景影响（较低优先级）：**
- 影响商业环境的宏观经济趋势
- 影响未来规划的技术趋势
- 行业思想领导力和观点
- 用于职业发展的教育内容

#### 机会与威胁识别

**机会：**
- 市场机会：正在开放的新市场或客户细分领域
- 技术机会：可加以利用的新工具或平台
- 合作机会：潜在的合作伙伴
- 竞争机会：竞争对手的弱点或市场空白

**威胁：**
- 竞争威胁：新的竞争对手或竞争优势
- 技术威胁：颠覆性技术或技术淘汰风险
- 市场威胁：市场转变或客户行为变化
- 监管威胁：新法规或合规要求

### 3. 生成每日简报

创建结构化的简报文档：

```markdown
---
type: "daily-brief"
domain: "shared"
date: "YYYY-MM-DD"
created: "YYYY-MM-DD HH:MM"
sources_verified: true
news_age_verified: true
confidence: "high"
tags: ["#daily-brief", "#news", "#strategic-intelligence"]
interests: ["interest1", "interest2"]
projects_referenced: ["project1"]
items_count: [number]
dedup_urls: ["https://primary-source-url-for-each-story-covered"]
---

# Daily Brief - [Date]

**Good [morning/afternoon], [Name]!**

## Executive Summary
[2-3 sentences highlighting the most important developments across all your interest areas]

---

## High Impact News

### [News Item 1 - Direct Impact]
**Relevance:** [Why this matters to you specifically]

[Detailed summary of the news]

**Impact Assessment:**
- **Projects Affected:** [Which of your projects this impacts]
- **Potential Effects:** [Specific implications]
- **Action Suggested:** [Recommended response or follow-up]

**Sources:**
- [Source Name 1] (Tier [1/2/3]) - [Publication Date] - [Link]
- [Source Name 2] (Tier [1/2/3]) - [Publication Date] - [Link]

**Confidence:** [High/Medium/Low] - [Reasoning]

---

### [News Item 2 - Direct Impact]
[Same structure as above]

---

## Strategic Developments

### [News Item 3 - Strategic Impact]
**Relevance:** [Why this matters strategically]

[Detailed summary]

**Strategic Implications:**
- [Implication 1]
- [Implication 2]
- [Implication 3]

**Sources:**
- [Source listings with credibility tiers and links]

**Confidence:** [High/Medium/Low] - [Reasoning]

---

## Market Intelligence

### [News Item 4 - Market Trends]
**Relevance:** [Why this market trend matters]

[Detailed summary]

**Market Impact:**
- [Impact on target customers]
- [Industry trends]
- [Investment patterns]

**Sources:**
- [Source listings with credibility tiers and links]

**Confidence:** [High/Medium/Low] - [Reasoning]

---

## Technology Watch

### [News Item 5 - Tech Developments]
**Relevance:** [Why this technology matters]

[Detailed summary]

**Technology Implications:**
- [Impact on tech stack]
- [New tools or platforms]
- [Emerging technologies]

**Sources:**
- [Source listings with credibility tiers and links]

**Confidence:** [High/Medium/Low] - [Reasoning]

---

## Competitive Landscape

### [Competitor/Company Name - From Watchlist]
**Recent Activity:**

[Summary of competitive intelligence gathered]

**Competitive Implications:**
- [What this means for your projects]
- [Opportunities or threats]
- [Recommended responses]

**Sources:**
- [Source listings with credibility tiers and links]

**Confidence:** [High/Medium/Low] - [Reasoning]

---

## Opportunities & Recommendations

**Note:** Calculate actual due dates from today's date and append Obsidian Tasks emoji format.

### Immediate Actions (Today/This Week)
- [ ] [Specific action item 1] 📅 [YYYY-MM-DD = today's date]
- [ ] [Specific action item 2] 📅 [YYYY-MM-DD = today's date]
- [ ] [Specific action item 3] 📅 [YYYY-MM-DD = end of this week]

### Research Needed
- [Area 1 requiring deeper investigation]
- [Area 2 to monitor closely]

### People to Inform/Consult
- [Stakeholder 1]: [About what]
- [Stakeholder 2]: [About what]

---

## Risks & Threats

### Active Threats
- **Threat 1:** [Description and mitigation approach]
- **Threat 2:** [Description and mitigation approach]

### Emerging Risks to Monitor
- [Risk 1 to watch]
- [Risk 2 to watch]

---

## Verification Report

### Source Analysis
- **Tier 1 Sources:** [count] - [list main ones]
- **Tier 2 Sources:** [count] - [list main ones]
- **Cross-References Performed:** [number]

### Fact-Checking Results
- **Verified Claims:** [count]
- **Unverified Claims:** [count with explanation if any]
- **Conflicting Information:** [count with resolution approach if any]

### Freshness Verification
- ✅ All news items verified within 7-day window
- Publication date range: [Oldest date] to [Newest date]

### Confidence Assessment
- **Overall Confidence:** [percentage]%
- **High Confidence Items:** [count]
- **Medium Confidence Items:** [count]
- **Low Confidence Items:** [count] - [reasons if any]

---

## Complete Sources

### Strategic News
1. [Full source citation with link]
2. [Full source citation with link]

### Market Intelligence
1. [Full source citation with link]
2. [Full source citation with link]

### Technology Watch
1. [Full source citation with link]
2. [Full source citation with link]

### Competitive Intelligence
1. [Full source citation with link]
2. [Full source citation with link]

---

*Curated by COG News Curator | All news verified within 7-day freshness window | Sources cross-referenced for accuracy*
```

保存至：`01-daily/briefs/daily-brief-YYYY-MM-DD.md`

### 4. 处理特殊情况

**未找到近期新闻时：**
如果在过去 7 天内未找到与某个特定兴趣领域相关的新闻：

```markdown
### [Interest Area]
**No significant news found in last 7 days**

Last significant development was [date if known] regarding [topic if known].

**Suggestions:**
- Consider expanding search criteria
- Check [alternative sources suggested]
- This area may be experiencing a quiet period
```

**绝不编造新闻，也不得在未明确披露日期的情况下使用较早的新闻。**

**无法验证信息时：**
```markdown
### [Potential News Item]
**⚠️ Unable to verify from independent sources**

**Original Source:** [source] - Credibility: [assessment]

**What We Know:**
[What can be stated based on single source]

**What's Uncertain:**
[Specific claims that couldn't be verified]

**Recommendation:** Monitor for additional confirmation before acting

**Confidence:** Low - [reasoning]
```

**来源相互冲突时：**
```markdown
### [News Item with Conflicting Reports]
**⚠️ Conflicting information from multiple sources**

**Perspective 1:**
[Summary] - **Source:** [source with credibility tier]

**Perspective 2:**
[Summary] - **Source:** [source with credibility tier]

**Areas of Agreement:**
- [What sources agree on]

**Areas of Disagreement:**
- [Where sources conflict]

**Recommendation:** [Approach for resolution or further research]

**Confidence:** Medium - [reasoning]
```

### 5. 确认完成
- 确认文件已创建
- 向用户显示："每日简报已保存至 [文件路径]"
- 可选择显示执行摘要
- 询问用户是否希望深入探索任何主题，或通过 braindump skill 记录想法

## 循环工程

每日简报是一个**验证-重试循环**，而不是单次搜索。共享术语请参阅 `.claude/skills/loop-engineering/SKILL.md`。

**循环（针对每个兴趣领域）：**搜索 → 获取候选项 → 运行验证器 → 保留该候选项，或将其丢弃并使用调整后的查询重新搜索 → 重复执行，直到获得足够多的已验证条目或触发停止条件。在 `agent_mode: team` 中，将每个兴趣主题簇的循环作为隔离的工作单元运行（编排器-工作单元模式），然后进行综合。

**验证器（确定性执行，对每个候选项运行）：**
- 发布日期在过去 7 天内。进行机械式日期检查，而不是猜测。
- 该主张至少有 2 个相互独立的可信来源。
- 已识别来源等级（1 / 2 / 3）。等级 3 的来源必须经过交叉核验才能保留。
- 此前未出现过（报道去重）：如果候选项的 URL 或标题已在简报中出现，则将其丢弃。

未通过任何一项检查的候选项都应被丢弃，而不是放宽标准。这是在循环中应用 COG 的验证优先规则：绝不能仅凭智能体自己认为“这看起来足够新”就纳入某个条目。

**终止条件（分层）：**
- **目标达成：**已达到该兴趣领域的目标条目数量。
- **硬性上限：**每个兴趣领域在执行约 5 次搜索后停止。
- **无进展：**连续 2 次搜索未发现任何新内容（去重后）→ 输出“未找到重大新闻”区块（参见“处理特殊情况”）并继续处理下一个领域。绝不使用较早或编造的新闻进行回填。
- **预算防护：**所有领域的总体获取预算。

**模式：** 评估器-优化器（根据验证器对每个条目进行评分）+ 反思-重试（搜索失败后，利用失败信息调整下一次查询）+ 编排器-工作器（团队模式）。

**循环内上下文：** 已验证的条目通过后，直接写入简报文件；提取摘要和来源后，丢弃抓取的原始页面文本。

## 与其他技能集成

### 后续操作
每日简报完成后，建议：
- **braindump 技能** - 记录新闻引发的想法
- **weekly-checkin 技能** - 回顾一周内的新闻趋势
- 如果新闻影响正在进行的项目，则进行项目专项分析

## 性能指标

### 验证质量
- 来源可信度评分：所用来源的平均可信度评级
- 事实准确率：经过一段时间后仍保持准确的事实所占百分比
- 交叉核验率：通过多个来源验证的声明所占百分比
- 日期准确性：100% 遵守 7 天时效性要求（强制）

### 相关性质量
- 用户参与度：用户认为有价值的新闻条目所占百分比
- 行动转化率：促使用户采取行动的新闻条目所占百分比
- 战略价值：用户对战略重要性的评估
- 时机相关性：新闻发布时机与用户需求的契合程度

## 学习与适应

### 兴趣画像优化
- 监测用户认为最有价值的新闻条目
- 将用户对相关性和重要性的反馈纳入考量
- 识别用户兴趣变化的规律
- 根据项目演进预测兴趣变化

### 来源质量学习
- 持续跟踪不同来源的准确性
- 建立对来源可靠性规律的理解
- 学习识别来源偏见的规律并将其纳入考量
- 持续改进来源选择标准

### 相关性算法改进
- 提高预测新闻对用户影响的能力
- 学习针对不同类型新闻的最佳呈现方式
- 更深入地理解用户的战略背景
- 提高识别可转化为行动的新闻条目的能力

## 成功标准
- 所有新闻均在 7 天时间窗口内（100% 遵守）
- 所有来源均经过验证并附有链接
- 用户认为简报具有相关性和可操作性
- 明确说明置信度
- 识别机会和风险
- 建议后续操作

## 理念

每日简报技能体现了 COG 验证优先的方法：
- 不允许 AI 幻觉——所有内容均有来源并经过验证
- 透明呈现置信度
- 当信息无法验证时，明确说明不确定性
- 让用户能够基于可靠的情报做出明智决策