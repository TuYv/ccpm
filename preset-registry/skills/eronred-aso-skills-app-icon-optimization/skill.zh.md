---
name: app-icon-optimization
description: When the user wants to design, test, or improve their app icon to increase tap-through rate and conversions in App Store search and browse. Use when the user mentions "app icon", "icon design", "icon A/B test", "icon variants", "tap-through rate", "icon conversion", "icon refresh", or wants to know what makes a good app icon. For screenshot optimization, see screenshot-optimization. For full listing A/B tests, see ab-test-store-listing.
metadata:
  version: 1.0.0
---
# App 图标优化

你帮助设计、审核和 A/B 测试 App 图标，以最大化点击率（TTR）——即用户在搜索结果或浏览页面中看到你的 App 后进行点击的百分比。

## 为什么图标是影响最大的素材

图标是用户在搜索结果中**最先看到的内容**——早于标题、评分或截图。一个富有吸引力的图标无需进行其他更改，就能将 TTR 提升 20–40%。在浏览页面或排行榜中，它往往是唯一用于吸引注意力的视觉元素。

## 图标设计原则

### 1. 在小尺寸下保持简洁

图标在 iPhone 搜索结果中以 60×60pt 的尺寸显示。在这一尺寸下，细节会消失。

- 最多包含 2 个元素
- 不使用文字（在小尺寸下难以辨认；Apple 也不鼓励这样做）
- 轮廓鲜明，一眼即可识别
- 定稿前以 60×60px 的尺寸进行测试

### 2. 与 App Store 背景形成色彩对比

App Store 在浅色模式下使用白色/浅色背景，在深色模式下使用深色背景。

- 在两种模式下都保持高对比度
- 避免使用白色图标——它们在浅色模式下会消失
- 避免使用过深的图标——它们在深色模式下会消失
- 考虑在图标背景上添加细微的阴影或边框

### 3. 品类视觉语言

既要遵循品类规范，也要体现差异：

| 品类 | 常见模式 | 如何脱颖而出 |
|----------|----------------|-----------------|
| 效率工具 | 蓝色、整洁、简约 | 更温暖的色彩、更醒目的标志 |
| 健康/健身 | 绿色、橙色、充满活力 | 高端深色、精致成熟 |
| 金融 | 蓝色、绿色、保守稳重 | 大胆、独特的标志 |
| 游戏 | 鲜艳、角色、动作感 | 如果竞品风格喧闹，则采用高端/深色风格 |
| 社交 | 圆润形状、柔和色彩 | 如果信息流风格柔和，则采用锐利、独特的设计 |
| 冥想 | 紫色、蓝色、平静 | 使用出人意料的对比色 |
| 照片/视频 | 渐变、相机 | 使用单一且强有力的标志 |

**规则：**查看排名前 20 的竞品图标，然后设计出能够立刻与它们区分开来的图标。

### 4. 易于识别的标志

图标需要一个单一且令人难忘的标志——而不是一个场景或一组构图。请思考：

> “能否用 3 个词描述这个图标？”

- ✅ “红色对话气泡” | ❌ “一个人在渐变背景中使用手机”
- ✅ “醒目的橙色火焰” | ❌ “抽象的彩色形状”

### 5. 品牌一致性

图标是你的品牌在 App Store 中的标志。它应该：
- 与 App 的主色调一致
- 与启动画面、推送通知和营销素材保持一致
- 能够用作网站图标、社交媒体头像和媒体资料包素材

## 所需的图标尺寸

| 平台 | 尺寸 |
|----------|------|
| iPhone（App Store） | 1024×1024px（主图） |
| iPhone（主屏幕） | 60×60pt @1x, @2x, @3x |
| iPad | 76×76pt @1x, @2x |
| Watch | 40×40pt – 44×44pt |
| Android 自适应图标 | 108×108dp（安全区域为 66×66dp） |

提交单个 1024×1024px PNG 文件（无透明度、无圆角——Apple 会应用遮罩）。

## A/B 测试图标

### iOS — 产品页面优化

1. App Store Connect → 你的 App → 产品页面优化 → 创建测试
2. 最多创建 3 个图标变体
3. 设置流量分配比例（每个变体 20–33%）
4. 至少运行 7 天，或直至达到统计显著性

**访问路径：** App Store Connect → App Store → Product Page Optimization

### Android — Play Store 实验

1. Play Console → Store listing experiments → New experiment
2. 最多上传 3 个图标变体
3. 设置流量分配比例
4. Google 会报告每个变体的安装转化率

### 测试内容

每次只测试一个变量：

| 测试项 | 变体 |
|------|---------|
| 配色方案 | 使用相同标志，搭配 3 种不同的背景颜色 |
| 标志风格 | 扁平风格 vs 插画风格 vs 3D 风格 |
| 深色 vs 浅色 | 深色背景 vs 浅色背景 |
| 角色形象 vs 抽象图形 | 基于角色形象 vs 几何/抽象图形 |
| 有文字 vs 无文字 | 仅标志 vs 标志 + 简短文字 |

### 解读结果

- **主要指标：** 安装转化率（展示 → 安装）
- **最低样本量：** 每个变体 1,000 次以上展示，才能获得可靠信号
- **显著性阈值：** p < 0.05，或参考 Appeeky/Play Console 的置信度指标

## 图标审核

根据以下标准评估当前图标：

```
Clarity at 60×60px:        [1–10]
  - Recognizable mark at small size?
  - No illegible text?

Color contrast:            [1–10]
  - Works on white (light mode)?
  - Works on dark backgrounds (dark mode)?

Category differentiation:  [1–10]
  - Stands out from top 10 competitor icons?

Simplicity:                [1–10]
  - Max 2 elements?
  - Describable in 3 words?

Brand alignment:           [1–10]
  - Consistent with app's visual identity?

Overall: [N]/50
```

## 提供给图标设计师的需求简报

向设计师说明需求时：

```
App: [name and one-line description]
Category: [category]
Primary audience: [who uses it]
Brand colors: [hex values]
Mood/feeling: [premium / playful / trustworthy / energetic / calm]

What the icon should convey: [core value or identity]
What to avoid: [don't replicate competitor X, avoid Y]

Competitors to differentiate from: [list 3–5 with icons]
Reference icons I like: [list 3–5 from other apps]

Deliverables:
- 3 distinct concepts at 1024×1024px
- Each concept tested at 60×60px mockup in App Store search context
- Final: PNG, no alpha, no rounded corners
```

## 相关技能

- `ab-test-store-listing` — 完整的 A/B 测试方法
- `screenshot-optimization` — 使用有吸引力的截图与图标相辅相成
- `android-aso` — Android 自适应图标要求
- `aso-audit` — 图标是完整 ASO 评分中的一个因素