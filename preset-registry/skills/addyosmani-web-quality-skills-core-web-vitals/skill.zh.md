---
name: core-web-vitals
description: Optimize Core Web Vitals (LCP, INP, CLS) for better page experience using field and lab evidence. Use when asked to "improve Core Web Vitals", "fix LCP", "reduce CLS", "optimize INP", "page experience optimization", or "fix layout shifts".
license: MIT
metadata:
  author: web-quality-skills
  version: "2.0"
---
# Core Web Vitals 优化

针对三项 Core Web Vitals 进行优化，使用现场数据识别对用户的影响，并使用浏览器跟踪诊断原因。

## 优化前先测量

当有可运行的 URL 时，请阅读[性能测量工作流](../performance/references/MEASUREMENT.md)。优先采用以下顺序：

1. 检查页面级 CrUX p75 数据；当页面数据不可用时，使用来源级数据作为回退，并明确标注。
2. 在说明的条件下记录浏览器性能跟踪。使用 Chrome DevTools MCP 时，跟踪摘要可以同时包含 CrUX 数据和观测到的实验室指标。
3. 仅分析与不达标指标相关的洞察，然后检查涉及的代码和资源。
4. 修复后，重新运行条件等效的实验室测量。不要声称现场指标会立即改善；CrUX 和第一方 RUM 需要新的用户访问数据。

如果只有源代码，请识别可能的原因，但在没有运行时证据的情况下，不要声称 LCP、INP 或 CLS 不达标。

## 三项指标

| 指标 | 衡量内容 | 良好 | 需要改进 | 较差 |
|--------|----------|------|------------|------|
| **LCP** | 加载性能 | ≤ 2.5s | 2.5s – 4s | > 4s |
| **INP** | 交互性 | ≤ 200ms | 200ms – 500ms | > 500ms |
| **CLS** | 视觉稳定性 | ≤ 0.1 | 0.1 – 0.25 | > 0.25 |

Google 使用**第 75 百分位数**进行衡量——75% 的页面访问必须达到“良好”阈值。

---

## LCP：最大内容绘制

LCP 衡量最大可见内容元素完成渲染的时间。该元素通常是：
- 首屏主视觉图片或视频
- 大型文本块
- 背景图片
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
<!-- ❌ LCP image is discovered only after a stylesheet loads -->
<div class="hero"></div>

