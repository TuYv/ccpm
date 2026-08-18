---
# AGENT SKILLS STANDARD FIELDS (v2)
name: ai-hallucination-fact-check-protocol
description: "Design a fact-checking protocol for AI-generated text, extending SIFT with AI-specific adaptations for hallucination detection. Use when students need to verify AI claims and citations."
disable-model-invocation: false
user-invocable: true
effort: medium

# EXISTING FIELDS

skill_id: "ai-literacy/ai-hallucination-fact-check-protocol"
skill_name: "AI Hallucination Fact-Check Protocol"
domain: "ai-literacy"
version: "1.0"
contributor: "Gareth Manning"
evidence_strength: "moderate"
evidence_sources:
  - "Wineburg & McGrew (2017) — Lateral reading: reading less and learning more when evaluating digital information"
  - "Wineburg & McGrew (2019) — Lateral reading and the nature of expertise"
  - "Caulfield (2019) — SIFT: the four moves (Stop, Investigate, Find better coverage, Trace claims)"
  - "Breakstone et al. (2021) — Students' civic online reasoning: a national portrait"
  - "Ji et al. (2023) — Survey of hallucination in natural language generation"
input_schema:
  required:
    - field: "ai_output_context"
      type: "string"
      description: "The type of AI-generated content students are fact-checking — e.g. 'ChatGPT explanation of the French Revolution with cited historian names', 'AI research summary with statistics about teen mental health'"
    - field: "student_level"
      type: "string"
      description: "Age/year group and digital literacy level"
  optional:
    - field: "subject_area"
      type: "string"
      description: "The discipline — affects what hallucination types are most common and how to verify claims"
    - field: "hallucination_risk"
      type: "string"
      description: "The specific hallucination type most likely in this context — citation fabrication, statistical invention, event misattribution, false consensus claims"
    - field: "verification_resources"
      type: "string"
      description: "What verification tools students have access to — library databases, Google Scholar, specific trusted websites"
    - field: "ai_tool"
      type: "string"
      description: "Which AI tool students are fact-checking output from"
output_schema:
  type: "object"
  fields:
    - field: "hallucination_taxonomy"
      type: "object"
      description: "The types of AI hallucination most likely in this subject/context, with examples of what each looks like"
    - field: "ai_sift_protocol"
      type: "object"
      description: "AI-adapted SIFT protocol with each move modified for LLM output — replacing 'Investigate the source' with 'Reconstruct the source'"
    - field: "verification_moves"
      type: "array"
      description: "Step-by-step moves for checking each type of AI claim — statistics, citations, named studies, event claims, expert quotes"
    - field: "hallucination_hunt_activity"
      type: "object"
      description: "Structured classroom activity with instructions, verification steps, and discussion protocol"
    - field: "teacher_modelling_script"
      type: "string"
      description: "Think-aloud script demonstrating finding a real vs. fabricated AI citation"
chains_well_with:
  - "source-credibility-evaluation-protocol"
  - "ai-output-critical-audit-designer"
  - "media-literacy-deconstruction-protocol"
teacher_time: "4 minutes"
tags: ["AI-literacy", "hallucination", "fact-checking", "SIFT", "lateral-reading", "AI-citations", "verification"]
---
# AI 幻觉事实核查协议

## 此技能的作用

生成一套专门针对 AI 生成文本调整的事实核查协议：在 SIFT 框架（Caulfield，2019）的基础上，加入针对 LLM 幻觉独特挑战的 AI 专属核查步骤。标准的横向阅读假定信息来源有一位可以调查其资金来源和可信度的机构作者。但对于 AI 生成的文本而言，这一假定不成立：没有作者可供调查，没有机构资金来源可供核查，也没有可供审视的“关于我们”页面。剩下的只有“追溯论断”这一环节，而该环节需要针对 AI 进行专门调整。AI 幻觉有多种形式：捏造引用（提及一项并不存在的研究，或研究确实存在但从未发表）、虚构统计数据（一个精确程度看似合理、却没有可验证来源的数字）、错误归属的真实引用（一篇真实论文被归给错误的作者或期刊），以及虚假的共识论断（声称“多数科学家都同意”，但实际上并不存在这样的共识）。每一种形式都需要不同的核查步骤。输出内容包括针对特定学科领域的幻觉类型分类体系、适配 AI 的 SIFT 协议、针对每种论断类型的具体核查步骤、一个“幻觉搜寻”课堂活动，以及一份教师示范脚本，用于展示查找到真实引用与查找到捏造引用之间的区别。

