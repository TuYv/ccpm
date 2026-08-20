---
name: dashboard-creator
description: Create HTML dashboards with KPI metric cards, bar/pie/line charts, progress indicators, and data visualizations. Use when users request dashboards, metrics displays, KPI visualizations, data charts, or monitoring interfaces.
---
# 仪表板创建器

创建包含 KPI 卡片和图表的交互式 HTML 仪表板。

## 适用场景

- “为[指标]创建仪表板”
- “显示 KPI 可视化”
- “生成绩效仪表板”
- “制作包含图表的分析仪表板”

## 组件

1. **KPI 卡片**：指标名称、数值、变化百分比、趋势图标
2. **图表**：使用 SVG 或 CSS 创建的柱状图、饼图或折线图
3. **进度条**：完成度指示器
4. **数据表格**：以表格形式展示数据

## HTML 结构

```html
<!DOCTYPE html>
<html>
<head>
  <title>[Project] Dashboard</title>
  <style>
    body { font-family: system-ui; background: #f7fafc; }
    .kpi-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .kpi-value { font-size: 36px; font-weight: bold; }
    .trend-up { color: #48bb78; }
    .trend-down { color: #e53e3e; }
  </style>
</head>
<body>
  <h1>[Dashboard Name]</h1>
  <div class="grid">
    <!-- KPI cards -->
    <!-- Charts -->
    <!-- Progress bars -->
  </div>
</body>
</html>
```

## KPI 卡片模式

```html
<div class="kpi-card">
  <div class="kpi-label">Revenue</div>
  <div class="kpi-value">$124K</div>
  <div class="trend-up">↑ 12.5%</div>
</div>
```

## 图表模式（SVG 柱状图）

```html
<svg viewBox="0 0 400 300">
  <rect x="50" y="100" width="40" height="150" fill="#4299e1"/>
  <rect x="120" y="80" width="40" height="170" fill="#48bb78"/>
  <!-- bars for each data point -->
</svg>
```

## 工作流程

1. 提取指标和数据
2. 创建 KPI 卡片网格
3. 以 SVG 形式生成图表（柱状图、饼图或折线图）
4. 添加进度指示器
5. 写入 `[name]-dashboard.html`

使用语义化颜色：绿色（正向）、红色（负向）、蓝色（中性）。