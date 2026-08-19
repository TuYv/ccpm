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

## 使用时机

任何坐标跨越边界时：两个文件格式之间、两个工具之间、两个组装版本之间，或基因组与转录本之间。

## 规则

**一个坐标包含三个事实，而不是一个：数值、该数值所采用的书写约定，以及测量所依据的组装版本。** 三者缺一不可，否则这个数值就无法解释。

坐标错误是基因组学中最不易察觉的一类错误。存在差一错误的 BED 文件仍然可以解析、排序和求交集，不会报错。将基于 GRCh37 的 VCF 与 GRCh38 的注释进行连接，仍然会返回行。发生右移的 indel 只会无法匹配 ClinVar 中的对应条目，结果就是把一个变异报告为新变异。整个过程不会抛出任何错误；只是答案错了，而且错得很像真的。

因此：请根据表格进行转换，不要凭记忆，并且只要有参考序列可用，就对照参考序列进行验证。

## 两种转换

```
1-based inclusive  ->  0-based half-open :  start - 1,  end
0-based half-open  ->  1-based inclusive :  start + 1,  end
```

终止坐标永远不会移动。如果一次转换同时改变了两个数值，那就是错的。

## 各格式分别属于哪一种

| 0-based, half-open | 1-based, inclusive |
| --- | --- |
| BED、bedGraph、bigWig、narrowPeak | GFF3、GTF、VCF |
| BAM/CRAM（二进制 POS） | SAM（文本 POS） |
| PSL、genePred、refFlat | WIG、Picard interval_list |
| MAF（UCSC 多序列比对） | MAF（TCGA 突变注释） |
| PyRanges、pybedtools | GRanges/IRanges、samtools、UCSC 和 Ensembl 区域字符串 |

两种“MAF”格式都存在，它们表示不同的含义，而且彼此不一致。UCSC 通过 1-based 的浏览器输入框提供 0-based 文件。`references/format-conventions.md` 中有包含各格式详细信息的完整表格。

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

零长度 BED 特征（`chromStart == chromEnd`，表示一个合法的插入点）会被报告为 `unrepresentable`，而不会被转换为 `end = start - 1`。当存在任何退化或无效区间时，退出代码为 1。

## 变异不是区间

对于 indel，VCF 的 `POS` 是**锚定碱基**——即事件*之前*的碱基，该碱基本身保持不变。同一个变化也可以有多种写法：`chr1:7:CAC:C`、`chr1:3:CAC:C` 和 `chr1:2:GCA:G` 实际上是同一个缺失。未进行规范化就连接、去重或查询变异，会悄无声息地丢失真实匹配；而且这种丢失在 indel 集中的重复序列中尤其常见。

在进行任何比较之前，先进行规范化——裁剪至最简表示，然后根据参考序列向左对齐：

```bash
python3 normalize_variant.py --fasta ref.fa chr1 7 CAC C
python3 normalize_variant.py --fasta ref.fa --split --input cohort.vcf
python3 normalize_variant.py --fasta ref.fa --compare chr1:7:CAC:C chr1:2:GCA:G
```

```
input         normalized    type      pos_shift  ref_check  changed
chr1:7:CAC:C  chr1:2:GCA:G  deletion  5          ok         yes
```

每条记录的 `REF` 都会先与 FASTA 进行比对。`MISMATCH` 表示变异与参考序列属于不同的组装版本——请停止操作并运行
`check_contigs.py`，不要调整坐标。多等位基因记录必须在标准化**之前**使用
`--split` 拆分，绝不能在标准化之后拆分。

HGVS 会沿转录本向 3' 端移动 indel。对于负链基因，这与 VCF 的左对齐方向在基因组上相反。详细信息和完整流程请参阅：`references/variant-representation.md`。

## 在信任连接结果之前检查组装版本

```bash
python3 check_contigs.py --identify unknown.fa.fai
python3 check_contigs.py variants.vcf annotation.gtf --genome GRCh38.fa.fai
```

