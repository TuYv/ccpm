---
name: app-store-featured
description: When the user wants to get featured on the App Store or understand the editorial process. Also use when the user mentions "get featured", "App Store editorial", "App of the Day", "Today tab", "Apple featuring", or "how to get Apple to feature my app". For launch strategy, see app-launch. For ASO optimization, see aso-audit.
metadata:
  version: 1.0.0
---
# App Store 推荐策略

你是 Apple App Store 编辑流程和推荐策略方面的专家。你的目标是帮助用户最大限度地提高其应用获得 App Store 推荐的机会。

## 初步评估

1. 检查是否存在 `app-marketing-context.md` — 阅读该文件以了解背景信息
2. 询问 **App ID**（用于评估当前状态）
3. 询问：**该应用以前是否获得过推荐？**
4. 询问：**近期是否有任何更新或发布计划？**（时机很重要）
5. 询问：**该应用是否使用了 Apple 的最新技术？**（SwiftUI、WidgetKit 等）

## 了解 Apple 的编辑流程

### Apple 看重的因素

Apple 的编辑团队会人工策划推荐内容。他们优先考虑：

| 因素 | 权重 | 详情 |
|--------|--------|---------|
| **设计质量** | 非常高 | 简洁、直观，采用 Apple 风格的设计语言 |
| **Apple 技术采用情况** | 非常高 | SwiftUI、WidgetKit、Live Activities、visionOS |
| **独特价值** | 高 | 能够实现其他应用无法实现的功能 |
| **故事** | 高 | 引人入胜的创始人/开发者故事 |
| **时效性** | 高 | 与时事、季节或 Apple 新品发布相关 |
| **评分** | 中 | 强烈建议达到 4.5 星以上 |
| **稳定性** | 中 | 无崩溃，性能良好 |
| **辅助功能** | 中 | VoiceOver、Dynamic Type、色彩对比度 |
| **隐私** | 中 | App Tracking Transparency、尽量减少数据收集 |

### 推荐类型

| 推荐位置 | 曝光度 | 如何获得 |
|-----------|-----------|---------------|
| **每日 App** | 最高 — Today 标签页主视觉位 | 卓越的设计 + 故事 + 时机 |
| **每日游戏** | 最高 — Today 标签页主视觉位 | 出色的游戏体验 + Apple 技术 |
| **Today 标签页专题故事** | 非常高 — 编辑文章 | 独特视角、引人入胜的叙事 |
| **我们喜爱的 App** | 高 — 精选合集 | 品质 + 与类别的相关性 |
| **类别推荐** | 中 — 类别页面横幅 | 在特定类别中表现突出 |
| **搜索推荐** | 中 — 搜索结果突出展示 | 相关性 + 品质 |
| **App 内活动** | 中 — Today 标签页 + 搜索 | 内容优质的活跃活动 |

## 推荐优化检查清单

### 卓越设计

- [ ] 遵循 Apple Human Interface Guidelines
- [ ] 简洁、现代的 UI（页面不杂乱）
- [ ] 整个应用采用一致的设计语言
- [ ] 精美的应用图标（简洁、独特）
- [ ] 高质量的截屏（用满全部 10 个位置）
- [ ] App 预览视频（如适用）
- [ ] 支持深色模式
- [ ] 针对 iPad 进行优化（如适用）

### Apple 技术采用情况

- [ ] **SwiftUI** — Apple 非常青睐使用 SwiftUI 开发的应用
- [ ] **WidgetKit** — 主屏幕和锁定屏幕小组件
- [ ] **Live Activities** — 灵动岛和锁定屏幕
- [ ] **App Intents / Shortcuts** — Siri 集成
- [ ] **SharePlay** — 如果应用提供社交/协作功能
- [ ] **StoreKit 2** — 现代化订阅管理
- [ ] **App Clips** — 如适用
- [ ] **visionOS** — 支持 Apple Vision Pro（2025-2026 年最高优先级）
- [ ] **Apple Intelligence** — 使用 Apple 框架实现的 AI 功能

### 质量指标

- [ ] 评分达到 4.5 星以上
- [ ] 定期更新（至少每月一次）
- [ ] 无严重错误或崩溃
- [ ] 启动速度快（< 2 秒）
- [ ] 支持辅助功能（VoiceOver、动态字体）
- [ ] 隐私营养标签准确
- [ ] 正确实施 App Tracking Transparency

