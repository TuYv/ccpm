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
- 侧边栏
- 导航
- 导航
- 导航
- 导航
- 导航
- 导航
- 导航
- 定价
- 侧边栏
- 导航
- 内容
- 内容
- 用户评价
- 内容
- 内容
- 内容
- 导航
- 定价
- 页脚
- 导航

## 使用方法
- 优先使用 `semantic.*` 令牌，而非 `primitive.*`。
- 切勿创建新的令牌或十六进制值；请复用以上令牌。
- 当缺少某个值时，选择最接近的现有语义令牌，并标记该缺口。
- 请通过点分路径引用令牌（例如 `semantic.color.action.primary`）。