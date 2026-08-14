---
name: plannotator-compound
disable-model-invocation: true
description: >
  Analyze a user's Plannotator plan archive to extract denial patterns, feedback
  taxonomy, evolution over time, and actionable prompt improvements — then produce
  a polished HTML dashboard report. Falls back to Claude Code ExitPlanMode denial
  reasons when Plannotator data is unavailable.
---
# 复合规划分析

你正在对用户的 Plannotator 计划归档进行全面的研究分析。目标是：从被拒绝的计划中提取模式，将其归纳为可执行的洞见，并生成一份精美的 HTML 仪表板报告。

这是一个多阶段流程。每个阶段都必须完整完成后，才能开始下一阶段。研究的完整性至关重要——必须读取每个文件，不得跳过。

## 数据源选择

开始分析之前，请确定可用的数据源。

1. **Plannotator 模式（首选）**——确定 Plannotator 数据目录：如果设置了 `$PLANNOTATOR_DATA_DIR`，则使用它；否则使用 `~/.plannotator`。检查其中的 `plans/` 子目录。如果该目录存在并包含 `*-denied.md` 文件，则使用此模式。下面的整个工作流都是为 Plannotator 数据编写的。

2. **Claude Code 后备模式**——如果 Plannotator 归档不存在或不包含被拒绝的计划，请检查 `~/.claude/projects/`。如果该目录存在，请先阅读 [references/claude-code-fallback.md](references/claude-code-fallback.md)，然后再继续。该参考文档说明了如何使用随附的解析器 [scripts/extract_exit_plan_mode_outcomes.py](scripts/extract_exit_plan_mode_outcomes.py)，从 Claude Code JSONL 转录记录中提取拒绝原因。下面的每个阶段都附有一条简短说明，解释在后备模式下有哪些变化——详细信息请参阅该参考文件。

3. **两者都不可用**——请用户提供其 Plannotator 计划目录或 Claude Code 项目目录。不要猜测。

## 阶段 0：定位计划并检查既有报告

使用上方“数据源选择”中选定的模式。

**Plannotator 模式：**验证计划目录是否包含 `*-denied.md` 文件。如果不存在任何此类文件，请先回退到 Claude Code 模式，而不是直接停止。

**Claude Code 后备模式：**按照后备模式参考文档运行随附的解析器，以构建拒绝原因数据集。如有需要，请创建 `/tmp/compound-planning/`。

无论使用哪种模式，都请继续执行下面的“既有报告检测”。

### 既有报告检测

定位计划目录后，检查是否存在已有报告：

```
ls ${PLANNOTATOR_DATA_DIR:-~/.plannotator}/plans/compound-planning-report*.html
```

报告采用带版本号的命名方案：
- 第一份报告：`compound-planning-report.html`
- 后续报告：`compound-planning-report-v2.html`、`compound-planning-report-v3.html` 等。

如果存在一份或多份报告，请确定其中**最新**的一份（版本号最高）。使用 `stat` 获取其文件系统修改日期（macOS：`stat -f %Sm -t %Y-%m-%d`，Linux：`stat -c %y | cut -d' ' -f1`）。该日期即为**截止日期**。

向用户提供以下选项：

> “我发现了一份既有报告（`compound-planning-report-v{N}.html`），最后更新于 {CUTOFF_DATE}。我可以选择：
>
> 1. **增量分析**——仅分析日期晚于 {CUTOFF_DATE} 的文件，从而节省 token，并基于之前的发现继续分析
> 2. **完整分析**——从头开始重新分析整个归档
>
> 你更希望采用哪一种方式？”

等待用户回复后再继续。

**如果是增量分析：** 筛选后续所有阶段，使其仅处理日期晚于截止日期的文件。新版本报告将在标题叙述中注明其覆盖从 {CUTOFF_DATE} 至今的时间段，并引用上一份报告以获取更早的发现。清单（阶段 1）仍应统计所有文件以得出整体统计数据，但要明确区分“自上次报告以来新增”的数量。

**如果是完整分析：** 正常处理所有文件，但输出文件名仍使用下一个版本号。

**如果不存在上一份报告：** 正常处理。输出文件名将为 `compound-planning-report.html`（第一份报告不带版本后缀）。

## 阶段 1：清单

统计并报告数据集。**无论本次运行是增量分析还是完整分析，都要统计所有文件**以得出整体统计数据：

