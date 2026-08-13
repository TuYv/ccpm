---
name: elastic-net-feature-selection
description: "Use when selecting predictive genes or other molecular features from bulk expression matrices for binary case-vs-control classification with elastic net logistic regression, including coefficient path and cross-validation plots. Trigger keywords: elastic net, glmnet, feature selection, binary classification, lambda.min, lambda.1se. NOT for: survival/Cox modeling, multiclass outcomes, single-cell data, or non-expression tables."
---
# Elastic Net 特征选择

## 何时使用

- 此技能适用于对批量表达矩阵进行病例与对照的二分类。
- 当你需要使用 Elastic Net 逻辑回归进行特征选择、生成系数路径以及基于 `cv.glmnet` 选择 lambda 时，请使用此技能。
- 仅当分组文件仍然只包含两个结果类别时，才可使用 `Tumor` 和 `Normal` 等自定义标签。

## 不适用范围

- 生存分析或 Cox 建模
- 多分类结果
- 单细胞数据
- 非表达数据表

不适用范围的强制约束：

- 如果分组文件包含请求的 `case_group` 和 `control_group` 以外的任何标签，命令将以 `SKILL_INVALID_DATA` 停止，而不是静默丢弃样本。
- 如果验证后缺少任一请求的类别，命令将以 `SKILL_INVALID_DATA` 停止。

## 何时读取外部文件

| 情况 | 要读取的文件 | 用途 |
|-----------|--------------|---------|
| **需要了解 alpha、lambda 选择或特征选择行为** | `references/algorithm.md` | Elastic Net 逻辑回归、惩罚混合、交叉验证和系数选择假设 |
| **需要权威的可执行入口点** | `scripts/main.R` | 运行：`Rscript scripts/main.R --input_file ... --group_file ... --output_dir ...` |
| **需要参数示例、冒烟测试命令或已记录的本地运行结果** | `references/cli-guide.md` | 经过验证的 CLI 示例，涵盖常规运行、保守运行和测试数据运行 |
| **首次运行或回归测试需要随附的示例输入** | `tests/data/` | 示例表达矩阵、分组文件和特征列表 |
| **遇到错误、警告或超时问题** | `references/troubleshooting.md` | 常见故障、控制台警告解读和恢复步骤 |

---

## 用法

```bash
Rscript scripts/main.R \
  --input_file ./expression_matrix.csv \
  --group_file ./groups.csv \
  --feature_file ./genes.csv \
  --case_group case \
  --control_group control \
  --alpha auto \
  --alpha_grid 0,0.25,0.5,0.75,1 \
  --nfolds 5 \
  --lambda_choice lambda.min \
  --standardize TRUE \
  --timeout_seconds 600 \
  --output_dir ./output/ \
  --seed 42
```

---

## 参数

| 短选项 | 长选项 | 类型 | 默认值 | 说明 |
|-------|------|------|---------|-------------|
| `-i` | `--input_file` | character | **必需** | 表达矩阵文件（基因为行，样本为列） |
| `-g` | `--group_file` | character | **必需** | 包含样本列和分组列的分组信息文件 |
| `-f` | `--feature_file` | character | `NULL` | 可选的特征列表文件；如果省略，则使用矩阵中的所有行 |
| `-c` | `--case_group` | character | `case` | 分组文件中的阳性类别标签 |
| `-d` | `--control_group` | character | `control` | 分组文件中的阴性类别标签 |
| `-a` | `--alpha` | character | `0.5` | Elastic Net 混合参数：数值 `0`-`1`，或使用 `auto` 通过交叉验证进行选择 |
|  | `--alpha_grid` | character | `0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1` | 当 `alpha=auto` 时评估的以逗号分隔的 alpha 候选值 |
| `-n` | `--nfolds` | integer | `5` | 交叉验证的折数；如果某个类别的样本较少，将自动减少 |
| `-l` | `--lambda_choice` | character | `lambda.min` | 系数提取规则：`lambda.min` 或 `lambda.1se` |
| `-z` | `--standardize` | logical | `TRUE` | 在 `glmnet` 内部对特征进行标准化 |
| `-t` | `--timeout_seconds` | integer | `600` | 以秒为单位的运行超时限制 |
| `-o` | `--output_dir` | character | `./output/` | 输出目录 |
| `-s` | `--seed` | integer | `42` | 用于确保可复现性的随机种子 |

