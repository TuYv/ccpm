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

遵循严谨的学术方法开展系统、全面的文献综述。检索多个文献数据库，以主题方式综合研究结果，核验所有引文的准确性，并以 markdown 和 PDF 格式生成专业的输出文档。

此技能使用 **parallel-web skill**（`parallel-cli search`）作为广泛学术文献发现的主要网络搜索工具，同时辅以专用数据库访问技能（gget、bioservices、datacommons-client）。它提供用于引文核验、结果汇总和文档生成的专用工具。

## 何时使用此技能

在以下情况下使用此技能：
- 为研究或发表开展系统性文献综述
- 综合多个来源中关于特定主题的当前知识
- 开展荟萃分析或范围综述
- 撰写研究论文或学位论文中的文献综述部分
- 调查某一研究领域的最新进展
- 识别研究空白和未来方向
- 需要经过核验的引文和专业格式

## 使用科学示意图进行视觉增强

**⚠️ 强制要求：每篇文献综述必须使用 scientific-schematics skill 至少包含 1-2 个 AI 生成的图表。**

这不是可选项。没有视觉元素的文献综述是不完整的。在完成任何文档之前：
1. 至少生成 ONE 个示意图或图表（例如系统综述的 PRISMA 流程图）
2. 对于综合性综述，建议生成 2-3 个图表（搜索策略流程图、主题综合图、概念框架图）

**如何生成图表：**
- 使用 **scientific-schematics** skill 生成 AI 驱动的出版级图表
- 只需用自然语言描述所需的图表
- Nano Banana Pro 将自动生成、审核并优化示意图

**如何生成示意图：**
```bash
python scripts/generate_schematic.py "your diagram description" -o figures/output.png
```

AI 将自动：
- 创建具有适当格式的出版级图像
- 通过多轮迭代进行审核和优化
- 确保可访问性（考虑色盲友好性和高对比度）
- 将输出保存到 figures/ 目录中

**何时添加示意图：**
- 系统综述的 PRISMA 流程图
- 文献检索策略流程图
- 主题综合图
- 研究空白可视化地图
- 引文网络图
- 概念框架图示
- 任何适合通过可视化呈现的复杂概念

有关创建示意图的详细指导，请参阅 scientific-schematics 技能文档。

---

## 核心工作流程

文献综述分为七个阶段，完整记录了相关命令和模板，详见 [references/core_workflow.md](references/core_workflow.md)：

1. **规划与范围界定** — 确定问题、纳入和排除标准以及研究范围。
2. **系统性文献检索** — 在多个数据库中进行检索，并记录检索式。
3. **筛选与选择** — 先进行标题/摘要筛选，再进行全文筛选，同时保留计数信息
   以生成 PRISMA 流程图。
4. **数据提取与质量评估** — 进行结构化数据提取，并开展偏倚风险评估
   或质量评价。
5. **综合与分析** — 对各项研究进行主题或定量综合。
6. **引文核验** — 根据实际来源核查每一条引文。
7. **文档生成** — 整合综述并附上完整的参考文献表。

记录每个搜索字符串和日期：无法复现自身搜索过程的综述不具备系统性。[references/search_and_citation.md](references/search_and_citation.md) 中提供了按数据库划分的搜索指南和引用格式，[references/example_workflow.md](references/example_workflow.md) 中提供了完整的综述示例流程。

## 最佳实践

### 搜索策略
1. **从 parallel-web 开始**：使用带有学术域名的 `parallel-cli search`，在查询专业数据库之前进行初步的广泛检索
2. **使用多个数据库**（至少 3 个）：确保覆盖全面——parallel-web 计为一个来源
3. **纳入预印本服务器**：捕捉最新的未发表研究成果
4. **记录所有内容**：记录搜索字符串、日期和结果数量，以确保可复现——将所有 `parallel-cli` 输出保存到 `sources/`
5. **测试并优化**：运行试检索，查看结果，调整搜索词
6. **按引用次数排序**：如果可用，按引用次数对搜索结果排序，以优先发现有影响力的研究
7. **使用 `parallel-cli extract`**：从搜索过程中发现的有潜力的 URL 获取完整内容，以便在进行全文筛选前验证其相关性

### 筛选与选择
1. **使用多个数据库**（至少 3 个）：确保覆盖全面
2. **纳入预印本服务器**：捕捉最新的未发表研究成果
3. **记录所有内容**：记录搜索字符串、日期和结果数量，以确保可复现
4. **测试并优化**：运行试检索，查看结果，调整搜索词

### 筛选与选择
1. **使用明确的标准**：在筛选前记录纳入和排除标准
2. **系统地进行筛选**：标题 → 摘要 → 全文
3. **记录排除情况**：记录排除研究的原因
4. **考虑双人筛选**：对于系统综述，由两名审阅者独立进行筛选

### 综合
1. **按主题组织**：按主题分组，而不是按单篇研究分组
2. **跨研究进行综合**：进行比较、对照并识别模式
3. **保持批判性**：评估证据的质量和一致性
4. **识别空白**：指出缺失或研究不足的部分

### 质量与可复现性
1. **评估研究质量**：使用适当的质量评估工具
2. **核验所有引用**：运行 verify_citations.py 脚本
3. **记录方法学**：提供足够的细节，使他人能够复现
4. **遵循指南**：系统综述使用 PRISMA

