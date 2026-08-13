---
name: "app-store-optimization"
description: App Store Optimization (ASO) toolkit for researching keywords, analyzing competitor rankings, generating metadata suggestions, and improving app visibility on Apple App Store and Google Play Store. Use when the user asks about ASO, app store rankings, app metadata, app titles and descriptions, app store listings, app visibility, or mobile app marketing on iOS or Android. Supports keyword research and scoring, competitor keyword analysis, metadata optimization, A/B test planning, launch checklists, and tracking ranking changes.
triggers:
  - ASO
  - app store optimization
  - app store ranking
  - app keywords
  - app metadata
  - play store optimization
  - app store listing
  - improve app rankings
  - app visibility
  - app store SEO
  - mobile app marketing
  - app conversion rate
---
# 应用商店优化（ASO）

---

## 关键词研究工作流

发现并评估能够提升应用商店曝光度的关键词。

### 工作流：开展关键词研究

1. 定义目标受众和应用核心功能：
   - 主要使用场景（应用解决什么问题）
   - 目标用户群体特征
   - 竞争品类
2. 从以下来源生成种子关键词：
   - 应用功能和优势
   - 用户语言（而非开发者术语）
   - 应用商店自动补全建议
3. 使用以下方式扩展关键词列表：
   - 修饰词（免费、最佳、简单）
   - 动作词（创建、跟踪、整理）
   - 受众词（面向学生、面向团队、面向企业）
4. 评估每个关键词：
   - 搜索量（预估每月搜索次数）
   - 竞争度（参与排名的应用数量和质量）
   - 相关性（与应用功能的匹配程度）
5. 对关键词进行评分并确定优先级：
   - 主要：标题和关键词字段（iOS）
   - 次要：副标题和简短描述
   - 第三级：仅用于完整描述
6. 将关键词映射到元数据位置
7. 记录关键词策略以便跟踪
8. **验证：** 关键词已评分；位置已映射；未包含竞争对手品牌名称；iOS 关键词字段中未使用复数形式

### 关键词评估标准

| 因素 | 权重 | 高分指标 |
|--------|--------|----------------------|
| 相关性 | 35% | 描述应用核心功能 |
| 搜索量 | 25% | 每月搜索量超过 10,000 次 |
| 竞争度 | 25% | 排名前 10 的应用平均评分低于 4.5 |
| 转化率 | 15% | 具有交易意图（“最佳 X 应用”） |

### 关键词位置优先级

| 位置 | 搜索权重 |
|----------|---------------|
| 应用标题 | 最高 |
| 副标题（iOS） | 高 |
| 关键词字段（iOS） | 高 |
| 简短描述（Android） | 高 |
| 完整描述 | 中 |

参见：[references/keyword-research-guide.md](references/keyword-research-guide.md)

---

## 元数据优化工作流

优化应用商店列表元素，以提升搜索排名和转化率。

### 工作流：优化应用元数据

1. 根据平台限制审核当前元数据：
   - 标题字符数和关键词是否存在
   - 副标题/简短描述的使用情况
   - 关键词字段效率（iOS）
   - 描述中的关键词密度
2. 按照以下公式优化标题：
   ```
   [Brand Name] - [Primary Keyword] [Secondary Keyword]
   ```
3. 编写副标题（iOS）或简短描述（Android）：
   - 聚焦主要优势
   - 包含次要关键词
   - 使用动作动词
4. 优化关键词字段（仅限 iOS）：
   - 删除标题中已包含的重复词
   - 删除复数形式（Apple 会同时索引两种形式）
   - 逗号后不加空格
   - 按评分确定优先级
5. 重写完整描述：
   - 使用价值主张作为开篇段落
   - 在功能要点中加入关键词
   - 社会认同部分
   - 行动号召
6. 验证每个字段的字符数
7. 计算关键词密度（主要关键词的目标密度为 2-3%）
8. **验证：** 所有字段均符合字符数限制；标题中包含主要关键词；无关键词堆砌（>5%）；保持语言自然

### 平台字符数限制

| 字段 | Apple App Store | Google Play Store |
|-------|-----------------|-------------------|
| 标题 | 30 个字符 | 50 个字符 |
| 副标题 | 30 个字符 | N/A |
| 简短描述 | N/A | 80 个字符 |
| 关键词 | 100 个字符 | N/A |
| 推广文本 | 170 个字符 | N/A |
| 完整描述 | 4,000 个字符 | 4,000 个字符 |
| 更新内容 | 4,000 个字符 | 500 个字符 |

