---
# AGENT SKILLS STANDARD FIELDS (v2)
name: individual-spacing-algorithm-explainer
description: "Explain and configure individual spacing algorithms using student performance data and forgetting curves. Use when personalising retention schedules in adaptive learning platforms."
disable-model-invocation: true
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "ai-learning-science/individual-spacing-algorithm-explainer"
skill_name: "Individual Spacing Algorithm Explainer"
domain: "ai-learning-science"
version: "1.0"
evidence_strength: "strong"
evidence_sources:
  - "Ebbinghaus (1885/1913) — Memory: A contribution to experimental psychology (forgetting curve)"
  - "Cepeda et al. (2006) — Distributed practice in verbal recall tasks: A review and quantitative synthesis (meta-analysis)"
  - "Lindsey et al. (2014) — Improving students' long-term knowledge retention through personalized review"
  - "Settles & Meeder (2016) — A trainable spaced repetition model for language learning (Duolingo half-life regression)"
  - "Pashler et al. (2007) — Organizing instruction and study to improve student learning (IES practice guide)"
input_schema:
  required:
    - field: "content_to_space"
      type: "string"
      description: "The specific knowledge or skills that need to be retained over time — what students need to remember"
    - field: "performance_data"
      type: "string"
      description: "What is known about the students' current retention — test scores, quiz results, recall accuracy, or informal observations of what they remember and forget"
  optional:
    - field: "student_level"
      type: "string"
      description: "Age/year group and proficiency level"
    - field: "subject_area"
      type: "string"
      description: "The curriculum subject"
    - field: "time_horizon"
      type: "string"
      description: "How long the knowledge needs to be retained — until an exam, end of year, or permanently"
    - field: "available_review_slots"
      type: "string"
      description: "How many review sessions per week are realistically available"
    - field: "system_context"
      type: "string"
      description: "Whether the spacing will be implemented by a teacher manually, embedded in an AI system, or managed through a tool like Anki or Quizlet"
output_schema:
  type: "object"
  fields:
    - field: "spacing_schedule"
      type: "object"
      description: "The personalised review schedule — when each item should be reviewed and why"
    - field: "algorithm_explanation"
      type: "object"
      description: "A teacher-friendly explanation of how the spacing algorithm works and why these intervals were chosen"
    - field: "priority_ranking"
      type: "array"
      description: "Items ranked by forgetting risk — which items need review most urgently"
    - field: "implementation_guidance"
      type: "object"
      description: "Practical advice for implementing the schedule in a real classroom or system"
chains_well_with:
  - "adaptive-hint-sequence-designer"
  - "formative-assessment-loop-designer"
  - "retrieval-practice-designer"
teacher_time: "5 minutes"
tags: ["spacing", "spaced-repetition", "forgetting-curve", "Ebbinghaus", "Lindsey", "Duolingo", "retention", "memory", "algorithm"]
---
# 个性化间隔算法说明

## 此技能的作用

根据学生表现数据，针对特定的一组知识项目生成个性化的间隔重复计划，并以教师易于理解的方式解释算法逻辑。此技能不会执行间隔算法——执行需要依赖 Anki、Quizlet、SuperMemo 或 Kaku 自有的记忆保持引擎等系统。此技能的作用是进行设计和解释：根据学生已经掌握的内容以及正在遗忘的内容，生成具体的复习计划，并清晰说明为什么为每个项目选择相应的间隔。间隔学习研究的核心洞见是：最佳复习间隔取决于期望的保持时长以及该项目当前的记忆强度。Ebbinghaus（1885）确立了遗忘遵循可预测曲线这一事实——曲线在最初阶段下降陡峭，随后逐渐趋于平缓。Cepeda 等人（2006）通过一项综合性元分析证明，与将同等数量的练习集中在一次学习中相比，将复习分散到一段时间内能够显著提升长期保持效果。实际挑战在于，每位学生、每个项目的最佳间隔都不相同，这正是个性化至关重要的原因。AI 在这里尤其有价值，因为对于机器而言，为每位学生计算几十个项目的最佳间隔在计算上微不足道，但教师手动完成这项工作在实践中几乎不可能。

## 证据基础

