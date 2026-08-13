---
name: arxiv-preflight
description: "Run a submission-readiness preflight on a manuscript before arXiv upload. Use when the user is preparing an arXiv submission, asks to check a paper before uploading, mentions hallucinated or fake references, leftover LLM meta-comments / prompts in text, placeholder data (TODO, TBD, XX%), AI-use disclosure, scholarly integrity, research integrity, or arXiv moderation risk — even if they don't say \"preflight\". Also trigger on phrases like \"check my paper before arXiv\", \"verify my references\", \"scan for AI artifacts\", \"scan for LLM residue\", \"is my submission ready\", or \"review .tex/.bib before submit\"."
license: MIT
author: AIPOCH
---
> **来源**：[https://github.com/aipoch/medical-research-skills](https://github.com/aipoch/medical-research-skills)

# arXiv 提交前检查

在上传至 arXiv 之前，对稿件的提交就绪情况进行审查。目标**不是**从文风上判断论文是否由 AI 撰写。目标是找出具体、可定位、可审查的证据，包括未经检查的 LLM 输出、虚构的参考文献、占位数据、缺乏依据的主张以及 arXiv 政策风险，并向作者提供一份修复清单。

应以 arXiv 的实际立场为准：作者可以使用生成式 AI 工具，但必须对内容承担全部责任，并按照所在领域的规范披露重大使用情况；AI 工具不得被列为作者。确切措辞请参阅 `references/arxiv_policy_notes.md`。

此技能有意保持平台中立。它应适用于任何能够读取文件并运行本地 Python 脚本的 AI 编码/审查代理；不需要 OpenAI 特有的 UI 元数据。

需要 Python 3.9+。

## 工作流程

1. **识别输入。** 询问或检测：LaTeX 项目目录、单个 PDF、BibTeX 文件、补充图表或实验数据。优先使用 LaTeX 源文件而非渲染后的 PDF——PDF 文本提取会丢失结构，并导致参考文献检查产生更多噪声。

2. **提取稿件文本。** 对输入运行 `scripts/extract_manuscript_text.py`。它会合并 `\input`/`\include`，去除 LaTeX 命令，同时保留章节/图/表/引文键，并在必要时回退到 PDF 文本提取。输出：`manuscript.json`，其中包含 `sections`、`figures`、`tables`、`cite_keys`、`numbers` 和 `warnings`。将未解析或跳过的包含项视为审查风险。

3. **硬性红线扫描。** 对提取的文本运行 `scripts/scan_ai_artifacts.py`。它会标记 LLM 元评论、提示词残留、占位内容、TODO/TBD/XX% 以及将 AI 列为作者的情况。模式位于 `references/ai_artifact_patterns.md` 中——当用户报告新的失败模式时，应扩展该列表。任何命中项均为 `BLOCKER`，除非用户明确给出合理解释。

4. **核验参考文献。** 对 `.bib`（或提取的参考文献列表）运行 `scripts/verify_references.py`。它会执行：(a) BibTeX 结构检查；(b) 依次通过 Crossref / arXiv / OpenAlex / Semantic Scholar 进行外部元数据查询；(c) 对引文键与 \cite 进行核对。分级和 API 策略请参阅：`references/reference_verification.md`。**如果网络不可用，请将此部分标记为 `INCOMPLETE`，而不是直接跳过且不作说明。**

5. **交叉检查主张、数字以及图表引用。** 使用 `manuscript.json` 审查提取出的数字、标签和引用。此版本会公开原始结构，以便代理辅助进行一致性审查；它不会完全自动化语义层面的主张核验。向作者指出可能存在的不一致之处并请其确认，绝不要改写他们的主张。

6. **AI 使用披露检查。** `scripts/scan_ai_artifacts.py` 包含一个针对实质性使用 LLM 的有限披露启发式检查。对于复杂情况，请自行将检测到的 AI 辅助信号与稿件中的致谢 / 方法 / 伦理部分进行比较。仅在有明显重大使用的情况下建议披露；不要要求每篇论文都添加样板式披露。校准标准请参阅：`references/arxiv_policy_notes.md`。

7. **arXiv 审核预检查。** 在智能体辅助下扫描非研究性内容（仅表达观点、提出方案或以课程项目为定位，且没有研究贡献）、版权风险（出版商 PDF、审稿人评论、未经许可的图片、大段第三方文本），以及切香肠式发表/重复投稿的迹象。此版本未附带专用的审核扫描器。不要预测 arXiv 是否会接受投稿——只需指出风险。

8. **生成报告。** 运行 `scripts/generate_preflight_report.py`，将所有 JSON 输出合并为一份 Markdown 报告。格式和决策规则参见：`references/report_template.md`。

## 风险级别

- `BLOCKER` — 应当阻止投稿的证据：正文中存在 LLM 元评论、将 AI 列为作者、参考文献无法在任何外部数据库中匹配、结果表格中存在未填写的占位符。
- `HIGH` — 很可能存在诚信或政策问题：DOI/标题不匹配、引用键指向错误论文、强断言在稿件中没有支持性数值。
- `MEDIUM` — 不一致、元数据缺失、披露不明确、\ref 损坏。
- `LOW` — 润色、格式、大小写问题。

## 决策规则

- 任何 `BLOCKER` → `HOLD`。
- 无阻断项，但存在任何 `HIGH`/`MEDIUM` → `PASS_WITH_FIXES`。
- 仅有 `LOW` 或没有问题 → `PASS`。

绝不要为了稳妥而提高发现项的严重级别，也绝不要悄然降低其严重级别。如果不确定，请标记为 `MEDIUM` 并说明原因。

## 规则

- **绝不要仅凭写作风格就认定论文由 AI 生成。** 风格不是证据；元评论、虚假引用和占位符才是。
- **每个发现项都必须注明位置。** 对于 `.tex`/`.bib`，注明文件和行号；对于 PDF 输入，除非可以按页提取，否则请注明 PDF 文件和所提取文本的行号。包含一段逐字引用的简短片段（≤ 25 个词）。没有位置的发现项只是建议，而非发现——请将其移至“建议清理”。
- **将外部元数据不匹配视为线索。** 单个字段不一致（例如页码）属于 `MEDIUM`。如果标题 + 作者 + 年份在全部四个数据库中均无法匹配，则属于 `BLOCKER`。
- **网络未完成不等于网络检查通过。** 如果参考文献查询因连接问题失败，则报告中的参考文献部分应为 `INCOMPLETE`；总体决策不能为 `PASS`。
- **不要改写作者的论断。** 提供修复建议、问题和位置。由作者自行改写。
- **以降低召回率为代价，尽量减少误报。** 此工具在投稿前运行；错误的 `BLOCKER` 比漏掉一个 `LOW` 的代价更高。

## 何时阅读哪份参考资料

- `references/arxiv_policy_notes.md` — 在校准披露建议或审核发现项时阅读。
- `references/ai_artifact_patterns.md` — 在扩展或解读伪影扫描器的命中项时阅读。
- `references/reference_verification.md` — 在解读引用查询输出、决定 API 顺序或处理速率限制/网络故障时阅读。
- `references/report_template.md` — 在编写或重新生成最终报告时阅读。

## MVP 范围

此技能当前包含：文本提取、AI 伪影扫描、BibTeX + DOI/arXiv-ID 参考文献验证、标签/引用/数值结构提取，以及 Markdown 报告生成。v1 范围之外：完整的语义同行评审、完整的论断/结果验证、自动化审核判断、AI 写作概率评分、自动改写、自动上传至 arXiv、大规模抄袭检测。如果用户提出这些要求，请明确说明其不在范围内，而不要尝试近似实现。

