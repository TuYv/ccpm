---
name: crypto-regime-analyzer
description: Quantifies crypto market regime health using free, keyless public data (CoinGecko + Binance funding). Generates a 0-100 composite score across 6 components (100 = risk-on) with a posture recommendation. No API key required. Use when user asks about crypto market conditions, whether it's alt season, BTC dominance, crypto risk-on vs risk-off, funding rates, or whether crypto exposure should be increased or reduced.
---
# 加密市场状态分析器技能

## 目的

使用数据驱动的 6 组件评分系统（0-100）对加密市场状态进行量化。它是 `market-breadth-analyzer` + `exposure-coach` 在加密领域的对应版本：在任何币种级别的分析开始之前，它先回答"当前加密市场支持什么样的仓位姿态？"这一问题。

**分数方向：** 100 = 最大程度的风险偏好健康状态（广泛参与、趋势健康、杠杆合理），0 = 严重避险。

**无需 API 密钥** — 使用 CoinGecko 的免费公共 API 和 Binance 的公共合约端点。

## 何时使用本技能

- 用户询问“当前加密市场是风险偏好（risk-on）还是避险（risk-off）？”或“加密市场健康程度如何？”
- 用户询问“是否处于山寨币季（alt season）？”或关于 BTC 主导率走向的问题
- 用户询问资金费率是否过热
- 用户希望在筛选个别币种之前，先获得加密部分的敞口姿态评估
- 用户希望在股票 `market-regime-daily` 工作流之外，每天对加密市场状态进行一次检查

## 本技能不做的事情

- 不选币、不给出买入/卖出信号、不设价格目标
- 不执行操作或调整投资组合 — 仅做状态描述
- 人工决策关口仍然处于核心地位，与项目愿景保持一致

## 前置条件

- **Python 3.9+** 及 `requests`（仅实时模式需要；离线模式仅使用标准库）
- **可访问** `api.coingecko.com` 和 `fapi.binance.com` 的**网络连接**（实时模式）
- **无需任何 API 密钥**

## 组件模型

| # | 组件 | 权重 | 回答的问题 |
|---|---|---|---|
| 1 | BTC 趋势结构 | 25% | 储备资产的主要趋势是否完好？（价格相对 50/200DMA 均线堆叠的位置，200DMA 斜率） |
| 2 | 山寨币广度参与 | 20% | 山寨币的参与有多广泛？（前 N 币种中位于 200DMA 上方的百分比，50DMA 确认） |
| 3 | BTC 主导率状态 | 15% | 资金正在向哪里轮动？（主导率方向与 BTC 趋势结合解读） |
| 4 | 永续合约资金费率状态 | 15% | 杠杆有多拥挤？（主流币种平均资金费率；在极端时点做反向解读） |
| 5 | 回撤与波动率位置 | 15% | 我们处于周期的哪个阶段？（距 1 年高点的回撤，已实现波动率分位数） |
| 6 | 动量推进 / 清洗 | 10% | 短周期确认（全样本中 30 天收益为正的百分比） |

缺失组件的权重会按比例重新分配（与 `market-breadth-analyzer` 的约定相同）。完整评分逻辑：`references/crypto_regime_methodology.md`。

### 状态区间

| 分数 | 区间 | 姿态 |
|---|---|---|
| 80-100 | RISK_ON | 观察到广泛的风险偏好条件；决策前请复核风险限额 |
| 40-79 | NEUTRAL | 观察到混合信号的条件；没有强状态结论 |
| 0-39 | RISK_OFF | 观察到防御性市场条件；请复核现有风险控制 |

这些是启发式描述性区间，不是经过验证的配置规则。关于当前的证据边界以及做出量化业绩声明之前所需的产出物，请参见 `references/VALIDATION.md`。

---

## 执行工作流

### 阶段 1：运行分析脚本

