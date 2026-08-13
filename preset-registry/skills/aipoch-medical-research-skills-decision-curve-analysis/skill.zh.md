---
name: decision-curve-analysis
description: "Use when evaluating the clinical utility of a binary prediction model from a single clinical CSV file by fitting a logistic decision-curve model, plotting decision and clinical-impact curves, and exporting summary outputs. NOT for: survival calibration, ROC-only discrimination analysis, nomogram construction, or time-to-event outcomes."
license: MIT
skill-author: AIPOCH
---
# 决策曲线分析

## 何时使用

当你需要执行以下操作时，请使用此技能：
- 评估二元预测模型在不同阈值概率下是否能够增加临床净获益；
- 基于临床队列绘制决策曲线和临床影响曲线；
- 导出可审计的 DCA 模型对象，以及摘要文本和 PDF 文件。

典型用户请求：
- “对此二元结局和风险评分数据集运行决策曲线分析。”
- “为此预测模型生成 DCA 图和临床影响图。”
- “比较此病例对照队列在不同阈值下的净获益。”

## 何时不应使用

请勿将此技能用于：
- 事件发生时间或生存结局；
- 不包含决策曲线输出、仅进行 ROC 判别能力分析；
- 构建列线图或进行校准曲线分析；
- 多分类结局或非二元终点。

## 何时读取外部文件

| 情况 | 要读取的文件 | 目的 |
|-----------|--------------|---------|
| 需要算法详细信息 | `references/algorithm.md` | 统计方法和公式 |
| 需要运行分析 | `scripts/main.R` | 获取完整命令 |
| 遇到错误 | `references/troubleshooting.md` | 查找解决方案 |
| 需要 CLI 示例 | `references/cli-guide.md` | 参数用法示例 |

---

## 用法

```bash
Rscript scripts/main.R \
  --data_file ./clinical_dca_data.csv \
  --outcome_col fustat \
  --predictor_col riskScore \
  --output_dir ./output/
```

---

## 参数

| 短选项 | 长选项 | 类型 | 默认值 | 说明 |
|-------|------|------|---------|-------------|
| `-d` | `--data_file` | character | **必填** | 以行名作为样本 ID 的临床 CSV 文件 |
|  | `--outcome_col` | character | `fustat` | 编码为 `0/1` 的二元结局列 |
|  | `--predictor_col` | character | `riskScore` | 逻辑回归 DCA 模型中使用的数值型预测变量列 |
|  | `--study_design` | character | `case-control` | 研究设计：`case-control` 或 `cohort` |
|  | `--population_prevalence` | double | `0.3` | 病例对照 DCA 的人群患病率（队列设计将忽略此项） |
|  | `--threshold_by` | double | `0.01` | 阈值步长；低于 0.005 的值会显著增加计算时间 |
|  | `--confidence_level` | double | `0.95` | 传递给 `rmda::decision_curve()` 的置信水平 |
|  | `--population_size` | integer | `1000` | 临床影响图中使用的人群规模 |
|  | `--n_cost_benefits` | integer | `8` | 临床影响图中的成本效益标签数量 |
|  | `--show_confidence_intervals` | flag | `FALSE` | 在决策曲线上显示置信区间 |
|  | `--standardize_net_benefit` | flag | `FALSE` | 报告标准化净获益（`sNB`），而不是原始净获益（`NB`） |
|  | `--decision_curve_color` | character | `#E64B35` | 决策曲线的线条颜色 |
|  | `--impact_colors` | character | `#E64B35,#4DBBD5` | 临床影响图使用的两种以逗号分隔的颜色 |
|  | `--plot_width` | double | `6` | PDF 宽度，单位为英寸 |
|  | `--plot_height` | double | `5.5` | PDF 高度，单位为英寸 |
|  | `--font_family` | character | `sans` | PDF 字体族 |
|  | `--plot_title` | character | `Decision Curve Analysis` | 决策曲线图标题 |
|  | `--base_cex` | double | `0.9` | 基础文本大小倍数 |
| `-o` | `--output_dir` | character | `./output/` | 输出目录 |
|  | `--overwrite` | flag | `FALSE` | 允许写入非空的输出目录 |
| `-s` | `--seed` | integer | `42` | 用于确保可复现性的随机种子 |
| `-T` | `--timeout_seconds` | integer | `0` | 运行时间限制，单位为秒；`0` 表示禁用超时 |

