---
name: customer-journey-map
argument-hint: "[persona] [scenario]"
description: Create a customer journey map across stages, touchpoints, actions, emotions, and metrics. Use when diagnosing a broken experience or aligning a team on the full customer flow.
intent: >-
  Create a comprehensive customer journey map that visualizes how customers interact with your brand across all stages—from awareness to loyalty—documenting their actions, touchpoints, emotions, KPIs, business goals, and teams involved at each stage. Use this to identify pain points, align cross-functional teams, and systematically improve the customer experience to achieve business objectives.
type: component
theme: workshops-facilitation
best_for:
  - "Mapping the full customer experience across all touchpoints"
  - "Aligning cross-functional teams on the end-to-end customer journey"
  - "Identifying pain points and opportunities by stage with measurable KPIs"
scenarios:
  - "I need to map the customer journey for our B2B SaaS onboarding experience from signup to first value"
  - "Create a journey map for a PM leader evaluating our skills repo — from discovery through loyalty"
estimated_time: "20-30 min"
---
## 目的
创建一份全面的客户旅程地图，将客户从认知到忠诚的所有阶段中与品牌互动的方式可视化，并记录客户在每个阶段的行为、接触点、情绪、KPI、业务目标以及参与团队。利用这份地图识别痛点、协调跨职能团队，并系统地改善客户体验，从而实现业务目标。

这不是用户流程图，而是一项将客户同理心与业务指标相结合、用于推动可执行改进的战略产物。

## 输入

**最适合提供：** 客户（用户画像或细分群体），以及旅程所涵盖的场景或目标。
**同样有用：** 已知的阶段、接触点、痛点、支持性研究，以及绘制该地图所要实现的业务目标。

调用时提供的任何内容——技能名称后的文本、粘贴的上下文信息，或附加的 `ARGUMENTS:` 行——都视为已经给出的答案。使用这些信息，并跳过其已涵盖的问题；不要重复询问。

**什么都没准备？也没问题。** 该技能会先询问用户画像和场景——如果没有具体的参与者和目标，客户旅程地图就会变成一张泛泛的漏斗图。

**调用示例：** `Map the journey for a mid-market ops manager going from free trial to paid rollout across their team.`

## 核心概念

### 客户旅程地图框架
该框架改编自 NNGroup 的框架和卡内基梅隆大学的产品管理课程，客户旅程地图记录以下内容：

**横向结构（阶段）：**
- **认知：** 客户第一次了解到你的品牌
- **考虑：** 客户评估你的产品或服务
- **决策：** 客户进行购买
- **服务：** 客户在购买后使用产品或服务
- **忠诚：** 客户成为回头客和品牌倡导者

**纵向结构（针对每个阶段）：**
- **客户行为：** 客户做什么
- **接触点：** 客户在何处以及如何与你的品牌互动
- **客户体验：** 客户的情绪和想法
- **KPI：** 用于衡量成功的指标
- **业务目标：** 你试图实现什么
- **参与团队：** 谁负责该阶段

### 为什么这种方法有效
- **同理心驱动：** 以客户情绪为中心，而不仅仅关注行为
- **跨职能协同：** 展示哪些团队会影响哪些阶段
- **指标导向：** 将客户体验与可衡量的结果关联起来
- **识别差距：** 让痛点和机会清晰可见
- **可执行：** 明确的 KPI 和目标有助于确定优先级

### 反模式（这不是什么）
- **不是用户故事地图：** 客户旅程地图的范围更广（涵盖所有接触点，而不仅仅是产品使用）
- **不是服务蓝图：** 对内部流程的描述较少，更侧重于客户体验
- **不是静态的：** 客户旅程地图会随着客户行为的变化而演进

### 何时使用
- 了解客户在所有接触点上的体验（而不仅仅是产品内的体验）
- 协调跨职能团队（营销、销售、产品、支持）
- 识别痛点并确定改进事项的优先级
- 帮助新团队成员建立客户视角
- 审查端到端的客户体验