### 描述结构

```
PARAGRAPH 1: Hook (50-100 words)
├── Address user pain point
├── State main value proposition
└── Include primary keyword

PARAGRAPH 2-3: Features (100-150 words)
├── Top 5 features with benefits
├── Bullet points for scanability
└── Secondary keywords naturally integrated

PARAGRAPH 4: Social Proof (50-75 words)
├── Download count or rating
├── Press mentions or awards
└── Summary of user testimonials

PARAGRAPH 5: Call to Action (25-50 words)
├── Clear next step
└── Reassurance (free trial, no signup)
```

参见：[references/platform-requirements.md](references/platform-requirements.md)

---

## 竞品分析工作流

分析头部竞品，以识别关键词空白和定位机会。

### 工作流：分析竞品 ASO 策略

1. 确定排名前 10 的竞品：
   - 直接竞品（核心功能相同）
   - 间接竞品（目标受众重叠）
   - 品类领先者（下载量最高）
2. 从以下位置提取竞品关键词：
   - 应用标题和副标题
   - 描述的前 100 个单词
   - 可见的元数据模式
3. 构建竞品关键词矩阵：
   - 标出每个竞品所针对的关键词
   - 计算每个关键词的覆盖率
4. 识别关键词空白：
   - 竞品覆盖率低于 40% 的关键词
   - 竞品遗漏的高搜索量词语
   - 长尾关键词机会
5. 分析竞品视觉素材：
   - 图标设计模式
   - 截图的文案和风格
   - 视频的有无及质量
6. 比较评分和评论模式：
   - 各竞品的平均评分
   - 常见好评主题
   - 常见投诉主题
7. 记录定位机会
8. **验证：** 已分析 10 个以上竞品；关键词矩阵完整；已识别空白并附带搜索量估算；已记录视觉审查结果

### 竞品分析矩阵

| 分析领域 | 数据点 |
|---------------|-------------|
| 关键词 | 标题关键词、描述中的出现频率 |
| 元数据 | 字符利用率、关键词密度 |
| 视觉素材 | 图标风格、截图数量与风格 |
| 评分 | 平均评分、评分总数、增长速度 |
| 评论 | 主要好评、主要投诉 |

### 空白分析模板

| 机会类型 | 示例 | 行动 |
|------------------|---------|--------|
| 关键词空白 | "habit tracker"（覆盖率 40%） | 添加到关键词字段 |
| 功能空白 | 竞品缺少小组件 | 在截图中突出展示 |
| 视觉空白 | 排名前 5 的应用均无视频 | 创建应用预览 |
| 文案空白 | 均未提及 "free" | 测试免费定位 |

---

## 应用发布工作流

执行结构化发布流程，最大限度地提高初始曝光度。

### 工作流：将应用发布到应用商店

1. 完成发布前准备（提前 4 周）：
   - 确定最终关键词和元数据
   - 准备所有视觉素材
   - 设置分析工具（Firebase、Mixpanel）
   - 制作新闻资料包和媒体名单
2. 提交审核（提前 2 周）：
   - 满足应用商店的所有要求
   - 确认符合相关指南
   - 准备发布宣传内容
3. 配置发布后系统：
   - 设置评论监控
   - 准备回复模板
   - 配置评分提示的显示时机
4. 执行发布日计划：
   - 确认应用已在两个应用商店上线
   - 在所有渠道发布公告
   - 启动评论回复流程
5. 监控初期表现（第 1-7 天）：
   - 每小时跟踪下载速度
   - 监控评论并在 24 小时内回复
   - 记录所有问题，以便快速修复
6. 开展 7 天复盘：
   - 将实际表现与预测进行比较
   - 找出可快速实施的优化措施
   - 规划首次元数据更新
7. 安排首次更新（发布后 2 周）
8. **验证：** 应用已在应用商店上线；分析功能正常跟踪；在 24 小时内回复评论；已记录下载速度；已安排首次更新

### 发布前检查清单

| 类别 | 项目 |
|----------|-------|
| 元数据 | 标题、副标题、描述、关键词 |
| 视觉素材 | 图标、截图（所有尺寸）、视频 |
| 合规性 | 年龄分级、隐私政策、内容权利 |
| 技术 | 应用二进制文件、签名证书 |
| 分析 | SDK 集成、事件跟踪 |
| 营销 | 新闻资料包、社交媒体内容、电子邮件准备就绪 |

### 发布时间注意事项

