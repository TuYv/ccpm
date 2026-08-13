---
name: alterlab-clinical-decision
description: Generates professional clinical decision support (CDS) documents for pharmaceutical and clinical research settings — biomarker-stratified patient cohort analyses with outcomes and evidence-based treatment recommendation reports with decision algorithms, supporting GRADE evidence grading, statistical analysis (hazard ratios, survival curves, waterfall plots), biomarker integration, and regulatory compliance, output as publication-ready LaTeX/PDF. Use when building a CDS document, cohort analysis, or treatment recommendation report for drug development, clinical research, or evidence synthesis, or when GRADE grading, hazard ratios, survival/waterfall plots, or biomarker stratification are requested. Part of the AlterLab Academic Skills suite.
allowed-tools: Read Write Edit Bash
license: MIT
compatibility: "Runs with Read/Write/Edit/Bash; producing PDF output requires a local LaTeX toolchain (e.g. pdflatex/xelatex). No API key required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# 临床决策支持文档

## 描述

为制药公司、临床研究人员和医疗决策者生成专业的临床决策支持（CDS）文档。此技能专注于提供分析性、循证文档，为治疗策略和药物开发提供依据：

1. **患者队列分析** - 按生物标志物分层的群体分析，并进行统计学结局比较
2. **治疗建议报告** - 包含 GRADE 分级和决策算法的循证临床指南

所有文档均生成为可直接发表的 LaTeX/PDF 文件，并针对药物研究、监管申报和临床指南制定进行了优化。

**注意：** 对于床旁个体患者治疗计划，请改用 `alterlab-treatment-plans` 技能。对于拟投稿期刊的单例患者病例报告（例如遵循 CARE 指南的病例），请使用 `alterlab-clinical-reports`。此技能专注于面向制药/研究场景的群体层面分析和证据综合。

**写作风格：** 对于面向医学期刊、可直接发表的文档，请参阅 `alterlab-venue-templates` 技能中的 `medical_journal_styles.md`，以获取有关结构式摘要、证据措辞以及 CONSORT/STROBE 合规性的指导。

## 功能

### 文档类型

**患者队列分析**
- 基于生物标志物的患者分层（分子亚型、基因表达、IHC）
- 分子亚型分类（例如 GBM 间质型-免疫活跃型与前神经型、乳腺癌亚型）
- 结局指标及统计分析（OS、PFS、ORR、DOR、DCR）
- 亚组间统计学比较（风险比、p 值、95% CI）
- 使用 Kaplan-Meier 曲线和 log-rank 检验进行生存分析
- 疗效表格和瀑布图
- 比较效果分析
- 药物研究队列报告（试验亚组、真实世界证据）

**治疗建议报告**
- 针对特定疾病状态的循证治疗指南
- 推荐强度分级（GRADE 系统：1A、1B、2A、2B、2C）
- 证据质量评估（高、中、低、极低）
- 使用 TikZ 图表绘制治疗算法流程图
- 基于生物标志物的治疗线序贯
- 包含临床和分子标准的决策路径
- 制药策略文档
- 面向医学学会的临床指南制定

### 临床功能

- **生物标志物整合**：基因组改变（突变、CNV、融合）、基因表达特征、IHC 标志物、PD-L1 评分
- **统计分析**：风险比、p 值、置信区间、生存曲线、Cox 回归、log-rank 检验
- **证据分级**：GRADE 系统（1A/1B/2A/2B/2C）、Oxford CEBM 证据等级、证据质量评估
- **临床术语**：SNOMED-CT、LOINC、规范的医学命名法、试验命名法
- **法规合规**：HIPAA 去标识化、保密性页眉、符合 ICH-GCP
- **专业格式**：紧凑的 0.5in 页边距、采用颜色编码的建议、可直接发表、适用于监管申报

## 制药与研究应用场景

此技能专为制药和临床研究应用而设计：

