---
name: manifoldbt-backtester
description: Runs a declarative strategy spec over OHLCV bars with the manifoldbt Rust engine, pairs the fill log into round trips, and emits the eight inputs the backtest-expert skill scores. Use when the user wants to execute a backtest, measure a rule they have described, obtain win rate / average win / average loss / max drawdown from real bars, or feed backtest-expert with measured numbers instead of estimates.
---
# manifoldbt 回测器技能

## 用途

执行 `backtest-expert` 所传授的内容。该技能从五个维度为一个回测打分，而其前提条件写着“指标由用户提供”：它给那些自己从不产出的数字打分。本技能负责产出这些数字。它在真实K线上运行一个策略，并返回其评估器所需的那八项输入。

两者沿单一方向串联：规格、运行、评估。

## 何时使用本技能

- 用户描述了一条规则并希望对它进行度量
- `backtest-expert` 即将运行而相关数字尚不存在
- 胜率、平均盈利、平均亏损或回撤必须来自K线数据
- 策略的参数个数必须为打分而确定

把裁决留给 `backtest-expert`。阈值和危险信号由它掌握，本技能不会重复这些内容。

## 前置条件

- Python 3.9+
- `pip install manifoldbt`（Apache 2.0 附带 Commons Clause；免费档已覆盖本技能的全部功能）
- 以 CSV 或 Parquet 形式提供的 OHLCV K线数据，包含列 `timestamp, open, high, low, close, volume`
- 无需 API 密钥

## 工作流程

### 1. 编写策略规格

一个规格会指明若干指标和一个入场条件。把它保持在能陈述该假设的最小规则上。每增加一个可调参数，就更容易碰巧达到样本内拟合，而评估器会惩罚参数的个数。

```json
{
  "name": "sma_cross_costed",
  "indicators": {
    "fast": { "type": "sma", "period": 20 },
    "slow": { "type": "sma", "period": 60 }
  },
  "entry": { "left": "fast", "op": ">", "right": "slow" },
  "size": 1.0,
  "stop_loss_pct": 1.5,
  "fees_bps": 5.0,
  "slippage_bps": 2.0
}
```

字段参考：`references/strategy_spec.md`。

在阅读任何结果之前，先把 `fees_bps` 和 `slippage_bps` 设为现实的数值。无摩擦的运行在执行真实性维度上得 0 分，而在较短的持仓周期下，成本决定一个优势能否存活。

### 2. 运行

```bash
python3 scripts/run_backtest.py \
  --spec strategy.json \
  --data bars.csv \
  --symbol BTCUSDT \
  --json-out result.json
```

该脚本在接触数据之前会先校验规格，因此你一秒钟内就能看到规格错误，而不是在漫长的加载之后才发现。

### 3. 先看警告，再看数字

运行会打印一些会改变你解读方式的警告：交易笔数不足 30 的样本、不足一年的时间跨度、未建模摩擦，或引擎胜率与配对后胜率之间的差距。每一条都是修正设置并重新运行的理由。

有三种情况会中止交接而不是产出评分：没有已完成的往返交易、最大回撤缺失或为非有限值，以及打平交易。评估器没有针对打平交易的输入项，因此若传入包含打平交易的总体，其推导出的期望值就会与已完成交易不一致。

### 4. 交接给 backtest-expert

运行会以一条可直接粘贴的命令收尾。运行它，或者用相同的数字调用 `backtest-expert` 技能：

```bash
python3 skills/backtest-expert/scripts/evaluate_backtest.py \
  --total-trades 3854 --win-rate 20.24 \
  --avg-win-pct 0.2917 --avg-loss-pct 0.2342 \
  --max-drawdown-pct 99.2893 --years-tested 0 \
  --num-parameters 3 --slippage-tested
```

## 四种不报错却出错的转换

在引擎输出与评估器输入之间，隔着四个转换。每一个都会产出一个貌似合理的数字，并给策略打出错误的分数。它们全都不会抛出异常。

**一笔成交是一次执行，一个往返是两次。** 原始成交笔数大约是往返交易数的两倍。把成交笔数喂给样本规模维度，表面样本就会翻倍，这足以让一个单薄的回测越过一个它本不该跨过的门槛。

**只有在最简单的情形下买入与卖出才交替出现。** 这一点仅对从不加仓的单标的、纯多头策略成立。做空会打破它，因为卖出也可能开仓。加仓会打破它，因为一次平仓要对应多次开仓。多标的池会打破它，因为各标的的成交会相互交错。本技能按标的跟踪仓位，并在仓位重新穿回持平时闭合该次往返。入场与出场的数量和现金价值在整个生命周期内累加；它们的加权平均价格只是展示用数值，而盈亏（PnL）来自现金流量本身。

**成本决定小额交易的成败。** 单边 7 个基点的成本下，一笔价格上盈利 0.1% 的交易是亏钱的。期望值由胜率与平均盈利共同决定，因此毛胜率配上净平均值会错报优势。此处的百分比均为扣除手续费后的净值，`gross_return_pct` 一并列出供核查。

**引擎将回撤记为负值。** 评估器需要正的幅度。传入原始值的话，38% 的跌幅会被评为完美无瑕的运行。

## 范围

支持：对任意 OHLC 列使用 `sma`、`ema`、`rsi`；一个入场条件，用 `>`、`<`、`>=`、`<=` 与另一个指标、某个价格列或某个数值比较；可选的止损与止盈；以基点计的手续费和滑点；仅做多。

拒绝：多条件入场、做空、多标的池，以及上述三种之外的指标。引擎全都支持。本技能覆盖一句话假设所能产生的形态，其余一律拒绝，而不是半吊子地处理。

## 参考文件

- `references/strategy_spec.md` 涵盖每个规格字段、其默认值，以及校验会拒绝什么
- `references/metric_bridge.md` 涵盖那八项输入、每一项如何推导，以及每个转换中的陷阱

## 脚本

- `scripts/run_backtest.py` 对K线数据运行一个规格
- `scripts/spec.py` 校验规格并统计其参数个数
- `scripts/round_trips.py` 将成交配对为带净收益的往返交易
- `scripts/bridge.py` 组装评估器的八项输入

`spec.py`、`round_trips.py` 和 `bridge.py` 零依赖，无需引擎即可导入，因此你可以在不运行回测的情况下测试这些逻辑。
