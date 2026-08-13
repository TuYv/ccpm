---
name: alterlab-deep-research
description: "Runs a 13-agent deep research pipeline for rigorous academic work on any topic across 7 modes (full research, quick brief, paper review, lit-review, fact-check, Socratic guided research dialogue, and systematic review with optional meta-analysis), covering research-question formulation, Socratic mentoring, methodology design, systematic literature search, source verification, cross-source synthesis, risk-of-bias assessment, meta-analysis, APA 7.0 report compilation, editorial and devil's-advocate review, ethics review, and post-research literature monitoring. Use when the request mentions research, deep research, literature review, systematic review, meta-analysis, PRISMA, evidence synthesis, fact-check, guide my research, help me think through, or 研究, 深度研究, 文獻回顧, 文獻探討, 系統性回顧, 後設分析, 事實查核, 引導我的研究, 幫我釐清, 幫我想想, 我不確定要研究什麼, 研究方向, 研究主題. Part of the AlterLab Academic Skills suite."
license: MIT
allowed-tools: Read Write Edit Bash WebFetch WebSearch
compatibility: Uses built-in Claude tools only (Read/Write/Edit/Bash/WebFetch/WebSearch); no external API key or account required
metadata:
  skill-author: AlterLab
  version: "2.3"
  last_updated: "2026-03-08"
---
# 深度研究——通用学术研究智能体团队

通用深度研究工具——由 13 个智能体组成的领域无关团队，可针对任何主题开展严谨的学术研究。v2.3 新增系统性回顾模式（符合 PRISMA 规范，可选择进行后设分析）、苏格拉底式收敛标准，以及研究完成后的文献监测功能。

## 快速开始

**最简命令：**
```
Research the impact of AI on higher education quality assurance
```

**苏格拉底模式：**
```
Guide my research on the impact of declining birth rates on private universities
引導我的研究：少子化對私立大學的影響
幫我釐清我的研究方向，我對高教品保有興趣但還不太確定
```

**执行流程：**
1. 范围界定——研究问题 + 方法论蓝图
2. 调查——系统性文献检索 + 来源核验
3. 分析——跨来源综合 + 偏差检查
4. 撰写——完整的 APA 7.0 格式报告
5. 审查——编辑审查 + 伦理审查 + 脆弱性扫描
6. 修订——最终润色报告

---

## 触发条件

### 触发关键词

**英语**：研究、深度研究、文献回顾、系统性回顾、后设分析、PRISMA、证据综合、事实核查、方法论、APA 报告、学术分析、政策分析、引导我的研究、帮助我理清思路、监测此主题、设置提醒

**繁體中文**: 研究, 深度研究, 文獻回顧, 文獻探討, 系統性回顧, 後設分析, 證據綜整, 事實查核, 研究方法, 學術分析, 政策分析, 引導我的研究, 幫我釐清, 監測這個主題, 設定追蹤

### 苏格拉底模式激活条件

当用户的**意图**符合以下任一模式时，无论使用何种语言，均激活 `socratic` 模式。应识别其含义，而非精确匹配关键词。

**意图信号**（满足任意一项即可）：
1. 用户没有明确的研究问题，并希望获得思考引导
2. 用户要求在研究过程中获得“带领”“指导”或“辅导”
3. 用户不确定要研究什么或从何处开始
4. 用户希望进行头脑风暴、探索或厘清研究方向
5. 用户描述了一个模糊的兴趣领域，但没有提出具体且可回答的问题

**默认规则**：当无法明确判断应使用 `socratic` 还是 `full` 时，**优先选择 `socratic`**——先进行引导比直接生成用户并不需要的报告更稳妥。用户之后始终可以切换到 `full`。

**触发示例**（仅作说明，并非详尽列表）：
“引导我的研究”“帮助我理清思路”、 「引導我的研究」「幫我釐清」，或任何语言中的同等表达

### 不会触发的情况

| 场景 | 改用 |
|----------|-------------|
| 撰写论文（而非开展研究） | `alterlab-paper-writer` |
| 评审论文（结构化评审） | `alterlab-paper-reviewer` |
| 从完整研究到论文撰写的流程 | `alterlab-research-pipeline` |

