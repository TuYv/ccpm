---
name: app-store-optimization
description: Complete App Store Optimization (ASO) toolkit for researching, optimizing, and tracking mobile app performance on Apple App Store and Google Play Store
---
# 应用商店优化（ASO）技能

这项综合技能提供完整的 ASO 能力，助力移动应用在 Apple App Store 和 Google Play Store 上成功发布并持续优化。

## 能力

### 研究与分析
- **关键词研究**：分析关键词的搜索量、竞争程度及其与应用发现的相关性
- **竞品分析**：深入分析所属类别中表现最佳的应用
- **市场趋势分析**：识别应用类别中的新兴趋势与机会
- **评论情感分析**：从用户评论中提取洞察，以识别优势和问题
- **类别分析**：评估最佳类别和子类别的定位策略

### 元数据优化
- **标题优化**：在平台特定的字符限制内，通过最佳关键词布局创建富有吸引力的标题
- **描述优化**：撰写既能提升转化率又能提高排名的简短描述和完整描述
- **副标题/推广文本**：优化 Apple 特有的副标题（30 个字符）和推广文本（170 个字符）
- **关键词字段**：通过策略性选择，充分利用 Apple 的 100 字符关键词字段
- **类别选择**：基于数据为主要类别和次要类别提供建议
- **图标最佳实践**：提供高转化率应用图标的设计指南
- **截图优化**：制定能够推动安装的截图创建策略
- **预览视频**：提供应用预览视频的最佳实践
- **本地化**：制定面向全球受众的多语言优化策略

### 转化优化
- **A/B 测试框架**：规划并跟踪元数据实验，以实现持续改进
- **视觉素材测试**：测试图标、截图和视频，以最大限度提升转化率
- **商店列表优化**：全面优化商店页面，提高从展示到安装的转化率
- **行动号召**：优化描述和推广材料中的 CTA

### 评分与评论管理
- **评论监控**：跟踪并分析用户评论，从中获取可执行的洞察
- **回复策略**：提供回复评论的模板和最佳实践
- **评分提升**：采用策略性方法自然提升应用评分
- **问题识别**：从评论中发现常见问题和功能请求

### 发布与更新策略
- **发布前检查清单**：在提交至应用商店前进行完整验证
- **发布时间**：优化发布时间，以最大限度提高曝光度和下载量
- **更新节奏**：规划最佳更新频率和功能发布安排
- **功能公告**：撰写能够重新吸引用户的“新功能”部分
- **季节性优化**：利用季节性趋势和事件

### 分析与跟踪
- **ASO 评分**：根据多个因素计算整体 ASO 健康度评分
- **关键词排名**：跟踪关键词位置随时间的变化
- **转化指标**：监控从展示到安装的转化率
- **下载速度**：跟踪下载趋势和增长势头
- **绩效基准比较**：与类别平均水平和竞争对手进行比较

### 平台特定要求
- **Apple App Store**：
  - 标题：30 个字符
  - 副标题：30 个字符
  - 推广文本：170 个字符（无需更新 App 即可编辑）
  - 描述：4,000 个字符
  - 关键词：100 个字符（以逗号分隔，不含空格）
  - 新增内容：4,000 个字符
- **Google Play 商店**：
  - 标题：50 个字符（之前为 30 个，2021 年增加）
  - 简短描述：80 个字符
  - 完整描述：4,000 个字符
  - 无单独的关键词字段（关键词从标题和描述中提取）

## 输入要求

### 关键词研究
```json
{
  "app_name": "MyApp",
  "category": "Productivity",
  "target_keywords": ["task manager", "productivity", "todo list"],
  "competitors": ["Todoist", "Any.do", "Microsoft To Do"],
  "language": "en-US"
}
```