**实时模式**（抓取 CoinGecko + Binance 数据；由于免费档位的限流，使用默认 `--top-n 20` 时当天首次运行约需 2-4 分钟；当天再次运行会命中缓存，即时完成）：

```bash
mkdir -p reports/<routine-or-date>
python3 skills/crypto-regime-analyzer/scripts/crypto_regime_analyzer.py \
  --output-dir reports/<routine-or-date>
```

**离线模式**（无需网络；快照 schema 见方法论参考文档）：

```bash
python3 skills/crypto-regime-analyzer/scripts/crypto_regime_analyzer.py \
  --input-json snapshot.json \
  --output-dir reports/<routine-or-date>
```

选项：`--top-n <int>` 样本规模（默认 20）、`--cache-dir <path>` 抓取缓存位置（默认 `.crypto_regime_cache`）、`--quiet`。

### 阶段 2：解读输出

脚本会写入 `crypto_regime.json`（机器可读，用于链式接入其他技能）和 `crypto_regime.md`（一页报告），并打印一行摘要：

```
CRYPTO REGIME: NEUTRAL (score 68.4/100) — Mixed conditions observed; no strong regime conclusion
```

呈现结果时，先给出区间和姿态，然后借助对分数影响最大的 1-2 个组件的 `signal` 字符串进行解释。对任何报告 `data_available: false` 的组件要予以标记，并说明这对置信度意味着什么。

### 阶段 3（可选）：向下游输送

JSON 综合结果可以作为一个描述性的加密市场输入，嵌入到 `exposure-coach` 风格的姿态摘要中。它不得独立地授权、阻止、确定仓位规模或执行任何交易。

## 输出

脚本向 `--output-dir` 写入两个产出物，并打印一行摘要用于工作流串联：

- `crypto_regime.json` — 完整的机器可读分析：`metadata`、各组件结果（`score`、`signal`、`data_available`、组件专有字段），以及 `composite` 块（`score`、`zone`、`guidance`、`effective_weights`）。
- `crypto_regime.md` — 一页报告：综合分数与区间条、姿态行、各组件表（权重 / 分数 / 信号）以及置信度说明。
- 控制台：`CRYPTO REGIME: <ZONE> (score <N>/100) — <posture>`，外加针对任何被跳过组件的警告。

## 资源

- `references/VALIDATION.md` — 验证状态、证据边界和复现要求。
- `references/crypto_regime_methodology.md` — 完整评分依据、全部阈值表、离线快照 JSON schema 以及实时数据源端点列表。
- `scripts/crypto_regime_analyzer.py` — CLI 编排器（入口）。
- `scripts/data_client.py` — CoinGecko/Binance 抓取器、按日缓存、主导率历史累积器、离线加载器。
- `scripts/calculators/` — 每个组件一个模块；纯函数，已完全单元测试。
- `scripts/scorer.py` — 带比例权重重分配的加权综合评分。
- `scripts/tests/` — 覆盖每个组件、评分器、稀疏数据 fail-closed 行为以及端到端牛市/熊市/降级快照的测试。

## 已知局限

- **主导率历史在本地累积。** CoinGecko 免费档位只提供*当前*主导率，因此客户端会在缓存目录中按运行日存储一条观测值。在积累满 31 条每日观测值之前，主导率组件会报告 `data_available: false`（在此之前其权重会被重新分配）。可通过 `--input-json` 更快地预置数据。
- **资金费率为尽力而为。** 如果 Binance 端点无法访问（地区限制、故障），该组件会被优雅地跳过。
- **样本为按市值排名的前 N 币种**，排除了稳定币和封装/质押资产；它不是固定指数，因此其构成会随市场漂移。
- 阈值为启发式设定并在方法论参考文档中有详细记录；它们是保守的默认值，而非回测最优值。

## 免责声明

仅供教育和流程改进用途。本技能描述市场状况；它不提供财务建议、信号或买入/卖出指示。所有决策均由用户自行负责。
