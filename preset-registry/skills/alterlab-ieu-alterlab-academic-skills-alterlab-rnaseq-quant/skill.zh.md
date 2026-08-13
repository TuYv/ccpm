---
name: alterlab-rnaseq-quant
description: Quantifies bulk RNA-seq transcript abundance with salmon (v1.11.4 selective alignment) and kallisto (v0.52.0, kb-python workflow), builds a decoy-aware gentrome index, runs quant with --validateMappings --gcBias -l A, then imports estimates via tximport/tximeta with a tx2gene map and hands differential expression to alterlab-pydeseq2. Warns that salmon's index format changed to SSHash (rebuild pre-v1.11.2 indices) and that 'salmon alevin' was REMOVED (single-cell now uses piscem + alevin-fry). Use when quantifying RNA-seq transcript abundance, running salmon or kallisto, building a decoy-aware index, or wiring tximport to DESeq2; for differential expression use alterlab-pydeseq2, for FASTQ-to-VCF variant calling use alterlab-nf-core-sarek. Part of the AlterLab Academic Skills suite.
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*) Bash(salmon:*) Bash(kallisto:*) Bash(kb:*)
compatibility: "Requires the salmon and/or kallisto CLI on PATH (conda/bioconda or a container). salmon v1.11.4 and kallisto v0.52.0 are the versions this skill targets; the tximport/tx2gene helper runs under `uv run python` with pure stdlib (no pandas needed). No API key or account required; all work is local."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
    last_updated: "2026-06-06"
    depends_on: "alterlab-pydeseq2 (downstream differential expression)"
---
# RNA-seq 定量——使用 salmon 与 kallisto 估算转录本丰度

这是 bulk RNA-seq 的命令行定量入口：输入原始 FASTQ reads 和参考转录组，使用 **salmon**（选择性比对）或 **kallisto**
（通过 kb-python 进行伪比对）生成转录本水平的丰度估计
（counts + TPM），然后使用 `tximport`/`tximeta` 汇总至基因水平，并交由
`alterlab-pydeseq2` 进行差异表达分析。这是从原始数据到计数矩阵的流水线，仓库中的 Python
分析技能均假定该流程已运行完毕。

## 快速开始

```
Quantify these RNA-seq FASTQs with salmon and a decoy-aware index
Build a salmon gentrome index from this transcriptome + genome
Run kallisto / kb count on my paired-end reads
Turn my salmon quant.sf files into a gene-level count matrix for DESeq2
```

→ 先构建一次**诱饵感知型**索引，为每个样本运行 `salmon quant`（或 `kb count`），
然后运行 `scripts/build_tx2gene.py` + `scripts/import_quant.py` 以生成
`tximport` 基因矩阵，并将其传递给 `alterlab-pydeseq2`。

---

## 何时使用此技能

当请求涉及使用轻量级定量工具，**从 FASTQ 获得转录本或
基因丰度**时，请使用此技能：

- “使用 salmon / kallisto 对我的 RNA-seq 进行定量。”
- “构建诱饵感知型 salmon 索引（gentrome + decoys.txt）。”
- “使用 `--validateMappings --gcBias` 运行选择性比对。”
- “我有 `quant.sf` 文件——请为 DESeq2 生成基因水平的计数矩阵。”
- “使用 tx2gene 映射设置 `tximport` / `tximeta`。”
- “使用 kb-python / `kb count` 对这些 reads 进行伪比对。”

### 不触发此技能——请将这些请求转交给合适的同级技能

| 请求实际涉及…… | 转交给 |
|------------------------------|----------|
| 对**计数矩阵**进行差异表达分析（DESeq2 Wald 检验、FDR、火山图） | `alterlab-pydeseq2` |
| **单细胞** RNA-seq 定量（曾使用 `salmon alevin`） | piscem + alevin-fry——参见 [references/single_cell_alevin.md](references/single_cell_alevin.md)；下游分析 → `alterlab-scanpy` / `alterlab-scvi-tools` |
| **FASTQ-to-VCF** 胚系/体细胞变异检测 | `alterlab-nf-core-sarek` |
| **16S/ITS 扩增子**（微生物组）FASTQ-to-feature-table | `alterlab-qiime2-amplicon` |
| **空间**转录组学（Visium/Xenium）邻域分析 | `alterlab-squidpy-spatial` |
| 将生成的矩阵作为 **AnnData** 对象加载或操作 | `alterlab-anndata` |
| BLAST/DIAMOND **序列相似性搜索** | `alterlab-blast` |
| 快速进行基因/转录本 **ID 查询与参考序列获取**（Ensembl/RefSeq） | `alterlab-gget` |
| 已比对 **BAM** 的操作、覆盖度分析、从比对结果中进行 reads 计数 | `alterlab-pysam` |

此技能的处理范围止于**计数/丰度矩阵**。它不会鉴定 DEG，不会处理单细胞条形码，也不会
为了变异检测而将 reads 比对至基因组。

---

## 两个关键的正确性陷阱（定量前请阅读）

