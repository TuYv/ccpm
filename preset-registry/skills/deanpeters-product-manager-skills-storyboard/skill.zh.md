---
name: storyboard
argument-hint: "[user and problem]"
description: Create a six-frame storyboard that shows a user's journey from problem to solution. Use when you need a fast narrative for alignment, concept reviews, or demos.
intent: >-
  Create a 6-frame visual narrative that tells the story of a user's journey from problem to solution, using the classic storytelling arc to build empathy, illustrate value, and make abstract product concepts concrete. Use this to align stakeholders, pitch features, communicate vision, or test if your solution resonates emotionally before building it.
type: component
---
## 目的
创建一个 6 帧视觉叙事，运用经典故事弧讲述用户从问题走向解决方案的旅程，从而建立共情、展现价值，并将抽象的产品概念具体化。可使用它来协调利益相关者、推介功能、传达愿景，或在构建解决方案之前测试它能否引发情感共鸣。

这不是 UI 模型，而是一种让产品中人性化的一面鲜活呈现的叙事工具。

## 输入

**最适合提供：** 你想讲述的用户及其从问题到解决方案的故事。
**同样有用：** 情感变化轨迹、你确定必须出现的关键时刻，以及故事板的受众（高管、设计评审人员、销售人员）。

调用时提供的任何内容——技能名称之后的文本、粘贴的上下文内容，或附加的 `ARGUMENTS:` 行——均视为已经给出的答案。使用这些内容并跳过其已涵盖的问题；不要再次询问。

**什么都没准备？也没问题。** 该技能会询问用户是谁，以及他们发生了什么变化，然后构建六个画面。

**调用示例：** `Storyboard: overwhelmed pharmacy tech discovers our auto-refill queue and ends the day on time — for next week's concept review.`

## 核心概念

### 6 帧故事板结构
6 帧格式以经典叙事弧为基础，遵循以下模式：

1. **第 1 帧：主角** — 介绍用户角色及其所处情境
2. **第 2 帧：问题浮现** — 展示他们面临的挑战或障碍
3. **第 3 帧：“糟了”时刻** — 让问题升级，营造紧迫感
4. **第 4 帧：解决方案出现** — 引入你的产品/功能
5. **第 5 帧：“顿悟”时刻** — 展示用户体验到突破的瞬间
6. **第 6 帧：采用解决方案后的生活** — 呈现改善后的状态

### 为什么这种方式有效
- **情感投入：** 故事能够以规格说明无法做到的方式建立共情
- **具体胜于抽象：** 视觉叙事让模糊的概念变得切实可感
- **令人难忘：** 人们对故事的记忆比对功能列表更深刻
- **协调工具：** 利益相关者可以对故事作出反应并提供反馈
- **低保真：** 不需要精致的设计——草图就非常有效

### 反模式（这不是什么）
- **不是用户流程图：** 这是情感叙事，而不是流程文档
- **不是功能演示：** 重点是用户成果，而不是产品能力
- **不是营销文案：** 采用真实可信的叙事，而不是夸张宣传

### 何时使用
- 向利益相关者推介新产品或功能
- 让团队（产品、设计、工程、高管）就用户价值达成一致
- 测试产品创意能否引发情感共鸣
- 在全员大会或投资者会议上传达愿景
- 在构建产品之前验证问题/解决方案匹配度

### 何时不应使用
- 用于技术实现细节时（应改用架构图）
- 当用户问题很简单或已得到充分理解时
- 用作用户研究的替代品时（故事板用于呈现洞察，而不是创造洞察）

---

## 应用

使用 `template.md` 获取完整的填空结构。

### 第 1 步：收集背景信息
在创建故事板之前，请确保你已掌握：
- **角色画像清晰度：** 主角是谁？（参考 `skills/proto-persona/SKILL.md`）
- **问题理解：** 他们面临什么挑战？（参考 `skills/problem-statement/SKILL.md`）
- **解决方案定义：** 什么产品/功能能够提供帮助？（参考 `skills/positioning-statement/SKILL.md`）
- **期望结果：** 对用户而言，成功是什么样的？

