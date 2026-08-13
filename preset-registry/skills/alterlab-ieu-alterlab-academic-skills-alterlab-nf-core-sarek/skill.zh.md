---
name: alterlab-nf-core-sarek
description: "Runs FASTQ-to-VCF germline and somatic variant calling via the Nextflow nf-core/sarek pipeline pinned to -r 3.8.1 — builds the samplesheet.csv (patient, sex, status, sample, lane, fastq_1, fastq_2), runs bwa-mem/bwa-mem2/dragmap alignment plus GATK4 MarkDuplicates and BQSR against the GATK GRCh38 resource bundle (dbSNP, Mills/1000G indels), and selects callers — explicitly correcting that sarek defaults to Strelka when --tools is unset (pass haplotypecaller for GATK best practice or deepvariant for CNN accuracy), with a non-Nextflow manual GATK4 fallback. Use when the user wants a variant-calling pipeline, FASTQ to VCF, germline or somatic SNV/indel calling, nf-core/sarek, GATK best-practices alignment-to-VCF, or BQSR/HaplotypeCaller/Mutect2/DeepVariant; annotate hits with alterlab-clinvar/alterlab-gnomad/alterlab-cosmic, parse VCFs with alterlab-pysam, store at scale with alterlab-tiledbvcf. Part of the AlterLab Academic Skills suite."
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(uv:*) Bash(nextflow:*)
compatibility: "Requires Nextflow plus a container engine (Docker/Singularity/Apptainer) or conda; the pipeline pulls nf-core/sarek 3.8.1 and reference bundles over the network on first run. The manual GATK4 fallback needs bwa-mem2 + samtools + gatk4 (bioconda) and runs offline once references are local. No API key. Indexing, BQSR and variant calling are long, compute-heavy jobs — good candidates to run locally rather than through repeated API calls."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
    last_updated: "2026-06-06"
---
# nf-core/sarek — 从 FASTQ 到 VCF 的变异检测