Ebbinghaus（1885/1913）开展了关于遗忘的奠基性实验，证明新学习材料的记忆会以指数形式衰减，但每次后续复习都会强化记忆痕迹并减缓遗忘速度。这条“遗忘曲线”是所有间隔算法的理论基础。Cepeda 等人（2006）对 254 项有关分散练习的研究进行了元分析，发现间隔效应广泛存在于各种材料和不同年龄群体中。他们发现，最佳学习间隔（ISI）取决于保持间隔（RI）——也就是需要使用这些知识之前的时间。根据他们的分析，一个粗略的指导原则是：最佳 ISI 约为 RI 的 10-20%。因此，如果你需要在 30 天后的考试中使用某项知识，最佳间隔大约是每 3-6 天复习一次。Lindsey 等人（2014）将间隔学习研究带入真实课堂，测试了一种个性化间隔算法，帮助中学生学习社会学科内容。该算法根据每位学生的表现调整复习间隔；与教师选择的集中复习计划相比，他们发现学生的长期保持效果有显著提升。更重要的是，个性化算法优于“一刀切”的间隔计划，证明了个体校准的价值。Settles 和 Meeder（2016）开发了 Duolingo 使用的“半衰期回归”模型。该模型根据学生与某个项目的个人学习历史，预测学生在特定时间点回忆起该项目的概率。模型结合了三个变量：该项目被看过的次数、距离上次复习的时间，以及学生在类似项目上的准确率。这代表了当前实用型大规模间隔算法的先进水平。Pashler 等人（2007）在 IES 实践指南中将间隔学习研究转化为实用建议，并指出，尽管间隔学习拥有坚实的证据基础，教师却很少使用它——部分原因是它需要提前规划，部分原因是它违反直觉（学生在集中练习后会感觉更有信心，尽管间隔练习能够带来更好的保持效果）。

## 输入架构

教师必须提供：
- **需要间隔复习的内容：** 学生需要保留的知识。*例如：“八年级生物：细胞器及其功能——线粒体、细胞核、细胞膜、核糖体、叶绿体、液泡、细胞壁” / “第一次世界大战的关键日期和起因” / “法语不规则动词变位——être、avoir、aller、faire” / “6-12 的乘法表”*
- **表现数据：** 关于当前记忆保持情况的已知信息。*例如：“上周五的专题结束测验：全班平均分为 72%。大多数学生能正确回答线粒体和细胞核，但把核糖体与粗面内质网混淆。有三名学生得分低于 50%” / “非正式提问表明，大多数学生记得起因，但记不住日期” / “类似 Duolingo 的准确率：être 95%，avoir 88%，aller 71%，faire 62%”*

可选项（如果可用，由上下文引擎注入）：
- **学生水平：** 年级和熟练程度
- **学科领域：** 课程所属学科
- **时间跨度：** 知识需要保持多长时间
- **可用复习时段：** 每周实际可以安排多少次复习
- **系统上下文：** 手动实施、嵌入 AI，或基于工具的实施

## 提示词

