---
name: jobs-to-be-done
argument-hint: "[customer segment or product]"
description: Uncover customer jobs, pains, and gains in a structured JTBD format. Use when clarifying unmet needs, repositioning a product, or improving discovery and messaging.
intent: >-
  Systematically explore what customers are trying to accomplish (functional, social, emotional jobs), the pains they experience, and the gains they seek. Use this framework to uncover unmet needs, validate product ideas, and ensure your solution addresses real motivations—not just surface-level feature requests.
type: component
theme: discovery-research
best_for:
  - "Clarifying what customers actually hire your product to do"
  - "Repositioning a product around unmet needs rather than features"
  - "Turning fuzzy user feedback into structured jobs, pains, and gains"
scenarios:
  - "Customers keep asking for features that don't fit our roadmap — what job are they hiring us for?"
  - "We're repositioning and need to understand the unmet needs behind the switching behavior"
estimated_time: "20-30 min"
---
## 目的
系统性探索客户试图完成什么（功能性、社会性、情感性任务）、他们经历的痛点，以及他们期望获得的收益。使用这一框架来发现未满足的需求、验证产品创意，并确保你的解决方案回应的是真实动机，而不仅仅是表层的功能请求。

这不是一份调查问卷，而是一种结构化视角，用于理解客户*为什么*“雇用”你的产品，以及什么会让他们“解雇”它。

## 输入

**最适合提供：** 你正在分析的客户群体（或所分析产品的客户）。
**同样有用：** 可从中挖掘任务、痛点和收益的访谈记录、支持工单或研究资料；以及你关注的情境或触发因素。

调用时一并提供的任何内容——技能名称后的文本、粘贴的上下文内容，或附加的 `ARGUMENTS:` 行——都视为已经给出的答案。使用这些内容，并跳过其已涵盖的问题；不要重复询问。

**空手而来也没问题。** 该技能会先询问客户是谁，以及他们试图取得什么进展，然后再构建 JTBD 分析。

**调用示例：** `Run JTBD for freelance designers using our invoicing tool — here are 6 interview summaries.`

## 核心概念

### 待完成任务框架
JTBD 受 Clayton Christensen 和价值主张画布（Osterwalder）的影响，将客户需求分为三类：

**1. 客户任务：**
- **功能性任务：** 客户需要执行的任务（例如，“发送发票”）
- **社会性任务：** 客户希望他人如何看待自己（例如，“在客户面前显得专业”）
- **情感性任务：** 客户希望获得或避免的情绪状态（例如，“对自己的工作充满信心”）

**2. 痛点：**
- **挑战：** 客户面临的障碍
- **高成本：** 哪些事情耗费了过多的时间、金钱或精力
- **常见错误：** 客户所犯的、原本可以避免的错误
- **未解决的问题：** 当前解决方案中存在的缺口

**3. 收益：**
- **期望：** 哪些方面可以超越当前解决方案
- **节省：** 能够带来惊喜的时间、金钱或精力节省
- **采用因素：** 哪些因素会提高客户改用其他方案的可能性
- **生活改善：** 解决方案如何让生活变得更轻松或更愉快

### 为什么这种结构有效
- **将任务与解决方案分开：** “与我的团队沟通”（任务）≠“电子邮件”（解决方案）
- **揭示深层动机：** 功能性任务可能是“追踪支出”，但情感性任务是“感到自己能够掌控财务”
- **呈现你未曾察觉的竞争：** 客户会“雇用”一些不明显的替代方案（纸笔、电子表格、变通方法）
- **按强烈程度确定优先级：** 并非所有痛点都同等重要——应聚焦最迫切的痛点

### 反模式（这不是什么）
- **不是功能愿望清单：** “我想要 AI、自动化和仪表板”不是一项任务
- **不是人口统计特征：** “千禧一代想要移动优先”是一种用户画像特征，而不是一项任务
- **不能泛泛而谈：** “提高生产力”过于模糊——应深入探究是*哪些*任务，以及*为什么*
- **不是单一维度：** 只关注功能性任务会忽略社会性和情感性动机

### 何时使用
- 早期探索阶段（在你尚未明确解决方案之前）
- 验证产品与市场的契合度（你的解决方案是否满足了正确的任务需求？）
- 确定路线图优先级（哪些任务最令人困扰或最重要？）
- 竞争分析（客户“雇用”竞争对手是为了完成什么任务？）
- 营销信息传达（围绕任务而非功能进行沟通）

### 何时不应使用
- 在产品已经构建完成之后（此时再进行探索为时已晚）
- 用于琐碎功能（不要过度分析细微调整）
- 作为定量验证的替代方案（JTBD 为假设提供依据；数据负责验证假设）

---

## 应用

使用 `template.md` 获取完整的填写结构。

