---
name: roc-diagnostic-performance
description: "Use when evaluating diagnostic biomarker performance from case-control expression data with logistic regression and ROC curves, exporting coefficient and AUC tables together with a ROC PDF. NOT for: survival analysis, time-to-event outcomes, multiclass classification, calibration curves, decision-curve analysis, or nomogram construction."
---
# ROC 诊断性能

## 何时使用

当你需要执行以下任务时，请使用此技能：
- 在病例-对照队列中评估一个或多个诊断标志基因；
- 根据标志物表达值构建多变量逻辑回归诊断模型；
- 比较完整模型与各个单独标志物的 ROC 性能。

典型用户请求：
- “使用这些基因构建病例样本与对照样本的诊断 ROC 模型。”
- “评估 FOXP3、CD45 和 CD3E 的 AUC，并将所有 ROC 曲线绘制在一起。”
- “对生物标志物表达数据运行逻辑回归并导出 ROC 结果。”

## 何时不使用

请勿将此技能用于：
- 具有事件发生时间结局的生存分析或预后分析；
- 多分类任务；
- 校准图、列线图或决策曲线分析；
- 非表达数据类型的诊断输入，例如影像数据、临床评分或仅包含突变信息的表格。

## 何时读取外部文件

| 情况 | 要读取的文件 | 用途 |
|-----------|--------------|---------|
| **需要算法细节** | `references/algorithm.md` | 逻辑回归、ROC、AUC 和建模假设 |
| **需要运行分析** | `scripts/main.R` | 执行 `Rscript scripts/main.R --expression_file ... --group_file ...` |
| **遇到错误** | `references/troubleshooting.md` | 常见的 `SKILL_*` 错误及解决方案 |
| **需要 CLI 示例** | `references/cli-guide.md` | 详细的命令行示例 |
| **需要测试数据** | `tests/data/` | 示例表达矩阵和分组文件 |

---

## 用法

```bash
Rscript scripts/main.R \
  --expression_file ./expression_matrix.csv \
  --group_file ./group_info.csv \
  --marker_genes FOXP3,CD45,CD3E \
  --case_group Disease \
  --output_dir ./output/ \
  --seed 42
```

---

## 参数

| 短参数 | 长参数 | 类型 | 默认值 | 说明 |
|-------|------|------|---------|-------------|
| `-e` | `--expression_file` | character | **必填** | CSV/TSV 格式的表达矩阵文件 |
| `-g` | `--group_file` | character | **必填** | 包含样本 ID 和标签的分组文件 |
| `-m` | `--marker_genes` | character | **必填** | 以逗号分隔的标志基因 |
| `-c` | `--case_group` | character | **必填** | 分组文件中的病例组标签 |
|  | `--group_col` | character | `NULL` | 可选的分组列名；省略时自动检测 |
| `-o` | `--output_dir` | character | `./output/` | 输出目录 |
|  | `--overwrite` | flag | `FALSE` | 允许写入非空输出目录 |
| `-s` | `--seed` | integer | `42` | 用于保证可复现性的随机种子 |
| `-T` | `--timeout_seconds` | integer | `0` | 运行时间限制（秒）；`0` 表示禁用超时限制 |
|  | `--plot_width` | double | `6` | ROC 图宽度（英寸） |
|  | `--plot_height` | double | `6` | ROC 图高度（英寸） |
|  | `--font_family` | character | `sans` | PDF 字体系列 |
|  | `--line_colors` | character | `#E64B35,#4DBBD5,#00A087,#3C5488,#F39B7F` | 以逗号分隔的 ROC 曲线颜色 |
|  | `--line_width` | double | `1.2` | ROC 曲线线宽 |
|  | `--show_diagonal` | character | `true` | 是否显示对角参考线：`true` 或 `false` |
|  | `--diagonal_color` | character | `#7F7F7F` | 对角线颜色 |
|  | `--diagonal_lty` | integer | `2` | 对角线线型 |
|  | `--plot_title` | character | `ROC Diagnostic Performance` | ROC 图标题 |
|  | `--x_label` | character | `1 - Specificity` | X 轴标签 |
|  | `--y_label` | character | `Sensitivity` | Y 轴标签 |
|  | `--base_cex` | double | `0.9` | 基础文本大小倍数 |
|  | `--legend_position` | character | `bottomright` | 图例位置 |
|  | `--legend_cex` | double | `0.8` | 图例文本大小 |

