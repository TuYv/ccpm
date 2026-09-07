---
name: position-sizer
description: Calculate risk-based position sizes for long stock trades. Use when user asks about position sizing, how many shares to buy, risk per trade, Kelly criterion, ATR-based sizing, fractional-share sizing, or portfolio risk allocation. Supports stop-loss distance calculation, volatility scaling, and sector concentration checks.
---
# Position Sizer

## 概述

基于风险管理原则，为多头股票交易计算最优买入股数。支持三种仓位规模测算方法：

- **固定比例法（Fixed Fractional）**：每笔交易按账户权益的固定百分比承担风险（默认：1%）
- **ATR 方法**：使用平均真实波幅（Average True Range）设置经波动率调整的止损距离
- **凯利公式**：根据历史盈亏统计数据计算数学上最优的风险分配

所有方法都会应用投资组合约束（最大持仓百分比、最大行业百分比），并输出最终建议股数以及完整的风险明细。默认输出为整数股。仅当用户的券商针对该证券和订单类型支持碎股时，才使用 `--fractional`。

## 何时使用

- 当用户询问“我该买多少股？”
- 当用户想为某个具体交易方案计算仓位规模
- 当用户提到每笔交易的风险、止损仓位设定或投资组合配置
- 当用户询问凯利公式或基于 ATR 的仓位规模测算
- 当用户账户规模较小，整数股取整会导致既定风险预算无法充分部署
- 当用户想检查某个持仓是否在投资组合集中度限制之内

## 前置条件

- 无需 API 密钥
- 需要 Python 3.9+，仅使用标准库

## 工作流程

### 第 1 步：收集交易参数

从用户处收集：
- **必需**：账户规模（总权益）
- **模式 A（固定比例法）**：入场价、止损价、风险百分比（默认 1%）
- **模式 B（ATR 方法）**：入场价、ATR 数值、ATR 乘数（默认 2.0x）、风险百分比
- **模式 C（凯利公式）**：胜率、平均盈利、平均亏损；可选提供入场价和止损价用于股数计算
- **可选约束**：账户的最大持仓百分比、最大行业百分比、当前行业敞口
- **可选股数模式**：默认为整数股；或在券商支持时通过 `--fractional --share-precision N` 使用碎股

如果用户提供了股票代码但未给出具体价格，使用可用工具查询当前价格，并基于技术分析建议入场/止损位。

### 第 2 步：执行 Position Sizer 脚本

运行仓位规模计算：

```bash
# Fixed Fractional (most common)
python3 skills/position-sizer/scripts/position_sizer.py \
  --account-size 100000 \
  --entry 155 \
  --stop 148.50 \
  --risk-pct 1.0 \
  --output-dir reports/

# Fractional shares for small accounts or high-priced stocks
python3 skills/position-sizer/scripts/position_sizer.py \
  --account-size 1000 \
  --entry 155 \
  --stop 148.50 \
  --risk-pct 1.0 \
  --fractional \
  --share-precision 4 \
  --output-dir reports/

# ATR-Based
python3 skills/position-sizer/scripts/position_sizer.py \
  --account-size 100000 \
  --entry 155 \
  --atr 3.20 \
  --atr-multiplier 2.0 \
  --risk-pct 1.0 \
  --output-dir reports/

# Kelly Criterion (budget mode - no entry)
python3 skills/position-sizer/scripts/position_sizer.py \
  --account-size 100000 \
  --win-rate 0.55 \
  --avg-win 2.5 \
  --avg-loss 1.0 \
  --output-dir reports/

# Kelly Criterion (shares mode - with entry/stop)
python3 skills/position-sizer/scripts/position_sizer.py \
  --account-size 100000 \
  --entry 155 \
  --stop 148.50 \
  --win-rate 0.55 \
  --avg-win 2.5 \
  --avg-loss 1.0 \
  --output-dir reports/
```

### 第 3 步：加载方法论参考资料

