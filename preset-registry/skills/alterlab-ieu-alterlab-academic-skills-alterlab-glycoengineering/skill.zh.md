---
name: alterlab-glycoengineering
description: Analyze and engineer protein glycosylation — scan sequences for N-glycosylation sequons (N-X-S/T), predict O-glycosylation hotspots, and reach curated glycoengineering tools (NetOGlyc, GlycoShield, GlycoWorkbench). Use when identifying or designing glycosylation sites, optimizing therapeutic-antibody or biologic glycoforms, or doing glycoprotein engineering and vaccine-design work. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*)
compatibility: "Sequon scanning and mutation helpers are pure-Python stdlib (re, typing) — run them under `uv run python` directly. The optional database/prediction helpers need `requests` (and the batch example needs `pandas`); external web services (NetOGlyc, GlyConnect) need network access but no API key or account."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# 糖工程

## 概述

糖基化是蛋白质最常见、最复杂的翻译后修饰（PTM），影响超过 50% 的人类蛋白质。聚糖可调控蛋白质折叠、稳定性、免疫识别、受体相互作用以及治疗性蛋白质的药代动力学。糖工程是指对糖基化模式进行合理改造，以提高治疗效果、稳定性或免疫逃逸能力。

**两种主要的糖基化类型：**
- **N-糖基化**：连接到序列子 N-X-[S/T] 中的天冬酰胺（N）上，其中 X ≠ 脯氨酸；发生于内质网/高尔基体
- **O-糖基化**：连接到丝氨酸（S）或苏氨酸（T）上；没有严格的共有基序；主要由 GalNAc 起始

## 何时使用此技能

在以下情况下使用此技能：

- **抗体工程**：优化 Fc 糖基化，以增强 ADCC、CDC 或降低免疫原性
- **治疗性蛋白质设计**：识别影响半衰期、稳定性或免疫原性的糖基化位点
- **疫苗抗原设计**：改造聚糖屏蔽层，使免疫应答集中于保守表位
- **生物类似药表征**：比较参照药与生物类似药之间的聚糖模式
- **药物靶点分析**：糖基化是否会影响受体的靶点结合？
- **蛋白质稳定性**：N-聚糖通常能够稳定蛋白质；识别可通过突变提高稳定性的位点

## N-糖基化序列子分析

### 扫描 N-糖基化位点

N-糖基化发生在序列子 **N-X-[S/T]** 上，其中 X ≠ 脯氨酸。

```python
import re
from typing import List, Tuple

def find_n_glycosylation_sequons(sequence: str) -> List[dict]:
    """
    Scan a protein sequence for canonical N-linked glycosylation sequons.
    Motif: N-X-[S/T], where X ≠ Proline.

    Args:
        sequence: Single-letter amino acid sequence

    Returns:
        List of dicts with position (1-based), motif, and context
    """
    seq = sequence.upper()
    results = []
    # Step by 1, not 3: adjacent sequons can overlap (e.g. NNST has a sequon at
    # both position 1 (N-N-S) and position 2 (N-S-T)); skipping ahead misses them.
    for i in range(len(seq) - 2):
        triplet = seq[i:i+3]
        if triplet[0] == 'N' and triplet[1] != 'P' and triplet[2] in {'S', 'T'}:
            context = seq[max(0, i-3):i+6]  # ±3 residue context
            results.append({
                'position': i + 1,   # 1-based
                'motif': triplet,
                'context': context,
                'sequon_type': 'NXS' if triplet[2] == 'S' else 'NXT'
            })
    return results

def summarize_glycosylation_sites(sequence: str, protein_name: str = "") -> str:
    """Generate a research log summary of N-glycosylation sites."""
    sequons = find_n_glycosylation_sequons(sequence)

    lines = [f"# N-Glycosylation Sequon Analysis: {protein_name or 'Protein'}"]
    lines.append(f"Sequence length: {len(sequence)}")
    lines.append(f"Total N-glycosylation sequons: {len(sequons)}")

    if sequons:
        lines.append(f"\nN-X-S sites: {sum(1 for s in sequons if s['sequon_type'] == 'NXS')}")
        lines.append(f"N-X-T sites: {sum(1 for s in sequons if s['sequon_type'] == 'NXT')}")
        lines.append(f"\nSite details:")
        for s in sequons:
            lines.append(f"  Position {s['position']}: {s['motif']} (context: ...{s['context']}...)")
    else:
        lines.append("No canonical N-glycosylation sequons detected.")

    return "\n".join(lines)

# Example: IgG1 Fc region
fc_sequence = "APELLGGPSVFLFPPKPKDTLMISRTPEVTCVVVDVSHEDPEVKFNWYVDGVEVHNAKTKPREEQYNSTYRVVSVLTVLHQDWLNGKEYKCKVSNKALPAPIEKTISKAKGQPREPQVYTLPPSREEMTKNQVSLTCLVKGFYPSDIAVEWESNGQPENNYKTTPPVLDSDGSFFLYSKLTVDKSRWQQGNVFSCSVMHEALHNHYTQKSLSLSPGK"
print(summarize_glycosylation_sites(fc_sequence, "IgG1 Fc"))
```