```
You are an expert in the cognitive science of memory and spaced repetition, with deep knowledge of Ebbinghaus's (1885) forgetting curve, Cepeda et al.'s (2006) meta-analysis of distributed practice, Lindsey et al.'s (2014) personalised spacing research, Settles & Meeder's (2016) half-life regression model from Duolingo, and Pashler et al.'s (2007) IES practice guide on organising instruction. You understand both the theory (why spacing works — memory consolidation, retrieval practice, desirable difficulty) and the practical challenge (designing a schedule that a real teacher can actually implement).

CRITICAL PRINCIPLES:
- **The forgetting curve is exponential, but each retrieval slows it.** New material needs review soon (within 1-2 days). Each successful retrieval strengthens the memory trace and extends the optimal interval. Items retrieved 5+ times can go weeks or months between reviews.
- **The optimal interval depends on the retention horizon.** Cepeda et al.'s (2006) guideline: the optimal inter-study interval is roughly 10-20% of the time until the knowledge is needed. Short-term retention (exam next week) = short intervals. Long-term retention (GCSE in 2 years) = longer intervals with gradual expansion.
- **Not all items need the same schedule.** Items the student already knows well need less frequent review. Items they are forgetting need urgent, short-interval review. The schedule must be PERSONALISED to the performance data.
- **Prioritise by forgetting risk, not by importance.** A student who remembers mitochondria perfectly doesn't need to review mitochondria, even if it's "important." The schedule should target the items with the HIGHEST probability of being forgotten before the next review opportunity.
- **Explain the algorithm in plain English.** Teachers are not data scientists. The explanation must be clear, concrete, and jargon-free. "Review ribosomes on Tuesday because your students got it wrong last Friday and the forgetting curve suggests they'll have forgotten it by Wednesday" — not "Apply exponential decay function with λ = 0.3."

Your task is to design a personalised spacing schedule for:

**Content to space:** {{content_to_space}}
**Performance data:** {{performance_data}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Student level:** {{student_level}} — if not provided, design for a general secondary school context.
**Subject area:** {{subject_area}} — if not provided, infer from the content.
**Time horizon:** {{time_horizon}} — if not provided, assume the knowledge needs to be retained for at least one term (10-12 weeks).
**Available review slots:** {{available_review_slots}} — if not provided, assume 2-3 short review opportunities per week (5-10 minutes each).
**System context:** {{system_context}} — if not provided, design for a teacher implementing the schedule manually (low-tech, practical).

Return your output in this exact format:

## Personalised Spacing Schedule: [Content Area]

**Content:** [What needs to be retained]
**Performance snapshot:** [Summary of current retention state]
**Time horizon:** [How long the knowledge needs to last]
**Schedule basis:** [Brief explanation of why these intervals were chosen]

### Forgetting Risk Analysis

[For each item or item cluster, estimate the current forgetting risk based on the performance data. Rank from highest risk to lowest. Explain in plain English why each item is where it is.]

### Review Schedule

[A concrete, week-by-week schedule showing when each item should be reviewed. Include the format of review (quiz, flashcard, retrieval practice, application task) and the rationale for each timing decision.]

**Week 1:**
- [Day]: [Items to review] — [Why now, what format]

**Week 2:**
- [Day]: [Items to review] — [Why now, what format]

[Continue for the full time horizon or until the schedule stabilises into a maintenance pattern]

### Algorithm Explanation (Teacher-Friendly)

[Explain how the schedule was designed — in plain English. Cover: why items are reviewed at different intervals, why some items appear more often than others, how the schedule adapts if students get items right or wrong, and the underlying principle (each successful retrieval extends the interval).]

### Adaptation Rules

[What to do when students get items RIGHT (extend the interval) and when they get items WRONG (shorten the interval). Provide specific, actionable rules a teacher can follow.]

### Implementation Tips

[Practical advice for actually running this schedule in a classroom — including how to keep it manageable, how to adjust when time is short, and common mistakes to avoid.]

**Self-check before returning output:** Verify that (a) the schedule is personalised to the performance data, (b) high-forgetting-risk items are scheduled more frequently, (c) intervals expand over time for well-retained items, (d) the algorithm explanation is in plain English, and (e) the schedule is realistic for the available review time.
```

## 示例输出

**情境：** *待讲内容：“八年级生物：细胞器及其功能——线粒体、细胞核、细胞膜、核糖体、叶绿体、液泡、细胞壁” / 学习表现数据：“上周五的专题结束测验：全班平均分 72%。逐题分析：线粒体答对率 91%，细胞核 88%，细胞膜 74%，细胞壁 69%，叶绿体 65%，液泡 58%，核糖体 41%。最常见的错误：将核糖体与粗面内质网混淆，以及将液泡的功能（储存）与细胞膜的功能（选择透过性）混淆” / 时间范围：“距离年终考试还有 14 周” / 可用复习时段：“每周两次 5 分钟的课堂开始活动（周二和周四）” / 学生水平：“八年级，能力水平不一”*

---

## 个性化间隔复习计划：细胞器

**内容：** 7 种细胞器及其功能（线粒体、细胞核、细胞膜、核糖体、叶绿体、液泡、细胞壁）  
**表现概览：** 全班平均分 72%。两项掌握较好（线粒体 91%，细胞核 88%）。两项掌握一般（细胞膜 74%，细胞壁 69%）。三项掌握较弱（叶绿体 65%，液泡 58%，核糖体 41%）。  
**时间范围：** 距离年终考试还有 14 周  
**计划依据：** 遗忘风险最高的内容（核糖体、液泡、叶绿体）需要立即且频繁地复习。已经掌握较好的内容（线粒体、细胞核）只需要进行最低限度的复习，以防止其在 14 周内缓慢衰退。该计划遵循逐渐延长间隔的模式：最初间隔较短，随着每项内容被成功回忆，间隔逐步延长。

### 遗忘风险分析

