---
name: performance
description: Optimize web performance for faster loading and better user experience. Use when asked to "speed up my site", "optimize performance", "reduce load time", "fix slow loading", "improve page speed", or "performance audit".
license: MIT
metadata:
  author: web-quality-skills
  version: "2.0"
---
# 性能优化

以证据为导向的性能优化：使用真实用户信号确定优先级，并使用浏览器跟踪进行诊断。重点关注加载速度、运行时响应能力和资源交付。

## 工作原理

1. 如果页面可以运行，请阅读[测量工作流](references/MEASUREMENT.md)，并在编辑前建立现场加实验室基线。
2. 优先处理真实用户数据中表现不佳的 Core Web Vitals。使用 DevTools 性能跟踪及其聚焦分析来查找原因。
3. 仅检查和更改与测得的瓶颈相关的代码或资源。
4. 重新运行条件等效的实验室测量，并报告优化前后的数值、条件和不确定性。在积累足够的新用户数据之前，现场验证仍处于待完成状态。

如果不存在可运行的页面，请执行静态检查，但应将发现称为**假设**，而不是测得的性能回退。为每个高影响假设提供可用于验证的命令或浏览器工作流。

优先使用能够记录性能跟踪并提供聚焦分析的浏览器工具。使用 Chrome DevTools MCP 时，请使用 `performance_start_trace` 和 `performance_analyze_insight`；不要通过 `lighthouse_audit` 进行性能分析，因为它涵盖的是 Lighthouse 的非性能类别。

## 初始性能预算

预算必须反映产品的目标设备、网络、页面类型和用户旅程。以下数值是针对典型内容或电商页面的初始约束，而不是通用的通过/不通过标准。如果项目已定义预算，请保留现有预算。

| 资源 | 预算 | 理由 |
|----------|--------|-----------|
| 页面总大小 | < 1.5 MB | 限制目标受限网络下的传输时间和数据成本；使用具有代表性的页面进行校准 |
| JavaScript（压缩后） | < 300 KB | 控制解析和执行成本 |
| CSS（压缩后） | < 100 KB | 限制阻塞渲染的工作 |
| 图片（首屏） | < 500 KB | 保护可能的 LCP 资源 |
| 字体 | < 100 KB | 限制关键字体的传输量 |
| 第三方资源 | < 200 KB | 限制产品控制范围之外的代码 |

## 关键渲染路径