---

## 输入格式

### 临床数据（`--data_file`）

以行名作为样本 ID 的 CSV 文件。数据集必须至少包含一个二元结局列和一个数值型预测变量列。

```csv
,fustat,riskScore,FOXP3,CD45
Patient_1,1,0.630147268229631,5.7783584300481,3.5407433709834
Patient_2,0,0.23007730941193,6.70308857663772,3.11795942819676
Patient_3,1,0.534809528754818,5.46860669585825,3.40086667402884
```

**要求**
- 文件扩展名必须为 `.csv`。
- 行名必须是非缺失且唯一的样本 ID。
- `outcome_col` 和 `predictor_col` 必须存在。
- 结局值必须使用 `0/1` 编码。验证前会将结局值强制转换为数值；逻辑值 `TRUE`/`FALSE` 会转换为 `1`/`0`。因子或字符值将产生 `SKILL_INVALID_PARAMETER`。
- 预测变量值必须是有限数值。
- 至少需要 20 行、5 个阳性结局和 5 个阴性结局。

**设计说明：** 选择 `--study_design cohort` 时，`--population_prevalence` 不会产生任何统计影响；将改用原始观测事件率。如果在队列研究设计中设置非默认的 `population_prevalence`，将发出警告。

---

## 输出文件

| 文件 | 格式 | 描述 |
|------|--------|-------------|
| `data/dca_model.rds` | RDS | 保存的 `rmda::decision_curve()` 结果对象 |
| `table/dca_summary.txt` | 纯文本 | 决策曲线净获益统计量的文本摘要 |
| `plot/decision_curve.pdf` | PDF | 决策曲线图 |
| `plot/clinical_impact_curve.pdf` | PDF | 临床影响曲线图 |
| `session_info.txt` | 纯文本 | 会话信息和运行参数 |

### `dca_summary.txt`

摘要字段包括：
- 来自 `summary(dca_model)` 的特定阈值净获益统计量；
- 所选的度量（`NB` 或 `sNB`）；
- 记录在 `session_info.txt` 中的拟合公式和研究设计背景。

---

## 工作流程

### 步骤 1：验证输入
- 确认临床 CSV 文件存在且可读。
- 检查所请求的结局列和预测变量列是否存在。
- 验证样本 ID、二元结局编码和数值型预测变量值。
- 如果 `population_prevalence` 为非默认值且 `study_design` 为 `cohort`，则发出警告。

### 步骤 2：准备分析数据集
- 仅保留 DCA 所需的结局列和预测变量列。
- 将结局值和预测变量值强制转换为数值。
- 拒绝行数过少或事件数/非事件数过少的队列。

### 步骤 3：拟合决策曲线模型
- 使用 `rmda::decision_curve()` 拟合逻辑回归决策曲线模型。
- 使用 `threshold_by` 构建从 `0` 到 `1` 的阈值网格。
- 当 `study_design` 为 `case-control` 时应用 `population_prevalence`。

### 步骤 4：保存输出
- 将拟合后的 DCA 对象保存为 `.rds`。
- 将文本摘要导出为 `.txt`。
- 将决策曲线和临床影响曲线渲染为 PDF。
- 记录会话元数据以确保可复现性。

---

## 智能体响应约定

成功运行后，报告：

1. 使用的**研究设计和预测变量**（例如，case-control、riskScore）
2. 报告的**净获益度量**（NB 或 sNB）
3. 网格使用的**阈值范围和步长**
4. **关键发现**：`dca_summary.txt` 中临床相关阈值处的净获益
5. **产物路径**：`plot/decision_curve.pdf`、`plot/clinical_impact_curve.pdf`、`data/dca_model.rds`

---

## 示例

### 基本用法

```bash
Rscript scripts/main.R \
  --data_file clinical_dca_data.csv \
  --outcome_col fustat \
  --predictor_col riskScore \
  --output_dir ./output/
```

