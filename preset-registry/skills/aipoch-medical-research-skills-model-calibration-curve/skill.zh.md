---
name: model-calibration-curve
description: "Use when assessing how well a survival model's predicted probabilities agree with observed outcomes by fitting a Cox model and generating bootstrap calibration curves at one or more prediction horizons from a clinical CSV file. NOT for: nomogram construction, univariate Cox screening, ROC analysis, or decision-curve analysis."
license: MIT
skill-author: AIPOCH
---
# 模型校准曲线

## 何时使用

当你需要执行以下操作时，请使用此技能：
- 使用 Bootstrap 校准曲线验证生存模型；
- 在多个时间范围比较预测生存概率与实际观察到的生存概率；
- 导出校准统计数据以及 PDF 可视化结果。

典型用户请求：
- “为此预后模型生成 1 年、2 年和 3 年校准曲线。”
- “检查由年龄、性别和风险构建的 Cox 模型是否具有良好的校准度。”
- “从此临床队列导出校准统计数据和校准 PDF。”

## 何时不使用

请勿将此技能用于：
- 构建列线图；
- 单变量或多变量 Cox 特征筛选；
- ROC、无需校准的区分度分析或决策曲线分析；
- 非生存结局或多分类任务。

## 何时读取外部文件

| 情况 | 要读取的文件 | 目的 |
|-----------|--------------|---------|
| 需要算法详细信息 | `references/algorithm.md` | 统计方法和公式 |
| 需要运行分析 | `scripts/main.R` | 获取完整命令 |
| 遇到错误 | `references/troubleshooting.md` | 查找解决方案 |
| 需要 CLI 示例 | `references/cli-guide.md` | 参数使用示例 |

## 输入验证

此技能接受：

- 一个临床 CSV 文件，其中样本 ID 作为行名，并包含生存时间、事件指示变量和预先选定的预后特征
- 通过在一个或多个预测时间点执行 Bootstrap 重采样来评估生存（Cox）模型校准度的请求

如果用户的请求不涉及基于临床 CSV 文件的生存模型校准，例如要求构建列线图、筛选 Cox 特征、生成 ROC 曲线、分析决策曲线或处理非生存结局，请勿继续执行此工作流。应改为回复：

> “model-calibration-curve 旨在通过从临床 CSV 文件生成 Bootstrap 校准曲线来验证生存模型的校准度。你的请求似乎超出了此范围。若要构建列线图，请使用 nomogram-construction 技能；若要进行 ROC 分析，请使用 roc-diagnostic-performance 技能；若要进行 DCA，请使用 decision-curve-analysis 技能。”

---

## 前置条件

所需 R 包：`rms`、`qs`、`openxlsx`、`optparse`。

使用以下命令安装：
```r
install.packages(c("rms", "qs", "openxlsx", "optparse"), repos = "https://cloud.r-project.org")
```

或者运行 Bootstrap 安装程序：
```bash
Rscript scripts/install_dependencies.R
```

> 注意：`--help` 要求已加载 `optparse`。如果在解析选项之前触发了包检查，请先安装 `optparse`，然后运行 `--help`。必须在 `scripts/main.R` 中应用根本修复方案（将重量级包检查推迟到参数解析之后）。

---

## 用法

```bash
Rscript scripts/main.R \
  --data_file ./clinical_data.csv \
  --features age,stage,risk \
  --years 1,2,3 \
  --output_dir ./output/
```

---

## 参数

