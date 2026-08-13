---
name: lasso-logistics-analysis
description: "Use when building a binary classification model from an expression matrix or other omics feature matrix with LASSO logistic regression, cross-validation, and coefficient path visualization. NOT for: multiclass classification, survival/Cox models, or ordinary linear regression."
---
# LASSO 逻辑回归分析

## 何时读取外部文件

| 情况 | 要读取的文件 | 用途 |
|-----------|--------------|---------|
| **需要算法详细信息** | `references/algorithm.md` | LASSO 目标函数、交叉验证和结果解释 |
| **需要运行分析** | `scripts/main.R` | 执行：`Rscript scripts/main.R --input_file ... --group_file ...` |
| **遇到错误** | `references/troubleshooting.md` | 常见错误及解决方案 |
| **需要 CLI 示例** | `references/cli-guide.md` | 详细的 CLI 使用示例 |
| **需要测试数据** | `tests/data/` | 用于测试的示例输入文件 |
| **需要工作流实现细节** | `scripts/run_analysis.R` | 查看编排、输出和文件写入行为 |
| **需要输入验证或错误处理细节** | `scripts/utils.R`, `scripts/io.R` | 查看验证、解析、日志记录和标准化防护措施 |

---

## 用法

```bash
Rscript scripts/main.R \
  --input_file ./expression_matrix.csv \
  --group_file ./groups.csv \
  --case_group case \
  --control_group control \
  --output_dir ./output/ \
  --nfolds 10 \
  --timeout_seconds 1800 \
  --seed 42
```

---

## 参数

| 短选项 | 长选项 | 类型 | 默认值 | 描述 |
|-------|------|------|---------|-------------|
| `-i` | `--input_file` | character | **必需** | 表达矩阵文件（特征为行，样本为列） |
| `-g` | `--group_file` | character | **必需** | 包含样本列和分组列的分组文件 |
| `-c` | `--case_group` | character | **必需** | 编码为 `1` 的病例类别标签 |
| `-t` | `--control_group` | character | **必需** | 编码为 `0` 的对照类别标签 |
| `-f` | `--feature` | character | `NULL` | 可选的特征列表文件或逗号分隔的特征名称 |
| `-n` | `--nfolds` | integer | `10` | 交叉验证折数：`3`、`5`、`7`、`10` |
|  | `--cv_title` | character | `""` | 交叉验证图的可选标题 |
|  | `--path_title` | character | `""` | 系数路径图的可选标题 |
|  | `--timeout_seconds` | integer | `1800` | 最大运行时长（秒） |
| `-o` | `--output_dir` | character | `./output/` | 输出目录 |
| `-s` | `--seed` | integer | `42` | 用于确保可复现性的随机种子 |

---

## 输入格式

### 表达矩阵（`input_file`）

特征为行、样本为列，采用 CSV 或 TSV 格式，第一列为特征 ID。

```csv
,Sample01,Sample02,Sample03
TSPAN6,1.8479,1.8318,3.8276
TNMD,0.0349,0.0533,1.3889
```

### 分组文件（`group_file`）

包含样本 ID 和二元分组标签的 CSV 或 TSV 文件。

```csv
sample,group
Sample01,case
Sample02,control
Sample03,case
```

### 可选特征文件（`feature`）

每行一个特征，或者直接通过 CLI 传入以逗号分隔的特征列表。

```text
TNMD
DPM1
SCYL3
```

---

## 输出文件

| 文件 | 描述 |
|------|-------------|
| `coefficient.csv` | `lambda.min` 处的所有系数 |
| `feature_matrix.csv` | 包含原始分组标签和二元事件列的样本级矩阵 |
| `selected_features.txt` | `lambda.min` 处的非零特征（不包括截距，如有） |
| `missing_features.txt` | 矩阵中未找到的请求特征（如适用） |
| `lasso_lambda_binary_plot.pdf` | 交叉验证曲线 |
| `lasso_var_binary_plot.pdf` | 系数路径图 |
| `session_info.txt` | R 会话和软件包版本信息 |

---

## 工作流程

### 第 1 步：验证输入
**检查验证规则或解析行为时**，请阅读：`scripts/utils.R` 和 `scripts/io.R`

- 检查文件是否存在
- 读取表达矩阵和分组文件
- 验证两个文件中的样本是否匹配
- 确保两个类别均存在，且每个类别至少有 2 个样本

### 第 2 步：准备建模矩阵
**检查类别编码或特征筛选行为时**，请阅读：`scripts/modeling.R`

- 将 `case_group` 编码为 `1`，将 `control_group` 编码为 `0`
- 可选择将特征限制为用户提供的特征面板
- 将表达数据转置为样本×特征格式

### 第 3 步：拟合 LASSO 逻辑回归
**了解统计方法或 lambda 选择时**，请阅读：`references/algorithm.md`

- 使用 `alpha = 1` 训练二项式 `glmnet` 模型
- 运行 `cv.glmnet` 以选择最优 lambda
- 提取 `lambda.min` 处的系数