阅读 `references/sizing_methodologies.md`，以提供关于所选方法、风险准则以及投资组合约束最佳实践的背景信息。

### 第 4 步：计算多种情景

如果用户未指定单一方法，可运行多个情景进行对比：
- 固定比例法，风险分别取 0.5%、1.0% 和 1.5%
- ATR 方法，乘数分别取 1.5x、2.0x 和 3.0x
- 呈现一张对比表，展示每种情景的股数、持仓市值和美元风险

### 第 5 步：应用投资组合约束并确定最终规模

如果用户提供了投资组合背景信息，则添加约束：

```bash
python3 skills/position-sizer/scripts/position_sizer.py \
  --account-size 100000 \
  --entry 155 \
  --stop 148.50 \
  --risk-pct 1.0 \
  --max-position-pct 10 \
  --max-sector-pct 30 \
  --current-sector-exposure 22 \
  --output-dir reports/
```

说明哪个约束是紧约束，以及它为何限制了仓位规模。

### 第 6 步：生成仓位报告

呈现最终建议，包括：
- 所用方法及其理由
- 精确的股数和持仓市值
- 美元风险及其占账户的百分比
- 止损价格
- 任何起限制作用的紧约束
- 风险管理提醒（投资组合热度、止损纪律）
- 小账户提醒：碎股并不能免除券商最低交易金额、点差/滑点、佣金/费用、保证金限制、可借券数量或日内交易管控

## 输出格式

### JSON 报告

```json
{
  "schema_version": "1.0",
  "mode": "shares",
  "parameters": {
    "entry_price": 155.0,
    "account_size": 100000,
    "stop_price": 148.50,
    "risk_pct": 1.0
  },
  "calculations": {
    "fixed_fractional": {
      "method": "fixed_fractional",
      "shares": 153,
      "risk_per_share": 6.50,
      "dollar_risk": 1000.0,
      "stop_price": 148.50
    },
    "atr_based": null,
    "kelly": null
  },
  "constraints_applied": [],
  "final_recommended_shares": 153,
  "final_position_value": 23715.0,
  "final_risk_dollars": 994.50,
  "final_risk_pct": 0.99,
  "binding_constraint": null
}
```

### Markdown 报告

与 JSON 报一同自动生成。包含：
- 参数摘要
- 当前生效方法的计算细节
- 约束分析（如有）
- 包含股数、市值和风险的最终建议

报告保存到 `reports/`，文件名为 `position_sizer_YYYY-MM-DD_HHMMSS.json` 和 `.md`。

## 资源

- `references/sizing_methodologies.md`：关于固定比例法、ATR 方法和凯利公式的全面指南，附有示例、对比表和风险管理原则
- `scripts/position_sizer.py`：主计算脚本（CLI 接口）

## 关键原则

1. **生存第一**：仓位规模测算的意义在于挺过连败期，而不是让盈利最大化
2. **1% 法则**：默认每笔交易承担 1% 的风险；没有特殊理由绝不超过 2%
3. **默认整数股**：既有工作流默认保持整数股
4. **向下取整，绝不进位**：整数股模式向下取整到整数；碎股模式向下取整到所请求的精度，以确保不超出风险和集中度预算
5. **最严约束获胜**：当多项限制同时适用时，最严格的那一项决定最终规模
6. **半凯利**：实践中绝不使用满凯利；半凯利以远低的风险捕获 75% 的增长率
7. **投资组合热度**：未平仓总风险不应超过账户权益的 6-8%
8. **日内交易规则因券商而异**：FINRA 已于 2026-06-04 起用日内保证金标准取代旧的模式日内交易者交易日计数和 25,000 美元最低权益要求，券商可分阶段实施至 2027-10-20。在保证金账户中反复进行同日交易之前，请查阅券商的现行规则。
9. **亏损的不对称性**：亏损 50% 需要盈利 100% 才能回本；请据此设定仓位规模
