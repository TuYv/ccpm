---
name: epic-hypothesis
argument-hint: "[initiative or epic idea]"
description: Frame an epic as a testable hypothesis with target user, expected outcome, and validation method. Use when defining a major initiative before roadmap, discovery, or delivery planning.
intent: >-
  Frame epics as testable hypotheses using an if/then structure that articulates the action or solution, the target beneficiary, the expected outcome, and how you'll validate success. Use this to manage uncertainty in product development by making assumptions explicit, defining lightweight experiments ("tiny acts of discovery"), and establishing measurable success criteria before committing to full build-out.
type: component
theme: pm-artifacts
best_for:
  - "Framing a major initiative as something that can be proven wrong"
  - "Forcing an outcome and a validation method before build starts"
  - "Giving a team a shared bet to test instead of a scope to deliver"
scenarios:
  - "Leadership approved a big initiative and nobody can say what would prove it wrong"
  - "I need to frame this epic as a bet with a real validation method, not a delivery plan"
estimated_time: "15-20 min"
---
## 目的
使用 if/then 结构，将史诗级事项表述为可测试的假设，明确行动或解决方案、目标受益者、预期结果，以及验证成功的方式。通过显式说明假设、定义轻量级实验（“微型探索行动”），并在投入全面构建之前确立可衡量的成功标准，以此管理产品开发中的不确定性。

这不是需求规格说明，而是你正在测试的假设，并非你已承诺交付的功能。

## 输入

**最适合提供：** 当前已有的计划或史诗级事项构想，无论它现在采用何种形式——一句话就足够。
**同样有用：** 目标用户、预期结果，以及可能的衡量方式（该技能会帮助你进一步明确这三者）。

调用时提供的任何内容——技能名称后的文本、粘贴的上下文转储，或附加的 `ARGUMENTS:` 行——都视为已经给出的答案。使用这些内容并跳过其已涵盖的问题；不要重复询问。

**什么都没准备？也没问题。** 该技能会询问计划是什么以及它面向谁，然后与你一起构建 if/then 假设。

**调用示例：** `Frame as an epic hypothesis: adding usage-based alerts so account admins catch overages before invoice shock.`

## 核心概念

### 史诗级假设框架
该结构受到 Tim Herbig 的 Lean UX 假设格式启发：

**If/Then 假设：**
- **If we** [代表目标用户角色采取的行动或提供的解决方案]
- **for** [目标用户角色]
- **Then we will** [达成或实现理想结果或待完成的任务]

**微型探索行动实验：**
- **We will test our assumption by:**
  - [实验 1]
  - [实验 2]
  - [根据需要添加更多实验]

**验证指标：**
- **We know our hypothesis is valid if within** [时间范围]
- **we observe:**
  - [可量化的可衡量结果]
  - [定性的可衡量结果]
  - [根据需要添加更多结果]

### 此结构为何有效
- **假设驱动：** 迫使你明确陈述自己的判断（而且这种判断可能是错的）
- **聚焦结果：** “Then we will” 强调用户收益，而非功能产出
- **实验优先：** 鼓励在全面构建之前进行轻量级验证
- **可证伪：** 清晰的成功标准使你能够尽早放弃糟糕的想法
- **风险管理：** 将史诗级事项视为押注，而非承诺

### 反模式（这不是什么）
- **不是功能规格说明：** “构建一个包含 5 个图表的仪表板”是一项功能，而不是假设
- **不是必然兑现的承诺：** 假设可能会被推翻（而且也应该允许被推翻）
- **不聚焦产出：** “在 Q2 之前发布功能 X”偏离了重点——它是否实现了预期结果？
- **并非无需实验：** 如果你跳过实验直接进行构建，那么你并不是在测试假设

### 何时使用
- 早期功能探索（在承诺纳入完整路线图之前）
- 验证新能力的产品市场契合度
- 确定待办事项的优先级（假设已得到验证的史诗级事项可获得更高优先级）
- 管理利益相关者的预期（将工作定义为实验，而不是承诺）

### 不适用的情况
- 对于已充分验证的功能（如果你已经验证了需求，可直接进入用户故事阶段）
- 对于简单的功能（不要对小改动过度设计）
- 当实验不可行时（这种情况很少见，但有时你必须在测试前就做出投入决定）