### 使用自定义绘图的队列研究设计

```bash
Rscript scripts/main.R \
  --data_file clinical_dca_data.csv \
  --study_design cohort \
  --outcome_col fustat \
  --predictor_col riskScore \
  --plot_title "Cohort DCA" \
  --decision_curve_color "#3C5488" \
  --impact_colors "#3C5488,#00A087" \
  --show_confidence_intervals \
  --output_dir ./cohort_output/
```

### 使用随附的测试数据

```bash
Rscript scripts/main.R \
  --data_file tests/data/dca_data.csv \
  --outcome_col fustat \
  --predictor_col riskScore \
  --output_dir tests/output/ \
  --overwrite
```

---

## 错误处理

| 错误 | 原因 | 解决方案 |
|-------|-------|----------|
| `SKILL_INVALID_PARAMETER` | 无效的研究设计、无效的数值范围、无效的结局编码、行数或类别计数不足，或者模型拟合失败 | 检查参数、数据范围和二元结局编码 |
| `SKILL_FILE_NOT_FOUND` | 输入 CSV 不存在 | 验证输入路径 |
| `SKILL_MISSING_COLUMNS` | 缺少必需的列 | 检查 `outcome_col` 和 `predictor_col` 名称 |
| `SKILL_EMPTY_DATA` | 输入文件为空，或者不包含可用的行或列 | 检查 CSV 内容 |
| `SKILL_SAMPLE_MISMATCH` | 保留用于跨文件样本不匹配的场景 | 此单文件工作流预计不会出现此错误 |
| `SKILL_PACKAGE_NOT_FOUND` | 缺少必需的 R 包 | 使用以下命令安装：`Rscript -e "install.packages('rmda', repos='https://cloud.r-project.org')"` |

**如果错误仍然存在**，请阅读：`references/troubleshooting.md`

---

## 输入验证

此技能接受：单个临床 CSV 文件，其中包含一个二元结局列（采用 0/1 编码）和一个数值型预测变量列，用于对二元预测模型进行决策曲线分析。

如果用户的请求不涉及二元预测模型的决策曲线分析——例如，要求运行生存分析、仅构建 ROC 曲线、构建列线图或分析多分类结局——请勿继续执行此工作流。应改为回复：

> “决策曲线分析旨在通过计算各个决策阈值下的净获益，评估二元预测模型的临床实用性。您的请求似乎超出了此范围。请提供用于 DCA 的二元结局数据集，或使用更适合生存分析、ROC 分析或列线图构建的工具。”

---

## 测试

### 使用随附数据进行冒烟测试

```bash
Rscript scripts/main.R --help

Rscript scripts/main.R \
  --data_file tests/data/dca_data.csv \
  --outcome_col fustat \
  --predictor_col riskScore \
  --output_dir tests/output/ \
  --overwrite
```

### 自动化冒烟测试脚本

```bash
Rscript tests/run_smoke_test.R
```

可选的 shell 包装脚本：

```bash
bash tests/run_smoke_test.sh
```

### 预期输出

```text
tests/output/
|-- data/dca_model.rds
|-- plot/clinical_impact_curve.pdf
|-- plot/decision_curve.pdf
|-- session_info.txt
`-- table/dca_summary.txt
```

---

## 参考文献

1. Vickers AJ, Elkin EB. 决策曲线分析：一种评估预测模型的新方法。
2. 用于临床决策曲线分析的 rmda 软件包文档。

**有关算法的详细信息**，请阅读：`references/algorithm.md`

---

## 实现检查清单

- [x] 使用 `optparse` 进行 CLI 解析
- [x] 使用 `set.seed()` 确保可复现性
- [x] 顶层 CRAN 依赖项检查
- [x] 记录会话信息
- [x] 将超时参数作为 CLI 选项公开
- [x] 通过 `get_script_dir()` 使用相对路径调用 `source()`
- [x] `scripts/` 中的模块化脚本结构
- [x] `tests/data/` 中提供了测试数据
- [x] 使用 `SKILL_*` 代码进行错误处理
- [x] `references/` 中提供了参考文档

---

*最后更新：2026-04-27 | 版本：1.1.0*