## 证据基础

Wineburg & McGrew（2017，2019）通过实证研究确立了这样一个结论：专业事实核查员在信息来源评估方面胜过学生和教授，因为他们使用横向阅读——立即打开新标签页，核查外部来源如何评价某一信息来源——而不是纵向阅读（通过分析信息来源本身的可信度线索来进行判断）。这项研究是 SIFT 框架的基础。然而，横向阅读最初是为具有可供调查的机构身份的信息来源而设计的。当“信息来源”是一个 LLM 时，SIFT 中的“调查”步骤需要进行调整：不存在机构身份、资金链或编辑委员会。横向阅读中能够保留下来的，是“追溯论断”这一环节——核实所引用的证据确实存在，并且表达了 AI 所声称的内容。Caulfield（2019）对 SIFT 的操作化定义为此处扩展的协议提供了结构框架。Breakstone et al.（2021）发现，学生缺乏评估在线信息来源的能力，依赖表层的可信度标志——而 AI 输出通常流畅且听起来权威，这会显著放大这种脆弱性。Ji et al.（2023）对自然语言生成中的幻觉进行了系统性调查，记录了 LLM 中幻觉的普遍程度和类型：内在幻觉（与源材料相矛盾）、外在幻觉（添加无法核实或捏造的信息）以及事实不一致。他们的分类体系直接为本协议中的幻觉类别提供了依据。

## 输入格式

教师必须提供：
- **AI 输出背景：** 正在进行事实核查的 AI 内容类型。*例如：“ChatGPT 对近期心理学研究的总结，其中包含带有研究名称的引用”/“AI 对第一次世界大战起因的解释，其中提到具体历史学家及其论点”/“聊天机器人对营养问题的回答，其中包含有关青少年饮食模式的统计数据”*
- **学生水平：** 年级和数字素养水平。*例如：“11 年级，熟悉 Google 搜索，但尚未正式学习信息来源评估”/“9 年级，具备基础互联网素养”*

可选（如果上下文引擎可用则注入）：
- **学科领域：** 学科背景——不同学科的幻觉模式各不相同
- **幻觉风险：** 此背景下最可能出现的幻觉类型
- **验证资源：** 学生可使用的工具
- **AI 工具：** 生成输出的 AI 系统

## 提示词

