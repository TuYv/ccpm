---
name: designlang-tokens
description: Use when styling UI for webflow.com — references the extracted design system tokens instead of inventing colors, spacing, or typography.
---
# designlang 令牌
来源：https://webflow.com
由 designlang v7.0.0 于 2026-06-25T08:28:55.721Z 提取

## 语义令牌（请使用这些）
- color.action.primary: #146ef5
- color.surface.default: #ffffff
- color.text.body: #000000
- radius.control: 2px
- typography.body.fontFamily: WF Visual Sans Variable

## 区域
- sidebar
- nav
- nav
- nav
- nav
- nav
- nav
- nav
- nav
- pricing
- sidebar
- nav
- content
- content
- testimonials
- content
- content
- content
- nav
- pricing
- footer
- nav

## 如何使用
- 优先使用 `semantic.*` 令牌而非 `primitive.*`。
- 切勿发明新的令牌或十六进制色值；请复用上面列出的值。
- 当缺失某个值时，选择最接近的现有语义令牌，并标记该缺口。
- 通过点分路径引用令牌（例如 `semantic.color.action.primary`）。