| 短选项 | 长选项 | 类型 | 默认值 | 描述 |
|-------|------|------|---------|-------------|
| `-d` | `--data_file` | character | **必填** | 以样本 ID 作为行名的临床 CSV 文件 |
| `-f` | `--features` | character | **必填** | Cox 模型中使用的模型特征，以逗号分隔 |
| `-t` | `--time_col` | character | `futime` | 生存时间列 |
| `-e` | `--event_col` | character | `fustat` | 使用 0/1 编码的事件指示变量列 |
| `-y` | `--years` | character | `1,2,3` | 预测时间点，单位与 `time_col` 相同 |
| `-b` | `--bootstrap_reps` | integer | `1000` | `rms::calibrate()` 的 Bootstrap 重复次数 |
| `-o` | `--output_dir` | character | `./output/` | 输出目录 |
|  | `--overwrite` | flag | `FALSE` | 允许写入非空输出目录 |
| `-s` | `--seed` | integer | `42` | 用于确保结果可复现的随机种子 |
| `-T` | `--timeout_seconds` | integer | `0` | 运行时间限制（秒）；`0` 表示禁用超时 |
|  | `--plot_width` | double | `6` | PDF 宽度（英寸） |
|  | `--plot_height` | double | `6` | PDF 高度（英寸） |
|  | `--font_family` | character | `sans` | PDF 字体族 |
|  | `--line_width` | double | `1.5` | 校准曲线线宽 |
|  | `--colors` | character | `#0073C2,#EFC000,#868686,#CD534C,#7AA6DD` | 各时间点曲线使用的颜色，以逗号分隔 |
|  | `--plot_title` | character | `Calibration Curve` | 图表标题 |
|  | `--base_cex` | double | `0.9` | 基础文本大小倍数 |

---

## 输入格式

### 临床数据（`--data_file`）

CSV 文件，行名为样本 ID，列包含模型特征、生存时间和事件指示变量。

```csv
"",age,gender,stage,futime,fustat,risk
"SAMPLE_001",">65","Female","StageI&II",1.12,0,"high"
"SAMPLE_002","<=65","Male","StageIII&IV",1.92,1,"high"
"SAMPLE_003",">65","Male","StageI&II",4.47,1,"low"
```

**要求**
- 文件扩展名必须为 `.csv`。
- 行名必须是唯一的样本 ID。
- 所有请求的特征以及 `time_col` 和 `event_col` 都必须存在。
- 生存时间值必须是大于 `0` 的有限数值。
- 事件值必须使用 `0/1` 编码。
- 完整病例筛选后必须至少保留 30 个样本和至少 10 个事件。

### 特征选择（`--features`）

- 使用逗号分隔且不换行：`age,gender,risk`
- 在拟合 Cox 模型之前，字符型预测变量会被转换为因子。
- 如果验证后所有请求的特征均不存在，则停止运行。

---

## 输出文件

| 文件 | 格式 | 描述 |
|------|--------|-------------|
| `data/calibration_data.qs` | QS 序列化对象 | 序列化的校准结果包，包括校准对象和汇总元数据 |
| `table/calibration_statistics.xlsx` | Excel 工作簿（`.xlsx`） | 各时间点均值和整体模型汇总 |
| `plot/calibration_curve.pdf` | PDF（`.pdf`） | 组合校准曲线可视化 |
| `session_info.txt` | 纯文本（`.txt`） | 会话信息和运行参数 |

### `calibration_statistics.xlsx`

工作表：
- `Time_Point_Stats`：每个校准时间点的预测均值、观测均值和偏差校正均值。
- `Model_Summary`：整体 C-index、样本数、事件数、所选特征和拟合公式。

---

## 工作流程

### 步骤 1：验证输入
- 确认临床 CSV 文件存在且可读。
- 检查请求的特征、生存时间列和事件列是否存在。
- 删除所有必需列中存在缺失值的行。

### 步骤 2：准备生存建模数据
- 将生存时间列和事件列转换为数值型。
- 将字符型预测变量转换为因子。
- 拒绝包含非正随访时间、无效事件编码、样本数过少或事件数过少的数据。

### 步骤 3：构建校准模型
- 使用请求的特征拟合 Cox 比例风险模型。
- 使用 Bootstrap 重采样，针对每个预测时间点运行 `rms::calibrate()`。
- 计算拟合模型的一致性指数。

