---
name: svm-model-importance-analysis
description: Use when you need a standardized R CLI workflow to run two-class SVM-RFE feature ranking on an expression-like matrix, choose an informative feature count from cross-validated error, and generate reproducible ranking and error plots. NOT for regression, multi-class classification, missing-value imputation, or remote data fetching.
license: MIT
author: AIPOCH
---
> **来源**：[https://github.com/aipoch/medical-research-skills](https://github.com/aipoch/medical-research-skills)

# SVM 模型重要性分析

## 何时读取外部文件

| 情况 | 要读取的文件 | 目的 |
|-----------|--------------|---------|
| 需要算法详情 | `references/algorithm.md` | 说明 SVM-RFE 排名、交叉验证逻辑、假设和结果解读 |
| 需要执行分析 | `scripts/main.R` | 使用完整的 `Rscript` 命令运行 CLI 入口点 |
| 遇到错误 | `references/troubleshooting.md` | 将标准化错误代码映射到原因和解决方法 |
| 需要 CLI 示例 | `references/cli-guide.md` | 查看安装步骤和可运行的 CLI 示例 |
| 需要可运行的冒烟测试 | `tests/data/` | 使用随附的小型数据集进行验证 |

## 用法

```bash
Rscript scripts/main.R \
  --input_file ./input/expression_matrix.csv \
  --group_file ./input/group_info.csv \
  --case_group Case \
  --control_group Control \
  --output_dir output/basic-run \
  --seed 42 \
  --timeout_seconds 600
```

## 参数

| 短选项 | 长选项 | 类型 | 默认值 | 必需 | 说明 |
|-------|------|------|---------|----------|-------------|
| `-i` | `--input_file` | character | 无 | 是，除非使用 `--plot_only TRUE` | 样本位于行、特征位于列的表达矩阵文件 |
| `-g` | `--group_file` | character | 无 | 是，除非使用 `--plot_only TRUE` | 第一列为样本 ID 的分组文件 |
| `-c` | `--case_group` | character | 无 | 是，除非使用 `--plot_only TRUE` | 病例组标签 |
| `-r` | `--control_group` | character | 无 | 是，除非使用 `--plot_only TRUE` | 对照组标签 |
| `-o` | `--output_dir` | character | `output` | 是 | Skill 根目录内的输出目录 |
| `-p` | `--plot_only` | logical | `FALSE` | 否 | 复用 `output_dir/data/svm_result.rds`，并在不重新运行 SVM-RFE 的情况下重新生成图表 |
| `-s` | `--seed` | integer | `42` | 否 | 用于确保结果可复现的随机种子 |
| `-t` | `--timeout_seconds` | integer | `600` | 否 | 本次运行的耗时限制 |
|  | `--svm_k` | integer | `10` | 否 | 用于 SVM-RFE 和验证的分层外层折数 |
|  | `--svm_halve_above` | integer | `50` | 否 | 如果保留的特征超过此数量，则每次迭代移除一半 |
|  | `--svm_max_features_cap` | integer | `30` | 否 | 在误差曲线上评估的最大特征数量 |
|  | `--svm_select_rule` | character | `min` | 否 | 特征数量规则：`min` 或 `tolerance` |
|  | `--svm_tol` | numeric | `0.01` | 否 | 选择 `--svm_select_rule tolerance` 时使用的容差 |
|  | `--svm_error_height` | numeric | `5` | 否 | SVM 误差图的高度，单位为英寸 |
|  | `--svm_error_width` | numeric | `6` | 否 | SVM 误差图的宽度，单位为英寸 |
|  | `--svm_error_xlab` | character | `Number of Features` | 否 | SVM 误差图的 X 轴标签 |
|  | `--svm_error_ylab` | character | `Classification Error Rate` | 否 | SVM 误差图的 Y 轴标签 |
|  | `--svm_error_main_line_color` | character | `black` | 否 | SVM 误差图的主线颜色 |
|  | `--svm_error_second_line_color` | character | `#2BA2DE` | 否 | SVM 误差图的基准线颜色 |
|  | `--svm_error_best_point_color` | character | `red` | 否 | 最佳特征数量点的高亮颜色 |
|  | `--svm_error_noinfo_lty` | integer | `3` | 否 | 无信息基准线的线型 |
|  | `--svm_error_label_cex` | numeric | `0.75` | 否 | 最佳点注释的标签大小 |
|  | `--svm_error_label_pos` | integer | `4` | 否 | 最佳点注释的标签位置 |
|  | `--svm_rank_top_n` | integer | `20` | 否 | 排名图中显示的最大特征数量 |
|  | `--svm_rank_width` | numeric | `7` | 否 | 排名图的宽度，单位为英寸 |
|  | `--svm_rank_height` | numeric | `6` | 否 | 排名图的高度，单位为英寸 |
|  | `--svm_rank_color` | character | `#2BA2DE` | 否 | 排名图的条形颜色 |
|  | `--svm_rank_title` | character | `SVM-RFE Feature Ranking` | 否 | 排名图的标题 |

## 输入格式

### 表达矩阵

- CSV 或 TSV。
- 第一列：样本 ID。
- 其余列：数值型特征。
- 样本必须按行排列。
- 不允许存在缺失或非数值型特征值。

示例：

```csv
sample,HIF1A,NR4A1,SOCS1
S1,6.21,-1.34,2.01
S2,6.57,0.37,3.62
S3,7.05,2.12,5.01
```

### 分组文件

- CSV 或 TSV。
- 第一列：样本 ID。
- 必须有且仅有一个附加列同时包含病例组和对照组标签。
- 仅支持恰好两个分组。

示例：

```csv
sample,group
S1,Case
S2,Case
S3,Control
```

## 输出文件

| 文件 | 格式 | 描述 |
|------|--------|-------------|
| `data/svm_result.rds` | RDS | 序列化的 SVM-RFE 数据包，包含排序结果和元数据 |
| `table/svm_rfe_features.csv` | CSV | 使用所选特征数量规则选出的已排序特征 |
| `table/svm_rfe_full_ranking.csv` | CSV | 涵盖所有输入特征的完整排序表 |
| `plot/svm_rfe_error_plot.pdf` | PDF | 不同特征数量下的交叉验证分类误差 |
| `plot/svm_rfe_ranking_plot.pdf` | PDF | SVM-RFE 排名最高特征的条形图 |
| `session_info.txt` | TXT | R 版本、平台和软件包版本信息 |

## 错误处理

- 成功运行时以状态码 `0` 退出。
- 运行失败时以状态码 `1` 退出。
- 错误消息使用标准化名称，例如 `SKILL_FILE_NOT_FOUND` 和 `SKILL_INVALID_PARAMETER`。
- 输出路径会经过验证，以确保 `--output_dir` 无法写入技能根目录之外的位置。
- 分析过程绝不会发起网络请求，也绝不会通过 `eval()`、`exec()` 或 `system()` 执行用户输入。

常见代码：

| 错误代码 | 含义 |
|------------|---------|
| `SKILL_FILE_NOT_FOUND` | 输入文件或仅绘图模式所需的产物不存在 |
| `SKILL_MISSING_COLUMNS` | 输入文件不包含必需的列 |
| `SKILL_EMPTY_DATA` | 输入文件为空，或所需的排序表不可用 |
| `SKILL_INVALID_PARAMETER` | CLI 参数、分组设置、数值约束或路径无效 |
| `SKILL_SAMPLE_MISMATCH` | 表达矩阵与分组文件中的样本 ID 不匹配 |
| `SKILL_PACKAGE_NOT_FOUND` | 缺少一个或多个必需的 CRAN 软件包 |

有关详细修复方法，请阅读：`references/troubleshooting.md`

## 测试

### 帮助检查

```bash
Rscript scripts/main.R --help
```

### 完整测试运行

```bash
Rscript tests/run_tests.R
```

### 直接测试命令

```bash
Rscript scripts/main.R \
  --input_file tests/data/expression_matrix.csv \
  --group_file tests/data/group_info.csv \
  --case_group AR \
  --control_group Control \
  --output_dir tests/output/manual-test \
  --seed 42 \
  --svm_k 4 \
  --svm_max_features_cap 6 \
  --svm_rank_top_n 6 \
  --timeout_seconds 300
```