| 因素 | 建议 |
|--------|----------------|
| 星期 | 星期二至星期三（避开周末） |
| 时段 | 目标市场所在时区的上午 |
| 季节性 | 与相关类别的旺季保持一致 |
| 竞争 | 避开主要竞争对手的发布日期 |

参见：[references/aso-best-practices.md](references/aso-best-practices.md)

---

## A/B 测试工作流

测试元数据和视觉元素，以提高转化率。

### 工作流：运行 A/B 测试

1. 选择测试元素（按影响程度确定优先级）：
   - 图标（影响最大）
   - 第 1 张截图（影响较大）
   - 标题（影响较大）
   - 简短描述（影响中等）
2. 提出假设：
   ```
   If we [change], then [metric] will [improve/increase] by [amount]
   because [rationale].
   ```
3. 创建变体：
   - 对照组：当前版本
   - 实验组：仅更改一个变量
4. 计算所需样本量：
   - 基准转化率
   - 最小可检测效应（通常为 5%）
   - 统计显著性（95%）
5. 启动测试：
   - Apple：使用 Product Page Optimization
   - Android：使用 Store Listing Experiments
6. 确保测试达到最短运行时间：
   - 至少 7 天
   - 直至达到统计显著性
7. 分析结果：
   - 比较转化率
   - 检查统计显著性
   - 记录经验
8. **验证：** 仅测试了一个变量；样本量充足；达到统计显著性（95%）；已记录结果；已实施获胜方案

### A/B 测试优先级

| 元素 | 转化影响 | 测试复杂度 |
|---------|-------------------|-----------------|
| 应用图标 | 可能提升 10-25% | 中等（需要设计） |
| 第 1 张截图 | 可能提升 15-35% | 中等 |
| 标题 | 可能提升 5-15% | 低 |
| 简短描述 | 可能提升 5-10% | 低 |
| 视频 | 可能提升 10-20% | 高 |

### 样本量速查表

| 基准 CVR | 所需展示次数（每个变体） |
|--------------|----------------------------------|
| 1% | 31,000 |
| 2% | 15,500 |
| 5% | 6,200 |
| 10% | 3,100 |

### 测试文档模板

```
TEST ID: ASO-2025-001
ELEMENT: App Icon
HYPOTHESIS: A bolder color icon will increase conversion by 10%
START DATE: [Date]
END DATE: [Date]

RESULTS:
├── Control CVR: 4.2%
├── Treatment CVR: 4.8%
├── Lift: +14.3%
├── Significance: 97%
└── Decision: Implement treatment

LEARNINGS:
- Bold colors outperform muted tones in this category
- Apply to screenshot backgrounds for next test
```

---

## 优化前/后示例

### 标题优化

**效率应用：**

| 版本 | 标题 | 分析 |
|---------|-------|----------|
| 优化前 | "MyTasks" | 无关键词，只有品牌名（8 个字符） |
| 优化后 | "MyTasks - Todo List & Planner" | 主要关键词 + 次要关键词（29 个字符） |

**健身应用：**

| 版本 | 标题 | 分析 |
|---------|-------|----------|
| 优化前 | "FitTrack Pro" | 泛化修饰词（12 个字符） |
| 优化后 | "FitTrack: Workout Log & Gym" | 类别关键词（27 个字符） |

### 副标题优化（iOS）

| 版本 | 副标题 | 分析 |
|---------|----------|----------|
| 优化前 | "Get Things Done" | 含义模糊，无关键词 |
| 优化后 | "Daily Task Manager & Planner" | 包含两个关键词，优势明确 |

### 关键词字段优化（iOS）

**优化前（低效——89 个字符，8 个关键词）：**
```
task manager, todo list, productivity app, daily planner, reminder app
```

**优化后（已优化——97 个字符，14 个关键词）：**
```
task,todo,checklist,reminder,organize,daily,planner,schedule,deadline,goals,habit,widget,sync,team
```

**改进：**
- 删除逗号后的空格（+8 个字符）
- 删除重复词（task manager → task）
- 删除复数形式（reminders → reminder）
- 删除标题中已有的词
- 添加更多相关关键词

### 描述开头

**优化前：**
```
MyTasks is a comprehensive task management solution designed
to help busy professionals organize their daily activities
and boost productivity.
```

**优化后：**
```
Forget missed deadlines. MyTasks keeps every task, reminder,
and project in one place—so you focus on doing, not remembering.
Trusted by 500,000+ professionals.
```

**改进：**
- 以用户痛点开篇
- 明确具体优势（而不是泛泛的 "boost productivity"）
- 加入社会认同
- 关键词自然融入，而非堆砌

