---
name: proto-persona
argument-hint: "[target user or segment]"
description: Create a proto-persona from current research, market signals, and team knowledge. Use when you need a working customer profile before deeper validation.
intent: >-
  Create an initial, assumption-based persona profile that synthesizes available user research, market data, and stakeholder knowledge into a working hypothesis about your target user. Use this to align teams early in product development, guide initial design decisions, and identify gaps in understanding that require validation through research.
type: component
theme: discovery-research
best_for:
  - "Getting a working customer profile before you can afford real research"
  - "Making team assumptions about users explicit and challengeable"
  - "Setting up a persona you intend to validate, not defend"
scenarios:
  - "We have no research budget yet but need a working customer profile to start"
  - "Everyone on the team pictures a different user and it's causing arguments"
estimated_time: "15-25 min"
---
## 目的
创建一份基于假设的初始用户画像，将现有的用户研究、市场数据和利益相关者认知整合为关于目标用户的工作假设。使用它在产品开发早期统一团队认知、指导初步设计决策，并识别需要通过研究验证的认知空白。

这不是经过验证的用户画像，而是一个会随着认知深入不断演变的“原型”用户画像。可以将其视为一个结构化的占位框架：它既能避免由委员会主导设计，又承认你尚未掌握所有答案。

## 输入

**最适合提供：** 你需要为其建立工作画像的目标用户或用户群体。  
**同样有用：** 任何已有的信号——客服主题、销售案例、分析数据、既往研究——以及该用户画像将要指导的决策。

调用时一并提供的任何内容——技能名称后的文本、粘贴的上下文信息，或附加的 `ARGUMENTS:` 行——均视为已经给出的答案。直接使用这些内容，并跳过其已涵盖的问题；不要重复询问。

**空手而来也没关系。** 该技能会询问你认为用户是谁以及你已经了解哪些信息，然后将这些信息结构化，并标记出需要验证的假设。

**调用示例：** `Proto-persona for solo bookkeepers adopting our receipt-scanning app — signal: 30 support tickets and 4 sales call notes.`

## 核心概念

### 什么是原型用户画像？
原型用户画像是一种轻量级、由假设驱动的用户画像，其创建依据包括：
- **现有研究：** 用户访谈、问卷调查、分析数据（如有）
- **市场数据：** 行业报告、竞品分析、人口统计趋势
- **利益相关者认知：** 销售、客服和团队洞察
- **有依据的假设：** 需要验证的最佳推测

### 原型用户画像与经验证的用户画像
| 原型用户画像 | 经验证的用户画像 |
|---------------|-------------------|
| 在数小时或数天内创建 | 在数周或数月内创建 |
| 基于假设和有限研究 | 基于广泛的用户研究 |
| 用于在早期统一团队认知 | 用于指导详细设计 |
| 快速演变 | 随时间推移保持稳定 |
| 足以作为起点 | 可信度高 |

### 为什么使用原型用户画像？
- **速度：** 无需等待数月的研究即可快速统一团队认知
- **聚焦：** 为“我们正在为谁构建产品”提供共同的参照
- **假设框架：** 将假设显性化，以便随后进行验证
- **避免泛化设计：** “为所有人设计”就等于没有为任何人设计

### 反模式（这不是什么）
- **不是经过验证的研究：** 不要将其视为事实——它只是一种假设
- **不能替代用户研究：** 用它来*指导*研究，而不是逃避研究
- **不只是人口统计数据：** 年龄和所在地无法解释行为
- **不是永久不变的：** 原型用户画像应随着认知深入而演变

### 何时使用
- 早期产品开发阶段（在开展广泛的用户研究之前）
- 启动新功能或产品转型时
- 统一利益相关者对目标用户的认知
- 识别研究空白（我们需要访谈谁？）

### 何时不应使用
- 在你已经完成大量用户研究之后（此时应创建经过验证的用户画像）
- 对于用户细分已明确的成熟产品（你应该已经拥有经过验证的用户画像）
- 用作定量数据的替代品（原型用户画像为研究提供信息；研究则对其进行验证）

---

## 应用方法

使用 `template.md` 获取完整的填写结构。

### 第 1 步：收集现有背景信息
在创建原型用户画像之前，收集：
- **用户研究：** 访谈记录、调查结果、支持工单
- **分析数据：** 使用数据、人口统计特征、行为模式
- **市场数据：** 行业报告、竞争对手的用户群体
- **利益相关者洞察：** 与用户互动的销售/支持/客户成功团队
- **产品背景：** 你要解决什么问题？（参考 `skills/problem-statement/SKILL.md`）