```
- *-approved.md files (count)
- *-denied.md files (count)
- Date range (earliest to latest date found in filenames)
- Total days spanned
- Revision rate: denied / (approved + denied) — this is the "X% of plans
  revised before coding" stat used in dashboard section 1
```

**注意：** 完全忽略 `*.annotations.md` 文件。被拒绝的文件已包含完整的计划文本，以及附加在 `---` 分隔符之后的所有审查者反馈。注释文件是这些内容的冗余子集——同时读取两者会重复计算反馈。

**如果是增量模式：** 在总数之后，单独报告仅限截止日期之后文件的数量：

```
New since {CUTOFF_DATE}:
- *-denied.md files: X (of Y total)
- New date range: {CUTOFF_DATE} to {LATEST_DATE}
- New days spanned: N
```

如果自截止日期以来新增的被拒绝文件少于 3 个，请警告用户：
> “自上次报告以来只有 {N} 个新增的被拒绝计划。增量分析的内容可能较为单薄。你想继续，还是切换到完整分析？”

还要对所有 `*-approved.md` 文件运行 `wc -l`，以获取每个已批准计划的平均行数。这可以让用户了解其计划是一直保持精简，还是随着时间推移变得臃肿。你不需要读取已批准计划的内容——只需读取它们的行数。如果可能，请按时间段（例如按月）细分，以显示计划规模是否发生变化。

日期以 YYYY-MM-DD 格式出现在文件名中，有时作为前缀
(2026-01-07-name-approved.md)，有时嵌入其中 (name-2026-03-15-approved.md)。
从所有文件名中提取日期。

告诉用户你发现了什么，并说明你将开始提取。

**Claude Code 回退模式：** 上述 Plannotator 清单字段不适用。
请改为遵循
[references/claude-code-fallback.md](references/claude-code-fallback.md) 中的清单说明——
报告由解析器汇编的拒绝原因数据集。

## 阶段 2：映射——并行提取

这是最耗时的阶段。你必须读取范围内的每一个 `*-denied.md` 文件。不要跳过任何文件。不要过早总结。

**范围内**是指：运行完整分析时的所有被拒绝文件，或运行增量分析时仅限日期晚于截止日期的被拒绝文件。在增量模式下，只处理其嵌入的 YYYY-MM-DD 日期严格晚于截止日期的文件。

**Claude Code 回退模式：** 解析器输出是干净的源数据集。请阅读回退参考资料，了解专用于 JSON 分片文件的提取提示词和批处理策略。除非解析器失败或用户要求进行审计级验证，否则不要返回原始 `.jsonl` 日志。

**重要提示：** 仅阅读 `*-denied.md` 文件。不要阅读已批准的计划、注释文件或差异文件。每个被拒绝文件都包含完整的计划文本，随后是一个 `---` 分隔符和审核者的反馈——分析所需的一切都在一个文件中。

### 批处理策略

所有提取代理都应使用 `model: "haiku"`——它们执行的是直接的文件读取和结构化提取，而不是推理。Haiku 在这项工作中速度更快、成本更低。

具体方法取决于数据集大小：

**极小型数据集（总文件数 ≤ 10）：** 直接在主代理中读取所有文件——无需使用子代理。只需按顺序读取它们，然后进入阶段 3。

**小型数据集（11-30 个文件）：** 并行启动 2-3 个 Haiku 代理，大致均匀地分配文件。

**中型数据集（31-80 个文件）：** 并行启动 4-6 个 Haiku 代理（每个约 10-15 个文件）。按文件类型和/或时间段拆分。

**大型数据集（80 个以上文件）：** 根据需要并行启动尽可能多的 Haiku 代理，使每个批次保持在 10-15 个文件左右。按照数据中的自然时间边界进行拆分（月份、季度或任何能够产生均衡批次的分组方式）。如果某个时间段占比过高（例如最近一个月的文件数是其他月份的 3 倍），请将该时间段拆分成多个批次。

使用 Agent 工具并设置 `run_in_background: true` 和 `model: "haiku"`，并行启动所有提取代理。

### 输出文件

每个提取代理必须将结果写入干净的输出文件，而不是依赖代理任务输出（其中包含交错的 JSONL 框架日志，难以解析）。指示每个代理写入：

```
/tmp/compound-planning/extraction-{batch-name}.md
```

在启动代理之前创建 `/tmp/compound-planning/` 目录。阶段 3 中的归并代理将直接读取这些干净的文件。

### 提取提示词

每个代理都会收到以下指令（根据时间段、文件列表和输出路径进行调整）：