---

## 应用

使用 `template.md` 获取完整的填写结构。

### 第 1 步：收集背景信息
在起草史诗假设之前，请确保你已掌握：
- **问题理解：** 这解决了什么用户问题？（参考 `skills/problem-statement/SKILL.md`）
- **目标用户画像：** 谁会从中受益？（参考 `skills/proto-persona/SKILL.md`）
- **待办任务：** 他们试图实现什么结果？（参考 `skills/jobs-to-be-done/SKILL.md`）
- **当前替代方案：** 用户目前是如何处理的？（竞争产品、变通方法、什么都不做）

**如果缺少背景信息：** 请先开展探索性访谈或问题验证工作。

---

### 第 2 步：起草 If/Then 假设

填写模板：

```markdown
### If/Then Hypothesis

**If we** [action or solution on behalf of the target persona]
**for** [target persona]
**Then we will** [attain or achieve a desirable outcome or job-to-be-done for the persona]
```

**质量检查：**
- **“If we” 要具体：** 不要写“改进产品”，而应写“在任务分配时添加一键式 Slack 通知”
- **“For” 是明确的用户画像：** 不要写“用户”，而应写“同时协调 3 个以上分布式团队的远程项目经理”（参考 `skills/proto-persona/SKILL.md`）
- **“Then we will” 是结果：** 不要写“用户将收到通知”，而应写“用户响应任务分配的速度将提高 50%”

**示例：**
- ✅ “如果我们为试用用户添加一键式 Google Calendar 集成，那么我们将在 30 天内把激活率提高 20%”
- ✅ “如果我们为管理 1000 个以上项目的高级用户提供批量删除功能，那么我们将把清理任务所花费的时间减少 70%”
- ❌ “如果我们构建一个仪表盘，那么用户就会使用它”（含糊且不可衡量）

---

### 第 3 步：设计微型探索行动实验

在构建完整史诗之前，定义轻量级实验来检验假设：

```markdown
### Tiny Acts of Discovery Experiments

**We will test our assumption by:**
- [Experiment 1: low-cost, fast test]
- [Experiment 2: another low-cost, fast test]
- [Add more as necessary]
```

**实验类型：**
- **原型 + 用户测试：** 使用可点击原型模拟该功能，并让 5-10 名用户进行测试
- **礼宾式测试：** 为少数用户手动执行该功能，观察他们是否认为它有价值
- **落地页测试：** 描述该功能，衡量注册量或兴趣度
- **绿野仙踪测试：** 将该功能呈现为自动化功能，但在后台由人工执行
- **A/B 测试（如果可行）：** 测试轻量级版本与对照版本

**质量检查：**
- **快速：** 实验应耗时数天或数周，而不是数月
- **低成本：** 避免完整的工程构建——使用原型、手动流程或现有工具
- **可证伪：** 设计能够证明你*错了*的实验

**示例：**
- “创建批量删除流程的 Figma 原型，并邀请 5 名资深用户进行测试”
- “手动向 10 名试用用户发送 Slack 通知，并跟踪响应时间”
- “在 UI 中添加一个‘请求此功能’按钮，并衡量点击率”

---

### 第 4 步：定义验证指标

明确成功的标准以及评估的时间范围：

```markdown
### Validation Measures

**We know our hypothesis is valid if within** [timeframe in days or weeks]
**we observe:**
- [Desirable quantitative, measurable outcome]
- [Desirable qualitative, measurable outcome]
- [Add more as necessary]
```

**质量检查：**
- **时间范围合理：** 不能是“6 个月内”（太慢）或“3 天内”（太快）
- **定量指标具体：** 不能是“更多用户”，而应是“激活率提高 20%”
- **定性指标可观察：** 不能是“用户喜欢它”，而应是“10 名用户中有 8 名表示愿意为此功能付费”

**示例：**
- ✅ “在 4 周内，我们观察到：”
  - “激活率从 40% 提高到 50%（定量）”
  - “75% 接受调查的试用用户表示，该集成为他们节省了时间（定性）”
- ❌ “在 1 年内，我们观察到：”
  - “收入增长”（太模糊、时间太长）

---

### 第 5 步：运行实验并评估

