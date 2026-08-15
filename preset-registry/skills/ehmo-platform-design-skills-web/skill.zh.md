---
name: web-design-guidelines
description: Web platform design and accessibility guidelines. Use when building web interfaces, auditing accessibility, implementing responsive layouts, or reviewing web UI code. Triggers on tasks involving HTML, CSS, web components, WCAG compliance, responsive design, or web performance.
license: MIT
metadata:
  author: platform-design-skills
  version: "1.0.0"
---
# Web 平台设计指南

面向无障碍、高性能、响应式 Web 界面的框架无关规则。基于 WCAG 2.2、MDN Web Docs 和现代 Web 平台 API。

---

## 1. 无障碍 / WCAG [关键]

无障碍并非可选项。本节中的大多数规则对应 WCAG 2.2 的 A 级或 AA 级成功标准。少量最佳实践规则（在正文中注明）以 AAA 级为目标，或超出 WCAG 的要求。

### 1.1 使用语义化 HTML 元素

按照元素的预期用途使用它们。语义化结构能够自然提供无障碍、SEO 和阅读器模式支持。

| 元素 | 用途 |
|---------|---------|
| `<main>` | 页面主要内容（每个页面一个） |
| `<nav>` | 导航区块 |
| `<header>` | 介绍性内容或导航辅助内容 |
| `<footer>` | 最近的分区内容的页脚 |
| `<article>` | 自包含、可独立分发的内容 |
| `<section>` | 带有标题的主题内容分组 |
| `<aside>` | 间接相关的内容（侧边栏、提示框） |
| `<figure>` / `<figcaption>` | 插图、图表、代码清单 |
| `<details>` / `<summary>` | 可展开/折叠的披露控件 |
| `<dialog>` | 模态或非模态对话框 |
| `<time>` | 机器可读的日期/时间 |
| `<mark>` | 高亮显示/被引用的文本 |
| `<address>` | 最近的文章/文档正文的联系信息 |

```html
<!-- Good -->
<main>
  <article>
    <h1>Article Title</h1>
    <p>Content...</p>
  </article>
  <aside>Related links</aside>
</main>

<!-- Bad: div soup -->
<div class="main">
  <div class="article">
    <div class="title">Article Title</div>
    <div class="content">Content...</div>
  </div>
</div>
```

**反模式**：将 `<div>` 或 `<span>` 用于交互式元素。当已有 `<button>` 可用时，绝不要编写 `<div onclick>`。

### 1.2 交互式元素上的 ARIA 标签

每个交互式元素都必须具有无障碍名称。优先使用可见文本；仅当可见文本不足时，才使用 `aria-label` 或 `aria-labelledby`（SC 4.1.2）。

```html
<!-- Icon-only button: needs aria-label -->
<button aria-label="Close dialog">
  <svg aria-hidden="true">...</svg>
</button>

<!-- Linked by labelledby -->
<h2 id="section-title">Notifications</h2>
<ul aria-labelledby="section-title">...</ul>

<!-- Redundant: visible text is enough -->
<button>Save Changes</button> <!-- No aria-label needed -->
```

### 1.3 键盘导航

所有交互式元素都必须能够通过键盘访问和操作（SC 2.1.1）。

- 使用默认支持键盘访问的原生交互式元素（`<button>`、`<a href>`、`<input>`、`<select>`）。
- 自定义控件需要使用 `tabindex="0"` 进入 Tab 键顺序，并使用 keydown 处理程序进行激活。
- 绝不要使用大于 0 的 `tabindex` 值。
- 将焦点限制在模态框内部；关闭时恢复焦点。

```js
// Focus trap for modal
dialog.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    const focusable = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
```

### 1.4 可见的焦点指示器

绝不要在未提供可见替代样式的情况下移除焦点轮廓（WCAG 2.2 中的 SC 2.4.7，以及增强的 SC 2.4.11（AA）和 SC 2.4.12（AAA））。

```css
/* Good: custom focus indicator */
:focus-visible {
  outline: 3px solid var(--focus-color, #4A90D9);
  outline-offset: 2px;
}

/* Remove default only when :focus-visible is supported */
:focus:not(:focus-visible) {
  outline: none;
}

/* Bad: removing all focus styles */
/* *:focus { outline: none; } */
```

WCAG 2.2 要求焦点指示器的最小面积不小于组件周长乘以 2px，并且与相邻颜色之间的对比度至少为 3:1。

### 1.5 跳过导航链接

提供一种机制来跳过重复的内容块（SC 2.4.1）。

```html
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <nav>...</nav>
  <main id="main-content">...</main>
</body>
```

```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  z-index: 1000;
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: var(--color-on-primary);
}
.skip-link:focus {
  top: 0;
}
```

### 1.6 图像的替代文本

每个 `<img>` 都必须具有 `alt` 属性（SC 1.1.1）。

