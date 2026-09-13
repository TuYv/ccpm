---
name: glycoengineering
description: Analyze and engineer protein glycosylation. Scan sequences for N-glycosylation sequons (N-X-S/T), predict O-glycosylation hotspots, and access curated glycoengineering tools (NetOGlyc, GlycoShield, GlycoWorkbench). For glycoprotein engineering, therapeutic antibody optimization, and vaccine design.
license: Unknown
metadata:
  version: "1.2"
  skill-author: Kuan-lin Huang
---
# 糖基工程

## 概述

糖基化是蛋白质最常见且最复杂的翻译后修饰（PTM），影响超过 50% 的人类蛋白质。糖链调控蛋白质折叠、稳定性、免疫识别、受体相互作用以及治疗性蛋白质的药代动力学。糖基工程是指对糖基化模式进行理性改造，以提升治疗效果、稳定性或免疫逃逸能力。

**两种主要的糖基化类型：**
- **N-糖基化**：连接到序列基序 N-X-[S/T] 中的天冬酰胺（N）上，其中 X ≠ 脯氨酸；发生于 ER/Golgi
- **O-糖基化**：连接到丝氨酸（S）或苏氨酸（T）上；没有严格的共识基序；主要由 GalNAc 起始

## 何时使用此技能

在以下情况下使用此技能：

- **抗体工程**：优化 Fc 糖基化，以增强 ADCC、CDC 或降低免疫原性
- **治疗性蛋白质设计**：识别影响半衰期、稳定性或免疫原性的糖基化位点
- **疫苗抗原设计**：构建糖基屏蔽，使免疫反应聚焦于保守表位
- **生物类似药表征**：比较参比药物与生物类似药之间的糖链模式
- **药物靶点分析**：糖基化是否会影响受体的靶标结合？
- **蛋白质稳定性**：N-糖链通常能够稳定蛋白质；识别用于稳定性突变的位点

## N-糖基化序列基序分析

### 扫描 N-糖基化位点

N-糖基化发生于序列基序 **N-X-[S/T]**，其中 X ≠ 脯氨酸。

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
    i = 0
    while i <= len(seq) - 3:
        triplet = seq[i:i+3]
        if triplet[0] == 'N' and triplet[1] != 'P' and triplet[2] in {'S', 'T'}:
            context = seq[max(0, i-3):i+6]  # ±3 residue context
            results.append({
                'position': i + 1,   # 1-based
                'motif': triplet,
                'context': context,
                'sequon_type': 'NXS' if triplet[2] == 'S' else 'NXT'
            })
            i += 3
        else:
            i += 1
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

### 突变 N-糖基化位点

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

## 外部糖基工程工具

### 1. NetOGlyc 4.0（O-糖基化预测）

用于高准确度 O-GalNAc 位点预测的 Web 服务：
- **URL**：https://services.healthtech.dtu.dk/services/NetOGlyc-4.0/
- **输入**：FASTA 蛋白质序列
- **输出**：逐残基 O-糖基化概率评分
- **方法**：基于实验验证的 O-GalNAc 位点训练的神经网络

```python
import requests

def submit_netoglycv4(fasta_sequence: str) -> str:
    """
    Submit sequence to NetOGlyc 4.0 web service.
    Returns the job URL for result retrieval.

    Note: This uses the DTU Health Tech web service. Results take ~1-5 min.
    """
    url = "https://services.healthtech.dtu.dk/cgi-bin/webface2.cgi"
    # NetOGlyc submission (parameters may vary with web service version)
    # Recommend using the web interface directly for most use cases
    print("Submit sequence at: https://services.healthtech.dtu.dk/services/NetOGlyc-4.0/")
    return url

# Also: NetNGlyc for N-glycosylation prediction
# URL: https://services.healthtech.dtu.dk/services/NetNGlyc-1.0/
```

### 2. GlycoSHIELD（糖链屏蔽分析）

GlycoSHIELD 将预模拟糖链构象库移植到静态蛋白质结构上，并对糖链能够屏蔽多少蛋白质表面进行评分，无需运行新的 MD
（Tsai 等人，*Cell* 2024，doi:10.1016/j.cell.2024.01.034）：
- **URL**：https://gitlab.mpcdf.mpg.de/dioscuri-biophysics/glycoshield-md/（Web 应用：https://glycoshield.eu）
- **用途**：对糖蛋白上的糖链屏蔽层进行建模，并映射逐残基屏蔽程度
- **输出**：每个位点的糖基化 PDB/XTC 集合、逐残基屏蔽图、在 B-factor 列中包含屏蔽信息的 PDB

GlycoSHIELD **未发布到 PyPI** — `uv pip install glycoshield` 会失败。它以三个脚本的形式发布，构建于一个小型 `glycoshield` 包之上（需要 numpy、scipy、matplotlib、MDAnalysis；`GlycoSASA.py` 还需要 `PATH` 中提供来自 GROMACS 的 `gmx`）。请从检出的源码安装：

