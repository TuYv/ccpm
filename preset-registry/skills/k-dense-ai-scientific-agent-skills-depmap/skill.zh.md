---
name: depmap
description: Query the Cancer Dependency Map (DepMap) for cancer cell line gene dependency scores (CRISPR Chronos), drug sensitivity data, and gene effect profiles. Use for identifying cancer-specific vulnerabilities, synthetic lethal interactions, and validating oncology drug targets.
license: CC-BY-4.0
metadata:
  version: "1.0"
  skill-author: Kuan-lin Huang
---
# DepMap — 癌症依赖性图谱

## 概述

癌症依赖性图谱（Cancer Dependency Map，DepMap）项目由 Broad Institute 运行，通过全基因组 CRISPR 基因敲除筛选（DepMap CRISPR）、RNA 干扰（RNAi）和化合物敏感性检测（PRISM），系统表征数百种癌症细胞系中的基因依赖性。DepMap 数据对于以下工作至关重要：
- 确定哪些基因是特定癌症类型所必需的
- 寻找癌症选择性依赖（治疗靶点）
- 验证肿瘤药物靶点
- 发现合成致死相互作用

**主要资源：**
- DepMap Portal: https://depmap.org/portal/
- DepMap data downloads: https://depmap.org/portal/download/all/
- Python package: `depmap` (or access via API/downloads)
- API: https://depmap.org/portal/api/

## 何时使用此 Skill

在以下情况下使用 DepMap：

- **靶点验证**：某个基因对于携带特定突变（例如 KRAS 突变）的癌症细胞系的存活是否必不可少？
- **生物标志物发现**：哪些基因组特征可以预测对某个基因敲除的敏感性？
- **合成致死**：寻找当另一个基因发生突变/缺失时具有选择性必需性的基因
- **药物敏感性**：哪些细胞系特征可以预测对某种化合物的响应？
- **泛癌种必需性**：某个基因是否在所有癌症类型中都广泛必需（不适合作为靶点），还是仅具有选择性必需性？
- **相关性分析**：哪些基因对具有相关的依赖性谱（共同必需性）？

## 核心概念

### 依赖性评分

| Score | Range | Meaning |
|-------|-------|---------|
| **Chronos** (CRISPR) | ~ -3 to 0+ | 越负表示越必需。常用必需性阈值：−1。泛必需基因约为−1 至−2 |
| **RNAi DEMETER2** | ~ -3 to 0+ | 与 Chronos 的量表类似 |
| **Gene Effect** | normalized | 标准化后的 Chronos；−1 = 泛必需基因的中位效应 |

**关键阈值：**
- Chronos ≤ −0.5：可能存在依赖性
- Chronos ≤ −1：强依赖（泛必需范围）

### 细胞系注释

每个细胞系都有：
- `DepMap_ID`：唯一标识符（例如 `ACH-000001`）
- `cell_line_name`：人类可读的名称
- `primary_disease`：癌症类型
- `lineage`：广义组织谱系
- `lineage_subtype`：具体亚型

## 核心功能

### 1. DepMap API

```python
import requests
import pandas as pd

BASE_URL = "https://depmap.org/portal/api"

def depmap_get(endpoint, params=None):
    url = f"{BASE_URL}/{endpoint}"
    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()
```

### 2. 基因依赖性评分

```python
def get_gene_dependency(gene_symbol, dataset="Chronos_Combined"):
    """Get CRISPR dependency scores for a gene across all cell lines."""
    url = f"{BASE_URL}/gene"
    params = {
        "gene_id": gene_symbol,
        "dataset": dataset
    }
    response = requests.get(url, params=params)
    return response.json()

# Alternatively, use the /data endpoint:
def get_dependencies_slice(gene_symbol, dataset_name="CRISPRGeneEffect"):
    """Get a gene's dependency slice from a dataset."""
    url = f"{BASE_URL}/data/gene_dependency"
    params = {"gene_name": gene_symbol, "dataset_name": dataset_name}
    response = requests.get(url, params=params)
    data = response.json()
    return data
```

