---
name: sample-correlation-analysis
description: Use when performing correlation analysis between two variables including Pearson and Spearman correlation methods. Supports command-line parameter input, automatic data format detection, parameter validation, result directory creation, and CSV or TXT format result export.
license: MIT
author: AIPOCH
---
> **来源**：[https://github.com/aipoch/medical-research-skills](https://github.com/aipoch/medical-research-skills)

# 相关性分析

使用此技能对表格数据文件中的两个变量进行相关性分析。

## 适用场景

- 你需要计算两个变量之间的 Pearson 或 Spearman 相关性，这些变量可以存储为列，也可以存储为以第一列作为行标签的行。
- 你需要一个带参数验证的命令行工作流。
- 你需要 CSV 或 TXT 格式的标准化输出文件。

## 主要命令

```bash
Rscript scripts/main.R \
  --data_file <input_file> \
  --method <pearson|spearman> \
  --x_var <variable_name> \
  --y_var <variable_name> \
  --output_dir <output_dir>
```

## 前置条件

- shell 中可以使用 Rscript。
- 所需 R 软件包：`optparse`、`data.table`。
- 使用 `Rscript -e 'install.packages(c("optparse", "data.table"), repos="https://cloud.r-project.org")'` 安装缺失的软件包。

## 核心参数

| 参数 | 是否必需 | 说明 |
|----------|----------|-------------|
| `--data_file` | 是 | CSV、TXT 或 TSV 格式的输入数据文件 |
| `--method` | 否 | 相关性方法：`pearson` 或 `spearman`。默认值为 `pearson` |
| `--x_var` | 否 | 第一个变量名。它可以匹配列名或第一列中的行标签。默认值为 `variable1` |
| `--y_var` | 否 | 第二个变量名。它可以匹配列名或第一列中的行标签。默认值为 `variable2` |
| `--output_dir` | 否 | 输出目录，默认值为 `./Correlation_Results` |
| `--alternative` | 否 | `two.sided`、`less` 或 `greater`。默认值为 `two.sided` |
| `--conf_level` | 否 | 介于 0 和 1 之间的置信水平，默认值为 `0.95` |
| `--output_format` | 否 | `csv` 或 `txt`，默认值为 `csv` |
| `--output_prefix` | 否 | 输出文件名前缀，默认值为 `correlation` |

## 输入要求

- 输入文件必须包含两个目标变量。
- 两个变量都必须包含数值。
- 如果第一列存储变量名，其余列为样本，脚本会自动按行标签读取变量。
- 任一变量中存在缺失值的行将被排除。
- 至少需要 3 对完整的观测值。

输入示例：

```csv
variable1,variable2
10.2,8.5
11.5,9.2
9.8,7.9
```

## 最简工作流

1. 确认输入文件存在且变量名正确。
2. 使用所需的方法和变量名运行 `scripts/main.R`。
3. 检查输出目录中 `table/` 下的结果文件。

如果省略 `--data_file`，脚本将以 `SKILL_MISSING_INPUT` 退出。

## 输出

预期的输出结构：

```text
<output_dir>/
├── table/
├── figure/
└── data/
```

主要结果文件：

- `table/<output_prefix>_<method>.csv`
- `table/<output_prefix>_<method>.txt`

结果字段包括：

- `method`
- `correlation`
- `statistic`
- `p_value`
- `conf_low`
- `conf_high`
- `sample_size`
- `x_variable`
- `y_variable`
- `variable_orientation`

## 选择方法

- 对连续变量之间的线性关系使用 `pearson`。
- 对单调关系、非正态数据或容易出现离群值的数据使用 `spearman`。

## 需要时阅读这些文件

| 需求 | 文件 |
|------|------|
| 统计细节和假设 | `references/algorithm.md` |
| 更多 CLI 示例 | `references/cli-guide.md` |
| 错误诊断 | `references/troubleshooting.md` |
| 主执行入口点 | `scripts/main.R` |
| 示例测试数据 | `tests/data/` |

## 快速示例

Pearson：

```bash
Rscript scripts/main.R \
  --data_file tests/data/sample_correlation_1.csv \
  --method pearson \
  --x_var variable1 \
  --y_var variable2 \
  --output_dir tests/output_pearson
```

Spearman：

```bash
Rscript scripts/main.R \
  --data_file tests/data/sample_correlation_3.csv \
  --method spearman \
  --x_var "Activated CD8 T cell" \
  --y_var "Central memory CD8 T cell" \
  --output_dir tests/output_spearman
```

## 验证

```bash
Rscript scripts/main.R --help
```

```bash
Rscript scripts/main.R \
  --data_file tests/data/sample_correlation_1.csv \
  --method pearson \
  --x_var variable1 \
  --y_var variable2 \
  --output_dir tests/validation_output
```

运行分析后，验证 `tests/validation_output/table/correlation_pearson.csv` 是否存在。

## 常见错误

- `SKILL_FILE_NOT_FOUND`：输入文件路径错误或无法访问。
- `SKILL_MISSING_COLUMNS`：请求的一个或两个变量缺失。
- `SKILL_INVALID_DATA`：输入数据格式错误或不适合分析。
- `SKILL_INVALID_PARAMETER`：参数值无效。
- `SKILL_INSUFFICIENT_DATA`：筛选后剩余的完整观测值过少。
- `SKILL_DEPENDENCY_MISSING`：所需的 R 包（如 `optparse` 或 `data.table`）不可用。

如果问题原因不明显，请阅读 `references/troubleshooting.md`。