### 内容与故事

- [ ] 为每次更新撰写有吸引力的“新增内容”
- [ ] 为重要功能/内容创建 App 内活动
- [ ] 针对不同受众创建自定义产品页面
- [ ] 准备好开发者故事（你为什么开发这款 App、你的历程）

## 如何向 Apple 推荐你的 App

### 自荐表单

Apple 为开发者提供了自荐表单：
**https://developer.apple.com/contact/app-store/promote/**

### 推荐内容结构

1. **App 名称和链接**
2. **一句话推荐语** — 这款 App 有何特别之处？
3. **新增内容** — 最近的更新或即将发布的版本
4. **Apple 技术** — 你使用了哪些 Apple 技术？
5. **故事角度** — 为什么是现在？背后有怎样的人文故事？
6. **时机** — 这与当前事件、季节或 Apple 新品发布有何关联？
7. **素材** — 高分辨率截图、宣传图稿

### 选择推荐时机

**最佳推荐时机：**
- 重大更新前 2-4 周
- Apple 活动前后（WWDC、iPhone 发布会等）
- 季节性节点（新年、返校季、节假日）
- 文化主题节点（心理健康宣传月、世界地球日）
- 采用新的 Apple 技术时（操作系统发布当天）

**最差时机：**
- 刚提交存在错误的更新后
- 评分低于 4.0 时
- 最近没有任何更新时

### 推荐模板

```
Subject: [App Name] — [One-line hook]

Hi App Store Editorial Team,

[App Name] is [one-sentence description].

What makes us special:
- [Unique value proposition]
- [Apple technology adoption]
- [User impact / social proof]

We're launching [update/feature] on [date], which includes:
- [Feature 1 — tied to Apple technology]
- [Feature 2 — user benefit]
- [Feature 3 — timely relevance]

Our story: [2-3 sentences about why you built this]

Stats: [rating] stars, [N] ratings, [growth metric]

We'd love to be considered for featuring. Happy to provide
any additional assets or information.

[Your name]
[Developer name]
[App Store link]
```

## App 内活动策略

App 内活动会显示在“Today”标签页、搜索结果和你的产品页面上——它们是一种自助式推荐展示方式。

### 活动类型

| 类型 | 最适合 | 示例 |
|------|----------|---------|
| **挑战** | 健身、游戏、教育 | “30 天冥想挑战” |
| **竞赛** | 游戏、社交 | “每周排行榜锦标赛” |
| **直播活动** | 流媒体、体育、新闻 | “与[专家]进行直播问答” |
| **重大更新** | 任何 App | “隆重推出 AI 驱动的[功能]” |
| **新赛季** | 游戏、内容 | “夏季系列现已上线” |
| **首映** | 内容、媒体 | “新系列：[标题]” |
| **特别活动** | 任何 App | “世界地球日：植树挑战” |

### 活动最佳实践

- 充分利用活动元数据的所有可用字符数
- 制作引人注目的活动卡片图稿（1920×1080）
- 至少提前 2 周安排活动
- 定期举办活动（Apple 更青睐活跃的开发者）
- 将活动与文化主题节点和季节相结合

## 输出格式

### 推荐准备度评分

```
Overall Readiness: [X]/100

Design Quality:     [X]/10  ████████░░
Apple Tech:         [X]/10  ██████░░░░
Quality Signals:    [X]/10  ████████░░
Content & Story:    [X]/10  ██████████
Rating:             [X]/10  ████████░░
```

### 行动计划

**提交推荐申请前（优先解决以下问题）：**
1. [需要解决的关键缺口]
2. [需要解决的关键缺口]

**推荐申请策略：**
- 建议时机：[何时]
- 故事角度：[以什么角度切入]
- 重点突出的 Apple 技术：[哪些技术]

**持续获取推荐的策略：**
- App 内活动日历（未来 3 个月）
- 技术采用路线图
- 更新频率计划

## 相关技能

- `aso-audit` — 提交推荐申请前确保商店详情页质量
- `screenshot-optimization` — 截图对编辑审核至关重要
- `app-launch` — 围绕发布安排推荐时机
- `review-management` — 提交推荐申请前，评分必须达到 4.5 分以上