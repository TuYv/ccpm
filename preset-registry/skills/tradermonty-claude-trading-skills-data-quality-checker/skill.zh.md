---
name: data-quality-checker
description: Validate data quality in market analysis documents and blog articles before publication. Use when checking for price scale inconsistencies (ETF vs futures), instrument notation errors, date/day-of-week mismatches, allocation total errors, and unit mismatches. Supports English and Japanese content. Advisory mode -- flags issues as warnings for human review, not as blockers.
---
## 概述

在发布前检测市场分析文档中的常见数据质量问题。检查器会验证五个类别：价格量级一致性、金融工具记法、日期/星期准确性、配分总和以及单位使用。所有发现结果均为建议性质 -- 它们标记潜在问题供人工审查，而非阻止发布。

## 何时使用

- 在发布每周策略博客或市场分析报告之前
- 在生成自动化市场摘要之后
- 在审查翻译文档（英语/日语）的数据准确性时
- 在将来自多个数据源（FRED、FMP、FINVIZ）的数据合并到一份报告中时
- 作为任何包含金融数据的文档的预检

## 前提条件

- Python 3.9+
- 无需外部 API 密钥
- 无需第三方 Python 包（仅使用标准库）

## 工作流程

### 步骤 1：接收输入文档

接受目标 markdown 文件路径和可选参数：
- `--file`：待验证的 markdown 文档路径（必需）
- `--checks`：以逗号分隔的要运行检查项列表（可选；默认：全部）
- `--as-of`：用于年份推断的参考日期，格式为 YYYY-MM-DD（可选）
- `--output-dir`：报告输出目录（可选；默认：`reports/`）

### 步骤 2：执行验证脚本

运行数据质量检查器脚本：

```bash
python3 skills/data-quality-checker/scripts/check_data_quality.py \
  --file path/to/document.md \
  --output-dir reports/
```

仅运行特定检查项：

```bash
python3 skills/data-quality-checker/scripts/check_data_quality.py \
  --file path/to/document.md \
  --checks price_scale,dates,allocations
```

提供用于年份推断的参考日期（对日期中未明确写出年份的文档很有用）：

```bash
python3 skills/data-quality-checker/scripts/check_data_quality.py \
  --file path/to/document.md \
  --as-of 2026-02-28
```

### 步骤 3：加载参考标准

阅读相关参考文档，以便结合上下文理解发现结果：

- `references/instrument_notation_standard.md` -- 各金融工具类别的标准 ticker 记法、位数提示和命名约定
- `references/common_data_errors.md` -- 常见错误目录，包括 FRED 数据延迟、ETF/期货量级混淆、节假日疏忽、配分总和陷阱以及单位混淆模式

使用这些参考文档来解释发现结果并提出修正建议。

### 步骤 4：审查发现结果

逐一检查输出中的每项发现：

- **ERROR** -- 高置信度问题（例如，经日历计算验证的日期与星期不匹配）。强烈建议修正。
- **WARNING** -- 较可能存在的问题，需人工判断（例如，价格量级异常、记法不一致、配分总和偏差超过 0.5%）。
- **INFO** -- 信息性提示（例如，bp/% 混用，可能是有意为之）。

### 步骤 5：生成质量报告

脚本会生成两个输出文件：

1. **JSON 报告**（`data_quality_YYYY-MM-DD_HHMMSS.json`）：机器可读的发现结果列表，包含严重性、类别、消息、行号和上下文。
2. **Markdown 报告**（`data_quality_YYYY-MM-DD_HHMMSS.md`）：按严重性级别分组的人类可读报告。

向用户呈现发现结果，并在解释中引用知识库。针对每个问题提出具体的修正建议。

## 输出格式

### JSON 发现结果结构

```json
{
  "severity": "WARNING",
  "category": "price_scale",
  "message": "GLD: $2,800 has 4 digits (expected 2-3 digits)",
  "line_number": 5,
  "context": "GLD: $2,800"
}
```

### Markdown 报告结构

```markdown
# Data Quality Report
**Source:** path/to/document.md
**Generated:** 2026-02-28 14:30:00
**Total findings:** 3

## ERROR (1)
- **[dates]** (line 12): Date-weekday mismatch: January 1, 2026 (Monday) -- actual weekday is Thursday

## WARNING (2)
- **[price_scale]** (line 5): GLD: $2,800 has 4 digits (expected 2-3 digits)
  > `GLD: $2,800`
- **[allocations]**: Allocation total: 110.0% (expected ~100%)
```

## 资源

- `scripts/check_data_quality.py` -- 主验证脚本
- `references/instrument_notation_standard.md` -- 记法与价格量级参考
- `references/common_data_errors.md` -- 常见错误模式与预防

## 关键原则

1. **建议模式**：所有发现结果都是供人工审查的警告。脚本成功执行时始终以退出码 0 结束，即使存在发现结果也是如此。退出码 1 保留用于脚本失败（文件未找到、解析错误）。

2. **章节感知的配分检查**：仅检查配分章节（由“配分”、"Allocation"等标题或“ウェイト”、“目安比率”等表格列识别）内的百分比。正文中的无关百分比（概率、RSI、同比增长率）将被忽略。

3. **双语支持**：同时处理英语和日语的日期格式、星期名称和章节标题。全角字符（％、〜、en-dash）会在处理前被规范化。

4. **年份推断**：对于没有明确年份的日期，检查器按以下优先级顺序推断年份：`--as-of` 选项、文档标题/元数据中找到的 YYYY 模式，或结合 6 个月跨年启发式的当前年份。

5. **位数计数启发式**：价格量级验证使用位数计数（小数点前的数字位数）而非绝对价格区间。这种方法不会因价格随时间变化而失效，同时仍能捕获 ETF/期货混淆错误。
