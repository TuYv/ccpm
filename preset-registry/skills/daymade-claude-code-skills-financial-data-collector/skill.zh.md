---
name: financial-data-collector
description: "Collect real financial data for any US publicly traded company from free public sources (yfinance). Output structured JSON consumable by downstream financial skills (DCF modeling, comps analysis, earnings review). Handles market data (price, shares, beta), historical financials (income statement, cash flow, balance sheet), WACC inputs, and analyst estimates. Use when users request collect data for ticker, get financials for company, pull market data, gather DCF inputs, or any task requiring structured financial data before analysis. Also triggers on financial data, company data, stock data."
---
# 财务数据采集器

使用免费数据源采集并验证美国上市公司的真实财务数据。
输出为标准化 JSON 文件，可供其他财务技能直接使用。

## 关键约束

**禁止使用回退值。** 如果无法获取某个字段，请将其设置为 `null`，并设置 `_source: "missing"`。
绝不使用默认值代替（例如 `beta or 1.0`）。由下游技能决定如何处理缺失数据。

**必须注明数据来源。** 每个数据部分都必须包含 `_source` 字段。

**资本支出符号约定：** yfinance 返回的资本支出为负数（现金流出）。保留原始符号。在输出元数据中说明该约定。**不要**反转符号。

**yfinance FCF ≠ 投资银行 FCF。** yfinance FCF = 经营现金流 + 资本支出（不扣除股份支付费用）。请在输出元数据中标明这一点，以免下游 DCF 技能高估 FCF。

## 工作流程

### 第 1 步：采集数据

运行采集脚本：

```bash
python scripts/collect_data.py TICKER [--years 5] [--output path/to/output.json]
```

脚本按以下优先级采集数据：
1. **yfinance** — 市场数据、历史财务数据、贝塔系数、分析师预测
2. **yfinance ^TNX** — 以 10 年期美国国债收益率作为无风险利率的代理指标
3. **用户补充** — 用于 yfinance 返回 NaN 的年份（报告给用户，不要猜测）

### 第 2 步：验证数据

```bash
python scripts/validate_data.py path/to/output.json
```

检查内容：字段完整性、跨字段一致性（市值 = 股价 × 股数）、范围合理性（WACC 5-20%，贝塔系数 0.3-3.0）、符号约定。

### 第 3 步：交付 JSON

单个文件：`{TICKER}_financial_data.json`。Schema 位于 `references/output-schema.md`。

**不要创建**：README、CSV、摘要报告或任何辅助文件。

## 输出 Schema（摘要）

```json
{
  "ticker": "META",
  "company_name": "Meta Platforms, Inc.",
  "data_date": "2026-03-02",
  "currency": "USD",
  "unit": "millions_usd",
  "data_sources": { "market_data": "...", "2022_to_2024": "..." },
  "market_data": { "current_price": 648.18, "shares_outstanding_millions": 2187, "market_cap_millions": 1639607, "beta_5y_monthly": 1.284 },
  "income_statement": { "2024": { "revenue": 164501, "ebit": 69380, "tax_expense": ..., "net_income": ..., "_source": "yfinance" } },
  "cash_flow": { "2024": { "operating_cash_flow": ..., "capex": -37256, "depreciation_amortization": 15498, "free_cash_flow": ..., "change_in_nwc": ..., "_source": "yfinance" } },
  "balance_sheet": { "2024": { "total_debt": 30768, "cash_and_equivalents": 77815, "net_debt": -47047, "current_assets": ..., "current_liabilities": ..., "_source": "yfinance" } },
  "wacc_inputs": { "risk_free_rate": 0.0396, "beta": 1.284, "credit_rating": null, "_source": "yfinance + ^TNX" },
  "analyst_estimates": { "revenue_next_fy": 251113, "revenue_fy_after": 295558, "eps_next_fy": 29.59, "_source": "yfinance" },
  "metadata": { "_capex_convention": "negative = cash outflow", "_fcf_note": "yfinance FCF = OperatingCF + CapEx. Does NOT deduct SBC." }
}
```

包含所有字段定义的完整 Schema：`references/output-schema.md`

<correct_patterns>

### 处理缺失年份

```python
if pd.isna(revenue):
    result[year] = {"revenue": None, "_source": "yfinance returned NaN — supplement from 10-K"}
# Report missing years to the user. Do NOT skip or fill with estimates.
```

### 保留资本支出符号

```python
capex = cash_flow.loc["Capital Expenditure", year_col]  # -37256.0
result["capex"] = float(capex)  # Preserve negative
```

### 日期时间列索引

```python
year_col = [c for c in financials.columns if c.year == target_year][0]
revenue = financials.loc["Total Revenue", year_col]
```

### 字段名称防护

```python
if "Total Revenue" in financials.index:
    revenue = financials.loc["Total Revenue", year_col]
elif "Revenue" in financials.index:
    revenue = financials.loc["Revenue", year_col]
else:
    revenue = None
```

</correct_patterns>

<common_mistakes>

### 错误 1：为缺失数据设置默认值

```python
# ❌ WRONG
beta = info.get("beta", 1.0)
growth = data.get("growth") or 0.02

# ✅ RIGHT
beta = info.get("beta")  # May be None — that's OK
```

### 错误 2：假设所有年份都有数据

```python
# ❌ WRONG — 2020-2021 may be NaN
revenue = float(financials.loc["Total Revenue", year_col])

# ✅ RIGHT
value = financials.loc["Total Revenue", year_col]
revenue = float(value) if pd.notna(value) else None
```

### 错误 3：在 DCF 模型中直接使用 yfinance 的 FCF

yfinance 的 FCF 不会扣除 SBC。对于 META 这类超大市值公司，SBC 每年可能高达 200 亿至 300 亿美元，导致 yfinance 的 FCF 比投行口径的 FCF 高出约 30%。务必在输出中对此作出提示。

### 错误 4：反转资本支出符号

```python
# ❌ WRONG — double-negation risk downstream
capex = abs(cash_flow.loc["Capital Expenditure", year_col])

# ✅ RIGHT — preserve original, document convention
capex = float(cash_flow.loc["Capital Expenditure", year_col])  # -37256.0
```

</common_mistakes>

## 已知的 yfinance 陷阱

有关详细的字段映射和解决方法，请参阅 `references/yfinance-pitfalls.md`。