- **信息性图像**：描述其内容和功能。`alt="Bar chart showing sales doubled in Q4"`。
- **装饰性图像**：使用 `alt=""`（空字符串），以便屏幕阅读器跳过这些图像。
- **功能性图像**（位于链接/按钮内）：描述其操作。`alt="Search"`。
- **复杂图像**：使用 `alt` 提供简短描述，并链接到详细描述或使用 `<figcaption>`。

```html
<img src="chart.png" alt="Revenue chart: Q1 $2M, Q2 $2.4M, Q3 $3.1M, Q4 $4.5M">
<img src="decorative-wave.svg" alt="">
```

### 1.7 颜色对比度

保持最低对比度（SC 1.4.3、1.4.6、1.4.11）。

| 内容 | 最低对比度 |
|---------|--------------|
| 普通文本（<24px / 粗体 <18.66px） | 4.5:1 |
| 大文本（>=24px / 粗体 >=18.66px） | 3:1 |
| UI 组件和图形对象 | 3:1 |

不要仅依赖颜色来传达信息（SC 1.4.1）。应将颜色与图标、文本或图案搭配使用。

```css
/* Check contrast of these tokens */
:root {
  --text-primary: #1a1a2e;    /* on white: ~16:1 */
  --text-secondary: #555770;  /* on white: ~6.5:1 */
  --text-disabled: #767693;   /* on white: ~4.5:1, borderline */
}
```

### 1.8 表单标签

每个表单输入控件都必须具有以编程方式关联的标签（SC 1.3.1、3.3.2）。

```html
<!-- Explicit label (preferred) -->
<label for="email">Email address</label>
<input id="email" type="email" autocomplete="email">

<!-- Implicit label (acceptable) -->
<label>
  Email address
  <input type="email" autocomplete="email">
</label>

<!-- Never: placeholder as sole label -->
<!-- <input placeholder="Email"> -->
```

### 1.9 错误标识

以文本形式标识并描述错误（SC 3.3.1）。使用 `aria-describedby` 或 `aria-errormessage` 将错误消息与输入控件关联起来。

```html
<label for="email">Email</label>
<input id="email" type="email" aria-describedby="email-error" aria-invalid="true">
<p id="email-error" role="alert">Enter a valid email address, e.g. name@example.com</p>
```

### 1.10 ARIA 实时区域

向屏幕阅读器播报动态内容的变化（SC 4.1.3）。

```html
<!-- Polite: announced when user is idle -->
<div aria-live="polite" aria-atomic="true">
  3 results found
</div>

<!-- Assertive: interrupts current speech -->
<div role="alert">
  Your session will expire in 2 minutes.
</div>

<!-- Status messages -->
<div role="status">
  File uploaded successfully.
</div>
```

默认使用 `aria-live="polite"`。仅将 `role="alert"` / `aria-live="assertive"` 用于时间敏感的警告。

### 1.11 ARIA 角色快速参考

| 角色 | 用途 | 原生等效元素 |
|------|---------|-------------------|
| `button` | 可点击操作 | `<button>` |
| `link` | 导航 | `<a href>` |
| `tab` / `tablist` / `tabpanel` | 选项卡界面 | 无 |
| `dialog` | 模态框 | `<dialog>` |
| `alert` | 强提示实时区域 | 无 |
| `status` | 礼貌提示实时区域 | `<output>` |
| `navigation` | 导航地标 | `<nav>` |
| `main` | 主体地标 | `<main>` |
| `complementary` | 补充内容地标 | `<aside>` |
| `search` | 搜索地标 | `<search>`（HTML5） |
| `img` | 图像 | `<img>` |
| `list` / `listitem` | 列表 | `<ul>/<li>` |
| `heading` | 标题（配合 `aria-level`） | `<h1>`-`<h6>` |
| `menu` / `menuitem` | 菜单组件 | 无 |
| `tree` / `treeitem` | 树视图 | 无 |
| `grid` / `row` / `gridcell` | 数据网格 | `<table>` |
| `progressbar` | 进度 | `<progress>` |
| `slider` | 范围输入 | `<input type="range">` |
| `switch` | 开关 | `<input type="checkbox">` |

**规则**：优先使用原生 HTML，而非 ARIA。仅当相应模式不存在原生元素时才使用 ARIA。

### 1.12 名称中的标签（WCAG 2.5.3 A 级）

当交互式元素包含可见文本时，其无障碍名称必须将该可见文本作为子字符串包含在内（SC 2.5.3）。语音控制用户（Dragon NaturallySpeaking、macOS Voice Control）通过说出可见标签来激活控件。如果 `aria-label` 替换了可见文本或与其矛盾，语音命令将会失败。

```html
<!-- Correct: aria-label contains visible text as substring -->
<button aria-label="Delete item from cart">Delete</button>

<!-- Correct: no aria-label needed — visible text is the accessible name -->
<button>Save Changes</button>

<!-- Correct: icon button — no visible text, aria-label is fine -->
<button aria-label="Close dialog">
  <svg aria-hidden="true">...</svg>
</button>
```

```html
<!-- Incorrect: aria-label overrides visible text with different text -->
<button aria-label="Remove">Delete</button>

<!-- Incorrect: aria-label does not contain visible "Submit" -->
<button aria-label="Proceed to next step">Submit</button>
```

