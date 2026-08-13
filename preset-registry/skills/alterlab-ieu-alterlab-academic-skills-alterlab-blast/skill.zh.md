---
name: alterlab-blast
description: "Runs NCBI BLAST+ 2.17.0 sequence searches from the command line: makeblastdb (with -parse_seqids), blastn/blastp/blastx/tblastn with tabular -outfmt 6/7 for parsing, correct -task choice (megablast vs blastn vs blastn-short), -taxids/-negative_taxids taxonomic scoping, and -mt_mode multithreading; plus a DIAMOND blastp --ultra-sensitive path for large protein searches. Warns that -max_target_seqs is a heuristic keep-count, not a top-N best-hits filter. Use when the user wants command-line BLAST, makeblastdb, a local BLAST database, blastn/blastp/blastx/tblastn searches, or DIAMOND protein search. For the Bio.Blast web NCBIWWW API prefer alterlab-biopython; for quick one-liner database lookups prefer alterlab-gget. Part of the AlterLab Academic Skills suite."
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash(makeblastdb:*) Bash(blastn:*) Bash(blastp:*) Bash(blastx:*) Bash(tblastn:*) Bash(blastdbcmd:*) Bash(diamond:*)
compatibility: "Requires NCBI BLAST+ 2.17.0 binaries on PATH (conda: `bioconda::blast`; or Homebrew `blast`); no API key or account needed for local searches. DIAMOND (`bioconda::diamond`) is optional and only used for the large-protein fast path. Parsing/QC helper runs under `uv run python` with the standard library only."
metadata:
    skill-author: AlterLab
    version: "1.0.0"
---
# BLAST+ — 命令行序列搜索

端到端运行本地 NCBI **BLAST+ 2.17.0** 搜索：使用
`makeblastdb` 构建数据库，使用 `blastn` / `blastp` / `blastx` / `tblastn` 进行搜索，生成
机器可解析的表格输出，并按分类群限定搜索范围。对于超大规模蛋白质
搜索，转交给 **DIAMOND** `blastp --ultra-sensitive`（据 DIAMOND 项目称，其
速度是 BLAST 的 100–10,000 倍）。这是用于 **CLI / 本地数据库**
的技能；它被特意设计为不同于 Biopython Web API 和 gget
单行命令（参见下方的路由表）。

> 批量数据库构建和大型搜索会大量占用 CPU/IO，并且完全离线——非常
> 适合在本地计算资源上运行，而不是消耗 API 调用额度。

## 何时使用此技能

当请求涉及以下任一内容时，请使用此技能：

- “对这些序列运行 BLAST”、“运行 blastn/blastp/blastx/tblastn”、“命令行 BLAST”
- “构建本地 BLAST 数据库”、`makeblastdb`、“为此 FASTA 创建 BLAST 索引”
- “针对本地 nt/nr 数据库搜索我的 reads”、“获取可解析的表格形式 BLAST 命中结果”
- “将 BLAST 搜索限定到某个分类群” (`-taxids` / `-negative_taxids`)
- “对数百万个蛋白质运行 BLAST 太慢” → DIAMOND `blastp`
- 从 BLAST 数据库中检索序列（`blastdbcmd`，需要 `-parse_seqids`）

### 不触发此技能的情况

应将相邻领域的请求路由到正确的同级技能，而不是强行使用 BLAST+：

| 请求实际涉及的是…… | 路由到 |
|------------------------------|----------|
| **Web** BLAST API (`Bio.Blast.NCBIWWW.qblast`)，或在 Python 流水线中编写 BLAST 脚本并使用 `Bio.Blast` 解析 | `alterlab-biopython` |
| 使用**快速单行命令**进行 BLAST/数据库查询（`gget blast`、基因/结构/富集查询） | `alterlab-gget` |
| 以统一的编程方式访问多种生物学 Web 服务（UniProt、KEGG、Ensembl REST、NCBI eUtils） | `alterlab-bioservices` |
| 根据序列构建/搜索**系统发育树**，而非进行相似性搜索 | `alterlab-phylogenetics` |
| 将 reads 比对到参考基因组（BWA/minimap2 → BAM）以及处理 SAM/BAM | `alterlab-pysam` |
| FASTQ→VCF 变异检测流水线 | `alterlab-nf-core-sarek` |
| 转录本水平的 RNA-seq 定量（salmon/kallisto） | `alterlab-rnaseq-quant` |
| 16S/ITS 扩增子分类（QIIME 2） | `alterlab-qiime2-amplicon` |
| 蛋白质**结构**预测/嵌入（ESM、AlphaFold） | `alterlab-esm` |

