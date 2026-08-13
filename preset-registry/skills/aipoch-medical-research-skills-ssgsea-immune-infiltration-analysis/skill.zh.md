---
name: ssgsea-immune-infiltration-analysis
description: Use when estimating immune infiltration from bulk RNA-seq expression matrices with ssGSEA/GSVA, comparing case versus control groups, and generating downstream immune-score visualizations. NOT for single-cell RNA-seq, absolute cell proportion estimation, or clinical decision making.
license: MIT
author: AIPOCH
---
> **来源**：[https://github.com/aipoch/medical-research-skills](https://github.com/aipoch/medical-research-skills)

# ssGSEA 免疫浸润分析

## 适用场景

- 从批量 RNA-seq 表达矩阵中估算相对免疫浸润水平。
- 比较一个病例组与一个对照组之间的免疫富集评分。
- 生成结构化结果表，以及可选的 PDF 可视化图表，供后续审阅。

## 不适用场景

- 单细胞 RNA-seq 或空间转录组学。
- 免疫细胞绝对比例估算或去卷积。
- 临床诊断、治疗建议或任何其他医疗决策。

## 工作流程

1. 确认表达矩阵、分组文件和基因集文件符合文档中规定的模式。
2. 使用目标病例组和对照组运行 `scripts/main.R`。
3. 检查 `run_record.txt`、`output_manifest.txt` 以及生成的表格或图表。
4. 如果执行失败，请先阅读 `references/troubleshooting.md`，然后再重试。

## 何时读取外部文件

| 场景 | 要读取的文件 | 用途 |
|-----------|--------------|---------|
| 需要运行分析 | `scripts/main.R` | CLI 入口点 |
| 需要了解算法细节 | `references/algorithm.md` | 方法假设和结果解读 |
| 遇到错误 | `references/troubleshooting.md` | 错误代码和修复方法 |
| 需要 CLI 示例或基准执行详情 | `references/cli-guide.md` | 示例和已记录的运行详情 |
| 需要依赖声明 | `DESCRIPTION` | 软件包列表和 Bioconductor 来源说明 |
| 需要测试命令 | `tests/run_tests.R` | 端到端测试入口 |

## 用法

```bash
Rscript scripts/main.R \
  --input_file ./expression_matrix.csv \
  --group_file ./group_info.csv \
  --gene_set ./immune_gene_sets.csv \
  --case_group treatment \
  --control_group control \
  --output_dir ./output \
  --method ssgsea \
  --seed 42
```

已验证路径说明：

- `ssgsea` 是默认的已验证路径。
- `gsva` 受支持，但仅限于本地 GSVA 环境中已验证的核函数。
- 在当前已审计的环境中，使用 `Gaussian` 的 `gsva` 已成功完成，并作为文档记录的基准。

## 参数

| 短参数 | 长参数 | 类型 | 默认值 | 描述 |
|-------|------|------|---------|-------------|
| `-i` | `--input_file` | 文件 | 必填 | 以基因为行、样本为列的表达矩阵 |
| `-g` | `--group_file` | 文件 | 必填 | 分组注释表 |
| `-e` | `--gene_set` | 文件 | `tests/data/immune_gene_sets.csv` | 免疫基因集 CSV |
| `-a` | `--case_group` | 字符串 | 必填 | 病例组标签 |
| `-b` | `--control_group` | 字符串 | 必填 | 对照组标签 |
| `-o` | `--output_dir` | 目录 | `./output` | 输出目录 |
| `-m` | `--method` | 字符串 | `ssgsea` | GSVA 方法：`ssgsea`、`gsva` |
| `-k` | `--kcdf` | 字符串 | `Gaussian` | 核函数模式：`Gaussian`、`Poisson`；`Gaussian` 是已验证的 GSVA 基准 |
| `-n` | `--min_sz` | 整数 | `2` | 每个基因集的最小重叠基因数 |
| `-x` | `--max_sz` | 整数 | `10000` | 每个基因集的最大基因数 |
| `-p` | `--parallel_sz` | 整数 | `2` | 请求使用的并行 CPU 数量 |
| `-u` | `--tau` | 数值 | `0.25` | ssGSEA 的 Tau 参数 |
| `-d` | `--mx_diff` | 布尔值 | `true` | GSVA `mx.diff` 开关 |
| `-c` | `--gene_id_case` | 字符串 | `upper` | 基因 ID 标准化：`asis`、`upper`、`lower` |
| `-s` | `--seed` | 整数 | `42` | 随机种子 |
| `-t` | `--timeout_seconds` | 整数 | `0` | 可选的超时时间；`0` 表示禁用 |
|  | `--sample_col` | 字符串/整数 | 无 | 样本列名称或从 1 开始的索引 |
|  | `--group_col` | 字符串/整数 | 无 | 分组列名称或从 1 开始的索引 |
|  | `--make_plots` | 布尔值 | `true` | 生成 PDF 图表 |
|  | `--verbose` | 布尔值 | `true` | 输出进度日志 |

## 输入格式

### 表达矩阵

CSV 或 TSV。第一列必须包含基因标识符。其余列为样本级数值表达量。

```csv
gene,Sample1,Sample2,Sample3
TP53,10.2,8.5,9.1
CXCL9,4.3,6.1,5.7
```

### 分组文件

CSV 或 TSV，至少包含一个样本列和一个分组列。

```csv
sample,group
Sample1,control
Sample2,treatment
Sample3,treatment
```

### 基因集文件

包含 `gene` 和 `cell_type` 的 CSV；`immunity_class` 为可选字段。

```csv
gene,cell_type,immunity_class
CXCL9,Activated CD8 T cell,Adaptive
CD3D,Activated CD8 T cell,Adaptive
```

## 输出文件

| 文件 | 描述 |
|------|-------------|
| `data/ssgsea_list.rds` | 序列化的分析结果对象 |
| `table/ssgsea_scores_long.csv` | 长格式免疫浸润评分 |
| `table/ssgsea_scores_wide.csv` | 宽格式免疫浸润评分矩阵 |
| `table/ssgsea_group_compare.csv` | 病例组与对照组的比较摘要 |
| `table/immune_cell_correlation_matrix.csv` | 免疫细胞 Spearman 相关性矩阵 |
| `table/immune_cell_correlation_pvalue.csv` | 相关性 p 值矩阵 |
| `plot/immune_cell_composition_sample.pdf` | 样本级组成图；仅当 `--make_plots=true` 时生成 |
| `plot/immune_group_boxplot.pdf` | 分组比较箱线图；仅当 `--make_plots=true` 时生成 |
| `plot/immune_correlation_heatmap.pdf` | 免疫细胞相关性热图；仅当 `--make_plots=true` 时生成 |
| `plot/gene_immune_correlation_scatter_*.pdf` | 自动选择的基因与细胞散点图；仅当 `--make_plots=true` 时生成 |
| `run_record.txt` | 结构化执行记录 |
| `output_manifest.txt` | 带有描述的输出文件清单 |
| `session_info.txt` | R 会话信息 |

## 错误处理

| 错误 | 原因 | 解决方案 |
|-------|-------|----------|
| `SKILL_FILE_NOT_FOUND` | 输入文件路径无效 | 检查文件路径 |
| `SKILL_MISSING_COLUMNS` | 缺少必需列 | 修正输入模式 |
| `SKILL_EMPTY_DATA` | 没有剩余可用的行、基因集或已对齐样本 | 检查标识符和筛选条件 |
| `SKILL_INVALID_PARAMETER` | CLI 值无效或数据格式错误 | 检查参数和文件内容 |
| `SKILL_SAMPLE_MISMATCH` | 表达数据和分组数据中的样本未对齐 | 统一样本标识符 |
| `SKILL_PACKAGE_NOT_FOUND` | 缺少必需的 R 包 | 安装缺失的软件包 |
| `SKILL_TIMEOUT` | 超出配置的时间限制 | 增大 `--timeout_seconds`，或将其设为 `0` 以禁用时间限制 |

## 测试

```bash
Rscript scripts/main.R --help

Rscript tests/run_tests.R

Rscript tests/test_skill.R
```

`tests/test_skill.R` 是自包含的：如果预期输出不存在，它会先运行 `tests/run_tests.R`，然后验证文件是否存在以及核心结果结构。