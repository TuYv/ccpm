---
name: generative-ui
description: >
  Design system and guidelines for Claude's built-in generative UI — the show_widget tool that renders
  interactive HTML/SVG widgets inline in claude.ai conversations. This skill provides the complete
  Anthropic "Imagine" design system so Claude produces high-quality widgets without needing to call
  read_me first. Use this skill whenever the user asks to visualize data, create an interactive chart,
  build a dashboard, render a diagram, draw a flowchart, show a mockup, create an interactive explainer,
  or produce any visual content beyond plain text or markdown. Triggers include: "show me", "visualize",
  "draw", "chart", "dashboard", "diagram", "flowchart", "widget", "interactive", "mockup", "illustrate",
  "explain how X works" (with visual), or any request for visual/interactive output. Also triggers
  when the user wants to display financial data visually, create comparison grids, or build tools
  with sliders, toggles, or live-updating displays.
---
# 生成式 UI Skill

此 Skill 包含 Claude 内置 `show_widget` 工具的完整设计系统——该生成式 UI 功能可在 claude.ai 对话中以内联方式渲染交互式 HTML/SVG 小组件。以下指南是 Anthropic 实际采用的“Imagine — Visual Creation Suite”设计规则，经提取整理后，你无需调用 `read_me` 进行设置，即可直接制作高质量的小组件。

**工作原理**：在 claude.ai 上，Claude 可以使用 `show_widget` 工具，在对话中以内联方式渲染原始 HTML/SVG 片段。此 Skill 提供了妥善使用该工具所需的设计系统、模板和模式。

---

## 第 1 步：选择合适的视觉类型

应根据**动词**而非名词进行选择。同一主题会因用户提出的要求不同而采用不同的视觉形式：

| 用户所说的内容 | 类型 | 格式 |
|---|---|---|
| “X 如何工作” | 说明性图解 | SVG |
| “X 的架构” | 结构图 | SVG |
| “有哪些步骤” | 流程图 | SVG |
| “解释复利” | 交互式讲解 | HTML |
| “比较这些选项” | 对比网格 | HTML |
| “显示收入图表” | Chart.js 图表 | HTML |
| “创建联系人卡片” | 数据记录 | HTML |
| “画一幅日落” | 艺术作品/插图 | SVG |

---

## 第 2 步：构建小组件

### 结构（严格遵循顺序）

```
<style>  →  HTML content  →  <script>
```

输出会逐个 token 流式生成。样式必须先于其所作用的元素存在，而脚本必须在 DOM 就绪后运行。

### 设计理念

- **无缝**：用户不应察觉宿主 UI 在哪里结束、你的小组件从哪里开始
- **扁平**：不得使用渐变、网格背景、噪点纹理或装饰性效果。采用简洁的纯色表面
- **紧凑**：以内联方式展示核心内容，其余内容通过文本说明
- **文本写在回复中，视觉内容放在工具中**——所有解释性文本、描述和摘要都必须作为普通回复文本写在工具调用之外。工具输出应当只包含视觉元素

### 核心规则

- 不得使用 `<!-- comments -->` 或 `/* comments */`（浪费 token，并会破坏流式输出）
- 字体大小不得低于 11px
- 不得使用 emoji——应改用 CSS 形状或 SVG 路径
- 不得使用渐变、投影、模糊、辉光或霓虹效果
- 外层容器不得使用深色或彩色背景（只能使用透明背景——背景由宿主提供）
- **字体排印**：只使用两种字重：400 常规和 500 中等。绝不使用 600 或 700。标题：h1=22px、h2=18px、h3=16px——字重均为 500。正文文本=16px、字重 400、行高 1.7
- **始终使用句首字母大写格式**。绝不使用标题式大小写，也不使用全大写
- 不得在句子中间使用粗体——实体名称应使用 `code style`，而不是**粗体**
- 不得使用 `<!DOCTYPE>`、`<html>`、`<head>` 或 `<body>`——只使用内容片段
- 不得使用 `position: fixed`——应采用正常文档流布局
- 流式输出期间不得使用标签页、轮播组件或 `display: none` 区块
- 不得使用嵌套滚动——高度应自动适应
- 圆角：卡片使用 `border-radius: var(--border-radius-lg)`，元素使用 `var(--border-radius-md)`
- 单边边框（border-left、border-top）不得使用圆角
- **对每个显示的数字进行舍入**——使用 `Math.round()`、`.toFixed(n)` 或 `Intl.NumberFormat`