```
You are extracting structured data from denied plan files for a pattern analysis.

Directory: [PLANS DIRECTORY]
Files to read: [LIST OF SPECIFIC *-denied.md FILES]
Output: Write your complete results to [OUTPUT FILE PATH]

Each denied file contains two parts separated by a --- line:
1. The plan text (above the ---)
2. The reviewer's feedback and annotations (below the ---)

Read EVERY file in your list. For EACH file, extract:
- The plan name/topic (from the plan text above the ---)
- The denial reason or feedback given (from below the --- — capture the actual
  words used)
- What was specifically asked to change
- The type of feedback (let the content determine the category — don't force-fit
  into predefined types. Common types include things like: scope concerns,
  approach disagreements, missing information, process requirements, quality
  concerns, UX/design issues, naming disputes, clarification requests,
  testing/procedural denials — but the user's actual patterns may differ)
- Any specific phrases or recurring language from the reviewer
- Individual annotations if present (numbered feedback items with quoted text
  and reviewer comments)
- The date (extracted from the filename)

Do NOT skip any files. One entry per file.

Format each entry as:
**[filename]**
- Date: ...
- Topic: ...
- Denial reason: ...
- Feedback type: ...
- Specific asks: ...
- Notable phrases: ...
- Annotations: [count, with brief summary of each]
---

After processing all files, write the complete results to [OUTPUT FILE PATH].
State the total file count at the end of the file.
```

### Agent 运行期间

跟踪完成情况。每当一个 Agent 完成时，记录其处理的文件数量。
验证总数是否与阶段 1 的清单一致。如果任何 Agent 的数量不足，
将其标记出来，并考虑针对缺失的文件重新启动 Agent。

如果 Agent 超时（处理大批次时可能发生——一批 128 个文件可能需要
8 分钟以上），请仅针对尚未处理的文件重新启动 Agent。检查输出
文件，确认其在超时前处理到了什么位置。

## 阶段 3：归约——模式分析

所有提取 Agent 均完成后（对于微型数据集，则为所有文件均已读取后），
开始归约。归约 Agent 应使用 `model: "sonnet"`
——此阶段需要真正的分析推理，而不仅仅是读取文件。

### 归约策略

采用的方法取决于生成了多少个提取文件：

**标准规模（≤ 20 个提取文件）：** 启动一个 Sonnet Agent 读取所有
提取文件并生成完整分析。这适用于大多数数据集。

**大规模（21 个以上提取文件）：** 使用两阶段归约：

1. **阶段 1——部分归约：** 将提取文件分成每组 4–6 个。
   并行启动多个 Sonnet Agent，每个 Agent 读取一组文件，并按照下方列出的
   相同章节生成一份部分分析。每个 Agent 将结果写入
   `/tmp/compound-planning/partial-reduce-{N}.md`。

2. **阶段 2——最终归约：** 由一个 Sonnet Agent 读取所有部分归约
   文件，并将其综合为最终的全面分析。该 Agent 负责合并分类体系、汇总计数、
   对模式进行去重，并协调各部分之间存在冲突的分类。

**Claude Code 回退模式：** 归约阶段保持不变。上游唯一的区别
在于，提取文件来源于规范化的拒绝原因 JSON，而不是 Plannotator Markdown 文件。

### 归约提示词

向每个归约 Agent 提供以下提示词（根据单阶段或多阶段调整文件路径）：

```
You are a data scientist conducting the reduction phase of a map-reduce analysis
across a user's denied plan archive.

Read ALL extraction files at [FILE PATHS]

These files contain structured extractions from every denied plan file. Each
extraction includes the plan topic, denial feedback, annotations, and reviewer
language. Your job: aggregate everything, find patterns, cluster into a taxonomy,
and produce a comprehensive analysis.

Be exhaustive. Use real counts. Quote real phrases from the data. This is
research — no hand-waving, no fabrication.

Write your complete results to [OUTPUT FILE PATH].

Produce the following sections:
[... sections listed below ...]
```

归约 Agent 的任务是让数据自行呈现结论。不要强加预先确定的
框架——应发现数据中实际存在的内容。分析必须包含：

### 1. 拒绝原因分类体系
将每一次拒绝归入由数据中涌现出的有限类型集合。统计
出现次数。展示百分比。为每种类型提供真实的示例引文。目标是形成
8–15 个类别——既足够具体，又少到便于快速浏览。让用户的
实际反馈决定类别的划分。