### 服务器响应
* **TTFB < 800ms。** 首字节时间应尽可能短。使用 CDN、缓存和高效的后端。
* **启用压缩。** 对文本资源使用 Gzip 或 Brotli。优先使用 Brotli（体积小 15-20%）。
* **HTTP/2 或 HTTP/3。** 多路复用可减少连接开销。
* **边缘缓存。** 尽可能在 CDN 边缘缓存 HTML。
* **对于测得的文档延迟，请考虑使用 Early Hints (HTTP 103)。** 如果跟踪显示 HTML 生成缓慢且关键子资源稳定，请在同一请求的正常最终响应之前，发送带有 `Link` 标头的临时 `103` 响应。使用 HTTP/2 或更高版本。CDN 可以根据较早的 `200` 响应中的 `Link` 标头合成 `103`，源站或边缘处理程序也可以直接发送该响应。不支持的客户端会继续处理最终响应，但请确认当前浏览器和基础设施的支持情况。仅对已证实属于关键资源的预加载或预连接使用提示：不准确的提示会浪费带宽。Cloudflare 报告称，在一项人为设计的图片密集型测试中，LCP 提升了 20–30%；应将其视为供应商案例研究，而不是预期收益，并测量你自己的结果。请参阅 [MDN 的 103 实现示例](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/103)和 [Cloudflare 的研究](https://blog.cloudflare.com/early-hints-performance/)。

### 资源加载

**预连接到所需源站：**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://cdn.example.com" crossorigin>
```

**预加载关键资源：**

仅预加载那些在跟踪记录中可以观察到延迟发现的资源。每项预加载都会争用带宽，而不必要的高优先级请求可能会延迟 LCP。

```html
<!-- LCP image -->
<link rel="preload" href="/hero.webp" as="image" fetchpriority="high">

<!-- Critical font -->
<link rel="preload" href="/font.woff2" as="font" type="font/woff2" crossorigin>
```

**使用 [Speculation Rules API](https://developer.chrome.com/docs/web-platform/prerender-pages) 预渲染可能的下一次导航：**
```html
<script type="speculationrules">
{
  "prerender": [{
    "where": { "href_matches": "/*" },
    "eagerness": "moderate"
  }]
}
</script>
```
与积极模式相比，`moderate` 会等待更强的意图信号。衡量预测命中率、传输字节数和服务器成本；一次错误的预渲染大致相当于一次未使用的导航。有关权衡以及分析所需的 `prerenderingchange` 门控，请参阅 [core-web-vitals → LCP](../core-web-vitals/SKILL.md#lcp-largest-contentful-paint)。

**延迟加载非关键 CSS：**
```html
<!-- Critical CSS inlined -->
<style>/* Above-fold styles */</style>

<!-- Non-critical CSS -->
<link rel="preload" href="/styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/styles.css"></noscript>
```

### JavaScript 优化

**延迟加载非必要脚本：**
```html
<!-- Parser-blocking (avoid) -->
<script src="/critical.js"></script>

<!-- Deferred (preferred) -->
<script defer src="/app.js"></script>

<!-- Async (for independent scripts) -->
<script async src="/analytics.js"></script>

<!-- Module (deferred by default) -->
<script type="module" src="/app.mjs"></script>
```

**代码拆分模式：**
```javascript
// Route-based splitting
const Dashboard = lazy(() => import('./Dashboard'));

// Component-based splitting
const HeavyChart = lazy(() => import('./HeavyChart'));

// Feature-based splitting
if (user.isPremium) {
  const PremiumFeatures = await import('./PremiumFeatures');
}
```

**Tree shaking 最佳实践：**
```javascript
// ❌ Imports entire library
import _ from 'lodash';
_.debounce(fn, 300);

// ✅ Imports only what's needed
import debounce from 'lodash/debounce';
debounce(fn, 300);
```

## 图像优化

### 格式选择
| 格式 | 使用场景 | 浏览器支持 |
|--------|----------|-----------------|
| AVIF | 照片，压缩率最佳 | 92%+ |
| WebP | 照片，良好的回退格式 | 97%+ |
| PNG | 带透明度的图形 | 全面支持 |
| SVG | 图标、徽标、插图 | 全面支持 |

### 响应式图像
```html
<picture>
  <!-- AVIF for modern browsers -->
  <source 
    type="image/avif"
    srcset="hero-400.avif 400w,
            hero-800.avif 800w,
            hero-1200.avif 1200w"
    sizes="(max-width: 600px) 100vw, 50vw">
  
  <!-- WebP fallback -->
  <source 
    type="image/webp"
    srcset="hero-400.webp 400w,
            hero-800.webp 800w,
            hero-1200.webp 1200w"
    sizes="(max-width: 600px) 100vw, 50vw">
  
  <!-- JPEG fallback -->
  <img 
    src="hero-800.jpg"
    srcset="hero-400.jpg 400w,
            hero-800.jpg 800w,
            hero-1200.jpg 1200w"
    sizes="(max-width: 600px) 100vw, 50vw"
    width="1200" 
    height="600"
    alt="Hero image"
    loading="lazy"
    decoding="async">
</picture>
```

### LCP 图像优先级
```html
<!-- Above-fold LCP image: eager loading, high priority -->
<img 
  src="hero.webp" 
  fetchpriority="high"
  loading="eager"
  decoding="sync"
  alt="Hero">

<!-- Below-fold images: lazy loading -->
<img 
  src="product.webp" 
  loading="lazy"
  decoding="async"
  alt="Product">
```

## 字体优化

### 加载策略
```css
/* System font stack as fallback */
body {
  font-family: 'Custom Font', -apple-system, BlinkMacSystemFont, 
               'Segoe UI', Roboto, sans-serif;
}

/* Prevent invisible text */
@font-face {
  font-family: 'Custom Font';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap; /* or optional for non-critical */
  font-weight: 400;
  font-style: normal;
  unicode-range: U+0000-00FF; /* Subset to Latin */
}
```

### 预加载关键字体
```html
<link rel="preload" href="/fonts/heading.woff2" as="font" type="font/woff2" crossorigin>
```

### 可变字体
```css
/* One file instead of multiple weights */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Variable.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap;
}
```

## 缓存策略

### Cache-Control 标头
```
# HTML (short or no cache)
Cache-Control: no-cache, must-revalidate

# Static assets with hash (immutable)
Cache-Control: public, max-age=31536000, immutable

# Static assets without hash
Cache-Control: public, max-age=86400, stale-while-revalidate=604800

