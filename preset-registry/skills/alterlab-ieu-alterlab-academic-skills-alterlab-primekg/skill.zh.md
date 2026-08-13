---
name: alterlab-primekg
description: Queries the Precision Medicine Knowledge Graph (PrimeKG) for multiscale biomedical relationships across genes, drugs, diseases, phenotypes, pathways, and biological processes. Use when exploring drug-disease or gene-disease links, building disease-centric knowledge subgraphs, or sourcing relations for drug repurposing and precision-medicine analyses. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Runs under `uv run python` with pandas installed and the PrimeKG `kg.csv` available locally (set `PRIMEKG_DATA_PATH`); no API key or account required."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# PrimeKG 知识图谱 Skill

## 概述

PrimeKG（Chandak、Huang 与 Zitnik，*Scientific Data* 2023；mims-harvard/PrimeKG）是一个整合了 20 个主要资源的精准医学知识图谱。它包含 129,375 个节点和 4,050,249 条边，涵盖 30 种边类型和 10 种节点类型，包括药物-靶点、疾病-基因和疾病-表型关联。

**主要功能：**
- 搜索节点（基因、蛋白质、药物、疾病、表型）
- 检索直接邻居（关联实体和临床证据）
- 分析局部疾病上下文（相关基因、药物、表型）
- 识别药物-疾病路径（潜在的药物再利用机会）

**数据访问：** 通过 `scripts/query_primekg.py` 以编程方式访问。使用 `PRIMEKG_DATA_PATH` 环境变量将加载器指向 Harvard Dataverse 上发布的 `kg.csv`（其默认路径为相对于脚本的 `../data/kg.csv`）。所有函数均基于 `kg.csv` 中的 `x_*`/`y_*`/`relation`/`display_relation` 列运行。

## 何时使用此 Skill

此 Skill 适用于以下情况：

- **基于知识的药物发现：** 识别疾病的靶点和机制。
- **药物再利用：** 寻找可能有证据支持其用于新适应证的现有药物。
- **表型分析：** 了解症状/表型与疾病及基因之间的关系。
- **多尺度生物学：** 弥合分子靶点（基因）与临床结局（疾病）之间的差距。
- **网络药理学：** 研究药物-靶点相互作用所产生的更广泛网络效应。

## 核心工作流程

在 Skill 目录中通过 `uv run python` 运行（以便导入 `scripts/`），
或将 `scripts/` 目录添加到 `sys.path`。将 `PRIMEKG_DATA_PATH` 设置为你的 `kg.csv`。

### 1. 搜索实体

查找基因、药物或疾病的标识符。传递 `node_type` 时，应使用 PrimeKG 的
确切类型字符串（请参阅下面的节点类型）——例如使用 `"gene/protein"`，而不是 `"gene"`。

```python
from scripts.query_primekg import search_nodes

# Search for Alzheimer's disease nodes
results = search_nodes("Alzheimer", node_type="disease")
# Returns: [{"id": <MONDO id>, "type": "disease", "name": "...",
#            "source": "MONDO" | "MONDO_grouped"}, ...]
# Disease ids are MONDO ids; PrimeKG groups diseases, so one name can map to
# several MONDO ids. Use the returned id with get_neighbors.
```

### 2. 获取邻居（直接关联）

检索所有相连的节点和关系类型。

```python
from scripts.query_primekg import get_neighbors

# Get all neighbors of a specific disease ID (the MONDO id from search_nodes)
neighbors = get_neighbors(disease_id, relation_type="disease_protein")
# Returns: List of neighbors like
#   {"neighbor_name": "APOE", "neighbor_type": "gene/protein",
#    "relation": "disease_protein", "display_relation": "associated with", ...}
```

### 3. 分析疾病上下文

使用高级函数汇总某种疾病的关联。

```python
from scripts.query_primekg import get_disease_context

# Comprehensive summary for a disease
context = get_disease_context("Alzheimer")
# Access: context['associated_genes'], context['associated_drugs'],
#         context['phenotypes'], context['related_diseases']
```

### 4. 追踪药物-疾病路径（药物重定位）

查找深度为 2 的路径（药物 -> 共享基因/蛋白质靶点 -> 疾病），作为基于图的药物重定位证据。

```python
from scripts.query_primekg import find_paths

# drug_id and disease_id come from search_nodes
paths = find_paths(drug_id, disease_id, max_depth=2)
# Each path is a list of edge dicts; a drug -> gene/protein -> disease path is a
# candidate new-indication hypothesis. For deeper traversal, load kg.csv into networkx.
```

## PrimeKG 中的节点和关系类型

以下是 `kg.csv` 中使用的确切字符串——筛选时必须逐字匹配。

**节点类型**（`x_type`/`y_type`，共 10 种）：`gene/protein`、`drug`、`disease`、
`effect/phenotype`、`biological_process`、`molecular_function`、`cellular_component`、
`pathway`、`anatomy`、`exposure`。注意：基因使用 `gene/protein`（而非 `gene`），
表型使用 `effect/phenotype`（而非 `phenotype`）。

**关键关系**（`relation`，共 30 种）。边是无向的；请检查两个端点。
- `protein_protein`：物理蛋白质-蛋白质相互作用
- `drug_protein`：药物靶点/作用机制关联
- `disease_protein`：疾病-基因/蛋白质关联（不存在 `disease_gene`）
- `indication`、`contraindication`、`off-label use`：三种药物-疾病关系
  （不存在统一的 `drug_disease`）
- `disease_phenotype_positive` / `disease_phenotype_negative`：表型存在/不存在
- `bioprocess_protein`、`pathway_protein`、`molfunc_protein`、`cellcomp_protein`：GO /
  通路注释
- `anatomy_protein_present` / `anatomy_protein_absent`、`exposure_*`：解剖结构/暴露关联

## 最佳实践

1. **使用具体 ID：** 使用 `get_neighbors` 时，请确保使用从 `search_nodes` 获取的正确 ID（疾病 ID 是 MONDO ID）。
2. **先了解上下文：** 在深入研究特定基因或药物之前，先使用 `get_disease_context` 获取整体概览。
3. **筛选关系：** 在 `get_neighbors` 中使用 `relation_type` 筛选器，聚焦于特定证据（例如，仅筛选 `drug_protein`，或使用 `indication` 筛选治疗关联）。请使用上述列表中的确切关系字符串。
4. **注意疾病分组：** PrimeKG 将约 2.2 万个 MONDO 概念合并为约 1.7 万个分组疾病节点，因此一个疾病名称可能会解析为多个共享同一 `node_index` 的 MONDO ID。

## 资源

### 脚本
- `scripts/query_primekg.py`：核心函数——`search_nodes`、`get_neighbors`、`find_paths`、`get_disease_context`。

### 数据路径
- 数据：`kg.csv`（设置 `PRIMEKG_DATA_PATH`；默认为 `../data/kg.csv`），来源于 Harvard Dataverse（mims-harvard/PrimeKG）。
- 129,375 个节点，4,050,249 条边；10 种节点类型，30 种边类型。
- 使用 pandas 加载（`pd.read_csv`、`low_memory=True`）。未压缩的 kg.csv 大小超过约 3 GB——每个函数都会重新加载该文件；对于重复查询，请缓存 DataFrame 或使用真正的图存储。