**药物开发**
- **2/3 期临床试验分析**：按生物标志物分层的疗效和安全性分析
- **亚组分析**：使用森林图展示不同患者亚组的治疗效果
- **伴随诊断开发**：建立生物标志物与药物应答之间的关联
- **监管申报**：包含证据摘要的 IND/NDA 文档

**医学事务**
- **KOL 教育材料**：面向意见领袖的循证治疗算法
- **医学策略文档**：竞争格局与定位策略
- **专家顾问委员会材料**：队列分析与治疗建议框架
- **发表规划**：可直接用于同行评审期刊论文的分析

**临床指南**
- **指南制定**：为专业学会采用 GRADE 方法综合证据
- **共识建议**：由多方利益相关者共同制定治疗算法
- **实践标准**：基于生物标志物的治疗选择标准
- **质量指标**：循证绩效指标

**真实世界证据**
- **RWE 队列研究**：基于 EMR 数据对患者队列进行回顾性分析
- **比较效果研究**：真实世界环境中的治疗方案头对头比较
- **结局研究**：临床实践中的长期生存和安全性
- **卫生经济学**：按生物标志物亚组开展成本效益分析

## 何时使用

当你需要执行以下任务时，请使用此技能：

- **分析患者队列**，并按生物标志物、分子亚型或临床特征进行分层
- **生成治疗建议报告**，并为临床指南或制药策略进行证据分级
- **比较患者亚组之间的结局**，并进行统计分析（生存期、应答率、风险比）
- **编制制药研究文档**，用于药物开发、临床试验或监管申报
- **制定临床实践指南**，包括 GRADE 证据分级和决策算法
- **记录生物标志物指导的治疗选择**，适用于群体层面（而非个体患者）
- **综合证据**，来源包括多项试验或真实世界数据源
- **创建临床决策算法**，并使用流程图展示治疗顺序

**请勿将此技能用于：**
- 个体患者治疗计划、床旁护理文档或患者特定方案（请使用 `alterlab-treatment-plans`）
- 用于期刊投稿的单患者病例报告，例如遵循 CARE 指南的病例（请使用 `alterlab-clinical-reports`）

## 文档结构

**关键要求：所有临床决策支持文档都必须在第 1 页以完整的执行摘要开篇。该摘要必须占满整个第一页，并置于任何目录或详细章节之前。**

### 第 1 页执行摘要结构

每份 CDS 文档的第一页应仅包含执行摘要，并包括以下组成部分：

**必需元素（全部位于第 1 页）：**
1. **文档标题和类型**
   - 主标题（例如，“生物标志物分层队列分析”或“循证治疗建议”）
   - 包含疾病状态和重点内容的副标题
   
2. **报告信息框**（使用彩色 tcolorbox）
   - 文档类型和目的
   - 分析/报告日期
   - 疾病状态和患者人群
   - 作者/机构（如适用）
   - 分析框架或方法
   
3. **关键发现框**（使用 tcolorbox 的 3-5 个彩色框）
   - **主要结果**（蓝色框）：主要疗效/结局发现
   - **生物标志物洞见**（绿色框）：关键分子亚型发现
   - **临床意义**（黄色/橙色框）：可指导实践的治疗意义
   - **统计摘要**（灰色框）：风险比、p 值、关键统计数据
   - **安全性要点**（红色框，如适用）：关键不良事件或警告

**视觉要求：**
- 使用 `\thispagestyle{empty}` 移除第 1 页的页码
- 所有内容必须在第 1 页内排完（位于 `\newpage` 之前）
- 使用具有不同颜色的 tcolorbox 环境来构建视觉层次
- 信息框应便于快速浏览，并突出最关键的信息
- 使用项目符号，不要使用叙述性段落
- 在目录或详细章节之前，以 `\newpage` 结束第 1 页