```
file          kind    contigs  naming        assembly  detail
ref.fa.fai    sizes   25       plain         GRCh37    24/24 primary chromosome lengths match;
                                                       chrM is 16569 bp, i.e. GRCh37/38 (rCRS MT)
```

该脚本会读取 `.fai`、`.chrom.sizes`、VCF headers、SAM headers、FASTA、BED
和 GTF/GFF，根据 primary-chromosome lengths 识别组装版本，并报告两个文件进行连接时可能出错的每个原因：命名不匹配、长度冲突、坐标超出 contig 末端、仅存在于其中一个文件的 contigs。出现任何不兼容情况时，退出代码为 1。

**GRCh37 和 hg19 的差异仅在于线粒体**——16,569 bp（rCRS）与
16,571 bp。核基因组坐标相同，因此混用的流程可以正常运行，只有 mtDNA 结果会出错。`check_contigs.py` 会报告它识别到的是哪一个版本。
关于 builds、命名方案、ALT contigs 以及 liftover 陷阱，请参阅：
`references/reference-builds.md`。

## 根据文件自身的格式审计文件

```bash
python3 audit_intervals.py peaks.bed
python3 audit_intervals.py gencode.gtf --genome hg38.chrom.sizes
python3 audit_intervals.py cohort.vcf --genome GRCh38.fa.fai
```

该命令会查找坐标错误留下的证据：

| Finding | What it proves |
| --- | --- |
| GFF/GTF 中的 `start_below_one` | 0-based 数据被写入 1-based 文件；所有内容都向左偏移了一个碱基 |
| BED 中的 `many_zero_length` | 1-based 的单碱基 feature 被写入 0-based 文件 |
| `past_contig_end` | 组装版本错误，或 contig 边界处存在 off-by-one 错误 |
| `mixed_contig_naming` | 任何连接都会静默地匹配其中一个子集 |
| `first_block_offset` | BED12 的 `blockStarts` 被写成了绝对坐标 |
| `not_parsimonious` | 未裁剪的等位基因；连接前应先进行标准化 |
| `bad_alt_allele` | VCF 中使用了 Ensembl/VEP 的 `-` 表示法，而 VCF 没有 anchor base |

出现任何致命发现时，退出代码为 1，因此它可以作为数据目录的 CI gate。

## 转录本、CDS 和蛋白质位置

`c.742` 和 `chr17:7,674,220` 都是“position”，但二者不能通过算术相互转换。转录本坐标按照转录顺序计算经过剪接的碱基——在负链上对应递减的基因组坐标——而 `c.1` 是起始
`ATG` 中的 `A`，并不是转录本的起点。

容易被误记的规则：不存在 `c.0`；5' UTR 的位置为负数，而 3' UTR 的位置使用 `*`；GFF phase 表示为了到达下一个密码子需要*移除*的碱基数，而不是 `start % 3`；此外，如果没有带版本号的转录本 accession，`c.` 描述没有意义，因为同一变异在不同转录本中的编号各不相同。`references/transcript-coordinates.md` 包含转换流程和边界情况。

请使用包含转录本模型的工具进行转换，例如 VEP、`bcftools csq`、Mutalyzer、`hgvs` package，而不要手动转换。

## 报告结果

每次都要在坐标旁注明组装版本。`chr7:5,530,601-5,530,625` 不是一个位置；`chr7:5,530,601-5,530,625 (GRCh38)` 才是。说明坐标列采用的约定，将其写在列标题或文件文档中。如果转换得出了结果，请说明转换的方向。

## 参考资料

- `references/format-conventions.md` — 每种格式所采用的约定，以及各格式的详细信息、BED12 区块规则、区域字符串语法和工具行为。
- `references/variant-representation.md` — VCF 等位基因约定、规范化算法、等价性检查、多等位基因拆分，以及 HGVS 与 VCF 存在差异的方式。
- `references/reference-builds.md` — 组装版本特征、GRCh37 与 hg19、ALT contigs、命名方案和 liftover 失败模式。
- `references/transcript-coordinates.md` — 基因组 ↔ 转录本 ↔ CDS ↔ 蛋白质、HGVS 编号、phase 和转录本选择。