### 第 4 步：保存结果和可视化图表
**检查输出生成或绘图行为时**，请阅读：`scripts/run_analysis.R` 和 `scripts/plotting.R`

- 将扁平化输出文件直接保存到 `output_dir`
- 生成交叉验证和系数路径 PDF 图
- 默认将图标题留空，除非用户提供自定义标题

---

## 方法

### LASSO 逻辑回归
该模型通过 L1 惩罚最小化二项式偏差，将较弱的系数收缩至零，并执行嵌入式特征选择。

### 交叉验证
`cv.glmnet` 在 `nfolds` 个折中评估候选 lambda 值，并报告 `lambda.min` 和 `lambda.1se`。

---

## 示例

### 基本用法
```bash
Rscript scripts/main.R \
  -i ./expression_matrix.csv \
  -g ./groups.csv \
  -c case \
  -t control \
  -o ./output
```

### 使用特征面板
```bash
Rscript scripts/main.R \
  -i ./expression_matrix.csv \
  -g ./groups.csv \
  -c case \
  -t control \
  -f ./genes.txt \
  -o ./output
```

### 自定义折数和随机种子
```bash
Rscript scripts/main.R \
  -i ./expression_matrix.csv \
  -g ./groups.csv \
  -c case \
  -t control \
  -n 5 \
  --timeout_seconds 900 \
  -s 123 \
  -o ./output
```

### 自定义图标题
```bash
Rscript scripts/main.R \
  -i ./expression_matrix.csv \
  -g ./groups.csv \
  -c case \
  -t control \
  --cv_title "LASSO Cross-Validation" \
  --path_title "LASSO Coefficient Paths" \
  --timeout_seconds 1200 \
  -o ./output
```

---

## 错误处理

### 常见错误

| 错误 | 原因 | 解决方案 |
|-------|-------|----------|
| `SKILL_FILE_NOT_FOUND` | 输入文件不存在 | 检查文件路径 |
| `SKILL_EMPTY_FILE` | 输入文件存在，但不包含任何数据 | 验证文件不为空 |
| `SKILL_PARSE_ERROR` | 无法将输入文件解析为 CSV 或 TSV | 检查分隔符、表头和编码 |
| `SKILL_FILE_WRITE_ERROR` | 无法创建输出目录或向其中写入内容 | 检查输出路径和权限 |
| `SKILL_EMPTY_DATA` | 加载的表中没有可用的行或列 | 验证输入文件是否包含有效数据 |
| `SKILL_MISSING_COLUMNS` | 分组文件未提供必需的列 | 提供样本列和分组列 |
| `SKILL_INVALID_TYPE` | 参数或数据字段的类型错误 | 确保数值字段为数值类型且字符串有效 |
| `SKILL_SAMPLE_MISMATCH` | 矩阵与分组文件中的样本 ID 不一致 | 确保名称完全一致 |
| `SKILL_INVALID_GROUP` | 在分组文件中找不到病例/对照标签 | 检查 `--case_group` 和 `--control_group` |
| `SKILL_INVALID_DATA` | 类别、样本或有效特征数量过少 | 检查输入结构和特征列表 |
| `SKILL_INVALID_PARAMETER` | `nfolds` 不受支持或参数为空 | 使用文档中说明的参数值 |
| `SKILL_DEPENDENCY_MISSING` | 未安装必需的 R 包 | 安装缺失的 CRAN 包 |
| `SKILL_TIMEOUT` | 分析超出配置的时间限制 | 减少特征数量或增大 `--timeout_seconds` |
| `SKILL_MEMORY_ERROR` | 运行时环境无法分配足够的内存 | 减小矩阵规模或工作负载 |
| `SKILL_RUNTIME_ERROR` | 发生意外的运行时错误 | 查看控制台中的确切错误并重试 |

**如果错误仍然存在**，请阅读：`references/troubleshooting.md`

---

## 测试

### 使用示例数据进行测试

```bash
# Check help
Rscript scripts/main.R --help

# Run with sample data
Rscript scripts/main.R \
  -i tests/data/expression_matrix.csv \
  -g tests/data/groups.csv \
  -c case \
  -t control \
  -f tests/data/genes.csv \
  --timeout_seconds 1800 \
  -o tests/output
```

### 验证命令

```bash
# Check coefficient output
ls -la tests/output/coefficient.csv

# Check plots exist
ls -la tests/output/lasso_lambda_binary_plot.pdf
ls -la tests/output/lasso_var_binary_plot.pdf
```

---

## 实现检查清单

- [x] 使用 `optparse` 解析 CLI
- [x] 使用 `set.seed()` 确保可复现性
- [x] 使用 `requireNamespace()` 检查依赖项
- [x] 记录会话信息
- [x] 使用 `--timeout_seconds` 控制超时
- [x] 清理临时文件
- [x] SKILL.md 中包含文件读取说明
- [x] 模块化脚本结构（每个文件少于 150 行）
- [x] 提供测试数据
- [x] 使用 SKILL_* 代码处理错误
- [x] 脚本位于 `scripts/` 目录中
- [x] 参考资料位于 `references/` 目录中

---

*最后更新：2026-04-17 | 版本：1.0.0*