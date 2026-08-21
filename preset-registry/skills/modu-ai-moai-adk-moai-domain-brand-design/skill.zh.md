---
name: moai-domain-brand-design
description: >
  Brand-aligned visual design system specialist for web projects. Enforces
  hero-first layout chaining, WCAG 2.1 AA accessibility, Lighthouse >= 80,
  and design token extraction from brand identity files. Covers color palettes,
  typography, spacing, and component specifications.
license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Write, Edit, Grep, Glob
user-invocable: false
metadata:
  version: "1.0.0"
  category: "domain"
  status: "active"
  updated: "2026-04-20"
  tags: "design, brand, visual-identity, design-tokens, wcag, typography, color-palette, hero-section"
  related-skills: "moai-domain-copywriting, moai-workflow-gan-loop, moai-domain-uiux"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 5000

# MoAI Extension: Triggers
triggers:
  keywords: ["design-tokens", "color-palette", "typography", "hero-section", "wcag", "visual-identity", "design system", "brand design", "spacing system", "component spec"]
  agents: ["expert-frontend"]
  phases: ["run"]
---
# moai-domain-brand-design

面向品牌一致性 Web 项目的视觉设计系统技能。吸收自 agency-design-system (v1.0.0)。强制执行以首屏为起点的视觉串联、WCAG 2.1 AA 对比度标准，并为下游实现输出结构化设计令牌。

---

## 快速参考

### 进入条件

生成设计输出前，请验证：

1. `.moai/project/brand/visual-identity.md` 存在且不包含任何 `_TBD_` 标记。
2. 文案范围已定义（来自 `moai-domain-copywriting` JSON 输出或内联简报）。
3. 目标框架已确认（来自 `.moai/config/sections/design.yaml` 的 `default_framework`）。

如果 `visual-identity.md` 中存在未解决的 `_TBD_` 标记，请停止执行并请求完成品牌访谈。

如果定义的调色板与生成的设计令牌冲突，则停止执行并返回冲突报告（参见下方的错误处理）。

### Figma 集成

Figma 集成默认处于禁用状态。检查 `.moai/config/sections/design.yaml`：

```
figma:
  enabled: false
```

如果 `figma.enabled: true` 且提供了公开的 Figma 文件 URL，则从 Figma 文件中提取设计令牌。否则，仅将 `visual-identity.md` 作为唯一事实来源。

---

## 实现指南

### 以首屏为起点的视觉串联

首屏区域为整个网站奠定视觉基调。后续所有区域均以它为基础进行串联：

1. 从 `visual-identity.md` 中提取首屏背景颜色、字体排印和间距。
2. 使用既定的对比度规则推导互补的区域颜色。
3. 在所有区域中应用一致的间距比例（不要为每个区域重新设定）。
4. 导航栏和页脚继承首屏的字体比例。

