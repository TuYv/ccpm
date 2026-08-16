---
name: presentation-creator
description: Create data-driven presentation slides using React, Vite, and Recharts with Sentry branding. Use when asked to "create a presentation", "build slides", "make a deck", "create a data presentation", "build a Sentry presentation". Scaffolds a complete slide-based app with charts, animations, and single-file HTML output.
---
# Sentry 演示文稿构建器

使用 React + Vite + Recharts 创建交互式、数据驱动的演示幻灯片，采用 Sentry 设计系统进行样式设计，并构建为单个可分发的 HTML 文件。

## 第 1 步：收集需求

询问用户：
1. 演示主题是什么？
2. 需要多少张幻灯片（通常为 5-8 张）？
3. 需要哪些数据/图表？（时间序列、对比图、示意图、区域图）
4. 叙事脉络是什么？（问题 → 解决方案、之前 → 之后、技术深度解析）

### 数据评估（关键）

在设计任何幻灯片之前，评估源内容是否包含**真实的定量数据**（数字、百分比、测量值、时间序列、成本、指标）。仅在存在真实数据的幻灯片中创建 Recharts 可视化。请勿为填充图表而伪造、估算或编造数据。

- **有真实数据** → 使用 Recharts 图表（柱状图、面积图、折线图等）
- **无数据** → 使用基于文本的布局：卡片、表格、项目符号分栏、示意图或引用块。请勿使用虚构数据创建图表。

如果源内容完全是定性的（叙述、观点、策略、流程说明），演示文稿应不使用任何图表。仅当至少有一张幻灯片包含可供可视化的真实数据时，才应在项目中包含 Recharts 和 `Charts.jsx`。

## 第 2 步：搭建项目

创建项目结构：

```
<project-name>/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    └── Charts.jsx
```

### index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
    <title>TITLE</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### package.json

```json
{
  "name": "PROJECT_NAME",
  "private": true,
  "type": "module",
  "scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview" },
  "dependencies": { "react": "^18.3.1", "react-dom": "^18.3.1", "recharts": "^2.15.3" },
  "devDependencies": { "@vitejs/plugin-react": "^4.3.4", "vite": "^6.0.0", "vite-plugin-singlefile": "^2.3.0" }
}
```

### vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({ plugins: [react(), viteSingleFile()] })
```

### main.jsx

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
```

## 第 3 步：构建幻灯片系统

阅读 `references/design-system.md`，了解完整的 Sentry 调色板、字体排印、CSS 变量、布局工具和动画系统。

### App.jsx 结构

将幻灯片定义为一个由返回 JSX 的函数组成的数组：

```jsx
const SLIDES = [
  () => ( /* Slide 0: Title */ ),
  () => ( /* Slide 1: Context */ ),
  // ...
];
```

每个幻灯片函数返回一个 `<div className="slide-content">`，其中包含：
1. 一个 `<h2>` 标题
2. 可选的副标题段落
3. 主要内容（图表、卡片、图示、表格）
4. 动画类：`.anim`、`.d1`、`.d2`、`.d3`，用于实现交错淡入效果

请勿在标题上方添加类别标签胶囊/徽章（例如 `"BACKGROUND"`、`"EXPERIMENTS"`）。它们看起来千篇一律，并且没有带来任何价值。让标题本身传达含义。

### 导航

实现键盘导航（ArrowRight/Space = 下一页，ArrowLeft = 上一页），以及一个底部导航浮层，其中包含上一个/下一个按钮、圆点指示器和幻灯片编号。导航栏**没有边框或背景**——它以透明形式悬浮显示。一个低对比度的小型 Sentry 图形水印固定显示在每张幻灯片的左上角。

```jsx
function App() {
  const [cur, setCur] = useState(0);
  const go = useCallback((d) => setCur(c => Math.max(0, Math.min(SLIDES.length - 1, c + d))), []);

  useEffect(() => {
    const h = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [go]);

  return (
    <>
      {cur > 0 && <div className="glyph-watermark"><SentryGlyph size={50} /><span className="watermark-title">TITLE</span></div>}
      <div className="progress" style={{ width: `${((cur + 1) / SLIDES.length) * 100}%` }} />
      {SLIDES.map((S, i) => (
        <div key={i} className={`slide ${i === cur ? 'active' : ''}`}>
          <div className={`slide-content${i === cur ? ' anim' : ''}`}>
            <S />
          </div>
        </div>
      ))}
      <Nav cur={cur} total={SLIDES.length} go={go} setCur={setCur} />
    </>
  );
}
```