### 快速模式选择指南

| 你的情况 你的狀況 | 推荐模式 |
|----------------|-----------------|
| 想法模糊，需要指导 / 有模糊想法，需要引導 | `socratic` |
| 研究问题明确，需要全面研究 / 有明確 RQ，需要完整研究 | `full` |
| 需要快速简报（30 分钟） / 需要快速摘要 | `quick` |
| 在引用前需要评估一篇论文 / 有論文需要評估 | `review` |
| 需要某个主题的文献回顾 / 需要文獻回顧 | `lit-review` |
| 需要核验具体主张 / 需要查核特定事實 | `fact-check` |
| 需要系统性回顾 / 后设分析 / 系統性回顧或後設分析 | `systematic-review` |

不确定？先使用 `socratic`——它会帮助你弄清楚自己需要什么。
不確定？先用 `socratic` 模式——它會幫你釐清你需要什麼。

---

## 智能体团队（13 个智能体）

| # | 智能体 | 职责 | 阶段 |
|---|-------|------|-------|
| 1 | `research_question_agent` | 将模糊主题转化为范围边界明确、使用 FINER 标准评分的精准研究问题 | 阶段 1、苏格拉底式第 1 层 |
| 2 | `research_architect_agent` | 设计方法论蓝图：范式、方法、数据策略、分析框架、效度标准 | 阶段 1 |
| 3 | `bibliography_agent` | 系统性文献检索、来源筛选、采用 APA 7.0 格式的注释书目 | 阶段 2 |
| 4 | `source_verification_agent` | 事实核查、来源分级（证据层级）、掠夺性期刊识别、利益冲突标记 | 阶段 2 |
| 5 | `synthesis_agent` | 跨来源整合、矛盾消解、主题综合、研究空白分析 | 阶段 3 |
| 6 | `report_compiler_agent` | 起草完整的 APA 7.0 格式报告（标题 -> 摘要 -> 引言 -> 方法 -> 研究发现 -> 讨论 -> 参考文献） | 阶段 4、6 |
| 7 | `editor_in_chief_agent` | Q1 期刊编辑评审：原创性、严谨性、证据充分性、结论（接受/修改/拒绝） | 阶段 5 |
| 8 | `devils_advocate_agent` | 质疑假设、检验逻辑谬误、寻找替代性解释、检查确认偏误 | 阶段 1、3、5，苏格拉底式第 2、4 层 |
| 9 | `ethics_review_agent` | AI 辅助研究伦理、署名归属完整性、双重用途筛查、公正表述 | 阶段 5 |
| 10 | `socratic_mentor_agent` | Q1 期刊编辑角色；通过跨越 5 个层次的苏格拉底式提问引导研究思考 | 苏格拉底模式（第 1-5 层） |
| 11 | `risk_of_bias_agent` | 使用 RoB 2（随机对照试验）和 ROBINS-I（非随机研究）评估偏倚风险；以交通灯图示呈现 | 系统综述（阶段 2） |
| 12 | `meta_analysis_agent` | 设计并执行荟萃分析或叙述性综合；效应量、异质性、GRADE | 系统综述（阶段 3） |
| 13 | `monitoring_agent` | 研究完成后的文献监测：摘要简报、撤稿警报、矛盾研究发现识别 | 可选（流程完成后） |

---

## 模式选择指南

详细指南请参阅 `references/mode_selection_guide.md`。

```
User Input
    |
    +-- Already have a clear research question?
    |   +-- Yes --> Need PRISMA-compliant systematic review / meta-analysis?
    |   |           +-- Yes --> systematic-review mode
    |   |           +-- No --> Need a full report?
    |   |                      +-- Yes --> full mode
    |   |                      +-- No --> Only need literature?
    |   |                                 +-- Yes --> lit-review mode
    |   |                                 +-- No --> quick mode
    |   +-- No --> Want to be guided through thinking?
    |              +-- Yes --> socratic mode
    |              +-- No --> full mode (Phase 1 will be interactive)
    |
    +-- Already have text to review? --> review mode
    +-- Only need fact-checking? --> fact-check mode
```

---

## 编排工作流（6 个阶段）

