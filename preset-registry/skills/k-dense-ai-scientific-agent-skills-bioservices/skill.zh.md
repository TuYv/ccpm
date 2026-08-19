---
name: bioservices
description: Unified Python interface to 40+ bioinformatics services. Use when querying multiple databases (UniProt, KEGG, ChEMBL, Reactome) in a single workflow with consistent API. Best for cross-database analysis, ID mapping across services. For quick single-database lookups use gget; for sequence/file manipulation use biopython.
license: GPLv3 license
allowed-tools: Read Write Edit Bash
compatibility: Requires Python 3.9–3.12 and internet access to 40+ bioinformatics web APIs. NCBI BLAST requires a contact email (`NCBI_EMAIL` env var or explicit parameter).
metadata:
  version: "1.3"
  skill-author: K-Dense Inc.
  openclaw:
    envVars:
    - name: NCBI_EMAIL
      required: false
      description: Email for NCBI service identification.
---
# BioServices

## 概述

BioServices 是一个 Python 软件包，可通过编程方式访问约 40 个生物信息学 Web 服务和数据库。在 Python 工作流中检索生物数据、执行跨数据库查询、映射标识符、分析序列，以及集成多个生物资源。该软件包可透明地处理 REST 和 SOAP/WSDL 协议。

**版本说明：** 示例针对 **bioservices 1.16.0**（PyPI，2026 年 3 月）。需要 **Python 3.9–3.12**。2022 年年中 UniProt REST 的变更（bioservices ≥1.10）主要影响表格中的 `columns` 名称——如果解析出现问题，请参阅上游的 `_legacy_names`。ChEMBL 封装器在 1.6.0（2018 API）时发生了变化；请使用 `get_similarity`、`get_substructure`、`get_molecule`，而不要使用 1.6 之前的方法名。

## 何时使用此技能

在以下情况下应使用此技能：
- 从 UniProt、PDB、Pfam 检索蛋白质序列、注释或结构
- 通过 KEGG 或 Reactome 分析代谢通路和基因功能
- 在 ChEBI、ChEMBL、PubChem 中搜索化合物数据库以获取化学信息
- 在不同生物数据库之间转换标识符（KEGG↔UniProt、化合物 ID）
- 运行序列相似性搜索（BLAST、MUSCLE 比对）
- 查询基因本体术语（QuickGO、GO 注释）
- 访问蛋白质-蛋白质相互作用数据（PSICQUIC、IntactComplex）
- 挖掘基因组数据（BioMart、ArrayExpress、ENA）
- 在单个工作流中集成来自多个生物信息学资源的数据

## 核心能力

### 1. 蛋白质分析

检索蛋白质信息、序列和功能注释：

```python
from bioservices import UniProt

u = UniProt(verbose=False)

# Search for protein by name
results = u.search("ZAP70_HUMAN", frmt="tab", columns="id,genes,organism")

# Retrieve FASTA sequence
sequence = u.retrieve("P43403", "fasta")

# Map identifiers between databases
kegg_ids = u.mapping(fr="UniProtKB_AC-ID", to="KEGG", query="P43403")
```

**主要方法：**
- `search()`：使用灵活的搜索词查询 UniProt
- `retrieve()`：以各种格式（FASTA、XML、tab）获取蛋白质条目
- `mapping()`：在不同数据库之间转换标识符

完整的 UniProt API 详细信息请参阅 `references/services_reference.md`。

### 2. 通路发现与分析

访问基因和生物体的 KEGG 通路信息：

```python
from bioservices import KEGG

k = KEGG()
k.organism = "hsa"  # Set to human

# Search for organisms
k.lookfor_organism("droso")  # Find Drosophila species

# Find pathways by name
k.lookfor_pathway("B cell")  # Returns matching pathway IDs

# Get pathways containing specific genes
pathways = k.get_pathway_by_gene("7535", "hsa")  # ZAP70 gene

# Retrieve and parse pathway data
data = k.get("hsa04660")
parsed = k.parse(data)

# Extract pathway interactions
interactions = k.parse_kgml_pathway("hsa04660")
relations = interactions['relations']  # Protein-protein interactions

# Convert to Simple Interaction Format
sif_data = k.pathway2sif("hsa04660")
```

**主要方法：**
- `lookfor_organism()`、`lookfor_pathway()`：按名称搜索
- `get_pathway_by_gene()`：查找包含指定基因的通路
- `parse_kgml_pathway()`：提取结构化通路数据
- `pathway2sif()`：获取蛋白质相互作用网络