如果用户明确说“Web BLAST”、“NCBIWWW”或“不安装
任何东西”，那么他们需要的是 `alterlab-biopython`，而不是此技能。

## 快速开始

```bash
# 1. Build a protein DB (‑parse_seqids enables blastdbcmd retrieval + DIAMOND reuse)
makeblastdb -in proteins.fasta -dbtype prot -parse_seqids -out mydb -title "my proteins"

# 2. Search, tabular output you can parse, std 12 columns
blastp -query query.faa -db mydb -outfmt 6 -evalue 1e-5 -out hits.tsv

# 3. QC / summarize the tabular output (stdlib only)
uv run python scripts/parse_blast_tab.py hits.tsv --best-hit
```

`-outfmt 6` 是规范的机器可读格式；其默认列为
`std` 集合：`qseqid sseqid pident length mismatch gapopen qstart qend sstart
send evalue bitscore`。使用 `-outfmt 7` 可获得相同的列并附加注释行。

## 选择正确的程序

| 查询序列 | 目标数据库 | 程序 |
|-------|-----------|---------|
| 核苷酸 | 核苷酸 | `blastn` |
| 蛋白质 | 蛋白质 | `blastp` |
| 核苷酸（翻译后） | 蛋白质 | `blastx` |
| 蛋白质 | 核苷酸（翻译后） | `tblastn` |

对于 `makeblastdb` 的 `-dbtype`，核苷酸目标序列使用 `nucl`，蛋白质目标序列使用 `prot`。

## 人们最常犯的五个错误

1. **`-max_target_seqs` 不是“最佳前 N 个命中”的过滤器。** 它表示要*保留*的
   已比对序列数量，在搜索过程中作为启发式截断条件应用；
   分数相同时，“按序列在数据库中的顺序”决定取舍，而不是按得分。设置
   `-max_target_seqs 1` **不能**可靠地返回唯一的最佳命中。要获得
   最佳命中，请使用一个足够大的值，然后在按
   bitscore 排序*之后*选取第一行（参见 `scripts/parse_blast_tab.py --best-hit`）。默认值为 500。
2. **为 `blastn` 选择了错误的 `-task`。** `megablast`（默认）适用于高度相似的
   序列；跨物种搜索或搜索差异更大的命中时应使用 `blastn`，查询序列短于约 30 nt
   （引物、sgRNA）时应使用 `blastn-short`。`dc-megablast` 是用于
   物种间比较的非连续匹配选项。
3. **构建数据库时忘记使用 `-parse_seqids`。** 如果没有它，就无法使用
   `blastdbcmd -entry` 重新提取序列，而且 DIAMOND 也无法干净地复用
   序列 ID。除非重新构建数据库，否则之后无法补加该选项。
4. **为 DIAMOND 的 `-outfmt` 自定义列列表添加引号。** BLAST+ 要求将
   规格用引号括起来（`-outfmt '6 qseqid sseqid pident evalue'`）；**DIAMOND 要求
   不加引号**（`--outfmt 6 qseqid sseqid pident evalue`）。混淆这两种写法是一个
   常见且不会显式报错的错误。
5. **多线程。** 使用 `-num_threads N`。对于*大量小型查询*，设置
   `-mt_mode 1`（按查询拆分），以便让所有线程保持忙碌；`-mt_mode 0`（默认，
   按数据库卷拆分）适合少量大型查询。BLAST+ 2.15+ 可以自动选择，
   但不确定时应显式设置。