### 2. 主要反馈模式（按频率排序）
最常出现的 5-10 种模式。对于每种模式：审阅者持续提出了什么要求、
来自不同文件的 3 个以上示例引文，以及该模式是否随时间发生变化。

### 3. 高频措辞
审阅者反复使用的原句、出现次数及其所传达的含义。这些是
审阅者的惯用表达——是他们用于简洁表达其关注点的术语。

### 4. 审阅者看重什么（隐含偏好）
从模式中推导——这个人最看重什么？质量？
速度？叙事？架构？流程？简洁性？按照证据强度排序。
本节读起来应像是对审阅者评判标准的个性画像。

### 5. 代理总是做错什么
反面情况——哪些反复出现的错误会导致拒绝？对于这位审阅者，代理应该停止
做什么？

### 6. 结构性要求
审阅者持续要求采用什么样的计划结构？必需的章节、
顺序、格式偏好以及预期的详细程度。

### 7. 随时间的演变
反馈模式在整个时间跨度内如何变化。按照数据中自然形成的时间
边界进行分组（较短时间跨度按周，较长时间跨度按月）。期望是否
逐渐成熟？是否出现了新模式？发生了哪些转变？如果数据集涵盖的时间
不足一个月，请指出演变分析存在局限，但仍需查找从早期文件到后期文件
是否有任何进展。

### 8. 可执行的提示词指令
最重要的输出。基于所有模式：编写具体的编号指令，
使其可嵌入规划提示词中，以避免最常见的拒绝原因。将这些指令写成代理能够遵循的实际要求。应针对
该用户的具体模式——像“写出好的计划”这样的泛泛建议毫无价值。每条
指令都应追溯到一个真实且频繁出现的拒绝模式。

编写完这些指令后，计算它们能够覆盖的拒绝所占的百分比
（统计属于这些指令所覆盖类别的拒绝数量，并与拒绝总数进行比较）。
报告该百分比——每个用户的结果都会不同。

## 阶段 4：生成 HTML 仪表板

构建一个独立、自包含的 HTML 文件作为最终交付物。使用带版本号的文件名，将其保存到
用户的计划目录中：

- 首次报告：`compound-planning-report.html`
- 第二次报告：`compound-planning-report-v2.html`
- 第三次报告：`compound-planning-report-v3.html`
- 依此类推。

版本号已在阶段 0 中根据找到的现有报告确定。

**如果这是增量报告**，标题应注明分析
时段（例如，“2026 年 3 月 15 日至 3 月 31 日”），并包含一个副标题，注明
“增量分析——更早的发现请参阅 v{N-1}。”第 1 节中的叙述
应将发现表述为自上次报告以来的新增内容或变化，而不是完整全貌。
标题中的总体统计数据（文件数量、修订率）仍应反映完整归档，以提供背景信息。

读取 `assets/report-template.html` 中的模板，但**仅参考其设计语言**。
该模板包含先前分析中的示例数据——忽略模板中的所有
数据值、引文和百分比。仅使用其视觉设计：
颜色、字体排印、间距、组件样式和布局模式。

### 设计语言（来自模板）

