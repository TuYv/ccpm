---
name: moai-tool-svg
description: >
  SVG creation, optimization, and transformation specialist. Use when creating vector
  graphics, optimizing SVG files with SVGO, implementing icon systems, building data
  visualizations, or adding SVG animations.
license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Grep, Glob, Bash(svgo:*), Bash(npx:*), WebFetch
user-invocable: false
metadata:
  version: "1.0.0"
  category: "tool"
  modularized: "true"
  status: "active"
  updated: "2026-01-26"
  tags: "svg, vector, graphics, svgo, optimization, animation, icons"
  related-skills: "moai-domain-frontend, moai-docs-generation"
  context7-libraries: "/nicolo-ribaudo/svgo"
---
# SVG 创建与优化专家

全面的 SVG 开发，涵盖矢量图形创建、SVGO 优化、图标系统、数据可视化和动画。此技能提供适用于所有 SVG 工作流的模式，从基本形状到复杂的动画图形。

---

## 快速参考（30 秒）

### 基本 SVG 模板

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <title>Accessible Title</title>
  <desc>Description for screen readers</desc>
  <!-- Content here -->
</svg>
```

### 常用形状速查表

矩形：`<rect x="10" y="10" width="80" height="60" rx="5" />`

圆形：`<circle cx="50" cy="50" r="40" />`

椭圆：`<ellipse cx="50" cy="50" rx="40" ry="25" />`

直线：`<line x1="10" y1="10" x2="90" y2="90" stroke="black" />`

折线：`<polyline points="10,10 50,50 90,10" fill="none" stroke="black" />`

多边形：`<polygon points="50,10 90,90 10,90" />`

### 路径命令快速参考

移动命令：
- M x y：移动到绝对位置
- m dx dy：相对移动
- L x y：绘制直线到绝对位置
- l dx dy：相对绘制直线
- H x：绘制绝对水平线
- h dx：绘制相对水平线
- V y：绘制绝对垂直线
- v dy：绘制相对垂直线
- Z：闭合路径

曲线命令：
- C x1 y1 x2 y2 x y：三次贝塞尔曲线（两个控制点）
- S x2 y2 x y：平滑三次贝塞尔曲线（映射前一个控制点）
- Q x1 y1 x y：二次贝塞尔曲线（一个控制点）
- T x y：平滑二次贝塞尔曲线（映射前一个控制点）
- A rx ry rotation large-arc sweep x y：圆弧

### SVGO CLI 命令

全局安装：`npm install -g svgo`

优化单个文件：`svgo input.svg -o output.svg`

优化目录：`svgo -f ./src/icons -o ./dist/icons`

显示优化统计信息：`svgo input.svg --pretty --indent=2`

使用配置文件：`svgo input.svg --config svgo.config.mjs`

### 填充和描边快速参考

填充属性：fill、fill-opacity、fill-rule（nonzero、evenodd）

描边属性：stroke、stroke-width、stroke-opacity、stroke-linecap（butt、round、square）、stroke-linejoin（miter、round、bevel）、stroke-dasharray、stroke-dashoffset

---

## 实现指南（5 分钟）

### SVG 文档结构

独立文件中的 SVG 元素需要 xmlns 属性。viewBox 将坐标系定义为“minX minY width height”。width 和 height 用于设置渲染尺寸。

```xml
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 200 200"
     width="200" height="200"
     preserveAspectRatio="xMidYMid meet">

  <!-- Reusable definitions -->
  <defs>
    <linearGradient id="grad1">
      <stop offset="0%" stop-color="#ff0000" />
      <stop offset="100%" stop-color="#0000ff" />
    </linearGradient>
  </defs>

  <!-- Grouped content -->
  <g id="main-group" transform="translate(10, 10)">
    <rect width="100" height="100" fill="url(#grad1)" />
  </g>
</svg>
```

### 创建可复用符号

符号用于定义可通过 use 元素实例化的可复用图形。它们支持使用各自的 viewBox 进行缩放。

```xml
<svg xmlns="http://www.w3.org/2000/svg">
  <defs>
    <symbol id="icon-star" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </symbol>
  </defs>

  <!-- Use the symbol multiple times -->
  <use href="#icon-star" x="0" y="0" width="24" height="24" />
  <use href="#icon-star" x="30" y="0" width="24" height="24" fill="gold" />
  <use href="#icon-star" x="60" y="0" width="48" height="48" />