**如果缺少背景信息：** 不要编造——记录信息缺口，并规划研究来填补这些缺口。

---

### 第 2 步：定义用户画像的身份

#### 姓名
为用户画像取一个**押头韵、易记的名字**（使其更容易被提及）。

```markdown
### Name
- [Alliterative name, e.g., "Manager Mike," "Startup Sarah," "Enterprise Emma"]
```

**质量检查：**
- **易记：** 团队能否轻松记住这个名字？
- **不笼统：** 避免使用 "User 1" 或 "Persona A"

---

#### 简介与人口统计特征
描述这个人在现实世界中的身份。

```markdown
### Bio & Demographics
- [Age range]
- [Geographic location]
- [Social status (married, single, family, etc.)]
- [Online presence (active on LinkedIn, avoids social media, etc.)]
- [Leisure activities]
- [Career status (job title, industry, seniority)]
```

**质量检查：**
- **侧重行为，而不只是人口统计特征：** 不要止步于 "30-40 years old, lives in SF"——还应补充 "Works remotely, active in Slack communities, juggles 3 side projects"
- **与背景相关：** 只包含会影响产品决策的人口统计特征

**示例：**
- "35-45 岁，居住在城市地区（纽约市、旧金山、奥斯汀）"
- "在中型科技公司（50-500 名员工）担任总监级职位"
- "活跃于 LinkedIn 和 Twitter，每年参加 2-3 场会议"
- "已婚并育有年幼子女，重视工作与生活的平衡"
- "周末参加业余体育活动，通勤时收听商业播客"

---

### 第 3 步：捕捉他们的声音

#### 引语
使用真实或有代表性的引语，揭示他们的思维和说话方式。

```markdown
### Quotes
- "[Quote 1 revealing what they say, feel, or think]"
- "[Quote 2 revealing frustrations or motivations]"
- "[Quote 3 revealing attitudes or beliefs]"
```

**质量检查：**
- **真实：** 如果可以，使用访谈/支持工单中的真实引语
- **有揭示力：** 引语应体现其思维方式，而不只是陈述事实（"I need better tools" 表达较弱；"I'm drowning in manual work and can't focus on strategy" 表达更有力）

**示例：**
- "我每周要花 10 个小时参加本可以通过电子邮件解决的进度会议。"
- "我已经厌倦了那些承诺自动化、却需要开发人员才能完成设置的工具。"
- "我的团队希望我能立即给出答案，但我却总是在不断查找数据。"

---

### 第 4 步：记录其背景

#### 痛点
该用户画像会遇到哪些问题或挫折？（结构请参考 `skills/jobs-to-be-done/SKILL.md`。）

```markdown
### Pains
- [Pain point 1 related to the problem space]
- [Pain point 2 related to the problem space]
- [Pain point 3 related to the problem space]
```

**质量检查：**
- **具体：**“对工具感到不满”很模糊；“每周花费 3 小时在不同工具之间手动复制数据”则很具体
- **与你的产品相关：**聚焦于你的产品能够解决的痛点

---

#### 此人想要实现什么？
他们正在追求哪些行为、行动或结果？

```markdown
### What is This Person Trying to Accomplish?
- [Behavior or outcome 1]
- [Behavior or outcome 2]
- [Behavior or outcome 3]
```

**质量检查：**
- **可观察：**你能观察到这种行为吗？（“获得晋升”是内在诉求；“提前 2 周交付项目”则是可观察的）
- **以结果为导向：**不要写任务（“使用仪表板”），而要写结果（“更快地做出数据驱动的决策”）

---

#### 目标
他们有哪些愿望、需求和梦想？

```markdown
### Goals
- [Goal 1: want, need, or dream]
- [Goal 2: want, need, or dream]
- [Goal 3: want, need, or dream]
```

**质量检查：**
- **短期和长期：**同时包括战术目标（“在 Q2 前发布功能”）和愿景目标（“在 3 年内成为 VP”）
- **个人和职业：**“花更多时间陪伴家人”可能与“提高团队生产力”同样重要

---

### 第 5 步：了解其影响因素

#### 决策权
他们是否有权购买你的解决方案？

```markdown
### Attitudes & Influences

- **Decision-Making Authority:** [Yes/No + context (e.g., "Has budget authority up to $10k, needs exec approval above that")]
```

**质量检查：**
- **采购实际情况：**如果他们是用户而非购买者，请注明由谁批准采购