---

## 输入格式

### 表达矩阵 (input_file)

基因为行，样本为列，采用 CSV 格式，第一列为基因 ID。

```csv
,Sample01,Sample02,Sample03
TNMD,0.0349,0.0533,1.3889
DPM1,4.8627,5.4208,5.6370
```

### 分组文件 (group_file)

包含样本 ID 和二元分组标签的 CSV 文件。

```csv
sample,group
Sample01,case
Sample02,control
Sample03,case
```

### 特征文件 (feature_file)

可选的纯文本文件或单列 CSV 文件，每行包含一个特征。

```csv
TNMD
DPM1
SCYL3
```

---

## 输出文件

| 文件 | 说明 |
|------|-------------|
| `alpha_tuning.csv` | 每个 alpha 候选值的交叉验证性能汇总 |
| `model_coefficients.csv` | 所选 lambda 对应的系数，包括截距 |
| `selected_features.csv` | 按绝对效应大小排序的稀疏选择特征；当所选 `alpha` 为 `0`（岭回归）时，写入空文件 |
| `feature_matrix.csv` | 用于模型拟合的样本×特征分析矩阵 |
| `coefficient_path.pdf` | 不同 lambda 值下的系数轨迹图 |
| `cv_curve.pdf` | 包含 `lambda.min` 和 `lambda.1se` 的交叉验证误差曲线 |
| `session_info.txt` | R 会话和软件包版本信息 |

---

## 工作流程

### 第 1 步：验证输入
- **在为首次运行或回归测试准备输入文件时**，阅读：`tests/data/`
- 检查文件是否存在
- 拒绝空输入文件
- 检测分组文件中的样本列和分组列
- 拒绝包含所请求二元比较范围之外标签的分组文件
- 验证表达矩阵与分组文件之间的样本匹配情况

### 第 2 步：准备建模矩阵
- 将样本限制为所请求的病例组和对照组
- 获取可选特征列表与矩阵行名的交集
- 为 `glmnet` 构建样本×特征数值矩阵
- 在建模前删除零方差特征

### 第 3 步：运行弹性网络
- **在 `alpha`、`lambda.min` 和 `lambda.1se` 之间进行选择时**，阅读：`references/algorithm.md`
- 如果 `alpha=auto`，使用相同的交叉验证折评估候选 `alpha_grid`
- 使用 `glmnet` 拟合正则化路径
- 运行 `cv.glmnet` 以估计最优 lambda
- 提取 `lambda.min` 或 `lambda.1se` 对应的系数
- 应用运行时超时限制并捕获非致命警告

### 第 4 步：导出结果
- **需要确切的调用模式或输出检查命令时**，阅读：`references/cli-guide.md`
- 保存调优表和所选特征
- 生成系数路径图和交叉验证图
- 记录会话信息以确保可复现性

---

## 方法

### 弹性网络逻辑回归
弹性网络通过 `alpha` 结合 lasso（`L1`）和 ridge（`L2`）惩罚，在稳定相关预测变量的同时实现稀疏特征选择。

### 交叉验证
`cv.glmnet` 评估 lambda 路径，并同时报告 `lambda.min` 和更为保守的 `lambda.1se`。

### 自动选择 Alpha
当 `alpha=auto` 时，该技能会对 `alpha_grid` 中的所有值复用相同的交叉验证折，比较每个候选值的最小交叉验证误差，并在报告系数和基于 lambda 的输出之前选择最佳 alpha。

如果所选的 `alpha` 为 `0`，则模型是岭回归，而不是稀疏弹性网络。在这种情况下，`selected_features.csv` 将写入为空，以避免将稠密的岭回归系数错误标记为选定特征；请改用 `model_coefficients.csv` 进行系数排序。

### 特征选择规则
选定特征是指在所选 lambda 下，绝对值超过较小数值容差的系数，不包括截距项。

如果所选的 `alpha` 为 `0`，工作流将写入一个空的 `selected_features.csv`，因为岭回归系数在设计上是稠密的，不应被错误标记为稀疏选定特征。

---

