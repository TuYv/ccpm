---
name: literature-review
description: Conduct comprehensive, systematic literature reviews using multiple academic databases (PubMed, arXiv, bioRxiv, Semantic Scholar, etc.). This skill should be used when conducting systematic literature reviews, meta-analyses, research synthesis, or comprehensive literature searches across biomedical, scientific, and technical domains. Creates professionally formatted markdown documents and PDFs with verified citations in multiple citation styles (APA, Nature, Vancouver, etc.).
allowed-tools: Read Write Edit Bash
license: MIT license
metadata:
  version: "1.4"
  skill-author: K-Dense Inc.
  openclaw:
    primaryEnv: OPENROUTER_API_KEY
    envVars:
    - name: OPENROUTER_API_KEY
      required: false
      description: OpenRouter API key for the skill's LLM-powered steps.
---
# 文献综述

## 概述

遵循严格的学术方法开展系统、全面的文献综述。检索多个文献数据库，按主题综合研究发现，核实所有引文的准确性，并生成 Markdown 和 PDF 格式的专业输出文档。

此技能使用 **parallel-web skill**（`parallel-cli search`）作为开展广泛学术文献发现的主要网络搜索工具，并辅以专门的数据库访问技能（gget、bioservices、datacommons-client）。它提供用于引文核实、结果聚合和文档生成的专用工具。

## 何时使用此技能

在以下情况下使用此技能：
- 为研究或发表开展系统性文献综述
- 综合多个来源中有关特定主题的当前知识
- 开展 Meta 分析或范围综述
- 撰写研究论文或学位论文的文献综述部分
- 调查某一研究领域的最新进展
- 识别研究空白和未来方向
- 需要经核实的引文和专业排版

## 使用科学示意图进行视觉增强

**⚠️ 强制要求：每篇文献综述都必须使用 scientific-schematics 技能包含至少 1–2 张 AI 生成的图。**

这不是可选项。没有视觉元素的文献综述是不完整的。在完成任何文档之前：
1. 至少生成一张示意图或图表（例如用于系统性综述的 PRISMA 流程图）
2. 对于综合性综述，建议使用 2–3 张图（检索策略流程图、主题综合图、概念框架）

**如何生成图：**
- 使用 **scientific-schematics** 技能生成由 AI 驱动、达到出版质量的图表
- 只需用自然语言描述所需的图表
- Nano Banana Pro 将自动生成、审查并优化示意图

**如何生成示意图：**
```bash
python scripts/generate_schematic.py "your diagram description" -o figures/output.png
```

AI 将自动：
- 创建具有恰当格式、达到出版质量的图像
- 通过多轮迭代进行审查和优化
- 确保无障碍性（色盲友好、高对比度）
- 将输出保存到 figures/ 目录

**何时添加示意图：**
- 用于系统性综述的 PRISMA 流程图
- 文献检索策略流程图
- 主题综合图
- 研究空白可视化图谱
- 引文网络图
- 概念框架图示
- 任何可从可视化中获益的复杂概念

有关创建示意图的详细指南，请参阅 scientific-schematics 技能文档。

---

## 核心工作流程

一篇文献综述分为七个阶段，完整记录了命令和模板，
详见 [references/core_workflow.md](references/core_workflow.md)：

1. **规划与界定范围** — 研究问题、纳入与排除标准以及范围。
2. **系统性文献检索** — 使用记录在案的查询进行多数据库检索。
3. **筛选与选择** — 先进行标题/摘要筛选，再进行全文筛选，并保留计数
   用于 PRISMA 流程图。
4. **数据提取与质量评估** — 结构化提取以及偏倚风险
   或质量评价。
5. **综合与分析** — 跨研究开展主题性或定量综合。
6. **引文核实** — 根据实际来源核查每一条引文。
7. **文档生成** — 编制包含完整参考文献的综述。

在整个过程中记录每个搜索字符串和日期：无法复现自身搜索的综述就不是系统综述。各数据库的搜索指南和引用格式见 [references/search_and_citation.md](references/search_and_citation.md)，完整的综述示例见 [references/example_workflow.md](references/example_workflow.md)。