**LaTeX 首页结构示例：**
```latex
\maketitle
\thispagestyle{empty}

% Report Information Box
\begin{tcolorbox}[colback=blue!5!white, colframe=blue!75!black, title=Report Information]
\textbf{Document Type:} Patient Cohort Analysis\\
\textbf{Disease State:} HER2-Positive Metastatic Breast Cancer\\
\textbf{Analysis Date:} \today\\
\textbf{Population:} 60 patients, biomarker-stratified by HR status
\end{tcolorbox}

\vspace{0.3cm}

% Key Finding #1: Primary Results
\begin{tcolorbox}[colback=blue!5!white, colframe=blue!75!black, title=Primary Efficacy Results]
\begin{itemize}
    \item Overall ORR: 72\% (95\% CI: 59-83\%)
    \item Median PFS: 18.5 months (95\% CI: 14.2-22.8)
    \item Median OS: 35.2 months (95\% CI: 28.1-NR)
\end{itemize}
\end{tcolorbox}

\vspace{0.3cm}

% Key Finding #2: Biomarker Insights
\begin{tcolorbox}[colback=green!5!white, colframe=green!75!black, title=Biomarker Stratification Findings]
\begin{itemize}
    \item HR+/HER2+: ORR 68\%, median PFS 16.2 months
    \item HR-/HER2+: ORR 78\%, median PFS 22.1 months
    \item HR status significantly associated with outcomes (p=0.041)
\end{itemize}
\end{tcolorbox}

\vspace{0.3cm}

% Key Finding #3: Clinical Implications
\begin{tcolorbox}[colback=orange!5!white, colframe=orange!75!black, title=Clinical Recommendations]
\begin{itemize}
    \item Strong efficacy observed regardless of HR status (Grade 1A)
    \item HR-/HER2+ patients showed numerically superior outcomes
    \item Treatment recommended for all HER2+ MBC patients
\end{itemize}
\end{tcolorbox}

\newpage
\tableofcontents  % TOC on page 2
\newpage  % Detailed content starts page 3
```

### 患者队列分析（详细章节——第 3 页及之后）
- **队列特征**：人口统计学信息、基线特征、患者选择标准
- **生物标志物分层**：分子亚型、基因组改变、IHC 表型
- **治疗暴露**：接受的治疗、剂量、各亚组的治疗持续时间
- **结局分析**：缓解率（ORR、DCR）、生存数据（OS、PFS）、DOR
- **统计方法**：Kaplan-Meier 生存曲线、风险比、log-rank 检验、Cox 回归
- **亚组比较**：按生物标志物分层的疗效、森林图、统计学显著性
- **安全性概况**：各亚组的不良事件、剂量调整、停药情况
- **临床建议**：基于生物标志物特征的治疗意义
- **图形**：瀑布图、泳道图、生存曲线、森林图
- **表格**：人口统计学表、生物标志物频率、各亚组结局

### 治疗推荐报告（详细章节——第 3 页及以后）

**治疗推荐报告的第 1 页执行摘要应包括：**
1. **报告信息框**：疾病状态、指南版本/日期、目标人群
2. **关键推荐框**（绿色）：按治疗线次列出的 3-5 项最重要的 GRADE 分级推荐
3. **生物标志物决策标准框**（蓝色）：影响治疗选择的关键分子标志物
4. **证据摘要框**（灰色）：支持推荐的主要试验（例如 KEYNOTE-189、FLAURA）
5. **关键监测框**（橙色/红色）：必要的安全性监测要求

**详细章节（第 3 页及以后）：**
- **临床背景**：疾病状态、流行病学、当前治疗格局
- **目标人群**：患者特征、生物标志物标准、分期
- **证据审查**：系统性文献综合、指南摘要、试验数据
- **治疗方案**：可用疗法及其作用机制
- **证据分级**：对每项推荐进行 GRADE 评估（1A、1B、2A、2B、2C）
- **按治疗线次划分的推荐**：一线、二线及后续治疗
- **生物标志物指导的选择**：基于分子特征的决策标准
- **治疗算法**：展示决策路径的 TikZ 流程图
- **监测方案**：安全性评估、疗效监测、剂量调整
- **特殊人群**：老年人、肾/肝功能不全患者、合并症患者
- **参考文献**：包含试验名称和引文的完整参考文献目录

