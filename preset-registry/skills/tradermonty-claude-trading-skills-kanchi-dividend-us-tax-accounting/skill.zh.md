---
name: kanchi-dividend-us-tax-accounting
description: Provide US dividend tax and account-location workflow for Kanchi-style income portfolios. Use when users ask about qualified vs ordinary dividends, 1099-DIV interpretation, REIT/BDC distribution treatment, holding-period checks, or taxable-vs-IRA account placement decisions for dividend assets.
---
# Kanchi Dividend Us Tax Accounting

## 概述

为股息投资者应用一套实用的美国税务工作流，同时保持决策可审计。
专注于账户配置与分类，而非替代法律/税务建议。

## 何时使用

当用户需要以下内容时使用此技能：
- 美国股息税务分类规划（合格 vs 普通的假设）。
- 年末税务规划前的持有期检查。
- 针对股票/REIT/BDC/MLP 收益持仓的账户位置决策。
- 标准化的年度股息税务备忘录格式。

## 前置条件

准备持仓层面的输入：
- `ticker`
- `instrument_type`
- `account_type`
- `hold_days_in_window`（如有）

使用 `references/input-schema.md` 中的确切 JSON 契约和示例。

为获得确定性的输出产物，请提供 JSON 输入并运行：

```bash
python3 skills/kanchi-dividend-us-tax-accounting/scripts/build_tax_planning_sheet.py \
  --input /path/to/tax_input.json \
  --output-dir reports/
```

## 护栏

始终明确声明：税务结果取决于个人实际情况和司法管辖区。
将此技能视为规划辅助，最终申报决策应交由税务专业人士处理。

## 工作流

### 1) 对每个分配流进行分类

对每个持仓，将预期现金流分类为：
- 潜在合格股息。
- 普通股息/非合格分配。
- 适用时的 REIT/BDC 特定分配组成部分。

使用 `references/qualified-dividend-checklist.md`
进行持有期和分类检查。

### 2) 验证持有期资格假设

针对潜在合格处理：
- 检查除息日窗口。
- 检查计量窗口内所需的最少持有天数。
- 标记可能无法满足持有期要求的仓位。

如果数据不完整，将状态标记为 `ASSUMPTION-REQUIRED`。

### 3) 映射到报告字段

将规划假设映射到预期的税表类别：
- 普通股息总额。
- 合格股息子集。
- 单独申报时的 REIT 相关组成部分。

一致地使用税表术语，以便年末对账简单直接。

### 4) 构建账户位置建议

使用 `references/account-location-matrix.md` 根据税务特征
配置资产：
- 应税账户用于可能持续以合格股息为主的持仓。
- 税收优惠账户用于较高的普通收入型分配。

当约束条件发生冲突（流动性、策略、集中度）时，明确解释取舍。

### 5) 生成年度规划备忘录

使用 `references/annual-tax-memo-template.md` 并包含：
- 所使用的假设。
- 分配分类摘要。
- 已执行的配置操作。
- 待 CPA/税务顾问审查的未决事项。

## 输出

始终输出：
1. 持仓层面的分配分类表。
2. 附带理由的账户位置建议表。
3. 针对未解决税务假设的未决风险清单。
4. 可选的由
`skills/kanchi-dividend-us-tax-accounting/scripts/build_tax_planning_sheet.py` 生成的产物。

## 节奏

使用以下最低频率：
- 每年（60 分钟）：包含账户位置审查的完整税务规划备忘录。
- 每季度（15 分钟）：刷新近期新建仓位的持有期状态。
- 临时：在持仓发生重大变化、新增 REIT/BDC 或由 `kanchi-dividend-review-monitor` 触发审查后重新运行。

## 多技能交接

- 从 `kanchi-dividend-sop` 接收候选标的和持仓列表。
- 从 `kanchi-dividend-review-monitor` 接收风险事件上下文（`WARN/REVIEW`）。
- 在新建仓之前，将账户位置约束返回给 `kanchi-dividend-sop`。

## 资源

- `skills/kanchi-dividend-us-tax-accounting/scripts/build_tax_planning_sheet.py`：税务规划表生成器。
- `skills/kanchi-dividend-us-tax-accounting/scripts/tests/test_build_tax_planning_sheet.py`：税务规划输出的测试。
- `references/qualified-dividend-checklist.md`：分类与持有期检查。
- `references/account-location-matrix.md`：按账户类型和证券划分的配置矩阵。
- `references/annual-tax-memo-template.md`：可复用的备忘录结构。
