---
name: gene-protein-expression-matrix-normalization
description: Use when normalizing bulk gene or protein expression matrices with log2 transform, z-score standardization, or min-max scaling before downstream visualization or exploratory analysis. NOT for count-model normalization such as TPM/DESeq2 size factors, batch correction, or single-cell preprocessing.
license: MIT
author: AIPOCH
---
> **来源**：[https://github.com/aipoch/medical-research-skills](https://github.com/aipoch/medical-research-skills)

# 基因蛋白表达矩阵归一化

## 何时使用

当用户希望在绘图、聚类或探索性比较之前对数值表达矩阵进行归一化时，请使用此技能。

典型请求：

- “使用 log2 对此基因表达矩阵进行归一化”
- “跨样本进行 z-score 标准化”
- “将蛋白质丰度值映射到 0 到 1 的范围内”

## 何时不使用

以下情况请勿使用此技能：

- CPM、TPM、TMM 或 DESeq2 size factors 等计数模型归一化
- 批次校正或协变量调整
- 单细胞预处理工作流
- 包含缺失值、`Inf` 或 `NaN` 值且尚未清理的矩阵

## 何时读取外部文件

执行分析时，运行：

```bash
Rscript scripts/main.R --input_file <matrix.csv> --output_dir <output_dir> --method <log2|zscore|minmax>
```

| 情况 | 要读取的文件 | 用途 |
|-----------|--------------|---------|
| 需要执行工作流 | `scripts/main.R` | CLI 入口点 |
| 需要算法详细信息 | `references/algorithm.md` | 方法定义和假设 |
| 遇到错误 | `references/troubleshooting.md` | 标准错误代码和修复方法 |
| 需要示例或基准运行详细信息 | `references/cli-guide.md` | 可直接运行的命令和测试记录 |
| 需要依赖项声明 | `DESCRIPTION` | 运行时软件包列表 |

## 用法

```bash
Rscript scripts/main.R \
  --input_file tests/data/expression_matrix.csv \
  --output_dir ./output \
  --method log2 \
  --pseudo_count 1 \
  --seed 42
```

## 参数

| 短选项 | 长选项 | 类型 | 默认值 | 描述 |
|-------|------|------|---------|-------------|
| `-i` | `--input_file` | file | 必填 | CSV 或 TSV 格式的表达矩阵 |
| `-o` | `--output_dir` | dir | `./output` | 输出目录 |
| `-m` | `--method` | string | `log2` | 归一化方法：`log2`、`zscore`、`minmax` |
| `-r` | `--margin` | string | `column` | 按 `row` 或 `column` 应用归一化 |
| `-p` | `--pseudo_count` | numeric | `1` | 在 log2 转换前添加 |
| `-c` | `--center` | boolean | `true` | 对 z-score 值进行中心化 |
| `-s` | `--scale_values` | boolean | `true` | 对 z-score 值进行缩放 |
| `-t` | `--timeout_seconds` | integer | `0` | 可选超时时间；`0` 表示禁用 |
| `-d` | `--delimiter` | string | `auto` | 输入分隔符：`auto`、`csv` 或 `tsv` |
|  | `--seed` | integer | `42` | 随机种子 |
|  | `--verbose` | boolean | `true` | 打印进度日志 |

## 输入格式

第一列必须包含特征标识符。其余列必须是有限的数值型样本值。

缺失值以及 `NA`、`NaN`、`Inf` 和 `-Inf` 等非有限值将被拒绝。

```csv
feature,S1,S2,S3
TP53,10,20,30
EGFR,3,5,9
```

此技能接受基因或蛋白质表达矩阵。它不会推断 CPM、TPM、TMM 或 DESeq2 size factors 等计数模型归一化方法。

## 输出文件

如果 `--output_dir` 已存在，则会覆盖同名的结果文件。当 `--verbose=true` 时，工作流会在写入非空输出目录之前打印警告。

对于单样本输入，`feature_summary.csv` 按设计会将每个特征的标准差报告为 `0`，因为每个特征仅包含一个观测值。

| 文件 | 描述 |
|------|-------------|
| `table/normalized_matrix.csv` | 归一化矩阵，其中保留原始特征列 |
| `table/feature_summary.csv` | 归一化前后每个特征的最小值、最大值、均值和标准差 |
| `table/sample_summary.csv` | 归一化前后每个样本的最小值、最大值、均值和标准差 |
| `data/normalized_matrix.rds` | 序列化的归一化矩阵和运行元数据 |
| `run_record.txt` | 结构化执行记录 |
| `output_manifest.txt` | 输出文件清单 |
| `session_info.txt` | R 会话信息 |

## 方法

### `log2`

对每个数值计算 `log2(x + pseudo_count)`。

### `zscore`

沿所选维度进行中心化和缩放。`margin=column` 对每个样本进行标准化；`margin=row` 对每个特征进行标准化。

当 `center=false` 且 `scale_values=true` 时，工作流会直接除以标准差，而不会先减去均值。

### `minmax`

沿所选维度将值重新缩放至 `[0, 1]`。为避免除以零错误，常量向量将返回为全零向量。

## 错误处理

| 错误 | 原因 | 解决方案 |
|-------|-------|----------|
| `SKILL_FILE_NOT_FOUND` | 输入文件路径无效 | 检查输入路径 |
| `SKILL_MISSING_COLUMNS` | 矩阵少于两列 | 提供一个特征列和至少一个样本列 |
| `SKILL_INVALID_PARAMETER` | CLI 值不受支持或格式错误，或者矩阵包含非有限值 | 查看参数表并检查矩阵值 |
| `SKILL_TIMEOUT` | 运行时间超过 `--timeout_seconds` | 增加超时时间或减小输入规模 |
| `SKILL_EMPTY_DATA` | 没有剩余可用的行或列 | 检查输入矩阵 |

## 测试

```bash
Rscript scripts/main.R --help

Rscript tests/run_tests.R

Rscript tests/run_tests.R audit_output_check

Rscript tests/test_skill.R

Rscript tests/test_skill.R audit_output_check --skip-prepare
```

`tests/run_tests.R` 会执行内置的 `log2`、`zscore` 和 `minmax` 运行，并将其输出写入 `tests/output/` 下。

当你传入诸如 `audit_output_check` 这样的相对目录名称时，测试运行程序会将输出写入 `tests/output/audit_output_check/` 下。

如果要显式验证预生成的输出，请先运行 `tests/run_tests.R`，再运行 `tests/test_skill.R`。验证脚本也可以自行准备缺失的输出。