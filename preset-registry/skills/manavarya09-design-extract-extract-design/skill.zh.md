---
name: extract-design
description: "Extract the full design language from any website URL. Produces 8 output files including AI-optimized markdown, visual HTML preview, Tailwind config, React theme, shadcn/ui theme, Figma variables, W3C design tokens, and CSS variables. Also runs WCAG accessibility scoring. Use when user says 'extract design', 'get design system', 'design language', 'design tokens', 'what colors/fonts does this site use', or '/extract-design'."
allowed-tools: Bash, Read, Write, Glob
---
# 提取设计语言

从任意网站 URL 中提取完整的设计语言。生成 8 个输出文件，涵盖颜色、排版、间距、阴影、组件、断点、动画和无障碍性。

## 前置条件

确保 `designlang` 可用。如有需要，请安装：

```bash
npm install -g designlang
```

或者使用 npx（无需安装）：

```bash
npx designlang <url>
```

## 流程

1. **运行提取**，针对提供的 URL：

```bash
npx designlang <url> --screenshots
```

如需多页面爬取：`npx designlang <url> --depth 3 --screenshots`
如需深色模式：`npx designlang <url> --dark --screenshots`

2. **读取生成的 Markdown 文件**以了解设计：

```bash
cat design-extract-output/*-design-language.md
```

3. **向用户呈现关键发现**：
   - 包含十六进制代码的主色调色板
   - 使用中的字体系列
   - 间距系统（如检测到则包含基础单位）
   - WCAG 无障碍性评分
   - 发现的组件模式
   - 值得注意的设计决策（阴影、圆角等）

4. **提供后续步骤：**
   - 将 `*-tailwind.config.js` 复制到其项目中
   - 将 `*-variables.css` 导入其样式表
   - 对于 shadcn/ui 用户，将 `*-shadcn-theme.css` 粘贴到 globals.css 中
   - 为 React/CSS-in-JS 项目导入 `*-theme.js`
   - 将 `*-figma-variables.json` 导入 Figma，用于设计师交接
   - 在浏览器中打开 `*-preview.html`，查看视觉概览
   - 将该 Markdown 文件用作 AI 辅助开发的上下文

## 输出文件（8 个）

| 文件 | 用途 |
|------|---------|
| `*-design-language.md` | 面向 AI 优化的 Markdown —— 供 LLM 使用的完整设计系统 |
| `*-preview.html` | 包含色板、字体比例、阴影和无障碍性信息的可视化 HTML 报告 |
| `*-design-tokens.json` | W3C Design Tokens 格式 |
| `*-tailwind.config.js` | 可直接使用的 Tailwind CSS 主题 |
| `*-variables.css` | CSS 自定义属性 |
| `*-figma-variables.json` | Figma Variables 导入格式 |
| `*-theme.js` | React/CSS-in-JS 主题对象 |
| `*-shadcn-theme.css` | shadcn/ui 主题 CSS 变量 |

## 附加命令

- **比较两个站点：** `npx designlang diff <urlA> <urlB>`
- **查看历史记录：** `npx designlang history <url>`

## 选项

| 标志 | 描述 |
|------|-------------|
| `--out <dir>` | 输出目录（默认：`./design-extract-output`） |
| `--dark` | 同时提取深色模式配色方案 |
| `--depth <n>` | 爬取 N 个内部页面，以进行全站提取 |
| `--screenshots` | 捕获组件截图（按钮、卡片、导航） |
| `--wait <ms>` | SPA 页面加载后的等待时间 |
| `--framework <type>` | 仅生成特定主题（`react` 或 `shadcn`） |