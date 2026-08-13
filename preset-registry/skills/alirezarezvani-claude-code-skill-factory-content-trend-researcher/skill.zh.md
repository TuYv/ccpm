---
name: content-trend-researcher
description: Advanced content and topic research skill that analyzes trends across Google Analytics, Google Trends, Substack, Medium, Reddit, LinkedIn, X, blogs, podcasts, and YouTube to generate data-driven article outlines based on user intent analysis
---
# 内容趋势研究员

一项全面的内容研究与分析技能，专为需要基于现实趋势和用户意图信号创作高绩效内容的内容创作者、营销人员和出版商而设计。

## 此技能的作用

此技能可作为你的内容情报系统，通过分析 10 多个平台的趋势来帮助你：

1. **识别热门话题** - 找出正在各平台上获得关注的话题
2. **理解用户意图** - 分析搜索模式和互动信号
3. **发现内容缺口** - 找出需求旺盛但尚未得到充分满足的话题
4. **生成大纲** - 创建由数据驱动、以提升互动为目标的文章结构
5. **平台专属洞察** - 了解不同类型的内容在哪些平台上表现最佳

## 功能

### 多平台趋势分析
- **Google Trends** - 搜索量趋势、上升查询、地区兴趣度
- **Google Analytics** - 流量模式、用户行为、转化信号
- **Substack** - 新闻简报趋势、订阅者增长模式
- **Medium** - 文章表现、标签、鼓掌数、阅读时长
- **Reddit** - 子版块活跃度、点赞数、评论互动、热门讨论
- **LinkedIn** - 职场内容趋势、互动指标
- **X (Twitter)** - 病毒式传播话题、话题标签表现、帖子串互动
- **博客** - 排名靠前的博客文章、反向链接概况
- **播客** - 单集受欢迎程度、下载趋势、评分
- **YouTube** - 视频表现、观看量趋势、观看时长、互动情况

### 用户意图分析
- **信息型意图** - “如何”、“什么是”、“……指南”
- **商业型意图** - “最佳”、“评测”、“比较”、“vs”
- **交易型意图** - “购买”、“定价”、“折扣”
- **导航型意图** - 品牌搜索、特定资源查找
- **问题解决型意图** - “修复”、“故障排除”、“解决方案”

### 内容策略情报
- 各平台的最佳内容形式
- 根据互动数据确定最佳发布时间
- 经验证表现优异的标题公式
- 内容长度建议
- 主题聚类和支柱内容识别

### 大纲生成
创建全面的文章大纲，包括：
- 与用户意图匹配的 SEO 优化标题
- 基于搜索模式的 H2/H3 结构
- 从表现最佳的内容中提炼出的关键要点
- 建议字数和内容深度
- 内部链接机会
- 行动号召建议
- 多媒体建议（图片、视频、信息图）

## 何时使用此技能

**创建任何内容之前：**
- 研究你的细分领域中的热门话题
- 使用数据验证内容创意
- 找出竞争对手遗漏的内容缺口
- 了解最适合你的话题的内容形式

**用于内容策略：**
- 根据趋势制定编辑日历
- 识别支柱内容机会
- 围绕热门话题规划内容集群
- 优化现有内容以提升表现

**用于竞争分析：**
- 了解哪些做法对竞争对手有效
- 找出尚未得到充分服务的受众群体
- 发现新的内容切入角度
- 对标你的表现

## 调用示例

### 基础主题研究
```
@content-trend-researcher

Topic: "AI automation for small businesses"
Platforms: Google Trends, Reddit, LinkedIn, YouTube
Intent: Informational
```

### 深度平台分析
```
@content-trend-researcher

Topic: "Remote work productivity tools"
Platforms: ALL
Include: User intent breakdown, content gap analysis, 3 article outlines
Target audience: SaaS founders and product managers
```

### 竞品内容研究
```
@content-trend-researcher

Topic: "Email marketing strategies 2025"
Platforms: Medium, Substack, Top blogs
Analyze: Top 10 performing articles
Output: Outline that fills content gaps
```