参考：`references/workflow_patterns.md`，获取完整的通路分析工作流。

### 3. 化合物数据库搜索

跨多个数据库搜索和交叉引用化合物：

```python
from bioservices import KEGG, UniChem

k = KEGG()

# Search compounds by name
results = k.find("compound", "Geldanamycin")  # Returns cpd:C11222

# Get compound information with database links
compound_info = k.get("cpd:C11222")  # Includes ChEBI links

# Cross-reference KEGG → ChEMBL using UniChem
u = UniChem()
chembl_id = u.get_compound_id_from_kegg("C11222")  # Returns CHEMBL278315
```

**版本注意事项：** 每个来源对应的 `get_compound_id_from_*` 辅助方法已在
bioservices 1.16.0 中移除——请先检查 `hasattr(u, "get_compound_id_from_kegg")`，并在
否则的情况下使用当前的 UniChem API（`u.get_compounds(compound, source_type)`
并读取 `res["compounds"][0]["sources"]`）。ChEMBL 查询同样遵循此规则：
使用 `get_molecule`，而非 1.6 之前版本中的 `get_compound_by_chemblId`。

**常见工作流：**
1. 在 KEGG 中按名称搜索化合物
2. 提取 KEGG 化合物 ID
3. 使用 UniChem 进行 KEGG → ChEMBL 映射
4. KEGG 条目通常会提供 ChEBI ID

参考：`references/identifier_mapping.md`，获取完整的跨数据库映射指南。

### 4. 序列分析

运行 BLAST 搜索和序列比对。NCBI 要求提供联系邮箱——优先使用 `NCBI_EMAIL` 环境变量（与 BioPython Entrez 及其他仓库技能采用相同约定）：

```python
import os
from bioservices import NCBIblast

s = NCBIblast(verbose=False)
email = os.environ["NCBI_EMAIL"]  # set before running: export NCBI_EMAIL=you@lab.org

# Run BLASTP against UniProtKB
jobid = s.run(
    program="blastp",
    sequence=protein_sequence,
    stype="protein",
    database="uniprotkb",
    email=email,
)

# Check job status and retrieve results
s.getStatus(jobid)
results = s.getResult(jobid, "out")
```

**注意：** BLAST 任务是异步的。请在获取结果前检查状态。

### 5. 标识符映射

在不同生物数据库之间转换标识符：

```python
from bioservices import UniProt, KEGG

# UniProt mapping (many database pairs supported)
u = UniProt()
results = u.mapping(
    fr="UniProtKB_AC-ID",  # Source database
    to="KEGG",              # Target database
    query="P43403"          # Identifier(s) to convert
)

# KEGG gene ID → UniProt
kegg_to_uniprot = u.mapping(fr="KEGG", to="UniProtKB_AC-ID", query="hsa:7535")

# For compounds, use UniChem
from bioservices import UniChem
u = UniChem()
chembl_from_kegg = u.get_compound_id_from_kegg("C11222")
```

**支持的映射（UniProt）：**
- UniProtKB ↔ KEGG
- UniProtKB ↔ Ensembl
- UniProtKB ↔ PDB
- UniProtKB ↔ RefSeq
- 以及更多（参见 `references/identifier_mapping.md`）

### 6. Gene Ontology 查询

访问 GO 术语和注释：

```python
from bioservices import QuickGO

g = QuickGO(verbose=False)

# Retrieve GO term information
term_info = g.Term("GO:0003824", frmt="obo")

# Search annotations
annotations = g.Annotation(protein="P43403", format="tsv")
```

### 7. 蛋白质-蛋白质相互作用

通过 PSICQUIC 查询相互作用数据库。**并非每个发行版本都包含 PSICQUIC——1.16.0 中没有它**——因此请以防御性方式导入它，并在其缺失时回退到
`IntactComplex`、`OmniPath` 或 `STRING`：

```python
from bioservices import PSICQUIC

s = PSICQUIC(verbose=False)

# Query specific database (e.g., MINT)
interactions = s.query("mint", "ZAP70 AND species:9606")

# List available interaction databases
databases = s.activeDBs
```

**可用数据库：**MINT、IntAct、BioGRID、DIP 及其他 30 多个数据库。

## 多服务集成工作流

BioServices 擅长结合多个服务进行全面分析。常见的集成模式：

### 完整蛋白质分析管道

执行完整的蛋白质特征分析工作流：

