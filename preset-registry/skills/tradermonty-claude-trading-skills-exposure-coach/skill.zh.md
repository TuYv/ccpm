---
name: exposure-coach
description: Generate a one-page Market Posture summary with net exposure ceiling, growth-vs-value bias, participation breadth, and new-entry-allowed vs cash-priority recommendation by integrating signals from breadth, regime, and flow analysis skills.
---
# Exposure Coach

## 概述

Exposure Coach 将 market-breadth-analyzer、uptrend-analyzer、macro-regime-detector、market-top-detector、ftd-detector、theme-detector、sector-analyst 和 institutional-flow-tracker 的输出综合为一个统一的控制面决策。该技能在任何个股分析开始之前，回答独立交易者的核心问题：“我现在应该把多少资金投入股票？”

## 何时使用

- 在建立任何新股票仓位之前，用于确定合适的资金投入规模
- 在每个交易周开始时，用于校准投资组合敞口
- 当多个市场信号相互冲突、需要统一的市场姿态时
- 在重大宏观或市场事件之后，用于重新评估敞口上限
- 在市场形态切换时（扩张、集中、收缩）

## 前置条件

- Python 3.9+
- FMP API 密钥（设置 `FMP_API_KEY` 环境变量），用于获取 institutional-flow-tracker 数据
- 来自上游技能的输入 JSON 文件（见工作流程第 1 步）
- 标准库加 `argparse`、`json`、`datetime`

## 工作流程

### 第 1 步：收集上游技能输出

从各集成技能收集最新的 JSON 输出。每个文件提供一个特定的信号维度：

| 技能 | 输出文件模式 | 提供的信号 |
|-------|---------------------|-----------------|
| market-breadth-analyzer | `breadth_*.json` | 涨跌家数比、新高/新低 |
| uptrend-analyzer | `uptrend_*.json` | 上升趋势参与度百分比 |
| macro-regime-detector | `regime_*.json` | 当前市场形态（Concentration、Broadening 等） |
| market-top-detector | `top_risk_*.json` | 派发日计数、见顶概率评分 |
| ftd-detector | `ftd_*.json` | Follow-Through Day（跟进日）质量（市场底部确认） |
| theme-detector | `theme_detector_*.json` 或 `theme_*.json` | 活跃的投资主题与轮动 |
| sector-analyst | `sector_*.json` | 板块表现排名 |
| institutional-flow-tracker | `institutional_*.json` | 机构净买入/净卖出 |

### 第 2 步：运行敞口评分引擎

携带上游输出文件的路径执行敞口评分脚本：

```bash
python3 skills/exposure-coach/scripts/calculate_exposure.py \
  --breadth reports/breadth_latest.json \
  --uptrend reports/uptrend_latest.json \
  --regime reports/regime_latest.json \
  --top-risk reports/top_risk_latest.json \
  --ftd reports/ftd_latest.json \
  --theme reports/theme_latest.json \
  --sector reports/sector_latest.json \
  --institutional reports/institutional_latest.json \
  --output-dir reports/
```

该脚本接受部分输入；缺失的文件会降低置信度，但不会阻止执行。

规范的宏观形态报告必须包含嵌套的 `regime.confidence` 和 `composite.data_quality` 字段，以及有效的整数分量计数。缺失或格式不正确的可用性元数据、`very_low` 置信度以及可用分量为零，都会被视为缺失关键输入。它们不会贡献形态评分或倾向，且适用于正常的缺失输入扣减和置信度上限规则。绝不要通过手动把报告中的形态标签复制到敞口决策中来覆盖这种降级处理。

**校验陷阱：** 每次运行后，检查生成的 JSON 中的 `inputs_provided` 和 `inputs_missing` 字段。如果你在命令行上传入的某个文件仍然出现在 `inputs_missing` 中（例如敞口引擎未能识别的 theme-detector JSON），请将受影响的维度报告为已降级并保持置信度受限；不要仅因为存在 CLI 参数就认定所提供的输入已被纳入。

**Theme-detector 摄取注意事项：** 主题检测器通常输出 `theme_detector_YYYY-MM-DD_HHMMSS.json`，其中包含一个 `themes` 对象。如果该文件未被 `calculate_exposure.py` 识别，且 `theme` 仍留在 `inputs_missing` 中，请不要手动把主题强度折算进敞口上限。相反，应保持 Exposure Coach 的置信度受限，说明主题维度未被纳入，并在更完整的交易简报中单独总结主题/板块发现。

### 第 3 步：解读市场姿态摘要

查看生成的姿态报告，其中包含：

1. **敞口上限** -- 建议的最大股票配置比例（0-100%）
2. **倾向方向** -- 基于形态与资金流确定的成长 vs 价值倾斜
3. **参与度评估** -- 宽广（健康）vs 狭窄（脆弱）的市场
4. **行动建议** -- NEW_ENTRY_ALLOWED、REDUCE_ONLY 或 CASH_PRIORITY
5. **置信度等级** -- 依据输入完整程度为 HIGH、MEDIUM 或 LOW

### 第 4 步：应用敞口指引

将姿态建议映射为投资组合行动：

| 建议 | 行动 |
|----------------|--------|
| NEW_ENTRY_ALLOWED | 继续进行个股层面分析和建立新仓位 |
| REDUCE_ONLY | 不允许新开仓；在市场走强时削减现有仓位 |
| CASH_PRIORITY | 积极提高现金比例；避免一切新投入 |

## 输出格式

### JSON 报告

```json
{
  "schema_version": "1.0",
  "generated_at": "2026-03-16T07:00:00Z",
  "exposure_ceiling_pct": 70,
  "bias": "GROWTH",
  "participation": "BROAD",
  "recommendation": "NEW_ENTRY_ALLOWED",
  "confidence": "HIGH",
  "component_scores": {
    "breadth_score": 65,
    "uptrend_score": 72,
    "regime_score": 80,
    "top_risk_score": 25,
    "ftd_score": 10,
    "theme_score": 68,
    "sector_score": 70,
    "institutional_score": 75
  },
  "inputs_provided": ["breadth", "uptrend", "regime", "top_risk"],
  "inputs_missing": ["ftd", "theme", "sector", "institutional"],
  "rationale": "Broad participation with low top risk supports elevated exposure."
}
```

### Markdown 报告

Markdown 报告提供适合快速审阅的一页式摘要：

```markdown
# Market Posture Summary
**Date:** 2026-03-16 | **Confidence:** HIGH

## Exposure Ceiling: 70%

| Dimension | Score | Status |
|-----------|-------|--------|
| Breadth | 65 | Healthy |
| Uptrend Participation | 72% | Broad |
| Regime | Broadening | Favorable |
| Top Risk | 25 | Low |

## Recommendation: NEW_ENTRY_ALLOWED

**Bias:** Growth > Value
**Participation:** Broad (healthy internals)

### Rationale
Broad participation with low distribution day count supports elevated equity exposure.
New positions allowed within the 70% ceiling.
```

报告保存到 `reports/`，文件名为 `exposure_posture_YYYY-MM-DD_HHMMSS.{json,md}`。

## 资源

- `scripts/calculate_exposure.py` -- 负责评分与综合输入的主编排脚本
- `references/exposure_framework.md` -- 评分规则与阈值定义
- `references/regime_exposure_map.md` -- 市场形态到敞口上限的映射

## 核心原则

1. **安全优先** -- 当输入不完整或相互冲突时，默认采用较低的敞口
2. **形态对齐** -- 让宏观形态设定基准；市场宽度在边界范围内进行调整
3. **可操作的输出** -- 始终给出明确的建议，而不只是数据汇总
