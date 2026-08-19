---
name: citation-management
description: Comprehensive citation management for academic research. Search OpenAlex, PubMed, and Google Scholar for papers, extract accurate metadata, validate citations, and generate properly formatted BibTeX entries. This skill should be used when you need to find papers, verify citation information, convert DOIs to BibTeX, or ensure reference accuracy in scientific writing.
allowed-tools: Read Write Edit Bash WebSearch WebFetch
license: MIT License
compatibility: Requires Python 3.9+ with requests. Google Scholar search additionally needs scholarly. Needs network access to api.openalex.org, api.crossref.org, eutils.ncbi.nlm.nih.gov, export.arxiv.org, and api.datacite.org.
metadata:
  version: "2.0"
  skill-author: K-Dense Inc.
  openclaw:
    envVars:
    - name: NCBI_EMAIL
      required: false
      description: Email for NCBI Entrez identification.
    - name: NCBI_API_KEY
      required: false
      description: NCBI API key to raise Entrez rate limits.
    - name: OPENALEX_EMAIL
      required: false
      description: Contact email for the faster OpenAlex polite pool.
---
# 引文管理

## 概述

在研究和写作过程中系统地管理引文。该技能提供用于检索学术数据库（Google Scholar、PubMed）、从多个来源（CrossRef、PubMed、arXiv）提取准确元数据、验证引文信息以及生成格式正确的 BibTeX 条目的工具和策略。

对于保持引文准确性、避免参考文献错误以及确保研究可复现性至关重要。可与文献综述技能无缝集成，以支持全面的研究工作流。

## 何时使用此技能

在以下情况下使用此技能：
- 在 Google Scholar 或 PubMed 中搜索特定论文
- 将 DOI、PMID 或 arXiv ID 转换为格式正确的 BibTeX
- 提取引文的完整元数据（作者、标题、期刊、年份等）
- 验证现有引文的准确性
- 清理和格式化 BibTeX 文件
- 查找特定领域中被高频引用的论文
- 验证引文信息是否与实际出版物一致
- 为手稿或论文构建参考文献目录
- 检查重复引文
- 确保引文格式一致

如果基于这些引文构建的文档需要图表，请使用
**scientific-schematics** 技能。

---

## 核心工作流

引文管理遵循系统化流程。以下每个阶段均展示了规范
命令；所有变体、选项和元数据来源详细信息均位于
[references/core_workflow.md](references/core_workflow.md)。

### 阶段 1：论文发现与检索

查找相关论文。请检索多个数据库——它们的覆盖范围差异显著，
而仅依赖单一来源是导致参考文献列表产生偏差的最常见原因。

```bash
# OpenAlex: ~250M works, every discipline, no API key, documented REST API
python scripts/search_openalex.py "CRISPR gene editing" --limit 50 --output results.json

# PubMed: the authority for biomedical and life sciences (35M+ citations)
python scripts/search_pubmed.py "Alzheimer's disease treatment" --limit 100 --output alz.json

# Google Scholar: broadest reach, but scraped -- rate-limited and prone to blocking
python scripts/search_google_scholar.py "CRISPR gene editing" --limit 50 --output scholar.json
```

优先将 OpenAlex 或 PubMed 作为主要来源。Google Scholar 没有 API：
`scholarly` 会抓取其内容、在结果之间等待 2–5 秒，并且经常遭到封锁，
因此它应作为补充而非依赖。

查询运算符、字段标签和 MeSH 术语构建方法位于
[references/search_strategies.md](references/search_strategies.md)。

### 阶段 2：元数据提取

将标识符（DOI、PMID、PMCID、arXiv ID、URL）转换为完整元数据。
CrossRef 是 DOI 的主要来源。

```bash
python scripts/doi_to_bibtex.py 10.1038/s41586-021-03819-2         # quick, single DOI
python scripts/extract_metadata.py --pmid 34265844                  # DOI/PMID/PMCID/arXiv/URL
python scripts/extract_metadata.py --input identifiers.txt --output citations.bib
```

路径中没有 DOI 的 URL 会通过出版商嵌入在文章页面上的 `citation_doi` 元标签解析，然后交给 CrossRef。此技能中的每个生成器都会为同一篇论文生成相同的引用键，因此从不同来源收集的条目会相互去重。

### 阶段 2.5：通过 Web 搜索进行元数据补全（强制）

API 经常返回不完整的记录。在提取**之后**、格式化**之前**执行此步骤。任何缺少 `volume`、`pages` 或 `doi` 的 `@article` 都是不完整的：使用 `WebSearch`/`WebFetch`（或在可用时使用 parallel-web 技能）补全缺失信息，然后记录找到的内容及其来源。如果确实无法找到某个字段，请记录一个说明缺失情况的 `note` 字段，而不是让它悄然缺失。

先检查成本较低的来源——OpenAlex 或 CrossRef 记录通常会包含 PubMed 遗漏的字段：