- **配色：** 浅色模式，暖白色 (#FDFCFB)，文本使用石板灰色阶，琥珀色用于
  高亮/强调，祖母绿色用于正向内容，玫瑰色用于负向内容，靛蓝色用于
  操作元素
- **字体：** Playfair Display（衬线体，用于叙事性标题）、Inter（无衬线体，
  用于正文/数据）、JetBrains Mono（等宽字体，用于代码/短语）— Google Fonts CDN
- **布局：** 单栏，最大宽度 1024px，充裕的垂直留白（主要章节之间间隔 128px），
  以编辑性/叙事性为先的美学风格
- **基调：** 平静、深思、权威。像一篇个人回顾日志，
  而不是监控仪表板。

### 页面框架（页眉 + 页脚）

在这 7 个章节之前，页面包含：

- **页眉：** 左侧为报告标题（Playfair Display，约 36px），其下方以浅色元信息文本显示项目名称 +
  日期范围。右侧：以等宽字体显示文件计数
  （例如，“223 次否决 · 71 天”）。通过
  底部边框与内容分隔。第 1 节之前留有充裕的底部内边距。

- **页脚：** 位于第 7 节之后。顶部边框，居中显示 Playfair Display 斜体标语，
  概括整个语料库（例如，“对 Plannotator
  归档中 X 个被否决计划的分析。”）。

### 仪表板章节顺序（7 个章节）

报告严格遵循以下章节顺序。每个章节都建立在前一章节之上
——整体脉络从“发生了什么”，经过“为什么”，最终走向“该如何应对”：

1. **数据中的故事** — 一段编辑式叙事正文（Playfair Display
   衬线体，约 26px），以散文形式讲述最重要的发现。不是项目符号列表，而是
   一段真正的正文，读起来像文章的开篇。旁边是一个 KPI
   侧栏，包含 3 个关键指标（最高的否决占比、总体修订率，
   以及发现的不同否决类别数量）。在叙事正文中最引人注目的数字上使用琥珀色
   行内高亮。

2. **计划为何被否决** — 以排名列表展示分类体系。每行包含：排名序号
   （等宽字体）、类别标签、一条 4px 的细进度条（第一项使用 amber-500，其余
   使用 slate-300）、百分比（等宽字体），并且对于排名靠前的条目，在标签下方显示一条来自
   数据的真实斜体引文。展示前 10 个类别，或数据能够支持的全部类别（至少 5 个）。

3. **期望如何演变** — 每个自然时间段对应一张卡片。每张卡片包含：
   以衬线体显示的时间段名称、以彩色大写字母显示的主题短语（每个时间段使用不同颜色
   以体现演进）、一段描述正文，以及底部的统计行
   （例如，“X 次否决 · Y 次叙事请求”）。如果数据跨越的不同时间段少于
   3 个，则使用 2 张卡片，甚至可以仅使用一张卡片并在内部
   标注演进过程。

4. **哪些做法有效，哪些无效** — 两张并排卡片。左侧：绿色调
   （emerald-50/50 背景、emerald-100 边框），列出能够通过该审查者评审的计划所具备的特征。
   右侧：红色调（rose-50/50 背景、rose-100 边框），列出
   智能体反复出错的方面。两者均来自归约分析。使用带有小型彩色圆点的
   项目符号列表。每张卡片包含 5-8 项。

5. **可执行的产出** — 诊断分析的最终成果。以一句 Playfair
   Display 叙事性语句开篇，说明推导出了多少条提示词指令，
   以及预计能够解决多大比例的否决问题（使用第 3 阶段实际计算得出的
   百分比，而不是泛化数字）。随后以编号项目展示影响最大的 3 项
   改进，每项包含琥珀色编号、加粗标题和
   单行描述。本节衔接前述分析与随后给出的完整提示词。

6. **你最常用的短语** — 使用标签网格展示（移动端 2 列，桌面端 3 列）。每个
   标签：左侧为等宽字体的带引号短语，右侧为出现次数。白色
   背景、slate-200 边框、12px 圆角。展示找到的 9-12 个最常重复出现的短语。
   这些应当是评审者实际使用的措辞——他们独有的语言指纹。

7. **纠正提示词** — 深色面板（slate-900 背景、白色文本、3xl 圆角、
   xl 阴影）。开头使用 Playfair 字体，以一句话介绍这些指令。随后是
   一个深色代码块（slate-800/80 背景、amber-200 等宽字体文本），其中包含
   第 3 阶段生成的完整编号提示词指令。添加一个可正常使用的复制到剪贴板
   按钮（包含 JS）。在代码块下方：放置一张带渐变光晕的卡片
   （白色卡片后方带有从靛蓝到紫色的模糊光晕），并在结尾说明
   这些指令是专属于用户的——它们源自用户自己的反馈、
   自己的语言和自己的标准。

### 调整规则

- 如果用户的数据不足 3 个月，将演变部分缩减为更少的卡片
- 如果大多数被拒文件在 `---` 下方都没有反馈（仅拒绝而无
  批注），请在叙述中说明这一点——分析内容将较为有限
- **Claude Code 回退模式：**明确将报告来源标注为 Claude Code
  `ExitPlanMode` 拒绝原因。不要虚构仅适用于 Plannotator 的字段，例如
  批注数量或已批准计划的行数。有关 KPI 替代指标以及页脚/来源说明的指导，
  请参阅回退参考文档。
- 如果得出的拒绝类别少于 5 个，将分类体系和模式
  两部分合并为一个部分
- 如果数据集非常小（少于 20 个文件），应在叙述中说明
  样本量有限，并将调查结果表述为初步结论
- 提示词指令的数量因用户而异——可能是 8 条，也可能是 20 条。不要
  强行规定为正好 17 条。让数据决定数量。
- 第 5 部分中可执行性最强的 3 项必须是覆盖拒绝案例比例最高的
  3 项，而不是听起来最令人印象深刻的 3 项

### 关键规则

1. 每个数字都必须来自真实分析——不得虚构数据
2. 每段引文都必须是来自真实文件的真实引文
3. 分类体系中的百分比必须根据真实计数计算
4. 提示词指令必须能够追溯到实际的拒绝模式
5. 提示词区块上的复制按钮必须正常工作（包含 JS）

生成后，在用户的浏览器中打开该文件。

## 第 5 阶段：总结

告知用户：
- 分析了多少个被拒文件
- 如果是增量分析：自上次报告以来新增了多少个文件
- 发现的 3 个主要拒绝模式
- 预计提示词指令可解决的拒绝案例百分比
- 影响最大的一项提示词改进
- 报告的保存位置（包括版本号）
- 如果是增量分析：提醒用户，较早的调查结果位于上一份报告中

**Claude Code 回退模式：**按照回退参考文档调整总结——
报告分析的人工作出的拒绝原因数量和扫描的 `ExitPlanMode` 尝试总数，
而不是 Plannotator 文件数量。

## 阶段 6：改进钩子

展示摘要后，询问用户是否希望启用**改进钩子**——该钩子会提取报告第 7 节中的纠正性提示词指令，并将其写入一个文件，以便 Plannotator 的 `EnterPlanMode` 钩子自动将其注入今后的每次规划会话中。

> “你想启用改进钩子吗？这会将纠正性提示词指令保存到一个文件中，并自动注入今后的所有规划会话——这样 Claude 在编写任何计划之前都能看到你的反馈模式。”

**如果选择是：**

钩子文件位于：

```
${PLANNOTATOR_DATA_DIR:-~/.plannotator}/hooks/compound/enterplanmode-improve-hook.txt
```

如果数据目录中不存在 `hooks/compound/` 目录，请创建它。

文件内容应为阶段 3 中的纠正性提示词指令——即 HTML 报告第 7 节中出现的同一编号列表。以纯文本形式写入，每行一条指令，并以对应编号作为前缀。不要包含 HTML、Markdown 代码围栏或前言——只写指令本身。钩子系统会将此文件的内容原样注入规划上下文。

**如果文件已存在：**

读取现有文件，并向用户提供以下选择：

> “之前的分析已经创建了一个改进钩子。我可以：
>
> 1. **替换**——使用新指令覆盖原有内容（旧指令将被删除）
> 2. **合并**——合并两者，对重叠的指令去重，并保留每条指令的最佳版本
> 3. **保留现有内容**——保持当前钩子不变，跳过此步骤
>
> 你希望选择哪一种？”

- **替换：** 使用新指令覆盖该文件。
- **合并：** 读取现有指令，将其与新指令进行比较，并生成一组合并后的指令。删除重复项（即使措辞不同，只要意图相同也视为重复）。当两条指令针对相同模式时，保留更具体或更具可操作性的版本。按顺序重新为最终列表编号。将合并结果写入文件。向用户展示具体变更（新增 N 条、删除 N 条冗余指令、保留 N 条现有指令）。
- **保留现有内容：** 不执行任何操作，继续下一步。

**如果选择否：** 完全跳过此阶段。

## 重要说明

- **数据源优先级：** Plannotator 是首选路径。对于没有 Plannotator 归档的用户，Claude Code 日志分析是次选路径。
- **研究完整性：** 必须读取每个文件。此分析的价值来自完整性。抽样或跳过文件会削弱分析结果。
- **仅使用真实数据：** 切勿捏造引述、百分比或模式。如果数据未显示出明确模式，应如实说明，而不是凭空编造。
- **让数据引导分析：** 分类体系、模式和指令应源自文件中的实际内容。不同用户的拒绝模式会截然不同。开发移动应用的用户与开发 API 的用户会提供不同的反馈。不要预设会出现哪些模式。
- **代理并行化：** 对于大型数据集，应最大限度地使用并行代理以缩短实际耗时。瓶颈取决于最大的批次——应将其拆分。
- **结构化提取格式：** 要求提取代理返回带有一致分隔符的结构化文本，以便归并代理可靠地解析。
- **报告即交付成果：** HTML 仪表板是用户最终保留的内容。它应当美观、真实且实用。每个部分都应让用户感到它是专门为他们撰写的，因为事实确实如此。