---
name: options-payoff
description: >
  Generate an interactive options payoff curve chart with dynamic parameter controls.
  Use this skill whenever the user shares an options position screenshot, describes an options strategy,
  or asks to visualize how an options trade makes or loses money. Triggers include: any mention of
  butterfly, spread (vertical/calendar/diagonal/ratio), straddle, strangle, condor, covered call,
  protective put, iron condor, or any multi-leg options structure. Also triggers when a user pastes
  strike prices, premiums, expiry dates, or says things like "show me the payoff", "draw the P&L curve",
  "what does this trade look like", or uploads a screenshot from a broker (IBKR, TastyTrade, Robinhood, etc).
  Always use this skill even if the user only provides partial info — extract what you can and use defaults for the rest.
---
# 期权收益曲线 Skill

生成一个完全交互式的 HTML 小组件（通过 `visualize:show_widget`），展示：
- **到期收益曲线**（灰色虚线）— 到期时的内在价值
- **理论价值曲线**（彩色实线）— 基于当前 DTE/IV 的 Black-Scholes 价格
- 所有关键参数的动态滑块
- 实时统计数据：最大利润、最大亏损、盈亏平衡点、现货价格处的当前 P&L

---

## 步骤 1：从用户输入中提取策略

当用户提供截图或文本时，提取：

| 字段 | 查找位置 | 缺失时的默认值 |
|---|---|---|
| 策略类型 | 标题栏/腿部描述 | "custom" |
| 标的 | Ticker 代码 | SPX |
| 行权价 | 标题或腿部表格中的 K1、K2、K3... | 最接近的整数位数值 |
| 支付/收取的权利金 | 成交价或平均价格 | 5.00 |
| 数量 | 持仓规模 | 1 |
| 乘数 | 股票期权为 100，SPX 为 100 | 100 |
| 到期日 | 标题中的日期 | 30 DTE |
| 现货价格 | 标的的当前价格（不是行权价） | 中间行权价 |
| IV | 希腊字母指标面板中显示的值，或根据 vega 估算 | 20% |
| 无风险利率 | — | 4.3% |

**处理截图时的关键要求**：现货价格是标的指数/股票的当前价格，而不是行权价。绝不能将现货价格默认设置为某个行权价。

**当前 SPX 参考价格：**
```
!`python3 -c "exec('try:\n import yfinance as yf\n p=yf.Ticker(\'^GSPC\').fast_info[\'lastPrice\']\n print(f\'SPX ≈ {p:.0f}\')\nexcept Exception:\n print(\'SPX price unavailable — check market data\')')"`
```

---

## 步骤 2：识别策略类型

匹配下方支持的策略之一，然后阅读 `references/strategies.md` 中的对应章节。

| 策略 | 腿部 | 关键识别特征 |
|---|---|---|
| **butterfly** | 买入 K1，卖出 2×K2，买入 K3 | 3 个行权价，标题中包含 "Butterfly" |
| **vertical_spread** | 买入 K1，卖出 K2（到期日相同） | 2 个行权价，借记或贷记 |
| **calendar_spread** | 买入远期到期的 K，卖出近期到期的 K | 相同行权价，2 个到期日 |
| **iron_condor** | 卖出 K2/K3，买入 K1/K4 两翼 | 4 个行权价，2 个价差 |
| **straddle** | 买入 Call K + 买入 Put K | 相同行权价，同时包含两种类型 |
| **strangle** | 买入价外 Call + 买入价外 Put | 2 个行权价，且均为价外 |
| **covered_call** | 持有 100 股股票 + 卖出 Call K | 股票 + 空头看涨期权 |
| **naked_put** | 卖出 Put K | 单腿 |
| **ratio_spread** | 买入 1×K1，卖出 N×K2 | 数量不相等 |

对于未列出的策略，使用 `custom` 模式：将其拆分为各个独立腿部，并将其 P&L 相加。

---

## 步骤 3：计算收益

### Black-Scholes 看跌期权价格
```
d1 = (ln(S/K) + (r + σ²/2)·T) / (σ·√T)
d2 = d1 - σ·√T
put = K·e^(-rT)·N(-d2) - S·N(-d1)
```