截至 salmon **v1.11.4**（发布于 2026-03-11），这是大多数过时 RNA-seq 指南中最常见的两个错误。
这两点均已在上游发布说明中得到确认（参见 [references/tool_versions.md](references/tool_versions.md)）。

1. **salmon 索引格式已更改为 SSHash。** salmon 已从彩色压缩 de Bruijn 图索引切换到基于 SSHash 的新 k-mer 索引。发行说明指出，在使用 v1.11.2+ 之前，**必须重新构建所有先前创建的索引**。如果复用 v1.11.2 之前的索引，将会收到错误，或者在没有提示的情况下得到错误结果——**始终使用与定量时相同版本的 salmon 重新构建索引**。

2. **`salmon alevin` 已被移除。** 单细胞定量不再是 salmon 的一部分。发行说明建议原 `alevin` 用户改用 **piscem + alevin-fry** 流水线。请**不要**编写 `salmon alevin` 命令。如果用户使用的是单细胞 / 液滴数据，请按照上表进行分流，并参阅 [references/single_cell_alevin.md](references/single_cell_alevin.md)。

---

## 流水线（salmon，默认路径）

### 1. 构建支持诱饵序列的 gentrome 索引（每个参考构建一次）

**支持诱饵序列**的索引使 salmon 能够区分与基因组比与转录组比对得更好的读段，从而减少错误指派。你需要构建一个“gentrome” = 转录本 FASTA **与基因组 FASTA 拼接而成的文件**，并提供一个 `decoys.txt`，其中将基因组序列名称列为诱饵序列。

```bash
# 1. decoys.txt = the genome's sequence (chromosome) names, one per line
grep "^>" genome.fa | sed 's/^>//; s/ .*//' > decoys.txt

# 2. gentrome = transcripts FIRST, then genome (order matters)
cat transcripts.fa genome.fa > gentrome.fa

# 3. build the index (rebuild for v1.11.4 — see trap #1)
salmon index \
  -t gentrome.fa \
  -d decoys.txt \
  -i salmon_index \
  -k 31 \
  -p 8
```

- `-k 31` 是默认的 k-mer；仅对非常短的读段使用更低的值。
- 辅助脚本 `scripts/make_decoys.py` 会为你生成 `decoys.txt` 和 `gentrome.fa`，并在转录本 FASTA 中缺少基因组名称时拒绝继续执行（这是一个常见且不会显式报错的错误）。请参阅 [references/decoy_index.md](references/decoy_index.md)。

### 2. 对每个样本进行定量

```bash
salmon quant \
  -i salmon_index \
  -l A \
  -1 sampleA_R1.fastq.gz -2 sampleA_R2.fastq.gz \
  --validateMappings \
  --gcBias \
  -p 8 \
  -o quants/sampleA
```

- **`-l A`** — 自动检测文库类型（链特异性）。除非你有明确记录的实验方案，否则让 salmon 自行推断；在 `lib_format_counts.json` 中核实推断出的类型。
- **`--validateMappings`** — 启用选择性比对（准确的默认模式；对比对进行评分，而不是直接信任原始伪比对）。
- **`--gcBias`** — 校正片段层面的 GC 偏差；建议用于差异表达分析，并且启用成本很低。如有需要，可添加 `--seqBias` 以校正 5'/3' 端的序列特异性偏差。
- 对于单端读段，传入 `-r reads.fastq.gz`，而不是 `-1/-2`。

每个样本都会生成 `quants/<sample>/quant.sf`（转录本层面的估计值）和 `quants/<sample>/lib_format_counts.json`（推断出的文库类型）。有关完整的参数说明和逐样本 QC 检查，请参阅 [references/salmon_quant.md](references/salmon_quant.md)。

### 3. 使用 tximport 汇总到基因层面

根据注释构建转录本→基因映射（`tx2gene`），然后将每个样本的 `quant.sf` 文件汇总为供 `pydeseq2` 使用的基因层面矩阵。

```bash
# tx2gene from a GTF/GFF3 (transcript_id -> gene_id)
uv run python scripts/build_tx2gene.py annotation.gtf --out tx2gene.tsv

# import + summarize to gene level (tximport "lengthScaledTPM" counts)
uv run python scripts/import_quant.py \
  --quants quants \
  --tx2gene tx2gene.tsv \
  --out-counts gene_counts.tsv \
  --out-tpm gene_tpm.tsv
```

`import_quant.py` 会生成一个经过整数舍入的基因 × 样本计数矩阵，以及一个基因 × 样本 TPM 矩阵，也就是 `alterlab-pydeseq2` 所需的输入。它在转录本层面实现了 tximport 的 `makeCountsFromAbundance(..., "lengthScaledTPM")`（将每个转录本的 TPM 乘以其在各样本间取平均的有效长度，然后重新缩放每个样本列，使其恢复到该样本的已比对读段文库大小），再按基因求和——因此这些计数经过了长度校正和文库大小缩放，**不是**原始 `NumReads` 的直接求和。规范的 R 实现路径是使用 `tximport` / `tximeta` Bioconductor 包，并设置 `countsFromAbundance = "lengthScaledTPM"`；这里的 Python 辅助脚本复现了该计算，因此你可以继续使用 `uv`（区别仅在于整数舍入以及缺少 `tximeta` 来源记录）。有关确切语义、`tximeta` 的 linkedTxome 元数据选项，以及何时应优先选择 R 路径，请参阅 [references/tximport_handoff.md](references/tximport_handoff.md)。