### 不适用的情况
- 针对深入的产品特定工作流（应改用故事地图）
- 在定义用户画像之前（需要先明确你要绘制的是谁的旅程）
- 将其作为一次性练习（客户旅程地图需要持续更新）

---

## 应用

使用 `template.md` 获取完整的填写结构。

### 第 1 步：准备先决条件

在绘制旅程地图之前，请确保你已具备：
1. **关键利益相关者：** 市场营销、销售、产品和客户服务代表
2. **买家画像：** 包含人口统计特征、心理特征、目标和挑战的详细画像（参考 `skills/proto-persona/SKILL.md`）
3. **已定义的阶段：** 购买流程的主要阶段（通常为：认知、考虑、决策、服务、忠诚）
4. **触点清单：** 客户与品牌互动的所有渠道（网站、社交媒体、电子邮件、门店、支持等）

**如果缺失：** 请先开展探索性访谈、用户画像定义工作或触点审计。

---

### 第 2 步：设定明确目标

定义你希望实现的目标：

```markdown
## Objectives
- [Goal 1: e.g., "Identify top 3 pain points causing drop-off between Awareness and Consideration"]
- [Goal 2: e.g., "Align marketing and sales on customer motivations at each stage"]
- [Goal 3: e.g., "Understand emotional journey to inform messaging strategy"]
```

**质量检查：**
- **具体：** 不要写“了解客户”，而应写“确定客户在考虑阶段流失的原因”
- **可执行：** 结果应为决策提供依据，而不仅仅是记录观察结果

---

### 第 3 步：选择一个买家画像

选择一个要重点关注的画像（为每个画像分别创建旅程地图）：

```markdown
## Persona
- [Persona name and brief description]
- [Example: "Manager Mike: 35-42, Director of Product at mid-sized B2B SaaS, struggles with data-driven prioritization, values time savings over feature depth"]
```

**每张地图仅使用一个画像的原因：** 不同画像具有不同的旅程。将它们混合在一起会造成混乱。

---

### 第 4 步：绘制每个阶段

对于每个阶段（认知、考虑、决策、服务、忠诚），记录以下内容：

#### 客户行为
客户在此阶段所做的事情：

```markdown
### Stage: [Stage Name, e.g., Awareness]

**Customer Actions:**
- [Action 1: e.g., "See LinkedIn ad about product management tools"]
- [Action 2: e.g., "Hear about tool from PM peer at conference"]
- [Action 3: e.g., "Google 'best product roadmap software'"]
```

**质量检查：**
- **可观察：** 你可以观察或衡量此行为
- **具体：** 不要写“研究产品”，而应写“在 Google 上搜索‘最佳路线图软件’并阅读对比文章”

---

#### 触点
客户与品牌互动的地点或方式：

```markdown
**Touchpoints:**
- [Touchpoint 1: e.g., "LinkedIn Ads"]
- [Touchpoint 2: e.g., "Word-of-mouth at PM conferences"]
- [Touchpoint 3: e.g., "Google organic search results"]
- [Touchpoint 4: e.g., "Review sites (G2, Capterra)"]
```

**质量检查：**
- **全面：** 同时包含数字触点和实体触点
- **具体：** 不要写“社交媒体”，而应写“LinkedIn Ads”“Twitter mentions”等。

---

#### 客户体验
客户的情绪和想法：

```markdown
**Customer Experience:**
- [Emotion 1: e.g., "Curious but skeptical—'Is this actually better than spreadsheets?'"]
- [Emotion 2: e.g., "Overwhelmed by options—'Too many tools, how do I choose?'"]
- [Emotion 3: e.g., "Hopeful but cautious—'Could this save me time?'"]
```

