---
name: lightgbm-analysis
description: Use when training a LightGBM model on tabular data in R and returning model metrics, feature importance ranking tables, and feature importance plots.
license: MIT
author: AIPOCH
---
> **来源**：[https://github.com/aipoch/medical-research-skills](https://github.com/aipoch/medical-research-skills)

# LightGBM 分析

使用此技能基于表格数据构建 LightGBM 模型，并将特征重要性排名结果同时导出为表格和图形。

## 适用场景

- 你需要使用 R 编写的命令行 LightGBM 工作流。
- 你需要对结构化表格数据进行分类或回归。
- 你需要输出按重要性排序的特征，用于报告或解释。
- 你需要在 `table/`、`figure/` 和 `data/` 下生成标准化输出。

## 主要命令

```bash
Rscript scripts/main.R \
  --data_file <input_file> \
  --target_var <target_column> \
  --output_dir <output_dir>
```

## 前置条件

- shell 中可以使用 `Rscript`。
- 所需 R 包：`optparse`、`data.table`、`lightgbm`。
- 使用 `Rscript -e 'install.packages(c("optparse", "data.table"), repos="https://cloud.r-project.org")'` 安装基础依赖项。
- 从 LightGBM 项目安装 R `lightgbm` 包，因为该包通常无法从 CRAN 获取。

## 核心参数

| 参数 | 是否必需 | 说明 |
|----------|----------|-------------|
| `--data_file` | 是 | CSV 格式或制表符分隔的 TXT/TSV 格式输入数据文件 |
| `--target_var` | 是 | 用于建模的目标列 |
| `--output_dir` | 否 | 输出目录，默认为 `./LightGBM_Results` |
| `--fail_if_output_exists` | 否 | 当 `output_dir` 已包含文件时停止运行，而不是覆盖文件 |
| `--task_type` | 否 | `auto`、`regression`、`binary` 或 `multiclass`。默认为 `auto` |
| `--feature_cols` | 否 | 以逗号分隔的特征列。默认使用除目标列和已删除列之外的所有列 |
| `--drop_cols` | 否 | 建模前要排除的列，以逗号分隔 |
| `--importance_type` | 否 | `gain` 或 `split`。默认为 `gain` |
| `--top_n` | 否 | 重要性图中要显示的特征数量。默认为 `20` |
| `--output_format` | 否 | 以 `csv` 或 `txt` 格式导出表格。默认为 `csv` |

## 建模参数

| 参数 | 默认值 | 说明 |
|----------|---------|-------------|
| `--metric` | `auto` | 与任务类型匹配的评估指标 |
| `--test_size` | `0.2` | 测试集所占比例 |
| `--valid_size` | `0.2` | 从训练分区中划分的验证集比例 |
| `--nrounds` | `500` | 最大提升轮数 |
| `--learning_rate` | `0.05` | 收缩率 |
| `--num_leaves` | `31` | 每棵树的最大叶子数 |
| `--max_depth` | `-1` | 最大树深度，`-1` 表示不显式限制 |
| `--min_data_in_leaf` | `5` | 每个叶子的最小样本数 |
| `--feature_fraction` | `0.8` | 列采样比例 |
| `--bagging_fraction` | `0.8` | 行采样比例 |
| `--bagging_freq` | `1` | Bagging 频率 |
| `--lambda_l1` | `0` | L1 正则化 |
| `--lambda_l2` | `0` | L2 正则化 |
| `--early_stopping_rounds` | `50` | 提前停止的耐心轮数 |
| `--seed` | `42` | 随机种子 |

## 输入要求

- 输入文件必须包含目标列。
- 建议使用 `.csv` 或 `.tsv` 输入文件。`.txt` 文件必须使用制表符分隔。
- 删除目标值缺失的行后，此技能要求至少保留 20 行数据。
- 特征可以是数值、整数、逻辑值、字符或类似因子的文本。
- 字符特征会在内部进行标签编码，以供 LightGBM 使用。
- 建模前会删除目标值缺失的行。
- 特征缺失值将保留，由 LightGBM 处理。
- 如果 `task_type=auto`，脚本会根据目标值推断任务是回归还是分类。

内置测试数据示例：

```csv
V1,fustat,CAMK2N2,GGT6,GPR161,RAB26,RIBC2
TCGA-C5-A1M5,1,2.248291938,5.274690305,2.825215762,3.121114894,5.35318565
TCGA-EA-A5O9,0,3.346176843,5.404368414,2.604616977,0.629473197,4.429314674
TCGA-C5-A3HL,0,3.363100974,5.363314779,4.124799581,4.127228806,4.916596068
```

## 最简工作流程

1. 确认输入文件存在，并且目标列名正确。
2. 训练前，移除标识符列或敏感列，例如 `id`、`sample_id`、`patient_id`、登录号，或内置示例标识符列 `V1`。
3. 设置 `--drop_cols`，并可选择设置 `--feature_cols`，确保模型只使用预期的预测变量。
4. 如果需要防止覆盖，请添加 `--fail_if_output_exists` 或选择一个新的 `--output_dir`。
5. 运行 `scripts/main.R`。
6. 查看 `table/` 中的特征重要性表、模型指标和修复指导。
7. 查看 `figure/` 中的特征重要性排名图，并查看 `data/` 中的运行摘要。

避免使用含义不明确的文本导出格式。如果 `.txt` 文件被解析为单列，请先将其重新导出为制表符分隔文本或 CSV，然后再重新运行。

为了在小型审计环境中快速验证，建议优先使用下方所示的内置 `dt_sample3.txt` 冒烟测试，并减小 `--nrounds` 和 `--early_stopping_rounds`。使用 `dt_sample1.csv` 的完整二分类示例仍可作为完整工作流程示例，但其运行时间可能超出较短的时间预算。

如果省略 `--data_file` 或 `--target_var`，脚本将退出并返回 `SKILL_MISSING_INPUT`。

## 输出

预期的输出结构：

```text
<output_dir>/
├── table/
├── figure/
└── data/
```

主要结果文件：

- `table/lightgbm_feature_importance.<output_format>`
- `table/lightgbm_model_metrics.<output_format>`
- `table/lightgbm_remediation.<output_format>`
- `figure/lightgbm_feature_importance_<importance_type>.pdf`
- `data/lightgbm_run_summary.txt`
- 对分类或字符型预测变量进行编码时生成的 `data/lightgbm_categorical_levels.txt`

特征重要性表字段包括：

- `feature`
- `gain`
- `split`
- `cover`
- `importance_type`
- `importance_value`
- `rank`
- `gain_share`
- `split_share`

模型指标包括：

- `task_type`
- `metric_primary`
- `best_iteration`
- `train_rows`
- `valid_rows`
- `test_rows`
- `prediction_collapse_flag`
- `model_quality_flag`
- `interpretation_status`
- `primary_issue`
- `model_quality_issues`
- `rerun_hint`
- `model_quality_note`
- 特定于任务的评估指标，例如 `rmse`、`mae`、`accuracy`、`auc` 或 `logloss`

修复表字段包括：

- `task_type`
- `model_quality_flag`
- `interpretation_status`
- `issue_code`
- `issue_detail`
- `recommended_action`
- `suggested_rerun_change`

运行摘要文件包括已完成运行的任务类型、最佳迭代次数、主要质量字段、排名靠前的特征和工件路径。

## 覆盖行为

- 在现有 `output_dir` 中重新运行时，会使用新的指标、特征重要性表、修复表、图和会话元数据替换之前的结果文件。
- 如果希望运行停止而不是替换之前的工件，请设置 `--fail_if_output_exists`。
- 如果需要审计跟踪，建议使用带时间戳或每次运行独立的 `output_dir`。
- 当 `output_dir` 已包含文件时，脚本现在会发出警告。

## 成功与失败约定

成功：

- 控制台输出应以 `LightGBM analysis completed successfully` 结尾。
- `table/lightgbm_model_metrics.<output_format>` 和 `table/lightgbm_feature_importance.<output_format>` 应存在。
- `table/lightgbm_remediation.<output_format>` 和 `data/lightgbm_run_summary.txt` 应存在。
- `figure/lightgbm_feature_importance_<importance_type>.pdf` 应存在。
- 重要性表应至少包含一个非零的 `gain` 或 `split` 值。

失败或注意事项：

- 如果解析失败，应显示 `SKILL_*` 消息，而不是原始堆栈跟踪。
- 如果 `best_iteration <= 1`、预测结果坍缩为单一类别、`recall` 为 `0`、`f1` 为 `NA`，或所选的重要性值大多为零，则不要认为该排名可靠。
- 在解读导出的排名之前，请检查 `table/lightgbm_model_metrics.csv` 中的 `model_quality_flag` 和 `model_quality_note`。
- 使用 `interpretation_status` 判断运行结果是否已可用于报告：`eligible` 表示已可进行解读，`eligible_with_caveats` 表示该排名在附带注意事项的情况下可能仍可使用，而 `caution_only` 表示仅用于诊断。
- 检查 `table/lightgbm_remediation.csv` 和 `rerun_hint`，以了解确切的失败模式和建议的重新运行调整。
- 在信任输出结果之前，请重新检查分隔符选择、标识符泄漏以及 `--min_data_in_leaf`。

## 注意事项修复措施

- `best_iteration<=1`：降低 `--min_data_in_leaf`，并确认所选预测变量具有可用信号。
- `single_predicted_class`：在下游使用该排名之前，检查类别平衡和特征选择。
- `recall=0` 或 `no_positive_predictions`：在认为该运行结果已可用于报告之前，重新检查 `--feature_cols` 和目标变量的类别平衡。
- `<importance_type>_importance_sparse`：与另一种重要性类型进行比较，并检查保留的预测变量是否具有足够的信号。

## 智能体响应约定

当此技能执行完成时，智能体应报告：

- 解析后的 `task_type`
- `best_iteration`
- 来自 `table/lightgbm_model_metrics.<output_format>` 的主要评估指标
- 来自 `table/lightgbm_feature_importance.<output_format>` 的排名最高的特征
- `model_quality_flag` 和 `interpretation_status`
- 指标表、重要性表、修复措施表、图表和运行摘要文件的制品路径

如果 `model_quality_flag` 不是 `ok`，智能体必须明确说明该运行结果仅用于诊断或只能在附带注意事项的情况下使用，并包含来自 `rerun_hint` 或 `table/lightgbm_remediation.<output_format>` 的建议重新运行调整。

## 特征重要性指南

- 当你关注对损失降低的总体贡献时，使用 `gain`。
- 当你关注某个特征在树分裂中的使用频率时，使用 `split`。
- 对于大多数排名摘要和报告，优先使用 `gain`。
- 重要性较低并不意味着没有业务价值，尤其是在存在相关特征的情况下。

## 按需阅读这些文件

| 需求 | 文件 |
|------|------|
| LightGBM 方法详情和重要性解读 | `references/algorithm.md` |
| CLI 示例 | `references/cli-guide.md` |
| 错误诊断 | `references/troubleshooting.md` |
| 主入口点 | `scripts/main.R` |
| 示例测试数据 | `tests/data/` |

## 快速示例

使用 `dt_sample3.txt` 进行快速冒烟测试：

```bash
Rscript scripts/main.R \
  --data_file tests/data/dt_sample3.txt \
  --target_var Group \
  --drop_cols V1 \
  --task_type binary \
  --nrounds 80 \
  --early_stopping_rounds 20 \
  --top_n 15 \
  --output_dir tests/output_smoke_txt
```

适用于较短运行时间预算、便于审计的二分类预设：

```bash
Rscript scripts/main.R \
  --data_file tests/data/dt_sample1.csv \
  --target_var fustat \
  --drop_cols V1 \
  --task_type binary \
  --nrounds 120 \
  --early_stopping_rounds 20 \
  --output_dir tests/output_binary_fast
```

使用 `dt_sample1.csv` 的完整二分类工作流示例：

```bash
Rscript scripts/main.R \
  --data_file tests/data/dt_sample1.csv \
  --target_var fustat \
  --drop_cols V1 \
  --task_type binary \
  --output_dir tests/output_binary
```

使用 `dt_sample2.csv` 导出基于分裂的重要性示例：

使用此示例验证基于分裂的排名输出。将捆绑的示例视为可用于报告之前，请检查 `model_quality_flag` 和 `interpretation_status`，因为在较小的测试拆分上，此路径可能仍仅适用于诊断。

```bash
Rscript scripts/main.R \
  --data_file tests/data/dt_sample2.csv \
  --target_var fustat \
  --feature_cols CAMK2N2,GGT6,GPR161,RAB26,RIBC2 \
  --drop_cols V1 \
  --task_type binary \
  --importance_type split \
  --output_dir tests/output_binary_split
```

使用 `dt_sample1.csv` 并将 `RIBC2` 作为目标的便于审计的回归预设：

```bash
Rscript scripts/main.R \
  --data_file tests/data/dt_sample1.csv \
  --target_var RIBC2 \
  --drop_cols V1 \
  --task_type regression \
  --nrounds 120 \
  --early_stopping_rounds 20 \
  --output_dir tests/output_regression_fast
```

使用 `dt_sample1.csv` 并将 `RIBC2` 作为目标的完整回归工作流：

```bash
Rscript scripts/main.R \
  --data_file tests/data/dt_sample1.csv \
  --target_var RIBC2 \
  --drop_cols V1 \
  --task_type regression \
  --output_dir tests/output_regression
```

使用制表符分隔的 TXT 输入，并自动根据 `Group` 对二分类目标进行编码：

```bash
Rscript scripts/main.R \
  --data_file tests/data/dt_sample3.txt \
  --target_var Group \
  --drop_cols V1 \
  --task_type binary \
  --top_n 15 \
  --output_dir tests/output_group_txt
```

## 验证

```bash
Rscript scripts/main.R --help
```

使用 `## 快速示例` 下的冒烟测试进行快速验证。成功运行后，请确认所选 `output_dir` 下存在以下文件：

- `table/lightgbm_feature_importance.csv`
- `table/lightgbm_model_metrics.csv`
- `table/lightgbm_remediation.csv`
- `figure/lightgbm_feature_importance_<importance_type>.pdf`
- `data/lightgbm_run_summary.txt`
- 如果对分类或字符型预测变量进行了编码，则应存在 `data/lightgbm_categorical_levels.txt`

## 不适用的情况

- 输入文件是非结构化笔记、JSON 数据块或自由文本报告。
- 文本文件的分隔符未知，并且你无法检查或重新导出该文件。
- 表格仍包含不应作为模型特征的样本 ID、患者 ID、登录号或类似标识符。
- 输入仍包含尚未经过审查并从建模中移除的直接标识符或敏感字段。

## 常见错误

- `SKILL_FILE_NOT_FOUND`：输入文件路径错误或无法访问。
- `SKILL_MISSING_COLUMNS`：缺少目标列或请求的特征列。
- `SKILL_INVALID_DATA`：数据类型、目标编码或行数不适用于 LightGBM。
- `SKILL_DEGENERATE_MODEL`：训练已完成，但导出的重要性表全部为零，不应对其进行解读。
- `SKILL_INVALID_PARAMETER`：参数值无效。
- `SKILL_DEPENDENCY_MISSING`：缺少 `lightgbm` 等必需的软件包。
- `SKILL_TRAINING_FAILED`：LightGBM 训练失败。

在共享导出的产物之前，请确认已从建模过程和所有发布的表格中排除 `V1`、样本 ID 或患者 ID 等类似标识符的列。如果 `model_quality_flag` 不是 `ok`，应将该次运行视为诊断结果，而不是可供解读的排名。

如果问题原因不明显，请阅读 `references/troubleshooting.md`。