### 第 1 步：定义情境
在探索 JTBD 之前，请明确：
- **目标客户群体：** 你正在研究谁？（参考 `skills/proto-persona/SKILL.md`）
- **情境：** 该任务会在什么情境下产生？（例如，“在管理项目截止日期时……”）
- **当前解决方案：** 他们目前使用什么？（竞争对手、变通方法、什么都不做）

**如果缺少情境：** 开展客户访谈、情境调查或“转换访谈”（了解他们为什么从之前的解决方案转换过来）。

---

### 第 2 步：探索客户任务

#### 功能性任务
询问：“你正在尝试完成哪些任务？”

```markdown
### Functional Jobs:
- [Task 1 customer needs to perform]
- [Task 2 customer needs to perform]
- [Task 3 customer needs to perform]
```

**示例：**
- “核对每月支出以进行税务申报”
- “在 2 小时内完成新团队成员的入职引导”
- “在不停机的情况下将代码部署到生产环境”

**质量检查：**
- **以动词为导向：** 任务是行动（“发送”“分析”“协调”）
- **与解决方案无关：** 不要说“使用电子邮件沟通”，而要说“与远程团队成员沟通”
- **具体明确：** “管理财务”过于宽泛；“跟踪可用于税收抵扣的业务支出”则足够具体

---

#### 社会性任务
询问：“你希望他人如何看待你？”

```markdown
### Social Jobs:
- [Way customer wants to be perceived socially 1]
- [Way customer wants to be perceived socially 2]
- [Way customer wants to be perceived socially 3]
```

**示例：**
- “让高管团队认为我是一个具有战略思维的人”
- “在客户眼中表现得响应及时且值得信赖”
- “让年轻同事觉得我很懂技术”

**质量检查：**
- **针对特定受众：** 客户想给谁留下深刻印象？（老板、客户、同事等）
- **情感分量：** 社会性任务通常比功能性任务更能推动采用

---

#### 情感性任务
询问：“你希望达到或避免什么样的情绪状态？”

```markdown
### Emotional Jobs:
- [Emotional state customer seeks or avoids 1]
- [Emotional state customer seeks or avoids 2]
- [Emotional state customer seeks or avoids 3]
```

**示例：**
- “确信自己没有遗漏重要细节”
- “避免因手动录入数据出错而产生的焦虑”
- “在一天结束时感受到成就感”

**质量检查：**
- **正面与负面：** 既包括他们追求的状态（“感觉一切尽在掌控”），也包括他们希望避免的状态（“避免尴尬”）
- **以研究为基础：** 不要捏造情绪——使用客户原话

---

### 第 3 步：识别痛点

#### 挑战
询问：“哪些障碍正在阻碍你完成这项工作？”

```markdown
### Challenges:
- [Obstacle customer faces 1]
- [Obstacle customer faces 2]
- [Obstacle customer faces 3]
```

**示例：**
- “工具之间无法集成，导致必须手动录入数据”
- “无法了解团队成员正在做什么”
- “审批流程需要 3 天以上，阻碍了工作进展”

---

#### 成本过高
询问：“哪些事情耗费了过多的时间、金钱或精力？”

```markdown
### Costliness:
- [What's too costly in time, money, or effort 1]
- [What's too costly in time, money, or effort 2]
```

**示例：**
- “生成月度报告需要 8 小时的手动工作”
- “聘请一名专家需要花费 1 万美元，我们负担不起”
- “学习使用当前工具需要接受 20 多个小时的培训”

---

#### 常见错误
询问：“你经常犯哪些本可避免的错误？”

```markdown
### Common Mistakes:
- [Frequent error 1]
- [Frequent error 2]
```

**示例：**
- “忘记在重要电子邮件中抄送利益相关者”
- “因缺少收据而错误计算税款抵扣额”
- “不小心覆盖共享文件中其他人的工作成果”

---

#### 未解决的问题
询问：“当前解决方案未能解决哪些问题？”

```markdown
### Unresolved Problems:
- [Problem not solved by current solutions 1]
- [Problem not solved by current solutions 2]
```

**示例：**
- “当前的 CRM 无法跟踪客户健康度评分”
- “当有人在邮件会话中途加入时，电子邮件无法保留对话上下文”
- “现有工具需要我们并不具备的技术专业知识”

---

### 第 4 步：挖掘收益

#### 期望
询问：“解决方案具备哪些特点会让你爱上它？”

```markdown
### Expectations:
- [What could exceed expectations 1]
- [What could exceed expectations 2]
```

**示例：**
- “无需手动标记即可自动对支出进行分类”
- “根据项目状态建议后续步骤”
- “与我们已经使用的工具无缝集成”

---

#### 节省
询问：“在时间、金钱或精力方面实现哪些节省会让你感到满意？”

```markdown
### Savings:
- [Way of saving time, money, or effort 1]
- [Way of saving time, money, or effort 2]
```