### 3. 基于下载的分析（推荐用于大型查询）

对于大规模分析，下载 DepMap 数据文件并在本地进行分析：

```python
import pandas as pd
import requests, os

def download_depmap_data(url, output_path):
    """Download a DepMap data file."""
    response = requests.get(url, stream=True)
    with open(output_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)

# DepMap 24Q4 data files (update version as needed)
FILES = {
    "crispr_gene_effect": "https://figshare.com/ndownloader/files/...",
    # OR download from: https://depmap.org/portal/download/all/
    # Files available:
    # CRISPRGeneEffect.csv - Chronos gene effect scores
    # OmicsExpressionProteinCodingGenesTPMLogp1.csv - mRNA expression
    # OmicsSomaticMutationsMatrixDamaging.csv - mutation binary matrix
    # OmicsCNGene.csv - copy number
    # sample_info.csv - cell line metadata
}

def load_depmap_gene_effect(filepath="CRISPRGeneEffect.csv"):
    """
    Load DepMap CRISPR gene effect matrix.
    Rows = cell lines (DepMap_ID), Columns = genes (Symbol (EntrezID))
    """
    df = pd.read_csv(filepath, index_col=0)
    # Rename columns to gene symbols only
    df.columns = [col.split(" ")[0] for col in df.columns]
    return df

def load_cell_line_info(filepath="sample_info.csv"):
    """Load cell line metadata."""
    return pd.read_csv(filepath)
```

### 4. 识别选择性依赖关系

```python
import numpy as np
import pandas as pd

def find_selective_dependencies(gene_effect_df, cell_line_info, target_gene,
                                 cancer_type=None, threshold=-0.5):
    """Find cell lines selectively dependent on a gene."""

    # Get scores for target gene
    if target_gene not in gene_effect_df.columns:
        return None

    scores = gene_effect_df[target_gene].dropna()
    dependent = scores[scores <= threshold]

    # Add cell line info
    result = pd.DataFrame({
        "DepMap_ID": dependent.index,
        "gene_effect": dependent.values
    }).merge(cell_line_info[["DepMap_ID", "cell_line_name", "primary_disease", "lineage"]])

    if cancer_type:
        result = result[result["primary_disease"].str.contains(cancer_type, case=False, na=False)]

    return result.sort_values("gene_effect")

# Example usage (after loading data)
# df_effect = load_depmap_gene_effect("CRISPRGeneEffect.csv")
# cell_info = load_cell_line_info("sample_info.csv")
# deps = find_selective_dependencies(df_effect, cell_info, "KRAS", cancer_type="Lung")
```

### 5. 生物标志物分析（基因效应与突变）

```python
import pandas as pd
from scipy import stats

def biomarker_analysis(gene_effect_df, mutation_df, target_gene, biomarker_gene):
    """
    Test if mutation in biomarker_gene predicts dependency on target_gene.

    Args:
        gene_effect_df: CRISPR gene effect DataFrame
        mutation_df: Binary mutation DataFrame (1 = mutated)
        target_gene: Gene to assess dependency of
        biomarker_gene: Gene whose mutation may predict dependency
    """
    if target_gene not in gene_effect_df.columns or biomarker_gene not in mutation_df.columns:
        return None

    # Align cell lines
    common_lines = gene_effect_df.index.intersection(mutation_df.index)
    scores = gene_effect_df.loc[common_lines, target_gene].dropna()
    mutations = mutation_df.loc[scores.index, biomarker_gene]

    mutated = scores[mutations == 1]
    wt = scores[mutations == 0]

    stat, pval = stats.mannwhitneyu(mutated, wt, alternative='less')

    return {
        "target_gene": target_gene,
        "biomarker_gene": biomarker_gene,
        "n_mutated": len(mutated),
        "n_wt": len(wt),
        "mean_effect_mutated": mutated.mean(),
        "mean_effect_wt": wt.mean(),
        "pval": pval,
        "significant": pval < 0.05
    }
```

### 6. 共必需性分析