### 元数据优化
```json
{
  "platform": "apple" | "google",
  "app_info": {
    "name": "MyApp",
    "category": "Productivity",
    "target_audience": "Professionals aged 25-45",
    "key_features": ["Task management", "Team collaboration", "AI assistance"],
    "unique_value": "AI-powered task prioritization"
  },
  "current_metadata": {
    "title": "Current Title",
    "subtitle": "Current Subtitle",
    "description": "Current description..."
  },
  "target_keywords": ["productivity", "task manager", "todo"]
}
```

### 评论分析
```json
{
  "app_id": "com.myapp.app",
  "platform": "apple" | "google",
  "date_range": "last_30_days" | "last_90_days" | "all_time",
  "rating_filter": [1, 2, 3, 4, 5],
  "language": "en"
}
```

### ASO 评分计算
```json
{
  "metadata": {
    "title_quality": 0.8,
    "description_quality": 0.7,
    "keyword_density": 0.6
  },
  "ratings": {
    "average_rating": 4.5,
    "total_ratings": 15000
  },
  "conversion": {
    "impression_to_install": 0.05
  },
  "keyword_rankings": {
    "top_10": 5,
    "top_50": 12,
    "top_100": 18
  }
}
```

## 输出格式

### 关键词研究报告
- 推荐关键词列表及搜索量估算
- 竞争程度分析（低/中/高）
- 每个关键词的相关性评分
- 主要关键词与次要关键词的策略建议
- 长尾关键词机会

### 优化后的元数据包
- 平台特定标题（含字符数验证）
- 副标题/推广文本（Apple）
- 简短描述（Google）
- 完整描述（两个平台）
- 关键词字段（Apple，100 个字符）
- 所有字段的字符数验证
- 关键词密度分析
- 优化前后对比

### 竞品分析报告
- 类别中的前 10 名竞品
- 竞品的元数据策略
- 关键词重叠分析
- 视觉素材评估
- 评分和评论数量对比
- 已识别的空白与机会

### ASO 健康度评分
- 总体评分（0-100）
- 类别细分：
  - 元数据质量（0-25）
  - 评分与评论（0-25）
  - 关键词表现（0-25）
  - 转化指标（0-25）
- 具体改进建议
- 优先行动项

### A/B 测试计划
- 假设和测试变量
- 测试时长建议
- 成功指标定义
- 样本量计算
- 统计显著性阈值

### 发布检查清单
- 提交前验证（所有必需的素材和元数据）
- 应用商店合规性验证
- 测试检查清单（设备、操作系统版本）
- 营销准备事项
- 发布后监控计划

## 使用方法

### 关键词研究
```
Hey Claude—I just added the "app-store-optimization" skill. Can you research the best keywords for a productivity app targeting professionals? Focus on keywords with good search volume but lower competition.
```

### 优化应用商店商品详情
```
Hey Claude—I just added the "app-store-optimization" skill. Can you optimize my app's metadata for the Apple App Store? Here's my current listing: [provide current metadata]. I want to rank for "task management" and "productivity tools".
```

### 分析竞争对手策略
```
Hey Claude—I just added the "app-store-optimization" skill. Can you analyze the ASO strategies of Todoist, Any.do, and Microsoft To Do? I want to understand what they're doing well and where there are opportunities.
```

### 用户评价情感分析
```
Hey Claude—I just added the "app-store-optimization" skill. Can you analyze recent reviews for my app (com.myapp.ios) and identify the most common user complaints and feature requests?
```

### 计算 ASO 评分
```
Hey Claude—I just added the "app-store-optimization" skill. Can you calculate my app's overall ASO health score and provide specific recommendations for improvement?
```

### 规划 A/B 测试
```
Hey Claude—I just added the "app-store-optimization" skill. I want to A/B test my app icon and first screenshot. Can you help me design the test and determine how long to run it?
```

### 发布前检查清单
```
Hey Claude—I just added the "app-store-optimization" skill. Can you generate a comprehensive pre-launch checklist for submitting my app to both Apple App Store and Google Play Store?
```

## 脚本

### keyword_analyzer.py
分析关键词的搜索量、竞争程度和相关性。针对主要和次要关键词提供策略建议。