```
You are an expert in digital literacy and AI verification pedagogy, with deep knowledge of Wineburg & McGrew's (2017, 2019) lateral reading research, Caulfield's (2019) SIFT framework, Breakstone et al.'s (2021) work on students' online reasoning, and Ji et al.'s (2023) taxonomy of hallucination types in natural language generation. You understand the critical limitation of standard lateral reading when applied to AI-generated content: SIFT's "Investigate the source" step assumes an institutional author whose funding and credibility can be checked externally. LLMs have no institutional author. The adaptation required is to replace "Investigate the source" with "Reconstruct the source" — verifying that cited sources exist and say what the AI claims, and that un-cited statistics have traceable origins.

CRITICAL PRINCIPLES FOR AI FACT-CHECKING:
- **AI hallucinations are qualitatively different from human misinformation.** A biased human source has a motive you can investigate. AI fabricates because of statistical patterns in training data — it produces plausible-sounding text. There is no motive to find; there is a verification deficit to expose.
- **The most dangerous hallucinations are the ones that look most real.** A citation to a non-existent study is dangerous precisely because it includes a real-sounding author name, a real-sounding journal title, and a plausible-sounding year. Students who have learned "check the source" may feel they have verified the citation when they have not.
- **Verification requires SOURCE RECONSTRUCTION, not source investigation.** The fact-checker's move with AI is: (1) Does this source exist? (2) Does it say what the AI claims? This is different from asking "Is this source credible?" — it is asking "Does this source exist at all?"
- **Not all hallucinations are dramatic.** The most common AI hallucinations are subtle: a real study presented with the wrong year, a real statistic from a different context, a real author attributed with a paper they didn't write. Students need protocols for subtle errors, not just obvious fabrications.
- **Absence of citation is not hallucination.** AI often omits citations entirely. This is an accuracy problem (Ennis standard) but not hallucination. The specific concern is when AI PROVIDES citations or statistics — that is when verification moves are needed.

Your task is to generate an AI hallucination fact-check protocol for:

**AI output context:** {{ai_output_context}}
**Student level:** {{student_level}}

The following optional context may or may not be provided. Use whatever is available; ignore fields marked "not provided."

**Subject area:** {{subject_area}} — if not provided, infer from the context and adapt hallucination types accordingly.
**Hallucination risk:** {{hallucination_risk}} — if not provided, identify the 2-3 most likely hallucination types for this subject and output type.
**Verification resources:** {{verification_resources}} — if not provided, design for Google + Google Scholar + Wikipedia as the baseline verification toolkit.
**AI tool:** {{ai_tool}} — if not provided, assume a general-purpose LLM chatbot.

Return your output in this exact format:

## AI Hallucination Fact-Check Protocol: [Context]

**For:** [Student level]
**Output type:** [Type of AI content]
**Highest-risk hallucination types:** [The 2-3 most likely for this context]

### Hallucination Taxonomy

[For each relevant hallucination type:]

**[Type name]**
- **What it looks like:** [Specific example appropriate to this context]
- **Why it's dangerous:** [Why students are likely to miss it]
- **How to verify:** [The specific verification move]

### AI-Adapted SIFT Protocol

**S — Stop**
[Pause-and-check instruction adapted for AI context]

**I — Identify the claim type**
[For AI, "Investigate the source" becomes "Identify what kind of claim this is." Guide students to classify claims before attempting verification — statistics need one move, citations need another, expert quotes need another.]

**F — Find the original**
[Source reconstruction: find whether cited sources exist, then find whether they say what the AI claims]

**T — Trace unattributed claims**
[What to do with statistics and claims that have no citation — lateral reading for the underlying data]

### Verification Moves

[For each claim type — statistics, citations, named studies, expert quotes, event claims — provide:]

**Verifying [claim type]:**
- **Step 1:** [What to search/check first]
- **Step 2:** [How to confirm existence vs. content]
- **Red flags:** [Signs that the claim may be hallucinated]
- **Example:** [A specific walkthrough]

### Hallucination Hunt Activity

**Setup:** [How to prepare the activity — what AI output to use, what students receive]

**Round 1 — Identify verification targets (X minutes):** [Instructions]

**Round 2 — Verify (X minutes):** [Instructions with specific verification steps]

**Round 3 — Report and discuss (X minutes):** [Class debrief protocol]

**Discussion questions:** [Questions that draw out the pedagogical insight — what did finding/not finding a hallucination teach about AI reliability?]

### Teacher Modelling Script

[Think-aloud script — 200-300 words — demonstrating the difference between finding a real citation and finding a fabricated one, walking through the verification moves explicitly]

**Self-check before returning output:** Verify that (a) the hallucination taxonomy is specific to this subject and output type, (b) the SIFT adaptation explicitly replaces "Investigate the source" with something workable for AI, (c) verification moves are specific enough to follow, (d) the activity creates genuine discovery moments rather than just confirming what students already suspect, and (e) the modelling script shows both a successful verification AND a hallucination discovery.
```

## 示例输出

**场景：** *AI 输出上下文：“11 年级心理学学生使用 ChatGPT 获取了一份关于社交媒体与青少年心理健康研究的摘要。AI 生成了一段 200 字的回答，其中包括‘根据 Twenge 及其同事于 2021 年发表在《JAMA Psychiatry》上的一项研究，每天使用社交媒体超过 3 小时会使青少年患抑郁症的风险增加 47%。’” / 学生水平：“11 年级，具备基础互联网素养，未接受过正式的来源评估培训” / 学科领域：“心理学” / 验证资源：“Google、Google Scholar、学校图书馆数据库”*

---

## AI 幻觉事实核查协议：心理学研究引用

**适用对象：** 11 年级，具备基础互联网素养  
**输出类型：** 带有明确引用的 AI 生成研究摘要  
**最高风险的幻觉类型：** 引用捏造（真实作者，错误研究）、统计数据虚构（看似合理的数字，没有真实来源）、语境误置（真实研究，错误的人群或语境）

### 幻觉分类

**引用捏造：真实作者，错误研究**
- **表现形式：** “Twenge 及其同事（2021）发表于《JAMA Psychiatry》的研究”——Jean Twenge 是一位真实存在的研究者，确实研究社交媒体与心理健康。《JAMA Psychiatry》也是一本真实存在的期刊。但这项特定研究是否确实存在于 2021 年？AI 使用真实姓名和真实期刊，构造了一个听起来合理、但可能从未存在过的引用。
- **危险之处：** 学生搜索“Twenge social media mental health”时会找到 Twenge 真实发表的论文，并可能得出该引用已经得到验证的结论，但实际上他们只验证了作者确实存在，而没有验证这项具体研究。
- **验证方法：** 在 Google Scholar 中搜索“Twenge JAMA Psychiatry 2021”，检查是否出现与该描述相符的论文。然后阅读摘要，确认其中是否表达了 AI 所声称的内容。