## 输出格式

**强制性首页要求：**
- **第 1 页**：包含 3-5 个彩色 tcolorbox 元素的整页执行摘要
- **第 2 页**：目录（可选）
- **第 3 页及以后**：包含方法、结果、图和表的详细章节

**文档规范：**
- **主要格式**：LaTeX/PDF，页边距为 0.5in，以实现紧凑、数据密集的呈现
- **篇幅**：通常为 5-15 页（1 页执行摘要 + 4-14 页详细内容）
- **风格**：达到出版标准和制药行业标准，适用于监管申报
- **首页**：第 1 页始终为覆盖整页的完整执行摘要（参见“文档结构”章节）

**视觉元素：**
- **颜色**： 
  - 第 1 页信息框：蓝色=数据/信息，绿色=生物标志物/推荐，黄色/橙色=临床意义，红色=警告
  - 推荐框（绿色=强推荐，黄色=有条件推荐，蓝色=需要进一步研究）
  - 生物标志物分层（对分子亚型进行颜色编码）
  - 统计显著性（对 p 值、风险比进行颜色编码）
- **表格**： 
  - 包含基线特征的人口统计表
  - 各亚组的生物标志物频率
  - 结局表（按分子亚型列出 ORR、PFS、OS、DOR）
  - 各队列的不良事件
  - 包含 GRADE 评级的证据摘要表
- **图形**： 
  - 包含 log-rank p 值和风险人数表的 Kaplan-Meier 生存曲线
  - 展示各患者最佳疗效反应的瀑布图
  - 包含置信区间的亚组分析森林图
  - TikZ 决策算法流程图
  - 展示患者个体时间线的泳道图
- **统计数据**：风险比及 95% CI、p 值、中位生存时间、里程碑生存率
- **合规性**：根据 HIPAA Safe Harbor 进行去标识化，并为专有数据添加保密声明

## 集成

此技能与以下技能集成：
- **alterlab-scientific-writing**：引文管理、统计报告、证据综合
- **alterlab-clinical-reports**：医学术语、HIPAA 合规、单患者病例报告
- **alterlab-scientific-schematics**：用于决策算法和治疗路径的 TikZ 流程图
- **alterlab-treatment-plans**：将从队列中获得的见解应用于个体患者（双向）

## 路由：此技能与同级技能的区别

区分标准是**分析单位**：此技能处理**群体**（队列、亚组、证据库）；同级技能处理**单个患者**。

| 请求 | 技能 |
| --- | --- |
| 队列/亚组分析、生物标志物分层、采用 GRADE 分级的指南、制药/RWE 策略文档（群体层面） | **此技能** |
| 个体患者照护计划、SMART 目标、用于病历记录的患者特异性给药/监测 | `alterlab-treatment-plans` |
| 用于期刊投稿的单患者病例报告（例如 CARE 指南） | `alterlab-clinical-reports` |

此技能的示例：“按激素受体状态分析 60 名 HER2+ 乳腺癌患者及其生存结局。”

## 使用示例

### 患者队列分析

**示例 1：NSCLC 生物标志物分层**
```
> Analyze a cohort of 45 NSCLC patients stratified by PD-L1 expression (<1%, 1-49%, ≥50%) 
> receiving pembrolizumab. Include outcomes: ORR, median PFS, median OS with hazard ratios 
> comparing PD-L1 ≥50% vs <50%. Generate Kaplan-Meier curves and waterfall plot.
```

**示例 2：GBM 分子亚型分析**
```
> Generate cohort analysis for 30 GBM patients classified into Cluster 1 (Mesenchymal-Immune-Active) 
> and Cluster 2 (Proneural) molecular subtypes. Compare outcomes including median OS, 6-month PFS rate, 
> and response to TMZ+bevacizumab. Include biomarker profile table and statistical comparison.
```

