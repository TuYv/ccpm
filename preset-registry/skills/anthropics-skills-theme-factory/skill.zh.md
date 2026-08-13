---
name: theme-factory
description: Toolkit for styling artifacts with a theme. These artifacts can be slides, docs, reportings, HTML landing pages, etc. There are 10 pre-set themes with colors/fonts that you can apply to any artifact that has been creating, or can generate a new theme on-the-fly.
license: Complete terms in LICENSE.txt
---
# 主题工厂技能

该技能提供一组精选的专业字体与颜色主题，每个主题都包含经过精心挑选的调色板和字体组合。一旦选择主题，即可应用于任何作品。

## 目的

为演示文稿幻灯片应用一致且专业的样式，请使用此技能。每个主题包括：
- 统一的颜色调色板，并带有十六进制代码
- 标题与正文文本的互补字体搭配
- 适用于不同场景与受众的独特视觉识别

## 使用说明

将样式应用于幻灯片或其他作品的步骤：

1. **展示主题画廊**：显示 `theme-showcase.pdf` 文件，让用户可视化查看所有可用主题。不要对其进行任何修改；仅用于展示查看。
2. **征求选择**：询问要将哪个主题应用到该文稿
3. **等待选择**：获取对所选主题的明确确认
4. **应用主题**：一旦选择主题，即将所选主题的颜色和字体应用到文稿/作品

## 可用主题

以下 10 个主题可用，并均在 `theme-showcase.pdf` 中展示：

1. **Ocean Depths** - 专业且平静的海洋风格主题
2. **Sunset Boulevard** - 温暖而充满活力的日落色彩
3. **Forest Canopy** - 自然且扎实的大地色调
4. **Modern Minimalist** - 清晰现代的灰度风格
5. **Golden Hour** - 丰富而温暖的秋季色盘
6. **Arctic Frost** - 冷静清晰的冬季灵感主题
7. **Desert Rose** - 柔和且精致的尘色调
8. **Tech Innovation** - 大胆现代的科技美学
9. **Botanical Garden** - 清新有机的花园色彩
10. **Midnight Galaxy** - 戏剧性且宇宙感十足的深色调

## 主题详情

每个主题在 `themes/` 目录中定义，包含完整规范：
- 统一的颜色调色板及十六进制代码
- 标题与正文文本的互补字体搭配
- 适用于不同场景与受众的独特视觉识别

## 应用流程

在确定偏好主题后：
1. 从 `themes/` 目录读取对应的主题文件
2. 在整套幻灯片中一致应用指定的颜色和字体
3. 确保对比度和可读性合适
4. 在所有幻灯片中保持主题的视觉识别度

## 创建你自己的主题
当现有主题都不适用于某件作品时，请创建自定义主题。根据提供的输入，生成一个与上述主题相似的新主题。为该主题取一个类似的名称，用以描述该字体/颜色组合的含义。使用任何已提供的基本描述来选择合适的颜色和字体。生成主题后，先供用户审核与验证。随后，按上述方式应用该主题。