**统计数据虚构**
- **表现形式：** “使抑郁症风险增加 47%”——这是一个具体且听起来十分精确的数字。真实的心理学研究会报告效应量、相关系数和置信区间，而不是“47%”这类整洁的百分比。
- **危险之处：** 具体性会让人感觉精确。像 50% 这样的整数百分比可能会引起怀疑；47% 听起来则像是来自某项真实分析。
- **验证方法：** 找到原始研究。研究中是否报告了“47%”这一数字？如果论文报告的是优势比或相关系数，AI 可能错误地进行了换算，也可能完全捏造了这个数字。

**语境误置**
- **表现形式：** 将一项真实研究的发现描述为适用于一般青少年，而原始研究对象可能只是特定人群（例如，仅限 10 至 14 岁的美国女孩，或已有心理健康问题的临床样本）。
- **危险之处：** 引用本身经得起核查——研究确实存在——但所陈述的主张比证据实际支持的范围更广。
- **验证方法：** 找到论文后，阅读方法部分：样本是谁？AI 的主张是否与研究实际涵盖的范围一致？

### AI 调整版 SIFT 协议

**S — 停止**
在复制或引用 AI 回复中的任何内容之前，先停下来。AI 生成的研究摘要经常包含听起来真实、但未经验证的引文。在论文或项目中使用一条未经验证的 AI 引文，就会带来风险。在继续之前，先停下来进行检查。

**I — 识别论断类型**
在 AI 文本中，“调查来源”并不可行——AI 就是来源本身，没有什么可供调查的。相反，应对文本中的每一条具体论断进行分类：
- **具名引文：**“根据 Smith（2022）的研究……” → 需要检查是否存在 + 检查内容
- **统计论断：**“X% 的……” → 需要重建来源
- **专家归因：**“[institution] 的研究人员发现……” → 需要检查机构 + 研究
- **共识论断：**“大多数心理学家都认为……” → 需要检查是否有佐证

**F — 找到原始来源**
对于每条具名引文：(1) 在 Google Scholar 中搜索作者 + 期刊 + 年份。(2) 如果找到论文，打开并检查：论文是否表达了 AI 所声称的内容？(3) 如果找不到论文，该引文可能是捏造的。

对于没有引文的统计数据：用引号搜索具体论断（“47% depression risk social media”）。如果没有任何结果能够追溯到同行评审来源，那么该统计数据就是无法验证的——可能是 AI 臆造的。

**T — 追溯共识论断**
当 AI 在没有给出具体来源的情况下说“研究表明”或“研究发现”时，应从彼此独立且有明确出处的来源中搜索佐证。如果你找到一篇引用充分的系统性综述，而它得出了相反结论，那么 AI 的共识论断可能是过度概括。

### 验证操作

**验证具名引文（例如：“Twenge et al., 2021, JAMA Psychiatry”）：**
- **步骤 1：** 前往 Google Scholar。搜索：Twenge 2021 JAMA Psychiatry social media。查看前五条结果。
- **步骤 2：** 如果出现匹配的论文：点击进入摘要。它是否报告了 AI 所提出的具体论断（抑郁增加 47%）？
- **危险信号：** 论文没有出现在 Scholar 中。论文确实存在，但研究的是不同人群（成年人、临床样本）。论文确实存在，但报告的是不同的统计数据（比值比，而不是百分比）。
- **示例演练：** 搜索 → 论文出现 → 摘要显示其研究的是美国青少年，使用 2013-2018 年的数据，报告的是相关性而非百分比 → 具体的“抑郁风险增加 47%”这一数字并未出现 → AI 要么编造了这一统计数据，要么歪曲了原文。

**验证具体统计数据：**
- **步骤 1：** 用引号搜索完整短语：“47% depression risk” social media teenagers。
- **步骤 2：** 如果出现某个来源，检查：它是同行评审期刊，还是引用了未具名研究的新闻报道？
- **危险信号：** 只有社交媒体帖子或新闻报道引用了这一数字，而不是原始研究。找到的研究确实存在，但报告的是不同的指标。

### 猎捕幻觉活动

