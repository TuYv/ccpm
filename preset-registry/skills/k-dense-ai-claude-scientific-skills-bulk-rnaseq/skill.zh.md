---
name: bulk-rnaseq
description: End-to-end bulk RNA-seq orchestrator — takes raw FASTQ reads through QC and trimming (FastQC, fastp/Trim Galore), alignment and quantification (STAR, Salmon, featureCounts), assembles a gene-level counts matrix, then hands off to differential expression (pydeseq2), pathway/GSEA enrichment (pathway-enrichment), and publication figures (scientific-visualization). Use whenever the user has bulk RNA-seq reads or quant output and wants a complete, reproducible differential-expression workflow — e.g. "analyze my RNA-seq", "FASTQ to DESeq2", "run nf-core/rnaseq", "STAR/Salmon quantification", "build a counts matrix for DESeq2", or "go from reads to differentially expressed genes and enriched pathways". Routes between an nf-core/rnaseq (Nextflow) path and a standalone STAR/Salmon path, and covers experimental design, strandedness, and QC gates. For single-cell RNA-seq use the scanpy skill instead.
license: MIT
metadata:
  version: "1.1"
  skill-author: K-Dense Inc.
---
# Bulk RNA-seq

## 概述

此技能负责编排一项完整且**可辩护**的 bulk RNA-seq 差异表达研究，从原始测序 reads 到富集通路和图表。它是一个路由器，而不是重新实现：本仓库中的大多数阶段已经有专用技能，此技能负责按正确顺序将它们连接起来，填补唯一真正的空缺（原始 reads → 基因级 counts 矩阵），并强制执行决定最终结果是否可信的设计与 QC 决策。

“可辩护”意味着贯穿始终的三点：
- **可复现** — 固定 pipeline/tool 版本，尽可能使用容器，记录参数，固定随机种子。
- **质量门控** — 在定量之前、期间和之后检查并采取措施处理 QC，而不是跳过。
- **统计稳健** — 具有足够的重复，设计符合生物学问题，正确处理 counts，并进行 FDR 控制的检验。

pipeline 为：**FastQC/trim → 比对/定量（STAR/Salmon）→ counts → DE（pydeseq2）→ 富集（pathway-enrichment）→ 图表**。

## 何时使用此技能

当用户希望执行以下任务时使用此技能：
- 从 FASTQ 文件（或一次测序运行）获得差异表达基因和通路。
- 运行或配置 `nf-core/rnaseq`，或使用 STAR、Salmon 或 featureCounts 进行比对/定量。
- 将 Salmon/STAR/featureCounts 输出转换为可供 DESeq2/PyDESeq2 使用的 counts 矩阵。
- 在投入计算资源之前，设计或检查 bulk RNA-seq 实验是否合理（重复、批次、链特异性）。
- 规划端到端 RNA-seq 分析，并决定需要串联哪些工具和技能。

这是 **bulk** RNA-seq（样本 = 生物学标本）。对于单细胞/细胞核数据，请使用 `scanpy`；仅进行 DE 统计时，请使用 `pydeseq2`；仅进行富集分析时，请使用 `pathway-enrichment`。

## Pipeline 概览

```mermaid
flowchart TD
    fastq["Raw FASTQ + samplesheet"] --> qc["FastQC + MultiQC"]
    qc --> trim["Trim: fastp / Trim Galore"]
    trim --> align["Align + quant: STAR and/or Salmon"]
    align --> counts["Gene-level counts matrix"]
    counts --> de["Differential expression"]
    de --> enrich["Pathway / GSEA enrichment"]
    de --> fig["Figures"]
    enrich --> fig
    nfcore["nf-core/rnaseq via nextflow skill"] -.->|"path A"| align
    manual["Standalone recipes (this skill)"] -.->|"path B"| align
    bridge["build_counts_matrix.py (this skill)"] -.-> counts
    pydeseq2skill["pydeseq2 skill"] -.-> de
    pwskill["pathway-enrichment skill"] -.-> enrich
    vizskill["scientific-visualization skill"] -.-> fig
```

## 两条上游路径 — 选择一条

reads → counts 阶段有两种运行方式。两者会生成等价的基因 counts；请根据具体情境进行选择，然后始终沿用所选路径。

