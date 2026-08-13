---
name: slides
description: Create strategic HTML presentations with Chart.js, design tokens, responsive layouts, copywriting formulas, and contextual slide strategies.
argument-hint: "[topic] [slide-count]"
metadata:
  author: claudekit
  version: "1.0.0"
---
# 幻灯片

通过数据可视化进行战略性 HTML 演示设计。

## 何时使用

- 营销演示和推介文稿
- 使用 Chart.js 的数据驱动幻灯片
- 使用布局模式进行战略性幻灯片设计
- 适合文案写作优化的演示内容

## 子命令

| 子命令 | 描述 | 参考 |
|------------|-------------|-----------|
| `create` | 创建战略性演示幻灯片 | `references/create.md` |

## 参考（知识库）

| 主题 | 文件 |
|-------|------|
| 布局模式 | `references/layout-patterns.md` |
| HTML 模板 | `references/html-template.md` |
| 文案公式 | `references/copywriting-formulas.md` |
| 幻灯片策略 | `references/slide-strategies.md` |

## 路由

1. 从 `$ARGUMENTS` 解析子命令（第一个词）
2. 加载对应的 `references/{subcommand}.md`
3. 使用剩余参数执行