### 多格式策略
```
@content-trend-researcher

Topic: "Sustainable fashion"
Platforms: Instagram, TikTok, YouTube, Pinterest, Blogs
Output: Platform-specific content ideas + 1 long-form blog outline
```

## 输入格式

提供以下信息：

```json
{
  "topic": "Your main topic or keyword",
  "platforms": ["Google Trends", "Reddit", "YouTube", "etc."],
  "intent_focus": "informational|commercial|transactional|all",
  "target_audience": "Description of your audience",
  "content_type": "blog|article|newsletter|video script|social post",
  "analysis_depth": "quick|standard|deep",
  "number_of_outlines": 1-5
}
```

## 输出格式

该技能会返回一份全面的研究报告：

```json
{
  "topic_overview": {
    "search_volume": "Monthly search volume estimate",
    "trend_direction": "rising|stable|declining",
    "competition_level": "low|medium|high",
    "opportunity_score": 1-100
  },
  "platform_insights": [
    {
      "platform": "Platform name",
      "trending_content": [],
      "engagement_metrics": {},
      "best_practices": [],
      "content_format": "Recommended format"
    }
  ],
  "user_intent_analysis": {
    "primary_intent": "Intent type",
    "intent_breakdown": {
      "informational": "percentage",
      "commercial": "percentage",
      "transactional": "percentage"
    },
    "top_questions": [],
    "search_patterns": []
  },
  "content_gaps": [
    {
      "gap": "Description of underserved topic",
      "opportunity": "Why this is valuable",
      "difficulty": "low|medium|high"
    }
  ],
  "article_outlines": [
    {
      "title": "SEO-optimized title",
      "subtitle": "Engaging subtitle",
      "target_word_count": 1500-2000,
      "structure": [
        {
          "heading": "H2 heading",
          "subheadings": ["H3", "H3"],
          "key_points": [],
          "research_notes": "Data supporting this section"
        }
      ],
      "seo_keywords": [],
      "internal_links": [],
      "multimedia_suggestions": [],
      "cta": "Suggested call-to-action"
    }
  ],
  "recommendations": {
    "publishing_schedule": "Best days/times",
    "content_format": "Recommended format",
    "promotion_strategy": "Where to share",
    "follow_up_topics": []
  }
}
```

## 最佳实践

1. **明确具体的主题** - “面向小型企业会计的 AI”优于“AI”
2. **选择相关的平台** - 选择受众真正消费内容的平台
3. **仔细分析意图** - 让你的内容与用户需求相匹配
4. **寻找内容空白** - 最好的内容会满足他人忽略的需求
5. **使用数据进行验证** - 不要凭空假设，应通过趋势数据验证
6. **定期更新** - 趋势不断变化；对于活跃主题，应每月进行研究

## 局限性

- 实时数据需要平台 API 访问权限（本技能不包含）
- 某些平台会限制数据访问（例如 X API 的变更）
- 搜索量估算值为近似值
- 趋势数据反映的是过去的表现，并不能保证未来结果
- 平台特定指标取决于数据可用性

## 与其他技能集成

本技能非常适合与以下技能结合使用：
- **SEO 优化技能** - 使用大纲创建经过优化的内容
- **社交媒体排期技能** - 围绕趋势规划推广活动
- **电子邮件简报技能** - 根据热门话题创建简报
- **竞争分析技能** - 开展更深入的竞争对手研究
- **内容日历技能** - 根据趋势时机安排内容

## 技术说明

- 使用趋势分析算法识别正在兴起的话题
- 基于关键词模式和 SERP 分析进行意图分类
- 大纲生成遵循经过验证的内容框架（AIDA、PAS 等）
- 平台洞察基于互动指标和算法信号
- 通过比较分析识别内容缺口

## 隐私与道德规范

- 不访问用户的私有数据
- 使用公开可用的趋势数据和指标
- 遵守平台服务条款
- 不抓取付费墙后的内容或私有内容
- 趋势分析基于统计，而非监视

---

**版本**：1.0.0
**最后更新**：2025年10月21日
**兼容性**：Claude.ai、Claude Code、Claude API（配合 Code Execution Tool）