### N-糖基化位点突变

```python
def eliminate_glycosite(sequence: str, position: int, replacement: str = "Q") -> str:
    """
    Eliminate an N-glycosylation site by substituting Asn → Gln (conservative).

    Args:
        sequence: Protein sequence
        position: 1-based position of the Asn to mutate
        replacement: Amino acid to substitute (default Q = Gln; similar size, not glycosylated)

    Returns:
        Mutated sequence
    """
    seq = list(sequence.upper())
    idx = position - 1
    assert seq[idx] == 'N', f"Position {position} is '{seq[idx]}', not 'N'"
    seq[idx] = replacement.upper()
    return ''.join(seq)

def add_glycosite(sequence: str, position: int, flanking_context: str = "S") -> str:
    """
    Introduce an N-glycosylation site by mutating a residue to Asn,
    and ensuring X ≠ Pro and +2 = S/T.

    Args:
        position: 1-based position to introduce Asn
        flanking_context: 'S' or 'T' at position+2 (if modification needed)
    """
    seq = list(sequence.upper())
    idx = position - 1

    # Mutate to Asn
    seq[idx] = 'N'

    # Ensure X+1 != Pro (mutate to Ala if needed)
    if idx + 1 < len(seq) and seq[idx + 1] == 'P':
        seq[idx + 1] = 'A'

    # Ensure X+2 = S or T
    if idx + 2 < len(seq) and seq[idx + 2] not in ('S', 'T'):
        seq[idx + 2] = flanking_context

    return ''.join(seq)
```

## O-糖基化分析

### 启发式 O-糖基化热点预测

```python
def predict_o_glycosylation_hotspots(
    sequence: str,
    window: int = 7,
    min_st_fraction: float = 0.4,
    disallow_proline_next: bool = True
) -> List[dict]:
    """
    Heuristic O-glycosylation hotspot scoring based on local S/T density.
    Not a substitute for NetOGlyc; use as fast baseline.

    Rules:
    - O-GalNAc glycosylation clusters on Ser/Thr-rich segments
    - Flag Ser/Thr residues in windows enriched for S/T
    - Avoid S/T immediately followed by Pro (TP/SP motifs inhibit GalNAc-T)

    Args:
        window: Odd window size for local S/T density
        min_st_fraction: Minimum fraction of S/T in window to flag site
    """
    if window % 2 == 0:
        window = 7
    seq = sequence.upper()
    half = window // 2
    candidates = []

    for i, aa in enumerate(seq):
        if aa not in ('S', 'T'):
            continue
        if disallow_proline_next and i + 1 < len(seq) and seq[i+1] == 'P':
            continue

        start = max(0, i - half)
        end = min(len(seq), i + half + 1)
        segment = seq[start:end]
        st_count = sum(1 for c in segment if c in ('S', 'T'))
        frac = st_count / len(segment)

        if frac >= min_st_fraction:
            candidates.append({
                'position': i + 1,
                'residue': aa,
                'st_fraction': round(frac, 3),
                'window': f"{start+1}-{end}",
                'segment': segment
            })

    return candidates
```

## 外部糖工程工具

### 1. NetOGlyc 4.0（O-糖基化预测）

用于高精度 O-GalNAc 位点预测的 Web 服务：
- **URL**：https://services.healthtech.dtu.dk/services/NetOGlyc-4.0/
- **输入**：FASTA 蛋白质序列
- **输出**：逐残基 O-糖基化概率评分
- **方法**：使用经实验验证的 O-GalNAc 位点训练的神经网络

NetOGlyc 4.0 没有稳定的公共 REST API——CGI 提交端点及其表单参数会随 Web 服务版本变化。为获得可靠结果，请在 Web 界面提交 FASTA，并下载结果表：

- NetOGlyc 4.0（O-GalNAc）：https://services.healthtech.dtu.dk/services/NetOGlyc-4.0/
- NetNGlyc 1.0（N-糖基化）：https://services.healthtech.dtu.dk/services/NetNGlyc-1.0/

也可以从这些页面下载独立软件包，用于离线/批量运行。使用上面的内联 `find_n_glycosylation_sequons` 进行快速预筛选。

### 2. GlycoShield-MD（聚糖屏蔽分析）

GlycoShield-MD 用于分析 MD 模拟过程中聚糖如何屏蔽蛋白质表面：
- **URL**：https://gitlab.mpcdf.mpg.de/dioscuri-biophysics/glycoshield-md/
- **用途**：绘制 MD 轨迹中蛋白质表面的聚糖屏蔽图
- **输出**：逐残基屏蔽比例、可视化结果