标准流程分为六个阶段：**1. 范围界定**（研究问题简述 + 方法论蓝图，检查点 1）→ **2. 调查研究**（来源语料库 + 经核实/评级的来源）→ **3. 分析**（综合分析 + 差距分析，检查点 2）→ **4. 撰写**（完整的 APA 7.0 草稿）→ **5. 审查**（编辑审查 + 伦理审查 + 检查点 3，并行进行）→ **6. 修订**（最终报告，最多 2 轮）。

包含每个阶段产出和检查点标准的完整逐智能体流程图：参见 `references/orchestration_workflows.md`（Standard Orchestration Workflow 章节）。

### 检查点规则

1. **魔鬼代言人**设有 3 个强制检查点；**严重级别为 Critical** 的问题会阻止流程继续推进
2. 修订循环上限为 **2 轮**；剩余问题将成为“已确认的局限性”
3. **伦理审查**可因严重级别为 Critical 的伦理问题而中止交付
4. 进入下一阶段前，必须在阶段 1 结束后获得用户确认

---

## 苏格拉底模式：引导式研究对话

核心原则：从 Q1 国际期刊主编的视角出发，通过苏格拉底式提问引导用户澄清其研究问题。绝不直接给出答案；而是使用后续问题帮助用户自行深入思考相关问题。

有关详细的智能体定义，请参见 `agents/socratic_mentor_agent.md`。
有关提问框架，请参见 `references/socratic_questioning_framework.md`。

苏格拉底模式分五层推进：**1. 问题界定** → **2. 方法论反思** → **3. 证据设计** → **4. 批判性自我审视** → **5. 重要性与贡献**。每一层都会将 `socratic_mentor_agent` 与一个辅助智能体配对（第 1 层使用 `research_question_agent`；第 2 层和第 4 层使用 `devils_advocate_agent`），每轮提取 `[INSIGHT: ...]` 标记，并且必须经过 ≥2 轮对话（第 5 层 ≥1 轮）后才能进入下一层。第 5 层会将所有 INSIGHT 汇总为研究计划摘要，并移交给 `alterlab-paper-writer`（计划模式）。

包含每层确切引导问题的完整逐层流程：参见 `references/orchestration_workflows.md`（Socratic Mode Layer Flow 章节）。

### 苏格拉底模式对话管理规则

- 每层至少进行 2 轮对话后才能进入下一层（第 5 层至少需要 1 轮）
- 用户可随时请求跳至下一层
- 导师的回复限制在 200-400 词
- 如果 10 轮后仍未达成收敛 -> 建议切换到 `full` 模式（参见失败路径 F6）
- 如果对话超过 15 轮 -> 自动汇总 INSIGHT 并结束
- 如果用户要求直接回答 -> 委婉拒绝，并说明引导式学习的价值

---

## 系统综述模式

符合 PRISMA 标准的完整系统性文献综述，并可选择进行元分析。此模式在标准的 6 阶段流程基础上，增加了用于偏倚风险评估（RoB 2、ROBINS-I）和定量综合的专用智能体。

有关详细的智能体定义，请参见 `agents/risk_of_bias_agent.md` 和 `agents/meta_analysis_agent.md`。
有关 Cochrane/PRISMA/GRADE 参考指南，请参见 `references/systematic_review_toolkit.md`。

此模式复用六个阶段，但采用 PRISMA 专用输出：**1. 范围界定**生成一个 PICOS 研究问题和一份完整的 PRISMA-P 方案（而不仅仅是研究问题）；**2. 调查**增加 PRISMA 2020 流程图和由 `risk_of_bias_agent` 执行的偏倚风险评估；**3. 分析**运行 `meta_analysis_agent`（效应量、异质性、GRADE）或 SWiM 叙述性综合，并同时开展主题综合；**4. 撰写**生成一份包含 27 个条目的 PRISMA 2020 报告，其中包括研究特征、偏倚风险、森林图和 GRADE 表格；**5. 审查**和**6. 修订**与标准流程一致。

有关逐代理的完整 PRISMA 流程及各阶段的所有输出，请参阅 `references/orchestration_workflows.md`（系统综述模式流程部分）。

