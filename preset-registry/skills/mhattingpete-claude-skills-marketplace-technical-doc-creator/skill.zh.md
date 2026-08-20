---
name: technical-doc-creator
description: Create HTML technical documentation with code blocks, API workflows, system architecture diagrams, and syntax highlighting. Use when users request technical documentation, API docs, API references, code examples, or developer documentation.
---
# 技术文档创建器

创建包含代码示例和 API 工作流的全面 HTML 技术文档。

## 适用场景

- “为 [endpoints] 创建 API 文档”
- “为 [system] 生成技术文档”
- “编写 API 参考文档”
- “创建开发者文档”

## 组成部分

1. **概述**：用途、主要功能、技术栈
2. **入门指南**：安装、设置、快速开始
3. **API 参考**：包含请求/响应示例的端点
4. **代码示例**：带语法高亮的代码块
5. **架构**：系统图（SVG）
6. **工作流**：分步流程

## HTML 结构

```html
<!DOCTYPE html>
<html>
<head>
  <title>[API/System] Documentation</title>
  <style>
    body { font-family: system-ui; max-width: 1000px; margin: 0 auto; }
    pre { background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 4px; overflow-x: auto; }
    .endpoint { background: #f7fafc; padding: 15px; margin: 10px 0; border-left: 4px solid #4299e1; }
    code { background: #e2e8f0; padding: 2px 6px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>[System] Documentation</h1>
  <!-- Overview, Getting Started, API Reference, Examples -->
</body>
</html>
```

## API 端点模式

```html
<div class="endpoint">
  <h3><span style="color: #48bb78;">GET</span> /api/users/{id}</h3>
  <p>Retrieve user by ID</p>

  <h4>Request</h4>
  <pre><code>curl -X GET https://api.example.com/users/123</code></pre>

  <h4>Response</h4>
  <pre><code>{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com"
}</code></pre>
</div>
```

## 代码块模式

```html
<pre><code>// Installation
npm install package-name

// Usage
import { feature } from 'package-name';
const result = feature.doSomething();</code></pre>
```

## 工作流

1. 提取 API 端点、方法和参数
2. 创建概述和入门指南部分
3. 使用示例记录每个端点
4. 为常见操作添加代码片段
5. 在相关情况下包含架构图
6. 写入 `[system]-docs.html`

为 HTTP 方法使用语义化颜色：GET（绿色）、POST（蓝色）、DELETE（红色）。