</svg>
```

### 路径创建模式

结合移动、直线和曲线的简单图标路径：

```xml
<path d="M10 20 L20 10 L30 20 L20 30 Z" />
```

使用圆弧绘制圆角矩形：

```xml
<path d="M15 5 H85 A10 10 0 0 1 95 15 V85 A10 10 0 0 1 85 95 H15 A10 10 0 0 1 5 85 V15 A10 10 0 0 1 15 5 Z" />
```

使用三次贝塞尔曲线绘制心形：

```xml
<path d="M50 88 C20 65 5 45 5 30 A15 15 0 0 1 35 30 Q50 45 50 45 Q50 45 65 30 A15 15 0 0 1 95 30 C95 45 80 65 50 88 Z" />
```

### 渐变实现

从左到右的线性渐变：

```xml
<defs>
  <linearGradient id="horizontal-grad" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#3498db" />
    <stop offset="50%" stop-color="#9b59b6" />
    <stop offset="100%" stop-color="#e74c3c" />
  </linearGradient>
</defs>
<rect fill="url(#horizontal-grad)" width="200" height="100" />
```

带焦点的径向渐变：

```xml
<defs>
  <radialGradient id="sphere-grad" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
    <stop offset="0%" stop-color="#ffffff" />
    <stop offset="100%" stop-color="#3498db" />
  </radialGradient>
</defs>
<circle fill="url(#sphere-grad)" cx="50" cy="50" r="40" />
```

### SVGO 配置

在项目根目录中创建 svgo.config.mjs：

```javascript
export default {
  multipass: true,
  plugins: [
    'preset-default',
    'prefixIds',
    {
      name: 'sortAttrs',
      params: {
        xmlnsOrder: 'alphabetical'
      }
    },
    {
      name: 'removeAttrs',
      params: {
        attrs: ['data-name', 'class']
      }
    }
  ]
};
```

保留特定元素的配置：

```javascript
export default {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          cleanupIds: {
            preserve: ['icon-', 'logo-']
          }
        }
      }
    }
  ]
};
```

### 在 React 中嵌入 SVG

内联 SVG 组件：

```tsx
const Icon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7l10 5 10-5-10-5z" stroke={color} strokeWidth="2" />
  </svg>
);
```

使用 use 元素的 SVG 雪碧图：

```tsx
const SpriteIcon = ({ name, size = 24 }) => (
  <svg width={size} height={size}>
    <use href={`/sprites.svg#${name}`} />
  </svg>
);
```

### 文本元素

基本文本定位：

```xml
<text x="50" y="50" text-anchor="middle" dominant-baseline="middle"
      font-family="Arial" font-size="16" fill="#333">
  Centered Text
</text>
```

沿路径排列的文本：

```xml
<defs>
  <path id="text-curve" d="M10 80 Q95 10 180 80" fill="none" />
</defs>
<text font-size="14">
  <textPath href="#text-curve">Text following a curved path</textPath>
</text>
```

---

## 高级实现（10 分钟以上）

### 复杂滤镜效果

带模糊效果的投影：

```xml
<defs>
  <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
    <feOffset in="blur" dx="3" dy="3" result="offsetBlur" />
    <feMerge>
      <feMergeNode in="offsetBlur" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
</defs>
```

发光效果：

```xml
<filter id="glow">
  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
  <feMerge>
    <feMergeNode in="coloredBlur" />
    <feMergeNode in="SourceGraphic" />
  </feMerge>
</filter>
```

### 裁剪与遮罩

用于裁剪的裁剪路径：

```xml
<defs>
  <clipPath id="circle-clip">
    <circle cx="50" cy="50" r="40" />
  </clipPath>
</defs>
<image href="photo.jpg" width="100" height="100" clip-path="url(#circle-clip)" />
```

用于淡出效果的渐变遮罩：

```xml
<defs>
  <linearGradient id="fade-grad">
    <stop offset="0%" stop-color="white" />
    <stop offset="100%" stop-color="black" />
  </linearGradient>
  <mask id="fade-mask">
    <rect width="100" height="100" fill="url(#fade-grad)" />
  </mask>