### Black-Scholes 看涨期权价格（通过看跌-看涨平价关系）
```
call = put + S - K·e^(-rT)
```

### 蝶式看跌期权收益（到期时）
```
if S >= K3: 0
if S >= K2: K3 - S
if S >= K1: S - K1
else: 0
```
每股净 P&L = payoff − premium_paid

### 垂直价差（看涨借记价差）收益（到期时）
```
long_call = max(S - K1, 0)
short_call = max(S - K2, 0)
payoff = long_call - short_call - net_debit
```

### 日历价差理论价值
日历价差无法表示为简单的到期函数——始终对两条腿都使用 BS 定价：
```
value = BS(S, K, T_far, r, IV_far) - BS(S, K, T_near, r, IV_near)
```
对于日历价差的到期曲线：近期腿到期时价值归零，远期腿 = 使用剩余 T 计算的 BS 价格。

### 铁鹰式价差收益（到期时）
```
put_spread = max(K2-S, 0) - max(K1-S, 0)   // short put spread
call_spread = max(S-K3, 0) - max(S-K4, 0)  // short call spread
payoff = credit_received - put_spread - call_spread
```

---

## 第 4 步：渲染组件

构建前，使用 `visualize:read_me` 并指定模块 `["chart", "interactive"]`。

### 必需的控件（滑块）

**结构部分：**
- 所有行权价（K1、K2、K3……根据策略需要）
- 支付/收取的权利金
- 数量
- 乘数（默认为 100，为清晰起见需显示）

**定价变量部分：**
- IV %（5–80%，步长 0.5）
- DTE — 距到期日天数（0–90）
- 无风险利率 %（0–8%）

**现货价格：**
- 全宽滑块，范围 = [最低行权价 - 20%, 最高行权价 + 20%]，默认值为实际当前现货价格

### 必需的统计卡片（实时更新）
- 最大利润（到期时）
- 最大亏损（到期时）
- 盈亏平衡点 — 对于双边策略需同时显示两个
- 当前现货价格下的理论盈亏

### 图表规范
- X 轴：SPX/标的资产价格
- Y 轴：总美元盈亏（非每股）
- 蓝色实线 = 当前 DTE/IV 下的理论价值
- 灰色虚线 = 到期收益
- 绿色竖直虚线 = 行权价（中心行权价 K2 需更醒目）
- 琥珀色竖直虚线 = 当前现货价格
- 零轴以上填充 = 绿色，10% 不透明度；零轴以下填充 = 红色，10% 不透明度
- 工具提示：悬停时显示两条曲线

### 代码模板

在组件中使用以下 JS 结构，并根据策略调整 `pnlExpiry()` 和 `bfTheory()`：

```js
// Black-Scholes helpers (always include)
function normCDF(x) { /* Horner approximation */ }
function bsCall(S,K,T,r,sig) { /* standard BS call */ }
function bsPut(S,K,T,r,sig) { /* standard BS put */ }

// Strategy-specific expiry payoff (returns per-share value BEFORE premium)
function expiryValue(S, ...strikes) { ... }

// Strategy-specific theoretical value using BS
function theoreticalValue(S, ...strikes, T, r, iv) { ... }

// Main update() reads all sliders, computes arrays, destroys+recreates Chart.js instance
function update() { ... }

// Attach listeners
['k1','k2',...,'iv','dte','rate','spot'].forEach(id => {
  document.getElementById(id).addEventListener('input', update);
});
update();
```

---

## 第 5 步：回复用户

渲染组件后，简要说明：
1. 检测到了什么策略，以及如何映射各个头寸
2. 当前设置下的最大利润/最大亏损
3. 一个关键洞察（例如，“现货价格目前比盈利区间低 950 点，明天到期”）

保持简洁——让图表自行说明。

---

## 参考文件

- `references/strategies.md` — 各策略类型的详细收益公式和边界情况
- `references/bs_code.md` — 可直接复制粘贴的 Black-Scholes JS 实现，包含 normCDF

如果不确定某个策略的收益公式边界情况，请阅读相关参考文件。