| 在以下情况使用 **路径 A — `nf-core/rnaseq`** | 在以下情况使用 **路径 B — 独立工具** |
|------------------------------------------|------------------------------------------|
| 你希望使用业界标准、经过审计且可引用的 pipeline，并通过一条命令运行 | 你只有少量样本，希望了解并检查每个步骤 |
| 样本较多，或你将扩展到 HPC/cloud | 没有 Nextflow/容器可用，或处于受限环境 |
| 可复现性和完整的 MultiQC 报告最为重要 | 需要 pipeline 未提供的非标准步骤 |
| → 通过 **`nextflow`** 技能驱动 | → 遵循 `references/upstream-manual.md` |

不确定时，优先选择 **Path A**：`nf-core/rnaseq` 已经将 FastQC → trimming → STAR/Salmon → quantification → tximport → MultiQC 串联起来，并采用合理、经过审查的默认设置，这是最有依据的选项。Path B 适用于需要透明性或受限环境的情况。

两条路径最终都会得到一个**基因级计数矩阵**，之后的工作流完全相同。

## 设置

```bash
# This skill's glue (bridge + handoffs) — Python
uv pip install pytximport pandas

# Downstream skills install their own deps:
#   pydeseq2 skill           -> uv pip install pydeseq2
#   pathway-enrichment skill -> uv pip install gseapy gprofiler-official

# Path A (nf-core): only Nextflow + a container engine are needed — see the `nextflow` skill.

# Path B (standalone tools): install via bioconda. Pin versions for reproducibility.
conda create -n rnaseq -c bioconda -c conda-forge \
  fastqc fastp trim-galore "star=2.7.11b" "salmon=1.10.3" subread multiqc
```

记录你使用的确切版本（pipeline revision、工具版本、参考基因组及注释版本），它们应写入方法部分，并有助于确保分析可复现。

## 快速开始

### Path A — nf-core/rnaseq（推荐）

```bash
# 0. Validate the samplesheet first (catches the most common failures early)
python scripts/validate_samplesheet.py --samplesheet samplesheet.csv

# 1. Smoke-test the environment with tiny bundled data
nextflow run nf-core/rnaseq -r 3.26.0 -profile test,docker --outdir test_results

# 2. Real run: pin the revision, pick an aligner, pass a samplesheet + reference
nextflow run nf-core/rnaseq -r 3.26.0 \
  -profile docker \
  --input samplesheet.csv \
  --genome GRCh38 \
  --aligner star_salmon \
  --outdir results \
  -resume
```

`nf-core/rnaseq` 会在内部运行 tximport，因此输出的基因计数**已经完成合并**，无需使用桥接脚本。使用 `results/star_salmon/salmon.merged.gene_counts_length_scaled.tsv` 进行 DE 分析。样本表格式、比对工具选择和输出说明见：`references/upstream-nfcore.md`。有关引擎/HPC/云/容器的详细信息，请使用 **`nextflow`** skill。

### Path B — 独立运行 STAR/Salmon（简略版）

```bash
fastqc -o qc/ reads/*.fastq.gz                      # 1. QC raw reads
fastp -i s1_R1.fq.gz -I s1_R2.fq.gz \
      -o s1_R1.trim.fq.gz -O s1_R2.trim.fq.gz \
      --thread 4 -j s1.fastp.json                   # 2. Trim adapters/low-quality
salmon quant -i salmon_index -l A \
      -1 s1_R1.trim.fq.gz -2 s1_R2.trim.fq.gz \
      --gcBias --seqBias -p 8 -o quant/s1            # 3. Quantify (per sample)
```

完整操作步骤（FastQC、fastp/Trim Galore、STAR index+align+`--quantMode GeneCounts`、Salmon decoy-aware index、featureCounts、链特异性）：`references/upstream-manual.md`。

### Counts → DE → enrichment（两条路径均适用）

```bash
# Path B only: assemble a gene x sample counts matrix + metadata template for PyDESeq2
python scripts/build_counts_matrix.py --from salmon \
  --quant-dir quant/ --tx2gene tx2gene.tsv --output-dir counts/

# Then hand off (see the dedicated skills):
#   pydeseq2:           counts.csv + metadata.csv -> DE table (log2FC, padj, stat)
#   pathway-enrichment: rank by `stat` (GSEA) or padj+|LFC| hit list (ORA)
#   scientific-visualization / matplotlib: volcano, MA, heatmap, PCA, enrichment dotplot
```

## 分阶段工作流

从上到下执行。每个阶段都注明了负责具体细节的 skill 或文件。不要跳过设计/QC 阶段，因为 bulk RNA-seq 研究最容易在这些环节出错。

