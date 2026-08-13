---
name: ppi-network-analysis
description: Use when you need a standardized R CLI workflow to build a protein-protein interaction network from a local gene list and an offline STRING cache, export node and edge tables, and render a reproducible PDF network plot. NOT for online API fetching, arbitrary graph databases, multi-omics integration, or non-STRING interaction sources.
license: MIT
author: AIPOCH
---
> **来源**：[https://github.com/aipoch/medical-research-skills](https://github.com/aipoch/medical-research-skills)

# PPI 网络分析

## 何时读取外部文件

| 情况 | 要读取的文件 | 用途 |
|-----------|--------------|---------|
| 需要算法细节 | `references/algorithm.md` | 解释本地 STRING 映射、相互作用筛选、网络指标和图表解读 |
| 需要执行分析 | `scripts/main.R` | 使用完整的 `Rscript` 命令运行 CLI 入口点 |
| 遇到错误 | `references/troubleshooting.md` | 将标准化错误代码映射到原因及修复方法 |
| 需要 CLI 示例或基本用法 | `references/cli-guide.md` | 查看安装说明、离线缓存要求和可运行示例 |
| 需要可运行的冒烟测试 | `tests/data/` | 使用随附的小型基因列表进行验证 |

## 用法

```bash
Rscript scripts/main.R \
  --genelist_file ./input/gene_list.csv \
  --species human \
  --threshold 700 \
  --output_dir output/basic-run \
  --seed 42 \
  --timeout_seconds 600
```

```bash
Rscript scripts/main.R \
  --plot_only TRUE \
  --output_dir output/basic-run \
  --seed 42 \
  --timeout_seconds 600
```

## 参数

| 短参数 | 长参数 | 类型 | 默认值 | 必需 | 说明 |
|-------|------|------|---------|----------|-------------|
| `-g` | `--genelist_file` | character | none | 是，除非使用 `--plot_only TRUE` | CSV、TSV、TXT 或 XLSX 格式的基因列表文件 |
| `-s` | `--species` | character | none | 是，除非使用 `--plot_only TRUE` | 物种：`human`、`mouse`、`9606` 或 `10090` |
| `-t` | `--threshold` | integer | none | 是，除非使用 `--plot_only TRUE` | STRING 综合评分阈值，范围为 `400` 到 `1000` |
| `-o` | `--output_dir` | character | `output` | 否 | Skill 根目录内的输出目录 |
| `-p` | `--plot_only` | logical | `FALSE` | 否 | 复用 `output_dir/data/ppi_result.rds` 并重新生成网络图 |
| `-d` | `--seed` | integer | `42` | 否 | 用于确保布局可复现的随机种子 |
| `-u` | `--timeout_seconds` | integer | `600` | 否 | 运行时间限制，单位为秒 |
|  | `--string_cache_dir` | character | `references/string_cache` | 否 | 本地 STRING 缓存目录；如果省略，则使用 Skill 内随附的缓存 |
|  | `--string_version` | character | `auto` | 否 | 首选 STRING 缓存版本；可用时使用 `auto`、`v11.5` 或 `v12.0` |
|  | `--figure_family` | character | `sans` | 否 | PDF 字体族：`sans`、`serif` 或 `mono` |
|  | `--figure_width` | numeric | `12` | 否 | 图表宽度，单位为英寸 |
|  | `--figure_height` | numeric | `10` | 否 | 图表高度，单位为英寸 |
|  | `--label` | character | `node` | 否 | 标签模式：`node` 或 `none` |
|  | `--label_size` | numeric | `0.8` | 否 | 标签大小 |
|  | `--label_color` | character | `black` | 否 | 标签颜色 |
|  | `--label_dist` | numeric | `0` | 否 | 标签与节点中心之间的距离 |
|  | `--line_alpha` | numeric | `1` | 否 | 边的透明度 |
|  | `--line_color` | character | 内置调色板 | 否 | 以逗号分隔的边颜色 |
|  | `--line_size` | numeric | `0.8` | 否 | 边的基础宽度 |
|  | `--line_type` | character | `solid` | 否 | 边的线型；绘图支持的值为 `solid`、`dashed` 或 `dotted` |
|  | `--mapping_link_alpha` | character | `value` | 否 | 根据相互作用评分映射边的透明度：`value` 或 `none` |
|  | `--mapping_link_color` | character | `value` | 否 | 根据相互作用评分映射边的颜色：`value` 或 `none` |
|  | `--mapping_link_size` | character | `value` | 否 | 根据相互作用评分映射边的宽度：`value` 或 `none` |
|  | `--mapping_node_alpha` | character | `none` | 否 | 根据度映射节点透明度：`value` 或 `none` |
|  | `--mapping_node_color` | character | `none` | 否 | 根据度映射节点颜色：`value` 或 `none` |
|  | `--mapping_node_size` | character | `value` | 否 | 根据度映射节点大小：`value` 或 `none` |
|  | `--point_alpha` | numeric | `1` | 否 | 节点透明度 |
|  | `--point_color` | character | 内置调色板 | 否 | 以逗号分隔的节点边框颜色 |
|  | `--point_fill` | character | 内置调色板 | 否 | 以逗号分隔的节点填充颜色 |
|  | `--point_shape` | character | `circle` | 否 | 节点形状：`circle` 或 `square` |
|  | `--point_size` | numeric | `12` | 否 | 节点的基础大小 |
|  | `--style_layout` | character | `nicely` | 否 | 布局样式：`kk`、`fr`、`nicely`、`circle`、`star`、`grid` 或 `randomly` |
|  | `--style_line` | character | `straight` | 否 | 边的样式：`straight` 或 `curve` |
|  | `--theme_size` | numeric | `0.8` | 否 | 为兼容性而保留的主题大小占位参数 |
|  | `--title` | character | 空 | 否 | 图表主标题 |

## 输入格式

### 支持的输入类型

`--genelist_file` 接受以下格式：
- `.csv`
- `.tsv`
- `.txt`
- `.xlsx`

### 基因列表解析规则

- 纯文本 `.txt` 文件可以每行提供一个基因符号，无需表头。
- 对于 `.csv`、`.tsv` 和 `.xlsx`，该工具会自动选择可能的基因列。
- 首选列名包括：`gene`、`genes`、`genename`、`genesymbol`、`symbol`、`hgnc`、`hgncsymbol`、`mgi`、`ensembl`、`ensemblgeneid`、`geneid` 和 `id`。
- 如果未找到标准基因列名，该工具会回退选择非数值特征最显著的列。
- 值中可以包含以逗号、分号、竖线、制表符或空格分隔的多个基因；这些值会被自动拆分。
- 空输入、不支持的文件扩展名或不包含可解析基因的输入将引发 `SKILL_EMPTY_DATA` 或 `SKILL_INVALID_PARAMETER` 错误。

### 最小示例

#### TXT 示例

```text
TP53
EGFR
BRCA1
MYC
```

#### CSV 示例

```csv
gene
TP53
EGFR
BRCA1
MYC
```

## 输出文件

| 文件 | 格式 | 描述 |
|------|--------|-------------|
| `data/ppi_result.rds` | RDS | 序列化的 PPI 数据包，包含映射、相互作用、节点、摘要和元数据 |
| `table/ppi_network_edges.xlsx` | XLSX | 边表，包含 `from`、`to` 和 `combined_score` |
| `table/ppi_network_nodes.xlsx` | XLSX | 节点表，包含 `gene`、`degree`、`betweenness` 和 `closeness` |
| `table/ppi_summary.csv` | CSV | 输入基因、已映射基因、未映射基因、节点、边和阈值的汇总指标 |
| `plot/ppi_network_plot.pdf` | PDF | 基于本地 STRING 相互作用图渲染的 PPI 网络图 |
| `session_info.txt` | TXT | R 版本、平台和软件包版本信息 |

## 错误处理

| 错误代码 | 含义 | 修复方法 |
|-----------|---------|------------|
| `SKILL_FILE_NOT_FOUND` | 未找到输入基因列表、STRING 缓存目录、必需的缓存文件，或仅绘图模式下的 `data/ppi_result.rds` | 确认路径存在且必需的缓存文件均已就位，并在运行 `--plot_only TRUE` 之前执行一次完整分析 |
| `SKILL_EMPTY_DATA` | 未解析出有效基因、没有基因映射到 STRING、剩余的已映射 STRING ID 少于两个、没有相互作用通过筛选，或用于绘图的相互作用表为空 | 检查输入是否为空，验证本地 STRING 缓存是否支持这些基因符号；如果网络过于稀疏，请降低阈值 |
| `SKILL_INVALID_PARAMETER` | 缺少必需参数、数值超出范围、提供了不支持的选项、输出路径无效或输入扩展名不受支持 | 重新检查参数值和允许的选项，尤其是 `--species`、`--threshold`、映射选项、绘图选项和输出路径 |
| `SKILL_MISSING_COLUMNS` | STRING 缓存表中未找到必需的列 | 确认本地 aliases、info 和 links 文件是有效的 STRING 缓存文件，并包含预期的列 |
| `SKILL_PACKAGE_NOT_FOUND` | 未安装必需的 R 软件包 | 安装错误消息中列出的缺失软件包，然后重新运行 |

详细的修复方法和故障排除步骤：阅读 `references/troubleshooting.md`

## 测试

### 使用内置数据进行冒烟测试

```bash
Rscript scripts/main.R \
  --genelist_file tests/data/gene_list.csv \
  --species human \
  --threshold 700 \
  --output_dir tests/output/basic-run
```

### 仅重新生成绘图的测试

```bash
Rscript scripts/main.R \
  --plot_only TRUE \
  --output_dir tests/output/basic-run \
  --seed 42
```

### 测试后的预期输出

- `tests/output/basic-run/data/ppi_result.rds`
- `tests/output/basic-run/table/ppi_network_edges.xlsx`
- `tests/output/basic-run/table/ppi_network_nodes.xlsx`
- `tests/output/basic-run/table/ppi_summary.csv`
- `tests/output/basic-run/plot/ppi_network_plot.pdf`
- `tests/output/basic-run/session_info.txt`