## 示例

### 推荐的首次运行
```bash
Rscript scripts/main.R \
  -i expression_matrix.csv \
  -g groups.csv \
  -f genes.csv \
  -a auto \
  --alpha_grid 0,0.25,0.5,0.75,1 \
  -o output/first_run
```

### 固定 Alpha 基线
```bash
Rscript scripts/main.R \
  -i expression_matrix.csv \
  -g groups.csv \
  -f genes.csv \
  -a 0.5 \
  -o output/fixed_alpha
```

### 更保守的选择
```bash
Rscript scripts/main.R \
  -i expression_matrix.csv \
  -g groups.csv \
  -l lambda.1se \
  -o output/lambda_1se
```

---

## 错误处理

### 常见错误

| 错误 | 原因 | 解决方案 | 了解更多 |
|-------|-------|----------|-----------|
| `SKILL_FILE_NOT_FOUND` | 输入文件不存在 | 检查文件路径和权限 | `references/troubleshooting.md#skill_file_not_found` |
| `SKILL_EMPTY_DATA` | 输入文件存在但为空 | 重新导出包含数据行的输入文件 | `references/troubleshooting.md#skill_empty_data` |
| `SKILL_MISSING_COLUMNS` | 分组文件缺少样本/分组列 | 验证分组文件的结构 | `references/troubleshooting.md#skill_missing_columns` |
| `SKILL_SAMPLE_MISMATCH` | 文件之间的样本 ID 没有重叠 | 确保矩阵列名与分组文件匹配 | `references/troubleshooting.md#skill_sample_mismatch` |
| `SKILL_INVALID_PARAMETER` | CLI 参数无效 | 检查允许的值和范围 | `references/troubleshooting.md#skill_invalid_parameter` |
| `SKILL_INVALID_DATA` | 剩余样本或可用特征过少 | 检查筛选选项和输入数据 | `references/troubleshooting.md#skill_invalid_data` |
| `SKILL_DEPENDENCY_MISSING` | 所需的 R 包未安装 | 安装缺失的软件包后重新运行 | `references/troubleshooting.md#skill_dependency_missing` |
| `SKILL_PKG_VERSION` | 已安装的软件包版本过旧 | 升级所需的软件包 | `references/troubleshooting.md#skill_pkg_version` |
| `SKILL_TIMEOUT` | 运行超出配置的时间限制 | 增大 `timeout_seconds` 或减小数据规模 | `references/troubleshooting.md#skill_timeout` |
| `SKILL_RUNTIME_ERROR` | 发生意外的运行时错误或输出写入失败 | 检查输出路径权限、可用空间以及最后一条控制台消息 | `references/troubleshooting.md#skill_runtime_error` |

**如果错误仍然存在**，请阅读：`references/troubleshooting.md`

---

## 测试

### 使用示例数据进行测试

```bash
# Check help
Rscript scripts/main.R --help

# Run with bundled test data
Rscript scripts/main.R \
  -i tests/data/expression_matrix.csv \
  -g tests/data/groups.csv \
  -f tests/data/genes.csv \
  -a auto \
  --alpha_grid 0,0.5,1 \
  -o tests/output \
  -n 5 \
  -t 600
```

### 验证命令

```bash
# Inspect selected features (may be header-only if auto-alpha selects ridge)
cat tests/output/selected_features.csv

# Check plots exist
ls -la tests/output
```

---

## 实现检查清单

- [x] 使用 `optparse` 解析 CLI 参数
- [x] 使用 `set.seed()` 确保可复现性
- [x] 使用 `requireNamespace()` 检查依赖项
- [x] 运行时使用 `library()` 加载包
- [x] 记录会话信息
- [x] 使用 `setTimeLimit()` 控制超时
- [x] 处理控制台警告
- [x] 强制执行超出范围标签规则
- [x] 报告 `gc()` 快照
- [x] 在 `SKILL.md` 中提供文件读取说明
- [x] 模块化脚本结构
- [x] 提供测试数据
- [x] 使用 `SKILL_*` 代码进行错误处理
- [x] 脚本位于 `scripts/` 目录中
- [x] 参考资料位于 `references/` 目录中

---

*最后更新：2026-04-20 | 版本：1.0.0*