### 4. 转交给差异表达分析

将 `gene_counts.tsv`（以及样本/条件表）传给 **`alterlab-pydeseq2`**。此 Skill 不负责检出差异表达基因（DEG）——那是 pydeseq2 的工作（大小因子归一化、离散度估计、Wald 检验、BH-FDR、火山图/MA 图）。

---

## 流程（kallisto，伪比对路径）

`kallisto`（独立工具 **v0.52.0**）和 **kb-python** 封装器（`kb`）提供了一条更快的伪比对路径。kb-python 驱动 `kallisto | bustools` 并写出整洁的输出。

```bash
# build a kallisto index from the transcriptome
kallisto index -i kallisto_index.idx transcripts.fa

# quantify a paired-end sample
kallisto quant -i kallisto_index.idx -o quants_kallisto/sampleA \
  sampleA_R1.fastq.gz sampleA_R2.fastq.gz

# OR the kb-python workflow (bulk)
# -f1 is the cDNA FASTA kb WRITES; trailing positionals are genome FASTA THEN GTF
kb ref -i index.idx -g t2g.txt -f1 cdna.fa genome.fa annotation.gtf
kb count -i index.idx -g t2g.txt -x bulk -o quants_kb/sampleA \
  sampleA_R1.fastq.gz sampleA_R2.fastq.gz
```

- kallisto 输出 `abundance.tsv` / `abundance.h5`；将它们传给 `tximport`（`type="kallisto"`），方式与处理 salmon 的 `quant.sf` 相同。
- **长读段：**kb-python 通过 `--long` 标志（以及 `k>31` k-mer）提供 **lr-kallisto**——将其用于 ONT/PacBio cDNA。请参阅 [references/kallisto_kb.md](references/kallisto_kb.md)。
- kallisto 不使用诱饵/gentrome 构建方式；这是 salmon 特有的。

---

## 开箱即用的替代方案——nf-core/rnaseq

对于端到端且跟踪来源记录的流程（修剪 → 比对 → 定量 → 质量控制），**nf-core/rnaseq v3.26.0** 默认使用 `--aligner star_salmon` 运行：STAR 将读段比对到基因组，再投射到转录组，最后由 Salmon 执行定量。当用户需要可复现的 Nextflow 流程，而不是手动运行命令时，请使用它；此 Skill 涵盖 direct-salmon/kallisto 路径以及向 tximport 的交接。请参阅 [references/tool_versions.md](references/tool_versions.md)。

---

## 卸载说明

索引构建和逐样本定量会占用大量 CPU/IO 资源，但完全可以离线运行。在本地工作站上，这些任务适合直接运行（例如隔夜运行），而不是通过 API 会话流式传输大型 FASTQ 文件。索引只需构建一次；然后循环对样本进行定量。

---

## 报告前自检

- 你是否使用执行定量时所用的 v1.11.4 **重新构建**了 salmon 索引
  （SSHash 格式——陷阱 #1）？切勿重复使用 v1.11.2 之前版本构建的索引。
- salmon 索引是否**支持诱饵序列**（gentrome + `decoys.txt`）？请确认
  基因组名称已写入 `decoys.txt`。
- 你是否使用 `-l A` 推断链特异性，并对 `lib_format_counts.json` 中推断出的
  类型进行了合理性检查？
- 数据是否确实为**单细胞**数据？如果是，则绝对不能使用此流程——
  `salmon alevin` 已被移除；请改用 piscem + alevin-fry（陷阱 #2）。
- 你是否在获得**计数矩阵**后便停止，并将差异表达分析交由 `alterlab-pydeseq2`
  处理，而不是在此处识别差异表达基因？

---

## 参考资料

- [references/tool_versions.md](references/tool_versions.md) — 固定版本
  （salmon v1.11.4、kallisto v0.52.0、kb-python、nf-core/rnaseq v3.26.0）以及
  上游发布说明中的事实（SSHash 索引变更、alevin 移除）。
- [references/decoy_index.md](references/decoy_index.md) — 支持诱饵序列的 gentrome
  索引构建、注意事项以及 `make_decoys.py` 辅助脚本。
- [references/salmon_quant.md](references/salmon_quant.md) — `salmon quant` 参数
  说明、文库类型推断以及逐样本质量控制。
- [references/kallisto_kb.md](references/kallisto_kb.md) — kallisto / kb-python
  工作流程、`--long`（lr-kallisto）以及输出处理。
- [references/tximport_handoff.md](references/tximport_handoff.md) — tximport /
  tximeta 聚合、tx2gene、`countsFromAbundance` 以及向 pydeseq2 的移交。
- [references/single_cell_alevin.md](references/single_cell_alevin.md) — 
  `salmon alevin` 被移除的原因以及 piscem + alevin-fry 替代方案。

AlterLab Academic Skills 套件的一部分。