这是从原始测序读段到变异结果的工作流运行入口：驱动
**Nextflow [nf-core/sarek](https://nf-co.re/sarek/3.8.1/) 流水线（固定为 `-r 3.8.1`）**，
将生殖系或体细胞短读长 FASTQ 依次进行比对、GATK4 重复序列标记、碱基质量重校准以及 SNV/indel 检测，然后将生成的 VCF 交给本套件的数据库与解析技能进行解读。

此技能是本套件 Python 生物信息学库技能在**命令行／工作流**方面的对应技能。它适用于从*原始数据到 VCF*的阶段；获得 VCF 后，请使用库技能（`alterlab-pysam`、`alterlab-tiledbvcf`）。

## 何时使用此技能

当用户希望执行以下操作时，触发此技能：

- 从 **FASTQ 转换为 VCF**——对全基因组（WGS）或全外显子组（WES）短读长数据进行变异检测。
- 执行**生殖系** SNV/indel 检测（一个或多个正常样本）。
- 执行**体细胞／肿瘤-正常配对**检测（匹配的肿瘤样本与正常样本，或仅肿瘤样本）。
- 明确使用 **nf-core/sarek**，或希望获得可复现的“从比对到 VCF 的 GATK 最佳实践”流水线，而无需手动编写每个步骤。
- 从中间 **`--step`** 恢复运行（已有 BAM/CRAM，只需执行重校准或变异检测）。

### 不触发此技能——将相邻请求路由至以下技能

| 请求实际涉及…… | 路由至 |
|---|---|
| 使用 Python（pysam/htslib）解析／过滤／读取**现有的** VCF/BAM | `alterlab-pysam` |
| **存储／查询**大型多样本变异存储（TileDB-VCF 数组） | `alterlab-tiledbvcf` |
| 已检出变异的临床意义（致病性／良性） | `alterlab-clinvar` |
| 已检出变异的群体等位基因频率 | `alterlab-gnomad` |
| 体细胞突变目录／癌症基因普查查询 | `alterlab-cosmic` |
| **RNA-seq** 转录本／基因定量（salmon/kallisto），而非 DNA 变异 | `alterlab-rnaseq-quant` |
| 16S/ITS **扩增子／微生物组** FASTQ → 特征表 | `alterlab-qiime2-amplicon` |
| 序列**同源性／相似性搜索**（BLAST+、DIAMOND） | `alterlab-blast` |
| 空间转录组学邻域／SVG 分析 | `alterlab-squidpy-spatial` |
| 基于计数的差异**表达**统计 | `alterlab-pydeseq2` |

如果用户没有工作流引擎且无法安装 Nextflow 和容器，
**不要**拒绝——改用**手动 GATK4 流程**（见下文／
`references/manual_gatk4.md`）。

## 首要正确性陷阱：sarek 的默认检测器是 Strelka

根据 [3.8.1 使用文档](https://nf-co.re/sarek/3.8.1/docs/usage/)，**未设置
`--tools` 时，sarek 会先执行预处理，然后仅运行 Strelka。**其默认检测器
**并非** GATK HaplotypeCaller 或 DeepVariant。务必显式设置 `--tools`，
以符合用户的意图：

| 意图 | 传入参数 |
|---|---|
| GATK4 最佳实践生殖系检测 | `--tools haplotypecaller` |
| 生殖系检测的最高 F1（CNN） | `--tools deepvariant` |
| 体细胞检测，匹配的肿瘤／正常样本 | `--tools mutect2`（通常为 `mutect2,strelka`） |
| 对队列进行联合生殖系基因分型 | `--tools haplotypecaller --joint_germline` |

`--tools` 接受以下选项（依据文档中的工具矩阵）：`deepvariant`、`freebayes`、
`haplotypecaller`、`mutect2`、`lofreq`、`mpileup`、`strelka`（以及注释
工具）。变异检测工具的选择会显著影响精确率和召回率——有关 nf-core 基准测试
（Hanssen 等，2024），请参阅 `references/caller_accuracy.md`。

## 流程（如何运行）

### 1. 构建样本表

Sarek 的输入是 CSV。使用 `--step mapping` 时的必填列：
`patient`、`sample`、`lane`、`fastq_1`、`fastq_2`。可选列：`sex`（XX/XY，
默认为 NA）和 `status`（**`0` = 正常，`1` = 肿瘤**，默认为 0）——Sarek
通过 `status` 判断配对样本是否为体细胞变异分析。

使用辅助脚本从 FASTQ 目录生成有效的样本表（它会配对 R1/R2、填充
`lane`，并在耗费计算资源之前验证模式）：

```bash
uv run python skills/bioinformatics/alterlab-nf-core-sarek/scripts/make_samplesheet.py \
    --fastq-dir ./fastq --patient PATIENT_01 --sample TUMOR_01 \
    --status 1 --sex XY --out samplesheet.csv
```

运行前请追加更多行（例如，使用 `--status 0 --append` 添加配对的正常样本）。
有关所有列、BAM/CRAM 重新进入流程的行，以及肿瘤-正常样本示例，请参阅
`references/samplesheet_schema.md`。

### 2. 运行流程（固定版本）

```bash
nextflow run nf-core/sarek -r 3.8.1 \
    -profile docker \
    --input samplesheet.csv \
    --outdir ./results \
    --genome GATK.GRCh38 \
    --tools haplotypecaller \
    --aligner bwa-mem2
```

- **始终保留 `-r 3.8.1`**——未固定版本的运行会漂移到其他流程版本。
- `-profile` 是**必填项**：本地环境可使用 `docker`、`singularity`、`apptainer` 或 `conda`
  （集群还可添加 `test`、机构配置等）。
- `--genome GATK.GRCh38` 会选择 iGenomes/GATK GRCh38 参考基因组，并自动使用其
  捆绑的 BQSR 已知位点（dbSNP、Mills/1000G indels）。
- `--aligner` 选项：`bwa-mem`（默认）、`bwa-mem2`、`dragmap`。
- 对于 **WES**，请通过 `--intervals targets.bed` 传入捕获试剂盒的 BED（3.8.1 中
  没有 `--wes` 标志；请通过 `--intervals` 将分析范围限制在目标区域）。
- 若要从流程中间恢复，请使用 `--step`（默认为 `mapping`，后续依次为 `markduplicates`、
  `prepare_recalibration`、`recalibrate`、`variant_calling`、`annotate`）以及
  Nextflow 的 `-resume`。

预处理遵循 GATK 最佳实践：比对 → **MarkDuplicates** →
**BaseRecalibrator/ApplyBQSR**（BQSR）→ 变异检测。有关详细信息和所有标志，请参阅：
`references/usage_3.8.1.md`。

### 3. 解读输出 VCF

各变异检测工具生成的 VCF 位于 `results/variant_calling/<tool>/` 下。然后：

- 使用 `alterlab-pysam` **解析/过滤**。
- 使用 `alterlab-tiledbvcf` **进行大规模存储/查询**（多样本）。
- **注释**临床意义 → `alterlab-clinvar`；人群频率 →
  `alterlab-gnomad`；体细胞变异目录 → `alterlab-cosmic`。

### 后备方案：手动运行 GATK4（不使用 Nextflow）

如果用户无法运行 Nextflow 和容器，请手动运行等效的 GATK4
最佳实践流程：`bwa-mem2 mem` → `gatk MarkDuplicates` →
`gatk BaseRecalibrator` + `gatk ApplyBQSR`（使用 dbSNP + Mills/1000G 已知
位点）→ `gatk HaplotypeCaller -ERC GVCF` → `gatk GenotypeGVCFs`。完整命令
序列和资源包路径位于 `references/manual_gatk4.md`。

## 报告前的自检

- 是否已显式设置 `--tools`？除非用户确实需要 Strelka，否则绝不要让运行流程回退到 **Strelka**
  默认值。
- 是否已固定版本（`-r 3.8.1`）并选择 `-profile`？
- 对于体细胞分析请求，样本表中是否包含 `status 1` 的肿瘤样本**以及**
  `status 0` 的正常样本，且二者属于**同一个 `patient`**？
- 对于 WES，是否已通过 `--intervals` 提供捕获区域 BED？
- 运行后，是否已将 VCF 解读交由正确的同级 Skill 处理，
  而不是在此处重新推导变异含义？

## 参考资料

- `references/usage_3.8.1.md` — 固定版本的运行命令、profile、`--step`/`--aligner`
  选项和 BQSR 预处理，内容源自 3.8.1 版使用文档。
- `references/samplesheet_schema.md` — 完整的 CSV 列规范、BAM/CRAM 重新输入方式以及
  肿瘤-正常配对实例。
- `references/caller_accuracy.md` — 如何选择 `--tools`，以及 nf-core
  基准测试总结（Hanssen 等，2024，NAR Genomics & Bioinformatics）。
- `references/manual_gatk4.md` — 不使用 Nextflow 时采用的 GATK4 最佳实践后备方案。

AlterLab Academic Skills 套件的一部分。