```bash
export NCBI_EMAIL=your.email@example.com
python scripts/protein_analysis_workflow.py ZAP70_HUMAN
# Or pass email as optional second argument if NCBI_EMAIL is unset
python scripts/protein_analysis_workflow.py ZAP70_HUMAN your.email@example.com
```

该脚本演示了：
1. 使用 UniProt 搜索蛋白质条目
2. 获取 FASTA 序列
3. 进行 BLAST 相似性搜索
4. 发现 KEGG 通路
5. 通过 PSICQUIC 绘制相互作用图谱

### 通路网络分析

分析某个生物体的所有通路：

```bash
python scripts/pathway_analysis.py hsa output_directory/
```

提取并分析：
- 该生物体的所有通路 ID
- 每条通路中的蛋白质-蛋白质相互作用
- 相互作用类型分布
- 导出为 CSV/SIF 格式

### 跨数据库化合物搜索

跨数据库映射化合物标识符：

```bash
python scripts/compound_cross_reference.py Geldanamycin
```

获取：
- KEGG 化合物 ID
- ChEBI 标识符
- ChEMBL 标识符
- 基本化合物属性

### 批量标识符转换

一次转换多个标识符：

```bash
python scripts/batch_id_converter.py input_ids.txt --from UniProtKB_AC-ID --to KEGG
```

## 最佳实践

### 输出格式处理

不同服务以多种格式返回数据：
- **XML**：使用 BeautifulSoup 解析（大多数 SOAP 服务）
- **制表符分隔（TSV）**：使用 Pandas DataFrame 处理表格数据
- **字典/JSON**：直接使用 Python 操作
- **FASTA**：集成 BioPython 进行序列分析

### 速率限制与详细程度

控制 API 请求行为：

```python
from bioservices import KEGG

k = KEGG(verbose=False)  # Suppress HTTP request details
k.TIMEOUT = 30  # Adjust timeout for slow connections
```

### 错误处理

将服务调用包装在 try-except 块中：

```python
try:
    results = u.search("ambiguous_query")
    if results:
        # Process results
        pass
except Exception as e:
    print(f"Search failed: {e}")
```

### 生物体代码

使用标准生物体缩写：
- `hsa`：Homo sapiens（人类）
- `mmu`：Mus musculus（小鼠）
- `dme`：Drosophila melanogaster
- `sce`：Saccharomyces cerevisiae（酵母）

列出所有生物体：`k.list("organism")` 或 `k.organismIds`

### 与其他工具集成

BioServices 与以下工具配合良好：
- **BioPython**：对检索到的 FASTA 数据进行序列分析
- **Pandas**：表格数据处理
- **PyMOL**：3D 结构可视化（检索 PDB ID）
- **NetworkX**：通路相互作用的网络分析
- **Galaxy**：用于工作流平台的自定义工具封装

## 资源

### scripts/

演示完整工作流的可执行 Python 脚本：

- `protein_analysis_workflow.py`：端到端蛋白质表征
- `pathway_analysis.py`：KEGG 通路发现和网络提取
- `compound_cross_reference.py`：多数据库化合物搜索
- `batch_id_converter.py`：批量标识符映射工具

可以直接执行这些脚本，也可以根据具体使用场景进行调整。

### references/

按需加载的详细文档：

- `services_reference.md`：全部 40+ 项服务及其方法的完整列表
- `workflow_patterns.md`：详细的多步骤分析工作流
- `identifier_mapping.md`：跨数据库 ID 转换的完整指南

在使用特定服务或执行复杂集成任务时加载参考文档。

## 安装

```bash
uv pip install "bioservices==1.16.0"
```

依赖项会自动安装。上游 CI 测试 Python 3.9–3.12（[PyPI](https://pypi.org/project/bioservices/)、[文档](https://bioservices.readthedocs.io/)）。

## 凭据

大多数服务无需 API 密钥。例外情况如下：

| 服务 | 要求 |
|---------|-------------|
| NCBI BLAST | 通过 `NCBI_EMAIL` 或 `NCBIblast.run()` 中的 `email=` 提供联系邮箱 |
| 部分 EBI 服务 | 可选；如果受到速率限制，请查阅服务文档 |

每个 shell 会话设置一次：

```bash
export NCBI_EMAIL=your.email@example.com
```

请使用真实的机构或实验室地址 — NCBI 可能会就大量 BLAST 使用联系你。

## 其他信息

有关详细的 API 文档和高级功能，请参阅：
- 官方文档：https://bioservices.readthedocs.io/
- 源代码：https://github.com/cokelaer/bioservices
- `references/services_reference.md` 中针对各项服务的参考资料