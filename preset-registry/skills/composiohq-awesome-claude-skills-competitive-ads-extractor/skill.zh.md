---
name: competitive-ads-extractor
description: Extracts and analyzes competitors' ads from ad libraries (Facebook, LinkedIn, etc.) to understand what messaging, problems, and creative approaches are working. Helps inspire and improve your own ad campaigns.
---
# 竞争广告提取器

该技能可从广告库提取你的竞争对手广告，并分析哪些内容在发挥作用——他们正在强调的问题、瞄准的使用场景，以及能够引发共鸣的文案/创意。

## 何时使用此技能

- 研究竞争对手广告策略
- 寻找你自己广告的灵感
- 了解市场定位
- 识别成功的广告模式
- 分析有效的信息传达
- 发现新的使用场景或痛点
- 用已验证的概念规划广告活动

## 该技能功能

1. **提取广告**：从 Facebook 广告库、LinkedIn 等抓取广告
2. **抓取截图**：保存所有广告的视觉副本
3. **分析信息传达**：识别问题、使用场景和价值主张
4. **归类广告**：按主题、受众或形式分组
5. **识别模式**：找出常见的成功方法
6. **提供洞察**：解释为何某些广告可能表现良好

## 使用方法

### 基础提取

```
Extract all current ads from [Competitor Name] on Facebook Ad Library
```

```
Scrape ads from [Company] and analyze their messaging
```

### 特定分析

```
Get all ads from [Competitor] focusing on their messaging 
about [specific problem]. What pain points are they highlighting?
```

### 竞争集合

```
Extract ads from these 5 competitors: [list]. 
Compare their approaches and tell me what's working.
```

### 特定平台

```
Get LinkedIn ads from [Competitor] and analyze their 
B2B positioning strategy
```

## 示例

**用户**：`"Extract ads from Notion on Facebook Ad Library and tell me what messaging is working for them."`

**流程**：
```
Accessing Facebook Ad Library...
Searching for: Notion
Found: 23 active ads

Extracting screenshots...
[████████████████████] 100%

Saved to: competitor-ads/notion/
- ad-001-collaboration.png
- ad-002-productivity.png
- ad-003-templates.png
...

Analyzing messaging...
```

**输出**：
```
# Notion Ad Analysis

## Overview
- Total Ads: 23 active
- Primary Themes: Productivity (35%), Collaboration (30%), 
  Templates (20%), AI Features (15%)
- Ad Formats: Static images (60%), Video (40%)
- CTA Patterns: "Try for free", "Get started"

## Key Problems They're Highlighting

1. **Scattered Information** (8 ads)
   Copy: "Stop switching between 10 different tools"
   Why it works: Direct pain point many teams face

2. **Meeting Overload** (5 ads)
   Copy: "Replace unnecessary meetings with async updates"
   Why it works: Post-COVID remote work pain point

3. **Lost Documentation** (4 ads)
   Copy: "Never ask 'where is that doc?' again"
   Why it works: Universal workplace frustration

## Successful Creative Patterns

### Pattern 1: Before/After Split
- Shows chaotic tool landscape → Clean Notion workspace
- Used in 6 high-performing ads
- Visual metaphor is immediately clear

### Pattern 2: Feature Showcase
- GIF of actual product usage
- Shows specific feature in 5 seconds
- Used for new features (AI, templates)

### Pattern 3: Social Proof
- "Join 20M users" messaging
- Customer logos
- Used in 4 ads targeting enterprise

## Copy That's Working

Best Headlines:
1. "Your team's knowledge, finally in one place"
   → Benefit-focused, addresses pain directly
   
2. "The all-in-one workspace"
   → Clear positioning, broad appeal
   
3. "AI that actually helps you work"
   → Addresses AI skepticism, practical angle

Best Body Copy Patterns:
- Short sentences (under 10 words)
- Focus on outcomes not features
- Include specific numbers ("Cut meetings by 50%")

## Audience Targeting Insights

Based on ad variations:
- Startup founders: Solo productivity angle
- Team leads: Collaboration and alignment
- Enterprise: Security and compliance mentions
- Students: Free plan, templates, organization

## Recommendations for Your Ads

1. **Test the "tool sprawl" pain point**
   → Strong resonance based on their ad frequency

2. **Use product screenshots over abstract visuals**
   → All their top ads show actual UI

3. **Lead with the problem, not the solution**
   → "Tired of X?" performs better than "Introducing Y"

4. **Keep copy under 100 characters**
   → Their shortest ads seem most frequent

5. **Test before/after visual formats**
   → Proven pattern in their creative

## Files Saved
- All ads: ~/competitor-ads/notion/
- Analysis: ~/competitor-ads/notion/analysis.md
- Best performers: ~/competitor-ads/notion/top-10/
```

