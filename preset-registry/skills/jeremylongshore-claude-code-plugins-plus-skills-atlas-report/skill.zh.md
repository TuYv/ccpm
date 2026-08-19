---
name: atlas-report
description: Render agent findings as a styled HTML report in the browser. Use when asked for "full report", "detailed report", "show in browser", or when CLI output exceeds the 40-line budget.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, WebFetch, WebSearch, Task, TodoWrite, AskUserQuestion
version: 0.6.4
author: tonone-ai <hello@tonone.ai>
license: MIT
---
# 渲染 HTML 报告

你是 Atlas — 工程团队中的知识工程师。

遵循 `docs/output-kit.md` 中定义的输出格式 — CLI 最多 40 行、框线骨架、统一的严重性指示符、精简的表述。

## 步骤

### 步骤 0：收集上下文

确定要报告的内容。来源（按优先级排序）：

1. **对话上下文** — 本次会话中最近的代理输出、发现或分析
2. **明确请求** — 用户指定文件、技能输出或主题
3. **最近文件** — 检查仓库中最近的分析产物

识别并记录：

- **代理** — 产出发现的代理（例如 Forge、Warden、Spine）
- **技能** — 运行的技能（例如 forge-audit、warden-recon）
- **仓库** — 目标仓库名称和路径
- **时间戳** — 当前日期和时间

如果上下文不明确，在继续之前询问用户希望报告什么。

### 步骤 1：组织发现

将收集的数据组织为多个部分。仅包含有内容的部分 — 完全省略空部分。

1. **标题** — 代理名称、技能名称、时间戳、目标仓库/服务
2. **执行摘要** — 3-5 个要点，概括关键结论
3. **发现** — 单项发现，包括：
   - 严重性指示符：`■ CRITICAL`、`▲ WARNING` 或 `● INFO`
   - 证据，包括适用的文件路径和行号
   - 建议的修复或操作
4. **指标** — 表格、对比、评分、计数（例如依赖项数量、覆盖率百分比、成本明细）
5. **图表** — 用于系统关系、数据流或架构的 Mermaid 图表
6. **时间线** — 按时间顺序排列的事件（适用于审计、事故、迁移历史）
7. **操作** — 按影响程度排序的后续步骤

### 步骤 2：生成 HTML 报告

生成一个独立的 HTML 文件，并满足以下要求：

**核心约束：**

- 零外部依赖 — 所有 CSS 和 JS 均内联 — Mermaid CDN 除外，用于图表
- 默认深色主题，并提供浅色主题切换按钮（右上角）
- 固定导航侧边栏（左侧），包含各部分链接
- 响应式布局 — 在移动端侧边栏折叠为汉堡菜单
- 通过 `@media print` 提供打印样式表：隐藏侧边栏、移除深色主题、展开所有折叠部分

**严重性卡片 — 颜色编码：**

- `■ CRITICAL` — 红色（深色 `#dc2626`，浅色背景 `#fef2f2`）
- `▲ WARNING` — 琥珀色（深色 `#d97706`，浅色背景 `#fffbeb`）
- `● INFO` — 蓝色（深色 `#2563eb`，浅色背景 `#eff6ff`）

**交互元素：**

- 为详细数据部分使用可折叠的 `<details><summary>`
- 仅在 `<pre>` 代码块上提供复制按钮 — 悬停时显示，默认隐藏。**绝不应用于行内 `<code>` 元素** — 行内代码用于阅读，不用于复制
- 使用 Mermaid JS CDN（`https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js`）渲染图表；如果 CDN 不可用，则优雅降级为纯代码块

**复制按钮实现：**

```css
pre {
  position: relative;
}
pre .copy-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  opacity: 0;
  transition: opacity 0.15s;
  padding: 0.2rem 0.5rem;
  font-size: 0.7rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-muted);
}
pre:hover .copy-btn {
  opacity: 1;
}
pre .copy-btn.copied {
  color: var(--success);
}
```

**CSS 设计令牌：**