---

## 输入格式

### 表达矩阵（`expression_file`）

CSV 或 TSV 文件，其中基因为行，样本为列。第一列必须存储唯一的基因标识符。

```csv
gene,Sample1,Sample2,Sample3
FOXP3,8.4,7.1,3.8
CD45,2.1,1.9,5.4
CD3E,5.8,6.2,4.0
```

**要求**
- 文件扩展名必须为 `.csv`、`.tsv` 或 `.txt`。
- 第一列必须包含非缺失且唯一的基因标识符。
- 其余列必须为样本 ID。
- 所选标志基因在匹配样本中必须具有数值型的有限表达值。

### 分组文件（`group_file`）

CSV 或 TSV 文件，第一列为样本 ID，并且至少包含一个分组标签列。

```csv
sample,group
Sample1,Disease
Sample2,Disease
Sample3,Control
```

**要求**
- 文件扩展名必须为 `.csv`、`.tsv` 或 `.txt`。
- 第一列必须包含非缺失且唯一的样本 ID。
- 必须至少存在一个分组列。
- `case_group` 值必须出现在所选分组列中。
- 至少需要 10 个匹配样本、2 个病例样本和 2 个对照样本。

---

## 输出文件

| 文件 | 描述 |
|------|-------------|
| `data/analysis_data.rds` | 用于模型拟合的匹配样本级分析数据集 |
| `data/roc_model.rds` | 保存的逻辑回归模型包，包含数据和所选基因 |
| `table/model_coefficients.csv` | 逻辑回归系数、z 统计量、p 值和优势比 |
| `table/roc_auc_summary.csv` | 完整模型和每个标志基因的 AUC 值 |
| `plot/roc_curve.pdf` | 完整模型和各个标志基因的 ROC 曲线 |
| `session_info.txt` | 会话信息和运行参数 |

### model_coefficients.csv

| 列 | 描述 |
|--------|-------------|
| `term` | 模型项名称 |
| `estimate` | 逻辑回归系数 |
| `std_error` | 系数的标准误 |
| `z_value` | Wald z 统计量 |
| `p_value` | Wald 检验 p 值 |
| `odds_ratio` | 取指数后的系数 |
| `odds_ratio_95_ci` | 带 95% 置信区间的优势比 |

### roc_auc_summary.csv

| 列 | 描述 |
|--------|-------------|
| `model` | 完整模型或标志基因名称 |
| `auc` | ROC 曲线下面积 |

---

## 工作流程

### 步骤 1：验证输入
- 检查表达矩阵和分组文件是否存在，以及格式是否受支持。
- 验证基因标识符和样本 ID 的唯一性。
- 匹配两个文件共有的样本。

### 步骤 2：准备分析数据集
- 仅保留表达矩阵中存在的指定标志基因。
- 将匹配的表达值与分组标签合并。
- 将所选病例组转换为二元结局标签。

### 步骤 3：拟合逻辑回归
- 使用所选标志基因拟合多变量逻辑回归模型。
- 提取系数估计值、标准误、p 值和优势比。

### 步骤 4：计算 ROC 性能
- 生成完整逻辑回归模型的 ROC 曲线。
- 为每个单独的标志基因生成 ROC 曲线。
- 计算完整模型和每个标志基因的 AUC 值。

### 第 5 步：保存输出
- 将匹配后的分析数据集和模型包保存为 `.rds` 文件。
- 将系数和 AUC 汇总表保存为 `.csv` 文件。
- 将合并后的 ROC 图保存为 PDF。

---

## 示例

### 基本用法

