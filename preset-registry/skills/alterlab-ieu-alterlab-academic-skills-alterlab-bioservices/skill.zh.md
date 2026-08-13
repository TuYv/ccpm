---
name: alterlab-bioservices
description: Query 40+ bioinformatics web services through one consistent Python API with bioservices (UniProt, KEGG, ChEMBL, Reactome, Ensembl, NCBI and more). Use when a workflow must hit multiple databases together, map identifiers across services, or run cross-database analyses — for quick single-database lookups use gget, for sequence and file manipulation use biopython. Part of the AlterLab Academic Skills suite.
license: GPL-3.0
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Self-contained — runs under `uv run python` with the skill's Python package installed; no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# BioServices

## 概述

BioServices 是一个 Python 包，可通过编程方式访问约 40 种生物信息学 Web 服务和数据库。可在 Python 工作流中检索生物数据、执行跨数据库查询、映射标识符、分析序列，以及集成多种生物资源。该包能够透明地处理 REST 和 SOAP/WSDL 协议。

## 何时使用此 Skill

以下情况应使用此 Skill：
- 从 UniProt、PDB、Pfam 检索蛋白质序列、注释或结构
- 通过 KEGG 或 Reactome 分析代谢通路和基因功能
- 在化合物数据库（ChEBI、ChEMBL、PubChem）中搜索化学信息
- 在不同生物数据库之间转换标识符（KEGG↔UniProt、化合物 ID）
- 运行序列相似性搜索（BLAST、MUSCLE 比对）
- 查询基因本体术语（QuickGO、GO 注释）
- 访问蛋白质-蛋白质相互作用数据（PSICQUIC、IntactComplex）
- 挖掘基因组数据（BioMart、ArrayExpress、ENA）
- 在单个工作流中集成来自多个生物信息学资源的数据

## 核心功能

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

**关键方法：**
- `search()`：使用灵活的搜索词查询 UniProt
- `retrieve()`：获取多种格式（FASTA、XML、tab）的蛋白质条目
- `mapping()`：在数据库之间转换标识符

完整的 UniProt API 详情请参阅：`references/services_reference.md`。

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

**关键方法：**
- `lookfor_organism()`、`lookfor_pathway()`：按名称搜索
- `get_pathway_by_gene()`：查找包含基因的通路
- `parse_kgml_pathway()`：提取结构化通路数据
- `pathway2sif()`：获取蛋白质相互作用网络

完整的通路分析工作流请参阅：`references/workflow_patterns.md`。

### 3. 化合物数据库搜索

跨多个数据库搜索和交叉引用化合物：

```python
from bioservices import KEGG

k = KEGG()

# Search compounds by name
results = k.find("compound", "Geldanamycin")  # Returns cpd:C11222

# Get compound information with database links
compound_info = k.get("cpd:C11222")  # Includes ChEBI links

# Cross-reference KEGG compound → ChEBI (KEGG→ChEMBL has no direct API)
mapping = k.conv("chebi", "compound")
mapping["cpd:C11222"]   # -> 'chebi:5292'  (Geldanamycin)
```

**常见工作流程：**
1. 在 KEGG 中按名称搜索化合物
2. 提取 KEGG 化合物 ID
3. 使用 `KEGG.conv` 进行 KEGG → ChEBI 映射（ChEBI ID 也嵌入在 KEGG 条目中）
4. 如果需要 ChEMBL ID，请通过其他途径获取（ChEMBL Web 服务 / `chembl_webresource_client`，或直接使用在线 UniChem REST API）——bioservices 没有用于 KEGG → ChEMBL 的 `UniChem` 便捷方法

完整的跨数据库映射指南请参阅：`references/identifier_mapping.md`。

### 4. 序列分析

运行 BLAST 搜索和序列比对：

```python
from bioservices import NCBIblast

s = NCBIblast(verbose=False)

# Run BLASTP against UniProtKB
jobid = s.run(
    program="blastp",
    sequence=protein_sequence,
    stype="protein",
    database="uniprotkb",
    email="your.email@example.com"  # Required by NCBI
)

# Check job status and retrieve results
s.getStatus(jobid)
results = s.getResult(jobid, "out")
```

**注意：** BLAST 作业是异步执行的。请在检索结果之前检查状态。

### 5. 标识符映射

在不同的生物数据库之间转换标识符：

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