### CDN 允许列表（由 CSP 强制执行）

外部资源只能从以下来源加载：
- `cdnjs.cloudflare.com`
- `cdn.jsdelivr.net`
- `unpkg.com`
- `esm.sh`

所有其他来源均会被阻止——请求将静默失败。

### CSS 变量

**背景**：`--color-background-primary`（白色）、`-secondary`（表面）、`-tertiary`（页面背景）、`-info`、`-danger`、`-success`、`-warning`
**文本**：`--color-text-primary`（黑色）、`-secondary`（弱化文本）、`-tertiary`（提示文本）、`-info`、`-danger`、`-success`、`-warning`
**边框**：`--color-border-tertiary`（0.15α，默认）、`-secondary`（0.3α，悬停）、`-primary`（0.4α）、语义化的 `-info/-danger/-success/-warning`
**排版**：`--font-sans`、`--font-serif`、`--font-mono`
**布局**：`--border-radius-md`（8px）、`--border-radius-lg`（12px）、`--border-radius-xl`（16px）

所有变量都会自动适配浅色/深色模式。

**必须支持深色模式**——每种颜色都必须在两种模式下正常显示：
- 在 HTML 中：文本始终使用 CSS 变量。切勿硬编码 `color: #333` 之类的颜色
- 在 SVG 中：使用预置的颜色类（`c-blue`、`c-teal` 等）——它们会自动适配浅色/深色模式
- 心理测试：如果背景接近黑色，每个文本元素是否仍然清晰可读？

### `sendPrompt(text)`

一个全局函数，可像用户输入消息一样将消息发送到聊天中。当用户的下一步适合由 Claude 思考时使用它。筛选、排序、切换和计算应改用 JS 处理。

---

## 第 3 步：使用 `show_widget` 渲染

`show_widget` 工具内置于 claude.ai 中——无需激活。直接传入你的小组件代码：

```json
{
  "title": "snake_case_widget_name",
  "widget_code": "<style>...</style>\n<div>...</div>\n<script>...</script>"
}
```

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `title` | string | 是 | 小组件的蛇形命名标识符 |
| `widget_code` | string | 是 | HTML 或 SVG 代码。对于 SVG：以 `<svg>` 开头。对于 HTML：使用内容片段 |

对于 SVG 输出：让 `widget_code` 以 `<svg` 开头——系统会自动检测并进行适当封装。

---

## 第 4 步：Chart.js 模板

对于图表，使用 `onload` 回调模式来处理脚本加载顺序：

```html
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px;">
  <div style="background: var(--color-background-secondary); border-radius: var(--border-radius-md); padding: 1rem;">
    <div style="font-size: 13px; color: var(--color-text-secondary);">Label</div>
    <div style="font-size: 24px; font-weight: 500;" id="stat1">—</div>
  </div>
</div>

<div style="position: relative; width: 100%; height: 300px; margin-top: 1rem;">
  <canvas id="myChart"></canvas>
</div>

<div style="display: flex; align-items: center; gap: 12px; margin-top: 1rem;">
  <label style="font-size: 14px; color: var(--color-text-secondary);">Parameter</label>
  <input type="range" min="0" max="100" value="50" id="param" step="1" style="flex: 1;" />
  <span style="font-size: 14px; font-weight: 500; min-width: 32px;" id="param-out">50</span>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.5.1/chart.umd.js" onload="initChart()"></script>
<script>
function initChart() {
  const slider = document.getElementById('param');
  const out = document.getElementById('param-out');
  let chart = null;

  function update() {
    const val = parseFloat(slider.value);
    out.textContent = val;
    document.getElementById('stat1').textContent = val.toFixed(1);

    const labels = [], data = [];
    for (let x = 0; x <= 100; x++) {
      labels.push(x);
      data.push(x * val / 100);
    }

    if (chart) chart.destroy();
    chart = new Chart(document.getElementById('myChart'), {
      type: 'line',
      data: { labels, datasets: [{ data, borderColor: '#7F77DD', borderWidth: 2, pointRadius: 0, fill: false }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false } } }
      }
    });
  }

  slider.addEventListener('input', update);
  update();
}
if (window.Chart) initChart();
</script>
```