</defs>
<rect width="100" height="100" fill="blue" mask="url(#fade-mask)" />
```

### CSS 动画集成

SVG 元素的关键帧动画：

```css
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.animated-circle {
  animation: pulse 2s ease-in-out infinite;
  transform-origin: center;
}
```

描边绘制动画：

```css
.draw-path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: draw 2s ease forwards;
}

@keyframes draw {
  to { stroke-dashoffset: 0; }
}
```

### 无障碍最佳实践

始终为有意义的图形添加 title 和 desc：

```xml
<svg role="img" aria-labelledby="title desc">
  <title id="title">Company Logo</title>
  <desc id="desc">A blue mountain with snow-capped peak</desc>
  <!-- graphic content -->
</svg>
```

对于装饰性 SVG，应对屏幕阅读器隐藏：

```xml
<svg aria-hidden="true" focusable="false">
  <!-- decorative content -->
</svg>
```

### 性能优化

将路径数据的精度从 6 位小数降低到 2 位：

优化前：`M10.123456 20.654321 L30.987654 40.123456`

优化后：`M10.12 20.65 L30.99 40.12`

在适当的情况下将形状转换为路径，以减小文件大小。对重复元素使用符号。应用 SVGZ 压缩可将文件大小减少 20–50%。

有关各主题的详细模式，请参阅 modules 目录。

---

## 模块索引

- modules/svg-basics.md：文档结构、坐标系统、形状、路径、文本
- modules/svg-styling.md：填充、描边、渐变、图案、滤镜、裁剪、遮罩
- modules/svg-optimization.md：SVGO 配置、压缩、精灵图、性能
- modules/svg-animation.md：CSS 动画、SMIL、JavaScript、交互模式

---

## 配合良好的技能

- moai-domain-frontend：React/Vue SVG 组件集成
- moai-docs-generation：为文档生成 SVG 图表
- moai-domain-uiux：图标系统和设计系统集成

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “PNG 已经够用了，对这个图标使用 SVG 有些小题大做” | PNG 在不同分辨率下会变得模糊，并且需要提供多种尺寸。SVG 可以完美缩放，而且对于简单图形，文件体积更小。 |
| “我之后会优化 SVG” | 设计工具导出的未经优化的 SVG 包含编辑器元数据、隐藏图层和高精度小数，会使文件体积膨胀 50-80%。 |
| “内联 SVG 总是比 img 标签更好” | 内联 SVG 会增加 HTML 负载，并妨碍浏览器缓存。对于不需要动态设置样式的静态图标，应使用 img 标签。 |
| “无障碍要求不适用于装饰性图标” | 装饰性图标需要设置 aria-hidden=true，才能被屏幕阅读器正确忽略。否则，屏幕阅读器会读出无意义的内容。 |
| “SVGO 的默认配置适用于所有 SVG” | SVGO 的默认配置会移除 viewBox 和 title 元素。需要自定义配置才能保留无障碍支持和响应式能力。 |

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- SVG 文件包含编辑器元数据（Illustrator、Sketch、Figma 导出的冗余内容）
- SVG 缺少 viewBox 属性（会破坏响应式缩放）
- 交互式 SVG 缺少 role 和 aria-label 属性
- 装饰性 SVG 缺少 aria-hidden="true"
- 对于相同的视觉内容，SVG 文件比对应的 PNG 文件更大

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 已使用 SVGO 或同等工具优化 SVG（展示优化前后的文件大小）
- [ ] 所有 SVG 均包含 viewBox 属性（不能只有固定的 width/height）
- [ ] 装饰性 SVG 具有 aria-hidden="true"
- [ ] 交互式 SVG 具有 role="img" 和 aria-label
- [ ] 在目标分辨率下，SVG 文件大小小于对应的 PNG
- [ ] 已提交的 SVG 文件中不含编辑器元数据（检查 Illustrator/Sketch/Figma 标签）

<!-- moai:evolvable-end -->