**如果缺少背景信息：** 请先开展探索工作。不要凭空捏造角色画像或问题。

---

### 第 2 步：回答 7 个故事板问题

逐一提出以下问题，以构建叙事：

1. **正在经历这一问题的主角是谁？**（姓名、年龄、角色、背景）
2. **描述主角面临的问题或挑战。**
3. **描述问题引发重大状况的“糟了”时刻。**
4. **解决方案是如何被介绍给主角的？**
5. **描述主角使用解决方案并经历“顿悟”时刻的过程。**
6. **使用解决方案后，主角的生活是什么样的？**
7. **你是否有任何特定的视觉风格或渲染要求？**（默认：粗马克笔风格的速写，简约、单色）

---

### 第 3 步：编写 6 帧叙事

根据上述回答，起草叙事：

```markdown
## Generated 6-Frame Storyline

**Frame 1: Introducing the Main Character**
- [Insert description of the main character, their setting, and context]
- [Example: "Sarah, 35, is a freelance graphic designer juggling 10 client projects from her home office"]

**Frame 2: The Problem Emerges**
- [Describe the main character's challenge and how it affects their life]
- [Example: "She's drowning in invoice tracking—8 hours per month chasing late payments via spreadsheets and email"]

**Frame 3: The 'Oh Crap' Moment**
- [Highlight the escalation of the problem into a major issue]
- [Example: "A major client's payment is 2 weeks overdue. Sarah realizes she forgot to follow up because she was focused on design work. The client has now gone silent, and she's anxious about cash flow."]

**Frame 4: The Solution Appears**
- [Explain how the solution is introduced and the main character's initial reaction]
- [Example: "Sarah discovers SmartInvoice, a tool that automatically sends payment reminders at optimal times. She's skeptical—will it sound too pushy?—but decides to try it."]

**Frame 5: The 'Aha' Moment**
- [Show the main character using the solution and experiencing a breakthrough]
- [Example: "Two days later, Sarah receives a notification: 'Client XYZ just paid!' The AI-timed reminder worked—no awkward follow-up call needed. She feels relieved and in control."]

**Frame 6: Life After the Solution**
- [Describe the resolution and how life improves after overcoming the problem]
- [Example: "Sarah now spends 30 minutes per month on invoicing instead of 8 hours. She's reclaimed her evenings, spending time with family instead of chasing payments. Her cash flow is predictable, and her anxiety is gone."]

**Optional Visual Elements**
- [If no visual style specified: "Use fat-marker, sharpie-style sketches—minimal, monochrome, hand-drawn feel"]
- [If visual elements provided: "Include user-provided images, GIFs, or icons"]
```

---

### 第 4 步：将每个画面可视化

为每个画面创建或描述视觉内容：

**画面 1：主角**
- **视觉：** Sarah 坐在书桌前，周围贴满便利贴，笔记本电脑开着，旁边放着咖啡杯
- **氛围：** 忙碌、略显焦虑
- **工具：** DALL·E、MidJourney、手绘草图

**画面 2：问题浮现**
- **视觉：** Sarah 盯着一张标有“逾期发票”的电子表格，浏览器中打开了多个标签页
- **氛围：** 不堪重负
- **细节：** 时钟显示晚上 10 点，待办事项列表越来越长

**画面 3：“糟了”时刻**
- **视觉：** Sarah 的手机上显示通知：“第 14 天：客户 XYZ 的付款已逾期”。她面露担忧。
- **氛围：** 焦虑、紧迫
- **细节：** 日历显示即将到来的房租缴纳日期

**画面 4：解决方案出现**
- **视觉：** Sarah 的笔记本电脑上显示 SmartInvoice 的落地页，标题为“不再催讨付款”
- **氛围：** 好奇、充满希望
- **细节：** 用户评价：“每月为我节省了 5 小时”

**画面 5：“顿悟”时刻**
- **视觉：** Sarah 的手机上显示通知：“客户 XYZ 刚刚付款！已收到 5,000 美元。”她面带微笑，如释重负。
- **氛围：** 喜悦、轻松、自信
- **细节：** 背景中是落日——她提前结束了工作