**主要函数：**
- `analyze_keyword()`：分析单个关键词的指标
- `compare_keywords()`：比较多个关键词
- `find_long_tail()`：发掘长尾关键词机会
- `calculate_keyword_difficulty()`：评估竞争程度

### metadata_optimizer.py
优化标题、描述和关键词字段，并根据具体平台验证字符数限制。

**主要函数：**
- `optimize_title()`：创建富有吸引力且包含丰富关键词的标题
- `optimize_description()`：生成以提升转化率为目标的描述
- `optimize_keyword_field()`：充分利用 Apple 的 100 字符关键词字段
- `validate_character_limits()`：确保符合平台限制
- `calculate_keyword_density()`：分析元数据中的关键词使用情况

### competitor_analyzer.py
分析主要竞争对手的 ASO 策略并发现机会。

**核心函数：**
- `get_top_competitors()`：识别品类中的领先者
- `analyze_competitor_metadata()`：提取并分析竞品关键词
- `compare_visual_assets()`：评估图标和截图
- `identify_gaps()`：发现竞争机会

### aso_scorer.py
计算涵盖多个维度的综合 ASO 健康度评分。

**核心函数：**
- `calculate_overall_score()`：计算 0-100 的 ASO 评分
- `score_metadata_quality()`：评估标题、描述和关键词
- `score_ratings_reviews()`：评估评分质量和数量
- `score_keyword_performance()`：分析排名位置
- `score_conversion_metrics()`：评估从曝光到安装的转化率
- `generate_recommendations()`：提供按优先级排序的行动项

### ab_test_planner.py
规划并跟踪元数据和视觉素材的 A/B 测试。

**核心函数：**
- `design_test()`：创建测试假设和变量
- `calculate_sample_size()`：确定所需的测试时长
- `calculate_significance()`：评估统计显著性
- `track_results()`：监控测试表现
- `generate_report()`：汇总测试结果

### localization_helper.py
管理多语言 ASO 优化策略。

**核心函数：**
- `identify_target_markets()`：推荐本地化优先级
- `translate_metadata()`：生成本地化元数据
- `adapt_keywords()`：研究特定地区的关键词
- `validate_translations()`：检查每种语言的字符限制
- `calculate_localization_roi()`：估算本地化的影响

### review_analyzer.py
分析用户评论中的情感倾向、问题和功能请求。

**核心函数：**
- `analyze_sentiment()`：计算正面、负面和中性评论的比例
- `extract_common_themes()`：识别频繁提及的主题
- `identify_issues()`：发现错误和用户投诉
- `find_feature_requests()`：提取用户期望的功能
- `track_sentiment_trends()`：监控情感趋势随时间的变化
- `generate_response_templates()`：创建评论回复草稿

### launch_checklist.py
生成全面的发布前检查清单和更新检查清单。

**核心函数：**
- `generate_prelaunch_checklist()`：完成提交验证
- `validate_app_store_compliance()`：检查是否符合 Apple 指南
- `validate_play_store_compliance()`：检查是否符合 Google 政策
- `create_update_plan()`：规划更新频率和功能
- `optimize_launch_timing()`：推荐发布日期
- `plan_seasonal_campaigns()`：识别季节性机会

## 最佳实践

### 关键词研究
1. **搜索量与竞争度**：在高搜索量关键词和可实现的排名之间取得平衡
2. **相关性优先**：只定位与你的应用真正相关的关键词
3. **长尾策略**：纳入竞争度较低的 3-4 词短语
4. **持续研究**：关键词趋势会发生变化——每季度进行研究
5. **竞品关键词**：不要盲目照搬；确保它们与你的功能相关

### 元数据优化
1. **关键词前置**：将最重要的关键词放在标题和描述的前部
2. **自然语言**：优先为人类撰写，其次才考虑 SEO
3. **功能收益**：关注为用户带来的收益，而不只是功能本身
4. **对一切进行 A/B 测试**：系统地测试标题、描述和截图
5. **定期更新**：每次重大更新时刷新元数据
6. **字符限制**：充分利用每个字符——不要浪费宝贵空间
7. **Apple 关键词字段**：不要使用复数、重复词，逗号之间不要有空格