**质量检查：**
- **真实：** 尽可能使用研究中的客户原话
- **体现情绪：** 捕捉感受，而不只是想法
- **具体：** 不要只写“感兴趣”，而要写“好奇但持怀疑态度——担心设置时间过长”

---

#### KPI
此阶段的关键绩效指标：

```markdown
**KPIs:**
- [KPI 1: e.g., "Brand awareness (measured via surveys)"]
- [KPI 2: e.g., "LinkedIn ad impressions: 100k/month"]
- [KPI 3: e.g., "Organic search traffic: 5k visitors/month"]
- [KPI 4: e.g., "G2 review views: 2k/month"]
```

**质量检查：**
- **可衡量：** 你能跟踪此指标吗？
- **适合相应阶段：** 认知阶段的 KPI 与决策阶段的 KPI 不同

---

#### 业务目标
你在此阶段希望实现的目标：

```markdown
**Business Goals:**
- [Goal 1: e.g., "Increase brand awareness among PMs at B2B SaaS companies"]
- [Goal 2: e.g., "Generate 500 qualified leads/month"]
- [Goal 3: e.g., "Position as top 3 roadmap tool in G2 rankings"]
```

**质量检查：**
- **以结果为导向：** 不要写“投放广告”，而要写“提升品牌知名度”
- **与阶段一致：** 不要期望在认知阶段实现转化

---

#### 参与团队
负责此阶段的人员：

```markdown
**Teams Involved:**
- [Team 1: e.g., "Marketing (ad campaigns, SEO)"]
- [Team 2: e.g., "Content (blog posts, comparison guides)"]
- [Team 3: e.g., "Customer Success (case studies, testimonials)"]
```

**质量检查：**
- **跨职能：** 每个阶段通常都会涉及多个团队
- **具体职责：** 不要只写“营销”，而要写“营销（广告活动、SEO）”

---

### 第 5 步：可视化旅程图

创建表格或可视化图表：

| **阶段** | **认知** | **考虑** | **决策** | **服务** | **忠诚** |
|-----------|---------------|-------------------|--------------|-------------|-------------|
| **客户行为** | 看到广告、听同行提及、使用 Google 搜索 | 比较功能、阅读评价、申请演示 | 注册免费试用、使用真实数据进行测试、评估 ROI | 引导团队上手、创建第一个路线图、与 Jira 集成 | 每日使用、向同行推荐、在 LinkedIn 上分享成果 |
| **触点** | LinkedIn 广告、会议、Google、评价网站 | 网站、演示通话、销售邮件 | 产品（免费试用）、引导邮件 | 产品、支持聊天、知识库 | 产品、社区论坛、客户成功回访 |
| **客户体验** | 好奇但持怀疑态度 | 兴奋，但面对众多选项时不知所措 | 担心设置时间过长，同时期待节省时间 | 如果操作简单则感到宽慰，如果复杂则感到沮丧 | 满意且有信心，为取得的成果感到自豪 |
| **KPI** | 展示次数：每月 10 万次，流量：每月 5000 次 | 演示申请：每月 100 次，试用注册：每月 50 次 | 转化率：20%，价值实现时间：<2 小时 | 激活率：70%，支持工单量 | 留存率：85%，NPS：50，推荐率：15% |
| **业务目标** | 提升品牌知名度、每月获取 500 条潜在客户线索 | 提高潜在客户质量、将销售周期缩短至 30 天 | 提高试用到付费的转化率、优化引导流程 | 降低客户流失率、提高激活率、最大限度降低支持成本 | 提高 LTV、获得客户推荐、追加销售高级功能 |
| **参与团队** | 营销、内容 | 营销、销售、产品 | 销售、产品、用户引导 | 产品、支持、客户成功 | 产品、客户成功、营销 |

---

### 步骤 6：分析并确定优先级