**示例 3：乳腺癌 HER2 队列**
```
> Analyze 60 HER2-positive metastatic breast cancer patients treated with trastuzumab-deruxtecan, 
> stratified by prior trastuzumab exposure (yes/no). Include ORR, DOR, median PFS with forest plot 
> showing subgroup analyses by hormone receptor status, brain metastases, and number of prior lines.
```

### 治疗建议报告

**示例 1：HER2+ 转移性乳腺癌指南**
```
> Create evidence-based treatment recommendations for HER2-positive metastatic breast cancer including 
> biomarker-guided therapy selection. Use GRADE system to grade recommendations for first-line 
> (trastuzumab+pertuzumab+taxane), second-line (trastuzumab-deruxtecan), and third-line options. 
> Include decision algorithm flowchart based on brain metastases, hormone receptor status, and prior therapies.
```

**示例 2：晚期 NSCLC 治疗算法**
```
> Generate treatment recommendation report for advanced NSCLC based on PD-L1 expression, EGFR mutation, 
> ALK rearrangement, and performance status. Include GRADE-graded recommendations for each molecular subtype, 
> TikZ flowchart for biomarker-directed therapy selection, and evidence tables from KEYNOTE-189, FLAURA, 
> and CheckMate-227 trials.
```

**示例 3：多发性骨髓瘤治疗线序贯**
```
> Create treatment algorithm for newly diagnosed multiple myeloma through relapsed/refractory setting. 
> Include GRADE recommendations for transplant-eligible vs ineligible, high-risk cytogenetics considerations, 
> and sequencing of daratumumab, carfilzomib, and CAR-T therapy. Provide flowchart showing decision points 
> at each line of therapy.
```

## 证据分级

本技能采用两个互补的维度（完整矩阵请参阅 `references/treatment_recommendations.md` 和 `assets/recommendation_strength_guide.md`）：

- **推荐强度** — 强推荐（1 级，“我们推荐”：获益明确大于风险）与有条件推荐/弱推荐（2 级，“我们建议”：存在权衡，需要考虑患者的价值观）。第三个“研究”层级表示证据不足。
- **证据确定性** — 高 / 中等 / 低 / 极低，依据 GRADE 工作组的评估领域（因偏倚风险、不一致性、间接性、不精确性、发表偏倚而降级；因效应量大、剂量-反应关系、合理的混杂因素而升级观察性数据）。

全文使用的简明字母代码（1A、1B、2A、2B、2C）属于 **ACCP/Guyatt 表示法**（由 ACCP/CHEST 抗栓指南推广），它将两个维度组合为一个标签。GRADE 本身并不使用这些代码；当两者同时被引用时，应将其表述为 ACCP 风格的表示法，绝不可编造缺乏基础证据支持的等级。

（生物标志物、结局指标和统计方法的详细信息已在上文的**能力**部分及 `references/` 文件中介绍。）

## 最佳实践

### 队列分析

1. **患者筛选透明度**：清晰记录纳入/排除标准、患者流程以及排除原因
2. **生物标志物清晰度**：明确检测方法、平台（例如 FoundationOne、Caris）、截断值和验证状态
3. **统计严谨性**：
   - 报告风险比及 95% 置信区间，而不仅仅是 p 值
   - 在生存分析中纳入中位随访时间
   - 明确所用的统计检验（对数秩检验、Cox 回归、Fisher 精确检验）
   - 在适当情况下对多重比较进行校正
4. **结局定义**：使用标准判定标准：
   - 疗效：RECIST 1.1，免疫治疗使用 iRECIST
   - 不良事件：CTCAE 5.0 版
   - 体能状态：ECOG 或 Karnofsky
5. **生存数据呈现**：
   - 中位 OS/PFS 及 95% CI
   - 里程碑生存率（6 个月、12 个月、24 个月）
   - Kaplan-Meier 曲线下方的风险人数表
   - 清晰标示删失数据