# API responses
Cache-Control: private, max-age=0, must-revalidate
```

### Service Worker 缓存
```javascript
// Cache-first for static assets
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image' ||
      event.request.destination === 'style' ||
      event.request.destination === 'script') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open('static-v1').then((cache) => cache.put(event.request, clone));
          return response;
        });
      })
    );
  }
});
```

## 运行时性能

### 避免布局抖动
```javascript
// ❌ Forces multiple reflows
elements.forEach(el => {
  const height = el.offsetHeight; // Read
  el.style.height = height + 10 + 'px'; // Write
});

// ✅ Batch reads, then batch writes
const heights = elements.map(el => el.offsetHeight); // All reads
elements.forEach((el, i) => {
  el.style.height = heights[i] + 10 + 'px'; // All writes
});
```

### 对高开销操作进行防抖
```javascript
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// Debounce scroll/resize handlers
window.addEventListener('scroll', debounce(handleScroll, 100));
```

### 使用 requestAnimationFrame
```javascript
// ❌ May cause jank
setInterval(animate, 16);

// ✅ Synced with display refresh
function animate() {
  // Animation logic
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

### 虚拟化长列表
```javascript
// For lists > 100 items, render only visible items
// Use libraries like react-window, vue-virtual-scroller, or native CSS:
.virtual-list {
  content-visibility: auto;
  contain-intrinsic-size: 0 50px; /* Estimated item height */
}
```

### 使用 View Transitions 实现流畅导航

[View Transitions API](https://developer.chrome.com/docs/web-platform/view-transitions) 允许浏览器使用单个由 GPU 合成的快照，在两个 DOM 状态之间进行交叉淡化（或自定义动画）——不会重复渲染，不会造成布局抖动，并且该快照不会计入 CLS。

**同文档（SPA 风格）——2026 年基线：**
```javascript
// Wrap the DOM mutation that swaps the view
function navigate(newView) {
  if (!document.startViewTransition) return swapDOM(newView);
  document.startViewTransition(() => swapDOM(newView));
}
```

**跨文档（MPA 风格）——Chromium 稳定支持，其他浏览器逐步增强：**
```css
/* On both source and destination pages */
@view-transition { navigation: auto; }
```
整个集成过程就是这样——现在，同源导航会自动淡入淡出。若要让特定元素参与共享元素过渡（例如将缩略图展开为主视觉图），请为它们设置匹配的 `view-transition-name`：
```css
.product-thumb[data-id="42"], .product-hero { view-transition-name: product-42; }
```

将其与 Speculation Rules（上文）结合，可实现即时且带动画的导航。

## 第三方脚本

### 加载策略
```javascript
// ❌ Blocks main thread
<script src="https://analytics.example.com/script.js"></script>

// ✅ Async loading
<script async src="https://analytics.example.com/script.js"></script>

// ✅ Delay until interaction
<script>
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      const script = document.createElement('script');
      script.src = 'https://widget.example.com/embed.js';
      document.body.appendChild(script);
      observer.disconnect();
    }
  });
  observer.observe(document.querySelector('#widget-container'));
});
</script>
```

### 外观占位模式
```html
<!-- Show static placeholder until interaction -->
<div class="youtube-facade" 
     data-video-id="abc123" 
     onclick="loadYouTube(this)">
  <img src="/thumbnails/abc123.jpg" alt="Video title">
  <button aria-label="Play video">▶</button>
</div>
```

## 测量

只要 URL 可运行，就使用[测量工作流](references/MEASUREMENT.md)。它定义了 Chrome DevTools MCP 路由、CrUX 和备用数据源、可重复的实验室条件，以及紧凑的证据格式。

| 指标 | 类型 | 解读 |
|--------|------|----------------|
| LCP、INP、CLS（p75） | 现场 | 用户结果导向的 Core Web Vitals；用于通过/失败优先级排序 |
| 跟踪记录中的 LCP、CLS | 实验室 | 针对一次导航的可重复诊断值 |
| TBT | 实验室 | 主线程阻塞诊断指标，也是 INP 的粗略代理指标，但不是现场 INP |
| FCP、Speed Index | 实验室 | 加载诊断指标，不属于 Core Web Vitals |

原始的 `PerformanceObserver` 代码片段对于当前浏览器会话很有用，但其本身并不是真实用户数据。当用户需要生产环境遥测数据时，请阅读[一方 RUM 参考文档](references/RUM.md)，并优先使用 `web-vitals`，而不是手动实现指标。

## 参考资料

有关 Core Web Vitals 的特定优化，请参阅 [Core Web Vitals](../core-web-vitals/SKILL.md)。