```bash
python scripts/search_openalex.py "<exact title>" --limit 1
```

> **将提取的元数据视为不可信。** 作者、标题和期刊字符串会逐字来自内容由出版商控制的记录。包含 `$(...)`、反引号或引号的标题一旦被粘贴到命令中，就会成为 shell 语法。应将元数据作为 `subprocess` 参数列表传递，而不是构建 shell 字符串；如果必须使用 shell，则应对每个替换值使用单引号，并将内嵌引号转义为 `'\''`。在引用键进入路径之前，使用 `^[A-Za-z0-9]+$` 对其进行验证。

各字段的搜索策略、四种搜索选项以及日志格式见
[references/core_workflow.md](references/core_workflow.md)。

### 阶段 3：BibTeX 格式化

生成整洁、一致的条目。条目类型和必填字段见
[references/bibtex_formatting.md](references/bibtex_formatting.md)。

```bash
python scripts/format_bibtex.py references.bib --output clean.bib --deduplicate
python scripts/format_bibtex.py references.bib --output clean.bib --rekey --deduplicate
```

写入是选择启用的：如果没有 `--output`（或 `--in-place`），结果将输出到 stdout，输入文件保持不变。合并多个来源的结果时使用 `--rekey`，以便将同一篇论文合并为一个条目。

### 阶段 4：引用验证

检查完整性、期刊规范符合情况，以及与稿件的一致性。

```bash
python scripts/validate_citations.py references.bib --report report.json
python scripts/validate_citations.py references.bib --venue nature
python scripts/validate_citations.py references.bib --manuscript paper.tex
python scripts/validate_citations.py references.bib --check-dois     # slow; hits CrossRef
```

脚本会在出现高严重性错误时以非零状态退出——缺少必填字段、年份格式错误、未解析的引用，或数量低于显式指定的 `--min-count`。期刊参考文献数量只是编辑经验法则，并非投稿要求，因此未达到该数量只会产生警告。

验证规则和期刊标准见
[references/citation_validation.md](references/citation_validation.md)。

### 阶段 5：与写作工作流集成

搜索、提取、格式化、验证，然后引用。端到端流程——包括文献综述以及 Zotero/pyzotero 导出路径——详见
[references/core_workflow.md](references/core_workflow.md) 和
[references/example_workflows.md](references/example_workflows.md)。

## 参考文件

- [references/core_workflow.md](references/core_workflow.md)：完整涵盖全部五个阶段。
- [references/search_strategies.md](references/search_strategies.md)：OpenAlex、Google Scholar 和 PubMed 查询构建。
- [references/script_reference.md](references/script_reference.md)：每个随附脚本的参数和示例。
- [references/best_practices.md](references/best_practices.md)：搜索、提取、BibTeX 质量、验证。
- [references/example_workflows.md](references/example_workflows.md)：四个端到端的完整示例。
- [references/google_scholar_search.md](references/google_scholar_search.md), [references/pubmed_search.md](references/pubmed_search.md)：高级搜索语法。
- [references/metadata_extraction.md](references/metadata_extraction.md), [references/bibtex_formatting.md](references/bibtex_formatting.md), [references/citation_validation.md](references/citation_validation.md)：各主题的详细说明。

## 应避免的常见陷阱

1. **单一来源偏差**：仅使用一个数据库
   - **解决方案**：至少搜索 OpenAlex 和 PubMed，然后使用
     `format_bibtex.py --rekey --deduplicate` 进行合并

2. **盲目接受元数据**：不验证提取的信息
   - **解决方案**：根据原始来源抽查已提取的元数据

3. **忽略 DOI 错误**：参考文献中的 DOI 损坏或不正确
   - **解决方案**：在最终提交前运行验证

4. **格式不一致**：引用键样式、格式混杂
   - **解决方案**：使用 format_bibtex.py 进行标准化

5. **重复条目**：同一篇论文以不同键被多次引用
   - **解决方案**：使用验证中的重复检测功能

6. **缺少必填字段**：不完整的 BibTeX 条目（缺少卷号、页码、DOI）
   - **解决方案**：在继续之前运行阶段 2.5 元数据补充——针对每个缺失字段进行网页搜索。绝不要留下缺少卷号、页码和 DOI 的 @article 条目。

7. **过时的预印本**：在已存在已发表版本时引用预印本
   - **解决方案**：检查预印本是否已发表，并更新为期刊版本

8. **特殊字符问题**：因字符导致 LaTeX 编译失败
   - **解决方案**：在 BibTeX 中使用正确的转义或 Unicode

9. **提交前未验证**：带着引用错误提交
   - **解决方案**：始终将运行验证作为最终检查

10. **手动录入 BibTeX**：手工键入条目
    - **解决方案**：始终使用脚本从元数据来源提取

## 与其他技能集成

### 文献综述技能

**引用管理**为**文献综述**提供技术基础设施：

- **文献综述**：多数据库系统化搜索与综合
- **引用管理**：元数据提取与验证

