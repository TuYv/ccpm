---
name: pca-dimensionality-reduction
description: Use when performing PCA principal component dimensionality reduction on tabular numeric data. Supports command-line parameter input, automatic numeric feature selection, parameter validation, result directory creation, and CSV or TXT format result export.
license: MIT
author: AIPOCH
---
> **来源**：[https://github.com/aipoch/medical-research-skills](https://github.com/aipoch/medical-research-skills)

# PCA 降维分析

使用此技能对表格数据集执行主成分分析，并导出解释方差、样本得分、特征载荷和诊断图。

## 何时使用此技能

- 需要将多个数值变量降维为一组数量更少的主成分。
- 需要具有参数验证功能的命令行 PCA 工作流。
- 需要标准化输出文件以供下游分析使用。

## 主要命令

```bash
Rscript scripts/main.R \
  --data_file <input_file> \
  --output_dir <output_dir> \
  --feature_columns <comma_separated_numeric_columns>
```

## 前置条件

- shell 中可以使用 `Rscript`。
- 所需 R 包：`optparse`、`data.table`。
- 使用 `Rscript -e 'install.packages(c("optparse", "data.table"), repos="https://cloud.r-project.org")'` 安装缺失的软件包。

## 核心参数

| 参数 | 必需 | 说明 |
|----------|----------|-------------|
| `--data_file` | 是 | CSV、TXT 或 TSV 格式的输入数据文件 |
| `--output_dir` | 否 | 输出目录，默认为 `./PCA_Results` |
| `--feature_columns` | 否 | 以逗号分隔的数值特征列。默认使用除 ID/分组列以外的所有数值列 |
| `--sample_id_column` | 否 | 可选的样本 ID 列。如果省略，并且第一列为包含唯一值的非数值列，则会自动使用该列 |
| `--group_column` | 否 | 可选的分组列，将包含在得分输出和得分图中 |
| `--n_components` | 否 | 要导出的主成分最大数量，默认为 `5` |
| `--center_data` | 否 | `true` 或 `false`，默认为 `true` |
| `--scale_data` | 否 | `true` 或 `false`，默认为 `true` |
| `--top_loadings` | 否 | 每个主成分要导出的绝对值最大载荷的数量，默认为 `10` |
| `--output_format` | 否 | `csv` 或 `txt`，默认为 `csv` |
| `--output_prefix` | 否 | 输出文件名前缀，默认为 `pca` |

## 输入要求

- 输入文件必须至少包含 2 个可用的数值特征列。
- PCA 将行作为样本、列作为特征运行。
- 分析前会按行移除所选特征列中包含缺失值或非有限值的数据。
- 筛选后必须至少保留 2 个完整样本。
- 所选特征列在筛选后的方差必须非零。

输入示例：

```csv
SampleID,Group,GeneA,GeneB,GeneC,GeneD
S01,Control,2.1,1.9,8.2,4.3
S02,Control,2.4,2.2,8.0,4.6
S03,Treated,6.1,5.7,2.8,8.1
```

## 最简工作流

1. 确认输入文件存在，并确定用于 PCA 的数值特征列。
2. 使用所需的输出目录以及可选的特征列、ID 列或分组列运行 `scripts/main.R`。
3. 检查输出目录中 `table/`、`data/` 和 `figure/` 下的结果文件。

如果省略 `--data_file`，脚本将退出并返回 `SKILL_MISSING_INPUT`。

## 输出

预期的输出结构：

```text
<output_dir>/
├── table/
├── figure/
└── data/
```

主要结果文件：

- `table/<output_prefix>_summary.csv`
- `table/<output_prefix>_scores.csv`
- `table/<output_prefix>_loadings.csv`
- `table/<output_prefix>_top_loadings.csv`

图表文件：

- `figure/<output_prefix>_scree_plot.png`
- `figure/<output_prefix>_score_plot.png`

关键字段包括：

- `component`
- `standard_deviation`
- `variance`
- `proportion_variance`
- `cumulative_variance`
- `sample_id`
- `feature`
- `loading`

## 解读指南

- 使用 `proportion_variance` 和 `cumulative_variance` 决定保留多少个成分。
- 使用得分表检查样本在 PC 空间中的分离情况。
- 使用载荷表确定哪些原始变量驱动各个成分。

## 在需要时阅读这些文件

| 需求 | 文件 |
|------|------|
| PCA 方法详情和结果解读 | `references/algorithm.md` |
| 更多 CLI 示例 | `references/cli-guide.md` |
| 错误诊断 | `references/troubleshooting.md` |
| 主执行入口 | `scripts/main.R` |
| 示例测试数据 | `tests/data/` |

## 快速示例

使用显式指定的特征列执行基础 PCA：

```bash
Rscript scripts/main.R \
  --data_file tests/data/sample_pca_1.csv \
  --sample_id_column SampleID \
  --group_column Group \
  --feature_columns GeneA,GeneB,GeneC,GeneD,GeneE \
  --output_dir tests/output_basic
```

自动检测所有数值列：

```bash
Rscript scripts/main.R \
  --data_file tests/data/sample_pca_2.csv \
  --n_components 3 \
  --output_dir tests/output_numeric_only
```

禁用缩放：

```bash
Rscript scripts/main.R \
  --data_file tests/data/sample_pca_1.csv \
  --sample_id_column SampleID \
  --group_column Group \
  --scale_data false \
  --output_dir tests/output_unscaled
```

## 验证

```bash
Rscript scripts/main.R --help
```

```bash
Rscript scripts/main.R \
  --data_file tests/data/sample_pca_1.csv \
  --sample_id_column SampleID \
  --group_column Group \
  --feature_columns GeneA,GeneB,GeneC,GeneD,GeneE \
  --output_dir tests/validation_output
```

运行分析后，验证 `tests/validation_output/table/pca_summary.csv` 是否存在。

## 常见错误

- `SKILL_FILE_NOT_FOUND`：输入文件路径错误或无法访问。
- `SKILL_MISSING_COLUMNS`：请求的特征列、样本 ID 列或分组列缺失。
- `SKILL_INVALID_DATA`：输入数据格式错误或不适合进行 PCA。
- `SKILL_INVALID_PARAMETER`：参数值无效。
- `SKILL_INSUFFICIENT_DATA`：可用于 PCA 的完整样本或特征过少。
- `SKILL_DEPENDENCY_MISSING`：所需的 R 包（例如 `optparse` 或 `data.table`）不可用。

如果问题原因不明显，请阅读 `references/troubleshooting.md`。