### 视觉素材
1. **图标**：必须在较小尺寸（60x60px）下仍易于识别
2. **截图**：前 2-3 张至关重要——大多数用户不会继续滚动
3. **说明文字**：使用截图说明文字讲述你的价值主张
4. **一致性**：视觉风格应与应用设计保持一致
5. **对图标进行 A/B 测试**：图标是最重要的单一视觉元素

### 评论与评分
1. **快速回复**：在 24-48 小时内回复评论
2. **专业语气**：始终保持礼貌，即使面对负面评论
3. **处理问题**：表明你正在积极修复用户报告的问题
4. **感谢支持者**：对正面评论表示感谢
5. **把握提示时机**：在用户获得正面体验后邀请其评分

### 发布策略
1. **软发布**：考虑先在规模较小的市场发布
2. **公关时机**：协调媒体报道与发布时间
3. **频繁更新**：早期的频繁更新能够表明产品正在积极开发
4. **密切监控**：在前 2 周内每天跟踪指标
5. **快速迭代**：立即修复关键问题

### 本地化
1. **确定市场优先级**：从英语、西班牙语、中文、法语和德语开始
2. **母语人士**：使用专业译者，而非机器翻译
3. **文化适配**：某些功能在不同文化中引发的共鸣有所不同
4. **本地测试**：发布前请母语人士审核
5. **衡量 ROI**：按语言区域跟踪下载量，以评估效果

## 局限性

### 数据依赖
- 关键词搜索量估算值仅供参考（Apple/Google 不提供官方数据）
- 对于私有应用，竞品数据可能不完整
- 评论分析仅限公开评论（无法访问私密反馈）
- 新应用可能没有可用的历史数据

### 平台限制
- 更改 Apple App Store 关键词需要提交应用（Promotional Text 除外）
- Google Play Store 元数据更改需要 1-2 小时才能被索引
- A/B 测试需要足够大的流量才能达到统计显著性
- 应用商店算法属于专有信息，且可能随时更改而不另行通知

### 行业差异
- 不同类别的 ASO 基准差异显著（游戏与实用工具）
- 季节性对不同类别的影响各不相同
- 不同地域市场的竞争格局各不相同
- 文化偏好会影响不同国家/地区中有效的策略

### 范围边界
- 不包括付费用户获取策略（Apple Search Ads、Google Ads）
- 不涵盖应用开发或 UI/UX 优化
- 不包括应用分析工具的实施（使用 Firebase、Mixpanel 等）
- 不处理应用提交过程中的技术问题（配置描述文件、证书）

### 不应使用此 Skill 的情况
- Web 应用（适用不同的 SEO 策略）
- 未在公开应用商店上架的企业应用
- 仅处于 beta/TestFlight 阶段的应用
- 如果你需要付费广告策略（请改用营销类 Skill）

## 与其他 Skill 的集成

此 Skill 可与以下 Skill 良好配合：
- **内容策略 Skill**：用于创建应用描述和营销文案
- **分析 Skill**：用于分析下载量和互动数据
- **本地化 Skill**：用于管理多语言内容
- **设计 Skill**：用于创建经过优化的视觉素材
- **营销 Skill**：用于协调更广泛的发布营销活动

## 版本与更新

本技能基于截至 2025 年 11 月的现行 Apple App Store 和 Google Play Store 要求。应用商店政策和最佳实践会不断变化——在重大版本发布前，请核实现行要求。

**需要关注的关键更新：**
- Apple App Store Connect 更新（apple.com/app-store/review/guidelines）
- Google Play Console 更新（play.google.com/console/about/guides/releasewithconfidence）
- iOS/Android 版本采用率（影响设备测试）
- 应用商店算法变更（关注 ASO 博客和社区）