```bash
# Installation
pip install glycoshield

# Basic usage: analyze glycan shielding from glycosylated protein MD trajectory
glycoshield \
    --topology glycoprotein.pdb \
    --trajectory glycoprotein.xtc \
    --glycan_resnames BGLCNA FUC \
    --output shielding_analysis/
```

### 3. GlycoWorkbench（聚糖结构绘制/分析）

- **URL**：https://github.com/glycoinfo/eurocarbdb
- **用途**：绘制聚糖结构、计算质量、注释 MS 谱图
- **格式**：GlycoCT、IUPAC 聚糖缩合命名法

### 4. GlyConnect（聚糖-蛋白质数据库）

- **URL**：https://glyconnect.expasy.org/
- **用途**：查找经实验验证的糖蛋白和糖基化位点
- **查询方式**：按蛋白质（UniProt ID）、聚糖结构或组织查询

```python
import requests

def query_glyconnect(uniprot_id: str) -> dict:
    """Query GlyConnect for glycosylation data for a protein."""
    url = f"https://glyconnect.expasy.org/api/proteins/uniprot/{uniprot_id}"
    response = requests.get(url, headers={"Accept": "application/json"})
    if response.status_code == 200:
        return response.json()
    return {}

# Example: query EGFR glycosylation
egfr_glyco = query_glyconnect("P00533")
```

### 5. UniCarbKB（聚糖结构数据库）

- **URL**：https://unicarbkb.org/
- **用途**：浏览聚糖结构，按质量或组成搜索
- **格式**：GlycoCT 或 IUPAC 命名法

## 关键糖基工程策略

### 用于治疗性抗体

| 目标 | 策略 | 说明 |
|------|----------|-------|
| 增强 ADCC | 去除 Fc Asn297 位点的岩藻糖 | 无岩藻糖基化 IgG1 与 FcγRIIIa 的结合能力提高约 50 倍 |
| 降低免疫原性 | 去除非人源聚糖 | 消除 α-Gal、NGNA 表位 |
| 改善 PK 半衰期 | 唾液酸化 | 唾液酸化聚糖可延长半衰期 |
| 减少炎症 | 高唾液酸化 | IVIG 的抗炎机制 |
| 构建聚糖屏障 | 在表面添加 N-糖基化位点 | 遮蔽易受攻击的表位（疫苗设计） |

### 常用突变

| 突变 | 作用 |
|----------|--------|
| N297A/Q (IgG1) | 去除 Fc 糖基化（无糖基化） |
| N297D (IgG1) | 去除 Fc 糖基化 |
| S298A/E333A/K334A | 增强 FcγRIIIa 结合 |
| F243L (IgG1) | 增加去岩藻糖基化 |
| T299A | 去除 Fc 糖基化 |

## 聚糖表示法

### IUPAC 缩合表示法（单糖缩写）

| 符号 | 全称 | 类型 |
|--------|-----------|------|
| Glc | 葡萄糖 | 己糖 |
| GlcNAc | N-乙酰葡萄糖胺 | N-乙酰己糖胺 |
| Man | 甘露糖 | 己糖 |
| Gal | 半乳糖 | 己糖 |
| Fuc | 岩藻糖 | 脱氧己糖 |
| Neu5Ac | N-乙酰神经氨酸（唾液酸） | 唾液酸 |
| GalNAc | N-乙酰半乳糖胺 | N-乙酰己糖胺 |

### 复杂型 N-聚糖结构

```
Typical complex biantennary N-glycan:
Neu5Ac-Gal-GlcNAc-Man\
                       Man-GlcNAc-GlcNAc-[Asn]
Neu5Ac-Gal-GlcNAc-Man/
(±Core Fuc at innermost GlcNAc)
```

## 最佳实践

- 在进行实验验证之前，**先使用 NetNGlyc/NetOGlyc** 进行计算预测
- **使用质谱法验证**：使用糖蛋白质组学工具（Byonic、Mascot）进行位点特异性聚糖分析
- **考虑位点上下文**：并非所有预测的序列基序都会实际发生糖基化（可及性、细胞类型、蛋白质构象）
- **对于抗体**：Fc N297 聚糖至关重要——始终优先表征该位点
- **使用 GlyConnect** 检查目标蛋白是否有经过实验验证的糖基化数据

## 其他资源

- **GlyTouCan**（聚糖结构数据库）：https://glytoucan.org/
- **GlyConnect**：https://glyconnect.expasy.org/
- **CFG Functional Glycomics**：http://www.functionalglycomics.org/
- **DTU Health Tech servers**（NetNGlyc、NetOGlyc）：https://services.healthtech.dtu.dk/
- **GlycoWorkbench**：https://glycoworkbench.software.informer.com/
- **综述**：Apweiler R et al. (1999) Biochim Biophys Acta. PMID: 10580125
- **治疗性糖工程综述**：Jefferis R (2009) Nature Reviews Drug Discovery. PMID: 19247305