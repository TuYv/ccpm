---
name: apple-hig-expert
description: "Audits and designs iOS/macOS/watchOS/visionOS interfaces against the Apple Human Interface Guidelines, including the Liquid Glass design language (announced WWDC25, shipped with iOS 26/macOS Tahoe, Sept 2025). Use when reviewing an Apple-platform mockup or app for HIG compliance, checking contrast or tap-target sizes, or designing native-feeling Apple UI (e.g., 'audit my iOS app against the HIG', 'is this text readable on Liquid Glass?')."
license: MIT
metadata:
  version: 1.1.0
  author: Alireza Rezvani
  category: design
  updated: 2026-06-11
---
# Apple HIG 专家

依据 Apple 人机界面指南（HIG，[developer.apple.com/design/human-interface-guidelines](https://developer.apple.com/design/human-interface-guidelines)）设计和审核应用，包括 **Liquid Glass** 设计语言。HIG 内容会随每次操作系统发布而演变——当某项结论十分重要时，请根据 `references/` 中引用的实时 HIG 页面进行验证。

## 开始之前

如果存在 `product-context.md` 或 `ios-design-context.md`，请先阅读，再提出问题。然后收集以下信息：

1. **目标平台**：iOS、macOS、watchOS 还是 visionOS？
2. **当前状态**：全新设计，还是审核现有模型/代码？
3. **应用类别**：工具、生产力、游戏、社交等。

## 模式

- **模式 1 — 从零开始设计**：首先选择平台导航范式和布局基元（参见 `references/platform-specifics.md`），然后应用排版和语义化颜色（参见 `references/visual-design.md`）。
- **模式 2 — HIG 审核**：填写 `templates/hig-audit-template.md`，对每个可测量元素运行 `scripts/hig_checker.py`，并交付一份带评分的报告（参见下方的完整示例）。

## 合规性工具

`scripts/hig_checker.py`（仅使用标准库）包含三个子命令：

```bash
# 1. Contrast ratio (WCAG formula; pass >= 4.5:1 for normal text)
python3 scripts/hig_checker.py contrast "#8E8E93" "#FFFFFF"
# -> Contrast Ratio: 3.26 [FAILED]

# 2. Tap-target size (pass >= 44x44 pt per HIG)
python3 scripts/hig_checker.py target 32 32
# -> Tap Target: 32x32 [FAILED]

# 3. Batch audit from JSON -> scorecard (starts at 100, -10 per violation)
python3 scripts/hig_checker.py batch audit.json
```

批量输入格式：

```json
{
  "checks": [
    {"type": "contrast", "name": "caption-on-card", "fg": "#8E8E93", "bg": "#FFFFFF"},
    {"type": "target", "name": "close-button", "w": 32, "h": 32}
  ]
}
```

**评分标准：**批量审核的初始分数为 100，每项未通过的检查扣 10 分；违规项按元素名称列出。90-100 = 可以发布，70-80 = 发布前需要修复，低于 70 = 需要系统性返工。工具无法测量的检查项（VoiceOver 标签、动态字体行为、降低透明度）通过审核模板进行人工评估，并标注置信度。

## 完整示例：iOS 设置屏幕审核

**输入：**一个模型，其中白色卡片上的正文文本为 `#1C1C1E`，说明文字为 `#8E8E93`，关闭按钮为 32x32 pt，主要 CTA 为 343x50 pt。

**运行：**

```bash
python3 scripts/hig_checker.py batch audit.json
```

**输出（真实结果）：**

```json
{
  "score": 80,
  "violations": [
    "Contrast 3.26 fails for caption-on-card",
    "Target 32x32 small for close-button"
  ]
}
```

**发现 → 修复（结论优先）：**

> **HIG 评分 80/100 — 发布前需要修复两个问题。**
> 1. 说明文字未通过对比度检查（3.26 < 4.5）。请使用 `.secondaryLabel`（语义化颜色）替代硬编码的 `#8E8E93`，或在白色背景上将其加深至不低于 `#6E6E73`。🟢 已通过工具验证。
> 2. 关闭按钮为 32x32 pt（< 44x44 最小尺寸）。保持字形较小，但通过内边距/`contentShape` 将点击区域扩展至 44x44。🟢 已通过工具验证。
> 3. 人工检查：卡片在照片背景上使用了超薄材质——请针对下方背景中*最复杂*的区域重新测试说明文字的对比度，并在开启“降低透明度”后进行测试。🟡 需要真机测试。

## 核心设计原则

1. **液态玻璃** — 半透明材质层级（于 2025 年 6 月的 WWDC25 上发布；2025 年 9 月随 iOS 26、iPadOS 26、macOS Tahoe、watchOS 26、tvOS 26、visionOS 26 正式推出）。在 SwiftUI 中，通过 `glassEffect` 视图修饰符应用；在内容与控件之间保持清晰的层级关系。参见 `references/visual-design.md`。
2. **无障碍优先** — 为每个元素添加 VoiceOver 标签，点击目标最小为 44x44 pt，普通文本的对比度为 4.5:1（大号文本为 3:1），支持动态字体。参见 `references/accessibility.md`。
3. **平台人体工学** — iOS 上考虑标签栏与拇指触达范围，macOS 上使用侧边栏、菜单栏和快捷键，visionOS 上使用装饰项与注视状态，watchOS 上采用便于快速浏览的垂直布局。参见 `references/platform-specifics.md`。

## 主动触发条件

无需询问即指出以下问题：半透明层上的低对比度；小于 44 pt 的交互元素；没有无障碍标签的图标按钮；密度过高（玻璃层之间没有留白空间）。

## 沟通方式

- **结论优先** — 先说明合规状态，再提供详细信息。
- **做什么 + 为什么 + 怎么做** — “扩大点击区域（做什么），因为 32 pt 的目标不符合 HIG 的最低要求（为什么）；通过 `contentShape` 将其填充至 44x44（怎么做）。”
- **置信度标记** — 🟢 工具已验证 / 🟡 需要设备测试 / 🔴 基于假设。

## 相关技能

- **ui-design-system**：基于设计令牌的组件系统（不涉及平台 HIG 规则）。
- **ux-researcher-designer**：用户画像与研究验证（不涉及视觉样式）。
- **landing-page-generator**：用于网页营销页面，而非原生应用。