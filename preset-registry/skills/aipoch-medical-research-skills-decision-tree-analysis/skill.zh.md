---
name: decision-tree-analysis
description: Use when building a decision tree model in R and generating feature importance ranking outputs. Supports classification and regression, automatic task detection, parameter validation, model evaluation summaries, and exports of feature-importance tables and figures.
license: MIT
author: AIPOCH
---
> **来源**：[https://github.com/aipoch/medical-research-skills](https://github.com/aipoch/medical-research-skills)

# 决策树分析

使用此技能从表格文件训练决策树模型，并导出特征重要性排名结果。

## 何时使用此技能

- 你需要在 R 中执行分类或回归决策树工作流。
- 你需要以表格和图形形式输出特征重要性排名。
- 你需要具备参数验证和标准化输出文件夹的命令行工作流。

## 主要命令

```bash
Rscript scripts/main.R \
  --data_file <input_file> \
  --target_var <target_column> \
  --task_type <auto|classification|regression> \
  --output_dir <output_dir>
```

## 前置条件

- shell 中可以使用 `Rscript`。
- 所需 R 包：`optparse`、`data.table`、`rpart`。
- 使用 `Rscript -e 'install.packages(c("optparse", "data.table", "rpart"), repos="https://cloud.r-project.org")'` 安装缺失的软件包。

## 核心参数

| 参数 | 是否必需 | 说明 |
|----------|----------|-------------|
| `--data_file` | 是 | CSV、TXT 或 TSV 格式的输入数据文件 |
| `--target_var` | 是 | 要预测的目标列 |
| `--task_type` | 否 | `auto`、`classification` 或 `regression`。默认为 `auto` |
| `--output_dir` | 否 | 输出目录，默认为 `./Decision_Tree_Results` |
| `--train_ratio` | 否 | 介于 0 和 1 之间的训练集比例，默认为 `0.7` |
| `--max_depth` | 否 | 最大树深度，默认为 `5` |
| `--minsplit` | 否 | 尝试拆分所需的最少观测数，默认为 `10` |
| `--minbucket` | 否 | 终端节点中允许的最少观测数，默认为 `3` |
| `--cp` | 否 | 用于剪枝的复杂度参数，默认为 `0.001` |
| `--seed` | 否 | 随机种子，默认为 `42` |
| `--exclude_vars` | 否 | 要从建模中排除的列，以逗号分隔 |
| `--importance_top_n` | 否 | 在重要性图中显示的排名靠前特征数量，默认为 `15` |
| `--output_format` | 否 | 表格输出格式：`csv` 或 `txt`，默认为 `csv` |

## 输入要求

- 输入文件必须包含目标列。
- 排除 `target_var` 和 `exclude_vars` 后，其余所有列均用作预测变量列。
- 如果第一列未命名，或使用了类似 `id` 或 `rowname` 的 ID 类名称，且其值唯一，此技能会自动将其视为行名，而不是预测变量。
- 训练前会移除任一建模列中包含缺失值的行。
- 字符型预测变量会自动转换为因子。
- 在 `auto` 模式下，具有超过 10 个唯一值的数值型目标变量会被视为回归任务；否则会被视为分类任务。
- 筛选后至少需要 5 个完整行。

输入示例：

```csv
study_hours,sleep_hours,attendance,score_band
3.5,7.0,0.88,medium
5.0,6.5,0.95,high
2.0,8.0,0.75,low
```

## 最简工作流

1. 确认输入文件存在，且目标列名称正确。
2. 使用目标列和可选的建模参数运行 `scripts/main.R`。
3. 检查输出目录：特征重要性表位于 `table/` 下，排名图位于 `figure/` 下。

如果省略 `--data_file` 或 `--target_var`，脚本将退出并返回 `SKILL_MISSING_INPUT`。

## 输出

预期的输出结构：

```text
<output_dir>/
├── data/
├── table/
└── figure/
```

主要结果文件：

- `table/decision_tree_feature_importance.<csv|txt>`
- `table/decision_tree_metrics.csv`
- `figure/decision_tree_feature_importance.pdf`

其他文件：

- `data/decision_tree_predictions.csv`
- `data/decision_tree_model.rds`

注意：

- 每次运行只会写入一个特征重要性表。文件扩展名由 `--output_format` 控制。
- 评估指标保存在 `table/decision_tree_metrics.csv` 中。
- 如果拟合出的树未发生分裂，运行仍会完成，但会发出警告，因为在非常小的训练集上，特征重要性和预测结果可能会退化。

特征重要性结果字段包括：

- `rank`
- `feature`
- `importance`
- `relative_importance`

## 选择任务类型

- 对于 `yes/no`、`risk_level` 或 `species` 等分类目标，请使用 `classification`。
- 对于 `price`、`score` 或 `yield` 等连续数值目标，请使用 `regression`。
- 当目标类型很明确，并且希望脚本自动推断时，请使用 `auto`。

## 按需阅读以下文件

| 需求 | 文件 |
|------|------|
| 决策树方法和特征重要性详细信息 | `references/algorithm.md` |
| 更多 CLI 示例 | `references/cli-guide.md` |
| 错误诊断 | `references/troubleshooting.md` |
| 主执行入口 | `scripts/main.R` |
| 示例测试数据 | `tests/data/` |

## 测试数据

- `tests/data/dt_sample1.csv`：CSV 分类样本，包含一个未命名的第一列，该列会被自动识别为行名。建议目标：`fustat`。
- `tests/data/dt_sample2.csv`：CSV 分类样本，包含一个未命名的第一列，该列会被自动识别为行名。建议目标：`fustat`。
- `tests/data/dt_sample3.txt`：制表符分隔的高维分类样本，包含一个未命名的第一列，该列会被自动识别为行名。建议目标：`Group`。

## 快速示例

分类：

```bash
Rscript scripts/main.R \
  --data_file tests/data/dt_sample1.csv \
  --target_var fustat \
  --task_type classification \
  --max_depth 4 \
  --output_dir tests/output_dt_sample1_classification
```

对第二个 CSV 样本进行分类：

```bash
Rscript scripts/main.R \
  --data_file tests/data/dt_sample2.csv \
  --target_var fustat \
  --task_type classification \
  --output_dir tests/output_dt_sample2_classification
```

TXT 输入示例：

```bash
Rscript scripts/main.R \
  --data_file tests/data/dt_sample3.txt \
  --target_var Group \
  --task_type classification \
  --max_depth 4 \
  --output_dir tests/output_dt_sample3_classification
```

## 验证

```bash
Rscript scripts/main.R --help
```

```bash
Rscript scripts/main.R \
  --data_file tests/data/dt_sample1.csv \
  --target_var fustat \
  --task_type classification \
  --output_dir tests/validation_dt_sample1
```

```bash
Rscript scripts/main.R \
  --data_file tests/data/dt_sample2.csv \
  --target_var fustat \
  --task_type classification \
  --output_dir tests/validation_dt_sample2
```

```bash
Rscript scripts/main.R \
  --data_file tests/data/dt_sample3.txt \
  --target_var Group \
  --task_type classification \
  --output_dir tests/validation_dt_sample3
```

运行分析后，请验证以下文件是否存在：

- `tests/validation_dt_sample1/table/decision_tree_feature_importance.csv`
- `tests/validation_dt_sample1/table/decision_tree_metrics.csv`
- `tests/validation_dt_sample1/figure/decision_tree_feature_importance.pdf`
- `tests/validation_dt_sample2/table/decision_tree_feature_importance.csv`
- `tests/validation_dt_sample2/table/decision_tree_metrics.csv`
- `tests/validation_dt_sample2/figure/decision_tree_feature_importance.pdf`
- `tests/validation_dt_sample3/table/decision_tree_feature_importance.csv`
- `tests/validation_dt_sample3/table/decision_tree_metrics.csv`
- `tests/validation_dt_sample3/figure/decision_tree_feature_importance.pdf`

## 常见错误

- `SKILL_FILE_NOT_FOUND`：输入文件路径错误或无法访问。
- `SKILL_MISSING_COLUMNS`：目标列或请求排除的列缺失。
- `SKILL_INVALID_DATA`：输入数据格式不正确或不适合模型训练。
- `SKILL_INVALID_PARAMETER`：参数值无效。
- `SKILL_INSUFFICIENT_DATA`：筛选后剩余的可用行或类别过少。
- `SKILL_DEPENDENCY_MISSING`：缺少所需的 R 包，例如 `optparse`、`data.table` 或 `rpart`。

如果运行成功，但日志显示决策树未发生分裂，请调低 `--minsplit` 和 `--minbucket`，或提供更多训练数据行，然后再采信排序输出。

如果问题原因不明显，请阅读 `references/troubleshooting.md`。