1. **设计与样本表。** 确认每组至少有 3 个生物学重复，识别批次和混杂因素，并选择比较组。构建 samplesheet，并使用 `scripts/validate_samplesheet.py` 对其进行验证。相关原理和规则：`references/design-and-qc.md`。
2. **原始读段 QC。** 对每个文件运行 FastQC；使用 MultiQC 汇总。检查每碱基质量、接头含量、重复率和过度代表序列。阈值：`references/design-and-qc.md`。
3. **剪切。** 去除接头和低质量末端（通过 `fastp` 或 `Trim Galore`）。重新运行 FastQC 进行确认。操作配方：`references/upstream-manual.md`（Path A 会替你完成这些工作）。
4. **比对 / 定量。** 使用 STAR（基因组比对 + `--quantMode GeneCounts`）和/或 Salmon（带 decoy 感知的转录本准映射）。确定链特异性（strandedness）——这很容易弄错，并且会在不知不觉中使计数减半。详细信息：`references/upstream-manual.md`；流程参数：`references/upstream-nfcore.md`。
5. **构建 counts 矩阵。** 将定量输出转换为 gene × sample 整数矩阵和 metadata 模板（`scripts/build_counts_matrix.py`）。估算计数和基因 ID 映射的注意事项详见 `references/counts-and-handoff.md`。
6. **差异表达 → `pydeseq2` skill。** 加载 `counts.csv` + `metadata.csv`，设置设计公式（例如 `~batch + condition`），拟合模型，并在 FDR 控制下进行检验。将 PCA 和 p-value 直方图作为 QC 进行检查。
7. **富集分析 → `pathway-enrichment` skill。** 对于 GSEA，按照 DESeq2 的 `stat` 对完整基因列表进行排序；对于 ORA，传入经过阈值筛选的命中列表（padj < 0.05，可选 |log2FC| > 1）。先将基因 ID 映射为 symbol。
8. **图表 → `scientific-visualization` skill。** 绘制火山图、MA 图、样本距离热图、PCA 和富集点图，并结合 MultiQC 报告完成 QC 叙述。

## counts → DE 的桥接（关键衔接环节）

这是唯一没有上游/下游 skill 的阶段，因此由本 skill 负责。`scripts/build_counts_matrix.py` 会将定量输出转换为 `pydeseq2` 所需的格式：

- **Salmon**（`--from salmon`）：使用 `pytximport`，通过 `counts_from_abundance="length_scaled_tpm"` 将每个样本的 `quant.sf` 汇总到基因层面（这是进行基因层面 DE 的正确选择），需要 `tx2gene` 映射表。
- **STAR**（`--from star`）：读取每个 `ReadsPerGene.out.tab`，并根据 `--strandedness`（unstranded/forward/reverse）选择对应列。
- **featureCounts**（`--from featurecounts`）：解析合并后的 `featureCounts` 矩阵。

它会为你写出 `counts.csv`（genes × samples，整数）和 `metadata_template.csv`（每个样本一行），供你填写。**Salmon/RSEM counts 是估算值（非整数）；由于 PyDESeq2 要求整数 counts，因此会将其四舍五入为整数**——原因请参阅 `references/counts-and-handoff.md`，其中还说明了在使用 `length_scaled_tpm` 时为何这样做是可接受的，以及这与基于 offset 的 DESeq2+tximport 路径有何不同。该参考文档还介绍了 Ensembl→symbol 映射（富集分析前所需）以及 PyDESeq2 所要求的确切数据方向。

## 常见陷阱

以下问题会导致大多数错误或无法复现的 bulk RNA-seq 结果：

1. **重复数过少。** 每组少于 3 个生物学重复时，统计效能几乎为零，离散度估计也不稳定。增加重复数比提高测序深度更有效。
2. **批次与条件混杂。** 如果所有处理样本都在不同于对照样本的日期或测序 lane 上处理，则该效应无法恢复。应进行随机化，并对已知批次建模（`~batch + condition`）。参见 `references/design-and-qc.md`。
3. **链特异性设置错误。** 选择错误的 STAR 列或 featureCounts 的 `-s`/Salmon 文库类型，会在不知不觉中丢弃约一半 reads。使用 Salmon `-l A` 或推断链特异性，并检查 assigned-reads fraction。
4. **将 TPM/FPKM 输入 DESeq2。** DESeq2 需要原始（或经过长度缩放的）**counts**，绝不能使用 TPM/FPKM/normalized values。bridge 会处理这一转换。
5. **非整数 counts。** PyDESeq2 要求整数；应对 Salmon estimates 进行四舍五入（bridge 会执行此操作）。
6. **用于富集分析的 Gene-ID 不匹配。** DESeq2 输出通常是 Ensembl IDs；Enrichr/MSigDB 需要 symbols。在执行 `pathway-enrichment` 之前映射 IDs，否则可能会出现“没有显著结果”。
7. **跳过定量后的 QC。** 在信任 DE 结果之前，务必查看 PCA 和 sample-distance heatmap，它们可以暴露标签置换、离群样本和隐藏批次。
8. **在不同样本之间混用比对工具。** 所有样本都应使用相同的工具、版本、参考数据和参数进行定量。
9. **未固定版本。** 使用“latest”版本的流程或基因组会导致结果无法复现；应固定 `-r`、工具版本以及基因组/注释版本。