审视旅程图并思考：
1. **最大的痛点在哪里？**（寻找负面情绪 + 高流失率）
2. **哪些阶段的 KPI 最弱？**（优先处理表现不佳的阶段）
3. **团队是否保持一致？**（各团队是否理解自己在每个阶段中的角色？）
4. **存在哪些机会？**（哪些微小改进可以产生巨大影响？）

**优先级评估标准：**
- **影响：** 解决这个问题能在多大程度上改善客户体验？
- **可行性：** 解决这个问题有多容易？
- **一致性：** 这是否支持业务目标？

---

### 步骤 7：测试和完善

- **定期更新：** 客户行为会发生变化——每季度重新审视旅程图
- **使用数据验证：** 使用分析数据、调查和客户访谈来验证假设
- **跟踪改进效果：** 做出更改后，衡量其对 KPI 的影响

---

## 示例

完整的客户旅程图示例请参见 `examples/sample.md`。
关于映射此代码仓库自身客户旅程的元级内部实践示例，请参见 `examples/meta-product-manager-skills.md`。

迷你示例摘录：

```markdown
| **Stage** | **Awareness** | **Consideration** | **Decision** |
| **Customer Actions** | Sees LinkedIn ad | Compares on G2 | Starts free trial |
| **Customer Experience** | Curious but skeptical | Overwhelmed | Anxious about setup |
```

---

## 常见陷阱

### 陷阱 1：笼统的情绪
**症状：** “客户感到高兴”或“客户感到满意”

**后果：** 无法洞察他们产生这种感受的*原因*，也不知道应该改进什么。

**解决方法：** 具体描述：“设置只用了 30 分钟，而不是原本担心的 3 小时，因此感到如释重负。”

---

### 陷阱 2：遗漏触点
**症状：** 只记录数字触点（网站、应用）

**后果：** 遗漏线下互动（会议、口碑传播、支持电话）。

**解决方法：** 包括所有触点：实体、数字、人工和自动化触点。

---

### 陷阱 3：内部视角
**症状：** 映射的是*你*希望客户采取的行动，而不是他们*实际*采取的行动

**后果：** 旅程图反映的是一厢情愿的设想，而不是现实。

**解决方法：** 通过客户研究、分析数据和支持工单进行验证。

---

### 陷阱 4：缺少 KPI 或目标
**症状：** 旅程图包含行动和情绪，但没有指标或业务目标

**后果：** 无法衡量成功与否，也无法确定改进的优先级。

**解决方法：** 为每个阶段添加 KPI 和业务目标，并确保它们可衡量。

---

### 陷阱 5：一次性工作
**症状：** 旅程图创建一次后便再也不更新

**后果：** 随着客户行为的演变，旅程图会逐渐过时。

**解决方法：** 每季度审查。根据新数据、产品变更或市场变化进行更新。

---

## 参考资料

### 相关技能
- `skills/proto-persona/SKILL.md` — 定义旅程图所使用的用户画像
- `skills/jobs-to-be-done/SKILL.md` — 为客户行动和目标提供依据
- `skills/problem-statement/SKILL.md` — 识别每个阶段的痛点
- `skills/user-story-mapping/SKILL.md` — 作为补充（故事映射侧重于产品使用，旅程映射涵盖所有触点）

### 外部框架
- NNGroup，*客户旅程地图*（2016）— 基础框架
- 卡内基梅隆大学，*产品管理课程* — 学术方法
- Chris Risdon 与 Patrick Quattlebaum，*体验编排*（2018）— 面向服务设计的旅程地图

### Dean 的工作
- 客户旅程地图提示词模板（改编自 NNGroup 和 CMU 的框架）

### 来源
- 改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的 `prompts/customer-journey-mapping-prompt-template.md`。

---

**技能类型：** 组件
**建议的文件名：** `customer-journey-map.md`
**建议的放置位置：** `/skills/components/`
**依赖项：** 引用 `skills/proto-persona/SKILL.md`、`skills/jobs-to-be-done/SKILL.md`、`skills/problem-statement/SKILL.md`