### 写作
1. **保持客观**：公平地呈现证据，承认局限性
2. **保持系统性**：遵循结构化模板
3. **具体明确**：在可用的情况下，纳入数值、统计数据和效应量
4. **清晰明了**：使用清晰的标题、合理的行文逻辑和主题化组织

## 需要避免的常见陷阱

1. **仅搜索单个数据库**：会遗漏相关论文；务必搜索多个数据库
2. **不记录搜索过程**：会使综述无法复现；记录所有搜索
3. **逐篇研究进行总结**：缺乏综合性；应改为按主题组织
4. **未核验的引用**：会导致错误；务必运行 verify_citations.py
5. **搜索范围过宽**：会产生数千条不相关结果；使用具体术语进行优化
6. **搜索范围过窄**：会遗漏相关论文；纳入同义词和相关术语
7. **忽略预印本**：会遗漏最新发现；纳入 bioRxiv、medRxiv、arXiv
8. **不进行质量评估**：会将所有证据一视同仁；应评估并报告质量
9. **发表偏倚**：只有阳性结果会被发表；指出潜在偏倚
10. **搜索内容过时**：该领域发展迅速；明确说明搜索日期

## 与其他技能的集成

此技能可与其他科学技能无缝协作：

### Web Search & Extraction (parallel-web skill — PRIMARY)
- **parallel-cli search**：通过域名过滤进行广泛的学术和一般网络搜索——用于初步确定范围、查找论文、进行引文追踪和补充搜索
- **parallel-cli extract**：从论文 URL、期刊网站和预印本服务器获取完整内容——用于阅读摘要、提取参考文献列表和核实论文详细信息
- **parallel-cli search --include-domains**：跨学术域名（arxiv.org、pubmed、nature.com 等）进行面向学术的搜索

### 数据库访问技能
- **gget**：PubMed、bioRxiv、COSMIC、AlphaFold、Ensembl、UniProt
- **bioservices**：ChEMBL、KEGG、Reactome、UniProt、PubChem
- **datacommons-client**：人口统计、经济和健康统计数据

### 分析技能
- **pydeseq2**：RNA-seq 差异表达分析（用于方法部分）
- **scanpy**：单细胞分析（用于方法部分）
- **anndata**：单细胞数据（用于方法部分）
- **biopython**：序列分析（用于背景部分）

### 可视化技能
- **matplotlib**：生成综述所需的图表和绘图
- **seaborn**：统计可视化

### 写作技能
- **brand-guidelines**：将机构品牌规范应用于 PDF
- **internal-comms**：针对不同受众调整综述内容
- **venue-templates**：准备发表综述时，获取特定期刊的写作风格指南

### 特定期刊的写作风格

为特定期刊准备文献综述时，请查阅 **venue-templates** 技能以获取写作风格指导：
- `venue_writing_styles.md`：各期刊风格的总体比较
- `nature_science_style.md`：Nature/Science 流畅的摘要风格、以故事为驱动的结构
- `cell_press_style.md`：Cell Press 图形摘要、Highlights 格式
- `medical_journal_styles.md`：NEJM/Lancet/JAMA 结构化摘要、PRISMA 合规要求

这些指南有助于调整综述的语气、摘要格式和结构，使其符合目标期刊的预期。

## 资源

### 随附资源

**脚本：**
- `scripts/verify_citations.py`：验证 DOI 并生成格式化引文
- `scripts/generate_pdf.py`：将 markdown 转换为专业 PDF
- `scripts/search_databases.py`：处理、去重和格式化搜索结果

**参考资料：**
- `references/citation_styles.md`：详细的引文格式指南（APA、Nature、Vancouver、Chicago、IEEE）
- `references/database_strategies.md`：全面的数据库搜索策略

**资源文件：**
- `assets/review_template.md`：包含所有章节的完整文献综述模板

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
- APA 格式: https://apastyle.apa.org/
- Nature Portfolio: https://www.nature.com/nature-portfolio/editorial-policies/reporting-standards
- NLM/Vancouver: https://www.nlm.nih.gov/bsd/uniform_requirements.html

## 依赖项

### 必需的 CLI 工具
```bash
# parallel-cli（主要工具 — 用于网页搜索和 URL 提取）
curl -fsSL https://parallel.ai/install.sh | bash
# 或：uv tool install "parallel-web-tools[cli]"
# 身份验证：parallel-cli auth
```

### 必需的 Python 软件包
```bash
pip install requests  # 用于引用验证
```

### 必需的系统工具
```bash
# 用于生成 PDF
brew install pandoc  # macOS
apt-get install pandoc  # Linux

# 用于 LaTeX（PDF 生成）
brew install --cask mactex  # macOS
apt-get install texlive-xetex  # Linux
```

检查依赖项：
```bash
python scripts/generate_pdf.py --check-deps
```

## 总结

此文献综述 skill 提供：

1. **遵循学术最佳实践的系统化方法**
2. **由 Parallel Web 驱动的搜索**，使用 `parallel-cli search` 快速、广泛地发现学术文献，并支持学术域名筛选
3. **多数据库集成**，通过现有的科学技能（gget、bioservices、datacommons-client）实现
4. **引用验证**，确保准确性与可信度
5. **专业输出**，支持 markdown 和 PDF 格式
6. **全面指导**，涵盖完整的综述流程
7. **质量保证**，提供验证和确认工具
8. **可复现性**，通过详细的文档要求实现

开展全面、严谨且符合学术标准的文献综述，并对任何领域的当前知识进行综合分析。