首屏区域要求：
- 在移动端首屏范围内，CTA 按钮必须可见（375px 视口宽度，667px 高度）。
- 标题与背景之间的对比度：最低 4.5:1（WCAG AA）。
- 首屏图片或背景：除非品牌明确指定，否则绝不使用纯白色 (#FFFFFF)。

### 设计令牌提取

从 `visual-identity.md` 中提取并输出以下令牌类别：

**颜色令牌**：
- `color.primary`：品牌主色（十六进制或 OKLCH）
- `color.primary.foreground`：主色背景上的文本颜色（必须通过 4.5:1 对比度要求）
- `color.secondary`：品牌辅助色
- `color.accent`：行动号召和高亮颜色
- `color.neutral.*`：从 50 到 950 的色阶（灰色色调）
- `color.semantic.success`、`color.semantic.warning`、`color.semantic.error`：状态颜色
- `color.background`：页面背景
- `color.surface`：卡片和组件背景

**字体排印令牌**：
- `font.family.sans`：主要无衬线字体栈
- `font.family.mono`：代码和技术内容
- `font.size.*`：比例：xs (12px)、sm (14px)、base (16px)、lg (18px)、xl (20px)、2xl (24px)、3xl (30px)、4xl (36px)
- `font.weight.normal`、`font.weight.medium`、`font.weight.bold`、`font.weight.black`
- `line.height.tight` (1.25)、`line.height.normal` (1.5)、`line.height.relaxed` (1.75)

**间距令牌**：
- 基础单位：4px
- 比例：从 `space.1` (4px) 到 `space.24` (96px)，遵循 4px 网格
- `space.section`：区域垂直内边距（默认桌面端 80px，移动端 48px）
- `space.container.max`：最大内容宽度（默认 1280px）
- `space.container.padding`：页面水平内边距（默认移动端 24px，桌面端 48px）

**圆角令牌**：
- `radius.sm` (4px)、`radius.md` (8px)、`radius.lg` (12px)、`radius.xl` (16px)、`radius.full` (9999px)

**阴影令牌**：
- `shadow.sm`、`shadow.md`、`shadow.lg`、`shadow.xl`

将所有令牌输出为结构化 JSON 文件，兼容 CSS 自定义属性和 Tailwind CSS v4 主题配置。

---

### WCAG 2.1 AA 合规性

所有颜色组合都必须达到以下对比度：

| 使用场景 | 最低对比度 | 要求 |
| --- | --- | --- |
| 正文文本（< 18px 或粗体 < 14px） | 4.5:1 | WCAG AA |
| 大文本（>= 18px 或粗体 >= 14px） | 3:1 | WCAG AA |
| UI 组件和图形对象 | 3:1 | WCAG AA |
| 焦点指示器 | 3:1 | WCAG AA |

如果品牌的 `visual-identity.md` 指定了未达到对比度要求的颜色组合，则停止执行并返回冲突报告。报告包括：
- 不合格的颜色对（前景色 + 背景色）
- 实际对比度
- 要求的最低对比度
- 三种达到所需对比度的替代前景色

**AI 粗制滥造检测** — 在没有品牌依据的情况下，拒绝以下视觉模式：
- 将紫色渐变（#8B5CF6 到 #6D28D9）用作主要视觉元素
- 浅灰色（`#F9FAFB`）背景上的白色卡片（`#FFFFFF`），且没有边框或阴影
- 通用素材图标集（未经定制的 feather-icons、heroicons）

---

### 组件规范

在设计输出中定义以下组件规范：

**按钮**：
- 主要按钮：`color.primary` 背景，`color.primary.foreground` 文本
- 次要按钮：`color.secondary` 背景，或带边框的透明背景
- 破坏性操作按钮：`color.semantic.error` 背景
- 状态：默认、悬停（加深 10%）、聚焦（使用 `color.accent` 的 3px 轮廓）、禁用（40% 不透明度）
- 尺寸：sm (h-8)、md (h-10，默认)、lg (h-12)
- 触控目标：移动端最小为 44x44px

**卡片**：
- 背景：`color.surface`
- 边框：1px 实线 `color.neutral.200`（浅色模式）
- 圆角：`radius.lg`
- 内边距：`space.6` (24px)
- 阴影：`shadow.sm`（默认）、`shadow.md`（悬停时）

**导航**：
- 高度：桌面端 64px，移动端 56px
- 背景：在首屏区域上透明，滚动后为纯色
- 徽标：最大高度为 32px
- 链接：`font.size.sm`、`font.weight.medium`
- 移动端：在 768px 断点处触发汉堡菜单

**区块布局**：
- 垂直内边距：`space.section`（参见间距令牌）
- 最大内容宽度：`space.container.max`
- 水平内边距：`space.container.padding`
- 交替背景：使用 `color.background` 和 `color.surface` 营造视觉节奏

---

### 布局网格

默认响应式网格：
- 移动端（< 768px）：4 列、16px 列间距、24px 页边距
- 平板端（768px - 1024px）：8 列、24px 列间距、32px 页边距
- 桌面端（>= 1024px）：12 列、32px 列间距、48px 页边距

首屏布局选项（根据 `visual-identity.md` 中的偏好选择）：
- `centered`：内容居中，使用全宽背景图片或渐变
- `split-left`：文案位于左侧（7 列），视觉元素位于右侧（5 列）
- `split-right`：视觉元素位于左侧（5 列），文案位于右侧（7 列）

---

### 错误处理

**调色板冲突**：当生成的设计令牌与 `visual-identity.md` 中定义的调色板冲突时，停止执行并返回：

```
BRAND_DESIGN_CONFLICT: Color token mismatch detected.
- Defined in visual-identity.md: <color>
- Generated token: <color>
- Conflict: <explanation>
- Resolution options: [list 2-3 adjustments]
```

**WCAG 对比度不达标**：当品牌颜色不符合对比度要求时，停止执行并返回 WCAG 章节中所述的冲突报告。不要静默生成备用颜色。

**缺少身份文件**：当 `visual-identity.md` 不存在或仅包含 `_TBD_` 值时，返回：

```
BRAND_DESIGN_MISSING_IDENTITY: visual-identity.md is incomplete.
- Unresolved markers found: <list of _TBD_ fields>
- Action required: Run brand interview via /moai design
```

---

## 高级模式

### 深色模式支持

当品牌上下文指定支持深色模式时：
- 为每种语义颜色定义 `color.*.dark` 变体
- 使用 CSS `prefers-color-scheme` 实现自动切换
- 确保所有令牌组合在两种模式下均通过对比度检查
- 导航栏和卡片必须具有不同的深色模式背景

### 动画与交互

保持交互指南简洁且目的明确：
- 过渡时长：150ms（微交互）、300ms（标准）、500ms（入场）
- 缓动：入场使用 `ease-out`，退场使用 `ease-in`，状态变化使用 `ease-in-out`
- 默认避免使用滚动触发的动画（无障碍考虑）
- 遵循 `prefers-reduced-motion` 媒体查询

### 性能预算

生成的设计必须满足：
- Lighthouse 性能 >= 80
- Lighthouse 无障碍 >= 90
- Lighthouse 最佳实践 >= 80
- Lighthouse SEO >= 80
- Core Web Vitals：LCP < 2.5s，CLS < 0.1
- 字体文件：最多使用 2 个自定义字体系列，并按实际使用的字符范围进行子集化

---

## 配合使用效果良好

- `moai-domain-copywriting`：文案长度限制可为布局选择提供依据
- `moai-workflow-design`：当 Claude Design 套件可用时，替代基于代码的设计（路径 A 处理器）
- `moai-workflow-gan-loop`：设计质量维度用于评估令牌合规性和 WCAG
- `moai-domain-uiux`：通过无障碍审计模式进行扩展

---

来源：于 2026-04-20 从 agency-design-system v1.0.0 吸收。
需求覆盖：REQ-SKILL-004、REQ-SKILL-005、REQ-SKILL-006、REQ-FALLBACK-003
版本：1.0.0