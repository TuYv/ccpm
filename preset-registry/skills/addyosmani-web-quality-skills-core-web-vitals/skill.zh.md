---
name: core-web-vitals
description: Optimize Core Web Vitals (LCP, INP, CLS) for better page experience and search ranking. Use when asked to "improve Core Web Vitals", "fix LCP", "reduce CLS", "optimize INP", "page experience optimization", or "fix layout shifts".
license: MIT
metadata:
  author: web-quality-skills
  version: "1.0"
---
# Core Web Vitals 优化

针对影响 Google 搜索排名和用户体验的三项 Core Web Vitals 指标进行专项优化。

## 三项指标

| 指标 | 衡量维度 | 良好 | 需要改进 | 较差 |
|--------|----------|------|------------|------|
| **LCP** | 加载性能 | ≤ 2.5s | 2.5s – 4s | > 4s |
| **INP** | 交互性能 | ≤ 200ms | 200ms – 500ms | > 500ms |
| **CLS** | 视觉稳定性 | ≤ 0.1 | 0.1 – 0.25 | > 0.25 |

Google 以**第 75 百分位数**进行衡量——75% 的页面访问必须达到“良好”阈值。

---

## LCP：最大内容绘制

LCP 衡量最大可见内容元素完成渲染的时间。通常是：
- 首屏主图或视频
- 大型文本块
- 背景图像
- `<svg>` 元素

### 常见 LCP 问题

**1. 服务器响应缓慢（TTFB > 800ms）**
```
Fix: CDN, caching, optimized backend, edge rendering
```

**2. 阻塞渲染的资源**
```html
<!-- ❌ Blocks rendering -->
<link rel="stylesheet" href="/all-styles.css">

<!-- ✅ Critical CSS inlined, rest deferred -->
<style>/* Critical above-fold CSS */</style>
<link rel="preload" href="/styles.css" as="style" 
      onload="this.onload=null;this.rel='stylesheet'">
```

**3. 资源加载时间过长**
```html
<!-- ❌ No hints, discovered late -->
<img src="/hero.jpg" alt="Hero">

<!-- ✅ Preloaded with high priority -->
<link rel="preload" href="/hero.webp" as="image" fetchpriority="high">
<img src="/hero.webp" alt="Hero" fetchpriority="high">
```

**4. 客户端渲染延迟**
```javascript
// ❌ Content loads after JavaScript
useEffect(() => {
  fetch('/api/hero-text').then(r => r.json()).then(setHeroText);
}, []);

// ✅ Server-side or static rendering
// Use SSR, SSG, or streaming to send HTML with content
export async function getServerSideProps() {
  const heroText = await fetchHeroText();
  return { props: { heroText } };
}
```

**5. 使用 Speculation Rules API 实现即时导航**

对于大多数网站，用户实际体验到的 LCP 主要取决于*他们接下来导航到的页面*，而不是最初进入的页面。让浏览器在用户悬停时预渲染很可能接下来访问的页面，可以将该 LCP 降至约 0ms。

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

`eagerness` 设置（开销最低 → 最激进）：`conservative`（在指针按下时开始）、`moderate`（悬停约 200ms 后开始）、`eager`（链接进入视口后立即开始）、`immediate`（页面加载时开始）。建议从 `moderate` 开始——它可以覆盖大多数导航，同时避免预渲染用户永远不会访问的页面。