**画面 6：采用解决方案后的生活**
- **视觉：** Sarah 在后院陪孩子们玩耍，笔记本电脑合上放在露台桌上
- **氛围：** 平静、平衡
- **细节：** 时钟显示下午 6 点（不再是晚上 10 点）

---

### 第 5 步：测试故事板

提出以下问题：
1. **主角能否引起共鸣？** 你的目标用户画像会从中看到自己吗？
2. **问题是否足够切身？** 人们能否在画面 2-3 中*感受到*那种挫败感？
3. **“糟了”时刻是否真实？** 它是否以真实可信的方式加剧了问题？
4. **解决方案的引入是否自然？** 还是让人感觉生硬或刻意？
5. **“顿悟”时刻是否可信？** 用户能否想象自己经历这一刻？
6. **“采用后”的状态是否令人向往？** 用户会想要这样的结果吗？

如果任何一个答案为“否”，请进行修改。

---

## 示例

完整的故事板示例请参阅 `examples/sample.md`。

迷你示例节选：

```markdown
**Frame 1:** Sarah, 35, freelance designer juggling 10 clients\n**Frame 2:** Spends 8 hours/month chasing overdue invoices\n**Frame 3:** $5,000 payment is 2 weeks overdue\n
```

---

## 常见陷阱

### 陷阱 1：用户画像过于宽泛
**表现：** “来认识一下用户，一位忙碌的职场人士”

**后果：** 没有人会对这个角色产生认同感。

**修正：** 具体一些：“来认识一下 Sarah，35 岁，自由职业设计师，同时应对 10 位客户，在家办公，热爱设计但讨厌行政事务。”

---

### 陷阱 2：问题缺乏力度
**表现：** “用户遇到了效率问题”

**后果：** 问题无法引起情感共鸣。

**修正：** 让问题变得切身可感：“Sarah 每月要花 8 小时催讨逾期发票，因此错过与家人共进晚餐，还对现金流感到焦虑。”

---

### 陷阱 3：生硬地引入解决方案
**表现：** “用户神奇地发现了我们的产品”

**后果：** 感觉刻意，不够真实。

**修正：** 展示真实可信的发现过程：“Sarah 在一个设计师论坛中看到推荐”，或者“Sarah 的同事向她提到了这款产品。”

---

### 陷阱 4：以功能为中心的“顿悟”时刻
**表现：** “用户看到仪表盘，并喜欢上了这些功能”

**后果：** 缺乏情感上的满足感。

**修正：** 聚焦结果：“Sarah 收到通知：‘已收到 5,000 美元！’她如释重负——不必再打一通令人尴尬的催款电话。”

---

### 陷阱 5：模糊的“采用后”状态
**表现：** “现在生活变得更好了”

**后果：** 不够令人向往，也不够具体。

**修正：** 具体一些：“Sarah 现在下午 6 点就结束工作，晚上陪伴孩子，而不是催促客户付款。按时付款率从 50% 上升到了 80%。”

---

## 参考资料

### 相关技能
- `skills/proto-persona/SKILL.md` — 定义主角
- `skills/problem-statement/SKILL.md` — 为画面 2-3 构建问题框架
- `skills/positioning-statement/SKILL.md` — 为画面 4 中解决方案的引入提供依据
- `skills/jobs-to-be-done/SKILL.md` — 为画面 6 中的期望结果提供依据

### 外部框架
- Joseph Campbell，*英雄之旅*（1949）— 经典叙事结构
- Pixar 的故事法则 — “很久以前……每一天……直到有一天……”
- Donald Miller，*Building a StoryBrand*（2017）— 故事驱动的营销框架

### Dean 的作品
- 故事板叙事提示词（6 画面故事线生成器）

### 来源
- 改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的 `prompts/storyboard-storytelling-prompt.md`。

---

**技能类型：** 组件
**建议文件名：** `storyboard.md`
**建议放置位置：** `/skills/components/`
**依赖项：** 引用 `skills/proto-persona/SKILL.md`、`skills/problem-statement/SKILL.md`、`skills/positioning-statement/SKILL.md`、`skills/jobs-to-be-done/SKILL.md`