```python
import pandas as pd

def co_essentiality(gene_effect_df, target_gene, top_n=20):
    """Find genes with most correlated dependency profiles (co-essential partners)."""
    if target_gene not in gene_effect_df.columns:
        return None

    target_scores = gene_effect_df[target_gene].dropna()

    correlations = {}
    for gene in gene_effect_df.columns:
        if gene == target_gene:
            continue
        other_scores = gene_effect_df[gene].dropna()
        common = target_scores.index.intersection(other_scores.index)
        if len(common) < 50:
            continue
        r = target_scores[common].corr(other_scores[common])
        if not pd.isna(r):
            correlations[gene] = r

    corr_series = pd.Series(correlations).sort_values(ascending=False)
    return corr_series.head(top_n)

# Co-essential genes often share biological complexes or pathways
```

## 查询工作流

### 工作流 1：验证某癌症类型中的靶点

1. 下载 `CRISPRGeneEffect.csv` 和 `sample_info.csv`
2. 按癌症类型筛选细胞系
3. 计算目标基因在该癌症类型与所有其他癌症类型中的平均基因效应
4. 计算选择性：该依赖性对你的癌症类型有多大特异性？
5. 与突变、表达或 CNA 数据进行交叉比对，将其作为生物标志物

### 工作流 2：合成致死筛选

1. 识别在目标基因中存在突变/缺失的细胞系（例如 BRCA1 突变）
2. 分别计算突变细胞系与野生型细胞系中所有基因的基因效应分数
3. 识别在突变细胞系中显著更为必需的基因（合成致死伙伴）
4. 根据选择性和效应大小进行筛选

### 工作流 3：化合物敏感性分析

1. 下载 PRISM 化合物敏感性数据（`primary-screen-replicate-treatment-info.csv`）
2. 将化合物 AUC/log2（倍数变化）与基因组特征进行相关性分析
3. 识别化合物敏感性的预测性生物标志物

## DepMap 数据文件参考

| 文件 | 描述 |
|------|-------------|
| `CRISPRGeneEffect.csv` | CRISPR Chronos 基因效应（主要依赖性数据） |
| `CRISPRGeneEffectUnscaled.csv` | 未缩放的 CRISPR 分数 |
| `RNAi_merged.csv` | DEMETER2 RNAi 依赖性 |
| `sample_info.csv` | 细胞系元数据（谱系、疾病等） |
| `OmicsExpressionProteinCodingGenesTPMLogp1.csv` | mRNA 表达 |
| `OmicsSomaticMutationsMatrixDamaging.csv` | 有害体细胞突变（二元值） |
| `OmicsCNGene.csv` | 每个基因的拷贝数 |
| `PRISM_Repurposing_Primary_Screens_Data.csv` | 药物敏感性（药物再利用库） |

从以下地址下载所有文件：https://depmap.org/portal/download/all/

## 最佳实践

- **使用 Chronos 分数**（而不是 DEMETER2）进行当前的 CRISPR 分析——其对切割效率的控制更好
- **区分泛必需基因与癌症选择性基因**：方差较低（在所有细胞系中都必需）的靶基因通常不是理想的药物靶点
- **使用表达数据进行验证**：在某个细胞系中不表达的基因，无论其实际功能如何，都会被评为非必需
- **使用 DepMap ID** 识别细胞系——cell_line_name 可能存在歧义
- **考虑拷贝数因素**：基因扩增可能会由于拷贝数效应（垃圾 DNA 假说）而使基因看起来具有必需性
- **多重检验校正**：在全基因组范围内计算生物标志物关联时，应进行 FDR 校正

## 其他资源

- **DepMap 门户**：https://depmap.org/portal/
- **数据下载**：https://depmap.org/portal/download/all/
- **DepMap 论文**：Behan FM 等（2019）《Nature》。PMID: 30971826
- **Chronos 论文**：Dempster JM 等（2021）《Nature Methods》。PMID: 34349281
- **GitHub**：https://github.com/broadinstitute/depmap-portal
- **Figshare**：https://figshare.com/articles/dataset/DepMap_24Q4_Public/27993966