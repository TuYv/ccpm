---
name: genomic-coordinates
description: Convert genomic intervals between coordinate conventions, normalise and compare variant representations, and detect assembly or contig-naming mismatches before they corrupt an analysis. Use whenever coordinates cross a format, tool, or assembly boundary - converting between BED, GFF/GTF, VCF, SAM/BAM, WIG, PSL, genePred, Picard interval_list, or region strings; reconciling 0-based half-open with 1-based inclusive; left-aligning or trimming indels; checking whether two variant records describe the same change; mapping genomic to transcript, CDS, or protein positions; auditing a BED/GTF/VCF for convention violations; or diagnosing GRCh37 vs hg19 vs GRCh38 vs T2T, chr-prefix, and liftover problems. Triggers include "off by one", "0-based", "1-based", "half-open", "coordinate system", "left-align", "normalize variant", "bcftools norm", "chr prefix", "wrong genome build", "liftover", "REF mismatch", and "HGVS".
license: MIT
compatibility: Requires Python 3.11+. Scripts use only the standard library - no third-party packages and no network access. Variant normalisation needs a reference FASTA, and uses its .fai index when one is present.
allowed-tools: Read Write Edit Bash
metadata:
  version: "1.0"
  skill-author: K-Dense Inc.
---
# 基因组坐标

## 何时使用

任何坐标跨越边界时：两个文件格式之间、两个工具之间、两个组装版本之间，或基因组与转录本之间。

## 规则

**一个坐标包含三个事实，而不是一个：数值、写入时所采用的约定，以及测量所依据的组装版本。** 三者缺一不可，否则这个数值就无法解释。

坐标错误是基因组学中最隐蔽的一类错误。存在偏移一位的 BED 文件仍然可以解析、排序和求交集，且不会产生任何提示。将 GRCh37 的 VCF 与 GRCh38 的注释连接仍然会返回行。一个向右偏移的 indel 只会无法匹配 ClinVar 中的对应条目，结果就是将一个变异报告为新的变异。整个过程不会引发错误；只是答案错了，而且错得看起来很合理。

因此：按照表格进行转换，不要凭记忆，并且只要有参考序列可用，就要对照参考序列进行验证。

## 两种转换

```
1-based inclusive  ->  0-based half-open :  start - 1,  end
0-based half-open  ->  1-based inclusive :  start + 1,  end
```

结束坐标永远不会移动。如果转换同时改变了两个数值，那就是错误的。

## 各格式分别属于哪一种

| 0-based, half-open | 1-based, inclusive |
| --- | --- |
| BED, bedGraph, bigWig, narrowPeak | GFF3, GTF, VCF |
| BAM/CRAM (binary POS) | SAM (text POS) |
| PSL, genePred, refFlat | WIG, Picard interval_list |
| MAF (UCSC multiple alignment) | MAF (TCGA mutation annotation) |
| PyRanges, pybedtools | GRanges/IRanges, samtools & UCSC & Ensembl region strings |

两种“MAF”格式都存在，它们含义不同，而且彼此不一致。UCSC 通过 1-based 浏览器输入框提供 0-based 文件。`references/format-conventions.md` 中有包含各格式详细信息的完整表格。

```bash
cd skills/genomic-coordinates/scripts

python3 convert_coords.py --list                          # the table
python3 convert_coords.py --from bed --to gff chr1 999 1000
python3 convert_coords.py --from ucsc --to bed "chr7:5,530,601-5,530,625"
python3 convert_coords.py --from granges --to pyranges --input regions.tsv
```

```
contig  input                 output           length  status  detail
chr7    chr7:5530601-5530625  5530600-5530625  25      ok
```

零长度 BED feature（`chromStart == chromEnd`，合法的插入点）会被报告为 `unrepresentable`，而不是转换为 `end = start - 1`。当任意区间退化或无效时，退出代码为 1。

## 变异不是区间

对于 indel，VCF 的 `POS` 是**锚定碱基**——事件*之前*的碱基，且该碱基本身未发生改变。同一个变化也可以有多种写法：
`chr1:7:CAC:C`、`chr1:3:CAC:C` 和 `chr1:2:GCA:G` 实际上是同一个缺失。在规范化之前连接、去重或查找变异，会静默地丢失真实匹配；而且这种丢失在重复序列中尤为常见，因为 indel 集中于这些区域。

在进行任何比较之前先进行规范化——先裁剪至最简表示，然后依据参考序列向左对齐：

```bash
python3 normalize_variant.py --fasta ref.fa chr1 7 CAC C
python3 normalize_variant.py --fasta ref.fa --split --input cohort.vcf
python3 normalize_variant.py --fasta ref.fa --compare chr1:7:CAC:C chr1:2:GCA:G
```

```
input         normalized    type      pos_shift  ref_check  changed
chr1:7:CAC:C  chr1:2:GCA:G  deletion  5          ok         yes
```

