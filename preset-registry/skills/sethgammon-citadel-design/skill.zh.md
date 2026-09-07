---
name: design
license: MIT
description: >-
  Generates and maintains a design manifest for visual consistency. In existing
  projects, reads current styles and documents the design language. In new
  projects, asks a few questions and generates a starter manifest. The post-edit
  hook reads the manifest and flags deviations.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - design
  - style guide
  - design manifest
  - visual consistency
effort: medium
---
# /design — 设计清单生成器

## 何时使用

- 在新项目启动时（根据偏好生成初始清单）
- 在已有清单的现有项目上（从现有代码中提取模式）
- 当注意到视觉不一致时（“为什么我们有 4 种不同的按钮样式？”）
- 当 /do 路由到 "design"、"style guide"、"visual consistency"、"design manifest" 时

## 协议

### 步骤 1：检测模式

检查是否存在既有样式：查找 `tailwind.config.*`、全局 CSS 文件或包含样式模式的组件文件。如果存在其中任何一种，使用提取模式。如果都不存在，或用户说“新项目”，使用生成模式。

### 步骤 2：收集输入

**提取模式**：阅读样式来源（tailwind 配置、全局 CSS、组件文件）。将发现的结果呈现给用户，并在写入前确认。

**生成模式**：最多提出 4 个问题，涵盖感觉、颜色模式、品牌色和布局密度。对任何未指定的事项使用合理的默认值。

### 步骤 3：写入清单

按照下文定义的模板写入 `.planning/design-manifest.md`。每个部分必须包含真实值——不允许使用占位符。

### 步骤 4：确认

向用户呈现清单摘要：“这是你的设计清单。它将被 post-edit 钩子用于标记偏差。有什么要修改的吗？”

## 模式

### 提取模式（现有项目已有样式）

1. 读取 `tailwind.config.*` —— 提取颜色、间距、字体、断点
2. 读取全局 CSS 文件 —— 提取 CSS 变量、基础样式
3. 扫描 5-10 个组件文件 —— 使用 3 次以上的值成为调色板、间距比例、字号比例、形状语言和层级（elevation）比例；同时记录组件模式（卡片、按钮、输入框）
4. 呈现发现结果：“这些是我发现的内容。看起来对吗？”
5. 用户确认后写入清单

### 生成模式（新项目或没有现有样式）

最多提出 4 个问题：感觉（极简/活泼/商务/大胆）、颜色模式（深色/浅色/两者皆可）、品牌色（hex 值或“帮我选”）、布局密度。对任何未指定的事项使用合理的默认值。

## 清单

写入 `.planning/design-manifest.md`：

```markdown
# Design Manifest

> Generated: {date}
> Mode: {extracted | generated}
> Source: {tailwind.config.ts, globals.css, etc. | user preferences}

## Colors

### Primary Palette
- primary: {hex} — {usage: buttons, links, accents}
- primary-hover: {hex}
- primary-muted: {hex}

### Neutral Palette
- background: {hex}
- surface: {hex} — {cards, modals, elevated elements}
- border: {hex}
- text-primary: {hex}
- text-secondary: {hex}
- text-muted: {hex}

### Semantic
- success: {hex}
- warning: {hex}
- error: {hex}
- info: {hex}

## Typography

- font-family: {value}
- heading-font: {value, or "same as body"}
- Type scale: {xs, sm, base, lg, xl, 2xl, 3xl — with px/rem values}
- Line heights: {tight, normal, relaxed — with values}
- Font weights used: {list}

## Spacing

- Base unit: {4px / 0.25rem}
- Scale: {1, 2, 3, 4, 6, 8, 12, 16, 24 — in base units}
- Component padding: {standard value}
- Section gap: {standard value}
- Page margin: {standard value}

## Shape

- Border radius: {none, sm, md, lg, full — with values}
- Default radius: {which one is used most}
- Shadow scale: {sm, md, lg — with values}

## Layout

- Max content width: {value}
- Breakpoints: {sm, md, lg, xl — with values}
- Grid/flex preference: {which is used more}
- Spacing rhythm: {consistent gaps between sections}

## Component Patterns

{Only populated in extract mode or after the project has components}
- Button: {padding, radius, font-weight, transition}
- Card: {padding, radius, shadow, border}
- Input: {padding, radius, border-color, focus-ring}

## Anti-Patterns (things to flag)

- Colors not in the palette above
- Font sizes not in the type scale
- Spacing values not in the spacing scale
- Border radius values not matching the shape section
- Hardcoded colors instead of CSS variables or Tailwind classes
```

## 钩子集成

post-edit.js 会检查 `.planning/design-manifest.md` 是否存在。当某个 CSS/TSX/JSX/Tailwind 文件被编辑时，它会扫描以下问题：不在调色板中的硬编码 hex 颜色、超出字号比例的字体大小、超出比例的间距值，以及与形状部分不一致的圆角值。仅发出警告——不阻断。每次编辑中每个类别最多一条警告。

钩子规则：如果不存在清单则完全跳过；只扫描被编辑的文件；每个会话只缓存一次清单；不标记映射到配置的 Tailwind 工具类；只标记原始的 hex/px 值。

## 情境闸门

**披露**：“正在更新设计清单。现有清单将被修改。”
**可逆性：**amber —— 会修改 `.planning/design-manifest.md`；可使用 `git checkout .planning/design-manifest.md` 撤销。
**信任闸门：**
- 任意级别：生成或更新设计清单。
- 熟悉级别（5 个以上会话）：可进行丢弃现有内容的完整清单重写。

## 质量闸门

- 清单的每个部分都包含真实值（而非占位符）
- 提取模式会注明值来自哪些文件
- 生成模式的默认值是合理的（而非随机的）
- 反模式部分基于清单值进行填充

## 边缘情况

**没有样式也没有偏好：**默认使用生成模式；使用合理的默认值（极简、浅色模式、中性调色板）；写入前先呈现。

**有 Tailwind 配置但没有自定义主题：**提取可用的值（字体、断点）；注明哪些部分使用 Tailwind 默认值；其余部分则生成。

**`.planning/` 不存在：**创建该目录；如无法创建，则内联输出清单内容并指示用户自行保存。

**“更新清单”**：重新运行提取模式，与现有清单进行 diff，只呈现发生变化的部分。

## 退出协议

```
---HANDOFF---
- Design manifest: .planning/design-manifest.md
- Mode: {extracted | generated}
- Sources: {files read, or "user preferences"}
- Anti-patterns documented: {count}
- Next: Post-edit hook will flag deviations automatically
- Reversibility: amber — undo with `git checkout .planning/design-manifest.md`
---
```