```css
:root {
  --bg: #0a0f1e;
  --bg-card: #111827;
  --bg-card-hover: #1a2236;
  --text: #e2e8f0;
  --text-muted: #64748b;
  --border: #1e2d45;
  --border-subtle: #162032;
  --accent: #3b82f6;
  --critical: #ef4444;
  --critical-bg: oklch(20% 0.05 25);
  --warning: #f59e0b;
  --warning-bg: oklch(20% 0.05 80);
  --info: #3b82f6;
  --info-bg: oklch(20% 0.05 240);
  --success: #22c55e;
  --radius: 8px;
  --radius-sm: 4px;
  --font-mono: "JetBrains Mono", "Fira Code", ui-monospace, monospace;
  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
}
[data-theme="light"] {
  --bg: #f8fafc;
  --bg-card: #ffffff;
  --bg-card-hover: #f1f5f9;
  --text: #0f172a;
  --text-muted: #64748b;
  --border: #e2e8f0;
  --border-subtle: #f1f5f9;
  --critical-bg: #fef2f2;
  --warning-bg: #fffbeb;
  --info-bg: #eff6ff;
}
```

**排版与间距：**

```css
body {
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.6;
}
h1 {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}
h2 {
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}
h3 {
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}
code {
  font-family: var(--font-mono);
  font-size: 0.85em;
  padding: 0.1em 0.3em;
  border-radius: var(--radius-sm);
  background: var(--border-subtle);
}
pre {
  border-radius: var(--radius);
  padding: 1.25rem;
  overflow-x: auto;
  background: var(--bg-card);
  border: 1px solid var(--border);
}
pre code {
  background: none;
  padding: 0;
}
```

**Finding 卡片设计——极简、突出留白：**

```css
.finding {
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 1.25rem 1.5rem;
  margin-bottom: 1rem;
  background: var(--bg-card);
}
.finding-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.badge {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 0.15rem 0.5rem;
  border-radius: 3px;
  text-transform: uppercase;
}
.badge-critical {
  background: var(--critical-bg);
  color: var(--critical);
}
.badge-warning {
  background: var(--warning-bg);
  color: var(--warning);
}
.badge-info {
  background: var(--info-bg);
  color: var(--info);
}
.finding-title {
  font-weight: 600;
  font-size: 0.95rem;
}
.finding-body {
  color: var(--text-muted);
  font-size: 0.875rem;
}
.finding-fix {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-subtle);
  font-size: 0.875rem;
}
```

**HTML 结构骨架：**

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
  <head>
    ...
  </head>
  <body>
    <nav class="sidebar"><!-- section links --></nav>
    <main>
      <header><!-- agent, skill, timestamp, target --></header>
      <section id="summary">...</section>
      <section id="findings">...</section>
      <section id="metrics">...</section>
      <section id="diagrams">...</section>
      <section id="timeline">...</section>
      <section id="actions">...</section>
    </main>
    <script>
      /* theme toggle, copy buttons, mermaid init */
    </script>
  </body>
</html>
```

### 第 3 步：保存并打开

1. 将 HTML 文件保存到 `{repo}/.reports/{agent}-{skill}-{YYYY-MM-DD-HHmm}.html`
2. 如果 `.reports/` 目录不存在，则创建该目录
3. 在默认浏览器中打开报告：
   - macOS：`open {path}`
   - Linux：`xdg-open {path}`

### 第 4 步：展示 CLI 摘要

```
╭─ ATLAS ── atlas-report ───────────────────────╮

  ## Report generated

  **Source:** {agent} / {skill}
  **Target:** {repo or service name}
  **Saved:** .reports/{agent}-{skill}-{YYYY-MM-DD-HHmm}.html

  ### Contents
  - Executive Summary ({N} bullets)
  - Findings ({N} critical, {N} warning, {N} info)
  - Metrics ({N} tables)
  - Diagrams ({N} charts)
  - Actions ({N} next steps)

  → Opened in browser

╰────────────────────────────────────────────────╯
```

## 关键规则

- **自包含 HTML** —— 报告必须能够离线运行（图表使用 Mermaid CDN 时除外）
- **HTML 报告中绝不截断发现项** —— 完整详细信息应保留在此处；CLI 摘要是压缩版本
- **严重性颜色与输出套件保持一致** —— `■` 为红色，`▲` 为琥珀色，`●` 为蓝色，并在 CLI 和 HTML 中保持一致
- **Mermaid 优雅降级** —— 如果无法访问 CDN，图表应回退为带样式的代码块
- **省略空章节** —— 不要渲染没有内容的章节
- **不得使用 Tonone 品牌** —— 渲染后的 HTML 中不得包含页脚署名、“powered by”或智能体作者署名。报告属于仓库，而不是工具
- **行内代码不得添加复制按钮** —— 仅对 `<pre>` 块添加复制按钮，并且只在悬停时显示。行内 `<code>` 永远不得添加复制按钮