每条记录的 `REF` 都会先与 FASTA 进行核对。`MISMATCH` 表示变异与参考序列属于不同的组装版本——请停止操作并运行
`check_contigs.py`，而不是调整坐标。多等位基因记录必须在标准化**之前**使用 `--split` 拆分，绝不能在之后拆分。

HGVS 会沿转录本向 3' 端移动 indel。对于负链基因，这与 VCF 的左对齐方向在基因组上相反。详细信息和完整流程请参阅：`references/variant-representation.md`。

## 在信任连接之前检查组装版本

```bash
python3 check_contigs.py --identify unknown.fa.fai
python3 check_contigs.py variants.vcf annotation.gtf --genome GRCh38.fa.fai
```

```
file          kind    contigs  naming        assembly  detail
ref.fa.fai    sizes   25       plain         GRCh37    24/24 primary chromosome lengths match;
                                                       chrM is 16569 bp, i.e. GRCh37/38 (rCRS MT)
```

该脚本读取 `.fai`、`.chrom.sizes`、VCF 标头、SAM 标头、FASTA、BED 和 GTF/GFF，根据主染色体长度识别组装版本，并报告两个文件之间的连接可能出错的所有原因：命名不匹配、长度冲突、坐标超出 contig 末端、仅存在于其中一个文件的 contig。出现任何不兼容时退出码为 1。

**GRCh37 和 hg19 的差异仅在于线粒体**——16,569 bp（rCRS）对比 16,571 bp。核基因组坐标完全相同，因此混用的流程可以正常运行，只有 mtDNA 结果会出错。`check_contigs.py` 会报告它识别到的是哪一个版本。关于构建版本、命名方案、ALT contig 以及 liftover 陷阱，请参阅：
`references/reference-builds.md`。

## 根据文件自身格式审计文件

```bash
python3 audit_intervals.py peaks.bed
python3 audit_intervals.py gencode.gtf --genome hg38.chrom.sizes
python3 audit_intervals.py cohort.vcf --genome GRCh38.fa.fai
```

查找坐标错误留下的证据：

| Finding | What it proves |
| --- | --- |
| `start_below_one` in GFF/GTF | 1-based 文件中的 0-based 数据；所有内容都向左偏移一个碱基 |
| `many_zero_length` in BED | 写入 0-based 文件中的 1-based 单碱基特征 |
| `past_contig_end` | 错误的组装版本，或 contig 边界处的 off-by-one |
| `mixed_contig_naming` | 任何连接都会静默匹配其中一个子集 |
| `first_block_offset` | 将 BED12 的 `blockStarts` 写成了绝对坐标 |
| `not_parsimonious` | 未进行修剪的等位基因；连接前应先标准化 |
| `bad_alt_allele` | VCF 中使用了 Ensembl/VEP 的 `-` 表示法，而 VCF 没有锚定碱基 |

出现任何致命发现时退出码为 1，因此它可以作为数据目录的 CI 门禁。

## 转录本、CDS 和蛋白质位置

`c.742` 和 `chr17:7,674,220` 都是“位置”，但二者不能通过算术相互转换。转录本坐标按照转录顺序统计剪接后的碱基——在负链上即为递减的基因组坐标——而 `c.1` 是起始 `ATG` 中的 `A`，并不是转录本的起点。

容易记错的规则：不存在 `c.0`；5' UTR 位置为负数，3' UTR 位置使用 `*`；GFF phase 是为到达下一个密码子而需要*移除*的碱基数，而不是 `start % 3`；此外，如果没有带版本号的转录本 accession，`c.` 描述就没有意义，因为同一个变异在不同转录本中的编号各不相同。`references/transcript-coordinates.md` 包含转换流程和边界情况。

使用持有转录本模型的工具进行转换，例如 VEP、`bcftools csq`、Mutalyzer、`hgvs` 包，不要手动转换。

## 报告结果

每次都要在坐标旁注明组装版本。
`chr7:5,530,601-5,530,625` 不是一个位置；`chr7:5,530,601-5,530,625 (GRCh38)` 才是。说明坐标列采用哪种约定，可以写在列标题中或文件文档里。如果转换得出了结果，要说明转换的方向。

## 参考资料

- `references/format-conventions.md` — 每种格式的约定，以及各格式的详细信息、BED12 区块规则、区域字符串语法和工具行为。
- `references/variant-representation.md` — VCF 等位基因约定、规范化算法、等价性检查、多等位基因拆分，以及 HGVS 与 VCF 存在差异的方式。
- `references/reference-builds.md` — 组装版本特征、GRCh37 与 hg19、ALT contig、命名方案和 liftover 失败模式。
- `references/transcript-coordinates.md` — 基因组 ↔ 转录本 ↔ CDS ↔ 蛋白质、HGVS 编号、phase 和转录本选择。