完整的选项参考、分类学范围限定和数据库准备详情：
[`references/blast_cli.md`](references/blast_cli.md)。

## 分类学范围限定

通过 NCBI taxid 将搜索范围限制在某些演化支内（或排除某些演化支）：

```bash
blastn -query q.fna -db nt -taxids 9606 -outfmt 6 -out human_only.tsv
blastp -query q.faa -db nr -negative_taxids 2 -outfmt 6 -out no_bacteria.tsv
```

按 taxid 限定范围需要支持分类学信息的数据库（构建/下载时包含
其 `*.taxid` 映射的数据库，例如 NCBI 预格式化的 `nt` / `nr`）。参见
[`references/blast_cli.md`](references/blast_cli.md#taxonomy)。

## DIAMOND——大型蛋白质搜索的快速方案

当针对数百万条蛋白质运行 `blastp` / `blastx` 速度过慢时，DIAMOND 可作为
蛋白质空间搜索的直接替代方案：

```bash
diamond makedb --in nr.faa -d nr_diamond
diamond blastp -d nr_diamond -q query.faa -o hits.tsv \
  --ultra-sensitive --outfmt 6 qseqid sseqid pident length evalue bitscore
```

灵敏度级别（快速 → 最灵敏）：`--fast`、`--mid-sensitive`、
`--sensitive`、`--more-sensitive`、`--very-sensitive`、`--ultra-sensitive`。
需要达到与 BLAST 相当的召回率时，请使用 `--ultra-sensitive`；默认的快速模式
以牺牲灵敏度换取速度。DIAMOND 的 `--outfmt 6` 与下方的
BLAST+ 表格解析器兼容。详情和权衡：
[`references/diamond.md`](references/diamond.md)。

## 推荐工作流程

1. **选择程序**：根据上方的查询序列/目标序列表进行选择。
2. **构建数据库**：使用 `makeblastdb -parse_seqids`（或下载预格式化的
   NCBI 数据库）。对于超过约 100 万条蛋白质序列的情况，改为构建 DIAMOND 数据库。
3. **执行搜索**：使用 `-outfmt 6`、明确的 `-evalue` 阈值、正确的
   `-task`（blastn）以及 `-num_threads`。如果需要限定分类范围，请添加 `-taxids`。
4. **解析与质量控制**：使用 `scripts/parse_blast_tab.py`——它会按 bitscore 排序、
   提取每个查询序列的最佳命中、应用一致性/覆盖度/e-value 筛选条件，并在
   列数看起来被截断时标记 `-max_target_seqs` 陷阱。
5. **检索**任意命中序列：使用
   `blastdbcmd -db mydb -entry <id>`（需要 `-parse_seqids`）。

## 报告前验证

- 确认 `blastn -version` / `diamond version` 确实已运行——绝不要报告并非由你实际生成的命中
  结果。
- 说明所用程序、`-task`、`-evalue` 和数据库；缺少这些信息，
  结果将毫无意义。
- 如果使用了 `-max_target_seqs`，请确认最佳命中是通过
  *事后按 bitscore 排序*选出的，而不是将保留数量当作 top-N 并直接采信。
- 对于 DIAMOND 结果，请注明所使用的灵敏度级别。

## 参考资料

- [`references/blast_cli.md`](references/blast_cli.md)——完整的 BLAST+ 2.17.0 选项
  参考：程序、`makeblastdb`、`-outfmt` 列、`-task`、分类范围
  限定、`-mt_mode`、使用 `blastdbcmd` 检索，以及 `-max_target_seqs` 注意事项。
- [`references/diamond.md`](references/diamond.md)——DIAMOND 数据库构建、灵敏度
  模式、输出格式，以及何时应选择它而不是 BLAST+。
- NCBI BLAST+ 手册：https://www.ncbi.nlm.nih.gov/books/NBK569856/
- DIAMOND：https://github.com/bbuchfink/diamond

AlterLab Academic Skills 套件的一部分。