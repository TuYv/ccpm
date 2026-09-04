---
name: macro-regime-detector
description: Detect structural macro regime transitions (1-2 year horizon) using cross-asset ratio analysis. Analyze RSP/SPY concentration, yield curve, credit conditions, size factor, equity-bond relationship, and sector rotation to identify regime shifts between Concentration, Broadening, Contraction, Inflationary, and Transitional states. Run when user asks about macro regime, market regime change, structural rotation, or long-term market positioning.
---
# 宏观状态检测器

通过月频跨资产比率分析检测结构性宏观状态转变。该技能识别 1-2 年尺度的状态转变，为战略性投资组合配置提供依据。

## 何时使用

- 用户询问当前宏观状态或状态转变
- 用户想了解结构性市场轮动（集中化 vs 广谱化）
- 用户基于收益率曲线、信用或跨资产信号询问长期配置
- 用户提及 RSP/SPY 比率、IWM/SPY、HYG/LQD 或其他跨资产比率
- 用户想评估是否正在发生状态切换

## 工作流程

1. 加载参考文档以获取方法论背景：
   - `references/regime_detection_methodology.md`
   - `references/indicator_interpretation_guide.md`

2. 执行主分析脚本：
   ```bash
   python3 -m pip install -r skills/macro-regime-detector/requirements.txt
   uv run python3 skills/macro-regime-detector/scripts/macro_regime_detector.py --output-dir reports/
   ```
   该脚本会获取 9 只 ETF 共 600 天的数据。若提供 FMP 密钥，客户端会优先尝试 FMP 并获取国债收益率（总计约 10 次 API 调用），然后对无法获取历史的 ETF 回退到 yfinance。若无 FMP 密钥，则以纯 yfinance 模式运行，并使用 SHY/TLT 作为收益率曲线的回退方案。

   当六个组件中没有任何一个拥有可用数据时，检测器会故障关闭（fail closed）且不写入报告。不要将缺失报告或非零退出视为有效的低转变状态。

3. 阅读生成的 Markdown 报告并向用户呈现结果。

4. 当用户询问历史类比时，使用 `references/historical_regimes.md` 提供补充背景。

## 前置条件

- **Python 依赖**（必需）：安装 `requirements.txt`，包括 yfinance 和 requests
- **FMP API 密钥**（可选）：设置 `FMP_API_KEY` 或传入 `--api-key`，以便在回退到 yfinance/SHY-TLT 之前优先使用 FMP 和国债数据
- FMP 免费套餐可能无法提供所有 ETF 的数据；不可用的代码会自动使用 yfinance

## 6 大组件

| # | 组件 | 比率/数据 | 权重 | 检测内容 |
|---|-----------|------------|--------|-----------------|
| 1 | 市场集中度 | RSP/SPY | 25% | 超大盘集中 vs 市场广谱化 |
| 2 | 收益率曲线 | 10Y-2Y 利差 | 20% | 利率周期转变 |
| 3 | 信用状况 | HYG/LQD | 15% | 信用周期风险偏好 |
| 4 | 规模因子 | IWM/SPY | 15% | 小盘 vs 大盘轮动 |
| 5 | 股票-债券 | SPY/TLT + 相关性 | 15% | 股债关系状态 |
| 6 | 行业轮动 | XLY/XLP | 10% | 周期性 vs 防御性偏好 |

## 5 种状态分类

- **集中（Concentration）**：超大盘股领涨，市场狭窄
- **广谱（Broadening）**：参与度扩大，小盘/价值轮动
- **收缩（Contraction）**：信用收紧，防御性轮动，避险情绪
- **通胀型（Inflationary）**：股债相关性为正，传统对冲失效
- **过渡（Transitional）**：信号众多但形态不明

## 输出

- `macro_regime_YYYY-MM-DD_HHMMSS.json` — 用于程序化消费的结构化数据
- `macro_regime_YYYY-MM-DD_HHMMSS.md` — 人类可读的报告，包含：
  1. 当前状态评估
  2. 转变信号仪表盘
  3. 组件详情
  4. 状态分类依据
  5. 投资组合姿态建议

## 与其他技能的关系

| 方面 | 宏观状态检测器 | 市场顶部检测器 | 市场广度分析器 |
|--------|----------------------|--------------------|-----------------------|
| 时间跨度 | 1-2 年（结构性） | 2-8 周（战术性） | 当前快照 |
| 数据粒度 | 月度（6M/12M SMA） | 日度（25 个交易日） | 日度 CSV |
| 检测目标 | 状态转变 | 10-20% 的回调 | 广度健康评分 |
| API 调用 | ~10 | ~33 | 0（免费 CSV） |

## 脚本参数

```bash
python3 macro_regime_detector.py [options]

Options:
  --api-key KEY       FMP API key (default: $FMP_API_KEY)
  --output-dir DIR    Output directory (default: current directory)
  --days N            Days of history to fetch (default: 600)
```

## 资源

- `references/regime_detection_methodology.md` — 检测方法论与信号解读
- `references/indicator_interpretation_guide.md` — 跨资产比率解读指南
- `references/historical_regimes.md` — 用于提供背景的历史状态示例