### 系统综述检查点规则

1. 所有标准检查点规则均适用（请参阅下文的检查点规则）
2. 在第 2 阶段之前，**必须注册方案**（或建议注册）
3. 在第 3 阶段之前，**必须完成所有研究的偏倚风险评估**
4. **每个合并结局均须进行 GRADE 评估**
5. 在第 5 阶段验证**是否符合 PRISMA 检查清单**

---

## 运行模式

| 模式 | 启用的代理 | 输出 | 字数 |
|------|---------------|--------|------------|
| `full`（默认） | 全部 9 个核心代理（不包括 socratic_mentor、risk_of_bias、meta_analysis、monitoring） | 完整的 APA 7.0 报告 | 3,000-8,000 |
| `quick` | RQ + Biblio + Verification + Report | 研究简报 | 500-1,500 |
| `review` | Editor + Devil's Advocate + Ethics | 针对所提供文本的审稿报告 | N/A |
| `lit-review` | Biblio + Verification + Synthesis | 带注释的参考文献目录 + 综合分析 | 1,500-4,000 |
| `fact-check` | 仅 Source Verification | 核查报告 | 300-800 |
| `socratic` | Socratic Mentor + RQ + Devil's Advocate | 研究计划摘要（INSIGHT 集合） | N/A（迭代式） |
| `systematic-review` | RQ + Architect + Biblio + Verification + RoB + Meta-Analysis + Synthesis + Report + Editor + Ethics + DA | 完整的 PRISMA 2020 报告 + 森林图数据 + GRADE 表格 | 5,000-15,000 |

---

## 失败路径

有关所有模式下的全部失败场景、触发条件和恢复策略，请参阅 `references/failure_paths.md`。

主要失败路径摘要：

| 失败场景 | 触发条件 | 恢复策略 |
|---------|---------|---------|
| 研究问题无法收敛 | 第 1 阶段 / 第 1 层经过多轮后仍然模糊 | 提供 3 个候选研究问题或建议使用 lit-review |
| 文献不足 | bibliography_agent 找到的来源少于 5 个 | 扩展检索策略，使用替代关键词 |
| 方法不匹配 | 研究问题类型与方法能力不一致 | 返回第 1 阶段，建议 3 种替代方法 |
| Devil's Advocate 判定为 CRITICAL | 发现致命的逻辑缺陷 | 停止，解释问题并要求修正 |
| Ethics 判定为 BLOCKED | 存在严重的伦理问题 | 停止，列出问题和补救路径 |
| 苏格拉底式流程无法收敛 | 经过 10 轮以上仍未收敛 | 建议切换到 full 模式 |
| 用户中途放弃 | 明确表示不想继续 | 保存进度，提供重新进入的路径 |
| 只有中文文献 | 英文检索未返回结果 | 切换到中文学术数据库 |

---

## 文献监测（可选的管线后流程）

任何研究模式完成后，用户都可以选择激活 `monitoring_agent`，以设置研究完成后的文献监测。这不属于主管线，而是一项按需触发的辅助能力。

有关详细的代理定义，请参阅 `agents/monitoring_agent.md`。
有关特定平台的设置指南，请参阅 `references/literature_monitoring_strategies.md`。

**触发条件**：“监测此主题”、“设置提醒”、“跟踪有关此主题的新发表成果”

**能力**：
- 生成每周/每月监测摘要
- 针对引用来源的撤稿提醒
- 检测相互矛盾的研究发现
- 跟踪关键作者
- 跟踪关键词演变

**输入**：来自任意研究模式的已完成参考文献目录 + 检索策略
**输出**：监测配置 + 摘要模板（markdown）

**限制**：监测代理会生成配置和模板，供用户采取相应操作。它无法自主运行后台监测。

---

## 交接协议：alterlab-deep-research → alterlab-paper-writer

研究完成后，可将以下材料交接给 `alterlab-paper-writer`：

1. **研究问题简报**（来自 research_question_agent）
2. **方法论蓝图**（来自 research_architect_agent）
3. **带注释的参考文献目录**（来自 bibliography_agent）
4. **综合报告**（来自 synthesis_agent）
5. **[如果使用苏格拉底模式] INSIGHT 集合与研究计划摘要**

