---
name: ftd-detector
description: Detects Follow-Through Day (FTD) signals for market bottom confirmation using William O'Neil's methodology. Dual-index tracking (S&P 500 + NASDAQ) with state machine for rally attempt, FTD qualification, and post-FTD health monitoring. Use when user asks about market bottom signals, follow-through days, rally attempts, re-entry timing after corrections, or whether it's safe to increase equity exposure. Complementary to market-top-detector (defensive) - this skill is offensive (bottom confirmation).
---
# FTD 探测技能

## 目的

检测确认市场底部的跟涨日（Follow-Through Day，FTD）信号，采用 William O'Neil 经过验证的方法论。生成质量评分（0-100），并为回调后重新入场提供仓位指导。

**与市场顶部探测器互补：**
- 市场顶部探测器 = 防御型（检测派发、板块轮动、走势恶化）
- FTD 探测器 = 进攻型（检测反弹尝试、底部确认）

## 何时使用本技能

**英语：**
- 用户询问“市场是否正在筑底？”或“现在买入安全吗？”
- 用户观察到市场回调（跌幅 3% 或以上），想知道重新入场的时机
- 用户询问跟涨日（FTD）或反弹尝试相关的问题
- 用户想评估近期反弹是否可持续
- 用户询问回调后是否应增加股票仓位
- 市场顶部探测器显示风险升高，用户想寻找底部信号

**日语：**
- 「市场是否已经见底？」「现在可以买回了吗？」
- 回调局面（跌幅 3% 或以上）后的入场时机
- 关于跟涨日和反弹尝试的问题
- 想评估近期的反弹是否可持续
- 判断回调后是否应扩大仓位
- 在市场顶部探测器显示高风险后确认底部信号

## 与市场顶部探测器的区别

| 方面 | FTD 探测器 | 市场顶部探测器 |
|--------|-------------|-------------------|
| 侧重点 | 底部确认（进攻型） | 顶部探测（防御型） |
| 触发条件 | 市场回调（跌幅 3% 或以上） | 市场处于高点附近或达到高点 |
| 信号 | 反弹尝试 → FTD → 重新入场 | 派发 → 恶化 → 退出 |
| 评分 | 0-100 FTD 质量分 | 0-100 顶部概率分 |
| 行动 | 何时增加仓位 | 何时降低仓位 |

---

## 执行工作流

### 阶段 1：运行 Python 脚本

运行 FTD 探测脚本：

```bash
python3 skills/ftd-detector/scripts/ftd_detector.py --api-key $FMP_API_KEY
```

该脚本将：
1. 通过 FMP API 获取标普 500 和 QQQ 的历史数据（60 个交易日以上）
2. 获取两个指数的当前报价
3. 运行双指数状态机（回调 → 反弹 → FTD 检测）
4. 评估 FTD 之后的健康度（派发日、失效判定、Power Trend）
5. 计算质量评分（0-100）
6. 生成 JSON 和 Markdown 报告

**API 预算：** 4 次调用（远在每日 250 次的免费额度之内）

### 阶段 2：呈现结果

将生成的 Markdown 报告呈现给用户，重点突出：
- 当前市场状态（回调、反弹尝试、FTD 已确认等）
- 质量评分和信号强度
- 建议的仓位水平
- 关键观察位（波段低点、FTD 当日低点）
- FTD 之后的健康度（派发日、Power Trend）

### 阶段 3：情境化指导

根据市场状态提供额外指导：

**若 FTD 已确认（评分 60 或以上）：**
- 建议关注正在构筑恰当形态（base）的龙头股
- 参考 CANSLIM 选股器寻找候选股票
- 提醒注意仓位管理和止损设置

**若处于反弹尝试阶段（第 1-3 天）：**
- 建议保持耐心，不要在 FTD 出现之前买入
- 建议着手构建观察名单

**若无回调：**
- FTD 分析不适用于上升趋势
- 转而使用市场顶部探测器获取防御性信号

---

## 状态机

```
NO_SIGNAL → CORRECTION → RALLY_ATTEMPT → FTD_WINDOW → FTD_CONFIRMED
                ↑              ↓               ↓              ↓
                └── RALLY_FAILED ←─────────────┘     FTD_INVALIDATED
```

| 状态 | 定义 |
|-------|-----------|
| NO_SIGNAL | 上升趋势中，无符合条件的回调 |
| CORRECTION | 跌幅 3% 或以上，且包含 3 个或以上下跌日 |
| RALLY_ATTEMPT | 自波段低点起反弹的第 1-3 天 |
| FTD_WINDOW | 第 4-10 天，等待符合条件的 FTD |
| FTD_CONFIRMED | 检测到有效的 FTD 信号 |
| RALLY_FAILED | 反弹跌破波段低点 |
| FTD_INVALIDATED | 收盘价低于 FTD 当日低点 |

## 质量评分（0-100）

| 评分 | 信号 | 仓位 |
|-------|--------|----------|
| 80-100 | 强 FTD | 75-100% |
| 60-79 | 中等 FTD | 50-75% |
| 40-59 | 弱 FTD | 25-50% |
| <40 | 无 FTD / 失败 | 0-25% |

---

## 前置条件

- **FMP API 密钥：** 必需。设置 `FMP_API_KEY` 环境变量，或通过 `--api-key` 标志传入。
- **Python 3.9 或以上：** 需安装 `requests` 库。
- **API 预算：** 每次执行 4 次调用（远在 FMP 每日 250 次的免费额度之内）。

## 输出文件

- JSON：`ftd_detector_YYYY-MM-DD_HHMMSS.json`
- Markdown：`ftd_detector_YYYY-MM-DD_HHMMSS.md`

## 参考文档

### `skills/ftd-detector/references/ftd_methodology.md`
- O'Neil FTD 规则详解
- 反弹尝试的机制与天数计数
- 历史 FTD 案例（2020 年 3 月、2022 年 10 月）

### `skills/ftd-detector/references/post_ftd_guide.md`
- FTD 之后派发日的失败率
- Power Trend 的定义与条件
- 成功与失败模式的对比

### 何时加载参考文档
- **首次使用：** 加载 `skills/ftd-detector/references/ftd_methodology.md` 以全面理解
- **FTD 之后的问题：** 加载 `skills/ftd-detector/references/post_ftd_guide.md`
- **常规执行：** 无需参考文档——脚本会自动完成分析