**Chart.js 规则：**
- Canvas 无法解析 CSS 变量——请使用硬编码的十六进制颜色值
- 高度只能设置在外层包装 div 上，切勿设置在 canvas 本身上
- 始终设置 `responsive: true, maintainAspectRatio: false`
- 始终禁用默认图例，并构建自定义 HTML 图例
- 数字格式：使用 `-$5M`，而不是 `$-5M`（负号应位于货币符号之前）
- 在 CDN script 标签上使用 `onload="initChart()"`，并使用 `if (window.Chart) initChart();` 作为后备方案

---

## 第 5 步：SVG 图表模板

对于流程图和示意图，请使用带有预构建类的 SVG：

```svg
<svg width="100%" viewBox="0 0 680 H">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>

  <!-- Single-line node (44px tall) -->
  <g class="node c-blue" onclick="sendPrompt('Tell me more about this')">
    <rect x="250" y="40" width="180" height="44" rx="8" stroke-width="0.5"/>
    <text class="th" x="340" y="62" text-anchor="middle" dominant-baseline="central">Step one</text>
  </g>

  <!-- Connector arrow -->
  <line x1="340" y1="84" x2="340" y2="120" class="arr" marker-end="url(#arrow)"/>

  <!-- Two-line node (56px tall) -->
  <g class="node c-teal" onclick="sendPrompt('Explain this step')">
    <rect x="230" y="120" width="220" height="56" rx="8" stroke-width="0.5"/>
    <text class="th" x="340" y="140" text-anchor="middle" dominant-baseline="central">Step two</text>
    <text class="ts" x="340" y="158" text-anchor="middle" dominant-baseline="central">Processes the input</text>
  </g>
</svg>
```

**SVG 规则：**
- ViewBox 宽度始终为 680px（`viewBox="0 0 680 H"`）。将 H 设置为能够容纳内容并额外留出 40px 内边距的值
- 安全区域：x=40 到 x=640，y=40 到 y=(H-40)
- 预构建类：`t`（14px）、`ts`（12px 辅助文本）、`th`（14px medium 500）、`box`、`node`、`arr`、`c-{color}`
- 每个 `<text>` 元素都必须带有一个类（`t`、`ts` 或 `th`）
- 使用 `dominant-baseline="central"` 实现方框内文本的垂直居中
- 连接线路径需要设置 `fill="none"`（SVG 默认为 `fill: black`）
- 描边宽度：边框和边线均为 0.5px
- 让所有节点均可点击：`onclick="sendPrompt('...')"`

---

## 第 6 步：交互式讲解模板

对于交互式讲解内容（滑块、实时计算、内联 SVG）：

```html
<div style="display: flex; align-items: center; gap: 12px; margin: 0 0 1.5rem;">
  <label style="font-size: 14px; color: var(--color-text-secondary);">Years</label>
  <input type="range" min="1" max="40" value="20" id="years" style="flex: 1;" />
  <span style="font-size: 14px; font-weight: 500; min-width: 24px;" id="years-out">20</span>
</div>

<div style="display: flex; align-items: baseline; gap: 8px; margin: 0 0 1.5rem;">
  <span style="font-size: 14px; color: var(--color-text-secondary);">$1,000 →</span>
  <span style="font-size: 24px; font-weight: 500;" id="result">$3,870</span>
</div>

<div style="margin: 2rem 0; position: relative; height: 240px;">
  <canvas id="chart"></canvas>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.5.1/chart.umd.js" onload="initChart()"></script>
<script>
function initChart() {
  // slider logic, chart rendering, sendPrompt() for follow-ups
}
if (window.Chart) initChart();
</script>
```

使用 `sendPrompt()` 让用户提出后续问题：`sendPrompt('What if I increase the rate to 10%?')`

---

## 第 7 步：回复用户

渲染微件后，简要说明：
1. 微件展示了什么
2. 如何与其交互（各控件分别有什么作用）
3. 从数据中得出的一项关键洞察

保持简洁——微件本身足以说明一切。

---

## 参考文件

- `references/design_system.md` — 完整的调色板（9 个色阶 × 7 个梯度）、CSS 变量、UI 组件模式、指标卡片、布局规则
- `references/svg_and_diagrams.md` — SVG viewBox 设置、字体校准、预构建类，以及带有示例的流程图/结构图/说明性图表模式
- `references/chart_js.md` — Chart.js 配置、脚本加载顺序、画布尺寸、图例模式、仪表板布局

当你需要特定的设计令牌、SVG 坐标计算或 Chart.js 配置细节时，请阅读相关的参考文件。