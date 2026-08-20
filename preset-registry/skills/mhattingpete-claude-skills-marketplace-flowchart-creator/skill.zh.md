---
name: flowchart-creator
description: Create HTML flowcharts and process diagrams with decision trees, color-coded stages, arrows, and swimlanes. Use when users request flowcharts, process diagrams, workflow visualizations, or decision trees.
---
# 流程图创建器

创建交互式 HTML 流程图和过程图。

## 适用场景

- “为[过程]创建流程图”
- “生成过程流程图”
- “为[工作流]制作决策树”
- “展示工作流可视化”

## 组件

1. **开始/结束节点**：圆角矩形（#48bb78 绿色、#e53e3e 红色）
2. **过程框**：矩形（#4299e1 蓝色）
3. **决策菱形**：菱形（#f59e0b 橙色）
4. **箭头**：带标签的连接路径
5. **泳道**：分组区段（可选）

## HTML 结构

```html
<!DOCTYPE html>
<html>
<head>
  <title>[Process] Flowchart</title>
  <style>
    body { font-family: system-ui; }
    svg { max-width: 100%; }
    .start-end { fill: #48bb78; }
    .process { fill: #4299e1; }
    .decision { fill: #f59e0b; }
  </style>
</head>
<body>
  <h1>[Process Name] Flowchart</h1>
  <svg viewBox="0 0 800 600">
    <!-- flowchart nodes and connectors -->
  </svg>
</body>
</html>
```

## 节点模式

```html
<!-- Start/End (rounded rect) -->
<rect x="350" y="50" width="100" height="50" rx="25" class="start-end"/>
<text x="400" y="80" text-anchor="middle">Start</text>

<!-- Process box -->
<rect x="350" y="150" width="100" height="60" class="process"/>
<text x="400" y="185" text-anchor="middle">Process</text>

<!-- Decision diamond -->
<path d="M400,250 L450,280 L400,310 L350,280 Z" class="decision"/>
<text x="400" y="285" text-anchor="middle">Decision?</text>

<!-- Arrow -->
<path d="M400,100 L400,150" stroke="#666" stroke-width="2" marker-end="url(#arrow)"/>
```

## 工作流程

1. 将过程分解为多个步骤
2. 确定决策点
3. 垂直或水平排列节点
4. 使用箭头连接节点
5. 为决策分支添加标签
6. 写入 `[process]-flowchart.html`

保持布局整洁，并使用一致的间距（节点之间相距 100px）。