### 步骤 4：保存输出
- 将校准结果包序列化为 `.qs`。
- 将统计结果导出到 Excel。
- 生成组合校准 PDF。
- 记录会话元数据以确保可复现性。

---

## 示例

### 基础校准分析

```bash
Rscript scripts/main.R \
  --data_file clinical_data.csv \
  --features age,stage,risk \
  --output_dir ./output/
```

### 自定义时间点和 Bootstrap 次数

```bash
Rscript scripts/main.R \
  --data_file clinical_data.csv \
  --features age,gender,risk \
  --years 1,3,5 \
  --bootstrap_reps 1500 \
  --output_dir ./custom_output/
```

### 自定义绘图样式

```bash
Rscript scripts/main.R \
  --data_file clinical_data.csv \
  --features age,stage,risk \
  --plot_width 7 \
  --plot_height 6 \
  --line_width 2 \
  --colors "#1B9E77,#D95F02,#7570B3" \
  --plot_title "Three-Horizon Calibration" \
  --output_dir ./styled_output/
```

### 使用随附的测试数据

```bash
Rscript scripts/main.R \
  --data_file tests/data/sample_clinical_survival_data.csv \
  --features age,gender,risk \
  --bootstrap_reps 20 \
  --output_dir tests/output/ \
  --overwrite
```

---

## 错误处理

| 错误 | 原因 | 解决方案 |
|-------|-------|----------|
| `SKILL_INVALID_PARAMETER` | 缺少必需参数、数值无效、事件编码无效、完整病例不足、事件数不足或模型拟合失败 | 检查参数值、数据有效性以及事件数/样本数 |
| `SKILL_FILE_NOT_FOUND` | 输入 CSV 不存在 | 验证路径 |
| `SKILL_MISSING_COLUMNS` | 缺少必需的特征/时间/事件列 | 检查列名和拼写 |
| `SKILL_EMPTY_DATA` | 输入文件为空、完整病例筛选移除了所有行，或请求的特征均未保留 | 检查文件内容和请求的特征名称 |
| `SKILL_SAMPLE_MISMATCH` | 保留用于跨文件样本不匹配的场景 | 此单文件工作流中预计不会出现 |
| `SKILL_PACKAGE_NOT_FOUND` | 缺少必需的 R 包 | 使用以下命令安装：`Rscript -e "install.packages(c('rms', 'qs', 'openxlsx'), repos='https://cloud.r-project.org')"` |

**如果错误仍然存在**，请阅读：`references/troubleshooting.md`

---

## 测试

### 使用随附数据进行冒烟测试

```bash
Rscript scripts/main.R --help

Rscript scripts/main.R \
  --data_file tests/data/sample_clinical_survival_data.csv \
  --features age,gender,risk \
  --bootstrap_reps 20 \
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
|-- data/calibration_data.qs
|-- plot/calibration_curve.pdf
|-- session_info.txt
`-- table/calibration_statistics.xlsx
```

---

## 参考文献

1. Harrell FE. *回归建模策略*。
2. Steyerberg EW 等。预测模型性能评估。
3. Austin PC, Steyerberg EW. 生存模型校准的图形化评估。

**有关算法的详细说明**，请阅读：`references/algorithm.md`

---

## 实现检查清单

- [x] 使用 `optparse` 进行 CLI 解析
- [x] 使用 `set.seed()` 确保可复现性
- [x] 顶层 CRAN 依赖项检查
- [x] 会话信息记录
- [x] 将超时参数公开为 CLI 选项
- [x] 通过 `get_script_dir()` 使用相对路径调用 `source()`
- [x] `scripts/` 中采用模块化脚本结构
- [x] `tests/data/` 中提供了测试数据
- [x] 使用 `SKILL_*` 代码进行错误处理
- [x] `references/` 中提供了参考文档

---

*最后更新：2026-04-27 | 版本：2.1.0*