**准备：** 教师围绕课堂主题准备 3-4 份简短的 AI 生成研究摘要，每份摘要都混合包含真实引文、略经修改的引文和捏造的引文。学生以纸质形式收到这些摘要。

**第 1 轮——确定核查目标（5 分钟）：** 学生阅读每份摘要，并在每一个被提及的引文、具体统计数据和共识性论断下方画线。两人一组，根据类型对标记的每个要素进行分类。

**第 2 轮——核查（15 分钟）：** 每组使用 Google Scholar 和学校图书馆数据库核查 2-3 条论断。对于每条论断，他们记录：来源是否存在？（Y/N）来源是否表达了 AI 所声称的内容？（Y/N/Modified）。记录具体证据。

**第 3 轮——汇报与讨论（10 分钟）：** 各组汇报核查结果。教师揭示哪些引文是真实的、经过修改的，以及虚构的。全班讨论：是什么让虚构的引文看起来可信？其中的破绽是什么？

**讨论问题：**
- “如果你没有核查就把这条引文放进论文，会发生什么？”
- “AI 提到了一个真实的作者（Twenge）。与它虚构一个假名字相比，这会让引文更值得信任还是更不值得信任？为什么？”
- “核查这三条论断花了多长时间？这段时间值得投入吗？”

### 教师示范脚本

“看我是如何处理这条 AI 引文的。它说：‘根据 Twenge 及其同事于 2021 年在 JAMA Psychiatry 发表的一项研究，每天使用社交媒体超过 3 小时会使抑郁风险增加 47%。’听起来很有说服力，对吧？真实的研究者、真实的期刊、具体的百分比。让我向你们展示事实核查实际上是什么样的。

我打开 Google Scholar。我搜索：Twenge 2021 JAMA Psychiatry。结果出来了好几项——我可以看到 Twenge 确实发表过相关领域的研究。但我需要的是这篇特定的论文：2021 年、JAMA Psychiatry。我浏览结果……我看到一篇 2022 年发表在 JAMA Pediatrics 的论文，一篇 2018 年发表在 Emotion 的论文，但没有任何一篇与 2021 年、JAMA Psychiatry 完全匹配。这是一个危险信号。

我再尝试进行更宽泛的搜索：Twenge JAMA Psychiatry。现在我要寻找的是 Twenge 在该期刊发表的任何论文。我看到一个结果，来自 2020 年——我打开它。它讨论的是屏幕使用时间和幸福感，采用了不同的方法。更关键的是：它报告的是 r=0.05 的相关性，而不是‘抑郁风险增加 47%’。统计语言完全不同。

我的结论是：这条引文要么不存在，要么被严重曲解了。我还没有证明这一论断是错误的——可能还有一篇我尚未找到的 Twenge 2021 年论文。但在确认这条引文确实存在，并且表达了我需要的内容之前，我不能在论文中使用它。AI 给了我一个看起来像引文的东西，但它并没有真正发挥引文的作用。”

---

## 已知局限

1. **核查需要时间和数据库访问权限。** 完整的核查流程——找到一项研究、查看摘要、核实论断——每条引文需要 3-5 分钟。在写论文的情境下，学生可能会核查一两条关键论断，但无法核查 AI 所说的每一项内容。这项技能培养的是核查习惯，而不是要求进行穷尽式的事实核查。

2. **有些幻觉确实很难被发现。** 一篇真实作者在真实期刊上发表的真实论文，内容总结也基本准确，但可能稍微过时，或者研究对象来自不同人群——这需要阅读方法部分，而不仅仅是确认论文是否存在。学术阅读能力有限的学生可能无法独立完成这种程度的核查。

3. **LLM 的幻觉率因模型和主题而异。**Ji 等人（2023）记录了多个模型中的幻觉现象；其发生率因任务类型和主题领域而存在显著差异。在有充分代表性的领域（近期备受关注的科学研究、主流政治史）中，幻觉较不常见；而在小众主题、前沿研究和专业子领域中，幻觉更为常见。教师应据此调整预期。

4. **针对 AI 的横向阅读应用缺乏直接的实证验证。**横向阅读 / SIFT 的证据基础（Wineburg & McGrew, 2017, 2019；Caulfield, 2019）对于一般性来源评估而言较为扎实。本协议中针对 AI 的调整，是基于该证据基础提出的有原则的延伸，并非经过独立验证的干预措施。“来源重构”这一做法在逻辑上是成立的，但尚未在教育研究中经过正式检验。