- **执行实验：** 构建原型、运行测试、收集数据
- **衡量结果：** 是否达到了验证指标？
- **决策点：**
  - ✅ **假设得到验证：** 继续编写用户故事并将其添加到路线图
  - ❌ **假设被证伪：** 终止该史诗或转向其他假设
  - ⚠️ **结论不明确：** 运行更多实验或收紧验证指标

---

### 第 6 步：转换为用户故事（如果已验证）

假设得到验证后，将史诗拆分为用户故事：

```markdown
### Epic: [Epic Name]

**Stories:**
1. [User Story 1 - reference `skills/user-story/SKILL.md`]
2. [User Story 2]
3. [User Story 3]
```

---

## 示例

完整的史诗假设示例请参阅 `examples/sample.md`。

简短示例摘录：

```markdown
**If we** provide one-click Google Calendar integration
**for** trial users managing multiple meetings
**Then we will** increase activation rate from 40% to 50%
```

---

## 常见误区

### 误区 1：假设描述的是功能，而非成果
**表现：** “如果我们构建一个仪表板，那么我们就会拥有一个仪表板”

**后果：** 你描述的是产出，而非成果。这无法检验任何内容。

**修正：** 聚焦于用户成果：“如果我们构建一个显示实时任务状态的仪表板，那么项目经理用于询问状态更新的时间将减少 50%。”

---

### 误区 2：跳过实验
**表现：** “我们将通过构建完整功能来检验我们的假设”

**后果：** 你在验证之前就已经承诺构建功能。这不是假设，而是功能开发承诺。

**修正：** 设计轻量级实验（原型、礼宾式测试、落地页），耗时应以天或周计算，而不是数月。

---

### 误区 3：验证指标模糊
**表现：** “如果用户感到满意，我们就知道它是有效的”

**后果：** 成功标准主观且无法衡量。

**修复方法：** 定义具体且可证伪的指标：“80% 的受访用户对该功能的评分达到 4 分或以上（满分 5 分）”，或“响应时间缩短 50%”。

---

### 陷阱 4：不切实际的时间范围
**症状：** “如果 6 个月内收入有所增长，我们就知道它是有效的”

**后果：** 速度太慢，无法为决策提供依据。到那时，你已经把它构建出来了。

**修复方法：** 将验证周期控制在 2–4 周。如果无法在该时间范围内进行衡量，请选择一个领先指标（例如激活率，而不是年度收入）。

---

### 陷阱 5：将 Epic 视为承诺
**症状：** “我们已经告诉 CEO 会发布这个功能，所以必须验证它”

**后果：** 实验成了走过场——无论结果如何，你都会构建它。

**修复方法：** 在做出承诺*之前*，将 Epic 表述为假设。如果利益相关者需要确定性，请解释构建未经验证的功能所带来的风险。

---

## 参考资料

### 相关 Skill
- `skills/problem-statement/SKILL.md` — 假设应针对一个已验证的问题
- `skills/proto-persona/SKILL.md` — 定义“面向 [persona]”部分
- `skills/jobs-to-be-done/SKILL.md` — 为“那么我们将”结果提供依据
- `skills/user-story/SKILL.md` — 将经过验证的 Epic 分解为用户故事
- `skills/user-story-splitting/SKILL.md` — 如何将经过验证的 Epic 拆分为用户故事

### 外部框架
- Tim Herbig，*Lean UX Hypothesis Statement* — if/then 假设格式的起源
- Jeff Gothelf 与 Josh Seiden，*Lean UX*（2013）— 假设驱动的产品开发
- Alberto Savoia，*Pretotype It*（2011）— 用于验证想法的轻量级实验
- Eric Ries，*The Lean Startup*（2011）— 构建-衡量-学习循环

### Dean 的工作
- Backlog Epic Hypothesis Prompt（灵感来自 Tim Herbig 的框架）

### 来源
- 改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的 `prompts/backlog-epic-hypothesis.md`。

---

**Skill 类型：** 组件
**建议的文件名：** `epic-hypothesis.md`
**建议的放置位置：** `/skills/components/`
**依赖项：** 引用 `skills/problem-statement/SKILL.md`、`skills/proto-persona/SKILL.md`、`skills/jobs-to-be-done/SKILL.md`
**使用方：** `skills/user-story/SKILL.md`、`skills/user-story-splitting/SKILL.md`