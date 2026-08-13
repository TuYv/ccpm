---
name: rf-model-importance-analysis
description: Use when you need a standardized R CLI workflow to train a two-class random forest model from an expression-like feature matrix, rank variable importance, and generate reproducible error and importance plots. NOT for regression tasks, multi-class classification, missing-value imputation, preprocessing, or remote data fetching.
license: MIT
author: AIPOCH
---
> **来源**：[https://github.com/aipoch/medical-research-skills](https://github.com/aipoch/medical-research-skills)

# RF 模型重要性分析

## 快速开始

请先使用以下三个命令之一，仅在需要额外调优时再查阅完整参数表。

### 1. 标准运行

```bash
Rscript scripts/main.R \
  --input_file tests/data/expression_matrix.csv \
  --group_file tests/data/group_info.csv \
  --case_group AR \
  --control_group Control \
  --output_dir tests/output/manual-test \
  --seed 42 \
  --timeout_seconds 300
```

### 2. 调优后的重要性分析运行

```bash
Rscript scripts/main.R \
  --input_file tests/data/expression_matrix.csv \
  --group_file tests/data/group_info.csv \
  --case_group AR \
  --control_group Control \
  --output_dir tests/output/custom-importance \
  --seed 42 \
  --rf_ntree 800 \
  --rf_mtry 4 \
  --rf_imp_type 2 \
  --rf_imp_threshold 1 \
  --rf_top_n 8 \
  --rf_importance_top_n 8 \
  --timeout_seconds 300
```

### 3. 仅重新渲染绘图

仅在完整分析已创建 `output_dir/data/rf_result.rds` 后运行此命令。

```bash
Rscript scripts/main.R \
  --plot_only TRUE \
  --output_dir tests/output/manual-test \
  --seed 42 \
  --timeout_seconds 300
```

## 何时读取外部文件

| 情况 | 要读取的文件 | 用途 |
|-----------|--------------|---------|
| 需要算法详情 | `references/algorithm.md` | 说明随机森林建模、重要性指标、假设和结果解读 |
| 需要执行分析 | `scripts/main.R` | 使用完整的 `Rscript` 命令运行 CLI 入口点 |
| 遇到错误 | `references/troubleshooting.md` | 将错误代码对应到原因和修复方法 |
| 需要 CLI 示例 | `references/cli-guide.md` | 查看安装步骤和可运行的命令示例 |
| 需要可运行的冒烟测试 | `tests/data/` | 使用随附的小型数据集进行验证 |

## 停止条件

如果符合以下任一情况，请勿使用此技能：

- 任务属于回归、多分类、时间序列建模或远程数据获取。
- 输入仍需进行插补、归一化、批次校正或其他预处理。
- 特征矩阵包含缺失值、非数值特征列或不匹配的样本 ID。

如果符合其中任一条件，请停止操作，并在运行此技能之前转交给预处理工作流或其他建模工作流。

## 用法

运行 CLI 之前，请确保数据已针对二分类任务完成清理：样本按行排列、仅包含数值特征列且无缺失值。插补、归一化和批次校正不在此技能的范围内。

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

| 短参数 | 长参数 | 类型 | 默认值 | 必需 | 说明 |
|-------|------|------|---------|----------|-------------|
| `-i` | `--input_file` | character | 无 | 是，除非使用 `--plot_only TRUE` | 表达矩阵文件，样本按行排列，特征按列排列 |
| `-g` | `--group_file` | character | 无 | 是，除非使用 `--plot_only TRUE` | 分组文件，第一列为样本 ID |
| `-c` | `--case_group` | character | 无 | 是，除非使用 `--plot_only TRUE` | 病例组标签 |
| `-r` | `--control_group` | character | 无 | 是，除非使用 `--plot_only TRUE` | 对照组标签 |
| `-o` | `--output_dir` | character | `output` | 是 | 技能根目录内的输出目录 |
| `-p` | `--plot_only` | logical | `FALSE` | 否 | 复用 `output_dir/data/rf_result.rds` 并在不重新训练的情况下重新生成绘图 |
| `-s` | `--seed` | integer | `42` | 否 | 用于保证可复现性的随机种子 |
| `-t` | `--timeout_seconds` | integer | `600` | 否 | 运行的已用时间限制 |
|  | `--rf_ntree` | integer | `500` | 否 | 随机森林中的树数量 |
|  | `--rf_mtry` | integer | `NA` | 否 | 每次分裂时抽样的变量数；`NA` 使用包的默认值 |
|  | `--rf_nodesize` | integer | `NA` | 否 | 终端节点的最小大小；`NA` 使用包的默认值 |
|  | `--rf_imp_type` | integer | `1` | 否 | 传递给 `randomForest::importance` 的重要性指标类型；允许的值为 `1` 或 `2` |
|  | `--rf_imp_threshold` | numeric | `0` | 否 | `rf_top_features.csv` 中保留的最低重要性分数 |
|  | `--rf_top_n` | integer | `30` | 否 | 写入 `rf_top_features.csv` 的最大行数 |
|  | `--rf_error_xlab` | character | `Number of Trees` | 否 | RF 误差图的 x 轴标签 |
|  | `--rf_error_ylab` | character | `Error` | 否 | RF 误差图的 y 轴标签 |
|  | `--rf_error_line_size` | numeric | `0.6` | 否 | RF 误差图的线宽 |
|  | `--rf_error_line_alpha` | numeric | `1` | 否 | RF 误差图的线条透明度 |
|  | `--rf_error_line_color` | character | `#6C85F9,#D9503D,#939DE4,#DEA441,#A2C6D6,#E9B9E1,#BDD69F,#EBC98A` | 否 | 非 OOB 曲线的逗号分隔线条颜色 |
|  | `--rf_error_line_type` | character | `dashed` | 否 | 类别特定误差曲线的线型 |
|  | `--rf_error_line_oob_type` | character | `solid` | 否 | OOB 曲线的线型 |
|  | `--rf_error_legend_position` | character | `none` | 否 | RF 误差图的图例位置 |
|  | `--rf_error_border_color` | character | `black` | 否 | RF 误差图的面板边框颜色 |
|  | `--rf_error_border_fill` | character | `NA` | 否 | RF 误差图的面板填充；使用文本形式的 `NA` 或 `NULL` |
|  | `--rf_error_border_size` | numeric | `0.8` | 否 | RF 误差图的面板边框宽度 |
|  | `--rf_error_base_size` | numeric | `14` | 否 | RF 误差图的基础字体大小 |
|  | `--rf_error_width` | numeric | `6` | 否 | RF 误差图的宽度，单位为英寸 |
|  | `--rf_error_height` | numeric | `5` | 否 | RF 误差图的高度，单位为英寸 |
|  | `--rf_importance_sort` | logical | `TRUE` | 否 | 在重要性图中对变量进行排序 |
|  | `--rf_importance_top_n` | integer | `10` | 否 | 重要性图中显示的最大变量数 |
|  | `--rf_importance_label_x_ann` | logical | `TRUE` | 否 | 在重要性图中显示 x 轴刻度标签 |
|  | `--rf_importance_label_color` | character | `black` | 否 | 重要性图中的文本和点轮廓颜色 |
|  | `--rf_importance_label_cex` | numeric | `0.9` | 否 | 重要性图中的标签大小 |
|  | `--rf_importance_point_cex` | numeric | `0.9` | 否 | 重要性图中的点大小 |
|  | `--rf_importance_point_shape` | integer | `23` | 否 | 重要性图中的点形状 |
|  | `--rf_importance_point_fill` | character | `red` | 否 | 重要性图中的点填充颜色 |
|  | `--rf_importance_line_color` | character | `gray` | 否 | 重要性图中的线段颜色 |
|  | `--rf_importance_theme_border` | logical | `TRUE` | 否 | 在重要性图中绘制面板边框 |
|  | `--rf_importance_theme_offset` | numeric | `0.2` | 否 | 重要性图中的坐标轴扩展系数 |
|  | `--rf_importance_title` | character | `Variable Importance` | 否 | 重要性图的主标题 |
|  | `--rf_importance_title_x_ann` | logical | `TRUE` | 否 | 在重要性图中显示标题和坐标轴注释 |
|  | `--rf_importance_width` | numeric | `6` | 否 | RF 重要性图的宽度，单位为英寸 |
|  | `--rf_importance_height` | numeric | `5` | 否 | RF 重要性图的高度，单位为英寸 |

## 输入格式

### 表达矩阵

- CSV 或 TSV。
- 第一列：样本 ID。
- 其余列：数值型特征。
- 样本必须按行排列。
- 不允许缺失值或非数值型特征值。

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
- 必须有一个附加列同时包含病例组和对照组标签。
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
| `data/rf_result.rds` | RDS | 包含训练后的随机森林及元数据的序列化模型包 |
| `table/rf_feature_importance.csv` | CSV | 使用所选重要性指标生成的完整特征重要性排名表 |
| `table/rf_top_features.csv` | CSV | 应用 `--rf_imp_threshold` 和 `--rf_top_n` 后筛选出的顶部特征表 |
| `plot/rf_error_plot.pdf` | PDF | 展示 OOB 和各类别分类误差随树数量变化的误差曲线 |
| `plot/rf_importance_plot.pdf` | PDF | 由 `randomForest::varImpPlot()` 生成的变量重要性图 |
| `session_info.txt` | TXT | R 版本、平台和软件包版本信息 |

## 错误处理

- 成功运行时以状态码 `0` 退出。
- 运行失败时以状态码 `1` 退出。
- 错误消息使用标准化名称，例如 `SKILL_FILE_NOT_FOUND` 和 `SKILL_INVALID_PARAMETER`。
- 输出路径会经过验证，以确保 `--output_dir` 无法写入 Skill 根目录之外。
- 分析过程绝不会发起网络请求，也绝不会通过 `eval()`、`exec()` 或 `system()` 执行用户输入。

常见错误码：

| 错误码 | 含义 |
|------------|---------|
| `SKILL_FILE_NOT_FOUND` | 输入文件或仅绘图所需的产物不存在 |
| `SKILL_MISSING_COLUMNS` | 输入文件不包含必需的列 |
| `SKILL_EMPTY_DATA` | 输入文件为空，或必需的模型表不可用 |
| `SKILL_INVALID_PARAMETER` | CLI 参数、分组设置、数值约束或路径无效 |
| `SKILL_SAMPLE_MISMATCH` | 表达矩阵与分组文件之间的样本 ID 不匹配 |
| `SKILL_PACKAGE_NOT_FOUND` | 缺少一个或多个必需的 CRAN 软件包 |

有关详细的修复方法，请阅读：`references/troubleshooting.md`

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
  --rf_ntree 200 \
  --rf_top_n 5 \
  --rf_importance_top_n 5 \
  --timeout_seconds 300
```