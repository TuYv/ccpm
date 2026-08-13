---
name: cibersort-immune-infiltration-analysis
description: Use when estimating relative immune cell infiltration from a bulk expression matrix with a CIBERSORT-style nu-SVR deconvolution workflow based on an LM22 signature matrix, comparing one case group against one control group, and generating structured tables plus immune-fraction plots. NOT for single-cell RNA-seq, spatial data, clinical diagnosis, or workflows that require the original hosted CIBERSORT web service.
license: MIT
author: AIPOCH
---
> **来源**：[https://github.com/aipoch/medical-research-skills](https://github.com/aipoch/medical-research-skills)

# CIBERSORT 免疫浸润分析

## 适用场景

- 从批量表达矩阵中估算免疫细胞的相对比例。
- 在反卷积后比较一个病例组与一个对照组。
- 生成结构化表格、序列化结果对象和可选的 PDF 图表。

## 不适用场景

- 单细胞 RNA 测序、空间转录组学或聚类任务。
- 绝对性的临床解读或治疗建议。
- 需要使用原始在线 CIBERSORT 服务而非本地 R 实现的工作流。

## 工作流程

1. 确认表达矩阵、分组文件和特征矩阵均可用。
2. 使用病例组和对照组运行 `scripts/main.R`。
3. 检查完整结果表、派生汇总表和可选图表。
4. 每次运行后检查 `run_record.txt` 和 `output_manifest.txt`，包括验证失败的尝试。

## 何时读取外部文件

| 情况 | 要读取的文件 | 用途 |
|-----------|--------------|---------|
| 需要运行分析 | `scripts/main.R` | CLI 入口点 |
| 需要了解算法详情 | `references/algorithm.md` | 高质量参考工作流和结果解读 |
| 遇到错误 | `references/troubleshooting.md` | 错误代码和环境修复方法 |
| 需要 CLI 示例或基准记录 | `references/cli-guide.md` | 示例命令和验证说明 |
| 需要打包提供的测试输入 | `tests/data/` | 演示表达矩阵、分组文件和 LM22 文件 |

## 用法

```bash
Rscript scripts/main.R \
  --input_file ./expression_matrix.csv \
  --group_file ./group_info.csv \
  --signature_file ./LM22.txt \
  --case_group treatment \
  --control_group control \
  --output_dir ./output \
  --qn false \
  --seed 42
```

## 参数

| 短选项 | 长选项 | 类型 | 默认值 | 描述 |
|-------|------|------|---------|-------------|
| `-i` | `--input_file` | 文件 | 必填 | 以基因为行、样本为列的表达矩阵 |
| `-g` | `--group_file` | 文件 | 必填 | 分组注释表 |
| `-a` | `--case_group` | 字符串 | 必填 | 病例组标签 |
| `-b` | `--control_group` | 字符串 | 必填 | 对照组标签 |
| `-o` | `--output_dir` | 目录 | `./output` | 输出目录 |
|  | `--signature_file` | 文件 | `tests/data/LM22.txt`（存在时） | 特征矩阵文件 |
|  | `--sample_col` | 字符串/整数 | 无 | 可选的样本列名称或从 1 开始的索引 |
|  | `--group_col` | 字符串/整数 | 无 | 可选的分组列名称或从 1 开始的索引 |
|  | `--gene_id_case` | 字符串 | `upper` | 基因 ID 规范化：`asis`、`upper` 或 `lower` |
|  | `--auto_unlog` | 布尔值 | `true` | 仅当表达矩阵通过保守的对数尺度启发式检查时应用 `2^x` |
|  | `--min_mean_expression` | 数值 | `1` | 反卷积前的最低平均表达量 |
|  | `--perm` | 整数 | `1000` | 用于估算经验 p 值的置换次数；`0` 可使运行保持轻量，但会将 `P-value` 记录为 `NA` |
|  | `--qn` | 布尔值 | `true` | 对混合矩阵应用分位数归一化 |
|  | `--svm_cores` | 整数 | `1` | nu-SVR 模型选择步骤的工作进程数 |
|  | `--make_plots` | 布尔值 | `true` | 生成 PDF 图表 |
|  | `--plot_width` | 数值 | `16` | 默认图表宽度（英寸） |
|  | `--plot_height` | 数值 | `10` | 默认图表高度（英寸） |
| `-s` | `--seed` | 整数 | `42` | 随机种子 |
| `-t` | `--timeout_seconds` | 整数 | `0` | 可选的超时时间（秒）；`0` 表示禁用 |
|  | `--verbose` | 布尔值 | `true` | 输出进度日志 |

## 输入格式

### 表达矩阵

CSV 或 TSV。第一列必须包含基因标识符。其余列必须是样本级数值型表达值。

当 `--auto_unlog=true` 时，工作流会报告汇总统计信息，并且仅在矩阵通过保守的对数尺度启发式检查时应用 `2^x`。如果矩阵存在歧义，则保持数值不变，并在启动日志中说明原因。

如果存在重复的基因标识符，则在基因 ID 标准化后，通过取各样本的最大值进行合并，然后再执行下游过滤和反卷积。

```csv
gene,Sample1,Sample2,Sample3
TP53,10.2,8.5,9.1
CXCL9,4.3,6.1,5.7
```

### 分组文件

包含一个样本列和一个分组列的 CSV 或 TSV 文件。

```csv
sample,group
Sample1,control
Sample2,treatment
Sample3,treatment
```

### 特征矩阵

打包提供的默认文件是 `tests/data/LM22.txt`。自定义特征矩阵必须包含一个基因列，后跟免疫细胞特征列。

所有免疫细胞特征列都必须是数值型且为有限值。如果存在重复的基因标识符，则在基因取交集之前，通过取各细胞类型的最大值进行合并。

## 输出文件

| 文件 | 描述 |
|------|-------------|
| `data/cibersort_input.rds` | 本地算法所使用的已对齐输入矩阵的序列化文件 |
| `data/cibersort_null_distribution.rds` | 置换零分布的序列化文件 |
| `data/cibersort_result.rds` | 包含细胞比例、指标、运行时设置和热图渲染元数据的序列化结果对象 |
| `table/CIBERSORT_Results.csv` | CSV 格式的完整结果表 |
| `table/CIBERSORT-Results.txt` | 制表符分隔文本格式的完整结果表 |
| `table/cibersort_cell_fractions_wide.csv` | 宽格式免疫细胞比例表 |
| `table/cibersort_cell_fractions_long.csv` | 长格式免疫细胞比例表 |
| `table/cibersort_group_compare.csv` | 病例组与对照组的比较摘要 |
| `table/cibersort_quality_metrics.csv` | 样本级 `P-value`、`Correlation` 和 `RMSE` 表 |
| `table/immune_cell_correlation_matrix.csv` | 免疫细胞类型间的 Spearman 相关矩阵 |
| `table/immune_cell_correlation_pvalue.csv` | 与相关矩阵对齐的 P 值矩阵 |
| `plot/immune_cell_composition_sample.pdf` | 当 `--make_plots=true` 时生成的样本级堆叠组成图 |
| `plot/immune_group_boxplot.pdf` | 当 `--make_plots=true` 时生成的组间比较箱线图 |
| `plot/immune_correlation_heatmap.pdf` | 当 `--make_plots=true` 时生成的免疫细胞相关性热图 |
| `session_info.txt` | R 会话信息 |
| `output_manifest.txt` | 用于记录成功和失败运行的仅追加输出清单 |
| `run_record.txt` | 仅追加的结构化运行记录，包括运行时备注和失败运行摘要 |

当 `--make_plots=false` 时，`plot/` 目录可能仍会作为标准输出布局的一部分存在，但不会写入任何 PDF 图文件。

当 `--perm=0` 时，工作流会记录警告并在不执行经验置换检验的情况下完成，因此 `P-value` 列会被记录为 `NA`。

当重新运行的目标是现有的 `--output_dir`，但随后未通过验证或执行失败时，会保留此前成功生成的有效载荷，并将失败信息追加到 `run_record.txt` 和 `output_manifest.txt`。

## 错误处理

| 错误代码 | 含义 | 解决方案 |
|------------|---------|----------|
| `SKILL_FILE_NOT_FOUND` | 未找到输入文件或特征矩阵 | 检查文件路径并重新运行 |
| `SKILL_MISSING_COLUMNS` | 缺少必需的列 | 修正输入模式 |
| `SKILL_EMPTY_DATA` | 没有剩余的可用基因、样本或反卷积输出 | 检查数据、过滤条件或特征重叠情况 |
| `SKILL_INVALID_PARAMETER` | CLI 参数缺失或无效 | 检查参数表和输入值 |
| `SKILL_SAMPLE_MISMATCH` | 表达数据中的样本与分组注释不一致 | 统一样本标识符 |
| `SKILL_PACKAGE_NOT_FOUND` | 缺少必需的 R 包 | 安装缺失的包 |
| `SKILL_TIMEOUT` | 超出配置的时间限制 | 增大 `--timeout_seconds`，或将其设置为 `0` |

如果错误仍然存在，请阅读：`references/troubleshooting.md`

## 输入验证

此技能接受：

- CSV 或 TSV 格式的批量表达矩阵文件，其中包含一个基因列和多个数值型样本列。
- CSV 或 TSV 格式的分组注释文件，其中包含一个样本列和一个分组列。
- 恰好一个用于比较的病例组标签和一个对照组标签。
- 与文档所述 LM22 风格模式兼容的可选自定义特征矩阵。

请勿将此技能用于：

- 单细胞 RNA-seq、空间转录组学或细胞聚类工作流。
- 临床诊断、治疗建议或患者级医疗决策。
- 需要使用托管的 CIBERSORT Web 服务而非此本地 R 实现的请求。
- 在单次运行中需要比较多个病例组与一个对照组的多组研究设计。

如果用户的请求超出此范围，请勿继续执行工作流。应改为回复：

> “cibersort-immune-infiltration-analysis 旨在使用一个病例组和一个对照组，从批量表达矩阵执行本地 CIBERSORT 风格的免疫反卷积。您的请求似乎超出了此范围。请提供兼容的批量表达输入和分组标签，或使用更适合您任务的工具。”

## 测试

```bash
Rscript scripts/main.R --help

Rscript tests/run_tests.R

Rscript tests/test_skill.R
```

已验证的随附测试路径：

```bash
Rscript scripts/main.R \
  --input_file tests/data/expression_matrix.csv \
  --group_file tests/data/group_info.csv \
  --signature_file tests/data/LM22.txt \
  --case_group Tumor \
  --control_group Healthy \
  --output_dir tests/output \
  --perm 25 \
  --qn false \
  --svm_cores 1 \
  --seed 42
```

容器说明：

- 随附的测试路径使用 `--qn false`，因为 `preprocessCore::normalize.quantiles()` 在某些容器中可能触发环境级线程故障。
- 如果需要执行分位数归一化运行，请先验证该环境，并将结果记录在 `references/cli-guide.md` 中。
- `tests/run_tests.R` 还会检查失败的重新运行是否不会清除现有的成功有效载荷目录。