# For compounds, map KEGG → ChEBI via KEGG.conv
# (KEGG → ChEMBL has no direct API; obtain ChEMBL IDs separately
#  via the ChEMBL web service / chembl_webresource_client or the
#  live UniChem REST API directly)
k = KEGG()
kegg_to_chebi = k.conv("chebi", "compound")
chebi_from_kegg = kegg_to_chebi["cpd:C11222"]  # -> 'chebi:5292'
```

**支持的映射（UniProt）：**
- UniProtKB ↔ KEGG
- UniProtKB ↔ Ensembl
- UniProtKB ↔ PDB
- UniProtKB ↔ RefSeq
- 以及更多映射（请参阅 `references/identifier_mapping.md`）

### 6. 基因本体查询

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

通过 PSICQUIC 查询相互作用数据库：

```python
from bioservices import PSICQUIC

s = PSICQUIC(verbose=False)

# Query specific database (e.g., MINT)
interactions = s.query("mint", "ZAP70 AND species:9606")

# List available interaction databases
databases = s.activeDBs
```

**可用数据库：** MINT、IntAct、BioGRID、DIP 以及其他 30 多个数据库。

## 多服务集成工作流

BioServices 擅长组合多个服务以进行综合分析。常见的集成模式包括：

### 完整的蛋白质分析流程

执行完整的蛋白质表征工作流：

```bash
python scripts/protein_analysis_workflow.py ZAP70_HUMAN your.email@example.com
```

此脚本演示了：
1. 在 UniProt 中搜索蛋白质条目
2. 获取 FASTA 序列
3. 执行 BLAST 相似性搜索
4. 发现 KEGG 通路
5. 通过 PSICQUIC 进行相互作用映射

### 通路网络分析

分析某个生物体的所有通路：

```bash
python scripts/pathway_analysis.py hsa output_directory/
```

提取并分析：
- 该生物体的所有通路 ID
- 每条通路中的蛋白质-蛋白质相互作用
- 相互作用类型的分布
- 导出为 CSV/SIF 格式

### 跨数据库化合物搜索

在不同数据库之间映射化合物标识符：

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
- **XML**：使用 BeautifulSoup 解析（适用于大多数 SOAP 服务）
- **制表符分隔格式（TSV）**：使用 Pandas DataFrame 处理表格数据
- **字典/JSON**：直接使用 Python 操作
- **FASTA**：集成 BioPython 进行序列分析

### 速率限制与详细输出

控制 API 请求行为：

```python
from bioservices import KEGG

k = KEGG(verbose=False)  # Suppress HTTP request details
k.TIMEOUT = 30  # Adjust timeout for slow connections
```

### 错误处理

使用 try-except 块包装服务调用：

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
- `hsa`：智人（人类）
- `mmu`：小家鼠（小鼠）
- `dme`：黑腹果蝇
- `sce`：酿酒酵母（酵母）

列出所有生物体：`k.list("organism")` 或 `k.organismIds`

### 与其他工具集成

BioServices 可与以下工具良好配合：
- **BioPython**：对获取的 FASTA 数据进行序列分析
- **Pandas**：操作表格数据
- **PyMOL**：可视化三维结构（获取 PDB ID）
- **NetworkX**：对通路相互作用进行网络分析
- **Galaxy**：为工作流平台创建自定义工具包装器

## 资源

### scripts/

用于演示完整工作流的可执行 Python 脚本：

- `protein_analysis_workflow.py`：端到端蛋白质表征
- `pathway_analysis.py`：KEGG 通路发现和网络提取
- `compound_cross_reference.py`：跨多个数据库搜索化合物
- `batch_id_converter.py`：批量标识符映射实用工具

脚本可以直接执行，也可以针对特定用例进行调整。

### references/

按需加载的详细文档：

- `services_reference.md`：包含方法的 40 多项服务的完整列表
- `workflow_patterns.md`：详细的多步骤分析工作流
- `identifier_mapping.md`：跨数据库 ID 转换的完整指南

在使用特定服务或处理复杂集成任务时，请加载参考文档。

## 安装

```bash
uv pip install bioservices
```

依赖项会自动管理。该软件包已在 Python 3.9-3.12 上通过测试。

## 其他信息

有关详细的 API 文档和高级功能，请参阅：
- 官方文档：https://bioservices.readthedocs.io/
- 源代码：https://github.com/cokelaer/bioservices
- `references/services_reference.md` 中针对特定服务的参考资料