```bash
# Installation (GPL-3.0). Glycan conformer libraries are downloaded separately —
# see glycan_library_downloader.py and GLYCAN_LIBRARY/ in the repository.
git clone https://gitlab.mpcdf.mpg.de/dioscuri-biophysics/glycoshield-md.git
cd glycoshield-md
uv pip install -e .

# 1. Graft glycan conformers onto each sequon listed in the input file.
#    One line per site: <chain> <res-1,res,res+1> <1,2,3> <glycan.pdb> <glycan.xtc> <out.pdb> <out.xtc>
python GlycoSHIELD.py --protpdb protein.pdb --inputfile sequons_input \
    --threshold 3.5 --mode CG --shuffle-sugar

# 2. Per-residue shielding score across the grafted ensembles (probe radii in nm)
python GlycoSASA.py --pdblist A_463.pdb,A_492.pdb --xtclist A_463.xtc,A_492.xtc \
    --probelist 0.14,0.25 --plottrace
```

示例说明：这些标志来自脚本的 argparse 定义及上游教程（带有 Man5 糖链的 N-cadherin EC5）；此处未实际运行。`--mode CG` 仅针对 Cα 原子检查空间冲突，并与 `--threshold 3.5` 配合使用；`--mode All` 与 `--threshold 0.7` 则是全原子设置。

### 3. GlycoWorkbench（糖链结构绘制/分析）

- **URL**: https://www.eurocarbdb.org/project/glycoworkbench
- **用途**：绘制聚糖结构、计算质量、注释 MS 光谱
- **格式**：GlycoCT、IUPAC condensed glycan notation

### 4. GlyConnect（糖链-蛋白质数据库）

- **URL**: https://glyconnect.expasy.org/
- **用途**：查找经过实验验证的糖蛋白和糖基化位点
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

- **URL**: https://unicarbkb.org/
- **用途**：浏览聚糖结构、按质量或组成搜索
- **格式**：GlycoCT 或 IUPAC notation

## 关键糖工程策略

### 针对治疗性抗体

| 目标 | 策略 | 说明 |
|------|----------|-------|
| 增强 ADCC | Fc Asn297 去岩藻糖基化 | 无岩藻糖基化的 IgG1 对 FcγRIIIa 的结合能力提高约 50 倍 |
| 降低免疫原性 | 去除非人源聚糖 | 消除 α-Gal、NGNA 表位 |
| 改善 PK 半衰期 | 唾液酸化 | 唾液酸化聚糖可延长半衰期 |
| 减少炎症 | 超唾液酸化 | IVIG 的抗炎机制 |
| 创建聚糖屏蔽 | 向表面添加 N-糖基化位点 | 遮蔽易受攻击的表位（疫苗设计） |

### 常用突变

| 突变 | 作用 |
|----------|--------|
| N297A/Q（IgG1） | 去除 Fc 糖基化（无糖基化） |
| N297D（IgG1） | 去除 Fc 糖基化 |
| S298A/E333A/K334A | 增强 FcγRIIIa 结合 |
| F243L（IgG1） | 提高去岩藻糖基化程度 |
| T299A | 去除 Fc 糖基化 |

## 聚糖表示法

### IUPAC Condensed Notation（单糖缩写）

| 符号 | 全名 | 类型 |
|--------|-----------|------|
| Glc | 葡萄糖 | 己糖 |
| GlcNAc | N-乙酰氨基葡萄糖 | HexNAc |
| Man | 甘露糖 | 己糖 |
| Gal | 半乳糖 | 己糖 |
| Fuc | 岩藻糖 | 脱氧己糖 |
| Neu5Ac | N-乙酰神经氨酸（唾液酸） | 唾液酸 |
| GalNAc | N-乙酰氨基半乳糖 | HexNAc |

### 复杂型 N-聚糖结构

```
Typical complex biantennary N-glycan:
Neu5Ac-Gal-GlcNAc-Man\
                       Man-GlcNAc-GlcNAc-[Asn]
Neu5Ac-Gal-GlcNAc-Man/
(±Core Fuc at innermost GlcNAc)
```

## 最佳实践

- **先使用 NetNGlyc/NetOGlyc** 进行计算预测，再开展实验验证
- **使用质谱进行验证**：使用糖蛋白质组学（Byonic、Mascot）进行位点特异性聚糖分析
- **考虑位点上下文**：并非所有预测出的 sequon 都会实际发生糖基化（受可及性、细胞类型和蛋白质构象影响）
- **对于抗体**：Fc N297 聚糖至关重要，始终首先对该位点进行表征
- **使用 GlyConnect** 检查目标蛋白是否具有经过实验验证的糖基化数据

## 其他资源

- **GlyTouCan**（聚糖结构数据库）：https://glytoucan.org/
- **GlyConnect**：https://glyconnect.expasy.org/
- **CFG Functional Glycomics**：http://www.functionalglycomics.org/
- **DTU Health Tech servers**（NetNGlyc、NetOGlyc）：https://services.healthtech.dtu.dk/
- **GlycoWorkbench**：https://glycoworkbench.software.informer.com/
- **综述**：Apweiler R 等（1999）Biochim Biophys Acta。PMID: 10564035
- **治疗性糖工程综述**：Jefferis R（2009）Nature Reviews Drug Discovery。PMID: 19448661