---

#### 决策影响者
谁会影响他们的决策？

```markdown
- **Decision Influencers:** [Who influences this person? (e.g., "Boss, peers in industry Slack channels, analyst reports")]
```

**质量检查：**
- **具体：**不要只写“他们的经理”——应明确影响因素的类型（同行推荐、Gartner 报告、Twitter 主题帖等）

---

#### 信念与态度
哪些信念和态度会影响他们的决策？

```markdown
- **Beliefs & Attitudes:** [Beliefs/attitudes that impact decisions (e.g., "Skeptical of tools that require training," "Values data-driven decision making")]
```

**质量检查：**
- **与采用相关：**聚焦于会影响他们是否使用你的产品的信念

---

### 第 6 步：验证并迭代

- **与团队分享：**该用户画像是否能引起共鸣？他们是否认得出这样的人？
- **找出信息缺口：**有哪些信息是我们不了解的？（在不确定之处添加 “[ASSUMPTION—VALIDATE]” 标签）
- **规划研究：**使用原型用户画像来指导下一步应该访谈哪些人
- **持续演进：**随着了解的深入，更新原型用户画像（或将其升级为经过验证的用户画像）

---

## 示例

完整的原型用户画像示例请参阅 `examples/sample.md`。

迷你示例节选：

```markdown
### Name
- Manager Mike

### Quotes
- "I spend more time in status meetings than actually building product."
```

---

## 常见陷阱

### 陷阱 1：只有人口统计信息，没有行为信息
**症状：**“28 岁，住在纽约市，养了一条狗”

**后果：**人口统计信息无法解释某人*为什么*会使用你的产品。

**修复方法：**添加行为背景：“远程工作，活跃于 5 个 Slack 社群，重视异步沟通工具。”

---

### 陷阱 2：将原型用户画像当作事实
**症状：**“经理 Mike 绝不会使用功能 X，因为他讨厌复杂性”

**后果：**你把一个假设当成了经过验证的研究结论。

**修复方法：**添加 "[ASSUMPTION—VALIDATE]" 标签，并安排访谈来检验假设。

---

### 陷阱 3：创建 10 个原型用户画像
**症状：**试图从一开始就为每一种可能的用户类型建模

**后果：**分析瘫痪。团队无法专注于主要用户。

**修复方法：**从 1-2 个原型用户画像开始（主要用户 + 次要用户）。随着验证和扩展，再添加更多画像。

---

### 陷阱 4：编造引语
**症状：**听起来像营销文案的引语：“我喜欢那些能让我感到愉悦的产品！”

**后果：**虚假的用户画像会带来虚假的共情。

**修复方法：**使用来自访谈、支持工单或销售通话的真实引语。如果暂时还没有引语，请注明 "[PLACEHOLDER—NEEDS RESEARCH]."

---

### 陷阱 5：从不验证
**症状：**原型用户画像创建于 6 个月前，但从未更新

**后果：**你正在围绕一个可能错误的假设进行设计。

**修复方法：**规划研究冲刺，以验证关键假设。随着认知的深入，不断完善原型用户画像。当置信度较高时，将其升级为经过验证的用户画像。

---

## 参考资料

### 相关技能
- `skills/problem-statement/SKILL.md` — 用户画像为“我是谁”部分提供信息
- `skills/jobs-to-be-done/SKILL.md` — JTBD 为用户画像的痛点/目标提供信息
- `skills/positioning-statement/SKILL.md` — 用户画像对应“For [target]”
- `skills/user-story/SKILL.md` — 用户故事使用“As a [persona]”

### 外部框架
- Alan Cooper，*The Inmates Are Running the Asylum*（1998）— 用户画像概念的起源
- Jeff Gothelf，*Lean UX*（2013）— 将原型用户画像作为假设驱动的研究工具
- Indi Young，*Mental Models*（2008）— 行为驱动的用户画像开发

### Dean 的工作
- 原型用户画像资料提示词（受 Productside Product Manager's Playbook 启发）

### 来源
- 改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的 `prompts/proto-persona-profile.md`。

---

**技能类型：**组件
**建议的文件名：**`proto-persona.md`
**建议的放置位置：**`/skills/components/`
**依赖项：**引用 `skills/jobs-to-be-done/SKILL.md`、`skills/problem-statement/SKILL.md`
**使用方：**`skills/positioning-statement/SKILL.md`、`skills/user-story/SKILL.md`、`skills/problem-statement/SKILL.md`