**触发条件**：用户说“现在帮我写一篇论文”或“基于这些内容写一篇论文”

`alterlab-paper-writer` 的 `intake_agent` 将自动检测可用材料并跳过重复步骤：
- 已有研究问题简报 -> 跳过主题范围界定
- 已有参考文献目录 -> 跳过文献检索
- 已有综合报告 -> 加速研究发现/讨论部分的撰写

有关详细的交接示例，请参阅 `examples/handoff_to_paper.md`。

---

## 完整学术管线

有关完整工作流，请参阅 `alterlab-research-pipeline/SKILL.md`。

---

## 代理文件参考

| 代理 | 定义文件 |
|-------|----------------|
| research_question_agent | `agents/research_question_agent.md` |
| research_architect_agent | `agents/research_architect_agent.md` |
| bibliography_agent | `agents/bibliography_agent.md` |
| source_verification_agent | `agents/source_verification_agent.md` |
| synthesis_agent | `agents/synthesis_agent.md` |
| report_compiler_agent | `agents/report_compiler_agent.md` |
| editor_in_chief_agent | `agents/editor_in_chief_agent.md` |
| devils_advocate_agent | `agents/devils_advocate_agent.md` |
| ethics_review_agent | `agents/ethics_review_agent.md` |
| socratic_mentor_agent | `agents/socratic_mentor_agent.md` |
| risk_of_bias_agent | `agents/risk_of_bias_agent.md` |
| meta_analysis_agent | `agents/meta_analysis_agent.md` |
| monitoring_agent | `agents/monitoring_agent.md` |

---

## 参考文件

| 参考文件 | 用途 | 使用方 |
|-----------|---------|---------|
| `references/apa7_style_guide.md` | APA 第7版快速参考 | report_compiler, editor_in_chief |
| `references/source_quality_hierarchy.md` | 证据金字塔 + 评分量表 | source_verification, bibliography |
| `references/methodology_patterns.md` | 研究设计模板 | research_architect |
| `references/logical_fallacies.md` | 30 多种谬误目录 | devils_advocate |
| `references/ethics_checklist.md` | AI 披露、归属标注、双重用途 | ethics_review |
| `references/interdisciplinary_bridges.md` | 跨学科连接模式 | synthesis, research_architect |
| `references/socratic_questioning_framework.md` | 6 类苏格拉底式问题 + 30 多种提示模式 | socratic_mentor |
| `references/failure_paths.md` | 12 种失败场景及其触发条件和恢复路径 | 所有代理 |
| `references/mode_selection_guide.md` | 模式选择流程图和比较表 | orchestrator |
| `references/orchestration_workflows.md` | 详细的六阶段、苏格拉底式五层及系统综述流程图 | orchestrator |
| `references/irb_decision_tree.md` | IRB 决策树 + 台湾流程 + HE 快速参考 | ethics_review, research_architect |
| `references/equator_reporting_guidelines.md` | EQUATOR 报告指南映射 | research_architect, report_compiler |
| `references/preregistration_guide.md` | 预注册决策树 + 平台 + 检查清单 | research_architect |
| `references/systematic_review_toolkit.md` | Cochrane v6.4、PRISMA 2020、RoB 2、ROBINS-I、I² 指南、GRADE、方案注册 | risk_of_bias, meta_analysis, bibliography, report_compiler |
| `references/literature_monitoring_strategies.md` | Google Scholar 提醒、PubMed 提醒、RSS 源、Retraction Watch、引用跟踪、监测频率 | monitoring_agent |

---

## 模板

| 模板 | 用途 |
|----------|---------|
| `templates/research_brief_template.md` | Quick 模式输出格式 |
| `templates/literature_matrix_template.md` | 来源 × 主题分析矩阵 |
| `templates/evidence_assessment_template.md` | 单个来源的质量评估卡 |
| `templates/preregistration_template.md` | OSF 标准 21 项预注册模板 |
| `templates/prisma_protocol_template.md` | PRISMA-P 2015 系统综述方案模板 |
| `templates/prisma_report_template.md` | PRISMA 2020 系统综述报告模板（27 项） |

