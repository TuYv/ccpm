---
name: hand-drawn-diagrams
description: "Create hand-drawn Excalidraw diagrams, flows, explainers, wireframes, and page mockups. Default to monochrome sketch output; allow restrained color only for page mockups when the user explicitly wants webpage-like fidelity. Use when the user asks for a diagram, flowchart, wireframe, sketch, visual explanation, mind map, architecture overview, or any Excalidraw-based drawing."
---
遵循 `./workflow.md` 中的说明。

## 工作流程

1. **路由** — 阅读 `./steps/step-01-route.md`。根据用户意图（教学、头脑风暴、UX 流程、漏斗、技术讲解、医疗、创意或页面模型），从路由表（`references/activation-routing.xml`）中选择一种图表类型。
2. **绘制** — 阅读 `./steps/step-02-draw.md`。使用共享形状语法（`references/fundamental-shapes.md`）设计图表，然后将 elements 数组非空的 `.excalidraw` JSON 文件写入 `/tmp/hand-drawn-diagrams/<slug>/`。
3. **验证与交付** — 阅读 `./steps/step-03-validate.md`。运行 `scripts/validate_excalidraw.py`，然后运行 `scripts/open_diagram.py`，生成托管的编辑 URL 并在浏览器中打开。提供动画和 PNG 作为后续选项。

## 关键规则

- 手绘风格，使用相同的手写字体，默认采用单色
- 标签：每个形状 1–5 个词；每个容器最多包含 3 个简短的项目符号条目
- 将 `.excalidraw` 文件写入 `/tmp/`，而不是用户的工作区（除非用户提出要求）
- 生成 URL 前始终进行验证——绝不分享空白图表
- 渲染优先级：Chrome DevTools MCP（快速）→ Playwright（备用）

## 参考资料

- `references/index.md` — 完整参考资料索引
- `references/activation-routing.xml` — 路由选择规则和交付模式
- `references/fundamental-shapes.md` — 核心形状语言

## 可选：Chrome DevTools MCP

如需快速渲染 PNG 和动画 SVG，请安装 `chrome-devtools-mcp`（使用真实浏览器，无需 Playwright）。设置方法请参阅 `INSTALL.md`。如果未安装，渲染将回退到 Playwright。