**启发来源：** Sumant Subrahmanya 在 Lenny's Newsletter 的使用案例

## 你可学习的内容

### 信息传达分析
- 他们强调了哪些问题
- 如何与竞争对手进行定位对比
- 能引起共鸣的价值主张
- 目标受众细分

### 创意模式
- 有效的视觉风格
- 视频与静态图片的表现
- 配色方案与品牌识别
- 布局模式

### 文案公式
- 标题结构
- 行动号召模式
- 长度与语气
- 情绪触发点

### 活动策略
- 季节性活动
- 产品发布方法
- 功能发布战术
- 再营销模式

## 最佳实践

### 法律与道德
✓ 仅用于研究与灵感获取  
✓ 不要直接复制广告  
✓ 尊重知识产权  
✓ 用洞察来支持原创创意  
✗ 不要抄袭文案或窃取设计

### 分析建议
1. **寻找模式**：哪些主题重复出现？
2. **持续追踪**：每月保存广告以观察变化
3. **验证假设**：将成功模式调整为你的品牌使用
4. **按受众细分**：不同目标群体采用不同信息
5. **比较平台差异**：LinkedIn 与 Facebook 的信息传达不同

## 高级功能

### 趋势追踪
```
Compare [Competitor]'s ads from Q1 vs Q2. 
What messaging has changed?
```

### 多竞争对手分析
```
Extract ads from [Company A], [Company B], [Company C]. 
What are the common patterns? Where do they differ?
```

### 行业基准
```
Show me ad patterns across the top 10 project management 
tools. What problems do they all focus on?
```

### 格式分析
```
Analyze video ads vs static image ads from [Competitor]. 
Which gets more engagement? (if data available)
```

## 常见工作流

### 广告活动规划
1. 提取竞争对手广告
2. 识别成功模式
3. 记录他们信息传达中的空白
4. 头脑风暴独特角度
5. 起草测试版广告变体

### 定位研究
1. 获取 5 家竞争对手的广告
2. 绘制其定位图
3. 找出未充分覆盖的角度
4. 开发差异化信息
5. 与他们的方法对比测试

### 创意灵感
1. 按主题提取广告
2. 分析视觉模式
3. 记录配色与布局趋势
4. 调整成功模式
5. 创作原创变体

## 成功建议

1. **持续监测**：每月检查变化
2. **广泛研究**：也看邻近竞争者
3. **完整保存**：建立参考库
4. **测试洞察**：运行你自己的实验
5. **追踪表现**：A/B 测试受启发的概念
6. **保持原创**：用于灵感获取，而非抄袭
7. **多平台对比**：比较 Facebook、LinkedIn、TikTok 等

## 输出格式

- **截图**：所有广告均以图片形式保存
- **分析报告**：Markdown 洞察摘要
- **电子表格**：包含文案、CTA、主题的 CSV
- **演示稿**：高表现广告的可视化幻灯片
- **模式库**：按方法进行分类

## 相关用例

- 为你的活动编写更好的广告文案
- 了解市场定位
- 寻找你信息传达中的内容空白
- 为你的产品发现新的使用场景
- 规划产品营销策略
- 激发社交媒体内容
