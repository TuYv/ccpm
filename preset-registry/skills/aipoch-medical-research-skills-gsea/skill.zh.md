---
name: gsea
description: Run GSEA on a ranked gene list and produce the enrichment table, running-score table, and enrichment plots.
license: MIT
author: AIPOCH
---
> **来源**：[https://github.com/aipoch/medical-research-skills](https://github.com/aipoch/medical-research-skills)

## 何时读取外部文件

| 情况 | 读取 | 用途 |
|---|---|---|
| 需要算法细节 | `references/algorithm.md` | 统计方法和公式 |
| 需要运行分析 | `scripts/main.R` | 完整的命令参考 |
| 遇到错误 | `references/troubleshooting.md` | 查找错误代码和修复方法 |
| 需要 CLI 示例 | `references/cli-guide.md` | 完整的参数示例 |

## 适用范围

此技能适用于：
- 对按统计量排序的基因列表运行 GSEA
- 根据现有的 `enrichGSEA.csv` 和 `gsea_running_scores.csv` 生成富集曲线图
- 使用 `tests/data/sample_deg_results.csv` 对流程进行冒烟测试

此技能不适用于：
- 对原始表达矩阵进行差异表达分析
- 单样本 ssGSEA
- 网络分析或多组学整合

## 用法

分析模式：
`Rscript scripts/main.R --input tests/data/sample_deg_results.csv --outdir ./GSEA_analysis --type KEGG --species human --seed 42 --timeout 300`

绘图模式：
`Rscript scripts/main.R --running_file ./GSEA_analysis/Table/gsea_running_scores.csv --enrich_file ./GSEA_analysis/Table/enrichGSEA.csv --plot_output ./GSEA_analysis/plot/gsea_plot.pdf --top_n 5 --plot_format pdf --seed 42 --timeout 300`

更多信息请参阅 `references/cli-guide.md`。

模式选择：
- 仅传入 `--input` 时运行分析模式
- 同时传入 `--running_file` 和 `--enrich_file` 时运行绘图模式
- 如果同时提供两组参数，则优先使用绘图模式；分析模式将被跳过，并记录一条警告

## 参数

### 分析模式参数

| 短参数 | 长参数 | 类型 | 默认值 | 必需 | 说明 |
|---|---|---|---|---|---|
| `-i` | `--input` | character | `NULL` | 是 | 输入 CSV 文件 |
| `-o` | `--outdir` | character | `GSEA_analysis` | 否 | 输出目录 |
| `-g` | `--gene_col` | character | `name` | 否 | 基因列名称 |
| `-f` | `--fc_col` | character | `logFC` | 否 | 排序统计量列名称 |
| `-t` | `--type` | character | `KEGG` | 否 | 基因集类型：`KEGG`、`HALLMARKS`、`GO_BP`、`GO_MF`、`GO_CC`。使用预加载的 RDS 时，`HALLMARKS` 会自动映射到资源键 `Hallmarks` |
| `-s` | `--species` | character | `human` | 否 | 物种：`human`、`mouse`、`rat` |
| `-p` | `--pvalue_cutoff` | numeric | `0.05` | 否 | 显著性阈值 |
| `-m` | `--method` | character | `fgsea` | 否 | GSEA 后端：`fgsea` 或 `DOSE` |
| `-c` | `--chunk_size` | numeric | `1000` | 否 | 大型基因集转换的分块大小 |
| `-r` | `--rds_path` | character | `NULL` | 否 | 预存储基因集 RDS 的路径 |
| `-v` | `--verbose` | logical | `FALSE` | 否 | 详细日志记录 |
|  | `--seed` | integer | `42` | 否 | 随机种子 |
|  | `--timeout` | integer | `300` | 否 | 超时时间（秒）；`<=0` 表示禁用 |
| `-h` | `--help` | logical | `FALSE` | 否 | 显示帮助 |

### 绘图模式参数

| 短参数 | 长参数 | 类型 | 默认值 | 必需 | 说明 |
|---|---|---|---|---|---|
|  | `--running_file` | character | `NULL` | 是 | `gsea_running_scores.csv` 的路径 |
|  | `--enrich_file` | character | `NULL` | 是 | `enrichGSEA.csv` 的路径 |
|  | `--plot_output` | character | `gsea_plot.pdf` | 否 | 输出图路径 |
|  | `--plot_width` | numeric | `8` | 否 | 图宽度 |
|  | `--plot_height` | numeric | `6` | 否 | 图高度 |
|  | `--plot_format` | character | `pdf` | 否 | 输出格式：`pdf` 或 `png` |
|  | `--top_n` | numeric | `1` | 否 | 未指定 `geneSetID` 时要绘制的排名靠前的通路数量 |
|  | `--rank_by` | character | `p.adjust` | 否 | 用于通路排序的列 |
|  | `--geneSetID` | character | `""` | 否 | 以逗号分隔的通路 ID |
|  | `--plot_title` | character | `""` | 否 | 图标题 |
|  | `--colors` | character | `#4DBBD5,#E64B35,#00A087,#F39B7F,#3C5488,#8491B4` | 否 | 颜色列表 |
|  | `--base_size` | numeric | `11` | 否 | 基础字体大小 |
|  | `--subplots` | character | `1,2,3` | 否 | 要显示的子面板索引 |
|  | `--rel_heights` | character | `1.5,0.8,1` | 否 | 面板相对高度 |
|  | `--NES_table` | logical | `TRUE` | 否 | 显示 NES 注释 |
|  | `--no_NES_table` | logical | `FALSE` | 否 | 禁用 NES 注释 |
|  | `--NES_label_size` | numeric | `4` | 否 | NES 标签字体大小 |
|  | `--NES_label_x` | numeric | `0.75` | 否 | NES 标签的 x 位置 |
|  | `--NES_label_y` | numeric | `0.75` | 否 | NES 标签的 y 位置 |
|  | `--NES_label_color` | character | `black` | 否 | NES 标签颜色 |
|  | `--NES_label_hjust` | numeric | `0` | 否 | NES 标签水平对齐方式 |
|  | `--NES_label_vjust` | numeric | `1` | 否 | NES 标签垂直对齐方式 |
|  | `--line_width` | numeric | `1` | 否 | ES 线条宽度 |
|  | `--dot_size` | numeric | `1.2` | 否 | ES 点大小 |
|  | `--legend_position` | character | `auto` | 否 | 图例位置 |
|  | `--legend_x` | numeric | `0.02` | 否 | 内嵌图例的 x 坐标 |
|  | `--legend_y` | numeric | `0.02` | 否 | 内嵌图例的 y 坐标 |
|  | `--legend_just_x` | numeric | `0` | 否 | 图例水平对齐方式 |
|  | `--legend_just_y` | numeric | `0` | 否 | 图例垂直对齐方式 |
|  | `--legend_text_size` | numeric | `9` | 否 | 图例文本大小 |
|  | `--legend_key_size` | numeric | `0.6` | 否 | 图例键大小 |
|  | `--legend_bg_alpha` | numeric | `0` | 否 | 图例背景透明度 |
|  | `--grid_major_color` | character | `grey92` | 否 | 主网格线颜色 |
|  | `--grid_minor_color` | character | `grey92` | 否 | 次网格线颜色 |
|  | `--ylab_es` | character | `Enrichment Score` | 否 | ES 面板的 y 轴标题 |
|  | `--ylab_rank` | character | `Ranked List Metric` | 否 | 排名面板的 y 轴标题 |
|  | `--xlab_rank` | character | `Rank in Ordered Dataset` | 否 | 排名面板的 x 轴标题 |
|  | `--hit_height` | numeric | `1` | 否 | 命中条高度 |
|  | `--hit_gap` | numeric | `0` | 否 | 命中条间距 |
|  | `--hit_linewidth` | numeric | `0.5` | 否 | 命中条线宽 |
|  | `--rank_bar_alpha` | numeric | `0.9` | 否 | 排名条透明度 |
|  | `--rank_bar_height_ratio` | numeric | `0.3` | 否 | 排名条高度比例 |
|  | `--rank_metric_segment_color` | character | `grey` | 否 | 排名线颜色 |
|  | `--rank_metric_segment_width` | numeric | `0.3` | 否 | 排名线宽度 |
|  | `--rank_metric_segment_alpha` | numeric | `1` | 否 | 排名线透明度 |
|  | `--pvalue_table` | logical | `FALSE` | 否 | 显示 p 值表 |
|  | `--ES_geom` | character | `line` | 否 | ES 几何对象：`line` 或 `dot` |
|  | `--verbose` | logical | `FALSE` | 否 | 详细日志记录 |
|  | `--seed` | integer | `42` | 否 | 随机种子 |
|  | `--timeout` | integer | `300` | 否 | 超时时间（秒）；`<=0` 表示禁用 |
| `-h` | `--help` | logical | `FALSE` | 否 | 显示帮助 |

## 输入格式

分析模式的输入为 CSV，且至少包含：
- 基因列（默认名称为 `name`）
- 排名统计量列（默认名称为 `logFC`）

示例：
```csv
name,logFC,pvalue,padj
TP53,2.5,0.001,0.01
BRCA1,1.8,0.005,0.02
EGFR,-1.2,0.01,0.05
```

值约束：
- `type` 接受 `KEGG`、`HALLMARKS`、`GO_BP`、`GO_MF`、`GO_CC`
- 使用预加载的 RDS 时，`HALLMARKS` 会自动匹配到资源键 `Hallmarks`
- `species` 接受 `human`、`mouse`、`rat`

## 输出文件

| 文件 | 格式 | 说明 |
|---|---|---|
| `data/GSEA_list.rda` | RDA | 完整的 GSEA 结果对象 |
| `Table/enrichGSEA.csv` | CSV | 富集结果表 |
| `Table/gsea_running_scores.csv` | CSV | 运行分数表；如果没有富集结果通过筛选，仍会写入仅含表头的文件 |
| `plot/` | 目录 | 图表输出目录 |
| `session_info.txt` | TXT | R 版本和软件包版本 |

`enrichGSEA.csv` 主要包含：`ID`、`Description`、`NES`、`pvalue`、`p.adjust`、`core_enrichment`。

## 错误处理

常见错误代码：
- `SKILL_FILE_NOT_FOUND`：输入文件不存在
- `SKILL_MISSING_COLUMNS`：缺少必需的列
- `SKILL_EMPTY_DATA`：输入为空，或筛选后为空
- `SKILL_INVALID_PARAMETER`：参数值无效
- `SKILL_PACKAGE_NOT_FOUND`：未安装必需的软件包
- `SKILL_ANALYSIS_FAILED`：重试后 GSEA 仍然失败

故障排查文档：`references/troubleshooting.md`

退出代码：
- `0`：成功
- `1`：失败

## 测试

最小测试数据集：`tests/data/sample_deg_results.csv`

最小命令：
`Rscript scripts/main.R --input tests/data/sample_deg_results.csv --outdir ./test_output --type KEGG --species human --seed 42 --timeout 300 --verbose`

预期输出：
- `./test_output/data/GSEA_list.rda`
- `./test_output/Table/enrichGSEA.csv`
- `./test_output/Table/gsea_running_scores.csv`
- `./test_output/session_info.txt`
- 如果未发现显著富集结果，仍会写入 `gsea_running_scores.csv`，但其中仅包含表头
- 退出代码 `0`