## 最佳实践

### 搜索策略
1. **从 parallel-web 开始**：在查询专业数据库之前，使用 `parallel-cli search` 并限定学术域名，以获得初步的广泛覆盖
2. **使用多个数据库**（至少 3 个）：确保全面覆盖——parallel-web 可计为一个来源
3. **纳入预印本服务器**：捕捉最新的未发表研究结果
4. **记录所有内容**：为确保可复现性，记录搜索字符串、日期和结果数量——将所有 parallel-cli 输出保存到 `sources/`
5. **测试并优化**：运行试验性搜索，审查结果，调整搜索词
6. **按引用次数排序**：在可用时，按引用次数对搜索结果排序，以优先呈现有影响力的工作
7. **使用 parallel-cli extract**：从搜索中发现的有潜力 URL 获取完整内容，在全文筛选前验证相关性

### 筛选与选择
1. **使用多个数据库**（至少 3 个）：确保全面覆盖
2. **纳入预印本服务器**：捕捉最新的未发表研究结果
3. **记录所有内容**：为确保可复现性，记录搜索字符串、日期和结果数量
4. **测试并优化**：运行试验性搜索，审查结果，调整搜索词

### 筛选与选择
1. **使用明确的标准**：在筛选前记录纳入/排除标准
2. **系统地筛选**：标题 → 摘要 → 全文
3. **记录排除项**：记录排除研究的原因
4. **考虑双人筛选**：对于系统综述，让两名审阅者独立进行筛选

### 综合
1. **按主题组织**：按主题分组，而**非**按单项研究分组
2. **跨研究进行综合**：比较、对照并识别模式
3. **保持批判性**：评估证据的质量和一致性
4. **识别空白**：指出缺失或研究不足的内容

### 质量与可复现性
1. **评估研究质量**：使用适当的质量评估工具
2. **验证所有引用**：运行 verify_citations.py 脚本
3. **记录方法学**：提供足够的细节，以便他人复现
4. **遵循指南**：系统综述使用 PRISMA

### 写作
1. **保持客观**：公平呈现证据，承认局限性
2. **保持系统性**：遵循结构化模板
3. **具体明确**：在可用时纳入数字、统计数据和效应量
4. **清晰明了**：使用清晰的标题、合乎逻辑的行文流程和主题化组织

## 应避免的常见误区

1. **仅搜索单一数据库**：会遗漏相关论文；始终搜索多个数据库
2. **没有搜索记录**：使综述无法复现；记录所有搜索
3. **逐项研究总结**：缺乏综合；应改为按主题组织
4. **未经验证的引用**：会导致错误；始终运行 verify_citations.py
5. **搜索范围过宽**：会产生数千条不相关结果；用具体术语优化
6. **搜索范围过窄**：会遗漏相关论文；纳入同义词和相关术语
7. **忽略预印本**：会遗漏最新发现；纳入 bioRxiv、medRxiv、arXiv
8. **未进行质量评估**：将所有证据一视同仁；应评估并报告质量
9. **发表偏倚**：只有阳性结果得到发表；注明潜在偏倚
10. **搜索已过时**：领域发展迅速；明确说明搜索日期

## 与其他技能的集成

此技能可与其他科学技能无缝协作：

### Web 搜索与提取（parallel-web 技能 — 主要）
- **parallel-cli search**：支持域名过滤的广泛学术和通用 Web 搜索 — 用于初始范围界定、查找论文、引文追溯及补充搜索
- **parallel-cli extract**：从论文 URL、期刊网站和预印本服务器获取完整内容 — 用于阅读摘要、提取参考文献列表及验证论文详情
- **parallel-cli search --include-domains**：跨学术领域（arxiv.org、pubmed、nature.com 等）的学术重点搜索

### 数据库访问技能
- **gget**：PubMed、bioRxiv、COSMIC、AlphaFold、Ensembl、UniProt
- **bioservices**：ChEMBL、KEGG、Reactome、UniProt、PubChem
- **datacommons-client**：人口统计、经济、健康统计数据

