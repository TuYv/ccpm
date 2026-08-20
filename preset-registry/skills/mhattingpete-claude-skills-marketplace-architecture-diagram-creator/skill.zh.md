---
name: architecture-diagram-creator
description: Create comprehensive HTML architecture diagrams showing data flows, business objectives, features, technical architecture, and deployment. Use when users request system architecture, project documentation, high-level overviews, or technical specifications.
---
# 架构图创建器

创建全面的 HTML 架构图，展示数据流、业务背景和系统架构。

## 适用场景

- “为 [project] 创建架构图”
- “生成高层概览”
- “记录系统架构”
- “展示数据流和处理管道”

## 应包含的组件

1. **业务背景**：目标、用户、价值、指标
2. **数据流**：数据源 → 处理 → 输出，并配有 SVG 图
3. **处理管道**：多阶段可视化
4. **系统架构**：分层组件（数据/处理/服务/输出）
5. **功能特性**：功能性和非功能性需求
6. **部署**：模型、先决条件、工作流

## HTML 结构

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Project] Architecture</title>
  <style>
    body { font-family: system-ui; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; }
    .section { margin: 30px 0; }
    svg { max-width: 100%; }
    /* Use semantic colors: #4299e1 (data), #ed8936 (processing), #9f7aea (AI), #48bb78 (success) */
  </style>
</head>
<body>
  <h1>[Project Name] - Architecture Overview</h1>

  <!-- Business Context Section -->
  <!-- Data Flow Diagram (SVG) -->
  <!-- Processing Pipeline (SVG) -->
  <!-- System Architecture Layers -->
  <!-- Features Grid -->
  <!-- Deployment Info -->
</body>
</html>
```

## 数据流的 SVG 模式

```html
<svg viewBox="0 0 800 400">
  <!-- Data sources (left, blue) -->
  <rect x="50" y="150" width="120" height="80" fill="#4299e1"/>

  <!-- Processing (center, orange) -->
  <rect x="340" y="150" width="120" height="80" fill="#ed8936"/>

  <!-- Outputs (right, green) -->
  <rect x="630" y="150" width="120" height="80" fill="#48bb78"/>

  <!-- Arrows connecting -->
  <path d="M170,190 L340,190" stroke="#666" stroke-width="2" marker-end="url(#arrow)"/>
</svg>
```

## 工作流

1. 分析项目（README、代码结构）
2. 提取：用途、数据源、处理过程、技术栈、输出
3. 创建包含全部 6 个部分的 HTML
4. 使用语义化颜色构建视觉层级
5. 写入 `[project]-architecture.html`

保持图表清晰、样式一致，并包含真实的项目细节。