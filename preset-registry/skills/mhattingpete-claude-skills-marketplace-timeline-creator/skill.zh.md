---
name: timeline-creator
description: Create HTML timelines and project roadmaps with Gantt charts, milestones, phase groupings, and progress indicators. Use when users request timelines, roadmaps, Gantt charts, project schedules, or milestone visualizations.
---
# 时间线创建器

创建带有甘特图和里程碑的交互式 HTML 时间线与项目路线图。

## 适用场景

- “为[项目]创建时间线”
- “生成 Q1-Q4 路线图”
- “为计划制作甘特图”
- “展示项目里程碑”

## 组成部分

1. **时间线标题**：项目名称、日期范围、完成百分比
2. **阶段分组**：Q1、Q2、Q3、Q4 或自定义阶段
3. **时间线项目**：包含开始/结束日期、进度和状态的任务
4. **里程碑**：包含日期的关键交付成果
5. **甘特图可视化**：用水平条展示持续时间

## HTML 结构

```html
<!DOCTYPE html>
<html>
<head>
  <title>[Project] Timeline</title>
  <style>
    body { font-family: system-ui; max-width: 1400px; margin: 0 auto; }
    .timeline-bar { background: linear-gradient(90deg, #4299e1, #48bb78); height: 20px; border-radius: 4px; }
    .milestone { border-left: 3px solid #e53e3e; padding-left: 10px; }
    /* Status colors: #48bb78 (done), #4299e1 (in-progress), #718096 (planned) */
  </style>
</head>
<body>
  <h1>[Project] Timeline</h1>
  <!-- Phase sections with timeline bars -->
  <!-- Milestones list -->
</body>
</html>
```

## 时间线条模式

```html
<div class="timeline-item">
  <span>Task Name</span>
  <div class="timeline-bar" style="width: [percentage]%; background: [status-color];"></div>
  <span>[start] - [end]</span>
</div>
```

## 工作流程

1. 从项目中提取任务、日期和阶段
2. 计算持续时间百分比
3. 按阶段（季度或自定义阶段）分组
4. 创建带有甘特图样式条形图的 HTML
5. 添加里程碑部分
6. 写入 `[project]-timeline.html`

使用语义化颜色表示状态，并保持布局响应式。