### 分析技能
- **pydeseq2**：RNA-seq 差异表达分析（用于方法部分）
- **scanpy**：单细胞分析（用于方法部分）
- **anndata**：单细胞数据（用于方法部分）
- **biopython**：序列分析（用于背景部分）

### 可视化技能
- **matplotlib**：为综述生成图表和绘图
- **seaborn**：统计可视化

### 写作技能
- **brand-guidelines**：将机构品牌规范应用于 PDF
- **internal-comms**：针对不同受众调整综述
- **venue-templates**：在准备发表综述时，获取特定期刊的写作风格指南

### 特定期刊写作风格

为特定期刊准备文献综述时，请查阅 **venue-templates** 技能以获取写作风格指导：
- `venue_writing_styles.md`：各期刊的总体风格比较
- `nature_science_style.md`：Nature/Science 连贯的摘要风格、故事驱动的结构
- `cell_press_style.md`：Cell Press 图文摘要、Highlights 格式
- `medical_journal_styles.md`：NEJM/Lancet/JAMA 结构化摘要、PRISMA 合规性

这些指南有助于调整综述的语气、摘要格式和结构，以符合目标期刊的预期。

## 资源

### 随附资源

**脚本：**
- `scripts/verify_citations.py`：验证 DOI 并生成格式化引文
- `scripts/generate_pdf.py`：将 markdown 转换为专业 PDF
- `scripts/search_databases.py`：处理、去重并格式化搜索结果

**参考资料：**
- `references/citation_styles.md`：详细的引文格式指南（APA、Nature、Vancouver、Chicago、IEEE）
- `references/database_strategies.md`：全面的数据库搜索策略

**资源文件：**
- `assets/review_template.md`：包含所有部分的完整文献综述模板

### 外部资源

**指南：**
- PRISMA（系统综述）：http://www.prisma-statement.org/
- Cochrane Handbook：https://training.cochrane.org/handbook
- AMSTAR 2（综述质量）：https://amstar.ca/

**工具：**
- MeSH Browser：https://meshb.nlm.nih.gov/search
- PubMed Advanced Search：https://pubmed.ncbi.nlm.nih.gov/advanced/
- Boolean Search Guide：https://www.ncbi.nlm.nih.gov/books/NBK3827/

**引用格式：**
- APA 格式：https://apastyle.apa.org/
- Nature Portfolio：https://www.nature.com/nature-portfolio/editorial-policies/reporting-standards
- NLM/Vancouver：https://www.nlm.nih.gov/bsd/uniform_requirements.html

## 依赖项

### 必需的 CLI 工具
```bash
# parallel-cli (PRIMARY — for web search and URL extraction)
curl -fsSL https://parallel.ai/install.sh | bash
# Or: uv tool install "parallel-web-tools[cli]"
# Authenticate: parallel-cli auth
```

### 必需的 Python 软件包
```bash
pip install requests  # For citation verification
```

### 必需的系统工具
```bash
# For PDF generation
brew install pandoc  # macOS
apt-get install pandoc  # Linux

# For LaTeX (PDF generation)
brew install --cask mactex  # macOS
apt-get install texlive-xetex  # Linux
```

检查依赖项：
```bash
python scripts/generate_pdf.py --check-deps
```

## 概述

这项文献综述技能提供：

1. 遵循学术最佳实践的**系统化方法**
2. 通过 `parallel-cli search` 实现的 **Parallel-web 驱动搜索**，可借助学术领域过滤快速、广泛地发现学术文献
3. 通过现有科学技能（gget、bioservices、datacommons-client）实现的**多数据库集成**
4. 确保准确性和可信度的**引文验证**
5. 以 Markdown 和 PDF 格式提供的**专业输出**
6. 覆盖完整综述流程的**全面指导**
7. 配备验证与校验工具的**质量保证**
8. 通过详细文档要求实现的**可复现性**

开展符合学术标准的深入、严谨文献综述，并对任意领域的当前知识提供全面综合。