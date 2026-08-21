---
name: [REPLACE: SKILL_NAME]
description: Price and volume tracker for [REPLACE: TOKEN_SYMBOL] with anomaly alerts above [REPLACE: ALERT_THRESHOLD_PCT]% movement
metadata:
  category: crypto
  var: ""
  tags:
    - crypto
  requires:
    - COINGECKO_API_KEY?
---
> **${var}** — 可选。传入其他 CoinGecko ID 以覆盖默认值。如果为空，则跟踪已配置的代币。

今天是 ${today}。跟踪 [REPLACE: TOKEN_SYMBOL] 的价格/交易量，并在出现异常时发出警报。

## 步骤

1. **获取当前状态** — 查询 CoinGecko 以获取最新价格、24 小时涨跌幅和 24 小时交易量。如果设置了 `COINGECKO_API_KEY`，则使用该密钥；否则使用无密钥端点：

   ```bash
   ID="${var:-[REPLACE: COINGECKO_ID]}"
   if [ -n "${COINGECKO_API_KEY:-}" ]; then
     URL="https://pro-api.coingecko.com/api/v3/simple/price?ids=$ID&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true"
     curl -sf -H "x-cg-pro-api-key: $COINGECKO_API_KEY" "$URL" > .token-cache.json
   else
     URL="https://api.coingecko.com/api/v3/simple/price?ids=$ID&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true"
     curl -sf "$URL" > .token-cache.json
   fi
   ```

   如果 `curl` GET 不稳定，则使用 **WebFetch** 访问相同 URL 作为后备方案（不存在网络沙箱限制——WebFetch 只是用于处理不稳定的公共读取请求的便捷工具）。

2. **读取先前状态** — 读取最近 7 天的 `memory/logs/YYYY-MM-DD.md`，获取之前的价格和交易量（解析类似 `**[REPLACE: TOKEN_SYMBOL]**: price=$N, volume_24h=$N` 的行）。

3. **检测异常** — 如果 `|price_change_24h| >= [REPLACE: ALERT_THRESHOLD_PCT]%`，或者 24 小时交易量 `>= 2x` 过去 7 天的中位数，则标记为异常。

4. **写入 `output/articles/[REPLACE: SKILL_NAME]-${today}.md`**，包含：
   - 当前价格、24 小时涨跌幅、24 小时交易量
   - 7 天价格图表（使用 `▁▂▃▅▇` 字符表示的迷你图）
   - 异常判定：`QUIET` / `STEADY` / `ANOMALY`（以及触发了哪一项）
   - 链接：CoinGecko 页面；如果知道合约地址，则提供 Etherscan / 区块浏览器页面

5. **通知** — 如果为 `ANOMALY`，则通过 `./notify` 发送判定结果和 1-2 句上下文。对于 QUIET/STEADY 的情况保持静默。

6. **记录日志** — 追加到 `memory/logs/${today}.md`：
   ```
   ## [REPLACE: SKILL_NAME]
   - **[REPLACE: TOKEN_SYMBOL]**: price=$N, change_24h=$N%, volume_24h=$N
   - **Verdict**: QUIET | STEADY | ANOMALY:price | ANOMALY:volume
   ```

## 网络说明

CoinGecko 的无密钥端点偶尔会进行速率限制。不存在网络沙箱限制——`curl` 可以正常工作；当 `curl` GET 不稳定时，使用 **WebFetch** 作为后备方案。

## 约束条件

- 绝不滥发通知。设置 `ALERT_THRESHOLD_PCT` 阈值是为了保护频道中的有效信号——不要将其降低到 5% 以下。
- 始终在文章中引用来源。即使只有一行链接，也比没有链接好。