<!-- ✅ Discoverable in initial HTML and prioritized -->
<link rel="preload" href="/hero.webp" as="image" fetchpriority="high">
<img src="/hero.webp" alt="Hero" fetchpriority="high">
```

优先使用可被发现的 `<img>`，并设置 `fetchpriority="high"`。仅当跟踪显示该资源原本会被较晚发现时，才添加预加载；重复或推测性的预加载可能会争夺带宽。

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

对于具有可预测同源访问路径的网站，预渲染用户可能访问的下一个页面，可以显著加快后续成功导航的速度。应将其视为一种经过度量的导航优化手段，而不是修复当前页面 LCP 问题的替代方案。

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

当前 Chrome 的行为已经足够明确，可用于指导选择：

| `eagerness` | 触发条件 |
|-------------|---------|
| `conservative` | 指针或触摸按下 |
| `moderate` | 桌面端：悬停 200ms，或更早发生指针按下；移动端：视口启发式规则 |
| `eager` | Chrome 143+：桌面端悬停 10ms；移动端锚点进入视口 50ms 后 |
| `immediate` | 规则一经发现便立即触发 |

应从保守策略开始，并在扩展规则之前，度量预测命中率、传输字节数、服务器负载和导航性能提升。在硬编码对时序敏感的行为之前，请重新查阅 [Chrome 持续维护的 eagerness 文档](https://developer.chrome.com/docs/web-platform/prerender-pages#eagerness)。

注意事项：
- **带宽/CPU 成本。** 每次预渲染大致相当于一次完整的页面加载。请谨慎限定 `where` 的范围（使用 `href_matches` 模式，并排除注销/结账页面），且除小型网站外应避免使用 `immediate`。
- **副作用会提前触发。** 分析、广告以及任何在加载时运行的代码，都会在预渲染开始时触发，而不是在用户导航时触发。请根据 [`prerenderingchange` event](https://developer.chrome.com/docs/web-platform/prerender-pages#detect_when_a_page_is_prerendered_or_used_for_a_full_navigation) 或 `document.prerendering` 对副作用进行门控。
- **仅限 Chromium。** Safari 和 Firefox 会忽略该脚本——这是一种渐进增强，绝不会造成体验倒退。

### LCP 优化检查清单

```markdown
- [ ] TTFB < 800ms (use CDN, edge caching)
- [ ] LCP resource is discoverable in initial HTML and prioritized; preload only if the trace shows late discovery
- [ ] LCP image optimized (WebP/AVIF, correct size)
- [ ] Critical CSS inlined (< 14KB)
- [ ] No render-blocking JavaScript in <head>
- [ ] Fonts don't block text rendering (font-display: swap)
- [ ] LCP element in initial HTML (not JS-rendered)
- [ ] Speculation Rules added for likely-next navigations (moderate eagerness)
```

### LCP 元素识别

此代码片段用于诊断当前页面会话。它不是现场数据。

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

INP 衡量一次访问期间点击、轻触和按键操作的响应能力。应分别诊断其输入延迟、处理时间和呈现延迟；一次缓慢的交互可能涉及处理程序运行前的主线程争用、代价高昂的应用程序工作，或其后的渲染延迟。

当现场 INP 表现不佳或跟踪识别出缓慢交互时，请阅读 [INP 参考文档](references/INP.md)，了解跟踪解读、让出执行权的模式、第三方与渲染原因、单会话观察器以及第一方归因。

---

## CLS：累积布局偏移

CLS 衡量一次页面访问期间发生的意外布局偏移。使用现场归因或跟踪来识别发生偏移的节点和触发因素；不要假定可见的受影响元素就是偏移原因。

当现场 CLS 表现不佳或跟踪报告了偏移时，请阅读 [CLS 参考文档](references/CLS.md)，了解空间预留模式、动态内容、字体和动画修复方法、调试观察器以及验证清单。

---

## 测量来源

| 来源 | 用途 |
|--------|-----|
| 浏览器性能跟踪（Chrome DevTools MCP：`performance_start_trace`） | 观察一次加载或交互并诊断特定洞察；在可用时使用其中包含的 CrUX 上下文 |
| CrUX 或 Search Console | 根据 p75 的真实用户聚合结果确定优先级 |
| Lighthouse CLI 或 PageSpeed Insights | DevTools 工具不可用时的受控实验室环境备用方案 |
| 第一方 RUM | 按路由、设备、版本和归因细分当前生产环境体验 |
| 原始 `PerformanceObserver` | 在调试期间检查单个页面会话 |

不要通过 Chrome DevTools MCP 的 `lighthouse_audit` 进行性能分析；该功能有意仅涵盖 Lighthouse 的非性能类别。不要将单个实验室环境数值直接与现场 p75 进行比较，仿佛它们是等价样本。

添加或审查生产环境数据采集时，请阅读 [第一方 RUM 参考文档](../performance/references/RUM.md)。优先使用 `web-vitals` 库，因为原始浏览器 API 本身并未实现每项 Core Web Vital 的所有生命周期和报告规则。

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

- [详细的 LCP 优化](references/LCP.md) — 当 LCP 跟踪指向发现延迟、加载延迟或渲染延迟时阅读
- [详细的 INP 优化](references/INP.md) — 当跟踪或现场归因识别出缓慢交互时阅读
- [详细的 CLS 优化](references/CLS.md) — 当跟踪或现场归因识别出意外偏移时阅读
- [web.dev LCP](https://web.dev/articles/lcp)
- [web.dev INP](https://web.dev/articles/inp)
- [web.dev CLS](https://web.dev/articles/cls)
- [性能技能](../performance/SKILL.md)