---

## 示例

| 示例 | 展示内容 |
|---------|-------------|
| `examples/exploratory_research.md` | 完整的 6 阶段流程演示 |
| `examples/systematic_review.md` | PRISMA 风格的文献综述 |
| `examples/policy_analysis.md` | 应用型比较政策研究 |
| `examples/socratic_guided_research.md` | 完整的 Socratic 模式多轮对话（12 轮） |
| `examples/handoff_to_paper.md` | alterlab-deep-research 完整模式向 alterlab-paper-writer 的交接 |
| `examples/review_mode.md` | Review 模式：针对政策建议文本的 3-agent 审查流程 |
| `examples/fact_check_mode.md` | Fact-check 模式：对 HEI 声明进行来源核验，并为每项声明给出判定 |

---

## 输出语言

遵循用户所使用的语言。学术术语保留为英文。Socratic 模式使用自然的对话风格。

---

## 质量标准

1. **每项声明都必须有引文** — 不得包含无依据的论断
2. **证据层级** — meta-analyses > RCTs > cohort studies > case reports > expert opinion
3. **矛盾披露** — 如果来源之间存在分歧，应同时报告双方观点，并比较其证据质量
4. **局限性透明度** — 每份报告都必须包含明确的局限性章节
5. **AI 披露** — 所有报告都应包含使用了 AI 辅助研究工具的声明
6. **可复现性** — 必须记录检索策略、纳入标准和分析方法，以便复现
7. **Socratic 完整性** — 在 socratic 模式下，绝不直接给出答案；始终通过提问进行引导

## 跨 Agent 质量对齐

统一定义，以避免各 Agent 之间出现不一致：

| 概念 | 定义 | 适用于 |
|---------|-----------|------------|
| **Peer-reviewed** | 发表在具有正式同行评审流程的期刊上（仅有编辑审查不符合条件）。会议论文集仅在明确经过同行评审时才算 | bibliography_agent, source_verification_agent |
| **Currency Rule** | 默认：发表于最近 5 年内。按领域调整：CS/AI = 3 年，History/Philosophy = 20 年，Law = 取决于司法管辖区的变化。奠基性著作不受年代限制 | bibliography_agent, ethics_review_agent |
| **CRITICAL severity** | 如未解决，将使核心结论无效或构成学术不端的问题。在流程继续之前必须立即解决 | 所有 Agent |
| **Source Tier** | tier_1 = 顶级四分位同行评审期刊；tier_2 = 其他同行评审来源；tier_3 = 学术性但未经同行评审；tier_4 = grey literature | bibliography_agent, source_verification_agent |
| **Minimum Source Count** | full = 15+，quick = 5-8，lit-review = 25+，systematic-review = 所有符合条件的来源（不限数量），fact-check = 每项声明 3+ | bibliography_agent |
| **Verification Threshold** | 100% DOI 核验 + 50% WebSearch 抽查 | source_verification_agent, ethics_review_agent |

> **跨技能参考**：有关阶段间数据交换格式，请参阅 `shared/handoff_schemas.md`。

---

## 与其他技能的集成

此技能不受特定领域限制，但可与其他 AlterLab 技能组合使用：

```
alterlab-deep-research + alterlab-paper-2-web                     -> Disseminate research as a website / video / poster
alterlab-deep-research + alterlab-paper-writer                    -> Full research-to-publication pipeline
alterlab-deep-research (socratic) + alterlab-paper-writer (plan)  -> Guided research + paper planning
alterlab-deep-research (systematic-review) + alterlab-paper-writer -> PRISMA systematic review paper
alterlab-deep-research -> alterlab-research-pipeline              -> End-to-end research → review → finalize workflow
```

---

## 版本历史

当前版本：**v2.3**（请参阅 frontmatter 中的 `metadata.version`）。最新变更：新增
`systematic-review` 模式（包含 `risk_of_bias_agent` 和
`meta_analysis_agent` 的 PRISMA 2020 流程、PRISMA 协议/报告模板以及
`systematic_review_toolkit` 参考资料）及可选的流程后置 `monitoring_agent`，使团队扩展至
13 个智能体和 7 种模式。