注意事项：
- **带宽/CPU 开销。** 每次预渲染的开销大致相当于一次完整的页面加载。请谨慎限定 `where` 的范围（使用 `href_matches` 模式，并排除退出登录/结账页面），而且除非是小型网站，否则应避免使用 `immediate`。
- **副作用会提前触发。** 分析、广告以及任何在加载时运行的代码都会在预渲染开始时触发，而不是在用户导航时触发。请通过 [`prerenderingchange` 事件](https://developer.chrome.com/docs/web-platform/prerender-pages#detect_when_a_page_is_prerendered_or_used_for_a_full_navigation)或 `document.prerendering` 控制副作用的触发。
- **仅限 Chromium。** Safari 和 Firefox 会忽略该脚本——它属于渐进增强，绝不会导致体验退化。

### LCP 优化检查清单

```markdown
- [ ] TTFB < 800ms (use CDN, edge caching)
- [ ] LCP image preloaded with fetchpriority="high"
- [ ] LCP image optimized (WebP/AVIF, correct size)
- [ ] Critical CSS inlined (< 14KB)
- [ ] No render-blocking JavaScript in <head>
- [ ] Fonts don't block text rendering (font-display: swap)
- [ ] LCP element in initial HTML (not JS-rendered)
- [ ] Speculation Rules added for likely-next navigations (moderate eagerness)
```

### LCP 元素识别
```javascript
// Find your LCP element
new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const lastEntry = entries[entries.length - 1];
  console.log('LCP element:', lastEntry.element);
  console.log('LCP time:', lastEntry.startTime);
}).observe({ type: 'largest-contentful-paint', buffered: true });
```

---

## INP：交互到下一次绘制

INP 衡量一次页面访问期间所有交互（点击、轻触、按键）的响应速度。它报告最差的交互（对于高流量页面，取第 98 百分位数）。

### INP 构成

总 INP = **输入延迟** + **处理时间** + **呈现延迟**

| 阶段 | 目标 | 优化方式 |
|-------|--------|--------------|
| 输入延迟 | < 50ms | 减少主线程阻塞 |
| 处理 | < 100ms | 优化事件处理器 |
| 呈现 | < 50ms | 尽量减少渲染工作 |

### 常见 INP 问题

**1. 长任务阻塞主线程**
```javascript
// ❌ Long synchronous task
function processLargeArray(items) {
  items.forEach(item => expensiveOperation(item));
}

// ✅ Break into chunks and yield to the scheduler. scheduler.yield() is the
//    recommended modern API — its continuation is queued at a boosted
//    priority so the rest of your work resumes ahead of unrelated tasks,
//    while still letting the browser handle pending input first.
async function processLargeArray(items) {
  const CHUNK_SIZE = 100;
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    items.slice(i, i + CHUNK_SIZE).forEach(expensiveOperation);

    if ('scheduler' in window && 'yield' in scheduler) {
      await scheduler.yield();
    } else {
      // Fallback for browsers without scheduler.yield (Safari, older Firefox).
      // setTimeout(0) yields but loses priority — your continuation may run
      // after unrelated tasks the browser picked up in between.
      await new Promise(r => setTimeout(r, 0));
    }
  }
}
```

**2. 繁重的事件处理器**
```javascript
// ❌ All work in handler
button.addEventListener('click', () => {
  // Heavy computation
  const result = calculateComplexThing();
  // DOM updates
  updateUI(result);
  // Analytics
  trackEvent('click');
});

// ✅ Prioritize visual feedback, then yield before doing the heavy work
button.addEventListener('click', async () => {
  // 1. Immediate visual feedback (cheap DOM update)
  button.classList.add('loading');

  // 2. Yield so the browser can paint the loading state before we block
  if ('scheduler' in window && 'yield' in scheduler) {
    await scheduler.yield();
  }

  // 3. Now do the heavy work — the user already saw the click register
  const result = calculateComplexThing();
  updateUI(result);

  // 4. Lowest-priority work last, when the main thread is idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => trackEvent('click'));
  } else {
    setTimeout(() => trackEvent('click'), 0);
  }
});
```

**3. 第三方脚本**
```javascript
// ❌ Eagerly loaded, blocks interactions
<script src="https://heavy-widget.com/widget.js"></script>

// ✅ Lazy loaded on interaction or visibility
const loadWidget = () => {
  import('https://heavy-widget.com/widget.js')
    .then(widget => widget.init());
};
button.addEventListener('click', loadWidget, { once: true });
```

**4. 过度重新渲染（React/Vue）**
```javascript
// ❌ Re-renders entire tree
function App() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <Counter count={count} />
      <ExpensiveComponent /> {/* Re-renders on every count change */}
    </div>
  );
}

// ✅ Memoized expensive components
const MemoizedExpensive = React.memo(ExpensiveComponent);

function App() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <Counter count={count} />
      <MemoizedExpensive />
    </div>
  );
}
```

### INP 优化检查清单

```markdown
- [ ] No tasks > 50ms on main thread
- [ ] Event handlers complete quickly (< 100ms)
- [ ] Visual feedback provided immediately
- [ ] Heavy work deferred with requestIdleCallback
- [ ] Third-party scripts don't block interactions
- [ ] Debounced input handlers where appropriate
- [ ] Web Workers for CPU-intensive operations
```

### INP 调试
```javascript
// Identify slow interactions. durationThreshold: 40 matches what the
// web-vitals library uses — 16 (one frame) fires on nearly every interaction
// and drowns the console; 40 surfaces interactions that are starting to feel
// sluggish without spamming.
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 200) {
      console.warn('Slow interaction:', {
        type: entry.name,
        duration: entry.duration,
        processingStart: entry.processingStart,
        processingEnd: entry.processingEnd,
        target: entry.target
      });
    }
  }
}).observe({ type: 'event', buffered: true, durationThreshold: 40 });
```

要针对真实用户进行现场调试，建议使用 [web-vitals 库](https://github.com/GoogleChrome/web-vitals)的 `web-vitals/attribution` 构建版本——该构建版本中的 `onINP()` 会附加 `LoAF`（长动画帧）明细，指出耗时最长的脚本，以及耗尽时间预算的输入/处理/呈现阶段。

---

## CLS：累积布局偏移

CLS 衡量意外的布局偏移。当可见元素在没有用户交互的情况下于帧之间发生位置变化时，就会出现偏移。

**CLS 公式：** `impact fraction × distance fraction`

### CLS 的常见原因

**1. 未指定尺寸的图像**
```html
<!-- ❌ Causes layout shift when loaded -->
<img src="photo.jpg" alt="Photo">

<!-- ✅ Space reserved -->
<img src="photo.jpg" alt="Photo" width="800" height="600">

<!-- ✅ Or use aspect-ratio -->
<img src="photo.jpg" alt="Photo" style="aspect-ratio: 4/3; width: 100%;">
```

**2. 广告、嵌入内容和 iframe**
```html
<!-- ❌ Unknown size until loaded -->
<iframe src="https://ad-network.com/ad"></iframe>

<!-- ✅ Reserve space with min-height -->
<div style="min-height: 250px;">
  <iframe src="https://ad-network.com/ad" height="250"></iframe>
</div>

<!-- ✅ Or use aspect-ratio container -->
<div style="aspect-ratio: 16/9;">
  <iframe src="https://youtube.com/embed/..." 
          style="width: 100%; height: 100%;"></iframe>
</div>
```

**3. 动态注入的内容**
```javascript
// ❌ Inserts content above viewport
notifications.prepend(newNotification);

// ✅ Insert below viewport or use transform
const insertBelow = viewport.bottom < newNotification.top;
if (insertBelow) {
  notifications.prepend(newNotification);
} else {
  // Animate in without shifting
  newNotification.style.transform = 'translateY(-100%)';
  notifications.prepend(newNotification);
  requestAnimationFrame(() => {
    newNotification.style.transform = '';
  });
}
```

**4. Web 字体导致 FOUT**
```css
/* ❌ Font swap shifts text */
@font-face {
  font-family: 'Custom';
  src: url('custom.woff2') format('woff2');
}

/* ✅ Optional font (no shift if slow) */
@font-face {
  font-family: 'Custom';
  src: url('custom.woff2') format('woff2');
  font-display: optional;
}

/* ✅ Or match fallback metrics */
@font-face {
  font-family: 'Custom';
  src: url('custom.woff2') format('woff2');
  font-display: swap;
  size-adjust: 105%; /* Match fallback size */
  ascent-override: 95%;
  descent-override: 20%;
}
```

**5. 触发布局变化的动画**
```css
/* ❌ Animates layout properties */
.animate {
  transition: height 0.3s, width 0.3s;
}

/* ✅ Use transform instead */
.animate {
  transition: transform 0.3s;
}
.animate.expanded {
  transform: scale(1.2);
}
```

### CLS 优化检查清单

```markdown
- [ ] All images have width/height or aspect-ratio
- [ ] All videos/embeds have reserved space
- [ ] Ads have min-height containers
- [ ] Fonts use font-display: optional or matched metrics
- [ ] Dynamic content inserted below viewport
- [ ] Animations use transform/opacity only
- [ ] No content injected above existing content
```

### CLS 调试
```javascript
// Track layout shifts
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      console.log('Layout shift:', entry.value);
      entry.sources?.forEach(source => {
        console.log('  Shifted element:', source.node);
        console.log('  Previous rect:', source.previousRect);
        console.log('  Current rect:', source.currentRect);
      });
    }
  }
}).observe({ type: 'layout-shift', buffered: true });
```

---

## 测量工具

### 实验室测试
- **Chrome DevTools** → Performance 面板、Lighthouse
- **WebPageTest** → 详细的瀑布图、胶片视图
- **Lighthouse CLI** → `npx lighthouse <url>`

### 现场数据（真实用户）
- **Chrome User Experience Report (CrUX)** → BigQuery 或 API
- **Search Console** → Core Web Vitals 报告
- **web-vitals library** → 发送到你的分析系统

```javascript
import {onLCP, onINP, onCLS} from 'web-vitals';

function sendToAnalytics({name, value, rating}) {
  gtag('event', name, {
    event_category: 'Web Vitals',
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    event_label: rating
  });
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
```

---

## 框架快速修复方案

### Next.js
```jsx
// LCP: Use next/image with priority
import Image from 'next/image';
<Image src="/hero.jpg" priority fill alt="Hero" />

// INP: Use dynamic imports
const HeavyComponent = dynamic(() => import('./Heavy'), { ssr: false });

// CLS: Image component handles dimensions automatically
```

### React
```jsx
// LCP: Preload in head
<link rel="preload" href="/hero.jpg" as="image" fetchpriority="high" />

// INP: Memoize and useTransition
const [isPending, startTransition] = useTransition();
startTransition(() => setExpensiveState(newValue));

// CLS: Always specify dimensions in img tags
```

### Vue/Nuxt
```vue
<!-- LCP: Use nuxt/image with preload -->
<NuxtImg src="/hero.jpg" preload loading="eager" />

<!-- INP: Use async components -->
<component :is="() => import('./Heavy.vue')" />

<!-- CLS: Use aspect-ratio CSS -->
<img :style="{ aspectRatio: '16/9' }" />
```

## 参考资料

- [web.dev LCP](https://web.dev/articles/lcp)
- [web.dev INP](https://web.dev/articles/inp)
- [web.dev CLS](https://web.dev/articles/cls)
- [性能技能](../performance/SKILL.md)