```bash
Rscript scripts/main.R \
  -e expression_matrix.csv \
  -g group_info.csv \
  -m FOXP3,CD45,CD3E \
  -c Disease \
  -o ./output/
```

### 指定分组列并自定义绘图

```bash
Rscript scripts/main.R \
  -e expression_matrix.csv \
  -g group_info.csv \
  -m FOXP3,CD45,CD3E \
  -c Disease \
  --group_col diagnosis \
  --plot_width 8 \
  --plot_height 6 \
  --plot_title "Biomarker ROC Comparison" \
  --legend_position topright \
  -o ./output/
```

### 使用测试数据

```bash
Rscript scripts/main.R \
  -e tests/data/sample_expression_matrix.csv \
  -g tests/data/sample_group_info.csv \
  -m FOXP3,CD45,CD3E \
  -c Disease \
  -o tests/expected_output/ \
  --overwrite
```

---

## 错误处理

| 错误 | 原因 | 解决方案 |
|-------|-------|----------|
| `SKILL_INVALID_PARAMETER` | 缺少必需参数、选项值无效、矩阵/分组结构无效、病例标签无效、病例-对照数量不足或逻辑回归拟合失败 | 检查参数名称、输入内容、类别平衡情况和模型稳定性 |
| `SKILL_FILE_NOT_FOUND` | 输入文件不存在 | 验证文件路径 |
| `SKILL_EMPTY_DATA` | 输入文件不包含可用行，或筛选后没有保留任何请求的标志物 | 检查文件内容、分隔符和标志物名称 |
| `SKILL_MISSING_COLUMNS` | 请求的分组列不存在 | 验证 `--group_col` 和分组文件的表头 |
| `SKILL_SAMPLE_MISMATCH` | 表达矩阵和分组文件没有共同的样本 ID | 验证两个文件中的样本 ID 是否完全匹配 |
| `SKILL_PACKAGE_NOT_FOUND` | 未安装所需的 R 包 | 安装缺失的 CRAN 包 |

**如果错误仍然存在**，请阅读：`references/troubleshooting.md`

---

## 测试

### 使用内置数据进行冒烟测试

```bash
Rscript scripts/main.R --help

Rscript scripts/main.R \
  -e tests/data/sample_expression_matrix.csv \
  -g tests/data/sample_group_info.csv \
  -m FOXP3,CD45,CD3E \
  -c Disease \
  -o tests/expected_output/ \
  --overwrite
```

### 自动化冒烟测试脚本

```bash
Rscript tests/run_smoke_test.R
```

可选的 shell 封装脚本：

```bash
bash tests/run_smoke_test.sh
```

### 预期输出

```text
tests/expected_output/
|-- data/analysis_data.rds
|-- data/roc_model.rds
|-- plot/roc_curve.pdf
|-- session_info.txt
|-- table/model_coefficients.csv
`-- table/roc_auc_summary.csv
```

---

## 参考文献

1. Hosmer DW, Lemeshow S, Sturdivant RX (2013). *应用逻辑回归*。
2. Fawcett T (2006). ROC 分析导论。*模式识别快报*。
3. Robin X 等（2011）。pROC：用于在 R 和 S+ 中分析和比较 ROC 曲线的开源包。*BMC 生物信息学*。

**有关算法的详细信息**，请阅读：`references/algorithm.md`

---

## 实现检查清单

- [x] 使用 `optparse` 解析 CLI
- [x] 使用 `set.seed()` 确保可复现性
- [x] 使用 `requireNamespace()` 检查依赖项
- [x] 记录会话信息
- [x] 将超时参数公开为 CLI 选项
- [x] 在 `SKILL.md` 中提供文件读取说明
- [x] 在 `scripts/` 中采用模块化脚本结构
- [x] 在 `tests/data/` 中提供测试数据
- [x] 使用 `SKILL_*` 代码处理错误
- [x] 在 `references/` 中记录参考资料

---

*最后更新：2026-04-17 | 版本：2.1.0*