6. **亚组分析**：预先指定亚组；清晰标明探索性分析与预先计划的分析
7. **数据完整性**：报告缺失数据及其处理方式

### 治疗推荐报告

1. **证据分级透明度**：
   - 始终如一地使用 GRADE 系统（1A、1B、2A、2B、2C）
   - 记录每个等级的判定依据
   - 清晰说明证据质量（高、中等、低、极低）
2. **全面的证据审查**：
   - 将 3 期随机试验作为主要证据
   - 针对新兴疗法补充 2 期试验数据
   - 注明真实世界证据和荟萃分析
   - 引用试验名称（例如 KEYNOTE-189、CheckMate-227）
3. **生物标志物指导的推荐**：
   - 将特定生物标志物与治疗推荐相关联
   - 明确检测方法和经验证的检测手段
   - 纳入伴随诊断的 FDA/EMA 批准状态
4. **临床可操作性**：每项推荐都应提供清晰的实施指导
5. **决策算法清晰度**：TikZ 流程图应明确无歧义，并包含清晰的是/否决策点
6. **特殊人群**：涵盖老年人、肾/肝功能损害者、孕妇以及药物相互作用
7. **监测指导**：明确安全性实验室检查、影像学检查及其频率
8. **更新频率**：注明推荐日期并制定定期更新计划

### 通用最佳实践

1. **第一页执行摘要（强制）**： 
   - 始终在第 1 页创建完整的执行摘要，并占满整个第一页
   - 使用 3-5 个彩色 tcolorbox 元素突出关键发现
   - 第 1 页不得包含目录或详细章节
   - 使用 `\thispagestyle{empty}`，并以 `\newpage` 结束
   - 这是最重要的一页——应确保读者可在 60 秒内快速浏览完毕
2. **去标识化**：在生成文档前移除全部 18 项 HIPAA 标识符（安全港方法）
3. **法规合规性**：为专有制药数据添加保密声明
4. **可直接发布的格式**：使用 0.5in 页边距、专业字体和颜色编码的章节
5. **可复现性**：记录所有统计方法，以便复现
6. **利益冲突**：在适用时披露制药行业资助或相关关系
7. **视觉层级**：一致地使用彩色框（蓝色=数据，绿色=生物标志物，黄色/橙色=建议，红色=警告）

## 参考资料

有关以下内容的详细指导，请参阅 `references/` 目录：
- 患者队列分析和分层方法
- 治疗建议制定
- 临床决策算法
- 生物标志物分类和解读
- 结局分析和统计方法
- 证据综合和分级体系

## 模板

有关 LaTeX 模板，请参阅 `assets/` 目录：
- `cohort_analysis_template.tex` - 包含统计比较的生物标志物分层患者队列分析
- `treatment_recommendation_template.tex` - 包含 GRADE 分级的循证临床实践指南
- `clinical_pathway_template.tex` - 用于治疗排序的 TikZ 决策算法流程图
- `biomarker_report_template.tex` - 分子亚型分类和基因组特征报告

**模板功能：**
- 使用 0.5in 页边距，实现紧凑展示
- 采用颜色编码的建议框
- 用于人口统计学特征、生物标志物和结局的专业表格
- 内置对 Kaplan-Meier 曲线、瀑布图和森林图的支持
- GRADE 证据分级表
- 用于制药文档的保密页眉

## 脚本

有关分析和可视化工具，请参阅 `scripts/` 目录：
- `generate_survival_analysis.py` - 生成包含时序检验、风险比和 95% 置信区间的 Kaplan-Meier 曲线（也涵盖队列和亚组分析的生存统计需求）
- `create_cohort_tables.py` - 人口统计学特征、生物标志物频率和结局表格
- `build_decision_tree.py` - 为治疗算法生成 TikZ 流程图
- `biomarker_classifier.py` - 按分子亚型进行患者分层的算法
- `validate_cds_document.py` - 质量与合规性检查（HIPAA、统计报告标准）