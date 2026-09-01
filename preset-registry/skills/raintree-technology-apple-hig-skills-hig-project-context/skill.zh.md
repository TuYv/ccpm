---
name: hig-project-context
version: 1.0.0
description: >-
  Create or update a shared Apple design context document that other HIG skills
  use to tailor guidance. Use when the user says "set up my project context,"
  "what platforms am I targeting," "configure HIG settings," or when starting a
  new Apple platform project. Also activates when other HIG skills need project
  context but none exists yet. This skill creates .claude/apple-design-context.md
  so that hig-foundations, hig-platforms, hig-components-*, hig-inputs, and
  hig-technologies can provide targeted advice without repetitive questions.
---
# Apple HIG：项目上下文

创建并维护 `.claude/apple-design-context.md`，以便其他 HIG 技能跳过重复提问。

在提问前检查 `.claude/apple-design-context.md`。使用现有上下文，只询问其中尚未涵盖的信息。

## 收集上下文

提问前，先从以下内容中自动发现上下文：

1. **README.md** -- 产品描述、目标平台
2. **Package.swift / .xcodeproj** -- 支持的平台、最低 OS 版本、依赖项
3. **Info.plist** -- App 类别、所需功能、支持的屏幕方向
4. **现有代码** -- Import 语句可揭示所使用的框架（SwiftUI 与 UIKit、HealthKit 等）
5. **Assets.xcassets** -- 颜色资源、图标集、深色模式变体
6. **可访问性审查** -- 搜索 accessibility 修饰符/属性

展示发现结果，并请用户确认或更正。然后收集仍然缺失的信息：

### 1. 产品概览
- App 的功能是什么？（一句话）
- 类别（生产力、社交、健康、游戏、工具等）
- 阶段（概念、开发中、已发布、重新设计）

### 2. 目标平台
- 支持哪些 Apple 平台？（iOS、iPadOS、macOS、tvOS、watchOS、visionOS）
- 最低 OS 版本
- 通用版本还是针对特定平台？

### 3. 技术栈
- UI 框架：SwiftUI、UIKit、AppKit，还是混合使用？
- 架构：单窗口、多窗口，还是基于文档？
- 使用了哪些 Apple 技术？（HealthKit、CloudKit、ARKit 等）

### 4. 设计系统
- 使用系统默认样式还是自定义设计系统？
- 品牌颜色、字体、图标风格？
- 深色模式和 Dynamic Type 的支持状态

### 5. 可访问性要求
- 目标级别（基线、增强、全面）
- 特定注意事项（VoiceOver、Switch Control 等）
- 监管要求（WCAG、Section 508）

### 6. 用户上下文
- 主要用户画像（1-3 个）
- 关键使用场景和环境（办公桌、移动途中、即时查看、沉浸式）
- 已知痛点或设计挑战

### 7. 现有设计资源
- Figma/Sketch 文件？
- 是否使用 Apple Design Resources？
- 现有组件库？

## 上下文文档模板

使用以下结构生成 `.claude/apple-design-context.md`：

```markdown
# Apple Design Context

## Product
- **Name**: [App name]
- **Description**: [One sentence]
- **Category**: [Category]
- **Stage**: [Concept / Development / Shipped / Redesign]

## Platforms
| Platform | Supported | Min OS | Notes |
|----------|-----------|--------|-------|
| iOS      | Yes/No    |        |       |
| iPadOS   | Yes/No    |        |       |
| macOS    | Yes/No    |        |       |
| tvOS     | Yes/No    |        |       |
| watchOS  | Yes/No    |        |       |
| visionOS | Yes/No    |        |       |

## Technology
- **UI Framework**: [SwiftUI / UIKit / AppKit / Mixed]
- **Architecture**: [Single-window / Multi-window / Document-based]
- **Apple Technologies**: [List any: HealthKit, CloudKit, ARKit, etc.]

## Design System
- **Base**: [System defaults / Custom design system]
- **Brand Colors**: [List or reference]
- **Typography**: [System fonts / Custom fonts]
- **Dark Mode**: [Supported / Not yet / N/A]
- **Dynamic Type**: [Supported / Not yet / N/A]

## Accessibility
- **Target Level**: [Baseline / Enhanced / Comprehensive]
- **Key Considerations**: [List any specific needs]

## Users
- **Primary Persona**: [Description]
- **Key Use Cases**: [List]
- **Known Challenges**: [List]
```

## 更新上下文

更新现有上下文文档时：

1. 阅读当前的 `.claude/apple-design-context.md`
2. 询问发生了哪些变化
3. 仅更新发生变化的部分
4. 保留所有未发生变化的信息

## 相关技能

- **hig-platforms** -- 平台特定指南
- **hig-foundations** -- 颜色、排版、布局决策
- **hig-patterns** -- UX 模式建议
- **hig-components-*** -- 组件建议
- **hig-inputs** -- 输入方式覆盖
- **hig-technologies** -- Apple 技术相关性

---

*由 [Raintree Technology](https://raintree.technology) 构建 · [更多开发者工具](https://raintree.technology)*