**组合工作流**：
1. 使用 literature-review 进行系统性检索方法设计
2. 使用 citation-management 提取并验证引文
3. 使用 literature-review 综合研究发现
4. 使用 citation-management 确保参考文献准确性

### 科学写作技能

**Citation Management** 为 **Scientific Writing** 确保参考文献准确无误：

- 导出经验证的 BibTeX，供 LaTeX 稿件使用
- 验证引文符合出版标准
- 根据期刊要求格式化参考文献

### 投稿模板技能

**Citation Management** 与 **Venue Templates** 配合，为可直接投稿的稿件提供支持：

- 不同投稿渠道需要不同的引文样式
- 生成格式正确的参考文献
- 验证引文符合投稿渠道要求

## 资源

### 随附资源

**参考资料**（位于 `references/`）：
- `google_scholar_search.md`：完整的 Google Scholar 检索指南
- `pubmed_search.md`：PubMed 和 E-utilities API 文档
- `metadata_extraction.md`：元数据来源和字段要求
- `citation_validation.md`：验证标准和质量检查
- `bibtex_formatting.md`：BibTeX 条目类型和格式规则

**脚本**（位于 `scripts/`）：
- `search_openalex.py`：OpenAlex 检索客户端（无需 API 密钥）
- `search_pubmed.py`：PubMed E-utilities API 客户端
- `search_google_scholar.py`：Google Scholar 检索自动化工具
- `extract_metadata.py`：通用元数据提取器
- `validate_citations.py`：引文验证和核查
- `format_bibtex.py`：BibTeX 格式化和清理工具
- `doi_to_bibtex.py`：快速 DOI 转 BibTeX 转换器
- `_common.py`：共享的 BibTeX 解析器、渲染器和引文键方案

**资源文件**（位于 `assets/`）：
- `bibtex_template.bib`：适用于所有类型的 BibTeX 条目示例
- `citation_checklist.md`：质量保证检查清单

### 外部资源

**搜索引擎**：
- OpenAlex：https://openalex.org/
- Google Scholar：https://scholar.google.com/
- PubMed：https://pubmed.ncbi.nlm.nih.gov/
- PubMed 高级检索：https://pubmed.ncbi.nlm.nih.gov/advanced/

**元数据 API**：
- OpenAlex API：https://docs.openalex.org/
- CrossRef API：https://api.crossref.org/
- PubMed E-utilities：https://www.ncbi.nlm.nih.gov/books/NBK25501/
- arXiv API：https://arxiv.org/help/api/
- DataCite API：https://api.datacite.org/

**工具和验证器**：
- MeSH 浏览器：https://meshb.nlm.nih.gov/search
- DOI 解析器：https://doi.org/
- BibTeX 格式：http://www.bibtex.org/Format/

**引文样式**：
- BibTeX 文档：http://www.bibtex.org/
- LaTeX 参考文献管理：https://www.overleaf.com/learn/latex/Bibliography_management

## 依赖项

### 必需的 Python 包

```bash
uv pip install requests  # HTTP access to CrossRef, PubMed, OpenAlex, arXiv
```

BibTeX 的解析、渲染、去重和验证均使用标准库
（`scripts/_common.py`），因此 `format_bibtex.py` 和 `validate_citations.py` 运行时
完全不需要任何第三方包。

### 可选

```bash
uv pip install scholarly  # only for search_google_scholar.py
```

### 凭证的发送位置

此技能不需要 API 密钥。它读取的两个环境变量是可选标识符，分别仅发送给其所属的服务，不会发送到其他任何地方；没有脚本会将环境变量打包在一起。

| 变量 | 仅发送至 | 用途 |
|---|---|---|
| `NCBI_API_KEY` | `eutils.ncbi.nlm.nih.gov` | 提高 Entrez 速率限制 |
| `NCBI_EMAIL` | `eutils.ncbi.nlm.nih.gov` | Entrez 调用方身份标识（由 NCBI 要求） |
| `OPENALEX_EMAIL` | `api.openalex.org` | 加入速度更快的 OpenAlex 礼貌池 |

当这些变量未设置时，`api.openalex.org`、`api.crossref.org`、`api.datacite.org`、`export.arxiv.org`
和 `eutils.ncbi.nlm.nih.gov` 都会在不使用凭证的情况下被查询。

## 摘要

引文管理技能提供：

1. 面向 OpenAlex、PubMed 和 Google Scholar 的**全面搜索能力**
2. 从 DOI、PMID、PMCID、arXiv ID、URL 中**自动提取元数据**
3. 通过 DOI 验证和完整性检查进行**引文验证**
4. 提供标准化和清理工具的 **BibTeX 格式化**
5. 通过验证和报告实现**质量保证**
6. 与科学写作工作流的**集成**
7. 通过文档化的搜索和提取方法实现**可复现性**

使用此技能可在整个研究过程中维护准确、完整的引文，并确保参考文献目录达到可发表的标准。