**规则**：当存在可见文本时，`aria-label` 必须包含该可见文本（逐字一致，不区分大小写）。当可见文本已经足够时，最好完全不使用 `aria-label`。

---

## 2. 响应式设计 [关键]

### 2.1 移动端优先方法

为最小视口编写基础样式。使用 `min-width` 媒体查询逐层增加复杂度。

```css
/* Base: mobile */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Tablet */
@media (min-width: 48rem) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 64rem) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### 2.2 使用现代 CSS 函数实现流式布局

使用 `clamp()`、`min()` 和 `max()` 实现无需断点的流式尺寸调整。

```css
/* Fluid typography */
h1 {
  font-size: clamp(1.75rem, 1.2rem + 2vw, 3rem);
}

/* Fluid spacing */
.section {
  padding: clamp(1.5rem, 4vw, 4rem);
}

/* Fluid container */
.container {
  width: min(90%, 72rem);
  margin-inline: auto;
}
```

### 2.3 容器查询

根据组件所在容器而非视口的尺寸来设置组件大小。

```css
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
  }
}

@container card (min-width: 700px) {
  .card {
    grid-template-columns: 300px 1fr;
    gap: 2rem;
  }
}
```

### 2.4 基于内容的断点

在内容布局发生错乱的位置设置断点，而不是根据设备宽度设置。常见的起始点：

```css
/* Content-based, not "iPhone" or "iPad" */
@media (min-width: 30rem)  { /* ~480px: single column gets cramped */ }
@media (min-width: 48rem)  { /* ~768px: room for 2 columns */ }
@media (min-width: 64rem)  { /* ~1024px: room for sidebar + content */ }
@media (min-width: 80rem)  { /* ~1280px: wide multi-column */ }
```

### 2.5 触摸目标

触摸目标的最小尺寸为 44x44 CSS 像素（WCAG SC 2.5.5 AAA；SC 2.5.8 在 AA 级别仅要求 24x24px）。相邻目标之间应至少留出 24px 的间距。

```css
button, a, input, select, textarea {
  min-height: 44px;
  min-width: 44px;
}

/* Enlarge tap area without changing visual size */
.icon-button {
  position: relative;
  width: 24px;
  height: 24px;
}
.icon-button::after {
  content: "";
  position: absolute;
  inset: -10px; /* expands clickable area */
}
```

### 2.6 视口 Meta 标签

始终在文档的 `<head>` 中包含：

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

切勿使用 `maximum-scale=1` 或 `user-scalable=no`——它们会破坏双指缩放的无障碍功能（SC 1.4.4）。

### 2.7 禁止水平滚动

内容必须能在 320px 宽度下自动重排，且不出现水平滚动（SC 1.4.10）。

```css
/* Prevent overflow */
img, video, iframe, svg {
  max-width: 100%;
  height: auto;
}

/* Contain long words/URLs */
.prose {
  overflow-wrap: break-word;
}

/* Tables: scroll container, not page */
.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
```

---

## 3. 表单 [高]

### 3.1 为每个输入框添加标签

每个输入框都需要一个可见且通过程序与其关联的标签。请参阅第 1.8 节。

### 3.2 自动填充属性

为常见字段使用 `autocomplete`，以启用浏览器自动填充功能（SC 1.3.5）。

```html
<input type="text" autocomplete="name" name="full-name">
<input type="email" autocomplete="email" name="email">
<input type="tel" autocomplete="tel" name="phone">
<input type="text" autocomplete="street-address" name="address">
<input type="text" autocomplete="postal-code" name="zip">
<input type="text" autocomplete="cc-name" name="card-name">
<input type="text" autocomplete="cc-number" name="card-number">
<input type="password" autocomplete="new-password" name="password">
<input type="password" autocomplete="current-password" name="current-pw">
```

### 3.3 正确的输入类型

使用正确的 `type`，以触发适当的移动端键盘和原生验证。

| 类型 | 用途 |
|------|---------|
| `email` | 电子邮件地址 |
| `tel` | 电话号码 |
| `url` | URL |
| `number` | 带有增减控件的数值（不适用于电话号码、邮政编码、银行卡号） |
| `search` | 搜索字段（显示清除按钮） |
| `date` / `time` / `datetime-local` | 时间相关值 |
| `password` | 密码（触发密码管理器） |
| 带有 `inputmode="numeric"` 的 `text` | 不带增减控件的数字数据（PIN、邮政编码） |

```html
<input type="tel" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code">
```

### 3.4 内联验证

在 `blur` 时进行验证（而不是每次按键时）。显示成功和错误状态。

```html
<div class="field" data-state="error">
  <label for="username">Username</label>
  <input id="username" type="text" aria-describedby="username-hint username-error" aria-invalid="true">
  <p id="username-hint" class="hint">3-20 characters, letters and numbers only</p>
  <p id="username-error" class="error" role="alert">Username must be at least 3 characters</p>