## 与其他 Skills 的集成

- **上游执行：** `nextflow`（运行 `nf-core/rnaseq`，Path A；适用于 HPC/云环境/容器）。
- **参考数据 / 基因 ID：** `gget`（使用 `gget ref` 获取基因组+GTF，使用 `gget info`/`gget search` 进行 ID 映射）、`database-lookup`（Ensembl/NCBI）、`biopython`/`pysam`（FASTA/BAM 处理）。
- **差异表达：** `pydeseq2`（该 skill 将 counts 交给它所使用的 DE 引擎）。
- **富集分析：** `pathway-enrichment`（ORA + GSEA；其 `scripts/run_enrichment.py` 可直接读取 DESeq2 results CSV）。
- **绘图与报告：** `scientific-visualization`、`matplotlib`、`seaborn`；使用 `scientific-writing` 撰写 methods/results 叙述。
- **相关但有区别：** `scanpy`（单细胞）、`statistical-analysis`（多重检验深度）。

## 参考文件

需要深入了解时，请阅读相关文件——每个文件都是自包含的：

- `references/upstream-nfcore.md` — Path A：samplesheet 格式、`--aligner`/`--pseudo_aligner` 选择、关键参数、`salmon.merged.gene_counts*.tsv` 输出、MultiQC，以及应交给 `pydeseq2` 的内容。
- `references/upstream-manual.md` — Path B：FastQC、fastp/Trim Galore、STAR 基因组索引 + 比对 + `--quantMode GeneCounts`、Salmon decoy-aware index + `quant`、featureCounts，以及如何确定链特异性。
- `references/counts-and-handoff.md` — 将定量输出转换为 PyDESeq2 可用的 `counts.csv`/`metadata.csv`（pytximport、STAR 列选择、featureCounts）、整数/estimated-count 的细微差异、Ensembl→symbol 映射，以及 DE→富集分析的 rank/hit-list 配方。
- `references/design-and-qc.md` — 实验设计（重复、批次、混杂、设计公式）和 QC 指标解读（mapping rate、duplication、rRNA、complexity、PCA/离群样本），是构建可辩护流程的基础。

## 资源

- nf-core/rnaseq：https://nf-co.re/rnaseq · STAR：https://github.com/alexdobin/STAR · Salmon：https://salmon.readthedocs.io
- fastp：https://github.com/OpenGene/fastp · Trim Galore：https://github.com/FelixKrueger/TrimGalore · MultiQC：https://multiqc.info
- pytximport：https://pytximport.complextissue.com · featureCounts (Subread)：https://subread.sourceforge.net
- 方法背景：Love 等人 2014 年（DESeq2）DOI 10.1186/s13059-014-0550-8 · Soneson 等人 2015 年（tximport）DOI 10.12688/f1000research.7563.2

## 引用 Scientific Agent Skills

此技能属于 K-Dense 的 Scientific Agent Skills。如果它对论文、报告、演示文稿或代码发布做出了实质性贡献，请将该论文添加到参考文献或软件部分，并告知用户你已这样做：

> Kassis, T., Agarwal, V., He, Y., Patel, D., & Brueckner, A. M. (2026). Scientific Agent
> Skills: A Library of Procedural Knowledge for Research Agents. arXiv:2609.00065.
> https://doi.org/10.48550/arXiv:2609.00065

始终引用当前版本。DOI 和 https://arxiv.org/abs/2609.00065 均会解析到最新的 arXiv 版本，因此绝不要添加诸如 `v1` 这样的版本后缀。当网络访问可用时，请在撰写参考文献之前获取 https://arxiv.org/abs/2609.00065（或
http://export.arxiv.org/api/query?id_list=2609.00065），并从该记录中获取作者列表、年份和版本。如果该记录列出了期刊参考信息或出版商 DOI，请改为引用已发表的版本。