**示例：**
- “将报告生成时间从 8 小时缩短到 10 分钟”
- “无需再配备一名全职管理员”
- “将入职培训时间从 2 周缩短到 2 天”

---

#### 采用因素
询问：“哪些因素会促使你从当前解决方案切换过来？”

```markdown
### Adoption Factors:
- [Factor increasing likelihood of adoption 1]
- [Factor increasing likelihood of adoption 2]
```

**示例：**
- “无需提供信用卡信息的免费试用”
- “提供迁移支持，以便导入现有数据”
- “来自与我们类似的公司的客户证言”

---

#### 生活改善
询问：“如果这项工作变得更容易，你的生活会有哪些改善？”

```markdown
### Life Improvement:
- [How solution makes life easier or more enjoyable 1]
- [How solution makes life easier or more enjoyable 2]
```

**示例：**
- “我可以准时下班，而不必为了完成报告而加班”
- “我不会再因为担心错过重要截止日期而承受那么大的压力”
- “我可以专注于战略性工作，而不是繁琐事务”

---

### 第 5 步：确定优先级并验证

- **按痛点强度排序：** 哪些痛点十分迫切，哪些只是轻微困扰？
- **区分必备收益和锦上添花的收益：** 哪些收益会推动用户采用，哪些只是额外加分项？
- **与用户画像交叉核对：** 不同用户画像是否有不同的任务、痛点和收益？（参见 `skills/proto-persona/SKILL.md`）
- **使用数据验证：** 调查更广泛的受众，以确认访谈中获得的 JTBD 洞察

---

## 示例

完整的 JTBD 示例参见 `examples/sample.md`。

小型示例摘录：

```markdown
**Functional Jobs:** Coordinate tasks across a distributed team
**Pains - Challenges:** Team members use different tools, creating silos
**Gains - Savings:** Reduce status reporting time from 3 hours to 15 minutes
```

---

## 常见误区

### 误区 1：混淆任务与解决方案
**表现：** “我需要使用 Slack”或“我需要 AI 驱动的分析功能”

**后果：** 你关注的是某个解决方案，而不是其背后的根本任务。

**修正方法：** 连续问 5 次“为什么？”。“我需要 Slack” → “为什么？” → “为了与团队沟通” → “为什么？” → “为了快速获得答案” → “为什么？” → “为了避免项目延期。”

---

### 误区 2：任务过于笼统
**表现：** “提高工作效率”或“节省时间”

**后果：** 过于模糊，无法为产品决策提供依据。

**修正方法：** 具体化。“节省时间” → “将生成月度报告所需的时间从 8 小时缩短到 1 小时。”

---

### 误区 3：忽略社交/情感任务
**表现：** 只记录功能性任务

**后果：** 你会错过强大的驱动因素。人们通常会基于情感或社交需求购买，而不仅仅是功能需求。

**修正方法：** 在访谈中明确询问感受和他人看法。“解决这个问题会让你有什么感受？”“如果你解决了这个问题，谁会注意到？”

---

### 误区 4：在没有研究的情况下编造 JTBD
**表现：** 根据假设填写模板

**后果：** 你只是在猜测。只有以真实的客户洞察为基础，JTBD 分析才有价值。

**修正方法：** 开展“切换访谈”（询问他们为何从先前的解决方案切换过来）、情境调查或问题验证访谈。

---

### 误区 5：将所有痛点同等对待
**表现：** 列出 20 个痛点，却没有确定优先级

**后果：** 无法明确应该首先解决什么。

**修正方法：** 按强度对痛点排序（迫切与轻微）。询问：“如果我们只能解决一个痛点，解决哪个会产生最大的影响？”

---

## 参考资料

### 相关技能
- `skills/proto-persona/SKILL.md` — 定义具有这些任务、痛点和收益的人群
- `skills/problem-statement/SKILL.md` — JTBD 为“尝试做”和“但是”部分提供依据
- `skills/positioning-statement/SKILL.md` — JTBD 为“有……需求”表述提供依据

### 外部框架
- Clayton Christensen，*与运气竞争*（2016）— 待办任务理论的起源
- Tony Ulwick，*成果导向型创新*（2016）— 对任务和成果进行量化
- Alexander Osterwalder，*价值主张画布*（2014）— 客户任务、痛点和收益框架

### Dean 的工作
- [如适用，请链接到 Dean Peters 的相关 Substack 文章]

### 来源
- 改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的 `prompts/jobs-to-be-done.md`。

---

**技能类型：** 组件  
**建议文件名：** `jobs-to-be-done.md`  
**建议存放位置：** `/skills/components/`  
**依赖项：** 引用 `skills/proto-persona/SKILL.md`  
**使用方：** `skills/positioning-statement/SKILL.md`、`skills/problem-statement/SKILL.md`、`skills/epic-hypothesis/SKILL.md`