---
name: blog-chart
description: >
  Generate dark-mode-compatible inline SVG data visualization charts for blog
  posts. Supports horizontal bar, grouped bar, donut, line, lollipop, area,
  and radar charts with automatic platform detection (HTML vs JSX/MDX).
  Enforces chart type diversity, accessible markup (role=img, aria-labelledby),
  source attribution, and transparent backgrounds. Use when user says "blog
  chart", "generate chart", "data visualization", "svg chart", "blog graph",
  or "visualize data".
user-invokable: false
license: MIT
---
# 博客图表：内置 SVG 数据可视化

为博客文章生成兼容深色模式的内联 SVG 图表。当 `blog-write` 和 `blog-rewrite` 识别出适合用图表呈现的数据时，会在内部调用此功能。它不是面向用户的独立命令。

**样式的唯一事实来源：** `skills/blog/references/visual-media.md`

对于支持的图表类型，优先使用确定性 CLI：

```bash
python3 skills/blog-chart/scripts/generate_chart_svg.py --input chart.json --output chart.html --json
```

## 输入格式

撰稿人或研究人员会传入图表请求：

```
Chart Request:
- Type: horizontal bar
- Title: "Quarterly Signups by Product"
- Data: Product A 420, Product B 315, Product C 180
- Source: [Verified source], [publication date]
- Platform: mdx (or html)
```

## 图表类型选择

根据数据模式进行选择。优先保持图表类型的多样性，但当重复使用某种类型明显有助于比较或读者理解时，可以重复使用。

| 数据模式 | 最佳图表类型 |
|-------------|-----------------|
| 前后对比 | 分组条形图 |
| 因素排名／相关性 | 棒棒糖图 |
| 整体构成／市场份额 | 环形图 |
| 随时间变化的趋势 | 折线图 |
| 百分比提升 | 水平条形图 |
| 分布／范围 | 面积图 |
| 多维度评分 | 雷达图 |

## 样式规则（不可妥协）

所有图表都必须在深色和浅色背景下正常显示：

```
Text elements:     fill="currentColor"
Grid lines:        stroke="currentColor" opacity="0.08"
Axis lines:        stroke="currentColor" opacity="0.3"
Background:        transparent (no fill on root SVG)
Subtitle text:     fill="var(--chart-muted, currentColor)"
Source text:        fill="var(--chart-muted, currentColor)"
Label text:        fill="currentColor" opacity="0.8"
```

在宿主主题中，将 `--chart-muted` 设置为具备无障碍可读性的文本令牌。如果没有相应令牌，则在浅色背景上使用 `#4b5563`，在深色背景上使用 `#d1d5db`。不要依赖低不透明度的来源或副标题文本来呈现清晰可见的出处信息。

### 调色板

| 颜色 | 十六进制值 | 使用场景 |
|-------|-----|----------|
| 橙色 | `#f97316` | 主要数据／最高值 |
| 天蓝色 | `#38bdf8` | 次要数据／对比 |
| 紫色 | `#a78bfa` | 第三级数据／特殊类别 |
| 绿色 | `#22c55e` | 第四级数据／正向指标 |

对于经批准的彩色元素内部的文本：使用 `fill="#111827"` 和 `fontWeight="800"`。只有在确认白色文本与该特定填充颜色之间的对比度至少为 4.5:1 后，才可使用白色文本。

不要仅依赖颜色。应添加直接标签、图案、虚线、标记形状或图例文本，以便色盲读者区分不同的数据系列。

## 标准 SVG 外壳（HTML）

```xml
<svg
  viewBox="0 0 560 380"
  style="max-width: 100%; height: auto; font-family: 'Inter', system-ui, sans-serif"
  role="img"
  aria-labelledby="chart-title chart-desc"
>
  <title id="chart-title">Chart Title</title>
  <desc id="chart-desc">Description for screen readers with all key data points and source</desc>

  <!-- Chart content -->

  <text x="280" y="372" text-anchor="middle" font-size="10" fill="var(--chart-muted, currentColor)">
    Source: Source Name (Year)
  </text>
</svg>
```

## JSX/MDX 外壳（camelCase 属性）

```jsx
<svg
  viewBox="0 0 560 380"
  style={{maxWidth: '100%', height: 'auto', fontFamily: "'Inter', system-ui, sans-serif"}}
  role="img"
  aria-labelledby="chart-title chart-desc"
>
  <title id="chart-title">Chart Title</title>
  <desc id="chart-desc">Description for screen readers</desc>

  {/* Chart content */}

  <text x="280" y="372" textAnchor="middle" fontSize="10" fill="var(--chart-muted, currentColor)">
    Source: Source Name (Year)
  </text>
</svg>
```

## JSX 属性转换（MDX 必需）

| HTML | JSX |
|------|-----|
| `stroke-width` | `strokeWidth` |
| `stroke-dasharray` | `strokeDasharray` |
| `stroke-linecap` | `strokeLinecap` |
| `text-anchor` | `textAnchor` |
| `font-size` | `fontSize` |
| `font-weight` | `fontWeight` |
| `font-family` | `fontFamily` |
| `class` | `className` |
| `style="..."` | `style={{...}}` |

## 图表类型构建

### 水平条形图

最适合：百分比提升、单指标比较。

1. 定义图表区域：x=80、y=40、width=440、height=280
2. 计算条形高度：`chartHeight / dataCount - gap`（gap=8）
3. 计算条形宽度：`(value / maxValue) * chartWidth`
4. 定位条形：`y = chartY + index * (barHeight + gap)`
5. 左侧标签（在 x=75 处右对齐）：类别名称
6. 条形末端的数值标签：百分比或数值
7. 底部居中的来源文本