</div>
```

```css
.field[data-state="error"] input {
  border-color: var(--color-error);
  box-shadow: 0 0 0 1px var(--color-error);
}
.field[data-state="error"] .error { display: block; }
.field:not([data-state="error"]) .error { display: none; }
```

### 3.5 使用 Fieldset 和 Legend 对字段分组

使用 `<fieldset>` 对相关输入项进行分组，并使用 `<legend>` 为该组添加标签。

```html
<fieldset>
  <legend>Shipping Address</legend>
  <label for="street">Street</label>
  <input id="street" type="text" autocomplete="street-address">
  <!-- ... -->
</fieldset>

<fieldset>
  <legend>Preferred contact method</legend>
  <label><input type="radio" name="contact" value="email"> Email</label>
  <label><input type="radio" name="contact" value="phone"> Phone</label>
</fieldset>
```

### 3.6 必填字段标识

通过视觉和编程方式标明必填字段。使用 `required` 属性和可见标记。

```html
<label for="name">
  Full name <span aria-hidden="true">*</span>
  <span class="sr-only">(required)</span>
</label>
<input id="name" type="text" required autocomplete="name">
```

如果大多数字段都是必填项，则改为标明哪些字段是可选项。

### 3.7 提交按钮状态

不要禁用提交按钮。应在提交时进行验证并显示错误。

```html
<!-- Good: always enabled, validate on submit -->
<button type="submit">Create Account</button>

