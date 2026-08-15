---
name: yt-competitive-analysis
description: >-
  Analyze YouTube channels for outlier videos and packaging patterns. Identifies
  what's working (2x+ average views) across any set of channels. Use when asked for
  YouTube competitive analysis, viral video patterns, or packaging/title inspiration.
---
# YouTube 竞品分析

针对 YouTube 频道进行异常值检测和包装模式提取。

## 适用场景

- 用户要求进行 YouTube 竞品分析
- 用户希望发现爆款视频的规律
- 用户希望从特定创作者那里获取包装/标题灵感
- 用户希望跟踪 YouTube 竞品的表现

## 前置条件

- 将 YouTube Data API v3 密钥设置为 `$YOUTUBE_API_KEY`

## 用法

```bash
# Analyze specific channels
python3 analyze.py "$YOUTUBE_API_KEY" --channels "@handle1,@handle2" --days 30

# Use predefined sets
python3 analyze.py "$YOUTUBE_API_KEY" --set ai
python3 analyze.py "$YOUTUBE_API_KEY" --set business
python3 analyze.py "$YOUTUBE_API_KEY" --set both

# Export formats
python3 analyze.py "$YOUTUBE_API_KEY" --set both --output json
python3 analyze.py "$YOUTUBE_API_KEY" --set both --output console
```

## 预定义频道集合

**AI 创作者：** Jeff Su、Alex Finn、Riley Brown、Dan Martell、Matt Wolfe、Nate Herk、Grace Leung、Matt Berman

**商业创作者：** Alex Hormozi、Gary Vaynerchuk、Patrick Bet-David、Codie Sanchez、Leila Hormozi、Iman Gadzhi、My First Million

## 输出解读

- **倍数**：高于频道平均水平的倍数（2.0x = 正常水平的两倍）
- **异常值阈值**：平均水平的 2x。应研究所有高于此阈值的内容。
- **标题模式**：异常值视频标题中的常见词表明这些是已验证的格式
- **发布频率**：每周发布的视频数量。发布频率较高的创作者，其单条视频平均表现可能较低。

## 频道分析反馈循环

竞品分析只是整个循环的一半。当你能够访问频道自身的分析数据时，应在发布后将候选包装与实际表现进行比较。

推荐包装之前：
- 按主题、标题模式、缩略图模式、时长、发布日期/时间和格式提取频道基准数据。
- 检查展示次数、CTR、平均观看时长、留存曲线、观看时间、获得的订阅者数、评论和流量来源。
- 将拟议的标题/缩略图/开场钩子与类似的历史视频和竞品异常值视频进行比较。

发布之后：
1. 记录视频 ID、标题、缩略图概念、开场钩子、主题分类、留存手段和发布日期。
2. 在选定的回看窗口结束后提取分析数据。
3. 比较基准方案与候选方案。
4. 仅当候选方案胜出时，才调整标题公式、缩略图规则、开场钩子模式、留存节奏、章节结构、Shorts 选取方式或内容再利用指南。

回看窗口：
- 24-48 小时：评估 CTR 和早期留存
- 7 天：评估平均观看时长和观看时间
- 28 天：评估主题的持久性和订阅者增长

在检查分析数据之前，不要声称包装已经得到验证。否则，它不过是一部穿着实验服的剧本。

## 包装框架（已验证格式）

**长视频：**
- “清晰讲解 X”
- “用 Z 分钟讲完 X 小时的 Y”
- “完成 X 最省事的方法”
- “给我 X 分钟，我就能 Y”
- “Y 的 X 个疯狂用例”

**Shorts：**
- “2024 与 2025 的 X 对比”（年份对比）
- “糟糕、优秀、顶级的 X”（等级排名）
- “别再做 X，改做 Y”（反常识）