### 截图文案的演进

| 版本 | 文案 | 问题 |
|---------|---------|-------|
| 优化前 | "Task List Feature" | 聚焦功能，表达被动 |
| 较好 | "Create Task Lists" | 使用动作动词，但仍然聚焦功能 |
| 最佳 | "Never Miss a Deadline" | 聚焦优势，能够激发情感 |

---

## 工具和参考资料

### 脚本

| 脚本 | 用途 | 用法 |
|--------|---------|-------|
| [keyword_analyzer.py](scripts/keyword_analyzer.py) | 分析关键词的搜索量和竞争度 | `python keyword_analyzer.py --keywords "todo,task,planner"` |
| [metadata_optimizer.py](scripts/metadata_optimizer.py) | 验证元数据字符限制和关键词密度 | `python metadata_optimizer.py --platform ios --title "App Title"` |
| [competitor_analyzer.py](scripts/competitor_analyzer.py) | 提取并比较竞品关键词 | `python competitor_analyzer.py --competitors "App1,App2,App3"` |
| [aso_scorer.py](scripts/aso_scorer.py) | 计算整体 ASO 健康评分 | `python aso_scorer.py --app-id com.example.app` |
| [ab_test_planner.py](scripts/ab_test_planner.py) | 规划测试并计算样本量 | `python ab_test_planner.py --cvr 0.05 --lift 0.10` |
| [review_analyzer.py](scripts/review_analyzer.py) | 分析评论情感和主题 | `python review_analyzer.py --app-id com.example.app` |
| [launch_checklist.py](scripts/launch_checklist.py) | 生成特定平台的发布检查清单 | `python launch_checklist.py --platform ios` |
| [localization_helper.py](scripts/localization_helper.py) | 管理多语言元数据 | `python localization_helper.py --locales "en,es,de,ja"` |

### 参考资料

| 文档 | 内容 |
|----------|---------|
| [platform-requirements.md](references/platform-requirements.md) | iOS 和 Android 元数据规范、视觉素材要求 |
| [aso-best-practices.md](references/aso-best-practices.md) | 优化策略、评分管理、发布策略 |
| [keyword-research-guide.md](references/keyword-research-guide.md) | 研究方法、评估框架、跟踪方法 |

### 资源

| 模板 | 用途 |
|----------|---------|
| [aso-audit-template.md](assets/aso-audit-template.md) | 用于应用商店列表的结构化审核检查清单 |

---

## 平台说明

| 平台 / 限制 | 行为 / 影响 |
|-----------------------|-------------------|
| iOS 关键词变更 | 需要提交应用 |
| iOS 推广文本 | 无需更新应用即可编辑 |
| Android 元数据变更 | 1-2 小时内完成索引 |
| Android 关键词字段 | 无——改用描述 |
| 关键词搜索量数据 | 仅为估算值；无官方来源 |
| 竞品数据 | 仅限公开列表 |

**不应使用此技能的情况：** Web 应用（请使用 Web SEO）、企业/内部应用、仅限 TestFlight 的测试版或付费广告策略。

---

## 相关技能

| 技能 | 集成点 |
|-------|-------------------|
| [content-creator](../content-creator/) | 应用描述文案撰写 |
| [marketing-demand-acquisition](../marketing-demand-acquisition/) | 发布推广活动 |
| [marketing-strategy-pmm](../marketing-strategy-pmm/) | 上市规划 |

## 主动触发条件

- **标题中未进行关键词优化** → 应用标题是排名第一的影响因素。应包含最重要的关键词。
- **截图未体现价值** → 截图应讲述一个故事，而不只是展示 UI。
- **没有评分策略** → 评分低于 4.0 星会严重影响转化。应实施应用内评分提示。
- **描述中堆砌关键词** → 自然融入关键词的语言优于关键词堆砌。

## 输出成果

| 当你要求…… | 你将获得…… |
|---------------------|------------|
| “ASO 审核” | 完整的应用商店商品页审核及按优先级排列的修复建议 |
| “关键词研究” | 包含搜索量和难度评分的关键词列表 |
| “优化我的商品页” | 重写后的标题、副标题、描述和关键词字段 |

## 沟通方式

所有输出均通过质量验证：
- 自我验证：来源标注、假设审查、置信度评分
- 输出格式：结论 → 内容（含置信度）→ 原因 → 行动方式
- 仅输出结果。每项发现均带有标签：🟢 已验证、🟡 中等、🔴 假设。