<!-- Bad: disabled button with no explanation -->
<!-- <button type="submit" disabled>Create Account</button> -->
```

禁用的按钮无法说明用户为何不能继续操作。如果必须禁用，请提供可见的解释。

### 3.8 将说明放在字段附近

通过提示文本和错误文本，将格式示例、约束条件和恢复说明放在相关字段旁边。切勿只在开头的说明文字中解释一次要求，并期望用户稍后仍能记住。

---

## 4. 排版 [高]

### 4.1 字体栈

使用系统字体栈以提升性能，或使用具有适当回退字体的 Web 字体。

```css
/* System font stack */
body {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* Monospace stack */
code, pre, kbd {
  font-family: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace;
}

/* Web font with fallbacks and size-adjust */
@font-face {
  font-family: "CustomFont";
  src: url("/fonts/custom.woff2") format("woff2");
  font-display: swap;
  font-weight: 100 900;
}
body {
  font-family: "CustomFont", system-ui, sans-serif;
}
```

### 4.2 相对单位

使用 `rem` 设置字号和间距。使用 `em` 设置相对于组件的尺寸。

```css
html {
  font-size: 100%; /* = 16px default, respects user preference */
}

body {
  font-size: 1rem;       /* 16px */
}

h1 { font-size: 2.5rem; }  /* 40px */
h2 { font-size: 2rem; }    /* 32px */
h3 { font-size: 1.5rem; }  /* 24px */
small { font-size: 0.875rem; } /* 14px */

/* Never: font-size: 16px; (ignores user zoom settings) */
```

### 4.3 行高和间距

正文文本的行高至少为 1.5（SC 1.4.12）。段落间距至少为字号的 2 倍。

```css
body {
  line-height: 1.6;
}

h1, h2, h3 {
  line-height: 1.2;
}

p + p {
  margin-top: 1em;
}
```

### 4.4 最大行长

将行长限制在约 75 个字符，以提高可读性。

```css
.prose {
  max-width: 75ch;
}

/* Or for a content column */
.content {
  max-width: 40rem; /* roughly 65-75ch depending on font */
  margin-inline: auto;
}
```

### 4.5 排版细节

使用真正的引号、正确的破折号，并为数据使用等宽数字。

```css
/* Smart quotes */
q { quotes: "\201C" "\201D" "\2018" "\2019"; } /* curly double then single */

/* Tabular numbers for aligned data */
.data-table td {
  font-variant-numeric: tabular-nums;
}

/* Oldstyle numbers for running prose (optional) */
.prose {
  font-variant-numeric: oldstyle-nums;
}

/* Proper list markers */
ul { list-style-type: disc; }
ol { list-style-type: decimal; }
```

### 4.6 标题层级

按顺序使用 `h1` 到 `h6`。切勿跳过层级。每个页面使用一个 `h1`。

```html
<!-- Good -->
<h1>Page Title</h1>
  <h2>Section</h2>
    <h3>Subsection</h3>
  <h2>Another Section</h2>

<!-- Bad: skipping h2 -->
<h1>Page Title</h1>
  <h3>Subsection</h3> <!-- Where is h2? -->
```

如果需要与标题层级不同的视觉样式，请使用 CSS 类：

```html
<h2 class="text-lg">Visually smaller but semantically h2</h2>
```

---

## 5. 性能 [高]

### 5.1 延迟加载首屏以下的图片

对于初始加载时不可见的图片，使用原生延迟加载。

```html
<!-- Above fold: load eagerly, add fetchpriority -->
<img src="hero.webp" alt="Hero image" fetchpriority="high" width="1200" height="600">

<!-- Below fold: lazy load -->
<img src="feature.webp" alt="Feature image" loading="lazy" width="600" height="400">
```

### 5.2 明确指定图片尺寸

始终指定 `width` 和 `height`，以防止布局偏移（CLS）。

```html
<img src="photo.webp" alt="Description" width="800" height="600">
```

```css
/* Responsive images with aspect ratio preservation */
img {
  max-width: 100%;
  height: auto;
}
```

### 5.3 资源提示

对第三方源使用 `preconnect`，对关键资源使用 `preload`。

```html
<head>
  <!-- Preconnect to critical third-party origins -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://cdn.example.com" crossorigin>

  <!-- Preload critical resources -->
  <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/css/critical.css" as="style">

  <!-- DNS prefetch for non-critical origins -->
  <link rel="dns-prefetch" href="https://analytics.example.com">
</head>
```

### 5.4 代码拆分

仅在需要时加载 JavaScript。使用动态 `import()` 进行基于路由和基于组件的拆分。

```js
// Route-based splitting
const routes = {
  '/dashboard': () => import('./pages/dashboard.js'),
  '/settings':  () => import('./pages/settings.js'),
};

// Interaction-based splitting
button.addEventListener('click', async () => {
  const { openEditor } = await import('./editor.js');
  openEditor();
});
```

### 5.5 虚拟化长列表

对于超过几百项的列表，仅渲染可见行。

```js
// Concept: virtual scrolling
// Render only items in viewport + buffer
const visibleStart = Math.floor(scrollTop / itemHeight);
const visibleEnd = visibleStart + Math.ceil(containerHeight / itemHeight);
const buffer = 5;
const renderStart = Math.max(0, visibleStart - buffer);
const renderEnd = Math.min(totalItems, visibleEnd + buffer);
```

### 5.6 避免布局抖动

批量执行 DOM 读取和写入操作。切勿将两者交错执行。

```js
// Bad: read-write-read-write (forces synchronous layout)
elements.forEach(el => {
  const height = el.offsetHeight;     // read
  el.style.height = height + 10 + 'px'; // write
});

// Good: batch reads, then batch writes
const heights = elements.map(el => el.offsetHeight); // all reads
elements.forEach((el, i) => {
  el.style.height = heights[i] + 10 + 'px'; // all writes
});
```

### 5.7 谨慎使用 `will-change`

仅将 `will-change` 应用于将要执行动画的元素，并在动画完成后将其移除。

```css
/* Good: scoped and temporary */
.card:hover {
  will-change: transform;
}
.card.animating {
  will-change: transform, opacity;
}

/* Bad: blanket will-change */
/* * { will-change: transform; } */
```

### 5.8 及时呈现等待状态

用户执行操作后，应立即确认新状态。如果工作无法在短时间内完成，则应显示进度、骨架屏、乐观式 UI 或 `aria-busy` 反馈，而不是让界面保持不变。

---

## 6. 动画与运动效果 [中等]

### 6.1 尊重 prefers-reduced-motion

始终提供减少动态效果的替代方案（SC 2.3.3，AAA 级）。

```css
/* Define animations normally */
.fade-in {
  animation: fadeIn 300ms ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Remove or reduce for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

```js
// Check in JavaScript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

### 6.2 合成器友好的动画

仅对 `transform` 和 `opacity` 设置动画，以实现流畅的 60fps 动画。这些动画在 GPU 合成器线程上运行。

```css
/* Good: compositor-only properties */
.slide-in {
  transition: transform 200ms ease-out, opacity 200ms ease-out;
}

/* Bad: triggers layout/paint */
.slide-in-bad {
  transition: left 200ms, width 200ms, height 200ms;
}
```

### 6.3 禁止闪烁内容

切勿让内容每秒闪烁超过 3 次（SC 2.3.1）。这可能诱发癫痫发作。

### 6.4 为状态变化添加过渡

为悬停、聚焦、打开/关闭以及其他状态变化使用过渡，以提供连贯性。

```css
.dropdown {
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 150ms ease-out, transform 150ms ease-out;
  pointer-events: none;
}
.dropdown.open {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
```

### 6.5 仅使用有意义的动效

动画应传达状态、引导注意力或展示空间关系。切勿仅出于装饰目的使用动画。

---

## 7. 深色模式和主题 [中等]

### 7.1 检测系统偏好

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0f0f17;
    --text: #e4e4ef;
    --surface: #1c1c2e;
    --border: #2e2e44;
  }
}
```

### 7.2 使用 CSS 自定义属性设置主题

将所有主题值定义为自定义属性。通过更改属性值切换主题。

```css
:root {
  color-scheme: light dark;

  /* Light theme (default) */
  --color-bg: #ffffff;
  --color-surface: #f5f5f7;
  --color-text-primary: #1a1a2e;
  --color-text-secondary: #555770;
  --color-border: #d1d1e0;
  --color-primary: #2563eb;
  --color-primary-text: #ffffff;
  --color-error: #dc2626;
  --color-success: #16a34a;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0f0f17;
    --color-surface: #1c1c2e;
    --color-text-primary: #e4e4ef;
    --color-text-secondary: #a0a0b8;
    --color-border: #2e2e44;
    --color-primary: #60a5fa;
    --color-primary-text: #0f0f17;
    --color-error: #f87171;
    --color-success: #4ade80;
  }
}
```

### 7.3 Color-Scheme 元标签

告知浏览器原生 UI 元素（滚动条、表单控件）支持的配色方案。

```html
<meta name="color-scheme" content="light dark">
```

### 7.4 在两种模式下保持对比度

验证浅色和深色模式下的对比度。深色模式经常存在深色表面上的文本对比度不足的问题。

### 7.5 自适应图像

为浅色和深色环境提供适当的图像。

```html
<picture>
  <source srcset="logo-dark.svg" media="(prefers-color-scheme: dark)">
  <img src="logo-light.svg" alt="Company logo">
</picture>
```

```css
/* Or use CSS filter for simple cases */
@media (prefers-color-scheme: dark) {
  .decorative-img {
    filter: brightness(0.9) contrast(1.1);
  }
}
```

### 7.6 尊重 prefers-contrast

使用 `@media (prefers-contrast: more)` 和 `@media (prefers-contrast: forced)` 遵循用户的对比度偏好。`prefers-contrast: more` 会响应 macOS/iOS“系统设置”中的“提高对比度”；`prefers-contrast: forced` 会响应 Windows 高对比度模式——这是一项独立的操作系统功能，会完全覆盖颜色。

```css
/* Default theme */
:root {
  --color-text: #555770;
  --color-border: #d1d1e0;
  --color-bg: #ffffff;
}

/* High contrast mode: stronger text and border colors */
@media (prefers-contrast: more) {
  :root {
    --color-text: #1a1a2e;       /* Darker text for higher ratio */
    --color-border: #1a1a2e;     /* Stronger borders */
    --color-bg: #ffffff;
  }

  /* Ensure interactive elements are clearly delineated */
  button, input, select, textarea {
    border: 2px solid currentColor;
  }
}

/* Forced colors (Windows High Contrast mode) */
@media (prefers-contrast: forced) {
  /* Use system color keywords to respect OS color palette */
  :root {
    --color-text: ButtonText;
    --color-bg: ButtonFace;
    --color-border: ButtonBorder;
  }
}
```

---

## 8. 导航和状态 [中等]

### 8.1 URL 反映状态

每个有意义的视图都应具有唯一的 URL。用户应能够为任何状态添加书签、分享和重新加载。

```js
// Update URL without full page reload
function updateFilters(filters) {
  const params = new URLSearchParams(filters);
  history.pushState(null, '', `?${params}`);
  renderResults(filters);
}

// Restore state from URL on load
const params = new URLSearchParams(location.search);
const initialFilters = Object.fromEntries(params);
```

### 8.2 浏览器后退/前进

处理 `popstate` 以支持浏览器导航。

```js
window.addEventListener('popstate', () => {
  const params = new URLSearchParams(location.search);
  renderResults(Object.fromEntries(params));
});
```

### 8.3 导航激活状态

在导航中指明当前页面或分区。为激活的链接使用 `aria-current="page"`。

```html
<nav aria-label="Main">
  <a href="/" aria-current="page">Home</a>
  <a href="/products">Products</a>
  <a href="/about">About</a>
</nav>
```

```css
[aria-current="page"] {
  font-weight: 700;
  border-bottom: 2px solid var(--color-primary);
}
```

### 8.4 面包屑导航

为层级较深的网站提供面包屑导航。

```html
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li><a href="/products/widgets" aria-current="page">Widgets</a></li>
  </ol>
</nav>
```

### 8.5 滚动位置恢复

管理 SPA 导航的滚动位置。

```js
// Disable browser auto-restoration for manual control
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Save scroll position before navigation
function saveScrollPosition() {
  sessionStorage.setItem(`scroll-${location.pathname}`, window.scrollY);
}

// Restore on back/forward
window.addEventListener('popstate', () => {
  const saved = sessionStorage.getItem(`scroll-${location.pathname}`);
  if (saved) {
    requestAnimationFrame(() => window.scrollTo(0, parseInt(saved)));
  }
});
```

---

## 9. 触摸和交互 [中等]

### 9.1 使用 Touch-Action 控制滚动

使用 `touch-action` 控制交互元素上的手势行为。

```css
/* Allow only vertical scrolling (disable horizontal pan and pinch-zoom) */
.vertical-scroll {
  touch-action: pan-y;
}

/* Carousel: horizontal scroll only */
.carousel {
  touch-action: pan-x;
}

/* Canvas/map: disable all browser gestures */
.canvas {
  touch-action: none;
}
```

### 9.2 点击高亮

控制移动端 WebKit 浏览器上的点击高亮效果。

```css
button, a {
  -webkit-tap-highlight-color: transparent;
}
```

### 9.3 悬停与焦点行为一致

每个悬停交互也必须支持键盘焦点。

```css
/* Always pair :hover with :focus-visible */
.card:hover,
.card:focus-visible {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}
```

### 9.4 禁止仅支持悬停的交互

切勿将必要功能隐藏在悬停状态下。触摸设备没有悬停状态。

```css
/* Bad: content only accessible on hover */
/* .tooltip { display: none; }
   .trigger:hover .tooltip { display: block; } */

/* Good: works with focus and click too */
.trigger:hover .tooltip,
.trigger:focus-within .tooltip,
.tooltip:focus-within {
  display: block;
}
```

### 9.5 为轮播使用滚动捕捉

为卡片轮播和水平列表使用 CSS 滚动捕捉。

```css
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 1rem;
  scroll-padding: 1rem;
}

.carousel > .slide {
  scroll-snap-align: start;
  flex: 0 0 min(85%, 400px);
}
```

---

## 10. 国际化 [中等]

### 10.1 dir 和 lang 属性

在 `<html>` 元素上设置 `lang`。对用户生成的内容使用 `dir="auto"`。

```html
<html lang="en" dir="ltr">

<!-- User-generated content: let browser detect direction -->
<p dir="auto">User-submitted text here</p>

<!-- Explicit override for known RTL content -->
<blockquote lang="ar" dir="rtl">...</blockquote>
```

### 10.2 使用 Intl API 进行格式化

使用 `Intl` API 进行区域设置感知的格式化。切勿硬编码日期或数字格式。

```js
// Dates
new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(date);
// "January 15, 2026"

// Numbers
new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(1234.56);
// "1.234,56 EUR"

// Relative time
new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-1, 'day');
// "yesterday"

// Lists
new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(['a', 'b', 'c']);
// "a, b, and c"

// Plurals
const pr = new Intl.PluralRules('en');
const suffixes = { one: 'st', two: 'nd', few: 'rd', other: 'th' };
function ordinal(n) { return `${n}${suffixes[pr.select(n)]}`; }
```

### 10.3 避免在图像中使用文本

图像中的文本无法翻译、调整大小或被屏幕阅读器读取。当需要带样式的文本叠加层时，请使用带背景图像的 HTML/CSS 文本。

### 10.4 CSS 逻辑属性

使用逻辑属性而非物理属性，以同时支持 LTR 和 RTL 布局。

```css
/* Physical (breaks in RTL) */
/* margin-left: 1rem; padding-right: 2rem; border-left: 1px solid; */

/* Logical (works in LTR and RTL) */
.sidebar {
  margin-inline-start: 1rem;
  padding-inline-end: 2rem;
  border-inline-start: 1px solid var(--color-border);
}

.stack > * + * {
  margin-block-start: 1rem;
}

/* Logical shorthands */
.box {
  margin-inline: auto;     /* left + right */
  padding-block: 2rem;     /* top + bottom */
  inset-inline-start: 0;   /* left in LTR, right in RTL */
  border-start-start-radius: 8px; /* top-left in LTR, top-right in RTL */
}
```

| 物理属性 | 逻辑属性 |
|----------|---------|
| `left` / `right` | `inline-start` / `inline-end` |
| `top` / `bottom` | `block-start` / `block-end` |
| `margin-left` | `margin-inline-start` |
| `padding-right` | `padding-inline-end` |
| `border-top-left-radius` | `border-start-start-radius` |
| `width` | `inline-size` |
| `height` | `block-size` |
| `text-align: left` | `text-align: start` |

### 10.5 RTL 布局支持

在 RTL 模式下测试布局。配合逻辑属性使用时，Flexbox 和 Grid 会自动处理 RTL。

```css
/* This layout works in both LTR and RTL without changes */
.layout {
  display: flex;
  gap: 1rem;
}

/* Icons that indicate direction need flipping */
[dir="rtl"] .arrow-icon {
  transform: scaleX(-1);
}
```

---

## 11. 渐进式 Web 应用 [中等]

PWA 允许 Web 应用安装并离线运行。构建可安装的 Web 应用时，遵循以下规则可确保体验一致且可靠。

### 11.1 提供完整的 Web 应用清单

提供一个从 `<head>` 链接的 `manifest.json`，其中包含实现可安装性所需的全部字段。缺少字段会在没有任何提示的情况下阻止安装提示出现。

```html
<link rel="manifest" href="/manifest.json">
```

```json
{
  "name": "My App",
  "short_name": "App",
  "start_url": "/",
  "display": "standalone",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**错误：**
```json
{
  "name": "My App"
  // Missing start_url, display, and icons — app is not installable
}
```

### 11.2 设置 theme_color 和 background_color

`theme_color` 用于设置浏览器界面和操作系统任务切换器的色调。`background_color` 用于在应用加载前填充启动画面。两者都必须与品牌颜色一致。

```json
{
  "theme_color": "#1a73e8",
  "background_color": "#ffffff"
}
```

### 11.3 注册 Service Worker 以支持离线使用

实现可安装性和离线功能需要 Service Worker。安装时缓存关键资源；离线时从缓存响应。

```js
// In your main entry point
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

```js
// sw.js — cache on install, serve from cache when offline
const CACHE = 'v1';
const PRECACHE = ['/', '/index.html', '/app.js', '/app.css'];

self.addEventListener('install', e =>
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)))
);

self.addEventListener('fetch', e =>
  e.respondWith(
    caches.match(e.request).then(hit => hit ?? fetch(e.request))
  )
);
```

### 11.4 满足可安装性标准

要显示浏览器安装提示：应用必须通过 HTTPS 提供服务，必须注册包含 `fetch` 处理程序的 Service Worker，并且必须提供包含 `name`、`icons`、`start_url` 和 `display: standalone`（或 `fullscreen`/`minimal-ui`）的清单。

### 11.5 恰当使用 display 模式

| 值 | 适用场景 |
|-------|----------|
| `standalone` | 应用取代浏览器界面；最常见的选择 |
| `fullscreen` | 需要使用整个屏幕的游戏或媒体应用 |
| `minimal-ui` | 保留最少量的浏览器控件（后退、重新加载） |
| `browser` | 无安装行为；在浏览器标签页中打开 |

---

## 评估检查清单

在构建或审查 Web 界面时使用此检查清单。

### 无障碍
- [ ] 所有图像都有适当的 `alt` 文本
- [ ] 颜色对比度达到 4.5:1（文本）和 3:1（UI 组件）
- [ ] 所有交互元素均可通过键盘访问
- [ ] 焦点指示器清晰可见（对比度为 3:1，轮廓周长至少为 2px）
- [ ] 提供跳过导航链接
- [ ] 表单输入框具有关联的标签
- [ ] 错误消息已与对应的输入框关联
- [ ] 动态内容更新使用 ARIA 实时区域
- [ ] 任何内容每秒闪烁不超过 3 次
- [ ] 页面具有正确的标题层级（h1-h6，不跳级）
- [ ] 正确使用地标元素（main、nav、header、footer）

### 响应式设计
- [ ] 在 320px 宽度下不会出现水平滚动
- [ ] 触控目标至少为 44x44px
- [ ] 包含视口 meta 标签（不使用 user-scalable=no）
- [ ] 布局可在手机、平板电脑和桌面设备上正常工作
- [ ] 在移动设备上无需缩放即可阅读文本

### 表单
- [ ] 所有输入框都有可见标签
- [ ] 为常见字段设置自动填充属性
- [ ] 正确的输入类型能够调出正确的移动端键盘
- [ ] 错误消息清晰且具体
- [ ] 必填字段有明确标识
- [ ] 提交按钮未被禁用

### 性能
- [ ] 首屏以下的图像使用 `loading="lazy"`
- [ ] 图像具有明确的 `width` 和 `height`
- [ ] 关键字体已预加载
- [ ] 对第三方源使用 `preconnect`
- [ ] 大型 JS 包已进行代码拆分

### 动效与主题
- [ ] 遵循 `prefers-reduced-motion` 设置
- [ ] 动画仅使用 `transform` 和 `opacity`
- [ ] 深色模式保持符合要求的对比度
- [ ] 包含 `color-scheme` meta 标签
- [ ] 主题使用 CSS 自定义属性
- [ ] `prefers-contrast: more` 会提高文本和边框的对比度
- [ ] `prefers-contrast: forced` 使用系统颜色关键字

### 国际化
- [ ] 在 `<html>` 上设置 `lang` 属性
- [ ] 使用 CSS 逻辑属性（而非物理属性）
- [ ] 使用 Intl API 格式化日期和数字
- [ ] 图像中未嵌入文本
- [ ] 已在 RTL 模式下测试布局

### 渐进式 Web 应用
- [ ] 从 `<head>` 链接 Web App Manifest，并包含 `name`、`icons`、`start_url` 和 `display`
- [ ] `theme_color` 和 `background_color` 与品牌配色一致
- [ ] 注册 Service Worker，并通过 `fetch` 处理程序提供离线支持
- [ ] 应用通过 HTTPS 提供服务

---

## 常见反模式

| 反模式 | 修复方法 |
|--------------|-----|
| `<div onclick="...">` | 使用 `<button>` |
| 使用 `outline: none` 但不提供替代样式 | 使用带有自定义轮廓的 `:focus-visible` |
| 将 `placeholder` 用作标签 | 添加 `<label>` 元素 |
| `tabindex="5"` | 使用 `tabindex="0"` 或自然顺序 |
| `user-scalable=no` | 将其移除 |
| `font-size: 12px` | 使用 `font-size: 0.75rem` |
| 为 `width`/`height`/`top`/`left` 添加动画 | 为 `transform` 和 `opacity` 添加动画 |
| 禁用提交按钮 | 提交时进行验证并显示错误 |
| 仅使用颜色表示状态 | 添加图标、文本或图案 |
| `margin-left` / `padding-right` | 使用 `margin-inline-start` / `padding-inline-end` |
| `<img>` 没有尺寸 | 添加 `width` 和 `height` 属性 |
| 仅在悬停时显示内容 | 添加 `:focus-within` 和点击处理程序 |