| 内容 | 上次得分 | 遗忘风险 | 优先级 | 理由 |
|---|---|---|---|---|
| 核糖体 | 41% | 严重 | 1 | 已经低于 50%。如果本周不复习，能够接近完全回忆不出的状态。将核糖体与粗面内质网混淆表明存在概念理解缺口，而不仅仅是记忆薄弱。 |
| 液泡 | 58% | 高 | 2 | 仅略高于猜测水平。与细胞膜功能的混淆表明，学生形成的知识表征不牢固且容易混淆。 |
| 叶绿体 | 65% | 高 | 3 | 低于全班平均分。学生可能将其与线粒体混淆（两者都与能量有关）。需要在这种混淆固化之前进行复习。 |
| 细胞壁 | 69% | 中等 | 4 | 略低于平均分。概念相对直接，但学生可能将其与细胞膜混淆。 |
| 细胞膜 | 74% | 中等 | 5 | 处于全班平均水平。选择透过性这一概念较为抽象，如果没有强化，很可能会逐渐淡忘。 |
| 细胞核 | 88% | 低 | 6 | 回忆情况良好。在第 3 至第 4 周进行一次复习，应该足以维持掌握程度。 |
| 线粒体 | 91% | 低 | 7 | 掌握最牢固的内容。只有在时间允许时才复习，或者将其与比较任务结合起来（比较线粒体与叶绿体）。 |

### 复习计划

**第 1 周：**
- **周二：** 核糖体和液泡（5 分钟）。形式：提取练习——“不要查看笔记，写下核糖体的功能以及它们存在的位置。然后对液泡做同样的练习。”随后立即提供纠正性反馈。这两项内容处于严重风险之中，需要在测验后的 4 天内进行提取练习。
- **周四：** 叶绿体和细胞壁（5 分钟）。形式：比较任务——“叶绿体与线粒体有何不同？细胞壁与细胞膜有何不同？”比较能够迫使学生区分常被混淆的成对概念。

**第 2 周：**
- **星期二：** 核糖体、液泡和叶绿体（5 分钟）。形式：快速问答测验——6 道题，每题 30 秒。再次出现核糖体和液泡，因为它们是掌握得最薄弱的内容；再次出现叶绿体，因为对比任务可能还没有完全消除混淆。
- **星期四：** 细胞膜和细胞壁（5 分钟）。形式：应用——“将一个植物细胞放入盐水中。接下来发生的事情涉及哪些细胞器？每个细胞器发挥什么作用？”这会在功能情境中复习细胞膜和细胞壁。

**第 3 周：**
- **星期二：** 核糖体和液泡（5 分钟）。如果第 2 周星期二的测验显示出进步，则使用更有难度的形式：“解释为什么一个核糖体受损的细胞最终会死亡。”如果掌握情况仍然薄弱，则回到基础提取。
- **星期四：** 全部 7 种细胞器（5 分钟）。形式：根据记忆绘图并标注——“画一个植物细胞，并尽可能多地标出细胞器及其功能。”第一次进行完整复习。自最初的测验以来，线粒体和细胞核首次在这里出现——对于回忆率为 88-91%、且需要保持 14 周的内容来说，间隔 2 周是合适的。

**第 4 周：**
- **星期二：** 叶绿体，以及星期四绘图中答错的内容（5 分钟）。自适应复习——复习被遗忘的内容。
- **星期四：** 核糖体和液泡（5 分钟）。对最薄弱内容进行第三次复习。如果学生目前的掌握率已经超过 80%，就可以开始延长间隔。

**第 5-6 周：**
- **每周一次**复习核糖体、液泡和叶绿体（最初掌握薄弱的内容）。形式：交错提取——将细胞器问题与其他生物学主题混合，以增加难度。复习间隔已从每周两次延长到每周一次，因为这些内容现在应该正在得到巩固。
- **每周一次**复习细胞膜和细胞壁，现在采用更长的间隔。

**第 7-10 周：**
- **每 10 天一次**复习全部 7 种细胞器，并与其他主题交错进行。到这个阶段，内容应该已经足够稳定，可以采用更长的间隔。使用多样化的形式：选择题、简答题、图示标注题和应用题。

**第 11-14 周（考前）：**
- **每周一次综合复习**，在其他复习主题的同时覆盖全部 7 种细胞器。此时复习间隔大约为每周一次——对于已经成功提取 5-6 次、并且还需要保持 3-4 周的内容来说，这一间隔是合适的。

### 算法说明（教师友好版）

以下是这一安排背后的逻辑，用通俗的方式说明：

**为什么不同内容采用不同的安排：**把每一段记忆想象成一块电池。测验告诉我们，哪些电池是满电的（线粒体——91%），哪些是半充电的（细胞膜——74%），哪些几乎没电了（核糖体——41%）。几乎没电的电池需要立即且频繁地充电。满电的电池只需要每隔几周补充一次电量。

**为什么要延长间隔：**每当学生成功回忆起某个内容时，这段记忆就会变得更牢固——能够保持更长时间。因此，在学生正确回忆“核糖体制造蛋白质”三次之后，他们就不需要在一周内再次看到这个内容了。成功回忆五次之后，他们可能两周内都不需要再次复习。随着记忆不断巩固，复习安排会自动延长。

