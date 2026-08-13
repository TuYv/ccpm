---
name: gokegg-analysis
description: Use when performing GO and KEGG enrichment on a gene list from bulk RNA-seq or microarray studies, then generating a combined GO/KEGG dot chart. NOT for single-cell RNA-seq, methylation data, or non-expression data.
license: MIT
author: AIPOCH
---
> **来源**：[https://github.com/aipoch/medical-research-skills](https://github.com/aipoch/medical-research-skills)

## 何时读取外部文件

| 情况 | 要读取的文件 | 目的 |
|---|---|---|
| 需要算法详情 | `references/algorithm.md` | 统计方法和公式 |
| 需要运行分析 | `scripts/main.R` | 完整的执行命令 |
| 遇到错误 | `references/troubleshooting.md` | 故障排除指南 |
| 需要 CLI 示例 | `references/cli-guide.md` | 参数用法示例 |

## 何时使用

此技能适用于：
- 对来自批量 RNA-seq 或微阵列研究的基因列表进行 GO 和 KEGG 富集分析
- 支持的基因 ID 类型：`SYMBOL`、`ENSEMBL`、`ENTREZID`
- 支持的物种数据库：`org.Hs.eg.db`、`org.Mm.eg.db`、`org.Rn.eg.db`

此技能不适用于：
- 单细胞 RNA-seq 分析
- 甲基化、蛋白质组学或非表达组学工作流
- 从原始计数矩阵进行差异表达检验

## 用法

主要分析和绘图：
`Rscript scripts/main.R --feature "TP53,EGFR,BRCA1,MYC" --output_dir ./output --sp org.Hs.eg.db --gene_type SYMBOL --pvalue_cutoff 0.05 --qvalue_cutoff 0.2 --pAdjustMethod BH --seed 66 --go_top_n 3 --kegg_top_n 3 --format pdf`

注意：
- `scripts/main.R` 是唯一的命令行入口点
- `scripts/dochart.R` 当前提供绘图函数，并由 `scripts/main.R` 加载
- 如果省略 `--go_input`、`--kegg_input` 或 `--outdir`，`main.R` 将自动使用 `output_dir/temp/GO_list.rda`、`output_dir/temp/KEGG_list.rda` 和 `output_dir/plot`

## Agent 输出

成功时，Agent 应报告：
- GO 富集分析是否成功完成
- KEGG 富集分析是否成功完成
- 修剪和解析后的标准化输入基因数量
- 主输出目录
- 生成的文件，尤其是 `GO_df.csv`、`KEGG_df.csv`、`GO_list.rda`、`KEGG_list.rda` 和组合点图
- `session_info.txt` 的路径

运行后检查清单：
- 使用文档中说明的分隔符规则重新解析原始 `--feature` 字符串，并报告修剪后的去重基因数量
- 在宣告 GO 成功前检查 `temp/GO_df.csv` 和 `temp/GO_list.rda`
- 在宣告 KEGG 成功前检查 `temp/KEGG_df.csv` 和 `temp/KEGG_list.rda`
- 在宣告完全成功前检查 `plot/gokegg_dot_chart.<format>`、`plot/gokegg_dot_chart_data.csv`、`plot/gokegg_dot_chart_data.rda` 和 `session_info.txt`
- 使用以下信息总结最终结果：解析后的基因数量、GO 状态、KEGG 状态、绘图状态、输出目录和关键输出文件

失败时，Agent 应报告：
- 确切的 `SKILL_*` 错误代码
- 失败的步骤，例如基因解析、ID 转换、富集分析或绘图
- 可执行的后续步骤，例如修正输入 ID、检查缺失的软件包或重新生成 `.rda` 文件

## 参数参考

### `scripts/main.R`

| 短参数 | 长参数 | 类型 | 默认值 | 必需 | 说明 |
|---|---|---|---|---|---|
| `-f` | `--feature` | 字符型 | `""` | 是 | 以英文逗号、中文逗号、分号、制表符或换行符分隔的基因列表 |
| `-o` | `--output_dir` | 字符型 | `./output/` | 否 | 主输出目录 |
| `-s` | `--sp` | 字符型 | `org.Hs.eg.db` | 否 | 物种数据库 |
| `-g` | `--gene_type` | 字符型 | `SYMBOL` | 否 | 输入基因 ID 类型 |
| `-p` | `--pvalue_cutoff` | 数值型 | `0.05` | 否 | 富集分析 p 值阈值 |
| `-q` | `--qvalue_cutoff` | 数值型 | `0.2` | 否 | 富集分析 q 值阈值 |
| `-m` | `--pAdjustMethod` | 字符型 | `BH` | 否 | P 值校正方法 |
|  | `--seed` | 整数型 | `66` | 否 | 随机种子 |
|  | `--go_input` | 字符型 | `NULL` | 否 | 可选的 GO `.rda`；默认为 `output_dir/temp/GO_list.rda` |
|  | `--kegg_input` | 字符型 | `NULL` | 否 | 可选的 KEGG `.rda`；默认为 `output_dir/temp/KEGG_list.rda` |
|  | `--outdir` | 字符型 | `NULL` | 否 | 绘图输出目录；默认为 `output_dir/plot` |
|  | `--go_top_n` | 数值型 | `3` | 否 | 每个本体中排名靠前的 GO 条目数量 |
|  | `--kegg_top_n` | 数值型 | `3` | 否 | 排名靠前的 KEGG 通路数量 |
| `-w` | `--width` | 数值型 | `20` | 否 | 绘图宽度，单位为厘米 |
|  | `--height` | 数值型 | `16` | 否 | 绘图高度，单位为厘米 |
|  | `--format` | 字符型 | `pdf` | 否 | 绘图格式：`pdf`、`png`、`svg` |
|  | `--dpi` | 数值型 | `300` | 否 | 栅格输出的 DPI |
| `-c` | `--colors` | 字符型 | `#E41A1C,#FFFF33,#2E86AB,#4DAF4A` | 否 | `GO:BP,GO:CC,GO:MF,KEGG` 的颜色 |
|  | `--title` | 字符型 | `GO + KEGG Dot Chart` | 否 | 绘图标题 |
|  | `--xlab` | 字符型 | `NULL` | 否 | 覆盖横轴标签 |
|  | `--ylab` | 字符型 | `NULL` | 否 | 覆盖纵轴标签 |
|  | `--dot_size` | 数值型 | `4.5` | 否 | 点大小 |
|  | `--shape` | 数值型 | `19` | 否 | 点形状 |
|  | `--rotate` / `--no-rotate` | 逻辑标志 | `TRUE` | 否 | 开启或关闭绘图方向旋转 |
|  | `--sorting` | 字符型 | `descending` | 否 | 点的排序顺序 |
|  | `--label_width` | 数值型 | `35` | 否 | 标签换行宽度 |
|  | `--title_size` | 数值型 | `12` | 否 | 标题字体大小 |
|  | `--axis_title_size` | 数值型 | `9` | 否 | 坐标轴标题字体大小 |
|  | `--axis_text_size` | 数值型 | `8` | 否 | 坐标轴文本字体大小 |
|  | `--legend_title_size` | 数值型 | `8` | 否 | 图例标题字体大小 |
|  | `--legend_text_size` | 数值型 | `7` | 否 | 图例文本字体大小 |
|  | `--legend_position` | 字符型 | `top` | 否 | 图例位置 |
|  | `--plot_margin` | 字符型 | `10,10,10,10` | 否 | 绘图边距：上、右、下、左 |
|  | `--axis_line_size` | 数值型 | `0.5` | 否 | 坐标轴线宽度 |
|  | `--axis_ticks_size` | 数值型 | `0.5` | 否 | 坐标轴刻度线宽度 |
|  | `--show_grid` | 逻辑型 | `FALSE` | 否 | 显示网格线 |
| `-v` | `--verbose` | 逻辑型 | `FALSE` | 否 | 启用详细日志 |

## 输入格式

### 主要分析输入
- `--feature` 应以基因列表的形式提供
- 首选分隔符：逗号
- 同样支持中文逗号、分号、制表符和换行符
- 每个基因前后的空格会通过修剪自动移除
- 基因 ID 类型必须与 `--gene_type` 匹配
- `--sp` 仅支持 `org.Hs.eg.db`、`org.Mm.eg.db` 和 `org.Rn.eg.db`

示例：
`TP53,EGFR,BRCA1,MYC`

`TP53, EGFR, BRCA1, MYC`

`TP53；EGFR；BRCA1；MYC`

`TP53\nEGFR\nBRCA1\nMYC`

使用最少输入的示例命令：
`Rscript scripts/main.R --feature "TP53,EGFR,BRCA1,MYC" --output_dir ./example_output --sp org.Hs.eg.db --gene_type SYMBOL`

使用自定义绘图参数的示例命令：
`Rscript scripts/main.R --feature "TP53,EGFR,BRCA1,MYC" --output_dir ./example_plot_output --sp org.Hs.eg.db --gene_type SYMBOL --go_top_n 5 --kegg_top_n 8 --colors "#E41A1C,#FFFF33,#2E86AB,#4DAF4A" --title "Custom GO + KEGG Dot Chart" --xlab="-log10(adjusted p-value)" --ylab="Enriched Terms" --width 24 --height 18 --label_width 40 --format png --dpi 300 --no-rotate --verbose`

注意：传递给 `--xlab` 或 `--ylab` 且以 `-` 开头的值应使用 `--option=value` 语法，以避免被解析为标志。

注意：仅当分隔符变体在单个 `--feature` 参数值内传递时才受支持。

### 绘图输入
- 绘图由 `scripts/main.R` 触发
- `--go_input`：可选的 `.rda` 文件，其中包含一个 `GO_list` 对象
- `--kegg_input`：可选的 `.rda` 文件，其中包含一个 `KEGG_list` 对象
- 如果未提供，`main.R` 将使用 `output_dir/temp` 下新生成的文件
- 绘图要求结果表至少包含 `Description` 和 `p.adjust`

## 输出文件

| 文件名 | 格式 | 描述 |
|---|---|---|
| `temp/GO_df.csv` | CSV | GO 富集结果表 |
| `temp/GO_list.rda` | RDA | 完整的 GO 富集对象 |
| `temp/KEGG_df.csv` | CSV | KEGG 富集结果表 |
| `temp/KEGG_list.rda` | RDA | 完整的 KEGG 富集对象 |
| `plot/gokegg_dot_chart.pdf` 等 | PDF/PNG/SVG | GO/KEGG 组合点图 |
| `plot/gokegg_dot_chart_data.csv` | CSV | 用于生成图形的组合绘图表 |
| `plot/gokegg_dot_chart_data.rda` | RDA | 包含绘图数据和参数的绘图包 |
| `session_info.txt` | TXT | 运行时会话信息 |

## 错误处理

常见错误代码及修复方法：
- `SKILL_FILE_NOT_FOUND`：输入文件不存在；请检查路径和权限
- `SKILL_FILE_FORMAT_ERROR`：无法读取 `.rda` 或文件格式错误；请重新生成上游结果
- `SKILL_MISSING_COLUMNS`：结果表缺少 `Description` 或 `p.adjust`
- `SKILL_EMPTY_DATA`：输入基因解析后为空、无法转换，或富集结果为空
- `SKILL_INVALID_PARAMETER`：缺少必需参数、物种不受支持或颜色数量不足
- `SKILL_PACKAGE_NOT_FOUND`：未安装必需的软件包
- `SKILL_ANALYSIS_FAILED`：内部 GO/KEGG 富集失败；请检查 `gene_type`、`sp` 和输入基因

有关详细的故障排除信息，请阅读 `references/troubleshooting.md`。

## 测试

最小测试数据集：直接使用一个较小的内置基因列表，无需任何额外文件。

冒烟测试命令：
`Rscript scripts/main.R --feature "TP53,EGFR,BRCA1,MYC" --output_dir ./test_output --sp org.Hs.eg.db --gene_type SYMBOL --pvalue_cutoff 0.05 --qvalue_cutoff 0.2 --pAdjustMethod BH --seed 66 --go_top_n 3 --kegg_top_n 3 --format pdf --verbose`

预期的冒烟测试输出：
- `./test_output/temp/GO_list.rda`
- `./test_output/temp/KEGG_list.rda`
- `./test_output/temp/GO_df.csv`
- `./test_output/temp/KEGG_df.csv`
- `./test_output/plot/gokegg_dot_chart.pdf`
- `./test_output/plot/gokegg_dot_chart_data.csv`
- `./test_output/plot/gokegg_dot_chart_data.rda`
- `./test_output/session_info.txt`
- 退出状态码 `0`

自动化回归脚本：
`Rscript test/test_regressions.R`

回归脚本涵盖：
- 使用英文逗号、中文分号、换行符、制表符和混合分隔符进行分隔符解析
- 解析后基因列表为空时的处理
- 无效 `--plot_margin` 的验证
- 缺少 GO/KEGG 输入时的绘图输入验证

用于手动进行 CLI 验证的分隔符示例：
`Rscript scripts/main.R --feature "TP53,EGFR,BRCA1,MYC" --output_dir ./test_sep_comma`
`Rscript scripts/main.R --feature "TP53；EGFR；BRCA1；MYC" --output_dir ./test_sep_cn_semicolon`
`Rscript scripts/main.R --feature $'TP53\nEGFR\nBRCA1\nMYC' --output_dir ./test_sep_newline`
`Rscript scripts/main.R --feature $'TP53\tEGFR\tBRCA1\tMYC' --output_dir ./test_sep_tab`
`Rscript scripts/main.R --feature $'TP53； EGFR, BRCA1	MYC' --output_dir ./test_sep_mixed`

注意：所有分隔符都必须包含在同一个 `--feature` 参数值中传递。