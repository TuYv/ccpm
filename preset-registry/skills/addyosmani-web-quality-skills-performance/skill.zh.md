---
name: performance
description: Optimize web performance for faster loading and better user experience. Use when asked to "speed up my site", "optimize performance", "reduce load time", "fix slow loading", "improve page speed", or "performance audit".
license: MIT
metadata:
  author: web-quality-skills
  version: "1.0"
---
# 性能优化

基于 Lighthouse 性能审计的深度性能优化。重点关注加载速度、运行时效率和资源优化。

## 工作原理

1. 识别代码和资源中的性能瓶颈
2. 按照对 Web 核心指标的影响确定优先级
3. 提供包含代码示例的具体优化方案
4. 使用优化前后的指标衡量改进效果

## 性能预算

| 资源 | 预算 | 理由 |
|----------|--------|-----------|
| 页面总大小 | < 1.5 MB | 通过 3G 加载约需 4 秒 |
| JavaScript（压缩后） | < 300 KB | 解析和执行时间 |
| CSS（压缩后） | < 100 KB | 阻塞渲染 |
| 图片（首屏） | < 500 KB | 对 LCP 的影响 |
| 字体 | < 100 KB | 防止 FOIT/FOUT |
| 第三方资源 | < 200 KB | 不可控的延迟 |

## 关键渲染路径

### 服务器响应
* **TTFB < 800ms。** 首字节时间应当尽可能短。使用 CDN、缓存和高效的后端。
* **启用压缩。** 对文本资源使用 Gzip 或 Brotli。首选 Brotli（体积小 15-20%）。
* **HTTP/2 或 HTTP/3。** 多路复用可减少连接开销。
* **边缘缓存。** 尽可能在 CDN 边缘节点缓存 HTML。
* **为响应缓慢的源站发送 Early Hints (HTTP 103)。** 当源站需要数百毫秒才能生成最终响应时，返回包含 `Link: </hero.webp>; rel=preload; as=image`（以及关键 CSS/字体的类似声明）的 `103 Early Hints`，以便浏览器在收到 `200 OK` 之前开始获取资源。Cloudflare 报告称，在图片密集型页面上，[LCP 可提升 20–30%](https://blog.cloudflare.com/early-hints-performance/)。此功能需要 HTTP/2+，并受基于 Chromium 的浏览器支持；其他浏览器会忽略 103 并继续等待 200，因此可以安全启用。CDN（Cloudflare、Fastly、Akamai）可以根据先前的响应自动生成 103；如果使用自己的源站，则应从发送 200 的同一处理程序中发送这些响应。

### 资源加载

**预连接到必需的源站：**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://cdn.example.com" crossorigin>
```

**预加载关键资源：**
```html
<!-- LCP image -->
<link rel="preload" href="/hero.webp" as="image" fetchpriority="high">

<!-- Critical font -->
<link rel="preload" href="/font.woff2" as="font" type="font/woff2" crossorigin>
```

**预渲染很可能接下来访问的页面**，使用 [Speculation Rules API](https://developer.chrome.com/docs/web-platform/prerender-pages)：
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
`moderate` 会在悬停约 200ms 后触发——通常与用户意图相关，很少造成浪费。有关积极程度权衡以及分析功能所需的 `prerenderingchange` 门控的完整讨论，请参阅 [core-web-vitals → LCP](../core-web-vitals/SKILL.md#lcp-largest-contentful-paint)。

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
| AVIF | 照片，压缩效果最佳 | 92%+ |
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

### Service worker 缓存
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

### 对长列表进行虚拟化
```javascript
// For lists > 100 items, render only visible items
// Use libraries like react-window, vue-virtual-scroller, or native CSS:
.virtual-list {
  content-visibility: auto;
  contain-intrinsic-size: 0 50px; /* Estimated item height */
}
```

### 使用 View Transitions 实现流畅导航

[View Transitions API](https://developer.chrome.com/docs/web-platform/view-transitions) 允许浏览器使用单个由 GPU 合成的快照，在两个 DOM 状态之间进行交叉淡化（或自定义动画）——无需重复渲染，不会发生布局抖动，并且该快照不会计入 CLS。

**同文档（SPA 风格）——Baseline 2026：**
```javascript
// Wrap the DOM mutation that swaps the view
function navigate(newView) {
  if (!document.startViewTransition) return swapDOM(newView);
  document.startViewTransition(() => swapDOM(newView));
}
```

**跨文档（MPA 风格）——Chromium 稳定版支持，其他浏览器可采用渐进增强：**
```css
/* On both source and destination pages */
@view-transition { navigation: auto; }
```
这就是全部集成步骤——现在，同源导航会自动淡入淡出。若要让特定元素参与共享元素过渡（例如，将缩略图展开为主视觉图），请为它们设置匹配的 `view-transition-name`：
```css
.product-thumb[data-id="42"], .product-hero { view-transition-name: product-42; }
```

将其与上文的 Speculation Rules 配合使用，实现即时且带动画效果的导航。

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

### 门面模式
```html
<!-- Show static placeholder until interaction -->
<div class="youtube-facade" 
     data-video-id="abc123" 
     onclick="loadYouTube(this)">
  <img src="/thumbnails/abc123.jpg" alt="Video title">
  <button aria-label="Play video">▶</button>
</div>
```

## 衡量

### 关键指标
| 指标 | 目标 | 工具 |
|--------|--------|------|
| LCP | < 2.5s | Lighthouse, CrUX |
| FCP | < 1.8s | Lighthouse |
| Speed Index | < 3.4s | Lighthouse |
| TBT | < 200ms | Lighthouse |
| TTI | < 3.8s | Lighthouse |

### 测试命令
```bash
# Lighthouse CLI
npx lighthouse https://example.com --output html --output-path report.html

# Web Vitals library
import {onLCP, onINP, onCLS} from 'web-vitals';
onLCP(console.log);
onINP(console.log);
onCLS(console.log);
```

## 参考资料

有关 Core Web Vitals 的具体优化，请参阅 [Core Web Vitals](../core-web-vitals/SKILL.md)。