**10-20% 规则：**研究（Cepeda 等，2006）提出了一条实用准则：两次复习之间的间隔，应大约为知识被需要之前总时间的 10-20%。你的考试在 14 周后（98 天），因此，对于已经熟悉的内容，“保持性”复习间隔大约是每 10-20 天一次。对于新内容或薄弱内容，间隔一开始会短得多，然后逐渐延长至这一范围。

**为什么会安排比较和应用任务：**提取练习（“写下你记得的内容”）能够强化记忆。但比较任务（“X 与 Y 有何不同？”）和应用任务（“当……时会发生什么？”）不仅能构建记忆，也能构建理解。复习计划在早期使用基础提取任务（此时记忆还比较脆弱），在后期使用要求更高的任务形式（此时记忆已经足够稳定，可以应对更难的问题）。

### 调整规则

**当学生答对某项内容时：**
- 如果是第一次正确提取：安排在 3-4 天后进行下一次复习
- 如果是第二次正确提取：安排在 7 天后复习
- 如果是第三次正确提取：安排在 14 天后复习
- 如果是第四次或之后答对：安排在 21 天后复习，之后保持 2-3 周的间隔

**当学生答错某项内容时：**
- 将间隔重置为 1-2 天——该内容回到“关键”状态
- 使用不同的提取形式（如果学生在测验中答错，可以尝试比较任务）
- 不要只是重新讲授该内容——应先让学生尝试提取，即使他们会答错，然后再提供纠正性反馈。失败的提取尝试实际上会强化之后的学习效果（Kornell 等，2009）。

### 实施建议

1. **保持简单。**你每周有两个 5 分钟的时间段。不要试图追踪每个学生的间隔复习计划——这正是 Kaku 这类 AI 系统的工作。相反，应使用班级层面的表现数据来决定哪些内容需要复习以及何时复习。

2. **使用小白板或离堂卡。**在 5 分钟内进行提取练习，最快的方法是使用小白板（“告诉我：核糖体的作用是什么？”）或离堂卡。这些方式也能快速提供表现数据，帮助你调整复习计划。

3. **不要在复习时间段重新讲授。**这 5 分钟的开场活动是用于提取，而不是重新讲授。如果学生想不起来，让他们短暂地努力回忆，然后展示答案并继续进行。这个努力过程是有益的——它会强化记忆痕迹，为下一次复习做好准备。

4. **第 4 周后进行交错练习。**当各项内容已经复习过 2-3 次后，开始将它们与其他主题混合。交错练习感觉上更困难（学生会觉得自己没那么有把握），但与集中复习相比，它能带来更好的长期保持效果。

5. **复习计划是起点，不是脚本。**如果周二的测验显示核糖体相关内容的正确率已经升至 85%，很好——将它们调整到更长的间隔。如果叶绿体相关内容的正确率降至 50%，就将它们调回更短的间隔。复习计划应根据学生实际记住的内容进行调整，而不是根据你希望他们记住的内容。

---

## 已知局限

1. **此技能负责设计和解释间隔复习计划，但不会执行该计划。**执行需要教师手动实施复习计划（可行，但需要投入精力），或者使用 Anki、Quizlet 或 Kaku 这类能够追踪每项内容的个人历史记录并自动计算间隔的系统。上述复习计划使用的是班级层面的数据；真正个性化的间隔复习需要追踪个人层面的数据，如果没有技术支持，这在实际操作中并不可行。

2. **最佳间隔周期只是近似值。** Cepeda 等人（2006 年）提出的 10-20% 指南是一条有用的启发式原则，而不是精确公式。实际的最佳间隔取决于材料难度、编码质量、个体差异以及所需的提取类型。上述安排是一个有原则的起点，而不是经过数学优化的解决方案。

3. **间隔学习适用于事实性知识和概念性知识，但对程序性技能的研究较少。** 现有证据主要集中在词汇、事实回忆和概念理解方面。对于复杂的程序性技能（文章写作、数学问题求解），间隔效应仍然适用于构成这些技能的知识，但作为整体的技能可能需要不同的练习结构。

4. **学生的执行意愿是决定性约束。** 如果学生实际上不进行复习，那么世界上最好的间隔算法也会失效。在课堂环境中，教师可以控制复习安排。在家庭作业或自主学习环境中，许多学生会集中练习（临时抱佛脚），因为这让人感觉更有效，尽管事实并非如此（Pashler 等人，2007 年）。复习安排必须得到执行，而不能只是被设计出来。