## 第 4 步：创建图表（仅当存在数据时）

**重要：仅为有来源内容中真实、具体数据支持的幻灯片创建图表。** 如果幻灯片内容是定性的（策略、经验、流程说明、观点），请改用基于文本的布局（卡片、表格、项目符号列表、分栏）。切勿虚构数字、捏造百分比或生成合成数据来填充图表。如果不确定数据是真实的还是推断得出的，请勿创建图表。

如果没有任何幻灯片需要图表，请完全跳过此步骤——不要创建 `Charts.jsx`，也不要导入 Recharts。

如果确实有真实数据可用，请阅读 `references/chart-patterns.md`，了解 Recharts 组件模式，包括坐标轴配置、颜色常量、图表类型和数据生成技术。

将所有图表组件放入 `Charts.jsx`。关键模式：

- 使用具有明确高度的 `ResponsiveContainer`
- 包裹在最大宽度为 920px 的 `.chart-wrap` div 中
- 使用 `useMemo` 生成数据
- **颜色规则**：使用受 Tableau 启发的分类调色板（`CAT[]`）来区分数据系列和分组。仅当颜色本身承载含义（好/坏、成功/失败、警告）时，才使用语义颜色（`SEM_GREEN`、`SEM_RED`、`SEM_AMBER`）。
- 常见图表：包含堆叠 `Area`/`Line` 的 `ComposedChart`、`BarChart`、自定义 SVG 图示
- **图表中的每个数据点都必须来自源内容。** 不得通过插值、外推或舍入数字来让图表看起来更美观。

## 第 5 步：使用 Sentry 设计系统设置样式

应用设计系统参考中的完整 CSS。关键元素：

- **字体**：来自 Google Fonts 的 Rubik
- **颜色**：用于 UI 界面元素的 CSS 变量（`--purple`、`--dark`、`--muted`）。仅在颜色传达含义时使用语义 CSS 变量（`--semantic-green`、`--semantic-red`、`--semantic-amber`）。所有其他数据可视化使用分类调色板（`CAT[]`）。
- **幻灯片**：绝对定位、不透明度过渡
- **动画**：具有交错延迟的 `fadeUp` 关键帧
- **布局**：`.cols` 弹性布局行、`.cards` 网格、`.chart-wrap` 容器
- **标签**：用于幻灯片标签的 `.tag-purple`、`.tag-red`、`.tag-green`、`.tag-amber`
- **Logo**：从 `references/sentry-logo.svg`（完整文字标志）或 `references/sentry-glyph.svg`（仅图形标志）读取官方 SVG。不得硬编码近似图形——始终使用这些文件中的精确 SVG 路径。

## 第 6 步：常见幻灯片模式

### 标题幻灯片
Logo（来自 `references/sentry-logo.svg` 或 `references/sentry-glyph.svg`）+ h1 + 副标题 + 作者/日期信息。

### 问题/背景幻灯片
标签 + 标题 + 带图标标题的两列卡片网格。

### 数据对比幻灯片
标签 + 标题 + 并排图表或前后对比表格。

### 技术深度解析幻灯片
标签 + 标题 + 全宽图表 + 下方的注释要点。

### 总结/决策幻灯片
标签 + 标题 + 带分类标题和项目符号列表的三列布局。

## 第 7 步：迭代与完善

初始脚手架搭建完成后：
1. 运行 `npm install && npm run dev` 启动开发服务器
2. 迭代优化图表数据模型和视觉设计
3. 调整动画、颜色和布局间距
4. 构建最终输出：`npm run build` 会在 `dist/` 中生成单个 HTML 文件

## 输出要求

一个可正常运行的 React + Vite 项目，满足以下要求：
- 渲染为可使用键盘导航的幻灯片
- 使用 Sentry 品牌元素（颜色、字体、图标）
- **仅在包含源内容中真实定量数据的幻灯片中**使用 Recharts 可视化——不得虚构数据
- 如果没有任何幻灯片包含真实数据，则完全省略 `Charts.jsx` 和 Recharts 依赖项
- 构建为单个可分发的 HTML 文件
- 幻灯片切换时具有流畅的淡入动画