### 分组条形图

最适合：前后对比、A 与 B 对比。

1. 沿 Y 轴定义分组，每组内包含多个条形
2. 为两个数据系列使用 2 种颜色（主色 + 辅色）
3. 在顶部添加图例：每个数据系列使用彩色方块 + 标签
4. 分组之间的间距 > 分组内部的间距

### 圆环图

最适合：整体的组成部分、市场份额。

1. 中心：cx=280、cy=180、外半径=140、内半径=80
2. 使用累积角度计算弧形分段
3. 每个分段：`<path d="M... A... L... A... Z" fill="color" />`
4. 中心文本：总计或关键标签
5. 图表下方的图例，包含彩色方块 + 标签 + 数值

### 折线图

最适合：随时间变化的趋势。

1. X 轴：时间段，均匀分布
2. Y 轴：数值范围，带有 4-5 条网格线
3. 绘制网格线：`stroke="currentColor" opacity="0.08"`
4. 绘制数据点：`<circle cx=... cy=... r="4" fill="color" />`
5. 使用以下元素连接：`<polyline points="..." fill="none" stroke="color" strokeWidth="2" />`
6. 可选：在线条下方添加区域填充，并设置 `opacity="0.1"`

### 棒棒糖图

最适合：因素排名、相关性。

1. 水平方向（类似条形图，但使用圆形）
2. 从坐标轴到数据点的细线：`stroke="currentColor" opacity="0.15" strokeWidth="1"`
3. 数据点处的圆形：`r="6"`，并设置填充颜色
4. 圆形旁边的数值标签
5. Y 轴上的类别（左对齐）

### 面积图

最适合：分布、累积数据。

1. 与折线图相同，但在线条下方填充区域
2. 区域填充：`<path d="M... L... L... Z" fill="color" opacity="0.15" />`
3. 顶部线条：`stroke="color" strokeWidth="2" fill="none"`
4. 区域后方的网格线

### 雷达图

最适合：多维度评分（5-7 个轴）。

1. 中心：cx=280, cy=190
2. 绘制同心多边形作为网格（3-4 层）
3. 以相等角度计算各轴端点
4. 按数值比例在各轴上绘制数据点
5. 使用填充多边形连接数据点：`fill="color" opacity="0.2" stroke="color"`
6. 在外边缘标注各个轴

## 标签规则

- 在单词边界处将长标签换行到多行 `<tspan>` 中。
- 仅当换行会与数据标记发生重叠时才截断，并将完整标签保留在 `<desc>` 或相邻正文中。
- 使用固定的图表尺寸，并设置响应式 `max-width: 100%; height: auto` 样式；对于标签密集的情况，也可选择有合理依据的更宽 viewBox。
- 检查移动端宽度，确保轴标签、图例和值标签不会重叠。

## 输出格式

将每个图表都包裹在 `<figure>` 元素中：

**HTML：**
```html
<figure>
  <svg viewBox="0 0 560 380" style="max-width: 100%; height: auto; font-family: 'Inter', system-ui, sans-serif" role="img" aria-labelledby="chart-title chart-desc">
    <title id="chart-title">[Chart Title]</title>
    <desc id="chart-desc">[Full description with data points for screen readers]</desc>
    <!-- chart content -->
    <text x="280" y="372" text-anchor="middle" font-size="10" fill="var(--chart-muted, currentColor)">
      Source: [Source Name] ([Year])
    </text>
  </svg>
  <figcaption>Source: <a href="[Source URL]">[Source Name]</a>, [publication date].</figcaption>
</figure>
```

**MDX：**
```mdx
<figure className="chart-container" style={{margin: '2.5rem 0', textAlign: 'center', padding: '1.5rem', borderRadius: '12px'}}>
  <svg viewBox="0 0 560 380" style={{maxWidth: '100%', height: 'auto', fontFamily: "'Inter', system-ui, sans-serif"}} role="img" aria-labelledby="chart-title chart-desc">
    <title id="chart-title">[Chart Title]</title>
    <desc id="chart-desc">[Full description]</desc>
    {/* chart content with camelCase attributes */}
    <text x="280" y="372" textAnchor="middle" fontSize="10" fill="var(--chart-muted, currentColor)">
      Source: [Source Name] ([Year])
    </text>
  </svg>
  <figcaption>Source: <a href="[Source URL]">[Source Name]</a>, [publication date].</figcaption>
</figure>
```

## 质量检查清单（返回前验证）

- [ ] 除经过对比度检查、位于彩色元素内部的标签外，不使用硬编码文本颜色
- [ ] 不使用白色/浅色背景（应为透明或无背景）
- [ ] 底部包含来源归属文本，并包含语义化的 `<figcaption>`
- [ ] `<svg>` 上包含 `role="img"` 和 `aria-labelledby`
- [ ] `<svg>` 内包含 `<title id>` 和 `<desc id>`
- [ ] 图表类型的选择有助于理解和比较
- [ ] 如果是 MDX：所有属性均使用 camelCase 格式（属性名中不含连字符）
- [ ] 数据值与源数据完全一致
- [ ] 调色板仅使用获准的颜色
- [ ] ViewBox 为 `0 0 560 380`（标准），或使用有合理依据的替代值
- [ ] 除颜色外，还使用标签、形状、图案或线条样式提供冗余信息